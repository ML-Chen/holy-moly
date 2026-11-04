// BOARD! — drag the animals up into the ark before the rain gets heavy (Genesis 7).
MG.add({
  id: 'board', stage: 'ark', cmd: 'BOARD!', hint: 'drag', time: 5.5, mood: 'storm',
  card: { title: 'Two by two', ref: 'Genesis 6–9', kind: 'Ancient story', text: 'The book of Genesis tells how Noah and his family built a huge boat and welcomed every kind of animal aboard. After the flood, God put a rainbow in the sky and promised to care for every living creature.', note: 'People all over the ancient world told stories about a great flood, and Israel\'s version is about God caring for every living thing.', ask: 'How can you take care of animals and the earth this week?' },
  init(g) {
    const s = g.s, n = [2, 3, 3][g.level];
    const kinds = ['sheep', 'elephant', 'giraffe', 'cat', 'goat', 'camel', 'donkey', 'lion'].sort(() => Math.random() - 0.5);
    const slots = [[70, 560], [150, 600], [240, 585], [305, 540], [110, 495]].sort(() => Math.random() - 0.5);
    s.animals = Array.from({ length: n }, (_, i) => ({ kind: kinds[i], x: slots[i][0], y: slots[i][1], hx: slots[i][0], hy: slots[i][1], in: false, inT: 0, phase: Math.random() * 6 }));
    s.door = { x: 214, y: 352 }; s.drag = null;
  },
  down(g, x, y) { const s = g.s; let best = null, bd = 60; for (const a of s.animals) { if (a.in) continue; const d = Math.hypot(a.x - x, a.y - 22 - y); if (d < bd) { bd = d; best = a; } } if (best) { s.drag = best; best.ox = best.x - x; best.oy = best.y - y; g.sfx(ANIMAL_SOUND[best.kind] || 'pop'); } },
  move(g, x, y) { const a = g.s.drag; if (a) { a.x = x + a.ox; a.y = Math.max(330, y + a.oy); } },
  up(g) { const s = g.s, a = s.drag; s.drag = null; if (!a) return; if (Math.hypot(a.x - s.door.x, a.y - s.door.y) < 75 || (a.y < 420 && a.x > 120 && a.x < 300)) { a.in = true; a.inT = g.t; g.burst(s.door.x, s.door.y - 20, ['#ffd45a', '#fff', '#9fe0ff'], 12); g.sfx('pop'); if (s.animals.every(b => b.in)) g.win(); } else { a.hx = a.x; a.hy = a.y; } },
  update(g, dt) { const s = g.s; for (const a of s.animals) if (!a.in && a !== s.drag) { a.x += Math.sin(g.t * 1.3 + a.phase) * 8 * dt; } },
  auto(g, dt, synth) { // test bot: drag each animal to the door, one every 0.5 s
    const s = g.s, k = Math.floor((g.t - 0.5) / 0.3); if (g.t < 0.5 || k >= s.animals.length * 2) return;
    const a = s.animals[Math.floor(k / 2)]; if (!a || a.in) return;
    if (k % 2 === 0 && !s.drag) { synth('down', a.x, a.y - 22); synth('move', s.door.x, s.door.y + 22); } else if (k % 2 === 1 && s.drag) synth('up', s.door.x, s.door.y + 22);
  },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('ark_board_bg', o => {
      P.sky(o, W, H, ['#2c2a4a', '#5a5a86', '#c58a8a', '#f2c08a'], { x: 60, y: 300, r: 20, color: '#ffc98a', glow: 180 });
      P.hills(o, W, 400, 30, '#7a8a6a', '#55684a', { seed: 5, dabs: 40 });
      ARK.draw(o, 205, 420);
      P.hills(o, W, 470, 10, '#7f9a5a', '#5a7a40', { seed: 9, dabs: 80, rim: '#c8e09a' }); P.grassTufts(o, W, 470, 640, 60, '#7aa04a', 2); P.flowers(o, W, 480, 640, 14);
      ARK.ramp(o);
    }), 0, 0, W, H);
    P.stormBank(c, W, 40 + Math.min(40, t * 6), t, 2);
    // door glow pulses to show where animals go
    const pulse = 0.5 + 0.5 * Math.sin(t * 5); c.save(); const gl = c.createRadialGradient(s.door.x, s.door.y, 4, s.door.x, s.door.y, 60); gl.addColorStop(0, `rgba(255,220,140,${0.35 + 0.25 * pulse})`); gl.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = gl; c.fillRect(s.door.x - 60, s.door.y - 60, 120, 120); c.restore();
    const list = s.animals.slice().sort((a, b) => a.y - b.y);
    for (const a of list) {
      if (a.in) { const q = (t - a.inT) / 0.5; if (q > 1) continue; c.save(); c.globalAlpha = 1 - q; drawAnimal(c, a.kind, s.door.x, s.door.y + 4 - q * 6, 0.8 * (1 - q * 0.5), t, a.phase); c.restore(); continue; }
      const lifted = a === s.drag; if (lifted) { c.fillStyle = 'rgba(40,20,40,0.2)'; c.beginPath(); c.ellipse(a.x, a.y + 16, 20, 5, 0, 0, 7); c.fill(); }
      drawAnimal(c, a.kind, a.x, a.y + (lifted ? -10 : 0), 1.15 * (0.75 + (a.y - 330) / 310 * 0.35), t, a.phase, lifted);
    }
    P.person(c, 300, 470, 0.9, { skin: P.SKIN[2], robe: P.CLOTH.olive, stripe: P.CLOTH.cream, beard: '#e8e2da', hair: P.HAIR[5], head: 'wrap', expr: g.result === 'win' ? 'laugh' : 'happy', arms: g.result === 'win' ? 'cheer' : 'wave', t, facing: -1 });
    P.rain(c, W, H, t, 40 + Math.floor(t * 20), 'rgba(200,215,255,0.4)');
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
