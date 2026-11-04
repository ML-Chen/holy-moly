// GATHER! — manna falls at dawn; catch just enough to fill the basket to the glowing band, then stop (Exodus 16:13–21).
const BKY = 540;            // basket bottom
const HEAP = 110;            // heap height in px at fill = 1
MG.add({
  id: 'gather', stage: 'exodus', cmd: 'GATHER!', hint: 'drag', time: 6, mood: 'desert', winText: 'Enough!', failText: 'Yuck!',
  card: { title: 'Bread from heaven', ref: 'Exodus 16', kind: 'Ancient story', text: 'The book of Exodus tells how God sent flakes of food called manna to the people in the desert every morning. Each family gathered what it needed, and there was always enough. Food they tried to save for the next day went bad.', ask: 'What do you have more than enough of? How could your family share some of it?' },
  init(g) {
    const s = g.s, L = g.level;
    s.band = [[0.48, 0.88], [0.56, 0.84], [0.62, 0.82]][L];
    s.per = [0.105, 0.095, 0.09][L];
    s.hold = [0.6, 0.75, 0.85][L] / Math.sqrt(g.speed); s.inT = 0;
    s.fill = 0; s.shown = 0; s.x = 50; s.tx = 50; s.grab = null; // the basket starts off to the side, out of the falling manna
    s.rate = [5.2, 5.8, 6.4][L] * g.speed; s.vy = 250 * Math.sqrt(g.speed); s.acc = 0.9;
    s.flakes = []; s.pops = []; s.rot = false; s.rotT = 0; s.okT = -1;
  },
  down(g, x) { const s = g.s; s.grab = x - s.x; },
  move(g, x) { const s = g.s; if (s.grab !== null) s.tx = Math.max(50, Math.min(310, x - s.grab)); },
  up(g) { g.s.grab = null; },
  update(g, dt) {
    const s = g.s; s.x += (s.tx - s.x) * Math.min(1, dt * 18);
    s.shown += (s.fill - s.shown) * Math.min(1, dt * 10);
    // flakes drift down like snow, sparkling
    if (!g.done) { s.acc += dt * s.rate; while (s.acc >= 1) { s.acc -= 1; s.flakes.push({ x: 112 + Math.random() * 200, y: (g.t < 0.2 ? 120 + Math.random() * 120 : -20 - Math.random() * 40), ph: Math.random() * 6, r: 8 + Math.random() * 3 }); } }
    const rimY = BKY - 44, heapTop = rimY - s.shown * HEAP;
    for (const f of s.flakes) {
      f.y += s.vy * dt; f.x += Math.sin(g.t * 3 + f.ph) * 20 * dt;
      if (!f.gone && !g.done && f.y > heapTop - 6 && f.y < rimY + 6 && Math.abs(f.x - s.x) < 44) {
        f.gone = true; s.fill += s.per; s.pops.push({ x: f.x, y: f.y, t: g.t }); g.sfx('pop');
        if (s.fill > s.band[1] + 0.001) { s.rot = true; s.rotT = g.t; g.sfx('buzz'); g.sfx('boing'); g.fail(); }
        else if (s.fill >= s.band[0]) { g.sfx('chime'); }
      }
    }
    s.flakes = s.flakes.filter(f => !f.gone && f.y < 660);
    s.pops = s.pops.filter(p => g.t - p.t < 0.5);
    if (g.done) return;
    const inBand = s.fill >= s.band[0] && s.fill <= s.band[1];
    s.inT = inBand ? s.inT + dt : 0;
    if (inBand && (s.inT >= s.hold || g.t > g.dur - 0.08)) { s.okT = g.t; g.win(); g.sfx('sparkle'); g.burst(s.x, rimY - s.fill * HEAP, ['#fff6d0', '#ffd45a', '#ffffff'], 22, 170); }
  },
  auto(g, dt, synth) { // test bot: catch flakes until inside the band, then dodge them
    const s = g.s; if (g.t < 0.3) return; if (s.grab === null) synth('down', s.x, BKY - 20);
    const rimY = BKY - 44; let aim = s.x;
    if (s.fill < s.band[0]) { let best = null; for (const f of s.flakes) { if (f.y > rimY - 10) continue; const tt = (rimY - f.y) / s.vy, reach = Math.abs(f.x - s.x) / 500; if (reach < tt + 0.05 && (!best || f.y > best.y)) best = f; } if (best) aim = best.x; }
    else { let bestX = s.x, bestD = -1; for (let x = 60; x <= 300; x += 12) { let d = 1e9; for (const f of s.flakes) if (f.y > 150 && f.y < rimY + 4) d = Math.min(d, Math.abs(f.x - x)); d -= Math.abs(x - s.x) * 0.05; if (d > bestD) { bestD = d; bestX = x; } } aim = bestX; }
    synth('move', aim + (s.grab || 0), BKY - 20);
  },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('exodus_gather_bg', paintCamp), 0, 0, W, H);
    // gentle sun shimmer and drifting mist
    P.rays(c, 250, 300, W, H, '#fff0c8', 0.1, 9, t);
    c.save(); c.globalAlpha = 0.35; for (let i = 0; i < 3; i++) { const mx = ((t * 8 + i * 140) % 520) - 80; const mg = c.createRadialGradient(mx, 400 + i * 14, 4, mx, 400 + i * 14, 90); mg.addColorStop(0, 'rgba(255,240,240,0.8)'); mg.addColorStop(1, 'rgba(255,240,240,0)'); c.fillStyle = mg; c.fillRect(mx - 90, 310 + i * 14, 180, 180); } c.restore();
    // neighbours gathering in the background
    const bend = (k) => Math.sin(t * 2.4 + k) > 0 ? 'reach' : 'hold';
    P.person(c, 58, 432, 0.72, { skin: P.SKIN[2], robe: P.CLOTH.rose, stripe: P.CLOTH.cream, hairStyle: 'bun', hair: P.HAIR[2], expr: 'happy', arms: bend(0), t, phase: 1, hold: (cc, x, y) => P.basket(cc, x, y + 6, 0.5, 'none') });
    P.person(c, 300, 436, 0.72, { skin: P.SKIN[3], robe: P.CLOTH.olive, stripe: P.CLOTH.cream, beard: true, hair: P.HAIR[5], head: 'wrap', expr: 'happy', arms: bend(2), t, phase: 2, facing: -1, hold: (cc, x, y) => P.basket(cc, x, y + 6, 0.5, 'none') });
    P.person(c, 262, 446, 0.6, { skin: P.SKIN[1], robe: P.CLOTH.sky, stripe: P.CLOTH.white, hairStyle: 'curly', hair: P.HAIR[0], expr: 'laugh', arms: 'cheer', child: true, t, phase: 3, facing: -1 });
    // falling manna
    c.save(); if (g.done) c.globalAlpha = Math.max(0, 1 - (t - g.doneAt) * 2.5); for (const f of s.flakes) drawFlake(c, f.x, f.y, f.r, t + f.ph); c.restore();
    // the gatherer: a girl holding her basket out
    const fail = g.result === 'fail', win = g.result === 'win';
    const side = Math.max(-1, Math.min(1, (250 - s.x) / 40));
    P.person(c, s.x + 50 * side, 600, 1.15, { skin: P.SKIN[2], robe: P.CLOTH.terracotta, stripe: P.CLOTH.saffron, hairStyle: 'long', hair: P.HAIR[1], expr: fail ? 'grumpy' : win ? 'laugh' : 'happy', arms: win ? 'cheer' : fail ? 'pray' : 'reach', t, facing: side >= 0 ? -1 : 1 });
    if (fail) { const hx = s.x + 50 * side, hy = 600 - 56 * 1.15; c.strokeStyle = 'rgba(130,170,50,0.9)'; c.lineWidth = 2.5; c.lineCap = 'round'; for (const k of [-1, 1]) { c.beginPath(); c.arc(hx + k * 26, hy - 6, 6, k > 0 ? -1 : 2.1, k > 0 ? 1 : 4.2); c.stroke(); } }
    drawGatherBasket(c, s, t, g);
    for (const p of s.pops) { const q = (t - p.t) / 0.5; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#fffbe8'; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 4 + q * 14, 0, 7); c.stroke(); c.restore(); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});

function drawFlake(c, x, y, r, t) {
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2) * 0.6);
  const gl = c.createRadialGradient(0, 0, 0, 0, 0, r * 2.6); gl.addColorStop(0, 'rgba(255,250,225,0.75)'); gl.addColorStop(1, 'rgba(255,250,225,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, 0, r * 2.6, 0, 7); c.fill();
  const fg = c.createRadialGradient(-r * 0.3, -r * 0.3, 0.5, 0, 0, r); fg.addColorStop(0, '#ffffff'); fg.addColorStop(1, '#efe2bf'); c.fillStyle = fg; c.strokeStyle = 'rgba(190,160,110,0.6)'; c.lineWidth = 1;
  c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = r * (i % 2 ? 0.75 : 1); c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * 0.7); } c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(-r * 0.25, -r * 0.2, r * 0.25, 0, 7); c.fill();
  c.restore();
}
function drawGatherBasket(c, s, t, g) {
  const x = s.x, rimY = BKY - 44, fill = s.shown, rot = s.rot, rk = rot ? Math.min(1, (t - s.rotT) * 3) : 0;
  const [lo, hi] = s.band, inBand = s.fill >= lo && s.fill <= hi;
  // the glowing target band floating above the basket
  const yLo = rimY - lo * HEAP, yHi = rimY - hi * HEAP, p = 0.5 + 0.5 * Math.sin(t * 5);
  // the target: a glowing ghost mound between "enough" (lo) and "too much" (hi)
  const dome = (hh, w = 44) => { c.moveTo(x - w, rimY); c.bezierCurveTo(x - w + 4, rimY - hh * 0.9, x - 20, rimY - hh, x, rimY - hh); c.bezierCurveTo(x + 20, rimY - hh, x + w - 4, rimY - hh * 0.9, x + w, rimY); };
  if (!rot) {
    c.save();
    const a = inBand ? 0.65 : 0.34 + 0.16 * p;
    c.beginPath(); dome(hi * HEAP, 48); c.lineTo(x - 48, rimY); dome(lo * HEAP, 40); c.closePath();
    const bg = c.createLinearGradient(0, yHi, 0, rimY); bg.addColorStop(0, `rgba(255,238,160,${a})`); bg.addColorStop(1, `rgba(255,224,130,${a * 0.5})`); c.fillStyle = bg; c.fill('evenodd');
    c.shadowColor = '#ffe08a'; c.shadowBlur = 14; c.lineWidth = 3; c.setLineDash([7, 5]); c.lineDashOffset = -t * 20;
    c.strokeStyle = `rgba(255,252,225,${0.8 + 0.2 * p})`; c.beginPath(); dome(lo * HEAP, 40); c.stroke();
    c.strokeStyle = `rgba(255,190,120,${0.55 + 0.2 * p})`; c.beginPath(); dome(hi * HEAP, 48); c.stroke();
    c.setLineDash([]); c.shadowBlur = 0;
    if (g.result === 'win') { const q = Math.min(1, (t - g.doneAt) * 2); c.globalAlpha = 1 - q; c.strokeStyle = '#fff6c8'; c.lineWidth = 5; c.beginPath(); dome((lo + hi) / 2 * HEAP + q * 40, 46 + q * 30); c.stroke(); }
    c.restore();
  }
  // basket back rim
  c.fillStyle = '#7a4a1e'; c.beginPath(); c.ellipse(x, rimY, 46, 10, 0, 0, 7); c.fill();
  // the heap of manna (or the rotten, wormy heap)
  if (fill > 0.01) {
    const h = fill * HEAP, col1 = rot ? P.mix('#fffbe8', '#a8b45a', rk) : '#fffbe8', col2 = rot ? P.mix('#e8d6a8', '#6a7a3a', rk) : '#e8d6a8';
    const hg = c.createLinearGradient(0, rimY - h, 0, rimY); hg.addColorStop(0, col1); hg.addColorStop(1, col2); c.fillStyle = hg; c.strokeStyle = rot ? P.mix('#c8b080', '#4a5a2a', rk) : '#c8b080'; c.lineWidth = 1.5;
    c.beginPath(); dome(h, 44); c.closePath(); c.fill(); c.stroke();
    // flakes texture
    const r = P.rng(5); c.fillStyle = rot ? P.rgba('#5a6a2a', 0.5 * rk + 0.2) : 'rgba(255,255,255,0.85)';
    for (let i = 0; i < Math.floor(fill * 40); i++) { const u = r() * 2 - 1, v = r(); const yy = rimY - v * h * (1 - u * u * 0.8); c.beginPath(); c.ellipse(x + u * 38, yy, 3, 2, r() * 3, 0, 7); c.fill(); }
    if (inBand && !g.done) { const k = Math.min(1, s.inT / s.hold); c.save(); c.strokeStyle = '#ffd45a'; c.lineWidth = 4; c.lineCap = 'round'; c.shadowColor = '#ffe08a'; c.shadowBlur = 10; c.beginPath(); c.arc(x, rimY - h - 18, 10, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); c.stroke(); c.restore(); }
    if (!rot) { const sh = c.createRadialGradient(x - 12, rimY - h * 0.8, 1, x - 12, rimY - h * 0.8, 18); sh.addColorStop(0, 'rgba(255,255,255,0.8)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sh; c.beginPath(); c.arc(x - 12, rimY - h * 0.8, 18, 0, 7); c.fill(); }
  }
  // basket front
  const bg = c.createLinearGradient(0, rimY, 0, BKY); bg.addColorStop(0, '#e2b06a'); bg.addColorStop(1, '#9a6a34'); c.fillStyle = bg; c.strokeStyle = '#5a3818'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(x - 46, rimY); c.quadraticCurveTo(x - 44, BKY - 4, x - 30, BKY); c.lineTo(x + 30, BKY); c.quadraticCurveTo(x + 44, BKY - 4, x + 46, rimY); c.closePath(); c.fill(); c.stroke();
  c.save(); c.clip(); c.strokeStyle = 'rgba(90,56,24,0.5)'; c.lineWidth = 1.2; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(x - 50, rimY + i * 9); c.quadraticCurveTo(x, rimY + i * 9 + 5, x + 50, rimY + i * 9); c.stroke(); } for (let k = -40; k <= 40; k += 8) { c.beginPath(); c.moveTo(x + k, rimY); c.lineTo(x + k * 0.7, BKY); c.stroke(); } c.restore();
  c.strokeStyle = '#f2cc88'; c.lineWidth = 4; c.beginPath(); c.ellipse(x, rimY, 46, 10, 0, 0.05, Math.PI - 0.05); c.stroke();
  c.strokeStyle = '#3f8f8a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 44, rimY + 16); c.quadraticCurveTo(x, rimY + 22, x + 44, rimY + 16); c.stroke();
  // rot: worms wiggle out and smelly squiggles rise, with a buzzing fly
  if (rot) {
    const h = fill * HEAP;
    for (let i = 0; i < 4; i++) { const wx = x - 30 + i * 20, wy = rimY - h * (i % 3 === 0 ? 0.55 : 0.85) + 4, up = Math.min(1, rk * 1.5) * 14; c.save(); c.translate(wx, wy); c.strokeStyle = '#f08aa8'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); for (let k = 1; k <= 4; k++) c.lineTo(Math.sin(t * 12 + i + k) * 3, -k * up / 4); c.stroke(); c.fillStyle = '#f6a8c0'; c.beginPath(); c.arc(Math.sin(t * 12 + i + 4) * 3, -up, 3.5, 0, 7); c.fill(); P.eye(c, Math.sin(t * 12 + i + 4) * 3 - 1, -up - 1, 1.1); c.restore(); }
    c.strokeStyle = 'rgba(130,170,50,0.9)'; c.lineWidth = 4.5; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const a = ((t - s.rotT) * 0.9 + i / 3) % 1, sx = x - 28 + i * 28; c.globalAlpha = Math.min(1, (1 - a) * 2); c.beginPath(); for (let k = 0; k <= 12; k++) { const yy = rimY - h - 6 - a * 40 - k * 4; c.lineTo(sx + Math.sin(k * 0.8 + t * 6 + i) * 7, yy); } c.stroke(); }
    c.globalAlpha = 1;
    const fx = x + Math.cos(t * 7) * 36, fy = rimY - h - 30 + Math.sin(t * 11) * 14; c.fillStyle = '#2a2a3a'; c.beginPath(); c.arc(fx, fy, 3.5, 0, 7); c.fill(); c.fillStyle = 'rgba(220,240,255,0.8)'; c.beginPath(); c.ellipse(fx - 2, fy - 4, 3, 1.5 + Math.abs(Math.sin(t * 50)) * 1.5, -0.5, 0, 7); c.ellipse(fx + 2, fy - 4, 3, 1.5 + Math.abs(Math.sin(t * 50)) * 1.5, 0.5, 0, 7); c.fill();
  }
}
// the camp in the wilderness at dawn: goat-hair tents, dew on the ground, quail pecking
function paintCamp(o) {
  P.sky(o, W, H, ['#4a5aa0', '#b88ab0', '#f6b49a', '#ffe4b0'], { x: 250, y: 300, r: 30, color: '#ffe0a0', glow: 280 });
  P.stars(o, W, 160, 40, 21, 0);
  P.cloud(o, 80, 170, 0.75, '#fff0e8', '#d898b0', 0.8); P.cloud(o, 300, 120, 0.5, '#fff0e8', '#d898b0', 0.7);
  P.hills(o, W, 330, 46, '#c08a9a', '#9a7090', { seed: 41, freq: 0.01, dabs: 20 });
  P.hills(o, W, 372, 26, '#e0aa8a', '#c08a70', { seed: 43, freq: 0.016, dabs: 40, rim: '#ffe0b8' });
  // tents across the middle distance
  const tent = (x, y, w, h, col, lit) => {
    o.fillStyle = 'rgba(80,40,50,0.25)'; o.beginPath(); o.ellipse(x + w * 0.1, y + 2, w * 0.6, 5, 0, 0, 7); o.fill();
    const tg = o.createLinearGradient(x - w / 2, y - h, x + w / 2, y); tg.addColorStop(0, P.shade(col, 0.15)); tg.addColorStop(1, P.shade(col, -0.25)); o.fillStyle = tg;
    o.beginPath(); o.moveTo(x - w / 2, y); o.lineTo(x - w * 0.35, y - h * 0.85); o.quadraticCurveTo(x - w * 0.15, y - h * 1.05, x, y - h); o.quadraticCurveTo(x + w * 0.15, y - h * 1.05, x + w * 0.35, y - h * 0.85); o.lineTo(x + w / 2, y); o.closePath(); o.fill();
    o.strokeStyle = P.rgba(P.shade(col, 0.4), 0.5); o.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { o.beginPath(); o.moveTo(x + k * w * 0.16, y - h * 0.95); o.lineTo(x + k * w * 0.2, y); o.stroke(); }
    o.fillStyle = lit ? '#ffcf7a' : '#3a2420'; o.beginPath(); o.moveTo(x - w * 0.1, y); o.lineTo(x, y - h * 0.55); o.lineTo(x + w * 0.1, y); o.closePath(); o.fill();
    o.strokeStyle = '#6a4a3a'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(x - w * 0.35, y - h * 0.85); o.lineTo(x - w * 0.62, y + 2); o.moveTo(x + w * 0.35, y - h * 0.85); o.lineTo(x + w * 0.62, y + 2); o.stroke();
  };
  tent(40, 384, 60, 32, '#6a5a5a', false); tent(118, 380, 50, 26, '#8a6a58', true); tent(212, 384, 66, 34, '#5a4a4a', true); tent(300, 382, 54, 28, '#7a6250', false);
  tent(80, 404, 70, 38, '#6a5048', true); tent(330, 410, 64, 34, '#5a4a48', true);
  // cookfire smoke
  o.strokeStyle = 'rgba(255,240,230,0.35)'; o.lineWidth = 3; o.beginPath(); for (let k = 0; k < 20; k++) o.lineTo(160 + Math.sin(k * 0.6) * 6, 380 - k * 6); o.stroke();
  // the ground: sand glittering with dew
  const gr = o.createLinearGradient(0, 400, 0, H); gr.addColorStop(0, '#ebc89a'); gr.addColorStop(1, '#c9935e'); o.fillStyle = gr; o.beginPath(); o.moveTo(0, 418); o.quadraticCurveTo(180, 400, W, 420); o.lineTo(W, H); o.lineTo(0, H); o.closePath(); o.fill();
  const r = P.rng(77);
  for (let i = 0; i < 70; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff0d0' : '#a8703a', 0.2); o.beginPath(); o.ellipse(r() * W, 420 + r() * 220, 6 + r() * 12, 1.5 + r() * 3, 0, 0, 7); o.fill(); }
  for (let i = 0; i < 25; i++) { const x = r() * W, y = 425 + r() * 200; o.fillStyle = 'rgba(255,255,245,0.6)'; o.beginPath(); o.arc(x, y, 1 + r() * 1.4, 0, 7); o.fill(); }
  // a few manna flakes already lying on the ground like frost
  for (let i = 0; i < 14; i++) { const x = r() * W, y = 440 + r() * 180; o.fillStyle = 'rgba(255,252,236,0.75)'; o.beginPath(); o.ellipse(x, y, 3, 1.8, r() * 3, 0, 7); o.fill(); }
  // quail pecking in the sand
  const quail = (x, y, f) => { o.save(); o.translate(x, y); o.scale(f, 1); o.fillStyle = 'rgba(60,30,30,0.2)'; o.beginPath(); o.ellipse(0, 1, 9, 2.5, 0, 0, 7); o.fill(); const qg = o.createRadialGradient(-2, -7, 1, 0, -5, 10); qg.addColorStop(0, '#c8a070'); qg.addColorStop(1, '#8a6038'); o.fillStyle = qg; o.beginPath(); o.ellipse(0, -5, 9, 6, 0, 0, 7); o.fill(); o.beginPath(); o.arc(7, -10, 4, 0, 7); o.fill(); o.fillStyle = '#3a2418'; o.beginPath(); o.moveTo(6, -14); o.quadraticCurveTo(4, -19, 8, -18); o.lineWidth = 1; o.strokeStyle = '#3a2418'; o.stroke(); o.fillStyle = '#e8a040'; o.beginPath(); o.moveTo(11, -10); o.lineTo(13.5, -9); o.lineTo(11, -8.5); o.fill(); P.eye(o, 8, -11, 1.2); o.fillStyle = 'rgba(255,255,255,0.5)'; for (let k = 0; k < 3; k++) { o.beginPath(); o.arc(-4 + k * 3, -5, 0.9, 0, 7); o.fill(); } o.restore(); };
  quail(30, 470, 1); quail(52, 478, -1); quail(330, 490, -1); quail(176, 452, 1);
  P.grassTufts(o, W, 430, 630, 18, '#a8a050', 13);
  P.rock(o, 340, 600, 0.8, '#b8906a');
}
