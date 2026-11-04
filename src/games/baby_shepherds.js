// HURRY! — Luke 2:8–20. Angels sing to shepherds out in the fields at night. Mash to run the shepherds and their sheep
// down the starry hillside to the glowing stable in Bethlehem before the angels' song fades away.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const ANGELS = [
  { x: 92, y: 178, o: { skin: SK[1], robe: '#fbf7ee', hairStyle: 'curly', hair: '#e8c070' } },
  { x: 180, y: 140, o: { skin: SK[4], robe: '#fbf7ee', hairStyle: 'long', hair: HR[3] } },
  { x: 268, y: 178, o: { skin: SK[2], robe: '#fbf7ee', hairStyle: 'short', hair: HR[2] } },
];
const SHEP = [
  { skin: SK[3], robe: CL.brown, stripe: CL.sand, beard: true, hair: HR[0], head: 'wrap', headCol: CL.cream },
  { skin: SK[2], robe: CL.olive, stripe: CL.cream, hairStyle: 'curly', hair: HR[1], child: true },
  { skin: SK[1], robe: CL.rust, stripe: CL.sand, hairStyle: 'long', hair: HR[2] },
];
// the trail from the shepherds' fire down to the stable door: a cubic curve
const B = [[56, 372], [340, 380], [0, 490], [236, 590]];
const STABLE = { x: 296, y: 590 };
function bez(p) { const q = 1 - p; return [0, 1].map(k => q * q * q * B[0][k] + 3 * q * q * p * B[1][k] + 3 * q * p * p * B[2][k] + p * p * p * B[3][k]); }
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);

function crook(c, hx, hy) { c.strokeStyle = '#8a5a32'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx + 4, hy + 30); c.lineTo(hx + 4, hy - 30); c.arc(hx + 10, hy - 30, 6, Math.PI, 0); c.lineTo(hx + 16, hy - 26); c.stroke(); }
function angel(c, x, y, s, o, t, ph, a) {
  c.save(); c.globalAlpha = a; const fl = Math.sin(t * 5 + ph);
  c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x, y - 40 * s, 4, x, y - 40 * s, 70 * s); gl.addColorStop(0, 'rgba(255,246,210,0.6)'); gl.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y - 40 * s, 70 * s, 0, 7); c.fill(); c.restore();
  // wings, feathered, flapping slowly
  for (const sd of [-1, 1]) { c.save(); c.translate(x + sd * 8 * s, y - 34 * s); c.rotate(sd * (0.35 + fl * 0.15)); c.scale(sd * s, s);
    const wg = c.createLinearGradient(0, -30, 30, 10); wg.addColorStop(0, '#ffffff'); wg.addColorStop(1, '#d8e0f4'); c.fillStyle = wg; c.strokeStyle = 'rgba(150,160,200,0.7)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(14, -42, 40, -34); c.quadraticCurveTo(34, -22, 38, -14); c.quadraticCurveTo(28, -8, 32, 2); c.quadraticCurveTo(18, 6, 0, 10); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(170,180,220,0.6)'; c.beginPath(); c.moveTo(10, -8); c.quadraticCurveTo(22, -20, 34, -26); c.moveTo(8, 2); c.quadraticCurveTo(20, -4, 30, -6); c.stroke(); c.restore(); }
  P.person(c, x, y, s, { ...o, arms: 'up', expr: 'laugh', t, phase: ph, bounce: 2 });
  // halo
  const hy = y - (40 + 15 + 22) * s; c.strokeStyle = '#ffe48a'; c.lineWidth = 2.6; c.beginPath(); c.ellipse(x, hy, 12 * s, 3.6 * s, 0, 0, 7); c.stroke();
  c.restore();
}
function note(c, x, y, s, a) { c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = '#fff4c8'; c.strokeStyle = '#fff4c8'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 4.5, 3.4, -0.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(4, -1); c.lineTo(4, -15); c.quadraticCurveTo(9, -12, 11, -7); c.stroke(); c.restore(); }
function paintBg(o) {
  P.sky(o, W, H, ['#070a26', '#141a4a', '#2a2a6a', '#4a3a7a', '#6a4a7a']);
  P.stars(o, W, 420, 160, 13, 0);
  // the far hills and the little town of Bethlehem, windows lit
  P.hills(o, W, 336, 30, '#2a2a5a', '#1e1e46', { seed: 3, freq: 0.01, dabs: 20, bottom: 420 });
  const r = P.rng(8); for (let i = 0; i < 6; i++) P.house(o, 196 + i * 28 + r() * 6, 352 + r() * 8 - i * 2, 22 + r() * 8, 16 + r() * 10, '#5a4a6a', { window: true, door: '#2a1a2a' });
  // the shepherds' hillside: a broad slope falling from upper left down to the right
  P.hills(o, W, 312, 24, '#3a5a5a', '#2a4048', { seed: 17, freq: 0.012, dabs: 60, bottom: 640 });
  o.save(); o.beginPath(); o.moveTo(-10, 640); o.lineTo(-10, 360); o.quadraticCurveTo(120, 380, 200, 470); o.quadraticCurveTo(260, 540, 370, 560); o.lineTo(370, 640); o.closePath();
  const fg = o.createLinearGradient(0, 360, 0, 640); fg.addColorStop(0, '#4a6a5a'); fg.addColorStop(1, '#2a3a40'); o.fillStyle = fg; o.fill(); o.restore();
  // the trail: a pale dirt path that widens as it comes toward us
  o.save(); o.lineCap = 'round';
  for (const [col, wk] of [['rgba(30,30,50,0.35)', 1.25], ['#8a7a6a', 1], ['rgba(220,200,170,0.35)', 0.4]]) { for (let i = 0; i < 60; i++) { const p0 = i / 60, p1 = (i + 1) / 60, [x0, y0] = bez(p0), [x1, y1] = bez(p1); o.strokeStyle = col; o.lineWidth = (8 + p0 * 26) * wk; o.beginPath(); o.moveTo(x0, y0); o.lineTo(x1, y1); o.stroke(); } }
  o.restore();
  P.grassTufts(o, W, 380, 640, 50, '#5a7a5a', 6); P.rock(o, 30, 560, 0.7, '#7a7a8a'); P.rock(o, 150, 410, 0.4, '#7a7a8a');
  // night tint over the land
  o.save(); o.globalCompositeOperation = 'source-atop'; o.fillStyle = 'rgba(20,20,70,0.3)'; o.fillRect(0, 300, W, 340); o.restore();
  // the shepherds' little fire, where they started
  o.fillStyle = '#3a2418'; o.save(); o.translate(34, 376); o.rotate(0.3); o.fillRect(-10, -2, 20, 4); o.rotate(-0.6); o.fillRect(-10, -2, 20, 4); o.restore();
}
function paintStable(o) {
  const { x, y } = STABLE;
  o.fillStyle = 'rgba(10,10,30,0.4)'; o.beginPath(); o.ellipse(x, y + 2, 70, 9, 0, 0, 7); o.fill();
  // a shallow cave-mouth stable with a wooden roof
  const wg = o.createLinearGradient(x - 60, y - 90, x + 60, y); wg.addColorStop(0, '#8a7060'); wg.addColorStop(1, '#4a3a40'); o.fillStyle = wg;
  o.beginPath(); o.moveTo(x - 62, y); o.lineTo(x - 58, y - 70); o.quadraticCurveTo(x, y - 96, x + 62, y - 74); o.lineTo(x + 66, y); o.closePath(); o.fill();
  o.fillStyle = '#2a1a1e'; o.beginPath(); o.moveTo(x - 44, y); o.lineTo(x - 42, y - 54); o.quadraticCurveTo(x, y - 72, x + 46, y - 56); o.lineTo(x + 48, y); o.closePath(); o.fill();
  o.fillStyle = '#6a4a30'; o.beginPath(); o.moveTo(x - 72, y - 66); o.lineTo(x, y - 100); o.lineTo(x + 76, y - 70); o.lineTo(x + 72, y - 62); o.lineTo(x, y - 92); o.lineTo(x - 68, y - 58); o.closePath(); o.fill();
  o.strokeStyle = '#4a3020'; o.lineWidth = 4; for (const px of [x - 52, x + 54]) { o.beginPath(); o.moveTo(px, y); o.lineTo(px, y - 64); o.stroke(); }
}
function paintStableInside(o, lit) {
  const { x, y } = STABLE;
  o.save(); o.beginPath(); o.moveTo(x - 44, y); o.lineTo(x - 42, y - 54); o.quadraticCurveTo(x, y - 72, x + 46, y - 56); o.lineTo(x + 48, y); o.closePath(); o.clip();
  const lg = o.createRadialGradient(x, y - 18, 4, x, y - 24, 70); lg.addColorStop(0, '#fff2b0'); lg.addColorStop(0.5, '#f0a050'); lg.addColorStop(1, '#5a2a24'); o.fillStyle = lg; o.globalAlpha = lit; o.fillRect(x - 50, y - 80, 100, 80); o.globalAlpha = 1;
  // straw
  o.strokeStyle = '#f0c860'; o.lineWidth = 1.2; for (let i = 0; i < 18; i++) { const sx = x - 40 + i * 5; o.beginPath(); o.moveTo(sx, y - 1); o.lineTo(sx + (i % 2 ? 4 : -3), y - 6 - (i % 3) * 2); o.stroke(); }
  o.restore();
}

MG.add({
  id: 'shepherds', stage: 'baby', cmd: 'HURRY!', hint: 'mash', time: 5, mood: 'night', winText: 'Glory!',
  card: {
    title: 'Shepherds hear first', ref: 'Luke 2:8–20', kind: 'Gospel story',
    text: 'Luke\'s Gospel tells how shepherds were watching their sheep in the fields at night. Shepherds were poor workers, and many people looked down on them. An angel told them good news about a baby born in Bethlehem, and a choir of angels sang. The shepherds hurried to find Mary, Joseph and the baby lying in a manger.',
    note: 'Only Luke\'s Gospel tells about the shepherds and the angels. Some Christians read it just as told, and others as a story showing that God\'s good news came first to ordinary, overlooked people.',
    ask: 'The shepherds hurried to share good news. What good news could you share with someone today?',
  },
  init(g) {
    const s = g.s, need = [9, 13, 17][g.level];
    s.k = 3; s.kick = s.k / need; s.p = 0; s.v = 0; s.tapT = -9; s.taps = 0; s.arrT = -1; s.dust = []; s.rings = [];
  },
  down(g, x, y) {
    const s = g.s; if (s.arrT >= 0 || g.done) return;
    s.v += s.kick; s.tapT = g.t; s.taps++; s.rings.push({ x, y, t: g.t });
    g.sfx(s.taps % 4 === 0 ? 'baa' : s.taps % 2 ? 'stomp' : 'tap');
    const [px, py] = bez(s.p); s.dust.push({ x: px - 10, y: py, t: g.t }, { x: px + 8, y: py + 2, t: g.t });
  },
  update(g, dt) {
    const s = g.s;
    if (s.arrT < 0) { s.p = Math.min(1, s.p + s.v * dt); s.v *= Math.exp(-s.k * dt);
      if (s.p >= 1 && !g.done) { s.arrT = g.t; g.win(); g.sfx('harp'); g.sfx('cheer'); g.burst(STABLE.x, STABLE.y - 40, ['#fff6c0', '#ffd45a', '#ffffff', '#ffc8e0'], 26, 220); } }
    s.dust = s.dust.filter(d => g.t - d.t < 0.5); s.rings = s.rings.filter(r => g.t - r.t < 0.4);
  },
  auto(g, dt, synth) { // mash about nine times a second
    const s = g.s; if (g.t < 0.3 || s.arrT >= 0) return; const k = Math.floor(g.t / 0.11); if (k === s.botK) return; s.botK = k;
    synth('down', 180, 460); synth('up', 180, 460);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', lost = g.result === 'fail', arr = s.arrT >= 0 ? eo((t - s.arrT) / 0.5) : 0;
    const song = won ? 1 : Math.max(0.25, Math.min(1, g.left() / g.dur * 1.4));   // the angels' light fades as the song ends
    c.drawImage(g.bake('baby_shepherds_bg', paintBg), 0, 0, W, H);
    P.stars(c, W, 300, 30, 51, t);
    // the angel choir and its light
    P.rays(c, 180, 110, W, H * 0.6, '#fff2c4', 0.16 * song, 11, t);
    ANGELS.forEach((a, i) => angel(c, a.x, a.y + Math.sin(t * 2 + i) * 4, 0.82, a.o, t, i * 1.3, 0.35 + 0.65 * song));
    for (let i = 0; i < 6; i++) { const q = (t * 0.5 + i / 6) % 1; note(c, 60 + i * 48 + Math.sin(q * 5 + i) * 10, 220 - q * 160, 0.9, (1 - q) * 0.85 * song); }
    // the stable, glowing more as the shepherds get close
    c.drawImage(g.bake('baby_shepherds_stable', paintStable), 0, 0, W, H);
    const lit = 0.5 + 0.5 * s.p;
    paintStableInside(c, lit);
    const sx = STABLE.x, sy = STABLE.y;
    c.save(); c.globalCompositeOperation = 'lighter'; const sg = c.createRadialGradient(sx, sy - 30, 6, sx, sy - 30, 110); sg.addColorStop(0, `rgba(255,214,130,${0.35 + 0.3 * s.p + 0.1 * Math.sin(t * 4)})`); sg.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = sg; c.beginPath(); c.arc(sx, sy - 30, 110, 0, 7); c.fill(); c.restore();
    // the star of the birth just over the stable roof
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#fff6d0'; drawStar(c, sx, sy - 120, 7 + Math.sin(t * 3), t * 0.3); c.restore();
    // Mary, Joseph and the baby in the manger
    P.person(c, sx - 26, sy - 4, 0.56, { skin: SK[3], robe: CL.indigo, stripe: CL.sky, hair: HR[1], head: 'scarf', headCol: CL.sky, expr: 'happy', arms: 'pray', t, bounce: 0.4 });
    P.person(c, sx + 28, sy - 4, 0.58, { skin: SK[2], robe: CL.terracotta, stripe: CL.cream, beard: true, hair: HR[0], expr: 'happy', arms: won ? 'wave' : 'down', t, bounce: 0.4, facing: -1 });
    c.fillStyle = '#8a5a32'; c.beginPath(); c.moveTo(sx - 12, sy - 14); c.lineTo(sx + 12, sy - 14); c.lineTo(sx + 8, sy - 4); c.lineTo(sx - 8, sy - 4); c.closePath(); c.fill();
    c.strokeStyle = '#6a4024'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx - 9, sy - 4); c.lineTo(sx - 12, sy); c.moveTo(sx + 9, sy - 4); c.lineTo(sx + 12, sy); c.stroke();
    c.fillStyle = '#fbf3e0'; c.beginPath(); c.ellipse(sx, sy - 16, 9, 4, 0, 0, 7); c.fill(); c.fillStyle = SK[2]; c.beginPath(); c.arc(sx - 6, sy - 17, 3.4, 0, 7); c.fill();
    c.save(); c.globalCompositeOperation = 'lighter'; const bg = c.createRadialGradient(sx, sy - 16, 1, sx, sy - 16, 24); bg.addColorStop(0, 'rgba(255,240,180,0.6)'); bg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = bg; c.beginPath(); c.arc(sx, sy - 16, 24, 0, 7); c.fill(); c.restore();
    // dust puffs from running feet
    for (const d of s.dust) { const q = (t - d.t) / 0.5; c.fillStyle = `rgba(200,190,170,${0.5 * (1 - q)})`; c.beginPath(); c.arc(d.x - q * 10, d.y - q * 8, 3 + q * 7, 0, 7); c.fill(); }
    // the running party: shepherds and sheep spread along the trail behind the leader
    const run = Math.min(1, s.v * 8), members = [
      { k: 'p', o: SHEP[0], off: 0 }, { k: 's', off: 0.03, side: 18 }, { k: 'p', o: SHEP[1], off: 0.06, side: -14 },
      { k: 's', off: 0.09, side: -6 }, { k: 'p', o: SHEP[2], off: 0.12, side: 12 }, { k: 's', off: 0.15, side: 4 },
    ];
    const items = members.map((m, i) => {
      let p = Math.max(0, s.p - m.off * (1 - arr)), [x, y] = bez(p);
      if (arr > 0) { const tx = sx - 120 + i * 16, ty = sy + 10 + (i % 2) * 14; x += (tx - x) * arr; y += (ty - y) * arr; }
      const sc = 0.8 + 0.45 * p, dx = bez(Math.min(1, p + 0.01))[0] - x;
      return { m, i, x: x + (m.side || 0) * sc * (1 - arr), y, sc, f: arr > 0 ? 1 : dx >= 0 ? 1 : -1 };
    }).sort((a, b) => a.y - b.y);
    for (const it of items) {
      const hop = won ? Math.abs(Math.sin(t * 9 + it.i)) * 6 : Math.abs(Math.sin(t * 16 + it.i * 1.7)) * 6 * run;
      if (it.m.k === 's') P.sheep(c, it.x, it.y - hop, it.sc * 0.9, { t, phase: it.i, facing: it.f, hop: run > 0.3 || won });
      else P.person(c, it.x, it.y - hop, it.sc, { ...it.m.o, facing: it.f, t, phase: it.i, bounce: run > 0.3 ? 0.4 : 1.2,
        expr: won ? 'laugh' : lost ? 'surprised' : run > 0.3 ? 'wow' : 'happy', arms: won ? (it.i === 0 ? 'pray' : 'cheer') : run > 0.3 ? 'out' : 'hold', hold: (!won && run <= 0.3 && it.i === 0) ? crook : null });
    }
    if (lost) { // out of breath: little puffs over the leader's head
      const [x, y] = bez(s.p); for (let i = 0; i < 3; i++) { const q = ((t - g.doneAt) * 1.5 + i / 3) % 1; c.fillStyle = `rgba(255,255,255,${0.6 * (1 - q)})`; c.beginPath(); c.arc(x + 14 + q * 16, y - 70 * (0.8 + 0.45 * s.p) - q * 14, 3 + q * 5, 0, 7); c.fill(); } }
    // tap rings
    for (const r of s.rings) { const q = (t - r.t) / 0.4; c.strokeStyle = `rgba(255,246,210,${0.6 * (1 - q)})`; c.lineWidth = 2.5; c.beginPath(); c.arc(r.x, r.y, 8 + q * 22, 0, 7); c.stroke(); }
    if (won) { c.save(); c.globalCompositeOperation = 'lighter'; P.rays(c, sx, sy - 40, W, H, '#fff2c4', 0.25 * arr, 11, t); c.restore(); }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
