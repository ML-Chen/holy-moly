// GLEAN! — Ruth 2. In Boaz's golden barley field, the workers drop extra stalks on purpose for Ruth (Ruth 2:16).
// Tap the glowing fallen stalks to gather them into Ruth's arms before the sun sets.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const RUTH = { x: 66, y: 616, s: 1.3 };
const HAND = { x: RUTH.x, y: RUTH.y - 26 * RUTH.s };
const REAPERS = [{ x: 120, y: 452, s: 0.74, look: { skin: SK[3], robe: CL.terracotta, stripe: CL.cream, beard: true, hair: HR[0], head: 'wrap', headCol: CL.sand }, ph: 0 },
  { x: 236, y: 456, s: 0.76, look: { skin: SK[1], robe: CL.sky, stripe: CL.white, hairStyle: 'bun', hair: HR[2] }, ph: 2 }];
const BOAZ = { x: 318, y: 446, s: 0.72, look: { skin: SK[2], robe: CL.plum, stripe: CL.gold, beard: '#d8d0c4', hair: HR[5], head: 'wrap', headCol: CL.cream } };
const SUN0 = { x: 292, y: 196 }, SUN1 = { x: 300, y: 300 };
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);

// one barley stalk: a thin stem and a nodding head of plump kernels with long whiskery awns
function stalk(c, x, y, h, lean, col = '#e8b84a', head = 1, ks = 1) {
  const tx = x + lean * h, ty = y - h;
  c.strokeStyle = P.shade(col, -0.25); c.lineWidth = 1.3 * ks; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + lean * h * 0.3, y - h * 0.6, tx, ty); c.stroke();
  if (!head) return;
  const n = 6, dx = (lean * 2.2 + 1.2) * ks, dy = -3.2 * ks;
  for (let i = 0; i < n; i++) { const kx = tx + dx * i * 0.6, ky = ty + dy * i;
    c.fillStyle = i % 2 ? P.shade(col, 0.18) : col; c.beginPath(); c.ellipse(kx - 1.6 * ks, ky, 1.9 * ks, 2.8 * ks, -0.4 + lean, 0, 7); c.ellipse(kx + 1.6 * ks, ky, 1.9 * ks, 2.8 * ks, 0.4 + lean, 0, 7); c.fill(); }
  c.strokeStyle = P.rgba(P.shade(col, 0.35), 0.7); c.lineWidth = 0.6 * ks; c.beginPath();
  for (let i = 1; i < n; i++) { const kx = tx + dx * i * 0.6, ky = ty + dy * i; c.moveTo(kx - 1.5 * ks, ky); c.lineTo(kx + (-6 + lean * 4) * ks, ky - 9 * ks); c.moveTo(kx + 1.5 * ks, ky); c.lineTo(kx + (5 + lean * 4) * ks, ky - 10 * ks); }
  c.stroke();
}
// a handful of fallen stalks lying on the stubble, fanned out and tied with a twist of straw
function handful(c, x, y, s, rot, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(150,80,30,0.2)'; c.beginPath(); c.ellipse(0, 6, 30, 6, 0, 0, 7); c.fill();
  c.rotate(rot);
  for (let i = -3; i <= 3; i++) { c.save(); c.translate(-20, 3); c.rotate(Math.PI / 2 + 0.06 + i * 0.13); stalk(c, 0, 0, 36 + (3 - Math.abs(i)) * 3, Math.sin(t * 2 + i) * 0.015, i % 2 ? '#f0c050' : '#ffd96a', 1, 1.35); c.restore(); }
  c.fillStyle = '#c07a2a'; c.save(); c.translate(-8, 3); c.rotate(0.1); c.fillRect(-2, -6, 4, 12); c.restore();
  c.restore();
}
// a stood-up sheaf, a decoration for the harvested field
function sheaf(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(90,50,20,0.25)'; c.beginPath(); c.ellipse(4, 0, 22, 5, 0, 0, 7); c.fill();
  for (let i = -6; i <= 6; i++) stalk(c, i * 1.4, 0, 46 + (6 - Math.abs(i)) * 1.5, i * 0.05, i % 2 ? '#e8b448' : '#f2c65a');
  c.fillStyle = '#b8762a'; c.fillRect(-9, -22, 18, 4); c.restore();
}
function bundle(c, x, y, n, t) { // Ruth's armful, held at her chest with the heads nodding up and out: it grows as she gleans
  const k = Math.min(n, 8), m = 4 + k * 2, sc = 1.1 + k * 0.05;
  c.save(); c.translate(x + 8, y + 10); c.rotate(0.8);
  for (let i = 0; i < m; i++) { const a = (i / (m - 1) - 0.5) * (0.4 + k * 0.08); c.save(); c.rotate(a); stalk(c, 0, 0, 30 + k * 3 + (i % 3) * 4, 0.12 + Math.sin(t * 2 + i) * 0.015, i % 2 ? '#f0c050' : '#ffd96a', 1, sc); c.restore(); }
  c.fillStyle = '#c07a2a'; c.fillRect(-6, -14, 12, 4);
  c.restore();
}
function bird(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 9 + x) * 4; c.strokeStyle = 'rgba(90,50,60,0.65)'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-8, -f); c.quadraticCurveTo(-3, -3, 0, 0); c.quadraticCurveTo(3, -3, 8, -f); c.stroke(); c.restore(); }

MG.add({
  id: 'glean', stage: 'brave', cmd: 'GLEAN!', hint: 'tap', time: 5, mood: 'bright', winText: 'Plenty!',
  card: { title: 'Ruth in the barley field', ref: 'Ruth 1–2', kind: 'Story', text: 'The book of Ruth tells how Ruth, a woman from Moab, stayed with her mother-in-law Naomi after both their husbands died. Ruth gathered leftover barley in the field of a man named Boaz, who told his workers to leave extra for her on purpose.', note: 'Ruth is a short story, and scholars do not know whether Ruth was a real person. It was told to show that a foreigner from Moab belongs among God\'s people, and it says she became King David\'s great-grandmother.', ask: 'Boaz quietly made sure a newcomer had enough. How could you quietly help someone new?' },
  init(g) {
    const s = g.s, need = [4, 5, 7][g.level], drops = [1, 2, 3][g.level];
    s.need = need; s.got = 0; s.stalks = []; s.flying = []; s.misses = []; s.dropAt = [];
    const place = () => { for (let k = 0; k < 200; k++) { const x = 60 + Math.random() * 230, y = 486 + Math.random() * 84; if (x < 128 && y > 486) continue; if (s.stalks.some(o => !o.got && Math.hypot(o.x - x, o.y - y) < 62)) continue; return [x, y]; } return [180 + Math.random() * 100, 520]; };
    s.place = place;
    for (let i = 0; i < need - drops; i++) { const [x, y] = place(); s.stalks.push({ x, y, rot: (Math.random() - 0.5) * 0.9, got: false, ph: Math.random() * 6, born: -1 }); }
    for (let i = 0; i < drops; i++) s.dropAt.push({ t: 0.75 + i * [0.9, 0.7, 0.55][g.level] / g.speed, who: i % 2 });
    s.winT = -1; s.chaff = Array.from({ length: 22 }, () => ({ x: Math.random() * W, y: 150 + Math.random() * 420, v: 6 + Math.random() * 10, ph: Math.random() * 6, r: 0.8 + Math.random() * 1.6 }));
  },
  update(g, dt) {
    const s = g.s;
    for (const d of s.dropAt) if (!d.done && g.t >= d.t) { d.done = true; const r = REAPERS[d.who]; const [x, y] = s.place();
      s.stalks.push({ x, y, rot: (Math.random() - 0.5) * 0.9, got: false, ph: Math.random() * 6, born: g.t, fx: r.x + 12, fy: r.y - 26 }); r.dropT = g.t; g.sfx('rustle'); }
    for (const f of s.flying) if (!f.landed && g.t - f.t > 0.38) { f.landed = true; s.got++; g.burst(HAND.x + 6, HAND.y - 6, ['#ffe08a', '#fff6d0', '#f0b84a'], 10, 120); g.sfx('coin', { pitch: 0.9 + s.got * 0.06 });
      if (s.got >= s.need && !g.done) { s.winT = g.t; g.win(); g.sfx('cheer'); g.burst(HAND.x + 6, HAND.y - 20, ['#ffe08a', '#fff6d0', '#ffb05a', '#ffffff'], 26, 220); } }
    for (const p of s.chaff) { p.y -= p.v * dt; p.x += Math.sin(g.t * 1.3 + p.ph) * 8 * dt + 4 * dt; if (p.y < 120) { p.y = 580; p.x = Math.random() * W; } if (p.x > W + 5) p.x = -5; }
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = 44;
    for (const o of s.stalks) { if (o.got || (o.born >= 0 && g.t - o.born < 0.35)) continue; const d = Math.hypot(o.x - x, o.y - 6 - y); if (d < bd) { bd = d; best = o; } }
    if (!best) { s.misses.push({ x, y, t: g.t }); g.sfx('tap'); return; }
    best.got = true; s.flying.push({ x: best.x, y: best.y, rot: best.rot, t: g.t });
    g.burst(best.x, best.y - 8, ['#ffe08a', '#fff6d0', '#d8a040'], 12, 140); g.sfx('swoosh', { pitch: 1 + s.flying.length * 0.05 });
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.6 || g.t - (s.botT || 0) < (g.level ? 0.3 : 0.42)) return;
    const o = s.stalks.find(q => !q.got && (q.born < 0 || g.t - q.born > 0.4)); if (!o) return; s.botT = g.t; synth('down', o.x, o.y - 6); synth('up', o.x, o.y - 6);
  },
  draw(g, c) {
    const s = g.s, t = g.t, p = Math.min(1, t / g.dur), won = s.winT >= 0;
    c.drawImage(g.bake('brave_glean_sky', o => {
      P.sky(o, W, H, ['#5f8fd0', '#9cc0e0', '#f6d6a0', '#f7b878', '#f0a868']);
      P.cloud(o, 70, 110, 0.85, '#fff4e4', '#f0b0a8', 0.9); P.cloud(o, 210, 70, 0.6, '#fff4e4', '#f0b0a8', 0.75);
    }), 0, 0, W, H);
    // the sun sinks as time runs out, warming the whole sky
    const sx = SUN0.x + (SUN1.x - SUN0.x) * p, sy = SUN0.y + (SUN1.y - SUN0.y) * p;
    c.save(); const warm = c.createLinearGradient(0, 0, 0, 340); warm.addColorStop(0, `rgba(160,90,170,${0.28 * p})`); warm.addColorStop(1, `rgba(255,120,70,${0.32 * p})`); c.fillStyle = warm; c.fillRect(0, 0, W, 340); c.restore();
    sunDisc(c, sx, sy, 22, P.mix('#ffd890', '#ff9a50', p), 240);
    c.drawImage(g.bake('brave_glean_land', o => {
      // far hills with Bethlehem's houses catching the light
      P.hills(o, W, 312, 34, '#b89ab8', '#9a7aa0', { seed: 12, freq: 0.01, dabs: 40, bottom: 400 });
      const vr = P.rng(4); for (let i = 0; i < 9; i++) { const hx = 22 + i * 13 + vr() * 6, hy = 300 - Math.sin(i * 0.5) * 8; P.house(o, hx, hy + 4, 12 + vr() * 6, 9 + vr() * 6, ['#f2d8b0', '#e8c49a', '#f6e2c4'][i % 3], { door: '#8a5a3a', window: false }); }
      P.tree(o, 168, 318, 0.32, '#7a8a5a', 6); P.tree(o, 200, 322, 0.26, '#7a8a5a', 7);
      // the golden fields in long rows, the standing barley still to cut
      P.hills(o, W, 352, 22, '#f2c860', '#d89a3a', { seed: 17, freq: 0.008, dabs: 90, rim: '#fff0b0', bottom: 460 });
      o.save(); ridgePathClip(o); const r = P.rng(21); for (let i = 0; i < 520; i++) { const x = r() * W, y = 336 + r() * 90; stalk(o, x, y, 7 + (y - 330) * 0.12, (r() - 0.5) * 0.3, r() < 0.5 ? '#f6cf62' : '#e2ac44', y > 380 ? 1 : 0); } o.restore();
      o.strokeStyle = 'rgba(160,100,40,0.25)'; o.lineWidth = 1; for (let i = 0; i < 7; i++) { o.beginPath(); o.moveTo(-10, 360 + i * 10); o.quadraticCurveTo(180, 350 + i * 13, 370, 362 + i * 9); o.stroke(); }
      // the harvested near field: warm stubble, a stood-up sheaf or two
      P.hills(o, W, 446, 14, '#e8b660', '#c88a40', { seed: 31, freq: 0.01, dabs: 160, rim: '#ffe6a0' });
      const r2 = P.rng(33); o.lineCap = 'round'; for (let i = 0; i < 420; i++) { const x = r2() * W, y = 446 + r2() * 200, h = 2 + (y - 440) * 0.025; o.strokeStyle = r2() < 0.5 ? 'rgba(250,220,140,0.7)' : 'rgba(150,90,30,0.45)'; o.lineWidth = 1 + (y - 440) * 0.004; o.beginPath(); o.moveTo(x, y); o.lineTo(x + (r2() - 0.5) * 2, y - h); o.stroke(); }
      sheaf(o, 346, 592, 1.05); sheaf(o, 22, 462, 0.7);
      // long evening shadows falling toward the viewer
      const sh = o.createLinearGradient(0, 446, 0, 640); sh.addColorStop(0, 'rgba(120,60,40,0)'); sh.addColorStop(1, 'rgba(120,60,60,0.22)'); o.fillStyle = sh; o.fillRect(0, 446, W, 194);
    }), 0, 0, W, H);
    // god-rays from the low sun through the dusty air
    P.rays(c, sx, sy, W, H, '#fff0c0', 0.1 + 0.05 * Math.sin(t * 1.5), 9, t);
    for (let i = 0; i < 3; i++) bird(c, (60 + i * 26 + t * 18) % (W + 40) - 20, 150 + i * 9 + Math.sin(t * 2 + i) * 3, 0.8 - i * 0.12, t);
    // a swaying front row of standing barley that the reapers stand in
    const sway = Math.sin(t * 1.6) * 0.06;
    for (let i = 0; i < 46; i++) { const x = i * 8 + (i * 37 % 7), y = 430 + (i * 13 % 9); stalk(c, x, y, 26 + (i * 7 % 11), sway + Math.sin(t * 2.1 + i * 0.6) * 0.05 - 0.05, i % 3 ? '#f2c65a' : '#ffd877'); }
    // Boaz watching kindly, and his workers reaping; they drop handfuls on purpose
    P.person(c, BOAZ.x, BOAZ.y, BOAZ.s, { ...BOAZ.look, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'wave', t, facing: -1, phase: 1 });
    for (const r of REAPERS) { const dropping = r.dropT != null && t - r.dropT < 0.6;
      P.person(c, r.x, r.y, r.s, { ...r.look, expr: dropping ? 'laugh' : 'happy', arms: dropping ? 'reach' : won ? 'cheer' : 'hold', t, phase: r.ph, bounce: 2, facing: r.ph ? -1 : 1, hold: dropping ? null : (cc, hx, hy) => { cc.strokeStyle = '#8a8a90'; cc.lineWidth = 2.4; cc.beginPath(); cc.arc(hx + 9, hy - 2, 8, -1.6 + Math.sin(t * 6 + r.ph) * 0.4, 1.2 + Math.sin(t * 6 + r.ph) * 0.4); cc.stroke(); } }); }
    // fallen handfuls glow so small hands know where to tap
    for (const o of s.stalks) {
      if (o.got) continue;
      let x = o.x, y = o.y, rot = o.rot;
      if (o.born >= 0) { const q = eo((t - o.born) / 0.35); x = o.fx + (o.x - o.fx) * q; y = o.fy + (o.y - o.fy) * q - Math.sin(q * Math.PI) * 40; rot = o.rot + (1 - q) * 3; }
      const pulse = 0.5 + 0.5 * Math.sin(t * 5 + o.ph);
      c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x, y - 4, 2, x, y - 4, 40); gl.addColorStop(0, `rgba(255,220,120,${0.35 + 0.25 * pulse})`); gl.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y - 4, 40, 0, 7); c.fill(); c.restore();
      handful(c, x, y + Math.sin(t * 3 + o.ph) * 1.2, 1.15, rot, t);
      if (pulse > 0.75) { c.save(); c.globalAlpha = (pulse - 0.75) * 4; c.fillStyle = '#fffbe0'; drawStar(c, x + 10, y - 16, 5, t * 2); c.restore(); }
    }
    // stalks flying into Ruth's arms
    for (const f of s.flying) { if (f.landed) continue; const q = eo((t - f.t) / 0.38); const x = f.x + (HAND.x + 4 - f.x) * q, y = f.y + (HAND.y - f.y) * q - Math.sin(q * Math.PI) * 70; handful(c, x, y, 1.15 - q * 0.4, f.rot + q * 4, t); }
    for (const m of s.misses) { const q = (t - m.t) / 0.4; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#fff2c8'; c.lineWidth = 2; c.beginPath(); c.arc(m.x, m.y, 6 + q * 14, 0, 7); c.stroke(); c.restore(); }
    // Ruth, with her armful growing
    const happy = won || s.flying.some(f => t - f.t < 0.7);
    if (won) { c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(HAND.x, HAND.y - 20, 4, HAND.x, HAND.y - 20, 90); gl.addColorStop(0, 'rgba(255,230,140,0.55)'); gl.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = gl; c.beginPath(); c.arc(HAND.x, HAND.y - 20, 90, 0, 7); c.fill(); c.restore(); }
    P.person(c, RUTH.x, RUTH.y - (won ? Math.abs(Math.sin((t - s.winT) * 10)) * 8 : 0), RUTH.s, { skin: SK[2], robe: CL.teal, stripe: CL.saffron, sash: CL.gold, hairStyle: 'long', hair: HR[1], expr: won ? 'laugh' : happy ? 'happy' : 'wow', arms: 'hold', t });
    bundle(c, HAND.x + 2, HAND.y - 2 - (won ? Math.abs(Math.sin((t - s.winT) * 10)) * 8 : 0), s.got, t);
    // chaff and dust glinting in the evening light
    c.save(); c.globalCompositeOperation = 'lighter'; for (const d of s.chaff) { c.fillStyle = `rgba(255,236,170,${0.35 + 0.3 * Math.sin(t * 3 + d.ph)})`; c.beginPath(); c.arc(d.x, d.y, d.r, 0, 7); c.fill(); } c.restore();
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
function sunDisc(c, x, y, r, col, glow) {
  const g1 = c.createRadialGradient(x, y, 0, x, y, glow); g1.addColorStop(0, P.rgba(col, 0.7)); g1.addColorStop(0.25, P.rgba(col, 0.26)); g1.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g1; c.fillRect(x - glow, y - glow, glow * 2, glow * 2);
  const d = c.createRadialGradient(x, y, 0, x, y, r); d.addColorStop(0, '#fffdf2'); d.addColorStop(0.7, P.shade(col, 0.6)); d.addColorStop(1, P.rgba(col, 0)); c.fillStyle = d; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
}
function ridgePathClip(o) { o.beginPath(); o.rect(0, 330, W, 110); o.clip(); }
