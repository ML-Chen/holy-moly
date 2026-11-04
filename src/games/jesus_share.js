// SHARE! — John 6:1–14. A boy shares his five loaves and two fish; drag food from his ever-full basket to each hungry person on the hillside.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const BASKET = { x: 180, y: 560 };
// seated spots on the hillside, in the order they are used (front row first so level 0 is spread out)
const SPOTS = [[86, 474], [274, 474], [180, 392], [62, 386], [298, 386], [180, 482]];
const LOOKS = [
  { skin: SK[1], robe: CL.teal, stripe: CL.cream, hairStyle: 'long', hair: HR[2] },
  { skin: SK[3], robe: CL.terracotta, stripe: CL.sand, beard: true, hair: HR[0], head: 'wrap', headCol: CL.cream },
  { skin: SK[2], robe: CL.plum, stripe: CL.gold, hairStyle: 'bun', hair: HR[1] },
  { skin: SK[0], robe: CL.olive, stripe: CL.cream, hairStyle: 'curly', hair: HR[3], child: true },
  { skin: SK[2], robe: CL.rose, stripe: CL.white, hair: HR[5], head: 'scarf', headCol: CL.sand },
  { skin: SK[3], robe: CL.indigo, stripe: CL.saffron, beard: true, hair: HR[0] },
  { skin: SK[1], robe: CL.sky, stripe: CL.white, hairStyle: 'curly', hair: HR[0] },
];
const MATS = ['#e8a33a', '#cf6f4a', '#6aa9d8', '#8a4d7a', '#4f9a5a', '#e07a8a'];

function boat(c, x, y, s, t, sail = '#fbf2de') {
  c.save(); c.translate(x, y + Math.sin(t * 1.6 + x) * 1.5); c.rotate(Math.sin(t * 1.2 + x) * 0.04); c.scale(s, s);
  c.fillStyle = 'rgba(20,60,90,0.25)'; c.beginPath(); c.ellipse(0, 3, 26, 3, 0, 0, 7); c.fill();
  const h = c.createLinearGradient(0, -8, 0, 4); h.addColorStop(0, '#a8714a'); h.addColorStop(1, '#5e3a22'); c.fillStyle = h;
  c.beginPath(); c.moveTo(-24, -6); c.lineTo(24, -6); c.quadraticCurveTo(18, 4, 0, 4); c.quadraticCurveTo(-18, 4, -24, -6); c.fill();
  c.strokeStyle = '#4a2a18'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, -6); c.lineTo(0, -40); c.stroke();
  const sg = c.createLinearGradient(-10, -40, 16, -8); sg.addColorStop(0, '#ffffff'); sg.addColorStop(1, sail); c.fillStyle = sg;
  c.beginPath(); c.moveTo(1, -39); c.quadraticCurveTo(16 + Math.sin(t * 2 + x) * 2, -24, 20, -9); c.lineTo(1, -9); c.closePath(); c.fill();
  c.restore();
}
function gull(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 8 + x) * 4; c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, -f); c.quadraticCurveTo(-4, -4, 0, 0); c.quadraticCurveTo(4, -4, 9, -f); c.stroke(); c.restore(); }
function butterfly(c, x, y, t, col) { c.save(); c.translate(x, y); const f = Math.abs(Math.sin(t * 14)); c.fillStyle = col; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 4 * f, -2, 4 * f + 0.6, 5, sd * 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(sd * 3 * f, 3, 3 * f + 0.5, 3, -sd * 0.3, 0, 7); c.fill(); } c.fillStyle = '#4a2a30'; c.fillRect(-0.7, -4, 1.4, 8); c.restore(); }
function mat(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,60,20,0.25)'; c.beginPath(); c.ellipse(2, 3, 30, 8, 0, 0, 7); c.fill();
  c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 28, 7.5, 0, 0, 7); c.fill();
  c.save(); c.clip(); c.fillStyle = P.rgba('#fff6e0', 0.45); for (let i = -3; i <= 3; i++) c.fillRect(i * 8 - 1.5, -9, 3, 18); c.restore();
  c.strokeStyle = P.shade(col, -0.35); c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 0, 28, 7.5, 0, 0, 7); c.stroke();
  c.restore();
}
// a person sitting cross-legged: the robe below the lap is hidden behind folded knees
function seated(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 126 * s); c.clip(); P.person(c, x, y + 12 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 12 * s, x, y + 4 * s); g.addColorStop(0, P.shade(robe, 0.12)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 4 * s, 19 * s, 7.5 * s, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 13 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.ellipse(x + 13 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill();
}
function food(c, kind, x, y, s) { if (kind === 'fish') P.fishShape(c, x, y, s * 0.95, '#9fc3d6'); else P.loaf(c, x, y, s); }

MG.add({
  id: 'share', stage: 'jesus', cmd: 'SHARE!', hint: 'drag', time: 6, mood: 'bright', winText: 'Yum!',
  card: { title: 'A lunch to share', ref: 'John 6:1–14', kind: 'Gospel story', text: 'The Gospel of John tells how a huge crowd followed Jesus to a hillside, and there was no food for them. A boy had five small loaves and two fish. Jesus gave thanks and shared them, and everyone ate until they were full.', ask: 'What is something small you could share this week? Who would you share it with?' },
  init(g) {
    const s = g.s, n = [3, 5, 6][g.level];
    const looks = LOOKS.slice().sort(() => Math.random() - 0.5), mats = MATS.slice().sort(() => Math.random() - 0.5);
    s.people = SPOTS.slice(0, n).map(([x, y], i) => ({ x: x + (Math.random() - 0.5) * 10, y, sc: 0.9 + (y - 380) / 100 * 0.14, look: looks[i], mat: mats[i], fed: false, fedT: 0, got: 'bread', phase: Math.random() * 6 }));
    s.held = null; s.next = 'bread'; s.back = []; s.popT = -9; s.winT = 0;
    s.flies = [0, 1].map(i => ({ x: 60 + i * 220, y: 520 + i * 20, ph: Math.random() * 6, col: i ? '#f4d35e' : '#f2a0c8' }));
  },
  down(g, x, y) {
    const s = g.s; if (s.held) return;
    if (Math.hypot(x - BASKET.x, y - (BASKET.y - 12)) < 62) { s.held = { kind: s.next, x, y: y - 10 }; s.next = s.next === 'bread' ? 'fish' : 'bread'; s.popT = g.t; g.sfx('pop'); g.burst(BASKET.x, BASKET.y - 26, ['#fff6c0', '#ffd45a', '#ffffff'], 8, 90); }
  },
  move(g, x, y) { const h = g.s.held; if (h) { h.x = x; h.y = y - 10; } },
  up(g, x, y) {
    const s = g.s, h = s.held; if (!h) return; s.held = null;
    let best = null, bd = 66; for (const p of s.people) { if (p.fed) continue; const d = Math.hypot(p.x - h.x, p.y - 30 * p.sc - h.y); if (d < bd) { bd = d; best = p; } }
    if (best) {
      best.fed = true; best.fedT = g.t; best.got = h.kind; g.sfx('munch'); g.sfx('cheer');
      g.burst(best.x, best.y - 40 * best.sc, ['#ffd45a', '#ffffff', '#ffb36a', '#a8e08a'], 16, 170);
      if (s.people.every(p => p.fed)) { s.winT = g.t; g.win(); g.burst(BASKET.x, BASKET.y - 30, ['#fff6c0', '#ffd45a', '#ffffff'], 24, 220); }
    } else { s.back.push({ kind: h.kind, x: h.x, y: h.y, t: g.t }); g.sfx('swoosh'); }
  },
  update(g, dt) { const s = g.s; s.back = s.back.filter(b => g.t - b.t < 0.3); },
  auto(g, dt, synth) { // drag one portion every 0.32 s to the next hungry person
    const s = g.s; if (g.t < 0.35) return; const k = Math.floor((g.t - 0.35) / 0.16);
    if (k === s.botK) return; s.botK = k;
    const p = s.people.find(q => !q.fed); if (!p) return;
    if (k % 2 === 0 && !s.held) { synth('down', BASKET.x, BASKET.y - 12); synth('move', p.x, p.y - 20 * p.sc); }
    else if (k % 2 === 1 && s.held) synth('up', p.x, p.y - 20 * p.sc);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win';
    c.drawImage(g.bake('jesus_share_far', o => {
      P.sky(o, W, H, ['#4f9fd6', '#8ccbea', '#d6eef0', '#fbe8c0'], { x: 290, y: 92, r: 24, color: '#fff3c8', glow: 230 });
      // far shore: the hills across the lake, hazy blue-violet
      P.hills(o, W, 236, 34, '#9aa6cc', '#8a94bc', { seed: 31, freq: 0.01, dabs: 20, bottom: 300 });
      P.hills(o, W, 246, 18, '#8fa8b8', '#7f9cae', { seed: 33, freq: 0.02, dabs: 20, bottom: 300 });
      o.fillStyle = 'rgba(255,248,230,0.25)'; o.fillRect(0, 210, W, 40);
    }), 0, 0, W, H);
    P.cloud(c, 70 + Math.sin(t * 0.3) * 6 + t * 3, 132, 0.85, '#fffaf0', '#d6dcec', 0.95);
    P.cloud(c, 230 + t * 2, 182, 0.5, '#fffaf0', '#d6dcec', 0.85);
    P.rays(c, 290, 92, W, H * 0.5, '#fff6d0', 0.12, 9, t);
    P.water(c, W, 244, 318, '#2f7fa0', '#7cc8d8', t, { waves: 4 });
    boat(c, 92, 266, 0.7, t); boat(c, 250, 280, 0.9, t, '#f2e0c8');
    gull(c, 120 + Math.sin(t * 0.8) * 30, 200 + Math.sin(t * 1.3) * 6, 0.9, t); gull(c, 160 + Math.sin(t * 0.7 + 1) * 26, 186, 0.7, t + 0.4);
    c.drawImage(g.bake('jesus_share_near', o => {
      P.hills(o, W, 300, 26, '#8ab468', '#6a9a50', { seed: 13, freq: 0.02, dabs: 30, rim: '#d8eca0' });
      // the five thousand, sitting in groups on the far slope
      const r = P.rng(41), robes = Object.values(CL);
      for (let i = 0; i < 46; i++) { const x = 6 + (i % 23) * 15.5 + r() * 8, y = 304 + Math.floor(i / 23) * 13 + r() * 6; P.person(o, x, y, 0.22 + (y - 300) * 0.004, { skin: SK[Math.floor(r() * 4)], robe: robes[Math.floor(r() * robes.length)], hair: HR[Math.floor(r() * 5)], hairStyle: ['short', 'long', 'curly', 'bun'][Math.floor(r() * 4)], bounce: 0 }); }
      P.tree(o, 20, 336, 0.55, '#6f9a52', 3); P.tree(o, 342, 330, 0.5, '#6a9450', 8);
      P.hills(o, W, 352, 26, '#b2d070', '#7aa04a', { seed: 17, freq: 0.016, dabs: 110, rim: '#eef6b0' });
      P.grassTufts(o, W, 360, 640, 70, '#6a9a3a', 6); P.flowers(o, W, 360, 640, 46, ['#f4d35e', '#ffffff', '#ee6c8a', '#b98ae0'], 12);
      // a sunlit patch where the basket sits
      const sp = o.createRadialGradient(180, 560, 10, 180, 560, 140); sp.addColorStop(0, 'rgba(255,240,170,0.35)'); sp.addColorStop(1, 'rgba(255,240,170,0)'); o.fillStyle = sp; o.fillRect(0, 400, W, 240);
    }), 0, 0, W, H);
    // hungry people on their mats
    const list = s.people.slice().sort((a, b) => a.y - b.y);
    for (const p of list) {
      const sc = p.sc, ft = t - p.fedT;
      if (!p.fed) { const pu = 0.5 + 0.5 * Math.sin(t * 5 + p.phase); const gl = c.createRadialGradient(p.x, p.y - 2, 4, p.x, p.y - 2, 42 * sc); gl.addColorStop(0, `rgba(255,236,150,${0.35 + 0.3 * pu})`); gl.addColorStop(1, 'rgba(255,236,150,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(p.x, p.y - 2, 42 * sc, 16 * sc, 0, 0, 7); c.fill(); }
      mat(c, p.x, p.y, sc, p.mat);
      const cheer = p.fed && (ft < 0.7 || won);
      seated(c, p.x, p.y, sc, { ...p.look, t, phase: p.phase, bounce: p.fed ? 2.2 : 0.8, expr: p.fed ? (cheer ? 'laugh' : 'happy') : 'sad', arms: p.fed ? (cheer ? 'cheer' : 'hold') : 'down', hold: p.fed && !cheer ? (cc, hx, hy) => food(cc, p.got, hx, hy - 2, 0.55) : null });
      if (p.fed && cheer) food(c, p.got, p.x, p.y - 4 * sc, 0.6 * sc);
      if (!p.fed) { // thought bubble with a faint loaf: "I'm hungry"
        const bx = p.x + 25 * sc, by = p.y - 70 * sc + Math.sin(t * 3 + p.phase) * 2;
        c.fillStyle = 'rgba(255,253,245,0.92)'; c.strokeStyle = 'rgba(120,80,60,0.5)'; c.lineWidth = 1.4;
        c.beginPath(); c.arc(p.x + 14 * sc, by + 16 * sc, 2.2 * sc, 0, 7); c.fill(); c.beginPath(); c.arc(bx, by, 14 * sc, 0, 7); c.fill(); c.stroke();
        c.save(); c.globalAlpha = 0.55 + 0.25 * Math.sin(t * 5 + p.phase); P.loaf(c, bx, by + 1, 0.62 * sc); c.restore();
      } else if (ft < 1.2) { c.save(); c.globalAlpha = 1 - ft / 1.2; c.fillStyle = '#ff7a9a'; for (let i = 0; i < 3; i++) heart(c, p.x - 14 + i * 14, p.y - 70 * sc - ft * 40 - i * 6, 5); c.restore(); }
    }
    // the boy's basket: always full, always sparkling
    const pop = Math.max(0, 1 - (t - s.popT) / 0.25), bx = BASKET.x, by = BASKET.y;
    const gp = 0.5 + 0.5 * Math.sin(t * 4); const bg = c.createRadialGradient(bx, by - 18, 6, bx, by - 18, 78); bg.addColorStop(0, `rgba(255,240,170,${0.55 + 0.25 * gp})`); bg.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = bg; c.beginPath(); c.arc(bx, by - 18, 78, 0, 7); c.fill();
    c.save(); c.translate(bx, by); c.scale(1 + pop * 0.12, 1 - pop * 0.08);
    c.save(); c.translate(-14, -30); c.rotate(-0.5); P.fishShape(c, 0, 0, 1.0, '#9fc3d6'); c.restore();
    c.save(); c.translate(18, -32); c.rotate(0.4); c.scale(-1, 1); P.fishShape(c, 0, 0, 0.95, '#a9cbe0'); c.restore();
    P.basket(c, 0, 4, 1.9, 'bread'); c.restore();
    for (let i = 0; i < 5; i++) { const a = t * 1.4 + i * 1.26, tw = Math.max(0, Math.sin(t * 4 + i * 2)); if (tw < 0.2) continue; c.save(); c.globalAlpha = tw; c.fillStyle = i % 2 ? '#fffbe0' : '#ffe27a'; drawStar(c, bx + Math.cos(a) * 46, by - 26 + Math.sin(a) * 20, 4 + tw * 3, t); c.restore(); }
    // Jesus gives thanks; the boy offers his lunch
    P.person(c, 64, 612, 1.25, { ...JESUS, t, phase: 1, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'out', bounce: 0.8 });
    P.person(c, 282, 614, 1.18, { skin: SK[2], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[0], child: true, facing: -1, t, phase: 2, expr: won || s.people.some(p => p.fed) ? 'laugh' : 'happy', arms: won ? 'cheer' : 'reach', bounce: 2 });
    for (const f of s.flies) butterfly(c, f.x + Math.sin(t * 1.3 + f.ph) * 30, f.y + Math.sin(t * 2.1 + f.ph) * 14, t + f.ph, f.col);
    // food flying back to the basket after a miss
    for (const b of s.back) { const q = (t - b.t) / 0.3; c.save(); c.globalAlpha = 1 - q * 0.6; food(c, b.kind, b.x + (bx - b.x) * q, b.y + (by - 30 - b.y) * q - Math.sin(q * Math.PI) * 30, 1.1); c.restore(); }
    if (s.held) { const h = s.held; c.fillStyle = 'rgba(40,60,20,0.2)'; c.beginPath(); c.ellipse(h.x, h.y + 26, 16, 5, 0, 0, 7); c.fill(); const hg = c.createRadialGradient(h.x, h.y, 2, h.x, h.y, 30); hg.addColorStop(0, 'rgba(255,245,190,0.7)'); hg.addColorStop(1, 'rgba(255,245,190,0)'); c.fillStyle = hg; c.beginPath(); c.arc(h.x, h.y, 30, 0, 7); c.fill(); food(c, h.kind, h.x, h.y, 1.3); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
