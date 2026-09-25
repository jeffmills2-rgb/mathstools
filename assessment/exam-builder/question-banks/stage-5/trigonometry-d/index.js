/*
  Mills Maths Tools — Stage 5 Question Bank: Trigonometry D
  ----------------------------------------------------------
  question-banks/stage-5/trigonometry-d/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-TRG-P-02 (Path):
    applies trigonometry to angles of any magnitude, graphs the
    trigonometric functions, and solves trigonometric equations.

  Content:
    - the unit circle: coordinates (cos θ, sin θ); signs in each quadrant
      (ASTC); related acute angles
    - exact values for 0°, 30°, 45°, 60°, 90° and their related angles
    - supplementary (sin(180° − θ) = sin θ) and complementary
      (sin θ = cos(90° − θ)) relationships
    - given one ratio and the quadrant, find the others
    - graphs of y = sin x, cos x, tan x for 0° ≤ x ≤ 360°: amplitude,
      period, key points, reading solutions from a graph; y = a sin bx
    - solving sin x = k, cos x = k, tan x = k for 0° ≤ x ≤ 360°, exactly
      and with a calculator

  Graphs: plane engine (`degrees: true`, curve kinds sin|cos|tan).
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";

const TOPIC = "Trigonometry D";

const TYPE_LIST = [
  { id: "unit-circle-coordinates", label: "The unit circle: coordinates" },
  { id: "quadrant-signs", label: "Signs of the ratios in each quadrant (ASTC)" },
  { id: "related-angle", label: "Write using the related acute angle" },
  { id: "exact-values", label: "Exact values of 30°, 45°, 60°" },
  { id: "exact-values-any-angle", label: "Exact values for angles of any magnitude" },
  { id: "supplementary-complementary", label: "Supplementary and complementary angles" },
  { id: "given-one-ratio", label: "Given one ratio and the quadrant, find the others" },
  { id: "trig-graph-features", label: "Features of trigonometric graphs" },
  { id: "which-trig-graph", label: "Identify the trigonometric graph (A–D)" },
  { id: "solve-from-graph", label: "Solve an equation using the graph" },
  { id: "solve-exact", label: "Solve trigonometric equations (exact)" },
  { id: "solve-calculator", label: "Solve trigonometric equations (calculator)" },
  { id: "obtuse-angle-triangle", label: "Obtuse angles: sin θ has two solutions" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "trigonometry", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const M = "−";
const rad = d => (d * Math.PI) / 180;

/* exact values */
const EXACT = {
  sin: { 0: "0", 30: "[[frac:1:2]]", 45: "[[algfrac:1:√2]]", 60: "[[algfrac:√3:2]]", 90: "1" },
  cos: { 0: "1", 30: "[[algfrac:√3:2]]", 45: "[[algfrac:1:√2]]", 60: "[[frac:1:2]]", 90: "0" },
  tan: { 0: "0", 30: "[[algfrac:1:√3]]", 45: "1", 60: "√3", 90: "undefined" }
};
const neg = v => (v === "0" || v === "undefined" ? v : `${M}${v}`);
function quadrant(t) { t = ((t % 360) + 360) % 360; return t < 90 ? 1 : t < 180 ? 2 : t < 270 ? 3 : 4; }
function related(t) { const qd = quadrant(t); return qd === 1 ? t : qd === 2 ? 180 - t : qd === 3 ? t - 180 : 360 - t; }
function sign(fn, t) { const v = fn === "sin" ? Math.sin(rad(t)) : fn === "cos" ? Math.cos(rad(t)) : Math.tan(rad(t)); return v >= 0 ? 1 : -1; }
function exactAt(fn, t) { const r = related(t); const base = EXACT[fn][r]; return sign(fn, t) < 0 ? neg(base) : base; }
const ASTC = { 1: "all ratios are positive", 2: "only sin is positive", 3: "only tan is positive", 4: "only cos is positive" };

function unitCircleCoordinatesQuestion() {
  const t = choice([30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330, 90, 180, 270]);
  const special = [0, 90, 180, 270].includes(t);
  const x = special ? String(Math.round(Math.cos(rad(t)))).replace("-", M) : exactAt("cos", t);
  const y = special ? String(Math.round(Math.sin(rad(t)))).replace("-", M) : exactAt("sin", t);
  const P = [Math.cos(rad(t)), Math.sin(rad(t))];
  return q({
    type: "unit-circle-coordinates", marks: 2,
    prompt: `P is the point on the unit circle at an angle of ${t}° from the positive x-axis. Find the exact coordinates of P.`,
    diagram: plane({ xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5, xStep: 0.5, yStep: 0.5, xLabelEvery: 2, yLabelEvery: 2, curves: [{ kind: "circle", h: 0, k: 0, r: 1 }], segments: [{ from: [0, 0], to: P }], points: [{ x: P[0], y: P[1], label: "P", labelPos: P[0] >= 0 ? (P[1] >= 0 ? "ne" : "se") : (P[1] >= 0 ? "nw" : "sw") }], texts: [{ x: 0.25 * Math.cos(rad(t / 2)), y: 0.25 * Math.sin(rad(t / 2)), text: `${t}°` }] }),
    answer: `P = (${x}, ${y})`,
    working: ["P = (cos θ, sin θ)", `Related angle ${related(t)}°, quadrant ${quadrant(t)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`P = (${y}, ${x})`, `P = (${exactAt("cos", related(t))}, ${exactAt("sin", related(t))})`].filter(s => s !== `P = (${x}, ${y})`),
    tags: ["unit circle"]
  });
}

function quadrantSignsQuestion() {
  const t = choice([randInt(95, 175), randInt(185, 265), randInt(275, 355)]);
  const fn = choice(["sin", "cos", "tan"]);
  const s = sign(fn, t);
  return q({
    type: "quadrant-signs", marks: 1,
    prompt: `Without a calculator, state whether ${fn} ${t}° is positive or negative. Explain.`,
    answer: s > 0 ? "Positive" : "Negative",
    working: [`${t}° is in quadrant ${quadrant(t)}, where ${ASTC[quadrant(t)]} (ASTC).`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [s > 0 ? "Negative" : "Positive"],
    tags: ["ASTC"]
  });
}

function relatedAngleQuestion() {
  const t = choice([randInt(95, 175), randInt(185, 265), randInt(275, 355)]);
  const fn = choice(["sin", "cos", "tan"]);
  const r = related(t); const s = sign(fn, t);
  const ans = `${s < 0 ? M : ""}${fn} ${r}°`;
  return q({
    type: "related-angle", marks: 1,
    prompt: `Write ${fn} ${t}° as a trigonometric ratio of an acute angle.`,
    answer: ans,
    working: [`Quadrant ${quadrant(t)}: related angle ${quadrant(t) === 2 ? `180 − ${t}` : quadrant(t) === 3 ? `${t} − 180` : `360 − ${t}`} = ${r}°`, `${fn} is ${s > 0 ? "positive" : "negative"} there (ASTC)`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${s > 0 ? M : ""}${fn} ${r}°`, `${s < 0 ? M : ""}${fn} ${90 - r}°`, `${s < 0 ? M : ""}${fn === "sin" ? "cos" : "sin"} ${r}°`],
    tags: ["related angle"]
  });
}

function exactValuesQuestion() {
  const v = choice(["single", "expr"]);
  if (v === "single") {
    const fn = choice(["sin", "cos", "tan"]); const t = choice([30, 45, 60]);
    return q({ type: "exact-values", marks: 1, prompt: `Write the exact value of ${fn} ${t}°.`, answer: EXACT[fn][t], working: ["Use the exact-value triangles (1, 1, √2) and (1, √3, 2)."], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(["[[frac:1:2]]", "[[algfrac:√3:2]]", "[[algfrac:1:√2]]", "√3", "[[algfrac:1:√3]]", "1"].filter(x => x !== EXACT[fn][t])).slice(0, 3), tags: ["exact values"] });
  }
  const exprs = [
    ["sin 30° + cos 60°", "1"], ["2 sin 45° cos 45°", "1"], ["tan 45° − sin 30°", "[[frac:1:2]]"], ["sin² 60° + cos² 60°", "1"],
    ["tan 60° × tan 30°", "1"], ["cos² 45°", "[[frac:1:2]]"], ["4 sin 30° cos 60°", "1"], ["sin 60° ÷ cos 60°", "√3"], ["2 cos 30°", "√3"]
  ];
  const [e, a] = choice(exprs);
  return q({ type: "exact-values", marks: 2, prompt: `Find the exact value of ${e}.`, answer: a, working: ["Substitute the exact values and simplify."], space: SPACE_SIZES.SMALL, mcDistractors: ["0", "2", "[[algfrac:√3:2]]", "[[frac:1:4]]"].filter(x => x !== a).slice(0, 3), tags: ["exact values"] });
}

function exactValuesAnyAngleQuestion() {
  const t = choice([120, 135, 150, 210, 225, 240, 300, 315, 330]);
  const fn = choice(["sin", "cos", "tan"]);
  const ans = exactAt(fn, t);
  return q({
    type: "exact-values-any-angle", marks: 2,
    prompt: `Find the exact value of ${fn} ${t}°.`,
    answer: ans,
    working: [`Related angle ${related(t)}°, quadrant ${quadrant(t)}`, `${fn} ${t}° = ${sign(fn, t) < 0 ? M : ""}${fn} ${related(t)}° = ${ans}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [EXACT[fn][related(t)] === ans ? neg(ans) : EXACT[fn][related(t)], exactAt(fn === "sin" ? "cos" : "sin", t)].filter(x => x !== ans),
    tags: ["exact values", "ASTC"]
  });
}

function supplementaryComplementaryQuestion() {
  const v = choice(["supp", "comp", "find"]);
  const a = randInt(10, 80);
  if (v === "supp") return q({ type: "supplementary-complementary", marks: 1, prompt: `Given sin ${a}° ≈ ${Math.sin(rad(a)).toFixed(4)}, write down the value of sin ${180 - a}°.`, answer: `${Math.sin(rad(a)).toFixed(4)}`, working: [`sin(180° − θ) = sin θ`], space: SPACE_SIZES.SMALL, mcDistractors: [`${M}${Math.sin(rad(a)).toFixed(4)}`, `${Math.cos(rad(a)).toFixed(4)}`], tags: ["supplementary"] });
  if (v === "comp") return q({ type: "supplementary-complementary", marks: 1, prompt: `Find the value of θ (0° < θ < 90°) such that cos θ = sin ${a}°.`, answer: `θ = ${90 - a}°`, working: ["sin θ = cos(90° − θ)", `cos(90° − ${a}°) = sin ${a}°`], space: SPACE_SIZES.SMALL, mcDistractors: [`θ = ${a}°`, `θ = ${180 - a}°`], tags: ["complementary"] });
  return q({ type: "supplementary-complementary", marks: 1, prompt: `sin θ = sin ${a}° and θ is obtuse. Find θ.`, answer: `θ = ${180 - a}°`, working: ["sin(180° − θ) = sin θ"], space: SPACE_SIZES.SMALL, mcDistractors: [`θ = ${90 + a}°`, `θ = ${360 - a}°`, `θ = ${180 + a}°`], tags: ["supplementary"] });
}

function givenOneRatioQuestion() {
  const [o, a, h] = choice([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
  const qd = choice([2, 3, 4]);
  const fn = choice(["sin", "cos", "tan"]);
  const sx = qd === 2 || qd === 3 ? -1 : 1; const sy = qd === 3 || qd === 4 ? -1 : 1;
  const val = { sin: [sy * o, h], cos: [sx * a, h], tan: [sx * sy * o, a] };
  const fr = ([n, d]) => `${n < 0 ? M : ""}[[frac:${Math.abs(n)}:${d}]]`;
  const others = ["sin", "cos", "tan"].filter(f => f !== fn);
  const range = { 2: "90° < θ < 180°", 3: "180° < θ < 270°", 4: "270° < θ < 360°" }[qd];
  return q({
    type: "given-one-ratio", marks: 3,
    prompt: `If ${fn} θ = ${fr(val[fn])} and ${range}, find the exact values of ${others[0]} θ and ${others[1]} θ.`,
    answer: `${others[0]} θ = ${fr(val[others[0]])}, ${others[1]} θ = ${fr(val[others[1]])}`,
    working: [`Draw a right triangle with sides ${o}, ${a}, ${h} (Pythagoras)`, `Quadrant ${qd}: ${ASTC[qd]}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${others[0]} θ = ${fr([Math.abs(val[others[0]][0]), val[others[0]][1]])}, ${others[1]} θ = ${fr([Math.abs(val[others[1]][0]), val[others[1]][1]])}`],
    tags: ["ASTC", "Pythagoras"]
  });
}

function trigGraphFeaturesQuestion() {
  const fn = choice(["sin", "cos"]); const a = choice([1, 2, 3, 0.5]); const b = choice([1, 2, 1, 3]);
  const period = 360 / b;
  const eq = `y = ${a === 1 ? "" : a + " "}${fn} ${b === 1 ? "" : b}x`;
  return q({
    type: "trig-graph-features", marks: 3,
    prompt: `The graph of ${eq} is shown for 0° ≤ x ≤ 360°.`,
    diagram: plane({ xMin: 0, xMax: 360, yMin: -Math.max(1.5, a + 0.5), yMax: Math.max(1.5, a + 0.5), xStep: 30, xLabelEvery: 3, yStep: a >= 2 ? 1 : 0.5, degrees: true, equal: false, width: 440, height: 240, curves: [{ kind: fn, a, b, c: 0 }] }),
    subparts: [
      { label: "(a)", prompt: "State the amplitude.", marks: 1, answer: String(a), working: ["The height of the wave from its centre line."] },
      { label: "(b)", prompt: "State the period.", marks: 1, answer: `${period}°`, working: [`360° ÷ ${b}`] },
      { label: "(c)", prompt: "State the maximum value and the first x-value where it occurs.", marks: 1, answer: `${a} at x = ${fn === "sin" ? 90 / b : 0}°`, working: [] }
    ],
    answer: `(a) ${a}; (b) ${period}°; (c) max ${a}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["graphs"]
  });
}

function whichTrigGraphQuestion() {
  const opts = [{ kind: "sin", a: 1, b: 1, n: "y = sin x" }, { kind: "cos", a: 1, b: 1, n: "y = cos x" }, { kind: "tan", a: 1, b: 1, n: "y = tan x" }, { kind: "sin", a: 2, b: 1, n: "y = 2 sin x" }, { kind: "sin", a: 1, b: 2, n: "y = sin 2x" }, { kind: "cos", a: -1, b: 1, n: "y = −cos x" }];
  const cards = shuffle(opts).slice(0, 4); const target = choice(cards);
  const correct = ["A", "B", "C", "D"][cards.indexOf(target)];
  return q({
    type: "which-trig-graph", marks: 1,
    prompt: `Which graph shows ${target.n} for 0° ≤ x ≤ 360°?`,
    diagram: plane({ diagramType: "options", columns: 2, panels: cards.map((c, i) => ({ label: ["A", "B", "C", "D"][i], xMin: 0, xMax: 360, yMin: -2.5, yMax: 2.5, xStep: 90, yStep: 1, degrees: true, equal: false, numbers: true, grid: true, curves: [{ kind: c.kind, a: c.a, b: c.b, c: 0, asymptotes: c.kind === "tan" }] })) }),
    answer: correct,
    working: ["Check the value at x = 0, the amplitude and the period."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["A", "B", "C", "D"].filter(l => l !== correct),
    tags: ["graphs"]
  });
}

function solveFromGraphQuestion() {
  const fn = choice(["sin", "cos"]); const k = choice([0.5, -0.5, 0.8, -0.3]);
  const base = fn === "sin" ? Math.asin(k) * 180 / Math.PI : Math.acos(k) * 180 / Math.PI;
  let sols = fn === "sin" ? [base, 180 - base] : [base, 360 - base];
  sols = sols.map(v => ((v % 360) + 360) % 360).sort((x, y) => x - y);
  const r = sols.map(v => Math.round(v / 5) * 5);
  return q({
    type: "solve-from-graph", marks: 2,
    prompt: `Use the graph of y = ${fn} x to estimate the solutions of ${fn} x = ${String(k).replace("-", M)} for 0° ≤ x ≤ 360°.`,
    diagram: plane({ xMin: 0, xMax: 360, yMin: -1.5, yMax: 1.5, xStep: 30, xLabelEvery: 3, yStep: 0.5, degrees: true, equal: false, width: 440, height: 240, curves: [{ kind: fn, a: 1, b: 1, c: 0 }, { kind: "line", m: 0, c: k, dashed: true, colour: "#b91c1c", label: `y = ${String(k).replace("-", M)}` }] }),
    answer: `x ≈ ${r[0]}° and x ≈ ${r[1]}°`,
    working: ["Read the x-values where the line meets the curve.", `(Exact to 1 d.p.: ${sols.map(v => v.toFixed(1)).join("°, ")}°)`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["graphs", "equations"]
  });
}

const EXACT_EQ = [
  ["sin", "[[frac:1:2]]", [30, 150]], ["sin", `${M}[[frac:1:2]]`, [210, 330]], ["cos", "[[frac:1:2]]", [60, 300]], ["cos", `${M}[[frac:1:2]]`, [120, 240]],
  ["sin", "[[algfrac:√3:2]]", [60, 120]], ["cos", `${M}[[algfrac:√3:2]]`, [150, 210]], ["tan", "1", [45, 225]], ["tan", `${M}1`, [135, 315]],
  ["tan", "√3", [60, 240]], ["sin", "[[algfrac:1:√2]]", [45, 135]], ["cos", `${M}[[algfrac:1:√2]]`, [135, 225]], ["sin", "1", [90]], ["cos", `${M}1`, [180]]
];

function solveExactQuestion() {
  const [fn, k, sols] = choice(EXACT_EQ);
  const twoStep = Math.random() < 0.3 && k.includes("frac:1:2") && !k.startsWith(M);
  return q({
    type: "solve-exact", marks: 2,
    prompt: twoStep ? `Solve 2 ${fn} x − 1 = 0 for 0° ≤ x ≤ 360°.` : `Solve ${fn} x = ${k} for 0° ≤ x ≤ 360°.`,
    answer: `x = ${sols.map(s => `${s}°`).join(" or ")}`,
    working: [twoStep ? `${fn} x = [[frac:1:2]]` : "", sols.length > 1 ? `Related angle ${related(sols[0])}°; ${fn} is ${k.startsWith(M) ? "negative" : "positive"} in quadrants ${sols.map(quadrant).join(" and ")}` : "A single solution in this range."].filter(Boolean),
    space: SPACE_SIZES.SMALL,
    mcDistractors: [[related(sols[0])], sols.map(s => (s + 180) % 360), [related(sols[0]), 180 + related(sols[0])], [related(sols[0]), 180 - related(sols[0])]]
      .map(a => [...new Set(a)].sort((x, y) => x - y)).filter(a => a.join() !== [...sols].sort((x, y) => x - y).join()).map(a => `x = ${a.map(v => `${v}°`).join(" or ")}`),
    tags: ["equations", "exact"]
  });
}

function solveCalculatorQuestion() {
  const fn = choice(["sin", "cos", "tan"]); const k = +(choice([0.3, 0.45, 0.6, 0.72, 0.85, 1.5, 2.4]) * choice([1, -1])).toFixed(2);
  if (fn !== "tan" && Math.abs(k) >= 1) return solveCalculatorQuestion();
  const b = fn === "sin" ? Math.asin(k) : fn === "cos" ? Math.acos(k) : Math.atan(k);
  const bd = b * 180 / Math.PI;
  let sols = fn === "sin" ? [bd, 180 - bd] : fn === "cos" ? [bd, 360 - bd] : [bd, bd + 180];
  sols = sols.map(v => ((v % 360) + 360) % 360).sort((x, y) => x - y).map(v => Math.round(v * 10) / 10);
  return q({
    type: "solve-calculator", marks: 2,
    prompt: `Solve ${fn} x = ${String(k).replace("-", M)} for 0° ≤ x ≤ 360°, giving answers to 1 decimal place.`,
    answer: `x ≈ ${sols.map(s => `${s.toFixed(1)}°`).join(" or ")}`,
    working: [`Related angle: ${fn}⁻¹(${Math.abs(k)}) ≈ ${Math.abs(bd).toFixed(1)}°`, `${fn} is ${k < 0 ? "negative" : "positive"}: quadrants ${sols.map(quadrant).join(" and ")}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x ≈ ${Math.abs(bd).toFixed(1)}°`, `x ≈ ${Math.abs(bd).toFixed(1)}° or ${(180 + Math.abs(bd)).toFixed(1)}°`, `x ≈ ${(180 - Math.abs(bd)).toFixed(1)}° or ${(360 - Math.abs(bd)).toFixed(1)}°`].filter(s => s !== `x ≈ ${sols.map(t => `${t.toFixed(1)}°`).join(" or ")}`),
    tags: ["equations", "calculator"]
  });
}

function obtuseAngleTriangleQuestion() {
  const s = choice([0.4, 0.5, 0.6, 0.75, 0.8, 0.9]);
  const acute = Math.asin(s) * 180 / Math.PI;
  return q({
    type: "obtuse-angle-triangle", marks: 2,
    prompt: `In a triangle, sin θ = ${s}. Find the two possible values of θ, to the nearest degree, and explain why there are two.`,
    answer: `θ ≈ ${Math.round(acute)}° or θ ≈ ${Math.round(180 - acute)}°: sin is positive for acute and obtuse angles, and sin(180° − θ) = sin θ.`,
    working: [`sin⁻¹(${s}) ≈ ${acute.toFixed(1)}°`, `180 − ${acute.toFixed(1)} ≈ ${(180 - acute).toFixed(1)}°`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["obtuse", "ambiguous"]
  });
}

const GENERATORS = {
  "unit-circle-coordinates": unitCircleCoordinatesQuestion,
  "quadrant-signs": quadrantSignsQuestion,
  "related-angle": relatedAngleQuestion,
  "exact-values": exactValuesQuestion,
  "exact-values-any-angle": exactValuesAnyAngleQuestion,
  "supplementary-complementary": supplementaryComplementaryQuestion,
  "given-one-ratio": givenOneRatioQuestion,
  "trig-graph-features": trigGraphFeaturesQuestion,
  "which-trig-graph": whichTrigGraphQuestion,
  "solve-from-graph": solveFromGraphQuestion,
  "solve-exact": solveExactQuestion,
  "solve-calculator": solveCalculatorQuestion,
  "obtuse-angle-triangle": obtuseAngleTriangleQuestion
};

export function getTrigonometryDQuestionTypes() { return TYPE_LIST; }
export function generateTrigonometryDQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
