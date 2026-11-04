// REST! — On the seventh day God rested, and blessed the day and made it holy (Genesis 2:2–3).
// A golden, sleepy garden: Eve and the animals are dozing. Don't touch anything! Tempting things wiggle and sparkle.
// Touching wakes everyone up with a funny jolt (fail). Keeping still until the end wins.
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
const EVE = { x: 150, y: 500 }, ES = 1.35;

MG.add({
  id: 'rest', stage: 'creation', cmd: 'REST!', hint: 'still', time: 4, mood: 'night', winOnTimeout: true, winText: 'Shalom!', failText: 'Whoops!',
  card: { title: 'The day of rest', ref: 'Genesis 2:1–3', kind: 'Poem', text: 'After six days of making, God rested on the seventh day. God blessed that day and made it holy, a gift of rest for every person and animal.', ask: 'What helps you feel calm and rested? When could your family take a rest day together?' },
  init(g) {
    const s = g.s; s.woke = null; s.lure = [];
    // the tempting things, timed through the game: more of them, and sooner, at higher levels
    const all = ['butterfly', 'yawn', 'sparkle', 'bunny', 'cat', 'firefly'];
    const n = [3, 4, 5][g.level], start = 0.5;
    const pick = all.slice().sort(() => Math.random() - 0.5).slice(0, n);
    pick.forEach((k, i) => s.lure.push({ k, t0: start + i * (3.0 / n) / g.speed * (g.speed > 1 ? 1 : 1) }));
    s.zz = [];
  },
  down(g, x, y) {
    const s = g.s; if (s.woke) return;
    s.woke = { t: g.t, x, y }; g.sfx('boing'); g.shake(7, 0.3); g.burst(x, y, ['#ffffff', '#ffe08a'], 10, 200); g.fail();
    setTimeout(() => {}, 0);
  },
  update(g) {
    const s = g.s, t = g.t; if (s.woke) return;
    if (Math.floor(t * 1.6) !== Math.floor((t - 1 / 60) * 1.6)) s.zz.push({ x: [EVE.x + 22, 92, 248, 228][Math.floor(t * 1.6) % 4], y: [EVE.y - 130, 488, 494, 560][Math.floor(t * 1.6) % 4], t });
    s.zz = s.zz.filter(z => t - z.t < 2.4);
  },
  auto() { /* the best move is no move at all */ },
  draw(g, c) {
    const s = g.s, t = g.t, w = s.woke, wk = w ? t - w.t : -1;
    c.drawImage(g.bake('creation_rest_bg', paintEvening), 0, 0, W, H);
    // slow drifting motes of golden light
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 24; i++) { const r = P.rng(i + 7), x = (r() * W + t * (4 + r() * 6)) % W, y = 140 + r() * 380 + Math.sin(t * 0.7 + i) * 10, a = 0.3 + 0.3 * Math.sin(t * 1.5 + i * 1.7); const gr = c.createRadialGradient(x, y, 0, x, y, 5); gr.addColorStop(0, `rgba(255,236,170,${a})`); gr.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = gr; c.fillRect(x - 5, y - 5, 10, 10); }
    c.restore();
    // breathing: everyone rises and falls together
    const br = Math.sin(t * 1.8);
    const jolt = w ? Math.max(0, 1 - wk / 0.4) : 0, hop = w ? Math.abs(Math.sin(wk * 14)) * 18 * Math.max(0, 1 - wk * 1.4) : 0;
    // animals curled up in the grass
    const lure = name => s.lure.find(l => l.k === name);
    const ly = lure('yawn'), yawnK = ly ? bump(t - ly.t0, 1.1) : 0;
    sleepySheep(c, 58, 522 - hop, 1.65, br, w, wk, yawnK, t);
    sleepyLion(c, 292, 532 - hop * 0.8, 1.6, br, w, wk, t);
    const lc = lure('cat'), catK = lc ? bump(t - lc.t0, 1.0) : 0;
    sleepyCat(c, 206, 584 - hop * 1.2, 1.5, br, w, wk, catK, t);
    // Eve resting against the fig tree's roots
    c.save(); c.translate(EVE.x, EVE.y - hop * 1.4); c.scale(ES, ES); drawEve(c, 0, 0, br, w, wk, t); c.restore();
    // the tempting things
    for (const l of s.lure) { const k = t - l.t0; if (k < 0) continue; drawLure(c, l.k, k, t, w, wk); }
    // zzz bubbles float up while all is calm; on waking they pop
    for (const z of s.zz) { const q = (t - z.t) / 2.4; let a = Math.sin(q * Math.PI) * 0.85; if (w) { const pq = wk / 0.25; if (pq > 1) continue; a *= 1 - pq; } zed(c, z.x + Math.sin(q * 6) * 8 + q * 16, z.y - q * 80, 0.8 + q * 0.9, a); }
    if (w) { // popped zzz, exclamation marks over every head
      for (const [x, y] of [[EVE.x, EVE.y - 160], [72, 470], [262, 478], [226, 540]]) { const q = eo(wk / 0.25); c.save(); c.translate(x, y - hop - q * 10); c.scale(q, q); c.rotate(Math.sin(wk * 20) * 0.15 * jolt); bangMark(c); c.restore(); }
      const q = wk / 0.5; if (q < 1) { c.strokeStyle = `rgba(255,255,255,${1 - q})`; c.lineWidth = 4; c.lineCap = 'round'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.beginPath(); c.moveTo(w.x + Math.cos(a) * (10 + q * 20), w.y + Math.sin(a) * (10 + q * 20)); c.lineTo(w.x + Math.cos(a) * (18 + q * 36), w.y + Math.sin(a) * (18 + q * 36)); c.stroke(); } }
    }
    // when the rest is complete, a soft blessing glow settles over the garden
    if (g.result === 'win') { const q = Math.min(1, (t - g.doneAt) / 0.6); c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(180, 360, 0, 180, 360, 360); gr.addColorStop(0, `rgba(255,230,170,${0.3 * q})`); gr.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.restore(); }
    P.vignette(c, W, H, 0.38, '#4a2410'); P.grain(c, W, H, 0.06);
  },
});
function bump(k, len) { if (k < 0 || k > len) return 0; return Math.sin(k / len * Math.PI); }

function paintEvening(o) {
  P.sky(o, W, H, ['#5a4a8a', '#c87a8a', '#ffb070', '#ffd890', '#ffe8b0'], { x: 250, y: 300, r: 30, color: '#ffd080', glow: 320 });
  P.rays(o, 250, 300, W, H, '#ffe0a0', 0.2, 13);
  P.stars(o, W, 120, 14, 6, 0);
  P.cloud(o, 80, 130, 0.8, '#ffd8c0', '#c87a9a', 0.9); P.cloud(o, 300, 180, 0.5, '#ffe0c8', '#d88a9a', 0.85);
  // long soft hills in the golden haze
  P.hills(o, W, 330, 50, '#d88a7a', '#c07a7a', { seed: 41, freq: 0.008, dabs: 20 });
  P.hills(o, W, 370, 34, '#b8a860', '#98904a', { seed: 43, freq: 0.01, dabs: 40, rim: '#ffe8a0' });
  const haze = o.createLinearGradient(0, 300, 0, 420); haze.addColorStop(0, 'rgba(255,220,150,0.35)'); haze.addColorStop(1, 'rgba(255,220,150,0)'); o.fillStyle = haze; o.fillRect(0, 300, W, 120);
  P.tree(o, 330, 400, 0.8, '#8a9a4a', 22); P.palm(o, 26, 420, 0.75, 0.12, 0, '#6a8a40');
  // the warm meadow
  P.hills(o, W, 420, 20, '#c8c060', '#8a9a3a', { seed: 45, freq: 0.012, dabs: 120, rim: '#fff0a0' });
  // the big fig tree that Eve leans on, lit gold from the low sun
  o.save(); o.translate(EVE.x - 8, 0);
  const tr = o.createLinearGradient(-30, 0, 30, 0); tr.addColorStop(0, '#5a3a24'); tr.addColorStop(0.65, '#9a6a3a'); tr.addColorStop(1, '#c08a4a'); o.fillStyle = tr;
  o.beginPath(); o.moveTo(-40, EVE.y - 14); o.quadraticCurveTo(-16, 400, -24, 250); o.quadraticCurveTo(-60, 200, -96, 176); o.lineTo(-84, 168); o.quadraticCurveTo(-40, 186, -10, 212); o.lineTo(4, 170); o.lineTo(18, 172); o.lineTo(14, 222); o.quadraticCurveTo(50, 190, 96, 180); o.lineTo(100, 190); o.quadraticCurveTo(40, 214, 22, 262); o.quadraticCurveTo(12, 400, 40, EVE.y - 14); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(40,20,10,0.28)'; o.lineWidth = 2; for (let i = 0; i < 4; i++) { o.beginPath(); o.moveTo(-14 + i * 7, EVE.y - 24); o.quadraticCurveTo(-8 + i * 6, 380, -14 + i * 7, 270); o.stroke(); }
  o.restore();
  const r = P.rng(3), leaves = []; for (let i = 0; i < 20; i++) { const a = r() * Math.PI, d = r(); leaves.push([EVE.x - 8 + Math.cos(a) * 150 * d * 1.1 * (r() < 0.5 ? -1 : 1), 150 - Math.sin(a) * 70 * d + r() * 30, 24 + r() * 20]); }
  for (const [x, y, rr] of leaves) { o.fillStyle = 'rgba(70,80,30,0.7)'; o.beginPath(); o.arc(x - 3, y + 6, rr, 0, 7); o.fill(); }
  for (const [x, y, rr] of leaves) { const gr = o.createRadialGradient(x + rr * 0.45, y - rr * 0.3, 2, x, y, rr); gr.addColorStop(0, '#f0e080'); gr.addColorStop(0.45, '#9ab048'); gr.addColorStop(1, '#5a7a34'); o.fillStyle = gr; o.beginPath(); o.arc(x, y, rr * 0.92, 0, 7); o.fill(); }
  // broad fig leaves around the edge
  for (let i = 0; i < 14; i++) { const a = Math.PI * (1.05 + i / 13 * 0.9), x = EVE.x - 8 + Math.cos(a) * 150, y = 176 + Math.sin(a) * 72; o.save(); o.translate(x, y); o.rotate(a + Math.PI / 2); o.fillStyle = i % 2 ? '#7a9a3a' : '#9ab04a'; o.beginPath(); o.moveTo(0, 0); o.bezierCurveTo(-12, -6, -14, -20, 0, -26); o.bezierCurveTo(14, -20, 12, -6, 0, 0); o.fill(); o.restore(); }
  for (let i = 0; i < 12; i++) { const x = EVE.x - 8 + (r() - 0.5) * 240, y = 120 + r() * 80; o.fillStyle = '#7a3a6a'; o.beginPath(); o.arc(x, y, 5, 0, 7); o.fill(); o.fillStyle = 'rgba(255,220,240,0.5)'; o.beginPath(); o.arc(x - 1.5, y - 1.5, 1.6, 0, 7); o.fill(); }
  // dappled light on the grass
  o.save(); o.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i++) { const x = r() * W, y = 430 + r() * 200; o.fillStyle = `rgba(255,220,140,${0.06 + r() * 0.08})`; o.beginPath(); o.ellipse(x, y, 10 + r() * 20, 3 + r() * 5, 0, 0, 7); o.fill(); } o.restore();
  P.grassTufts(o, W, 430, 640, 90, '#9aa040', 8); P.flowers(o, W, 440, 640, 30, ['#fff4d8', '#ffc0a0', '#ffe080', '#e0a0d0'], 11);
}

function zed(c, x, y, s, a) {
  if (a <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a;
  c.fillStyle = 'rgba(255,250,235,0.85)'; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill();
  c.strokeStyle = '#8a6ab0'; c.lineWidth = 2.6; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-4.5, -4.5); c.lineTo(4.5, -4.5); c.lineTo(-4.5, 4.5); c.lineTo(4.5, 4.5); c.stroke();
  c.restore();
}
function bangMark(c) {
  c.fillStyle = '#fff6dc'; c.strokeStyle = '#3a1640'; c.lineWidth = 3; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-6, -30); c.lineTo(6, -30); c.lineTo(3, -6); c.lineTo(-3, -6); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(0, 4, 5, 0, 7); c.fill(); c.stroke();
}
function drawEve(c, x, y, br, w, wk, t) {
  // sitting with knees up, leaning back on the tree, head tilted, eyes closed; on waking she sits bolt upright, eyes wide
  const up = w ? eo(wk / 0.15) : 0;
  const skin = P.SKIN[3], robe = P.CLOTH.green, line = P.shade(robe, -0.45);
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(60,30,10,0.25)'; c.beginPath(); c.ellipse(4, 2, 46, 9, 0, 0, 7); c.fill();
  // robe: a soft mound of legs and lap
  const g = c.createLinearGradient(-30, -60, 40, 0); g.addColorStop(0, P.shade(robe, 0.2)); g.addColorStop(1, P.shade(robe, -0.15)); c.fillStyle = g; c.strokeStyle = line; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-22, 0); c.quadraticCurveTo(-26, -40, -14, -62 - up * 6); c.lineTo(12, -62 - up * 6); c.quadraticCurveTo(14, -40, 20, -30); c.quadraticCurveTo(40, -42, 52, -24); c.quadraticCurveTo(58, -6, 50, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = P.CLOTH.cream; c.fillRect(-4, -60 - up * 6, 7, 58); c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(54, -3, 7, 4, 0, 0, 7); c.fill();
  // arms folded on the lap
  c.strokeStyle = line; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-12, -54 - up * 6); c.quadraticCurveTo(-8, -30, 18, -32); c.stroke(); c.strokeStyle = P.shade(robe, 0.08); c.lineWidth = 6.5; c.stroke();
  if (w) { c.strokeStyle = line; c.lineWidth = 9; c.beginPath(); c.moveTo(12, -54); c.lineTo(30, -84 + Math.sin(wk * 30) * 3); c.stroke(); c.strokeStyle = P.shade(robe, 0.08); c.lineWidth = 6.5; c.stroke(); c.fillStyle = skin; c.beginPath(); c.arc(30, -86 + Math.sin(wk * 30) * 3, 4.5, 0, 7); c.fill(); }
  c.fillStyle = skin; c.beginPath(); c.arc(19, -32, 4.5, 0, 7); c.fill();
  // head, tilted onto her shoulder while sleeping
  const tilt = w ? Math.sin(wk * 25) * 0.08 * Math.max(0, 1 - wk * 2) : -0.32 + br * 0.03, hy = -82 - up * 10 + (w ? 0 : br * 1.2);
  c.translate(0, hy); c.rotate(tilt);
  const hair = P.HAIR[0], R = 17;
  c.fillStyle = hair; c.beginPath(); c.moveTo(-R * 1.1, 0); c.arc(0, 0, R * 1.1, Math.PI, 0); c.lineTo(R * 1.15, R * 1.9); c.quadraticCurveTo(R * 0.8, R * 2.1, R * 0.5, R * 1.7); c.lineTo(R * 0.45, R * 0.5); c.lineTo(-R * 0.45, R * 0.5); c.lineTo(-R * 0.5, R * 1.7); c.quadraticCurveTo(-R * 0.8, R * 2.1, -R * 1.15, R * 1.9); c.closePath(); c.fill();
  const hg = c.createRadialGradient(-R * 0.35, -R * 0.4, 2, 0, 0, R * 1.1); hg.addColorStop(0, P.shade(skin, 0.12)); hg.addColorStop(1, P.shade(skin, -0.06)); c.fillStyle = hg; c.strokeStyle = P.shade(skin, -0.4); c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, 0, R, R * 0.98, 0, 0, 7); c.fill(); c.stroke();
  P.face(c, 0, -1, R, { expr: w ? 'surprised' : 'sleep' });
  c.fillStyle = hair; c.beginPath(); c.moveTo(-R - 0.5, 1); c.quadraticCurveTo(-R * 1.05, -R * 1.15, 0, -R * 1.05); c.quadraticCurveTo(R * 1.05, -R * 1.15, R + 0.5, 1); c.quadraticCurveTo(R * 0.6, -R * 0.55, R * 0.1, -R * 0.62); c.quadraticCurveTo(-R * 0.3, -R * 0.3, -R - 0.5, 1); c.fill();
  // a little flower crown
  for (let i = 0; i < 5; i++) { const a = Math.PI * (1.15 + i * 0.17); c.fillStyle = ['#ffffff', '#ffb0c8', '#ffe080', '#ffffff', '#ffb0c8'][i]; c.beginPath(); c.arc(Math.cos(a) * R * 0.98, Math.sin(a) * R * 0.98, 3.6, 0, 7); c.fill(); }
  if (w) { c.strokeStyle = '#3a1640'; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5; c.beginPath(); c.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); c.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); c.stroke(); } }
  c.restore();
}
function sleepySheep(c, x, y, s, br, w, wk, yawn, t) {
  // a sheep loaf: legs tucked away, chin on the grass
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(60,30,10,0.22)'; c.beginPath(); c.ellipse(2, 2, 28, 5, 0, 0, 7); c.fill();
  const sw = 1 + br * 0.03, up = w ? 6 : 0; c.save(); c.translate(0, -up); c.scale(1, sw);
  const wool = '#fbf3e4', puffs = [[-16, -12, 9], [-6, -16, 10], [5, -16, 10], [14, -11, 9], [-10, -6, 9], [2, -5, 10], [12, -5, 8]];
  c.fillStyle = P.shade(wool, -0.2); for (const [px, py, pr] of puffs) { c.beginPath(); c.arc(px + 1, py + 2, pr, 0, 7); c.fill(); }
  for (const [px, py, pr] of puffs) { const g = c.createRadialGradient(px - pr * 0.4, py - pr * 0.5, 1, px, py, pr); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f0dcc0'); c.fillStyle = g; c.beginPath(); c.arc(px, py, pr * 0.92, 0, 7); c.fill(); }
  c.restore();
  // head resting low
  const hx = 22, hy = (w ? -18 : -6) + yawn * -4;
  c.fillStyle = '#4a3434'; c.beginPath(); c.ellipse(hx, hy, 8, 7.5, 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(hx - 6, hy - 5, 5, 2.4, -0.4 + (w ? -0.6 : 0), 0, 7); c.fill();
  const g = c.createRadialGradient(hx - 2, hy - 9, 1, hx - 2, hy - 8, 6); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#f0dcc0'); c.fillStyle = g; c.beginPath(); c.arc(hx - 2, hy - 8, 5, 0, 7); c.fill();
  if (w) P.eye(c, hx + 2, hy - 1, 2.6);
  else { c.strokeStyle = '#f0e0d0'; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.arc(hx + 2, hy - 1, 2.2, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
  if (yawn > 0.05 && !w) { c.fillStyle = '#8a2a3a'; c.beginPath(); c.ellipse(hx + 4, hy + 4, 2.6, 3.6 * yawn + 0.5, 0, 0, 7); c.fill(); }
  if (w) { c.fillStyle = '#8a2a3a'; c.beginPath(); c.ellipse(hx + 4, hy + 4, 2.2, 3, 0, 0, 7); c.fill(); }
  P.blush(c, hx + 5, hy + 2, 2.4);
  c.restore();
}
function sleepyLion(c, x, y, s, br, w, wk, t) {
  c.save(); c.translate(x, y); c.scale(-s, s);
  c.fillStyle = 'rgba(60,30,10,0.22)'; c.beginPath(); c.ellipse(-2, 2, 32, 6, 0, 0, 7); c.fill();
  const up = w ? 8 : 0;
  // body loaf with a tail curled around
  c.strokeStyle = '#d29a52'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22, -4); c.quadraticCurveTo(-30, 2, -10, 3); c.quadraticCurveTo(4, 4, 6 + Math.sin(t * 1.5) * (w ? 6 : 1), 0); c.stroke(); c.fillStyle = '#8a4a1a'; c.beginPath(); c.arc(7 + Math.sin(t * 1.5) * (w ? 6 : 1), 0, 3.5, 0, 7); c.fill();
  c.save(); c.translate(0, -up); c.scale(1, 1 + br * 0.04);
  c.fillStyle = (() => { const g = c.createRadialGradient(-8, -18, 2, -4, -10, 24); g.addColorStop(0, '#f4c47a'); g.addColorStop(1, '#d4964a'); return g; })(); c.beginPath(); c.ellipse(-4, -10, 24, 11, 0, 0, 7); c.fill();
  c.restore();
  // paws forward, head resting on them
  c.fillStyle = '#e8b06a'; c.beginPath(); c.ellipse(24, -3, 9, 4, 0, 0, 7); c.ellipse(18, -2, 9, 4, 0, 0, 7); c.fill();
  const hx = 18, hy = w ? -24 : -14;
  const mane = '#b8541f'; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; c.fillStyle = i % 2 ? mane : P.shade(mane, 0.15); c.beginPath(); c.arc(hx + Math.cos(a) * 12, hy + Math.sin(a) * 11, 7.5, 0, 7); c.fill(); }
  c.fillStyle = (() => { const g = c.createRadialGradient(hx - 3, hy - 3, 1, hx, hy, 11); g.addColorStop(0, '#f8cc84'); g.addColorStop(1, '#e0a85a'); return g; })(); c.beginPath(); c.arc(hx, hy, 11, 0, 7); c.fill();
  c.fillStyle = '#f6dcae'; c.beginPath(); c.ellipse(hx + 2, hy + 5, 6, 4.5, 0, 0, 7); c.fill(); c.fillStyle = '#5a2a1a'; c.beginPath(); c.moveTo(hx, hy + 2); c.lineTo(hx + 5, hy + 2); c.lineTo(hx + 2.5, hy + 4.5); c.fill();
  if (w) { P.eye(c, hx - 4, hy - 3, 2.8); P.eye(c, hx + 5, hy - 3, 2.8); c.fillStyle = '#7a2a34'; c.beginPath(); c.ellipse(hx + 2.5, hy + 8, 2.5, 3, 0, 0, 7); c.fill(); }
  else { c.strokeStyle = '#3a1a10'; c.lineWidth = 1.5; c.beginPath(); c.arc(hx - 4, hy - 3, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); c.moveTo(hx + 7.5, hy - 3); c.arc(hx + 5, hy - 3, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke(); }
  P.blush(c, hx - 6, hy + 3, 2.6); P.blush(c, hx + 8, hy + 3, 2.6);
  c.restore();
}
function sleepyCat(c, x, y, s, br, w, wk, peek, t) {
  // a curled-up ball of cat; the 'cat' lure makes one ear twitch and an eye peek open (still asleep really)
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(60,30,10,0.22)'; c.beginPath(); c.ellipse(0, 2, 20, 4.5, 0, 0, 7); c.fill();
  const col = '#e08a3c', up = w ? 10 : 0;
  c.save(); c.translate(0, -up); c.scale(1 + br * 0.03, 1 + br * 0.04);
  const g = c.createRadialGradient(-4, -12, 2, 0, -8, 18); g.addColorStop(0, '#f4b06a'); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.ellipse(0, -8, 18, 10, 0, 0, 7); c.fill();
  c.strokeStyle = '#c06a2a'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-6 + i * 6, -14, 5, 1.2, 2.2); c.stroke(); }
  c.restore();
  c.strokeStyle = col; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-16, -4); c.quadraticCurveTo(-18, 6, 4, 3); c.quadraticCurveTo(14, 2, 16 + (w ? Math.sin(wk * 30) * 6 : 0), -2 - (w ? 12 : 0)); c.stroke();
  const hx = 12, hy = w ? -22 : -8;
  c.fillStyle = col; c.beginPath(); c.arc(hx, hy, 8, 0, 7); c.fill();
  const tw = Math.sin(t * 30) * 0.3 * peek; c.beginPath(); c.moveTo(hx - 6, hy - 4); c.lineTo(hx - 6 + (w ? 0 : -2), hy - 13 + tw * 8); c.lineTo(hx - 1, hy - 7); c.moveTo(hx + 1, hy - 7); c.lineTo(hx + 6, hy - 13); c.lineTo(hx + 7, hy - 4); c.fill();
  if (w) { P.eye(c, hx - 3, hy - 1, 2.2); P.eye(c, hx + 3.5, hy - 1, 2.2); }
  else { c.strokeStyle = '#3a1a10'; c.lineWidth = 1.3; c.beginPath(); c.arc(hx - 3, hy - 1, 2, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke(); if (peek > 0.4) P.eye(c, hx + 3.5, hy - 1, 1.5 * peek); else { c.beginPath(); c.arc(hx + 3.5, hy - 1, 2, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke(); } }
  P.blush(c, hx - 4, hy + 3, 1.8); P.blush(c, hx + 5, hy + 3, 1.8);
  c.restore();
}
function drawLure(c, k, q, t, w, wk) {
  if (k === 'butterfly') { // flutters down and lands on Eve's flower crown, wings opening and closing
    const land = eo(q / 1.4), x = 340 - (340 - EVE.x + 4) * land + Math.sin(q * 5) * 18 * (1 - land), y = 200 + (EVE.y - 150 - 200) * land + Math.sin(q * 7) * 12 * (1 - land);
    const fly = w ? 1 : 1 - land * 0.85, f = Math.abs(Math.sin(t * (6 + 12 * fly)));
    const fx = w ? x + wk * 200 : x, fy = w ? y - wk * 260 : y;
    c.save(); c.translate(fx, fy);
    const gl = c.createRadialGradient(0, 0, 0, 0, 0, 30); gl.addColorStop(0, 'rgba(255,220,250,0.5)'); gl.addColorStop(1, 'rgba(255,220,250,0)'); c.fillStyle = gl; c.fillRect(-30, -30, 60, 60);
    for (const sx of [-1, 1]) { c.save(); c.scale(sx * (0.25 + 0.75 * f), 1); const g = c.createRadialGradient(6, -6, 1, 6, -4, 12); g.addColorStop(0, '#ffe0f4'); g.addColorStop(0.6, '#d07ae0'); g.addColorStop(1, '#8a4ac0'); c.fillStyle = g; c.beginPath(); c.ellipse(8, -6, 9, 8, -0.5, 0, 7); c.fill(); c.beginPath(); c.ellipse(6, 6, 6, 5, 0.5, 0, 7); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(9, -7, 2, 0, 7); c.fill(); c.restore(); }
    c.fillStyle = '#3a2a3a'; c.beginPath(); c.ellipse(0, 0, 2, 8, 0, 0, 7); c.fill(); c.strokeStyle = '#3a2a3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -7); c.lineTo(-4, -13); c.moveTo(0, -7); c.lineTo(4, -13); c.stroke();
    c.restore(); return;
  }
  if (k === 'sparkle') { // a shimmering fig twinkles and beckons from the branches
    const x = 262, y = 168, pulse = 0.5 + 0.5 * Math.sin(t * 7), a = Math.min(1, q * 2);
    c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x, y, 0, x, y, 40 + pulse * 10); gl.addColorStop(0, 'rgba(255,240,180,0.8)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gl; c.fillRect(x - 50, y - 50, 100, 100); c.restore();
    c.save(); c.globalAlpha = a; c.fillStyle = '#9a4a8a'; c.beginPath(); c.arc(x, y, 8, 0, 7); c.fill(); c.fillStyle = '#fff4c0'; for (let i = 0; i < 3; i++) drawStar(c, x + Math.cos(t * 2 + i * 2.1) * 18, y + Math.sin(t * 2 + i * 2.1) * 14, 4 + pulse * 3, t * 2); c.restore(); return;
  }
  if (k === 'bunny') { // a bunny hops in and wiggles its nose right in the middle
    const k2 = Math.min(1, q / 0.8), x = -20 + 120 * eo(k2), hop = Math.abs(Math.sin(q * 9)) * 16 * (1 - k2), y = 586 - hop;
    const fx = w ? x - wk * 300 : x;
    c.save(); c.translate(fx, y); c.scale(1.3, 1.3); c.fillStyle = 'rgba(60,30,10,0.2)'; c.beginPath(); c.ellipse(0, 4 + hop, 14, 3, 0, 0, 7); c.fill();
    c.fillStyle = '#f4ece0'; c.beginPath(); c.ellipse(0, -8, 13, 10, 0, 0, 7); c.fill(); c.beginPath(); c.arc(10, -16, 8, 0, 7); c.fill();
    c.save(); c.translate(8, -22); c.rotate(-0.2 + Math.sin(t * 6) * 0.1); c.beginPath(); c.ellipse(0, -10, 3.5, 10, 0, 0, 7); c.fill(); c.fillStyle = '#ffb8c8'; c.beginPath(); c.ellipse(0, -10, 1.6, 7, 0, 0, 7); c.fill(); c.restore();
    c.fillStyle = '#f4ece0'; c.save(); c.translate(13, -22); c.rotate(0.3); c.beginPath(); c.ellipse(0, -9, 3.5, 9, 0, 0, 7); c.fill(); c.restore();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(-12, -10, 4.5, 0, 7); c.fill();
    P.eye(c, 12, -17, 1.8); c.fillStyle = '#ff8aa0'; c.beginPath(); c.arc(17.5, -15 + Math.sin(t * 20) * 0.8, 1.6, 0, 7); c.fill();
    c.restore(); return;
  }
  if (k === 'firefly') { // three glowing fireflies loop in front of everyone
    for (let i = 0; i < 3; i++) { const a = q * 2 + i * 2.1, x = 180 + Math.cos(a) * 90 + Math.sin(a * 2) * 20, y = 400 + Math.sin(a * 1.3) * 60, p = 0.5 + 0.5 * Math.sin(t * 9 + i * 2), fa = Math.min(1, q * 2) * (w ? Math.max(0, 1 - wk * 3) : 1);
      c.save(); c.globalAlpha = fa; c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x, y, 0, x, y, 18 + p * 6); gl.addColorStop(0, 'rgba(230,255,150,0.9)'); gl.addColorStop(1, 'rgba(230,255,150,0)'); c.fillStyle = gl; c.fillRect(x - 26, y - 26, 52, 52); c.restore(); }
    return;
  }
  // 'yawn' and 'cat' are drawn by the animals themselves; add a tiny sparkle so the eye goes there
  const [x, y] = k === 'yawn' ? [108, 488] : [236, 548], k2 = bump(q, 1.1);
  if (k2 > 0.05 && !w) { c.save(); c.globalAlpha = k2; c.fillStyle = '#fff6c8'; drawStar(c, x, y, 5 + k2 * 4, t * 3); c.restore(); }
}
