/*
  Mills Maths Tools — Stage 5 Question Bank: Non-linear Relationships C
  ----------------------------------------------------------------------
  question-banks/stage-5/non-linear-relationships-c/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-NLI-P-01 (Path):
    graphs and interprets parabolas, exponentials, hyperbolas and circles,
    and their transformations.

  Content:
    - parabolas: intercepts, axis of symmetry x = −b/2a, the vertex,
      completing the square to vertex form y = a(x − h)² + k, sketching
    - transformations of y = x², y = aˣ, y = k/x (translations, dilations,
      reflections) and finding equations from graphs
    - exponentials: intercept, horizontal asymptote, growth or decay
    - hyperbolas: asymptotes, branches and intercepts
    - circles: (x − h)² + (y − k)² = r², completing the square, points
      inside/on/outside
    - intersections of a line with a parabola or circle, algebraically
    - identifying graphs from equations (A–D option cards)

  Every graph is drawn by the plane engine from the same parameters used to
  write the answer.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";
import { num, MINUS, poly, joinTerms, mono, Q, rat, surdParts, surdText } from "../../_shared/algebra-helpers.js";

const TOPIC = "Non-linear Relationships C";

const TYPE_LIST = [
  { id: "parabola-features", label: "Features of a parabola from its equation" },
  { id: "complete-square-vertex", label: "Complete the square to find the vertex" },
  { id: "sketch-parabola", label: "Sketch a parabola showing key features" },
  { id: "parabola-transformations", label: "Transformations of y = x²" },
  { id: "parabola-from-graph", label: "Find a parabola's equation from its graph" },
  { id: "exponential-features", label: "Exponential graphs and asymptotes" },
  { id: "exponential-from-graph", label: "Find an exponential's equation from its graph" },
  { id: "hyperbola-features", label: "Hyperbolas and their asymptotes" },
  { id: "circle-centre-radius", label: "Centre and radius of a circle" },
  { id: "circle-complete-square", label: "Circles: complete the square" },
  { id: "circle-from-graph", label: "Write the equation of a circle from its graph" },
  { id: "point-and-circle", label: "Is a point inside, on or outside a circle?" },
  { id: "cubic-graphs", label: "Cubic curves: y = ax³ + d and factored cubics" },
  { id: "which-graph", label: "Which graph matches the equation? (A–D)" },
  { id: "line-curve-intersection", label: "Intersection of a line and a curve" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "non-linear", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };
const pt = (x, y) => `(${num(x)}, ${num(y)})`;
const shiftX = h => (h === 0 ? "x" : `(x ${h > 0 ? MINUS : "+"} ${Math.abs(h)})`);
const addK = k => (k === 0 ? "" : ` ${k > 0 ? "+" : MINUS} ${Math.abs(k)}`);
const coefStr = a => (a === 1 ? "" : a === -1 ? MINUS : num(a));

/* y = a(x − h)² + k as text */
export function vertexForm(a, h, k) { return `y = ${coefStr(a)}${shiftX(h)}²${addK(k)}`; }
/* y = a·bˣ⁻ʰ + k style (h = 0 only here) */
const expStr = (a, base, k, neg = false) => `y = ${coefStr(a)}${base}${neg ? "⁻ˣ" : "ˣ"}${addK(k)}`;
const hypStr = (k, h, v) => `y = ${k < 0 ? MINUS : ""}[[algfrac:${Math.abs(k)}:${h === 0 ? "x" : `x ${h > 0 ? MINUS : "+"} ${Math.abs(h)}`}]]${addK(v)}`;
const circStr = (h, k, r2) => `${h === 0 ? "x²" : `${shiftX(h)}²`} + ${k === 0 ? "y²" : `(y ${k > 0 ? MINUS : "+"} ${Math.abs(k)})²`} = ${r2}`;
const exact = n => { const p = surdParts(n); return p.in === 1 ? String(p.out) : surdText(p.out, p.in); };

function parabolaFeaturesQuestion() {
  const a = choice([1, 1, 1, -1, 2]); const r1 = randInt(-5, 3); const r2 = r1 + randInt(1, 6);
  // y = a(x − r1)(x − r2)
  const b = -a * (r1 + r2); const c = a * r1 * r2;
  const h = (r1 + r2) / 2; const k = a * (h - r1) * (h - r2);
  const eq = `y = ${poly([a, b, c])}`;
  return q({
    type: "parabola-features", marks: 5,
    prompt: `For the parabola ${eq}:`,
    subparts: [
      { label: "(a)", prompt: "Find the y-intercept.", marks: 1, answer: num(c), working: [`x = 0 gives y = ${num(c)}`] },
      { label: "(b)", prompt: "Find the x-intercepts.", marks: 2, answer: `x = ${num(r1)} and x = ${num(r2)}`, working: [`${poly([a, b, c])} = 0`, `${a === 1 ? "" : a === -1 ? MINUS : num(a)}${shiftX(r1)}${shiftX(r2)} = 0`.replace(/^x/, "x"), `x = ${num(r1)} or x = ${num(r2)}`] },
      { label: "(c)", prompt: "Write down the equation of the axis of symmetry.", marks: 1, answer: `x = ${num(h)}`, working: [`x = −b/(2a) = ${num(-b)}/${num(2 * a)} = ${num(h)}`, "(halfway between the x-intercepts)"] },
      { label: "(d)", prompt: "Find the coordinates of the vertex, and state whether it is a maximum or a minimum.", marks: 1, answer: `${pt(h, k)}, ${a > 0 ? "minimum" : "maximum"}`, working: [`Substitute x = ${num(h)}: y = ${num(k)}`, a > 0 ? "a > 0, concave up: minimum" : "a < 0, concave down: maximum"] }
    ],
    answer: `(a) ${num(c)}; (b) x = ${num(r1)}, ${num(r2)}; (c) x = ${num(h)}; (d) ${pt(h, k)} ${a > 0 ? "minimum" : "maximum"}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["parabola", "vertex", "intercepts"]
  });
}

function completeSquareVertexQuestion() {
  const p = nz(-5, 5); const qq = randInt(-9, 6);
  const b = 2 * p; const c = p * p + qq;
  const eq = `y = ${poly([1, b, c])}`;
  const ans = `y = ${p === 0 ? "x" : `(x ${p > 0 ? "+" : MINUS} ${Math.abs(p)})`}²${addK(qq)}`;
  return q({
    type: "complete-square-vertex", marks: 3,
    prompt: `By completing the square, write ${eq} in the form y = (x − h)² + k. Hence state the coordinates of the vertex.`,
    answer: `${ans}; vertex ${pt(-p, qq)}`,
    working: [`Half of ${num(b)} is ${num(p)}; (${num(p)})² = ${p * p}`, `y = (${poly([1, b, 0])} + ${p * p})${addK(c - p * p)}`, ans, `Vertex ${pt(-p, qq)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [
      `y = (x ${p > 0 ? "+" : MINUS} ${Math.abs(p)})²${addK(c - p * p + 2 * p * p)}; vertex ${pt(-p, c + p * p)}`,
      `${ans}; vertex ${pt(p, qq)}`,
      `y = (x ${p > 0 ? "+" : MINUS} ${Math.abs(b)})²${addK(c - b * b)}; vertex ${pt(-b, c - b * b)}`
    ],
    tags: ["completing the square", "vertex"]
  });
}

function sketchParabolaQuestion() {
  const a = choice([1, -1]); const r1 = randInt(-4, 1); const r2 = r1 + choice([2, 4, 6]);
  const b = -a * (r1 + r2); const c = a * r1 * r2; const h = (r1 + r2) / 2; const k = a * (h - r1) * (h - r2);
  const yMin = Math.min(-2, k, c) - 1; const yMax = Math.max(2, k, c) + 1;
  return q({
    type: "sketch-parabola", marks: 3,
    prompt: `Sketch the parabola y = ${poly([a, b, c])} on the axes, showing the intercepts and the vertex.`,
    diagram: plane({ xMin: Math.min(-2, r1 - 2), xMax: Math.max(2, r2 + 2), yMin, yMax, yLabelEvery: yMax - yMin > 14 ? 2 : 1 }),
    answer: `Concave ${a > 0 ? "up" : "down"}; x-intercepts ${num(r1)} and ${num(r2)}; y-intercept ${num(c)}; vertex ${pt(h, k)}.`,
    working: [`Factorise: y = ${a < 0 ? MINUS : ""}${shiftX(r1)}${shiftX(r2)}`, `Axis x = ${num(h)}, vertex ${pt(h, k)}`, `y-intercept ${num(c)}`],
    space: "none",
    mcEligible: false,
    tags: ["sketch", "parabola"]
  });
}

function parabolaTransformationsQuestion() {
  const v = choice(["describe", "write", "describe"]);
  const a = choice([1, 1, -1, 2, -2, 3]); const h = randInt(-4, 4); const k = randInt(-5, 5);
  if (h === 0 && k === 0 && a === 1) return parabolaTransformationsQuestion();
  const steps = [];
  if (Math.abs(a) !== 1) steps.push(`dilated vertically by a factor of ${Math.abs(a)}`);
  if (a < 0) steps.push("reflected in the x-axis");
  if (h !== 0) steps.push(`translated ${Math.abs(h)} unit${Math.abs(h) === 1 ? "" : "s"} ${h > 0 ? "right" : "left"}`);
  if (k !== 0) steps.push(`translated ${Math.abs(k)} unit${Math.abs(k) === 1 ? "" : "s"} ${k > 0 ? "up" : "down"}`);
  const desc = steps.join(", then ");
  if (v === "describe") {
    return q({
      type: "parabola-transformations", marks: 2,
      prompt: `Describe the transformations that map y = x² onto ${vertexForm(a, h, k)}, and state the vertex of the new parabola.`,
      answer: `${desc[0].toUpperCase()}${desc.slice(1)}. Vertex ${pt(h, k)}.`,
      working: [`y = a(x − h)² + k with a = ${num(a)}, h = ${num(h)}, k = ${num(k)}`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: h !== 0 ? [`${desc.replace(/right|left/, m => (m === "right" ? "left" : "right"))[0].toUpperCase()}${desc.replace(/right|left/, m => (m === "right" ? "left" : "right")).slice(1)}. Vertex ${pt(-h, k)}.`] : [],
      tags: ["transformations"]
    });
  }
  return q({
    type: "parabola-transformations", marks: 2,
    prompt: `The parabola y = x² is ${desc}. Write the equation of the new parabola.`,
    answer: vertexForm(a, h, k),
    working: [steps.map(s => `${s}`).join("; "), vertexForm(a, h, k)],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [vertexForm(a, -h, k), vertexForm(-a, h, k), vertexForm(a, k, h)].filter(s => s !== vertexForm(a, h, k)),
    tags: ["transformations"]
  });
}

function parabolaFromGraphQuestion() {
  const a = choice([1, -1, 2, -2, [1, 2], [-1, 2]]);
  const A = Array.isArray(a) ? new Q(a[0], a[1]) : new Q(a, 1);
  const h = randInt(-3, 3); const k = randInt(-4, 4);
  const dx = A.d === 2 ? 2 : choice([1, 2]);
  const px = h + dx; const py = k + (A.n * dx * dx) / A.d;
  const yMin = Math.min(k, py, 0) - 2; const yMax = Math.max(k, py, 0) + 2;
  const aTxt = A.d === 1 ? coefStr(A.n) : `${A.n < 0 ? MINUS : ""}[[frac:1:2]]`;
  const ans = `y = ${aTxt}${shiftX(h)}²${addK(k)}`;
  return q({
    type: "parabola-from-graph", marks: 3,
    prompt: "The parabola shown has vertex V and passes through the point P. Find its equation in the form y = a(x − h)² + k.",
    diagram: plane({ xMin: Math.min(-2, h - 4), xMax: Math.max(2, h + 4), yMin, yMax, yLabelEvery: yMax - yMin > 14 ? 2 : 1, curves: [{ kind: "quadratic", a: A.n / A.d, h, k }], points: [{ x: h, y: k, label: `V${pt(h, k)}`, labelPos: A.n > 0 ? "s" : "n" }, { x: px, y: py, label: `P${pt(px, py)}`, labelPos: "e" }] }),
    answer: ans,
    working: [`y = a${shiftX(h)}²${addK(k)}`, `Substitute P: ${num(py)} = a(${num(dx)})²${addK(k)}`, `a = ${A.text()}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`y = ${aTxt}${shiftX(-h)}²${addK(k)}`, `y = ${coefStr(A.d === 1 ? -A.n : A.n * 2)}${shiftX(h)}²${addK(k)}`, `y = ${aTxt}${shiftX(k)}²${addK(h)}`].filter(s => s !== ans),
    tags: ["parabola", "equation from graph"]
  });
}

function exponentialFeaturesQuestion() {
  const base = choice([2, 3]); const k = randInt(-4, 3); const neg = Math.random() < 0.4;
  const eq = expStr(1, base, k, neg);
  const yi = 1 + k;
  return q({
    type: "exponential-features", marks: 3,
    prompt: `For the curve ${eq}:`,
    subparts: [
      { label: "(a)", prompt: "Find the y-intercept.", marks: 1, answer: num(yi), working: [`${base}⁰ = 1, so y = 1${addK(k)} = ${num(yi)}`] },
      { label: "(b)", prompt: "Write the equation of the horizontal asymptote.", marks: 1, answer: `y = ${num(k)}`, working: [`${base}${neg ? "⁻ˣ" : "ˣ"} → 0 as x → ${neg ? "∞" : MINUS + "∞"}`] },
      { label: "(c)", prompt: "Is the function increasing or decreasing? Explain.", marks: 1, answer: neg ? "Decreasing: as x increases, " + base + "⁻ˣ = (1/" + base + ")ˣ gets smaller." : `Increasing: as x increases, ${base}ˣ gets larger.`, working: [] }
    ],
    diagram: Math.random() < 0.5 ? plane({ xMin: -4, xMax: 4, yMin: Math.min(-6, k - 2), yMax: 10, yLabelEvery: 2, curves: [{ kind: "exp", a: 1, base: neg ? 1 / base : base, h: 0, k, label: eq.replace("y = ", "y = ") }] }) : undefined,
    answer: `(a) ${num(yi)}; (b) y = ${num(k)}; (c) ${neg ? "decreasing" : "increasing"}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["exponential", "asymptote"]
  });
}

function exponentialFromGraphQuestion() {
  const base = choice([2, 3]); const k = randInt(-3, 2);
  const yi = 1 + k; const x1 = base === 2 ? 2 : 1; const y1 = base ** x1 + k;
  return q({
    type: "exponential-from-graph", marks: 2,
    prompt: "The graph shows a curve of the form y = aˣ + k. Use the asymptote and the marked point to find a and k.",
    diagram: plane({ xMin: -4, xMax: 4, yMin: Math.min(-5, k - 2), yMax: Math.max(10, y1 + 2), yLabelEvery: 2, curves: [{ kind: "exp", a: 1, base, h: 0, k }], points: [{ x: 0, y: yi, label: pt(0, yi), labelPos: "nw" }, { x: x1, y: y1, label: pt(x1, y1), labelPos: "e" }] }),
    answer: `a = ${base}, k = ${num(k)}: y = ${base}ˣ${addK(k)}`,
    working: [`Asymptote y = ${num(k)}, so k = ${num(k)}`, `At x = ${x1}: a${x1 === 2 ? "²" : ""} ${k < 0 ? "−" : "+"} ${Math.abs(k)} = ${num(y1)}, so a${x1 === 2 ? "²" : ""} = ${base ** x1}`, `a = ${base}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`a = ${base}, k = ${num(-k)}: y = ${base}ˣ${addK(-k)}`, `a = ${base + 1}, k = ${num(k)}: y = ${base + 1}ˣ${addK(k)}`, ...(x1 === 2 ? [`a = ${base * base}, k = ${num(k)}: y = ${base * base}ˣ${addK(k)}`] : [])].filter(t => !t.includes("k = 0: y") || true),
    tags: ["exponential", "equation from graph"]
  });
}

function hyperbolaFeaturesQuestion() {
  const k = choice([1, 2, 3, 4, 6, -1, -2, -4]); const h = randInt(-3, 3); const v = randInt(-3, 3);
  const eq = hypStr(k, h, v);
  // y-intercept exists if h ≠ 0: y = k/(−h) + v
  const yInt = h === 0 ? null : new Q(k, -h).add(new Q(v, 1));
  // x-intercept: k/(x−h) = −v → x = h − k/v (v ≠ 0)
  const xInt = v === 0 ? null : new Q(h, 1).sub(new Q(k, v));
  const withGraph = Math.random() < 0.5;
  return q({
    type: "hyperbola-features", marks: 3,
    prompt: `For the hyperbola ${eq}:`,
    diagram: withGraph ? plane({ xMin: -8, xMax: 8, yMin: -8, yMax: 8, xLabelEvery: 2, yLabelEvery: 2, curves: [{ kind: "hyperbola", k, h, v }] }) : undefined,
    subparts: [
      { label: "(a)", prompt: "Write down the equations of the asymptotes.", marks: 1, answer: `x = ${num(h)} and y = ${num(v)}`, working: ["The denominator is zero at x = " + num(h) + "; the fraction → 0 so y → " + num(v)] },
      { label: "(b)", prompt: "Find any intercepts with the axes.", marks: 2, answer: [yInt ? `y-intercept ${yInt.toString()}` : "no y-intercept (x = 0 is an asymptote)", xInt ? `x-intercept ${xInt.toString()}` : "no x-intercept (y = 0 is an asymptote)"].join("; "), working: [yInt ? `x = 0: y = ${yInt.text()}` : "", xInt ? `y = 0: ${num(k)}/(x − ${num(h)}) = ${num(-v)} → x = ${xInt.text()}` : ""].filter(Boolean) },
      ...(withGraph ? [] : [{ label: "(c)", prompt: "Sketch the hyperbola, showing the asymptotes as dashed lines.", marks: 1, answer: `Branches ${k > 0 ? "top-right and bottom-left" : "top-left and bottom-right"} of the asymptotes' crossing point ${pt(h, v)}.`, working: [], space: SPACE_SIZES.LARGE }])
    ],
    answer: `Asymptotes x = ${num(h)}, y = ${num(v)}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["hyperbola", "asymptote"]
  });
}

const R2 = [1, 4, 9, 16, 25, 36, 49, 2, 3, 5, 8, 10, 12, 20];

function circleCentreRadiusQuestion() {
  const v = choice(["read", "read", "write"]);
  const h = randInt(-5, 5); const k = randInt(-5, 5); const r2 = choice(R2);
  if (v === "read") {
    return q({
      type: "circle-centre-radius", marks: 2,
      prompt: `Find the centre and radius of the circle ${circStr(h, k, r2)}.`,
      answer: `Centre ${pt(h, k)}, radius ${exact(r2)}`,
      working: [`(x − h)² + (y − k)² = r²`, `h = ${num(h)}, k = ${num(k)}, r² = ${r2}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`Centre ${pt(-h, -k)}, radius ${exact(r2)}`, `Centre ${pt(h, k)}, radius ${r2}`, `Centre ${pt(-h, -k)}, radius ${r2}`].filter(s => s !== `Centre ${pt(h, k)}, radius ${exact(r2)}`),
      tags: ["circle"]
    });
  }
  const r = randInt(2, 7);
  return q({
    type: "circle-centre-radius", marks: 1,
    prompt: `Write the equation of the circle with centre ${pt(h, k)} and radius ${r}.`,
    answer: circStr(h, k, r * r),
    working: [`(x − h)² + (y − k)² = r²`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [circStr(-h, -k, r * r), circStr(h, k, r)].filter(s => s !== circStr(h, k, r * r)),
    tags: ["circle"]
  });
}

function circleCompleteSquareQuestion() {
  const h = nz(-5, 5); const k = nz(-5, 5); const r = randInt(1, 7);
  const D = -2 * h; const E = -2 * k; const F = h * h + k * k - r * r;
  const eq = `${joinTerms(["x²", "y²", mono(D, { x: 1 }), mono(E, { y: 1 }), num(F)])} = 0`.replace(/^x² \+ y² /, "x² + y² ");
  return q({
    type: "circle-complete-square", marks: 3,
    prompt: `By completing the squares, find the centre and radius of the circle ${eq}.`,
    answer: `${circStr(h, k, r * r)}: centre ${pt(h, k)}, radius ${r}`,
    working: [`(${joinTerms(["x²", mono(D, { x: 1 })])} + ${h * h}) + (${joinTerms(["y²", mono(E, { y: 1 })])} + ${k * k}) = ${num(-F)} + ${h * h} + ${k * k}`, circStr(h, k, r * r)],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${circStr(-h, -k, r * r)}: centre ${pt(-h, -k)}, radius ${r}`, `${circStr(h, k, r * r)}: centre ${pt(h, k)}, radius ${r * r}`, `${circStr(h, k, r * r + 2 * F)}: centre ${pt(h, k)}, radius ${exact(Math.abs(r * r + 2 * F)) }`].filter(t => !t.includes("= 0:") && !t.includes("= -")),
    tags: ["circle", "completing the square"]
  });
}

function circleFromGraphQuestion() {
  const h = randInt(-3, 3); const k = randInt(-3, 3); const r = randInt(2, 4);
  return q({
    type: "circle-from-graph", marks: 2,
    prompt: "Write the equation of the circle shown.",
    diagram: plane({ xMin: -8, xMax: 8, yMin: -8, yMax: 8, xLabelEvery: 2, yLabelEvery: 2, curves: [{ kind: "circle", h, k, r }], points: [{ x: h, y: k, label: "" }] }),
    answer: circStr(h, k, r * r),
    working: [`Centre ${pt(h, k)} and radius ${r} read from the grid`, circStr(h, k, r * r)],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [circStr(-h, -k, r * r), circStr(h, k, r), circStr(k, h, r * r)].filter(s => s !== circStr(h, k, r * r)),
    tags: ["circle", "equation from graph"]
  });
}

function pointAndCircleQuestion() {
  const r = randInt(3, 8); const trip = choice([[3, 4, 5], [6, 8, 10], [5, 12, 13], [0, 1, 1]]);
  const which = choice(["inside", "on", "outside"]);
  let x, y;
  if (which === "on") { const s = r / trip[2]; if (!Number.isInteger(s * trip[0]) || !Number.isInteger(s * trip[1])) { x = r; y = 0; } else { x = s * trip[0]; y = s * trip[1]; } }
  else { do { x = randInt(-r - 2, r + 2); y = randInt(-r - 2, r + 2); } while ((which === "inside" ? x * x + y * y >= r * r : x * x + y * y <= r * r)); }
  x *= choice([1, -1]); y *= choice([1, -1]);
  const d2 = x * x + y * y;
  const res = d2 < r * r ? "inside" : d2 === r * r ? "on" : "outside";
  return q({
    type: "point-and-circle", marks: 2,
    prompt: `Does the point ${pt(x, y)} lie inside, on or outside the circle x² + y² = ${r * r}? Justify your answer.`,
    answer: `${res[0].toUpperCase()}${res.slice(1)}: x² + y² = ${d2}, which is ${d2 < r * r ? "less than" : d2 === r * r ? "equal to" : "greater than"} r² = ${r * r}`,
    working: [`(${num(x)})² + (${num(y)})² = ${d2}`, `Compare with r² = ${r * r}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["inside", "on", "outside"].filter(s => s !== res).map(s => `${s[0].toUpperCase()}${s.slice(1)}`),
    tags: ["circle"]
  });
}


function cubicGraphsQuestion() {
  if (Math.random() < 0.4) {
    const a = choice([1, -1, 2]); const d = randInt(-4, 4);
    const eq = `y = ${coefStr(a)}x³${addK(d)}`;
    return q({
      type: "cubic-graphs", marks: 2,
      prompt: `Describe how the graph of ${eq} is related to y = x³, and state its y-intercept and the coordinates of its point of inflection.`,
      diagram: plane({ xMin: -3, xMax: 3, yMin: -8, yMax: 8, yLabelEvery: 2, curves: [{ kind: "poly", coeffs: [1, 0, 0, 0], dashed: true, label: "y = x³" }] }),
      answer: `${[Math.abs(a) !== 1 ? `Dilated vertically by factor ${Math.abs(a)}` : "", a < 0 ? "reflected in the x-axis" : "", d !== 0 ? `translated ${Math.abs(d)} ${d > 0 ? "up" : "down"}` : ""].filter(Boolean).join(", ") || "Identical"}; y-intercept ${num(d)}; point of inflection ${pt(0, d)}.`,
      working: [`y = ax³ + d with a = ${num(a)}, d = ${num(d)}`],
      space: SPACE_SIZES.MEDIUM,
      mcEligible: false,
      tags: ["cubic"]
    });
  }
  const roots = []; while (roots.length < 3) { const r = randInt(-3, 3); if (!roots.includes(r)) roots.push(r); }
  roots.sort((x, y) => x - y);
  const a = choice([1, -1]);
  const yi = a * -roots[0] * -roots[1] * -roots[2];
  const f = `y = ${a < 0 ? MINUS : ""}${roots.map(shiftX).join("")}`;
  return q({
    type: "cubic-graphs", marks: 3,
    prompt: `For the cubic ${f}, find the x- and y-intercepts, and describe the shape of the curve for large positive x.`,
    answer: `x-intercepts ${roots.map(num).join(", ")}; y-intercept ${num(yi)}; as x → ∞, y → ${a > 0 ? "∞ (rises to the right)" : `${MINUS}∞ (falls to the right)`}.`,
    working: [`y = 0 when x = ${roots.map(num).join(", ")}`, `x = 0: y = ${a < 0 ? `${MINUS}(` : "("}${roots.map(r => num(-r)).join(")(")}) = ${num(yi)}`, `Leading term ${a < 0 ? MINUS : ""}x³`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["cubic", "intercepts"]
  });
}

/* which-graph: four option cards */
const FAMILY = {
  parabola: () => { const a = choice([1, -1]); const k = randInt(-3, 3); return { eq: `y = ${a < 0 ? MINUS : ""}x²${addK(k)}`, curve: { kind: "quadratic", a, h: 0, k }, alt: [{ kind: "quadratic", a: -a, h: 0, k }, { kind: "quadratic", a, h: 0, k: -k || 2 }, { kind: "quadratic", a, h: k || 2, k: 0 }] }; },
  exponential: () => { const k = randInt(-2, 2); const neg = Math.random() < 0.5; return { eq: expStr(1, 2, k, neg), curve: { kind: "exp", a: 1, base: neg ? 0.5 : 2, h: 0, k }, alt: [{ kind: "exp", a: 1, base: neg ? 2 : 0.5, h: 0, k }, { kind: "exp", a: -1, base: neg ? 0.5 : 2, h: 0, k }, { kind: "exp", a: 1, base: neg ? 0.5 : 2, h: 0, k: k === 0 ? 2 : -k }] }; },
  hyperbola: () => { const k = choice([2, -2, 4, -4]); const h = randInt(-2, 2); return { eq: hypStr(k, h, 0), curve: { kind: "hyperbola", k, h, v: 0 }, alt: [{ kind: "hyperbola", k: -k, h, v: 0 }, { kind: "hyperbola", k, h: h === 0 ? 2 : -h, v: 0 }, { kind: "hyperbola", k, h: 0, v: h === 0 ? 2 : h }] }; },
  circle: () => { const h = randInt(-2, 2); const k = randInt(-2, 2); const r = choice([2, 3]); return { eq: circStr(h, k, r * r), curve: { kind: "circle", h, k, r }, alt: [{ kind: "circle", h: -h || 1, k: -k || 1, r }, { kind: "circle", h, k, r: r === 2 ? 3 : 2 }, { kind: "circle", h: k || -1, k: h || 1, r: r + 1 }] }; }
};

function whichGraphQuestion() {
  const fam = choice(Object.keys(FAMILY));
  const f = FAMILY[fam]();
  const cards = shuffle([{ c: f.curve, ok: true }, ...f.alt.map(c => ({ c, ok: false }))]);
  const letters = ["A", "B", "C", "D"];
  const correct = letters[cards.findIndex(x => x.ok)];
  return q({
    type: "which-graph", marks: 1,
    prompt: `Which graph shows ${f.eq}?`,
    diagram: plane({ diagramType: "options", columns: 2, panels: cards.map((x, i) => ({ label: letters[i], xMin: -5, xMax: 5, yMin: -5, yMax: 5, xLabelEvery: 2, yLabelEvery: 2, numbers: true, grid: true, equal: true, curves: [x.c] })) }),
    answer: correct,
    working: [`Check the key features of ${f.eq} (intercepts, asymptotes, direction) against each graph.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: letters.filter(l => l !== correct),
    tags: ["identify graphs", fam]
  });
}

function lineCurveIntersectionQuestion() {
  const v = choice(["parabola", "parabola", "circle"]);
  if (v === "parabola") {
    const x1 = randInt(-4, 2); const x2 = x1 + randInt(1, 5); const m = randInt(-3, 3); const c = randInt(-4, 4);
    // x² + bx + d = mx + c with roots x1, x2 → x² − (x1+x2)x + x1x2 = 0 → b = m − (x1+x2), d = c + x1x2
    const b = m - (x1 + x2); const d = c + x1 * x2;
    const y1 = m * x1 + c; const y2 = m * x2 + c;
    return q({
      type: "line-curve-intersection", marks: 3,
      prompt: `Find the points of intersection of the parabola y = ${poly([1, b, d])} and the line y = ${poly([m, c]) || "0"}.`,
      answer: `${pt(x1, y1)} and ${pt(x2, y2)}`,
      working: [`${poly([1, b, d])} = ${poly([m, c]) || "0"}`, `${poly([1, -(x1 + x2), x1 * x2])} = 0`, `${shiftX(x1)}${shiftX(x2)} = 0`, `x = ${num(x1)} or x = ${num(x2)}`, `Substitute into the line: ${pt(x1, y1)}, ${pt(x2, y2)}`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [`${pt(x1, x1 * x1 + b * x1 + d + 1)} and ${pt(x2, y2)}`, `${pt(-x1, y1)} and ${pt(-x2, y2)}`],
      tags: ["simultaneous", "parabola"]
    });
  }
  const [a, b2, r] = choice([[3, 4, 5], [0, 5, 5], [6, 8, 10], [5, 0, 5]]);
  // line y = x·(b/a)? use horizontal/vertical or through origin
  const kind = choice(["horizontal", "vertical"]);
  const val = kind === "horizontal" ? b2 : a;
  const other = kind === "horizontal" ? a : b2;
  const pts = other === 0 ? [kind === "horizontal" ? pt(0, val) : pt(val, 0)] : kind === "horizontal" ? [pt(-other, val), pt(other, val)] : [pt(val, -other), pt(val, other)];
  return q({
    type: "line-curve-intersection", marks: 2,
    prompt: `Find where the line ${kind === "horizontal" ? "y" : "x"} = ${val} meets the circle x² + y² = ${r * r}.`,
    answer: pts.join(" and ") + (pts.length === 1 ? " (the line is a tangent)" : ""),
    working: [`${kind === "horizontal" ? "x" : "y"}² + ${val}² = ${r * r}`, `${kind === "horizontal" ? "x" : "y"}² = ${other * other}`, `${kind === "horizontal" ? "x" : "y"} = ${other === 0 ? "0" : `±${other}`}`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["simultaneous", "circle"]
  });
}

const GENERATORS = {
  "parabola-features": parabolaFeaturesQuestion,
  "complete-square-vertex": completeSquareVertexQuestion,
  "sketch-parabola": sketchParabolaQuestion,
  "parabola-transformations": parabolaTransformationsQuestion,
  "parabola-from-graph": parabolaFromGraphQuestion,
  "exponential-features": exponentialFeaturesQuestion,
  "exponential-from-graph": exponentialFromGraphQuestion,
  "hyperbola-features": hyperbolaFeaturesQuestion,
  "circle-centre-radius": circleCentreRadiusQuestion,
  "circle-complete-square": circleCompleteSquareQuestion,
  "circle-from-graph": circleFromGraphQuestion,
  "point-and-circle": pointAndCircleQuestion,
  "cubic-graphs": cubicGraphsQuestion,
  "which-graph": whichGraphQuestion,
  "line-curve-intersection": lineCurveIntersectionQuestion
};

export function getNonLinearRelationshipsCQuestionTypes() { return TYPE_LIST; }
export function generateNonLinearRelationshipsCQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
