// FEAST! — Isaiah 25:6–8 and Luke 14:15–24. A feast for all peoples: drag every guest to an empty seat at the long table before time runs out.
// From level 1, more guests keep arriving while you work. Every seat gets filled and nobody is left standing.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const TOP = 404;                                   // the table's top edge
const SEATS = { 3: [84, 180, 276], 4: [62, 140, 220, 298], 5: [48, 114, 180, 246, 312] };
const STAND = [[70, 572], [290, 572], [180, 598], [118, 506], [246, 506]];
const GUESTS = [
  { skin: SK[5], robe: '#f2c23a', pants: '#3a5a8a', outfit: 'modern', hoodie: true, hairStyle: 'curly', hair: HR[3], child: true },
  { skin: SK[1], robe: CL.teal, stripe: CL.cream, hairStyle: 'long', hair: HR[2] },
  { skin: SK[3], robe: '#e8e0d0', pants: '#6a4a3a', outfit: 'modern', cardigan: '#c96a7a', skirt: true, hairStyle: 'bun', hair: HR[5], glasses: true }, // a grandma
  { skin: SK[4], robe: CL.terracotta, stripe: CL.sand, beard: true, hair: HR[0], head: 'wrap', headCol: CL.white },
  { skin: SK[0], robe: '#5a8ad0', pants: '#3a3a4a', outfit: 'modern', hairStyle: 'short', hair: HR[4] },
  { skin: SK[2], robe: CL.plum, stripe: CL.gold, hairStyle: 'curly', hair: HR[1], child: true },
  { skin: SK[5], robe: CL.saffron, stripe: CL.rust, hair: HR[5], beard: '#e8e2da', hairStyle: 'bald' }, // a grandpa
  { skin: SK[2], robe: '#3f8f8a', pants: '#2a2a32', outfit: 'modern', skirt: true, collar: 'clergy', stole: '#c84a6a', hairStyle: 'long', hair: HR[0] }, // a pastor
];
const DISHES = ['bread', 'grapes', 'fish', 'fruit', 'cake'];

MG.add({
  id: 'feast', stage: 'new', cmd: 'FEAST!', hint: 'drag', time: 6, mood: 'party', winText: 'Dig in!',
  card: {
    title: 'A feast for everyone', ref: 'Isaiah 25 and Luke 14', kind: 'Poem and Parable',
    text: 'The book of Isaiah has a poem about a feast God will make on a mountain for all the peoples of the world. In the Gospel of Luke, Jesus tells a story about a dinner where the host invites people who are poor, sick or left out, until every seat is full.',
    note: 'Isaiah wrote a poem of hope, and Jesus told a parable: a made-up story that teaches something true.',
    ask: 'If you could set a big table for a party, who would you make sure to invite?',
  },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level], k = 1 / (1 + (g.speed - 1) * 0.55);
    const looks = GUESTS.slice().sort(() => Math.random() - 0.5), dishes = DISHES.slice().sort(() => Math.random() - 0.5);
    s.seats = SEATS[n].map((x, i) => ({ x, who: null, t: 0, dish: dishes[i % dishes.length] }));
    // who is waiting at the start, and when the others arrive (from the sides)
    const start = [3, 2, 2][g.level], arrive = [[], [1.2, 2.2], [0.9, 1.7, 2.5]][g.level];
    const spots = STAND.slice(0, n).sort(() => Math.random() - 0.5);
    s.guests = Array.from({ length: n }, (_, i) => {
      const [hx, hy] = spots[i], at = i < start ? 0 : arrive[i - start] * k, from = hx < 180 ? -40 : 400;
      return { look: looks[i], hx, hy, x: i < start ? hx : from, y: hy, from, at, seat: null, phase: Math.random() * 6, back: null };
    });
    s.drag = null; s.wander = [0, 10, 18][g.level];
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = 56;
    for (const q of s.guests) { if (q.seat || g.t < q.at) continue; const d = Math.hypot(q.x - x, q.y - 40 - y); if (d < bd) { bd = d; best = q; } }
    if (best) { s.drag = best; best.ox = best.x - x; best.oy = best.y - y; best.back = null; g.sfx('pop'); }
  },
  move(g, x, y) { const q = g.s.drag; if (q) { q.x = x + q.ox; q.y = y + q.oy; } },
  up(g, x, y) {
    const s = g.s, q = s.drag; s.drag = null; if (!q) return;
    let best = null, bd = 9e9; for (const st of s.seats) { if (st.who) continue; const d = Math.abs(st.x - q.x); if (d < bd) { bd = d; best = st; } }
    if (best && q.y < 530 && bd < 62) {
      best.who = q; best.t = g.t; q.seat = best; g.sfx('ding'); g.sfx('munch');
      g.burst(best.x, TOP - 30, ['#ffd45a', '#ffffff', '#ff9ac0', '#9fe0ff', '#b8f0a0'], 18, 190);
      if (s.seats.every(st => st.who)) { g.win(); g.sfx('cheer'); g.sfx('tambourine'); }
    } else { q.back = { x: q.x, y: q.y, t: g.t }; g.sfx('boing'); }
  },
  update(g, dt) {
    const s = g.s;
    for (const q of s.guests) {
      if (q.seat || q === s.drag) continue;
      if (q.back) { const k = Math.min(1, (g.t - q.back.t) / 0.25); q.x = q.back.x + (q.hx - q.back.x) * k; q.y = q.back.y + (q.hy - q.back.y) * k; if (k >= 1) q.back = null; continue; }
      if (g.t >= q.at) { const k = Math.min(1, (g.t - q.at) / 0.5); q.x = q.from + (q.hx - q.from) * (1 - (1 - k) * (1 - k)) + (k >= 1 ? Math.sin((g.t - q.at) * 1.6 + q.phase) * s.wander : 0); if (k < 1 && !q.arrived) { q.arrived = 1; g.sfx('bell'); } }
    }
  },
  auto(g, dt, synth) { // drag each waiting guest to the first empty seat, one step every 0.16 s
    const s = g.s; if (g.t < 0.3) return; const k = Math.floor((g.t - 0.3) / 0.16); if (k === s.botK) return; s.botK = k;
    if (s.drag) { const st = s.seats.find(v => !v.who); if (st) synth('up', st.x, TOP - 40); return; }
    const q = s.guests.find(v => !v.seat && g.t >= v.at + 0.4); const st = s.seats.find(v => !v.who);
    if (q && st) { synth('down', q.x, q.y - 40); synth('move', st.x, TOP - 40); }
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win';
    c.drawImage(g.bake('new_feast_bg', paintBg), 0, 0, W, H);
    lanterns(c, t, won);
    // chairs, and the guests sitting in them
    for (const st of s.seats) {
      const empty = !st.who;
      if (empty && !won) { const pu = 0.5 + 0.5 * Math.sin(t * 5 + st.x); const gl = c.createRadialGradient(st.x, TOP - 50, 4, st.x, TOP - 50, 52); gl.addColorStop(0, `rgba(255,236,150,${0.45 + 0.35 * pu})`); gl.addColorStop(1, 'rgba(255,236,150,0)'); c.fillStyle = gl; c.beginPath(); c.arc(st.x, TOP - 50, 52, 0, 7); c.fill(); }
      chair(c, st.x, TOP, empty, t);
      if (st.who) { const q = st.who, ft = t - st.t, pop = ft < 0.25 ? 1 - ft / 0.25 : 0, hop = won ? Math.abs(Math.sin(t * 9 + q.phase)) * 5 : pop * 10;
        c.save(); c.beginPath(); c.rect(st.x - 50, 0, 100, TOP - 8); c.clip();
        P.person(c, st.x, TOP + 26 - hop, 1.35, { ...q.look, t, phase: q.phase, bounce: 1.2, expr: won || ft < 0.8 ? 'laugh' : 'happy', arms: won || ft < 0.6 ? 'cheer' : 'hold' }); c.restore(); }
    }
    c.drawImage(g.bake('new_feast_table', paintTable), 0, 0, W, H);
    centerpieces(c, s.seats, t);
    // plates in front of each seat: empty and sparkling until a guest sits, then piled with food
    for (const st of s.seats) { plate(c, st.x, TOP - 4); if (st.who) { const k = Math.min(1, (t - st.t) / 0.2); c.save(); c.translate(st.x, TOP - 6); c.scale(k, k); dish(c, st.dish, t); c.restore(); }
      else if (!won) { const tw = Math.max(0, Math.sin(t * 5 + st.x)); c.save(); c.globalAlpha = tw; c.fillStyle = '#fffbe0'; drawStar(c, st.x + 14, TOP - 8, 3 + tw * 2, t); c.restore(); } }
    // guests waiting to be seated (and the one being dragged, on top)
    const list = s.guests.filter(q => !q.seat && q !== s.drag && g.t >= q.at).sort((a, b) => a.y - b.y);
    for (const q of list) {
      const walking = g.t - q.at < 0.5, pu = 0.5 + 0.5 * Math.sin(t * 5 + q.phase);
      const gl = c.createRadialGradient(q.x, q.y - 2, 4, q.x, q.y - 2, 36); gl.addColorStop(0, `rgba(255,236,150,${0.3 + 0.3 * pu})`); gl.addColorStop(1, 'rgba(255,236,150,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(q.x, q.y - 2, 36, 12, 0, 0, 7); c.fill();
      P.person(c, q.x, q.y, 1.3, { ...q.look, t, phase: q.phase, bounce: walking ? 3 : 1, facing: q.x > 180 ? -1 : 1, expr: 'happy', arms: walking ? 'wave' : 'reach' });
    }
    if (s.drag) { const q = s.drag; c.fillStyle = 'rgba(40,20,40,0.2)'; c.beginPath(); c.ellipse(q.x, q.y + 18, 18, 5, 0, 0, 7); c.fill(); P.person(c, q.x, q.y - 6, 1.3, { ...q.look, t, phase: q.phase, bounce: 0, expr: 'wow', arms: 'up' }); }
    if (won) for (let i = 0; i < 18; i++) { const x = (i * 53 + t * 40) % W, y = ((t - g.doneAt) * 200 + i * 37) % 300 + 40; c.fillStyle = ['#ff7a9a', '#ffd45a', '#7ad0f0', '#b8f0a0', '#c8a0f0'][i % 5]; c.save(); c.translate(x, y); c.rotate(t * 4 + i); c.fillRect(-4, -2, 8, 4); c.restore(); }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});

function chair(c, x, top, empty, t) {
  c.save(); c.translate(x, top); c.scale(1.25, 1.25);
  const g = c.createLinearGradient(-20, -80, 20, 0); g.addColorStop(0, '#c8884a'); g.addColorStop(1, '#8a5428'); c.fillStyle = g; c.strokeStyle = '#5a3418'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(-21, 0); c.lineTo(-21, -58); c.quadraticCurveTo(-21, -80, 0, -82); c.quadraticCurveTo(21, -80, 21, -58); c.lineTo(21, 0); c.closePath(); c.fill(); c.stroke();
  // a cushion-coloured inset with a golden heart that glows while the seat is empty
  const ig = c.createLinearGradient(0, -74, 0, -10); ig.addColorStop(0, '#f2a0b8'); ig.addColorStop(1, '#c86a8a'); c.fillStyle = ig;
  c.beginPath(); c.moveTo(-14, -4); c.lineTo(-14, -56); c.quadraticCurveTo(-14, -72, 0, -73); c.quadraticCurveTo(14, -72, 14, -56); c.lineTo(14, -4); c.closePath(); c.fill();
  c.fillStyle = empty ? `rgba(255,236,150,${0.75 + 0.25 * Math.sin(t * 5 + x)})` : '#f6d36a'; heart(c, 0, -46, 7);
  c.restore();
}
function plate(c, x, y) {
  c.fillStyle = 'rgba(120,80,60,0.18)'; c.beginPath(); c.ellipse(x + 1, y + 3, 22, 6, 0, 0, 7); c.fill();
  const g = c.createRadialGradient(x - 6, y - 3, 1, x, y, 22); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e8e0f0'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 21, 5.5, 0, 0, 7); c.fill();
  c.strokeStyle = '#d8b04a'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y, 17, 4, 0, 0, 7); c.stroke();
}
function dish(c, kind, t) {
  if (kind === 'bread') { P.loaf(c, 0, -5, 0.9); }
  else if (kind === 'fish') { P.fishShape(c, 0, -4, 0.8, '#f0a050'); }
  else if (kind === 'grapes') { for (const [dx, dy] of [[-6, -6], [0, -6], [6, -6], [-3, -11], [3, -11], [0, -15], [-3, -2], [3, -2]]) { const g = c.createRadialGradient(dx - 1, dy - 1, 0.5, dx, dy, 3.6); g.addColorStop(0, '#d8a8f0'); g.addColorStop(1, '#6a3a9a'); c.fillStyle = g; c.beginPath(); c.arc(dx, dy, 3.4, 0, 7); c.fill(); } c.fillStyle = '#5a9a3a'; c.beginPath(); c.ellipse(3, -19, 4, 2, 0.4, 0, 7); c.fill(); }
  else if (kind === 'fruit') { for (const [dx, dy, col, r] of [[-8, -5, '#e84a5a', 5], [7, -5, '#f2a03a', 5.5], [0, -11, '#f6d23a', 5], [-1, -3, '#9ad04a', 4.5]]) { const g = c.createRadialGradient(dx - r * 0.4, dy - r * 0.4, 0.5, dx, dy, r); g.addColorStop(0, P.shade(col, 0.5)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(dx, dy, r, 0, 7); c.fill(); } }
  else { const g = c.createLinearGradient(0, -16, 0, 0); g.addColorStop(0, '#fff2f6'); g.addColorStop(1, '#f2b8c8'); c.fillStyle = g; c.beginPath(); c.moveTo(-11, -2); c.lineTo(-11, -12); c.quadraticCurveTo(0, -17, 11, -12); c.lineTo(11, -2); c.closePath(); c.fill(); c.fillStyle = '#e84a6a'; c.beginPath(); c.arc(0, -16, 3, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-11, -9); c.quadraticCurveTo(-5, -6, 0, -9); c.quadraticCurveTo(5, -6, 11, -9); c.stroke(); }
}
function centerpieces(c, seats, t) {
  // food and candles between the places: fruit bowls, bread, a jug and candles, set a little behind the plates
  const xs = seats.map(st => st.x), gaps = [[-30, xs[0]], ...xs.slice(1).map((x, i) => [xs[i], x]), [xs[xs.length - 1], 390]];
  gaps.forEach(([a, b], i) => { const x = (a + b) / 2, room = b - a; if (room < 50) return; const sc = Math.min(1, (room - 30) / 50), y = TOP - 12;
    c.save(); c.translate(x, y); c.scale(sc, sc);
    if (i % 3 === 0) { // a bowl of fruit
      for (const [dx, dy, col, r] of [[-7, -8, '#e84a5a', 6], [6, -8, '#f2a03a', 6], [0, -15, '#9a5ad0', 6], [-1, -6, '#9ad04a', 5]]) { const g = c.createRadialGradient(dx - 2, dy - 2, 0.5, dx, dy, r); g.addColorStop(0, P.shade(col, 0.5)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(dx, dy, r, 0, 7); c.fill(); }
      const bg = c.createLinearGradient(0, -6, 0, 6); bg.addColorStop(0, '#f6d36a'); bg.addColorStop(1, '#c8902e'); c.fillStyle = bg; c.beginPath(); c.moveTo(-15, -5); c.quadraticCurveTo(0, 12, 15, -5); c.closePath(); c.fill();
    } else if (i % 3 === 1) { // a jug and a candle
      const jg = c.createLinearGradient(-8, 0, 8, 0); jg.addColorStop(0, '#e8885a'); jg.addColorStop(1, '#a8502e'); c.fillStyle = jg; c.beginPath(); c.moveTo(-4, -22); c.lineTo(4, -22); c.quadraticCurveTo(12, -10, 7, 2); c.lineTo(-7, 2); c.quadraticCurveTo(-12, -10, -4, -22); c.fill(); c.strokeStyle = '#a8502e'; c.lineWidth = 2; c.beginPath(); c.arc(8, -12, 5, -1.2, 1.2); c.stroke();
      candle(c, -14, 0, t + i);
    } else { // a basket of bread
      P.basket(c, 0, -2, 0.62, 'bread');
    }
    c.restore(); });
}
function candle(c, x, y, t) {
  c.fillStyle = '#fff6e8'; c.fillRect(x - 2.5, y - 16, 5, 16); c.fillStyle = '#d8b04a'; c.fillRect(x - 4, y - 2, 8, 2.5);
  const f = 1 + Math.sin(t * 12) * 0.12; const gl = c.createRadialGradient(x, y - 21, 1, x, y - 21, 14); gl.addColorStop(0, 'rgba(255,230,150,0.8)'); gl.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y - 21, 14, 0, 7); c.fill();
  c.fillStyle = '#ffb83a'; c.beginPath(); c.ellipse(x, y - 20, 2.4, 4.4 * f, 0, 0, 7); c.fill(); c.fillStyle = '#fff6c0'; c.beginPath(); c.ellipse(x, y - 19, 1.2, 2.2 * f, 0, 0, 7); c.fill();
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
// a string of glowing lanterns and flowers swagged across the top of the scene
function lanterns(c, t, won) {
  const cols = ['#ff8a6a', '#ffd45a', '#ff9ac0', '#8fd8ff', '#b8f0a0', '#c8a0f0'];
  for (const [y0, sag, n, ph] of [[150, 46, 7, 0], [214, 30, 6, 1]]) {
    const pt = u => [-10 + u * 380, y0 + Math.sin(u * Math.PI) * sag];
    c.strokeStyle = 'rgba(90,60,40,0.7)'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i <= 20; i++) { const [x, y] = pt(i / 20); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    for (let i = 1; i < n; i++) { const [x, y] = pt(i / n), sw = Math.sin(t * 2 + i + ph) * 0.12, col = cols[(i + ph * 3) % 6], fl = 0.8 + 0.2 * Math.sin(t * 9 + i * 3) + (won ? 0.2 : 0);
      const gl = c.createRadialGradient(x, y + 14, 2, x, y + 14, 34); gl.addColorStop(0, P.rgba(col, 0.55 * fl)); gl.addColorStop(1, P.rgba(col, 0)); c.fillStyle = gl; c.beginPath(); c.arc(x, y + 14, 34, 0, 7); c.fill();
      c.save(); c.translate(x, y); c.rotate(sw); c.strokeStyle = '#6a4a2e'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 4); c.stroke();
      const lg = c.createRadialGradient(-3, 11, 1, 0, 14, 11); lg.addColorStop(0, '#fffbe8'); lg.addColorStop(0.5, P.shade(col, 0.3)); lg.addColorStop(1, col); c.fillStyle = lg; c.beginPath(); c.ellipse(0, 14, 8, 10, 0, 0, 7); c.fill();
      c.fillStyle = '#c8902e'; c.fillRect(-4, 3, 8, 2.5); c.fillRect(-3, 23.5, 6, 2); c.restore(); }
  }
}

// ---------- scenery ----------
function paintBg(o) {
  P.sky(o, W, H, ['#7a62c8', '#e890b8', '#ffc0a0', '#ffe8c0'], { x: 180, y: 300, r: 24, color: '#fff4d0', glow: 280 });
  P.stars(o, W, 120, 26, 31, 0);
  // the mountain of the feast, with the shining city on its shoulder
  o.save(); const mg = o.createLinearGradient(0, 150, 0, 340); mg.addColorStop(0, '#f2b8d0'); mg.addColorStop(1, '#c88ab0'); o.fillStyle = mg; o.beginPath(); o.moveTo(-20, 340); o.bezierCurveTo(60, 300, 150, 200, 240, 190); o.bezierCurveTo(300, 186, 340, 230, 380, 260); o.lineTo(380, 340); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,240,230,0.7)'; o.lineWidth = 3; o.beginPath(); o.moveTo(120, 262); o.bezierCurveTo(170, 214, 210, 194, 240, 190); o.bezierCurveTo(290, 187, 330, 222, 370, 252); o.stroke(); o.restore();
  P.hills(o, W, 318, 30, '#d89ab8', '#c08aa8', { seed: 71, freq: 0.01, dabs: 20, bottom: 360 });
  const cx = 244, cy = 192; o.fillStyle = 'rgba(255,240,220,0.95)'; o.fillRect(cx - 50, cy - 16, 100, 16);
  for (const [dx, h] of [[-44, 30], [-20, 42], [6, 52], [30, 38], [48, 28]]) { o.fillStyle = 'rgba(255,240,215,0.95)'; o.fillRect(cx + dx - 6, cy - h, 12, h); o.fillStyle = '#f2c14a'; o.beginPath(); o.arc(cx + dx, cy - h, 6, Math.PI, 0); o.fill(); }
  const gg = o.createRadialGradient(cx, cy - 10, 2, cx, cy - 10, 70); gg.addColorStop(0, 'rgba(255,250,220,0.8)'); gg.addColorStop(1, 'rgba(255,250,220,0)'); o.fillStyle = gg; o.fillRect(cx - 80, cy - 80, 160, 120);
  P.hills(o, W, 344, 18, '#a8d070', '#78a850', { seed: 72, freq: 0.014, dabs: 50, rim: '#e8ffb0', bottom: 420 });
  // two grape-vine arbour posts framing the table
  for (const x of [14, 346]) { const g = o.createLinearGradient(x - 8, 0, x + 8, 0); g.addColorStop(0, '#9a6a3a'); g.addColorStop(1, '#6a4224'); o.fillStyle = g; o.fillRect(x - 7, 120, 14, 300);
    const r = P.rng(x); for (let i = 0; i < 16; i++) { const yy = 130 + i * 18 + r() * 6; o.fillStyle = r() < 0.5 ? '#5fae4a' : '#4a9a40'; o.beginPath(); o.ellipse(x + (r() - 0.5) * 22, yy, 9, 5, r() * 3, 0, 7); o.fill(); }
    for (let i = 0; i < 3; i++) { const gx = x + (x < 180 ? 12 : -12), gy = 170 + i * 80; for (const [dx, dy] of [[-4, 0], [4, 0], [0, 6], [-4, 12], [4, 12], [0, 18]]) { o.fillStyle = '#7a4aa8'; o.beginPath(); o.arc(gx + dx * 0.9, gy + dy * 0.9, 3.4, 0, 7); o.fill(); } } }
  // garden floor: a soft lawn with a golden path and flowers
  P.hills(o, W, 420, 6, '#b8e080', '#80b458', { seed: 73, freq: 0.02, dabs: 120, rim: '#f4ffc8' });
  P.flowers(o, W, 440, H, 60, ['#f4d35e', '#ee6c8a', '#ffffff', '#b98ae0', '#7ad0f0'], 17);
  P.grassTufts(o, W, 430, H, 40, '#70a848', 19);
  // a woven welcome rug where arriving guests wait, with a tasselled border
  o.save(); o.translate(180, 560); const rw = 168, rh = 64;
  o.fillStyle = 'rgba(60,30,40,0.18)'; o.beginPath(); o.ellipse(4, 6, rw, rh, 0, 0, 7); o.fill();
  const rg = o.createRadialGradient(0, -10, 10, 0, 0, rw); rg.addColorStop(0, '#f6b0a0'); rg.addColorStop(1, '#d86a6a'); o.fillStyle = rg; o.beginPath(); o.ellipse(0, 0, rw, rh, 0, 0, 7); o.fill();
  for (const [k, col] of [[0.86, '#f6d36a'], [0.7, '#3f8f8a'], [0.55, '#fbeee0'], [0.3, '#f6d36a']]) { o.strokeStyle = col; o.lineWidth = 4; o.beginPath(); o.ellipse(0, 0, rw * k, rh * k, 0, 0, 7); o.stroke(); }
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; o.fillStyle = ['#3f8f8a', '#f6d36a', '#7a4aa8'][i % 3]; o.save(); o.translate(Math.cos(a) * rw * 0.78, Math.sin(a) * rh * 0.78); o.rotate(Math.PI / 4); o.fillRect(-3, -3, 6, 6); o.restore(); }
  o.strokeStyle = '#f6e0b0'; o.lineWidth = 1.4; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; o.beginPath(); o.moveTo(Math.cos(a) * rw, Math.sin(a) * rh); o.lineTo(Math.cos(a) * (rw + 6), Math.sin(a) * (rh + 4)); o.stroke(); }
  o.restore();
}
function paintTable(o) {
  // the long table, dressed in white linen with a golden runner and a scalloped hem
  const y = TOP;
  o.fillStyle = 'rgba(60,30,40,0.2)'; o.beginPath(); o.ellipse(180, y + 60, 186, 10, 0, 0, 7); o.fill();
  const cg = o.createLinearGradient(0, y, 0, y + 70); cg.addColorStop(0, '#fffaf2'); cg.addColorStop(1, '#ecdcd8'); o.fillStyle = cg;
  o.beginPath(); o.moveTo(-6, y - 4); o.lineTo(366, y - 4); o.lineTo(366, y + 44); for (let x = 366; x >= -6; x -= 20) o.quadraticCurveTo(x - 10, y + 58, x - 20, y + 44); o.closePath(); o.fill();
  o.strokeStyle = '#d8b04a'; o.lineWidth = 2; o.beginPath(); for (let x = 366; x >= -6; x -= 20) { o.moveTo(x, y + 40); o.quadraticCurveTo(x - 10, y + 53, x - 20, y + 40); } o.stroke();
  // a garland of flowers and leaves swagged along the front of the cloth
  for (let i = 0; i < 6; i++) { const x0 = -6 + i * 62; o.strokeStyle = '#5fae4a'; o.lineWidth = 3; o.beginPath(); o.moveTo(x0, y + 22); o.quadraticCurveTo(x0 + 31, y + 40, x0 + 62, y + 22); o.stroke(); for (let k = 1; k < 6; k++) { const u = k / 6, fx = x0 + u * 62, fy = y + 22 + Math.sin(u * Math.PI) * 9; o.fillStyle = ['#ff8aa8', '#ffd45a', '#ffffff', '#c8a0f0', '#ff9a6a'][(i + k) % 5]; for (let a = 0; a < 5; a++) { o.beginPath(); o.arc(fx + Math.cos(a * 1.26) * 2.6, fy + Math.sin(a * 1.26) * 2.6, 2.2, 0, 7); o.fill(); } o.fillStyle = '#f9b233'; o.beginPath(); o.arc(fx, fy, 1.6, 0, 7); o.fill(); } }
  // fold shadows
  o.strokeStyle = 'rgba(160,120,140,0.25)'; o.lineWidth = 2; for (let x = 10; x < W; x += 20) { o.beginPath(); o.moveTo(x, y + 14); o.lineTo(x, y + 46); o.stroke(); }
  // golden runner down the middle with jewels
  const rg = o.createLinearGradient(0, y - 4, 0, y + 30); rg.addColorStop(0, '#f6d36a'); rg.addColorStop(1, '#d8a040'); o.fillStyle = rg; o.fillRect(-6, y + 10, 372, 9);
  const J = ['#4a7fd8', '#3fae7a', '#d84a5a', '#9a5ad8', '#3fc0c0', '#e86aa8']; for (let i = 0; i < 18; i++) { o.fillStyle = J[i % 6]; o.beginPath(); o.arc(10 + i * 20, y + 14.5, 2.6, 0, 7); o.fill(); o.fillStyle = 'rgba(255,255,255,0.8)'; o.beginPath(); o.arc(9 + i * 20, y + 13.5, 0.9, 0, 7); o.fill(); }
  // the table top, seen a little from above
  const tg = o.createLinearGradient(0, y - 16, 0, y); tg.addColorStop(0, '#f4ebe6'); tg.addColorStop(1, '#fffdf8'); o.fillStyle = tg; o.fillRect(-6, y - 16, 372, 14); o.fillStyle = '#fffdf8'; o.fillRect(-6, y - 3, 372, 3); o.fillStyle = 'rgba(200,170,180,0.45)'; o.fillRect(-6, y, 372, 1.5);
}
