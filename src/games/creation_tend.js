// TEND! — "The LORD God took the human and put him in the garden of Eden to till it and keep it" (Genesis 2:15).
// Drag the watering jug over each drooping plant and hold it there; the plant drinks, stands up tall and bursts into bloom.
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
const back = k => { k = Math.max(0, Math.min(1, k)); const c1 = 2.2; return 1 + (c1 + 1) * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const KINDS = [{ f: 'daisy', petal: '#fff8f0', mid: '#ffc93a' }, { f: 'tulip', petal: '#ff5a7a', mid: '#ffd0d8' }, { f: 'sun', petal: '#ffcf3a', mid: '#8a4a1a' }, { f: 'bell', petal: '#9a7aff', mid: '#e8dcff' }, { f: 'rose', petal: '#ff8a5a', mid: '#ffd0a0' }];
const SPOUT = [-46, 2]; // where the water leaves the jug, relative to the finger
const GROUND = 548, PS = 1.45;

MG.add({
  id: 'tend', stage: 'creation', cmd: 'TEND!', hint: 'drag', time: 5.5, mood: 'bright', winText: 'Blooming!',
  card: { title: 'Take care of the garden', ref: 'Genesis 2:15', kind: 'Story', text: 'God put the first human in the garden of Eden to work it and take care of it. Looking after plants, animals and the earth is one of the first jobs God gave people.', ask: 'What is one living thing you could help take care of this week?' },
  init(g) {
    const s = g.s, n = [2, 3, 4][g.level];
    const xs = { 2: [100, 250], 3: [64, 176, 290], 4: [48, 132, 218, 304] }[n];
    const kinds = KINDS.slice().sort(() => Math.random() - 0.5);
    s.plants = xs.map((x, i) => ({ x, y: GROUND + (i % 2) * 16 - 4, k: kinds[i % kinds.length], w: 0, ok: false, okT: 0, h: 74 + Math.random() * 18, lean: (i % 2 ? 1 : -1) * (0.8 + Math.random() * 0.3), ph: Math.random() * 6 }));
    s.need = g.level === 0 ? 0.4 : 0.34;
    s.jug = { x: 300, y: 300, rx: 300, ry: 300 }; s.held = false; s.drops = []; s.splash = []; s.done = 0; s.pourT = 0;
  },
  down(g, x, y) { const s = g.s; s.held = true; s.jug.x = x; s.jug.y = Math.min(y, 470); g.sfx('slurp'); },
  move(g, x, y) { const s = g.s; if (!s.held) return; s.jug.x = Math.max(30, Math.min(W + 10, x)); s.jug.y = Math.max(90, Math.min(y, 470)); },
  up(g) { g.s.held = false; },
  update(g, dt) {
    const s = g.s, t = g.t, j = s.jug, pour = s.held && !g.done || (g.done && g.result === 'win' && t - g.doneAt < 0.2);
    if (!s.held) { j.x += (j.rx - j.x) * Math.min(1, dt * 5); j.y += (j.ry - j.y) * Math.min(1, dt * 5); }
    const px = j.x + SPOUT[0], py = j.y + SPOUT[1];
    if (pour) { s.pourT += dt; for (let i = 0; i < 3; i++) s.drops.push({ x: px + (Math.random() - 0.5) * 6, y: py, vx: -40 - Math.random() * 30, vy: 40 + Math.random() * 40, r: 2 + Math.random() * 2.5 }); if (Math.floor(s.pourT * 6) !== Math.floor((s.pourT - dt) * 6)) g.sfx('drip'); }
    for (const d of s.drops) { d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    const keep = [];
    for (const d of s.drops) { if (d.y >= GROUND + 8) { if (Math.random() < 0.3) s.splash.push({ x: d.x, y: GROUND + 6 + Math.random() * 14, t }); } else keep.push(d); }
    s.drops = keep.slice(-160); s.splash = s.splash.filter(p => t - p.t < 0.4);
    // which plant is under the stream? the stream lands about 40 px left of the spout
    if (pour && !g.done) {
      const lx = px - 34;
      let best = null, bd = 46; for (const p of s.plants) { if (p.ok) continue; const d = Math.abs(p.x - lx); if (d < bd && py < p.y - 30 && py > p.y - 360) { bd = d; best = p; } }
      if (best) { best.w += dt; if (best.w >= s.need) { best.ok = true; best.okT = t; s.done++; g.sfx(s.done === s.plants.length ? 'grow' : 'pop'); g.burst(best.x + best.lean * 0, best.y - best.h - 10, [best.k.petal, best.k.mid, '#ffffff', '#b8f07a'], 16, 170); if (s.done === s.plants.length) g.win(); } }
    }
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.5) return;
    if (!s.held) { synth('down', s.jug.x, s.jug.y); return; }
    const p = s.plants.find(q => !q.ok); if (!p) return;
    const tx = p.x + 34 - SPOUT[0], ty = p.y - 200, dx = tx - s.jug.x, dy = ty - s.jug.y, d = Math.hypot(dx, dy), step = 900 * dt;
    if (d > 2) { const k = Math.min(1, step / d); synth('move', s.jug.x + dx * k, s.jug.y + dy * k); }
  },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('creation_tend_bg', paintGarden), 0, 0, W, H);
    for (let i = 0; i < 3; i++) { const q = ((t * 0.06 + i * 0.33) % 1); P.dove(c, -30 + q * 420, 150 + i * 34 + Math.sin(t * 2 + i) * 6, 0.45, { t: t + i }); }
    // butterflies and drifting pollen
    for (let i = 0; i < 3; i++) { const x = 60 + i * 110 + Math.sin(t * 0.9 + i * 2) * 40, y = 300 + Math.sin(t * 1.3 + i) * 30 + i * 18; butterfly(c, x, y, t * 14 + i, ['#ffb0d0', '#a8e0ff', '#ffe08a'][i]); }
    // Eve watches from the path, then cheers
    const win = g.result === 'win';
    P.person(c, 340, 448, 0.85, { skin: P.SKIN[3], robe: P.CLOTH.green, stripe: P.CLOTH.cream, hairStyle: 'long', hair: P.HAIR[0], expr: win ? 'laugh' : s.done ? 'wow' : 'happy', arms: win ? 'cheer' : s.done ? 'wave' : 'pray', t, facing: -1 });
    // soil and plants, back row first
    const list = s.plants.slice().sort((a, b) => a.y - b.y);
    for (const p of list) { c.save(); c.translate(p.x, p.y); c.scale(PS, PS); c.translate(-p.x, -p.y); drawPlant(c, p, t, s); c.restore(); }
    // a thirsty droplet bobs over every dry plant: this is where the water goes
    for (const p of s.plants) { if (p.ok || p.w > 0.04) continue; const bob = Math.sin(t * 4 + p.ph) * 5, pulse = 0.5 + 0.5 * Math.sin(t * 5 + p.ph), x = p.x, y = p.y - 150 + bob;
      c.save(); const gl = c.createRadialGradient(x, y, 2, x, y, 30); gl.addColorStop(0, `rgba(190,240,255,${0.35 + 0.25 * pulse})`); gl.addColorStop(1, 'rgba(190,240,255,0)'); c.fillStyle = gl; c.fillRect(x - 30, y - 30, 60, 60);
      c.translate(x, y); c.scale(0.9 + pulse * 0.1, 0.9 + pulse * 0.1); c.beginPath(); c.moveTo(0, -15); c.bezierCurveTo(6, -4, 11, 1, 11, 5); c.arc(0, 5, 11, 0, Math.PI); c.bezierCurveTo(-11, 1, -6, -4, 0, -15); const dg = c.createLinearGradient(0, -15, 0, 16); dg.addColorStop(0, '#c8f0ff'); dg.addColorStop(1, '#4aa8e8'); c.fillStyle = dg; c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.ellipse(-4, 4, 2.5, 4, 0.3, 0, 7); c.fill(); c.restore(); }
    // water: falling drops, then splashes
    c.save(); for (const d of s.drops) { const gr = c.createRadialGradient(d.x - 1, d.y - 1, 0, d.x, d.y, d.r * 1.4); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#a8e4ff'); gr.addColorStop(1, 'rgba(90,180,240,0.6)'); c.fillStyle = gr; c.beginPath(); c.ellipse(d.x, d.y, d.r * 0.85, d.r * 1.3, 0, 0, 7); c.fill(); } c.restore();
    for (const p of s.splash) { const q = (t - p.t) / 0.4; c.strokeStyle = `rgba(200,240,255,${0.8 * (1 - q)})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(p.x, p.y, 3 + q * 9, 1.5 + q * 3, 0, 0, 7); c.stroke(); }
    // the jug: tilts to pour while held, glows invitingly while resting
    const j = s.jug, tilt = s.held ? -0.55 : Math.sin(t * 3) * 0.05;
    if (!s.held && !g.done) { const pulse = 0.5 + 0.5 * Math.sin(t * 5); const gl = c.createRadialGradient(j.x, j.y, 4, j.x, j.y, 64); gl.addColorStop(0, `rgba(255,240,170,${0.45 + 0.3 * pulse})`); gl.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gl; c.fillRect(j.x - 64, j.y - 64, 128, 128); }
    if (s.held) { c.fillStyle = 'rgba(40,50,20,0.16)'; c.beginPath(); c.ellipse(j.x - 10, GROUND + 30, 34, 7, 0, 0, 7); c.fill(); }
    drawJug(c, j.x, j.y, tilt, t);
    P.vignette(c, W, H, 0.28, '#3a2a10'); P.grain(c, W, H, 0.06);
  },
});

function paintGarden(o) {
  P.sky(o, W, H, ['#f6c8a0', '#ffe0b0', '#fff4d8', '#e8f0c0'], { x: 70, y: 150, r: 26, color: '#fff0c0', glow: 260 });
  P.rays(o, 70, 150, W, H, '#fff4d0', 0.14, 9);
  P.cloud(o, 250, 110, 0.8, '#fffaf0', '#f0c0b0', 0.9); P.cloud(o, 330, 190, 0.45, '#fffaf0', '#f0c0b0', 0.8); P.cloud(o, 150, 60, 0.4, '#fffaf0', '#f0c0b0', 0.7);
  // misty mountains and the river that waters the garden (Genesis 2:10)
  P.hills(o, W, 250, 70, '#c8b8d0', '#b0a8c8', { seed: 31, freq: 0.008, dabs: 20 });
  const mist = o.createLinearGradient(0, 200, 0, 300); mist.addColorStop(0, 'rgba(255,240,220,0)'); mist.addColorStop(1, 'rgba(255,240,220,0.7)'); o.fillStyle = mist; o.fillRect(0, 200, W, 100);
  P.hills(o, W, 300, 40, '#9cc890', '#78a870', { seed: 33, freq: 0.01, dabs: 40, rim: '#eaf8c8' });
  o.save(); o.lineCap = 'round'; const riv = () => { o.beginPath(); o.moveTo(150, 290); o.bezierCurveTo(130, 320, 230, 330, 200, 360); o.bezierCurveTo(180, 380, 60, 380, -20, 400); };
  o.strokeStyle = '#7ab8c0'; o.lineWidth = 22; riv(); o.stroke(); o.strokeStyle = '#b8ecf0'; o.lineWidth = 12; riv(); o.stroke(); o.strokeStyle = 'rgba(255,255,255,0.8)'; o.lineWidth = 2; o.setLineDash([6, 12]); riv(); o.stroke(); o.restore();
  P.hills(o, W, 380, 24, '#a8d070', '#7cae50', { seed: 35, freq: 0.012, dabs: 70, rim: '#f0ffc8' });
  // orchard behind the beds: fig, olive, pomegranate
  P.tree(o, 30, 400, 1.15, '#5a9448', 11); P.tree(o, 120, 380, 0.8, '#6aa452', 13); P.tree(o, 230, 384, 0.75, '#5e9c4c', 17);
  const r = P.rng(8); for (const [tx, ty, sc] of [[30, 400, 1.15], [120, 380, 0.8], [230, 384, 0.75]]) for (let i = 0; i < 6; i++) { const x = tx + (r() - 0.5) * 64 * sc, y = ty - 70 * sc + (r() - 0.5) * 36 * sc; o.fillStyle = ['#d8404a', '#7a3a7a', '#e8902a'][i % 3]; o.beginPath(); o.arc(x, y, 4 * sc, 0, 7); o.fill(); o.fillStyle = 'rgba(255,255,255,0.5)'; o.beginPath(); o.arc(x - 1.2, y - 1.2, 1.3 * sc, 0, 7); o.fill(); }
  // a sandy path to Eve
  o.fillStyle = '#e8d0a0'; o.beginPath(); o.moveTo(260, 470); o.quadraticCurveTo(300, 420, 360, 412); o.lineTo(360, 470); o.closePath(); o.fill();
  P.hills(o, W, 470, 10, '#9ccc68', '#6c9e44', { seed: 37, freq: 0.01, dabs: 100, rim: '#e0f8b0' });
  P.grassTufts(o, W, 470, 520, 40, '#78a848', 5); P.flowers(o, W, 470, 515, 18, ['#ffffff', '#ffd84a', '#ff9ab8'], 6);
  // the long garden bed of rich dark soil
  const bed = o.createLinearGradient(0, 520, 0, 640); bed.addColorStop(0, '#7a4a2e'); bed.addColorStop(1, '#4a2a1a'); o.fillStyle = bed;
  o.beginPath(); o.moveTo(-10, 535); for (let x = -10; x <= W + 10; x += 10) o.lineTo(x, 528 + Math.sin(x * 0.05) * 4); o.lineTo(W + 10, 640); o.lineTo(-10, 640); o.closePath(); o.fill();
  for (let i = 0; i < 220; i++) { const x = r() * W, y = 532 + r() * 108; o.fillStyle = r() < 0.5 ? 'rgba(160,100,60,0.35)' : 'rgba(40,20,10,0.3)'; o.beginPath(); o.ellipse(x, y, 2 + r() * 4, 1 + r() * 1.5, 0, 0, 7); o.fill(); }
  // furrows
  o.strokeStyle = 'rgba(40,20,10,0.25)'; o.lineWidth = 2; for (let k = 0; k < 4; k++) { o.beginPath(); for (let x = -10; x <= W + 10; x += 10) { const yy = 560 + k * 20 + Math.sin(x * 0.04 + k) * 2; x === -10 ? o.moveTo(x, yy) : o.lineTo(x, yy); } o.stroke(); }
  // a little stone edging
  for (let x = 6; x < W; x += 22) { const y = 530 + Math.sin(x * 0.05) * 4; const gr = o.createLinearGradient(0, y - 6, 0, y + 6); gr.addColorStop(0, '#d8c8b0'); gr.addColorStop(1, '#9a8a78'); o.fillStyle = gr; o.beginPath(); o.ellipse(x, y, 11, 6, 0, 0, 7); o.fill(); }
}

function drawPlant(c, p, t, s) {
  const prog = p.ok ? 1 : Math.min(1, p.w / s.need) * 0.5, perk = p.ok ? back((t - p.okT) / 0.5) : prog;
  const breeze = Math.sin(t * 2 + p.ph) * 0.04;
  // wet soil mound
  const wet = Math.min(1, p.w / s.need);
  c.fillStyle = P.mix('#8a5a3a', '#4a2a1e', wet); c.beginPath(); c.ellipse(p.x, p.y + 4, 30, 9, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,220,180,0.18)'; c.beginPath(); c.ellipse(p.x - 6, p.y + 1, 18, 4, 0, 0, 7); c.fill();
  if (wet > 0) { c.fillStyle = `rgba(150,210,255,${0.25 * wet})`; c.beginPath(); c.ellipse(p.x, p.y + 6, 24 * wet + 4, 5, 0, 0, 7); c.fill(); }
  // stem: a droop that curls over, straightening as it drinks
  const droop = (1 - perk) * 1, h = p.h * (0.75 + 0.25 * perk), lean = p.lean;
  const tipX = p.x + lean * (droop * 34) + breeze * h, tipY = p.y - h + droop * h * 0.55;
  const cx = p.x + lean * (droop * 26), cy = p.y - h * (0.85 - droop * 0.05);
  const col = P.mix('#9a9a4a', '#4aa83a', perk), dark = P.shade(col, -0.3);
  c.lineCap = 'round'; c.strokeStyle = dark; c.lineWidth = 7.5; c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(cx, cy, tipX, tipY); c.stroke();
  c.strokeStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(cx, cy, tipX, tipY); c.stroke();
  // leaves: limp and hanging, then lifting up and out
  for (let i = 0; i < 4; i++) {
    const q = 0.25 + i * 0.17, bx = (1 - q) * (1 - q) * p.x + 2 * (1 - q) * q * cx + q * q * tipX, by = (1 - q) * (1 - q) * p.y + 2 * (1 - q) * q * cy + q * q * tipY, side = i % 2 ? 1 : -1;
    const ang = side * (0.5 + 0.5 * perk) * -1 + (1 - perk) * 1.2 * side + Math.PI / 2 * side * 0 + breeze * 3;
    c.save(); c.translate(bx, by); c.rotate(side > 0 ? -0.6 * perk + (1 - perk) * 0.9 + breeze * 4 : Math.PI + 0.6 * perk - (1 - perk) * 0.9 + breeze * 4);
    const L = 20 + perk * 8; const lg = c.createLinearGradient(0, 0, L, 0); lg.addColorStop(0, P.shade(col, -0.2)); lg.addColorStop(1, P.shade(col, 0.25)); c.fillStyle = lg;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * 0.5, -9, L, 0); c.quadraticCurveTo(L * 0.5, 9, 0, 0); c.fill(); c.strokeStyle = P.rgba(dark, 0.6); c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(L * 0.85, 0); c.stroke(); c.restore();
    void ang;
  }
  // the bud or flower
  c.save(); c.translate(tipX, tipY); c.rotate(lean * droop * 2.2 + breeze * 2);
  if (!p.ok) {
    const bs = 7 + prog * 4; c.fillStyle = P.mix('#8a9a4a', '#5aa83a', prog); c.beginPath(); c.ellipse(0, -bs * 0.6, bs * 0.75, bs, 0, 0, 7); c.fill();
    c.fillStyle = P.rgba(p.k.petal, 0.4 + prog * 0.6); c.beginPath(); c.ellipse(0, -bs * 1.1, bs * 0.4, bs * 0.55, 0, 0, 7); c.fill();
    // a sad little face on the bud until it's watered
    if (prog < 0.35) { c.strokeStyle = '#3a3a1a'; c.lineWidth = 1.4; c.beginPath(); c.arc(-3, -bs * 0.4, 1.6, 0.2, Math.PI - 0.2); c.moveTo(4.6, -bs * 0.4); c.arc(3, -bs * 0.4, 1.6, 0.2, Math.PI - 0.2); c.stroke(); }
  } else {
    const k = back((t - p.okT) / 0.45), sz = 1.0 * k; drawFlower(c, p.k, sz, t + p.ph);
  }
  c.restore();
  // a progress ring around the plant while it drinks
  if (!p.ok && p.w > 0) { const q = Math.min(1, p.w / s.need); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 5; c.beginPath(); c.arc(p.x, p.y - 44, 40, 0, 7); c.stroke(); c.strokeStyle = '#8ae0ff'; c.lineWidth = 5; c.beginPath(); c.arc(p.x, p.y - 44, 40, -Math.PI / 2, -Math.PI / 2 + q * Math.PI * 2); c.stroke(); }
  // sparkles around a happy bloom
  if (p.ok) { const q = t - p.okT; for (let i = 0; i < 4; i++) { const a = q * 1.4 + i * 1.57, rr = 34 + Math.sin(q * 3 + i) * 5, tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 2); c.fillStyle = `rgba(255,250,210,${0.8 * tw})`; drawStar(c, tipX + Math.cos(a) * rr, tipY + Math.sin(a) * rr * 0.7, 4 + tw * 2, t); } }
}
function drawFlower(c, k, s, t) {
  c.save(); c.scale(s, s);
  const halo = c.createRadialGradient(0, -14, 2, 0, -14, 40); halo.addColorStop(0, P.rgba(k.petal, 0.4)); halo.addColorStop(1, P.rgba(k.petal, 0)); c.fillStyle = halo; c.fillRect(-40, -54, 80, 80);
  if (k.f === 'tulip') { const g = c.createLinearGradient(0, -36, 0, 0); g.addColorStop(0, P.shade(k.petal, 0.2)); g.addColorStop(1, P.shade(k.petal, -0.25)); c.fillStyle = g; c.beginPath(); c.moveTo(-14, -30); c.lineTo(-7, -20); c.lineTo(0, -34); c.lineTo(7, -20); c.lineTo(14, -30); c.quadraticCurveTo(18, -4, 0, 0); c.quadraticCurveTo(-18, -4, -14, -30); c.fill(); c.strokeStyle = P.shade(k.petal, -0.4); c.lineWidth = 1.5; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-6, -14, 3, 9, 0.2, 0, 7); c.fill(); }
  else if (k.f === 'bell') { for (const dx of [-12, 0, 12]) { c.save(); c.translate(dx, dx === 0 ? -24 : -14); const g = c.createRadialGradient(-3, -6, 1, 0, 0, 13); g.addColorStop(0, P.shade(k.petal, 0.35)); g.addColorStop(1, k.petal); c.fillStyle = g; c.beginPath(); c.moveTo(-9, 6); c.quadraticCurveTo(-11, -12, 0, -12); c.quadraticCurveTo(11, -12, 9, 6); c.lineTo(5, 3); c.lineTo(0, 7); c.lineTo(-5, 3); c.closePath(); c.fill(); c.strokeStyle = P.shade(k.petal, -0.35); c.lineWidth = 1.2; c.stroke(); c.restore(); } }
  else {
    const n = k.f === 'sun' ? 12 : k.f === 'rose' ? 7 : 9, R = k.f === 'sun' ? 20 : 17, cy = -16;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.sin(t * 1.5) * 0.04; c.save(); c.translate(0, cy); c.rotate(a); const g = c.createLinearGradient(0, 0, 0, -R); g.addColorStop(0, P.shade(k.petal, -0.18)); g.addColorStop(1, P.shade(k.petal, 0.25)); c.fillStyle = g; c.beginPath(); c.ellipse(0, -R * 0.55, k.f === 'rose' ? 9 : 5.5, R * 0.55, 0, 0, 7); c.fill(); c.strokeStyle = P.shade(k.petal, -0.3); c.lineWidth = 1; c.stroke(); c.restore(); }
    const g = c.createRadialGradient(-2, cy - 2, 1, 0, cy, k.f === 'sun' ? 10 : 7); g.addColorStop(0, P.shade(k.mid, 0.35)); g.addColorStop(1, k.mid); c.fillStyle = g; c.beginPath(); c.arc(0, cy, k.f === 'sun' ? 10 : 7, 0, 7); c.fill();
  }
  // a tiny smile: the plant is happy again
  c.strokeStyle = '#4a2a20'; c.lineWidth = 1.6; c.lineCap = 'round'; const fy = k.f === 'tulip' ? -14 : k.f === 'bell' ? -24 : -16;
  c.beginPath(); c.arc(-3.2, fy - 1, 1.6, Math.PI * 1.1, Math.PI * 1.9); c.moveTo(4.8, fy - 1); c.arc(3.2, fy - 1, 1.6, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  c.beginPath(); c.arc(0, fy + 1.5, 2.4, 0.2, Math.PI - 0.2); c.stroke();
  c.restore();
}
function drawJug(c, x, y, tilt, t) {
  c.save(); c.translate(x, y); c.rotate(tilt);
  c.fillStyle = 'rgba(40,20,10,0.18)'; c.beginPath(); c.ellipse(4, 34, 30, 6, 0, 0, 7); c.fill();
  // handle
  c.strokeStyle = '#8a3e1e'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.arc(30, -2, 17, -1.3, 1.3); c.stroke(); c.strokeStyle = '#c8683a'; c.lineWidth = 4; c.beginPath(); c.arc(30, -2, 17, -1.2, 1.2); c.stroke();
  // spout
  const sg = c.createLinearGradient(-50, -10, -10, 10); sg.addColorStop(0, '#e08a52'); sg.addColorStop(1, '#a8502a'); c.fillStyle = sg; c.strokeStyle = '#6a2a14'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-14, -4); c.lineTo(-46, -20); c.lineTo(-50, -14); c.lineTo(-16, 12); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#5a2a14'; c.beginPath(); c.ellipse(-48, -17, 4, 6, 0.6, 0, 7); c.fill();
  // clay body
  const g = c.createRadialGradient(-10, -16, 3, 0, 4, 38); g.addColorStop(0, '#f4a870'); g.addColorStop(0.6, '#d2703e'); g.addColorStop(1, '#94401e'); c.fillStyle = g; c.strokeStyle = '#6a2a14'; c.lineWidth = 2.2;
  c.beginPath(); c.moveTo(-14, -26); c.quadraticCurveTo(-34, -6, -26, 20); c.quadraticCurveTo(-18, 34, 0, 34); c.quadraticCurveTo(18, 34, 26, 20); c.quadraticCurveTo(34, -6, 14, -26); c.closePath(); c.fill(); c.stroke();
  // neck and rim with water inside
  c.fillStyle = '#c8683a'; c.beginPath(); c.ellipse(0, -27, 16, 5, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#6ac8f0'; c.beginPath(); c.ellipse(0, -27, 12, 3, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(-6, -28, 5, 1.2);
  // painted band
  c.strokeStyle = '#fff0d0'; c.lineWidth = 3; c.beginPath(); c.moveTo(-27, 2); c.quadraticCurveTo(0, 10, 27, 2); c.stroke(); c.fillStyle = '#3a8a8a'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * 9, 9 - Math.abs(i) * 1.2, 2.4, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-14, -10, 5, 11, 0.3, 0, 7); c.fill();
  c.restore();
}
function butterfly(c, x, y, ph, col) {
  const f = Math.abs(Math.sin(ph)); c.save(); c.translate(x, y);
  c.fillStyle = col; c.strokeStyle = P.shade(col, -0.4); c.lineWidth = 1;
  for (const sx of [-1, 1]) { c.save(); c.scale(sx * (0.3 + 0.7 * f), 1); c.beginPath(); c.ellipse(5, -3, 6, 5, -0.4, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(4, 4, 4, 3.5, 0.4, 0, 7); c.fill(); c.stroke(); c.restore(); }
  c.fillStyle = '#4a2a3a'; c.fillRect(-1, -5, 2, 10); c.restore();
}
