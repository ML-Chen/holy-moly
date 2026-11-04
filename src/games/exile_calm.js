// CALM! — Daniel 6:16–23. Daniel spends the night in the lions' den, and the lions do him no harm.
// The lions are big, fluffy and drowsy: stroke (or pat) each one until it purrs, curls up and falls asleep in a cuddle pile around Daniel.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const DX = 180, DY = 486;                                   // where Daniel sits
const DANIEL = { skin: SK[2], robe: CL.indigo, stripe: CL.gold, hair: HR[5], beard: '#e8e2da', hairStyle: 'short' };
// lion spots (x, y, facing toward Daniel, scale), front ones last so they draw on top
const SPOTS = [[76, 452, 1, 0.9], [288, 452, -1, 0.9], [88, 580, 1, 1.0], [274, 580, -1, 1.0]];
const MANES = ['#b8541f', '#c9762a', '#a8481e', '#cf8a34'];
const TUNE = [{ n: 2, tap: 0.3, rub: 1 / 300, decay: 0 }, { n: 3, tap: 0.24, rub: 1 / 360, decay: 0.05 }, { n: 4, tap: 0.2, rub: 1 / 400, decay: 0.1 }];
const GOLD = ['#fff6c0', '#ffe27a', '#ffffff', '#ffd0e8'];

function paintBg(o) {
  // night sky through the opening at the top of the den
  P.sky(o, W, 200, ['#0a0c2e', '#1c1e5a', '#3a2e7a']);
  P.stars(o, W, 190, 80, 21, 0);
  const mg = o.createRadialGradient(250, 70, 2, 250, 70, 70); mg.addColorStop(0, 'rgba(255,250,225,1)'); mg.addColorStop(0.2, 'rgba(255,246,210,0.9)'); mg.addColorStop(0.24, 'rgba(220,220,255,0.35)'); mg.addColorStop(1, 'rgba(180,180,255,0)');
  o.fillStyle = mg; o.fillRect(170, 0, 160, 150);
  // the den: warm sandstone walls closing in around the opening
  const wall = o.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#5a3a4a'); wall.addColorStop(0.45, '#7a4e44'); wall.addColorStop(1, '#4a2e30');
  o.fillStyle = wall; o.beginPath(); o.moveTo(-10, -10); o.lineTo(-10, H + 10); o.lineTo(W + 10, H + 10); o.lineTo(W + 10, -10);
  // the hole: an irregular rim
  o.lineTo(W + 10, 40); for (let x = W; x >= 0; x -= 6) { const k = (x - 180) / 180, y = 150 + 40 * k * k - 22 * P.noise1(x * 0.06, 4); o.lineTo(x, y + (Math.abs(k) > 0.85 ? -100 * (Math.abs(k) - 0.85) * 6 : 0)); } o.lineTo(-10, 40); o.closePath(); o.fill();
  // stone blocks and shading on the walls
  const r = P.rng(12);
  o.save(); o.clip();
  for (let i = 0; i < 70; i++) { const x = r() * W, y = 150 + r() * 330, w = 26 + r() * 40, h = 14 + r() * 16; o.fillStyle = P.rgba(r() < 0.5 ? '#c8906a' : '#3a2230', 0.12 + r() * 0.12); roundRect(o, x - w / 2, y - h / 2, w, h, 5); o.fill(); o.strokeStyle = 'rgba(40,20,30,0.18)'; o.lineWidth = 1; o.stroke(); }
  const side = o.createLinearGradient(0, 0, W, 0); side.addColorStop(0, 'rgba(20,10,30,0.55)'); side.addColorStop(0.3, 'rgba(20,10,30,0)'); side.addColorStop(0.7, 'rgba(20,10,30,0)'); side.addColorStop(1, 'rgba(20,10,30,0.55)'); o.fillStyle = side; o.fillRect(0, 0, W, H);
  o.restore();
  // the rim catches the moonlight
  o.strokeStyle = 'rgba(220,210,255,0.5)'; o.lineWidth = 3; o.beginPath(); for (let x = 0; x <= W; x += 6) { const k = (x - 180) / 180, y = 150 + 40 * k * k - 22 * P.noise1(x * 0.06, 4) + (Math.abs(k) > 0.85 ? -100 * (Math.abs(k) - 0.85) * 6 : 0); x ? o.lineTo(x, y + 2) : o.moveTo(x, y + 2); } o.stroke();
  // vines hanging over the edge
  for (const [vx, len] of [[40, 90], [92, 60], [300, 110], [336, 70]]) { o.strokeStyle = '#3f6a3a'; o.lineWidth = 2; o.beginPath(); const y0 = 150 + 40 * ((vx - 180) / 180) ** 2 - 14; o.moveTo(vx, y0); o.quadraticCurveTo(vx + 8, y0 + len / 2, vx - 2, y0 + len); o.stroke(); for (let k = 0; k < len; k += 12) { o.fillStyle = k % 24 ? '#5f9a4a' : '#4a7f3e'; o.beginPath(); o.ellipse(vx + 3 + (k % 24 ? 5 : -5), y0 + k + 6, 5, 2.6, k % 24 ? 0.5 : -0.5, 0, 7); o.fill(); } }
  // sandy floor
  const fl = o.createLinearGradient(0, 400, 0, H); fl.addColorStop(0, '#9a6a52'); fl.addColorStop(1, '#6a4236'); o.fillStyle = fl;
  o.beginPath(); o.moveTo(-10, H); o.lineTo(-10, 420); o.quadraticCurveTo(180, 380, W + 10, 420); o.lineTo(W + 10, H); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,220,180,0.25)'; o.lineWidth = 2; o.beginPath(); o.moveTo(-10, 420); o.quadraticCurveTo(180, 380, W + 10, 420); o.stroke();
  // straw scattered on the floor
  for (let i = 0; i < 140; i++) { const x = r() * W, y = 410 + r() * 230, a = r() * Math.PI, l = 5 + r() * 9; o.strokeStyle = P.rgba(r() < 0.5 ? '#f0cf7a' : '#c8a050', 0.5 + r() * 0.4); o.lineWidth = 1.2; o.beginPath(); o.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l * 0.4); o.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.4); o.stroke(); }
  P.rock(o, 18, 440, 1.0, '#9a6a5a'); P.rock(o, 346, 446, 0.9, '#8a5e52'); P.rock(o, 334, 630, 1.1, '#7a5048'); P.rock(o, 22, 632, 1.0, '#7a5048');
  // a silver pool of moonlight on the floor where Daniel sits
  o.save(); o.globalCompositeOperation = 'screen'; const pool = o.createRadialGradient(DX, DY, 10, DX, DY, 150); pool.addColorStop(0, 'rgba(210,200,255,0.42)'); pool.addColorStop(1, 'rgba(200,190,255,0)'); o.fillStyle = pool; o.beginPath(); o.ellipse(DX, DY, 170, 70, 0, 0, 7); o.fill(); o.restore();
}

// a big, fluffy, drowsy lion lying down, facing right; calm 0..1 droops the head and eyelids; asleep curls it up
function bigLion(c, x, y, s, o) {
  const { t = 0, calm = 0, sleep = 0, facing = 1, mane = '#b8541f', ph = 0, pet = 0, yawn = 0 } = o;
  const breathe = Math.sin(t * (sleep ? 2.2 : 3) + ph) * (sleep ? 1.6 : 1), purr = sleep ? Math.sin(t * 60) * 0.5 : 0;
  c.save(); c.translate(x + purr, y); c.scale(s * facing, s);
  c.fillStyle = 'rgba(30,10,20,0.32)'; c.beginPath(); c.ellipse(-4, 2, 66, 10, 0, 0, 7); c.fill();
  const fur = '#e8b064', furD = '#b97a38', furL = '#fcdca0';
  // tail: swishes while awake, curls around the body when asleep
  c.lineCap = 'round'; c.strokeStyle = furD; c.lineWidth = 7;
  const sw = sleep ? 0 : Math.sin(t * 2.4 + ph) * 10 * (1 - calm * 0.7);
  c.beginPath(); c.moveTo(-50, -16); if (sleep) c.quadraticCurveTo(-64, 4, -20, 2); else c.quadraticCurveTo(-74, -18 + sw, -78, -40 + sw); c.stroke();
  c.strokeStyle = fur; c.lineWidth = 4.5; c.stroke();
  const tx = sleep ? -20 : -78, ty = sleep ? 2 : -40 + sw; c.fillStyle = P.shade(mane, -0.1); c.beginPath(); c.ellipse(tx, ty, 7, 6, 0.4, 0, 7); c.fill();
  // body
  c.save(); c.translate(0, -breathe * 0.4);
  const bg = c.createRadialGradient(-20, -40, 4, -8, -22, 60); bg.addColorStop(0, furL); bg.addColorStop(0.55, fur); bg.addColorStop(1, furD);
  c.fillStyle = bg; c.strokeStyle = P.shade(furD, -0.35); c.lineWidth = 2;
  c.beginPath(); c.ellipse(-12, -22, 48, 22 + breathe * 0.4, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.arc(-40, -26, 22, 0, 7); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,250,230,0.3)'; c.beginPath(); c.ellipse(-22, -36, 24, 5, -0.05, 0, 7); c.fill();
  c.strokeStyle = P.rgba(furD, 0.6); c.lineWidth = 1.5; c.beginPath(); c.arc(-40, -22, 12, Math.PI * 0.9, Math.PI * 1.7); c.stroke();
  // front paws, big and soft
  for (const [px, k] of [[30, 0], [44, 1]]) { const pg = c.createRadialGradient(px - 3, -7, 1, px, -4, 12); pg.addColorStop(0, furL); pg.addColorStop(1, fur); c.fillStyle = pg; c.strokeStyle = P.shade(furD, -0.35); c.lineWidth = 1.8; c.beginPath(); c.ellipse(px, -5, 13, 7, 0, 0, 7); c.fill(); c.stroke(); c.strokeStyle = P.rgba(furD, 0.8); c.lineWidth = 1.2; c.beginPath(); for (const tx2 of [5, 9]) { c.moveTo(px + tx2, -9); c.lineTo(px + tx2, -3); } c.stroke(); }
  c.restore();
  // head: droops with calm; when asleep it rests on the paws
  const hd = sleep ? 1 : calm, hx = 30 + hd * 6, hy = -52 + hd * 16 - breathe * 0.6, tilt = hd * 0.18 + (sleep ? 0.12 : 0);
  c.save(); c.translate(hx, hy); c.rotate(tilt);
  // fluffy mane: two rings of tufts
  for (let ring = 0; ring < 2; ring++) { const R = ring ? 25 : 31, n = ring ? 13 : 16, rr = ring ? 10 : 11; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + ring * 0.2 + Math.sin(t * 2 + i + ph) * 0.03; const g2 = c.createRadialGradient(Math.cos(a) * R - 3, Math.sin(a) * R - 3, 1, Math.cos(a) * R, Math.sin(a) * R, rr); g2.addColorStop(0, P.shade(mane, ring ? 0.22 : 0.1)); g2.addColorStop(1, P.shade(mane, ring ? 0 : -0.18)); c.fillStyle = g2; c.beginPath(); c.arc(Math.cos(a) * R, Math.sin(a) * R, rr, 0, 7); c.fill(); } }
  // ears
  for (const ex of [-12, 12]) { c.fillStyle = fur; c.strokeStyle = P.shade(furD, -0.3); c.lineWidth = 1.5; c.beginPath(); c.arc(ex, -18, 6.5, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#e89a8a'; c.beginPath(); c.arc(ex, -18, 3.4, 0, 7); c.fill(); }
  // face
  const fg = c.createRadialGradient(-5, -6, 2, 0, 0, 22); fg.addColorStop(0, furL); fg.addColorStop(1, fur); c.fillStyle = fg; c.strokeStyle = P.shade(furD, -0.3); c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 20, 19, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#fff2d4'; c.beginPath(); c.ellipse(-5, 9, 7.5, 6, 0, 0, 7); c.ellipse(5, 9, 7.5, 6, 0, 0, 7); c.fill();
  P.blush(c, -13, 6, 3.4); P.blush(c, 13, 6, 3.4);
  // eyes: open and sleepy, lids lowering with calm, closed arcs when asleep or mid-yawn
  if (sleep || yawn > 0.3) { c.strokeStyle = '#3a1a10'; c.lineWidth = 2; c.lineCap = 'round'; for (const ex of [-7, 7]) { c.beginPath(); c.arc(ex, -3, 4, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); } }
  else {
    const lid = 0.25 + calm * 0.55 + (pet > 0 ? 0.25 * pet : 0);
    for (const ex of [-7, 7]) {
      c.save(); c.beginPath(); c.ellipse(ex, -2, 4, 4.8, 0, 0, 7); c.clip();
      c.fillStyle = '#2a1820'; c.fillRect(ex - 5, -8, 10, 12); c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 1.2, -0.5, 1.4, 0, 7); c.fill();
      c.fillStyle = fur; c.fillRect(ex - 6, -8, 12, 10 * Math.min(1, lid)); c.restore();
      c.strokeStyle = '#3a1a10'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(ex - 4.5, -7 + 9.6 * Math.min(1, lid)); c.lineTo(ex + 4.5, -7 + 9.6 * Math.min(1, lid)); c.stroke();
    }
  }
  // nose and mouth
  c.fillStyle = '#6a2a24'; c.beginPath(); c.moveTo(-4, 4); c.lineTo(4, 4); c.lineTo(0, 8); c.closePath(); c.fill();
  if (yawn > 0) { c.fillStyle = '#8a2a3a'; c.beginPath(); c.ellipse(0, 14, 5 * yawn + 1, 7 * yawn + 1, 0, 0, 7); c.fill(); c.fillStyle = '#f08a9a'; c.beginPath(); c.ellipse(0, 17 + yawn * 2, 3.4 * yawn, 2.4 * yawn, 0, 0, 7); c.fill(); }
  else { c.strokeStyle = '#6a2a24'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 8); c.lineTo(0, 10); c.arc(-3, 10, 3, 0, Math.PI * 0.9); c.moveTo(0, 10); c.arc(3, 10, 3, Math.PI, Math.PI * 0.1, true); c.stroke(); }
  c.strokeStyle = 'rgba(255,250,235,0.7)'; c.lineWidth = 0.9; for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(sd * 9, 9 + k * 3); c.lineTo(sd * 22, 6 + k * 5); c.stroke(); }
  c.restore();
  c.restore();
}
// Daniel sitting cross-legged on the straw
function seated(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 126 * s); c.clip(); P.person(c, x, y + 12 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 12 * s, x, y + 4 * s); g.addColorStop(0, P.shade(robe, 0.12)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 4 * s, 19 * s, 7.5 * s, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 13 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.ellipse(x + 13 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill();
}
// the angel: a tall, soft, shimmering presence of light with folded wings, standing behind Daniel
function angel(c, x, y, t, k) {
  c.save(); c.globalCompositeOperation = 'screen';
  const br = 0.75 + 0.25 * Math.sin(t * 2.2);
  const halo = c.createRadialGradient(x, y - 90, 10, x, y - 60, 170); halo.addColorStop(0, `rgba(255,246,210,${0.55 * br * k})`); halo.addColorStop(0.5, `rgba(220,210,255,${0.22 * k})`); halo.addColorStop(1, 'rgba(200,190,255,0)'); c.fillStyle = halo; c.fillRect(x - 180, y - 260, 360, 300);
  c.globalCompositeOperation = 'source-over';
  // wings: two tall feathered wings of pale light, raised a little behind the angel
  const flap = Math.sin(t * 1.6) * 0.05;
  for (const sd of [-1, 1]) {
    c.save(); c.translate(x + sd * 10, y - 118); c.scale(sd, 1); c.rotate(-0.15 - flap);
    const TIPS = [[92, -54], [86, -28], [76, -4], [62, 18], [46, 38], [28, 54], [10, 50]];
    const wing = () => { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(30, -40, 66, -62, 92, -54); for (let k = 1; k < TIPS.length; k++) { const [x0, y0] = TIPS[k - 1], [x1, y1] = TIPS[k], mx = (x0 + x1) / 2, my = (y0 + y1) / 2; c.quadraticCurveTo(mx + (y1 - y0) * 0.45, my - (x1 - x0) * 0.45 + 6, x1, y1); } c.quadraticCurveTo(2, 34, 0, 20); c.closePath(); };
    const wg = c.createLinearGradient(0, -50, 60, 50); wg.addColorStop(0, `rgba(255,253,244,${0.62 * k})`); wg.addColorStop(1, `rgba(230,224,255,${0.16 * k})`);
    wing(); c.fillStyle = wg; c.fill(); c.strokeStyle = `rgba(255,226,150,${0.5 * k})`; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = `rgba(255,236,190,${0.4 * k})`; c.lineWidth = 1.2; c.beginPath();
    for (let k = 1; k < TIPS.length - 1; k++) { const [tx, ty] = TIPS[k]; c.moveTo(6, 8); c.quadraticCurveTo(tx * 0.45, ty * 0.45 - 10, tx - 4, ty - 2); } c.stroke();
    c.restore();
  }
  // robe of light and a head
  const rg = c.createLinearGradient(0, y - 140, 0, y - 10); rg.addColorStop(0, `rgba(255,252,240,${0.72 * k})`); rg.addColorStop(1, 'rgba(255,240,220,0)'); c.fillStyle = rg;
  c.beginPath(); c.moveTo(x - 12, y - 132); c.quadraticCurveTo(x - 32, y - 60, x - 42, y - 10); c.lineTo(x + 42, y - 10); c.quadraticCurveTo(x + 32, y - 60, x + 12, y - 132); c.closePath(); c.fill();
  c.strokeStyle = `rgba(255,226,150,${0.35 * k})`; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - 6, y - 120); c.quadraticCurveTo(x - 14, y - 70, x - 18, y - 30); c.moveTo(x + 6, y - 120); c.quadraticCurveTo(x + 14, y - 70, x + 18, y - 30); c.stroke();
  const hg = c.createRadialGradient(x - 3, y - 152, 2, x, y - 148, 17); hg.addColorStop(0, `rgba(255,255,250,${0.92 * k})`); hg.addColorStop(0.7, `rgba(255,248,230,${0.7 * k})`); hg.addColorStop(1, 'rgba(255,248,230,0)'); c.fillStyle = hg; c.beginPath(); c.arc(x, y - 148, 17, 0, 7); c.fill();
  c.strokeStyle = `rgba(255,220,120,${0.9 * k * br})`; c.lineWidth = 2.6; c.beginPath(); c.ellipse(x, y - 170, 13, 3.5, 0, 0, 7); c.stroke();
  c.globalCompositeOperation = 'screen';
  // shimmer
  for (let i = 0; i < 9; i++) { const q = (t * 0.5 + i / 9) % 1, sx = x + Math.sin(i * 2.7 + t) * 50, sy = y - 30 - q * 170, tw = Math.max(0, Math.sin(t * 6 + i * 1.7)); c.fillStyle = `rgba(255,248,220,${tw * (1 - q) * k})`; drawStar(c, sx, sy, 1.5 + tw * 2.5, t + i); }
  c.restore();
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
function zzz(c, x, y, t, ph) {
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const zig = () => { c.beginPath(); c.moveTo(-5, -5); c.lineTo(5, -5); c.lineTo(-5, 5); c.lineTo(5, 5); };
  for (let i = 0; i < 3; i++) { const q = (t * 0.6 + i / 3 + ph) % 1, sz = 0.6 + q * 0.7; c.globalAlpha = Math.sin(q * Math.PI) * 0.9; c.save(); c.translate(x + q * 18 + Math.sin(q * 6) * 3, y - q * 44); c.scale(sz, sz); c.rotate(-0.15);
    zig(); c.strokeStyle = 'rgba(60,40,90,0.7)'; c.lineWidth = 5; c.stroke(); zig(); c.strokeStyle = '#f4f0ff'; c.lineWidth = 2.6; c.stroke(); c.restore(); }
  c.restore();
}
const headAt = l => [l.x + l.f * 36 * l.s, l.y - 44 * l.s];

MG.add({
  id: 'calm', stage: 'exile', cmd: 'CALM!', hint: 'drag', time: 5, mood: 'night', winText: 'Purr!',
  card: {
    title: 'Daniel and the lions', ref: 'Daniel 6:11–23', kind: 'Story',
    text: 'The book of Daniel tells how Daniel was thrown into a den of lions because he kept praying to God. King Darius liked Daniel and could not sleep all night for worry. In the morning Daniel called out that God had sent an angel to shut the lions\' mouths, and he came out without a scratch.',
    note: 'Some Christians believe this happened just as it is told, and others read it as a story that shows God is with us when we are afraid. Many scholars think it was told to give courage to Jews living under foreign kings.',
    ask: 'What makes you feel afraid? Who helps you feel safe and calm?',
  },
  init(g) {
    const s = g.s, tu = TUNE[g.level];
    s.tu = tu; s.k = 1 + (g.speed - 1) * 0.4;
    const pick = g.level === 0 ? [0, 1] : g.level === 1 ? [0, 1, 3] : [0, 1, 2, 3];
    s.lions = pick.map((i, k) => { const [x, y, f, sc] = SPOTS[i]; return { x, y, x0: x, y0: y, f, s: sc, calm: 0, sleep: false, sleepT: 0, petT: -9, yawnT: -9, mane: MANES[(i + Math.floor(Math.random() * 4)) % 4], ph: Math.random() * 6, nextYawn: 0.6 + Math.random() * 2.2 }; });
    s.held = null; s.lastX = 0; s.lastY = 0; s.hearts = []; s.winT = -1;
    s.motes = Array.from({ length: 24 }, () => ({ x: 120 + Math.random() * 120, y: 150 + Math.random() * 360, ph: Math.random() * 6, sp: 8 + Math.random() * 12 }));
  },
  down(g, x, y) {
    const s = g.s; s.held = true; s.lastX = x; s.lastY = y;
    const l = this.hit(s, x, y); if (l) this.soothe(g, l, s.tu.tap, x, y, true);
  },
  move(g, x, y) {
    const s = g.s; if (!s.held) return;
    const d = Math.hypot(x - s.lastX, y - s.lastY); s.lastX = x; s.lastY = y;
    const l = this.hit(s, x, y); if (l && d > 0) this.soothe(g, l, Math.min(d, 40) * s.tu.rub * s.k, x, y, false);
  },
  up(g) { g.s.held = false; },
  hit(s, x, y) { let best = null, bd = 1e9; for (const l of s.lions) { if (l.sleep) continue; const cx = l.x + l.f * 8 * l.s, cy = l.y - 30 * l.s, dx = (x - cx) / (78 * l.s), dy = (y - cy) / (50 * l.s), d = dx * dx + dy * dy; if (d < 1 && d < bd) { bd = d; best = l; } } return best; },
  soothe(g, l, amt, x, y, tap) {
    const s = g.s; l.calm = Math.min(1, l.calm + amt);
    if (tap || g.t - l.petT > 0.18) { l.petT = g.t; g.sfx(tap ? 'rustle' : 'sweep'); s.hearts.push({ x: x + (Math.random() - 0.5) * 20, y: y - 10, t: g.t, col: Math.random() < 0.5 ? '#ff8aa8' : '#ffc0d0' }); g.burst(x, y, ['#fff6d0', '#ffe0a0', '#ffd0e0'], 4, 70); }
    if (l.calm >= 1 && !l.sleep) {
      l.sleep = true; l.sleepT = g.t; g.sfx('meow'); g.sfx('sparkle');
      const [hx, hy] = headAt(l); g.burst(hx, hy, GOLD, 16, 150);
      if (s.lions.every(q => q.sleep)) { s.winT = g.t; g.win(); g.sfx('harp'); g.burst(DX, DY - 60, GOLD, 30, 220); }
    }
  },
  update(g, dt) {
    const s = g.s;
    for (const l of s.lions) {
      if (!l.sleep && !g.done && g.t - l.petT > 0.5) l.calm = Math.max(0, l.calm - s.tu.decay * dt);
      if (!l.sleep && g.t > l.nextYawn) { l.yawnT = g.t; l.nextYawn = g.t + 1.8 + Math.random() * 2; }
      // asleep: scoot in close to Daniel for the cuddle pile
      const tx = l.sleep ? l.x0 + (DX - l.f * 74 - l.x0) * 0.45 : l.x0, ty = l.sleep ? l.y0 + (DY + (l.y0 > DY ? 30 : -6) - l.y0) * 0.5 : l.y0;
      l.x += (tx - l.x) * Math.min(1, dt * 5); l.y += (ty - l.y) * Math.min(1, dt * 5);
    }
    s.hearts = s.hearts.filter(h => g.t - h.t < 0.9);
    for (const m of s.motes) { m.y -= m.sp * dt; if (m.y < 150) { m.y = 520; m.x = 110 + Math.random() * 140; } }
  },
  auto(g, dt, synth) { // stroke back and forth across the first lion still awake
    const s = g.s; if (g.t < 0.3 || g.done) return;
    const l = s.lions.find(q => !q.sleep); if (!l) return;
    const cx = l.x + l.f * 8 * l.s, cy = l.y - 30 * l.s;
    if (s.botL !== l) { if (s.held) synth('up', cx, cy); s.botL = l; s.botP = 0; synth('down', cx, cy); return; }
    s.botP += dt; synth('move', cx + Math.sin(s.botP * 18) * 40 * l.s, cy + Math.cos(s.botP * 9) * 6);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', wk = won ? Math.min(1, (t - s.winT) * 2) : 0;
    const asleep = s.lions.filter(l => l.sleep).length / s.lions.length;
    c.drawImage(g.bake('exile_calm_bg', paintBg), 0, 0, W, H);
    P.stars(c, W, 150, 18, 44, t);
    // moonbeam falling into the den
    c.save(); c.globalCompositeOperation = 'screen'; const mb = c.createLinearGradient(0, 120, 0, DY + 20); mb.addColorStop(0, `rgba(220,215,255,${0.22 + 0.04 * Math.sin(t * 1.5)})`); mb.addColorStop(1, 'rgba(220,215,255,0.04)');
    c.fillStyle = mb; c.beginPath(); c.moveTo(150, 130); c.lineTo(250, 130); c.lineTo(DX + 110, DY + 30); c.lineTo(DX - 110, DY + 30); c.closePath(); c.fill(); c.restore();
    for (const m of s.motes) { c.fillStyle = `rgba(240,236,255,${0.3 + 0.3 * Math.sin(t * 2 + m.ph)})`; c.beginPath(); c.arc(m.x + Math.sin(t + m.ph) * 8, m.y, 1.3, 0, 7); c.fill(); }
    angel(c, DX, DY - 10, t, 0.55 + 0.45 * asleep + 0.3 * wk);
    // lions behind Daniel first, then Daniel, then the front lions
    const draw1 = l => {
      const awake = !l.sleep, pet = Math.max(0, 1 - (t - l.petT) / 0.3), yq = (t - l.yawnT) / 0.9, yawn = awake && yq > 0 && yq < 1 ? Math.sin(yq * Math.PI) : 0;
      if (awake && !g.done) { const pu = 0.5 + 0.5 * Math.sin(t * 5 + l.ph); const gl = c.createRadialGradient(l.x, l.y - 20 * l.s, 6, l.x, l.y - 20 * l.s, 90 * l.s); gl.addColorStop(0, `rgba(255,226,150,${0.28 + 0.22 * pu})`); gl.addColorStop(1, 'rgba(255,226,150,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(l.x, l.y - 20 * l.s, 90 * l.s, 52 * l.s, 0, 0, 7); c.fill(); }
      c.save(); c.translate(l.x, l.y); c.scale(1 + pet * 0.04, 1 - pet * 0.05); bigLion(c, 0, 0, l.s, { t, calm: l.calm, sleep: l.sleep ? 1 : 0, facing: l.f, mane: l.mane, ph: l.ph, pet, yawn }); c.restore();
      const [hx, hy] = headAt(l);
      if (l.sleep) zzz(c, hx + l.f * 10, hy - 26 * l.s, t, l.ph);
      if (l.sleep && t - l.sleepT < 0.8) { const q = (t - l.sleepT) / 0.8; c.save(); c.strokeStyle = `rgba(255,236,200,${1 - q})`; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(l.x, l.y - 30 * l.s, 30 + q * 50 + k * 10, -2.4, -0.7); c.stroke(); } c.restore(); }
    };
    s.lions.filter(l => l.y < DY).forEach(draw1);
    const cuddle = wk > 0;
    seated(c, DX, DY, 1.2, { ...DANIEL, t, phase: 1, bounce: 0.6, expr: cuddle ? 'laugh' : asleep > 0 ? 'happy' : 'happy', blink: !cuddle && Math.sin(t * 1.3) > 0.97, arms: cuddle ? 'out' : 'pray' });
    s.lions.filter(l => l.y >= DY).forEach(draw1);
    for (const h of s.hearts) { const q = (t - h.t) / 0.9; c.save(); c.globalAlpha = 1 - q; c.fillStyle = h.col; heart(c, h.x + Math.sin(q * 8) * 4, h.y - q * 46, 6 + q * 3); c.restore(); }
    if (cuddle) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const a = t * 1.5 + i * 0.785, q = (t * 0.8 + i / 8) % 1; c.fillStyle = `rgba(255,236,170,${0.8 * (1 - q) * wk})`; drawStar(c, DX + Math.cos(a) * (60 + q * 40), DY - 70 + Math.sin(a) * 40 - q * 30, 3 + 3 * (1 - q), a); } c.restore(); }
    P.vignette(c, W, H, 0.34); P.grain(c, W, H, 0.06);
  },
});
