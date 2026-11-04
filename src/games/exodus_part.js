// PART! — swipe across the Red Sea to open a path; the families walk through on dry ground (Exodus 14:21–22).
const TOP = 250, BOT = 640;              // the sea fills the lower screen; we look down the path toward the far shore
const CX = 180;
const wallEdge = (y, open) => { // half-width of the dry path at height y, for open 0..1
  const k = Math.max(0, (y - TOP) / (BOT - TOP)); return open * (24 + k * 100);
};
MG.add({
  id: 'part', stage: 'exodus', cmd: 'PART!', hint: 'swipe', time: 5, mood: 'sea', winText: 'Free!',
  card: { title: 'A path through the sea', ref: 'Exodus 14–15', kind: 'Story', text: 'God freed the Israelites from slavery in Egypt, and when they came to the sea, a strong wind blew all night and opened a path of dry ground. The families walked across with their children and animals, and on the other side Moses and Miriam led the people in songs of thanks.', ask: 'When has a way opened up for you that you did not expect? Who could you thank for it?' },
  init(g) {
    const s = g.s; s.need = [1, 1.6, 1.8][g.level]; s.power = 0; s.open = 0; s.trail = []; s.sw = []; s.walkT = -1;
    s.fish = Array.from({ length: 18 }, (_, i) => ({ side: i % 2 ? 1 : -1, y: TOP - 90 + Math.random() * 400, d: Math.random(), sp: 10 + Math.random() * 18, col: ['#f0a050', '#f5d04a', '#ff7a8a', '#7ad0f0', '#b0e070'][i % 5], ph: Math.random() * 6 }));
    s.bubbles = Array.from({ length: 30 }, () => ({ side: Math.random() < 0.5 ? -1 : 1, d: Math.random(), y: Math.random() * 400, sp: 20 + Math.random() * 30 }));
  },
  down(g, x, y) { g.s.trail = [[x, y, g.t]]; },
  move(g, x, y) { const tr = g.s.trail; if (tr.length) { tr.push([x, y, g.t]); if (tr.length > 14) tr.shift(); } },
  up(g) { g.s.trail = []; },
  swipe(g, dx, dy, vx, vy) {
    const s = g.s; if (Math.abs(dx) < Math.abs(dy) * 0.8 || s.power >= s.need) return;
    // a long or fast swipe counts for more; on level 0 any horizontal swipe opens the sea
    const amt = g.level === 0 ? 1 : Math.min(1.8, 0.45 + Math.abs(dx) / 260 + Math.abs(vx) / 3200);
    s.power = Math.min(s.need, s.power + amt); g.sfx('whoosh'); g.sfx(s.power >= s.need ? 'splashbig' : 'wave'); g.shake(3 + s.power * 3, 0.3);
    s.sw.push({ y: g.ptr.y || 360, t: g.t, dir: Math.sign(dx) });
    g.burst(CX, TOP + 60, ['#dff8ff', '#9fe0ff', '#ffffff'], 16, 220);
    if (s.power >= s.need) { s.walkT = g.t; g.sfx('wind'); }
  },
  update(g, dt) {
    const s = g.s, target = s.power / s.need;
    s.open += (target - s.open) * Math.min(1, dt * 5);
    if (s.walkT >= 0 && !g.done && g.t - s.walkT > 0.45) { g.win(); g.sfx('cheer'); g.sfx('baa'); }
    for (const f of s.fish) f.y += Math.sin(g.t * 0.6 + f.ph) * 6 * dt;
    for (const b of s.bubbles) b.y -= b.sp * dt;
  },
  auto(g, dt, synth) { // test bot: swipe outward from the middle, twice if needed
    const s = g.s; if (s.power >= s.need) return; const k = Math.floor((g.t - 0.4) / 0.45); if (g.t < 0.4 || k === s.last) return; s.last = k;
    synth('down', 120, 380); synth('move', 200, 380); synth('move', 300, 380); synth('up', 300, 380); synth('swipe', 180, 0, 1600, 0);
  },
  draw(g, c) {
    const s = g.s, t = g.t, op = s.open;
    c.drawImage(g.bake('exodus_part_bg', paintSky), 0, 0, W, H);
    // the far shore glows in the dawn, across the sea
    P.rays(c, CX, 196, W, H, '#fff4d0', 0.14 + op * 0.1, 11, t);
    // the dry seabed path (revealed by the walls opening)
    c.drawImage(g.bake('exodus_part_floor', paintFloor), 0, 0, W, H);
    // walkers on the path
    drawWalkers(c, s, t, op, g);
    // the water: closed sea surface over the gap, plus the two walls
    drawSea(c, s, t, op, g);
    if (op > 0.05) { const gl = c.createRadialGradient(CX, 230, 4, CX, 230, 120); gl.addColorStop(0, `rgba(255,240,200,${0.5 * op})`); gl.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = gl; c.fillRect(CX - 120, 110, 240, 240); }
    // foreground: the near shore where the families start
    c.drawImage(g.bake('exodus_part_front', paintFront), 0, 0, W, H);
    drawFamily(c, s, t, op, g);
    // finger trail
    const tr = s.trail; if (tr.length > 1) { c.save(); c.lineCap = 'round'; for (let i = 1; i < tr.length; i++) { const a = i / tr.length; c.strokeStyle = `rgba(230,255,255,${0.75 * a})`; c.lineWidth = 3 + a * 9; c.beginPath(); c.moveTo(tr[i - 1][0], tr[i - 1][1]); c.lineTo(tr[i][0], tr[i][1]); c.stroke(); } c.restore(); }
    // a gust ripple across the screen after each swipe
    for (const w of s.sw) { const q = (t - w.t) / 0.6; if (q > 1) continue; c.save(); c.globalAlpha = (1 - q) * 0.8; c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.lineCap = 'round'; for (let i = -1; i <= 1; i++) { const yy = w.y + i * 22; c.beginPath(); c.moveTo(CX - 20 - q * 160, yy); c.quadraticCurveTo(CX - 10 - q * 80, yy - 8, CX, yy); c.moveTo(CX + 20 + q * 160, yy); c.quadraticCurveTo(CX + 10 + q * 80, yy - 8, CX, yy); c.stroke(); } c.restore(); }
    // the swipe target: a soft glowing seam across the water until the sea opens
    if (op < 0.5 && !g.done) { const p = 0.5 + 0.5 * Math.sin(t * 5); c.save(); c.strokeStyle = `rgba(255,255,255,${0.35 + 0.35 * p})`; c.lineWidth = 4; c.lineCap = 'round'; c.setLineDash([2, 12]); c.lineDashOffset = -t * 30; c.beginPath(); c.moveTo(CX - 14, 390); c.lineTo(CX - 110, 390); c.moveTo(CX + 14, 390); c.lineTo(CX + 110, 390); c.stroke(); c.setLineDash([]);
      for (const sd of [-1, 1]) { const ax = CX + sd * (118 + p * 8); c.fillStyle = `rgba(255,255,255,${0.5 + 0.4 * p})`; c.beginPath(); c.moveTo(ax + sd * 12, 390); c.lineTo(ax - sd * 4, 379); c.lineTo(ax - sd * 4, 401); c.closePath(); c.fill(); } c.restore(); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});

function paintSky(o) {
  P.sky(o, W, H, ['#203e78', '#4a78b0', '#e8a8a0', '#ffe0a8'], { x: CX, y: 196, r: 26, color: '#fff0c0', glow: 260 });
  P.stars(o, W, 120, 30, 5, 0);
  P.cloud(o, 60, 120, 0.7, '#ffe8e0', '#b08ab8', 0.85); P.cloud(o, 300, 90, 0.55, '#ffe8e0', '#b08ab8', 0.8);
  // far shore: Sinai mountains in violet haze
  P.hills(o, W, 238, 42, '#b07a98', '#8a6a90', { seed: 31, freq: 0.014, dabs: 20 });
  P.hills(o, W, 252, 14, '#d8a888', '#c08a78', { seed: 33, freq: 0.03, dabs: 20, rim: '#ffe0b0' });
}
function paintFloor(o) {
  // a sandy seabed path with ripples, shells and starfish, wider toward the viewer
  o.save(); o.beginPath(); o.moveTo(CX - 16, TOP); o.lineTo(CX + 16, TOP); o.lineTo(CX + 130, BOT); o.lineTo(CX - 130, BOT); o.closePath(); o.clip();
  const g = o.createLinearGradient(0, TOP, 0, BOT); g.addColorStop(0, '#f6dcb0'); g.addColorStop(1, '#d8a868'); o.fillStyle = g; o.fillRect(0, TOP, W, BOT - TOP);
  o.strokeStyle = 'rgba(160,110,60,0.35)'; o.lineWidth = 1.5; for (let i = 0; i < 22; i++) { const y = TOP + 10 + i * i * 0.85; o.beginPath(); for (let x = 0; x <= W; x += 8) o.lineTo(x, y + Math.sin(x * 0.08 + i) * (1 + i * 0.15)); o.stroke(); }
  const r = P.rng(55); for (let i = 0; i < 18; i++) { const y = TOP + 40 + r() * 320, x = CX + (r() - 0.5) * (y - TOP) * 0.5, s = 0.4 + (y - TOP) / 400;
    if (r() < 0.4) { o.fillStyle = '#f08a6a'; drawStarfish(o, x, y, 6 * s); } else { o.fillStyle = r() < 0.5 ? '#fff2e0' : '#f6c8c0'; o.beginPath(); o.ellipse(x, y, 4 * s, 3 * s, 0, Math.PI, 0); o.fill(); o.strokeStyle = 'rgba(160,100,80,0.5)'; o.lineWidth = 0.8; for (let k = -1; k <= 1; k++) { o.beginPath(); o.moveTo(x, y); o.lineTo(x + k * 3 * s, y - 3 * s); o.stroke(); } } }
  // damp darker edges where the water stood
  for (const side of [-1, 1]) { const eg = o.createLinearGradient(CX + side * 130, 0, CX, 0); eg.addColorStop(0, 'rgba(110,80,60,0.45)'); eg.addColorStop(0.4, 'rgba(110,80,60,0)'); o.fillStyle = eg; o.fillRect(0, TOP, W, BOT - TOP); }
  o.restore();
}
function drawStarfish(o, x, y, r) { o.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r, a = i * Math.PI / 5 - Math.PI / 2; o.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7); } o.closePath(); o.fill(); }
function paintFront(o) {
  // the near shore: a sandy lip with grass and rocks, framing the bottom
  o.save(); o.beginPath(); o.moveTo(0, 560); o.quadraticCurveTo(90, 540, CX - 80, 558); o.quadraticCurveTo(CX, 566, CX + 80, 558); o.quadraticCurveTo(270, 540, W, 560); o.lineTo(W, H); o.lineTo(0, H); o.closePath();
  const g = o.createLinearGradient(0, 540, 0, H); g.addColorStop(0, '#f2d29a'); g.addColorStop(1, '#c8965a'); o.fillStyle = g; o.fill(); o.clip();
  const r = P.rng(9); for (let i = 0; i < 40; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff0c8' : '#a8743a', 0.2); o.beginPath(); o.ellipse(r() * W, 556 + r() * 90, 6 + r() * 10, 2 + r() * 2, 0, 0, 7); o.fill(); }
  o.restore();
  o.strokeStyle = 'rgba(255,255,255,0.8)'; o.lineWidth = 2.5; o.beginPath(); o.moveTo(0, 560); o.quadraticCurveTo(90, 540, CX - 80, 558); o.quadraticCurveTo(CX, 566, CX + 80, 558); o.quadraticCurveTo(270, 540, W, 560); o.stroke();
  P.rock(o, 20, 600, 0.9, '#b89a7a'); P.rock(o, 344, 596, 0.8, '#a88a6a');
  P.grassTufts(o, 60, 570, 630, 6, '#8aa04a', 3); P.grassTufts(o, W, 600, 640, 10, '#8aa04a', 4);
}
// one water wall (side -1 left, +1 right) or the closed surface, drawn as a path clipped to the water region
function drawSea(c, s, t, op, g) {
  // water region: everything from TOP down to the near shore, minus the open path
  for (const side of [-1, 1]) {
    c.save();
    // the water heaps up into a tall wall at the cut: the top edge rises toward the path
    const rise = 130 * op, xi = CX + side * wallEdge(TOP, op), top = [];
    for (let i = 0; i <= 40; i++) { const x = (side < 0 ? -10 : W + 10) + (xi - (side < 0 ? -10 : W + 10)) * i / 40, u = Math.max(0, 1 - Math.abs(x - xi) / 170), sm = u * u * (3 - 2 * u);
      top.push([x, TOP - 4 - rise * sm + Math.sin(x * 0.09 + t * 3) * (1.5 + 2 * sm)]); }
    const pts = []; for (let y = TOP - 4 - rise; y <= 580; y += 6) { const wav = (Math.sin(y * 0.07 + t * 4 * side) * 3 + Math.sin(y * 0.025 - t * 2) * 2) * op; pts.push([CX + side * (wallEdge(y, op) + wav), y]); }
    c.beginPath(); top.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    for (const [x, y] of pts) c.lineTo(x, y);
    c.lineTo(side < 0 ? -10 : W + 10, 580); c.closePath();
    // deep body gradient: dark at the outside, bright and glassy at the cut face
    const wg = c.createLinearGradient(side < 0 ? 0 : W, 0, CX, 0);
    wg.addColorStop(0, '#0d3a66'); wg.addColorStop(0.45, '#1f6f9a'); wg.addColorStop(0.8, '#3ab0c8'); wg.addColorStop(1, '#a8f0f0');
    c.fillStyle = wg; c.fill(); c.save(); c.clip();
    // vertical depth: lighter at the surface, darker lower
    const vg = c.createLinearGradient(0, TOP - rise, 0, 580); vg.addColorStop(0, 'rgba(170,240,255,0.45)'); vg.addColorStop(0.3, 'rgba(60,140,200,0)'); vg.addColorStop(1, 'rgba(8,30,70,0.4)'); c.fillStyle = vg; c.fillRect(0, TOP - 150, W, 740);
    // god-rays slanting down through the water
    c.globalCompositeOperation = 'screen';
    for (let i = 0; i < 6; i++) { const x0 = CX + side * (30 + i * 34) + Math.sin(t * 0.8 + i) * 6; const rg = c.createLinearGradient(0, TOP - rise, 0, 560); rg.addColorStop(0, `rgba(210,255,255,${0.22 * op + 0.06})`); rg.addColorStop(1, 'rgba(210,255,255,0)'); c.fillStyle = rg; c.beginPath(); c.moveTo(x0 - 6, TOP - rise); c.lineTo(x0 + 8, TOP - rise); c.lineTo(x0 + 8 + side * 50, 560); c.lineTo(x0 - 18 + side * 50, 560); c.closePath(); c.fill(); }
    // caustic shimmer lines
    for (let i = 0; i < 7; i++) { c.strokeStyle = `rgba(200,255,255,${0.14 + 0.08 * Math.sin(t * 2 + i)})`; c.lineWidth = 1.6; c.beginPath(); for (let y = TOP - rise; y <= 580; y += 10) { const xx = CX + side * (wallEdge(y, op) + 14 + i * 24) + Math.sin(y * 0.05 + t * 2 + i) * 5; y === TOP - rise ? c.moveTo(xx, y) : c.lineTo(xx, y); } c.stroke(); }
    c.globalCompositeOperation = 'source-over';
    // a glassy band of light just inside the cut face
    c.lineJoin = 'round'; c.strokeStyle = 'rgba(190,250,255,0.22)'; c.lineWidth = 26; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    c.strokeStyle = 'rgba(220,255,255,0.18)'; c.lineWidth = 10; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x + side * 10, y) : c.moveTo(x + side * 10, y)); c.stroke();
    // seaweed swaying at the base
    for (let i = 0; i < 5; i++) { const bx = CX + side * (wallEdge(560, op) + 18 + i * 34), sw = Math.sin(t * 2 + i) * 6; c.strokeStyle = i % 2 ? '#3a9a6a' : '#5ab87a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, 580); c.quadraticCurveTo(bx + sw, 540, bx - sw * 0.5, 500 - i % 3 * 12); c.stroke(); }
    // fish swimming inside the wall
    for (const f of s.fish) { if (f.side !== side) continue; const inner = wallEdge(f.y, op); const x = CX + side * (inner + 20 + f.d * 110 + Math.sin(t * 0.9 + f.ph) * 12); const sc = 0.55 + (f.y - TOP) / 500; const dir = Math.cos(t * 0.9 + f.ph) > 0 ? 1 : -1; c.save(); c.globalAlpha = 0.9; P.fishShape(c, x, f.y + Math.sin(t * 3 + f.ph) * 3, sc * dir * side, f.col); c.restore(); }
    // a friendly turtle on the right, a big ray on the left
    if (side > 0) turtle(c, CX + wallEdge(470, op) + 70 + Math.sin(t * 0.7) * 10, 470 + Math.sin(t) * 4, 1, t); else jelly(c, CX - wallEdge(330, op) - 60, 330 + Math.sin(t * 1.3) * 8, t);
    // rising bubbles
    c.fillStyle = 'rgba(230,255,255,0.7)'; for (const b of s.bubbles) { if (b.side !== side) continue; const y = TOP + ((b.y % 330) + 330) % 330; const x = CX + side * (wallEdge(y, op) + 8 + b.d * 140) + Math.sin(y * 0.1) * 3; c.beginPath(); c.arc(x, y, 1.5 + b.d * 2, 0, 7); c.fill(); }
    c.restore();
    // glassy cut face: bright rim, foam and a thin inner glow
    c.save(); c.lineJoin = 'round'; c.globalAlpha = Math.min(1, op * 3);
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3; c.beginPath(); top.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 20; i <= 40; i += 2) { const [x, y] = top[i]; c.beginPath(); c.arc(x, y, 2 + (i - 20) / 20 * 3 + Math.sin(i + t * 5) * 1, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(200,255,255,0.55)'; c.lineWidth = 8; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x - side * 3, y) : c.moveTo(x - side * 3, y)); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 2.5; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    if (op > 0.15) { c.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < pts.length; i += 3) { const [x, y] = pts[i]; c.beginPath(); c.arc(x + side * 1, y, 2 + Math.sin(y + t * 6) * 1.2, 0, 7); c.fill(); } }
    c.restore();
  }
  // wave crests along the top of the walls / sea surface
  c.save(); c.globalAlpha = Math.max(0, 1 - op * 3); for (let i = 0; i < 2; i++) { c.strokeStyle = `rgba(255,255,255,${0.6 - i * 0.25})`; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= W; x += 6) { if (Math.abs(x - CX) < wallEdge(TOP, op) + 2) { c.stroke(); c.beginPath(); continue; } const y = TOP - 2 + i * 6 + Math.sin(x * 0.08 + t * 3 + i) * 2; c.lineTo(x, y); } c.stroke(); } c.restore();
  // sparkles on the sea top
  for (let i = 0; i < 16; i++) { const x = (i * 53 + t * 10) % W, k = Math.max(0, Math.sin(t * 4 + i * 1.7)); if (k > 0.6 && Math.abs(x - CX) > wallEdge(TOP, op) + 6) { c.fillStyle = `rgba(255,250,220,${(k - 0.6) * 2.4})`; c.fillRect(x - 4, TOP + 2 + (i % 4) * 4, 8, 1.4); } }
}
function turtle(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const f = Math.sin(t * 3) * 0.4;
  c.fillStyle = '#7ab86a'; for (const [fx, fy, a] of [[-14, -10, -0.6 - f], [14, -10, 0.6 + f], [-12, 10, 0.5], [12, 10, -0.5]]) { c.save(); c.translate(fx, fy); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 9, 4, 0, 0, 7); c.fill(); c.restore(); }
  c.beginPath(); c.arc(0, -18, 7, 0, 7); c.fill(); P.eye(c, -2.5, -19, 1.6); P.eye(c, 2.5, -19, 1.6);
  const sg = c.createRadialGradient(-4, -4, 2, 0, 0, 16); sg.addColorStop(0, '#c8a060'); sg.addColorStop(1, '#6a7a3a'); c.fillStyle = sg; c.beginPath(); c.ellipse(0, 0, 14, 16, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(60,60,20,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 12); c.moveTo(-10, -4); c.lineTo(10, -4); c.moveTo(-10, 5); c.lineTo(10, 5); c.stroke();
  c.restore();
}
function jelly(c, x, y, t) {
  c.save(); c.translate(x, y); c.globalAlpha = 0.8;
  const g = c.createRadialGradient(0, -4, 1, 0, 0, 14); g.addColorStop(0, '#ffe0f0'); g.addColorStop(1, 'rgba(255,150,200,0.5)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 13, Math.PI, 0); c.quadraticCurveTo(7, 4, 0, 3); c.quadraticCurveTo(-7, 4, -13, 0); c.fill();
  c.strokeStyle = 'rgba(255,190,220,0.8)'; c.lineWidth = 1.4; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 4, 2); c.quadraticCurveTo(i * 4 + Math.sin(t * 3 + i) * 4, 14, i * 4, 24); c.stroke(); }
  P.eye(c, -4, -3, 1.5); P.eye(c, 4, -3, 1.5); P.blush(c, -7, 0, 1.6); P.blush(c, 7, 0, 1.6);
  c.restore();
}
// families and flocks walking away from us across the seabed once it opens
function drawWalkers(c, s, t, op, g) {
  if (s.walkT < 0) return;
  const k = t - s.walkT;
  const walkers = [
    { d: 0.0, x: -0.3, kind: 'person', o: { skin: P.SKIN[1], robe: P.CLOTH.rust, stripe: P.CLOTH.cream, beard: true, hair: P.HAIR[2], head: 'wrap', arms: 'cheer' } },
    { d: 0.15, x: 0.35, kind: 'goat' },
    { d: 0.25, x: -0.1, kind: 'person', o: { skin: P.SKIN[0], robe: P.CLOTH.plum, stripe: P.CLOTH.gold, hairStyle: 'long', hair: P.HAIR[2], arms: 'wave' } },
    { d: 0.4, x: 0.3, kind: 'sheep' },
  ];
  for (const w of walkers.slice().reverse()) {
    const p = Math.max(0, Math.min(1, (k - w.d) * 0.55)); if (p <= 0) continue;
    const y = 560 - p * 230, sc = 0.45 + (y - TOP) / 400 * 0.7, x = CX + w.x * wallEdge(y, op) * 0.9;
    if (w.kind === 'person') P.person(c, x, y, sc, { ...w.o, expr: 'laugh', t: t + w.d * 3, facing: 1 });
    else P[w.kind](c, x, y, sc, { t, hop: true, facing: w.x < 0 ? 1 : -1 });
  }
}
// the family on the near shore, cheering and setting out
function drawFamily(c, s, t, op, g) {
  const go = s.walkT >= 0, win = g.result === 'win', step = go ? Math.min(1, (t - s.walkT) * 0.6) : 0;
  P.goat(c, 52, 628, 1.1, { t, facing: 1 });
  P.person(c, 98, 616 - step * 20, 1.3, { skin: P.SKIN[3], robe: P.CLOTH.indigo, stripe: P.CLOTH.gold, beard: true, hair: P.HAIR[0], head: 'wrap', headCol: P.CLOTH.cream, expr: go ? 'laugh' : 'wow', arms: go ? 'cheer' : 'out', t, phase: 2 });
  P.person(c, 264, 618 - step * 20, 1.3, { skin: P.SKIN[2], robe: P.CLOTH.teal, stripe: P.CLOTH.saffron, hairStyle: 'curly', hair: P.HAIR[0], expr: go ? 'laugh' : 'happy', arms: go ? 'cheer' : 'up', t, phase: 1, facing: -1,
    hold: null });
  // Miriam's tambourine
  const tx = 264 + (go ? 18 : 16), ty = 618 - step * 20 - 88 + Math.sin(t * 10) * (go ? 3 : 1);
  c.save(); c.translate(tx, ty); c.rotate(Math.sin(t * 8) * 0.3); c.fillStyle = '#e9c37a'; c.strokeStyle = '#8a5a2a'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#f6e6c0'; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.fillStyle = '#d9d9d9'; for (let i = 0; i < 5; i++) { const a = i * 1.26 + t * 3; c.beginPath(); c.arc(Math.cos(a) * 10, Math.sin(a) * 10, 2.2, 0, 7); c.fill(); } c.restore();
  P.person(c, 196, 630 - step * 10, 1.05, { skin: P.SKIN[1], robe: P.CLOTH.saffron, stripe: P.CLOTH.rust, hairStyle: 'short', hair: P.HAIR[2], expr: go ? 'laugh' : 'surprised', arms: go ? 'cheer' : 'down', child: true, t, phase: 3 });
  P.sheep(c, 316, 634, 1.1, { t, facing: -1, hop: go });
  if (win) for (let i = 0; i < 5; i++) { const a = ((t - g.doneAt) * 1.2 + i * 0.2) % 1; c.save(); c.globalAlpha = 1 - a; c.fillStyle = ['#ffd45a', '#ff9ab8', '#9fe0ff'][i % 3]; drawStar(c, 60 + i * 60, 520 - a * 60, 6, t * 3 + i); c.restore(); }
}
