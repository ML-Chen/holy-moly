// FOLLOW! — Matthew 2:1–11. Wise men on camels follow the bright star across the night desert to Bethlehem.
// Drag the star and the caravan walks beneath it; lead them to the little glowing house. At higher levels,
// lead gently: if the star runs too far ahead, the caravan stops and looks around for it.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const PATH_Y = 548;
const MAGI = [
  { skin: SK[4], robe: CL.royal, stripe: CL.gold, beard: true, hair: HR[0], head: 'crown', gift: 'gold' },
  { skin: SK[1], robe: CL.teal, stripe: CL.saffron, beard: '#d8d0c4', hair: HR[5], head: 'wrap', headCol: CL.saffron, gift: 'jar' },
  { skin: SK[5], robe: CL.red, stripe: CL.gold, hair: HR[3], head: 'wrap', headCol: CL.white, gift: 'box' },
];
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
const pathY = x => PATH_Y - Math.sin(x * 0.018) * 8;

function gift(kind) {
  return (c, hx, hy) => {
    if (kind === 'gold') { const g = c.createLinearGradient(0, hy - 8, 0, hy + 4); g.addColorStop(0, '#fff0a0'); g.addColorStop(1, '#c8901e'); c.fillStyle = g; c.fillRect(hx - 5, hy - 6, 10, 8); c.fillStyle = '#a8701a'; c.fillRect(hx - 6, hy - 8, 12, 3); }
    else if (kind === 'jar') { const g = c.createLinearGradient(hx - 5, 0, hx + 5, 0); g.addColorStop(0, '#f0f4ff'); g.addColorStop(1, '#8aa0c8'); c.fillStyle = g; c.beginPath(); c.ellipse(hx, hy - 2, 5, 6, 0, 0, 7); c.fill(); c.fillRect(hx - 2, hy - 11, 4, 5); c.fillStyle = '#e9b949'; c.fillRect(hx - 3, hy - 12, 6, 2); }
    else { c.fillStyle = '#8a3a8a'; c.fillRect(hx - 5, hy - 7, 10, 9); c.fillStyle = '#f2c94c'; c.fillRect(hx - 5, hy - 3, 10, 2); c.beginPath(); c.arc(hx, hy - 8, 2.2, 0, 7); c.fill(); }
  };
}
// a wise man riding a camel; the rider's legs are hidden by a fringed saddle blanket
function rider(c, x, y, s, m, facing, t, ph, o) {
  const step = Math.sin(t * 8 + ph) * (o.walking ? 1 : 0);
  c.save(); c.translate(x, y - Math.abs(step) * 2 * s);
  P.camel(c, 0, 0, s, { facing });
  const hx = -2 * s * facing, hy = -38 * s, ps = 0.6 * s;
  c.save(); c.beginPath(); c.rect(-60 * s, -200 * s, 120 * s, 200 * s + hy + 4 * s); c.clip();
  P.person(c, hx, hy + 18 * ps, ps, { ...m, expr: o.expr, arms: o.arms, t, phase: ph, bounce: o.walking ? 1 : 1.5, facing, hold: o.arms === 'hold' ? gift(m.gift) : null });
  c.restore();
  c.save(); c.scale(facing, 1); const bl = c.createLinearGradient(0, hy - 6 * s, 0, hy + 10 * s); bl.addColorStop(0, P.shade(m.stripe, 0.1)); bl.addColorStop(1, P.shade(m.stripe, -0.25)); c.fillStyle = bl; c.strokeStyle = P.shade(m.stripe, -0.5); c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-15 * s, hy - 2 * s); c.quadraticCurveTo(-2 * s, hy - 9 * s, 11 * s, hy - 2 * s); c.lineTo(10 * s, hy + 10 * s); c.lineTo(-14 * s, hy + 10 * s); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = m.robe; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-12 * s + i * 4.4 * s, hy + 11 * s, 1.8 * s, 0, 7); c.fill(); }
  c.restore(); c.restore();
}
function house(c, x, y, s, lit, t, glow) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, -20, 4, 0, -20, 110); g.addColorStop(0, `rgba(255,200,110,${0.55 * glow})`); g.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -20, 110, 0, 7); c.fill(); c.restore(); }
  c.fillStyle = 'rgba(10,10,40,0.35)'; c.beginPath(); c.ellipse(4, 2, 40, 7, 0, 0, 7); c.fill();
  const wg = c.createLinearGradient(-30, -60, 30, 0); wg.addColorStop(0, '#c8b0c0'); wg.addColorStop(1, '#6a5a80'); c.fillStyle = wg; c.fillRect(-30, -50, 60, 50);
  c.fillStyle = '#5a4a70'; c.fillRect(-33, -56, 66, 8); c.fillStyle = 'rgba(255,240,230,0.35)'; c.fillRect(-33, -56, 66, 2);
  c.fillStyle = 'rgba(40,30,60,0.25)'; c.fillRect(10, -50, 20, 50);
  const win = c.createRadialGradient(-14, -32, 1, -14, -32, 10); win.addColorStop(0, '#fff6c8'); win.addColorStop(1, '#ffb050'); c.fillStyle = lit ? win : '#3a2a4a'; c.fillRect(-20, -38, 11, 11);
  const dr = c.createLinearGradient(0, -32, 0, 0); dr.addColorStop(0, lit ? '#fff2b0' : '#4a3040'); dr.addColorStop(1, lit ? '#ffa848' : '#2a1a2a'); c.fillStyle = dr;
  c.beginPath(); c.moveTo(4, 0); c.lineTo(4, -24); c.arc(12, -24, 8, Math.PI, 0); c.lineTo(20, 0); c.closePath(); c.fill();
  if (lit) { c.save(); c.globalCompositeOperation = 'lighter'; const sp = c.createRadialGradient(12, 2, 2, 12, 2, 40); sp.addColorStop(0, `rgba(255,200,110,${0.5 * Math.max(0.4, glow)})`); sp.addColorStop(1, 'rgba(255,180,90,0)'); c.fillStyle = sp; c.save(); c.scale(1, 0.3); c.beginPath(); c.arc(12, 6, 40, 0, 7); c.fill(); c.restore(); c.restore(); }
  // a flat roof with a little parapet, a water jar and steps up the side
  c.fillStyle = '#8a7aa0'; c.fillRect(-28, -62, 4, 6); c.fillRect(24, -62, 4, 6); c.fillStyle = '#b08a6a'; c.beginPath(); c.ellipse(-24, 2, 5, 6, 0, Math.PI, 0); c.fill();
  c.restore();
}

MG.add({
  id: 'follow', stage: 'baby', cmd: 'FOLLOW!', hint: 'drag', time: 6, mood: 'night', winText: 'Found him!',
  card: { title: 'Following the star', ref: 'Matthew 2:1–12', kind: 'Gospel story', text: 'Matthew\'s Gospel tells how wise men from the East saw a new star and traveled a long way to find the child it announced. The star led them to Jesus and his mother Mary. They knelt with joy and gave him gold, frankincense and myrrh.', ask: 'The wise men were strangers from another country. How can you welcome someone who is new?' },
  init(g) {
    const s = g.s, left = Math.random() < 0.5; s.dir = left ? -1 : 1;
    const dist = [200, 230, 250][g.level];
    s.cx = left ? 330 : 30; s.town = s.cx + s.dir * dist;
    s.star = { x: s.cx + s.dir * 40, y: 180, tx: s.cx + s.dir * 40, ty: 180 };
    s.speed = [80, 88, 96][g.level] * Math.sqrt(g.speed); s.lead = [999, 150, 115][g.level];
    s.walking = false; s.lost = 0; s.arrived = -1; s.held = false; s.trail = [];
  },
  down(g, x, y) { const s = g.s; s.held = true; s.star.tx = x; s.star.ty = Math.max(70, Math.min(360, y)); g.sfx('sparkle'); },
  move(g, x, y) { const s = g.s; if (!s.held) return; s.star.tx = Math.max(16, Math.min(W - 16, x)); s.star.ty = Math.max(70, Math.min(360, y)); },
  up(g) { g.s.held = false; },
  update(g, dt) {
    const s = g.s, st = s.star;
    st.x += (st.tx - st.x) * Math.min(1, dt * 12); st.y += (st.ty - st.y) * Math.min(1, dt * 12);
    s.trail.push({ x: st.x, y: st.y, t: g.t }); while (s.trail.length && g.t - s.trail[0].t > 0.5) s.trail.shift();
    if (s.arrived >= 0) return;
    const d = st.x - s.cx, ad = Math.abs(d);
    const lostNow = ad > s.lead;
    if (lostNow && !s.lostFlag) { g.sfx('boing', { pitch: 1.4 }); }
    s.lostFlag = lostNow; s.lost = lostNow ? Math.min(1, s.lost + dt * 4) : Math.max(0, s.lost - dt * 4);
    s.walking = !lostNow && ad > 4;
    if (s.walking) s.cx += Math.sign(d) * Math.min(ad, s.speed * dt);
    if (s.walking && Math.floor(g.t * 3) !== s.stepK) { s.stepK = Math.floor(g.t * 3); g.sfx('thud', { pitch: 0.7 }); }
    if (Math.abs(s.cx - (s.town - s.dir * 44)) < 14 && !g.done) { s.arrived = g.t; s.cx = s.town - s.dir * 44; g.win(); g.sfx('magic'); g.burst(s.town, PATH_Y - 50, ['#fff6c0', '#ffd45a', '#ffffff', '#ffb0d0'], 28, 220); }
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.4 || g.done) return;
    if (!s.held) { synth('down', s.star.x, s.star.y); return; }
    const aim = s.cx + s.dir * Math.min(70, Math.abs(s.town - s.dir * 44 - s.cx) + 4); synth('move', aim, 170);
  },
  draw(g, c) {
    const s = g.s, t = g.t, dir = s.dir, won = s.arrived >= 0, st = s.star;
    c.drawImage(g.bake('baby_follow_sky_' + dir + '_' + s.town, o => {
      // deep night: indigo to violet with a rose glow low on the horizon
      P.sky(o, W, H, ['#070b26', '#141a4a', '#2c2668', '#5a3a7a', '#a0607a', '#e0907a']);
      // the Milky Way: a soft diagonal river of dust and tiny stars
      o.save(); o.translate(180, 230); o.rotate(-0.55);
      for (const [dx, dy, rx, ry, col, a] of [[-120, 0, 200, 46, '#8a7ad8', 0.16], [40, -6, 180, 36, '#d0a0e0', 0.14], [140, 4, 160, 30, '#70b0e0', 0.12], [-30, 8, 260, 22, '#fff0f0', 0.12], [-200, -4, 120, 30, '#a080e0', 0.12]]) {
        const ng = o.createRadialGradient(dx, dy, 2, dx, dy, rx); ng.addColorStop(0, P.rgba(col, a)); ng.addColorStop(1, P.rgba(col, 0)); o.fillStyle = ng; o.save(); o.scale(1, ry / rx); o.beginPath(); o.arc(dx, dy * rx / ry, rx, 0, 7); o.fill(); o.restore(); }
      const r = P.rng(77); for (let i = 0; i < 420; i++) { const x = (r() - 0.5) * 640, y = (r() + r() + r() - 1.5) * 34; o.fillStyle = `rgba(255,250,240,${0.25 + r() * 0.6})`; o.fillRect(x, y, 0.9, 0.9); }
      o.restore();
      P.stars(o, W, 400, 160, 23, 0);
      // a slim crescent moon
      { const mx = dir > 0 ? 64 : 296, mh = o.createRadialGradient(mx, 92, 6, mx, 92, 60); mh.addColorStop(0, 'rgba(255,240,210,0.28)'); mh.addColorStop(1, 'rgba(255,240,210,0)'); o.fillStyle = mh; o.fillRect(mx - 60, 32, 120, 120); }
      o.fillStyle = '#fff3d6'; o.beginPath(); o.arc(dir > 0 ? 64 : 296, 92, 13, 0, 7); o.fill(); o.fillStyle = '#10163f'; o.beginPath(); o.arc((dir > 0 ? 64 : 296) + 6, 88, 12, 0, 7); o.fill();
      // dunes, layered, each lit along its crest by the starlight
      P.hills(o, W, 420, 26, '#5a4a7e', '#3a305e', { seed: 51, freq: 0.009, dabs: 20, rim: '#c8a8e0' });
      P.hills(o, W, 470, 40, '#6a4e7a', '#40305a', { seed: 55, freq: 0.012, dabs: 40, rim: '#e8b8c8' });
      // Bethlehem: a little hill town at the end of the road
      const tx = s.town;
      P.hills(o, W, 500, 26, '#7a5a7a', '#4a3a5e', { seed: 61, freq: 0.01, dabs: 50, rim: '#f0c0c0' });
      for (const [dx, dy, w, h] of [[-58, 492, 26, 22], [-30, 486, 22, 30], [40, 490, 28, 24], [66, 496, 20, 18], [-82, 500, 18, 14], [86, 502, 16, 12]]) {
        const hx = tx + dx * dir - w / 2; if (hx < -30 || hx > W + 10) continue; const hg = o.createLinearGradient(hx, dy - h, hx + w, dy); hg.addColorStop(0, '#b098b8'); hg.addColorStop(1, '#6a5a84'); o.fillStyle = hg; o.fillRect(hx, dy - h, w, h);
        o.fillStyle = '#58487a'; o.fillRect(hx - 2, dy - h - 4, w + 4, 5); o.fillStyle = '#ffd890'; o.globalAlpha = 0.8; o.fillRect(hx + w * 0.3, dy - h * 0.6, 4, 4); o.globalAlpha = 1; }
      P.palm(o, tx - 100 * dir, 520, 0.6, 0.12 * dir, 0, '#3a5a5a'); P.palm(o, tx + 70 * dir, 516, 0.5, -0.1 * dir, 0, '#3a5a5a');
      // the near dune with the caravan's road
      o.save(); P.ridgePath(o, W, 540, 22, 0.008, 71, 640); const ng = o.createLinearGradient(0, 520, 0, 640); ng.addColorStop(0, '#9a6e84'); ng.addColorStop(1, '#4a3050'); o.fillStyle = ng; o.fill(); o.clip();
      const r3 = P.rng(81); o.strokeStyle = 'rgba(255,220,230,0.16)'; o.lineWidth = 1.4; for (let i = 0; i < 24; i++) { const y = 556 + r3() * 84, x = r3() * W; o.beginPath(); o.moveTo(x - 40, y); o.quadraticCurveTo(x, y - 4, x + 40, y); o.stroke(); }
      o.restore();
      o.strokeStyle = 'rgba(255,220,220,0.5)'; o.lineWidth = 2.5; P.ridgePath(o, W, 541.5, 22, 0.008, 71, 1100); o.stroke();
      // the road: a pale worn trail
      o.strokeStyle = 'rgba(255,230,220,0.18)'; o.lineWidth = 16; o.lineCap = 'round'; o.beginPath(); for (let x = -10; x <= W + 10; x += 8) { const y = pathY(x) + 4; x === -10 ? o.moveTo(x, y) : o.lineTo(x, y); } o.stroke();
      o.save(); P.ridgePath(o, W, 606, 10, 0.02, 93, 640); o.fillStyle = '#2e2040'; o.fill(); o.restore();
      for (const [bx, by, sc] of [[24, 604, 1], [338, 600, 0.9], [300, 612, 0.6]]) { o.save(); o.translate(bx, by); o.scale(sc, sc); o.strokeStyle = '#3a2a4a'; o.lineWidth = 2; o.lineCap = 'round'; for (let i = -4; i <= 4; i++) { o.beginPath(); o.moveTo(0, 0); o.quadraticCurveTo(i * 3, -10, i * 6, -18 - (4 - Math.abs(i)) * 3); o.stroke(); } o.restore(); }
    }), 0, 0, W, H);
    // a shooting star now and then
    const sk = (t * 0.45) % 1; if (sk < 0.18) { const q = sk / 0.18, x0 = 300 - q * 160, y0 = 60 + q * 60; c.save(); const sg = c.createLinearGradient(x0, y0, x0 + 50, y0 - 18); sg.addColorStop(0, `rgba(255,255,240,${1 - q})`); sg.addColorStop(1, 'rgba(255,255,240,0)'); c.strokeStyle = sg; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + 50, y0 - 18); c.stroke(); c.restore(); }
    P.stars(c, W, 380, 26, 91, t);
    // the beam from the star down to the ground
    c.save(); c.globalCompositeOperation = 'lighter';
    const bw = won ? 30 + eo((t - s.arrived) / 0.5) * 20 : 18;
    const beam = c.createLinearGradient(0, st.y, 0, PATH_Y); beam.addColorStop(0, `rgba(255,240,190,${won ? 0.5 : 0.28})`); beam.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = beam;
    c.beginPath(); c.moveTo(st.x - 3, st.y); c.lineTo(st.x + 3, st.y); c.lineTo(st.x + bw, PATH_Y); c.lineTo(st.x - bw, PATH_Y); c.closePath(); c.fill();
    // the trail of light the star leaves when dragged
    for (const p of s.trail) { const a = 1 - (t - p.t) / 0.5; c.fillStyle = `rgba(255,236,170,${0.25 * a})`; c.beginPath(); c.arc(p.x, p.y, 10 * a, 0, 7); c.fill(); }
    // the star: a big soft glow, long cross rays and a bright heart
    const pulse = 1 + 0.08 * Math.sin(t * 5);
    const sg = c.createRadialGradient(st.x, st.y, 2, st.x, st.y, 120 * pulse); sg.addColorStop(0, 'rgba(255,250,220,0.9)'); sg.addColorStop(0.15, 'rgba(255,230,170,0.5)'); sg.addColorStop(0.5, 'rgba(200,180,255,0.12)'); sg.addColorStop(1, 'rgba(160,140,255,0)'); c.fillStyle = sg; c.beginPath(); c.arc(st.x, st.y, 120 * pulse, 0, 7); c.fill();
    for (const [a, len, w] of [[0, 70, 3], [Math.PI / 2, 92, 3], [Math.PI / 4, 34, 2], [-Math.PI / 4, 34, 2]]) { c.save(); c.translate(st.x, st.y); c.rotate(a + Math.sin(t * 0.7) * 0.03); const rg = c.createLinearGradient(-len * pulse, 0, len * pulse, 0); rg.addColorStop(0, 'rgba(255,250,230,0)'); rg.addColorStop(0.5, 'rgba(255,252,240,0.95)'); rg.addColorStop(1, 'rgba(255,250,230,0)'); c.fillStyle = rg; c.beginPath(); c.moveTo(-len * pulse, 0); c.lineTo(0, -w); c.lineTo(len * pulse, 0); c.lineTo(0, w); c.closePath(); c.fill(); c.restore(); }
    c.restore();
    c.fillStyle = '#ffffff'; drawStar(c, st.x, st.y, 11 * pulse, 0); c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(st.x, st.y, 4, 0, 7); c.fill();
    if (!s.held && !won) { const hp = (t * 1.2) % 1; c.save(); c.strokeStyle = `rgba(255,246,210,${0.7 * (1 - hp)})`; c.lineWidth = 2.5; c.beginPath(); c.arc(st.x, st.y, 16 + hp * 30, 0, 7); c.stroke(); c.restore(); }
    // the little house where Jesus is, glowing more as the caravan nears
    const near = 1 - Math.min(1, Math.abs(s.cx - s.town) / 220);
    house(c, s.town, pathY(s.town) - 2, 1.3, true, t, 0.35 + near * 0.5 + (won ? 0.4 : 0));
    // Mary at the door with the child, once they arrive
    if (won) { const q = eo((t - s.arrived) / 0.4); c.save(); c.globalAlpha = q; P.person(c, s.town + 15.6, pathY(s.town) + 2, 0.7, { skin: SK[2], robe: CL.indigo, stripe: CL.sky, head: 'scarf', headCol: CL.sky, expr: 'laugh', arms: 'hold', t, hold: (cc, hx, hy) => { cc.fillStyle = '#fbf2de'; cc.beginPath(); cc.ellipse(hx, hy - 2, 8, 5, 0.3, 0, 7); cc.fill(); cc.fillStyle = SK[1]; cc.beginPath(); cc.arc(hx + 5, hy - 5, 3.6, 0, 7); cc.fill(); } }); c.restore(); }
    // the caravan: three camels in a line behind the leader
    const walking = s.walking && !won;
    for (let i = 2; i >= 0; i--) {
      const x = s.cx - dir * i * 56, y = pathY(x);
      if (x < -60 || x > W + 60) continue;
      rider(c, x, y + 2, 1.45 - i * 0.04, MAGI[i], dir, t, i * 1.3, { walking, expr: won ? 'laugh' : s.lost > 0.5 ? 'surprised' : 'happy', arms: won ? 'cheer' : s.lost > 0.5 ? 'out' : 'hold' });
    }
    if (s.lost > 0.05 && !won) { c.save(); c.globalAlpha = s.lost; const qx = s.cx + dir * 4, qy = pathY(s.cx) - 112 + Math.sin(t * 8) * 3; c.strokeStyle = '#fff6e0'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(qx, qy, 6, Math.PI * 1.1, Math.PI * 2.4); c.lineTo(qx, qy + 9); c.stroke(); c.fillStyle = '#fff6e0'; c.beginPath(); c.arc(qx, qy + 16, 2.4, 0, 7); c.fill(); c.restore(); }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
