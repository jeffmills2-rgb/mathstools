/*
  Mills Maths Tools — Trigonometry A: gap-fill types
  ---------------------------------------------------
  question-banks/stage-5/trigonometry-a/extra-types.js

  The original bank works with single right-angled triangles. MA5-TRG-C-01
  problems also need Pythagoras and trigonometry together, exact ratios from
  side lengths, triangles that share a side, and splitting an isosceles
  triangle into two right-angled triangles. Appended to the bank's registry
  by index.js. Figures: geometry engine, built from the true angles.
*/

import { SPACE_SIZES, randInt, choice, makeQuestion, fmt } from "../../_shared/bank-helpers.js";

const TOPIC = "Trigonometry A";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "trigonometry", ...(spec.tags || [])] });
const geo = (config, nts = false) => ({ engine: "geometry-engine", config, ...(nts ? { notToScale: true } : {}) });
const RAD = Math.PI / 180;
const d1 = v => fmt(v, 1); const d2 = v => fmt(v, 2);

export const EXTRA_TRIG_A_TYPES = [
  { id: "pythagoras-then-ratio", label: "Use Pythagoras, then write a trig ratio" },
  { id: "shared-side-triangles", label: "Two right-angled triangles sharing a side" },
  { id: "isosceles-split", label: "Split an isosceles triangle into right triangles" },
  { id: "choose-the-ratio", label: "Choose the correct ratio (SOH CAH TOA)" }
];

function pythagorasThenRatioQuestion() {
  const [a, b, c] = choice([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]]);
  const missing = choice(["hyp", "leg"]);
  const fn = choice(["sin", "cos", "tan"]);
  // θ at A, opposite = a, adjacent = b, hyp = c
  const S = 150 / Math.max(a, b);
  const pts = { A: [0, 0], B: [b * S, 0], C: [b * S, -a * S] };
  const val = { sin: `[[frac:${a}:${c}]]`, cos: `[[frac:${b}:${c}]]`, tan: `[[frac:${a}:${b}]]` }[fn];
  return q({
    type: "pythagoras-then-ratio", marks: 2,
    prompt: `Find the missing side, then write ${fn} θ as a fraction.`,
    diagram: geo({ points: pts, polygons: [{ pts: ["A", "B", "C"] }], angles: [{ at: "B", from: "A", to: "C", right: true }, { at: "A", from: "B", to: "C", label: "θ" }], sideLabels: [{ from: "A", to: "B", text: missing === "leg" ? String(b) : String(b) }, { from: "B", to: "C", text: missing === "leg" ? "x" : String(a) }, { from: "C", to: "A", text: missing === "hyp" ? "x" : String(c) }] }),
    answer: `x = ${missing === "hyp" ? c : a}; ${fn} θ = ${val}`,
    working: [missing === "hyp" ? `x² = ${a}² + ${b}² = ${c * c}, x = ${c}` : `x² = ${c}² − ${b}² = ${a * a}, x = ${a}`, `${fn} θ = ${fn === "sin" ? "opp/hyp" : fn === "cos" ? "adj/hyp" : "opp/adj"}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`x = ${missing === "hyp" ? c : a}; ${fn} θ = ${{ sin: `[[frac:${b}:${c}]]`, cos: `[[frac:${a}:${c}]]`, tan: `[[frac:${b}:${a}]]` }[fn]}`, `x = ${missing === "hyp" ? a + b : c - b}; ${fn} θ = ${val}`],
    tags: ["Pythagoras", "ratios"]
  });
}

function sharedSideTrianglesQuestion() {
  const B = randInt(25, 45); const C = randInt(50, 70); const BD = randInt(8, 20);
  const AD = BD * Math.tan(B * RAD); const DC = AD / Math.tan(C * RAD);
  const S = 160 / (BD + DC);
  const pts = { B: [0, 0], D: [BD * S, 0], C: [(BD + DC) * S, 0], A: [BD * S, -AD * S] };
  return q({
    type: "shared-side-triangles", marks: 4,
    prompt: `AD ⊥ BC, BD = ${BD} m, ∠ABD = ${B}° and ∠ACD = ${C}°. Find AD, then find x = DC. Give answers to 1 decimal place.`,
    diagram: geo({ points: pts, polygons: [{ pts: ["A", "B", "C"] }], segments: [{ from: "A", to: "D" }], angles: [{ at: "D", from: "C", to: "A", right: true }, { at: "B", from: "D", to: "A", label: `${B}°` }, { at: "C", from: "A", to: "D", label: `${C}°` }], sideLabels: [{ from: "B", to: "D", text: `${BD} m` }, { from: "D", to: "C", text: "x" }], labelOffsets: { D: [0, 20] } }, true),
    answer: `AD ≈ ${d1(AD)} m; x ≈ ${d1(DC)} m`,
    working: [`In △ABD: AD = ${BD} tan ${B}° ≈ ${d2(AD)}`, `In △ACD: tan ${C}° = AD ÷ x, so x = ${d2(AD)} ÷ tan ${C}° ≈ ${d1(DC)}`],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [`AD ≈ ${d1(BD * Math.sin(B * RAD))} m; x ≈ ${d1(BD * Math.sin(B * RAD) / Math.tan(C * RAD))} m`, `AD ≈ ${d1(AD)} m; x ≈ ${d1(AD * Math.tan(C * RAD))} m`],
    tags: ["two triangles"]
  });
}

function isoscelesSplitQuestion() {
  const s = randInt(8, 25); const apex = choice([40, 50, 60, 70, 80, 100, 110, 120]);
  const base = 2 * s * Math.sin((apex / 2) * RAD); const h = s * Math.cos((apex / 2) * RAD);
  const S = 170 / Math.max(base, h * 1.2);
  const pts = { A: [0, -h * S], B: [-base / 2 * S, 0], C: [base / 2 * S, 0], M: [0, 0] };
  const ask = choice(["base", "height"]);
  return q({
    type: "isosceles-split", marks: 3,
    prompt: `AB = AC = ${s} cm and ∠BAC = ${apex}°. By drawing the altitude AM, find the ${ask === "base" ? "length of BC" : "height AM"}, to 1 decimal place.`,
    diagram: geo({ points: pts, polygons: [{ pts: ["A", "B", "C"] }], segments: [{ from: "A", to: "M", dashed: true }], ticks: [{ from: "A", to: "B" }, { from: "A", to: "C" }], angles: [{ at: "A", from: "B", to: "C", label: `${apex}°` }], sideLabels: [{ from: "A", to: "B", text: `${s} cm` }], labelOffsets: { M: [0, 20] } }),
    answer: ask === "base" ? `BC ≈ ${d1(base)} cm` : `AM ≈ ${d1(h)} cm`,
    working: ["AM bisects the apex angle and the base (isosceles triangle).", `∠BAM = ${apex / 2}°`, ask === "base" ? `BM = ${s} sin ${apex / 2}° ≈ ${d2(base / 2)}, BC = 2 × BM ≈ ${d1(base)}` : `AM = ${s} cos ${apex / 2}° ≈ ${d1(h)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: ask === "base" ? [`BC ≈ ${d1(s * Math.sin(apex * RAD))} cm`, `BC ≈ ${d1(base / 2)} cm`] : [`AM ≈ ${d1(s * Math.sin((apex / 2) * RAD))} cm`, `AM ≈ ${d1(s * Math.cos(apex * RAD) || s / 2)} cm`],
    tags: ["isosceles"]
  });
}

function chooseTheRatioQuestion() {
  const known = choice([["opposite", "hypotenuse", "sin"], ["adjacent", "hypotenuse", "cos"], ["opposite", "adjacent", "tan"]]);
  const [g1, g2, fn] = known;
  return q({
    type: "choose-the-ratio", marks: 1,
    prompt: `In a right-angled triangle you know an angle θ and the ${g1} side, and you want the ${g2}${g2 === "hypotenuse" ? "" : " side"}. Which ratio should you use?`,
    answer: fn === "sin" ? "sin θ = opposite ÷ hypotenuse" : fn === "cos" ? "cos θ = adjacent ÷ hypotenuse" : "tan θ = opposite ÷ adjacent",
    working: ["SOH CAH TOA: choose the ratio that uses the two sides involved."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["sin θ = opposite ÷ hypotenuse", "cos θ = adjacent ÷ hypotenuse", "tan θ = opposite ÷ adjacent", "tan θ = adjacent ÷ opposite"].filter(s => !s.startsWith(fn)),
    tags: ["ratios"]
  });
}

export const EXTRA_TRIG_A_GENERATORS = {
  "pythagoras-then-ratio": pythagorasThenRatioQuestion,
  "shared-side-triangles": sharedSideTrianglesQuestion,
  "isosceles-split": isoscelesSplitQuestion,
  "choose-the-ratio": chooseTheRatioQuestion
};
