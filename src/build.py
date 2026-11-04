#!/usr/bin/env python3
"""Build Holy Moly! into one self-contained HTML page.
Usage: python3 src/build.py dist/holymoly.html"""
import base64, glob, os, sys
here = os.path.dirname(os.path.abspath(__file__))
rd = lambda f: open(os.path.join(here, f), encoding='utf-8').read() if os.path.exists(os.path.join(here, f)) else ''
b64 = lambda f: base64.b64encode(open(os.path.join(here, f), 'rb').read()).decode()
def game_src(f):  # each microgame file gets its own scope; files starting with '_' are shared helpers and stay global
    src = open(f, encoding='utf-8').read(); name = os.path.basename(f)
    return f'<script>\n// ---- {name} ----\n' + (src if name.startswith('_') else '(() => {\n' + src + '\n})();') + '\n</script>'
# HM_ONLY=prefix1,prefix2 builds only the microgame files whose names start with one of the prefixes (shared '_' files are always kept)
only = [p for p in os.environ.get('HM_ONLY', '').split(',') if p]
files = [f for f in sorted(glob.glob(os.path.join(here, 'games', '*.js'))) if not only or os.path.basename(f).startswith('_') or any(os.path.basename(f).startswith(p) for p in only)]
games = '\n'.join(game_src(f) for f in files)
t = rd('game.html')
for k, v in {'/*@@FREDOKA@@*/': b64('fredoka.woff'), '/*@@NUNITO@@*/': b64('nunito.woff'), '//@@PAINT@@': rd('paint.js'), '//@@TITLE@@': rd('title.js'),
             '//@@MUSIC@@': rd('music_tracks.js'), '//@@AUDIO@@': rd('audio.js'), '//@@ENGINE@@': rd('engine.js'), '<!--@@GAMES@@-->': games}.items():
    t = t.replace(k, v)
if os.environ.get('HM_ARTIFACT'):  # the Artifact host adds its own doctype/html/head/body skeleton
    import re
    t = re.sub(r'(?is)<!doctype html>\s*<html[^>]*>\s*<head>', '', t, count=1)
    t = re.sub(r'(?is)<meta charset="utf-8">\s*<meta name="viewport"[^>]*>', '', t, count=1)
    t = t.replace('</head><body>', '', 1).replace('</body></html>', '')
    t = t.replace('canvas{display:block;touch-action:none}', 'canvas{display:block;touch-action:none;position:fixed;inset:0}:root{color-scheme:dark}')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '..', 'dist', 'holymoly.html')
open(out, 'w', encoding='utf-8').write(t)
print('wrote', out, len(t) // 1024, 'KB')
