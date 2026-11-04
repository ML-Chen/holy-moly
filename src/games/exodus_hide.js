// HIDE! — the brave midwives Shiphrah and Puah keep the Hebrew baby boys safe (Exodus 1:15–21).
// Giggling babies peek out around a courtyard; tap each one to tuck it in under a blanket before the sleepy guard strolls past.
// x,y: foot of the prop; hx,hy: where the baby's head peeks out; k: size (nearer is bigger)
const SPOTS = [
  { x: 70, y: 452, prop: 'jar', hx: 30, hy: -66, k: 1.05 },
  { x: 184, y: 420, prop: 'sacks', hx: 0, hy: -66, k: 1.0 },
  { x: 294, y: 452, prop: 'pots', hx: -12, hy: -60, k: 1.05 },
  { x: 116, y: 556, prop: 'basket', hx: 0, hy: -46, k: 1.25 },
  { x: 254, y: 560, prop: 'cushions', hx: 0, hy: -66, k: 1.25 },
];
const BLANKETS = ['#f6c7d3', '#bfe0f2', '#f7e2a0', '#cfe8c0', '#e2cdf2'];

MG.add({
  id: 'hide', stage: 'exodus', cmd: 'HIDE!', hint: 'tap', time: 5.5, mood: 'desert', winText: 'Safe!',
  card: { title: 'The brave midwives', ref: 'Exodus 1:15–21', kind: 'Ancient story', text: 'The book of Exodus tells how Pharaoh, the king of Egypt, gave a cruel order to harm the Hebrew baby boys. Two midwives, Shiphrah and Puah, honored God more than the king, so they refused and kept the babies safe.', note: 'The Exodus stories are about Israel\'s beginnings and were written down long afterward. This one remembers two brave women who said no to a cruel king to protect children.', ask: 'Shiphrah and Puah protected babies who could not speak up. Who could you stand up for?' },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    const order = SPOTS.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, n);
    s.babies = order.map((i, k) => ({ ...SPOTS[i], skin: P.SKIN[Math.floor(Math.random() * 4)], hair: P.HAIR[Math.floor(Math.random() * 3)], blanket: BLANKETS[k % 5], phase: Math.random() * 6, tucked: false, tuckT: 0, facing: SPOTS[i].hx > 0 ? 1 : -1 }));
    s.puffs = []; s.cheerT = -9; s.motes = Array.from({ length: 18 }, (_, i) => ({ x: Math.random() * W, y: 330 + Math.random() * 260, p: Math.random() * 6 }));
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = 56;
    for (const b of s.babies) { if (b.tucked) continue; const d = Math.hypot(x - (b.x + b.hx * b.k), y - (b.y + b.hy * b.k)); if (d < bd) { bd = d; best = b; } }
    if (best) {
      best.tucked = true; best.tuckT = g.t; s.cheerT = g.t; g.sfx('pop'); g.sfx('coo');
      g.burst(best.x + best.hx * best.k, best.y + best.hy * best.k, [best.blanket, '#fff6d8', '#ffd45a'], 12, 120);
      if (s.babies.every(b => b.tucked)) { g.win(); g.sfx('sparkle'); }
    } else { s.puffs.push({ x, y, t: g.t }); g.sfx('tap'); }
  },
  auto(g, dt, synth) { // test bot: tap one baby every 0.35 s
    const s = g.s, k = Math.floor((g.t - 0.5) / 0.35); if (g.t < 0.5 || k === s.last) return; s.last = k;
    const b = s.babies.find(b => !b.tucked); if (b) { const x = b.x + b.hx * b.k, y = b.y + b.hy * b.k; synth('down', x, y); synth('up', x, y); }
  },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('exodus_hide_back', o => paintBack(o)), 0, 0, W, H);
    // drifting evening clouds
    P.cloud(c, 60 + (t * 4) % 420 - 30, 110, 0.55, '#fff0e0', '#e9a8a8', 0.75);
    P.cloud(c, 260 - (t * 3) % 420 + 60, 70, 0.4, '#fff0e0', '#e9a8a8', 0.6);
    // birds
    c.strokeStyle = 'rgba(90,50,70,0.6)'; c.lineWidth = 1.4; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const bx = (40 + i * 26 + t * 18) % 400 - 20, by = 150 + i * 9 + Math.sin(t * 2 + i) * 3, f = Math.sin(t * 9 + i * 2) * 3; c.beginPath(); c.moveTo(bx - 6, by - f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 6, by - f); c.stroke(); }
    // the guard strolls along the street behind the wall; he reaches the middle when time runs out
    const fail = g.result === 'fail', win = g.result === 'win';
    const prog = fail ? g.doneAt / g.dur : Math.min(1.6, t / g.dur);
    const gx = -50 + 230 * prog;
    drawGuard(c, gx, 314, 1.3, t, fail ? 'look' : 'walk', fail ? t - g.doneAt : 0);
    c.drawImage(g.bake('exodus_hide_front', o => paintFront(o)), 0, 0, W, H);
    // vines over the wall sway a touch
    for (let i = 0; i < 9; i++) { const vx = 214 + i * 13, sw = Math.sin(t * 1.6 + i) * 1.5; c.fillStyle = ['#e0508a', '#f07aa8', '#c83a78'][i % 3]; c.beginPath(); c.arc(vx + sw, 306 + (i % 3) * 7, 4.2, 0, 7); c.fill(); }
    // babies and their hiding places, back to front
    const cheer = t - s.cheerT < 0.5;
    const list = s.babies.slice().sort((a, b) => a.y - b.y);
    for (const b of list) drawSpot(c, b, t, s, fail);
    // midwives
    P.person(c, 36, 606, 1.15, { skin: P.SKIN[2], robe: P.CLOTH.rose, stripe: P.CLOTH.cream, hairStyle: 'bun', hair: P.HAIR[1], expr: win || cheer ? 'laugh' : fail ? 'surprised' : 'happy', arms: win || cheer ? 'cheer' : 'pray', t, phase: 1 });
    P.person(c, 326, 606, 1.15, { skin: P.SKIN[3], robe: P.CLOTH.indigo, stripe: P.CLOTH.saffron, hairStyle: 'curly', hair: P.HAIR[0], expr: win || cheer ? 'laugh' : fail ? 'surprised' : 'happy', arms: win || cheer ? 'cheer' : 'hold', t, phase: 3, facing: -1, hold: win || cheer ? null : (cc, hx, hy) => { cc.fillStyle = '#bfe0f2'; cc.strokeStyle = '#6a8aa8'; cc.lineWidth = 1.2; roundRect(cc, hx - 11, hy - 6, 22, 12, 4); cc.fill(); cc.stroke(); cc.fillStyle = '#f6c7d3'; cc.fillRect(hx - 11, hy - 1, 22, 3); } });
    // dust motes in the low sun
    c.save(); c.globalCompositeOperation = 'screen';
    for (const m of s.motes) { const a = 0.35 + 0.35 * Math.sin(t * 2 + m.p); c.fillStyle = `rgba(255,226,160,${a})`; c.beginPath(); c.arc(m.x + Math.sin(t * 0.7 + m.p) * 10, m.y - (t * 6 + m.p * 20) % 40, 1.4, 0, 7); c.fill(); }
    c.restore();
    for (const p of s.puffs) { const q = (t - p.t) / 0.4; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#fff6dc'; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 6 + q * 16, 0, 7); c.stroke(); c.restore(); }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});

// ---------- the static painting ----------
function paintBack(o) {
  P.sky(o, W, H, ['#5b6fb0', '#c98aa6', '#f6b98a', '#ffe0a8'], { x: 292, y: 214, r: 24, color: '#ffd59a', glow: 260 });
  P.rays(o, 292, 214, W, H, '#fff0c8', 0.12, 9, 0);
  // far pyramids in the haze
  const pyr = (x, base, w, h, lit) => { o.fillStyle = P.mix('#c88a8a', '#f2c4a0', lit); o.beginPath(); o.moveTo(x - w, base); o.lineTo(x, base - h); o.lineTo(x + w, base); o.closePath(); o.fill(); o.fillStyle = P.rgba('#ffe8c0', 0.35); o.beginPath(); o.moveTo(x, base - h); o.lineTo(x + w, base); o.lineTo(x + w * 0.2, base); o.closePath(); o.fill(); };
  pyr(70, 262, 64, 70, 0.3); pyr(150, 262, 40, 44, 0.45); pyr(236, 264, 30, 30, 0.55);
  const haze = o.createLinearGradient(0, 200, 0, 270); haze.addColorStop(0, 'rgba(255,220,190,0)'); haze.addColorStop(1, 'rgba(255,220,190,0.55)'); o.fillStyle = haze; o.fillRect(0, 200, W, 70);
  P.hills(o, W, 270, 10, '#d8a07a', '#c88a68', { seed: 3, freq: 0.02, dabs: 20 });
  // far rooftops along the street
  P.palm(o, 30, 286, 0.5, 0.2, 0, '#5a8a5a'); P.palm(o, 336, 284, 0.55, -0.15, 0, '#5a8a5a');
  P.house(o, 60, 286, 40, 26, '#e8c49a', { window: false }); P.house(o, 110, 284, 30, 30, '#f0cfa4', { awning: P.CLOTH.teal, window: false }); P.house(o, 238, 286, 44, 22, '#e6be92', { window: false }); P.house(o, 290, 285, 30, 28, '#f2d2a8', { window: false, awning: P.CLOTH.rose });
  // the street
  const st = o.createLinearGradient(0, 282, 0, 330); st.addColorStop(0, '#f0caa0'); st.addColorStop(1, '#d9a878'); o.fillStyle = st; o.fillRect(0, 284, W, 50);
}
function paintFront(o) {
  // courtyard wall: warm mudbrick with a lit top edge
  const wallTop = 300, wallBot = 352;
  const wg = o.createLinearGradient(0, wallTop, 0, wallBot); wg.addColorStop(0, '#e8b383'); wg.addColorStop(1, '#c2865a'); o.fillStyle = wg; o.fillRect(0, wallTop, W, wallBot - wallTop);
  o.strokeStyle = 'rgba(120,64,40,0.28)'; o.lineWidth = 1;
  for (let r = 0; r < 4; r++) { const y = wallTop + 8 + r * 11; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); for (let x = (r % 2) * 14; x < W; x += 28) { o.beginPath(); o.moveTo(x, y); o.lineTo(x, y + 11); o.stroke(); } }
  o.fillStyle = '#f6d0a4'; o.fillRect(0, wallTop - 5, W, 7); o.fillStyle = '#ffe6c4'; o.fillRect(0, wallTop - 5, W, 2);
  // bougainvillea leaves over the right side of the wall (flowers drawn live)
  o.fillStyle = '#4f8a4a'; for (let i = 0; i < 18; i++) { o.beginPath(); o.ellipse(208 + i * 7, 302 + (i % 4) * 5, 6, 3.5, i, 0, 7); o.fill(); }
  // courtyard floor
  const fl = o.createLinearGradient(0, wallBot, 0, H); fl.addColorStop(0, '#d9a272'); fl.addColorStop(0.4, '#e8bb88'); fl.addColorStop(1, '#c98f5e'); o.fillStyle = fl; o.fillRect(0, wallBot, W, H - wallBot);
  // the wall's cool shadow on the floor
  const sh = o.createLinearGradient(0, wallBot, 0, wallBot + 40); sh.addColorStop(0, 'rgba(110,50,80,0.35)'); sh.addColorStop(1, 'rgba(110,50,80,0)'); o.fillStyle = sh; o.fillRect(0, wallBot, W, 40);
  // woven rug in perspective
  o.save(); o.beginPath(); o.moveTo(96, 470); o.lineTo(268, 470); o.lineTo(300, 600); o.lineTo(64, 600); o.closePath();
  const rg = o.createLinearGradient(0, 470, 0, 600); rg.addColorStop(0, '#b5523a'); rg.addColorStop(1, '#9a3e30'); o.fillStyle = rg; o.fill(); o.clip();
  for (let i = 0; i < 6; i++) { const y = 478 + i * 22; o.fillStyle = i % 2 ? '#e9b949' : '#3f4f8f'; o.fillRect(0, y, W, 4); o.fillStyle = 'rgba(255,240,210,0.5)'; for (let x = 60; x < 310; x += 14) { o.beginPath(); o.moveTo(x, y + 9); o.lineTo(x + 5, y + 14); o.lineTo(x, y + 19); o.lineTo(x - 5, y + 14); o.closePath(); o.fill(); } }
  o.restore();
  o.strokeStyle = '#f2d2a0'; o.lineWidth = 2; o.setLineDash([3, 4]); o.beginPath(); o.moveTo(96, 470); o.lineTo(268, 470); o.lineTo(300, 600); o.lineTo(64, 600); o.closePath(); o.stroke(); o.setLineDash([]);
  // dabs and grain on the packed-earth floor
  const r = P.rng(41); for (let i = 0; i < 90; i++) { const x = r() * W, y = wallBot + 10 + r() * (H - wallBot); if (y > 465 && y < 605 && x > 70 && x < 295) continue; o.fillStyle = P.rgba(r() < 0.5 ? '#f6d4a6' : '#b07848', 0.18); o.beginPath(); o.ellipse(x, y, 5 + r() * 10, 1.5 + r() * 2.5, 0, 0, 7); o.fill(); }
  // low golden light slanting in from the right
  o.save(); o.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i++) { const x0 = 140 + i * 70; const lg = o.createLinearGradient(x0 + 120, wallBot, x0 - 40, H); lg.addColorStop(0, 'rgba(255,214,150,0.22)'); lg.addColorStop(1, 'rgba(255,214,150,0)'); o.fillStyle = lg; o.beginPath(); o.moveTo(x0 + 120, wallBot); o.lineTo(x0 + 150, wallBot); o.lineTo(x0 - 10, H); o.lineTo(x0 - 70, H); o.closePath(); o.fill(); }
  o.restore();
  // a potted palm at the right edge and a lamp niche at left
  P.palm(o, 352, 400, 0.62, -0.18, 0, '#4a8a4a');
  o.fillStyle = '#b8543a'; o.beginPath(); o.moveTo(338, 400); o.lineTo(366, 400); o.lineTo(362, 420); o.lineTo(342, 420); o.closePath(); o.fill();
}

// ---------- props ----------
function shadow(c, x, y, w) { c.fillStyle = 'rgba(90,40,60,0.22)'; c.beginPath(); c.ellipse(x - w * 0.25, y, w, w * 0.18, 0, 0, 7); c.fill(); }
function drawProp(c, kind, x, y, k = 1) {
  c.save(); c.translate(x, y); c.scale(k, k);
  if (kind === 'jar') {
    shadow(c, 0, 0, 30);
    const g = c.createRadialGradient(-10, -46, 3, 0, -34, 36); g.addColorStop(0, '#f2a878'); g.addColorStop(0.6, '#c8683e'); g.addColorStop(1, '#8a3e26');
    c.fillStyle = g; c.strokeStyle = '#6a2e1c'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-9, -68); c.quadraticCurveTo(-30, -58, -27, -32); c.quadraticCurveTo(-24, -4, -8, 0); c.lineTo(8, 0); c.quadraticCurveTo(24, -4, 27, -32); c.quadraticCurveTo(30, -58, 9, -68); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#b8583a'; c.beginPath(); c.ellipse(0, -69, 12, 4, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#5a2418'; c.beginPath(); c.ellipse(0, -69, 8, 2.4, 0, 0, 7); c.fill();
    c.strokeStyle = '#2f5f8f'; c.lineWidth = 3; c.beginPath(); c.moveTo(-25, -42); c.quadraticCurveTo(0, -36, 25, -42); c.stroke(); c.strokeStyle = '#e9b949'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-26, -36); c.quadraticCurveTo(0, -30, 26, -36); c.stroke();
    c.fillStyle = 'rgba(255,240,220,0.35)'; c.beginPath(); c.ellipse(-14, -44, 4, 12, 0.2, 0, 7); c.fill();
  } else if (kind === 'sacks') {
    shadow(c, 0, 0, 40);
    const sack = (sx, sy, w, h, col) => { const g = c.createLinearGradient(sx - w, sy - h, sx + w, sy); g.addColorStop(0, P.shade(col, 0.2)); g.addColorStop(1, P.shade(col, -0.2)); c.fillStyle = g; c.strokeStyle = P.shade(col, -0.5); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(sx - w * 0.3, sy - h); c.quadraticCurveTo(sx - w * 1.1, sy - h * 0.7, sx - w, sy - 4); c.quadraticCurveTo(sx, sy + 3, sx + w, sy - 4); c.quadraticCurveTo(sx + w * 1.1, sy - h * 0.7, sx + w * 0.3, sy - h); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = P.shade(col, -0.1); c.beginPath(); c.moveTo(sx - w * 0.3, sy - h); c.lineTo(sx - w * 0.45, sy - h - 9); c.lineTo(sx + w * 0.45, sy - h - 9); c.lineTo(sx + w * 0.3, sy - h); c.fill(); c.stroke();
      c.strokeStyle = '#8a5a2a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(sx - w * 0.32, sy - h + 1); c.lineTo(sx + w * 0.32, sy - h + 1); c.stroke();
      c.strokeStyle = P.rgba(P.shade(col, -0.4), 0.4); c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(sx - w * 0.8, sy - h * i / 4); c.lineTo(sx + w * 0.8, sy - h * i / 4 + 2); c.stroke(); } };
    sack(-16, -6, 20, 40, '#d8b47e'); sack(14, 0, 23, 46, '#e6c792');
  } else if (kind === 'pots') {
    shadow(c, 0, 0, 38);
    const pot = (px, h, w, col) => { const g = c.createRadialGradient(px - w * 0.4, -h * 0.65, 2, px, -h * 0.5, w * 1.2); g.addColorStop(0, P.shade(col, 0.3)); g.addColorStop(1, P.shade(col, -0.25)); c.fillStyle = g; c.strokeStyle = P.shade(col, -0.5); c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(px - w * 0.55, -h); c.quadraticCurveTo(px - w * 1.15, -h * 0.55, px - w * 0.5, 0); c.lineTo(px + w * 0.5, 0); c.quadraticCurveTo(px + w * 1.15, -h * 0.55, px + w * 0.55, -h); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = P.shade(col, -0.1); c.beginPath(); c.ellipse(px, -h, w * 0.62, 4, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = P.shade(col, -0.55); c.beginPath(); c.ellipse(px, -h, w * 0.45, 2.4, 0, 0, 7); c.fill();
      c.strokeStyle = '#f6e6c8'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px - w * 0.95, -h * 0.5); c.quadraticCurveTo(px, -h * 0.42, px + w * 0.95, -h * 0.5); c.stroke(); };
    pot(-14, 40, 24, '#c8744a'); pot(20, 28, 18, '#a85a8a');
  } else if (kind === 'basket') {
    shadow(c, 0, 0, 40);
    // colourful laundry spilling out
    c.fillStyle = '#3f8f8a'; c.beginPath(); c.ellipse(-12, -32, 16, 7, -0.3, 0, 7); c.fill(); c.fillStyle = '#e8a33a'; c.beginPath(); c.ellipse(12, -33, 15, 6, 0.4, 0, 7); c.fill();
    c.fillStyle = '#e07a8a'; c.beginPath(); c.moveTo(22, -30); c.quadraticCurveTo(36, -24, 34, -8); c.lineTo(28, -10); c.quadraticCurveTo(28, -22, 18, -26); c.fill();
    const g = c.createLinearGradient(0, -30, 0, 0); g.addColorStop(0, '#e2b06a'); g.addColorStop(1, '#9a6a34'); c.fillStyle = g; c.strokeStyle = '#6a4220'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-34, -28); c.lineTo(34, -28); c.quadraticCurveTo(32, -2, 24, 0); c.lineTo(-24, 0); c.quadraticCurveTo(-32, -2, -34, -28); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(106,66,32,0.55)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-33 + i, -28 + i * 7); c.lineTo(33 - i, -28 + i * 7); c.stroke(); } for (let x = -28; x <= 28; x += 7) { c.beginPath(); c.moveTo(x, -27); c.lineTo(x * 0.75, -1); c.stroke(); }
    c.fillStyle = '#f2cc88'; c.beginPath(); c.ellipse(0, -28, 35, 4, 0, 0, 7); c.fill(); c.stroke();
  } else if (kind === 'cushions') {
    shadow(c, 0, 0, 40);
    const cushion = (cy, w, h, col, col2) => { const g = c.createLinearGradient(0, cy - h, 0, cy + h); g.addColorStop(0, P.shade(col, 0.25)); g.addColorStop(1, P.shade(col, -0.2)); c.fillStyle = g; c.strokeStyle = P.shade(col, -0.5); c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(0, cy, w, h, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = col2; c.lineWidth = 2; c.beginPath(); c.ellipse(0, cy, w * 0.7, h * 0.45, 0, 0, 7); c.stroke();
      c.fillStyle = col2; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * w, cy, 3, 0, 7); c.fill(); } };
    cushion(-9, 36, 10, '#5b4bb8', '#e9b949'); cushion(-25, 32, 9, '#cf6f4a', '#f2e6cf'); cushion(-39, 27, 8, '#2f8f8a', '#ffd98a');
  }
  c.restore();
}
function drawBabyHead(c, x, y, r, b, expr) {
  const line = P.shade(b.skin, -0.4);
  c.fillStyle = b.skin; c.strokeStyle = line; c.lineWidth = 1.3;
  for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(x + sx * r * 0.95, y + 1, r * 0.22, r * 0.28, 0, 0, 7); c.fill(); c.stroke(); }
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.45, 1, x, y, r * 1.1); g.addColorStop(0, P.shade(b.skin, 0.18)); g.addColorStop(1, P.shade(b.skin, -0.06));
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke();
  P.face(c, x, y - 0.5, r, { expr, facing: b.facing });
  c.strokeStyle = b.hair; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 1, y - r + 1); c.quadraticCurveTo(x - 5, y - r - 8, x + 3, y - r - 7); c.quadraticCurveTo(x + 7, y - r - 3, x + 2, y - r - 1); c.stroke();
}
function drawSpot(c, b, t, s, fail) {
  const hx = b.x + b.hx * b.k, hy = b.y + b.hy * b.k, r = 17 * b.k;
  if (!b.tucked) {
    // soft pulsing glow says "tap me"
    const p = 0.5 + 0.5 * Math.sin(t * 6 + b.phase);
    const gr = r * 2.6, gl = c.createRadialGradient(hx, hy, 2, hx, hy, gr); gl.addColorStop(0, `rgba(255,244,200,${0.55 + 0.3 * p})`); gl.addColorStop(0.5, `rgba(255,226,150,${0.25 + 0.15 * p})`); gl.addColorStop(1, 'rgba(255,226,150,0)'); c.fillStyle = gl; c.beginPath(); c.arc(hx, hy, gr, 0, 7); c.fill();
    const peek = Math.sin(t * 3.2 + b.phase) * 4 - (fail ? 5 : 0), tilt = Math.sin(t * 2.4 + b.phase) * 0.18;
    c.save(); c.translate(hx, hy + peek); c.rotate(tilt);
    // little body in a tunic, mostly hidden behind the prop
    c.fillStyle = '#f2e6cf'; c.strokeStyle = '#c8b090'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, r + 10, r * 0.85, r * 0.75, 0, 0, 7); c.fill(); c.stroke();
    drawBabyHead(c, 0, 0, r, b, Math.sin(t * 5 + b.phase) > -0.2 ? 'laugh' : 'wow');
    c.restore();
    drawProp(c, b.prop, b.x, b.y, b.k);
    // tiny hands on the edge
    c.fillStyle = b.skin; c.strokeStyle = P.shade(b.skin, -0.4); c.lineWidth = 1.1;
    for (const sx of [-1, 1]) { c.beginPath(); c.arc(hx + sx * r * 0.75, hy + r * 1.05 + peek * 0.5, r * 0.28, 0, 7); c.fill(); c.stroke(); }
    // giggle squiggles
    c.strokeStyle = 'rgba(255,250,235,0.95)'; c.lineWidth = 2; c.lineCap = 'round';
    for (let i = 0; i < 2; i++) { const a = (t * 2.5 + b.phase + i * 0.5) % 1, sx = b.facing * (r + 6 + a * 10); c.globalAlpha = 1 - a; c.beginPath(); c.arc(hx + sx, hy - 8 - a * 10 + i * 8, 4, b.facing > 0 ? -0.9 : 2.2, b.facing > 0 ? 0.9 : 4.0); c.stroke(); }
    c.globalAlpha = 1;
  } else {
    // tucked in: snuggled under a blanket, fast asleep
    const q = Math.min(1, (t - b.tuckT) / 0.3), sink = r * 0.35 * q;
    c.save(); c.translate(hx, hy + sink);
    drawBabyHead(c, 0, 0, r, b, q > 0.5 ? 'sleep' : 'wow');
    c.restore();
    drawProp(c, b.prop, b.x, b.y, b.k);
    const bw = r * 1.6, by = hy + sink + r * 0.45 + (1 - q) * 14;
    const bg = c.createLinearGradient(0, by - 6, 0, by + 16); bg.addColorStop(0, P.shade(b.blanket, 0.25)); bg.addColorStop(1, P.shade(b.blanket, -0.15));
    c.fillStyle = bg; c.strokeStyle = P.shade(b.blanket, -0.45); c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(hx - bw, by + r * 1.1); c.quadraticCurveTo(hx - bw - 5, by, hx - bw * 0.6, by - 3); c.quadraticCurveTo(hx, by + 4, hx + bw * 0.6, by - 3); c.quadraticCurveTo(hx + bw + 5, by, hx + bw, by + r * 1.1); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = P.rgba('#ffffff', 0.7); c.setLineDash([2, 3]); c.beginPath(); c.moveTo(hx - bw * 0.6, by + 1); c.quadraticCurveTo(hx, by + 7, hx + bw * 0.6, by + 1); c.stroke(); c.setLineDash([]);
    // floating sleepy z's and a heart
    const a = ((t - b.tuckT) * 0.8 + b.phase) % 1;
    c.save(); c.globalAlpha = 0.9 * (1 - a); c.strokeStyle = '#fff6dc'; c.lineWidth = 1.8; c.lineJoin = 'round';
    const zx = hx + 14 + a * 8, zy = hy - 12 - a * 18, zs = 4 + a * 2; c.beginPath(); c.moveTo(zx - zs, zy - zs); c.lineTo(zx + zs, zy - zs); c.lineTo(zx - zs, zy + zs); c.lineTo(zx + zs, zy + zs); c.stroke(); c.restore();
    if (t - b.tuckT < 0.9) { const k = (t - b.tuckT) / 0.9; c.save(); c.globalAlpha = 1 - k; c.fillStyle = '#ff7aa0'; heart(c, hx - 14, hy - 20 - k * 26, 6 + k * 3); c.restore(); }
  }
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5); c.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
// the guard: a sleepy, comic fellow with a feather fan, who never catches anybody
function drawGuard(c, x, y, s, t, mode, ft) {
  const look = mode === 'look', bob = look ? Math.abs(Math.sin(ft * 14)) * 6 * Math.max(0, 1 - ft * 2) : Math.abs(Math.sin(t * 7)) * 2.5;
  const fan = (cc, hx, hy) => { cc.strokeStyle = '#7a5434'; cc.lineWidth = 2.2; cc.beginPath(); cc.moveTo(hx, hy + 8); cc.lineTo(hx + 6, hy - 46); cc.stroke(); cc.save(); cc.translate(hx + 6, hy - 46); cc.rotate(Math.sin(t * 3) * 0.15);
    for (let i = -3; i <= 3; i++) { cc.save(); cc.rotate(i * 0.26); const fg = cc.createLinearGradient(0, 0, 0, -26); fg.addColorStop(0, '#f2e6cf'); fg.addColorStop(1, i % 2 ? '#6aa9d8' : '#ffffff'); cc.fillStyle = fg; cc.beginPath(); cc.ellipse(0, -14, 4.5, 14, 0, 0, 7); cc.fill(); cc.restore(); } cc.restore(); };
  P.person(c, x, y - bob, s, { skin: P.SKIN[4], robe: P.CLOTH.white, stripe: P.CLOTH.gold, sash: P.CLOTH.royal, hair: P.HAIR[0], expr: look ? 'surprised' : 'sleep', arms: look ? 'out' : 'hold', hold: look ? null : fan, t, bounce: 0 });
  // striped nemes headcloth
  const hy = y - bob - 56 * s, r = 16 * s;
  c.save(); c.translate(x, hy);
  c.fillStyle = '#e9b949'; c.strokeStyle = '#8a5a1a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-r * 1.05, -r * 0.1); c.quadraticCurveTo(-r * 1.15, -r * 1.25, 0, -r * 1.2); c.quadraticCurveTo(r * 1.15, -r * 1.25, r * 1.05, -r * 0.1); c.lineTo(r * 1.35, r * 1.6); c.lineTo(r * 0.85, r * 1.6); c.lineTo(r * 0.8, -r * 0.35); c.quadraticCurveTo(0, -r * 0.8, -r * 0.8, -r * 0.35); c.lineTo(-r * 0.85, r * 1.6); c.lineTo(-r * 1.35, r * 1.6); c.closePath(); c.fill(); c.stroke();
  c.save(); c.clip(); c.strokeStyle = '#3f4f8f'; c.lineWidth = 2.4; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * 5 - 20, -r * 1.4); c.lineTo(i * 5 + 4, r * 1.8); c.stroke(); } c.restore();
  c.restore();
  if (!look) { // sleepy z's
    const a = (t * 0.9) % 1; c.save(); c.globalAlpha = 1 - a; c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.lineJoin = 'round'; const zx = x + 20 + a * 10, zy = hy - 20 - a * 20, zs = 4 + a * 3; c.beginPath(); c.moveTo(zx - zs, zy - zs); c.lineTo(zx + zs, zy - zs); c.lineTo(zx - zs, zy + zs); c.lineTo(zx + zs, zy + zs); c.stroke(); c.restore();
  } else { // a startled sweat drop
    c.save(); c.strokeStyle = '#fff6dc'; c.lineWidth = 3; c.lineCap = 'round'; const e = Math.min(1, ft * 5);
    for (let i = -1; i <= 1; i++) { const a = -Math.PI / 2 + i * 0.5; c.beginPath(); c.moveTo(x + Math.cos(a) * 30, hy - 10 + Math.sin(a) * 30); c.lineTo(x + Math.cos(a) * (30 + 12 * e), hy - 10 + Math.sin(a) * (30 + 12 * e)); c.stroke(); } c.restore();
    c.fillStyle = '#bfe8ff'; c.beginPath(); c.moveTo(x + 18, hy - 18); c.quadraticCurveTo(x + 24, hy - 8, x + 18, hy - 5); c.quadraticCurveTo(x + 12, hy - 8, x + 18, hy - 18); c.fill();
  }
}
