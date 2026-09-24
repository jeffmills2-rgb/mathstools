/*
  Mills Maths Tools — Stage 3 Represents Numbers: the visual types
  ------------------------------------------------------------------
  question-banks/stage-3/represents-numbers/extra-types.js

  The hundred grid is THE Stage 3 model connecting hundredths, percentages
  and fractions (MA3-RN-02/03), and negative numbers are met "in everyday
  contexts such as temperature" (MA3-RN-01). The original bank asks both in
  words; these types give the picture:

    - read the shaded part of a hundred grid as a decimal, a fraction or a
      percentage
    - the benchmark percentages (10%, 20%, 25%, 50%, 75%) as all three forms
    - read a thermometer below zero, and compare two temperatures

  Diagrams: fdp-engine `percentage-grid` (label suppressed so the picture
  doesn't give the answer away) and integer-engine `thermometer`.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, frac, gcd
} from "../../_shared/bank-helpers.js";

const TOPIC = "Represents Numbers";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const gridOf = percent => ({ engine: "fdp-engine", config: { diagramType: "percentage-grid", percent, label: "" } });
const MINUS = "−";
const signed = n => (n < 0 ? `${MINUS}${Math.abs(n)}` : String(n));

export const EXTRA_RN_TYPES = [
  { id: "hundred-grid", label: "Hundredths on a hundred grid" },
  { id: "benchmark-grid", label: "Benchmark percentages on a grid" },
  { id: "thermometer-negative", label: "Negative temperatures on a thermometer" }
];

function hundredGridQuestion() {
  let k;
  do { k = randInt(3, 97); } while (k % 10 === 0 || k % 25 === 0);
  const form = choice(["decimal", "fraction", "percentage"]);
  const dec = `0.${String(k).padStart(2, "0")}`;
  const ans = form === "decimal" ? dec : form === "fraction" ? frac(k, 100, false) : `${k}%`;
  return q({
    type: "hundred-grid", marks: 1,
    prompt: `The grid has 100 equal squares. What ${form === "percentage" ? "percentage" : form} of the grid is shaded?`,
    diagram: gridOf(k),
    answer: ans,
    working: [`${k} of the 100 squares are shaded.`, `${k} hundredths = ${frac(k, 100, false)} = ${dec} = ${k}%`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: form === "decimal" ? [`${k}`, `${k / 10}`, `${(k / 1000).toFixed(3)}`, `0.${String(100 - k).padStart(2, "0")}`] : form === "fraction" ? [frac(k, 10, false), frac(100 - k, 100, false), frac(1, k, false)] : [`${100 - k}%`, `0.${k}%`, `${k / 10}%`],
    tags: ["decimals", "percentages", "hundred grid"]
  });
}

const BENCH = [10, 20, 25, 50, 75];

function benchmarkGridQuestion() {
  const p = choice(BENCH);
  const g = gcd(p, 100);
  return q({
    type: "benchmark-grid", marks: 2,
    prompt: "What part of the grid is shaded? Write it as a percentage, as a fraction in simplest form and as a decimal.",
    diagram: gridOf(p),
    answer: `${p}% = ${frac(p / g, 100 / g, false)} = ${(p / 100).toFixed(2).replace(/0$/, "")}`,
    working: [`${p} of 100 squares: ${p}%`, `${p}/100 = ${p / g}/${100 / g}`, `${p} hundredths = ${(p / 100).toFixed(2).replace(/0$/, "")}`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["percentages", "benchmark", "hundred grid"]
  });
}

function thermometerNegativeQuestion() {
  const v = choice(["read", "compare", "rise"]);
  if (v === "read") {
    const t = randInt(-3, -1) * 5;
    return q({
      type: "thermometer-negative", marks: 1,
      prompt: "What temperature does the thermometer show?",
      diagram: { engine: "integer-engine", config: { diagramType: "thermometer", min: -20, max: 30, step: 5, value: t, unit: "°C", showValue: false } },
      answer: `${signed(t)}°C`,
      working: [`The top of the liquid is ${Math.abs(t)} degrees below zero: ${signed(t)}°C.`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${Math.abs(t)}°C`, `${signed(t + 5)}°C`, `${signed(t - 5)}°C`],
      tags: ["integers", "temperature"]
    });
  }
  if (v === "compare") {
    const a = randInt(-3, 2) * 5;
    let b; do { b = randInt(-3, 4) * 5; } while (b === a || (a >= 0 && b >= 0));
    const colder = Math.min(a, b);
    const towns = shuffle(["Thredbo", "Oberon", "Cooma", "Orange", "Guyra"]).slice(0, 2);
    return q({
      type: "thermometer-negative", marks: 2,
      prompt: `At 6 am it was ${signed(a)}°C in ${towns[0]} and ${signed(b)}°C in ${towns[1]}. Which town was colder, and by how many degrees?`,
      diagram: { engine: "integer-engine", config: { diagramType: "thermometer", min: -20, max: 30, step: 5, value: a, value2: b, unit: "°C", showValue: false } },
      answer: `${colder === a ? towns[0] : towns[1]}, by ${Math.abs(a - b)} degrees`,
      working: [`${signed(colder)} is lower than ${signed(Math.max(a, b))}.`, `Difference: count from ${signed(colder)} up to ${signed(Math.max(a, b))} = ${Math.abs(a - b)} degrees`],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["integers", "temperature"]
    });
  }
  const s = randInt(-3, -1) * 5;
  const r = randInt(2, 6) * 5;
  const e = s + r;
  return q({
    type: "thermometer-negative", marks: 1,
    prompt: `The thermometer shows the temperature at dawn. By lunchtime it had risen ${r} degrees. What was the temperature at lunchtime?`,
    diagram: { engine: "integer-engine", config: { diagramType: "thermometer", min: -20, max: 30, step: 5, value: s, unit: "°C", showValue: false } },
    answer: `${signed(e)}°C`,
    working: [`Start at ${signed(s)}°C and count up ${r}: ${signed(e)}°C`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${signed(-e)}°C`, `${signed(s - r)}°C`, `${signed(Math.abs(s) + r)}°C`, `${signed(e + 5)}°C`],
    tags: ["integers", "temperature"]
  });
}

export const EXTRA_RN_GENERATORS = {
  "hundred-grid": hundredGridQuestion,
  "benchmark-grid": benchmarkGridQuestion,
  "thermometer-negative": thermometerNegativeQuestion
};
