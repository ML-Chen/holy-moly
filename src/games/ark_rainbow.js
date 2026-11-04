// RAINBOW! — after the flood the land is fresh and sparkling; trace the rainbow's arc with your finger to paint it across the sky (Genesis 9:8–17).
const CX = 180, CY = 436, R = 150, BAND = 7;                    // the arc's centre (below the hills), radius of its middle and band width
const A0 = Math.PI + 0.12, A1 = 2 * Math.PI - 0.12;                // the arc runs from the left foot to the right foot
const COLS = ['#ef6a6a', '#f6a052', '#f6d86a', '#86c870', '#6aaee0', '#7a7ad0', '#b28ad8'];   // seven soft natural bands, red outside to violet inside
const STEPS = 60;
function arcPt(k, r = R) { const a = A0 + (A1 - A0) * k; return [CX + Math.cos(a) * r, CY + Math.sin(a) * r]; }
// nearest point on the arc to (x, y): returns [k along the arc 0..1, distance from the middle line]
function nearest(x, y) { let a = Math.atan2(y - CY, x - CX); if (a < 0) a += 2 * Math.PI; const k = Math.max(0, Math.min(1, (a - A0) / (A1 - A0))); const [px, py] = arcPt(k); return [k, Math.hypot(x - px, y - py)]; }
function paintBands(c, k0, k1, alpha = 1, t = 0) {
  if (k1 <= k0) return; c.save(); c.lineCap = 'butt';
  for (let i = 0; i < 7; i++) { const r = R + (3 - i) * BAND; c.strokeStyle = P.rgba(COLS[i], 0.82 * alpha); c.lineWidth = BAND + 1; c.beginPath(); c.arc(CX, CY, r, A0 + (A1 - A0) * k0, A0 + (A1 - A0) * k1); c.stroke(); }
  // soft glow and a sheen along the top band
  c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,250,230,${0.18 * alpha})`; c.lineWidth = BAND * 9; c.beginPath(); c.arc(CX, CY, R, A0 + (A1 - A0) * k0, A0 + (A1 - A0) * k1); c.stroke();
  c.restore();
}
MG.add({
  id: 'rainbow', stage: 'ark', cmd: 'RAINBOW!', hint: 'drag', time: 5.5, mood: 'bright', winText: 'Promise!',
  card: { title: 'The rainbow promise', ref: 'Genesis 9:8–17', kind: 'Ancient story', text: 'Genesis tells how, after the flood, God made a promise to Noah, his family and every living creature. God put a rainbow in the clouds as a sign of that promise, so that whenever it appears, God will remember it.', note: 'Israel told this story to say that God is faithful, and every rainbow can remind us of God\'s promise to care for the world.', ask: 'What is a promise you have made to someone? How do you keep it?' },
  init(g) {
    const s = g.s; s.tol = [46, 34, 26][g.level]; s.reach = 0; s.tracing = false; s.last = null; s.wobble = 0; s.done = 0; s.sparks = [];
    // either end can be the start; the child starts from whichever foot they touch
    s.dir = 0;
  },
  down(g, x, y) {
    const s = g.s, [k, d] = nearest(x, y); if (d > s.tol * 1.4) return;
    if (!s.dir) { if (k < 0.2) s.dir = 1; else if (k > 0.8) s.dir = -1; else return; }
    const pos = s.dir > 0 ? k : 1 - k; if (pos > s.reach + 0.12) return;
    s.tracing = true; g.sfx('magic');
  },
  move(g, x, y) {
    const s = g.s; if (!s.tracing || s.done) return;
    const [k, d] = nearest(x, y), pos = s.dir > 0 ? k : 1 - k;
    if (d > s.tol) { s.wobble = g.t; return; }   // off the arc: painting pauses until the finger comes back
    if (pos > s.reach && pos < s.reach + 0.16) {
      const step = Math.floor(pos * 14); if (step > Math.floor(s.reach * 14)) { g.sfx('sparkle'); const [px, py] = arcPt(s.dir > 0 ? pos : 1 - pos); s.sparks.push({ x: px, y: py, t: g.t }); }
      s.reach = pos;
      if (s.reach > 0.97) { s.reach = 1; s.done = g.t; s.tracing = false; g.sfx('harp'); g.burst(CX, CY - R, ['#fff6d0', '#ffd45a', '#9fe0ff', '#ffb0c8'], 26, 220); g.win(); }
    }
  },
  up(g) { g.s.tracing = false; },
  update(g, dt) {},
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.5 || s.done) return;
    if (!s.botK) { s.botK = 0.02; const [x, y] = arcPt(0.02); synth('down', x, y); return; }
    s.botK = Math.min(1, s.botK + dt * [0.62, 0.62, 0.95][g.level] * g.speed); const [x, y] = arcPt(s.botK, R + Math.sin(g.t * 9) * 8); synth('move', x, y);
    if (s.botK >= 1) synth('up', x, y);
  },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('ark_rainbow_bg', o => {
      // fresh rinsed morning sky; the sun is low behind us (a rainbow always faces away from the sun), so only its warm light shows
      P.sky(o, W, H, ['#4f8fcc', '#8cc4e6', '#d2ecf0', '#fff0cc']);
      const sun = o.createRadialGradient(-60, 700, 20, -60, 700, 520); sun.addColorStop(0, 'rgba(255,214,150,0.55)'); sun.addColorStop(1, 'rgba(255,214,150,0)'); o.fillStyle = sun; o.fillRect(0, 0, W, H);
      // the far mountain where the ark came to rest, with the ark on its shoulder
      o.fillStyle = '#9ab6c6'; o.beginPath(); o.moveTo(20, 420); o.quadraticCurveTo(90, 372, 130, 364); o.quadraticCurveTo(170, 370, 250, 420); o.closePath(); o.fill();
      o.fillStyle = 'rgba(255,255,255,0.35)'; o.beginPath(); o.moveTo(112, 370); o.quadraticCurveTo(130, 360, 150, 368); o.lineTo(140, 374); o.lineTo(130, 370); o.lineTo(120, 376); o.closePath(); o.fill();
      ARK.draw(o, 128, 370, 0.24);
      P.cloud(o, 300, 170, 0.6, '#fffaf2', '#e8c8c8', 0.9); P.cloud(o, 210, 250, 0.35, '#fffaf2', '#e8c8c8', 0.7);
      P.hills(o, W, 432, 40, '#a8cc7a', '#78a058', { seed: 12, freq: 0.01, dabs: 60, rim: '#eaf6b8' });
      // a bright stream winding through the meadow
      P.hills(o, W, 486, 28, '#8cc460', '#5e9440', { seed: 31, freq: 0.014, dabs: 120, rim: '#e0f4a0' });
      const st = o.createLinearGradient(0, 480, 0, 640); st.addColorStop(0, '#bfe8f0'); st.addColorStop(1, '#6ac0d8'); o.fillStyle = st;
      o.beginPath(); o.moveTo(150, 494); o.bezierCurveTo(130, 540, 230, 560, 190, 640); o.lineTo(250, 640); o.bezierCurveTo(280, 560, 170, 540, 166, 494); o.closePath(); o.fill();
      o.strokeStyle = 'rgba(255,255,255,0.6)'; o.lineWidth = 1.4; for (let i = 0; i < 6; i++) { const y = 510 + i * 22; o.beginPath(); o.moveTo(176 + Math.sin(i) * 20, y); o.lineTo(190 + Math.sin(i) * 20, y + 2); o.stroke(); }
      P.tree(o, 300, 520, 0.9, '#5f9a4a', 4); P.tree(o, 40, 540, 0.7, '#6aa850', 7);
      P.grassTufts(o, W, 500, 640, 90, '#78ac4a', 5); P.flowers(o, W, 500, 640, 46, undefined, 8);
    }), 0, 0, W, H);
    // the dotted guide arc (a wide soft lane so kids see where to go)
    c.save(); c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = s.tol * 1.3; c.lineCap = 'round'; c.beginPath(); c.arc(CX, CY, R, A0, A1); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 5; c.setLineDash([2, 14]); c.lineDashOffset = -t * 30; c.beginPath(); c.arc(CX, CY, R, A0, A1); c.stroke(); c.restore();
    // the painted part of the rainbow
    const from = s.dir >= 0 ? 0 : 1 - s.reach, to = s.dir >= 0 ? s.reach : 1;
    if (s.done) { const q = Math.min(1, (t - s.done) * 3);
      c.save(); c.beginPath(); c.arc(CX, CY, R - 3.5 * BAND, A0, A1); c.closePath(); c.clip(); c.fillStyle = `rgba(255,255,245,${0.16 * q})`; c.fillRect(0, 0, W, H); c.restore();
      c.save(); c.lineCap = 'butt'; for (let i = 0; i < 7; i++) { c.strokeStyle = P.rgba(COLS[6 - i], 0.13 * q); c.lineWidth = BAND * 0.9; c.beginPath(); c.arc(CX, CY, R + 56 + (3 - i) * BAND * 0.85, A0 + 0.05, A1 - 0.05); c.stroke(); } c.restore(); paintBands(c, 0, 1, 0.85 + 0.15 * q, t); c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,255,240,${0.3 * (1 - q)})`; c.lineWidth = 70; c.beginPath(); c.arc(CX, CY, R, A0, A1); c.stroke(); c.restore(); }
    else if (s.reach > 0) paintBands(c, from, to, 1, t);
    // the glowing brush tip, or both feet glowing as places to start
    const pulse = 0.5 + 0.5 * Math.sin(t * 5);
    const tips = s.done ? [] : s.reach > 0 ? [s.dir > 0 ? s.reach : 1 - s.reach] : [0, 1];
    for (const k of tips) { const [x, y] = arcPt(k); c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(x, y, 2, x, y, 40); gl.addColorStop(0, `rgba(255,250,220,${0.6 + 0.3 * pulse})`); gl.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y, 40, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#fffaf0'; drawStar(c, x, y, 9 + pulse * 3, t * 2); }
    // the other end shines as the goal
    if (s.reach > 0 && !s.done) { const [x, y] = arcPt(s.dir > 0 ? 1 : 0); c.save(); c.globalAlpha = 0.5 + 0.4 * pulse; c.fillStyle = '#ffe9a8'; drawStar(c, x, y, 11, -t); c.restore(); }
    if (g.t - s.wobble < 0.3 && s.tracing) { c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2; c.beginPath(); c.arc(g.ptr.x, g.ptr.y, 14, 0, 7); c.stroke(); }
    for (const p of s.sparks) { const q = (t - p.t) / 0.6; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.fillStyle = '#fffbe8'; for (let i = 0; i < 4; i++) drawStar(c, p.x + Math.cos(i * 1.6) * q * 22, p.y + Math.sin(i * 1.6) * q * 22, 3.5, q * 4); c.restore(); }
    // the last grey clouds drifting off, sparkling drops on the grass
    P.cloud(c, 60 - t * 6, 70, 0.7, '#e8eaf2', '#a8acc0', 0.85); P.cloud(c, 150 - t * 4, 40, 0.45, '#eef0f6', '#b0b4c8', 0.7);
    for (let i = 0; i < 14; i++) { const x = (i * 71) % W, y = 520 + ((i * 37) % 110), sp = Math.max(0, Math.sin(t * 3 + i * 1.9)); if (sp > 0.7) { c.fillStyle = `rgba(255,255,255,${(sp - 0.7) * 3})`; drawStar(c, x, y, 3, 0); } }
    // Noah and his family and the animals stand in the new meadow, looking up
    const won = g.result === 'win';
    drawAnimal(c, 'sheep', 68, 600, 1.2, t, 1, won); drawAnimal(c, 'giraffe', 284, 612, 1.3, t, 2, won);
    P.person(c, 120, 604, 1.25, { skin: P.SKIN[2], robe: P.CLOTH.olive, stripe: P.CLOTH.cream, beard: '#e8e2da', hair: P.HAIR[5], head: 'wrap', expr: won ? 'laugh' : 'wow', arms: won ? 'cheer' : 'up', t });
    P.person(c, 226, 608, 1.15, { skin: P.SKIN[1], robe: P.CLOTH.plum, stripe: P.CLOTH.gold, hairStyle: 'bun', hair: P.HAIR[5], expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : 'pray', t, phase: 2, facing: -1 });
    P.dove(c, 250 + Math.sin(t * 1.5) * 40, 200 + Math.sin(t * 2.3) * 10, 0.8, { t, branch: true, facing: Math.cos(t * 1.5) > 0 ? 1 : -1 });
    P.vignette(c, W, H, 0.25); P.grain(c, W, H, 0.06);
  },
});
