// NAME! — God brings each new animal to the first human "to see what he would call them" (Genesis 2:19).
// A brand-new, very silly animal waits hopefully; tap any picture-name bubble. Every name is a good name, and the animal LOVES it.
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
const back = k => { k = Math.max(0, Math.min(1, k)); const c1 = 1.9; return 1 + (c1 + 1) * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const ICONS = ['cloud', 'star', 'banana', 'moon', 'flower', 'heart', 'sun', 'apple', 'drop', 'note'];
const COATS = [['wool', '#ffd0e0'], ['wool', '#c8f0d8'], ['wool', '#d8ccff'], ['spots', '#ffd27a'], ['spots', '#9ad8ff'], ['stripes', '#ffb07a'], ['stripes', '#b8e878']];
const AX = 180, AY = 560;

MG.add({
  id: 'name', stage: 'creation', cmd: 'NAME!', hint: 'tap', time: 5, mood: 'bright', winText: 'Perfect!',
  card: { title: 'What will you call it?', ref: 'Genesis 2:18–20', kind: 'Story', text: 'God brought every animal and bird to the first human to see what he would call them. Whatever he called each living creature, that became its name.', ask: 'If you met a brand-new animal, what would you name it?' },
  init(g) {
    const s = g.s, pick = a => a[Math.floor(Math.random() * a.length)];
    const coat = pick(COATS);
    s.a = { coat: coat[0], col: coat[1], neck: Math.random() < 0.55 ? 'long' : 'short', ears: pick(['bunny', 'elephant', 'horns', 'antlers']), tail: pick(['rainbow', 'curly', 'peacock', 'tuft']), mane: Math.random() < 0.35, face: pick(['#fff1e0', '#ffe2c8', '#f8e8ff']) };
    if (s.a.coat !== 'wool' && s.a.mane && s.a.ears === 'elephant') s.a.mane = false;
    const icons = ICONS.slice().sort(() => Math.random() - 0.5), n = [3, 3, 3][g.level];
    const xs = [72, 180, 288];
    s.bub = Array.from({ length: n }, (_, i) => ({ icon: icons[i], bx: xs[i], by: i === 1 ? 140 : 178, x: xs[i], y: 0, ph: Math.random() * 6, pop: -1 }));
    s.pick = null; s.pickT = 0; s.pokes = []; s.blink = 2 + Math.random();
  },
  update(g, dt) {
    const s = g.s, t = g.t, amp = [5, 14, 22][g.level];
    for (const b of s.bub) { b.x = b.bx + Math.sin(t * 1.4 * g.speed) * amp; b.y = b.by + Math.sin(t * 2 * g.speed + b.ph * 2) * (6 + amp * 0.6); }
  },
  down(g, x, y) {
    const s = g.s; if (s.pick) return;
    let best = null, bd = 50; for (const b of s.bub) { const d = Math.hypot(b.x - x, b.y - y); if (d < bd) { bd = d; best = b; } }
    if (!best) { s.pokes.push({ x, y, t: g.t }); g.sfx('boing'); return; }
    s.pick = best; s.pickT = g.t; s.fx = best.x; s.fy = best.y; for (const b of s.bub) if (b !== best) b.pop = g.t;
    g.sfx('pop'); g.burst(best.x, best.y, ['#ffffff', '#ffe6f6', '#d8f6ff'], 10, 120); g.win();
  },
  auto(g, dt, synth) { const s = g.s; if (g.t > 1.3 && !s.pick && !s.tapped) { s.tapped = 1; const b = s.bub[Math.floor(Math.random() * s.bub.length)]; synth('down', b.x, b.y); synth('up', b.x, b.y); } },
  draw(g, c) {
    const s = g.s, t = g.t, since = s.pick ? t - s.pickT : -1;
    c.drawImage(g.bake('creation_name_bg', paintMeadow), 0, 0, W, H);
    // light breathing through the trees
    P.rays(c, 300, -20, W, H, '#fff4cc', 0.12, 8, t);
    for (let i = 0; i < 14; i++) { const r = P.rng(i + 40), x = (r() * W + Math.sin(t * 0.6 + i) * 20), y = 260 + r() * 260 + Math.sin(t * 0.9 + i * 2) * 14, a = 0.4 + 0.4 * Math.sin(t * 2 + i); c.fillStyle = `rgba(255,250,200,${a * 0.6})`; c.beginPath(); c.arc(x, y, 1.6 + r() * 1.4, 0, 7); c.fill(); }
    // little friends peeking in from the edges
    const joy = since >= 0;
    P.lion(c, 48, 478, 1.1, { t, expr: joy ? 'happy' : 'sleep' }); P.dove(c, 318, 300 + Math.sin(t * 2) * 4, 0.7, { t, facing: -1, flying: false });
    P.sheep(c, 312, 490, 1.2, { t, facing: -1, hop: joy, phase: 1 });
    // the new animal
    const jump = joy ? Math.abs(Math.sin(since * 9)) * 26 * Math.max(0, 1 - since * 0.6) + 6 : 0;
    const squash = joy ? 1 + Math.sin(since * 18) * 0.05 * Math.max(0, 1 - since) : 1 + Math.sin(t * 3) * 0.015;
    // shadow
    c.fillStyle = 'rgba(40,60,20,0.22)'; c.beginPath(); c.ellipse(AX, AY + 2, 90 - jump * 0.6, 14, 0, 0, 7); c.fill();
    c.save(); c.translate(AX, AY - jump); c.scale(1.55 * (2 - squash), 1.55 * squash);
    drawCritter(c, s.a, t, joy ? since : -1, s.pick ? s.pick.icon : null, s);
    c.restore();
    // glow on naming
    if (joy) { const q = Math.min(1, since / 0.4), a = Math.max(0, 1 - since * 1.2); c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(AX, AY - 120, 0, AX, AY - 120, 200 * q + 1); gr.addColorStop(0, `rgba(255,236,180,${0.3 * a})`); gr.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = gr; c.fillRect(0, 200, W, 440); c.restore(); }
    // thought dots linking bubbles to the animal
    if (!joy) for (const b of s.bub) { for (let i = 1; i <= 3; i++) { const q = i / 4, x = b.x + (AX + 30 - b.x) * q * 0.55, y = b.y + 46 + (AY - 250 - b.y) * q * 0.7; c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.arc(x, y, 6 - i * 1.2, 0, 7); c.fill(); } }
    // bubbles
    for (const b of s.bub) {
      if (b === s.pick) continue;
      if (b.pop >= 0) { const q = (t - b.pop) / 0.3; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; drawBubble(c, b.x, b.y, 1 + q * 0.4, t, b.ph); c.restore(); continue; }
      drawBubble(c, b.x, b.y, 1, t, b.ph); drawIcon(c, b.icon, b.x, b.y, 1 + Math.sin(t * 4 + b.ph) * 0.06, t);
    }
    // the chosen name floats down and lands on the animal like a badge, then rains little copies
    if (s.pick) {
      const q = eo(since / 0.4), hx = AX + headOff(s.a)[0] * 1.55, hy = AY - jump + headOff(s.a)[1] * 1.55 - 70;
      const x = s.fx + (hx - s.fx) * q, y = s.fy + (hy - s.fy) * q - Math.sin(q * Math.PI) * 40;
      if (since < 0.4) { drawBubble(c, x, y, 1 - q * 0.4, t, 0); }
      drawIcon(c, s.pick.icon, x, y + (since > 0.4 ? Math.sin(t * 5) * 3 : 0), since < 0.4 ? 1.1 : back((since - 0.4) / 0.3) * 1.2, t);
      for (let i = 0; i < 6; i++) { const k = since * 1.1 - i * 0.08; if (k < 0 || k > 1) continue; const a = i * 1.05 + 0.3; c.save(); c.globalAlpha = 1 - k; drawIcon(c, s.pick.icon, hx + Math.cos(a) * k * 120, hy + 10 + Math.sin(a) * k * 50 - k * 60, 0.45, t); c.restore(); }
      for (let i = 0; i < 4; i++) { const k = (since * 0.9 - i * 0.18); if (k < 0 || k > 1) continue; c.save(); c.globalAlpha = 1 - k; drawIcon(c, 'heart', AX - 60 + i * 40 + Math.sin(k * 8 + i) * 8, AY - 160 - k * 120, 0.5, t); c.restore(); }
    }
    // pokes: a small giggle puff
    for (const p of s.pokes) { const q = (t - p.t) / 0.45; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.lineCap = 'round'; for (let i = 0; i < 5; i++) { const a = i * 1.257; c.beginPath(); c.moveTo(p.x + Math.cos(a) * (6 + q * 10), p.y + Math.sin(a) * (6 + q * 10)); c.lineTo(p.x + Math.cos(a) * (10 + q * 18), p.y + Math.sin(a) * (10 + q * 18)); c.stroke(); } c.restore(); }
    P.vignette(c, W, H, 0.25, '#2a4020'); P.grain(c, W, H, 0.06);
  },
});

function paintMeadow(o) {
  P.sky(o, W, H, ['#8fd0e8', '#c8ecf0', '#fff2d0', '#ffe0b0'], { x: 300, y: 70, r: 26, color: '#fff2c4', glow: 260 });
  P.cloud(o, 90, 90, 0.75, '#fffcf2', '#d8e4ee', 0.95); P.cloud(o, 220, 60, 0.45, '#fffcf2', '#d8e4ee', 0.85);
  // far blue hills, then rolling green
  P.hills(o, W, 300, 50, '#9cc8b8', '#7ab0a0', { seed: 12, freq: 0.009, dabs: 30 });
  P.hills(o, W, 350, 40, '#a8d47a', '#78b058', { seed: 14, freq: 0.011, dabs: 60, rim: '#e8f8b8' });
  // Eden's trees, heavy with fruit
  P.tree(o, 52, 360, 1.25, '#5a9a4a', 3); P.tree(o, 330, 352, 1.1, '#62a252', 6); P.tree(o, 250, 330, 0.7, '#6aa85a', 9);
  const r = P.rng(5); for (const [tx, ty, sc] of [[52, 360, 1.25], [330, 352, 1.1], [250, 330, 0.7]]) for (let i = 0; i < 7; i++) { const x = tx + (r() - 0.5) * 70 * sc, y = ty - 70 * sc + (r() - 0.5) * 40 * sc; const gr = o.createRadialGradient(x - 1.5, y - 1.5, 0.5, x, y, 5 * sc); gr.addColorStop(0, '#ffd0a0'); gr.addColorStop(1, ['#e8503a', '#f09a2a', '#d84a6a'][i % 3]); o.fillStyle = gr; o.beginPath(); o.arc(x, y, 4.5 * sc, 0, 7); o.fill(); }
  // a glinting stream curling across the meadow
  o.save(); o.lineCap = 'round'; const path = () => { o.beginPath(); o.moveTo(-20, 410); o.bezierCurveTo(90, 380, 170, 430, 240, 400); o.bezierCurveTo(300, 376, 340, 392, 380, 384); };
  o.strokeStyle = '#6ab0b8'; o.lineWidth = 18; path(); o.stroke(); o.strokeStyle = '#a8e4ea'; o.lineWidth = 10; path(); o.stroke(); o.strokeStyle = 'rgba(255,255,255,0.7)'; o.lineWidth = 2; o.setLineDash([8, 14]); path(); o.stroke(); o.restore();
  P.hills(o, W, 450, 26, '#b8e080', '#80b850', { seed: 18, freq: 0.01, dabs: 120, rim: '#effcc0' });
  P.grassTufts(o, W, 440, 640, 90, '#78b048', 3); P.flowers(o, W, 450, 640, 40, ['#ffffff', '#ffd84a', '#ff8ab0', '#c0a0ff'], 4);
  // a sunny clearing where the animal stands
  const gl = o.createRadialGradient(AX, AY - 10, 10, AX, AY - 10, 170); gl.addColorStop(0, 'rgba(255,248,200,0.5)'); gl.addColorStop(1, 'rgba(255,248,200,0)'); o.fillStyle = gl; o.fillRect(0, 380, W, 260);
}

function headOff(a) { return a.neck === 'long' ? [44, -150] : [42, -92]; }
// the silly animal, drawn in local units (about 140 wide), feet at y=0, facing right
function drawCritter(c, a, t, joy, icon, s) {
  const sway = Math.sin(t * 2.2) * 3, wag = joy >= 0 ? Math.sin(t * 22) * 0.35 : Math.sin(t * 3) * 0.12, col = a.col, dk = P.shade(col, -0.32), lt = P.shade(col, 0.35);
  const [hx0, hy0] = headOff(a), hx = hx0 + sway * (a.neck === 'long' ? 1.6 : 0.6), hy = hy0 + (joy >= 0 ? -4 : 0);
  // tail
  c.save(); c.translate(-46, -56); c.rotate(-0.3 + wag);
  if (a.tail === 'rainbow') { const cols = ['#ff5a5a', '#ffa04a', '#ffe04a', '#5ad06a', '#4a9aff', '#a06aff']; c.lineCap = 'round'; cols.forEach((cc, i) => { c.strokeStyle = cc; c.lineWidth = 7; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-30, -10 - i * 4, -44 + i * 3, -46 - i * 6, -18 + i * 6, -62 - i * 4); c.stroke(); }); c.fillStyle = '#fff'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(-18 + i * 14, -64 - i * 7, 6, 0, 7); c.fill(); } }
  else if (a.tail === 'curly') { c.strokeStyle = dk; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); for (let q = 0; q <= 1; q += 0.03) { const ang = q * 11, rr = 14 * (1 - q * 0.6); const x = -q * 34 + Math.cos(ang) * rr * 0.6, y = -q * 26 + Math.sin(ang) * rr * 0.6; q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  else if (a.tail === 'peacock') { for (let i = 0; i < 7; i++) { const ang = -Math.PI * 0.5 - 0.9 + i * 0.3; c.save(); c.rotate(ang + Math.PI / 2); const gr = c.createLinearGradient(0, 0, 0, -70); gr.addColorStop(0, '#2a8a7a'); gr.addColorStop(1, '#4ad0a0'); c.fillStyle = gr; c.beginPath(); c.ellipse(0, -40, 10, 36, 0, 0, 7); c.fill(); c.fillStyle = '#2a5ab0'; c.beginPath(); c.arc(0, -62, 7, 0, 7); c.fill(); c.fillStyle = '#ffd84a'; c.beginPath(); c.arc(0, -62, 3.5, 0, 7); c.fill(); c.restore(); } }
  else { c.strokeStyle = dk; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-26, -6, -30, -36); c.stroke(); c.fillStyle = '#ff7ab0'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-30 + Math.cos(i) * 7, -40 + Math.sin(i) * 7, 7, 0, 7); c.fill(); } c.fillStyle = '#ffc0dc'; c.beginPath(); c.arc(-32, -43, 5, 0, 7); c.fill(); }
  c.restore();
  // legs (stubby, with little hooves), happy tap-dance on joy
  const legs = [-34, -16, 18, 36];
  legs.forEach((lx, i) => { const kick = joy >= 0 ? Math.sin(t * 20 + i * 1.6) * 5 : 0; c.strokeStyle = P.shade(col, -0.18); c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx, -34); c.lineTo(lx + kick * 0.4, -7 - Math.max(0, kick)); c.stroke(); c.fillStyle = '#6a4a5a'; c.beginPath(); c.ellipse(lx + kick * 0.4, -4 - Math.max(0, kick), 7, 4.5, 0, 0, 7); c.fill(); });
  // neck
  const nx0 = 30, ny0 = -64;
  c.strokeStyle = P.shade(col, -0.06); c.lineWidth = a.neck === 'long' ? 20 : 26; c.lineCap = 'round'; c.beginPath(); c.moveTo(nx0, ny0); c.quadraticCurveTo(nx0 + 4 + sway * 0.4, (ny0 + hy) / 2, hx - 4, hy + 16); c.stroke();
  if (a.neck === 'long') { c.fillStyle = dk; for (let i = 1; i < 5; i++) { const q = i / 5; c.beginPath(); c.ellipse(nx0 + (hx - 4 - nx0) * q + (i % 2 ? 4 : -4), ny0 + (hy + 16 - ny0) * q, 4, 3, 0, 0, 7); c.fill(); } }
  // body
  c.save();
  if (a.coat === 'wool') { const puffs = [[-34, -62, 20], [-12, -72, 23], [12, -72, 22], [34, -62, 20], [-26, -44, 20], [0, -42, 22], [26, -44, 20], [0, -60, 24]];
    c.fillStyle = P.shade(col, -0.16); for (const [px, py, pr] of puffs) { c.beginPath(); c.arc(px + 2, py + 4, pr, 0, 7); c.fill(); }
    for (const [px, py, pr] of puffs) { const gr = c.createRadialGradient(px - pr * 0.4, py - pr * 0.5, 1, px, py, pr * 1.1); gr.addColorStop(0, lt); gr.addColorStop(1, P.shade(col, -0.04)); c.fillStyle = gr; c.beginPath(); c.arc(px, py, pr * 0.92, 0, 7); c.fill(); } }
  else { c.beginPath(); c.ellipse(0, -54, 54, 30, 0, 0, 7); const gr = c.createRadialGradient(-20, -74, 4, 0, -54, 60); gr.addColorStop(0, lt); gr.addColorStop(1, P.shade(col, -0.08)); c.fillStyle = gr; c.fill(); c.strokeStyle = P.shade(col, -0.4); c.lineWidth = 2; c.stroke(); c.clip();
    if (a.coat === 'spots') { c.fillStyle = dk; for (const [px, py, pr] of [[-30, -60, 8], [-8, -72, 7], [14, -56, 9], [36, -66, 6], [-20, -38, 6], [26, -38, 7], [0, -46, 5]]) { c.beginPath(); c.ellipse(px, py, pr * 1.2, pr, 0.3, 0, 7); c.fill(); } }
    else { c.strokeStyle = dk; c.lineWidth = 7; c.lineCap = 'round'; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 15 - 6, -88); c.quadraticCurveTo(i * 15 + 6, -54, i * 15 - 4, -22); c.stroke(); } }
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.ellipse(-14, -74, 26, 8, -0.15, 0, 7); c.fill(); }
  c.restore();
  // the new name stamped on the coat: little icons pop in one by one
  if (icon) { const spots = [[-28, -62], [6, -70], [30, -52], [-6, -46], [-36, -42]]; spots.forEach(([px, py], i) => { const k = back((joy - 0.35 - i * 0.07) / 0.25); if (k <= 0) return; drawIcon(c, icon, px, py, 0.32 * k, t); }); }
  // mane behind the head
  if (a.mane) { for (let i = 0; i < 14; i++) { const ang = i / 14 * Math.PI * 2; c.fillStyle = i % 2 ? '#ff9a5a' : '#ffbe6a'; c.beginPath(); c.arc(hx + Math.cos(ang) * 26, hy + Math.sin(ang) * 26, 12, 0, 7); c.fill(); } }
  // ears
  c.save(); c.translate(hx, hy);
  const perk = joy >= 0 ? Math.sin(t * 14) * 0.2 : Math.sin(t * 2.5) * 0.08;
  if (a.ears === 'bunny') { for (const sx of [-1, 1]) { c.save(); c.translate(sx * 10, -20); c.rotate(sx * 0.25 + perk * sx); c.fillStyle = a.face; c.strokeStyle = P.shade(a.face, -0.35); c.lineWidth = 2; c.beginPath(); c.ellipse(0, -26, 9, 28, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#ffb0c8'; c.beginPath(); c.ellipse(0, -24, 4.5, 20, 0, 0, 7); c.fill(); c.restore(); } }
  else if (a.ears === 'elephant') { for (const sx of [-1, 1]) { c.save(); c.translate(sx * 24, -2); c.rotate(sx * (0.2 + perk)); c.fillStyle = '#b8c0d8'; c.strokeStyle = '#7a84a8'; c.lineWidth = 2; c.beginPath(); c.ellipse(sx * 14, 4, 20, 26, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,150,170,0.45)'; c.beginPath(); c.ellipse(sx * 14, 4, 12, 18, 0, 0, 7); c.fill(); c.restore(); } }
  else if (a.ears === 'horns') { for (const sx of [-1, 1]) { c.strokeStyle = '#e8d0a0'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx * 12, -20); c.quadraticCurveTo(sx * 26, -38, sx * 14, -48); c.stroke(); c.fillStyle = a.face; c.beginPath(); c.ellipse(sx * 26, -10, 10, 5, sx * 0.5 + perk, 0, 7); c.fill(); } }
  else { c.strokeStyle = '#a8784a'; c.lineWidth = 4.5; c.lineCap = 'round'; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 10, -20); c.lineTo(sx * 22, -50); c.moveTo(sx * 16, -36); c.lineTo(sx * 30, -40); c.moveTo(sx * 20, -46); c.lineTo(sx * 14, -60); c.stroke(); c.fillStyle = a.face; c.beginPath(); c.ellipse(sx * 26, -8, 10, 5, sx * 0.5 + perk, 0, 7); c.fill(); } }
  // head
  const hg = c.createRadialGradient(-8, -10, 2, 0, 0, 32); hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.3, a.face); hg.addColorStop(1, P.shade(a.face, -0.12)); c.fillStyle = hg; c.strokeStyle = P.shade(a.face, -0.4); c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 28, 26, 0, 0, 7); c.fill(); c.stroke();
  // muzzle
  c.fillStyle = P.shade(a.face, -0.06); c.beginPath(); c.ellipse(4, 12, 15, 10, 0, 0, 7); c.fill();
  c.fillStyle = '#7a4a5a'; c.beginPath(); c.ellipse(-1, 9, 2, 1.5, 0, 0, 7); c.ellipse(9, 9, 2, 1.5, 0, 0, 7); c.fill();
  // eyes: big and hopeful, watching the bubbles; squeezed shut with joy once named
  const blink = joy < 0 && (t % 2.6) > 2.48;
  for (const ex of [-11, 13]) {
    if (joy >= 0 || blink) { c.strokeStyle = '#2a1820'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); if (joy >= 0) c.arc(ex, -2, 6, 1.15 * Math.PI, 1.85 * Math.PI); else { c.moveTo(ex - 5, -4); c.lineTo(ex + 5, -4); } c.stroke(); continue; }
    c.fillStyle = '#2a1820'; c.beginPath(); c.ellipse(ex, -5, 6, 7.5, 0, 0, 7); c.fill();
    c.fillStyle = '#6a4a5a'; c.beginPath(); c.ellipse(ex, -2, 4, 3.5, 0, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex - 1.5 + Math.sin(t * 1.3) * 1.2, -9, 2.6, 0, 7); c.fill(); c.beginPath(); c.arc(ex + 2, -2, 1.1, 0, 7); c.fill();
  }
  c.fillStyle = 'rgba(255,110,140,0.4)'; c.beginPath(); c.ellipse(-20, 6, 6, 3.5, 0, 0, 7); c.ellipse(24, 6, 6, 3.5, 0, 0, 7); c.fill();
  // mouth: a hopeful little 'o', then a huge open grin
  if (joy >= 0) { c.fillStyle = '#8a2a3a'; c.beginPath(); c.moveTo(-6, 15); c.quadraticCurveTo(4, 32, 14, 15); c.closePath(); c.fill(); c.fillStyle = '#ff8aa0'; c.beginPath(); c.ellipse(4, 22, 4.5, 2.6, 0, 0, 7); c.fill(); }
  else { c.fillStyle = '#8a2a3a'; c.beginPath(); c.ellipse(4, 18, 3, 3.6 + Math.sin(t * 3) * 0.6, 0, 0, 7); c.fill(); }
  c.restore();
}
function drawBubble(c, x, y, s, t, ph) {
  const r = 40 * s, wob = Math.sin(t * 3 + ph) * 1.5;
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(80,120,60,0.14)'; c.beginPath(); c.ellipse(4, 6, r, r - wob, 0, 0, 7); c.fill();
  const g = c.createRadialGradient(-r * 0.35, -r * 0.4, 2, 0, 0, r); g.addColorStop(0, 'rgba(255,255,255,0.98)'); g.addColorStop(0.75, 'rgba(255,252,244,0.92)'); g.addColorStop(1, 'rgba(230,240,255,0.85)'); c.fillStyle = g;
  c.beginPath(); c.ellipse(0, 0, r + wob, r - wob, 0, 0, 7); c.fill();
  // iridescent rim
  const rim = c.createLinearGradient(-r, -r, r, r); rim.addColorStop(0, '#ffb0d8'); rim.addColorStop(0.5, '#b0e8ff'); rim.addColorStop(1, '#ffe8a0'); c.strokeStyle = rim; c.lineWidth = 3.5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(-r * 0.45, -r * 0.5, r * 0.18, r * 0.09, -0.7, 0, 7); c.fill();
  c.restore();
}
function drawIcon(c, k, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s); c.lineJoin = 'round'; c.lineCap = 'round';
  const fill = (col, line) => { c.fillStyle = col; c.fill(); c.strokeStyle = line; c.lineWidth = 2.5; c.stroke(); };
  if (k === 'cloud') { c.beginPath(); c.arc(-10, 4, 10, Math.PI * 0.5, Math.PI * 1.5); c.arc(-2, -6, 12, Math.PI, Math.PI * 1.9); c.arc(12, -1, 10, Math.PI * 1.3, Math.PI * 0.5); c.closePath(); fill('#ffffff', '#8aa8d8'); c.fillStyle = 'rgba(160,190,240,0.4)'; c.beginPath(); c.ellipse(2, 9, 16, 3, 0, 0, 7); c.fill(); }
  else if (k === 'star') { c.fillStyle = '#ffd23a'; drawStar(c, 0, 0, 20, 0); c.strokeStyle = '#d88a1a'; c.lineWidth = 2.5; c.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? 9 : 20, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.stroke(); c.fillStyle = '#fff6c0'; c.beginPath(); c.arc(-4, -4, 3, 0, 7); c.fill(); }
  else if (k === 'banana') { c.beginPath(); c.moveTo(-18, -6); c.quadraticCurveTo(-8, 18, 18, 4); c.quadraticCurveTo(20, 10, 14, 12); c.quadraticCurveTo(-14, 22, -20, -4); c.closePath(); fill('#ffe04a', '#c89a1a'); c.fillStyle = '#6a4a2a'; c.beginPath(); c.arc(-19, -6, 2.5, 0, 7); c.fill(); }
  else if (k === 'moon') { c.save(); c.beginPath(); c.rect(-30, -30, 60, 60); c.arc(9, -5, 14, 0, 7, true); c.clip('evenodd'); c.beginPath(); c.arc(0, 0, 18, 0, 7); fill('#fff0a8', '#d8b04a'); c.restore(); c.save(); c.beginPath(); c.arc(0, 0, 18, 0, 7); c.clip(); c.strokeStyle = '#d8b04a'; c.lineWidth = 2.5; c.beginPath(); c.arc(9, -5, 14, 0, 7); c.stroke(); c.restore(); c.fillStyle = '#e8c860'; c.beginPath(); c.arc(-9, 4, 2.2, 0, 7); c.arc(-4, 11, 1.6, 0, 7); c.fill(); }
  else if (k === 'flower') { for (let i = 0; i < 5; i++) { const a = i * 1.2566 + t * 0.5; c.beginPath(); c.arc(Math.cos(a) * 11, Math.sin(a) * 11, 9, 0, 7); fill('#ff8ab8', '#d0507a'); } c.beginPath(); c.arc(0, 0, 7, 0, 7); fill('#ffd84a', '#d89a1a'); }
  else if (k === 'heart') { c.beginPath(); c.moveTo(0, 16); c.bezierCurveTo(-24, 0, -16, -20, 0, -8); c.bezierCurveTo(16, -20, 24, 0, 0, 16); fill('#ff5a7a', '#c02a4a'); c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(-8, -6, 4, 2.5, -0.6, 0, 7); c.fill(); }
  else if (k === 'sun') { c.strokeStyle = '#f0a020'; c.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t; c.beginPath(); c.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); c.lineTo(Math.cos(a) * 21, Math.sin(a) * 21); c.stroke(); } c.beginPath(); c.arc(0, 0, 11, 0, 7); fill('#ffd23a', '#e09020'); }
  else if (k === 'apple') { c.beginPath(); c.moveTo(0, -10); c.bezierCurveTo(-22, -20, -24, 16, -4, 18); c.quadraticCurveTo(0, 16, 4, 18); c.bezierCurveTo(24, 16, 22, -20, 0, -10); fill('#ff5a4a', '#b82a2a'); c.strokeStyle = '#6a4a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -10); c.lineTo(2, -18); c.stroke(); c.beginPath(); c.ellipse(9, -17, 7, 3.5, -0.4, 0, 7); fill('#6ac04a', '#3a8a2a'); }
  else if (k === 'drop') { c.beginPath(); c.moveTo(0, -20); c.bezierCurveTo(8, -6, 15, 2, 15, 7); c.arc(0, 7, 15, 0, Math.PI); c.bezierCurveTo(-15, 2, -8, -6, 0, -20); fill('#6ac8ff', '#2a7ac0'); c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(-5, 6, 3, 5, 0.3, 0, 7); c.fill(); }
  else { c.strokeStyle = '#7a4ad0'; c.lineWidth = 4; c.beginPath(); c.moveTo(-4, 10); c.lineTo(-4, -16); c.lineTo(12, -20); c.lineTo(12, 6); c.stroke(); c.beginPath(); c.ellipse(-10, 11, 7, 5.5, -0.4, 0, 7); fill('#9a6aff', '#5a2ab0'); c.beginPath(); c.ellipse(6, 7, 7, 5.5, -0.4, 0, 7); fill('#9a6aff', '#5a2ab0'); }
  c.restore();
}
