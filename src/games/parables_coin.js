// SWEEP! — Luke 15:8–10. A woman loses one of her ten silver coins, lights a lamp and sweeps the house until she finds it, then throws a party.
// Rub the dusty heaps on the floor to sweep them away; one of them hides the glinting coin. Then the neighbours dance in.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const WOMAN = { skin: SK[2], robe: CL.teal, stripe: CL.saffron, hairStyle: 'long', hair: HR[1] };
const NEIGHBOURS = [
  { skin: SK[0], robe: CL.rose, stripe: CL.white, hairStyle: 'bun', hair: HR[2] },
  { skin: SK[3], robe: CL.plum, stripe: CL.gold, hair: HR[5], head: 'scarf', headCol: CL.sand },
  { skin: SK[1], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[0], child: true },
];
const SLOTS = [[124, 436], [222, 426], [314, 452], [58, 522], [168, 508], [274, 528], [108, 586], [238, 588]];
const WX = 46, WY = 416, WS = 1.3;          // the woman, standing at the back with her lamp
const CLOTH_X = 262, CLOTH_Y = 336;          // the cloth with her nine other coins
const SIL = ['#f4f4f8', '#c8ccd8', '#8a90a4'];

function oilLamp(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const f = 0.8 + 0.2 * Math.sin(t * 13) + 0.1 * Math.sin(t * 29);
  const gl = c.createRadialGradient(8, -8, 0, 8, -8, 26); gl.addColorStop(0, `rgba(255,226,150,${0.8 * f})`); gl.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = gl; c.fillRect(-20, -36, 56, 56);
  const g = c.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#d8945a'); g.addColorStop(1, '#8a4a24'); c.fillStyle = g; c.strokeStyle = '#5a2a14'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-10, -3); c.quadraticCurveTo(-10, 5, 0, 5); c.quadraticCurveTo(10, 5, 14, -1); c.lineTo(10, -4); c.quadraticCurveTo(0, -7, -10, -3); c.fill(); c.stroke();
  c.fillStyle = '#5a2a14'; c.beginPath(); c.ellipse(-1, -4, 4, 1.4, 0, 0, 7); c.fill();
  c.fillStyle = '#ffd27a'; c.beginPath(); c.moveTo(10, -4); c.quadraticCurveTo(15, -10 - f * 4, 12, -16 - f * 5); c.quadraticCurveTo(8, -10, 10, -4); c.fill();
  c.fillStyle = '#fff8d8'; c.beginPath(); c.ellipse(11.5, -8, 1.4, 3 * f, 0, 0, 7); c.fill();
  c.restore();
}
function coin(c, x, y, r, spin, t) {
  const sx = Math.max(0.15, Math.abs(Math.cos(spin)));
  c.save(); c.translate(x, y); c.scale(sx, 1);
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, 1, 0, 0, r); g.addColorStop(0, SIL[0]); g.addColorStop(0.6, SIL[1]); g.addColorStop(1, SIL[2]); c.fillStyle = g; c.strokeStyle = '#5a6074'; c.lineWidth = 1.2;
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(90,96,116,0.6)'; c.beginPath(); c.arc(0, 0, r * 0.72, 0, 7); c.stroke();
  c.fillStyle = 'rgba(90,96,116,0.55)'; c.beginPath(); c.arc(-r * 0.1, -r * 0.05, r * 0.28, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(-r * 0.35, -r * 0.4, r * 0.25, r * 0.12, -0.6, 0, 7); c.fill();
  c.restore();
}
function heap(c, x, y, a, seed, t) {
  if (a <= 0.02) return;
  const r = P.rng(seed), k = 0.35 + 0.65 * a, w = 40 * k, h = 20 * k;
  c.fillStyle = 'rgba(60,36,24,0.25)'; c.beginPath(); c.ellipse(x + 2, y + 3, w * 1.1, h * 0.45, 0, 0, 7); c.fill();
  for (let i = 0; i < 9; i++) { const dx = (r() - 0.5) * w * 1.3, dy = -r() * h * 0.7, rr = (8 + r() * 10) * k, gg = c.createRadialGradient(x + dx - rr * 0.3, y + dy - rr * 0.4, 1, x + dx, y + dy, rr);
    gg.addColorStop(0, '#d8c4a4'); gg.addColorStop(0.7, '#a89070'); gg.addColorStop(1, 'rgba(130,100,72,0)'); c.fillStyle = gg; c.beginPath(); c.ellipse(x + dx, y + dy, rr * 1.3, rr * 0.75, 0, 0, 7); c.fill(); }
  c.strokeStyle = 'rgba(220,190,110,0.8)'; c.lineWidth = 1.1; c.beginPath(); for (let i = 0; i < 5; i++) { const sx = x + (r() - 0.5) * w * 1.4, sy = y - r() * h * 0.6, a2 = (r() - 0.5) * 1.6; c.moveTo(sx, sy); c.lineTo(sx + Math.cos(a2) * 9 * k, sy + Math.sin(a2) * 4 * k); } c.stroke();
  c.fillStyle = 'rgba(80,60,50,0.55)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x + (r() - 0.5) * w * 1.4, y - r() * h * 0.6, 1 + r(), 0, 7); c.fill(); }
  // drifting motes above the dust
  c.fillStyle = 'rgba(255,240,210,0.5)'; for (let i = 0; i < 3; i++) { const q = (t * 0.4 + i / 3 + seed * 0.13) % 1; c.beginPath(); c.arc(x + Math.sin(t + i * 2 + seed) * w * 0.6, y - h - q * 26, 1.2, 0, 7); c.fill(); }
}
function mouse(c, x, y, s, t, f) {
  c.save(); c.translate(x, y); c.scale(s * f, s);
  c.strokeStyle = '#c89a9a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-18, -6 + Math.sin(t * 20) * 3, -24, 0); c.stroke();
  c.fillStyle = '#9a8a84'; c.beginPath(); c.ellipse(0, -4, 10, 6, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(9, -6, 5, 4, 0.3, 0, 7); c.fill();
  c.fillStyle = '#e8b0b0'; c.beginPath(); c.arc(6, -11, 3.4, 0, 7); c.fill(); P.eye(c, 11, -7, 1.3); c.fillStyle = '#e88a9a'; c.beginPath(); c.arc(14, -5, 1.3, 0, 7); c.fill();
  c.restore();
}
function broom(c, x, y, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.strokeStyle = '#7a5434'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -12); c.lineTo(34, -78); c.stroke();
  c.strokeStyle = 'rgba(255,220,170,0.5)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-1, -14); c.lineTo(32, -78); c.stroke();
  c.fillStyle = '#d8b45a'; c.strokeStyle = '#8a6a24'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-6, -16); c.lineTo(6, -12); c.lineTo(16, 8); c.lineTo(-18, 8); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(120,90,30,0.6)'; c.lineWidth = 1; c.beginPath(); for (let i = -4; i <= 4; i++) { c.moveTo(i * 1.2, -12); c.lineTo(i * 4, 8); } c.stroke();
  c.fillStyle = '#c9443c'; c.fillRect(-6, -17, 12, 3);
  c.restore();
}
function paintRoom(o) {
  // plastered back wall with a deep window full of evening sky
  const wg = o.createLinearGradient(0, 0, 0, 350); wg.addColorStop(0, '#6a4a48'); wg.addColorStop(0.5, '#a07a5e'); wg.addColorStop(1, '#c09a74'); o.fillStyle = wg; o.fillRect(0, 0, W, 360);
  const r = P.rng(31); for (let i = 0; i < 40; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#e8c8a0' : '#6a4a3a', 0.12); o.beginPath(); o.ellipse(r() * W, r() * 340, 10 + r() * 20, 4 + r() * 8, 0, 0, 7); o.fill(); }
  // ceiling beams
  for (let i = 0; i < 5; i++) { const x = 10 + i * 82; const bg = o.createLinearGradient(x, 0, x + 26, 0); bg.addColorStop(0, '#5a3a24'); bg.addColorStop(1, '#3a2418'); o.fillStyle = bg; o.fillRect(x, 0, 26, 18); }
  o.fillStyle = '#4a2e1e'; o.fillRect(0, 18, W, 8);
  o.save(); o.beginPath(); o.moveTo(150, 210); o.lineTo(150, 130); o.arc(190, 130, 40, Math.PI, 0); o.lineTo(230, 210); o.closePath();
  const sk = o.createLinearGradient(0, 90, 0, 210); sk.addColorStop(0, '#3a3a7a'); sk.addColorStop(0.6, '#c87a8a'); sk.addColorStop(1, '#ffc08a'); o.fillStyle = sk; o.fill(); o.clip();
  P.stars(o, W, 150, 30, 6, 0); o.fillStyle = '#6a4a6a'; o.beginPath(); o.moveTo(150, 210); o.quadraticCurveTo(190, 180, 230, 200); o.lineTo(230, 210); o.fill();
  o.restore(); o.strokeStyle = '#5a3a2a'; o.lineWidth = 6; o.beginPath(); o.moveTo(150, 212); o.lineTo(150, 130); o.arc(190, 130, 40, Math.PI, 0); o.lineTo(230, 212); o.stroke();
  o.fillStyle = '#d8b490'; o.fillRect(142, 210, 96, 8);
  // a shelf with jars and a basket of bread
  o.fillStyle = '#6a4228'; o.fillRect(18, 200, 100, 8);
  for (const [x, col, h] of [[34, '#c87a4a', 30], [58, '#a8a0c0', 22], [80, '#d8a060', 34], [104, '#8aa06a', 20]]) { const jg = o.createLinearGradient(x - 8, 0, x + 8, 0); jg.addColorStop(0, P.shade(col, 0.2)); jg.addColorStop(1, P.shade(col, -0.3)); o.fillStyle = jg; o.beginPath(); o.ellipse(x, 200 - h / 2, 9, h / 2, 0, 0, 7); o.fill(); o.fillRect(x - 4, 200 - h - 4, 8, 6); }
  P.basket(o, 300, 228, 0.9, 'bread'); o.fillStyle = '#6a4228'; o.fillRect(256, 236, 90, 8);
  // the door on the right, closed for now
  o.fillStyle = '#4a2c1c'; o.fillRect(300, 250, 60, 110); const dg = o.createLinearGradient(304, 0, 356, 0); dg.addColorStop(0, '#8a5a34'); dg.addColorStop(1, '#5a3a22'); o.fillStyle = dg; o.fillRect(304, 254, 56, 106);
  o.strokeStyle = 'rgba(40,20,10,0.5)'; o.lineWidth = 1.5; for (let i = 1; i < 4; i++) { o.beginPath(); o.moveTo(304 + i * 14, 254); o.lineTo(304 + i * 14, 360); o.stroke(); }
  // the packed-earth floor
  const fg = o.createLinearGradient(0, 350, 0, H); fg.addColorStop(0, '#b08a62'); fg.addColorStop(1, '#8a6444'); o.fillStyle = fg; o.fillRect(0, 352, W, H - 352);
  o.fillStyle = 'rgba(60,36,24,0.4)'; o.fillRect(0, 352, W, 4);
  for (let i = 0; i < 70; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#d8b48a' : '#6a4a32', 0.18); o.beginPath(); o.ellipse(r() * W, 360 + r() * 280, 8 + r() * 16, 2 + r() * 3, 0, 0, 7); o.fill(); }
  // a woven mat and a low table with the cloth of coins
  o.fillStyle = '#c9443c'; o.beginPath(); o.ellipse(178, 474, 120, 40, 0, 0, 7); o.fill(); o.save(); o.clip(); o.fillStyle = 'rgba(255,220,160,0.35)'; for (let i = -6; i <= 6; i++) o.fillRect(178 + i * 18, 430, 6, 90); o.restore();
  o.fillStyle = '#6a4228'; o.fillRect(CLOTH_X - 50, CLOTH_Y + 6, 100, 10); o.fillRect(CLOTH_X - 44, CLOTH_Y + 16, 6, 16); o.fillRect(CLOTH_X + 38, CLOTH_Y + 16, 6, 16);
  o.fillStyle = '#e8dcc0'; o.beginPath(); o.ellipse(CLOTH_X, CLOTH_Y + 4, 48, 9, 0, 0, 7); o.fill();
}

MG.add({
  id: 'coin', stage: 'parables', cmd: 'SWEEP!', hint: 'drag', time: 6, mood: 'party', winText: 'Found it!',
  card: {
    title: 'The lost coin', ref: 'Luke 15:8–10', kind: 'Parable',
    text: 'Jesus told a story about a woman who had ten silver coins and lost one. She lit a lamp, swept the whole house and searched carefully until she found it. Then she called her friends and neighbours to celebrate with her. Jesus said that God\'s angels are just as glad whenever one person turns back to God.',
    ask: 'Have you ever lost something special and found it again? How did it feel?',
  },
  init(g) {
    const s = g.s, n = [4, 6, 8][g.level];
    const slots = SLOTS.slice().sort(() => Math.random() - 0.5).slice(0, n);
    s.heaps = slots.map(([x, y], i) => ({ x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 8, a: 1, seed: 11 + i * 7, sweptT: -1, prize: ['mouse', 'button', 'none'][i % 3] }));
    s.coin = Math.floor(Math.random() * n); s.heaps[s.coin].prize = 'coin';
    s.need = [190, 230, 260][g.level]; s.glint = [0.7, 1.3, 2.0][g.level];
    s.brush = null; s.rot = 0; s.foundT = -1; s.sndT = 0; s.puffs = [];
  },
  down(g, x, y) { const s = g.s; s.brush = { x, y }; s.last = [x, y]; },
  move(g, x, y) {
    const s = g.s; if (!s.brush) return; const [lx, ly] = s.last, d = Math.min(36, Math.hypot(x - lx, y - ly)); s.last = [x, y];
    s.rot = Math.max(-0.7, Math.min(0.7, s.rot * 0.6 + (x - lx) * 0.03)); s.brush.x = x; s.brush.y = y;
    for (const h of s.heaps) {
      if (h.a <= 0 || Math.hypot(x - h.x, (y - h.y) * 1.4) > 34 + 24 * h.a) continue;
      h.a = Math.max(0, h.a - d / s.need);
      if (g.t - s.sndT > 0.14) { s.sndT = g.t; g.sfx('sweep'); for (let i = 0; i < 3; i++) s.puffs.push({ x: h.x + (Math.random() - 0.5) * 30, y: h.y - 6, vx: (x - lx) * 3 + (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 40, t: g.t, r: 6 + Math.random() * 8 }); }
      if (h.prize === 'coin' && h.a < 0.3 && s.foundT < 0) { h.a = 0; s.foundT = g.t; g.win(); g.sfx('coin'); g.sfx('cheer'); g.burst(h.x, h.y - 10, ['#ffffff', '#e8ecf8', '#ffd45a', '#ff9ac0'], 26, 230); g.shake(2, 0.2); }
      else if (h.a <= 0 && h.sweptT < 0) { h.sweptT = g.t; if (h.prize === 'mouse') g.sfx('boing'); }
    }
  },
  up(g) { g.s.brush = null; },
  update(g, dt) { const s = g.s; for (const p of s.puffs) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; } s.puffs = s.puffs.filter(p => g.t - p.t < 0.8); },
  auto(g, dt, synth) { // a good sweeper heads for the glint and scrubs back and forth
    const s = g.s, h = s.heaps[s.coin]; if (g.t < 0.35 || s.foundT >= 0 || g.t - (s.botT || 0) < 0.11) return; s.botT = g.t;
    if (!s.brush) { synth('down', h.x - 26, h.y); s.bk = 0; return; }
    s.bk = (s.bk || 0) + 1; synth('move', h.x + (s.bk % 2 ? 26 : -26), h.y + (s.bk % 3) * 3);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', ft = s.foundT >= 0 ? t - s.foundT : -1;
    c.drawImage(g.bake('parables_coin_bg', paintRoom), 0, 0, W, H);
    // nine coins on the cloth, and an empty, glowing place for the tenth
    for (let i = 0; i < 10; i++) { const cx = CLOTH_X - 38 + (i % 5) * 19, cy = CLOTH_Y - 2 + Math.floor(i / 5) * 9;
      if (i === 9) { if (ft < 0.5) { const p = 0.5 + 0.5 * Math.sin(t * 5); c.strokeStyle = `rgba(255,236,160,${0.4 + 0.4 * p})`; c.setLineDash([2, 2]); c.lineWidth = 1.4; c.beginPath(); c.ellipse(cx, cy, 6.5, 4.5, 0, 0, 7); c.stroke(); c.setLineDash([]); } continue; }
      coin(c, cx, cy, 6, 1.1, t); }
    // the woman with her lamp; its glow lights up the room
    const lampX = WX + 24, lampY = WY - 70;
    const lg = c.createRadialGradient(lampX, lampY, 10, lampX, lampY, 320); lg.addColorStop(0, 'rgba(255,214,140,0.32)'); lg.addColorStop(0.5, 'rgba(255,190,120,0.1)'); lg.addColorStop(1, 'rgba(255,190,120,0)'); c.fillStyle = lg; c.fillRect(0, 0, W, H);
    // heaps of dust and what was under them
    for (const h of s.heaps) {
      const st = h.sweptT >= 0 ? t - h.sweptT : -1;
      if (h.prize === 'button' && h.a < 0.5) { c.fillStyle = '#4f7ab8'; c.beginPath(); c.arc(h.x + 6, h.y - 2, 4, 0, 7); c.fill(); c.fillStyle = '#e8eef8'; c.fillRect(h.x + 4.5, h.y - 3.5, 1.4, 1.4); c.fillRect(h.x + 6.5, h.y - 1.5, 1.4, 1.4); }
      if (h.prize === 'mouse' && h.a < 0.5) { const run = st >= 0 ? st : 0; mouse(c, h.x + run * 340, h.y - (run > 0 ? Math.abs(Math.sin(run * 30)) * 3 : 0), 1, t, 1); }
      if (h.prize === 'coin') {
        if (ft < 0) { const per = s.glint, q = ((t + 0.3) % per) / per; if (q < 0.18) { const k = Math.sin(q / 0.18 * Math.PI); c.save(); c.globalAlpha = k; c.fillStyle = '#ffffff'; drawStar(c, h.x + 6, h.y - 14 * h.a, 6 + k * 8, t * 2); c.fillStyle = '#fff6c0'; c.beginPath(); c.arc(h.x + 6, h.y - 14 * h.a, 3, 0, 7); c.fill(); c.restore(); } }
        else { const q = Math.min(1, ft / 0.5), y = h.y - 8 - Math.sin(q * Math.PI) * 70 - q * 20; const gl = c.createRadialGradient(h.x, y, 2, h.x, y, 50); gl.addColorStop(0, 'rgba(255,250,220,0.8)'); gl.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = gl; c.fillRect(h.x - 50, y - 50, 100, 100); coin(c, h.x, y, 13, t * 9, t); }
      }
      heap(c, h.x, h.y, h.a, h.seed, t);
    }
    // neighbours dancing in through the open door
    if (ft >= 0) {
      c.fillStyle = '#ffd88a'; c.fillRect(304, 254, 56 * Math.min(1, ft * 4), 106);
      NEIGHBOURS.forEach((n, i) => { const q = Math.min(1, Math.max(0, ft * 2.2 - i * 0.25)); if (q <= 0) return; const x = 340 - q * (70 + i * 46), y = 372 + i * 24; P.person(c, x, y, 1.0, { ...n, t, phase: i * 2, bounce: 4, expr: 'laugh', arms: i % 2 ? 'cheer' : 'up', facing: -1 }); });
    }
    P.person(c, WX, WY, WS, { ...WOMAN, t, phase: 1, bounce: won ? 4 : 0.6, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'hold', hold: won ? null : (cc, hx, hy) => oilLamp(cc, hx + 8, hy - 2, 1, t) });
    if (won) oilLamp(c, WX - 26, WY - 82, 1, t);
    for (const p of s.puffs) { const q = (t - p.t) / 0.8; c.fillStyle = `rgba(216,196,164,${0.55 * (1 - q)})`; c.beginPath(); c.arc(p.x, p.y, p.r * (1 + q), 0, 7); c.fill(); }
    if (s.brush && !g.done) broom(c, s.brush.x, s.brush.y + 8, s.rot);
    if (won) for (let i = 0; i < 12; i++) { const tw = Math.max(0, Math.sin(t * 7 + i * 1.9)); c.save(); c.globalAlpha = tw; c.fillStyle = ['#ffd45a', '#ff9ac0', '#9fe0ff', '#ffffff'][i % 4]; drawStar(c, 30 + i * 28, 300 + Math.sin(i * 2.3) * 60, 3 + tw * 4, t); c.restore(); }
    P.vignette(c, W, H, 0.42, '#1a0c14'); P.grain(c, W, H, 0.06);
  },
});
