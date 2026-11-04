// OPEN! — Revelation 21:21–26. The gates of the new city are each one giant pearl, and they will never be shut again.
// Mash to help the crowd push the huge, heavy doors open; they creep back a little between pushes. Then everyone streams in.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const AX = 180, AY = 262, AR = 112, GB = 492;          // gate arch: centre x, spring line, radius, gate bottom
const GL = AX - AR, GR = AX + AR;                       // hinge lines of the two doors
const JEWELS = ['#4a7fd8', '#3fae7a', '#d84a5a', '#9a5ad8', '#f2c14a', '#3fc0c0', '#e8884a', '#7ad06a', '#e86aa8', '#5a6ad8', '#c8e04a', '#f08a6a'];
const archTop = x => AY - Math.sqrt(Math.max(0, AR * AR - (x - AX) * (x - AX)));
// tuning per level: kick per push, swing-back per second, fastest opening speed per second
const TUNE = [{ kick: 0.12, back: 0.06, rate: 0.55 }, { kick: 0.1, back: 0.1, rate: 0.6 }, { kick: 0.085, back: 0.14, rate: 0.7 }];

// the crowd outside: pushers at the doors (seen from behind) and cheering friends on both sides (seen from the front)
const PUSHERS = [
  { x: 116, y: 562, s: 1.22, o: { skin: SK[4], robe: '#3f8f8a', pants: '#3a3f5a', outfit: 'modern', hairStyle: 'short', hair: HR[3] } },
  { x: 180, y: 572, s: 1.18, o: { skin: SK[1], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[4], child: true } },
  { x: 244, y: 562, s: 1.22, o: { skin: SK[2], robe: CL.plum, stripe: CL.gold, hairStyle: 'long', hair: HR[0] } },
];
const FRIENDS = [
  { x: 30, y: 560, s: 0.95, f: 1, o: { outfit: 'modern', skin: SK[0], robe: '#f2e6cf', pants: '#8a5a8a', skirt: true, cardigan: '#c96a7a', hairStyle: 'bun', hair: HR[5], glasses: true } }, // a grandma
  { x: 66, y: 590, s: 1.0, f: 1, o: { skin: SK[5], robe: CL.teal, stripe: CL.cream, hairStyle: 'curly', hair: HR[3] } },
  { x: 22, y: 600, s: 0.9, f: 1, kid: true, o: { outfit: 'modern', skin: SK[3], robe: '#f2c23a', pants: '#3a7a5a', hairStyle: 'short', hair: HR[1], child: true, hoodie: true } },
  { x: 330, y: 556, s: 0.95, f: -1, o: { skin: SK[3], robe: CL.indigo, stripe: CL.saffron, beard: '#e8e2da', hair: HR[5], head: 'wrap', headCol: CL.cream } }, // a grandpa
  { x: 298, y: 588, s: 1.0, f: -1, o: { outfit: 'modern', skin: SK[5], robe: '#e07a5a', pants: '#4a6aa0', hairStyle: 'curly', hair: HR[0] } },
  { x: 338, y: 600, s: 0.88, f: -1, o: { skin: SK[2], robe: CL.rose, stripe: CL.white, hairStyle: 'long', hair: HR[2], child: true } },
];

MG.add({
  id: 'open', stage: 'new', cmd: 'OPEN!', hint: 'mash', time: 6, mood: 'party', winText: 'Welcome!',
  card: {
    title: 'Gates that never close', ref: 'Revelation 21:10–27', kind: 'Vision',
    text: 'The book of Revelation tells about a vision John had of a shining new city coming down from God. Each of its gates was made of one giant pearl, and the gates are never shut, so people from every nation can walk in.',
    note: 'Revelation is a vision full of pictures, written to give hope to people who were going through hard times.',
    ask: 'Who could you welcome in, at school or at home, who might feel shut out?',
  },
  init(g) {
    const s = g.s, tu = TUNE[g.level], sp = Math.sqrt(g.speed);
    s.kick = tu.kick; s.back = tu.back * sp; s.rate = tu.rate * sp;
    s.open = 0; s.pool = 0; s.pushT = -9; s.pushes = 0; s.wob = 0; s.openedAt = -1; s.mark = 0;
    s.motes = Array.from({ length: 26 }, (_, i) => ({ x: Math.random(), y: Math.random(), sp: 8 + Math.random() * 16, ph: Math.random() * 6, r: 1 + Math.random() * 1.6 }));
  },
  down(g, x, y) {
    const s = g.s; if (s.openedAt >= 0) return;
    s.pool = Math.min(0.3, s.pool + s.kick); s.pushT = g.t; s.pushes++; s.wob = 1;
    g.sfx(s.pushes % 2 ? 'thud' : 'drum'); g.shake(2 + s.open * 3, 0.12);
    g.burst(AX + (Math.random() - 0.5) * 10, 330 + (Math.random() - 0.5) * 120, ['#fff6c0', '#ffe27a', '#ffffff', '#ffc8e0'], 5 + Math.floor(s.open * 8), 120 + s.open * 120);
  },
  update(g, dt) {
    const s = g.s;
    if (s.openedAt < 0) {
      const d = Math.min(s.pool, s.rate * dt); s.pool -= d; s.open = Math.max(0, Math.min(1, s.open + d - s.back * dt * (s.open > 0 ? 1 : 0)));
      const m = Math.floor(s.open * 4); if (m > s.mark) { s.mark = m; if (m < 4) g.sfx('cheer'); }
      if (s.open >= 1 && !g.done) { s.openedAt = g.t; g.win(); g.sfx('horn'); g.sfx('cheer'); g.shake(6, 0.3); g.burst(AX, 330, ['#ffd45a', '#fff6c0', '#ff8ab0', '#8fd8ff', '#b8f0a0'], 40, 300); }
    } else s.open = 1;
    s.wob = Math.max(0, s.wob - dt * 4);
    for (const m of s.motes) { m.y -= m.sp * dt / 300; if (m.y < 0) m.y += 1; }
  },
  auto(g, dt, synth) { // mash about nine times a second
    const s = g.s; if (g.t < 0.3 || s.openedAt >= 0) return; const k = Math.floor(g.t / 0.11); if (k === s.botK) return; s.botK = k;
    synth('down', 180, 380); synth('up', 180, 380);
  },
  draw(g, c) {
    const s = g.s, t = g.t, op = s.open, opened = s.openedAt >= 0, push = Math.max(0, 1 - (t - s.pushT) / 0.22);
    c.drawImage(g.bake('new_open_bg', paintBg), 0, 0, W, H);
    // the city inside, glimpsed through the arch, and the light that floods out of it
    c.drawImage(g.bake('new_open_in', paintInside), 0, 0, W, H);
    // swinging pearl doors
    const ang = Math.min(1, op) * 1.42 + (opened ? 0.05 * Math.sin(Math.min(1, (t - s.openedAt) * 3) * Math.PI) : 0) - s.wob * 0.02;
    door(c, -1, Math.max(0, ang), t); door(c, 1, Math.max(0, ang), t);
    // the bright seam where the doors meet, pulsing until they open
    if (!opened) { const p = 0.5 + 0.5 * Math.sin(t * 6); const gap = 110 * (1 - Math.cos(ang)); const sg = c.createLinearGradient(AX - 16 - gap, 0, AX + 16 + gap, 0); sg.addColorStop(0, 'rgba(255,246,200,0)'); sg.addColorStop(0.5, `rgba(255,250,220,${0.5 + 0.3 * p + push * 0.2})`); sg.addColorStop(1, 'rgba(255,246,200,0)'); c.fillStyle = sg; c.fillRect(AX - 16 - gap, 152, 32 + gap * 2, GB - 152); }
    c.drawImage(g.bake('new_open_frame', paintFrame), 0, 0, W, H);
    // light pours out across the ground and up into the sky as the doors part
    const L = Math.min(1, op * 1.1 + push * 0.15);
    P.rays(c, AX, 320, W, H, '#fff2c0', 0.05 + 0.2 * L, 13, t);
    c.save(); c.globalCompositeOperation = 'screen'; const sp = 20 + 120 * L;
    const lg = c.createLinearGradient(0, GB, 0, H); lg.addColorStop(0, `rgba(255,240,180,${0.25 + 0.5 * L})`); lg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = lg;
    c.beginPath(); c.moveTo(AX - sp * 0.55, GB); c.lineTo(AX + sp * 0.55, GB); c.lineTo(AX + sp * 1.9, H); c.lineTo(AX - sp * 1.9, H); c.closePath(); c.fill(); c.restore();
    // drifting light motes
    c.save(); for (const m of s.motes) { const a = (0.3 + 0.7 * L) * (0.5 + 0.5 * Math.sin(t * 3 + m.ph)); c.globalAlpha = a; c.fillStyle = '#fff6d0'; c.beginPath(); c.arc(AX + (m.x - 0.5) * (60 + 260 * L) + Math.sin(t + m.ph) * 6, 160 + m.y * 440, m.r, 0, 7); c.fill(); } c.restore();
    // flags on the towers: the pride flag and a welcome banner
    P.prideFlag(c, 30, 128, 1.1, t);
    banner(c, 318, 128, t, ['#f6d23a', '#ffffff', '#5aa0e8']);
    // the crowd
    drawCrowd(c, s, t, op, opened, push, g);
    P.vignette(c, W, H, 0.24); P.grain(c, W, H, 0.06);
  },
});

// ---------- painting ----------
function paintBg(o) {
  P.sky(o, W, H, ['#8f74d6', '#f2a0c0', '#ffc9a0', '#fff1cc'], { x: AX, y: 236, r: 26, color: '#fff4d0', glow: 330 });
  P.stars(o, W, 90, 18, 21, 0);
  P.cloud(o, 70, 88, 0.75, '#fff6f0', '#e6a6c6', 0.85); P.cloud(o, 300, 62, 0.6, '#fff6f0', '#e6a6c6', 0.8);
  // the jasper wall, clear and glowing like crystal, with jewel foundations
  wallBlock(o, 0, 200, W, GB - 200);
  for (let i = 0; i < 24; i++) { o.fillStyle = '#fbeedd'; o.fillRect(i * 16 - 2, 186, 11, 16); o.fillStyle = '#f2c14a'; o.fillRect(i * 16 - 2, 184, 11, 3); }
  jewelBand(o, 0, GB - 30, W, 30);
  // two slender towers with golden domes
  for (const tx of [30, 330]) {
    const tg = o.createLinearGradient(tx - 30, 0, tx + 30, 0); tg.addColorStop(0, '#fff7ea'); tg.addColorStop(0.6, '#f4dcc4'); tg.addColorStop(1, '#dcb898'); o.fillStyle = tg; o.fillRect(tx - 30, 150, 60, GB - 150);
    o.strokeStyle = 'rgba(180,120,110,0.25)'; o.lineWidth = 1; for (let y = 166; y < GB - 30; y += 20) { o.beginPath(); o.moveTo(tx - 30, y); o.lineTo(tx + 30, y); o.stroke(); }
    const dg = o.createRadialGradient(tx - 8, 128, 2, tx, 140, 34); dg.addColorStop(0, '#fff6c0'); dg.addColorStop(0.5, '#f2c14a'); dg.addColorStop(1, '#b8801e'); o.fillStyle = dg;
    o.beginPath(); o.moveTo(tx - 32, 152); o.quadraticCurveTo(tx - 30, 112, tx, 104); o.quadraticCurveTo(tx + 30, 112, tx + 32, 152); o.closePath(); o.fill();
    o.fillStyle = '#b8801e'; o.fillRect(tx - 33, 150, 66, 5);
    // a glowing window and a ring of jewels
    o.fillStyle = '#ffe9a8'; o.beginPath(); o.arc(tx, 222, 10, Math.PI, 0); o.lineTo(tx + 10, 246); o.lineTo(tx - 10, 246); o.closePath(); o.fill();
    o.strokeStyle = '#d8a040'; o.lineWidth = 2; o.stroke();
    for (let i = 0; i < 5; i++) gem(o, tx - 20 + i * 10, 168, 3.2, JEWELS[(i + (tx > 100 ? 5 : 0)) % 12]);
    jewelBand(o, tx - 30, GB - 30, 60, 30);
  }
  // the meadow outside, with a golden path to the gate
  P.hills(o, W, GB + 6, 8, '#b6dc78', '#76aa4c', { seed: 41, dabs: 70, rim: '#f0ffc0', freq: 0.02 });
  const pg = o.createLinearGradient(0, GB, 0, H); pg.addColorStop(0, '#ffe6a0'); pg.addColorStop(1, '#f2c070'); o.fillStyle = pg;
  o.beginPath(); o.moveTo(AX - 80, GB); o.lineTo(AX + 80, GB); o.lineTo(AX + 150, H); o.lineTo(AX - 150, H); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(200,140,60,0.35)'; o.lineWidth = 1; for (let i = 1; i < 7; i++) { const y = GB + i * i * 3.4; const k = (y - GB) / (H - GB); o.beginPath(); o.moveTo(AX - 80 - 70 * k, y); o.lineTo(AX + 80 + 70 * k, y); o.stroke(); }
  P.flowers(o, W, GB + 10, H, 46, ['#f4d35e', '#ee6c8a', '#ffffff', '#b98ae0', '#7ad0f0'], 12);
  P.grassTufts(o, W, GB + 6, H, 30, '#70a848', 7);
}
function wallBlock(o, x, y, w, h) {
  const g = o.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#fff3e6'); g.addColorStop(1, '#f0d4bc'); o.fillStyle = g; o.fillRect(x, y, w, h);
  const r = P.rng(17), tints = ['#ffd8e4', '#d8f0ea', '#e4dcf8', '#fff0c8'];
  for (let row = 0, yy = y + 4; yy < y + h - 30; row++, yy += 22) for (let xx = x - (row % 2) * 18; xx < x + w; xx += 36) {
    o.fillStyle = P.rgba(tints[Math.floor(r() * 4)], 0.45); o.fillRect(xx + 1, yy + 1, 34, 20);
    o.fillStyle = 'rgba(255,255,255,0.5)'; o.fillRect(xx + 2, yy + 2, 30, 2);
    o.strokeStyle = 'rgba(190,140,120,0.3)'; o.lineWidth = 1; o.strokeRect(xx + 0.5, yy + 0.5, 35, 21);
  }
}
function jewelBand(o, x, y, w, h) {
  const g = o.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#e8c27a'); g.addColorStop(1, '#b8863e'); o.fillStyle = g; o.fillRect(x, y, w, h);
  let i = Math.floor(x / 13); for (let xx = x + 7; xx < x + w; xx += 13, i++) gem(o, xx, y + h / 2, 5, JEWELS[((i % 12) + 12) % 12]);
}
function gem(o, x, y, r, col) {
  const g = o.createRadialGradient(x - r * 0.4, y - r * 0.4, 0.5, x, y, r); g.addColorStop(0, P.shade(col, 0.6)); g.addColorStop(0.5, col); g.addColorStop(1, P.shade(col, -0.35));
  o.fillStyle = g; o.beginPath(); o.arc(x, y, r, 0, 7); o.fill(); o.fillStyle = 'rgba(255,255,255,0.8)'; o.beginPath(); o.arc(x - r * 0.35, y - r * 0.4, r * 0.25, 0, 7); o.fill();
}
function archPath(o) { o.beginPath(); o.moveTo(GL, GB); o.lineTo(GL, AY); o.arc(AX, AY, AR, Math.PI, 0); o.lineTo(GR, GB); o.closePath(); }
function paintInside(o) {
  o.save(); archPath(o); o.clip();
  const g = o.createRadialGradient(AX, 300, 6, AX, 330, 230); g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#fff3c4'); g.addColorStop(1, '#ffc890'); o.fillStyle = g; o.fillRect(GL, 140, AR * 2, GB - 140);
  // golden glass towers of the city, far away
  const r = P.rng(5);
  for (let i = 0; i < 9; i++) { const x = GL + 6 + i * 25 + r() * 6, h = 30 + r() * 60, w = 16 + r() * 8, b = 352; if (Math.abs(x + w / 2 - AX) < 22) continue;
    const tg = o.createLinearGradient(0, b - h, 0, b); tg.addColorStop(0, 'rgba(255,236,170,0.9)'); tg.addColorStop(1, 'rgba(240,190,110,0.9)'); o.fillStyle = tg; o.fillRect(x, b - h, w, h);
    o.beginPath(); o.arc(x + w / 2, b - h, w / 2, Math.PI, 0); o.fill(); o.fillStyle = 'rgba(255,255,255,0.7)'; o.fillRect(x + 3, b - h + 4, 2, h - 8); }
  // the golden street, like clear glass, running toward the light
  const sg = o.createLinearGradient(0, 330, 0, GB); sg.addColorStop(0, '#fff2b8'); sg.addColorStop(1, '#f0b84a'); o.fillStyle = sg;
  o.beginPath(); o.moveTo(AX - 12, 330); o.lineTo(AX + 12, 330); o.lineTo(GR, GB); o.lineTo(GL, GB); o.closePath(); o.fill();
  o.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 6; i++) { const y = 340 + i * i * 4.2, k = (y - 330) / (GB - 330); o.fillRect(AX - 12 - (AR - 12) * k, y, (12 + (AR - 12) * k) * 2, 1.5); }
  // the crystal river down the middle of the street
  const rg = o.createLinearGradient(0, 330, 0, GB); rg.addColorStop(0, '#e8fbff'); rg.addColorStop(1, '#6cc8ec'); o.fillStyle = rg;
  o.beginPath(); o.moveTo(AX - 3, 330); o.lineTo(AX + 3, 330); o.lineTo(AX + 26, GB); o.lineTo(AX - 26, GB); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,255,255,0.8)'; o.lineWidth = 1.2; for (let i = 0; i < 5; i++) { const y = 360 + i * 26, k = (y - 330) / (GB - 330); o.beginPath(); o.moveTo(AX - 18 * k, y); o.quadraticCurveTo(AX, y - 3, AX + 18 * k, y); o.stroke(); }
  // the tree of life on both banks, hung with fruit of every colour
  for (const [x, sc, sd] of [[AX - 52, 0.62, 3], [AX + 52, 0.62, 8]]) { P.tree(o, x, 430, sc, '#6ac25a', sd); const fr = P.rng(sd); for (let i = 0; i < 9; i++) gem(o, x + (fr() - 0.5) * 50, 430 - 46 + (fr() - 0.5) * 28, 2.6, JEWELS[(i + sd) % 12]); }
  o.restore();
}
function paintFrame(o) {
  // a thick golden arch studded with pearls around the gate
  o.save(); o.lineWidth = 16; const g = o.createLinearGradient(0, 140, 0, GB); g.addColorStop(0, '#ffe8a0'); g.addColorStop(0.5, '#e8b24a'); g.addColorStop(1, '#b8801e'); o.strokeStyle = g;
  o.beginPath(); o.moveTo(GL - 6, GB); o.lineTo(GL - 6, AY); o.arc(AX, AY, AR + 6, Math.PI, 0); o.lineTo(GR + 6, GB); o.stroke();
  o.lineWidth = 2; o.strokeStyle = '#8a5a14'; o.beginPath(); o.moveTo(GL - 14, GB); o.lineTo(GL - 14, AY); o.arc(AX, AY, AR + 14, Math.PI, 0); o.lineTo(GR + 14, GB); o.stroke();
  o.strokeStyle = 'rgba(255,255,255,0.6)'; o.beginPath(); o.moveTo(GL + 1, GB); o.lineTo(GL + 1, AY); o.arc(AX, AY, AR - 1, Math.PI, 0); o.lineTo(GR - 1, GB); o.stroke();
  for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; pearl(o, AX + Math.cos(a) * (AR + 6), AY + Math.sin(a) * (AR + 6), 4.2); }
  for (let y = AY + 20; y < GB - 10; y += 26) { pearl(o, GL - 6, y, 4.2); pearl(o, GR + 6, y, 4.2); }
  // keystone jewel
  gem(o, AX, AY - AR - 6, 9, '#4a7fd8');
  // the golden threshold
  const tg = o.createLinearGradient(0, GB - 4, 0, GB + 8); tg.addColorStop(0, '#ffe8a0'); tg.addColorStop(1, '#c08a2a'); o.fillStyle = tg; o.fillRect(GL - 16, GB - 3, AR * 2 + 32, 10);
  o.restore();
}
function pearl(o, x, y, r) { const g = o.createRadialGradient(x - r * 0.4, y - r * 0.45, 0.5, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#f4ece8'); g.addColorStop(1, '#c8b8c8'); o.fillStyle = g; o.beginPath(); o.arc(x, y, r, 0, 7); o.fill(); }

// One pearl door. side -1 = left (hinged at GL), 1 = right (hinged at GR). It swings inward, so its free edge
// moves toward the hinge and shrinks with distance.
function door(c, side, ang, t) {
  const hinge = side < 0 ? GL : GR, dir = -side, cosA = Math.cos(ang), sinA = Math.sin(ang), CY = 330;
  const X = u => hinge + dir * AR * u * cosA, Y = (u, y) => CY + (y - CY) * (1 - u * sinA * 0.3);
  const topY = u => archTop(hinge + dir * AR * u) + 1;
  c.save(); archPath(c); c.clip();
  c.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16; c.lineTo(X(u), Y(u, topY(u))); } c.lineTo(X(1), Y(1, GB)); c.lineTo(X(0), GB); c.closePath();
  // iridescent pearl: a soft body with rose, lilac and sky-blue sheen that slides as the door turns
  const x0 = X(0), x1 = X(1), sh = Math.sin(t * 0.8) * 0.08 + ang * 0.2, cl = v => Math.max(0, Math.min(1, v));
  const pg = c.createLinearGradient(x0, 150, x1, GB);
  pg.addColorStop(0, '#e6d4e6'); pg.addColorStop(cl(0.2 + sh), '#f8eef0'); pg.addColorStop(cl(0.42 + sh), '#efc8dc'); pg.addColorStop(cl(0.62 + sh), '#c8daf4'); pg.addColorStop(cl(0.8 + sh), '#dccbf0'); pg.addColorStop(1, '#ead8e4');
  c.fillStyle = pg; c.fill();
  c.save(); c.clip();
  const L = Math.min(x0, x1) - 4, Wd = Math.abs(x1 - x0) + 8;
  // a big round lustre glow, like the inside of a shell, and weight toward the bottom
  const lx = X(0.5), ly = Y(0.5, 300); const lg = c.createRadialGradient(lx - dir * 12, ly - 34, 4, lx, ly, 110); lg.addColorStop(0, 'rgba(255,255,255,0.95)'); lg.addColorStop(0.45, 'rgba(255,240,250,0.25)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = lg; c.fillRect(L, 140, Wd, GB - 140);
  const bg = c.createLinearGradient(0, 360, 0, GB); bg.addColorStop(0, 'rgba(120,80,130,0)'); bg.addColorStop(1, 'rgba(120,80,130,0.28)'); c.fillStyle = bg; c.fillRect(L, 360, Wd, GB - 360);
  // turning away from us darkens it a little
  c.fillStyle = `rgba(110,70,120,${sinA * 0.3})`; c.fillRect(L, 140, Wd, GB - 140);
  c.restore();
  // carved panels outlined in gold
  c.strokeStyle = '#c8902e'; c.lineWidth = 2.4 * (0.5 + 0.5 * cosA);
  for (const [u0, u1, y0, y1] of [[0.14, 0.86, 250, 318], [0.14, 0.86, 340, 476]]) { c.beginPath(); c.moveTo(X(u0), Y(u0, y0)); c.lineTo(X(u1), Y(u1, y0)); c.lineTo(X(u1), Y(u1, y1)); c.lineTo(X(u0), Y(u0, y1)); c.closePath(); c.stroke(); }
  // a great round pearl boss in each door
  const bu = 0.5, bx = X(bu), by = Y(bu, 286), br = 20 * (1 - bu * sinA * 0.3);
  c.save(); c.translate(bx, by); c.scale(Math.max(0.15, cosA), 1); c.fillStyle = '#d8a040'; c.beginPath(); c.arc(0, 0, br + 4, 0, 7); c.fill(); pearl(c, 0, 0, br); c.restore();
  // studs along the panels
  c.fillStyle = '#f2c14a'; for (const y of [340, 476]) for (let i = 1; i < 6; i++) { const u = 0.14 + (i - 0.5) / 5 * 0.72; c.beginPath(); c.arc(X(u), Y(u, y), 2.6 * (1 - u * sinA * 0.3), 0, 7); c.fill(); }
  // thick golden edges: along the top curve, the hinge side and the free edge
  c.strokeStyle = '#d8a040'; c.lineWidth = 5; c.lineJoin = 'round'; c.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16; c.lineTo(X(u), Y(u, topY(u)) + 2); } c.lineTo(X(1), Y(1, GB)); c.stroke();
  c.strokeStyle = 'rgba(255,240,190,0.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(1) - dir * 2, Y(1, topY(1)) + 4); c.lineTo(X(1) - dir * 2, Y(1, GB)); c.stroke();
  // the big pearl handle
  pearl(c, X(0.86), Y(0.86, 380), 7 * (1 - sinA * 0.25));
  c.restore();
}
function banner(c, x, y, t, cols) {
  c.save(); c.translate(x, y); c.scale(1.1, 1.1); c.strokeStyle = '#6b4a2e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -46); c.stroke();
  for (let i = 0; i < cols.length; i++) { c.fillStyle = cols[i]; c.beginPath(); const fh = 22 / cols.length;
    for (let k = 0; k <= 8; k++) { const xx = -k / 8 * 34, yy = -46 + i * fh + Math.sin(t * 4 + k * 0.7 + 1) * 2 * (k / 8); k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    for (let k = 8; k >= 0; k--) { const xx = -k / 8 * 34, yy = -46 + (i + 1) * fh + Math.sin(t * 4 + k * 0.7 + 1) * 2 * (k / 8); c.lineTo(xx, yy); } c.closePath(); c.fill(); }
  // a little heart on the welcome banner
  c.fillStyle = '#e8506a'; const hx = -17, hy = -35 + Math.sin(t * 4 + 3) * 1, r = 4.5; c.beginPath(); c.moveTo(hx, hy + r * 0.9); c.bezierCurveTo(hx - r * 1.6, hy - r * 0.2, hx - r * 0.7, hy - r * 1.3, hx, hy - r * 0.4); c.bezierCurveTo(hx + r * 0.7, hy - r * 1.3, hx + r * 1.6, hy - r * 0.2, hx, hy + r * 0.9); c.fill();
  c.restore();
}

// a person seen from behind: draw them, then cover the face with the back of the head
function backPerson(c, x, y, s, o) {
  P.person(c, x, y, s, { ...o, bounce: 0, expr: 'sleep' });
  const Hh = o.child ? 0.82 : 1, hr = o.child ? 15 : 16, hy = y + (-40 * Hh - 15) * s;
  c.fillStyle = o.hair; c.strokeStyle = P.shade(o.hair, -0.4); c.lineWidth = 1.2;
  if (o.hairStyle === 'long') { c.beginPath(); c.moveTo(x - hr * 1.05 * s, hy); c.lineTo(x - hr * 1.0 * s, hy + 30 * s); c.quadraticCurveTo(x, hy + 36 * s, x + hr * 1.0 * s, hy + 30 * s); c.lineTo(x + hr * 1.05 * s, hy); c.fill(); }
  c.beginPath(); c.arc(x, hy, hr * 1.04 * s, 0, 7); c.fill(); c.stroke();
  if (o.hairStyle === 'curly') for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; c.beginPath(); c.arc(x + Math.cos(a) * hr * 0.9 * s, hy + Math.sin(a) * hr * 0.9 * s, hr * 0.32 * s, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.16)'; c.beginPath(); c.ellipse(x - hr * 0.3 * s, hy - hr * 0.5 * s, hr * 0.45 * s, hr * 0.22 * s, -0.4, 0, 7); c.fill();
}
function drawCrowd(c, s, t, op, opened, push, g) {
  const since = opened ? t - s.openedAt : -1;
  // where each person is: before opening they stay put; after, they stream through the gate (staggered)
  const walk = (delay, speed = 2.2) => since < 0 ? 0 : Math.max(0, Math.min(1, (since - delay) * speed));
  const into = (x, y, sc, w) => ({ x: x + (AX - x) * w, y: y + (GB - 6 - y) * w, sc: sc * (1 - w * 0.55), a: 1 - Math.max(0, (w - 0.7) / 0.3) });
  const items = [];
  // side friends and animals, cheering on every push
  FRIENDS.forEach((f, i) => { const w = walk(0.08 + i * 0.05), p = into(f.x, f.y, f.s, w); items.push({ y: p.y, draw: () => {
    const hop = opened ? Math.abs(Math.sin(t * 9 + i)) * 8 : push * 6 * (i % 2 ? 1 : 0.7);
    c.save(); c.globalAlpha = p.a; P.person(c, p.x, p.y - hop, p.sc, { ...f.o, facing: f.f, t, phase: i, bounce: 1.5, expr: opened ? 'laugh' : op > 0.5 ? 'wow' : 'happy', arms: opened || push > 0.3 ? 'cheer' : (i % 2 ? 'wave' : 'raise') }); c.restore(); } }); });
  const animals = [{ k: 'lion', x: 108, y: 600, s: 0.9, f: 1 }, { k: 'sheep', x: 252, y: 602, s: 0.9, f: -1 }, { k: 'donkey', x: 352, y: 560, s: 0.85, f: -1 }];
  animals.forEach((a, i) => { const w = walk(0.18 + i * 0.06), p = into(a.x, a.y, a.s, w); items.push({ y: p.y, draw: () => { c.save(); c.globalAlpha = p.a; P[a.k](c, p.x, p.y - (opened ? Math.abs(Math.sin(t * 8 + i)) * 6 : push * 3), p.sc, { t, phase: i, facing: a.f, hop: opened }); c.restore(); } }); });
  // the pushers lean into the doors on every push
  PUSHERS.forEach((q, i) => { const w = walk(0, 2.6), p = into(q.x, q.y, q.s, w); items.push({ y: p.y, draw: () => {
    const lean = push * 7 + Math.sin(t * 9 + i * 2) * (opened ? 0 : 1);
    c.save(); c.globalAlpha = p.a; backPerson(c, p.x, p.y - lean, p.sc, { ...q.o, arms: 'up', t }); c.restore(); } }); });
  items.sort((a, b) => a.y - b.y).forEach(it => it.draw());
  // effort puffs at the pushers' hands
  if (push > 0.4 && !opened) { c.save(); c.globalAlpha = (push - 0.4) * 1.6; c.strokeStyle = '#ffffff'; c.lineWidth = 2.5; c.lineCap = 'round';
    for (const q of PUSHERS) { const hx = q.x, hy = q.y - 80 * q.s; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(hx + sd * 26, hy - 6); c.lineTo(hx + sd * 36, hy - 12); c.moveTo(hx + sd * 28, hy + 4); c.lineTo(hx + sd * 40, hy + 4); c.stroke(); } } c.restore(); }
}
