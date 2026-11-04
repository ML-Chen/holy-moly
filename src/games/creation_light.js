// LIGHT! — "Let there be light" (Genesis 1:3). The world is dark and empty; tap the glowing sparks. Each one blooms into dawn colour,
// and when every spark is lit they fly to the horizon and become the rising sun.
const HUES = [['#ffe08a', '#ff9a4a'], ['#ffc0cc', '#ee6a8a'], ['#ffd8a8', '#ff7a4a'], ['#e0c8ff', '#9a6ae0'], ['#b8f4e8', '#48b8b0']];
const SUN = { x: 180, y: 446 }, SEA = 446;
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
let layer = null, lc = null;
function dawnLayer() { if (!layer) { layer = document.createElement('canvas'); layer.width = W * 2; layer.height = H * 2; lc = layer.getContext('2d'); } return lc; }

MG.add({
  id: 'light', stage: 'creation', cmd: 'LIGHT!', hint: 'tap', time: 5, mood: 'night', winText: 'Good!',
  card: { title: 'Let there be light', ref: 'Genesis 1:1–5', kind: 'Poem', text: 'The book of Genesis begins with a poem. At first everything was dark and empty, and God said, "Let there be light," and there was light. God saw that the light was good and called it Day.', note: 'People wrote this poem to worship God for making a good world, long before anyone knew how stars and planets form.', ask: 'What is your favorite thing to see when the sun comes up?' },
  init(g) {
    const s = g.s, n = [2, 3, 4][g.level], amp = [0, 34, 58][g.level];
    s.sparks = []; let tries = 0;
    while (s.sparks.length < n && tries++ < 400) {
      const bx = 60 + amp * 0.5 + Math.random() * (240 - amp), by = 120 + Math.random() * 340;
      if (s.sparks.some(p => Math.hypot(p.bx - bx, p.by - by) < 120)) continue;
      const i = s.sparks.length;
      s.sparks.push({ bx, by, x: bx, y: by, ax: amp * (0.6 + Math.random() * 0.4), ay: amp * 0.6 * (0.6 + Math.random() * 0.4), fx: (0.7 + Math.random() * 0.5) * g.speed, fy: (0.6 + Math.random() * 0.5) * g.speed, ph: Math.random() * 6, hue: HUES[(i + Math.floor(Math.random() * 5)) % 5], lit: false, litT: 0 });
    }
    s.lit = 0; s.allT = null; s.rings = []; s.misses = []; s.r = n;
  },
  update(g) {
    const s = g.s, t = g.t;
    for (const p of s.sparks) if (!p.lit) { p.x = p.bx + Math.sin(t * p.fx + p.ph) * p.ax; p.y = p.by + Math.sin(t * p.fy + p.ph * 1.7) * p.ay + Math.sin(t * 2.2 + p.ph) * 3; }
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = g.level === 2 ? 40 : 46;
    for (const p of s.sparks) { if (p.lit) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
    if (!best) { s.misses.push({ x, y, t: g.t }); g.sfx('tap'); return; }
    best.lit = true; best.litT = g.t; best.lx = best.x; best.ly = best.y; s.lit++;
    s.rings.push({ x: best.x, y: best.y, t: g.t, hue: best.hue });
    g.burst(best.x, best.y, [best.hue[0], best.hue[1], '#fff8e0'], 18, 190);
    if (s.lit === s.sparks.length) { s.allT = g.t; g.sfx('harp'); g.win(); } else g.sfx('sparkle');
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.7 || g.t - (s.botT || 0) < (g.level ? 0.4 : 0.5)) return;
    const p = s.sparks.find(q => !q.lit); if (!p) return; s.botT = g.t; synth('down', p.x, p.y); synth('up', p.x, p.y);
  },
  draw(g, c) {
    const s = g.s, t = g.t, n = s.sparks.length;
    const full = s.allT == null ? 0 : eo((t - s.allT) / 0.9);
    // 1. the dark, empty deep, with slow swirls and the Spirit's breath moving over the waters
    c.drawImage(g.bake('creation_light_void', paintVoid), 0, 0, W, H);
    if (full < 1) drawSwirls(c, t, 1 - full);
    // 2. the dawn, revealed only where light has bloomed
    const L = dawnLayer(); L.setTransform(2, 0, 0, 2, 0, 0); L.globalCompositeOperation = 'source-over'; L.clearRect(0, 0, W, H);
    L.fillStyle = `rgba(0,0,0,${0.16 * s.lit / n})`; L.fillRect(0, 0, W, H);
    for (const p of s.sparks) if (p.lit) {
      const k = eo((t - p.litT) / 0.7), r = 24 + 150 * k + Math.min(40, (t - p.litT) * 10);
      const gr = L.createRadialGradient(p.lx, p.ly, 0, p.lx, p.ly, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.92)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      L.fillStyle = gr; L.beginPath(); L.arc(p.lx, p.ly, r, 0, 7); L.fill();
    }
    if (full > 0) { L.fillStyle = `rgba(0,0,0,${full})`; L.fillRect(0, 0, W, H); }
    L.globalCompositeOperation = 'source-in'; L.drawImage(g.bake('creation_light_dawn', paintDawn), 0, 0, W, H);
    L.globalCompositeOperation = 'source-atop'; dawnLife(L, t, s.allT == null ? 0 : t - s.allT);
    L.globalCompositeOperation = 'source-over';
    c.drawImage(layer, 0, 0, W, H);
    // a tinted glow over each fresh bloom
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const p of s.sparks) if (p.lit && s.allT == null) { const q = Math.min(1, (t - p.litT) / 1.4), a = 0.45 * (1 - q) + 0.12; const gr = c.createRadialGradient(p.lx, p.ly, 0, p.lx, p.ly, 120); gr.addColorStop(0, P.rgba(p.hue[0], a)); gr.addColorStop(1, P.rgba(p.hue[1], 0)); c.fillStyle = gr; c.fillRect(p.lx - 120, p.ly - 120, 240, 240); }
    c.restore();
    // 3. rings from taps and little ripples from misses
    for (const r of s.rings) { const q = (t - r.t) / 0.8; if (q > 1) continue; c.save(); for (let k = 0; k < 2; k++) { const qq = Math.max(0, q - k * 0.15); c.strokeStyle = P.rgba(k ? '#ffffff' : r.hue[0], (1 - qq) * 0.6); c.lineWidth = 6 * (1 - qq) + 1; c.beginPath(); c.arc(r.x, r.y, 14 + eo(qq) * 70, 0, 7); c.stroke(); } c.restore(); }
    for (const m of s.misses) { const q = (t - m.t) / 0.5; if (q > 1) continue; c.strokeStyle = `rgba(150,140,230,${0.4 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(m.x, m.y, 6 + q * 22, 0, 7); c.stroke(); }
    // 4. sparks: unlit ones glow and beckon; lit ones become soft orbs that finally fly into the sun
    for (const p of s.sparks) {
      if (!p.lit) { drawSpark(c, p.x, p.y, t, p.ph, p.hue, 1); continue; }
      let x = p.lx, y = p.ly, a = 0.75, sz = 0.7;
      if (s.allT != null) { const k = eo((t - s.allT) / 0.55); x += (SUN.x - x) * k; y += (SUN.y - 14 - y) * k; a = 0.75 * (1 - k * 0.7); sz = 0.7 - k * 0.3; }
      drawSpark(c, x, y, t, p.ph, p.hue, a, sz, true);
    }
    if (s.allT != null) { // the gathered light swells at the horizon
      const k = Math.min(1, (t - s.allT - 0.4) / 0.5); if (k > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createRadialGradient(SUN.x, SUN.y - 20, 0, SUN.x, SUN.y - 20, 200); gr.addColorStop(0, `rgba(255,240,200,${0.5 * Math.sin(k * Math.PI) + 0.08})`); gr.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = gr; c.fillRect(0, SUN.y - 220, W, 400); c.restore(); }
    }
    P.vignette(c, W, H, 0.3 + 0.25 * (1 - full), full > 0.5 ? '#3a1840' : '#05030f'); P.grain(c, W, H, 0.06);
  },
});

function paintVoid(o) {
  const g = o.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#03020c'); g.addColorStop(0.45, '#0b0920'); g.addColorStop(0.69, '#15143a'); g.addColorStop(0.7, '#0a0d22'); g.addColorStop(1, '#020309'); o.fillStyle = g; o.fillRect(0, 0, W, H);
  const r = P.rng(4); o.save(); o.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 22; i++) { const x = r() * W, y = r() * SEA, rr = 50 + r() * 110, col = ['#3a2a8a', '#1a4a6a', '#5a2a6a'][i % 3]; const gr = o.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, P.rgba(col, 0.13 + r() * 0.08)); gr.addColorStop(1, P.rgba(col, 0)); o.fillStyle = gr; o.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  o.restore();
  // the deep: faint ripples only
  o.save(); for (let k = 0; k < 14; k++) { const y = SEA + 6 + k * k * 1.05; o.strokeStyle = `rgba(110,120,200,${0.12 - k * 0.006})`; o.lineWidth = 1 + k * 0.12; o.beginPath(); for (let x = -10; x <= W + 10; x += 6) { const yy = y + Math.sin(x * 0.04 + k * 1.3) * (1 + k * 0.3); x === -10 ? o.moveTo(x, yy) : o.lineTo(x, yy); } o.stroke(); } o.restore();
  P.stars(o, W, SEA - 30, 26, 41, 0); // a few very faint motes; they are dimmed below
  o.fillStyle = 'rgba(3,2,12,0.55)'; o.fillRect(0, 0, W, SEA);
}
function drawSwirls(c, t, a) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  const centers = [[90, 170, 1, '#5a4ac8'], [270, 300, -1, '#2a8aa8'], [130, 400, 1, '#8a4ab8'], [300, 110, -1, '#3a6ac8']];
  centers.forEach(([cx, cy, dir, col], i) => {
    const rot = t * 0.35 * dir + i;
    for (let arm = 0; arm < 3; arm++) {
      c.strokeStyle = P.rgba(col, 0.16 * a); c.lineWidth = 10 - arm * 2.5; c.beginPath();
      for (let k = 0; k <= 40; k++) { const q = k / 40, ang = rot + arm * 2.1 + q * 4.2 * dir, rr = 12 + q * 78; const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * 0.75; k ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
    }
  });
  // drifting motes of the unmade world
  const r = P.rng(17); for (let i = 0; i < 26; i++) { const x = (r() * W + t * (6 + r() * 10)) % W, y = r() * SEA + Math.sin(t + i) * 6, tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.9); c.fillStyle = `rgba(190,180,255,${0.22 * tw * a})`; c.beginPath(); c.arc(x, y, 1 + r() * 1.4, 0, 7); c.fill(); }
  // the Spirit of God hovering over the waters: a soft breath of light gliding along the surface
  const bx = ((t * 55) % 560) - 100; const gr = c.createRadialGradient(bx, SEA - 6, 0, bx, SEA - 6, 90); gr.addColorStop(0, `rgba(200,210,255,${0.16 * a})`); gr.addColorStop(1, 'rgba(200,210,255,0)');
  c.fillStyle = gr; c.save(); c.translate(bx, SEA - 6); c.scale(1, 0.28); c.translate(-bx, -(SEA - 6)); c.fillRect(bx - 90, SEA - 96, 180, 180); c.restore();
  c.strokeStyle = `rgba(210,215,255,${0.14 * a})`; c.lineWidth = 2; c.beginPath(); for (let x = bx - 70; x <= bx + 70; x += 4) { const yy = SEA - 10 + Math.sin(x * 0.06 + t * 3) * 3 - Math.cos((x - bx) / 70 * 1.5) * 4; x === bx - 70 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
  c.restore();
}
function paintDawn(o) {
  const g = o.createLinearGradient(0, 0, 0, SEA); [['#2e3a8e', 0], ['#5a4aa8', 0.25], ['#b85e9e', 0.5], ['#f5807c', 0.72], ['#ffb46e', 0.88], ['#ffe2a0', 1]].forEach(([col, k]) => g.addColorStop(k, col)); o.fillStyle = g; o.fillRect(0, 0, W, SEA);
  const glow = o.createRadialGradient(SUN.x, SEA, 0, SUN.x, SEA, 330); glow.addColorStop(0, 'rgba(255,246,210,0.95)'); glow.addColorStop(0.2, 'rgba(255,214,150,0.55)'); glow.addColorStop(0.55, 'rgba(255,150,120,0.18)'); glow.addColorStop(1, 'rgba(255,150,120,0)'); o.fillStyle = glow; o.fillRect(0, 0, W, SEA);
  P.stars(o, W, 150, 30, 8, 0);
  // long lit cloud streaks near the horizon, then puffy dawn clouds higher up
  const r = P.rng(12); for (let i = 0; i < 9; i++) { const y = 330 + r() * 100, x = r() * W, w = 60 + r() * 120; o.fillStyle = P.rgba(i % 2 ? '#ffd0a8' : '#f7a0a0', 0.35 + r() * 0.25); o.beginPath(); o.ellipse(x, y, w, 3 + r() * 4, 0, 0, 7); o.fill(); o.fillStyle = 'rgba(255,240,210,0.4)'; o.beginPath(); o.ellipse(x, y + 2, w * 0.8, 1.5, 0, 0, 7); o.fill(); }
  P.cloud(o, 72, 190, 0.95, '#ffe4e0', '#c27aaa'); P.cloud(o, 292, 128, 0.7, '#ffe0e8', '#a87ab8'); P.cloud(o, 262, 300, 0.6, '#fff0d8', '#e8908e'); P.cloud(o, 48, 345, 0.45, '#fff0d8', '#e8908e');
  // the sea catches the dawn
  const sg = o.createLinearGradient(0, SEA, 0, H); sg.addColorStop(0, '#f7b08a'); sg.addColorStop(0.18, '#c8708a'); sg.addColorStop(0.55, '#5a4488'); sg.addColorStop(1, '#2a2458'); o.fillStyle = sg; o.fillRect(0, SEA, W, H - SEA);
  for (let k = 0; k < 16; k++) { const y = SEA + 4 + k * k * 0.9; o.strokeStyle = `rgba(255,214,190,${0.32 - k * 0.016})`; o.lineWidth = 1.2 + k * 0.15; o.beginPath(); for (let x = -10; x <= W + 10; x += 5) { const yy = y + Math.sin(x * 0.045 + k * 1.7) * (1 + k * 0.25); x === -10 ? o.moveTo(x, yy) : o.lineTo(x, yy); } o.stroke(); }
  // the sun's road across the water
  for (let i = 0; i < 70; i++) { const q = r(), y = SEA + 4 + q * q * 190, hw = 10 + q * 70; o.fillStyle = `rgba(255,236,190,${0.75 - q * 0.5})`; o.fillRect(SUN.x - hw + r() * hw * 2 - 8, y, 6 + r() * 14, 1.6 + q * 2); }
  o.fillStyle = 'rgba(255,250,230,0.85)'; o.fillRect(0, SEA - 1, W, 2);
}
// animated life inside the revealed dawn: a rising sun, fanning rays, glitter on the water
function dawnLife(L, t, since) {
  const rise = since > 0 ? eo((since - 0.35) / 0.9) : 0, sy = SEA + 26 - rise * 58;
  L.save(); L.beginPath(); L.rect(0, 0, W, SEA); L.clip();
  for (let i = 0; i < 11; i++) { const a = -Math.PI * 0.92 + i / 10 * Math.PI * 0.84 + Math.sin(t * 0.5 + i) * 0.03, len = 520, sp = 0.05 + (i % 3) * 0.02; const gr = L.createLinearGradient(SUN.x, sy, SUN.x + Math.cos(a) * len, sy + Math.sin(a) * len); gr.addColorStop(0, `rgba(255,240,200,${0.16 + rise * 0.14})`); gr.addColorStop(1, 'rgba(255,240,200,0)'); L.fillStyle = gr; L.beginPath(); L.moveTo(SUN.x, sy); L.lineTo(SUN.x + Math.cos(a - sp) * len, sy + Math.sin(a - sp) * len); L.lineTo(SUN.x + Math.cos(a + sp) * len, sy + Math.sin(a + sp) * len); L.fill(); }
  const d = L.createRadialGradient(SUN.x, sy, 0, SUN.x, sy, 40); d.addColorStop(0, '#fffef4'); d.addColorStop(0.6, '#fff0b8'); d.addColorStop(0.85, 'rgba(255,214,140,0.9)'); d.addColorStop(1, 'rgba(255,200,130,0)'); L.fillStyle = d; L.beginPath(); L.arc(SUN.x, sy, 40, 0, 7); L.fill();
  L.restore();
  const r = P.rng(23); for (let i = 0; i < 46; i++) { const q = r(), y = SEA + 6 + q * q * 180, hw = 12 + q * 70, x = SUN.x + (r() - 0.5) * hw * 2, s = Math.max(0, Math.sin(t * 4 + i * 2.3)); if (s > 0.55) { L.fillStyle = `rgba(255,252,235,${(s - 0.55) * 2})`; L.fillRect(x - 5, y, 10 + q * 6, 1.6); } }
}
function drawSpark(c, x, y, t, ph, hue, a = 1, sz = 1, lit = false) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5 + ph);
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a;
  const R = (44 + pulse * 10) * sz; const h = c.createRadialGradient(x, y, 0, x, y, R); h.addColorStop(0, P.rgba(hue[0], 0.75)); h.addColorStop(0.3, P.rgba(hue[1], 0.28)); h.addColorStop(1, P.rgba(hue[1], 0)); c.fillStyle = h; c.fillRect(x - R, y - R, R * 2, R * 2);
  c.fillStyle = 'rgba(255,250,230,0.9)'; for (let i = 0; i < 4; i++) { const ang = t * 0.9 + ph + i * Math.PI / 2, len = (24 + pulse * 8) * sz * (i % 2 ? 0.7 : 1); c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); c.moveTo(0, -2.2 * sz); c.lineTo(len, 0); c.lineTo(0, 2.2 * sz); c.closePath(); c.fill(); c.restore(); }
  const core = c.createRadialGradient(x, y, 0, x, y, 11 * sz); core.addColorStop(0, '#ffffff'); core.addColorStop(0.5, '#fffbe8'); core.addColorStop(1, P.rgba(hue[0], 0)); c.fillStyle = core; c.beginPath(); c.arc(x, y, 11 * sz, 0, 7); c.fill();
  if (!lit) for (let i = 0; i < 3; i++) { const ang = t * 2.2 + ph + i * 2.09; c.fillStyle = P.rgba(hue[0], 0.9); c.beginPath(); c.arc(x + Math.cos(ang) * 22, y + Math.sin(ang) * 14, 1.8, 0, 7); c.fill(); }
  c.restore();
  if (!lit) { const q = ((t + ph) % 1.3) / 1.3; c.strokeStyle = P.rgba(hue[0], (1 - q) * 0.55); c.lineWidth = 2; c.beginPath(); c.arc(x, y, 14 + q * 34, 0, 7); c.stroke(); }
}
