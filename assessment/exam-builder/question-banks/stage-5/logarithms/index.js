/*
  Mills Maths Tools — Stage 5 Question Bank: Logarithms
  ------------------------------------------------------
  question-banks/stage-5/logarithms/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-LOG-P-01 (Path):
    applies the laws of logarithms to evaluate simple expressions and solve
    equations.

  Content:
    - the definition: y = aˣ ⇔ x = logₐ y; converting between index and
      logarithmic form
    - evaluating logarithms, including logₐ 1 = 0, logₐ a = 1, fractional
      and negative results
    - the log laws (product, quotient, power) to simplify, expand and
      evaluate
    - solving logarithmic equations, and exponential equations (same base,
      and using logarithms with a calculator)
    - the graph of y = logₐ x as the reflection of y = aˣ in y = x
    - growth and decay problems solved with logarithms

  Bases print as Unicode subscripts: log₂ 8.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";
import { num, MINUS, sup, rat } from "../../_shared/algebra-helpers.js";

const TOPIC = "Logarithms";

const TYPE_LIST = [
  { id: "index-to-log", label: "Write in logarithmic form" },
  { id: "log-to-index", label: "Write in index form" },
  { id: "evaluate-log", label: "Evaluate logarithms" },
  { id: "log-laws-combine", label: "Simplify to a single logarithm" },
  { id: "log-laws-evaluate", label: "Evaluate using the log laws" },
  { id: "log-laws-expand", label: "Expand using the log laws" },
  { id: "log-laws-in-terms", label: "Express in terms of given logs" },
  { id: "solve-log-equation", label: "Solve logarithmic equations" },
  { id: "exponential-same-base", label: "Exponential equations: same base" },
  { id: "exponential-with-logs", label: "Exponential equations using logs" },
  { id: "log-graph", label: "The graph of y = logₐ x" },
  { id: "log-true-false", label: "True or false? Log statements" },
  { id: "log-growth-decay", label: "Growth and decay problems" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "logarithms", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉", x: "ₓ", a: "ₐ" };
const sub = v => String(v).split("").map(ch => SUB[ch] || ch).join("");
const log = (b, x) => `log${sub(b)} ${x}`;
const ipow = (b, e) => `${b}${sup(e)}`;
const r4 = v => (Math.round(v * 100) / 100).toString().replace(/^-/, MINUS);

const POWERS = [[2, 2, 6], [3, 2, 4], [4, 2, 3], [5, 2, 3], [10, 1, 4], [6, 2, 2], [7, 2, 2]];
function pickPower(allowNeg = true) {
  const [b, lo, hi] = choice(POWERS);
  let e = randInt(lo, hi);
  if (allowNeg && Math.random() < 0.25) e = -randInt(1, 2);
  return { b, e };
}
const valText = (b, e) => (e >= 0 ? num(b ** e) : rat(1, b ** -e));
const valPlain = (b, e) => (e >= 0 ? num(b ** e) : `1/${b ** -e}`);

function indexToLogQuestion() {
  const { b, e } = pickPower();
  return q({
    type: "index-to-log", marks: 1,
    prompt: `Write ${ipow(b, e)} = ${valText(b, e)} in logarithmic form.`,
    answer: `${log(b, valText(b, e))} = ${num(e)}`,
    working: ["aˣ = y ⇔ logₐ y = x"],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${log(b, num(e))} = ${valText(b, e)}`, `${log(e < 0 ? b : e, valText(b, e))} = ${b}`, `${log(valText(b, e), b)} = ${num(e)}`].filter(s => !s.includes("[[frac") || s.startsWith("log")),
    tags: ["definition"]
  });
}

function logToIndexQuestion() {
  const { b, e } = pickPower();
  return q({
    type: "log-to-index", marks: 1,
    prompt: `Write ${log(b, valText(b, e))} = ${num(e)} in index form.`,
    answer: `${ipow(b, e)} = ${valText(b, e)}`,
    working: ["logₐ y = x ⇔ aˣ = y"],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${ipow(e < 0 ? b : e, b)} = ${valText(b, e)}`, `${b} × ${num(e)} = ${valText(b, e)}`],
    tags: ["definition"]
  });
}

function evaluateLogQuestion() {
  const v = choice(["pow", "pow", "neg", "zero", "self", "half"]);
  let b; let x; let ans; let why;
  if (v === "pow") { ({ b } = pickPower(false)); const e = randInt(2, 4); x = num(b ** e); ans = e; why = `${ipow(b, e)} = ${x}`; }
  else if (v === "neg") { b = choice([2, 3, 5, 10]); const e = randInt(1, 3); x = rat(1, b ** e); ans = -e; why = `${ipow(b, -e)} = 1/${b ** e}`; }
  else if (v === "zero") { b = choice([2, 3, 7, 10]); x = "1"; ans = 0; why = `${ipow(b, 0)} = 1`; }
  else if (v === "self") { b = choice([3, 5, 9, 10]); x = String(b); ans = 1; why = `${ipow(b, 1)} = ${b}`; }
  else { const [bb, xx, a] = choice([[4, 2, "[[frac:1:2]]"], [9, 3, "[[frac:1:2]]"], [8, 2, "[[frac:1:3]]"], [27, 3, "[[frac:1:3]]"], [16, 2, "[[frac:1:4]]"], [4, 8, "[[frac:3:2]]"]]); b = bb; x = String(xx); ans = a; why = `${b} raised to ${a.replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")} is ${xx}`; }
  const A = typeof ans === "number" ? num(ans) : ans;
  return q({
    type: "evaluate-log", marks: 1,
    prompt: `Evaluate ${log(b, x)}.`,
    answer: A,
    working: [`${b} to what power is ${x.replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}?`, why],
    space: SPACE_SIZES.SMALL,
    mcDistractors: typeof ans === "number" ? [num(-ans), num(ans + 1), v === "zero" ? "1" : "0"] : ["2", MINUS + "2", "[[frac:1:3]]", "[[frac:1:2]]"].filter(s => s !== A),
    tags: ["evaluate"]
  });
}

function logLawsCombineQuestion() {
  const b = choice(["a", "2", "3", "10"]);
  const v = choice(["sum", "diff", "power", "mixed"]);
  if (v === "sum") { const [m, n] = [randInt(2, 7), randInt(2, 7)]; return q({ type: "log-laws-combine", marks: 1, prompt: `Write ${log(b, m)} + ${log(b, n)} as a single logarithm.`, answer: log(b, m * n), working: ["logₐ x + logₐ y = logₐ xy"], space: SPACE_SIZES.SMALL, mcDistractors: [log(b, m + n), log(b, `${m}${n}`) === log(b, m * n) ? log(b, m * n + 1) : log(b, `${m}${n}`)], tags: ["log laws"] }); }
  if (v === "diff") { const n = randInt(2, 5); const m = n * randInt(2, 6); return q({ type: "log-laws-combine", marks: 1, prompt: `Write ${log(b, m)} − ${log(b, n)} as a single logarithm.`, answer: log(b, m / n), working: ["logₐ x − logₐ y = logₐ (x/y)"], space: SPACE_SIZES.SMALL, mcDistractors: [log(b, m - n), log(b, m * n)], tags: ["log laws"] }); }
  if (v === "power") { const k = randInt(2, 3); const m = randInt(2, 5); return q({ type: "log-laws-combine", marks: 1, prompt: `Write ${k}${log(b, m)} as a single logarithm.`, answer: log(b, m ** k), working: ["n logₐ x = logₐ xⁿ"], space: SPACE_SIZES.SMALL, mcDistractors: [log(b, k * m), log(b, m + k)], tags: ["log laws"] }); }
  const m = randInt(2, 4); const n = randInt(2, 5); const p = choice([2, 4, 8, m].filter(d => (m * m * n) % d === 0 && d !== n && d !== m * m));
  if (!p || n === m) return logLawsCombineQuestion();
  const val = (m * m * n) / p;
  return q({ type: "log-laws-combine", marks: 2, prompt: `Write 2${log(b, m)} + ${log(b, n)} − ${log(b, p)} as a single logarithm, simplified.`, answer: log(b, Number.isInteger(val) ? val : `(${m * m * n}/${p})`), working: [`= ${log(b, m * m)} + ${log(b, n)} − ${log(b, p)}`, `= ${log(b, `(${m * m} × ${n} ÷ ${p})`)}`], space: SPACE_SIZES.SMALL, mcDistractors: [log(b, 2 * m + n - p), log(b, 2 * m * n / p)], tags: ["log laws"] });
}

function logLawsEvaluateQuestion() {
  const set = choice([
    () => { const b = choice([2, 3, 6, 10]); const T = b ** randInt(2, 3); const divs = []; for (let d = 2; d < T; d++) if (T % d === 0) divs.push(d); const m = choice(divs); return { p: `${log(b, m)} + ${log(b, T / m)}`, a: Math.round(Math.log(T) / Math.log(b)), w: [`= ${log(b, T)}`, `${T} = ${ipow(b, Math.round(Math.log(T) / Math.log(b)))}`] }; },
    () => { const b = choice([2, 3, 5]); const e = randInt(1, 3); const m = choice([3, 5, 6, 7].filter(v => v !== b)); const top = m * b ** e; return { p: `${log(b, top)} − ${log(b, m)}`, a: e, w: [`= ${log(b, `(${top}/${m})`)}`, `= ${log(b, b ** e)} = ${e}`] }; },
    () => { const b = choice([2, 3]); const e = randInt(2, 4); return { p: `${log(b, `${ipow(b, e)}`)} + ${log(b, 1)}`, a: e, w: [`${log(b, ipow(b, e))} = ${e} × ${log(b, b)} = ${e}`, `${log(b, 1)} = 0`] }; },
    () => { const [b, x, k] = choice([[2, 4, 3], [3, 9, 2], [10, 100, 3], [5, 25, 2]]); return { p: `${k}${log(b, x)}`, a: k * Math.round(Math.log(x) / Math.log(b)), w: [`${log(b, x)} = ${Math.round(Math.log(x) / Math.log(b))}`, `${k} × ${Math.round(Math.log(x) / Math.log(b))}`] }; },
    () => { const b = choice([2, 10]); const d = choice(b === 2 ? [[40, 5], [24, 3], [96, 3]] : [[500, 5], [2000, 2], [50, 5]]); const v = Math.round(Math.log(d[0] / d[1]) / Math.log(b)); return { p: `${log(b, d[0])} − ${log(b, d[1])}`, a: v, w: [`= ${log(b, d[0] / d[1])} = ${v}`] }; }
  ])();
  return q({
    type: "log-laws-evaluate", marks: 2,
    prompt: `Evaluate ${set.p} without a calculator.`,
    answer: num(set.a),
    working: set.w,
    space: SPACE_SIZES.SMALL,
    mcDistractors: [num(set.a + 1), num(set.a - 1), num(set.a * 2)],
    tags: ["log laws", "evaluate"]
  });
}

function logLawsExpandQuestion() {
  const b = choice(["a", "10", "2"]);
  const [p1, p2, p3] = [randInt(1, 3), randInt(1, 3), randInt(1, 3)];
  const expr = choice([
    { e: `${p1 === 1 ? "x" : "x" + sup(p1)}${p2 === 1 ? "y" : "y" + sup(p2)}`, a: `${p1 === 1 ? "" : p1}${log(b, "x")} + ${p2 === 1 ? "" : p2}${log(b, "y")}` },
    { e: `(${p1 === 1 ? "x" : "x" + sup(p1)}/${p3 === 1 ? "z" : "z" + sup(p3)})`, a: `${p1 === 1 ? "" : p1}${log(b, "x")} − ${p3 === 1 ? "" : p3}${log(b, "z")}` },
    { e: `(${p1 === 1 ? "x" : "x" + sup(p1)}${p2 === 1 ? "y" : "y" + sup(p2)}/z)`, a: `${p1 === 1 ? "" : p1}${log(b, "x")} + ${p2 === 1 ? "" : p2}${log(b, "y")} − ${log(b, "z")}` },
    { e: "√x", a: `[[frac:1:2]]${log(b, "x")}` }
  ]);
  return q({
    type: "log-laws-expand", marks: 2,
    prompt: `Expand ${log(b, expr.e)} using the log laws.`,
    answer: expr.a,
    working: ["Product → sum, quotient → difference, power → multiple."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [expr.a.replace(/ − /g, " + "), expr.a.replace(/\d(?=log)/g, "")].filter(s => s !== expr.a),
    tags: ["log laws", "expand"]
  });
}

function logLawsInTermsQuestion() {
  const b = choice(["a", "10"]);
  const opts = [
    { x: 6, a: "p + q" }, { x: 12, a: "2p + q" }, { x: 18, a: "p + 2q" }, { x: 8, a: "3p" }, { x: "1.5", a: "q − p" }, { x: 36, a: "2p + 2q" }, { x: "(2/3)", a: "p − q" }, { x: 24, a: "3p + q" }
  ];
  const o = choice(opts);
  return q({
    type: "log-laws-in-terms", marks: 2,
    prompt: `If ${log(b, 2)} = p and ${log(b, 3)} = q, write ${log(b, o.x)} in terms of p and q.`,
    answer: o.a,
    working: [`Write ${String(o.x).replace(/[()]/g, "")} using 2s and 3s, then apply the laws.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: shuffle(opts.filter(t => t.a !== o.a)).slice(0, 3).map(t => t.a),
    tags: ["log laws"]
  });
}

function solveLogEquationQuestion() {
  const v = choice(["x", "base", "linear"]);
  if (v === "x") { const { b, e } = pickPower(); return q({ type: "solve-log-equation", marks: 1, prompt: `Solve ${log(b, "x")} = ${num(e)}.`, answer: `x = ${valText(b, e)}`, working: [`x = ${ipow(b, e)} = ${valPlain(b, e)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`x = ${b * e}`, `x = ${num(e ** b)}`], tags: ["solve"] }); }
  if (v === "base") { const b = choice([2, 3, 4, 5, 10]); const e = randInt(2, 4); return q({ type: "solve-log-equation", marks: 1, prompt: `Solve ${log("x", b ** e)} = ${e}.`, answer: `x = ${b}`, working: [`x${sup(e)} = ${b ** e}`, `x = ${b}`], space: SPACE_SIZES.SMALL, mcDistractors: [`x = ${b ** e / e}`, `x = ${num((b ** e) ** e)}`], tags: ["solve"] }); }
  const b = choice([2, 3]); const e = randInt(2, 4); const k = randInt(1, 9); const a = choice([1, 2]);
  const rhs = b ** e;
  const x = (rhs - k) / a;
  if (!Number.isInteger(x)) return solveLogEquationQuestion();
  return q({ type: "solve-log-equation", marks: 2, prompt: `Solve ${log(b, `(${a === 1 ? "" : a}x + ${k})`)} = ${e}.`, answer: `x = ${num(x)}`, working: [`${a === 1 ? "" : a}x + ${k} = ${ipow(b, e)} = ${rhs}`, `x = ${num(x)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`x = ${num((b * e - k) / a)}`, `x = ${num((rhs + k) / a)}`], tags: ["solve"] });
}

function exponentialSameBaseQuestion() {
  const [base, pw] = choice([[2, [4, 8, 16, 32]], [3, [9, 27, 81]], [5, [25, 125]], [4, [16, 64]]]);
  const rhs = choice(pw); const E = Math.round(Math.log(rhs) / Math.log(base));
  const a = choice([1, 2, 3]); const k = randInt(-3, 3);
  // base^(a x + k) = rhs → a x + k = E
  const x = (E - k) / a;
  if (!Number.isInteger(x * 2)) return exponentialSameBaseQuestion();
  const exp = `${a === 1 ? "" : a}x${k === 0 ? "" : k > 0 ? ` + ${k}` : ` ${MINUS} ${-k}`}`;
  const neg = Math.random() < 0.3;
  const R = neg ? `[[frac:1:${rhs}]]` : String(rhs);
  const xr = neg ? (-E - k) / a : x;
  if (!Number.isInteger(xr * 2)) return exponentialSameBaseQuestion();
  const xt = Number.isInteger(xr) ? num(xr) : rat(Math.round(xr * 2), 2);
  return q({
    type: "exponential-same-base", marks: 2,
    prompt: `Solve ${base}[[sup:${exp}]] = ${R}.`,
    answer: `x = ${xt}`,
    working: [`${R} = ${ipow(base, neg ? -E : E)}`, `${exp} = ${num(neg ? -E : E)}`, `x = ${xt}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${num(neg ? E : -E)}`, `x = ${num(E + k)}`, `x = ${num(rhs)}`],
    tags: ["exponential equations"]
  });
}

function exponentialWithLogsQuestion() {
  const base = choice([2, 3, 5, 1.5, 1.08]); const target = choice([10, 20, 50, 100, 7, 3]);
  if (base ** 1 >= target) return exponentialWithLogsQuestion();
  const x = Math.log(target) / Math.log(base);
  return q({
    type: "exponential-with-logs", marks: 2,
    prompt: `Solve ${base}ˣ = ${target}, giving x correct to 2 decimal places.`,
    answer: `x ≈ ${r4(x)}`,
    working: [`x = ${log(num(base), target)}`, `= log ${target} ÷ log ${base}`, `≈ ${r4(x)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x ≈ ${r4(target / base)}`, `x ≈ ${r4(Math.log(base) / Math.log(target))}`, `x ≈ ${r4(Math.log10(target / base))}`],
    tags: ["exponential equations", "calculator"]
  });
}

function logGraphQuestion() {
  const b = choice([2, 3, 10]);
  const v = choice(["features", "reflect"]);
  if (v === "features") {
    return q({
      type: "log-graph", marks: 3,
      prompt: `The graph of y = ${log(b, "x")} is shown.`,
      diagram: plane({ xMin: -1, xMax: b === 10 ? 12 : 9, yMin: -3, yMax: 3, xLabelEvery: b === 10 ? 2 : 1, equal: false, width: 420, height: 240, curves: [{ kind: "log", a: 1, base: b, h: 0, k: 0, label: `y = ${log(b, "x")}` }], points: [{ x: b, y: 1, label: `(${b}, 1)`, labelPos: "se" }] }),
      subparts: [
        { label: "(a)", prompt: "Write down the x-intercept.", marks: 1, answer: "(1, 0)", working: [`${log(b, 1)} = 0`] },
        { label: "(b)", prompt: "Write the equation of the vertical asymptote.", marks: 1, answer: "x = 0", working: ["logₐ x is only defined for x > 0."] },
        { label: "(c)", prompt: "State the domain and range.", marks: 1, answer: "Domain x > 0; range all real y", working: [] }
      ],
      answer: "(a) (1, 0); (b) x = 0; (c) x > 0, all real y",
      working: [],
      space: SPACE_SIZES.SMALL,
      tags: ["graph"]
    });
  }
  return q({
    type: "log-graph", marks: 2,
    prompt: `The graph of y = ${b}ˣ is shown. On the same axes, sketch y = ${log(b, "x")}, and describe how the two graphs are related.`,
    diagram: plane({ xMin: -4, xMax: 8, yMin: -4, yMax: 8, xLabelEvery: 2, yLabelEvery: 2, curves: [{ kind: "exp", a: 1, base: b, h: 0, k: 0, label: `y = ${b}ˣ` }, { kind: "line", m: 1, c: 0, dashed: true, colour: "#6b7280", label: "y = x" }] }),
    answer: `y = ${log(b, "x")} is the reflection of y = ${b}ˣ in the line y = x. It passes through (1, 0) and (${b}, 1) with asymptote x = 0.`,
    working: ["Swapping x and y reflects a graph in y = x."],
    space: "none",
    mcEligible: false,
    tags: ["graph", "inverse"]
  });
}

const TF = [
  [`log(x + y) = log x + log y`, false, "The product law is log(xy) = log x + log y."],
  [`log(xy) = log x + log y`, true, "Product law."],
  [`[[algfrac:log x:log y]] = log x − log y`, false, "log(x/y) = log x − log y; a quotient of logs is different."],
  [`log(x³) = 3 log x`, true, "Power law."],
  [`(log x)² = 2 log x`, false, "The power law applies to log(x²), not (log x)²."],
  [`log${sub(5)} 1 = 0`, true, "5⁰ = 1."],
  [`log${sub(2)} (−8) = −3`, false, "The log of a negative number is undefined: 2⁻³ = 1/8, not −8."],
  [`log${sub(3)} 3 = 1`, true, "3¹ = 3."],
  [`log${sub(4)} 2 = 2`, false, "4[[sup:1/2]] = 2, so log₄ 2 = [[frac:1:2]]."]
];

function logTrueFalseQuestion() {
  const [s, t, why] = choice(TF);
  return q({
    type: "log-true-false", marks: 1,
    prompt: `True or false: ${s}? Explain.`,
    answer: `${t ? "True" : "False"}. ${why}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["log laws", "reasoning"]
  });
}

function logGrowthDecayQuestion() {
  const v = choice(["growth", "decay", "double"]);
  if (v === "growth") {
    const P0 = choice([200, 500, 1000]); const r = choice([3, 4, 5, 6, 8]); const target = P0 * choice([2, 3, 5]);
    const t = Math.log(target / P0) / Math.log(1 + r / 100);
    return q({ type: "log-growth-decay", marks: 3, prompt: `A population is modelled by P = ${P0} × ${(1 + r / 100).toFixed(2)}ᵗ, where t is in years. How many years does it take for the population to reach ${target}? Answer to 1 decimal place.`, answer: `t ≈ ${(Math.round(t * 10) / 10).toFixed(1)} years`, working: [`${(1 + r / 100).toFixed(2)}ᵗ = ${target / P0}`, `t = log ${target / P0} ÷ log ${(1 + r / 100).toFixed(2)}`, `≈ ${t.toFixed(2)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`t ≈ ${((target / P0 - 1) / (r / 100)).toFixed(1)} years`, `t ≈ ${(Math.log(target) / Math.log(1 + r / 100)).toFixed(1)} years`], tags: ["growth", "context"] });
  }
  if (v === "decay") {
    const A0 = choice([80, 100, 200]); const r = choice([10, 15, 20, 25]); const target = A0 * choice([0.5, 0.25, 0.1]);
    const t = Math.log(target / A0) / Math.log(1 - r / 100);
    return q({ type: "log-growth-decay", marks: 3, prompt: `The mass of a substance decreases by ${r}% each day: M = ${A0} × ${(1 - r / 100).toFixed(2)}ᵗ grams. After how many days will the mass first fall below ${target} g?`, answer: `${Math.ceil(t)} days (t ≈ ${t.toFixed(2)})`, working: [`${(1 - r / 100).toFixed(2)}ᵗ = ${target / A0}`, `t = log ${target / A0} ÷ log ${(1 - r / 100).toFixed(2)} ≈ ${t.toFixed(2)}`, `So the first whole day is ${Math.ceil(t)}.`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.floor(t)} days (t ≈ ${t.toFixed(2)})`, `${Math.ceil((1 - target / A0) / (r / 100))} days`], tags: ["decay", "context"] });
  }
  const r = choice([4, 5, 6, 7.5, 8, 10]);
  const t = Math.log(2) / Math.log(1 + r / 100);
  return q({ type: "log-growth-decay", marks: 2, prompt: `An investment grows at ${r}% p.a., compounded annually. How many whole years until it first doubles?`, answer: `${Math.ceil(t)} years (t ≈ ${t.toFixed(2)})`, working: [`${(1 + r / 100).toFixed(3).replace(/0$/, "")}ᵗ = 2`, `t = log 2 ÷ log ${(1 + r / 100).toFixed(3).replace(/0$/, "")} ≈ ${t.toFixed(2)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.ceil(100 / r)} years`, `${Math.floor(t)} years`], tags: ["growth", "doubling"] });
}

const GENERATORS = {
  "index-to-log": indexToLogQuestion,
  "log-to-index": logToIndexQuestion,
  "evaluate-log": evaluateLogQuestion,
  "log-laws-combine": logLawsCombineQuestion,
  "log-laws-evaluate": logLawsEvaluateQuestion,
  "log-laws-expand": logLawsExpandQuestion,
  "log-laws-in-terms": logLawsInTermsQuestion,
  "solve-log-equation": solveLogEquationQuestion,
  "exponential-same-base": exponentialSameBaseQuestion,
  "exponential-with-logs": exponentialWithLogsQuestion,
  "log-graph": logGraphQuestion,
  "log-true-false": logTrueFalseQuestion,
  "log-growth-decay": logGrowthDecayQuestion
};

export function getLogarithmsQuestionTypes() { return TYPE_LIST; }
export function generateLogarithmsQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
