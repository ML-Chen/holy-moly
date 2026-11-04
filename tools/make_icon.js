// Renders the Android launcher icons from the game's own painted art (src/paint.js, used read-only):
// a smiling golden loaf with the grace dove above it, on a warm sunset with soft rays.
//
//   node tools/make_icon.js [android/res]
//
// Writes, for every density (mdpi … xxxhdpi):
//   mipmap-*/ic_launcher.png             legacy square icon with rounded corners (48 dp)
//   mipmap-*/ic_launcher_round.png       legacy round icon (48 dp)
//   mipmap-*/ic_launcher_foreground.png  adaptive-icon foreground, loaf and dove on transparent (108 dp)
//   mipmap-*/ic_launcher_background.png  adaptive-icon background, the sunset (108 dp)
// plus mipmap-anydpi-v26/ic_launcher.xml and ic_launcher_round.xml, which tell Android 8+ to combine the two layers.
// Needs: npm i playwright (Chromium). Look at the PNGs after running it.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'android', 'res'));
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<!doctype html><meta charset="utf-8"><body></body>');
  await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, 'src', 'paint.js'), 'utf8') + '\nwindow.P = P;' });
  await page.waitForFunction(() => window.P && typeof P.loaf === 'function' && typeof P.dove === 'function');

  const render = (kind, px) => page.evaluate(([kind, px]) => {
    const c = document.createElement('canvas'); c.width = c.height = px; const x = c.getContext('2d');
    // All art is laid out on a 108-unit square (the adaptive-icon grid); legacy icons crop to the middle 72 units
    // (what a launcher shows of an adaptive icon), so the art is the same size relative to the visible shape.
    const legacy = kind === 'legacy' || kind === 'round';
    const k = legacy ? px / 72 : px / 108; x.scale(k, k); if (legacy) x.translate(-18, -18);
    const background = () => {
      const g = x.createLinearGradient(0, 0, 0, 108);
      g.addColorStop(0, '#f2789a'); g.addColorStop(0.45, '#ffa86a'); g.addColorStop(0.8, '#ffd88a'); g.addColorStop(1, '#fff0c0');
      x.fillStyle = g; x.fillRect(0, 0, 108, 108);
      // a warm glow behind the loaf, and soft rays coming from it
      const glow = x.createRadialGradient(54, 62, 2, 54, 62, 46);
      glow.addColorStop(0, 'rgba(255,250,220,0.95)'); glow.addColorStop(0.45, 'rgba(255,236,180,0.45)'); glow.addColorStop(1, 'rgba(255,236,180,0)');
      x.fillStyle = glow; x.fillRect(0, 0, 108, 108);
      x.save(); x.translate(54, 62); x.fillStyle = 'rgba(255,246,210,0.22)';
      for (let i = 0; i < 12; i++) { x.rotate(Math.PI / 6); x.beginPath(); x.moveTo(0, 0); x.lineTo(-6, -80); x.lineTo(6, -80); x.closePath(); x.fill(); }
      x.restore();
    };
    const foreground = () => {
      // soft shadow under the loaf
      x.fillStyle = 'rgba(110,40,30,0.22)'; x.beginPath(); x.ellipse(54, 77, 22, 4.5, 0, 0, 7); x.fill();
      // the loaf (P.loaf is 28 x 18 units at scale 1)
      const s = 1.75; P.loaf(x, 54, 63, s);
      // a happy face on the lower half of the loaf, below the score marks
      P.eye(x, 47.5, 67.5, 2.1); P.eye(x, 60.5, 67.5, 2.1);
      P.blush(x, 43, 71.5, 2.6); P.blush(x, 65, 71.5, 2.6);
      x.strokeStyle = '#5a2414'; x.lineWidth = 1.5; x.lineCap = 'round';
      x.beginPath(); x.arc(54, 69.5, 3.6, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
      // the grace dove flying in above, with an olive branch
      P.dove(x, 52, 39, 0.62, { t: 0.25, branch: true }); // wings mid-beat, inside the 66-unit safe circle
    };
    if (kind === 'background') background();
    else if (kind === 'foreground') foreground();
    else {
      x.save(); x.beginPath();
      if (kind === 'round') x.arc(54, 54, 36, 0, 7);
      else { const r = 9, a = 19, b = 89; x.moveTo(a + r, a); x.arcTo(b, a, b, b, r); x.arcTo(b, b, a, b, r); x.arcTo(a, b, a, a, r); x.arcTo(a, a, b, a, r); x.closePath(); }
      x.clip(); background(); foreground(); x.restore();
    }
    return c.toDataURL('image/png').split(',')[1];
  }, [kind, px]);

  for (const [name, d] of Object.entries(DENSITIES)) {
    const dir = path.join(OUT, 'mipmap-' + name); fs.mkdirSync(dir, { recursive: true });
    const files = { ic_launcher: ['legacy', 48], ic_launcher_round: ['round', 48], ic_launcher_foreground: ['foreground', 108], ic_launcher_background: ['background', 108] };
    for (const [file, [kind, dp]] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, file + '.png'), Buffer.from(await render(kind, Math.round(dp * d)), 'base64'));
    }
  }
  const anydpi = path.join(OUT, 'mipmap-anydpi-v26'); fs.mkdirSync(anydpi, { recursive: true });
  const xml = '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
    + '    <background android:drawable="@mipmap/ic_launcher_background" />\n'
    + '    <foreground android:drawable="@mipmap/ic_launcher_foreground" />\n</adaptive-icon>\n';
  fs.writeFileSync(path.join(anydpi, 'ic_launcher.xml'), xml);
  fs.writeFileSync(path.join(anydpi, 'ic_launcher_round.xml'), xml);
  await browser.close();
  console.log('wrote launcher icons to', OUT);
})();
