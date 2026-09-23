/* Stage 4 "Properties of Geometrical Figures" (MA4-GEO-C-01).

   Every figure is built from its angles, so the strongest check available is
   to MEASURE the drawn figure and compare it with what is printed and with the
   answer key:
     - every angle labelled in degrees is re-measured from the coordinates;
     - where one pronumeral is asked for, the drawn angle it marks must equal
       the answer;
     - the word answers (classification) are re-derived from the figure.
   Then the scope and answer-space rules. Plain node, no dependencies. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/geometrical-figures/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");
const { makeMultipleChoiceQuestion } = await import(base + "utils/multiple-choice.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getGeometricalFiguresQuestionTypes();
const ALL = [];
for (const ty of TYPES) ALL.push(...bank.generateGeometricalFiguresQuestions({ count: 300, allowedTypes: [ty.id] }));
const by = id => ALL.filter(q => q.type === id);

function angleAt(P, spec) {
  const at = P[spec.at]; const f = P[spec.from]; const to = P[spec.to];
  const a1 = Math.atan2(f[1] - at[1], f[0] - at[0]);
  const a2 = Math.atan2(to[1] - at[1], to[0] - at[0]);
  let d = Math.abs(a1 - a2) * 180 / Math.PI;
  if (d > 180) d = 360 - d;
  return spec.reflex ? 360 - d : d;
}

console.log("\nCOVERAGE");
t("18 question types declared", TYPES.length === 18, String(TYPES.length));
t("every type generates", TYPES.every(ty => by(ty.id).length === 300));
t("every diagram uses the geometry engine", ALL.filter(q => q.diagram).every(q => q.diagram.engine === "geometry-engine"));

console.log("\nTHE FIGURE AGREES WITH ITS LABELS");
let labelled = 0; let bad = 0; const badEx = [];
for (const q of ALL) {
  const c = q.diagram?.config; if (!c) continue;
  for (const a of c.angles || []) {
    if (a.right) {
      labelled++;
      if (Math.abs(angleAt(c.points, a) - 90) > 1) { bad++; badEx.push(`${q.type}: right angle measures ${angleAt(c.points, a).toFixed(1)}`); }
      continue;
    }
    const m = /^(\d+)°$/.exec(String(a.label ?? ""));
    if (!m) continue;
    labelled++;
    const drawn = angleAt(c.points, a);
    const tol = q.diagram.notToScale ? 1.6 : 1.0;
    if (Math.abs(drawn - Number(m[1])) > tol) { bad++; badEx.push(`${q.type}: label ${m[1]}° drawn ${drawn.toFixed(1)}°`); }
  }
}
t("every degree label and right-angle mark matches the drawn angle", bad === 0, `${labelled} angles measured${badEx.length ? "; e.g. " + badEx.slice(0, 3).join(" | ") : ""}`);

bad = 0; let checked = 0;
for (const q of ALL) {
  const c = q.diagram?.config; if (!c) continue;
  const ans = /^(\d+)°$/.exec(String(q.answer));
  if (!ans) continue;
  const pron = (c.angles || []).filter(a => /^[a-z]$/.test(String(a.label ?? "")));
  if (pron.length !== 1) continue;
  checked++;
  if (Math.abs(angleAt(c.points, pron[0]) - Number(ans[1])) > (q.diagram.notToScale ? 1.6 : 1.0)) bad++;
}
t("the angle marked with the pronumeral measures the answer", bad === 0, `${checked} checked`);

bad = 0; checked = 0;
for (const q of ALL.filter(q => /x = \d+°, y = \d+°|y = \d+°, x = \d+°/.test(q.answer))) {
  const c = q.diagram.config;
  const vals = Object.fromEntries([...q.answer.matchAll(/([a-z]) = (\d+)°/g)].map(m => [m[1], Number(m[2])]));
  for (const a of c.angles || []) {
    if (vals[a.label] !== undefined) { checked++; if (Math.abs(angleAt(c.points, a) - vals[a.label]) > 1) bad++; }
  }
}
t("two-unknown answers match both marked angles", bad === 0, `${checked} checked`);

console.log("\nTHE ANGLE SUMS HOLD");
bad = 0;
for (const q of [...by("triangle-angle-sum"), ...by("classify-triangle-angles")]) {
  const c = q.diagram?.config; if (!c) continue;
  const ring = c.polygons[0].pts;
  const sum = ring.reduce((s, v, i) => s + angleAt(c.points, { at: v, from: ring[(i + 2) % 3], to: ring[(i + 1) % 3] }), 0);
  if (Math.abs(sum - 180) > 0.5) bad++;
}
t("drawn triangles are triangles (angles sum to 180°)", bad === 0);
bad = 0;
for (const q of by("quadrilateral-angle-sum")) {
  const c = q.diagram.config;
  const sum = c.angles.reduce((s, a) => s + angleAt(c.points, a), 0);
  if (Math.abs(sum - 360) > 1.6) bad++;
}
t("drawn quadrilaterals' marked angles sum to 360° (reflex included)", bad === 0);

console.log("\nCLASSIFICATION ANSWERS ARE RE-DERIVED FROM THE FIGURE");
bad = 0;
for (const q of by("classify-triangle-angles").filter(q => q.diagram)) {
  const c = q.diagram.config; const ring = c.polygons[0].pts;
  const angs = ring.map((v, i) => angleAt(c.points, { at: v, from: ring[(i + 2) % 3], to: ring[(i + 1) % 3] }));
  const m = Math.max(...angs);
  const expected = Math.abs(m - 90) < 0.6 ? "Right-angled" : m > 90 ? "Obtuse-angled" : "Acute-angled";
  if (q.answer !== expected) bad++;
}
t("classify by angles: the largest drawn angle decides", bad === 0);
bad = 0;
for (const q of by("classify-triangle-sides").filter(q => q.diagram && !(q.diagram.config.sideLabels || []).length)) {
  const c = q.diagram.config; const ring = c.polygons[0].pts;
  const L = ring.map((v, i) => Math.hypot(c.points[v][0] - c.points[ring[(i + 1) % 3]][0], c.points[v][1] - c.points[ring[(i + 1) % 3]][1]));
  const eq = (a, b) => Math.abs(a - b) / Math.max(a, b) < 0.01;
  const pairs = [eq(L[0], L[1]), eq(L[1], L[2]), eq(L[0], L[2])].filter(Boolean).length;
  const expected = pairs === 3 ? "Equilateral" : pairs === 1 ? "Isosceles" : "Scalene";
  const tickedEqual = (c.ticks || []).length;
  if (q.answer !== expected || (expected === "Isosceles" && tickedEqual !== 2) || (expected === "Equilateral" && tickedEqual !== 3)) bad++;
}
t("classify by sides: the drawn lengths and tick marks agree with the answer", bad === 0);
bad = 0;
for (const q of by("classify-triangle-sides").filter(q => /sides of length/.test(q.prompt))) {
  const s = [...q.prompt.matchAll(/(\d+) (?:cm|m|mm)/g)].map(m => Number(m[1]));
  const distinct = new Set(s).size;
  const expected = distinct === 1 ? "Equilateral" : distinct === 2 ? "Isosceles" : "Scalene";
  if (q.answer !== expected || s[0] + s[1] <= s[2] || s[1] + s[2] <= s[0] || s[0] + s[2] <= s[1]) bad++;
}
t("classify from given lengths: correct, and every triangle exists", bad === 0);

bad = 0;
for (const q of by("classify-quadrilateral")) {
  const c = q.diagram.config; const ring = c.polygons[0].pts; const P = c.points;
  const L = ring.map((v, i) => Math.hypot(P[v][0] - P[ring[(i + 1) % 4]][0], P[v][1] - P[ring[(i + 1) % 4]][1]));
  const angs = ring.map((v, i) => angleAt(P, { at: v, from: ring[(i + 3) % 4], to: ring[(i + 1) % 4] }));
  const dir = i => { const a = P[ring[i]], b = P[ring[(i + 1) % 4]]; return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const par = (i, j) => Math.abs(Math.sin(dir(i) - dir(j))) < 0.01;
  const eq = (a, b) => Math.abs(a - b) / Math.max(a, b) < 0.01;
  const allEq = eq(L[0], L[1]) && eq(L[1], L[2]) && eq(L[2], L[3]);
  const right = angs.every(a => Math.abs(a - 90) < 0.5);
  const p1 = par(0, 2); const p2 = par(1, 3);
  const kite = (eq(L[0], L[3]) && eq(L[1], L[2])) || (eq(L[0], L[1]) && eq(L[2], L[3]));
  const expected = right && allEq ? "Square" : right ? "Rectangle" : allEq ? "Rhombus" : p1 && p2 ? "Parallelogram" : (p1 || p2) ? "Trapezium" : kite ? "Kite" : "?";
  if (q.answer !== expected) bad++;
}
t("classify quadrilateral: the drawn shape IS the answer", bad === 0);

console.log("\nALGEBRA");
bad = 0;
for (const q of by("algebraic-angles")) {
  const xv = Number(/x = (\d+)/.exec(q.answer)[1]);
  const c = q.diagram.config;
  for (const a of c.angles) {
    const m = /^\(?(\d*)x(?: ([+−]) (\d+))?\)?°$/.exec(a.label);
    if (!m) { bad++; continue; }
    const v = (m[1] ? Number(m[1]) : 1) * xv + (m[2] ? (m[2] === "+" ? 1 : -1) * Number(m[3]) : 0);
    if (Math.abs(angleAt(c.points, a) - v) > 1) bad++;
  }
}
t("substituting x into every expression gives the drawn angle", bad === 0, `${by("algebraic-angles").length} checked`);

bad = 0;
for (const q of by("unknown-sides").filter(q => /rhombus\. \(a\)/.test(q.prompt))) {
  const [l1, l2] = q.diagram.config.sideLabels.map(s => s.text);
  const xv = Number(/x = (\d+)/.exec(q.answer)[1]);
  const ev = s => { const m = /\((\d+)x ([+−]) (\d+)\)/.exec(s); return Number(m[1]) * xv + (m[2] === "+" ? 1 : -1) * Number(m[3]); };
  const per = Number(/perimeter = (\d+)/.exec(q.answer)[1]);
  if (ev(l1) !== ev(l2) || per !== 4 * ev(l1)) bad++;
}
t("rhombus algebra: both sides equal at x, perimeter is 4 sides", bad === 0);

console.log("\nANSWER SPACE AND MULTIPLE CHOICE");
t("one-mark classification answers get a box (or lines when the word is too long for one)",
  [...by("classify-quadrilateral"), ...by("classify-triangle-sides")].every(q => resolveAnswerSpace(q).kind === (String(q.answer).length > 12 ? "lines" : "box")));
t("reasoning questions get ruled lines",
  [...by("angle-sum-reasoning"), ...by("hierarchy-true-false")].every(q => resolveAnswerSpace(q).kind === "lines"));
let mcOk = 0; let mcTried = 0;
for (const q of ALL.filter(q => q.marks === 1 && q.mcEligible !== false)) { mcTried++; const m = makeMultipleChoiceQuestion(q); if (m && m.choices.length === 4 && m.choices.includes(m.correctAnswer)) mcOk++; }
t("every one-mark question converts to a 4-option multiple choice", mcOk === mcTried, `${mcOk}/${mcTried}`);
t("no answer is 'undefined' or 'NaN'", ALL.every(q => !/undefined|NaN/.test(JSON.stringify([q.prompt, q.answer, q.working]))));
t("every vertex name in a prompt exists on its figure", ALL.filter(q => q.diagram).every(q => {
  const names = Object.keys(q.diagram.config.points);
  const m = /△([A-Z])([A-Z])([A-Z])/.exec(q.prompt);
  return !m || [m[1], m[2], m[3]].every(n => names.includes(n));
}));
t("an extension point never reuses a vertex letter", ALL.filter(q => /extended to ([A-Z])/.test(q.prompt)).every(q => {
  const d = /extended to ([A-Z])/.exec(q.prompt)[1];
  return !q.diagram.config.polygons[0].pts.includes(d);
}));

console.log(fail ? `\n✗ ${fail} check(s) failed` : "\n✓ all geometry checks passed");
process.exit(fail ? 1 : 0);
