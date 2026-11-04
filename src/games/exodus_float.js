// FLOAT! — baby Moses's basket drifts down the Nile; steer it between the reeds and lily pads to Pharaoh's daughter (Exodus 2:1–10).
const BY = 486;               // the basket's screen height; the river scrolls past it
const RL = 40, RR = 320;      // river edges
MG.add({
  id: 'float', stage: 'exodus', cmd: 'FLOAT!', hint: 'drag', time: 5.5, mood: 'sea', winText: 'Found!',
  card: { title: 'A basket in the reeds', ref: 'Exodus 2:1–10', kind: 'Ancient story', text: 'The book of Exodus tells how a Hebrew mother hid her baby in a basket among the reeds of the Nile, while his sister watched. Pharaoh\'s daughter found the crying baby and felt sorry for him. She adopted him and named him Moses.', ask: 'Pharaoh\'s daughter helped a baby from another people. How can you welcome someone new?' },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level], gap = [134, 118, 104][g.level];
    s.D = 1380 + g.level * 160; s.v = s.D / (g.dur * 0.7); s.dist = 0;
    s.x = 180; s.tx = 180; s.drag = false; s.bumps = 0; s.maxBumps = [3, 2, 2][g.level]; s.stuck = 0; s.wob = 0; s.arrived = false; s.arriveT = 0;
    const first = 520, span = s.D - 230 - first, side0 = Math.random() < 0.5 ? -1 : 1;
    s.rows = Array.from({ length: n }, (_, i) => {
      const side = i % 2 ? -side0 : side0; // which bank the clump grows from
      const x0 = side < 0 ? RL : RL + gap, x1 = side < 0 ? RR - gap : RR;
      return { wy: first + (n > 1 ? span * i / (n - 1) : 0), x0, x1, side, kind: i % 2 ? 'lily' : 'reeds', hit: false, hitT: -9, seed: 7 + i * 13 };
    });
    s.ripples = []; s.hearts = [];
  },
  down(g, x) { g.s.drag = true; g.s.tx = Math.max(RL + 24, Math.min(RR - 24, x)); },
  move(g, x) { if (g.s.drag) g.s.tx = Math.max(RL + 24, Math.min(RR - 24, x)); },
  up(g) { g.s.drag = false; },
  update(g, dt) {
    const s = g.s;
    if (g.result === 'fail') { s.wob *= Math.pow(0.1, dt); return; }
    if (s.stuck > 0) s.stuck -= dt; else if (!s.arrived) s.dist += s.v * dt;
    s.x += (s.tx - s.x) * Math.min(1, dt * 14);
    s.wob *= Math.pow(0.02, dt);
    if (Math.random() < dt * 8) s.ripples.push({ x: s.x + (Math.random() - 0.5) * 30, wy: s.dist - 10, t: g.t });
    s.ripples = s.ripples.filter(r => g.t - r.t < 1.2);
    for (const r of s.rows) {
      if (r.hit) continue; const sy = BY - (r.wy - s.dist);
      if (Math.abs(sy - BY) < 20 && s.x > r.x0 - 26 && s.x < r.x1 + 26) {
        r.hit = true; r.hitT = g.t; s.bumps++; s.wob = 1; g.sfx('boing'); g.sfx('laugh'); g.shake(4, 0.2);
        g.burst(s.x, BY - 10, ['#bfefff', '#ffffff', '#9ad07a'], 10, 120);
        if (s.bumps >= s.maxBumps) { g.fail(); return; }
        s.stuck = 0.25; s.x = s.tx = r.side < 0 ? Math.min(RR - 28, r.x1 + 34) : Math.max(RL + 28, r.x0 - 34);
      }
    }
    if (!s.arrived && s.dist >= s.D) { s.arrived = true; s.arriveT = g.t; g.sfx('coo'); g.sfx('harp'); g.burst(s.x, BY - 30, ['#ffd45a', '#ff9ab8', '#ffffff'], 18, 160); g.win(); }
  },
  auto(g, dt, synth) { // test bot: aim at the middle of the next gap
    const s = g.s; if (g.t < 0.3) return;
    if (!s.drag) synth('down', s.x, BY);
    const next = s.rows.find(r => !r.hit && r.wy > s.dist - 10);
    const aim = next ? (next.side < 0 ? (next.x1 + RR) / 2 : (RL + next.x0) / 2) : 180;
    synth('move', aim, BY);
  },
  draw(g, c) {
    const s = g.s, t = g.t, d = s.dist;
    c.drawImage(g.bake('exodus_float_water', paintWater), 0, 0, W, H);
    // light ripples flowing past with the current
    c.save(); c.beginPath(); c.rect(RL - 10, 0, RR - RL + 20, H); c.clip();
    c.globalCompositeOperation = 'screen';
    const cau = g.bake('exodus_float_caustic', paintCaustic, W, 400), off = (d * 0.92) % 400; c.globalAlpha = 0.35;
    c.drawImage(cau, 0, off - 400, W, 400); c.drawImage(cau, 0, off, W, 400); c.drawImage(cau, 0, off + 400, W, 400); c.globalAlpha = 1;
    for (let i = 0; i < 16; i++) { const yy = ((i * 47 + d * 1.0) % 760) - 60, xx = RL + 20 + ((i * 97) % (RR - RL - 40)); c.strokeStyle = `rgba(200,255,240,${0.16 + 0.08 * Math.sin(t * 2 + i)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(xx - 22, yy); c.quadraticCurveTo(xx, yy + 5 + Math.sin(t * 3 + i) * 2, xx + 22, yy); c.stroke(); }
    for (let i = 0; i < 26; i++) { const yy = ((i * 61 + d) % 700) - 30, xx = RL + 10 + ((i * 53) % (RR - RL - 20)), k = Math.max(0, Math.sin(t * 4 + i * 1.9)); if (k > 0.55) { c.fillStyle = `rgba(255,248,214,${(k - 0.55) * 1.6})`; c.fillRect(xx - 4, yy, 8, 1.4); c.fillRect(xx - 0.7, yy - 3, 1.4, 6); } }
    c.restore();
    // the basket's wake
    for (const r of s.ripples) { const q = (t - r.t) / 1.2, sy = BY - (r.wy - d) + 14; c.strokeStyle = `rgba(230,255,250,${0.5 * (1 - q)})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(r.x, sy, 10 + q * 26, 3 + q * 7, 0, 0, 7); c.stroke(); }
    // banks scroll by
    drawBanks(c, d, t);
    // the landing where the princess waits
    drawLanding(c, BY - 44 - (s.D - d), t, g, s);
    // reed clumps and lily pads
    for (const r of s.rows) { const sy = BY - (r.wy - d); if (sy < -80 || sy > H + 80) continue; drawObstacle(c, r, sy, t); }
    // the basket
    const fail = g.result === 'fail';
    const wob = Math.sin(t * 22) * 0.25 * s.wob + (fail ? Math.sin(t * 10) * 0.12 : Math.sin(t * 2.2) * 0.05);
    drawBasket(c, s.x, BY + Math.sin(t * 2.6) * 2, wob, t, fail ? 'laugh' : s.arrived ? 'laugh' : s.wob > 0.3 ? 'wow' : 'happy');
    if (fail) { // stuck and giggling: reeds caught around it
      c.strokeStyle = '#6a9a3a'; c.lineWidth = 3; c.lineCap = 'round'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(s.x + i * 12, BY + 18); c.quadraticCurveTo(s.x + i * 16, BY - 12, s.x + i * 18 + Math.sin(t * 3 + i) * 3, BY - 34); c.stroke(); }
      c.strokeStyle = 'rgba(255,250,235,0.95)'; c.lineWidth = 2.2; for (let i = 0; i < 3; i++) { const a = (t * 1.8 + i / 3) % 1; c.globalAlpha = 1 - a; c.beginPath(); c.arc(s.x + 30 + a * 14, BY - 30 - a * 26 + i * 4, 5, -0.9, 0.9); c.stroke(); } c.globalAlpha = 1;
    }
    if (s.arrived) { const k = t - s.arriveT; for (let i = 0; i < 4; i++) { const a = (k * 0.9 + i * 0.25) % 1; c.save(); c.globalAlpha = 1 - a; c.fillStyle = i % 2 ? '#ff7aa0' : '#ffb0c8'; heartShape(c, s.x - 30 + i * 20, BY - 40 - a * 60, 6 + a * 3); c.restore(); } }
    // soft morning light from the top right
    c.save(); c.globalCompositeOperation = 'screen'; const lg = c.createRadialGradient(330, -40, 10, 330, -40, 520); lg.addColorStop(0, 'rgba(255,226,170,0.45)'); lg.addColorStop(0.5, 'rgba(255,226,170,0.1)'); lg.addColorStop(1, 'rgba(255,226,170,0)'); c.fillStyle = lg; c.fillRect(0, 0, W, H); c.restore();
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});

function heartShape(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5); c.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
function paintCaustic(o) {
  // a tileable net of soft light cells, like sun dancing on the riverbed
  const r = P.rng(23), pts = [];
  for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 7; gx++) pts.push([gx * 56 + 28 + (r() - 0.5) * 30, gy * 50 + 25 + (r() - 0.5) * 26, 16 + r() * 8]);
  o.filter = 'blur(2.2px)'; o.lineJoin = 'round';
  for (const [x, y, rad] of pts) for (const dy of [-400, 0, 400]) {
    o.strokeStyle = 'rgba(200,255,240,0.42)'; o.lineWidth = 1.8; o.beginPath();
    const P2 = []; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, rr = rad * (0.75 + 0.25 * Math.sin(a * 2 + x * 0.1) + 0.15 * Math.sin(a * 5 + y)); P2.push([x + Math.cos(a) * rr * 1.25, y + dy + Math.sin(a) * rr]); }
    for (let k = 0; k <= 9; k++) { const p0 = P2[k % 9], p1 = P2[(k + 1) % 9], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; k ? o.quadraticCurveTo(p0[0], p0[1], mx, my) : o.moveTo(mx, my); }
    o.closePath(); o.stroke();
  }
  o.filter = 'none';
}
function paintWater(o) {
  // deep green-teal Nile seen from above, lighter where the morning sun touches it
  const g = o.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#6ad0c0'); g.addColorStop(0.45, '#2f9a98'); g.addColorStop(1, '#1a5a70'); o.fillStyle = g; o.fillRect(0, 0, W, H);
  const sun = o.createRadialGradient(250, 120, 10, 250, 120, 300); sun.addColorStop(0, 'rgba(255,240,190,0.4)'); sun.addColorStop(1, 'rgba(255,240,190,0)'); o.fillStyle = sun; o.fillRect(0, 0, W, H);
  const mid = o.createLinearGradient(RL, 0, RR, 0); mid.addColorStop(0, 'rgba(20,60,60,0.35)'); mid.addColorStop(0.5, 'rgba(120,220,210,0.18)'); mid.addColorStop(1, 'rgba(20,60,60,0.35)'); o.fillStyle = mid; o.fillRect(0, 0, W, H);
  const r = P.rng(17); for (let i = 0; i < 120; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#8fe0d0' : '#1a5060', 0.08 + r() * 0.06); o.beginPath(); o.ellipse(r() * W, r() * H, 10 + r() * 24, 2 + r() * 3, 0, 0, 7); o.fill(); }
}
// muddy green banks with papyrus, palms and a heron, scrolling with the river
function drawBanks(c, d, t) {
  for (const side of [-1, 1]) {
    const edge = y => (side < 0 ? RL - 6 : RR + 6) + side * (Math.sin((y - d) * 0.018) * 6 + Math.sin((y - d) * 0.051) * 3);
    c.beginPath(); c.moveTo(side < 0 ? 0 : W, -10); for (let y = -10; y <= H + 10; y += 10) c.lineTo(edge(y), y); c.lineTo(side < 0 ? 0 : W, H + 10); c.closePath();
    const bg = c.createLinearGradient(side < 0 ? 0 : W, 0, side < 0 ? RL : RR, 0); bg.addColorStop(0, '#7aa04a'); bg.addColorStop(0.6, '#a8b860'); bg.addColorStop(1, '#c8a870'); c.fillStyle = bg; c.fill();
    c.strokeStyle = 'rgba(255,250,220,0.6)'; c.lineWidth = 2.5; c.beginPath(); for (let y = -10; y <= H + 10; y += 10) { const x = edge(y) - side * 2; y === -10 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    c.strokeStyle = 'rgba(30,70,70,0.35)'; c.lineWidth = 6; c.beginPath(); for (let y = -10; y <= H + 10; y += 10) { const x = edge(y) - side * 5; y === -10 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
  }
  // papyrus clumps and palms placed along each bank in world space
  const step = 90, k0 = Math.floor((d - 200) / step);
  for (let k = k0 + 9; k >= k0; k--) {
    const r = P.rng(k * 7 + 3), sy = BY - (k * step - d) + 40;
    for (const side of [-1, 1]) {
      const x = side < 0 ? 14 + r() * 18 : W - 14 - r() * 18;
      if (r() < 0.3) bush(c, x - side * 2, sy + 20, 0.9 + r() * 0.3, k);
      papyrus(c, x + side * 4, sy, 0.95 + r() * 0.3, t + k, side);
    }
  }
}
function bush(c, x, y, s, seed) {
  const r = P.rng(seed * 5 + 1); c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 6; i++) { const bx = (r() - 0.5) * 22, by = -6 - r() * 12, br = 8 + r() * 5; const g = c.createRadialGradient(bx - 3, by - 3, 1, bx, by, br); g.addColorStop(0, '#8ac46a'); g.addColorStop(1, '#3f7a3a'); c.fillStyle = g; c.beginPath(); c.arc(bx, by, br, 0, 7); c.fill(); }
  for (let i = 0; i < 5; i++) { c.fillStyle = ['#ee6c8a', '#f4d35e', '#ffffff'][i % 3]; c.beginPath(); c.arc((r() - 0.5) * 24, -8 - r() * 14, 2.2, 0, 7); c.fill(); }
  c.restore();
}
function papyrus(c, x, y, s, t, side = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(30,60,40,0.25)'; c.beginPath(); c.ellipse(4, 2, 18, 5, 0, 0, 7); c.fill();
  for (let i = -3; i <= 3; i++) {
    const sw = Math.sin(t * 1.4 + i) * 2, tx = i * 7 + sw - side * 4, ty = -46 - Math.abs(i) * -4 - (i % 2) * 6;
    c.strokeStyle = i % 2 ? '#5f9a3a' : '#4a8a34'; c.lineWidth = 2; c.beginPath(); c.moveTo(i * 2, 0); c.quadraticCurveTo(i * 3, ty * 0.5, tx, ty); c.stroke();
    c.fillStyle = i % 2 ? '#8ac454' : '#a8d468'; c.beginPath(); for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.32; c.moveTo(tx, ty); c.lineTo(tx + Math.cos(a) * 11, ty + Math.sin(a) * 9 + 2); c.lineTo(tx + Math.cos(a + 0.12) * 10, ty + Math.sin(a + 0.12) * 8 + 2); } c.fill();
    c.fillStyle = '#c8e090'; c.beginPath(); c.arc(tx, ty, 1.6, 0, 7); c.fill();
  }
  c.restore();
}
function drawObstacle(c, r, sy, t) {
  const bump = r.hit ? Math.max(0, 1 - (t - r.hitT) * 3) : 0, jig = Math.sin(t * 30) * 3 * bump;
  c.save(); c.translate(jig, 0);
  if (r.kind === 'reeds') {
    // a mud island of reeds and papyrus, with a dragonfly
    const cx = (r.x0 + r.x1) / 2, w = (r.x1 - r.x0) / 2 + 10;
    c.fillStyle = 'rgba(20,60,60,0.35)'; c.beginPath(); c.ellipse(cx, sy + 8, w + 6, 20, 0, 0, 7); c.fill();
    const mg = c.createLinearGradient(0, sy - 16, 0, sy + 14); mg.addColorStop(0, '#9a8a50'); mg.addColorStop(1, '#5f6a38'); c.fillStyle = mg; c.beginPath(); c.ellipse(cx, sy, w, 15, 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(230,255,240,0.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, sy + 3, w + 4, 17, 0, 0.1, Math.PI - 0.1); c.stroke();
    const rr = P.rng(r.seed); const n = Math.round(w / 14);
    for (let i = 0; i < n; i++) { const x = r.x0 + 4 + (i + 0.5) * (r.x1 - r.x0 - 8) / n + (rr() - 0.5) * 8; papyrus(c, x, sy + 4 + (rr() - 0.5) * 8, 0.75 + rr() * 0.3, t + i, r.side); }
    const fx = cx + Math.sin(t * 2 + r.seed) * w * 0.6, fy = sy - 56 + Math.sin(t * 5) * 6;
    c.fillStyle = '#3a8ad8'; c.fillRect(fx - 7, fy - 1, 14, 2.4); c.fillStyle = 'rgba(220,240,255,0.7)'; const f = Math.sin(t * 40) * 3; c.beginPath(); c.ellipse(fx - 1, fy - 4 - f, 5, 2, -0.4, 0, 7); c.ellipse(fx + 2, fy - 4 + f, 5, 2, 0.4, 0, 7); c.fill();
  } else {
    // lily pads with blue lotus flowers and a frog
    const rr = P.rng(r.seed), n = Math.max(3, Math.round((r.x1 - r.x0) / 38));
    const pads = []; for (let i = 0; i < n; i++) pads.push([r.x0 + 16 + i * (r.x1 - r.x0 - 32) / (n - 1), sy + (rr() - 0.5) * 18, 21 + rr() * 7]);
    for (const [px, py, pr] of pads) { c.fillStyle = 'rgba(20,60,60,0.3)'; c.beginPath(); c.ellipse(px + 3, py + 5, pr, pr * 0.62, 0, 0, 7); c.fill(); }
    for (const [px, py, pr] of pads) {
      const a0 = rr() * 6; const lg = c.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 2, px, py, pr); lg.addColorStop(0, '#9ad66a'); lg.addColorStop(1, '#4a9a48'); c.fillStyle = lg;
      c.beginPath(); c.moveTo(px, py); c.ellipse(px, py, pr, pr * 0.62, 0, a0 + 0.35, a0 + Math.PI * 2 - 0.05); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,100,40,0.5)'; c.lineWidth = 1; for (let k = 0; k < 5; k++) { const a = a0 + 0.8 + k * 1.1; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a) * pr * 0.85, py + Math.sin(a) * pr * 0.52); c.stroke(); }
    }
    for (let i = 0; i < pads.length; i += 2) { const [px, py, pr] = pads[i]; lotus(c, px + pr * 0.2, py - 4, 0.9 + 0.1 * Math.sin(t * 2 + i)); }
    const [fx, fy] = pads[1]; frog(c, fx, fy - 4, t, r.hit && t - r.hitT < 0.8);
  }
  c.restore();
}
function lotus(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.38; c.save(); c.rotate(a + Math.PI / 2); const g = c.createLinearGradient(0, 0, 0, -14); g.addColorStop(0, '#f6f0ff'); g.addColorStop(1, i % 2 ? '#7a8ae8' : '#9ab0f6'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -8, 3.6, 8.5, 0, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = '#ffd45a'; c.beginPath(); c.arc(0, -2, 3, 0, 7); c.fill();
  c.restore();
}
function frog(c, x, y, t, surprised) {
  c.save(); c.translate(x, y - (surprised ? Math.abs(Math.sin(t * 16)) * 8 : 0));
  const g = c.createRadialGradient(-3, -6, 1, 0, -3, 12); g.addColorStop(0, '#b8e070'); g.addColorStop(1, '#5a9a3a'); c.fillStyle = g; c.strokeStyle = '#3a6a2a'; c.lineWidth = 1.2;
  c.beginPath(); c.ellipse(0, -4, 11, 8, 0, 0, 7); c.fill(); c.stroke();
  for (const sx of [-1, 1]) { c.fillStyle = '#8ac454'; c.beginPath(); c.arc(sx * 6, -11, 4.5, 0, 7); c.fill(); c.stroke(); P.eye(c, sx * 6, -11.5, surprised ? 2.6 : 2); }
  c.strokeStyle = '#2a4a1a'; c.lineWidth = 1.3; c.beginPath(); c.arc(0, -4, 4, 0.2, Math.PI - 0.2); c.stroke();
  P.blush(c, -7, -3, 2); P.blush(c, 7, -3, 2);
  c.restore();
}
// baby Moses in his little papyrus ark, sealed with dark pitch, wrapped in a blanket
function drawBasket(c, x, y, rot, t, expr) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(1.3, 1.3);
  c.fillStyle = 'rgba(15,50,60,0.35)'; c.beginPath(); c.ellipse(4, 16, 38, 11, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(230,255,250,0.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 12, 38 + Math.sin(t * 3) * 2, 10, 0, 0.15, Math.PI - 0.15); c.stroke();
  // hull
  const hg = c.createLinearGradient(0, -14, 0, 18); hg.addColorStop(0, '#e8b866'); hg.addColorStop(0.6, '#b07a38'); hg.addColorStop(1, '#5a3a1e'); c.fillStyle = hg; c.strokeStyle = '#4a2a14'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-36, -4); c.quadraticCurveTo(-36, 16, 0, 17); c.quadraticCurveTo(36, 16, 36, -4); c.closePath(); c.fill(); c.stroke();
  c.save(); c.clip(); c.strokeStyle = 'rgba(90,50,20,0.55)'; c.lineWidth = 1.2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-36, -1 + i * 5); c.quadraticCurveTo(0, 6 + i * 5, 36, -1 + i * 5); c.stroke(); } for (let xx = -32; xx <= 32; xx += 6) { c.beginPath(); c.moveTo(xx, -4); c.lineTo(xx * 0.9, 18); c.stroke(); } c.restore();
  // inside
  c.fillStyle = '#5a3a1e'; c.beginPath(); c.ellipse(0, -4, 36, 11, 0, 0, 7); c.fill();
  c.fillStyle = '#3a2412'; c.beginPath(); c.ellipse(0, -3, 32, 8.5, 0, 0, 7); c.fill();
  // blanket and baby
  const skin = P.SKIN[2];
  c.fillStyle = skin; c.strokeStyle = P.shade(skin, -0.4); c.lineWidth = 1.3; c.beginPath(); c.arc(-14, -12, 11, 0, 7); c.fill(); c.stroke();
  P.face(c, -14, -12.5, 11, { expr, facing: 1 });
  c.strokeStyle = P.HAIR[1]; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-15, -23); c.quadraticCurveTo(-19, -29, -12, -29); c.stroke();
  const bl = c.createLinearGradient(0, -14, 0, 4); bl.addColorStop(0, '#d8eefa'); bl.addColorStop(1, '#8ab8d8'); c.fillStyle = bl; c.strokeStyle = '#5a7a9a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-6, 2); c.quadraticCurveTo(-8, -12, 4, -10); c.quadraticCurveTo(22, -10, 30, -4); c.quadraticCurveTo(30, 4, 20, 4); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.8)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(-2, -6); c.quadraticCurveTo(12, -9, 26, -3); c.stroke(); c.setLineDash([]);
  // a little waving hand
  c.fillStyle = skin; c.strokeStyle = P.shade(skin, -0.4); c.beginPath(); c.arc(0 + Math.sin(t * 8) * 2, -16, 4, 0, 7); c.fill(); c.stroke();
  // rim highlight
  c.strokeStyle = '#f2cc80'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -4, 36, 11, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  c.restore();
}
// stone steps at the palace garden, with Pharaoh's daughter, her attendant, and Miriam peeking from the reeds
function drawLanding(c, y, t, g, s) {
  if (y < -260 || y > H + 40) return;
  // stone terrace across the top of the river
  c.save();
  const gg = c.createLinearGradient(0, y - 700, 0, y - 120); gg.addColorStop(0, '#5f9a48'); gg.addColorStop(1, '#9ac060'); c.fillStyle = gg; c.fillRect(0, y - 700, W, 590);
  P.flowers(c, W, Math.max(-20, y - 600), y - 130, 30, ['#f4d35e', '#ee6c8a', '#ffffff', '#b98ae0'], 12);
  const sg = c.createLinearGradient(0, y - 130, 0, y); sg.addColorStop(0, '#e8d6b0'); sg.addColorStop(1, '#c8ac80'); c.fillStyle = sg; c.fillRect(0, y - 130, W, 130);
  c.fillStyle = 'rgba(255,250,230,0.7)'; c.fillRect(0, y - 130, W, 3);
  c.strokeStyle = 'rgba(140,110,70,0.3)'; c.lineWidth = 1; for (let yy = y - 110; yy < y - 30; yy += 20) { c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); for (let xx = (yy / 20 % 2) * 20; xx < W; xx += 40) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + 20); c.stroke(); } }
  // a lotus pool and flower beds in the palace garden
  c.fillStyle = '#4aa0b0'; roundRect(c, 110, y - 250, 140, 60, 14); c.fill(); c.strokeStyle = '#e6d4b0'; c.lineWidth = 5; c.stroke(); lotus(c, 150, y - 222, 0.8); lotus(c, 210, y - 214, 0.7);
  P.palm(c, 28, y - 120, 0.85, 0.15, t); P.palm(c, 334, y - 126, 0.8, -0.2, t);
  for (let i = 0; i < 3; i++) { const yy = y - 28 + i * 12; c.fillStyle = i % 2 ? '#e6d4b0' : '#cdb48a'; c.fillRect(RL - 10, yy, RR - RL + 20, 12); c.fillStyle = 'rgba(255,255,240,0.6)'; c.fillRect(RL - 10, yy, RR - RL + 20, 2); }
  c.fillStyle = 'rgba(20,60,60,0.35)'; c.fillRect(0, y + 8, W, 8);
  // painted columns
  for (const cx of [70, 290]) { const cg = c.createLinearGradient(cx - 10, 0, cx + 10, 0); cg.addColorStop(0, '#f2e2c0'); cg.addColorStop(1, '#c8ae80'); c.fillStyle = cg; c.fillRect(cx - 10, y - 120, 20, 92); c.fillStyle = '#2f8f8a'; c.fillRect(cx - 12, y - 126, 24, 8); c.fillStyle = '#e9b949'; c.fillRect(cx - 10, y - 100, 20, 4); c.fillStyle = '#cf6f4a'; c.fillRect(cx - 10, y - 94, 20, 3); }
  // glow where the basket will land
  const pulse = 0.5 + 0.5 * Math.sin(t * 5); const gl = c.createRadialGradient(180, y - 30, 4, 180, y - 30, 120); gl.addColorStop(0, `rgba(255,236,170,${0.4 + 0.2 * pulse})`); gl.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = gl; c.fillRect(40, y - 150, 280, 240);
  const happy = s.arrived;
  // attendant holding a sunshade
  const shadeFan = (cc, hx, hy) => { cc.strokeStyle = '#6a4226'; cc.lineWidth = 2.4; cc.beginPath(); cc.moveTo(hx, hy + 6); cc.lineTo(hx + 26, hy - 40); cc.stroke(); cc.save(); cc.translate(hx + 26, hy - 40); cc.rotate(0.5 + Math.sin(t * 3) * 0.2);
    for (let i = -3; i <= 3; i++) { cc.save(); cc.rotate(i * 0.24); const fg = cc.createLinearGradient(0, 0, 0, -26); fg.addColorStop(0, '#f2e6cf'); fg.addColorStop(1, i % 2 ? '#5aa8a0' : '#ffffff'); cc.fillStyle = fg; cc.beginPath(); cc.ellipse(0, -14, 4.5, 14, 0, 0, 7); cc.fill(); cc.restore(); } cc.restore(); };
  P.person(c, 246, y - 32, 1.05, { skin: P.SKIN[5], robe: P.CLOTH.white, stripe: P.CLOTH.teal, hairStyle: 'curly', hair: P.HAIR[3], expr: happy ? 'laugh' : 'happy', arms: 'hold', hold: shadeFan, t, phase: 2, facing: -1 });
  // Pharaoh's daughter, kneeling forward with open arms
  P.person(c, 166, y - 26, 1.25, { skin: P.SKIN[4], robe: P.CLOTH.white, stripe: P.CLOTH.gold, sash: P.CLOTH.royal, hairStyle: 'long', hair: P.HAIR[3], expr: happy ? 'laugh' : 'wow', arms: happy ? 'hold' : 'out', t, phase: 0 });
  const hy = y - 26 - 55 * 1.25 - (Math.sin(t * 6) * 1.2 * 0.5) * 1.25; // gold circlet with a lotus
  c.strokeStyle = '#e9b949'; c.lineWidth = 3; c.beginPath(); c.ellipse(166, hy - 9, 19, 6, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
  lotus(c, 166, hy - 13, 0.7);
  // Miriam peeking out of the papyrus at the left
  P.person(c, 70, y + 4, 0.95, { skin: P.SKIN[3], robe: P.CLOTH.teal, stripe: P.CLOTH.saffron, hairStyle: 'curly', hair: P.HAIR[0], expr: happy ? 'laugh' : 'surprised', arms: happy ? 'cheer' : 'pray', t, child: true, phase: 4 });
  papyrus(c, 58, y + 18, 1.0, t, 1); papyrus(c, 92, y + 20, 0.9, t + 1, -1);
  c.restore();
}
