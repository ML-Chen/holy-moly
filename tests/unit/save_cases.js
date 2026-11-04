// save_cases.js — cases for SAVE.merge, shared by the node unit test (tests/unit/save.test.js) and the
// in-browser test (tests/run.py saves_persist), so the logic and the shipped page are checked the same way.
// saveMergeCases(SAVE) returns a list of failure messages (empty when everything passes).
function saveMergeCases(SAVE) {
  const fails = [];
  const J = v => JSON.stringify(v, Object.keys(v || {}).sort());
  const keys = o => Object.keys(o || {}).sort().join(',');
  const check = (cond, msg) => { if (!cond) fails.push(msg); };
  const m = (a, b) => { try { return SAVE.merge(a, b); } catch (e) { fails.push(`merge(${JSON.stringify(a)}, ${JSON.stringify(b)}) threw ${e}`); return {}; } };

  // empty and missing inputs give a complete, empty save
  for (const [a, b, name] of [[null, null, 'null,null'], [undefined, undefined, 'undefined,undefined'], [{}, {}, '{},{}'], [null, {}, 'null,{}']]) {
    const r = m(a, b);
    check(r && typeof r === 'object', `merge(${name}) did not return an object`);
    if (!r) continue;
    for (const k of ['best', 'cleared', 'cards']) check(r[k] && typeof r[k] === 'object' && !Object.keys(r[k]).length, `merge(${name}).${k} should be an empty object, got ${JSON.stringify(r[k])}`);
    check(r.remixBest === 0, `merge(${name}).remixBest should be 0, got ${r.remixBest}`);
    check(r.savedAt === 0, `merge(${name}).savedAt should be 0, got ${r.savedAt}`);
    check(r.muted === false, `merge(${name}).muted should be false, got ${r.muted}`);
  }

  // one side missing keeps the other side's progress
  const full = { best: { ark: 5 }, cleared: { ark: 1 }, cards: { board: 1, pair: 1 }, remixBest: 7, muted: true, savedAt: 50 };
  for (const [a, b, name] of [[full, null, 'full,null'], [null, full, 'null,full'], [full, undefined, 'full,undefined']]) {
    const r = m(a, b);
    check(keys(r.cards) === 'board,pair', `merge(${name}) lost cards: ${JSON.stringify(r.cards)}`);
    check(r.cleared && r.cleared.ark, `merge(${name}) lost cleared.ark`);
    check(r.best && r.best.ark === 5, `merge(${name}) lost best.ark`);
    check(r.remixBest === 7, `merge(${name}) remixBest should be 7, got ${r.remixBest}`);
    check(r.muted === true, `merge(${name}) muted should stay true (the only save that has a mute setting), got ${r.muted}`);
  }

  // union of cards and cleared stages, from both sides
  {
    const a = { cards: { board: 1, pair: 1 }, cleared: { ark: 1 }, savedAt: 1 }, b = { cards: { pair: 1, light: 1 }, cleared: { creation: 1 }, savedAt: 2 };
    const r = m(a, b);
    check(keys(r.cards) === 'board,light,pair', `cards should be the union board,light,pair, got ${keys(r.cards)}`);
    check(keys(r.cleared) === 'ark,creation', `cleared should be the union ark,creation, got ${keys(r.cleared)}`);
    const r2 = m(b, a);
    check(keys(r2.cards) === keys(r.cards) && keys(r2.cleared) === keys(r.cleared), 'cards/cleared union should not depend on argument order');
  }

  // best scores and remixBest: the higher value per stage wins, whichever side it is on
  {
    const a = { best: { ark: 5, creation: 12 }, remixBest: 30, savedAt: 9 }, b = { best: { ark: 9, family: 3 }, remixBest: 12, savedAt: 1 };
    for (const [x, y, n] of [[a, b, 'a,b'], [b, a, 'b,a']]) {
      const r = m(x, y);
      check(J(r.best) === J({ ark: 9, creation: 12, family: 3 }), `best (${n}) should be {ark:9,creation:12,family:3}, got ${JSON.stringify(r.best)}`);
      check(r.remixBest === 30, `remixBest (${n}) should be 30, got ${r.remixBest}`);
      check(r.savedAt === 9, `savedAt (${n}) should be the newer 9, got ${r.savedAt}`);
    }
  }

  // mute comes from whichever save is newer
  {
    const oldMuted = { muted: true, savedAt: 100 }, newUnmuted = { muted: false, savedAt: 200 };
    check(m(oldMuted, newUnmuted).muted === false, 'muted: newer save (b, unmuted) should win');
    check(m(newUnmuted, oldMuted).muted === false, 'muted: newer save (a, unmuted) should win');
    const oldUnmuted = { muted: false, savedAt: 100 }, newMuted = { muted: true, savedAt: 200 };
    check(m(oldUnmuted, newMuted).muted === true, 'muted: newer save (b, muted) should win');
    check(m(newMuted, oldUnmuted).muted === true, 'muted: newer save (a, muted) should win');
  }

  // older saves written before some fields existed still merge
  {
    const legacy = { cards: { board: 1 } }, cur = { best: { ark: 2 }, cleared: {}, cards: { pair: 1 }, remixBest: 1, muted: false, savedAt: 5 };
    const r = m(legacy, cur);
    check(keys(r.cards) === 'board,pair', `legacy save lost cards: ${keys(r.cards)}`);
    check(r.best.ark === 2 && r.remixBest === 1, 'legacy merge lost best/remixBest');
  }

  // merge must not change its inputs
  {
    const a = { best: { ark: 1 }, cleared: { ark: 1 }, cards: { board: 1 }, remixBest: 1, muted: false, savedAt: 1 }, b = { best: { ark: 4 }, cleared: {}, cards: { pair: 1 }, remixBest: 2, muted: true, savedAt: 2 };
    const sa = JSON.stringify(a), sb = JSON.stringify(b); m(a, b);
    check(JSON.stringify(a) === sa && JSON.stringify(b) === sb, 'merge changed one of its inputs');
  }

  // merging a save with itself changes nothing that matters
  {
    const r = m(full, full);
    check(keys(r.cards) === keys(full.cards) && r.best.ark === 5 && r.remixBest === 7 && r.muted === true && r.savedAt === 50, 'merge(x, x) should equal x');
  }
  return fails;
}
if (typeof module !== 'undefined') module.exports = saveMergeCases;
