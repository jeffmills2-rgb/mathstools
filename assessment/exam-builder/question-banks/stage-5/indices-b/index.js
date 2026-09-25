/*
  Mills Maths Tools — Stage 5 Question Bank: Indices B
  -----------------------------------------------------
  question-banks/stage-5/indices-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-IND-P-01 (Path):
    "applies the index laws to operate with algebraic expressions involving
     negative-integer indices"

  Content: negative indices on pronumerals — their meaning, rewriting with
  positive indices (and back), and all the index laws applied to algebraic
  expressions with negative-integer indices, including coefficients, powers
  of fractions and substitution.

  Convention: unless the question asks otherwise, a final answer is written
  with POSITIVE indices only (the usual school convention), as a single
  algebraic fraction where needed.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, gcd
} from "../../_shared/bank-helpers.js";
import { sup, mono, num, afrac, rat, MINUS } from "../../_shared/algebra-helpers.js";

const TOPIC = "Indices B";

const TYPE_LIST = [
  { id: "rewrite-positive", label: "Rewrite with positive indices" },
  { id: "rewrite-negative", label: "Rewrite using negative indices" },
  { id: "product-negative", label: "Multiply powers with negative indices" },
  { id: "quotient-negative", label: "Divide powers (negative results)" },
  { id: "power-negative", label: "Powers of powers with negative indices" },
  { id: "fraction-negative-power", label: "A fraction to a negative power" },
  { id: "simplify-negative-fractions", label: "Simplify algebraic fractions with negative indices" },
  { id: "evaluate-negative", label: "Evaluate by substitution" },
  { id: "numerical-fractions-negative", label: "Numerical fractions to negative powers" },
  { id: "check-negative-working", label: "Is the simplification correct?" },
  { id: "multi-part-indices-b", label: "Multi-part negative indices problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "indices", "negative indices", ...(spec.tags || [])] });
const V = ["a", "b", "m", "n", "p", "x", "y"];

/*
  A monomial written with positive indices only: coef · Π v^e, with the
  negative-exponent variables moved to the denominator. Returns a string
  (possibly an algfrac token).
*/
export function positiveForm(coef, vars) {
  const top = {}; const bot = {};
  Object.entries(vars).forEach(([v, e]) => { if (e > 0) top[v] = e; else if (e < 0) bot[v] = -e; });
  const [n, d] = [coef.n ?? coef, coef.d ?? 1];
  const g = gcd(n, d);
  const nn = n / g; const dd = d / g;
  const topStr = mono(Math.abs(nn), top);
  const botStr = Object.keys(bot).length ? mono(dd, bot) : (dd === 1 ? "" : String(dd));
  const sign = nn < 0 ? MINUS : "";
  if (!botStr) return `${sign}${topStr}`;
  return `${sign}${afrac(topStr, botStr)}`;
}

function rewritePositiveQuestion() {
  const x = choice(V);
  const e = randInt(1, 6);
  const c = randInt(2, 9);
  const v = choice(["plain", "coef", "bracket", "two"]);
  if (v === "plain") {
    return q({ type: "rewrite-positive", marks: 1, prompt: `Write ${x}${sup(-e)} with a positive index.`, answer: afrac("1", mono(1, { [x]: e })), working: [`${x}${sup(-e)} = 1/${x}${sup(e)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${MINUS}${mono(1, { [x]: e })}`, afrac("1", `${MINUS}${mono(1, { [x]: e })}`), mono(1, { [x]: e })], tags: ["meaning"] });
  }
  if (v === "coef") {
    return q({ type: "rewrite-positive", marks: 1, prompt: `Write ${c}${x}${sup(-e)} with a positive index.`, answer: afrac(String(c), mono(1, { [x]: e })), working: [`Only ${x} carries the index: ${c} × 1/${x}${sup(e)}`], space: SPACE_SIZES.SMALL, mcDistractors: [afrac("1", mono(c, { [x]: e })), mono(-c, { [x]: e }), afrac("1", `${c ** Math.min(e, 3)}${x}${sup(e)}`)], tags: ["meaning", "coefficient"] });
  }
  if (v === "bracket") {
    const ee = randInt(1, 3); const cc = randInt(2, 5);
    return q({ type: "rewrite-positive", marks: 1, prompt: `Write (${cc}${x})${sup(-ee)} with a positive index, simplifying fully.`, answer: afrac("1", mono(cc ** ee, { [x]: ee })), working: [`(${cc}${x})${sup(-ee)} = 1/(${cc}${x})${sup(ee)} = 1/${mono(cc ** ee, { [x]: ee })}`], space: SPACE_SIZES.SMALL, mcDistractors: [afrac(String(cc), mono(1, { [x]: ee })), afrac("1", mono(cc, { [x]: ee })), mono(-(cc ** ee), { [x]: ee })], tags: ["meaning", "bracket"] });
  }
  const [a, b] = sample(V, 2).sort();
  const ea = randInt(1, 5); const eb = randInt(1, 5);
  return q({ type: "rewrite-positive", marks: 1, prompt: `Write ${mono(c, { [a]: ea, [b]: -eb })} with positive indices.`, answer: afrac(mono(c, { [a]: ea }), mono(1, { [b]: eb })), working: [`${b}${sup(-eb)} = 1/${b}${sup(eb)}, so ${b}${sup(eb)} moves to the denominator.`], space: SPACE_SIZES.SMALL, mcDistractors: [afrac(String(c), mono(1, { [a]: ea, [b]: eb })), mono(c, { [a]: ea, [b]: eb }), afrac(mono(1, { [a]: ea }), mono(c, { [b]: eb }))], tags: ["meaning"] });
}

function rewriteNegativeQuestion() {
  const x = choice(V);
  const e = randInt(2, 6); const c = randInt(2, 9);
  const v = choice(["plain", "coef", "mixed"]);
  if (v === "plain") return q({ type: "rewrite-negative", marks: 1, prompt: `Write ${afrac("1", mono(1, { [x]: e }))} using a negative index.`, answer: `${x}${sup(-e)}`, working: [`1/${x}${sup(e)} = ${x}${sup(-e)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${MINUS}${x}${sup(e)}`, `${x}${sup(e)}`, `${e}${sup(-1)}${x}`], tags: ["meaning"] });
  if (v === "coef") return q({ type: "rewrite-negative", marks: 1, prompt: `Write ${afrac(String(c), mono(1, { [x]: e }))} without a fraction, using a negative index.`, answer: `${c}${x}${sup(-e)}`, working: [`${c} × 1/${x}${sup(e)} = ${c}${x}${sup(-e)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${c}${sup(-1)}${x}${sup(e)}`, `(${c}${x})${sup(-e)}`, `${MINUS}${c}${x}${sup(e)}`], tags: ["meaning"] });
  const [a, b] = sample(V, 2).sort();
  const ea = randInt(1, 4); const eb = randInt(1, 4);
  return q({ type: "rewrite-negative", marks: 1, prompt: `Write ${afrac(mono(c, { [a]: ea }), mono(1, { [b]: eb }))} without a fraction.`, answer: mono(c, { [a]: ea, [b]: -eb }), working: [`1/${b}${sup(eb)} = ${b}${sup(-eb)}`], space: SPACE_SIZES.SMALL, mcDistractors: [mono(c, { [a]: -ea, [b]: eb }), mono(-c, { [a]: ea, [b]: eb })], tags: ["meaning"] });
}

function productNegativeQuestion() {
  const x = choice(V);
  const v = choice(["plain", "coef", "both-negative"]);
  if (v === "plain") {
    const a = -randInt(1, 6); const b = randInt(1, 8);
    const s = a + b;
    return q({ type: "product-negative", marks: 1, prompt: `Simplify ${x}${sup(a)} × ${x}${sup(b)}. Write your answer with a positive index${s === 0 ? " (or as a number)" : ""}.`, answer: s === 0 ? "1" : positiveForm(1, { [x]: s }), working: [`${num(a)} + ${b} = ${num(s)}`, s < 0 ? `${x}${sup(s)} = 1/${x}${sup(-s)}` : s === 0 ? `${x}⁰ = 1` : ""].filter(Boolean), space: SPACE_SIZES.SMALL, mcDistractors: [positiveForm(1, { [x]: a * b }), positiveForm(1, { [x]: b - a }), positiveForm(1, { [x]: -s || 2 })], tags: ["product law"] });
  }
  const c1 = randInt(2, 6); const c2 = randInt(2, 6);
  const a = -randInt(1, 5); const b = v === "coef" ? randInt(1, 6) : -randInt(1, 4);
  const s = a + b;
  return q({ type: "product-negative", marks: 2, prompt: `Simplify ${mono(c1, { [x]: a })} × ${mono(c2, { [x]: b })}, writing your answer with positive indices.`, answer: s === 0 ? String(c1 * c2) : positiveForm(c1 * c2, { [x]: s }), working: [`${c1} × ${c2} = ${c1 * c2}; ${num(a)} + ${num(b)} = ${num(s)}`, s < 0 ? `${c1 * c2}${x}${sup(s)} = ${c1 * c2}/${x}${sup(-s)}` : ""].filter(Boolean), space: SPACE_SIZES.SMALL, mcDistractors: [afrac("1", mono(c1 * c2, { [x]: Math.abs(s) || 1 })), positiveForm(c1 + c2, { [x]: s || 1 }), positiveForm(c1 * c2, { [x]: a * b })], tags: ["product law", "coefficients"] });
}

function quotientNegativeQuestion() {
  const x = choice(V);
  const v = choice(["to-negative", "neg-numerator", "coef"]);
  if (v === "to-negative") {
    const a = randInt(1, 5); const b = a + randInt(1, 5);
    return q({ type: "quotient-negative", marks: 1, prompt: `Simplify ${x}${sup(a)} ÷ ${x}${sup(b)}, giving the answer (i) with a negative index and (ii) with a positive index.`, answer: `(i) ${x}${sup(a - b)}  (ii) ${afrac("1", mono(1, { [x]: b - a }))}`, working: [`${a} − ${b} = ${num(a - b)}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["quotient law"] });
  }
  if (v === "neg-numerator") {
    const a = -randInt(1, 4); const b = randInt(1, 4);
    return q({ type: "quotient-negative", marks: 1, prompt: `Simplify ${x}${sup(a)} ÷ ${x}${sup(b)}, writing your answer with a positive index.`, answer: afrac("1", mono(1, { [x]: b - a })), working: [`${num(a)} − ${b} = ${num(a - b)}`, `${x}${sup(a - b)} = 1/${x}${sup(b - a)}`], space: SPACE_SIZES.SMALL, mcDistractors: [afrac("1", mono(1, { [x]: Math.abs(a + b) || 1 })), mono(1, { [x]: b - a }), afrac("1", mono(1, { [x]: -a * b }))], tags: ["quotient law"] });
  }
  const c2 = randInt(2, 5); const k = randInt(2, 5); const a = -randInt(1, 3); const b = -randInt(4, 7);
  return q({ type: "quotient-negative", marks: 2, prompt: `Simplify ${mono(c2 * k, { [x]: a })} ÷ ${mono(c2, { [x]: b })}.`, answer: mono(k, { [x]: a - b }), working: [`${c2 * k} ÷ ${c2} = ${k}`, `${num(a)} − (${num(b)}) = ${a - b}`], space: SPACE_SIZES.SMALL, mcDistractors: [positiveForm(k, { [x]: a + b }), mono(k, { [x]: b - a }), mono(c2 * k - c2, { [x]: a - b })], tags: ["quotient law", "coefficients"] });
}

function powerNegativeQuestion() {
  const x = choice(V);
  const v = choice(["neg-inside", "neg-outside", "both", "coef"]);
  const a = randInt(1, 4); const n = randInt(2, 4);
  if (v === "neg-inside") return q({ type: "power-negative", marks: 1, prompt: `Simplify (${x}${sup(-a)})${sup(n)}, with a positive index.`, answer: afrac("1", mono(1, { [x]: a * n })), working: [`${num(-a)} × ${n} = ${num(-a * n)}`], space: SPACE_SIZES.SMALL, mcDistractors: [afrac("1", mono(1, { [x]: a + n })), mono(1, { [x]: a * n }), afrac("1", mono(n, { [x]: a }))], tags: ["power of a power"] });
  if (v === "neg-outside") return q({ type: "power-negative", marks: 1, prompt: `Simplify (${x}${sup(a)})${sup(-n)}, with a positive index.`, answer: afrac("1", mono(1, { [x]: a * n })), working: [`${a} × (${num(-n)}) = ${num(-a * n)}`], space: SPACE_SIZES.SMALL, mcDistractors: [mono(1, { [x]: a * n }), afrac("1", mono(1, { [x]: a - n > 0 ? a - n : a + n }))], tags: ["power of a power"] });
  if (v === "both") return q({ type: "power-negative", marks: 1, prompt: `Simplify (${x}${sup(-a)})${sup(-n)}.`, answer: mono(1, { [x]: a * n }), working: [`(${num(-a)}) × (${num(-n)}) = ${a * n}`], space: SPACE_SIZES.SMALL, mcDistractors: [afrac("1", mono(1, { [x]: a * n })), mono(1, { [x]: a + n })], tags: ["power of a power"] });
  const c = randInt(2, 3); const m = randInt(2, 3);
  return q({ type: "power-negative", marks: 2, prompt: `Simplify (${mono(c, { [x]: -a })})${sup(-m)}.`, answer: afrac(mono(1, { [x]: a * m }), String(c ** m)), working: [`= ${c}${sup(-m)}${x}${sup(a * m)}`, `${c}${sup(-m)} = 1/${c ** m}, so ${x}${sup(a * m)}/${c ** m}`], space: SPACE_SIZES.SMALL, mcDistractors: [mono(c ** m, { [x]: a * m }), afrac("1", mono(c ** m, { [x]: a * m })), afrac(mono(1, { [x]: a * m }), String(c * m))], tags: ["power of a product"] });
}

function fractionNegativePowerQuestion() {
  const [a, b] = sample(V, 2).sort();
  const n = randInt(1, 3);
  const e1 = randInt(1, 3); const e2 = randInt(1, 3);
  const c = choice([1, 2, 3]);
  const top = mono(c, { [a]: e1 }); const bot = mono(1, { [b]: e2 });
  return q({
    type: "fraction-negative-power", marks: n === 1 ? 1 : 2,
    prompt: `Simplify (${afrac(top, bot)})${sup(-n)}, with positive indices.`,
    answer: afrac(mono(1, { [b]: e2 * n }), mono(c ** n, { [a]: e1 * n })),
    working: ["A negative power of a fraction: flip the fraction and make the index positive.", `(${bot}/${top})${sup(n)} = ${mono(1, { [b]: e2 * n })}/${mono(c ** n, { [a]: e1 * n })}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [afrac(mono(c ** n, { [a]: e1 * n }), mono(1, { [b]: e2 * n })), afrac(mono(1, { [b]: e2 * n }), mono(c, { [a]: e1 * n })), afrac(mono(1, { [b]: e2 + n }), mono(c ** n, { [a]: e1 + n }))],
    tags: ["power of a quotient"]
  });
}

function simplifyNegativeFractionsQuestion() {
  const [x, y] = sample(V, 2).sort();
  const c2 = randInt(2, 5); const k = randInt(2, 6);
  const a1 = -randInt(1, 4); const a2 = randInt(1, 5);
  const b1 = randInt(1, 5); const b2 = -randInt(1, 4);
  const ex = a1 - a2; const ey = b1 - b2;
  return q({
    type: "simplify-negative-fractions", marks: 2,
    prompt: `Simplify ${afrac(mono(c2 * k, { [x]: a1, [y]: b1 }), mono(c2, { [x]: a2, [y]: b2 }))}, writing your answer with positive indices.`,
    answer: positiveForm(k, { [x]: ex, [y]: ey }),
    working: [`${c2 * k} ÷ ${c2} = ${k}`, `${x}: ${num(a1)} − ${a2} = ${num(ex)}; ${y}: ${b1} − (${num(b2)}) = ${ey}`, `= ${mono(k, { [x]: ex, [y]: ey })} = ${positiveForm(k, { [x]: ex, [y]: ey }).replace(/\[\[algfrac:([^:]+):([^\]]+)\]\]/, "$1/$2")}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [positiveForm(k, { [x]: a1 + a2, [y]: b1 + b2 }), positiveForm(k, { [x]: -ex, [y]: ey }), mono(k, { [x]: -ex, [y]: ey })],
    tags: ["algebraic fractions"]
  });
}

function evaluateNegativeQuestion() {
  const x = choice(["x", "a", "n"]);
  const v = choice(["int", "frac-base", "coef"]);
  if (v === "int") {
    const val = choice([2, 3, 4, 5, -2, -3]); const e = randInt(1, 3);
    const d = val ** e;
    return q({ type: "evaluate-negative", marks: 1, prompt: `Evaluate ${x}${sup(-e)} when ${x} = ${num(val)}.`, answer: rat(1, d), working: [`(${num(val)})${sup(-e)} = 1/(${num(val)})${sup(e)} = 1/${num(d)}`], space: SPACE_SIZES.SMALL, mcDistractors: [num(-d), rat(-1, d), num(d)], tags: ["substitution"] });
  }
  if (v === "frac-base") {
    const den = choice([2, 3, 4, 5]); const e = randInt(1, 3);
    return q({ type: "evaluate-negative", marks: 1, prompt: `Evaluate ${x}${sup(-e)} when ${x} = ${rat(1, den)}.`, answer: String(den ** e), working: [`(1/${den})${sup(-e)} = ${den}${sup(e)} = ${den ** e}`], space: SPACE_SIZES.SMALL, mcDistractors: [rat(1, den ** e), num(-(den ** e)), String(den * e)], tags: ["substitution"] });
  }
  const c = randInt(2, 9); const val = choice([2, 3, 4]); const e = randInt(1, 2);
  return q({ type: "evaluate-negative", marks: 1, prompt: `Evaluate ${c}${x}${sup(-e)} when ${x} = ${val}.`, answer: rat(c, val ** e), working: [`${c} × 1/${val}${sup(e)} = ${c}/${val ** e}`], space: SPACE_SIZES.SMALL, mcDistractors: [rat(1, (c * val) ** e), num(c * val ** e), rat(1, c * val ** e)], tags: ["substitution"] });
}

function numericalFractionsNegativeQuestion() {
  const a = randInt(1, 4); const b = randInt(a + 1, 7);
  if (gcd(a, b) !== 1) return numericalFractionsNegativeQuestion();
  const e = randInt(1, 3);
  const v = choice(["single", "sum"]);
  if (v === "single") {
    return q({ type: "numerical-fractions-negative", marks: 1, prompt: `Evaluate (${rat(a, b)})${sup(-e)}.`, answer: rat(b ** e, a ** e), working: [`Flip and make the index positive: (${b}/${a})${sup(e)} = ${b ** e}/${a ** e}`], space: SPACE_SIZES.SMALL, mcDistractors: [rat(a ** e, b ** e), rat(-(a ** e), b ** e), rat(b * e, a * e)], tags: ["numerical"] });
  }
  const p = choice([2, 3, 4, 5]); const r = choice([2, 3, 4]);
  return q({ type: "numerical-fractions-negative", marks: 2, prompt: `Evaluate ${p}${sup(-1)} + ${r}${sup(-2)}.`, answer: rat(r * r + p, p * r * r), working: [`= 1/${p} + 1/${r * r}`, `= ${r * r}/${p * r * r} + ${p}/${p * r * r} = ${rat(r * r + p, p * r * r).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [rat(2, p + r * r), num(-(p + r * r)), rat(1, p + r * r)], tags: ["numerical"] });
}

function checkNegativeWorkingQuestion() {
  const x = choice(V); const c = randInt(2, 6); const e = randInt(2, 4);
  const cases = [
    { shown: `${c}${x}${sup(-e)} = ${afrac("1", `${c}${x}${sup(e)}`)}`, ok: false, right: afrac(String(c), `${x}${sup(e)}`), why: `Only ${x} has the negative index; ${c} stays in the numerator.` },
    { shown: `${x}${sup(-e)} = ${MINUS}${x}${sup(e)}`, ok: false, right: afrac("1", `${x}${sup(e)}`), why: "A negative index means the reciprocal, not a negative value." },
    { shown: `(${x}${sup(-e)})${sup(-2)} = ${x}${sup(2 * e)}`, ok: true, right: `${x}${sup(2 * e)}`, why: `Correct: (${num(-e)}) × (${MINUS}2) = ${2 * e}.` },
    { shown: `${afrac("1", `${x}${sup(-e)}`)} = ${x}${sup(e)}`, ok: true, right: `${x}${sup(e)}`, why: "Correct: the reciprocal of a reciprocal." }
  ];
  const cs = choice(cases);
  return q({
    type: "check-negative-working", marks: 2,
    prompt: `Is this correct? ${cs.shown}. Explain, and correct it if necessary.`,
    answer: cs.ok ? `Yes. ${cs.why}` : `No — it should be ${cs.right}. ${cs.why}`,
    working: [cs.why],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["reasoning"]
  });
}

function multiPartIndicesBQuestion() {
  const x = choice(V);
  const a = randInt(2, 5); const b = randInt(1, 3); const c = randInt(2, 5);
  return q({
    type: "multi-part-indices-b", marks: 4,
    prompt: "Simplify, writing each answer with positive indices.",
    subparts: [
      { label: "(a)", prompt: `${x}${sup(-a)} × ${x}${sup(b)}`, marks: 1, answer: positiveForm(1, { [x]: b - a }), working: [`${num(-a)} + ${b} = ${num(b - a)}`] },
      { label: "(b)", prompt: `${c}${x}${sup(-b)}`, marks: 1, answer: afrac(String(c), mono(1, { [x]: b })), working: [`${c} × 1/${x}${sup(b)}`] },
      { label: "(c)", prompt: `(${x}${sup(-b)})${sup(3)}`, marks: 1, answer: afrac("1", mono(1, { [x]: 3 * b })), working: [`${num(-b)} × 3 = ${num(-3 * b)}`] },
      { label: "(d)", prompt: `(${afrac("2", x)})${sup(-2)}`, marks: 1, answer: afrac(`${x}²`, "4"), working: [`(${x}/2)² = ${x}²/4`] }
    ],
    answer: `(a) ${positiveForm(1, { [x]: b - a })}; (b) ${afrac(String(c), mono(1, { [x]: b }))}; (c) ${afrac("1", mono(1, { [x]: 3 * b }))}; (d) ${afrac(`${x}²`, "4")}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "rewrite-positive": rewritePositiveQuestion,
  "rewrite-negative": rewriteNegativeQuestion,
  "product-negative": productNegativeQuestion,
  "quotient-negative": quotientNegativeQuestion,
  "power-negative": powerNegativeQuestion,
  "fraction-negative-power": fractionNegativePowerQuestion,
  "simplify-negative-fractions": simplifyNegativeFractionsQuestion,
  "evaluate-negative": evaluateNegativeQuestion,
  "numerical-fractions-negative": numericalFractionsNegativeQuestion,
  "check-negative-working": checkNegativeWorkingQuestion,
  "multi-part-indices-b": multiPartIndicesBQuestion
};

export function getIndicesBQuestionTypes() { return TYPE_LIST; }
export function generateIndicesBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
