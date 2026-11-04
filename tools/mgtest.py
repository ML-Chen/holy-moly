#!/usr/bin/env python3
"""Test microgames headless and make a contact sheet of frames for each.
Usage:
  python3 tools/mgtest.py OUTDIR [id ...]        # build, then test the named microgames (default: all)
  HM_NOBUILD=1 python3 tools/mgtest.py OUTDIR    # skip the build step
For each microgame it runs: the auto bot at levels 0 and 2 (should WIN), and no input at level 0 (should FAIL, or WIN if winOnTimeout).
It writes OUTDIR/<id>.jpg (frames at 0.15 s, 0.6 s, 1.6 s, 2.8 s and just after the result, plus a level-2 frame) and OUTDIR/report.txt."""
import base64, io, json, os, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/hm-mg'); out.mkdir(parents=True, exist_ok=True)
ids = sys.argv[2:]
page = pathlib.Path(os.environ.get('HM_PAGE', str(root / 'dist' / 'holymoly.html')))  # agents working in parallel should each use their own HM_PAGE
if not os.environ.get('HM_NOBUILD'):
    subprocess.run([sys.executable, str(root / 'src' / 'build.py'), str(page)], check=True)

def img(d): return Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB')

report = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 360, 'height': 640})
    errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.goto(page.as_uri() + '?test=1')
    pg.wait_for_function('window.HM && document.fonts.status==="loaded"', timeout=20000)
    pg.wait_for_timeout(400)
    allg = pg.evaluate('HM.list()')
    todo = [g for g in allg if not ids or g['id'] in ids]
    for g in todo:
        gid = g['id']
        win = pg.evaluate('id=>HM.test(id,{auto:true,level:0,frames:[0.15,0.6,1.6,2.8]})', gid)
        after = pg.evaluate('([id,t])=>HM.test(id,{auto:true,level:0,frames:[t]})', [gid, max(0.05, win['doneAt'] + 0.35)])
        hard = pg.evaluate('id=>HM.test(id,{auto:true,level:2,speed:2,frames:[1.2]})', gid)
        idle = pg.evaluate('id=>HM.test(id,{auto:false,level:0,frames:[]})', gid)
        want_idle = 'win' if g['winOnTimeout'] else 'fail'
        ok = win['result'] == 'win' and hard['result'] == 'win' and idle['result'] == want_idle
        line = f"{'OK  ' if ok else 'FAIL'} {gid:14s} {g['cmd']:12s} auto L0={win['result']}@{win['doneAt']}s/{win['dur']}s  auto L2x2={hard['result']}@{hard['doneAt']}s/{hard['dur']}s  idle={idle['result']} (want {want_idle})"
        for e in set(win['errors'] + hard['errors'] + idle['errors'] + after['errors']): line += '\n      error: ' + e[:300]
        if not g['card']: line += '\n      missing card text'
        if not g['hasAuto']: line += '\n      missing auto bot'
        report.append(line); print(line)
        frames = [img(s) for s in win['shots'] + after['shots'] + hard['shots']]
        if frames:
            fw, fh = 270, 480; sheet = Image.new('RGB', (fw * len(frames) + 8 * (len(frames) - 1), fh + 30), (42, 24, 48))
            d = ImageDraw.Draw(sheet)
            labels = ['0.15s', '0.6s', '1.6s', '2.8s', 'result', 'level 2']
            for i, f in enumerate(frames):
                sheet.paste(f.resize((fw, fh), Image.LANCZOS), (i * (fw + 8), 30)); d.text((i * (fw + 8) + 6, 8), labels[i] if i < len(labels) else '', fill=(255, 240, 220))
            sheet.save(out / f'{gid}.jpg', quality=85)
    b.close()
if errs: report.append('page errors:\n  ' + '\n  '.join(errs)); print('\n'.join(errs))
(out / 'report.txt').write_text('\n'.join(report) + '\n')
print('sheets in', out)
