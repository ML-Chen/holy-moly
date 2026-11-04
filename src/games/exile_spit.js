// SPIT! — Jonah 2:10. Tickle the big friendly fish's belly (or swipe up) until it giggles Jonah out onto the beach.
const JONAH = { skin: P.SKIN[2], robe: P.CLOTH.sky, stripe: P.CLOTH.white, beard: true, hair: P.HAIR[1] };
const FX0 = 128, FY0 = 430, FS = 1.55, LANDX = 282, LANDY = 566;
const fishPt = (s, px, py) => [s.fx + px * FS, s.fy + py * FS];
function heartS(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.75, -r * 1.25, 0, -r * 0.45); c.bezierCurveTo(r * 0.75, -r * 1.25, r * 1.4, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }
function gull(c, x, y, s, t) { const f = Math.sin(t * 7) * 4 * s; c.strokeStyle = 'rgba(80,50,80,0.6)'; c.lineWidth = 1.7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 8 * s, y - f); c.quadraticCurveTo(x - 4 * s, y - 4 * s, x, y); c.quadraticCurveTo(x + 4 * s, y - 4 * s, x + 8 * s, y - f); c.stroke(); }
function crab(c, x, y, t, happy) {
  c.save(); c.translate(x + Math.sin(t * 1.3) * 6, y); const k = Math.sin(t * 8) * 0.15;
  c.fillStyle = 'rgba(60,30,30,0.2)'; c.beginPath(); c.ellipse(0, 1, 13, 3, 0, 0, 7); c.fill();
  c.strokeStyle = '#c8503a'; c.lineWidth = 2; c.lineCap = 'round'; for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(sx * 6, -4); c.lineTo(sx * (11 + i * 2), -1 + i * 1.5); c.stroke(); }
  for (const sx of [-1, 1]) { c.save(); c.translate(sx * 9, -9); c.rotate(sx * (happy ? -0.6 + k * 3 : k)); c.fillStyle = '#e8644a'; c.beginPath(); c.ellipse(sx * 4, -4, 4.5, 3.5, 0, 0, 7); c.fill(); c.restore(); }
  const g = c.createRadialGradient(-3, -9, 1, 0, -5, 11); g.addColorStop(0, '#ff9a7a'); g.addColorStop(1, '#d8503a'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -5, 10, 7, 0, 0, 7); c.fill();
  for (const sx of [-1, 1]) { c.strokeStyle = '#c8503a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(sx * 3, -10); c.lineTo(sx * 4, -15); c.stroke(); P.eye(c, sx * 4, -16, 2); }
  c.restore();
}
function shell(c, x, y, s, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 6, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fill(); c.strokeStyle = P.shade(col, -0.3); c.lineWidth = 0.8; for (let i = 0; i < 5; i++) { const a = Math.PI * (1.12 + i * 0.19); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 6, Math.sin(a) * 6); c.stroke(); } c.restore(); }

MG.add({
  id: 'spit', stage: 'exile', cmd: 'SPIT!', hint: 'tap', time: 5, mood: 'sea', winText: 'Ptooey!',
  card: { title: 'Jonah and the big fish', ref: 'Jonah 1–2', kind: 'Ancient story', text: 'The book of Jonah tells a story about a prophet who sailed the other way when God sent him to Nineveh. A big fish swallowed Jonah, and he prayed inside it for three days and nights. Then the fish spat him out onto dry land.', note: 'Jonah is a funny story with a serious point: God\'s love reaches even the people we think of as enemies.', ask: 'When have you been given a second chance? How could you give someone else one?' },
  init(g) {
    const s = g.s, L = g.level; s.need = [4, 6, 8][L]; s.tick = 0; s.lastT = -9; s.out = false; s.outT = 0; s.landed = false; s.landT = 0;
    s.fx = FX0; s.fy = FY0; s.drift = [0, 14, 26][L]; s.ripples = []; s.bubbles = []; s.taps = [];
  },
  down(g, x, y) {
    const s = g.s; if (s.out) return;
    const [bx, by] = fishPt(s, -6, 14);
    if (Math.hypot((x - bx) / 1.6, y - by) < 50) this.tickle(g, 1, x, y); else { s.ripples.push({ x, y, t: g.t }); g.sfx('drip'); }
  },
  swipe(g, dx, dy) { if (dy < -40 && !g.s.out) { const [bx, by] = fishPt(g.s, -6, 14); this.tickle(g, 2, bx, by); } },
  tickle(g, n, x, y) {
    const s = g.s; s.tick += n; s.lastT = g.t; s.taps.push({ x, y, t: g.t }); g.sfx(s.tick % 2 ? 'boing' : 'laugh'); g.burst(x, y - 6, ['#ffffff', '#bff0ff', '#ffd0e0'], 6, 90);
    if (s.tick >= s.need) { s.out = true; s.outT = g.t; g.sfx('splashbig'); g.shake(5, 0.25); const [mx, my] = fishPt(s, 60, -2); g.burst(mx + 10, my, ['#dff8ff', '#9fe0ff', '#ffffff'], 26, 220); }
  },
  update(g, dt) {
    const s = g.s, t = g.t;
    s.fx = FX0 + Math.sin(t * 1.4) * s.drift; s.fy = FY0 + Math.sin(t * 2.1) * (4 + s.drift * 0.3);
    if (s.out && !s.landed && t - s.outT > 0.62) { s.landed = true; s.landT = t; g.sfx('thud'); g.burst(LANDX, LANDY - 4, ['#f6dca8', '#e8c088', '#fff4d8'], 20, 170); g.win(); }
    if (Math.random() < dt * 2.5) { const [mx, my] = fishPt(s, 48, -8); s.bubbles.push({ x: mx, y: my, t, r: 2 + Math.random() * 3 }); }
    s.bubbles = s.bubbles.filter(b => t - b.t < 1.4); s.ripples = s.ripples.filter(r => t - r.t < 0.7); s.taps = s.taps.filter(r => t - r.t < 0.5);
  },
  auto(g, dt, synth) { const s = g.s; if (g.t > 0.4 && !s.out && g.t - (s.botT || 0) > 0.16) { s.botT = g.t; const [bx, by] = fishPt(s, -6, 14); synth('down', bx, by); synth('up', bx, by); } },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('exile_spit_bg', o => {
      P.sky(o, W, H, ['#2a2f72', '#6a4f9e', '#d8708a', '#ffb07a', '#ffe0a0'], { x: 238, y: 318, r: 34, color: '#ffc880', glow: 300 });
      P.stars(o, W, 150, 30, 12, 0);
      P.rays(o, 238, 318, W, H, '#ffe6b8', 0.1, 11, 0);
      // banded sunset clouds
      for (const [y, a, w] of [[232, 0.55, 140], [256, 0.45, 200], [280, 0.35, 120]]) { o.fillStyle = `rgba(255,170,150,${a})`; o.beginPath(); o.ellipse(90 + y % 40, y, w, 5, 0, 0, 7); o.fill(); o.fillStyle = `rgba(255,220,180,${a * 0.8})`; o.beginPath(); o.ellipse(260 - y % 30, y + 14, w * 0.6, 3, 0, 0, 7); o.fill(); }
      P.cloud(o, 70, 150, 0.85, '#ffd8d0', '#a870a8', 0.85); P.cloud(o, 300, 110, 0.55, '#ffd8d0', '#a870a8', 0.7);
      P.water(o, W, 318, 640, '#1e3d72', '#e09a8a', 0, { waves: 0 });
      // the sun's golden road on the water
      o.save(); o.globalCompositeOperation = 'screen'; const sr = o.createLinearGradient(0, 318, 0, 520); sr.addColorStop(0, 'rgba(255,220,150,0.65)'); sr.addColorStop(1, 'rgba(255,220,150,0)'); o.fillStyle = sr; o.beginPath(); o.moveTo(218, 318); o.lineTo(258, 318); o.lineTo(330, 520); o.lineTo(150, 520); o.closePath(); o.fill(); o.restore();
      // distant headland
      o.fillStyle = '#6a4a7a'; o.beginPath(); o.moveTo(300, 320); o.quadraticCurveTo(330, 300, 362, 306); o.lineTo(362, 320); o.closePath(); o.fill();
    }), 0, 0, W, H);
    // live shimmer on the sea
    c.save(); c.beginPath(); c.rect(0, 318, W, 322); c.clip();
    for (let k = 0; k < 9; k++) { const y = 326 + k * k * 2.6 + k * 6; c.strokeStyle = `rgba(255,214,190,${0.28 - k * 0.02})`; c.lineWidth = 1 + k * 0.25; c.beginPath(); for (let x = -10; x <= W + 10; x += 6) { const yy = y + Math.sin(x * (0.06 - k * 0.004) + t * (1.4 + k * 0.1) + k) * (1 + k * 0.4); x < 0 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
    for (let i = 0; i < 26; i++) { const a = i * 2.4, y = 324 + (i * 37 % 170), w0 = 3 + (y - 318) / 18, x = 238 + Math.sin(a) * (y - 310) * 0.45 + Math.sin(t * 0.8 + i) * 4, f = Math.max(0, Math.sin(t * 2.4 + i * 1.3)); c.fillStyle = `rgba(255,236,180,${f * 0.8})`; c.fillRect(x - w0, y, w0 * 2, 1.4); }
    c.restore();
    for (let i = 0; i < 3; i++) gull(c, (60 + i * 26 + t * 14) % 420 - 30, 196 + i * 12 + Math.sin(t + i) * 5, 1 - i * 0.12, t + i);
    // bubbles from the fish
    for (const b of s.bubbles) { const a = t - b.t; c.strokeStyle = `rgba(230,250,255,${0.8 * (1 - a / 1.4)})`; c.lineWidth = 1.2; c.beginPath(); c.arc(b.x + Math.sin(a * 6) * 4, b.y - a * 40, b.r, 0, 7); c.stroke(); }
    // the fish: wiggles and squeezes with each tickle, then opens wide and spits
    const since = t - s.lastT, gig = Math.max(0, 1 - since / 0.35), frac = Math.min(1, s.tick / s.need);
    const spit = s.out ? Math.max(0, 1 - (t - s.outT) / 0.8) : 0;
    const mouth = s.out ? 0.2 + spit * 1.0 : 0.15 + gig * 0.35 + frac * 0.15;
    c.save(); c.translate(s.fx, s.fy); c.rotate(Math.sin(t * 30) * 0.05 * gig - spit * 0.12); c.scale(1 + gig * 0.05 + spit * 0.1, 1 - gig * 0.06);
    // water line around the fish
    c.fillStyle = 'rgba(30,60,110,0.25)'; c.beginPath(); c.ellipse(0, 46, 120, 10, 0, 0, 7); c.fill();
    P.bigFish(c, 0, 0, FS, { t, mouth, col: '#4f86c6' });
    // happy squinting eye while giggling, and rosy cheeks that grow as it gets more ticklish
    if (gig > 0.1 || s.out) { c.fillStyle = '#5a92d0'; c.beginPath(); c.arc(24 * FS, -18 * FS, 9 * FS, 0, 7); c.fill(); c.strokeStyle = '#1e2a48'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.arc(25 * FS, -15 * FS, 5 * FS, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke(); }
    c.fillStyle = `rgba(255,110,140,${0.25 + frac * 0.4})`; c.beginPath(); c.ellipse(32 * FS, -4 * FS, (6 + frac * 3) * FS, (3.5 + frac * 1.5) * FS, 0, 0, 7); c.fill();
    // a soft target glow on the belly
    if (!s.out) { const p = 0.5 + 0.5 * Math.sin(t * 6); c.strokeStyle = `rgba(255,255,255,${0.5 + 0.4 * p})`; c.lineWidth = 3; c.setLineDash([6, 7]); c.lineDashOffset = -t * 20; c.beginPath(); c.ellipse(-6 * FS, 14 * FS, 34 + p * 4, 20 + p * 3, 0, 0, 7); c.stroke(); c.setLineDash([]); }
    // Jonah peeks out between the lips when the fish giggles
    if (!s.out && mouth > 0.38) { c.save(); c.beginPath(); c.moveTo(62 * FS, (-6 - mouth * 22) * FS); c.lineTo(36 * FS, 0); c.lineTo(62 * FS, (6 + mouth * 22) * FS); c.closePath(); c.clip(); P.person(c, 58 * FS, 40, 0.8, { ...JONAH, expr: 'wow', arms: 'up', facing: 1, t }); c.restore(); }
    c.restore();
    // the sea laps over the fish's lower half
    c.save(); const wl = s.fy + 30; c.beginPath(); c.moveTo(-10, 640); for (let x = -10; x <= W + 10; x += 6) c.lineTo(x, wl + Math.sin(x * 0.07 + t * 2.4) * 3); c.lineTo(W + 10, 640); c.closePath();
    const wg = c.createLinearGradient(0, wl, 0, wl + 60); wg.addColorStop(0, 'rgba(70,80,150,0.55)'); wg.addColorStop(1, 'rgba(30,50,110,0.85)'); c.fillStyle = wg; c.fill();
    c.strokeStyle = 'rgba(255,230,220,0.75)'; c.lineWidth = 2.5; c.beginPath(); for (let x = 10; x <= 250; x += 6) { const y = wl + Math.sin(x * 0.07 + t * 2.4) * 3; x === 10 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); c.restore();
    // the beach: a curve of warm sand on the right with a lapping foam line
    c.drawImage(g.bake('exile_spit_beach', o => {
      const sg = o.createLinearGradient(0, 470, 0, 640); sg.addColorStop(0, '#ffd8a8'); sg.addColorStop(1, '#e0a870'); o.fillStyle = sg; o.beginPath(); o.moveTo(150, 640); o.bezierCurveTo(170, 560, 220, 500, 362, 470); o.lineTo(362, 640); o.closePath(); o.fill();
      o.save(); o.clip(); const r = P.rng(61); for (let i = 0; i < 90; i++) { const x = 160 + r() * 200, y = 480 + r() * 160; o.fillStyle = r() < 0.5 ? 'rgba(255,248,226,0.6)' : 'rgba(170,110,60,0.3)'; o.beginPath(); o.arc(x, y, 0.8 + r() * 1.4, 0, 7); o.fill(); } o.fillStyle = 'rgba(255,170,120,0.25)'; o.beginPath(); o.ellipse(300, 500, 90, 20, -0.2, 0, 7); o.fill(); o.restore();
      shell(o, 236, 616, 1.2, '#ffc8c0'); shell(o, 336, 600, 1, '#f8e6c8'); shell(o, 318, 520, 0.9, '#ffb0a0');
      P.palm(o, 334, 548, 1.05, -0.24, 0, '#3f7a52'); P.palm(o, 356, 500, 0.75, -0.3, 0, '#4a8a5a');
      P.rock(o, 196, 624, 0.8, '#a88878');
    }), 0, 0, W, H);
    const fo = Math.sin(t * 1.8) * 6; c.save(); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); for (let k = 0; k <= 30; k++) { const u = k / 30, x = 150 + 212 * u, y = 640 * (1 - u) * (1 - u) * (1 - u) + 3 * (1 - u) * (1 - u) * u * 560 + 3 * (1 - u) * u * u * 500 + u * u * u * 470; const bx = (1 - u) ** 3 * 150 + 3 * (1 - u) ** 2 * u * 170 + 3 * (1 - u) * u * u * 220 + u ** 3 * 362; k ? c.lineTo(bx - fo, y + 2 + Math.sin(u * 20 + t * 3) * 1.5) : c.moveTo(bx - fo, y + 2); } c.stroke(); c.restore();
    // giggle marks
    for (const tp of s.taps) { const a = (t - tp.t) / 0.5; c.strokeStyle = `rgba(255,255,255,${1 - a})`; c.lineWidth = 2.5; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const an = -2.4 + i * 0.6, r0 = 14 + a * 16; c.beginPath(); c.moveTo(tp.x + Math.cos(an) * r0, tp.y + Math.sin(an) * r0); c.lineTo(tp.x + Math.cos(an) * (r0 + 8), tp.y + Math.sin(an) * (r0 + 8)); c.stroke(); } }
    if (gig > 0.2 && !s.out) { const [hx, hy] = fishPt(s, 10, -48); for (let i = 0; i < 3; i++) { c.fillStyle = `rgba(255,255,255,${gig})`; c.beginPath(); c.arc(hx + i * 14, hy - i * 6 - (1 - gig) * 10, 4 - i, 0, 7); c.fill(); } }
    for (const r of s.ripples) { const a = (t - r.t) / 0.7; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - a)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(r.x, r.y, 8 + a * 26, (8 + a * 26) * 0.35, 0, 0, 7); c.stroke(); }
    // Jonah: flying out in a spray, then splat in the sand, soggy but fine
    const happyCrab = s.landed;
    crab(c, 232, 592, t, happyCrab);
    if (s.out) {
      const a = t - s.outT, [mx, my] = fishPt(s, 62, -4);
      if (!s.landed) { const q = Math.min(1, a / 0.62), x = mx + (LANDX - mx) * q, y = my + (LANDY - my) * q - Math.sin(q * Math.PI) * 170;
        for (let i = 0; i < 10; i++) { const qq = Math.max(0, q - i * 0.03), xx = mx + (LANDX - mx) * qq, yy = my + (LANDY - my) * qq - Math.sin(qq * Math.PI) * 170; c.fillStyle = `rgba(210,245,255,${0.85 - i * 0.07})`; c.beginPath(); c.arc(xx + Math.sin(i * 3) * 6, yy - 20 + Math.cos(i * 2) * 6, 5 - i * 0.35, 0, 7); c.fill(); }
        c.save(); c.translate(x, y); c.rotate(q * Math.PI * 2.2); P.person(c, 0, 30, 1.2, { ...JONAH, expr: 'surprised', arms: 'up', t: 0 }); c.restore(); }
      else { const b = t - s.landT, sq = Math.max(0, 1 - b * 4), sy = 1 - 0.35 * sq * Math.abs(Math.cos(b * 20)), sx = 1 + 0.25 * sq;
        c.fillStyle = 'rgba(140,90,50,0.3)'; c.beginPath(); c.ellipse(LANDX, LANDY + 2, 34, 7, 0, 0, 7); c.fill();
        c.save(); c.translate(LANDX, LANDY); c.scale(sx, sy); P.person(c, 0, 0, 1.25, { ...JONAH, robe: '#5a92c8', expr: b > 0.25 ? 'laugh' : 'surprised', arms: b > 0.25 ? 'cheer' : 'out', t, bounce: 0.6 });
        // seaweed on his head
        c.strokeStyle = '#3f9a5a'; c.lineWidth = 3; c.lineCap = 'round'; for (const [dx, sd] of [[-6, -1], [0, 1], [6, 1]]) { c.beginPath(); c.moveTo(dx, -92); c.quadraticCurveTo(dx + sd * 10, -104, dx + sd * 16 + Math.sin(t * 4 + dx) * 2, -96 + Math.abs(dx)); c.stroke(); }
        c.fillStyle = '#3f9a5a'; c.beginPath(); c.ellipse(0, -92, 10, 4, 0, 0, 7); c.fill();
        c.restore();
        for (let i = 0; i < 5; i++) { const q = ((b * 1.4 + i / 5) % 1); c.fillStyle = `rgba(150,215,255,${0.9 * (1 - q)})`; c.beginPath(); c.ellipse(LANDX - 22 + i * 11, LANDY - 70 + q * 60, 2, 3, 0, 0, 7); c.fill(); }
        // the fish laughs and waves goodbye with a heart
        for (let i = 0; i < 4; i++) { const q = (b * 0.8 + i / 4) % 1, [hx, hy] = fishPt(s, 20 + i * 8, -50); c.globalAlpha = 1 - q; heartS(c, hx + Math.sin(q * 6 + i) * 8, hy - q * 60, 6 + (i % 2) * 2, ['#ff7a9a', '#ffd45a'][i % 2]); } c.globalAlpha = 1; }
    }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
