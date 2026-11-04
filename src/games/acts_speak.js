// SPEAK! — Acts 2:1–12. At Pentecost a rushing wind fills the house, flames of light rest on Jesus's friends,
// and visitors from many lands each hear them in their own language. Tap each puzzled visitor: their jumbled bubble turns
// into a glowing bubble with their own picture, and they light up with understanding.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const DISCIPLES = [
  { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly' },
  { skin: SK[1], robe: CL.rose, stripe: CL.cream, hairStyle: 'long', hair: HR[1] },
  { skin: SK[3], robe: CL.teal, stripe: CL.cream, hair: HR[2] },
  { skin: SK[3], robe: CL.indigo, stripe: CL.sky, head: 'scarf', headCol: CL.sky },
  { skin: SK[0], robe: CL.olive, stripe: CL.cream, beard: true, hair: HR[1] },
];
// visitors from many lands, each with a picture of home and a colour
const VISITORS = [
  { icon: 'sun', col: '#f2b630', look: { skin: SK[4], robe: CL.white, stripe: CL.gold, hairStyle: 'bun', hair: HR[3] } },
  { icon: 'fish', col: '#4aa8d8', look: { skin: SK[1], robe: CL.sky, stripe: CL.white, hairStyle: 'curly', hair: HR[2], child: true } },
  { icon: 'boat', col: '#d8503a', look: { skin: SK[0], robe: CL.red, stripe: CL.gold, hair: HR[4] } },
  { icon: 'star', col: '#6a5ad0', look: { skin: SK[3], robe: CL.royal, stripe: CL.saffron, head: 'wrap', headCol: CL.saffron, beard: true, hair: HR[0] } },
  { icon: 'wheat', col: '#e09a2a', look: { skin: SK[5], robe: CL.saffron, stripe: CL.green, hairStyle: 'curly', hair: HR[3] } },
  { icon: 'flower', col: '#e05a8a', look: { skin: SK[2], robe: CL.teal, stripe: CL.rose, hairStyle: 'long', hair: HR[0] } },
  { icon: 'mountain', col: '#4f9a5a', look: { skin: SK[4], robe: CL.green, stripe: CL.cream, beard: '#c9c3bb', hair: HR[5], hairStyle: 'bald' } },
];
const SPOTS = [[62, 482], [298, 482], [118, 606], [242, 606], [180, 482]];
const ROOF = 286;

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function flame(c, x, y, s, t, ph) {
  const f = 1 + Math.sin(t * 13 + ph) * 0.08, sway = Math.sin(t * 7 + ph) * 2;
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, x, y - 6 * s, 26 * s, '#ffb24a', 0.55); c.restore();
  c.save(); c.translate(x, y); c.scale(s, s * f);
  const g = c.createLinearGradient(0, 0, 0, -22); g.addColorStop(0, '#ff7a2a'); g.addColorStop(0.5, '#ffc040'); g.addColorStop(1, '#fff6c0'); c.fillStyle = g;
  c.beginPath(); c.moveTo(0, 2); c.quadraticCurveTo(-10, -4, -4, -14); c.quadraticCurveTo(-1, -18, sway, -24); c.quadraticCurveTo(9, -12, 7, -5); c.quadraticCurveTo(6, 1, 0, 2); c.fill();
  c.fillStyle = '#fffbe8'; c.beginPath(); c.ellipse(0.5, -6, 2.8, 5, 0, 0, 7); c.fill();
  c.restore();
}
function icon(c, kind, x, y, s, col) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'sun') { c.fillStyle = col; for (let i = 0; i < 8; i++) { c.save(); c.rotate(i * Math.PI / 4); c.beginPath(); c.moveTo(-2.5, -9); c.lineTo(0, -15); c.lineTo(2.5, -9); c.fill(); c.restore(); } c.beginPath(); c.arc(0, 0, 8, 0, 7); c.fill(); c.fillStyle = '#fff4c0'; c.beginPath(); c.arc(-2, -2, 3, 0, 7); c.fill(); }
  else if (kind === 'fish') { c.scale(-1, 1); P.fishShape(c, -3, 0, 0.85, col); }
  else if (kind === 'boat') { c.fillStyle = P.shade(col, -0.2); c.beginPath(); c.moveTo(-13, 3); c.lineTo(13, 3); c.quadraticCurveTo(9, 10, 0, 10); c.quadraticCurveTo(-9, 10, -13, 3); c.fill(); c.strokeStyle = '#6a4a2e'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 3); c.lineTo(0, -14); c.stroke(); c.fillStyle = col; c.beginPath(); c.moveTo(1, -13); c.quadraticCurveTo(11, -6, 11, 1); c.lineTo(1, 1); c.closePath(); c.fill(); }
  else if (kind === 'star') { c.fillStyle = col; drawStar(c, 0, 0, 13, 0); c.fillStyle = 'rgba(255,255,255,0.5)'; drawStar(c, -1, -1, 5, 0); }
  else if (kind === 'wheat') { c.strokeStyle = P.shade(col, -0.2); c.lineWidth = 1.6; for (const a of [-0.35, 0, 0.35]) { c.save(); c.rotate(a); c.beginPath(); c.moveTo(0, 12); c.lineTo(0, -4); c.stroke(); c.fillStyle = col; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(-2.4, -4 - k * 3.4, 2, 3.2, -0.5, 0, 7); c.ellipse(2.4, -4 - k * 3.4, 2, 3.2, 0.5, 0, 7); c.fill(); } c.restore(); } }
  else if (kind === 'flower') { c.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i * 1.2566; c.beginPath(); c.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 5.4, 4, a, 0, 7); c.fill(); } c.fillStyle = '#f9c233'; c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); }
  else if (kind === 'mountain') { c.fillStyle = col; c.beginPath(); c.moveTo(-14, 10); c.lineTo(-3, -10); c.lineTo(4, 0); c.lineTo(8, -5); c.lineTo(15, 10); c.closePath(); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-6.5, -4); c.lineTo(-3, -10); c.lineTo(0.5, -4); c.lineTo(-2, -5.5); c.closePath(); c.fill(); }
  c.restore();
}
function bubble(c, x, y, r, fill, edge, tailDir) {
  c.fillStyle = fill; c.strokeStyle = edge; c.lineWidth = 2.2;
  c.beginPath(); c.ellipse(x, y, r * 1.12, r, 0, 0, 7); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x + tailDir * r * 0.15, y + r * 0.8); c.lineTo(x - tailDir * r * 0.35, y + r * 1.45); c.lineTo(x - tailDir * r * 0.35, y + r * 0.75); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x + tailDir * r * 0.15, y + r * 0.86); c.lineTo(x - tailDir * r * 0.35, y + r * 1.45); c.lineTo(x - tailDir * r * 0.38, y + r * 0.9); c.stroke();
}
function paintScene(o) {
  P.sky(o, W, H, ['#3a6ad0', '#6aa0ea', '#b4d4f4', '#ffe2b8'], { x: 290, y: 150, r: 26, color: '#fff2c4', glow: 260 });
  P.cloud(o, 60, 110, 0.7, '#fff8f0', '#c8d4ec', 0.9);
  // Jerusalem behind: pale walls and roofs
  const r = P.rng(101);
  P.hills(o, W, 250, 40, '#a8a8d8', '#9a9ad0', { seed: 103, freq: 0.01, dabs: 8, bottom: 440 });
  for (let row = 0; row < 2; row++) for (let i = 0; i < 14; i++) { const x = -14 + i * 28 + r() * 10 + row * 12, w = 24 + r() * 20, h = 26 + r() * 40 - row * 10; P.house(o, x, 300 + row * 40 + r() * 8, w, h, P.mix('#f6e2c8', '#c0aed4', 0.45 - row * 0.2), { window: r() < 0.5 }); }
  const mist = o.createLinearGradient(0, 220, 0, 360); mist.addColorStop(0, 'rgba(255,236,220,0)'); mist.addColorStop(1, 'rgba(255,236,220,0.5)'); o.fillStyle = mist; o.fillRect(0, 220, W, 140);
  // the house where the friends were gathered
  const hx = 60, hw = 240, hy = ROOF;
  const wg = o.createLinearGradient(hx, hy, hx + hw, hy + 110); wg.addColorStop(0, '#f8e4c0'); wg.addColorStop(1, '#d8b080'); o.fillStyle = wg; o.fillRect(hx, hy, hw, 160);
    for (const wx of [hx + 30, hx + 106, hx + 182]) { o.fillStyle = '#7a4a2e'; o.beginPath(); o.moveTo(wx, hy + 96); o.lineTo(wx, hy + 54); o.arc(wx + 14, hy + 54, 14, Math.PI, 0); o.lineTo(wx + 28, hy + 96); o.fill(); o.fillStyle = '#ffd890'; o.beginPath(); o.moveTo(wx + 3, hy + 96); o.lineTo(wx + 3, hy + 54); o.arc(wx + 14, hy + 54, 11, Math.PI, 0); o.lineTo(wx + 25, hy + 96); o.fill(); }
  // festival garlands of wheat and flowers (Pentecost was the wheat-harvest feast)
  for (let i = 0; i < 2; i++) { const y0 = hy + 22 + i * 0; o.strokeStyle = '#7a9a3a'; o.lineWidth = 2; o.beginPath(); o.moveTo(hx, y0); o.quadraticCurveTo(hx + hw / 2, y0 + 30, hx + hw, y0); o.stroke(); }
  for (let k = 0; k <= 12; k++) { const tt = k / 12, x = hx + hw * tt, y = hy + 22 + 30 * 2 * tt * (1 - tt) * 1; o.fillStyle = ['#ee6c8a', '#f4d35e', '#ffffff', '#e8a33a'][k % 4]; o.beginPath(); o.arc(x, y + 2, 3.4, 0, 7); o.fill(); }
  // the street and square
  const sg = o.createLinearGradient(0, 440, 0, 640); sg.addColorStop(0, '#ecd0a0'); sg.addColorStop(1, '#c09060'); o.fillStyle = sg; o.fillRect(0, 440, W, 200);
  o.strokeStyle = 'rgba(140,90,50,0.25)'; o.lineWidth = 1.2; for (let y = 456; y < 640; y += 22) { o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); for (let x = (y / 22 % 2) * 20; x < W; x += 40) { o.beginPath(); o.moveTo(x, y); o.lineTo(x, y + 22); o.stroke(); } }
  // a happy crowd in the background, every skin tone
  const robes = Object.values(CL);
  for (let i = 0; i < 18; i++) { const x = 8 + i * 20 + r() * 6, y = 450 + (i % 2) * 5; P.person(o, x, y, 0.4, { skin: SK[Math.floor(r() * 6)], robe: robes[Math.floor(r() * robes.length)], hair: HR[Math.floor(r() * 6)], hairStyle: ['short', 'long', 'curly', 'bun'][Math.floor(r() * 4)], bounce: 0, expr: 'wow' }); }
  o.save(); o.globalCompositeOperation = 'screen'; glow(o, 180, 330, 260, '#ffd890', 0.22); o.restore();
}

MG.add({
  id: 'speak', stage: 'acts', cmd: 'SPEAK!', hint: 'tap', time: 5.5, mood: 'party', winText: 'We hear you!',
  card: { title: 'Wind and fire', ref: 'Acts 2:1–12', kind: 'Acts story', text: 'The book of Acts tells how, at the feast of Pentecost, a sound like a rushing wind filled the house where Jesus\'s friends were. Flames like fire rested on each of them. Visitors from many lands heard them praising God in their own languages.', ask: 'Do you know someone who speaks a different language? How could you help them feel at home?' },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level], vis = VISITORS.slice().sort(() => Math.random() - 0.5);
    s.people = SPOTS.slice(0, n).map(([x, y], i) => ({ x, y, hx: x, ...vis[i], sc: 1.06 + (y - 480) / 120 * 0.14, got: false, gotT: -9, phase: Math.random() * 6, from: i % DISCIPLES.length }));
    s.miss = []; s.winds = Array.from({ length: 5 }, (_, i) => ({ y: 120 + i * 70, ph: Math.random() * 6, sp: 70 + Math.random() * 50 }));
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = 50;
    for (const p of s.people) { if (p.got) continue; const d = Math.min(Math.hypot(x - p.x, y - (p.y - 40 * p.sc)), Math.hypot(x - (p.x + 22), y - (p.y - 100 * p.sc))); if (d < bd) { bd = d; best = p; } }
    if (!best) { s.miss.push({ x, y, t: g.t }); g.sfx('tap'); return; }
    best.got = true; best.gotT = g.t; g.sfx('pop'); g.sfx('chime');
    g.burst(best.x, best.y - 100 * best.sc, [best.col, '#fff6c0', '#ffd45a', '#ffffff'], 16, 170);
    if (s.people.every(p => p.got)) { g.win(); g.sfx('cheer'); }
  },
  update(g, dt) { const s = g.s; if (g.level > 0) for (const p of s.people) if (!p.got) p.x = p.hx + Math.sin(g.t * (0.9 + g.level * 0.6) + p.phase) * 8 * g.level; s.miss = s.miss.filter(m => g.t - m.t < 0.4); },
  auto(g, dt, synth) { const s = g.s, k = Math.floor((g.t - 0.4) / 0.28); if (g.t < 0.4 || k === s.botK) return; s.botK = k; const p = s.people.find(q => !q.got); if (p) { synth('down', p.x, p.y - 40 * p.sc); synth('up', p.x, p.y - 40 * p.sc); } },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win';
    c.drawImage(g.bake('acts_speak_bg', paintScene), 0, 0, W, H);
    P.rays(c, 180, ROOF - 20, W, H * 0.5, '#fff2c0', 0.1, 9, t);
    // the rushing wind: soft swirling ribbons across the sky
    c.save(); c.lineCap = 'round';
    for (const w of s.winds) { const x0 = ((t * w.sp * 2 + w.ph * 80) % 560) - 140; c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 3; c.beginPath();
      for (let k = 0; k <= 20; k++) { const x = x0 + k * 7, yy = w.y + Math.sin(k * 0.45 + t * 3 + w.ph) * 9; k ? c.lineTo(x, yy) : c.moveTo(x, yy); }
      c.stroke(); c.beginPath(); const ex = x0 + 140, ey = w.y + Math.sin(20 * 0.45 + t * 3 + w.ph) * 9; c.arc(ex + 6, ey - 8, 9, Math.PI * 0.5, Math.PI * 2.1); c.stroke(); }
    c.restore();
    // Jesus's friends on the roof terrace, with flames of light resting on them
    DISCIPLES.forEach((d, i) => {
      const x = 92 + i * 44, y = ROOF + 8;
      c.save(); c.beginPath(); c.rect(0, 0, W, ROOF - 6); c.clip();
      P.person(c, x, y - 22, 0.92, { ...d, t, phase: i * 1.4, bounce: 1.6, expr: won || i % 2 ? 'laugh' : 'happy', arms: won ? 'cheer' : ['wave', 'out', 'cheer', 'out', 'wave'][i] });
      c.restore();
      flame(c, x, y - 102 + Math.sin(t * 3 + i) * 2, 0.95, t, i);
    });
    // the parapet in front of their feet
    const pg = c.createLinearGradient(0, ROOF - 22, 0, ROOF + 4); pg.addColorStop(0, '#f8e2bc'); pg.addColorStop(1, '#c8986a'); c.fillStyle = pg; c.fillRect(54, ROOF - 22, 252, 26); c.fillStyle = '#ffeacc'; c.fillRect(54, ROOF - 22, 252, 3); c.fillStyle = 'rgba(140,90,50,0.3)'; for (let k = 0; k < 9; k++) c.fillRect(66 + k * 28, ROOF - 14, 14, 10);
    // visitors from many lands
    const list = s.people.slice().sort((a, b) => a.y - b.y);
    for (const p of list) {
      const q = t - p.gotT, sc = p.sc, by = p.y - 104 * sc + Math.sin(t * 2.4 + p.phase) * 2.5, bx = p.x + (p.x > 180 ? -6 : p.x < 180 ? 6 : 0), dir = p.x > 180 ? -1 : 1;
      if (!p.got) { const pu = 0.5 + 0.5 * Math.sin(t * 5 + p.phase); c.save(); c.globalCompositeOperation = 'screen'; const gl = c.createRadialGradient(p.x, p.y - 30 * sc, 6, p.x, p.y - 30 * sc, 56 * sc); gl.addColorStop(0, `rgba(255,236,170,${0.2 + 0.3 * pu})`); gl.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = gl; c.beginPath(); c.arc(p.x, p.y - 30 * sc, 56 * sc, 0, 7); c.fill(); c.restore(); }
      else { c.save(); c.globalCompositeOperation = 'screen'; glow(c, p.x, p.y - 36 * sc, 70 * sc, p.col, 0.45); c.restore(); }
      const cheer = p.got && (q < 0.8 || won);
      P.person(c, p.x, p.y, sc, { ...p.look, facing: p.x > 180 ? -1 : 1, t, phase: p.phase, bounce: p.got ? 2.4 : 0.8, expr: p.got ? 'laugh' : 'surprised', arms: cheer ? 'cheer' : p.got ? 'wave' : 'down' });
      if (!p.got) { // a jumbled bubble of sounds they can't understand
        bubble(c, bx, by, 17 * sc, 'rgba(255,252,244,0.85)', 'rgba(140,110,130,0.6)', dir);
        c.strokeStyle = 'rgba(120,100,130,0.7)'; c.lineWidth = 1.8; c.lineCap = 'round'; c.beginPath();
        for (let k = 0; k <= 16; k++) { const xx = bx - 11 * sc + k * 1.4 * sc, yy = by + Math.sin(k * 1.3 + t * 6 + p.phase) * 5 * sc * Math.sin(k / 16 * Math.PI); k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
      } else { // a glowing bubble with a picture of home
        const pop = q < 0.25 ? 0.6 + q / 0.25 * 0.55 : q < 0.4 ? 1.15 - (q - 0.25) / 0.15 * 0.15 : 1, r = 21 * sc * pop;
        c.save(); c.globalCompositeOperation = 'screen'; glow(c, bx, by, r * 2.2, '#ffe28a', 0.6); c.restore();
        bubble(c, bx, by, r, '#fffdf2', P.shade(p.col, -0.2), dir);
        icon(c, p.icon, bx, by, 0.95 * sc * pop, p.col);
        // a ribbon of light from the friend who spoke to them
        if (q < 0.5) { const fx = 92 + p.from * 44, fy = ROOF - 50; c.save(); c.globalAlpha = 1 - q / 0.5; c.strokeStyle = '#ffe9a0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx, fy); c.quadraticCurveTo((fx + bx) / 2 + 40, (fy + by) / 2 - 30, bx, by); c.stroke(); c.restore(); }
      }
    }
    for (const m of s.miss) { const q = (t - m.t) / 0.4; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(m.x, m.y, 8 + q * 18, 0, 7); c.stroke(); }
    if (won) for (let i = 0; i < 10; i++) { const a = t * 2 + i * 0.63, x = (i * 37 + t * 40) % W, y = 80 + ((t * 90 + i * 60) % 300); c.fillStyle = ['#ff8ab0', '#ffd45a', '#8fd8ff', '#a8e08a'][i % 4]; c.save(); c.translate(x, y); c.rotate(a); c.fillRect(-4, -2, 8, 4); c.restore(); }
    P.vignette(c, W, H, 0.25); P.grain(c, W, H, 0.06);
  },
});
