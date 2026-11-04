// WASH! — John 13:1–17. On his last night with his friends, Jesus kneels with a bowl and a towel and washes their dusty feet.
// Scrub the cloth back and forth over each pair of dusty feet until they sparkle. Peter is astonished, then laughs.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const PETER = { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly' };
const OTHERS = [
  { skin: SK[1], robe: CL.teal, stripe: CL.cream, hair: HR[2] },
  { skin: SK[3], robe: CL.terracotta, stripe: CL.sand, beard: true, hair: HR[3] },
  { skin: SK[0], robe: CL.olive, stripe: CL.cream, beard: true, hair: HR[1], hairStyle: 'curly' },
  { skin: SK[2], robe: CL.plum, stripe: CL.gold, hair: HR[0] },
];
const SY = 426, FY = 488, SC = 1.25, JY = 604;
const XS = { 2: [108, 252], 3: [66, 180, 294], 4: [48, 136, 224, 312] };

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function footPath(c, fx) { const s = SC; c.beginPath(); c.moveTo(fx - 4.6 * s, FY - 17); c.lineTo(fx + 4.6 * s, FY - 17); c.quadraticCurveTo(fx + 8.6 * s, FY - 9, fx + 8 * s, FY - 2); c.quadraticCurveTo(fx, FY + 2.5, fx - 8 * s, FY - 2); c.quadraticCurveTo(fx - 8.6 * s, FY - 9, fx - 4.6 * s, FY - 17); c.closePath(); }
// a friend sitting on the bench: upper body clipped at the seat, a lap, robe falling over the knees, bare feet on the floor
function seatedFriend(c, x, o) {
  c.save(); c.beginPath(); c.rect(x - 60, 0, 120, SY - 3); c.clip(); P.person(c, x, SY + 16, SC, o); c.restore();
  const robe = o.robe, s = SC;
  let g = c.createLinearGradient(x - 18 * s, 0, x + 18 * s, 0); g.addColorStop(0, P.shade(robe, 0.14)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x - 19 * s, SY - 6); c.quadraticCurveTo(x, SY - 12, x + 19 * s, SY - 6); c.lineTo(x + 17 * s, SY + 30); c.quadraticCurveTo(x, SY + 35, x - 17 * s, SY + 30); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = P.rgba(P.shade(robe, -0.45), 0.35); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 4, SY + 1); c.quadraticCurveTo(x - 6, SY + 18, x - 3, SY + 31); c.moveTo(x + 7, SY + 2); c.quadraticCurveTo(x + 9, SY + 18, x + 8, SY + 31); c.stroke();
  if (o.stripe) { c.fillStyle = P.rgba(o.stripe, 0.75); c.beginPath(); c.moveTo(x - 17.2 * s, SY + 25); c.quadraticCurveTo(x, SY + 30, x + 17.2 * s, SY + 25); c.lineTo(x + 17 * s, SY + 28.5); c.quadraticCurveTo(x, SY + 33.5, x - 17 * s, SY + 28.5); c.closePath(); c.fill(); }
}
function drawFeet(c, x, p, t) {
  const s = SC, skin = p.look.skin, dirt = p.dirt, base = P.mix(skin, '#8f6240', 0.6 * dirt), line = P.shade(skin, -0.42);
  c.fillStyle = 'rgba(30,12,10,0.3)'; c.beginPath(); c.ellipse(x, FY + 1, 24 * s, 4.5, 0, 0, 7); c.fill();
  for (const sd of [-1, 1]) {
    const fx = x + sd * 9 * s;
    c.fillStyle = base; c.strokeStyle = line; c.lineWidth = 1.3;
    c.fillRect(fx - 3.8 * s, SY + 28, 7.6 * s, FY - SY - 40); c.strokeRect(fx - 3.8 * s, SY + 28, 7.6 * s, FY - SY - 40);
    // toes: the big toe on the inner side
    for (let k = 0; k < 5; k++) { const tx = fx - sd * 5.6 * s + sd * k * 2.8 * s, r = (k === 0 ? 2.5 : 1.8 - k * 0.12) * s; c.beginPath(); c.arc(tx, FY - 1.5 + (k === 0 ? 0.2 : k * 0.5), r, 0, 7); c.fill(); c.stroke(); }
    const fg = c.createLinearGradient(fx, FY - 17, fx, FY); fg.addColorStop(0, P.shade(base, -0.08)); fg.addColorStop(1, P.shade(base, 0.12)); c.fillStyle = fg;
    footPath(c, fx); c.fill(); c.stroke();
    if (dirt > 0.02) { // dusty smudges, seeded per pair so they stay put while they fade
      c.save(); footPath(c, fx); c.rect(fx - 3.8 * s, SY + 28, 7.6 * s, FY - SY - 40); c.clip(); const r = P.rng(p.seed + sd * 7);
      for (let i = 0; i < 9; i++) { c.fillStyle = P.rgba(i % 3 ? '#5a3820' : '#8a6040', (0.5 + r() * 0.4) * dirt); c.beginPath(); c.ellipse(fx + (r() - 0.5) * 16, FY - 22 + r() * 22, 2 + r() * 4, 1.4 + r() * 2.6, r() * 3, 0, 7); c.fill(); }
      c.restore();
    } else { c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(fx - 2, FY - 11, 2.2, 4, -0.3, 0, 7); c.fill(); }
  }
  if (dirt > 0.02) { const r = P.rng(p.seed + 3); c.fillStyle = P.rgba('#b08860', 0.4 * dirt); for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(x + (r() - 0.5) * 60, FY + 1 + r() * 6, 1 + r() * 2, 0, 7); c.fill(); } }
  if (p.foam > 0.02) { const r = P.rng(p.seed + 11); for (let i = 0; i < 14; i++) { const bx = x + (r() - 0.5) * 42 + Math.sin(t * 3 + i) * 1.5, by = FY - 4 - r() * 26, br = 1.6 + r() * 3.4; c.fillStyle = P.rgba('#ffffff', 0.75 * p.foam); c.strokeStyle = P.rgba('#9fd4ea', 0.8 * p.foam); c.lineWidth = 0.8; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); c.stroke(); } }
  if (p.clean) { for (let i = 0; i < 4; i++) { const tw = Math.max(0, Math.sin(t * 5 + i * 1.7 + p.seed)); if (tw < 0.25) continue; c.save(); c.globalAlpha = tw; c.fillStyle = i % 2 ? '#fffbe0' : '#ffe58a'; drawStar(c, x + [-20, 18, -6, 24][i] * s, FY - [26, 18, 4, 30][i], 2.5 + tw * 3.5, t); c.restore(); } }
}
// a folded linen towel, wet at one end
function cloth(c, x, y, rot, s = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = 'rgba(30,12,10,0.22)'; c.beginPath(); c.ellipse(3, 14, 16, 4, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(-16, -10, 16, 12); g.addColorStop(0, '#fffdf6'); g.addColorStop(0.55, '#f1e8d6'); g.addColorStop(1, '#a8d6ea');
  c.fillStyle = g; c.strokeStyle = '#8a7a6a'; c.lineWidth = 1.4; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-17, -6); c.quadraticCurveTo(-4, -13, 15, -8); c.quadraticCurveTo(19, 1, 14, 10); c.quadraticCurveTo(-2, 14, -15, 9); c.quadraticCurveTo(-20, 2, -17, -6); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(138,122,106,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-12, -4); c.quadraticCurveTo(0, -8, 12, -3); c.moveTo(-13, 4); c.quadraticCurveTo(0, 1, 12, 5); c.stroke();
  c.fillStyle = 'rgba(120,190,225,0.8)'; c.beginPath(); c.arc(6, 15, 1.8, 0, 7); c.arc(-4, 16, 1.4, 0, 7); c.fill();
  c.restore();
}
function lamp(c, x, y, t, k = 1) {
  const fl = 0.85 + 0.15 * Math.sin(t * 17 + x) * Math.sin(t * 7.3 + x * 0.3);
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, x, y - 10, 110 * k * fl, '#ffb45a', 0.32); glow(c, x, y - 10, 34 * k, '#ffe2a0', 0.55); c.restore();
  c.fillStyle = '#9a5a34'; c.strokeStyle = '#4a2416'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x - 13, y - 3); c.quadraticCurveTo(x, y + 8, x + 15, y - 4); c.lineTo(x + 8, y - 6); c.quadraticCurveTo(x, y - 9, x - 13, y - 3); c.closePath(); c.fill(); c.stroke();
  c.save(); c.translate(x + 11, y - 6); c.scale(1, fl);
  const fg = c.createRadialGradient(0, -3, 0, 0, -5, 10); fg.addColorStop(0, '#fffbe0'); fg.addColorStop(0.5, '#ffd36a'); fg.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = fg;
  c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(-5, -3, Math.sin(t * 9 + x) * 1.5, -13); c.quadraticCurveTo(5, -3, 0, 2); c.fill(); c.restore();
}
function kneel(c, x, y, s, o) { // y = floor line under the knees
  c.save(); c.beginPath(); c.rect(x - 80, 0, 160, y - 13 * s); c.clip(); P.person(c, x, y + 6 * s, s, o); c.restore();
  c.fillStyle = 'rgba(30,12,10,0.3)'; c.beginPath(); c.ellipse(x, y + 1, 26 * s, 5, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(x, y - 18 * s, x, y); g.addColorStop(0, P.shade(o.robe, 0.1)); g.addColorStop(1, P.shade(o.robe, -0.18)); c.fillStyle = g; c.strokeStyle = P.shade(o.robe, -0.45); c.lineWidth = 1.6;
  c.beginPath(); c.ellipse(x, y - 8 * s, 21 * s, 9 * s, 0, 0, 7); c.fill(); c.stroke();
}
function basin(c, x, y, t) {
  c.fillStyle = 'rgba(30,12,10,0.3)'; c.beginPath(); c.ellipse(x, y + 2, 30, 6, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(x - 28, 0, x + 28, 0); g.addColorStop(0, '#e8a060'); g.addColorStop(0.5, '#c8783e'); g.addColorStop(1, '#7a3e22');
  c.fillStyle = g; c.strokeStyle = '#4a2214'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 28, y - 16); c.quadraticCurveTo(x - 26, y + 2, x, y + 2); c.quadraticCurveTo(x + 26, y + 2, x + 28, y - 16); c.closePath(); c.fill(); c.stroke();
  const wg = c.createRadialGradient(x - 6, y - 17, 1, x, y - 16, 28); wg.addColorStop(0, '#e8fbff'); wg.addColorStop(0.6, '#7ac8e0'); wg.addColorStop(1, '#3a8aa8'); c.fillStyle = wg;
  c.beginPath(); c.ellipse(x, y - 16, 28, 6.5, 0, 0, 7); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x + Math.sin(t * 2) * 3, y - 16, 12 + Math.sin(t * 3) * 3, 2.4, 0, 0, 7); c.stroke();
}
function paintRoom(o) {
  const wg = o.createLinearGradient(0, 0, 0, 420); wg.addColorStop(0, '#2a1424'); wg.addColorStop(0.4, '#5e3030'); wg.addColorStop(1, '#a8663e'); o.fillStyle = wg; o.fillRect(0, 0, W, 420);
  let r = P.rng(17); for (let i = 0; i < 260; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#ffcf96' : '#2a1018', 0.02 + r() * 0.03); o.fillRect(r() * W, r() * 420, 3 + r() * 10, 2 + r() * 4); }
  for (let y = 40; y < 404; y += 26) { o.fillStyle = 'rgba(40,14,20,0.12)'; o.fillRect(0, y, W, 1.5); for (let x = (y / 26 % 2) * 22; x < W; x += 44) o.fillRect(x, y, 1.5, 26); }
  // ceiling rafters
  o.fillStyle = '#20101a'; o.fillRect(0, 0, W, 20); for (let i = 0; i < 7; i++) { const bx = 14 + i * 56; const bg = o.createLinearGradient(bx - 12, 0, bx + 12, 0); bg.addColorStop(0, '#3a2018'); bg.addColorStop(1, '#1a0c10'); o.fillStyle = bg; o.fillRect(bx - 12, 0, 24, 28); o.fillStyle = 'rgba(255,200,140,0.12)'; o.fillRect(bx - 12, 26, 24, 3); }
  // the arched window: a full Passover moon over the rooftops of Jerusalem
  const wx = 180, top = 64, bot = 238, hw = 52;
  const arch = (k) => { o.beginPath(); o.moveTo(wx - hw - k, bot + k * 0.5); o.lineTo(wx - hw - k, top + hw); o.arc(wx, top + hw, hw + k, Math.PI, 0); o.lineTo(wx + hw + k, bot + k * 0.5); o.closePath(); };
  const rv = o.createLinearGradient(0, top, 0, bot); rv.addColorStop(0, '#6a3a34'); rv.addColorStop(1, '#d08a58'); o.fillStyle = rv; arch(12); o.fill();
  o.save(); arch(0); o.clip();
  P.sky(o, W, bot + 10, ['#0b1030', '#1e2560', '#4a3f80', '#8a5a8a']); P.stars(o, W, 200, 40, 23, 0);
  glow(o, 206, 108, 70, '#dfe6ff', 0.35);
  const mg = o.createRadialGradient(201, 103, 1, 206, 108, 17); mg.addColorStop(0, '#ffffff'); mg.addColorStop(1, '#e6e2f6'); o.fillStyle = mg; o.beginPath(); o.arc(206, 108, 16, 0, 7); o.fill();
  o.fillStyle = 'rgba(180,180,220,0.35)'; o.beginPath(); o.arc(201, 112, 3, 0, 7); o.arc(210, 102, 2.2, 0, 7); o.fill();
  P.hills(o, W, 214, 22, '#3a3466', '#2a2450', { seed: 3, freq: 0.03, dabs: 10, bottom: bot + 10 });
  r = P.rng(5); for (let i = 0; i < 9; i++) { const bx = 124 + i * 13 + r() * 4, bh = 10 + r() * 16; o.fillStyle = '#1c1838'; o.fillRect(bx, bot - bh - 6, 13, bh + 10); if (r() < 0.6) { o.fillStyle = '#ffcf7a'; o.fillRect(bx + 4, bot - bh + 2, 3, 3); } }
  o.restore();
  o.fillStyle = '#c8885a'; o.fillRect(wx - hw - 16, bot - 2, hw * 2 + 32, 9); o.fillStyle = '#e8b07a'; o.fillRect(wx - hw - 16, bot - 2, hw * 2 + 32, 2);
  // cool moonlight on the wall
  o.save(); o.globalCompositeOperation = 'screen'; const ml = o.createLinearGradient(0, bot, 0, 410); ml.addColorStop(0, 'rgba(150,160,230,0.16)'); ml.addColorStop(1, 'rgba(150,160,230,0)'); o.fillStyle = ml; o.beginPath(); o.moveTo(wx - hw, bot + 6); o.lineTo(wx + hw, bot + 6); o.lineTo(wx + hw + 50, 410); o.lineTo(wx - hw + 20, 410); o.closePath(); o.fill(); o.restore();
  // lamp niches
  for (const nx of [44, 316]) { o.fillStyle = 'rgba(40,16,20,0.45)'; o.beginPath(); o.moveTo(nx - 22, 282); o.lineTo(nx - 22, 240); o.arc(nx, 240, 22, Math.PI, 0); o.lineTo(nx + 22, 282); o.closePath(); o.fill(); o.fillStyle = '#c88a5a'; o.fillRect(nx - 28, 280, 56, 6); o.fillStyle = '#7a4430'; o.fillRect(nx - 28, 286, 56, 3); }
  // the supper table, behind the bench
  o.fillStyle = 'rgba(30,10,10,0.3)'; o.fillRect(14, 348, W - 28, 16);
  const tg = o.createLinearGradient(0, 336, 0, 360); tg.addColorStop(0, '#f6ead2'); tg.addColorStop(1, '#c8a880'); o.fillStyle = tg; o.fillRect(14, 336, W - 28, 22);
  o.fillStyle = '#e8d4b0'; for (let i = 0; i < 12; i++) { o.beginPath(); o.moveTo(14 + i * 28, 358); o.quadraticCurveTo(28 + i * 28, 366, 42 + i * 28, 358); o.fill(); }
  P.basket(o, 70, 334, 0.7, 'bread'); P.basket(o, 262, 334, 0.6, 'bread');
  // cup and jug
  o.fillStyle = '#8a3a4a'; o.strokeStyle = '#3a1418'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(176, 318); o.lineTo(190, 318); o.quadraticCurveTo(190, 330, 183, 331); o.lineTo(183, 336); o.lineTo(178, 336); o.lineTo(178, 331); o.quadraticCurveTo(176, 330, 176, 318); o.fill(); o.stroke();
  const jg = o.createLinearGradient(118, 0, 140, 0); jg.addColorStop(0, '#d8885a'); jg.addColorStop(1, '#8a4a2a'); o.fillStyle = jg; o.beginPath(); o.moveTo(124, 312); o.lineTo(134, 312); o.quadraticCurveTo(144, 324, 136, 336); o.lineTo(122, 336); o.quadraticCurveTo(114, 324, 124, 312); o.fill(); o.stroke();
  o.fillStyle = '#6a3a7a'; for (let i = 0; i < 7; i++) { o.beginPath(); o.arc(298 + (i % 3) * 5 + (i > 2 ? 2 : 0), 326 + Math.floor(i / 3) * 4, 3, 0, 7); o.fill(); }
  // floor
  o.fillStyle = '#4a2418'; o.fillRect(0, 404, W, 8);
  const fg = o.createLinearGradient(0, 410, 0, 640); fg.addColorStop(0, '#9a5a38'); fg.addColorStop(1, '#4a2420'); o.fillStyle = fg; o.fillRect(0, 410, W, 230);
  o.strokeStyle = 'rgba(40,16,12,0.35)'; o.lineWidth = 1.2; for (let i = -6; i <= 6; i++) { o.beginPath(); o.moveTo(180 + i * 30, 410); o.lineTo(180 + i * 90, 640); o.stroke(); }
  for (const yy of [424, 444, 470, 504, 548, 604]) { o.beginPath(); o.moveTo(0, yy); o.lineTo(W, yy); o.stroke(); }
  // warm pool of lamplight on the floor
  o.save(); o.globalCompositeOperation = 'screen'; glow(o, 180, 500, 240, '#ffb060', 0.28); o.restore();
  // a striped rug where Jesus kneels
  o.save(); o.beginPath(); o.moveTo(36, 528); o.lineTo(324, 528); o.lineTo(352, 640); o.lineTo(8, 640); o.closePath(); o.clip();
  const rg = o.createLinearGradient(0, 528, 0, 640); rg.addColorStop(0, '#9a3a32'); rg.addColorStop(1, '#6a2228'); o.fillStyle = rg; o.fillRect(0, 528, W, 112);
  for (const [yy, col, hh] of [[540, '#d89a48', 4], [550, '#3f4f8f', 3], [618, '#3f4f8f', 3], [626, '#d89a48', 4]]) { o.fillStyle = col; o.fillRect(0, yy, W, hh); }
  o.fillStyle = 'rgba(232,180,100,0.45)'; for (let i = 0; i < 9; i++) { const dx = 40 + i * 35; o.beginPath(); o.moveTo(dx, 572); o.lineTo(dx + 8, 584); o.lineTo(dx, 596); o.lineTo(dx - 8, 584); o.closePath(); o.fill(); }
  o.restore();
  o.fillStyle = '#e8d4b0'; for (let i = 0; i < 30; i++) o.fillRect(40 + i * 9.6, 524, 1.5, 5);
  // the bench
  o.fillStyle = 'rgba(30,10,10,0.35)'; o.fillRect(12, FY - 2, W - 24, 6);
  for (const lx of [22, 176, 330]) { o.fillStyle = '#5a321e'; o.fillRect(lx, SY + 10, 10, FY - SY - 10); }
  const bg2 = o.createLinearGradient(0, SY - 8, 0, SY + 12); bg2.addColorStop(0, '#c08454'); bg2.addColorStop(0.35, '#9a6038'); bg2.addColorStop(1, '#5e341e'); o.fillStyle = bg2; o.fillRect(8, SY - 8, W - 16, 20);
  o.fillStyle = 'rgba(255,220,170,0.35)'; o.fillRect(8, SY - 8, W - 16, 2);
}

MG.add({
  id: 'wash', stage: 'easter', cmd: 'WASH!', hint: 'drag', time: 6, mood: 'night', winText: 'Clean!',
  card: { title: 'Jesus washes feet', ref: 'John 13:1–17', kind: 'Gospel story', text: 'The Gospel of John tells how, on his last night with his friends, Jesus knelt with a bowl of water and a towel and washed their dusty feet. This was a job usually left to servants. Then he asked his friends to serve each other in the same way.', note: 'John\'s Gospel was written later than the others and tells Jesus\'s story in its own way. Only John tells about the foot washing, and many churches still wash feet on the Thursday before Easter.', ask: 'What is a helpful job at home that nobody likes doing? Could you do it for someone this week?' },
  init(g) {
    const s = g.s, n = [2, 3, 4][g.level], xs = XS[n];
    const others = OTHERS.slice().sort(() => Math.random() - 0.5), peterAt = Math.floor(Math.random() * n);
    s.pairs = xs.map((x, i) => ({ x, look: i === peterAt ? PETER : others.pop(), peter: i === peterAt, dirt: 1, clean: false, cleanT: -9, scrubT: -9, foam: 0, seed: 20 + i * 13, phase: Math.random() * 6 }));
    s.need = [190, 230, 250][g.level]; s.drag = false; s.px = 0; s.py = 0; s.acc = 0; s.jx = xs[0]; s.drops = [];
  },
  down(g, x, y) { const s = g.s; s.drag = true; s.px = x; s.py = y; g.sfx('swoosh'); this.move(g, x, y); },
  move(g, x, y) {
    const s = g.s; if (!s.drag) return; const d = Math.min(80, Math.hypot(x - s.px, y - s.py)); s.px = x; s.py = y;
    const half = Math.min(46, (s.pairs.length > 1 ? s.pairs[1].x - s.pairs[0].x : 120) / 2 + 2);
    const p = s.pairs.find(q => Math.abs(q.x - x) < half && y > SY - 30 && y < FY + 34); if (!p || p.clean) return;
    p.dirt = Math.max(0, p.dirt - d / s.need); p.foam = Math.min(1, p.foam + d / 90); p.scrubT = g.t; s.acc += d;
    if (s.acc > 55) { s.acc = 0; g.sfx(Math.random() < 0.5 ? 'bubble' : 'drip'); for (let i = 0; i < 3; i++) s.drops.push({ x: x + (Math.random() - 0.5) * 30, y: y + (Math.random() - 0.5) * 10, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 90, t: g.t, dust: Math.random() < 0.5 }); }
    if (p.dirt <= 0) {
      p.clean = true; p.cleanT = g.t; p.foam = 1; g.sfx('sparkle'); if (p.peter) g.sfx('laugh');
      g.burst(p.x, FY - 16, ['#fffbe0', '#ffe58a', '#bfeaff', '#ffffff'], 16, 160);
      if (s.pairs.every(q => q.clean)) { g.win(); g.sfx('cheer'); }
    }
  },
  up(g) { g.s.drag = false; },
  update(g, dt) {
    const s = g.s; for (const p of s.pairs) p.foam = Math.max(0, p.foam - dt * (p.clean ? 0.9 : 1.6));
    const next = s.pairs.find(p => !p.clean), tx = s.drag ? Math.max(56, Math.min(304, s.px)) : next ? next.x : 180;
    s.jx += (tx - s.jx) * Math.min(1, dt * 5);
    for (const d of s.drops) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 420 * dt; }
    s.drops = s.drops.filter(d => g.t - d.t < 0.6);
  },
  auto(g, dt, synth) { // scrub each dirty pair back and forth
    const s = g.s; if (g.t < 0.4) return; const p = s.pairs.find(q => !q.clean); if (!p) { if (s.drag) synth('up', s.px, s.py); return; }
    const y = FY - 14;
    if (!s.drag) synth('down', p.x, y); else synth('move', p.x + Math.sin(g.t * 22) * 26, y + Math.cos(g.t * 17) * 8);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win';
    c.drawImage(g.bake('easter_wash_bg', paintRoom), 0, 0, W, H);
    lamp(c, 44, 278, t); lamp(c, 316, 278, t + 2); lamp(c, 224, 334, t + 4, 0.8);
    // dust motes drifting in the lamplight
    const r = P.rng(9); c.fillStyle = 'rgba(255,226,170,0.55)'; for (let i = 0; i < 22; i++) { const x = (r() * W + t * (6 + r() * 8)) % W, y = 250 + r() * 200 + Math.sin(t * 0.8 + i) * 8, a = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.3 + i)); c.globalAlpha = a; c.beginPath(); c.arc(x, y, 0.8 + r() * 1.2, 0, 7); c.fill(); } c.globalAlpha = 1;
    // friends on the bench
    for (const p of s.pairs) {
      const ct = t - p.cleanT, scrub = t - p.scrubT < 0.3;
      let expr = 'happy', arms = 'hold';
      if (won || (p.clean && ct < 0.9)) { expr = 'laugh'; arms = 'cheer'; }
      else if (p.clean) { expr = p.peter ? 'laugh' : 'happy'; arms = p.peter ? 'out' : 'hold'; }
      else if (scrub) { expr = p.peter ? 'surprised' : 'wow'; arms = p.peter ? 'out' : 'hold'; }
      seatedFriend(c, p.x, { ...p.look, t, phase: p.phase, bounce: p.clean ? 2 : 0.6, expr, arms, blink: !scrub && !p.clean && Math.sin(t * 1.7 + p.phase) > 0.97 });
      if (p.peter && p.clean && !won) { c.fillStyle = 'rgba(190,230,255,0.85)'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(p.x + sd * 14, SY - 44 + ((t * 30) % 10), 1.8, 0, 7); c.fill(); } }
      if (!p.clean) { const pu = 0.5 + 0.5 * Math.sin(t * 5 + p.phase); c.save(); c.globalCompositeOperation = 'screen'; const gl = c.createRadialGradient(p.x, FY - 8, 4, p.x, FY - 8, 46); gl.addColorStop(0, `rgba(255,220,140,${0.25 + 0.3 * pu})`); gl.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(p.x, FY - 8, 46, 26, 0, 0, 7); c.fill(); c.restore(); }
      drawFeet(c, p.x, p, t);
    }
    // splashes and dust flying from the scrubbing
    for (const d of s.drops) { const q = (t - d.t) / 0.6; c.fillStyle = d.dust ? `rgba(176,136,96,${0.7 * (1 - q)})` : `rgba(170,225,250,${0.9 * (1 - q)})`; c.beginPath(); c.arc(d.x, d.y, d.dust ? 3.5 * (1 + q) : 2.2, 0, 7); c.fill(); }
    // Jesus kneels on the rug with the basin
    const jx = s.jx, bx = jx + (jx > 250 ? -62 : 62);
    basin(c, bx, JY + 6, t);
    const reaching = s.drag && !won;
    kneel(c, jx, JY, 1.42, { ...JESUS, t, phase: 1, bounce: 0.5, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : reaching ? 'reach' : 'hold', facing: reaching && s.px < jx ? -1 : 1, hold: reaching || won ? null : (cc, hx, hy) => cloth(cc, hx, hy + 2, 0.1, 0.75) });
    if (reaching) cloth(c, s.px, s.py, Math.sin(t * 20) * 0.25, 1.05);
    P.vignette(c, W, H, 0.4, '#1a0814'); P.grain(c, W, H, 0.06);
  },
});
