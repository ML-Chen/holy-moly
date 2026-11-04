// POUR! — John 2:1–11. The wine runs out at a wedding in Cana; hold to pour water into each stone jar and let go at the glowing line.
// Overfill and it sloshes all over the servant. When every jar is full, the water turns to wine and the wedding dances.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const MARY = { skin: SK[2], robe: CL.indigo, head: 'scarf', headCol: CL.sky, hair: HR[1] };
const SERVANT = { skin: SK[1], robe: CL.sand, stripe: CL.brown, hairStyle: 'short', hair: HR[2] };
const JB = 584, JH = 90, JW = 52, SY = 522, SS = 1.25;  // jar bottom, height, width; servant feet y and scale
const jarX = i => 33 + i * 58.8;
const BANDS = [[0.64, 0.94], [0.72, 0.93], [0.78, 0.92]];
const RATE = [0.8, 1.0, 1.2];
const GUESTS = [
  { x: 34, y: 456, o: { skin: SK[0], robe: CL.rose, stripe: CL.white, hairStyle: 'long', hair: HR[2] } },
  { x: 86, y: 448, o: { skin: SK[3], robe: CL.teal, stripe: CL.gold, beard: true, hair: HR[0], head: 'wrap', headCol: CL.cream }, oops: true },
  { x: 140, y: 456, o: { skin: SK[1], robe: CL.white, stripe: CL.gold, hairStyle: 'bun', hair: HR[0] }, bride: true },
  { x: 192, y: 449, o: { skin: SK[2], robe: CL.royal, stripe: CL.gold, beard: true, hair: HR[1] } },
];
const WATER = ['#bfe8f8', '#5fb0d8'], WINE = ['#d8486a', '#7a1032'];

function jarPath(c, x, b, w, h) {
  const hw = w / 2, top = b - h; c.beginPath();
  c.moveTo(x - hw * 0.64, top); c.lineTo(x + hw * 0.64, top);
  c.quadraticCurveTo(x + hw * 0.62, top + h * 0.1, x + hw * 0.76, top + h * 0.16);
  c.bezierCurveTo(x + hw * 1.08, top + h * 0.28, x + hw * 1.06, top + h * 0.8, x + hw * 0.8, b - 3);
  c.quadraticCurveTo(x + hw * 0.72, b, x + hw * 0.56, b); c.lineTo(x - hw * 0.56, b);
  c.quadraticCurveTo(x - hw * 0.72, b, x - hw * 0.8, b - 3);
  c.bezierCurveTo(x - hw * 1.06, top + h * 0.8, x - hw * 1.08, top + h * 0.28, x - hw * 0.76, top + h * 0.16);
  c.quadraticCurveTo(x - hw * 0.62, top + h * 0.1, x - hw * 0.64, top); c.closePath();
}
const inner = () => ({ ib: JB - 7, ih: JH - 9, iw: JW - 14 });
const surfY = lev => { const { ib, ih } = inner(); return ib - lev * ih; };

function drawJar(c, x, lev, wk, band, t, glow, spill) {
  const b = JB, h = JH, w = JW, top = b - h, { ib, ih, iw } = inner();
  if (glow > 0) { const gg = c.createRadialGradient(x, b - h * 0.5, 4, x, b - h * 0.5, 64); gg.addColorStop(0, `rgba(255,226,150,${0.6 * glow})`); gg.addColorStop(1, 'rgba(255,226,150,0)'); c.fillStyle = gg; c.fillRect(x - 64, b - h * 0.5 - 64, 128, 128); }
  c.fillStyle = 'rgba(60,30,30,0.3)'; c.beginPath(); c.ellipse(x + 4, b + 1, w * 0.56, 5, 0, 0, 7); c.fill();
  if (spill > 0) { c.fillStyle = `rgba(150,210,240,${0.55 * spill})`; c.beginPath(); c.ellipse(x + 2, b + 2, w * 0.6 + (1 - spill) * 22, 6 + (1 - spill) * 3, 0, 0, 7); c.fill(); }
  // limestone body, lit from the upper left
  const sg = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); sg.addColorStop(0, '#f2e8d6'); sg.addColorStop(0.45, '#d8cab2'); sg.addColorStop(1, '#9a8a74');
  jarPath(c, x, b, w, h); c.fillStyle = sg; c.fill(); c.strokeStyle = '#6e5e4c'; c.lineWidth = 1.6; c.stroke();
  // the open inside, so we can see how full it is
  c.save(); jarPath(c, x, ib, iw, ih); c.clip();
  const dg = c.createLinearGradient(0, ib - ih, 0, ib); dg.addColorStop(0, '#b8a488'); dg.addColorStop(1, '#8a765e'); c.fillStyle = dg; c.fillRect(x - w, ib - ih - 4, w * 2, ih + 8);
  if (lev > 0.004) {
    const wy = ib - lev * ih, top2 = P.mix(WATER[0], WINE[0], wk), bot2 = P.mix(WATER[1], WINE[1], wk);
    const wg = c.createLinearGradient(0, wy, 0, ib); wg.addColorStop(0, top2); wg.addColorStop(1, bot2); c.fillStyle = wg;
    c.beginPath(); c.moveTo(x - w, ib + 2); for (let xx = x - w / 2; xx <= x + w / 2; xx += 3) c.lineTo(xx, wy + Math.sin(xx * 0.35 + t * 7) * 1.4); c.lineTo(x + w, ib + 2); c.closePath(); c.fill();
    c.strokeStyle = P.rgba('#ffffff', 0.7); c.lineWidth = 1.6; c.beginPath(); for (let xx = x - w / 2; xx <= x + w / 2; xx += 3) { const yy = wy + Math.sin(xx * 0.35 + t * 7) * 1.4; xx === x - w / 2 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } c.stroke();
    // bubbles and a glint
    c.fillStyle = P.rgba('#ffffff', 0.5); for (let i = 0; i < 4; i++) { const by = ib - ((t * 26 + i * 19) % Math.max(4, ib - wy)); if (by > wy + 3) { c.beginPath(); c.arc(x - 10 + i * 7, by, 1.3, 0, 7); c.fill(); } }
    c.fillStyle = P.rgba('#ffffff', 0.35); c.fillRect(x - iw * 0.32, wy + 4, 3, Math.max(0, ib - wy - 10));
  }
  if (band) { // the line to fill to: a glowing golden strip with bright edges
    const [lo, hi] = band.r, yl = ib - lo * ih, yh = ib - hi * ih, p = 0.5 + 0.5 * Math.sin(t * 8), ok = band.in;
    c.fillStyle = ok ? `rgba(160,255,150,${0.45 + 0.25 * p})` : `rgba(255,220,110,${0.28 + 0.2 * p})`; c.fillRect(x - w / 2, yh, w, yl - yh);
    c.strokeStyle = ok ? '#e8ffd8' : '#fff1b0'; c.lineWidth = 2; c.setLineDash([5, 4]); c.lineDashOffset = -t * 20; c.beginPath(); c.moveTo(x - w / 2, yh); c.lineTo(x + w / 2, yh); c.moveTo(x - w / 2, yl); c.lineTo(x + w / 2, yl); c.stroke(); c.setLineDash([]);
  }
  // roundness: shade on the right of the inside, light on the left
  const rg = c.createLinearGradient(x - iw / 2, 0, x + iw / 2, 0); rg.addColorStop(0, 'rgba(255,255,255,0.12)'); rg.addColorStop(0.5, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(30,10,20,0.25)'); c.fillStyle = rg; c.fillRect(x - w, top, w * 2, h);
  c.restore();
  c.strokeStyle = 'rgba(80,60,40,0.55)'; c.lineWidth = 1.2; jarPath(c, x, ib, iw, ih); c.stroke();
  // rim and a carved band near the base
  const rim = c.createLinearGradient(0, top - 5, 0, top + 4); rim.addColorStop(0, '#fbf3e4'); rim.addColorStop(1, '#b8a88e'); c.fillStyle = rim; roundRect(c, x - w * 0.37, top - 5, w * 0.74, 8, 3); c.fill(); c.strokeStyle = '#6e5e4c'; c.lineWidth = 1.3; c.stroke();
  if (band) { // gold arrows beside the jar pointing at the line
    const [lo, hi] = band.r, ym = ib - (lo + hi) / 2 * ih, p = Math.sin(t * 8) * 2.5; c.fillStyle = band.in ? '#c8ffb8' : '#ffd84a'; c.strokeStyle = '#7a4a10'; c.lineWidth = 1.2;
    for (const sd of [-1, 1]) { const ax = x + sd * (w / 2 + 9 + p); c.beginPath(); c.moveTo(ax - sd * 7, ym); c.lineTo(ax + sd * 3, ym - 7); c.lineTo(ax + sd * 3, ym + 7); c.closePath(); c.fill(); c.stroke(); }
  }
  if (spill > 0) { c.strokeStyle = `rgba(170,225,250,${0.8 * spill})`; c.lineWidth = 4; c.lineCap = 'round'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x + sd * w * 0.33, top - 2); c.quadraticCurveTo(x + sd * w * 0.62, top + h * 0.3, x + sd * w * 0.52, b - 4); c.stroke(); } }
}
// a clay pitcher held at the hand; a < 0 tips the spout down to the left
function pitcher(c, x, y, a) {
  c.save(); c.translate(x, y); c.rotate(a);
  const g = c.createRadialGradient(-3, 2, 1, 0, 6, 14); g.addColorStop(0, '#e89a5a'); g.addColorStop(1, '#9a4a24'); c.fillStyle = g; c.strokeStyle = '#5a2a14'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-6, -8); c.lineTo(6, -8); c.quadraticCurveTo(13, 0, 11, 10); c.quadraticCurveTo(0, 18, -11, 10); c.quadraticCurveTo(-13, 0, -6, -8); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-6, -8); c.lineTo(-15, -11); c.lineTo(-13, -6); c.lineTo(-6, -4); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#7a3a1a'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(8, -6); c.quadraticCurveTo(18, -2, 11, 6); c.stroke();
  c.strokeStyle = 'rgba(255,230,190,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-9, 2); c.quadraticCurveTo(-4, 10, 4, 11); c.stroke();
  c.restore();
}
const spoutOf = (x, y, a) => [x + Math.cos(a) * -14 - Math.sin(a) * -9, y + Math.sin(a) * -14 + Math.cos(a) * -9];
function cup(c, x, y, flip, wine) {
  c.save(); c.translate(x, y); if (flip) c.rotate(Math.PI * 0.85);
  c.fillStyle = '#c07a3e'; c.strokeStyle = '#6a3a1a'; c.lineWidth = 1; c.beginPath(); c.moveTo(-5, -6); c.lineTo(5, -6); c.lineTo(3.4, 2); c.lineTo(-3.4, 2); c.closePath(); c.fill(); c.stroke();
  c.fillRect(-1, 2, 2, 3); c.fillRect(-3.5, 5, 7, 1.6);
  if (wine) { c.fillStyle = '#9a2040'; c.beginPath(); c.ellipse(0, -6, 4.4, 1.4, 0, 0, 7); c.fill(); }
  c.restore();
}
function wreath(c, x, y, s) { const cols = ['#ffffff', '#ffd0e0', '#ffe27a']; for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.1); c.fillStyle = cols[i % 3]; c.beginPath(); c.arc(x + Math.cos(a) * 14 * s, y + Math.sin(a) * 12 * s, 2.6 * s, 0, 7); c.fill(); } }

function paintBg(o) {
  P.sky(o, W, H, ['#2c2f6e', '#6a4a8e', '#d4708a', '#ffb07a', '#ffd9a0'], { x: 262, y: 246, r: 20, color: '#ffd8a0', glow: 200 });
  P.stars(o, W, 110, 26, 9, 0);
  P.hills(o, W, 250, 28, '#9a6a8a', '#7a5a7a', { seed: 5, freq: 0.012, dabs: 20, bottom: 300 });
  P.house(o, 6, 284, 64, 44, '#d8a888'); P.house(o, 292, 280, 62, 50, '#d0a080'); P.palm(o, 238, 290, 0.75, 0.12, 0, '#4a7a52'); P.palm(o, 96, 292, 0.6, -0.1, 0, '#4a7a52');
  // the courtyard wall, warm plaster in the evening light
  const wg = o.createLinearGradient(0, 278, 0, 446); wg.addColorStop(0, '#f0cfa4'); wg.addColorStop(1, '#c4906c'); o.fillStyle = wg; o.fillRect(0, 280, W, 168);
  const r = P.rng(21); for (let i = 0; i < 26; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff0d8' : '#a8704e', 0.16); o.beginPath(); o.ellipse(r() * W, 290 + r() * 150, 8 + r() * 16, 3 + r() * 5, 0, 0, 7); o.fill(); }
  o.fillStyle = '#f8dcb4'; o.fillRect(0, 274, W, 8); o.fillStyle = 'rgba(120,70,50,0.3)'; o.fillRect(0, 282, W, 5);
  // an arched doorway glowing with lamplight
  o.save(); o.beginPath(); o.moveTo(140, 446); o.lineTo(140, 360); o.arc(180, 360, 40, Math.PI, 0); o.lineTo(220, 446); o.closePath();
  const dg = o.createRadialGradient(180, 400, 6, 180, 400, 80); dg.addColorStop(0, '#ffe2a0'); dg.addColorStop(0.6, '#e08a4a'); dg.addColorStop(1, '#7a3a2a'); o.fillStyle = dg; o.fill(); o.restore();
  o.strokeStyle = '#a8704e'; o.lineWidth = 4; o.beginPath(); o.moveTo(140, 446); o.lineTo(140, 360); o.arc(180, 360, 40, Math.PI, 0); o.lineTo(220, 446); o.stroke();
  // a vine across the wall
  o.strokeStyle = '#5a6a3a'; o.lineWidth = 2.2; o.beginPath(); o.moveTo(0, 300); for (let x = 0; x <= W; x += 20) o.quadraticCurveTo(x + 10, 312 + Math.sin(x) * 6, x + 20, 300 + Math.sin(x * 0.07) * 6); o.stroke();
  for (let i = 0; i < 40; i++) { const x = r() * W, y = 296 + r() * 22; o.fillStyle = r() < 0.5 ? '#6f9a4a' : '#4f7a3a'; o.beginPath(); o.ellipse(x, y, 5, 3, r() * 3, 0, 7); o.fill(); if (r() < 0.25) { o.fillStyle = '#6a2a5a'; for (let k = 0; k < 4; k++) { o.beginPath(); o.arc(x + (k % 2) * 3, y + 4 + k * 2.4, 2, 0, 7); o.fill(); } } }
  // the stone courtyard floor
  const fg = o.createLinearGradient(0, 446, 0, H); fg.addColorStop(0, '#d8b490'); fg.addColorStop(1, '#a87e5a'); o.fillStyle = fg; o.fillRect(0, 446, W, H - 446);
  o.strokeStyle = 'rgba(110,70,50,0.28)'; o.lineWidth = 1.2; let y = 450, dy = 7; while (y < H) { o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); y += dy; dy *= 1.32; }
  for (let i = -10; i <= 10; i++) { o.beginPath(); o.moveTo(180 + i * 26, 446); o.lineTo(180 + i * 90, H); o.stroke(); }
  o.fillStyle = 'rgba(255,240,200,0.12)'; o.fillRect(0, 446, W, 6);
  // two poles that carry the strings of lamps
  for (const px of [8, 352]) { o.fillStyle = '#7a5434'; o.fillRect(px - 3, 150, 6, 300); o.fillStyle = 'rgba(255,220,170,0.4)'; o.fillRect(px - 3, 150, 2, 300); }
}

MG.add({
  id: 'wine', stage: 'jesus', cmd: 'POUR!', hint: 'hold', time: 6, mood: 'party', winText: 'Cheers!', failText: 'Splosh!',
  card: {
    title: 'Water into wine', ref: 'John 2:1–11', kind: 'Gospel story',
    text: 'John\'s Gospel tells how Jesus, his mother and his friends went to a wedding in the village of Cana, and the wine ran out. Jesus told the servants to fill six big stone jars with water. When they poured some out, it had become wine, the best wine of the whole party.',
    note: 'John calls this the first of Jesus\'s signs. Some Christians believe it happened just as told, and others read it as a story showing that God loves joy and gives more than enough.',
    ask: 'How could you help make a party or a family day happier for everyone?',
  },
  init(g) {
    const s = g.s, n = [2, 3, 3][g.level];
    const empty = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, n).sort((a, b) => a - b);
    s.queue = empty; s.qi = 0; s.lev = [0, 1, 2, 3, 4, 5].map(i => empty.includes(i) ? 0 : 0.86); s.doneT = [0, 0, 0, 0, 0, 0].map(() => -9);
    s.band = BANDS[g.level]; s.rate = RATE[g.level] * (1 + (g.speed - 1) * 0.6);
    s.held = false; s.lock = false; s.pouring = false; s.spillT = -9; s.spillJar = -1; s.drops = []; s.wineT = -1; s.petals = []; s.tilt = -0.25;
    s.sx = jarX(empty[0]) + 34;
  },
  down(g) { const s = g.s; s.held = true; if (!s.lock) g.sfx('bubble'); },
  up(g) {
    const s = g.s; s.held = false; s.lock = false; const cur = s.queue[s.qi]; if (cur === undefined) return;
    const lv = s.lev[cur];
    if (lv >= s.band[0] && lv <= s.band[1]) {
      s.doneT[cur] = g.t; s.qi++; g.sfx('ding'); g.burst(jarX(cur), surfY(lv), ['#ffffff', '#bfe8f8', '#fff2a0'], 14, 150);
      if (s.qi >= s.queue.length) { s.wineT = g.t; g.win(); g.sfx('magic'); g.sfx('cheer'); for (let i = 0; i < 6; i++) g.burst(jarX(i), JB - 50, ['#ff8aa8', '#ffd45a', '#ffffff', '#d8486a'], 8, 160); }
    }
  },
  update(g, dt) {
    const s = g.s, t = g.t, cur = s.queue[s.qi];
    if (cur !== undefined) s.sx += (jarX(cur) + 34 - s.sx) * Math.min(1, dt * 14);
    s.pouring = !g.done && cur !== undefined && s.held && !s.lock;
    s.tilt += ((s.pouring ? -1.15 : -0.25) - s.tilt) * Math.min(1, dt * 16);
    if (s.pouring && s.tilt < -0.8) {
      s.lev[cur] += s.rate * dt;
      if (s.lev[cur] > 1.04) { // too full: it sloshes everywhere
        s.lock = true; s.spillT = t; s.spillJar = cur; s.lev[cur] = Math.max(0.3, s.band[0] - 0.24); g.sfx('splashbig'); g.shake(3, 0.25);
        for (let i = 0; i < 22; i++) s.drops.push({ x: jarX(cur) + (Math.random() - 0.5) * 30, y: JB - JH, vx: (Math.random() - 0.5) * 260, vy: -160 - Math.random() * 220 });
      }
    }
    if (s.pouring && Math.floor(t * 6) !== s.dripK) { s.dripK = Math.floor(t * 6); g.sfx('drip'); }
    for (const d of s.drops) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 700 * dt; }
    s.drops = s.drops.filter(d => d.y < 660);
    if (s.wineT >= 0) { if (s.petals.length < 40) for (let i = 0; i < 3; i++) s.petals.push({ x: Math.random() * W, y: -10 - Math.random() * 40, vy: 60 + Math.random() * 60, ph: Math.random() * 6, col: ['#ffd0e0', '#ffffff', '#ffe27a', '#ff9ab8'][Math.floor(Math.random() * 4)] }); for (const p of s.petals) p.y += p.vy * dt; }
  },
  auto(g, dt, synth) { // hold, and let go in the middle of the golden band
    const s = g.s, cur = s.queue[s.qi]; if (g.t < 0.3 || cur === undefined) return;
    if (!s.held) synth('down', 180, 400);
    else if (s.lev[cur] >= (s.band[0] + s.band[1]) / 2) synth('up', 180, 400);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', wk = s.wineT >= 0 ? Math.min(1, (t - s.wineT) / 0.35) : 0, cur = s.queue[s.qi];
    c.drawImage(g.bake('jesus_wine_bg', paintBg), 0, 0, W, H);
    // strings of little oil lamps and a flower garland, swaying
    for (let k = 0; k < 2; k++) {
      const y0 = 160 + k * 34, sag = 40 - k * 8, sw = Math.sin(t * 1.4 + k) * 3, yAt = x => y0 + sag * (1 - Math.pow((x - 180) / 172, 2)) + sw * Math.sin(x / 60);
      c.strokeStyle = k ? '#6a8a3a' : 'rgba(80,50,40,0.8)'; c.lineWidth = k ? 3 : 1.4; c.beginPath(); for (let x = 8; x <= 352; x += 6) x === 8 ? c.moveTo(x, yAt(x)) : c.lineTo(x, yAt(x)); c.stroke();
      for (let i = 1; i < 9; i++) { const x = 8 + i * 38.2, y = yAt(x);
        if (k === 0) { const f = 0.75 + 0.25 * Math.sin(t * 9 + i * 2.3), gl = c.createRadialGradient(x, y + 6, 0, x, y + 6, 18); gl.addColorStop(0, `rgba(255,220,140,${0.7 * f})`); gl.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gl; c.fillRect(x - 18, y - 12, 36, 36); c.fillStyle = '#b8743a'; c.beginPath(); c.ellipse(x, y + 7, 5, 3, 0, 0, 7); c.fill(); c.fillStyle = '#fff2b0'; c.beginPath(); c.ellipse(x + 3, y + 1 - f * 2, 1.8, 3.2 * f, 0, 0, 7); c.fill(); }
        else { const fc = ['#ffd0e0', '#ffffff', '#ffe27a', '#ff9ab8'][i % 4]; c.fillStyle = fc; for (let p = 0; p < 5; p++) { const a = p * 1.256 + t; c.beginPath(); c.arc(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.6, 0, 7); c.fill(); } c.fillStyle = '#e8a33a'; c.beginPath(); c.arc(x, y, 1.8, 0, 7); c.fill(); }
      }
    }
    // the wedding guests: the wine has run out, so the dancing has stopped
    GUESTS.forEach((p, i) => {
      const dx = won ? Math.sin(t * 7 + i * 1.6) * 7 : Math.sin(t * 1.5 + i) * 1.5;
      const hold = (cc, hx, hy) => cup(cc, hx, hy - 4, p.oops && !won, won);
      P.person(c, p.x + dx, p.y, 0.82, { ...p.o, t, phase: i * 1.7, bounce: won ? 4 : 0.8, expr: won ? 'laugh' : p.oops ? 'surprised' : 'happy', arms: won ? (i % 2 ? 'cheer' : 'up') : 'hold', hold: won ? null : hold });
      if (p.bride) wreath(c, p.x + dx, p.y - 58 * 0.82 - (won ? Math.abs(Math.sin(t * 6 + i * 1.7)) * 2 : 0), 0.82);
    });
    P.person(c, 270, 452, 0.86, { ...JESUS, t, phase: 4, bounce: won ? 3 : 0.6, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'down', facing: -1 });
    P.person(c, 318, 456, 0.84, { ...MARY, t, phase: 5, bounce: won ? 3 : 0.6, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'pray', facing: -1 });
    // the servant behind the jars, with a big pitcher
    const wet = t - s.spillT < 0.8, sx = s.sx;
    P.person(c, sx, SY, SS, { ...SERVANT, t, bounce: 0, facing: -1, arms: 'reach', expr: wet ? 'surprised' : won ? 'laugh' : s.pouring ? 'happy' : 'happy', blink: s.pouring && Math.sin(t * 3) > 0.95 });
    if (wet) { c.fillStyle = 'rgba(150,210,240,0.85)'; for (let i = 0; i < 5; i++) { const q = ((t - s.spillT) * 2 + i * 0.2) % 1; c.beginPath(); c.ellipse(sx - 14 + i * 7, SY - 92 + q * 30, 2, 3, 0, 0, 7); c.fill(); } }
    // jars
    for (let i = 0; i < 6; i++) {
      const active = i === cur && !g.done, lv = s.lev[i], inB = lv >= s.band[0] && lv <= s.band[1];
      const pop = Math.max(0, 1 - (t - s.doneT[i]) / 0.3), glow = wk > 0 ? wk * (0.7 + 0.3 * Math.sin(t * 6 + i)) : active ? 0.45 + 0.25 * Math.sin(t * 5) : pop;
      const spill = i === s.spillJar ? Math.max(0, 1 - (t - s.spillT) / 0.9) : 0;
      c.save(); c.translate(jarX(i), JB); c.scale(1 + pop * 0.08, 1 - pop * 0.05 + (wk > 0 ? Math.sin(t * 12 + i) * 0.015 : 0)); c.translate(-jarX(i), -JB);
      drawJar(c, jarX(i), lv, wk, active ? { r: s.band, in: inB } : null, t + i, glow, spill); c.restore();
    }
    // the pour
    const hx = sx - 22 * SS, hy = SY - 38 * SS, [spx, spy] = spoutOf(hx, hy, s.tilt);
    if (s.pouring && cur !== undefined) {
      const ex = jarX(cur) - 2, ey = surfY(s.lev[cur]);
      c.lineCap = 'round'; c.strokeStyle = 'rgba(150,210,240,0.9)'; c.lineWidth = 6; c.beginPath(); c.moveTo(spx, spy); c.quadraticCurveTo(spx - 4, spy + 12, ex + Math.sin(t * 30) * 1, ey); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(spx, spy); c.quadraticCurveTo(spx - 4, spy + 12, ex, ey); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 4; i++) { const a = t * 20 + i * 1.6; c.beginPath(); c.arc(ex + Math.cos(a) * 8, ey - Math.abs(Math.sin(a)) * 6, 1.6, 0, 7); c.fill(); }
    }
    pitcher(c, hx, hy, s.tilt);
    for (const d of s.drops) { c.fillStyle = 'rgba(160,218,248,0.9)'; c.beginPath(); c.ellipse(d.x, d.y, 3, 4, Math.atan2(d.vy, d.vx), 0, 7); c.fill(); }
    for (const p of s.petals) { c.save(); c.translate(p.x + Math.sin(t * 3 + p.ph) * 10, p.y); c.rotate(t * 2 + p.ph); c.fillStyle = p.col; c.beginPath(); c.ellipse(0, 0, 4, 2.4, 0, 0, 7); c.fill(); c.restore(); }
    if (wk > 0) for (let i = 0; i < 12; i++) { const tw = Math.max(0, Math.sin(t * 7 + i * 1.9)); c.save(); c.globalAlpha = tw; c.fillStyle = i % 2 ? '#fffbe0' : '#ffd0e0'; drawStar(c, jarX(i % 6) + Math.sin(i * 3.1) * 22, JB - 30 - (i * 13) % 80, 3 + tw * 3, t); c.restore(); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
