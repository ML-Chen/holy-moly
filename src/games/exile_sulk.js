// SULK! — Jonah 4. God spares Nineveh and the whole city celebrates, while Jonah sulks in the heat. Tap to grow a shady plant over him until he (grudgingly) smiles.
const JON = { skin: P.SKIN[2], robe: P.CLOTH.sky, stripe: P.CLOTH.white, beard: true, hair: P.HAIR[1] };
const JX = 116, JY = 598, PB = [236, 612];
const VINE = [[236, 612], [292, 500], [214, 426], [72, 476]];
function vpt(u) { const v = 1 - u, k = (i) => v * v * v * VINE[0][i] + 3 * v * v * u * VINE[1][i] + 3 * v * u * u * VINE[2][i] + u * u * u * VINE[3][i]; return [k(0), k(1)]; }
function limbS(c, ax, ay, bx, by, w, col, out) { c.lineCap = 'round'; c.strokeStyle = out; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
// Jonah sitting with his knees up and arms folded
function sitJonah(c, x, y, s, o) {
  const robe = o.robe, out = P.shade(robe, -0.45), skin = o.skin;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,20,40,0.22)'; c.beginPath(); c.ellipse(10, 1, 30, 5, 0, 0, 7); c.fill();
  const leg = (hx, kx, ky, fx, dark) => { const sc = dark ? P.shade(skin, -0.12) : skin; limbS(c, kx, ky, fx, -3, 6.5, sc, P.shade(skin, -0.4)); c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(fx + 3, -2.5, 6, 3.2, 0, 0, 7); c.fill(); limbS(c, hx, -6, kx, ky, 12, dark ? P.shade(robe, -0.15) : robe, out); };
  leg(-2, 13, -21, 24, true);
  c.save(); c.beginPath(); c.rect(-50, -150, 100, 147); c.clip(); P.person(c, 0, 16, 1, { ...o, bounce: o.bounce ?? 0.5 }); c.restore();
  c.fillStyle = robe; c.strokeStyle = out; c.lineWidth = 1.6; c.beginPath(); c.ellipse(2, -6, 15, 7, 0, 0, 7); c.fill(); c.stroke();
  leg(4, 19, -19, 31, false);
  // folded arms across the chest
  if (o.fold) { c.fillStyle = P.shade(robe, 0.05); c.strokeStyle = out; c.lineWidth = 1.5; roundRect(c, -13, -15, 26, 8, 4); c.fill(); c.stroke(); c.fillStyle = skin; c.strokeStyle = P.shade(skin, -0.4); c.lineWidth = 1.1; for (const hx of [-12, 12]) { c.beginPath(); c.arc(hx, -11, 3.4, 0, 7); c.fill(); c.stroke(); } }
  c.restore();
}
function leaf(c, x, y, r, a, t, ph) {
  c.save(); c.translate(x, y); c.rotate(a + Math.sin(t * 2 + ph) * 0.06); c.scale(r / 20, r / 20);
  c.fillStyle = 'rgba(30,50,20,0.25)'; c.beginPath(); c.ellipse(3, 4, 20, 14, 0, 0, 7); c.fill();
  const g = c.createRadialGradient(-2, -6, 1, 4, 0, 24); g.addColorStop(0, '#b8e06a'); g.addColorStop(0.6, '#5fa44a'); g.addColorStop(1, '#3f7a3a'); c.fillStyle = g;
  // a big heart-shaped gourd leaf pointing along +x
  c.beginPath(); c.moveTo(-2, 0); c.bezierCurveTo(-4, -16, 14, -20, 24, -6); c.quadraticCurveTo(28, 0, 30, 1); c.quadraticCurveTo(26, 3, 22, 8); c.bezierCurveTo(12, 20, -4, 14, -2, 0); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(40,80,30,0.5)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-1, 0); c.lineTo(27, 1); for (const k of [8, 15]) { c.moveTo(k, 0.5); c.lineTo(k + 6, -9); c.moveTo(k, 0.5); c.lineTo(k + 6, 9); } c.stroke();
  c.fillStyle = 'rgba(255,255,220,0.25)'; c.beginPath(); c.ellipse(9, -7, 7, 2.5, -0.3, 0, 7); c.fill();
  c.restore();
}
function flowerG(c, x, y, r, t) { c.save(); c.translate(x, y); c.rotate(t * 0.5); for (let i = 0; i < 5; i++) { c.rotate(1.2566); const g = c.createRadialGradient(0, -r * 0.6, 0.5, 0, -r * 0.6, r * 0.7); g.addColorStop(0, '#fff6b0'); g.addColorStop(1, '#f2b830'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -r * 0.6, r * 0.45, r * 0.65, 0, 0, 7); c.fill(); } c.fillStyle = '#d88a20'; c.beginPath(); c.arc(0, 0, r * 0.3, 0, 7); c.fill(); c.restore(); }
function lamp(c, x, y, col, t, i) { const fl = 0.75 + 0.25 * Math.sin(t * 7 + i * 1.7); const g = c.createRadialGradient(x, y, 0.5, x, y, 12); g.addColorStop(0, P.rgba('#fff0b0', 0.9 * fl)); g.addColorStop(0.3, P.rgba(col, 0.5 * fl)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill(); c.fillStyle = '#fff6d0'; c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); }
const DANCERS = [
  [40, 452, { skin: P.SKIN[2], robe: P.CLOTH.red, stripe: P.CLOTH.gold, beard: true, hair: P.HAIR[0], hairStyle: 'curly' }],
  [92, 460, { skin: P.SKIN[1], robe: P.CLOTH.teal, stripe: P.CLOTH.cream, hairStyle: 'long', hair: P.HAIR[1] }],
  [196, 456, { skin: P.SKIN[3], robe: P.CLOTH.saffron, stripe: P.CLOTH.rust, hairStyle: 'bun', hair: P.HAIR[0] }],
  [248, 462, { skin: P.SKIN[4], robe: P.CLOTH.royal, stripe: P.CLOTH.gold, beard: true, hair: P.HAIR[3], hairStyle: 'curly', head: 'crown' }],
  [300, 454, { skin: P.SKIN[2], robe: P.CLOTH.rose, stripe: P.CLOTH.white, hairStyle: 'curly', hair: P.HAIR[2], child: true }],
  [340, 462, { skin: P.SKIN[1], robe: P.CLOTH.green, stripe: P.CLOTH.cream, beard: true, hair: P.HAIR[1] }],
];
const BEASTS = [['sheep', 140, 466, 0.62], ['cow', 222, 472, 0.6], ['camel', 322, 476, 0.55], ['goat', 66, 474, 0.6], ['donkey', 276, 478, 0.55]];
function cow(c, x, y, s, f) { // a friendly little cow (Jonah 4:11: "and also many animals")
  c.save(); c.translate(x, y); c.scale(s * f, s);
  c.fillStyle = 'rgba(40,20,40,0.2)'; c.beginPath(); c.ellipse(0, 0, 20, 4.5, 0, 0, 7); c.fill();
  c.strokeStyle = '#6a5a50'; c.lineWidth = 4; c.lineCap = 'round'; for (const lx of [-11, -5, 6, 11]) { c.beginPath(); c.moveTo(lx, -12); c.lineTo(lx, -2); c.stroke(); }
  const g = c.createRadialGradient(-4, -24, 2, 0, -18, 18); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#e0d6c8'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -18, 16, 9, 0, 0, 7); c.fill();
  c.fillStyle = '#5a4a44'; c.beginPath(); c.ellipse(-6, -20, 5, 4, 0.3, 0, 7); c.ellipse(5, -15, 4, 3, 0, 0, 7); c.fill();
  c.fillStyle = '#f2e8dc'; c.beginPath(); c.ellipse(19, -24, 7, 8, 0.2, 0, 7); c.fill(); c.fillStyle = '#f0b0a8'; c.beginPath(); c.ellipse(23, -19, 5, 4, 0, 0, 7); c.fill();
  c.strokeStyle = '#e8d8a8'; c.lineWidth = 2; c.beginPath(); c.moveTo(15, -31); c.lineTo(13, -36); c.moveTo(21, -31); c.lineTo(24, -36); c.stroke();
  P.eye(c, 20, -26, 1.9); c.restore();
}

MG.add({
  id: 'sulk', stage: 'exile', cmd: 'SULK!', hint: 'tap', time: 5, mood: 'party', winText: 'Cool!',
  card: { title: 'Mercy for Nineveh', ref: 'Jonah 3–4', kind: 'Ancient story', text: 'Later in the story, the people of Nineveh said sorry and changed their ways, and God forgave them. Jonah sulked because he wanted his enemies punished. God asked him, "Should I not care about that great city and all its people?"', note: 'The book ends with God\'s question and never tells us Jonah\'s answer, so each reader gets to answer it.', ask: 'Is there someone you find it hard to forgive? What would it look like to want good things for them?' },
  init(g) {
    const s = g.s, L = g.level; s.p = 0; s.pd = 0; s.step = 1 / [5, 7, 9][L]; s.wilt = [0, 0.05, 0.09][L] * g.speed; s.done = false; s.doneT = 0; s.drops = []; s.misses = []; s.lastTap = -9;
  },
  down(g, x, y) {
    const s = g.s; if (s.done) return;
    const [tx, ty] = vpt(Math.max(0.05, s.pd * 0.9));
    if (Math.hypot(x - PB[0], y - (PB[1] - 30)) < 70 || Math.hypot(x - tx, y - ty) < 70 || (x > 30 && x < 290 && y > 340 && y < 620)) {
      s.p = Math.min(1, s.p + s.step); s.lastTap = g.t; s.drops.push({ x: tx + (Math.random() - 0.5) * 30, y: ty - 10, t: g.t }); g.sfx(s.p >= 1 ? 'magic' : 'grow');
      g.burst(tx, ty, ['#c8f08a', '#fff6b0', '#8ad0ff'], 7, 110);
      if (s.p >= 1) { s.done = true; s.doneT = g.t; g.win(); }
    } else { s.misses.push({ x, y, t: g.t }); g.sfx('tap'); }
  },
  update(g, dt) { const s = g.s; if (!s.done && g.t - s.lastTap > 0.4) s.p = Math.max(0, s.p - s.wilt * dt); s.pd += (s.p - s.pd) * Math.min(1, dt * 10); s.drops = s.drops.filter(d => g.t - d.t < 0.6); s.misses = s.misses.filter(d => g.t - d.t < 0.5); },
  auto(g, dt, synth) { const s = g.s; if (g.t > 0.4 && !s.done && g.t - (s.botT || 0) > 0.16) { s.botT = g.t; synth('down', PB[0], PB[1] - 30); synth('up', PB[0], PB[1] - 30); } },
  draw(g, c) {
    const s = g.s, t = g.t, shade = Math.max(0, Math.min(1, (s.pd - 0.45) / 0.55)), won = s.done && t - s.doneT > 0.15;
    c.drawImage(g.bake('exile_sulk_bg', o => {
      P.sky(o, W, H, ['#2a2a6a', '#7a4a8a', '#e87a6a', '#ffc070', '#ffe8a8'], { x: 74, y: 150, r: 34, color: '#ffd070', glow: 300 });
      P.stars(o, W, 110, 30, 14, 0);
      P.cloud(o, 280, 110, 0.6, '#ffd8c8', '#b07090', 0.75);
      // the Tigris and the plain
      P.hills(o, W, 330, 20, '#a07a8a', '#8a6a7a', { seed: 71, freq: 0.012, dabs: 10, rim: '#ffd0c0' });
      const rv = o.createLinearGradient(0, 336, 0, 352); rv.addColorStop(0, '#ffc8a0'); rv.addColorStop(1, '#c87a8a'); o.fillStyle = rv; o.fillRect(0, 336, W, 14);
      const pl = o.createLinearGradient(0, 348, 0, 500); pl.addColorStop(0, '#d8a070'); pl.addColorStop(1, '#c08a58'); o.fillStyle = pl; o.fillRect(0, 348, W, 160);
      // Nineveh: walls, towers, houses and the stepped temple
      o.save(); o.translate(0, 0);
      const zx = 200; for (let i = 0; i < 5; i++) { const w = 120 - i * 22, h = 18; const zg = o.createLinearGradient(zx - w / 2, 0, zx + w / 2, 0); zg.addColorStop(0, '#e8b88a'); zg.addColorStop(1, '#b8805a'); o.fillStyle = zg; o.fillRect(zx - w / 2, 372 - (i + 1) * h, w, h); o.fillStyle = 'rgba(255,230,190,0.5)'; o.fillRect(zx - w / 2, 372 - (i + 1) * h, w, 2); }
      const r = P.rng(72); for (let i = 0; i < 16; i++) { const x = 10 + r() * 340, w = 18 + r() * 22, h = 16 + r() * 24; P.house(o, x, 410 - r() * 10, w, h, P.mix('#e8c09a', '#d8a888', r())); }
      // the long city wall with crenellations and gate towers
      const wg = o.createLinearGradient(0, 396, 0, 432); wg.addColorStop(0, '#e4b080'); wg.addColorStop(1, '#a87048'); o.fillStyle = wg; o.fillRect(-4, 404, W + 8, 30);
      o.fillStyle = '#e8b888'; for (let x = -4; x < W; x += 12) o.fillRect(x, 398, 7, 7);
      for (const tx of [30, 150, 260, 344]) { o.fillStyle = '#d8a274'; o.fillRect(tx - 12, 388, 24, 46); o.fillStyle = '#ecc090'; for (let k = 0; k < 3; k++) o.fillRect(tx - 12 + k * 9, 382, 6, 7); }
      o.fillStyle = '#5a3424'; o.beginPath(); o.moveTo(140, 434); o.lineTo(140, 418); o.arc(150, 418, 10, Math.PI, 0); o.lineTo(160, 434); o.fill();
      o.fillStyle = 'rgba(80,40,30,0.25)'; for (let x = 0; x < W; x += 16) o.fillRect(x, 416 + (x % 32 ? 6 : 0), 14, 1);
      P.palm(o, 96, 404, 0.42, 0.15, 0); P.palm(o, 316, 400, 0.38, -0.2, 0);
      o.restore();
      const hz = o.createLinearGradient(0, 300, 0, 440); hz.addColorStop(0, 'rgba(255,190,140,0)'); hz.addColorStop(1, 'rgba(255,190,140,0.25)'); o.fillStyle = hz; o.fillRect(0, 300, W, 140);
      // the dusty hill where Jonah sits, east of the city
      P.hills(o, W, 512, 34, '#e0a868', '#b8783e', { seed: 75, freq: 0.01, dabs: 120, rim: '#ffe0a0' });
      P.grassTufts(o, W, 530, 640, 18, '#a89a4a', 16); P.rock(o, 320, 600, 0.9, '#c89a70'); P.rock(o, 30, 628, 0.7, '#c89a70');
      // Jonah's little booth: four sticks and a tatty cloth that barely gives any shade
      o.strokeStyle = '#7a5434'; o.lineWidth = 3; o.lineCap = 'round'; for (const [x0, x1] of [[52, 58], [184, 178]]) { o.beginPath(); o.moveTo(x0, 612); o.lineTo(x1, 470); o.stroke(); }
      o.fillStyle = '#c8a87a'; o.beginPath(); o.moveTo(52, 468); o.lineTo(184, 464); o.lineTo(178, 476); o.lineTo(158, 472); o.lineTo(140, 480); o.lineTo(112, 473); o.lineTo(90, 479); o.lineTo(56, 476); o.closePath(); o.fill(); o.strokeStyle = '#8a6a4a'; o.lineWidth = 1.2; o.stroke();
      o.fillStyle = 'rgba(255,190,130,0.9)'; for (const [hx, hy, hr] of [[92, 470, 5], [134, 469, 4], [160, 468, 3]]) { o.beginPath(); o.ellipse(hx, hy, hr, 2, 0, 0, 7); o.fill(); }
    }), 0, 0, W, H);
    // the hot sun: wavy heat rays that fade as the shade grows
    c.save(); c.globalCompositeOperation = 'screen'; for (let i = 0; i < 10; i++) { const a = i * 0.628 + t * 0.4, r0 = 44 + Math.sin(t * 4 + i) * 4; c.strokeStyle = `rgba(255,220,120,${0.5})`; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(74 + Math.cos(a) * r0, 150 + Math.sin(a) * r0); c.lineTo(74 + Math.cos(a) * (r0 + 14), 150 + Math.sin(a) * (r0 + 14)); c.stroke(); } c.restore();
    // city party lights: lanterns strung along the wall, torches on the towers, lights drifting up
    const lcols = ['#ff7a7a', '#ffc85a', '#7ad0ff', '#ff8ad0', '#a8ff8a'];
    c.strokeStyle = 'rgba(70,30,30,0.6)'; c.lineWidth = 1; c.beginPath(); for (let x = -4; x <= W + 4; x += 2) { const y = 392 + Math.abs(Math.sin(x / 60 * Math.PI)) * -0 + 6 * Math.sin((x % 60) / 60 * Math.PI); x < -2 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
    for (let i = 0; i < 24; i++) { const x = 6 + i * 15, y = 392 + 6 * Math.sin(((x + 4) % 60) / 60 * Math.PI) + 3; lamp(c, x, y, lcols[i % 5], t, i); }
    for (const tx of [30, 150, 260, 344]) { const f = Math.sin(t * 12 + tx); c.fillStyle = '#ffb040'; c.beginPath(); c.moveTo(tx - 4, 382); c.quadraticCurveTo(tx, 368 + f * 2, tx + 4, 382); c.fill(); lamp(c, tx, 376, '#ffa040', t, tx); }
    for (let i = 0; i < 14; i++) { const q = ((t * 0.18 + i / 14) % 1), x = 20 + (i * 47) % 330 + Math.sin(q * 8 + i) * 8, y = 400 - q * 220; c.globalAlpha = Math.sin(q * Math.PI); lamp(c, x, y, lcols[i % 5], t, i); } c.globalAlpha = 1;
    for (const [x, y] of [[200, 268], [130, 300], [270, 296]]) { c.fillStyle = P.CLOTH.red; c.beginPath(); c.moveTo(x, y); for (let k = 0; k <= 6; k++) c.lineTo(x + k * 4, y + 2 + Math.sin(t * 6 + k + x) * 2); c.lineTo(x + 24, y + 10); for (let k = 6; k >= 0; k--) c.lineTo(x + k * 4, y + 10 + Math.sin(t * 6 + k + x) * 2); c.fill(); c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x, y + 18); c.stroke(); }
    // the forgiven city dances, people and animals together
    const party = won ? 1.6 : 1;
    for (const [kind, x, y, sc] of BEASTS) { const hop = Math.abs(Math.sin(t * 6 * party + x)) * 5, f = Math.sin(t * 1.5 + x) > 0 ? 1 : -1; if (kind === 'cow') cow(c, x, y - hop, sc, f); else P[kind](c, x, y - hop, sc, { t, facing: f, hop: true, phase: x }); }
    for (const [x, y, o] of DANCERS) { const sw = Math.sin(t * 5 * party + x) * 0.12; c.save(); c.translate(x, y); c.rotate(sw); P.person(c, 0, 0, 0.55, { ...o, expr: 'laugh', arms: Math.sin(t * 3 + x) > 0 ? 'cheer' : 'wave', t: t * party, phase: x, bounce: 4 }); c.restore(); }
    for (let i = 0; i < 6; i++) { const q = (t * 0.5 + i / 6) % 1, x = 30 + i * 56 + Math.sin(q * 7) * 8; c.save(); c.globalAlpha = Math.sin(q * Math.PI) * 0.9; c.fillStyle = '#fff6dc'; c.strokeStyle = '#fff6dc'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, 430 - q * 60, 3, 2.3, -0.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(x + 2.6, 429 - q * 60); c.lineTo(x + 2.6, 419 - q * 60); c.stroke(); c.restore(); }
    // shade pooling on the ground under the vine
    c.fillStyle = `rgba(40,30,70,${0.32 * shade})`; c.beginPath(); c.ellipse(JX + 20, JY - 2, 44 + 56 * shade, 16 + 6 * shade, 0, 0, 7); c.fill();
    // a hot sunbeam on Jonah until the leaves block it
    if (shade < 1) { c.save(); c.globalCompositeOperation = 'screen'; const bg = c.createLinearGradient(74, 150, JX, JY); bg.addColorStop(0, `rgba(255,220,130,${0.0})`); bg.addColorStop(1, `rgba(255,210,120,${0.35 * (1 - shade)})`); c.fillStyle = bg; c.beginPath(); c.moveTo(60, 150); c.lineTo(90, 150); c.lineTo(JX + 60, JY); c.lineTo(JX - 40, JY); c.closePath(); c.fill(); c.restore(); }
    // Jonah, arms folded
    const hot = 1 - shade;
    sitJonah(c, JX, JY, 1.55, { ...JON, expr: won ? 'happy' : 'grumpy', arms: 'hold', fold: true, t, facing: 1, bounce: 0.3 });
    if (hot > 0.05) { c.fillStyle = `rgba(255,80,80,${0.35 * hot})`; c.beginPath(); c.ellipse(JX - 9, JY - 50, 7, 4, 0, 0, 7); c.ellipse(JX + 15, JY - 50, 7, 4, 0, 0, 7); c.fill();
      for (let i = 0; i < 3; i++) { const q = ((t * 1.3 + i / 3) % 1); c.fillStyle = `rgba(150,215,255,${0.9 * (1 - q) * hot})`; c.beginPath(); c.ellipse(JX - 30 + i * 32, JY - 100 + q * 30 + (i === 1 ? -14 : 0), 2.4, 3.8, 0, 0, 7); c.fill(); }
      c.strokeStyle = `rgba(255,240,220,${0.6 * hot})`; c.lineWidth = 1.8; for (let i = 0; i < 3; i++) { c.beginPath(); for (let k = 0; k <= 8; k++) { const yy = JY - 122 - k * 3, xx = JX - 10 + i * 13 + Math.sin(k * 1.2 + t * 8 + i) * 2.5; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); } }
    if (!won && Math.sin(t * 2.2) > 0.6) { c.fillStyle = 'rgba(255,255,255,0.75)'; const q = (Math.sin(t * 2.2) - 0.6) / 0.4; c.beginPath(); c.arc(JX + 34 + q * 8, JY - 66 - q * 4, 3 + q * 3, 0, 7); c.fill(); } // hmph puffs
    if (won) { const a = t - s.doneT; c.fillStyle = 'rgba(255,120,140,0.45)'; c.beginPath(); c.ellipse(JX - 9, JY - 50, 7, 4, 0, 0, 7); c.ellipse(JX + 15, JY - 50, 7, 4, 0, 0, 7); c.fill(); c.globalAlpha = Math.max(0, 1 - a); c.fillStyle = '#ff7a9a'; drawStar(c, JX + 36, JY - 110 - a * 30, 7, a * 3); c.globalAlpha = 1; }
    // the vine: a sprout that the player grows up and over Jonah
    const n = 60, len = Math.max(0.04, s.pd);
    c.lineCap = 'round'; for (const [w, col] of [[9, '#3f6a2a'], [6, '#6aa040']]) { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let i = 0; i <= n; i++) { const u = (i / n) * len, [x, y] = vpt(u), sw = Math.sin(t * 2 + u * 4) * 2 * u; i ? c.lineTo(x + sw, y) : c.moveTo(x, y); } c.stroke(); }
    c.strokeStyle = '#7ab048'; c.lineWidth = 1.6; for (let i = 0; i < 8; i++) { const u = 0.1 + i * 0.12; if (u > len) break; const [x, y] = vpt(u); c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 8, y - 10, x + 14, y + 4, x + 6, y + 6); c.stroke(); }
    const leaves = 18; for (let i = 0; i < leaves; i++) { const u = 0.06 + i / leaves * 0.94; const g0 = Math.max(0, Math.min(1, (len - u) * 8)); if (g0 <= 0) continue; const [x, y] = vpt(u), [x2, y2] = vpt(Math.min(1, u + 0.01)); const ang = Math.atan2(y2 - y, x2 - x) + (i % 2 ? 1.25 : -1.25) + (u > 0.55 ? (i % 2 ? 0.3 : -0.6) : 0); const r = (10 + u * 18 + (u > 0.6 ? 8 : 0)) * g0 * (1 + 0.15 * Math.max(0, 1 - (t - s.lastTap) * 4)); leaf(c, x + Math.sin(t * 2 + u * 4) * 2 * u, y, r, ang, t, i); }
    if (len > 0.75) { for (const u of [0.8, 0.92]) { if (u > len) continue; const [x, y] = vpt(u); flowerG(c, x, y + 10, 6 * Math.min(1, (len - u) * 10), t); } }
    // the tip glows to show where to tap
    if (!s.done) { const [tx, ty] = vpt(Math.max(0.03, len)), p = 0.5 + 0.5 * Math.sin(t * 7); const gl = c.createRadialGradient(tx, ty, 1, tx, ty, 34); gl.addColorStop(0, `rgba(230,255,170,${0.55 + 0.3 * p})`); gl.addColorStop(1, 'rgba(230,255,170,0)'); c.fillStyle = gl; c.beginPath(); c.arc(tx, ty, 34, 0, 7); c.fill(); c.strokeStyle = `rgba(255,255,230,${0.6 + 0.3 * p})`; c.lineWidth = 2.5; c.beginPath(); c.arc(PB[0], PB[1] - 26, 26 + p * 4, 0, 7); c.stroke(); }
    // the kind breeze and drops of rain that make it grow
    for (const d of s.drops) { const a = (t - d.t) / 0.6; c.strokeStyle = `rgba(200,240,255,${1 - a})`; c.lineWidth = 2; c.beginPath(); c.arc(d.x - 20 + a * 30, d.y - 30 + a * 10, 12 + a * 10, Math.PI * 1.1, Math.PI * 1.8); c.stroke(); c.fillStyle = `rgba(170,225,255,${1 - a})`; c.beginPath(); c.ellipse(d.x, d.y - 40 + a * 40, 2.4, 3.6, 0, 0, 7); c.fill(); }
    for (const m of s.misses) { const a = (t - m.t) / 0.5; c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - a)})`; c.lineWidth = 2; c.beginPath(); c.arc(m.x, m.y, 6 + a * 14, 0, 7); c.stroke(); }
    if (won) { const a = t - s.doneT; for (let i = 0; i < 8; i++) { const q = (a * 0.8 + i / 8) % 1; c.fillStyle = `rgba(255,246,190,${(1 - q) * 0.9})`; drawStar(c, 60 + i * 30, 400 - q * 80, 3 + (i % 3), q * 4); } }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
