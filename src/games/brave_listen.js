// LISTEN! — 1 Kings 19:11–12. On the mountain Elijah waits for God. A mighty wind, an earthquake and a fire rush past,
// but God is not in them. Then comes a gentle whisper. Wait, and tap only when the soft shimmer of the whisper appears.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const ELI = { x: 104, y: 520, s: 1.35 };
const CAVE = { x: 96, y: 528 };
const SPOT = { x: 220, y: 380 };   // where the whisper shimmers
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
function cur(g) { for (const e of g.s.ev) if (g.t >= e.t0 && g.t < e.t1) return e; return null; }
const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

// the timeline: each loud event has a start and length; the whisper comes after them
function plan(level, speed) {
  const L = [0.8, 0.7, 0.62][level] / Math.sqrt(speed), gap = 0.12 / speed;
  const kinds = ['wind', 'quake', 'fire'];
  const out = []; let t = 0.35;
  for (const k of kinds) { out.push({ k, t0: t, t1: t + L }); t += L + gap; }
  if (level === 2) { const fake = { k: 'wind', t0: t, t1: t + L * 0.6 }; out.push(fake); t += L * 0.6 + gap; }
  return { ev: out, whisper: t + 0.05 };
}

MG.add({
  id: 'listen', stage: 'brave', cmd: 'LISTEN!', hint: 'tap', time: 5.5, mood: 'storm', winText: 'Shh...',
  card: { title: 'A gentle whisper', ref: '1 Kings 19:9–13', kind: 'Story', text: 'The first book of Kings tells how the prophet Elijah, tired and afraid, hid in a cave on a mountain. A great wind, an earthquake and a fire rushed past, but God was not in them. Then Elijah heard a gentle whisper and knew God was there.', ask: 'When is it hard for you to be quiet? Where could you find a quiet moment to listen this week?' },
  init(g) {
    const s = g.s, p = plan(g.level, g.speed); s.ev = p.ev; s.wt = p.whisper; s.heard = -1; s.wrong = [];
    s.leaves = Array.from({ length: 26 }, () => ({ x: Math.random() * W, y: 120 + Math.random() * 400, ph: Math.random() * 6, col: ['#8ab04a', '#c8a040', '#e07a3a', '#6a9a3a'][Math.floor(Math.random() * 4)] }));
    s.rocks = Array.from({ length: 7 }, (_, i) => ({ x: 170 + i * 26 + Math.random() * 10, y: 470 + Math.random() * 30, r: 5 + Math.random() * 6, ph: Math.random() * 6 }));
  },
  update(g, dt) {
    const s = g.s;
    for (const e of s.ev) { if (!e.played && g.t >= e.t0) { e.played = true; g.sfx(e.k === 'wind' ? 'wind' : e.k === 'quake' ? 'rumble' : 'fire'); if (e.k === 'quake') g.shake(7, (e.t1 - e.t0) * 0.85); } }
    if (!s.wPlayed && g.t >= s.wt) { s.wPlayed = true; g.sfx('magic', { pitch: 0.7 }); }
  },
  down(g, x, y) {
    const s = g.s;
    if (g.t >= s.wt) { s.heard = g.t; g.win(); g.sfx('harp'); g.burst(SPOT.x, SPOT.y, ['#fff6e0', '#d8f0ff', '#ffe8a8', '#ffffff'], 24, 140); return; }
    // tapping too early: the noise is not where God is
    s.wrong.push({ x, y, t: g.t }); g.sfx('wrong');
    if (g.level === 2) { g.fail(); return; }
    g.shake(4, 0.2);
    if (g.level === 1) g.dur = Math.max(s.wt + 1.1, g.dur - 0.5);   // level 1: a wrong tap costs a little time
  },
  auto(g, dt, synth) { const s = g.s; if (!s.botDone && g.t > s.wt + 0.3) { s.botDone = 1; synth('down', SPOT.x, SPOT.y); synth('up', SPOT.x, SPOT.y); } },
  draw(g, c) {
    const s = g.s, t = g.t, e = cur(g), won = s.heard >= 0;
    const intensity = e ? Math.sin(Math.PI * (t - e.t0) / (e.t1 - e.t0)) : 0;
    const calm = sm(s.wt - 0.15, s.wt + 0.5, t);
    c.drawImage(g.bake('brave_listen_bg', o => {
      // twilight over Mount Horeb: violet sky, a lone bright star, layered ridges falling away
      P.sky(o, W, H, ['#16183e', '#3a2f6a', '#8a5a8a', '#e09a8a', '#f6c48a'], { x: 300, y: 330, r: 14, color: '#ffd0a0', glow: 160 });
      P.stars(o, W, 260, 70, 5, 0);
      const mx = 74, my = 96, mgl = o.createRadialGradient(mx, my, 4, mx, my, 90); mgl.addColorStop(0, 'rgba(255,246,220,0.45)'); mgl.addColorStop(1, 'rgba(255,240,220,0)'); o.fillStyle = mgl; o.fillRect(0, 0, 200, 200);
      const md = o.createRadialGradient(mx - 5, my - 5, 2, mx, my, 16); md.addColorStop(0, '#fffbea'); md.addColorStop(1, '#f0dcc0'); o.fillStyle = md; o.beginPath(); o.arc(mx, my, 16, 0, 7); o.fill(); o.fillStyle = 'rgba(200,170,160,0.35)'; for (const [dx, dy, r] of [[-4, 3, 3.5], [5, -4, 2.5], [4, 6, 2]]) { o.beginPath(); o.arc(mx + dx, my + dy, r, 0, 7); o.fill(); }
      for (const [cx, cy, w] of [[250, 120, 90], [120, 210, 120], [300, 280, 70]]) { const cg2 = o.createLinearGradient(0, cy - 8, 0, cy + 8); cg2.addColorStop(0, 'rgba(255,190,190,0.0)'); cg2.addColorStop(0.5, 'rgba(240,160,170,0.35)'); cg2.addColorStop(1, 'rgba(120,80,140,0)'); o.fillStyle = cg2; o.beginPath(); o.ellipse(cx, cy, w, 7, 0, 0, 7); o.fill(); }
      P.hills(o, W, 330, 40, '#7a5a8a', '#5a4070', { seed: 4, freq: 0.01, dabs: 30, bottom: 640 });
      P.hills(o, W, 370, 60, '#5a4472', '#3e2e58', { seed: 8, freq: 0.014, dabs: 40, bottom: 640 });
      // the mountain itself, rising on the right
      o.save(); o.beginPath(); o.moveTo(-10, 640); o.lineTo(-10, 470); o.quadraticCurveTo(120, 420, 210, 300); o.quadraticCurveTo(250, 240, 290, 220); o.quadraticCurveTo(330, 210, 370, 240); o.lineTo(370, 640); o.closePath();
      const mg = o.createLinearGradient(0, 220, 0, 640); mg.addColorStop(0, '#a87a7a'); mg.addColorStop(0.5, '#7a5468'); mg.addColorStop(1, '#4a3048'); o.fillStyle = mg; o.fill(); o.clip();
      const r = P.rng(9); for (let i = 0; i < 90; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#c8908a' : '#3a2440', 0.12 + r() * 0.1); o.beginPath(); o.ellipse(r() * W, 220 + r() * 420, 8 + r() * 20, 3 + r() * 5, -0.5 + r() * 0.3, 0, 7); o.fill(); }
      o.strokeStyle = 'rgba(255,210,180,0.35)'; o.lineWidth = 3; o.beginPath(); o.moveTo(150, 380); o.quadraticCurveTo(210, 300, 290, 222); o.quadraticCurveTo(330, 212, 370, 240); o.stroke();
      o.restore();
      // the ledge Elijah stands on, in front of his cave
      o.save(); o.beginPath(); o.moveTo(-10, 640); o.lineTo(-10, 520); o.quadraticCurveTo(90, 500, 200, 528); o.quadraticCurveTo(300, 548, 370, 540); o.lineTo(370, 640); o.closePath();
      const lg = o.createLinearGradient(0, 500, 0, 640); lg.addColorStop(0, '#8a6a6a'); lg.addColorStop(1, '#3a2638'); o.fillStyle = lg; o.fill(); o.clip();
      const r2 = P.rng(13); for (let i = 0; i < 60; i++) { o.fillStyle = P.rgba(r2() < 0.5 ? '#b08a80' : '#2a1830', 0.15); o.beginPath(); o.ellipse(r2() * W, 510 + r2() * 130, 10 + r2() * 20, 3 + r2() * 4, 0, 0, 7); o.fill(); }
      o.restore();
      o.strokeStyle = 'rgba(255,220,190,0.4)'; o.lineWidth = 2.5; o.beginPath(); o.moveTo(-10, 521); o.quadraticCurveTo(90, 501, 200, 529); o.quadraticCurveTo(300, 549, 370, 541); o.stroke();
      // the cave mouth behind Elijah
      o.save(); o.translate(CAVE.x - 40, CAVE.y - 2); const cg = o.createRadialGradient(0, -40, 4, 0, -30, 70); cg.addColorStop(0, '#120a1c'); cg.addColorStop(1, '#3a2440'); o.fillStyle = cg;
      o.beginPath(); o.moveTo(-60, 0); o.quadraticCurveTo(-62, -96, 0, -104); o.quadraticCurveTo(58, -96, 56, 0); o.closePath(); o.fill();
      o.strokeStyle = '#9a7472'; o.lineWidth = 5; o.stroke(); o.restore();
      // a broom tree leaning over the ledge, and boulders along the path up the mountain
      o.save(); o.translate(332, 552); o.strokeStyle = '#4a3020'; o.lineWidth = 6; o.lineCap = 'round'; o.beginPath(); o.moveTo(0, 0); o.quadraticCurveTo(-6, -40, -30, -76); o.moveTo(-8, -36); o.quadraticCurveTo(10, -60, 14, -86); o.stroke();
      for (const [bx, by] of [[-34, -80], [-18, -92], [2, -98], [16, -88], [-44, -66], [24, -74]]) { for (let i = 0; i < 8; i++) { o.strokeStyle = i % 2 ? '#7a9a5a' : '#94b468'; o.lineWidth = 1.6; o.beginPath(); o.moveTo(bx, by); o.quadraticCurveTo(bx + (i - 4) * 3, by + 8, bx + (i - 4) * 4, by + 22); o.stroke(); } o.fillStyle = '#f4f0e0'; for (let i = 0; i < 4; i++) { o.beginPath(); o.arc(bx + (i - 2) * 4, by + 10 + i * 3, 1.5, 0, 7); o.fill(); } }
      o.restore();
      P.rock(o, 236, 536, 0.9, '#8a6670'); P.rock(o, 268, 546, 0.6, '#8a6670'); P.rock(o, 186, 462, 0.5, '#9a7478');
      // a few scrubby bushes
      for (const [bx, by, bs] of [[300, 556, 0.8], [20, 528, 0.6]]) { o.save(); o.translate(bx, by); o.scale(bs, bs); for (let i = 0; i < 7; i++) { o.fillStyle = i % 2 ? '#5a7a4a' : '#6e8e52'; o.beginPath(); o.arc(-14 + i * 5, -10 - Math.sin(i) * 6, 10, 0, 7); o.fill(); } o.restore(); }
    }), 0, 0, W, H);
    // a hushed, silvery wash once the noise stops
    if (calm > 0) { c.save(); c.globalAlpha = calm * 0.35; const hush = c.createRadialGradient(SPOT.x, SPOT.y, 10, SPOT.x, SPOT.y, 420); hush.addColorStop(0, '#fff4e0'); hush.addColorStop(1, 'rgba(160,170,230,0)'); c.fillStyle = hush; c.fillRect(0, 0, W, H); c.restore(); }
    // ---- the loud things that are not God ----
    for (const ev of s.ev) {
      const q = (t - ev.t0) / (ev.t1 - ev.t0); if (q < -0.05 || q > 1.15) continue; const k = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, q))));
      if (ev.k === 'wind') {
        c.save(); c.lineCap = 'round';
        for (let i = 0; i < 14; i++) { const y = 140 + i * 30 + Math.sin(i * 2.3) * 10, x = -200 + ((q * 900 + i * 97) % 700), len = 70 + (i % 4) * 30;
          c.strokeStyle = `rgba(230,236,255,${0.55 * k})`; c.lineWidth = 2.4 + (i % 3); c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + len * 0.3, y - 10, x + len * 0.6, y + 10, x + len, y - 4); c.stroke();
          if (i % 4 === 0) { c.beginPath(); c.arc(x + len + 8, y - 12, 10, Math.PI * 0.6, Math.PI * 2.2); c.stroke(); } }
        for (const l of s.leaves) { const x = (l.x + q * 700) % (W + 40) - 20, y = l.y + Math.sin(q * 12 + l.ph) * 20; c.save(); c.globalAlpha = k; c.translate(x, y); c.rotate(q * 20 + l.ph); c.fillStyle = l.col; c.beginPath(); c.ellipse(0, 0, 5, 2.4, 0, 0, 7); c.fill(); c.restore(); }
        c.restore();
      } else if (ev.k === 'quake') {
        c.save(); c.strokeStyle = `rgba(40,20,30,${0.7 * k})`; c.lineWidth = 2.5; c.lineJoin = 'round'; c.beginPath(); c.moveTo(150, 540); c.lineTo(178, 558); c.lineTo(170, 576); c.lineTo(204, 596); c.lineTo(196, 620); c.stroke();
        c.beginPath(); c.moveTo(250, 548); c.lineTo(236, 566); c.lineTo(262, 586); c.stroke(); c.restore();
        for (const rk of s.rocks) { const b = Math.abs(Math.sin(q * 22 + rk.ph)) * 26 * k; c.save(); c.globalAlpha = Math.min(1, k * 1.5); P.rock(c, rk.x, rk.y + 50 - b, rk.r / 12, '#a07a72'); c.restore(); }
        c.save(); c.globalAlpha = 0.5 * k; c.fillStyle = '#c8a090'; for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(140 + i * 22, 548 - Math.abs(Math.sin(q * 15 + i)) * 20, 7 + (i % 3) * 3, 0, 7); c.fill(); } c.restore();
      } else if (ev.k === 'fire') {
        // a blaze sweeps up along the far ridge line and away, well clear of Elijah
        c.save(); c.globalCompositeOperation = 'lighter';
        const front = q * 1.6 - 0.1, ridge = u => [150 + u * 210, 380 - u * 158 + (u > 0.67 ? (u - 0.67) * 90 : 0)];
        for (let i = 0; i < 26; i++) { const u = i / 25, life = Math.max(0, Math.min(1, (front - u) * 3)) * Math.max(0, Math.min(1, (u + 0.5 - front) * 3)); if (life <= 0) continue;
          const [fx, base] = ridge(u), h = (46 + Math.sin(t * 17 + i * 1.7) * 14 + (i % 3) * 12) * life;
          const gl = c.createRadialGradient(fx, base - h * 0.3, 2, fx, base - h * 0.3, 46); gl.addColorStop(0, `rgba(255,150,60,${0.35 * life})`); gl.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = gl; c.beginPath(); c.arc(fx, base - h * 0.3, 46, 0, 7); c.fill();
          const fg = c.createLinearGradient(0, base, 0, base - h); fg.addColorStop(0, 'rgba(255,90,30,0.9)'); fg.addColorStop(0.5, 'rgba(255,170,50,0.85)'); fg.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = fg;
          c.beginPath(); c.moveTo(fx - 11, base + 2); c.quadraticCurveTo(fx - 11, base - h * 0.6, fx + Math.sin(t * 13 + i) * 4, base - h); c.quadraticCurveTo(fx + 11, base - h * 0.6, fx + 11, base + 2); c.closePath(); c.fill(); }
        for (let i = 0; i < 16; i++) { const a = (t * 1.6 + i * 0.37) % 1, [ex, ey] = ridge(Math.min(1, Math.max(0, front - 0.2 - (i % 5) * 0.05))); c.fillStyle = `rgba(255,220,120,${(1 - a) * k})`; c.beginPath(); c.arc(ex + Math.sin(t * 5 + i) * 14, ey - 20 - a * 90, 1.8, 0, 7); c.fill(); }
        c.restore();
      }
    }
    // ---- the gentle whisper: a soft, slow shimmer that drifts down the mountain ----
    if (t > s.wt - 0.1) {
      const q = Math.min(1, (t - s.wt + 0.1) / 0.6), br = won ? 1 + eo((t - s.heard) / 0.5) * 0.8 : 1, pulse = 0.85 + 0.15 * Math.sin(t * 3);
      c.save(); c.globalCompositeOperation = 'lighter';
      const gl = c.createRadialGradient(SPOT.x, SPOT.y, 2, SPOT.x, SPOT.y, 90 * br * pulse); gl.addColorStop(0, `rgba(255,248,225,${0.75 * q})`); gl.addColorStop(0.4, `rgba(210,225,255,${0.32 * q})`); gl.addColorStop(1, 'rgba(180,200,255,0)'); c.fillStyle = gl; c.beginPath(); c.arc(SPOT.x, SPOT.y, 92 * br, 0, 7); c.fill();
      // soft ribbons of air curling gently
      c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const a = t * 0.9 + i * Math.PI / 2, r = 26 + i * 6 + Math.sin(t * 1.3 + i) * 4; c.strokeStyle = `rgba(255,250,235,${0.45 * q})`; c.lineWidth = 2; c.beginPath(); c.arc(SPOT.x, SPOT.y, r * br, a, a + 1.4); c.stroke(); }
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * 0.5, rr = 34 + Math.sin(t * 2 + i * 1.7) * 14; c.fillStyle = `rgba(255,252,240,${(0.5 + 0.5 * Math.sin(t * 4 + i)) * q})`; c.beginPath(); c.arc(SPOT.x + Math.cos(a) * rr * br, SPOT.y + Math.sin(a) * rr * 0.8 * br, 1.8, 0, 7); c.fill(); }
      c.restore();
      if (!won) { c.save(); c.globalAlpha = q * (0.6 + 0.4 * Math.sin(t * 4)); c.fillStyle = '#fffbea'; drawStar(c, SPOT.x, SPOT.y, 8, t * 0.4); c.restore(); }
    }
    // Elijah: wrapped in his cloak at the cave mouth; he peeks out once it is quiet
    const peek = won ? 'laugh' : calm > 0.3 ? 'wow' : e ? 'surprised' : 'happy';
    const lean = e && e.k === 'wind' ? Math.sin(t * 20) * 1.5 + 3 * intensity : 0;
    P.person(c, ELI.x + lean, ELI.y, ELI.s, { skin: SK[3], robe: '#8a6a44', stripe: CL.sand, sash: '#5e4428', beard: true, hair: HR[1], hairStyle: 'curly', expr: peek, arms: won ? 'pray' : calm > 0.3 ? 'reach' : 'hold', t, bounce: e ? 0.4 : 1, facing: 1 });
    // a hand-to-ear sign when it is quiet: "listen"
    if (calm > 0.3 && !won) { c.save(); c.globalAlpha = calm; c.strokeStyle = '#fff6e0'; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(ELI.x + 28, ELI.y - 82, 8 + i * 7, -0.6, 0.6); c.stroke(); } c.restore(); }
    // early taps: a little puff and a "shh"
    for (const w of s.wrong) { const q = (t - w.t) / 0.5; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.fillStyle = '#e8d8f0'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(w.x + Math.cos(i * 1.3) * q * 22, w.y + Math.sin(i * 1.3) * q * 12, 6 * (1 - q * 0.5), 0, 7); c.fill(); } c.restore(); }
    P.vignette(c, W, H, 0.35 - calm * 0.12); P.grain(c, W, H, 0.06);
  },
});
