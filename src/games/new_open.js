// OPEN! — swing open the gates of the new city, which are never shut, and everyone streams in (Revelation 21:25).
MG.add({
  id: 'open', stage: 'new', cmd: 'OPEN!', hint: 'swipe', time: 5, mood: 'party', winText: 'Welcome!',
  card: { title: 'Gates that never close', ref: 'Revelation 21–22', kind: 'Vision', text: 'John saw a vision of a shining city where God wipes every tear away. Its gates are never shut, and people from every nation walk in, with a river and a tree whose leaves bring healing.', ask: 'Who could you welcome in, at school or at home, who might feel shut out?' },
  init(g) {
    const s = g.s; s.open = 0; s.target = 0; s.need = [1, 2, 2][g.level]; s.swipes = 0; s.openedAt = -1;
    const r = P.rng(Math.floor(Math.random() * 1000) + 1);
    s.crowd = Array.from({ length: 9 }, (_, i) => ({ x: 40 + i * 35 + r() * 10, y: 560 + (i % 3) * 22, skin: P.SKIN[Math.floor(r() * 6)], robe: Object.values(P.CLOTH)[Math.floor(r() * 17)], hairStyle: ['short', 'curly', 'long', 'bun', 'bald'][Math.floor(r() * 5)], hair: P.HAIR[Math.floor(r() * 6)], child: r() < 0.35, phase: r() * 6, kind: i === 4 ? 'sheep' : i === 7 ? 'donkey' : null, walk: 0 }));
  },
  swipe(g, dx, dy) { const s = g.s; if (Math.abs(dx) > Math.abs(dy) * 0.8 && Math.abs(dx) > 40) { s.swipes++; s.target = Math.min(1, s.swipes / s.need); g.sfx(s.target >= 1 ? 'horn' : 'swoosh'); g.shake(3, 0.15); if (s.target >= 1) { s.openedAt = g.t; g.win(); g.burst(180, 330, ['#ffd45a', '#fff6c0', '#ff8ab0', '#8fd8ff'], 30, 260); g.sfx('cheer'); } } },
  auto(g, dt, synth) { const s = g.s; const k = Math.floor((g.t - 0.5) / 0.4); if (g.t > 0.5 && k >= s.swipes && s.target < 1 && !s.autoBusy) { s.autoBusy = 1; synth('down', 120, 330); synth('move', 240, 330); synth('up', 240, 330); synth('swipe', 160, 0, 900, 0); s.autoBusy = 0; } },
  update(g, dt) { const s = g.s; s.open += (s.target - s.open) * Math.min(1, dt * 7); if (s.openedAt >= 0) for (const p of s.crowd) p.walk = Math.min(1, p.walk + dt * (0.8 + p.phase * 0.05)); },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('new_open_bg', o => {
      P.sky(o, W, H, ['#7a6ad8', '#ff9ac0', '#ffd8a8', '#fff8e0'], { x: 180, y: 300, r: 30, color: '#fff6d0', glow: 320 });
      P.cloud(o, 60, 120, 0.9, '#fff8f0', '#e8a8c8', 0.9); P.cloud(o, 300, 90, 0.7, '#fff8f0', '#e8a8c8', 0.85);
      P.hills(o, W, 470, 26, '#a8d870', '#70a848', { seed: 41, dabs: 70, rim: '#e8ffb0' });
      P.flowers(o, W, 480, 640, 40, undefined, 12); P.grassTufts(o, W, 470, 640, 40, '#70a848', 7);
    }), 0, 0, W, H);
    // light from inside the city spills out as the gates open
    const k = s.open;
    P.rays(c, 180, 330, W, H, '#fff2c0', 0.08 + 0.22 * k, 11, t);
    // walls and towers
    const wall = (x, w) => { const gr = c.createLinearGradient(0, 220, 0, 470); gr.addColorStop(0, '#fff2d8'); gr.addColorStop(1, '#e8c890'); c.fillStyle = gr; c.fillRect(x, 250, w, 220); c.strokeStyle = 'rgba(160,110,60,0.35)'; c.lineWidth = 1; for (let y = 262; y < 470; y += 18) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.stroke(); } for (let i = 0; i < w / 16; i++) { c.fillStyle = '#f6e2bc'; c.fillRect(x + i * 16, 240, 10, 12); } };
    wall(0, 110); wall(250, 110);
    for (const tx of [96, 264]) { const gr = c.createLinearGradient(tx - 26, 0, tx + 26, 0); gr.addColorStop(0, '#fff6e4'); gr.addColorStop(1, '#e2bf86'); c.fillStyle = gr; c.fillRect(tx - 26, 190, 52, 280); c.fillStyle = '#f2d8a8'; for (let i = 0; i < 4; i++) c.fillRect(tx - 26 + i * 14, 178, 9, 14);
      c.fillStyle = '#7ad0e8'; c.beginPath(); c.arc(tx, 236, 9, Math.PI, 0); c.fillRect(tx - 9, 236, 18, 16); c.fill(); }
    // banners: welcome flags, including the pride flag
    P.prideFlag(c, 96, 178, 1.1, t);
    bannerFlag(c, 264, 178, t, ['#f6d23a', '#ffffff', '#3b6fd6']);
    // archway opening and the glowing city inside
    c.save(); c.beginPath(); c.moveTo(110, 470); c.lineTo(110, 300); c.arc(180, 300, 70, Math.PI, 0); c.lineTo(250, 470); c.closePath(); c.clip();
    const inside = c.createLinearGradient(0, 230, 0, 470); inside.addColorStop(0, '#fffbe8'); inside.addColorStop(1, '#ffe08a'); c.fillStyle = inside; c.fillRect(110, 230, 140, 240);
    // the tree of life and the river glimpsed inside
    c.fillStyle = 'rgba(120,200,240,0.8)'; c.beginPath(); c.moveTo(165, 470); c.quadraticCurveTo(178, 400, 182, 360); c.lineTo(186, 360); c.quadraticCurveTo(190, 400, 205, 470); c.fill();
    P.tree(c, 180, 380, 0.8, '#6ab85a', 3);
    // the doors swing open (scaled in x to suggest rotation)
    for (const side of [-1, 1]) { const w = 70 * (1 - k * 0.85), x0 = side < 0 ? 110 : 250 - w; const gr = c.createLinearGradient(x0, 0, x0 + w, 0); gr.addColorStop(0, side < 0 ? '#d8a050' : '#b8782e'); gr.addColorStop(1, side < 0 ? '#b8782e' : '#d8a050'); c.fillStyle = gr; c.fillRect(x0, 230, w, 240);
      c.strokeStyle = 'rgba(90,50,20,0.55)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x0 + w * i / 4, 230); c.lineTo(x0 + w * i / 4, 470); c.stroke(); }
      c.fillStyle = '#f6d36a'; for (let y = 270; y < 470; y += 50) for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x0 + w * (i + 0.5) / 3, y, 3, 0, 7); c.fill(); }
      c.fillStyle = '#8a5a20'; c.beginPath(); c.arc(side < 0 ? x0 + w - 8 : x0 + 8, 380, 4, 0, 7); c.fill(); }
    c.restore();
    c.strokeStyle = '#c89a5a'; c.lineWidth = 6; c.beginPath(); c.moveTo(110, 470); c.lineTo(110, 300); c.arc(180, 300, 70, Math.PI, 0); c.lineTo(250, 470); c.stroke();
    c.fillStyle = '#fff2c0'; for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; c.beginPath(); c.arc(180 + Math.cos(a) * 70, 300 + Math.sin(a) * 70, 4, 0, 7); c.fill(); }
    // the crowd, which walks in once the gates are open
    const list = s.crowd.slice().sort((a, b) => a.y - b.y);
    for (const p of list) {
      const w = p.walk, x = p.x + (180 - p.x) * w, y = p.y + (455 - p.y) * w, sc = 1.05 - w * 0.55; if (w >= 0.98) continue;
      c.save(); c.globalAlpha = 1 - Math.max(0, (w - 0.75) * 4);
      if (p.kind) P[p.kind](c, x, y, sc * 1.1, { t, phase: p.phase, hop: s.openedAt >= 0 });
      else P.person(c, x, y, sc, { skin: p.skin, robe: p.robe, stripe: P.CLOTH.cream, hairStyle: p.hairStyle, hair: p.hair, child: p.child, expr: s.openedAt >= 0 ? 'laugh' : 'wow', arms: s.openedAt >= 0 ? 'cheer' : 'down', t, phase: p.phase, bounce: s.openedAt >= 0 ? 2.5 : 1 });
      c.restore();
    }
    P.vignette(c, W, H, 0.22); P.grain(c, W, H, 0.06);
  },
});
function bannerFlag(c, x, y, t, cols) {
  c.save(); c.translate(x, y); c.strokeStyle = '#6b4a2e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -46); c.stroke();
  for (let i = 0; i < cols.length; i++) { c.fillStyle = cols[i]; c.beginPath(); const fh = 22 / cols.length;
    for (let k = 0; k <= 8; k++) { const xx = k / 8 * 34, yy = -46 + i * fh + Math.sin(t * 4 + k * 0.7 + 1) * 2 * (k / 8); k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    for (let k = 8; k >= 0; k--) { const xx = k / 8 * 34, yy = -46 + (i + 1) * fh + Math.sin(t * 4 + k * 0.7 + 1) * 2 * (k / 8); c.lineTo(xx, yy); } c.closePath(); c.fill(); }
  c.restore();
}
