/*
  Mills Maths Tools — Stage 5 Question Bank: Properties of Geometrical Figures B
  -------------------------------------------------------------------------------
  question-banks/stage-5/geometrical-figures-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-GEO-P-01 (Path):
    applies the tests for congruent and similar triangles, and reasons
    numerically about angles and sides in plane figures.

  Content:
    - congruence tests SSS, SAS, AAS, RHS, from marked diagrams; why SSA
      and AAA do not prove congruence
    - writing congruence and similarity statements with vertices in
      matching order; using them to find unknown sides and angles
    - similarity tests: SSS (sides in proportion), SAS, AA (equiangular), RHS
    - numerical angle problems with reasons: isosceles triangles, parallel
      lines, angle sums of triangles and polygons, exterior angles

  Marked diagrams: geometry engine (ticks for equal sides, arcs for equal
  angles, right-angle marks). The second triangle is a rotated or reflected
  copy, so the student has to match vertices, not just positions.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";

const TOPIC = "Properties of Geometrical Figures B";

const TYPE_LIST = [
  { id: "congruence-test", label: "Which congruence test?" },
  { id: "congruence-statement", label: "Write the congruence statement" },
  { id: "congruent-unknowns", label: "Use congruence to find unknowns" },
  { id: "not-a-test", label: "Why SSA and AAA are not tests" },
  { id: "similarity-test", label: "Which similarity test?" },
  { id: "similar-by-ratios", label: "Show triangles are similar (SSS ratios)" },
  { id: "angle-reasoning-isosceles", label: "Angles in isosceles triangles, with reasons" },
  { id: "angle-reasoning-parallel", label: "Angles and parallel lines, with reasons" },
  { id: "polygon-angles", label: "Angle sums of polygons" },
  { id: "exterior-angle", label: "Exterior angles of triangles and polygons" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "congruence", ...(spec.tags || [])] });
const geo = config => ({ engine: "geometry-engine", config });

/* ── two marked triangles ─────────────────────────────────── */

function triFromAngles(A, B, base = 130) {
  const r = Math.PI / 180;
  const C = 180 - A - B;
  const b = base * Math.sin(B * r) / Math.sin(C * r);
  return [[0, 0], [base, 0], [b * Math.cos(A * r), -b * Math.sin(A * r)]];
}
function transformCopy(pts, mirror, rot, ox) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / 3; const cy = pts.reduce((s, p) => s + p[1], 0) / 3;
  const c = Math.cos(rot); const s = Math.sin(rot);
  return pts.map(p => {
    let x = p[0] - cx; const y = p[1] - cy;
    if (mirror) x = -x;
    return [ox + x * c - y * s, x * s + y * c];
  });
}

const TESTS = ["SSS", "SAS", "AAS", "RHS"];

function markedPair(test) {
  const right = test === "RHS";
  const A = right ? 90 : randInt(45, 75); const B = right ? randInt(30, 55) : randInt(40, 70);
  const P1 = triFromAngles(A, B, 170);
  const mirror = Math.random() < 0.5; const rot = choice([0, Math.PI / 2, Math.PI, -Math.PI / 3, Math.PI / 4]);
  const P2 = transformCopy(P1, mirror, rot, 400);
  // names for second triangle, in matching order to A B C
  const names2 = shuffle(["P", "Q", "R"]);
  const pts = { A: P1[0], B: P1[1], C: P1[2] };
  names2.forEach((n, i) => { pts[n] = P2[i]; });
  const [X, Y, Z] = names2; // X ↔ A, Y ↔ B, Z ↔ C
  const ticks = []; const angles = [];
  const both = (f) => { f("A", "B", "C"); f(X, Y, Z); };
  if (test === "SSS") both((a, b, c) => { ticks.push({ from: a, to: b, count: 1 }, { from: b, to: c, count: 2 }, { from: c, to: a, count: 3 }); });
  if (test === "SAS") both((a, b, c) => { ticks.push({ from: a, to: b, count: 1 }, { from: a, to: c, count: 2 }); angles.push({ at: a, from: b, to: c, label: false }); });
  if (test === "AAS") both((a, b, c) => { angles.push({ at: a, from: b, to: c, label: false }, { at: b, from: c, to: a, label: false, arcs: 2 }); ticks.push({ from: b, to: c, count: 1 }); });
  if (test === "RHS") both((a, b, c) => { angles.push({ at: a, from: b, to: c, right: true }); ticks.push({ from: b, to: c, count: 2 }, { from: a, to: b, count: 1 }); });
  return { pts, names2, ticks, angles, map: { A: X, B: Y, C: Z } };
}

function congruenceTestQuestion() {
  const test = choice(TESTS); const m = markedPair(test);
  return q({
    type: "congruence-test", marks: 1,
    prompt: "The two triangles are congruent. Which congruence test proves this?",
    diagram: geo({ points: m.pts, polygons: [{ pts: ["A", "B", "C"] }, { pts: m.names2 }], ticks: m.ticks, angles: m.angles, localLabels: true }),
    answer: test,
    working: [{ SSS: "Three pairs of matching sides are equal.", SAS: "Two sides and the angle between them are equal.", AAS: "Two angles and a matching side are equal.", RHS: "Right angle, hypotenuse and one other side are equal." }[test]],
    space: SPACE_SIZES.SMALL,
    mcDistractors: TESTS.filter(t => t !== test),
    tags: ["tests"]
  });
}

function congruenceStatementQuestion() {
  const test = choice(TESTS); const m = markedPair(test);
  const stmt = `△ABC ≡ △${m.map.A}${m.map.B}${m.map.C}`;
  const wrong = [`△ABC ≡ △${m.names2.slice().sort().join("")}`, `△ABC ≡ △${m.map.B}${m.map.A}${m.map.C}`, `△ABC ≡ △${m.map.A}${m.map.C}${m.map.B}`].filter(s => s !== stmt);
  return q({
    type: "congruence-statement", marks: 2,
    prompt: "Complete the congruence statement △ABC ≡ △____ with the vertices in matching order, and name the test.",
    diagram: geo({ points: m.pts, polygons: [{ pts: ["A", "B", "C"] }, { pts: m.names2 }], ticks: m.ticks, angles: m.angles, localLabels: true }),
    answer: `${stmt} (${test})`,
    working: [`A ↔ ${m.map.A}, B ↔ ${m.map.B}, C ↔ ${m.map.C}: match the marks at each vertex.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: wrong.map(w => `${w} (${test})`),
    tags: ["statement"]
  });
}

function congruentUnknownsQuestion() {
  const m = markedPair("SSS");
  const s1 = randInt(5, 9); const s2 = s1 + randInt(1, 4); const s3 = s2 + randInt(1, 3);
  // label first triangle sides and one angle; ask for matching in second
  const cfg = { points: m.pts, polygons: [{ pts: ["A", "B", "C"] }, { pts: m.names2 }], ticks: m.ticks, localLabels: true,
    sideLabels: [{ from: "A", to: "B", text: `${s1} cm` }, { from: "B", to: "C", text: `${s2} cm` }, { from: m.map.C, to: m.map.A, text: "x" }],
    angles: [{ at: "A", from: "B", to: "C", label: "" + angleAt(m.pts, "A", "B", "C") + "°" }, { at: m.map.A, from: m.map.B, to: m.map.C, label: "y" }] };
  return q({
    type: "congruent-unknowns", marks: 2,
    prompt: `The triangles are congruent (SSS). CA = ${s3} cm. Find x and y.`,
    diagram: { ...geo(cfg), notToScale: true },
    answer: `x = ${s3} cm, y = ${angleAt(m.pts, "A", "B", "C")}°`,
    working: [`${m.map.C}${m.map.A} matches CA, so x = ${s3}`, `∠${m.map.A} matches ∠A, so y = ${angleAt(m.pts, "A", "B", "C")}°`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${s2} cm, y = ${angleAt(m.pts, "A", "B", "C")}°`, `x = ${s3} cm, y = ${angleAt(m.pts, "B", "C", "A")}°`],
    tags: ["unknowns"]
  });
}
function angleAt(P, at, f, t) {
  const u = [P[f][0] - P[at][0], P[f][1] - P[at][1]]; const v = [P[t][0] - P[at][0], P[t][1] - P[at][1]];
  return Math.round(Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180 / Math.PI);
}

function notATestQuestion() {
  const v = choice(["AAA", "SSA"]);
  return q({
    type: "not-a-test", marks: 1,
    prompt: v === "AAA" ? "Two triangles each have angles 40°, 60° and 80°. Must they be congruent? Explain." : "Two triangles have two pairs of equal sides and an equal angle that is NOT between those sides (SSA). Must they be congruent? Explain.",
    answer: v === "AAA" ? "No: equal angles only show the triangles are similar; one could be an enlargement of the other." : "No: with SSA, the third side can often be drawn in two different positions, giving two different triangles.",
    working: [],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["tests", "reasoning"]
  });
}

function similarityTestQuestion() {
  const test = choice(["SSS", "SAS", "AA", "RHS"]);
  const k = choice([1.5, 2]);
  const rh = test === "RHS";
  const A = rh ? 90 : randInt(45, 70); const B = randInt(40, 60);
  const P1 = triFromAngles(A, B, 150); const P2 = transformCopy(P1.map(p => [p[0] * k, p[1] * k]), Math.random() < 0.5, choice([0, Math.PI]), 150 + 90 + 75 * k);
  const pts = { A: P1[0], B: P1[1], C: P1[2], P: P2[0], Q: P2[1], R: P2[2] };
  const cfg = { points: pts, polygons: [{ pts: ["A", "B", "C"] }, { pts: ["P", "Q", "R"] }], localLabels: true, sideLabels: [], angles: [] };
  const L = (a, b) => Math.round(Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]) / 20);
  const sides = [["A", "B", "P", "Q"], ["B", "C", "Q", "R"], ["C", "A", "R", "P"]];
  const len = sides.map(([a, b]) => Math.max(2, L(a, b)));
  if (test === "SSS") sides.forEach(([a, b, c, d], i) => { cfg.sideLabels.push({ from: a, to: b, text: String(len[i]) }, { from: c, to: d, text: String(len[i] * k) }); });
  if (test === "SAS") { [0, 2].forEach(i => { const [a, b, c, d] = sides[i]; cfg.sideLabels.push({ from: a, to: b, text: String(len[i]) }, { from: c, to: d, text: String(len[i] * k) }); }); cfg.angles.push({ at: "A", from: "B", to: "C", label: `${A}°` }, { at: "P", from: "Q", to: "R", label: `${A}°` }); }
  if (test === "AA") cfg.angles.push({ at: "A", from: "B", to: "C", label: `${A}°` }, { at: "B", from: "C", to: "A", label: `${B}°` }, { at: "P", from: "Q", to: "R", label: `${A}°` }, { at: "Q", from: "R", to: "P", label: `${B}°` });
  if (rh) { cfg.angles.push({ at: "A", from: "B", to: "C", right: true }, { at: "P", from: "Q", to: "R", right: true }); [1, 0].forEach(i => { const [a, b, c, d] = sides[i]; cfg.sideLabels.push({ from: a, to: b, text: String(len[i]) }, { from: c, to: d, text: String(len[i] * k) }); }); }
  return q({
    type: "similarity-test", marks: 1,
    prompt: "Which test shows that the triangles are similar?",
    diagram: { ...geo(cfg), notToScale: true },
    answer: test,
    working: [{ SSS: `All three pairs of sides are in the ratio ${k}.`, SAS: `Two pairs of sides in the ratio ${k}, with equal included angles.`, AA: "Two pairs of equal angles (equiangular).", RHS: `Right angles, and the hypotenuses and one other pair of sides are in the ratio ${k}.` }[test]],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["SSS", "SAS", "AA", "RHS"].filter(t => t !== test),
    tags: ["similarity", "tests"]
  });
}

function similarByRatiosQuestion() {
  const base = choice([[4, 6, 7], [5, 6, 8], [3, 5, 6], [6, 7, 9]]); const k = choice([1.5, 2, 2.5, 3]);
  const yes = Math.random() < 0.6;
  const t = base.map(v => v * k); if (!yes) t[1] += 1;
  return q({
    type: "similar-by-ratios", marks: 2,
    prompt: `△ABC has sides AB = ${base[0]}, BC = ${base[1]}, CA = ${base[2]}. △XYZ has sides XY = ${t[0]}, YZ = ${t[1]}, ZX = ${t[2]}. Are the triangles similar? Justify.`,
    answer: yes ? `Yes (SSS): ${t[0]}/${base[0]} = ${t[1]}/${base[1]} = ${t[2]}/${base[2]} = ${k}.` : `No: ${t[0]}/${base[0]} = ${k} but ${t[1]}/${base[1]} = ${Math.round(t[1] / base[1] * 100) / 100}.`,
    working: base.map((v, i) => `${t[i]} ÷ ${v} = ${Math.round(t[i] / v * 100) / 100}`),
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["similarity"]
  });
}

function angleReasoningIsoscelesQuestion() {
  const apex = choice([30, 40, 50, 70, 80, 100, 110, 36, 64]);
  const base = (180 - apex) / 2;
  const askApex = Math.random() < 0.4;
  const P = triFromAngles(base, base, 140);
  return q({
    type: "angle-reasoning-isosceles", marks: 2,
    prompt: `In the isosceles triangle, AC = BC. Find x, giving reasons.`,
    diagram: geo({ points: { A: P[0], B: P[1], C: P[2] }, polygons: [{ pts: ["A", "B", "C"] }], ticks: [{ from: "A", to: "C" }, { from: "B", to: "C" }], angles: askApex ? [{ at: "A", from: "B", to: "C", label: `${base}°` }, { at: "C", from: "A", to: "B", label: "x" }] : [{ at: "C", from: "A", to: "B", label: `${apex}°` }, { at: "A", from: "B", to: "C", label: "x" }] }),
    answer: `x = ${askApex ? apex : base}°`,
    working: askApex ? [`∠B = ${base}° (base angles of an isosceles triangle are equal)`, `x = 180 − 2 × ${base} = ${apex}° (angle sum of a triangle)`] : [`The base angles are equal (isosceles triangle)`, `2x + ${apex} = 180 (angle sum of a triangle)`, `x = ${base}°`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: askApex ? [`x = ${180 - base}°`, `x = ${base}°`] : [`x = ${180 - apex}°`, `x = ${apex}°`, `x = ${(180 - apex)}°`],
    tags: ["isosceles", "reasons"]
  });
}

function angleReasoningParallelQuestion() {
  const a = randInt(35, 80);
  const kind = choice(["alternate", "corresponding", "co-interior"]);
  // two horizontal parallels and a transversal
  const pts = { _a: [0, 0], _b: [300, 0], _c: [0, 120], _d: [300, 120] };
  const dx = 120 / Math.tan(a * Math.PI / 180);
  pts.E = [110, 0]; pts.F = [110 - dx, 120];
  pts._t1 = [pts.E[0] + dx * 0.5, -60]; pts._t2 = [pts.F[0] - dx * 0.5, 180];
  const given = { at: "E", from: "_b", to: "F" };
  given.label = `${angleAt(pts, "E", "_b", "F")}°`;
  const target = kind === "alternate" ? { at: "F", from: "_c", to: "E", label: "x" }
    : kind === "corresponding" ? { at: "F", from: "_d", to: "_t2", label: "x" }
    : { at: "F", from: "_d", to: "E", label: "x" };
  return q({
    type: "angle-reasoning-parallel", marks: 2,
    prompt: "The two horizontal lines are parallel. Find x, giving a reason.",
    diagram: geo({ points: pts, segments: [{ from: "_a", to: "_b" }, { from: "_c", to: "_d" }, { from: "_t1", to: "_t2" }], parallel: [{ from: "_a", to: "_b", at: 0.85 }, { from: "_c", to: "_d", at: 0.85 }], angles: [given, target], vertexLabels: false }),
    answer: `x = ${angleValue(pts, target)}°`,
    working: [`${kind === "alternate" ? "Alternate angles are equal" : kind === "corresponding" ? "Corresponding angles are equal" : "Co-interior angles add to 180°"} (parallel lines)`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${180 - angleValue(pts, target)}°`, `x = ${Math.abs(90 - angleValue(pts, target))}°`],
    tags: ["parallel lines", "reasons"]
  });
}
/* Measure the drawn angle, so the answer always matches the picture. */
function angleValue(pts, target) { return angleAt(pts, target.at, target.from, target.to); }

function polygonAnglesQuestion() {
  const n = choice([5, 6, 7, 8, 9, 10, 12]);
  const names = { 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon", 12: "dodecagon" };
  const v = choice(["sum", "regular", "find-n"]);
  const S = (n - 2) * 180;
  if (v === "sum") return q({ type: "polygon-angles", marks: 1, prompt: `Find the sum of the interior angles of a ${names[n]}.`, answer: `${S}°`, working: [`(n − 2) × 180 = (${n} − 2) × 180 = ${S}°`], space: SPACE_SIZES.SMALL, mcDistractors: [`${n * 180}°`, `${(n - 1) * 180}°`, "360°"], tags: ["polygons"] });
  if (v === "regular") return q({ type: "polygon-angles", marks: 2, prompt: `Find the size of each interior angle of a regular ${names[n]}.`, answer: `${Math.round(S / n * 100) / 100}°`, working: [`Sum ${S}°`, `${S} ÷ ${n} = ${Math.round(S / n * 100) / 100}°`], space: SPACE_SIZES.SMALL, mcDistractors: [`${Math.round(360 / n * 100) / 100}°`, `${Math.round(n * 180 / n)}°`], tags: ["polygons"] });
  const ext = 360 / n;
  return q({ type: "polygon-angles", marks: 2, prompt: `Each interior angle of a regular polygon is ${180 - ext}°. How many sides does it have?`, answer: `${n}`, working: [`Exterior angle 180 − ${180 - ext} = ${ext}°`, `n = 360 ÷ ${ext} = ${n}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${n + 1}`, `${n - 1}`, `${Math.round(360 / (180 - ext))}`], tags: ["polygons"] });
}

function exteriorAngleQuestion() {
  const a = randInt(30, 70); const b = randInt(30, 70);
  const P = triFromAngles(a, b, 140);
  const pts = { A: P[0], B: P[1], C: P[2], _D: [P[1][0] + 70, 0] };
  return q({
    type: "exterior-angle", marks: 2,
    prompt: "AB is extended to D. Find x, giving a reason.",
    diagram: geo({ points: pts, polygons: [{ pts: ["A", "B", "C"] }], segments: [{ from: "B", to: "_D" }], angles: [{ at: "A", from: "B", to: "C", label: `${a}°` }, { at: "C", from: "A", to: "B", label: `${180 - a - b}°` }, { at: "B", from: "_D", to: "C", label: "x" }] }),
    answer: `x = ${a + (180 - a - b)}°`,
    working: ["The exterior angle of a triangle equals the sum of the two interior opposite angles.", `x = ${a} + ${180 - a - b} = ${180 - b}°`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${b}°`, `x = ${180 - a}°`, `x = ${a}°`],
    tags: ["exterior angle", "reasons"]
  });
}

const GENERATORS = {
  "congruence-test": congruenceTestQuestion,
  "congruence-statement": congruenceStatementQuestion,
  "congruent-unknowns": congruentUnknownsQuestion,
  "not-a-test": notATestQuestion,
  "similarity-test": similarityTestQuestion,
  "similar-by-ratios": similarByRatiosQuestion,
  "angle-reasoning-isosceles": angleReasoningIsoscelesQuestion,
  "angle-reasoning-parallel": angleReasoningParallelQuestion,
  "polygon-angles": polygonAnglesQuestion,
  "exterior-angle": exteriorAngleQuestion
};

export function getGeometricalFiguresBQuestionTypes() { return TYPE_LIST; }
export function generateGeometricalFiguresBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
