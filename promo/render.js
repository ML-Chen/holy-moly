// Renders the Holy Moly! promo video: node promo/render.js dist/holymoly.html OUT [frames-only-ids]
// Same approach as Pathmakers 2040's promo: the real game is played live in headless Chromium, one 30 fps frame at a
// time on the game's own clock (test mode, HM.step), with a slow camera move on every shot and cuts on the music's bars.
// No narration and no caption text: gameplay, the game's title screen, and an end card.
// Output: OUT/holymoly-promo.mp4 (1080x1920, 30 fps), OUT/stills/<n>-<id>.jpg, OUT/contact.jpg.
// PROMO_ONLY=part,title renders only those shots (for checking frames); PROMO_STILLS=1 saves stills and skips encoding.
const {chromium} = require('playwright'); const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const [html, out = '/tmp/hm-promo'] = process.argv.slice(2);
const ROOT = path.resolve(__dirname, '..');
const BAR = 1.6, FPS = 30;
const MUSIC = process.env.PROMO_MUSIC ||   // PROMO_MUSIC=file.mp3 uses another track (cut from its start, faded at the end)
  path.join(ROOT, '..', 'music-lab', 'demos', 'edm', 'future-bass', 'paper_lanterns_v4.mp3');
const ff = (...a) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a]);
for (const d of ['segs', 'stills']) fs.mkdirSync(path.join(out, d), {recursive: true});

// Shots, in bars of 1.6 s. mg: a microgame played by its bot from `from` seconds in. Music map (after the edit below):
// 0 soft hook, 6.4 beat comes in, 19.2 quiet break and build, 32.0 drop, 51.2 outro rings out.
const SHOTS = [
  {id: 'title', title: true, first: true, bars: 2},   // the first frame is the preview image: the logo over the crowd, no flash
  {id: 'part', mg: 'part', bars: 2, from: 0},
  {id: 'share', mg: 'share', bars: 1, from: 0.7},
  {id: 'open', mg: 'open', bars: 1, from: 0.9},
  {id: 'light', mg: 'light', bars: 1, from: 0.6}, {id: 'board', mg: 'board', bars: 1, from: 0.7},
  {id: 'climb', mg: 'climb', bars: 1, from: 0.6}, {id: 'spit', mg: 'spit', bars: 1, from: 0.5},
  {id: 'dance', mg: 'dance', bars: 1, from: 1.2}, {id: 'wine', mg: 'wine', bars: 1, from: 0.9},
  {id: 'nets', mg: 'nets', bars: 1, from: 0.5}, {id: 'calm', mg: 'calm', bars: 1, from: 0.3},
  {id: 'speedup', phase: 'speedup', stage: 'exodus', bars: 1},
  {id: 'see', mg: 'see', bars: 1, from: 0.9}, {id: 'glean', mg: 'glean', bars: 1, from: 1.0},
  {id: 'grace', phase: 'grace', stage: 'jesus', bars: 2},
  {id: 'drop', mg: 'drop', bars: 1, from: 0.5},
  // the drop
  {id: 'rainbow', mg: 'rainbow', bars: 1, from: 0.9}, {id: 'welcome', mg: 'welcome', bars: 1, from: 0.6},
  {id: 'forgive', mg: 'forgive', bars: 1, from: 0.3}, {id: 'splash', mg: 'splash', bars: 1, from: 0.9},
  {id: 'palms', mg: 'palms', bars: 1, from: 0.2}, {id: 'feast', mg: 'feast', bars: 1, from: 0.6},
  {id: 'wipe', mg: 'wipe', bars: 1, from: 0.5}, {id: 'roll', mg: 'roll', bars: 1, from: 0.1},
  {id: 'card', card: 'part', bars: 2},
  {id: 'follow', mg: 'follow', bars: 1, from: 0.7}, {id: 'pray', mg: 'pray', bars: 1, from: 2.0}, {id: 'seed', mg: 'seed', bars: 1, from: 0.6},
  {id: 'end', end: true, bars: 4.5},
];
const ONLY = (process.env.PROMO_ONLY || '').split(',').filter(Boolean);
// a slow camera move per shot: [scale from, scale to, x from, x to, y from, y to] as fractions of the frame
const CAMS = [[1.0, 1.08, 0, 0, 0, -0.01], [1.1, 1.02, -0.02, 0.01, 0, 0], [1.03, 1.12, 0.01, -0.01, 0.01, -0.01], [1.12, 1.04, 0.02, -0.01, -0.01, 0.01], [1.05, 1.1, 0, 0, 0.015, -0.01]];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport: {width: 360, height: 640}, deviceScaleFactor: 3});
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { let s = 12345; Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; try { localStorage.clear(); } catch (e) {} });
  await p.goto('file://' + path.resolve(html) + '?test=1'); await p.waitForFunction('window.HM && HM.ready && document.fonts.status === "loaded"', null, {timeout: 20000});
  await p.waitForTimeout(300);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setDeviceMetricsOverride', {width: 360, height: 640, deviceScaleFactor: 3, mobile: false});
  // helpers inside the page: shot setup, per-frame step with camera, and the title/end drawings
  await p.evaluate(() => {
    const cvs = document.getElementById('game'); cvs.style.transformOrigin = '50% 50%';
    backIcon = () => {};   // no back button in the video
    hintIcon = () => {};   // the game's "which input" hint looks like a cursor in a video, so it is hidden; a finger shows the bot's real touches instead
    // the finger: record every touch the test bot makes, and draw a fingertip that glides to it
    const F = window.PRF = {x: 180, y: 420, tx: 180, ty: 420, down: false, last: -9, ripples: [], streak: null};
    const orig = synth;
    synth = (type, ...a) => {
      const now = PR.t;
      if (type === 'down' || type === 'move') { F.tx = a[0]; F.ty = a[1]; if (type === 'down') { if (now - F.last > 0.5) { F.x = a[0]; F.y = a[1]; } F.down = true; F.ripples.push({x: a[0], y: a[1], t: now}); } F.last = now; }
      if (type === 'up') { F.down = false; F.last = now; }
      if (type === 'swipe' && now - F.last > 0.2) { const x0 = 180 - a[0] / 2, y0 = 430 - a[1] / 2; F.streak = {x0, y0, x1: x0 + a[0], y1: y0 + a[1], t: now}; F.last = now; }
      return orig(type, ...a);
    };
    window.PRfinger = (c, t) => {
      F.x += (F.tx - F.x) * 0.45; F.y += (F.ty - F.y) * 0.45;
      for (const r of F.ripples) { const k = (t - r.t) / 0.45; if (k < 0 || k > 1) continue; c.strokeStyle = `rgba(255,255,255,${0.85 * (1 - k)})`; c.lineWidth = 3; c.beginPath(); c.arc(r.x, r.y, 10 + k * 26, 0, 7); c.stroke(); }
      F.ripples = F.ripples.filter(r => t - r.t < 0.5);
      if (F.streak) { const k = (t - F.streak.t) / 0.35; if (k > 1.4) F.streak = null; else { const e = Math.min(1, k), sx = F.streak.x0 + (F.streak.x1 - F.streak.x0) * e, sy = F.streak.y0 + (F.streak.y1 - F.streak.y0) * e;
        c.strokeStyle = `rgba(255,255,255,${0.6 * Math.max(0, 1.4 - k)})`; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(F.streak.x0, F.streak.y0); c.lineTo(sx, sy); c.stroke(); F.x = sx; F.y = sy; F.tx = sx; F.ty = sy; F.last = t; } }
      const vis = F.down ? 1 : Math.max(0, 1 - (t - F.last) / 0.6); if (vis <= 0) return;
      c.save(); c.globalAlpha = vis; const r = F.down ? 15 : 18;
      c.fillStyle = 'rgba(30,10,40,0.25)'; c.beginPath(); c.arc(F.x + 2, F.y + 4, r, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.72)'; c.strokeStyle = 'rgba(58,22,64,0.85)'; c.lineWidth = 2.5; c.beginPath(); c.arc(F.x, F.y, r, 0, 7); c.fill(); c.stroke();
      c.restore();
    };
    window.PR = {
      setup(s) {
        FX.clear(); window.HM_AUTO = false; CV.list = null; run = null;
        if (s.mg) { const d = MG.byId[s.mg]; startRun(d.stage); run.list = [d]; run.i = 0; window.HM_AUTO = true; nextMicro(); A.call = () => 0; HM.step(Math.round(s.from * 30), 1 / 30); PRF.down = false; PRF.last = -9; PRF.ripples = []; }
        else if (s.phase) { startRun(s.stage); run.i = s.phase === 'speedup' ? 8 : 6; run.loaves = s.phase === 'grace' ? 0 : 3; run.speed = 1.5; run.bpm = 140; run.phase = s.phase; run.pt = 0; run.lostLoafAt = -9; }
        else if (s.card) { scene = 'cards'; Object.keys(MG.byId).forEach(k => SAVE.d.cards[k] = 1); openCards([MG.byId[s.card]], 0, 'reward'); }
        else if (s.title || s.end) { scene = 'promo'; }
        PR.s = s; PR.t = 0; Object.assign(PRF, {down: false, last: -9, ripples: [], streak: null});
      },
      frame(dt, cam, D) {
        const s = PR.s; PR.t += dt; const k = Math.min(1, PR.t / D), e = k * k * (3 - 2 * k);
        const sc = cam[0] + (cam[1] - cam[0]) * e, x = (cam[2] + (cam[3] - cam[2]) * e) * 100, y = (cam[4] + (cam[5] - cam[4]) * e) * 100;
        cvs.style.transform = `translate(${x}%,${y}%) scale(${sc})`;
        // a microgame shot holds on its winning moment instead of moving on to the loaves screen
        if (s.mg && run && run.g && run.g.done) { run.phase = 'play'; run.g.doneAt = Math.max(run.g.doneAt, run.g.t - 0.5); }
        HM.step(1, dt);
        if (s.title || s.end) PR.paint(s, PR.t);
        else if (s.mg) { const c = cvs.getContext('2d'); c.setTransform(scale * DPR, 0, 0, scale * DPR, offX * DPR, offY * DPR); PRfinger(c, PR.t); }
      },
      paint(s, t) {
        const c = document.getElementById('game').getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0);
        c.setTransform(scale * DPR, 0, 0, scale * DPR, offX * DPR, offY * DPR); PANEL_TITLE(c, T);
        if (s.end) {
          const a = Math.min(1, Math.max(0, (t - 0.8) / 0.8));
          c.save(); c.globalAlpha = a; c.font = '800 17px Nunito, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillStyle = 'rgba(40,16,48,0.5)'; roundRect(c, 46, 286, 268, 40, 20); c.fill(); c.fillStyle = '#fff6dc'; c.fillText('ml-chen.github.io/holy-moly', 180, 307); c.restore();
          if (t > 3.6) { c.fillStyle = `rgba(20,8,24,${Math.min(1, (t - 3.6) / 3.6)})`; c.fillRect(0, 0, 360, 640); }
        }
        if (t < 0.25 && !s.first) { c.fillStyle = `rgba(255,250,235,${1 - t / 0.25})`; c.fillRect(0, 0, 360, 640); }   // a white flash on the cut
      },
    };
  });
  const segs = []; let total = 0;
  for (const [n, s] of SHOTS.entries()) {
    const D = s.bars * BAR, N = Math.round(D * FPS);
    if (ONLY.length && !ONLY.includes(s.id)) { total += D; continue; }
    await p.evaluate(s => PR.setup(s), s);
    const dir = path.join(out, 'frames', String(n).padStart(2, '0')); fs.rmSync(dir, {recursive: true, force: true}); fs.mkdirSync(dir, {recursive: true});
    const cam = CAMS[n % CAMS.length];
    for (let f = 0; f < N; f++) {
      await p.evaluate(([dt, cam, D]) => PR.frame(dt, cam, D), [1 / FPS, cam, D]);
      const shot = await cdp.send('Page.captureScreenshot', {format: 'jpeg', quality: 92, optimizeForSpeed: true});
      const file = path.join(dir, String(f).padStart(5, '0') + '.jpg'); fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
      if (f === Math.round(N * 0.55)) fs.copyFileSync(file, path.join(out, 'stills', `${String(n + 1).padStart(2, '0')}-${s.id}.jpg`));
    }
    if (process.env.PROMO_STILLS) { console.log(`${s.id}: stills only`); continue; }
    const seg = path.join(out, 'segs', `${String(n).padStart(2, '0')}.mp4`), tmp = seg.replace(/\.mp4$/, '.tmp.mp4');
    ff('-framerate', String(FPS), '-i', path.join(dir, '%05d.jpg'), '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p,setsar=1', '-frames:v', String(N),
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-r', String(FPS), '-an', tmp);
    fs.renameSync(tmp, seg); fs.rmSync(dir, {recursive: true, force: true});
    segs.push(seg); total += D; console.log(`${s.id}: ${D.toFixed(1)} s`);
  }
  await b.close();
  fs.writeFileSync(path.join(out, 'errors.txt'), errs.join('\n'));
  if (process.env.PROMO_STILLS || ONLY.length) { console.log('errors:', errs.join('; ') || 'none'); return; }
  // join the shots (hard cuts on the bars), then the music: Paper Lanterns, track 6.4-51.2 s then 57.6 s to the end
  const list = path.join(out, 'segs.txt'); fs.writeFileSync(list, segs.map(f => `file '${f}'`).join('\n'));
  const video = path.join(out, 'video.mp4'); ff('-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video);
  const final = path.join(out, 'holymoly-promo.mp4');
  // Paper Lanterns is edited (track 6.4-51.2 s, then 57.6 s on); any other track (PROMO_MUSIC) plays from its start
  const edit = process.env.PROMO_MUSIC ? `[1:a]anull[m]` : `[1:a]atrim=6.4:51.2,asetpts=PTS-STARTPTS[a1];[1:a]atrim=57.6,asetpts=PTS-STARTPTS[a2];[a1][a2]concat=n=2:v=0:a=1[m]`;
  ff('-i', video, '-i', MUSIC, '-filter_complex',
     `${edit};[m]afade=t=in:d=0.05,afade=t=out:st=${(total - 2).toFixed(2)}:d=2,volume=0.9[a]`,
     '-map', '0:v', '-map', '[a]', '-t', total.toFixed(3), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', final);
  const st = fs.readdirSync(path.join(out, 'stills')).filter(f => f.endsWith('.jpg')).sort().map(f => path.join(out, 'stills', f));
  ff(...st.flatMap(f => ['-i', f]), '-filter_complex', st.map((_, i) => `[${i}:v]scale=216:384[s${i}]`).join(';') + ';' + st.map((_, i) => `[s${i}]`).join('') +
     `xstack=inputs=${st.length}:layout=${st.map((_, i) => `${(i % 10) * 216}_${Math.floor(i / 10) * 384}`).join('|')}:fill=black`, '-frames:v', '1', path.join(out, 'contact.jpg'));
  console.log(`${final}: ${total.toFixed(1)} s; errors: ${errs.join('; ') || 'none'}`);
})();
