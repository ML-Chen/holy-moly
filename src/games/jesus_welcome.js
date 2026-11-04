// WELCOME! — Mark 10:13–16. The disciples try to send the children away; tap the grumpy grown-ups aside so the children can run to Jesus.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const JX = 180, JY = 396; // Jesus at the far end of the path
const KIDS = [
  { skin: SK[1], robe: CL.saffron, stripe: CL.rust, hairStyle: 'curly', hair: HR[0] },
  { skin: SK[3], robe: CL.rose, stripe: CL.white, hairStyle: 'long', hair: HR[3] },
  { skin: SK[0], robe: CL.sky, stripe: CL.white, hair: HR[2] },
  { skin: SK[2], robe: CL.green, stripe: CL.cream, hairStyle: 'bun', hair: HR[1] },
];
const GROWNUPS = [
  { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly' },          // Peter
  { skin: SK[1], robe: CL.terracotta, stripe: CL.cream, beard: true, hair: HR[2] },
  { skin: SK[3], robe: CL.indigo, stripe: CL.gold, beard: true, hair: HR[0], head: 'wrap', headCol: CL.cream },
  { skin: SK[0], robe: CL.olive, stripe: CL.sand, beard: true, hair: HR[5], hairStyle: 'bald' },
  { skin: SK[2], robe: CL.plum, stripe: CL.gold, beard: true, hair: HR[1] },
];
// spots across the path, nearest last
const BLOCK = [[180, 470], [126, 520], [236, 516], [180, 562], [104, 456]];

function bunting(c, x0, y0, x1, y1, sag, t, cols) {
  c.strokeStyle = 'rgba(90,60,50,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag, x1, y1); c.stroke();
  const n = 9; for (let i = 1; i < n; i++) { const q = i / n, x = x0 + (x1 - x0) * q, y = (1 - q) * (1 - q) * y0 + 2 * q * (1 - q) * ((y0 + y1) / 2 + sag) + q * q * y1; const sw = Math.sin(t * 3 + i) * 1.5;
    c.fillStyle = cols[i % cols.length]; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 6, y); c.lineTo(x + sw, y + 13); c.closePath(); c.fill(); }
}

MG.add({
  id: 'welcome', stage: 'jesus', cmd: 'WELCOME!', hint: 'tap', time: 5, mood: 'party', winText: 'Hug!',
  card: { title: 'Let the children come', ref: 'Mark 10:13–16', kind: 'Story', text: 'Parents brought their children to Jesus so he could bless them, but the disciples told them to go away. Jesus was upset with his friends and said, "Let the children come to me." Then he took the children in his arms and blessed them.', ask: 'Jesus made time for children. Who makes time for you, and who could you make time for?' },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    s.gu = BLOCK.slice(0, n).map(([x, y], i) => ({ x, y, hx: x, sc: 0.95 + (y - 450) / 120 * 0.2, look: GROWNUPS[i], moved: false, movT: 0, side: x < 180 ? -1 : x > 180 ? 1 : (Math.random() < 0.5 ? -1 : 1), phase: Math.random() * 6 }));
    s.kids = KIDS.slice(0, [3, 3, 4][g.level]).map((k, i, a) => ({ look: k, x0: 180 + (i - (a.length - 1) / 2) * 48, y0: 612 + (i % 2) * 6, phase: i * 1.3 }));
    s.clearT = -1; s.sway = g.level === 2 ? 1 : 0; s.puffs = [];
  },
  down(g, x, y) {
    const s = g.s; if (s.clearT >= 0) return;
    let best = null, bd = 9e9; for (const p of s.gu) { if (p.moved) continue; const px = gx(s, p, g.t); if (Math.abs(x - px) < 30 * p.sc && y < p.y + 8 && y > p.y - 78 * p.sc) { const d = Math.abs(y - (p.y - 34 * p.sc)); if (d < bd || p.y > best.y) { bd = d; best = p; } } }
    if (best) {
      best.moved = true; best.movT = g.t; best.fromX = gx(s, best, g.t); g.sfx('boing'); g.burst(best.fromX, best.y - 40 * best.sc, ['#fff6c0', '#ffd45a', '#ffffff'], 10, 140);
      if (s.gu.every(p => p.moved)) { s.clearT = g.t; g.sfx('cheer'); }
    } else { s.puffs.push({ x, y, t: g.t }); g.sfx('tap'); }
  },
  update(g, dt) {
    const s = g.s;
    if (s.clearT >= 0 && !g.done && g.t - s.clearT > 0.42) { g.sfx('laugh'); g.burst(JX, JY - 50, ['#ff8aa8', '#ffd45a', '#ffffff', '#a8e08a'], 28, 220); g.win(); }
  },
  auto(g, dt, synth) { const s = g.s; if (g.t < 0.4 || g.t - (s.botT || 0) < 0.28) return; const p = s.gu.filter(q => !q.moved).sort((a, b) => b.y - a.y)[0]; if (!p) return; s.botT = g.t; const x = gx(s, p, g.t), y = p.y - 34 * p.sc; synth('down', x, y); synth('up', x, y); },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', clear = s.clearT >= 0;
    c.drawImage(g.bake('jesus_welcome_bg', o => {
      P.sky(o, W, H, ['#e89a88', '#f6bc98', '#ffdcb0', '#fff0d0'], { x: 180, y: 236, r: 30, color: '#fff0c0', glow: 280 });
      P.cloud(o, 70, 96, 0.75, '#fff4ea', '#e8a8a8', 0.9); P.cloud(o, 300, 140, 0.5, '#fff4ea', '#e8a8a8', 0.85);
      P.hills(o, W, 268, 30, '#d6a890', '#c49080', { seed: 71, freq: 0.012, dabs: 20, bottom: 360 });
      P.rays(o, 180, 236, W, H, '#fff4d0', 0.16, 11, 0);
      // far gate and wall at the back of the square
      o.fillStyle = '#e4bc8a'; o.fillRect(96, 300, 168, 40); o.fillStyle = '#d0a070'; o.fillRect(92, 296, 176, 6);
      P.palm(o, 120, 312, 0.55, 0.14, 0, '#4f8a4a'); P.palm(o, 236, 314, 0.5, -0.12, 0, '#4a8a52');
      // tall houses framing the square on both sides, nearer ones bigger
      P.house(o, -20, 344, 76, 108, '#f0cfa0', { awning: CL.teal }); P.house(o, 48, 336, 56, 70, '#e8c090');
      P.house(o, 258, 336, 56, 72, '#ecc898', { window: false }); P.house(o, 304, 344, 80, 112, '#f2d4a8', { awning: CL.rose });
      // rooftop details: pots and a drying rug
      o.fillStyle = '#c86a44'; o.beginPath(); o.arc(10, 230, 6, Math.PI, 0); o.fill(); o.fillStyle = CL.indigo; o.fillRect(318, 232, 30, 16); o.fillStyle = CL.gold; o.fillRect(318, 238, 30, 3);
      // the square: warm packed earth
      const gr = o.createLinearGradient(0, 330, 0, 640); gr.addColorStop(0, '#ecd09a'); gr.addColorStop(1, '#d4a46a'); o.fillStyle = gr; o.fillRect(0, 334, W, 306);
      const r = P.rng(21); for (let i = 0; i < 60; i++) { o.fillStyle = r() < 0.5 ? 'rgba(255,246,220,0.32)' : 'rgba(150,100,60,0.14)'; o.beginPath(); o.ellipse(r() * W, 340 + r() * 300, 5 + r() * 14, 1.5 + r() * 3, 0, 0, 7); o.fill(); }
      // the path of stepping stones from the children to Jesus
      for (let i = 0; i < 9; i++) { const q = i / 8, y = 410 + q * 214, w = 16 + q * 18, x = 180 + Math.sin(i * 1.7) * 6; o.fillStyle = 'rgba(90,60,40,0.18)'; o.beginPath(); o.ellipse(x + 1, y + 2, w, w * 0.32, 0, 0, 7); o.fill(); const sg = o.createLinearGradient(0, y - w * 0.3, 0, y + w * 0.3); sg.addColorStop(0, '#fbebcc'); sg.addColorStop(1, '#d6b688'); o.fillStyle = sg; o.beginPath(); o.ellipse(x, y, w, w * 0.3, 0, 0, 7); o.fill(); }
      // a big shady fig tree behind Jesus, and flower pots
      P.tree(o, 250, 380, 0.95, '#6f9a52', 11);
      P.grassTufts(o, W, 560, 640, 26, '#8a9a4a', 7); P.flowers(o, W, 570, 640, 14, undefined, 22);
      for (const [x, y] of [[28, 470], [334, 470]]) { o.fillStyle = '#c86a44'; o.beginPath(); o.moveTo(x - 12, y - 18); o.lineTo(x + 12, y - 18); o.lineTo(x + 8, y); o.lineTo(x - 8, y); o.closePath(); o.fill(); P.flowers(o, 0, 0, 0, 0); o.save(); o.translate(x - 12, y - 34); P.flowers(o, 24, 0, 14, 8, ['#ee6c8a', '#f4d35e', '#ffffff'], x); o.restore(); }
    }), 0, 0, W, H);
    // a kite flown from a rooftop, and doves circling over the square
    const kx = 262 + Math.sin(t * 1.1) * 14, ky = 120 + Math.sin(t * 1.7) * 8, kr = Math.sin(t * 1.3) * 0.15;
    c.strokeStyle = 'rgba(90,60,60,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(kx, ky + 22); c.quadraticCurveTo(kx + 30, ky + 90, 340, 232); c.stroke();
    c.save(); c.translate(kx, ky); c.rotate(kr); const kg = c.createLinearGradient(-16, -22, 16, 22); kg.addColorStop(0, '#ffd45a'); kg.addColorStop(1, '#e8703a'); c.fillStyle = kg; c.strokeStyle = '#8a3a2a'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, -24); c.lineTo(17, 0); c.lineTo(0, 24); c.lineTo(-17, 0); c.closePath(); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(0, -24); c.lineTo(17, 0); c.lineTo(0, 0); c.closePath(); c.fill();
    c.strokeStyle = '#8a3a2a'; c.beginPath(); c.moveTo(0, 24); for (let k = 1; k <= 6; k++) c.lineTo(Math.sin(t * 4 + k) * 6, 24 + k * 8); c.stroke(); c.fillStyle = '#e07a8a'; for (let k = 2; k <= 6; k += 2) { const bx = Math.sin(t * 4 + k) * 6, by = 24 + k * 8; c.beginPath(); c.moveTo(bx - 4, by - 3); c.lineTo(bx + 4, by + 3); c.lineTo(bx + 4, by - 3); c.lineTo(bx - 4, by + 3); c.closePath(); c.fill(); } c.restore();
    for (let i = 0; i < 2; i++) { const a = t * 0.9 + i * 3.1; P.dove(c, 110 + Math.cos(a) * 60, 170 + Math.sin(a) * 26, 0.55, { t: t + i, facing: Math.sin(a) > 0 ? -1 : 1 }); }
    bunting(c, 20, 232, 190, 290, 30, t, ['#e8a33a', '#e07a8a', '#6aa9d8', '#4f9a5a', '#fbf7ee']);
    bunting(c, 170, 290, 340, 234, 30, t + 1, ['#6aa9d8', '#e8a33a', '#8a4d7a', '#e07a8a', '#fbf7ee']);
    // warm light around Jesus, stronger once the path is clear
    const jk = clear ? 1 : 0.5 + 0.15 * Math.sin(t * 3); const jg = c.createRadialGradient(JX, JY - 40, 6, JX, JY - 40, 110); jg.addColorStop(0, `rgba(255,240,180,${0.5 * jk})`); jg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = jg; c.beginPath(); c.arc(JX, JY - 40, 110, 0, 7); c.fill();
    const items = [];
    items.push({ y: JY, f: () => P.person(c, JX, JY, 1.32, { ...JESUS, t, bounce: won ? 2 : 0.8, expr: won ? 'laugh' : 'happy', arms: won ? 'hold' : 'out' }) });
    // children: wait hopefully at the bottom, then run up the path
    s.kids.forEach((k, i) => {
      const run = clear ? Math.min(1, (t - s.clearT) / 0.42) : 0, e = run * run * (3 - 2 * run);
      const tx = JX + (i - (s.kids.length - 1) / 2) * 30, ty = JY + 22 + (i % 2) * 8;
      const x = k.x0 + (tx - k.x0) * e, y = k.y0 + (ty - k.y0) * e - Math.abs(Math.sin(run * Math.PI * 3)) * 10 * (1 - e * 0.5);
      items.push({ y, f: () => P.person(c, x, y, 1.08 - e * 0.18, { ...k.look, child: true, t, phase: k.phase, bounce: clear ? 3 : 1.6, expr: clear ? 'laugh' : 'wow', arms: clear ? 'cheer' : (i % 2 ? 'wave' : 'reach'), facing: i % 2 ? -1 : 1 }) });
    });
    // grumpy grown-ups blocking the path; tapped ones hop aside, embarrassed, and smile
    for (const p of s.gu) {
      const mq = p.moved ? Math.min(1, (t - p.movT) / 0.3) : 0, x = p.moved ? p.fromX + p.side * (110 - Math.abs(p.fromX - 180) * 0.6) * (mq * (2 - mq)) : gx(s, p, t), y = p.y - Math.sin(mq * Math.PI) * 24;
      items.push({ y: p.y, f: () => {
        if (!p.moved) { const pu = 0.5 + 0.5 * Math.sin(t * 6 + p.phase); c.strokeStyle = `rgba(255,255,255,${0.35 + 0.35 * pu})`; c.lineWidth = 2.5; c.beginPath(); c.ellipse(x, p.y, 24 * p.sc + pu * 3, 7 * p.sc + pu, 0, 0, 7); c.stroke(); }
        c.save(); if (p.moved && mq < 1) { c.translate(x, y); c.rotate(p.side * Math.sin(mq * Math.PI) * 0.4); c.translate(-x, -y); }
        P.person(c, x, y, 1.12 * p.sc, { ...p.look, t, phase: p.phase, bounce: p.moved ? 1.4 : 0.6, facing: p.moved ? -p.side : 1, expr: p.moved ? (mq < 1 ? 'surprised' : 'happy') : 'grumpy', arms: p.moved ? (won ? 'cheer' : 'down') : 'out' });
        c.restore();
        if (!p.moved) { c.save(); c.globalAlpha = 0.85; c.fillStyle = '#5a3040'; const hx = x + 6, hy = p.y - 98 * p.sc + Math.sin(t * 8 + p.phase) * 1.5; c.font = '900 15px Fredoka, sans-serif'; c.textAlign = 'center'; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(hx - 10 + k * 8, hy - Math.abs(Math.sin(t * 10 + k)) * 3, 2.2, 0, 7); c.fill(); } c.restore(); }
      } });
    }
    items.sort((a, b) => a.y - b.y).forEach(it => it.f());
    for (const p of s.puffs) { const q = (t - p.t) / 0.4; if (q > 1) continue; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 8 + q * 16, 0, 7); c.stroke(); }
    if (won) { const q = t - g.doneAt; c.save(); c.globalAlpha = Math.min(1, q * 4); c.fillStyle = '#ff7a9a'; for (let i = 0; i < 4; i++) heart(c, JX - 45 + i * 30, JY - 100 - ((q * 50 + i * 13) % 60), 6.5); c.restore(); }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});
function gx(s, p, t) { return p.hx + (s.sway ? Math.sin(t * 2.4 + p.phase) * 16 : Math.sin(t * 1.4 + p.phase) * 3); }
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
