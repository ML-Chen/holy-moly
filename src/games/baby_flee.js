// FLEE! — Matthew 2:13–15. Warned in a dream, Joseph takes Mary and baby Jesus by night to Egypt, where they live as refugees.
// The road scrolls toward you: drag the donkey left and right along the moonlit path, around rocks and thorny bushes,
// until the glowing city by the Nile comes into view.
const CL = P.CLOTH, SK = P.SKIN, HR = P.HAIR;
const HY = 548;            // the family's place on screen
const HOR = 300;           // the horizon
const eo = k => 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3);
// perspective: z is distance ahead (0 = at the family, 1 = horizon). Screen y and scale from z.
const zy = z => HOR + (HY + 40 - HOR) * Math.pow(1 - z, 2.2);
const zs = z => Math.max(0.05, Math.pow(1 - z, 2.2));
const roadX = (z, d) => 180 + curve(d + z * 3) * (1 - z * 0.8);
function curve(u) { return Math.sin(u * 0.7) * 40 + Math.sin(u * 1.9 + 1) * 14; }

function thorn(c, x, y, s, t) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,10,40,0.35)'; c.beginPath(); c.ellipse(0, 2, 26, 6, 0, 0, 7); c.fill();
  c.strokeStyle = '#4a3a3a'; c.lineWidth = 2.4; c.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.12 + i * 0.095), l = 22 + (i % 3) * 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * l, Math.sin(a) * l); c.stroke();
    c.lineWidth = 1.2; for (let k = 1; k < 3; k++) { const px = Math.cos(a) * l * k / 3, py = Math.sin(a) * l * k / 3; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a + 1.2) * 5, py + Math.sin(a + 1.2) * 5); c.stroke(); } c.lineWidth = 2.4; }
  c.fillStyle = '#5a6a4a'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-14 + i * 4.6, -14 - Math.sin(i * 1.3) * 6, 5, 0, 7); c.fill(); }
  c.fillStyle = '#e8a0c0'; for (const [fx, fy] of [[-8, -20], [6, -24], [14, -14]]) { c.beginPath(); c.arc(fx, fy, 2, 0, 7); c.fill(); }
  c.restore();
}
function boulder(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(10,10,40,0.35)'; c.beginPath(); c.ellipse(2, 2, 28, 6, 0, 0, 7); c.fill();
  const g = c.createLinearGradient(-20, -34, 20, 0); g.addColorStop(0, '#b0a0b8'); g.addColorStop(1, '#4a3e5a'); c.fillStyle = g;
  c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(-30, -22, -12, -32); c.quadraticCurveTo(8, -38, 22, -24); c.quadraticCurveTo(30, -10, 26, 0); c.closePath(); c.fill();
  c.strokeStyle = '#2e2440'; c.lineWidth = 1.6; c.stroke();
  c.fillStyle = 'rgba(230,230,255,0.35)'; c.beginPath(); c.ellipse(-8, -26, 9, 4, -0.4, 0, 7); c.fill();
  c.restore();
}
function palm(c, x, y, s, t, lean) { P.palm(c, x, y, s, lean, t, '#2e5a5a'); }

MG.add({
  id: 'flee', stage: 'baby', cmd: 'FLEE!', hint: 'drag', time: 6, mood: 'night', winText: 'Safe!',
  card: { title: 'Refugees in Egypt', ref: 'Matthew 2:13–15', kind: 'Gospel story', text: 'The Gospel of Matthew tells how an angel warned Joseph in a dream that baby Jesus was in danger. Joseph woke Mary, and that night they left for Egypt. Jesus and his family became refugees, living far from home until it was safe to go back.', ask: 'Some families have to leave home to stay safe. How could you welcome a new family?' },
  init(g) {
    const s = g.s; s.x = 180; s.tx = 180; s.dist = 0; s.len = [4.0, 4.6, 5.0][g.level]; s.v = [1.1, 1.2, 1.3][g.level] * Math.sqrt(g.speed);
    s.bump = -9; s.safe = -1; s.drag = false; s.go = 0;
    // obstacles along the road: z position along the journey (in distance units) and a lane offset from the road centre
    const n = [4, 6, 8][g.level], kinds = ['rock', 'thorn'];
    s.obs = [];
    // each obstacle arrives at a set spot across the screen; every other one sits right in the middle of the way
    const spots = [180, 108, 252, 140, 220, 96, 264, 180];
    for (let i = 0; i < n; i++) { const d = 0.9 + i * (s.len - 1.4) / n + Math.random() * 0.15; const tx = i % 2 === 0 ? 170 + Math.random() * 20 : spots[1 + Math.floor(Math.random() * 6)];
      s.obs.push({ d, lane: (tx - roadX(0, d)) / 1.3, kind: kinds[Math.floor(Math.random() * 2)], hit: false }); }
    s.fire = Array.from({ length: 24 }, () => ({ x: Math.random() * W, y: Math.random() * 300, ph: Math.random() * 6 }));
  },
  down(g, x) { const s = g.s; s.drag = true; s.tx = Math.max(40, Math.min(320, x)); },
  move(g, x) { const s = g.s; if (s.drag) s.tx = Math.max(40, Math.min(320, x)); },
  up(g) { g.s.drag = false; },
  update(g, dt) {
    const s = g.s; if (s.safe >= 0) { s.x += (180 - s.x) * Math.min(1, dt * 3); return; }
    const slow = g.t - s.bump < 0.5 ? 0.15 : 1;
    s.go += ((s.drag ? 1 : 0) - s.go) * Math.min(1, dt * 8);   // they walk while you lead the donkey
    s.dist += s.v * dt * slow * s.go;
    s.x += (s.tx - s.x) * Math.min(1, dt * 10);
    for (const o of s.obs) {
      const z = (o.d - s.dist) / 3; if (o.hit || z > 0.05 || z < -0.06) continue;
      const ox = roadX(0, s.dist) + o.lane * 1.3;
      if (Math.abs(ox - s.x) < 34) { o.hit = true; s.bump = g.t; g.sfx(o.kind === 'rock' ? 'thud' : 'rustle'); g.sfx('bray'); g.shake(4, 0.2); s.x += (s.x < ox ? -1 : 1) * 30; s.tx = s.x; }
    }
    if (s.dist >= s.len && !g.done) { s.safe = g.t; g.win(); g.sfx('magic'); g.burst(180, HOR + 10, ['#fff2b0', '#ffd45a', '#ffffff', '#9fe0ff'], 30, 180); }
  },
  auto(g, dt, synth) {
    const s = g.s; if (g.t < 0.3) return; if (!s.drag) { synth('down', s.x, HY - 20); return; }
    // aim for the road centre, dodging the next obstacle to its far side
    let aim = roadX(0, s.dist);
    for (const o of s.obs) { const z = (o.d - s.dist) / 3; if (o.hit || z < -0.04 || z > 0.28) continue; aim = roadX(0, s.dist) + o.lane * 1.3 + (o.lane > 0 ? -72 : 72); break; }
    synth('move', aim, HY - 20);
  },
  draw(g, c) {
    const s = g.s, t = g.t, won = s.safe >= 0, prog = Math.min(1, s.dist / s.len);
    c.drawImage(g.bake('baby_flee_sky', o => {
      P.sky(o, W, H, ['#060a26', '#11184a', '#24286a', '#3c3a7a', '#7a5a8a']);
      P.stars(o, W, 300, 170, 61, 0);
      // a big full moon
      const mx = 82, my = 110; const mh = o.createRadialGradient(mx, my, 10, mx, my, 150); mh.addColorStop(0, 'rgba(230,236,255,0.35)'); mh.addColorStop(1, 'rgba(200,210,255,0)'); o.fillStyle = mh; o.fillRect(0, 0, 260, 280);
      const md = o.createRadialGradient(mx - 8, my - 8, 2, mx, my, 30); md.addColorStop(0, '#ffffff'); md.addColorStop(1, '#dcdcf0'); o.fillStyle = md; o.beginPath(); o.arc(mx, my, 30, 0, 7); o.fill();
      o.fillStyle = 'rgba(160,160,200,0.3)'; for (const [dx, dy, r] of [[-10, 4, 7], [9, -9, 5], [8, 11, 4], [-4, -14, 3]]) { o.beginPath(); o.arc(mx + dx, my + dy, r, 0, 7); o.fill(); }
      // thin silver clouds across the moon
      for (const [cx, cy, w] of [[110, 140, 120], [250, 90, 80], [40, 200, 90]]) { const cg = o.createLinearGradient(0, cy - 8, 0, cy + 8); cg.addColorStop(0, 'rgba(200,200,255,0)'); cg.addColorStop(0.5, 'rgba(200,200,240,0.3)'); cg.addColorStop(1, 'rgba(120,120,180,0)'); o.fillStyle = cg; o.beginPath(); o.ellipse(cx, cy, w, 7, 0, 0, 7); o.fill(); }
    }), 0, 0, W, H);
    P.stars(c, W, 280, 24, 71, t);
    // Egypt's city by the Nile glows on the horizon and grows nearer as they travel
    const cityK = 0.4 + 0.6 * eo(prog), cy = HOR + 4, cs = 0.75 + 0.8 * Math.pow(prog, 1.5) + (won ? eo((t - s.safe) / 0.7) * 0.2 : 0);
    c.save(); c.globalCompositeOperation = 'lighter'; const cg = c.createRadialGradient(180, cy, 4, 180, cy, 160 * cs); cg.addColorStop(0, `rgba(255,200,120,${0.45 * cityK + (won ? 0.3 : 0)})`); cg.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = cg; c.beginPath(); c.arc(180, cy, 160 * cs, 0, 7); c.fill(); c.restore();
    c.save(); c.translate(180, cy); c.scale(cs, cs);
    // the river: a ribbon of moonlight
    c.fillStyle = 'rgba(160,190,255,0.55)'; c.beginPath(); c.moveTo(-200, 6); c.quadraticCurveTo(0, 0, 200, 8); c.lineTo(200, 12); c.quadraticCurveTo(0, 6, -200, 12); c.fill();
    // walls, flat roofs, a little obelisk and two pyramids far off
    c.fillStyle = '#4a3a6a'; c.beginPath(); c.moveTo(-150, 2); c.lineTo(-120, -30); c.lineTo(-90, 2); c.fill(); c.beginPath(); c.moveTo(110, 2); c.lineTo(130, -20); c.lineTo(150, 2); c.fill();
    for (const [hx, hw, hh] of [[-70, 22, 18], [-46, 18, 26], [-26, 26, 16], [-2, 20, 30], [20, 24, 20], [44, 18, 24], [62, 22, 14]]) { const hg = c.createLinearGradient(0, -hh, 0, 0); hg.addColorStop(0, '#c0a0a0'); hg.addColorStop(1, '#6a5070'); c.fillStyle = hg; c.fillRect(hx, -hh, hw, hh + 3);
      c.fillStyle = '#ffd890'; c.fillRect(hx + hw * 0.3, -hh * 0.6, 3.5, 3.5); if (hw > 20) c.fillRect(hx + hw * 0.65, -hh * 0.6, 3.5, 3.5); }
    c.fillStyle = '#a08890'; c.beginPath(); c.moveTo(84, 2); c.lineTo(86, -40); c.lineTo(88, -44); c.lineTo(90, -40); c.lineTo(92, 2); c.fill();
    palm(c, -86, 4, 0.35, t, 0.1); palm(c, 78, 4, 0.3, t, -0.12); palm(c, 100, 4, 0.36, t, 0.08);
    c.restore();
    // desert ground: dunes either side of the road
    c.drawImage(g.bake('baby_flee_ground', o => {
      P.hills(o, W, HOR + 6, 10, '#3a3060', '#2a2450', { seed: 3, freq: 0.02, dabs: 10, bottom: 640 });
      const gg = o.createLinearGradient(0, HOR, 0, 640); gg.addColorStop(0, '#4e3e6e'); gg.addColorStop(0.4, '#6a4e74'); gg.addColorStop(1, '#3a2848'); o.fillStyle = gg; o.fillRect(0, HOR + 6, W, 640 - HOR);
      // moonlit dunes rolling away on both sides of the road, each crest catching silver light
      const dune = (cx, by, w, h, top, bot) => { o.save(); o.beginPath(); o.moveTo(cx - w, by); o.bezierCurveTo(cx - w * 0.5, by - h * 0.2, cx - w * 0.3, by - h, cx, by - h); o.bezierCurveTo(cx + w * 0.4, by - h, cx + w * 0.6, by - h * 0.1, cx + w, by); o.closePath(); const dg = o.createLinearGradient(cx - w, by - h, cx + w * 0.3, by); dg.addColorStop(0, top); dg.addColorStop(1, bot); o.fillStyle = dg; o.fill();
        o.strokeStyle = 'rgba(220,210,255,0.45)'; o.lineWidth = 2; o.beginPath(); o.moveTo(cx - w * 0.75, by - h * 0.25); o.bezierCurveTo(cx - w * 0.4, by - h * 0.7, cx - w * 0.2, by - h, cx, by - h); o.bezierCurveTo(cx + w * 0.2, by - h, cx + w * 0.35, by - h * 0.85, cx + w * 0.5, by - h * 0.55); o.stroke(); o.restore(); };
      dune(30, HOR + 30, 90, 22, '#6a5888', '#3e3060'); dune(330, HOR + 34, 100, 26, '#6a5888', '#3e3060');
      dune(-10, HOR + 110, 120, 50, '#7a6290', '#45345e'); dune(372, HOR + 120, 130, 56, '#7a6290', '#45345e');
      dune(-30, 560, 120, 90, '#86689a', '#4a3660'); dune(392, 580, 130, 100, '#86689a', '#4a3660');
      const r = P.rng(5); o.strokeStyle = 'rgba(255,220,240,0.12)'; o.lineWidth = 1.2; for (let i = 0; i < 40; i++) { const y = HOR + 10 + Math.pow(r(), 1.6) * 330, x = r() * W, w = 20 + (y - HOR) * 0.3; o.beginPath(); o.moveTo(x - w, y); o.quadraticCurveTo(x, y - 3, x + w, y); o.stroke(); }
    }), 0, 0, W, H);
    // the road: a pale, winding trail that scrolls toward the viewer
    c.save(); c.beginPath();
    for (let i = 0; i <= 40; i++) { const z = i / 40, y = zy(z), hw = 8 + 64 * zs(z); const x = roadX(z, s.dist) - hw; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    for (let i = 40; i >= 0; i--) { const z = i / 40, y = zy(z), hw = 8 + 64 * zs(z); c.lineTo(roadX(z, s.dist) + hw, y); }
    c.closePath(); const rg = c.createLinearGradient(0, HOR, 0, 640); rg.addColorStop(0, '#c8a8b8'); rg.addColorStop(1, '#8a6a88'); c.fillStyle = rg; c.globalAlpha = 0.75; c.fill(); c.restore();
    // footprints / ruts scroll by to show motion
    c.save(); c.fillStyle = 'rgba(70,50,80,0.35)'; for (let k = 0; k < 14; k++) { const u = ((k / 14) - (s.dist * 3 % 1) / 14 + 1) % 1, z = u; const y = zy(z), sc = zs(z); if (y < HOR + 4) continue; for (const side of [-1, 1]) { c.beginPath(); c.ellipse(roadX(z, s.dist) + side * 20 * sc, y, 4 * sc + 0.5, 1.6 * sc + 0.3, 0, 0, 7); c.fill(); } } c.restore();
    // roadside palms and obstacles, far to near
    const items = [];
    for (let k = 0; k < 10; k++) { const dd = Math.floor(s.dist * 1.6) / 1.6 + k / 1.6, z = (dd - s.dist) / 3; if (z < -0.05 || z > 1) continue; const side = (Math.floor(dd * 1.6) % 2) ? 1 : -1; items.push({ z, kind: 'palm', x: roadX(z, s.dist) + side * (90 + 120 * zs(z)), side }); }
    for (const o of s.obs) { const z = (o.d - s.dist) / 3; if (z < -0.08 || z > 1) continue; items.push({ z, kind: o.kind, x: roadX(z, s.dist) + o.lane * zs(z) * 1.3 + 0, o }); }
    items.sort((a, b) => b.z - a.z);
    const famDrawn = { done: false };
    const drawFamily = () => {
      const bump = Math.max(0, 1 - (t - s.bump) / 0.45), x = s.x + Math.sin((t - s.bump) * 30) * 4 * bump, walkB = won ? Math.abs(Math.sin(t * 8)) * 4 : Math.abs(Math.sin(t * 9)) * 2.5 * s.go;
      const fx = s.x < s.tx - 4 ? 1 : s.x > s.tx + 4 ? -1 : 1;
      // a lantern's warm glow around them
      c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(x, HY - 30, 4, x, HY - 30, 80); lg.addColorStop(0, 'rgba(255,200,120,0.3)'); lg.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = lg; c.beginPath(); c.arc(x, HY - 30, 80, 0, 7); c.fill(); c.restore();
      // Joseph leads, holding a lantern
      P.person(c, x + 40, HY + 6 - walkB, 1.0, { skin: SK[3], robe: CL.brown, stripe: CL.sand, beard: true, hair: HR[0], hairStyle: 'curly', expr: won ? 'laugh' : bump > 0.2 ? 'surprised' : 'happy', arms: won ? 'cheer' : 'reach', t, phase: 1, facing: -1 });
      const lx = x + 40 - 22, ly = HY - 30 - walkB; c.strokeStyle = '#3a2a2a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(lx, ly - 8); c.lineTo(lx, ly); c.stroke(); c.fillStyle = '#ffe0a0'; c.strokeStyle = '#5a3a2a'; c.beginPath(); c.moveTo(lx - 5, ly); c.lineTo(lx + 5, ly); c.lineTo(lx + 6, ly + 12); c.lineTo(lx - 6, ly + 12); c.closePath(); c.fill(); c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; const fl = c.createRadialGradient(lx, ly + 6, 1, lx, ly + 6, 22); fl.addColorStop(0, `rgba(255,220,140,${0.8 + 0.2 * Math.sin(t * 12)})`); fl.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = fl; c.beginPath(); c.arc(lx, ly + 6, 22, 0, 7); c.fill(); c.restore();
      // the donkey with Mary holding baby Jesus
      P.donkey(c, x - 6, HY + 4 - walkB * 0.5, 1.5, { facing: -1 });
      c.save(); c.beginPath(); c.rect(x - 70, HY - 220, 140, 220 - 36); c.clip();
      P.person(c, x - 8, HY - 10 - walkB * 0.5, 0.9, { skin: SK[2], robe: CL.indigo, stripe: CL.sky, head: 'scarf', headCol: CL.sky, expr: won ? 'laugh' : bump > 0.2 ? 'surprised' : 'happy', arms: 'hold', t, phase: 2, facing: -1,
        hold: (cc, hx, hy) => { cc.fillStyle = '#fbf2de'; cc.strokeStyle = '#c8b090'; cc.lineWidth = 1; cc.beginPath(); cc.ellipse(hx, hy - 2, 9, 6, 0.3, 0, 7); cc.fill(); cc.stroke(); cc.fillStyle = SK[1]; cc.beginPath(); cc.arc(hx + 6, hy - 5, 4.2, 0, 7); cc.fill(); cc.fillStyle = HR[1]; cc.beginPath(); cc.arc(hx + 6, hy - 7, 3.5, Math.PI, 0); cc.fill(); } });
      c.restore();
      c.save(); c.translate(x - 6, HY + 4 - walkB * 0.5); c.scale(-1.5, 1.5); c.fillStyle = '#8a3a5a'; c.beginPath(); c.moveTo(-10, -26); c.quadraticCurveTo(0, -30, 10, -26); c.lineTo(9, -16); c.lineTo(-9, -16); c.closePath(); c.fill(); c.fillStyle = '#f2c94c'; c.fillRect(-9, -18, 18, 2); c.restore();
      if (!s.drag && !won) { const hp = (t * 1.3) % 1; c.save(); c.strokeStyle = `rgba(255,240,200,${0.7 * (1 - hp)})`; c.lineWidth = 2.5; c.beginPath(); c.ellipse(x - 6, HY + 2, 30 + hp * 26, 9 + hp * 8, 0, 0, 7); c.stroke(); c.restore(); }
      famDrawn.done = true;
    };
    for (const it of items) {
      if (!famDrawn.done && it.z < 0) drawFamily();
      const y = zy(it.z), sc = zs(it.z);
      if (it.kind === 'palm') palm(c, it.x, y, 0.35 + 0.95 * sc, t, it.side * -0.15);
      else { c.save(); if (it.o.hit) c.globalAlpha = 0.6; if (it.kind === 'rock') boulder(c, it.x, y, 0.35 + 1.25 * sc); else thorn(c, it.x, y, 0.35 + 1.3 * sc, t); c.restore();
        if (!it.o.hit && it.z < 0.35 && it.z > 0.02) { c.save(); c.globalAlpha = 0.5 * (1 - it.z / 0.35); c.strokeStyle = '#ffc0a8'; c.lineWidth = 2; c.beginPath(); c.ellipse(it.x, y + 2, 34 * (0.3 + 1.1 * sc), 8 * (0.3 + 1.1 * sc), 0, 0, 7); c.stroke(); c.restore(); } }
    }
    if (!famDrawn.done) drawFamily();
    // fireflies drifting in the dark
    c.save(); c.globalCompositeOperation = 'lighter'; for (const f of s.fire) { const a = 0.4 + 0.4 * Math.sin(t * 3 + f.ph); c.fillStyle = `rgba(255,240,170,${a})`; c.beginPath(); c.arc((f.x + Math.sin(t * 0.8 + f.ph) * 20) % W, HOR + 30 + (f.y + Math.cos(t * 0.6 + f.ph) * 10) % 280, 1.6, 0, 7); c.fill(); } c.restore();
    if (won) { const q = eo((t - s.safe) / 0.7); c.save(); c.globalCompositeOperation = 'lighter'; const wg = c.createRadialGradient(180, HOR, 10, 180, HOR, 360); wg.addColorStop(0, `rgba(255,210,130,${0.45 * q})`); wg.addColorStop(1, 'rgba(255,190,110,0)'); c.fillStyle = wg; c.fillRect(0, 0, W, H); c.restore(); P.rays(c, 180, HOR, W, H, '#ffe8b0', 0.16 * q, 9, t); }
    P.vignette(c, W, H, 0.35); P.grain(c, W, H, 0.06);
  },
});
