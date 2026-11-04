// CLIMB! — Luke 19:1–10. Short Zacchaeus can't see over the crowd; mash to scramble up the sycamore tree before Jesus walks past.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const ZAC = { skin: SK[1], robe: CL.saffron, stripe: CL.rust, sash: CL.royal, hairStyle: 'bald', beard: true, hair: HR[0] };
const TX = 286, BASE = 604, TOP = 318; // tree trunk x, Zacchaeus's feet on the ground and on the top branch
const STOP = 214;                       // where Jesus stops under the tree
const LEAF = '#5f9a48';

function leafBlob(c, x, y, r, col) { const g = c.createRadialGradient(x - r * 0.4, y - r * 0.5, 1, x, y, r); g.addColorStop(0, P.shade(col, 0.32)); g.addColorStop(0.7, col); g.addColorStop(1, P.shade(col, -0.12)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function fig(c, x, y) { const g = c.createRadialGradient(x - 1, y - 1, 0.5, x, y, 3.4); g.addColorStop(0, '#ffd27a'); g.addColorStop(1, '#c0603a'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill(); }
// the sycamore-fig: a thick short trunk, wide low branches and a broad canopy (back layer, baked)
function sycamore(c) {
  const r = P.rng(77);
  // canopy shadow mass
  for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, d = r(); const x = TX - 20 + Math.cos(a) * 120 * d, y = 236 + Math.sin(a) * 72 * d; c.fillStyle = P.shade(LEAF, -0.42); c.beginPath(); c.arc(x + 4, y + 6, 30 + r() * 16, 0, 7); c.fill(); }
  // trunk and branches
  const bark = c.createLinearGradient(TX - 30, 0, TX + 30, 0); bark.addColorStop(0, '#9a7a5a'); bark.addColorStop(0.45, '#c8a882'); bark.addColorStop(1, '#6e5038');
  c.fillStyle = bark; c.strokeStyle = '#4a3222'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(TX - 40, 620); c.quadraticCurveTo(TX - 22, 560, TX - 24, 450); c.quadraticCurveTo(TX - 30, 380, TX - 70, 330); c.lineTo(TX - 56, 318); c.quadraticCurveTo(TX - 14, 352, TX - 6, 380);
  c.quadraticCurveTo(TX - 4, 330, TX - 8, 290); c.lineTo(TX + 10, 290); c.quadraticCurveTo(TX + 12, 340, TX + 10, 372); c.quadraticCurveTo(TX + 30, 340, TX + 80, 318); c.lineTo(TX + 86, 332);
  c.quadraticCurveTo(TX + 34, 370, TX + 26, 450); c.quadraticCurveTo(TX + 26, 560, TX + 44, 620); c.closePath(); c.fill(); c.stroke();
  // bark: pale patches and grooves
  c.save(); c.clip(); for (let i = 0; i < 40; i++) { c.fillStyle = r() < 0.5 ? 'rgba(240,226,190,0.35)' : 'rgba(90,60,40,0.22)'; c.beginPath(); c.ellipse(TX - 30 + r() * 60, 300 + r() * 320, 3 + r() * 7, 6 + r() * 12, 0, 0, 7); c.fill(); }
  c.strokeStyle = 'rgba(70,45,30,0.35)'; c.lineWidth = 1.4; for (let i = 0; i < 6; i++) { const x = TX - 18 + i * 7; c.beginPath(); c.moveTo(x, 610); c.quadraticCurveTo(x + (r() - 0.5) * 10, 520, x - 2, 420); c.stroke(); } c.restore();
  // the leafy crown: darker clusters deep inside, sunlit ones on top and toward the sun (left)
  const blobs = []; for (let i = 0; i < 44; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); blobs.push([TX - 20 + Math.cos(a) * 130 * d, 230 + Math.sin(a) * 74 * d, 16 + r() * 13]); }
  blobs.sort((a, b) => b[1] - a[1] + (a[0] - b[0]) * 0.15);
  for (const [x, y, rr] of blobs) { const light = Math.max(0, Math.min(1, 0.55 - (y - 230) / 120 - (x - TX) / 420)); leafBlob(c, x, y, rr, P.mix(P.shade(LEAF, -0.25), P.shade(LEAF, 0.12), light)); }
  // leaf-shaped sparkles of light on the sunny side
  for (let i = 0; i < 40; i++) { const x = TX - 140 + r() * 200, y = 170 + r() * 90; c.fillStyle = `rgba(230,250,170,${0.25 + r() * 0.3})`; c.beginPath(); c.ellipse(x, y, 4, 2, -0.6 + r() * 1.2, 0, 7); c.fill(); }
  for (let i = 0; i < 14; i++) fig(c, TX - 130 + r() * 230, 200 + r() * 90);
}

MG.add({
  id: 'climb', stage: 'jesus', cmd: 'CLIMB!', hint: 'mash', time: 5, mood: 'desert', winText: 'I see!',
  card: { title: 'Up a tree', ref: 'Luke 19:1–10', kind: 'Story', text: 'Zacchaeus was a rich tax collector in Jericho, and people did not like him because he cheated them. He was too short to see over the crowd, so he climbed a sycamore tree, and Jesus stopped, looked up, and said he would come to Zacchaeus\'s house that very day. Zacchaeus was so glad that he gave half of what he owned to the poor and paid back everyone he had cheated.', ask: 'Who do people leave out at school or in your neighborhood? How could you be the one who stops and says hello?' },
  init(g) {
    const s = g.s; s.need = [9, 12, 15][g.level]; s.slip = [0.04, 0.09, 0.16][g.level];
    s.h = 0; s.kick = -9; s.taps = 0; s.top = false; s.topT = 0; s.leaves = []; s.fallT = -1; s.landed = false; s.jx = -40;
  },
  down(g) {
    const s = g.s; if (s.top) return;
    s.h = Math.min(1, s.h + 1 / s.need); s.kick = g.t; s.taps++;
    g.sfx(s.taps % 3 ? 'rustle' : 'tap');
    for (let i = 0; i < 2; i++) s.leaves.push({ x: TX - 60 + Math.random() * 120, y: 200 + Math.random() * 80, vx: (Math.random() - 0.5) * 40, vy: 30 + Math.random() * 40, rot: Math.random() * 6, t: g.t });
    if (s.h >= 1) { s.top = true; s.topT = g.t; g.sfx('ding'); g.sfx('cheer'); g.burst(TX, TOP - 50, ['#ffe27a', '#ffffff', '#a8e08a', '#ffb36a'], 22, 200); g.win(); }
  },
  update(g, dt) {
    const s = g.s;
    if (!s.top && !g.done && s.h > 0) s.h = Math.max(0, s.h - s.slip * dt);
    if (g.result === 'fail') { if (s.fallT < 0) { s.fallT = g.t; g.sfx('stretch'); } s.h = Math.max(0, s.h - dt * 2.6); if (s.h === 0 && !s.landed) { s.landed = true; g.sfx('thud'); g.burst(TX - 6, BASE - 4, ['#e8cfa0', '#d8b888', '#fff2d8'], 14, 120); } }
    // Jesus strolls along the street; he arrives under the tree just as time runs out
    const walk = -40 + (STOP + 30) * Math.min(1.2, g.t / g.dur);
    if (s.top) s.jx += (STOP - s.jx) * Math.min(1, dt * 7); else s.jx = g.result === 'fail' ? s.jx + 70 * dt : walk;
    for (const l of s.leaves) { l.x += (l.vx + Math.sin(g.t * 4 + l.rot) * 30) * dt; l.y += l.vy * dt; l.rot += dt * 3; }
    s.leaves = s.leaves.filter(l => g.t - l.t < 1.6);
  },
  auto(g, dt, synth) { const s = g.s; if (g.t > 0.3 && g.t - (s.botT || 0) > 0.11) { s.botT = g.t; synth('down', 180, 400); synth('up', 180, 400); } },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', failed = g.result === 'fail';
    c.drawImage(g.bake('jesus_climb_bg', o => {
      P.sky(o, W, H, ['#5e9ccf', '#a6cfe2', '#f8dcae', '#f6b884'], { x: 70, y: 150, r: 26, color: '#ffe2a0', glow: 260 });
      P.cloud(o, 210, 90, 0.7, '#fff6ea', '#e8c0b8', 0.9);
      // the Judean hills beyond Jericho
      P.hills(o, W, 330, 70, '#c79a94', '#b0827e', { seed: 51, freq: 0.009, dabs: 25, bottom: 420 });
      P.hills(o, W, 360, 40, '#d6ad86', '#c09070', { seed: 53, freq: 0.013, dabs: 25, bottom: 420 });
      // the city of palms: houses, an awning, date palms
      P.palm(o, 30, 400, 0.75, 0.12, 0, '#4f8a4a'); P.palm(o, 150, 396, 0.62, -0.1, 0, '#4a8a52');
      P.house(o, -4, 420, 56, 50, '#ecc896', { awning: CL.teal }); P.house(o, 58, 412, 46, 64, '#f2d2a2'); P.house(o, 110, 420, 60, 46, '#e2b884', { awning: CL.rose }); P.house(o, 176, 414, 50, 58, '#f0cc98', { window: false });
      // golden haze over the town
      const hz = o.createLinearGradient(0, 330, 0, 430); hz.addColorStop(0, 'rgba(255,226,170,0)'); hz.addColorStop(1, 'rgba(255,226,170,0.35)'); o.fillStyle = hz; o.fillRect(0, 330, W, 100);
      // the dusty street
      const st = o.createLinearGradient(0, 418, 0, 640); st.addColorStop(0, '#f0d4a0'); st.addColorStop(1, '#d4a46c'); o.fillStyle = st; o.fillRect(0, 418, W, 222);
      const r = P.rng(5); for (let i = 0; i < 70; i++) { o.fillStyle = r() < 0.5 ? 'rgba(255,240,210,0.35)' : 'rgba(150,100,60,0.18)'; o.beginPath(); o.ellipse(r() * W, 424 + r() * 216, 4 + r() * 12, 1.5 + r() * 2.5, 0, 0, 7); o.fill(); }
      for (let i = 0; i < 9; i++) { o.fillStyle = 'rgba(160,120,80,0.35)'; o.beginPath(); o.ellipse(r() * W, 430 + r() * 50, 6 + r() * 6, 3, 0, 0, 7); o.fill(); }
      P.rays(o, 70, 150, W, H, '#fff0c4', 0.12, 9, 0);
      sycamore(o);
      P.grassTufts(o, W, 600, 640, 18, '#9a9a4a', 3);
    }), 0, 0, W, H);
    // a soft golden glow on the top branch: the place to get to
    if (!s.top && !failed) { const pu = 0.5 + 0.5 * Math.sin(t * 5); const gl = c.createRadialGradient(TX, TOP - 26, 4, TX, TOP - 26, 56); gl.addColorStop(0, `rgba(255,240,170,${0.45 + 0.3 * pu})`); gl.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gl; c.beginPath(); c.arc(TX, TOP - 26, 56, 0, 7); c.fill();
      c.save(); c.globalAlpha = 0.6 + 0.4 * pu; c.fillStyle = '#fff6c8'; drawStar(c, TX + 30, TOP - 58, 6 + pu * 3, t); drawStar(c, TX - 30, TOP - 42, 4 + pu * 2, -t); c.restore(); }
    // Jesus and two friends walking down the street
    const jx = s.jx, walking = !s.top;
    P.person(c, jx - 70, 478, 0.92, { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly', t, phase: 1, bounce: walking ? 2 : 0.8, expr: won ? 'wow' : 'happy' });
    P.person(c, jx - 38, 484, 0.92, { skin: SK[1], robe: CL.olive, stripe: CL.cream, hair: HR[2], t, phase: 2.4, bounce: walking ? 2 : 0.8, expr: won ? 'wow' : 'happy' });
    const jg = c.createRadialGradient(jx, 448, 6, jx, 448, 70); jg.addColorStop(0, 'rgba(255,244,200,0.55)'); jg.addColorStop(1, 'rgba(255,244,200,0)'); c.fillStyle = jg; c.beginPath(); c.arc(jx, 448, 70, 0, 7); c.fill();
    P.person(c, jx, 492, 1.2, { ...JESUS, t, phase: 0, bounce: walking ? 2.2 : 0.8, expr: won && !walking ? 'laugh' : 'happy', arms: won && !walking ? 'wave' : 'down' });
    // the crowd lining the street, all taller than Zacchaeus
    const crowd = [
      [28, 568, { skin: SK[3], robe: CL.indigo, stripe: CL.gold, beard: true, hair: HR[0], head: 'wrap', headCol: CL.cream }],
      [82, 576, { skin: SK[1], robe: CL.rose, stripe: CL.cream, hairStyle: 'long', hair: HR[1] }],
      [140, 570, { skin: SK[2], robe: CL.teal, stripe: CL.saffron, beard: true, hair: HR[3] }],
      [196, 580, { skin: SK[0], robe: CL.plum, stripe: CL.gold, hairStyle: 'bun', hair: HR[2] }],
    ];
    crowd.forEach(([x, y, o], i) => P.person(c, x, y + 14, 1.2, { ...o, facing: -1, t, phase: i * 1.7, bounce: 1.4, expr: won ? 'wow' : 'happy', arms: i % 2 ? 'wave' : 'cheer' }));
    // Zacchaeus on the trunk
    const k = Math.max(0, 1 - (t - s.kick) / 0.15), zy = BASE - (BASE - TOP) * s.h - k * 6;
    const climbing = s.h > 0.02 && !s.top;
    const zexpr = failed ? 'surprised' : s.top ? 'laugh' : s.h > 0.02 ? 'wow' : 'sad';
    const zarms = failed ? 'up' : s.top ? 'wave' : climbing ? (s.taps % 2 ? 'up' : 'cheer') : 'reach';
    c.save(); if (failed && !s.landed) { c.translate(TX - 6, zy); c.rotate(Math.sin(t * 30) * 0.12); c.translate(-(TX - 6), -zy); }
    if (s.top) { // sitting on the branch: legs dangle
      c.fillStyle = '#6b4226'; const sw = Math.sin(t * 7) * 3; c.beginPath(); c.ellipse(TX - 14, zy + 10 + sw, 5, 3, 0, 0, 7); c.ellipse(TX + 6, zy + 10 - sw, 5, 3, 0, 0, 7); c.fill(); }
    P.person(c, TX - 4, zy, 1.05, { ...ZAC, t, phase: 3, bounce: s.top ? 2.4 : 0.6, expr: zexpr, arms: zarms, facing: -1 });
    c.restore();
    if (failed && s.landed) { const q = t - s.fallT; c.save(); c.globalAlpha = Math.max(0, 1 - q); c.fillStyle = '#fff2b0'; for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; drawStar(c, TX - 4 + Math.cos(a) * 18, BASE - 92 + Math.sin(a) * 6, 4, a); } c.restore(); }
    // front leaves and the branch he sits on, swaying, so he peeks out of the tree at the top
    c.save(); const lb = c.createLinearGradient(0, TOP - 6, 0, TOP + 14); lb.addColorStop(0, '#c8a882'); lb.addColorStop(1, '#6e5038'); c.fillStyle = lb; c.strokeStyle = '#4a3222'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(TX - 92, TOP + 2); c.quadraticCurveTo(TX - 30, TOP - 2, TX + 4, TOP + 6); c.quadraticCurveTo(TX + 50, TOP - 8, TX + 92, TOP - 18); c.lineTo(TX + 94, TOP - 12); c.quadraticCurveTo(TX + 40, TOP + 10, TX + 14, TOP + 30); c.quadraticCurveTo(TX - 30, TOP + 10, TX - 92, TOP + 8); c.closePath(); c.fill(); c.stroke(); c.restore();
    const sway = Math.sin(t * 1.6) * 2.5, fr = [[TX - 82, TOP + 4, 22], [TX - 54, TOP + 18, 18], [TX + 54, TOP + 2, 20], [TX + 82, TOP - 10, 22], [TX + 30, TOP + 20, 15]];
    for (const [x, y, r] of fr) leafBlob(c, x + sway, y, r, P.shade(LEAF, 0.06));
    for (const [x, y] of [[TX - 60, TOP + 6], [TX + 62, TOP - 4], [TX + 36, TOP + 22]]) fig(c, x + sway, y);
    for (const l of s.leaves) { c.save(); c.translate(l.x, l.y); c.rotate(l.rot); c.globalAlpha = Math.max(0, 1 - (t - l.t) / 1.6); c.fillStyle = '#7fb85a'; c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fill(); c.strokeStyle = '#4f7a3a'; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.stroke(); c.restore(); }
    if (won) { const q = t - s.topT; c.save(); c.globalAlpha = Math.min(1, q * 3); c.fillStyle = '#ff7a9a'; for (let i = 0; i < 3; i++) { const yy = TOP - 70 - ((q * 50 + i * 22) % 70); heart(c, (TX + STOP) / 2 + Math.sin(q * 3 + i * 2) * 14, yy + 90, 6); } c.restore(); }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
