/*
  Mills Maths Tools — Stage 3 Multiplicative Relations: the visual types
  ------------------------------------------------------------------------
  question-banks/stage-3/multiplicative-relations/extra-types.js

  MA3-MR-01 asks students to determine prime and composite numbers using
  factors, and the array is how Stage 3 SEES a factor: a number is composite
  when its counters can be arranged in a rectangle other than a single row.
  These types use the array-area engine to show that:

    - prime or composite? — every rectangle made from n counters is drawn
    - square numbers — an n × n array, and which numbers make squares
    - the missing factor pair — rectangles drawn with one pair left out

  Numbers stay at or below 30 so every rectangle fits on the page.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion
} from "../../_shared/bank-helpers.js";

const TOPIC = "Multiplicative Relations";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const arr = config => ({ engine: "array-area-engine", config });

export const EXTRA_MR_TYPES = [
  { id: "prime-composite-arrays", label: "Prime or composite? (arrays)" },
  { id: "square-numbers", label: "Square numbers as arrays" },
  { id: "missing-factor-pair", label: "Find the missing factor pair" }
];

export function factorPairs(n) {
  const out = [];
  for (let a = 1; a * a <= n; a++) if (n % a === 0) out.push([a, n / a]);
  return out;
}
const isPrime = n => n > 1 && factorPairs(n).length === 1;

function primeCompositeArraysQuestion() {
  const prime = Math.random() < 0.5;
  const pool = prime ? [5, 7, 11, 13, 17, 19, 23] : [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22];
  const n = choice(pool);
  const pairs = factorPairs(n);
  return q({
    type: "prime-composite-arrays", marks: 2,
    prompt: `These are all the rectangles that can be made from ${n} counters. Is ${n} a prime number or a composite number? Explain how the rectangles show this.`,
    diagram: arr({ diagramType: "factor-rectangles", pairs }),
    answer: prime
      ? `Prime: the only rectangle is 1 × ${n}, so ${n} has exactly two factors (1 and ${n}).`
      : `Composite: ${n} can also be made as ${pairs.slice(1).map(([a, b]) => `${a} × ${b}`).join(" and ")}, so it has more than two factors.`,
    working: [prime ? `Factors of ${n}: 1, ${n}` : `Factors of ${n}: ${pairs.flat().sort((a, b) => a - b).filter((v, i, s) => s.indexOf(v) === i).join(", ")}`, "A prime number has exactly two factors; a composite number has more than two."],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["prime", "composite", "arrays"]
  });
}

function squareNumbersQuestion() {
  const v = choice(["array", "which"]);
  if (v === "array") {
    const k = randInt(3, 9);
    return q({
      type: "square-numbers", marks: 1,
      prompt: "The counters make a square array. What square number does it show? Write the number sentence.",
      diagram: arr({ diagramType: "array", rows: k, cols: k, rowLabel: null, colLabel: null }),
      answer: `${k} × ${k} = ${k * k}`,
      working: [`${k} rows of ${k}: ${k} × ${k} = ${k * k}`, `${k * k} is a square number.`],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["square numbers", "arrays"]
    });
  }
  const squares = [4, 9, 16, 25, 36, 49, 64, 81, 100];
  const sq = choice(squares);
  const others = shuffle([6, 8, 12, 15, 18, 20, 24, 27, 30, 32, 40, 45, 50]).slice(0, 3);
  const list = shuffle([sq, ...others]);
  return q({
    type: "square-numbers", marks: 1,
    prompt: `Which of these numbers is a square number: ${list.join(", ")}?`,
    answer: String(sq),
    working: [`${sq} = ${Math.sqrt(sq)} × ${Math.sqrt(sq)}, so ${sq} counters make a square array.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: others.map(String),
    tags: ["square numbers"]
  });
}

function missingFactorPairQuestion() {
  const n = choice([12, 16, 18, 20, 24, 28, 30]);
  const pairs = factorPairs(n);
  if (pairs.length < 3) return missingFactorPairQuestion();
  const hideIdx = randInt(1, pairs.length - 1);
  const shown = pairs.filter((_, i) => i !== hideIdx);
  const [a, b] = pairs[hideIdx];
  return q({
    type: "missing-factor-pair", marks: 2,
    prompt: `Some of the rectangles that can be made from ${n} counters are shown. One rectangle is missing. What are its side lengths?`,
    diagram: arr({ diagramType: "factor-rectangles", pairs: shown }),
    answer: `${a} × ${b}`,
    working: [`Test each number from 1 up: which divide ${n} exactly?`, `Factor pairs of ${n}: ${pairs.map(([x, y]) => `${x} × ${y}`).join(", ")}`, `Missing: ${a} × ${b}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${a + 1} × ${b - 1}`, `${a} × ${b + 1}`, `2 × ${n / 2 === b ? n / 2 + 1 : n / 2}`].filter(x => x !== `${a} × ${b}`),
    tags: ["factors", "arrays"]
  });
}

export const EXTRA_MR_GENERATORS = {
  "prime-composite-arrays": primeCompositeArraysQuestion,
  "square-numbers": squareNumbersQuestion,
  "missing-factor-pair": missingFactorPairQuestion
};
