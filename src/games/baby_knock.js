// KNOCK! — Luke 2:7. There is no room at the inn. Mary on the donkey and Joseph knock on doors in Bethlehem at night.
// Tap doors: a friendly face peeks out and shakes its head, sorry. One stable door glows warm and the animals welcome them.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const FACES = [
  { skin: SK[1], robe: CL.rose, stripe: CL.cream, hairStyle: 'bun', hair: HR[2] },
  { skin: SK[3], robe: CL.olive, stripe: CL.sand, beard: true, hair: HR[0], head: 'wrap', headCol: CL.cream },
  { skin: SK[2], robe: CL.plum, stripe: CL.gold, hair: HR[5], head: 'scarf', headCol: CL.sand },
  { skin: SK[0], robe: CL.sky, stripe: CL.white, hairStyle: 'curly', hair: HR[1], child: true },
  { skin: SK[3], robe: CL.terracotta, stripe: CL.cream, beard: '#d8d0c4', hair: HR[5], hairStyle: 'bald' },
];
// door slots: x, ground y, house width, house height, wall colour
const SLOTS = [[62, 340, 92, 100, '#d8b890'], [180, 330, 96, 120, '#e6c4b0'], [298, 340, 92, 96, '#c8b49a'], [92, 470, 108, 112, '#e8cc9a'], [268, 470, 108, 108, '#d4aa90']];
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);

function building(c, x, y, w, h, col, stable, seed) {
  c.save(); c.translate(x, y);
  c.fillStyle = 'rgba(10,10,40,0.35)'; c.fillRect(-w / 2 + 4, -2, w, 6);
  {
    const g = c.createLinearGradient(-w / 2, -h, w / 2, 0); g.addColorStop(0, P.shade(col, 0.05)); g.addColorStop(1, P.shade(col, -0.35)); c.fillStyle = g; c.fillRect(-w / 2, -h, w, h);
    c.fillStyle = P.shade(col, -0.35); c.fillRect(-w / 2 - 4, -h - 7, w + 8, 8); c.fillStyle = P.rgba('#fff0e0', 0.25); c.fillRect(-w / 2 - 4, -h - 7, w + 8, 2);
    c.fillStyle = 'rgba(30,20,50,0.25)'; c.fillRect(w * 0.2, -h, w * 0.3, h);
    // a small lit upstairs window
    const r = P.rng(seed); if (r() < 0.6) { c.strokeStyle = 'rgba(90,60,50,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-w / 2, -h * 0.55); c.quadraticCurveTo(0, -h * 0.48, w / 2, -h * 0.55); c.stroke(); for (let i = 0; i < 3; i++) { c.fillStyle = [CL.rose, CL.sky, CL.saffron, CL.teal][Math.floor(r() * 4)]; const lx = -w * 0.3 + i * w * 0.22; c.fillRect(lx, -h * 0.53 + Math.abs(lx) * 0.03, 10, 12); } }
    if (r() < 0.7) { c.fillStyle = '#9a5a3a'; c.beginPath(); c.moveTo(w / 2 - 16, 0); c.lineTo(w / 2 - 14, -12); c.lineTo(w / 2 - 4, -12); c.lineTo(w / 2 - 2, 0); c.fill(); c.fillStyle = '#5a8a4a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(w / 2 - 9 + (i - 2) * 3, -16 - (i % 2) * 4, 3, 6, (i - 2) * 0.4, 0, 7); c.fill(); } }
    c.fillStyle = '#3a2440'; c.fillRect(-w * 0.36, -h * 0.84, 14, 14); const wl = c.createRadialGradient(-w * 0.36 + 7, -h * 0.84 + 7, 1, -w * 0.36 + 7, -h * 0.84 + 7, 10); wl.addColorStop(0, '#fff2b8'); wl.addColorStop(1, '#f0a050'); c.fillStyle = wl; c.fillRect(-w * 0.36 + 2, -h * 0.84 + 2, 10, 10);
  }
  c.restore();
}
function door(c, x, y, open, lit, stable, t, hint) {
  const dw = 32, dh = 52;
  c.save(); c.translate(x, y);
  // doorway: dark when closed, warm when open
  const inner = c.createLinearGradient(0, -dh, 0, 0); inner.addColorStop(0, lit ? '#fff0b0' : '#2a1a2e'); inner.addColorStop(1, lit ? '#ff9a40' : '#1a0e1e'); c.fillStyle = inner;
  c.beginPath(); c.moveTo(-dw / 2, 0); c.lineTo(-dw / 2, -dh + dw / 2); c.arc(0, -dh + dw / 2, dw / 2, Math.PI, 0); c.lineTo(dw / 2, 0); c.closePath(); c.fill();
  // the door leaf swings in (narrows) as it opens
  const lw = dw * (1 - open * 0.8);
  c.save(); c.beginPath(); c.moveTo(-dw / 2, 0); c.lineTo(-dw / 2, -dh + dw / 2); c.arc(0, -dh + dw / 2, dw / 2, Math.PI, 0); c.lineTo(dw / 2, 0); c.closePath(); c.clip();
  const dg = c.createLinearGradient(-dw / 2, 0, -dw / 2 + lw, 0); dg.addColorStop(0, '#8a5430'); dg.addColorStop(1, '#5a321a'); c.fillStyle = dg; c.fillRect(-dw / 2, -dh, lw, dh);
  c.strokeStyle = 'rgba(40,20,10,0.5)'; c.lineWidth = 1.2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-dw / 2 + lw * i / 4, -dh); c.lineTo(-dw / 2 + lw * i / 4, 0); c.stroke(); }
  c.fillStyle = '#e9b949'; if (lw > 6) { c.beginPath(); c.arc(-dw / 2 + lw - 5, -dh * 0.45, 2, 0, 7); c.fill(); }
  c.restore();
  c.strokeStyle = '#6a4a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-dw / 2, 0); c.lineTo(-dw / 2, -dh + dw / 2); c.arc(0, -dh + dw / 2, dw / 2, Math.PI, 0); c.lineTo(dw / 2, 0); c.stroke();
  if (hint && open < 0.05) { // a little straw poking out under the door, and warm light leaking through the gap
    if (hint > 1) { c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(0, -2, 1, 0, -2, 26); gl.addColorStop(0, `rgba(255,200,110,${0.45 + 0.15 * Math.sin(t * 3)})`); gl.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = gl; c.fillRect(-28, -28, 56, 34); c.restore(); }
    c.strokeStyle = '#f0c860'; c.lineWidth = 1.3; c.lineCap = 'round'; for (let i = 0; i < 7; i++) { const sx = -12 + i * 4; c.beginPath(); c.moveTo(sx, -1); c.lineTo(sx + (i % 2 ? 4 : -3) + Math.sin(t * 2 + i) * 0.6, 3 + (i % 3)); c.stroke(); }
  }
  c.restore();
}
function lantern(c, x, y, t, ph) {
  c.save(); c.globalCompositeOperation = 'lighter'; const f = 0.9 + 0.1 * Math.sin(t * 11 + ph); const g = c.createRadialGradient(x, y, 1, x, y, 40 * f); g.addColorStop(0, 'rgba(255,200,110,0.5)'); g.addColorStop(1, 'rgba(255,160,80,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 40, 0, 7); c.fill(); c.restore();
  c.strokeStyle = '#3a2a2a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y - 12); c.lineTo(x, y - 6); c.stroke();
  c.fillStyle = '#ffd890'; c.strokeStyle = '#5a3a2a'; c.beginPath(); c.moveTo(x - 4, y - 6); c.lineTo(x + 4, y - 6); c.lineTo(x + 5, y + 4); c.lineTo(x - 5, y + 4); c.closePath(); c.fill(); c.stroke();
}

MG.add({
  id: 'knock', stage: 'baby', cmd: 'KNOCK!', hint: 'tap', time: 5.5, mood: 'night', winText: 'Welcome!',
  card: { title: 'No room at the inn', ref: 'Luke 2:1–7', kind: 'Story', text: 'Mary and Joseph traveled to Bethlehem, and when they arrived the town was so full that there was no room for them in the guest room. Baby Jesus was born there, and Mary wrapped him in cloth and laid him in a manger, the box where animals eat.', ask: 'Jesus was born in a crowded place where people made room for him. Who could you make room for at your table or in your games?' },
  init(g) {
    const s = g.s, n = [3, 4, 5][g.level];
    const idx = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, n);
    if (g.level === 0) { idx.length = 0; idx.push(...[0, 2, 1].sort(() => Math.random() - 0.5)); }
    const faces = FACES.slice().sort(() => Math.random() - 0.5);
    s.doors = idx.map((k, i) => { const [x, y, w, h, col] = SLOTS[k]; return { x, y, w, h, col, face: faces[i % faces.length], open: 0, openT: -9, ph: Math.random() * 6, seed: 3 + k * 7 }; });
    s.stable = Math.floor(Math.random() * n); s.doors[s.stable].stable = true;
    s.found = -1; s.tried = 0; s.walk = 0; s.hint = [2, 1, 0][g.level];
  },
  down(g, x, y) {
    const s = g.s; if (s.found >= 0) return;
    let best = null, bd = 9e9;
    for (const d of s.doors) { const dx = Math.abs(x - d.x), dy = y - (d.y - 30); if (dx < d.w / 2 + 6 && dy > -d.h - 10 && dy < 44) { const dd = Math.hypot(dx, dy); if (dd < bd) { bd = dd; best = d; } } }
    if (!best) { g.sfx('tap'); return; }
    if (best.openT > 0 && g.t - best.openT < 1.2 && !best.stable) return;
    g.sfx('drum', { pitch: 1.6 }); best.openT = g.t; s.tried++;
    if (best.stable) { s.found = g.t; g.win(); g.sfx('baa'); g.burst(best.x, best.y - 30, ['#fff2b0', '#ffd45a', '#ffffff', '#ffb070'], 26, 200); }
    else { best.sorry = true; g.sfx('wrong', { pitch: 1.3 }); }
  },
  update(g, dt) {
    const s = g.s;
    for (const d of s.doors) { const want = d.openT > 0 && (d.stable ? true : g.t - d.openT < 1.0) && g.t - d.openT > 0.12; d.open += ((want ? 1 : 0) - d.open) * Math.min(1, dt * 10); }
    if (s.found >= 0) s.walk = Math.min(1, s.walk + dt * 1.6);
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.6 || s.found >= 0 || g.t - (s.botT || 0) < 0.7) return; s.botT = g.t;
    const tried = s.botTried || (s.botTried = []);
    const order = s.doors.map((d, i) => i).filter(i => !tried.includes(i));
    const pick = g.level === 0 || tried.length >= 1 ? s.stable : order.find(i => i !== s.stable) ?? s.stable;
    tried.push(pick); const d = s.doors[pick]; synth('down', d.x, d.y - 24); synth('up', d.x, d.y - 24);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = s.found >= 0;
    c.drawImage(g.bake('baby_knock_bg', o => {
      P.sky(o, W, H, ['#0a0e30', '#1c1e56', '#3a2c6c', '#6a4078']);
      P.stars(o, W, 260, 120, 41, 0);
      // a big soft moon behind the town
      const mg = o.createRadialGradient(270, 96, 10, 270, 96, 120); mg.addColorStop(0, 'rgba(255,240,210,0.35)'); mg.addColorStop(1, 'rgba(255,240,210,0)'); o.fillStyle = mg; o.fillRect(140, 0, 220, 230);
      const md = o.createRadialGradient(264, 90, 2, 270, 96, 26); md.addColorStop(0, '#fffbea'); md.addColorStop(1, '#f0dcc0'); o.fillStyle = md; o.beginPath(); o.arc(270, 96, 26, 0, 7); o.fill();
      o.fillStyle = 'rgba(200,170,160,0.3)'; for (const [dx, dy, r] of [[-8, 4, 6], [8, -7, 4], [6, 9, 3]]) { o.beginPath(); o.arc(270 + dx, 96 + dy, r, 0, 7); o.fill(); }
      // a far row of rooftops climbing the hill
      P.hills(o, W, 250, 30, '#3a3060', '#2a2450', { seed: 7, dabs: 10, bottom: 640 });
      const r = P.rng(11); for (let i = 0; i < 16; i++) { const x = i * 24 - 6 + r() * 6, h = 18 + r() * 22, y = 252 - Math.sin(i * 0.4) * 14; o.fillStyle = r() < 0.5 ? '#4a4070' : '#55497a'; o.fillRect(x, y - h, 22, h + 30); if (r() < 0.6) { o.fillStyle = '#ffd890'; o.globalAlpha = 0.7; o.fillRect(x + 8, y - h + 8, 4, 4); o.globalAlpha = 1; } }
      // the street: a cobbled lane climbing between two terraces
      const st = o.createLinearGradient(0, 300, 0, 640); st.addColorStop(0, '#5a4a6a'); st.addColorStop(1, '#3a2a40'); o.fillStyle = st; o.fillRect(0, 290, W, 350);
      const r2 = P.rng(19); for (let i = 0; i < 160; i++) { const y = 300 + r2() * 340, x = r2() * W, sc = 0.4 + (y - 300) / 340; o.fillStyle = P.rgba(r2() < 0.5 ? '#7a6a8a' : '#2a1e32', 0.35); o.beginPath(); o.ellipse(x, y, 9 * sc, 4 * sc, 0, 0, 7); o.fill(); }
    }), 0, 0, W, H);
    // the buildings, back row then front row
    const sorted = s.doors.slice().sort((a, b) => a.y - b.y);
    for (const d of sorted) {
      building(c, d.x, d.y, d.w, d.h, d.col, d.stable, d.seed);
      lantern(c, d.x + 24, d.y - 70, t, d.ph);
      const lit = d.open > 0.05;
      // the friendly face that peeks out, or the welcoming animals
      if (d.stable) {
        if (lit) { c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(d.x, d.y - 26, 4, d.x, d.y - 26, 150 * d.open); gl.addColorStop(0, 'rgba(255,210,120,0.75)'); gl.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = gl; c.beginPath(); c.arc(d.x, d.y - 26, 150, 0, 7); c.fill(); c.restore(); }
        door(c, d.x, d.y, d.open, lit, true, t, s.hint);
        if (lit) { c.save(); c.globalAlpha = Math.min(1, d.open * 1.5); c.beginPath(); c.rect(d.x - 16, d.y - 60, 32, 60); c.clip(); P.goat(c, d.x + 8, d.y - 4, 0.6, { t, facing: -1 }); P.sheep(c, d.x - 4, d.y + 1, 0.62, { t, hop: true, facing: 1 }); c.restore();
          c.save(); c.globalAlpha = d.open; P.dove(c, d.x + 18 + Math.sin(t * 3) * 6, d.y - 64 - Math.abs(Math.sin(t * 5)) * 6, 0.5, { t, facing: -1 }); c.restore(); }
      } else {
        door(c, d.x, d.y, d.open, lit, false, t);
        if (lit) { const q = d.open, shake = Math.sin((t - d.openT) * 18) * 0.12 * Math.max(0, 1 - (t - d.openT) / 1.0);
          c.save(); c.beginPath(); c.rect(d.x - 16, d.y - 52, 32, 52); c.clip(); c.translate(d.x, d.y + 30 * (1 - q)); c.rotate(shake); P.person(c, 0, 6, 0.85, { ...d.face, expr: 'sad', arms: 'out', t: 0 }); c.restore();
          c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = q * 0.6; const lg = c.createRadialGradient(d.x, d.y, 2, d.x, d.y, 30); lg.addColorStop(0, 'rgba(255,200,120,0.6)'); lg.addColorStop(1, 'rgba(255,180,100,0)'); c.fillStyle = lg; c.save(); c.scale(1, 0.4); c.beginPath(); c.arc(d.x, d.y / 0.4, 30, 0, 7); c.fill(); c.restore(); c.restore(); }
      }
    }
    // Mary on the donkey and Joseph, waiting in the lane, then walking into the warm stable
    const st = s.doors[s.stable], w = eo(s.walk), hx = 180 + (st.x - 180) * w, hy = 600 + (st.y + 10 - 600) * w, sc = 1.25 - 0.45 * w;
    const fade = won ? Math.max(0, 1 - Math.max(0, (s.walk - 0.85) / 0.15)) : 1;
    c.save(); c.globalAlpha = fade;
    const face = won ? 'laugh' : 'happy';
    const dx = won ? Math.sign(st.x - 180) || 1 : 1;
    P.donkey(c, hx + 6 * sc, hy, sc * 1.25, { t, facing: dx });
    c.save(); c.beginPath(); c.rect(hx - 60, hy - 200, 120, 200 - 34 * sc); c.clip();
    P.person(c, hx + 2 * sc * dx, hy - 16 * sc, sc * 0.72, { skin: SK[2], robe: CL.indigo, stripe: CL.sky, head: 'scarf', headCol: CL.sky, expr: face, arms: won ? 'cheer' : 'hold', t, facing: dx });
    c.restore();
    c.fillStyle = '#c8462e'; c.save(); c.translate(hx + 6 * sc, hy); c.scale(sc * 1.25 * dx, sc * 1.25); c.beginPath(); c.moveTo(-10, -26); c.quadraticCurveTo(0, -30, 10, -26); c.lineTo(9, -16); c.lineTo(-9, -16); c.closePath(); c.fill(); c.fillStyle = '#f2c94c'; c.fillRect(-9, -18, 18, 2); c.restore();
    P.person(c, hx - 44 * sc * dx, hy + 4, sc * 0.95, { skin: SK[3], robe: CL.brown, stripe: CL.sand, beard: true, hair: HR[0], hairStyle: 'curly', expr: face, arms: won ? 'cheer' : 'wave', t, phase: 2, facing: dx });
    c.restore();
    P.vignette(c, W, H, 0.32); P.grain(c, W, H, 0.06);
  },
});
