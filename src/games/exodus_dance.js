// DANCE! — safe across the sea, Miriam takes her tambourine and leads the women in dancing (Exodus 15:20–21). Tap on the beat.
const DX = 180, DY = 400;     // the big tambourine that pulses on the beat
const DR = 46;
const DANCERS = [
  { x: 40, y: 548, s: 1.0, o: { skin: P.SKIN[1], robe: P.CLOTH.rose, stripe: P.CLOTH.gold, hairStyle: 'long', hair: P.HAIR[2] } },
  { x: 100, y: 588, s: 1.1, o: { skin: P.SKIN[3], robe: P.CLOTH.saffron, stripe: P.CLOTH.indigo, hairStyle: 'bun', hair: P.HAIR[0] } },
  { x: 260, y: 588, s: 1.1, o: { skin: P.SKIN[0], robe: P.CLOTH.plum, stripe: P.CLOTH.cream, hairStyle: 'curly', hair: P.HAIR[1] } },
  { x: 320, y: 548, s: 1.0, o: { skin: P.SKIN[2], robe: P.CLOTH.green, stripe: P.CLOTH.saffron, head: 'scarf', headCol: P.CLOTH.cream, hair: P.HAIR[5] } },
];
const CONF = ['#ffd45a', '#ff7a8a', '#7ad0f0', '#b0e070', '#c88ae8', '#ffffff', '#ff9a4a'];
MG.add({
  id: 'dance', stage: 'exodus', cmd: 'DANCE!', hint: 'tap', time: 6, mood: 'party', winText: 'Sing!',
  card: { title: 'Miriam\'s song', ref: 'Exodus 15:20–21', kind: 'Ancient story', text: 'The book of Exodus tells how, when the Israelites were safe on the other side of the sea, Miriam the prophet picked up her tambourine. All the women followed her, dancing and singing a song of thanks to God for setting them free.', note: 'Many scholars think Miriam\'s song is one of the oldest pieces of poetry in the Bible. Israel sang it to remember that freedom is a gift from God.', ask: 'What song or dance would you use to say thank you? Try it together as a family!' },
  init(g) {
    const s = g.s; s.iv = 0.62 / Math.pow(g.speed, 0.6); s.t0 = 0.95; s.need = [4, 5, 6][g.level]; s.win = [0.2, 0.16, 0.13][g.level];
    s.maxMiss = [4, 3, 3][g.level]; s.hits = 0; s.miss = 0; s.done = {}; s.lastTap = -9; s.hitT = -9; s.missT = -9; s.wob = -1; s.beatN = -1; s.conf = []; s.rings = [];
  },
  down(g, x, y) {
    const s = g.s, t = g.t; if (t - s.lastTap < 0.09) return; s.lastTap = t;
    const k = Math.round((t - s.t0) / s.iv), err = Math.abs(t - (s.t0 + k * s.iv));
    if (k >= 0 && err <= s.win && !s.done[k]) {
      s.done[k] = 1; s.hits++; s.hitT = t; g.sfx('tambourine'); g.sfx('clap');
      s.rings.push({ t, good: true });
      const n = 18 + s.hits * 6; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 220 + Math.random() * 260; s.conf.push({ x: DX, y: DY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 14, col: CONF[i % CONF.length], w: 4 + Math.random() * 4, h: 7 + Math.random() * 6, age: 0 }); }
      if (s.hits >= s.need) { g.win(); g.sfx('cheer'); g.sfx('trumpet'); g.burst(DX, DY, ['#ffd45a', '#fff', '#ff9ab8'], 30, 240); }
    } else {
      s.miss++; s.missT = t; s.wob = Math.floor(Math.random() * DANCERS.length); g.sfx('boing'); s.rings.push({ t, good: false });
      if (s.miss >= s.maxMiss) g.fail();
    }
  },
  update(g, dt) {
    const s = g.s, n = Math.floor((g.t - s.t0) / s.iv + 0.0001);
    if (n > s.beatN && g.t >= s.t0 && !g.done) { s.beatN = n; g.sfx('drum'); }
    for (const p of s.conf) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; p.vx *= Math.pow(0.4, dt); p.vy = Math.min(p.vy, 120 + Math.sin(p.age * 6 + p.r) * 30); p.r += p.vr * dt; }
    s.conf = s.conf.filter(p => p.y < 680 && p.age < 4);
  },
  auto(g, dt, synth) { // test bot: tap right on each beat
    const s = g.s, k = Math.round((g.t - s.t0) / s.iv), tb = s.t0 + k * s.iv;
    if (k >= 0 && Math.abs(g.t - tb) < 0.02 && !s.done[k]) { synth('down', DX, DY); synth('up', DX, DY); }
  },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('exodus_dance_bg', paintShore), 0, 0, W, H);
    // glitter on the calm sea behind
    for (let i = 0; i < 30; i++) { const x = (i * 37 + t * 6) % W, y = 300 + (i * 13) % 70, k = Math.max(0, Math.sin(t * 3.5 + i * 1.9)); if (k > 0.5) { c.fillStyle = `rgba(255,246,210,${(k - 0.5) * 1.8})`; c.fillRect(x - 5, y, 10, 1.5); } }
    P.rays(c, 180, 250, W, H, '#fff0c0', 0.12, 11, t);
    // the beat: 0 right on the beat, rising to 1 just before the next
    const ph = g.t < s.t0 ? 1 - (s.t0 - g.t) / s.iv : ((g.t - s.t0) / s.iv) % 1, pulse = Math.pow(1 - Math.min(1, ph * 3), 2) * (g.t >= s.t0 - 0.02 ? 1 : 0);
    const energy = s.hits / s.need, hitK = Math.max(0, 1 - (t - s.hitT) * 3);
    // back row: families clapping along
    const back = [[30, 474, P.SKIN[2], P.CLOTH.teal], [92, 466, P.SKIN[3], P.CLOTH.rust], [268, 466, P.SKIN[1], P.CLOTH.indigo], [330, 474, P.SKIN[0], P.CLOTH.olive]];
    back.forEach(([x, y, sk, rb], i) => P.person(c, x, y - pulse * 3, 0.66, { skin: sk, robe: rb, stripe: P.CLOTH.cream, beard: i % 2 === 1, hair: P.HAIR[i % 3], hairStyle: i % 2 ? 'short' : 'long', head: i === 1 ? 'wrap' : undefined, expr: 'laugh', arms: pulse > 0.4 ? 'pray' : 'out', t, bounce: 0, child: i === 3 }));
    P.goat(c, 18, 500, 0.8, { t, facing: 1 }); P.sheep(c, 344, 502, 0.8, { t, facing: -1 });
    // the tambourine target with an approaching ring that lands on the beat
    drawTarget(c, s, t, ph, pulse, hitK, g);
    // Miriam in the middle
    const mBounce = pulse * (6 + energy * 10) + hitK * 10;
    const mArms = (s.beatN % 2 === 0) ? 'cheer' : 'up';
    P.person(c, DX, 612 - mBounce, 1.45, { skin: P.SKIN[3], robe: P.CLOTH.teal, stripe: P.CLOTH.saffron, sash: P.CLOTH.rose, hairStyle: 'curly', hair: P.HAIR[0], expr: g.result === 'fail' ? 'surprised' : 'laugh', arms: g.done ? 'cheer' : mArms, t, bounce: 0 });
    { const mx = DX + 34, my = 612 - mBounce - 108; c.save(); c.translate(mx, my); c.rotate(Math.sin(t * 9) * 0.3 + pulse * 0.4); c.fillStyle = '#e9c37a'; c.strokeStyle = '#8a5a2a'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#fff4dc'; c.beginPath(); c.arc(0, 0, 7.5, 0, 7); c.fill(); c.fillStyle = '#e0e0e0'; for (let i = 0; i < 5; i++) { const a = i * 1.26; c.beginPath(); c.arc(Math.cos(a) * 11, Math.sin(a) * 11, 2.4, 0, 7); c.fill(); } c.restore(); }
    // the dancers, swaying and jumping more as the song builds
    DANCERS.forEach((d, i) => {
      const side = i < 2 ? -1 : 1, beatSign = (s.beatN + i) % 2 ? 1 : -1;
      const jump = pulse * (4 + energy * 16) + hitK * (8 + energy * 10) + (g.result === 'win' ? Math.abs(Math.sin(t * 9 + i)) * 18 : 0);
      let tilt = beatSign * (0.05 + energy * 0.18) * (0.4 + pulse);
      let expr = 'laugh', arms = pulse > 0.3 ? 'cheer' : (i % 2 ? 'out' : 'wave');
      if (s.wob === i && t - s.missT < 0.7) { const k = t - s.missT; tilt = Math.sin(k * 26) * 0.35 * (1 - k / 0.7); expr = 'surprised'; arms = 'out'; }
      if (g.result === 'fail') { tilt = Math.sin(t * 8 + i) * 0.2; expr = i % 2 ? 'laugh' : 'surprised'; }
      c.save(); c.translate(d.x, d.y); c.rotate(tilt); c.translate(-d.x, -d.y);
      P.person(c, d.x, d.y - jump, d.s, { ...d.o, expr, arms, t, bounce: 0, facing: -side });
      // each dancer twirls a ribbon
      const hx = d.x + (arms === 'cheer' ? side * -17 : side * -21) * d.s, hy = d.y - jump - (arms === 'cheer' ? 52 : 30) * d.s;
      c.strokeStyle = CONF[i + 1]; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); for (let k = 1; k <= 8; k++) c.lineTo(hx - side * k * 4 * (0.6 + energy), hy - k * 3 + Math.sin(t * 8 + k * 0.8 + i) * (3 + energy * 4)); c.stroke();
      c.restore();
      if (s.wob === i && t - s.missT < 0.7) { const k = (t - s.missT) / 0.7; c.save(); c.globalAlpha = 1 - k; c.fillStyle = '#fff6c0'; for (let j = 0; j < 3; j++) { const a = t * 6 + j * 2.1; drawStar(c, d.x + Math.cos(a) * 18, d.y - 80 * d.s - jump + Math.sin(a) * 6, 4, a); } c.restore(); }
    });
    // confetti and petals
    for (const p of s.conf) { c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.scale(1, Math.cos(p.age * 9 + p.r)); c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore(); }
    if (g.result === 'win') for (let i = 0; i < 10; i++) { const a = ((t - g.doneAt) * 0.8 + i * 0.1) % 1; c.save(); c.globalAlpha = 1 - a; c.fillStyle = CONF[i % CONF.length]; drawStar(c, 20 + i * 36, 150 + a * 120 + (i % 3) * 20, 5, t * 3 + i); c.restore(); }
    P.vignette(c, W, H, 0.26); P.grain(c, W, H, 0.06);
  },
});

function drawTarget(c, s, t, ph, pulse, hitK, g) {
  // soft halo that flares on every beat
  const halo = c.createRadialGradient(DX, DY, DR * 0.5, DX, DY, DR * 2.6 + pulse * 20); halo.addColorStop(0, `rgba(255,236,160,${0.35 + pulse * 0.35 + hitK * 0.3})`); halo.addColorStop(1, 'rgba(255,236,160,0)'); c.fillStyle = halo; c.beginPath(); c.arc(DX, DY, DR * 2.6 + pulse * 20, 0, 7); c.fill();
  // the incoming ring shrinks to land on the rim exactly on the beat
  if (!g.done) { const q = 1 - ph; const rr = DR + 4 + q * 78; c.save(); c.globalAlpha = 0.5 + 0.5 * (1 - q); c.strokeStyle = '#fffbea'; c.lineWidth = 4 + (1 - q) * 5; c.shadowColor = '#ffe08a'; c.shadowBlur = 12; c.beginPath(); c.arc(DX, DY, rr, 0, 7); c.stroke(); c.restore(); }
  // feedback rings from taps
  for (const r of s.rings) { const q = (t - r.t) / 0.5; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = r.good ? '#ffd45a' : '#c8b8ff'; c.lineWidth = 6 * (1 - q) + 1; c.beginPath(); c.arc(DX, DY, DR + q * (r.good ? 70 : 30), 0, 7); c.stroke(); c.restore(); }
  // the tambourine itself, squashing on the beat
  const sc = 1 + pulse * 0.12 + hitK * 0.1;
  c.save(); c.translate(DX, DY); c.scale(sc, sc); c.rotate(Math.sin(t * 2) * 0.06 + hitK * Math.sin(t * 40) * 0.08);
  c.fillStyle = 'rgba(80,30,40,0.25)'; c.beginPath(); c.ellipse(4, 8, DR + 4, DR + 2, 0, 0, 7); c.fill();
  const rim = c.createLinearGradient(-DR, -DR, DR, DR); rim.addColorStop(0, '#f2c27a'); rim.addColorStop(1, '#a8652a'); c.fillStyle = rim; c.strokeStyle = '#6a3a18'; c.lineWidth = 2.5; c.beginPath(); c.arc(0, 0, DR, 0, 7); c.fill(); c.stroke();
  const skin = c.createRadialGradient(-12, -14, 4, 0, 0, DR - 8); skin.addColorStop(0, '#fffaf0'); skin.addColorStop(1, '#ecd6aa'); c.fillStyle = skin; c.beginPath(); c.arc(0, 0, DR - 8, 0, 7); c.fill();
  // painted flower on the drumhead
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; c.fillStyle = i % 2 ? '#e07a8a' : '#2f8f8a'; c.beginPath(); c.ellipse(Math.cos(a) * 12, Math.sin(a) * 12, 7, 4.5, a, 0, 7); c.fill(); }
  c.fillStyle = '#e9b949'; c.beginPath(); c.arc(0, 0, 6, 0, 7); c.fill();
  // jingling zils around the rim
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.sin(t * 20) * 0.03 * pulse; const zx = Math.cos(a) * (DR - 3), zy = Math.sin(a) * (DR - 3); const zg = c.createRadialGradient(zx - 2, zy - 2, 0.5, zx, zy, 6); zg.addColorStop(0, '#ffffff'); zg.addColorStop(1, '#b8b0a0'); c.fillStyle = zg; c.strokeStyle = '#6a6050'; c.lineWidth = 1; c.beginPath(); c.ellipse(zx, zy, 6, 4, a, 0, 7); c.fill(); c.stroke(); }
  // ribbons hanging from the bottom
  for (let i = 0; i < 3; i++) { c.strokeStyle = ['#ff7a8a', '#ffd45a', '#7ad0f0'][i]; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10 + i * 10, DR - 2); for (let k = 1; k <= 6; k++) c.lineTo(-10 + i * 10 + Math.sin(t * 6 + k * 0.9 + i) * 5, DR - 2 + k * 7); c.stroke(); }
  c.restore();
  // sparkles circling when the beat lands
  if (pulse > 0.2) { c.save(); c.globalAlpha = pulse; c.fillStyle = '#fff6c0'; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t; drawStar(c, DX + Math.cos(a) * (DR + 18), DY + Math.sin(a) * (DR + 18), 5, a); } c.restore(); }
}
// the far shore of the sea at sunrise: calm water, cliffs, palms and festival banners
function paintShore(o) {
  P.sky(o, W, H, ['#3a6ab0', '#88b8d8', '#ffd0a0', '#ffeec8'], { x: 180, y: 250, r: 34, color: '#ffe6a0', glow: 300 });
  P.cloud(o, 70, 110, 0.8, '#fff6ea', '#e8a8b8', 0.9); P.cloud(o, 290, 150, 0.6, '#fff6ea', '#e8a8b8', 0.85); P.cloud(o, 200, 70, 0.4, '#fff6ea', '#e8a8b8', 0.7);
  // birds
  o.strokeStyle = 'rgba(80,60,90,0.55)'; o.lineWidth = 1.5; o.lineCap = 'round'; for (const [bx, by] of [[110, 190], [126, 182], [250, 200], [96, 204]]) { o.beginPath(); o.moveTo(bx - 6, by - 2); o.quadraticCurveTo(bx - 3, by - 4, bx, by); o.quadraticCurveTo(bx + 3, by - 4, bx + 6, by - 2); o.stroke(); }
  // the sea they crossed, calm now
  P.hills(o, W, 286, 30, '#9a8ab0', '#8a7aa0', { seed: 61, freq: 0.012, dabs: 10 });
  const sea = o.createLinearGradient(0, 284, 0, 380); sea.addColorStop(0, '#9ad8e0'); sea.addColorStop(1, '#3a9ab0'); o.fillStyle = sea; o.fillRect(0, 284, W, 100);
  const path = o.createLinearGradient(0, 284, 0, 380); path.addColorStop(0, 'rgba(255,240,190,0.75)'); path.addColorStop(1, 'rgba(255,240,190,0.1)'); o.fillStyle = path; o.beginPath(); o.moveTo(160, 284); o.lineTo(200, 284); o.lineTo(250, 380); o.lineTo(110, 380); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(255,255,255,0.5)'; o.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const y = 296 + i * 14; o.beginPath(); for (let x = 0; x <= W; x += 8) o.lineTo(x, y + Math.sin(x * 0.05 + i) * 1.5); o.stroke(); }
  // the sandy shore
  P.hills(o, W, 386, 14, '#f6dcaa', '#e0b478', { seed: 63, freq: 0.02, dabs: 80, rim: '#ffffff' });
  const r = P.rng(65); for (let i = 0; i < 40; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff4d8' : '#c89058', 0.25); o.beginPath(); o.ellipse(r() * W, 400 + r() * 240, 6 + r() * 10, 1.5 + r() * 2.5, 0, 0, 7); o.fill(); }
  // palms framing both sides
  P.palm(o, 22, 430, 1.0, 0.25, 0, '#3f8a4a'); P.palm(o, 342, 436, 1.05, -0.25, 0, '#4a9a52');
  // festival streamers strung between the palms
  o.strokeStyle = 'rgba(110,70,40,0.7)'; o.lineWidth = 1.5; o.beginPath(); o.moveTo(40, 318); o.quadraticCurveTo(180, 370, 316, 320); o.stroke();
  const flag = ['#ff7a8a', '#ffd45a', '#7ad0f0', '#b0e070', '#c88ae8'];
  for (let i = 1; i < 14; i++) { const u = i / 14, x = (1 - u) * (1 - u) * 40 + 2 * u * (1 - u) * 180 + u * u * 316, y = (1 - u) * (1 - u) * 318 + 2 * u * (1 - u) * 370 + u * u * 320; o.fillStyle = flag[i % 5]; o.beginPath(); o.moveTo(x - 6, y); o.lineTo(x + 6, y); o.lineTo(x, y + 13); o.closePath(); o.fill(); }
  // warm light pooling on the sand where they dance
  const pool = o.createRadialGradient(180, 560, 10, 180, 560, 200); pool.addColorStop(0, 'rgba(255,236,180,0.45)'); pool.addColorStop(1, 'rgba(255,236,180,0)'); o.fillStyle = pool; o.fillRect(0, 380, W, 260);
  P.flowers(o, W, 600, 640, 10, undefined, 66);
}
