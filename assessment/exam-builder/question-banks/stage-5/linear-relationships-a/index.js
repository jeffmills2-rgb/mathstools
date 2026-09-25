/*
  Mills Maths Tools — Stage 5 Question Bank: Linear Relationships A
  ------------------------------------------------------------------
  question-banks/stage-5/linear-relationships-a/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-LIN-C-01 (Core):
    "determines the midpoint, gradient and length of an interval, and graphs
     linear relationships, with and without digital tools"

  Content:
    - the midpoint of an interval, from a graph and by averaging coordinates
      (and finding an endpoint from a midpoint)
    - the gradient of an interval as rise over run, from a graph and from
      coordinates; positive, negative, zero and undefined gradients
    - the distance between two points using Pythagoras' theorem
    - graphing straight lines from a table of values or an equation
    - horizontal lines y = c and vertical lines x = c
    - parallel lines have the same gradient
    - gradient as a rate/slope in context

  Graphs are drawn by engines/plane/plane-engine.js from the same points and
  lines the answers use; tools/stage5-graphs.mjs re-reads them.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, gcd, fmt
} from "../../_shared/bank-helpers.js";
import { num, MINUS, rat, lin, surdParts, surdText, isqrt } from "../../_shared/algebra-helpers.js";

const TOPIC = "Linear Relationships A";

const TYPE_LIST = [
  { id: "midpoint-from-graph", label: "Midpoint of an interval (graph)" },
  { id: "midpoint-coordinates", label: "Midpoint by averaging coordinates" },
  { id: "find-endpoint", label: "Find an endpoint from the midpoint" },
  { id: "gradient-from-graph", label: "Gradient from a graph (rise over run)" },
  { id: "gradient-two-points", label: "Gradient between two points" },
  { id: "gradient-types", label: "Positive, negative, zero and undefined gradients" },
  { id: "distance-from-graph", label: "Length of an interval (graph, Pythagoras)" },
  { id: "distance-coordinates", label: "Distance between two points" },
  { id: "horizontal-vertical", label: "Horizontal and vertical lines" },
  { id: "table-of-values", label: "Table of values for a line" },
  { id: "graph-a-line", label: "Graph a straight line" },
  { id: "point-on-line", label: "Does the point lie on the line?" },
  { id: "parallel-lines", label: "Parallel lines have equal gradients" },
  { id: "gradient-in-context", label: "Gradient as a slope in context" },
  { id: "multi-part-interval", label: "Multi-part interval problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "linear", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const pt = (x, y) => `(${num(x)}, ${num(y)})`;
const half = v => (Number.isInteger(v) ? num(v) : `${v < 0 ? MINUS : ""}${Math.abs(v)}`);
const ptH = (x, y) => `(${half(x)}, ${half(y)})`;
const exactLen = d2 => { const p = surdParts(d2); return p.in === 1 ? String(p.out) : surdText(p.out, p.in); };

function randPoints({ range = 6, sameParity = false, distinct = true } = {}) {
  for (;;) {
    const x1 = randInt(-range, range); const y1 = randInt(-range, range);
    const x2 = randInt(-range, range); const y2 = randInt(-range, range);
    if (x1 === x2 || y1 === y2) continue;
    if (sameParity && ((x1 + x2) % 2 !== 0 || (y1 + y2) % 2 !== 0)) continue;
    return [x1, y1, x2, y2];
  }
}

function intervalPlane(x1, y1, x2, y2, extra = {}) {
  return plane({ xMin: -7, xMax: 7, yMin: -7, yMax: 7, segments: [{ from: [x1, y1], to: [x2, y2] }], points: [{ x: x1, y: y1, label: "A", labelPos: "nw" }, { x: x2, y: y2, label: "B", labelPos: "se" }], ...extra });
}

/* ── midpoint ────────────────────────────────────────────── */

function midpointFromGraphQuestion() {
  const [x1, y1, x2, y2] = randPoints({ sameParity: true });
  return q({
    type: "midpoint-from-graph", marks: 1,
    prompt: "Find the coordinates of the midpoint of the interval AB.",
    diagram: intervalPlane(x1, y1, x2, y2),
    answer: pt((x1 + x2) / 2, (y1 + y2) / 2),
    working: [`A${pt(x1, y1)}, B${pt(x2, y2)}`, `Midpoint = ((${num(x1)} + ${num(x2)})/2, (${num(y1)} + ${num(y2)})/2) = ${pt((x1 + x2) / 2, (y1 + y2) / 2)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [pt((x2 - x1) / 2 || 1, (y2 - y1) / 2 || 1), pt((y1 + y2) / 2, (x1 + x2) / 2), pt(x1 + x2, y1 + y2)],
    tags: ["midpoint", "graph"]
  });
}

function midpointCoordinatesQuestion() {
  const [x1, y1, x2, y2] = randPoints({ range: 12 });
  const M = ptH((x1 + x2) / 2, (y1 + y2) / 2);
  return q({
    type: "midpoint-coordinates", marks: 1,
    prompt: `Find the midpoint of the interval joining ${pt(x1, y1)} and ${pt(x2, y2)}.`,
    answer: M,
    working: [`x: (${num(x1)} + ${num(x2)}) ÷ 2 = ${half((x1 + x2) / 2)}`, `y: (${num(y1)} + ${num(y2)}) ÷ 2 = ${half((y1 + y2) / 2)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [ptH((x2 - x1) / 2, (y2 - y1) / 2), ptH((y1 + y2) / 2, (x1 + x2) / 2), pt(x1 + x2, y1 + y2)],
    tags: ["midpoint"]
  });
}

function findEndpointQuestion() {
  const [x1, y1, x2, y2] = randPoints({ range: 8 });
  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
  if (!Number.isInteger(mx) || !Number.isInteger(my)) return findEndpointQuestion();
  return q({
    type: "find-endpoint", marks: 2,
    prompt: `The midpoint of AB is M${pt(mx, my)}. If A is ${pt(x1, y1)}, find the coordinates of B.`,
    answer: pt(x2, y2),
    working: [`From A to M: x changes by ${num(mx - x1)}, y by ${num(my - y1)}.`, `Do the same again from M: B = ${pt(mx + (mx - x1), my + (my - y1))}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [pt((x1 + mx) / 2 === Math.round((x1 + mx) / 2) ? (x1 + mx) / 2 : mx + 1, (y1 + my) / 2 === Math.round((y1 + my) / 2) ? (y1 + my) / 2 : my + 1), pt(mx - x1, my - y1), pt(2 * x1 - mx, 2 * y1 - my)],
    tags: ["midpoint"]
  });
}

/* ── gradient ────────────────────────────────────────────── */

function gradientFromGraphQuestion() {
  for (;;) {
    const x1 = randInt(-6, 2); const y1 = randInt(-6, 3);
    const run = randInt(1, 5); const rise = randInt(-6, 6);
    if (rise === 0) continue;
    const x2 = x1 + run; const y2 = y1 + rise;
    if (x2 > 6 || y2 > 6 || y2 < -6) continue;
    const m = rat(rise, run);
    return q({
      type: "gradient-from-graph", marks: 2,
      prompt: "Find the gradient of the line through A and B.",
      diagram: plane({ xMin: -7, xMax: 7, yMin: -7, yMax: 7, curves: [{ kind: "line", m: rise / run, c: y1 - (rise / run) * x1 }], points: [{ x: x1, y: y1, label: "A", labelPos: "nw" }, { x: x2, y: y2, label: "B", labelPos: "se" }], segments: [{ from: [x1, y1], to: [x2, y1], dashed: true, colour: "#6b7280" }, { from: [x2, y1], to: [x2, y2], dashed: true, colour: "#6b7280" }] }),
      answer: m,
      working: [`Run (across) from A to B: ${run}; rise (up or down): ${num(rise)}`, `Gradient = rise/run = ${num(rise)}/${run} = ${m.replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [rat(run, rise), rat(-rise, run), rat(rise + 1, run)],
      tags: ["gradient", "graph"]
    });
  }
}

function gradientTwoPointsQuestion() {
  const [x1, y1, x2, y2] = randPoints({ range: 10 });
  const m = rat(y2 - y1, x2 - x1);
  return q({
    type: "gradient-two-points", marks: 2,
    prompt: `Find the gradient of the interval joining ${pt(x1, y1)} and ${pt(x2, y2)}.`,
    answer: m,
    working: ["m = (y₂ − y₁)/(x₂ − x₁)", `= (${num(y2)} − ${y1 < 0 ? `(${num(y1)})` : y1})/(${num(x2)} − ${x1 < 0 ? `(${num(x1)})` : x1}) = ${num(y2 - y1)}/${num(x2 - x1)}`, `= ${m.replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [rat(x2 - x1, y2 - y1), rat(y2 + y1, x2 + x1 || 1), rat(y1 - y2, x2 - x1)],
    tags: ["gradient"]
  });
}

function gradientTypesQuestion() {
  const kind = choice(["positive", "negative", "zero", "undefined"]);
  const curve = kind === "positive" ? { kind: "line", m: choice([0.5, 1, 2]), c: randInt(-2, 2) }
    : kind === "negative" ? { kind: "line", m: choice([-0.5, -1, -2]), c: randInt(-2, 2) }
      : kind === "zero" ? { kind: "line", m: 0, c: randInt(-4, 4) || 2 }
        : { kind: "line", x: randInt(-4, 4) || 3 };
  return q({
    type: "gradient-types", marks: 1,
    prompt: "Is the gradient of this line positive, negative, zero or undefined?",
    diagram: plane({ xMin: -5, xMax: 5, yMin: -5, yMax: 5, curves: [curve] }),
    answer: kind[0].toUpperCase() + kind.slice(1),
    working: [{ positive: "The line rises from left to right.", negative: "The line falls from left to right.", zero: "The line is horizontal: rise = 0.", undefined: "The line is vertical: run = 0, and division by zero is undefined." }[kind]],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["Positive", "Negative", "Zero", "Undefined"].filter(k => k.toLowerCase() !== kind),
    tags: ["gradient"]
  });
}

/* ── distance ────────────────────────────────────────────── */

function distanceFromGraphQuestion() {
  const [x1, y1, x2, y2] = randPoints({ range: 6 });
  const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  return q({
    type: "distance-from-graph", marks: 2,
    prompt: "Use Pythagoras' theorem to find the exact length of AB.",
    diagram: intervalPlane(x1, y1, x2, y2, { segments: [{ from: [x1, y1], to: [x2, y2] }, { from: [x1, y1], to: [x2, y1], dashed: true, colour: "#6b7280" }, { from: [x2, y1], to: [x2, y2], dashed: true, colour: "#6b7280" }] }),
    answer: exactLen(d2),
    working: [`Horizontal side ${Math.abs(x2 - x1)}, vertical side ${Math.abs(y2 - y1)}`, `AB² = ${Math.abs(x2 - x1)}² + ${Math.abs(y2 - y1)}² = ${d2}`, `AB = √${d2}${isqrt(d2) ? ` = ${isqrt(d2)}` : surdParts(d2).out > 1 ? ` = ${exactLen(d2)}` : ""}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [String(Math.abs(x2 - x1) + Math.abs(y2 - y1)), `√${Math.abs(x2 - x1) + Math.abs(y2 - y1)}`, String(d2)],
    tags: ["distance", "Pythagoras"]
  });
}

function distanceCoordinatesQuestion() {
  const [x1, y1, x2, y2] = randPoints({ range: 10 });
  const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  const exact = Math.random() < 0.5;
  return q({
    type: "distance-coordinates", marks: 2,
    prompt: `Find the distance between ${pt(x1, y1)} and ${pt(x2, y2)}${exact ? " in exact form" : ", correct to 1 decimal place"}.`,
    answer: exact ? exactLen(d2) : fmt(Math.sqrt(d2), 1),
    working: [`d² = (${num(x2)} − ${x1 < 0 ? `(${num(x1)})` : x1})² + (${num(y2)} − ${y1 < 0 ? `(${num(y1)})` : y1})² = ${(x2 - x1) ** 2} + ${(y2 - y1) ** 2} = ${d2}`, `d = √${d2}${exact ? (exactLen(d2) !== `√${d2}` ? ` = ${exactLen(d2)}` : "") : ` ≈ ${Math.sqrt(d2).toFixed(1)}`}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: exact ? [String(Math.abs(x2 - x1) + Math.abs(y2 - y1)), String(d2), `√${Math.abs(x2 - x1) + Math.abs(y2 - y1)}`] : [fmt(Math.abs(x2 - x1) + Math.abs(y2 - y1), 1), fmt(d2 / 2, 1), fmt(Math.sqrt(d2) + 1, 1)],
    tags: ["distance"]
  });
}

/* ── graphing lines ──────────────────────────────────────── */

function horizontalVerticalQuestion() {
  const v = choice(["read", "write", "through"]);
  const k = randInt(-5, 5) || 2;
  const vertical = Math.random() < 0.5;
  if (v === "read") {
    return q({ type: "horizontal-vertical", marks: 1, prompt: "Write the equation of the line shown.", diagram: plane({ xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves: [vertical ? { kind: "line", x: k } : { kind: "line", m: 0, c: k }] }), answer: vertical ? `x = ${num(k)}` : `y = ${num(k)}`, working: [vertical ? `Every point on the line has x-coordinate ${num(k)}.` : `Every point on the line has y-coordinate ${num(k)}.`], space: SPACE_SIZES.SMALL, mcDistractors: [vertical ? `y = ${num(k)}` : `x = ${num(k)}`, vertical ? `x = ${num(-k)}` : `y = ${num(-k)}`, vertical ? `y = ${num(k)}x` : `y = ${num(k)}x`], tags: ["horizontal", "vertical"] });
  }
  if (v === "through") {
    const X = randInt(-6, 6); const Y = randInt(-6, 6);
    return q({ type: "horizontal-vertical", marks: 1, prompt: `Write the equation of the ${vertical ? "vertical" : "horizontal"} line through ${pt(X, Y)}.`, answer: vertical ? `x = ${num(X)}` : `y = ${num(Y)}`, working: [vertical ? "A vertical line keeps the same x-coordinate." : "A horizontal line keeps the same y-coordinate."], space: SPACE_SIZES.SMALL, mcDistractors: [vertical ? `y = ${num(Y)}` : `x = ${num(X)}`, vertical ? `x = ${num(Y)}` : `y = ${num(X)}`], tags: ["horizontal", "vertical"] });
  }
  return q({ type: "horizontal-vertical", marks: 1, prompt: `What is the gradient of the line ${vertical ? `x = ${num(k)}` : `y = ${num(k)}`}?`, answer: vertical ? "Undefined" : "0", working: [vertical ? "Vertical: the run is 0." : "Horizontal: the rise is 0."], space: SPACE_SIZES.SMALL, mcDistractors: [vertical ? "0" : "Undefined", num(k), "1"], tags: ["horizontal", "vertical", "gradient"] });
}

function tableOfValuesQuestion() {
  const m = choice([-3, -2, -1, 2, 3, 4]); const c = randInt(-5, 5);
  const xs = [-2, -1, 0, 1, 2];
  const ys = xs.map(x => m * x + c);
  const blanks = sample([0, 1, 2, 3, 4], 3);
  return q({
    type: "table-of-values", marks: 2,
    prompt: `Complete the table of values for y = ${lin(m, c)}.`,
    table: { headerRow: true, rows: [["x", ...xs.map(num)], ["y", ...ys.map((y, i) => (blanks.includes(i) ? "" : num(y)))]] },
    answer: blanks.sort((a, b) => a - b).map(i => `x = ${num(xs[i])}: y = ${num(ys[i])}`).join("; "),
    working: blanks.map(i => `y = ${num(m)} × (${num(xs[i])}) + ${num(c)} = ${num(ys[i])}`),
    space: "none",
    mcEligible: false,
    tags: ["table of values"]
  });
}

function graphALineQuestion() {
  const m = choice([-2, -1, 1, 2, 3, 0.5]); const c = randInt(-3, 3);
  const eq = m === 0.5 ? `y = ½x ${c < 0 ? MINUS : "+"} ${Math.abs(c)}`.replace(/ [+−] 0$/, "") : `y = ${lin(m, c)}`;
  return q({
    type: "graph-a-line", marks: 2,
    prompt: `Draw the graph of ${eq} on the number plane.`,
    diagram: plane({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 }),
    answer: `A straight line through (0, ${num(c)}) with gradient ${m === 0.5 ? "½" : num(m)} — e.g. through ${pt(0, c)} and ${pt(2, c + 2 * m)}`,
    working: [`y-intercept ${num(c)}: plot (0, ${num(c)})`, `Gradient ${m === 0.5 ? "½" : num(m)}: across 2, ${m * 2 >= 0 ? "up" : "down"} ${Math.abs(2 * m)} gives ${pt(2, c + 2 * m)}`, "Rule a line through the points."],
    space: "none",
    mcEligible: false,
    tags: ["graphing"]
  });
}

function pointOnLineQuestion() {
  const m = randInt(-4, 4) || 2; const c = randInt(-6, 6);
  const x = randInt(-5, 5); const on = Math.random() < 0.5;
  const y = m * x + c + (on ? 0 : choice([-2, -1, 1, 2]));
  return q({
    type: "point-on-line", marks: 1,
    prompt: `Does the point ${pt(x, y)} lie on the line y = ${lin(m, c)}? Show your working.`,
    answer: on ? "Yes" : "No",
    working: [`Substitute x = ${num(x)}: y = ${num(m)} × (${num(x)}) + ${num(c)} = ${num(m * x + c)}`, on ? `This equals ${num(y)}, so yes.` : `This is not ${num(y)}, so no.`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["substitution"]
  });
}

function parallelLinesQuestion() {
  const m = choice([-3, -2, -1, 2, 3, 4]);
  const lines = shuffle([
    { e: `y = ${lin(m, randInt(1, 6))}`, m },
    { e: `y = ${lin(m, -randInt(1, 6))}`, m },
    { e: `y = ${lin(-m, randInt(-4, 4))}`, m: -m },
    { e: `y = ${lin(m + 1, randInt(-4, 4))}`, m: m + 1 }
  ]);
  const par = lines.filter(l => l.m === m).map(l => l.e);
  return q({
    type: "parallel-lines", marks: 2,
    prompt: `Which two of these lines are parallel? ${lines.map(l => l.e).join(";  ")}`,
    answer: par.join(" and "),
    working: lines.map(l => `${l.e}: gradient ${num(l.m)}`).concat(["Parallel lines have equal gradients."]),
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["parallel", "gradient"]
  });
}

function gradientInContextQuestion() {
  const v = choice(["ramp", "roof", "road"]);
  if (v === "ramp") {
    const run = choice([4, 5, 6, 8, 10, 12]); const rise = choice([0.5, 1, 1.5]);
    return q({ type: "gradient-in-context", marks: 1, prompt: `A wheelchair ramp rises ${rise} m over a horizontal distance of ${run} m. What is its gradient, as a fraction?`, answer: rat(rise * 2, run * 2), working: [`Gradient = rise/run = ${rise}/${run} = ${rat(rise * 2, run * 2).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}`], space: SPACE_SIZES.SMALL, mcDistractors: [rat(run * 2, rise * 2), rat(rise * 2, run), rat(rise * 2 + 2, run * 2)], tags: ["gradient", "context"] });
  }
  if (v === "roof") {
    const rise = randInt(1, 4); const run = randInt(3, 8);
    return q({ type: "gradient-in-context", marks: 1, prompt: `A roof rises ${rise} m over a horizontal run of ${run} m. Find its gradient.`, answer: rat(rise, run), working: [`${rise}/${run}`], space: SPACE_SIZES.SMALL, mcDistractors: [rat(run, rise), rat(rise, run + rise)], tags: ["gradient", "context"] });
  }
  const pct = choice([5, 8, 10, 12, 15]);
  return q({ type: "gradient-in-context", marks: 2, prompt: `A road sign says the road has a ${pct}% slope, meaning the gradient is ${pct}/100. How many metres does the road rise over a horizontal distance of 400 m?`, answer: `${pct * 4} m`, working: [`Rise = gradient × run = ${pct}/100 × 400 = ${pct * 4} m`], space: SPACE_SIZES.SMALL, mcDistractors: [`${pct} m`, `${pct * 40} m`, `${400 / pct} m`], tags: ["gradient", "context"] });
}

function multiPartIntervalQuestion() {
  const [x1, y1, x2, y2] = randPoints({ sameParity: true });
  const d2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  return q({
    type: "multi-part-interval", marks: 4,
    prompt: "The interval AB is shown.",
    diagram: intervalPlane(x1, y1, x2, y2),
    subparts: [
      { label: "(a)", prompt: "Find the midpoint of AB.", marks: 1, answer: pt((x1 + x2) / 2, (y1 + y2) / 2), working: ["Average the coordinates."] },
      { label: "(b)", prompt: "Find the gradient of AB.", marks: 1, answer: rat(y2 - y1, x2 - x1), working: [`${num(y2 - y1)}/${num(x2 - x1)}`] },
      { label: "(c)", prompt: "Find the exact length of AB.", marks: 2, answer: exactLen(d2), working: [`√(${(x2 - x1) ** 2} + ${(y2 - y1) ** 2}) = √${d2}`] }
    ],
    answer: `(a) ${pt((x1 + x2) / 2, (y1 + y2) / 2)}; (b) ${rat(y2 - y1, x2 - x1)}; (c) ${exactLen(d2)}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "midpoint-from-graph": midpointFromGraphQuestion,
  "midpoint-coordinates": midpointCoordinatesQuestion,
  "find-endpoint": findEndpointQuestion,
  "gradient-from-graph": gradientFromGraphQuestion,
  "gradient-two-points": gradientTwoPointsQuestion,
  "gradient-types": gradientTypesQuestion,
  "distance-from-graph": distanceFromGraphQuestion,
  "distance-coordinates": distanceCoordinatesQuestion,
  "horizontal-vertical": horizontalVerticalQuestion,
  "table-of-values": tableOfValuesQuestion,
  "graph-a-line": graphALineQuestion,
  "point-on-line": pointOnLineQuestion,
  "parallel-lines": parallelLinesQuestion,
  "gradient-in-context": gradientInContextQuestion,
  "multi-part-interval": multiPartIntervalQuestion
};

export function getLinearRelationshipsAQuestionTypes() { return TYPE_LIST; }
export function generateLinearRelationshipsAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
