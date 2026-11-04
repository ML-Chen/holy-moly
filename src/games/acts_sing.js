// SING! — Acts 16:25–34. At midnight in the jail at Philippi, Paul and Silas pray and sing hymns while the other prisoners listen.
// Tap the music notes as they float up to fill the song; when it is full, the ground rumbles, the chains fall away and the doors
// swing open with light. Nobody is hurt, and the jailer becomes their friend.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const PAUL = { skin: SK[1], robe: CL.indigo, stripe: CL.cream, beard: true, hair: HR[2], hairStyle: 'bald' };
const SILAS = { skin: SK[3], robe: CL.rust, stripe: CL.sand, beard: true, hair: HR[0], hairStyle: 'curly' };
const LISTEN = [
  { skin: SK[4], robe: CL.olive, stripe: CL.cream, hair: HR[3] },
  { skin: SK[0], robe: CL.plum, stripe: CL.gold, hair: HR[4], beard: true },
];
const FY = 468, DOOR = { x: 180, y: 386, w: 96, h: 164 };
const NOTE_COLS = ['#ffd45a', '#8fd8ff', '#ff9ac0', '#a8e08a', '#c8a8ff'];

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function noteShape(c, x, y, s, col, kind) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = col; c.strokeStyle = P.shade(col, -0.45); c.lineWidth = 1.6;
  if (kind) { // two beamed eighth notes
    c.beginPath(); c.ellipse(-8, 6, 6, 4.6, -0.4, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(8, 3, 6, 4.6, -0.4, 0, 7); c.fill(); c.stroke();
    c.fillRect(-3.6, -16, 3, 22); c.fillRect(12.4, -19, 3, 22); c.beginPath(); c.moveTo(-3.6, -16); c.lineTo(15.4, -19); c.lineTo(15.4, -13); c.lineTo(-3.6, -10); c.closePath(); c.fill(); c.stroke();
  } else {
    c.beginPath(); c.ellipse(0, 6, 7, 5.4, -0.4, 0, 7); c.fill(); c.stroke(); c.fillRect(4.6, -18, 3, 24); c.beginPath(); c.moveTo(7.6, -18); c.quadraticCurveTo(16, -12, 14, -2); c.quadraticCurveTo(13, -9, 7.6, -10); c.closePath(); c.fill(); c.stroke();
  }
  c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(kind ? -10 : -2, kind ? 4 : 4, 2.4, 1.4, -0.4, 0, 7); c.fill();
  c.restore();
}
function chain(c, x0, y0, x1, y1, k) { // a sagging chain from wall ring to wrist
  const n = Math.max(5, Math.round(Math.hypot(x1 - x0, y1 - y0) / 7)); c.lineWidth = 2.6;
  for (let i = 0; i < n; i++) { const tt = (i + 0.5) / n, x = x0 + (x1 - x0) * tt, y = y0 + (y1 - y0) * tt + Math.sin(tt * Math.PI) * 12 * k; c.strokeStyle = '#2a2232'; c.beginPath(); c.ellipse(x, y + 0.8, 4, 2.6, i % 2 ? 0 : 1.2, 0, 7); c.stroke(); c.strokeStyle = '#b8b8cc'; c.beginPath(); c.ellipse(x, y, 4, 2.6, i % 2 ? 0 : 1.2, 0, 7); c.stroke(); }
}
function sitting(c, x, y, s, o) { // sitting on the straw: legs tucked under a rounded lap
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 118 * s); c.clip(); P.person(c, x, y + 10 * s, s, o); c.restore();
  const g = c.createLinearGradient(x, y - 14 * s, x, y + 2 * s); g.addColorStop(0, P.shade(o.robe, 0.12)); g.addColorStop(1, P.shade(o.robe, -0.2)); c.fillStyle = g; c.strokeStyle = P.shade(o.robe, -0.45); c.lineWidth = 1.6;
  c.beginPath(); c.ellipse(x, y - 6 * s, 20 * s, 8 * s, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 14 * s, y + 0.5 * s, 5 * s, 2.6 * s, 0, 0, 7); c.ellipse(x + 14 * s, y + 0.5 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill();
}
function paintCell(o) {
  // warm stone walls lit by a single lamp
  const wg = o.createLinearGradient(0, 0, 0, FY); wg.addColorStop(0, '#1e1630'); wg.addColorStop(0.5, '#3e2c48'); wg.addColorStop(1, '#6a4a50'); o.fillStyle = wg; o.fillRect(0, 0, W, FY);
  const r = P.rng(141);
  for (let row = 0; row < 18; row++) for (let i = -1; i < 7; i++) { const x = i * 60 + (row % 2) * 30 + r() * 4, y = 30 + row * 28; const bg = o.createLinearGradient(x, y, x, y + 26); const base = P.mix('#5a4258', '#8a6a6a', Math.min(1, y / FY)); bg.addColorStop(0, P.shade(base, 0.12)); bg.addColorStop(1, P.shade(base, -0.12)); o.fillStyle = bg; roundRect(o, x + 2, y + 2, 56, 24, 6); o.fill(); }
  // the high barred window with stars and the moon
  const wx = 248, wy = 100, ww = 72, wh = 64;
  o.fillStyle = '#2a1e30'; roundRect(o, wx - 8, wy - 8, ww + 16, wh + 16, 10); o.fill();
  o.save(); roundRect(o, wx, wy, ww, wh, 6); o.clip(); P.sky(o, W, wy + wh, ['#0a0e2a', '#1a2050', '#2e2a68']); P.stars(o, W, wy + wh, 30, 143, 0);
  glow(o, wx + 50, wy + 22, 30, '#e8ecff', 0.5); o.fillStyle = '#f4f2ff'; o.beginPath(); o.arc(wx + 50, wy + 22, 10, 0, 7); o.fill(); o.restore();
  o.fillStyle = '#4a4058'; for (let i = 1; i < 4; i++) o.fillRect(wx + i * ww / 4 - 2.5, wy, 5, wh);
  // moonbeam falling across the cell
  o.save(); o.globalCompositeOperation = 'screen'; const mb = o.createLinearGradient(wx, wy, wx - 120, FY); mb.addColorStop(0, 'rgba(150,170,255,0.22)'); mb.addColorStop(1, 'rgba(150,170,255,0)'); o.fillStyle = mb; o.beginPath(); o.moveTo(wx, wy + wh); o.lineTo(wx + ww, wy + wh); o.lineTo(wx - 20, FY + 60); o.lineTo(wx - 150, FY + 60); o.closePath(); o.fill(); o.restore();
  // floor with straw
  const fg = o.createLinearGradient(0, FY, 0, H); fg.addColorStop(0, '#7a5a48'); fg.addColorStop(1, '#3a2830'); o.fillStyle = fg; o.fillRect(0, FY, W, H - FY);
  o.fillStyle = '#2a1c26'; o.fillRect(0, FY - 2, W, 4);
  o.strokeStyle = '#e8c070'; o.lineWidth = 1.4; o.lineCap = 'round';
  for (let i = 0; i < 140; i++) { const x = r() * W, y = FY + 8 + r() * 100, a = r() * 3, l = 6 + r() * 10; o.strokeStyle = P.rgba(r() < 0.5 ? '#e8c070' : '#c89848', 0.5 + r() * 0.4); o.beginPath(); o.moveTo(x, y); o.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.4); o.stroke(); }
  // wall rings for the chains
}

MG.add({
  id: 'sing', stage: 'acts', cmd: 'SING!', hint: 'tap', time: 6, mood: 'night', winText: 'Free!',
  card: { title: 'Songs at midnight', ref: 'Acts 16:25–34', kind: 'Acts story', text: 'The book of Acts tells how Paul and Silas were locked in a jail in Philippi. At midnight they prayed and sang hymns, and an earthquake shook the doors open. Nobody ran away, and the jailer took them home and shared a meal with his family.', note: 'Some Christians think God sent the earthquake as a miracle, and others read the story more as a picture of God\'s care. Either way, a jailer and his prisoners end up sharing a meal as friends.', ask: 'When you feel scared or sad, what song or prayer could help you?' },
  init(g) {
    const s = g.s; s.meter = 0; s.need = [5, 7, 9][g.level]; s.notes = []; s.next = 0.15; s.freeT = -9; s.pops = []; s.sung = -9; s.k = 0;
    s.rate = [0.48, 0.38, 0.32][g.level] / g.speed; s.rise = [62, 82, 100][g.level] * g.speed;
  },
  down(g, x, y) {
    const s = g.s; if (s.freeT > 0) return; let best = null, bd = 44;
    for (const n of s.notes) { if (n.hit) continue; const d = Math.hypot(x - n.x, y - n.y); if (d < bd) { bd = d; best = n; } }
    if (!best) { g.sfx('tap'); return; }
    best.hit = true; s.meter++; s.sung = g.t; s.pops.push({ x: best.x, y: best.y, t: g.t, col: best.col });
    g.sfx(['harp', 'chime', 'bell'][s.meter % 3]); g.burst(best.x, best.y, [best.col, '#ffffff', '#fff6c0'], 10, 120);
    if (s.meter >= s.need) { s.freeT = g.t; g.sfx('rumble'); g.sfx('trumpet'); g.shake(7, 0.5); g.win(); g.burst(DOOR.x, DOOR.y, ['#fff6c0', '#ffd45a', '#ffffff'], 30, 260); }
  },
  update(g, dt) {
    const s = g.s;
    if (s.freeT < 0 && g.t >= s.next) { s.next = g.t + s.rate; const from = s.k++ % 2; s.notes.push({ x: (from ? 250 : 110) + (Math.random() - 0.5) * 60, y: FY - 10, vx: (Math.random() - 0.5) * 30, t: g.t, col: NOTE_COLS[Math.floor(Math.random() * NOTE_COLS.length)], kind: Math.random() < 0.35 ? 1 : 0, ph: Math.random() * 6, hit: false }); }
    for (const n of s.notes) { n.y -= s.rise * dt; n.x += (n.vx + Math.sin(g.t * 3 + n.ph) * 26) * dt; }
    s.notes = s.notes.filter(n => !n.hit && n.y > 40); s.pops = s.pops.filter(p => g.t - p.t < 0.5);
  },
  auto(g, dt, synth) { const s = g.s, k = Math.floor(g.t / 0.2); if (g.t < 0.4 || k === s.botK) return; s.botK = k; const n = s.notes.filter(q => !q.hit && q.y < FY - 60).sort((a, b) => a.y - b.y)[0]; if (n) { synth('down', n.x, n.y); synth('up', n.x, n.y); } },
  draw(g, c) {
    const s = g.s, t = g.t, free = s.freeT > 0, ft = t - s.freeT, fill = s.meter / s.need;
    c.drawImage(g.bake('acts_sing_bg', paintCell), 0, 0, W, H);
    // the lamp's warm glow grows with the song
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, 180, FY - 60, 180 + fill * 120, '#ffb460', 0.18 + fill * 0.25); c.restore();
    // the door: closed and barred, then swinging open with light
    const d = DOOR, open = free ? Math.min(1, ft * 2.2) : 0;
    c.fillStyle = '#20182a'; roundRect(c, d.x - d.w / 2 - 10, d.y - d.h / 2 - 10, d.w + 20, d.h + 14, 12); c.fill();
    c.save(); roundRect(c, d.x - d.w / 2, d.y - d.h / 2, d.w, d.h, 8); c.clip();
    const lg = c.createLinearGradient(0, d.y - d.h / 2, 0, d.y + d.h / 2); lg.addColorStop(0, '#fff6d0'); lg.addColorStop(1, '#ffc870'); c.fillStyle = free ? lg : '#140e1e'; c.fillRect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h);
    if (free) { // the jailer at the door with a lamp, glad and safe
      for (const side of [-1, 1]) { const w = d.w / 2 * (1 - open * 0.8), x0 = side < 0 ? d.x - d.w / 2 : d.x + d.w / 2 - w; drawDoorHalf(c, x0, d.y - d.h / 2, w, d.h); }
    } else { drawDoorHalf(c, d.x - d.w / 2, d.y - d.h / 2, d.w / 2, d.h); drawDoorHalf(c, d.x, d.y - d.h / 2, d.w / 2, d.h); c.fillStyle = '#7a6a7a'; c.fillRect(d.x - d.w / 2 - 4, d.y - 6, d.w + 8, 10); c.fillStyle = '#a89aa8'; c.fillRect(d.x - d.w / 2 - 4, d.y - 6, d.w + 8, 2); }
    c.restore();
    if (free) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, d.x, d.y, 200 * open, '#fff0b0', 0.55); c.restore(); P.rays(c, d.x, d.y - 20, W, H, '#fff2c0', 0.25 * open, 11, t);
      // the jailer at the door with a lamp, safe and amazed
      c.save(); roundRect(c, d.x - d.w / 2, d.y - d.h / 2, d.w, d.h, 8); c.clip(); P.person(c, d.x + 4, d.y + d.h / 2 + 2, 1.15, { skin: SK[1], robe: CL.olive, stripe: CL.rust, hair: HR[4], head: 'wrap', headCol: CL.rust, expr: ft > 0.4 ? 'laugh' : 'wow', arms: 'out', t, bounce: 0.6 }); c.restore(); }
    // a hanging oil lamp, swaying gently
    lampH(c, 180 + Math.sin(t * 1.2) * 4 + (free && ft < 0.8 ? Math.sin(t * 40) * 6 : 0), 196, t);
    // the song meter: a glowing string of notes along the top of the wall, filling bead by bead
    const n = s.need, mx0 = 180 - (n - 1) * 15;
    for (let i = 0; i < n; i++) { const x = mx0 + i * 30, y = 64 + Math.sin(t * 3 + i * 0.6) * 3, on = i < s.meter; c.save(); if (on) { c.globalCompositeOperation = 'screen'; glow(c, x, y, 22, '#ffe08a', 0.7); c.globalCompositeOperation = 'source-over'; } c.fillStyle = on ? '#ffe08a' : 'rgba(255,255,255,0.18)'; c.strokeStyle = on ? '#fff6d0' : 'rgba(255,255,255,0.35)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.stroke(); c.restore(); if (on) noteShape(c, x - 1, y + 1, 0.5, '#fff6d0', 0); }
    // chains: fastened, then snapping open and falling
    const people = [[30, FY + 18, LISTEN[0], 1.0, 1], [330, FY + 18, LISTEN[1], 1.0, -1], [92, FY + 92, PAUL, 1.6, 1], [268, FY + 92, SILAS, 1.6, -1]];
    for (const [x, y, o, sc, f] of people) {
      const singing = t - s.sung < 0.35 || free, main = sc > 1.2;
      const rx = x - f * 42, ry = FY - 64, ax = x - f * 14 * sc, ay = y - 2;
      if (main) { c.strokeStyle = '#2a2232'; c.lineWidth = 4; c.beginPath(); c.arc(rx, ry, 6, 0, 7); c.stroke(); c.strokeStyle = '#a8a8bc'; c.lineWidth = 2.4; c.beginPath(); c.arc(rx, ry, 6, 0, 7); c.stroke(); c.fillStyle = '#4a4058'; c.fillRect(rx - 4, ry - 12, 8, 7);
      if (!free) { chain(c, rx, ry + 6, ax, ay, 1); c.strokeStyle = '#8a8aa0'; c.lineWidth = 3; c.beginPath(); c.ellipse(ax, ay, 5 * sc, 2.4 * sc, 0, 0, 7); c.stroke(); }
      else if (ft < 0.7) { c.save(); c.globalAlpha = 1 - ft / 0.7; chain(c, rx, ry + 6 + ft * 30, rx + (ax - rx) * 0.6, ay + 10, 0.4); c.restore(); }
      else chain(c, rx, ry + 6, rx + f * 4, ry + 46, 0.1); }
      sitting(c, x, y, sc, { ...o, facing: f, t, phase: x, bounce: free ? 2.5 : main ? 1.2 : 0.5, expr: free ? 'laugh' : main ? (singing ? 'laugh' : 'happy') : (s.meter > 0 ? 'happy' : 'sad'), arms: free ? 'cheer' : main ? (singing ? 'up' : 'pray') : 'hold' });
      if (main && !free) { // singing mouth glow: tiny notes drifting from their lips
        const mxp = x + f * 4, myp = y - 62 * sc; for (let i = 0; i < 2; i++) { const q = ((t * 0.8 + i * 0.5) % 1); c.save(); c.globalAlpha = (1 - q) * 0.6; noteShape(c, mxp + f * (10 + q * 16), myp - q * 20, 0.35, '#fff2c0', 0); c.restore(); }
      }
    }
    // floating notes to tap
    for (const nt of s.notes) { const pu = 0.5 + 0.5 * Math.sin(t * 6 + nt.ph); c.save(); c.globalCompositeOperation = 'screen'; glow(c, nt.x, nt.y, 30 + pu * 6, nt.col, 0.5); c.restore(); noteShape(c, nt.x, nt.y, 1.45 + pu * 0.1, nt.col, nt.kind); }
    for (const p of s.pops) { const q = (t - p.t) / 0.5; c.strokeStyle = P.rgba(p.col, 1 - q); c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, 10 + q * 30, 0, 7); c.stroke(); }
    // dust shaken from the ceiling during the earthquake (gentle, no falling stones)
    if (free && ft < 0.8) { const r = P.rng(Math.floor(t * 20)); c.fillStyle = 'rgba(220,200,180,0.6)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(r() * W, ft * 400 * r(), 1.5 + r() * 2, 0, 7); c.fill(); } }
    P.vignette(c, W, H, 0.4, '#140a20'); P.grain(c, W, H, 0.06);
  },
});
function drawDoorHalf(c, x, y, w, h) {
  const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#6a4a3a'); g.addColorStop(1, '#4a3028'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.strokeStyle = 'rgba(30,16,16,0.5)'; c.lineWidth = 1.5; for (let i = 1; i < 3; i++) { c.beginPath(); c.moveTo(x + w * i / 3, y); c.lineTo(x + w * i / 3, y + h); c.stroke(); }
  c.fillStyle = '#8a7a8a'; for (const yy of [y + 22, y + h - 26]) { c.fillRect(x, yy, w, 6); for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + 6 + i * (w - 12) / 2, yy + 3, 2, 0, 7); c.fill(); } }
  c.fillStyle = 'rgba(255,220,170,0.08)'; c.fillRect(x, y, Math.max(2, w * 0.2), h);
}
function lampH(c, x, y, t) {
  c.strokeStyle = '#3a2a30'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(180, 0); c.lineTo(x, y - 14); c.stroke();
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, x, y, 150 + Math.sin(t * 11) * 6, '#ffb050', 0.35); glow(c, x, y - 8, 30, '#fff0b0', 0.7); c.restore();
  const g = c.createLinearGradient(x - 16, 0, x + 16, 0); g.addColorStop(0, '#d8904a'); g.addColorStop(1, '#7a4422'); c.fillStyle = g; c.strokeStyle = '#3a1e14'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(x - 16, y - 6); c.quadraticCurveTo(x - 14, y + 8, x, y + 8); c.quadraticCurveTo(x + 14, y + 8, x + 20, y - 8); c.lineTo(x + 12, y - 8); c.quadraticCurveTo(x, y - 12, x - 16, y - 6); c.closePath(); c.fill(); c.stroke();
  const f = 1 + Math.sin(t * 15) * 0.1; c.save(); c.translate(x + 15, y - 9); c.scale(1, f); const fg = c.createRadialGradient(0, -4, 0, 0, -5, 10); fg.addColorStop(0, '#fffbe0'); fg.addColorStop(0.5, '#ffd36a'); fg.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = fg; c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(-5, -3, Math.sin(t * 9) * 1.5, -14); c.quadraticCurveTo(5, -3, 0, 2); c.fill(); c.restore();
}
