// JUDGE! — Judges 4:4–5. The prophet Deborah judged Israel, sitting under her palm tree in the hill country.
// Two neighbours squabble over a pile of melons. Drag the melons onto Deborah's scale so each pan gets a fair share:
// every time the beam comes level the neighbours cheer up, and when all are shared they hug.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const DEB = { skin: SK[3], robe: CL.indigo, stripe: CL.gold, hairStyle: 'bun', hair: HR[0] };
const NB = [
  { skin: SK[1], robe: CL.terracotta, stripe: CL.cream, beard: true, hair: HR[2] },
  { skin: SK[2], robe: CL.teal, stripe: CL.saffron, hairStyle: 'curly', hair: HR[0] },
];
const PX = 180, PY = 404, ARM = 102, DROP = 54;          // scale pivot, half beam length, cord length
const PILE = { x: 180, y: 570 };
const NX = [50, 310], NY = 600;                          // the neighbours' feet
const SLOTS = [[-28, 0], [0, 0], [28, 0], [-14, -20], [14, -20], [0, -40], [-54, 6], [54, 6]];
const PAN_SLOTS = [[-19, 0], [19, 0], [0, 2], [0, -16]];
const MR = 13;                                           // melon radius
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);

function ends(a) { const co = Math.cos(a), si = Math.sin(a); return [[PX - ARM * co, PY - ARM * si], [PX + ARM * co, PY + ARM * si]]; }
function panPos(s, side) { const e = ends(s.tilt)[side]; return [e[0], e[1] + DROP]; }

function melon(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(40,30,20,0.22)'; c.beginPath(); c.ellipse(1, r * 0.86, r * 1.0, r * 0.26, 0, 0, 7); c.fill();
  c.rotate(rot);
  const g = c.createRadialGradient(-r * 0.4, -r * 0.45, r * 0.1, 0, 0, r * 1.15); g.addColorStop(0, '#c8e892'); g.addColorStop(0.55, '#5f9a3a'); g.addColorStop(1, '#2a5420');
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r * 1.12, r, 0, 0, 7); c.fill();
  c.save(); c.clip(); c.strokeStyle = 'rgba(28,66,24,0.55)'; c.lineWidth = r * 0.22; c.lineCap = 'round';
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * r * 0.45, -r); c.quadraticCurveTo(i * r * 0.66, 0, i * r * 0.45, r); c.stroke(); } c.restore();
  c.strokeStyle = 'rgba(30,60,20,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 0, r * 1.12, r, 0, 0, 7); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(-r * 0.42, -r * 0.48, r * 0.34, r * 0.15, -0.5, 0, 7); c.fill();
  c.strokeStyle = '#6a5a2a'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -r * 0.95); c.quadraticCurveTo(r * 0.15, -r * 1.35, r * 0.42, -r * 1.3); c.stroke();
  c.fillStyle = '#6aa040'; c.beginPath(); c.ellipse(r * 0.5, -r * 1.25, r * 0.3, r * 0.15, 0.4, 0, 7); c.fill();
  c.restore();
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
// a cross little scribble cloud over a grumpy head
function grump(c, x, y, t, a) {
  c.save(); c.globalAlpha = a; c.strokeStyle = '#5a2a3a'; c.lineWidth = 2.2; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); for (let i = 0; i <= 26; i++) { const q = i / 26, ang = q * Math.PI * 6 + t * 9, rr = 6 + 3 * Math.sin(q * 9 + t * 4); const px = x - 12 + q * 24 + Math.cos(ang) * rr * 0.6, py = y + Math.sin(ang) * rr * 0.5; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
  c.restore();
}
// someone sitting on a stone seat: the robe below the lap is hidden behind the knees
function seated(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 126 * s); c.clip(); P.person(c, x, y + 12 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 12 * s, x, y + 4 * s); g.addColorStop(0, P.shade(robe, 0.12)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 4 * s, 20 * s, 8 * s, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 12 * s, y + 3 * s, 5 * s, 2.6 * s, 0, 0, 7); c.ellipse(x + 12 * s, y + 3 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill();
}
function bird(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 8 + x) * 4; c.strokeStyle = 'rgba(70,60,80,0.75)'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, -f); c.quadraticCurveTo(-4, -4, 0, 0); c.quadraticCurveTo(4, -4, 9, -f); c.stroke(); c.restore(); }
function butterfly(c, x, y, t, col) { c.save(); c.translate(x, y); const f = Math.abs(Math.sin(t * 14)); c.fillStyle = col; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(sd * 4 * f, -2, 4 * f + 0.6, 5, sd * 0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(sd * 3 * f, 3, 3 * f + 0.5, 3, -sd * 0.3, 0, 7); c.fill(); } c.fillStyle = '#4a2a30'; c.fillRect(-0.7, -4, 1.4, 8); c.restore(); }

function paintBg(o) {
  P.sky(o, W, H, ['#4a92d0', '#8cc6e6', '#d8eee8', '#fbe6b8'], { x: 62, y: 96, r: 22, color: '#fff3c8', glow: 220 });
  // the hill country of Ephraim: far blue ridges, then terraced olive slopes, a village on each hill
  P.hills(o, W, 262, 40, '#9aaccc', '#8a9cbc', { seed: 5, freq: 0.009, dabs: 20, bottom: 340 });
  P.house(o, 52, 250, 22, 14, '#e6d2b0', { window: false }); P.house(o, 70, 254, 16, 11, '#dcc6a0', { window: false });
  P.house(o, 286, 246, 20, 13, '#e6d2b0', { window: false }); P.house(o, 304, 250, 14, 10, '#d8c09a', { window: false });
  P.hills(o, W, 304, 30, '#a8bc78', '#8aa060', { seed: 9, freq: 0.014, dabs: 30, bottom: 380 });
  const r = P.rng(7); for (let i = 0; i < 9; i++) P.tree(o, 10 + i * 42 + r() * 14, 316 + r() * 12, 0.26 + r() * 0.06, '#6f9a52', i + 2);
  P.hills(o, W, 392, 14, '#d6cc84', '#b8a860', { seed: 13, freq: 0.012, dabs: 120, rim: '#fff4c0' });
  P.grassTufts(o, W, 400, 640, 46, '#8aa24a', 6); P.flowers(o, W, 410, 640, 30, ['#f4d35e', '#ffffff', '#ee6c8a', '#b98ae0'], 12);
  P.rock(o, 336, 430, 0.6, '#c8b090'); P.rock(o, 22, 446, 0.5, '#bca484');
  // the soft shade of the palm across the ground
  const sh = o.createRadialGradient(170, 400, 10, 170, 400, 120); sh.addColorStop(0, 'rgba(60,70,40,0.22)'); sh.addColorStop(1, 'rgba(60,70,40,0)'); o.fillStyle = sh; o.beginPath(); o.ellipse(170, 400, 120, 26, 0, 0, 7); o.fill();
}
function paintPost(o) {
  // the scale's carved post on a flat stone
  o.fillStyle = 'rgba(40,30,30,0.22)'; o.beginPath(); o.ellipse(PX + 4, 516, 34, 7, 0, 0, 7); o.fill();
  const sg = o.createLinearGradient(0, 500, 0, 518); sg.addColorStop(0, '#e2d2b4'); sg.addColorStop(1, '#a89478'); o.fillStyle = sg; o.beginPath(); o.ellipse(PX, 508, 30, 9, 0, 0, 7); o.fill(); o.fillRect(PX - 30, 504, 60, 6);
  o.fillStyle = '#f2e6cc'; o.beginPath(); o.ellipse(PX, 504, 30, 7, 0, 0, 7); o.fill();
  const pg = o.createLinearGradient(PX - 6, 0, PX + 6, 0); pg.addColorStop(0, '#b07a48'); pg.addColorStop(0.5, '#8a5a32'); pg.addColorStop(1, '#5e3a20');
  o.fillStyle = pg; o.beginPath(); o.moveTo(PX - 7, 506); o.lineTo(PX - 4.5, PY + 6); o.lineTo(PX + 4.5, PY + 6); o.lineTo(PX + 7, 506); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,230,180,0.35)'; o.lineWidth = 1.2; for (let y = PY + 22; y < 500; y += 18) { o.beginPath(); o.moveTo(PX - 5, y); o.lineTo(PX + 5, y - 2); o.stroke(); }
}

MG.add({
  id: 'judge', stage: 'brave', cmd: 'JUDGE!', hint: 'drag', time: 6, mood: 'bright', winText: 'Fair!',
  card: {
    title: 'Deborah under the palm tree', ref: 'Judges 4:4–5', kind: 'Story',
    text: 'The book of Judges tells about Deborah, a prophet and a leader of Israel. She sat under a palm tree in the hill country, and people came to her to settle their arguments. She listened to both sides and helped them find what was fair.',
    ask: 'When two people both want the same thing, what is a fair way to sort it out?',
  },
  init(g) {
    const s = g.s, n = [4, 6, 8][g.level];
    s.n = n; s.pile = n; s.cnt = [0, 0]; s.inPan = [[], []]; s.held = null; s.fly = [];
    s.tilt = 0; s.tv = 0; s.winT = -1; s.noT = [-9, -9]; s.addT = [-9, -9]; s.lvlT = -9; s.popT = -9;
    s.flies = [0, 1].map(i => ({ x: 70 + i * 220, y: 480 + i * 30, ph: Math.random() * 6, col: i ? '#f4d35e' : '#f2a0c8' }));
  },
  down(g, x, y) {
    const s = g.s; if (s.held || s.winT >= 0 || s.pile <= 0) return;
    if (Math.hypot(x - PILE.x, y - (PILE.y - 16)) < 66) { s.pile--; s.held = { x, y: y - 12, rot: 0 }; s.popT = g.t; g.sfx('pop'); g.burst(PILE.x, PILE.y - 30, ['#d8f0a0', '#fff6c0', '#ffffff'], 6, 80); }
  },
  move(g, x, y) { const h = g.s.held; if (h) { h.rot = Math.max(-0.5, Math.min(0.5, (x - h.x) * 0.04)); h.x = x; h.y = y - 12; } },
  up(g, x, y) {
    const s = g.s, h = s.held; if (!h) return; s.held = null;
    let side = -1, bd = 84;
    for (const sd of [0, 1]) { const [px, py] = panPos(s, sd), d = Math.min(Math.hypot(h.x - px, h.y - py), Math.hypot(h.x - NX[sd], h.y - (NY - 70)) + 10); if (d < bd) { bd = d; side = sd; } }
    if (side < 0) { s.fly.push({ x: h.x, y: h.y, t: g.t }); g.sfx('swoosh'); return; }
    if (s.cnt[side] >= s.n / 2) { s.fly.push({ x: h.x, y: h.y, t: g.t }); s.noT[side] = g.t; g.sfx('boing'); return; } // "that's plenty for me!"
    s.cnt[side]++; s.inPan[side].push({ fx: h.x, fy: h.y, t: g.t }); s.addT[side] = g.t; s.tv += side ? 2.2 : -2.2;
    g.sfx('thud'); const [px, py] = panPos(s, side); g.burst(px, py - 6, ['#ffe27a', '#fff6c0', '#c8e892'], 8, 110);
    if (s.cnt[0] === s.cnt[1]) {
      s.lvlT = g.t; g.sfx('ding'); g.burst(PX, PY, ['#fff6c0', '#ffd45a', '#ffffff'], 10, 140);
      if (s.cnt[0] + s.cnt[1] === s.n) { s.winT = g.t; g.win(); g.sfx('cheer'); g.sfx('laugh'); g.burst(180, 520, ['#ff8aa8', '#ffd45a', '#ffffff', '#c8e892'], 26, 220); }
    }
  },
  update(g, dt) {
    const s = g.s, target = Math.max(-0.3, Math.min(0.3, (s.cnt[1] - s.cnt[0]) * 0.12));
    s.tv += ((target - s.tilt) * 90 - s.tv * 6) * dt; s.tilt += s.tv * dt;
    s.fly = s.fly.filter(f => { if (g.t - f.t >= 0.35) { s.pile++; return false; } return true; });
  },
  auto(g, dt, synth) { // carry one melon every 0.3 s to whichever pan has fewer
    const s = g.s; if (g.t < 0.35 || s.winT >= 0) return; const k = Math.floor((g.t - 0.35) / 0.15);
    if (k === s.botK) return; s.botK = k;
    const side = s.cnt[0] <= s.cnt[1] ? 0 : 1, [px, py] = panPos(s, side);
    if (!s.held && s.pile > 0) { synth('down', PILE.x, PILE.y - 16); synth('move', px, py); }
    else if (s.held) synth('up', px, py);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = s.winT >= 0, wk = won ? eo((t - s.winT) / 0.4) : 0, lvl = Math.max(0, 1 - (t - s.lvlT) / 0.7);
    c.drawImage(g.bake('brave_judge_bg', paintBg), 0, 0, W, H);
    P.cloud(c, 250 + Math.sin(t * 0.3) * 8 + t * 3, 112, 0.72, '#fffaf0', '#d6dcec', 0.95);
    P.cloud(c, 120 + t * 2, 178, 0.42, '#fffaf0', '#d6dcec', 0.8);
    bird(c, 150 + Math.sin(t * 0.7) * 40, 150 + Math.sin(t * 1.3) * 6, 0.8, t); bird(c, 190 + Math.sin(t * 0.6 + 1) * 34, 138, 0.6, t + 0.5);
    // Deborah's palm, and Deborah on her stone seat in its shade
    P.palm(c, 238, 396, 1.5, -0.24, t, '#4a8f4a');
    c.fillStyle = 'rgba(40,30,30,0.2)'; c.beginPath(); c.ellipse(120, 400, 34, 6, 0, 0, 7); c.fill();
    const bg = c.createLinearGradient(0, 380, 0, 400); bg.addColorStop(0, '#e4d6bc'); bg.addColorStop(1, '#a8947a'); c.fillStyle = bg; roundRect(c, 92, 380, 56, 20, 6); c.fill();
    c.fillStyle = 'rgba(255,250,235,0.6)'; c.fillRect(96, 381, 48, 2.5);
    const debCheer = won || lvl > 0.2;
    seated(c, 120, 384, 1.38, { ...DEB, t, phase: 1, bounce: 0.6, expr: debCheer ? 'laugh' : 'happy', arms: won ? 'cheer' : lvl > 0.2 ? 'raise' : 'out' });
    // the scale: post, beam, cords and pans
    c.drawImage(g.bake('brave_judge_post', paintPost), 0, 0, W, H);
    const [eL, eR] = ends(s.tilt);
    c.save(); c.translate(PX, PY); c.rotate(s.tilt);
    const bm = c.createLinearGradient(0, -5, 0, 5); bm.addColorStop(0, '#c08a52'); bm.addColorStop(1, '#6a4224'); c.fillStyle = bm; roundRect(c, -ARM - 4, -4.5, ARM * 2 + 8, 9, 4); c.fill();
    c.fillStyle = 'rgba(255,236,190,0.45)'; c.fillRect(-ARM, -3.5, ARM * 2, 2);
    for (const ex of [-ARM, ARM]) { c.fillStyle = '#e9b949'; c.beginPath(); c.arc(ex, 0, 5, 0, 7); c.fill(); c.strokeStyle = '#8a5a14'; c.lineWidth = 1.2; c.stroke(); }
    c.restore();
    // a golden boss at the pivot that flashes whenever the beam comes level
    if (lvl > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(PX, PY, 2, PX, PY, 50); lg.addColorStop(0, `rgba(255,236,160,${0.8 * lvl})`); lg.addColorStop(1, 'rgba(255,236,160,0)'); c.fillStyle = lg; c.beginPath(); c.arc(PX, PY, 50, 0, 7); c.fill(); c.restore(); }
    const kg = c.createRadialGradient(PX - 2, PY - 3, 1, PX, PY, 9); kg.addColorStop(0, '#fff2b0'); kg.addColorStop(1, '#b8801e'); c.fillStyle = kg; c.beginPath(); c.arc(PX, PY, 8, 0, 7); c.fill(); c.strokeStyle = '#7a4a14'; c.lineWidth = 1.4; c.stroke();
    // the pans
    const want = s.held ? [0, 1].filter(sd => s.cnt[sd] < s.n / 2) : [];
    [eL, eR].forEach((e, sd) => {
      const sw = Math.sin(t * 2.2 + sd) * 1.5 + s.tv * 2, px = e[0] + sw, py = e[1] + DROP, bump = Math.max(0, 1 - (t - s.addT[sd]) / 0.25);
      c.strokeStyle = '#7a5a3a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(e[0], e[1]); c.lineTo(px - 32, py); c.moveTo(e[0], e[1]); c.lineTo(px + 32, py); c.moveTo(e[0], e[1]); c.lineTo(px, py - 2); c.stroke();
      if (want.includes(sd)) { const p = 0.5 + 0.5 * Math.sin(t * 7); const gl = c.createRadialGradient(px, py + 4, 6, px, py + 4, 64); gl.addColorStop(0, `rgba(255,240,160,${0.45 + 0.3 * p})`); gl.addColorStop(1, 'rgba(255,240,160,0)'); c.fillStyle = gl; c.beginPath(); c.arc(px, py + 4, 64, 0, 7); c.fill(); }
      c.fillStyle = '#7a4e1a'; c.beginPath(); c.ellipse(px, py, 36, 6, 0, 0, 7); c.fill();
      s.inPan[sd].forEach((m, i) => { const q = eo((t - m.t) / 0.14), [ox, oy] = PAN_SLOTS[i]; const tx = px + ox, ty = py + oy - 6 - bump * 3; melon(c, m.fx + (tx - m.fx) * q, m.fy + (ty - m.fy) * q - Math.sin(q * Math.PI) * 14, 11, (i % 2 ? 0.2 : -0.2)); });
      const pg = c.createLinearGradient(0, py - 2, 0, py + 22); pg.addColorStop(0, '#f8d47a'); pg.addColorStop(1, '#a8701e'); c.fillStyle = pg;
      c.beginPath(); c.moveTo(px - 37, py); c.quadraticCurveTo(px, py + 34, px + 37, py); c.quadraticCurveTo(px, py + 7, px - 37, py); c.fill();
      c.strokeStyle = '#7a4a14'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px - 37, py); c.quadraticCurveTo(px, py + 34, px + 37, py); c.stroke();
      c.strokeStyle = 'rgba(255,250,220,0.8)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px - 28, py + 6); c.quadraticCurveTo(px - 12, py + 14, px + 2, py + 15); c.stroke();
    });
    // the pile of melons, glowing until it is empty
    const pop = Math.max(0, 1 - (t - s.popT) / 0.2);
    if (s.pile > 0 && !s.held && !won) { const p = 0.5 + 0.5 * Math.sin(t * 6); const gl = c.createRadialGradient(PILE.x, PILE.y - 14, 8, PILE.x, PILE.y - 14, 76); gl.addColorStop(0, `rgba(255,240,160,${0.4 + 0.3 * p})`); gl.addColorStop(1, 'rgba(255,240,160,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(PILE.x, PILE.y - 14, 76, 50, 0, 0, 7); c.fill(); }
    const pileList = []; for (let i = 0; i < s.pile; i++) pileList.push(SLOTS[i]);
    pileList.map((p, i) => [p, i]).sort((a, b) => a[0][1] - b[0][1]).forEach(([[ox, oy], i]) => melon(c, PILE.x + ox, PILE.y + oy - pop * 3 + Math.sin(t * 3 + i) * 0.6, MR, (i % 3 - 1) * 0.15));
    // the neighbours: cross while it is unfair, pleased when it is level, and hugging at the end
    for (const sd of [0, 1]) {
      const mine = s.cnt[sd], theirs = s.cnt[1 - sd], no = t - s.noT[sd] < 0.6, got = t - s.addT[sd] < 0.4;
      const cross = !won && (mine < theirs || (mine + theirs === 0)), dir = sd ? -1 : 1;
      const x = NX[sd] + (180 + dir * -18 - NX[sd]) * wk, y = NY - (won ? Math.abs(Math.sin(t * 9 + sd)) * 6 * (1 - wk) : 0);
      const stomp = cross ? Math.abs(Math.sin(t * 8 + sd * 2)) * 2 : 0;
      P.person(c, x, y - stomp, 1.3, { ...NB[sd], facing: dir, t, phase: sd * 2, bounce: cross ? 0.4 : 1.6,
        expr: won ? 'laugh' : no ? 'laugh' : cross ? 'grumpy' : got ? 'laugh' : 'happy',
        arms: won ? 'out' : no ? 'out' : cross ? 'reach' : got ? 'cheer' : 'hold' });
      if (cross) grump(c, x + dir * 4, NY - 112, t + sd, 0.75);
    }
    if (won) { c.save(); c.globalAlpha = Math.min(1, (t - s.winT) * 3); c.fillStyle = '#ff6f8f'; for (let i = 0; i < 4; i++) { const q = ((t - s.winT) * 0.9 + i * 0.25) % 1; heart(c, 168 + (i % 2) * 24 + Math.sin(t * 3 + i) * 6, 500 - q * 70, 6 * (1 - q * 0.4)); } c.restore(); }
    for (const f of s.flies) butterfly(c, f.x + Math.sin(t * 1.3 + f.ph) * 26, f.y + Math.sin(t * 2.1 + f.ph) * 12, t + f.ph, f.col);
    // melons rolling back to the pile
    for (const f of s.fly) { const q = eo((t - f.t) / 0.35); melon(c, f.x + (PILE.x - f.x) * q, f.y + (PILE.y - 40 - f.y) * q - Math.sin(q * Math.PI) * 30, MR, q * 6); }
    if (s.held) { const h = s.held; c.fillStyle = 'rgba(40,40,20,0.2)'; c.beginPath(); c.ellipse(h.x, h.y + 30, 14, 4, 0, 0, 7); c.fill(); const hg = c.createRadialGradient(h.x, h.y, 2, h.x, h.y, 30); hg.addColorStop(0, 'rgba(255,245,190,0.7)'); hg.addColorStop(1, 'rgba(255,245,190,0)'); c.fillStyle = hg; c.beginPath(); c.arc(h.x, h.y, 30, 0, 7); c.fill(); melon(c, h.x, h.y, 15, h.rot); }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});
