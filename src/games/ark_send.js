// SEND! — after the rain, Noah sends the dove out from the ark window; flick it up and away, and it comes back with an olive leaf (Genesis 8:6–11).
const NOAH = { x: 92, y: 652, s: 2.3 };
const PERCH = { x: NOAH.x + 22 * NOAH.s, y: NOAH.y - 38 * NOAH.s - 4 };   // the dove sits on Noah's outstretched hand
// the dove's flight path once sent: out to the gap (or the wind's pull), off-screen, then home with the leaf
function flightPos(s, k) {
  // k: 0..1 out, 1..2 back
  const gx = s.aimX, gy = 110;
  if (k <= 1) { const e = k * k * (3 - 2 * k); return [PERCH.x + (gx - PERCH.x) * e + Math.sin(k * 7) * 8, PERCH.y + (gy - PERCH.y) * e - Math.sin(k * Math.PI) * 20, 1 - k * 0.55, gx >= PERCH.x ? 1 : -1]; }
  const q = k - 1, e = q * q * (3 - 2 * q); return [gx + (PERCH.x + 26 - gx) * e - Math.sin(q * Math.PI) * 50, gy + (PERCH.y - 30 - gy) * e - Math.sin(q * Math.PI) * 30, 0.45 + e * 0.55, gx >= PERCH.x ? -1 : 1];
}
MG.add({
  id: 'send', stage: 'ark', cmd: 'SEND!', hint: 'swipe', time: 5, mood: 'sea', winText: 'A leaf!',
  card: { title: 'The dove and the leaf', ref: 'Genesis 8:6–11', kind: 'Story', text: 'When the rain stopped, Noah opened the window of the ark and sent out a dove to see if the water had gone down. The second time he sent it, the dove came back in the evening with a fresh olive leaf in its beak, and Noah knew the land was drying out.', ask: 'What is a small sign that tells you something good is coming? How can you bring good news to someone today?' },
  init(g) {
    const s = g.s; s.state = 'perch'; s.sentT = 0; s.flops = []; s.wiggle = -9;
    // level 0: the whole sky is open. Level 1+: aim for the bright gap in the clouds, which drifts at level 2.
    s.gap = g.level ? { x: 110 + Math.random() * 140, w: [999, 120, 90][g.level], v: g.level === 2 ? (Math.random() < 0.5 ? -1 : 1) * 26 * g.speed : 0 } : null;
    s.aimX = 260; s.minSpeed = [350, 550, 700][g.level];
  },
  swipe(g, dx, dy, vx, vy) {
    const s = g.s; if (s.state !== 'perch') return;
    const sp = Math.hypot(vx, vy);
    if (dy < -30 && sp > s.minSpeed && -dy > Math.abs(dx) * 0.45) {
      // where would the flick carry the dove at y = 110?
      const tx = PERCH.x + dx / -dy * (PERCH.y - 110) * 0.9;
      if (!s.gap || Math.abs(tx - s.gap.x) < s.gap.w / 2 + 14) { s.state = 'fly'; s.sentT = g.t; s.aimX = s.gap ? s.gap.x : Math.max(60, Math.min(320, tx)); g.sfx('flap'); g.sfx('whoosh'); g.burst(PERCH.x, PERCH.y - 10, ['#ffffff', '#e8f4ff', '#ffe9a8'], 12, 140); return; }
      s.flops.push({ t: g.t, tx: Math.max(30, Math.min(330, tx)) }); s.wiggle = g.t; g.sfx('boing'); return;
    }
    s.wiggle = g.t; g.sfx('coo');
  },
  update(g, dt) {
    const s = g.s;
    if (s.gap && s.state === 'perch') { s.gap.x += s.gap.v * dt; if (s.gap.x < 90 || s.gap.x > 270) s.gap.v *= -1; }
    if (s.state === 'fly' && g.t - s.sentT > 0.75) { s.state = 'back'; g.sfx('coo'); }
    if (s.state === 'back' && !g.done && g.t - s.sentT > 0.95) { g.win(); g.sfx('sparkle'); g.burst(PERCH.x + 26, PERCH.y - 40, ['#9ccc5a', '#ffe9a8', '#ffffff'], 18, 160); }
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.9 || s.state !== 'perch' || s.botT) return; s.botT = 1;
    const tx = s.gap ? s.gap.x + s.gap.v * 0.02 : 260, dy = -180, dx = (tx - PERCH.x) / ((PERCH.y - 110) * 0.9) * -dy;
    synth('down', PERCH.x, PERCH.y); synth('move', PERCH.x + dx, PERCH.y + dy); synth('up', PERCH.x + dx, PERCH.y + dy); synth('swipe', dx, dy, dx * 6, dy * 6);
  },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('ark_send_bg', o => {
      // fresh morning sky over calm water, seen through the ark's window
      P.sky(o, W, 470, ['#6fb2e0', '#a8d6ee', '#fde8c4', '#ffd2a0'], { x: 250, y: 330, r: 26, color: '#fff0c0', glow: 260 });
      P.cloud(o, 300, 250, 0.6, '#fffaf0', '#f2c8c0', 0.9); P.cloud(o, 40, 290, 0.45, '#fffaf0', '#f2c8c0', 0.85);
      // far mountain peaks just poking out of the water
      o.fillStyle = '#9ab0c8'; o.beginPath(); o.moveTo(200, 372); o.quadraticCurveTo(232, 336, 244, 338); o.quadraticCurveTo(262, 344, 300, 372); o.fill();
      o.fillStyle = '#b6c8d8'; o.beginPath(); o.moveTo(236, 344); o.lineTo(244, 338); o.lineTo(252, 343); o.lineTo(246, 346); o.fill();
      o.fillStyle = '#a8bcd0'; o.beginPath(); o.moveTo(290, 372); o.quadraticCurveTo(312, 356, 330, 372); o.fill();
      P.rays(o, 250, 330, W, 200, '#fff6d8', 0.1, 9, 0);
    }), 0, 0, W, H);
    // the gap in the clouds (level 1+) and a soft cloud deck the dove flies through
    if (s.gap) {
      const gx = s.gap.x, gw = s.gap.w;
      c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(gx, 100, 4, gx, 100, gw * 0.8); gl.addColorStop(0, 'rgba(255,240,190,0.55)'); gl.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = gl; c.fillRect(gx - gw, 0, gw * 2, 230); c.restore();
      for (let row = 0; row < 2; row++) for (let i = -2; i < 14; i++) { const cx = i * 30 + row * 15 + Math.sin(t * 0.6 + i + row) * 3; if (Math.abs(cx - gx) < gw / 2 + 22) continue; P.cloud(c, cx, 84 + row * 34 + (i % 2) * 6, 0.5, row ? '#f2eef4' : '#e8e4ee', '#a8a4c0', 1); }
      // little sparkles in the gap
      for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.6; c.fillStyle = `rgba(255,250,220,${0.5 + 0.5 * Math.sin(a * 2)})`; drawStar(c, gx + Math.cos(a) * gw * 0.25, 96 + Math.sin(a * 1.3) * 14, 4, a); }
    } else { for (let i = 0; i < 4; i++) P.cloud(c, ((i * 110 + t * 6) % 480) - 60, 70 + (i % 2) * 40, 0.5 + (i % 2) * 0.15, '#fffaf2', '#f0ccd0', 0.92); }
    // the calm floodwater with gentle swells and sunglints
    P.water(c, W, 372, 470, '#2a7a98', '#8ad0dc', t, { sparkle: '#fff6d8', waves: 5 });
    c.fillStyle = 'rgba(255,246,210,0.5)'; for (let i = 0; i < 9; i++) { const sx = 250 + Math.sin(i * 2.1) * 30 * (1 + i * 0.2), sy = 380 + i * 9, w = 22 - i * 1.5 + Math.sin(t * 3 + i) * 5; c.fillRect(sx - w / 2, sy, w, 1.6); }
    // the window: the ark's dark timber surrounds it
    c.drawImage(g.bake('ark_send_fg', o => {
      o.save(); o.beginPath(); o.rect(0, 0, W, H); o.moveTo(34, 470); o.lineTo(34, 66); o.quadraticCurveTo(180, 24, 326, 66); o.lineTo(326, 470); o.closePath(); o.clip('evenodd');
      const wood = o.createLinearGradient(0, 0, W, 0); wood.addColorStop(0, '#3a2214'); wood.addColorStop(0.5, '#6a4024'); wood.addColorStop(1, '#3a2214'); o.fillStyle = wood; o.fillRect(0, 0, W, H);
      const r = P.rng(77); for (let i = 0; i < 22; i++) { const y = i * 30; o.strokeStyle = 'rgba(20,10,4,0.5)'; o.lineWidth = 2; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y + 4); o.stroke(); for (let k = 0; k < 3; k++) { const gx = r() * W; o.strokeStyle = 'rgba(255,200,140,0.08)'; o.beginPath(); o.moveTo(gx, y + 8 + r() * 14); o.lineTo(gx + 40, y + 10 + r() * 14); o.stroke(); } }
      o.restore();
      // window frame with a warm sunlit edge
      o.strokeStyle = '#8a5a30'; o.lineWidth = 12; o.beginPath(); o.moveTo(34, 470); o.lineTo(34, 66); o.quadraticCurveTo(180, 24, 326, 66); o.lineTo(326, 470); o.stroke();
      o.strokeStyle = 'rgba(255,214,150,0.6)'; o.lineWidth = 2.5; o.beginPath(); o.moveTo(40, 470); o.lineTo(40, 70); o.quadraticCurveTo(180, 30, 320, 70); o.lineTo(320, 470); o.stroke();
      // the open shutter on the right hinge
      o.fillStyle = '#7a4a28'; o.strokeStyle = '#2e180c'; o.lineWidth = 2.5; o.beginPath(); o.moveTo(330, 80); o.lineTo(358, 60); o.lineTo(358, 470); o.lineTo(330, 466); o.closePath(); o.fill(); o.stroke();
      for (let i = 0; i < 4; i++) { o.strokeStyle = 'rgba(30,14,6,0.5)'; o.lineWidth = 1.5; o.beginPath(); o.moveTo(337 + i * 6, 76 - i * 4); o.lineTo(337 + i * 6, 468); o.stroke(); }
      // windowsill
      const sill = o.createLinearGradient(0, 456, 0, 500); sill.addColorStop(0, '#b07a48'); sill.addColorStop(1, '#5a3418'); o.fillStyle = sill; o.fillRect(14, 460, 332, 34); o.fillStyle = 'rgba(255,230,180,0.5)'; o.fillRect(14, 460, 332, 3);
      // inside the ark, below the sill: warm lamplight and straw
      const inside = o.createLinearGradient(0, 494, 0, H); inside.addColorStop(0, '#4a2a18'); inside.addColorStop(1, '#2a160c'); o.fillStyle = inside; o.fillRect(0, 494, W, H - 494);
      o.strokeStyle = 'rgba(230,190,110,0.35)'; o.lineWidth = 1.2; for (let i = 0; i < 80; i++) { const sx = r() * W, sy = 560 + r() * 80, a = (r() - 0.5); o.beginPath(); o.moveTo(sx, sy); o.lineTo(sx + Math.cos(a) * 10, sy + Math.sin(a) * 4); o.stroke(); }
      // a clay water jar on the sill
      o.fillStyle = '#c0703a'; o.beginPath(); o.ellipse(310, 452, 13, 16, 0, 0, 7); o.fill(); o.fillStyle = '#a05a2a'; o.fillRect(303, 430, 14, 8); o.fillStyle = 'rgba(255,220,170,0.4)'; o.beginPath(); o.ellipse(305, 446, 4, 8, 0, 0, 7); o.fill();
    }), 0, 0, W, H);
    // sunlight streaming in through the window onto Noah
    c.save(); c.globalCompositeOperation = 'lighter'; const sl = c.createRadialGradient(150, 470, 10, 150, 470, 230); sl.addColorStop(0, 'rgba(255,220,150,0.22)'); sl.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = sl; c.fillRect(0, 240, W, 400); c.restore();
    // Noah leans on the sill with his hand out for the dove; his wife watches beside him
    const won = g.result === 'win', flying = s.state !== 'perch';
    P.person(c, 266, 612, 1.95, { skin: P.SKIN[1], robe: P.CLOTH.plum, stripe: P.CLOTH.gold, hairStyle: 'bun', hair: P.HAIR[5], expr: won ? 'laugh' : flying ? 'wow' : 'happy', arms: won ? 'cheer' : 'hold', t, phase: 1, facing: -1 });
    P.person(c, NOAH.x, NOAH.y, NOAH.s, { bounce: 0, skin: P.SKIN[2], robe: P.CLOTH.olive, stripe: P.CLOTH.cream, beard: '#e8e2da', hair: P.HAIR[5], head: 'wrap', expr: won ? 'laugh' : flying ? 'wow' : 'happy', arms: won ? 'cheer' : flying ? 'wave' : 'reach', t });
    // the dove
    if (s.state === 'perch') {
      const w = t - s.wiggle, hop = w < 0.4 ? Math.sin(w / 0.4 * Math.PI * 3) * 4 * (1 - w / 0.4) : 0, breathe = Math.sin(t * 3) * 1.2;
      // a gentle glow and an upward hint arrow so kids know where to flick
      const pulse = 0.5 + 0.5 * Math.sin(t * 5);
      c.save(); c.globalCompositeOperation = 'lighter'; const dg = c.createRadialGradient(PERCH.x, PERCH.y - 10, 4, PERCH.x, PERCH.y - 10, 60); dg.addColorStop(0, `rgba(255,250,220,${0.35 + 0.2 * pulse})`); dg.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = dg; c.fillRect(PERCH.x - 60, PERCH.y - 70, 120, 120); c.restore();
      if (g.t > 1.2) { c.save(); c.globalAlpha = 0.45 + 0.35 * pulse; c.strokeStyle = '#fffaf0'; c.lineWidth = 4; c.lineCap = 'round'; c.setLineDash([2, 10]); const ax = s.gap ? s.gap.x : 240; c.beginPath(); c.moveTo(PERCH.x + 6, PERCH.y - 52); c.quadraticCurveTo(PERCH.x + 10, 260, ax, 160); c.stroke(); c.setLineDash([]); c.restore(); }
      P.dove(c, PERCH.x + hop, PERCH.y - 2 + breathe, 1.6, { t, flying: false });
    } else {
      const k = Math.min(2, (t - s.sentT) / 0.475), [x, y, sc, f] = flightPos(s, k);
      P.dove(c, x, y, 1.7 * sc, { t: t * 1.3, facing: f, branch: k > 1 });
      if (k < 1) for (let i = 1; i < 5; i++) { const [px, py] = flightPos(s, Math.max(0, k - i * 0.06)); c.fillStyle = `rgba(255,255,255,${0.4 - i * 0.08})`; c.beginPath(); c.arc(px, py, 6 - i, 0, 7); c.fill(); }
      if (k > 1.5) { c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(x + 20 * f, y, 2, x + 20 * f, y, 40); lg.addColorStop(0, 'rgba(200,255,150,0.45)'); lg.addColorStop(1, 'rgba(200,255,150,0)'); c.fillStyle = lg; c.fillRect(x - 60, y - 60, 120, 120); c.restore(); }
    }
    // a feather puff for flicks that miss the gap
    for (const f of s.flops) { const q = (t - f.t) / 0.6; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { c.save(); c.translate(PERCH.x + (f.tx - PERCH.x) * q * 0.3 + Math.sin(i * 2 + q * 6) * 14, PERCH.y - 40 - q * 50 + i * 6); c.rotate(i + q * 3); c.beginPath(); c.ellipse(0, 0, 6, 2.5, 0, 0, 7); c.fill(); c.restore(); } c.restore(); }
    P.vignette(c, W, H, 0.32); P.grain(c, W, H, 0.06);
  },
});
