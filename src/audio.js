// audio.js — Holy Moly! sound: pre-rendered music tracks (MUSIC_TRACKS), a procedural microgame
// groove with a lookahead scheduler, little musical jingles, synthesized sound effects and
// Animal-Crossing-style babble. Every synth function takes a graph G (built for a live or an
// offline AudioContext) and an absolute start time, so anything can be rendered offline for tests.
// All public calls fail silently when Web Audio is missing.
const AUD = (() => {
  'use strict';
  const AC = window.AudioContext || window.webkitAudioContext;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const VOL = { music: .45, groove: .35, jingle: .55, sfx: .62, voice: .5 }; // bus levels
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  // note name -> midi ("C4" = 60, "Bb3", "F#5")
  const NM = s => { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };

  // ---------- graph: buses -> master (mute) -> compressor -> soft clip -> destination ----------
  function softClip() { // linear up to 0.6, then eases toward 0.98 (a gentle safety net)
    const n = 2048, c = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1, a = Math.abs(x); c[i] = Math.sign(x) * (a < .6 ? a : .6 + .38 * Math.tanh((a - .6) / .38)); }
    return c;
  }
  function makeIR(ctx, secs) { // stereo noise tail that darkens as it decays
    const sr = ctx.sampleRate, len = Math.floor(sr * secs), b = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch); let y = 0;
      for (let i = 0; i < len; i++) {
        const k = i / len, x = (Math.random() * 2 - 1) * Math.pow(1 - k, 3);
        y += (.85 - .7 * k) * (x - y); d[i] = y * (i < sr * .008 ? i / (sr * .008) : 1);
      }
    }
    return b;
  }
  function makeGraph(ctx, dest) {
    const G = { ctx, sr: ctx.sampleRate, cache: {} };
    G.master = ctx.createGain();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = .004; comp.release.value = .2;
    const clip = ctx.createWaveShaper(); clip.curve = softClip();
    G.master.connect(comp); comp.connect(clip); clip.connect(dest);
    // light reverb: high-passed send -> generated impulse response -> master
    G.revIn = ctx.createGain();
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 220;
    const conv = ctx.createConvolver(); conv.buffer = makeIR(ctx, 2.2);
    const wet = ctx.createGain(); wet.gain.value = .32;
    G.revIn.connect(hp); hp.connect(conv); conv.connect(wet); wet.connect(G.master);
    for (const k in VOL) { const g = ctx.createGain(); g.gain.value = VOL[k]; g.connect(G.master); G[k] = g; }
    return G;
  }
  // a "port" is a dry gain to a bus plus a matching reverb send, so fading it also fades the reverb feed
  function port(G, bus, v = 1) {
    const d = G.ctx.createGain(), r = G.ctx.createGain(); d.gain.value = v; r.gain.value = v;
    d.connect(bus); r.connect(G.revIn); return { d, r };
  }
  function fadePort(G, p, secs) {
    const now = G.ctx.currentTime;
    for (const g of [p.d.gain, p.r.gain]) { g.cancelScheduledValues(now); g.setValueAtTime(g.value, now); g.setTargetAtTime(0, now, secs / 3); }
    setTimeout(() => { try { p.d.disconnect(); p.r.disconnect(); } catch (e) {} }, secs * 1000 + 1500);
  }

  // ---------- building blocks ----------
  function noiseBuf(G) {
    if (!G.cache.noise) { const n = G.sr * 2, b = G.ctx.createBuffer(1, n, G.sr), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; G.cache.noise = b; }
    return G.cache.noise;
  }
  function pwave(G, kind) { // softened waveforms (no harsh raw squares)
    const key = 'pw' + kind; if (G.cache[key]) return G.cache[key];
    const n = 28, re = new Float32Array(n), im = new Float32Array(n);
    for (let h = 1; h < n; h++) {
      im[h] = kind === 'soft' ? (h % 2 ? Math.exp(-h / 8) / h : 0)       // rounded square
        : kind === 'ssaw' ? Math.exp(-h / 13) / h                         // mellow saw
        : kind === 'reed' ? (h % 2 ? 1 : .4) * Math.exp(-h / 10) / h       // nasal, for voices
        : ([0, 1, .45, .3, .12, .15, 0, 0, .08][h] || 0);                  // organ
    }
    return (G.cache[key] = G.ctx.createPeriodicWave(re, im));
  }
  function osc(G, type, f, t) {
    const o = G.ctx.createOscillator();
    if (/^(sine|triangle|square|sawtooth)$/.test(type)) o.type = type; else o.setPeriodicWave(pwave(G, type));
    o.frequency.setValueAtTime(f, t); return o;
  }
  // envelope: perc mode (o.dec = decay time constant) or sustain mode (attack, hold to o.dur, release o.r)
  function envelope(G, o, v) {
    const e = G.ctx.createGain(), g = e.gain, t = o.t, a = o.a == null ? .005 : o.a;
    g.setValueAtTime(0, t); g.linearRampToValueAtTime(v, t + a);
    let end;
    if (o.dec) { g.setTargetAtTime(0, t + a, o.dec); end = t + a + o.dec * 7; }
    else {
      const hold = Math.max(o.dur || .2, a + .001), r = o.r == null ? .08 : o.r;
      if (o.s != null && o.s < 1) g.setTargetAtTime(v * o.s, t + a, o.dk || .1);
      g.setTargetAtTime(0, t + hold, r / 3); end = t + hold + r * 2.2;
    }
    return [e, end + .02];
  }
  function route(G, node, o, end) { // -> optional pan -> port (dry + reverb send)
    let n = node;
    if ((o.pan || o.panTo) && G.ctx.createStereoPanner) {
      const p = G.ctx.createStereoPanner(); p.pan.setValueAtTime(o.pan || 0, o.t);
      if (o.panTo != null) p.pan.linearRampToValueAtTime(o.panTo, end); n.connect(p); n = p;
    }
    n.connect(o.dest.d);
    if (o.rev) { const s = G.ctx.createGain(); s.gain.value = o.rev; n.connect(s); s.connect(o.dest.r); }
  }
  function lfo(G, t, end, rate, depth, param, fade) { // sine LFO added to an AudioParam
    const l = G.ctx.createOscillator(), g = G.ctx.createGain(); l.frequency.value = rate;
    g.gain.setValueAtTime(fade && fade.delay ? 0 : depth, t);
    if (fade && fade.delay) g.gain.linearRampToValueAtTime(depth, t + fade.delay);
    if (fade && fade.dec) g.gain.setTargetAtTime(0, t, fade.dec);
    l.connect(g); g.connect(param); l.start(t); l.stop(end);
  }
  function freqPath(param, o, f) { // pitch glide: f2/glide or pts [[dt,f],...]
    if (o.pts) o.pts.forEach(([dt, ff], i) => { if (i) param.exponentialRampToValueAtTime(Math.max(ff, 1), o.t + dt); });
    else if (o.f2) param.exponentialRampToValueAtTime(Math.max(o.f2, 1), o.t + (o.glide || o.dur || .1));
  }
  function tremolo(G, o, node, end) { // amplitude wobble for growls and bleats
    if (!o.trem) return node;
    const g = G.ctx.createGain(), depth = o.tremDepth == null ? .5 : o.tremDepth; g.gain.value = 1 - depth / 2;
    lfo(G, o.t, end, o.trem, depth / 2, g.gain); node.connect(g); return g;
  }
  // oscillator voice: o = {t,f,type,v,dur|dec,a,r,s,dk,f2,glide,pts,vib(cents),vibRate,vibDelay,vibDec,lp,lpTo,lpTime,q,det,trem,dest,rev,pan}
  function tone(G, o) {
    const c = G.ctx, f = o.pts ? o.pts[0][1] : o.f;
    const [e, end] = envelope(G, o, (o.v == null ? .3 : o.v) * (o.det ? .6 : 1));
    let head = e;
    if (o.lp) {
      const fl = c.createBiquadFilter(); fl.type = o.ftype || 'lowpass'; fl.Q.value = o.q || .7; fl.frequency.setValueAtTime(o.lp, o.t);
      if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, o.t + (o.lpTime || .2));
      fl.connect(e); head = fl;
    }
    for (const dc of (o.det ? [-o.det, o.det] : [0])) {
      const os = osc(G, o.type || 'sine', f, o.t); os.detune.value = dc; freqPath(os.frequency, o, f);
      if (o.vib) lfo(G, o.t, end, o.vibRate || 5.5, o.vib, os.detune, { delay: o.vibDelay, dec: o.vibDec });
      os.connect(head); os.start(o.t); os.stop(end);
    }
    route(G, tremolo(G, o, e, end), o, end); return end;
  }
  // filtered noise: o = {t,v,dur|dec,a,r,ftype,f,f2,glide,fpts,q,trem,dest,rev,pan}
  function noise(G, o) {
    const c = G.ctx, [e, end] = envelope(G, o, o.v == null ? .3 : o.v);
    const s = c.createBufferSource(); s.buffer = noiseBuf(G); s.loop = true;
    const fl = c.createBiquadFilter(); fl.type = o.ftype || 'bandpass'; fl.Q.value = o.q || 1;
    if (o.fpts) { fl.frequency.setValueAtTime(o.fpts[0][1], o.t); o.fpts.forEach(([dt, ff], i) => { if (i) fl.frequency.exponentialRampToValueAtTime(ff, o.t + dt); }); }
    else { fl.frequency.setValueAtTime(o.f || 1000, o.t); if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, o.t + (o.glide || o.dur || .1)); }
    s.connect(fl); fl.connect(e); s.start(o.t, Math.random() * 1.5); s.stop(end);
    route(G, tremolo(G, o, e, end), o, end); return end;
  }
  // two-operator FM for bells, marimba, music box: o = {t,f,ratio,index,idxDec,dec,v,a}
  function fm(G, o) {
    const c = G.ctx, t = o.t, [e, end] = envelope(G, { t, a: o.a || .002, dec: o.dec }, o.v == null ? .3 : o.v);
    const car = osc(G, 'sine', o.f, t), mod = osc(G, 'sine', o.f * o.ratio, t), mg = c.createGain(), depth = o.index * o.f * o.ratio;
    mg.gain.setValueAtTime(depth, t); mg.gain.setTargetAtTime(depth * (o.idxEnd || 0), t, o.idxDec || o.dec / 2);
    mod.connect(mg); mg.connect(car.frequency); car.connect(e);
    car.start(t); mod.start(t); car.stop(end); mod.stop(end);
    route(G, e, o, end); return end;
  }
  // Karplus-Strong plucked string (harp, oud); buffers cached per period, pitch fixed with playbackRate
  function ksBuffer(G, f, len, bright) {
    const sr = G.sr, P = Math.max(2, Math.round(sr / f)), w = f > 600 ? .2 : .5, key = 'ks' + P + '_' + len + '_' + bright;
    if (!G.cache[key]) {
      const N = Math.ceil(sr * len), b = G.ctx.createBuffer(1, N, sr), d = b.getChannelData(0), k = .15 + .85 * bright;
      let y = 0, mean = 0;
      for (let i = 0; i < P; i++) { y += k * ((Math.random() * 2 - 1) - y); d[i] = y; mean += y / P; }
      for (let i = 0; i < P; i++) d[i] -= mean;
      for (let i = P; i < N; i++) d[i] = .998 * ((1 - w) * d[i - P] + w * (d[i - P - 1] || 0));
      let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(d[i]));
      for (let i = 0; i < N; i++) d[i] *= .9 / (pk || 1);
      G.cache[key] = b;
    }
    return { buf: G.cache[key], rate: f * (P + w) / sr };
  }
  function ks(G, o) { // o = {t,f,v,len,bright,dec,body}
    const c = G.ctx, { buf, rate } = ksBuffer(G, o.f, o.len || 1.5, o.bright == null ? .6 : o.bright);
    const s = c.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate;
    const [e, end] = envelope(G, { t: o.t, a: .001, dec: o.dec || .8 }, o.v == null ? .3 : o.v);
    let head = s;
    if (o.body) { const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = o.body; pk.gain.value = 5; pk.Q.value = 1.2; s.connect(pk); head = pk; }
    head.connect(e); s.start(o.t); s.stop(Math.min(end, o.t + buf.duration / rate));
    route(G, e, o, end); return end;
  }
  // formant voice: buzzy source through three vowel band-passes (animals, crowd, babble)
  const VOW = { a: [800, 1200, 2600], e: [500, 1850, 2600], i: [320, 2300, 3000], o: [480, 850, 2500], u: [340, 760, 2300], m: [260, 900, 2300] };
  function fvoice(G, o) { // o = {t,dur,f|pts,vow:[[dt,'a'],...],fs,q,wave,v,a,r,vib,vibRate,trem}
    const c = G.ctx, t = o.t, f = o.pts ? o.pts[0][1] : o.f, fs = o.fs || 1, vow = o.vow || [[0, 'a']];
    const [e, end] = envelope(G, { t, a: o.a || .02, dur: o.dur, r: o.r || .06 }, (o.v == null ? .4 : o.v) * 2.4);
    const src = osc(G, o.wave || 'ssaw', f, t); freqPath(src.frequency, o, f);
    if (o.vib) lfo(G, t, end, o.vibRate || 6, o.vib, src.detune);
    const sum = c.createGain();
    [1, .55, .22].forEach((amp, k) => {
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = (o.q || 6) * (k ? 1.4 : 1);
      vow.forEach(([dt, vw], i) => { const F = VOW[vw][k] * fs; if (i) bp.frequency.linearRampToValueAtTime(F, t + dt); else bp.frequency.setValueAtTime(F, t); });
      const g = c.createGain(); g.gain.value = amp; src.connect(bp); bp.connect(g); g.connect(sum);
    });
    sum.connect(e); src.start(t); src.stop(end);
    route(G, tremolo(G, o, e, end), o, end); return end;
  }

  // ---------- drums (G, t, v, port) ----------
  const D = {
    kick: (G, t, v, d) => { tone(G, { t, f: 150, f2: 46, glide: .1, dec: .13, v: v * .9, dest: d }); tone(G, { t, f: 1200, type: 'triangle', dec: .005, v: v * .12, dest: d }); },
    snare: (G, t, v, d) => { noise(G, { t, f: 2200, q: .7, dec: .07, v: v * .55, dest: d, rev: .25 }); tone(G, { t, f: 210, f2: 170, glide: .05, type: 'triangle', dec: .04, v: v * .35, dest: d }); },
    hat: (G, t, v, d, open) => noise(G, { t, ftype: 'highpass', f: 7500, q: .5, dec: open ? .12 : .022, v: v * .45, dest: d, pan: .25 }),
    shaker: (G, t, v, d) => noise(G, { t, f: 6000, q: 1.2, a: .012, dec: .025, v: v * .5, dest: d, pan: -.2 }),
    clap: (G, t, v, d, pan = 0) => { for (let i = 0; i < 3; i++) noise(G, { t: t + i * .011, f: 1150, q: 1.4, dec: .006, v: v * .6, dest: d, pan }); noise(G, { t: t + .033, f: 1150, q: 1.2, dec: .06, v: v * .5, dest: d, rev: .3, pan }); },
    tom: (G, t, v, d, f = 140) => { tone(G, { t, f: f * 1.4, f2: f, glide: .12, dec: .14, v: v * .8, dest: d, rev: .15 }); noise(G, { t, ftype: 'lowpass', f: 900, dec: .03, v: v * .3, dest: d }); },
    timp: (G, t, v, d, f = 98) => { tone(G, { t, f: f * 1.08, f2: f, glide: .08, dec: .35, v: v * .8, dest: d, rev: .3 }); tone(G, { t, f: f * 1.5, dec: .12, v: v * .2, dest: d }); noise(G, { t, ftype: 'lowpass', f: 400, dec: .05, v: v * .3, dest: d }); },
    crash: (G, t, v, d) => { noise(G, { t, ftype: 'highpass', f: 4200, q: .4, dec: .4, v: v * .3, dest: d, rev: .4 }); noise(G, { t, f: 7500, q: 1, dec: .25, v: v * .2, dest: d }); },
    tamb: (G, t, v, d) => { noise(G, { t, f: 7600, q: 7, dec: .06, v: v * .9, dest: d, pan: .3 }); noise(G, { t, f: 10500, q: 7, dec: .05, v: v * .7, dest: d, pan: .3 }); noise(G, { t, ftype: 'highpass', f: 6000, dec: .02, v: v * .3, dest: d, pan: .3 }); },
    block: (G, t, v, d, f = 1500) => { tone(G, { t, f, dec: .025, v: v * .6, dest: d, rev: .15 }); noise(G, { t, f: f * 1.6, q: 3, dec: .01, v: v * .2, dest: d }); },
    dum: (G, t, v, d) => { tone(G, { t, f: 115, f2: 78, glide: .1, dec: .16, v: v * .9, dest: d, rev: .15 }); noise(G, { t, ftype: 'lowpass', f: 350, dec: .03, v: v * .35, dest: d }); },
    tek: (G, t, v, d) => { noise(G, { t, f: 3200, q: 2, dec: .022, v: v * .7, dest: d, rev: .2, pan: .15 }); tone(G, { t, f: 680, dec: .015, v: v * .25, dest: d }); },
    zill: (G, t, v, d) => { fm(G, { t, f: 2350, ratio: 1.41, index: .6, dec: .4, v: v * .25, dest: d, rev: .4, pan: -.3 }); },
  };

  // ---------- pitched instruments (G, t, midi, durSec, v, port) ----------
  function brass(G, t, f, d, v, dest, rev) { // two detuned mellow saws with a bright "blat" at the start
    const c = G.ctx, [e, end] = envelope(G, { t, a: .02, dur: d, r: .09, s: .75, dk: .12 }, v * .6);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.5;
    lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(3200, t + .04); lp.frequency.setTargetAtTime(1500, t + .05, .12);
    for (const dc of [-6, 6]) { const o = osc(G, 'ssaw', f, t); o.detune.value = dc; lfo(G, t, end, 5.5, 9, o.detune, { delay: .2 }); o.connect(lp); o.start(t); o.stop(end); }
    lp.connect(e); route(G, e, { t, dest, rev }, end);
  }
  function wah(G, t, f, d, v, dest, bend) { // muted trumpet "wah" for the gentle fail jingle
    const c = G.ctx, [e, end] = envelope(G, { t, a: .03, dur: d, r: .12 }, v);
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(450, t); bp.frequency.linearRampToValueAtTime(1400, t + Math.min(.12, d * .4)); bp.frequency.setTargetAtTime(600, t + d * .5, d * .3);
    const o = osc(G, 'ssaw', f, t);
    if (bend) { o.frequency.setValueAtTime(f, t + d * .35); o.frequency.exponentialRampToValueAtTime(f * .89, t + d); lfo(G, t, end, 5.5, 35, o.detune, { delay: d * .3 }); }
    o.connect(bp); bp.connect(e); o.start(t); o.stop(end); route(G, e, { t, dest, rev: .2 }, end);
  }
  const I = {
    pulse: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), dur: d, type: 'soft', v, a: .005, s: .55, dk: .12, r: .07, lp: 4200, vib: 10, vibDelay: .18, dest, rev: .14 }),
    lead2: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), dur: d, type: 'ssaw', det: 7, v, a: .01, s: .7, dk: .2, r: .1, lp: 2300, vib: 12, vibDelay: .2, dest, rev: .2 }),
    brass: (G, t, m, d, v, dest) => brass(G, t, mtof(m), d, v, dest, .22),
    bell: (G, t, m, d, v, dest) => fm(G, { t, f: mtof(m), ratio: 3.5, index: 1.3, idxDec: .2, dec: .5, v, dest, rev: .4 }),
    mbox: (G, t, m, d, v, dest) => fm(G, { t, f: mtof(m), ratio: 4, index: .5, idxDec: .06, dec: .35, v, dest, rev: .4 }),
    vibes: (G, t, m, d, v, dest) => fm(G, { t, f: mtof(m), ratio: 4, index: .3, idxDec: .1, dec: .6, v, dest, rev: .35 }),
    marimba: (G, t, m, d, v, dest) => { fm(G, { t, f: mtof(m), ratio: 4, index: 1.4, idxDec: .02, dec: .18, v: v * .7, dest, rev: .2 }); tone(G, { t, f: mtof(m), dec: .22, v: v * .5, dest }); },
    harp: (G, t, m, d, v, dest) => ks(G, { t, f: mtof(m), len: 2, bright: .5, dec: 1, v, dest, rev: .4 }),
    oud: (G, t, m, d, v, dest) => ks(G, { t, f: mtof(m), len: 1.2, bright: .85, dec: .35, v, dest, rev: .22, body: 1100 }),
    bass: (G, t, m, d, v, dest) => { tone(G, { t, f: mtof(m), type: 'triangle', a: .004, dec: Math.min(.2, d * .7), v, dest }); tone(G, { t, f: mtof(m), a: .004, dec: Math.min(.25, d * .8), v: v * .55, dest }); },
    bass2: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), type: 'ssaw', a: .004, dec: .11, v, lp: 900, lpTo: 260, lpTime: .12, q: 2, dest }),
    sub: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), a: .02, dur: d, r: .12, v, dest }),
    stab: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), type: 'ssaw', det: 9, a: .004, dec: Math.min(.12, d), v, lp: 2600, lpTo: 700, lpTime: .12, dest, rev: .2 }),
    pad: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), type: 'ssaw', det: 10, a: .25, dur: d, r: .4, v, lp: 1100, dest, rev: .45 }),
    drone: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), type: 'reed', a: .2, dur: d, r: .25, v, lp: 700, dest, rev: .25 }),
    organ: (G, t, m, d, v, dest) => tone(G, { t, f: mtof(m), type: 'organ', a: .01, dur: d, r: .1, v, dest, rev: .3 }),
  };
  // play a list of [beat, 'C5 E5', lenBeats, vel?] with one instrument
  function seq(G, t0, B, inst, list, v, dest) {
    for (const [b, ns, len, vv] of list) for (const n of ns.split(' ')) I[inst](G, t0 + b * B, NM(n), len * B, v * (vv || 1), dest);
  }
  function hits(G, t0, B, drum, beats, v, dest) { for (const b of beats) D[drum](G, t0 + b * B, v, dest); }

  // ---------- jingles: [bpm, length in beats, score] ----------
  const JINGLES = {
    ready: [150, 4, (G, t, B, d) => { // "here comes the next one"
      seq(G, t, B, 'pulse', [[0, 'E5', .45], [.5, 'C5', .25], [1, 'G5', .45], [1.5, 'E5', .25], [2, 'A5', .3], [2.5, 'B5', .3], [3, 'C6', 1]], .34, d);
      seq(G, t, B, 'mbox', [[3, 'C7', 1]], .14, d);
      seq(G, t, B, 'bass', [[0, 'C3', .5], [1, 'G2', .5], [2, 'F2', .5], [2.5, 'G2', .5], [3, 'C3', 1]], .55, d);
      seq(G, t, B, 'stab', [[.5, 'E4 G4 C5', .2], [1.5, 'D4 G4 B4', .2], [2, 'F4 A4 C5', .2], [2.5, 'G4 B4 D5', .2], [3, 'E4 G4 C5', .5]], .12, d);
      hits(G, t, B, 'kick', [0, 1, 2, 3], .8, d); hits(G, t, B, 'snare', [1, 2.25, 2.5, 2.75], .45, d);
      hits(G, t, B, 'hat', [0, .5, 1, 1.5, 2, 2.5], .4, d); hits(G, t, B, 'crash', [3], .45, d);
    }],
    win: [160, 3.2, (G, t, B, d) => { // quick run up, then "ta-DAA"
      seq(G, t, B, 'pulse', [[0, 'C5', .25], [.25, 'E5', .25], [.5, 'G5', .25], [.75, 'B5', .25], [1, 'C6', .4], [1.5, 'G5', .3], [2, 'C6', 1.2]], .32, d);
      seq(G, t, B, 'brass', [[1, 'E5', .4], [1.5, 'D5', .3], [2, 'E5 G5', 1.2]], .2, d);
      seq(G, t, B, 'bass', [[0, 'C3', .5], [1, 'G2', .4], [1.5, 'B2', .4], [2, 'C3', 1.2]], .55, d);
      seq(G, t, B, 'bell', [[2, 'E6', 1], [2.25, 'G6', 1], [2.5, 'C7', 1]], .13, d);
      hits(G, t, B, 'kick', [0, 1, 2], .8, d); hits(G, t, B, 'snare', [1, 1.5], .4, d); hits(G, t, B, 'crash', [2], .45, d);
      hits(G, t, B, 'hat', [0, .25, .5, .75], .3, d);
    }],
    fail: [150, 3, (G, t, B, d) => { // gentle "wah wah wah waaah"
      const F = [[0, 'G4', .5], [.6, 'F#4', .5], [1.2, 'F4', .5], [1.8, 'E4', 1.15]];
      F.forEach(([b, n, l], i) => wah(G, t + b * B, mtof(NM(n)), l * B, .45, d, i === 3));
      seq(G, t, B, 'marimba', [[0, 'C3', .5], [.6, 'B2', .5], [1.2, 'Bb2', .5], [1.8, 'A2', 1]], .5, d);
      hits(G, t, B, 'block', [0, .6, 1.2], .3, d); hits(G, t, B, 'tom', [1.8], .35, d);
    }],
    speedup: [160, 4.8, (G, t, B, d) => { // rising run, key change up a step, "faster!"
      const run = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'].map((n, i) => [i * .25, n, .22]);
      seq(G, t, B, 'pulse', run.concat([[2, 'D6', .3], [2.5, 'A5', .3], [3, 'D6', 1.6]]), .3, d);
      seq(G, t, B, 'brass', [[2, 'F#5', .3], [2.5, 'F#5', .3], [3, 'D5 F#5 A5', 1.6]], .2, d);
      seq(G, t, B, 'bass', [[0, 'C3', .9], [1, 'E3', .9], [2, 'D3', .4], [2.5, 'A2', .4], [3, 'D3', 1.6]], .55, d);
      for (let i = 0; i < 8; i++) D.snare(G, t + i * .25 * B, .12 + i * .045, d);
      hits(G, t, B, 'kick', [0, 1, 2, 2.5, 3], .8, d); hits(G, t, B, 'crash', [3], .5, d);
      hits(G, t, B, 'hat', [3.5, 4, 4.5], .35, d);
      noise(G, { t, f: 400, f2: 4000, glide: 3 * B, q: 3, a: 2.5 * B, dur: 2.9 * B, r: .1, v: .12, dest: d });
      seq(G, t, B, 'bell', [[3, 'D7', 1]], .12, d);
    }],
    grace: [100, 3.67, (G, t, B, d) => { // warm harp gliss, soft pad, bells: a gift
      ['F3', 'A3', 'C4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5', 'A5', 'C6', 'E6'].forEach((n, i) => I.harp(G, t + i * .1 * B, NM(n), 1, .36, d));
      seq(G, t, B, 'pad', [[0, 'F3 A3 C4 E4', 3.3]], .07, d);
      seq(G, t, B, 'sub', [[0, 'F2', 3.3]], .28, d);
      seq(G, t, B, 'bell', [[1.3, 'C6', 1], [1.8, 'A5', 1], [2.3, 'F6', 1.4]], .2, d);
      seq(G, t, B, 'mbox', [[2.3, 'C7', 1], [2.55, 'A6', 1], [2.8, 'F6', 1], [3.05, 'C7', 1]], .1, d);
      noise(G, { t: t + 1.2 * B, ftype: 'highpass', f: 7000, a: .4, dur: 1.2 * B, r: .5, v: .04, trem: 11, dest: d, rev: .6 });
    }],
    gameover: [96, 4, (G, t, B, d) => { // sweet "amen"-flavored cadence, IV - V - I
      seq(G, t, B, 'vibes', [[0, 'A5', .5], [.5, 'G5', .5], [1, 'F5', .5], [1.5, 'D5', .5], [2, 'E5', .5], [2.5, 'G5', .5], [3, 'F5', 1.5]], .32, d);
      [[0, ['F3', 'A3', 'C4', 'F4']], [1, ['Bb3', 'D4', 'F4']], [2, ['C4', 'E4', 'G4', 'Bb4']], [3, ['F3', 'A3', 'C4', 'F4', 'A4']]]
        .forEach(([b, ns]) => ns.forEach((n, i) => I.harp(G, t + (b + i * .06) * B, NM(n), 1, .16, d)));
      seq(G, t, B, 'pad', [[0, 'A3 C4', 1], [1, 'Bb3 D4', 1], [2, 'G3 C4', 1], [3, 'A3 C4 F4', 1.4]], .05, d);
      seq(G, t, B, 'bass', [[0, 'F2', .9], [1, 'Bb2', .9], [2, 'C3', .9], [3, 'F2', 1.5]], .5, d);
      seq(G, t, B, 'mbox', [[3.25, 'C7', 1], [3.5, 'F7', 1]], .08, d);
    }],
    stagestart: [132, 4.4, (G, t, B, d) => { // trumpet fanfare with timpani
      const T = 1 / 3;
      seq(G, t, B, 'brass', [[0, 'G4', T], [T, 'G4', T], [2 * T, 'G4', T], [1, 'C5', .9], [2, 'G4', .45], [2.5, 'C5', .45], [3, 'E5', 1.4]], .4, d);
      seq(G, t, B, 'brass', [[1, 'E4', .9], [2, 'E4', .45], [2.5, 'G4', .45], [3, 'G4 C5', 1.4]], .22, d);
      seq(G, t, B, 'pulse', [[3, 'G5', 1.4]], .14, d);
      seq(G, t, B, 'bass', [[0, 'G2', .3], [1, 'C3', .9], [2, 'G2', .9], [3, 'C3', 1.4]], .5, d);
      D.timp(G, t, .7, d, 98); D.timp(G, t + B, .8, d, 65); D.timp(G, t + 3 * B, .9, d, 65);
      hits(G, t, B, 'snare', [0, T, 2 * T, 2.5, 2.625, 2.75, 2.875], .4, d); hits(G, t, B, 'crash', [1, 3], .4, d);
      seq(G, t, B, 'bell', [[3, 'C7', 1], [3.17, 'G6', 1]], .12, d);
    }],
    cleared: [140, 5.83, (G, t, B, d) => { // big "level clear": run up, then bVI - bVII - I
      seq(G, t, B, 'pulse', [[0, 'G4', .45], [.5, 'C5', .45], [1, 'E5', .45], [1.5, 'G5', .45], [2, 'Eb5', .45], [2.5, 'Ab5', .45], [3, 'F5', .45], [3.5, 'Bb5', .45], [4, 'C6', 1.8]], .3, d);
      seq(G, t, B, 'brass', [[2, 'Ab4 C5 Eb5', .9], [3, 'Bb4 D5 F5', .9], [4, 'C5 E5 G5', 1.8]], .2, d);
      seq(G, t, B, 'brass', [[4, 'C6', 1.8]], .2, d);
      seq(G, t, B, 'bass', [[0, 'C3', .45], [.5, 'C3', .45], [1, 'G2', .45], [1.5, 'G2', .45], [2, 'Ab2', .9], [3, 'Bb2', .9], [4, 'C3', 1.8]], .55, d);
      hits(G, t, B, 'kick', [0, 1, 2, 3, 4], .8, d); hits(G, t, B, 'snare', [1, 3, 3.5, 3.625, 3.75, 3.875], .4, d);
      hits(G, t, B, 'hat', [0, .5, 1, 1.5, 2, 2.5, 3], .35, d); hits(G, t, B, 'crash', [2, 4], .45, d); D.timp(G, t + 4 * B, .9, d, 65);
      ['C7', 'G6', 'E6', 'C6', 'E6', 'G6', 'C7'].forEach((n, i) => I.bell(G, t + (4.1 + i * .15) * B, NM(n), 1, .1, d));
    }],
  };
  const speedFactor = s => 1 + .18 * (clamp(+s || 1, 1, 4) - 1); // speed 4 = x1.54, matching 110 -> 170 bpm
  function jingleLen(name, speed) { const j = JINGLES[name]; return j ? j[1] * 60 / (j[0] * speedFactor(speed)) : 0; }
  function playJingle(G, name, speed, t) {
    const j = JINGLES[name]; if (!j) return;
    const d = port(G, G.jingle, .62); j[2](G, t, 60 / (j[0] * speedFactor(speed)), d);
  }

  // ---------- groove: moods, an 8-bar generated melody, and a lookahead scheduler ----------
  const MA = [0, 4, 7], MI = [0, 3, 7];
  const MOODS = {
    bright: { root: 60, scale: [0, 2, 4, 7, 9], prog: [[0, MA], [7, MA], [9, MI], [5, MA]], lead: 'pulse', leadV: .26, dens: .55 },
    desert: { root: 62, scale: [0, 1, 4, 5, 7, 8, 10], prog: [[0, MA], [1, MA], [10, MI], [0, MA]], lead: 'oud', leadV: .4, dens: .55, oct: -12 },
    sea: { root: 65, scale: [0, 2, 4, 7, 9], prog: [[0, MA], [9, MI], [5, MA], [7, MA]], lead: 'vibes', leadV: .2, dens: .35, swing: .12 },
    night: { root: 63, scale: [0, 2, 4, 7, 9], prog: [[0, [0, 4, 7, 11]], [9, [0, 3, 7, 10]], [5, [0, 4, 7, 11]], [7, MA]], lead: 'bell', leadV: .14, dens: .28, swing: .1, oct: 12 },
    storm: { root: 62, scale: [0, 2, 3, 5, 7, 8, 10], prog: [[0, MI], [8, MA], [5, MI], [7, MA, [0, 2, 3, 5, 7, 8, 11]]], lead: 'lead2', leadV: .2, dens: .42 },
    party: { root: 67, scale: [0, 2, 4, 7, 9], prog: [[0, MA], [5, MA], [9, MI], [7, MA]], lead: 'pulse', leadV: .24, dens: .55, oct: -12 },
  };
  // chord tones wrapped into [lo, lo+12)
  const voicing = (root, iv, lo) => iv.map(i => { let n = root + i; while (n < lo) n += 12; while (n >= lo + 12) n -= 12; return n; }).sort((a, b) => a - b);
  function seeded(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function makeMelody(M, rnd) { // 8 bars x 16 steps: motif A A A cadence, B B A cadence
    const rhythm = () => { const p = [0]; for (let s = 1; s < 16; s++) if (rnd() < (s % 4 === 0 ? .85 : s % 2 === 0 ? .5 : .14) * M.dens * 1.4) p.push(s); return p; };
    const motifs = [rhythm(), rhythm()], plan = [0, 0, 0, 'c', 1, 1, 0, 'c'], out = new Array(128).fill(null);
    const lo = M.root, hi = M.root + 14; let prev = M.root + 7;
    plan.forEach((pl, bar) => {
      const [cr, iv, sc] = M.prog[bar % 4], scale = sc || M.scale, ons = pl === 'c' ? [0, 4, 8] : motifs[pl];
      const chordT = [], scaleT = [];
      for (let n = lo; n <= hi; n++) { if (iv.some(i => (n - M.root - cr - i) % 12 === 0)) chordT.push(n); if (scale.includes(((n - M.root) % 12 + 12) % 12)) scaleT.push(n); }
      ons.forEach((s, i) => {
        const next = i + 1 < ons.length ? ons[i + 1] : 16, last = pl === 'c' && i === ons.length - 1;
        let cand = (s % 4 === 0 || last) ? chordT : scaleT;
        if (last) cand = chordT.filter(n => (n - M.root - cr) % 12 === 0);
        const target = prev + (rnd() * 8 - 4) + (prev > hi - 3 ? -3 : prev < lo + 3 ? 3 : 0);
        let best = cand[0], bs = 1e9; for (const n of cand) { const sc2 = Math.abs(n - target) + rnd() * 1.5; if (sc2 < bs) { bs = sc2; best = n; } }
        prev = best; out[bar * 16 + s] = { m: best, len: last ? 8 : Math.min(next - s, 4) };
      });
    });
    return out;
  }
  // per-mood accompaniment for one 16th step (melody is played by the scheduler)
  const STEP = {
    bright(G, r, bar, s, t, S, [cr, iv], d) {
      const R = r.M.root + cr;
      if (s === 0 || s === 8 || s === 10) D.kick(G, t, .8, d); if (s === 4 || s === 12) D.snare(G, t, .5, d); if (s % 2 === 0) D.hat(G, t, s % 4 ? .5 : .3, d);
      const bp = { 0: 0, 3: 12, 6: 7, 8: 0, 10: 12, 12: 7, 14: 12 }; if (bp[s] != null) I.bass(G, t, R - 24 + bp[s], S * 1.6, .45, d);
      if (s % 4 === 2) for (const n of voicing(R, iv, 60)) I.stab(G, t, n, S, .07, d);
      if (bar % 4 === 3 && s >= 12) D.snare(G, t, .2 + .07 * (s - 12), d);
    },
    desert(G, r, bar, s, t, S, [cr, iv], d) {
      const R = r.M.root + cr;
      if (s === 0) { I.drone(G, t, r.M.root - 24, S * 16, .12, d); I.drone(G, t, r.M.root - 17, S * 16, .06, d); if (bar % 2 === 0) D.zill(G, t, .6, d); }
      if (s === 0 || s === 8) D.dum(G, t, .9, d); if (s === 2 || s === 6 || s === 12) D.tek(G, t, .6, d);
      if ((s === 4 || s === 10 || s === 14 || s === 15) && r.rnd() < .7) D.tek(G, t, .25, d);
      if (s % 2 === 1) D.tamb(G, t, .12, d);
      if (s === 0 || s === 6 || s === 12) I.oud(G, t, R - 24, S * 4, .38, d);
    },
    sea(G, r, bar, s, t, S, [cr, iv], d) {
      const R = r.M.root + cr, vc = voicing(R, iv, 57); vc.push(vc[0] + 12);
      if (s % 2 === 0) I.marimba(G, t, vc[[0, 1, 2, 3, 2, 1, 2, 1][s / 2]], S * 2, .3, d);
      if (s === 0 || s === 10) I.bass(G, t, R - 24 + (s ? 7 : 0), S * 4, .4, d);
      if (s === 0) D.kick(G, t, .45, d); if (s === 12) D.block(G, t, .35, d, 1100);
      if (s % 2 === 0) D.shaker(G, t, s % 4 ? .4 : .22, d);
    },
    night(G, r, bar, s, t, S, [cr, iv], d) {
      const R = r.M.root + cr, vc = voicing(R, iv, 60);
      if (s === 0) { for (const n of vc) I.pad(G, t, n, S * 15, .045, d); I.sub(G, t, R - 24, S * 15, .25, d); }
      if (s === 0 || s === 3 || s === 6 || s === 10) I.mbox(G, t, vc[(s / 3 | 0) % vc.length] + 12, S, .1, d);
      if (s === 0) D.kick(G, t, .35, d); if (s === 4 || s === 12) D.shaker(G, t, .25, d);
    },
    storm(G, r, bar, s, t, S, [cr, iv], d) {
      const R = r.M.root + cr;
      if ([0, 2, 3, 4, 6, 8, 10, 11, 12, 14].includes(s)) I.bass2(G, t, R - 24 + (s === 3 || s === 11 ? 12 : 0), S, .4, d);
      if (s === 0 || s === 3 || s === 8 || s === 11) D.kick(G, t, .8, d); if (s === 4 || s === 12) D.snare(G, t, .5, d);
      D.hat(G, t, s % 2 ? .12 : .25, d);
      if (s === 6) D.tom(G, t, .5, d, 110); if (s === 14 && bar % 2) D.tom(G, t, .45, d, 150);
      if (s === 0 && bar % 2 === 0) D.timp(G, t, .5, d, mtof(r.M.root - 24));
      if (s === 0 || s === 7) for (const n of voicing(R, iv, 55)) I.stab(G, t, n, S * 2, .06, d);
      if (bar % 4 === 3 && s >= 8) D.tom(G, t, .3 + .03 * (s - 8), d, [180, 160, 140, 120][s % 4]);
    },
    party(G, r, bar, s, t, S, [cr, iv], d) {
      const R = r.M.root + cr;
      if (s % 4 === 0) D.kick(G, t, .85, d); if (s === 4 || s === 12) D.clap(G, t, .55, d);
      if (s % 4 === 2) D.hat(G, t, .3, d, true); else D.hat(G, t, .14, d); if (s % 2 === 1) D.tamb(G, t, .14, d);
      if (s % 2 === 0) I.bass(G, t, R - 24 + (s % 4 ? 12 : 0), S * 1.6, .42, d);
      if (s === 3 || s === 6 || s === 11 || s === 14) for (const n of voicing(R, iv, 60)) I.stab(G, t, n, S, .06, d);
      if (bar % 4 === 3 && s >= 12) D.clap(G, t, .25, d, s % 2 ? .3 : -.3);
    },
  };
  function newRun(G, mood, bpm, t) {
    const M = MOODS[mood] || MOODS.bright, seed = (Math.random() * 1e9) >>> 0, rnd = seeded(seed);
    return { G, M, step: STEP[MOODS[mood] ? mood : 'bright'], mood, bpm: clamp(bpm || 110, 60, 220), nextBpm: null, bar: 0, s: 0, time: t, rnd, mel: makeMelody(M, rnd), out: port(G, G.groove, .5) };
  }
  function scheduleStep(r) { // schedule the current 16th step at r.time (plus swing), then advance
    const G = r.G, M = r.M, S = 60 / r.bpm / 4, t = r.time + (r.s % 2 ? (M.swing || 0) * S : 0), ch = M.prog[r.bar % 4];
    r.step(G, r, r.bar, r.s, t, S, ch, r.out);
    const n = r.mel[(r.bar % 8) * 16 + r.s];
    if (n) {
      const m = n.m + (M.oct || 0);
      I[M.lead](G, t, m, n.len * S * .9, M.leadV, r.out);
      if (M.lead === 'oud' && n.len >= 4) for (let k = 2; k < n.len; k += 1) I.oud(G, t + k * S, m, S, M.leadV * .45, r.out); // oud tremolo
      if (r.mood === 'bright' && n.len >= 2) I.mbox(G, t, m + 12, S, .05, r.out);                                         // glockenspiel sparkle
    }
    r.time += S; r.s++;
    if (r.s === 16) { r.s = 0; r.bar++; if (r.nextBpm) { r.bpm = r.nextBpm; r.nextBpm = null; } }
  }

  // ---------- sound effects: each gets a kit k with helpers that take dt (offset) and default the port ----------
  const SFX = {
    tap: k => { k.tone({ f: 1050 * k.p, f2: 1450 * k.p, glide: .025, type: 'triangle', dec: .03, v: .45 }); k.noise({ ftype: 'highpass', f: 4000, dec: .005, v: .12 }); },
    pop: k => { k.tone({ f: 380 * k.p, f2: 1300 * k.p, glide: .05, dec: .045, v: .6 }); k.noise({ f: 1600, dec: .008, v: .2 }); },
    whoosh: k => { k.noise({ f: 300, f2: 2000, glide: .3, q: 1.4, a: .16, dur: .2, r: .22, v: .9, pan: -.5, panTo: .5 }); },
    swoosh: k => { k.noise({ f: 1400 * k.p, f2: 5000 * k.p, glide: .14, q: 2, a: .04, dur: .1, r: .08, v: .7, pan: .4, panTo: -.4 }); },
    splash: k => {
      k.noise({ ftype: 'lowpass', f: 3500, f2: 500, glide: .4, a: .005, dec: .16, v: .55 }); k.noise({ f: 1200, q: .8, a: .01, dec: .25, v: .25, rev: .3 });
      for (let i = 0; i < 6; i++) { const f = rand(900, 1900) * k.p; k.tone({ dt: rand(.05, .45), f, f2: f * 1.7, glide: .04, dec: .035, v: .18, pan: rand(-.6, .6), rev: .3 }); }
    },
    drip: k => { k.tone({ f: 650 * k.p, f2: 1600 * k.p, glide: .06, dec: .05, v: .5, rev: .45 }); k.tone({ dt: .09, f: 1500 * k.p, f2: 2300 * k.p, glide: .03, dec: .025, v: .14, rev: .5 }); },
    bubble: k => { for (let i = 0; i < 3; i++) { const f = (480 + i * 130 + rand(-30, 30)) * k.p; k.tone({ dt: i * .085, f, f2: f * 2.1, glide: .05, dec: .035, v: .35, rev: .3 }); } },
    chime: k => { const ns = [84, 86, 88, 91, 93, 96]; for (let i = 0; i < 5; i++) k.fm({ dt: i * .09 + rand(0, .03), f: mtof(pick(ns)) * k.p, ratio: 2.76, index: .7, dec: .35, v: .15, pan: rand(-.6, .6), rev: .55 }); },
    sparkle: k => {
      const ns = [84, 86, 88, 91, 93, 96, 98, 100, 103];
      for (let i = 0; i < 8; i++) k.tone({ dt: i * .045, f: mtof(ns[Math.min(8, i + (Math.random() * 2 | 0))]) * k.p, type: 'triangle', dec: .09, v: .17, pan: i % 2 ? .4 : -.4, rev: .55 });
      k.noise({ ftype: 'highpass', f: 8000, a: .05, dur: .25, r: .2, v: .04, rev: .5 });
    },
    ding: k => { k.fm({ f: mtof(88) * k.p, ratio: 3.5, index: 1.1, idxDec: .15, dec: .4, v: .42, rev: .4 }); k.tone({ f: mtof(100) * k.p, dec: .2, v: .08 }); },
    boing: k => { k.tone({ f: 140 * k.p, f2: 380 * k.p, glide: .35, type: 'triangle', a: .003, dec: .16, v: .6, vib: 350, vibRate: 13, vibDec: .2 }); },
    thud: k => { k.tone({ f: 130 * k.p, f2: 45 * k.p, glide: .12, dec: .09, v: .85 }); k.noise({ ftype: 'lowpass', f: 450, dec: .04, v: .5 }); },
    coin: k => { k.tone({ f: mtof(83) * k.p, type: 'soft', dur: .07, r: .02, v: .3, lp: 6000 }); k.tone({ dt: .075, f: mtof(88) * k.p, type: 'soft', dec: .17, v: .3, lp: 6000, rev: .2 }); k.tone({ dt: .075, f: mtof(100) * k.p, dec: .1, v: .05 }); },
    sweep: k => { k.noise({ f: 3500, f2: 2400, q: .8, a: .1, dur: .1, r: .08, v: .35, pan: -.3 }); k.noise({ dt: .28, f: 2800, f2: 4200, q: .8, a: .1, dur: .1, r: .08, v: .35, pan: .3 }); },
    rustle: k => { for (let i = 0; i < 7; i++) k.noise({ dt: i * .045 + rand(0, .03), f: rand(2500, 4800), q: 1.2, dec: .025, v: rand(.3, .5), pan: rand(-.5, .5) }); k.noise({ ftype: 'highpass', f: 3000, a: .08, dur: .2, r: .1, v: .06 }); },
    crunch: k => { for (let i = 0; i < 10; i++) k.noise({ dt: i * .022 + rand(0, .01), f: rand(1200, 3600), q: 1.6, dec: .012, v: rand(.25, .6) }); k.noise({ ftype: 'lowpass', f: 900, dec: .06, v: .2 }); },
    munch: k => {
      for (const dt of [0, .22]) {
        k.fv({ dt, f: 230 * k.p, f2: 200 * k.p, dur: .1, vow: [[0, 'o'], [.08, 'm']], a: .012, r: .05, v: .45 });
        for (let i = 0; i < 4; i++) k.noise({ dt: dt + .02 + i * .02, f: rand(1500, 3000), q: 1.5, dec: .01, v: .3 });
      }
    },
    slurp: k => { k.noise({ fpts: [[0, 400], [.42, 2600]], q: 5, a: .03, dur: .38, r: .08, v: .6, trem: 24, tremDepth: .8 }); },
    baa: k => { k.fv({ pts: [[0, 370 * k.p], [.6, 315 * k.p]], vow: [[0, 'e'], [.1, 'a'], [.55, 'e']], dur: .6, a: .03, r: .12, v: .5, vib: 40, vibRate: 8, trem: 8, tremDepth: .55, q: 6, rev: .15 }); },
    coo: k => {
      k.tone({ pts: [[0, 400 * k.p], [.18, 450 * k.p]], dur: .18, a: .04, r: .08, v: .35, rev: .3 });
      k.tone({ dt: .3, pts: [[0, 470 * k.p], [.15, 540 * k.p], [.38, 430 * k.p]], dur: .36, a: .05, r: .1, v: .4, rev: .3 });
      k.tone({ dt: .78, pts: [[0, 410 * k.p], [.2, 380 * k.p]], dur: .2, a: .04, r: .1, v: .3, rev: .3 });
      k.noise({ ftype: 'lowpass', f: 700, a: .05, dur: .9, r: .1, v: .04 });
    },
    roar: k => {
      k.fv({ pts: [[0, 150 * k.p], [.25, 220 * k.p], [.85, 125 * k.p]], vow: [[0, 'o'], [.2, 'a'], [.8, 'o']], dur: .85, a: .06, r: .18, v: .55, q: 4, trem: 26, tremDepth: .5, rev: .2 });
      k.noise({ f: 650, q: .8, a: .1, dur: .6, r: .2, v: .12, trem: 26 });
    },
    honk: k => {
      k.fv({ pts: [[0, 300 * k.p], [.08, 620 * k.p], [.5, 570 * k.p], [.7, 430 * k.p]], vow: [[0, 'o'], [.08, 'e'], [.6, 'a']], fs: 1.2, q: 3, dur: .68, a: .02, r: .1, v: .45, vib: 45, vibRate: 9, rev: .25 });
      k.noise({ f: 1500, q: 1, a: .03, dur: .5, r: .1, v: .05 });
    },
    meow: k => { k.fv({ pts: [[0, 520 * k.p], [.18, 800 * k.p], [.6, 470 * k.p]], vow: [[0, 'i'], [.2, 'a'], [.45, 'o'], [.6, 'u']], fs: 1.15, dur: .6, a: .04, r: .1, v: .45, vib: 20, rev: .2 }); },
    bray: k => {
      for (const dt of [0, .66]) {
        k.fv({ dt, pts: [[0, 820 * k.p], [.24, 700 * k.p]], vow: [[0, 'i']], fs: 1.1, dur: .24, a: .02, r: .05, v: .4, trem: 38, tremDepth: .35 });
        k.fv({ dt: dt + .29, pts: [[0, 300 * k.p], [.3, 215 * k.p]], vow: [[0, 'a'], [.25, 'o']], dur: .3, a: .02, r: .07, v: .5, trem: 38, tremDepth: .35, rev: .15 });
      }
    },
    moo: k => { k.fv({ pts: [[0, 105 * k.p], [.3, 140 * k.p], [1, 95 * k.p]], vow: [[0, 'm'], [.15, 'u'], [.4, 'o'], [.9, 'u']], dur: 1, a: .08, r: .2, v: .65, q: 5, vib: 15, rev: .15 }); },
    ribbit: k => {
      k.fv({ pts: [[0, 150 * k.p], [.1, 130 * k.p]], vow: [[0, 'e']], dur: .1, a: .01, r: .03, v: .6, q: 4, trem: 55, tremDepth: .9 });
      k.fv({ dt: .17, pts: [[0, 175 * k.p], [.09, 150 * k.p]], vow: [[0, 'i']], dur: .09, a: .01, r: .03, v: .55, q: 4, trem: 55, tremDepth: .9 });
    },
    tweet: k => {
      for (let i = 0; i < 3; i++) k.tone({ dt: i * .1, pts: [[0, 2600 * k.p], [.06, 4200 * k.p]], dur: .055, a: .004, r: .02, v: .25, vib: 60, vibRate: 40, rev: .25 });
      k.tone({ dt: .34, pts: [[0, 4300 * k.p], [.24, 2900 * k.p]], dur: .22, a: .005, r: .04, v: .22, vib: 40, vibRate: 30, rev: .25 });
    },
    buzz: k => { k.tone({ pts: [[0, 200 * k.p], [.4, 245 * k.p], [.9, 190 * k.p]], type: 'ssaw', dur: .8, a: .15, r: .15, v: .3, lp: 1700, vib: 25, vibRate: 7, trem: 30, tremDepth: .3, pan: -.6, panTo: .6 }); },
    quack: k => {
      k.fv({ pts: [[0, 260 * k.p], [.18, 205 * k.p]], vow: [[0, 'a'], [.12, 'e']], fs: 1.4, q: 9, wave: 'reed', dur: .17, a: .008, r: .05, v: .65 });
      k.fv({ dt: .27, pts: [[0, 250 * k.p], [.14, 200 * k.p]], vow: [[0, 'a'], [.1, 'e']], fs: 1.4, q: 9, wave: 'reed', dur: .13, a: .008, r: .05, v: .45 });
    },
    drum: k => { k.tone({ f: 115 * k.p, f2: 68 * k.p, glide: .2, dec: .2, v: .8, rev: .2 }); k.tone({ f: 230 * k.p, dec: .04, v: .15 }); k.noise({ ftype: 'lowpass', f: 1000, dec: .03, v: .35 }); },
    tambourine: k => { [[0, .7], [.12, .5], [.24, .9]].forEach(([dt, v]) => D.tamb(k.G, k.t + dt, v, k.d)); },
    harp: k => { [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84, 86, 88].forEach((m, i) => k.ks({ dt: i * .045, f: mtof(m) * k.p, len: 2, bright: .5, dec: .9, v: .32, rev: .45 })); },
    trumpet: k => { brass(k.G, k.t, mtof(67) * k.p, .11, .45, k.d, .2); brass(k.G, k.t + .15, mtof(72) * k.p, .45, .45, k.d, .25); brass(k.G, k.t + .15, mtof(64) * k.p, .45, .22, k.d, .25); },
    horn: k => {
      k.fv({ pts: [[0, 225 * k.p], [.12, 262 * k.p], [.85, 262 * k.p], [1.1, 400 * k.p], [1.3, 392 * k.p]], vow: [[0, 'o'], [.15, 'a']], fs: .95, q: 3, wave: 'reed', dur: 1.3, a: .08, r: .15, v: .5, vib: 15, vibRate: 5, rev: .35 });
      k.noise({ f: 900, q: 1, a: .1, dur: 1.2, r: .15, v: .04 });
    },
    bell: k => { const f = mtof(67) * k.p; k.fm({ f, ratio: 1.4, index: 2.2, idxDec: .4, dec: .55, v: .3, rev: .5 }); k.fm({ f, ratio: 2.76, index: .5, dec: .35, v: .12, rev: .5 }); k.tone({ f: f / 2, dec: .6, v: .12 }); },
    clap: k => { D.clap(k.G, k.t, 2.2, k.d); k.noise({ dt: .03, ftype: 'lowpass', f: 600, dec: .02, v: .2 }); },
    cheer: k => {
      for (let i = 0; i < 12; i++) { const f = rand(230, 520) * k.p, dur = rand(.6, .9); k.fv({ dt: rand(0, .14), pts: [[0, f], [.15, f * 1.25], [dur, f * 1.05]], vow: [[0, 'e'], [.15, 'a'], [.45, 'i']], fs: rand(.95, 1.35), dur, a: .04, r: .15, v: .09, pan: rand(-.7, .7), rev: .3 }); }
      k.noise({ f: 1400, q: .6, a: .15, dur: .7, r: .4, v: .12, rev: .3 });
      for (let i = 0; i < 9; i++) D.clap(k.G, k.t + rand(.35, 1.3), rand(.15, .3), k.d, rand(-.7, .7));
    },
    laugh: k => {
      for (let i = 0; i < 5; i++) {
        k.noise({ dt: i * .13, f: 2200, q: 1, dur: .025, a: .005, r: .02, v: .06 });
        k.fv({ dt: i * .13 + .015, pts: [[0, (580 - i * 25) * k.p], [.08, (520 - i * 25) * k.p]], vow: [[0, i % 2 ? 'e' : 'i']], fs: 1.25, q: 5, dur: .075, a: .006, r: .04, v: .4 });
      }
    },
    rumble: k => { k.noise({ ftype: 'lowpass', f: 170, q: 1, a: .25, dur: .9, r: .5, v: .8, trem: 7, tremDepth: .35 }); k.tone({ f: 48 * k.p, a: .25, dur: .9, r: .5, v: .25 }); },
    wind: k => {
      k.noise({ fpts: [[0, 500], [.7, 1100], [1.6, 650]], q: 5, a: .45, dur: 1.1, r: .5, v: 1, pan: -.4, panTo: .4 });
      k.noise({ fpts: [[0, 300], [.9, 600], [1.6, 400]], q: 1.2, a: .5, dur: 1, r: .5, v: .4 });
    },
    rain: k => {
      k.noise({ ftype: 'highpass', f: 2500, a: .25, dur: 1.4, r: .4, v: .12 });
      for (let i = 0; i < 40; i++) k.noise({ dt: rand(0, 1.7), f: rand(2000, 6000), q: 3, dec: .01, v: rand(.1, .3), pan: rand(-.8, .8) });
    },
    thunder: k => {
      k.noise({ f: 1500, q: .5, a: .02, dec: .12, v: .35 });
      k.noise({ ftype: 'lowpass', f: 320, f2: 110, glide: 1.4, a: .06, dur: 1.2, r: .8, v: .75, trem: 5, tremDepth: .45, rev: .2 });
      k.tone({ f: 42, a: .08, dur: 1, r: .7, v: .25 });
    },
    wave: k => { k.noise({ ftype: 'lowpass', fpts: [[0, 300], [.7, 1800], [1.8, 400]], a: .7, dur: .9, r: .9, v: .55 }); k.noise({ ftype: 'highpass', f: 3000, a: .6, dur: .6, r: .6, v: .1 }); },
    fire: k => {
      k.noise({ ftype: 'lowpass', f: 500, a: .2, dur: 1.1, r: .4, v: .3, trem: 3, tremDepth: .4 });
      for (let i = 0; i < 25; i++) k.noise({ dt: rand(0, 1.4), ftype: 'highpass', f: 3000, dec: .005, v: rand(.1, .4), pan: rand(-.5, .5) });
      for (let i = 0; i < 4; i++) k.tone({ dt: rand(0, 1.3), f: rand(700, 1100), dec: .01, v: .15 });
    },
    magic: k => {
      [77, 81, 84, 88, 89, 93, 96, 100].forEach((m, i) => k.fm({ dt: i * .06, f: mtof(m) * k.p, ratio: 4, index: .5, idxDec: .06, dec: .4, v: .16, pan: i % 2 ? .35 : -.35, rev: .55 }));
      k.tone({ f: 600 * k.p, f2: 2400 * k.p, glide: .5, a: .1, dur: .4, r: .2, v: .06, rev: .5 });
      k.noise({ ftype: 'highpass', f: 7000, a: .2, dur: .5, r: .4, v: .07, trem: 12, rev: .5 });
    },
    stretch: k => { k.tone({ pts: [[0, 180 * k.p], [.5, 420 * k.p]], type: 'ssaw', dur: .5, a: .03, r: .08, v: .3, lp: 900, lpTo: 2600, lpTime: .5, vib: 60, vibRate: 9 }); },
    snap: k => { k.noise({ f: 2500, q: 1.5, dec: .01, v: .75 }); k.tone({ f: 1800 * k.p, dec: .007, v: .2 }); k.noise({ ftype: 'highpass', f: 6000, dec: .004, v: .2 }); },
    click: k => { k.noise({ ftype: 'highpass', f: 3500, dec: .004, v: .45 }); k.tone({ f: 2200 * k.p, type: 'triangle', dec: .007, v: .2 }); },
    fail: k => {
      k.tone({ pts: [[0, 300 * k.p], [.14, 280 * k.p]], type: 'soft', dur: .14, a: .01, r: .06, v: .32, lp: 1100, trem: 18, tremDepth: .3 });
      k.tone({ dt: .2, pts: [[0, 240 * k.p], [.25, 200 * k.p]], type: 'soft', dur: .25, a: .01, r: .08, v: .32, lp: 1000, trem: 18, tremDepth: .3 });
    },
    wrong: k => { k.tone({ f: 330 * k.p, dec: .06, v: .22, a: .01 }); k.tone({ dt: .1, f: 262 * k.p, dec: .1, v: .2, a: .01 }); },
    grow: k => {
      k.tone({ pts: [[0, 220 * k.p], [.6, 880 * k.p]], type: 'soft', dur: .6, a: .02, r: .1, v: .2, lp: 2500, trem: 16, tremDepth: .5 });
      [72, 76, 79, 84].forEach((m, i) => k.fm({ dt: i * .15, f: mtof(m) * k.p, ratio: 4, index: .5, dec: .25, v: .14, rev: .3 }));
    },
    shrink: k => {
      k.tone({ pts: [[0, 880 * k.p], [.55, 220 * k.p]], type: 'soft', dur: .55, a: .02, r: .1, v: .2, lp: 2500, trem: 16, tremDepth: .5 });
      [84, 79, 76, 72].forEach((m, i) => k.fm({ dt: i * .14, f: mtof(m) * k.p, ratio: 4, index: .5, dec: .2, v: .13, rev: .3 }));
    },
    flap: k => { for (let i = 0; i < 4; i++) { k.noise({ dt: i * .085, f: 750, q: .8, a: .01, dec: .04, v: .8 }); k.noise({ dt: i * .085, ftype: 'lowpass', f: 300, dec: .03, v: .3 }); } },
    stomp: k => { k.tone({ f: 95 * k.p, f2: 38 * k.p, glide: .15, dec: .11, v: .9 }); k.noise({ ftype: 'lowpass', f: 260, dec: .07, v: .6 }); k.noise({ f: 1800, dec: .015, v: .12 }); },
    splashbig: k => {
      k.tone({ f: 85, f2: 40, glide: .15, dec: .1, v: .5 });
      k.noise({ ftype: 'lowpass', f: 4000, f2: 400, glide: .9, a: .01, dec: .3, v: .6 }); k.noise({ f: 900, q: .5, a: .02, dec: .5, v: .3, rev: .35 });
      for (let i = 0; i < 14; i++) { const f = rand(800, 2000) * k.p; k.tone({ dt: rand(.1, 1), f, f2: f * 1.7, glide: .04, dec: .035, v: .16, pan: rand(-.8, .8), rev: .3 }); }
    },
  };
  function playSfx(G, name, t, o = {}) {
    const fn = SFX[name]; if (!fn) return;
    const d = port(G, G.sfx, clamp(o.vol == null ? 1 : +o.vol || 0, 0, 2));
    const at = h => x => h(G, Object.assign({ dest: d }, x, { t: t + (x.dt || 0) }));
    fn({ G, t, d, p: clamp(o.pitch || 1, .25, 4), tone: at(tone), noise: at(noise), fm: at(fm), fv: at(fvoice), ks: at(ks) });
  }

  // ---------- babble: one formant blip per syllable, vowels taken from the word ----------
  const VOICES = {
    woman: { f: 290, fs: 1.12, step: .075 }, man: { f: 145, fs: .95, step: .08 }, child: { f: 400, fs: 1.3, step: .066 },
    old: { f: 190, fs: 1, step: .095, vib: 35 }, dove: { f: 520, fs: 1.5, step: .085, coo: true },
  };
  function babblePlan(text, voice) {
    const P = VOICES[voice] || VOICES.woman, syl = [];
    const words = String(text == null ? '' : text).replace(/\[\[|\]\]/g, '').split(/\s+/).filter(Boolean).slice(0, 40);
    let t = 0;
    words.forEach((w, wi) => {
      const L = w.toLowerCase().replace(/[^a-z0-9]/g, '') || 'a', vows = L.match(/[aeiou]/g) || ['a'], n = clamp(Math.round(L.length / 3.2), 1, 3);
      for (let i = 0; i < n; i++) {
        const code = L.charCodeAt((i * 2) % L.length), q = i === n - 1 && /\?/.test(w), ex = i === n - 1 && /!/.test(w);
        const f = P.f * Math.pow(2, ((code % 7 - 3) * 1.3 - 1.5 * wi / Math.max(1, words.length)) / 12);
        syl.push({ t, f, up: q ? 1.28 : ex ? 1.12 : .93, v: vows[i % vows.length] });
        t += P.step;
      }
      t += /[,;:]$/.test(w) ? .14 : /[.!?]$/.test(w) ? .22 : .045;
    });
    return { syl, P, dur: t };
  }
  function playBabble(G, plan, t0) {
    const d = port(G, G.voice), P = plan.P;
    for (const s of plan.syl) {
      const t = t0 + s.t, dur = P.step * .85;
      if (P.coo) tone(G, { t, pts: [[0, s.f], [dur, s.f * s.up * 1.05]], dur, a: .015, r: .04, v: .32, dest: d, rev: .2 });
      else fvoice(G, { t, pts: [[0, s.f], [dur, s.f * s.up]], vow: [[0, s.v]], fs: P.fs, q: 5, dur, a: .008, r: .03, v: .3, vib: P.vib, dest: d, rev: .1 });
    }
  }

  // ---------- live state: context, music tracks, groove timer ----------
  let ac = null, G = null, unlocked = false, muted = false, wantTrack = null, wantBeat = null;
  const ok = () => !!(G && unlocked);
  const now = () => ac.currentTime + .01;
  function applyMute() { if (G) { const g = G.master.gain; g.cancelScheduledValues(ac.currentTime); g.setTargetAtTime(muted ? 0 : 1, ac.currentTime, .05); } }

  // music: tracks are decoded once into AudioBuffers and looped gaplessly; an <audio> element is the fallback
  const decoded = {}; let cur = null, mtoken = 0;
  function trackSrc(name, fmt) { try { const T = fmt === 'm4a' ? (typeof MUSIC_TRACKS_M4A !== 'undefined' ? MUSIC_TRACKS_M4A : null) : (typeof MUSIC_TRACKS !== 'undefined' ? MUSIC_TRACKS : window.MUSIC_TRACKS); return T && T[name]; } catch (e) { return null; } }
  // Ogg Opus first; older iPhone Safari can't decode it, so fall back to the AAC copy
  let oggOK = true;
  function decodeSrc(src) {
    return new Promise(res => {
      try {
        if (!src) return res(null);
        const bin = atob(src.slice(src.indexOf(',') + 1)), u = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
        const p = ac.decodeAudioData(u.buffer, b => res(b), () => res(null)); if (p && p.catch) p.catch(() => res(null));
      } catch (e) { res(null); }
    });
  }
  function loadTrack(name) {
    if (decoded[name]) return decoded[name];
    return (decoded[name] = (oggOK ? decodeSrc(trackSrc(name)) : Promise.resolve(null)).then(b => { if (b) return b; oggOK = false; return decodeSrc(trackSrc(name, 'm4a')); }));
  }
  function stopCur(secs) {
    if (!cur) return; const c = cur; cur = null;
    const g = c.g.gain, n = ac.currentTime; g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(0, n + secs);
    setTimeout(() => { try { if (c.src) c.src.stop(); if (c.el) c.el.pause(); c.g.disconnect(); } catch (e) {} }, secs * 1000 + 100);
  }
  function startTrack(name) {
    const my = ++mtoken; // cancels any track still decoding
    if (!name) { stopCur(1); return; }
    if (cur && cur.name === name) return;
    loadTrack(name).then(buf => {
      if (my !== mtoken || !G) return;
      const g = ac.createGain(), n = ac.currentTime; g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(1, n + 1.2); g.connect(G.music);
      const c = { name, g };
      try {
        if (buf) { c.src = ac.createBufferSource(); c.src.buffer = buf; c.src.loop = true; c.src.connect(g); c.src.start(n); }
        else { const s = trackSrc(name, 'm4a') || trackSrc(name); if (!s) return; c.el = new Audio(s); c.el.loop = true; ac.createMediaElementSource(c.el).connect(g); c.el.play().catch(() => {}); }
      } catch (e) { return; }
      stopCur(1.2); cur = c;
      setTimeout(() => { for (const k of ['title', 'results']) if (trackSrc(k)) loadTrack(k); }, 2500); // warm the other track
    });
  }

  // groove: a 25 ms timer schedules notes up to 120 ms ahead on the audio clock
  let run = null, timer = null;
  function tick() {
    if (!run) return;
    if (run.time < ac.currentTime - .05) run.time = ac.currentTime + .03; // fell behind (tab stalled): resync
    while (run.time < ac.currentTime + .12) scheduleStep(run);
  }
  function grooveStop(secs) {
    if (timer) { clearInterval(timer); timer = null; }
    if (run) { fadePort(G, run.out, secs); run = null; }
  }
  function grooveStart(mood, bpm) {
    grooveStop(.08); run = newRun(G, mood, bpm, ac.currentTime + .05); tick(); timer = setInterval(tick, 25);
  }

  function safe(fn, fallback) { return function () { try { return fn.apply(null, arguments); } catch (e) { return fallback; } }; }
  const api = {
    unlock: safe(() => {
      if (!AC) return;
      if (!ac) { ac = new AC({ latencyHint: 'interactive' }); G = makeGraph(ac, ac.destination); applyMute(); ac.onstatechange = () => { if (ac.state === 'running') go(); }; }
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {} // iOS: play even with the ringer switch on silent
      const b = ac.createBuffer(1, 1, ac.sampleRate), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); // iOS unlock
      function go() {
        if (unlocked) return; unlocked = true;
        if (wantTrack) startTrack(wantTrack);
        if (wantBeat) { grooveStart(wantBeat.mood, wantBeat.bpm); }
      }
      if (ac.state !== 'running') { const p = ac.resume(); if (p && p.then) p.then(() => { if (ac.state === 'running') go(); }, () => {}); } else go();
    }),
    music: safe(name => { wantTrack = name || null; if (ok()) startTrack(wantTrack); }),
    beat: safe((on, opts) => {
      const o = opts || {}, mood = MOODS[o.mood] ? o.mood : 'bright', bpm = clamp(+o.bpm || 110, 60, 220);
      if (!on) { wantBeat = null; if (ok()) grooveStop(.15); return; }
      wantBeat = { mood, bpm };
      if (!ok()) return;
      if (run && run.mood === mood) run.nextBpm = bpm; else grooveStart(mood, bpm);
    }),
    setTempo: safe(bpm => { const b = clamp(+bpm || 110, 60, 220); if (wantBeat) wantBeat.bpm = b; if (run) run.nextBpm = b; }),
    jingle: safe((name, speed = 1) => { const d = jingleLen(name, speed); if (d && ok()) playJingle(G, name, speed, now() + .02); return d; }, 0),
    sfx: (() => {
      const last = {};
      return safe((name, opts) => {
        if (!ok() || !SFX[name]) return;
        const n = ac.currentTime; if (last[name] && n - last[name] < .025) return; last[name] = n; // no stacking on rapid taps
        playSfx(G, name, now(), opts || {});
      });
    })(),
    babble: safe((text, voice) => { const plan = babblePlan(text, voice); if (ok()) playBabble(G, plan, now() + .02); return plan.dur; }, 0),
    mute: safe(on => { muted = !!on; applyMute(); }),
    get muted() { return muted; },
    pause: safe(() => { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); if (cur && cur.el) cur.el.pause(); }),
    resume: safe(() => { if (ac && unlocked && ac.state !== 'running') ac.resume().catch(() => {}); if (cur && cur.el) cur.el.play().catch(() => {}); }),
    // lists for tools and tests
    sfxNames: Object.keys(SFX), jingleNames: Object.keys(JINGLES), moods: Object.keys(MOODS), voices: Object.keys(VOICES),
    // test hook: render one sound into an OfflineAudioContext; kind = 'sfx' | 'jingle' | 'beat' | 'babble'
    _render(kind, name, opts = {}, secs = 3, sr = 44100) {
      try {
        if (!OAC) return Promise.resolve(null);
        const c = new OAC(2, Math.ceil(sr * secs), sr), g = makeGraph(c, c.destination), t = .05;
        if (kind === 'sfx') playSfx(g, name, t, opts);
        else if (kind === 'jingle') playJingle(g, name, opts.speed || 1, t);
        else if (kind === 'babble') playBabble(g, babblePlan(name, opts.voice), t);
        else if (kind === 'beat') { const r = newRun(g, name, opts.bpm || 110, t); while (r.time < secs) { if (opts.tempoAt && r.time >= opts.tempoAt && !r.tempoSet) { r.nextBpm = opts.tempo; r.tempoSet = 1; } scheduleStep(r); } }
        return c.startRendering();
      } catch (e) { return Promise.reject(e); }
    },
    _state: () => ({ ctx: ac ? ac.state : 'none', unlocked, muted, track: cur ? cur.name : null, wantTrack, groove: run ? { mood: run.mood, bpm: run.bpm, bar: run.bar } : null }),
  };
  return api;
})();
