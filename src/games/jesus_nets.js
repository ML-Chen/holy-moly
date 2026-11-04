// CAST! — Luke 5:1–11. After a whole night of catching nothing, Jesus tells Simon Peter to put out into deep water and let down the nets.
// Swipe toward the side where the fish shadows gather to cast the net; haul in a glittering catch until the boat nearly sinks.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const PETER = { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly' };
const BX = 180, BY = 428, SEA = 300;                 // boat centre and waterline; top of the lake
const SIDE_X = { '-1': 86, '1': 274 }, SCHOOL_Y = 548;
const FISH_COLS = ['#9fc3d6', '#c8d8e0', '#f0c060', '#e8a070', '#b0d8c8', '#d8e0f0'];

function hull(c, x, y, s, t, load, tip) {
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * 1.5) * 0.03 + tip); c.scale(s, s);
  const g = c.createLinearGradient(0, -22, 0, 18); g.addColorStop(0, '#a8744a'); g.addColorStop(0.5, '#7a4e30'); g.addColorStop(1, '#4a2c1c'); c.fillStyle = g; c.strokeStyle = '#3a2014'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-96, -26); c.quadraticCurveTo(-90, -14, -78, -20); c.lineTo(78, -20); c.quadraticCurveTo(92, -16, 100, -30); c.quadraticCurveTo(92, 14, 40, 18); c.lineTo(-40, 18); c.quadraticCurveTo(-88, 12, -96, -26); c.closePath(); c.fill(); c.stroke();
  c.save(); c.clip(); c.strokeStyle = 'rgba(40,20,10,0.35)'; c.lineWidth = 1.3; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-100, -12 + k * 8); c.quadraticCurveTo(0, -8 + k * 8 + 4, 100, -14 + k * 8); c.stroke(); }
  c.strokeStyle = 'rgba(255,220,170,0.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-80, -17); c.lineTo(78, -17); c.stroke(); c.restore();
  // a painted eye on the bow, as on old Galilean boats
  c.fillStyle = '#f2e6cf'; c.beginPath(); c.ellipse(82, -10, 5, 3.2, 0, 0, 7); c.fill(); c.fillStyle = '#2a3a6a'; c.beginPath(); c.arc(83, -10, 2, 0, 7); c.fill();
  c.restore();
}
function fishPile(c, x, y, n, t, s) {
  const r = P.rng(77);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 9), k = i % 9, fx = x - 64 + k * 16 + (row % 2) * 8 + (r() - 0.5) * 6, fy = y - row * 7 - Math.sin(k / 8 * Math.PI) * row * 3;
    const flop = Math.sin(t * 9 + i * 2.1) > 0.85 ? -0.5 : 0;
    c.save(); c.translate(fx, fy); c.rotate((r() - 0.5) * 1.2 + flop); P.fishShape(c, 0, 0, 0.55 * s, FISH_COLS[i % FISH_COLS.length]); c.restore();
  }
}
function netShape(c, x0, y0, x1, y1, open, fish, t, junk) {
  // a net bag hanging from the line: a spread rhombus mesh with cork floats along the top
  const w = 24 + open * 30, h = 18 + open * 22;
  c.strokeStyle = 'rgba(240,226,190,0.9)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 40 * open - 10, x1, y1 - h * 0.4); c.stroke();
  c.save(); c.translate(x1, y1);
  c.beginPath(); c.moveTo(-w, -h * 0.4); c.quadraticCurveTo(0, -h * 0.6, w, -h * 0.4); c.quadraticCurveTo(w * 0.7, h, 0, h); c.quadraticCurveTo(-w * 0.7, h, -w, -h * 0.4); c.closePath();
  c.fillStyle = 'rgba(220,200,160,0.18)'; c.fill(); c.save(); c.clip();
  if (fish > 0) { const r = P.rng(5); for (let i = 0; i < fish; i++) { c.save(); c.translate((r() - 0.5) * w * 1.4, -h * 0.2 + r() * h * 1.1); c.rotate((r() - 0.5) * 1.5 + Math.sin(t * 12 + i) * 0.2); P.fishShape(c, 0, 0, 0.5, FISH_COLS[i % FISH_COLS.length]); c.restore(); } }
  if (junk) { // an old sandal and a crab waving hello: nothing else on this side
    c.save(); c.translate(-6, h * 0.35); c.rotate(0.3); c.fillStyle = '#8a5a34'; c.beginPath(); c.ellipse(0, 0, 11, 4.5, 0, 0, 7); c.fill(); c.strokeStyle = '#5a3a1c'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3, -3); c.lineTo(2, 3); c.moveTo(3, -3); c.lineTo(-2, 3); c.stroke(); c.restore();
    c.save(); c.translate(10, h * 0.2); c.fillStyle = '#e0603a'; c.beginPath(); c.ellipse(0, 0, 7, 5, 0, 0, 7); c.fill(); const wv = Math.sin(t * 14) * 0.5; for (const sd of [-1, 1]) { c.save(); c.translate(sd * 7, -3); c.rotate(sd * (0.6 + wv)); c.beginPath(); c.ellipse(sd * 3, -3, 3, 2.2, 0, 0, 7); c.fill(); c.restore(); } P.eye(c, -2, -5, 1.3); P.eye(c, 2, -5, 1.3); c.restore();
  }
  c.strokeStyle = 'rgba(245,232,200,0.75)'; c.lineWidth = 1;
  for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * 9 - 30, -h); c.lineTo(i * 9 + 30, h * 1.2); c.moveTo(i * 9 + 30, -h); c.lineTo(i * 9 - 30, h * 1.2); c.stroke(); }
  c.restore();
  c.strokeStyle = 'rgba(245,232,200,0.95)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-w, -h * 0.4); c.quadraticCurveTo(0, -h * 0.6, w, -h * 0.4); c.stroke();
  c.fillStyle = '#d89a4a'; for (let i = 0; i < 5; i++) { const u = i / 4, fx = -w + u * w * 2, fy = -h * 0.4 - Math.sin(u * Math.PI) * h * 0.2 + Math.sin(t * 5 + i) * 1.2; c.beginPath(); c.ellipse(fx, fy, 3.4, 2.4, 0, 0, 7); c.fill(); }
  c.restore();
}

function paintBg(o) {
  // dawn after a long night: violet at the top, peach and gold along the far hills
  P.sky(o, W, H, ['#3a3a7e', '#7a62a0', '#e8909a', '#ffc890', '#ffe6b8'], { x: 92, y: 272, r: 22, color: '#ffd89a', glow: 230 });
  P.stars(o, W, 120, 22, 4, 0);
  P.hills(o, W, 282, 40, '#a07aa0', '#8a6a90', { seed: 41, freq: 0.01, dabs: 20, bottom: 320 });
  P.hills(o, W, 296, 18, '#b08a98', '#9a7a8a', { seed: 43, freq: 0.022, dabs: 20, bottom: 320 });
}

MG.add({
  id: 'nets', stage: 'jesus', cmd: 'CAST!', hint: 'swipe', time: 5, mood: 'sea', winText: 'So many fish!', failText: 'Just a boot!',
  card: {
    title: 'Nets full of fish', ref: 'Luke 5:1–11', kind: 'Gospel story',
    text: 'Luke\'s Gospel tells how Simon Peter and his friends fished all night and caught nothing. In the morning Jesus told Simon to row out into the deep water and let down the nets. They caught so many fish that the nets began to tear, and two boats were so full they nearly sank.',
    note: 'Some Christians believe this miracle happened just as Luke tells it, and others read it as a story about how God surprises tired people with more than enough. Afterward, Jesus invited the fishermen to follow him.',
    ask: 'Have you ever tried and tried and wanted to give up? Who helped you try one more time?',
  },
  init(g) {
    const s = g.s; s.need = [1, 2, 2][g.level]; s.csp = 1 + (g.speed - 1) * 0.5; s.got = 0; s.side = Math.random() < 0.5 ? -1 : 1; s.sx = SIDE_X[s.side];
    s.move = [0, 0, 1.15][g.level] / (1 + (g.speed - 1) * 0.5); s.moveT = s.move; s.cast = null; s.jump = []; s.pile = 0; s.trail = [];
    s.fish = Array.from({ length: 16 }, (_, i) => ({ a: Math.random() * 6.28, r: 8 + Math.random() * 46, sp: (0.9 + Math.random() * 0.8) * (i % 2 ? 1 : -1), dy: (Math.random() - 0.5) * 36, sz: 0.6 + Math.random() * 0.5 }));
  },
  down(g, x, y) { g.s.trail = [[x, y]]; },
  move(g, x, y) { const tr = g.s.trail; if (tr.length) { tr.push([x, y]); if (tr.length > 12) tr.shift(); } },
  up(g) { g.s.trail = []; },
  swipe(g, dx, dy) {
    const s = g.s; if (s.cast || Math.abs(dx) < 30) return;
    const side = dx < 0 ? -1 : 1, hit = side === s.side && Math.abs(s.sx - SIDE_X[side]) < 60;
    s.cast = { side, t: g.t, hit, x: SIDE_X[side] }; g.sfx('whoosh');
  },
  update(g, dt) {
    const s = g.s, t = g.t;
    // the school swims to the other side now and then (level 2), passing under the boat
    if (s.move > 0 && !g.done && !s.cast) { s.moveT -= dt; if (s.moveT <= 0) { s.side = -s.side; s.moveT = s.move; } }
    s.sx += (SIDE_X[s.side] - s.sx) * Math.min(1, dt * 4.5);
    for (const f of s.fish) f.a += f.sp * dt * 1.8;
    const cs = s.cast;
    if (cs) {
      const k = (t - cs.t) * s.csp;
      if (k > 0.3 && !cs.splash) { cs.splash = 1; g.sfx('splash'); g.burst(cs.x, SCHOOL_Y - 40, ['#ffffff', '#cfefff', '#9fd8f0'], 12, 150); if (cs.hit) { g.sfx('splashbig'); g.shake(2, 0.2); } }
      if (k > 0.62 && !cs.haul) { cs.haul = 1; if (cs.hit) { g.sfx('stretch'); } else { g.sfx('boing'); } }
      if (k > 0.95) {
        if (cs.hit) {
          s.got++; s.pile += 9; g.sfx('cheer'); g.sfx('splash'); g.burst(BX, BY - 30, ['#fff6c8', '#ffd45a', '#cfefff', '#ffffff'], 22, 220);
          for (let i = 0; i < 6; i++) s.jump.push({ x: BX + (Math.random() - 0.5) * 120, y: BY - 20, vx: (Math.random() - 0.5) * 200, vy: -250 - Math.random() * 150, t, col: FISH_COLS[i % FISH_COLS.length] });
          if (s.got >= s.need) g.win(); else { s.side = -s.side; s.moveT = s.move || 99; }
        } else { g.sfx('laugh'); }
        s.cast = null;
      }
    }
    for (const j of s.jump) { j.x += j.vx * dt; j.y += j.vy * dt; j.vy += 600 * dt; }
    s.jump = s.jump.filter(j => j.y < BY + 30 || j.vy < 0);
    if (g.result === 'win' && Math.random() < dt * 8) s.jump.push({ x: BX + (Math.random() - 0.5) * 140, y: BY - 30, vx: (Math.random() - 0.5) * 160, vy: -200 - Math.random() * 120, t, col: FISH_COLS[Math.floor(Math.random() * 6)] });
  },
  auto(g, dt, synth) { // swipe toward the shadows as soon as they settle on a side
    const s = g.s; if (g.t < 0.35 || s.cast || g.t - (s.botT || 0) < 0.15) return;
    if (Math.abs(s.sx - SIDE_X[s.side]) > 30) return; s.botT = g.t;
    synth('down', 180, 470); synth('move', 180 + s.side * 120, 470); synth('up', 180 + s.side * 120, 470); synth('swipe', s.side * 150, 0, s.side * 1500, 0);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', load = Math.min(1, s.got / 2.5 + (won ? 0.25 : 0));
    c.drawImage(g.bake('jesus_nets_bg', paintBg), 0, 0, W, H);
    P.cloud(c, 250 + Math.sin(t * 0.3) * 8, 130, 0.75, '#ffe6e0', '#b48ab8', 0.9); P.cloud(c, 70 + t * 2, 190, 0.45, '#ffe6e0', '#b48ab8', 0.8);
    P.rays(c, 92, 272, W, H * 0.45, '#ffe8b8', 0.12, 9, t);
    P.water(c, W, SEA, H, '#1e4a78', '#7aa8c8', t, { waves: 7, sparkle: '#ffe8c0' });
    // the dawn's reflection on the water
    const rf = c.createLinearGradient(0, SEA, 0, SEA + 200); rf.addColorStop(0, 'rgba(255,200,150,0.35)'); rf.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = rf; c.beginPath(); c.moveTo(70, SEA); c.lineTo(114, SEA); c.lineTo(200, SEA + 200); c.lineTo(0, SEA + 200); c.closePath(); c.fill();
    // the partners' boat further out, waving
    c.save(); hull(c, 300, 322 + (won ? 4 : 0), 0.32, t + 2, 0, 0);
    P.person(c, 288, 318, 0.36, { skin: SK[1], robe: CL.rust, hair: HR[0], beard: true, arms: won ? 'cheer' : 'wave', t, bounce: 0 }); P.person(c, 312, 318, 0.36, { skin: SK[3], robe: CL.olive, hair: HR[2], arms: won ? 'cheer' : 'down', t, phase: 2, bounce: 0 }); c.restore();
    // the fish shadows: a dark swirling school with glints, plus rings on the surface above it
    const cast = s.cast, scared = cast && cast.hit && (t - cast.t) * s.csp > 0.3;
    if (!won && !scared) {
      const p = 0.5 + 0.5 * Math.sin(t * 4), sx = s.sx;
      const gl = c.createRadialGradient(sx, SCHOOL_Y, 6, sx, SCHOOL_Y, 80); gl.addColorStop(0, `rgba(255,240,170,${0.22 + 0.15 * p})`); gl.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(sx, SCHOOL_Y, 80, 50, 0, 0, 7); c.fill();
      for (const f of s.fish) { const fx = sx + Math.cos(f.a) * f.r * 1.3, fy = SCHOOL_Y + f.dy + Math.sin(f.a) * f.r * 0.35; c.save(); c.translate(fx, fy); c.scale(f.sp > 0 ? -f.sz : f.sz, f.sz); c.fillStyle = 'rgba(14,34,64,0.55)'; c.beginPath(); c.ellipse(0, 0, 14, 5.5, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(11, 0); c.lineTo(20, -5); c.lineTo(20, 5); c.closePath(); c.fill(); c.restore();
        if (Math.sin(t * 6 + f.a * 3) > 0.9) { c.fillStyle = 'rgba(255,250,220,0.9)'; c.fillRect(fx - 4, fy - 1, 8, 1.6); } }
      c.strokeStyle = `rgba(255,255,255,${0.5})`; c.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const q = ((t * 0.8 + i / 3) % 1); c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(sx + (i - 1) * 24, SCHOOL_Y - 46 + i * 6, 6 + q * 22, 2 + q * 6, 0, 0, 7); c.stroke(); } c.globalAlpha = 1;
      // a fish hops out now and then to say "here!"
      const hop = (t * 0.9) % 1; if (hop < 0.4) { const q = hop / 0.4; c.save(); c.translate(sx + 20, SCHOOL_Y - 40 - Math.sin(q * Math.PI) * 44); c.rotate(-1.2 + q * 2.4); P.fishShape(c, 0, 0, 0.7, '#f0c060'); c.restore(); }
      // a big arrow in the water pointing out from the boat toward the fish
      if (!cast) { const ax = BX + Math.sign(sx - BX) * (60 + p * 10), d = Math.sign(sx - BX) || 1; c.save(); c.globalAlpha = 0.5 + 0.35 * p; c.fillStyle = '#fff6d0'; c.strokeStyle = 'rgba(80,60,30,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(ax + d * 26, 486); c.lineTo(ax, 470); c.lineTo(ax, 480); c.lineTo(ax - d * 22, 480); c.lineTo(ax - d * 22, 492); c.lineTo(ax, 492); c.lineTo(ax, 502); c.closePath(); c.fill(); c.stroke(); c.restore(); }
    }
    // the boat sinks lower with every catch
    const by = BY + load * 16, tip = won ? Math.sin(t * 6) * 0.05 : 0;
    // people in the boat (behind the hull): Jesus at the bow, Peter at the stern with the net
        P.person(c, BX + 60, by - 8, 0.95, { ...JESUS, t, phase: 1, bounce: won ? 3 : 0.5, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'reach', facing: s.side >= 0 ? 1 : -1 });
    P.person(c, BX - 40, by - 8, 1.0, { ...PETER, t, phase: 2, bounce: won ? 4 : 0.6, expr: won ? 'laugh' : cast && !cast.hit && (t - cast.t) * s.csp > 0.6 ? 'surprised' : 'happy', arms: won ? 'cheer' : cast ? 'out' : 'hold', facing: cast ? cast.side : (s.side || 1) });
    if (s.pile > 0 || won) fishPile(c, BX, by - 22, Math.min(36, s.pile + (won ? 9 : 0)), t, 1);
    hull(c, BX, by, 1, t, load, tip);
    // splash rings at the hull when it is heavy
    if (load > 0.3) { c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2; for (const sd of [-1, 1]) { c.beginPath(); c.ellipse(BX + sd * 92, by + 2, 10 + Math.sin(t * 6) * 3, 3, 0, 0, 7); c.stroke(); } }
    // the net, thrown out and hauled back
    if (cast) {
      const k = (t - cast.t) * s.csp, hx = BX - 40 + cast.side * 14, hy = by - 50;
      let nx, ny, open, fish = 0;
      if (k < 0.3) { const q = k / 0.3; nx = hx + (cast.x - hx) * q; ny = hy + (SCHOOL_Y - 30 - hy) * q - Math.sin(q * Math.PI) * 80; open = q; }
      else if (k < 0.62) { const q = (k - 0.3) / 0.32; nx = cast.x; ny = SCHOOL_Y - 30 + q * 20; open = 1; fish = cast.hit ? Math.floor(q * 14) : 0; }
      else { const q = Math.min(1, (k - 0.62) / 0.33); nx = cast.x + (BX - cast.x) * q; ny = SCHOOL_Y - 10 + (by - 40 - SCHOOL_Y + 10) * q; open = 1 - q * 0.3; fish = cast.hit ? 14 : 0; }
      netShape(c, hx, hy, nx, ny, open, fish, t, !cast.hit && k > 0.62);
      if (cast.hit && k > 0.62) { for (let i = 0; i < 4; i++) { const tw = Math.max(0, Math.sin(t * 9 + i * 1.7)); c.save(); c.globalAlpha = tw; c.fillStyle = '#fffbe0'; drawStar(c, nx + Math.cos(i * 1.6) * 34, ny + Math.sin(i * 1.6) * 24, 3 + tw * 3, t); c.restore(); } }
    }
    for (const j of s.jump) { c.save(); c.translate(j.x, j.y); c.rotate(Math.atan2(j.vy, j.vx) + Math.PI); P.fishShape(c, 0, 0, 0.6, j.col); c.restore(); }
    // finger trail
    const tr = s.trail; if (tr.length > 1) { c.save(); c.lineCap = 'round'; for (let i = 1; i < tr.length; i++) { const a = i / tr.length; c.strokeStyle = `rgba(255,250,230,${0.7 * a})`; c.lineWidth = 3 + a * 8; c.beginPath(); c.moveTo(tr[i - 1][0], tr[i - 1][1]); c.lineTo(tr[i][0], tr[i][1]); c.stroke(); } c.restore(); }
    if (won) for (let i = 0; i < 10; i++) { const tw = Math.max(0, Math.sin(t * 7 + i * 1.9)); c.save(); c.globalAlpha = tw; c.fillStyle = i % 2 ? '#fffbe0' : '#ffe27a'; drawStar(c, BX - 90 + i * 20, by - 60 - (i * 17) % 50, 3 + tw * 3, t); c.restore(); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
