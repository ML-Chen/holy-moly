// FORGIVE! — Joseph, now a great ruler in Egypt, tells his frightened brothers who he is, forgives them and hugs them all (Genesis 45).
// Drag Joseph across the palace hall into his crying brothers for a big group hug.
const FLOOR = 470;
function column(o, x, y0, y1, w) {
  const g = o.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#c8a070'); g.addColorStop(0.35, '#f6e2b8'); g.addColorStop(1, '#a87a50'); o.fillStyle = g; o.fillRect(x - w / 2, y0, w, y1 - y0);
  // painted bands
  for (const [yy, c] of [[y1 - 40, '#2f8f8a'], [y1 - 34, '#e9b949'], [y1 - 28, '#c9443c'], [y0 + 34, '#c9443c'], [y0 + 40, '#e9b949'], [y0 + 46, '#2f8f8a']]) { o.fillStyle = c; o.fillRect(x - w / 2, yy, w, 5); }
  o.strokeStyle = 'rgba(120,80,40,0.25)'; o.lineWidth = 1; for (let k = 1; k < 4; k++) { o.beginPath(); o.moveTo(x - w / 2 + k * w / 4, y0 + 52); o.lineTo(x - w / 2 + k * w / 4, y1 - 46); o.stroke(); }
  // papyrus-bundle capital
  o.fillStyle = '#5a9a6a'; o.beginPath(); o.moveTo(x - w / 2, y0 + 30); o.quadraticCurveTo(x - w * 0.95, y0 + 6, x - w * 0.8, y0); o.lineTo(x + w * 0.8, y0); o.quadraticCurveTo(x + w * 0.95, y0 + 6, x + w / 2, y0 + 30); o.closePath(); o.fill();
  o.fillStyle = '#e9b949'; o.fillRect(x - w * 0.85, y0 - 6, w * 1.7, 7);
  o.fillStyle = '#d8b888'; o.fillRect(x - w * 0.7, y1, w * 1.4, 8);
}
function paintHall(o) {
  // back wall glowing with afternoon light
  const wg = o.createLinearGradient(0, 0, 0, FLOOR); wg.addColorStop(0, '#7a4a3a'); wg.addColorStop(0.4, '#c88a5a'); wg.addColorStop(1, '#f2c890'); o.fillStyle = wg; o.fillRect(0, 0, W, FLOOR);
  // a big doorway to the Nile at sunset in the middle
  o.save(); o.beginPath(); o.rect(120, 150, 120, 270); o.clip();
  P.sky(o, W, 420, ['#ffb070', '#ffd090', '#fff0c0'], { x: 180, y: 330, r: 18, color: '#ffe0a0', glow: 120 });
  P.hills(o, W, 360, 6, '#e8a060', '#c07a48', { seed: 81, dabs: 0, bottom: 420 });
  // pyramids on the horizon
  for (const [px, ph] of [[150, 40], [200, 30]]) { o.fillStyle = '#d89a60'; o.beginPath(); o.moveTo(px - ph, 362); o.lineTo(px, 362 - ph); o.lineTo(px + ph, 362); o.fill(); o.fillStyle = '#b8784a'; o.beginPath(); o.moveTo(px, 362 - ph); o.lineTo(px + ph, 362); o.lineTo(px + ph * 0.3, 362); o.fill(); }
  P.water(o, W, 372, 420, '#3a7a9a', '#9ad0d8', 0, { waves: 3 });
  P.palm(o, 140, 400, 0.6, 0.2, 0, '#4a8a4a'); P.palm(o, 228, 404, 0.5, -0.2, 0, '#4a8a4a');
  o.restore();
  o.strokeStyle = '#8a5a30'; o.lineWidth = 6; o.strokeRect(117, 147, 126, 276);
  o.fillStyle = '#e9b949'; o.fillRect(108, 136, 144, 12); o.fillStyle = '#2f8f8a'; o.fillRect(108, 130, 144, 6);
  // a winged sun disc above the door
  o.fillStyle = '#e9b949'; o.beginPath(); o.arc(180, 112, 10, 0, 7); o.fill(); o.fillStyle = '#2f8f8a'; for (const d of [-1, 1]) { o.beginPath(); o.moveTo(180 + d * 10, 110); o.quadraticCurveTo(180 + d * 40, 98, 180 + d * 62, 108); o.quadraticCurveTo(180 + d * 40, 112, 180 + d * 10, 118); o.fill(); }
  // ceiling beams and painted glyph bands on the upper wall
  o.fillStyle = '#4a2a24'; o.fillRect(0, 0, W, 14); for (let x = 10; x < W; x += 40) { o.fillStyle = '#5a3428'; o.fillRect(x, 0, 18, 22); o.fillStyle = '#e9b949'; o.fillRect(x, 20, 18, 3); }
  const r = P.rng(99), glyph = (x, y, k, col) => { o.fillStyle = col; o.strokeStyle = col; o.lineWidth = 1.6; o.beginPath();
    if (k === 0) { o.ellipse(x, y, 5, 3, 0, 0, 7); o.fill(); o.fillStyle = '#f6e6c8'; o.beginPath(); o.arc(x, y, 1.4, 0, 7); o.fill(); }
    else if (k === 1) { o.moveTo(x - 5, y + 4); o.quadraticCurveTo(x, y - 6, x + 5, y + 4); o.stroke(); o.beginPath(); o.arc(x + 4, y - 3, 1.8, 0, 7); o.fill(); }
    else if (k === 2) { for (let i = 0; i < 3; i++) { o.moveTo(x - 5, y - 3 + i * 3); for (let xx = -5; xx <= 5; xx += 2.5) o.lineTo(x + xx, y - 3 + i * 3 + (xx % 5 ? -1 : 1)); } o.stroke(); }
    else if (k === 3) { o.moveTo(x, y - 6); o.lineTo(x, y + 6); o.moveTo(x - 4, y - 2); o.lineTo(x + 4, y - 2); o.stroke(); o.beginPath(); o.arc(x, y - 6, 2.4, 0, 7); o.stroke(); }
    else { o.moveTo(x - 4, y + 5); o.lineTo(x, y - 5); o.lineTo(x + 4, y + 5); o.closePath(); o.fill(); } };
  for (const [y0, yy] of [[30, 44]]) { o.fillStyle = 'rgba(250,226,180,0.18)'; o.fillRect(0, y0, W, 28); for (let x = 12; x < W; x += 16) glyph(x, yy, Math.floor(r() * 5), ['#2f6f8a', '#8a3a2a', '#3a6a3a', '#5a3a6a'][Math.floor(r() * 4)]); }
  // wall frieze of lotus flowers
  o.fillStyle = '#2f6f8a'; o.fillRect(0, 62, W, 18); for (let x = 6; x < W; x += 18) { o.fillStyle = '#f2e6cf'; o.beginPath(); o.moveTo(x, 78); o.quadraticCurveTo(x - 6, 66, x, 64); o.quadraticCurveTo(x + 6, 66, x, 78); o.fill(); o.fillStyle = '#e07a8a'; o.beginPath(); o.arc(x + 9, 72, 2.4, 0, 7); o.fill(); }
  // shafts of light from the door
  o.save(); o.globalCompositeOperation = 'screen'; for (let i = 0; i < 4; i++) { const g = o.createLinearGradient(180, 300, 180 + (i - 1.5) * 60, 600); g.addColorStop(0, 'rgba(255,220,150,0.3)'); g.addColorStop(1, 'rgba(255,220,150,0)'); o.fillStyle = g; o.beginPath(); o.moveTo(130 + i * 25, 420); o.lineTo(150 + i * 25, 420); o.lineTo(170 + (i - 1.5) * 90, 640); o.lineTo(130 + (i - 1.5) * 90, 640); o.closePath(); o.fill(); } o.restore();
  // polished floor with reflections
  const fg = o.createLinearGradient(0, FLOOR - 50, 0, H); fg.addColorStop(0, '#e8c898'); fg.addColorStop(1, '#a87a58'); o.fillStyle = fg; o.fillRect(0, FLOOR - 50, W, H);
  o.strokeStyle = 'rgba(120,70,40,0.25)'; o.lineWidth = 1; for (let k = 0; k < 8; k++) { const y = FLOOR - 50 + k * k * 3.6; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); } for (let k = -6; k <= 6; k++) { o.beginPath(); o.moveTo(180 + k * 30, FLOOR - 50); o.lineTo(180 + k * 110, H); o.stroke(); }
  const rf = o.createRadialGradient(180, 480, 10, 180, 500, 180); rf.addColorStop(0, 'rgba(255,236,190,0.45)'); rf.addColorStop(1, 'rgba(255,236,190,0)'); o.fillStyle = rf; o.fillRect(0, FLOOR - 50, W, H);
  // a long red runner rug
  o.fillStyle = '#b8443a'; o.beginPath(); o.moveTo(150, FLOOR - 50); o.lineTo(210, FLOOR - 50); o.lineTo(260, H); o.lineTo(100, H); o.closePath(); o.fill();
  o.strokeStyle = '#e9b949'; o.lineWidth = 3; o.beginPath(); o.moveTo(156, FLOOR - 50); o.lineTo(110, H); o.moveTo(204, FLOOR - 50); o.lineTo(250, H); o.stroke();
  column(o, 40, 80, FLOOR - 40, 44); column(o, 320, 80, FLOOR - 40, 44);
  // potted palms and lamps at the sides
  for (const x of [88, 272]) { o.fillStyle = '#c8783a'; o.beginPath(); o.moveTo(x - 12, FLOOR - 70); o.lineTo(x + 12, FLOOR - 70); o.lineTo(x + 8, FLOOR - 46); o.lineTo(x - 8, FLOOR - 46); o.fill(); P.palm(o, x, FLOOR - 70, 0.38, 0, 0, '#4a8a4a'); }
}
// one brother: crying and ashamed until the hug, then laughing; he leans in to hug when hugged
function brother(c, b, t, hug, joy, sway) {
  const q = hug, x = b.x + sway + (b.hx - b.x - sway) * q, y = b.y + (b.hy - b.y) * q;
  c.save(); c.translate(x, y); c.rotate(joy ? b.lean * q : 0);
  P.person(c, 0, 0, b.s, { skin: b.skin, robe: b.robe, stripe: b.stripe, hair: b.hair, hairStyle: b.hs, beard: b.beard, head: b.head, headCol: b.hc, expr: joy ? 'laugh' : 'sad', arms: joy ? (b.out ? 'out' : 'reach') : (b.i % 2 ? 'pray' : 'down'), facing: joy ? b.hf : b.f, t, phase: b.i, bounce: joy ? 1.6 : 0.6 });
  c.restore();
  if (!joy && x) { // tears
    const hy = y - (40 + 15) * b.s - 1 * b.s, hr = 16 * b.s;
    for (const sd of [-1, 1]) { const ex = x + sd * hr * 0.37 * b.f + hr * 0.08 * b.f, k = (t * 1.6 + b.i * 0.3 + (sd > 0 ? 0.5 : 0)) % 1; c.fillStyle = `rgba(150,210,255,${0.9 * (1 - k)})`; c.beginPath(); const ty = hy + hr * 0.4 + k * 26; c.moveTo(ex, ty - 4); c.quadraticCurveTo(ex + 3, ty + 1, ex, ty + 3); c.quadraticCurveTo(ex - 3, ty + 1, ex, ty - 4); c.fill(); }
  }
}
function joseph(c, x, y, s, t, o) {
  P.person(c, x, y, s, { skin: P.SKIN[2], robe: P.CLOTH.white, stripe: P.CLOTH.gold, sash: P.CLOTH.royal, hair: P.HAIR[0], hairStyle: 'short', expr: o.expr, arms: o.arms, facing: o.f, t, bounce: o.bounce ?? 1.2, hold: null });
  // vizier finery: a broad jewelled collar and a gold chain (Genesis 41:42)
  const by = y - 40 * s, hr = 16 * s;
  c.save(); c.translate(x, by + 2 * s); c.scale(s * o.f, s);
  for (const [r, col] of [[15, '#2f8f8a'], [12, '#e9b949'], [9, '#c9443c'], [6.5, '#e9b949']]) { c.fillStyle = col; c.beginPath(); c.ellipse(0, -2, r, r * 0.55, 0, 0, Math.PI); c.fill(); }
  c.fillStyle = '#ffe9a0'; for (let i = 0; i < 7; i++) { const a = 0.15 * Math.PI + i * 0.7 * Math.PI / 6; c.beginPath(); c.arc(Math.cos(a) * 13.5, -2 + Math.sin(a) * 7.4, 1.3, 0, 7); c.fill(); }
  c.restore();
  // a striped linen headdress over his short hair
  c.save(); c.translate(x, y); c.scale(s * o.f, s); const hy = -40 - 15, R = 16;
  c.fillStyle = '#f6efe0'; c.strokeStyle = '#a8946a'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-R - 2, hy + 2); c.quadraticCurveTo(-R * 1.1, hy - R * 1.2, 0, hy - R * 1.12); c.quadraticCurveTo(R * 1.1, hy - R * 1.2, R + 2, hy + 2); c.lineTo(R + 6, hy + 24); c.lineTo(R - 1, hy + 24); c.lineTo(R - 2, hy - R * 0.35); c.quadraticCurveTo(0, hy - R * 0.62, -R + 2, hy - R * 0.35); c.lineTo(-R + 1, hy + 24); c.lineTo(-R - 6, hy + 24); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = '#3f6faf'; c.lineWidth = 1.6; for (const yy of [hy + 6, hy + 12, hy + 18]) { c.beginPath(); c.moveTo(-R - 3.5, yy); c.lineTo(-R + 1, yy); c.moveTo(R - 1, yy); c.lineTo(R + 4.5, yy); c.stroke(); }
  c.fillStyle = '#e9b949'; c.fillRect(-R + 1, hy - R * 0.5, 2 * R - 2, 3.2);
  c.restore();
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
MG.add({
  id: 'forgive', stage: 'family', cmd: 'FORGIVE!', hint: 'drag', time: 5, mood: 'bright', winText: 'Family!',
  card: { title: 'Joseph forgives', ref: 'Genesis 37–45', kind: 'Story', text: 'Joseph\'s older brothers were jealous of him and sold him as a slave, but years later he became a great ruler in Egypt. When his hungry brothers came for food, Joseph told them who he was, forgave them, and hugged them as he cried for joy.', ask: 'Is there someone in your family you need to forgive, or to say sorry to?' },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    const skins = [P.SKIN[1], P.SKIN[3], P.SKIN[2], P.SKIN[0], P.SKIN[3]], robes = [[P.CLOTH.rust, P.CLOTH.cream], [P.CLOTH.olive, P.CLOTH.sand], [P.CLOTH.indigo, P.CLOTH.saffron], [P.CLOTH.teal, P.CLOTH.cream], [P.CLOTH.brown, P.CLOTH.terracotta]];
    const hairs = [[P.HAIR[1], 'short', true, 'none'], [P.HAIR[0], 'curly', true, 'none'], [P.HAIR[2], 'short', '#4a3020', 'wrap'], [P.HAIR[3], 'curly', true, 'none'], [P.HAIR[0], 'short', false, 'wrap']];
    // brothers huddle on the right; Benjamin (the youngest, no beard) at the front
    const spots = [[262, 560], [312, 548], [292, 600], [236, 606], [334, 604]];
    s.bros = Array.from({ length: n }, (_, i) => ({ i, x: spots[i][0], y: spots[i][1], s: 1.35, skin: skins[i], robe: robes[i][0], stripe: robes[i][1], hair: hairs[i][0], hs: hairs[i][1], beard: i === n - 1 ? false : hairs[i][2], head: hairs[i][3], hc: P.CLOTH.cream, f: -1, cheer: i % 2 === 0 }));
    s.bros.sort((a, b) => a.y - b.y);
    const cx = s.bros.reduce((a, b) => a + b.x, 0) / n, cy = s.bros.reduce((a, b) => a + b.y, 0) / n;
    s.target = { x: cx, y: cy }; s.hug = { x: 196, y: 580 };
    // where each brother ends up in the hug: in a ring around Joseph, leaning in toward him
    const ring = [[-50, -22], [52, -20], [-80, 12], [84, 14], [2, -40]];
    const order = s.bros.map(b => b.i).sort((a, b) => (b === n - 1) - (a === n - 1) || a - b);
    s.bros.forEach(b => { const [dx, dy] = ring[order.indexOf(b.i)]; b.hx = s.hug.x + dx; b.hy = s.hug.y + dy; b.hf = dx < 0 ? 1 : -1; b.lean = dx < 0 ? 0.12 : -0.12; b.out = Math.abs(dx) > 70 || dx === 2; });
    s.swayA = [0, 16, 30][g.level];
    s.j = { x: 64, y: 592, hx: 64, hy: 592 }; s.drag = false; s.hugT = -1; s.reach = [86, 74, 64][g.level]; s.bot = 0;
    // Egyptian palace servants watching from the sides
    s.servants = [{ x: 76, y: 456, skin: P.SKIN[4], robe: P.CLOTH.white, stripe: P.CLOTH.teal }, { x: 296, y: 452, skin: P.SKIN[5], robe: P.CLOTH.white, stripe: P.CLOTH.gold }];
  },
  down(g, x, y) { const s = g.s, j = s.j; if (s.hugT < 0 && Math.hypot(x - j.x, y - (j.y - 50)) < 70) { s.drag = true; s.ox = j.x - x; s.oy = j.y - y; g.sfx('whoosh'); } },
  move(g, x, y) { const s = g.s; if (!s.drag) return; s.j.x = Math.max(30, Math.min(330, x + s.ox)); s.j.y = Math.max(500, Math.min(612, y + s.oy)); checkHug(g); },
  up(g) { const s = g.s; if (!s.drag) return; s.drag = false; checkHug(g); if (s.hugT < 0) g.sfx('swoosh'); },
  update(g, dt) { const s = g.s, j = s.j; s.sway = s.hugT < 0 ? Math.sin(g.t * 2.2) * s.swayA : s.sway; if (!s.drag && s.hugT < 0) { j.x += (j.hx - j.x) * Math.min(1, dt * 6); j.y += (j.hy - j.y) * Math.min(1, dt * 6); } if (s.drag) { j.hx = j.x; j.hy = j.y; } },
  auto(g, dt, synth) {
    const s = g.s, j = s.j; if (g.t < 0.45 || s.hugT >= 0) return;
    if (!s.drag) { synth('down', j.x, j.y - 50); s.bx = j.x; s.by = j.y - 50; return; }
    const tx = s.target.x + s.sway - 40, ty = s.target.y - 50, sp = 330 * dt, d = Math.hypot(tx - s.bx, ty - s.by);
    if (d < sp) { synth('move', tx, ty); synth('up', tx, ty); } else { s.bx += (tx - s.bx) / d * sp; s.by += (ty - s.by) / d * sp; synth('move', s.bx, s.by); }
  },
  draw(g, c) {
    const s = g.s, t = g.t, j = s.j, hugged = s.hugT >= 0, hq = hugged ? Math.min(1, (t - s.hugT) / 0.35) : 0;
    c.drawImage(g.bake('family_forgive_bg', paintHall), 0, 0, W, H);
    for (const lx of [88, 272]) { const fl = 0.85 + 0.15 * Math.sin(t * 13 + lx); c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(lx, 120); c.lineTo(lx, 236); c.stroke();
      c.save(); c.globalCompositeOperation = 'screen'; const lg = c.createRadialGradient(lx, 244, 2, lx, 244, 60 * fl); lg.addColorStop(0, 'rgba(255,214,140,0.7)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = lg; c.fillRect(lx - 70, 180, 140, 130); c.restore();
      c.fillStyle = '#c8902a'; c.beginPath(); c.moveTo(lx - 12, 238); c.quadraticCurveTo(lx, 256, lx + 12, 238); c.closePath(); c.fill(); c.fillStyle = '#e9b949'; c.fillRect(lx - 13, 235, 26, 4);
      c.fillStyle = '#ffd27a'; c.beginPath(); c.ellipse(lx, 230 - fl * 2, 3, 6 * fl, 0, 0, 7); c.fill(); c.fillStyle = '#fff4c8'; c.beginPath(); c.ellipse(lx, 232, 1.5, 3, 0, 0, 7); c.fill(); }
    // dust motes drifting in the light shafts
    c.save(); c.globalCompositeOperation = 'screen'; for (let i = 0; i < 16; i++) { const q = (t * 0.05 + i / 16) % 1; c.fillStyle = `rgba(255,236,190,${0.5 * Math.sin(q * Math.PI)})`; c.beginPath(); c.arc(120 + ((i * 47) % 120) + Math.sin(t + i) * 8, 440 - q * 300, 1.4, 0, 7); c.fill(); } c.restore();
    // servants smile when the family hugs
    for (const sv of s.servants) P.person(c, sv.x, sv.y, 0.85, { skin: sv.skin, robe: sv.robe, stripe: sv.stripe, hairStyle: 'short', hair: P.HAIR[3], expr: hugged ? 'laugh' : 'surprised', arms: hugged ? 'cheer' : 'down', facing: sv.x < 180 ? 1 : -1, t, phase: sv.x });
    // a glowing path hint from Joseph to his brothers before the hug
    if (!hugged) { const p = (t * 1.4) % 1; c.save(); for (let i = 0; i < 6; i++) { const k = (i / 6 + p / 6), x = j.x + (s.target.x + (s.sway || 0) - 30 - j.x) * k, y = j.y - 12 + (s.target.y - j.y) * k; c.fillStyle = `rgba(255,236,160,${0.55 * Math.sin(k * Math.PI)})`; heart(c, x, y - 4, 5); } c.restore();
      const tx0 = s.target.x + (s.sway || 0), tg = c.createRadialGradient(tx0, s.target.y - 40, 10, tx0, s.target.y - 40, 110); tg.addColorStop(0, `rgba(255,220,170,${0.22 + 0.12 * Math.sin(t * 5)})`); tg.addColorStop(1, 'rgba(255,220,170,0)'); c.fillStyle = tg; c.fillRect(tx0 - 120, s.target.y - 160, 240, 240); }
    // warm glow behind the group hug
    if (hugged) { c.save(); c.globalCompositeOperation = 'screen'; const hg = c.createRadialGradient(s.hug.x, s.hug.y - 50, 10, s.hug.x, s.hug.y - 50, 190 * hq); hg.addColorStop(0, 'rgba(255,214,150,0.65)'); hg.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = hg; c.fillRect(0, 200, W, 440); c.restore(); }
    // draw everyone back to front
    const sw = s.sway || 0, items = s.bros.map(b => ({ y: b.y + (b.hy - b.y) * hq, d: () => brother(c, b, t, hq, hugged, sw) }));
    const lift = s.drag ? 8 : 0;
    items.push({ y: j.y, d: () => { if (s.drag) { c.fillStyle = 'rgba(60,30,30,0.18)'; c.beginPath(); c.ellipse(j.x, j.y, 22, 5, 0, 0, 7); c.fill(); }
      const jx = hugged ? j.x + (s.hug.x - j.x) * hq : j.x, jy = hugged ? j.y + (s.hug.y - j.y) * hq : j.y;
      joseph(c, jx, jy - lift, 1.45, t, { expr: hugged ? 'laugh' : 'happy', arms: hugged ? 'out' : s.drag ? 'reach' : 'wave', f: 1, bounce: hugged ? 2 : 1.2 }); } });
    items.sort((a, b) => a.y - b.y).forEach(it => it.d());
    if (!hugged && !s.drag) { const p = 0.5 + 0.5 * Math.sin(t * 6); c.save(); c.globalAlpha = 0.6 + 0.4 * p; c.fillStyle = '#fff6c8'; drawStar(c, j.x + 30, j.y - 96, 5 + p * 3, t); c.restore(); }
    // happy tears turn to hearts and sparkles
    if (hugged) {
      for (let i = 0; i < 9; i++) { const k = (t - s.hugT) * 0.9 + i / 9, q = k % 1; c.save(); c.globalAlpha = Math.sin(q * Math.PI); c.fillStyle = ['#ff7a9a', '#ffb0c0', '#ffd45a'][i % 3]; heart(c, s.hug.x + Math.sin(i * 2.1 + t * 2) * 80, s.hug.y - 120 - q * 90, 6 + (i % 3) * 2); c.restore(); }
      c.save(); c.globalAlpha = 0.5 * hq; c.strokeStyle = '#ffe9a0'; c.lineWidth = 3; c.beginPath(); c.arc(s.hug.x, s.hug.y - 40, 120 + Math.sin(t * 4) * 4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.restore();
    }
    P.vignette(c, W, H, 0.28, '#3a1a20'); P.grain(c, W, H, 0.05);
  },
});
function checkHug(g) {
  const s = g.s, j = s.j; if (s.hugT >= 0) return;
  if (Math.hypot(j.x - (s.target.x + (s.sway || 0) - 40), j.y - s.target.y) < s.reach) {
    s.hugT = g.t; s.drag = false; g.sfx('cheer'); g.sfx('laugh'); g.burst(s.hug.x, s.hug.y - 80, ['#ff8aa8', '#ffd45a', '#fff', '#9fe0ff'], 26, 220); g.win();
  }
}
