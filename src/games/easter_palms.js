// WAVE! — Mark 11:1–11, John 12:12–15. Jesus rides into Jerusalem on a young donkey; the crowd waves palm branches
// and spreads cloaks on the road. Swipe to wave the palms: every wave makes the crowd cheer louder and throws one more
// cloak onto the road ahead of the donkey. When the road is carpeted, Jesus rides in through the city gate.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const RY = 528;                       // where the donkey's hooves meet the road
const GX = 300, GY = 474;             // the city gate: centre of the arch opening, ground level
const BACK = [                        // the crowd on the far side of the road
  { x: 22, o: { skin: SK[2], robe: CL.teal, stripe: CL.cream, hairStyle: 'long', hair: HR[0] } },
  { x: 56, o: { skin: SK[3], robe: CL.terracotta, stripe: CL.sand, beard: true, hair: HR[3], head: 'wrap', headCol: CL.cream } },
  { x: 92, o: { skin: SK[1], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[2], child: true } },
  { x: 124, o: { skin: SK[0], robe: CL.plum, stripe: CL.gold, hairStyle: 'bun', hair: HR[1] } },
  { x: 160, o: { skin: SK[2], robe: CL.olive, stripe: CL.cream, beard: true, hair: HR[0] } },
  { x: 196, o: { skin: SK[3], robe: CL.rose, stripe: CL.white, hairStyle: 'curly', hair: HR[0], child: true } },
  { x: 228, o: { skin: SK[1], robe: CL.indigo, stripe: CL.saffron, hair: HR[5], head: 'scarf', headCol: CL.sand } },
  { x: 258, o: { skin: SK[2], robe: CL.sky, stripe: CL.white, hairStyle: 'short', hair: HR[2] } },
];
const CLOAKS = ['#c9443c', '#3f4f8f', '#e8a33a', '#2f8f8a', '#8a4d7a', '#e07a8a', '#4f9a5a', '#5b4bb8'];
const LEAF = ['#5aae4a', '#8ccc5a', '#3f8a3a', '#c8e88a'];

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
// a palm branch: a curved midrib with long leaflets drooping from both sides; ang 0 points straight up
function frond(c, x, y, ang, len, bend = 0.3, col = '#4f9a48', lw = 1) {
  c.save(); c.translate(x, y); c.rotate(ang);
  const ex = len * bend * 0.5, ey = -len, cx = 0, cy = -len * 0.62;
  const at = u => [2 * (1 - u) * u * cx + u * u * ex, 2 * (1 - u) * u * cy + u * u * ey];
  const tan = u => { const dx = 2 * (1 - u) * cx + 2 * u * (ex - cx), dy = 2 * (1 - u) * cy + 2 * u * (ey - cy), l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  c.lineCap = 'round';
  for (const pass of [0, 1]) {
    c.strokeStyle = pass ? P.shade(col, 0.22) : P.shade(col, -0.25); c.lineWidth = (pass ? 2.2 : 3.4) * lw;
    c.beginPath();
    for (let u = 0.18; u <= 1.001; u += 0.055) {
      const [px, py] = at(u), [tx, ty] = tan(u), L = len * 0.36 * (1 - u * 0.62);
      for (const sd of [-1, 1]) { const nx = -ty * sd, ny = tx * sd; const lx = px + nx * L + tx * -L * 0.35, ly = py + ny * L + ty * -L * 0.35 + L * 0.35;
        c.moveTo(px, py + (pass ? -0.6 : 0.6)); c.quadraticCurveTo(px + nx * L * 0.55, py + ny * L * 0.55 - L * 0.12, lx, ly + (pass ? -0.6 : 0.6)); }
    }
    c.stroke();
  }
  c.strokeStyle = P.shade(col, -0.4); c.lineWidth = 2 * lw; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(cx, cy, ex, ey); c.stroke();
  c.strokeStyle = P.rgba('#f4ffd0', 0.55); c.lineWidth = 0.8 * lw; c.beginPath(); c.moveTo(-0.6, -len * 0.1); c.quadraticCurveTo(cx - 0.6, cy, ex - 0.6, ey); c.stroke();
  c.restore();
}
// a cloak spread flat on the road, in perspective, with woven stripes
function cloak(c, x, y, w, col, k = 1) {
  c.save(); c.translate(x, y); c.scale(k, k);
  c.fillStyle = 'rgba(80,50,30,0.25)'; c.beginPath(); c.ellipse(1, 3, w * 0.55, 6, 0, 0, 7); c.fill();
  const path = () => { c.beginPath(); c.moveTo(-w * 0.42, -6); c.quadraticCurveTo(0, -8, w * 0.46, -5.5); c.quadraticCurveTo(w * 0.56, 0, w * 0.5, 5); c.quadraticCurveTo(0, 8, -w * 0.52, 5.5); c.quadraticCurveTo(-w * 0.56, 0, -w * 0.42, -6); c.closePath(); };
  const g = c.createLinearGradient(0, -8, 0, 8); g.addColorStop(0, P.shade(col, 0.2)); g.addColorStop(1, P.shade(col, -0.18)); c.fillStyle = g; path(); c.fill();
  c.save(); path(); c.clip(); c.fillStyle = P.rgba('#fff4dc', 0.55); for (const sx of [-0.3, 0.3]) c.fillRect(sx * w - 2, -9, 4, 18); c.fillStyle = P.rgba(P.shade(col, -0.4), 0.4); c.fillRect(-w, 1, w * 2, 1.5); c.restore();
  c.strokeStyle = P.shade(col, -0.45); c.lineWidth = 1.2; path(); c.stroke();
  c.restore();
}
// Jesus riding the donkey, with a cloak thrown over its back as a saddle (Mark 11:7)
function rider(c, x, y, s, t, o) {
  const step = o.walk ? Math.abs(Math.sin(t * 9)) * 2.4 : Math.abs(Math.sin(t * 3)) * 0.8;
  c.save(); c.translate(0, -step);
  P.donkey(c, x, y + step, s, { facing: 1 });
  const bx = x - 2 * s, by = y - 26 * s;           // the middle of the donkey's back
  // the saddle cloak, hanging down the donkey's side
  c.fillStyle = '#5b4bb8'; c.strokeStyle = P.shade('#5b4bb8', -0.45); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(bx - 13 * s, by - 1 * s); c.quadraticCurveTo(bx, by - 4 * s, bx + 11 * s, by - 1 * s); c.lineTo(bx + 10 * s, by + 12 * s); c.quadraticCurveTo(bx, by + 14 * s, bx - 12 * s, by + 11 * s); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#e9b949'; c.fillRect(bx - 12 * s, by + 9 * s, 22 * s, 1.6 * s);
  // Jesus sits on top: his body clipped at the hips, one leg hanging down our side
  const ps = s * 0.66, px = bx - 1 * s;
  c.save(); c.beginPath(); c.rect(px - 60 * ps, by - 120 * ps, 120 * ps, 120 * ps + 2 * s); c.clip();
  P.person(c, px, by + 15 * ps, ps, { ...JESUS, t, phase: 1, bounce: 0.6, expr: o.expr, arms: o.arms });
  c.restore();
  const robe = JESUS.robe;
  c.fillStyle = P.shade(robe, -0.04); c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.5; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(px - 10 * ps, by - 4 * ps); c.quadraticCurveTo(px + 12 * ps, by - 8 * ps, px + 14 * ps, by + 2 * ps); c.lineTo(px + 11 * ps, by + 26 * ps); c.lineTo(px + 1 * ps, by + 27 * ps); c.lineTo(px - 2 * ps, by + 8 * ps); c.quadraticCurveTo(px - 10 * ps, by + 6 * ps, px - 10 * ps, by - 4 * ps); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = JESUS.skin; c.strokeStyle = P.shade(JESUS.skin, -0.4); c.beginPath(); c.ellipse(px + 7 * ps, by + 29 * ps, 3.4 * ps, 2.6 * ps, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(px + 7.5 * ps, by + 31 * ps, 5 * ps, 2.2 * ps, 0, 0, 7); c.fill();
  c.restore();
}
function paintBg(o) {
  P.sky(o, W, H, ['#6aaee6', '#a8d4f0', '#ffe6c4', '#ffcf9e'], { x: 74, y: 150, r: 26, color: '#fff2c0', glow: 260 });
  P.cloud(o, 250, 96, 0.8, '#fffaf0', '#e8c8d0', 0.9); P.cloud(o, 60, 230, 0.5, '#fffaf0', '#e8c8d0', 0.75);
  // the Mount of Olives behind, the way Jesus came, dotted with olive trees
  P.hills(o, W, 330, 64, '#b0b8d8', '#a0aacb', { seed: 21, freq: 0.008, dabs: 12, bottom: 520 });
  P.hills(o, W, 372, 30, '#a8c08a', '#94ae7a', { seed: 23, freq: 0.012, dabs: 24, bottom: 520, rim: '#f0f4c0' });
  for (const [x, y, sc] of [[18, 360, 0.3], [52, 352, 0.26], [86, 362, 0.28], [130, 356, 0.24]]) P.tree(o, x, y, sc, '#8aa070', Math.floor(x) + 3);
  // the city on its hill: houses, then the Temple glowing white and gold
  for (const [x, y, w, h, col] of [[150, 372, 30, 26, '#f0dcb8'], [176, 366, 26, 34, '#ead2a8'], [304, 368, 28, 30, '#f2e0c0'], [330, 374, 34, 24, '#ead2a8'], [140, 384, 24, 18, '#f2e0c0']]) P.house(o, x, y, w, h, col, { window: true });
  temple(o, 196, 368);
  // the city wall with its crenellations
  const wg = o.createLinearGradient(0, 380, 0, GY); wg.addColorStop(0, '#f2dcb4'); wg.addColorStop(1, '#d8b88a'); o.fillStyle = wg; o.fillRect(140, 384, W - 140, GY - 384);
  for (let x = 140; x < W; x += 16) { o.fillStyle = '#f6e4c0'; o.fillRect(x, 374, 10, 12); o.fillStyle = 'rgba(150,110,70,0.3)'; o.fillRect(x + 8, 374, 2, 12); }
  o.strokeStyle = 'rgba(150,110,70,0.3)'; o.lineWidth = 1; const r = P.rng(5);
  for (let row = 0, y = 392; y < GY - 4; row++, y += 14) for (let x = 140 + (row % 2) * 12; x < W; x += 24) { o.strokeRect(x + 0.5, y + 0.5, 23, 13); if (r() < 0.3) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff4dc' : '#b8925e', 0.3); o.fillRect(x + 2, y + 2, 19, 9); } }
  // the gate tower with an open arch; warm light and a street inside
  const tg = o.createLinearGradient(GX - 40, 0, GX + 40, 0); tg.addColorStop(0, '#f8e6c4'); tg.addColorStop(1, '#d4b080'); o.fillStyle = tg; o.fillRect(GX - 40, 344, 80, GY - 344);
  for (let x = GX - 42; x < GX + 40; x += 14) { o.fillStyle = '#fbecd0'; o.fillRect(x, 332, 9, 14); }
  o.fillStyle = '#fbecd0'; o.fillRect(GX - 44, 342, 88, 5);
  const ag = o.createLinearGradient(0, 400, 0, GY); ag.addColorStop(0, '#ffe6a8'); ag.addColorStop(1, '#f4c070'); o.fillStyle = ag;
  o.beginPath(); o.moveTo(GX - 21, GY); o.lineTo(GX - 21, 418); o.arc(GX, 418, 21, Math.PI, 0); o.lineTo(GX + 21, GY); o.closePath(); o.fill();
  o.fillStyle = 'rgba(200,140,80,0.5)'; o.fillRect(GX - 21, 442, 8, 32); o.fillRect(GX + 13, 448, 8, 26);
  o.strokeStyle = '#a87a4a'; o.lineWidth = 3; o.beginPath(); o.moveTo(GX - 23, GY); o.lineTo(GX - 23, 418); o.arc(GX, 418, 23, Math.PI, 0); o.lineTo(GX + 23, GY); o.stroke();
  o.fillStyle = '#7a4b2e'; o.fillRect(GX - 33, 360, 9, 13); o.fillRect(GX + 24, 360, 9, 13);
  // festive bunting from the tower to the wall
  const bunt = (x0, y0, x1, y1, n, seed) => { o.strokeStyle = '#8a5a3a'; o.lineWidth = 1; o.beginPath(); o.moveTo(x0, y0); o.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + 14, x1, y1); o.stroke();
    for (let i = 1; i < n; i++) { const u = i / n, x = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * (x0 + x1) / 2 + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * (Math.max(y0, y1) + 14) + u * u * y1; o.fillStyle = CLOAKS[(i + seed) % CLOAKS.length]; o.beginPath(); o.moveTo(x - 4, y); o.lineTo(x + 4, y); o.lineTo(x, y + 9); o.closePath(); o.fill(); } };
  bunt(GX - 40, 352, 150, 386, 9, 0); bunt(GX + 40, 352, W, 380, 5, 3);
  // the ground and the dusty road from the hills to the gate
  const gg = o.createLinearGradient(0, GY - 6, 0, H); gg.addColorStop(0, '#c8c070'); gg.addColorStop(1, '#88a050'); o.fillStyle = gg; o.fillRect(0, GY - 2, W, H - GY + 2);
  const rg = o.createLinearGradient(0, GY, 0, 540); rg.addColorStop(0, '#f2dcae'); rg.addColorStop(1, '#ddb882'); o.fillStyle = rg;
  o.beginPath(); o.moveTo(0, 476); o.quadraticCurveTo(180, 470, GX - 24, GY); o.lineTo(GX + 24, GY); o.quadraticCurveTo(W - 20, 500, W, 520); o.lineTo(W, 540); o.quadraticCurveTo(180, 534, 0, 540); o.closePath(); o.fill();
  o.fillStyle = 'rgba(170,120,70,0.25)'; for (let i = 0; i < 40; i++) { o.beginPath(); o.ellipse(r() * W, 482 + r() * 52, 3 + r() * 6, 1 + r() * 1.5, 0, 0, 7); o.fill(); }
  o.fillStyle = 'rgba(255,248,220,0.5)'; for (let i = 0; i < 20; i++) { o.beginPath(); o.ellipse(r() * W, 482 + r() * 52, 2 + r() * 3, 0.8, 0, 0, 7); o.fill(); }
  P.grassTufts(o, W, 542, 640, 40, '#6a9a3a', 7); P.flowers(o, W, 546, 640, 30, ['#ffffff', '#f4d35e', '#ee6c8a', '#b98ae0'], 8);
  // a date palm on each side of the road: where the branches came from
  P.palm(o, 12, 488, 0.95, 0.12, 0, '#3f8a4a'); P.palm(o, 128, 482, 0.72, -0.1, 0, '#4a9450');
}
function temple(o, x, y) {
  const w = 96, h = 64;
  const g = o.createLinearGradient(x, y - h, x + w, y); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#e8d8c0'); o.fillStyle = g; o.fillRect(x, y - h, w, h);
  o.fillStyle = '#f6efe0'; o.fillRect(x + 26, y - h - 26, 44, 28);
  o.fillStyle = '#e9b949'; o.fillRect(x - 2, y - h - 3, w + 4, 4); o.fillRect(x + 24, y - h - 29, 48, 4);
  o.fillStyle = 'rgba(200,170,130,0.5)'; for (let i = 0; i < 7; i++) o.fillRect(x + 6 + i * 13, y - h + 6, 3, h - 8);
  o.fillStyle = '#c89a4a'; o.beginPath(); o.moveTo(x + 40, y); o.lineTo(x + 40, y - 30); o.arc(x + 48, y - 30, 8, Math.PI, 0); o.lineTo(x + 56, y); o.fill();
  const sh = o.createRadialGradient(x + 48, y - h - 12, 2, x + 48, y - h - 12, 60); sh.addColorStop(0, 'rgba(255,240,180,0.45)'); sh.addColorStop(1, 'rgba(255,240,180,0)'); o.fillStyle = sh; o.fillRect(x - 20, y - h - 70, w + 40, 120);
}

MG.add({
  id: 'palms', stage: 'easter', cmd: 'WAVE!', hint: 'swipe', time: 5, mood: 'party', winText: 'Hosanna!',
  card: {
    title: 'Palm branches for Jesus', ref: 'Mark 11:1–11; John 12:12–15', kind: 'Gospel story',
    text: 'All four Gospels tell how Jesus rode into Jerusalem on a young donkey just before the Passover festival. Crowds spread their cloaks on the road and waved branches, and John\'s Gospel says they were palm branches. The people shouted, "Hosanna! Blessed is the one who comes in the name of the Lord!"',
    ask: 'Jesus chose to ride a gentle donkey instead of a big horse. Why do you think he did that?',
  },
  init(g) {
    const s = g.s; s.need = [4, 6, 8][g.level]; s.n = 0; s.prog = 0; s.swing = 0; s.vsw = 0; s.waveT = -9; s.flying = []; s.notes = []; s.leaves = [];
    s.slots = Array.from({ length: s.need }, (_, i) => 140 + (i + 0.5) * (150 / s.need));
    s.cols = CLOAKS.slice().sort(() => Math.random() - 0.5);
  },
  down(g) { const s = g.s; if (s.n >= s.need) return; s.vsw += 3; s.downT = g.t; },
  up(g, x, y) { // a quick tap without a swipe counts as half a wave, so very young players still get there
    const s = g.s; if (s.n >= s.need || g.t - (s.swipedT ?? -9) < 0.05) return;
    if (Math.hypot(x - (g.ptr.sx ?? x), y - (g.ptr.sy ?? y)) < 28) wave(g, 0.5, 1);
  },
  swipe(g, dx, dy) { g.s.swipedT = g.t; wave(g, 1, Math.sign(dx) || 1); },
  update(g, dt) {
    const s = g.s, t = g.t;
    // the branches swing on a soft spring
    s.vsw += (-s.swing * 60 - s.vsw * 7) * dt; s.swing += s.vsw * dt;
    for (const f of s.flying) f.q = Math.min(1, (t - f.t) / 0.42);
    for (const n of s.notes) { n.y -= 50 * dt; n.x += Math.sin(t * 4 + n.ph) * 20 * dt; }
    s.notes = s.notes.filter(n => t - n.t < 1.3);
    for (const l of s.leaves) { l.x += l.vx * dt; l.y += l.vy * dt; l.vy += 160 * dt; l.vx *= 0.99; l.r += l.vr * dt; }
    s.leaves = s.leaves.filter(l => t - l.t < 1.6);
    if (g.done && g.result === 'win' && t - (s.lastNote || 0) > 0.12) { s.lastNote = t; addNote(s, 30 + Math.random() * 240, 420, t); }
  },
  auto(g, dt, synth) { // swipe back and forth about five times a second
    const s = g.s; if (g.t < 0.3 || s.n >= s.need) return; const k = Math.floor(g.t / 0.2); if (k === s.botK) return; s.botK = k;
    const d = k % 2 ? 1 : -1; synth('down', 180 - d * 70, 420); synth('move', 180 + d * 70, 420); synth('up', 180 + d * 70, 420); synth('swipe', d * 140, 0, d * 1200, 0);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', lost = g.result === 'fail', k = s.n / s.need, since = won ? t - g.doneAt : 0;
    c.drawImage(g.bake('easter_palms_bg', paintBg), 0, 0, W, H);
    P.rays(c, 74, 150, W, H * 0.6, '#fff4d0', 0.1 + k * 0.08, 9, t);
    // birds circling over the city
    for (let i = 0; i < 3; i++) { const bx = 200 + Math.sin(t * 0.7 + i * 2.1) * 70, by = 170 + i * 26 + Math.sin(t * 1.3 + i) * 8, f = Math.sin(t * 9 + i * 2) * 4; c.strokeStyle = 'rgba(80,60,90,0.6)'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 7, by - f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 7, by - f); c.stroke(); }
    // the gate glows brighter as the cheering grows
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, GX, 440, 50 + k * 30, '#ffd890', 0.2 + k * 0.35 + (won ? 0.2 : 0)); c.restore();
    // cloaks already on the road, and the ones still flying through the air
    for (let i = 0; i < s.n; i++) { const f = s.flying[i]; if (f && f.q < 1) continue; cloak(c, s.slots[i], slotY(s.slots[i]) + (i % 2) * 3, cloakW(s.slots[i]), s.cols[i % s.cols.length]); }
    // the far crowd: the louder the cheer, the more of them wave their branches
    BACK.forEach((b, i) => {
      const lively = won || i < Math.ceil(k * BACK.length) || (i * 0.618 % 1) < 0.25, hop = won ? Math.abs(Math.sin(t * 8 + i)) * 6 : lively ? Math.abs(Math.sin(t * 6 + i)) * 2 * k : 0;
      const by = 470 - hop, sc = b.o.child ? 0.66 : 0.74, f = b.x > 180 ? -1 : 1;
      P.person(c, b.x, by, sc, { ...b.o, t, phase: i, bounce: 0.8, facing: f, expr: won ? 'laugh' : lively ? 'happy' : 'surprised', arms: lively ? 'raise' : 'down' });
      if (lively) { const hx = b.x + 26 * sc * f, hy = by - ((b.o.child ? 0.82 : 1) * 40 + 18) * sc; frond(c, hx, hy + 2, f * (0.3 + Math.sin(t * 5 + i) * 0.25 + s.swing * 0.08), 30, f * 0.5, LEAF[i % 3], 0.6); }
    });
    // Jesus on the donkey: walking slowly toward the gate, then right in when the road is ready
    const q = won ? Math.min(1, since / 0.75) : 0, dx = 74 + k * 22 + q * 130, walk = won || !lost;
    rider(c, dx, RY + 2 - q * 20, 1.95 - q * 0.4, t, { walk, expr: won ? 'laugh' : 'happy', arms: 'wave' });
    if (lost) { // the donkey decides the palm branches are lunch
      const mx = dx + 46, my = RY - 34 + Math.sin(t * 14) * 1.5; frond(c, mx + 4, my + 4, 1.3, 26, 0.4, '#5aae4a', 0.6);
    }
    for (const f of s.flying) { if (f.q >= 1) continue; const q = f.q, x = f.x0 + (f.x1 - f.x0) * q, y = f.y0 + (f.y1 - f.y0) * q - Math.sin(q * Math.PI) * 70;
      c.save(); c.translate(x, y); c.rotate((1 - q) * 3 * f.dir); cloak(c, 0, 0, cloakW(f.x1), f.col, 0.7 + q * 0.3); c.restore(); }
    // a target glow on the next empty spot of road
    if (!g.done && s.n < s.need) { const pu = 0.5 + 0.5 * Math.sin(t * 6), x = s.slots[s.n]; c.save(); c.globalAlpha = 0.4 + 0.4 * pu; c.strokeStyle = '#fff6d0'; c.lineWidth = 2.5; c.setLineDash([5, 4]); c.beginPath(); c.ellipse(x, slotY(x), cloakW(x) * 0.55, 7, 0, 0, 7); c.stroke(); c.restore(); }
    // palm leaves and music notes in the air
    for (const l of s.leaves) { c.save(); c.globalAlpha = Math.max(0, 1 - (t - l.t) / 1.6); c.translate(l.x, l.y); c.rotate(l.r); c.fillStyle = l.col; c.beginPath(); c.ellipse(0, 0, 7, 2.2, 0, 0, 7); c.fill(); c.restore(); }
    for (const n of s.notes) { const a = 1 - (t - n.t) / 1.3; c.save(); c.globalAlpha = a; c.fillStyle = n.col; c.strokeStyle = n.col; c.lineWidth = 2; c.beginPath(); c.ellipse(n.x, n.y, 4.5, 3.4, -0.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(n.x + 4, n.y - 1); c.lineTo(n.x + 4, n.y - 16); c.quadraticCurveTo(n.x + 10, n.y - 12, n.x + 11, n.y - 7); c.stroke(); c.restore(); }
    // the near crowd: a girl and a grandpa with big palm branches that swing with every swipe
    const pu = 0.5 + 0.5 * Math.sin(t * 5), hot = !g.done && s.n < s.need;
    const near = [
      { x: 44, y: 656, sc: 1.5, f: 1, o: { skin: SK[1], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[0], child: true } },
      { x: 318, y: 652, sc: 1.55, f: -1, o: { skin: SK[3], robe: CL.teal, stripe: CL.cream, beard: '#e8e2da', hair: HR[5], head: 'wrap', headCol: CL.cream } },
    ];
    near.forEach((p, i) => {
      const hop = won ? Math.abs(Math.sin(t * 9 + i)) * 8 : Math.abs(s.vsw) * 0.4, y = p.y - hop;
      const hx = p.x + 26 * p.sc * p.f, hy = y - ((p.o.child ? 0.82 : 1) * 40 + 18) * p.sc;
      if (hot) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, hx + p.f * 20, hy - 60, 70, '#fff0b0', 0.18 + 0.2 * pu); c.restore(); }
      P.person(c, p.x, y, p.sc, { ...p.o, t, phase: i * 2, facing: p.f, bounce: 1.4, expr: won ? 'laugh' : s.n > 0 ? 'happy' : 'wow', arms: 'raise' });
      frond(c, hx, hy + 4, -p.f * 0.22 + s.swing * 0.55 + Math.sin(t * 2 + i) * 0.05, 100, -p.f * 0.5 + s.swing * 0.3, i ? '#4f9a48' : '#5aa84e', 1.25);
    });
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});
// the road climbs gently toward the gate, so cloaks further along sit higher and look a little smaller
const slotY = x => 522 - (x - 140) * 0.17, cloakW = x => 46 - (x - 140) * 0.08;
function addNote(s, x, y, t) { s.notes.push({ x, y, t, ph: Math.random() * 6, col: ['#fff6d0', '#ffd45a', '#ffffff', '#ffb0c8'][Math.floor(Math.random() * 4)] }); }
function wave(g, amt, dir) {
  const s = g.s, t = g.t; if (s.n >= s.need) return;
  s.vsw += dir * 9; s.waveT = t; g.sfx('rustle');
  for (let i = 0; i < 6; i++) s.leaves.push({ x: dir > 0 ? 60 : 300, y: 470 + Math.random() * 40, vx: dir * (60 + Math.random() * 140), vy: -120 - Math.random() * 120, vr: (Math.random() - 0.5) * 10, r: Math.random() * 6, t, col: LEAF[i % LEAF.length] });
  const before = Math.floor(s.prog); s.prog = Math.min(s.need, s.prog + amt);
  if (Math.floor(s.prog) > before) {
    const i = s.n++, from = BACK[(i * 3 + 1) % BACK.length];
    s.flying[i] = { x0: from.x, y0: 430, x1: s.slots[i], y1: slotY(s.slots[i]) + (i % 2) * 3, t, q: 0, col: s.cols[i % s.cols.length], dir: from.x < s.slots[i] ? 1 : -1 };
    g.sfx(s.n % 2 ? 'swoosh' : 'whoosh'); g.sfx('cheer');
    for (let k = 0; k < 2 + s.n; k++) addNote(s, 20 + Math.random() * 260, 430 + Math.random() * 30, t);
    g.burst(s.slots[i], slotY(s.slots[i]) - 8, ['#ffd45a', '#fff6c0', '#8ccc5a', '#ff9ab8'], 10, 140);
    if (s.n >= s.need) { g.win(); g.sfx('trumpet'); g.shake(4, 0.3); g.burst(GX, 440, ['#ffd45a', '#fff6c0', '#ff8ab0', '#8fd8ff', '#8ccc5a'], 30, 260); }
  }
}
