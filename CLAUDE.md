# Holy Moly! — notes for working on this folder

Holy Moly! is a WarioWare-style Bible microgame collection for kids aged 5 to 11, with mainline (liberal) Christian theology: the player shares, welcomes, helps, rescues, forgives and rests, and never defeats enemies. It is one self-contained HTML page with all art drawn in code.

## Build and check
- `python3 src/build.py dist/holymoly.html` inlines every module into one page. Each module and each microgame gets its own `<script>` tag, so one broken file can't take down the rest.
- `python3 tools/mgtest.py OUT [id ...]` tests microgames headless (bot wins at level 0 and at level 2 speed 2; doing nothing fails) and writes a contact sheet per microgame. Look at the sheets after every change. `HM_ONLY=prefix_` and `HM_PAGE=path` let parallel workers test only their own files.
- `python3 tools/shots.py OUT` screenshots every engine screen (title, stage picker, intro, between, play, lost loaf, speed-up, grace, results, cards) at 360x640.
- `python3 tools/concept_shot.py OUT` renders the concept art board (docs/concept-board.png).
- `python3 tools/make_music.py` re-encodes the two music-lab tracks into src/music_tracks.js.

## Module map (src/)
| File | What it does |
|---|---|
| game.html | Page template with inline markers |
| paint.js | The art library `P`: skies, hills, water, light, plants, houses, people, animals, the shouted-command lettering, loaves |
| title.js | The animated title painting |
| engine.js | Stages, microgame registry `MG`, input, the run loop (loaves, speed-ups, grace), screens, cards, saving, test hooks `HM` |
| audio.js, music_tracks.js | Synthesized grooves, jingles and sound effects; two pre-rendered music-lab tracks |
| games/*.js | One microgame per file, `<stage>_<id>.js`; `_shared.js` holds helpers used by several |

How to write a microgame: docs/MICROGAMES.md.

## Rules the owner asked for
- Gorgeous graphics. No clutter: no explanatory subtitles, eyebrow text or long instructions.
- Skin tones: Israelites and Jesus's friends are Levantine (olive to light brown, `P.SKIN[0]`–`[3]`); Egyptians, Kushites and Pentecost crowds can use the full range.
- Women are mostly bareheaded; head coverings are a loose shawl only, never a tight face-framing veil.
- A pride flag appears in the welcoming crowd on the title screen and in the final stage's open city.
- No violence shown: skip or soften the flood's victims, the plagues, Jericho, Goliath's death; the crucifixion is never gameplay.
