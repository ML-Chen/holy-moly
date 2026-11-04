// LIFT UP! — Luke 1:46–55. Mary's song: God lifts up the lowly and brings down the powerful from their thrones.
// Tap the small, sad people at the bottom: each one floats up onto a cloud of golden light. Meanwhile the two pompous
// rulers wobble on their silly tall thrones and slide gently down onto big soft cushions (nobody is hurt).
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const MARY = { skin: SK[3], robe: CL.indigo, stripe: CL.sky, hair: HR[1], head: 'scarf', headCol: CL.sky };
const LOWLY = [
  { skin: SK[2], robe: '#9a8a70', hairStyle: 'curly', hair: HR[0], child: true },
  { skin: SK[3], robe: '#8a7a64', beard: '#d8d0c4', hair: HR[5], hairStyle: 'bald' },
  { skin: SK[1], robe: '#a89478', hairStyle: 'long', hair: HR[2] },
  { skin: SK[0], robe: '#8e8a7a', hairStyle: 'short', hair: HR[1], child: true },
  { skin: SK[2], robe: '#9e8468', hair: HR[5], head: 'scarf', headCol: '#c8b89a' },
];
const GROUND = [[54, 590], [306, 590], [180, 600], [118, 566], [244, 566]];
const CLOUDS = [[66, 168], [296, 162], [180, 140], [124, 206], [238, 202]];
const RULERS = [
  { x: 64, seat: 338, foot: 486, cush: [112, 496], o: { skin: SK[1], robe: CL.royal, stripe: CL.gold, sash: CL.gold, beard: true, hair: HR[3], head: 'crown' } },
  { x: 296, seat: 330, foot: 486, cush: [248, 496], o: { skin: SK[2], robe: CL.red, stripe: CL.gold, sash: CL.gold, beard: '#e8e2da', hair: HR[5], head: 'crown' } },
];
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);

function seated(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 126 * s); c.clip(); P.person(c, x, y + 12 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 12 * s, x, y + 4 * s); g.addColorStop(0, P.shade(robe, 0.12)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 4 * s, 20 * s, 8 * s, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 12 * s, y + 3 * s, 5 * s, 2.6 * s, 0, 0, 7); c.ellipse(x + 12 * s, y + 3 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill();
}
// a ridiculously tall golden throne on spindly legs
function throne(c, x, seat, foot, rot) {
  c.save(); c.translate(x, foot); c.rotate(rot); c.translate(-x, -foot);
  c.fillStyle = 'rgba(40,20,40,0.25)'; c.beginPath(); c.ellipse(x, foot + 2, 30, 5, 0, 0, 7); c.fill();
  c.strokeStyle = '#a8701e'; c.lineWidth = 5; c.lineCap = 'round';
  for (const lx of [-20, 20]) { c.beginPath(); c.moveTo(x + lx * 0.9, seat + 8); c.lineTo(x + lx, foot); c.stroke(); }
  c.lineWidth = 2.5; for (let y = seat + 40; y < foot - 10; y += 40) { c.beginPath(); c.moveTo(x - 19, y); c.lineTo(x + 19, y + 10); c.moveTo(x + 19, y); c.lineTo(x - 19, y + 10); c.stroke(); }
  c.strokeStyle = 'rgba(255,240,170,0.6)'; c.lineWidth = 1.5; for (const lx of [-20, 20]) { c.beginPath(); c.moveTo(x + lx * 0.9 - 1.5, seat + 10); c.lineTo(x + lx - 1.5, foot - 2); c.stroke(); }
  // the high back with a velvet panel and gold knobs
  const bg = c.createLinearGradient(x - 26, 0, x + 26, 0); bg.addColorStop(0, '#ffe08a'); bg.addColorStop(0.5, '#e8b030'); bg.addColorStop(1, '#a8701e');
  c.fillStyle = bg; c.beginPath(); c.moveTo(x - 26, seat + 6); c.lineTo(x - 26, seat - 74); c.quadraticCurveTo(x, seat - 100, x + 26, seat - 74); c.lineTo(x + 26, seat + 6); c.closePath(); c.fill();
  c.strokeStyle = '#7a4a14'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#b8304a'; c.beginPath(); c.moveTo(x - 18, seat - 4); c.lineTo(x - 18, seat - 68); c.quadraticCurveTo(x, seat - 88, x + 18, seat - 68); c.lineTo(x + 18, seat - 4); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x - 15, seat - 66, 5, 58);
  for (const kx of [-26, 26]) { const kg = c.createRadialGradient(x + kx - 1.5, seat - 78, 0.5, x + kx, seat - 76, 6); kg.addColorStop(0, '#fff6c0'); kg.addColorStop(1, '#c08a20'); c.fillStyle = kg; c.beginPath(); c.arc(x + kx, seat - 76, 5.5, 0, 7); c.fill(); }
  const tg = c.createRadialGradient(x - 2, seat - 96, 1, x, seat - 94, 8); tg.addColorStop(0, '#fff6c0'); tg.addColorStop(1, '#c08a20'); c.fillStyle = tg; c.beginPath(); c.arc(x, seat - 94, 7, 0, 7); c.fill();
  // the seat cushion
  c.fillStyle = '#e8b030'; c.fillRect(x - 28, seat + 2, 56, 7); c.fillStyle = '#d84a5a'; roundRect(c, x - 26, seat - 4, 52, 9, 4); c.fill();
  c.restore();
}
function cushion(c, x, y, col, squash) {
  c.save(); c.translate(x, y); c.scale(1 + squash * 0.25, 1 - squash * 0.35);
  c.fillStyle = 'rgba(40,20,40,0.22)'; c.beginPath(); c.ellipse(0, 6, 40, 7, 0, 0, 7); c.fill();
  const g = c.createRadialGradient(-10, -10, 3, 0, -4, 40); g.addColorStop(0, P.shade(col, 0.35)); g.addColorStop(1, P.shade(col, -0.2)); c.fillStyle = g;
  c.beginPath(); c.moveTo(-38, 0); c.quadraticCurveTo(-42, -20, -30, -22); c.quadraticCurveTo(0, -30, 30, -22); c.quadraticCurveTo(42, -20, 38, 0); c.quadraticCurveTo(0, 10, -38, 0); c.fill();
  c.strokeStyle = P.shade(col, -0.4); c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#e9b949'; for (const tx of [-36, 36]) { c.beginPath(); c.arc(tx, -6, 3.2, 0, 7); c.fill(); }
  c.fillStyle = P.shade(col, -0.25); c.beginPath(); c.arc(0, -12, 2.4, 0, 7); c.fill();
  c.restore();
}
function lightCloud(c, x, y, a, t) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(x, y, 4, x, y, 60); g.addColorStop(0, 'rgba(255,236,170,0.65)'); g.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 60, 0, 7); c.fill(); c.restore();
  P.cloud(c, x, y + 10 + Math.sin(t * 2 + x) * 2, 0.58, '#fffbea', '#f4cc8a', a);
}
function note(c, x, y, s, a) { c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = '#fff4c8'; c.strokeStyle = '#fff4c8'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 4.5, 3.4, -0.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(4, -1); c.lineTo(4, -15); c.quadraticCurveTo(9, -12, 11, -7); c.stroke(); c.restore(); }
function paintBg(o) {
  P.sky(o, W, H, ['#5a5ab0', '#b886c0', '#f4b0a0', '#ffe2a8'], { x: 180, y: 70, r: 20, color: '#fff2c8', glow: 260 });
  P.hills(o, W, 430, 40, '#9a7aa0', '#7a6090', { seed: 7, freq: 0.01, dabs: 20, bottom: 520 });
  // Zechariah and Elizabeth's house in the hills of Judah
  P.house(o, 150, 438, 62, 40, '#ecd2b0', { door: '#6a3e22' }); P.house(o, 206, 442, 30, 26, '#e2c49c', { window: false });
  P.tree(o, 136, 446, 0.42, '#6a9a52', 5);
  P.hills(o, W, 498, 22, '#b8c87a', '#8aa458', { seed: 11, freq: 0.014, dabs: 100, rim: '#fff4c0' });
  P.grassTufts(o, W, 506, 640, 60, '#7a9e44', 6); P.flowers(o, W, 506, 640, 40, ['#f4d35e', '#ffffff', '#ee6c8a', '#b98ae0'], 9);
}

MG.add({
  id: 'lowly', stage: 'baby', cmd: 'LIFT UP!', hint: 'tap', time: 5, mood: 'bright', winText: 'Lifted!',
  card: {
    title: 'Mary\'s song', ref: 'Luke 1:46–55', kind: 'Poem',
    text: 'Luke\'s Gospel tells how Mary, while she was expecting baby Jesus, visited her relative Elizabeth and sang a song of joy. She sang that God lifts up people who are poor and looked down on, and fills hungry people with good things. She also sang that God brings proud and powerful rulers down from their thrones.',
    note: 'Only Luke\'s Gospel has Mary\'s song, and it sounds a lot like an older song sung by Hannah. It is a song about what God is like: God cares most for the people the world forgets.',
    ask: 'Who gets looked down on or left out where you live? How could you help lift them up?',
  },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    s.n = n; s.amp = [0, 16, 28][g.level]; s.wsp = [0, 1.6, 2.4][g.level] * Math.sqrt(g.speed);
    s.people = GROUND.slice(0, n).map(([x, y], i) => ({ bx: x, by: y, i, look: LOWLY[i], up: -1, ph: Math.random() * 6, cloud: CLOUDS[i] }));
    s.lifted = 0; s.rulers = RULERS.map(() => ({ fall: -1, wob: 0 })); s.puffs = []; s.winT = -1;
  },
  down(g, x, y) {
    const s = g.s; if (s.winT >= 0) return;
    let best = null, bd = 46;
    for (const p of s.people) { if (p.up >= 0) continue; const [px, py] = pos(s, p, g.t), d = Math.hypot(x - px, y - (py - 40)); if (d < bd) { bd = d; best = p; } }
    if (!best) { s.puffs.push({ x, y, t: g.t }); g.sfx('tap'); return; }
    best.up = g.t; s.lifted++; g.sfx('magic'); g.sfx('harp');
    const [px, py] = pos(s, best, g.t); g.burst(px, py - 40, ['#fff6c0', '#ffd45a', '#ffffff', '#ffc8e0'], 14, 160);
    s.rulers.forEach(r => { if (r.fall < 0) r.wob = 1; });
    const k = s.lifted === s.n ? 1 : s.lifted >= Math.ceil(s.n / 2) ? 0 : -1;
    for (let i = 0; i <= k; i++) if (s.rulers[i].fall < 0) { s.rulers[i].fall = g.t; g.sfx('swoosh'); }
    if (s.lifted === s.n) { s.winT = g.t; g.win(); g.sfx('cheer'); }
  },
  update(g, dt) {
    const s = g.s; for (const r of s.rulers) r.wob = Math.max(0, r.wob - dt * 2.2);
    for (let i = 0; i < 2; i++) { const r = s.rulers[i]; if (r.fall >= 0 && !r.landed && g.t - r.fall > 0.55) { r.landed = g.t; g.sfx('boing'); g.burst(RULERS[i].cush[0], RULERS[i].cush[1] - 20, ['#ffd45a', '#ffffff', '#ff9ab0'], 8, 110); } }
    s.puffs = s.puffs.filter(p => g.t - p.t < 0.4);
  },
  auto(g, dt, synth) { // tap the next sad person every 0.28 s
    const s = g.s; if (g.t < 0.35) return; const k = Math.floor((g.t - 0.35) / 0.28); if (k === s.botK) return; s.botK = k;
    const p = s.people.find(q => q.up < 0); if (!p) return; const [x, y] = pos(s, p, g.t + 1 / 60); synth('down', x, y - 40); synth('up', x, y - 40);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = s.winT >= 0;
    c.drawImage(g.bake('baby_lowly_bg', paintBg), 0, 0, W, H);
    const glow = s.lifted / s.n;
    P.rays(c, 180, 70, W, H, '#fff2c4', 0.1 + 0.16 * glow, 11, t);
    P.cloud(c, 40 + t * 2, 250, 0.45, '#fff4f0', '#e0a6c0', 0.7); P.cloud(c, 320 - t * 2, 270, 0.4, '#fff4f0', '#e0a6c0', 0.65);
    // clouds of light waiting for the lifted (faint until someone arrives)
    for (const p of s.people) { const [cx, cy] = p.cloud, q = p.up >= 0 ? eo((t - p.up) / 0.6) : 0; lightCloud(c, cx, cy, 0.18 + 0.82 * q, t); }
    // thrones and rulers
    RULERS.forEach((R, i) => {
      const r = s.rulers[i], wob = Math.sin(t * 22) * r.wob * 0.05, fall = r.fall >= 0 ? t - r.fall : -1, tip = fall >= 0 ? Math.min(0.12, fall * 0.4) * (i ? -1 : 1) : 0;
      cushion(c, R.cush[0], R.cush[1], i ? '#6aa9d8' : '#e07a8a', r.landed ? Math.max(0, 1 - (t - r.landed) / 0.3) * Math.sin((t - r.landed) * 30) : 0);
      throne(c, R.x, R.seat, R.foot, wob + tip);
      let x = R.x, y = R.seat + 2, rot = wob, expr = 'grumpy', arms = 'pray';
      if (fall >= 0) { const q = Math.min(1, fall / 0.55); x = R.x + (R.cush[0] - R.x) * q; y = R.seat + 2 + (R.cush[1] - 12 - R.seat - 2) * (q * q) - Math.sin(q * Math.PI) * 26; rot = (i ? -1 : 1) * Math.sin(q * Math.PI) * 0.5; expr = q < 1 ? 'surprised' : 'laugh'; arms = q < 1 ? 'up' : 'out'; }
      else if (r.wob > 0.1) { expr = 'surprised'; arms = 'out'; }
      c.save(); c.translate(x, y); c.rotate(rot); seated(c, 0, 0, 1.0, { ...R.o, facing: i ? -1 : 1, t, phase: i, bounce: 0.3, expr, arms }); c.restore();
      if (fall < 0) { // a haughty little "hmph" puff from the nose
        const q = (t * 0.8 + i * 0.5) % 1; c.fillStyle = `rgba(255,255,255,${0.5 * (1 - q)})`; c.beginPath(); c.arc(R.x + (i ? -1 : 1) * (14 + q * 16), R.seat - 50 - q * 6, 2 + q * 4, 0, 7); c.fill(); }
    });
    // Mary sings
    const sing = 0.5 + 0.5 * Math.sin(t * 4);
    P.person(c, 180, 512, 1.05, { ...MARY, t, phase: 2, bounce: 1.2, expr: won || s.lifted ? 'laugh' : 'happy', arms: won ? 'cheer' : s.lifted ? 'up' : 'out' });
    for (let i = 0; i < 4; i++) { const q = (t * 0.6 + i / 4) % 1; note(c, 180 + Math.sin(q * 6 + i * 2) * 26 + (i % 2 ? 16 : -16), 430 - q * 120, 0.9 + sing * 0.2, (1 - q) * 0.9); }
    // the lowly: sad and small on the ground, with a pulsing light ring; once tapped they rise to their cloud
    const order = s.people.slice().sort((a, b) => pos(s, a, t)[1] - pos(s, b, t)[1]);
    for (const p of order) {
      const [x, y] = pos(s, p, t);
      if (p.up < 0) {
        const pu = 0.5 + 0.5 * Math.sin(t * 6 + p.ph); c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x, y - 4, 4, x, y - 4, 40); gl.addColorStop(0, `rgba(255,232,150,${0.35 + 0.3 * pu})`); gl.addColorStop(1, 'rgba(255,232,150,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(x, y - 4, 40, 14, 0, 0, 7); c.fill(); c.restore();
        c.strokeStyle = `rgba(255,246,200,${0.4 + 0.4 * pu})`; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y - 2, 26 + pu * 4, 7 + pu, 0, 0, 7); c.stroke();
        P.person(c, x, y, 1.02, { ...p.look, t, phase: p.ph, bounce: 0.4, expr: 'sad', arms: 'down', facing: x < 180 ? 1 : -1 });
        // a patch on the robe
        c.fillStyle = 'rgba(120,90,60,0.6)'; c.fillRect(x - 6, y - 18, 7, 6);
      } else {
        const q = eo((t - p.up) / 0.6), [cx, cy] = p.cloud, px = x + (cx - x) * q, py = y + (cy - y) * q - Math.sin(q * Math.PI) * 20;
        if (q < 1) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,240,180,${0.55 * (1 - q)})`; c.lineWidth = 4 + 18 * (1 - q); c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y - 30); c.lineTo(px, py - 30); c.stroke(); c.restore(); }
        const hop = q >= 1 ? Math.abs(Math.sin(t * 7 + p.ph)) * 4 : 0;
        P.person(c, px, py - hop, 1.02 - 0.18 * q, { ...p.look, t, phase: p.ph, bounce: 1.6, expr: 'laugh', arms: 'cheer', facing: x < 180 ? 1 : -1 });
        if (q >= 1) for (let k = 0; k < 2; k++) { const a = t * 3 + k * 3 + p.ph, tw = Math.max(0, Math.sin(t * 5 + k + p.ph)); c.save(); c.globalAlpha = tw; c.fillStyle = '#fff6c0'; drawStar(c, px + Math.cos(a) * 26, py - 40 + Math.sin(a) * 18, 2 + tw * 2.5, t); c.restore(); }
      }
    }
    for (const pf of s.puffs) { const q = (t - pf.t) / 0.4; c.strokeStyle = `rgba(255,250,230,${0.6 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(pf.x, pf.y, 6 + q * 16, 0, 7); c.stroke(); }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});
function pos(s, p, t) { return [p.bx + Math.sin(t * s.wsp + p.ph) * s.amp, p.by]; }
