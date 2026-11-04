#!/usr/bin/env python3
"""Holy Moly! automated tests.

Usage:
  python3 tests/run.py                 # everything (about 2 minutes)
  python3 tests/run.py --quick         # skip the slow passes (every microgame, every stage)
  python3 tests/run.py --only cards    # only tests whose names contain "cards" (comma-separate several)
  python3 tests/run.py --out DIR       # also save screenshots of every screen to DIR
  python3 tests/run.py --list          # list the tests

It builds the page fresh into a temporary folder (the normal page, and the Claude-artifact variant wrapped in the
skeleton the artifact host adds), then drives it in headless Chromium with Python Playwright. Pages open with
?test=1, where requestAnimationFrame never runs and the tests move time forward themselves; Math.random is seeded,
so every run plays the same microgames in the same order. Prints PASS/FAIL per test with reasons; exits 1 on failure.

Needs: pip install playwright pillow && python3 -m playwright install chromium; node (for tests/unit).
"""
import argparse, json, os, pathlib, re, shutil, subprocess, sys, tempfile, time, traceback

ROOT = pathlib.Path(__file__).resolve().parent.parent
TESTS = ROOT / 'tests'
HELPERS = TESTS / 'page_helpers.js'
SAVE_CASES = TESTS / 'unit' / 'save_cases.js'
HINTS = {'tap', 'mash', 'swipe', 'drag', 'hold', 'still'}
CARD_KINDS_HINT = 'Story | Poem | Parable | Song | Vision | Letter (or a phrase like "Ancient story")'

# Known bugs in the game that a test has found but that are not fixed yet. A failure whose message contains one of
# these keys is reported as XFAIL (expected failure) with the description and does not fail the run. When the bug is
# fixed the check passes and the runner prints a note to delete the entry. Keep this list empty when you can.
KNOWN_BUGS = {
    # 'substring of the failure message': 'what is wrong and how to reproduce it',
}

TESTS_REGISTRY = []
def test(slow=False):
    def deco(fn):
        TESTS_REGISTRY.append((fn.__name__, fn, slow)); return fn
    return deco


# ---------------------------------------------------------------- page helpers
class Env:
    def __init__(self, browser, pages, quick, out):
        self.browser, self.pages, self.quick, self.out = browser, pages, quick, out
        self.helpers = HELPERS.read_text()
        self._contexts = []

    def context(self, viewport=(360, 640), init=()):
        ctx = self.browser.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, device_scale_factor=1)
        ctx.add_init_script(self.helpers)
        for s in init: ctx.add_init_script(s)
        self._contexts.append(ctx)
        return ctx

    def open(self, variant='plain', test=True, viewport=(360, 640), ctx=None, init=(), query=''):
        """Open the built page and wait until it has booted. Returns (page, errors list)."""
        ctx = ctx or self.context(viewport, init)
        pg = ctx.new_page()
        errs = watch_errors(pg)
        q = '&'.join(x for x in [('test=1' if test else ''), query] if x)
        pg.goto(self.pages[variant].as_uri() + ('?' + q if q else ''))
        wait_booted(pg)
        return pg, errs

    def close(self):
        for c in self._contexts:
            try: c.close()
            except Exception: pass
        self._contexts = []


def watch_errors(pg):
    errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console.error: ' + m.text) if m.type == 'error' else None)
    return errs


def wait_booted(pg):
    pg.wait_for_function('window.HM && window.__hm && window.__hm.booted && document.fonts.status === "loaded"', timeout=20000)


class GameCrashed(Exception): pass


def drive(pg, until='over', max_frames=60 * 600, stop_at=None):
    ev = pg.evaluate('o => __hm.drive(o)', {'until': until, 'maxFrames': max_frames, 'stopAt': stop_at})
    if ev and ev[-1]['phase'] == 'error':
        raise GameCrashed(f'the game threw while running (game {ev[-1]["i"]}, loaves {ev[-1]["loaves"]}): {ev[-1]["error"]}')
    return ev


def texts(pg, js='render()'):
    """Run js (default: one render) and return every text it drew, with boxes in game coordinates for the main canvas."""
    return pg.evaluate('js => __hm.capture(() => (0, eval)(js))', js)


def not_blank(pg):
    """Count distinct colours in a 36x64 sample of the game canvas: a blank or one-colour screen has very few."""
    return pg.evaluate('''() => { const c = document.createElement('canvas'); c.width = 36; c.height = 64; const x = c.getContext('2d');
      x.drawImage(document.getElementById('game'), 0, 0, 36, 64); const d = x.getImageData(0, 0, 36, 64).data, s = new Set();
      for (let i = 0; i < d.length; i += 4) s.add((d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3)); return s.size; }''')


def src_text(*globs):
    out = {}
    for g in globs:
        for f in sorted(ROOT.glob(g)): out[f.relative_to(ROOT).as_posix()] = f.read_text(encoding='utf-8')
    return out


# ---------------------------------------------------------------- 1. every screen renders without errors
@test()
def no_errors_on_screens(env):
    fails = []
    for variant in ('plain', 'artifact'):
        pg, errs = env.open(variant)
        shots = []
        def screen(name):
            n = not_blank(pg)
            if n < 12: fails.append(f'[{variant}] screen "{name}" looks blank ({n} colours)')
            for e in errs: fails.append(f'[{variant}] {name}: {e}')
            errs.clear()
            if env.out and variant == 'plain':
                f = env.out / f'screen_{len(shots):02d}_{name}.png'; pg.screenshot(path=str(f)); shots.append(f)
        pg.evaluate('HM.step(60)'); screen('title')
        pg.evaluate("HM.goto('stages'); HM.step(30)"); screen('stages')
        pg.evaluate("__hm.seed(9); window.HM_AUTO = false; HM.goto('run', 'ark'); HM.step(40)"); screen('intro')
        ev = drive(pg, 'between'); pg.evaluate('HM.step(20)'); screen('between')
        drive(pg, 'play'); pg.evaluate('HM.step(30)'); screen('play')
        ev = drive(pg, 'result'); pg.evaluate('HM.step(15)'); screen('result')
        drive(pg, 'between'); pg.evaluate('HM.step(10)'); screen('lost loaf' if ev and ev[-1].get('result') == 'fail' else 'between 2')
        pg.evaluate('window.HM_AUTO = true')   # win the next games to reach the speed-up, then stop playing to lose every loaf
        ev = drive(pg, 'speedup')
        pg.evaluate('window.HM_AUTO = false')
        if ev and ev[-1]['phase'] == 'speedup': pg.evaluate('HM.step(20)'); screen('speedup')
        else: fails.append(f'[{variant}] never reached the speed-up screen (phases: {[e["phase"] for e in ev][-6:]})')
        ev = drive(pg, 'grace')
        if ev and ev[-1]['phase'] == 'grace': pg.evaluate('HM.step(130)'); screen('grace')
        else: fails.append(f'[{variant}] never reached the grace screen')
        ev = drive(pg, 'over')
        if ev and ev[-1]['phase'] == 'over': pg.evaluate('HM.step(60)'); screen('results')
        else: fails.append(f'[{variant}] never reached the results screen')
        pg.evaluate("HM.goto('run', 'remix'); HM.step(40)"); screen('remix intro')
        pg.evaluate("SAVE.d.cards = Object.fromEntries(MG.list.slice(0, 7).map(d => [d.id, 1])); run = null; HM.goto('cards'); HM.step(10)"); screen('cards grid')
        pg.evaluate("ui.cardScroll = 300; HM.step(5)"); screen('cards grid scrolled')
        pg.evaluate("ui.cardScroll = 0; openCards(storyOrder().filter(d => SAVE.d.cards[d.id]), 1, 'browse'); HM.step(10)"); screen('card viewer')
        pg.evaluate("CV.scroll = 1e6; HM.step(5)"); screen('card viewer scrolled')
        pg.evaluate("openCards(MG.list.slice(0, 3), 0, 'reward'); HM.step(10)"); screen('reward cards')
        pg.evaluate("CV.list = null; HM.goto('title'); HM.step(5)")
        for e in errs: fails.append(f'[{variant}] {e}')
        pg.close()
    return fails


# ---------------------------------------------------------------- 2. audio really starts after the first tap
@test()
def audio_starts_after_tap(env):
    fails = []
    pg, errs = env.open('plain', test=False)  # the real game loop and the real autoplay policy
    st = pg.evaluate('AUD._state()')
    if st['ctx'] not in ('none', 'suspended') or st['unlocked']: fails.append(f'audio was running before any tap: {st}')
    if pg.evaluate("typeof AUD") != 'object': fails.append('AUD is not reachable as a global from the engine scope')
    pg.mouse.click(180, 520); pg.wait_for_timeout(250); pg.mouse.click(180, 520)
    try: pg.wait_for_function("AUD._state().ctx === 'running' && AUD._state().unlocked", timeout=5000)
    except Exception: fails.append(f'audio did not start after two taps on the title screen: {pg.evaluate("AUD._state()")}')
    try: pg.wait_for_function("AUD._state().track === 'title'", timeout=6000)
    except Exception: fails.append(f'title music did not start after the taps: {pg.evaluate("AUD._state()")}')
    # every audio call the engine makes goes through A.call and must reach AUD (bug: engine checked window.AUD, but audio.js declares const AUD)
    reach = pg.evaluate('''() => {
      const names = ['sfx', 'jingle', 'music', 'beat', 'setTempo', 'babble', 'mute'], hits = {}, orig = {};
      for (const n of names) { orig[n] = AUD[n]; hits[n] = 0; AUD[n] = function () { hits[n]++; return orig[n].apply(this, arguments); }; }
      const n0 = window.__audioNodes; let err = null;
      try { A.sfx('pop'); A.jingle('win', 1); A.music('title'); A.beat(true, { bpm: 110, mood: 'bright' }); A.tempo(120); A.beat(false); A.babble('Hello there', 'woman'); A.call('mute', false); } catch (e) { err = String(e); }
      for (const n of names) AUD[n] = orig[n];
      return { hits, err, nodes: window.__audioNodes - n0 }; }''')
    if reach['err']: fails.append('calling the audio wrapper threw: ' + reach['err'])
    for n, k in reach['hits'].items():
        if k < 1: fails.append(f'A.{n} never reached AUD.{n} (the game would be silent)')
    if reach['nodes'] < 1: fails.append('A.sfx/A.jingle created no Web Audio nodes after unlock')
    # start a stage the way a player does and check a groove plays during the microgame
    pg.mouse.click(180, 300)
    try: pg.wait_for_function("scene === 'stages'", timeout=3000)
    except Exception: fails.append('tapping Play did not open the stage picker')
    pg.mouse.click(96, 108)  # first tile: In the Beginning
    try:
        pg.wait_for_function("run && run.phase === 'play'", timeout=15000)
        pg.wait_for_timeout(150)
        st = pg.evaluate('({ a: AUD._state(), mood: run.g.def.mood || run.stage.mood, n: window.__audioNodes })')
        g = st['a']['groove']
        if not g: fails.append(f'no groove is scheduled during play: {st["a"]}')
        elif g['mood'] != st['mood']: fails.append(f'groove mood {g["mood"]} != microgame mood {st["mood"]}')
        pg.wait_for_timeout(500)
        if pg.evaluate('window.__audioNodes') - st['n'] < 3: fails.append('the groove scheduled no notes in half a second of play')
    except Exception: fails.append(f'the run never reached a microgame in real time: {pg.evaluate("HM.state()")}')
    # static: every sound, jingle, music track and mood the code asks for exists in audio.js (an unknown name is silently ignored)
    known = pg.evaluate('({ sfx: AUD.sfxNames, jingles: AUD.jingleNames, moods: AUD.moods, music: Object.keys(MUSIC_TRACKS), stageMoods: STAGES.map(s => s.mood), mgMoods: MG.list.map(d => [d.id, d.mood || null]) })')
    srcs = src_text('src/engine.js', 'src/title.js', 'src/games/*.js')
    for f, s in srcs.items():
        for n in sorted(set(re.findall(r"""sfx\(\s*['"](\w+)['"]""", s))):
            if n not in known['sfx']: fails.append(f'{f}: sound "{n}" does not exist in audio.js (it would play nothing)')
        for n in sorted(set(re.findall(r"""jingle\(\s*['"](\w+)['"]""", s))):
            if n not in known['jingles']: fails.append(f'{f}: jingle "{n}" does not exist in audio.js')
        for n in sorted(set(re.findall(r"""music\(\s*['"](\w+)['"]""", s))):
            if n not in known['music']: fails.append(f'{f}: music track "{n}" does not exist in music_tracks.js')
        for n in sorted(set(re.findall(r"""A\.call\(\s*['"](\w+)['"]""", s))):
            if not pg.evaluate('n => typeof AUD[n] === "function"', n): fails.append(f'{f}: A.call("{n}") but AUD.{n} is not a function')
    for m in known['stageMoods']:
        if m not in known['moods']: fails.append(f'stage mood "{m}" is not a groove mood in audio.js')
    for gid, m in known['mgMoods']:
        if m and m not in known['moods']: fails.append(f'microgame {gid}: mood "{m}" is not a groove mood in audio.js')
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 3. win a whole stage with the bots
def win_stage(pg, stage):
    """Play one stage with the auto bots from a clean save. Returns (events, state after the run)."""
    pg.evaluate("""s => { localStorage.clear(); SAVE.d = SAVE.merge(null, null); CV.list = null; __hm.seed(7);
      window.HM_AUTO = true; HM.goto('run', s); }""", stage)
    ev = drive(pg, 'over')
    pg.evaluate('window.HM_AUTO = false')
    st = pg.evaluate("""s => ({ phase: run.phase, won: run.won, i: run.i, cleared: run.cleared, loaves: run.loaves, newCards: run.newCards.slice(),
      cards: Object.keys(SAVE.d.cards), clearedStage: !!SAVE.d.cleared[s], best: SAVE.d.best[s], stageIds: MG.forStage(s).map(d => d.id),
      ls: JSON.parse(localStorage.getItem(SAVE.key) || 'null') })""", stage)
    return ev, st


@test()
def full_run_win_path(env):
    fails = []
    pg, errs = env.open('plain')
    stages = pg.evaluate("STAGES.filter(s => MG.forStage(s.id).length).map(s => s.id)")
    todo = ['ark'] if env.quick else stages
    for stage in todo:
        ev, st = win_stage(pg, stage)
        tag = f'[{stage}]'
        lost = [e['id'] for e in ev if e['phase'] == 'result' and e.get('result') != 'win']
        if st['phase'] != 'over': fails.append(f'{tag} run did not finish (phase {st["phase"]})'); continue
        if not st['won']: fails.append(f'{tag} run was not won (bots lost: {lost})')
        if st['i'] != 12: fails.append(f'{tag} played {st["i"]} microgames, expected 12')
        if st['cleared'] != 12: fails.append(f'{tag} bots won {st["cleared"]}/12 (lost: {lost})')
        missing = sorted(set(st['stageIds']) - set(st['cards']))
        if missing: fails.append(f'{tag} cards not unlocked after winning every game: {missing}')
        if not st['clearedStage']: fails.append(f'{tag} SAVE.d.cleared[{stage}] not set')
        if st['best'] != st['cleared']: fails.append(f'{tag} best score {st["best"]} != games won {st["cleared"]}')
        if not st['ls'] or set(st['ls'].get('cards', {})) != set(st['cards']): fails.append(f'{tag} localStorage does not hold the new cards')
        if sorted(st['newCards']) != sorted(st['stageIds']): fails.append(f'{tag} run.newCards {st["newCards"]} != stage games {st["stageIds"]}')
        tx = [t['text'] for t in texts(pg, 'HM.step(60)')]
        for want in ('Stage clear!', 'Play again', f'{len(st["newCards"])} new cards' if len(st['newCards']) > 1 else '1 new card'):
            if want not in tx: fails.append(f'{tag} results screen does not show "{want}" (it shows {tx[:8]})')
        if pg.evaluate('CV.list') is not None: fails.append(f'{tag} reward cards opened before the 1.6 s delay')
        try:
            pg.wait_for_function("CV.list && CV.mode === 'reward'", timeout=4000)
            ids = pg.evaluate('CV.list.map(d => d.id)')
            if ids != st['newCards']: fails.append(f'{tag} reward viewer shows {ids}, expected {st["newCards"]}')
        except Exception: fails.append(f'{tag} the reward card viewer did not open after the results screen')
        pg.evaluate("CV.list = null; HM.goto('title'); run = null")
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 4. losing: four loaves, one grace, game over
@test()
def lose_path_and_grace(env):
    fails = []
    pg, errs = env.open('plain')
    for stage in (('creation',) if env.quick else ('ark', 'creation', 'jesus')):  # creation (REST!) and jesus (STEP!) include games that are won by doing nothing
        tag = f'[{stage}]'
        pg.evaluate("s => { localStorage.clear(); SAVE.d = SAVE.merge(null, null); __hm.seed(3); window.HM_AUTO = false; HM.goto('run', s); }", stage)
        ev = drive(pg, 'over')
        expect, grace, prev, fails_seen, timeout_wins = 4, 0, None, [], []
        for e in ev:
            if e['phase'] == 'result':
                if e['result'] == 'fail':
                    if e['winOnTimeout'] and e['level'] == 0: fails.append(f'{tag} {e["id"]} is winOnTimeout but failed with no input at level 0')
                    expect -= 1; fails_seen.append(e['loaves'])
                else:
                    if not e['winOnTimeout']: fails.append(f'{tag} {e["id"]} was won with no input (only winOnTimeout games may do that)')
                    timeout_wins.append(e['id'])
                if e['loaves'] != expect: fails.append(f'{tag} after {e["id"]} ({e["result"]}) loaves = {e["loaves"]}, expected {expect}')
            if e['phase'] == 'grace':
                grace += 1
                if expect != 0: fails.append(f'{tag} grace came with {expect} loaves left')
            if e['phase'] == 'between' and prev == 'grace':
                expect = 1
                if e['loaves'] != 1: fails.append(f'{tag} grace restored {e["loaves"]} loaves, expected 1')
            prev = e['phase']
        if fails_seen[:4] != [3, 2, 1, 0]: fails.append(f'{tag} loaves after each loss went {fails_seen}, expected 3, 2, 1, 0, then 0 after grace')
        if grace != 1: fails.append(f'{tag} grace happened {grace} times, expected exactly once')
        if not ev or ev[-1]['phase'] != 'over': fails.append(f'{tag} run never ended'); continue
        st = pg.evaluate("s => ({ won: run.won, loaves: run.loaves, cards: Object.keys(SAVE.d.cards), cleared: !!SAVE.d.cleared[s], best: SAVE.d.best[s] || 0, runCleared: run.cleared })", stage)
        if st['won']: fails.append(f'{tag} run counted as won after losing every loaf')
        if st['loaves'] != 0: fails.append(f'{tag} game over with {st["loaves"]} loaves')
        if st['cleared']: fails.append(f'{tag} stage marked cleared after a loss')
        if sorted(st['cards']) != sorted(set(timeout_wins)): fails.append(f'{tag} cards after an idle run are {st["cards"]}, expected only the winOnTimeout wins {sorted(set(timeout_wins))}')
        if st['best'] != st['runCleared']: fails.append(f'{tag} best {st["best"]} != games won {st["runCleared"]}')
        tx = [t['text'] for t in texts(pg, 'HM.step(60)')]
        for want in ('Well done!', 'Play again', 'Stories'):
            if want not in tx: fails.append(f'{tag} game-over screen does not show "{want}"')
    # the two buttons on the results screen
    pg.evaluate("HM.synth('down', 180, 548); HM.synth('up', 180, 548)"); pg.wait_for_timeout(400); pg.evaluate('HM.step(1)')
    st = pg.evaluate('HM.state()')
    if st['scene'] != 'run' or st['phase'] != 'intro' or st['i'] != 0: fails.append(f'"Play again" did not restart the stage: {st}')
    drive(pg, 'over'); pg.evaluate('HM.step(30)')
    pg.evaluate("HM.synth('down', 180, 612); HM.synth('up', 180, 612)"); pg.wait_for_timeout(400)
    if pg.evaluate('scene') != 'stages': fails.append('"Stories" did not go back to the stage picker')
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 5. the game speeds up every 4 microgames
@test()
def speedups(env):
    fails = []
    pg, errs = env.open('plain')
    ev, st = win_stage(pg, 'family')
    n = pg.evaluate("MG.forStage('family').length")
    plays = [e for e in ev if e['phase'] == 'play']
    if len(plays) != 12: fails.append(f'expected 12 microgames, saw {len(plays)}')
    for e in plays:
        i = e['i']; want = 1 + 0.25 * (i // 4)
        if abs(e['speed'] - want) > 1e-9: fails.append(f'game {i + 1}: speed {e["speed"]}, expected {want}')
        wd = e['time'] / (1 + (e['speed'] - 1) * 0.55)
        if abs(e['dur'] - wd) > 1e-6: fails.append(f'game {i + 1} ({e["id"]}): duration {e["dur"]:.3f}s, expected {wd:.3f}s at speed {e["speed"]}')
        wl = min(2, i // n)
        if e['level'] != wl: fails.append(f'game {i + 1}: level {e["level"]}, expected {wl}')
    sp = [e['i'] for e in ev if e['phase'] == 'speedup']
    if sp != [4, 8]: fails.append(f'speed-up screens after games {sp}, expected after 4 and 8 (and not after the last)')
    durs = [e['dur'] for e in plays if e['id'] == plays[0]['id']]
    if len(durs) > 1 and not all(a > b for a, b in zip(durs, durs[1:])) and len(set(round(d, 3) for d in durs)) == 1: fails.append(f'{plays[0]["id"]} never got shorter: {durs}')
    # remix keeps going past 12 and keeps speeding up; when it ends, remixBest is saved
    pg.evaluate("localStorage.clear(); SAVE.d = SAVE.merge(null, null); __hm.seed(11); window.HM_AUTO = true; HM.goto('run', 'remix')")
    ev = drive(pg, 'none', stop_at={'phase': 'between', 'i': 20})
    plays = [e for e in ev if e['phase'] == 'play']
    if len(plays) < 20 or any(e['phase'] == 'over' for e in ev): fails.append(f'remix stopped early (played {len(plays)})')
    for e in plays:
        want = 1 + 0.25 * (e['i'] // 4)
        if abs(e['speed'] - want) > 1e-9: fails.append(f'remix game {e["i"] + 1}: speed {e["speed"]}, expected {want}')
    bpm = pg.evaluate('run.bpm'); sp = pg.evaluate('run.speed')
    if bpm != int(108 * (1 + (sp - 1) * 0.7) + 0.5): fails.append(f'remix bpm {bpm} does not follow speed {sp}')
    pg.evaluate('window.HM_AUTO = false')
    ev = drive(pg, 'over')
    st = pg.evaluate('({ phase: run.phase, cleared: run.cleared, best: SAVE.d.remixBest, stageBest: Object.keys(SAVE.d.best) })')
    if st['phase'] != 'over': fails.append('remix never ended after the bots stopped')
    elif st['best'] != st['cleared']: fails.append(f'remixBest {st["best"]} != games won {st["cleared"]}')
    if st['stageBest']: fails.append(f'remix wrote stage best scores: {st["stageBest"]}')
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 6. saves survive reloads and merge with the cloud copy
FAKE_CLAUDE = r"""
(() => {
  const KEY = 'data/users/u1/save';
  const remote = { cards: { remote_only_card: 1 }, cleared: { exile: 1 }, best: { exile: 9 }, remixBest: 21, muted: false, savedAt: 1000 };
  window.__fakedb = { docs: { [KEY]: { json: JSON.stringify(remote), savedAt: 1000 } }, sets: 0, gets: 0 };
  const db = { doc: p => ({ async get() { __fakedb.gets++; const v = __fakedb.docs[p]; return { exists: v !== undefined, data: () => v }; },
                           async set(v) { __fakedb.sets++; __fakedb.docs[p] = JSON.parse(JSON.stringify(v)); } }) };
  window.claude = { use: async name => name === 'db' ? db : name === 'user' ? { id: async () => 'u1' } : null };
})();
"""


@test()
def saves_persist(env):
    fails = []
    ctx = env.context()
    pg, errs = env.open('plain', ctx=ctx)
    # merge logic, checked in the shipped page with the same cases as the node unit test
    pg.add_script_tag(content=SAVE_CASES.read_text())
    for f in pg.evaluate('saveMergeCases(SAVE)'): fails.append('SAVE.merge: ' + f)
    # win one microgame through the real run loop
    pg.evaluate("localStorage.clear(); SAVE.d = SAVE.merge(null, null); __hm.seed(5); window.HM_AUTO = true; HM.goto('run', 'ark')")
    ev = drive(pg, 'result')
    won = ev[-1]['id'] if ev and ev[-1].get('result') == 'win' else None
    pg.evaluate('window.HM_AUTO = false')
    if not won: fails.append(f'the bot did not win the first ark microgame: {ev[-1] if ev else None}'); return fails
    if not pg.evaluate('id => !!SAVE.d.cards[id]', won): fails.append(f'card {won} not in SAVE.d.cards right after the win')
    pg.evaluate("SAVE.d.muted = true; SAVE.save()")
    pg.reload(); wait_booted(pg)
    st = pg.evaluate('({ cards: Object.keys(SAVE.d.cards), muted: SAVE.d.muted, audMuted: AUD._state().muted })')
    if won not in st['cards']: fails.append(f'card {won} was lost after reloading the page (cards now {st["cards"]})')
    if not st['muted']: fails.append('the mute setting was lost after reloading')
    if not st['audMuted']: fails.append('after reloading with mute on, audio is not muted')
    pg.goto(env.pages['plain'].as_uri() + '?test=1'); wait_booted(pg)   # a fresh visit, not just a reload
    if won not in pg.evaluate('Object.keys(SAVE.d.cards)'): fails.append(f'card {won} was lost on the next visit')
    # the cards screen shows the owned card
    pg.evaluate("HM.goto('cards'); HM.step(3)")
    tx = [t['text'] for t in texts(pg)]
    have = pg.evaluate('MG.list.filter(d => SAVE.d.cards[d.id]).length'); total = pg.evaluate('MG.list.length')
    if f'Cards {have}/{total}' not in tx: fails.append(f'cards screen header does not say "Cards {have}/{total}" ({tx[:3]})')
    for e in errs: fails.append(e)
    pg.close()

    # cloud save inside Claude: a fake window.claude with an in-memory db (artifact build, as the artifact host runs it)
    ctx2 = env.context(init=[FAKE_CLAUDE])
    pg, errs = env.open('artifact', ctx=ctx2)
    try: pg.wait_for_function("SAVE.uid === 'u1'", timeout=5000)
    except Exception: fails.append('SAVE.connect() never connected to the fake claude db'); return fails
    st = pg.evaluate("({ cards: SAVE.d.cards, cleared: SAVE.d.cleared, best: SAVE.d.best, remixBest: SAVE.d.remixBest, ls: JSON.parse(localStorage.getItem(SAVE.key) || 'null') })")
    if not st['cards'].get('remote_only_card'): fails.append(f'remote card not merged into SAVE.d: {st["cards"]}')
    if not st['cleared'].get('exile') or st['best'].get('exile') != 9 or st['remixBest'] != 21: fails.append(f'remote progress not merged: {st}')
    if not st['ls'] or not st['ls']['cards'].get('remote_only_card'): fails.append('merged remote save not written to localStorage')
    sets0 = pg.evaluate('__fakedb.sets')
    pg.evaluate("__hm.seed(5); window.HM_AUTO = true; HM.goto('run', 'ark')")
    ev = drive(pg, 'result'); pg.evaluate('window.HM_AUTO = false')
    won = ev[-1]['id'] if ev and ev[-1].get('result') == 'win' else None
    pg.wait_for_timeout(900)  # SAVE.save() pushes to the cloud 600 ms later
    doc = pg.evaluate("({ sets: __fakedb.sets, doc: __fakedb.docs['data/users/u1/save'] })")
    saved = json.loads(doc['doc']['json']) if doc['doc'] else {}
    if doc['sets'] <= sets0: fails.append('winning a microgame did not write the save to the cloud db')
    if won and not saved.get('cards', {}).get(won): fails.append(f'cloud save is missing the card just won ({won}): {saved.get("cards")}')
    if not saved.get('cards', {}).get('remote_only_card'): fails.append('cloud save lost the card that only the cloud had')
    for e in errs: fails.append(e)
    pg.close()
    return fails


@test()
def unit_save_logic(env):
    if not shutil.which('node'): return ['node is not installed (needed for tests/unit/save.test.js)']
    p = subprocess.run(['node', str(TESTS / 'unit' / 'save.test.js')], capture_output=True, text=True, timeout=60)
    if p.returncode == 0: return []
    return [l.strip() for l in (p.stdout + p.stderr).splitlines() if l.strip() and not l.startswith('PASS')][:20] or ['node unit test failed']


# ---------------------------------------------------------------- 7. words fit on cards, tiles, bubbles and banners
@test()
def card_text_fits(env):
    fails = []
    pg, errs = env.open('plain')
    lay = pg.evaluate('({ card: CARD, W, H })'); K = lay['card']; B = K['body']; I = K['img']
    # the card's own layout: the picture, the scrolling words and the buttons stay inside the card and do not overlap
    if B['x'] - 6 < K['x'] or B['x'] + B['w'] + 6 > K['x'] + K['w']: fails.append(f'card body {B} is wider than the card {K}')
    if B['y'] < I['y'] + I['h']: fails.append('card words overlap the picture')
    if B['y'] + B['h'] > K['nav'] - 14: fails.append(f'card words (bottom {B["y"] + B["h"]}) run into the buttons (divider at {K["nav"] - 14})')
    if K['nav'] + 16 + 22 > K['y'] + K['h']: fails.append('card buttons fall off the bottom of the card')
    if K['y'] + K['h'] > lay['H'] or K['x'] + K['w'] > lay['W']: fails.append('the card is bigger than the screen')
    ids = pg.evaluate('MG.list.map(d => d.id)')
    for gid in ids:
        r = pg.evaluate('''id => { const def = MG.byId[id]; delete bodyCache[id]; let bd;
          const tx = __hm.capture(() => { bd = cardBody(def); });
          const W2 = CARD.body.w * 2, lines = tx.filter(t => t.cw === W2).map(t => ({ text: t.text, font: t.font, x0: t.lx0, x1: t.lx1, y0: t.ly0, y1: t.ly1 }));
          openCards([def], 0, 'browse'); CV.scroll = 1e9; HM.step(1);
          const view = __hm.capture(() => render()).filter(t => t.main && t.alpha > 0.05).map(t => ({ text: t.text, x0: t.gx0, x1: t.gx1, y0: t.gy0, y1: t.gy1 }));
          const out = { cw: bd.canvas.width, ch: bd.canvas.height, h: bd.h, scroll: CV.scroll, lines, view, card: def.card || null };
          CV.list = null; return out; }''', gid)
        tag = f'[{gid}]'; cd = r['card'] or {}
        for k in ('title', 'ref', 'kind', 'text', 'ask'):
            if not isinstance(cd.get(k), str) or not cd.get(k).strip(): fails.append(f'{tag} card has no {k}')
        if r['cw'] != B['w'] * 2: fails.append(f'{tag} card text canvas is {r["cw"] / 2} wide, expected CARD.body.w = {B["w"]}')
        for ln in r['lines']:
            boxed = 14 <= ln['x0'] <= 20  # note/ask lines sit in a tinted box, 16 px in
            right = B['w'] - (10 if boxed else 0)
            if ln['x0'] < -1 or ln['x1'] > right + 1: fails.append(f'{tag} card line runs outside the text area ({ln["x0"]:.0f}..{ln["x1"]:.0f}, allowed 0..{right}): "{ln["text"]}"')
            if ln['y1'] > r['h'] + 1: fails.append(f'{tag} card line below the end of the text canvas: "{ln["text"]}"')
        # nothing lost in wrapping: every word of the story and the question is drawn
        for k, px in (('text', ' 17px'), ('ask', ' 16px'), ('note', ' 15px')):
            if cd.get(k):
                got = ' '.join(l['text'] for l in r['lines'] if px in l['font'])
                if ' '.join(cd[k].split()) != ' '.join(got.split()): fails.append(f'{tag} card {k} is not drawn in full: drew "{got[:80]}..."')
        want_scroll = max(0, r['h'] - B['h'])
        if abs(r['scroll'] - want_scroll) > 0.5: fails.append(f'{tag} viewer cannot scroll to the end (max scroll {r["scroll"]}, needs {want_scroll})')
        last = max((l['y1'] for l in r['lines']), default=0)
        if last - r['scroll'] > B['h'] + 1: fails.append(f'{tag} the last line of the card stays below the visible area even when scrolled to the end')
        for t in r['view']:
            if t['x0'] < K['x'] - 1 or t['x1'] > K['x'] + K['w'] + 1 or t['y0'] < K['y'] - 1 or t['y1'] > K['y'] + K['h'] + 1:
                fails.append(f'{tag} viewer text "{t["text"]}" is outside the card')
    # microgame command banners and win/fail words fit on the screen
    for gid in ids:
        r = pg.evaluate('''id => { const def = MG.byId[id], out = [];
          ctx.setTransform(scale * DPR, 0, 0, scale * DPR, offX * DPR, offY * DPR);
          for (const g of [{ def, t: 0.5, dur: 5, done: false }, { def, t: 1.4, dur: 5, done: true, doneAt: 1.0, result: 'win' }, { def, t: 1.4, dur: 5, done: true, doneAt: 1.0, result: 'fail' }])
            out.push(...__hm.capture(() => drawPlayOverlay(ctx, g, g.t)).filter(t => t.main).map(t => ({ text: t.text, x0: t.gx0, x1: t.gx1 })));
          return out; }''', gid)
        for t in r:
            if t['x0'] < 0 or t['x1'] > 360: fails.append(f'[{gid}] "{t["text"]}" runs off the screen ({t["x0"]:.0f}..{t["x1"]:.0f})')
    # stage tiles: each stage name fits inside its tile and on its dark label
    r = pg.evaluate('''() => { SAVE.d.cleared = {}; HM.goto('stages'); HM.step(2);
      const tx = __hm.capture(() => render()).filter(t => t.main).map(t => ({ text: t.text, x0: t.gx0, x1: t.gx1, y0: t.gy0, y1: t.gy1 }));
      return { tx, tiles: stageTiles().map(t => ({ id: t.id, name: t.st ? t.st.name : 'Remix', x: t.x, y: t.y, w: t.w, h: t.h, on: t.count > 0 })) }; }''')
    for tile in r['tiles']:
        words = set(tile['name'].split())
        mine = [t for t in r['tx'] if abs((t['y0'] + t['y1']) / 2 - tile['y']) < tile['h'] / 2 and abs((t['x0'] + t['x1']) / 2 - tile['x']) < tile['w'] / 2 + 10 and (set(t['text'].split()) <= words or tile['id'] == 'remix')]
        drawn = ' '.join(t['text'] for t in mine)
        if tile['id'] != 'remix' and sorted(drawn.split()) != sorted(tile['name'].split()): fails.append(f'stage tile {tile["id"]}: drew "{drawn}", expected "{tile["name"]}"')
        L, R = tile['x'] - tile['w'] / 2, tile['x'] + tile['w'] / 2
        for t in mine:
            if t['x0'] < L + 2 or t['x1'] > R - 2 or t['y0'] < tile['y'] - tile['h'] / 2 or t['y1'] > tile['y'] + tile['h'] / 2:
                fails.append(f'stage tile {tile["id"]}: "{t["text"]}" runs outside the tile ({t["x0"]:.0f}..{t["x1"]:.0f}, tile {L:.0f}..{R:.0f})')
            if tile['id'] != 'remix' and tile['on'] and (t['x0'] < tile['x'] - 32 - 1 or t['x1'] > tile['x'] + 76 + 1):
                fails.append(f'stage tile {tile["id"]}: "{t["text"]}" is wider than its dark label ({t["x0"]:.0f}..{t["x1"]:.0f}, label {tile["x"] - 32:.0f}..{tile["x"] + 76:.0f})')
    # the host's speech bubble on every stage intro (and remix): the bubble fits the screen and the words fit the bubble
    stages = pg.evaluate("STAGES.map(s => s.id).concat(['remix'])")
    for sid in stages:
        r = pg.evaluate('''sid => { HM.goto('run', sid); HM.step(45); const rects = [], orr = window.roundRect;
          window.roundRect = function (c, x, y, w, h, rr) { if (c === ctx) rects.push({ x, y, w, h, r: rr }); return orr.apply(this, arguments); };
          let tx; try { tx = __hm.capture(() => render()); } finally { window.roundRect = orr; }
          const host = run.stage.host, line = run.stage.line, name = run.stage.name; run = null; HM.goto('title');
          return { rects, tx: tx.filter(t => t.main).map(t => ({ text: t.text, font: t.font, x0: t.gx0, x1: t.gx1, y0: t.gy0, y1: t.gy1 })), line, name, child: !!host.child }; }''', sid)
        tag = f'[{sid} intro]'
        bub = list({(round(b['x']), round(b['y']), round(b['w']), round(b['h'])): b for b in r['rects'] if b['r'] == 22}.values())  # filled, then stroked
        if len(bub) != 1: fails.append(f'{tag} expected one speech bubble, found {len(bub)}'); continue
        b = bub[0]; bx0, bx1, by0, by1 = b['x'], b['x'] + b['w'], b['y'], b['y'] + b['h']
        if b['w'] > 340: fails.append(f'{tag} speech bubble is {b["w"]:.0f} px wide (max 340)')
        if bx0 < 0 or bx1 > 360: fails.append(f'{tag} speech bubble runs off the screen ({bx0:.0f}..{bx1:.0f})')
        lines = [t for t in r['tx'] if ' 19px ' in t['font']]
        if ' '.join(t['text'] for t in lines) != r['line']: fails.append(f'{tag} bubble shows "{" ".join(t["text"] for t in lines)}", expected "{r["line"]}"')
        for t in lines:
            if t['x0'] < bx0 + 8 or t['x1'] > bx1 - 8: fails.append(f'{tag} bubble words run outside the bubble: "{t["text"]}" ({t["x0"]:.0f}..{t["x1"]:.0f}, bubble {bx0:.0f}..{bx1:.0f})')
            if t['y0'] < by0 + 2 or t['y1'] > by1 - 2: fails.append(f'{tag} bubble words run above/below the bubble: "{t["text"]}"')
        title = [t for t in r['tx'] if t['text'] == r['name']]
        if title and title[0]['y1'] > by0: fails.append(f'{tag} the stage name overlaps the speech bubble')
        if title and (title[0]['x0'] < 0 or title[0]['x1'] > 360): fails.append(f'{tag} the stage name "{r["name"]}" runs off the screen')
        head_top = 540 - 2.6 * ((40 * (0.82 if r['child'] else 1)) + 15 + 16)
        if by1 + 14 > head_top: fails.append(f'{tag} the speech bubble (bottom {by1 + 14:.0f}) covers the host\'s head (top {head_top:.0f})')
    # every other screen: no text off the screen
    for name, js in [('title', "HM.goto('title'); HM.step(2)"), ('cards', "SAVE.d.cards = Object.fromEntries(MG.list.map(d => [d.id, 1])); HM.goto('cards'); HM.step(2)"),
                     ('grace', "HM.goto('run', 'ark'); run.phase = 'grace'; run.pt = 3; run.loaves = 0; HM.step(1)"),
                     ('results', "HM.goto('run', 'ark'); run.i = 12; run.cleared = 12; run.newCards = MG.list.slice(0, 3).map(d => d.id); finishRun(true); HM.step(60)")]:
        tx = pg.evaluate('js => { (0, eval)(js); const r = __hm.capture(() => render()).filter(t => t.main && t.alpha > 0.05).map(t => ({ text: t.text, x0: t.gx0, x1: t.gx1, y0: t.gy0, y1: t.gy1 })); return r; }', js)
        for t in tx:
            if t['x0'] < 0 or t['x1'] > 360 or (t['y1'] > 0 and t['y0'] < 0 and name != 'cards') or t['y1'] > 640 and name != 'cards':
                fails.append(f'[{name}] "{t["text"]}" is drawn off the screen ({t["x0"]:.0f}..{t["x1"]:.0f}, {t["y0"]:.0f}..{t["y1"]:.0f})')
        pg.evaluate("CV.list = null; run = null; HM.goto('title')")
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 8. the card viewer responds to swipes, drags and taps
@test()
def card_viewer_interaction(env):
    fails = []
    pg, errs = env.open('plain')
    tap = lambda x, y: pg.evaluate('([x, y]) => { HM.synth("down", x, y); HM.synth("up", x, y); HM.step(1); }', [x, y])
    def drag(x0, y0, x1, y1, n=6):
        pg.evaluate('''([x0, y0, x1, y1, n]) => { HM.synth('down', x0, y0); for (let k = 1; k <= n; k++) HM.synth('move', x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n);
          HM.synth('up', x1, y1); HM.synth('swipe', x1 - x0, y1 - y0, 0, 0); HM.step(1); }''', [x0, y0, x1, y1, n])
    cv = lambda: pg.evaluate('CV.list ? { i: CV.i, n: CV.list.length, scroll: CV.scroll, mode: CV.mode } : null')
    # pick three owned cards; the middle one has the longest words, so it scrolls
    pick = pg.evaluate('''() => { const lens = storyOrder().map(d => [d.id, cardBody(d).h]); const longest = lens.slice().sort((a, b) => b[1] - a[1])[0];
      const ids = [storyOrder()[0].id, longest[0], storyOrder().slice(-1)[0].id].filter((v, i, a) => a.indexOf(v) === i);
      SAVE.d.cards = Object.fromEntries(ids.map(i => [i, 1])); return { ids, longestH: longest[1], bodyH: CARD.body.h }; }''')
    pg.evaluate("HM.goto('cards'); HM.step(2)")
    # tap a locked card: nothing opens
    locked = pg.evaluate("cardTiles().find(t => !SAVE.d.cards[t.def.id] && t.y > 80 && t.y < 600)")
    if locked:
        tap(locked['x'], locked['y'])
        if cv(): fails.append('tapping a locked card opened the viewer'); pg.evaluate('CV.list = null')
    first = pg.evaluate("(() => { const t = cardTiles().find(t => SAVE.d.cards[t.def.id]); return { x: t.x, y: t.y, id: t.def.id }; })()")
    tap(first['x'], first['y'])
    s = cv()
    if not s: fails.append('tapping an owned card on the cards screen did not open the viewer'); return fails
    if s['mode'] != 'browse' or s['n'] != len(pick['ids']): fails.append(f'viewer opened as {s}, expected browse mode with {len(pick["ids"])} cards')
    pg.evaluate('CV.i = 0; HM.step(1)')
    drag(250, 420, 120, 424)
    if cv()['i'] != 1: fails.append(f'swiping left did not go to the next card (i = {cv()["i"]})')
    drag(250, 420, 120, 424)
    if cv()['i'] != 2: fails.append('second swipe left did not go to the third card')
    drag(250, 420, 120, 424)
    if cv()['i'] != 2: fails.append('swiping left on the last card moved past the end')
    drag(120, 420, 250, 424)
    if cv()['i'] != 1: fails.append(f'swiping right did not go back (i = {cv()["i"]})')
    drag(200, 420, 220, 421)
    if cv()['i'] != 1: fails.append('a short sideways drag changed the card')
    # the arrows
    ny = pg.evaluate('CARD.nav + 16')
    tap(306, ny)
    if cv()['i'] != 2: fails.append('tapping the right arrow did not go to the next card')
    tap(54, ny); tap(54, ny)
    if cv()['i'] != 0: fails.append('tapping the left arrow twice did not go back to the first card')
    # vertical drag scrolls the words of the long card
    pg.evaluate("id => { CV.i = CV.list.findIndex(d => d.id === id); CV.scroll = 0; HM.step(1); }", pick['ids'][1])
    if pick['longestH'] > pick['bodyH']:
        drag(180, 480, 182, 400)
        sc = cv()['scroll']
        if sc < 40: fails.append(f'dragging up on the words did not scroll them (scroll {sc})')
        if cv()['i'] != pg.evaluate("id => CV.list.findIndex(d => d.id === id)", pick['ids'][1]): fails.append('a vertical drag changed the card')
        drag(180, 300, 180, 600)
        if cv()['scroll'] != 0: fails.append(f'dragging down did not scroll back to the top (scroll {cv()["scroll"]})')
    else: print('      note: no card is long enough to scroll; skipped the vertical drag check')
    # the same swipe with real pointer events through the canvas (tests toLogical and the DOM listeners)
    pg.evaluate('CV.i = 0; HM.step(1)')
    pg.mouse.move(260, 420); pg.mouse.down(); pg.mouse.move(200, 422, steps=4); pg.mouse.move(110, 424, steps=4); pg.mouse.up(); pg.evaluate('HM.step(1)')
    if cv()['i'] != 1: fails.append('a real mouse swipe on the canvas did not change the card')
    # close button, then tap outside in browse mode
    k = pg.evaluate('CARD')
    tap(k['x'] + k['w'] - 26, k['y'] + 26)
    if cv(): fails.append('tapping the close button did not close the viewer')
    pg.evaluate("openCards(storyOrder().filter(d => SAVE.d.cards[d.id]), 0, 'browse'); HM.step(1)")
    tap(180, 300)
    if not cv(): fails.append('tapping on the card itself closed the viewer')
    tap(5, 634)
    if cv(): fails.append('tapping outside the card in browse mode did not close the viewer')
    if pg.evaluate('scene') != 'cards': fails.append('closing the viewer left the cards screen')
    # reward mode: Next, Next, Done; tapping outside does not close it
    pg.evaluate("openCards(storyOrder().filter(d => SAVE.d.cards[d.id]), 0, 'reward'); HM.step(1)")
    tap(5, 634)
    if not cv(): fails.append('tapping outside closed the reward viewer (it should wait for Next/Done)')
    labels = []
    for step_i in range(len(pick['ids'])):
        tx = [t['text'] for t in texts(pg, 'render()')]
        labels.append('Done' if 'Done' in tx else 'Next' if 'Next' in tx else '?')
        tap(180, ny)
    if labels != ['Next'] * (len(pick['ids']) - 1) + ['Done']: fails.append(f'reward buttons read {labels}, expected Next ... Done')
    if cv(): fails.append('Done did not close the reward viewer')
    # the cards grid scrolls with a real drag
    pg.evaluate("SAVE.d.cards = Object.fromEntries(MG.list.map(d => [d.id, 1])); CV.list = null; ui.cardScroll = 0; HM.goto('cards'); HM.step(1)")
    pg.mouse.move(122, 500); pg.mouse.down(); pg.mouse.move(122, 300, steps=6); pg.mouse.up(); pg.evaluate('HM.step(1)')
    if pg.evaluate('ui.cardScroll') < 100: fails.append(f'dragging the cards grid (between cards) did not scroll it (scroll {pg.evaluate("ui.cardScroll")})')
    pg.evaluate("CV.list = null; ui.cardScroll = 0; HM.step(1)")
    pg.mouse.move(180, 500); pg.mouse.down(); pg.mouse.move(180, 300, steps=6); pg.mouse.up(); pg.evaluate('HM.step(1)')
    st = pg.evaluate('({ scroll: ui.cardScroll, open: !!CV.list })')
    if st['open'] or st['scroll'] < 100: fails.append(f'CARDS-GRID-DRAG: dragging up on a card opened the viewer instead of scrolling the grid (scroll {st["scroll"]}, viewer open {st["open"]})')
    pg.evaluate('CV.list = null')
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 9. raised arms are drawn in front of heads and hair
@test()
def art_sanity_raised_arms(env):
    """Raised arms (wave, raise, cheer, up) must be drawn in front of the head and hair, never hidden behind them.
    The check does not depend on how paint.js draws an arm: it renders each person twice with two robe colours (the
    pixels that change are the visible sleeves) and twice with two skin colours (the visible hands and face), and
    compares what shows above the shoulders with a bald, bare-headed person, whose head cannot cover anything."""
    pg, errs = env.open('plain')
    r = pg.evaluate(r"""() => {
      const S = 6, X = 300, Y = 590, Wc = 600, Hc = 620;
      const render = o => { const cv = document.createElement('canvas'); cv.width = Wc; cv.height = Hc; const c = cv.getContext('2d');
        c.fillStyle = '#20e0ff'; c.fillRect(0, 0, Wc, Hc); P.person(c, X, Y, S, o); return c.getImageData(0, 0, Wc, Hc).data; };
      const variants = { bald: { hairStyle: 'bald' }, long: { hairStyle: 'long' }, curly: { hairStyle: 'curly' }, bun: { hairStyle: 'bun' }, short: { hairStyle: 'short' },
        scarf: { head: 'scarf', hairStyle: 'long' }, wrap: { head: 'wrap', beard: true }, crown: { head: 'crown', hairStyle: 'long' }, beard: { hairStyle: 'curly', beard: true },
        modern: { outfit: 'modern', hairStyle: 'long' }, facingLeft: { facing: -1, hairStyle: 'long' } };
      const out = {};
      for (const child of [false, true]) for (const arms of ['wave', 'raise', 'cheer', 'up']) for (const [vn, v] of Object.entries(variants)) {
        const base = { skin: '#c99a6e', robe: '#3a7a5a', hair: '#2a1a12', expr: 'happy', arms, t: 0, bounce: 0, child, ...v };
        const a = render(base), b = render({ ...base, robe: '#b04a9a' }), c2 = render({ ...base, skin: '#6a9ae0' });
        // only look above the top of the robe (bodyTop), so a beard over the neckline is not mistaken for a hidden arm
        const shoulder = Y - S * (40 * (child ? 0.82 : 1) - 2), headY = Y - S * (40 * (child ? 0.82 : 1) + 15), headR = S * (child ? 15 : 16);
        let sleeve = 0, hand = 0;
        for (let y = 0; y < shoulder - 2 * S; y++) for (let x = 0; x < Wc; x++) {
          const i = (y * Wc + x) * 4, dr = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
          if (dr > 40) sleeve++;
          // hands: skin-coloured pixels away from the face (outside a circle 1.3 head-radii around it)
          const ds = Math.abs(a[i] - c2[i]) + Math.abs(a[i + 1] - c2[i + 1]) + Math.abs(a[i + 2] - c2[i + 2]);
          if (ds > 40 && Math.hypot(x - X, y - headY) > headR * 1.3) hand++;
        }
        out[(child ? 'child ' : '') + arms + ' ' + vn] = { sleeve, hand, child, arms, vn };
      }
      return out; }""")
    fails = []
    for k, m in r.items():
        base = r[('child ' if m['child'] else '') + m['arms'] + ' bald']
        if m['vn'] == 'bald':
            if m['sleeve'] < 600: fails.append(f'{k}: hardly any raised sleeve shows above the shoulders ({m["sleeve"]} px); is the pose still raised?')
            if m['hand'] < 150: fails.append(f'{k}: the raised hands do not show ({m["hand"]} px)')
            continue
        if m['sleeve'] < 0.85 * base['sleeve']: fails.append(f'{k}: raised arm is partly hidden by the head or hair ({m["sleeve"]} sleeve px visible vs {base["sleeve"]} on a bald head)')
        if m['hand'] < 0.85 * base['hand']: fails.append(f'{k}: raised hand is partly hidden ({m["hand"]} px visible vs {base["hand"]} on a bald head)')
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 10. every microgame: bots win, idling fails, metadata complete
@test()
def registry_complete(env):
    """Every src/games file registers exactly the microgame its name says (a file with a syntax error silently disappears)."""
    fails = []
    pg, errs = env.open('plain')
    lst = pg.evaluate('HM.list()')
    stages = pg.evaluate('STAGES.map(s => s.id)')
    have = {f"{g['stage']}_{g['id']}" for g in lst}
    import fnmatch
    pend = ROOT / 'src' / 'games' / 'PENDING'
    pending = [l.split('#')[0].strip() for l in pend.read_text().splitlines()] if pend.exists() else []
    pending = [p for p in pending if p]  # files listed in src/games/PENDING are left out of the build on purpose
    files = {f.stem for f in (ROOT / 'src' / 'games').glob('*.js') if not f.name.startswith('_') and not any(fnmatch.fnmatch(f.name, p) for p in pending)}
    for f in sorted(files - have): fails.append(f'src/games/{f}.js did not register a microgame named after it (syntax error, or stage/id differs from the file name)')
    for h in sorted(have - files): fails.append(f'microgame {h} has no file src/games/{h}.js')
    ids = [g['id'] for g in lst]
    for d in sorted({i for i in ids if ids.count(i) > 1}): fails.append(f'duplicate microgame id {d}')
    for s in stages:
        n = sum(1 for g in lst if g['stage'] == s)
        if n == 0: fails.append(f'stage {s} has no microgames')
        elif n < 3: print(f'      warning: stage {s} has only {n} microgame(s); 3 or more keep a run varied')
    for e in errs: fails.append(e)
    pg.close()
    return fails


@test(slow=True)
def all_microgames(env):
    fails = []
    pg, errs = env.open('plain')
    lst = pg.evaluate('HM.list()')
    stages = set(pg.evaluate('STAGES.map(s => s.id)'))
    moods = set(pg.evaluate('AUD.moods'))
    for g in lst:
        gid = g['id']; tag = f'[{gid}]'
        meta = pg.evaluate('''id => { const d = MG.byId[id]; return { fns: ['draw', 'auto'].filter(k => typeof d[k] !== 'function'),
          inputs: ['down', 'move', 'up', 'swipe'].filter(k => typeof d[k] === 'function'), card: d.card || null, mood: d.mood || null, time: d.time }; }''', gid)
        if not re.fullmatch(r"[A-Z][A-Z ’'\-]*!", g['cmd'] or '') or len((g['cmd'] or '').split()) > 2: fails.append(f'{tag} command "{g["cmd"]}" should be one or two ALL-CAPS words ending in "!"')
        if g['hint'] not in HINTS: fails.append(f'{tag} hint "{g["hint"]}" is not one of {sorted(HINTS)}')
        if g['stage'] not in stages: fails.append(f'{tag} stage "{g["stage"]}" does not exist')
        if meta['fns']: fails.append(f'{tag} missing functions: {meta["fns"]}')
        if not meta['inputs'] and not g['winOnTimeout']: fails.append(f'{tag} has no input handler (down/move/up/swipe)')
        if meta['mood'] and meta['mood'] not in moods: fails.append(f'{tag} mood "{meta["mood"]}" is not a groove mood')
        if not (2 <= (meta['time'] or 0) <= 10): fails.append(f'{tag} time {meta["time"]} s is outside 2..10 s')
        cd = meta['card'] or {}
        for k in ('title', 'ref', 'kind', 'text', 'ask'):
            if not isinstance(cd.get(k), str) or not cd[k].strip(): fails.append(f'{tag} card has no {k}')
        if cd.get('ask') and '?' not in cd['ask']: fails.append(f'{tag} card "ask" has no question in it: "{cd["ask"]}"')
        for run_ in [dict(name='bot L0', o={'auto': True, 'level': 0}, want='win'), dict(name='bot L2x2', o={'auto': True, 'level': 2, 'speed': 2}, want='win'),
                     dict(name='idle L0', o={'auto': False, 'level': 0}, want='win' if g['winOnTimeout'] else 'fail'),
                     # at higher levels a winOnTimeout game may need input (STEP! topples), so only check that idling loses the others
                     *([] if g['winOnTimeout'] else [dict(name='idle L2x2', o={'auto': False, 'level': 2, 'speed': 2}, want='fail')])]:
            for seed in (1, 2):
                res = pg.evaluate('([id, o, s]) => { __hm.seed(s); const r = HM.test(id, o); delete r.shots; return r; }', [gid, run_['o'], seed])
                if res.get('error'): fails.append(f'{tag} {res["error"]}'); break
                if res['result'] != run_['want']: fails.append(f'{tag} {run_["name"]} (seed {seed}): {res["result"]} at {res["doneAt"]}s of {res["dur"]}s, expected {run_["want"]}')
                for e in sorted(set(res['errors'])): fails.append(f'{tag} {run_["name"]}: {e[:200]}')
        # every frame of a played game draws without throwing (HM.test only draws the frames it is asked for)
        res = pg.evaluate('id => { __hm.seed(3); const fr = []; for (let t = 0.05; t < 6.5; t += 0.25) fr.push(t); const r = HM.test(id, { auto: true, level: 1, frames: fr, overlay: true }); return { errors: r.errors, n: r.shots.length }; }', gid)
        for e in sorted(set(res['errors'])): fails.append(f'{tag} drawing: {e[:200]}')
    for e in errs: fails.append(e)
    pg.close()
    return fails


# ---------------------------------------------------------------- 11. the page never touches the network
@test()
def no_network(env):
    fails = []
    for variant in ('plain', 'artifact'):
        ctx = env.context()
        reqs = []
        ctx.on('request', lambda r: reqs.append(r.url))
        ctx.route(re.compile(r'^(https?|wss?|ftp):'), lambda route: route.abort())
        pg, errs = env.open(variant, test=False, ctx=ctx)
        pg.mouse.click(180, 520); pg.wait_for_timeout(200); pg.mouse.click(180, 300); pg.wait_for_timeout(400); pg.mouse.click(96, 108)
        pg.wait_for_timeout(4500)
        pg.evaluate("SAVE.d.cards = Object.fromEntries(MG.list.map(d => [d.id, 1])); run = null; scene = 'cards'; openCards(MG.list.slice(0, 3), 0, 'browse')")
        pg.wait_for_timeout(600)
        bad = [u for u in reqs if not re.match(r'^(file|data|blob):', u)]
        for u in bad: fails.append(f'[{variant}] request to {u[:120]}')
        for e in errs: fails.append(f'[{variant}] {e}')
        pg.close()
    html = env.pages['plain'].read_text(encoding='utf-8')
    for pat, what in [(r'<script[^>]+src\s*=', 'an external <script src>'), (r'<link[^>]+href\s*=\s*["\']?https?:', 'an external <link>'),
                      (r'url\(\s*["\']?https?:', 'a url(http...) in CSS'), (r'@import', 'a CSS @import'), (r'\bfetch\s*\(\s*["\']https?:', 'a fetch to the web')]:
        if re.search(pat, html, re.I): fails.append(f'the built page contains {what}')
    return fails


# ---------------------------------------------------------------- 12. the canvas fills the screen without scrollbars
@test()
def layout_no_overflow(env):
    fails = []
    for variant in ('plain', 'artifact'):
        for vw, vh in [(360, 640), (390, 844), (768, 1024), (844, 390), (320, 480)]:
            tag = f'[{variant} {vw}x{vh}]'
            pg, errs = env.open(variant, viewport=(vw, vh))
            for scene in ('title', 'stages', 'cards'):
                pg.evaluate("s => { HM.goto(s); HM.step(2); }", scene)
                m = pg.evaluate('''() => { const se = document.scrollingElement, r = document.getElementById('game').getBoundingClientRect();
                  return { sw: se.scrollWidth, sh: se.scrollHeight, iw: innerWidth, ih: innerHeight, r: [r.left, r.top, r.width, r.height], scale, offX, offY,
                           cw: document.getElementById('game').width, ch: document.getElementById('game').height, dpr: devicePixelRatio, canvases: document.querySelectorAll('canvas').length }; }''')
                if m['sw'] > m['iw'] or m['sh'] > m['ih']: fails.append(f'{tag} {scene}: page scrolls ({m["sw"]}x{m["sh"]} in a {m["iw"]}x{m["ih"]} window)')
                if [round(v) for v in m['r']] != [0, 0, vw, vh]: fails.append(f'{tag} {scene}: canvas at {m["r"]}, expected to fill 0,0,{vw},{vh}')
                if abs(m['scale'] - min(vw / 360, vh / 640)) > 1e-6 or m['offX'] < -0.01 or m['offY'] < -0.01: fails.append(f'{tag} game area scale/offset wrong: {m["scale"]}, {m["offX"]}, {m["offY"]}')
                if m['cw'] != round(vw * m['dpr']) or m['ch'] != round(vh * m['dpr']): fails.append(f'{tag} canvas backing store {m["cw"]}x{m["ch"]} does not match the window')
                if m['canvases'] != 1: fails.append(f'{tag} {m["canvases"]} canvases in the document (offscreen canvases should not be attached)')
            # a tap at the Play button lands on it at every size
            pg.evaluate("HM.goto('title'); HM.step(1)")
            x, y = pg.evaluate('[offX + 180 * scale, offY + 300 * scale]')
            pg.mouse.click(x, y); pg.wait_for_timeout(300)
            if pg.evaluate('scene') != 'stages': fails.append(f'{tag} tapping the Play button did not open the stage picker')
            for e in errs: fails.append(f'{tag} {e}')
            pg.close()
    return fails


# ---------------------------------------------------------------- runner
def build(tmp):
    pages = {'plain': tmp / 'holymoly.html', 'artifact': tmp / 'holymoly-artifact.html'}
    env = dict(os.environ); env.pop('HM_ONLY', None); env.pop('HM_ARTIFACT', None)
    subprocess.run([sys.executable, str(ROOT / 'src' / 'build.py'), str(pages['plain'])], check=True, env=env, stdout=subprocess.DEVNULL)
    raw = tmp / 'artifact-body.html'
    subprocess.run([sys.executable, str(ROOT / 'src' / 'build.py'), str(raw)], check=True, env={**env, 'HM_ARTIFACT': '1'}, stdout=subprocess.DEVNULL)
    # the skeleton the Claude artifact host wraps around an HTML artifact
    pages['artifact'].write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
                                 '</head><body>' + raw.read_text(encoding='utf-8') + '</body></html>', encoding='utf-8')
    return pages


def main():
    ap = argparse.ArgumentParser(description='Holy Moly! test suite')
    ap.add_argument('--quick', action='store_true', help='skip the slow passes (every microgame, every stage)')
    ap.add_argument('--only', default='', help='run only tests whose names contain one of these comma-separated words')
    ap.add_argument('--out', default='', help='save screenshots of every screen to this folder')
    ap.add_argument('--list', action='store_true', help='list the tests and exit')
    a = ap.parse_args()
    if a.list:
        for n, fn, slow in TESTS_REGISTRY: print(f'{n}{"  (slow)" if slow else ""}')
        return 0
    only = [w for w in a.only.split(',') if w]
    todo = [(n, fn, slow) for n, fn, slow in TESTS_REGISTRY if (not only or any(w in n for w in only)) and not (a.quick and slow)]
    if not todo: print('no tests match', a.only); return 2
    from playwright.sync_api import sync_playwright
    t0 = time.time()
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='hm-tests-'))
    out = pathlib.Path(a.out) if a.out else None
    if out: out.mkdir(parents=True, exist_ok=True)
    pages = build(tmp)
    print(f'built {pages["plain"].name} and {pages["artifact"].name} in {tmp} ({time.time() - t0:.1f}s)')
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--autoplay-policy=document-user-activation-required'])
        for name, fn, slow in todo:
            env = Env(browser, pages, a.quick, out)
            t1 = time.time()
            try: fails = fn(env) or []
            except Exception as e: fails = ['test crashed: ' + ''.join(traceback.format_exception_only(type(e), e)).strip()[:600]]
            finally: env.close()
            dt = time.time() - t1
            known = [(f, d) for f in fails for k, d in KNOWN_BUGS.items() if k in f]
            real = [f for f in fails if not any(k in f for k in KNOWN_BUGS)]
            status = 'FAIL' if real else ('XFAIL' if known else 'PASS')
            print(f'{status:5s} {name} ({dt:.1f}s)')
            for f in real[:25]: print('      - ' + f)
            if len(real) > 25: print(f'      ... and {len(real) - 25} more')
            for f, d in known[:10]: print(f'      - expected failure (known bug: {d}): {f}')
            results.append((name, status))
            sys.stdout.flush()
        browser.close()
    shutil.rmtree(tmp, ignore_errors=True)
    for k, d in KNOWN_BUGS.items():
        print(f'note: known bug still listed in KNOWN_BUGS: {d}')
    bad = [n for n, s in results if s == 'FAIL']
    print(f'\n{len(results) - len(bad)}/{len(results)} passed in {time.time() - t0:.0f}s' + (f'; FAILED: {", ".join(bad)}' if bad else ''))
    if out: print('screenshots in', out)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
