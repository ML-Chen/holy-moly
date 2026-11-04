// SPLASH! — Acts 8:26–39. Philip runs beside the chariot of an Ethiopian court official, the queen's treasurer, who is reading
// Isaiah on the desert road. When they come to water, the official asks, "What is to stop me from being baptized?"
// Tap when the chariot reaches the glowing oasis: they wade in, and he comes up laughing in a rainbow of droplets.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const OFFICIAL = { skin: SK[5], robe: '#2f6a8a', stripe: CL.gold, head: 'wrap', headCol: CL.saffron, hair: HR[3] };
const PHILIP = { skin: SK[2], robe: CL.terracotta, stripe: CL.cream, beard: true, hair: HR[0], hairStyle: 'curly' };
const RY = 452, WX = 196, CS = 1.32; // road line, water centre, half-width of the target zone

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function horse(c, x, y, s, t, run) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,20,30,0.25)'; c.beginPath(); c.ellipse(0, 0, 26, 4.5, 0, 0, 7); c.fill();
  const col = '#c8783e', dk = P.shade(col, -0.3), g = run ? t * 14 : 0;
  c.strokeStyle = dk; c.lineWidth = 4.2; c.lineCap = 'round';
  for (const [lx, ph] of [[-14, 0], [-8, Math.PI], [10, Math.PI * 0.5], [16, Math.PI * 1.5]]) { const sw = run ? Math.sin(g + ph) * 5 : 0; c.beginPath(); c.moveTo(lx, -16); c.lineTo(lx + sw, -1); c.stroke(); }
  c.strokeStyle = '#5a3020'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(-22, -24); c.quadraticCurveTo(-32, -18 + Math.sin(t * 6) * 3, -30, -8); c.stroke();
  c.fillStyle = P.shade(col, 0.1); c.beginPath(); c.ellipse(0, -22, 23, 10, 0, 0, 7); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(14, -28); c.quadraticCurveTo(20, -42, 26, -46); c.lineTo(34, -40); c.quadraticCurveTo(26, -32, 22, -20); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(30, -42, 9, 5.5, 0.5, 0, 7); c.fill();
  c.fillStyle = '#5a3020'; c.beginPath(); c.moveTo(16, -30); c.quadraticCurveTo(18, -44, 26, -48); c.lineTo(24, -42); c.quadraticCurveTo(20, -36, 19, -28); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(24, -47); c.lineTo(25, -54); c.lineTo(28, -47); c.fill();
  P.eye(c, 28, -44, 1.8); P.blush(c, 33, -39, 2);
  c.fillStyle = CL.red; c.fillRect(-6, -32, 14, 4); c.fillStyle = CL.gold; c.fillRect(-6, -29, 14, 2);
  c.restore();
}
function chariot(c, x, y, s, t, run, o) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // pole to the horse
  c.strokeStyle = '#6a3a1e'; c.lineWidth = 3; c.beginPath(); c.moveTo(18, -22); c.lineTo(58, -30); c.stroke();
  // the official, seated, reading his scroll (or arms up once he sees the water)
  if (o) { c.save(); c.beginPath(); c.rect(-60, -140, 120, 100); c.clip(); P.person(c, -2, -18, 1, o); c.restore(); }
  // a parasol for the queen's treasurer
  c.strokeStyle = '#6a3a1e'; c.lineWidth = 2; c.beginPath(); c.moveTo(-22, -40); c.lineTo(-22, -104); c.stroke();
  const pg = c.createLinearGradient(-56, 0, 12, 0); pg.addColorStop(0, '#e8a33a'); pg.addColorStop(1, '#c9443c'); c.fillStyle = pg; c.beginPath(); c.moveTo(-58, -94); c.quadraticCurveTo(-22, -128, 14, -94); c.closePath(); c.fill();
  c.fillStyle = '#f2e6cf'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-52 + i * 12.6, -94, 3.2, 0, Math.PI); c.fill(); }
  // the car
  const cg = c.createLinearGradient(0, -48, 0, -12); cg.addColorStop(0, '#f2c46a'); cg.addColorStop(1, '#b8782e'); c.fillStyle = cg; c.strokeStyle = '#6a3a1e'; c.lineWidth = 1.8;
  c.beginPath(); c.moveTo(-30, -50); c.quadraticCurveTo(-34, -24, -24, -14); c.lineTo(22, -14); c.quadraticCurveTo(28, -30, 24, -44); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#2f6a8a'; c.fillRect(-26, -40, 48, 5); c.fillStyle = '#f6d36a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-20 + i * 10, -26, 2.2, 0, 7); c.fill(); }
  // wheel
  const wr = 17, rot = run ? t * 9 : 0; c.fillStyle = 'rgba(40,20,30,0.25)'; c.beginPath(); c.ellipse(0, 1, 22, 4, 0, 0, 7); c.fill();
  c.strokeStyle = '#5a3018'; c.lineWidth = 4; c.beginPath(); c.arc(0, -wr, wr, 0, 7); c.stroke();
  c.lineWidth = 2; for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3; c.beginPath(); c.moveTo(0, -wr); c.lineTo(Math.cos(a) * wr, -wr + Math.sin(a) * wr); c.stroke(); }
  c.fillStyle = '#e8b85a'; c.beginPath(); c.arc(0, -wr, 3.4, 0, 7); c.fill();
  c.restore();
}
function scroll(c, x, y) { c.fillStyle = '#f6ead0'; c.strokeStyle = '#8a6a4a'; c.lineWidth = 1; c.fillRect(x - 9, y - 6, 18, 9); c.strokeRect(x - 9, y - 6, 18, 9); c.fillStyle = '#a07040'; c.beginPath(); c.arc(x - 9, y - 1.5, 2.6, 0, 7); c.arc(x + 9, y - 1.5, 2.6, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,60,40,0.5)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - 6, y - 4 + i * 2.4); c.lineTo(x + 6, y - 4 + i * 2.4); c.stroke(); } }
function paintDesert(o) {
  P.sky(o, W, H, ['#2f78c8', '#6ab4e8', '#bfe0f0', '#ffe6b8'], { x: 286, y: 110, r: 30, color: '#fff2c0', glow: 260 });
  P.hills(o, W, 236, 50, '#c8a8c0', '#b89ab8', { seed: 129, freq: 0.006, dabs: 8, bottom: 400, rim: '#f8e0e8' });
  P.hills(o, W, 270, 40, '#e0a880', '#d09a78', { seed: 121, freq: 0.009, dabs: 14, bottom: 460, rim: '#ffd8b0' });
  // a far-off caravan on the dunes
  for (let i = 0; i < 4; i++) { o.globalAlpha = 0.5; P.camel(o, 40 + i * 22, 262 + i * 1.5, 0.42, {}); o.globalAlpha = 1; }
  P.hills(o, W, 318, 34, '#eab47a', '#d89a60', { seed: 123, freq: 0.013, dabs: 40, bottom: 480, rim: '#fff0c0' });
  // acacia trees
  for (const [x, y, s] of [[300, 330, 0.8], [40, 344, 0.6]]) { o.save(); o.translate(x, y); o.scale(s, s); o.strokeStyle = '#6a4a2e'; o.lineWidth = 4; o.lineCap = 'round'; o.beginPath(); o.moveTo(0, 0); o.lineTo(-2, -26); o.lineTo(-16, -40); o.moveTo(-2, -26); o.lineTo(12, -42); o.stroke(); const ag = o.createLinearGradient(0, -56, 0, -38); ag.addColorStop(0, '#9ac060'); ag.addColorStop(1, '#5a8a3e'); o.fillStyle = ag; o.beginPath(); o.ellipse(-2, -46, 40, 9, 0, 0, 7); o.fill(); o.restore(); }
  // heat shimmer
  const sh = o.createLinearGradient(0, 300, 0, 380); sh.addColorStop(0, 'rgba(255,240,210,0)'); sh.addColorStop(1, 'rgba(255,240,210,0.4)'); o.fillStyle = sh; o.fillRect(0, 300, W, 80);
  // the sand plain and the road
  const sg = o.createLinearGradient(0, 340, 0, 640); sg.addColorStop(0, '#f2c888'); sg.addColorStop(1, '#d09858'); o.fillStyle = sg; o.fillRect(0, 340, W, 300);
  const r = P.rng(125); for (let i = 0; i < 70; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff0c8' : '#b8804a', 0.12 + r() * 0.12); o.beginPath(); o.ellipse(r() * W, 350 + r() * 290, 8 + r() * 20, 2 + r() * 3, 0, 0, 7); o.fill(); }
  const rg = o.createLinearGradient(0, RY - 14, 0, RY + 14); rg.addColorStop(0, '#e2b07a'); rg.addColorStop(1, '#c89058'); o.fillStyle = rg; o.fillRect(0, RY - 14, W, 26);
  o.strokeStyle = 'rgba(140,90,50,0.35)'; o.lineWidth = 1.4; o.setLineDash([10, 8]); for (const yy of [RY - 6, RY + 6]) { o.beginPath(); o.moveTo(0, yy); o.lineTo(W, yy); o.stroke(); } o.setLineDash([]);
  // the oasis pool beside the road
  o.save(); o.beginPath(); o.ellipse(WX, RY + 40, 96, 34, 0, 0, 7); o.clip();
  P.water(o, W, RY, RY + 80, '#1f7a9a', '#6ad0e0', 0, { waves: 4 });
  o.restore();
  o.strokeStyle = '#a8c070'; o.lineWidth = 5; o.beginPath(); o.ellipse(WX, RY + 40, 97, 35, 0, 0, 7); o.stroke();
  o.fillStyle = 'rgba(120,180,80,0.6)'; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, x = WX + Math.cos(a) * 98, y = RY + 40 + Math.sin(a) * 36; o.beginPath(); o.ellipse(x, y, 7, 3, a, 0, 7); o.fill(); }
  // reeds and palms
  P.palm(o, 70, RY + 70, 1.1, -0.18, 0); P.palm(o, 330, RY + 76, 1.2, 0.12, 0, '#4a9a52'); P.palm(o, 304, RY + 66, 0.8, 0.25, 0);
  o.strokeStyle = '#6a9a3a'; o.lineWidth = 2; o.lineCap = 'round'; for (let i = 0; i < 14; i++) { const x = WX - 90 + i * 13 + r() * 6, y = RY + 66 + Math.sin(i) * 6; o.beginPath(); o.moveTo(x, y); o.quadraticCurveTo(x - 2, y - 14, x + (r() - 0.5) * 8, y - 22 - r() * 10); o.stroke(); }
  P.grassTufts(o, W, RY + 60, 640, 30, '#9aa848', 127);
  P.flowers(o, W, RY + 90, 640, 10, ['#ffffff', '#f4d35e', '#e05a6a'], 128);
}

MG.add({
  id: 'splash', stage: 'acts', cmd: 'SPLASH!', hint: 'tap', time: 5.5, mood: 'desert', winText: 'Splash!',
  card: { title: 'Water in the desert', ref: 'Acts 8:26–39', kind: 'Acts story', text: 'The book of Acts tells about an official from Ethiopia, a man some people thought did not belong. Philip told him about Jesus. When they came to water, the man asked, "What is to stop me from being baptized?" So Philip baptized him.', ask: 'Who might feel left out at school or church? How could you show them they belong?' },
  init(g) {
    const s = g.s; s.x = [10, -30, -50][g.level]; s.speed = [80, 100, 120][g.level] * g.speed; s.ww = [80, 60, 46][g.level]; s.state = 'ride'; s.tapT = -9; s.misses = []; s.drops = []; s.passes = 0; s.dir = 1;
  },
  down(g, x, y) {
    const s = g.s; if (s.state !== 'ride') return;
    if (Math.abs(s.x - WX) < s.ww) { s.state = 'splash'; s.tapT = g.t; g.sfx('splashbig'); g.sfx('laugh'); g.burst(WX, RY + 30, ['#ff6a6a', '#ffb44a', '#ffe85a', '#6ad86a', '#6ab0ff', '#b48aff'], 34, 280); g.win(); }
    else { s.misses.push({ x: Math.max(30, Math.min(330, s.x + 40)), t: g.t }); g.sfx('boing'); }
  },
  update(g, dt) {
    const s = g.s;
    if (s.state === 'ride') { s.x += s.speed * s.dir * dt; if (s.x > W + 80 && s.dir > 0) { s.dir = -1; s.passes++; } else if (s.x < -80 && s.dir < 0) { s.dir = 1; s.passes++; } }
    if (s.state === 'splash' && Math.random() < dt * 40) { const a = Math.PI * (1.1 + Math.random() * 0.8); s.drops.push({ x: WX + 6, y: RY + 6, vx: Math.cos(a) * (80 + Math.random() * 160), vy: Math.sin(a) * (160 + Math.random() * 160), t: g.t, hue: Math.random() * 360 }); }
    for (const d of s.drops) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 420 * dt; }
    s.drops = s.drops.filter(d => g.t - d.t < 1); s.misses = s.misses.filter(m => g.t - m.t < 0.5);
  },
  auto(g, dt, synth) { const s = g.s; if (s.state === 'ride' && Math.abs(s.x - WX) < s.ww * 0.4 && !s.botTap) { s.botTap = 1; synth('down', 180, 300); synth('up', 180, 300); } },
  draw(g, c) {
    const s = g.s, t = g.t, won = s.state === 'splash', wt = t - s.tapT;
    c.drawImage(g.bake('acts_splash_bg', paintDesert), 0, 0, W, H);
    P.rays(c, 286, 110, W, H * 0.6, '#fff6d0', 0.1, 9, t);
    P.cloud(c, 70 + t * 5, 120, 0.7, '#fffaf0', '#d8c8e0', 0.85); P.cloud(c, 200 + t * 3, 190, 0.45, '#fffaf0', '#d8c8e0', 0.7);
    // live water sparkles and the glowing target over the pool
    c.save(); c.beginPath(); c.ellipse(WX, RY + 40, 94, 32, 0, 0, 7); c.clip(); P.water(c, W, RY, RY + 80, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', t, { waves: 3 }); c.restore();
    const near = !won && Math.abs(s.x - WX) < s.ww, pu = 0.5 + 0.5 * Math.sin(t * 6);
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, WX, RY + 34, 110 + (near ? 30 : 0), near ? '#bff4ff' : '#9fe0f0', near ? 0.65 : 0.25 + 0.15 * pu); c.restore();
    if (near) { c.strokeStyle = `rgba(255,255,255,${0.7 + 0.3 * pu})`; c.lineWidth = 3; c.beginPath(); c.ellipse(WX, RY + 40, 60 + pu * 14, 18 + pu * 5, 0, 0, 7); c.stroke(); }
    if (!won) {
      // the chariot rolls along; Philip runs beside it
      const run = true, cx = s.x, f = s.dir;
      c.save(); c.translate(cx, 0); c.scale(f, 1); c.translate(-cx, 0);
      horse(c, cx + 66 * CS, RY + 2, CS, t, run);
      chariot(c, cx, RY + 2, CS, t, run, { ...OFFICIAL, t, bounce: 1.5, expr: near ? 'wow' : 'happy', arms: near ? 'cheer' : 'hold', hold: near ? null : (cc, hx, hy) => scroll(cc, hx, hy) });
      c.restore();
      const px = cx - f * 66, ph = t * 12;
      P.person(c, px, RY + 32, 1.3, { ...PHILIP, facing: f, t, phase: 0, bounce: 3.5, expr: near ? 'laugh' : 'happy', arms: near ? 'out' : 'wave' });
      c.fillStyle = 'rgba(232,200,150,0.6)'; for (let i = 0; i < 4; i++) { const q = ((t * 3 + i * 0.25) % 1); c.globalAlpha = 1 - q; c.beginPath(); c.arc(cx - f * (30 + q * 50), RY - 2 - q * 10, 4 + q * 6, 0, 7); c.fill(); c.globalAlpha = 1; }
    } else {
      // the chariot waits on the road; both men are in the water, the official coming up laughing
      chariot(c, WX + 106, RY - 4, 1.1, t, false, null);
      horse(c, WX + 106 + 72, RY - 4, 1.1, t, false);
      c.save(); c.beginPath(); c.rect(0, 0, W, RY + 36); c.clip();
      const up = Math.min(1, wt * 2.5), oy = RY + 76 - up * 24;
      P.person(c, WX - 40, RY + 76, 1.35, { ...PHILIP, t, phase: 1, bounce: 2, expr: 'laugh', arms: 'cheer' });
      P.person(c, WX + 22, oy, 1.45, { ...OFFICIAL, t, phase: 0, bounce: 3, expr: 'laugh', arms: 'cheer' });
      c.restore();
      c.fillStyle = 'rgba(106,208,224,0.55)'; c.beginPath(); c.ellipse(WX - 8, RY + 37, 62, 6, 0, 0, 7); c.fill();
      // ripples round their waists
      c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { const q = ((wt * 1.4 + i / 3) % 1); c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(WX - 6, RY + 38, 30 + q * 50, 5 + q * 8, 0, 0, 7); c.stroke(); } c.globalAlpha = 1;
      // a rainbow arching over the pool
      const k = Math.min(1, wt * 1.6); c.save(); c.globalAlpha = 0.55 * k; c.lineWidth = 6; ['#ff6a6a', '#ffb44a', '#ffe85a', '#6ad86a', '#6ab0ff', '#b48aff'].forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(WX, RY + 40, 150 - i * 6, Math.PI, Math.PI + Math.PI * k); c.stroke(); }); c.restore();
      for (const d of s.drops) { const q = (t - d.t); c.fillStyle = `hsla(${d.hue},90%,70%,${1 - q})`; c.beginPath(); c.arc(d.x, d.y, 3.2, 0, 7); c.fill(); c.fillStyle = `rgba(255,255,255,${0.8 * (1 - q)})`; c.beginPath(); c.arc(d.x - 1, d.y - 1, 1.1, 0, 7); c.fill(); }
    }
    for (const m of s.misses) { const q = (t - m.t) / 0.5; c.fillStyle = `rgba(230,200,150,${0.7 * (1 - q)})`; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(m.x + Math.cos(i * 1.3) * q * 24, RY - 4 + Math.sin(i * 1.3) * q * 10 - q * 10, 5 * (1 - q * 0.5), 0, 7); c.fill(); } }
    P.vignette(c, W, H, 0.25); P.grain(c, W, H, 0.06);
  },
});
