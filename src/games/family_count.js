// COUNT! — God takes Abraham outside and says: count the stars, if you can; your family will be that many (Genesis 15:5).
// Every tap bursts new stars into the sky. Nobody could count them all, so any attempt wins; the more stars, the happier Abraham gets.
const HORIZON = 470;
const STAR_COLS = ['#fff8e0', '#ffe6a8', '#d6e4ff', '#ffd6ec', '#fff2c8'];
let glowSprite = null;
function glowImg() {
  if (glowSprite) return glowSprite;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const o = cv.getContext('2d');
  const g = o.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,250,232,1)'); g.addColorStop(0.12, 'rgba(255,238,200,0.75)'); g.addColorStop(0.4, 'rgba(190,180,255,0.2)'); g.addColorStop(1, 'rgba(160,150,255,0)');
  o.fillStyle = g; o.fillRect(0, 0, 64, 64); return glowSprite = cv;
}
// a Bedouin-style goat-hair tent: a long low roof on poles with an open front. part 'body' before the night tint, 'light' after it.
function tent(o, x, y, w, h, col, part, lit = 1) {
  o.save(); o.translate(x, y);
  const roof = () => { o.beginPath(); o.moveTo(-w / 2, 0); o.lineTo(-w * 0.47, -h * 0.58); o.quadraticCurveTo(-w * 0.38, -h * 0.8, -w * 0.25, -h * 0.96); o.quadraticCurveTo(-w * 0.07, -h * 0.74, w * 0.12, -h); o.quadraticCurveTo(w * 0.3, -h * 0.78, w * 0.46, -h * 0.6); o.lineTo(w / 2, 0); o.closePath(); };
  const door = () => { o.beginPath(); o.moveTo(-w * 0.06, 0); o.lineTo(-w * 0.04, -h * 0.62); o.lineTo(w * 0.22, -h * 0.66); o.lineTo(w * 0.24, 0); o.closePath(); };
  if (part === 'body') {
    o.fillStyle = 'rgba(20,10,30,0.3)'; o.beginPath(); o.ellipse(4, 2, w * 0.56, 7, 0, 0, 7); o.fill();
    roof(); const g = o.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, P.shade(col, 0.18)); g.addColorStop(1, P.shade(col, -0.2)); o.fillStyle = g; o.fill();
    o.save(); roof(); o.clip(); o.strokeStyle = P.rgba(P.shade(col, 0.3), 0.35); o.lineWidth = 2; for (let k = 1; k < 6; k++) { o.beginPath(); o.moveTo(-w / 2, -h * k / 6); o.lineTo(w / 2, -h * k / 6 - 4); o.stroke(); } o.restore();
    o.strokeStyle = P.shade(col, -0.45); o.lineWidth = 1.6; roof(); o.stroke();
    o.strokeStyle = '#5a3a24'; o.lineWidth = 2; for (const px of [-0.25, 0.12]) { o.beginPath(); o.moveTo(w * px, -h * 0.98); o.lineTo(w * px, -h * 1.12); o.stroke(); }
    o.strokeStyle = 'rgba(240,220,190,0.5)'; o.lineWidth = 1; o.beginPath(); o.moveTo(-w * 0.47, -h * 0.58); o.lineTo(-w * 0.62, 2); o.moveTo(w * 0.46, -h * 0.6); o.lineTo(w * 0.62, 2); o.stroke();
    door(); o.fillStyle = '#2a1414'; o.fill();
  } else {
    door(); const lg = o.createRadialGradient(w * 0.09, -h * 0.25, 2, w * 0.09, -h * 0.3, h * 0.8); lg.addColorStop(0, P.rgba('#ffd27a', lit)); lg.addColorStop(0.6, P.rgba('#e07a3a', 0.85 * lit)); lg.addColorStop(1, P.rgba('#5a2a24', 0.9)); o.fillStyle = lg; o.fill();
    // folded-back door flap
    o.fillStyle = P.shade(col, -0.05); o.beginPath(); o.moveTo(w * 0.22, -h * 0.66); o.lineTo(w * 0.34, -h * 0.4); o.lineTo(w * 0.24, -h * 0.1); o.closePath(); o.fill();
    // warm spill onto the ground
    o.globalCompositeOperation = 'screen'; const sp = o.createRadialGradient(w * 0.09, 4, 2, w * 0.09, 4, w * 0.5); sp.addColorStop(0, P.rgba('#ffb060', 0.45 * lit)); sp.addColorStop(1, 'rgba(255,176,96,0)'); o.fillStyle = sp; o.fillRect(-w * 0.5, -h, w * 1.2, h + 30);
  }
  o.restore();
}
function paintSky(o) {
  P.sky(o, W, H, ['#05071e', '#0e1442', '#202468', '#43307a', '#8a4a80', '#d07a7a']);
  const ag = o.createRadialGradient(180, HORIZON + 30, 10, 180, HORIZON + 30, 300); ag.addColorStop(0, 'rgba(255,160,120,0.45)'); ag.addColorStop(1, 'rgba(255,160,120,0)'); o.fillStyle = ag; o.fillRect(0, 0, W, H);
  P.stars(o, W, HORIZON - 30, 170, 5, 0);
}
function paintMilkyWay(o) {
  const r = P.rng(41); o.save(); o.translate(180, 250); o.rotate(-0.95);
  o.globalCompositeOperation = 'screen';
  for (let i = 0; i < 46; i++) { const x = -420 + i * 19 + (r() - 0.5) * 20, y = (r() - 0.5) * 40, rx = 40 + r() * 50, ry = 18 + r() * 30, c = ['#6a5ad0', '#c08ad8', '#ffe2c8', '#8ab0ff'][i % 4];
    const g = o.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, P.rgba(c, 0.16 + r() * 0.08)); g.addColorStop(1, P.rgba(c, 0)); o.fillStyle = g; o.beginPath(); o.ellipse(x, y, rx, ry, 0, 0, 7); o.fill(); }
  o.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 9; i++) { const x = -300 + i * 70 + r() * 30, y = (r() - 0.5) * 16; o.fillStyle = 'rgba(14,12,48,0.22)'; o.beginPath(); o.ellipse(x, y, 30 + r() * 30, 4 + r() * 6, 0.1, 0, 7); o.fill(); }
  for (let i = 0; i < 900; i++) { const x = (r() - 0.5) * 900, gy = ((r() + r() + r()) / 3 - 0.5) * 120, s = 0.3 + r() * r() * 1.4; o.fillStyle = P.rgba(r() < 0.8 ? '#fff6e0' : '#cfe0ff', 0.35 + r() * 0.6); o.beginPath(); o.arc(x, gy, s, 0, 7); o.fill(); }
  o.restore();
}
function paintLand(o) {
  P.hills(o, W, HORIZON + 6, 46, '#5a4a8a', '#3a2c5a', { seed: 3, freq: 0.009, dabs: 30 });
  P.hills(o, W, HORIZON + 40, 30, '#6a4a6a', '#3e2a44', { seed: 12, freq: 0.014, dabs: 50 });
  tent(o, 30, 518, 62, 26, '#6a4a3a', 'body'); tent(o, 214, 524, 92, 38, '#5a3e30', 'body');
  P.camel(o, 300, 532, 0.72, { facing: -1 }); P.camel(o, 330, 538, 0.6, { facing: -1 });
  P.hills(o, W, 552, 18, '#8a6a6a', '#5a3e4a', { seed: 31, freq: 0.01, dabs: 70 });
  tent(o, 92, 556, 150, 62, '#4e3428', 'body');
  // the rise Abraham stands on
  o.save(); o.beginPath(); o.moveTo(-10, 640); o.lineTo(-10, 600); o.quadraticCurveTo(120, 588, 190, 586); o.quadraticCurveTo(250, 570, 330, 584); o.quadraticCurveTo(360, 588, 370, 594); o.lineTo(370, 640); o.closePath();
  const fg = o.createLinearGradient(0, 570, 0, 640); fg.addColorStop(0, '#8a6a7a'); fg.addColorStop(1, '#4a3048'); o.fillStyle = fg; o.fill(); o.restore();
  P.grassTufts(o, W, 586, 640, 40, '#6a7a5a', 14);
  // night: tint everything painted so far toward moonlit violet (source-atop keeps the sky transparent)
  o.save(); o.globalCompositeOperation = 'source-atop'; o.fillStyle = 'rgba(28,22,78,0.5)'; o.fillRect(0, 0, W, H);
  o.globalCompositeOperation = 'source-atop'; const rim = o.createLinearGradient(0, HORIZON - 40, 0, HORIZON + 60); rim.addColorStop(0, 'rgba(255,170,150,0.18)'); rim.addColorStop(1, 'rgba(255,170,150,0)'); o.fillStyle = rim; o.fillRect(0, HORIZON - 40, W, 100); o.restore();
  tent(o, 30, 518, 62, 26, '#6a4a3a', 'light', 0.6); tent(o, 214, 524, 92, 38, '#5a3e30', 'light', 0.8); tent(o, 92, 556, 150, 62, '#4e3428', 'light', 1);
}
function spawnStars(g, x, y) {
  const s = g.s, inSky = y < HORIZON - 30, n = 6 + Math.floor(Math.random() * 3);
  if (!inSky) { x = 30 + Math.random() * 300; y = 60 + Math.random() * 340; }
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, d = 12 + Math.random() * 62, big = Math.random() < 0.14;
    s.stars.push({ sx: x, sy: y, x: Math.max(8, Math.min(W - 8, x + Math.cos(a) * d)), y: Math.max(10, Math.min(HORIZON - 34, y + Math.sin(a) * d * 0.9)), born: g.t + i * 0.012, r: big ? 2.6 + Math.random() * 1.4 : 0.8 + Math.random() * 1.5, col: STAR_COLS[i % STAR_COLS.length], ph: Math.random() * 6 });
  }
  if (s.stars.length > 700) s.stars.splice(0, s.stars.length - 700);
  s.rings.push({ x, y, t: g.t });
}
MG.add({
  id: 'count', stage: 'family', cmd: 'COUNT!', hint: 'mash', time: 4.5, mood: 'night', winOnTimeout: true, winText: 'So many!',
  card: { title: 'Count the stars', ref: 'Genesis 15', kind: 'Story', text: 'Abraham and Sarah were old and still had no children. One night God told Abraham to look up and count the stars if he could, because one day his family would be that many, and Abraham trusted God.', ask: 'Who is in your family, and who has become like family to you?' },
  init(g) { const s = g.s; s.stars = []; s.rings = []; s.taps = 0; s.joy = 0; s.joyShow = 0; s.bot = 0; s.shoot = [{ t0: 0.9, x: 330, y: 70 }, { t0: 2.4, x: 150, y: 40 }, { t0: 3.6, x: 260, y: 120 }]; },
  down(g, x, y) {
    const s = g.s; s.taps++; spawnStars(g, x, y);
    g.sfx(s.taps % 3 === 0 ? 'chime' : 'sparkle');
    if (s.taps === 10) g.sfx('harp'); if (s.taps === 22) { g.sfx('laugh'); g.sfx('cheer'); }
  },
  update(g, dt) { const s = g.s; s.joy = Math.min(1, s.taps / 22); s.joyShow += (s.joy - s.joyShow) * Math.min(1, dt * 6); },
  auto(g, dt, synth) { const s = g.s; s.bot += dt; if (g.t > 0.3 && s.bot > 0.07) { s.bot = 0; const x = 30 + Math.random() * 300, y = 50 + Math.random() * 360; synth('down', x, y); synth('up', x, y); } },
  draw(g, c) {
    const s = g.s, t = g.t, joy = s.joyShow;
    c.drawImage(g.bake('family_count_sky', paintSky), 0, 0, W, H);
    // the Milky Way brightens as the sky fills
    c.save(); c.globalAlpha = 0.55 + 0.45 * joy + 0.08 * Math.sin(t * 1.5); c.drawImage(g.bake('family_count_mw', paintMilkyWay), 0, 0, W, H); c.restore();
    if (joy > 0) { c.save(); c.globalCompositeOperation = 'screen'; const sg = c.createLinearGradient(0, 0, 0, HORIZON); sg.addColorStop(0, `rgba(70,60,190,${0.22 * joy})`); sg.addColorStop(1, `rgba(255,150,190,${0.18 * joy})`); c.fillStyle = sg; c.fillRect(0, 0, W, HORIZON); c.restore(); }
    P.stars(c, W, HORIZON - 40, 40, 77, t);
    // shooting stars
    for (const sh of s.shoot) { const q = (t - sh.t0) / 0.7; if (q < 0 || q > 1) continue; const hx = sh.x - q * 170, hy = sh.y + q * 90; c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createLinearGradient(hx, hy, hx + 70, hy - 37); lg.addColorStop(0, `rgba(255,248,220,${0.9 * (1 - q)})`); lg.addColorStop(1, 'rgba(255,248,220,0)'); c.strokeStyle = lg; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 70, hy - 37); c.stroke(); c.drawImage(glowImg(), hx - 10, hy - 10, 20, 20); c.restore(); }
    // tap rings
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const rg of s.rings) { const q = (t - rg.t) / 0.45; if (q < 0 || q > 1) continue; c.strokeStyle = `rgba(255,236,190,${0.6 * (1 - q)})`; c.lineWidth = 3 * (1 - q) + 0.5; c.beginPath(); c.arc(rg.x, rg.y, 8 + q * 46, 0, 7); c.stroke(); c.drawImage(glowImg(), rg.x - 40 * (1 - q), rg.y - 40 * (1 - q), 80 * (1 - q), 80 * (1 - q)); }
    // the new stars: fly out from the tap, pop, then twinkle
    const gi = glowImg(), win = g.result === 'win' ? Math.min(1, (t - g.doneAt) * 3) : 0;
    for (const st of s.stars) {
      const age = t - st.born; if (age < 0) continue; const k = Math.min(1, age / 0.38), e = 1 - Math.pow(1 - k, 3);
      const x = st.sx + (st.x - st.sx) * e, y = st.sy + (st.y - st.sy) * e;
      const pop = k < 1 ? e * 1.5 : 1 + 0.25 * Math.sin(t * 5 + st.ph) + win * 0.4 * Math.max(0, Math.sin(t * 9 + st.ph * 3));
      if (k < 1) { c.strokeStyle = P.rgba(st.col, 0.35 * (1 - k)); c.lineWidth = st.r; c.beginPath(); c.moveTo(st.sx + (st.x - st.sx) * e * 0.4, st.sy + (st.y - st.sy) * e * 0.4); c.lineTo(x, y); c.stroke(); }
      const gs = st.r * 11 * pop; c.drawImage(gi, x - gs / 2, y - gs / 2, gs, gs);
      c.fillStyle = st.col; c.beginPath(); c.arc(x, y, st.r * 0.8 * Math.max(0.3, pop), 0, 7); c.fill();
      if (st.r > 2.4) { const L = st.r * 4.5 * pop; c.fillStyle = P.rgba(st.col, 0.85); c.beginPath(); c.ellipse(x, y, L, st.r * 0.32, 0, 0, 7); c.ellipse(x, y, st.r * 0.32, L, 0, 0, 7); c.fill(); }
    }
    c.restore();
    c.drawImage(g.bake('family_count_land', paintLand), 0, 0, W, H);
    // campfire: flicker and warm glow
    const fx = 168, fy = 588, fl = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 7.3);
    c.save(); c.globalCompositeOperation = 'screen'; const fgw = c.createRadialGradient(fx, fy - 8, 2, fx, fy - 8, 90 * fl); fgw.addColorStop(0, 'rgba(255,190,100,0.55)'); fgw.addColorStop(1, 'rgba(255,140,80,0)'); c.fillStyle = fgw; c.fillRect(fx - 100, fy - 110, 200, 160); c.restore();
    c.fillStyle = '#4a2a1a'; c.save(); c.translate(fx, fy); c.rotate(0.3); c.fillRect(-12, -3, 24, 5); c.rotate(-0.6); c.fillRect(-12, -3, 24, 5); c.restore();
    for (let i = 0; i < 3; i++) { const hgt = (16 - i * 4) * fl * (1 + 0.15 * Math.sin(t * 13 + i * 2)); c.fillStyle = ['#e8582a', '#ffa83a', '#fff0a0'][i]; c.beginPath(); c.moveTo(fx - 8 + i * 2.5, fy - 1); c.quadraticCurveTo(fx - 7 + i * 2, fy - hgt * 0.6, fx + Math.sin(t * 9 + i) * 2, fy - hgt); c.quadraticCurveTo(fx + 7 - i * 2, fy - hgt * 0.6, fx + 8 - i * 2.5, fy - 1); c.closePath(); c.fill(); }
    for (let i = 0; i < 4; i++) { const q = (t * 0.8 + i * 0.25) % 1; c.fillStyle = `rgba(255,200,120,${1 - q})`; c.beginPath(); c.arc(fx + Math.sin(t * 3 + i * 2) * 8, fy - 14 - q * 50, 1.3, 0, 7); c.fill(); }
    // Sarah peeks out of the big tent and joins the joy
    const sj = joy > 0.45;
    P.person(c, 106, 556, 0.82, { skin: P.SKIN[2], robe: P.CLOTH.plum, stripe: P.CLOTH.gold, hairStyle: 'bun', hair: P.HAIR[5], expr: sj ? 'laugh' : 'happy', arms: sj ? 'wave' : 'pray', t, phase: 1, bounce: sj ? 2 : 0.6 });
    // Abraham: looks up, jaw drops, then laughs and dances
    const dance = joy > 0.62 || (g.result === 'win' && s.taps > 12), wow = joy > 0.2;
    const ax = 250 + (dance ? Math.sin(t * 8) * 6 : 0), ay = 588 - (dance ? Math.abs(Math.sin(t * 8)) * 9 : 0);
    c.save(); c.translate(ax, ay); if (dance) c.rotate(Math.sin(t * 8) * 0.1);
    const rg = c.createRadialGradient(0, -60, 4, 0, -60, 90); rg.addColorStop(0, `rgba(190,180,255,${0.12 + 0.2 * joy})`); rg.addColorStop(1, 'rgba(190,180,255,0)'); c.fillStyle = rg; c.fillRect(-90, -150, 180, 160);
    P.person(c, 0, 0, 1.8, { skin: P.SKIN[2], robe: P.CLOTH.terracotta, stripe: P.CLOTH.cream, sash: P.CLOTH.gold, beard: '#ece6de', hair: P.HAIR[5], head: 'wrap', headCol: P.CLOTH.sand, expr: dance ? 'laugh' : wow ? 'wow' : 'happy', arms: dance ? 'cheer' : wow ? 'up' : 'reach', t, bounce: dance ? 0 : 0.8, facing: -1 });
    c.restore();
    if (dance) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const a = t * 3 + i * 1.05, q = (t * 1.2 + i / 6) % 1; c.fillStyle = `rgba(255,236,170,${0.9 * (1 - q)})`; drawStar(c, ax + Math.cos(a) * (40 + q * 30), ay - 80 + Math.sin(a) * 30 - q * 30, 4 * (1 - q) + 1.5, a); } c.restore(); }
    P.vignette(c, W, H, 0.32); P.grain(c, W, H, 0.06);
  },
});
