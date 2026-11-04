// SEE! — Hagar and her son are out of water in the desert; tap the hidden well when it glints (Genesis 21:19).
MG.add({
  id: 'see', stage: 'family', cmd: 'SEE!', hint: 'tap', time: 5, mood: 'desert',
  card: { title: 'The God who sees', ref: 'Genesis 16 and 21', kind: 'Ancient story', text: 'Genesis tells about Hagar, an enslaved Egyptian woman who ran away into the desert. God found her by a spring, and Hagar called God "the God who sees me." Years later, when she and her son ran out of water, God showed her a well.', note: 'Hagar\'s story is one of the very old stories Israel told about Abraham\'s family. It shows that God sees and cares for people whom others push aside.', ask: 'Who might feel unseen at your school or church? How could you notice them?' },
  init(g) {
    const s = g.s; const spots = [[70, 470], [175, 455], [290, 470], [110, 545], [255, 540]].sort(() => Math.random() - 0.5);
    s.well = { x: spots[0][0], y: spots[0][1] }; s.rocks = spots.slice(1, 2 + g.level * 2).map(([x, y]) => ({ x, y }));
    s.found = false; s.foundT = 0; s.puffs = [];
  },
  down(g, x, y) {
    const s = g.s; if (s.found) return;
    if (Math.hypot(x - s.well.x, y - (s.well.y - 10)) < 44) { s.found = true; s.foundT = g.t; g.sfx('splash'); g.burst(s.well.x, s.well.y - 20, ['#bff4ff', '#7fd8f0', '#ffffff'], 22, 200); g.win(); }
    else { s.puffs.push({ x, y, t: g.t }); g.sfx('rustle'); }
  },
  auto(g, dt, synth) { if (g.t > 1.6 && !g.s.found && !g.s.tapped) { g.s.tapped = 1; synth('down', g.s.well.x, g.s.well.y - 10); synth('up', g.s.well.x, g.s.well.y - 10); } },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('family_see_bg', o => {
      P.sky(o, W, H, ['#141a3e', '#3a2f6a', '#c06a6a', '#ffc27a'], { x: 300, y: 400, r: 20, color: '#ffb46a', glow: 220 });
      P.stars(o, W, 300, 90, 9, 0);
      P.hills(o, W, 410, 50, '#a85a5a', '#6a3a4a', { seed: 21, freq: 0.008, dabs: 40 });
      P.hills(o, W, 470, 34, '#e09a5a', '#b8703a', { seed: 23, freq: 0.012, dabs: 120, rim: '#ffd09a' });
      P.palm(o, 335, 470, 0.7, -0.1, 0);
    }), 0, 0, W, H);
    // twinkle a few stars live
    P.stars(c, W, 260, 12, 31, t);
    // the well: hidden until found, but it glints so sharp eyes can spot it
    const w = s.well;
    if (s.found) {
      const q = Math.min(1, (t - s.foundT) * 3);
      c.save(); const glow = c.createRadialGradient(w.x, w.y - 14, 2, w.x, w.y - 14, 110 * q); glow.addColorStop(0, 'rgba(170,240,255,0.7)'); glow.addColorStop(1, 'rgba(170,240,255,0)'); c.fillStyle = glow; c.beginPath(); c.arc(w.x, w.y - 14, 110 * q + 1, 0, 7); c.fill(); c.restore();
      drawWell(c, w.x, w.y, 0.6 + 0.4 * q);
      for (let i = 0; i < 6; i++) { const a = (t - s.foundT) * 2 + i; c.fillStyle = 'rgba(200,250,255,0.8)'; c.beginPath(); c.arc(w.x + Math.sin(a * 1.7) * 26, w.y - 30 - ((a * 30) % 60), 2.2, 0, 7); c.fill(); }
    } else {
      // a mound of sand covers the well
      c.fillStyle = '#d99a5a'; c.beginPath(); c.ellipse(w.x, w.y - 4, 40, 15, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#e8b070'; c.beginPath(); c.ellipse(w.x - 6, w.y - 8, 26, 8, 0, Math.PI, 0); c.fill();
      const tw = Math.max(0, Math.sin(t * 4.2 - 1)) ** 3 * [1, 0.8, 0.6][g.level];
      if (tw > 0.05) { c.save(); c.globalAlpha = tw; c.fillStyle = '#e8ffff'; drawStar(c, w.x + 6, w.y - 14, 9, t); c.fillStyle = 'rgba(200,255,255,0.4)'; c.beginPath(); c.arc(w.x + 6, w.y - 14, 18, 0, 7); c.fill(); c.restore(); }
    }
    for (const r of s.rocks) P.rock(c, r.x, r.y, 1.1, '#c88a5a');
    for (const p of s.puffs) { const q = (t - p.t) / 0.5; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; c.fillStyle = '#f0c890'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(p.x + Math.cos(i * 1.3) * q * 20, p.y + Math.sin(i * 1.3) * q * 10, 6 * (1 - q * 0.5), 0, 7); c.fill(); } c.restore(); }
    const happy = s.found;
    P.person(c, 120, 612, 1.4, { skin: P.SKIN[4], robe: P.CLOTH.rust, stripe: P.CLOTH.gold, head: 'scarf', headCol: P.CLOTH.indigo, expr: happy ? 'laugh' : 'sad', arms: happy ? 'cheer' : 'reach', t });
    P.person(c, 64, 620, 1.05, { skin: P.SKIN[4], robe: P.CLOTH.sand, stripe: P.CLOTH.rust, hairStyle: 'curly', hair: P.HAIR[0], expr: happy ? 'wow' : 'sad', arms: happy ? 'cheer' : 'down', child: true, t, phase: 2 });
    P.vignette(c, W, H, 0.35); P.grain(c, W, H, 0.06);
  },
});
function drawWell(c, x, y, s = 1) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const st = c.createLinearGradient(-34, -30, 34, 10); st.addColorStop(0, '#c8a47a'); st.addColorStop(1, '#7a5a3a'); c.fillStyle = st; c.strokeStyle = '#4a321e'; c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 36, 12, 0, 0, Math.PI); c.lineTo(-36, -24); c.ellipse(0, -24, 36, 12, 0, Math.PI, 0, true); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(70,40,20,0.5)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, -16 + i * 8, 36, 12, 0, 0.1, Math.PI - 0.1); c.stroke(); }
  const wg = c.createRadialGradient(0, -24, 2, 0, -24, 30); wg.addColorStop(0, '#d8ffff'); wg.addColorStop(1, '#3aa0c0'); c.fillStyle = wg; c.beginPath(); c.ellipse(0, -24, 30, 9, 0, 0, 7); c.fill();
  c.restore();
}
