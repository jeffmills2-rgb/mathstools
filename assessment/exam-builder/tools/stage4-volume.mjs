/* Stage 4 "Volume" (MA4-VOL-C-01). Re-derives every answer from the diagram
   config or the numbers in the prompt, independently of the bank, then checks
   units and answer-space. Plain node, no dependencies. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/volume/index.js");
const { makeMultipleChoiceQuestion } = await import(base + "utils/multiple-choice.js");
let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getVolumeQuestionTypes();
const ALL = [];
for (const ty of TYPES) ALL.push(...bank.generateVolumeQuestions({ count: 400, allowedTypes: [ty.id] }));
const by = id => ALL.filter(q => q.type === id);
const num = s => Number(String(s).replace(/ /g, "").match(/-?\d+(\.\d+)?/)[0]);
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

console.log("\nCOVERAGE");
t("17 question types", TYPES.length === 17, String(TYPES.length));
t("every type generates", TYPES.every(ty => by(ty.id).length === 400));

console.log("\nANSWERS RE-DERIVED FROM THE DIAGRAM");
let bad = 0;
for (const q of by("count-cubes")) { const n = q.diagram.config.heights.flat().reduce((s, v) => s + v, 0); if (num(q.answer) !== n || !/cm³$/.test(q.answer)) bad++; }
t("counted cubes = sum of the drawn stacks", bad === 0);
bad = 0;
for (const q of by("rectangular-prisms")) { const c = q.diagram.config; if (!close(num(q.answer), Number(c.length) * c.width * c.height)) bad++; if (!q.answer.endsWith(`${c.unit}³`)) bad++; }
t("rectangular prism: V = lwh with the drawn dimensions, cubic unit", bad === 0);
bad = 0;
for (const q of by("triangular-prisms")) { const c = q.diagram.config; if (!close(num(q.answer), c.base * c.height / 2 * c.length)) bad++; }
t("triangular prism: V = ½bh × length", bad === 0);
bad = 0;
for (const q of by("quadrilateral-prisms")) {
  const c = q.diagram.config;
  const A = c.kind === "trapezium" ? (c.top + c.bottom) * c.height / 2 : c.kind === "parallelogram" ? c.base * c.height : c.d1 * c.d2 / 2;
  if (!close(num(q.answer), A * c.length)) bad++;
}
t("quadrilateral prisms: area of the drawn cross-section × length", bad === 0);
bad = 0;
for (const q of by("composite-prisms")) {
  const c = q.diagram.config;
  const V = c.kind === "l-block" ? c.split * c.width * c.heightB + (c.length - c.split) * c.width * c.heightA
    : c.lowerLength * c.depth * c.lowerHeight + c.upperLength * c.depth * c.upperHeight;
  if (num(q.answer) !== V) bad++;
}
t("composite prisms: sum of the two drawn blocks", bad === 0);
bad = 0;
for (const q of by("cylinders")) {
  const c = q.diagram.config; const r = c.diameter ? c.diameter / 2 : c.radius;
  if (/π/.test(q.answer)) { if (num(q.answer) !== r * r * c.height) bad++; }
  else if (Math.abs(num(q.answer) - Math.PI * r * r * c.height) > 0.051) bad++;
}
t("cylinders: πr²h from the drawn radius/diameter, to 1 dp or exact", bad === 0);
bad = 0;
for (const q of by("volume-from-area").filter(q => q.diagram)) { const c = q.diagram.config; if (!close(num(q.answer), Number(c.crossArea) * c.length)) bad++; }
t("V = Ah uses the area printed on the prism", bad === 0);

console.log("\nANSWERS RE-DERIVED FROM THE PROMPT");
const F = { mm3: 1e-3, cm3: 1, m3: 1e6, mL: 1, L: 1000, kL: 1e6, ML: 1e9 };
const key = u => u.replace("³", "3");
bad = 0;
for (const q of [...by("volume-units"), ...by("capacity-units")]) {
  const m = /Convert ([\d. ]+) (\S+) to (\S+)\./.exec(q.prompt);
  const v = Number(m[1].replace(/ /g, "")) * F[key(m[2])] / F[key(m[3])];
  if (!close(num(q.answer), v, 1e-9) || !q.answer.endsWith(m[3])) bad++;
}
t("unit conversions: factor re-derived from unit definitions", bad === 0, `${by("volume-units").length + by("capacity-units").length} checked`);
bad = 0;
for (const q of by("missing-dimension")) {
  const n = [...q.prompt.replace(/(\d) (\d{3})/g, "$1$2").matchAll(/(\d+(?:\.\d+)?) (?:cm|m)(?![²³])/g)].map(m => Number(m[1]));
  const V = Number(/volume (?:of )?([\d ]+(?:\.\d+)?) (?:cm|m)³/.exec(q.prompt)[1].replace(/ /g, ""));
  const a = num(q.answer);
  if (/cube/.test(q.prompt)) { if (a ** 3 !== V) bad++; }
  else if (/cylinder/.test(q.prompt)) { if (Math.abs(Math.PI * n[0] ** 2 * a - V) > 0.06 * Math.PI * n[0] ** 2 + 0.1) bad++; }
  else if (/cross-sectional area of (\d+)/.test(q.prompt)) { const A = Number(/cross-sectional area of (\d+)/.exec(q.prompt)[1]); if (A * a !== V) bad++; }
  else if (n[0] * n[1] * a !== V) bad++;
}
t("missing dimensions multiply back to the stated volume", bad === 0);

console.log("\nUNITS AND LAYOUT");
t("volume answers use cubic units, capacity answers litre units",
  [...by("rectangular-prisms"), ...by("triangular-prisms"), ...by("cylinders"), ...by("composite-prisms")].every(q => /³$/.test(q.answer)) &&
  by("container-capacity").every(q => /(m?L)$/.test(q.answer)));
t("every drawn solid with dimensions is marked not to scale",
  ALL.filter(q => q.diagram && q.diagram.config.diagramType !== "cube-array").every(q => q.diagram.notToScale === true));
let ok = 0, tried = 0;
for (const q of ALL.filter(q => q.marks === 1 && q.mcEligible !== false)) { tried++; const m = makeMultipleChoiceQuestion(q); if (m && m.choices.length === 4 && m.choices.includes(m.correctAnswer)) ok++; }
t("one-mark questions convert to 4-option multiple choice", ok === tried, `${ok}/${tried}`);
t("no NaN / undefined / 0-cups wording", ALL.every(q => !/NaN|undefined|Infinity| 0 mL left/.test(JSON.stringify([q.prompt, q.answer, q.working, q.subparts]))));
console.log(fail ? `\n✗ ${fail} check(s) failed` : "\n✓ all volume checks passed");
process.exit(fail ? 1 : 0);
