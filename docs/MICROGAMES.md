# Writing a Holy Moly! microgame

Holy Moly! is a WarioWare-style game for kids aged 5 to 11. Each microgame lasts about 3 to 6 seconds, shows one shouted command ("SHARE!"), and asks for one simple action. The game teaches mainline Christian theology through what the player does: the player shares, welcomes, helps, rescues, forgives and rests, and never defeats enemies.

Read the rules below, then copy the pattern of the two reference microgames: `src/games/ark_board.js` (drag) and `src/games/family_see.js` (tap). The art library is `src/paint.js` (global `P`); read it before drawing anything.

## File and naming

- One microgame per file: `src/games/<stage>_<id>.js`, for example `src/games/exodus_part.js`. Each file is wrapped in its own scope by the build, so helper functions and constants inside it are private. Name helpers freely.
- Helpers shared between microgames go in a file whose name starts with `_`, which stays global. Do not edit `_shared.js` (it holds `ARK`, `drawAnimal` and `ANIMAL_SOUND`); use what it offers.
- Engine globals you may use: `W` (360), `H` (640), `P` (art library), `drawStar(c, x, y, r, rot)`, `roundRect(c, x, y, w, h, r)`.

## The contract

```js
MG.add({
  id: 'part',            // unique, lowercase
  stage: 'exodus',       // creation | ark | family | exodus | brave | exile | baby | jesus | parables | easter | acts | new
  cmd: 'PART!',          // the shouted command, ALL CAPS, one or two words, ending in "!"
  hint: 'swipe',         // input icon for kids who can't read yet: tap | mash | swipe | drag | hold | still
  time: 5,               // seconds at speed 1 (the engine shortens it as the game speeds up). 4–6 is typical.
  mood: 'sea',           // backing groove: bright | desert | sea | night | storm | party
  winOnTimeout: false,   // true only for "survive until the end" games (REST!, STEP!)
  winText: 'Free!',      // optional word shown on success (default "Yes!"); failText optional (default "Oops!")
  card: { title, ref, kind, text, ask },   // the story card (see below)
  init(g) {},            // set up state on g.s (a fresh object each time). Use g.level (0, 1, 2) for difficulty.
  update(g, dt) {},      // advance animations; call g.win() or g.fail() when the outcome is decided
  draw(g, c) {},         // paint the whole 360x640 screen every frame (bake the static background, see below)
  down(g, x, y) {}, move(g, x, y) {}, up(g, x, y) {}, swipe(g, dx, dy, vx, vy) {},   // input in logical coordinates
  auto(g, dt, synth) {}, // REQUIRED test bot: plays the game well by calling synth('down', x, y), synth('move', x, y), synth('up', x, y), synth('swipe', dx, dy, vx, vy)
});
```

The `g` object: `g.t` seconds since start, `g.dur` total seconds, `g.left()`, `g.level` 0–2, `g.speed` 1–2 (multiply movement speeds by it if you like), `g.done`, `g.result` ('win' | 'fail'), `g.doneAt`, `g.s` your state, `g.ptr` ({x, y, down}), `g.win()`, `g.fail()`, `g.sfx(name)`, `g.burst(x, y, colors, n, speed)`, `g.float(text, x, y)`, `g.shake(amount, seconds)`, `g.bake(key, drawFn)`.

- After `g.win()` or `g.fail()` the engine keeps calling `update` and `draw` for 0.75 s, so show a reaction (characters cheer, water splashes, animals hop). Input stops after the result.
- If time runs out the engine calls `g.fail()` (or `g.win()` when `winOnTimeout`). Decide early wins with `g.win()` as soon as the goal is met.
- The engine draws the command banner, the input hint icon and the fuse timer over your game in the first 1.25 s and at the bottom (y ≈ 610–634). Keep the key interaction away from the very bottom 40 px, and expect the banner over the middle (y ≈ 200–360) for the first second; the player can still act then.
- **Background**: paint static scenery once with `c.drawImage(g.bake('<id>_bg', o => { ...paint with o... }), 0, 0, W, H)`. Draw animated things on top every frame. Finish with `P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);`.
- Sounds: `g.sfx(name)` with names like tap, pop, whoosh, swoosh, splash, drip, bubble, chime, sparkle, ding, boing, thud, coin, sweep, rustle, crunch, munch, slurp, baa, coo, roar, honk, meow, bray, moo, ribbit, tweet, buzz, quack, drum, tambourine, harp, trumpet, horn, bell, clap, cheer, laugh, rumble, wind, rain, thunder, wave, fire, magic, stretch, snap, click, fail, wrong, grow, shrink, flap, stomp, splashbig. Play sounds on meaningful moments, not every frame.

## Fun rules

1. One verb, understood in two seconds by a five-year-old, with an obvious target (glow, pulse, sparkle).
2. Juicy feedback on every correct action: sound, particles, a bounce, a character reacting.
3. A five-year-old should win level 0 about 80% of the time; level 2 should be a real challenge for a ten-year-old. Difficulty grows with `g.level` (more items, faster movement, smaller targets) and with `g.speed`.
4. Failure is funny, never shameful or scary.
5. Wrong taps cost time, not the game, unless the game is about precision.
6. Characters are cute and expressive; animals are friendly (lions are cuddly).
7. No text on screen besides the command (the engine draws it). No instructions, labels, subtitles or score.

## Theology rules

- The core verbs are kindness verbs. Nobody is hurt; enemies are not defeated. God is never the player's weapon.
- Outsiders are heroes: women, foreigners, poor people, children.
- Mercy wins: when the player expects punishment, mercy comes instead.
- People of the Bible were Levantine: use skin tones `P.SKIN[0]`–`P.SKIN[3]` for Israelites and Jesus's friends. Egyptians, Kushites and Pentecost crowds can use the full range. Jesus is a Jewish man from Galilee (`P.SKIN[3]`, dark hair, beard).
- Women's head coverings: most women are bareheaded (`hairStyle: 'long' | 'curly' | 'bun'`). Use the loose shawl (`head: 'scarf'`) only occasionally (Mary, an older woman). Never draw tight face-framing veils.
- Show diversity in crowds. Include the pride flag (`P.prideFlag`) only where told to.

## Story cards

Every microgame needs a card, shown when the player first wins it:

```js
card: {
  title: 'The God who sees',                 // 2–5 words
  ref: 'Genesis 16 and 21',                  // Bible reference
  kind: 'Story',                             // Story | Poem | Parable | Song | Vision | Letter
  text: 'Two plain sentences a 7-year-old can follow, retelling the story and its point.',
  ask: 'One question for a family to talk about, connected to the child\'s life.',
}
```

Write sentences that each make sense on their own. No slogans, no "It's not X, it's Y", no preachiness. Get the facts right; if a detail is uncertain, leave it out.

## Testing (required before you report back)

```
S=/tmp/claude-0/-home-claude/0168697c-cede-5f46-9f67-50f31250450a/scratchpad
cd /home/claude/oct-2026-dump/holy-moly
HM_ONLY=<stage>_ HM_PAGE=$S/<yourname>.html python3 tools/mgtest.py $S/mg-<yourname> [id ...]
```

`HM_ONLY` limits the build to your files so other people's work in progress can't break your test; `HM_PAGE` keeps your build separate. The report must show `OK` for every microgame: the auto bot wins at level 0 and at level 2 with speed 2, and doing nothing fails (or wins for `winOnTimeout` games). Then **open every contact sheet image** (`$S/mg-<yourname>/<id>.jpg`) with the Read tool and look at it critically: is the scene gorgeous, readable, cute, uncluttered, and is the target obvious? Fix and re-test until it is. `node --check src/games/<file>.js` catches syntax errors fast.
