/*
  Mills Maths Tools — Stage 5 Question Bank: Polynomials
  -------------------------------------------------------
  question-banks/stage-5/polynomials/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-POL-P-01 (Path):
    recognises, describes, manipulates and graphs polynomials, and applies
    the factor and remainder theorems to solve problems.

  Content:
    - vocabulary: degree, leading term and coefficient, constant term, monic
    - P(x) notation: evaluate, substitute expressions
    - add, subtract and multiply polynomials
    - division by (x − a): P(x) = (x − a)Q(x) + R, set out as long division
    - the remainder theorem and the factor theorem, including finding an
      unknown coefficient
    - factorise cubics and solve P(x) = 0
    - graphs from factored form: intercepts, double roots (touching),
      end behaviour, matching equations to graphs

  Every division is done with exact integer synthetic division, and every
  factorisation is re-expanded from its roots.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";
import { num, MINUS, poly, fromRoots, evalPoly, joinTerms } from "../../_shared/algebra-helpers.js";

const TOPIC = "Polynomials";

const TYPE_LIST = [
  { id: "polynomial-vocabulary", label: "Degree, leading coefficient, constant term" },
  { id: "evaluate-polynomial", label: "Evaluate P(a)" },
  { id: "add-subtract-polynomials", label: "Add and subtract polynomials" },
  { id: "multiply-polynomials", label: "Multiply polynomials" },
  { id: "divide-polynomial", label: "Divide a polynomial by (x − a)" },
  { id: "remainder-theorem", label: "The remainder theorem" },
  { id: "factor-theorem", label: "The factor theorem" },
  { id: "find-unknown-coefficient", label: "Find an unknown coefficient" },
  { id: "factorise-cubic", label: "Factorise a cubic" },
  { id: "solve-cubic", label: "Solve a cubic equation" },
  { id: "polynomial-graph-features", label: "Graphs from factored form" },
  { id: "which-polynomial-graph", label: "Match a polynomial to its graph (A–D)" },
  { id: "polynomial-from-graph", label: "Find a polynomial's equation from its graph" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "polynomials", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };
const P = c => poly(c);
const fac = r => (r === 0 ? "x" : `(x ${r > 0 ? MINUS : "+"} ${Math.abs(r)})`);
const LETTERS = ["A", "B", "C", "D"];
const paren = v => (v < 0 ? `(${num(v)})` : num(v));

/* Synthetic division of coeffs (highest first) by (x − a). */
export function synth(coeffs, a) {
  const out = [];
  let acc = 0;
  coeffs.forEach(c => { acc = acc * a + c; out.push(acc); });
  const R = out.pop();
  return { quotient: out, remainder: R };
}

/* Factored form from roots with multiplicity, grouped: (x − 1)²(x + 2). */
function factored(a, roots) {
  const counts = {};
  roots.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
  const body = Object.keys(counts).map(Number).sort((x, y) => y - x).map(r => `${fac(r)}${counts[r] === 2 ? "²" : counts[r] === 3 ? "³" : ""}`).join("");
  return `${a === 1 ? "" : a === -1 ? MINUS : num(a)}${body}`;
}

function randomPoly(deg) {
  const c = [nz(-4, 5)];
  for (let i = 0; i < deg; i++) c.push(randInt(-9, 9));
  return c;
}

function polynomialVocabularyQuestion() {
  const deg = randInt(2, 5);
  const c = randomPoly(deg);
  if (Math.random() < 0.3) c[0] = 1;
  // present the terms in a jumbled order so the leading term is not first
  const n = c.length - 1;
  const terms = c.map((k, i) => ({ k, e: n - i })).filter(t => t.k !== 0);
  const jumbled = shuffle(terms);
  const txt = jumbled.map((t, i) => {
    const m = poly([t.k, ...Array(t.e).fill(0)]);
    if (i === 0) return m;
    return m.startsWith(MINUS) ? ` ${MINUS} ${m.slice(1)}` : ` + ${m}`;
  }).join("");
  const constant = c[n];
  return q({
    type: "polynomial-vocabulary", marks: 3,
    prompt: `For P(x) = ${txt}, state:`,
    subparts: [
      { label: "(a)", prompt: "the degree", marks: 1, answer: String(deg), working: ["The highest power of x."] },
      { label: "(b)", prompt: "the leading coefficient", marks: 1, answer: num(c[0]), working: [`The coefficient of x${["", "", "²", "³", "⁴", "⁵"][deg]}.`] },
      { label: "(c)", prompt: "the constant term, and whether P(x) is monic", marks: 1, answer: `${num(constant)}; ${c[0] === 1 ? "monic" : "not monic"}`, working: ["Monic means the leading coefficient is 1."] }
    ],
    answer: `(a) ${deg}; (b) ${num(c[0])}; (c) ${num(constant)}, ${c[0] === 1 ? "monic" : "not monic"}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["vocabulary"]
  });
}

function evaluatePolynomialQuestion() {
  const c = randomPoly(randInt(2, 3));
  const a = randInt(-3, 3);
  const v = evalPoly(c, a);
  if (Math.random() < 0.3) {
    const b = randInt(-3, 3);
    return q({
      type: "evaluate-polynomial", marks: 2,
      prompt: `If P(x) = ${P(c)}, find P(${num(a)}) + P(${num(b)}).`,
      answer: num(v + evalPoly(c, b)),
      working: [`P(${num(a)}) = ${num(v)}`, `P(${num(b)}) = ${num(evalPoly(c, b))}`, `Sum = ${num(v + evalPoly(c, b))}`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [num(evalPoly(c, a + b)), num(v - evalPoly(c, b))],
      tags: ["evaluate"]
    });
  }
  const n = c.length - 1;
  return q({
    type: "evaluate-polynomial", marks: 1,
    prompt: `If P(x) = ${P(c)}, find P(${num(a)}).`,
    answer: num(v),
    working: [`P(${num(a)}) = ${P(c).replace(/x/g, `(${num(a)})`)}`, `= ${num(v)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [num(evalPoly(c, -a)), num(v + 2), num(evalPoly(c.map((k, i) => (i === c.length - 1 ? -k : k)), a))],
    tags: ["evaluate"]
  });
}

function addSubtractPolynomialsQuestion() {
  const A = randomPoly(3); const B = randomPoly(2);
  const op = choice(["+", "−"]);
  const Bp = [0, ...B];
  const R = A.map((k, i) => (op === "+" ? k + Bp[i] : k - Bp[i]));
  const wrong = A.map((k, i) => (op === "+" ? k - Bp[i] : k + Bp[i]));
  const wrong2 = A.map((k, i) => (i === 1 && op === "−" ? k - Bp[i] : i > 1 && op === "−" ? k + Bp[i] : k + Bp[i]));
  return q({
    type: "add-subtract-polynomials", marks: 2,
    prompt: `If P(x) = ${P(A)} and Q(x) = ${P(B)}, find P(x) ${op} Q(x).`,
    answer: P(R),
    working: [`(${P(A)}) ${op} (${P(B)})`, "Collect like terms.", P(R)],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [P(wrong), P(wrong2)],
    tags: ["add", "subtract"]
  });
}

function multiplyPolynomialsQuestion() {
  const a = nz(-5, 5); const B = [nz(-3, 3), randInt(-6, 6), randInt(-6, 6)];
  if (B[2] === 0) return multiplyPolynomialsQuestion();
  // (x + a)(B)
  const R = [B[0], B[1] + a * B[0], B[2] + a * B[1], a * B[2]];
  return q({
    type: "multiply-polynomials", marks: 2,
    prompt: `Expand and simplify (x ${a < 0 ? MINUS : "+"} ${Math.abs(a)})(${P(B)}).`,
    answer: P(R),
    working: [`x(${P(B)}) ${a < 0 ? MINUS : "+"} ${Math.abs(a)}(${P(B)})`, joinTerms([P([B[0], B[1], B[2], 0]), P([a * B[0], a * B[1], a * B[2]])]), P(R)],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [P([B[0], B[1] + a, B[2] + a, a * B[2]]), P([B[0], B[1] - a * B[0], B[2] - a * B[1], -a * B[2]])],
    tags: ["multiply"]
  });
}

function divisionSetup(allowRem = true) {
  const deg = choice([2, 3, 3]);
  const c = randomPoly(deg); c[0] = choice([1, 1, 2]);
  const a = nz(-3, 3);
  const { quotient, remainder } = synth(c, a);
  if (!allowRem && remainder !== 0) return divisionSetup(false);
  return { c, a, quotient, remainder };
}

function dividePolynomialQuestion() {
  const { c, a, quotient, remainder } = divisionSetup();
  const divisor = fac(a);
  return q({
    type: "divide-polynomial", marks: 3,
    prompt: `Divide P(x) = ${P(c)} by ${divisor}. Write P(x) in the form ${divisor}Q(x) + R.`,
    answer: `Q(x) = ${P(quotient)}, R = ${num(remainder)}: P(x) = ${divisor}(${P(quotient)})${remainder === 0 ? "" : ` ${remainder < 0 ? MINUS : "+"} ${Math.abs(remainder)}`}`,
    working: [
      ...quotient.map((k, i) => {
        const e = quotient.length - 1 - i;
        return `${poly([k, ...Array(e).fill(0)])} × ${divisor} then subtract`;
      }),
      `Quotient ${P(quotient)}, remainder ${num(remainder)}`,
      `Check: P(${num(a)}) = ${num(evalPoly(c, a))} = R`
    ],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [
      `Q(x) = ${P(synth(c, -a).quotient)}, R = ${num(synth(c, -a).remainder)}: P(x) = ${divisor}(${P(synth(c, -a).quotient)})${synth(c, -a).remainder === 0 ? "" : ` ${synth(c, -a).remainder < 0 ? MINUS : "+"} ${Math.abs(synth(c, -a).remainder)}`}`
    ],
    tags: ["division"]
  });
}

function remainderTheoremQuestion() {
  const { c, a, remainder } = divisionSetup();
  return q({
    type: "remainder-theorem", marks: 2,
    prompt: `Use the remainder theorem to find the remainder when ${P(c)} is divided by ${fac(a)}.`,
    answer: num(remainder),
    working: [`R = P(${num(a)})`, `= ${num(remainder)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [num(evalPoly(c, -a)), num(evalPoly(c, 0)), num(remainder + 2 * a)],
    tags: ["remainder theorem"]
  });
}

function factorTheoremQuestion() {
  const isFactor = Math.random() < 0.65;
  const roots = [nz(-3, 3), randInt(-4, 4), randInt(-4, 4)];
  const c = fromRoots(1, roots);
  const a = isFactor ? roots[0] : (() => { let t; do { t = nz(-4, 4); } while (roots.includes(t)); return t; })();
  const v = evalPoly(c, a);
  return q({
    type: "factor-theorem", marks: 2,
    prompt: `Use the factor theorem to decide whether ${fac(a)} is a factor of P(x) = ${P(c)}.`,
    answer: v === 0 ? `Yes: P(${num(a)}) = 0, so ${fac(a)} is a factor.` : `No: P(${num(a)}) = ${num(v)} ≠ 0.`,
    working: [`P(${num(a)}) = ${num(v)}`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["factor theorem"]
  });
}

function findUnknownCoefficientQuestion() {
  const v = choice(["factor", "remainder"]);
  const a = nz(-3, 3);
  const b = randInt(-5, 5); const d = randInt(-9, 9);
  // P(x) = x³ + b x² + k x + d; need P(a) = R
  const kTrue = nz(-8, 8);
  const R = v === "factor" ? 0 : evalPoly([1, b, kTrue, d], a);
  // solve: a³ + b a² + k a + d = R → k = (R − a³ − b a² − d)/a
  const k = (R - a ** 3 - b * a * a - d) / a;
  if (!Number.isInteger(k)) return findUnknownCoefficientQuestion();
  const shown = `x³ ${b < 0 ? MINUS : "+"} ${Math.abs(b)}x² + kx ${d < 0 ? MINUS : "+"} ${Math.abs(d)}`.replace(/ \+ 0x²| − 0x²/, "").replace(/ [+−] 0$/, "");
  return q({
    type: "find-unknown-coefficient", marks: 2,
    prompt: v === "factor" ? `${fac(a)} is a factor of P(x) = ${shown}. Find the value of k.` : `When P(x) = ${shown} is divided by ${fac(a)}, the remainder is ${num(R)}. Find k.`,
    answer: `k = ${num(k)}`,
    working: [`P(${num(a)}) = ${num(R)}`, `${num(a ** 3)} ${b * a * a < 0 ? MINUS : "+"} ${Math.abs(b * a * a)} ${a < 0 ? MINUS : "+"} ${Math.abs(a)}k ${d < 0 ? MINUS : "+"} ${Math.abs(d)} = ${num(R)}`, `${num(a)}k = ${num(R - a ** 3 - b * a * a - d)}`, `k = ${num(k)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`k = ${num(-k)}`, `k = ${num((R + a ** 3 + b * a * a + d) / a)}`].filter(s => !s.includes(".")),
    tags: ["factor theorem", "remainder theorem"]
  });
}

function cubicRoots() {
  const roots = [nz(-3, 3), randInt(-4, 4), randInt(-5, 5)];
  if (new Set(roots).size < 3) return cubicRoots();
  return roots;
}

function factoriseCubicQuestion() {
  const roots = cubicRoots(); const c = fromRoots(1, roots);
  const given = Math.random() < 0.5;
  const sorted = [...roots].sort((x, y) => y - x);
  const ans = `P(x) = ${sorted.map(fac).join("")}`;
  const Qd = synth(c, roots[0]).quotient;
  return q({
    type: "factorise-cubic", marks: 3,
    prompt: given ? `Show that ${fac(roots[0])} is a factor of P(x) = ${P(c)}, and hence factorise P(x) fully.` : `Factorise P(x) = ${P(c)} fully.`,
    answer: ans,
    working: [
      given ? `P(${num(roots[0])}) = 0, so ${fac(roots[0])} is a factor.` : `Test factors of ${num(c[3])}: P(${num(roots[0])}) = 0, so ${fac(roots[0])} is a factor.`,
      `Divide: P(x) = ${fac(roots[0])}(${P(Qd)})`,
      `${P(Qd)} = ${fac(roots[1])}${fac(roots[2])}`,
      ans
    ],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [`P(x) = ${sorted.map(r => fac(-r)).join("")}`, `P(x) = ${fac(roots[0])}(${P(Qd.map((k, i) => (i === 1 ? -k : k)))})`],
    tags: ["factorise", "cubic"]
  });
}

function solveCubicQuestion() {
  const v = choice(["factored", "factored", "full"]);
  if (v === "factored") {
    const a = choice([1, 2]); const roots = cubicRoots().slice(0, 2); const lin = [a, nz(-5, 5)];
    const r3 = { n: -lin[1], d: lin[0] };
    const r3t = r3.d === 1 ? num(r3.n) : r3.n % r3.d === 0 ? num(r3.n / r3.d) : `${r3.n < 0 ? MINUS : ""}[[frac:${Math.abs(r3.n)}:${r3.d}]]`;
    const lt = `(${poly(lin)})`;
    return q({
      type: "solve-cubic", marks: 2,
      prompt: `Solve ${roots.map(fac).join("")}${lt} = 0.`,
      answer: `x = ${num(roots[0])}, x = ${num(roots[1])} or x = ${r3t}`,
      working: ["If a product is zero, one of the factors is zero.", `x = ${num(roots[0])}, ${num(roots[1])}, ${r3t}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`x = ${num(-roots[0])}, x = ${num(-roots[1])} or x = ${num(lin[1])}`],
      tags: ["solve", "cubic"]
    });
  }
  const roots = cubicRoots(); const c = fromRoots(1, roots);
  const sorted = [...roots].sort((x, y) => x - y);
  return q({
    type: "solve-cubic", marks: 4,
    prompt: `Solve ${P(c)} = 0.`,
    answer: `x = ${sorted.map(num).join(", ")}`,
    working: [`P(${num(roots[0])}) = 0, so ${fac(roots[0])} is a factor`, `${P(c)} = ${fac(roots[0])}(${P(synth(c, roots[0]).quotient)})`, `= ${roots.map(fac).join("")}`, `x = ${sorted.map(num).join(", ")}`],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [`x = ${sorted.map(r => num(-r)).join(", ")}`],
    tags: ["solve", "cubic"]
  });
}

function graphWindow(roots, a) {
  const f = x => a * roots.reduce((p, r) => p * (x - r), 1);
  const lo0 = Math.min(...roots); const hi0 = Math.max(...roots);
  let lo = f(0); let hi = f(0);
  for (let x = lo0 - 0.4; x <= hi0 + 0.4; x += 0.02) { const y = f(x); lo = Math.min(lo, y); hi = Math.max(hi, y); }
  const M = Math.max(4, Math.abs(lo), Math.abs(hi)) * 1.3;
  const step = M > 50 ? 10 : M > 24 ? 5 : M > 12 ? 2 : 1;
  const Y = Math.ceil(M / step) * step;
  return { xMin: Math.floor(lo0 - 1), xMax: Math.ceil(hi0 + 1), yMin: -Y, yMax: Y, yStep: step, yLabelEvery: Y / step > 4 ? 2 : 1, equal: false, width: 400, height: 280 };
}

function polynomialGraphFeaturesQuestion() {
  const a = choice([1, -1]);
  const r = [nz(-3, 2), randInt(-3, 3)];
  const double = choice([true, false]);
  const roots = double ? [r[0], r[0], r[1] === r[0] ? r[0] + 2 : r[1]] : cubicRoots();
  const dist = [...new Set(roots)].sort((x, y) => x - y);
  const c = fromRoots(a, roots);
  const yi = c[3];
  const touch = dist.filter(x => roots.filter(y => y === x).length === 2);
  return q({
    type: "polynomial-graph-features", marks: 3,
    prompt: `Sketch y = ${factored(a, roots)}, showing all intercepts with the axes.`,
    diagram: plane({ ...graphWindow(roots, a), numbers: true }),
    answer: `x-intercepts ${dist.map(num).join(", ")}${touch.length ? ` (touches the x-axis at x = ${num(touch[0])})` : ""}; y-intercept ${num(yi)}; ${a > 0 ? "rises to the right, falls to the left" : "falls to the right, rises to the left"}.`,
    working: [`y = 0 at x = ${dist.map(num).join(", ")}`, touch.length ? `A squared factor gives a double root: the curve touches the axis there.` : "Each single root is a crossing point.", `x = 0: y = ${num(yi)}`, `Leading term ${a < 0 ? MINUS : ""}x³`],
    space: "none",
    mcEligible: false,
    tags: ["graph", "double root"]
  });
}

function whichPolynomialGraphQuestion() {
  const roots = cubicRoots().map(r => Math.max(-3, Math.min(3, r)));
  if (new Set(roots).size < 3) return whichPolynomialGraphQuestion();
  const a = choice([1, -1]);
  const sets = [
    { a, roots },
    { a: -a, roots },
    { a, roots: roots.map(r => -r) },
    { a, roots: [roots[0], roots[0], roots[1]] }
  ];
  const cards = shuffle(sets.map((s, i) => ({ ...s, i })));
  const correct = LETTERS[cards.findIndex(s => s.i === 0)];
  return q({
    type: "which-polynomial-graph", marks: 1,
    prompt: `Which graph could be y = ${factored(a, roots)}?`,
    diagram: plane({ diagramType: "options", columns: 2, panels: cards.map((s, i) => ({ label: LETTERS[i], ...(() => { const w = graphWindow(roots, a); return { xMin: -4, xMax: 4, yMin: w.yMin, yMax: w.yMax, yStep: w.yStep * 2, yLabelEvery: 2 }; })(), xLabelEvery: 2, equal: false, width: 230, height: 190, numbers: true, grid: true, curves: [{ kind: "poly", a: s.a, roots: s.roots }] })) }),
    answer: correct,
    working: [`Roots at x = ${[...roots].sort((x, y) => x - y).map(num).join(", ")}, each crossing; leading coefficient ${a > 0 ? "positive: rises to the right" : "negative: falls to the right"}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: LETTERS.filter(l => l !== correct),
    tags: ["graph", "identify"]
  });
}

function polynomialFromGraphQuestion() {
  const roots = cubicRoots().map(r => Math.max(-3, Math.min(3, r)));
  if (new Set(roots).size < 3) return polynomialFromGraphQuestion();
  const a = choice([1, -1, 2]);
  const c = fromRoots(a, roots);
  const yi = c[3];
  if (yi === 0) return polynomialFromGraphQuestion();
  return q({
    type: "polynomial-from-graph", marks: 3,
    prompt: "The graph shows a cubic y = P(x). Use the intercepts to find P(x) in factored form.",
    diagram: plane({ ...graphWindow(roots, a), curves: [{ kind: "poly", a, roots }], points: [{ x: 0, y: yi, label: `(0, ${num(yi)})`, labelPos: "e" }, ...roots.map(r => ({ x: r, y: 0 }))] }),
    answer: `P(x) = ${factored(a, [...roots])}`,
    working: [`P(x) = a${[...roots].sort((x, y) => y - x).map(fac).join("")}`, `y-intercept: a × ${num(-roots[0] * -roots[1] * -roots[2])} = ${num(yi)}`, `a = ${num(a)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`P(x) = ${factored(a, roots.map(r => -r))}`, `P(x) = ${factored(-a, roots)}`],
    tags: ["graph", "equation from graph"]
  });
}

const GENERATORS = {
  "polynomial-vocabulary": polynomialVocabularyQuestion,
  "evaluate-polynomial": evaluatePolynomialQuestion,
  "add-subtract-polynomials": addSubtractPolynomialsQuestion,
  "multiply-polynomials": multiplyPolynomialsQuestion,
  "divide-polynomial": dividePolynomialQuestion,
  "remainder-theorem": remainderTheoremQuestion,
  "factor-theorem": factorTheoremQuestion,
  "find-unknown-coefficient": findUnknownCoefficientQuestion,
  "factorise-cubic": factoriseCubicQuestion,
  "solve-cubic": solveCubicQuestion,
  "polynomial-graph-features": polynomialGraphFeaturesQuestion,
  "which-polynomial-graph": whichPolynomialGraphQuestion,
  "polynomial-from-graph": polynomialFromGraphQuestion
};

export function getPolynomialsQuestionTypes() { return TYPE_LIST; }
export function generatePolynomialsQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
