// BREAKFAST! — John 21:1–14. At dawn the risen Jesus has a charcoal fire going on the beach. The disciples drag in a net
// bursting with fish. Drag a fish from the net onto the fire; when it is cooked, drag it (with a piece of bread) to a
// hungry, soggy disciple. Peter, still dripping from jumping into the lake, is first in line.
const SK = P.SKIN, CL = P.CLOTH, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const PETER = { skin: SK[2], robe: CL.sky, stripe: CL.brown, beard: true, hair: HR[0], hairStyle: 'curly' };
const FRIENDS = [
  { skin: SK[1], robe: CL.teal, stripe: CL.cream, hair: HR[2] },                                  // John, young
  { skin: SK[3], robe: CL.terracotta, stripe: CL.sand, beard: true, hair: HR[3] },
  { skin: SK[0], robe: CL.olive, stripe: CL.cream, beard: true, hair: HR[1], hairStyle: 'curly' },
];
const NET = { x: 80, y: 520 }, FIRE = { x: 186, y: 500 }, NK = 1.35, FK = 1.3;
const SLOTS = [[-26, -6], [0, -10], [26, -6]];          // places for fish on the grill stone, relative to the fire
const SPOTS = [[300, 516], [292, 612], [196, 616], [92, 616]];
const slot = i => [FIRE.x + SLOTS[i][0] * FK, FIRE.y + SLOTS[i][1] * FK];
const RAW = '#9fc3d6', DONE = '#c8843a';

function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, P.rgba(col, a)); g.addColorStop(1, P.rgba(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function bread(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createRadialGradient(-3, -3, 1, 0, 0, 10); g.addColorStop(0, '#ffe2a0'); g.addColorStop(0.7, '#d8964a'); g.addColorStop(1, '#a8682a');
  c.fillStyle = g; c.strokeStyle = '#7a4a1e'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, 0, 10, 4.5, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,240,200,0.6)'; c.beginPath(); c.ellipse(-3, -1.8, 4, 1.2, -0.2, 0, 7); c.fill();
  c.restore();
}
// a breakfast portion: a cooked fish lying on a flatbread
function portion(c, x, y, s) { bread(c, x, y + 4 * s, 1.5 * s); P.fishShape(c, x, y, 0.62 * s, DONE); }
// a disciple sitting on the sand: upper body clipped at the lap, crossed legs under the robe, bare feet
function seated(c, x, y, s, o) {
  c.save(); c.beginPath(); c.rect(x - 60 * s, y - 130 * s, 120 * s, 126 * s); c.clip(); P.person(c, x, y + 12 * s, s, o); c.restore();
  const robe = o.robe, g = c.createLinearGradient(x, y - 12 * s, x, y + 4 * s); g.addColorStop(0, P.shade(robe, 0.12)); g.addColorStop(1, P.shade(robe, -0.2));
  c.fillStyle = g; c.strokeStyle = P.shade(robe, -0.45); c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, y - 4 * s, 19 * s, 7.5 * s, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = o.skin; c.strokeStyle = P.shade(o.skin, -0.4); c.lineWidth = 1.1; c.beginPath(); c.ellipse(x - 14 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.ellipse(x + 14 * s, y + 1 * s, 5 * s, 2.6 * s, 0, 0, 7); c.fill(); c.stroke();
}
function boat(o, x, y) { // a fishing boat pulled up on the shore, bow toward us, mast and furled sail
  o.save(); o.translate(x, y);
  o.fillStyle = 'rgba(30,40,60,0.25)'; o.beginPath(); o.ellipse(6, 6, 70, 9, 0, 0, 7); o.fill();
  const h = o.createLinearGradient(0, -26, 0, 8); h.addColorStop(0, '#b07a4e'); h.addColorStop(1, '#5a3620'); o.fillStyle = h;
  o.beginPath(); o.moveTo(-70, -24); o.quadraticCurveTo(0, -18, 64, -30); o.quadraticCurveTo(58, 2, 20, 8); o.quadraticCurveTo(-50, 8, -70, -24); o.closePath(); o.fill();
  o.strokeStyle = '#4a2a18'; o.lineWidth = 1.6; o.stroke();
  o.strokeStyle = 'rgba(255,220,170,0.5)'; o.lineWidth = 1.2; for (const k of [0.35, 0.65]) { o.beginPath(); o.moveTo(-68 + k * 6, -24 + k * 26); o.quadraticCurveTo(0, -18 + k * 26, 60 - k * 10, -30 + k * 34); o.stroke(); }
  o.fillStyle = '#e9b949'; o.fillRect(-66, -27, 128, 3);
  o.strokeStyle = '#4a2a18'; o.lineWidth = 3; o.beginPath(); o.moveTo(-6, -22); o.lineTo(-10, -110); o.stroke();
  o.lineWidth = 2; o.beginPath(); o.moveTo(-40, -96); o.lineTo(26, -104); o.stroke();
  o.fillStyle = '#f2e6cf'; o.strokeStyle = '#a89878'; o.lineWidth = 1.2; o.beginPath(); o.moveTo(-38, -96); o.quadraticCurveTo(-8, -86, 24, -104); o.quadraticCurveTo(-8, -94, -38, -96); o.fill(); o.stroke();
  o.restore();
}
function paintBg(o) {
  P.sky(o, W, H, ['#3a4a8a', '#8a76b4', '#f0a4a8', '#ffd6a4'], { x: 290, y: 262, r: 24, color: '#fff0c0', glow: 240 });
  P.stars(o, W, 110, 22, 9, 0);
  P.cloud(o, 80, 120, 0.7, '#ffe4e0', '#b890c0', 0.8); P.cloud(o, 250, 170, 0.45, '#ffe4e0', '#b890c0', 0.7);
  P.hills(o, W, 262, 30, '#9a86b8', '#8a7aa8', { seed: 61, freq: 0.012, dabs: 10, bottom: 300 });
  P.hills(o, W, 272, 12, '#b098b8', '#a08aa8', { seed: 63, freq: 0.02, dabs: 10, bottom: 300, rim: '#ffd8c0' });
}
function paintShore(o) {
  // the beach: pale wet sand at the water's edge, warm dry sand nearer, pebbles and shells
  o.save(); o.beginPath(); o.moveTo(0, 384); o.quadraticCurveTo(120, 370, 220, 388); o.quadraticCurveTo(300, 400, W, 386); o.lineTo(W, H); o.lineTo(0, H); o.closePath();
  const g = o.createLinearGradient(0, 380, 0, H); g.addColorStop(0, '#d8c0a8'); g.addColorStop(0.15, '#ecd2aa'); g.addColorStop(1, '#d6a874'); o.fillStyle = g; o.fill(); o.clip();
  const r = P.rng(31); for (let i = 0; i < 70; i++) { o.fillStyle = P.rgba(r() < 0.5 ? '#fff4dc' : '#a8784a', 0.22); o.beginPath(); o.ellipse(r() * W, 392 + r() * 250, 4 + r() * 9, 1.4 + r() * 2, 0, 0, 7); o.fill(); }
  for (let i = 0; i < 26; i++) { const x = r() * W, y = 400 + r() * 230; o.fillStyle = ['#b8a090', '#9a8a80', '#d8c8b8', '#c8a088'][i % 4]; o.beginPath(); o.ellipse(x, y, 2 + r() * 3, 1.5 + r() * 2, r() * 3, 0, 7); o.fill(); }
  for (let i = 0; i < 6; i++) { const x = r() * W, y = 420 + r() * 200; o.fillStyle = '#fff0e8'; o.beginPath(); o.ellipse(x, y, 4, 3, 0, Math.PI, 0); o.fill(); o.strokeStyle = 'rgba(180,120,100,0.6)'; o.lineWidth = 0.8; for (let k = -1; k <= 1; k++) { o.beginPath(); o.moveTo(x, y); o.lineTo(x + k * 3, y - 3); o.stroke(); } }
  // Peter's wet footprints from the water up to his place
  o.fillStyle = 'rgba(120,90,70,0.35)'; for (let i = 0; i < 7; i++) { const u = i / 7, x = 240 + u * 56 + (i % 2) * 7, y = 398 + u * 70; o.beginPath(); o.ellipse(x, y, 3, 5, 0.3, 0, 7); o.fill(); }
  o.restore();
  // a darker wet band and a line of foam at the edge
  o.strokeStyle = 'rgba(150,120,110,0.35)'; o.lineWidth = 8; o.beginPath(); o.moveTo(0, 388); o.quadraticCurveTo(120, 374, 220, 392); o.quadraticCurveTo(300, 404, W, 390); o.stroke();
  P.grassTufts(o, 70, 600, 640, 6, '#8aa04a', 3); P.grassTufts(o, W, 620, 640, 8, '#8aa04a', 4);
  P.rock(o, 344, 430, 0.7, '#a89080'); P.rock(o, 20, 450, 0.6, '#b09888');
}
function paintFireBase(o) {
  // the ring of stones round the charcoal, and a flat stone where the bread and fish sit
  const { x, y } = FIRE;
  const sg = o.createRadialGradient(x, y + 8, 4, x, y + 8, 90); sg.addColorStop(0, 'rgba(255,170,90,0.35)'); sg.addColorStop(1, 'rgba(255,170,90,0)'); o.fillStyle = sg; o.fillRect(x - 100, y - 60, 200, 140);
  o.fillStyle = 'rgba(40,20,20,0.3)'; o.beginPath(); o.ellipse(x, y + 12, 48, 12, 0, 0, 7); o.fill();
  const cg = o.createRadialGradient(x, y + 4, 2, x, y + 4, 40); cg.addColorStop(0, '#ffe080'); cg.addColorStop(0.35, '#f08a30'); cg.addColorStop(0.7, '#a8381e'); cg.addColorStop(1, '#3a1a14'); o.fillStyle = cg; o.beginPath(); o.ellipse(x, y + 4, 40, 11, 0, 0, 7); o.fill();
  const r = P.rng(7); for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; o.fillStyle = ['#8a7a70', '#a8988a', '#6a5a52'][i % 3]; o.beginPath(); o.ellipse(x + Math.cos(a) * 44, y + 6 + Math.sin(a) * 13, 7 + r() * 3, 5 + r() * 2, 0, 0, 7); o.fill(); o.fillStyle = 'rgba(255,230,200,0.35)'; o.beginPath(); o.ellipse(x + Math.cos(a) * 44 - 2, y + 4 + Math.sin(a) * 13, 3, 1.5, 0, 0, 7); o.fill(); }
}

MG.add({
  id: 'beach', stage: 'easter', cmd: 'BREAKFAST!', hint: 'drag', time: 7, mood: 'sea', winText: 'Yum!',
  card: {
    title: 'Breakfast on the beach', ref: 'John 21:1–14', kind: 'Gospel story',
    text: 'John\'s Gospel tells how some of Jesus\'s friends fished all night on the Sea of Galilee and caught nothing. At dawn a man on the shore told them to throw their net on the right side of the boat, and it filled with fish. It was the risen Jesus, cooking fish and bread on a charcoal fire, and he said, "Come and have breakfast."',
    note: 'John\'s Gospel tells the Easter stories in its own way. Some Christians believe this meal and the huge catch happened just as told, and others read it as a picture of the risen Jesus caring for his tired friends.',
    ask: 'Jesus made breakfast for his tired, hungry friends. Who could you make something for this week?',
  },
  init(g) {
    const s = g.s, n = [2, 3, 4][g.level];
    s.people = SPOTS.slice(0, n).map(([x, y], i) => ({ x, y, look: i === 0 ? PETER : FRIENDS[(i - 1) % FRIENDS.length], fed: false, fedT: 0, phase: Math.random() * 6, peter: i === 0 }));
    s.grill = SLOTS.map(() => null);                   // each slot: null or { t: time placed }
    s.cook = 0.45 / Math.sqrt(g.speed);
    s.held = null; s.back = []; s.splash = []; s.serveT = -9; s.popT = -9;
    s.wig = Array.from({ length: 9 }, (_, i) => ({ dx: -34 + (i % 5) * 17 + (i > 4 ? 8 : 0), dy: -16 + Math.floor(i / 5) * 14, a: (Math.random() - 0.5) * 1.4, ph: Math.random() * 6, col: ['#9fc3d6', '#b8d0dc', '#a8c8a8', '#c8c0d8'][i % 4] }));
    s.smoke = Array.from({ length: 6 }, (_, i) => ({ ph: i / 6 }));
  },
  down(g, x, y) {
    const s = g.s; if (s.held) return;
    // a cooked fish on the grill?
    const ready = s.grill.map((f, i) => f && g.t - f.t >= s.cook ? i : -1).filter(i => i >= 0);
    if (ready.length && Math.hypot(x - FIRE.x, y - (FIRE.y - 8)) < 74) {
      let bi = ready[0], bd = 1e9; for (const i of ready) { const [sx, sy] = slot(i), d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; bi = i; } }
      s.grill[bi] = null; s.held = { kind: 'cooked', x, y: y - 12 }; g.sfx('pop'); g.burst(slot(bi)[0], slot(bi)[1] - 6, ['#ffe08a', '#fff6d0', '#ffffff'], 8, 90); return;
    }
    if (Math.hypot(x - NET.x, y - NET.y) < 76) { s.held = { kind: 'raw', x, y: y - 12 }; s.popT = g.t; g.sfx('splash'); g.burst(NET.x, NET.y - 12, ['#dff8ff', '#9fe0ff', '#ffffff'], 8, 100); }
  },
  move(g, x, y) { const h = g.s.held; if (h) { h.x = x; h.y = y - 12; } },
  up(g, x, y) {
    const s = g.s, h = s.held; if (!h) return; s.held = null;
    if (h.kind === 'raw') {
      const free = s.grill.indexOf(null);
      if (free >= 0 && Math.hypot(h.x - FIRE.x, h.y - FIRE.y) < 84) { s.grill[free] = { t: g.t }; g.sfx('fire'); g.sfx('crunch'); g.burst(slot(free)[0], slot(free)[1], ['#ffb040', '#ffe08a', '#ff7a3a'], 12, 130); return; }
    } else {
      let best = null, bd = 80; for (const p of s.people) { if (p.fed) continue; const d = Math.hypot(p.x - h.x, p.y - 50 - h.y); if (d < bd) { bd = d; best = p; } }
      if (best) {
        best.fed = true; best.fedT = g.t; s.serveT = g.t; g.sfx('munch'); g.sfx('cheer'); g.burst(best.x, best.y - 50, ['#ffd45a', '#ffffff', '#ffb36a', '#8fd8ff'], 16, 170);
        if (s.people.every(p => p.fed)) { g.win(); g.sfx('harp'); g.burst(FIRE.x, FIRE.y - 40, ['#fff6c0', '#ffd45a', '#ffffff', '#ff9ab8'], 26, 220); }
        return;
      }
    }
    s.back.push({ kind: h.kind, x: h.x, y: h.y, t: g.t }); g.sfx('swoosh');
  },
  update(g, dt) {
    const s = g.s;
    s.back = s.back.filter(b => g.t - b.t < 0.35);
    for (let i = 0; i < s.grill.length; i++) { const f = s.grill[i]; if (f && !f.ding && g.t - f.t >= s.cook) { f.ding = true; g.sfx('ding'); } }
  },
  auto(g, dt, synth) { // alternate: pick up (cooked fish first, else a raw one from the net), then drop it where it goes
    const s = g.s; if (g.t < 0.35 || g.done) return; const k = Math.floor((g.t - 0.35) / 0.15); if (k === s.botK) return; s.botK = k;
    if (s.held) {
      if (s.held.kind === 'raw') synth('up', FIRE.x, FIRE.y + 10);
      else { const p = s.people.find(q => !q.fed); if (p) synth('up', p.x, p.y - 28); }
      return;
    }
    const ri = s.grill.findIndex(f => f && g.t - f.t >= s.cook);
    const hungry = s.people.filter(p => !p.fed).length, onFire = s.grill.filter(Boolean).length;
    if (ri >= 0) { const p = s.people.find(q => !q.fed); synth('down', ...slot(ri)); synth('move', p.x, p.y - 28); }
    else if (onFire < Math.min(3, hungry)) { synth('down', NET.x, NET.y); synth('move', FIRE.x, FIRE.y + 10); }
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win', lost = g.result === 'fail';
    c.drawImage(g.bake('easter_beach_sky', paintBg), 0, 0, W, H);
    P.rays(c, 290, 262, W, H * 0.6, '#ffe8c0', 0.12, 9, t);
    P.water(c, W, 276, 396, '#3a6a9a', '#e8b0b0', t, { waves: 5, sparkle: '#fff2d0' });
    // morning mist drifting over the lake
    for (let i = 0; i < 3; i++) { const mx = ((i * 140 + t * 8) % 520) - 80; c.fillStyle = 'rgba(255,236,230,0.22)'; c.beginPath(); c.ellipse(mx, 300 + i * 18, 110, 8, 0, 0, 7); c.fill(); }
    c.drawImage(g.bake('easter_beach_shore', paintShore), 0, 0, W, H);
    // little waves lapping the shore
    const lap = Math.sin(t * 1.6) * 4; c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 384 + lap); c.quadraticCurveTo(120, 370 + lap, 220, 388 + lap); c.quadraticCurveTo(300, 400 + lap, W, 386 + lap); c.stroke();
    c.drawImage(g.bake('easter_beach_boat', o => boat(o, 70, 404)), 0, 0, W, H);
    // the net, hauled up from the boat and bulging with fish
    const netHot = !g.done && !s.held && s.grill.some(f => !f) && s.people.some(p => !p.fed) && !s.grill.some(f => f && t - f.t >= s.cook);
    c.save(); c.translate(NET.x, NET.y); c.scale(NK, NK); c.translate(-NET.x, -NET.y); drawNet(c, s, t, netHot, won); c.restore();
    // the fire: coals breathing, flames licking, smoke curling up into the dawn
    c.drawImage(g.bake('easter_beach_fire', o => { o.translate(FIRE.x, FIRE.y); o.scale(FK, FK); o.translate(-FIRE.x, -FIRE.y); paintFireBase(o); }), 0, 0, W, H);
    c.save(); c.translate(FIRE.x, FIRE.y); c.scale(FK, FK); c.translate(-FIRE.x, -FIRE.y); drawFire(c, s, t); c.restore();
    // Jesus stands behind the fire with bread, ready to serve
    const serving = t - s.serveT < 0.5;
    P.person(c, FIRE.x + 8, FIRE.y - 40, 1.55, { ...JESUS, t, phase: 1, bounce: 0.9, expr: won ? 'laugh' : 'happy', arms: won ? 'cheer' : serving ? 'reach' : 'out' });
    // the grill stone with bread and the fish that are cooking
    c.save(); c.translate(FIRE.x, FIRE.y); c.scale(FK, FK); c.translate(-FIRE.x, -FIRE.y); stone(c, s, t); c.restore();
    // the disciples, waiting on the sand
    const list = s.people.slice().sort((a, b) => a.y - b.y), pu = 0.5 + 0.5 * Math.sin(t * 6);
    const serveHot = s.held && s.held.kind === 'cooked';
    for (const p of list) {
      const ft = t - p.fedT, cheer = p.fed && (ft < 0.7 || won);
      if (!p.fed && (serveHot || s.grill.some(f => f && t - f.t >= s.cook))) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, p.x, p.y - 44, 64, '#fff0b0', 0.25 + 0.3 * pu); c.restore(); }
      const bob = cheer ? Math.abs(Math.sin(t * 9 + p.phase)) * 5 : 0;
      seated(c, p.x, p.y - bob, 1.4, { ...p.look, t, phase: p.phase, bounce: p.fed ? 1.6 : 0.7, facing: p.x > FIRE.x ? -1 : 1,
        expr: p.fed ? (cheer ? 'laugh' : 'happy') : lost ? 'sad' : serveHot ? 'wow' : 'surprised', arms: p.fed ? (cheer ? 'cheer' : 'hold') : serveHot ? 'reach' : 'down',
        hold: p.fed && !cheer ? (cc, hx, hy) => portion(cc, hx, hy - 2, 0.7) : null });
      if (p.fed && cheer) portion(c, p.x, p.y - 38 - bob, 1);
      if (p.peter && !p.fed) { // Peter is still dripping from his swim
        for (let i = 0; i < 4; i++) { const q = ((t * 1.4 + i * 0.25) % 1), dx = [-16, -6, 8, 15][i]; c.fillStyle = `rgba(150,210,240,${0.85 * (1 - q)})`; c.beginPath(); c.ellipse(p.x + dx * 1.25, p.y - 84 + q * 60, 2, 3, 0, 0, 7); c.fill(); }
      }
      if (p.fed && ft < 1.2) { c.save(); c.globalAlpha = 1 - ft / 1.2; c.fillStyle = '#ff7a9a'; for (let i = 0; i < 3; i++) heart(c, p.x - 14 + i * 14, p.y - 124 - ft * 40 - i * 6, 5); c.restore(); }
    }
    // gulls overhead; on a fail, a cheeky gull makes off with a fish
    for (let i = 0; i < 2; i++) gull(c, 120 + i * 120 + Math.sin(t * 0.7 + i) * 30, 180 + i * 30 + Math.sin(t * 1.3 + i) * 6, 1, t + i);
    if (lost) { const q = Math.min(1, (t - g.doneAt) / 0.7), gx = NET.x + q * 200, gy = NET.y - 20 - q * 260 + Math.sin(q * Math.PI) * 30; gull(c, gx, gy, 1.6, t * 1.5); P.fishShape(c, gx + 2, gy + 10, 0.5, RAW); }
    // portions flying back after a miss
    for (const b of s.back) { const q = (t - b.t) / 0.35, tx = b.kind === 'raw' ? NET.x : FIRE.x, ty = b.kind === 'raw' ? NET.y - 10 : FIRE.y - 10; c.save(); c.globalAlpha = 1 - q * 0.6; const x = b.x + (tx - b.x) * q, y = b.y + (ty - b.y) * q - Math.sin(q * Math.PI) * 30; if (b.kind === 'raw') P.fishShape(c, x, y, 1, RAW); else portion(c, x, y, 1); c.restore(); }
    if (s.held) { const h = s.held; c.fillStyle = 'rgba(80,50,30,0.2)'; c.beginPath(); c.ellipse(h.x, h.y + 28, 16, 5, 0, 0, 7); c.fill(); glow(c, h.x, h.y, 34, '#fff4c0', 0.6);
      if (h.kind === 'raw') { c.save(); c.translate(h.x, h.y); c.rotate(Math.sin(t * 20) * 0.25); P.fishShape(c, 0, 0, 1.35, RAW); c.restore(); } else portion(c, h.x, h.y, 1.4); }
    P.vignette(c, W, H, 0.28); P.grain(c, W, H, 0.06);
  },
});
function drawNet(c, s, t, hot, won) {
  const { x, y } = NET, pu = 0.5 + 0.5 * Math.sin(t * 6);
  if (hot) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, x, y - 8, 70, '#fff0b0', 0.2 + 0.3 * pu); c.restore(); }
  // ropes running back to the boat
  c.strokeStyle = '#8a6a48'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 30, y - 18); c.quadraticCurveTo(x - 20, y - 70, x + 10, y - 104); c.moveTo(x + 30, y - 20); c.quadraticCurveTo(x + 30, y - 60, x + 40, y - 100); c.stroke();
  c.fillStyle = 'rgba(80,50,30,0.28)'; c.beginPath(); c.ellipse(x + 4, y + 10, 54, 11, 0, 0, 7); c.fill();
  // fish heaped inside, flapping
  const squash = 1 + Math.sin(t * 7) * 0.02;
  for (const f of s.wig) { const flap = Math.sin(t * 8 + f.ph) > 0.7 ? Math.sin(t * 30 + f.ph) * 0.4 : 0, hop = Math.max(0, Math.sin(t * 5 + f.ph * 2)) ** 8 * 8; c.save(); c.translate(x + f.dx, y + f.dy * squash - hop); c.rotate(f.a + flap); P.fishShape(c, 0, 0, 0.75, f.col); c.restore(); }
  // the mesh over them
  c.save(); c.beginPath(); c.ellipse(x, y - 6, 52, 30, 0, 0, 7); c.clip();
  c.strokeStyle = 'rgba(240,226,200,0.8)'; c.lineWidth = 1.2;
  for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(x + i * 10 - 40, y - 40); c.lineTo(x + i * 10 + 40, y + 30); c.moveTo(x + i * 10 + 40, y - 40); c.lineTo(x + i * 10 - 40, y + 30); c.stroke(); }
  c.restore();
  c.strokeStyle = '#a8865a'; c.lineWidth = 2.4; c.beginPath(); c.ellipse(x, y - 6, 52, 30, 0, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
  c.fillStyle = '#e8b04a'; for (let i = 0; i < 5; i++) { const a = Math.PI * (1.15 + i * 0.17); c.beginPath(); c.arc(x + Math.cos(a) * 52, y - 6 + Math.sin(a) * 30, 3.2, 0, 7); c.fill(); }
}
function drawFire(c, s, t) {
  const { x, y } = FIRE;
  c.save(); c.globalCompositeOperation = 'screen'; glow(c, x, y - 4, 90, '#ffa050', 0.32 + 0.06 * Math.sin(t * 9)); c.restore();
  for (let i = 0; i < 5; i++) { const fx = x - 24 + i * 12, h = 14 + 8 * Math.sin(t * 11 + i * 2) + (i % 2) * 6; const fg = c.createLinearGradient(0, y + 4, 0, y - h); fg.addColorStop(0, '#ffb030'); fg.addColorStop(0.6, '#ffe070'); fg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = fg; c.beginPath(); c.moveTo(fx - 6, y + 4); c.quadraticCurveTo(fx - 5, y - h * 0.5, fx + Math.sin(t * 7 + i) * 3, y - h); c.quadraticCurveTo(fx + 5, y - h * 0.5, fx + 6, y + 4); c.closePath(); c.fill(); }
  // smoke drifting up
  for (const sm of s.smoke) { const q = (t * 0.35 + sm.ph) % 1; c.fillStyle = `rgba(240,230,240,${0.25 * (1 - q)})`; c.beginPath(); c.arc(x + 20 + Math.sin(q * 6 + sm.ph * 6) * 10 + q * 30, y - 60 - q * 120, 6 + q * 14, 0, 7); c.fill(); }
  // sparks
  for (let i = 0; i < 6; i++) { const q = (t * 0.9 + i / 6) % 1; c.fillStyle = `rgba(255,220,120,${1 - q})`; c.beginPath(); c.arc(x + Math.sin(i * 2.3 + q * 4) * 22, y - 10 - q * 60, 1.5, 0, 7); c.fill(); }
}
function stone(c, s, t) {
  const { x, y } = FIRE;
  // a flat hot stone laid across the coals, with two flatbreads at the back
  c.fillStyle = '#6a5a52'; c.beginPath(); c.ellipse(x, y - 6, 42, 11, 0, 0, 7); c.fill();
  c.fillStyle = '#8a7a70'; c.beginPath(); c.ellipse(x, y - 8, 40, 9.5, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,200,140,0.35)'; c.beginPath(); c.ellipse(x - 8, y - 10, 24, 4, 0, 0, 7); c.fill();
  bread(c, x - 36, y - 18, 0.9); bread(c, x + 38, y - 16, 0.9);
  const pu = 0.5 + 0.5 * Math.sin(t * 7);
  s.grill.forEach((f, i) => {
    const sx = x + SLOTS[i][0], sy = y + SLOTS[i][1];
    if (!f) { if (s.held && s.held.kind === 'raw') { c.save(); c.globalAlpha = 0.45 + 0.35 * pu; c.strokeStyle = '#fff6d0'; c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); c.ellipse(sx, sy, 13, 6, 0, 0, 7); c.stroke(); c.restore(); } return; }
    const k = Math.min(1, (t - f.t) / s.cook), ready = k >= 1, sizzle = ready ? 0 : Math.sin(t * 40 + i) * 0.6;
    if (ready) { c.save(); c.globalCompositeOperation = 'screen'; glow(c, sx, sy, 24, '#fff2a0', 0.4 + 0.4 * pu); c.restore(); }
    c.save(); c.translate(sx, sy + sizzle); c.rotate(i === 1 ? 0 : i ? 0.12 : -0.12); P.fishShape(c, 0, 0, 0.62, P.mix(RAW, DONE, k));
    c.strokeStyle = P.rgba('#4a2a18', 0.5 * k); c.lineWidth = 1.2; for (const gx of [-5, 0, 5]) { c.beginPath(); c.moveTo(gx - 2, -4); c.lineTo(gx + 2, 4); c.stroke(); }
    c.restore();
    // steam curls while it cooks, a little twinkle when it is done
    if (!ready) for (let j = 0; j < 2; j++) { const q = (t * 2 + j * 0.5 + i * 0.3) % 1; c.strokeStyle = `rgba(255,255,255,${0.6 * (1 - q)})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(sx - 3 + j * 6, sy - 6 - q * 22); c.quadraticCurveTo(sx + 2 + j * 6, sy - 12 - q * 22, sx - 2 + j * 6, sy - 18 - q * 22); c.stroke(); }
    else { const tw = Math.max(0, Math.sin(t * 6 + i * 2)); c.save(); c.globalAlpha = tw; c.fillStyle = '#fffbe0'; drawStar(c, sx + 10, sy - 10, 2.5 + tw * 3, t); c.restore(); }
  });
}
function gull(c, x, y, s, t) { c.save(); c.translate(x, y); c.scale(s, s); const f = Math.sin(t * 8 + x) * 4; c.strokeStyle = 'rgba(255,255,255,0.92)'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath(); c.moveTo(-9, -f); c.quadraticCurveTo(-4, -4, 0, 0); c.quadraticCurveTo(4, -4, 9, -f); c.stroke(); c.restore(); }
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
