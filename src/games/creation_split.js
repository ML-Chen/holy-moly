// SPLIT! — God makes a dome to separate the waters above from the waters below (Genesis 1:6–8).
// One churning, mixed-up mass of blue; swipe up or down through the glowing seam to pull sky and sea apart.
const SEAM = 372, HOR = 384;
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
const FISH = ['#ff9a4a', '#ffd34a', '#ff6a8a', '#7ae0c0', '#b48aff'];

MG.add({
  id: 'split', stage: 'creation', cmd: 'SPLIT!', hint: 'swipe', time: 5, mood: 'sea', winText: 'Good!',
  card: { title: 'Sky above, sea below', ref: 'Genesis 1:6–10', kind: 'Poem', text: 'The creation poem says that God made a great dome to separate the waters above from the waters below, and called it Sky. Then God gathered the waters below into seas so dry land could appear, and God saw that it was good.', note: 'Ancient people pictured the sky as a dome holding back water, and this poem uses that picture to praise God.', ask: 'If you could go anywhere, would you rather fly in the sky or swim in the sea? Why?' },
  init(g) {
    const s = g.s; s.need = [1, 1, 2][g.level]; s.got = 0; s.k = 0; s.wob = 0; s.wobT = -9; s.d0 = null; s.doneT = null;
    s.fish = FISH.map((col, i) => ({ col, x: 40 + i * 70 + Math.random() * 20, ph: Math.random() * 6, sp: 0.9 + Math.random() * 0.5, h: 50 + Math.random() * 40 }));
    s.birds = Array.from({ length: 4 }, (_, i) => ({ x: 70 + i * 70, y: 110 + (i % 2) * 50 + Math.random() * 30, ph: Math.random() * 6 }));
  },
  update(g, dt) { const s = g.s; const goal = s.got / s.need; s.k += (goal - s.k) * Math.min(1, dt * 6); if (goal - s.k < 0.002) s.k = goal; },
  down(g, x, y) { g.s.d0 = { x, y }; },
  up(g, x, y) {
    const s = g.s, d = s.d0; s.d0 = null; if (!d) return;
    const dx = x - d.x, dy = y - d.y; if (Math.hypot(dx, dy) < 50) return;
    const steep = g.level === 0 ? 0.8 : 1.4, near = g.level === 0 ? 220 : 110;
    const ok = Math.abs(dy) > Math.abs(dx) * steep && Math.min(d.y, y) < SEAM + near && Math.max(d.y, y) > SEAM - near;
    if (!ok) { s.wobT = g.t; g.sfx('wave'); return; }
    s.got = Math.min(s.need, s.got + 1); g.shake(4, 0.2);
    if (s.got >= s.need) { s.doneT = g.t; g.sfx('splashbig'); g.burst(180, SEAM, ['#ffffff', '#bfefff', '#ffe9a8'], 26, 220); g.win(); } else { g.sfx('whoosh'); g.burst(180, SEAM, ['#ffffff', '#bfefff'], 12, 160); }
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < (g.level ? 0.9 : 1.4) || s.got >= s.need || g.t - (s.botT || 0) < 0.45) return; s.botT = g.t;
    const up = s.got % 2 === 1; synth('down', 180, up ? 470 : 280); synth('move', 182, SEAM); synth('up', 184, up ? 270 : 480);
  },
  draw(g, c) {
    const s = g.s, t = g.t, k = s.k, since = s.doneT == null ? 0 : t - s.doneT;
    c.drawImage(g.bake('creation_split_world', paintWorld), 0, 0, W, H);
    // living sky and sea once revealed
    c.save(); c.globalAlpha = Math.min(1, k * 1.4);
    P.water(c, W, HOR + 2, H, '#16507e', '#4ec2cc', t, { waves: 7 });
    const rr = P.rng(9); for (let i = 0; i < 40; i++) { const q = rr(), y = HOR + 6 + q * q * 200, hw = 8 + q * 60, x = 262 + (rr() - 0.5) * hw * 2, sp = Math.max(0, Math.sin(t * 3.5 + i * 2.1)); c.fillStyle = `rgba(255,248,220,${0.25 + sp * 0.6})`; c.fillRect(x - 6, y, 10 + q * 10, 1.6 + q); }
    c.restore();
    // clouds drift up out of the parting
    const cl = [[70, 120, 0.9], [270, 80, 0.7], [220, 230, 0.55], [40, 290, 0.45], [320, 300, 0.4]];
    cl.forEach(([x, y, sc], i) => { const q = eo(s.k * 1.15 - i * 0.04); if (q <= 0) return; P.cloud(c, x + Math.sin(t * 0.4 + i) * 6, SEAM + (y - SEAM) * q, sc * (0.5 + 0.5 * q), '#fffaf2', '#b8c8e8', Math.min(1, q * 1.5)); });
    // birds and fish arrive when the work is finished
    if (s.doneT != null) {
      for (const b of s.birds) { const q = eo(since / 0.6); P.dove(c, b.x + since * 40 + Math.sin(t * 2 + b.ph) * 6, SEAM + (b.y - SEAM) * q + Math.sin(t * 3 + b.ph) * 4, 0.55, { t: t + b.ph }); }
      for (const f of s.fish) { const q = ((since * f.sp + f.ph * 0.1) % 1.1); if (q > 1) continue; const x = f.x + q * 46, y = HOR + 40 - Math.sin(q * Math.PI) * f.h; c.save(); c.translate(x, y); c.rotate(-Math.cos(q * Math.PI) * 0.9); P.fishShape(c, 0, 0, 0.9, f.col); c.restore(); if (q < 0.08 || q > 0.92) { c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.ellipse(x, HOR + 42, 12, 3, 0, 0, 7); c.fill(); } }
    }
    // the mixed-up waters, torn apart along the seam: the top half rises and fades into sky, the bottom half sinks into the sea
    const wobble = Math.max(0, 1 - (t - s.wobT) / 0.5);
    const top = SEAM - k * 420, bot = SEAM + k * 330;
    if (k < 0.999) {
      const ma = s.doneT == null ? 1 : Math.max(0, 1 - since * 2.5);
      drawMass(c, g, t, wobble, 0, top, -Math.round(k * 140), ma, true);
      drawMass(c, g, t, wobble, bot, H, Math.round(k * 120), ma, false);
    }
    // the bright seam (the target) and, as it opens, the shining dome of air between the waters
    const gap = Math.max(10, bot - top);
    c.save(); c.globalCompositeOperation = 'lighter';
    const pulse = 0.5 + 0.5 * Math.sin(t * 6), sy = (top + bot) / 2;
    const gg = c.createLinearGradient(0, sy - gap / 2 - 50, 0, sy + gap / 2 + 50); gg.addColorStop(0, 'rgba(255,240,200,0)'); gg.addColorStop(0.5, `rgba(255,236,190,${0.32 * (1 - k * 0.7) + 0.16 * pulse * (1 - k)})`); gg.addColorStop(1, 'rgba(255,240,200,0)');
    c.fillStyle = gg; c.fillRect(0, sy - gap / 2 - 50, W, gap + 100);
    if (s.doneT == null) {
      c.strokeStyle = `rgba(255,252,235,${(0.7 + 0.3 * pulse) * (1 - k)})`; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 6) { const yy = SEAM + Math.sin(x * 0.05 + t * 4) * 3; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke();
      // chevrons pulling apart, up and down, to show the motion
      const q = (t * 1.4) % 1;
      for (const dir of [-1, 1]) for (let i = 0; i < 2; i++) { const qq = (q + i * 0.5) % 1, y = SEAM + dir * (22 + qq * 70); c.strokeStyle = `rgba(255,250,225,${0.7 * Math.sin(qq * Math.PI) * (1 - k)})`; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(180 - 22, y - dir * 10); c.lineTo(180, y + dir * 2); c.lineTo(180 + 22, y - dir * 10); c.stroke(); }
    }
    c.restore();
    P.vignette(c, W, H, 0.3, '#14284a'); P.grain(c, W, H, 0.06);
  },
});

// the finished world under everything: sky above the horizon, sea below
function paintWorld(o) {
  P.sky(o, W, HOR, ['#2e6cc0', '#5aa2dc', '#9ad2ec', '#ffe6b8'], { x: 262, y: 250, r: 24, color: '#fff0c0', glow: 190 });
  P.rays(o, 262, 250, W, H * 0.5, '#fff6d8', 0.12, 11);
  const hz = o.createLinearGradient(0, HOR - 40, 0, HOR); hz.addColorStop(0, 'rgba(255,214,170,0)'); hz.addColorStop(1, 'rgba(255,190,150,0.3)'); o.fillStyle = hz; o.fillRect(0, HOR - 40, W, 40);
  const sg = o.createLinearGradient(0, HOR, 0, H); sg.addColorStop(0, '#7ad4dc'); sg.addColorStop(1, '#16507e'); o.fillStyle = sg; o.fillRect(0, HOR, W, H - HOR);
}
// the mixed-up waters: a marbled swirl of every blue, rippling in horizontal bands
function paintMarble(o) {
  const g = o.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a6ac0'); g.addColorStop(0.5, '#2f86b8'); g.addColorStop(1, '#1f5a8a'); o.fillStyle = g; o.fillRect(0, 0, W, H);
  const r = P.rng(31);
  // big soft pools of sky blue and sea teal, blurred together like wet paint
  o.save(); o.filter = 'blur(14px)';
  for (let i = 0; i < 46; i++) { const x = r() * W, y = r() * H, rr = 30 + r() * 70, col = ['#8ccff0', '#1d4a8c', '#3cb8c0', '#5a8ae0', '#b8e8f8', '#1f6a90'][i % 6]; o.fillStyle = P.rgba(col, 0.45 + r() * 0.3); o.beginPath(); o.ellipse(x, y, rr, rr * (0.5 + r() * 0.5), r() * 3, 0, 7); o.fill(); }
  o.restore();
  // flowing marble ribbons, soft first then a crisp highlight on top
  o.lineCap = 'round'; o.lineJoin = 'round';
  const ribbon = (blur, widthK, alphaK, n, seed) => { const rr = P.rng(seed); o.save(); o.filter = `blur(${blur}px)`;
    for (let i = 0; i < n; i++) { let x = rr() * W, y = rr() * H; const col = ['#d8f4ff', '#7ad8e0', '#9ab8ff', '#ffffff'][i % 4]; o.strokeStyle = P.rgba(col, (0.25 + rr() * 0.25) * alphaK); o.lineWidth = (4 + rr() * 10) * widthK; o.beginPath(); o.moveTo(x, y);
      for (let k = 0; k < 34; k++) { const a = (P.noise1(x * 0.008 + 3, 3) * 2 + P.noise1(y * 0.008, 7)) * Math.PI * 1.6; x += Math.cos(a) * 8; y += Math.sin(a) * 8; o.lineTo(x, y); } o.stroke(); }
    o.restore(); };
  ribbon(5, 2.2, 0.8, 40, 31); ribbon(0.8, 0.35, 1, 40, 31);
  // bits of sky (little clouds) and sea (curling wave crests) all tumbled together
  o.save(); for (let i = 0; i < 9; i++) { const x = 30 + r() * 300, y = 30 + r() * 580; o.translate(x, y); o.rotate((r() - 0.5) * 1.2); P.cloud(o, 0, 0, 0.28 + r() * 0.2, '#ffffff', '#a8c8f0', 0.75); o.setTransform(2, 0, 0, 2, 0, 0); }
  for (let i = 0; i < 16; i++) { const x = r() * W, y = r() * H, rr = 10 + r() * 14, a0 = r() * 6; o.strokeStyle = 'rgba(255,255,255,0.6)'; o.lineWidth = 3; o.beginPath(); o.arc(x, y, rr, a0, a0 + 3.6); o.stroke(); o.fillStyle = 'rgba(255,255,255,0.6)'; o.beginPath(); o.arc(x + Math.cos(a0 + 3.6) * rr, y + Math.sin(a0 + 3.6) * rr, 3, 0, 7); o.fill(); }
  o.restore();
  for (let i = 0; i < 36; i++) { const x = r() * W, y = r() * H, rr = 2 + r() * 5; o.fillStyle = 'rgba(220,245,255,0.3)'; o.beginPath(); o.arc(x, y, rr, 0, 7); o.fill(); o.fillStyle = 'rgba(255,255,255,0.75)'; o.beginPath(); o.arc(x - rr * 0.3, y - rr * 0.3, rr * 0.3, 0, 7); o.fill(); }
}
function drawMass(c, g, t, wob, y0, y1, dy, alpha, isTop) {
  if (y1 - y0 < 1 || alpha <= 0) return;
  const tex = g.bake('creation_split_marble', paintMarble);
  c.save(); c.globalAlpha = alpha;
  // ragged, frothy edge facing the seam
  c.beginPath();
  if (isTop) { c.moveTo(-5, -5); c.lineTo(W + 5, -5); for (let x = W + 5; x >= -5; x -= 6) c.lineTo(x, y1 + Math.sin(x * 0.07 + t * 5) * 5 + Math.sin(x * 0.19 - t * 3) * 3); }
  else { c.moveTo(-5, H + 5); c.lineTo(W + 5, H + 5); for (let x = W + 5; x >= -5; x -= 6) c.lineTo(x, y0 + Math.sin(x * 0.06 - t * 5) * 5 + Math.sin(x * 0.17 + t * 3) * 3); }
  c.closePath(); c.clip();
  const band = 6;
  for (let y = 0; y < H; y += band) {
    const off = Math.sin(y * 0.018 + t * 2.4) * 9 + Math.sin(y * 0.041 - t * 1.6) * 4 + wob * Math.sin(y * 0.03 + t * 30) * 14;
    const sy = y - dy; // source row: shift texture so it travels with the half
    c.drawImage(tex, 0, Math.min(H - band, ((sy % H) + H) % H) * 2, W * 2, band * 2, off - 12, y, W + 24, band + 1);
  }
  // slow swirling highlights on top
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) { const cx = 60 + i * 64 + Math.sin(t * 0.7 + i) * 20, cy = (isTop ? 120 + (i % 2) * 120 : 470 + (i % 2) * 90) + dy, rot = t * (i % 2 ? 1 : -1) * 0.9 + i; c.strokeStyle = 'rgba(200,240,255,0.18)'; c.lineWidth = 5; c.beginPath(); for (let q = 0; q <= 1; q += 0.05) { const a = rot + q * 5, rr = 6 + q * 40; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.7; q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  c.restore();
  // froth line along the edge
  c.save(); c.globalAlpha = alpha; c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 3; c.beginPath();
  for (let x = -5; x <= W + 5; x += 6) { const yy = isTop ? y1 + Math.sin(x * 0.07 + t * 5) * 5 + Math.sin(x * 0.19 - t * 3) * 3 : y0 + Math.sin(x * 0.06 - t * 5) * 5 + Math.sin(x * 0.17 + t * 3) * 3; x === -5 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
  c.stroke(); c.restore();
}
