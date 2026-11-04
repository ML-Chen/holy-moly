// HARP! — 1 Samuel 16:23. Young David plays the lyre for troubled King Saul. Tap each string as it lights up;
// every good note turns Saul's stormy thought-cloud a little sunnier until he smiles and relaxes.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const SAUL = { x: 196, y: 396, s: 1.45 };
const CLOUD = { x: 200, y: 196 };
const LYRE = { x: 222, top: 446, bot: 578 };
const STR = [168, 204, 240, 276];
const PITCH = [1, 1.125, 1.26, 1.5];
const PATTERNS = [[0, 1, 2, 3, 2, 1], [3, 2, 1, 0, 1, 2], [0, 2, 1, 3, 1, 2], [1, 2, 3, 2, 0, 1]];
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);

function seated(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 126 * s); c.clip(); P.person(c, x, y + 12 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 12 * s, x, y + 4 * s); g.addColorStop(0, P.shade(robe, 0.12)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 4 * s, 19 * s, 7.5 * s, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 13 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.ellipse(x + 13 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill();
}
function throne(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(30,10,30,0.3)'; c.beginPath(); c.ellipse(0, 4, 46, 9, 0, 0, 7); c.fill();
  const wd = c.createLinearGradient(-40, -120, 40, 0); wd.addColorStop(0, '#b4743c'); wd.addColorStop(1, '#5e3418'); c.fillStyle = wd; c.strokeStyle = '#3a1c0c'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-34, 0); c.lineTo(-34, -96); c.quadraticCurveTo(-34, -128, 0, -132); c.quadraticCurveTo(34, -128, 34, -96); c.lineTo(34, 0); c.closePath(); c.fill(); c.stroke();
  const cu = c.createLinearGradient(0, -120, 0, -20); cu.addColorStop(0, '#b0384a'); cu.addColorStop(1, '#6a1a2e'); c.fillStyle = cu; c.beginPath(); c.moveTo(-24, -20); c.lineTo(-24, -92); c.quadraticCurveTo(-24, -118, 0, -120); c.quadraticCurveTo(24, -118, 24, -92); c.lineTo(24, -20); c.closePath(); c.fill();
  c.fillStyle = '#f2c94c'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 34, -98, 6, 0, 7); c.fill(); }
  c.beginPath(); c.arc(0, -126, 7, 0, 7); c.fill(); c.strokeStyle = '#a8781e'; c.lineWidth = 1; c.stroke();
  // armrests
  c.fillStyle = '#8a5428'; c.strokeStyle = '#3a1c0c'; c.lineWidth = 2; for (const sx of [-1, 1]) { c.beginPath(); roundRect(c, sx > 0 ? 26 : -46, -40, 20, 10, 5); c.fill(); c.stroke(); c.fillStyle = '#f2c94c'; c.beginPath(); c.arc(sx * 42, -35, 4, 0, 7); c.fill(); c.fillStyle = '#8a5428'; }
  c.restore();
}
function lamp(c, x, y, t, k) {
  c.save(); c.globalCompositeOperation = 'lighter';
  const f = 0.85 + 0.15 * Math.sin(t * 13 + x) * Math.sin(t * 7.3 + x * 2);
  const gl = c.createRadialGradient(x, y - 8, 2, x, y - 8, 90 * f); gl.addColorStop(0, `rgba(255,190,100,${0.32 + 0.22 * k})`); gl.addColorStop(1, 'rgba(255,150,80,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y - 8, 90 * f, 0, 7); c.fill(); c.restore();
  c.fillStyle = '#c8862e'; c.strokeStyle = '#5a3010'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, 14, 6, 0, 0, Math.PI); c.lineTo(x - 14, y); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x + 12, y - 1); c.lineTo(x + 20, y - 4); c.lineTo(x + 18, y + 1); c.fill();
  const fl = c.createRadialGradient(x + 19, y - 9, 1, x + 19, y - 9, 8); fl.addColorStop(0, '#fffbe0'); fl.addColorStop(0.5, '#ffc04a'); fl.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = fl;
  c.beginPath(); c.moveTo(x + 15, y - 4); c.quadraticCurveTo(x + 18 + Math.sin(t * 11 + x) * 2, y - 18 * f, x + 20, y - 20 * f); c.quadraticCurveTo(x + 23, y - 10, x + 22, y - 4); c.closePath(); c.fill();
}
// Saul's thought-cloud: heavy slate-gray puffs that turn creamy and sunlit as k goes 0 → 1
function thought(c, x, y, s, k, t) {
  const puffs = [[-1.15, 0.2, 0.6], [-0.5, -0.25, 0.8], [0.35, -0.38, 0.9], [1.1, 0.05, 0.66], [0, 0.22, 0.86], [-0.9, 0.42, 0.5], [0.8, 0.45, 0.52]];
  const lite = P.mix('#8a8aa6', '#fffaf0', k), mid = P.mix('#5e5e7e', '#ffe8d0', k), dark = P.mix('#3a3a58', '#f0b8c0', k), r0 = 40 * s;
  c.save(); c.fillStyle = dark; for (const [dx, dy, r] of puffs) { c.beginPath(); c.arc(x + dx * r0, y + dy * r0 + 7 * s, r * r0, 0, 7); c.fill(); }
  for (const [dx, dy, r] of puffs) { const px = x + dx * r0 + Math.sin(t * 1.4 + dx * 3) * 1.5, py = y + dy * r0, rr = r * r0; const g = c.createRadialGradient(px - rr * 0.3, py - rr * 0.45, rr * 0.1, px, py, rr); g.addColorStop(0, lite); g.addColorStop(0.65, mid); g.addColorStop(1, dark); c.fillStyle = g; c.beginPath(); c.arc(px, py - 2 * s, rr * 0.93, 0, 7); c.fill(); }
  c.restore();
}
function note(c, x, y, s, col, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 2.4; c.lineCap = 'round';
  c.beginPath(); c.ellipse(0, 0, 6, 4.4, -0.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(5, -1); c.lineTo(5, -20); c.quadraticCurveTo(12, -14, 13, -8); c.stroke(); c.restore();
}
// the lyre: two curved horn arms, a crossbar, a wooden sound box and four strings
function lyre(c, s, t) {
  const x = LYRE.x, top = LYRE.top, bot = LYRE.bot, L = STR[0] - 20, R = STR[3] + 20;
  c.save(); c.fillStyle = 'rgba(30,10,30,0.3)'; c.beginPath(); c.ellipse(x, bot + 18, 96, 10, 0, 0, 7); c.fill();
  c.lineCap = 'round';
  for (const [ax, dir] of [[L, -1], [R, 1]]) { c.strokeStyle = '#4a2a10'; c.lineWidth = 15; c.beginPath(); c.moveTo(ax - dir * 6, bot); c.bezierCurveTo(ax + dir * 34, bot - 50, ax + dir * 30, top + 24, ax + dir * 8, top - 24); c.stroke();
    const ag = c.createLinearGradient(ax - 20, top, ax + 20, bot); ag.addColorStop(0, '#e2a860'); ag.addColorStop(1, '#8a5424'); c.strokeStyle = ag; c.lineWidth = 11; c.stroke();
    c.strokeStyle = 'rgba(255,240,200,0.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(ax - dir * 6 - 2, bot - 4); c.bezierCurveTo(ax + dir * 34 - 3, bot - 50, ax + dir * 30 - 3, top + 24, ax + dir * 8 - 2, top - 22); c.stroke();
    c.fillStyle = '#f2c94c'; c.beginPath(); c.arc(ax + dir * 8, top - 24, 6, 0, 7); c.fill(); }
  // crossbar
  const cb = c.createLinearGradient(0, top - 12, 0, top + 4); cb.addColorStop(0, '#d89a50'); cb.addColorStop(1, '#7a4418'); c.fillStyle = cb; c.strokeStyle = '#4a2a10'; c.lineWidth = 2; roundRect(c, L - 18, top - 14, R - L + 36, 14, 7); c.fill(); c.stroke();
  c.fillStyle = '#f6d36a'; for (const sx of STR) { c.beginPath(); c.arc(sx, top - 7, 3.2, 0, 7); c.fill(); }
  // sound box
  const sb = c.createLinearGradient(0, bot - 10, 0, bot + 22); sb.addColorStop(0, '#c88a48'); sb.addColorStop(1, '#6a3a18'); c.fillStyle = sb; roundRect(c, L - 16, bot - 12, R - L + 32, 32, 12); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,240,200,0.3)'; roundRect(c, L - 10, bot - 9, R - L + 20, 6, 3); c.fill();
  c.fillStyle = '#3a1c0c'; c.beginPath(); c.ellipse(x, bot + 5, 18, 7, 0, 0, 7); c.fill();
  c.strokeStyle = '#f2c94c'; c.lineWidth = 1.5; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(L - 4 + i * (R - L + 8) / 8, bot + 13, 2, 0, 7); c.stroke(); }
  c.restore();
}

MG.add({
  id: 'harp', stage: 'brave', cmd: 'HARP!', hint: 'tap', time: 6, mood: 'bright', winText: 'Peace!',
  card: { title: 'David plays for Saul', ref: '1 Samuel 16:14–23', kind: 'Story', text: 'The first book of Samuel tells how King Saul often felt troubled and afraid. A young shepherd named David came to play the lyre for him. The music calmed Saul and helped him feel better.', ask: 'What helps you feel calm when you are upset? How could you help someone else feel calm?' },
  init(g) {
    const s = g.s; s.need = [3, 4, 5][g.level]; s.good = 0; s.calm = 0;
    s.pat = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]; s.idx = 0;
    s.win = [1.5, 1.15, 0.95][g.level] / g.speed; s.gap = 0.34 / g.speed;
    s.cur = null; s.nextAt = 0.55; s.pluck = STR.map(() => -9); s.notes = []; s.winT = -1; s.motes = Array.from({ length: 16 }, () => ({ x: Math.random() * W, y: 200 + Math.random() * 380, ph: Math.random() * 6 }));
  },
  update(g, dt) {
    const s = g.s;
    s.calm += (s.good / s.need - s.calm) * Math.min(1, dt * 5);
    if (g.done) return;
    if (s.cur && g.t - s.cur.t > s.win) { s.cur = null; s.nextAt = g.t + s.gap; }
    if (!s.cur && g.t >= s.nextAt) { s.cur = { i: s.pat[s.idx % s.pat.length], t: g.t }; s.idx++; }
  },
  down(g, x, y) {
    const s = g.s; if (y < LYRE.top - 30 || y > LYRE.bot + 24) { g.sfx('tap'); return; }
    let si = 0, bd = 999; STR.forEach((sx, i) => { const d = Math.abs(x - sx); if (d < bd) { bd = d; si = i; } });
    if (bd > 34) { g.sfx('tap'); return; }
    s.pluck[si] = g.t;
    if (s.cur && s.cur.i === si) {
      s.good++; s.cur = null; s.nextAt = g.t + s.gap; g.sfx('bell', { pitch: PITCH[si] });
      s.notes.push({ x: STR[si], y: Math.max(LYRE.top + 10, Math.min(LYRE.bot - 20, y)), t: g.t, col: ['#ffe08a', '#ffc0d8', '#b8f0ff', '#d8c8ff'][si] });
      g.burst(STR[si], y, ['#fff6c0', '#ffd45a', '#ffffff'], 10, 120);
      if (s.good >= s.need) { s.winT = g.t; g.win(); g.sfx('harp'); g.burst(CLOUD.x, CLOUD.y, ['#fff6c0', '#ffd45a', '#ffb0c8', '#ffffff', '#9fe0ff'], 30, 220); }
    } else { g.sfx('tap', { pitch: 0.5 + si * 0.1 }); }
  },
  auto(g, dt, synth) {
    const s = g.s; if (!s.cur || g.t - s.cur.t < 0.25 || s.botFor === s.cur) return; s.botFor = s.cur;
    const x = STR[s.cur.i] + 4; synth('down', x, 512); synth('up', x, 512);
  },
  draw(g, c) {
    const s = g.s, t = g.t, k = s.calm, won = s.winT >= 0;
    c.drawImage(g.bake('brave_harp_bg', o => {
      // a palace room at dusk: a tall arched window, warm plaster walls, columns and tiled floor
      const wall = o.createLinearGradient(0, 0, 0, 470); wall.addColorStop(0, '#3a2440'); wall.addColorStop(0.5, '#6a3c4c'); wall.addColorStop(1, '#a0604c'); o.fillStyle = wall; o.fillRect(0, 0, W, 470);
      // window
      o.save(); o.beginPath(); o.moveTo(110, 410); o.lineTo(110, 150); o.arc(196, 150, 86, Math.PI, 0); o.lineTo(282, 410); o.closePath(); o.clip();
      P.sky(o, W, H, ['#1e2458', '#4a3a7a', '#c0708a', '#ffb878'], { x: 250, y: 360, r: 16, color: '#ffc890', glow: 140 });
      P.stars(o, W, 260, 40, 17, 0);
      P.hills(o, W, 380, 26, '#6a4a6a', '#4a3050', { seed: 3, dabs: 20 });
      for (let i = 0; i < 6; i++) P.house(o, 120 + i * 28, 392 + (i % 2) * 4, 18, 12 + (i % 3) * 4, '#c89a8a', { door: '#4a2a3a', window: i % 2 === 0 });
      o.restore();
      o.strokeStyle = '#d8a870'; o.lineWidth = 8; o.beginPath(); o.moveTo(110, 410); o.lineTo(110, 150); o.arc(196, 150, 86, Math.PI, 0); o.lineTo(282, 410); o.stroke();
      o.strokeStyle = '#7a4a3a'; o.lineWidth = 3; o.beginPath(); o.moveTo(196, 64); o.lineTo(196, 410); o.moveTo(110, 240); o.lineTo(282, 240); o.stroke();
      // curtains
      for (const sx of [-1, 1]) { const cx = 196 + sx * 96; const cg = o.createLinearGradient(cx - 30, 0, cx + 30, 0); cg.addColorStop(0, '#5a1a3a'); cg.addColorStop(0.5, '#a83a5a'); cg.addColorStop(1, '#5a1a3a'); o.fillStyle = cg;
        o.beginPath(); o.moveTo(cx - sx * 30, 40); o.quadraticCurveTo(cx - sx * 10, 220, cx - sx * 26, 300); o.quadraticCurveTo(cx + sx * 8, 330, cx + sx * 36, 470); o.lineTo(cx + sx * 60, 470); o.lineTo(cx + sx * 60, 40); o.closePath(); o.fill();
        o.strokeStyle = 'rgba(40,10,30,0.35)'; o.lineWidth = 2; for (let i = 0; i < 4; i++) { o.beginPath(); o.moveTo(cx + sx * (i * 12 - 10), 50); o.quadraticCurveTo(cx + sx * (i * 10), 280, cx + sx * (i * 12 + 14), 470); o.stroke(); }
        o.fillStyle = '#e9b949'; o.fillRect(cx - sx * 30 - 4, 286, sx * 40, 7); }
      o.fillStyle = '#e9b949'; o.fillRect(70, 34, 252, 9); o.fillStyle = '#8a5a2a'; o.fillRect(70, 43, 252, 3);
      // columns at the edges
      for (const cx of [26, 334]) { const cg = o.createLinearGradient(cx - 22, 0, cx + 22, 0); cg.addColorStop(0, '#9a6a5a'); cg.addColorStop(0.4, '#f0d0b0'); cg.addColorStop(1, '#8a5a4a'); o.fillStyle = cg; o.fillRect(cx - 20, 0, 40, 470);
        o.strokeStyle = 'rgba(80,40,30,0.25)'; o.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { o.beginPath(); o.moveTo(cx + i * 7, 0); o.lineTo(cx + i * 7, 460); o.stroke(); }
        o.fillStyle = '#c8987a'; o.fillRect(cx - 26, 452, 52, 18); o.fillStyle = '#e8c4a0'; o.fillRect(cx - 26, 452, 52, 4); }
      // tiled floor in perspective
      const fl = o.createLinearGradient(0, 470, 0, 640); fl.addColorStop(0, '#b8805a'); fl.addColorStop(1, '#6a3a30'); o.fillStyle = fl; o.fillRect(0, 470, W, 170);
      o.strokeStyle = 'rgba(60,30,30,0.3)'; o.lineWidth = 1.2; for (let i = -10; i <= 10; i++) { o.beginPath(); o.moveTo(180 + i * 22, 470); o.lineTo(180 + i * 80, 640); o.stroke(); }
      for (let j = 0; j < 6; j++) { const y = 470 + Math.pow(j / 6, 1.6) * 170; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); }
      // a woven rug under the throne
      o.save(); o.translate(196, 520); o.scale(1, 0.32); const rg = o.createRadialGradient(0, 0, 10, 0, 0, 160); rg.addColorStop(0, '#c84a4a'); rg.addColorStop(0.7, '#8a2a3a'); rg.addColorStop(1, '#5a1a2a'); o.fillStyle = rg; o.beginPath(); o.arc(0, 0, 160, 0, 7); o.fill();
      o.strokeStyle = '#e9b949'; o.lineWidth = 6; o.beginPath(); o.arc(0, 0, 140, 0, 7); o.stroke(); o.lineWidth = 3; o.beginPath(); o.arc(0, 0, 90, 0, 7); o.stroke(); o.restore();
      throne(o, SAUL.x, SAUL.y + 4, 1.25);
    }), 0, 0, W, H);
    // a gray, gloomy hush over the room that lifts as Saul calms
    c.save(); c.fillStyle = `rgba(60,70,110,${0.32 * (1 - k)})`; c.fillRect(0, 0, W, H); c.restore();
    lamp(c, 64, 300, t, k); lamp(c, 296, 300, t, k);
    // Saul on his throne
    const sad = k < 0.34, mid = k < 0.99;
    seated(c, SAUL.x, SAUL.y, SAUL.s, { skin: SK[2], robe: CL.royal, stripe: CL.gold, beard: true, hair: HR[1], head: 'crown', expr: won ? 'laugh' : sad ? 'sad' : mid ? 'happy' : 'happy', arms: won ? 'cheer' : sad ? 'pray' : 'down', t, bounce: won ? 3 : 0.6 });
    // his thought-cloud, stormy gray turning to sunshine
    const cx = CLOUD.x + Math.sin(t * 0.9) * 4, cy = CLOUD.y + Math.sin(t * 1.3) * 3;
    c.save(); c.globalAlpha = 0.85; c.fillStyle = P.mix('#6a6a8a', '#fff6e0', k); for (const [dx, dy, r] of [[-36, 74, 6], [-28, 92, 4]]) { c.beginPath(); c.arc(SAUL.x + dx + 20, cy + dy, r, 0, 7); c.fill(); } c.restore();
    if (k > 0.05) { const sunk = eo((k - 0.05) / 0.95); c.save(); c.globalCompositeOperation = 'lighter'; const sg = c.createRadialGradient(cx + 30, cy - 20, 2, cx + 30, cy - 20, 110 * sunk + 10); sg.addColorStop(0, `rgba(255,220,120,${0.7 * sunk})`); sg.addColorStop(1, 'rgba(255,200,100,0)'); c.fillStyle = sg; c.beginPath(); c.arc(cx + 30, cy - 20, 120, 0, 7); c.fill(); c.restore();
      c.save(); c.translate(cx + 30, cy - 22); c.rotate(t * 0.5); c.fillStyle = `rgba(255,214,90,${sunk})`; for (let i = 0; i < 10; i++) { c.rotate(Math.PI / 5); c.beginPath(); c.moveTo(-4, -28 * sunk); c.lineTo(0, -44 * sunk); c.lineTo(4, -28 * sunk); c.fill(); } c.beginPath(); c.arc(0, 0, 26 * sunk, 0, 7); c.fill(); c.restore(); }
    if (won) { const q = eo((t - s.winT) / 0.6); c.save(); c.globalAlpha = q * 0.7; c.lineWidth = 6; ['#ff6a6a', '#ffb04a', '#ffe060', '#6ad08a', '#6ab0f0', '#a87ae0'].forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(cx, cy + 90, 120 - i * 6, Math.PI * 1.08, Math.PI * (1.08 + 0.84 * q)); c.stroke(); }); c.restore(); }
    thought(c, cx, cy, 1.25, k, t);
    if (k < 0.8) { c.save(); c.globalAlpha = 1 - k / 0.8; c.strokeStyle = 'rgba(190,200,240,0.7)'; c.lineWidth = 1.4; c.lineCap = 'round'; for (let i = 0; i < 8; i++) { const rx = cx - 40 + i * 11, ry = cy + 30 + ((t * 90 + i * 23) % 40); c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 2, ry + 7); c.stroke(); }
      if (Math.sin(t * 3.1) > 0.85) { c.strokeStyle = '#fff6a0'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx - 6, cy + 18); c.lineTo(cx + 2, cy + 30); c.lineTo(cx - 4, cy + 32); c.lineTo(cx + 6, cy + 46); c.stroke(); }
      c.restore(); }
    // David, the shepherd boy, sitting by the lyre
    P.person(c, 64, 606, 1.4, { skin: SK[2], robe: CL.sky, stripe: CL.white, sash: CL.brown, hairStyle: 'curly', hair: HR[2], child: true, expr: won ? 'laugh' : 'happy', arms: 'reach', t, phase: 1, bounce: 1.5 });
    lyre(c, 1, t);
    // strings: the one to play glows and a shrinking ring shows the beat
    STR.forEach((sx, i) => {
      const lit = s.cur && s.cur.i === i, pq = (t - s.pluck[i]) / 0.5, wob = pq < 1 ? Math.sin(pq * 40) * 5 * (1 - pq) : 0;
      if (lit) { const a = (t - s.cur.t) / s.win; c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createLinearGradient(sx - 26, 0, sx + 26, 0); gl.addColorStop(0, 'rgba(255,220,120,0)'); gl.addColorStop(0.5, `rgba(255,220,120,${0.6 + 0.3 * Math.sin(t * 14)})`); gl.addColorStop(1, 'rgba(255,220,120,0)'); c.fillStyle = gl; c.fillRect(sx - 26, LYRE.top, 52, LYRE.bot - LYRE.top - 10); c.restore();
        c.save(); c.strokeStyle = `rgba(255,246,200,${0.9 - a * 0.4})`; c.lineWidth = 3; c.beginPath(); c.arc(sx, 512, 44 - 26 * Math.min(1, a * 1.4), 0, 7); c.stroke(); c.restore();
        note(c, sx + 2, LYRE.top - 30 + Math.sin(t * 8) * 3, 0.9, '#fff6c0'); }
      c.strokeStyle = lit ? '#fffbe0' : '#f0e0c0'; c.lineWidth = lit ? 3.4 : 2; c.beginPath(); c.moveTo(sx, LYRE.top); c.quadraticCurveTo(sx + wob, (LYRE.top + LYRE.bot) / 2, sx, LYRE.bot - 10); c.stroke();
    });
    // notes float up to the cloud and brighten it
    for (const n of s.notes) { const q = (t - n.t) / 0.9; if (q > 1) continue; const x = n.x + (cx - n.x) * eo(q) + Math.sin(q * 9) * 12, y = n.y + (cy + 20 - n.y) * eo(q); c.save(); c.globalAlpha = q > 0.8 ? (1 - q) * 5 : 1; c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = P.rgba(n.col, 0.4); c.beginPath(); c.arc(x, y - 6, 16, 0, 7); c.fill(); c.restore(); note(c, x, y, 1.3, n.col, Math.sin(q * 6) * 0.3); c.restore(); }
    // dust motes in the lamplight
    c.save(); c.globalCompositeOperation = 'lighter'; for (const m of s.motes) { c.fillStyle = `rgba(255,220,160,${0.2 + 0.2 * Math.sin(t * 2 + m.ph)})`; c.beginPath(); c.arc(m.x + Math.sin(t * 0.7 + m.ph) * 10, m.y - ((t * 8 + m.ph * 30) % 60), 1.4, 0, 7); c.fill(); } c.restore();
    P.vignette(c, W, H, 0.38); P.grain(c, W, H, 0.06);
  },
});
