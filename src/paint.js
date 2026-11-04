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
  function sky(ctx, w, h, stops, sun) {
    const g = ctx.createLinearGradient(0, 0, 0, h); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if (sun) {
      const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sun.glow || sun.r * 7);
      glow.addColorStop(0, rgba(sun.color, 0.75)); glow.addColorStop(0.25, rgba(sun.color, 0.28)); glow.addColorStop(1, rgba(sun.color, 0));
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      const disc = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, sun.r); disc.addColorStop(0, '#fffdf2'); disc.addColorStop(0.7, shade(sun.color, 0.6)); disc.addColorStop(1, rgba(sun.color, 0.0));
      ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(sun.x, sun.y, sun.r, 0, 7); ctx.fill();
    }
  }
  function stars(ctx, w, h, n, seed = 3, t = 0) {
    const r = rng(seed); ctx.save();
    for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, s = r() * 1.6 + 0.3, tw = 0.55 + 0.45 * Math.sin(t * 2 + i); ctx.globalAlpha = tw * (0.5 + r() * 0.5); ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill(); if (s > 1.5) { ctx.globalAlpha *= 0.5; ctx.fillRect(x - s * 3, y - 0.4, s * 6, 0.8); ctx.fillRect(x - 0.4, y - s * 3, 0.8, s * 6); } }
    ctx.restore();
  }
  // a soft cumulus cloud built from overlapping lit puffs
  function cloud(ctx, x, y, s, light = '#fff6ea', dark = '#e7c9d6', alpha = 1) {
    ctx.save(); ctx.globalAlpha = alpha;
    const puffs = [[-1.1, 0.15, 0.62], [-0.45, -0.25, 0.8], [0.35, -0.35, 0.9], [1.05, 0.05, 0.66], [0, 0.2, 0.85]];
    // shadow underside
    ctx.fillStyle = dark; for (const [dx, dy, r] of puffs) { ctx.beginPath(); ctx.arc(x + dx * s * 40, y + dy * s * 40 + s * 7, r * s * 40, 0, 7); ctx.fill(); }
    for (const [dx, dy, r] of puffs) { const cx = x + dx * s * 40, cy = y + dy * s * 40, rr = r * s * 40; const g = ctx.createRadialGradient(cx - rr * 0.3, cy - rr * 0.4, rr * 0.1, cx, cy, rr); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, light); g.addColorStop(1, mix(light, dark, 0.5)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy - s * 2, rr * 0.93, 0, 7); ctx.fill(); }
    ctx.restore();
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
  function hills(ctx, w, base, amp, top, bottomCol, opts = {}) {
    const { freq = 0.012, seed = 1, bottom = 640, dabs = 80, rim } = opts;
    ctx.save(); ridgePath(ctx, w, base, amp, freq, seed, bottom);
    const g = ctx.createLinearGradient(0, base - amp, 0, Math.min(bottom, base + 160)); g.addColorStop(0, top); g.addColorStop(1, bottomCol); ctx.fillStyle = g; ctx.fill();
    ctx.clip();
    // brush dabs give a gouache texture
    const r = rng(seed * 31);
    for (let i = 0; i < dabs; i++) { const x = r() * w, y = base - amp + r() * (bottom - base + amp); ctx.fillStyle = rgba(r() < 0.5 ? shade(top, 0.18) : shade(bottomCol, -0.15), 0.12 + r() * 0.1); ctx.beginPath(); ctx.ellipse(x, y, 6 + r() * 14, 2 + r() * 4, -0.2 + r() * 0.4, 0, 7); ctx.fill(); }
    if (rim) { ctx.strokeStyle = rgba(rim, 0.55); ctx.lineWidth = 3; ridgePath(ctx, w, base + 1.5, amp, freq, seed, bottom + 400); ctx.stroke(); }
    ctx.restore();
  }
  // golden god-rays from a point
  function rays(ctx, x, y, w, h, color = '#fff2c4', alpha = 0.18, n = 9, t = 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) { const a = Math.PI * 0.15 + (i / (n - 1)) * Math.PI * 0.7 + Math.sin(t * 0.4 + i) * 0.02, len = h * 1.4, spread = 0.035 + (i % 3) * 0.015;
      const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len); g.addColorStop(0, rgba(color, alpha)); g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a - spread) * len, y + Math.sin(a - spread) * len); ctx.lineTo(x + Math.cos(a + spread) * len, y + Math.sin(a + spread) * len); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  // water band with layered waves and sparkles
  function water(ctx, w, top, bottom, deep = '#1f5f7a', shallow = '#58b4c4', t = 0, opts = {}) {
    const { sparkle = '#fff6d8', waves = 6 } = opts;
    const g = ctx.createLinearGradient(0, top, 0, bottom); g.addColorStop(0, shallow); g.addColorStop(1, deep); ctx.fillStyle = g; ctx.fillRect(0, top, w, bottom - top);
    ctx.save(); ctx.beginPath(); ctx.rect(0, top, w, bottom - top); ctx.clip();
    for (let k = 0; k < waves; k++) { const y = top + (k + 0.5) * (bottom - top) / waves, a = 1.5 + k * 0.6; ctx.strokeStyle = rgba(shade(shallow, 0.35), 0.35 - k * 0.03); ctx.lineWidth = 1.4 + k * 0.25; ctx.beginPath();
      for (let x = -10; x <= w + 10; x += 4) { const yy = y + Math.sin(x * 0.05 + t * (1.2 + k * 0.1) + k * 2) * a; x === -10 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke(); }
    const r = rng(5); for (let i = 0; i < 40; i++) { const x = (r() * w + t * 8 * (r() - 0.5)) % w, y = top + r() * (bottom - top) * 0.7, s = Math.max(0, Math.sin(t * 3 + i * 1.7)); if (s > 0.6) { ctx.fillStyle = rgba(sparkle, (s - 0.6) * 2); ctx.fillRect(x - 3, y, 6, 1.2); } }
    ctx.restore();
  }

  // ---------- plants and props ----------
  function palm(ctx, x, y, s = 1, lean = 0.15, t = 0, col = '#3f8a4a') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    // trunk: segmented curved trunk
    ctx.strokeStyle = '#7a5434'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(lean * 60, -60, lean * 120, -120); ctx.stroke();
    ctx.strokeStyle = '#9a6e45'; ctx.lineWidth = 3; for (let i = 1; i < 10; i++) { const tt = i / 10, px = lean * 120 * tt * tt + lean * 0 , py = -120 * tt; ctx.beginPath(); ctx.moveTo(px + lean * 60 * 2 * tt * (1 - tt) - 4.5, py); ctx.lineTo(px + lean * 60 * 2 * tt * (1 - tt) + 4.5, py - 2); ctx.stroke(); }
    const tx = lean * 120, ty = -120, sway = Math.sin(t * 1.3) * 0.05;
    for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.42 + sway, len = 52 + (i % 2) * 10; ctx.save(); ctx.translate(tx, ty); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, shade(col, -0.25)); g.addColorStop(1, shade(col, 0.15)); ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -14, len, 10); ctx.quadraticCurveTo(len * 0.5, 4, 0, 0); ctx.fill();
      ctx.strokeStyle = shade(col, -0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -6, len, 10); ctx.stroke(); ctx.restore(); }
    ctx.fillStyle = '#6b4226'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(tx - 5 + i * 5, ty + 5, 4, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // round olive / fig tree with leafy clusters
  function tree(ctx, x, y, s = 1, col = '#5f8f4a', seed = 4) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#6e4a2e'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-3, -30, -10, -55); ctx.lineTo(10, -55); ctx.quadraticCurveTo(3, -30, 6, 0); ctx.fill();
    const r = rng(seed); const blobs = [];
    for (let i = 0; i < 14; i++) blobs.push([(r() - 0.5) * 70, -70 + (r() - 0.5) * 40, 16 + r() * 14]);
    for (const [bx, by, br] of blobs) { ctx.fillStyle = shade(col, -0.3); ctx.beginPath(); ctx.arc(bx + 3, by + 4, br, 0, 7); ctx.fill(); }
    for (const [bx, by, br] of blobs) { const g = ctx.createRadialGradient(bx - br * 0.4, by - br * 0.5, 1, bx, by, br); g.addColorStop(0, shade(col, 0.3)); g.addColorStop(1, col); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br * 0.9, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function grassTufts(ctx, w, y0, y1, n, col = '#6aa34f', seed = 8) {
    const r = rng(seed); ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (y1 - y0), h = 6 + r() * 10, c = r() < 0.5 ? shade(col, 0.2) : shade(col, -0.15); ctx.strokeStyle = c; ctx.lineWidth = 1.6;
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + k * 3, y - h * 0.6, x + k * 5, y - h); ctx.stroke(); } }
    ctx.restore();
  }
  function flowers(ctx, w, y0, y1, n, cols = ['#f4d35e', '#ee6c8a', '#ffffff', '#b98ae0'], seed = 9) {
    const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = y0 + r() * (y1 - y0), c = cols[Math.floor(r() * cols.length)], s = 1.5 + r() * 1.8; ctx.fillStyle = c; for (let k = 0; k < 5; k++) { const a = k * 1.2566; ctx.beginPath(); ctx.arc(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.8, 0, 7); ctx.fill(); } ctx.fillStyle = '#f9b233'; ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, 7); ctx.fill(); }
  }
  function rock(ctx, x, y, s = 1, col = '#b89a7a') {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = rgba('#2a1830', 0.18); ctx.beginPath(); ctx.ellipse(2, 2, 26, 6, 0, 0, 7); ctx.fill();
    const g = ctx.createLinearGradient(-20, -30, 20, 0); g.addColorStop(0, shade(col, 0.25)); g.addColorStop(1, shade(col, -0.25)); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.quadraticCurveTo(-26, -18, -10, -26); ctx.quadraticCurveTo(6, -32, 18, -20); ctx.quadraticCurveTo(28, -8, 24, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(col, -0.4); ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  // mudbrick house with flat roof
  function house(ctx, x, y, w, h, col = '#e6c79a', opts = {}) {
    const { door = '#7a4b2e', window = true, awning } = opts;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = rgba('#2a1830', 0.18); ctx.fillRect(4, -2, w, 6);
    const g = ctx.createLinearGradient(0, -h, w, 0); g.addColorStop(0, shade(col, 0.15)); g.addColorStop(1, shade(col, -0.12)); ctx.fillStyle = g; ctx.fillRect(0, -h, w, h);
    ctx.fillStyle = shade(col, -0.2); ctx.fillRect(-3, -h - 6, w + 6, 7);
    ctx.fillStyle = shade(col, 0.3); ctx.fillRect(-3, -h - 6, w + 6, 2);
    ctx.fillStyle = door; const dw = Math.min(16, w * 0.3); ctx.beginPath(); ctx.moveTo(w * 0.5 - dw / 2, 0); ctx.lineTo(w * 0.5 - dw / 2, -h * 0.42); ctx.arc(w * 0.5, -h * 0.42, dw / 2, Math.PI, 0); ctx.lineTo(w * 0.5 + dw / 2, 0); ctx.fill();
    if (window) { ctx.fillStyle = '#4a2e22'; ctx.fillRect(w * 0.14, -h * 0.75, 9, 9); ctx.fillStyle = '#ffd98a'; ctx.globalAlpha = 0.8; ctx.fillRect(w * 0.14 + 1.5, -h * 0.75 + 1.5, 6, 6); ctx.globalAlpha = 1; }
    if (awning) { ctx.fillStyle = awning; ctx.beginPath(); ctx.moveTo(w * 0.62, -h * 0.55); ctx.lineTo(w + 8, -h * 0.55); ctx.lineTo(w + 4, -h * 0.4); ctx.lineTo(w * 0.62 + 4, -h * 0.4); ctx.fill(); ctx.fillStyle = rgba('#ffffff', 0.35); for (let i = 0; i < 4; i++) ctx.fillRect(w * 0.62 + 2 + i * ((w * 0.38 + 6) / 4), -h * 0.55, (w * 0.38 + 6) / 8, 15); }
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
    const arm = { down: [[-13, bodyTop + 26], [13, bodyTop + 26]], up: [[-15, bodyTop - 16], [15, bodyTop - 16]], wave: [[-13, bodyTop + 26], [17, bodyTop - 14 + Math.sin(t * 10) * 4]], out: [[-21, bodyTop + 10], [21, bodyTop + 10]], hold: [[-7, bodyTop + 18], [7, bodyTop + 18]], cheer: [[-17, bodyTop - 12], [17, bodyTop - 12]], reach: [[-12, bodyTop + 24], [22, bodyTop + 2]], pray: [[-2, bodyTop + 10], [2, bodyTop + 10]], raise: [[-13, bodyTop + 26], [17, bodyTop - 14]] }[o.arms || 'down'];
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
    limb(ctx, -sx, shoulderY, arm[0][0], arm[0][1], 5.5, shade(robe, 0.05), outline);
    limb(ctx, sx, shoulderY, arm[1][0], arm[1][1], 5.5, shade(robe, 0.05), outline);
    ctx.fillStyle = skin; ctx.strokeStyle = skinLine; ctx.lineWidth = 1.2;
    for (const [hx, hy] of arm) { ctx.beginPath(); ctx.arc(hx, hy, 3.6, 0, 7); ctx.fill(); ctx.stroke(); }
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
    if (true) { ctx.fillStyle = skin; for (const ex2 of [-headR + 0.5, headR - 0.5]) { ctx.beginPath(); ctx.ellipse(ex2, headY + 2, 3, 4, 0, 0, 7); ctx.fill(); ctx.stroke(); } }
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
