// DROP! — John 8:2–11. Angry people hold stones; Jesus kneels and writes in the sand. Tap each stone so they drop it and walk away thinking.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const JESUS = { skin: SK[3], robe: '#f6efe0', beard: true, hair: HR[1], hairStyle: 'long' };
const WOMAN = { skin: SK[1], robe: CL.rose, stripe: CL.cream, hairStyle: 'long', hair: HR[2] };
const WX = 180, WY = 470; // the frightened woman
const SPOTS = [[64, 452], [298, 452], [118, 372], [244, 372], [42, 556], [318, 556]];
const LOOKS = [
  { skin: SK[3], robe: CL.indigo, stripe: CL.gold, beard: true, hair: HR[0], head: 'wrap', headCol: CL.white },
  { skin: SK[1], robe: CL.olive, stripe: CL.cream, beard: true, hair: HR[5], hairStyle: 'bald' },
  { skin: SK[2], robe: CL.rust, stripe: CL.sand, beard: true, hair: HR[1] },
  { skin: SK[0], robe: CL.plum, stripe: CL.gold, beard: true, hair: HR[3], head: 'wrap', headCol: CL.sand },
  { skin: SK[2], robe: CL.teal, stripe: CL.cream, hairStyle: 'bun', hair: HR[0] },
  { skin: SK[3], robe: CL.brown, stripe: CL.saffron, beard: true, hair: HR[0], hairStyle: 'curly' },
];
const STONE = '#9a9ca6';

function stone(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const g = c.createRadialGradient(-4, -5, 1, 0, 0, 13); g.addColorStop(0, '#d6d8de'); g.addColorStop(0.6, STONE); g.addColorStop(1, '#666874');
  c.fillStyle = g; c.strokeStyle = '#4a4a58'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-12, 2); c.quadraticCurveTo(-13, -8, -4, -10); c.quadraticCurveTo(8, -12, 12, -3); c.quadraticCurveTo(14, 7, 3, 9); c.quadraticCurveTo(-10, 10, -12, 2); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-4, -5, 4, 2, -0.4, 0, 7); c.fill(); c.restore();
}
function column(c, x, base, top, w) {
  const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#c8a070'); g.addColorStop(0.35, '#fbe6bc'); g.addColorStop(1, '#a88458');
  c.fillStyle = g; c.fillRect(x - w / 2, top, w, base - top);
  c.strokeStyle = 'rgba(120,80,40,0.25)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x - w / 2 + i * w / 4, top + 6); c.lineTo(x - w / 2 + i * w / 4, base - 6); c.stroke(); }
  c.fillStyle = '#e8cc98'; c.fillRect(x - w / 2 - 5, top - 9, w + 10, 10); c.fillRect(x - w / 2 - 4, base - 6, w + 8, 8);
  c.fillStyle = 'rgba(255,250,230,0.5)'; c.fillRect(x - w / 2 - 5, top - 9, w + 10, 2);
}

MG.add({
  id: 'drop', stage: 'jesus', cmd: 'DROP!', hint: 'tap', time: 5, mood: 'desert', winText: 'Mercy!',
  card: { title: 'Nobody throws a stone', ref: 'John 8:2–11', kind: 'Story', text: 'Some leaders brought a woman to Jesus at the temple and said she should be punished with stones for what she had done. Jesus bent down and wrote in the dirt, then said that whoever had never done anything wrong could throw the first stone. One by one they all walked away, and Jesus told her he did not condemn her and that she could go and begin again.', ask: 'When someone makes a mistake, how can you choose to be kind to them instead of piling on?' },
  init(g) {
    const s = g.s, n = [3, 4, 6][g.level];
    const order = [0, 1, 2, 3, 4, 5].slice(0, n), looks = LOOKS.slice().sort(() => Math.random() - 0.5);
    s.ppl = order.map((k, i) => { const [x, y] = SPOTS[k]; return { x, y, hx: x, sc: 0.92 + (y - 372) / 184 * 0.22, look: looks[i], face: x < WX ? 1 : -1, dropped: false, dropT: 0, phase: Math.random() * 6, rock: null }; });
    s.puffs = []; s.relief = 0; s.winT = -1; s.marks = [];
  },
  down(g, x, y) {
    const s = g.s; let best = null, bd = 44;
    for (const p of s.ppl) { if (p.dropped) continue; const r = rockPos(p, g.t); const d = Math.hypot(x - r.x, y - r.y); if (d < bd) { bd = d; best = p; } }
    if (!best) { for (const p of s.ppl) if (!p.dropped && Math.abs(x - p.x) < 30 * p.sc && y < p.y && y > p.y - 80 * p.sc) { best = p; break; } }
    if (best) {
      const r = rockPos(best, g.t); best.dropped = true; best.dropT = g.t; best.rock = { x: r.x, y: r.y, y0: r.y, vy: -60, land: best.y + 4, rest: false };
      g.sfx('pop'); g.burst(r.x, r.y, ['#ffffff', '#fff2c0', '#cfd2dc'], 10, 120);
      if (s.ppl.every(p => p.dropped)) { s.winT = g.t; g.sfx('harp'); g.burst(WX, WY - 60, ['#ffd45a', '#ffffff', '#ff9ab0', '#a8e08a'], 26, 200); g.win(); }
    } else { s.puffs.push({ x, y, t: g.t }); g.sfx('tap'); }
  },
  update(g, dt) {
    const s = g.s;
    for (const p of s.ppl) {
      if (p.rock && !p.rock.rest) { p.rock.vy += 900 * dt; p.rock.y += p.rock.vy * dt; if (p.rock.y >= p.rock.land) { p.rock.y = p.rock.land; p.rock.rest = true; g.sfx('thud'); g.burst(p.rock.x, p.rock.land, ['#e8d4a8', '#d8c090'], 6, 70); } }
      if (p.dropped && g.t - p.dropT > 0.35) p.x += (p.hx < WX ? -1 : 1) * 75 * dt; // walk away, heads down
    }
    const target = s.ppl.filter(p => p.dropped).length / s.ppl.length; s.relief += (target - s.relief) * Math.min(1, dt * 6);
    if (Math.random() < dt * 3) s.marks.push(g.t);
  },
  auto(g, dt, synth) { const s = g.s; if (g.t < 0.4 || g.t - (s.botT || 0) < 0.28) return; const p = s.ppl.find(q => !q.dropped); if (!p) return; s.botT = g.t; const r = rockPos(p, g.t); synth('down', r.x, r.y); synth('up', r.x, r.y); },
  draw(g, c) {
    const s = g.s, t = g.t, won = g.result === 'win';
    c.drawImage(g.bake('jesus_drop_bg', o => {
      P.sky(o, W, H, ['#6a9ccc', '#b8d4e0', '#fde6bc', '#f8c890'], { x: 70, y: 120, r: 24, color: '#fff0c0', glow: 240 });
      P.cloud(o, 260, 80, 0.6, '#fff8ec', '#e8c8c0', 0.85);
      // the temple: a tall golden facade far behind
      const tg = o.createLinearGradient(0, 120, 0, 300); tg.addColorStop(0, '#fdf0d0'); tg.addColorStop(1, '#e0c08a'); o.fillStyle = tg; o.fillRect(110, 150, 140, 150);
      o.fillStyle = '#d8a84a'; o.fillRect(104, 142, 152, 12); o.fillStyle = '#f8d878'; o.fillRect(104, 142, 152, 3);
      o.fillStyle = '#6a4a3a'; o.beginPath(); o.moveTo(160, 300); o.lineTo(160, 210); o.arc(180, 210, 20, Math.PI, 0); o.lineTo(200, 300); o.fill();
      const dg = o.createLinearGradient(0, 190, 0, 300); dg.addColorStop(0, 'rgba(255,220,140,0.6)'); dg.addColorStop(1, 'rgba(255,220,140,0.1)'); o.fillStyle = dg; o.beginPath(); o.moveTo(164, 300); o.lineTo(164, 212); o.arc(180, 212, 16, Math.PI, 0); o.lineTo(196, 300); o.fill();
      for (let i = 0; i < 6; i++) { const x = 120 + i * 24; o.fillStyle = 'rgba(160,110,50,0.25)'; o.fillRect(x, 160, 4, 130); }
      // colonnades on each side, stepping back
      const cb = o.createLinearGradient(0, 200, 0, 320); cb.addColorStop(0, '#f0d8a8'); cb.addColorStop(1, '#d4b07a'); o.fillStyle = cb; o.fillRect(0, 214, 116, 106); o.fillRect(244, 214, 116, 106);
      o.fillStyle = 'rgba(90,60,40,0.35)'; o.fillRect(0, 232, 116, 88); o.fillRect(244, 232, 116, 88);
      for (let i = 0; i < 4; i++) { column(o, 12 + i * 32, 318, 232, 12); column(o, 252 + i * 32, 318, 232, 12); }
      o.fillStyle = '#e8cc98'; o.fillRect(0, 210, 116, 14); o.fillRect(244, 210, 116, 14);
      // the courtyard: warm flagstones in perspective
      const fl = o.createLinearGradient(0, 316, 0, 640); fl.addColorStop(0, '#f2dcae'); fl.addColorStop(1, '#d8b47c'); o.fillStyle = fl; o.fillRect(0, 316, W, 324);
      o.strokeStyle = 'rgba(150,110,60,0.28)'; o.lineWidth = 1.2;
      for (let i = 0; i < 9; i++) { const y = 316 + Math.pow(i / 8, 1.6) * 324; o.beginPath(); o.moveTo(0, y); o.lineTo(W, y); o.stroke(); }
      for (let i = -8; i <= 8; i++) { o.beginPath(); o.moveTo(180 + i * 22, 316); o.lineTo(180 + i * 90, 640); o.stroke(); }
      const r = P.rng(12); for (let i = 0; i < 50; i++) { o.fillStyle = r() < 0.5 ? 'rgba(255,248,220,0.3)' : 'rgba(140,100,60,0.12)'; o.beginPath(); o.ellipse(r() * W, 330 + r() * 310, 6 + r() * 14, 2 + r() * 3, 0, 0, 7); o.fill(); }
      // a patch of dusty sand in front, where Jesus writes
      const sd = o.createRadialGradient(180, 588, 6, 180, 588, 110); sd.addColorStop(0, '#f4dcaa'); sd.addColorStop(0.7, 'rgba(236,206,150,0.8)'); sd.addColorStop(1, 'rgba(236,206,150,0)'); o.save(); o.translate(180, 588); o.scale(1, 0.38); o.translate(-180, -588); o.fillStyle = sd; o.beginPath(); o.arc(180, 588, 110, 0, 7); o.fill(); o.restore();
      P.rays(o, 70, 120, W, H, '#fff2c8', 0.13, 9, 0);
      // potted olive trees by the colonnade
      P.tree(o, 26, 340, 0.42, '#7a9a52', 2); P.tree(o, 336, 340, 0.42, '#7a9a52', 6);
    }), 0, 0, W, H);
    for (const [dx, ph] of [[132, 0], [222, 2.2]]) { const hop = Math.max(0, Math.sin(t * 2.4 + ph)) ; const peck = Math.sin(t * 5 + ph) > 0.6; c.save(); c.translate(dx + Math.sin(t * 0.7 + ph) * 8, 142 - hop * 3); if (peck) c.rotate(0.25); P.dove(c, 0, 0, 0.5, { t, flying: false, facing: Math.sin(t * 0.7 + ph + 1.5) > 0 ? 1 : -1 }); c.restore(); }
    // golden warmth that grows around the woman as mercy wins
    const rl = s.relief; const wg = c.createRadialGradient(WX, WY - 40, 8, WX, WY - 40, 90 + rl * 80); wg.addColorStop(0, `rgba(255,236,170,${0.2 + rl * 0.45})`); wg.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = wg; c.beginPath(); c.arc(WX, WY - 40, 90 + rl * 80, 0, 7); c.fill();
    // writing in the sand: wavy marks appear as Jesus writes (no letters)
    c.strokeStyle = 'rgba(140,96,50,0.55)'; c.lineWidth = 1.6; c.lineCap = 'round';
    const nm = Math.min(7, Math.floor(t * 2.2) + 1); for (let i = 0; i < nm; i++) { const mx = 176 + (i % 4) * 24, my = 596 + Math.floor(i / 4) * 12; c.beginPath(); for (let k = 0; k <= 8; k++) { const xx = mx + k * 2, yy = my + Math.sin(k * 1.4 + i) * 2.4; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
    // everyone, sorted by depth
    const items = s.ppl.map(p => ({ y: p.y, f: () => drawAccuser(c, p, t, g) }));
    items.push({ y: WY, f: () => {
      const scared = 1 - rl; const shake = scared > 0.3 ? Math.sin(t * 30) * 0.8 * scared : 0;
      P.person(c, WX + shake, WY, 1.18, { ...WOMAN, t, phase: 1, bounce: won ? 2.4 : 0.4, expr: won ? 'laugh' : rl > 0.55 ? 'wow' : 'sad', arms: won ? 'cheer' : rl > 0.55 ? 'down' : 'pray' });
      if (!won && rl < 0.55) { c.fillStyle = 'rgba(170,220,255,0.85)'; const dq = (t * 1.2) % 1; c.beginPath(); c.ellipse(WX - 9, WY - 78 + dq * 10, 1.8, 2.6, 0, 0, 7); c.fill(); }
    } });
    items.push({ y: 604, f: () => kneelingJesus(c, 128, 604, t, won) });
    items.sort((a, b) => a.y - b.y).forEach(it => it.f());
    for (const p of s.ppl) if (p.rock) { const sh = p.rock.rest ? 1 : 0.5; c.fillStyle = `rgba(60,40,30,${0.25 * sh})`; c.beginPath(); c.ellipse(p.rock.x, p.rock.land + 6, 12, 3.5, 0, 0, 7); c.fill(); stone(c, p.rock.x, p.rock.y, 1.15); }
    for (const p of s.puffs) { const q = (t - p.t) / 0.4; if (q > 1) continue; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, 8 + q * 16, 0, 7); c.stroke(); }
    if (won) { const q = t - s.winT; c.save(); c.globalAlpha = Math.min(1, q * 3); c.fillStyle = '#ff8aa8'; for (let i = 0; i < 3; i++) heart(c, WX - 30 + i * 30, WY - 110 - ((q * 40 + i * 14) % 50), 6); c.restore(); }
    P.vignette(c, W, H, 0.3); P.grain(c, W, H, 0.06);
  },
});
function rockPos(p, t) { return { x: p.x + p.face * 2 * p.sc, y: p.y - 22 * p.sc + Math.sin(t * 6 + p.phase) * 0.6 }; }
function drawAccuser(c, p, t, g) {
  const sc = p.sc, gone = p.dropped ? Math.min(1, (t - p.dropT - 0.35) / 1.4) : 0; if (gone >= 1) return;
  c.save(); c.globalAlpha = 1 - Math.max(0, gone);
  const away = p.dropped && t - p.dropT > 0.35;
  if (!p.dropped) { const pu = 0.5 + 0.5 * Math.sin(t * 6 + p.phase), r = rockPos(p, t); const gl = c.createRadialGradient(r.x, r.y, 4, r.x, r.y, 34); gl.addColorStop(0, `rgba(255,255,240,${0.4 + 0.3 * pu})`); gl.addColorStop(1, 'rgba(255,255,240,0)'); c.fillStyle = gl; c.beginPath(); c.arc(r.x, r.y, 34, 0, 7); c.fill(); }
  P.person(c, p.x, p.y, sc * 1.05, { ...p.look, facing: away ? -p.face : p.face, t, phase: p.phase, bounce: away ? 2 : 0.5, expr: p.dropped ? 'calm' : 'grumpy', arms: p.dropped ? (away ? 'down' : 'pray') : 'hold', blink: away });
  c.restore();
  if (!p.dropped) { const r = rockPos(p, t); stone(c, r.x, r.y, 1.15 * sc); const pu = 0.5 + 0.5 * Math.sin(t * 6 + p.phase); c.strokeStyle = `rgba(255,255,255,${0.5 + 0.4 * pu})`; c.lineWidth = 2; c.beginPath(); c.arc(r.x, r.y, 18 + pu * 4, 0, 7); c.stroke(); }
}
function kneelingJesus(c, x, y, t, won) {
  // kneels on the ground: clip the body above the knees, then add folded legs; his finger traces the sand
  const k = 1.4; c.save(); c.beginPath(); c.rect(x - 90, y - 170, 180, 156); c.clip();
  P.person(c, x, y + 4, k, { ...JESUS, t, bounce: 0.4, expr: 'happy', arms: won ? 'out' : 'reach', blink: !won && Math.sin(t * 1.3) > 0.2 });
  c.restore();
  c.fillStyle = 'rgba(60,40,30,0.22)'; c.beginPath(); c.ellipse(x, y + 2, 40, 7, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(x, y - 30, x, y + 4); g.addColorStop(0, '#f8f2e4'); g.addColorStop(1, '#d8ccb4'); c.fillStyle = g; c.strokeStyle = '#8a7a64'; c.lineWidth = 1.6;
  c.beginPath(); c.ellipse(x + 3, y - 12, 32, 14, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#6b4226'; c.beginPath(); c.ellipse(x - 26, y - 2, 8, 4, 0, 0, 7); c.fill();
  if (!won) { const fx = x + 34 + Math.sin(t * 3) * 7, fy = y - 2; c.strokeStyle = 'rgba(140,96,50,0.5)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(fx - 4, fy + 3); c.quadraticCurveTo(fx, fy - 1, fx + 4, fy + 3); c.stroke(); }
}
function heart(c, x, y, r) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.4); c.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fill(); }
