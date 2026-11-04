// GROW! — Mark 4:30–32. The tiniest mustard seed grows into a big plant with branches where the birds make their nests.
// Tap the rain clouds when they float over the seed; every shower makes it grow, until it is a bushy tree full of birds of every colour.
const GX = 180, GY = 556;                         // where the seed is planted
const BIRD_COLS = ['#e8584a', '#f2b632', '#4a8ad8', '#3fae7a', '#a05ad8', '#ff8ab0', '#3fc0c8', '#f08a3a'];
const N_STAGES = 5;
// branch tips and nest spots on the full-grown bush (relative to GX, GY, at full size)
const NESTS = [[-72, -186], [62, -200], [-14, -244], [-108, -132], [100, -140], [24, -160], [-46, -224], [78, -228]];
const LEAF = ['#7aa84a', '#5f9040', '#98c060', '#4a7a36'];

function bush(c, k, t, sway) {
  // k = growth 0..1 (continuous, eased); the plant is drawn at full size and scaled, so it grows smoothly
  if (k <= 0.02) return;
  const sc = 0.12 + k * 0.88;
  c.save(); c.translate(GX, GY); c.scale(sc, sc); c.rotate(Math.sin(t * 1.3) * 0.02 * sway);
  const r = P.rng(5);
  // stems: a few curving trunks splitting into branches toward the nest spots
  const tips = NESTS.map(([x, y]) => [x, y]);
  c.lineCap = 'round';
  for (const [tx, ty] of tips) { const mx = tx * 0.35, my = ty * 0.5; c.strokeStyle = '#7a5a34'; c.lineWidth = 11; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(mx * 0.3, my, tx * 0.85, ty * 0.85); c.stroke(); }
  for (const [tx, ty] of tips) { const my = ty * 0.5; c.strokeStyle = '#a07a48'; c.lineWidth = 4; c.beginPath(); c.moveTo(-2, -4); c.quadraticCurveTo(tx * 0.1 - 2, my, tx * 0.85 - 2, ty * 0.85); c.stroke(); }
  c.fillStyle = 'rgba(40,30,20,0.25)'; c.beginPath(); c.ellipse(0, 4, 90, 12, 0, 0, 7); c.fill();
  // leafy clumps along every branch, darker inside, lit on top
  const clumps = []; for (const [tx, ty] of tips) for (let i = 0; i < 4; i++) { const u = 0.45 + i * 0.17; clumps.push([tx * u + (r() - 0.5) * 22, ty * u + (r() - 0.5) * 18, 22 + r() * 16]); }
  for (const [x, y, rr] of clumps) { c.fillStyle = '#3f6a30'; c.beginPath(); c.arc(x + 3, y + 5, rr, 0, 7); c.fill(); }
  for (const [x, y, rr] of clumps.sort((a, b) => b[1] - a[1])) { const g = c.createRadialGradient(x - rr * 0.4, y - rr * 0.5, 2, x, y, rr); g.addColorStop(0, '#b8d878'); g.addColorStop(0.6, '#78a848'); g.addColorStop(1, '#4f8038'); c.fillStyle = g; c.beginPath(); c.arc(x, y, rr * 0.92, 0, 7); c.fill(); }
  for (const [x, y, rr] of clumps) for (let i = 0; i < 4; i++) { const ang = Math.PI * (1.0 + r() * 0.6), d = rr * (0.3 + r() * 0.45); c.fillStyle = P.rgba(r() < 0.5 ? '#d8ee98' : '#3f6a30', 0.5); c.beginPath(); c.ellipse(x + Math.cos(ang) * d, y + Math.sin(ang) * d, 6, 3, ang + 1.2, 0, 7); c.fill(); }
  // little yellow mustard flowers once it is big
  if (k > 0.6) { const a = Math.min(1, (k - 0.6) / 0.3); c.globalAlpha = a; for (let i = 0; i < 40; i++) { const [x, y, rr] = clumps[i % clumps.length], ang = r() * 6.28, d = r() * rr * 0.8; c.fillStyle = r() < 0.5 ? '#ffe04a' : '#f6c832'; c.beginPath(); c.arc(x + Math.cos(ang) * d, y + Math.sin(ang) * d - rr * 0.2, 3.2, 0, 7); c.fill(); } c.globalAlpha = 1; }
  c.restore();
}
function sprout(c, k, t) {
  // the early stages: a tiny seed, then a sprout with two leaves, then a little plant
  const x = GX, y = GY;
  if (k < 0.05) { const g = c.createRadialGradient(x - 1, y - 6, 0.5, x, y - 5, 4); g.addColorStop(0, '#f2c86a'); g.addColorStop(1, '#a8701e'); c.fillStyle = g; c.beginPath(); c.arc(x, y - 5, 3.4, 0, 7); c.fill(); return; }
  const h = 10 + k * 260, sw = Math.sin(t * 2) * 3;
  c.strokeStyle = '#5f9040'; c.lineWidth = 3 + k * 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw, y - h * 0.5, x + sw * 1.5, y - h); c.stroke();
  const leaf = (lx, ly, a, s) => { c.save(); c.translate(lx, ly); c.rotate(a); c.scale(s, s); const g = c.createLinearGradient(0, -6, 22, 6); g.addColorStop(0, '#a8d070'); g.addColorStop(1, '#5f9040'); c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -10, 24, 0); c.quadraticCurveTo(10, 8, 0, 0); c.fill(); c.strokeStyle = 'rgba(60,90,40,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(1, 0); c.lineTo(20, 0); c.stroke(); c.restore(); };
  const n = 2 + Math.floor(k * 8);
  for (let i = 0; i < n; i++) { const u = 1 - i / n, ly = y - h * u, side = i % 2 ? 1 : -1; leaf(x + sw * 1.5 * u, ly, side > 0 ? -0.4 + Math.sin(t * 2 + i) * 0.1 : Math.PI + 0.4 + Math.sin(t * 2 + i) * 0.1, 0.8 + k * 0.8); }
}
function bird(c, x, y, s, col, t, flying, ph) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const f = flying ? Math.sin(t * 22 + ph) : 0.15;
  c.fillStyle = P.shade(col, -0.15); c.beginPath(); c.moveTo(-8, -2); c.lineTo(-16, -6); c.lineTo(-15, 2); c.closePath(); c.fill();
  const g = c.createRadialGradient(-2, -5, 1, 0, -2, 10); g.addColorStop(0, P.shade(col, 0.35)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.ellipse(0, -2, 10, 7.5, 0, 0, 7); c.fill();
  c.fillStyle = P.shade(col, 0.5); c.beginPath(); c.ellipse(2, 1, 6, 4, 0, 0, 7); c.fill();
  c.fillStyle = P.shade(col, -0.2); c.beginPath(); c.moveTo(-3, -4); c.quadraticCurveTo(-6, -4 - f * 12, -12, -6 - f * 14); c.quadraticCurveTo(-6, 0, 2, -1); c.closePath(); c.fill();
  c.fillStyle = '#f2a33a'; c.beginPath(); c.moveTo(9, -4); c.lineTo(14, -2.5); c.lineTo(9, -1); c.fill();
  P.eye(c, 5, -5, 1.6); P.blush(c, 6, -1, 1.6);
  c.restore();
}
function nest(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#8a6234'; c.beginPath(); c.ellipse(0, 4, 13, 6, 0, 0, Math.PI); c.fill();
  c.strokeStyle = '#c8a060'; c.lineWidth = 1.4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(-12, 3 + i); c.quadraticCurveTo(0, 9 + i, 12, 3 - i); c.stroke(); }
  c.restore();
}
function rainCloud(c, x, y, s, t, glow, wet) {
  if (glow > 0) { const g = c.createRadialGradient(x, y, 10, x, y, 80 * s); g.addColorStop(0, `rgba(255,250,210,${0.5 * glow})`); g.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = g; c.fillRect(x - 80 * s, y - 80 * s, 160 * s, 160 * s); }
  P.cloud(c, x, y, s, wet ? '#eef2fa' : '#fbfcff', wet ? '#8a9ab8' : '#b8c4dc', 1);
  // a sleepy little face
  const b = Math.sin(t * 3) * 1.5; c.fillStyle = '#4a5a7a'; c.lineWidth = 2; c.strokeStyle = '#4a5a7a'; c.lineCap = 'round';
  c.beginPath(); c.arc(x - 12 * s, y - 2 * s + b, 3.4 * s, 0, 7); c.arc(x + 12 * s, y - 2 * s + b, 3.4 * s, 0, 7); c.fill();
  c.beginPath(); c.arc(x, y + 6 * s + b, 5 * s, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  P.blush(c, x - 20 * s, y + 4 * s + b, 3.4 * s); P.blush(c, x + 20 * s, y + 4 * s + b, 3.4 * s);
}
function paintBg(o) {
  P.sky(o, W, H, ['#4a9ad8', '#8ac6ea', '#d2eef2', '#fbeac0'], { x: 300, y: 84, r: 24, color: '#fff3c0', glow: 240 });
  P.hills(o, W, 430, 50, '#9ab4c8', '#8aa4bc', { seed: 21, freq: 0.01, dabs: 20, bottom: 500 });
  P.hills(o, W, 470, 36, '#b8d070', '#8ab04a', { seed: 23, freq: 0.014, dabs: 50, rim: '#eef6b0', bottom: 540 });
  P.tree(o, 30, 488, 0.5, '#6f9a52', 4); P.tree(o, 330, 492, 0.45, '#6a9450', 6); P.house(o, 250, 474, 34, 24, '#e8cba0');
  // the field: ploughed rows of earth, a patch of soil where the seed is planted
  const fg = o.createLinearGradient(0, 500, 0, H); fg.addColorStop(0, '#b0a05a'); fg.addColorStop(1, '#8a7038'); o.fillStyle = fg; o.beginPath(); o.moveTo(0, 510); o.quadraticCurveTo(180, 494, W, 512); o.lineTo(W, H); o.lineTo(0, H); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(90,64,34,0.35)'; o.lineWidth = 2; for (let i = 0; i < 8; i++) { const y = 520 + i * i * 2.2; o.beginPath(); o.moveTo(0, y); o.quadraticCurveTo(180, y - 6, W, y); o.stroke(); }
  const sg = o.createRadialGradient(GX, GY, 4, GX, GY, 50); sg.addColorStop(0, '#6a4a2a'); sg.addColorStop(1, 'rgba(106,74,42,0)'); o.fillStyle = sg; o.beginPath(); o.ellipse(GX, GY, 50, 14, 0, 0, 7); o.fill();
  P.grassTufts(o, W, 520, 640, 34, '#8aa04a', 9); P.flowers(o, W, 530, 640, 18, ['#f4d35e', '#ffffff', '#ee6c8a'], 7);
}

MG.add({
  id: 'seed', stage: 'parables', cmd: 'GROW!', hint: 'tap', time: 5, mood: 'bright', winText: 'So big!',
  card: {
    title: 'The mustard seed', ref: 'Mark 4:30–32', kind: 'Parable',
    text: 'Jesus told a story about a mustard seed, one of the smallest seeds a farmer could plant. It grows into one of the biggest plants in the garden, with branches so large that birds can make nests in its shade. Jesus said God\'s kingdom is like that: it starts very small and grows big enough to shelter many.',
    ask: 'What small kind thing could you do today that might grow into something big?',
  },
  init(g) {
    const s = g.s, L = g.level, sp = 1 + (g.speed - 1) * 0.5;
    s.per = [0.13, 0.11, 0.1][L]; s.grow = 0; s.k = 0; s.stage = 0; s.pop = -9; s.drops = []; s.rings = [];
    // clouds: level 0 has one big cloud resting over the seed; later levels drift across the sky
    s.clouds = L === 0 ? [{ x: GX, y: 150, s: 1.15, v: 0, ph: 0, wetT: -9 }]
      : Array.from({ length: L === 1 ? 2 : 3 }, (_, i) => ({ x: 60 + i * 140 + Math.random() * 30, y: 120 + (i % 2) * 70, s: [1, 0.9][L - 1], v: (i % 2 ? -1 : 1) * [0, 55, 80][L] * sp, ph: i * 2, wetT: -9 }));
    s.birds = []; s.missT = -9;
  },
  down(g, x, y) {
    const s = g.s; let hit = null, bd = 1e9;
    for (const cl of s.clouds) { const d = Math.hypot(x - cl.x, (y - cl.y) * 1.3); if (d < 70 * cl.s && d < bd) { bd = d; hit = cl; } }
    if (!hit) { s.missT = g.t; g.sfx('tap'); return; }
    hit.wetT = g.t; g.sfx('rain');
    for (let i = 0; i < 14; i++) s.drops.push({ x: hit.x + (Math.random() - 0.5) * 70 * hit.s, y: hit.y + 20, vy: 380 + Math.random() * 160, t: g.t });
    if (Math.abs(hit.x - GX) < 70) { // the shower lands on the seed
      s.grow = Math.min(1, s.grow + s.per); s.rings.push({ t: g.t + 0.25 });
      const st = Math.min(N_STAGES, Math.floor(s.grow * N_STAGES + 1e-6));
      if (st > s.stage) { s.stage = st; s.pop = g.t; g.sfx('grow'); g.burst(GX, GY - 40 - st * 40, ['#b8f0a0', '#ffe04a', '#ffffff'], 12, 140); }
      else g.sfx('drip');
      if (s.grow >= 1) { g.win(); g.sfx('cheer'); g.sfx('tweet'); for (let i = 0; i < NESTS.length; i++) s.birds.push({ i, t: g.t + i * 0.06, from: [i % 2 ? W + 30 : -30, 80 + (i * 37) % 200], col: BIRD_COLS[i % BIRD_COLS.length] }); }
    } else g.sfx('splash');
  },
  update(g, dt) {
    const s = g.s, t = g.t;
    for (const cl of s.clouds) { if (!cl.v) continue; cl.x += cl.v * dt; if (cl.x > W + 40) cl.x = -40; if (cl.x < -40) cl.x = W + 40; }
    for (const d of s.drops) d.y += d.vy * dt;
    s.drops = s.drops.filter(d => d.y < GY);
    s.k += (s.grow - s.k) * Math.min(1, dt * 8);
    if (g.result === 'win' && Math.random() < dt * 3) g.sfx('tweet');
  },
  auto(g, dt, synth) { // tap whichever cloud is over the seed
    const s = g.s; if (g.t < 0.3 || g.t - (s.botT || 0) < 0.13) return;
    const cl = s.clouds.find(q => Math.abs(q.x - GX) < 50); if (!cl) return; s.botT = g.t; synth('down', cl.x, cl.y); synth('up', cl.x, cl.y);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', k = s.k, pop = Math.max(0, 1 - (t - s.pop) / 0.35);
    c.drawImage(g.bake('parables_seed_bg', paintBg), 0, 0, W, H);
    P.rays(c, 300, 84, W, H * 0.6, '#fff4c8', 0.1 + k * 0.08, 9, t);
    // the column over the seed where rain does the most good
    if (!won) { const p = 0.5 + 0.5 * Math.sin(t * 4); const cg = c.createLinearGradient(0, 120, 0, GY); cg.addColorStop(0, 'rgba(255,250,210,0)'); cg.addColorStop(1, `rgba(255,250,210,${0.12 + 0.1 * p})`); c.fillStyle = cg; c.fillRect(GX - 50, 120, 100, GY - 120); }
    // the plant: a sprout for the first stages, then the bush grows out of it
    c.save(); c.translate(GX, GY); c.scale(1 + pop * 0.1, 1 - pop * 0.06); c.translate(-GX, -GY);
    if (k < 0.42) sprout(c, k / 0.42 * 0.5, t);
    else { if (k < 0.55) sprout(c, 0.5, t); bush(c, (k - 0.42) / 0.58, t, won ? 2 : 1); }
    c.restore();
    // nests and birds of many colours once it is full grown
    if (won) {
      const sc = 0.12 + 0.88 * Math.max(0, (k - 0.42) / 0.58);
      for (const b of s.birds) { const [nx, ny] = NESTS[b.i]; nest(c, GX + nx * sc, GY + ny * sc + 8, 1); }
      for (const b of s.birds) { const q = Math.max(0, Math.min(1, (t - b.t) / 0.45)), [nx, ny] = NESTS[b.i], tx = GX + nx * sc, ty = GY + ny * sc;
        const x = b.from[0] + (tx - b.from[0]) * q, y = b.from[1] + (ty - b.from[1]) * q - Math.sin(q * Math.PI) * 40 - (q >= 1 ? Math.abs(Math.sin(t * 8 + b.i)) * 3 : 0);
        bird(c, x, y, 1.1, b.col, t, q < 1, b.i); }
      for (let i = 0; i < 6; i++) { const q = ((t - g.doneAt) * 0.8 + i / 6) % 1; c.save(); c.globalAlpha = 1 - q; c.fillStyle = BIRD_COLS[i]; c.beginPath(); c.arc(GX - 90 + i * 36, GY - 280 - q * 40, 3, 0, 7); c.fill(); c.restore(); }
    }
    // rain
    c.strokeStyle = 'rgba(150,200,250,0.9)'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); for (const d of s.drops) { c.moveTo(d.x, d.y); c.lineTo(d.x - 2, d.y + 10); } c.stroke();
    for (const r of s.rings) { const q = (t - r.t) / 0.5; if (q < 0 || q > 1) continue; c.strokeStyle = `rgba(200,230,255,${1 - q})`; c.lineWidth = 2; c.beginPath(); c.ellipse(GX, GY, 10 + q * 40, 3 + q * 10, 0, 0, 7); c.stroke(); }
    // clouds (the one over the seed glows)
    for (const cl of s.clouds) { const over = Math.abs(cl.x - GX) < 70 && !won, wet = t - cl.wetT < 0.3, sq = wet ? 1 - (t - cl.wetT) / 0.3 : 0;
      c.save(); c.translate(cl.x, cl.y); c.scale(1 + sq * 0.12, 1 - sq * 0.1); c.translate(-cl.x, -cl.y); rainCloud(c, cl.x, cl.y + Math.sin(t * 1.5 + cl.ph) * 4, cl.s, t + cl.ph, over ? 0.6 + 0.4 * Math.sin(t * 6) : 0, wet); c.restore(); }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});
