// DYE! — Acts 16:13–15. Lydia sells purple cloth in Philippi. Drag a plain length of cloth from the pile into the
// bubbling purple vat, then drag the dyed cloth up onto the drying line. When every cloth hangs, the people Lydia met
// by the river come walking up to her open door: she welcomes them all into her home.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const LYDIA = { skin: SK[1], robe: CL.plum, stripe: CL.gold, hairStyle: 'long', hair: HR[0] };
const PILE = { x: 66, y: 548 }, VAT = { x: 186, y: 520, rx: 66, ry: 20 };
const LINE = { x0: 26, x1: 334, y: 236, sag: 26 };
const DOOR = { x: 300, y: 416 };
const SHADES = ['#7a2a8a', '#5a2a8e', '#9a2a7a', '#6a3aa8', '#8a3a9a'];
const RAW = '#f4ead6';
const lineY = x => { const u = (x - LINE.x0) / (LINE.x1 - LINE.x0); return LINE.y + 4 * u * (1 - u) * LINE.sag; };
const GUESTS = [
  { skin: SK[2], robe: CL.indigo, stripe: CL.cream, beard: true, hair: HR[0], hairStyle: 'short' },          // Paul
  { skin: SK[0], robe: CL.teal, stripe: CL.sand, hairStyle: 'long', hair: HR[2] },
  { skin: SK[3], robe: CL.rust, stripe: CL.cream, hairStyle: 'curly', hair: HR[1] },
  { skin: SK[1], robe: CL.rose, stripe: CL.white, hairStyle: 'curly', hair: HR[0], child: true },
  { skin: SK[2], robe: CL.saffron, stripe: CL.rust, hair: HR[5], head: 'scarf', headCol: CL.sand },
];

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
// a length of cloth hanging from its top edge (x, y is the middle of the top edge); dye 0..1 tints it
function hanging(c, x, y, w, h, col, dye, t, ph = 0, wet = 0) {
  const base = P.mix(RAW, col, dye), sw = Math.sin(t * 2.4 + ph) * 3;
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(40,20,40,0.16)'; c.beginPath(); c.moveTo(-w / 2 + 4, 4); c.lineTo(w / 2 + 4, 4); c.lineTo(w / 2 + 6 + sw, h + 6); c.lineTo(-w / 2 + 6 + sw, h + 6); c.closePath(); c.fill();
  const path = () => { c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(w / 2, 0); c.quadraticCurveTo(w / 2 + sw * 0.5, h * 0.5, w / 2 + sw, h); for (let k = 4; k >= 0; k--) c.lineTo(-w / 2 + sw + w * k / 4, h + (k % 2 ? 4 : 0)); c.quadraticCurveTo(-w / 2 + sw * 0.5, h * 0.5, -w / 2, 0); c.closePath(); };
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, P.shade(base, 0.16)); g.addColorStop(0.5, base); g.addColorStop(1, P.shade(base, -0.16)); c.fillStyle = g; path(); c.fill();
  c.save(); path(); c.clip();
  // soft folds, and a woven border near the hem
  for (const fx of [-0.25, 0.08, 0.3]) { const fg = c.createLinearGradient(fx * w - 5, 0, fx * w + 5, 0); fg.addColorStop(0, P.rgba(P.shade(base, -0.3), 0)); fg.addColorStop(0.5, P.rgba(P.shade(base, -0.3), 0.35)); fg.addColorStop(1, P.rgba(P.shade(base, -0.3), 0)); c.fillStyle = fg; c.fillRect(fx * w - 5, 0, 10 + sw, h + 6); }
  c.fillStyle = P.rgba(dye > 0.5 ? '#f2c14a' : '#c8a878', 0.75); c.fillRect(-w, h - 12, w * 2, 2.5); c.fillRect(-w, h - 7, w * 2, 1.4);
  if (dye > 0.5) { c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-w / 2 + 3, 2, 3, h - 8); }
  c.restore();
  c.strokeStyle = P.shade(base, -0.45); c.lineWidth = 1.3; path(); c.stroke();
  // drips while it is still wet
  if (wet > 0) for (let i = 0; i < 3; i++) { const q = (t * 1.6 + i * 0.33 + ph) % 1; c.fillStyle = P.rgba(col, wet * (1 - q)); c.beginPath(); c.ellipse(-w / 3 + i * w / 3 + sw, h + 6 + q * 30, 2, 3, 0, 0, 7); c.fill(); }
  c.restore();
}
function peg(c, x, y) { c.fillStyle = '#a8784a'; c.strokeStyle = '#5a3a24'; c.lineWidth = 1; c.beginPath(); c.roundRect ? c.roundRect(x - 2.5, y - 5, 5, 11, 2) : c.rect(x - 2.5, y - 5, 5, 11); c.fill(); c.stroke(); }
function folded(c, x, y, s, col) { // a folded bolt of cloth on the pile
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createLinearGradient(0, -10, 0, 10); g.addColorStop(0, P.shade(col, 0.12)); g.addColorStop(1, P.shade(col, -0.12)); c.fillStyle = g; c.strokeStyle = P.shade(col, -0.4); c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-28, -8); c.quadraticCurveTo(0, -12, 28, -8); c.quadraticCurveTo(33, 0, 28, 8); c.quadraticCurveTo(0, 11, -28, 8); c.quadraticCurveTo(-33, 0, -28, -8); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = P.rgba(P.shade(col, -0.35), 0.45); c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(0, 3, 26, 0); c.stroke();
  c.restore();
}
function paintBg(o) {
  P.sky(o, W, H, ['#4f8fd8', '#94c4ec', '#ffe6c4', '#ffd2a8'], { x: 70, y: 120, r: 24, color: '#fff2c0', glow: 230 });
  P.cloud(o, 260, 90, 0.75, '#fffaf0', '#e0c8dc', 0.9); P.cloud(o, 120, 180, 0.45, '#fffaf0', '#e0c8dc', 0.75);
  P.hills(o, W, 300, 46, '#a8b4d8', '#9aa6cc', { seed: 71, freq: 0.01, dabs: 12, bottom: 400 });
  // Philippi on its hill: pale walls, a columned front
  for (const [x, y, w, h, col] of [[24, 312, 30, 24, '#f2e4cc'], [52, 306, 26, 30, '#ecdcc0'], [104, 310, 34, 22, '#f2e4cc']]) P.house(o, x, y, w, h, col, { window: false });
  o.fillStyle = '#f6eee0'; o.fillRect(140, 282, 54, 26); o.beginPath(); o.moveTo(136, 284); o.lineTo(167, 266); o.lineTo(198, 284); o.closePath(); o.fill();
  o.fillStyle = 'rgba(180,150,120,0.5)'; for (let i = 0; i < 6; i++) o.fillRect(144 + i * 9, 288, 3, 20);
  P.hills(o, W, 338, 18, '#9cc07a', '#86aa66', { seed: 73, freq: 0.016, dabs: 30, bottom: 400, rim: '#e8f4b0' });
  // the river where the women met to pray, with willows on the bank
  P.water(o, W, 346, 376, '#3f86a8', '#9ad4dc', 0, { waves: 3 });
  for (const [x, s] of [[30, 0.5], [130, 0.42], [220, 0.46]]) P.tree(o, x, 352, s, '#7aa45a', x);
  // Lydia's courtyard: warm flagstones
  const g = o.createLinearGradient(0, 372, 0, H); g.addColorStop(0, '#e8cfa4'); g.addColorStop(1, '#c89a68'); o.fillStyle = g; o.fillRect(0, 372, W, H - 372);
  o.strokeStyle = 'rgba(140,96,60,0.3)'; o.lineWidth = 1.2; const r = P.rng(13);
  for (let row = 0, y = 380; y < H; row++, y += 18 + row * 3) { o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); for (let x = (row % 2) * 20; x < W; x += 34 + row * 4) { o.beginPath(); o.moveTo(x, y); o.lineTo(x - 2, y + 18 + row * 3); o.stroke(); if (r() < 0.35) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff4dc' : '#a87a4a', 0.2); o.fillRect(x + 2, y + 2, 26, 14 + row * 2); } } }
  // Lydia's house on the right, with a wide welcoming door and a purple awning
  P.house(o, 238, 424, 122, 106, '#f2dcb4', { window: true, door: '#5a3420' });
  o.fillStyle = '#6a2a7a'; o.beginPath(); o.moveTo(244, 330); o.lineTo(360, 330); o.lineTo(360, 344); o.lineTo(244, 344); o.closePath(); o.fill();
  o.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 8; i++) o.fillRect(248 + i * 14, 330, 6, 14);
  for (let i = 0; i < 9; i++) { o.fillStyle = '#6a2a7a'; o.beginPath(); o.arc(250 + i * 13, 344, 6.5, 0, Math.PI); o.fill(); }
  // big clay pots and a lemon tree in a planter
  for (const [x, y, s] of [[226, 430, 1], [352, 470, 0.8]]) { o.fillStyle = 'rgba(40,20,30,0.2)'; o.beginPath(); o.ellipse(x + 3, y + 2, 14 * s, 4 * s, 0, 0, 7); o.fill(); const pg = o.createLinearGradient(x - 14 * s, 0, x + 14 * s, 0); pg.addColorStop(0, '#e08a5a'); pg.addColorStop(1, '#9a4a2a'); o.fillStyle = pg; o.beginPath(); o.moveTo(x - 7 * s, y - 34 * s); o.quadraticCurveTo(x - 18 * s, y - 18 * s, x - 9 * s, y); o.lineTo(x + 9 * s, y); o.quadraticCurveTo(x + 18 * s, y - 18 * s, x + 7 * s, y - 34 * s); o.closePath(); o.fill(); o.fillStyle = '#b8603a'; o.fillRect(x - 9 * s, y - 37 * s, 18 * s, 4 * s); }
  P.tree(o, 26, 444, 0.55, '#6aa04a', 21); o.fillStyle = '#f4d35e'; const fr = P.rng(4); for (let i = 0; i < 8; i++) { o.beginPath(); o.arc(26 + (fr() - 0.5) * 50, 400 - fr() * 24, 3, 0, 7); o.fill(); }
  // the drying line on two posts
  for (const x of [LINE.x0, LINE.x1]) { o.fillStyle = '#7a5434'; o.fillRect(x - 3, LINE.y - 8, 6, 420 - LINE.y); o.fillStyle = '#a8784a'; o.fillRect(x - 3, LINE.y - 8, 2, 420 - LINE.y); }
  o.strokeStyle = '#5a3a24'; o.lineWidth = 1.6; o.beginPath(); for (let x = LINE.x0; x <= LINE.x1; x += 6) o.lineTo(x, lineY(x)); o.stroke();
  P.flowers(o, W, 600, 640, 10, ['#ffffff', '#f4d35e', '#b98ae0'], 5);
}
function paintVat(o) {
  // a round stone dye vat: rim, body, and a little fire glow under its spout
  const { x, y, rx, ry } = VAT;
  o.fillStyle = 'rgba(40,20,30,0.28)'; o.beginPath(); o.ellipse(x + 6, y + 64, rx + 12, 14, 0, 0, 7); o.fill();
  const bg = o.createLinearGradient(x - rx, 0, x + rx, 0); bg.addColorStop(0, '#d8c4a8'); bg.addColorStop(0.5, '#b8a08a'); bg.addColorStop(1, '#8a7464'); o.fillStyle = bg;
  o.beginPath(); o.moveTo(x - rx, y); o.lineTo(x - rx + 6, y + 58); o.quadraticCurveTo(x, y + 72, x + rx - 6, y + 58); o.lineTo(x + rx, y); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(90,70,60,0.35)'; o.lineWidth = 1.2; for (const dy of [18, 38]) { o.beginPath(); o.moveTo(x - rx + 2, y + dy); o.quadraticCurveTo(x, y + dy + 12, x + rx - 2, y + dy); o.stroke(); }
  // purple drips down the side
  o.fillStyle = 'rgba(110,40,130,0.55)'; for (const dx of [-40, -12, 26, 48]) { o.beginPath(); o.moveTo(x + dx - 4, y + 4); o.quadraticCurveTo(x + dx - 3, y + 22 + Math.abs(dx) % 14, x + dx, y + 26 + Math.abs(dx) % 14); o.quadraticCurveTo(x + dx + 3, y + 22, x + dx + 4, y + 4); o.fill(); }
  o.fillStyle = '#c8b498'; o.beginPath(); o.ellipse(x, y, rx + 6, ry + 6, 0, 0, 7); o.fill();
  o.fillStyle = '#e8d8c0'; o.beginPath(); o.ellipse(x, y - 2, rx + 4, ry + 4, 0, Math.PI, 0); o.fill();
}

MG.add({
  id: 'dye', stage: 'acts', cmd: 'DYE!', hint: 'drag', time: 7, mood: 'party', winText: 'Welcome!',
  card: {
    title: 'Lydia opens her door', ref: 'Acts 16:11–15', kind: 'Acts story',
    text: 'The book of Acts tells how Paul and his friends went to a river outside the city of Philippi, where some women met to pray. One of them was Lydia, a businesswoman who sold expensive purple cloth. She listened to Paul and was baptized, and then she invited them all to stay in her home.',
    ask: 'Lydia opened her home to visitors. How could your family help a guest feel welcome?',
  },
  init(g) {
    const s = g.s, n = [2, 3, 4][g.level];
    const step = (LINE.x1 - LINE.x0 - 40) / n;
    s.slots = Array.from({ length: n }, (_, i) => LINE.x0 + 20 + step * (i + 0.5));
    s.cloths = Array.from({ length: n }, (_, i) => ({ state: 'pile', col: SHADES[(i + Math.floor(Math.random() * 5)) % SHADES.length], dye: 0, hungT: 0, ph: Math.random() * 6, slot: -1 }));
    s.vat = null; s.held = null; s.back = []; s.drops = []; s.bubbles = Array.from({ length: 8 }, (_, i) => ({ dx: (Math.random() - 0.5) * 100, ph: Math.random() * 6, sp: 1 + Math.random() }));
    s.soak = 0.35 / Math.sqrt(g.speed); s.hung = 0; s.splashT = -9;
  },
  down(g, x, y) {
    const s = g.s; if (s.held) return;
    const v = s.vat;
    if (v && g.t - v.t >= s.soak && Math.hypot(x - VAT.x, (y - VAT.y + 20) * 1.4) < 80) { s.held = { c: v.c, x, y }; s.vat = null; g.sfx('slurp'); return; }
    if (!s.vat && Math.hypot(x - PILE.x, y - PILE.y + 12) < 62) { const c = s.cloths.find(q => q.state === 'pile'); if (c) { c.state = 'held'; s.held = { c, x, y }; g.sfx('rustle'); } }
  },
  move(g, x, y) { const h = g.s.held; if (h) { h.x = x; h.y = y; } },
  up(g, x, y) {
    const s = g.s, h = s.held; if (!h) return; s.held = null; const c = h.c;
    if (c.dye < 1) {
      if (Math.hypot(h.x - VAT.x, (h.y - VAT.y + 10) * 1.3) < 96) {
        s.vat = { c, t: g.t }; c.state = 'vat'; s.splashT = g.t; g.sfx('splash'); g.sfx('bubble'); g.shake(2, 0.15);
        for (let i = 0; i < 14; i++) s.drops.push({ x: VAT.x + (Math.random() - 0.5) * 60, y: VAT.y - 4, vx: (Math.random() - 0.5) * 180, vy: -140 - Math.random() * 160, t: g.t });
        return;
      }
      c.state = 'pile'; s.back.push({ c, x: h.x, y: h.y, tx: PILE.x, ty: PILE.y - 30, t: g.t }); g.sfx('swoosh'); return;
    }
    // a dyed cloth: hang it in the nearest empty place on the line
    let bi = -1, bd = 110; s.slots.forEach((sx, i) => { if (s.cloths.some(q => q.slot === i)) return; const d = Math.hypot(h.x - sx, h.y - lineY(sx) - 30); if (d < bd) { bd = d; bi = i; } });
    if (bi >= 0) {
      c.state = 'hung'; c.slot = bi; c.hungT = g.t; s.hung++; g.sfx('snap'); g.sfx('chime'); g.burst(s.slots[bi], lineY(s.slots[bi]) + 30, ['#d8a0ff', '#ffd45a', '#ffffff', '#ff9ad8'], 14, 150);
      if (s.hung >= s.cloths.length) { g.win(); g.sfx('cheer'); g.sfx('bell'); g.burst(DOOR.x, DOOR.y - 50, ['#d8a0ff', '#ffd45a', '#fff6c0', '#ff9ab8'], 28, 220); }
      return;
    }
    s.vat = { c, t: g.t - s.soak }; c.state = 'vat'; s.back.push({ c, x: h.x, y: h.y, tx: VAT.x, ty: VAT.y - 20, t: g.t, ghost: true }); g.sfx('swoosh');
  },
  update(g, dt) {
    const s = g.s;
    if (s.vat) { const k = Math.min(1, (g.t - s.vat.t) / s.soak); s.vat.c.dye = Math.max(s.vat.c.dye, k); if (k >= 1 && !s.vat.ding) { s.vat.ding = true; g.sfx('ding'); } }
    for (const d of s.drops) { d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 600 * dt; }
    s.drops = s.drops.filter(d => g.t - d.t < 0.8); s.back = s.back.filter(b => g.t - b.t < 0.3);
  },
  auto(g, dt, synth) { // pile → vat → line, one cloth at a time
    const s = g.s; if (g.t < 0.35 || g.done) return; const k = Math.floor((g.t - 0.35) / 0.14); if (k === s.botK) return; s.botK = k;
    if (s.held) { if (s.held.c.dye < 1) synth('up', VAT.x, VAT.y - 10); else { const i = s.slots.findIndex((sx, j) => !s.cloths.some(q => q.slot === j)); synth('up', s.slots[i], lineY(s.slots[i]) + 30); } return; }
    if (s.vat) { if (g.t - s.vat.t >= s.soak) { synth('down', VAT.x, VAT.y - 20); synth('move', 180, 300); } return; }
    if (s.cloths.some(q => q.state === 'pile')) { synth('down', PILE.x, PILE.y - 10); synth('move', VAT.x, VAT.y - 10); }
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', lost = g.result === 'fail', pu = 0.5 + 0.5 * Math.sin(t * 6), since = won ? t - g.doneAt : 0;
    c.drawImage(g.bake('acts_dye_bg', paintBg), 0, 0, W, H);
    P.rays(c, 70, 120, W, H * 0.5, '#fff4d0', 0.1, 9, t);
    for (let i = 0; i < 2; i++) { const bx = 120 + i * 140 + Math.sin(t * 0.6 + i * 2) * 40, by = 150 + i * 30, f = Math.sin(t * 9 + i * 2) * 4; c.strokeStyle = 'rgba(80,60,90,0.6)'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 7, by - f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 7, by - f); c.stroke(); }
    // the door glows and swings open as the work is finished
    const open = won ? Math.min(1, since * 3) : 0;
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, DOOR.x, DOOR.y - 30, 50 + open * 40, '#ffd890', 0.15 + open * 0.5); c.restore();
    if (open > 0) { c.fillStyle = '#ffe2a0'; c.beginPath(); c.moveTo(DOOR.x - 8, DOOR.y + 8); c.lineTo(DOOR.x - 8, DOOR.y - 36); c.arc(DOOR.x, DOOR.y - 36, 8, Math.PI, 0); c.lineTo(DOOR.x + 8, DOOR.y + 8); c.fill(); }
    // empty places on the line, waiting (they glow while a dyed cloth is carried)
    const carrying = s.held && s.held.c.dye >= 1;
    s.slots.forEach((sx, i) => { if (s.cloths.some(q => q.slot === i)) return; const sy = lineY(sx); peg(c, sx - 14, sy); peg(c, sx + 14, sy);
      if (carrying || (s.vat && t - s.vat.t >= s.soak)) { c.save(); c.globalAlpha = 0.35 + 0.4 * pu; c.strokeStyle = '#fff6d0'; c.lineWidth = 2.2; c.setLineDash([5, 4]); c.strokeRect(sx - 20, sy + 2, 40, 58); c.restore(); } });
    // hung cloths, flapping in the breeze
    for (const q of s.cloths) if (q.state === 'hung') { const sx = s.slots[q.slot], sy = lineY(sx), pop = Math.max(0, 1 - (t - q.hungT) / 0.3); hanging(c, sx, sy, 42 + pop * 6, 66 + pop * 8, q.col, 1, t, q.ph, Math.max(0, 1 - (t - q.hungT) / 1.5)); peg(c, sx - 14, sy); peg(c, sx + 14, sy); }
    // the friends from the river: Paul talking with the women by the water, then all walking up to Lydia's door
    GUESTS.forEach((o, i) => {
      const q = won ? Math.max(0, Math.min(1, (since - i * 0.06) * 1.8)) : 0, e = q * q * (3 - 2 * q);
      const x0 = 70 + i * 34, y0 = 392 + (i % 2) * 5, x1 = 178 + i * 27, y1 = 446 + (i % 2) * 12;
      const x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e - (won ? Math.abs(Math.sin(t * 9 + i)) * 3 * q : 0), sc = 0.5 + 0.3 * e;
      P.person(c, x, y, sc, { ...o, t, phase: i, bounce: won ? 1.6 : 0.5, facing: won ? 1 : i === 0 ? 1 : -1, expr: won ? 'laugh' : 'happy', arms: won ? (i % 2 ? 'wave' : 'cheer') : i === 0 ? 'out' : 'down' });
    });
    // the pile of plain cloth on a bench
    c.fillStyle = 'rgba(40,20,30,0.22)'; c.beginPath(); c.ellipse(PILE.x + 4, PILE.y + 18, 46, 9, 0, 0, 7); c.fill();
    c.fillStyle = '#8a5a3a'; c.fillRect(PILE.x - 44, PILE.y + 4, 88, 9); c.fillRect(PILE.x - 38, PILE.y + 12, 6, 12); c.fillRect(PILE.x + 32, PILE.y + 12, 6, 12);
    const left = s.cloths.filter(q => q.state === 'pile').length;
    if (left && !s.held && !s.vat && !g.done) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, PILE.x, PILE.y - 16, 62, '#fff0b0', 0.2 + 0.3 * pu); c.restore(); }
    for (let i = 0; i < left; i++) folded(c, PILE.x + (i % 2 ? 3 : -3), PILE.y - i * 13, 1.25, RAW);
    // the dye vat with its bubbling purple surface
    c.drawImage(g.bake('acts_dye_vat', paintVat), 0, 0, W, H);
    const v = s.vat, ready = v && t - v.t >= s.soak, wantVat = s.held && s.held.c.dye < 1;
    c.save(); c.beginPath(); c.ellipse(VAT.x, VAT.y, VAT.rx, VAT.ry, 0, 0, 7); c.clip();
    const lg = c.createRadialGradient(VAT.x - 20, VAT.y - 8, 4, VAT.x, VAT.y, VAT.rx); lg.addColorStop(0, '#b05ac0'); lg.addColorStop(0.6, '#6a2a7a'); lg.addColorStop(1, '#3a1448'); c.fillStyle = lg; c.fillRect(VAT.x - VAT.rx, VAT.y - VAT.ry, VAT.rx * 2, VAT.ry * 2);
    for (const b of s.bubbles) { const q = (t * b.sp + b.ph) % 1; c.strokeStyle = `rgba(230,190,255,${0.7 * (1 - q)})`; c.lineWidth = 1.2; c.beginPath(); c.ellipse(VAT.x + b.dx * 0.9, VAT.y + Math.sin(b.ph) * 8, 2 + q * 6, 1 + q * 2.4, 0, 0, 7); c.stroke(); }
    const sp = Math.max(0, 1 - (t - s.splashT) / 0.5); if (sp > 0) { c.strokeStyle = `rgba(240,210,255,${sp})`; c.lineWidth = 2; for (let k = 0; k < 2; k++) { c.beginPath(); c.ellipse(VAT.x, VAT.y, (1 - sp) * 60 + k * 14, (1 - sp) * 18 + k * 4, 0, 0, 7); c.stroke(); } }
    c.restore();
    if (wantVat) { c.save(); c.globalAlpha = 0.45 + 0.4 * pu; c.strokeStyle = '#fff6d0'; c.lineWidth = 2.5; c.setLineDash([6, 5]); c.beginPath(); c.ellipse(VAT.x, VAT.y, VAT.rx + 10, VAT.ry + 9, 0, 0, 7); c.stroke(); c.restore(); }
    if (v) { // the cloth in the vat: sinks, soaks up the colour, then rises dripping and ready
      const k = Math.min(1, (t - v.t) / s.soak), rise = ready ? 26 + Math.sin(t * 4) * 2 : 8 + (1 - k) * 4;
      if (ready) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, VAT.x, VAT.y - 40, 60, '#f0c0ff', 0.3 + 0.3 * pu); c.restore(); }
      c.save(); c.beginPath(); c.rect(0, 0, W, VAT.y + 2); c.clip(); hanging(c, VAT.x, VAT.y - rise - 26, 40, 60, v.c.col, v.c.dye, t, v.c.ph, ready ? 1 : 0); c.restore();
      c.fillStyle = '#6a4a3a'; c.fillRect(VAT.x - 1.5, VAT.y - rise - 46, 3, 22); c.fillStyle = '#8a6a4a'; c.fillRect(VAT.x - 24, VAT.y - rise - 30, 48, 4); // the dipping stick
    }
    // purple splash drops
    for (const d of s.drops) { c.fillStyle = 'rgba(140,60,170,0.85)'; c.beginPath(); c.arc(d.x, d.y, 3, 0, 7); c.fill(); }
    // Lydia: stirring and pointing, then welcoming her guests
    const lx = won ? 262 : 300, lf = won ? 1 : -1;
    P.person(c, lx, 610, 1.45, { ...LYDIA, t, phase: 2, bounce: won ? 2.4 : 1, facing: lf, expr: won ? 'laugh' : lost ? 'laugh' : s.hung ? 'happy' : 'wow', arms: won ? 'cheer' : s.held ? 'reach' : 'out' });
    if (lost) { c.fillStyle = 'rgba(120,40,150,0.75)'; for (const [dx, dy, r] of [[-8, -86, 4], [6, -92, 3], [10, -80, 3.5], [-2, -100, 2.5]]) { c.beginPath(); c.arc(lx + dx, 610 + dy, r, 0, 7); c.fill(); } }
    // cloths flying back after a miss
    for (const b of s.back) { const q = (t - b.t) / 0.3; c.save(); c.globalAlpha = 1 - q * 0.5; const x = b.x + (b.tx - b.x) * q, y = b.y + (b.ty - b.y) * q - Math.sin(q * Math.PI) * 30; if (b.ghost) hanging(c, x, y - 30, 40, 60, b.c.col, 1, t); else folded(c, x, y, 1.2, RAW); c.restore(); }
    if (s.held) { const h = s.held; glow(c, h.x, h.y, 44, '#fff4d0', 0.5);
      if (h.c.dye < 1) folded(c, h.x, h.y, 1.35, RAW); else { hanging(c, h.x, h.y - 34, 44, 66, h.c.col, 1, t, h.c.ph, 1); c.fillStyle = '#6a4a3a'; c.fillRect(h.x - 26, h.y - 37, 52, 4); } }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});
