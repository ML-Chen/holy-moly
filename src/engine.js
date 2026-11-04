// engine.js — the Holy Moly! microgame engine: screens, input, the microgame loop, lives (loaves), grace, cards and saving.
// Microgames register themselves with MG.add({...}); see docs/MICROGAMES.md for the full contract.
const W = 360, H = 640;
const A = { // safe audio wrapper: the game works silently if audio.js is missing or fails
  call(fn, ...a) { try { if (typeof AUD !== 'undefined' && AUD[fn]) return AUD[fn](...a); } catch (e) { console.warn('audio', fn, e); } return 0; },
  sfx(n, o) { return A.call('sfx', n, o); }, jingle(n, s) { return A.call('jingle', n, s) || ({ ready: 1.6, win: 1.1, fail: 1.1, speedup: 1.8, grace: 2.2, gameover: 2.5, stagestart: 2, cleared: 2.5 }[n] || 1) / (s || 1); },
  music(n) { A.call('music', n); }, beat(on, o) { A.call('beat', on, o); }, tempo(b) { A.call('setTempo', b); }, babble(t, v) { return A.call('babble', t, v); },
};

// ---------------- microgame registry ----------------
const MG = {
  list: [], byId: {},
  add(def) { if (this.byId[def.id]) console.warn('duplicate microgame', def.id); def.time = def.time || 5; this.list.push(def); this.byId[def.id] = def; },
  forStage(st) { return this.list.filter(m => m.stage === st); },
};

// ---------------- stages ----------------
// host: person() options for the stage's host character. sky/ground: colours for the between-screen page.
const C = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const STAGES = [
  { id: 'creation', name: 'In the Beginning', hostName: 'Eve', mood: 'bright', sky: ['#7ec8e8', '#bfe6f0', '#fff1c8'], ground: ['#9acb6a', '#6a9a48'], host: { skin: SK[3], robe: C.green, stripe: C.cream, hairStyle: 'long', hair: HR[0] }, line: 'Let us make a world!' },
  { id: 'ark', name: 'The Ark', hostName: 'Noah', mood: 'storm', sky: ['#4a4a78', '#8a7aa0', '#f2c08a'], ground: ['#7f9a5a', '#55704a'], host: { skin: SK[2], robe: C.olive, stripe: C.cream, beard: '#e8e2da', hair: HR[5], head: 'wrap' }, line: 'Two by two, everybody in!' },
  { id: 'family', name: 'Family Stories', hostName: 'Sarah', mood: 'desert', sky: ['#2a2860', '#8a4a7a', '#f2a066'], ground: ['#e0a060', '#b0703a'], host: { skin: SK[1], robe: C.plum, stripe: C.gold, hairStyle: 'bun', hair: HR[5] }, line: 'God keeps every promise!' },
  { id: 'exodus', name: 'Freedom Road', hostName: 'Miriam', mood: 'desert', sky: ['#3a8ab0', '#9ad0d8', '#ffe2a8'], ground: ['#e8c88a', '#c09a5a'], host: { skin: SK[2], robe: C.teal, stripe: C.saffron, hairStyle: 'curly', hair: HR[0] }, line: 'Grab your tambourine. We are free!' },
  { id: 'brave', name: 'Brave Hearts', hostName: 'Deborah', mood: 'bright', sky: ['#5a9ad8', '#a8d4e8', '#fff0c8'], ground: ['#b8c86a', '#8a9a48'], host: { skin: SK[3], robe: C.indigo, stripe: C.gold, hairStyle: 'bun', hair: HR[0] }, line: 'Be brave and be kind!' },
  { id: 'exile', name: 'Far From Home', hostName: 'Esther', mood: 'night', sky: ['#1a1a48', '#4a3a7a', '#c07a8a'], ground: ['#8a6a8a', '#5a4a6a'], host: { skin: SK[3], robe: C.royal, stripe: C.gold, hairStyle: 'long', hair: HR[0], head: 'crown' }, line: 'Speak up for your people!' },
  { id: 'baby', name: 'A Baby Is Born', hostName: 'Mary', mood: 'night', sky: ['#101438', '#2a2a6a', '#5a4a8a'], ground: ['#7a6a5a', '#4a3a3a'], host: { skin: SK[3], robe: C.indigo, stripe: C.sky, head: 'scarf', headCol: C.sky }, line: 'Good news for everyone!' },
  { id: 'jesus', name: 'Jesus on the Move', hostName: 'Peter', mood: 'sea', sky: ['#5aa8d8', '#9ad0e8', '#fbe8c0'], ground: ['#a8c86a', '#7aa04a'], host: { skin: SK[2], robe: C.sky, stripe: C.brown, beard: true, hair: HR[0], hairStyle: 'curly' }, line: 'Follow me. Let us go!' },
  { id: 'parables', name: 'Story Time', hostName: 'the Samaritan', mood: 'bright', sky: ['#f0a070', '#f8c890', '#fff0d0'], ground: ['#c8b070', '#9a8048'], host: { skin: SK[1], robe: C.rust, stripe: C.cream, head: 'wrap', headCol: C.saffron, beard: true, hair: HR[2] }, line: 'Jesus told the best stories!' },
  { id: 'easter', name: 'Easter', hostName: 'Mary Magdalene', mood: 'bright', sky: ['#f7a8a0', '#ffd8b0', '#fff6dc'], ground: ['#9acb6a', '#6a9a48'], host: { skin: SK[2], robe: C.rose, stripe: C.cream, hairStyle: 'long', hair: HR[2] }, line: 'He is risen! Run and tell!' },
  { id: 'acts', name: 'Wind and Fire', hostName: 'Lydia', mood: 'party', sky: ['#4a7ad8', '#8ab0f0', '#ffe0b0'], ground: ['#d0a870', '#a07a48'], host: { skin: SK[1], robe: C.plum, stripe: C.gold, hairStyle: 'bun', hair: HR[0] }, line: 'Everyone is welcome here!' },
  { id: 'new', name: 'All Things New', hostName: 'everyone', mood: 'party', sky: ['#ffb0c8', '#ffd8a8', '#fff8e0'], ground: ['#a8d870', '#70a848'], host: { skin: SK[5], robe: C.saffron, stripe: C.rust, hairStyle: 'short', hair: HR[3], child: true }, line: 'The gates are always open!' },
];
const STAGE = Object.fromEntries(STAGES.map(s => [s.id, s]));

// ---------------- save data ----------------
const SAVE = {
  key: 'holymoly1', d: { best: {}, cleared: {}, cards: {}, remixBest: 0, muted: false },
  load() { try { const v = JSON.parse(localStorage.getItem(this.key) || 'null'); if (v) Object.assign(this.d, v); } catch (e) { } },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { } },
};

// ---------------- canvas, scaling and input ----------------
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
let scale = 1, offX = 0, offY = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 3); const vw = window.innerWidth, vh = window.innerHeight;
  scale = Math.min(vw / W, vh / H); cv.width = Math.round(vw * DPR); cv.height = Math.round(vh * DPR); cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
  offX = (vw - W * scale) / 2; offY = (vh - H * scale) / 2;
}
window.addEventListener('resize', resize); resize();
const ptr = { x: 0, y: 0, down: false, sx: 0, sy: 0, st: 0, path: [] };
function toLogical(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - offX) / scale, (e.clientY - r.top - offY) / scale]; }
cv.addEventListener('pointerdown', e => { e.preventDefault(); A.call('unlock'); const [x, y] = toLogical(e); ptr.x = x; ptr.y = y; ptr.down = true; ptr.sx = x; ptr.sy = y; ptr.st = performance.now(); ptr.path = [[x, y, ptr.st]]; input('down', x, y); try { cv.setPointerCapture(e.pointerId); } catch (_) { } });
cv.addEventListener('pointermove', e => { const [x, y] = toLogical(e); ptr.x = x; ptr.y = y; if (ptr.down) { ptr.path.push([x, y, performance.now()]); if (ptr.path.length > 12) ptr.path.shift(); input('move', x, y); } });
const endPtr = e => { if (!ptr.down) return; const [x, y] = toLogical(e); ptr.down = false; input('up', x, y); const dt = performance.now() - ptr.st, dx = x - ptr.sx, dy = y - ptr.sy; if (Math.hypot(dx, dy) > 28 && dt < 650) input('swipe', dx, dy, dx / Math.max(dt, 1) * 1000, dy / Math.max(dt, 1) * 1000); };
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
// iPhones and iPads only allow audio to start on a touch-up or tap, not on touch-down
for (const ev of ['touchend', 'click', 'pointerup', 'keydown']) window.addEventListener(ev, () => A.call('unlock'), { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) A.call('pause'); else A.call('resume'); });

// ---------------- shared effects (particles, floating text, shake) ----------------
const FX = {
  parts: [], texts: [], shakeT: 0, shakeA: 0,
  burst(x, y, cols = ['#ffd45a', '#ff8a5a', '#fff'], n = 14, spd = 160) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random() * 0.8); this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.7 + Math.random() * 0.5, age: 0, col: cols[i % cols.length], r: 2 + Math.random() * 3, star: Math.random() < 0.3 }); } },
  float(text, x, y, col = '#fff6dc', size = 26) { this.texts.push({ text, x, y, col, size, age: 0 }); },
  shake(a = 6, t = 0.25) { this.shakeA = a; this.shakeT = t; },
  clear() { this.parts = []; this.texts = []; this.shakeT = 0; },
  update(dt) { for (const p of this.parts) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 380 * dt; p.vx *= 0.99; } this.parts = this.parts.filter(p => p.age < p.life); for (const t of this.texts) t.age += dt; this.texts = this.texts.filter(t => t.age < 1.1); if (this.shakeT > 0) this.shakeT -= dt; },
  draw(c) {
    for (const p of this.parts) { c.globalAlpha = Math.max(0, 1 - p.age / p.life); c.fillStyle = p.col; if (p.star) drawStar(c, p.x, p.y, p.r * 1.8, p.age * 6); else { c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); } }
    c.globalAlpha = 1;
    for (const t of this.texts) { const k = t.age / 1.1; c.globalAlpha = 1 - k * k; P.command(c, t.text, t.x, t.y - k * 40, t.size, 0.8 + Math.min(1, t.age * 8) * 0.2, { tilt: 0 }); }
    c.globalAlpha = 1;
  },
};
function drawStar(c, x, y, r, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.restore(); }
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function button(c, x, y, w, h, text, opts = {}) {
  const { top = '#ffe08a', bot = '#f2a33a', edge = '#7a3a1a', ink = '#5a2414', size = 22, pressed = false } = opts;
  c.save(); c.translate(0, pressed ? 3 : 0); c.fillStyle = 'rgba(60,20,60,0.3)'; roundRect(c, x - w / 2, y - h / 2 + 5, w, h, h / 2); c.fill();
  const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; roundRect(c, x - w / 2, y - h / 2, w, h, h / 2); c.fill(); c.strokeStyle = edge; c.lineWidth = 3; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; roundRect(c, x - w / 2 + 8, y - h / 2 + 4, w - 16, h * 0.32, h * 0.16); c.fill();
  P.label(c, text, x, y + 1, size, ink, 'center', 900); c.restore();
}

// bake(key, drawFn): paint a static background once into an offscreen canvas (2x for crispness) and reuse it every frame.
const BAKED = {};
function bake(key, drawFn, w = W, h = H) {
  if (BAKED[key]) return BAKED[key];
  const off = document.createElement('canvas'); off.width = w * 2; off.height = h * 2; const o = off.getContext('2d'); o.scale(2, 2);
  try { drawFn(o, w, h); } catch (e) { console.error('bake', key, e); }
  return BAKED[key] = off;
}

// ---------------- input-type icons (help kids who can't read the command yet) ----------------
function hintIcon(c, kind, x, y, t) {
  c.save(); c.translate(x, y); c.globalAlpha = 0.95;
  const hand = (hx, hy, s = 1) => { c.save(); c.translate(hx, hy); c.scale(s, s); c.fillStyle = '#fff6ea'; c.strokeStyle = '#3a1640'; c.lineWidth = 2.5; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-4, -18); c.quadraticCurveTo(-4, -24, 0, -24); c.quadraticCurveTo(4, -24, 4, -18); c.lineTo(4, -6); c.lineTo(12, -4); c.quadraticCurveTo(16, -2, 15, 6); c.lineTo(12, 14); c.lineTo(-6, 14); c.lineTo(-12, 2); c.quadraticCurveTo(-13, -2, -9, -2); c.lineTo(-4, 2); c.closePath(); c.fill(); c.stroke(); c.restore(); };
  if (kind === 'tap' || kind === 'mash') { const k = kind === 'mash' ? 10 : 4, p = Math.abs(Math.sin(t * k)); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 3; c.beginPath(); c.arc(0, -26, 8 + p * 8, 0, 7); c.stroke(); hand(0, p * 4, 1); }
  else if (kind === 'swipe') { const p = (t * 1.5) % 1; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-26, -26); c.lineTo(26, -26); c.stroke(); hand(-24 + p * 48, 0, 1); }
  else if (kind === 'drag') { const p = (Math.sin(t * 3) + 1) / 2; hand(-18 + p * 36, -p * 10, 1); }
  else if (kind === 'hold') { const p = Math.min(1, (t * 0.8) % 1.2); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 4; c.beginPath(); c.arc(0, -26, 12, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); c.stroke(); hand(0, 2, 1); }
  else if (kind === 'still') { hand(0, 0, 1); c.strokeStyle = '#e04a4a'; c.lineWidth = 5; c.beginPath(); c.arc(0, -4, 24, 0, 7); c.moveTo(-17, 13); c.lineTo(17, -21); c.stroke(); }
  c.restore();
}

// ---------------- the run (one stage, or remix) ----------------
const RUN_LEN = 12, SPEED_EVERY = 4;
let scene = 'title', run = null, ui = { pressed: null, cardOpen: null, cardScroll: 0 }, T = 0;
const testMode = /[?&]test=1/.test(location.search);

function makeG(def, level, speed, silent) {
  const g = {
    W, H, def, level, speed, t: 0, dur: def.time / (1 + (speed - 1) * 0.55), s: {}, done: false, result: null, doneAt: 0, ptr,
    win() { if (this.done) return; this.done = true; this.result = 'win'; this.doneAt = this.t; if (!silent) A.sfx('chime'); },
    fail() { if (this.done) return; this.done = true; this.result = 'fail'; this.doneAt = this.t; if (!silent) A.sfx('fail'); },
    sfx: (n, o) => silent ? 0 : A.sfx(n, o), burst: (...a) => FX.burst(...a), float: (...a) => FX.float(...a), shake: (...a) => FX.shake(...a),
    rand: Math.random, bake, left() { return Math.max(0, this.dur - this.t); },
  };
  return g;
}
function playlist(stageId) {
  const pool = stageId === 'remix' ? MG.list.slice() : MG.forStage(stageId);
  const out = []; let last = null;
  while (out.length < (stageId === 'remix' ? 400 : RUN_LEN)) { const sh = pool.slice().sort(() => Math.random() - 0.5); if (sh[0] === last && sh.length > 1) sh.push(sh.shift()); out.push(...sh); last = out[out.length - 1]; }
  return out;
}
function startRun(stageId) {
  const st = STAGE[stageId] || { id: 'remix', name: 'Remix', mood: 'party', sky: ['#ff9ac0', '#ffc890', '#fff2d0'], ground: ['#b8d870', '#80a848'], host: STAGES[11].host, hostName: 'everyone', line: 'Every story, all mixed up!' };
  run = { stage: st, list: playlist(st.id), i: 0, loaves: 4, graceUsed: false, speed: 1, cleared: 0, phase: 'intro', pt: 0, wait: 0, g: null, newCards: [], lostLoafAt: -1, bpm: 108 };
  scene = 'run'; A.music(null); run.wait = A.jingle('stagestart', 1); A.babble(st.line, 'woman');
}
function nextMicro() {
  const def = run.list[run.i]; const level = Math.min(2, Math.floor(run.i / Math.max(1, (run.stage.id === 'remix' ? 8 : MG.forStage(run.stage.id).length))));
  run.g = makeG(def, level, run.speed); FX.clear();
  try { def.init && def.init(run.g); } catch (e) { console.error(def.id, 'init', e); run.g.win(); }
  run.phase = 'play'; run.pt = 0; A.beat(true, { bpm: run.bpm, mood: def.mood || run.stage.mood });
}
function between() { run.phase = 'between'; run.pt = 0; A.beat(false); run.wait = A.jingle('ready', run.speed); }
function endMicro() {
  const g = run.g; A.beat(false); run.phase = 'result'; run.pt = 0;
  if (g.result === 'win') { run.cleared++; A.jingle('win', run.speed); const id = g.def.id; if (!SAVE.d.cards[id]) { SAVE.d.cards[id] = 1; run.newCards.push(id); SAVE.save(); } }
  else { run.loaves--; run.lostLoafAt = T; A.jingle('fail', run.speed); }
  run.i++;
}
function afterResult() {
  if (run.loaves <= 0 && !run.graceUsed) { run.graceUsed = true; run.phase = 'grace'; run.pt = 0; run.wait = A.jingle('grace', 1); return; }
  if (run.loaves <= 0) return finishRun(false);
  if (run.stage.id !== 'remix' && run.i >= RUN_LEN) return finishRun(true);
  if (run.i % SPEED_EVERY === 0) { run.speed = +(run.speed + 0.25).toFixed(2); run.bpm = Math.round(108 * (1 + (run.speed - 1) * 0.7)); run.phase = 'speedup'; run.pt = 0; run.wait = A.jingle('speedup', run.speed); return; }
  between();
}
function finishRun(cleared) {
  run.phase = 'over'; run.pt = 0; run.won = cleared; A.beat(false);
  const id = run.stage.id;
  if (id === 'remix') SAVE.d.remixBest = Math.max(SAVE.d.remixBest, run.cleared); else { SAVE.d.best[id] = Math.max(SAVE.d.best[id] || 0, run.cleared); if (cleared) SAVE.d.cleared[id] = 1; }
  SAVE.save(); A.jingle(cleared ? 'cleared' : 'gameover', 1);
  if (run.newCards.length) { const ids = run.newCards.slice(), r0 = run; setTimeout(() => { if (scene === 'run' && run === r0 && run.phase === 'over') { openCards(ids.map(id => MG.byId[id]), 0, 'reward'); A.sfx('chime'); } }, 1600); } setTimeout(() => { if (scene === 'run' && run && run.phase === 'over') A.music('results'); }, 2600);
}
function updateRun(dt) {
  run.pt += dt;
  if (run.phase === 'intro' && run.pt > Math.max(2.2, run.wait)) between();
  else if (run.phase === 'between' && run.pt > Math.max(1.0, run.wait * 0.92)) nextMicro();
  else if (run.phase === 'play') {
    const g = run.g; g.t += dt;
    try { g.def.update && g.def.update(g, dt); } catch (e) { console.error(g.def.id, 'update', e); }
    if (testMode && g.def.auto && window.HM_AUTO) { try { g.def.auto(g, dt, synth); } catch (e) { console.error(g.def.id, 'auto', e); } }
    if (!g.done && g.t >= g.dur) { if (g.def.winOnTimeout) g.win(); else g.fail(); }
    if (g.done && g.t - g.doneAt > 0.75) endMicro();
  }
  else if (run.phase === 'result' && run.pt > 0.9 / Math.sqrt(run.speed)) afterResult();
  else if (run.phase === 'speedup' && run.pt > Math.max(1.6, run.wait)) between();
  else if (run.phase === 'grace' && run.pt > 3.6) { run.loaves = 1; between(); }
}
// synthetic input for automated tests: synth('down', x, y) etc.
function synth(type, ...a) { if (type === 'down') { ptr.down = true; ptr.x = a[0]; ptr.y = a[1]; ptr.sx = a[0]; ptr.sy = a[1]; } if (type === 'move') { ptr.x = a[0]; ptr.y = a[1]; } if (type === 'up') ptr.down = false; input(type, ...a); }

function input(type, x, y, vx, vy) {
  if (CV.list) { cardInput(type, x, y); return; }
  if (scene === 'run' && run) {
    if (run.phase === 'play') { const g = run.g, d = g.def; if (g.done) return; try { if (d[type]) d[type](g, x, y, vx, vy); } catch (e) { console.error(d.id, type, e); } return; }
    if (run.phase === 'over' && type === 'down') { if (hit(x, y, 180, 548, 220, 56)) { press('again'); A.sfx('pop'); setTimeout(() => startRun(run.stage.id), 140); } else if (hit(x, y, 180, 612, 160, 40)) { press('home'); A.sfx('click'); setTimeout(() => goStages(), 120); } }
    if (type === 'down' && hit(x, y, 336, 24, 44, 44) && run.phase !== 'over') { goStages(); A.sfx('click'); }
    return;
  }
  if (type !== 'down') return;
  if (scene === 'title') { if (hit(x, y, 180, 300, 180, 60)) { press('play'); A.sfx('pop'); A.music('title'); setTimeout(goStages, 120); } else if (hit(x, y, 180, 372, 150, 46)) { press('cards'); A.sfx('click'); setTimeout(() => { scene = 'cards'; }, 120); } else if (hit(x, y, 330, 30, 44, 44)) toggleMute(); else A.music('title'); return; }
  if (scene === 'stages') {
    if (hit(x, y, 30, 30, 44, 44)) { scene = 'title'; A.sfx('click'); return; }
    if (hit(x, y, 330, 30, 44, 44)) { toggleMute(); return; }
    for (const tile of stageTiles()) if (hit(x, y, tile.x, tile.y, tile.w, tile.h) && tile.count > 0) { press(tile.id); A.sfx('pop'); setTimeout(() => startRun(tile.id), 140); return; }
    return;
  }
  if (scene === 'cards') {
    if (hit(x, y, 30, 30, 44, 44)) { scene = 'title'; A.sfx('click'); return; }
    const owned = storyOrder().filter(d => SAVE.d.cards[d.id]); for (const c of cardTiles()) if (hit(x, y, c.x, c.y, c.w, c.h) && SAVE.d.cards[c.def.id]) { openCards(owned, owned.indexOf(c.def), 'browse'); A.sfx('chime'); return; }
  }
}
function hit(x, y, cx, cy, w, h) { return Math.abs(x - cx) <= w / 2 && Math.abs(y - cy) <= h / 2; }
function press(id) { ui.pressed = id; setTimeout(() => { if (ui.pressed === id) ui.pressed = null; }, 160); }
function goStages() { scene = 'stages'; run = null; A.beat(false); A.music('title'); FX.clear(); }
function toggleMute() { SAVE.d.muted = !SAVE.d.muted; SAVE.save(); A.call('mute', SAVE.d.muted); }

// ---------------- drawing: shared page backdrop ----------------
const bgCache = {};
function stagePage(c, st, t) {
  // cache the static painted part per stage
  const key = st.id; if (!bgCache[key]) { const off = document.createElement('canvas'); off.width = W * 2; off.height = H * 2; const o = off.getContext('2d'); o.scale(2, 2);
    P.sky(o, W, H, st.sky, { x: 270, y: 150, r: 24, color: '#fff2c4', glow: 200 });
    P.cloud(o, 80, 120, 0.8, '#fffaf0', P.shade(st.sky[1], -0.1), 0.9); P.cloud(o, 280, 210, 0.55, '#fffaf0', P.shade(st.sky[1], -0.1), 0.8);
    P.hills(o, W, 430, 50, P.shade(st.ground[0], 0.1), st.ground[1], { seed: 3, dabs: 60 });
    P.hills(o, W, 520, 34, st.ground[0], P.shade(st.ground[1], -0.1), { seed: 9, dabs: 90, rim: P.shade(st.ground[0], 0.4) });
    P.flowers(o, W, 540, 640, 24, undefined, 5); P.grassTufts(o, W, 530, 640, 30, P.shade(st.ground[0], -0.1), 4);
    bgCache[key] = off; }
  c.drawImage(bgCache[key], 0, 0, W, H);
}

// ---------------- drawing: screens ----------------
function drawTitle(c, t) {
  if (typeof PANEL_TITLE === 'function') PANEL_TITLE(c, t);
  button(c, 180, 300, 172, 56, 'Play', { size: 28, pressed: ui.pressed === 'play' });
  button(c, 180, 372, 140, 42, 'Cards', { size: 20, top: '#fff6ea', bot: '#e8d2b0', edge: '#7a4a3a', pressed: ui.pressed === 'cards' });
  muteIcon(c, 330, 30);
}
function muteIcon(c, x, y) { c.save(); c.translate(x, y); c.fillStyle = 'rgba(40,20,50,0.35)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); c.fillStyle = '#fff6ea'; c.beginPath(); c.moveTo(-9, -4); c.lineTo(-4, -4); c.lineTo(3, -10); c.lineTo(3, 10); c.lineTo(-4, 4); c.lineTo(-9, 4); c.closePath(); c.fill(); c.strokeStyle = '#fff6ea'; c.lineWidth = 2; c.lineCap = 'round'; if (SAVE.d.muted) { c.beginPath(); c.moveTo(6, -5); c.lineTo(13, 5); c.moveTo(13, -5); c.lineTo(6, 5); c.stroke(); } else { c.beginPath(); c.arc(4, 0, 6, -0.8, 0.8); c.stroke(); c.beginPath(); c.arc(4, 0, 10, -0.8, 0.8); c.stroke(); } c.restore(); }
function backIcon(c, x, y) { c.save(); c.translate(x, y); c.fillStyle = 'rgba(40,20,50,0.35)'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill(); c.strokeStyle = '#fff6ea'; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(4, -8); c.lineTo(-5, 0); c.lineTo(4, 8); c.stroke(); c.restore(); }
function stageTiles() {
  const out = []; STAGES.forEach((s, i) => out.push({ id: s.id, st: s, x: 96 + (i % 2) * 168, y: 108 + Math.floor(i / 2) * 82, w: 156, h: 72, count: MG.forStage(s.id).length }));
  out.push({ id: 'remix', st: null, x: 180, y: 108 + 6 * 82, w: 324, h: 50, count: MG.list.length }); return out;
}
function drawStages(c, t) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff3dc'); g.addColorStop(1, '#f2d2a8'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  backIcon(c, 30, 30); muteIcon(c, 330, 30); P.command(c, 'Pick a story', 180, 32, 26, 1, { tilt: 0 });
  for (const tile of stageTiles()) {
    const pr = ui.pressed === tile.id, on = tile.count > 0;
    c.save(); c.translate(0, pr ? 3 : 0); if (!on) c.globalAlpha = 0.55;
    c.fillStyle = 'rgba(80,40,40,0.18)'; roundRect(c, tile.x - tile.w / 2, tile.y - tile.h / 2 + 4, tile.w, tile.h, 18); c.fill();
    c.save(); roundRect(c, tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h, 18); c.clip();
    if (tile.st) { const sg = c.createLinearGradient(0, tile.y - tile.h / 2, 0, tile.y + tile.h / 2); sg.addColorStop(0, tile.st.sky[0]); sg.addColorStop(0.6, tile.st.sky[2]); sg.addColorStop(0.61, tile.st.ground[0]); sg.addColorStop(1, tile.st.ground[1]); c.fillStyle = sg; c.fillRect(tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h);
      P.person(c, tile.x - tile.w / 2 + 30, tile.y + tile.h / 2 - 4, 0.78, { ...tile.st.host, expr: 'happy', t, phase: tile.x + tile.y, bounce: on ? 1 : 0 }); }
    else { const sg = c.createLinearGradient(tile.x - 160, 0, tile.x + 160, 0); ['#e53b3b', '#f28c28', '#f6d23a', '#3aa655', '#3b6fd6', '#7a3fb0'].forEach((col, i) => sg.addColorStop(i / 5, col)); c.fillStyle = sg; c.fillRect(tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h); }
    c.restore();
    c.strokeStyle = 'rgba(90,40,50,0.55)'; c.lineWidth = 2.5; roundRect(c, tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h, 18); c.stroke();
    if (tile.st) { const words = tile.st.name.split(' '); const mid = Math.ceil(words.length / 2); const l1 = words.length > 2 ? words.slice(0, mid).join(' ') : words.join(' '), l2 = words.length > 2 ? words.slice(mid).join(' ') : '';
      if (on) { c.fillStyle = 'rgba(40,16,48,0.42)'; roundRect(c, tile.x - 32, tile.y - (l2 ? 22 : 13), 108, l2 ? 44 : 26, 12); c.fill(); }
      c.save(); if (on) { c.shadowColor = 'rgba(40,10,40,0.7)'; c.shadowBlur = 5; } const ink = on ? '#fffaf0' : '#3a2030'; P.label(c, l1, tile.x + 22, tile.y - (l2 ? 9 : 0), 15, ink, 'center', 900); if (l2) P.label(c, l2, tile.x + 22, tile.y + 9, 15, ink, 'center', 900); c.restore();
      if (!on) { c.fillStyle = 'rgba(255,250,240,0.0)'; }
      if (SAVE.d.cleared[tile.id]) { c.fillStyle = '#ffd45a'; drawStar(c, tile.x + tile.w / 2 - 14, tile.y - tile.h / 2 + 14, 9); } }
    else { P.label(c, 'Remix', tile.x, tile.y, 22, '#3a1640', 'center', 900); if (SAVE.d.remixBest) P.label(c, 'Best ' + SAVE.d.remixBest, tile.x + 120, tile.y, 13, '#3a1640', 'center', 800); }
    c.restore();
  }
}
function storyOrder() { const ix = Object.fromEntries(STAGES.map((st, i) => [st.id, i])); return MG.list.slice().sort((a, b) => (ix[a.stage] ?? 99) - (ix[b.stage] ?? 99)); }
function cardTiles() { const out = []; storyOrder().forEach((d, i) => out.push({ def: d, x: 64 + (i % 3) * 116, y: 120 + Math.floor(i / 3) * 132 - ui.cardScroll, w: 104, h: 120 })); return out; }
function drawCards(c, t) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff3dc'); g.addColorStop(1, '#f2d2a8'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const have = MG.list.filter(d => SAVE.d.cards[d.id]).length;
  for (const tile of cardTiles()) {
    if (tile.y < -70 || tile.y > H + 70) continue; const got = SAVE.d.cards[tile.def.id];
    c.save(); c.fillStyle = 'rgba(80,40,40,0.18)'; roundRect(c, tile.x - tile.w / 2, tile.y - tile.h / 2 + 4, tile.w, tile.h, 14); c.fill();
    roundRect(c, tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h, 14); c.save(); c.clip();
    if (got) { const th = thumb(tile.def, true); if (th) c.drawImage(th, 0, 260 * 1.5, 540, 340 * 1.5, tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h * 0.86); else { c.fillStyle = '#ead6b8'; c.fillRect(tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h); } }
    else { c.fillStyle = '#d8c0a0'; c.fillRect(tile.x - tile.w / 2, tile.y - tile.h / 2, tile.w, tile.h); P.label(c, '?', tile.x, tile.y - 8, 40, 'rgba(90,50,40,0.5)', 'center', 900); }
    c.fillStyle = '#fff8ea'; c.fillRect(tile.x - tile.w / 2, tile.y + tile.h / 2 - 22, tile.w, 22); c.restore();
    c.strokeStyle = 'rgba(90,40,50,0.5)'; c.lineWidth = 2; c.stroke();
    P.label(c, got ? tile.def.cmd : '', tile.x, tile.y + tile.h / 2 - 11, 13, '#5a2a3a', 'center', 900); c.restore();
  }
  c.fillStyle = 'rgba(255,243,220,0.95)'; c.fillRect(0, 0, W, 58); backIcon(c, 30, 30); P.command(c, `Cards ${have}/${MG.list.length}`, 190, 32, 24, 1, { tilt: 0 });
}
function wrap(c, text, x, y, maxW, lh, size, col, weight = 700) {
  c.font = `${weight} ${size}px Nunito, system-ui, sans-serif`; c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'top';
  const words = text.split(' '); let line = '', yy = y; for (const w of words) { const test = line ? line + ' ' + w : w; if (c.measureText(test).width > maxW && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = test; } if (line) c.fillText(line, x, yy); return yy + lh;
}
// ---------------- card pictures: each microgame played by its bot to the winning moment ----------------
const thumbCache = {}; let thumbBudget = 2;
function thumb(def, lazy) {
  if (thumbCache[def.id]) return thumbCache[def.id];
  if (lazy && thumbBudget <= 0) return null; thumbBudget--;
  const off = document.createElement('canvas'); off.width = 540; off.height = 960; const o = off.getContext('2d'); o.scale(1.5, 1.5);
  const saved = { parts: FX.parts, texts: FX.texts, shakeT: FX.shakeT }; FX.parts = []; FX.texts = [];
  const pd = { down: ptr.down, x: ptr.x, y: ptr.y };
  try {
    const g = makeG(def, 0, 1, true); def.init && def.init(g);
    const sy = (type, ...a) => { if (type === 'down') { ptr.down = true; ptr.x = a[0]; ptr.y = a[1]; } if (type === 'move') { ptr.x = a[0]; ptr.y = a[1]; } if (type === 'up') ptr.down = false; if (!g.done && def[type]) def[type](g, ...a); };
    const dt = 1 / 30;
    for (let i = 0; i < 330; i++) {
      g.t += dt; def.update && def.update(g, dt); if (def.auto) def.auto(g, dt, sy); FX.update(dt);
      if (!g.done && g.t >= g.dur) { if (def.winOnTimeout) g.win(); else g.fail(); }
      if (g.done && g.t - g.doneAt > 0.4) break; if (!def.auto && g.t > 1.2) break;
    }
    def.draw(g, o); FX.draw(o);
  } catch (e) { o.fillStyle = '#d8c0a0'; o.fillRect(0, 0, 360, 640); }
  FX.parts = saved.parts; FX.texts = saved.texts; FX.shakeT = saved.shakeT; ptr.down = pd.down; ptr.x = pd.x; ptr.y = pd.y;
  return thumbCache[def.id] = off;
}

// ---------------- card viewer (the Cards screen, and new cards after a level) ----------------
const CV = { list: null, i: 0, scroll: 0, mode: 'browse', drag: null, slide: 0 };
const CARD = { x: 12, y: 18, w: 336, h: 604, img: { x: 24, y: 30, w: 312, h: 214 }, body: { x: 34, y: 258, w: 292, h: 270 }, nav: 574 };
function openCards(defs, i, mode) { CV.list = defs; CV.i = i; CV.scroll = 0; CV.mode = mode; CV.slide = 0; CV.drag = null; }
function closeCards() { CV.list = null; CV.drag = null; A.sfx('click'); }
function stepCard(d) { const n = CV.list.length, j = CV.i + d; if (j < 0 || j >= n) { CV.slide = 0; return; } CV.i = j; CV.scroll = 0; CV.slide = -d * 60; A.sfx('swoosh'); }
const bodyCache = {};
function textLines(c, text, maxW) { const out = []; let line = ''; for (const w of String(text).split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; } if (line) out.push(line); return out; }
// the card's words, laid out once into a tall canvas that the viewer scrolls
function cardBody(def) {
  if (bodyCache[def.id]) return bodyCache[def.id];
  const cd = def.card || {}, Wd = CARD.body.w, S2 = 2, m = document.createElement('canvas').getContext('2d');
  const blocks = []; let y = 2;
  const add = (lines, font, lh, col, align, box) => { blocks.push({ lines, font, lh, col, align, y, box }); y += lines.length * lh; };
  m.font = '900 23px Nunito, system-ui, sans-serif'; add(textLines(m, cd.title || def.cmd, Wd - 10), m.font, 29, '#3a1640', 'center'); y += 4;
  m.font = '800 14px Nunito, system-ui, sans-serif'; add([[cd.ref, cd.kind].filter(Boolean).join(' · ')], m.font, 20, '#9a5a4a', 'center'); y += 12;
  m.font = '700 17px Nunito, system-ui, sans-serif'; add(textLines(m, cd.text || '', Wd), m.font, 25, '#3a2a30', 'left'); y += 16;
  if (cd.note) { const top = y; y += 12; m.font = '900 12px Nunito, system-ui, sans-serif'; add(['READING THIS STORY'], m.font, 18, '#4a7a52', 'left'); y += 2; m.font = '700 15px Nunito, system-ui, sans-serif'; add(textLines(m, cd.note, Wd - 32), m.font, 22, '#2f5a38', 'left'); y += 12; blocks.push({ rect: [0, top, Wd, y - top], fill: '#e7f2df' }); y += 14; }
  if (cd.ask) { const top = y; y += 12; m.font = '800 16px Nunito, system-ui, sans-serif'; add(textLines(m, cd.ask, Wd - 32), m.font, 23, '#7a3a2a', 'left'); y += 12; blocks.push({ rect: [0, top, Wd, y - top], fill: '#fbe6c8' }); y += 6; }
  const cv2 = document.createElement('canvas'); cv2.width = Wd * S2; cv2.height = Math.ceil(y * S2); const o = cv2.getContext('2d'); o.scale(S2, S2);
  for (const b of blocks) if (b.rect) { o.fillStyle = b.fill; roundRect(o, ...b.rect, 14); o.fill(); }
  o.textBaseline = 'top';
  for (const b of blocks) if (b.lines) { const inBox = b.font.includes('15px') || b.font.includes('12px') || (b.font.includes('800 16px')); o.font = b.font; o.fillStyle = b.col; o.textAlign = b.align === 'center' ? 'center' : 'left';
    b.lines.forEach((l, i) => o.fillText(l, b.align === 'center' ? Wd / 2 : (inBox ? 16 : 0), b.y + i * b.lh + (b.lh - parseInt(b.font.match(/(\d+)px/)[1])) / 2)); }
  return bodyCache[def.id] = { canvas: cv2, h: y };
}
function drawCardViewer(c, t) {
  const def = CV.list[CV.i], K = CARD, bd = cardBody(def), maxS = Math.max(0, bd.h - K.body.h);
  CV.scroll = Math.max(0, Math.min(maxS, CV.scroll)); if (!CV.drag) CV.slide *= 0.75;
  c.fillStyle = 'rgba(40,20,40,0.66)'; c.fillRect(0, 0, W, H);
  c.save(); c.translate(CV.slide, 0);
  c.fillStyle = 'rgba(30,10,30,0.35)'; roundRect(c, K.x, K.y + 6, K.w, K.h, 24); c.fill();
  c.fillStyle = '#fff8ea'; roundRect(c, K.x, K.y, K.w, K.h, 24); c.fill(); c.strokeStyle = '#7a4a3a'; c.lineWidth = 3; c.stroke();
  // picture from the winning moment
  const th = thumb(def), I = K.img, sh = 360 * I.h / I.w, sy = Math.max(0, Math.min(640 - sh, (def.cardY ?? 400) - sh / 2));
  c.save(); roundRect(c, I.x, I.y, I.w, I.h, 16); c.clip(); c.drawImage(th, 0, sy * 1.5, 540, sh * 1.5, I.x, I.y, I.w, I.h); c.restore();
  if (CV.mode === 'reward') { c.save(); c.translate(I.x + 14, I.y + 14); c.fillStyle = '#ffd45a'; roundRect(c, 0, 0, 74, 28, 14); c.fill(); c.strokeStyle = '#7a3a1a'; c.lineWidth = 2; c.stroke(); P.label(c, 'New!', 37, 15, 16, '#5a2414', 'center', 900); c.restore(); }
  // scrolling words
  const B = K.body; c.save(); c.beginPath(); c.rect(B.x - 6, B.y, B.w + 12, B.h); c.clip(); c.drawImage(bd.canvas, B.x, B.y - CV.scroll, B.w, bd.h); c.restore();
  if (CV.scroll > 2) { const gr = c.createLinearGradient(0, B.y, 0, B.y + 22); gr.addColorStop(0, 'rgba(255,248,234,1)'); gr.addColorStop(1, 'rgba(255,248,234,0)'); c.fillStyle = gr; c.fillRect(B.x - 6, B.y, B.w + 12, 22); }
  if (CV.scroll < maxS - 2) { const gr = c.createLinearGradient(0, B.y + B.h - 34, 0, B.y + B.h); gr.addColorStop(0, 'rgba(255,248,234,0)'); gr.addColorStop(1, 'rgba(255,248,234,1)'); c.fillStyle = gr; c.fillRect(B.x - 6, B.y + B.h - 34, B.w + 12, 34);
    c.save(); c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4); c.strokeStyle = '#9a5a4a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(W / 2 - 8, B.y + B.h - 10); c.lineTo(W / 2, B.y + B.h - 3); c.lineTo(W / 2 + 8, B.y + B.h - 10); c.stroke(); c.restore(); }
  // navigation
  const n = CV.list.length, ny = K.nav + 16;
  c.strokeStyle = 'rgba(122,74,58,0.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(K.x + 20, K.nav - 14); c.lineTo(K.x + K.w - 20, K.nav - 14); c.stroke();
  const arrow = (x, dir, on) => { c.save(); c.globalAlpha = on ? 1 : 0.25; c.fillStyle = '#f2dcbc'; c.beginPath(); c.arc(x, ny, 20, 0, 7); c.fill(); c.strokeStyle = '#7a4a3a'; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - dir * 4, ny - 8); c.lineTo(x + dir * 5, ny); c.lineTo(x - dir * 4, ny + 8); c.stroke(); c.restore(); };
  if (n > 1) { arrow(54, -1, CV.i > 0); arrow(306, 1, CV.i < n - 1); }
  if (CV.mode === 'reward') button(c, 180, ny, 132, 44, CV.i < n - 1 ? 'Next' : 'Done', { size: 19, pressed: ui.pressed === 'cvbtn' });
  else P.label(c, `${CV.i + 1} of ${n}`, 180, ny, 16, '#7a4a3a', 'center', 900);
  // close
  c.fillStyle = 'rgba(40,20,50,0.55)'; c.beginPath(); c.arc(K.x + K.w - 26, K.y + 26, 17, 0, 7); c.fill(); c.strokeStyle = '#fff6ea'; c.lineWidth = 3; c.lineCap = 'round'; const cx = K.x + K.w - 26, cy = K.y + 26; c.beginPath(); c.moveTo(cx - 6, cy - 6); c.lineTo(cx + 6, cy + 6); c.moveTo(cx + 6, cy - 6); c.lineTo(cx - 6, cy + 6); c.stroke();
  c.restore();
}
function cardInput(type, x, y) {
  const K = CARD, d = CV.drag;
  if (type === 'down') { CV.drag = { x, y, sx: CV.scroll, moved: false, axis: null }; return; }
  if (!d) return;
  const dx = x - d.x, dy = y - d.y;
  if (type === 'move') { if (!d.axis && Math.hypot(dx, dy) > 8) d.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; if (d.axis === 'y') { CV.scroll = d.sx - dy; d.moved = true; } if (d.axis === 'x') { CV.slide = dx * 0.6; d.moved = true; } return; }
  if (type !== 'up') return;
  CV.drag = null;
  if (d.axis === 'x' && Math.abs(dx) > 50) { stepCard(dx < 0 ? 1 : -1); return; }
  if (d.moved) return;
  const n = CV.list.length, ny = K.nav + 16;
  if (Math.hypot(x - (K.x + K.w - 26), y - (K.y + 26)) < 24) { closeCards(); return; }
  if (n > 1 && Math.hypot(x - 54, y - ny) < 26) { stepCard(-1); return; }
  if (n > 1 && Math.hypot(x - 306, y - ny) < 26) { stepCard(1); return; }
  if (CV.mode === 'reward' && hit(x, y, 180, ny, 140, 50)) { press('cvbtn'); if (CV.i < n - 1) stepCard(1); else closeCards(); return; }
  if (CV.mode === 'browse' && (x < K.x || x > K.x + K.w || y < K.y || y > K.y + K.h)) closeCards();
}
function drawRun(c, t) {
  const r = run, st = r.stage;
  if (r.phase === 'play' || r.phase === 'result' && r.g) {
    const g = r.g; c.save();
    if (FX.shakeT > 0) c.translate((Math.random() - 0.5) * FX.shakeA, (Math.random() - 0.5) * FX.shakeA);
    try { g.def.draw(g, c); } catch (e) { console.error(g.def.id, 'draw', e); c.fillStyle = '#ccc'; c.fillRect(0, 0, W, H); }
    FX.draw(c); c.restore();
    if (r.phase === 'play') drawPlayOverlay(c, g, t);
    if (r.phase === 'result') { const k = Math.min(1, r.pt * 5); c.fillStyle = g.result === 'win' ? `rgba(255,236,170,${0.25 * k})` : `rgba(60,30,80,${0.3 * k})`; c.fillRect(0, 0, W, H); }
    return;
  }
  stagePage(c, st, t);
  const k = Math.min(1, r.pt * 3);
  if (r.phase === 'intro') {
    P.command(c, st.name, 180, 150, st.name.length > 12 ? 34 : 42, 0.6 + 0.4 * easeOut(k));
    P.person(c, 180, 540, 2.6, { ...st.host, expr: 'laugh', arms: 'wave', t: T });
    speech(c, st.line, 180, 270, k);
  } else if (r.phase === 'over') {
    P.command(c, r.won ? 'Stage clear!' : 'Well done!', 180, 110, 40, 0.6 + 0.4 * easeOut(k));
    P.person(c, 110, 560, 2.2, { ...st.host, expr: 'laugh', arms: 'cheer', t: T });
    c.fillStyle = 'rgba(255,248,234,0.92)'; roundRect(c, 180, 190, 160, 150, 18); c.fill(); c.strokeStyle = '#7a4a3a'; c.lineWidth = 2.5; c.stroke();
    P.label(c, String(r.cleared), 260, 252, 64, '#3a1640', 'center', 900); P.label(c, r.cleared === 1 ? 'game won' : 'games won', 260, 300, 16, '#7a4a3a', 'center', 800);
    if (r.newCards.length) { P.label(c, `${r.newCards.length} new card${r.newCards.length > 1 ? 's' : ''}`, 260, 372, 17, '#3a1640', 'center', 900); r.newCards.slice(0, 3).forEach((id, i) => { const th = thumb(MG.byId[id]); c.save(); c.translate(205 + i * 55, 420); c.rotate((i - 1) * 0.12); c.fillStyle = '#fff'; c.fillRect(-24, -32, 48, 64); c.drawImage(th, 0, 80, 360, 480, -21, -29, 42, 58); c.restore(); }); }
    button(c, 180, 548, 220, 56, 'Play again', { size: 24, pressed: ui.pressed === 'again' });
    button(c, 180, 612, 150, 40, 'Stories', { size: 18, top: '#fff6ea', bot: '#e8d2b0', edge: '#7a4a3a', pressed: ui.pressed === 'home' });
    FX.draw(c); return;
  } else {
    // between, speedup, grace, result-less transitions: the host and the loaves
    const beat = Math.abs(Math.sin(T * Math.PI * (r.bpm / 60) / 1));
    P.person(c, 84, 590, 2.1, { ...st.host, expr: r.phase === 'grace' ? 'wow' : 'laugh', arms: r.phase === 'speedup' ? 'cheer' : 'wave', t: T });
    c.fillStyle = 'rgba(255,248,234,0.9)'; roundRect(c, 150, 330, 190, 90, 20); c.fill(); c.strokeStyle = '#7a4a3a'; c.lineWidth = 2.5; c.stroke();
    P.label(c, String(r.i + (r.phase === 'between' ? 1 : 0)), 245, 375, 58, '#3a1640', 'center', 900);
    for (let i = 0; i < 4; i++) { const gone = i >= r.loaves, popping = gone && i === r.loaves && T - r.lostLoafAt < 0.8; const by = 230 + (gone ? 0 : -beat * 6 * (i % 2 ? 1 : 0.6));
      if (popping) { const q = (T - r.lostLoafAt) / 0.8; c.save(); c.globalAlpha = 1 - q; P.loaf(c, 66 + i * 76, by - q * 60, 2 + q, false); c.restore(); } else P.loaf(c, 66 + i * 76, by, 2, gone); }
    if (r.phase === 'speedup') P.command(c, 'Faster!', 180, 120, 56, 0.7 + 0.3 * Math.abs(Math.sin(r.pt * 8)), { fill2: '#ff8a5a' });
    if (r.phase === 'between' && r.i === 0) P.command(c, 'Get ready!', 180, 120, 44, 0.6 + 0.4 * easeOut(k));
    if (r.phase === 'grace') drawGrace(c, r.pt);
  }
  backIcon(c, 336, 24);
}
function drawGrace(c, pt) {
  const p = Math.min(1, pt / 1.6), x = -40 + p * 106, y = 120 + Math.sin(p * Math.PI) * -40 + p * 60;
  c.save(); const glow = c.createRadialGradient(66, 230, 2, 66, 230, 120); glow.addColorStop(0, `rgba(255,240,180,${0.6 * Math.min(1, pt)})`); glow.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = glow; c.fillRect(0, 80, W, 320); c.restore();
  P.dove(c, x, y, 1.6, { t: pt });
  if (pt > 1.6) { const q = Math.min(1, (pt - 1.6) * 3); P.loaf(c, 66, 120 + q * 110, 2); } else P.loaf(c, x + 12, y + 22, 1.6);
  if (pt > 1.2) { c.globalAlpha = Math.min(1, (pt - 1.2) * 2); c.fillStyle = 'rgba(255,248,234,0.95)'; roundRect(c, 30, 440, 300, 76, 18); c.fill(); P.label(c, "You didn't earn this one.", 180, 464, 18, '#3a1640', 'center', 900); P.label(c, "That's grace.", 180, 492, 22, '#b8541f', 'center', 900); c.globalAlpha = 1; }
}
function speech(c, text, x, y, k) {
  // the host's line: wraps onto as many lines as needed and the bubble grows to fit
  c.save(); c.globalAlpha = k; const size = 19, lh = 25, maxW = 270; c.font = `800 ${size}px Nunito, system-ui, sans-serif`;
  const lines = []; let line = ''; for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line);
  const w = Math.max(...lines.map(l => c.measureText(l).width)) + 48, h = lines.length * lh + 26, top = y - h / 2;
  c.fillStyle = 'rgba(255,250,240,0.96)'; roundRect(c, x - w / 2, top, w, h, 22); c.fill(); c.beginPath(); c.moveTo(x - 10, top + h - 2); c.lineTo(x, top + h + 14); c.lineTo(x + 10, top + h - 2); c.fill();
  c.strokeStyle = '#7a4a3a'; c.lineWidth = 2; roundRect(c, x - w / 2, top, w, h, 22); c.stroke();
  lines.forEach((l, i) => P.label(c, l, x, top + 13 + lh / 2 + i * lh, size, '#3a1640', 'center', 800)); c.restore();
}
function easeOut(k) { return 1 - Math.pow(1 - k, 3) + Math.sin(k * Math.PI) * 0.15; }
// command banner, input hint and the fuse timer over a running microgame
function drawPlayOverlay(c, g, t) {
  const d = g.def, a = g.t;
  if (a < 1.25) { const pop = a < 0.18 ? a / 0.18 * 1.15 : a < 0.3 ? 1.15 - (a - 0.18) / 0.12 * 0.15 : 1; const fade = a > 1.0 ? 1 - (a - 1.0) / 0.25 : 1;
    c.save(); c.globalAlpha = Math.max(0, fade); P.command(c, d.cmd, 180, 250, d.cmd.length > 7 ? 54 : 66, pop); if (d.hint) hintIcon(c, d.hint, 180, 345, a); c.restore(); }
  // fuse
  const frac = Math.max(0, 1 - g.t / g.dur), x0 = 20, x1 = 340, y = 622;
  c.save(); c.fillStyle = 'rgba(40,20,50,0.35)'; roundRect(c, x0, y - 6, x1 - x0, 12, 6); c.fill();
  const fx = x0 + (x1 - x0) * frac; const gr = c.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#ffe08a'); gr.addColorStop(1, '#ff8a4a'); c.fillStyle = gr; if (frac > 0) { roundRect(c, x0, y - 6, Math.max(12, fx - x0), 12, 6); c.fill(); }
  if (!g.done && frac > 0) { for (let i = 0; i < 4; i++) { c.fillStyle = ['#fff6c0', '#ffd45a', '#ff8a4a', '#fff'][i]; c.beginPath(); c.arc(fx + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, 2 + Math.random() * 2, 0, 7); c.fill(); } }
  c.restore();
  if (g.done && g.t - g.doneAt < 0.75) { const q = (g.t - g.doneAt) / 0.75; c.save(); c.globalAlpha = Math.min(1, q * 4) * (q > 0.8 ? (1 - q) * 5 : 1); P.command(c, g.result === 'win' ? (d.winText || 'Yes!') : (d.failText || 'Oops!'), 180, 200, 58, 0.8 + Math.min(0.2, q), { fill2: g.result === 'win' ? '#ffcf5a' : '#c8b8ff' }); c.restore(); }
}

// ---------------- main loop ----------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(1 / 30, (now - last) / 1000); last = now; T += dt;
  step(dt); render(); requestAnimationFrame(frame);
}
function step(dt) { if (scene === 'run' && run) updateRun(dt); FX.update(dt); }
// On phones taller or wider than 9:16, the bands around the game continue the scene: its edge rows are stretched outward and softly darkened.
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#2a1830'; ctx.fillRect(0, 0, cv.width, cv.height);

  ctx.setTransform(scale * DPR, 0, 0, scale * DPR, offX * DPR, offY * DPR);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
  thumbBudget = 2;
  if (scene === 'title') drawTitle(ctx, T); else if (scene === 'stages') drawStages(ctx, T); else if (scene === 'cards') drawCards(ctx, T); else if (scene === 'run' && run) drawRun(ctx, T);
  if (CV.list) drawCardViewer(ctx, T);
  ctx.restore();
  fillBands();
}
const bandStrip = document.createElement('canvas'); bandStrip.width = 40; bandStrip.height = 1; const bsx = bandStrip.getContext('2d');
function strip(sx, sy, sw, sh, dx, dy, dw, dh) { bsx.clearRect(0, 0, 40, 1); bsx.drawImage(cv, sx, sy, sw, sh, 0, 0, 40, 1); ctx.drawImage(bandStrip, 0, 0, 40, 1, dx, dy, dw, dh); }
function fillBands() {
  const fx = Math.round(offX * DPR), fy = Math.round(offY * DPR), fw = Math.round(W * scale * DPR), fh = Math.round(H * scale * DPR), e = Math.max(2, Math.round(2 * DPR));
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
  try {
    if (fy > 1) {
      strip(fx, fy, fw, e * 3, fx, 0, fw, fy); strip(fx, fy + fh - e * 3, fw, e * 3, fx, fy + fh, fw, cv.height - fy - fh);
      let g = ctx.createLinearGradient(0, 0, 0, fy); g.addColorStop(0, 'rgba(30,14,36,0.55)'); g.addColorStop(1, 'rgba(30,14,36,0.12)'); ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, fy);
      g = ctx.createLinearGradient(0, fy + fh, 0, cv.height); g.addColorStop(0, 'rgba(30,14,36,0.12)'); g.addColorStop(1, 'rgba(30,14,36,0.55)'); ctx.fillStyle = g; ctx.fillRect(0, fy + fh, cv.width, cv.height - fy - fh);
    }
    if (fx > 1) {
      ctx.drawImage(cv, fx, 0, e, cv.height, 0, 0, fx, cv.height); ctx.drawImage(cv, fx + fw - e, 0, e, cv.height, fx + fw, 0, cv.width - fx - fw, cv.height);
      ctx.fillStyle = 'rgba(30,14,36,0.35)'; ctx.fillRect(0, 0, fx, cv.height); ctx.fillRect(fx + fw, 0, cv.width - fx - fw, cv.height);
    }
  } catch (err) { }
}
// card list scrolling (drag)
let dragY = null; cv.addEventListener('pointerdown', e => { if (scene === 'cards' && !CV.list) dragY = toLogical(e)[1]; });
cv.addEventListener('pointermove', e => { if (scene === 'cards' && !CV.list && dragY !== null && ptr.down) { const y = toLogical(e)[1]; ui.cardScroll = Math.max(0, Math.min(Math.max(0, Math.ceil(MG.list.length / 3) * 132 - 460), ui.cardScroll - (y - dragY))); dragY = y; } });
cv.addEventListener('pointerup', () => { dragY = null; });

// ---------------- test hooks (used by tools/mgtest.py) ----------------
window.HM = {
  // run one microgame headless with a fixed timestep; returns {result, t} and optional frames as data URLs
  test(id, opts = {}) {
    const def = MG.byId[id]; if (!def) return { error: 'no such microgame ' + id };
    const { level = 0, speed = 1, auto = false, frames = [], overlay = true, events = [] } = opts;
    const errors = []; const oe = console.error; console.error = (...a) => { errors.push(a.map(String).join(' ')); oe(...a); };
    scene = 'run'; run = { stage: STAGE[def.stage] || STAGES[0], list: [def], i: 0, loaves: 4, phase: 'play', pt: 0, speed, bpm: 108, newCards: [] };
    window.HM_AUTO = auto; FX.clear(); const g = makeG(def, level, speed); run.g = g; try { def.init && def.init(g); } catch (e) { errors.push('init: ' + e); }
    const shots = [], dt = 1 / 60; let fi = 0; const ev = events.slice().sort((a, b) => a.t - b.t); let ei = 0;
    const off = document.createElement('canvas'); off.width = W * 2; off.height = H * 2; const oc = off.getContext('2d');
    for (let step = 0; step < 60 * 20; step++) {
      while (ei < ev.length && ev[ei].t <= g.t) { const e = ev[ei++]; synth(e.type, ...(e.args || [])); }
      while (fi < frames.length && frames[fi] <= g.t) { oc.setTransform(2, 0, 0, 2, 0, 0); oc.clearRect(0, 0, W, H); try { def.draw(g, oc); } catch (e) { errors.push('draw: ' + e); } FX.draw(oc); if (overlay) drawPlayOverlay(oc, g, g.t); shots.push(off.toDataURL('image/jpeg', 0.85)); fi++; }
      g.t += dt; try { def.update && def.update(g, dt); } catch (e) { errors.push('update: ' + e); }
      if (auto && def.auto) { try { def.auto(g, dt, synth); } catch (e) { errors.push('auto: ' + e); } }
      FX.update(dt);
      if (!g.done && g.t >= g.dur) { if (def.winOnTimeout) g.win(); else g.fail(); }
      if (g.done && g.t - g.doneAt > 0.8 && fi >= frames.length) break;
    }
    console.error = oe; window.HM_AUTO = false; scene = 'title'; run = null;
    return { result: g.result, doneAt: +g.doneAt.toFixed(2), dur: +g.dur.toFixed(2), errors, shots };
  },
  list() { return MG.list.map(d => ({ id: d.id, stage: d.stage, cmd: d.cmd, hint: d.hint, time: d.time, winOnTimeout: !!d.winOnTimeout, hasAuto: !!d.auto, card: !!(d.card && d.card.text) })); },
  goto(s, arg) { if (s === 'run') startRun(arg); else { scene = s; } },
  step(n = 1, dt = 1 / 60) { for (let i = 0; i < n; i++) { T += dt; step(dt); } render(); },
  state() { return { scene, phase: run && run.phase, i: run && run.i, loaves: run && run.loaves }; },
  synth,
};

function boot() {
  SAVE.load(); if (SAVE.d.muted) A.call('mute', true);
  if (!testMode) requestAnimationFrame(frame); else render();
}
