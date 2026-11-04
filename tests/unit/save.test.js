#!/usr/bin/env node
// Unit tests for the save logic (SAVE in src/engine.js), run with plain node: node tests/unit/save.test.js
// It lifts the `const SAVE = {...};` object out of engine.js (without running the rest of the engine) and drives it
// with a fake localStorage, a fake audio wrapper and a fake cloud database. Prints PASS/FAIL lines; exits 1 on failure.
'use strict';
const fs = require('fs'), path = require('path');
const saveMergeCases = require('./save_cases.js');
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'engine.js'), 'utf8');

// find `const SAVE = {` and its matching closing brace, skipping strings, template literals, regexes are not used inside SAVE
function extractObject(text, marker) {
  const at = text.indexOf(marker); if (at < 0) throw new Error('could not find ' + marker + ' in engine.js');
  let i = text.indexOf('{', at), depth = 0, q = null;
  for (let j = i; j < text.length; j++) {
    const ch = text[j];
    if (q) { if (ch === '\\') { j++; continue; } if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
    if (ch === '/' && text[j + 1] === '/') { j = text.indexOf('\n', j); continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return text.slice(i, j + 1); }
  }
  throw new Error('unbalanced braces after ' + marker);
}

function makeSave(env) {
  const body = extractObject(src, 'const SAVE = {');
  // the SAVE object uses: localStorage, A.call, window.claude / claude, setTimeout, clearTimeout, console
  return new Function('localStorage', 'A', 'window', 'claude', 'console', `const SAVE = ${body}; return SAVE;`)(env.localStorage, env.A, env.window, env.window.claude, env.console);
}
function fakeEnv(opts = {}) {
  const store = {}, calls = [], warns = [];
  const env = {
    store, calls, warns,
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    A: { call: (...a) => { calls.push(a); return 0; } },
    console: { warn: (...a) => warns.push(a.join(' ')), log: console.log, error: (...a) => warns.push('ERROR ' + a.join(' ')) },
    window: {},
  };
  if (opts.cloud) {
    const db = { docs: {}, sets: 0, gets: 0 };
    if (opts.remote !== undefined) db.docs['data/users/u1/save'] = opts.remote;
    env.db = db;
    const dbApi = { doc: p => ({ async get() { db.gets++; if (opts.getThrows) throw new Error('offline'); const v = db.docs[p]; return { exists: v !== undefined, data: () => v }; }, async set(v) { db.sets++; if (opts.setThrows) throw new Error('quota'); db.docs[p] = JSON.parse(JSON.stringify(v)); } }) };
    env.window.claude = { use: async name => { if (opts.useThrows) throw new Error('no capability'); return name === 'db' ? dbApi : name === 'user' ? { id: async () => 'u1' } : null; } };
  }
  return env;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const results = [];
async function t(name, fn) {
  const fails = [];
  try { await fn((cond, msg) => { if (!cond) fails.push(msg); }); } catch (e) { fails.push('threw ' + (e && e.stack || e)); }
  results.push({ name, fails });
}

(async () => {
  await t('merge cases', ok => { const S = makeSave(fakeEnv()); for (const f of saveMergeCases(S)) ok(false, f); });

  await t('save() writes localStorage and stamps savedAt', ok => {
    const env = fakeEnv(), S = makeSave(env); S.d.cards.board = 1; const before = Date.now(); S.save(); clearTimeout(S.timer);
    const v = JSON.parse(env.store[S.key] || 'null');
    ok(v && v.cards && v.cards.board === 1, 'card not in localStorage after save()');
    ok(v && v.savedAt >= before, 'savedAt not stamped');
  });

  await t('load() merges localStorage into the default save', ok => {
    const env = fakeEnv(); env.store.holymoly1 = JSON.stringify({ cards: { pair: 1 }, best: { ark: 6 }, muted: true, savedAt: 10 });
    const S = makeSave(env); S.load();
    ok(S.d.cards.pair === 1 && S.d.best.ark === 6, 'load lost progress: ' + JSON.stringify(S.d));
    ok(S.d.muted === true, 'load lost the mute setting');
  });

  await t('load() survives corrupt localStorage', ok => {
    const env = fakeEnv(); env.store.holymoly1 = '{not json'; const S = makeSave(env); S.load();
    ok(S.d && S.d.cards && typeof S.d.cards === 'object', 'save data broken after corrupt load');
  });

  await t('save() survives a throwing localStorage (private mode)', ok => {
    const env = fakeEnv(); env.localStorage.setItem = () => { throw new Error('QuotaExceeded'); }; const S = makeSave(env);
    let threw = false; try { S.save(); clearTimeout(S.timer); } catch (e) { threw = true; } ok(!threw, 'save() threw');
  });

  await t('connect() merges a remote save and writes the merged save back', async ok => {
    const remote = { json: JSON.stringify({ cards: { remote: 1 }, cleared: { ark: 1 }, best: { ark: 7 }, remixBest: 9, savedAt: 5 }), savedAt: 5 };
    const env = fakeEnv({ cloud: true, remote }); env.store.holymoly1 = JSON.stringify({ cards: { local: 1 }, savedAt: 3 });
    const S = makeSave(env); S.load(); await S.connect(); await sleep(20);
    ok(S.uid === 'u1' && S.db, 'connect did not keep db/uid');
    ok(S.d.cards.remote === 1 && S.d.cards.local === 1, 'merged cards wrong: ' + JSON.stringify(S.d.cards));
    ok(S.d.cleared.ark === 1 && S.d.best.ark === 7 && S.d.remixBest === 9, 'merged progress wrong: ' + JSON.stringify(S.d));
    const ls = JSON.parse(env.store.holymoly1); ok(ls.cards.remote === 1, 'merged save not written to localStorage');
    const back = env.db.docs['data/users/u1/save']; const bj = back && JSON.parse(back.json);
    ok(bj && bj.cards.local === 1 && bj.cards.remote === 1, 'merged save not pushed to the cloud: ' + JSON.stringify(back));
  });

  await t('save() after connect pushes once after 600 ms (debounced)', async ok => {
    const env = fakeEnv({ cloud: true }); const S = makeSave(env); await S.connect(); await sleep(20);
    const sets0 = env.db.sets; S.d.cards.a = 1; S.save(); S.d.cards.b = 1; S.save(); S.d.cards.c = 1; S.save();
    await sleep(300); ok(env.db.sets === sets0, 'pushed before the 600 ms debounce');
    await sleep(500); ok(env.db.sets === sets0 + 1, `expected exactly one push after rapid saves, got ${env.db.sets - sets0}`);
    const bj = JSON.parse(env.db.docs['data/users/u1/save'].json); ok(bj.cards.a && bj.cards.b && bj.cards.c, 'pushed save missing cards');
  });

  await t('connect() with no remote save pushes the local one', async ok => {
    const env = fakeEnv({ cloud: true }); env.store.holymoly1 = JSON.stringify({ cards: { local: 1 }, savedAt: 3 });
    const S = makeSave(env); S.load(); await S.connect(); await sleep(20);
    const back = env.db.docs['data/users/u1/save']; ok(back && JSON.parse(back.json).cards.local === 1, 'local save not pushed to an empty cloud');
  });

  await t('connect() survives corrupt remote JSON', async ok => {
    const env = fakeEnv({ cloud: true, remote: { json: '{oops' } }); env.store.holymoly1 = JSON.stringify({ cards: { local: 1 } });
    const S = makeSave(env); S.load(); await S.connect(); await sleep(20);
    ok(S.d.cards.local === 1, 'local progress lost after corrupt remote');
  });

  await t('connect() survives a failing cloud (use() throws, get() throws, set() throws)', async ok => {
    for (const o of [{ useThrows: true }, { getThrows: true }, { setThrows: true }]) {
      const env = fakeEnv({ cloud: true, ...o }); env.store.holymoly1 = JSON.stringify({ cards: { local: 1 } });
      const S = makeSave(env); S.load(); let threw = false; try { await S.connect(); await sleep(20); } catch (e) { threw = true; }
      ok(!threw, 'connect threw with ' + JSON.stringify(o)); ok(S.d.cards.local === 1, 'local progress lost with ' + JSON.stringify(o));
    }
  });

  await t('connect() without window.claude does nothing', async ok => {
    const env = fakeEnv(); const S = makeSave(env); await S.connect(); ok(!S.db && !S.uid, 'connect set db/uid without claude');
  });

  await t('connect() applies a newer remote mute setting', async ok => {
    const remote = { json: JSON.stringify({ muted: true, savedAt: Date.now() + 1000 }) };
    const env = fakeEnv({ cloud: true, remote }); const S = makeSave(env); S.load(); await S.connect(); await sleep(20);
    ok(S.d.muted === true, 'remote mute not merged');
    ok(env.calls.some(c => c[0] === 'mute' && c[1] === true), 'A.call("mute", true) not called after the remote mute arrived');
  });

  let bad = 0;
  for (const r of results) { if (r.fails.length) bad++; console.log(`${r.fails.length ? 'FAIL' : 'PASS'}  ${r.name}`); for (const f of r.fails.slice(0, 8)) console.log('      - ' + f); }
  process.exit(bad ? 1 : 0);
})();
