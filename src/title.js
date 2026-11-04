// title.js — the animated title screen painting (the engine draws the buttons on top).
function PANEL_TITLE(ctx, t) {
  const W = 360, H = 640, C = P.CLOTH, S = P.SKIN, HR = P.HAIR;
    P.sky(ctx, W, H, ['#3b2a6b', '#a8508a', '#f08a5d', '#ffd59a'], { x: 250, y: 300, r: 30, color: '#ffd38a', glow: 260 });
    P.stars(ctx, W, 200, 40, 4, t);
    P.cloud(ctx, 70, 150, 0.9, '#ffe6d6', '#c97aa0', 0.85); P.cloud(ctx, 290, 110, 0.7, '#ffe6d6', '#c97aa0', 0.8);
    P.rays(ctx, 250, 300, W, H, '#fff0c0', 0.16, 11, t);
    P.hills(ctx, W, 360, 50, '#b86a7a', '#7a4a6a', { seed: 3, freq: 0.01, dabs: 50 });
    // village on the far hill
    P.house(ctx, 40, 352, 34, 26, '#e7b98f'); P.house(ctx, 78, 346, 28, 30, '#f0c79c', { awning: C.teal }); P.house(ctx, 270, 350, 36, 24, '#e7b98f', { awning: C.rose }); P.house(ctx, 310, 356, 30, 28, '#dca77c');
    P.palm(ctx, 120, 360, 0.55, 0.2, t); P.palm(ctx, 250, 362, 0.5, -0.15, t, '#4a8a52');
    P.hills(ctx, W, 440, 40, '#e8a35e', '#c27a3e', { seed: 7, freq: 0.014, dabs: 90, rim: '#ffd9a0' });
    P.hills(ctx, W, 520, 30, '#d98a4a', '#a85f30', { seed: 11, freq: 0.018, dabs: 90, rim: '#ffcf8a' });
    P.flowers(ctx, W, 540, 640, 26, undefined, 3); P.grassTufts(ctx, W, 530, 640, 40, '#8a9a4a', 5);
    // title
    P.command(ctx, 'HOLY', 180, 96, 64, 1, { tilt: -0.07 }); P.command(ctx, 'MOLY!', 188, 160, 72, 1, { tilt: -0.07, fill2: '#ff9a5a' });
    // the welcoming crowd
    // a mixed crowd: people from the Bible standing with a modern mainline congregation
    const back = [
      [30, 572, { skin: S[2], robe: C.olive, stripe: C.cream, beard: '#e8e2da', hair: HR[5], head: 'wrap', expr: 'laugh', arms: 'wave' }],                                   // Noah
      [104, 568, { outfit: 'modern', skin: S[4], robe: '#3f8f8a', pants: '#3a3f5a', hairStyle: 'short', hair: HR[3], beard: true, expr: 'happy', arms: 'cheer' }],              // a dad
      [236, 572, { skin: S[1], robe: C.sand, stripe: C.terracotta, hairStyle: 'bun', hair: HR[2], expr: 'happy', arms: 'hold', hold: (c, x, y) => { c.fillStyle = '#e9c35a'; for (let i = -2; i <= 2; i++) { c.save(); c.translate(x + i * 3, y); c.rotate(i * 0.2); c.fillRect(-1, -22, 2, 22); c.restore(); } } }], // Ruth
      [314, 568, { skin: S[1], robe: C.saffron, stripe: C.rust, hairStyle: 'bald', beard: true, hair: HR[0], expr: 'wow', arms: 'cheer' }],                                     // Zacchaeus
    ];
    const front = [
      [34, 612, { outfit: 'modern', skin: S[2], robe: '#2a2a32', pants: '#2a2a32', skirt: true, collar: 'clergy', stole: '#3a9a5a', hairStyle: 'long', hair: HR[1], expr: 'laugh', arms: 'out' }], // a pastor
      [158, 616, { outfit: 'modern', skin: S[3], robe: '#e07a5a', pants: '#4a6aa0', hoodie: true, hairStyle: 'short', hair: HR[1], expr: 'laugh', arms: 'raise' }], // a teen with the pride flag
      [96, 612, { skin: S[2], robe: C.teal, stripe: C.saffron, hairStyle: 'curly', hair: HR[0], expr: 'laugh', arms: 'cheer' }],                                                // Miriam
      [228, 614, { outfit: 'modern', skin: S[1], robe: '#f2e6cf', pants: '#8a5a8a', skirt: true, cardigan: '#c96a7a', hairStyle: 'bun', hair: HR[5], glasses: true, expr: 'happy', arms: 'wave' }], // a grandma
      [290, 618, { outfit: 'modern', skin: S[4], robe: '#f2c23a', pants: '#3a7a5a', hairStyle: 'short', hair: HR[3], expr: 'wow', arms: 'cheer', child: true }],                   // a kid
    ];
    for (const [x, y, o] of back) P.person(ctx, x, y, 0.92, { ...o, t, phase: x });
    for (const [x, y, o] of front) P.person(ctx, x, y, 1.05, { ...o, t, phase: x });
    P.prideFlag(ctx, 186, 560, 1.05, t); // held up in the teen's raised hand
    P.sheep(ctx, 338, 634, 0.85, { t, facing: -1 }); P.dove(ctx, 92, 250, 1.1, { t: t + 0.2, branch: true });
    P.vignette(ctx, W, H, 0.3); P.grain(ctx, W, H, 0.07);
  }
