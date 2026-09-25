/*
  Mills Maths Tools — Algebraic Techniques A: gap-fill types
  ----------------------------------------------------------
  question-banks/stage-5/algebraic-techniques-a/extra-types.js

  The original bank covers algebraic fractions and expanding. MA5-ALG-C-01
  also expects students to factorise by taking out common factors
  (including negative and algebraic ones), to check a factorisation by
  expanding, and to use expansions to evaluate and to describe areas.
  Appended to the bank's registry by index.js.
*/

import { SPACE_SIZES, randInt, choice, makeQuestion, gcd } from "../../_shared/bank-helpers.js";
import { mono, joinTerms, num, MINUS, poly } from "../../_shared/algebra-helpers.js";

const TOPIC = "Algebraic Techniques A";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "algebra", ...(spec.tags || [])] });
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };

export const EXTRA_ALG_A_TYPES = [
  { id: "factorise-common-factor", label: "Factorise by taking out the highest common factor" },
  { id: "factorise-negative-factor", label: "Factorise by taking out a negative common factor" },
  { id: "check-factorisation", label: "Check a factorisation by expanding" },
  { id: "expand-and-evaluate", label: "Expand, simplify, then evaluate" },
  { id: "area-expression", label: "Write and expand an expression for an area" }
];

function termsFor(k, vars) {
  // k × (a·v1 + b·v2 [+ c]) with coprime inner coefficients
  for (;;) {
    const a = nz(1, 6); const b = nz(-7, 7); const c = Math.random() < 0.4 ? nz(-6, 6) : 0;
    if (gcd(gcd(a, Math.abs(b)), Math.abs(c) || Math.abs(b)) !== 1) continue;
    return { a, b, c };
  }
}

function factoriseCommonFactorQuestion() {
  const k = randInt(2, 9); const algebraic = Math.random() < 0.5;
  const inner = termsFor(k);
  const v = choice(["x", "a", "m"]); const w = choice(["y", "b", "n"]);
  const f = algebraic ? { [v]: 1 } : {};
  const t1 = mono(k * inner.a, { ...(algebraic ? { [v]: 2 } : { [v]: 1 }) });
  const t2 = mono(k * inner.b, { ...(algebraic ? { [v]: 1, [w]: 1 } : { [w]: 1 }) });
  const t3 = inner.c ? mono(k * inner.c, algebraic ? { [v]: 1 } : {}) : "";
  const expr = joinTerms([t1, t2, t3]);
  const inside = joinTerms([mono(inner.a, { [v]: 1 }), mono(inner.b, { [w]: 1 }), inner.c ? num(inner.c) : ""]);
  const outside = mono(k, f);
  return q({
    type: "factorise-common-factor", marks: 1,
    prompt: `Factorise fully: ${expr}`,
    answer: `${outside}(${inside})`,
    working: [`HCF of the terms is ${outside}`, `${expr} = ${outside}(${inside})`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${num(k)}(${joinTerms([mono(inner.a, algebraic ? { [v]: 2 } : { [v]: 1 }), mono(inner.b, algebraic ? { [v]: 1, [w]: 1 } : { [w]: 1 }), inner.c ? mono(inner.c, algebraic ? { [v]: 1 } : {}) : ""])})`, `${outside}(${joinTerms([mono(inner.a * k, { [v]: 1 }), mono(inner.b, { [w]: 1 }), inner.c ? num(inner.c) : ""])})`].filter(s => s !== `${outside}(${inside})`),
    tags: ["factorise"]
  });
}

function factoriseNegativeFactorQuestion() {
  const k = randInt(2, 8); const a = randInt(1, 5); const b = randInt(1, 9);
  if (gcd(a, b) !== 1) return factoriseNegativeFactorQuestion();
  const v = choice(["x", "p", "t"]);
  // −k a x − k b  or  −k a x² + k b x
  const alg = Math.random() < 0.5;
  const expr = alg ? joinTerms([mono(-k * a, { [v]: 2 }), mono(k * b, { [v]: 1 })]) : joinTerms([mono(-k * a, { [v]: 1 }), num(-k * b)]);
  const out = alg ? mono(-k, { [v]: 1 }) : num(-k);
  const inside = alg ? joinTerms([mono(a, { [v]: 1 }), num(-b)]) : joinTerms([mono(a, { [v]: 1 }), num(b)]);
  return q({
    type: "factorise-negative-factor", marks: 1,
    prompt: `Factorise ${expr} by taking out a negative common factor.`,
    answer: `${out}(${inside})`,
    working: [`Take out ${out}; every sign inside the bracket changes.`, `Check: ${out}(${inside}) = ${expr}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${out}(${alg ? joinTerms([mono(a, { [v]: 1 }), num(b)]) : joinTerms([mono(a, { [v]: 1 }), num(-b)])})`, `${out.replace(MINUS, "")}(${alg ? joinTerms([mono(-a, { [v]: 1 }), num(b)]) : joinTerms([mono(-a, { [v]: 1 }), num(-b)])})`.replace(/^\(/, "1(")],
    tags: ["factorise", "negative"]
  });
}

function checkFactorisationQuestion() {
  const k = randInt(2, 6); const a = randInt(1, 5); const b = nz(-9, 9);
  const correct = Math.random() < 0.5;
  const expr = joinTerms([mono(k * a, { x: 1 }), num(k * b)]);
  const b2 = correct ? b : b + choice([-2, -1, 1, 2]);
  const claimed = joinTerms([mono(a, { x: 1 }), num(b2)]);
  const expanded = joinTerms([mono(k * a, { x: 1 }), num(k * b2)]);
  return q({
    type: "check-factorisation", marks: 2,
    prompt: `A student factorised ${expr} as ${k}(${claimed}). Expand to check whether this is correct.`,
    answer: correct ? `Correct: ${k}(${claimed}) = ${expr}` : `Incorrect: ${k}(${claimed}) = ${expanded}, not ${expr}. The correct answer is ${k}(${joinTerms([mono(a, { x: 1 }), num(b)])}).`,
    working: [`${k} × ${mono(a, { x: 1 })} = ${mono(k * a, { x: 1 })}; ${k} × ${num(b2)} = ${num(k * b2)}`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["factorise", "check"]
  });
}

function expandAndEvaluateQuestion() {
  const a = nz(-5, 5); const b = nz(-5, 5); const x = nz(-4, 4);
  // (x + a)(x + b) − x(x + c)
  const c = nz(-5, 5);
  const coeffs = [0, a + b - c, a * b];
  const simplified = poly(coeffs.slice(1));
  const val = coeffs[1] * x + coeffs[2];
  const br = v => `(x ${v < 0 ? MINUS : "+"} ${Math.abs(v)})`;
  return q({
    type: "expand-and-evaluate", marks: 3,
    prompt: `Expand and simplify ${br(a)}${br(b)} − x${br(c)}, then evaluate the result when x = ${num(x)}.`,
    answer: `${simplified}; value ${num(val)}`,
    working: [`${poly([1, a + b, a * b])} − (${poly([1, c, 0])})`, `= ${simplified}`, `x = ${num(x)}: ${num(val)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${poly([a + b + c, a * b])}; value ${num((a + b + c) * x + a * b)}`, `${poly([2, a + b - c, a * b])}; value ${num(2 * x * x + (a + b - c) * x + a * b)}`],
    tags: ["expand", "substitute"]
  });
}

function areaExpressionQuestion() {
  const a = randInt(1, 6); const b = randInt(2, 8); const k = choice([1, 2, 3]);
  const w = `${k === 1 ? "" : k}x + ${a}`; const l = `x + ${b}`;
  const res = poly([k, k * b + a, a * b]);
  return q({
    type: "area-expression", marks: 2,
    prompt: `A rectangle is (${w}) cm wide and (${l}) cm long. Write an expression for its area and expand it.`,
    diagram: { engine: "algebra-engine", config: { diagramType: "area-grid", cols: [`${k === 1 ? "" : k}x`, String(a)], rows: ["x", String(b)], cells: [[null, null], [null, null]] } },
    answer: `A = (${w})(${l}) = ${res} cm²`,
    working: [`${k === 1 ? "" : k}x × x = ${mono(k, { x: 2 })}`, `${k === 1 ? "" : k}x × ${b} + ${a} × x = ${mono(k * b + a, { x: 1 })}`, `${a} × ${b} = ${a * b}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`A = (${w})(${l}) = ${poly([k, a + b, a * b])} cm²`, `A = (${w})(${l}) = ${poly([k, 0, a * b])} cm²`],
    tags: ["expand", "area"]
  });
}

export const EXTRA_ALG_A_GENERATORS = {
  "factorise-common-factor": factoriseCommonFactorQuestion,
  "factorise-negative-factor": factoriseNegativeFactorQuestion,
  "check-factorisation": checkFactorisationQuestion,
  "expand-and-evaluate": expandAndEvaluateQuestion,
  "area-expression": areaExpressionQuestion
};
