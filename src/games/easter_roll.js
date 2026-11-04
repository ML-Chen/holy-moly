// ROLL! — Easter morning (Matthew 28:1–8, John 20:1). Swipe to roll the big round stone away from the garden tomb:
// golden light pours out of the empty tomb, the spring flowers open and the birds start to sing.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const MARY = { skin: SK[2], robe: CL.rose, stripe: CL.cream, hairStyle: 'long', hair: HR[1] };
const JOANNA = { skin: SK[1], robe: CL.saffron, stripe: CL.rust, hairStyle: 'bun', hair: HR[2] };
const DX = 140, DY = 488, R = 60, TRAVEL = 164; // tomb door centre-bottom, stone radius, how far it rolls

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function lily(c, x, y, s, open, t) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(Math.sin(t * 1.5 + x) * 0.05);
  c.strokeStyle = '#4f8a3a'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-2, -16, 0, -30); c.stroke();
  c.fillStyle = '#5f9a44'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(sd * 12, -14, sd * 14, -24); c.quadraticCurveTo(sd * 4, -14, 0, -6); c.fill(); }
  c.translate(0, -30);
  if (open < 0.05) { c.fillStyle = '#e6edd0'; c.beginPath(); c.ellipse(0, -7, 4, 9, 0, 0, 7); c.fill(); c.restore(); return; }
  const k = Math.min(1, open);
  for (const a of [-0.9, 0, 0.9]) { c.save(); c.rotate(a * k); const g = c.createLinearGradient(0, 0, 0, -18); g.addColorStop(0, '#f4ecc8'); g.addColorStop(1, '#ffffff'); c.fillStyle = g; c.strokeStyle = 'rgba(160,150,120,0.6)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-7, -9, -3 * k, -19); c.quadraticCurveTo(0, -16, 3 * k, -19); c.quadraticCurveTo(7, -9, 0, 0); c.fill(); c.stroke(); c.restore(); }
  c.fillStyle = '#f2b830'; for (const a of [-0.3, 0, 0.3]) { c.beginPath(); c.arc(Math.sin(a) * 9 * k, -12 * k, 1.4, 0, 7); c.fill(); }
  c.restore();
}
function anemone(c, x, y, s, open, col, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = '#4f8a3a'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(t + x) * 1.5, -16); c.stroke(); c.translate(Math.sin(t + x) * 1.5, -16);
  const k = Math.max(0.25, Math.min(1, open)); c.fillStyle = col;
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; c.beginPath(); c.ellipse(Math.cos(a) * 4.5 * k, Math.sin(a) * 4.5 * k, 4.6 * k, 3.2 * k, a, 0, 7); c.fill(); }
  c.fillStyle = '#2a1830'; c.beginPath(); c.arc(0, 0, 2.6 * k, 0, 7); c.fill();
  c.restore();
}
// a round little songbird; flap > 0 when flying
function bird(c, x, y, s, col, facing, t, flap) {
  c.save(); c.translate(x, y); c.scale(s * facing, s);
  const f = flap ? Math.sin(t * 22) : 0;
  c.fillStyle = P.shade(col, -0.25); c.beginPath(); c.moveTo(-8, 0); c.lineTo(-15, -4); c.lineTo(-14, 3); c.closePath(); c.fill();
  const g = c.createRadialGradient(-2, -4, 1, 0, 0, 10); g.addColorStop(0, P.shade(col, 0.35)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 9, 7.5, 0, 0, 7); c.fill();
  c.fillStyle = '#ffd890'; c.beginPath(); c.ellipse(3, 2.5, 5, 4, 0, 0, 7); c.fill();
  c.fillStyle = P.shade(col, -0.15); c.beginPath(); c.ellipse(-2, -1 - f * 6, 6, 3.5 + Math.abs(f) * 2, -0.4 - f * 0.6, 0, 7); c.fill();
  c.fillStyle = '#f2a33a'; c.beginPath(); c.moveTo(8, -2); c.lineTo(12.5, -0.5); c.lineTo(8, 1); c.fill();
  P.eye(c, 5, -3, 1.6);
  c.restore();
}
function note(c, x, y, s, a) { c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.fillStyle = '#fff6d8'; c.strokeStyle = '#fff6d8'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 3.4, 2.6, -0.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(3, -1); c.lineTo(3, -12); c.quadraticCurveTo(7, -10, 8, -6); c.stroke(); c.restore(); }
function paintGarden(o) {
  P.sky(o, W, H, ['#2c2f6e', '#6c4f96', '#d97a90', '#ffb27a', '#ffe7b0'], { x: 262, y: 318, r: 30, color: '#ffd890', glow: 330 });
  P.stars(o, W, 120, 26, 41, 0);
  // far hills with Jerusalem's walls
  P.hills(o, W, 330, 30, '#9a6a98', '#80608c', { seed: 61, freq: 0.01, dabs: 12, bottom: 420 });
  o.fillStyle = 'rgba(110,80,130,0.85)'; o.fillRect(0, 300, 120, 30); for (let i = 0; i < 12; i++) o.fillRect(i * 10, 295, 6, 6); o.fillRect(52, 280, 22, 22); o.fillRect(94, 286, 16, 16);
  P.hills(o, W, 362, 24, '#b88a98', '#9a7a8a', { seed: 63, freq: 0.016, dabs: 16, bottom: 440, rim: '#ffd2b0' });
  // morning mist
  const mist = o.createLinearGradient(0, 330, 0, 400); mist.addColorStop(0, 'rgba(255,226,200,0)'); mist.addColorStop(0.5, 'rgba(255,226,200,0.5)'); mist.addColorStop(1, 'rgba(255,226,200,0)'); o.fillStyle = mist; o.fillRect(0, 330, W, 70);
  // cypress trees in the garden
  for (const [x, y, h] of [[318, 410, 120], [342, 418, 96], [22, 400, 90]]) { const cg = o.createLinearGradient(x - 10, 0, x + 10, 0); cg.addColorStop(0, '#2f5a3e'); cg.addColorStop(1, '#5a8a52'); o.fillStyle = cg; o.beginPath(); o.moveTo(x, y - h); o.quadraticCurveTo(x + 14, y - h * 0.4, x + 8, y); o.lineTo(x - 8, y); o.quadraticCurveTo(x - 14, y - h * 0.4, x, y - h); o.fill(); o.fillStyle = 'rgba(255,200,150,0.25)'; o.beginPath(); o.moveTo(x, y - h); o.quadraticCurveTo(x + 14, y - h * 0.4, x + 8, y); o.lineTo(x + 3, y); o.quadraticCurveTo(x + 8, y - h * 0.4, x, y - h); o.fill(); }
  // the rock hillside the tomb is cut into
  o.save(); o.beginPath(); o.moveTo(-10, 520); o.lineTo(-10, 392); o.quadraticCurveTo(30, 360, 90, 356); o.quadraticCurveTo(160, 346, 220, 368); o.quadraticCurveTo(262, 384, 290, 404); o.quadraticCurveTo(320, 420, 370, 416); o.lineTo(370, 520); o.closePath();
  const rg = o.createLinearGradient(0, 350, 0, 520); rg.addColorStop(0, '#e8c6a0'); rg.addColorStop(1, '#a87a62'); o.fillStyle = rg; o.fill(); o.clip();
  let r = P.rng(71); for (let i = 0; i < 70; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff0d8' : '#7a5040', 0.1 + r() * 0.12); o.beginPath(); o.ellipse(r() * 360, 350 + r() * 170, 10 + r() * 22, 4 + r() * 8, r() * 0.6 - 0.3, 0, 7); o.fill(); }
  o.strokeStyle = 'rgba(110,70,60,0.35)'; o.lineWidth = 1.4; for (let i = 0; i < 8; i++) { const x = r() * 280, y = 370 + r() * 120; o.beginPath(); o.moveTo(x, y); o.quadraticCurveTo(x + 10, y + 8, x + 6 + r() * 20, y + 20); o.stroke(); }
  // sunlit right edge of the rock
  const sl = o.createLinearGradient(160, 0, 280, 0); sl.addColorStop(0, 'rgba(255,210,150,0)'); sl.addColorStop(1, 'rgba(255,210,150,0.45)'); o.fillStyle = sl; o.fillRect(160, 340, 200, 180);
  // ivy and grass hanging over the top
  o.restore();
  o.fillStyle = '#5f8a48'; r = P.rng(73); for (let i = 0; i < 26; i++) { const x = 10 + i * 10 + r() * 6, y = 368 - Math.sin(i / 26 * Math.PI) * 16 + r() * 6; o.beginPath(); o.ellipse(x, y, 7, 4, r() * 2, 0, 7); o.fill(); }
  o.fillStyle = '#7aa85a'; for (let i = 0; i < 20; i++) { const x = 14 + i * 13 + r() * 6, y = 364 - Math.sin(i / 20 * Math.PI) * 14 + r() * 4; o.beginPath(); o.ellipse(x, y, 5, 3, r() * 2, 0, 7); o.fill(); }
  // the doorway frame, carved into the rock
  o.fillStyle = '#8a5e4c'; o.beginPath(); o.moveTo(DX - 52, DY); o.lineTo(DX - 52, DY - 60); o.arc(DX, DY - 60, 52, Math.PI, 0); o.lineTo(DX + 52, DY); o.closePath(); o.fill();
  o.fillStyle = '#c69a7a'; o.beginPath(); o.moveTo(DX - 48, DY); o.lineTo(DX - 48, DY - 60); o.arc(DX, DY - 60, 48, Math.PI, 0); o.lineTo(DX + 48, DY); o.closePath(); o.fill();
  // the groove the stone rolls along
  o.fillStyle = '#7a5444'; o.fillRect(DX - 70, DY - 6, TRAVEL + 150, 12); o.fillStyle = '#5a3a32'; o.fillRect(DX - 70, DY - 6, TRAVEL + 150, 4); o.fillStyle = '#d8b08a'; o.fillRect(DX - 70, DY + 5, TRAVEL + 150, 3);
  // the garden in front: grass, a path, olive tree
  P.hills(o, W, 500, 10, '#8ab460', '#5a8a3e', { seed: 75, freq: 0.02, dabs: 90, rim: '#e8f0a0' });
  o.fillStyle = 'rgba(232,200,150,0.75)'; o.beginPath(); o.moveTo(150, 504); o.quadraticCurveTo(120, 560, 170, 640); o.lineTo(260, 640); o.quadraticCurveTo(190, 560, 186, 504); o.closePath(); o.fill();
  P.grassTufts(o, W, 504, 640, 80, '#6a9a3a', 13);
  P.flowers(o, W, 510, 640, 24, ['#ffffff', '#f4d35e', '#e05a6a', '#b98ae0'], 17);
  // warm light from the sunrise across the grass
  o.save(); o.globalCompositeOperation = 'screen'; glow(o, 262, 330, 300, '#ff9a5a', 0.18); o.restore();
}

MG.add({
  id: 'roll', stage: 'easter', cmd: 'ROLL!', hint: 'swipe', time: 5, mood: 'bright', winText: 'He is risen!',
  card: { title: 'The empty tomb', ref: 'Matthew 28:1–10; John 20:1–18', kind: 'Story', text: 'Very early on Sunday morning, Mary Magdalene and other women came to the garden where Jesus had been buried. The huge stone had been rolled away, the tomb was empty, and an angel told them, "He is not here. He has been raised!"', ask: 'Easter is about new life. Where can you see new life starting around you right now?' },
  init(g) {
    const s = g.s; s.need = [1, 2, 3][g.level]; s.prog = 0; s.target = 0; s.ang = 0; s.winT = -9; s.lastSwipe = -9; s.wobble = 0; s.notes = []; s.petals = [];
    const r = P.rng(Math.floor(Math.random() * 999) + 1);
    s.buds = Array.from({ length: 13 }, (_, i) => ({ x: 14 + i * 27 + r() * 10, y: 556 + r() * 56, lily: i % 3 !== 1, s: 0.95 + r() * 0.4, col: ['#e04a5a', '#f07aa0', '#b46ae0'][i % 3], d: r() * 0.4 }));
    s.birds = [{ x: 196, y: 346, col: '#e8a04a', ph: 0 }, { x: 226, y: 356, col: '#7ab0e0', ph: 2 }, { x: 60, y: 356, col: '#f08aa0', ph: 4 }];
  },
  swipe(g, dx, dy, vx) {
    const s = g.s; if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 0.7) return;
    const strong = Math.abs(dx) > 170 || Math.abs(vx || 0) > 1500;
    s.target = Math.min(1, s.target + (strong ? 1.5 : 1) / s.need); s.lastSwipe = g.t; s.wobble = 1; g.shake(3, 0.15);
    if (s.target >= 1) { s.winT = g.t; g.sfx('rumble'); g.sfx('magic'); g.win(); g.burst(DX, DY - 60, ['#fff6c0', '#ffd45a', '#ffffff', '#ffb0c8'], 30, 240); }
    else { g.sfx('thud'); g.burst(DX + s.target * TRAVEL + R, DY - 6, ['#e0c8a8', '#c8a888'], 8, 90); }
  },
  update(g, dt) {
    const s = g.s;
    if (s.target < 1 && g.level > 0 && g.t - s.lastSwipe > 0.5) s.target = Math.max(0, s.target - dt * 0.12 * g.level); // a heavy stone settles back a little
    const old = s.prog; s.prog += (s.target - s.prog) * Math.min(1, dt * 6); s.ang += (s.prog - old) * TRAVEL / R; s.wobble = Math.max(0, s.wobble - dt * 3);
    if (s.winT > 0) {
      if (Math.random() < dt * 6) s.notes.push({ x: 60 + Math.random() * 180, y: 330, t: g.t, ph: Math.random() * 6 });
      if (Math.random() < dt * 30) s.petals.push({ x: DX + (Math.random() - 0.5) * 50, y: DY - 50 - Math.random() * 30, vx: (Math.random() - 0.3) * 200, vy: -150 - Math.random() * 150, t: g.t, col: ['#ffffff', '#ffd0e0', '#fff0a0', '#e86a7a'][Math.floor(Math.random() * 4)], rot: Math.random() * 6 });
    }
    for (const p of s.petals) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; p.vx *= 0.99; p.rot += dt * 4; }
    s.petals = s.petals.filter(p => g.t - p.t < 1.6); s.notes = s.notes.filter(n => g.t - n.t < 1.4);
  },
  auto(g, dt, synth) { const s = g.s, k = Math.floor((g.t - 0.5) / 0.35); if (g.t > 0.5 && k !== s.botK && s.target < 1) { s.botK = k; synth('down', 90, 470); synth('move', 230, 466); synth('up', 230, 466); synth('swipe', 140, -4, 700, 0); } },
  draw(g, c) {
    const s = g.s, t = g.t, won = s.winT > 0, wt = won ? t - s.winT : 0, open = Math.min(1, s.prog * 1.25);
    c.drawImage(g.bake('easter_roll_bg', paintGarden), 0, 0, W, H);
    P.cloud(c, 70 + t * 4, 170, 0.75, '#ffd8c8', '#b87a9a', 0.85); P.cloud(c, 300 - t * 3, 128, 0.55, '#ffd8c8', '#b87a9a', 0.75);
    // the sun keeps rising
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, 262, 318 - t * 3, 120 + Math.sin(t * 2) * 6, '#fff0b0', 0.25); c.restore();
    P.rays(c, 262, 318, W, H * 0.7, '#ffe6b0', 0.08, 9, t);
    // inside the tomb: dark, then filled with light as the stone moves
    c.save(); c.beginPath(); c.moveTo(DX - 40, DY); c.lineTo(DX - 40, DY - 58); c.arc(DX, DY - 58, 40, Math.PI, 0); c.lineTo(DX + 40, DY); c.closePath(); c.clip();
    const ig = c.createLinearGradient(0, DY - 100, 0, DY); ig.addColorStop(0, '#2a1620'); ig.addColorStop(1, '#4a2a2a'); c.fillStyle = ig; c.fillRect(DX - 40, DY - 100, 80, 100);
    if (open > 0) {
      c.globalAlpha = open; const lg = c.createRadialGradient(DX, DY - 40, 4, DX, DY - 40, 70); lg.addColorStop(0, '#fffbe8'); lg.addColorStop(0.5, '#ffe08a'); lg.addColorStop(1, '#e8a050'); c.fillStyle = lg; c.fillRect(DX - 40, DY - 100, 80, 100);
      // the stone bench inside, with the linen cloths folded up
      c.fillStyle = '#e8c890'; c.fillRect(DX - 40, DY - 26, 80, 26); c.fillStyle = '#c8a070'; c.fillRect(DX - 40, DY - 26, 80, 3);
      c.fillStyle = '#ffffff'; c.strokeStyle = '#d8c8a8'; c.lineWidth = 1; roundRect(c, DX - 28, DY - 36, 30, 11, 4); c.fill(); c.stroke(); roundRect(c, DX + 8, DY - 34, 16, 9, 3); c.fill(); c.stroke();
      c.globalAlpha = 1;
    }
    c.restore();
    if (open > 0) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, DX, DY - 50, 90 + 160 * open + (won ? Math.sin(t * 4) * 10 : 0), '#ffe6a0', 0.6 * open); c.restore(); if (won) P.rays(c, DX, DY - 58, W, H, '#fff2c0', 0.22 * Math.min(1, wt * 2), 11, t); }
    // the stone, rolling along its groove
    const sx = DX + s.prog * TRAVEL + Math.sin(t * 40) * s.wobble * 2, sy = DY - R + 4;
    c.fillStyle = 'rgba(40,20,30,0.35)'; c.beginPath(); c.ellipse(sx + 6, DY + 2, R * 0.95, 8, 0, 0, 7); c.fill();
    const sg = c.createRadialGradient(sx - R * 0.4, sy - R * 0.45, 4, sx, sy, R * 1.05); sg.addColorStop(0, '#f2dcc0'); sg.addColorStop(0.6, '#c8a284'); sg.addColorStop(1, '#8a6250');
    c.fillStyle = sg; c.strokeStyle = '#5a3a32'; c.lineWidth = 2.5; c.beginPath(); c.arc(sx, sy, R, 0, 7); c.fill(); c.stroke();
    c.save(); c.beginPath(); c.arc(sx, sy, R - 2, 0, 7); c.clip(); c.translate(sx, sy); c.rotate(s.ang);
    c.strokeStyle = 'rgba(100,64,52,0.5)'; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, R * 0.62, 0, 7); c.stroke();
    const r = P.rng(5); for (let i = 0; i < 12; i++) { const a = r() * 6.28, d = r() * R * 0.9; c.fillStyle = P.rgba(r() < 0.5 ? '#fff0dc' : '#7a5040', 0.25); c.beginPath(); c.ellipse(Math.cos(a) * d, Math.sin(a) * d, 4 + r() * 8, 2 + r() * 4, a, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(100,64,52,0.45)'; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill();
    c.restore();
    c.fillStyle = 'rgba(255,220,170,0.4)'; c.beginPath(); c.arc(sx, sy, R - 4, Math.PI * 1.1, Math.PI * 1.55); c.lineTo(sx, sy); c.closePath(); c.fill();
    if (!won) { // a soft pulse on the stone says "push me"
      const pu = 0.5 + 0.5 * Math.sin(t * 5); c.save(); c.globalCompositeOperation = 'screen'; c.strokeStyle = `rgba(255,236,170,${0.25 + 0.35 * pu})`; c.lineWidth = 5 + pu * 4; c.beginPath(); c.arc(sx, sy, R + 6 + pu * 3, 0, 7); c.stroke(); c.restore();
      c.fillStyle = `rgba(255,248,220,${0.5 + 0.4 * pu})`; for (let i = 0; i < 3; i++) { const ax = sx + R + 18 + i * 14 + pu * 6; c.beginPath(); c.moveTo(ax, sy - 8); c.lineTo(ax + 9, sy); c.lineTo(ax, sy + 8); c.closePath(); c.fill(); }
    }
    // songbirds: dozing on the olive branches, then up and singing
    for (const b of s.birds) {
      if (!won) bird(c, b.x, b.y - Math.abs(Math.sin(t * 3 + b.ph)) * 2, 1.1, b.col, b.ph === 4 ? 1 : -1, t, false);
      else { const q = Math.min(1, wt * 1.2), dir = b.ph === 4 ? 1 : -1; bird(c, b.x + dir * q * (40 + b.ph * 10) + Math.sin(t * 3 + b.ph) * 8, b.y - q * (110 + b.ph * 12) + Math.sin(t * 6 + b.ph) * 6, 1.1, b.col, dir, t + b.ph, true); }
    }
    for (const n of s.notes) { const q = (t - n.t) / 1.4; note(c, n.x - q * 40 + Math.sin(t * 5 + n.ph) * 6, n.y - q * 140, 1.2, 1 - q); }
    // spring flowers along the front: buds that open when the light comes out
    for (const b of s.buds) { const op = won ? (wt - b.d) * 2.5 : 0; if (b.lily) lily(c, b.x, b.y, b.s, op, t); else anemone(c, b.x, b.y, b.s, op, b.col, t); }
    for (const p of s.petals) { const q = (t - p.t) / 1.6; c.save(); c.globalAlpha = 1 - q; c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col; c.beginPath(); c.ellipse(0, 0, 5, 2.6, 0, 0, 7); c.fill(); c.restore(); }
    // the women who came with spices at dawn
    const amazed = s.prog > 0.3;
    P.person(c, 58, 606, 1.3, { ...MARY, t, phase: 0, bounce: won ? 2.6 : 0.8, expr: won ? 'laugh' : amazed ? 'wow' : 'sad', arms: won ? 'cheer' : amazed ? 'out' : 'hold', hold: won || amazed ? null : (cc, hx, hy) => jar(cc, hx, hy) });
    P.person(c, 236, 622, 1.2, { ...JOANNA, facing: -1, t, phase: 2, bounce: won ? 2.4 : 0.8, expr: won ? 'wow' : amazed ? 'surprised' : 'sad', arms: won ? 'cheer' : 'pray' });
    P.vignette(c, W, H, 0.3, '#3a1a3a'); P.grain(c, W, H, 0.06);
  },
});
function jar(c, x, y) { const g = c.createLinearGradient(x - 6, 0, x + 6, 0); g.addColorStop(0, '#f0d8b0'); g.addColorStop(1, '#b08860'); c.fillStyle = g; c.strokeStyle = '#6a4a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 3, y - 12); c.lineTo(x + 3, y - 12); c.quadraticCurveTo(x + 8, y - 4, x + 5, y + 4); c.lineTo(x - 5, y + 4); c.quadraticCurveTo(x - 8, y - 4, x - 3, y - 12); c.fill(); c.stroke(); c.fillStyle = '#8a5a3a'; c.fillRect(x - 3.5, y - 14, 7, 3); }
