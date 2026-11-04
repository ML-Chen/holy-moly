// paint.js — the painted storybook art library for Holy Moly!
// Everything is drawn on canvas in code: skies, hills, water, light, plants, people and animals.
// Coordinates are in the game's logical space (360 wide x 640 tall); the engine scales for the device.
const P = (() => {
  // ---------- colour helpers ----------
  const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb2hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  // shade(c, amt): amt>0 lightens toward white, amt<0 darkens toward a warm deep brown (not black, so shadows stay painterly)
  function shade(c, amt) { const [r, g, b] = hex2rgb(c); if (amt >= 0) return rgb2hex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt); const k = -amt; return rgb2hex(r + (40 - r) * k, g + (22 - g) * k, b + (34 - b) * k); }
  function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
  function rgba(c, a) { const [r, g, b] = hex2rgb(c); return `rgba(${r},${g},${b},${a})`; }
  // seeded random so painted scenes are identical every frame
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
  // smooth 1D noise for hill and wave edges
  function noise1(x, seed = 1) { const i = Math.floor(x), f = x - i, h = n => { const v = Math.sin((n + seed * 57.13) * 127.1) * 43758.5453; return v - Math.floor(v); }; const u = f * f * (3 - 2 * f); return h(i) * (1 - u) + h(i + 1) * u; }
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lum = c => { const [r, g, b] = hex2rgb(c); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  function hashStr(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }

  // ---------- offscreen caching ----------
  // Pieces that get drawn again and again (clouds every frame, the title's sky and hills) are painted once into an
  // offscreen canvas at the context's pixel density and blitted after that.
  const BIG = new Map(), SPRITES = new Map(), SEEN = new Map();
  function pxScale(ctx) { try { const m = ctx.getTransform(); return Math.hypot(m.a, m.b) || 1; } catch (e) { return 2; } }
  function offscreen(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
  function keep(map, key, c, max) { map.set(key, c); if (map.size > max) map.delete(map.keys().next().value); return c; }
  // The first call with a key paints straight into ctx, so baked backgrounds pay nothing extra; from the second call on,
  // the region (x0, y0, w, h) is painted once offscreen and reused.
  function cachedPaint(ctx, key, x0, y0, w, h, paint) {
    const k = clamp(Math.round(pxScale(ctx) * 2) / 2, 1, 2), kk = key + '@' + k;
    let c = BIG.get(kk);
    if (!c) {
      const n = (SEEN.get(kk) || 0) + 1; SEEN.set(kk, n);
      if (n < 2) { ctx.save(); paint(ctx); ctx.restore(); return; }
      c = offscreen(w * k, h * k); const o = c.getContext('2d'); o.setTransform(k, 0, 0, k, -x0 * k, -y0 * k); paint(o); keep(BIG, kk, c, 8);
    }
    ctx.drawImage(c, x0, y0, w, h);
  }
  // a fine noise tile used to dither smooth gradients so they never band
  // (tiles of faint light and dark specks at device resolution, laid with drawImage: much cheaper than a pattern fill)
  let ditherTile = null;
  function dither(ctx, x, y, w, h, a = 0.04) {
    const T = 256;
    if (!ditherTile) { ditherTile = offscreen(T, T); const g = ditherTile.getContext('2d'), id = g.createImageData(T, T), r = rng(19); for (let i = 0; i < id.data.length; i += 4) { const v = r(), lt = v < 0.5; id.data[i] = id.data[i + 1] = id.data[i + 2] = lt ? 255 : 30; id.data[i + 3] = Math.abs(v - 0.5) * 2 * 255; } g.putImageData(id, 0, 0); }
    let m; try { m = ctx.getTransform(); } catch (e) { return; }
    const x0 = Math.floor(m.a * x + m.e), y0 = Math.floor(m.d * y + m.f), x1 = Math.ceil(m.a * (x + w) + m.e), y1 = Math.ceil(m.d * (y + h) + m.f);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= a * 0.5; ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
    for (let yy = y0; yy < y1; yy += T) for (let xx = x0; xx < x1; xx += T) ctx.drawImage(ditherTile, xx, yy);
    ctx.restore();
  }

  // ---------- skin, cloth and hair palettes ----------
  // olive-leaning tones: 0-3 cover most of the ancient Levantine cast; 4-5 for Egyptians, Kushites and the wider world
  const SKIN = ['#f2d6ba', '#e6c29c', '#d6ab82', '#c4956a', '#9c6d47', '#5e3a22'];
  const CLOTH = { cream: '#f2e6cf', sand: '#e0c48f', terracotta: '#cf6f4a', rust: '#b5523a', indigo: '#3f4f8f', teal: '#2f8f8a', olive: '#8a9a4a', saffron: '#e8a33a', plum: '#8a4d7a', rose: '#e07a8a', sky: '#6aa9d8', white: '#fbf7ee', brown: '#8b5e3c', green: '#4f9a5a', royal: '#5b4bb8', gold: '#e9b949', red: '#c9443c' };
  const HAIR = ['#2b1a12', '#3b2416', '#5a3620', '#1d1412', '#7a4a2a', '#c9c3bb'];

  // ---------- grain overlay (cached) ----------
  let grainCanvas = null;
  function grain(ctx, w, h, alpha = 0.06) {
    if (!grainCanvas) { grainCanvas = document.createElement('canvas'); grainCanvas.width = grainCanvas.height = 160; const g = grainCanvas.getContext('2d'), id = g.createImageData(160, 160), r = rng(7); for (let i = 0; i < id.data.length; i += 4) { const v = 110 + r() * 145; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); }
    ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(grainCanvas, 'repeat'); ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  function vignette(ctx, w, h, strength = 0.35, color = '#2a1430') {
    const g = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.35, w / 2, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, rgba(color, 0)); g.addColorStop(1, rgba(color, strength)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // ---------- sky ----------
  // stops: array of colours top→bottom. sun: {x,y,r,color,glow}
  // The gradient eases between the given stops (extra in-between stops on a smoothstep curve), so colour bands melt into
  // each other the way wet gouache does; a fine noise dither keeps it from banding. Optional faint cirrus streaks are
  // tinted from the sky's own colours, and the sun gets layered bloom with a wide warm band along its horizon.
  function skyPaint(ctx, w, h, stops, sun) {
    const g = ctx.createLinearGradient(0, 0, 0, h), n = stops.length - 1;
    if (n < 1) g.addColorStop(0, stops[0] || '#88aadd');
    else for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const f = k / 3, e = f * f * (3 - 2 * f); g.addColorStop((i + f) / n, mix(stops[i], stops[i + 1], e)); }
    if (n >= 1) g.addColorStop(1, stops[n]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const night = lum(stops[0]) < 70 && lum(stops[Math.min(n, 1)]) < 110;
    // a soft luminous haze in the lower sky, lifting the horizon colour
    const hz = ctx.createLinearGradient(0, h * 0.45, 0, h); hz.addColorStop(0, rgba(stops[n], 0)); hz.addColorStop(0.75, rgba(shade(stops[n], 0.25), night ? 0.08 : 0.16)); hz.addColorStop(1, rgba(shade(stops[n], 0.15), 0.05));
    ctx.fillStyle = hz; ctx.fillRect(0, h * 0.45, w, h * 0.55);
    // faint high cirrus brushed in the upper and middle sky
    const r = rng(hashStr(stops.join('')) % 9973 + 11), streaks = night ? 3 : 5;
    for (let i = 0; i < streaks; i++) {
      const cy = h * (0.08 + r() * 0.4), cx = r() * w, len = 70 + r() * 120, th = 3 + r() * 5, tilt = (r() - 0.5) * 0.12;
      const sc = stops[Math.min(n, Math.floor((cy / h) * (n + 1)))], col = night ? shade(sc, 0.35) : shade(sc, 0.5), a = night ? 0.1 : 0.2 + r() * 0.12;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt); ctx.scale(len / th, 1);
      for (let k = 0; k < 3; k++) { const ox = (k - 1) * th * 0.9 + (r() - 0.5) * th, oy = (r() - 0.5) * th * 0.8, rr = th * (0.6 + r() * 0.6); const sg = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr); sg.addColorStop(0, rgba(col, a)); sg.addColorStop(1, rgba(col, 0)); ctx.fillStyle = sg; ctx.fillRect(ox - rr, oy - rr, rr * 2, rr * 2); }
      ctx.restore();
    }
    if (sun) {
      const G = sun.glow || sun.r * 7, low = clamp((sun.y - h * 0.12) / (h * 0.35));
      const box = R => { const x0 = Math.max(0, sun.x - R), y0 = Math.max(0, sun.y - R); ctx.fillRect(x0, y0, Math.min(w, sun.x + R) - x0, Math.min(h, sun.y + R) - y0); };
      // the glow: a bright core easing into a very wide, soft bloom (one gradient)
      let b = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, G * 1.7);
      b.addColorStop(0, rgba(sun.color, 0.92)); b.addColorStop(0.1, rgba(sun.color, 0.6)); b.addColorStop(0.22, rgba(sun.color, 0.32)); b.addColorStop(0.42, rgba(sun.color, 0.14)); b.addColorStop(0.7, rgba(sun.color, 0.04)); b.addColorStop(1, rgba(sun.color, 0));
      ctx.fillStyle = b; box(G * 1.7);
      // a warm band of light stretched along the horizon line through the sun (stronger when the sun is low)
      if (low > 0) { ctx.save(); ctx.translate(sun.x, sun.y); ctx.scale(3.2, 0.55); b = ctx.createRadialGradient(0, 0, 0, 0, 0, G); b.addColorStop(0, rgba(shade(sun.color, 0.2), 0.32 * low)); b.addColorStop(0.5, rgba(sun.color, 0.1 * low)); b.addColorStop(1, rgba(sun.color, 0)); ctx.fillStyle = b; ctx.fillRect(-G, -G, G * 2, G * 2); ctx.restore(); }
      // a tight halo and the disc
      b =ctx.createRadialGradient(sun.x, sun.y, sun.r * 0.8, sun.x, sun.y, sun.r * 2.4); b.addColorStop(0, rgba('#fffbea', 0.55)); b.addColorStop(1, rgba(sun.color, 0)); ctx.fillStyle = b; ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.r * 2.4, 0, 7); ctx.fill();
      const disc = ctx.createRadialGradient(sun.x - sun.r * 0.2, sun.y - sun.r * 0.25, 0, sun.x, sun.y, sun.r); disc.addColorStop(0, '#fffef8'); disc.addColorStop(0.55, '#fff8e2'); disc.addColorStop(0.86, shade(sun.color, 0.55)); disc.addColorStop(1, rgba(shade(sun.color, 0.4), 0));
      ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.r, 0, 7); ctx.fill();
    }
    dither(ctx, 0, 0, w, h, 0.05);
  }
  let lastSun = null; // the sun of the sky painted just before, so hills in the same scene are lit from its side
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function sky(ctx, w, h, stops, sun) {
    lastSun = { x: sun ? sun.x / w : 0.25, y: sun ? sun.y : h * 0.2, at: now(), night: lum(stops[0]) < 70 };
    cachedPaint(ctx, 'sky' + w + ',' + h + JSON.stringify(stops) + JSON.stringify(sun || 0), 0, 0, w, h, o => skyPaint(o, w, h, stops, sun));
  }
  // a soft glow sprite shared by stars and sparkles
  let glowDot = null;
  function getGlowDot() {
    if (glowDot) return glowDot; glowDot = offscreen(32, 32); const g = glowDot.getContext('2d'), rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    rg.addColorStop(0, 'rgba(255,250,232,1)'); rg.addColorStop(0.18, 'rgba(255,246,220,0.7)'); rg.addColorStop(0.45, 'rgba(255,240,210,0.16)'); rg.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = rg; g.fillRect(0, 0, 32, 32); return glowDot;
  }
  function stars(ctx, w, h, n, seed = 3, t = 0) {
    const r = rng(seed), dot = getGlowDot(), a0 = ctx.globalAlpha; ctx.save();
    const tints = ['#fff8e0', '#fff8e0', '#e8f0ff', '#fff0d8', '#fff8e0'];
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = r() * h, s = r() * 1.6 + 0.3, tw = 0.55 + 0.45 * Math.sin(t * 2 + i), a = tw * (0.5 + r() * 0.5);
      // a soft halo around brighter stars, then a crisp core
      if (s > 1.15) { ctx.globalAlpha = a0 * a * (0.25 + s * 0.22); const hs = s * 7; ctx.drawImage(dot, x - hs, y - hs, hs * 2, hs * 2); }
      ctx.globalAlpha = a0 * a; ctx.fillStyle = tints[i % 5]; ctx.beginPath(); ctx.arc(x, y, s * 0.85, 0, 7); ctx.fill();
      if (s > 1.5) { ctx.globalAlpha = a0 * a * 0.4; ctx.fillRect(x - s * 3.4, y - 0.35, s * 6.8, 0.7); ctx.fillRect(x - 0.35, y - s * 3.4, 0.7, s * 6.8); }
    }
    ctx.restore();
  }
  // A painted cumulus: an irregular cluster of puffs lit from above, with soft feathered edges, a cool shaded underside,
  // a flat-ish base and a warm rim of light along the top. Each distinct cloud is painted once into a sprite (keyed by
  // its colours, a quantised size and the pixel density) and blitted, so drawing clouds every frame costs one drawImage.
  const CLOUD_SHAPES = [
    [[-1.18, 0.12, 0.5], [-0.62, -0.22, 0.68], [0.08, -0.46, 0.84], [0.78, -0.18, 0.66], [1.28, 0.12, 0.46], [-0.25, 0.08, 0.62], [0.5, 0.14, 0.6], [-0.95, 0.3, 0.4], [1.0, 0.3, 0.4], [-0.3, -0.62, 0.42], [0.42, -0.74, 0.38]],
    [[-1.25, 0.16, 0.44], [-0.75, -0.12, 0.62], [-0.15, -0.38, 0.74], [0.5, -0.52, 0.72], [1.08, -0.14, 0.6], [1.45, 0.18, 0.36], [0.0, 0.1, 0.66], [0.75, 0.16, 0.56], [-0.7, 0.28, 0.46], [0.2, -0.82, 0.4]],
    [[-1.3, 0.18, 0.4], [-0.82, -0.08, 0.58], [-0.25, -0.5, 0.8], [0.4, -0.3, 0.72], [0.98, -0.02, 0.56], [1.4, 0.2, 0.38], [-0.4, 0.12, 0.6], [0.4, 0.14, 0.62], [-0.55, -0.82, 0.38], [0.66, -0.62, 0.36]],
  ];
  function paintCloud(o, u, light, dark, shape, seed) {
    const r = rng(seed), P2 = shape.map(([dx, dy, rr]) => [dx * u + (r() - 0.5) * u * 0.08, dy * u + (r() - 0.5) * u * 0.06, rr * u * (0.94 + r() * 0.12)]);
    const baseY = 0.42 * u, bright = lum(light) > 170, cool = mix(dark, '#8496d0', 0.2), rim = mix(shade(light, 0.6), '#fff1d0', bright ? 0.35 : 0.15);
    const silhouette = (grow = 1, dy = 0) => { o.beginPath(); for (const [x, y, rr] of P2) { o.moveTo(x + rr * grow, y + dy); o.arc(x, y + dy, rr * grow, 0, 7); } };
    // 1. feathered outer edge: a slightly larger, half-transparent silhouette in the shadow colour
    o.fillStyle = rgba(dark, 0.35); silhouette(1.06, 0.02 * u); o.fill();
    // 2. the body in the shadow colour, with a cooler tone toward the base
    const bg = o.createLinearGradient(0, -1.2 * u, 0, baseY + 0.4 * u); bg.addColorStop(0, mix(dark, light, 0.35)); bg.addColorStop(0.55, dark); bg.addColorStop(1, cool);
    o.fillStyle = bg; silhouette(1, 0.04 * u); o.fill();
    // 3. lit tops: each puff lit from the upper left, drawn a little higher than its shadow so a shaded crescent shows below
    o.save(); silhouette(1, 0.04 * u); o.clip();
    const order = P2.map((p, i) => i).sort((a, b) => P2[b][1] - P2[a][1]); // back (lower) puffs first, top puffs last
    for (const i of order) {
      const [x, y, rr] = P2[i], lift = rr * 0.16;
      const g = o.createRadialGradient(x - rr * 0.32, y - rr * 0.5, rr * 0.05, x, y - lift * 0.5, rr * 1.02);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, mix('#ffffff', light, 0.6)); g.addColorStop(0.7, light); g.addColorStop(1, rgba(mix(light, dark, 0.55), 0));
      o.fillStyle = g; o.beginPath(); o.arc(x, y - lift, rr * 0.98, 0, 7); o.fill();
    }
    // 4. flat, cool underside: shade everything below the base line
    const ug = o.createLinearGradient(0, baseY - 0.42 * u, 0, baseY + 0.42 * u); ug.addColorStop(0, rgba(cool, 0)); ug.addColorStop(0.6, rgba(cool, 0.55)); ug.addColorStop(1, rgba(shade(cool, -0.08), 0.75));
    o.fillStyle = ug; o.fillRect(-3 * u, baseY - 0.42 * u, 6 * u, 0.9 * u);
    // 5. a few painterly dabs of light inside the lit mass
    for (let i = 0; i < 7; i++) { const [x, y, rr] = P2[Math.floor(r() * P2.length)]; o.fillStyle = rgba('#ffffff', 0.1 + r() * 0.12); o.beginPath(); o.ellipse(x - rr * (0.1 + r() * 0.4), y - rr * (0.3 + r() * 0.4), rr * (0.18 + r() * 0.2), rr * (0.08 + r() * 0.08), -0.3 + r() * 0.3, 0, 7); o.fill(); }
    o.restore();
    // 6. warm rim of light only along the outer upper edge: the silhouette minus itself nudged down and right
    const cw = o.canvas.width, ch = o.canvas.height, tmp = offscreen(cw, ch), q = tmp.getContext('2d'); q.setTransform(o.getTransform());
    const sil = (ctx2, dx, dy) => { ctx2.beginPath(); for (const [x, y, rr] of P2) { ctx2.moveTo(x + dx + rr, y + dy); ctx2.arc(x + dx, y + dy, rr, 0, 7); } };
    q.fillStyle = rgba(rim, bright ? 0.8 : 0.5); sil(q, 0, 0.04 * u); q.fill();
    q.globalCompositeOperation = 'destination-out'; q.fillStyle = '#000'; sil(q, 0.035 * u, 0.04 * u + 0.08 * u); q.fill();
    q.globalCompositeOperation = 'destination-in'; const fade = q.createLinearGradient(0, -1.2 * u, 0, 0.3 * u); fade.addColorStop(0, '#000'); fade.addColorStop(0.7, 'rgba(0,0,0,0.6)'); fade.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = fade; q.fillRect(-3 * u, -2 * u, 6 * u, 3 * u);
    o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.drawImage(tmp, 0, 0); o.restore();
  }
  function cloud(ctx, x, y, s, light = '#fff6ea', dark = '#e7c9d6', alpha = 1) {
    if (!(s > 0) || !(alpha > 0)) return;
    const sq = Math.pow(2, Math.round(Math.log2(s) * 6) / 6), k = clamp(Math.round(pxScale(ctx) * 2) / 2, 1, 3);
    const key = light + dark + sq.toFixed(3) + '@' + k; let spr = SPRITES.get(key);
    if (!spr) {
      const u = 40 * sq * k, sh = hashStr(light + dark), shape = CLOUD_SHAPES[sh % CLOUD_SHAPES.length];
      spr = offscreen(u * 4.2, u * 2.7); const o = spr.getContext('2d'); o.translate(u * 2.1, u * 1.65); paintCloud(o, u, light, dark, shape, sh % 997 + 3);
      spr.ox = 2.1; spr.oy = 1.65; keep(SPRITES, key, spr, 96);
    }
    const u = 40 * s; ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(spr, x - u * spr.ox, y - u * spr.oy, u * 4.2, u * 2.7); ctx.restore();
  }
  // dark rolling storm cloud bank
  function stormBank(ctx, w, y, t = 0, seed = 2) {
    const r = rng(seed); ctx.save();
    for (let row = 0; row < 3; row++) { for (let i = -1; i < 9; i++) { const cx = i * 48 + (r() * 30) + Math.sin(t * 0.3 + i) * 4 + row * 20, cy = y + row * 26 + r() * 12, rr = 34 + r() * 22; const g = ctx.createRadialGradient(cx, cy - rr * 0.5, 2, cx, cy, rr); g.addColorStop(0, row === 2 ? '#6b6a8a' : '#55557a'); g.addColorStop(1, row === 2 ? '#3a3858' : '#2c2a48'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 7); ctx.fill(); } }
    ctx.restore();
  }
  function rain(ctx, w, h, t, n = 90, color = 'rgba(200,215,255,0.45)', slant = -0.25) {
    const r = rng(11); ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < n; i++) { const sp = 500 + r() * 300, x0 = r() * (w + 100), y = ((r() * h + t * sp) % (h + 40)) - 20, x = x0 + y * slant; ctx.moveTo(x, y); ctx.lineTo(x - 14 * slant * -1 - 4, y + 14); }
    ctx.stroke(); ctx.restore();
  }

  // ---------- land ----------
  // A painted ridge: fills from the ridge line down to `bottom`, with a vertical gradient and dab texture.
  function ridgePath(ctx, w, base, amp, freq, seed, bottom) {
    ctx.beginPath(); ctx.moveTo(-10, bottom);
    for (let x = -10; x <= w + 10; x += 6) { const y = base - amp * (noise1(x * freq, seed) * 0.75 + noise1(x * freq * 3.1, seed + 9) * 0.25); ctx.lineTo(x, y); }
    ctx.lineTo(w + 10, bottom); ctx.closePath();
  }
  // A painted ridge. Distant ridges (high on the screen, sparse texture) get atmospheric haze and lower contrast; every
  // ridge gets soft light on the flanks that face the sun, cooler shade on the others and in the dips, drifting cloud
  // shadows, a glow just under the crest and a sunlit rim; near ridges get directional grass strokes.
  function crestY(x, base, amp, freq, seed) { return base - amp * (noise1(x * freq, seed) * 0.75 + noise1(x * freq * 3.1, seed + 9) * 0.25); }
  let mapCanvas = null;
  function hillsPaint(ctx, w, base, amp, top, bottomCol, opts) {
    const { freq = 0.012, seed = 1, bottom = 640, dabs = 80, rim } = opts;
    const dark = lum(top) < 95, sunInfo = lastSun && now() - lastSun.at < 250 ? lastSun : null;
    const L = sunInfo ? clamp((sunInfo.x - 0.5) / 0.3, -1, 1) : -0.6;
    // how far away this ridge reads: high on the screen and lightly textured means far
    const depth = clamp((400 - base) / 170) * (dabs <= 30 ? 1 : dabs <= 60 ? 0.65 : 0.35);
    ctx.save(); ridgePath(ctx, w, base, amp, freq, seed, bottom);
    const yTop = base - amp, yGrad = Math.min(bottom, base + 160);
    const g = ctx.createLinearGradient(0, yTop, 0, yGrad); g.addColorStop(0, top); g.addColorStop(0.45, mix(top, bottomCol, 0.6)); g.addColorStop(1, bottomCol); ctx.fillStyle = g; ctx.fill();
    ctx.clip();
    // 1. light map: computed at a coarse grid and smoothed up, so the light is soft like a wash
    const CELL = 4, x0 = -6, cols = Math.ceil((w + 12) / CELL), yA = Math.floor(yTop - 2), yB = Math.min(bottom, base + 150), rows = Math.max(1, Math.ceil((yB - yA) / CELL));
    if (!mapCanvas) mapCanvas = offscreen(160, 120);
    if (mapCanvas.width < cols || mapCanvas.height < rows) { mapCanvas.width = Math.max(mapCanvas.width, cols); mapCanvas.height = Math.max(mapCanvas.height, rows); }
    const mc = mapCanvas.getContext('2d'); mc.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    const id = mc.createImageData(cols, rows), D = id.data;
    const litC = hex2rgb(dark ? mix(shade(top, 0.35), '#b8c4ff', 0.35) : mix(shade(top, 0.5), '#fff1c4', 0.45));
    const shdC = hex2rgb(dark ? mix(shade(bottomCol, -0.4), '#141434', 0.3) : mix(shade(bottomCol, -0.32), '#4a3c7a', 0.3));
    const strength = (dark ? 0.42 : 0.7) * (1 - 0.5 * depth), fall = 16 + amp * 0.6;
    const crest = new Float32Array(cols), slope = new Float32Array(cols); let cMin = 1e9, cMax = -1e9;
    for (let i = 0; i < cols; i++) { const x = x0 + (i + 0.5) * CELL; crest[i] = crestY(x, base, amp, freq, seed); slope[i] = (crestY(x + 3, base, amp, freq, seed) - crestY(x - 3, base, amp, freq, seed)) / 6; cMin = Math.min(cMin, crest[i]); cMax = Math.max(cMax, crest[i]); }
    const span = Math.max(4, cMax - cMin);
    // depth-below-crest falloffs, tabulated once per whole pixel of depth
    const DMAX = Math.ceil(yB - cMin + CELL + 2), E1 = new Float32Array(DMAX), E2 = new Float32Array(DMAX), E3 = new Float32Array(DMAX);
    for (let d = 0; d < DMAX; d++) { E1[d] = Math.exp(-d / fall); E2[d] = 0.38 * Math.exp(-d / 7); E3[d] = 0.32 * Math.exp(-d / (fall * 1.6)); }
    // the drifting cloud-shadow noise varies slowly, so sample it on a coarser grid and interpolate
    const NS = 4, ncols = Math.ceil(cols / NS) + 2, nrows = Math.ceil(rows / NS) + 2, NZ = new Float32Array(ncols * nrows);
    for (let a = 0; a < ncols; a++) for (let b2 = 0; b2 < nrows; b2++) NZ[a + b2 * ncols] = noise1((x0 + a * NS * CELL) * 0.018 + (yA + b2 * NS * CELL) * 0.011, seed + 5) - 0.5;
    for (let i = 0; i < cols; i++) {
      const face = clamp(slope[i] * L * 3.2, -1, 1), dip = (crest[i] - cMin) / span, ia = i / NS, a0 = ia | 0, fa = ia - a0;
      for (let j = 0; j < rows; j++) {
        const y = yA + (j + 0.5) * CELL, d = y - crest[i]; if (d < -CELL) continue;
        const di = Math.min(DMAX - 1, Math.max(0, d) | 0);
        const jb = j / NS, b0 = jb | 0, fb = jb - b0, n00 = NZ[a0 + b0 * ncols], n10 = NZ[a0 + 1 + b0 * ncols], n01 = NZ[a0 + (b0 + 1) * ncols], n11 = NZ[a0 + 1 + (b0 + 1) * ncols];
        const nz = (n00 * (1 - fa) + n10 * fa) * (1 - fb) + (n01 * (1 - fa) + n11 * fa) * fb;
        let v = face * 0.75 * E1[di] + E2[di] - dip * E3[di] + nz * 0.5 * (0.4 + 0.6 * Math.min(1, di / 40));
        v *= strength; const c = v >= 0 ? litC : shdC, k = (i + j * cols) * 4;
        D[k] = c[0]; D[k + 1] = c[1]; D[k + 2] = c[2]; D[k + 3] = Math.min(255, Math.abs(v) * 255);
      }
    }
    mc.putImageData(id, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(mapCanvas, 0, 0, cols, rows, x0, yA, cols * CELL, rows * CELL);
    // 2. brush texture: soft horizontal dabs everywhere, directional grass strokes on near ridges
    const r = rng(seed * 31), yLo = yTop, yHi = bottom;
    const dabCount = Math.round(dabs * (depth > 0.5 ? 0.8 : 0.6));
    const dabL = shade(top, 0.2), dabD = shade(bottomCol, -0.14), dabK = 1 - 0.4 * depth;
    ctx.save();
    for (let i = 0; i < dabCount; i++) { const x = r() * w, cy = crestY(x, base, amp, freq, seed), y = cy + 3 + r() * Math.max(4, yHi - cy); const lit = r() < 0.5; ctx.fillStyle = lit ? dabL : dabD; ctx.globalAlpha = (0.08 + r() * 0.08) * dabK; ctx.beginPath(); ctx.ellipse(x, y, 7 + r() * 16, 2 + r() * 3.5, -0.12 + r() * 0.24, 0, 7); ctx.fill(); }
    ctx.restore();
    const [hr, hgc, hb] = hex2rgb(top), green = hgc >= hr * 0.92 && hgc > hb * 1.05;
    if (depth < 0.45 && dabs >= 30 && !green) {
      // sand and earth: wind ripples, a light lip over a darker trough
      const n = Math.min(140, Math.round(dabs * 0.8)), lt = rgba(mix(shade(top, 0.35), '#fff4d8', 0.3), 0.32), dk = rgba(shade(bottomCol, -0.2), 0.2);
      const rip = []; for (let i = 0; i < n; i++) { const x = r() * w, cy = crestY(x, base, amp, freq, seed), q = r(), y = cy + 8 + q * Math.max(6, yHi - cy - 8), len = 8 + r() * 16 + clamp((y - yLo) / 200) * 10; rip.push([x, y, len, (r() - 0.5) * 0.12]); }
      ctx.lineCap = 'round'; ctx.lineWidth = 1.2;
      for (const [col2, dy] of [[dk, 1.2], [lt, 0]]) { ctx.strokeStyle = col2; ctx.beginPath(); for (const [x, y, len, tl] of rip) { ctx.moveTo(x - len / 2, y + dy + tl * len); ctx.quadraticCurveTo(x, y + dy - 2.2, x + len / 2, y + dy - tl * len); } ctx.stroke(); }
    }
    if (depth < 0.45 && dabs >= 30 && green) {
      const n = Math.min(320, Math.round(dabs * 1.7)), buckets = [[], [], [], []];
      for (let i = 0; i < n; i++) { const x = r() * w, cy = crestY(x, base, amp, freq, seed), q = r(), y = cy + 5 + q * q * Math.max(6, yHi - cy - 5), near = clamp((y - yLo) / 200), len = 3 + near * 6 + r() * 3, lean = (r() - 0.5) * 0.6 + L * 0.15; buckets[Math.floor(r() * 4)].push([x, y, len, lean]); }
      const cols4 = [rgba(mix(shade(top, 0.3), '#fff4c0', 0.35), 0.4), rgba(shade(top, 0.14), 0.38), rgba(shade(bottomCol, -0.18), 0.32), rgba(mix(shade(bottomCol, -0.3), '#4a3c7a', 0.2), 0.26)];
      ctx.lineCap = 'round';
      buckets.forEach((b, bi) => { ctx.strokeStyle = cols4[bi]; ctx.lineWidth = bi < 2 ? 1.3 : 1.5; ctx.beginPath(); for (const [x, y, len, lean] of b) { ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * len * 0.3, y - len * 0.6, x + lean * len, y - len); } ctx.stroke(); });
    }
    // 3. atmospheric haze: far ridges fade toward a pale, cool version of their own colour, densest in the mist at their foot
    if (depth > 0.02) {
      const haze = dark ? mix(shade(top, 0.22), '#8a90d0', 0.3) : mix(shade(top, 0.5), '#e8ecff', 0.35);
      const hg = ctx.createLinearGradient(0, yTop, 0, base + 30); hg.addColorStop(0, rgba(haze, 0.08 * depth)); hg.addColorStop(0.6, rgba(haze, 0.18 * depth)); hg.addColorStop(1, rgba(haze, 0.32 * depth));
      ctx.fillStyle = hg; ctx.fillRect(-10, yTop - 2, w + 20, bottom - yTop + 4);
    }
    // 4. sunlit rim along the crest: a soft glow and a crisp edge just inside the silhouette
    const rimC = rim || (dark ? shade(top, 0.3) : mix(shade(top, 0.45), '#fff4d0', 0.3)), rimA = rim ? 1 : 0.5;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = rgba(rimC, 0.2 * rimA); ctx.lineWidth = 7; ridgePath(ctx, w, base + 3, amp, freq, seed, bottom + 400); ctx.stroke();
    ctx.strokeStyle = rgba(rimC, 0.62 * rimA); ctx.lineWidth = 2.2; ridgePath(ctx, w, base + 1.2, amp, freq, seed, bottom + 400); ctx.stroke();
    ctx.restore();
  }
  function hills(ctx, w, base, amp, top, bottomCol, opts = {}) {
    const y0 = Math.floor(base - amp - 8), y1 = Math.ceil(opts.bottom ?? 640);
    cachedPaint(ctx, 'hills' + [w, base, amp, top, bottomCol, JSON.stringify(opts)].join('|'), 0, y0, w, Math.max(1, y1 - y0), o => hillsPaint(o, w, base, amp, top, bottomCol, opts));
  }
  // golden god-rays from a point
  // Soft, cinematic light shafts with screen blending: each shaft is a wide, faint wedge with a narrower, brighter core
  // inside it, so its edges feather instead of ending in a hard line. Widths and lengths vary irregularly, and each shaft
  // slowly breathes. Colour strings are cached per colour so per-frame calls build no strings.
  const RAY_STOPS = new Map();
  function rayStops(color) { let s = RAY_STOPS.get(color); if (!s) { s = [rgba(color, 1), rgba(color, 0.45), rgba(color, 0)]; RAY_STOPS.set(color, s); if (RAY_STOPS.size > 64) RAY_STOPS.delete(RAY_STOPS.keys().next().value); } return s; }
  function rays(ctx, x, y, w, h, color = '#fff2c4', alpha = 0.18, n = 9, t = 0) {
    if (!(alpha > 0)) return;
    const [c1, c2, c0] = rayStops(color), r = rng(n * 7 + 3), a0 = ctx.globalAlpha; ctx.save(); ctx.globalCompositeOperation = 'screen';
    const reach = Math.hypot(Math.max(x, w - x), Math.max(y, Math.max(h, 640) - y));
    for (let i = 0; i < n; i++) {
      const jitter = (r() - 0.5) * 0.06, a = Math.PI * 0.15 + (i / Math.max(1, n - 1)) * Math.PI * 0.7 + jitter + Math.sin(t * 0.4 + i) * 0.02;
      const len = Math.min(reach, h * (1.15 + r() * 0.4)), spread = 0.03 + (i % 3) * 0.014 + r() * 0.02, breathe = 0.75 + 0.25 * Math.sin(t * 0.7 + i * 1.9);
      const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, g = ctx.createLinearGradient(x, y, ex, ey); g.addColorStop(0, c1); g.addColorStop(0.4, c2); g.addColorStop(1, c0); ctx.fillStyle = g;
      // alternate broad, faint shafts with narrow, brighter ones: together they read as soft light rather than spokes
      const sp = i % 2 ? spread * 0.8 : spread * 1.5, k = i % 2 ? 1.35 : 0.85;
      ctx.globalAlpha = a0 * clamp(alpha * k * breathe, 0, 1);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - sp) * len, y + Math.sin(a - sp) * len); ctx.lineTo(x + Math.cos(a + sp) * len, y + Math.sin(a + sp) * len); ctx.closePath(); ctx.fill();
    }
    // a soft glow where the shafts gather
    const gr = Math.min(w, h) * 0.24; ctx.globalAlpha = a0 * clamp(alpha * 1.1, 0, 1); ctx.drawImage(getGlowDot(), x - gr, y - gr, gr * 2, gr * 2);
    ctx.restore();
  }
  // water band with layered waves and sparkles
  // Water: a lighter band at the far edge deepening toward the viewer, waves that widen and space out with distance
  // (light crests over darker troughs, broken like brush strokes), and twinkling glints that crowd near the far edge.
  // Transparent colours (an overlay of sparkle and ripples only) are supported.
  const isHex = c => typeof c === 'string' && c[0] === '#';
  function water(ctx, w, top, bottom, deep = '#1f5f7a', shallow = '#58b4c4', t = 0, opts = {}) {
    const { sparkle = '#fff6d8', waves = 6 } = opts, H2 = bottom - top; if (!(H2 > 0)) return;
    const solid = isHex(deep) && isHex(shallow), crestC = solid ? shade(shallow, 0.42) : '#ffffff', troughC = solid ? shade(deep, -0.25) : '#1a3a5a';
    const a0 = ctx.globalAlpha;
    if (solid) {
      // the still body of water (gradient and pale far band) is painted once per size and colour, then blitted
      cachedPaint(ctx, 'water' + [w, top, bottom, deep, shallow].join('|'), 0, top, w, H2, o => {
        const g = o.createLinearGradient(0, top, 0, bottom); g.addColorStop(0, mix(shallow, '#ffffff', 0.3)); g.addColorStop(Math.min(0.5, 6 / H2), shallow); g.addColorStop(0.45, mix(shallow, deep, 0.55)); g.addColorStop(1, deep);
        o.fillStyle = g; o.fillRect(0, top, w, H2);
        const hh = Math.min(26, H2 * 0.3), hb = o.createLinearGradient(0, top, 0, top + hh); hb.addColorStop(0, 'rgba(255,255,255,0.35)'); hb.addColorStop(1, 'rgba(255,255,255,0)'); o.fillStyle = hb; o.fillRect(0, top, w, hh);
      });
    } else { ctx.fillStyle = deep; ctx.fillRect(0, top, w, H2); }
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, w, H2); ctx.clip();
    ctx.lineCap = 'round';
    for (let k = 0; k < waves; k++) {
      const q = (k + 0.5) / waves, y = top + H2 * Math.pow(q, 1.3), near = Math.pow(q, 1.3), a = 1.2 + near * 3.2, fr = 0.07 - near * 0.035, sp = t * (1.1 + k * 0.12) + k * 2.3, step = 7 + near * 3;
      const path = (dy) => { ctx.beginPath(); let on = false; for (let x = -10; x <= w + 10; x += step) { const vis = Math.sin(x * 0.011 + k * 2.7 + t * 0.15) > -0.35, yy = y + dy + Math.sin(x * fr + sp) * a; if (vis) { on ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); on = true; } else on = false; } };
      ctx.strokeStyle = troughC; ctx.globalAlpha = a0 * (solid ? 0.14 + near * 0.1 : 0.12); ctx.lineWidth = 1.6 + near * 2.2; path(1.4 + near * 2); ctx.stroke();
      ctx.strokeStyle = crestC; ctx.globalAlpha = a0 * (solid ? 0.42 - near * 0.12 : 0.35); ctx.lineWidth = 1 + near * 1.4; path(0); ctx.stroke();
    }
    const r = rng(5), n = Math.min(70, 30 + Math.round(H2 / 6)); ctx.fillStyle = sparkle;
    for (let i = 0; i < n; i++) {
      const q = r(), x = ((r() * w + t * 8 * (r() - 0.5)) % w + w) % w, y = top + q * q * H2 * 0.8, s = Math.sin(t * 3 + i * 1.7);
      if (s > 0.45) { const k = (s - 0.45) / 0.55, len = 3 + (1 - q) * 5 + q * 3; ctx.globalAlpha = a0 * Math.min(1, k * 1.4); ctx.fillRect(x - len, y, len * 2, 1.1 + q * 0.6); if (k > 0.8) { ctx.fillRect(x - 0.5, y - 2.5, 1, 6); } }
    }
    ctx.restore();
  }

  // ---------- plants and props ----------
  // Date palm: a tapered, ringed trunk lit from the left, a crown of feathery fronds in two value layers (darker
  // fronds behind, lit fronds in front) each with a midrib and leaflets, dates under the crown and a soft contact shadow.
  function palm(ctx, x, y, s = 1, lean = 0.15, t = 0, col = '#3f8a4a') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = rgba('#2a1830', 0.16); ctx.beginPath(); ctx.ellipse(lean * 20, 1, 15, 3.6, 0, 0, 7); ctx.fill();
    // trunk: a tapered curved body, then curved bark rings
    const cx1 = lean * 60, cy1 = -60, ex = lean * 120, ey = -120, P0 = tt => [2 * (1 - tt) * tt * cx1 + tt * tt * ex, 2 * (1 - tt) * tt * cy1 + tt * tt * ey];
    const N = 12, Ls = [], Rs = []; for (let i = 0; i <= N; i++) { const tt = i / N, [px, py] = P0(tt), wd = 5.6 - tt * 2.2; Ls.push([px - wd, py]); Rs.push([px + wd, py]); }
    ctx.save(); ctx.fillStyle = '#7a5434'; ctx.beginPath(); ctx.moveTo(...Ls[0]); for (const p of Ls) ctx.lineTo(...p); for (let i = Rs.length - 1; i >= 0; i--) ctx.lineTo(...Rs[i]); ctx.closePath(); ctx.fill();
    ctx.clip(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(70,40,24,0.55)'; ctx.lineWidth = 4.5; ctx.beginPath(); Rs.forEach((p, i) => i ? ctx.lineTo(p[0] - 0.5, p[1]) : ctx.moveTo(p[0] - 0.5, p[1])); ctx.stroke();
    ctx.strokeStyle = 'rgba(196,150,98,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); Ls.forEach((p, i) => i ? ctx.lineTo(p[0] + 2, p[1]) : ctx.moveTo(p[0] + 2, p[1])); ctx.stroke();
    ctx.strokeStyle = '#5a3a24'; ctx.lineWidth = 1.3; ctx.beginPath(); for (let i = 1; i < 11; i++) { const tt = i / 11, [px, py] = P0(tt), wd = 5.6 - tt * 2.2; ctx.moveTo(px - wd, py + 1); ctx.quadraticCurveTo(px, py + 3.2, px + wd, py); } ctx.stroke();
    ctx.strokeStyle = 'rgba(255,226,170,0.45)'; ctx.lineWidth = 1; ctx.beginPath(); for (let i = 1; i < 11; i++) { const tt = i / 11, [px, py] = P0(tt), wd = 5.6 - tt * 2.2; ctx.moveTo(px - wd + 0.5, py - 0.6); ctx.quadraticCurveTo(px - wd * 0.4, py + 1, px, py + 1.2); } ctx.stroke();
    ctx.restore();
    const tx = ex, ty = ey, sway = Math.sin(t * 1.3) * 0.05, deepC = shade(col, -0.38), litC = mix(shade(col, 0.32), '#f4f0a0', 0.12);
    const frond = (a, len, base, tip, rib, droop, leaflets) => {
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, base); g.addColorStop(1, tip); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -14 - droop, len, 10); ctx.quadraticCurveTo(len * 0.5, 4 - droop * 0.3, 0, 0); ctx.fill();
      // leaflets: short strokes from the midrib toward the edges, slanting to the tip
      if (leaflets) { ctx.strokeStyle = rgba(rib, 0.55); ctx.lineWidth = 0.9; ctx.beginPath(); for (let k = 2; k < 11; k++) { const u = k / 11, mx = len * u, my = 2 * (1 - u) * u * (-6 - droop * 0.6) + u * u * 10, half = (1 - u) * 9 + 2; ctx.moveTo(mx, my); ctx.lineTo(mx + 4, my - half * 0.9); ctx.moveTo(mx, my); ctx.lineTo(mx + 3.5, my + half * 0.55); } ctx.stroke(); }
      ctx.strokeStyle = rib; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -6 - droop * 0.6, len, 10); ctx.stroke(); ctx.restore();
    };
    // back fronds, in shadow
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.62 + 0.2 + sway * 0.7; frond(a, 44 + (i % 2) * 6, shade(col, -0.45), shade(col, -0.18), shade(col, -0.55), 0, false); }
    // front fronds, lit from the upper left
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.42 + sway, len = 52 + (i % 2) * 10, lit = clamp(0.5 - Math.cos(a) * 0.35 - Math.sin(a) * 0.3);
      frond(a, len, mix(deepC, shade(col, -0.2), lit), mix(shade(col, 0.05), litC, lit), shade(col, -0.45), (i % 3) * 2, true); }
    // dates hanging under the crown
    for (let i = 0; i < 4; i++) { const dx = tx - 6 + i * 4, dy = ty + 5 + (i % 2) * 2.5; const dg = ctx.createRadialGradient(dx - 1.2, dy - 1.4, 0.3, dx, dy, 3.6); dg.addColorStop(0, '#c8783a'); dg.addColorStop(1, '#5a3018'); ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dx, dy, 3.4, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // Round olive / fig tree: a lit trunk with branches into the crown, leafy clusters in three values (deep interior,
  // mid body, sunlit tops with small highlight clumps on the light side), shade gathering low in the crown, and a soft
  // contact shadow. The cluster layout is the same as before for a given seed.
  function tree(ctx, x, y, s = 1, col = '#5f8f4a', seed = 4) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sh = ctx.createRadialGradient(4, 1, 2, 4, 1, 36); sh.addColorStop(0, rgba('#2a1830', 0.22)); sh.addColorStop(1, rgba('#2a1830', 0)); ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(4, 1, 36, 7, 0, 0, 7); ctx.fill();
    const tg = ctx.createLinearGradient(-9, 0, 9, 0); tg.addColorStop(0, '#94693f'); tg.addColorStop(0.5, '#6e4a2e'); tg.addColorStop(1, '#4e3220');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(-3, -30, -10, -55); ctx.lineTo(10, -55); ctx.quadraticCurveTo(3, -30, 7, 0); ctx.quadraticCurveTo(0, 2, -7, 0); ctx.fill();
    ctx.strokeStyle = '#5e3e26'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-3, -40); ctx.quadraticCurveTo(-14, -52, -22, -60); ctx.moveTo(3, -44); ctx.quadraticCurveTo(14, -54, 20, -66); ctx.stroke();
    const r = rng(seed); const blobs = [];
    for (let i = 0; i < 14; i++) blobs.push([(r() - 0.5) * 70, -70 + (r() - 0.5) * 40, 16 + r() * 14]);
    const deep = shade(col, -0.34), mid = col, lit = mix(shade(col, 0.34), '#f6f0b0', 0.15), r2 = rng(seed * 13 + 7);
    // deep interior / shadow mass
    ctx.fillStyle = deep; ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx + 3 + br, by + 4); ctx.arc(bx + 3, by + 4, br, 0, 7); } ctx.fill();
    // body clusters, lower ones first so the sunlit upper clusters sit on top
    const order = blobs.slice().sort((a, b) => b[1] - a[1]);
    for (const [bx, by, br] of order) {
      const g = ctx.createRadialGradient(bx - br * 0.42, by - br * 0.52, 1, bx, by, br);
      g.addColorStop(0, lit); g.addColorStop(0.5, mix(mid, lit, 0.25)); g.addColorStop(0.85, mid); g.addColorStop(1, shade(mid, -0.12));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br * 0.9, 0, 7); ctx.fill();
      // a scalloped leafy lower edge in shade
      ctx.strokeStyle = rgba(deep, 0.35); ctx.lineWidth = 1.4; ctx.beginPath(); for (let k = 0; k < 3; k++) { const a = 0.35 * Math.PI + k * 0.28 * Math.PI, rr = br * 0.86; ctx.moveTo(bx + Math.cos(a - 0.2) * rr, by + Math.sin(a - 0.2) * rr); ctx.quadraticCurveTo(bx + Math.cos(a) * rr * 1.06, by + Math.sin(a) * rr * 1.06, bx + Math.cos(a + 0.2) * rr, by + Math.sin(a + 0.2) * rr); } ctx.stroke();
    }
    // shade gathering low in the crown
    ctx.save(); ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx + br * 0.9, by); ctx.arc(bx, by, br * 0.9, 0, 7); } ctx.clip();
    const ao = ctx.createLinearGradient(0, -95, 0, -40); ao.addColorStop(0, rgba(deep, 0)); ao.addColorStop(0.6, rgba(deep, 0.12)); ao.addColorStop(1, rgba(shade(deep, -0.2), 0.42)); ctx.fillStyle = ao; ctx.fillRect(-60, -110, 120, 75);
    // sunlit leaf clumps on the upper-left of the top clusters
    ctx.fillStyle = rgba(shade(lit, 0.25), 0.55);
    for (const [bx, by, br] of order.slice(-7)) for (let k = 0; k < 3; k++) { const a = Math.PI * (1.05 + r2() * 0.45), d = br * (0.35 + r2() * 0.35); ctx.beginPath(); ctx.ellipse(bx + Math.cos(a) * d, by + Math.sin(a) * d, 2.4 + r2() * 2.6, 1.8 + r2() * 1.6, -0.5, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.restore();
  }
  // Grass tufts: tapered blades fanning from a shaded base, the outer blade catching light.
  function grassTufts(ctx, w, y0, y1, n, col = '#6aa34f', seed = 8) {
    const r = rng(seed), lite = shade(col, 0.28), dk = shade(col, -0.22); ctx.save();
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = y0 + r() * (y1 - y0), h = 6 + r() * 10, c = r() < 0.5 ? shade(col, 0.2) : shade(col, -0.15), near = clamp((y - y0) / Math.max(1, y1 - y0)), hh = h * (0.85 + near * 0.35);
      ctx.fillStyle = rgba(dk, 0.22); ctx.beginPath(); ctx.ellipse(x, y + 0.5, 5.5, 1.6, 0, 0, 7); ctx.fill();
      for (let k = -2; k <= 2; k++) { if ((k === -2 || k === 2) && (i % 2)) continue; const tipx = x + k * 2.6 + (k ? 0 : 0.5), tipy = y - hh * (1 - Math.abs(k) * 0.14), bw = 1.1;
        ctx.fillStyle = k === -1 ? lite : k === 2 ? dk : c; ctx.beginPath(); ctx.moveTo(x - bw + k * 0.6, y); ctx.quadraticCurveTo(x + k * 1.4, y - hh * 0.55, tipx, tipy); ctx.quadraticCurveTo(x + k * 1.4 + bw, y - hh * 0.5, x + bw + k * 0.6, y); ctx.fill(); }
    }
    ctx.restore();
  }
  // Little wildflowers: a soft shadow, five petals with a lit edge, a deeper eye and a pollen dot.
  function flowers(ctx, w, y0, y1, n, cols = ['#f4d35e', '#ee6c8a', '#ffffff', '#b98ae0'], seed = 9) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = y0 + r() * (y1 - y0), c = cols[Math.floor(r() * cols.length)], s = 1.5 + r() * 1.8, rot = r() * 1.2;
      ctx.fillStyle = 'rgba(40,40,30,0.16)'; ctx.beginPath(); ctx.ellipse(x + 0.6, y + s * 1.2, s * 1.6, s * 0.55, 0, 0, 7); ctx.fill();
      ctx.fillStyle = isHex(c) ? shade(c, -0.12) : c; for (let k = 0; k < 5; k++) { const a = rot + k * 1.2566; ctx.beginPath(); ctx.arc(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.8, 0, 7); ctx.fill(); }
      ctx.fillStyle = c; for (let k = 0; k < 5; k++) { const a = rot + k * 1.2566; ctx.beginPath(); ctx.arc(x + Math.cos(a) * s - s * 0.12, y + Math.sin(a) * s - s * 0.15, s * 0.62, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#d98a1e'; ctx.beginPath(); ctx.arc(x, y, s * 0.62, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd25a'; ctx.beginPath(); ctx.arc(x - s * 0.15, y - s * 0.18, s * 0.36, 0, 7); ctx.fill();
    }
  }
  // A weathered rock with planes: a sunlit top facet, a shaded flank, a crack, speckles and a soft contact shadow.
  function rock(ctx, x, y, s = 1, col = '#b89a7a') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const cs = ctx.createRadialGradient(3, 1, 2, 3, 1, 30); cs.addColorStop(0, rgba('#2a1830', 0.3)); cs.addColorStop(1, rgba('#2a1830', 0)); ctx.fillStyle = cs; ctx.beginPath(); ctx.ellipse(3, 1, 30, 7, 0, 0, 7); ctx.fill();
    const outline = () => { ctx.beginPath(); ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-26, -18, -10, -26); ctx.quadraticCurveTo(6, -32, 18, -20); ctx.quadraticCurveTo(28, -8, 24, 0); ctx.closePath(); };
    const g = ctx.createLinearGradient(-20, -30, 20, 0); g.addColorStop(0, shade(col, 0.22)); g.addColorStop(1, shade(col, -0.2)); ctx.fillStyle = g; outline(); ctx.fill();
    ctx.save(); outline(); ctx.clip();
    // lit top plane
    const tp = ctx.createLinearGradient(-14, -30, 6, -12); tp.addColorStop(0, mix(shade(col, 0.45), '#fff4dc', 0.25)); tp.addColorStop(1, shade(col, 0.18)); ctx.fillStyle = tp;
    ctx.beginPath(); ctx.moveTo(-26, -12); ctx.quadraticCurveTo(-20, -26, -6, -29); ctx.quadraticCurveTo(10, -31, 20, -19); ctx.lineTo(8, -14); ctx.quadraticCurveTo(-8, -10, -26, -12); ctx.fill();
    // shaded right flank
    ctx.fillStyle = rgba(mix(shade(col, -0.4), '#3a2c5a', 0.25), 0.5); ctx.beginPath(); ctx.moveTo(8, -14); ctx.lineTo(22, -21); ctx.lineTo(30, 2); ctx.lineTo(10, 2); ctx.quadraticCurveTo(12, -6, 8, -14); ctx.fill();
    // ground occlusion
    const ao = ctx.createLinearGradient(0, -8, 0, 1); ao.addColorStop(0, rgba(shade(col, -0.5), 0)); ao.addColorStop(1, rgba(shade(col, -0.5), 0.35)); ctx.fillStyle = ao; ctx.fillRect(-28, -8, 60, 10);
    // crack and speckles
    ctx.strokeStyle = rgba(shade(col, -0.45), 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, -27); ctx.lineTo(-3, -19); ctx.lineTo(-7, -11); ctx.moveTo(-3, -19); ctx.lineTo(2, -16); ctx.stroke();
    const rr = rng(Math.round(Math.abs(x * 13 + y * 7)) + 5); for (let i = 0; i < 9; i++) { ctx.fillStyle = rgba(rr() < 0.5 ? shade(col, -0.35) : shade(col, 0.45), 0.45); ctx.beginPath(); ctx.arc(-20 + rr() * 40, -24 + rr() * 22, 0.7 + rr() * 0.8, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = shade(col, -0.42); ctx.lineWidth = 1.5; outline(); ctx.stroke();
    ctx.strokeStyle = rgba('#fffaf0', 0.5); ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-22, -12); ctx.quadraticCurveTo(-21, -22, -10, -25.5); ctx.quadraticCurveTo(0, -29, 8, -27); ctx.stroke();
    ctx.restore();
  }
  // Mudbrick house with a flat roof: walls lit from the upper left with a shaded right edge, soft plaster patches,
  // the roof lip casting a shadow, a recessed door, and a window with a warm lamp glow.
  function house(ctx, x, y, w, h, col = '#e6c79a', opts = {}) {
    const { door = '#7a4b2e', window = true, awning } = opts;
    ctx.save(); ctx.translate(x, y);
    const big = w >= 22 && h >= 16;
    ctx.fillStyle = rgba('#2a1830', 0.16); ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(w + 2, 0); ctx.lineTo(w + 9, 4); ctx.lineTo(4, 4); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(0, -h, w, 0); g.addColorStop(0, shade(col, 0.2)); g.addColorStop(0.6, col); g.addColorStop(1, shade(col, -0.14)); ctx.fillStyle = g; ctx.fillRect(0, -h, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(0, -h, w, h); ctx.clip();
    if (big) { const r = rng(Math.round(w * 31 + h * 17 + x * 3) + 1); for (let i = 0; i < Math.min(10, Math.round(w * h / 300) + 2); i++) { ctx.fillStyle = rgba(r() < 0.5 ? shade(col, 0.25) : shade(col, -0.12), 0.35); ctx.beginPath(); ctx.ellipse(r() * w, -r() * h, 3 + r() * 6, 1.5 + r() * 2.5, 0, 0, 7); ctx.fill(); } }
    // shaded right edge and a soft shadow cast by the roof lip
    const se = ctx.createLinearGradient(w * 0.75, 0, w, 0); se.addColorStop(0, rgba(shade(col, -0.4), 0)); se.addColorStop(1, rgba(mix(shade(col, -0.4), '#4a3a7a', 0.2), 0.3)); ctx.fillStyle = se; ctx.fillRect(w * 0.75, -h, w * 0.25, h);
    const rs = ctx.createLinearGradient(0, -h, 0, -h + Math.min(10, h * 0.35)); rs.addColorStop(0, rgba(shade(col, -0.5), 0.35)); rs.addColorStop(1, rgba(shade(col, -0.5), 0)); ctx.fillStyle = rs; ctx.fillRect(0, -h, w, Math.min(10, h * 0.35));
    const gb = ctx.createLinearGradient(0, -6, 0, 0); gb.addColorStop(0, rgba(shade(col, -0.4), 0)); gb.addColorStop(1, rgba(shade(col, -0.4), 0.25)); ctx.fillStyle = gb; ctx.fillRect(0, -6, w, 6);
    ctx.restore();
    // roof lip with a lit top edge and protruding beam ends
    const rg = ctx.createLinearGradient(0, -h - 6, 0, -h + 1); rg.addColorStop(0, shade(col, 0.05)); rg.addColorStop(1, shade(col, -0.26)); ctx.fillStyle = rg; ctx.fillRect(-3, -h - 6, w + 6, 7);
    ctx.fillStyle = shade(col, 0.34); ctx.fillRect(-3, -h - 6, w + 6, 2);
    if (big) { ctx.fillStyle = '#7a5434'; for (let bx = 5; bx < w - 3; bx += Math.max(9, w / 5)) ctx.fillRect(bx, -h + 1, 3, 2.5); }
    // door: dark recess with a lit sill
    const dw = Math.min(16, w * 0.3); ctx.fillStyle = door; ctx.beginPath(); ctx.moveTo(w * 0.5 - dw / 2, 0); ctx.lineTo(w * 0.5 - dw / 2, -h * 0.42); ctx.arc(w * 0.5, -h * 0.42, dw / 2, Math.PI, 0); ctx.lineTo(w * 0.5 + dw / 2, 0); ctx.fill();
    if (big) { ctx.fillStyle = rgba(shade(door, -0.5), 0.45); ctx.beginPath(); ctx.moveTo(w * 0.5 - dw / 2, 0); ctx.lineTo(w * 0.5 - dw / 2, -h * 0.42); ctx.arc(w * 0.5, -h * 0.42, dw / 2, Math.PI, Math.PI * 1.5); ctx.lineTo(w * 0.5 - dw / 2 + 2.2, -h * 0.42 - dw / 2 + 2); ctx.lineTo(w * 0.5 - dw / 2 + 2.2, 0); ctx.fill(); ctx.fillStyle = rgba('#fff4dc', 0.5); ctx.fillRect(w * 0.5 - dw / 2 - 1, -1.2, dw + 2, 1.4); }
    if (window) {
      const wx = w * 0.14, wy = -h * 0.75;
      const wg = ctx.createRadialGradient(wx + 4.5, wy + 4.5, 1, wx + 4.5, wy + 4.5, 13); wg.addColorStop(0, 'rgba(255,214,130,0.4)'); wg.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = wg; ctx.fillRect(wx - 9, wy - 9, 27, 27);
      ctx.fillStyle = '#4a2e22'; ctx.fillRect(wx, wy, 9, 9);
      const lg = ctx.createRadialGradient(wx + 3.5, wy + 3.5, 0.5, wx + 4.5, wy + 4.5, 5); lg.addColorStop(0, '#fff2c0'); lg.addColorStop(1, '#f2b65a'); ctx.fillStyle = lg; ctx.fillRect(wx + 1.5, wy + 1.5, 6, 6);
      ctx.fillStyle = rgba('#4a2e22', 0.7); ctx.fillRect(wx + 4, wy + 1.5, 1, 6); ctx.fillStyle = rgba(shade(col, 0.4), 0.8); ctx.fillRect(wx - 1, wy + 9, 11, 1.4);
    }
    if (awning) { ctx.fillStyle = rgba('#2a1830', 0.15); ctx.beginPath(); ctx.moveTo(w * 0.62 + 4, -h * 0.4); ctx.lineTo(w, -h * 0.4); ctx.lineTo(w, -h * 0.32); ctx.lineTo(w * 0.62 + 6, -h * 0.32); ctx.fill();
      ctx.fillStyle = awning; ctx.beginPath(); ctx.moveTo(w * 0.62, -h * 0.55); ctx.lineTo(w + 8, -h * 0.55); ctx.lineTo(w + 4, -h * 0.4); ctx.lineTo(w * 0.62 + 4, -h * 0.4); ctx.fill(); ctx.fillStyle = rgba('#ffffff', 0.35); for (let i = 0; i < 4; i++) ctx.fillRect(w * 0.62 + 2 + i * ((w * 0.38 + 6) / 4), -h * 0.55, (w * 0.38 + 6) / 8, 15);
      ctx.fillStyle = rgba(shade(awning, -0.4), 0.5); ctx.fillRect(w * 0.62 + 4, -h * 0.4 - 1.5, w * 0.38, 1.5); }
    ctx.restore();
  }
  function basket(ctx, x, y, s = 1, contents = 'bread') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (contents === 'bread') { for (let i = 0; i < 3; i++) { const bx = -10 + i * 10, by = -10 - (i === 1 ? 5 : 0); const g = ctx.createRadialGradient(bx - 3, by - 3, 1, bx, by, 9); g.addColorStop(0, '#f5c77a'); g.addColorStop(1, '#b8732f'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(bx, by, 9, 6.5, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#8a4f1f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx - 3, by - 4); ctx.lineTo(bx - 1, by + 2); ctx.moveTo(bx + 2, by - 4); ctx.lineTo(bx + 4, by + 2); ctx.stroke(); } }
    if (contents === 'fish') { for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(-6 + i * 12, -10 - i * 3); ctx.rotate(-0.3 + i * 0.6); fishShape(ctx, 0, 0, 0.7, '#9fc3d6'); ctx.restore(); } }
    const g = ctx.createLinearGradient(0, -8, 0, 10); g.addColorStop(0, '#d9a45a'); g.addColorStop(1, '#8a5a2a'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-20, -6); ctx.lineTo(20, -6); ctx.lineTo(15, 10); ctx.lineTo(-15, 10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#7a4a1e'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-18 + i, -1 + i * 4); ctx.lineTo(18 - i, -1 + i * 4); ctx.stroke(); }
    ctx.restore();
  }
  function fishShape(ctx, x, y, s, col = '#f0a050') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const g = ctx.createLinearGradient(0, -8, 0, 8); g.addColorStop(0, shade(col, 0.25)); g.addColorStop(1, shade(col, -0.2)); ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, 0, 14, 7, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(11, 0); ctx.lineTo(21, -7); ctx.lineTo(21, 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1f1420'; ctx.beginPath(); ctx.arc(-7, -1.5, 1.8, 0, 7); ctx.fill(); ctx.restore();
  }
  // a small pride flag on a pole, gently waving
  function prideFlag(ctx, x, y, s = 1, t = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#6b4a2e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke();
    const cols = ['#e53b3b', '#f28c28', '#f6d23a', '#3aa655', '#3b6fd6', '#7a3fb0'], fw = 34, fh = 22;
    for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i]; ctx.beginPath();
      for (let k = 0; k <= 8; k++) { const xx = k / 8 * fw, yy = -46 + i * fh / 6 + Math.sin(t * 4 + k * 0.7) * 2 * (k / 8); k === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); }
      for (let k = 8; k >= 0; k--) { const xx = k / 8 * fw, yy = -46 + (i + 1) * fh / 6 + Math.sin(t * 4 + k * 0.7) * 2 * (k / 8); ctx.lineTo(xx, yy); }
      ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }

  // ---------- characters ----------
  // Shared face: big storybook eyes with highlights, blush, small expressive mouth.
  function face(ctx, hx, hy, r, opts) {
    const { expr = 'happy', facing = 1, blink = false, skin } = opts;
    const ex = r * 0.37, ey = hy + r * 0.12, off = facing * r * 0.08;
    // blush
    ctx.fillStyle = 'rgba(232,96,96,0.28)'; ctx.beginPath(); ctx.ellipse(hx - ex - r * 0.12 + off, ey + r * 0.32, r * 0.17, r * 0.1, 0, 0, 7); ctx.ellipse(hx + ex + r * 0.12 + off, ey + r * 0.32, r * 0.17, r * 0.1, 0, 0, 7); ctx.fill();
    // eyes
    const eyeH = expr === 'surprised' || expr === 'wow' ? r * 0.3 : r * 0.26;
    for (const sx of [-1, 1]) { const cx = hx + sx * ex + off;
      if (blink || expr === 'laugh' || expr === 'sleep') { ctx.strokeStyle = '#2a1820'; ctx.lineWidth = Math.max(1.4, r * 0.07); ctx.lineCap = 'round'; ctx.beginPath(); if (expr === 'sleep') ctx.arc(cx, ey, r * 0.12, 0.15 * Math.PI, 0.85 * Math.PI); else ctx.arc(cx, ey + r * 0.05, r * 0.12, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); continue; }
      ctx.fillStyle = '#2a1820'; ctx.beginPath(); ctx.ellipse(cx, ey, r * 0.155, eyeH, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#5a3a3a'; ctx.beginPath(); ctx.ellipse(cx, ey + eyeH * 0.35, r * 0.1, eyeH * 0.45, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - r * 0.04 + facing * r * 0.02, ey - eyeH * 0.4, r * 0.075, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx + r * 0.05, ey + eyeH * 0.3, r * 0.03, 0, 7); ctx.fill();
      if (expr === 'sad' || expr === 'grumpy') { ctx.strokeStyle = '#2a1820'; ctx.lineWidth = Math.max(1.2, r * 0.06); ctx.beginPath(); const d = expr === 'sad' ? -sx : sx; ctx.moveTo(cx - r * 0.14, ey - eyeH - r * 0.08 + d * r * 0.05); ctx.lineTo(cx + r * 0.14, ey - eyeH - r * 0.08 - d * r * 0.05); ctx.stroke(); } }
    // mouth
    const mx = hx + off * 1.2, my = hy + r * 0.48; ctx.strokeStyle = '#3a1a20'; ctx.lineWidth = Math.max(1.3, r * 0.065); ctx.lineCap = 'round';
    if (expr === 'happy') { ctx.beginPath(); ctx.arc(mx, my - r * 0.1, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
    else if (expr === 'laugh' || expr === 'wow') { ctx.fillStyle = '#7a2a34'; ctx.beginPath(); ctx.moveTo(mx - r * 0.2, my - r * 0.08); ctx.quadraticCurveTo(mx, my + r * 0.36, mx + r * 0.2, my - r * 0.08); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ee8a8a'; ctx.beginPath(); ctx.ellipse(mx, my + r * 0.1, r * 0.09, r * 0.05, 0, 0, 7); ctx.fill(); }
    else if (expr === 'surprised') { ctx.fillStyle = '#7a2a34'; ctx.beginPath(); ctx.ellipse(mx, my, r * 0.09, r * 0.12, 0, 0, 7); ctx.fill(); }
    else if (expr === 'sad' || expr === 'grumpy') { ctx.beginPath(); ctx.arc(mx, my + r * 0.12, r * 0.13, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
    else if (expr === 'sleep') { ctx.beginPath(); ctx.arc(mx, my, r * 0.06, 0, 7); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(mx - r * 0.1, my); ctx.lineTo(mx + r * 0.1, my); ctx.stroke(); }
  }
  // Limb: tapered rounded stroke from a to b
  // sleeveArm: a tapered sleeve from shoulder (ax,ay) to wrist (bx,by) with a soft elbow bend, a cuff, light and shade,
  // and a small mitten hand with a thumb. side is -1 for the figure's left arm and 1 for its right.
  function sleeveArm(ctx, ax, ay, bx, by, side, col, outline, skin, skinLine, cuff) {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    let nx = -uy, ny = ux; if (nx * side < 0) { nx = -nx; ny = -ny; }          // bend the elbow away from the body
    const bend = Math.min(5, L * 0.14), mx = (ax + bx) / 2 + nx * bend * 2, my = (ay + by) / 2 + ny * bend * 2;
    const pt = t => { const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; return [a * ax + b * mx + c * bx, a * ay + b * my + c * by]; };
    const tan = t => { const x = 2 * (1 - t) * (mx - ax) + 2 * t * (bx - mx), y = 2 * (1 - t) * (my - ay) + 2 * t * (by - my), l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
    const wAt = t => 7.4 - 2.6 * t, N = 12, left = [], right = [];
    for (let i = 0; i <= N; i++) { const t = i / N * 0.9, [x, y] = pt(t), [tx, ty] = tan(t), w = wAt(t) / 2; left.push([x - ty * w, y + tx * w]); right.push([x + ty * w, y - tx * w]); }
    const poly = () => { ctx.beginPath(); ctx.moveTo(...left[0]); for (const q of left) ctx.lineTo(...q); for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(...right[i]); ctx.closePath(); };
    const g = ctx.createLinearGradient(ax - nx * 4, ay - ny * 4, ax + nx * 4, ay + ny * 4); g.addColorStop(0, shade(col, -0.12)); g.addColorStop(1, shade(col, 0.16));
    ctx.lineJoin = 'round'; poly(); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = outline; ctx.lineWidth = 1.6; ctx.stroke();
    // a soft highlight along the outer edge of the sleeve
    ctx.save(); poly(); ctx.clip(); ctx.strokeStyle = rgba(shade(col, 0.45), 0.55); ctx.lineWidth = 1.6; ctx.beginPath(); const side2 = (nx * (left[0][0] - ax) + ny * (left[0][1] - ay)) > 0 ? left : right; ctx.moveTo(...side2[1]); for (let i = 2; i < side2.length - 1; i++) ctx.lineTo(...side2[i]); ctx.stroke(); ctx.restore();
    // cuff
    const [cx0, cy0] = pt(0.86), [ctx0, cty0] = tan(0.86), cw = wAt(0.86) / 2 + 0.6; ctx.strokeStyle = cuff || shade(col, 0.3); ctx.lineWidth = 2.2; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(cx0 - cty0 * cw, cy0 + ctx0 * cw); ctx.lineTo(cx0 + cty0 * cw, cy0 - ctx0 * cw); ctx.stroke(); ctx.lineCap = 'round';
    // mitten hand with a thumb
    const [ex, ey] = tan(1), hx = bx + ex * 1.2, hy = by + ey * 1.2, ang = Math.atan2(ey, ex);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang); ctx.fillStyle = skin; ctx.strokeStyle = skinLine; ctx.lineWidth = 1.2;
    const th = (side > 0 ? -1 : 1) * (Math.abs(ang) > Math.PI / 2 ? -1 : 1);
    ctx.beginPath(); ctx.ellipse(0.6, th * 2.6, 1.9, 1.4, th * 0.6, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(1.2, 0, 4.0, 3.3, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = rgba('#ffffff', 0.22); ctx.beginPath(); ctx.ellipse(0.4, -1.2, 1.8, 0.9, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  function limb(ctx, ax, ay, bx, by, wdt, col, outline) { ctx.lineCap = 'round'; ctx.strokeStyle = outline; ctx.lineWidth = wdt + 2.4; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
  // person(ctx, x, y, s, opts): x,y is between the feet; s=1 is about 64px tall.
  // opts: skin, robe, stripe, sash, hair, hairStyle(short|long|curly|bun|bald), beard, head(scarf|wrap|crown|none), headCol,
  //       expr, facing(1|-1), arms(down|up|wave|out|hold|cheer|reach|pray), t (time, for bobbing), child (bool), hold(fn drawn at hands)
  function person(ctx, x, y, s = 1, o = {}) {
    const skin = o.skin || SKIN[2], robe = o.robe || CLOTH.terracotta, stripe = o.stripe, hair = o.hair || HAIR[0], facing = o.facing || 1, t = o.t || 0;
    const bob = Math.sin(t * 6 + (o.phase || 0)) * (o.bounce ?? 1.2), child = o.child, H = child ? 0.82 : 1;
    const outline = shade(robe, -0.45), skinLine = shade(skin, -0.4);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s);
    // ground shadow
    ctx.fillStyle = 'rgba(40,20,40,0.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 4.5, 0, 0, 7); ctx.fill();
    ctx.translate(0, -bob * 0.5);
    const bodyTop = -40 * H, headY = bodyTop - 15, headR = child ? 15 : 16;
    if (o.head === 'scarf') { // loose shawl, back layer: falls behind the shoulders, with long hair under it
      const hc = o.headCol || CLOTH.cream; ctx.fillStyle = shade(hc, -0.12); ctx.strokeStyle = shade(hc, -0.45); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-headR - 7, headY - 4); ctx.quadraticCurveTo(-headR - 12, headY + 24, -headR - 10, bodyTop + 26); ctx.lineTo(headR + 10, bodyTop + 26); ctx.quadraticCurveTo(headR + 12, headY + 24, headR + 7, headY - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = hair; ctx.beginPath(); ctx.moveTo(-headR * 1.1, headY); ctx.arc(0, headY, headR * 1.1, Math.PI, 0); ctx.lineTo(headR * 1.15, bodyTop + 8); ctx.lineTo(headR * 0.5, bodyTop + 6); ctx.lineTo(headR * 0.45, headY + headR * 0.5); ctx.lineTo(-headR * 0.45, headY + headR * 0.5); ctx.lineTo(-headR * 0.5, bodyTop + 6); ctx.lineTo(-headR * 1.15, bodyTop + 8); ctx.closePath(); ctx.fill(); }
    // feet
    if (o.outfit !== 'modern') { ctx.fillStyle = '#6b4226'; ctx.beginPath(); ctx.ellipse(-6, -1.5, 5, 3, 0, 0, 7); ctx.ellipse(7, -1.5, 5, 3, 0, 0, 7); ctx.fill(); }
    // arms behind for some poses
    const shoulderY = bodyTop + 7, sx = 9;
    const arm = { down: [[-13, bodyTop + 26], [13, bodyTop + 26]], up: [[-23, bodyTop - 20], [23, bodyTop - 20]], wave: [[-13, bodyTop + 26], [26 + Math.sin(t * 10) * 3, bodyTop - 18]], out: [[-21, bodyTop + 10], [21, bodyTop + 10]], hold: [[-7, bodyTop + 18], [7, bodyTop + 18]], cheer: [[-26, bodyTop - 14], [26, bodyTop - 14]], reach: [[-12, bodyTop + 24], [22, bodyTop + 2]], pray: [[-2, bodyTop + 10], [2, bodyTop + 10]], raise: [[-13, bodyTop + 26], [26, bodyTop - 18]] }[o.arms || 'down'];
    if (o.outfit === 'modern') {
      // modern clothes: trousers or a skirt, a shirt or sweater, sneakers; optional clergy collar and stole
      const pants = o.pants || '#3f5a8a', pl = shade(pants, -0.45);
      if (o.skirt) { ctx.fillStyle = skin; ctx.fillRect(-8, -12, 5, 10); ctx.fillRect(3, -12, 5, 10); const sg = ctx.createLinearGradient(0, bodyTop + 20, 0, -10); sg.addColorStop(0, shade(pants, 0.1)); sg.addColorStop(1, shade(pants, -0.15)); ctx.fillStyle = sg; ctx.strokeStyle = pl; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-11, bodyTop + 20); ctx.lineTo(-15, -10); ctx.quadraticCurveTo(0, -7, 15, -10); ctx.lineTo(11, bodyTop + 20); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      else { ctx.strokeStyle = pl; ctx.lineCap = 'round'; for (const lx of [-5.5, 5.5]) { ctx.lineWidth = 9.6; ctx.beginPath(); ctx.moveTo(lx, bodyTop + 22); ctx.lineTo(lx * 1.1, -4); ctx.stroke(); } ctx.strokeStyle = pants; for (const lx of [-5.5, 5.5]) { ctx.lineWidth = 7.4; ctx.beginPath(); ctx.moveTo(lx, bodyTop + 22); ctx.lineTo(lx * 1.1, -4); ctx.stroke(); } }
      ctx.fillStyle = o.shoes || '#f4f1ea'; ctx.strokeStyle = '#5a4a4a'; ctx.lineWidth = 1.2; for (const fx of [-6.5, 7]) { ctx.beginPath(); ctx.ellipse(fx, -2, 6, 3.4, 0, 0, 7); ctx.fill(); ctx.stroke(); }
      const g = ctx.createLinearGradient(-14, bodyTop, 14, bodyTop + 28); g.addColorStop(0, shade(robe, 0.18)); g.addColorStop(1, shade(robe, -0.15));
      ctx.fillStyle = g; ctx.strokeStyle = outline; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-8, bodyTop); ctx.quadraticCurveTo(-12, bodyTop + 2, -12.5, bodyTop + 10); ctx.lineTo(-12, bodyTop + 27); ctx.quadraticCurveTo(0, bodyTop + 30, 12, bodyTop + 27); ctx.lineTo(12.5, bodyTop + 10); ctx.quadraticCurveTo(12, bodyTop + 2, 8, bodyTop); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (o.hoodie) { ctx.strokeStyle = shade(robe, -0.3); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-2, bodyTop + 3); ctx.lineTo(-2, bodyTop + 12); ctx.moveTo(2, bodyTop + 3); ctx.lineTo(2, bodyTop + 12); ctx.stroke(); ctx.fillStyle = shade(robe, -0.12); ctx.fillRect(-7, bodyTop + 17, 14, 6); }
      if (o.cardigan) { ctx.fillStyle = o.cardigan; ctx.beginPath(); ctx.moveTo(-8, bodyTop); ctx.lineTo(-3, bodyTop); ctx.lineTo(-2, bodyTop + 28); ctx.lineTo(-12, bodyTop + 27); ctx.lineTo(-12.5, bodyTop + 10); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(8, bodyTop); ctx.lineTo(3, bodyTop); ctx.lineTo(2, bodyTop + 28); ctx.lineTo(12, bodyTop + 27); ctx.lineTo(12.5, bodyTop + 10); ctx.closePath(); ctx.fill(); }
      if (o.stole) { ctx.fillStyle = o.stole; ctx.strokeStyle = shade(o.stole, -0.4); ctx.lineWidth = 1; for (const sx2 of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx2 * 3, bodyTop); ctx.lineTo(sx2 * 8, bodyTop); ctx.lineTo(sx2 * 8.5, bodyTop + 36); ctx.lineTo(sx2 * 3.5, bodyTop + 36); ctx.closePath(); ctx.fill(); ctx.stroke(); } ctx.fillStyle = '#f6d36a'; for (const sx2 of [-1, 1]) { ctx.save(); ctx.translate(sx2 * 6, bodyTop + 28); ctx.fillRect(-0.8, -3, 1.6, 6); ctx.fillRect(-2.2, -1.4, 4.4, 1.6); ctx.restore(); } }
      if (o.collar === 'clergy') { ctx.fillStyle = '#fbfbfb'; ctx.strokeStyle = '#999'; ctx.lineWidth = 0.8; ctx.fillRect(-2.5, bodyTop - 1, 5, 3.6); ctx.strokeRect(-2.5, bodyTop - 1, 5, 3.6); }
    } else {
      // robe body (A-line) with shading
      const g = ctx.createLinearGradient(-14, bodyTop, 14, 0); g.addColorStop(0, shade(robe, 0.18)); g.addColorStop(1, shade(robe, -0.15));
      ctx.fillStyle = g; ctx.strokeStyle = outline; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-8, bodyTop); ctx.quadraticCurveTo(-11, bodyTop + 2, -12, bodyTop + 10); ctx.lineTo(-15, -3); ctx.quadraticCurveTo(0, 1, 15, -3); ctx.lineTo(12, bodyTop + 10); ctx.quadraticCurveTo(11, bodyTop + 2, 8, bodyTop); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (stripe) { ctx.save(); ctx.clip(); ctx.fillStyle = stripe; ctx.fillRect(-3.5, bodyTop, 7, 45); ctx.fillStyle = rgba(shade(stripe, 0.4), 0.7); ctx.fillRect(-15, -8, 30, 2.5); ctx.restore(); }
      if (o.sash) { ctx.fillStyle = o.sash; ctx.beginPath(); ctx.moveTo(-12, bodyTop + 13); ctx.lineTo(12, bodyTop + 13); ctx.lineTo(12.5, bodyTop + 18); ctx.lineTo(-12.5, bodyTop + 18); ctx.fill(); }
    }
    // arms
    // arms: raised arms are drawn last, in front of the hair, so they never look like they grow out of the head
    const raised = arm.map(([hx, hy]) => hy < shoulderY - 4);
    const drawArm = (i) => sleeveArm(ctx, i ? sx : -sx, shoulderY, arm[i][0], arm[i][1], i ? 1 : -1, shade(robe, 0.05), outline, skin, skinLine, stripe && shade(stripe, 0.15));
    if (!raised[0]) drawArm(0);
    if (!raised[1]) drawArm(1);
    if (o.hold) { ctx.save(); o.hold(ctx, (arm[0][0] + arm[1][0]) / 2, (arm[0][1] + arm[1][1]) / 2); ctx.restore(); }
    // neck + head
    ctx.fillStyle = skin; ctx.fillRect(-3.5, bodyTop - 4, 7, 6); ctx.fillStyle = 'rgba(80,30,30,0.18)'; ctx.fillRect(-3.5, bodyTop - 4, 7, 3);
    // back hair
    if (o.hairStyle === 'long' || o.hairStyle === 'curly') { // back hair: a dome over the head plus two side falls to the shoulders, open under the chin
      ctx.fillStyle = shade(hair, -0.05); ctx.beginPath(); ctx.moveTo(-headR * 1.08, headY); ctx.arc(0, headY, headR * 1.08, Math.PI, 0); ctx.lineTo(headR * 1.12, bodyTop + 12); ctx.quadraticCurveTo(headR * 0.8, bodyTop + 15, headR * 0.5, bodyTop + 9); ctx.lineTo(headR * 0.45, headY + headR * 0.5); ctx.lineTo(-headR * 0.45, headY + headR * 0.5); ctx.lineTo(-headR * 0.5, bodyTop + 9); ctx.quadraticCurveTo(-headR * 0.8, bodyTop + 15, -headR * 1.12, bodyTop + 12); ctx.closePath(); ctx.fill();
      if (o.hairStyle === 'curly') { for (let i = 0; i < 6; i++) { const yy = headY + i * 5; ctx.beginPath(); ctx.arc(-headR * 1.05, yy, 4.5, 0, 7); ctx.arc(headR * 1.05, yy, 4.5, 0, 7); ctx.fill(); } } }
    // head scarf back drape
    // head
    const hg = ctx.createRadialGradient(-headR * 0.35, headY - headR * 0.4, 2, 0, headY, headR * 1.1); hg.addColorStop(0, shade(skin, 0.12)); hg.addColorStop(1, shade(skin, -0.06));
    ctx.fillStyle = hg; ctx.strokeStyle = skinLine; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, headY, headR, headR * 0.98, 0, 0, 7); ctx.fill(); ctx.stroke();
    // ears
    if (o.hairStyle !== 'long' && o.hairStyle !== 'curly' && o.head !== 'scarf') { ctx.fillStyle = skin; for (const ex2 of [-headR + 0.5, headR - 0.5]) { ctx.beginPath(); ctx.ellipse(ex2, headY + 2, 3, 4, 0, 0, 7); ctx.fill(); ctx.stroke(); } }
    // beard
    if (o.beard) { ctx.fillStyle = o.beard === true ? hair : o.beard; ctx.beginPath(); ctx.moveTo(-headR * 0.85, headY + 2); ctx.quadraticCurveTo(-headR * 0.7, headY + headR * 1.25, 0, headY + headR * 1.3); ctx.quadraticCurveTo(headR * 0.7, headY + headR * 1.25, headR * 0.85, headY + 2); ctx.quadraticCurveTo(headR * 0.5, headY + headR * 0.75, 0, headY + headR * 0.72); ctx.quadraticCurveTo(-headR * 0.5, headY + headR * 0.75, -headR * 0.85, headY + 2); ctx.fill(); }
    face(ctx, 0, headY - 1, headR, { expr: o.expr || 'happy', facing: 1, blink: o.blink });
    if (o.glasses) { ctx.strokeStyle = '#4a3a3a'; ctx.lineWidth = 1.3; for (const gx of [-1, 1]) { ctx.beginPath(); ctx.arc(gx * headR * 0.37, headY - 1 + headR * 0.12, headR * 0.27, 0, 7); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(-headR * 0.1, headY - 1 + headR * 0.1); ctx.lineTo(headR * 0.1, headY - 1 + headR * 0.1); ctx.stroke(); }
    if (o.beard) { ctx.fillStyle = o.beard === true ? hair : o.beard; ctx.beginPath(); ctx.ellipse(0, headY + headR * 0.38, headR * 0.26, headR * 0.08, 0, 0, 7); ctx.fill(); }
    // front hair / head covering
    ctx.fillStyle = hair;
    if (o.head === 'scarf') { // loose shawl, front layer: rests on top of the head and hangs open well away from the face
      const hc = o.headCol || CLOTH.cream;
      ctx.fillStyle = hair; ctx.beginPath(); ctx.moveTo(-headR - 0.5, headY + 2); ctx.quadraticCurveTo(-headR * 1.05, headY - headR * 1.12, 0, headY - headR * 1.04); ctx.quadraticCurveTo(headR * 1.05, headY - headR * 1.12, headR + 0.5, headY + 2); ctx.quadraticCurveTo(headR * 0.6, headY - headR * 0.55, headR * 0.1, headY - headR * 0.62); ctx.quadraticCurveTo(-headR * 0.3, headY - headR * 0.3, -headR - 0.5, headY + 2); ctx.fill();
      const g2 = ctx.createLinearGradient(-headR, headY - headR, headR, bodyTop + 20); g2.addColorStop(0, shade(hc, 0.15)); g2.addColorStop(1, shade(hc, -0.1));
      ctx.fillStyle = g2; ctx.strokeStyle = shade(hc, -0.45); ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(-headR - 9, bodyTop + 20); ctx.quadraticCurveTo(-headR - 10, headY - headR * 0.6, -headR * 0.6, headY - headR - 8); ctx.quadraticCurveTo(0, headY - headR - 12, headR * 0.6, headY - headR - 8); ctx.quadraticCurveTo(headR + 10, headY - headR * 0.6, headR + 9, bodyTop + 20);
      ctx.lineTo(headR + 3, bodyTop + 14); ctx.quadraticCurveTo(headR + 4, headY - headR * 0.4, headR * 0.5, headY - headR - 1); ctx.quadraticCurveTo(0, headY - headR - 4, -headR * 0.5, headY - headR - 1); ctx.quadraticCurveTo(-headR - 4, headY - headR * 0.4, -headR - 3, bodyTop + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = rgba(shade(hc, -0.4), 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-headR - 6, headY); ctx.quadraticCurveTo(-headR - 7, headY + 14, -headR - 6, bodyTop + 16); ctx.moveTo(headR + 6, headY); ctx.quadraticCurveTo(headR + 7, headY + 14, headR + 6, bodyTop + 16); ctx.stroke(); }
    else if (o.head === 'wrap') { const hc = o.headCol || CLOTH.white; ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, headY - headR * 0.45, headR * 0.95, headR * 0.55, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = hc; ctx.strokeStyle = shade(hc, -0.45); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(0, headY - headR * 0.68, headR * 1.02, headR * 0.42, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = shade(hc, -0.2); ctx.beginPath(); ctx.moveTo(-headR * 0.8, headY - headR * 0.6); ctx.quadraticCurveTo(0, headY - headR * 0.95, headR * 0.8, headY - headR * 0.7); ctx.stroke(); }
    else if (o.hairStyle === 'bald') { ctx.fillStyle = rgba('#ffffff', 0.25); ctx.beginPath(); ctx.ellipse(-headR * 0.35, headY - headR * 0.7, headR * 0.3, headR * 0.12, -0.4, 0, 7); ctx.fill(); }
    else if (o.hairStyle === 'curly') { for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.11); ctx.beginPath(); ctx.arc(Math.cos(a) * headR * 0.92, headY + Math.sin(a) * headR * 0.92, headR * 0.32, 0, 7); ctx.fill(); } }
    else if (o.hairStyle === 'bun') { ctx.beginPath(); ctx.arc(0, headY - headR - 3, headR * 0.42, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, headY - headR * 0.45, headR * 1.0, headR * 0.6, 0, Math.PI, 0); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-headR - 0.5, headY + 1); ctx.quadraticCurveTo(-headR * 1.05, headY - headR * 1.15, 0, headY - headR * 1.05); ctx.quadraticCurveTo(headR * 1.05, headY - headR * 1.15, headR + 0.5, headY + 1); ctx.quadraticCurveTo(headR * 0.6, headY - headR * 0.55, headR * 0.1, headY - headR * 0.62); ctx.quadraticCurveTo(-headR * 0.3, headY - headR * 0.3, -headR - 0.5, headY + 1); ctx.fill(); ctx.fillStyle = rgba('#ffffff', 0.18); ctx.beginPath(); ctx.ellipse(-headR * 0.3, headY - headR * 0.8, headR * 0.35, headR * 0.1, -0.3, 0, 7); ctx.fill(); }
    if (o.head === 'crown') { ctx.fillStyle = '#f2c94c'; ctx.strokeStyle = '#a8781e'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-10, headY - headR + 2); for (let i = 0; i <= 4; i++) { ctx.lineTo(-10 + i * 5, headY - headR - (i % 2 ? 2 : 10)); } ctx.lineTo(10, headY - headR + 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    raised.forEach((r, k) => { if (r) drawArm(k); });
    ctx.restore();
  }

  // ---------- animals (all face right by default; pass facing -1 to flip) ----------
  function begin(ctx, x, y, s, facing) { ctx.save(); ctx.translate(x, y); ctx.scale(s * (facing || 1), s); ctx.fillStyle = 'rgba(40,20,40,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 4.5, 0, 0, 7); ctx.fill(); }
  function softFill(ctx, col, x0, y0, r) { const g = ctx.createRadialGradient(x0 - r * 0.4, y0 - r * 0.5, 1, x0, y0, r * 1.2); g.addColorStop(0, shade(col, 0.22)); g.addColorStop(1, shade(col, -0.12)); return g; }
  function eye(ctx, x, y, r = 2.6) { ctx.fillStyle = '#2a1820'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.85, r, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.4, r * 0.38, 0, 7); ctx.fill(); }
  function blush(ctx, x, y, r = 3.4) { ctx.fillStyle = 'rgba(232,96,110,0.32)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, 0, 0, 7); ctx.fill(); }
  function sheep(ctx, x, y, s = 1, o = {}) {
    const t = o.t || 0; begin(ctx, x, y, s, o.facing); const b = Math.abs(Math.sin(t * 7 + (o.phase || 0))) * (o.hop ? 4 : 1);
    ctx.translate(0, -b);
    ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; for (const lx of [-9, -3, 5, 11]) { ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx, -1); ctx.stroke(); }
    const wool = o.col || '#fbf5ea'; ctx.fillStyle = shade(wool, -0.18); const puffs = [[-12, -18, 8], [-4, -22, 9], [5, -22, 9], [12, -17, 8], [-8, -12, 8], [3, -12, 9], [11, -11, 7]];
    for (const [px, py, pr] of puffs) { ctx.beginPath(); ctx.arc(px + 1, py + 2, pr, 0, 7); ctx.fill(); }
    for (const [px, py, pr] of puffs) { ctx.fillStyle = softFill(ctx, wool, px, py, pr); ctx.beginPath(); ctx.arc(px, py, pr * 0.92, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#4a3434'; ctx.beginPath(); ctx.ellipse(20, -20, 7.5, 8.5, 0.15, 0, 7); ctx.fill();
    ctx.fillStyle = '#4a3434'; ctx.beginPath(); ctx.ellipse(14, -24, 5, 2.5, -0.6, 0, 7); ctx.fill();
    ctx.fillStyle = softFill(ctx, wool, 19, -28, 5); ctx.beginPath(); ctx.arc(18, -28, 5, 0, 7); ctx.fill();
    eye(ctx, 22, -21, 2.2); blush(ctx, 24, -16, 2.6);
    ctx.restore();
  }
  function dove(ctx, x, y, s = 1, o = {}) {
    const t = o.t || 0; ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.facing || 1), s);
    const flap = Math.sin(t * 14) * (o.flying === false ? 0.1 : 1);
    ctx.fillStyle = '#e8eef5'; ctx.strokeStyle = '#9aa8bf'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-4, -2); ctx.quadraticCurveTo(-10, -22 - flap * 10, -2, -30 - flap * 12); ctx.quadraticCurveTo(4, -14, 6, -3); ctx.closePath(); ctx.fill(); ctx.stroke();
    const g = ctx.createRadialGradient(-2, -6, 1, 0, 0, 16); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d7e0ec'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 7, -0.1, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-11, -1); ctx.lineTo(-22, -6); ctx.lineTo(-21, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(11, -5, 6, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f2a33a'; ctx.beginPath(); ctx.moveTo(16, -5); ctx.lineTo(21, -3.5); ctx.lineTo(16, -2.5); ctx.fill();
    eye(ctx, 12.5, -6, 1.7);
    ctx.fillStyle = '#f4f7fb'; ctx.beginPath(); ctx.moveTo(-3, -1); ctx.quadraticCurveTo(-6, 10 + flap * 10, 3, 14 + flap * 10); ctx.quadraticCurveTo(6, 4, 5, -1); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (o.branch) { ctx.strokeStyle = '#6a8a3a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(18, -3); ctx.lineTo(28, 2); ctx.stroke(); ctx.fillStyle = '#7fa64a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(21 + i * 3, -1 + i * 1.6 + (i % 2 ? 3 : -2), 3, 1.4, 0.5, 0, 7); ctx.fill(); } }
    ctx.restore();
  }
  function lion(ctx, x, y, s = 1, o = {}) {
    const t = o.t || 0; begin(ctx, x, y, s, o.facing);
    ctx.fillStyle = softFill(ctx, '#e0a85a', 0, -18, 20); ctx.beginPath(); ctx.ellipse(-4, -16, 20, 11, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#b77a35'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const lx of [-16, -8, 4, 10]) { ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx, -2); ctx.stroke(); }
    ctx.strokeStyle = '#d29a52'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, -18); ctx.quadraticCurveTo(-32, -28 + Math.sin(t * 3) * 3, -30, -34); ctx.stroke(); ctx.fillStyle = '#8a4a1a'; ctx.beginPath(); ctx.arc(-30, -35, 3.5, 0, 7); ctx.fill();
    const mane = '#b8541f'; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ctx.fillStyle = i % 2 ? mane : shade(mane, 0.15); ctx.beginPath(); ctx.arc(14 + Math.cos(a) * 12, -26 + Math.sin(a) * 12, 7.5, 0, 7); ctx.fill(); }
    ctx.fillStyle = softFill(ctx, '#eab56a', 14, -26, 11); ctx.beginPath(); ctx.arc(14, -26, 11, 0, 7); ctx.fill();
    ctx.fillStyle = '#f6dcae'; ctx.beginPath(); ctx.ellipse(16, -21, 6, 4.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#5a2a1a'; ctx.beginPath(); ctx.moveTo(14, -24); ctx.lineTo(19, -24); ctx.lineTo(16.5, -21.5); ctx.fill();
    if (o.expr === 'sleep') { ctx.strokeStyle = '#3a1a10'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(10, -29, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.arc(19, -29, 2.5, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); } else { eye(ctx, 10, -29, 2.4); eye(ctx, 19, -29, 2.4); }
    blush(ctx, 8, -23, 2.6); blush(ctx, 22, -23, 2.6);
    ctx.restore();
  }
  function elephant(ctx, x, y, s = 1, o = {}) {
    const t = o.t || 0; begin(ctx, x, y, s * 1.4, o.facing); const col = o.col || '#9aa3b5';
    ctx.strokeStyle = shade(col, -0.25); ctx.lineWidth = 8; ctx.lineCap = 'round'; for (const lx of [-14, -5, 6, 14]) { ctx.beginPath(); ctx.moveTo(lx, -12); ctx.lineTo(lx, -2); ctx.stroke(); }
    ctx.fillStyle = softFill(ctx, col, -2, -22, 22); ctx.beginPath(); ctx.ellipse(-2, -20, 22, 15, 0, 0, 7); ctx.fill();
    ctx.fillStyle = softFill(ctx, col, 18, -26, 12); ctx.beginPath(); ctx.arc(18, -26, 12, 0, 7); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(27, -24); ctx.quadraticCurveTo(34, -10, 30 + Math.sin(t * 3) * 3, -4); ctx.stroke();
    ctx.fillStyle = shade(col, -0.08); ctx.beginPath(); ctx.ellipse(10, -26, 8, 11, -0.2, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(232,140,150,0.4)'; ctx.beginPath(); ctx.ellipse(10, -26, 5, 7.5, -0.2, 0, 7); ctx.fill();
    eye(ctx, 22, -29, 2.3); blush(ctx, 24, -23, 2.6);
    ctx.restore();
  }
  function giraffe(ctx, x, y, s = 1, o = {}) {
    const t = o.t || 0; begin(ctx, x, y, s, o.facing); const col = '#f0bf5a';
    ctx.strokeStyle = '#c8913a'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const lx of [-10, -4, 6, 11]) { ctx.beginPath(); ctx.moveTo(lx, -16); ctx.lineTo(lx, -1); ctx.stroke(); }
    ctx.fillStyle = softFill(ctx, col, 0, -20, 14); ctx.beginPath(); ctx.ellipse(0, -20, 15, 9, 0, 0, 7); ctx.fill();
    const sw = Math.sin(t * 2) * 2; ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(10, -24); ctx.quadraticCurveTo(14 + sw, -45, 16 + sw, -62); ctx.stroke();
    ctx.fillStyle = '#b8742a'; const spots = [[-6, -22], [3, -18], [-1, -25], [8, -21], [12, -34], [14, -46]]; for (const [px, py] of spots) { ctx.beginPath(); ctx.arc(px + (py < -30 ? sw : 0), py, 2.6, 0, 7); ctx.fill(); }
    ctx.fillStyle = softFill(ctx, col, 20, -66, 7); ctx.beginPath(); ctx.ellipse(20 + sw, -65, 9, 6, 0.2, 0, 7); ctx.fill();
    ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(15 + sw, -70); ctx.lineTo(14 + sw, -76); ctx.moveTo(19 + sw, -70); ctx.lineTo(19 + sw, -77); ctx.stroke();
    eye(ctx, 21 + sw, -67, 1.9); blush(ctx, 24 + sw, -63, 2.2);
    ctx.restore();
  }
  // big friendly fish for Jonah
  function bigFish(ctx, x, y, s = 1, o = {}) {
    const t = o.t || 0, mouth = o.mouth ?? 0.2; ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.facing || 1), s);
    const col = o.col || '#4f7fb8';
    ctx.fillStyle = shade(col, -0.15); ctx.beginPath(); ctx.moveTo(-60, -6); ctx.quadraticCurveTo(-82, -30 + Math.sin(t * 3) * 6, -92, -36 + Math.sin(t * 3) * 6); ctx.quadraticCurveTo(-80, -6, -94, 22 + Math.sin(t * 3) * 6); ctx.quadraticCurveTo(-76, 14, -60, 6); ctx.fill();
    const g = ctx.createLinearGradient(0, -40, 0, 40); g.addColorStop(0, shade(col, 0.2)); g.addColorStop(0.55, col); g.addColorStop(0.56, '#e9e2cf'); g.addColorStop(1, '#cfc4a8'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(62, -6 - mouth * 22); ctx.quadraticCurveTo(30, -46, -20, -38); ctx.quadraticCurveTo(-66, -28, -66, 0); ctx.quadraticCurveTo(-60, 30, -10, 34); ctx.quadraticCurveTo(40, 34, 62, 6 + mouth * 22); ctx.lineTo(38, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(col, -0.45); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#7a2a3a'; ctx.beginPath(); ctx.moveTo(62, -6 - mouth * 22); ctx.lineTo(38, 0); ctx.lineTo(62, 6 + mouth * 22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 1.5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-20 + i * 12, 14); ctx.lineTo(-14 + i * 12, 30); ctx.stroke(); }
    ctx.fillStyle = shade(col, -0.1); ctx.beginPath(); ctx.moveTo(-10, 10); ctx.quadraticCurveTo(-4, 26, 10, 22); ctx.quadraticCurveTo(4, 14, -10, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(24, -18, 8, 0, 7); ctx.fill(); eye(ctx, 26, -18, 5); blush(ctx, 30, -6, 5);
    ctx.restore();
  }
  function camel(ctx, x, y, s = 1, o = {}) {
    begin(ctx, x, y, s, o.facing); const col = '#d9a865';
    ctx.strokeStyle = shade(col, -0.2); ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const lx of [-12, -6, 7, 13]) { ctx.beginPath(); ctx.moveTo(lx, -18); ctx.lineTo(lx, -1); ctx.stroke(); }
    ctx.fillStyle = softFill(ctx, col, 0, -24, 18); ctx.beginPath(); ctx.ellipse(0, -22, 17, 8, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-2, -30, 10, 9, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(14, -24); ctx.quadraticCurveTo(22, -26, 22, -40); ctx.stroke();
    ctx.fillStyle = softFill(ctx, col, 25, -42, 6); ctx.beginPath(); ctx.ellipse(26, -42, 8, 5, 0.1, 0, 7); ctx.fill();
    eye(ctx, 25, -44, 1.8); blush(ctx, 29, -40, 2.2);
    if (o.saddle) { ctx.fillStyle = o.saddle; ctx.fillRect(-10, -36, 18, 8); }
    ctx.restore();
  }
  function donkey(ctx, x, y, s = 1, o = {}) {
    begin(ctx, x, y, s, o.facing); const col = '#a39a92';
    ctx.strokeStyle = shade(col, -0.25); ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const lx of [-11, -5, 6, 11]) { ctx.beginPath(); ctx.moveTo(lx, -12); ctx.lineTo(lx, -1); ctx.stroke(); }
    ctx.fillStyle = softFill(ctx, col, 0, -18, 15); ctx.beginPath(); ctx.ellipse(0, -18, 15, 8.5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = softFill(ctx, col, 18, -26, 8); ctx.beginPath(); ctx.ellipse(18, -25, 7, 10, 0.6, 0, 7); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(13, -38, 2.6, 8, -0.2, 0, 7); ctx.ellipse(18, -38, 2.6, 8, 0.2, 0, 7); ctx.fill();
    ctx.fillStyle = '#e3dcd4'; ctx.beginPath(); ctx.ellipse(23, -20, 4.5, 4, 0, 0, 7); ctx.fill();
    eye(ctx, 18, -28, 2); blush(ctx, 21, -23, 2.2);
    if (o.talk) { ctx.fillStyle = '#6a2a34'; ctx.beginPath(); ctx.ellipse(25, -18, 2.4, 1.6 + Math.abs(Math.sin((o.t || 0) * 12)) * 1.8, 0, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function cat(ctx, x, y, s = 1, o = {}) {
    const t = o.t || 0; begin(ctx, x, y, s, o.facing); const col = o.col || '#e08a3c';
    ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.quadraticCurveTo(-22, -16, -18 + Math.sin(t * 4) * 3, -28); ctx.stroke();
    ctx.fillStyle = softFill(ctx, col, 0, -10, 11); ctx.beginPath(); ctx.ellipse(-2, -9, 11, 8, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -18, 8, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(3, -22); ctx.lineTo(4, -31); ctx.lineTo(9, -25); ctx.moveTo(10, -25); ctx.lineTo(15, -31); ctx.lineTo(15, -22); ctx.fill();
    if (o.expr === 'grumpy') { ctx.strokeStyle = '#2a1820'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(4, -20); ctx.lineTo(8, -19); ctx.moveTo(11, -19); ctx.lineTo(15, -20); ctx.stroke(); } else { eye(ctx, 6, -19, 1.7); eye(ctx, 12.5, -19, 1.7); }
    blush(ctx, 5, -15, 1.8); blush(ctx, 14, -15, 1.8);
    ctx.restore();
  }
  function goat(ctx, x, y, s = 1, o = {}) { // reuse sheep body with a plain coat and horns
    begin(ctx, x, y, s, o.facing); const col = o.col || '#e9e1d2';
    ctx.strokeStyle = '#6a5040'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (const lx of [-9, -3, 5, 10]) { ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx, -1); ctx.stroke(); }
    ctx.fillStyle = softFill(ctx, col, 0, -15, 13); ctx.beginPath(); ctx.ellipse(0, -15, 13, 7.5, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15, -23, 6, 7.5, 0.4, 0, 7); ctx.fill();
    ctx.strokeStyle = '#8a7058'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(13, -29); ctx.quadraticCurveTo(8, -36, 4, -32); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(17, -17); ctx.lineTo(18, -11); ctx.lineTo(20, -17); ctx.fill();
    eye(ctx, 16, -25, 1.8); blush(ctx, 19, -20, 2);
    ctx.restore();
  }

  // ---------- text ----------
  // The big shouted command, WarioWare style: chunky letters, thick outline, offset shadow, a little tilt and pop.
  function command(ctx, text, x, y, size, pop = 1, opts = {}) {
    const { fill = '#fff6dc', fill2 = '#ffcf5a', outline = '#3a1640', tilt = -0.06 } = opts;
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(pop, pop);
    ctx.font = `700 ${size}px Fredoka, Nunito, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.fillStyle = outline; ctx.fillText(text, 4, 6);
    ctx.strokeStyle = outline; ctx.lineWidth = size * 0.22; ctx.strokeText(text, 0, 0);
    const g = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.5); g.addColorStop(0, fill); g.addColorStop(1, fill2); ctx.fillStyle = g; ctx.fillText(text, 0, 0);
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.save(); ctx.beginPath(); ctx.rect(-400, -size * 0.5, 800, size * 0.28); ctx.clip(); ctx.fillText(text, 0, 0); ctx.restore();
    ctx.restore();
  }
  function label(ctx, text, x, y, size = 16, col = '#3a1640', align = 'center', weight = 800) {
    ctx.save(); ctx.font = `${weight} ${size}px Nunito, system-ui, sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(text, x, y); ctx.restore();
  }
  // a loaf of bread icon (the lives counter)
  function loaf(ctx, x, y, s = 1, gone = false) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (gone) ctx.globalAlpha = 0.25;
    const g = ctx.createRadialGradient(-4, -5, 1, 0, 0, 14); g.addColorStop(0, '#ffd88a'); g.addColorStop(0.7, '#d38a3c'); g.addColorStop(1, '#a8601f');
    ctx.fillStyle = g; ctx.strokeStyle = '#6e3a14'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(0, 0, 14, 9, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#f9e3b0'; ctx.lineWidth = 2; ctx.lineCap = 'round'; for (const dx of [-5, 0, 5]) { ctx.beginPath(); ctx.moveTo(dx - 2, -5); ctx.lineTo(dx + 2, 1); ctx.stroke(); }
    ctx.restore();
  }

  return { shade, mix, rgba, rng, noise1, SKIN, CLOTH, HAIR, grain, vignette, sky, stars, cloud, stormBank, rain, hills, ridgePath, rays, water, palm, tree, grassTufts, flowers, rock, house, basket, fishShape, prideFlag, face, person, sheep, dove, lion, elephant, giraffe, bigFish, camel, donkey, cat, goat, command, label, loaf, eye, blush };
})();
