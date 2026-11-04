// WRESTLE! — Jacob wrestles all night by the Jabbok river until dawn, and will not let go until he is blessed (Genesis 32:22–31).
// Mash to keep pushing. Keep the push up until the sun rises; if it falls flat, Jacob flops down for a nap.
const GROUND = 566, HZ = 404;
function paintScene(o, pal) {
  P.sky(o, W, H, pal.sky, null);
  if (pal.stars) P.stars(o, W, HZ - 40, 140, 17, 0);
  // a glow low on the horizon where the sun will come up
  const hg = o.createRadialGradient(250, HZ, 10, 250, HZ, 260); hg.addColorStop(0, P.rgba(pal.glow, pal.glowA)); hg.addColorStop(1, P.rgba(pal.glow, 0)); o.fillStyle = hg; o.fillRect(0, 0, W, H);
  if (pal.clouds) { P.cloud(o, 70, 170, 0.62, pal.cloudL, pal.cloudD, 0.85); P.cloud(o, 300, 230, 0.45, pal.cloudL, pal.cloudD, 0.75); }
  P.hills(o, W, HZ, 64, pal.far[0], pal.far[1], { seed: 61, freq: 0.007, dabs: 30, bottom: 470 });
  P.hills(o, W, HZ + 26, 34, pal.mid[0], pal.mid[1], { seed: 63, freq: 0.011, dabs: 50, rim: pal.rim, bottom: 470 });
  // Jacob's family camped across the river
  for (const [x, y, s] of [[60, 434, 1], [96, 438, 0.8], [300, 432, 0.9]]) { o.fillStyle = pal.tent; o.beginPath(); o.moveTo(x - 18 * s, y); o.lineTo(x - 12 * s, y - 13 * s); o.lineTo(x + 10 * s, y - 15 * s); o.lineTo(x + 18 * s, y); o.closePath(); o.fill(); o.fillStyle = pal.tentLit; o.fillRect(x - 2 * s, y - 8 * s, 6 * s, 8 * s); }
  // the river Jabbok
  const rg = o.createLinearGradient(0, 446, 0, 500); rg.addColorStop(0, pal.water[0]); rg.addColorStop(1, pal.water[1]); o.fillStyle = rg;
  o.beginPath(); o.moveTo(-10, 448); o.quadraticCurveTo(120, 440, 200, 450); o.quadraticCurveTo(290, 458, 370, 446); o.lineTo(370, 500); o.quadraticCurveTo(260, 510, 180, 498); o.quadraticCurveTo(80, 488, -10, 504); o.closePath(); o.fill();
  o.strokeStyle = P.rgba(pal.shine, 0.35); o.lineWidth = 1.4; for (let k = 0; k < 5; k++) { o.beginPath(); for (let x = -10; x <= 370; x += 6) { const y = 456 + k * 9 + Math.sin(x * 0.05 + k * 2) * 1.6; x === -10 ? o.moveTo(x, y) : o.lineTo(x, y); } o.stroke(); }
  // stepping stones of the ford
  for (const [x, y] of [[120, 470], [150, 480], [182, 474], [212, 484]]) { o.fillStyle = pal.stone; o.beginPath(); o.ellipse(x, y, 11, 5, 0, 0, 7); o.fill(); o.fillStyle = P.rgba(pal.shine, 0.4); o.beginPath(); o.ellipse(x - 2, y - 2, 6, 2, 0, 0, 7); o.fill(); }
  // near bank where they wrestle
  o.beginPath(); o.moveTo(-10, 640); o.lineTo(-10, 500); o.quadraticCurveTo(90, 490, 180, 500); o.quadraticCurveTo(280, 510, 370, 494); o.lineTo(370, 640); o.closePath();
  const bg = o.createLinearGradient(0, 494, 0, 640); bg.addColorStop(0, pal.bank[0]); bg.addColorStop(1, pal.bank[1]); o.fillStyle = bg; o.fill();
  o.save(); o.clip(); const r = P.rng(77); for (let i = 0; i < 90; i++) { o.fillStyle = P.rgba(r() < 0.5 ? pal.bankDab : pal.bank[1], 0.15 + r() * 0.15); o.beginPath(); o.ellipse(r() * W, 500 + r() * 140, 6 + r() * 14, 2 + r() * 3, 0, 0, 7); o.fill(); } o.restore();
  P.grassTufts(o, W, 500, 520, 26, pal.grass, 71); P.grassTufts(o, W, 580, 640, 30, pal.grass, 72);
  // reeds and rocks framing the edges
  P.rock(o, 28, 600, 1.2, pal.stone); P.rock(o, 340, 592, 0.9, pal.stone);
  o.strokeStyle = pal.reed; o.lineWidth = 2.2; o.lineCap = 'round'; for (let i = 0; i < 9; i++) { const x = 300 + i * 7, h = 40 + (i % 3) * 16; o.beginPath(); o.moveTo(x, 510); o.quadraticCurveTo(x + 4, 510 - h * 0.6, x + 8 - (i % 2) * 10, 510 - h); o.stroke(); }
  o.fillStyle = pal.reedTop; for (let i = 0; i < 9; i += 2) { const x = 300 + i * 7, h = 40 + (i % 3) * 16; o.beginPath(); o.ellipse(x + 8 - (i % 2) * 10, 510 - h, 2.5, 7, 0.2, 0, 7); o.fill(); }
}
const NIGHT = { sky: ['#070a24', '#111a48', '#24306a', '#3a3a78'], stars: true, glow: '#6a6ad0', glowA: 0.3, far: ['#26285a', '#1c1e46'], mid: ['#2e2c5a', '#22203e'], rim: '#6a70c0', tent: '#1a1834', tentLit: '#ffb060', water: ['#2a3a78', '#141c44'], shine: '#a8c0ff', stone: '#4a4a70', bank: ['#3a3858', '#22203a'], bankDab: '#5a5a88', grass: '#4a5a78', reed: '#2a3050', reedTop: '#3a3048' };
const DAWN = { sky: ['#4a7ac0', '#b0a8d8', '#ffc8a8', '#ffb070'], stars: false, glow: '#ffd890', glowA: 0.8, clouds: false, cloudL: '#fff0e0', cloudD: '#f0a8a8', far: ['#9a88b8', '#7a6a9a'], mid: ['#b8a07a', '#8a7a5a'], rim: '#ffe0a0', tent: '#7a5a5a', tentLit: '#ffd090', water: ['#ffc898', '#6a8ab8'], shine: '#fff4d8', stone: '#a08a7a', bank: ['#b8a070', '#7a6a4a'], bankDab: '#e0c890', grass: '#8aa050', reed: '#6a7a3a', reedTop: '#8a5a3a' };
function lightBeing(c, x, y, s, lean, t, o) {
  c.save(); c.translate(x, y); c.rotate(lean);
  c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, -60 * s, 4, 0, -50 * s, 80 * s); g.addColorStop(0, 'rgba(255,240,190,0.6)'); g.addColorStop(0.5, 'rgba(255,210,140,0.2)'); g.addColorStop(1, 'rgba(255,200,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -50 * s, 80 * s, 0, 7); c.fill(); c.restore();
  c.globalAlpha = o.alpha ?? 1;
  P.person(c, 0, 0, s, { skin: '#f6dcb8', robe: '#fff4dc', stripe: '#f2c24a', sash: '#ffd870', hair: '#e8b860', hairStyle: 'long', expr: o.expr, arms: o.arms, facing: -1, t, bounce: 0.6 });
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.18 + 0.08 * Math.sin(t * 4); c.fillStyle = '#ffe8b0'; c.beginPath(); c.ellipse(0, -22 * s, 16 * s, 22 * s, 0, 0, 7); c.fill();
  // a soft halo ring
  c.globalAlpha = 0.5 + 0.2 * Math.sin(t * 3); c.strokeStyle = '#fff0b0'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(0, -96 * s / 1.8 - 24, 20, 6, 0, 0, 7); c.stroke();
  c.restore();
  // motes of light drifting off
  c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10; i++) { const q = (t * 0.6 + i / 10) % 1; c.fillStyle = `rgba(255,240,190,${0.8 * (1 - q)})`; c.beginPath(); c.arc(x + Math.sin(t * 2 + i * 2.3) * 26 * s, y - 20 * s - q * 90 * s, 1.6 + (i % 3) * 0.6, 0, 7); c.fill(); } c.restore();
}
MG.add({
  id: 'wrestle', stage: 'family', cmd: 'WRESTLE!', hint: 'mash', time: 5.5, mood: 'night', winText: 'Blessed!', failText: 'Zzz...',
  card: { title: 'Wrestling until dawn', ref: 'Genesis 32', kind: 'Story', text: 'The night before Jacob met his brother Esau again, a mysterious stranger wrestled with him by the river until morning. Jacob held on and asked for a blessing, and God gave him a new name, Israel, and he walked away limping but blessed.', ask: 'When something feels hard, who helps you hold on and keep trying?' },
  init(g) { const s = g.s; s.p = 0.55; s.dawn = 0; s.puffs = []; s.bot = 0; s.tapT = -1; s.endDawn = 0; },
  down(g) { const s = g.s; s.p = Math.min(1, s.p + 0.085); s.tapT = g.t; s.puffs.push({ x: 180 + (Math.random() - 0.5) * 60, t: g.t, d: Math.random() < 0.5 ? -1 : 1 }); if (s.puffs.length > 20) s.puffs.shift(); g.sfx(Math.random() < 0.5 ? 'thud' : 'stomp'); },
  update(g, dt) {
    const s = g.s; if (g.done) { s.endDawn = Math.min(1, s.endDawn + dt * 2); return; }
    s.p -= dt * [0.32, 0.42, 0.5][g.level] * Math.sqrt(g.speed);
    s.dawn = Math.min(1, s.dawn + dt * (0.3 + 0.95 * Math.max(0, s.p)) / (0.78 * g.dur));
    if (s.p <= 0) { s.p = 0; g.sfx('boing'); g.fail(); }
    else if (s.dawn >= 1) { g.sfx('magic'); g.sfx('harp'); g.burst(150, 440, ['#fff6c0', '#ffd45a', '#ffffff'], 26, 220); g.win(); }
  },
  auto(g, dt, synth) { const s = g.s; s.bot += dt; if (g.t > 0.3 && s.bot > 0.075) { s.bot = 0; synth('down', 180, 420); synth('up', 180, 420); } },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', lost = g.result === 'fail', q = won ? Math.min(1, (t - g.doneAt) / 0.75) : 0;
    const dawn = Math.min(1, s.dawn + (won ? s.endDawn * 0.1 : 0)), d2 = dawn * dawn * (3 - 2 * dawn);
    c.drawImage(g.bake('family_wrestle_night', o => paintScene(o, NIGHT)), 0, 0, W, H);
    if (d2 > 0) { c.save(); c.globalAlpha = d2; c.drawImage(g.bake('family_wrestle_dawn', o => paintScene(o, DAWN)), 0, 0, W, H); c.restore(); }
    // the sun rises behind the far hills as dawn comes
    const sy = HZ + 40 - d2 * 120; c.save(); c.beginPath(); c.rect(0, 0, W, HZ - 30 + 64 * 0.2); c.clip();
    const sg = c.createRadialGradient(250, sy, 0, 250, sy, 140); sg.addColorStop(0, `rgba(255,236,170,${0.75 * d2})`); sg.addColorStop(0.3, `rgba(255,190,120,${0.3 * d2})`); sg.addColorStop(1, 'rgba(255,170,120,0)'); c.fillStyle = sg; c.fillRect(0, 0, W, H);
    c.fillStyle = `rgba(255,250,224,${d2})`; c.beginPath(); c.arc(250, sy, 24, 0, 7); c.fill(); c.restore();
    if (d2 > 0.5) P.rays(c, 250, sy, W, H, '#fff0c0', 0.16 * (d2 - 0.5) * 2, 9, t);
    if (d2 < 1) { c.save(); c.globalAlpha = 1 - d2; P.stars(c, W, HZ - 60, 30, 23, t); c.restore(); }
    // river sparkles
    for (let i = 0; i < 10; i++) { const k = Math.max(0, Math.sin(t * 3 + i * 1.9)); if (k < 0.6) continue; c.fillStyle = `rgba(255,248,220,${(k - 0.6) * 2})`; c.fillRect((i * 41 + t * 6) % W, 456 + (i * 13) % 36, 7, 1.3); }
    // dust kicked up by each push
    for (const pf of s.puffs) { const a = (t - pf.t) / 0.6; if (a < 0 || a > 1) continue; c.fillStyle = P.rgba(P.mix('#8a86b0', '#e8d0a0', d2), 0.6 * (1 - a)); for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(pf.x + pf.d * a * 30 + i * 6 * pf.d, GROUND - 4 - a * 14 - i * 3, 6 + a * 8, 0, 7); c.fill(); } }
    // the clinch: Jacob (left) and the shining stranger (right) push shoulder to shoulder
    const p = s.p, jolt = t - s.tapT < 0.1 ? (0.1 - (t - s.tapT)) * 30 : 0;
    const cx = 168 + (p - 0.5) * 50 + jolt;
    if (lost) {
      const fq = Math.min(1, (t - g.doneAt) / 0.3);
      c.save(); c.translate(cx - 50, GROUND + fq * 10); c.rotate(-fq * 0.25);
      P.person(c, 0, 0, 1.8, { skin: P.SKIN[2], robe: P.CLOTH.indigo, stripe: P.CLOTH.saffron, sash: P.CLOTH.rust, hair: P.HAIR[1], beard: true, hairStyle: 'curly', expr: 'sleep', arms: 'down', t, bounce: 0 }); c.restore();
      c.fillStyle = '#fff6dc'; c.font = '700 20px Fredoka, sans-serif'; c.save(); c.globalAlpha = 0.9; for (let i = 0; i < 3; i++) { const zq = (t * 0.8 + i / 3) % 1; c.globalAlpha = 1 - zq; c.fillText('z', cx - 30 + zq * 30, GROUND - 120 - zq * 40 - i * 4); } c.restore();
      lightBeing(c, cx + 56, GROUND, 1.8, 0, t, { expr: 'happy', arms: 'reach' });
    } else if (won) {
      // the stranger rises into the sunrise; Jacob, blessed and glowing, limps off happy
      lightBeing(c, cx + 40 + q * 10, GROUND - q * 120, 1.8 * (1 - q * 0.3), 0, t, { expr: 'laugh', arms: 'up', alpha: 1 - q * 0.8 });
      const jx = cx - 30 + q * 60, limp = Math.abs(Math.sin(t * 9)) * 6, tilt = Math.sin(t * 9) > 0 ? 0.08 : -0.02;
      c.save(); c.globalCompositeOperation = 'lighter'; const bg = c.createLinearGradient(jx, 0, jx, GROUND); bg.addColorStop(0, 'rgba(255,230,160,0)'); bg.addColorStop(1, `rgba(255,230,160,${0.45 * (1 - q * 0.5)})`); c.fillStyle = bg; c.fillRect(jx - 50, 0, 100, GROUND); c.restore();
      c.save(); c.translate(jx, GROUND - limp); c.rotate(tilt);
      P.person(c, 0, 0, 1.8, { skin: P.SKIN[2], robe: P.CLOTH.indigo, stripe: P.CLOTH.saffron, sash: P.CLOTH.rust, hair: P.HAIR[1], beard: true, hairStyle: 'curly', expr: 'laugh', arms: 'cheer', t, bounce: 0 }); c.restore();
      c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const a = t * 2.5 + i * 0.785; c.fillStyle = 'rgba(255,236,170,0.9)'; drawStar(c, jx + Math.cos(a) * 46, GROUND - 70 + Math.sin(a) * 50, 4 + (i % 2) * 2, a); } c.restore();
    } else {
      const strain = Math.sin(t * 30) * (1.2 + (1 - p) * 1.5), lean = 0.3 + (p - 0.5) * 0.14;
      lightBeing(c, cx + 54, GROUND, 1.8, -0.3 + (p - 0.5) * 0.1, t, { expr: 'happy', arms: 'reach' });
      c.save(); c.translate(cx - 54 + strain, GROUND); c.rotate(lean);
      P.person(c, 0, 0, 1.8, { skin: P.SKIN[2], robe: P.CLOTH.indigo, stripe: P.CLOTH.saffron, sash: P.CLOTH.rust, hair: P.HAIR[1], beard: true, hairStyle: 'curly', expr: p > 0.45 ? 'happy' : 'surprised', arms: 'reach', t, bounce: 0 }); c.restore();
      // where their hands meet, a little flare of light
      c.save(); c.globalCompositeOperation = 'lighter'; const hx = cx + 2, hy = GROUND - 54, fr = 10 + 4 * Math.sin(t * 12); const fg = c.createRadialGradient(hx, hy, 0, hx, hy, fr * 2); fg.addColorStop(0, 'rgba(255,240,200,0.8)'); fg.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = fg; c.beginPath(); c.arc(hx, hy, fr * 2, 0, 7); c.fill(); c.restore();
      // effort lines over the clinch
      c.save(); c.strokeStyle = `rgba(255,246,220,${0.4 + 0.5 * p})`; c.lineWidth = 2.5; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.5, r0 = 30 + Math.sin(t * 20 + i) * 3; c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, GROUND - 136 + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * (r0 + 12 * p + 4), GROUND - 136 + Math.sin(a) * (r0 + 12 * p + 4)); c.stroke(); } c.restore();
    }
    // the push meter: a glowing column with the sun at the top
    if (!won) {
      const mx = 26, my0 = 470, my1 = 150, mh = my0 - my1, fill = Math.max(0, p);
      c.save(); c.fillStyle = 'rgba(20,14,40,0.4)'; roundRect(c, mx - 9, my1 - 4, 18, mh + 8, 9); c.fill();
      const mg = c.createLinearGradient(0, my0, 0, my1); mg.addColorStop(0, '#7a6ad8'); mg.addColorStop(0.5, '#ff9a7a'); mg.addColorStop(1, '#ffe08a'); c.fillStyle = mg;
      if (fill > 0) { roundRect(c, mx - 6, my0 - mh * fill, 12, mh * fill, 6); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.35)'; if (fill > 0) { roundRect(c, mx - 4, my0 - mh * fill + 3, 3, Math.max(0, mh * fill - 6), 2); c.fill(); }
      const low = fill < 0.25 ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
      if (low) { c.strokeStyle = `rgba(255,170,200,${low})`; c.lineWidth = 2; roundRect(c, mx - 9, my1 - 4, 18, mh + 8, 9); c.stroke(); }
      c.globalCompositeOperation = 'lighter'; const sgl = c.createRadialGradient(mx, my1 - 18, 2, mx, my1 - 18, 26); sgl.addColorStop(0, `rgba(255,220,140,${0.4 + 0.5 * d2})`); sgl.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = sgl; c.fillRect(mx - 30, my1 - 48, 60, 60);
      c.globalCompositeOperation = 'source-over'; c.fillStyle = '#ffd45a'; c.strokeStyle = '#c8782a'; c.lineWidth = 1.5; c.beginPath(); c.arc(mx, my1 - 18, 9, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = '#ffd45a'; c.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = i * 0.785 + t; c.beginPath(); c.moveTo(mx + Math.cos(a) * 12, my1 - 18 + Math.sin(a) * 12); c.lineTo(mx + Math.cos(a) * 16, my1 - 18 + Math.sin(a) * 16); c.stroke(); }
      c.restore();
    }
    P.vignette(c, W, H, 0.3 + 0.15 * (1 - d2), '#1a1030'); P.grain(c, W, H, 0.06);
  },
});
