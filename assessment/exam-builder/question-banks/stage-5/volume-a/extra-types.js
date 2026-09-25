/*
  Mills Maths Tools — Volume A: gap-fill types
  ---------------------------------------------
  question-banks/stage-5/volume-a/extra-types.js

  MA5-VOL-C-01 also expects students to convert between units of volume
  and capacity (mm³, cm³, m³, mL, L, kL), and to work backwards from a
  volume to a missing dimension of a prism or cylinder. Appended to the
  bank's registry by index.js.
*/

import { SPACE_SIZES, randInt, choice, makeQuestion, fmt, spaced } from "../../_shared/bank-helpers.js";

const TOPIC = "Volume A";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "volume", ...(spec.tags || [])] });
const PI = Math.PI;
const n = v => spaced(String(+v.toPrecision(12)));

export const EXTRA_VOL_A_TYPES = [
  { id: "volume-unit-conversions", label: "Convert units of volume and capacity" },
  { id: "prism-find-dimension", label: "Find a missing dimension from the volume" },
  { id: "cylinder-find-dimension", label: "Cylinders: find the radius or height" }
];

const CONV = [
  () => { const v = choice([2, 3.5, 0.8, 12]); return { p: `Convert ${n(v)} m³ to cm³.`, a: `${n(v * 1e6)} cm³`, w: ["1 m³ = 100 × 100 × 100 cm³ = 1 000 000 cm³"], d: [`${n(v * 100)} cm³`, `${n(v * 1000)} cm³`] }; },
  () => { const v = choice([4500, 250, 12000, 800]); return { p: `Convert ${n(v)} cm³ to litres.`, a: `${n(v / 1000)} L`, w: ["1 cm³ = 1 mL; 1000 mL = 1 L"], d: [`${n(v / 100)} L`, `${n(v)} L`] }; },
  () => { const v = choice([3, 7.5, 0.4]); return { p: `How many litres of water fill a tank of volume ${n(v)} m³?`, a: `${n(v * 1000)} L`, w: ["1 m³ = 1000 L (= 1 kL)"], d: [`${n(v * 100)} L`, `${n(v * 1e6)} L`] }; },
  () => { const v = choice([5000, 2500, 800]); return { p: `Convert ${n(v)} mm³ to cm³.`, a: `${n(v / 1000)} cm³`, w: ["1 cm³ = 10 × 10 × 10 mm³ = 1000 mm³"], d: [`${n(v / 10)} cm³`, `${n(v / 100)} cm³`] }; },
  () => { const v = choice([1.5, 2.25, 0.6]); return { p: `A jug holds ${n(v)} L. What is its capacity in cm³?`, a: `${n(v * 1000)} cm³`, w: ["1 L = 1000 mL = 1000 cm³"], d: [`${n(v * 100)} cm³`, `${n(v * 1e6)} cm³`] }; }
];

function volumeUnitConversionsQuestion() {
  const c = choice(CONV)();
  return q({ type: "volume-unit-conversions", marks: 1, prompt: c.p, answer: c.a, working: c.w, space: SPACE_SIZES.SMALL, mcDistractors: c.d, tags: ["units"] });
}

function prismFindDimensionQuestion() {
  const v = choice(["rect", "tri"]);
  if (v === "rect") {
    const l = randInt(4, 15); const w = randInt(3, 10); const h = randInt(2, 12); const V = l * w * h;
    return q({ type: "prism-find-dimension", marks: 2, prompt: `A rectangular prism has volume ${V} cm³, length ${l} cm and width ${w} cm. Find its height.`, answer: `${h} cm`, working: [`V = lwh`, `${V} = ${l} × ${w} × h = ${l * w}h`, `h = ${V} ÷ ${l * w} = ${h}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${fmt(V / (l + w), 2)} cm`, `${V - l * w} cm`], tags: ["reverse"] });
  }
  const b = randInt(4, 12); const th = randInt(3, 10); const L = randInt(5, 20); const A = (b * th) / 2; const V = A * L;
  return q({ type: "prism-find-dimension", marks: 2, prompt: `A triangular prism has a triangular cross-section with base ${b} cm and height ${th} cm. Its volume is ${fmt(V, 1)} cm³. Find the length of the prism.`, answer: `${L} cm`, working: [`A = ½ × ${b} × ${th} = ${fmt(A, 1)}`, `L = ${fmt(V, 1)} ÷ ${fmt(A, 1)} = ${L}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${fmt(V / (b * th), 2)} cm`, `${fmt(V / A / 2, 2)} cm`], tags: ["reverse"] });
}

function cylinderFindDimensionQuestion() {
  const v = choice(["h", "r"]);
  const r = randInt(2, 10); const h = randInt(3, 20); const V = PI * r * r * h;
  if (v === "h") return q({ type: "cylinder-find-dimension", marks: 2, prompt: `A cylinder of radius ${r} cm has a volume of ${fmt(V, 2)} cm³. Find its height, to the nearest centimetre.`, answer: `${h} cm`, working: [`π × ${r}² × h = ${fmt(V, 2)}`, `h = ${fmt(V, 2)} ÷ (π × ${r * r}) ≈ ${h}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${Math.round(V / (PI * r))} cm`, `${Math.round(V / (2 * PI * r))} cm`], tags: ["reverse", "cylinder"] });
  return q({ type: "cylinder-find-dimension", marks: 2, prompt: `A cylinder of height ${h} cm has a volume of ${fmt(V, 2)} cm³. Find its radius, to the nearest centimetre.`, answer: `${r} cm`, working: [`π × r² × ${h} = ${fmt(V, 2)}`, `r² = ${fmt(V, 2)} ÷ (π × ${h}) ≈ ${fmt(r * r, 2)}`, `r ≈ ${r}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${Math.round(r * r)} cm`, `${Math.round(V / (PI * h) / 2)} cm`].filter(s => s !== `${r} cm`), tags: ["reverse", "cylinder"] });
}

export const EXTRA_VOL_A_GENERATORS = {
  "volume-unit-conversions": volumeUnitConversionsQuestion,
  "prism-find-dimension": prismFindDimensionQuestion,
  "cylinder-find-dimension": cylinderFindDimensionQuestion
};
