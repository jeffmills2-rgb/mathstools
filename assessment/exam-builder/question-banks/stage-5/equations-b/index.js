/*
  Mills Maths Tools — Stage 5 Question Bank: Equations B
  -------------------------------------------------------
  question-banks/stage-5/equations-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-EQU-P-01 (Path):
    "solves monic quadratic equations, linear inequalities and cubic
     equations of the form ax³ = c"

  Content:
    - quadratic equations x² = k (two, one or no real solutions; exact surd
      answers) and (x ± a)² = k
    - the null-factor law, then monic quadratics solved by factorising,
      including rearranging into ax² + bx + c = 0 first
    - checking a solution by substitution
    - quadratic equations from worded and area problems (rejecting a
      negative length)
    - cubic equations ax³ = c (and ax³ + b = c), exact and rounded
    - linear inequalities: solving (reversing the sign when multiplying or
      dividing by a negative), reading and drawing number-line graphs, and
      inequalities from worded problems

  Number-line diagrams come from engines/equations/equation-engine.js.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, gcd, fmt
} from "../../_shared/bank-helpers.js";
import { sup, mono, num, afrac, MINUS, joinTerms, poly, lin, bin, rat, isqrt, surdParts, surdText } from "../../_shared/algebra-helpers.js";

const TOPIC = "Equations B";

const TYPE_LIST = [
  { id: "x-squared-equals-k", label: "Solve x² = k" },
  { id: "square-of-binomial", label: "Solve (x + a)² = k" },
  { id: "null-factor-law", label: "The null factor law" },
  { id: "solve-monic", label: "Solve monic quadratics by factorising" },
  { id: "rearrange-then-solve", label: "Rearrange, then solve" },
  { id: "common-factor-quadratic", label: "Solve x² + bx = 0" },
  { id: "check-solutions", label: "Check solutions by substitution" },
  { id: "quadratic-problems", label: "Quadratic equations from problems" },
  { id: "cubic-equations", label: "Solve cubic equations ax³ = c" },
  { id: "solve-inequality", label: "Solve linear inequalities" },
  { id: "inequality-negative", label: "Inequalities: dividing by a negative" },
  { id: "read-number-line", label: "Read an inequality from a number line" },
  { id: "graph-inequality", label: "Solve and graph an inequality" },
  { id: "inequality-problems", label: "Inequalities from worded problems" },
  { id: "multi-part-equations-b", label: "Multi-part equations problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "equations", ...(spec.tags || [])] });
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };
const numberLine = config => ({ engine: "equation-engine", config: { diagramType: "inequality-number-line", min: -10, max: 10, step: 1, ...config } });
const SIGNS = { "<": "<", ">": ">", "<=": "≤", ">=": "≥" };
const FLIP = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" };
const V = ["x", "a", "m", "n", "p", "y"];

const roots = (a, b) => [a, b].sort((m, n) => m - n);
const solList = (x, rs) => { const u = [...new Set(rs)].sort((m, n) => m - n); return u.map(r => `${x} = ${num(r)}`).join(" or "); };

/* ── quadratics ──────────────────────────────────────────── */

function xSquaredEqualsKQuestion() {
  const x = choice(V);
  const v = choice(["square", "square", "surd", "coef", "none"]);
  if (v === "square") {
    const r = randInt(1, 15);
    return q({ type: "x-squared-equals-k", marks: 1, prompt: `Solve ${x}² = ${r * r}.`, answer: `${x} = ±${r}`, working: [`${x} = ±√${r * r} = ±${r}`, "Both the positive and negative roots work."], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ${r}`, `${x} = ±${r * r / 2}`, `${x} = ${r * r / 2}`], tags: ["quadratic", "square root"] });
  }
  if (v === "surd") {
    let k; do { k = randInt(2, 60); } while (isqrt(k));
    const p = surdParts(k);
    return q({ type: "x-squared-equals-k", marks: 1, prompt: `Solve ${x}² = ${k}, giving exact answers.`, answer: `${x} = ±${surdText(p.out, p.in)}`, working: [`${x} = ±√${k}${p.out > 1 ? ` = ±${surdText(p.out, p.in)}` : ""}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ${surdText(p.out, p.in)}`, `${x} = ±${k / 2}`], tags: ["quadratic", "surd"] });
  }
  if (v === "coef") {
    const r = randInt(1, 9); const c = choice([2, 3, 4, 5]); const d = randInt(0, 9);
    return q({ type: "x-squared-equals-k", marks: 2, prompt: `Solve ${mono(c, { [x]: 2 })}${d ? ` + ${d}` : ""} = ${c * r * r + d}.`, answer: `${x} = ±${r}`, working: [d ? `${mono(c, { [x]: 2 })} = ${c * r * r}` : "", `${x}² = ${r * r}`, `${x} = ±${r}`].filter(Boolean), space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ${r}`, `${x} = ±${r * r}`, `${x} = ±${c * r}`], tags: ["quadratic"] });
  }
  const k = randInt(1, 30);
  return q({ type: "x-squared-equals-k", marks: 1, prompt: `How many real solutions does ${x}² = ${MINUS}${k} have? Explain.`, answer: `None: a square can never be negative.`, working: [`${x}² ≥ 0 for every real ${x}, so ${x}² cannot equal ${MINUS}${k}.`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["quadratic", "no solution"] });
}

function squareOfBinomialQuestion() {
  const x = choice(V);
  const a = nz(-8, 8); const r = randInt(1, 8);
  const sols = [-a + r, -a - r];
  return q({
    type: "square-of-binomial", marks: 2,
    prompt: `Solve ${bin(1, a, x)}² = ${r * r}.`,
    answer: solList(x, sols),
    working: [`${lin(1, a, x)} = ±${r}`, `${lin(1, a, x)} = ${r} gives ${x} = ${num(-a + r)}; ${lin(1, a, x)} = ${MINUS}${r} gives ${x} = ${num(-a - r)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [solList(x, [a + r, a - r]), `${x} = ${num(-a + r)}`, solList(x, [-a + r * r, -a - r * r])],
    tags: ["quadratic"]
  });
}

function nullFactorLawQuestion() {
  const x = choice(V);
  const v = choice(["two-brackets", "x-bracket", "non-monic"]);
  if (v === "two-brackets") {
    const a = nz(-9, 9); const b = nz(-9, 9);
    return q({ type: "null-factor-law", marks: 1, prompt: `Solve ${bin(1, a, x)}${bin(1, b, x)} = 0.`, answer: solList(x, [-a, -b]), working: ["If a product is zero, one of the factors is zero.", `${lin(1, a, x)} = 0 or ${lin(1, b, x)} = 0`], space: SPACE_SIZES.SMALL, mcDistractors: [solList(x, [a, b]), solList(x, [-a, b]), `${x} = ${num(a * b)}`], tags: ["null factor law"] });
  }
  if (v === "x-bracket") {
    const b = nz(-9, 9); const c = choice([1, 2, 3]);
    return q({ type: "null-factor-law", marks: 1, prompt: `Solve ${c === 1 ? "" : c}${x}${bin(1, b, x)} = 0.`, answer: solList(x, [0, -b]), working: [`${x} = 0 or ${lin(1, b, x)} = 0`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ${num(-b)}`, solList(x, [0, b]), solList(x, [c, -b])], tags: ["null factor law"] });
  }
  const p = randInt(2, 5); const a = nz(-9, 9); const b = nz(-9, 9);
  if (gcd(p, Math.abs(a)) !== 1) return nullFactorLawQuestion();
  return q({ type: "null-factor-law", marks: 2, prompt: `Solve ${bin(p, a, x)}${bin(1, b, x)} = 0.`, answer: `${x} = ${rat(-a, p)} or ${x} = ${num(-b)}`, working: [`${lin(p, a, x)} = 0 gives ${x} = ${ratTextSafe(-a, p)}`, `${lin(1, b, x)} = 0 gives ${x} = ${num(-b)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ${num(-a)} or ${x} = ${num(-b)}`, `${x} = ${rat(a, p)} or ${x} = ${num(b)}`], tags: ["null factor law"] });
}

function ratTextSafe(n, d) { return rat(n, d).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2"); }

function solveMonicQuestion() {
  const x = choice(V);
  let a; let b; do { a = nz(-9, 9); b = nz(-9, 9); } while (a + b === 0 || a === b);
  const c = [1, -(a + b), a * b];   // roots a and b
  return q({
    type: "solve-monic", marks: 2,
    prompt: `Solve ${poly(c, x)} = 0.`,
    answer: solList(x, [a, b]),
    working: [`Factorise: ${bin(1, -a, x)}${bin(1, -b, x)} = 0`, `${x} = ${num(a)} or ${x} = ${num(b)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [solList(x, [-a, -b]), solList(x, [a, -b]), solList(x, [a * b, a + b])],
    tags: ["quadratic", "factorise"]
  });
}

function rearrangeThenSolveQuestion() {
  const x = choice(V);
  let a; let b; do { a = nz(-8, 8); b = nz(-8, 8); } while (a + b === 0 || a === b);
  // x² − (a+b)x + ab = 0, shown as x² = (a+b)x − ab or x² + k x = m
  const v = choice(["x-on-right", "constant-right"]);
  const prompt = v === "x-on-right" ? `Solve ${x}² = ${joinTerms([mono(a + b, { [x]: 1 }), num(-a * b)])}.` : `Solve ${joinTerms([`${x}²`, mono(-(a + b), { [x]: 1 })])} = ${num(-a * b)}.`;
  return q({
    type: "rearrange-then-solve", marks: 3,
    prompt,
    answer: solList(x, [a, b]),
    working: [`Make one side zero: ${poly([1, -(a + b), a * b], x)} = 0`, `${bin(1, -a, x)}${bin(1, -b, x)} = 0`, `${x} = ${num(a)} or ${x} = ${num(b)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [solList(x, [-a, -b]), solList(x, [a, -b])],
    tags: ["quadratic", "rearrange"]
  });
}

function commonFactorQuadraticQuestion() {
  const x = choice(V);
  const b = nz(-12, 12); const c = choice([1, 1, 2, 3]);
  const form = choice(["zero", "equals"]);
  return q({
    type: "common-factor-quadratic", marks: 2,
    prompt: form === "zero" ? `Solve ${joinTerms([mono(c, { [x]: 2 }), mono(c * b, { [x]: 1 })])} = 0.` : `Solve ${mono(c, { [x]: 2 })} = ${mono(-c * b, { [x]: 1 })}.`,
    answer: solList(x, [0, -b]),
    working: [form === "equals" ? `${joinTerms([mono(c, { [x]: 2 }), mono(c * b, { [x]: 1 })])} = 0` : "", `${c === 1 ? "" : c}${x}${bin(1, b, x)} = 0`, `${x} = 0 or ${x} = ${num(-b)}`, form === "equals" ? `Do not divide both sides by ${x} — that loses the solution ${x} = 0.` : ""].filter(Boolean),
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${x} = ${num(-b)}`, solList(x, [0, b]), `${x} = 0`],
    tags: ["quadratic", "common factor"]
  });
}

function checkSolutionsQuestion() {
  const x = choice(V);
  let a; let b; do { a = nz(-7, 7); b = nz(-7, 7); } while (a === b);
  const c = [1, -(a + b), a * b];
  const test = choice([a, b, a + 1, -a]);
  const val = test * test - (a + b) * test + a * b;
  return q({
    type: "check-solutions", marks: 1,
    prompt: `Is ${x} = ${num(test)} a solution of ${poly(c, x)} = 0? Show your check.`,
    answer: val === 0 ? `Yes: substituting gives 0.` : `No: substituting gives ${num(val)}, not 0.`,
    working: [`(${num(test)})² ${MINUS} (${num(a + b)})(${num(test)}) + (${num(a * b)}) = ${num(val)}`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["quadratic", "check"]
  });
}

function quadraticProblemsQuestion() {
  const v = choice(["rectangle", "number", "square-border", "consecutive"]);
  if (v === "rectangle") {
    const w = randInt(3, 12); const d = randInt(1, 6); const A = w * (w + d);
    return q({ type: "quadratic-problems", marks: 3, prompt: `A rectangle is ${d} cm longer than it is wide. Its area is ${A} cm². Write a quadratic equation for the width w, and solve it to find the dimensions.`, answer: `w(w + ${d}) = ${A}; width ${w} cm, length ${w + d} cm`, working: [`w² + ${d}w ${MINUS} ${A} = 0`, `(w ${MINUS} ${w})(w + ${w + d}) = 0`, `w = ${w} (w = ${MINUS}${w + d} is rejected: a length cannot be negative)`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["quadratic", "problem"] });
  }
  if (v === "number") {
    const n = randInt(2, 12); const k = randInt(1, 12);
    // n² + k n = S
    const S = n * n + k * n;
    return q({ type: "quadratic-problems", marks: 3, prompt: `When a positive number is squared and ${k} times the number is added, the result is ${S}. Find the number.`, answer: String(n), working: [`n² + ${k}n = ${S}`, `n² + ${k}n ${MINUS} ${S} = 0 → (n ${MINUS} ${n})(n + ${n + k}) = 0`, `n = ${n} (the number is positive)`], space: SPACE_SIZES.LARGE, mcDistractors: [String(n + k), String(S / k), String(n + 1)], tags: ["quadratic", "problem"] });
  }
  if (v === "consecutive") {
    const n = randInt(3, 15);
    return q({ type: "quadratic-problems", marks: 3, prompt: `Two consecutive positive whole numbers multiply to give ${n * (n + 1)}. Find them.`, answer: `${n} and ${n + 1}`, working: [`n(n + 1) = ${n * (n + 1)}`, `n² + n ${MINUS} ${n * (n + 1)} = 0 → (n ${MINUS} ${n})(n + ${n + 1}) = 0`, `n = ${n}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["quadratic", "problem"] });
  }
  const s = randInt(4, 10); const b = randInt(1, 3);
  const total = (s + 2 * b) ** 2;
  return q({ type: "quadratic-problems", marks: 3, prompt: `A square garden bed has a path ${b} m wide all the way around it. The garden and path together cover ${total} m². Find the side length of the garden bed.`, answer: `${s} m`, working: [`(x + ${2 * b})² = ${total}`, `x + ${2 * b} = ${s + 2 * b} (positive root)`, `x = ${s}`], space: SPACE_SIZES.LARGE, mcDistractors: [`${s + 2 * b} m`, `${s + b} m`, `${Math.round(Math.sqrt(total))} m`], tags: ["quadratic", "problem"] });
}

/* ── cubics ──────────────────────────────────────────────── */

function cubicEquationsQuestion() {
  const x = choice(V);
  const v = choice(["exact", "coef", "shift", "negative", "rounded"]);
  if (v === "exact") {
    const r = randInt(1, 10);
    return q({ type: "cubic-equations", marks: 1, prompt: `Solve ${x}³ = ${r ** 3}.`, answer: `${x} = ${r}`, working: [`${x} = ∛${r ** 3} = ${r}`, "A cube has only one real cube root."], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ±${r}`, `${x} = ${Math.round(r ** 3 / 3)}`, `${x} = ${r * r}`], tags: ["cubic"] });
  }
  if (v === "coef") {
    const r = randInt(1, 6); const a = randInt(2, 5);
    return q({ type: "cubic-equations", marks: 2, prompt: `Solve ${mono(a, { [x]: 3 })} = ${a * r ** 3}.`, answer: `${x} = ${r}`, working: [`${x}³ = ${r ** 3}`, `${x} = ∛${r ** 3} = ${r}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ±${r}`, `${x} = ${Math.round(Math.cbrt(a * r ** 3) * 100) / 100}`, `${x} = ${a * r}`], tags: ["cubic"] });
  }
  if (v === "shift") {
    const r = randInt(1, 5); const a = randInt(1, 4); const b = randInt(1, 30);
    return q({ type: "cubic-equations", marks: 2, prompt: `Solve ${mono(a, { [x]: 3 })} + ${b} = ${a * r ** 3 + b}.`, answer: `${x} = ${r}`, working: [`${mono(a, { [x]: 3 })} = ${a * r ** 3}`, `${x}³ = ${r ** 3}`, `${x} = ${r}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ${Math.round(Math.cbrt((a * r ** 3 + b) / a) * 100) / 100}`, `${x} = ±${r}`], tags: ["cubic"] });
  }
  if (v === "negative") {
    const r = randInt(1, 6); const a = choice([1, 2]);
    return q({ type: "cubic-equations", marks: 1, prompt: `Solve ${mono(a, { [x]: 3 })} = ${MINUS}${a * r ** 3}.`, answer: `${x} = ${MINUS}${r}`, working: [`${x}³ = ${MINUS}${r ** 3}`, `${x} = ∛(${MINUS}${r ** 3}) = ${MINUS}${r} — the cube root of a negative number is negative.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} = ${r}`, "No solution", `${x} = ±${r}`], tags: ["cubic", "negative"] });
  }
  let k; do { k = randInt(5, 200); } while (Number.isInteger(Math.cbrt(k)));
  const a = choice([1, 2, 5]);
  const val = Math.cbrt(k / a);
  return q({ type: "cubic-equations", marks: 2, prompt: `Solve ${mono(a, { [x]: 3 })} = ${k}, correct to 2 decimal places.`, answer: `${x} ≈ ${val.toFixed(2)}`, working: [`${x}³ = ${fmt(k / a, 3)}`, `${x} = ∛${fmt(k / a, 3)} ≈ ${val.toFixed(2)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} ≈ ${Math.sqrt(k / a).toFixed(2)}`, `${x} ≈ ${(k / a / 3).toFixed(2)}`, `${x} ≈ ${Math.cbrt(k).toFixed(2)}`], tags: ["cubic", "rounding"] });
}

/* ── inequalities ────────────────────────────────────────── */

function solveInequalityQuestion() {
  const x = choice(V);
  const a = randInt(2, 7); const s = nz(-8, 8); const op = choice(["<", ">", "<=", ">="]);
  const b = nz(-10, 10);
  const c = a * s + b;
  return q({
    type: "solve-inequality", marks: 2,
    prompt: `Solve ${lin(a, b, x)} ${SIGNS[op]} ${num(c)}.`,
    answer: `${x} ${SIGNS[op]} ${num(s)}`,
    working: [`${mono(a, { [x]: 1 })} ${SIGNS[op]} ${num(c)} ${b > 0 ? MINUS : "+"} ${Math.abs(b)} = ${num(c - b)}`, `Divide by ${a} (positive, so the sign stays): ${x} ${SIGNS[op]} ${num(s)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${x} ${SIGNS[FLIP[op]]} ${num(s)}`, `${x} ${SIGNS[op]} ${num((c + b) / a === Math.round((c + b) / a) ? (c + b) / a : s + 1)}`, `${x} ${SIGNS[op]} ${num(-s)}`],
    tags: ["inequality"]
  });
}

function inequalityNegativeQuestion() {
  const x = choice(V);
  const a = randInt(2, 6); const s = nz(-8, 8); const op = choice(["<", ">", "<=", ">="]);
  const v = choice(["coef", "const-minus-x"]);
  if (v === "coef") {
    const c = -a * s;
    return q({ type: "inequality-negative", marks: 2, prompt: `Solve ${mono(-a, { [x]: 1 })} ${SIGNS[op]} ${num(c)}.`, answer: `${x} ${SIGNS[FLIP[op]]} ${num(s)}`, working: [`Divide both sides by ${MINUS}${a}.`, `Dividing by a negative number REVERSES the inequality sign: ${x} ${SIGNS[FLIP[op]]} ${num(s)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} ${SIGNS[op]} ${num(s)}`, `${x} ${SIGNS[FLIP[op]]} ${num(-s)}`, `${x} ${SIGNS[op]} ${num(-s)}`], tags: ["inequality", "reverse sign"] });
  }
  const k = randInt(1, 12);
  const c = k - a * s;
  return q({ type: "inequality-negative", marks: 2, prompt: `Solve ${k} ${MINUS} ${mono(a, { [x]: 1 })} ${SIGNS[op]} ${num(c)}.`, answer: `${x} ${SIGNS[FLIP[op]]} ${num(s)}`, working: [`${mono(-a, { [x]: 1 })} ${SIGNS[op]} ${num(c)} ${MINUS} ${k} = ${num(c - k)}`, `Divide by ${MINUS}${a} and reverse the sign: ${x} ${SIGNS[FLIP[op]]} ${num(s)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${x} ${SIGNS[op]} ${num(s)}`, `${x} ${SIGNS[FLIP[op]]} ${num(-s)}`], tags: ["inequality", "reverse sign"] });
}

function readNumberLineQuestion() {
  const value = randInt(-7, 7); const op = choice(["<", ">", "<=", ">="]);
  return q({
    type: "read-number-line", marks: 1,
    prompt: "Write the inequality shown on the number line, using x.",
    diagram: numberLine({ value, direction: op }),
    answer: `x ${SIGNS[op]} ${num(value)}`,
    working: [`${op.includes("=") ? "A closed (filled) circle means the value is included" : "An open circle means the value is NOT included"}; the arrow points ${op.startsWith(">") ? "right (greater)" : "left (less)"}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x ${SIGNS[FLIP[op]]} ${num(value)}`, `x ${SIGNS[op.includes("=") ? op[0] : `${op}=`]} ${num(value)}`, `x ${SIGNS[op]} ${num(-value)}`],
    tags: ["inequality", "number line"]
  });
}

function graphInequalityQuestion() {
  const x = "x";
  const a = randInt(2, 5); const s = nz(-7, 7); const op = choice(["<", ">", "<=", ">="]); const b = nz(-9, 9);
  const neg = Math.random() < 0.4;
  const A = neg ? -a : a;
  const c = A * s + b;
  const final = neg ? FLIP[op] : op;
  return q({
    type: "graph-inequality", marks: 2,
    prompt: `Solve ${lin(A, b, x)} ${SIGNS[op]} ${num(c)}, then graph the solution on the number line.`,
    diagram: numberLine({ blank: true }),
    answer: `${x} ${SIGNS[final]} ${num(s)}; ${final.includes("=") ? "closed" : "open"} circle at ${num(s)}, arrow to the ${final.startsWith(">") ? "right" : "left"}`,
    working: [`${mono(A, { [x]: 1 })} ${SIGNS[op]} ${num(c - b)}`, neg ? `Divide by ${num(A)} and reverse: ${x} ${SIGNS[final]} ${num(s)}` : `Divide by ${A}: ${x} ${SIGNS[final]} ${num(s)}`],
    space: "none",
    mcEligible: false,
    tags: ["inequality", "number line", "graph"]
  });
}

function inequalityProblemsQuestion() {
  const v = choice(["phone", "tickets", "average"]);
  if (v === "phone") {
    const fee = randInt(10, 30); const per = choice([2, 3, 4, 5]); const budget = fee + per * randInt(5, 20) + randInt(0, per - 1);
    const n = Math.floor((budget - fee) / per);
    return q({ type: "inequality-problems", marks: 3, prompt: `A taxi charges a $${fee} flag fall plus $${per} per kilometre. Jo has $${budget}. Write an inequality for the distance d km she can travel, and find the greatest whole number of kilometres.`, answer: `${fee} + ${per}d ≤ ${budget}; d ≤ ${fmt((budget - fee) / per)}, so ${n} km`, working: [`${fee} + ${per}d ≤ ${budget}`, `${per}d ≤ ${budget - fee}`, `d ≤ ${fmt((budget - fee) / per)} → greatest whole number ${n}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["inequality", "problem"] });
  }
  if (v === "tickets") {
    const cost = randInt(80, 300); const price = choice([12, 15, 18, 20, 25]);
    const n = Math.floor(cost / price) + 1;
    return q({ type: "inequality-problems", marks: 3, prompt: `A school play costs $${cost} to stage. Tickets are $${price}. Write an inequality for the number of tickets t that must be sold to make a profit, and find the smallest number of tickets.`, answer: `${price}t > ${cost}; t > ${fmt(cost / price)}, so ${n} tickets`, working: [`${price}t > ${cost}`, `t > ${fmt(cost / price)}`, `Smallest whole number: ${n}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["inequality", "problem"] });
  }
  const t1 = randInt(55, 75); const t2 = randInt(55, 75); const goal = choice([65, 70, 75]);
  const need = 3 * goal - t1 - t2;
  if (need > 100 || need < 0) return inequalityProblemsQuestion();
  return q({ type: "inequality-problems", marks: 3, prompt: `Kai scored ${t1} and ${t2} on two tests. What must he score on the third test for his average to be at least ${goal}? Write and solve an inequality.`, answer: `(${t1} + ${t2} + s)/3 ≥ ${goal}; s ≥ ${need}`, working: [`${t1 + t2} + s ≥ ${3 * goal}`, `s ≥ ${need}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["inequality", "problem"] });
}

function multiPartEquationsBQuestion() {
  const x = "x";
  let a; let b; do { a = nz(-7, 7); b = nz(-7, 7); } while (a === b || a + b === 0);
  const r = randInt(2, 5); const s = nz(-6, 6); const k = randInt(2, 5);
  return q({
    type: "multi-part-equations-b", marks: 4,
    prompt: "Solve each equation or inequality.",
    subparts: [
      { label: "(a)", prompt: `${x}² = ${r * r}`, marks: 1, answer: `${x} = ±${r}`, working: [`±√${r * r}`] },
      { label: "(b)", prompt: `${poly([1, -(a + b), a * b], x)} = 0`, marks: 1, answer: solList(x, [a, b]), working: [`${bin(1, -a, x)}${bin(1, -b, x)} = 0`] },
      { label: "(c)", prompt: `${x}³ = ${MINUS}${r ** 3}`, marks: 1, answer: `${x} = ${MINUS}${r}`, working: [`∛(${MINUS}${r ** 3})`] },
      { label: "(d)", prompt: `${mono(-k, { [x]: 1 })} > ${num(-k * s)}`, marks: 1, answer: `${x} < ${num(s)}`, working: ["Divide by a negative: reverse the sign."] }
    ],
    answer: `(a) ${x} = ±${r}; (b) ${solList(x, [a, b])}; (c) ${x} = ${MINUS}${r}; (d) ${x} < ${num(s)}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "x-squared-equals-k": xSquaredEqualsKQuestion,
  "square-of-binomial": squareOfBinomialQuestion,
  "null-factor-law": nullFactorLawQuestion,
  "solve-monic": solveMonicQuestion,
  "rearrange-then-solve": rearrangeThenSolveQuestion,
  "common-factor-quadratic": commonFactorQuadraticQuestion,
  "check-solutions": checkSolutionsQuestion,
  "quadratic-problems": quadraticProblemsQuestion,
  "cubic-equations": cubicEquationsQuestion,
  "solve-inequality": solveInequalityQuestion,
  "inequality-negative": inequalityNegativeQuestion,
  "read-number-line": readNumberLineQuestion,
  "graph-inequality": graphInequalityQuestion,
  "inequality-problems": inequalityProblemsQuestion,
  "multi-part-equations-b": multiPartEquationsBQuestion
};

export function getEquationsBQuestionTypes() { return TYPE_LIST; }
export function generateEquationsBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
