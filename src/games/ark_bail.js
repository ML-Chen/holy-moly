// BAIL! — a stormy night inside the lamp-lit ark: plug each squirting leak before the water rises to the animals' feet (Genesis 7:17–8:1).
const FLOOR = 486, START = 606;              // water starts below the deck and must not reach the deck top (the animals' feet)
const SPOTS = [[62, 236], [150, 214], [252, 232], [318, 300], [44, 352], [132, 318], [226, 336], [300, 404], [94, 412], [196, 412]];
function waterY(h) { return START + (FLOOR - START) * Math.min(1, h); }
// a hanging lantern on a chain
function lantern(c, px, py, len, ang, t, k) {
  const x = px + Math.sin(ang) * len, y = py + Math.cos(ang) * len;
  c.strokeStyle = '#3a2416'; c.lineWidth = 1.6; c.setLineDash([3, 2]); c.beginPath(); c.moveTo(px, py); c.lineTo(x, y - 14); c.stroke(); c.setLineDash([]);
  c.save(); c.translate(x, y); c.rotate(-ang);
  c.fillStyle = '#4a2c18'; c.beginPath(); c.moveTo(-9, -12); c.lineTo(9, -12); c.lineTo(5, -18); c.lineTo(-5, -18); c.closePath(); c.fill();
  const fl = 0.85 + 0.15 * Math.sin(t * 17 + k) * Math.sin(t * 7 + k * 2);
  const gg = c.createRadialGradient(0, 2, 1, 0, 2, 12); gg.addColorStop(0, '#fff7d0'); gg.addColorStop(0.5, '#ffcf6a'); gg.addColorStop(1, '#e08a2a'); c.fillStyle = gg; roundRect(c, -8, -12, 16, 24, 4); c.fill();
  c.fillStyle = '#fffbe8'; c.beginPath(); c.ellipse(0, 3 - fl * 2, 2.6, 5.5 * fl, 0, 0, 7); c.fill();
  c.strokeStyle = '#4a2c18'; c.lineWidth = 2; roundRect(c, -8, -12, 16, 24, 4); c.stroke(); c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 12); c.stroke();
  c.fillStyle = '#4a2c18'; c.fillRect(-10, 11, 20, 4); c.restore();
  return [x, y, fl];
}
function umbrella(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(t * 2.2) * 0.06 - 0.12);
  c.strokeStyle = '#4a2a1a'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -70); c.stroke(); c.beginPath(); c.arc(-4, 0, 4, 0, Math.PI); c.stroke();
  const cy = -66, r = 36, n = 6;
  for (let i = 0; i < n; i++) { const a0 = Math.PI + i * Math.PI / n, a1 = a0 + Math.PI / n; c.fillStyle = i % 2 ? '#ffd45a' : '#e8604a'; c.beginPath(); c.moveTo(0, cy);
    c.lineTo(Math.cos(a0) * r, cy + Math.sin(a0) * r * 0.8); c.quadraticCurveTo(Math.cos((a0 + a1) / 2) * r * 1.02, cy + Math.sin((a0 + a1) / 2) * r * 0.8 - 2, Math.cos(a1) * r, cy + Math.sin(a1) * r * 0.8);
    c.closePath(); c.fill(); }
  c.fillStyle = 'rgba(80,20,20,0.25)'; c.beginPath(); for (let i = 0; i <= n; i++) { const xx = -r + i * 2 * r / n; i ? c.quadraticCurveTo(xx - r / n, cy + 7, xx, cy) : c.moveTo(xx, cy); } c.lineTo(r, cy + 1); c.lineTo(-r, cy + 1); c.fill();
  c.strokeStyle = '#7a2a1a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-r, cy); c.quadraticCurveTo(-r, cy - r * 0.95, 0, cy - r * 0.82); c.quadraticCurveTo(r, cy - r * 0.95, r, cy); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-12, cy - 20, 10, 4, -0.5, 0, 7); c.fill();
  c.fillStyle = '#4a2a1a'; c.beginPath(); c.arc(0, cy - r * 0.82 - 3, 3, 0, 7); c.fill(); c.restore();
}
// leaks: a crack in the plank, a wobbling jet, then a cork plug
function drawLeaks(c, s, t, wy) {
    for (const l of s.leaks) {
      if (!l.open) continue;
      if (l.plugged) { const q = Math.min(1, (t - l.plugged) / 0.25), b = 1 + Math.sin(q * Math.PI) * 0.5;
        c.save(); c.translate(l.x, l.y); c.scale(b, b); const pg = c.createRadialGradient(-3, -3, 1, 0, 0, 10); pg.addColorStop(0, '#f0c890'); pg.addColorStop(1, '#a8743a'); c.fillStyle = pg; c.strokeStyle = '#5a3418'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(90,52,24,0.6)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.stroke(); c.restore();
        if (t - l.plugged < 0.6) { c.save(); c.globalAlpha = 1 - (t - l.plugged) / 0.6; c.strokeStyle = '#fff6c0'; c.lineWidth = 3; c.beginPath(); c.arc(l.x, l.y, 12 + (t - l.plugged) * 50, 0, 7); c.stroke(); c.restore(); }
        continue; }
      const age = t - l.openT, grow = Math.min(1, age * 4), p = 0.5 + 0.5 * Math.sin(t * 8 + l.x);
      // target glow
      c.save(); c.globalCompositeOperation = 'lighter'; const tg = c.createRadialGradient(l.x, l.y, 2, l.x, l.y, 34); tg.addColorStop(0, `rgba(140,220,255,${0.35 + 0.25 * p})`); tg.addColorStop(1, 'rgba(140,220,255,0)'); c.fillStyle = tg; c.beginPath(); c.arc(l.x, l.y, 34, 0, 7); c.fill(); c.restore();
      c.strokeStyle = `rgba(220,245,255,${0.5 + 0.4 * p})`; c.lineWidth = 2.5; c.beginPath(); c.arc(l.x, l.y, 16 + p * 5, 0, 7); c.stroke();
      c.strokeStyle = '#1a0c06'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(l.x - 8, l.y - 3); c.lineTo(l.x - 2, l.y + 1); c.lineTo(l.x + 3, l.y - 2); c.lineTo(l.x + 9, l.y + 2); c.stroke();
      // the jet spouts out, then falls in a stream of drops into the water below the deck
      const jx = l.x + l.dir * 46 * grow, jy = l.y + 34 * grow, wob = Math.sin(t * 20 + l.y) * 2.5;
      c.save(); c.lineCap = 'round';
      for (const [lw, col] of [[8 * grow, 'rgba(120,190,230,0.45)'], [4 * grow, 'rgba(225,248,255,0.95)']]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(l.x, l.y); c.quadraticCurveTo(l.x + l.dir * 30 + wob, l.y - 12, jx, jy); c.stroke(); }
      c.fillStyle = 'rgba(230,250,255,0.9)'; if (grow >= 1) for (let i = 0; i < 6; i++) { const q = (t * 1.8 + i / 6) % 1, dy = jy + q * (wy - jy); if (dy > wy) continue; c.beginPath(); c.ellipse(jx + Math.sin(i * 2.3) * 2, dy, 2.2, 3.4, 0, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(220,245,255,0.8)'; for (let i = 0; i < 4; i++) { const a2 = t * 9 + i * 1.6; c.beginPath(); c.arc(jx + Math.cos(a2) * 5, jy + 3 + Math.abs(Math.sin(a2)) * 4, 1.6, 0, 7); c.fill(); }
      c.restore();
    }
}
let DARK = null; function darkLayer() { if (!DARK) { DARK = document.createElement('canvas'); DARK.width = W; DARK.height = H; } return DARK; }
MG.add({
  id: 'bail', stage: 'ark', cmd: 'BAIL!', hint: 'tap', time: 5, mood: 'storm', winText: 'Snug!',
  card: { title: 'Safe in the storm', ref: 'Genesis 7:17–8:1', kind: 'Story', text: 'For a long time the rain fell and the ark floated on the deep water. Noah, his family and all the animals were kept safe inside, and God remembered Noah and every animal with him.', ask: 'What helps you feel safe when there is a storm or something scary? Who could you help feel safe?' },
  init(g) {
    const s = g.s, n = [3, 4, 6][g.level], spots = SPOTS.slice().sort(() => Math.random() - 0.5), d = g.dur;
    s.leaks = Array.from({ length: n }, (_, i) => ({ x: spots[i][0], y: spots[i][1], at: d * (i < 2 ? 0.04 + i * 0.06 : 0.12 + (i - 1) / (n - 1) * 0.42), plugged: 0, dir: spots[i][0] < 180 ? 1 : -1, open: false }));
    s.h = 0; s.r = [0.115, 0.13, 0.15][g.level] * g.speed; s.hitR = [44, 38, 32][g.level];
    s.flash = 0; s.nextFlash = 0.5 + Math.random() * 0.6; s.taps = []; s.splashes = []; s.won = 0;
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = s.hitR;
    for (const l of s.leaks) { if (!l.open || l.plugged) continue; const d = Math.hypot(l.x - x, l.y - y); if (d < bd) { bd = d; best = l; } }
    if (!best) { s.taps.push({ x, y, t: g.t }); g.sfx('tap'); return; }
    best.plugged = g.t; g.sfx('thud'); g.sfx('pop'); g.burst(best.x, best.y, ['#9fe0ff', '#ffffff', '#ffd45a'], 12, 150);
    if (s.leaks.every(l => l.plugged)) { s.won = g.t; g.sfx('cheer'); g.win(); }
  },
  update(g, dt) {
    const s = g.s;
    for (const l of s.leaks) if (!l.open && g.t >= l.at && !g.done) { l.open = true; l.openT = g.t; g.sfx('splash'); }
    const open = s.leaks.filter(l => l.open && !l.plugged).length;
    if (!g.done) { s.h += open * s.r * dt; if (s.h >= 1) { s.h = 1; g.fail(); g.sfx('splashbig'); g.sfx('laugh'); for (const x of [112, 212, 278]) g.burst(x, FLOOR, ['#bfe8ff', '#ffffff', '#7fc8e8'], 10, 170); } }
    else if (g.result === 'win') s.h = Math.max(0, s.h - dt * 0.4);
    s.flash = Math.max(0, s.flash - dt * 2.6);
    if (g.t > s.nextFlash) { s.flash = 1; s.nextFlash = g.t + 1.6 + Math.random() * 1.4; g.sfx('thunder'); }
    if (Math.random() < open * dt * 6) { const l = s.leaks.filter(l => l.open && !l.plugged)[Math.floor(Math.random() * open)]; if (l) s.splashes.push({ x: l.x + l.dir * 46 + (Math.random() - 0.5) * 12, t: g.t }); }
    s.splashes = s.splashes.filter(p => g.t - p.t < 0.5);
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.35) return;
    const l = s.leaks.find(l => l.open && !l.plugged && g.t - l.openT > 0.18);
    if (l && g.t - (s.botT || 0) > 0.22) { s.botT = g.t; synth('down', l.x + 6, l.y + 4); synth('up', l.x + 6, l.y + 4); }
  },
  draw(g, c) {
    const s = g.s, t = g.t, wy = waterY(s.h), rock = Math.sin(t * 1.3) * 0.018;
    c.fillStyle = '#1c1018'; c.fillRect(0, 0, W, H);
    c.save(); c.translate(180, 380); c.rotate(rock); c.scale(1.05, 1.05); c.translate(-180, -380);
    c.drawImage(g.bake('ark_bail_bg', o => {
      // back wall of curved hull planks, warm and dim
      const wall = o.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#2e1a14'); wall.addColorStop(0.35, '#6a3e24'); wall.addColorStop(0.75, '#7a4a2a'); wall.addColorStop(1, '#3a2218'); o.fillStyle = wall; o.fillRect(0, 0, W, H);
      const r = P.rng(41);
      for (let i = 0; i < 12; i++) { const y0 = 70 + i * 34; o.fillStyle = P.rgba(i % 2 ? '#8a5430' : '#76452a', 0.55); o.beginPath(); o.moveTo(0, y0 - 10); o.quadraticCurveTo(180, y0 + 10, W, y0 - 10); o.lineTo(W, y0 + 22); o.quadraticCurveTo(180, y0 + 42, 0, y0 + 22); o.closePath(); o.fill();
        o.strokeStyle = 'rgba(30,14,8,0.55)'; o.lineWidth = 2; o.beginPath(); o.moveTo(0, y0 + 22); o.quadraticCurveTo(180, y0 + 42, W, y0 + 22); o.stroke();
        o.strokeStyle = 'rgba(255,200,140,0.12)'; o.lineWidth = 1.5; o.beginPath(); o.moveTo(0, y0 - 8); o.quadraticCurveTo(180, y0 + 12, W, y0 - 8); o.stroke();
        for (let k = 0; k < 4; k++) { const gx = r() * W; o.strokeStyle = 'rgba(40,20,10,0.25)'; o.lineWidth = 1; o.beginPath(); o.moveTo(gx, y0 + 4 + r() * 10); o.lineTo(gx + 30 + r() * 40, y0 + 8 + r() * 10); o.stroke(); }
        for (let k = 0; k < 3; k++) { o.fillStyle = 'rgba(30,14,8,0.6)'; o.beginPath(); o.arc(r() * W, y0 + 6 + r() * 10, 1.6, 0, 7); o.fill(); } }
      // curved ribs
      for (const rx of [20, 180, 340]) { const rg = o.createLinearGradient(rx - 12, 0, rx + 12, 0); rg.addColorStop(0, '#4a2a18'); rg.addColorStop(0.4, '#9a6238'); rg.addColorStop(1, '#3a2010'); o.fillStyle = rg; o.beginPath(); o.moveTo(rx - 11, 40); o.quadraticCurveTo(rx - 11 + (rx - 180) * 0.12, 300, rx - 11, FLOOR); o.lineTo(rx + 11, FLOOR); o.quadraticCurveTo(rx + 11 + (rx - 180) * 0.12, 300, rx + 11, 40); o.closePath(); o.fill(); }
      // ceiling beam
      const cb = o.createLinearGradient(0, 30, 0, 70); cb.addColorStop(0, '#5a341e'); cb.addColorStop(1, '#2a160e'); o.fillStyle = cb; o.fillRect(0, 34, W, 32); o.fillStyle = 'rgba(255,200,140,0.18)'; o.fillRect(0, 34, W, 3);
      o.fillStyle = '#1e100a'; o.fillRect(0, 0, W, 34);
      // round portholes (their stormy view is drawn live)
      for (const [px, py] of [[100, 140], [260, 140]]) { o.fillStyle = '#3a2214'; o.beginPath(); o.arc(px, py, 31, 0, 7); o.fill(); o.strokeStyle = '#a06a3a'; o.lineWidth = 4; o.beginPath(); o.arc(px, py, 27, 0, 7); o.stroke(); }
      // the deck the animals stand on: straw on top, planks in front
      const dk = o.createLinearGradient(0, FLOOR - 14, 0, FLOOR + 8); dk.addColorStop(0, '#e2b660'); dk.addColorStop(1, '#a8742e'); o.fillStyle = dk; o.fillRect(0, FLOOR - 14, W, 22);
      o.strokeStyle = '#f2d080'; o.lineWidth = 1.3; for (let i = 0; i < 160; i++) { const sx = r() * W, sy = FLOOR - 16 + r() * 18, a = (r() - 0.5) * 1.2; o.beginPath(); o.moveTo(sx, sy); o.lineTo(sx + Math.cos(a) * 9, sy + Math.sin(a) * 4); o.stroke(); }
      const fr = o.createLinearGradient(0, FLOOR + 8, 0, H); fr.addColorStop(0, '#6a3e22'); fr.addColorStop(1, '#2e180e'); o.fillStyle = fr; o.fillRect(0, FLOOR + 8, W, H - FLOOR);
      o.strokeStyle = 'rgba(20,10,6,0.6)'; o.lineWidth = 2; for (let i = 0; i < 5; i++) { o.beginPath(); o.moveTo(0, FLOOR + 32 + i * 28); o.lineTo(W, FLOOR + 32 + i * 28); o.stroke(); }
      o.fillStyle = 'rgba(255,220,150,0.25)'; o.fillRect(0, FLOOR + 6, W, 3);
      // a hay bale and a sack of grain at the back
      o.fillStyle = '#c89a48'; roundRect(o, 4, FLOOR - 52, 64, 42, 6); o.fill(); o.strokeStyle = '#8a6020'; o.lineWidth = 2; o.stroke(); o.strokeStyle = '#7a4a1e'; o.beginPath(); o.moveTo(22, FLOOR - 52); o.lineTo(22, FLOOR - 10); o.moveTo(50, FLOOR - 52); o.lineTo(50, FLOOR - 10); o.stroke();
      o.strokeStyle = '#ecc870'; o.lineWidth = 1; for (let i = 0; i < 30; i++) { const sx = 6 + r() * 60, sy = FLOOR - 50 + r() * 38; o.beginPath(); o.moveTo(sx, sy); o.lineTo(sx + 6, sy + (r() - 0.5) * 4); o.stroke(); }
      o.fillStyle = '#b0946a'; o.beginPath(); o.moveTo(312, FLOOR - 10); o.quadraticCurveTo(304, FLOOR - 50, 322, FLOOR - 58); o.lineTo(344, FLOOR - 58); o.quadraticCurveTo(360, FLOOR - 50, 352, FLOOR - 10); o.closePath(); o.fill(); o.strokeStyle = '#6a5034'; o.stroke();
    }), 0, 0, W, H);
    // storm outside the portholes
    for (const [px, py, k] of [[100, 140, 0], [260, 140, 1]]) {
      c.save(); c.beginPath(); c.arc(px, py, 26, 0, 7); c.clip();
      const sg = c.createLinearGradient(0, py - 26, 0, py + 26); sg.addColorStop(0, s.flash > 0.5 ? '#c8c8ff' : '#2a2e5a'); sg.addColorStop(1, '#141a38'); c.fillStyle = sg; c.fillRect(px - 26, py - 26, 52, 52);
      c.fillStyle = 'rgba(20,28,60,0.9)'; c.beginPath(); for (let x = px - 30; x <= px + 30; x += 3) c.lineTo(x, py + 8 + Math.sin(x * 0.15 + t * 3 + k) * 4); c.lineTo(px + 30, py + 30); c.lineTo(px - 30, py + 30); c.fill();
      c.strokeStyle = 'rgba(200,215,255,0.6)'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 8; i++) { const rx = px - 26 + ((i * 13 + t * 90) % 60), ry = py - 26 + ((i * 23 + t * 260) % 52); c.moveTo(rx, ry); c.lineTo(rx - 3, ry + 9); } c.stroke();
      c.restore(); c.strokeStyle = 'rgba(255,230,180,0.35)'; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 22, 3.6, 4.6); c.stroke();
    }
    // swaying lanterns and their warm pools of light
    const sw = Math.sin(t * 1.3) * 0.16 - rock * 2, LP = [[46, 66, 64, 1], [180, 66, 92, 0.9], [314, 66, 64, 1]];
    const lamps = LP.map(([px, py, len, m], i) => [px + Math.sin(sw * m) * len, py + Math.cos(sw * m) * len, 0.85 + 0.15 * Math.sin(t * 17 + i * 2) * Math.sin(t * 7 + i * 4)]);
    // animals on the deck; they fret as the water climbs
    const worry = s.h > 0.55 && !s.won, happy = g.result === 'win', hop = worry || happy;
    drawAnimal(c, 'giraffe', 212, FLOOR - 4, 1.55, t, 1, hop);
    drawAnimal(c, 'sheep', 268, FLOOR + 2, 1.25, t, 2, hop); c.save(); c.translate(296, FLOOR + 4); c.scale(-1, 1); drawAnimal(c, 'sheep', 0, 0, 1.1, t, 3, hop); c.restore();
    const ex = 112, ey = FLOOR, es = 1.35, k = es * 0.8 * 1.4; drawAnimal(c, 'elephant', ex, ey, es, t, 0, hop);
    umbrella(c, ex + 30 * k, ey - 5 * k, 1.05, t);
    drawAnimal(c, 'cat', 332, FLOOR - 56 - (worry ? Math.abs(Math.sin(t * 9)) * 6 : 0), 1.2, t, 0, false);
    if (worry) { c.fillStyle = '#bfe8ff'; for (const [dx, dy] of [[230, 380], [118, 410], [340, 420]]) { const q = (t * 2) % 1; c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(dx + 10, dy + q * 10, 3, 4.5, 0, 0, 7); c.fill(); } c.globalAlpha = 1; }
    // the rising water, with lamp-light glinting on it
    c.save(); c.globalAlpha = 0.86; P.water(c, W, wy, H + 40, '#0e2a44', '#2f6a8a', t, { sparkle: '#ffd890', waves: 4 }); c.restore();
    c.fillStyle = 'rgba(200,235,255,0.75)'; c.beginPath(); for (let x = -10; x <= W + 10; x += 5) { const yy = wy + Math.sin(x * 0.045 + t * 3) * 3 + Math.sin(x * 0.11 - t * 2) * 1.5; x === -10 ? c.moveTo(x, yy) : c.lineTo(x, yy); } for (let x = W + 10; x >= -10; x -= 5) c.lineTo(x, wy + 4 + Math.sin(x * 0.045 + t * 3) * 3); c.fill();
    for (const [lx] of lamps) { c.fillStyle = 'rgba(255,200,120,0.35)'; c.beginPath(); c.ellipse(lx, wy + 12, 26, 4, 0, 0, 7); c.fill(); }
    for (const sp of s.splashes) { const q = (t - sp.t) / 0.5; c.strokeStyle = `rgba(220,245,255,${1 - q})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(sp.x, wy + 2, 6 + q * 18, 2 + q * 4, 0, 0, 7); c.stroke(); }
    // the water-line mark on the deck edge: a soft danger glow that grows as the water nears
    if (!s.won) { const near = Math.max(0, (s.h - 0.4) / 0.6); c.fillStyle = `rgba(255,120,90,${0.15 + 0.35 * near * (0.6 + 0.4 * Math.sin(t * 12))})`; c.fillRect(0, FLOOR + 4, W, 4); }
    // night: darkness everywhere except warm pools around the lanterns
    const dk = darkLayer(), d = dk.getContext('2d'); d.setTransform(1, 0, 0, 1, 0, 0); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, W, H);
    d.fillStyle = s.flash > 0 ? `rgba(16,10,40,${0.55 - s.flash * 0.3})` : 'rgba(16,10,40,0.55)'; d.fillRect(0, 0, W, H); d.globalCompositeOperation = 'destination-out';
    for (const [lx, ly, fl] of [...lamps, [180, 400, 1]]) { const lg = d.createRadialGradient(lx, ly + 20, 6, lx, ly + 40, 185 * (0.94 + fl * 0.06)); lg.addColorStop(0, 'rgba(0,0,0,1)'); lg.addColorStop(0.45, 'rgba(0,0,0,0.75)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = lg; d.fillRect(0, 0, W, H); }
    c.drawImage(dk, 0, 0, W, H);
    LP.forEach(([px, py, len, m], i) => lantern(c, px, py, len, sw * m, t, i * 2));
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [lx, ly, fl] of lamps) { const lg = c.createRadialGradient(lx, ly, 3, lx, ly, 120); lg.addColorStop(0, `rgba(255,190,100,${0.4 * fl})`); lg.addColorStop(0.3, `rgba(255,150,70,${0.12 * fl})`); lg.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = lg; c.fillRect(lx - 120, ly - 120, 240, 240); }
    c.restore();
    drawLeaks(c, s, t, wy);
    for (const tp of s.taps) { const q = (t - tp.t) / 0.35; if (q > 1) continue; c.strokeStyle = `rgba(255,240,210,${1 - q})`; c.lineWidth = 2; c.beginPath(); c.arc(tp.x, tp.y, 6 + q * 14, 0, 7); c.stroke(); }
    c.restore();
    // lightning flash through the cracks
    if (s.flash > 0) { c.fillStyle = `rgba(210,215,255,${s.flash * 0.22})`; c.fillRect(0, 0, W, H); }
    if (happy) { c.save(); c.globalCompositeOperation = 'lighter'; const q = Math.min(1, (t - g.doneAt) * 3); c.fillStyle = `rgba(255,200,120,${0.12 * q})`; c.fillRect(0, 0, W, H); c.restore(); }
    P.vignette(c, W, H, 0.45, '#140810'); P.grain(c, W, H, 0.06);
  },
});
