/*
  Mills Maths Tools — Stage 5 Question Bank: Variation and Rates of Change A
  ---------------------------------------------------------------------------
  question-banks/stage-5/variation-a/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-RAT-P-01 (Path):
    solves problems involving direct and inverse variation.

  Content:
    - direct variation y = kx: find the constant, use it, graphs through
      the origin, the constant as the gradient
    - inverse variation y = k/x: find the constant, use it, hyperbola graphs
    - recognise direct or inverse variation from tables, graphs and context
    - variation with powers: y ∝ x², y ∝ x³, y ∝ 1/x², y ∝ √x
    - the effect of changing x (doubling, halving, tripling) on y

  Graphs come from the plane engine; tables use the shared table spec.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, fmt
} from "../../_shared/bank-helpers.js";
import { num, MINUS, Q } from "../../_shared/algebra-helpers.js";

const TOPIC = "Variation and Rates of Change A";

const TYPE_LIST = [
  { id: "direct-find-k", label: "Direct variation: find k and use it" },
  { id: "direct-context", label: "Direct variation in context" },
  { id: "direct-graph", label: "Direct variation from a graph" },
  { id: "inverse-find-k", label: "Inverse variation: find k and use it" },
  { id: "inverse-context", label: "Inverse variation in context" },
  { id: "inverse-graph", label: "Inverse variation graphs" },
  { id: "identify-variation-table", label: "Direct, inverse or neither? (tables)" },
  { id: "identify-variation-context", label: "Direct or inverse? (contexts)" },
  { id: "power-variation", label: "Variation with powers (y ∝ x², 1/x², …)" },
  { id: "change-effect", label: "Effect of changing x on y" },
  { id: "complete-variation-table", label: "Complete a variation table" },
  { id: "variation-multi-part", label: "Multi-part variation problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "variation", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const d2 = v => fmt(v, 2).replace(/^-/, MINUS);
const kTxt = k => (Number.isInteger(k) ? String(k) : d2(k));

function directFindKQuestion() {
  const k = choice([2, 3, 4, 5, 6, 1.5, 2.5, 0.4, 0.8, 12]);
  const x1 = choice([2, 4, 5, 6, 8, 10]); const y1 = +(k * x1).toFixed(4);
  const x2 = choice([3, 7, 9, 12, 15, 20].filter(v => v !== x1)); const y2 = +(k * x2).toFixed(4);
  const ask = choice(["y", "x"]);
  return q({
    type: "direct-find-k", marks: 3,
    prompt: ask === "y"
      ? `y varies directly with x, and y = ${kTxt(y1)} when x = ${x1}. Find the constant of variation k, then find y when x = ${x2}.`
      : `y is directly proportional to x, and y = ${kTxt(y1)} when x = ${x1}. Find k, then find x when y = ${kTxt(y2)}.`,
    answer: ask === "y" ? `k = ${kTxt(k)}; y = ${kTxt(y2)}` : `k = ${kTxt(k)}; x = ${x2}`,
    working: ["y = kx", `${kTxt(y1)} = k × ${x1}, so k = ${kTxt(k)}`, ask === "y" ? `y = ${kTxt(k)} × ${x2} = ${kTxt(y2)}` : `${kTxt(y2)} = ${kTxt(k)}x, so x = ${x2}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: ask === "y" ? [`k = ${kTxt(k)}; y = ${kTxt(+(y1 + (x2 - x1)).toFixed(2))}`, `k = ${kTxt(+(x1 / y1).toFixed(2))}; y = ${kTxt(+(x2 * x1 / y1).toFixed(2))}`] : [`k = ${kTxt(k)}; x = ${kTxt(+(y2 * k).toFixed(2))}`],
    tags: ["direct variation"]
  });
}

const DIRECT_CONTEXTS = [
  { set: "The cost C of petrol varies directly with the number of litres L bought.", v: ["L", "C"], unit: ["L", "$"], k: [1.8, 1.9, 2.1, 2.2], xs: [20, 30, 40, 45, 50, 60] },
  { set: "The distance d travelled at a constant speed varies directly with the time t.", v: ["t", "d"], unit: ["h", "km"], k: [60, 70, 80, 90], xs: [2, 3, 4, 5, 1.5, 2.5] },
  { set: "The mass m of a steel rod varies directly with its length ℓ.", v: ["ℓ", "m"], unit: ["m", "kg"], k: [3, 4, 5, 7.5], xs: [2, 4, 6, 8, 10, 12] },
  { set: "A worker's pay P varies directly with the number of hours h worked.", v: ["h", "P"], unit: ["h", "$"], k: [24, 26, 28, 32], xs: [5, 8, 10, 12, 15, 20] },
  { set: "The stretch s of a spring varies directly with the mass m hung from it.", v: ["m", "s"], unit: ["kg", "cm"], k: [1.5, 2, 2.5, 4], xs: [2, 3, 4, 6, 8, 10] }
];
const withUnit = (v, u) => (u === "$" ? `$${fmt(v, 2).replace(/\.00$/, "")}` : `${kTxt(v)} ${u}`);

function directContextQuestion() {
  const c = choice(DIRECT_CONTEXTS); const k = choice(c.k);
  const [x1, x2] = shuffle(c.xs).slice(0, 2);
  const y1 = +(k * x1).toFixed(2); const y2 = +(k * x2).toFixed(2);
  return q({
    type: "direct-context", marks: 3,
    prompt: `${c.set} When ${c.v[0]} = ${kTxt(x1)} ${c.unit[0]}, ${c.v[1]} = ${withUnit(y1, c.unit[1])}. Find ${c.v[1]} when ${c.v[0]} = ${kTxt(x2)} ${c.unit[0]}.`,
    answer: withUnit(y2, c.unit[1]),
    working: [`${c.v[1]} = k${c.v[0]}`, `k = ${kTxt(y1)} ÷ ${kTxt(x1)} = ${kTxt(k)}`, `${c.v[1]} = ${kTxt(k)} × ${kTxt(x2)} = ${kTxt(y2)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [withUnit(+(y1 * x1 / x2).toFixed(2), c.unit[1]), withUnit(+(y1 + x2 - x1).toFixed(2), c.unit[1]), withUnit(+(y2 * 10).toFixed(2), c.unit[1])],
    tags: ["direct variation", "context"]
  });
}

function directGraphQuestion() {
  const k = choice([new Q(1, 2), new Q(2, 1), new Q(3, 1), new Q(3, 2), new Q(2, 3), new Q(4, 1), new Q(5, 2)]);
  const xp = k.d * choice([2, 3, 4].filter(v => k.d * v <= 8)); const yp = (k.n * xp) / k.d;
  const yMax = Math.ceil(Math.max(yp, k.n * 8 / k.d) / 2) * 2 + 2;
  return q({
    type: "direct-graph", marks: 2,
    prompt: "The graph shows y varying directly with x. Find the equation connecting y and x, and use it to find y when x = 20.",
    diagram: plane({ xMin: 0, xMax: 8, yMin: 0, yMax, yLabelEvery: yMax > 12 ? 2 : 1, curves: [{ kind: "line", m: k.n / k.d, c: 0, domain: [0, 8] }], points: [{ x: xp, y: yp, label: `(${xp}, ${num(yp)})`, labelPos: "se" }] }),
    answer: `y = ${k.d === 1 ? k.n : k.toString()}x; y = ${num((k.n * 20) / k.d)}`,
    working: [`The line passes through the origin, so y = kx`, `k = ${num(yp)} ÷ ${xp} = ${k.text()}`, `x = 20: y = ${k.text()} × 20 = ${num((k.n * 20) / k.d)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`y = ${new Q(k.d, k.n).toString()}x; y = ${num(+(k.d * 20 / k.n).toFixed(2))}`, `y = x + ${num(yp - xp)}; y = ${num(20 + yp - xp)}`],
    tags: ["direct variation", "graph"]
  });
}

function inverseFindKQuestion() {
  const k = choice([12, 18, 24, 36, 48, 60, 72, 120]);
  const divs = [1, 2, 3, 4, 5, 6, 8, 10, 12].filter(d => k % d === 0 && d !== 1);
  const [x1, x2] = shuffle(divs).slice(0, 2);
  const ask = choice(["y", "x"]);
  return q({
    type: "inverse-find-k", marks: 3,
    prompt: ask === "y"
      ? `y varies inversely with x, and y = ${k / x1} when x = ${x1}. Find k, then find y when x = ${x2}.`
      : `y is inversely proportional to x, and y = ${k / x1} when x = ${x1}. Find k, then find x when y = ${k / x2}.`,
    answer: ask === "y" ? `k = ${k}; y = ${k / x2}` : `k = ${k}; x = ${x2}`,
    working: ["y = k/x, so k = xy", `k = ${x1} × ${k / x1} = ${k}`, ask === "y" ? `y = ${k} ÷ ${x2} = ${k / x2}` : `x = ${k} ÷ ${k / x2} = ${x2}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: ask === "y" ? [`k = ${k}; y = ${num(+(k / x1 * x2 / x1).toFixed(2))}`, `k = ${num(+(k / x1 / x1).toFixed(2))}; y = ${num(+(k / x1 / x1 * x2).toFixed(2))}`] : [`k = ${k}; x = ${num(+(k / x2 / x1).toFixed(2))}`],
    tags: ["inverse variation"]
  });
}

const INVERSE_CONTEXTS = [
  { set: n => `It takes ${n.w1} workers ${n.t1} days to build a fence. Assuming all work at the same rate, how many days would ${n.w2} workers take?`, gen: () => { const k = choice([24, 36, 48, 60]); const ds = [2, 3, 4, 6, 8, 12].filter(d => k % d === 0); const [w1, w2] = shuffle(ds).slice(0, 2); return { w1, w2, t1: k / w1, ans: `${k / w2} days`, k, wrong: [`${num(+(k / w1 * w2 / w1).toFixed(1))} days`, `${k / w1 + w1 - w2} days`], work: [`days = k ÷ workers`, `k = ${w1} × ${k / w1} = ${k} worker-days`, `${k} ÷ ${w2} = ${k / w2} days`] }; } },
  { set: n => `At ${n.w1} km/h a journey takes ${n.t1} hours. How long would the same journey take at ${n.w2} km/h?`, gen: () => { const k = choice([240, 300, 360, 480]); const ds = [40, 48, 50, 60, 80, 90, 100, 120].filter(d => k % d === 0); const [w1, w2] = shuffle(ds).slice(0, 2); return { w1, w2, t1: k / w1, ans: `${num(k / w2)} hours`, k, wrong: [`${num(+(k / w1 * w2 / w1).toFixed(2))} hours`, `${num(+(w2 / w1).toFixed(2))} hours`], work: ["time = distance ÷ speed, and the distance is fixed", `distance = ${w1} × ${k / w1} = ${k} km`, `${k} ÷ ${w2} = ${num(k / w2)} hours`] }; } },
  { set: n => `A prize pool is shared equally. With ${n.w1} winners each receives $${n.t1}. How much would each receive if there were ${n.w2} winners?`, gen: () => { const k = choice([1200, 1800, 2400, 3600]); const ds = [2, 3, 4, 5, 6, 8, 10, 12].filter(d => k % d === 0); const [w1, w2] = shuffle(ds).slice(0, 2); return { w1, w2, t1: k / w1, ans: `$${k / w2}`, k, wrong: [`$${num(+(k / w1 * w2 / w1).toFixed(2))}`, `$${k}`], work: [`share = total ÷ winners`, `total = ${w1} × ${k / w1} = $${k}`, `$${k} ÷ ${w2} = $${k / w2}`] }; } }
];

function inverseContextQuestion() {
  const c = choice(INVERSE_CONTEXTS); const n = c.gen();
  return q({ type: "inverse-context", marks: 3, prompt: c.set(n), answer: n.ans, working: n.work, space: SPACE_SIZES.MEDIUM, mcDistractors: n.wrong, tags: ["inverse variation", "context"] });
}

function inverseGraphQuestion() {
  const k = choice([4, 6, 8, 12, 16]);
  const xp = choice([1, 2, 4].filter(x => k % x === 0 && k / x <= 12)); const yp = k / xp;
  const x2 = choice([2, 4, 8].filter(v => v !== xp));
  return q({
    type: "inverse-graph", marks: 2,
    prompt: `The graph shows y varying inversely with x (x > 0). Find the value of k in y = [[algfrac:k:x]], and find y when x = ${x2}.`,
    diagram: plane({ xMin: 0, xMax: 10, yMin: 0, yMax: 14, yLabelEvery: 2, curves: [{ kind: "hyperbola", k, h: 0, v: 0, domain: [k / 14, 10], asymptotes: false }], points: [{ x: xp, y: yp, label: `(${xp}, ${yp})`, labelPos: "ne" }] }),
    answer: `k = ${k}; y = ${num(k / x2)}`,
    working: [`k = xy = ${xp} × ${yp} = ${k}`, `y = ${k} ÷ ${x2} = ${num(k / x2)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`k = ${num(+(yp / xp).toFixed(2))}; y = ${num(+(yp / xp / x2).toFixed(2))}`, `k = ${k}; y = ${num(k * x2)}`],
    tags: ["inverse variation", "graph"]
  });
}

function identifyVariationTableQuestion() {
  const kind = choice(["direct", "inverse", "neither"]);
  const xs = choice([[1, 2, 3, 4, 6], [1, 2, 4, 5, 10], [2, 3, 4, 6, 12]]);
  const k = choice([12, 24, 60].filter(v => xs.every(x => v % x === 0)).concat([]));
  const kk = k || 60;
  let ys;
  if (kind === "direct") { const m = choice([2, 3, 5, 1.5]); ys = xs.map(x => +(m * x).toFixed(1)); }
  else if (kind === "inverse") ys = xs.map(x => kk / x);
  else { const m = choice([2, 3]); const c = choice([1, 2, 5]); ys = xs.map(x => m * x + c); }
  const why = kind === "direct" ? `y ÷ x is constant (${num(+(ys[0] / xs[0]).toFixed(2))})` : kind === "inverse" ? `x × y is constant (${kk})` : "neither y ÷ x nor x × y is constant";
  return q({
    type: "identify-variation-table", marks: 2,
    prompt: "Does the table show direct variation, inverse variation or neither? Give a reason.",
    table: { headerRow: false, rows: [["x", ...xs.map(String)], ["y", ...ys.map(v => num(v))]] },
    answer: `${kind[0].toUpperCase()}${kind.slice(1)}${kind === "neither" ? "" : " variation"}: ${why}.`,
    working: [`y ÷ x: ${xs.map((x, i) => num(+(ys[i] / x).toFixed(2))).join(", ")}`, `x × y: ${xs.map((x, i) => num(+(ys[i] * x).toFixed(2))).join(", ")}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["Direct variation", "Inverse variation", "Neither"].filter(s => !s.toLowerCase().startsWith(kind)).map(s => s),
    tags: ["identify", "table"]
  });
}

const CONTEXTS = [
  ["the number of pizzas ordered and the total cost", "direct"],
  ["the speed of a car and the time taken to travel a fixed distance", "inverse"],
  ["the number of people sharing a bill equally and the amount each pays", "inverse"],
  ["the length of a side of a square and its perimeter", "direct"],
  ["the number of taps filling a tank and the time taken to fill it", "inverse"],
  ["the hours worked at a fixed hourly rate and the total pay", "direct"],
  ["the width and length of rectangles that all have an area of 36 cm²", "inverse"],
  ["the number of litres of water and its mass", "direct"],
  ["the number of pages printed per minute and the time to print a 200-page report", "inverse"],
  ["a person's age and their height", "neither"]
];

function identifyVariationContextQuestion() {
  const [c, kind] = choice(CONTEXTS);
  return q({
    type: "identify-variation-context", marks: 1,
    prompt: `Describe the relationship between ${c}: direct variation, inverse variation, or neither?`,
    answer: kind === "neither" ? "Neither" : `${kind[0].toUpperCase()}${kind.slice(1)} variation`,
    working: [kind === "direct" ? "Doubling one doubles the other." : kind === "inverse" ? "Doubling one halves the other: their product is constant." : "There is no constant ratio or product."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["Direct variation", "Inverse variation", "Neither"].filter(s => !s.toLowerCase().startsWith(kind)),
    tags: ["identify", "context"]
  });
}

const POWERS = [
  { rel: "y ∝ x²", f: (k, x) => k * x * x, kOf: (x, y) => y / (x * x), form: "y = kx²", xs: [2, 3, 4, 5, 6, 10] },
  { rel: "y ∝ x³", f: (k, x) => k * x ** 3, kOf: (x, y) => y / x ** 3, form: "y = kx³", xs: [1, 2, 3, 4] },
  { rel: "y ∝ [[algfrac:1:x²]]", f: (k, x) => k / (x * x), kOf: (x, y) => y * x * x, form: "y = [[algfrac:k:x²]]", xs: [1, 2, 4, 5, 10] },
  { rel: "y ∝ √x", f: (k, x) => k * Math.sqrt(x), kOf: (x, y) => y / Math.sqrt(x), form: "y = k√x", xs: [4, 9, 16, 25, 36, 100] }
];
const CTX_POWERS = [
  { text: (x1, y1, x2) => `The distance d metres that an object falls from rest varies directly with the square of the time t seconds. It falls ${y1} m in ${x1} s. How far does it fall in ${x2} s?`, P: 0, k: [4.9, 5], ans: v => `${kTxt(v)} m` },
  { text: (x1, y1, x2) => `The intensity of light from a lamp varies inversely with the square of the distance from it. At ${x1} m the intensity is ${y1} units. Find the intensity at ${x2} m.`, P: 2, k: [100, 200, 400], ans: v => `${kTxt(v)} units` }
];

function powerVariationQuestion() {
  if (Math.random() < 0.35) {
    const c = choice(CTX_POWERS); const P = POWERS[c.P]; const k = choice(c.k);
    const [x1, x2] = shuffle(P.xs).slice(0, 2);
    const y1 = +P.f(k, x1).toFixed(3); const y2 = +P.f(k, x2).toFixed(3);
    return q({ type: "power-variation", marks: 3, prompt: c.text(x1, kTxt(y1), x2), answer: c.ans(y2), working: [P.form, `k = ${kTxt(k)}`, `${P.form.replace("k", kTxt(k))} at x = ${x2}: ${kTxt(y2)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [c.ans(+(y1 * x2 / x1).toFixed(3)), c.ans(+(y1 * x1 / x2).toFixed(3))], tags: ["power variation", "context"] });
  }
  const P = choice(POWERS); const k = choice([2, 3, 5, 0.5, 4]);
  const [x1, x2] = shuffle(P.xs).slice(0, 2);
  const y1 = +P.f(k, x1).toFixed(4); const y2 = +P.f(k, x2).toFixed(4);
  return q({
    type: "power-variation", marks: 3,
    prompt: `Given ${P.rel}, and y = ${kTxt(y1)} when x = ${x1}, find y when x = ${x2}.`,
    answer: `y = ${kTxt(y2)}`,
    working: [P.form, `k = ${kTxt(k)}`, `y = ${kTxt(y2)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`y = ${kTxt(+(y1 * x2 / x1).toFixed(3))}`, `y = ${kTxt(+(y1 * x1 / x2).toFixed(3))}`],
    tags: ["power variation"]
  });
}

function changeEffectQuestion() {
  const rel = choice([["y ∝ x", 1], ["y ∝ [[algfrac:1:x]]", -1], ["y ∝ x²", 2], ["y ∝ [[algfrac:1:x²]]", -2], ["y ∝ x³", 3]]);
  const [word, factor] = choice([["doubled", 2], ["tripled", 3], ["halved", 0.5]]);
  const m = factor ** rel[1];
  const say = v => (v === 1 ? "stays the same" : v > 1 ? `is multiplied by ${num(v)}` : `is divided by ${num(1 / v)}`);
  return q({
    type: "change-effect", marks: 1,
    prompt: `If ${rel[0]}, what happens to y when x is ${word}?`,
    answer: `y ${say(m)}`,
    working: [`Multiply x by ${num(factor)}: y is multiplied by ${num(factor)}${rel[1] === 1 ? "" : `^${rel[1]}`} = ${num(m)}`.replace("^2", "²").replace("^3", "³").replace("^-1", "⁻¹").replace("^-2", "⁻²")],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`y ${say(factor)}`, `y ${say(1 / factor)}`, `y ${say(factor ** 2 === m ? factor ** 3 : factor ** 2)}`].filter(s => s !== `y ${say(m)}`),
    tags: ["variation", "reasoning"]
  });
}

function completeVariationTableQuestion() {
  const kind = choice(["direct", "inverse", "square"]);
  const xs = kind === "inverse" ? [1, 2, 3, 4, 6, 12] : [1, 2, 3, 4, 5, 6];
  const k = kind === "inverse" ? choice([12, 24, 36]) : choice([2, 3, 4, 5]);
  const f = x => (kind === "direct" ? k * x : kind === "inverse" ? k / x : k * x * x);
  const shownIdx = 1;
  const blanks = [3, 4, 5];
  const rel = kind === "direct" ? "y varies directly with x" : kind === "inverse" ? "y varies inversely with x" : "y varies directly with the square of x";
  return q({
    type: "complete-variation-table", marks: 2,
    prompt: `In the table, ${rel}. Complete the table.`,
    table: { headerRow: false, rows: [["x", ...xs.map(String)], ["y", ...xs.map((x, i) => (i === shownIdx ? num(f(x)) : blanks.includes(i) ? "" : num(f(x))))]] },
    answer: blanks.map(i => `x = ${xs[i]}: y = ${num(f(xs[i]))}`).join("; "),
    working: [kind === "direct" ? `y = ${k}x` : kind === "inverse" ? `y = [[algfrac:${k}:x]]` : `y = ${k}x²`],
    space: "none",
    mcEligible: false,
    tags: ["table"]
  });
}

function variationMultiPartQuestion() {
  const k = choice([0.005, 0.006, 0.008, 0.01]); const v1 = choice([40, 50, 60]); const d1 = +(k * v1 * v1).toFixed(2);
  const v2 = v1 * 2; const d2v = +(k * v2 * v2).toFixed(2);
  return q({
    type: "variation-multi-part", marks: 5,
    prompt: `In a simple model, the braking distance d metres of a car varies directly with the square of its speed v km/h. At ${v1} km/h the braking distance is ${kTxt(d1)} m.`,
    subparts: [
      { label: "(a)", prompt: "Write an equation for d in terms of v, and find the constant of variation k.", marks: 2, answer: `d = kv², k = ${k}`, working: [`${kTxt(d1)} = k × ${v1 * v1}`, `k = ${k}`] },
      { label: "(b)", prompt: `Find the braking distance at ${v2} km/h.`, marks: 1, answer: `${kTxt(d2v)} m`, working: [`d = ${k} × ${v2}² = ${kTxt(d2v)}`, "(doubling v multiplies d by 4)"] },
      { label: "(c)", prompt: "What happens to the braking distance when the speed is halved?", marks: 1, answer: "It is divided by 4.", working: ["(½)² = ¼"] },
      { label: "(d)", prompt: "Sketch the shape of the graph of d against v for v ≥ 0.", marks: 1, answer: "Half a parabola starting at the origin, concave up (getting steeper).", working: [], space: SPACE_SIZES.MEDIUM }
    ],
    answer: `(a) d = ${k}v²; (b) ${kTxt(d2v)} m; (c) divided by 4; (d) half-parabola from the origin`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["power variation", "context", "multi-part"]
  });
}

const GENERATORS = {
  "direct-find-k": directFindKQuestion,
  "direct-context": directContextQuestion,
  "direct-graph": directGraphQuestion,
  "inverse-find-k": inverseFindKQuestion,
  "inverse-context": inverseContextQuestion,
  "inverse-graph": inverseGraphQuestion,
  "identify-variation-table": identifyVariationTableQuestion,
  "identify-variation-context": identifyVariationContextQuestion,
  "power-variation": powerVariationQuestion,
  "change-effect": changeEffectQuestion,
  "complete-variation-table": completeVariationTableQuestion,
  "variation-multi-part": variationMultiPartQuestion
};

export function getVariationAQuestionTypes() { return TYPE_LIST; }
export function generateVariationAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
