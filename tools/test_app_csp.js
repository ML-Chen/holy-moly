// Loads the game the way the Android app serves it: same fake HTTPS address, the exact Content-Security-Policy
// from MainActivity.java, and every other address blocked. Checks that the title screen draws, a tap reaches the
// stage picker, a microgame runs, the save lands in localStorage and survives a reload, and that there are no page
// errors, CSP violations or network requests.
//
//   node tools/test_app_csp.js dist/holymoly.html [screenshot-dir]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const csp = fs.readFileSync(path.join(__dirname, '..', 'android', 'src', 'app', 'holymoly', 'MainActivity.java'), 'utf8')
  .match(/CONTENT_SECURITY_POLICY =\s*([\s\S]*?);\n/)[1].split('\n').map(l => (l.match(/"([^"]*)"/) || [])[1] || '').join('');
const page = fs.readFileSync(process.argv[2]);
const shots = process.argv[3];
const ORIGIN = 'https://appassets.androidplatform.net';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [], blocked = [];
  await ctx.route('**/*', r => {
    const u = new URL(r.request().url());
    if (u.protocol === 'https:' && u.host === 'appassets.androidplatform.net') {
      if (u.pathname === '/' || u.pathname === '/index.html') {
        return r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', headers: { 'Content-Security-Policy': csp, 'Cache-Control': 'no-store' }, body: page });
      }
      blocked.push(u.href); return r.fulfill({ status: 404, body: '' });
    }
    blocked.push(u.href); return r.abort();
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' || /Content Security Policy|Refused/.test(m.text())) errors.push(m.type() + ': ' + m.text().slice(0, 200)); });
  await p.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });

  await p.goto(ORIGIN + '/index.html');
  await p.waitForFunction(() => window.HM && document.fonts.status === 'loaded', null, { timeout: 30000 });
  await p.waitForTimeout(1500);
  const fonts = await p.evaluate(() => document.fonts.check('700 40px Fredoka') && document.fonts.check('800 20px Nunito'));
  // The title is drawn on the canvas: check it is not blank (many distinct colours in the middle of the screen).
  const painted = await p.evaluate(() => {
    const c = document.getElementById('game'), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data, seen = new Set();
    for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4));
    return seen.size;
  });
  if (shots) { fs.mkdirSync(shots, { recursive: true }); await p.screenshot({ path: path.join(shots, 'app-title.png') }); }

  // Tap PLAY (the engine's button at logical 180,300), which starts the music and opens the stage picker.
  const box = await p.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const sc = Math.min(box.w / 360, box.h / 640), ox = box.x + (box.w - 360 * sc) / 2, oy = box.y + (box.h - 640 * sc) / 2;
  await p.mouse.click(ox + 180 * sc, oy + 300 * sc);
  await p.waitForTimeout(1200);
  const scene = (await p.evaluate(() => HM.state())).scene;
  if (shots) await p.screenshot({ path: path.join(shots, 'app-stages.png') });

  // Play one microgame through the test hook, then write the save through the game's own code path.
  const list = await p.evaluate(() => HM.list());
  const first = list.find(g => g.hasAuto) || list[0];
  const result = first ? await p.evaluate(id => { const r = HM.test(id, { level: 0, speed: 1, auto: true }); return r && r.result; }, first.id) : 'no microgames';
  await p.evaluate(() => { SAVE.d.cards.__csp_test = 1; SAVE.save(); });
  const saved = await p.evaluate(() => { try { return JSON.parse(localStorage.getItem('holymoly1') || 'null'); } catch (e) { return null; } });
  await p.reload(); await p.waitForFunction(() => window.HM, null, { timeout: 30000 });
  const kept = await p.evaluate(() => !!(SAVE.d.cards && SAVE.d.cards.__csp_test));
  const violations = await p.evaluate(() => window.__csp);

  console.log('CSP:', csp);
  console.log('fonts loaded from data: URLs:', fonts);
  console.log('title canvas colours sampled:', painted);
  console.log('after tapping PLAY, scene =', scene);
  console.log('microgame', first && first.id, 'result:', result);
  console.log('save written to localStorage holymoly1:', !!(saved && saved.cards && saved.cards.__csp_test), '| kept after reload:', kept);
  console.log('network requests blocked or outside the app address:', blocked.length ? blocked : 'none');
  console.log('CSP violation events:', violations.length ? violations : 'none');
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors or CSP violations');
  await browser.close();
  const ok = !errors.length && !violations.length && !blocked.length && fonts && painted > 20 && scene === 'stages' && kept;
  process.exit(ok ? 0 : 1);
})();
