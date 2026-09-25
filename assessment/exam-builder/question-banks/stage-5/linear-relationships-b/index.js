/*
  Mills Maths Tools — Stage 5 Question Bank: Linear Relationships B
  ------------------------------------------------------------------
  question-banks/stage-5/linear-relationships-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-LIN-C-02 (Core):
    "graphs and interprets linear relationships using the gradient/slope-
     intercept form"

  Content:
    - y = mx + c: reading the gradient and y-intercept, including after
      rearranging an equation into that form
    - sketching a line from its gradient and y-intercept, and from its
      intercepts
    - finding the equation of a line from its graph, from m and c, from a
      point and the gradient, and through two points
    - parallel lines (equal gradients) and perpendicular lines
      (m₁ × m₂ = −1), and lines parallel or perpendicular to a given line
      through a given point
    - interpreting m and c in a linear model

  All lines are chosen with rational gradients and integer intercepts where
  a graph must be read, so every point used lies on grid lines.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, gcd, fmt
} from "../../_shared/bank-helpers.js";
import { num, MINUS, rat, lin, mono, joinTerms, Q } from "../../_shared/algebra-helpers.js";

const TOPIC = "Linear Relationships B";

const TYPE_LIST = [
  { id: "read-m-and-c", label: "Gradient and y-intercept from y = mx + c" },
  { id: "rearrange-to-form", label: "Rearrange into y = mx + c" },
  { id: "equation-from-graph", label: "Equation of a line from its graph" },
  { id: "sketch-from-m-c", label: "Sketch a line from m and c" },
  { id: "intercepts", label: "x- and y-intercepts" },
  { id: "equation-from-m-c", label: "Equation from gradient and intercept" },
  { id: "equation-point-gradient", label: "Equation from a point and the gradient" },
  { id: "equation-two-points", label: "Equation through two points" },
  { id: "parallel-through-point", label: "Line parallel to a given line" },
  { id: "perpendicular-gradient", label: "Perpendicular gradients" },
  { id: "perpendicular-through-point", label: "Line perpendicular to a given line" },
  { id: "parallel-perpendicular-check", label: "Parallel, perpendicular or neither?" },
  { id: "linear-models", label: "Interpret m and c in context" },
  { id: "multi-part-linear-b", label: "Multi-part straight-line problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "linear", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const pt = (x, y) => `(${num(x)}, ${num(y)})`;
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };

/* "y = mx + c" with a rational m given as Q. */
export function lineEq(m, c) {
  const M = Q.of(m); const C = Q.of(c);
  let mTerm;
  if (M.n === 0) mTerm = "";
  else if (M.d === 1) mTerm = mono(M.n, { x: 1 });
  else mTerm = `${M.n < 0 ? MINUS : ""}${rat(Math.abs(M.n), M.d)}x`;
  const cTerm = C.n === 0 ? "" : C.toString();
  if (!mTerm) return `y = ${cTerm || "0"}`;
  if (!cTerm) return `y = ${mTerm}`;
  return `y = ${joinTerms([mTerm, cTerm])}`;
}
const mText = m => Q.of(m).toString();

function readMAndCQuestion() {
  const v = choice(["standard", "constant-first", "no-c", "fraction"]);
  const m = nz(-6, 6); const c = nz(-9, 9);
  if (v === "standard") return q({ type: "read-m-and-c", marks: 1, prompt: `State the gradient and y-intercept of ${lineEq(m, c)}.`, answer: `Gradient ${num(m)}, y-intercept ${num(c)}`, working: ["In y = mx + c, m is the gradient and c the y-intercept."], space: SPACE_SIZES.SMALL, mcDistractors: [`Gradient ${num(c)}, y-intercept ${num(m)}`, `Gradient ${num(-m)}, y-intercept ${num(c)}`, `Gradient ${num(m)}, y-intercept ${num(-c)}`], tags: ["gradient-intercept form"] });
  if (v === "constant-first") return q({ type: "read-m-and-c", marks: 1, prompt: `State the gradient and y-intercept of y = ${num(c)} ${m < 0 ? MINUS : "+"} ${Math.abs(m) === 1 ? "" : Math.abs(m)}x.`, answer: `Gradient ${num(m)}, y-intercept ${num(c)}`, working: [`Reorder: ${lineEq(m, c)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`Gradient ${num(c)}, y-intercept ${num(m)}`, `Gradient ${num(Math.abs(m))}, y-intercept ${num(c)}`], tags: ["gradient-intercept form"] });
  if (v === "no-c") return q({ type: "read-m-and-c", marks: 1, prompt: `State the gradient and y-intercept of ${lineEq(m, 0)}.`, answer: `Gradient ${num(m)}, y-intercept 0`, working: ["There is no constant term, so c = 0: the line passes through the origin."], space: SPACE_SIZES.SMALL, mcDistractors: [`Gradient ${num(m)}, no y-intercept`, `Gradient 0, y-intercept ${num(m)}`], tags: ["gradient-intercept form"] });
  const d = choice([2, 3, 4]); const n = nz(-5, 5);
  if (gcd(Math.abs(n), d) !== 1) return readMAndCQuestion();
  return q({ type: "read-m-and-c", marks: 1, prompt: `State the gradient and y-intercept of ${lineEq(new Q(n, d), c)}.`, answer: `Gradient ${rat(n, d)}, y-intercept ${num(c)}`, working: ["m is the coefficient of x."], space: SPACE_SIZES.SMALL, mcDistractors: [`Gradient ${rat(d, n)}, y-intercept ${num(c)}`, `Gradient ${num(n)}, y-intercept ${num(c)}`], tags: ["gradient-intercept form"] });
}

function rearrangeToFormQuestion() {
  for (;;) {
    const a = nz(-5, 5); const b = nz(-5, 5); const k = nz(-12, 12);
    // a x + b y = k → y = (−a/b) x + k/b
    const m = new Q(-a, b); const c = new Q(k, b);
    const eq = `${joinTerms([mono(a, { x: 1 }), mono(b, { y: 1 })])} = ${num(k)}`;
    return q({
      type: "rearrange-to-form", marks: 2,
      prompt: `Write ${eq} in the form y = mx + c, and state the gradient and y-intercept.`,
      answer: `${lineEq(m, c)}; gradient ${mText(m)}, y-intercept ${mText(c)}`,
      working: [`${mono(b, { y: 1 })} = ${joinTerms([mono(-a, { x: 1 }), num(k)])}`, `Divide by ${num(b)}: ${lineEq(m, c)}`],
      space: SPACE_SIZES.MEDIUM,
      mcEligible: false,
      tags: ["rearrange", "gradient-intercept form"]
    });
  }
}

function equationFromGraphQuestion() {
  for (;;) {
    const d = choice([1, 1, 2, 3]); const n = nz(-4, 4);
    if (gcd(Math.abs(n), d) !== 1) continue;
    const c = randInt(-4, 4);
    const m = new Q(n, d);
    // two grid points: (0, c) and (d, c + n)
    if (Math.abs(c + n) > 6 || Math.abs(c + 2 * n) > 7 && d === 1) continue;
    return q({
      type: "equation-from-graph", marks: 2,
      prompt: "Find the equation of the line in the form y = mx + c.",
      diagram: plane({ xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves: [{ kind: "line", m: n / d, c }], points: [{ x: 0, y: c }, { x: d, y: c + n }] }),
      answer: lineEq(m, c),
      working: [`y-intercept: ${num(c)}`, `From (0, ${num(c)}) to ${pt(d, c + n)}: rise ${num(n)}, run ${d}, so m = ${mText(m).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}`, lineEq(m, c)],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [lineEq(new Q(d, n), c), lineEq(m.neg(), c), lineEq(m, -c || 1)],
      tags: ["equation of a line", "graph"]
    });
  }
}

function sketchFromMCQuestion() {
  const m = choice([-3, -2, -1, 1, 2, 3, new Q(1, 2), new Q(-2, 3)]); const c = randInt(-3, 3);
  const M = Q.of(m);
  return q({
    type: "sketch-from-m-c", marks: 2,
    prompt: `Sketch ${lineEq(M, c)} using its y-intercept and gradient.`,
    diagram: plane({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 }),
    answer: `Line through (0, ${num(c)}) and ${pt(M.d, c + M.n)} (rise ${num(M.n)}, run ${M.d})`,
    working: [`Plot (0, ${num(c)}).`, `Gradient ${M.text()}: across ${M.d}, ${M.n > 0 ? "up" : "down"} ${Math.abs(M.n)} → ${pt(M.d, c + M.n)}`, "Rule the line through both points."],
    space: "none",
    mcEligible: false,
    tags: ["sketch"]
  });
}

function interceptsQuestion() {
  for (;;) {
    const X = nz(-6, 6); const Y = nz(-6, 6);
    // line through (X, 0) and (0, Y): Y x + X y = X Y
    const a = Y; const b = X; const k = X * Y;
    const g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(k));
    const eq = `${joinTerms([mono(a / g, { x: 1 }), mono(b / g, { y: 1 })])} = ${num(k / g)}`;
    return q({
      type: "intercepts", marks: 2,
      prompt: `Find the x- and y-intercepts of ${eq}.`,
      answer: `x-intercept ${num(X)}, y-intercept ${num(Y)}`,
      working: [`x-intercept: put y = 0 → ${mono(a / g, { x: 1 })} = ${num(k / g)} → x = ${num(X)}`, `y-intercept: put x = 0 → ${mono(b / g, { y: 1 })} = ${num(k / g)} → y = ${num(Y)}`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [`x-intercept ${num(Y)}, y-intercept ${num(X)}`, `x-intercept ${num(-X)}, y-intercept ${num(-Y)}`],
      tags: ["intercepts"]
    });
  }
}

function equationFromMCQuestion() {
  const m = nz(-5, 5); const c = nz(-8, 8);
  return q({ type: "equation-from-m-c", marks: 1, prompt: `Write the equation of the line with gradient ${num(m)} and y-intercept ${num(c)}.`, answer: lineEq(m, c), working: ["y = mx + c"], space: SPACE_SIZES.SMALL, mcDistractors: [lineEq(c, m), lineEq(m, -c), lineEq(-m, c)], tags: ["equation of a line"] });
}

function equationPointGradientQuestion() {
  const m = nz(-4, 4); const x1 = nz(-5, 5); const y1 = randInt(-6, 6);
  const c = y1 - m * x1;
  return q({
    type: "equation-point-gradient", marks: 2,
    prompt: `Find the equation of the line with gradient ${num(m)} that passes through ${pt(x1, y1)}.`,
    answer: lineEq(m, c),
    working: [`y = ${num(m)}x + c; substitute ${pt(x1, y1)}: ${num(y1)} = ${num(m)} × (${num(x1)}) + c`, `c = ${num(c)}`, lineEq(m, c)],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [lineEq(m, y1), lineEq(m, y1 + m * x1), lineEq(m, x1)],
    tags: ["equation of a line"]
  });
}

function equationTwoPointsQuestion() {
  for (;;) {
    const x1 = randInt(-5, 5); const x2 = randInt(-5, 5);
    if (x1 === x2) continue;
    const m = nz(-3, 3); const c = randInt(-6, 6);
    const y1 = m * x1 + c; const y2 = m * x2 + c;
    return q({
      type: "equation-two-points", marks: 3,
      prompt: `Find the equation of the line through ${pt(x1, y1)} and ${pt(x2, y2)}.`,
      answer: lineEq(m, c),
      working: [`m = (${num(y2)} − ${y1 < 0 ? `(${num(y1)})` : y1})/(${num(x2)} − ${x1 < 0 ? `(${num(x1)})` : x1}) = ${num(y2 - y1)}/${num(x2 - x1)} = ${num(m)}`, `Substitute ${pt(x1, y1)}: c = ${num(y1)} − (${num(m)})(${num(x1)}) = ${num(c)}`, lineEq(m, c)],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [lineEq(new Q(x2 - x1, y2 - y1), c), lineEq(m, -c || 3), lineEq(-m, c)],
      tags: ["equation of a line"]
    });
  }
}

function parallelThroughPointQuestion() {
  const m = nz(-4, 4); const c0 = nz(-6, 6); const x1 = nz(-4, 4); const y1 = randInt(-5, 5);
  const c = y1 - m * x1;
  if (c === c0) return parallelThroughPointQuestion();
  return q({
    type: "parallel-through-point", marks: 2,
    prompt: `Find the equation of the line parallel to ${lineEq(m, c0)} that passes through ${pt(x1, y1)}.`,
    answer: lineEq(m, c),
    working: [`Parallel lines have equal gradients: m = ${num(m)}`, `${num(y1)} = ${num(m)}(${num(x1)}) + c → c = ${num(c)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [lineEq(m, c0), lineEq(new Q(-1, m), c), lineEq(-m, c)],
    tags: ["parallel"]
  });
}

function perpendicularGradientQuestion() {
  const v = choice(["find", "given-form"]);
  const n = nz(-5, 5); const d = choice([1, 1, 2, 3]);
  if (gcd(Math.abs(n), d) !== 1) return perpendicularGradientQuestion();
  const m = new Q(n, d); const p = new Q(-d, n);
  if (v === "find") return q({ type: "perpendicular-gradient", marks: 1, prompt: `A line has gradient ${m.toString()}. What is the gradient of a line perpendicular to it?`, answer: p.toString(), working: ["Perpendicular gradients multiply to −1: m₂ = −1/m₁", `−1 ÷ ${m.text()} = ${p.text()}`], space: SPACE_SIZES.SMALL, mcDistractors: [m.neg().toString(), new Q(d, n).toString(), m.toString()], tags: ["perpendicular"] });
  const c = nz(-6, 6);
  return q({ type: "perpendicular-gradient", marks: 1, prompt: `What is the gradient of any line perpendicular to ${lineEq(m, c)}?`, answer: p.toString(), working: [`Gradient of the given line: ${m.text()}`, `Perpendicular: ${p.text()} (since ${m.text()} × ${p.text()} = −1)`], space: SPACE_SIZES.SMALL, mcDistractors: [m.neg().toString(), new Q(d, n).toString(), num(c)], tags: ["perpendicular"] });
}

function perpendicularThroughPointQuestion() {
  const n = nz(-4, 4); const x1 = choice([-4, -2, 2, 4, 0]); const y1 = randInt(-5, 5);
  // given line gradient n (integer); perpendicular gradient −1/n
  const p = new Q(-1, n);
  const c = new Q(y1, 1).sub(p.mul(x1));
  const c0 = nz(-6, 6);
  return q({
    type: "perpendicular-through-point", marks: 3,
    prompt: `Find the equation of the line perpendicular to ${lineEq(n, c0)} that passes through ${pt(x1, y1)}.`,
    answer: lineEq(p, c),
    working: [`Perpendicular gradient: −1/${num(n)} = ${p.text()}`, `${num(y1)} = ${p.text()} × (${num(x1)}) + c → c = ${c.text()}`, lineEq(p, c).replace(/\[\[frac:(\d+):(\d+)\]\]/g, "$1/$2")],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["perpendicular"]
  });
}

function parallelPerpendicularCheckQuestion() {
  const kind = choice(["parallel", "perpendicular", "neither"]);
  const n = nz(-4, 4); const d = choice([1, 2, 3]);
  if (gcd(Math.abs(n), d) !== 1) return parallelPerpendicularCheckQuestion();
  const m1 = new Q(n, d);
  const m2 = kind === "parallel" ? m1 : kind === "perpendicular" ? new Q(-d, n) : new Q(d, n);
  if (kind === "neither" && (m2.eq(m1) || m2.mul(m1).eq(-1))) return parallelPerpendicularCheckQuestion();
  const c1 = nz(-6, 6); const c2 = nz(-6, 6);
  return q({
    type: "parallel-perpendicular-check", marks: 2,
    prompt: `Are the lines ${lineEq(m1, c1)} and ${lineEq(m2, c2)} parallel, perpendicular or neither? Give a reason.`,
    answer: kind === "parallel" ? `Parallel: both gradients are ${m1.toString()}.` : kind === "perpendicular" ? `Perpendicular: ${m1.toString()} × ${m2.toString()} = −1.` : `Neither: the gradients are not equal and their product is ${m1.mul(m2).toString()}, not −1.`,
    working: [`Gradients ${m1.text()} and ${m2.text()}`, `Product ${m1.mul(m2).text()}`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["parallel", "perpendicular"]
  });
}

function linearModelsQuestion() {
  const models = [
    () => { const f = randInt(20, 80); const r = randInt(15, 60); return { eq: `C = ${r}h + ${f}`, ctx: `A plumber charges according to C = ${r}h + ${f}, where C is the cost in dollars and h the hours worked.`, m: `$${r} per hour (the hourly rate)`, c: `$${f} (a fixed call-out fee)` }; },
    () => { const s = randInt(20, 90); const r = randInt(2, 8); return { eq: `W = ${s} − ${r}t`, ctx: `The water in a tank is W = ${s} − ${r}t litres after t minutes.`, m: `−${r}: the tank loses ${r} L per minute`, c: `${s} L: the starting amount` }; },
    () => { const s = randInt(100, 300); const r = randInt(10, 40); return { eq: `B = ${s} + ${r}w`, ctx: `A savings balance is B = ${s} + ${r}w dollars after w weeks.`, m: `$${r} saved each week`, c: `$${s}: the starting balance` }; }
  ];
  const M = choice(models)();
  return q({
    type: "linear-models", marks: 2,
    prompt: `${M.ctx} Explain what the gradient and the vertical intercept mean in this context.`,
    answer: `Gradient: ${M.m}. Intercept: ${M.c}.`,
    working: [`In ${M.eq}, the coefficient of the variable is the rate of change; the constant is the value when the variable is 0.`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["context", "interpret"]
  });
}

function multiPartLinearBQuestion() {
  const m = nz(-3, 3); const c = nz(-4, 4); const x1 = nz(-3, 3); const y1 = randInt(-4, 4);
  const cPar = y1 - m * x1;
  return q({
    type: "multi-part-linear-b", marks: 4,
    prompt: `The line ℓ has equation ${lineEq(m, c)}.`,
    diagram: plane({ xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves: [{ kind: "line", m, c, label: "ℓ" }] }),
    subparts: [
      { label: "(a)", prompt: "State its gradient and y-intercept.", marks: 1, answer: `m = ${num(m)}, c = ${num(c)}`, working: ["Read from y = mx + c."] },
      { label: "(b)", prompt: `Find the equation of the line parallel to ℓ through ${pt(x1, y1)}.`, marks: 1, answer: lineEq(m, cPar), working: [`c = ${num(y1)} − (${num(m)})(${num(x1)}) = ${num(cPar)}`] },
      { label: "(c)", prompt: "What is the gradient of a line perpendicular to ℓ?", marks: 1, answer: new Q(-1, m).toString(), working: ["−1/m"] },
      { label: "(d)", prompt: "Find the x-intercept of ℓ.", marks: 1, answer: new Q(-c, m).toString(), working: [`0 = ${num(m)}x + ${num(c)} → x = ${new Q(-c, m).text()}`] }
    ],
    answer: `(a) m = ${num(m)}, c = ${num(c)}; (b) ${lineEq(m, cPar)}; (c) ${new Q(-1, m).toString()}; (d) ${new Q(-c, m).toString()}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "read-m-and-c": readMAndCQuestion,
  "rearrange-to-form": rearrangeToFormQuestion,
  "equation-from-graph": equationFromGraphQuestion,
  "sketch-from-m-c": sketchFromMCQuestion,
  "intercepts": interceptsQuestion,
  "equation-from-m-c": equationFromMCQuestion,
  "equation-point-gradient": equationPointGradientQuestion,
  "equation-two-points": equationTwoPointsQuestion,
  "parallel-through-point": parallelThroughPointQuestion,
  "perpendicular-gradient": perpendicularGradientQuestion,
  "perpendicular-through-point": perpendicularThroughPointQuestion,
  "parallel-perpendicular-check": parallelPerpendicularCheckQuestion,
  "linear-models": linearModelsQuestion,
  "multi-part-linear-b": multiPartLinearBQuestion
};

export function getLinearRelationshipsBQuestionTypes() { return TYPE_LIST; }
export function generateLinearRelationshipsBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
