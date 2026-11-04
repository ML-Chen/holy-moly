// FILL! — 1 Kings 17:8–16. In a drought, the widow of Zarephath shares her last flour and oil with Elijah,
// and her jar of flour and jug of oil never run out. Hungry visitors come one by one with empty bowls:
// hold (or tap) the jar to pour a loaf's worth into each bowl. After every pour the jar fills up again with a sparkle.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JAR = { x: 166, y: 556 };                     // base centre of the big flour jar
const SPOT = { x: 282, y: 590 };                    // where the visitor with the bowl stands
const WIDOW = { skin: SK[2], robe: CL.plum, stripe: CL.sand, hairStyle: 'long', hair: HR[1] };
const VISITORS = [
  { skin: SK[3], robe: CL.brown, stripe: CL.sand, beard: true, hair: HR[0], hairStyle: 'long' },        // Elijah, dusty from the road
  { skin: SK[2], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[1], child: true },     // the widow's son
  { skin: SK[1], robe: CL.rose, stripe: CL.white, hair: HR[5], head: 'scarf', headCol: CL.cream },      // an old neighbour
  { skin: SK[3], robe: CL.teal, stripe: CL.cream, hair: HR[3], head: 'wrap', headCol: CL.sand, beard: true },
  { skin: SK[0], robe: CL.sky, stripe: CL.white, hairStyle: 'bun', hair: HR[2], child: true },
];
const SEATS = [[26, 476, 0.72], [70, 470, 0.7], [112, 466, 0.68], [236, 458, 0.66], [262, 462, 0.66]];
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);

function bowl(c, x, y, s, fill, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (fill > 0.02) { // the loaf rising in the bowl
    const k = Math.min(1, fill); c.save(); c.translate(0, -3 - k * 5); c.scale(0.45 + k * 0.6, 0.45 + k * 0.6); P.loaf(c, 0, 0, 1); c.restore();
    if (k < 1) { c.fillStyle = 'rgba(255,252,240,0.9)'; c.beginPath(); c.ellipse(0, -2 - k * 3, 9 + k * 4, 2.6, 0, 0, 7); c.fill(); }
  }
  const g = c.createLinearGradient(0, -4, 0, 9); g.addColorStop(0, '#d48a52'); g.addColorStop(1, '#8a4a26'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-15, -3); c.quadraticCurveTo(-13, 10, 0, 10); c.quadraticCurveTo(13, 10, 15, -3); c.closePath(); c.fill();
  c.strokeStyle = '#5a2e16'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#e8a46a'; c.beginPath(); c.ellipse(0, -3, 15, 3, 0, 0, 7); c.fill(); c.strokeStyle = '#7a3e1e'; c.stroke();
  if (fill <= 0.02) { c.fillStyle = '#6a3418'; c.beginPath(); c.ellipse(0, -2.6, 12, 2, 0, 0, 7); c.fill(); }
  c.restore();
}
// the big clay storage jar; level is how full the flour looks at its mouth (it never goes empty)
function jar(c, x, y, s, tilt, level, glow, t) {
  c.save(); c.translate(x + 30 * s, y); c.rotate(tilt); c.translate(-30 * s, 0); c.scale(s, s);
  c.fillStyle = 'rgba(50,30,20,0.25)'; c.beginPath(); c.ellipse(0, 0, 30, 6, 0, 0, 7); c.fill();
  const body = () => { c.beginPath(); c.moveTo(-14, -2); c.bezierCurveTo(-46, -20, -44, -72, -18, -84); c.lineTo(-17, -94); c.lineTo(17, -94); c.lineTo(18, -84); c.bezierCurveTo(44, -72, 46, -20, 14, -2); c.closePath(); };
  const g = c.createRadialGradient(-12, -58, 4, 0, -46, 52); g.addColorStop(0, '#f2b47a'); g.addColorStop(0.55, '#c8703e'); g.addColorStop(1, '#7a3a1e');
  body(); c.fillStyle = g; c.fill(); c.strokeStyle = '#5a2a14'; c.lineWidth = 2; c.stroke();
  c.save(); body(); c.clip();
  c.strokeStyle = 'rgba(255,230,190,0.45)'; c.lineWidth = 2.2; for (const yy of [-66, -30]) { c.beginPath(); c.moveTo(-44, yy); c.quadraticCurveTo(0, yy + 6, 44, yy); c.stroke(); }
  c.strokeStyle = 'rgba(90,40,20,0.5)'; c.lineWidth = 1.5; c.beginPath(); for (let i = -3; i <= 3; i++) { const xx = i * 9; c.moveTo(xx - 3, -58); c.lineTo(xx + 3, -52); c.lineTo(xx - 3, -46); } c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.28)'; c.beginPath(); c.ellipse(-20, -58, 6, 16, 0.3, 0, 7); c.fill();
  c.restore();
  // the rim and the flour inside, heaped up and glowing
  c.fillStyle = '#b8643a'; c.beginPath(); c.ellipse(0, -94, 19, 5.5, 0, 0, 7); c.fill(); c.strokeStyle = '#5a2a14'; c.lineWidth = 1.6; c.stroke();
  const h = 2 + level * 9;
  if (glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(0, -98, 2, 0, -98, 40); lg.addColorStop(0, `rgba(255,246,200,${0.6 * glow})`); lg.addColorStop(1, 'rgba(255,246,200,0)'); c.fillStyle = lg; c.beginPath(); c.arc(0, -98, 40, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = '#fffaf0'; c.beginPath(); c.moveTo(-16, -94); c.quadraticCurveTo(-8, -94 - h, 0, -94 - h * 1.05); c.quadraticCurveTo(8, -94 - h, 16, -94); c.ellipse(0, -94, 16, 4, 0, 0, Math.PI); c.fill();
  c.fillStyle = 'rgba(220,210,190,0.7)'; c.beginPath(); c.ellipse(6, -94 - h * 0.4, 7, 2, 0.3, 0, 7); c.fill();
  c.restore();
}
// the little jug of olive oil beside it
function jug(c, x, y, s, tilt) {
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  c.fillStyle = 'rgba(50,30,20,0.25)'; c.beginPath(); c.ellipse(0, 0, 14, 3.5, 0, 0, 7); c.fill();
  const g = c.createRadialGradient(-5, -16, 2, 0, -14, 18); g.addColorStop(0, '#f0d8a8'); g.addColorStop(1, '#a8805a'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-6, -1); c.bezierCurveTo(-18, -8, -16, -26, -5, -30); c.lineTo(-4, -38); c.lineTo(6, -40); c.lineTo(5, -30); c.bezierCurveTo(16, -26, 18, -8, 6, -1); c.closePath(); c.fill(); c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.4; c.stroke();
  c.beginPath(); c.moveTo(6, -34); c.quadraticCurveTo(16, -32, 11, -20); c.stroke();
  c.fillStyle = '#e8b830'; c.beginPath(); c.ellipse(1, -39, 4.5, 1.6, -0.2, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-8, -18, 2.5, 6, 0.3, 0, 7); c.fill();
  c.restore();
}
function mat(o, x, y, s2, col) { o.fillStyle = 'rgba(60,40,20,0.18)'; o.beginPath(); o.ellipse(x + 2, y + 2, 30 * s2, 7.5 * s2, 0, 0, 7); o.fill(); o.fillStyle = col; o.beginPath(); o.ellipse(x, y, 28 * s2, 7 * s2, 0, 0, 7); o.fill(); o.save(); o.clip(); o.fillStyle = 'rgba(255,240,200,0.4)'; for (let k = -3; k <= 3; k++) o.fillRect(x + k * 7 * s2, y - 8, 2.4, 16); o.restore(); }
const MATS = ['#cf6f4a', '#6aa9d8', '#e8a33a', '#8a4d7a', '#4f9a5a'];
function seated(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 126 * s); c.clip(); P.person(c, x, y + 12 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 12 * s, x, y + 4 * s); g.addColorStop(0, P.shade(robe, 0.12)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 4 * s, 19 * s, 7.5 * s, 0, 0, 7); c.fill(); c.stroke();
}
function paintBg(o) {
  // a hot, dry evening on the coast at Zarephath, between Tyre and Sidon
  P.sky(o, W, H, ['#4a78c0', '#8ab8d8', '#f2d6a8', '#f4a874'], { x: 300, y: 230, r: 22, color: '#ffe0a0', glow: 230 });
  P.water(o, W, 262, 300, '#3a7aa0', '#8ac8d0', 0, { waves: 3 });
  P.hills(o, W, 300, 16, '#d8b080', '#c09868', { seed: 3, freq: 0.012, dabs: 20, bottom: 360 });
  // the town on the shore
  const r = P.rng(4); for (let i = 0; i < 8; i++) P.house(o, -6 + i * 48 + r() * 10, 306 + r() * 6, 30 + r() * 12, 18 + r() * 10, ['#ead2a8', '#e2c49a', '#f0dcb8'][i % 3], { window: r() < 0.5 });
  // the courtyard wall, the widow's house and her clay oven
  const wg = o.createLinearGradient(0, 330, 0, 440); wg.addColorStop(0, '#e8c898'); wg.addColorStop(1, '#c49a6a'); o.fillStyle = wg; o.fillRect(0, 352, W, 90);
  o.fillStyle = '#f4dcb0'; o.fillRect(0, 348, W, 6); o.fillStyle = 'rgba(120,80,50,0.25)'; o.fillRect(0, 354, W, 4);
  const br = P.rng(9); for (let row = 0; row < 4; row++) for (let x = -(row % 2) * 20; x < W; x += 40) { o.strokeStyle = 'rgba(140,96,60,0.25)'; o.lineWidth = 1; o.strokeRect(x + 1, 360 + row * 20, 38, 19); o.fillStyle = P.rgba(br() < 0.5 ? '#fff0d0' : '#a87a4a', 0.12); o.fillRect(x + 3, 362 + row * 20, 34, 15); }
  P.house(o, -10, 440, 120, 130, '#e2c294', { door: '#6a3e22', awning: '#cf6f4a' });
  // a dry, leafless fig tree, waiting for rain
  o.strokeStyle = '#7a5434'; o.lineCap = 'round'; o.lineWidth = 7; o.beginPath(); o.moveTo(150, 440); o.quadraticCurveTo(146, 400, 160, 372); o.stroke();
  o.lineWidth = 3; o.beginPath(); o.moveTo(156, 384); o.quadraticCurveTo(136, 364, 124, 360); o.moveTo(160, 374); o.quadraticCurveTo(178, 350, 196, 348); o.moveTo(158, 372); o.lineTo(160, 344); o.stroke();
  o.fillStyle = '#9aa060'; for (const [lx, ly] of [[124, 358], [196, 346], [160, 342], [178, 352]]) { o.beginPath(); o.ellipse(lx, ly, 4, 2.4, 0.4, 0, 7); o.fill(); }
  // the oven (tannur), a beehive of clay
  o.fillStyle = 'rgba(60,30,20,0.25)'; o.beginPath(); o.ellipse(344, 444, 26, 5, 0, 0, 7); o.fill();
  const og = o.createRadialGradient(334, 410, 3, 342, 424, 30); og.addColorStop(0, '#e8a874'); og.addColorStop(1, '#8a4a2a'); o.fillStyle = og; o.beginPath(); o.moveTo(318, 442); o.quadraticCurveTo(318, 404, 342, 402); o.quadraticCurveTo(366, 404, 366, 442); o.closePath(); o.fill();
  o.fillStyle = '#3a1a10'; o.beginPath(); o.ellipse(342, 404, 9, 3, 0, 0, 7); o.fill();
  // the packed-earth floor
  const fg = o.createLinearGradient(0, 440, 0, H); fg.addColorStop(0, '#d8b888'); fg.addColorStop(1, '#b08a5c'); o.fillStyle = fg; o.fillRect(0, 440, W, H - 440);
  const fr = P.rng(21); for (let i = 0; i < 90; i++) { o.fillStyle = P.rgba(fr() < 0.5 ? '#f0d8b0' : '#8a6a44', 0.18); o.beginPath(); o.ellipse(fr() * W, 444 + fr() * 196, 6 + fr() * 14, 1.5 + fr() * 2, 0, 0, 7); o.fill(); }
  o.fillStyle = 'rgba(120,80,50,0.3)'; o.fillRect(0, 440, W, 3);
  P.grassTufts(o, W, 600, 640, 10, '#a8a058', 3);
}

MG.add({
  id: 'jar', stage: 'brave', cmd: 'FILL!', hint: 'hold', time: 6, mood: 'desert', winText: 'Plenty!',
  card: {
    title: 'The jar that never ran out', ref: '1 Kings 17:8–16', kind: 'Story',
    text: 'The first book of Kings tells how no rain fell for a long time, and food ran short. A poor widow in the town of Zarephath had only a handful of flour and a little oil left, but she made bread for the prophet Elijah. After that her jar of flour and her jug of oil never ran out, and her family had food for many days.',
    note: 'Some Christians believe this miracle happened just as told. Others read it as a story showing that God cares for poor people and outsiders, like this widow from outside Israel.',
    ask: 'The widow shared even though she had very little. What could you share, even if you only have a little?',
  },
  init(g) {
    const s = g.s, n = [2, 3, 4][g.level], sp = Math.sqrt(g.speed);
    s.n = n; s.rate = [2.0, 1.9, 2.1][g.level] * sp; s.walk = 0.42 / sp;
    s.vis = VISITORS.slice(0, n).map((o, i) => ({ o, i, st: i === 0 ? 'come' : 'queue', t0: 0, fill: 0, fedT: -1 }));
    s.cur = 0; s.pour = false; s.tilt = 0; s.level = 1; s.refillT = -9; s.fed = 0; s.drops = []; s.winT = -1; s.puffs = [];
  },
  down(g, x, y) {
    const s = g.s; if (s.winT >= 0) return;
    if (Math.hypot(x - JAR.x, y - (JAR.y - 50)) < 72 || Math.hypot(x - 112, y - 540) < 30) { s.pour = true; s.tap = 0.16; g.sfx('swoosh'); }
    else { s.puffs.push({ x, y, t: g.t }); g.sfx('tap'); }
  },
  up(g) { g.s.pour = false; },
  update(g, dt) {
    const s = g.s, v = s.vis[s.cur], t = g.t;
    const pouring = (s.pour || s.tap > 0) && s.winT < 0;
    s.tap = Math.max(0, (s.tap || 0) - dt);
    s.tilt += ((pouring ? 0.55 : 0) - s.tilt) * Math.min(1, dt * 14);
    if (v && v.st === 'come' && t - v.t0 > s.walk) v.st = 'wait';
    if (pouring && v && v.st === 'wait' && s.tilt > 0.3) {
      v.fill = Math.min(1, v.fill + s.rate * dt); s.level = Math.max(0.35, 1 - v.fill * 0.65);
      if (Math.random() < 0.5) s.drops.push({ x: JAR.x + 52 + Math.random() * 4, y: JAR.y - 96, vx: 150 + Math.random() * 40, vy: -40 - Math.random() * 30, t });
      if (v.fill >= 1) {
        v.st = 'fed'; v.fedT = t; s.fed++; s.refillT = t; s.level = 1;
        g.sfx('munch'); g.sfx('sparkle'); g.burst(SPOT.x, SPOT.y - 50, ['#ffd45a', '#fff6c0', '#ffffff', '#ffb36a'], 16, 170); g.burst(JAR.x, JAR.y - 100, ['#ffffff', '#fff6c0', '#ffe27a'], 12, 120);
        if (s.fed >= s.n) { s.winT = t; g.win(); g.sfx('cheer'); }
        else { s.cur++; const nv = s.vis[s.cur]; nv.st = 'come'; nv.t0 = t + 0.12; }
      }
    } else if (!pouring) s.level += (1 - s.level) * Math.min(1, dt * 3);
    if (pouring && Math.floor(t * 8) !== Math.floor((t - dt) * 8)) g.sfx('rustle');
    for (const d of s.drops) { d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    s.drops = s.drops.filter(d => d.y < SPOT.y - 20 && t - d.t < 0.8);
    s.puffs = s.puffs.filter(p => t - p.t < 0.4);
  },
  auto(g, dt, synth) { // press and keep holding the jar
    const s = g.s; if (g.t < 0.3 || s.botDown) return; s.botDown = 1; synth('down', JAR.x, JAR.y - 50);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = s.winT >= 0, pouring = s.tilt > 0.3;
    c.drawImage(g.bake('brave_jar_bg', paintBg), 0, 0, W, H);
    P.water(c, W, 262, 300, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', t, { waves: 2 });
    P.cloud(c, 90 + t * 3, 150, 0.6, '#fff8ee', '#e8c4b4', 0.9);
    // oven smoke curling up
    for (let i = 0; i < 4; i++) { const q = (t * 0.4 + i / 4) % 1; c.fillStyle = `rgba(240,236,230,${0.3 * (1 - q)})`; c.beginPath(); c.arc(342 + Math.sin(t * 1.5 + i * 2) * 6 + q * 10, 398 - q * 70, 4 + q * 9, 0, 7); c.fill(); }
    // fed visitors sitting on mats, munching
    s.vis.forEach((v, k) => { if (v.st !== 'fed') return; const [sx, sy, ss] = SEATS[k % SEATS.length], q = eo((t - v.fedT - 0.25) / 0.5);
      if (q <= 0) return; c.save(); c.globalAlpha = q; mat(c, sx, sy, ss, MATS[k % 5]); seated(c, sx, sy, ss, { ...v.o, t, phase: k, bounce: 1.4, expr: 'laugh', arms: won ? 'cheer' : 'hold', hold: won ? null : (cc, hx, hy) => P.loaf(cc, hx, hy - 3, 0.5) }); c.restore(); });
    // the widow, reaching for her jar
    P.person(c, 64, 600, 1.32, { ...WIDOW, t, phase: 2, bounce: 0.8, expr: won ? 'laugh' : pouring ? 'wow' : 'happy', arms: won ? 'cheer' : 'reach' });
    // the jar and jug, glowing to say "touch me"
    const ready = !won && s.vis[s.cur] && s.vis[s.cur].st === 'wait';
    if (ready && !pouring) { const p = 0.5 + 0.5 * Math.sin(t * 6); const gl = c.createRadialGradient(JAR.x, JAR.y - 50, 10, JAR.x, JAR.y - 50, 86); gl.addColorStop(0, `rgba(255,240,170,${0.45 + 0.3 * p})`); gl.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gl; c.beginPath(); c.arc(JAR.x, JAR.y - 50, 86, 0, 7); c.fill(); }
    const rf = Math.max(0, 1 - (t - s.refillT) / 0.7);
    jug(c, 112, 566, 1.05, s.tilt * 0.4);
    jar(c, JAR.x, JAR.y, 1.05, s.tilt, s.level, 0.4 + 0.6 * rf + (ready ? 0.3 : 0), t);
    // refill sparkles twinkling around the mouth of the jar and the jug
    for (let i = 0; i < 6; i++) { const a = t * 2 + i * 1.05, tw = Math.max(0, Math.sin(t * 5 + i * 2)) * (0.35 + rf); if (tw < 0.15) continue; c.save(); c.globalAlpha = Math.min(1, tw); c.fillStyle = i % 2 ? '#fffbe0' : '#ffe27a'; drawStar(c, JAR.x + Math.cos(a) * (30 + rf * 20), JAR.y - 104 + Math.sin(a) * 12 - rf * 10, 3 + tw * 3, t); c.restore(); }
    // the flour stream
    if (pouring && !won) {
      const mx = JAR.x + 54, my = JAR.y - 92, bx = SPOT.x - 4, by = SPOT.y - 40;
      c.save(); c.strokeStyle = 'rgba(255,252,240,0.9)'; c.lineWidth = 6 + Math.sin(t * 30) * 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(mx, my); c.quadraticCurveTo(mx + 60, my - 18, bx, by); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2; c.stroke(); c.restore();
      c.fillStyle = 'rgba(255,250,236,0.85)'; for (const d of s.drops) { c.beginPath(); c.arc(d.x, d.y, 2, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,252,240,0.5)'; for (let i = 0; i < 5; i++) { const q = (t * 3 + i / 5) % 1; c.beginPath(); c.arc(bx + Math.sin(i * 3 + t * 5) * 10 * q, by - q * 14, 2 + q * 4, 0, 7); c.fill(); }
    }
    // the visitors: the one being served stands in the light; the rest wait in a line off to the right
    s.vis.map((v, k) => [v, k]).reverse().forEach(([v, k]) => {
      if (v.st === 'fed') { const q = (t - v.fedT); if (q > 0.35) return; // a quick cheer, then off to sit down
        P.person(c, SPOT.x, SPOT.y - Math.sin(q / 0.35 * Math.PI) * 14, 1.3, { ...v.o, facing: -1, t, phase: k, bounce: 2, expr: 'laugh', arms: 'cheer' }); P.loaf(c, SPOT.x, SPOT.y - 112 - q * 40, 0.9); return; }
      let x, y = SPOT.y, sc = 1.3, walking = false;
      if (v.st === 'queue') { const ahead = k - s.cur - 1; x = 318 - ahead * 30; y = 508 - ahead * 10; sc = 0.95 - ahead * 0.06; }
      else if (v.st === 'come') { const q = eo((t - v.t0) / s.walk); x = SPOT.x + 36 * (1 - q); y = SPOT.y - 82 * (1 - q); sc = 1.3 - 0.35 * (1 - q); walking = q < 1; }
      else x = SPOT.x;
      const hop = walking ? Math.abs(Math.sin(t * 14)) * 4 : 0;
      P.person(c, x, y - hop, sc, { ...v.o, facing: -1, t, phase: k * 1.3, bounce: v.st === 'wait' ? 1.4 : 0.6, expr: v.st === 'wait' ? (v.fill > 0.1 ? 'wow' : 'sad') : 'sad', arms: v.st === 'queue' ? 'down' : 'hold', hold: v.st === 'queue' ? null : (cc, hx, hy) => bowl(cc, hx, hy + 2, 1, v.fill, t) });
      if (v.st === 'wait' && v.fill < 0.05) { // a tummy rumble
        c.save(); c.strokeStyle = 'rgba(120,70,50,0.55)'; c.lineWidth = 1.6; c.lineCap = 'round'; const w = Math.sin(t * 12) * 2;
        for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x + sd * 22, SPOT.y - 40 + w); c.lineTo(x + sd * 28, SPOT.y - 44 - w); c.moveTo(x + sd * 22, SPOT.y - 32 - w); c.lineTo(x + sd * 29, SPOT.y - 32 + w); c.stroke(); } c.restore(); }
    });
    for (const p of s.puffs) { const q = (t - p.t) / 0.4; c.strokeStyle = `rgba(255,250,230,${0.6 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 6 + q * 16, 0, 7); c.stroke(); }
    if (won) { c.save(); c.globalCompositeOperation = 'lighter'; const q = Math.min(1, (t - s.winT) * 2); P.rays(c, JAR.x, JAR.y - 100, W, H, '#fff2c4', 0.22 * q, 11, t); c.restore(); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
