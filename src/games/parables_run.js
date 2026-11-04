// RUN! — Luke 15:20. The son trudges home in rags; mash to make his father run down the road and hug him before he reaches the house.
const DAD = { skin: P.SKIN[2], robe: P.CLOTH.plum, stripe: P.CLOTH.gold, sash: P.CLOTH.saffron, beard: '#ece6de', hair: P.HAIR[5], hairStyle: 'bald' };
const SON = { skin: P.SKIN[2], robe: '#9a8268', hairStyle: 'curly', hair: P.HAIR[1] };
// the road: u = 0 at the father's door (lower left) to 1 at the far bend (upper right); figures shrink with distance
const RD = [[96, 572], [250, 530], [60, 420], [250, 352]];
function bez(u, k) { const v = 1 - u; return v * v * v * RD[0][k] + 3 * v * v * u * RD[1][k] + 3 * v * u * u * RD[2][k] + u * u * u * RD[3][k]; }
const rx = u => bez(Math.min(1, u), 0);
const ry = u => bez(Math.min(1, u), 1);
const rs = u => Math.max(0.35, 1.55 - 0.95 * u);
function lantern(c, x, y, s, col, on, t) {
  c.save(); c.translate(x, y + Math.sin(t * 3 + x) * 1.5); c.scale(s, s);
  if (on > 0) { const gl = c.createRadialGradient(0, 8, 1, 0, 8, 26); gl.addColorStop(0, P.rgba('#ffe6a0', 0.7 * on)); gl.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = gl; c.beginPath(); c.arc(0, 8, 26, 0, 7); c.fill(); }
  c.strokeStyle = '#5a3a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 2); c.stroke();
  const gr = c.createRadialGradient(-2, 6, 1, 0, 8, 9); gr.addColorStop(0, P.mix(P.shade(col, -0.2), '#fff6c8', on)); gr.addColorStop(1, P.shade(col, -0.25 + on * 0.2)); c.fillStyle = gr;
  c.beginPath(); c.ellipse(0, 8.5, 6.5, 7, 0, 0, 7); c.fill(); c.fillStyle = '#7a4a2a'; c.fillRect(-3.5, 1.5, 7, 2); c.fillRect(-3, 14.5, 6, 2);
  c.restore();
}
function heartR(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.75, -r * 1.25, 0, -r * 0.45); c.bezierCurveTo(r * 0.75, -r * 1.25, r * 1.4, -r * 0.1, 0, r * 0.9); c.fill(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(-r * 0.45, -r * 0.45, r * 0.22, r * 0.14, -0.6, 0, 7); c.fill(); c.restore(); }
function patches(c, x, y, s, f) { // the son's ragged, patched robe
  c.save(); c.translate(x, y); c.scale(s * f, s);
  for (const [px, py, w, h, col, a] of [[-9, -22, 6, 6, '#c8a878', 0.2], [4, -12, 7, 5, '#6a7a5a', -0.15], [-4, -33, 5, 4, '#b8785a', 0.1]]) { c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = col; c.fillRect(-w / 2, -h / 2, w, h); c.strokeStyle = 'rgba(60,30,20,0.6)'; c.lineWidth = 0.8; c.setLineDash([1.5, 1.5]); c.strokeRect(-w / 2, -h / 2, w, h); c.restore(); }
  c.fillStyle = '#9a8268'; c.beginPath(); c.moveTo(-15, -3); for (let i = 0; i <= 6; i++) c.lineTo(-15 + i * 5, -3 + (i % 2 ? 4 : 0)); c.lineTo(15, -6); c.lineTo(-15, -6); c.fill();
  c.restore();
}
function bundle(c, x, y, s, f) { c.save(); c.translate(x, y); c.scale(s * f, s); c.strokeStyle = '#6a4a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(4, -46); c.lineTo(-16, -66); c.stroke(); c.fillStyle = '#b89a78'; c.beginPath(); c.arc(-17, -63, 6, 0, 7); c.fill(); c.strokeStyle = '#7a5a3a'; c.lineWidth = 1; c.stroke(); c.restore(); }

MG.add({
  id: 'run', stage: 'parables', cmd: 'RUN!', hint: 'mash', time: 5, mood: 'party', winText: 'Welcome!',
  card: { title: 'The father who ran', ref: 'Luke 15:11–32', kind: 'Parable', text: 'A son took his share of his father\'s money, went far away and wasted it all. When he came home hungry and ashamed, his father saw him a long way off, ran to hug him, and threw a party with a fine robe and a ring.', ask: 'When someone says sorry to you, how can you welcome them back like this father did?' },
  init(g) {
    const s = g.s, L = g.level;
    s.son = 0.96; s.gate = [0.1, 0.14, 0.18][L]; s.sv = (s.son - s.gate) / (g.dur * 0.9);
    s.dad = 0; s.v = 0; s.k = [0.05, 0.03, 0.02][L] * (1 + (g.speed - 1) * 0.3); s.taps = 0; s.met = false; s.metT = 0; s.late = false; s.lateT = 0; s.puffs = []; s.lastTap = -1;
  },
  down(g, x, y) { const s = g.s; if (s.met || s.late) return; s.v = Math.min(1.6, s.v + s.k * 4); s.taps++; s.lastTap = g.t; if (s.taps % 2) g.sfx('stomp'); else g.sfx('tap'); s.puffs.push({ u: s.dad, t: g.t, d: Math.random() }); },
  update(g, dt) {
    const s = g.s; if (s.met) return;
    if (!s.late) s.son = Math.max(s.gate, s.son - s.sv * dt);
    s.dad += s.v * dt; s.v *= Math.exp(-4 * dt);
    if (!s.late && s.dad >= s.son - 0.05) { s.met = true; s.metT = g.t; s.dad = s.son - 0.05; const p = [rx(s.son), ry(s.son) - 50 * rs(s.son)]; g.burst(p[0], p[1], ['#ff6a8a', '#ffd45a', '#fff'], 22, 180); g.sfx('cheer'); g.win(); }
    else if (!s.late && s.son <= s.gate + 1e-6) { s.late = true; s.lateT = g.t; g.sfx('wrong'); g.fail(); }
    if (s.late) { s.dad = Math.min(s.son - 0.04, s.dad); }
    s.puffs = s.puffs.filter(p => g.t - p.t < 0.6);
  },
  auto(g, dt, synth) { const s = g.s; if (g.t > 0.3 && g.t - (s.botT || 0) > 0.17) { s.botT = g.t; synth('down', 180, 450); synth('up', 180, 450); } },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('parables_run_bg', o => {
      P.sky(o, W, H, ['#4a3f8f', '#9a5a92', '#f08a72', '#ffd08a'], { x: 196, y: 262, r: 30, color: '#ffd890', glow: 300 });
      P.stars(o, W, 120, 26, 5, 0);
      P.rays(o, 196, 262, W, H, '#fff0c0', 0.12, 11, 0);
      P.cloud(o, 70, 170, 0.6, '#ffd8c8', '#c8789a', 0.75); P.cloud(o, 300, 120, 0.5, '#ffd8c8', '#c8789a', 0.65);
      P.hills(o, W, 300, 40, '#b07aa0', '#9a6a90', { seed: 51, freq: 0.01, dabs: 12, rim: '#ffd0c8' });
      P.hills(o, W, 318, 22, '#c8907a', '#b07a6a', { seed: 53, freq: 0.018, dabs: 12, rim: '#ffe0b8' });
      P.hills(o, W, 350, 30, '#d8a86a', '#c89858', { seed: 55, freq: 0.012, dabs: 40, rim: '#ffe6b0' });
      // rolling golden fields, rows curving over the slopes
      P.hills(o, W, 420, 40, '#e6b860', '#c8983e', { seed: 57, freq: 0.009, dabs: 120, rim: '#fff0b8' });
      o.save(); P.ridgePath(o, W, 420, 40, 0.009, 57, 640); o.clip();
      for (let k = 0; k < 16; k++) { const y0 = 395 + k * 15 + k * k * 0.6; o.strokeStyle = k % 2 ? 'rgba(255,236,170,0.28)' : 'rgba(140,96,30,0.16)'; o.lineWidth = 1.5 + k * 0.2; o.beginPath(); for (let x = -10; x <= W + 10; x += 6) { const y = y0 + Math.sin(x * 0.012 + k * 0.4) * (6 + k * 0.6); x < 0 ? o.moveTo(x, y) : o.lineTo(x, y); } o.stroke(); }
      o.restore();
      const r = P.rng(52); for (let i = 0; i < 160; i++) { const x = r() * W, y = 380 + r() * 260, h = 4 + (y - 380) / 26; o.strokeStyle = r() < 0.5 ? 'rgba(255,226,140,0.75)' : 'rgba(160,112,40,0.5)'; o.lineWidth = 0.8 + (y - 380) / 200; o.beginPath(); o.moveTo(x, y); o.quadraticCurveTo(x + 2, y - h * 0.6, x + 1, y - h); o.stroke(); }
      const hz2 = o.createLinearGradient(0, 290, 0, 400); hz2.addColorStop(0, 'rgba(255,214,160,0.55)'); hz2.addColorStop(1, 'rgba(255,214,160,0)'); o.fillStyle = hz2; o.fillRect(0, 290, W, 110);
      P.tree(o, 30, 352, 0.38, '#8a8a52', 21); P.tree(o, 330, 344, 0.32, '#8a8a52', 22); P.tree(o, 300, 412, 0.55, '#7a8a48', 23);
      // the road, winding down from the far hills to the father's door
      const Lp = [], Rp = []; for (let u = 1; u >= -0.02; u -= 0.01) { const x = rx(u), y = ry(u), w = 26 * rs(u) * Math.min(1, (1.02 - u) * 6); const d = 0.005, tx = rx(u + d) - rx(u - d), ty = ry(u + d) - ry(u - d), n = Math.hypot(tx, ty) || 1; Lp.push([x - ty / n * w, y + tx / n * w]); Rp.push([x + ty / n * w, y - tx / n * w]); }
      o.beginPath(); Lp.forEach(([x, y], i) => i ? o.lineTo(x, y) : o.moveTo(x, y)); Rp.reverse().forEach(([x, y]) => o.lineTo(x, y)); o.closePath();
      const rg = o.createLinearGradient(0, 300, 0, 600); rg.addColorStop(0, '#ffe6b8'); rg.addColorStop(1, '#ecc48e'); o.fillStyle = rg; o.fill(); o.strokeStyle = 'rgba(150,100,40,0.35)'; o.lineWidth = 1.5; o.stroke();
      for (let i = 0; i < 70; i++) { const u = r() * 1.2, x = rx(u) + (r() - 0.5) * 36 * rs(u), y = ry(u) + (r() - 0.5) * 10 * rs(u); o.fillStyle = r() < 0.5 ? 'rgba(180,130,80,0.45)' : 'rgba(255,248,226,0.7)'; o.beginPath(); o.ellipse(x, y, 2 * rs(u), 1.3 * rs(u), 0, 0, 7); o.fill(); }
      const hz3 = o.createLinearGradient(0, 330, 0, 400); hz3.addColorStop(0, 'rgba(255,214,170,0.75)'); hz3.addColorStop(1, 'rgba(255,214,170,0)'); o.fillStyle = hz3; o.fillRect(0, 330, W, 70);
      // the father's house and courtyard, lower left
      P.tree(o, 196, 610, 0.95, '#5f8a44', 17);
      P.house(o, -20, 580, 92, 112, '#efcf9e', { door: '#6a3e26', awning: P.CLOTH.terracotta, window: true });
      P.house(o, 52, 586, 92, 74, '#e8c290', { door: '#7a4a2e', window: true });
      P.grassTufts(o, W, 590, 640, 30, '#8a9a3e', 14); P.flowers(o, W, 596, 640, 16, ['#f4d35e', '#ee6c8a', '#ffffff'], 15);
      P.tree(o, 330, 560, 0.85, '#628c46', 19);
    }), 0, 0, W, H);
    // sun shimmer and birds heading home
    for (let i = 0; i < 3; i++) { const bx = 120 + i * 20 + t * 10 + Math.sin(t + i) * 8, by = 200 + i * 8 + Math.cos(t * 1.2 + i) * 4, f = Math.sin(t * 9 + i * 2) * 3; c.strokeStyle = 'rgba(70,40,70,0.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx - 6, by - f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 6, by - f); c.stroke(); }
    // party lanterns strung from the house once he is home
    const party = s.met ? Math.min(1, (t - s.metT) / 0.5) : 0;
    const lamps = [[8, 470], [52, 486], [96, 494], [140, 494], [184, 488], [228, 478], [272, 466], [316, 486]];
    if (party > 0) { c.strokeStyle = 'rgba(80,50,40,0.7)'; c.lineWidth = 1.2; c.beginPath(); lamps.forEach(([x, y], i) => i ? c.quadraticCurveTo((lamps[i - 1][0] + x) / 2, Math.max(lamps[i - 1][1], y) + 10, x, y) : c.moveTo(x, y)); c.stroke();
      lamps.forEach(([x, y], i) => { const on = Math.max(0, Math.min(1, party * 8 - i)); if (on > 0) lantern(c, x, y, 1.1, ['#e85a5a', '#f2a33a', '#5ab0e0', '#e86aa8'][i % 4], on, t); });
      c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,200,120,${0.25 * party})`; c.fillRect(0, 0, W, H); c.restore(); }
    // dust puffs from the father's feet
    for (const p of s.puffs) { const q = (t - p.t) / 0.6, x = rx(p.u), y = ry(p.u), sc = rs(p.u); c.fillStyle = `rgba(255,236,200,${0.6 * (1 - q)})`; c.beginPath(); c.arc(x - (10 + q * 30) * sc, y - 4 * sc - q * 10 * sc, (5 + q * 10) * sc, 0, 7); c.fill(); }
    // the son, coming home
    const su = s.son, sx = rx(su), sy = ry(su), ss = rs(su), gotRobe = s.met && t - s.metT > 0.3;
    const sonDraw = () => {
      if (s.met) { P.person(c, sx, sy, ss, { ...SON, robe: gotRobe ? P.CLOTH.red : SON.robe, stripe: gotRobe ? P.CLOTH.gold : undefined, sash: gotRobe ? P.CLOTH.gold : undefined, facing: -1, expr: t - s.metT > 0.15 ? 'laugh' : 'wow', arms: 'cheer', t, bounce: 2 });
        if (!gotRobe) patches(c, sx, sy, ss, -1); else { const a = t - s.metT - 0.3; c.fillStyle = `rgba(255,240,170,${Math.max(0, 1 - a * 2)})`; drawStar(c, sx - 10 * ss, sy - 56 * ss, 14 * ss * (1 + a), a * 4); c.strokeStyle = '#ffd45a'; c.lineWidth = 2 * ss; c.beginPath(); c.arc(sx - 17 * ss, sy - 50 * ss, 3 * ss, 0, 7); c.stroke(); c.fillStyle = '#fff6c0'; drawStar(c, sx - 17 * ss, sy - 54 * ss, (3 + Math.abs(Math.sin(t * 8)) * 3) * ss, t * 3); } }
      else if (s.late) { P.person(c, sx, sy, ss, { ...SON, facing: -1, expr: 'sad', arms: 'pray', t: 0 }); patches(c, sx, sy, ss, -1); }
      else { const step = Math.sin(t * 5) ; c.save(); c.translate(sx, sy); c.rotate(step * 0.04); P.person(c, 0, 0, ss, { ...SON, facing: -1, expr: 'sad', arms: 'down', t: t * 0.8, bounce: 1.4 }); patches(c, 0, 0, ss, -1); bundle(c, 0, 0, ss, -1); c.restore();
        // a tired little sweat drop and a hungry tummy rumble
        const q = (t * 0.8) % 1; c.fillStyle = `rgba(170,220,255,${0.9 * (1 - q)})`; c.beginPath(); c.ellipse(sx + 14 * ss, sy - 66 * ss + q * 8 * ss, 2 * ss + 0.6, 3 * ss + 0.8, 0, 0, 7); c.fill(); }
    };
    // the father, running with his robe flapping
    const du = s.dad, dx = rx(du), dy = ry(du), ds = rs(du), run = Math.min(1, s.v / 0.5);
    const dadDraw = () => {
      if (s.met) { P.person(c, sx - 10 * ss, sy + 2 * ss, ss * 1.02, { ...DAD, facing: 1, expr: 'laugh', arms: 'out', t, bounce: 1.5 }); return; }
      c.save(); c.translate(dx, dy); c.rotate(run * 0.22);
      if (run > 0.1) { // speed lines and the flapping robe tail
        c.strokeStyle = `rgba(255,250,235,${0.8 * run})`; c.lineWidth = 2.4 * ds + 0.5; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const yy = (-14 - i * 14) * ds, len = (24 + ((i * 13 + Math.floor(t * 20)) % 16)) * ds * run; c.beginPath(); c.moveTo(-20 * ds, yy); c.lineTo(-20 * ds - len, yy + len * 0.3); c.stroke(); }
        c.fillStyle = P.shade(DAD.robe, -0.1); c.beginPath(); c.moveTo(-8 * ds, -30 * ds); for (let k = 0; k <= 5; k++) c.lineTo((-12 - k * 5 * run) * ds, (-30 + k * 5) * ds + Math.sin(t * 30 + k) * 3 * ds * run); c.lineTo(-10 * ds, -4 * ds); c.closePath(); c.fill(); }
      P.person(c, 0, 0, ds, { ...DAD, facing: 1, expr: s.late ? 'surprised' : run > 0.2 ? 'laugh' : 'wow', arms: s.late ? 'down' : run > 0.1 ? 'out' : 'wave', t: t * (1 + run * 1.6), bounce: 1.2 + run * 4 });
      if (s.late) { const q = ((t - s.lateT) * 2) % 1; c.fillStyle = `rgba(255,255,255,${0.8 * (1 - q)})`; c.beginPath(); c.arc(16 * ds, (-62 - q * 16) * ds, (4 + q * 5) * ds, 0, 7); c.fill(); }
      c.restore();
      if (!s.met && !s.late && t < 1.4) { const p = 0.5 + 0.5 * Math.sin(t * 10); c.fillStyle = `rgba(255,120,150,${0.9})`; heartR(c, dx + 4, dy - 108 * ds - p * 4, 8 + p * 2, '#ff6a8a'); }
    };
    if (s.met) { sonDraw(); dadDraw(); } else if (sy < dy) { sonDraw(); dadDraw(); } else { dadDraw(); sonDraw(); }
    if (s.met) { const a = t - s.metT; for (let i = 0; i < 10; i++) { const q = (a * 1.1 + i / 10) % 1; c.globalAlpha = Math.max(0, 1 - q) * Math.min(1, a * 4); heartR(c, sx - 6 + Math.sin(i * 2.3 + q * 4) * (20 + q * 30), sy - 70 * ss - q * 90, 5 + (i % 3) * 2, ['#ff6a8a', '#ffb0c0', '#ffd45a'][i % 3]); } c.globalAlpha = 1; }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
