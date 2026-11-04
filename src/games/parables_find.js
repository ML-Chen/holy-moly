// FIND! — Luke 15:4–6. One lamb is lost on the hillside; its tail and ears peek out from behind a rock or bush. Tap it, and the shepherd carries it home on his shoulders.
const SHEP = { skin: P.SKIN[3], robe: P.CLOTH.olive, stripe: P.CLOTH.cream, sash: P.CLOTH.rust, head: 'wrap', headCol: P.CLOTH.sand, beard: true, hair: P.HAIR[1] };
const SLOTS = [[78, 392], [186, 368], [292, 398], [118, 470], [238, 462], [64, 548], [176, 552], [322, 486]];
const SHX = 296, SHY = 626;

function bush(c, x, y, s, t, shake, seed) {
  const r = P.rng(seed), sw = Math.sin(t * 1.6 + seed) * 1.2 + Math.sin(shake * 40) * 6 * Math.max(0, 1 - shake * 2.5);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,30,30,0.22)'; c.beginPath(); c.ellipse(0, 0, 44, 9, 0, 0, 7); c.fill();
  const blobs = [];
  for (const [n, y, rr, w] of [[6, -11, 13, 36], [5, -25, 14, 28], [3, -39, 13, 15], [1, -48, 11, 0]]) for (let i = 0; i < n; i++) blobs.push([n === 1 ? 0 : -w + (2 * w) * i / (n - 1) + (r() - 0.5) * 5, y + (r() - 0.5) * 4, rr + r() * 3]);
  for (const [bx, by, br] of blobs) { c.fillStyle = '#3d6838'; c.beginPath(); c.arc(bx + 2, by + 3, br, 0, 7); c.fill(); }
  for (const [bx, by, br] of blobs) { const k = (-by) / 50, gr = c.createRadialGradient(bx - br * 0.45 + sw * k, by - br * 0.5, 1, bx + sw * k * 0.5, by, br); gr.addColorStop(0, P.mix('#8fc062', '#e0f09a', k * 0.5)); gr.addColorStop(0.7, '#5f9a4a'); gr.addColorStop(1, '#4a7e40'); c.fillStyle = gr; c.beginPath(); c.arc(bx + sw * k, by, br * 0.92, 0, 7); c.fill(); }
  for (let i = 0; i < 4; i++) { const bx = (r() - 0.5) * 56 + sw * 0.5, by = -12 - r() * 30; c.fillStyle = i % 2 ? '#e86a7a' : '#f4d35e'; c.beginPath(); c.arc(bx, by, 2.2, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,250,200,0.35)'; for (let i = 0; i < 9; i++) { const bx = (r() - 0.5) * 50 + sw, by = -20 - r() * 22; c.beginPath(); c.ellipse(bx, by, 3, 1.6, -0.5, 0, 7); c.fill(); }
  c.restore();
}
function boulder(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,30,30,0.24)'; c.beginPath(); c.ellipse(2, 0, 42, 9, 0, 0, 7); c.fill();
  const gr = c.createLinearGradient(-30, -50, 30, 0); gr.addColorStop(0, '#e6d2b4'); gr.addColorStop(0.5, '#b8a088'); gr.addColorStop(1, '#7a6458'); c.fillStyle = gr; c.strokeStyle = '#5a4640'; c.lineWidth = 1.8;
  c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-44, -26, -22, -40); c.quadraticCurveTo(0, -52, 22, -40); c.quadraticCurveTo(42, -26, 40, 0); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,245,220,0.4)'; c.beginPath(); c.ellipse(-14, -34, 12, 5, -0.4, 0, 7); c.fill();
  c.strokeStyle = 'rgba(90,70,60,0.45)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(6, -44); c.lineTo(10, -30); c.lineTo(4, -20); c.stroke();
  c.fillStyle = '#7fa04a'; for (const [mx, my] of [[-30, -6], [-20, -3], [28, -5]]) { c.beginPath(); c.ellipse(mx, my, 7, 3, 0, 0, 7); c.fill(); }
  c.restore();
}
function puffFlower(c, x, y, s, t, ph) { // fluffy white flower (a decoy that looks a bit like a tail)
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + ph) * 0.08); c.scale(s, s);
  c.strokeStyle = '#5a8a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-2, -8, 0, -16); c.stroke();
  c.fillStyle = '#6a9a44'; c.beginPath(); c.ellipse(-4, -5, 4, 1.8, 0.5, 0, 7); c.fill();
  for (let i = 0; i < 7; i++) { const a = i * 0.9; const gr = c.createRadialGradient(Math.cos(a) * 3 - 1, -18 + Math.sin(a) * 3 - 1, 0.5, Math.cos(a) * 3, -18 + Math.sin(a) * 3, 5); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#e4e0d4'); c.fillStyle = gr; c.beginPath(); c.arc(Math.cos(a) * 3.5, -18 + Math.sin(a) * 3.5, 4.4, 0, 7); c.fill(); }
  c.restore();
}
function note(c, x, y, a) { c.save(); c.globalAlpha = a; c.fillStyle = '#fff8e8'; c.strokeStyle = '#fff8e8'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y, 3.4, 2.6, -0.4, 0, 7); c.fill(); c.beginPath(); c.moveTo(x + 3, y - 1); c.lineTo(x + 3, y - 12); c.quadraticCurveTo(x + 7, y - 9, x + 8, y - 6); c.stroke(); c.restore(); }
function heartF(c, x, y, r, col) { c.save(); c.translate(x, y); c.fillStyle = col; c.beginPath(); c.moveTo(0, r * 0.9); c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.75, -r * 1.25, 0, -r * 0.45); c.bezierCurveTo(r * 0.75, -r * 1.25, r * 1.4, -r * 0.1, 0, r * 0.9); c.fill(); c.restore(); }

MG.add({
  id: 'find', stage: 'parables', cmd: 'FIND!', hint: 'tap', time: 5, mood: 'bright', winText: 'Found!',
  card: { title: 'The lost sheep', ref: 'Luke 15:3–7', kind: 'Parable', text: 'Jesus told a story about a shepherd with a hundred sheep who lost just one. He left the others and searched until he found it. Then he carried it home on his shoulders and called his friends to celebrate with him.', ask: 'Have you ever felt lost or left out? How does it feel to know God comes looking for you?' },
  init(g) {
    const s = g.s, L = g.level, n = [3, 5, 7][L];
    const slots = SLOTS.slice().sort(() => Math.random() - 0.5).slice(0, n);
    s.spots = slots.map(([x, y], i) => ({ x, y, kind: (i + Math.floor(Math.random() * 2)) % 2 ? 'rock' : 'bush', shake: 9, seed: 3 + i * 7, side: Math.random() < 0.5 ? -1 : 1 }));
    s.lamb = s.spots[0]; s.found = false; s.foundT = 0; s.period = [1.4, 1.7, 2.0][L] / Math.sqrt(g.speed); s.ph = 0.25 + Math.random() * 0.3;
    s.decoys = []; const nd = [0, 3, 5][L];
    for (let i = 1; i <= nd; i++) { const sp = s.spots[i % n === 0 ? 1 : i % n]; s.decoys.push({ x: sp.x + (Math.random() < 0.5 ? -1 : 1) * (36 + Math.random() * 10), y: sp.y + 2 + Math.random() * 6, s: 1.0 + Math.random() * 0.3, ph: i, puff: 9 }); }
    s.birds = []; s.notes = []; s.lastPeek = -1;
  },
  down(g, x, y) {
    const s = g.s; if (s.found) return;
    const L = s.lamb; if (Math.hypot(x - L.x, y - (L.y - 24)) < 48) { s.found = true; s.foundT = g.t; g.sfx('baa'); g.burst(L.x, L.y - 40, ['#fff', '#ffe08a', '#ff9ab0'], 18, 170); g.win(); return; }
    for (const d of s.decoys) if (Math.hypot(x - d.x, y - (d.y - 18)) < 20) { d.puff = 0; g.sfx('pop'); return; }
    for (const sp of s.spots) if (Math.hypot(x - sp.x, y - (sp.y - 24)) < 48) { sp.shake = 0; g.sfx('rustle'); if (sp.kind === 'bush') s.birds.push({ x: sp.x, y: sp.y - 40, t: g.t, d: Math.random() < 0.5 ? -1 : 1 }); return; }
  },
  update(g, dt) {
    const s = g.s; for (const sp of s.spots) sp.shake += dt; for (const d of s.decoys) d.puff += dt;
    const k = Math.floor((g.t / s.period) - s.ph);
    if (!s.found && k > s.lastPeek && ((g.t / s.period) - s.ph) % 1 < 0.1 && g.t > 0.3) { s.lastPeek = k; s.notes.push({ t: g.t }); g.sfx('baa'); }
  },
  auto(g, dt, synth) { const s = g.s; if (g.t > 1.3 && !s.found && !s.tapped) { s.tapped = 1; synth('down', s.lamb.x, s.lamb.y - 24); synth('up', s.lamb.x, s.lamb.y - 24); } },
  draw(g, c) {
    const s = g.s, t = g.t;
    c.drawImage(g.bake('parables_find_bg', o => {
      P.sky(o, W, H, ['#5f8fd0', '#a6c8e0', '#ffe6b8', '#ffc88a'], { x: 70, y: 210, r: 26, color: '#ffe0a0', glow: 280 });
      P.rays(o, 70, 210, W, H, '#fff4cc', 0.13, 10, 0);
      P.hills(o, W, 262, 50, '#b0bcd8', '#a0b0c8', { seed: 29, freq: 0.008, dabs: 10, rim: '#eef0ff' });
      P.hills(o, W, 282, 40, '#9ab8b8', '#86a8a0', { seed: 31, freq: 0.01, dabs: 20, rim: '#e8f4e8' });
      // the far fold where the ninety-nine wait safely, and the village beyond
      P.hills(o, W, 300, 26, '#a8c48a', '#8eb070', { seed: 33, freq: 0.014, dabs: 30, rim: '#f0f8c8' });
      o.save(); o.translate(286, 290); o.fillStyle = '#c8b898'; o.beginPath(); o.ellipse(0, 0, 40, 9, 0, 0, 7); o.fill(); o.fillStyle = '#a89a80'; o.beginPath(); o.ellipse(0, 1, 40, 9, 0, 0, Math.PI); o.fill(); o.fillStyle = '#9ab878'; o.beginPath(); o.ellipse(0, -1, 35, 6, 0, 0, 7); o.fill();
      const r = P.rng(4); for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = Math.sqrt(r()); const sx = Math.cos(a) * 30 * d, sy = -1 + Math.sin(a) * 4.5 * d; o.fillStyle = '#fffaf0'; o.beginPath(); o.ellipse(sx, sy - 1.5, 2.6, 1.8, 0, 0, 7); o.fill(); o.fillStyle = '#4a3a3a'; o.fillRect(sx + 2, sy - 2.5, 1.2, 1.4); } o.restore();
      P.house(o, 30, 300, 18, 13, '#f0d8b0'); P.house(o, 52, 302, 14, 15, '#e8c8a0'); P.house(o, 70, 300, 16, 11, '#f0d0a8');
      P.hills(o, W, 340, 34, '#b4d07a', '#8db45c', { seed: 37, freq: 0.012, dabs: 60, rim: '#f4fcc0' });
      const hz = o.createLinearGradient(0, 240, 0, 360); hz.addColorStop(0, 'rgba(255,236,200,0)'); hz.addColorStop(1, 'rgba(255,236,200,0.28)'); o.fillStyle = hz; o.fillRect(0, 240, W, 120);
      P.tree(o, 30, 352, 0.55, '#6f9a4a', 5); P.tree(o, 340, 340, 0.45, '#6f9a4a', 8);
      P.hills(o, W, 420, 26, '#9cc865', '#72a048', { seed: 41, freq: 0.01, dabs: 140, rim: '#e8f8a8' });
      // a winding path down the hillside toward home
      o.save(); const pg = o.createLinearGradient(0, 330, 0, 640); pg.addColorStop(0, 'rgba(240,214,160,0.5)'); pg.addColorStop(1, 'rgba(236,206,150,0.9)'); o.fillStyle = pg; o.beginPath(); o.moveTo(210, 336); o.bezierCurveTo(150, 400, 300, 470, 220, 540); o.quadraticCurveTo(170, 600, 236, 640); o.lineTo(330, 640); o.quadraticCurveTo(250, 600, 262, 540); o.bezierCurveTo(330, 470, 176, 400, 220, 336); o.closePath(); o.fill(); o.restore();
      P.hills(o, W, 600, 12, '#86b852', '#5f9038', { seed: 43, freq: 0.02, dabs: 50, rim: '#d8f090' });
      P.grassTufts(o, W, 360, 640, 90, '#6a9a3e', 12); P.flowers(o, W, 360, 640, 40, ['#f4d35e', '#ee6c8a', '#b98ae0', '#ff9a5a'], 13);
    }), 0, 0, W, H);
    P.cloud(c, (270 + t * 6) % 460 - 40, 112, 0.75, '#fffaf0', '#f0c8b8', 0.9); P.cloud(c, (150 + t * 3) % 460 - 40, 60, 0.45, '#fffaf0', '#f0c8b8', 0.7);
    for (let i = 0; i < 3; i++) { const bx = 210 + i * 20 + Math.sin(t * 0.8 + i) * 14 + t * 8, by = 170 + i * 10 + Math.cos(t + i * 2) * 5, f = Math.sin(t * 9 + i * 2) * 3; c.strokeStyle = 'rgba(70,60,90,0.55)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx - 6, by - f); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 6, by - f); c.stroke(); }
    // warm drifting light motes
    for (let i = 0; i < 14; i++) { const a = t * 0.4 + i * 1.7, x = (i * 53 + Math.sin(a) * 20 + t * 6) % W, y = 250 + (i * 37) % 300 + Math.cos(a * 1.3) * 10; c.fillStyle = `rgba(255,246,200,${0.35 + 0.3 * Math.sin(t * 2 + i)})`; c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); }
    // hiding places, back to front, with the lamb tucked behind its spot
    const L = s.lamb, cyc = ((t / s.period) - s.ph) % 1, peek = s.found ? 0 : Math.max(0, Math.sin(Math.min(1, Math.max(0, cyc) / 0.45) * Math.PI)) * (t > 0.3 ? 1 : 0);
    const tailOn = !s.found && (g.level < 2 || peek > 0.1);
    const list = s.spots.slice().sort((a, b) => a.y - b.y);
    for (const sp of list) {
      if (sp === L) {
        if (s.found) { const q = Math.min(1, (t - s.foundT) / 0.55), e = q * q * (3 - 2 * q); if (q < 1) { const lx = L.x + (SHX - L.x) * e, ly = L.y - 20 + (SHY - 92 - (L.y - 20)) * e - Math.sin(e * Math.PI) * 90; P.sheep(c, lx, ly, 1.25, { t, hop: true, facing: -1 }); } }
        else { // ears and head bob up above the hiding spot; a little tail wiggles out the side
          if (peek > 0.02) { c.save(); c.beginPath(); c.rect(L.x - 60, 0, 120, L.y - (sp.kind === 'rock' ? 40 : 50) * 1.1 + 6); c.clip(); P.sheep(c, L.x - sp.side * 6, L.y - 8 - peek * 28 + (sp.kind === 'rock' ? 0 : -4), 1.2, { t, facing: sp.side }); c.restore(); }
          if (tailOn) { const tx = L.x - sp.side * (sp.kind === 'rock' ? 44 : 50), ty = L.y - 14, w = Math.sin(t * 14) * 3; c.save(); c.translate(tx + w * 0.3 * -sp.side, ty + w * 0.3); const gr = c.createRadialGradient(-1, -2, 0.5, 0, 0, 7); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#e2dccd'); c.fillStyle = gr; for (const [dx, dy] of [[0, 0], [-sp.side * 4, -3], [-sp.side * 4, 3]]) { c.beginPath(); c.arc(dx, dy, 5.2, 0, 7); c.fill(); } c.restore(); }
        }
      }
      if (sp.kind === 'bush') bush(c, sp.x, sp.y, 1.1, t, sp.shake, sp.seed); else boulder(c, sp.x, sp.y, 1.1);
      for (const d of s.decoys) if (Math.abs(d.y - sp.y) < 10 && Math.abs(d.x - sp.x) < 60) { if (d.puff < 0.6) { const q = d.puff / 0.6; c.fillStyle = `rgba(255,255,255,${1 - q})`; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(d.x + Math.cos(i) * q * 22, d.y - 18 - q * 20 + Math.sin(i * 2) * q * 8, 2.2, 0, 7); c.fill(); } } puffFlower(c, d.x, d.y, d.s, t, d.ph); }
    }
    // little baa notes float up from the hiding place
    for (const n of s.notes) { const a = t - n.t; if (a > 1) continue; note(c, L.x + 14 + Math.sin(a * 6) * 6, L.y - 60 - a * 40, 1 - a); note(c, L.x - 6 + Math.sin(a * 5 + 2) * 6, L.y - 50 - a * 30, (1 - a) * 0.8); }
    // a startled sparrow flies out of a bush that was only a bush
    for (const b of s.birds) { const a = t - b.t; if (a > 0.8) continue; c.save(); c.globalAlpha = 1 - a / 0.8; c.translate(b.x + b.d * a * 120, b.y - a * 90); c.scale(b.d, 1); c.fillStyle = '#a07050'; c.beginPath(); c.ellipse(0, 0, 6, 4, 0, 0, 7); c.fill(); c.fillStyle = '#c89070'; const f = Math.sin(a * 60) * 5; c.beginPath(); c.moveTo(-2, -1); c.lineTo(-6, -6 - f); c.lineTo(3, -2); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(4, -1.5, 0.9, 0, 7); c.fill(); c.restore(); }
    // the shepherd: searching, then laughing with the lamb on his shoulders
    const got = s.found && t - s.foundT > 0.55, sh = Math.sin(t * 2.4) * 3;
    if (got) { const a = t - s.foundT; c.save(); const gl = c.createRadialGradient(SHX, SHY - 90, 4, SHX, SHY - 90, 110); gl.addColorStop(0, 'rgba(255,240,180,0.6)'); gl.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = gl; c.fillRect(SHX - 120, SHY - 210, 240, 220); c.restore();
      for (let i = 0; i < 6; i++) { const q = (a * 0.9 + i / 6) % 1; c.globalAlpha = 1 - q; heartF(c, SHX - 50 + i * 20 + Math.sin(q * 6 + i) * 6, SHY - 120 - q * 70, 5 + (i % 3), ['#ff6a8a', '#ffb0c0', '#ffd45a'][i % 3]); } c.globalAlpha = 1; }
    // staff
    c.save(); c.translate(SHX - 34, SHY - 2); c.rotate(-0.12 + (got ? -0.1 : sh * 0.01)); c.strokeStyle = '#6a4224'; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -112); c.arc(-9, -112, 9, 0, Math.PI, true); c.stroke(); c.strokeStyle = '#a8784a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-1, -4); c.lineTo(-1, -108); c.stroke(); c.restore();
    if (got) { c.save(); c.translate(SHX - 12, SHY - 66); c.rotate(0.06 * Math.sin(t * 6)); P.sheep(c, 0, 0, 1.6, { t: 0, facing: -1 }); c.restore(); }
    P.person(c, SHX, SHY, 1.4, { ...SHEP, facing: -1, expr: got ? 'laugh' : s.found ? 'wow' : 'surprised', arms: got ? 'up' : 'reach', t, bounce: got ? 3 : 1.2 });
    if (!got) { c.strokeStyle = 'rgba(60,30,40,0.6)'; c.lineWidth = 2; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = -2.2 + i * 0.35; c.beginPath(); c.moveTo(SHX - 4 + Math.cos(a) * 34, SHY - 96 + Math.sin(a) * 34); c.lineTo(SHX - 4 + Math.cos(a) * 42, SHY - 96 + Math.sin(a) * 42); c.stroke(); } }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
