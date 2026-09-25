/*
  Stage 2 harness — every Stage 2 bank, every type.

    node tools/stage2.mjs

  1. Lint: 80 questions per type; no "undefined", "NaN", "Infinity",
     "[object" or "null" leaking into prompt, answer, working, table or
     distractors; no distractor equal to the answer; every MC-eligible
     question keeps at least one distractor; diagrams name a known engine.
  2. Reading load: Stage 2 prompts stay short (≤ 45 words; the few
     data-list prompts that print raw survey answers are exempt).
  3. Re-derivations, read from the DIAGRAM CONFIG the student sees, not
     from the bank's own working:
     - column-sum (column add / subtract): answer = a ± b;
     - ruler: answer = to − from (cm or mm);
     - grid area (count squares, cm², rows): shoelace area of the polygon;
     - grid perimeter: sum of edge lengths of the polygon;
     - clock: answer h:mm matches the hands; scale: answer matches value;
     - jug: answer matches level;
     - tally: read-tally answer equals the row's count;
     - fraction-shape / fraction-strip name-shaded: shaded/den;
     - number-line point A (fractions): answer equals value × den / den;
     - area model 2×1: answer = row × (sum of column parts);
     - base-ten blocks read: answer = 1000th + 100h + 10t + o.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "question-banks/stage-2");
const ORDER = ["place-value-a", "additive-relations-a", "multiplicative-relations-a", "fractions-a", "geometric-measure-a", "two-d-space-a", "three-d-space-a", "mass-time-a", "data-a", "chance-a",
  "place-value-b", "additive-relations-b", "multiplicative-relations-b", "fractions-b", "geometric-measure-b", "two-d-space-b", "three-d-space-b", "mass-time-b", "data-b", "chance-b"];
const present = fs.readdirSync(DIR).filter(d => fs.existsSync(path.join(DIR, d, "index.js")));
const ENGINES = new Set(["manipulatives-engine", "measure-engine", "grid-engine", "statistics-engine", "probability-engine", "solids-engine", "bar-model-engine", "open-number-line-engine", "array-area-engine", "length-engine", "volume-engine"]);

let failures = 0; let total = 0;
const fail = (bank, type, msg, q) => { failures++; if (failures <= 80) console.log(`  ✗ ${bank}/${type}: ${msg}${q ? `\n      ${String(q.prompt).slice(0, 140)} => ${String(q.answer).slice(0, 100)}` : ""}`); };
const BAD = /NaN|Infinity|\[object|\bnull\b|[^\s(:,]undefined|undefined[^\s.,:;)?]/;
const num = s => Number(String(s).replace(/−/g, "-").replace(/\s/g, ""));
const firstNum = s => num((String(s).match(/−?[\d\s]*\d(\.\d+)?/) || [""])[0]);

function texts(q) {
  const out = [q.prompt, q.answer, ...(q.working || []), ...(q.mcDistractors || [])];
  if (q.table) q.table.rows.flat().forEach(c => out.push(c));
  return out.filter(v => v !== undefined && v !== "");
}
const shoelace = pts => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
const perim = pts => pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + Math.hypot(x2 - x, y2 - y); }, 0);

const derived = {};
function derive(bank, type, q) {
  const d = q.diagram; const c = d?.config || {};
  const A = String(q.answer);
  const hit = k => { derived[k] = (derived[k] || 0) + 1; };
  if (d?.engine === "manipulatives-engine" && c.diagramType === "column-sum" && c.answer === null) {
    hit("column-sum");
    const want = c.op === "+" ? c.a + c.b : c.a - c.b;
    if (num(A) !== want) return `column answer ${A} ≠ ${want}`;
  }
  if (d?.engine === "manipulatives-engine" && c.diagramType === "ruler" && /ruler/.test(type)) {
    hit("ruler");
    const len = Math.round((c.to - c.from) * 10) / 10;
    const got = /mm/.test(A) && !/^\d+ cm$/.test(A) ? firstNum(A) / 10 : firstNum(A);
    if (Math.abs(got - len) > 1e-9) return `ruler length ${A} ≠ ${len} cm`;
  }
  if (d?.engine === "grid-engine" && ["count-squares", "area-cm2", "rows-of-squares", "rectangle-area-cm2", "half-squares"].includes(type)) {
    hit("grid area");
    const area = shoelace(c.shapes[0].pts);
    const got = /×/.test(A) ? firstNum(A.split("=")[1]) : firstNum(A);
    if (got !== area) return `area ${A} ≠ shoelace ${area}`;
  }
  if (d?.engine === "grid-engine" && type === "perimeter-grid") {
    hit("grid perimeter");
    if (firstNum(A) !== perim(c.shapes[0].pts)) return `perimeter ${A} ≠ ${perim(c.shapes[0].pts)}`;
  }
  if (d?.engine === "grid-engine" && type === "compare-areas") {
    hit("compare-areas");
    const [a, b] = c.shapes.map(s => shoelace(s.pts));
    if (!A.startsWith(a > b ? "A" : "B") || !A.includes(`by ${Math.abs(a - b)} `)) return `compare-areas ${A} vs A=${a}, B=${b}`;
  }
  if (d?.engine === "measure-engine" && c.diagramType === "clock" && c.hands !== false && /read-clock|analog-digital/.test(type) && /^\d+:\d\d$/.test(A)) {
    hit("clock");
    const [h, m] = A.split(":").map(Number);
    if (h !== c.hours || m !== c.minutes) return `clock ${A} ≠ ${c.hours}:${c.minutes}`;
  }
  if (d?.engine === "measure-engine" && c.diagramType === "scale" && /scale/.test(type)) {
    hit("scale");
    if (Math.abs(firstNum(A) - c.value) > 1e-9) return `scale ${A} ≠ ${c.value}`;
  }
  if (d?.engine === "measure-engine" && c.diagramType === "jug" && type === "read-jug") {
    hit("jug");
    if (firstNum(A) !== c.level) return `jug ${A} ≠ ${c.level}`;
  }
  if (type === "read-tally") {
    hit("tally");
    const row = c.rows.find(r => q.prompt.toLowerCase().includes(`chose ${String(r.label).toLowerCase()}?`));
    if (!row || num(A) !== row.count) return `tally ${A} ≠ ${row?.count}`;
  }
  if ((type === "name-shaded" || (type === "fifths-tenths" && /shaded\?/.test(q.prompt))) && c.diagramType === "fraction-shape") {
    hit("fraction shaded");
    if (A !== `[[frac:${c.shaded}:${c.den}]]`) return `shaded ${A} ≠ ${c.shaded}/${c.den}`;
  }
  if ((type === "number-line-0-1" || type === "number-line-beyond-1") && c.points?.[0]) {
    hit("number line");
    const m = A.match(/\[\[frac:(\d+):(\d+)\]\]/) ; const whole = /^\d+$/.test(A) ? Number(A) : null;
    const v = m ? m[1] / m[2] : whole;
    if (Math.abs(v - c.points[0].value) > 1e-9) return `number line ${A} ≠ ${c.points[0].value}`;
  }
  if (type === "area-model-2x1") {
    hit("area model");
    const want = c.rowParts[0] * c.columnParts.reduce((s, v) => s + v, 0);
    if (num(A) !== want) return `area model ${A} ≠ ${want}`;
  }
  if (type === "blocks-to-number" && c.diagramType === "base10") {
    hit("base-ten");
    const want = (c.thousands || 0) * 1000 + (c.hundreds || 0) * 100 + (c.tens || 0) * 10 + (c.ones || 0);
    if (num(A.split(/[ (]/)[0] === "" ? A : A.replace(/\(.*$/, "")) !== want && firstNum(A) !== want) return `blocks ${A} ≠ ${want}`;
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
      if (!(q.tags || []).includes("stage2")) { fail(bank, t.id, "missing stage2 tag", q); break; }
      const words = String(q.prompt).split(/\s+/).length;
      if (words > 45 && !/answers were|tossed a coin \d+ times:/.test(q.prompt)) { fail(bank, t.id, `prompt is ${words} words (reading load)`, q); break; }
      const err = derive(bank, t.id, q);
      if (err) { fail(bank, t.id, err, q); break; }
    }
  }
  console.log(`${failures === before ? "✓" : "✗"} ${bank} — ${types.length} types`);
}

console.log(`\n${total} questions checked across ${ORDER.length} banks.`);
console.log(`Re-derived from diagram configs: ${Object.entries(derived).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(failures ? `✗ ${failures} failure(s)` : "ALL PASSED");
process.exit(failures ? 1 : 0);
