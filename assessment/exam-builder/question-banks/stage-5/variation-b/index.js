/*
  Mills Maths Tools — Stage 5 Question Bank: Variation and Rates of Change B
  ---------------------------------------------------------------------------
  question-banks/stage-5/variation-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-RAT-P-02 (Path):
    interprets rates of change from graphs, including variable rates.

  Content:
    - constant rates: the gradient of a straight-line graph as a rate, with
      units; converting rates
    - travel (distance–time) graphs: speeds of each section, rests, return
      journeys, steepest = fastest, average speed
    - average rate of change between two points on a curve
    - describing variable rates: increasing/decreasing at an increasing or
      decreasing rate
    - matching stories to graphs and sketching graphs from stories,
      including containers filling at a constant rate

  Travel and filling graphs are drawn as plane-engine polylines; containers
  are geometry-engine polygons.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, fmt
} from "../../_shared/bank-helpers.js";
import { num, MINUS } from "../../_shared/algebra-helpers.js";

const TOPIC = "Variation and Rates of Change B";

const TYPE_LIST = [
  { id: "gradient-as-rate", label: "The gradient as a rate of change" },
  { id: "convert-rates", label: "Convert rates between units" },
  { id: "travel-graph-speeds", label: "Travel graphs: speeds of each section" },
  { id: "travel-graph-interpret", label: "Travel graphs: interpret the journey" },
  { id: "compare-rates-graph", label: "Compare two rates on one graph" },
  { id: "average-rate-curve", label: "Average rate of change from a curve" },
  { id: "average-rate-table", label: "Average rate of change from a table" },
  { id: "describe-variable-rate", label: "Describe a variable rate of change" },
  { id: "container-filling", label: "Containers filling: which graph?" },
  { id: "story-to-graph", label: "Match a story to a graph" },
  { id: "sketch-from-story", label: "Sketch a graph from a story" },
  { id: "rates-multi-part", label: "Multi-part rates problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "rates of change", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const n2 = v => fmt(v, 2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1").replace(/^-/, MINUS);
const LETTERS = ["A", "B", "C", "D"];

/* ── constant rates ───────────────────────────────────────── */

const LINE_CONTEXTS = [
  { name: "A tank is being emptied.", qty: ["volume", "litres", "minute"], ax: ["t (min)", "V (L)"], unit: "L/min", start: [400, 500, 600], rate: [-20, -25, -40, -50], xMax: 20 },
  { name: "A tank is being filled.", qty: ["volume", "litres", "minute"], ax: ["t (min)", "V (L)"], unit: "L/min", start: [0, 50, 100], rate: [15, 20, 30], xMax: 20 },
  { name: "A cyclist rides at a constant speed.", qty: ["distance", "km", "hour"], ax: ["t (h)", "d (km)"], unit: "km/h", start: [0], rate: [12, 15, 18, 20, 24], xMax: 5 },
  { name: "A candle burns down steadily.", qty: ["height", "cm", "hour"], ax: ["t (h)", "h (cm)"], unit: "cm/h", start: [24, 30, 36], rate: [-2, -3, -4, -6], xMax: 10 },
  { name: "A phone plan charges a fixed fee plus a cost per GB.", qty: ["cost", "dollars", "GB of data"], ax: ["data (GB)", "cost ($)"], unit: "$/GB", start: [10, 15, 20], rate: [5, 8, 10], xMax: 10 }
];

function gradientAsRateQuestion() {
  const c = choice(LINE_CONTEXTS); const b = choice(c.start); const m = choice(c.rate);
  const xMax = Math.min(c.xMax, m < 0 ? Math.floor(-b / m) : c.xMax);
  const yTop = Math.max(b, b + m * xMax);
  const step = Math.pow(10, Math.floor(Math.log10(yTop))) / (yTop / Math.pow(10, Math.floor(Math.log10(yTop))) > 4 ? 1 : 2);
  const yMax = Math.ceil(yTop / step) * step;
  const xStep = xMax > 10 ? 2 : 1;
  const x1 = xStep * 2; const x2 = Math.min(xMax, xStep * 4);
  return q({
    type: "gradient-as-rate", marks: 2,
    prompt: `${c.name} Use the graph to find the rate of change, with units, and explain what it means.`,
    diagram: plane({ xMin: 0, xMax, yMin: 0, yMax, xStep, yStep: step, axisNames: c.ax, equal: false, width: 440, height: 260, curves: [{ kind: "line", m, c: b, domain: [0, xMax] }], points: [{ x: x1, y: b + m * x1, label: `(${x1}, ${num(b + m * x1)})`, labelPos: m > 0 ? "nw" : "ne" }, { x: x2, y: b + m * x2, label: `(${x2}, ${num(b + m * x2)})`, labelPos: m > 0 ? "se" : "sw" }] }),
    answer: `${num(m)} ${c.unit}: the ${c.qty[0]} ${m > 0 ? "increases" : "decreases"} by ${Math.abs(m)} ${c.qty[1]} every ${c.qty[2]}.`,
    working: [`gradient = rise ÷ run = (${num(b + m * x2)} − ${num(b + m * x1)}) ÷ (${x2} − ${x1}) = ${num(m)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${num(-m)} ${c.unit}`, `${num(b)} ${c.unit}`, `${n2(1 / m)} ${c.unit}`].map(s => s),
    tags: ["gradient", "constant rate"]
  });
}

const CONVERSIONS = [
  () => { const v = choice([36, 54, 72, 90, 108]); return { p: `Convert ${v} km/h to m/s.`, a: `${v / 3.6} m/s`, w: [`${v} km/h = ${v * 1000} m per 3600 s`, `${v * 1000} ÷ 3600 = ${v / 3.6} m/s`], d: [`${n2(v * 3.6)} m/s`, `${n2(v / 60)} m/s`] }; },
  () => { const v = choice([5, 10, 15, 20, 25]); return { p: `Convert ${v} m/s to km/h.`, a: `${v * 3.6} km/h`, w: [`${v} m/s = ${v * 3600} m per hour`, `= ${v * 3.6} km/h`], d: [`${n2(v / 3.6)} km/h`, `${v * 60} km/h`] }; },
  () => { const v = choice([12, 15, 18, 24]); return { p: `A tap flows at ${v} L/min. Write this rate in L/h and in mL/s.`, a: `${v * 60} L/h; ${v * 1000 / 60} mL/s`, w: [`${v} × 60 = ${v * 60} L/h`, `${v * 1000} mL ÷ 60 s = ${v * 1000 / 60} mL/s`], d: [`${v * 60} L/h; ${v * 60} mL/s`, `${n2(v / 60)} L/h; ${v * 1000} mL/s`] }; },
  () => { const v = choice([4.5, 6, 7.5, 9]); return { p: `A printer prints ${v * 60} pages per hour. How many pages per minute is this?`, a: `${v} pages/min`, w: [`${v * 60} ÷ 60 = ${v}`], d: [`${v * 3600} pages/min`, `${n2(v * 60 / 100)} pages/min`] }; },
  () => { const c = choice([2.4, 3.2, 4.8]); return { p: `Mince costs $${c.toFixed(2)} per 100 g. Write this as a rate in $/kg.`, a: `$${(c * 10).toFixed(2)}/kg`, w: [`1 kg = 10 × 100 g`, `$${c.toFixed(2)} × 10 = $${(c * 10).toFixed(2)}`], d: [`$${(c * 100).toFixed(2)}/kg`, `$${(c / 10).toFixed(2)}/kg`] }; }
];

function convertRatesQuestion() {
  const c = choice(CONVERSIONS)();
  return q({ type: "convert-rates", marks: 2, prompt: c.p, answer: c.a, working: c.w, space: SPACE_SIZES.SMALL, mcDistractors: c.d, tags: ["rates", "units"] });
}

/* ── travel graphs ────────────────────────────────────────── */

function makeJourney() {
  for (;;) {
    const s1 = choice([10, 20, 30, 40]); const t1 = choice([1, 2]);
    const rest = choice([0.5, 1]);
    const s2 = choice([10, 15, 20, 30]); const t2 = choice([1, 2]);
    const d1 = s1 * t1; const d2 = d1 + s2 * t2;
    if (d2 > 100) continue;
    const back = choice([2, 3, 4].filter(t => (d2 / t) % 5 === 0));
    if (!back) continue;
    const pts = [[0, 0], [t1, d1], [t1 + rest, d1], [t1 + rest + t2, d2], [t1 + rest + t2 + back, 0]];
    const T = pts[4][0];
    if (T > 8) continue;
    return { pts, s1, s2, sb: d2 / back, rest, d1, d2, T, back, t1, t2 };
  }
}

function travelPlane(j, extra = {}) {
  const yMax = Math.ceil(j.d2 / 10) * 10 + 10;
  return plane({ xMin: 0, xMax: Math.ceil(j.T), yMin: 0, yMax, xStep: 0.5, xLabelEvery: 2, yStep: 10, yLabelEvery: yMax > 60 ? 2 : 1, axisNames: ["t (h)", "distance from home (km)"], equal: false, width: 460, height: 260, polylines: [{ pts: j.pts }], texts: ["A", "B", "C", "D"].map((L, i) => { const dy = j.pts[i + 1][1] - j.pts[i][1]; return { x: (j.pts[i][0] + j.pts[i + 1][0]) / 2 + (dy < 0 ? 0.3 : dy > 0 ? -0.3 : 0), y: (j.pts[i][1] + j.pts[i + 1][1]) / 2 + yMax * 0.07, text: L }; }), ...extra });
}

function travelGraphSpeedsQuestion() {
  const j = makeJourney();
  return q({
    type: "travel-graph-speeds", marks: 4,
    prompt: "The travel graph shows a cyclist's journey away from home and back, in sections A, B, C and D.",
    diagram: travelPlane(j),
    subparts: [
      { label: "(a)", prompt: "Find the speed in section A.", marks: 1, answer: `${j.s1} km/h`, working: [`${j.d1} km ÷ ${j.t1} h`] },
      { label: "(b)", prompt: "What is happening in section B?", marks: 1, answer: `The cyclist is resting (stopped) for ${j.rest === 0.5 ? "30 minutes" : "1 hour"}.`, working: ["The graph is horizontal: distance does not change."] },
      { label: "(c)", prompt: "Find the speed in section D, the journey home.", marks: 1, answer: `${n2(j.sb)} km/h`, working: [`${j.d2} km ÷ ${j.back} h`] },
      { label: "(d)", prompt: "In which section was the cyclist travelling fastest? Explain.", marks: 1, answer: `${["A", "C", "D"][[j.s1, j.s2, j.sb].indexOf(Math.max(j.s1, j.s2, j.sb))]}: it is the steepest section (${n2(Math.max(j.s1, j.s2, j.sb))} km/h).`, working: [`Speeds: A ${j.s1}, C ${j.s2}, D ${n2(j.sb)} km/h`] }
    ],
    answer: `(a) ${j.s1} km/h; (b) resting; (c) ${n2(j.sb)} km/h`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["travel graph", "speed"]
  });
}

function travelGraphInterpretQuestion() {
  const j = makeJourney();
  const total = 2 * j.d2;
  const avg = total / j.T;
  return q({
    type: "travel-graph-interpret", marks: 3,
    prompt: "The travel graph shows a cyclist's round trip from home.",
    diagram: travelPlane(j),
    subparts: [
      { label: "(a)", prompt: "How far from home did the cyclist travel?", marks: 1, answer: `${j.d2} km`, working: [] },
      { label: "(b)", prompt: "What was the total time for the trip, including rests?", marks: 1, answer: `${n2(j.T)} hours`, working: [] },
      { label: "(c)", prompt: "Find the average speed for the whole trip.", marks: 1, answer: `${n2(avg)} km/h`, working: [`total distance ${total} km ÷ ${n2(j.T)} h = ${n2(avg)} km/h`] }
    ],
    answer: `(a) ${j.d2} km; (b) ${n2(j.T)} h; (c) ${n2(avg)} km/h`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["travel graph", "average speed"]
  });
}

function compareRatesGraphQuestion() {
  for (;;) {
    const sA = choice([40, 50, 60]); const head = choice([20, 40, 60]); const sB = choice([60, 70, 80, 90, 100].filter(v => v > sA));
    // A starts at t=0 from 0; B starts at t=0.5 from 0 (later) → meet when sA t = sB (t − 0.5)
    const delay = choice([0.5, 1]);
    const tMeet = (sB * delay) / (sB - sA);
    if (!Number.isInteger(tMeet * 2) || tMeet > 5) continue;
    void head;
    const dMeet = sA * tMeet; const T = Math.ceil(tMeet + 1);
    const yMax = Math.ceil((sA * T) / 50) * 50 + 50;
    return q({
      type: "compare-rates-graph", marks: 3,
      prompt: `Car A leaves town at time 0. Car B leaves the same town ${delay === 1 ? "1 hour" : "30 minutes"} later along the same road. The graph shows both journeys.`,
      diagram: plane({ xMin: 0, xMax: T, yMin: 0, yMax, xStep: 0.5, xLabelEvery: 2, yStep: 25, yLabelEvery: 2, axisNames: ["t (h)", "distance (km)"], equal: false, width: 440, height: 260, polylines: [{ pts: [[0, 0], [T, sA * T]], label: "A" }, { pts: [[delay, 0], [Math.min(T, delay + yMax / sB), Math.min(yMax, sB * (T - delay))]], label: "B", colour: "#b91c1c" }] }),
      subparts: [
        { label: "(a)", prompt: "Find the speed of each car.", marks: 1, answer: `A: ${sA} km/h; B: ${sB} km/h`, working: ["Speed = gradient of each line."] },
        { label: "(b)", prompt: "When and where does car B catch up to car A?", marks: 2, answer: `After ${n2(tMeet)} hours, ${n2(dMeet)} km from town.`, working: [`${sA}t = ${sB}(t − ${delay})`, `t = ${n2(tMeet)}`, `d = ${sA} × ${n2(tMeet)} = ${n2(dMeet)}`] }
      ],
      answer: `(a) A ${sA} km/h, B ${sB} km/h; (b) t = ${n2(tMeet)} h, ${n2(dMeet)} km`,
      working: [],
      space: SPACE_SIZES.SMALL,
      tags: ["travel graph", "compare rates"]
    });
  }
}

/* ── variable rates ───────────────────────────────────────── */

function averageRateCurveQuestion() {
  const v = choice(["quad", "exp"]);
  if (v === "quad") {
    // height of a ball: h = −5t² + bt
    const b = choice([20, 25, 30]); const f = t => -5 * t * t + b * t;
    const T = b / 5; const [t1, t2] = choice([[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [0, 3]].filter(p => p[1] <= T && p[0] + p[1] !== T));
    const r = (f(t2) - f(t1)) / (t2 - t1);
    const yMax = Math.ceil(f(T / 2) / 5) * 5 + 5;
    return q({
      type: "average-rate-curve", marks: 2,
      prompt: `The graph shows the height h metres of a ball t seconds after it is thrown, h = −5t² + ${b}t. Find the average rate of change of height between t = ${t1} and t = ${t2}.`,
      diagram: plane({ xMin: 0, xMax: Math.ceil(T), yMin: 0, yMax, yStep: 5, yLabelEvery: 2, axisNames: ["t (s)", "h (m)"], equal: false, width: 420, height: 260, curves: [{ kind: "quadratic", a: -5, b, c: 0, domain: [0, T] }], points: [{ x: t1, y: f(t1), label: `(${t1}, ${f(t1)})`, labelPos: "nw" }, { x: t2, y: f(t2), label: `(${t2}, ${f(t2)})`, labelPos: "ne" }], segments: [{ from: [t1, f(t1)], to: [t2, f(t2)], dashed: true, colour: "#b91c1c" }] }),
      answer: `${n2(r)} m/s`,
      working: [`(h(${t2}) − h(${t1})) ÷ (${t2} − ${t1}) = (${f(t2)} − ${f(t1)}) ÷ ${t2 - t1} = ${n2(r)} m/s`, "This is the gradient of the dashed chord."],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [`${n2(f(t2) / t2)} m/s`, `${n2(f(t2) - f(t1))} m/s`, `${n2(-r)} m/s`].filter(s => s !== `${n2(r)} m/s`),
      tags: ["average rate", "curve"]
    });
  }
  const P0 = choice([100, 200, 500]); const f = t => P0 * 2 ** t;
  const [t1, t2] = choice([[0, 2], [1, 3], [2, 4], [0, 3]]);
  const r = (f(t2) - f(t1)) / (t2 - t1);
  const yMax = f(4) + P0;
  return q({
    type: "average-rate-curve", marks: 2,
    prompt: `A bacteria population doubles every hour: P = ${P0} × 2ᵗ. Find the average rate of growth between t = ${t1} and t = ${t2} hours.`,
    diagram: plane({ xMin: 0, xMax: 4, yMin: 0, yMax, yStep: P0, yLabelEvery: 2, axisNames: ["t (h)", "P"], equal: false, width: 400, height: 260, curves: [{ kind: "exp", a: P0, base: 2, h: 0, k: 0, domain: [0, 4], asymptotes: false }], points: [{ x: t1, y: f(t1), label: `(${t1}, ${f(t1)})`, labelPos: "nw" }, { x: t2, y: f(t2), label: `(${t2}, ${f(t2)})`, labelPos: "w" }], segments: [{ from: [t1, f(t1)], to: [t2, f(t2)], dashed: true, colour: "#b91c1c" }] }),
    answer: `${n2(r)} bacteria per hour`,
    working: [`(${f(t2)} − ${f(t1)}) ÷ (${t2} − ${t1}) = ${n2(r)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${n2(f(t2) / t2)} bacteria per hour`, `${n2(f(t2) - f(t1))} bacteria per hour`],
    tags: ["average rate", "exponential"]
  });
}

function averageRateTableQuestion() {
  const ctx = choice([
    { name: "The temperature of an oven (°C) was recorded as it heated.", ax: ["Time (min)", "Temperature (°C)"], unit: "°C per minute", ts: [0, 5, 10, 15, 20], gen: () => { const vals = [20]; [35, 30, 22, 12].forEach(d => vals.push(vals[vals.length - 1] + d + randInt(-2, 2))); return vals; } },
    { name: "The height of a seedling (cm) was measured each week.", ax: ["Week", "Height (cm)"], unit: "cm per week", ts: [0, 1, 2, 3, 4], gen: () => { const vals = [2]; [1.2, 2.5, 3.8, 4.4].forEach(d => vals.push(+(vals[vals.length - 1] + d + randInt(-3, 3) / 10).toFixed(1))); return vals; } },
    { name: "The number of people in a stadium was counted before a game.", ax: ["Time (min)", "People"], unit: "people per minute", ts: [0, 15, 30, 45, 60], gen: () => { const vals = [0]; [1500, 4200, 7800, 3000].forEach(d => vals.push(vals[vals.length - 1] + d)); return vals; } }
  ]);
  const vals = ctx.gen();
  const i = randInt(0, 2); const j = i + randInt(1, 4 - i);
  const r = (vals[j] - vals[i]) / (ctx.ts[j] - ctx.ts[i]);
  return q({
    type: "average-rate-table", marks: 2,
    prompt: `${ctx.name} Find the average rate of change between ${ctx.ax[0].toLowerCase().replace(/ \(.*\)/, "")} ${ctx.ts[i]} and ${ctx.ax[0].toLowerCase().replace(/ \(.*\)/, "")} ${ctx.ts[j]}${ctx.ax[0].includes("min") ? " minutes" : ""}.`,
    table: { headerRow: false, rows: [[ctx.ax[0], ...ctx.ts.map(String)], [ctx.ax[1], ...vals.map(v => n2(v))]] },
    answer: `${n2(r)} ${ctx.unit}`,
    working: [`(${n2(vals[j])} − ${n2(vals[i])}) ÷ (${ctx.ts[j]} − ${ctx.ts[i]}) = ${n2(r)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${n2(vals[j] - vals[i])} ${ctx.unit}`, `${n2(vals[j] / ctx.ts[j] || vals[j])} ${ctx.unit}`],
    tags: ["average rate", "table"]
  });
}

const RATE_SHAPES = [
  { d: "increasing at an increasing rate", f: t => t * t / 10 },
  { d: "increasing at a decreasing rate", f: t => 10 - (10 - t) ** 2 / 10 },
  { d: "decreasing at an increasing rate", f: t => 10 - t * t / 10 },
  { d: "decreasing at a decreasing rate", f: t => (10 - t) ** 2 / 10 },
  { d: "increasing at a constant rate", f: t => t * 0.9 }
];
const sampleFn = (f, a = 0, b = 10, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const t = a + ((b - a) * i) / n; return [t, f(t)]; });

function describeVariableRateQuestion() {
  const k = randInt(0, RATE_SHAPES.length - 1); const S = RATE_SHAPES[k];
  return q({
    type: "describe-variable-rate", marks: 1,
    prompt: "Which description best matches the graph?",
    diagram: plane({ xMin: 0, xMax: 10, yMin: 0, yMax: 10, numbers: false, grid: false, axisNames: ["time", "quantity"], width: 300, height: 220, equal: false, polylines: [{ pts: sampleFn(S.f) }] }),
    answer: `${S.d[0].toUpperCase()}${S.d.slice(1)}`,
    working: [S.d.includes("constant") ? "A straight line has a constant gradient." : `The curve ${S.d.startsWith("increasing") ? "rises" : "falls"} and gets ${S.d.endsWith("increasing rate") ? "steeper" : "flatter"}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: RATE_SHAPES.filter((_, i) => i !== k).map(s => `${s.d[0].toUpperCase()}${s.d.slice(1)}`),
    tags: ["variable rate"]
  });
}

/* ── containers ──────────────────────────────────────────── */

// Each container: outline points (y down, 0..100 tall) and h(t) for a
// constant inflow, both on 0..10.
const CONTAINERS = [
  { name: "cylinder", pts: [[0, 0], [0, 100], [60, 100], [60, 0]], h: t => t },
  { name: "cone, point down", pts: [[0, 0], [30, 100], [60, 0]], h: t => 10 * Math.cbrt(t / 10) },
  { name: "cone, point up (wide base)", pts: [[30, 0], [0, 100], [60, 100]], h: t => 10 * (1 - Math.cbrt(1 - t / 10)) },
  { name: "wide at the bottom, narrow at the top", pts: [[15, 0], [15, 50], [0, 50], [0, 100], [60, 100], [60, 50], [45, 50], [45, 0]], h: t => (t <= 8 ? t * 5 / 8 : 5 + (t - 8) * 5 / 2) },
  { name: "narrow at the bottom, wide at the top", pts: [[0, 0], [0, 50], [15, 50], [15, 100], [45, 100], [45, 50], [60, 50], [60, 0]], h: t => (t <= 2 ? t * 5 / 2 : 5 + (t - 2) * 5 / 8) }
];

function containerDiagram(c) {
  const P = {}; const names = [];
  c.pts.forEach((p, i) => { const n = `P${i}`; P[n] = [p[0] * 1.4 + 10, p[1] * 1.4 + 10]; names.push(n); });
  return { engine: "geometry-engine", config: { points: P, polygons: [{ pts: names, fill: "#dbeafe" }], vertexLabels: false } };
}

function containerFillingQuestion() {
  const k = randInt(0, CONTAINERS.length - 1); const c = CONTAINERS[k];
  const others = shuffle(CONTAINERS.filter((_, i) => i !== k)).slice(0, 3);
  const cards = shuffle([c, ...others]);
  const correct = LETTERS[cards.indexOf(c)];
  const why = c.name === "cylinder" ? "The width is constant, so the depth rises at a constant rate (a straight line)."
    : c.h(1) > 1.2 ? "It is narrow at the bottom, so the depth rises quickly at first and then more slowly."
    : "It is wide at the bottom, so the depth rises slowly at first and then faster.";
  return q({
    type: "container-filling", marks: 2,
    prompt: "Water is poured at a constant rate into the empty container shown (side view).",
    diagram: containerDiagram(c),
    subparts: [
      { label: "(a)", prompt: "Which graph shows the depth of water h against time t?", marks: 1, answer: correct, working: [], space: SPACE_SIZES.SMALL,
        diagram: plane({ diagramType: "options", columns: 2, panels: cards.map((x, i) => ({ label: LETTERS[i], xMin: 0, xMax: 10, yMin: 0, yMax: 10, numbers: false, grid: false, equal: true, axisNames: ["t", "h"], polylines: [{ pts: sampleFn(x.h) }] })) }) },
      { label: "(b)", prompt: "Explain your choice.", marks: 1, answer: why, working: [], space: SPACE_SIZES.SMALL }
    ],
    answer: `(a) ${correct}; (b) ${why}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["containers", "variable rate"]
  });
}

/* stories */
const STORIES = [
  { s: "Mia walks to the shop at a steady pace, stays there for a while, then walks home at the same pace.", g: [[0, 0], [3, 6], [5, 6], [8, 0]] },
  { s: "Mia walks to the shop at a steady pace, stays there for a while, then runs home.", g: [[0, 0], [4, 6], [6, 6], [7.5, 0]] },
  { s: "Mia runs to the shop, stays there for a while, then walks home slowly.", g: [[0, 0], [1.5, 6], [3.5, 6], [8, 0]] },
  { s: "Mia walks to the shop at a steady pace and then walks straight home at the same pace.", g: [[0, 0], [4, 6], [8, 0]] },
  { s: "Mia walks towards the shop, stops to talk to a friend, then continues to the shop and stays there.", g: [[0, 0], [2, 3], [4, 3], [6, 6], [9, 6]] }
];

function storyToGraphQuestion() {
  const k = randInt(0, STORIES.length - 1);
  const cards = shuffle(STORIES.map((s, i) => ({ s, i }))).filter(c => c.i !== k).slice(0, 3).concat([{ s: STORIES[k], i: k }]);
  const order = shuffle(cards);
  const correct = LETTERS[order.findIndex(c => c.i === k)];
  return q({
    type: "story-to-graph", marks: 1,
    prompt: `${STORIES[k].s} Which graph shows her distance from home against time?`,
    diagram: plane({ diagramType: "options", columns: 2, panels: order.map((c, i) => ({ label: LETTERS[i], xMin: 0, xMax: 10, yMin: 0, yMax: 8, numbers: false, grid: false, equal: false, axisNames: ["time", "distance"], polylines: [{ pts: c.s.g }] })) }),
    answer: correct,
    working: ["Steeper = faster; horizontal = stopped; sloping down = returning home."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: LETTERS.filter(l => l !== correct),
    tags: ["story", "travel graph"]
  });
}

const SKETCH_STORIES = [
  { s: "A bath is filled at a constant rate, someone gets in (the level jumps up), and after a while they get out and the plug is pulled so the bath empties steadily.", ax: ["time", "water level"], a: "Straight rising line; a sudden vertical jump; horizontal section; a sudden drop; straight falling line to zero." },
  { s: "A car accelerates away from traffic lights, travels at a constant speed, then slows to a stop at the next lights.", ax: ["time", "speed"], a: "Rising section from 0; horizontal section; falling section back to 0." },
  { s: "The temperature of a cup of hot coffee left on a bench, measured over an hour.", ax: ["time", "temperature"], a: "Decreasing at a decreasing rate, levelling off at room temperature (not reaching 0)." },
  { s: "A plant's height as it grows from a seedling: slowly at first, then quickly, then slowing as it reaches full size.", ax: ["time", "height"], a: "S-shaped curve: flat, then steep, then levelling off." },
  { s: "The height above the ground of a person on a Ferris wheel over two full rotations, starting at the bottom.", ax: ["time", "height"], a: "A smooth wave: rises to the top and back down, twice, never below the starting height." }
];

function sketchFromStoryQuestion() {
  const s = choice(SKETCH_STORIES);
  return q({
    type: "sketch-from-story", marks: 2,
    prompt: `Sketch a graph of ${s.ax[1]} against ${s.ax[0]} for this situation: ${s.s}`,
    diagram: plane({ xMin: 0, xMax: 10, yMin: 0, yMax: 8, numbers: false, grid: false, equal: false, width: 380, height: 220, axisNames: s.ax }),
    answer: s.a,
    working: [],
    space: "none",
    mcEligible: false,
    tags: ["story", "sketch"]
  });
}

function ratesMultiPartQuestion() {
  const start = choice([800, 1000, 1200]); const r1 = choice([20, 25, 40]); const t1 = choice([10, 12, 16].filter(t => r1 * t < start / 2));
  const r2 = r1 * 2; const left = start - r1 * t1; const t2 = left / r2;
  if (!Number.isInteger(t2 * 2)) return ratesMultiPartQuestion();
  const T = t1 + t2;
  return q({
    type: "rates-multi-part", marks: 5,
    prompt: `A pool holding ${start} L is drained. For the first ${t1} minutes it drains at ${r1} L/min; then a second pump is switched on and it drains at ${r2} L/min until empty.`,
    subparts: [
      { label: "(a)", prompt: `How much water is left after ${t1} minutes?`, marks: 1, answer: `${left} L`, working: [`${start} − ${r1} × ${t1}`] },
      { label: "(b)", prompt: "How long does the pool take to empty altogether?", marks: 2, answer: `${n2(T)} minutes`, working: [`${left} ÷ ${r2} = ${n2(t2)} min`, `${t1} + ${n2(t2)} = ${n2(T)}`] },
      { label: "(c)", prompt: "Draw a graph of volume against time, labelling key points.", marks: 2, answer: `Straight line from (0, ${start}) to (${t1}, ${left}), then a steeper line to (${n2(T)}, 0).`, working: [], space: "none", diagram: plane({ xMin: 0, xMax: Math.ceil(T / 5) * 5, yMin: 0, yMax: start, xStep: 5, yStep: start / 4, axisNames: ["t (min)", "V (L)"], equal: false, width: 420, height: 240 }) }
    ],
    answer: `(a) ${left} L; (b) ${n2(T)} min`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part", "rates"]
  });
}

const GENERATORS = {
  "gradient-as-rate": gradientAsRateQuestion,
  "convert-rates": convertRatesQuestion,
  "travel-graph-speeds": travelGraphSpeedsQuestion,
  "travel-graph-interpret": travelGraphInterpretQuestion,
  "compare-rates-graph": compareRatesGraphQuestion,
  "average-rate-curve": averageRateCurveQuestion,
  "average-rate-table": averageRateTableQuestion,
  "describe-variable-rate": describeVariableRateQuestion,
  "container-filling": containerFillingQuestion,
  "story-to-graph": storyToGraphQuestion,
  "sketch-from-story": sketchFromStoryQuestion,
  "rates-multi-part": ratesMultiPartQuestion
};

export function getVariationBQuestionTypes() { return TYPE_LIST; }
export function generateVariationBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
