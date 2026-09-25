/*
  Mills Maths Tools — Stage 5 Question Bank: Numbers of Any Magnitude
  --------------------------------------------------------------------
  question-banks/stage-5/numbers-of-any-magnitude/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-MAG-C-01 (Core):
    "solves measurement problems by using scientific notation to represent
     numbers and rounding to a given number of significant figures"

  Content:
    - very large and very small measurements: SI prefixes (nano, micro,
      milli, kilo, mega, giga, tera) and converting between them
    - absolute error (half the smallest unit of the measuring device), upper
      and lower bounds, and percentage error
    - rounding to decimal places and to significant figures, and counting
      significant figures (including zeros)
    - scientific notation: writing, converting to decimals, reading a
      calculator display, comparing and ordering, and calculating

  Every number is built from an integer mantissa and an exponent, so the
  answers are exact strings, not floating-point approximations.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, spaced
} from "../../_shared/bank-helpers.js";
import { sup, num, MINUS } from "../../_shared/algebra-helpers.js";

const TOPIC = "Numbers of Any Magnitude";

const TYPE_LIST = [
  { id: "si-prefixes", label: "SI prefixes (nano to tera)" },
  { id: "convert-prefixes", label: "Convert very large and very small units" },
  { id: "write-scientific", label: "Write in scientific notation" },
  { id: "scientific-to-decimal", label: "Scientific notation to a decimal" },
  { id: "calculator-display", label: "Read a calculator display" },
  { id: "order-scientific", label: "Compare and order numbers in scientific notation" },
  { id: "calculate-scientific", label: "Calculate with scientific notation" },
  { id: "count-sig-figs", label: "Count significant figures" },
  { id: "round-sig-figs", label: "Round to significant figures" },
  { id: "absolute-error", label: "Absolute error and limits of accuracy" },
  { id: "percentage-error", label: "Percentage error" },
  { id: "bounds-calculations", label: "Upper and lower bounds in calculations" },
  { id: "magnitude-contexts", label: "Very large and very small quantities in context" },
  { id: "multi-part-magnitude", label: "Multi-part scientific notation problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "magnitude", ...(spec.tags || [])] });

/* A decimal string from an integer mantissa m (no trailing zeros) × 10^e,
   spaced in groups of three both sides of the point. */
export function decString(m, e) {
  const neg = m < 0;
  let digits = String(Math.abs(m));
  let point = digits.length + e;               // position of the decimal point
  let s;
  if (point <= 0) s = `0.${"0".repeat(-point)}${digits}`;
  else if (point >= digits.length) s = digits + "0".repeat(point - digits.length);
  else s = `${digits.slice(0, point)}.${digits.slice(point)}`;
  const [w, f] = s.split(".");
  const W = w.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const F = f ? f.replace(/(\d{3})(?=\d)/g, "$1 ") : null;
  return `${neg ? MINUS : ""}${W}${F ? `.${F}` : ""}`;
}

/* Scientific notation "a × 10ⁿ" from mantissa digits and exponent. */
export function sci(m, e) {
  const d = String(Math.abs(m));
  const lead = d[0];
  const rest = d.slice(1).replace(/0+$/, "");
  const n = e + d.length - 1;
  return `${m < 0 ? MINUS : ""}${lead}${rest ? `.${rest}` : ""} × 10${sup(n)}`;
}

function randMantissa(digits) {
  let m;
  do { m = randInt(10 ** (digits - 1), 10 ** digits - 1); } while (m % 10 === 0 && digits > 1);
  return m;
}

/* ── prefixes ────────────────────────────────────────────── */

const PREFIXES = [
  { p: "tera", s: "T", e: 12 }, { p: "giga", s: "G", e: 9 }, { p: "mega", s: "M", e: 6 }, { p: "kilo", s: "k", e: 3 },
  { p: "milli", s: "m", e: -3 }, { p: "micro", s: "μ", e: -6 }, { p: "nano", s: "n", e: -9 }
];

function siPrefixesQuestion() {
  const P = choice(PREFIXES);
  const v = choice(["power", "meaning"]);
  if (v === "power") {
    return q({ type: "si-prefixes", marks: 1, prompt: `The prefix ${P.p} (${P.s}) means multiply by what power of 10?`, answer: `10${sup(P.e)}`, working: [`${P.p} = 10${sup(P.e)}${P.e > 0 ? ` = ${spaced(10 ** P.e)}` : ""}`], space: SPACE_SIZES.SMALL, mcDistractors: PREFIXES.filter(o => o !== P).slice(0, 4).map(o => `10${sup(o.e)}`), tags: ["prefixes"] });
  }
  const unit = choice([["metre", "m"], ["gram", "g"], ["byte", "B"], ["second", "s"]]);
  return q({ type: "si-prefixes", marks: 1, prompt: `How many ${unit[0]}s are in one ${P.p}${unit[0]} (1 ${P.s}${unit[1]})?`, answer: P.e > 0 ? `10${sup(P.e)} (${spaced(10 ** P.e)})` : `10${sup(P.e)}`, working: [`1 ${P.s}${unit[1]} = 10${sup(P.e)} ${unit[1]}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["prefixes"] });
}

function convertPrefixesQuestion() {
  const pairs = [
    { from: "nm", to: "m", e: -9, ctx: "The wavelength of a light ray is" },
    { from: "μm", to: "m", e: -6, ctx: "A dust mite is" },
    { from: "mm", to: "m", e: -3, ctx: "A grain of sand is" },
    { from: "GB", to: "bytes", e: 9, ctx: "A file is" },
    { from: "TB", to: "bytes", e: 12, ctx: "A hard drive holds" },
    { from: "MW", to: "watts", e: 6, ctx: "A wind turbine produces" },
    { from: "km", to: "m", e: 3, ctx: "A road is" }
  ];
  const P = choice(pairs);
  let m = randInt(12, 950);
  if (m % 10 === 0) m += 1;
  return q({
    type: "convert-prefixes", marks: 1,
    prompt: `${P.ctx} ${m} ${P.from}. Write this in ${P.to}, using scientific notation.`,
    answer: `${sci(m, P.e)} ${P.to}`,
    working: [`1 ${P.from} = 10${sup(P.e)} ${P.to}`, `${m} × 10${sup(P.e)} = ${sci(m, P.e)} ${P.to}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${sci(m, -P.e)} ${P.to}`, `${sci(m, P.e + 1)} ${P.to}`, `${sci(m, P.e - 1)} ${P.to}`],
    tags: ["prefixes", "conversion"]
  });
}

/* ── scientific notation ─────────────────────────────────── */

function writeScientificQuestion() {
  const big = Math.random() < 0.5;
  const m = randMantissa(randInt(2, 4));
  const e = big ? randInt(1, 6) : -randInt(4, 9);
  return q({
    type: "write-scientific", marks: 1,
    prompt: `Write ${decString(m, e)} in scientific notation.`,
    answer: sci(m, e),
    working: ["Move the decimal point so there is one non-zero digit in front of it.", `${decString(m, e)} = ${sci(m, e)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [sci(m, e + 1), sci(m, e - 1), sci(m, -e - 2 * (String(m).length - 1))],
    tags: ["scientific notation"]
  });
}

function scientificToDecimalQuestion() {
  const m = randMantissa(randInt(2, 3));
  const e = choice([randInt(2, 7), -randInt(3, 8)]);
  return q({
    type: "scientific-to-decimal", marks: 1,
    prompt: `Write ${sci(m, e)} as a basic numeral.`,
    answer: decString(m, e),
    working: [`Move the decimal point ${Math.abs(e + String(m).length - 1)} places ${e + String(m).length - 1 > 0 ? "right" : "left"}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [decString(m, e + 1), decString(m, e - 1), decString(m, -e)],
    tags: ["scientific notation"]
  });
}

function calculatorDisplayQuestion() {
  const m = randMantissa(randInt(2, 3));
  const n = choice([randInt(5, 12), -randInt(5, 12)]);
  const d = String(m);
  const shown = `${d[0]}.${d.slice(1)}E${n < 0 ? "−" : ""}${Math.abs(n)}`;
  const e = n - (d.length - 1);
  return q({
    type: "calculator-display", marks: 1,
    prompt: `A calculator display shows ${shown}. Write this number in scientific notation.`,
    answer: sci(m, e),
    working: [`E${n} means × 10${sup(n)}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${d[0]}.${d.slice(1)}${sup(n)}`, sci(m, -e - 2 * (d.length - 1)), `${d[0]}.${d.slice(1)} × ${n}`],
    tags: ["scientific notation", "calculator"]
  });
}

function orderScientificQuestion() {
  const items = [];
  const seen = new Set();
  while (items.length < 4) {
    const m = randMantissa(2); const n = randInt(-5, 6);
    const e = n - 1;
    const key = m * 10 ** e;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ t: sci(m, e), v: key });
  }
  // include one as a decimal
  const asc = Math.random() < 0.5;
  const sorted = [...items].sort((a, b) => (asc ? a.v - b.v : b.v - a.v));
  if (sorted.every((s, i) => s === items[i])) return orderScientificQuestion();
  return q({
    type: "order-scientific", marks: 2,
    prompt: `Write in ${asc ? "ascending" : "descending"} order: ${items.map(i => i.t).join(", ")}`,
    answer: sorted.map(i => i.t).join(", "),
    working: ["Compare the powers of 10 first; if they are equal, compare the numbers in front."],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["scientific notation", "order"]
  });
}

function calculateScientificQuestion() {
  const v = choice(["multiply", "divide", "square"]);
  if (v === "multiply") {
    const a = randInt(1, 4); const b = randInt(1, 2); const e1 = randInt(-6, 8); const e2 = randInt(-6, 8);
    const p = a * b;
    return q({ type: "calculate-scientific", marks: 1, prompt: `Calculate (${a} × 10${sup(e1)}) × (${b} × 10${sup(e2)}), giving your answer in scientific notation.`, answer: `${p} × 10${sup(e1 + e2)}`, working: [`${a} × ${b} = ${p}`, `10${sup(e1)} × 10${sup(e2)} = 10${sup(e1 + e2)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${p} × 10${sup(e1 * e2)}`, `${a + b} × 10${sup(e1 + e2)}`, `${p} × 10${sup(e1 - e2)}`], tags: ["scientific notation", "calculate"] });
  }
  if (v === "divide") {
    const b = randInt(2, 4); const k = randInt(1, 2); const a = b * k; const e1 = randInt(-4, 9); const e2 = randInt(-6, 6);
    return q({ type: "calculate-scientific", marks: 1, prompt: `Calculate (${a} × 10${sup(e1)}) ÷ (${b} × 10${sup(e2)}), in scientific notation.`, answer: `${k} × 10${sup(e1 - e2)}`, working: [`${a} ÷ ${b} = ${k}`, `10${sup(e1)} ÷ 10${sup(e2)} = 10${sup(e1 - e2)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${k} × 10${sup(e1 + e2)}`, `${a * b} × 10${sup(e1 - e2)}`, `${k} × 10${sup(e2 - e1)}`], tags: ["scientific notation", "calculate"] });
  }
  const a = randInt(2, 3); const e = randInt(-5, 6);
  return q({ type: "calculate-scientific", marks: 1, prompt: `Calculate (${a} × 10${sup(e)})², in scientific notation.`, answer: `${a * a} × 10${sup(2 * e)}`, working: [`${a}² = ${a * a}; (10${sup(e)})² = 10${sup(2 * e)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${2 * a} × 10${sup(2 * e)}`, `${a * a} × 10${sup(e + 2)}`], tags: ["scientific notation", "calculate"] });
}

/* ── significant figures ─────────────────────────────────── */

function countSigFigsQuestion() {
  const cases = [
    () => { const m = randMantissa(randInt(2, 4)); return { t: decString(m, 0), n: String(m).length, why: "All non-zero digits are significant." }; },
    () => { const m = randMantissa(randInt(2, 3)); const z = randInt(1, 3); return { t: decString(m, -String(m).length - z), n: String(m).length, why: "Leading zeros are NOT significant." }; },
    () => { const a = randInt(1, 9); const b = randInt(1, 9); return { t: `${a}0${b}`, n: 3, why: "Zeros between non-zero digits ARE significant." }; },
    () => { const a = randInt(1, 9); const b = randInt(1, 9); return { t: `${a}.${b}0`, n: 3, why: "A trailing zero after the decimal point IS significant." }; },
    () => { const a = randInt(1, 9); const b = randInt(1, 9); return { t: `0.0${a}0${b}`, n: 3, why: "Leading zeros are not significant; the zero between is." }; }
  ];
  const c = choice(cases)();
  return q({ type: "count-sig-figs", marks: 1, prompt: `How many significant figures are in ${c.t}?`, answer: String(c.n), working: [c.why], space: SPACE_SIZES.SMALL, mcDistractors: [String(c.n + 1), String(c.n - 1 || c.n + 2), String(c.t.replace(/[^\d]/g, "").length)], tags: ["significant figures"] });
}

function roundSigFigsQuestion() {
  const v = choice(["big", "small", "decimal"]);
  let value;
  if (v === "big") { value = randInt(12345, 9876543); } else if (v === "small") { value = randInt(1001, 99999) / 10 ** randInt(6, 8); } else { value = randInt(1001, 99999) / 1000; }
  const n = randInt(1, 3);
  const r = Number(value.toPrecision(n));
  const groupDec = str => { const [w, f] = String(str).split("."); return `${w.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}${f ? `.${f.replace(/(\d{3})(?=\d)/g, "$1 ")}` : ""}`; };
  const show = x => groupDec(x);
  const rDisplay = v === "big" ? spaced(r) : Number(r.toPrecision(n)).toString().includes("e") ? r.toFixed(10).replace(/0+$/, "") : r.toPrecision(n).includes("e") ? String(r) : r.toPrecision(n);
  return q({
    type: "round-sig-figs", marks: 1,
    prompt: `Round ${show(value)} to ${n} significant figure${n > 1 ? "s" : ""}.`,
    answer: groupDec(rDisplay),
    working: [`Count ${n} significant figure${n > 1 ? "s" : ""} from the first non-zero digit, then look at the next digit to round.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: v === "big" ? [spaced(Number(value.toPrecision(n + 1))), String(Number(String(value).slice(0, n))), spaced(Number(value.toPrecision(Math.max(1, n - 1))))] : [groupDec(String(Number(value.toFixed(n)))), groupDec(value.toPrecision(n + 1))],
    tags: ["significant figures", "rounding"]
  });
}

/* ── error ───────────────────────────────────────────────── */

const MEAS = [
  { what: "the length of a pencil", unit: "cm", step: 0.1, lo: 80, hi: 200, dev: "a ruler marked in millimetres" },
  { what: "a person's mass", unit: "kg", step: 0.5, lo: 90, hi: 180, dev: "bathroom scales marked every 0.5 kg" },
  { what: "the time for a sprint", unit: "s", step: 0.01, lo: 1050, hi: 1600, dev: "a stopwatch reading to hundredths of a second" },
  { what: "a room's width", unit: "m", step: 0.01, lo: 250, hi: 700, dev: "a tape measure marked in centimetres" },
  { what: "the temperature", unit: "°C", step: 1, lo: 12, hi: 38, dev: "a thermometer marked in whole degrees" }
];
const dpOf = s => (String(s).split(".")[1] || "").length;

function absoluteErrorQuestion() {
  const M = choice(MEAS);
  const k = randInt(M.lo, M.hi);
  const value = Number((k * M.step).toFixed(dpOf(M.step)));
  const err = M.step / 2;
  const d = dpOf(err);
  const lo = (value - err).toFixed(d); const hi = (value + err).toFixed(d);
  return q({
    type: "absolute-error", marks: 2,
    prompt: `${M.what[0].toUpperCase() + M.what.slice(1)} is measured with ${M.dev} as ${value.toFixed(dpOf(M.step))} ${M.unit}. State the absolute error and the limits of accuracy.`,
    answer: `Absolute error ±${err} ${M.unit}; between ${lo} ${M.unit} and ${hi} ${M.unit}`,
    working: [`Absolute error = ½ × smallest unit = ½ × ${M.step} = ${err} ${M.unit}`, `Lower limit ${value} − ${err} = ${lo}; upper limit ${value} + ${err} = ${hi}`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["error", "limits of accuracy"]
  });
}

function percentageErrorQuestion() {
  const M = choice(MEAS);
  const k = randInt(M.lo, M.hi);
  const value = Number((k * M.step).toFixed(dpOf(M.step)));
  const err = M.step / 2;
  const pct = (err / value) * 100;
  return q({
    type: "percentage-error", marks: 2,
    prompt: `${M.what[0].toUpperCase() + M.what.slice(1)} is measured with ${M.dev} as ${value.toFixed(dpOf(M.step))} ${M.unit}. Calculate the percentage error, correct to 2 significant figures.`,
    answer: `${Number(pct.toPrecision(2))}%`,
    working: [`Absolute error = ${err} ${M.unit}`, `Percentage error = ${err}/${value.toFixed(dpOf(M.step))} × 100% ≈ ${Number(pct.toPrecision(2))}%`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${Number((pct * 2).toPrecision(2))}%`, `${Number((err * 100).toPrecision(2))}%`, `${Number((pct / 10).toPrecision(2))}%`],
    tags: ["error", "percentage error"]
  });
}

function boundsCalculationsQuestion() {
  const v = choice(["perimeter", "area"]);
  const a = randInt(4, 15); const b = randInt(3, 12);
  if (v === "perimeter") {
    return q({ type: "bounds-calculations", marks: 2, prompt: `A rectangle is measured as ${a} cm by ${b} cm, each to the nearest centimetre. Find the least and greatest possible perimeter.`, answer: `Least ${2 * (a + b) - 2} cm, greatest ${2 * (a + b) + 2} cm`, working: [`Lower bounds ${a - 0.5} and ${b - 0.5}: P = 2(${a - 0.5} + ${b - 0.5}) = ${2 * (a + b) - 2}`, `Upper bounds ${a + 0.5} and ${b + 0.5}: P = ${2 * (a + b) + 2}`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["error", "bounds"] });
  }
  return q({ type: "bounds-calculations", marks: 2, prompt: `A rectangle is measured as ${a} m by ${b} m, each to the nearest metre. Find the least and greatest possible area.`, answer: `Least ${((a - 0.5) * (b - 0.5)).toFixed(2)} m², greatest ${((a + 0.5) * (b + 0.5)).toFixed(2)} m²`, working: [`${a - 0.5} × ${b - 0.5} = ${((a - 0.5) * (b - 0.5)).toFixed(2)}`, `${a + 0.5} × ${b + 0.5} = ${((a + 0.5) * (b + 0.5)).toFixed(2)}`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["error", "bounds"] });
}

const FACTS = [
  { t: "The speed of light is about 300 000 000 m/s.", m: 3, e: 8, u: "m/s" },
  { t: "The diameter of a red blood cell is about 0.000 008 m.", m: 8, e: -6, u: "m" },
  { t: "The distance from Earth to the Sun is about 150 000 000 km.", m: 15, e: 7, u: "km" },
  { t: "The mass of a grain of salt is about 0.000 058 g.", m: 58, e: -6, u: "g" },
  { t: "Australia's population is about 27 000 000.", m: 27, e: 6, u: "" },
  { t: "A virus is about 0.000 000 12 m across.", m: 12, e: -8, u: "m" }
];

function magnitudeContextsQuestion() {
  const F = choice(FACTS);
  return q({
    type: "magnitude-contexts", marks: 1,
    prompt: `${F.t} Write this quantity in scientific notation.`,
    answer: `${sci(F.m, F.e)}${F.u ? ` ${F.u}` : ""}`,
    working: [`${decString(F.m, F.e)} = ${sci(F.m, F.e)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${sci(F.m, F.e + 1)}${F.u ? ` ${F.u}` : ""}`, `${sci(F.m, F.e - 1)}${F.u ? ` ${F.u}` : ""}`, `${sci(F.m, -F.e)}${F.u ? ` ${F.u}` : ""}`],
    tags: ["scientific notation", "context"]
  });
}

function multiPartMagnitudeQuestion() {
  const m = randMantissa(3); const e = -randInt(5, 8);
  const a = randInt(2, 4); const b = randInt(1, 2);
  const r2 = Number(String(m).slice(0, 2)) + (Number(String(m)[2]) >= 5 ? 1 : 0);
  return q({
    type: "multi-part-magnitude", marks: 4,
    prompt: "Answer each part.",
    subparts: [
      { label: "(a)", prompt: `Write ${decString(m, e)} in scientific notation.`, marks: 1, answer: sci(m, e), working: ["One non-zero digit before the point."] },
      { label: "(b)", prompt: `Round ${decString(m, e)} to 2 significant figures.`, marks: 1, answer: decString(r2, e + 1), working: ["Keep 2 significant figures, counting from the first non-zero digit."] },
      { label: "(c)", prompt: `Calculate (${a} × 10³) × (${b} × 10⁻⁵) in scientific notation.`, marks: 1, answer: `${a * b} × 10⁻²`, working: [`${a} × ${b} = ${a * b}; 3 + (−5) = −2`] },
      { label: "(d)", prompt: "How many metres is 45 nanometres? Use scientific notation.", marks: 1, answer: "4.5 × 10⁻⁸ m", working: ["45 × 10⁻⁹ = 4.5 × 10⁻⁸"] }
    ],
    answer: `(a) ${sci(m, e)}; (b) ${decString(r2, e + 1)}; (c) ${a * b} × 10⁻²; (d) 4.5 × 10⁻⁸ m`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "si-prefixes": siPrefixesQuestion,
  "convert-prefixes": convertPrefixesQuestion,
  "write-scientific": writeScientificQuestion,
  "scientific-to-decimal": scientificToDecimalQuestion,
  "calculator-display": calculatorDisplayQuestion,
  "order-scientific": orderScientificQuestion,
  "calculate-scientific": calculateScientificQuestion,
  "count-sig-figs": countSigFigsQuestion,
  "round-sig-figs": roundSigFigsQuestion,
  "absolute-error": absoluteErrorQuestion,
  "percentage-error": percentageErrorQuestion,
  "bounds-calculations": boundsCalculationsQuestion,
  "magnitude-contexts": magnitudeContextsQuestion,
  "multi-part-magnitude": multiPartMagnitudeQuestion
};

export function getNumbersOfAnyMagnitudeQuestionTypes() { return TYPE_LIST; }
export function generateNumbersOfAnyMagnitudeQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
