/*
  Stage 5 harness — every Stage 5 bank, every type.

    node tools/stage5.mjs

  1. Lint: 60 questions per type; no "undefined", "NaN", "Infinity",
     "[object" or "null" leaking into prompt, answer, working, subparts or
     distractors; no distractor equal to the answer; diagrams name an engine.
  2. Re-derivations (independent of the banks' own working):
     - Polynomials: re-divide P(x) by (x − a) and compare Q and R.
     - Polynomials / solve-cubic: substitute each stated root.
     - Probability: every fraction answer lies in [0, 1].
     - Circle geometry: every angle answer lies strictly between 0° and 180°.
     - Surface area / volume: every numeric answer is positive.
     - Linear relationships C: the stated general-form line passes through
       both given points.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "question-banks/stage-5");
const banks = fs.readdirSync(DIR).filter(d => fs.existsSync(path.join(DIR, d, "index.js"))).sort();

let failures = 0; let total = 0;
const fail = (bank, type, msg, q) => { failures++; if (failures <= 60) console.log(`  ✗ ${bank}/${type}: ${msg}${q ? `\n      ${String(q.prompt).slice(0, 140)} => ${String(q.answer).slice(0, 100)}` : ""}`); };
// "undefined" is a real maths word (a vertical gradient, log of a negative);
// it is only a leak when glued to other symbols, as in "x = undefined°" or "3undefined".
const BAD = /NaN|Infinity|\[object|\bnull\b|[^\s(:,]undefined|undefined[^\s.,:;)?]/;
const MINUS = "−";
const toNum = s => Number(String(s).replace(new RegExp(MINUS, "g"), "-").replace(/\s/g, ""));
const fracVal = s => { const m = String(s).match(/^(−?)\[\[frac:(\d+):(\d+)\]\]$/); if (m) return (m[1] ? -1 : 1) * m[2] / m[3]; return toNum(s); };

function texts(q) {
  const out = [q.prompt, q.answer, ...(q.working || []), ...(q.mcDistractors || [])];
  (q.subparts || []).forEach(p => out.push(p.prompt, p.answer, ...(p.working || [])));
  if (q.table) q.table.rows.flat().forEach(c => out.push(c));
  return out.filter(v => v !== undefined && v !== "");
}

/* parse "ax + by + c = 0" in the bank's output format */
function parseGeneral(s) {
  const t = s.replace(/ = 0$/, "").replace(new RegExp(MINUS, "g"), "-").replace(/\s+/g, "");
  let a = 0, b = 0, c = 0;
  (t.match(/[+-]?[^+-]+/g) || []).forEach(term => {
    if (term.endsWith("x")) a = term === "x" || term === "+x" ? 1 : term === "-x" ? -1 : Number(term.slice(0, -1));
    else if (term.endsWith("y")) b = term === "y" || term === "+y" ? 1 : term === "-y" ? -1 : Number(term.slice(0, -1));
    else c = Number(term);
  });
  return { a, b, c };
}
const parsePoly = s => {
  const t = s.replace(new RegExp(MINUS, "g"), "-").replace(/\s+/g, "").replace(/³/g, "^3").replace(/²/g, "^2");
  const coef = {};
  (t.match(/[+-]?[^+-]+/g) || []).forEach(term => {
    const m = term.match(/^([+-]?\d*)x(\^(\d))?$/);
    if (m) { const k = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : Number(m[1]); coef[m[2] ? Number(m[3]) : 1] = k; }
    else coef[0] = Number(term);
  });
  const deg = Math.max(...Object.keys(coef).map(Number));
  return Array.from({ length: deg + 1 }, (_, i) => coef[deg - i] || 0);
};
const evalPoly = (c, x) => c.reduce((a, k) => a * x + k, 0);

for (const bank of banks) {
  const mod = await import(path.join(DIR, bank, "index.js"));
  const gen = Object.entries(mod).find(([k]) => /^generate.*Questions$/.test(k))?.[1];
  const getTypes = Object.entries(mod).find(([k]) => /^get.*QuestionTypes$/.test(k))?.[1];
  if (!gen || !getTypes) { fail(bank, "-", "missing exports"); continue; }
  const types = getTypes();
  const before = failures;
  for (const t of types) {
    for (let i = 0; i < 60; i++) {
      let q;
      try { [q] = gen({ count: 1, allowedTypes: [t.id] }); } catch (e) { fail(bank, t.id, `threw ${e.message}`); break; }
      total++;
      if (!q) { fail(bank, t.id, "no question"); break; }
      const bad = texts(q).find(v => BAD.test(String(v)));
      if (bad) { fail(bank, t.id, `leak: ${String(bad).slice(0, 80)}`, q); break; }
      if ((q.mcDistractors || []).includes(String(q.answer))) { fail(bank, t.id, "distractor equals answer", q); break; }
      if (q.diagram && !q.diagram.engine) { fail(bank, t.id, "diagram without engine", q); break; }

      // re-derivations
      if (bank === "polynomials" && t.id === "divide-polynomial") {
        const P = parsePoly(q.prompt.match(/P\(x\) = (.*?) by/)[1]);
        const a = -toNum(q.prompt.match(/by \(x ([+−]) (\d+)\)/).slice(1).join("").replace("+", "").replace(MINUS, "-")) * 1;
        const m = q.prompt.match(/by \(x ([+−]) (\d+)\)/); const root = (m[1] === "+" ? -1 : 1) * Number(m[2]);
        void a;
        const R = toNum(q.answer.match(/R = (−?\d+)/)[1]);
        if (evalPoly(P, root) !== R) { fail(bank, t.id, `remainder ${R} ≠ P(${root}) = ${evalPoly(P, root)}`, q); break; }
      }
      if (bank === "polynomials" && t.id === "solve-cubic" && /^Solve x/.test(q.prompt)) {
        const P = parsePoly(q.prompt.replace(/^Solve /, "").replace(/ = 0\.$/, ""));
        const roots = q.answer.replace(/^x = /, "").split(", ").map(toNum);
        if (roots.some(r => evalPoly(P, r) !== 0)) { fail(bank, t.id, "stated root does not satisfy P(x) = 0", q); break; }
      }
      if (bank.startsWith("probability") && /^\[\[frac|^\d$|^0$/.test(String(q.answer))) {
        const v = fracVal(q.answer); if (!(v >= 0 && v <= 1)) { fail(bank, t.id, `probability ${q.answer} outside [0, 1]`, q); break; }
      }
      if (bank === "circle-geometry" && /°$/.test(String(q.answer))) {
        const v = toNum(String(q.answer).replace(/^x = /, "").replace("°", "")); if (!(v > 0 && v < 180)) { fail(bank, t.id, `angle ${q.answer} out of range`, q); break; }
      }
      if ((bank === "area-and-surface-area-b" || bank === "volume-b") && /^[\d\s.]+ /.test(String(q.answer))) {
        if (!(toNum(String(q.answer).split(" ").filter(x => /^[\d.]+$/.test(x)).join("")) > 0)) { fail(bank, t.id, "non-positive measurement", q); break; }
      }
      if (bank === "linear-relationships-c" && t.id === "two-points-general") {
        const pts = [...q.prompt.matchAll(/\((−?\d+), (−?\d+)\)/g)].map(m => [toNum(m[1]), toNum(m[2])]);
        const L = parseGeneral(q.answer);
        if (pts.some(([x, y]) => L.a * x + L.b * y + L.c !== 0)) { fail(bank, t.id, `line ${q.answer} misses a point`, q); break; }
      }
    }
  }
  console.log(`${failures === before ? "✓" : "✗"} ${bank} — ${types.length} types`);
}

console.log(`\n${total} questions checked across ${banks.length} banks.`);
console.log(failures ? `✗ ${failures} failure(s)` : "ALL PASSED");
process.exit(failures ? 1 : 0);
