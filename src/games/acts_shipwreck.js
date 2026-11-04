// SWIM! — Acts 27:39–28:2. Paul's ship runs aground off Malta. Some swim and some float on planks, and everyone gets
// safely to land. Drag each swimmer through the waves onto the beach, where the islanders have a fire and warm blankets.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const SHORE = 478;                         // the waterline on the beach
const FIRE = { x: 180, y: 566 };
const SWIMMERS = [
  { skin: SK[2], robe: CL.indigo, stripe: CL.cream, beard: true, hair: HR[0], hairStyle: 'short', plank: true },   // Paul
  { skin: SK[4], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[3] },
  { skin: SK[1], robe: CL.teal, stripe: CL.white, beard: true, hair: HR[2], plank: true },
  { skin: SK[0], robe: CL.rose, stripe: CL.cream, hairStyle: 'long', hair: HR[4] },
  { skin: SK[3], robe: CL.olive, stripe: CL.sand, hair: HR[1], hairStyle: 'short', plank: true },
];
const START = [[70, 318], [290, 330], [180, 372], [100, 418], [276, 424]];
const SPOTS = [[128, 548], [236, 546], [96, 598], [266, 600], [180, 608]];
const BLANKETS = ['#c9443c', '#e8a33a', '#3f4f8f', '#2f8f8a', '#8a4d7a'];
const ISLANDERS = [
  { x: 40, y: 586, f: 1, o: { skin: SK[3], robe: CL.sand, stripe: CL.terracotta, hairStyle: 'curly', hair: HR[0] } },
  { x: 322, y: 584, f: -1, o: { skin: SK[4], robe: CL.green, stripe: CL.cream, beard: true, hair: HR[1] } },
  { x: 348, y: 614, f: -1, o: { skin: SK[2], robe: CL.saffron, stripe: CL.white, hairStyle: 'long', hair: HR[0], child: true } },
];
const scAt = y => 0.72 + Math.max(0, (y - 290) / 190) * 0.42;

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
const shoreY = x => SHORE + Math.sin(x * 0.03) * 5;
function paintSky(o) {
  // the storm is breaking up: heavy violet clouds on the left, warm morning light opening on the right
  P.sky(o, W, H, ['#4a4e7a', '#7a7aa8', '#d8a8b0', '#ffd8b0'], { x: 296, y: 196, r: 24, color: '#fff0c0', glow: 230 });
  P.stormBank(o, W, 40, 0, 7);
  P.cloud(o, 70, 150, 0.9, '#e8e0f0', '#8a84b0', 0.95); P.cloud(o, 200, 112, 0.7, '#f0e4f0', '#9a8cb8', 0.9);
  P.hills(o, W, 236, 18, '#9a8ab0', '#8a7aa0', { seed: 91, freq: 0.02, dabs: 10, bottom: 260 });
}
function paintBeach(o) {
  o.save(); o.beginPath(); o.moveTo(0, H); for (let x = 0; x <= W; x += 6) o.lineTo(x, shoreY(x) - 4); o.lineTo(W, H); o.closePath();
  const g = o.createLinearGradient(0, SHORE - 6, 0, H); g.addColorStop(0, '#c8b49a'); g.addColorStop(0.12, '#ecd6ae'); g.addColorStop(1, '#d4a874'); o.fillStyle = g; o.fill(); o.clip();
  const r = P.rng(41); for (let i = 0; i < 60; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff4dc' : '#a8784a', 0.22); o.beginPath(); o.ellipse(r() * W, SHORE + 6 + r() * 160, 4 + r() * 9, 1.4 + r() * 2, 0, 0, 7); o.fill(); }
  for (let i = 0; i < 14; i++) { const x = r() * W, y = SHORE + 14 + r() * 140; o.fillStyle = ['#b8a090', '#9a8a80', '#d8c8b8'][i % 3]; o.beginPath(); o.ellipse(x, y, 2 + r() * 3, 1.5 + r() * 2, r() * 3, 0, 7); o.fill(); }
  // driftwood: bits of the ship washed up
  o.fillStyle = '#8a5a3a'; for (const [x, y, w, a] of [[330, 516, 40, 0.2], [26, 520, 30, -0.3], [300, 628, 34, 0.1]]) { o.save(); o.translate(x, y); o.rotate(a); o.fillRect(-w / 2, -3, w, 6); o.fillStyle = 'rgba(255,220,170,0.4)'; o.fillRect(-w / 2, -3, w, 2); o.fillStyle = '#8a5a3a'; o.restore(); }
  o.restore();
  o.strokeStyle = 'rgba(150,120,100,0.4)'; o.lineWidth = 7; o.beginPath(); for (let x = 0; x <= W; x += 6) o.lineTo(x, shoreY(x) - 1); o.stroke();
  P.rock(o, 352, 494, 0.8, '#9a8a80'); P.rock(o, 12, 496, 0.7, '#a89888');
  P.grassTufts(o, W, 618, 640, 10, '#8aa04a', 3);
  // the fire ring
  const { x, y } = FIRE; o.fillStyle = 'rgba(40,20,20,0.3)'; o.beginPath(); o.ellipse(x, y + 6, 34, 9, 0, 0, 7); o.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; o.fillStyle = ['#8a7a70', '#a8988a', '#6a5a52'][i % 3]; o.beginPath(); o.ellipse(x + Math.cos(a) * 28, y + 4 + Math.sin(a) * 8, 6, 4, 0, 0, 7); o.fill(); }
  o.strokeStyle = '#5a3a24'; o.lineWidth = 5; o.lineCap = 'round'; o.beginPath(); o.moveTo(x - 18, y + 4); o.lineTo(x + 14, y - 6); o.moveTo(x + 18, y + 4); o.lineTo(x - 12, y - 6); o.stroke();
}
function ship(c, t) { // the ship stuck fast on a sandbar, bow up, gently rocking; nobody left on board
  const x = 64, y = 280; c.save(); c.translate(x, y); c.rotate(-0.16 + Math.sin(t * 1.1) * 0.015);
  const h = c.createLinearGradient(0, -24, 0, 10); h.addColorStop(0, '#9a6a44'); h.addColorStop(1, '#4a2c1a'); c.fillStyle = h;
  c.beginPath(); c.moveTo(-60, -20); c.quadraticCurveTo(0, -12, 62, -30); c.quadraticCurveTo(52, 6, 10, 10); c.quadraticCurveTo(-46, 8, -60, -20); c.closePath(); c.fill();
  c.strokeStyle = '#3a2214'; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = 'rgba(255,220,170,0.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-56, -12); c.quadraticCurveTo(0, -4, 56, -20); c.stroke();
  c.fillStyle = '#e9b949'; c.fillRect(-58, -22, 118, 2.5);
  c.strokeStyle = '#3a2214'; c.lineWidth = 3; c.beginPath(); c.moveTo(2, -16); c.lineTo(-4, -96); c.stroke();
  c.lineWidth = 2; c.beginPath(); c.moveTo(-30, -82); c.lineTo(26, -88); c.stroke();
  c.fillStyle = '#f2e6cf'; c.strokeStyle = '#a89878'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-28, -82); c.quadraticCurveTo(-2, -64 + Math.sin(t * 3) * 2, 24, -88); c.quadraticCurveTo(-2, -76, -28, -82); c.fill(); c.stroke();
  c.restore();
  // foam where the waves meet the sandbar
  c.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(16 + i * 14, 292 + Math.sin(t * 3 + i) * 2, 3 + Math.sin(t * 4 + i * 2) * 1.2, 0, 7); c.fill(); }
}
// a swimmer in the water (only head, shoulders and waving arms show above the waterline), optionally on a plank
function swimmer(c, x, y, sc, o, t, ph, held) {
  const bob = held ? 0 : Math.sin(t * 2.6 + ph) * 3, wy = y + bob, feet = wy + 34 * sc;
  if (o.plank) { c.save(); c.translate(x, wy + 2); c.rotate(Math.sin(t * 2 + ph) * 0.06); c.fillStyle = '#8a5a3a'; c.fillRect(-30 * sc, -4 * sc, 60 * sc, 8 * sc); c.fillStyle = 'rgba(255,220,170,0.45)'; c.fillRect(-30 * sc, -4 * sc, 60 * sc, 2.4 * sc); c.strokeStyle = '#4a2c1a'; c.lineWidth = 1; c.strokeRect(-30 * sc, -4 * sc, 60 * sc, 8 * sc); c.restore(); }
  c.save(); c.beginPath(); c.rect(x - 60, 0, 120, wy + 1); c.clip();
  P.person(c, x, feet, sc, { ...o, t, phase: ph, bounce: 0.4, expr: held ? 'laugh' : 'wow', arms: held ? 'cheer' : o.plank ? 'out' : 'wave' });
  c.restore();
  // ripples round the body at the waterline
  c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2; for (let k = 0; k < 2; k++) { const q = (t * 1.2 + k * 0.5 + ph) % 1; c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(x, wy + 1, (16 + q * 22) * sc, (4 + q * 5) * sc, 0, 0, 7); c.stroke(); } c.globalAlpha = 1;
  c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(x, wy + 1, 15 * sc, 3.4 * sc, 0, 0, 7); c.fill();
}
function blanket(c, x, y, sc, col, ch) { // a blanket round the shoulders of someone standing at (x, y)
  const H2 = ch ? 0.82 : 1, top = y - 40 * H2 * sc;
  c.save(); c.translate(x, top); c.scale(sc, sc);
  const g = c.createLinearGradient(-16, 0, 16, 30); g.addColorStop(0, P.shade(col, 0.18)); g.addColorStop(1, P.shade(col, -0.2)); c.fillStyle = g; c.strokeStyle = P.shade(col, -0.45); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-9, -2); c.quadraticCurveTo(-18, 2, -17, 30); c.lineTo(-4, 32); c.lineTo(-2, 8); c.lineTo(2, 8); c.lineTo(4, 32); c.lineTo(17, 30); c.quadraticCurveTo(18, 2, 9, -2); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = P.rgba('#fff4dc', 0.6); c.fillRect(-17, 24, 13, 2.5); c.fillRect(4, 24, 13, 2.5);
  c.restore();
}

MG.add({
  id: 'shipwreck', stage: 'acts', cmd: 'SWIM!', hint: 'drag', time: 6, mood: 'sea', winText: 'All safe!',
  card: {
    title: 'Safe on Malta', ref: 'Acts 27:13–28:2', kind: 'Acts story',
    text: 'The book of Acts tells how Paul was sailing to Rome on a ship with 276 people on board. A great storm blew them off course for two weeks, until the ship ran aground near the island of Malta. Everyone got safely to land, some swimming and some floating on planks, and the islanders lit a fire and welcomed them out of the cold rain.',
    ask: 'The people of Malta were kind to strangers who washed up on their beach. How can you be kind to someone who is new?',
  },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    s.drift = [0, 7, 13][g.level] * g.speed;
    s.sw = Array.from({ length: n }, (_, i) => ({ o: SWIMMERS[i], x: START[i][0] + (Math.random() - 0.5) * 16, y: START[i][1] + (Math.random() - 0.5) * 10, ph: Math.random() * 6, state: 'sea', t: 0, fx: 0, fy: 0, col: BLANKETS[i] }));
    s.held = null; s.spray = []; s.safe = 0;
  },
  down(g, x, y) {
    const s = g.s; if (s.held) return;
    let best = null, bd = 46; for (const w of s.sw) { if (w.state !== 'sea') continue; const sc = scAt(w.y), d = Math.hypot(x - w.x, y - (w.y - 22 * sc)); if (d < bd) { bd = d; best = w; } }
    if (best) { s.held = best; best.dx = best.x - x; best.dy = best.y - y; g.sfx('splash'); }
  },
  move(g, x, y) {
    const s = g.s, w = s.held; if (!w) return;
    const nx = Math.max(24, Math.min(W - 24, x + w.dx)), ny = Math.max(290, y + w.dy);
    if (Math.hypot(nx - w.x, ny - w.y) > 6 && Math.random() < 0.6) s.spray.push({ x: w.x, y: w.y, vx: (Math.random() - 0.5) * 80, vy: -60 - Math.random() * 60, t: g.t });
    w.x = nx; w.y = ny;
  },
  up(g) {
    const s = g.s, w = s.held; if (!w) return; s.held = null;
    if (w.y >= shoreY(w.x) - 12) land(g, w);
    else g.sfx('bubble');
  },
  update(g, dt) {
    const s = g.s;
    for (const w of s.sw) {
      if (w.state === 'sea' && w !== s.held) { w.y = Math.max(300, w.y - s.drift * dt); w.x += Math.sin(g.t * 0.8 + w.ph) * 6 * dt; }
      if (w.state === 'walk') { const q = Math.min(1, (g.t - w.t) / 0.6); w.x = w.fx + (SPOTS[w.spot][0] - w.fx) * q; w.y = w.fy + (SPOTS[w.spot][1] - w.fy) * q; if (q >= 1) w.state = 'warm'; }
    }
    for (const p of s.spray) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; }
    s.spray = s.spray.filter(p => g.t - p.t < 0.6);
  },
  auto(g, dt, synth) { // pick up the nearest swimmer and pull them straight in to the beach
    const s = g.s; if (g.t < 0.35 || g.done) return; const k = Math.floor((g.t - 0.35) / 0.13); if (k === s.botK) return; s.botK = k;
    if (s.held) { const w = s.held; synth('move', w.x - w.dx, SHORE + 30 - w.dy); synth('up', w.x - w.dx, SHORE + 30 - w.dy); return; }
    const w = s.sw.filter(q => q.state === 'sea').sort((a, b) => b.y - a.y)[0]; if (!w) return;
    const sc = scAt(w.y), x = w.x, y = w.y - 22 * sc; synth('down', x, y); synth('move', x, (y + SHORE) / 2);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', lost = g.result === 'fail', pu = 0.5 + 0.5 * Math.sin(t * 6), since = won ? t - g.doneAt : 0;
    c.drawImage(g.bake('acts_shipwreck_sky', paintSky), 0, 0, W, H);
    P.rays(c, 296, 196, W, H * 0.6, '#fff0c8', 0.12 + s.safe / s.sw.length * 0.1 + since * 0.2, 9, t);
    P.cloud(c, 300 - t * 6, 70, 0.6, '#f0e8f4', '#9a8cb8', 0.85);
    P.water(c, W, 244, SHORE + 10, '#2f5f86', '#8ab8c8', t, { waves: 7, sparkle: '#fff2d0' });
    // big rolling swells crossing the bay
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 2.4; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const y = 300 + i * 46 + ((t * 14) % 46); c.beginPath(); for (let x = -10; x <= W + 10; x += 8) { const yy = y + Math.sin(x * 0.04 + t * 1.5 + i) * 4; x < 0 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.globalAlpha = 0.3 + 0.3 * Math.sin(i + t); c.stroke(); } c.globalAlpha = 1;
    ship(c, t);
    c.drawImage(g.bake('acts_shipwreck_beach', paintBeach), 0, 0, W, H);
    // surf rolling up the beach
    const surf = (Math.sin(t * 1.4) + 1) / 2; c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); for (let x = 0; x <= W; x += 6) c.lineTo(x, shoreY(x) + surf * 8 + Math.sin(x * 0.12 + t * 3) * 1.5); for (let x = W; x >= 0; x -= 6) c.lineTo(x, shoreY(x) - 2); c.closePath(); c.fill();
    // the beach glows where swimmers should be brought
    if (s.held && !g.done) { c.save(); c.globalCompositeOperation = 'screen'; const sg = c.createLinearGradient(0, SHORE - 10, 0, SHORE + 70); sg.addColorStop(0, `rgba(255,240,180,${0.25 + 0.25 * pu})`); sg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = sg; c.fillRect(0, SHORE - 10, W, 80); c.restore(); }
    // the islanders' fire
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, FIRE.x, FIRE.y - 6, 90, '#ffa050', 0.35 + 0.06 * Math.sin(t * 9)); c.restore();
    for (let i = 0; i < 5; i++) { const fx = FIRE.x - 16 + i * 8, h = 18 + 8 * Math.sin(t * 11 + i * 2) + (i % 2) * 6; const fg = c.createLinearGradient(0, FIRE.y, 0, FIRE.y - h); fg.addColorStop(0, '#ffb030'); fg.addColorStop(0.6, '#ffe070'); fg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = fg; c.beginPath(); c.moveTo(fx - 6, FIRE.y); c.quadraticCurveTo(fx - 5, FIRE.y - h * 0.5, fx + Math.sin(t * 7 + i) * 3, FIRE.y - h); c.quadraticCurveTo(fx + 5, FIRE.y - h * 0.5, fx + 6, FIRE.y); c.closePath(); c.fill(); }
    for (let i = 0; i < 6; i++) { const q = (t * 0.9 + i / 6) % 1; c.fillStyle = `rgba(255,220,120,${1 - q})`; c.beginPath(); c.arc(FIRE.x + Math.sin(i * 2.3 + q * 4) * 16, FIRE.y - 10 - q * 60, 1.5, 0, 7); c.fill(); }
    // a light drizzle that thins out as people reach land
    c.save(); c.globalAlpha = Math.max(0, 0.7 - s.safe / s.sw.length * 0.6 - since); P.rain(c, W, H, t, 40, 'rgba(220,230,255,0.5)', -0.15); c.restore();
    // everyone on land, sorted back to front with the islanders
    const items = [];
    ISLANDERS.forEach((p, i) => items.push({ y: p.y, draw: () => P.person(c, p.x, p.y - (won ? Math.abs(Math.sin(t * 8 + i)) * 6 : 0), 1.15, { ...p.o, t, phase: i, facing: p.f, bounce: 1.2, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'wave' }) }));
    for (const w of s.sw) if (w.state === 'walk' || w.state === 'warm') {
      const sc = 1.05, warm = w.state === 'warm', hop = won ? Math.abs(Math.sin(t * 9 + w.ph)) * 6 : 0;
      items.push({ y: w.y, draw: () => { P.person(c, w.x, w.y - hop, sc, { ...w.o, t, phase: w.ph, bounce: warm ? 1.2 : 2.4, facing: w.x > FIRE.x ? -1 : 1, expr: 'laugh', arms: won ? 'cheer' : warm ? 'hold' : 'wave' });
        if (warm) blanket(c, w.x, w.y - hop, sc, w.col, false);
        if (t - w.t < 1) { c.fillStyle = `rgba(160,210,240,${1 - (t - w.t)})`; for (let k = 0; k < 3; k++) { const q = ((t * 1.6 + k * 0.33) % 1); c.beginPath(); c.ellipse(w.x - 10 + k * 10, w.y - 50 + q * 44, 1.8, 2.6, 0, 0, 7); c.fill(); } } } });
    }
    items.sort((a, b) => a.y - b.y).forEach(it => it.draw());
    // swimmers still in the sea, with a glow so they are easy to grab
    for (const w of s.sw.filter(q => q.state === 'sea').sort((a, b) => a.y - b.y)) {
      const sc = scAt(w.y), held = w === s.held;
      if (!g.done && !held) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, w.x, w.y - 20 * sc, 40 * sc, '#fff0b0', 0.22 + 0.25 * pu); c.restore(); }
      swimmer(c, w.x, w.y, sc, w.o, t, w.ph, held);
      if (lost) { c.fillStyle = 'rgba(220,240,255,0.9)'; const q = ((t - g.doneAt) * 2 + w.ph) % 1; c.beginPath(); c.arc(w.x + 10 * sc, w.y - 34 * sc - q * 14, 2.4 * (1 - q) + 1, 0, 7); c.fill(); }
    }
    // a friendly dolphin leaps past if time runs out
    if (lost) { const q = Math.min(1, (t - g.doneAt) / 0.75), dx = -30 + q * 420, dy = 400 - Math.sin(q * Math.PI) * 90; dolphin(c, dx, dy, Math.atan2(-Math.cos(q * Math.PI) * 90 * Math.PI, 420) * -1); }
    for (const p of s.spray) { c.fillStyle = `rgba(230,250,255,${1 - (t - p.t) / 0.6})`; c.beginPath(); c.arc(p.x, p.y, 2.6, 0, 7); c.fill(); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
function land(g, w) {
  const s = g.s; w.state = 'walk'; w.t = g.t; w.fx = w.x; w.fy = Math.max(w.y, shoreY(w.x) + 6); w.spot = s.safe++;
  g.sfx('splashbig'); g.sfx('cheer'); g.burst(w.x, w.fy - 30, ['#ffd45a', '#ffffff', '#9fe0ff', '#ff9ab8'], 16, 180);
  if (s.safe >= s.sw.length) { g.win(); g.sfx('harp'); g.burst(FIRE.x, FIRE.y - 40, ['#fff6c0', '#ffd45a', '#ffffff', '#ff9ab8', '#9fe0ff'], 30, 240); }
}
function dolphin(c, x, y, a) {
  c.save(); c.translate(x, y); c.rotate(a);
  const g = c.createLinearGradient(0, -14, 0, 12); g.addColorStop(0, '#7a9ac0'); g.addColorStop(0.6, '#a8c0d8'); g.addColorStop(1, '#e8eef4'); c.fillStyle = g; c.strokeStyle = '#4a6a90'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(34, 2); c.quadraticCurveTo(20, -14, -10, -10); c.quadraticCurveTo(-30, -6, -38, 0); c.lineTo(-48, -10); c.lineTo(-46, 6); c.lineTo(-36, 4); c.quadraticCurveTo(-10, 12, 22, 8); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-2, -10); c.lineTo(-10, -22); c.lineTo(8, -11); c.fill(); c.stroke();
  P.eye(c, 20, -3, 1.8); P.blush(c, 24, 3, 2.4);
  c.restore();
}
