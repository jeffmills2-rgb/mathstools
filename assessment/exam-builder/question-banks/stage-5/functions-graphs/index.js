/*
  Mills Maths Tools — Stage 5 Question Bank: Functions and Other Graphs
  ----------------------------------------------------------------------
  question-banks/stage-5/functions-graphs/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-FNC-P-01 (Path):
    uses function notation, describes domain and range, and graphs regions
    defined by inequalities.

  Content:
    - relations and functions: ordered pairs, mapping, the vertical line test
    - function notation f(x): evaluate, substitute expressions, solve
      f(x) = k
    - domain and range from equations and from graphs (open and closed
      endpoints)
    - regions: graph linear inequalities in two variables (dashed or solid
      boundary, shading, test points), and regions satisfying more than
      one inequality

  Region diagrams use the plane engine's `regions`, which shades the
  intersection and draws strict boundaries dashed.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";
import { num, MINUS, poly, lin } from "../../_shared/algebra-helpers.js";

const TOPIC = "Functions and Other Graphs";

const TYPE_LIST = [
  { id: "function-ordered-pairs", label: "Is the relation a function? (pairs)" },
  { id: "vertical-line-test", label: "The vertical line test" },
  { id: "evaluate-function", label: "Evaluate f(x)" },
  { id: "substitute-expression", label: "Substitute expressions into f(x)" },
  { id: "solve-f-equals-k", label: "Solve f(x) = k" },
  { id: "domain-range-equation", label: "Domain and range from an equation" },
  { id: "domain-range-graph", label: "Domain and range from a graph" },
  { id: "test-point-region", label: "Does the point lie in the region?" },
  { id: "inequality-from-region", label: "Write the inequality for a region" },
  { id: "graph-inequality-region", label: "Graph a region y > mx + c" },
  { id: "multiple-inequalities", label: "Regions with more than one inequality" },
  { id: "function-multi-part", label: "Multi-part function problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "functions", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };
const pt = (x, y) => `(${num(x)}, ${num(y)})`;
const paren = v => (v < 0 ? `(${num(v)})` : num(v));
const LETTERS = ["A", "B", "C", "D"];

function functionOrderedPairsQuestion() {
  const xs = shuffle([-2, -1, 0, 1, 2, 3, 4]).slice(0, 4);
  const isF = Math.random() < 0.5;
  const pairs = xs.map(x => [x, randInt(-5, 5)]);
  if (!isF) pairs.push([pairs[randInt(0, 3)][0], randInt(6, 9)]);
  const shown = shuffle(pairs);
  const dup = !isF ? shown.find((p, i) => shown.findIndex(o => o[0] === p[0]) !== i)[0] : null;
  return q({
    type: "function-ordered-pairs", marks: 1,
    prompt: `Is the relation {${shown.map(p => pt(...p)).join(", ")}} a function? Explain.`,
    answer: isF ? "Yes: each x-value is paired with exactly one y-value." : `No: x = ${num(dup)} is paired with two different y-values.`,
    working: [],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["relations", "functions"]
  });
}

const VLT = [
  { c: { kind: "quadratic", a: 1, h: 0, k: -2 }, f: true, n: "parabola" },
  { c: { kind: "circle", h: 0, k: 0, r: 3 }, f: false, n: "circle" },
  { c: { kind: "exp", a: 1, base: 2, h: 0, k: 0 }, f: true, n: "exponential" },
  { c: { kind: "line", x: 2 }, f: false, n: "vertical line" },
  { c: { kind: "hyperbola", k: 2, h: 0, v: 0 }, f: true, n: "hyperbola" },
  { c: { kind: "poly", a: 1, roots: [-2, 0, 2] }, f: true, n: "cubic" },
  { pl: Array.from({ length: 41 }, (_, i) => { const y = -4 + i * 0.2; return [y * y / 3 - 3, y]; }), f: false, n: "sideways parabola" },
  { c: { kind: "circle", h: 1, k: 1, r: 2 }, f: false, n: "circle" }
];

function verticalLineTestQuestion() {
  if (Math.random() < 0.5) {
    const g = choice(VLT);
    return q({
      type: "vertical-line-test", marks: 1,
      prompt: "Use the vertical line test to decide whether the graph shows a function.",
      diagram: plane({ xMin: -5, xMax: 5, yMin: -5, yMax: 5, curves: g.c ? [g.c] : [], polylines: g.pl ? [{ pts: g.pl }] : [] }),
      answer: g.f ? "Function: every vertical line meets the graph at most once." : "Not a function: some vertical lines meet the graph more than once.",
      working: [],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [g.f ? "Not a function: some vertical lines meet the graph more than once." : "Function: every vertical line meets the graph at most once."],
      tags: ["vertical line test"]
    });
  }
  const yes = shuffle(VLT.filter(g => g.f)); const no = shuffle(VLT.filter(g => !g.f));
  const pickNo = Math.random() < 0.5;
  const odd = pickNo ? no[0] : yes[0];
  const rest = pickNo ? yes.slice(0, 3) : no.slice(0, 3);
  if (rest.length < 3) return verticalLineTestQuestion();
  const cards = shuffle([odd, ...rest]);
  const correct = LETTERS[cards.indexOf(odd)];
  return q({
    type: "vertical-line-test", marks: 1,
    prompt: `Which graph does ${pickNo ? "NOT " : ""}show a function?`,
    diagram: plane({ diagramType: "options", columns: 2, panels: cards.map((g, i) => ({ label: LETTERS[i], xMin: -5, xMax: 5, yMin: -5, yMax: 5, numbers: false, grid: true, curves: g.c ? [g.c] : [], polylines: g.pl ? [{ pts: g.pl }] : [] })) }),
    answer: correct,
    working: [`Graph ${correct} (${odd.n}) ${odd.f ? "passes" : "fails"} the vertical line test.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: LETTERS.filter(l => l !== correct),
    tags: ["vertical line test"]
  });
}

function randomF() {
  const kind = choice(["lin", "quad", "quad"]);
  if (kind === "lin") { const c = [nz(-5, 5), randInt(-9, 9)]; return { c, txt: poly(c) }; }
  const c = [nz(-3, 3), randInt(-6, 6), randInt(-9, 9)]; return { c, txt: poly(c) };
}
const ev = (c, x) => c.reduce((a, k) => a * x + k, 0);

function evaluateFunctionQuestion() {
  const F = randomF(); const a = randInt(-4, 4); const b = randInt(-4, 4);
  const v = choice(["one", "two"]);
  if (v === "one") return q({ type: "evaluate-function", marks: 1, prompt: `If f(x) = ${F.txt}, find f(${num(a)}).`, answer: num(ev(F.c, a)), working: [`f(${num(a)}) = ${F.txt.replace(/x/g, paren(a))}`, `= ${num(ev(F.c, a))}`], space: SPACE_SIZES.SMALL, mcDistractors: [num(ev(F.c, -a)), num(ev(F.c, a) + 1), num(a)], tags: ["evaluate"] });
  return q({ type: "evaluate-function", marks: 2, prompt: `If f(x) = ${F.txt}, find f(${num(a)}) − f(${num(b)}).`, answer: num(ev(F.c, a) - ev(F.c, b)), working: [`f(${num(a)}) = ${num(ev(F.c, a))}`, `f(${num(b)}) = ${num(ev(F.c, b))}`, `Difference ${num(ev(F.c, a) - ev(F.c, b))}`], space: SPACE_SIZES.SMALL, mcDistractors: [num(ev(F.c, a - b)), num(ev(F.c, a) + ev(F.c, b))], tags: ["evaluate"] });
}

function substituteExpressionQuestion() {
  const v = choice(["a+h", "2a", "-x"]);
  const c = [1, randInt(-6, 6), randInt(-9, 9)];
  const f = poly(c);
  if (v === "a+h") {
    const h = nz(-3, 3);
    // (a+h)² + b(a+h) + c = a² + (2h + b)a + (h² + bh + c)
    const r = [1, 2 * h + c[1], h * h + c[1] * h + c[2]];
    return q({ type: "substitute-expression", marks: 2, prompt: `If f(x) = ${f}, find and simplify f(a ${h < 0 ? MINUS : "+"} ${Math.abs(h)}).`, answer: poly(r, "a"), working: [`f(a ${h < 0 ? MINUS : "+"} ${Math.abs(h)}) = (a ${h < 0 ? MINUS : "+"} ${Math.abs(h)})² ${c[1] < 0 ? MINUS : "+"} ${Math.abs(c[1])}(a ${h < 0 ? MINUS : "+"} ${Math.abs(h)}) ${c[2] < 0 ? MINUS : "+"} ${Math.abs(c[2])}`.replace(/ [+−] 0\(.*?\)/, "").replace(/ [+−] 0$/, ""), poly(r, "a")], space: SPACE_SIZES.MEDIUM, mcDistractors: [poly([1, c[1], c[2] + h], "a"), poly([1, h + c[1], h * h + c[1] * h + c[2]], "a")], tags: ["substitute"] });
  }
  if (v === "2a") {
    const r = [4, 2 * c[1], c[2]];
    return q({ type: "substitute-expression", marks: 1, prompt: `If f(x) = ${f}, find f(2a).`, answer: poly(r, "a"), working: [`(2a)² = 4a²`, poly(r, "a")], space: SPACE_SIZES.SMALL, mcDistractors: [poly([2, 2 * c[1], c[2]], "a"), poly([2, 2 * c[1], 2 * c[2]], "a")], tags: ["substitute"] });
  }
  const r = [1, -c[1], c[2]];
  return q({ type: "substitute-expression", marks: 1, prompt: `If f(x) = ${f}, find f(−x). Is f(−x) = f(x)?`, answer: `f(−x) = ${poly(r)}; ${c[1] === 0 ? "yes, they are equal (f is even)" : "no, not equal"}`, working: ["(−x)² = x²", `f(−x) = ${poly(r)}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["substitute"] });
}

function solveFEqualsKQuestion() {
  const v = choice(["lin", "quad"]);
  if (v === "lin") {
    const m = nz(-5, 5); const c = randInt(-8, 8); const x = randInt(-6, 6); const k = m * x + c;
    return q({ type: "solve-f-equals-k", marks: 1, prompt: `If f(x) = ${lin(m, c)}, find x such that f(x) = ${num(k)}.`, answer: `x = ${num(x)}`, working: [`${lin(m, c)} = ${num(k)}`, `x = ${num(x)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`x = ${num(m * k + c)}`, `x = ${num(-x)}`], tags: ["solve"] });
  }
  const r = randInt(1, 6); const c = randInt(-5, 5); const k = r * r + c;
  return q({ type: "solve-f-equals-k", marks: 2, prompt: `If f(x) = ${poly([1, 0, c])}, find the values of x for which f(x) = ${k}.`, answer: `x = ±${r}`, working: [`x² ${c < 0 ? MINUS : "+"} ${Math.abs(c)} = ${k}`.replace(" + 0", ""), `x² = ${r * r}`, `x = ±${r}`], space: SPACE_SIZES.SMALL, mcDistractors: [`x = ${r}`, `x = ±${r * r}`], tags: ["solve"] });
}

function domainRangeEquationQuestion() {
  const k = randInt(-4, 4); const h = randInt(-4, 4);
  const opts = [
    { f: `y = x² ${k < 0 ? MINUS : "+"} ${Math.abs(k)}`, d: "all real x", r: `y ≥ ${num(k)}` },
    { f: `y = ${MINUS}x² ${k < 0 ? MINUS : "+"} ${Math.abs(k)}`, d: "all real x", r: `y ≤ ${num(k)}` },
    { f: `y = √(x ${h < 0 ? "+" : MINUS} ${Math.abs(h)})`, d: `x ≥ ${num(h)}`, r: "y ≥ 0" },
    { f: `y = [[algfrac:1:x ${h < 0 ? "+" : MINUS} ${Math.abs(h)}]]`, d: `all real x, x ≠ ${num(h)}`, r: "all real y, y ≠ 0" },
    { f: `y = 2ˣ ${k < 0 ? MINUS : "+"} ${Math.abs(k)}`, d: "all real x", r: `y > ${num(k)}` },
    { f: `y = √(9 − x²)`, d: "−3 ≤ x ≤ 3", r: "0 ≤ y ≤ 3" },
    { f: `y = ${lin(nz(-3, 3), k)}`, d: "all real x", r: "all real y" }
  ].map(o => ({ ...o, f: o.f.replace(/ \+ 0(?=\)|$)/, "").replace(/ − 0(?=\)|\]|$)/, "") }));
  const o = choice(opts);
  return q({
    type: "domain-range-equation", marks: 2,
    prompt: `State the domain and range of ${o.f}.`,
    answer: `Domain: ${o.d}; range: ${o.r}`,
    working: ["Domain: the x-values allowed. Range: the y-values produced."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`Domain: ${o.r.replace(/y/g, "x")}; range: ${o.d.replace(/x/g, "y")}`, `Domain: all real x; range: all real y`].filter(s => s !== `Domain: ${o.d}; range: ${o.r}`),
    tags: ["domain", "range"]
  });
}

function domainRangeGraphQuestion() {
  const v = choice(["segment-parabola", "segments"]);
  if (v === "segment-parabola") {
    const a = choice([1, -1]); const k = randInt(-3, 2); const x1 = randInt(-3, -1); const x2 = randInt(1, 3);
    const f = x => a * x * x + k;
    const open2 = Math.random() < 0.5;
    const vals = [f(x1), f(x2), k];
    const lo = Math.min(...vals); const hi = Math.max(...vals);
    const loOpen = open2 && f(x2) === lo && f(x1) !== lo; const hiOpen = open2 && f(x2) === hi && f(x1) !== hi;
    return q({
      type: "domain-range-graph", marks: 2,
      prompt: "State the domain and range of the function shown. (A hollow dot means the endpoint is not included.)",
      diagram: plane({ xMin: -5, xMax: 5, yMin: Math.min(-2, lo - 2), yMax: Math.max(2, hi + 2), yLabelEvery: hi - lo > 7 ? 2 : 1, equal: false, width: 360, height: 300, curves: [{ kind: "quadratic", a, h: 0, k, domain: [x1, x2] }], points: [{ x: x1, y: f(x1) }, { x: x2, y: f(x2), hollow: open2 }] }),
      answer: `Domain: ${num(x1)} ≤ x ${open2 ? "<" : "≤"} ${num(x2)}; range: ${num(lo)} ${loOpen ? "<" : "≤"} y ${hiOpen ? "<" : "≤"} ${num(hi)}`,
      working: [`x runs from ${num(x1)} to ${num(x2)}`, `lowest y ${num(lo)}, highest y ${num(hi)} (the vertex ${pt(0, k)} counts)`],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["domain", "range", "graph"]
    });
  }
  const pts = [[-4, randInt(-3, 3)], [-1, randInt(-3, 3)], [2, randInt(-3, 3)], [4, randInt(-3, 3)]];
  const ys = pts.map(p => p[1]);
  return q({
    type: "domain-range-graph", marks: 2,
    prompt: "State the domain and range of the function shown.",
    diagram: plane({ xMin: -5, xMax: 5, yMin: -5, yMax: 5, polylines: [{ pts }], points: [{ x: pts[0][0], y: pts[0][1] }, { x: pts[3][0], y: pts[3][1] }] }),
    answer: `Domain: −4 ≤ x ≤ 4; range: ${num(Math.min(...ys))} ≤ y ≤ ${num(Math.max(...ys))}`,
    working: ["Read the leftmost and rightmost x, and the lowest and highest y."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`Domain: ${num(Math.min(...ys))} ≤ x ≤ ${num(Math.max(...ys))}; range: −4 ≤ y ≤ 4`, `Domain: all real x; range: ${num(Math.min(...ys))} ≤ y ≤ ${num(Math.max(...ys))}`],
    tags: ["domain", "range", "graph"]
  });
}

/* inequalities: y op m x + c  ⇔  m x − y + c  op' 0 */
const OPS = ["<", "≤", ">", "≥"];
const OPMAP = { "<": "<", "≤": "<=", ">": ">", "≥": ">=" };
const FLIP = { "<": ">", "≤": "≥", ">": "<", "≥": "≤" };
function regionOf(m, c, op) {
  // y op mx + c → mx − y + c FLIP(op) 0
  return { a: m, b: -1, c, op: OPMAP[FLIP[op]] };
}
const rhs = (m, c) => lin(m, c) === "0" ? "0" : lin(m, c);

function testPointRegionQuestion() {
  const m = nz(-3, 3); const c = randInt(-4, 4); const op = choice(OPS);
  const x = randInt(-4, 4); const y = randInt(-5, 5);
  const val = m * x + c;
  const holds = op === "<" ? y < val : op === "≤" ? y <= val : op === ">" ? y > val : y >= val;
  return q({
    type: "test-point-region", marks: 1,
    prompt: `Does the point ${pt(x, y)} lie in the region y ${op} ${rhs(m, c)}?`,
    answer: `${holds ? "Yes" : "No"}: ${num(y)} ${holds ? op : `is not ${op}`} ${num(val)}`,
    working: [`Substitute x = ${num(x)}: ${rhs(m, c).replace(/x/g, `(${num(x)})`)} = ${num(val)}`, `Is ${num(y)} ${op} ${num(val)}? ${holds ? "Yes" : "No"}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${holds ? "No" : "Yes"}: ${num(y)} ${holds ? `is not ${op}` : op} ${num(val)}`],
    tags: ["regions", "test point"]
  });
}

function inequalityFromRegionQuestion() {
  const m = choice([-2, -1, 1, 2, 0.5]); const c = randInt(-3, 3); const op = choice(OPS);
  const mt = m === 0.5 ? "[[frac:1:2]]x" : null;
  const r = mt ? `${mt}${c === 0 ? "" : c > 0 ? ` + ${c}` : ` ${MINUS} ${-c}`}` : rhs(m, c);
  return q({
    type: "inequality-from-region", marks: 2,
    prompt: "Write the inequality that describes the shaded region.",
    diagram: plane({ xMin: -5, xMax: 5, yMin: -5, yMax: 5, regions: [regionOf(m, c, op)], points: [{ x: 0, y: c }] }),
    answer: `y ${op} ${r}`,
    working: [`Boundary: gradient ${m === 0.5 ? "½" : num(m)}, y-intercept ${num(c)}: y = ${r}`, `${op === "<" || op === ">" ? "Dashed: not included (strict)" : "Solid: included"}`, `Shaded ${op === "<" || op === "≤" ? "below" : "above"} the line`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: OPS.filter(o => o !== op).map(o => `y ${o} ${r}`),
    tags: ["regions"]
  });
}

function graphInequalityRegionQuestion() {
  const m = nz(-2, 2); const c = randInt(-3, 3); const op = choice(OPS);
  return q({
    type: "graph-inequality-region", marks: 2,
    prompt: `On the number plane, shade the region y ${op} ${rhs(m, c)}.`,
    diagram: plane({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 }),
    answer: `Draw y = ${rhs(m, c)} as a ${op === "<" || op === ">" ? "dashed" : "solid"} line and shade ${op === "<" || op === "≤" ? "below" : "above"} it.`,
    working: [`Test (0, 0)${c === 0 ? " is on the line; use (0, 1)" : ""}: ${c === 0 ? `1 ${op} ${num(0)}?` : `0 ${op} ${num(c)}?`}`],
    space: "none",
    mcEligible: false,
    tags: ["regions", "graph"]
  });
}

function multipleInequalitiesQuestion() {
  const v = choice(["describe", "shade"]);
  const m = nz(-2, 2); const c = randInt(-1, 3); const xv = randInt(-3, 1); const yv = randInt(-3, 0);
  const ops = [choice(["<", "≤"]), choice([">", "≥"]), choice([">", "≥"])];
  const regions = [regionOf(m, c, ops[0]), { a: 1, b: 0, c: -xv, op: OPMAP[ops[1]] }, { a: 0, b: 1, c: -yv, op: OPMAP[ops[2]] }];
  const list = [`y ${ops[0]} ${rhs(m, c)}`, `x ${ops[1]} ${num(xv)}`, `y ${ops[2]} ${num(yv)}`];
  if (v === "describe") {
    return q({
      type: "multiple-inequalities", marks: 3,
      prompt: "Write down the three inequalities that together describe the shaded region.",
      diagram: plane({ xMin: -5, xMax: 5, yMin: -5, yMax: 5, regions }),
      answer: list.join(", "),
      working: ["Identify each boundary line, then whether the region is above/below or left/right of it, and dashed or solid."],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["regions", "multiple"]
    });
  }
  return q({
    type: "multiple-inequalities", marks: 3,
    prompt: `Shade the region that satisfies all of: ${list.join(", ")}.`,
    diagram: plane({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 }),
    answer: `The region below y = ${rhs(m, c)}, to the right of x = ${num(xv)} and above y = ${num(yv)}; strict boundaries dashed.`,
    working: list.map(s => `${s}: ${/[<>]/.test(s) && !/[≤≥]/.test(s) ? "dashed" : "solid"} boundary`),
    space: "none",
    mcEligible: false,
    tags: ["regions", "multiple"]
  });
}

function functionMultiPartQuestion() {
  const r1 = randInt(-4, 0); const r2 = r1 + randInt(2, 6);
  const c = [1, -(r1 + r2), r1 * r2];
  const h = (r1 + r2) / 2; const k = ev(c, h);
  const t = randInt(-3, 3);
  return q({
    type: "function-multi-part", marks: 5,
    prompt: `Let f(x) = ${poly(c)}.`,
    subparts: [
      { label: "(a)", prompt: `Find f(${num(t)}).`, marks: 1, answer: num(ev(c, t)), working: [] },
      { label: "(b)", prompt: "Solve f(x) = 0.", marks: 2, answer: `x = ${num(r1)} or x = ${num(r2)}`, working: [`${poly(c)} = (x ${r1 < 0 ? "+" : MINUS} ${Math.abs(r1)})(x ${r2 < 0 ? "+" : MINUS} ${Math.abs(r2)})`.replace(/\(x [+−] 0\)/, "x")] },
      { label: "(c)", prompt: "State the range of f.", marks: 2, answer: `y ≥ ${num(k)}`, working: [`Vertex at x = ${num(h)}, f(${num(h)}) = ${num(k)}`, "Concave up, so the minimum is the vertex."] }
    ],
    answer: `(a) ${num(ev(c, t))}; (b) x = ${num(r1)}, ${num(r2)}; (c) y ≥ ${num(k)}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "function-ordered-pairs": functionOrderedPairsQuestion,
  "vertical-line-test": verticalLineTestQuestion,
  "evaluate-function": evaluateFunctionQuestion,
  "substitute-expression": substituteExpressionQuestion,
  "solve-f-equals-k": solveFEqualsKQuestion,
  "domain-range-equation": domainRangeEquationQuestion,
  "domain-range-graph": domainRangeGraphQuestion,
  "test-point-region": testPointRegionQuestion,
  "inequality-from-region": inequalityFromRegionQuestion,
  "graph-inequality-region": graphInequalityRegionQuestion,
  "multiple-inequalities": multipleInequalitiesQuestion,
  "function-multi-part": functionMultiPartQuestion
};

export function getFunctionsGraphsQuestionTypes() { return TYPE_LIST; }
export function generateFunctionsGraphsQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
