// PRAY! — Daniel 6:10. A new law says everyone must pray only to the king, but Daniel keeps praying at his open window toward Jerusalem.
// Drag to tiptoe Daniel across the palace room while the comic officials read their scroll; stand still when one turns round. He kneels in golden light.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const FLOOR = 470, DY = 588, START = 44, GOAL = 256, KNEEL_X = 270;
const WX = 280, WR = 52, WA = 268, SILL = 446;              // the window: centre x, arch radius, arch centre y, sill
const DANIEL = { skin: SK[2], robe: CL.indigo, stripe: CL.gold, hair: HR[5], beard: '#e8e2da', hairStyle: 'short' };
const OFFS = [
  { skin: SK[3], robe: CL.rust, stripe: CL.gold, hat: '#6a2f4a', beard: '#2b1a12' },
  { skin: SK[4], robe: CL.teal, stripe: CL.sand, hat: '#2f3768', beard: '#1d1412' },
];
// per level: officials, free gap between glances (s), warning, how long they look, Daniel's tiptoe speed
const TUNE = [
  { n: 1, gap: [1.3, 1.8], warn: 0.5, look: 0.9, v: 150 },
  { n: 2, gap: [1.0, 1.4], warn: 0.42, look: 0.85, v: 168 },
  { n: 2, gap: [0.75, 1.05], warn: 0.34, look: 0.75, v: 190 },
];
const GOLD = ['#ffe9a0', '#ffd45a', '#fff8e0', '#ffb860'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const archPath = (c, grow = 0) => { c.beginPath(); c.moveTo(WX - WR - grow, SILL); c.lineTo(WX - WR - grow, WA); c.arc(WX, WA, WR + grow, Math.PI, 0); c.lineTo(WX + WR + grow, SILL); c.closePath(); };

// ---------- painted pieces ----------
function rosette(o, x, y, r) {
  o.fillStyle = '#fbf3dc'; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; o.beginPath(); o.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.42, r * 0.22, a, 0, 7); o.fill(); }
  o.fillStyle = '#f2c14a'; o.beginPath(); o.arc(x, y, r * 0.32, 0, 7); o.fill();
}
function reliefLion(o, x, y, s) { // a striding glazed-brick lion, golden on blue, facing right (Babylon's Processional Way)
  o.save(); o.translate(x, y); o.scale(s, s);
  const body = '#eab84e', dark = '#9a6420', mane = '#c97f2a';
  o.fillStyle = 'rgba(8,14,46,0.35)'; o.beginPath(); o.ellipse(2, 1, 28, 3, 0, 0, 7); o.fill();
  o.strokeStyle = dark; o.lineWidth = 5; o.lineCap = 'round';
  o.beginPath(); o.moveTo(-14, -8); o.lineTo(-19, 0); o.moveTo(-8, -8); o.lineTo(-5, 0); o.moveTo(10, -8); o.lineTo(6, 0); o.moveTo(15, -8); o.lineTo(19, 0); o.stroke();
  o.strokeStyle = body; o.lineWidth = 3.4; o.stroke();
  o.strokeStyle = body; o.lineWidth = 2.6; o.beginPath(); o.moveTo(-22, -14); o.quadraticCurveTo(-34, -16, -32, -28); o.stroke(); o.fillStyle = mane; o.beginPath(); o.arc(-32, -29, 3, 0, 7); o.fill();
  const bg = o.createLinearGradient(0, -24, 0, -4); bg.addColorStop(0, '#fbe08a'); bg.addColorStop(1, body); o.fillStyle = bg; o.strokeStyle = dark; o.lineWidth = 1.4;
  o.beginPath(); o.ellipse(-2, -14, 23, 8.5, 0, 0, 7); o.fill(); o.stroke();
  o.fillStyle = mane; o.beginPath(); o.ellipse(17, -18, 9, 11, 0.2, 0, 7); o.fill(); o.stroke();
  o.fillStyle = body; o.beginPath(); o.arc(22, -19, 6.5, 0, 7); o.fill(); o.stroke();
  o.fillStyle = '#fff3c8'; o.beginPath(); o.ellipse(27, -16.5, 3.4, 2.6, 0, 0, 7); o.fill();
  o.fillStyle = '#2a1820'; o.beginPath(); o.arc(23.5, -21, 1.2, 0, 7); o.fill();
  o.fillStyle = 'rgba(255,255,240,0.45)'; o.beginPath(); o.ellipse(-6, -19, 12, 2.2, -0.05, 0, 7); o.fill();
  o.restore();
}
function paintBg(o) {
  // back wall of glazed blue brick
  const wg = o.createLinearGradient(0, 0, 0, FLOOR); wg.addColorStop(0, '#16245a'); wg.addColorStop(0.45, '#26479a'); wg.addColorStop(1, '#1c357a');
  o.fillStyle = wg; o.fillRect(0, 0, W, FLOOR);
  const r = P.rng(5);
  for (let y = 0, row = 0; y < FLOOR; y += 12, row++) for (let x = row % 2 ? -14 : 0; x < W; x += 28) { o.fillStyle = P.rgba(r() < 0.5 ? '#6a96e8' : '#0a1440', 0.08 + r() * 0.14); o.fillRect(x + 1, y + 1, 26, 10); o.fillStyle = 'rgba(255,255,255,0.06)'; o.fillRect(x + 2, y + 1.5, 24, 1.5); }
  o.strokeStyle = 'rgba(8,12,40,0.35)'; o.lineWidth = 1; o.beginPath(); for (let y = 0; y < FLOOR; y += 12) { o.moveTo(0, y + 0.5); o.lineTo(W, y + 0.5); } o.stroke();
  // cornice, rosette bands and the lion frieze
  const cg = o.createLinearGradient(0, 0, 0, 26); cg.addColorStop(0, '#3a2440'); cg.addColorStop(1, '#5a3a4a'); o.fillStyle = cg; o.fillRect(0, 0, W, 26);
  o.fillStyle = '#e9b949'; o.beginPath(); for (let x = 0; x <= W; x += 12) { o.moveTo(x, 26); o.lineTo(x + 6, 18); o.lineTo(x + 12, 26); } o.fill();
  for (const by of [96, 196]) { o.fillStyle = '#122054'; o.fillRect(0, by - 11, W, 22); o.fillStyle = 'rgba(255,230,160,0.4)'; o.fillRect(0, by - 11, W, 1.5); o.fillRect(0, by + 9.5, W, 1.5); for (let x = 13; x < W; x += 26) rosette(o, x, by, 8); }
  const fg = o.createLinearGradient(0, 108, 0, 184); fg.addColorStop(0, '#2f5ab8'); fg.addColorStop(1, '#2448a0'); o.fillStyle = fg; o.fillRect(0, 108, W, 76);
  for (let i = 0; i < 4; i++) reliefLion(o, 38 + i * 92, 176, 1.12);
  // stone skirting along the floor
  const dg = o.createLinearGradient(0, 432, 0, FLOOR); dg.addColorStop(0, '#d9b98a'); dg.addColorStop(1, '#a8805a'); o.fillStyle = dg; o.fillRect(0, 432, W, FLOOR - 432);
  o.fillStyle = 'rgba(255,240,210,0.5)'; o.fillRect(0, 432, W, 2); o.fillStyle = 'rgba(40,20,30,0.35)'; o.fillRect(0, FLOOR - 3, W, 3);
  // warm sunset light spilling from the window across the wall
  o.save(); o.globalCompositeOperation = 'screen'; const sw = o.createRadialGradient(WX, 360, 20, WX - 40, 360, 330); sw.addColorStop(0, 'rgba(255,170,90,0.55)'); sw.addColorStop(0.5, 'rgba(230,110,90,0.18)'); sw.addColorStop(1, 'rgba(200,90,90,0)'); o.fillStyle = sw; o.fillRect(0, 0, W, FLOOR); o.restore();
  // floor of warm tiles in perspective
  const flg = o.createLinearGradient(0, FLOOR, 0, H); flg.addColorStop(0, '#b98a62'); flg.addColorStop(1, '#7a4e36'); o.fillStyle = flg; o.fillRect(0, FLOOR, W, H - FLOOR);
  o.save(); o.beginPath(); o.rect(0, FLOOR, W, H - FLOOR); o.clip();
  o.strokeStyle = 'rgba(60,30,24,0.35)'; o.lineWidth = 1.2; o.beginPath();
  for (let k = 1; k < 9; k++) { const y = FLOOR + 170 * Math.pow(k / 8, 1.6); o.moveTo(0, y); o.lineTo(W, y); }
  for (let x = -400; x <= 760; x += 44) { o.moveTo(180 + (x - 180) * 0.16, FLOOR); o.lineTo(x, H); } o.stroke();
  for (let k = 0; k < 8; k++) for (let j = 0; j < 14; j++) if ((k + j) % 2) { const y0 = FLOOR + 170 * Math.pow(k / 8, 1.6), y1 = FLOOR + 170 * Math.pow((k + 1) / 8, 1.6), xa = -400 + j * 44, f0 = (y0 - FLOOR) / 170, f1 = (y1 - FLOOR) / 170, at = (x, f) => 180 + (x - 180) * (0.16 + 0.84 * f);
    o.fillStyle = 'rgba(255,230,190,0.07)'; o.beginPath(); o.moveTo(at(xa, f0), y0); o.lineTo(at(xa + 44, f0), y0); o.lineTo(at(xa + 44, f1), y1); o.lineTo(at(xa, f1), y1); o.fill(); }
  // the patch of window light on the floor
  o.globalCompositeOperation = 'screen'; const lp = o.createRadialGradient(KNEEL_X - 10, 600, 10, KNEEL_X - 10, 600, 150); lp.addColorStop(0, 'rgba(255,200,120,0.5)'); lp.addColorStop(1, 'rgba(255,170,100,0)');
  o.fillStyle = lp; o.beginPath(); o.moveTo(WX - WR, FLOOR); o.lineTo(WX + WR, FLOOR); o.lineTo(W + 20, H); o.lineTo(WX - WR - 150, H); o.closePath(); o.fill();
  o.restore();
  // the window: a sunset view west, toward Jerusalem
  o.save(); archPath(o); o.clip();
  const sk = o.createLinearGradient(0, WA - WR, 0, SILL); sk.addColorStop(0, '#5a3a86'); sk.addColorStop(0.35, '#c8608a'); sk.addColorStop(0.7, '#f6a05a'); sk.addColorStop(1, '#ffe2a0'); o.fillStyle = sk; o.fillRect(WX - WR, WA - WR, WR * 2, SILL - WA + WR);
  const sun = o.createRadialGradient(WX + 14, 412, 2, WX + 14, 412, 70); sun.addColorStop(0, 'rgba(255,250,220,1)'); sun.addColorStop(0.14, 'rgba(255,236,170,0.95)'); sun.addColorStop(0.2, 'rgba(255,210,140,0.5)'); sun.addColorStop(1, 'rgba(255,180,120,0)'); o.fillStyle = sun; o.fillRect(WX - WR, WA - WR, WR * 2, 200);
  o.fillStyle = 'rgba(255,220,200,0.4)'; for (const [cx, cy, rx] of [[WX - 24, 300, 26], [WX + 30, 330, 20], [WX - 10, 360, 30]]) { o.beginPath(); o.ellipse(cx, cy, rx, 3, 0, 0, 7); o.fill(); }
  o.fillStyle = '#9a5a7a'; o.beginPath(); o.moveTo(WX - WR, SILL); for (let x = WX - WR; x <= WX + WR; x += 4) o.lineTo(x, 418 - 10 * P.noise1(x * 0.05, 3)); o.lineTo(WX + WR, SILL); o.fill();
  o.fillStyle = '#6a3a5a'; o.beginPath(); o.moveTo(WX - WR, SILL); for (let x = WX - WR; x <= WX + WR; x += 4) o.lineTo(x, 432 - 6 * P.noise1(x * 0.08, 8)); o.lineTo(WX + WR, SILL); o.fill();
  for (const [px, ph] of [[WX - 34, 30], [WX + 38, 24]]) { o.strokeStyle = '#4a2440'; o.lineWidth = 2; o.beginPath(); o.moveTo(px, 440); o.quadraticCurveTo(px + 3, 440 - ph / 2, px + 2, 440 - ph); o.stroke(); o.fillStyle = '#4a2440'; for (let k = 0; k < 6; k++) { o.save(); o.translate(px + 2, 440 - ph); o.rotate(-Math.PI / 2 + (k - 2.5) * 0.55); o.beginPath(); o.ellipse(8, 0, 9, 2, 0.2, 0, 7); o.fill(); o.restore(); } }
  o.restore();
  // stone reveal, keystone and sill
  o.lineJoin = 'round'; o.strokeStyle = '#7a5434'; o.lineWidth = 16; archPath(o, 6); o.stroke();
  o.strokeStyle = '#d8b07a'; o.lineWidth = 12; archPath(o, 6); o.stroke();
  o.strokeStyle = 'rgba(255,240,200,0.6)'; o.lineWidth = 2; archPath(o, 11); o.stroke();
  o.strokeStyle = 'rgba(90,50,30,0.5)'; o.lineWidth = 3; archPath(o, 1); o.stroke();
  o.fillStyle = '#e9b949'; o.strokeStyle = '#8a5a20'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(WX - 9, WA - WR - 16); o.lineTo(WX + 9, WA - WR - 16); o.lineTo(WX + 6, WA - WR + 2); o.lineTo(WX - 6, WA - WR + 2); o.closePath(); o.fill(); o.stroke();
  const sg = o.createLinearGradient(0, SILL - 2, 0, SILL + 10); sg.addColorStop(0, '#f2d6a4'); sg.addColorStop(1, '#a8784a'); o.fillStyle = sg; o.fillRect(WX - WR - 16, SILL - 2, WR * 2 + 32, 11); o.fillStyle = 'rgba(40,20,20,0.3)'; o.fillRect(WX - WR - 14, SILL + 9, WR * 2 + 28, 3);
  // open cedar-lattice shutters
  for (const sd of [-1, 1]) {
    const x0 = WX + sd * (WR + 8), x1 = WX + sd * (WR + 38);
    o.fillStyle = '#7a4a2a'; o.strokeStyle = '#4a2a16'; o.lineWidth = 1.5; o.beginPath(); o.moveTo(x0, WA - 26); o.lineTo(x1, WA - 12); o.lineTo(x1, SILL - 6); o.lineTo(x0, SILL - 2); o.closePath(); o.fill(); o.stroke();
    o.save(); o.clip(); o.strokeStyle = 'rgba(240,200,140,0.45)'; o.lineWidth = 1.4; o.beginPath(); for (let k = -10; k < 20; k++) { const yy = WA - 40 + k * 12; o.moveTo(Math.min(x0, x1), yy); o.lineTo(Math.max(x0, x1), yy + 30); o.moveTo(Math.min(x0, x1), yy + 30); o.lineTo(Math.max(x0, x1), yy); } o.stroke(); o.restore();
  }
  // a potted palm in the corner
  P.palm(o, 18, 448, 0.62, 0.08, 0, '#3f7a4a');
  o.fillStyle = 'rgba(30,14,20,0.3)'; o.beginPath(); o.ellipse(22, 486, 26, 5, 0, 0, 7); o.fill();
  const pg = o.createLinearGradient(0, 444, 0, 486); pg.addColorStop(0, '#d8844a'); pg.addColorStop(1, '#8a4426'); o.fillStyle = pg; o.beginPath(); o.moveTo(0, 446); o.lineTo(40, 446); o.lineTo(34, 486); o.lineTo(6, 486); o.closePath(); o.fill();
  o.fillStyle = '#f2c14a'; o.fillRect(2, 456, 36, 3); o.fillStyle = 'rgba(255,240,210,0.4)'; o.fillRect(6, 448, 4, 34);
}

// ---------- the officials ----------
function hat(c, col) {
  const g = c.createLinearGradient(-15, 0, 15, 0); g.addColorStop(0, P.shade(col, 0.28)); g.addColorStop(1, P.shade(col, -0.25));
  c.fillStyle = g; c.strokeStyle = P.shade(col, -0.5); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-15, -63); c.lineTo(-13, -90); c.quadraticCurveTo(0, -97, 13, -90); c.lineTo(15, -63); c.quadraticCurveTo(0, -59, -15, -63); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#e9b949'; c.beginPath(); c.moveTo(-15.2, -65); c.quadraticCurveTo(0, -61, 15.2, -65); c.lineTo(15, -70.5); c.quadraticCurveTo(0, -66.5, -15, -70.5); c.closePath(); c.fill();
  c.fillStyle = '#fff3c0'; c.beginPath(); c.arc(0, -80, 3, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(-11, -88, 4, 18);
}
function scroll(c, x, y, w) {
  c.fillStyle = '#f6e8c8'; c.strokeStyle = '#a07a4a'; c.lineWidth = 1; c.fillRect(x - w / 2, y - 6, w, 12); c.strokeRect(x - w / 2, y - 6, w, 12);
  c.strokeStyle = 'rgba(90,60,40,0.5)'; c.beginPath(); for (let k = 0; k < 3; k++) { c.moveTo(x - w / 2 + 5, y - 3 + k * 3); c.lineTo(x + w / 2 - 5 - (k % 2) * 6, y - 3 + k * 3); } c.stroke();
  for (const sd of [-1, 1]) { const g = c.createLinearGradient(x + sd * w / 2 - 3, 0, x + sd * w / 2 + 3, 0); g.addColorStop(0, '#d8b880'); g.addColorStop(1, '#9a7448'); c.fillStyle = g; roundRect(c, x + sd * w / 2 - 3.5, y - 8, 7, 16, 3); c.fill(); c.fillStyle = '#7a4a2a'; c.fillRect(x + sd * w / 2 - 1, y - 10, 2, 20); }
}
function officialFront(c, o, t, expr) {
  P.person(c, 0, 0, 1, { skin: o.skin, robe: o.robe, stripe: o.stripe, hair: o.beard, hairStyle: 'short', expr, arms: 'hold', bounce: 0, t, hold: (cc, hx, hy) => scroll(cc, hx, hy + 2, 30) });
  c.fillStyle = o.beard; c.beginPath(); c.moveTo(-13, -54); c.quadraticCurveTo(-15, -36, -9, -25); c.lineTo(9, -25); c.quadraticCurveTo(15, -36, 13, -54); c.quadraticCurveTo(8, -44, 0, -43.5); c.quadraticCurveTo(-8, -44, -13, -54); c.fill();
  c.strokeStyle = P.rgba(P.shade(o.beard, 0.4), 0.8); c.lineWidth = 1.1; for (let r = 0; r < 3; r++) { const yy = -38 + r * 5; for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(k * 4.4, yy, 1.9, 0.2, Math.PI * 1.3); c.stroke(); } }
  c.fillStyle = o.beard; c.beginPath(); c.ellipse(-5, -51.2, 4.6, 1.6, 0.3, 0, 7); c.ellipse(5, -51.2, 4.6, 1.6, -0.3, 0, 7); c.fill();
  hat(c, o.hat);
}
function officialBack(c, o, t, wob) {
  const robe = o.robe, out = P.shade(robe, -0.45);
  c.fillStyle = 'rgba(40,20,40,0.22)'; c.beginPath(); c.ellipse(0, 0, 16, 4.5, 0, 0, 7); c.fill();
  c.fillStyle = '#5a3620'; c.beginPath(); c.ellipse(-6, -1.5, 5, 3, 0, 0, 7); c.ellipse(7, -1.5, 5, 3, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(-14, -40, 14, 0); g.addColorStop(0, P.shade(robe, 0.05)); g.addColorStop(1, P.shade(robe, -0.28)); c.fillStyle = g; c.strokeStyle = out; c.lineWidth = 1.6; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-8, -40); c.quadraticCurveTo(-11, -38, -12, -30); c.lineTo(-15, -3); c.quadraticCurveTo(0, 1, 15, -3); c.lineTo(12, -30); c.quadraticCurveTo(11, -38, 8, -40); c.closePath(); c.fill(); c.stroke();
  c.save(); c.clip(); c.fillStyle = o.stripe; c.beginPath(); c.moveTo(-14, -38); c.lineTo(-8, -40); c.lineTo(15, -12); c.lineTo(15, -6); c.closePath(); c.fill(); c.fillStyle = P.rgba(o.stripe, 0.8); c.fillRect(-16, -7, 32, 3); c.restore();
  c.strokeStyle = o.stripe; c.lineWidth = 1; c.beginPath(); for (let x = -13; x <= 13; x += 2.6) { c.moveTo(x, -3.5); c.lineTo(x, 0.5); } c.stroke();
  // arms bent forward holding the scroll up to read; the scroll's rolled ends peek out on both sides of the head
  for (const sd of [-1, 1]) { c.fillStyle = P.shade(robe, -0.08); c.strokeStyle = out; c.lineWidth = 1.5; c.beginPath(); c.moveTo(sd * 7, -38); c.quadraticCurveTo(sd * 20, -36, sd * 19, -50); c.lineTo(sd * 13, -52); c.quadraticCurveTo(sd * 12, -40, sd * 4, -32); c.closePath(); c.fill(); c.stroke(); }
  c.save(); c.translate(0, -60); c.rotate(wob * 0.5); scroll(c, 0, 0, 44); c.restore();
  c.save(); c.translate(0, -55); c.rotate(wob); c.translate(0, 55);
  c.fillStyle = o.skin; c.fillRect(-3.5, -44, 7, 6);
  c.fillStyle = o.skin; c.strokeStyle = P.shade(o.skin, -0.4); c.lineWidth = 1.2; for (const ex of [-15.5, 15.5]) { c.beginPath(); c.ellipse(ex, -54, 3, 4, 0, 0, 7); c.fill(); c.stroke(); }
  const hg = c.createRadialGradient(-5, -62, 2, 0, -55, 18); hg.addColorStop(0, P.shade(o.beard, 0.18)); hg.addColorStop(1, o.beard); c.fillStyle = hg; c.beginPath(); c.ellipse(0, -55, 16, 15.7, 0, 0, 7); c.fill();
  c.fillStyle = o.beard; for (let k = -3; k <= 3; k++) { c.beginPath(); c.arc(k * 4.4, -41 + Math.abs(k) * -0.8, 2.8, 0, 7); c.fill(); }
  c.strokeStyle = P.rgba(P.shade(o.beard, 0.4), 0.6); c.lineWidth = 1; for (let k = -3; k <= 3; k++) { c.beginPath(); c.arc(k * 4.4, -41 + Math.abs(k) * -0.8, 1.6, 0.3, Math.PI * 1.4); c.stroke(); }
  // the tips of the long beard show past the cheeks
  c.fillStyle = o.beard; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 13, -44, 3, 6, sd * 0.3, 0, 7); c.fill(); }
  hat(c, o.hat);
  c.restore();
}
function bubble(c, x, y, kind, t) {
  c.save(); c.translate(x, y); const pop = kind === 'bang' ? 1 + 0.12 * Math.sin(t * 30) : 1; c.scale(pop, pop);
  c.fillStyle = 'rgba(255,253,245,0.96)'; c.strokeStyle = 'rgba(80,40,60,0.6)'; c.lineWidth = 1.6;
  c.beginPath(); c.arc(-14, 18, 3, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, 0, 20, 15, 0, 0, 7); c.fill(); c.stroke();
  if (kind === 'dots') { c.fillStyle = '#5a3a5a'; for (let k = 0; k < 3; k++) { const on = Math.floor(t * 6) % 3 >= k; c.globalAlpha = on ? 1 : 0.3; c.beginPath(); c.arc(-8 + k * 8, 0, 2.8, 0, 7); c.fill(); } }
  else { c.fillStyle = '#e04a4a'; roundRect(c, -3, -11, 6, 14, 3); c.fill(); c.beginPath(); c.arc(0, 8, 3, 0, 7); c.fill(); }
  c.restore();
}
// Daniel kneeling, facing the window
function kneel(c, x, y, s, o) {
  c.fillStyle = 'rgba(40,20,40,0.25)'; c.beginPath(); c.ellipse(x - 4 * s, y, 24 * s, 5 * s, 0, 0, 7); c.fill();
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 150 * s, 120 * s, 150 * s - 16 * s); c.clip(); P.person(c, x, y + 22 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 20 * s, x, y); g.addColorStop(0, P.shade(robe, 0.1)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 14 * s, y - 18 * s); c.quadraticCurveTo(x - 24 * s, y - 2 * s, x - 18 * s, y); c.lineTo(x + 16 * s, y); c.quadraticCurveTo(x + 18 * s, y - 10 * s, x + 12 * s, y - 18 * s); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 22 * s, y - 2 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill();
}
function mat(c, x, y, glow, t) {
  if (glow > 0) { const gl = c.createRadialGradient(x, y, 4, x, y, 60); gl.addColorStop(0, `rgba(255,226,140,${glow})`); gl.addColorStop(1, 'rgba(255,226,140,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(x, y, 60, 22, 0, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(40,20,30,0.3)'; c.beginPath(); c.ellipse(x + 2, y + 3, 36, 9, 0, 0, 7); c.fill();
  c.fillStyle = '#b8443a'; c.beginPath(); c.ellipse(x, y, 35, 9, 0, 0, 7); c.fill();
  c.strokeStyle = '#e9b949'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, 29, 6.6, 0, 0, 7); c.stroke();
  c.fillStyle = '#2f5ab8'; c.beginPath(); c.ellipse(x, y, 12, 3.2, 0, 0, 7); c.fill();
  c.strokeStyle = '#f6e6c4'; c.lineWidth = 1; c.beginPath(); for (let k = -3; k <= 3; k++) { c.moveTo(x - 35 - 1, y + k * 1.6); c.lineTo(x - 39, y + k * 1.8); c.moveTo(x + 35 + 1, y + k * 1.6); c.lineTo(x + 39, y + k * 1.8); } c.stroke();
}
function hangingLamp(c, x, y, t, ph) {
  const sw = Math.sin(t * 1.4 + ph) * 0.05; c.save(); c.translate(x, 26); c.rotate(sw);
  const L = y - 26; c.strokeStyle = '#b08a4a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, L - 10); c.moveTo(0, L - 10); c.lineTo(-10, L); c.moveTo(0, L - 10); c.lineTo(10, L); c.stroke();
  const fl = 0.85 + 0.15 * Math.sin(t * 13 + ph) * Math.sin(t * 5.3);
  c.save(); c.globalCompositeOperation = 'screen'; const gw = c.createRadialGradient(0, L - 2, 2, 0, L - 2, 54 * fl); gw.addColorStop(0, 'rgba(255,200,110,0.6)'); gw.addColorStop(1, 'rgba(255,150,80,0)'); c.fillStyle = gw; c.fillRect(-60, L - 60, 120, 120); c.restore();
  const bg = c.createLinearGradient(-12, 0, 12, 0); bg.addColorStop(0, '#e2b45a'); bg.addColorStop(1, '#8a5a24'); c.fillStyle = bg; c.beginPath(); c.moveTo(-12, L); c.quadraticCurveTo(0, L + 14, 12, L); c.closePath(); c.fill();
  c.fillStyle = '#ffb040'; c.beginPath(); c.moveTo(-3, L); c.quadraticCurveTo(0, L - 12 * fl, 1 + Math.sin(t * 9 + ph), L - 13 * fl); c.quadraticCurveTo(3, L - 6, 3, L); c.fill();
  c.fillStyle = '#fff2b0'; c.beginPath(); c.ellipse(0, L - 3, 1.5, 3.5 * fl, 0, 0, 7); c.fill();
  c.restore();
}

MG.add({
  id: 'pray', stage: 'exile', cmd: 'PRAY!', hint: 'drag', time: 6, mood: 'desert', winText: 'Amen!',
  card: {
    title: 'Daniel at his window', ref: 'Daniel 6:1–10', kind: 'Story',
    text: 'The book of Daniel tells how jealous officials talked King Darius into a new law: for thirty days, people could pray only to the king. Daniel went home to his upstairs room, where the windows opened toward Jerusalem. He knelt there three times a day to pray and thank God, just as he always had.',
    note: 'Many scholars think the stories in Daniel were told to give courage to Jews living far from home under foreign kings.',
    ask: 'When do you like to talk with God? What would you say thank you for today?',
  },
  init(g) {
    const s = g.s, tu = TUNE[g.level];
    s.tu = tu; s.sp = 1 + (g.speed - 1) * 0.55;
    s.offs = (tu.n === 1 ? [150] : [102, 198]).map((x, i) => ({ x, look: 0, o: OFFS[(i + (Math.random() < 0.5 ? 1 : 0)) % 2], ph: Math.random() * 6 }));
    s.ph = 'gap'; s.pt = 0; s.gap = tu.gap[0] * 0.75 + Math.random() * 0.2; s.cur = -1;
    s.d = { x: START, face: 1, moving: false, frozenUntil: 0, hop: null, stepT: 0 };
    s.down = false; s.px = START; s.bang = null; s.winT = -1;
    s.motes = Array.from({ length: 22 }, () => ({ x: 170 + Math.random() * 180, y: 300 + Math.random() * 300, ph: Math.random() * 6, sp: 6 + Math.random() * 10 }));
    s.birds = [0, 1, 2].map(i => ({ x: WX - WR - 20 - i * 40, y: 330 + i * 12, sp: 18 + i * 5 }));
  },
  down(g, x, y) { g.s.down = true; g.s.px = x; },
  move(g, x, y) { g.s.px = x; },
  up(g) { g.s.down = false; },
  update(g, dt) {
    const s = g.s, tu = s.tu, d = s.d, sdt = dt * s.sp;
    if (!g.done) {
      s.pt += sdt;
      if (s.ph === 'gap' && s.pt >= s.gap) { s.ph = 'warn'; s.pt = 0; s.cur = (s.cur + 1) % s.offs.length; g.sfx('click'); }
      else if (s.ph === 'warn' && s.pt >= tu.warn) { s.ph = 'turn'; s.pt = 0; g.sfx('swoosh'); }
      else if (s.ph === 'turn' && s.pt >= 0.14) { s.ph = 'look'; s.pt = 0; }
      else if (s.ph === 'look' && s.pt >= tu.look) { s.ph = 'back'; s.pt = 0; }
      else if (s.ph === 'back' && s.pt >= 0.16) { s.ph = 'gap'; s.pt = 0; s.gap = tu.gap[0] + Math.random() * (tu.gap[1] - tu.gap[0]); }
    }
    s.offs.forEach((f, i) => {
      let want = 0;
      if (g.result === 'win') want = 0;
      else if (i === s.cur) want = s.ph === 'turn' ? s.pt / 0.14 : s.ph === 'look' ? 1 : s.ph === 'back' ? 1 - s.pt / 0.16 : 0;
      f.look = want;
    });
    // Daniel tiptoes toward the finger
    let moved = 0;
    if (d.hop) { const q = (g.t - d.hop.t0) / 0.32; d.x = d.hop.from + (d.hop.to - d.hop.from) * Math.min(1, q); if (q >= 1) d.hop = null; }
    else if (!g.done && s.down && g.t >= d.frozenUntil) {
      const v = tu.v * s.sp, dx = clamp(clamp(s.px, START, W - 16) - d.x, -v * dt, v * dt); d.x += dx; moved = Math.abs(dx); if (Math.abs(dx) > 0.05) d.face = dx > 0 ? 1 : -1;
    }
    d.moving = moved > 0.25;
    if (d.moving) { d.stepT += dt; if (d.stepT > 0.26) { d.stepT = 0; g.sfx('tap'); } }
    const danger = s.cur >= 0 && (s.ph === 'look' || (s.ph === 'turn' && s.pt > 0.07));
    if (!g.done && d.moving && danger) { // spotted! Daniel hops back, and the official blinks in surprise
      d.hop = { from: d.x, to: Math.max(START, d.x - 44), t0: g.t }; d.frozenUntil = g.t + 0.6; s.bang = { i: s.cur, t: g.t };
      g.sfx('boing'); g.shake(3, 0.15);
      if (s.ph === 'turn') { s.ph = 'look'; s.pt = 0; } s.pt = Math.max(s.pt, tu.look - 0.5);
    }
    if (!g.done && d.x >= GOAL) {
      s.winT = g.t; g.win(); g.sfx('harp'); g.burst(KNEEL_X, 540, GOLD, 24, 180);
    }
    for (const m of s.motes) { m.y -= m.sp * dt; if (m.y < 290) { m.y = 610; m.x = 170 + Math.random() * 180; } }
    for (const b of s.birds) { b.x += b.sp * dt; if (b.x > WX + WR + 20) b.x = WX - WR - 20; }
  },
  auto(g, dt, synth) { // walk in the quiet gaps, let go as soon as an official starts to stir
    const s = g.s; if (g.t < 0.25) return;
    const safe = s.ph === 'gap' && s.gap - s.pt > 0.1 && g.t >= s.d.frozenUntil;
    if (safe && !s.down) synth('down', GOAL + 40, 560); else if (!safe && s.down) synth('up', GOAL + 40, 560);
  },
  draw(g, c) {
    const s = g.s, t = g.t, d = s.d, won = g.result === 'win', wk = won ? Math.min(1, (t - s.winT) * 2.5) : 0;
    c.drawImage(g.bake('exile_pray_bg', paintBg), 0, 0, W, H);
    // birds crossing the sunset in the window, and the curtain stirring in the breeze
    c.save(); archPath(c); c.clip();
    c.strokeStyle = 'rgba(70,30,60,0.75)'; c.lineWidth = 1.3; c.lineCap = 'round';
    for (const b of s.birds) { const f = Math.sin(t * 9 + b.y) * 2.5; c.beginPath(); c.moveTo(b.x - 5, b.y - f); c.quadraticCurveTo(b.x - 2, b.y - 2, b.x, b.y); c.quadraticCurveTo(b.x + 2, b.y - 2, b.x + 5, b.y - f); c.stroke(); }
    c.restore();
    c.save(); c.fillStyle = 'rgba(255,246,228,0.55)'; c.beginPath(); c.moveTo(WX - WR, WA - 30); for (let y = WA - 30; y <= SILL - 6; y += 6) { const k = (y - WA + 30) / (SILL - WA + 24); c.lineTo(WX - WR + 8 + k * 12 + Math.sin(t * 2.2 + y * 0.05) * 5 * k, y); } c.lineTo(WX - WR, SILL - 6); c.closePath(); c.fill(); c.restore();
    // clay lamp on the sill
    const lf = 0.85 + 0.15 * Math.sin(t * 11);
    c.fillStyle = '#a8603a'; c.beginPath(); c.ellipse(WX + 32, SILL - 3, 9, 3.6, 0, 0, 7); c.fill(); c.fillStyle = '#ffb040'; c.beginPath(); c.moveTo(WX + 38, SILL - 5); c.quadraticCurveTo(WX + 39, SILL - 14 * lf, WX + 40.5, SILL - 15 * lf); c.quadraticCurveTo(WX + 42, SILL - 8, WX + 41, SILL - 5); c.fill();
    // shafts of evening light from the window
    P.rays(c, WX + 6, 330, W, 330, '#ffd892', 0.08 + 0.05 * Math.sin(t * 1.3) + wk * 0.22, 7, t);
    hangingLamp(c, 62, 300, t, 0); hangingLamp(c, 168, 286, t, 2);
    for (const m of s.motes) { const a = 0.25 + 0.25 * Math.sin(t * 2 + m.ph) + wk * 0.4; c.fillStyle = `rgba(255,236,180,${a})`; c.beginPath(); c.arc(m.x + Math.sin(t + m.ph) * 6, m.y, 1.3, 0, 7); c.fill(); }
    // the officials, reading the new law with their backs turned
    const OSC = 1.14, OY = 524;
    s.offs.forEach((f, i) => {
      const x = f.x + Math.sin(t * 0.7 + f.ph) * 6, warn = !g.done && i === s.cur && s.ph === 'warn', wob = warn ? Math.sin(t * 28) * 0.08 : Math.sin(t * 1.3 + f.ph) * 0.03;
      const sx = Math.max(0.16, Math.abs(1 - 2 * f.look));
      c.save(); c.translate(x, OY); c.scale(OSC * sx, OSC);
      if (f.look >= 0.5) { const caught = s.bang && s.bang.i === i && t - s.bang.t < 0.6; officialFront(c, f.o, t, won ? 'wow' : caught ? 'surprised' : (s.bang && s.bang.i === i && t - s.bang.t < 1.4) ? 'laugh' : 'happy'); }
      else officialBack(c, f.o, t, wob);
      c.restore();
      if (warn) bubble(c, x + 26, OY - 116, 'dots', t);
      if (s.bang && s.bang.i === i && t - s.bang.t < 0.6) bubble(c, x + 26, OY - 116, 'bang', t);
    });
    // the prayer mat under the window glows to show where Daniel is going
    mat(c, KNEEL_X, DY + 2, won ? 0.6 : 0.3 + 0.25 * Math.sin(t * 5), t);
    // Daniel
    const statue = !won && s.cur >= 0 && s.offs[s.cur].look > 0.5 && !d.moving && !d.hop;
    if (won) {
      const kx = d.x + (KNEEL_X - d.x) * Math.min(1, (t - s.winT) * 4);
      const au = c.createRadialGradient(kx, DY - 50, 6, kx, DY - 50, 110); au.addColorStop(0, `rgba(255,236,160,${0.55 * wk})`); au.addColorStop(1, 'rgba(255,236,160,0)'); c.fillStyle = au; c.fillRect(kx - 120, DY - 170, 240, 200);
      kneel(c, kx, DY, 1.3, { ...DANIEL, t, arms: 'pray', expr: 'happy', blink: true, bounce: 0.4 });
      c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 7; i++) { const q = (t * 0.7 + i / 7) % 1; c.fillStyle = `rgba(255,230,150,${0.9 * (1 - q) * wk})`; drawStar(c, kx - 10 + Math.sin(i * 2.3) * 30 + q * 20, DY - 80 - q * 140, 3 + 3 * (1 - q), t + i); } c.restore();
    } else {
      let y = DY, tilt = 0;
      if (d.hop) { const q = Math.min(1, (t - d.hop.t0) / 0.32); y -= Math.sin(q * Math.PI) * 22; tilt = -0.3 * Math.sin(q * Math.PI); }
      else if (d.moving) { y -= Math.abs(Math.sin(t * 13)) * 4; tilt = 0.07 * d.face; }
      c.save(); c.translate(d.x, y); c.rotate(tilt);
      const caught = s.bang && t - s.bang.t < 0.7;
      P.person(c, 0, 0, 1.3, { ...DANIEL, t, facing: d.face, bounce: d.moving ? 0 : 0.8, expr: g.result === 'fail' ? 'surprised' : caught ? 'surprised' : statue ? 'happy' : 'happy', blink: statue, arms: caught ? 'up' : statue ? 'out' : d.moving ? 'reach' : 'down' });
      c.restore();
      if (g.result === 'fail') { c.fillStyle = 'rgba(160,210,255,0.9)'; c.beginPath(); c.ellipse(d.x + 16, DY - 104 + Math.sin(t * 6) * 2, 3, 4.5, 0, 0, 7); c.fill(); }
    }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
