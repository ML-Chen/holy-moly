// LAUGH! — at the oaks of Mamre, old Sarah overhears the visitors say she will have a baby, and she laughs (Genesis 18:12; 21:6).
// Tap (tickle) Sarah fast to make her giggle harder until she bursts out laughing with joy.
const SX = 96, SY = 580, SS = 2.3; // Sarah's feet and scale
function oak(o, x, y, s) {
  o.save(); o.translate(x, y); o.scale(s, s);
  o.fillStyle = 'rgba(70,50,30,0.28)'; o.beginPath(); o.ellipse(0, 4, 120, 18, 0, 0, 7); o.fill();
  // gnarled trunk with two big limbs
  const tg = o.createLinearGradient(-20, 0, 24, 0); tg.addColorStop(0, '#5a3a24'); tg.addColorStop(0.45, '#8a6040'); tg.addColorStop(1, '#4a2e1c'); o.fillStyle = tg;
  o.beginPath(); o.moveTo(-24, 4); o.quadraticCurveTo(-12, -40, -16, -96); o.quadraticCurveTo(-44, -120, -78, -132); o.lineTo(-72, -140); o.quadraticCurveTo(-36, -134, -6, -112); o.quadraticCurveTo(-2, -150, -14, -176); o.lineTo(0, -178); o.quadraticCurveTo(14, -146, 10, -112); o.quadraticCurveTo(46, -138, 86, -138); o.lineTo(88, -130); o.quadraticCurveTo(46, -120, 18, -94); o.quadraticCurveTo(14, -40, 28, 4); o.closePath(); o.fill();
  o.strokeStyle = 'rgba(40,24,14,0.5)'; o.lineWidth = 1.5; for (let i = 0; i < 4; i++) { o.beginPath(); o.moveTo(-10 + i * 7, 0); o.quadraticCurveTo(-6 + i * 5, -50, -4 + i * 4, -96); o.stroke(); }
  // canopy: dark back layer, mid layer, sunlit top layer
  const r = P.rng(18), blobs = [];
  for (let i = 0; i < 34; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()); blobs.push([Math.cos(a) * d * 130, -176 + Math.sin(a) * d * 62, 22 + r() * 20]); }
  for (const [bx, by, br] of blobs) { o.fillStyle = '#2f4a2c'; o.beginPath(); o.arc(bx + 4, by + 10, br, 0, 7); o.fill(); }
  for (const [bx, by, br] of blobs) { const g = o.createRadialGradient(bx - br * 0.4, by - br * 0.6, 2, bx, by, br); g.addColorStop(0, '#9ac25a'); g.addColorStop(0.55, '#5f8f3e'); g.addColorStop(1, '#3d6634'); o.fillStyle = g; o.beginPath(); o.arc(bx, by, br * 0.92, 0, 7); o.fill(); }
  for (let i = 0; i < 60; i++) { const bx = (r() - 0.5) * 230, by = -200 + (r() - 0.6) * 90; o.fillStyle = P.rgba(r() < 0.5 ? '#c8e07a' : '#e8f0a0', 0.25 + r() * 0.3); o.beginPath(); o.ellipse(bx, by, 5 + r() * 7, 3 + r() * 3, r() * 3, 0, 7); o.fill(); }
  o.restore();
}
function bigTent(o, part) {
  // Sarah's tent: a striped goat-hair canopy on poles, front open, flaps tied back; she stands in the doorway
  o.save(); o.translate(0, 596); o.scale(0.84, 0.84); o.translate(0, -596);
  const L = 22, R = 206, top = 372, base = 596;
  const canopy = () => { o.beginPath(); o.moveTo(-40, 420); o.quadraticCurveTo(-10, 360, 40, 330); o.quadraticCurveTo(70, 312, 114, 304); o.quadraticCurveTo(160, 312, 190, 332); o.quadraticCurveTo(236, 360, 262, 418);
    for (let k = 0; k <= 12; k++) { const x = 262 - k * 302 / 12, y = 418 - (k / 12) * 2 + Math.sin(k * 1.3) * 2; o.quadraticCurveTo(x + 12.5, y + 13, x, y); } o.closePath(); };
  if (part === 'body') {
    o.fillStyle = 'rgba(70,40,30,0.32)'; o.beginPath(); o.ellipse(110, base + 2, 160, 14, 0, 0, 7); o.fill();
    // side walls slanting out to the ground
    for (const [a, b, c2] of [[[-40, 420], [L, top + 40], [-6, base]], [[262, 418], [R, top + 40], [236, base]]]) { o.beginPath(); o.moveTo(...a); o.lineTo(...b); o.lineTo(b[0], base); o.lineTo(...c2); o.closePath(); const wg = o.createLinearGradient(0, 400, 0, base); wg.addColorStop(0, '#5a3a2c'); wg.addColorStop(1, '#3e281e'); o.fillStyle = wg; o.fill(); o.strokeStyle = '#2e1a12'; o.lineWidth = 1.5; o.stroke(); }
    // dark warm interior
    o.beginPath(); o.rect(L, top, R - L, base - top); const dg = o.createLinearGradient(0, top, 0, base); dg.addColorStop(0, '#2a1410'); dg.addColorStop(1, '#5a3020'); o.fillStyle = dg; o.fill();
    const ig = o.createRadialGradient(114, 500, 10, 114, 500, 120); ig.addColorStop(0, 'rgba(255,170,90,0.4)'); ig.addColorStop(1, 'rgba(255,170,90,0)'); o.fillStyle = ig; o.fill();
    // hanging lamp, rug and jars inside
    o.strokeStyle = '#2a1410'; o.lineWidth = 1; o.beginPath(); o.moveTo(64, 410); o.lineTo(64, 440); o.stroke(); o.fillStyle = '#c88a3a'; o.beginPath(); o.ellipse(64, 444, 6, 4, 0, 0, 7); o.fill();
    o.fillStyle = '#9a3a3a'; o.beginPath(); o.ellipse(114, base - 4, 84, 9, 0, 0, 7); o.fill(); o.strokeStyle = '#e8b04a'; o.lineWidth = 2; o.setLineDash([5, 4]); o.beginPath(); o.ellipse(114, base - 4, 76, 6, 0, 0, 7); o.stroke(); o.setLineDash([]);
    for (const [px, ps] of [[44, 1], [186, 0.8]]) { const jg = o.createLinearGradient(px - 12, 0, px + 12, 0); jg.addColorStop(0, '#d88a4a'); jg.addColorStop(1, '#8a4a2a'); o.fillStyle = jg; o.beginPath(); o.ellipse(px, 566, 12 * ps, 17 * ps, 0, 0, 7); o.fill(); o.fillStyle = '#7a3a22'; o.fillRect(px - 5 * ps, 546 - 2 * ps, 10 * ps, 6 * ps); }
    // poles
    o.fillStyle = '#6a4a2e'; o.fillRect(L - 3, 360, 6, base - 360); o.fillRect(R - 3, 360, 6, base - 360);
    // canopy with stripes and a sunlit edge
    canopy(); const cg = o.createLinearGradient(0, 300, 0, 430); cg.addColorStop(0, '#9a6a50'); cg.addColorStop(1, '#5e3c2c'); o.fillStyle = cg; o.fill();
    o.save(); canopy(); o.clip(); for (let k = 0; k < 8; k++) { o.fillStyle = k % 2 ? 'rgba(250,220,170,0.2)' : 'rgba(40,18,12,0.14)'; o.beginPath(); o.ellipse(114, 470, 70 + k * 22, 160 + k * 10, 0, Math.PI, 0); o.ellipse(114, 470, 59 + k * 22, 149 + k * 10, 0, 0, Math.PI, true); o.fill(); }
    const lg = o.createLinearGradient(262, 300, 60, 420); lg.addColorStop(0, 'rgba(255,224,160,0.45)'); lg.addColorStop(0.6, 'rgba(255,224,160,0)'); o.fillStyle = lg; o.fillRect(-40, 290, 320, 160); o.restore();
    o.strokeStyle = '#2e1a12'; o.lineWidth = 2; canopy(); o.stroke();
    // fringe tassels along the valance
    o.fillStyle = '#e8b04a'; for (let k = 1; k < 12; k++) { const x = 262 - k * 302 / 12, y = 418 - (k / 12) * 2 + Math.sin(k * 1.3) * 2; o.beginPath(); o.arc(x, y + 4, 2.4, 0, 7); o.fill(); }
    // guy ropes and pegs
    o.strokeStyle = 'rgba(250,230,200,0.7)'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(-30, 404); o.lineTo(-60, base); o.stroke(); 
  } else {
    // the tied-back door flaps, drawn over Sarah's edges
    for (const [x0, dir] of [[L + 2, 1], [R - 2, -1]]) { const g = o.createLinearGradient(x0, 0, x0 + 30 * dir, 0); g.addColorStop(0, '#7a5240'); g.addColorStop(1, '#a87a5a'); o.fillStyle = g;
      o.beginPath(); o.moveTo(x0, 414); o.quadraticCurveTo(x0 + 34 * dir, 440, x0 + 18 * dir, 486); o.quadraticCurveTo(x0 + 6 * dir, 520, x0 + 22 * dir, base); o.lineTo(x0, base); o.closePath(); o.fill(); o.strokeStyle = '#3a2218'; o.lineWidth = 1.5; o.stroke();
      o.strokeStyle = '#e8b04a'; o.lineWidth = 3; o.beginPath(); o.moveTo(x0, 488); o.quadraticCurveTo(x0 + 10 * dir, 492, x0 + 20 * dir, 486); o.stroke(); }
  }
  o.restore();
}
function paintBg(o) {
  P.sky(o, W, H, ['#6ab4e0', '#a8d8ec', '#ffe8c0', '#ffd8a0'], { x: 270, y: 70, r: 26, color: '#fff2b0', glow: 260 });
  P.cloud(o, 80, 110, 0.7, '#fff8ee', '#e8d0d8', 0.9); P.cloud(o, 300, 170, 0.5, '#fff8ee', '#e8d0d8', 0.8);
  P.hills(o, W, 350, 50, '#a8b890', '#8aa078', { seed: 41, freq: 0.008, dabs: 30 });
  P.hills(o, W, 392, 36, '#b8c070', '#8a9a50', { seed: 43, freq: 0.012, dabs: 60, rim: '#f0f0b0' });
  for (let i = 0; i < 7; i++) P.tree(o, 30 + i * 52, 386 + (i % 2) * 8, 0.32, '#6a8a4a', 60 + i);
  P.hills(o, W, 440, 14, '#d8c080', '#c09a5a', { seed: 47, freq: 0.01, dabs: 140, rim: '#fff0c0' });
  P.rays(o, 270, 70, W, H, '#fff4c8', 0.12, 9, 0);
  oak(o, 278, 470, 0.86);
  P.grassTufts(o, W, 470, 640, 50, '#9aa84a', 5); P.flowers(o, W, 500, 640, 14, ['#f4d35e', '#ffffff', '#ee8aa0'], 6);
  bigTent(o, 'body');
}
// a seated figure: the standing person clipped at the waist; the meal cloth in front hides the rest
function seated(c, x, y, s, o) { c.save(); c.beginPath(); c.rect(x - 40 * s, y - 120 * s, 80 * s, 120 * s); c.clip(); P.person(c, x, y + 20 * s, s, o); c.restore(); }
function spread(o) {
  // a low cloth spread with the meal Abraham served (Genesis 18:8: bread, curds and milk)
  const g = o.createLinearGradient(0, 474, 0, 500); g.addColorStop(0, '#f4e6c8'); g.addColorStop(1, '#d8c098'); o.fillStyle = g;
  o.beginPath(); o.moveTo(206, 478); o.quadraticCurveTo(276, 470, 352, 478); o.lineTo(358, 498); o.quadraticCurveTo(276, 506, 200, 498); o.closePath(); o.fill();
  o.strokeStyle = '#c86a4a'; o.lineWidth = 3; o.beginPath(); o.moveTo(203, 492); o.quadraticCurveTo(276, 500, 355, 492); o.stroke(); o.strokeStyle = '#e8b04a'; o.lineWidth = 1.5; o.beginPath(); o.moveTo(202, 496); o.quadraticCurveTo(276, 504, 356, 496); o.stroke();
  P.basket(o, 252, 484, 0.6, 'bread');
  o.fillStyle = '#b86a3a'; o.beginPath(); o.ellipse(298, 482, 11, 5, 0, 0, 7); o.fill(); o.fillStyle = '#fbf6ea'; o.beginPath(); o.ellipse(298, 480, 9, 3, 0, 0, 7); o.fill();
  o.fillStyle = '#c8783a'; o.beginPath(); o.ellipse(336, 478, 6, 9, 0, 0, 7); o.fill(); o.fillRect(333, 466, 6, 5);
  o.fillStyle = '#7a3a6a'; for (const [gx, gy] of [[276, 484], [280, 481], [273, 480], [277, 477]]) { o.beginPath(); o.arc(gx, gy, 2.6, 0, 7); o.fill(); }
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
function feather(c, x, y, a) {
  c.save(); c.translate(x, y); c.rotate(a);
  const g = c.createLinearGradient(0, -26, 0, 4); g.addColorStop(0, '#fff6ee'); g.addColorStop(1, '#f2b8c8'); c.fillStyle = g; c.strokeStyle = '#c87a90'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(-11, -10, -2, -28); c.quadraticCurveTo(10, -12, 0, 4); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(0, 8); c.lineTo(-1, -24); c.stroke();
  c.strokeStyle = 'rgba(200,120,140,0.5)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-0.6, -4 - i * 4.5); c.lineTo(-6, -8 - i * 4.5); c.moveTo(-0.6, -4 - i * 4.5); c.lineTo(4.5, -8 - i * 4.5); c.stroke(); }
  c.restore();
}
MG.add({
  id: 'laugh', stage: 'family', cmd: 'LAUGH!', hint: 'mash', time: 5, mood: 'bright', winText: 'Ha ha!',
  card: { title: 'Sarah laughs', ref: 'Genesis 18 and 21', kind: 'Story', text: 'Three visitors came to Abraham\'s tent and said that Sarah would have a baby, even though she was very old. Sarah laughed because it sounded impossible, and a year later she held her baby Isaac, whose name means "he laughs."', ask: 'What is something that made your whole family laugh together?' },
  init(g) { const s = g.s; s.need = [6, 9, 12][g.level]; s.gig = 0; s.show = 0; s.hits = []; s.hearts = []; s.feather = null; s.bot = 0; s.burstT = -1; s.misses = []; },
  down(g, x, y) {
    const s = g.s, hy = SY - 70 * SS;
    if (Math.abs(x - SX) < 82 && y > hy - 70 && y < SY + 10) {
      s.gig = Math.min(1, s.gig + 1 / s.need); s.feather = { x, y, t: g.t };
      const n = 1 + Math.floor(s.gig * 3); for (let i = 0; i < n; i++) s.hearts.push({ x: SX + (Math.random() - 0.5) * 80, y: hy + 10, vx: (Math.random() - 0.5) * 60, vy: -80 - Math.random() * 60, t: g.t, r: 5 + Math.random() * 5 + s.gig * 4, col: ['#ff7a9a', '#ffb0c0', '#ffd45a', '#ff9ad8'][i % 4] });
      g.burst(x, y, ['#ffd6e6', '#fff6c0', '#ffffff'], 6, 120); g.sfx(s.gig > 0.6 ? 'boing' : 'pop');
      if (s.gig >= 1) { s.burstT = g.t; g.sfx('laugh'); g.sfx('cheer'); g.burst(SX, hy, ['#ff7a9a', '#ffd45a', '#ffffff', '#9ad8ff'], 30, 260); g.shake(4, 0.3); g.win(); }
      else if (Math.abs(s.gig - 0.5) < 0.5 / s.need) g.sfx('laugh');
    } else { s.misses.push({ x, y, t: g.t }); g.sfx('tap'); }
  },
  update(g, dt) {
    const s = g.s; if (!g.done) s.gig = Math.max(0, s.gig - dt * 0.07);
    s.show += (s.gig - s.show) * Math.min(1, dt * 10);
    for (const h of s.hearts) { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += 30 * dt; h.vx *= 0.98; }
    s.hearts = s.hearts.filter(h => g.t - h.t < 1.4);
  },
  auto(g, dt, synth) { const s = g.s; s.bot += dt; if (g.t > 0.4 && s.bot > 0.13) { s.bot = 0; const x = SX + (Math.random() - 0.5) * 50, y = SY - 90 - Math.random() * 60; synth('down', x, y); synth('up', x, y); } },
  draw(g, c) {
    const s = g.s, t = g.t, gl = s.show, won = g.result === 'win', full = won ? 1 : gl;
    c.drawImage(g.bake('family_laugh_bg', paintBg), 0, 0, W, H);
    c.strokeStyle = 'rgba(70,60,90,0.6)'; c.lineWidth = 1.6; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const bx = (60 + i * 34 + t * 18) % 400 - 20, by = 200 + i * 14 + Math.sin(t * 2 + i) * 4, f = Math.sin(t * 9 + i) * 3; c.beginPath(); c.moveTo(bx - 7, by - f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 7, by - f); c.stroke(); }
    // dappled light shifting under the oak
    c.save(); c.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const x = 200 + i * 24 + Math.sin(t * 0.8 + i) * 6, y = 492 + (i % 3) * 7; c.fillStyle = 'rgba(255,244,190,0.22)'; c.beginPath(); c.ellipse(x, y, 9, 3, 0, 0, 7); c.fill(); } c.restore();
    // Abraham stands by, serving
    P.person(c, 200, 470, 0.85, { skin: P.SKIN[2], robe: P.CLOTH.terracotta, stripe: P.CLOTH.cream, sash: P.CLOTH.gold, beard: '#ece6de', hair: P.HAIR[5], hairStyle: 'short', expr: full > 0.6 ? 'laugh' : 'happy', arms: full > 0.8 ? 'cheer' : 'hold', t, facing: 1, bounce: 0.5 + full });
    // the three visitors under the oak, softly glowing; they smile wider as Sarah laughs
    const vis = [[232, 480, P.SKIN[3], P.CLOTH.white, P.CLOTH.sky, 1], [276, 476, P.SKIN[1], P.CLOTH.cream, P.CLOTH.gold, 1], [320, 480, P.SKIN[2], P.CLOTH.white, P.CLOTH.teal, -1]];
    vis.forEach(([x, y, sk, rb, st, f], i) => {
      c.save(); c.globalCompositeOperation = 'screen'; const hg = c.createRadialGradient(x, y - 50, 2, x, y - 46, 46); hg.addColorStop(0, `rgba(255,246,210,${0.35 + 0.15 * Math.sin(t * 2 + i)})`); hg.addColorStop(1, 'rgba(255,246,210,0)'); c.fillStyle = hg; c.fillRect(x - 50, y - 100, 100, 100); c.restore();
      const ex = full > 0.75 ? 'laugh' : full > 0.25 ? 'happy' : (i === 1 ? 'happy' : 'happy');
      seated(c, x, y, 0.9, { skin: sk, robe: rb, stripe: st, hair: P.HAIR[i], beard: i !== 1 ? true : false, hairStyle: i === 1 ? 'curly' : 'short', head: i === 2 ? 'wrap' : 'none', headCol: P.CLOTH.cream, expr: ex, arms: full > 0.5 && i === 0 ? 'wave' : full > 0.85 ? 'cheer' : 'hold', facing: f, t, phase: i, bounce: 0.4 + full * 1.5 });
    });
    c.drawImage(g.bake('family_laugh_spread', spread), 0, 0, W, H);
    // Sarah: shakes with giggles, then bursts out laughing
    const shake = gl * 3.5 * Math.sin(t * 40) + (won ? Math.sin(t * 30) * 3 : 0), hop = won ? Math.abs(Math.sin(t * 10)) * 8 : Math.abs(Math.sin(t * 14)) * gl * 3;
    const hx = SX, hy = SY - 70 * SS - hop;
    c.save(); c.globalCompositeOperation = 'screen'; const sg = c.createRadialGradient(hx, hy + 30, 10, hx, hy + 30, 110 + 50 * full); sg.addColorStop(0, `rgba(255,200,150,${0.12 + 0.35 * full})`); sg.addColorStop(1, 'rgba(255,200,150,0)'); c.fillStyle = sg; c.fillRect(hx - 170, hy - 140, 340, 340); c.restore();
    c.save(); c.translate(SX + shake, SY - hop); c.rotate(won ? Math.sin(t * 9) * 0.06 : Math.sin(t * 22) * 0.025 * gl);
    P.person(c, 0, 0, SS, { skin: P.SKIN[2], robe: P.CLOTH.plum, stripe: P.CLOTH.gold, hairStyle: 'bun', hair: P.HAIR[5], expr: full > 0.55 ? 'laugh' : full > 0.2 ? 'happy' : 'surprised', arms: won ? 'cheer' : gl > 0.35 ? 'hold' : 'pray', t, bounce: 0 });
    // laugh crinkles at the eyes and smile lines: an older, very happy face
    const fy = -56 * SS, r = 16 * SS; c.strokeStyle = 'rgba(120,60,50,0.45)'; c.lineWidth = 1.6; c.lineCap = 'round';
    for (const sd of [-1, 1]) { const ex = sd * r * 0.37 + r * 0.08; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(ex + sd * r * 0.22, fy + r * 0.12 + k * 3); c.lineTo(ex + sd * r * 0.36, fy + r * 0.12 + k * 5.5); c.stroke(); } }
    c.beginPath(); c.moveTo(-r * 0.32, fy - r * 0.42); c.quadraticCurveTo(0, fy - r * 0.5, r * 0.36, fy - r * 0.42); c.stroke();
    c.restore();
    c.drawImage(g.bake('family_laugh_flaps', o => bigTent(o, 'flaps')), 0, 0, W, H);
    // giggle lines bursting around her head: more and longer as she laughs harder
    const nl = Math.round(3 + full * 9);
    c.save(); c.strokeStyle = '#fff2c0'; c.lineCap = 'round';
    for (let i = 0; i < nl; i++) { const a = -Math.PI + (i + 0.5) / nl * Math.PI, wob = Math.sin(t * 18 + i * 2) * 0.12, r0 = 58 + Math.sin(t * 12 + i) * 4, len = 10 + full * 22; c.lineWidth = 3 + full * 2; c.globalAlpha = 0.35 + 0.65 * Math.max(gl, full * 0.9);
      c.beginPath(); c.moveTo(hx + shake + Math.cos(a + wob) * r0, hy + 4 + Math.sin(a + wob) * r0); c.lineTo(hx + shake + Math.cos(a + wob) * (r0 + len), hy + 4 + Math.sin(a + wob) * (r0 + len)); c.stroke(); }
    c.restore();
    // hearts float up
    for (const h of s.hearts) { const q = (t - h.t) / 1.4; c.save(); c.globalAlpha = 1 - q * q; c.fillStyle = h.col; c.translate(h.x, h.y); c.rotate(Math.sin(t * 5 + h.r) * 0.3); heart(c, 0, 0, h.r * (q < 0.15 ? q / 0.15 : 1)); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(-h.r * 0.45, -h.r * 0.35, h.r * 0.22, 0, 7); c.fill(); c.restore(); }
    // a big heart blooms over everyone when she bursts out laughing
    if (won) { const q = Math.min(1, (t - g.doneAt) * 2.5); c.save(); c.globalAlpha = 0.85 * q; c.fillStyle = '#ff8aa8'; heart(c, hx + 40, hy - 70 - q * 20, 10 + q * 22); c.restore(); for (let i = 0; i < 8; i++) { const a = t * 2 + i * 0.785, rr = 70 + q * 40; c.fillStyle = ['#ffd45a', '#fff', '#ff9ad8'][i % 3]; drawStar(c, hx + Math.cos(a) * rr, hy + Math.sin(a) * rr * 0.7, 5, a); } }
    // the tickle feather wiggles where you tapped
    if (s.feather && t - s.feather.t < 0.45) { const q = (t - s.feather.t) / 0.45; c.save(); c.globalAlpha = 1 - q * q; feather(c, s.feather.x + 6, s.feather.y + 4, -0.5 + Math.sin(t * 40) * 0.5); c.restore(); }
    // an inviting sparkle on Sarah before the first tap
    if (gl < 0.02 && !g.done) { const p = 0.5 + 0.5 * Math.sin(t * 6); c.save(); c.globalAlpha = 0.5 + 0.5 * p; c.fillStyle = '#fff6c8'; drawStar(c, hx + 44, hy - 30, 6 + p * 4, t); drawStar(c, hx - 46, hy + 20, 4 + p * 3, -t); c.restore(); }
    for (const m of s.misses) { const q = (t - m.t) / 0.35; if (q < 0 || q > 1) continue; c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(m.x, m.y, 6 + q * 14, 0, 7); c.stroke(); }
    P.vignette(c, W, H, 0.22, '#5a2a30'); P.grain(c, W, H, 0.05);
  },
});
