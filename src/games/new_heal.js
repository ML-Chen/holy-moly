// HEAL! — Revelation 22:1–2. The tree of life grows on both banks of the crystal river, and its leaves are for the healing of the nations.
// Glowing leaves drift down; tap one (or drag it) and it flies to a gray, droopy friend, who blooms back into colour.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const FRUIT = ['#e84a5a', '#f2a03a', '#f6d23a', '#9ad04a', '#3fb07a', '#3fc0c0', '#4a8ad8', '#7a5ad8', '#c45ad0', '#ff7aa8', '#ff9a6a', '#ffe08a'];
const RIVER = { topY: 300, top: 14, botY: 640, bot: 64 };   // half-widths of the river at the top and bottom of the screen
const riverHalf = y => RIVER.top + (RIVER.bot - RIVER.top) * Math.max(0, (y - RIVER.topY) / (RIVER.botY - RIVER.topY));
const LOOKS = [
  { skin: SK[5], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[3] },
  { skin: SK[0], robe: '#5a8ad0', pants: '#3a3a4a', outfit: 'modern', hoodie: true, hairStyle: 'short', hair: HR[4], child: true },
  { skin: SK[3], robe: CL.plum, stripe: CL.gold, hairStyle: 'long', hair: HR[0] },
  { skin: SK[4], robe: '#e8e0d0', pants: '#6a4a3a', outfit: 'modern', cardigan: '#3f8f8a', hairStyle: 'bun', hair: HR[5], glasses: true }, // a grandma
  { skin: SK[1], robe: CL.teal, stripe: CL.cream, beard: true, hair: HR[2], head: 'wrap', headCol: CL.white },
  { skin: SK[2], robe: '#f07a6a', pants: '#3f5a8a', outfit: 'modern', hairStyle: 'long', hair: HR[1], child: true },
];
// spots on the two banks (x, y, scale), used in order
const SPOTS = [[64, 480, 1.45], [296, 480, 1.45], [104, 596, 1.6], [256, 596, 1.6], [36, 590, 1.5], [326, 590, 1.5]];
const ORDER = { 3: [0, 1, 3], 4: [0, 1, 2, 3], 5: [0, 1, 2, 3, 5] };

MG.add({
  id: 'heal', stage: 'new', cmd: 'HEAL!', hint: 'tap', time: 6, mood: 'bright', winText: 'Healed!',
  card: {
    title: 'Leaves for healing', ref: 'Revelation 22:1–5', kind: 'Vision',
    text: 'The book of Revelation tells about a vision John had of a river as clear as crystal, flowing from the throne of God through the middle of the city. On each side of the river grows the tree of life, with fruit every month and leaves for the healing of the nations.',
    note: 'Revelation is a vision full of pictures, written to give hope to people who were going through hard times.',
    ask: 'What helps you feel better when you are hurt or sad? How could you share that with someone else?',
  },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level], looks = LOOKS.slice().sort(() => Math.random() - 0.5);
    s.fall = [42, 56, 70][g.level] * Math.sqrt(g.speed);
    s.people = ORDER[n].map((k, i) => { const [x, y, sc] = SPOTS[k]; return { x, y, sc, look: looks[i], healT: -1, phase: Math.random() * 6, flower: FRUIT[(i * 5 + 2) % 12] }; });
    s.leaves = []; s.fly = []; s.spawnT = 0; s.held = null;
    for (let i = 0; i < 2; i++) spawn(s, 300 + i * 60);
    s.every = 0.62 / Math.sqrt(g.speed);
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = 44;
    for (const l of s.leaves) { const d = Math.hypot(l.x - x, l.y - y); if (d < bd) { bd = d; best = l; } }
    if (!best) { g.sfx('tap'); return; }
    if (!best) return; s.leaves.splice(s.leaves.indexOf(best), 1); s.held = { x: best.x, y: best.y, rot: best.rot, sx: x, sy: y }; g.sfx('rustle');
  },
  move(g, x, y) { const h = g.s.held; if (h) { h.x = x; h.y = y; } },
  up(g, x, y) {
    const s = g.s, h = s.held; if (!h) return; s.held = null;
    // a tap sends the leaf to the nearest sick friend; a drag sends it to the friend nearest where it was dropped
    const tgt = s.people.filter(p => p.healT < 0 && !s.fly.some(f => f.to === p)).sort((a, b) => Math.hypot(a.x - h.x, a.y - 50 - h.y) - Math.hypot(b.x - h.x, b.y - 50 - h.y))[0];
    if (!tgt) { s.leaves.push({ x: h.x, y: h.y, vy: s.fall, ph: Math.random() * 6, rot: h.rot, sp: 0 }); return; }
    s.fly.push({ x0: h.x, y0: h.y, to: tgt, t0: g.t, rot: h.rot }); g.sfx('whoosh'); g.burst(h.x, h.y, ['#d8ff9a', '#fff6c0', '#ffffff'], 6, 90);
  },
  update(g, dt) {
    const s = g.s;
    s.spawnT -= dt; if (s.spawnT <= 0 && !g.done) { s.spawnT = s.every * (0.85 + Math.random() * 0.3); spawn(s, 236); }
    for (const l of s.leaves) { l.y += l.vy * dt; l.ph += dt; l.x += Math.sin(l.ph * 2.2) * 34 * dt; l.rot = Math.sin(l.ph * 2.2) * 0.6; }
    for (const l of s.leaves) if (l.y > 560) l.fade = (l.fade || 0) + dt * 3;
    s.leaves = s.leaves.filter(l => (l.fade || 0) < 1);
    for (const f of s.fly) {
      if ((g.t - f.t0) / 0.38 >= 1 && !f.hit) {
        f.hit = true; const p = f.to; p.healT = g.t; g.sfx('grow'); g.sfx('sparkle');
        g.burst(p.x, p.y - 50 * p.sc, ['#ffd45a', '#ffffff', '#ff9ac0', '#9fe0ff', '#b8f0a0', p.flower], 26, 210);
        if (s.people.every(q => q.healT >= 0) && !g.done) { g.win(); g.sfx('cheer'); }
      }
    }
    s.fly = s.fly.filter(f => !f.hit);
  },
  auto(g, dt, synth) { // tap the lowest catchable leaf every 0.3 s
    const s = g.s; if (g.t < 0.3 || g.t - (s.botT || 0) < 0.3) return;
    const l = s.leaves.filter(q => q.y > 160 && q.y < 560).sort((a, b) => b.y - a.y)[0]; if (!l) return; s.botT = g.t;
    synth('down', l.x + 6, l.y - 4); synth('up', l.x + 6, l.y - 4);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win';
    c.drawImage(g.bake('new_heal_bg', paintBg), 0, 0, W, H);
    drawRiver(c, t);
    c.drawImage(g.bake('new_heal_tree', paintTree), 0, 0, W, H);
    // sunbeams through the leaves
    P.rays(c, 180, 236, W, H, '#fff4c8', 0.1 + (won ? 0.08 : 0), 9, t);
    // fruit glints in the canopy
    const r = P.rng(77); for (let i = 0; i < 24; i++) { const x = 20 + r() * 320, y = 60 + r() * 150, col = FRUIT[i % 12], tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7); fruit(c, x, y + Math.sin(t * 1.5 + i) * 1.2, 5.5, col, tw); }
    // friends on the banks
    const list = s.people.slice().sort((a, b) => a.y - b.y);
    for (const p of list) drawFriend(c, p, t);
    // falling leaves, a held leaf and leaves flying to a friend
    for (const l of s.leaves) { c.save(); c.globalAlpha = 1 - (l.fade || 0); leaf(c, l.x, l.y, l.rot, 1.35, t + l.ph); c.restore(); }
    if (s.held) leaf(c, s.held.x, s.held.y - 8, s.held.rot, 1.6, t);
    for (const f of s.fly) { const q = Math.min(1, (t - f.t0) / 0.38), e = q * q * (3 - 2 * q); const tx = f.to.x, ty = f.to.y - 50 * f.to.sc;
      const x = f.x0 + (tx - f.x0) * e, y = f.y0 + (ty - f.y0) * e - Math.sin(q * Math.PI) * 50;
      c.save(); c.globalAlpha = 0.5; c.strokeStyle = '#eaffb0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x - (tx - f.x0) * 0.08, y + 10); c.stroke(); c.restore();
      leaf(c, x, y, f.rot + q * 6, 1.4, t); }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});

function spawn(s, y) {
  // leaves let go from under the canopy, on either side of the river
  const side = Math.random() < 0.5 ? -1 : 1, x = 180 + side * (40 + Math.random() * 110);
  s.leaves.push({ x, y: y + Math.random() * 20, vy: s.fall * (0.85 + Math.random() * 0.3), ph: Math.random() * 6, rot: 0 });
}
function leaf(c, x, y, rot, s, t) {
  const pu = 0.5 + 0.5 * Math.sin(t * 6);
  const gl = c.createRadialGradient(x, y, 2, x, y, 30 * s); gl.addColorStop(0, `rgba(255,250,190,${0.7 + 0.25 * pu})`); gl.addColorStop(0.5, `rgba(230,255,170,${0.25 + 0.1 * pu})`); gl.addColorStop(1, 'rgba(240,255,190,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y, 30 * s, 0, 7); c.fill();
  c.save(); c.translate(x, y); c.rotate(rot - 0.6); c.scale(s, s);
  const g = c.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#7ad24a'); g.addColorStop(0.55, '#c8f46a'); g.addColorStop(1, '#fff6a0'); c.fillStyle = g; c.strokeStyle = '#3a8a2a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-15, 0); c.quadraticCurveTo(-2, -12, 15, 0); c.quadraticCurveTo(-2, 12, -15, 0); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,220,0.9)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-15, 0); c.lineTo(12, 0); for (const k of [-6, 0, 6]) { c.moveTo(k, 0); c.lineTo(k + 4, -5); c.moveTo(k, 0); c.lineTo(k + 4, 5); } c.stroke();
  c.strokeStyle = '#2f8a4a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-15, 0); c.lineTo(-20, 2); c.stroke();
  c.restore();
  c.save(); c.globalAlpha = pu; c.fillStyle = '#ffffff'; drawStar(c, x + 10 * s, y - 9 * s, 3.5 * s, t); c.restore();
}
function fruit(c, x, y, r, col, tw) {
  const g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 0.5, x, y, r); g.addColorStop(0, P.shade(col, 0.55)); g.addColorStop(0.6, col); g.addColorStop(1, P.shade(col, -0.3)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = `rgba(255,255,255,${0.5 + 0.4 * tw})`; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.4, r * 0.3, 0, 7); c.fill();
  if (tw > 0.85) { c.save(); c.globalAlpha = (tw - 0.85) * 6; c.fillStyle = '#fffbe0'; drawStar(c, x + r, y - r, 3, 0); c.restore(); }
}
// gray out a look: mix every colour toward a dull gray-blue
function dull(look, k) {
  if (k <= 0) return look; const o = { ...look }, G = '#9a9aa8';
  for (const f of ['skin', 'robe', 'stripe', 'hair', 'pants', 'cardigan', 'headCol']) if (typeof o[f] === 'string') o[f] = P.mix(o[f], G, k * 0.85);
  if (typeof o.beard === 'string') o.beard = P.mix(o.beard, G, k * 0.85); else if (o.beard === true) o.beard = P.mix(o.hair, G, k * 0.85);
  if (o.outfit === 'modern') o.shoes = P.mix('#f4f1ea', G, k * 0.6);
  return o;
}
function drawFriend(c, p, t) {
  const healed = p.healT >= 0, ht = healed ? t - p.healT : 0, k = healed ? Math.min(1, ht / 0.45) : 0;
  // a wilted flower beside each friend that blooms when they are healed
  flower(c, p.x + 22 * p.sc, p.y + 2, p.sc, k, p.flower, t);
  if (healed) { const gl = c.createRadialGradient(p.x, p.y - 40 * p.sc, 4, p.x, p.y - 40 * p.sc, 70 * p.sc); gl.addColorStop(0, `rgba(255,244,180,${0.55 * Math.min(1, ht * 3)})`); gl.addColorStop(1, 'rgba(255,244,180,0)'); c.fillStyle = gl; c.beginPath(); c.arc(p.x, p.y - 40 * p.sc, 70 * p.sc, 0, 7); c.fill(); }
  // droop: a slight lean and a squashed, tired stance; healing springs them upright
  const spring = healed ? 1 + Math.sin(Math.min(1, ht / 0.5) * Math.PI) * 0.08 : 0.93, lean = healed ? 0 : 0.1 * (p.x < 180 ? 1 : -1);
  const hop = healed ? Math.abs(Math.sin(t * 8 + p.phase)) * 6 * Math.min(1, ht * 2) : 0;
  c.save(); c.translate(p.x, p.y - hop); c.rotate(lean); c.scale(1, spring);
  P.person(c, 0, 0, p.sc, { ...dull(p.look, 1 - k), facing: p.x < 180 ? 1 : -1, t, phase: p.phase, bounce: healed ? 1.5 : 0, expr: healed ? 'laugh' : 'sad', arms: healed ? 'cheer' : 'down' });
  c.restore();
  if (!healed) { // a little gray sigh cloud
    const bx = p.x + (p.x < 180 ? 18 : -18) * p.sc, by = p.y - 92 * p.sc + Math.sin(t * 2 + p.phase) * 2;
    c.save(); c.globalAlpha = 0.7; c.fillStyle = '#c8c8d4'; for (const [dx, dy, r] of [[0, 0, 7], [7, -3, 6], [-7, -2, 5.5], [2, -7, 5]]) { c.beginPath(); c.arc(bx + dx * p.sc, by + dy * p.sc, r * p.sc, 0, 7); c.fill(); } c.restore();
  } else if (ht < 1.2) { c.save(); c.globalAlpha = 1 - ht / 1.2; c.fillStyle = '#ff7a9a'; for (let i = 0; i < 3; i++) heart(c, p.x - 16 + i * 16, p.y - 100 * p.sc - ht * 40 - (i % 2) * 8, 5); c.restore(); }
}
function flower(c, x, y, s, k, col, t) {
  c.save(); c.translate(x, y); c.scale(s * 0.8, s * 0.8);
  const droop = 1 - k, stem = P.mix('#8a8a7a', '#4f9a3a', k);
  c.strokeStyle = stem; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(2, -14, 2 + droop * 10, -24 + droop * 8); c.stroke();
  c.fillStyle = stem; c.beginPath(); c.ellipse(-4, -8, 5, 2.4, -0.5 - droop * 0.6, 0, 7); c.fill();
  const hx = 2 + droop * 10, hy = -26 + droop * 10, pc = P.mix('#a8a0a8', col, k), r = 3 + k * 2.5;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 0.5 * k; c.fillStyle = pc; c.beginPath(); c.ellipse(hx + Math.cos(a) * r, hy + Math.sin(a) * r * (0.5 + 0.5 * k), r * 0.85, r * 0.55, a, 0, 7); c.fill(); }
  c.fillStyle = P.mix('#b0a890', '#f9d23a', k); c.beginPath(); c.arc(hx, hy, 2.4 + k, 0, 7); c.fill();
  c.restore();
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }

// ---------- the river: crystal clear, with a pebbly jewel bed, ripples and sparkles ----------
function riverPath(c, pad = 0) { c.beginPath(); c.moveTo(180 - riverHalf(RIVER.topY) - pad, RIVER.topY); for (let y = RIVER.topY; y <= 640; y += 20) c.lineTo(180 - riverHalf(y) - pad + Math.sin(y * 0.04) * 4, y); for (let y = 640; y >= RIVER.topY; y -= 20) c.lineTo(180 + riverHalf(y) + pad + Math.sin(y * 0.04 + 1) * 4, y); c.closePath(); }
function drawRiver(c, t) {
  c.save(); riverPath(c); c.clip();
  // ripples flowing toward us
  c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 1.5; c.lineCap = 'round';
  for (let i = 0; i < 14; i++) { const q = ((i / 14) + t * 0.12) % 1, y = RIVER.topY + q * q * (640 - RIVER.topY), hw = riverHalf(y) * 0.6, xo = Math.sin(i * 2.3) * hw * 0.5;
    c.globalAlpha = 0.25 + 0.6 * q; c.beginPath(); c.moveTo(180 + xo - hw * 0.4, y); c.quadraticCurveTo(180 + xo, y - 2 - q * 3, 180 + xo + hw * 0.4, y); c.stroke(); }
  // glints
  c.globalAlpha = 1; for (let i = 0; i < 26; i++) { const y = RIVER.topY + ((i * 37) % 330), x = 180 + Math.sin(i * 1.9) * riverHalf(y) * 0.8, tw = Math.max(0, Math.sin(t * 4 + i * 1.3)); if (tw < 0.5) continue; c.fillStyle = `rgba(255,255,245,${(tw - 0.5) * 2})`; drawStar(c, x, y, 2 + tw * 2.5, 0); }
  c.restore();
}

// ---------- baked scenery ----------
function paintBg(o) {
  P.sky(o, W, H, ['#8f74d6', '#f2a0c0', '#ffd0a8', '#fff2cc'], { x: 180, y: 250, r: 28, color: '#fff6d8', glow: 300 });
  // the far city and its gate, where the river begins
  P.hills(o, W, 300, 10, '#f0c8c8', '#e0b0b8', { seed: 61, freq: 0.02, dabs: 10, bottom: 340 });
  const gg = o.createRadialGradient(180, 286, 2, 180, 286, 90); gg.addColorStop(0, 'rgba(255,255,245,1)'); gg.addColorStop(0.3, 'rgba(255,240,190,0.8)'); gg.addColorStop(1, 'rgba(255,240,190,0)'); o.fillStyle = gg; o.fillRect(60, 196, 240, 160);
  for (const [tx, th] of [[132, 34], [156, 50], [204, 50], [228, 34]]) { o.fillStyle = 'rgba(255,236,190,0.9)'; o.fillRect(tx - 7, 300 - th, 14, th); o.beginPath(); o.arc(tx, 300 - th, 7, Math.PI, 0); o.fill(); }
  o.fillStyle = '#fffcee'; o.beginPath(); o.moveTo(172, 302); o.lineTo(172, 286); o.arc(180, 286, 8, Math.PI, 0); o.lineTo(188, 302); o.fill();
  // grassy banks
  P.hills(o, W, 318, 6, '#c2e488', '#7cb050', { seed: 62, freq: 0.03, dabs: 140, rim: '#f4ffc8' });
  // the river bed: deep clear blue fading to turquoise, with jewel pebbles
  o.save(); riverPath(o, 6); o.fillStyle = '#e8d8b0'; o.fill(); o.restore();
  o.save(); riverPath(o); o.clip();
  const rg = o.createLinearGradient(0, RIVER.topY, 0, 640); rg.addColorStop(0, '#f2fdff'); rg.addColorStop(0.3, '#9ee2f4'); rg.addColorStop(1, '#3fb0d8'); o.fillStyle = rg; o.fillRect(0, RIVER.topY, W, 640);
  const r = P.rng(31); for (let i = 0; i < 70; i++) { const y = RIVER.topY + 30 + r() * 320, x = 180 + (r() - 0.5) * 2 * riverHalf(y) * 0.9, rr = 1 + (y - RIVER.topY) / 340 * 3; o.fillStyle = P.rgba(FRUIT[Math.floor(r() * 12)], 0.45); o.beginPath(); o.ellipse(x, y, rr * 1.3, rr, 0, 0, 7); o.fill(); }
  const sh = o.createLinearGradient(140, 0, 220, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.35)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); o.fillStyle = sh; o.fillRect(0, RIVER.topY, W, 340);
  o.restore();
  // bright pebble edges along the banks
  const r2 = P.rng(32); for (let y = RIVER.topY + 10; y < 640; y += 9) for (const sd of [-1, 1]) { const x = 180 + sd * (riverHalf(y) + 4) + Math.sin(y * 0.04 + (sd > 0 ? 1 : 0)) * 4, rr = 1.2 + (y - RIVER.topY) / 340 * 2.6; o.fillStyle = r2() < 0.3 ? P.rgba(FRUIT[Math.floor(r2() * 12)], 0.8) : '#fff6e0'; o.beginPath(); o.ellipse(x, y, rr * 1.3, rr, 0, 0, 7); o.fill(); }
  P.flowers(o, W, 340, 640, 60, ['#f4d35e', '#ee6c8a', '#ffffff', '#b98ae0', '#7ad0f0'], 21);
  P.grassTufts(o, W, 330, 640, 46, '#70a848', 23);
  // clear the grass and flowers off the water again
  o.save(); riverPath(o); o.clip(); o.fillStyle = rg; o.globalAlpha = 0.85; o.fillRect(0, RIVER.topY, W, 640); o.restore();
}
function paintTree(o) {
  // two great trunks, one on each bank, leaning together into a single arching crown over the river
  for (const sd of [-1, 1]) {
    const bx = 180 + sd * 128, g = o.createLinearGradient(bx - 20, 0, bx + 20, 0); g.addColorStop(0, '#8a5a3a'); g.addColorStop(0.5, '#b07a4a'); g.addColorStop(1, '#6e4428'); o.fillStyle = g;
    o.beginPath(); o.moveTo(bx - 22, 420); o.quadraticCurveTo(bx - 14, 330, bx - sd * 30 - 10, 200); o.lineTo(bx - sd * 30 + 12, 196); o.quadraticCurveTo(bx + 14, 330, bx + 24, 420); o.quadraticCurveTo(bx, 428, bx - 22, 420); o.fill();
    o.strokeStyle = 'rgba(60,30,20,0.35)'; o.lineWidth = 1.5; for (let i = 0; i < 4; i++) { o.beginPath(); o.moveTo(bx - 12 + i * 8, 410); o.quadraticCurveTo(bx - 8 + i * 6, 320, bx - sd * 26 - 4 + i * 4, 220); o.stroke(); }
    // roots spreading into the bank
    o.strokeStyle = '#7a4a2e'; o.lineWidth = 5; o.lineCap = 'round'; for (const k of [-1, 1]) { o.beginPath(); o.moveTo(bx + k * 14, 414); o.quadraticCurveTo(bx + k * 30, 422, bx + k * 40, 426); o.stroke(); }
    o.fillStyle = 'rgba(40,40,20,0.22)'; o.beginPath(); o.ellipse(bx, 426, 44, 7, 0, 0, 7); o.fill();
  }
  // the crown: layered leafy clusters from dark to light, lit warmly from the city behind
  const r = P.rng(12), blobs = [];
  for (let i = 0; i < 62; i++) { const a = r() * Math.PI, rx = 200, ry = 150; const x = 180 + Math.cos(a) * rx * (0.3 + r() * 0.75), y = 230 - Math.sin(a) * ry * (0.35 + r() * 0.7); blobs.push([x, y, 26 + r() * 22]); }
  for (let i = 0; i < 14; i++) blobs.push([10 + i * 26, 222 + r() * 20, 22 + r() * 10]);
  for (const [x, y, rr] of blobs) { o.fillStyle = '#2f7a4a'; o.beginPath(); o.arc(x + 3, y + 6, rr, 0, 7); o.fill(); }
  for (const [x, y, rr] of blobs) { const g = o.createRadialGradient(x - rr * 0.35, y - rr * 0.45, 2, x, y, rr); g.addColorStop(0, '#b8ec7a'); g.addColorStop(0.55, '#5fbf5a'); g.addColorStop(1, '#3f9a52'); o.fillStyle = g; o.beginPath(); o.arc(x, y, rr * 0.92, 0, 7); o.fill(); }
  // leaf texture dabs and golden rim light
  const r2 = P.rng(13); for (let i = 0; i < 160; i++) { const [x, y, rr] = blobs[Math.floor(r2() * blobs.length)], a = r2() * 7, d = r2() * rr * 0.8; o.fillStyle = r2() < 0.5 ? 'rgba(220,255,160,0.35)' : 'rgba(30,90,50,0.25)'; o.beginPath(); o.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d, 5, 2.4, a, 0, 7); o.fill(); }
  // warm light along the underside of the crown, where the city glow shines up through the leaves
  const ul = o.createLinearGradient(0, 200, 0, 270); ul.addColorStop(0, 'rgba(255,240,170,0)'); ul.addColorStop(1, 'rgba(255,240,170,0.35)'); o.fillStyle = ul; o.save(); o.globalCompositeOperation = 'source-atop'; o.fillRect(0, 200, W, 80); o.restore();
}
