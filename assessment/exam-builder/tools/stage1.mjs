/*
  Stage 1 harness — every Stage 1 bank, every type.

    node tools/stage1.mjs

  1. Lint: 80 questions per type; no "undefined", "NaN", "Infinity",
     "[object" or "null" leaking into prompt, answer, working, table or
     distractors; no distractor equal to the answer; every MC-eligible
     question keeps at least one distractor; diagrams name a known engine;
     every question is tagged "stage1".
  2. Reading load (Years 1–2): prompts are 25 words or fewer and no single
     word is longer than 13 letters (list-of-answers prompts are exempt from
     the word count, since the list is the data).
  3. Re-derivations, read from the DIAGRAM CONFIG the child sees, not from
     the bank's working:
     - picture collections: count, count − crossed out, skip-count rows;
     - ten-frames: count (+ count2); make 10 / make 20 = frame total − count;
     - dice: sum of the dots;
     - base-ten blocks: 100h + 10t + o;
     - hundred chart: the blanks listed in the answer are the blank cells;
     - number line: the point's value;
     - informal units: the object's length in units;
     - clocks: o'clock, half past, quarter past, quarter to match the hands;
     - grid area: shoelace area of the covered shape;
     - tally charts and picture graphs: the row asked about;
     - fraction shapes: shaded and total parts.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "question-banks/stage-1");
const ORDER = ["whole-numbers-a", "combining-separating-a", "forming-groups-a", "halves-quarters-a", "position-length-a", "two-d-space-a", "three-d-space-a", "mass-time-a", "data-a", "chance-a",
  "whole-numbers-b", "combining-separating-b", "forming-groups-b", "halves-quarters-b", "position-length-b", "two-d-space-b", "three-d-space-b", "mass-time-b", "data-b", "chance-b"];
const present = fs.readdirSync(DIR).filter(d => fs.existsSync(path.join(DIR, d, "index.js")));
const ENGINES = new Set(["manipulatives-engine", "measure-engine", "grid-engine", "statistics-engine", "probability-engine", "solids-engine", "bar-model-engine", "volume-engine"]);

let failures = 0; let total = 0;
const fail = (bank, type, msg, q) => { failures++; if (failures <= 80) console.log(`  ✗ ${bank}/${type}: ${msg}${q ? `\n      ${String(q.prompt).slice(0, 140)} => ${String(q.answer).slice(0, 100)}` : ""}`); };
const BAD = /NaN|Infinity|\[object|\bnull\b|[^\s(:,]undefined|undefined[^\s.,:;)?]/;
const firstNum = s => Number((String(s).match(/\d+/) || ["NaN"])[0]);
const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };

function texts(q) {
  const out = [q.prompt, q.answer, ...(q.working || []), ...(q.mcDistractors || [])];
  if (q.table) q.table.rows.flat().forEach(c => out.push(c));
  return out.filter(v => v !== undefined && v !== "");
}
const shoelace = pts => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
const derived = {};

function derive(type, q) {
  const d = q.diagram; const c = d?.config || {}; const A = String(q.answer);
  const hit = k => { derived[k] = (derived[k] || 0) + 1; };
  if (d?.engine === "manipulatives-engine" && c.diagramType === "objects" && c.count && ["count-pictures", "take-away-pictures", "skip-count-pictures", "cups-to-fill"].includes(type)) {
    hit("pictures"); const want = c.count - (c.crossed || 0); if (firstNum(A) !== want) return `pictures: ${A} ≠ ${want}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "ten-frame") {
    const tot = (c.count || 0) + (c.count2 || 0);
    if (["ten-frame-count", "two-colours"].includes(type)) { hit("ten-frame"); if (firstNum(A) !== tot) return `ten-frame ${A} ≠ ${tot}`; }
    if (type === "make-ten") { hit("ten-frame"); if (firstNum(A) !== 10 - tot) return `make ten ${A} ≠ ${10 - tot}`; }
    if (type === "make-twenty") { hit("ten-frame"); if (firstNum(A) !== 20 - tot) return `make twenty ${A} ≠ ${20 - tot}`; }
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "dice" && type === "dice-total") {
    hit("dice"); const s = c.values.reduce((a, b) => a + b, 0); if (firstNum(A) !== s) return `dice ${A} ≠ ${s}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "base10" && ["tens-ones-blocks", "hto-blocks", "zero-place"].includes(type)) {
    hit("base-ten"); const want = (c.hundreds || 0) * 100 + (c.tens || 0) * 10 + (c.ones || 0); if (Number(A) !== want) return `blocks ${A} ≠ ${want}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "hundred-chart" && type === "chart-missing") {
    hit("hundred chart"); if (A !== c.blanks.join(", ")) return `chart blanks ${A} ≠ ${c.blanks.join(", ")}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "hundred-chart" && type === "before-after") {
    hit("hundred chart"); if (Number(A) !== c.blanks[0]) return `before/after ${A} ≠ ${c.blanks[0]}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "number-line" && ["number-line-a", "number-line-b"].includes(type)) {
    hit("number line"); if (Number(A) !== c.points[0].value) return `number line ${A} ≠ ${c.points[0].value}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "unit-length" && ["measure-cubes", "measure-paperclips"].includes(type)) {
    hit("informal units"); if (firstNum(A) !== c.rows[0].units) return `units ${A} ≠ ${c.rows[0].units}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "unit-length" && type === "how-much-longer") {
    hit("informal units"); const [a, b] = c.rows.map(r => r.units); if (Number(A) !== Math.abs(a - b)) return `longer ${A} ≠ ${Math.abs(a - b)}`;
  }
  if (d?.engine === "measure-engine" && c.diagramType === "clock" && c.hands !== false && ["oclock", "half-past", "quarter-past", "quarter-to"].includes(type)) {
    hit("clock");
    const h = c.hours % 12 || 12; const n = h % 12 + 1;
    const want = { 0: `${h} o'clock`, 30: `half past ${h}`, 15: `quarter past ${h}`, 45: `quarter to ${n}` }[c.minutes];
    if (A !== want) return `clock ${A} ≠ ${want}`;
  }
  if (d?.engine === "grid-engine" && ["cover-squares", "rows-columns-area"].includes(type)) {
    hit("grid area"); const a = shoelace(c.shapes[0].pts); if (firstNum(A) !== a) return `area ${A} ≠ ${a}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "tally" && ["tally-read", "table-from-tally"].includes(type)) {
    hit("tally"); const row = type === "tally-read" ? c.rows.find(r => q.prompt.toLowerCase().includes(`chose ${String(r.label).toLowerCase()}?`)) : c.rows.find(r => r.total === null);
    if (!row || Number(A) !== row.count) return `tally ${A} ≠ ${row?.count}`;
  }
  if (d?.engine === "statistics-engine" && c.chartType === "pictogram" && type === "picture-graph-read") {
    hit("picture graph"); const i = c.categories.findIndex(k => q.prompt.toLowerCase().includes(`chose ${k.toLowerCase()}?`)); if (Number(A) !== c.values[i]) return `picture graph ${A} ≠ ${c.values[i]}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "fraction-shape" && type === "name-coloured") {
    hit("fraction shape"); const n = NUMW[A.split(" ")[0]]; const name = { 2: "hal", 4: "quarter", 8: "eighth" }[c.den];
    if (n !== c.shaded || !A.includes(name)) return `fraction ${A} ≠ ${c.shaded}/${c.den}`;
  }
  return null;
}

for (const bank of ORDER) {
  if (!present.includes(bank)) { fail(bank, "-", "bank folder missing"); continue; }
  const mod = await import(path.join(DIR, bank, "index.js"));
  const gen = Object.entries(mod).find(([k]) => /^generate.*Questions$/.test(k))?.[1];
  const getTypes = Object.entries(mod).find(([k]) => /^get.*QuestionTypes$/.test(k))?.[1];
  if (!gen || !getTypes) { fail(bank, "-", "missing exports"); continue; }
  const types = getTypes();
  const ids = types.map(t => t.id);
  if (new Set(ids).size !== ids.length) fail(bank, "-", "duplicate type ids");
  const before = failures;
  for (const t of types) {
    for (let i = 0; i < 80; i++) {
      let q;
      try { [q] = gen({ count: 1, allowedTypes: [t.id] }); } catch (e) { fail(bank, t.id, `threw ${e.message}`); break; }
      total++;
      if (!q) { fail(bank, t.id, "no question"); break; }
      if (q.type !== t.id) { fail(bank, t.id, `type mismatch ${q.type}`, q); break; }
      const bad = texts(q).find(v => BAD.test(String(v)));
      if (bad) { fail(bank, t.id, `leak: ${String(bad).slice(0, 80)}`, q); break; }
      if (!String(q.answer).trim()) { fail(bank, t.id, "empty answer", q); break; }
      if ((q.mcDistractors || []).includes(String(q.answer))) { fail(bank, t.id, "distractor equals answer", q); break; }
      if (q.mcEligible !== false && !(q.mcDistractors || []).length) { fail(bank, t.id, "MC-eligible with no distractors", q); break; }
      if (q.diagram && !ENGINES.has(q.diagram.engine)) { fail(bank, t.id, `unknown engine ${q.diagram.engine}`, q); break; }
      if (!(q.tags || []).includes("stage1")) { fail(bank, t.id, "missing stage1 tag", q); break; }
      const isList = /^(Answers|Favourite colours):/.test(q.prompt);
      const words = String(q.prompt).split(/\s+/).filter(Boolean);
      if (words.length > 25 && !isList) { fail(bank, t.id, `prompt is ${words.length} words (reading load)`, q); break; }
      const long = words.find(w => w.replace(/[^A-Za-z]/g, "").length > 13);
      if (long) { fail(bank, t.id, `long word "${long}"`, q); break; }
      const err = derive(t.id, q);
      if (err) { fail(bank, t.id, err, q); break; }
    }
  }
  console.log(`${failures === before ? "✓" : "✗"} ${bank} — ${types.length} types`);
}

console.log(`\n${total} questions checked across ${ORDER.length} banks.`);
console.log(`Re-derived from diagram configs: ${Object.entries(derived).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(failures ? `✗ ${failures} failure(s)` : "ALL PASSED");
process.exit(failures ? 1 : 0);
