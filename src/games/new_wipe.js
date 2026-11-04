// WIPE! — Revelation 21:3–4. "God will wipe every tear from their eyes." Rub each sad face until the tears are gone and they smile.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const JEWELS = ['#4a7fd8', '#3fae7a', '#d84a5a', '#9a5ad8', '#f2c14a', '#3fc0c0', '#e8884a', '#7ad06a', '#e86aa8'];
// the friends who are crying (a mix of ancient and modern clothes, the whole range of skin tones)
const PEOPLE = [
  { skin: SK[5], robe: '#f2c23a', pants: '#3a5a8a', outfit: 'modern', hoodie: true, hairStyle: 'curly', hair: HR[3], child: true },
  { skin: SK[1], robe: CL.teal, stripe: CL.cream, hairStyle: 'long', hair: HR[2] },
  { skin: SK[3], robe: '#6a7ac8', pants: '#4a4a5a', outfit: 'modern', cardigan: '#8a9a4a', hairStyle: 'short', hair: HR[5], beard: '#e8e2da', glasses: true }, // a grandpa
  { skin: SK[4], robe: CL.terracotta, stripe: CL.sand, hairStyle: 'bun', hair: HR[0] },
  { skin: SK[2], robe: '#e07a8a', pants: '#5a4a8a', outfit: 'modern', skirt: true, hairStyle: 'long', hair: HR[1], child: true },
  { skin: SK[0], robe: CL.indigo, stripe: CL.gold, hairStyle: 'short', hair: HR[4], beard: true },
];
// standing spots, front row first; the back row is a little smaller
const SLOTS = { 3: [[70, 478, 1.8], [290, 478, 1.8], [180, 590, 1.85]], 4: [[76, 446, 1.62], [284, 446, 1.62], [118, 592, 1.7], [242, 592, 1.7]], 5: [[58, 430, 1.5], [180, 418, 1.45], [302, 430, 1.5], [116, 592, 1.62], [244, 592, 1.62]] };

MG.add({
  id: 'wipe', stage: 'new', cmd: 'WIPE!', hint: 'drag', time: 6, mood: 'bright', winText: 'Smiles!',
  card: {
    title: 'Every tear wiped away', ref: 'Revelation 21:1–5', kind: 'Vision',
    text: 'The book of Revelation tells about a vision John had of a new heaven and a new earth, where God lives right among the people. In the vision, God wipes every tear from their eyes, and there is no more crying and no more pain.',
    note: 'Revelation is a vision full of pictures, written to give hope to people who were going through hard times.',
    ask: 'When someone near you is sad, what could you do to help them feel better?',
  },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    s.need = [360, 400, 430][g.level];
    // which friends cry: always some people and at least one animal; the lion and the lamb together from level 1
    const ppl = PEOPLE.slice().sort(() => Math.random() - 0.5);
    let kinds = n === 3 ? ['p', Math.random() < 0.5 ? 'lion' : 'lamb', 'p'] : n === 4 ? ['p', 'lion', 'p', 'lamb'] : ['p', 'lion', 'p', 'lamb', 'p'];
    kinds = kinds.slice().sort(() => Math.random() - 0.5);
    let pi = 0;
    s.who = kinds.map((k, i) => {
      const [x, y, sc] = SLOTS[n][i];
      const w = { kind: k, x, y, sc, prog: 0, done: false, doneT: 0, phase: Math.random() * 6, drops: [], dropT: Math.random() * 0.3, look: k === 'p' ? ppl[pi++] : null, rubT: -9 };
      // where the face is (for rubbing and tears)
      if (k === 'p') { const Hh = w.look.child ? 0.82 : 1; w.fr = (w.look.child ? 15 : 16) * sc; w.fx = x; w.fy = y + (-40 * Hh - 15) * sc - 1 * sc; }
      else if (k === 'lion') { w.fr = 20 * sc * 0.9; w.fx = x; w.fy = y - 64 * sc * 0.9; }
      else { w.fr = 14 * sc * 0.95; w.fx = x; w.fy = y - 50 * sc * 0.95; }
      return w;
    });
    s.cloth = null; s.last = null; s.sndT = 0;
  },
  down(g, x, y) { const s = g.s; s.cloth = { x, y, rot: 0 }; s.last = [x, y]; },
  move(g, x, y) {
    const s = g.s; if (!s.cloth) return; const [lx, ly] = s.last; s.last = [x, y];
    const d = Math.min(30, Math.hypot(x - lx, y - ly)); s.cloth.x = x; s.cloth.y = y; s.cloth.rot = Math.max(-0.6, Math.min(0.6, (x - lx) * 0.04));
    for (const w of s.who) {
      if (w.done || Math.hypot(x - w.fx, y - w.fy) > w.fr + 26) continue;
      w.prog = Math.min(1, w.prog + d / s.need); w.rubT = g.t;
      if (g.t - s.sndT > 0.16) { s.sndT = g.t; g.sfx('sweep'); g.burst(x, y, ['#ffffff', '#cfefff', '#fff6c0'], 3, 70); }
      if (w.prog >= 1) {
        w.done = true; w.doneT = g.t; g.sfx(w.kind === 'lion' ? 'roar' : w.kind === 'lamb' ? 'baa' : 'laugh'); g.sfx('sparkle');
        g.burst(w.fx, w.fy, ['#ffd45a', '#ffffff', '#ff9ac0', '#9fe0ff', '#b8f0a0'], 22, 200);
        if (s.who.every(v => v.done)) { g.win(); g.sfx('cheer'); }
      }
    }
  },
  up(g) { const s = g.s; s.cloth = null; s.last = null; },
  update(g, dt) {
    const s = g.s;
    for (const w of s.who) {
      // tears drip from the chin while someone is still crying
      if (!w.done) { w.dropT -= dt; if (w.dropT <= 0) { w.dropT = 0.22 + w.prog * 0.5 + Math.random() * 0.12; for (const sd of [-1, 1]) if (Math.random() < 0.75) w.drops.push({ x: w.fx + sd * w.fr * 0.62, y: w.fy + w.fr * 0.7, vy: 20, a: 1 }); } }
      for (const d of w.drops) { d.vy += 420 * dt; d.y += d.vy * dt; if (d.y > w.y - 2) d.a = 0; }
      w.drops = w.drops.filter(d => d.a > 0);
    }
  },
  auto(g, dt, synth) { // rub each face quickly back and forth
    const s = g.s; if (g.t < 0.3) return; const w = s.who.find(v => !v.done); if (!w) { if (s.cloth) synth('up', 0, 0); return; }
    if (s.botW !== w) { if (s.cloth) synth('up', 0, 0); s.botW = w; synth('down', w.fx, w.fy); return; }
    s.botK = (s.botK || 0) + 1; const ph = (s.botK % 4) / 4; synth('move', w.fx + Math.sin(ph * Math.PI * 2) * 22, w.fy + Math.cos(s.botK) * 3);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win';
    c.drawImage(g.bake('new_wipe_bg', paintBg), 0, 0, W, H);
    P.rays(c, 180, 160, W, H, '#fff2c8', 0.1 + (won ? 0.12 : 0) + s.who.filter(w => w.done).length * 0.02, 11, t);
    P.cloud(c, 62 + Math.sin(t * 0.3) * 6, 104, 0.6, '#fff4f0', '#eab0c8', 0.85); P.cloud(c, 300 - Math.sin(t * 0.25) * 6, 78, 0.48, '#fff4f0', '#eab0c8', 0.8);
    // butterflies once anyone is smiling
    const happy = s.who.filter(w => w.done).length;
    for (let i = 0; i < happy; i++) butterfly(c, 40 + ((i * 97 + t * 30) % 280), 300 + Math.sin(t * 1.4 + i * 2) * 40, t + i, ['#f2a0c8', '#f4d35e', '#9fd8ff', '#c8a0f0', '#ffb070'][i % 5]);
    const list = s.who.slice().sort((a, b) => a.y - b.y);
    for (const w of list) drawFriend(c, w, t, s);
    // the soft cloth under the finger
    if (s.cloth && !g.done) cloth(c, s.cloth.x, s.cloth.y, s.cloth.rot, t);
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});

function drawFriend(c, w, t, s) {
  const p = w.prog, ft = t - w.doneT, rubbing = t - w.rubT < 0.15;
  // a little drizzle cloud over anyone still crying; it turns into a rainbow when they smile
  const cx = w.fx, cy = w.fy - w.fr * 2.5;
  if (!w.done) {
    const a = 1 - p * 0.7; c.save(); c.globalAlpha = a; P.cloud(c, cx, cy + Math.sin(t * 2 + w.phase) * 2, 0.32 * w.sc / 1.42, '#c8cede', '#8a90aa', 1);
    c.strokeStyle = 'rgba(150,180,230,0.7)'; c.lineWidth = 1.4; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const yy = ((t * 90 + i * 9) % 22); c.beginPath(); c.moveTo(cx - 12 + i * 8, cy + 10 + yy); c.lineTo(cx - 13 + i * 8, cy + 15 + yy); c.stroke(); } c.restore();
    // a soft glow that says "here"
    const pu = 0.5 + 0.5 * Math.sin(t * 5 + w.phase); const gl = c.createRadialGradient(w.fx, w.fy, w.fr * 0.6, w.fx, w.fy, w.fr * 2); gl.addColorStop(0, `rgba(255,250,220,${0.25 + 0.2 * pu + (rubbing ? 0.25 : 0)})`); gl.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = gl; c.beginPath(); c.arc(w.fx, w.fy, w.fr * 2, 0, 7); c.fill();
  } else {
    const k = Math.min(1, ft * 3); c.save(); c.globalAlpha = k; rainbow(c, cx, cy + 14, 26 * w.sc / 1.42 * (0.6 + 0.4 * k)); c.restore();
    const gl = c.createRadialGradient(w.fx, w.fy + 10, 4, w.fx, w.fy + 10, w.fr * 3.4); gl.addColorStop(0, 'rgba(255,240,170,0.55)'); gl.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gl; c.beginPath(); c.arc(w.fx, w.fy + 10, w.fr * 3.4, 0, 7); c.fill();
  }
  const hop = w.done ? Math.abs(Math.sin(t * 8 + w.phase)) * 7 * Math.min(1, ft * 3) : 0;
  const wig = rubbing ? Math.sin(t * 40) * 1.2 : 0;
  const expr = w.done ? 'laugh' : p > 0.55 ? 'surprised' : 'sad';
  c.save(); c.translate(wig, -hop);
  if (w.kind === 'p') P.person(c, w.x, w.y + hop, w.sc, { ...w.look, t, phase: w.phase, bounce: w.done ? 1.5 : 0, expr, arms: w.done ? 'cheer' : p > 0.55 ? 'down' : 'pray' });
  else if (w.kind === 'lion') lionFront(c, w.x, w.y + hop, w.sc * 0.9, expr, t);
  else lambFront(c, w.x, w.y + hop, w.sc * 0.95, expr, t);
  c.restore();
  // tears: a wet stream down each cheek that shrinks as you wipe, and drops falling to the ground
  if (!w.done) {
    const a = 1 - p, r = w.fr;
    c.save(); c.lineCap = 'round';
    for (const sd of [-1, 1]) {
      const ex = w.fx + sd * r * 0.37 + wig, ey = w.fy + r * 0.2;
      c.strokeStyle = `rgba(150,215,255,${0.75 * a})`; c.lineWidth = Math.max(1, r * 0.16 * a);
      c.beginPath(); c.moveTo(ex, ey); c.quadraticCurveTo(ex + sd * r * 0.16, ey + r * 0.4, w.fx + sd * r * 0.62 + wig, w.fy + r * 0.72); c.stroke();
      const ty = ey + r * 0.2 + ((t * 1.6 + (sd > 0 ? 0.5 : 0) + w.phase) % 1) * r * 0.45, tr = r * 0.17 * (0.4 + 0.6 * a);
      tear(c, ex + sd * r * 0.12, ty, tr, a);
    }
    for (const d of w.drops) tear(c, d.x, d.y, w.fr * 0.1, 0.85 * a + 0.15);
    c.restore();
  } else if (ft < 1.2) {
    c.save(); c.globalAlpha = 1 - ft / 1.2; c.fillStyle = '#ff7a9a'; for (let i = 0; i < 3; i++) heart(c, w.fx - 18 + i * 18, w.fy - w.fr - 10 - ft * 46 - (i % 2) * 8, 5.5); c.restore();
  }
}
function tear(c, x, y, r, a) {
  c.fillStyle = `rgba(160,220,255,${a})`; c.strokeStyle = `rgba(80,150,210,${a * 0.7})`; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x, y - r * 2); c.quadraticCurveTo(x + r * 1.1, y - r * 0.2, x, y + r); c.quadraticCurveTo(x - r * 1.1, y - r * 0.2, x, y - r * 2); c.fill(); c.stroke();
  c.fillStyle = `rgba(255,255,255,${a * 0.9})`; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.2, r * 0.3, 0, 7); c.fill();
}
function rainbow(c, x, y, r) {
  const cols = ['#e85a5a', '#f2a03a', '#f6d23a', '#5ab85a', '#4a8ad8', '#8a5ad0']; c.lineCap = 'round';
  cols.forEach((col, i) => { c.strokeStyle = col; c.lineWidth = r * 0.12; c.beginPath(); c.arc(x, y, r - i * r * 0.11, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); });
  c.fillStyle = '#fffaf0'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(x + sd * r * 0.82, y - r * 0.02, r * 0.22, 0, 7); c.arc(x + sd * r * 0.62, y + r * 0.05, r * 0.17, 0, 7); c.arc(x + sd * r * 1.0, y + r * 0.06, r * 0.15, 0, 7); c.fill(); }
}
function cloth(c, x, y, rot, t) {
  c.save(); c.translate(x + 6, y + 8); c.rotate(rot + 0.2);
  c.fillStyle = 'rgba(60,20,60,0.18)'; c.beginPath(); c.ellipse(4, 6, 20, 14, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(-18, -14, 18, 14); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#ffd8e6'); c.fillStyle = g; c.strokeStyle = '#e88aa8'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(-18, -12); c.quadraticCurveTo(0, -18 + Math.sin(t * 20) * 2, 18, -12); c.quadraticCurveTo(22, 0, 17, 13); c.quadraticCurveTo(0, 18, -17, 13); c.quadraticCurveTo(-22, 0, -18, -12); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(232,138,168,0.6)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(-13, -8); c.quadraticCurveTo(0, -12, 13, -8); c.quadraticCurveTo(16, 0, 12, 9); c.quadraticCurveTo(0, 12, -12, 9); c.quadraticCurveTo(-16, 0, -13, -8); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#f27a9a'; heart(c, 0, 0, 4);
  c.restore();
}
// a cuddly lion sitting and facing us
function lionFront(c, x, y, s, expr, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,20,40,0.22)'; c.beginPath(); c.ellipse(0, 0, 26, 6, 0, 0, 7); c.fill();
  // tail
  c.strokeStyle = '#d29a52'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(14, -8); c.quadraticCurveTo(36, -6, 32 + Math.sin(t * 3) * 3, -26); c.stroke(); c.fillStyle = '#a8541f'; c.beginPath(); c.arc(32 + Math.sin(t * 3) * 3, -28, 5, 0, 7); c.fill();
  // body and paws
  c.fillStyle = soft(c, '#e8b066', 0, -24, 22); c.beginPath(); c.ellipse(0, -22, 19, 22, 0, 0, 7); c.fill();
  c.fillStyle = '#f6d6a0'; c.beginPath(); c.ellipse(0, -18, 10, 14, 0, 0, 7); c.fill();
  for (const sd of [-1, 1]) { c.fillStyle = soft(c, '#eab56a', sd * 9, -5, 8); c.beginPath(); c.ellipse(sd * 9, -5, 8, 6, 0, 0, 7); c.fill(); c.strokeStyle = '#b77a35'; c.lineWidth = 1; for (const k of [-2.5, 2.5]) { c.beginPath(); c.moveTo(sd * 9 + k, -3); c.lineTo(sd * 9 + k, -0.5); c.stroke(); } }
  // mane
  const hy = -64, mane = '#c0601f'; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; c.fillStyle = i % 2 ? mane : P.shade(mane, 0.18); c.beginPath(); c.arc(Math.cos(a) * 24, hy + Math.sin(a) * 23, 11, 0, 7); c.fill(); }
  // ears
  for (const sd of [-1, 1]) { c.fillStyle = '#e0a85a'; c.beginPath(); c.arc(sd * 15, hy - 16, 6.5, 0, 7); c.fill(); c.fillStyle = '#f2b8a8'; c.beginPath(); c.arc(sd * 15, hy - 16, 3.5, 0, 7); c.fill(); }
  c.fillStyle = soft(c, '#f0bc72', 0, hy, 21); c.beginPath(); c.arc(0, hy, 20, 0, 7); c.fill();
  c.fillStyle = '#fbe6c2'; c.beginPath(); c.ellipse(-5, hy + 9, 7, 5.5, 0, 0, 7); c.ellipse(5, hy + 9, 7, 5.5, 0, 0, 7); c.fill();
  P.face(c, 0, hy - 2, 20, { expr });
  c.fillStyle = '#6a2a1a'; c.beginPath(); c.moveTo(-3.5, hy + 4); c.lineTo(3.5, hy + 4); c.lineTo(0, hy + 7.5); c.closePath(); c.fill();
  c.restore();
}
// a woolly lamb facing us
function lambFront(c, x, y, s, expr, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,20,40,0.22)'; c.beginPath(); c.ellipse(0, 0, 22, 5, 0, 0, 7); c.fill();
  c.strokeStyle = '#5a4040'; c.lineWidth = 4.5; c.lineCap = 'round'; for (const lx of [-9, -3, 3, 9]) { c.beginPath(); c.moveTo(lx, -12); c.lineTo(lx, -2); c.stroke(); }
  const wool = '#fbf5ea', puffs = [[-14, -22, 9], [-6, -28, 10], [6, -28, 10], [14, -22, 9], [-10, -14, 9], [0, -16, 10], [10, -14, 9]];
  c.fillStyle = P.shade(wool, -0.18); for (const [px, py, pr] of puffs) { c.beginPath(); c.arc(px + 1, py + 2, pr, 0, 7); c.fill(); }
  for (const [px, py, pr] of puffs) { c.fillStyle = soft(c, wool, px, py, pr); c.beginPath(); c.arc(px, py, pr * 0.93, 0, 7); c.fill(); }
  const hy = -50;
  // floppy ears
  for (const sd of [-1, 1]) { c.save(); c.translate(sd * 14, hy - 2); c.rotate(sd * (0.5 + (expr === 'sad' ? 0.5 : 0))); c.fillStyle = '#e8d6c6'; c.beginPath(); c.ellipse(sd * 6, 0, 8, 4, 0, 0, 7); c.fill(); c.fillStyle = '#f2b8b8'; c.beginPath(); c.ellipse(sd * 6, 0, 5, 2.2, 0, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = soft(c, '#f6ebe0', 0, hy, 14); c.beginPath(); c.ellipse(0, hy, 14, 14.5, 0, 0, 7); c.fill(); c.strokeStyle = '#c8b0a0'; c.lineWidth = 1; c.stroke();
  // wool topknot
  for (let i = 0; i < 5; i++) { c.fillStyle = soft(c, wool, -8 + i * 4, hy - 13, 5); c.beginPath(); c.arc(-8 + i * 4, hy - 13 + (i % 2) * -2, 5, 0, 7); c.fill(); }
  P.face(c, 0, hy, 14, { expr });
  c.fillStyle = '#c87a8a'; c.beginPath(); c.ellipse(0, hy + 4, 2.4, 1.6, 0, 0, 7); c.fill();
  c.restore();
}
function soft(c, col, x0, y0, r) { const g = c.createRadialGradient(x0 - r * 0.4, y0 - r * 0.5, 1, x0, y0, r * 1.2); g.addColorStop(0, P.shade(col, 0.22)); g.addColorStop(1, P.shade(col, -0.12)); return g; }
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
function butterfly(c, x, y, t, col) { c.save(); c.translate(x, y); const f = Math.abs(Math.sin(t * 14)); c.fillStyle = col; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 4 * f, -2, 4 * f + 0.6, 5, sd * 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(sd * 3 * f, 3, 3 * f + 0.5, 3, -sd * 0.3, 0, 7); c.fill(); } c.fillStyle = '#4a2a30'; c.fillRect(-0.7, -4, 1.4, 8); c.restore(); }
function gem(o, x, y, r, col) {
  const g = o.createRadialGradient(x - r * 0.4, y - r * 0.4, 0.5, x, y, r); g.addColorStop(0, P.shade(col, 0.6)); g.addColorStop(0.5, col); g.addColorStop(1, P.shade(col, -0.35));
  o.fillStyle = g; o.beginPath(); o.arc(x, y, r, 0, 7); o.fill(); o.fillStyle = 'rgba(255,255,255,0.8)'; o.beginPath(); o.arc(x - r * 0.35, y - r * 0.4, r * 0.25, 0, 7); o.fill();
}

// ---------- background: a garden terrace outside the shining city at dawn ----------
function paintBg(o) {
  P.sky(o, W, H, ['#9a7ad8', '#f0a0c4', '#ffcaa0', '#fff0c8'], { x: 180, y: 160, r: 30, color: '#fff4d0', glow: 300 });
  P.stars(o, W, 80, 14, 9, 0);
  // the city on the far hill: glowing jasper walls, golden towers and a jewelled foundation
  P.hills(o, W, 262, 22, '#e6b8c8', '#d8a8b8', { seed: 51, freq: 0.012, dabs: 20, bottom: 330 });
  const cy = 250;
  const wg = o.createLinearGradient(0, cy - 40, 0, cy); wg.addColorStop(0, '#fff6ea'); wg.addColorStop(1, '#f2d4c0'); o.fillStyle = wg; o.fillRect(40, cy - 34, 280, 34);
  for (let i = 0; i < 18; i++) { o.fillStyle = '#fbeedd'; o.fillRect(42 + i * 15.6, cy - 41, 9, 8); }
  for (const [tx, th] of [[52, 70], [110, 52], [180, 96], [250, 52], [308, 70]]) { const tg = o.createLinearGradient(tx - 13, 0, tx + 13, 0); tg.addColorStop(0, '#fff8ee'); tg.addColorStop(1, '#ecc8b0'); o.fillStyle = tg; o.fillRect(tx - 12, cy - th, 24, th);
    const dg = o.createRadialGradient(tx - 4, cy - th - 10, 1, tx, cy - th - 4, 16); dg.addColorStop(0, '#fff6c0'); dg.addColorStop(0.6, '#f2c14a'); dg.addColorStop(1, '#c08a2a'); o.fillStyle = dg; o.beginPath(); o.moveTo(tx - 13, cy - th + 1); o.quadraticCurveTo(tx - 12, cy - th - 18, tx, cy - th - 22); o.quadraticCurveTo(tx + 12, cy - th - 18, tx + 13, cy - th + 1); o.fill();
    o.fillStyle = '#ffe9a8'; o.fillRect(tx - 3, cy - th + 12, 6, 9); }
  // the gate glows
  const gg = o.createRadialGradient(180, cy - 16, 2, 180, cy - 16, 60); gg.addColorStop(0, 'rgba(255,255,240,1)'); gg.addColorStop(0.3, 'rgba(255,240,180,0.7)'); gg.addColorStop(1, 'rgba(255,240,180,0)'); o.fillStyle = gg; o.fillRect(100, cy - 80, 160, 100);
  o.fillStyle = '#fffbea'; o.beginPath(); o.moveTo(170, cy); o.lineTo(170, cy - 22); o.arc(180, cy - 22, 10, Math.PI, 0); o.lineTo(190, cy); o.fill();
  for (let i = 0; i < 22; i++) gem(o, 46 + i * 12.6, cy - 3, 2.6, JEWELS[i % 9]);
  // the crystal river winding from the gate down across the valley
  o.save(); const rg = o.createLinearGradient(0, cy, 0, 400); rg.addColorStop(0, '#f0fcff'); rg.addColorStop(1, '#78cfee'); o.fillStyle = rg;
  o.beginPath(); o.moveTo(176, cy); o.bezierCurveTo(160, 290, 60, 300, -10, 340); o.lineTo(-10, 372); o.bezierCurveTo(90, 330, 196, 300, 186, cy); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,255,255,0.8)'; o.lineWidth = 1.4; for (let i = 0; i < 5; i++) { const x = 140 - i * 32, y = 292 + i * 12; o.beginPath(); o.moveTo(x - 8, y); o.quadraticCurveTo(x, y - 2, x + 8, y); o.stroke(); } o.restore();
  // rolling garden in front
  P.hills(o, W, 330, 18, '#b8e080', '#8ac460', { seed: 52, freq: 0.014, dabs: 50, rim: '#f0ffc8' });
  P.tree(o, 330, 344, 0.7, '#6ac25a', 4); P.tree(o, 26, 360, 0.6, '#78c860', 7);
  P.hills(o, W, 390, 14, '#a8d870', '#70a848', { seed: 53, freq: 0.018, dabs: 110, rim: '#e8ffb0' });
  P.flowers(o, W, 395, H, 70, ['#f4d35e', '#ee6c8a', '#ffffff', '#b98ae0', '#7ad0f0'], 14);
  P.grassTufts(o, W, 395, H, 50, '#70a848', 15);
}
