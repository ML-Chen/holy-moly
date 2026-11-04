// page_helpers.js — injected into every test page before the game's own scripts (Playwright add_init_script).
// It only adds window.__hm; it never changes how the game behaves, except that Math.random is seeded so runs repeat exactly.
(() => {
  // ---- seeded Math.random (mulberry32), reset with __hm.seed(n) ----
  let s = 12345;
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  if (!/[?&]realrandom=1/.test(location.search)) Math.random = rnd;

  // ---- text capture: while __hm.tx is an array, every fillText records its text and its bounding box in device pixels ----
  const proto = CanvasRenderingContext2D.prototype, fill = proto.fillText, fillRect = proto.fillRect;
  // boot() renders the game canvas for the first time (test mode) or starts the frame loop; either way the first
  // fillRect on #game means the page has booted and loaded its save
  proto.fillRect = function () { if (window.__hm && !window.__hm.booted && this.canvas && this.canvas.id === 'game') window.__hm.booted = true; return fillRect.apply(this, arguments); };
  proto.fillText = function (text, x, y) {
    const rec = window.__hm && window.__hm.tx;
    if (rec) {
      try {
        const m = this.measureText(text), t = this.getTransform();
        const l = x - m.actualBoundingBoxLeft, r = x + m.actualBoundingBoxRight, tp = y - m.actualBoundingBoxAscent, bt = y + m.actualBoundingBoxDescent;
        const pts = [[l, tp], [r, tp], [l, bt], [r, bt]].map(([px, py]) => [t.a * px + t.c * py + t.e, t.b * px + t.d * py + t.f]);
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        rec.push({ text: String(text), font: this.font, align: this.textAlign, main: this.canvas && this.canvas.id === 'game', cw: this.canvas.width, ch: this.canvas.height,
          x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), alpha: this.globalAlpha,
          // the same box in the context's own (untransformed) coordinates
          lx0: l, lx1: r, ly0: tp, ly1: bt });
      } catch (e) { }
    }
    return fill.apply(this, arguments);
  };

  // ---- Web Audio node counter: proves sounds are really scheduled, not just that no exception was thrown ----
  window.__audioNodes = 0;
  const B = window.BaseAudioContext || window.AudioContext;
  if (B && B.prototype) for (const k of ['createOscillator', 'createBufferSource']) {
    const f = B.prototype[k]; if (typeof f === 'function') B.prototype[k] = function () { if (!(this instanceof (window.OfflineAudioContext || function () { }))) window.__audioNodes++; return f.apply(this, arguments); };
  }

  window.__hm = {
    tx: null, booted: false,
    seed(n) { s = n | 0; },
    // capture the texts drawn while fn runs; main-canvas boxes are converted to logical game coordinates (360x640)
    capture(fn) {
      const rec = []; window.__hm.tx = rec;
      try { fn(); } finally { window.__hm.tx = null; }
      for (const r of rec) if (r.main) {
        // eslint-disable-next-line no-undef
        const k = scale * DPR, ox = offX * DPR, oy = offY * DPR;
        r.gx0 = (r.x0 - ox) / k; r.gx1 = (r.x1 - ox) / k; r.gy0 = (r.y0 - oy) / k; r.gy1 = (r.y1 - oy) / k;
      }
      return rec;
    },
    // advance the run frame by frame and record every phase change. Stops at phase `until` (or when the run ends).
    drive(opts = {}) {
      const { until = 'over', maxFrames = 60 * 600, renderEvery = 3, dt = 1 / 60, stopAt = null } = opts;
      const ev = []; let ph = run && run.phase;
      for (let f = 0; f < maxFrames; f++) {
        // eslint-disable-next-line no-undef
        try { T += dt; step(dt); if (f % renderEvery === 0) render(); }
        catch (e) { ev.push({ f, phase: 'error', error: String(e && e.stack || e).slice(0, 400), i: run && run.i, loaves: run && run.loaves }); break; }
        if (!run) break;
        if (run.phase !== ph) {
          ph = run.phase;
          const e = { f, phase: ph, i: run.i, loaves: run.loaves, speed: run.speed, graceUsed: run.graceUsed, cleared: run.cleared };
          if (run.g) Object.assign(e, { id: run.g.def.id, result: run.g.result, dur: run.g.dur, time: run.g.def.time, level: run.g.level, winOnTimeout: !!run.g.def.winOnTimeout });
          ev.push(e); render();
          if (ph === until || ph === 'over') break;
          if (stopAt && stopAt.phase === ph && stopAt.i === run.i) break;
        }
      }
      return ev;
    },
  };
})();
