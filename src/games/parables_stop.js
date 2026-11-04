// STOP! — Luke 10:30–35. Walk the Jericho road as the Samaritan with his donkey; tap the hurt traveler as you reach him, to stop and help.
const SAM = { skin: P.SKIN[1], robe: P.CLOTH.rust, stripe: P.CLOTH.cream, head: 'wrap', headCol: P.CLOTH.saffron, beard: true, hair: P.HAIR[2] };
const TRAV = { skin: P.SKIN[2], robe: P.CLOTH.sky, stripe: P.CLOTH.white, hairStyle: 'curly', hair: P.HAIR[0] };
const PRIEST = { skin: P.SKIN[1], robe: P.CLOTH.white, stripe: P.CLOTH.indigo, head: 'wrap', headCol: P.CLOTH.white, beard: P.HAIR[5], hair: P.HAIR[5] };
const LEVITE = { skin: P.SKIN[3], robe: P.CLOTH.teal, stripe: P.CLOTH.gold, beard: true, hair: P.HAIR[1] };
const TW = 720, SAMX = 150, LANE = 552, VY = 592, FAR = 490, DKX = 68;

// ---- seamless scrolling strips: everything inside repeats every TW pixels ----
function wave(seed) { const r = P.rng(seed), ks = [1, 2, 3, 5, 8], ph = ks.map(() => r() * 6.283); return u => { let v = 0, a = 0; ks.forEach((k, i) => { v += Math.sin(u * 6.283 * k + ph[i]) / k; a += 1 / k; }); return 0.5 + 0.5 * v / a; }; }
function ridge(o, base, amp, seed, bottom, top, botCol, rim, dabs = 0) {
  const f = wave(seed), path = () => { o.beginPath(); o.moveTo(-2, bottom); for (let x = -2; x <= TW + 2; x += 3) o.lineTo(x, base - amp * f(x / TW)); o.lineTo(TW + 2, bottom); o.closePath(); };
  path(); const gr = o.createLinearGradient(0, base - amp, 0, bottom); gr.addColorStop(0, top); gr.addColorStop(1, botCol); o.fillStyle = gr; o.fill();
  o.save(); path(); o.clip(); const r = P.rng(seed * 7);
  for (let i = 0; i < dabs; i++) { const x = r() * TW, y = base - amp + r() * (bottom - base + amp), c = r() < 0.5 ? P.shade(top, 0.2) : P.shade(botCol, -0.15), a = 0.1 + r() * 0.1, rx = 6 + r() * 16, ry = 2 + r() * 4; wrapDraw(x, xx => { o.fillStyle = P.rgba(c, a); o.beginPath(); o.ellipse(xx, y, rx, ry, 0, 0, 7); o.fill(); }); }
  if (rim) { o.strokeStyle = P.rgba(rim, 0.65); o.lineWidth = 3; o.beginPath(); for (let x = -2; x <= TW + 2; x += 3) { const y = base - amp * f(x / TW) + 1.5; x < 0 ? o.moveTo(x, y) : o.lineTo(x, y); } o.stroke(); }
  o.restore(); return x => base - amp * f(x / TW);
}
function wrapDraw(x, fn) { fn(x); if (x < 80) fn(x + TW); if (x > TW - 80) fn(x - TW); }
function strip(g, key, y0, h, fn) { return g.bake(key, o => { o.translate(0, -y0); fn(o); }, TW, h); }
function drawStrip(c, img, y0, h, off) { const ox = ((off % TW) + TW) % TW; c.drawImage(img, -ox, y0, TW, h); c.drawImage(img, TW - ox, y0, TW, h); }
function tuft(o, x, y, h, col) { o.strokeStyle = col; o.lineWidth = 1.6; o.lineCap = 'round'; for (let k = -2; k <= 2; k++) { o.beginPath(); o.moveTo(x + k, y); o.quadraticCurveTo(x + k * 2.5, y - h * 0.6, x + k * 4.5, y - h * (1 - Math.abs(k) * 0.15)); o.stroke(); } }
function shrub(o, x, y, s, col) { const r = P.rng(Math.floor(x * 13 + y)); o.fillStyle = 'rgba(60,30,30,0.18)'; o.beginPath(); o.ellipse(x + 2, y, 16 * s, 4 * s, 0, 0, 7); o.fill(); for (let i = 0; i < 7; i++) { const bx = x + (r() - 0.5) * 22 * s, by = y - 6 * s - r() * 12 * s, br = (6 + r() * 5) * s; const gr = o.createRadialGradient(bx - br * 0.4, by - br * 0.5, 1, bx, by, br); gr.addColorStop(0, P.shade(col, 0.3)); gr.addColorStop(1, P.shade(col, -0.15)); o.fillStyle = gr; o.beginPath(); o.arc(bx, by, br, 0, 7); o.fill(); } }

function limb(c, ax, ay, bx, by, w, col, out) { c.lineCap = 'round'; c.strokeStyle = out; c.lineWidth = w + 2.4; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
// ---- people sitting on the ground (knees up). x,y = where the hips meet the ground ----
function sitFig(c, x, y, s, o, k = {}) {
  const f = o.facing || 1, robe = o.robe, out = P.shade(robe, -0.45), skin = o.skin;
  c.save(); c.translate(x, y); c.scale(s * f, s);
  c.fillStyle = 'rgba(40,20,40,0.22)'; c.beginPath(); c.ellipse(10, 1, 28, 5, 0, 0, 7); c.fill();
  const leg = (hx, kx, ky, fx, dark) => { const rc = dark ? P.shade(robe, -0.15) : robe, sc = dark ? P.shade(skin, -0.12) : skin;
    limb(c, kx, ky, fx, -3, 6.5, sc, P.shade(skin, -0.4));
    c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(fx + 3, -2.5, 6, 3.2, 0, 0, 7); c.fill();
    limb(c, hx, -6, kx, ky, 12, rc, out); };
  leg(-2, 13, -21, 24, true);
  c.save(); c.beginPath(); c.rect(-50, -150, 100, 147); c.clip(); P.person(c, 0, 16, 1, { ...o, facing: 1, bounce: o.bounce ?? 0.5 }); c.restore();
  c.fillStyle = robe; c.strokeStyle = out; c.lineWidth = 1.6; c.beginPath(); c.ellipse(2, -6, 15, 7, 0, 0, 7); c.fill(); c.stroke();
  leg(4, 19, -19, 31, false);
  if (k.scrape) { c.fillStyle = 'rgba(226,110,110,0.75)'; c.beginPath(); c.ellipse(24.5, -11, 3.2, 2.2, 0.9, 0, 7); c.fill(); c.strokeStyle = 'rgba(255,220,210,0.9)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(23, -12.5); c.lineTo(26, -10); c.moveTo(23.5, -10.5); c.lineTo(25.8, -8.6); c.stroke(); }
  if (k.bandage) { const q = Math.min(1, k.bandage); c.save(); c.translate(24.5, -11); c.rotate(-1.0); c.scale(q, q); c.fillStyle = '#fffaf0'; c.strokeStyle = '#c8b8a0'; c.lineWidth = 1; roundRect(c, -6, -5, 12, 10, 2.5); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-2, -5); c.lineTo(-2, 5); c.moveTo(2, -5); c.lineTo(2, 5); c.stroke(); c.restore(); }
  c.restore();
}
function heart(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.75, -r * 1.25, 0, -r * 0.45); c.bezierCurveTo(r * 0.75, -r * 1.25, r * 1.4, -r * 0.1, 0, r * 0.9); c.fill(); c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(-r * 0.45, -r * 0.45, r * 0.22, r * 0.14, -0.6, 0, 7); c.fill(); c.restore(); }
function jar(c, x, y, col) { c.fillStyle = col; c.strokeStyle = P.shade(col, -0.45); c.lineWidth = 1; c.beginPath(); c.moveTo(x - 2, y - 7); c.lineTo(x + 2, y - 7); c.quadraticCurveTo(x + 6, y - 3, x + 4, y + 3); c.quadraticCurveTo(x, y + 6, x - 4, y + 3); c.quadraticCurveTo(x - 6, y - 3, x - 2, y - 7); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x - 2.5, y - 3, 1.4, 4); }
// the Samaritan's donkey with a striped blanket and his jars of oil and wine
function donkeyPack(c, x, y, s, t, sit, walk) {
  c.save(); const b = walk ? Math.abs(Math.sin(t * 8)) * 1.6 * s : 0;
  if (sit) { c.translate(x, y); c.rotate(-0.22 * sit); c.scale(1, 1 - 0.12 * sit); c.translate(-x, -y); }
  c.translate(0, -b); P.donkey(c, x, y, s, {});
  c.translate(x, y); c.scale(s, s);
  c.fillStyle = P.CLOTH.indigo; c.strokeStyle = P.shade(P.CLOTH.indigo, -0.4); c.lineWidth = 0.8; roundRect(c, -10, -28.5, 19, 12, 3); c.fill(); c.stroke();
  c.fillStyle = P.CLOTH.saffron; c.fillRect(-10, -24, 19, 2); c.fillStyle = P.CLOTH.red; c.fillRect(-10, -20.5, 19, 1.5);
  jar(c, -5, -12, '#d08a4c'); jar(c, 5, -12, '#9a4a58');
  c.restore();
}

MG.add({
  id: 'stop', stage: 'parables', cmd: 'STOP!', hint: 'tap', time: 5, mood: 'desert', winText: 'Neighbor!',
  card: { title: 'The kind neighbor', ref: 'Luke 10:25–37', kind: 'Parable', text: 'Jesus told a story about a man who was hurt and left by the road. Two leaders walked past him, but a Samaritan, a man his listeners saw as an outsider, stopped, bandaged him and took him to an inn to get better.', ask: 'Who could you stop and help this week, even someone who is not your friend yet?' },
  init(g) {
    const s = g.s, L = g.level;
    s.v = [100, 120, 140][L] * (1 + (g.speed - 1) * 0.6); s.win = [130, 100, 75][L];
    const tArrive = g.dur * (0.5 + Math.random() * 0.12);
    s.tx0 = SAMX + 30 + s.win / 2 + s.v * tArrive; s.scroll = 0; s.vel = s.v; s.mode = null; s.modeT = 0; s.hearts = []; s.puffs = []; s.clouds = [[60, 120, 0.7], [250, 70, 0.55], [330, 190, 0.45]];
    // the priest and the Levite pass the hurt man, keeping to the far side of the road
    s.walkers = [[PRIEST, 335], [LEVITE, 262]].map(([o, xp], i) => ({ o, x: xp + (s.v + 70) * ((s.tx0 - xp) / s.v), phase: i * 2 }));
  },
  down(g, x, y) {
    const s = g.s; if (s.mode) return; const tx = s.tx0 - s.scroll;
    if (tx > W - 15) { s.puffs.push({ x: SAMX + 10, y: LANE, t: g.t }); g.sfx('tap'); return; } // he is not on screen yet: a tap does nothing
    if (tx - SAMX <= 30 + s.win) { // just right: stop and help
      s.mode = 'help'; s.modeT = g.t; s.target = s.tx0 - (SAMX + 62); g.sfx('sparkle'); g.win();
      for (let i = 0; i < 10; i++) s.hearts.push({ x: SAMX + 62 + (Math.random() - 0.5) * 30, y: VY - 40, vx: (Math.random() - 0.5) * 90, vy: -70 - Math.random() * 90, t: g.t + i * 0.03, r: 5 + Math.random() * 4, col: ['#ff6a8a', '#ff9ab0', '#ffd45a'][i % 3] });
    } else { s.mode = 'early'; s.modeT = g.t; g.sfx('bray'); g.shake(4, 0.2); g.fail(); } // stopped too soon: the donkey plops down in the empty road
  },
  update(g, dt) {
    const s = g.s;
    if (s.mode === 'help') { s.scroll += (s.target - s.scroll) * Math.min(1, dt * 10); s.vel = 0; }
    else { if (s.mode) s.vel *= Math.pow(0.02, dt); s.scroll += s.vel * dt; }
    for (const w of s.walkers) w.x -= (s.vel + 70) * dt;
    const tx = s.tx0 - s.scroll;
    if (!s.mode && tx - SAMX < -12) { s.mode = 'missed'; s.modeT = g.t; g.fail(); }
    if (!s.mode && Math.floor(g.t * 2.6) !== Math.floor((g.t - dt) * 2.6)) s.puffs.push({ x: SAMX - 4, y: LANE, t: g.t }, { x: DKX - 8, y: LANE + 4, t: g.t });
    s.puffs = s.puffs.filter(p => g.t - p.t < 0.6);
    for (const c of s.clouds) c[0] -= dt * (4 + s.vel * 0.02);
  },
  auto(g, dt, synth) { const s = g.s, tx = s.tx0 - s.scroll; if (!s.mode && tx < W - 15 && tx - SAMX <= 30 + s.win * 0.5) { synth('down', tx, VY - 30); synth('up', tx, VY - 30); } },
  draw(g, c) {
    const s = g.s, t = g.t, sc = s.scroll;
    c.drawImage(g.bake('parables_stop_sky', o => {
      P.sky(o, W, H, ['#4a78b8', '#8fb6d6', '#f6dcae', '#f8b47c'], { x: 288, y: 150, r: 26, color: '#ffe2a0', glow: 260 });
      P.rays(o, 288, 150, W, H, '#fff0c8', 0.12, 9, 0);
    }), 0, 0, W, H);
    for (let i = 0; i < 3; i++) { const bx = 80 + i * 22 + Math.sin(t * 0.7 + i) * 16, by = 250 + i * 9 + Math.cos(t * 0.9 + i * 2) * 6, f = Math.sin(t * 9 + i * 2) * 3; c.strokeStyle = 'rgba(90,60,80,0.55)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx - 6, by - f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 6, by - f); c.stroke(); }
    for (const [x, y, k] of s.clouds) P.cloud(c, ((x % 460) + 460) % 460 - 50, y, k, '#fff8ee', '#e8c0b8', 0.85);
    drawStrip(c, strip(g, 'parables_stop_far', 220, 220, o => {
      const fr = ridge(o, 318, 70, 3, 440, '#d2b0c0', '#b496b0', '#f6dce0', 30);
      for (const tx0 of [170, 560]) { const by = fr(tx0) + 4; o.fillStyle = '#c8a0aa'; for (let i = 0; i < 7; i++) { const w = 9 + (i * 7) % 6, hh = 8 + (i * 5) % 9, x = tx0 - 28 + i * 8; o.fillStyle = i % 2 ? '#e8c6c4' : '#dcb4b8'; o.fillRect(x, by - hh, w, hh + 6); o.fillStyle = '#f8e2da'; o.fillRect(x, by - hh, w, 1.5); } o.fillStyle = 'rgba(150,100,130,0.5)'; o.fillRect(tx0 - 18, by - 6, 2, 3); o.fillRect(tx0 + 6, by - 9, 2, 3); }
      ridge(o, 362, 46, 5, 440, '#dcae98', '#bf8f7e', '#ffd8b8', 50);
      const hz = o.createLinearGradient(0, 300, 0, 440); hz.addColorStop(0, 'rgba(255,226,190,0)'); hz.addColorStop(1, 'rgba(255,226,190,0.45)'); o.fillStyle = hz; o.fillRect(0, 300, TW, 140);
    }), 220, 220, sc * 0.08);
    drawStrip(c, strip(g, 'parables_stop_mid', 330, 140, o => {
      const top = ridge(o, 420, 42, 11, 470, '#e8b77c', '#c98f5c', '#ffe0a8', 90); const r = P.rng(12);
      for (let i = 0; i < 9; i++) { const x = r() * TW, s2 = 0.28 + r() * 0.12; wrapDraw(x, xx => P.tree(o, xx, top(((xx % TW) + TW) % TW) + 8, s2, '#7d9a52', 3 + i)); }
      for (let i = 0; i < 5; i++) { const x = r() * TW; wrapDraw(x, xx => { o.fillStyle = '#5e7a44'; o.beginPath(); o.ellipse(xx, top(((xx % TW) + TW) % TW) - 6, 3.5, 12, 0, 0, 7); o.fill(); }); }
    }), 330, 140, sc * 0.3);
    drawStrip(c, strip(g, 'parables_stop_bank', 410, 80, o => {
      const top = ridge(o, 466, 18, 17, 490, '#d9a066', '#b47a4a', '#ffd49a', 60); const r = P.rng(18);
      for (let i = 0; i < 10; i++) { const x = r() * TW, k = r(); wrapDraw(x, xx => k < 0.5 ? P.rock(o, xx, top(((xx % TW) + TW) % TW) + 14, 0.5 + k * 0.6, '#c49470') : shrub(o, xx, top(((xx % TW) + TW) % TW) + 12, 0.7 + k * 0.3, '#8f9a58')); }
    }), 410, 80, sc * 0.7);
    drawStrip(c, strip(g, 'parables_stop_road', 470, 170, o => {
      const rg = o.createLinearGradient(0, 474, 0, 610); rg.addColorStop(0, '#e9c48e'); rg.addColorStop(1, '#f3d6a2'); o.fillStyle = rg; o.fillRect(0, 474, TW, 136);
      o.fillStyle = 'rgba(150,90,50,0.25)'; o.fillRect(0, 474, TW, 3);
      for (const [yy, a] of [[515, 0.16], [570, 0.2]]) { o.strokeStyle = `rgba(150,96,60,${a})`; o.lineWidth = 5; o.beginPath(); for (let x = -2; x <= TW + 2; x += 4) { const y = yy + Math.sin(x / TW * 6.283 * 3) * 3; x < 0 ? o.moveTo(x, y) : o.lineTo(x, y); } o.stroke(); }
      const r = P.rng(21); for (let i = 0; i < 70; i++) { const x = r() * TW, y = 480 + r() * 125, rr = 1 + r() * 2.4, col = r() < 0.5 ? '#c99a6a' : '#fff0d0'; wrapDraw(x, xx => { o.fillStyle = col; o.beginPath(); o.ellipse(xx, y, rr * 1.4, rr, 0, 0, 7); o.fill(); }); }
      for (let i = 0; i < 26; i++) { const x = r() * TW, y = 478 + r() * 8, h = 6 + r() * 7; wrapDraw(x, xx => tuft(o, xx, y, h, '#9aa04a')); }
      const lg = o.createLinearGradient(0, 606, 0, 640); lg.addColorStop(0, '#c8925a'); lg.addColorStop(1, '#a8743e'); o.fillStyle = lg; o.beginPath(); o.moveTo(0, 640); for (let x = 0; x <= TW; x += 4) o.lineTo(x, 608 + Math.sin(x / TW * 6.283 * 7) * 2); o.lineTo(TW, 640); o.closePath(); o.fill();
      for (let i = 0; i < 30; i++) { const x = r() * TW, h = 8 + r() * 9; wrapDraw(x, xx => tuft(o, xx, 612 + r() * 4, h, '#8a9a3e')); }
    }), 470, 170, sc);
    // the priest and the Levite: noses in the air, hurrying past on the far side
    for (const w of s.walkers) if (w.x > -40 && w.x < W + 40) { c.save(); c.translate(w.x, FAR); c.rotate(0.06); P.person(c, 0, 0, 1.1, { ...w.o, expr: 'sleep', arms: 'hold', facing: -1, t: t * 1.4, phase: w.phase, bounce: 2 }); c.restore(); }
    // dust puffs from walking
    for (const p of s.puffs) { const q = (t - p.t) / 0.6; c.fillStyle = `rgba(250,230,200,${0.5 * (1 - q)})`; c.beginPath(); c.arc(p.x - q * 14, p.y - 4 - q * 6, 4 + q * 7, 0, 7); c.fill(); }
    // donkey, rope and the Samaritan
    const h = s.mode === 'help' ? t - s.modeT : 0, walking = !s.mode || (s.mode === 'missed' && s.vel > 20);
    const sit = s.mode === 'early' ? Math.min(1, (t - s.modeT) * 5) : 0;
    donkeyPack(c, DKX, LANE + 6, 1.95, t, sit, walking);
    c.strokeStyle = '#7a4a2a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(DKX + 44, LANE - 34); c.quadraticCurveTo(SAMX - 30, LANE - 4, SAMX - 19, LANE - 22); c.stroke();
    // the hurt traveler (drawn behind the Samaritan once he is lifted onto the donkey)
    const drawTrav = () => {
    let tx = s.tx0 - sc, ty = VY, ts = 1.3;
    const fly = s.mode === 'help' ? Math.max(0, Math.min(1, (h - 0.16) / 0.3)) : 0;
    if (fly > 0) { const e = fly * fly * (3 - 2 * fly); tx = tx + (DKX - 14 - tx) * e; ty = VY + (LANE - 30 - VY) * e - Math.sin(e * Math.PI) * 80; ts = 1.3 - 0.3 * e; }
    if (tx > -60 && tx < W + 60) {
      const near = !s.mode && tx < W - 15 && tx - SAMX <= 30 + s.win;
      if (near || (s.mode === 'help' && h < 0.3)) { const p = 0.5 + 0.5 * Math.sin(t * 9); c.save(); const gl = c.createRadialGradient(tx + 8, ty - 26, 4, tx + 8, ty - 26, 70); gl.addColorStop(0, `rgba(255,236,160,${0.45 + 0.2 * p})`); gl.addColorStop(1, 'rgba(255,236,160,0)'); c.fillStyle = gl; c.fillRect(tx - 70, ty - 100, 160, 140); c.strokeStyle = `rgba(255,250,220,${0.7 + 0.3 * p})`; c.lineWidth = 3; c.beginPath(); c.ellipse(tx + 12, ty - 30, 44 + p * 5, 48 + p * 5, 0, 0, 7); c.stroke(); c.restore(); }
      if (fly === 0) { P.rock(c, tx - 26, ty - 2, 0.75, '#c29470'); c.fillStyle = '#b08a5a'; c.beginPath(); c.ellipse(tx + 46, ty - 4, 9, 6, 0.3, 0, 7); c.fill(); c.strokeStyle = '#7a5a3a'; c.lineWidth = 1.2; c.stroke(); }
      const helped = s.mode === 'help';
      sitFig(c, tx, ty, ts, { ...TRAV, expr: helped ? (h > 0.2 ? 'laugh' : 'wow') : 'sad', arms: helped ? 'cheer' : 'hold', t, bounce: 0.6 }, { scrape: !helped || h < 0.1, bandage: helped ? Math.min(1, h * 8) : 0 });
      if (!helped && Math.sin(t * 2.5) > 0.2) { const q = (t * 2.5 % 6.283) / 6.283; c.fillStyle = 'rgba(160,220,255,0.85)'; c.beginPath(); c.ellipse(tx + 4 * ts, ty - 56 * ts + q * 10, 1.8, 2.6, 0, 0, 7); c.fill(); }
    }
    };
    const behind = s.mode === 'help' && t - s.modeT > 0.32;
    if (behind) drawTrav();
    const lookBack = s.mode === 'missed', samExpr = s.mode === 'help' ? (h > 0.15 ? 'laugh' : 'wow') : s.mode ? 'surprised' : 'happy';
    P.person(c, SAMX, LANE, 1.5, { ...SAM, expr: samExpr, arms: s.mode === 'help' ? 'reach' : s.mode === 'early' ? 'up' : 'down', facing: lookBack ? -1 : 1, t: walking ? t : 0, bounce: walking ? 2.2 : 0.6 });
    if (!behind) drawTrav();
    for (const hh of s.hearts) { const a = t - hh.t; if (a < 0 || a > 1) continue; c.globalAlpha = Math.min(1, (1 - a) * 2); heart(c, hh.x + hh.vx * a, hh.y + hh.vy * a + 60 * a * a, hh.r * (0.6 + Math.min(0.4, a * 3)), hh.col); c.globalAlpha = 1; }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
