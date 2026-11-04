// PAIR! — one animal waits on the ark's ramp; tap its partner in the meadow so the two can go aboard together (Genesis 6:19–20, 7:8–9).
const KINDS = ['sheep', 'elephant', 'giraffe', 'cat', 'goat', 'camel', 'donkey', 'lion'];
const LOOKALIKE = { sheep: 'goat', goat: 'sheep', camel: 'donkey', donkey: 'camel' };
const HIT_Y = { giraffe: 36, elephant: 28, camel: 28, lion: 22, donkey: 22, sheep: 18, goat: 18, cat: 14 };
const DOOR = { x: 205, y: 246 }, WAIT = { x: 214, y: 352 }, JOIN = { x: 180, y: 364 };
const SLOTS = [[64, 478], [180, 500], [292, 482], [110, 572], [252, 570]];
// draw an animal facing either way (drawAnimal always faces right)
function beast(c, kind, x, y, s, t, phase, facing = 1, hop = false) { c.save(); c.translate(x, y); if (facing < 0) c.scale(-1, 1); drawAnimal(c, kind, 0, 0, s, t, phase, hop); c.restore(); }
function heart(c, x, y, r, col = '#ff7a9a') {
  c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.5, -r * 0.1, -r * 0.75, -r * 1.2, 0, -r * 0.42); c.bezierCurveTo(r * 0.75, -r * 1.2, r * 1.5, -r * 0.1, 0, r * 0.9); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(-r * 0.45, -r * 0.35, r * 0.22, r * 0.14, -0.6, 0, 7); c.fill(); c.restore();
}
function butterfly(c, x, y, t, col) {
  const f = Math.abs(Math.sin(t * 18)); c.save(); c.translate(x, y); c.fillStyle = col;
  for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * 4 * (0.3 + f * 0.7), -2, 4.5 * (0.3 + f * 0.7), 3.6, sx * 0.5, 0, 7); c.fill(); c.beginPath(); c.ellipse(sx * 3 * (0.3 + f * 0.7), 2.5, 3 * (0.3 + f * 0.7), 2.4, -sx * 0.4, 0, 7); c.fill(); }
  c.fillStyle = '#3a2430'; c.fillRect(-0.7, -3.5, 1.4, 7); c.restore();
}
MG.add({
  id: 'pair', stage: 'ark', cmd: 'PAIR!', hint: 'tap', time: 5, mood: 'bright', winText: 'Together!',
  card: { title: 'Two of every kind', ref: 'Genesis 6:19–20; 7:8–9', kind: 'Ancient story', text: 'In the story of Noah, God told Noah to bring two of every kind of animal into the ark, a male and a female, to keep them alive through the flood. The animals came to Noah two by two.', ask: 'Who is a friend or family member you like to do things with? How do you look after each other?' },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    const want = KINDS[Math.floor(Math.random() * KINDS.length)];
    const others = KINDS.filter(k => k !== want && !(g.level === 0 && LOOKALIKE[want] === k)).sort(() => Math.random() - 0.5).slice(0, n - 1);
    const kinds = [want, ...others].sort(() => Math.random() - 0.5), slots = SLOTS.slice(0, n).sort(() => Math.random() - 0.5);
    const spd = [0, 16, 30][g.level] * g.speed;
    s.want = want; s.lock = 0; s.won = 0; s.called = false; s.hearts = [];
    s.animals = kinds.map((k, i) => ({ kind: k, x: slots[i][0], y: slots[i][1], hx: slots[i][0], phase: Math.random() * 6, vx: spd * (Math.random() < 0.5 ? -1 : 1), face: slots[i][0] < 180 ? 1 : -1, shrug: -9, turn: 1 + Math.random() * 2 }));
    s.flies = [0, 1, 2].map(i => ({ x: 40 + Math.random() * 280, y: 400 + Math.random() * 150, p: Math.random() * 6, col: ['#ffd45a', '#ff9ac0', '#fff6ea'][i] }));
  },
  down(g, x, y) {
    const s = g.s; if (s.won || g.t < s.lock) return;
    let best = null, bd = 50; for (const a of s.animals) { const d = Math.hypot(a.x - x, a.y - HIT_Y[a.kind] * 1.3 - y); if (d < bd) { bd = d; best = a; } }
    if (!best) return;
    if (best.kind === s.want) {
      s.won = g.t; s.partner = best; best.fx = best.x; best.fy = best.y; g.sfx(ANIMAL_SOUND[best.kind] || 'pop'); g.sfx('sparkle');
      g.burst(best.x, best.y - 30, ['#ff7a9a', '#ffd45a', '#fff'], 16, 170); for (let i = 0; i < 7; i++) s.hearts.push({ x: WAIT.x - 20 + Math.random() * 40, y: WAIT.y - 40, t: g.t + i * 0.05, dx: (Math.random() - 0.5) * 50 });
      g.win();
    } else { best.shrug = g.t; s.lock = g.t + 0.45; g.sfx('boing'); }
  },
  update(g, dt) {
    const s = g.s;
    if (!s.called && g.t > 0.35) { s.called = true; g.sfx(ANIMAL_SOUND[s.want] || 'pop'); }
    for (const a of s.animals) {
      if (a === s.partner) continue;
      if (a.vx) { if (g.t - a.shrug > 0.5) a.x += a.vx * dt; a.turn -= dt; if (a.x < 40 || a.x > 320 || a.turn < 0) { a.vx = a.x < 40 ? Math.abs(a.vx) : a.x > 320 ? -Math.abs(a.vx) : -a.vx; a.turn = 1.2 + Math.random() * 1.8; } a.face = a.vx > 0 ? 1 : -1; }
      else a.x = a.hx + Math.sin(g.t * 1.4 + a.phase) * 5;
    }
  },
  auto(g, dt, synth) { const s = g.s; if (g.t > 1.0 && !s.won && !s.botDone) { s.botDone = 1; const a = s.animals.find(b => b.kind === s.want); synth('down', a.x, a.y - HIT_Y[a.kind] * 1.3); synth('up', a.x, a.y - 20); } },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('ark_pair_bg', o => {
      P.sky(o, W, H, ['#4f5d9c', '#9d8fbf', '#f2b99a', '#ffe0a8'], { x: 62, y: 196, r: 24, color: '#ffd59a', glow: 300 });
      P.cloud(o, 72, 92, 0.7, '#fff3e6', '#e2b6c4', 0.85); P.cloud(o, 150, 150, 0.45, '#fff3e6', '#e2b6c4', 0.7);
      P.hills(o, W, 318, 40, '#9c8ab8', '#7a7aa8', { seed: 13, freq: 0.01, dabs: 30 });
      P.hills(o, W, 336, 22, '#86a46a', '#6a8a52', { seed: 4, freq: 0.016, dabs: 40, rim: '#f7dca0' });
      // long evening shadow of the ark across the grass (sun on the left)
      o.fillStyle = 'rgba(40,40,70,0.22)'; o.beginPath(); o.ellipse(250, 348, 170, 16, 0, 0, 7); o.fill();
      ARK.draw(o, 196, 300, 1.3);
      // warm rim light on the sunward side of the hull and cabin
      o.save(); o.globalCompositeOperation = 'screen'; const rl = o.createRadialGradient(62, 196, 10, 62, 196, 190); rl.addColorStop(0, 'rgba(255,200,130,0.4)'); rl.addColorStop(1, 'rgba(255,200,130,0)'); o.fillStyle = rl; o.fillRect(0, 0, W, 400); o.restore();
      // the lit doorway (the door folds down to make the ramp)
      const dg = o.createLinearGradient(0, 206, 0, 250); dg.addColorStop(0, '#ffc86a'); dg.addColorStop(1, '#ffe7a8'); o.fillStyle = dg; o.fillRect(184, 207, 42, 44);
      o.fillStyle = '#d8a050'; for (let i = 0; i < 6; i++) { o.beginPath(); o.ellipse(190 + i * 6, 249, 6, 3, 0.3 * (i - 3), 0, 7); o.fill(); }
      o.strokeStyle = '#3e2412'; o.lineWidth = 3; o.strokeRect(184, 207, 42, 44);
      P.hills(o, W, 352, 10, '#9cc25a', '#5d8a3c', { seed: 9, dabs: 140, rim: '#e8f0a0' });
      // ramp = the folded-down door
      const rg = o.createLinearGradient(0, 250, 0, 430); rg.addColorStop(0, '#a87444'); rg.addColorStop(1, '#7a4c28'); o.fillStyle = rg; o.strokeStyle = '#3e2412'; o.lineWidth = 2.5;
      o.beginPath(); o.moveTo(184, 251); o.lineTo(226, 251); o.lineTo(250, 430); o.lineTo(150, 430); o.closePath(); o.fill(); o.stroke();
      o.strokeStyle = 'rgba(50,25,10,0.45)'; o.lineWidth = 1.6; for (let i = 1; i < 9; i++) { const k = i / 9; o.beginPath(); o.moveTo(184 - 34 * k, 251 + 179 * k); o.lineTo(226 + 24 * k, 251 + 179 * k); o.stroke(); }
      o.fillStyle = 'rgba(255,230,160,0.22)'; o.beginPath(); o.moveTo(184, 251); o.lineTo(196, 251); o.lineTo(170, 430); o.lineTo(150, 430); o.fill();
      o.fillStyle = 'rgba(40,40,70,0.25)'; o.beginPath(); o.ellipse(200, 433, 56, 7, 0, 0, 7); o.fill();
      P.grassTufts(o, W, 360, 640, 90, '#7aa84a', 3); P.flowers(o, W, 380, 640, 30, undefined, 6);
      P.flowers(o, W, 360, 400, 10, ['#fff6ea', '#f4d35e'], 17);
    }), 0, 0, W, H);
    // sunbeams and drifting clouds; rain clouds gather far off to the right
    P.rays(c, 62, 196, W, H * 0.6, '#ffe2b0', 0.09, 8, t);
    for (let i = 0; i < 7; i++) { const cx = 250 + i * 26 + Math.sin(t * 0.4 + i) * 5 - t * 3, cy = 34 + (i % 3) * 18, r = 30 + (i % 2) * 10; const gg = c.createRadialGradient(cx - 6, cy - 12, 3, cx, cy, r); gg.addColorStop(0, 'rgba(120,118,160,0.95)'); gg.addColorStop(1, 'rgba(70,66,110,0.9)'); c.fillStyle = gg; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); }
    P.cloud(c, 120 + Math.sin(t * 0.3) * 6 + t * 2, 70, 0.5, '#fff6ec', '#e6bccb', 0.8);
    c.save(); c.globalAlpha = 0.35; P.rain(c, 140, 120, t, 12, 'rgba(200,210,255,0.6)'); c.restore();
    // doves already paired up on the roof
    P.dove(c, 172, 136 + Math.sin(t * 3) * 0.6, 0.62, { t, flying: false }); P.dove(c, 236, 135, 0.62, { t: t + 1, flying: false, facing: -1 });
    // the warm doorway glows and the light spills down the ramp
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    c.save(); c.globalCompositeOperation = 'screen'; const gl = c.createRadialGradient(DOOR.x, DOOR.y - 14, 4, DOOR.x, DOOR.y - 14, 90); gl.addColorStop(0, `rgba(255,214,140,${0.45 + 0.2 * pulse})`); gl.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = gl; c.fillRect(DOOR.x - 90, DOOR.y - 104, 180, 180); c.restore();
    // the waiting animal on the ramp
    const won = s.won ? t - s.won : -1, up = won > 0.3 ? Math.min(1, (won - 0.3) / 0.45) : 0;
    const wx = WAIT.x + (DOOR.x - WAIT.x) * up, wy = WAIT.y + (DOOR.y + 4 - WAIT.y) * up, ws = 1.15 * (1 - up * 0.45);
    if (!s.won) { c.save(); const sp = c.createRadialGradient(wx, wy - 16, 4, wx, wy - 16, 54); sp.addColorStop(0, `rgba(255,240,190,${0.4 + 0.2 * pulse})`); sp.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = sp; c.beginPath(); c.arc(wx, wy - 16, 54, 0, 7); c.fill(); c.restore(); }
    c.save(); if (up > 0.6) c.globalAlpha = 1 - (up - 0.6) / 0.4;
    beast(c, s.want, wx, wy, ws * 1.3, t, 0, s.won && up === 0 ? 1 : (up > 0 ? 1 : -1), !!s.won);
    c.restore();
    // a thought bubble with a heart: "where's my partner?"
    if (!s.won) { const by = WAIT.y - 64 - HIT_Y[s.want] * 0.9 + Math.sin(t * 3) * 3, bx = WAIT.x - 26; c.fillStyle = 'rgba(255,252,244,0.95)'; c.strokeStyle = 'rgba(120,80,90,0.5)'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(bx + 18, by + 26, 3, 0, 7); c.fill(); c.beginPath(); c.arc(bx + 10, by + 17, 5, 0, 7); c.fill(); c.beginPath(); c.ellipse(bx, by, 17, 14, 0, 0, 7); c.fill(); c.stroke(); heart(c, bx, by + 1, 7 + pulse * 1.5); }
    // Noah at the foot of the ramp
    P.person(c, 312, 418, 1.0, { skin: P.SKIN[2], robe: P.CLOTH.olive, stripe: P.CLOTH.cream, beard: '#e8e2da', hair: P.HAIR[5], head: 'wrap', expr: g.result === 'win' ? 'laugh' : 'happy', arms: g.result === 'win' ? 'cheer' : 'wave', t, facing: -1 });
    // meadow animals
    const list = s.animals.slice().sort((a, b) => a.y - b.y);
    for (const a of list) {
      if (a === s.partner) {
        // hop up beside the waiting one, then go aboard together
        const k = Math.min(1, won / 0.3), hx = a.fx + (JOIN.x - a.fx) * k, hy = a.fy + (JOIN.y - a.fy) * k - Math.sin(k * Math.PI) * 60;
        const px = hx + (DOOR.x - 12 - hx) * up, py = hy + (DOOR.y + 4 - hy) * up; c.save(); if (up > 0.6) c.globalAlpha = 1 - (up - 0.6) / 0.4;
        beast(c, a.kind, px, py, (1.6 - k * 0.1) * (1 - up * 0.45), t, a.phase, 1, true); c.restore(); continue;
      }
      const sh = t - a.shrug; let sy = 1, rot = 0;
      if (sh < 0.5) { const q = sh / 0.5; sy = 1 + Math.sin(q * Math.PI * 2) * 0.12 * (1 - q); rot = Math.sin(q * Math.PI * 4) * 0.12 * (1 - q); }
      c.save(); c.translate(a.x, a.y); c.rotate(rot); c.scale(1, sy); beast(c, a.kind, 0, 0, 1.6, t, a.phase, a.face, false); c.restore();
      if (sh < 0.5) { // shrug marks and a little puff
        const q = sh / 0.5, hy = a.y - HIT_Y[a.kind] * 2.2; c.save(); c.globalAlpha = 1 - q; c.strokeStyle = '#4a2a3a'; c.lineWidth = 2.5; c.lineCap = 'round';
        for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(a.x + sx * 18, hy + 4); c.quadraticCurveTo(a.x + sx * 26, hy - 6, a.x + sx * 22, hy - 14); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(a.x - 10 + i * 10, hy - 12 - q * 16, 4 + q * 3, 0, 7); c.fill(); } c.restore();
      }
    }
    for (const f of s.flies) butterfly(c, f.x + Math.sin(t * 1.3 + f.p) * 30, f.y + Math.sin(t * 2.1 + f.p * 2) * 14, t + f.p, f.col);
    for (const h of s.hearts) { const q = (t - h.t) / 0.8; if (q < 0 || q > 1) continue; c.save(); c.globalAlpha = 1 - q * q; heart(c, h.x + h.dx * q, h.y - q * 70, 6 + q * 4); c.restore(); }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
