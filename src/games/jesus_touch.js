// TOUCH! — Mark 1:40–42. A man with a skin disease, whom everybody kept away from, kneels before Jesus. Jesus reaches out and touches him.
// Drag the nervous people gently aside to open the way, then tap the man: Jesus walks over and touches him, and colour and joy come back.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const MAN = { skin: SK[1], hair: HR[2], beard: true, hairStyle: 'short' };
const MX = 292, MY = 592, MS = 1.48;            // the kneeling man
const JX0 = 56, JX1 = 196, JY = 604, JS = 1.5;  // Jesus walks from JX0 to JX1
const SPOTS = { 1: [176], 2: [140, 216], 3: [124, 178, 232] };
const LOOKS = [
  { skin: SK[0], robe: CL.plum, stripe: CL.gold, hairStyle: 'bun', hair: HR[0] },
  { skin: SK[3], robe: CL.teal, stripe: CL.cream, beard: true, hair: HR[0], head: 'wrap', headCol: CL.sand },
  { skin: SK[2], robe: CL.terracotta, stripe: CL.sand, hairStyle: 'long', hair: HR[2] },
  { skin: SK[1], robe: CL.olive, stripe: CL.cream, hairStyle: 'curly', hair: HR[1], child: true },
];
// back-row places the crowd shuffles to once they step aside
const ASIDE = { '-1': [[26, 488], [76, 482], [118, 490]], '1': [[248, 486], [292, 480], [338, 488]] };

// a kneeling figure: the person drawn lower, clipped at the ground, with folded knees and feet behind
function kneel(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 70 * s, y - 140 * s, 140 * s, 128 * s); c.clip(); P.person(c, x, y + 14 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 14 * s, x, y + 2 * s); g.addColorStop(0, P.shade(robe, 0.1)); g.addColorStop(1, P.shade(robe, -0.22));
  c.fillStyle = 'rgba(40,20,40,0.22)'; c.beginPath(); c.ellipse(x, y + 2 * s, 24 * s, 5 * s, 0, 0, 7); c.fill();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x + 18 * s * (o.facing || 1), y - 1 * s, 6 * s, 3 * s, 0, 0, 7); c.fill();
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x - 3 * s * (o.facing || 1), y - 6 * s, 20 * s, 8 * s, 0, 0, 7); c.fill(); c.stroke();
}
function paintBg(o) {
  P.sky(o, W, H, ['#5aa0d8', '#94cbe8', '#d6eef0', '#fbe6bc'], { x: 300, y: 96, r: 22, color: '#fff3c8', glow: 220 });
  P.cloud(o, 90, 120, 0.8, '#fffaf0', '#d6dcec', 0.9);
  P.hills(o, W, 330, 40, '#9ab0c8', '#8aa0bc', { seed: 7, freq: 0.01, dabs: 20, bottom: 400 });
  P.hills(o, W, 372, 34, '#a8c070', '#88a858', { seed: 9, freq: 0.016, dabs: 40, rim: '#e8f0b0', bottom: 460 });
  P.house(o, 200, 404, 56, 44, '#e8cba0'); P.house(o, 262, 410, 76, 56, '#dcb88c', { awning: '#c9443c' }); P.house(o, 4, 410, 72, 52, '#e6c49a');
  P.tree(o, 120, 420, 0.75, '#6f9a52', 5); P.palm(o, 344, 420, 0.7, -0.15, 0, '#4f8a4a');
  // the dusty village street
  const fg = o.createLinearGradient(0, 410, 0, H); fg.addColorStop(0, '#e8cf9e'); fg.addColorStop(1, '#c49a62'); o.fillStyle = fg;
  o.beginPath(); o.moveTo(0, 420); o.quadraticCurveTo(180, 404, W, 422); o.lineTo(W, H); o.lineTo(0, H); o.closePath(); o.fill();
  const r = P.rng(13); for (let i = 0; i < 60; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff2d0' : '#a87a48', 0.2); o.beginPath(); o.ellipse(r() * W, 430 + r() * 210, 6 + r() * 12, 2 + r() * 2, 0, 0, 7); o.fill(); }
  for (let i = 0; i < 9; i++) { const x = r() * W, y = 470 + r() * 150; o.fillStyle = 'rgba(150,120,90,0.6)'; o.beginPath(); o.ellipse(x, y, 3 + r() * 3, 2, 0, 0, 7); o.fill(); }
  P.grassTufts(o, W, 418, 450, 16, '#8aa04a', 4); P.flowers(o, W, 424, 452, 10, ['#f4d35e', '#ffffff', '#ee6c8a'], 3);
}

MG.add({
  id: 'touch', stage: 'jesus', cmd: 'TOUCH!', hint: 'drag', time: 6, mood: 'bright', winText: 'Healed!',
  card: {
    title: 'Jesus reaches out', ref: 'Mark 1:40–42', kind: 'Gospel story',
    text: 'Mark\'s Gospel tells how a man with a skin disease came to Jesus. People with that illness had to live apart, and nobody would touch them. The man knelt and said, "If you want to, you can make me clean." Jesus reached out, touched him and said, "I do want to. Be clean!" and the man was healed.',
    note: 'Some Christians believe this healing happened just as Mark tells it, and others read it as a story showing that God comes close to people everyone else keeps away from.',
    ask: 'Is there someone who often gets left out? How could you include them this week?',
  },
  init(g) {
    const s = g.s, n = [1, 2, 3][g.level], looks = LOOKS.slice().sort(() => Math.random() - 0.5);
    s.crowd = SPOTS[n].map((x, i) => ({ x, y: 598 - (i % 2) * 8, ox: 0, aside: 0, side: 0, slot: null, k: 0, look: looks[i], ph: Math.random() * 6, nudgeT: -9 }));
    s.used = { '-1': 0, '1': 0 }; s.goT = -1; s.touchT = -1; s.last = null; s.blockT = -9; s.walk = 0.5 / (1 + (g.speed - 1) * 0.5);
    s.need = [44, 56, 64][g.level];
  },
  down(g, x, y) {
    const s = g.s; s.last = [x, y];
    if (s.goT >= 0) return;
    if (Math.hypot(x - MX, y - (MY - 40 * MS)) < 56) {
      if (s.crowd.every(p => p.aside)) { s.goT = g.t; g.sfx('chime'); }
      else { s.blockT = g.t; g.sfx('boing'); for (const p of s.crowd) if (!p.aside) p.nudgeT = g.t; }
    }
  },
  move(g, x, y) {
    const s = g.s; if (!s.last) return; const dx = x - s.last[0]; s.last = [x, y];
    for (const p of s.crowd) {
      if (p.aside) continue; const px = p.x + p.ox;
      if (Math.abs(x - px) > 38 || y < p.y - 130 || y > p.y + 20) continue;
      p.ox += dx * 0.9; p.nudgeT = g.t;
      if (Math.abs(p.ox) > s.need) { // they step aside, a little shy, to the back
        const side = p.ox < 0 ? -1 : 1; p.aside = g.t; p.side = side; p.slot = ASIDE[side][s.used[side]++ % 3]; p.fx = px; p.fy = p.y;
        g.sfx('swoosh'); g.burst(px, p.y - 50, ['#fff6c0', '#ffd45a', '#ffffff'], 8, 100);
        if (s.crowd.every(q => q.aside)) g.sfx('ding');
      }
    }
  },
  up(g) { g.s.last = null; },
  update(g, dt) {
    const s = g.s, t = g.t;
    for (const p of s.crowd) { if (p.aside) p.k = Math.min(1, (t - p.aside) / 0.45); else if (!s.last) p.ox *= Math.pow(0.02, dt); }
    if (s.goT >= 0 && s.touchT < 0 && t - s.goT > s.walk) { s.touchT = t; g.win(); g.sfx('magic'); g.sfx('cheer'); g.burst(MX - 10, MY - 60, ['#ffd45a', '#ffffff', '#ff9ac0', '#9fe0ff', '#b8f0a0'], 30, 220); }
  },
  auto(g, dt, synth) { // sweep each person toward the nearer edge, then tap the man
    const s = g.s; if (g.t < 0.3 || g.t - (s.botT || 0) < 0.06) return; s.botT = g.t;
    const p = s.crowd.find(q => !q.aside);
    if (p) {
      const d = p.x < 180 ? -1 : 1, px = p.x + p.ox;
      if (!s.botDrag) { s.botDrag = 1; synth('down', px - d * 10, p.y - 50); }
      else synth('move', px + d * 22, p.y - 50);
      return;
    }
    if (s.botDrag) { s.botDrag = 0; synth('up', 180, 500); return; }
    if (s.goT < 0) { synth('down', MX, MY - 40); synth('up', MX, MY - 40); }
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', heal = s.touchT >= 0 ? Math.min(1, (t - s.touchT) / 0.6) : 0, clear = s.crowd.every(p => p.aside);
    c.drawImage(g.bake('jesus_touch_bg', paintBg), 0, 0, W, H);
    P.cloud(c, 250 + Math.sin(t * 0.3) * 8 + t * 2, 170, 0.55, '#fffaf0', '#d6dcec', 0.9);
    // the crowd who stepped aside, in the back row
    const aside = s.crowd.filter(p => p.aside), here = s.crowd.filter(p => !p.aside);
    for (const p of aside) {
      const q = p.k, e = q * q * (3 - 2 * q), x = p.fx + (p.slot[0] - p.fx) * e, y = p.fy + (p.slot[1] - p.fy) * e, sc = 1.35 - 0.3 * e;
      P.person(c, x, y - Math.sin(q * Math.PI) * 8, sc, { ...p.look, t, phase: p.ph, bounce: won ? 3 : 1, expr: won ? 'laugh' : 'wow', arms: won ? 'cheer' : 'pray', facing: x < MX ? 1 : -1 });
    }
    // Jesus, walking over and reaching out
    const wq = s.goT >= 0 ? Math.min(1, (t - s.goT) / s.walk) : 0, jx = JX0 + (JX1 - JX0) * (wq * wq * (3 - 2 * wq));
    if (s.goT < 0) { const gl = c.createRadialGradient(jx, JY - 50, 6, jx, JY - 50, 70); gl.addColorStop(0, 'rgba(255,244,200,0.35)'); gl.addColorStop(1, 'rgba(255,244,200,0)'); c.fillStyle = gl; c.fillRect(jx - 70, JY - 120, 140, 140); }
    P.person(c, jx, JY - (wq > 0 && wq < 1 ? Math.abs(Math.sin(wq * 14)) * 4 : 0), JS, { ...JESUS, t, phase: 1, bounce: won ? 2.5 : 0.6, expr: won ? 'laugh' : 'happy', arms: s.goT >= 0 && !won ? 'reach' : won ? (t - s.touchT < 0.4 ? 'reach' : 'cheer') : 'out' });
    // the man, kneeling: pale and grey at first, then full of colour
    const hop = won ? Math.max(0, Math.sin((t - s.touchT) * 9)) * 6 : 0, hope = clear && s.goT < 0;
    const base = { ...MAN, t, bounce: 0, facing: -1 };
    if (heal < 1) { const lg = c.createRadialGradient(MX, MY - 50, 10, MX, MY - 40, 90); lg.addColorStop(0, `rgba(90,100,140,${0.32 * (1 - heal)})`); lg.addColorStop(1, 'rgba(90,100,140,0)'); c.fillStyle = lg; c.fillRect(MX - 90, MY - 140, 180, 180); }
    c.save(); c.globalAlpha = 1 - heal; kneel(c, MX, MY, MS, { ...base, robe: '#a8a29a', expr: hope ? 'surprised' : 'sad', arms: hope ? 'reach' : 'pray' });
    // a few pale patches on his face and hands
    const hy = MY + 14 * MS - (40 + 15 + 1) * MS; c.fillStyle = 'rgba(250,244,232,0.75)';
    for (const [dx, dy, r] of [[-9, -6, 3.2], [7, 9, 2.4], [-4, 12, 2]]) { c.beginPath(); c.ellipse(MX + dx * MS, hy + dy * MS, r * MS, r * MS * 0.7, 0.4, 0, 7); c.fill(); }
    c.restore();
    if (heal > 0) { c.save(); c.globalAlpha = heal; kneel(c, MX, MY - hop, MS, { ...base, robe: CL.saffron, stripe: CL.rust, expr: 'laugh', arms: 'cheer', bounce: 0 }); c.restore(); }
    // a gentle glowing ring on the man once the way is clear
    if (clear && s.goT < 0) { const p = (t * 1.6) % 1; c.strokeStyle = `rgba(255,236,150,${0.9 * (1 - p)})`; c.lineWidth = 4; c.beginPath(); c.arc(MX, MY - 44 * MS, 30 + p * 30, 0, 7); c.stroke();
      const gl = c.createRadialGradient(MX, MY - 44 * MS, 6, MX, MY - 44 * MS, 70); gl.addColorStop(0, 'rgba(255,240,170,0.35)'); gl.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gl; c.fillRect(MX - 70, MY - 44 * MS - 70, 140, 140); }
    // the touch: a burst of warm light where Jesus's hand meets the man
    if (heal > 0 && heal < 1) { const r = 20 + heal * 90, gl = c.createRadialGradient(MX - 24, MY - 60, 2, MX - 24, MY - 60, r); gl.addColorStop(0, `rgba(255,250,220,${0.9 * (1 - heal)})`); gl.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = gl; c.fillRect(MX - 24 - r, MY - 60 - r, r * 2, r * 2); }
    // the nervous people still in the way (front row), with sideways arrows under their feet
    for (const p of here.sort((a, b) => a.y - b.y)) {
      const px = p.x + p.ox, jig = Math.max(0, 1 - (t - p.nudgeT) / 0.3) * Math.sin(t * 40) * 3, lean = -0.06;
      const pu = 0.5 + 0.5 * Math.sin(t * 5 + p.ph);
      c.save(); c.globalAlpha = 0.45 + 0.35 * pu; c.fillStyle = '#fff6d0'; c.strokeStyle = 'rgba(90,60,30,0.6)'; c.lineWidth = 1.5;
      for (const sd of [-1, 1]) { const ax = px + sd * (30 + pu * 6); c.beginPath(); c.moveTo(ax + sd * 14, p.y - 2); c.lineTo(ax, p.y - 13); c.lineTo(ax, p.y + 9); c.closePath(); c.fill(); c.stroke(); }
      c.restore();
      c.save(); c.translate(px + jig, p.y); c.rotate(lean); P.person(c, 0, 0, 1.35, { ...p.look, t, phase: p.ph, bounce: 0.6, expr: 'surprised', arms: 'pray', facing: -1 }); c.restore();
      // a little nervous sweat drop
      const dq = (t * 1.2 + p.ph) % 1; c.fillStyle = `rgba(160,210,250,${0.9 * (1 - dq)})`; c.beginPath(); c.ellipse(px + 19, p.y - 108 + dq * 10, 2.4, 3.4, 0, 0, 7); c.fill();
    }
    if (won) { c.fillStyle = '#ff7a9a'; for (let i = 0; i < 4; i++) { const q = ((t - s.touchT) * 0.9 + i * 0.25) % 1; c.save(); c.globalAlpha = 1 - q; heart(c, MX - 30 + i * 20, MY - 110 - q * 60, 5 + i % 2 * 2); c.restore(); } }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
