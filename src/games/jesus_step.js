// STEP! — Matthew 14:22–33. Peter steps out of the boat and walks on the water toward Jesus; drag to keep him balanced until he reaches Jesus.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const PETER = { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly' };
const MOON = { x: 250, y: 120 };
const LIMIT = 1; // |tilt| above this and Peter sinks

function waveBand(c, y, amp, col, t, sp, k, phase) {
  if (col[0] === '#') { const gr = c.createLinearGradient(0, y - amp, 0, y + 90); gr.addColorStop(0, P.shade(col, 0.18)); gr.addColorStop(1, P.shade(col, -0.35)); c.fillStyle = gr; } else c.fillStyle = col; c.beginPath(); c.moveTo(-10, 700);
  for (let x = -10; x <= W + 10; x += 6) c.lineTo(x, y + Math.sin(x * k + t * sp + phase) * amp + Math.sin(x * k * 2.3 - t * sp * 0.7 + phase) * amp * 0.4);
  c.lineTo(W + 10, 700); c.closePath(); c.fill();
}
function crest(c, y, amp, t, sp, k, phase, alpha) {
  // whitecaps: thick soft strokes along the highest parts of each wave
  const yAt = x => y + Math.sin(x * k + t * sp + phase) * amp + Math.sin(x * k * 2.3 - t * sp * 0.7 + phase) * amp * 0.4;
  c.strokeStyle = `rgba(235,244,255,${alpha * 1.3})`; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); let on = false;
  for (let x = -10; x <= W + 10; x += 4) { const v = Math.sin(x * k + t * sp + phase - 0.5); if (v > 0.55) { const yy = yAt(x) + 1; on ? c.lineTo(x, yy) : c.moveTo(x, yy); on = true; } else on = false; }
  c.stroke();
  c.strokeStyle = `rgba(220,236,255,${alpha})`; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath();
  for (let x = -10; x <= W + 10; x += 6) { const yy = y + Math.sin(x * k + t * sp + phase) * amp + Math.sin(x * k * 2.3 - t * sp * 0.7 + phase) * amp * 0.4; x === -10 ? c.moveTo(x, yy) : c.lineTo(x, yy); }
  c.stroke();
}
function fishingBoat(c, x, y, s, t) {
  c.save(); c.translate(x, y + Math.sin(t * 2) * 3); c.rotate(Math.sin(t * 1.5) * 0.06); c.scale(s, s);
  // friends in the boat, peeking over the side
  P.person(c, -20, 2, 0.6, { skin: SK[1], robe: CL.teal, hair: HR[2], expr: 'surprised', arms: 'up', t, bounce: 0 });
  P.person(c, 14, 2, 0.6, { skin: SK[3], robe: CL.rust, hair: HR[0], beard: true, expr: 'wow', arms: 'cheer', t, phase: 1, bounce: 0 });
  const h = c.createLinearGradient(0, -14, 0, 10); h.addColorStop(0, '#6a4a5a'); h.addColorStop(1, '#2e2238'); c.fillStyle = h; c.strokeStyle = '#1e1428'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-54, -16); c.lineTo(52, -16); c.quadraticCurveTo(44, 10, 0, 10); c.quadraticCurveTo(-44, 10, -54, -16); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(200,210,255,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-50, -12); c.lineTo(48, -12); c.stroke();
  c.strokeStyle = '#3a2a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-36, -14); c.lineTo(-36, -74); c.stroke();
  c.fillStyle = 'rgba(210,214,236,0.9)'; c.beginPath(); c.moveTo(-34, -72); c.quadraticCurveTo(-8 + Math.sin(t * 3) * 3, -50, -6, -22); c.lineTo(-34, -22); c.closePath(); c.fill();
  c.restore();
}

MG.add({
  id: 'step', stage: 'jesus', cmd: 'STEP!', hint: 'drag', time: 5, mood: 'storm', winOnTimeout: true, winText: 'Peter!', failText: 'Splash!',
  card: { title: 'Walking on the water', ref: 'Matthew 14:22–33', kind: 'Gospel story', text: 'Matthew\'s Gospel tells how, one windy night, the disciples saw Jesus walking toward their boat on the water. Peter stepped out to meet him, but the wind scared him and he began to sink. Jesus reached out his hand right away and caught him.', ask: 'When do you feel scared or wobbly inside? Who reaches out a hand to help you?' },
  init(g) {
    const s = g.s; s.tilt = 0; s.vel = 0; s.push = 0; s.dx = 0; s.drag = null; s.prog = 0; s.sinkT = -1; s.ph = Math.random() * 6;
    s.wob = [0.95, 1.15, 1.4][g.level]; s.inst = [-0.5, 2.2, 3.0][g.level]; s.splash = []; s.jx = 254; // level 0 rights itself; higher levels topple unless you steer
  },
  down(g, x) { g.s.drag = x; },
  move(g, x) { const s = g.s; if (s.drag === null) return; s.push = Math.max(-1.6, Math.min(1.6, s.push + (x - s.drag) / 45)); s.drag = x; },
  up(g) { g.s.drag = null; },
  update(g, dt) {
    const s = g.s, t = g.t, sp = g.speed;
    s.prog = Math.min(1, t / g.dur);
    if (!g.done) {
      // the wind pushes Peter one way then the other, harder and faster as the level goes up; the player's drag pushes back
      const wind = (Math.sin(t * 1.7 * sp + s.ph) * 0.8 + Math.sin(t * 3.1 * sp + s.ph * 2) * 0.45) * s.wob;
      s.vel += (wind * 2.2 + s.push * 5 + s.tilt * s.inst) * dt; s.vel *= Math.pow(0.12, dt); s.tilt += s.vel * dt;
      s.push *= Math.pow(0.05, dt);
      if (Math.abs(s.tilt) > LIMIT) { s.sinkT = t; g.sfx('splashbig'); g.shake(4, 0.25); for (let i = 0; i < 18; i++) s.splash.push({ x: peterX(s) + (Math.random() - 0.5) * 40, y: 530, vx: (Math.random() - 0.5) * 160, vy: -120 - Math.random() * 160, t }); g.fail(); }
    } else if (g.result === 'win') { s.tilt *= Math.pow(0.02, dt); }
    for (const p of s.splash) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; }
    if (g.result === 'win' && !s.cheered) { s.cheered = 1; g.sfx('cheer'); g.burst(250, 380, ['#fff6c8', '#cfe6ff', '#ffffff'], 20, 180); }
  },
  auto(g, dt, synth) { // counter-steer: press and nudge against the tilt and the drift
    const s = g.s; if (!s.botDown) { s.botDown = 1; s.botX = 180; synth('down', 180, 400); }
    const want = -(s.tilt * 2.5 + s.vel * 1.2); s.botX += want * 45 * dt * 4; synth('move', s.botX, 400);
  },
  draw(g, c) {
    const s = g.s, t = g.t, failed = g.result === 'fail', won = g.result === 'win';
    c.drawImage(g.bake('jesus_step_bg', o => {
      P.sky(o, W, H, ['#0c1236', '#1e2a5e', '#3e4a86', '#6a6aa0'], null);
      P.stars(o, W, 300, 110, 17, 0);
      // the big moon with a soft halo
      const halo = o.createRadialGradient(MOON.x, MOON.y, 20, MOON.x, MOON.y, 220); halo.addColorStop(0, 'rgba(255,246,214,0.5)'); halo.addColorStop(0.3, 'rgba(220,226,255,0.16)'); halo.addColorStop(1, 'rgba(200,210,255,0)'); o.fillStyle = halo; o.fillRect(0, 0, W, H);
      const md = o.createRadialGradient(MOON.x - 14, MOON.y - 14, 4, MOON.x, MOON.y, 48); md.addColorStop(0, '#fffdf0'); md.addColorStop(0.8, '#f6eccc'); md.addColorStop(1, '#e6d8b0'); o.fillStyle = md; o.beginPath(); o.arc(MOON.x, MOON.y, 46, 0, 7); o.fill();
      o.fillStyle = 'rgba(200,186,150,0.35)'; for (const [dx, dy, r] of [[-14, -8, 9], [12, 10, 7], [6, -18, 5], [-6, 18, 6]]) { o.beginPath(); o.arc(MOON.x + dx, MOON.y + dy, r, 0, 7); o.fill(); }
      // far hills of the shore
      P.hills(o, W, 300, 22, '#2a2e5e', '#22264e', { seed: 61, freq: 0.012, dabs: 12, bottom: 340 });
    }), 0, 0, W, H);
    // drifting cloud wisps across the moon
    P.cloud(c, ((t * 14 + 40) % 520) - 80, 150, 0.7, '#9aa0d0', '#4a4a80', 0.55);
    P.cloud(c, ((t * 9 + 300) % 520) - 80, 80, 0.55, '#8a90c4', '#3e3e74', 0.45);
    // the lake: layered rolling waves, moonlight path
    const mid = 330;
    waveBand(c, mid, 4, '#1e3a6e', t, 1.4, 0.03, 0);
    // moon path glitter on the water
    c.save(); c.globalCompositeOperation = 'screen';
    c.save(); c.translate(MOON.x - 10, 470); c.scale(1, 3.2); const mp = c.createRadialGradient(0, 0, 4, 0, 0, 70); mp.addColorStop(0, 'rgba(255,240,200,0.42)'); mp.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = mp; c.beginPath(); c.arc(0, 0, 70, 0, 7); c.fill(); c.restore();
    const r = P.rng(9); for (let i = 0; i < 60; i++) { const yy = mid + 6 + r() * 290, spread = 14 + (yy - mid) * 0.35, xx = MOON.x - 10 + (r() - 0.5) * spread * 2, tw = Math.max(0, Math.sin(t * 4 + i * 1.7)); c.fillStyle = `rgba(255,248,220,${tw * 0.85})`; c.fillRect(xx - 5, yy, 8 + r() * 10, 1.6); } c.restore();
    c.strokeStyle = 'rgba(200,214,255,0.28)'; c.lineWidth = 1.4; c.lineCap = 'round'; for (let i = 0; i < 9; i++) { const yy = 60 + ((i * 73) % 300), xx = ((t * 260 + i * 97) % 520) - 80; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + 30, yy - 4, xx + 60, yy + 2); c.stroke(); }
    fishingBoat(c, 72, 360, 0.95, t);
    waveBand(c, 384, 9, '#2a4c8a', t, 2, 0.026, 1); crest(c, 384, 9, t, 2, 0.026, 1, 0.3);
    // Jesus standing on the water ahead, glowing gently, reaching out
    if (g.done) s.jx += (Math.min(254, peterX(s) + (g.result === 'win' ? 40 : 46)) - s.jx) * Math.min(1, 1 / 60 * 8); const jx = s.jx, jy = 446 + (254 - jx) * 0.5;
    const jg = c.createRadialGradient(jx, jy - 40, 6, jx, jy - 40, 110); jg.addColorStop(0, 'rgba(255,246,210,0.55)'); jg.addColorStop(1, 'rgba(255,246,210,0)'); c.fillStyle = jg; c.beginPath(); c.arc(jx, jy - 40, 110, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,246,210,0.3)'; c.beginPath(); c.ellipse(jx, jy, 30, 6, 0, 0, 7); c.fill();
    P.person(c, jx, jy, 1.1, { ...JESUS, facing: -1, t, phase: 0, bounce: 0.6, expr: failed ? 'happy' : won ? 'laugh' : 'happy', arms: failed || won ? 'reach' : 'out' });
    waveBand(c, 458, 11, '#264680', t, 2.4, 0.022, 2); crest(c, 458, 11, t, 2.4, 0.022, 2, 0.35);
    // Peter: walks from the boat toward Jesus, tilting with the wind
    const px = peterX(s), sinkQ = failed ? Math.min(1, (t - s.sinkT) / 0.3) : 0, py = 520 + sinkQ * 26;
    const tilt = s.tilt * 0.6, ex = Math.abs(s.tilt) > 0.6 ? 'surprised' : Math.abs(s.tilt) > 0.35 ? 'wow' : 'happy';
    c.fillStyle = 'rgba(200,220,255,0.25)'; c.beginPath(); c.ellipse(px, py + 2, 28, 6, 0, 0, 7); c.fill();
    c.save(); c.translate(px, py); c.rotate(failed ? s.tilt * 0.3 : tilt); c.translate(-px, -py);
    P.person(c, px, py, 1.25, { ...PETER, t: failed ? 0 : t, phase: 2, bounce: failed ? 0 : 1.6, expr: failed ? 'surprised' : won ? 'laugh' : ex, arms: failed ? 'reach' : won ? 'cheer' : 'out' });
    c.restore();
    // wake ripples around his feet as he walks
    for (let i = 0; i < 3; i++) { const q = ((t * 1.2 + i / 3) % 1); c.strokeStyle = `rgba(210,230,255,${0.5 * (1 - q)})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(px, py + 2, 16 + q * 30, 4 + q * 7, 0, 0, 7); c.stroke(); }
    // the front wave covers his legs when he sinks to his knees
    waveBand(c, failed ? 516 + Math.sin(t * 9) * 2 : 548, 13, '#203c74', t, 2.8, 0.02, 3); crest(c, failed ? 516 : 548, 13, t, 2.8, 0.02, 3, 0.45);
    for (const p of s.splash) { const q = (t - p.t) / 0.8; if (q > 1) continue; c.fillStyle = `rgba(220,238,255,${1 - q})`; c.beginPath(); c.arc(p.x, p.y, 3.5, 0, 7); c.fill(); }
    // balance meter: a curved bar with a bubble; centre is safe
    const by = 590, bw = 132;
    c.save(); c.fillStyle = 'rgba(10,16,48,0.5)'; roundRect(c, 180 - bw - 10, by - 14, bw * 2 + 20, 28, 14); c.fill();
    const gr = c.createLinearGradient(180 - bw, 0, 180 + bw, 0); gr.addColorStop(0, '#e86a6a'); gr.addColorStop(0.25, '#f2c24a'); gr.addColorStop(0.42, '#8ee08a'); gr.addColorStop(0.58, '#8ee08a'); gr.addColorStop(0.75, '#f2c24a'); gr.addColorStop(1, '#e86a6a');
    c.fillStyle = gr; roundRect(c, 180 - bw, by - 6, bw * 2, 12, 6); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; roundRect(c, 180 - bw + 4, by - 5, bw * 2 - 8, 4, 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(180, by - 12); c.lineTo(180, by + 12); c.stroke();
    const bx = 180 + Math.max(-1, Math.min(1, s.tilt / LIMIT)) * bw; const bub = c.createRadialGradient(bx - 3, by - 4, 1, bx, by, 13); bub.addColorStop(0, '#ffffff'); bub.addColorStop(1, Math.abs(s.tilt) > 0.6 ? '#ffb0a0' : '#cfe8ff'); c.fillStyle = bub; c.strokeStyle = '#1e2a5e'; c.lineWidth = 2; c.beginPath(); c.arc(bx, by, 11, 0, 7); c.fill(); c.stroke();
    // arrows show which way to drag to fix the lean
    if (!g.done && Math.abs(s.tilt) > 0.3) { const d = -Math.sign(s.tilt), a = 0.5 + 0.5 * Math.sin(t * 10); c.fillStyle = `rgba(255,246,200,${0.6 + 0.4 * a})`; for (let i = 0; i < 2; i++) { const ax = 180 + d * (bw + 22 + i * 10 + a * 4); c.beginPath(); c.moveTo(ax + d * 7, by); c.lineTo(ax - d * 3, by - 8); c.lineTo(ax - d * 3, by + 8); c.closePath(); c.fill(); } }
    c.restore();
    P.vignette(c, W, H, 0.38, '#060a24'); P.grain(c, W, H, 0.06);
  },
});
function peterX(s) { return 128 + 80 * s.prog; }
