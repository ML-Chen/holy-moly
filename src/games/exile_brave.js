// SPEAK UP! — Esther 4:11–5:2 and 7:3. Going to the king without being called is against the law, but Esther goes to speak up for her people.
// The king's golden scepter lifts and lowers in a slow rhythm; tap while it is raised (welcome) and Esther takes a brave step forward.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const KX = 180, KY = 352, KS = 1.4;                        // the king, seated on his throne
const HX = KX + 26 * KS, HY = KY + 12 * KS - 58 * KS;       // the king's raised right hand (where the scepter pivots)
const SL = 112;                                             // scepter length
const A_DOWN = 1.22, A_UP = -1.32;                          // scepter angles: resting on the floor, raised in welcome
const ESTHER = { skin: SK[2], robe: CL.royal, stripe: CL.gold, hairStyle: 'long', hair: HR[0], head: 'crown' };
const KING = { skin: SK[4], robe: '#b8343a', stripe: CL.gold, hair: '#1d1412', hairStyle: 'short' };
const PEOPLE = [
  { x: 34, y: 598, s: 1.0, f: 1, o: { skin: SK[3], robe: CL.indigo, stripe: CL.cream, beard: '#e8e2da', hair: HR[5], head: 'wrap', headCol: CL.cream } }, // Mordecai
  { x: 80, y: 604, s: 0.82, f: 1, o: { skin: SK[1], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[1], child: true } },
  { x: 326, y: 598, s: 1.0, f: -1, o: { skin: SK[2], robe: CL.teal, stripe: CL.cream, hairStyle: 'bun', hair: HR[0] } },
  { x: 282, y: 604, s: 0.82, f: -1, o: { skin: SK[0], robe: CL.rose, stripe: CL.white, hairStyle: 'long', hair: HR[2], child: true } },
];
// per level: rhythm period (s), how long the scepter stays raised (s), steps to the throne
const TUNE = [{ per: 1.3, up: 0.78, need: 3 }, { per: 1.12, up: 0.58, need: 4 }, { per: 0.98, up: 0.44, need: 4 }];
const GOLD = ['#fff6c0', '#ffd45a', '#ffffff', '#ffb860'];
const smooth = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
const spot = (k, n) => { const q = k / n; return { x: 170 - q * 22, y: 604 - q * 186, s: 1.34 - q * 0.28 }; };

// ---------- painted pieces ----------
function column(o, x, top, bot, w) {
  o.fillStyle = 'rgba(30,20,40,0.25)'; o.fillRect(x - w / 2 + 6, top, w, bot - top);
  const g = o.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#fffaf0'); g.addColorStop(0.45, '#efe4d4'); g.addColorStop(1, '#b8a898');
  o.fillStyle = g; o.fillRect(x - w / 2, top, w, bot - top);
  o.strokeStyle = 'rgba(120,100,100,0.3)'; o.lineWidth = 1.2; o.beginPath(); for (let k = 1; k < 5; k++) { const fx = x - w / 2 + k * w / 5; o.moveTo(fx, top + 4); o.lineTo(fx, bot - 4); } o.stroke();
  // bell base and a capital of two kneeling bulls, back to back
  const bg = o.createLinearGradient(0, bot - 26, 0, bot); bg.addColorStop(0, '#f2e6d4'); bg.addColorStop(1, '#a89888'); o.fillStyle = bg; o.beginPath(); o.moveTo(x - w / 2, bot - 22); o.quadraticCurveTo(x - w * 1.1, bot - 4, x - w, bot); o.lineTo(x + w, bot); o.quadraticCurveTo(x + w * 1.1, bot - 4, x + w / 2, bot - 22); o.closePath(); o.fill();
  o.fillStyle = '#e9b949'; o.fillRect(x - w * 0.7, top - 8, w * 1.4, 8);
  for (const sd of [-1, 1]) {
    o.save(); o.translate(x + sd * w * 0.55, top - 22); o.scale(sd, 1);
    const cg = o.createLinearGradient(0, -14, 0, 14); cg.addColorStop(0, '#f8d77a'); cg.addColorStop(1, '#b8862e'); o.fillStyle = cg; o.strokeStyle = '#7a5418'; o.lineWidth = 1.2;
    o.beginPath(); o.ellipse(0, 4, 16, 10, 0, 0, 7); o.fill(); o.stroke();
    o.beginPath(); o.ellipse(17, -2, 9, 8, 0.2, 0, 7); o.fill(); o.stroke();
    o.strokeStyle = '#7a5418'; o.lineWidth = 2.4; o.lineCap = 'round'; o.beginPath(); o.moveTo(13, -9); o.quadraticCurveTo(12, -18, 6, -18); o.stroke();
    o.fillStyle = '#3a2410'; o.beginPath(); o.arc(19, -4, 1.4, 0, 7); o.fill();
    o.restore();
  }
}
function curtain(o, x0, x1, top, bot) { // white and blue hangings fastened with purple cords to silver rings (Esther 1:6)
  const n = 7, w = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const xa = x0 + i * w, sag = Math.sin((i + 0.5) / n * Math.PI) * 26;
    o.fillStyle = i % 2 ? '#3f6fc0' : '#f8f4ec'; o.beginPath(); o.moveTo(xa, top); o.lineTo(xa + w, top); o.lineTo(xa + w - (i / n - 0.5) * 14, bot - sag * 0.2); o.lineTo(xa - ((i - 1) / n - 0.5) * 14, bot - sag * 0.2); o.closePath(); o.fill();
    o.fillStyle = 'rgba(20,20,60,0.12)'; o.fillRect(xa + w * 0.7, top, w * 0.3, bot - top - 4);
  }
  // swag across the top and tie-backs
  o.fillStyle = '#5a3a8a'; o.beginPath(); o.moveTo(x0, top); o.quadraticCurveTo((x0 + x1) / 2, top + 40, x1, top); o.lineTo(x1, top + 8); o.quadraticCurveTo((x0 + x1) / 2, top + 50, x0, top + 8); o.closePath(); o.fill();
  o.strokeStyle = '#8a5ac8'; o.lineWidth = 3; o.beginPath(); o.moveTo(x0, top + 4); o.quadraticCurveTo((x0 + x1) / 2, top + 44, x1, top + 4); o.stroke();
  for (const rx of [x0 + 4, x1 - 4]) { o.strokeStyle = '#dfe4ee'; o.lineWidth = 2.4; o.beginPath(); o.arc(rx, top + 6, 5, 0, 7); o.stroke(); }
}
function paintBg(o) {
  // back wall: warm marble with a band of glazed turquoise tiles and golden stepped merlons
  const wg = o.createLinearGradient(0, 0, 0, 400); wg.addColorStop(0, '#d8c4b4'); wg.addColorStop(1, '#f2e2cc'); o.fillStyle = wg; o.fillRect(0, 0, W, 400);
  const r = P.rng(31); for (let i = 0; i < 40; i++) { o.strokeStyle = P.rgba('#a89080', 0.12 + r() * 0.1); o.lineWidth = 1; o.beginPath(); const x = r() * W, y = r() * 380; o.moveTo(x, y); o.bezierCurveTo(x + 20, y + 10, x + 40, y - 8, x + 70, y + 6); o.stroke(); }
  o.fillStyle = '#1f6f8a'; o.fillRect(0, 70, W, 40); o.fillStyle = '#e9b949'; o.fillRect(0, 68, W, 3); o.fillRect(0, 109, W, 3);
  for (let x = 10; x < W; x += 30) { o.fillStyle = '#f8f0dc'; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; o.beginPath(); o.ellipse(x + Math.cos(a) * 6, 90 + Math.sin(a) * 6, 5, 2.6, a, 0, 7); o.fill(); } o.fillStyle = '#f2b830'; o.beginPath(); o.arc(x, 90, 3.4, 0, 7); o.fill(); }
  o.fillStyle = '#e9b949'; o.strokeStyle = '#9a6a1e'; o.lineWidth = 1; for (let x = 0; x < W; x += 24) { o.beginPath(); o.moveTo(x, 68); o.lineTo(x, 58); o.lineTo(x + 4, 58); o.lineTo(x + 4, 52); o.lineTo(x + 8, 52); o.lineTo(x + 8, 46); o.lineTo(x + 14, 46); o.lineTo(x + 14, 52); o.lineTo(x + 18, 52); o.lineTo(x + 18, 58); o.lineTo(x + 22, 58); o.lineTo(x + 22, 68); o.closePath(); o.fill(); o.stroke(); }
  // coffered cedar ceiling with golden rosettes
  const cg0 = o.createLinearGradient(0, 0, 0, 46); cg0.addColorStop(0, '#3a2030'); cg0.addColorStop(1, '#6a3a40'); o.fillStyle = cg0; o.fillRect(0, 0, W, 46);
  for (let x = -6; x < W; x += 40) { o.fillStyle = 'rgba(20,8,16,0.4)'; o.fillRect(x + 4, 6, 32, 32); o.fillStyle = '#7a4a3a'; o.fillRect(x + 7, 9, 26, 26); o.fillStyle = '#e9b949'; o.beginPath(); o.arc(x + 20, 22, 6, 0, 7); o.fill(); o.fillStyle = '#fff3c0'; o.beginPath(); o.arc(x + 19, 21, 2, 0, 7); o.fill(); }
  o.fillStyle = '#e9b949'; o.fillRect(0, 42, W, 4);
  // a high window of light behind the throne
  const lw = o.createRadialGradient(KX, 150, 10, KX, 170, 200); lw.addColorStop(0, 'rgba(255,248,220,0.9)'); lw.addColorStop(0.4, 'rgba(255,230,170,0.35)'); lw.addColorStop(1, 'rgba(255,220,160,0)'); o.fillStyle = lw; o.fillRect(0, 40, W, 360);
  // hangings between the columns
  curtain(o, 6, 104, 112, 380); curtain(o, 256, 354, 112, 380);
  column(o, 18, 150, 392, 22); column(o, 342, 150, 392, 22); column(o, 112, 160, 388, 18); column(o, 248, 160, 388, 18);
  // the dais: three steps of marble with a gold edge
  for (let k = 0; k < 3; k++) { const y = 360 + k * 14, w2 = 130 + k * 36; const sg = o.createLinearGradient(0, y, 0, y + 14); sg.addColorStop(0, '#fbf3e4'); sg.addColorStop(1, '#c8b49c'); o.fillStyle = sg; o.fillRect(KX - w2 / 2, y, w2, 14); o.fillStyle = '#e9b949'; o.fillRect(KX - w2 / 2, y, w2, 2); }
  // the throne: a tall gilded back with a canopy fringe, lion-paw feet
  const tb = o.createLinearGradient(KX - 44, 0, KX + 44, 0); tb.addColorStop(0, '#f8d77a'); tb.addColorStop(0.5, '#e9b949'); tb.addColorStop(1, '#9a6a1e');
  o.fillStyle = tb; o.strokeStyle = '#7a5418'; o.lineWidth = 2; o.beginPath(); o.moveTo(KX - 42, 360); o.lineTo(KX - 42, 236); o.quadraticCurveTo(KX - 42, 204, KX, 196); o.quadraticCurveTo(KX + 42, 204, KX + 42, 236); o.lineTo(KX + 42, 360); o.closePath(); o.fill(); o.stroke();
  o.fillStyle = '#8a2a4a'; o.beginPath(); o.moveTo(KX - 32, 350); o.lineTo(KX - 32, 240); o.quadraticCurveTo(KX - 32, 214, KX, 208); o.quadraticCurveTo(KX + 32, 214, KX + 32, 240); o.lineTo(KX + 32, 350); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,220,140,0.5)'; o.lineWidth = 1; for (let k = 0; k < 6; k++) { o.beginPath(); o.arc(KX, 260 + k * 16, 8, 0, 7); o.stroke(); }
  o.fillStyle = '#f2c14a'; o.beginPath(); o.arc(KX, 198, 7, 0, 7); o.fill(); o.fillStyle = '#fff6c0'; o.beginPath(); o.arc(KX - 2, 196, 2.5, 0, 7); o.fill();
  for (const sd of [-1, 1]) { o.fillStyle = '#c8962e'; o.beginPath(); o.ellipse(KX + sd * 40, 362, 9, 6, 0, 0, 7); o.fill(); o.strokeStyle = '#7a5418'; o.lineWidth = 1.2; o.stroke(); o.beginPath(); for (let k = -1; k <= 1; k++) { o.moveTo(KX + sd * 40 + k * 3.5, 358); o.lineTo(KX + sd * 40 + k * 3.5, 366); } o.stroke(); }
  // mosaic floor of porphyry, marble, mother-of-pearl and coloured stones, in perspective
  const fy = 400; const fl = o.createLinearGradient(0, fy, 0, H); fl.addColorStop(0, '#e8d8c4'); fl.addColorStop(1, '#b89a84'); o.fillStyle = fl; o.fillRect(0, fy, W, H - fy);
  const at = (x, f) => KX + (x - KX) * (0.3 + 0.7 * f), row = k => fy + (H - fy) * Math.pow(k / 10, 1.5);
  const tiles = ['#9a3a4a', '#f4ece0', '#2f5a8a', '#e8dcc8', '#1f4a4a', '#f8f0e0'];
  for (let k = 0; k < 10; k++) for (let j = -8; j < 18; j++) { const y0 = row(k), y1 = row(k + 1), f0 = (y0 - fy) / (H - fy), f1 = (y1 - fy) / (H - fy), xa = -100 + j * 34;
    o.fillStyle = P.rgba(tiles[(k + j * 2 + 60) % 6], (k + j) % 2 ? 0.55 : 0.3); o.beginPath(); o.moveTo(at(xa, f0), y0); o.lineTo(at(xa + 34, f0), y0); o.lineTo(at(xa + 34, f1), y1); o.lineTo(at(xa, f1), y1); o.closePath(); o.fill();
    if ((k + j) % 3 === 0) { const cx = (at(xa, f0) + at(xa + 34, f1)) / 2, cy = (y0 + y1) / 2; o.fillStyle = 'rgba(255,250,240,0.5)'; o.beginPath(); o.moveTo(cx, cy - (y1 - y0) * 0.32); o.lineTo(cx + 5 + f1 * 4, cy); o.lineTo(cx, cy + (y1 - y0) * 0.32); o.lineTo(cx - 5 - f1 * 4, cy); o.closePath(); o.fill(); } }
  // the long carpet Esther must cross
  o.save(); o.beginPath(); o.moveTo(KX - 36, 402); o.lineTo(KX + 36, 402); o.lineTo(KX + 110, H); o.lineTo(KX - 130, H); o.closePath();
  const cg = o.createLinearGradient(0, 400, 0, H); cg.addColorStop(0, '#a82a3a'); cg.addColorStop(1, '#7a1a2a'); o.fillStyle = cg; o.fill(); o.clip();
  o.strokeStyle = '#e9b949'; o.lineWidth = 3; o.beginPath(); o.moveTo(KX - 30, 402); o.lineTo(KX - 116, H); o.moveTo(KX + 30, 402); o.lineTo(KX + 98, H); o.stroke();
  for (let k = 0; k < 7; k++) { const y = 420 + Math.pow(k / 6, 1.4) * 200, sz = 4 + k * 1.4; o.fillStyle = 'rgba(255,214,110,0.7)'; o.beginPath(); o.moveTo(KX - 8, y - sz); o.lineTo(KX - 8 + sz, y); o.lineTo(KX - 8, y + sz); o.lineTo(KX - 8 - sz, y); o.closePath(); o.fill(); }
  o.restore();
  // warm light from behind the throne falling down the carpet
  o.save(); o.globalCompositeOperation = 'screen'; const lp = o.createRadialGradient(KX, 380, 10, KX, 420, 240); lp.addColorStop(0, 'rgba(255,220,150,0.45)'); lp.addColorStop(1, 'rgba(255,200,140,0)'); o.fillStyle = lp; o.fillRect(0, 300, W, 340); o.restore();
}
function kingCrown(c, x, y, s) { // a tall Persian crown with stepped battlements
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(-13, 0, 13, 0); g.addColorStop(0, '#fbe08a'); g.addColorStop(0.5, '#e9b949'); g.addColorStop(1, '#a8781e');
  c.fillStyle = g; c.strokeStyle = '#7a5418'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-13, 0); c.lineTo(-14, -22);
  for (let i = 0; i < 5; i++) { const x0 = -14 + i * 7; c.lineTo(x0, -26); c.lineTo(x0 + 3.5, -26); c.lineTo(x0 + 3.5, -22); c.lineTo(x0 + 7, -22); } c.lineTo(13, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#d84a5a'; c.beginPath(); c.arc(0, -11, 3, 0, 7); c.fill(); c.fillStyle = '#3f8fc0'; c.beginPath(); c.arc(-8, -11, 2, 0, 7); c.arc(8, -11, 2, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-10, -20, 3, 18);
  c.restore();
}
function kingBeard(c, x, y, s) { // a long squared-off curled beard
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#1d1412';
  c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(-15, 16, -10, 26); c.lineTo(10, 26); c.quadraticCurveTo(15, 16, 14, -2); c.quadraticCurveTo(8, 9, 0, 9.5); c.quadraticCurveTo(-8, 9, -14, -2); c.fill();
  c.strokeStyle = 'rgba(120,100,110,0.8)'; c.lineWidth = 1; for (let r2 = 0; r2 < 3; r2++) { const yy = 13 + r2 * 5; for (let k = -2; k <= 2; k++) { c.beginPath(); c.arc(k * 4.4, yy, 1.8, 0.2, Math.PI * 1.3); c.stroke(); } }
  c.fillStyle = '#1d1412'; c.beginPath(); c.ellipse(-5, 3, 4.6, 1.6, 0.3, 0, 7); c.ellipse(5, 3, 4.6, 1.6, -0.3, 0, 7); c.fill();
  c.restore();
}
function scepter(c, a, glow, t) {
  const tx = HX + Math.cos(a) * SL, ty = HY + Math.sin(a) * SL, bx = HX - Math.cos(a) * 14, by = HY - Math.sin(a) * 14;
  if (glow > 0) { c.save(); c.globalCompositeOperation = 'screen'; const gg = c.createRadialGradient(tx, ty, 2, tx, ty, 95); gg.addColorStop(0, `rgba(255,236,150,${0.9 * glow})`); gg.addColorStop(0.4, `rgba(255,210,110,${0.35 * glow})`); gg.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = gg; c.fillRect(tx - 95, ty - 95, 190, 190); c.restore();
    c.save(); c.strokeStyle = `rgba(255,236,150,${0.8 * glow})`; for (let i = 0; i < 2; i++) { const q = (t * 1.6 + i / 2) % 1; c.globalAlpha = 1 - q; c.lineWidth = 3 * (1 - q) + 0.6; c.beginPath(); c.arc(tx, ty, 12 + q * 34, 0, 7); c.stroke(); } c.restore(); }
  if (glow > 0) { const hh = c.createRadialGradient(tx, ty, 8, tx, ty, 40); hh.addColorStop(0, `rgba(255,214,90,${0.6 * glow})`); hh.addColorStop(1, 'rgba(255,214,90,0)'); c.fillStyle = hh; c.beginPath(); c.arc(tx, ty, 40, 0, 7); c.fill(); }
  c.lineCap = 'round'; c.strokeStyle = '#7a5418'; c.lineWidth = 9; c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.stroke();
  const sg = c.createLinearGradient(bx, by, tx, ty); sg.addColorStop(0, '#c8962e'); sg.addColorStop(0.5, '#fbe08a'); sg.addColorStop(1, '#e9b949'); c.strokeStyle = sg; c.lineWidth = 6; c.stroke();
  c.strokeStyle = 'rgba(255,255,240,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx - 1, by - 1); c.lineTo(tx - 1, ty - 1); c.stroke();
  // the knob at the top
  const kg = c.createRadialGradient(tx - 4, ty - 4, 1, tx, ty, 12); kg.addColorStop(0, '#fffbe0'); kg.addColorStop(0.5, '#f8d06a'); kg.addColorStop(1, '#a8781e'); c.fillStyle = kg; c.strokeStyle = '#7a5418'; c.lineWidth = 1.4; c.beginPath(); c.arc(tx, ty, 11.5, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#d84a5a'; c.beginPath(); c.arc(tx, ty, 4, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(tx - 4, ty - 4, 2.4, 0, 7); c.fill();
  if (glow > 0.3) { c.save(); c.fillStyle = `rgba(255,250,220,${glow})`; for (let i = 0; i < 4; i++) { const ang = t * 3 + i * 1.57, d = 15 + 4 * Math.sin(t * 7 + i); drawStar(c, tx + Math.cos(ang) * d, ty + Math.sin(ang) * d, 2.4 + glow * 1.6, ang); } c.restore(); }
}
function fanBearer(c, x, y, t) { // an attendant gently fanning the king with a big palm fan
  const sw = Math.sin(t * 2.2) * 0.35;
  c.save(); c.translate(x - 4, y - 58); c.rotate(-0.5 + sw);
  c.strokeStyle = '#6a4226'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -64); c.stroke();
  for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.22; c.fillStyle = k % 2 ? '#4f9a5a' : '#6ab06a'; c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(Math.cos(a - 0.12) * 20, -60 + Math.sin(a - 0.12) * 20, Math.cos(a) * 34, -60 + Math.sin(a) * 34); c.quadraticCurveTo(Math.cos(a + 0.12) * 20, -60 + Math.sin(a + 0.12) * 20, 0, -60); c.fill(); }
  c.fillStyle = '#e9b949'; c.beginPath(); c.arc(0, -60, 3, 0, 7); c.fill();
  c.restore();
  P.person(c, x, y, 0.9, { skin: SK[5], robe: CL.cream, stripe: CL.teal, hair: HR[3], hairStyle: 'short', head: 'wrap', headCol: CL.white, arms: 'hold', facing: -1, t, phase: 2, bounce: 0.5, expr: 'happy' });
}
function smoke(c, x, y, t) {
  c.save(); for (let i = 0; i < 6; i++) { const q = (t * 0.35 + i / 6) % 1; c.fillStyle = `rgba(255,250,245,${0.22 * (1 - q)})`; c.beginPath(); c.arc(x + Math.sin(t * 1.5 + i * 2 + q * 5) * 8 * q, y - q * 90, 4 + q * 10, 0, 7); c.fill(); } c.restore();
  c.fillStyle = '#b8862e'; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y); c.lineTo(x + 5, y + 12); c.lineTo(x - 5, y + 12); c.closePath(); c.fill(); c.fillRect(x - 2, y + 12, 4, 18); c.fillRect(x - 8, y + 28, 16, 4);
  c.fillStyle = 'rgba(255,170,90,0.8)'; c.beginPath(); c.ellipse(x, y, 7, 2, 0, 0, 7); c.fill();
}
function bubble(c, x, y, t, k) {
  c.save(); c.translate(x, y); const sc = Math.min(1, k * 4) * (1 + 0.04 * Math.sin(t * 6)); c.scale(sc, sc);
  c.fillStyle = 'rgba(255,253,245,0.97)'; c.strokeStyle = 'rgba(90,50,80,0.7)'; c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 40, 26, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-22, 18); c.lineTo(-34, 38); c.lineTo(-8, 24); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,253,245,0.97)'; c.fillRect(-21, 15, 13, 8);
  // a heart around a little family: "please save my people"
  c.fillStyle = '#ff7a9a'; c.beginPath(); c.moveTo(0, 18); c.bezierCurveTo(-34, 0, -20, -28, 0, -12); c.bezierCurveTo(20, -28, 34, 0, 0, 18); c.fill();
  const heads = [[-9, -1, 5.2, SK[3], HR[0]], [0, 2, 4, SK[1], HR[1]], [9, -1, 5.2, SK[2], HR[5]]];
  for (const [hx, hy, hr, sk, hc] of heads) { c.fillStyle = hc; c.beginPath(); c.arc(hx, hy - 1, hr * 1.08, Math.PI, 0); c.fill(); c.fillStyle = sk; c.beginPath(); c.arc(hx, hy, hr, 0, 7); c.fill(); c.fillStyle = '#2a1820'; c.beginPath(); c.arc(hx - hr * 0.35, hy, 0.8, 0, 7); c.arc(hx + hr * 0.35, hy, 0.8, 0, 7); c.fill(); }
  c.restore();
}

MG.add({
  id: 'brave', stage: 'exile', cmd: 'SPEAK UP!', hint: 'tap', time: 6, mood: 'bright', winText: 'Brave!',
  card: {
    title: 'Queen Esther speaks up', ref: 'Esther 4–7', kind: 'Story',
    text: 'The book of Esther tells how a Jewish woman named Esther became queen of Persia. When a powerful man named Haman plotted to harm all the Jewish people, Esther went to the king without being called, even though that was against the law. The king held out his golden scepter to welcome her, and she spoke up and asked him to save her people.',
    note: 'Many scholars read Esther as a story told to give courage to Jews living far from home under foreign kings. Jewish families retell it every year at the festival of Purim.',
    ask: 'When could you speak up for someone who is being treated unfairly?',
  },
  init(g) {
    const s = g.s, tu = TUNE[g.level];
    s.tu = tu; s.sp = 1 + (g.speed - 1) * 0.55; s.need = tu.need;
    s.clock = tu.per - 0.42; // the first raise starts about 0.42 s in, while the banner is still up
    s.step = 0; s.from = 0; s.stepT = -9; s.used = -1; s.oopsT = -9; s.freeze = 0; s.winT = -1;
    s.motes = Array.from({ length: 22 }, () => ({ x: 100 + Math.random() * 160, y: 150 + Math.random() * 300, ph: Math.random() * 6, sp: 6 + Math.random() * 10 }));
  },
  phase(g) { const s = g.s, k = Math.floor(s.clock / s.tu.per), u = s.clock - k * s.tu.per; return { k, u, up: u < s.tu.up }; },
  down(g) {
    const s = g.s; if (g.t < s.freeze) return;
    const { k, u, up } = this.phase(g);
    if (up && u > 0.06 && s.used !== k) {
      s.used = k; s.from = s.step; s.step++; s.stepT = g.t; g.sfx('ding'); g.sfx('tambourine');
      const p = spot(s.step, s.need); g.burst(p.x, p.y - 30, GOLD, 12, 140);
      if (s.step >= s.need) { s.winT = g.t; g.win(); g.sfx('trumpet'); g.sfx('cheer'); g.burst(HX, HY, GOLD, 26, 220); }
    } else if (!(up && s.used === k)) { // not now! Esther wobbles back with a little gulp; it only costs a moment
      s.oopsT = g.t; s.freeze = g.t + 0.45; g.sfx('boing'); g.shake(2, 0.12);
    }
  },
  update(g, dt) {
    const s = g.s;
    if (!g.done) s.clock += dt * s.sp;
    for (const m of s.motes) { m.y -= m.sp * dt; if (m.y < 140) { m.y = 470; m.x = 100 + Math.random() * 160; } }
  },
  auto(g, dt, synth) { // tap a moment after each raise begins
    const s = g.s; if (g.done) return; const { k, u, up } = this.phase(g);
    if (up && u > 0.14 && s.used !== k && g.t >= s.freeze) { synth('down', 180, 480); synth('up', 180, 480); }
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', wk = won ? Math.min(1, (t - s.winT) * 2) : 0;
    c.drawImage(g.bake('exile_brave_bg', paintBg), 0, 0, W, H);
    // curtains stir, dust motes float in the light
    c.save(); c.globalCompositeOperation = 'screen'; P.rays(c, KX, 150, W, 300, '#ffe6b0', 0.07 + 0.03 * Math.sin(t) + 0.15 * wk, 7, t); c.restore();
    for (const m of s.motes) { c.fillStyle = `rgba(255,240,200,${0.35 + 0.3 * Math.sin(t * 2 + m.ph)})`; c.beginPath(); c.arc(m.x + Math.sin(t + m.ph) * 6, m.y, 1.2, 0, 7); c.fill(); }
    smoke(c, 80, 372, t); smoke(c, 280, 372, t + 1.3);
    fanBearer(c, 252, 362, t);
    // scepter rhythm: rises quickly, stays up during the welcome, then lowers
    const { u, up } = this.phase(g), tu = s.tu;
    let lift = won ? 1 : smooth(u / 0.12) * (1 - smooth((u - tu.up) / 0.16));
    let ang = A_DOWN + (A_UP - A_DOWN) * lift;
    if (won) { const held = Math.atan2(spot(s.need, s.need).y - 50 - HY, spot(s.need, s.need).x + 30 - HX); ang = A_UP + (held - A_UP) * smooth((t - s.winT) * 3); }
    const glow = won ? 1 : lift * (0.75 + 0.25 * Math.sin(t * 10)), hint = !won && !up && tu.per - u < 0.22 ? (1 - (tu.per - u) / 0.22) : 0;
    // the king
    c.save(); c.beginPath(); c.rect(KX - 80, 150, 160, KY - 6 * KS - 150); c.clip();
    P.person(c, KX, KY + 12 * KS, KS, { ...KING, t, phase: 0.5, bounce: 0.4, arms: 'raise', expr: won ? 'laugh' : t - s.oopsT < 0.6 ? 'surprised' : lift > 0.5 ? 'happy' : 'neutral', blink: !won && lift < 0.2 && Math.sin(t * 1.7) > 0.96 });
    c.restore();
    const lg = c.createLinearGradient(KX, KY - 18, KX, KY + 4); lg.addColorStop(0, P.shade(KING.robe, 0.12)); lg.addColorStop(1, P.shade(KING.robe, -0.2));
    c.fillStyle = lg; c.strokeStyle = P.shade(KING.robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(KX, KY - 5 * KS, 19 * KS, 8 * KS, 0, 0, 7); c.fill(); c.stroke();
    c.fillStyle = '#6b3a26'; c.beginPath(); c.ellipse(KX - 12 * KS, KY + 4, 6 * KS, 3 * KS, 0, 0, 7); c.ellipse(KX + 12 * KS, KY + 4, 6 * KS, 3 * KS, 0, 0, 7); c.fill();
    const headY = KY + 12 * KS + (-40 - 15) * KS - Math.sin(t * 6 + 0.5) * 0.4 * 0.5 * KS;
    kingBeard(c, KX, headY + 7 * KS, KS);
    kingCrown(c, KX, headY - 12 * KS, KS);
    if (glow > 0) { c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,214,140,${0.08 * glow})`; c.fillRect(0, 0, W, H); c.restore(); }
    scepter(c, ang, Math.max(glow, hint * 0.5), t);
    // Esther: hops forward one step for each welcome
    const st = Math.min(1, (t - s.stepT) / 0.32), a = spot(s.from, s.need), b = spot(s.step, s.need);
    const ex = a.x + (b.x - a.x) * smooth(st), ey = a.y + (b.y - a.y) * smooth(st) - Math.sin(st * Math.PI) * 14, es = a.s + (b.s - a.s) * smooth(st);
    const oops = t - s.oopsT < 0.45, wob = oops ? Math.sin((t - s.oopsT) * 40) * 0.08 * (1 - (t - s.oopsT) / 0.45) : 0;
    const gl = c.createRadialGradient(ex, ey - 40 * es, 6, ex, ey - 40 * es, 70 * es); gl.addColorStop(0, `rgba(255,236,170,${0.25 + 0.3 * glow})`); gl.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = gl; c.fillRect(ex - 80, ey - 120 * es, 160, 140 * es);
    c.save(); c.translate(ex, ey); c.rotate(wob);
    P.person(c, 0, 0, es, { ...ESTHER, t, phase: 1, bounce: st < 1 ? 0 : 0.8, expr: won ? 'laugh' : oops ? 'surprised' : st < 1 ? 'happy' : s.step === 0 ? 'neutral' : 'happy', arms: won ? 'reach' : oops ? 'pray' : st < 1 ? 'out' : 'down' });
    c.restore();
    if (oops) { c.fillStyle = 'rgba(160,210,255,0.9)'; c.beginPath(); c.ellipse(ex + 16 * es, ey - 82 * es, 2.6, 4, 0, 0, 7); c.fill(); }
    if (won) { bubble(c, ex - 58, ey - 128 * es, t, (t - s.winT)); }
    // her people peek in and cheer when she wins
    if (wk > 0) for (const pp of PEOPLE) { const slide = (1 - wk) * 60 * -pp.f; P.person(c, pp.x + slide, pp.y, pp.s, { ...pp.o, facing: pp.f, t, phase: pp.x, bounce: 2.5, arms: 'cheer', expr: 'laugh' }); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
