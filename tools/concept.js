// concept.js — concept art panels for Holy Moly!, drawn with the real game art library (src/paint.js).
// Each panel is a 360x640 phone screen. Rendered by tools/concept_shot.py.
const W = 360, H = 640;
const C = P.CLOTH, S = P.SKIN, HR = P.HAIR;

const PANELS = {
  title(ctx, t) {
    P.sky(ctx, W, H, ['#3b2a6b', '#a8508a', '#f08a5d', '#ffd59a'], { x: 250, y: 300, r: 30, color: '#ffd38a', glow: 260 });
    P.stars(ctx, W, 200, 40, 4, t);
    P.cloud(ctx, 70, 150, 0.9, '#ffe6d6', '#c97aa0', 0.85); P.cloud(ctx, 290, 110, 0.7, '#ffe6d6', '#c97aa0', 0.8);
    P.rays(ctx, 250, 300, W, H, '#fff0c0', 0.16, 11, t);
    P.hills(ctx, W, 360, 50, '#b86a7a', '#7a4a6a', { seed: 3, freq: 0.01, dabs: 50 });
    // village on the far hill
    P.house(ctx, 40, 352, 34, 26, '#e7b98f'); P.house(ctx, 78, 346, 28, 30, '#f0c79c', { awning: C.teal }); P.house(ctx, 270, 350, 36, 24, '#e7b98f', { awning: C.rose }); P.house(ctx, 310, 356, 30, 28, '#dca77c');
    P.palm(ctx, 120, 360, 0.55, 0.2, t); P.palm(ctx, 250, 362, 0.5, -0.15, t, '#4a8a52');
    P.hills(ctx, W, 440, 40, '#e8a35e', '#c27a3e', { seed: 7, freq: 0.014, dabs: 90, rim: '#ffd9a0' });
    P.hills(ctx, W, 520, 30, '#d98a4a', '#a85f30', { seed: 11, freq: 0.018, dabs: 90, rim: '#ffcf8a' });
    P.flowers(ctx, W, 540, 640, 26, undefined, 3); P.grassTufts(ctx, W, 530, 640, 40, '#8a9a4a', 5);
    // title
    P.command(ctx, 'HOLY', 180, 96, 64, 1, { tilt: -0.07 }); P.command(ctx, 'MOLY!', 188, 160, 72, 1, { tilt: -0.07, fill2: '#ff9a5a' });
    // the welcoming crowd
    const crowd = [
      [52, 600, { skin: S[3], robe: C.indigo, stripe: C.gold, head: 'scarf', headCol: C.saffron, expr: 'laugh', arms: 'cheer' }],
      [104, 590, { skin: S[1], robe: C.teal, stripe: C.cream, hairStyle: 'curly', hair: HR[2], expr: 'happy', arms: 'wave', child: true }],
      [158, 604, { skin: S[4], robe: C.terracotta, stripe: C.cream, beard: true, hair: HR[0], head: 'wrap', headCol: C.white, expr: 'laugh', arms: 'out' }],
      [212, 592, { skin: S[2], robe: C.plum, stripe: C.gold, head: 'scarf', headCol: C.rose, expr: 'happy', arms: 'hold', hold: (c, x, y) => P.basket(c, x, y + 6, 0.6) }],
      [262, 604, { skin: S[5], robe: C.saffron, stripe: C.rust, hairStyle: 'short', hair: HR[3], expr: 'wow', arms: 'cheer', child: true }],
      [316, 594, { skin: S[2], robe: C.green, stripe: C.cream, hairStyle: 'bun', hair: HR[1], expr: 'happy', arms: 'down' }],
    ];
    P.prideFlag(ctx, 330, 556, 1, t);
    for (const [x, y, o] of crowd) P.person(ctx, x, y, 1.05, { ...o, t, phase: x });
    P.sheep(ctx, 290, 630, 0.9, { t, facing: -1 }); P.dove(ctx, 92, 250, 1.1, { t: t + 0.2, branch: true });
    P.vignette(ctx, W, H, 0.3); P.grain(ctx, W, H, 0.07);
    // play button
    ctx.save(); ctx.translate(180, 300); const g = ctx.createLinearGradient(0, -26, 0, 26); g.addColorStop(0, '#ffe08a'); g.addColorStop(1, '#f2a33a'); ctx.fillStyle = 'rgba(60,20,60,0.35)'; roundRect(ctx, -82, -22, 164, 52, 26); ctx.fill(); ctx.fillStyle = g; roundRect(ctx, -82, -28, 164, 52, 26); ctx.fill(); ctx.strokeStyle = '#7a3a1a'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    P.label(ctx, 'Play', 180, 298, 26, '#5a2414', 'center', 900);
  },
  board(ctx, t) {
    P.sky(ctx, W, H, ['#2c2a4a', '#5a5a86', '#c58a8a', '#f2c08a'], { x: 70, y: 330, r: 22, color: '#ffc98a', glow: 200 });
    P.stormBank(ctx, W, 70, t, 2);
    P.hills(ctx, W, 400, 30, '#7a8a6a', '#55684a', { seed: 5, dabs: 40 });
    // the ark
    ctx.save(); ctx.translate(205, 420);
    const hull = ctx.createLinearGradient(0, -60, 0, 30); hull.addColorStop(0, '#b07a48'); hull.addColorStop(1, '#6a4224');
    ctx.fillStyle = hull; ctx.strokeStyle = '#3e2412'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-150, -40); ctx.quadraticCurveTo(-120, 30, -40, 32); ctx.lineTo(80, 32); ctx.quadraticCurveTo(150, 20, 170, -46); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,30,10,0.5)'; ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-140 + i * 4, -30 + i * 12); ctx.quadraticCurveTo(10, -24 + i * 14, 162 - i * 6, -36 + i * 12); ctx.stroke(); }
    const cab = ctx.createLinearGradient(0, -110, 0, -40); cab.addColorStop(0, '#d8a46a'); cab.addColorStop(1, '#9a6a3a'); ctx.fillStyle = cab; ctx.fillRect(-80, -100, 170, 62); ctx.strokeRect(-80, -100, 170, 62);
    ctx.fillStyle = '#7a3a2a'; ctx.beginPath(); ctx.moveTo(-95, -98); ctx.lineTo(5, -140); ctx.lineTo(105, -98); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffcf7a'; for (let i = 0; i < 4; i++) { ctx.fillRect(-64 + i * 40, -88, 16, 14); } ctx.fillStyle = '#3a1e10'; ctx.fillRect(-10, -72, 34, 34);
    ctx.restore();
    // ramp
    ctx.fillStyle = '#8a5a30'; ctx.strokeStyle = '#3e2412'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(195, 386); ctx.lineTo(229, 386); ctx.lineTo(120, 540); ctx.lineTo(70, 540); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,20,10,0.4)'; for (let i = 1; i < 8; i++) { const k = i / 8; ctx.beginPath(); ctx.moveTo(195 - 125 * k, 386 + 154 * k); ctx.lineTo(229 - 109 * k, 386 + 154 * k); ctx.stroke(); }
    P.hills(ctx, W, 540, 14, '#7f9a5a', '#5a7a40', { seed: 9, dabs: 60 }); P.grassTufts(ctx, W, 545, 640, 50, '#7aa04a', 2);
    P.giraffe(ctx, 175, 432, 0.9, { t, facing: 1 }); P.elephant(ctx, 120, 500, 0.95, { t, facing: 1 });
    P.sheep(ctx, 70, 600, 1, { t, hop: true }); P.sheep(ctx, 110, 612, 1, { t, phase: 1, hop: true });
    P.cat(ctx, 300, 600, 1.1, { t, expr: 'grumpy', facing: -1 });
    P.person(ctx, 250, 610, 1.1, { skin: S[3], robe: C.olive, stripe: C.cream, head: 'scarf', headCol: C.terracotta, expr: 'laugh', arms: 'out', t });
    P.rain(ctx, W, 360, t, 50);
    P.command(ctx, 'BOARD!', 180, 80, 64); P.vignette(ctx, W, H, 0.35); P.grain(ctx, W, H, 0.07); hud(ctx, 4);
  },
  part(ctx, t) {
    P.sky(ctx, W, H, ['#183a5a', '#3a7a9a', '#9ad0c8', '#ffe6b0'], { x: 180, y: 250, r: 26, color: '#fff2c0', glow: 220 });
    P.rays(ctx, 180, 250, W, H, '#fff6d0', 0.2, 9, t);
    // sea floor path
    const floor = ctx.createLinearGradient(0, 300, 0, 640); floor.addColorStop(0, '#e8cf9a'); floor.addColorStop(1, '#c79a5a'); ctx.fillStyle = floor; ctx.beginPath(); ctx.moveTo(150, 300); ctx.lineTo(210, 300); ctx.lineTo(300, 640); ctx.lineTo(60, 640); ctx.closePath(); ctx.fill();
    // water walls
    for (const side of [-1, 1]) { ctx.save(); const x0 = side < 0 ? 0 : W; ctx.beginPath(); ctx.moveTo(x0, 260); for (let y = 260; y <= 640; y += 8) { const edge = side < 0 ? 150 - (y - 300) * 0.24 : 210 + (y - 300) * 0.24; ctx.lineTo(edge + Math.sin(y * 0.06 + t * 3) * 5 * side, y); } ctx.lineTo(x0, 640); ctx.closePath();
      const g = ctx.createLinearGradient(side < 0 ? 0 : W, 0, side < 0 ? 160 : 200, 0); g.addColorStop(0, '#0f4a6a'); g.addColorStop(0.7, '#2a90a8'); g.addColorStop(1, '#8fe0e0'); ctx.fillStyle = g; ctx.fill(); ctx.clip();
      for (let i = 0; i < 9; i++) { ctx.strokeStyle = 'rgba(220,255,255,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = 260; y <= 640; y += 10) { const xx = (side < 0 ? 20 + i * 15 : W - 20 - i * 15) + Math.sin(y * 0.04 + t * 2 + i) * 6; y === 260 ? ctx.moveTo(xx, y) : ctx.lineTo(xx, y); } ctx.stroke(); }
      P.fishShape(ctx, side < 0 ? 70 : 290, 400, 1.2 * side, '#f0a050'); P.fishShape(ctx, side < 0 ? 40 : 320, 470, 0.9 * side, '#f5d04a');
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let y = 262; y < 640; y += 18) { const edge = side < 0 ? 150 - (y - 300) * 0.24 : 210 + (y - 300) * 0.24; ctx.beginPath(); ctx.arc(edge + Math.sin(y * 0.06 + t * 3) * 5 * side, y, 3 + Math.sin(y + t * 5) * 1.5, 0, 7); ctx.fill(); } }
    P.person(ctx, 180, 470, 1.2, { skin: S[3], robe: C.teal, stripe: C.saffron, head: 'scarf', headCol: C.saffron, expr: 'laugh', arms: 'up', t, hold: undefined });
    // tambourine
    ctx.save(); ctx.translate(198, 400); ctx.fillStyle = '#e9c37a'; ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d9d9d9'; for (let i = 0; i < 5; i++) { const a = i * 1.26 + t; ctx.beginPath(); ctx.arc(Math.cos(a) * 9, Math.sin(a) * 9, 2, 0, 7); ctx.fill(); } ctx.restore();
    P.person(ctx, 140, 560, 1.3, { skin: S[4], robe: C.indigo, stripe: C.gold, beard: true, hair: HR[0], head: 'wrap', expr: 'wow', arms: 'cheer', t, phase: 2 });
    P.person(ctx, 228, 572, 1.25, { skin: S[1], robe: C.rose, stripe: C.cream, hairStyle: 'long', hair: HR[2], expr: 'happy', arms: 'wave', t, child: true, phase: 3 });
    P.goat(ctx, 100, 630, 1.2, { t }); P.sheep(ctx, 270, 636, 1.2, { t, facing: -1 });
    // swipe hint
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 12]); ctx.beginPath(); ctx.moveTo(110, 330); ctx.lineTo(250, 330); ctx.stroke(); ctx.restore();
    P.command(ctx, 'PART!', 180, 80, 70, 1, { fill2: '#8fe8ff' }); P.vignette(ctx, W, H, 0.3); P.grain(ctx, W, H, 0.07); hud(ctx, 3);
  },
  spit(ctx, t) {
    P.sky(ctx, W, H, ['#2a3a7a', '#6a6ab0', '#f09a8a', '#ffd89a'], { x: 280, y: 330, r: 28, color: '#ffcf8a', glow: 220 });
    P.cloud(ctx, 80, 170, 0.8, '#ffe0d0', '#b080b0', 0.8);
    P.water(ctx, W, 340, 470, '#1f4f7a', '#5aa0c0', t);
    P.bigFish(ctx, 120, 400, 1.15, { t, mouth: 0.9 });
    // beach
    const sand = ctx.createLinearGradient(0, 450, 0, 640); sand.addColorStop(0, '#f6dca8'); sand.addColorStop(1, '#d9a866'); ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(0, 520); ctx.quadraticCurveTo(160, 440, 360, 470); ctx.lineTo(360, 640); ctx.lineTo(0, 640); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 518); ctx.quadraticCurveTo(160, 438, 360, 468); ctx.stroke();
    P.palm(ctx, 320, 520, 0.9, -0.2, t); P.rock(ctx, 60, 600, 0.9);
    // Jonah mid-flight with a splash trail
    ctx.save(); ctx.strokeStyle = 'rgba(200,240,255,0.8)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.setLineDash([3, 10]); ctx.beginPath(); ctx.moveTo(190, 400); ctx.quadraticCurveTo(220, 290, 250, 420); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(240, 360); ctx.rotate(0.5); P.person(ctx, 0, 30, 1.2, { skin: S[2], robe: C.sky, stripe: C.white, beard: true, hair: HR[1], expr: 'surprised', arms: 'up', t: 0 }); ctx.restore();
    for (let i = 0; i < 7; i++) { ctx.fillStyle = 'rgba(210,245,255,0.85)'; ctx.beginPath(); ctx.arc(195 + Math.cos(i) * 18, 390 - i * 6, 4 - i * 0.3, 0, 7); ctx.fill(); }
    P.command(ctx, 'SPIT!', 180, 80, 70); P.vignette(ctx, W, H, 0.3); P.grain(ctx, W, H, 0.07); hud(ctx, 4);
  },
  share(ctx, t) {
    P.sky(ctx, W, H, ['#5aa8d8', '#9ad0e8', '#fbe8c0'], { x: 300, y: 90, r: 22, color: '#fff6d0', glow: 180 });
    P.cloud(ctx, 90, 120, 0.9); P.cloud(ctx, 250, 170, 0.6);
    P.water(ctx, W, 250, 320, '#2a7a9a', '#7ac8d8', t, { waves: 4 });
    P.hills(ctx, W, 270, 25, '#8ab06a', '#6a9050', { seed: 13, freq: 0.02, dabs: 30 });
    P.hills(ctx, W, 360, 40, '#a8c86a', '#7aa04a', { seed: 17, dabs: 90, rim: '#e8f0a0' });
    // seated crowd on the hillside
    const r = P.rng(4); for (let i = 0; i < 14; i++) { const x = 20 + (i % 7) * 52 + r() * 12, y = 380 + Math.floor(i / 7) * 36 + r() * 8; P.person(ctx, x, y, 0.62, { skin: S[Math.floor(r() * 6)], robe: Object.values(C)[Math.floor(r() * 16)], head: r() < 0.5 ? 'scarf' : undefined, headCol: Object.values(C)[Math.floor(r() * 16)], hairStyle: ['short', 'curly', 'long', 'bun'][Math.floor(r() * 4)], hair: HR[Math.floor(r() * 5)], expr: r() < 0.5 ? 'happy' : 'wow', arms: r() < 0.4 ? 'cheer' : 'down', t, phase: i, bounce: 0.6 }); }
    P.flowers(ctx, W, 440, 640, 30); P.grassTufts(ctx, W, 440, 640, 50, '#6a9a3a', 6);
    // Jesus and the boy with the lunch
    P.person(ctx, 120, 600, 1.35, { skin: S[3], robe: C.white, stripe: C.indigo, beard: true, hair: HR[1], hairStyle: 'long', expr: 'happy', arms: 'out', t });
    P.person(ctx, 230, 610, 1.3, { skin: S[2], robe: C.saffron, stripe: C.rust, hairStyle: 'curly', hair: HR[0], expr: 'laugh', arms: 'hold', child: true, t, hold: (c, x, y) => P.basket(c, x, y + 4, 0.9, 'bread') });
    // multiplying loaves floating up
    for (let i = 0; i < 6; i++) { const a = t * 2 + i; P.loaf(ctx, 160 + i * 28 + Math.sin(a) * 4, 470 - (i % 3) * 22 + Math.cos(a) * 4, 0.9); }
    P.fishShape(ctx, 300, 455, 1.1, '#9fc3d6');
    P.command(ctx, 'SHARE!', 180, 80, 64, 1, { fill2: '#ffb36a' }); P.vignette(ctx, W, H, 0.25); P.grain(ctx, W, H, 0.07); hud(ctx, 2);
  },
  see(ctx, t) {
    P.sky(ctx, W, H, ['#141a3e', '#3a2f6a', '#c06a6a', '#ffc27a'], { x: 300, y: 420, r: 20, color: '#ffb46a', glow: 220 });
    P.stars(ctx, W, 300, 90, 9, t);
    P.hills(ctx, W, 420, 50, '#a85a5a', '#6a3a4a', { seed: 21, freq: 0.008, dabs: 40 });
    P.hills(ctx, W, 500, 40, '#e09a5a', '#b8703a', { seed: 23, freq: 0.012, dabs: 100, rim: '#ffd09a' });
    // the well, glowing
    ctx.save(); ctx.translate(250, 560);
    const glow = ctx.createRadialGradient(0, -10, 2, 0, -10, 90); glow.addColorStop(0, 'rgba(160,240,255,0.65)'); glow.addColorStop(1, 'rgba(160,240,255,0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, -10, 90, 0, 7); ctx.fill();
    const st = ctx.createLinearGradient(-34, -30, 34, 10); st.addColorStop(0, '#c8a47a'); st.addColorStop(1, '#7a5a3a'); ctx.fillStyle = st; ctx.strokeStyle = '#4a321e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 36, 12, 0, 0, Math.PI); ctx.lineTo(-36, -24); ctx.ellipse(0, -24, 36, 12, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(70,40,20,0.5)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, -16 + i * 8, 36, 12, 0, 0.1, Math.PI - 0.1); ctx.stroke(); }
    const wg = ctx.createRadialGradient(0, -24, 2, 0, -24, 30); wg.addColorStop(0, '#d8ffff'); wg.addColorStop(1, '#3aa0c0'); ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(0, -24, 30, 9, 0, 0, 7); ctx.fill();
    ctx.restore();
    for (let i = 0; i < 10; i++) { const a = t * 1.5 + i * 0.63; ctx.fillStyle = `rgba(220,255,255,${0.5 + 0.5 * Math.sin(a * 2)})`; ctx.beginPath(); ctx.arc(250 + Math.cos(a) * 50, 520 - (i * 12 + t * 20) % 120, 2, 0, 7); ctx.fill(); }
    P.palm(ctx, 330, 540, 0.7, -0.1, t); P.rock(ctx, 40, 610, 1.1, '#c88a5a');
    P.person(ctx, 130, 600, 1.35, { skin: S[4], robe: C.rust, stripe: C.gold, head: 'scarf', headCol: C.indigo, expr: 'wow', arms: 'reach', t });
    P.person(ctx, 78, 612, 1.05, { skin: S[4], robe: C.sand, stripe: C.rust, hairStyle: 'curly', hair: HR[0], expr: 'surprised', arms: 'down', child: true, t, phase: 2 });
    // tap ring hint
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(250, 536, 26 + Math.sin(t * 4) * 3, 0, 7); ctx.stroke(); ctx.restore();
    P.command(ctx, 'SEE!', 180, 80, 76, 1, { fill2: '#9fe8ff' }); P.vignette(ctx, W, H, 0.35); P.grain(ctx, W, H, 0.07); hud(ctx, 1);
  },
};

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
// the in-game heads-up display: loaves of bread as lives and a timer fuse
function hud(ctx, loaves) {
  for (let i = 0; i < 4; i++) P.loaf(ctx, 26 + i * 32, 616, 1, i >= loaves);
  ctx.save(); ctx.fillStyle = 'rgba(40,20,50,0.35)'; roundRect(ctx, 160, 608, 184, 14, 7); ctx.fill(); const g = ctx.createLinearGradient(160, 0, 344, 0); g.addColorStop(0, '#ffd45a'); g.addColorStop(1, '#ff7a4a'); ctx.fillStyle = g; roundRect(ctx, 160, 608, 120, 14, 7); ctx.fill(); ctx.restore();
}

function lineup(ctx, t) {
  const bg = ctx.createLinearGradient(0, 0, 0, 300); bg.addColorStop(0, '#fff3dc'); bg.addColorStop(1, '#f6d9b4'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 300);
  const cast = [
    ['Eve', { skin: S[2], robe: C.green, stripe: C.cream, hairStyle: 'long', hair: HR[0], expr: 'happy', arms: 'wave' }],
    ['Noah', { skin: S[2], robe: C.olive, stripe: C.cream, beard: '#e8e2da', hair: HR[5], head: 'wrap', expr: 'laugh', arms: 'out' }],
    ['Sarah', { skin: S[1], robe: C.plum, stripe: C.gold, hairStyle: 'bun', hair: HR[5], expr: 'laugh', arms: 'hold' }],
    ['Hagar', { skin: S[4], robe: C.rust, stripe: C.gold, head: 'scarf', headCol: C.indigo, expr: 'wow', arms: 'reach' }],
    ['Miriam', { skin: S[2], robe: C.teal, stripe: C.saffron, hairStyle: 'curly', hair: HR[0], expr: 'laugh', arms: 'cheer' }],
    ['Ruth', { skin: S[1], robe: C.sand, stripe: C.terracotta, hairStyle: 'bun', hair: HR[2], expr: 'happy', arms: 'hold', hold: (c, x, y) => { c.fillStyle = '#e9c35a'; for (let i = -2; i <= 2; i++) { c.save(); c.translate(x + i * 3, y); c.rotate(i * 0.2); c.fillRect(-1, -22, 2, 22); c.restore(); } } }],
    ['David', { skin: S[2], robe: C.sky, stripe: C.white, hairStyle: 'curly', hair: HR[4], expr: 'happy', arms: 'wave', child: true }],
    ['Esther', { skin: S[1], robe: C.royal, stripe: C.gold, hairStyle: 'long', hair: HR[0], head: 'crown', expr: 'happy', arms: 'down' }],
    ['Jonah', { skin: S[2], robe: C.sky, stripe: C.white, beard: true, hair: HR[1], expr: 'grumpy', arms: 'down' }],
    ['Mary', { skin: S[2], robe: C.indigo, stripe: C.sky, head: 'scarf', headCol: C.sky, expr: 'happy', arms: 'pray' }],
    ['Jesus', { skin: S[3], robe: C.white, stripe: C.indigo, beard: true, hairStyle: 'long', hair: HR[1], expr: 'happy', arms: 'out' }],
    ['Zacchaeus', { skin: S[1], robe: C.saffron, stripe: C.rust, hairStyle: 'bald', beard: true, hair: HR[0], expr: 'wow', arms: 'cheer' }],
    ['Mary M.', { skin: S[2], robe: C.rose, stripe: C.cream, hairStyle: 'long', hair: HR[2], expr: 'laugh', arms: 'cheer' }],
    ['Lydia', { skin: S[0], robe: C.plum, stripe: C.gold, hairStyle: 'bun', hair: HR[0], expr: 'happy', arms: 'down' }],
  ];
  cast.forEach(([name, o], i) => { const x = 40 + i * 77; P.person(ctx, x, 230, 1.45, { ...o, t, phase: i }); P.label(ctx, name, x, 268, 15, '#5a2a3a'); });
  const zoo = [['sheep', 0.8], ['dove', 1], ['lion', 0.9], ['elephant', 0.6], ['giraffe', 0.65], ['camel', 0.75], ['donkey', 0.85], ['cat', 1], ['goat', 0.9]];
  // second row drawn by caller
  return zoo;
}
