// TELL! — John 20:18. Mary Magdalene, the first to see the risen Jesus, runs from the garden to tell his friends "I have seen the Lord!"
// Mash taps to make her run (the world scrolls past, flowers fly); when she reaches the house, the sad friends light up with joy.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const MARY = { skin: SK[2], robe: CL.rose, stripe: CL.cream, hairStyle: 'long', hair: HR[1] };
const FRIENDS = [
  { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly' },
  { skin: SK[1], robe: CL.teal, stripe: CL.cream, hair: HR[2] },
  { skin: SK[3], robe: CL.indigo, stripe: CL.saffron, hairStyle: 'bun', hair: HR[0] },
  { skin: SK[0], robe: CL.olive, stripe: CL.cream, beard: true, hair: HR[1] },
];
const GY = 530, MX = 108; // ground line, Mary's screen x

function limb(c, ax, ay, bx, by, w, col, out) { c.lineCap = 'round'; c.strokeStyle = out; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
// Mary running: legs and a flowing robe drawn under P.person, which is clipped above the knees
function runner(c, x, y, s, phase, o) {
  const a = Math.sin(phase), b = Math.cos(phase), lift = Math.abs(b) * 5;
  c.save(); c.translate(x, y - lift); c.scale(s, s); c.rotate(0.1);
  c.fillStyle = 'rgba(40,20,40,0.2)'; c.beginPath(); c.ellipse(0, lift / s, 16, 4, 0, 0, 7); c.fill();
  for (const sd of [1, -1]) { const k = sd * a; limb(c, 0, -14, k * 13, -1 - Math.max(0, -k) * 5, 5.6, o.skin, P.shade(o.skin, -0.4)); c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(k * 13 + 2, -1 - Math.max(0, -k) * 5, 5, 2.8, 0.1, 0, 7); c.fill(); }
  c.restore();
  c.save(); c.translate(x, y - lift); c.rotate(0.1); c.translate(-x, -(y - lift));
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - lift - 120 * s, 120 * s, 104 * s); c.clip(); P.person(c, x, y - lift, s, { ...o, bounce: 0, arms: 'out' }); c.restore();
  // the skirt, swishing as she runs
  const rg = c.createLinearGradient(x - 15 * s, 0, x + 15 * s, 0); rg.addColorStop(0, P.shade(o.robe, 0.15)); rg.addColorStop(1, P.shade(o.robe, -0.15)); c.fillStyle = rg; c.strokeStyle = P.shade(o.robe, -0.45); c.lineWidth = 1.6;
  const sw = a * 4 * s, top = y - lift - 17 * s;
  c.beginPath(); c.moveTo(x - 12.6 * s, top); c.lineTo(x + 12.6 * s, top); c.quadraticCurveTo(x + 18 * s, top + 8 * s, x + 16 * s + sw - 8 * s, top + 13 * s); c.quadraticCurveTo(x, top + 15 * s, x - 22 * s + sw, top + 12 * s); c.quadraticCurveTo(x - 17 * s, top + 6 * s, x - 12.6 * s, top); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = P.rgba(o.stripe, 0.8); c.beginPath(); c.moveTo(x - 3.5 * s, top); c.lineTo(x + 3.5 * s, top); c.lineTo(x + 2 * s + sw * 0.4, top + 14 * s); c.lineTo(x - 5 * s + sw * 0.4, top + 14 * s); c.closePath(); c.fill();
  c.restore();
  // hair streaming behind
  c.fillStyle = P.shade(o.hair, -0.05); const hy = y - lift - 58 * s, hx = x - 10 * s;
  c.beginPath(); c.moveTo(hx + 4 * s, hy - 8 * s); c.quadraticCurveTo(hx - 20 * s, hy - 4 * s + a * 3, hx - 26 * s, hy + 8 * s + b * 3); c.quadraticCurveTo(hx - 12 * s, hy + 6 * s, hx + 2 * s, hy + 12 * s); c.closePath(); c.fill();
}
function house(c, x, t, joy, jt) {
  const by = GY + 2;
  c.save(); c.translate(x, 0);
  c.fillStyle = 'rgba(40,20,30,0.25)'; c.fillRect(-4, by - 4, 210, 10);
  // the courtyard wall and the house with an upper room
  const wg = c.createLinearGradient(0, by - 230, 200, by); wg.addColorStop(0, '#f6ddb4'); wg.addColorStop(1, '#d4a878'); c.fillStyle = wg; c.fillRect(0, by - 150, 200, 150);
  c.fillStyle = '#e6c49a'; c.fillRect(60, by - 236, 140, 90);
  c.fillStyle = '#b8865a'; c.fillRect(-4, by - 156, 208, 8); c.fillRect(56, by - 242, 148, 8); c.fillStyle = '#f8e2c0'; c.fillRect(-4, by - 156, 208, 2); c.fillRect(56, by - 242, 148, 2);
  c.strokeStyle = 'rgba(140,90,50,0.25)'; c.lineWidth = 1; for (let y = by - 140; y < by; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(200, y); c.stroke(); }
  // outside stair to the roof
  c.fillStyle = '#c8986a'; for (let i = 0; i < 8; i++) c.fillRect(176 - i * 0, by - 18 - i * 17, 24, 6);
  // the windows of the room where the friends wait behind locked doors
  for (const [wx, wy, ww, wh] of [[24, by - 120, 44, 60], [92, by - 120, 44, 60], [86, by - 214, 40, 46], [140, by - 214, 40, 46]]) {
    c.fillStyle = '#5a3424'; roundRect(c, wx - 4, wy - 4, ww + 8, wh + 8, 6); c.fill();
    const lg = c.createLinearGradient(0, wy, 0, wy + wh); lg.addColorStop(0, joy ? '#fff2b8' : '#5a4a68'); lg.addColorStop(1, joy ? '#ffc86a' : '#3a3050'); c.fillStyle = lg; roundRect(c, wx, wy, ww, wh, 4); c.fill();
  }
  // the door
  c.fillStyle = '#5a3424'; c.beginPath(); c.moveTo(144, by); c.lineTo(144, by - 62); c.arc(160, by - 62, 16, Math.PI, 0); c.lineTo(176, by); c.fill();
  const dg = c.createLinearGradient(146, 0, 174, 0); dg.addColorStop(0, joy ? '#ffe9a8' : '#8a5a34'); dg.addColorStop(1, joy ? '#ffc26a' : '#6a4024'); c.fillStyle = dg; c.beginPath(); c.moveTo(147, by); c.lineTo(147, by - 62); c.arc(160, by - 62, 13, Math.PI, 0); c.lineTo(173, by); c.fill();
  c.fillStyle = '#e8b85a'; c.beginPath(); c.arc(168, by - 34, 2.4, 0, 7); c.fill();
  // friends' faces at the windows
  const spots = [[46, by - 64], [114, by - 64], [106, by - 166], [160, by - 166]];
  spots.forEach(([fx, fy], i) => {
    c.save(); const wx = [24, 92, 86, 140][i], wy = [by - 120, by - 120, by - 214, by - 214][i], ww = i < 2 ? 44 : 40, wh = i < 2 ? 60 : 46;
    roundRect(c, wx, wy, ww, wh, 4); c.clip(); const jump = joy ? Math.abs(Math.sin((t - jt) * 9 + i)) * 6 : 0;
    P.person(c, fx, fy + 20 - jump, 1.05, { ...FRIENDS[i], facing: -1, t, phase: i * 1.3, bounce: joy ? 0 : 0.4, expr: joy ? (i % 2 ? 'laugh' : 'wow') : 'sad', arms: joy ? 'cheer' : 'down' });
    c.restore();
  });
  if (joy) { c.save(); c.globalCompositeOperation = 'screen'; for (const [fx, fy] of spots) glow(c, fx, fy - 20, 60, '#ffd890', 0.35); glow(c, 160, by - 40, 90, '#ffd890', 0.4); c.restore(); }
  c.restore();
}
function paintSky(o) {
  P.sky(o, W, H, ['#5aa0e0', '#9ccdf0', '#ffe4c4', '#ffc898'], { x: 70, y: 190, r: 28, color: '#fff2c0', glow: 280 });
  P.cloud(o, 250, 300, 1.1, '#fff4ea', '#e8c0c8', 0.55);
  P.hills(o, W, 350, 60, '#b4a8d4', '#a49ac8', { seed: 81, freq: 0.008, dabs: 10, bottom: 520 });
  P.hills(o, W, 392, 40, '#a8b0d0', '#98a4c4', { seed: 83, freq: 0.012, dabs: 10, bottom: 520, rim: '#f0e0f0' });
  const mist = o.createLinearGradient(0, 360, 0, 430); mist.addColorStop(0, 'rgba(255,236,214,0)'); mist.addColorStop(1, 'rgba(255,236,214,0.6)'); o.fillStyle = mist; o.fillRect(0, 360, W, 80);
}
function paintFar(o) { // one tile of the rolling distant scenery, 360 wide, repeats seamlessly
  o.fillStyle = 'rgba(0,0,0,0)';
  const ridge = (base, amp, col1, col2, seed) => { o.beginPath(); o.moveTo(0, 640); for (let x = 0; x <= 360; x += 6) { const y = base - amp * (0.5 + 0.5 * Math.sin(x / 360 * Math.PI * 4 + seed)) * (0.7 + 0.3 * Math.sin(x / 360 * Math.PI * 2 * 3 + seed * 2)); o.lineTo(x, y); } o.lineTo(360, 640); o.closePath(); const g = o.createLinearGradient(0, base - amp, 0, base + 80); g.addColorStop(0, col1); g.addColorStop(1, col2); o.fillStyle = g; o.fill(); };
  ridge(420, 30, '#a8c890', '#94b880', 3);
  for (const [x, y, s] of [[30, 420, 0.32], [70, 414, 0.3], [200, 416, 0.34], [300, 420, 0.3], [340, 414, 0.28]]) P.tree(o, x, y, s, '#7aa462', Math.floor(x) + 2);
  for (const [x, w, h] of [[110, 26, 22], [134, 22, 30], [152, 28, 18]]) P.house(o, x, 424, w, h, '#f0dcb8', { window: false });
  ridge(470, 34, '#9ec080', '#86a870', 1);
  for (const [x, s] of [[40, 0.6], [140, 0.52], [250, 0.66], [320, 0.5]]) P.tree(o, x, 480, s, '#6f9a52', Math.floor(x));
  o.fillStyle = '#d8c0a0'; o.fillRect(170, 484, 70, 10); o.fillStyle = '#ecd8b8'; o.fillRect(170, 484, 70, 3);
  for (const [x, h] of [[12, 70], [192, 84], [356, 60]]) { const cg = o.createLinearGradient(x - 8, 0, x + 8, 0); cg.addColorStop(0, '#3f6a48'); cg.addColorStop(1, '#6a9a5a'); o.fillStyle = cg; o.beginPath(); o.moveTo(x, 500 - h); o.quadraticCurveTo(x + 11, 500 - h * 0.4, x + 6, 500); o.lineTo(x - 6, 500); o.quadraticCurveTo(x - 11, 500 - h * 0.4, x, 500 - h); o.fill(); }
}
function paintNear(o) { // the garden path in the foreground, one 360-wide tile
  const g = o.createLinearGradient(0, GY - 30, 0, 640); g.addColorStop(0, '#9ac86a'); g.addColorStop(1, '#5a8a3e'); o.fillStyle = g; o.fillRect(0, GY - 24, 360, 640 - GY + 24);
  o.fillStyle = '#c8e090'; o.fillRect(0, GY - 24, 360, 3);
  const pg = o.createLinearGradient(0, GY - 8, 0, GY + 30); pg.addColorStop(0, '#f0d4a0'); pg.addColorStop(1, '#d4a86e'); o.fillStyle = pg; o.fillRect(0, GY - 8, 360, 34);
  const r = P.rng(91); o.fillStyle = 'rgba(160,110,70,0.35)'; for (let i = 0; i < 24; i++) { o.beginPath(); o.ellipse(r() * 360, GY - 4 + r() * 28, 3 + r() * 5, 1.5 + r() * 2, 0, 0, 7); o.fill(); }
  o.fillStyle = 'rgba(255,240,210,0.6)'; for (let i = 0; i < 16; i++) { o.beginPath(); o.ellipse(r() * 360, GY + r() * 24, 2 + r() * 3, 1, 0, 0, 7); o.fill(); }
  P.grassTufts(o, 360, GY + 34, 640, 50, '#6a9a3a', 92); P.grassTufts(o, 360, GY - 22, GY - 10, 26, '#7aa84a', 93);
  P.flowers(o, 360, GY + 36, 640, 28, ['#ffffff', '#f4d35e', '#e05a6a', '#b98ae0', '#ff9ac0'], 94);
  P.flowers(o, 360, GY - 22, GY - 12, 12, ['#ffffff', '#f4d35e', '#e05a6a'], 95);
}

MG.add({
  id: 'tell', stage: 'easter', cmd: 'TELL!', hint: 'mash', time: 5, mood: 'bright', winText: 'Good news!',
  card: { title: 'Mary tells the news', ref: 'John 20:1–18', kind: 'Gospel story', text: 'The Gospel of John tells how Mary Magdalene found the tomb empty and stood outside it, crying. Then she met Jesus, alive again, and he called her by her name. She ran to his friends and became the first person to tell the Easter news: "I have seen the Lord!"', ask: 'What is some good news you could share with someone today?' },
  init(g) {
    const s = g.s; s.dist = 0; s.vel = 0; s.goal = [560, 760, 900][g.level]; s.phase = 0; s.flowers = []; s.arrived = -9; s.taps = 0; s.drag = [2.6, 2.4, 2.2][g.level];
  },
  down(g, x, y) {
    const s = g.s; if (s.arrived > 0) return; s.taps++;
    s.vel = Math.min(520, s.vel + 120); g.sfx(s.taps % 2 ? 'tap' : 'pop');
    for (let i = 0; i < 2; i++) s.flowers.push({ x: MX - 10, y: GY - 30 - Math.random() * 30, vx: -60 - Math.random() * 140, vy: -120 - Math.random() * 140, t: g.t, col: ['#ffffff', '#f4d35e', '#ff9ac0', '#e05a6a', '#b98ae0'][Math.floor(Math.random() * 5)], rot: Math.random() * 6 });
  },
  update(g, dt) {
    const s = g.s;
    if (s.arrived < 0) {
      s.dist += s.vel * dt; s.vel = Math.max(0, s.vel - s.vel * s.drag * dt - 30 * dt); s.phase += s.vel * dt * 0.07;
      if (s.dist >= s.goal) { s.dist = s.goal; s.arrived = g.t; s.vel = 0; g.sfx('cheer'); g.sfx('trumpet'); g.win(); g.burst(MX + 60, GY - 120, ['#ffd45a', '#fff6c0', '#ff8ab0', '#8fd8ff'], 30, 240); }
    }
    for (const f of s.flowers) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 300 * dt; f.rot += dt * 6; }
    s.flowers = s.flowers.filter(f => g.t - f.t < 1.2);
  },
  auto(g, dt, synth) { const s = g.s, k = Math.floor(g.t / 0.11); if (g.t > 0.3 && k !== s.botK) { s.botK = k; synth('down', 180, 400); synth('up', 180, 400); } },
  draw(g, c) {
    const s = g.s, t = g.t, joy = s.arrived > 0, cam = s.dist;
    c.drawImage(g.bake('easter_tell_sky', paintSky), 0, 0, W, H);
    P.rays(c, 70, 190, W, H * 0.6, '#fff6d0', 0.12, 9, t);
    for (let i = 0; i < 4; i++) { const bx = ((i * 97 + 380 - t * (24 + i * 6) - cam * 0.08) % 420 + 420) % 420 - 30, by = 120 + i * 34 + Math.sin(t * 2 + i) * 6, f = Math.sin(t * 9 + i * 2) * 4; c.strokeStyle = 'rgba(90,70,110,0.7)'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 8, by - f); c.quadraticCurveTo(bx - 4, by - 4, bx, by); c.quadraticCurveTo(bx + 4, by - 4, bx + 8, by - f); c.stroke(); }
    P.cloud(c, ((300 - cam * 0.05 - t * 6) % 460 + 460) % 460 - 50, 90, 0.85, '#fffaf0', '#e8c8d8', 0.95);
    P.cloud(c, ((150 - cam * 0.05 - t * 4) % 460 + 460) % 460 - 50, 250, 0.55, '#fffaf0', '#e8c8d8', 0.85);
    const far = g.bake('easter_tell_far', paintFar), near = g.bake('easter_tell_near', paintNear);
    const fo = -((cam * 0.35) % 360); c.drawImage(far, fo, 0, W, H); c.drawImage(far, fo + 360, 0, W, H);
    // the garden tomb, left behind at the start, and the house at the finish
    const tx = MX - 150 - cam; if (tx > -200) { c.fillStyle = '#c8a084'; c.beginPath(); c.moveTo(tx - 120, GY); c.quadraticCurveTo(tx - 90, GY - 110, tx + 10, GY - 104); c.quadraticCurveTo(tx + 80, GY - 90, tx + 90, GY); c.fill(); c.fillStyle = '#ffe6a0'; c.beginPath(); c.moveTo(tx - 20, GY); c.lineTo(tx - 20, GY - 40); c.arc(tx, GY - 40, 20, Math.PI, 0); c.lineTo(tx + 20, GY); c.fill(); c.save(); c.globalCompositeOperation = 'screen'; glow(c, tx, GY - 30, 70, '#ffe6a0', 0.6); c.restore(); }
    const hx = MX + 58 + (s.goal - cam);
    if (hx < W + 40) house(c, hx, t, joy, s.arrived);
    const no = -(cam % 360); c.drawImage(near, no, 0, W, H); c.drawImage(near, no + 360, 0, W, H);
    // a glowing goal marker over the far-off house while it is still out of sight
    if (hx > W - 20 && !joy) { const pu = 0.5 + 0.5 * Math.sin(t * 6); c.save(); c.globalCompositeOperation = 'screen'; glow(c, W - 10, GY - 90, 70, '#ffd890', 0.3 + 0.25 * pu); c.restore(); c.fillStyle = `rgba(255,248,220,${0.6 + 0.4 * pu})`; for (let i = 0; i < 3; i++) { const ax = W - 64 + i * 16 + pu * 6; c.beginPath(); c.moveTo(ax, GY - 100); c.lineTo(ax + 10, GY - 90); c.lineTo(ax, GY - 80); c.closePath(); c.fill(); } }
    // speed streaks
    if (s.vel > 150) { c.strokeStyle = `rgba(255,255,255,${Math.min(0.5, (s.vel - 150) / 600)})`; c.lineWidth = 2; c.lineCap = 'round'; const r = P.rng(Math.floor(t * 12)); for (let i = 0; i < 6; i++) { const y = GY - 110 + r() * 100, x = r() * 90; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30 + r() * 30, y); c.stroke(); } }
    // Mary: idle bounce at first, running when tapped, arms up when she arrives
    const moving = s.vel > 20;
    if (joy) P.person(c, MX + 10, GY + 2, 1.7, { ...MARY, t, phase: 0, bounce: 3, expr: 'laugh', arms: 'cheer' });
    else if (moving) runner(c, MX, GY + 2, 1.7, s.phase, { ...MARY, t, expr: 'laugh' });
    else P.person(c, MX, GY + 2, 1.7, { ...MARY, t, phase: 0, bounce: 2.2, expr: 'wow', arms: 'wave' });
    // heart-shaped news bubble: a sun with a little face (no words)
    if (joy) { const q = Math.min(1, (t - s.arrived) * 4), bx = MX + 62, by = GY - 168; c.save(); c.translate(bx, by); c.scale(q, q); c.fillStyle = 'rgba(255,252,240,0.96)'; c.strokeStyle = '#c88a5a'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 30, 24, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-14, 18); c.lineTo(-26, 34); c.lineTo(-4, 22); c.fill(); c.fillStyle = '#ffc84a'; drawStar(c, 0, 0, 16, t); c.fillStyle = '#fff2b0'; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.restore(); }
    for (const f of s.flowers) { const q = (t - f.t) / 1.2; c.save(); c.globalAlpha = 1 - q; c.translate(f.x, f.y); c.rotate(f.rot); c.fillStyle = f.col; for (let k = 0; k < 5; k++) { const a = k * 1.2566; c.beginPath(); c.arc(Math.cos(a) * 3, Math.sin(a) * 3, 2.6, 0, 7); c.fill(); } c.fillStyle = '#f9b233'; c.beginPath(); c.arc(0, 0, 1.8, 0, 7); c.fill(); c.restore(); }
    // butterflies keep her company
    for (let i = 0; i < 2; i++) { const bx = MX + 30 + i * 140 + Math.sin(t * 1.4 + i * 2) * 30, by = GY - 120 - i * 40 + Math.sin(t * 2.3 + i) * 12, f = Math.abs(Math.sin(t * 14 + i)); c.fillStyle = i ? '#f4d35e' : '#f2a0c8'; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(bx + sd * 4 * f, by - 2, 4 * f + 0.6, 5, sd * 0.3, 0, 7); c.fill(); } }
    P.vignette(c, W, H, 0.25); P.grain(c, W, H, 0.06);
  },
});
