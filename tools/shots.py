#!/usr/bin/env python3
"""Screenshot every engine screen at phone size (360x640) and make a contact sheet.
Usage: python3 tools/shots.py OUTDIR   (builds dist/holymoly.html first unless HM_NOBUILD=1)"""
import os, pathlib, subprocess, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/hm-shots'); out.mkdir(parents=True, exist_ok=True)
page = pathlib.Path(os.environ.get('HM_PAGE', str(root / 'dist' / 'holymoly.html')))
if not os.environ.get('HM_NOBUILD'):
    subprocess.run([sys.executable, str(root / 'src' / 'build.py'), str(page)], check=True)
shots = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 360, 'height': 640}, device_scale_factor=2)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(page.as_uri() + '?test=1'); pg.wait_for_function('window.HM && document.fonts.status==="loaded"', timeout=20000); pg.wait_for_timeout(300)
    def snap(name):
        f = out / f'{name}.png'; pg.screenshot(path=str(f)); shots.append((name, f))
    pg.evaluate('HM.step(60)'); snap('title')
    pg.evaluate("HM.goto('stages'); HM.step(30)"); snap('stages')
    stage = pg.evaluate("HM.list()[0].stage")
    pg.evaluate(f"HM.goto('run','{stage}'); HM.step(40)"); snap('intro')
    pg.evaluate("HM.step(150)"); snap('between')
    pg.evaluate("HM.step(80)"); snap('play')
    # lose all loaves quickly to see grace and game over
    seen_speed = False
    for i in range(400):
        st = pg.evaluate('HM.state()')
        if st['phase'] == 'grace': break
        if st['phase'] == 'speedup' and not seen_speed: pg.evaluate('HM.step(20)'); snap('speedup'); seen_speed = True
        if st['phase'] == 'result' and st['loaves'] < 4 and not any(n == 'lost' for n, _ in shots): pg.evaluate('HM.step(60)'); snap('lost')
        pg.evaluate('HM.step(30)')
    pg.evaluate("HM.step(130)"); snap('grace')
    for i in range(400):
        if pg.evaluate('HM.state()')['phase'] == 'over': break
        pg.evaluate('HM.step(30)')
    pg.evaluate("HM.step(60)"); snap('over')
    pg.evaluate("HM.goto('cards'); HM.step(10)"); snap('cards')
    b.close()
fw, fh = 270, 480; sheet = Image.new('RGB', (len(shots) * (fw + 8), fh + 28), (42, 24, 48)); d = ImageDraw.Draw(sheet)
for i, (n, f) in enumerate(shots):
    sheet.paste(Image.open(f).convert('RGB').resize((fw, fh), Image.LANCZOS), (i * (fw + 8), 28)); d.text((i * (fw + 8) + 6, 8), n, fill=(255, 240, 220))
sheet.save(out / 'sheet.jpg', quality=85)
(out / 'errors.txt').write_text('\n'.join(errs)); print('errors:', errs[:10]); print(out / 'sheet.jpg')
