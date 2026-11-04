#!/usr/bin/env python3
"""Render the Holy Moly! concept art board and each panel to PNG.
Usage: python3 tools/concept_shot.py OUTDIR [t]"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/hm-concept'); out.mkdir(parents=True, exist_ok=True)
t = float(sys.argv[2]) if len(sys.argv) > 2 else 1.3
src = root / 'src'
html = f"""<!doctype html><html><head><meta charset=utf-8><style>
@font-face{{font-family:Fredoka;src:url('file://{src}/fredoka.woff');font-weight:300 700}}
@font-face{{font-family:Nunito;src:url('file://{src}/nunito.woff');font-weight:200 1000}}
body{{margin:0;background:#2a1a30}}canvas{{display:block}}</style></head><body>
<canvas id=c></canvas>
<script>{(src / 'paint.js').read_text()}</script>
<script>{(root / 'tools' / 'concept.js').read_text()}</script>
<script>
async function go(){{
  await document.fonts.load('700 40px Fredoka'); await document.fonts.load('800 20px Nunito');
  const D=2, names=Object.keys(PANELS), cols=3, BW=1080, BH=1280+300+170;
  const c=document.getElementById('c'); c.width=BW*D; c.height=BH*D; const ctx=c.getContext('2d'); ctx.scale(D,D);
  ctx.fillStyle='#2a1a30'; ctx.fillRect(0,0,BW,BH);
  names.forEach((n,i)=>{{ctx.save();ctx.translate((i%cols)*360,Math.floor(i/cols)*640);ctx.beginPath();ctx.rect(0,0,360,640);ctx.clip();PANELS[n](ctx,{t});ctx.restore();}});
  ctx.save(); ctx.translate(0,1280); const zoo=lineup(ctx,{t}); ctx.restore();
  ctx.save(); ctx.translate(0,1580); const g=ctx.createLinearGradient(0,0,0,170); g.addColorStop(0,'#f6d9b4'); g.addColorStop(1,'#e9c08e'); ctx.fillStyle=g; ctx.fillRect(0,0,1080,170);
  zoo.forEach(([k,s],i)=>{{const x=60+i*118; P[k](ctx,x,140,s*1.6,{{t:{t},flying:false}}); }}); ctx.restore();
  window.done=true;
}}
go();
</script></body></html>"""
page_path = out / 'board.html'; page_path.write_text(html)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1750})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto(page_path.as_uri()); pg.wait_for_function('window.done===true', timeout=20000)
    data = pg.evaluate("document.getElementById('c').toDataURL('image/png')")
    import base64; (out / 'board.png').write_bytes(base64.b64decode(data.split(',')[1]))
    b.close()
print('errors:', errs)
print(out / 'board.png')
