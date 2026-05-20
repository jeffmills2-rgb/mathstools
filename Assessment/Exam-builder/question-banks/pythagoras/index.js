/*
  CHHS Exam Builder — Pythagoras Theorem Question Bank
  ----------------------------------------------------
  Save as:

  question-banks/pythagoras/index.js

  Includes:
  - Basic: calculating squares and square roots
  - Expected: unknown sides, decimal sides, Pythagorean triads,
    real-world problems, and multi-step problems
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Pythagoras Theorem";

const TYPE_LIST = [
  { id: "squares", label: "Calculate squares" },
  { id: "square-roots", label: "Calculate square roots" },
  { id: "unknown-sides", label: "Calculating unknown sides" },
  { id: "decimal-sides", label: "Calculating unknown sides — decimals" },
  { id: "triads", label: "Pythagorean triads" },
  { id: "real-world", label: "Real-world problems" },
  { id: "multi-step", label: "Multi-step problems" }
];

const TRIPLES = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [20, 21, 29],
  [28, 45, 53],
  [33, 56, 65]
];

const DECIMAL_LEGS = [
  [6.2, 8.7],
  [4.8, 9.1],
  [7.3, 11.6],
  [5.4, 12.8],
  [9.5, 14.2],
  [10.6, 15.9],
  [8.4, 13.7],
  [11.2, 18.5]
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  const arr = items.slice();

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function randomId(prefix = "pythagoras") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function fmt(n) {
  return Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : Number(n).toFixed(1);
}

function round(n, dp = 1) {
  return Number(n).toFixed(dp);
}

function unit() {
  return choice(["cm", "m"]);
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(t => t.id);
  const plan = [];

  let i = 0;
  while (plan.length < count) {
    plan.push(ids[i % ids.length]);
    i += 1;
  }

  return shuffle(plan);
}

function squareQuestion() {
  const n = randInt(4, 18);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "squares",
    marks: 1,
    prompt: `Calculate: ${n}²`,
    answer: String(n * n),
    working: [`${n}² = ${n} × ${n} = ${n * n}`],
    space: SPACE_SIZES.SMALL,
    tags: ["pythagoras", "squares"]
  });
}

function squareRootQuestion() {
  const n = randInt(4, 18);
  const square = n * n;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "square-roots",
    marks: 1,
    prompt: `Calculate: √${square}`,
    answer: String(n),
    working: [`√${square} = ${n}`],
    space: SPACE_SIZES.SMALL,
    tags: ["pythagoras", "square roots"]
  });
}

function pythagorasQuestion({ decimal = false, missingMode = "mixed" } = {}) {
  let a;
  let b;
  let c;

  if (decimal) {
    [a, b] = choice(DECIMAL_LEGS);
    c = Math.sqrt(a * a + b * b);
  } else {
    [a, b, c] = choice(TRIPLES);
    const scale = choice([1, 2, 3, 4]);
    a *= scale;
    b *= scale;
    c *= scale;
  }

  if (a > b) {
    const temp = a;
    a = b;
    b = temp;
  }

  let missing = missingMode;
  if (missing === "mixed") missing = choice(["hypotenuse", "short-leg", "long-leg"]);

  const u = "x";
  const units = unit();

  const radicand =
    missing === "hypotenuse"
      ? a * a + b * b
      : missing === "short-leg"
        ? c * c - b * b
        : c * c - a * a;

  const answerRaw = Math.sqrt(radicand);
  const answer = `${round(answerRaw, decimal ? 1 : 0)} ${units}`;

  const labels = {
    a: `${fmt(a)} ${units}`,
    b: `${fmt(b)} ${units}`,
    c: `${fmt(c)} ${units}`
  };

  if (missing === "hypotenuse") labels.c = u;
  if (missing === "short-leg") labels.a = u;
  if (missing === "long-leg") labels.b = u;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: decimal ? "decimal-sides" : "unknown-sides",
    marks: 2,
    prompt: `Find the value of ${u}. Round your answer to ${decimal ? "1 decimal place" : "the nearest whole number"}.`,
    diagram: {
      engine: "pythagoras-engine",
      config: {
        diagramType: "right-triangle",
        a,
        b,
        c,
        labels,
        units
      }
    },
    answer,
    working: pythagorasSteps({ a, b, c, missing, u, units, decimal, radicand, answerRaw }),
    space: SPACE_SIZES.MEDIUM,
    tags: ["pythagoras", "unknown sides"]
  });
}

function pythagorasSteps({ a, b, c, missing, u, units, decimal, radicand, answerRaw }) {
  const dp = decimal ? 1 : 0;

  if (missing === "hypotenuse") {
    return [
      `${u}² = ${fmt(a)}² + ${fmt(b)}²`,
      `${u}² = ${fmt(radicand)}`,
      `${u} = √${fmt(radicand)}`,
      `${u} ≈ ${round(answerRaw, dp)} ${units}`
    ];
  }

  if (missing === "short-leg") {
    return [
      `${u}² + ${fmt(b)}² = ${fmt(c)}²`,
      `${u}² = ${fmt(c)}² − ${fmt(b)}²`,
      `${u}² = ${fmt(radicand)}`,
      `${u} ≈ ${round(answerRaw, dp)} ${units}`
    ];
  }

  return [
    `${fmt(a)}² + ${u}² = ${fmt(c)}²`,
    `${u}² = ${fmt(c)}² − ${fmt(a)}²`,
    `${u}² = ${fmt(radicand)}`,
    `${u} ≈ ${round(answerRaw, dp)} ${units}`
  ];
}

function triadQuestion() {
  const useMultipleChoice = Math.random() < 0.55;

  if (useMultipleChoice) {
    const good = choice(TRIPLES);
    const bad1 = [good[0], good[1], good[2] + choice([1, 2, 3])].sort((x, y) => x - y);
    const bad2 = choice([[6, 9, 12], [8, 15, 20], [5, 12, 15], [9, 12, 16]]);
    const bad3 = choice([[4, 7, 9], [7, 10, 13], [6, 8, 11], [12, 16, 21]]);

    const sets = shuffle([good, bad1, bad2, bad3]);
    const choices = sets.map(set => set.join(", "));
    const correct = good.join(", ");

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "triads",
      kind: QUESTION_KINDS.MULTIPLE_CHOICE,
      marks: 1,
      prompt: "Which set of side lengths forms a right-angled triangle?",
      choices,
      answer: correct,
      working: [`${good[0]}² + ${good[1]}² = ${good[2]}²`],
      space: SPACE_SIZES.NONE,
      tags: ["pythagoras", "triads"]
    });
  }

  const right = Math.random() < 0.55;
  let sides;

  if (right) {
    const triple = choice(TRIPLES);
    const scale = choice([1, 2, 3]);
    sides = triple.map(n => n * scale).sort((x, y) => x - y);
  } else {
    const [a, b, c] = choice(TRIPLES);
    sides = [a, b, c + choice([-2, -1, 1, 2, 3])].sort((x, y) => x - y);
  }

  const [a, b, c] = sides;
  const left = a * a + b * b;
  const rightSide = c * c;
  const answer = left === rightSide ? "Yes" : "No";

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "triads",
    marks: 2,
    prompt: `Do the side lengths ${a}, ${b}, ${c} form a right-angled triangle? Justify your answer.`,
    answer,
    working: [
      `${a}² + ${b}² = ${left}`,
      `${c}² = ${rightSide}`,
      left === rightSide
        ? "The triangle is right-angled."
        : "The triangle is not right-angled."
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["pythagoras", "triads"]
  });
}

function realWorldQuestion() {
  const scenario = choice(["ladder", "rectangle", "screen", "park"]);

  if (scenario === "ladder") {
    const a = choice([3, 4, 5, 6]);
    const b = choice([4, 5, 7, 8]);
    const c = Math.sqrt(a * a + b * b);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A ladder reaches ${b} m up a wall. Its base is ${a} m from the wall. How long is the ladder?`,
      answer: `${round(c, 1)} m`,
      working: [`x² = ${a}² + ${b}²`, `x² = ${fmt(a * a + b * b)}`, `x ≈ ${round(c, 1)} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world"]
    });
  }

  if (scenario === "rectangle") {
    const a = choice([6, 8, 9, 12]);
    const b = choice([8, 10, 12, 16]);
    const c = Math.sqrt(a * a + b * b);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A rectangular garden is ${a} m by ${b} m. Find the length of the diagonal path.`,
      answer: `${round(c, 1)} m`,
      working: [`x² = ${a}² + ${b}²`, `x² = ${fmt(a * a + b * b)}`, `x ≈ ${round(c, 1)} m`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world"]
    });
  }

  if (scenario === "screen") {
    const a = choice([30, 40, 50]);
    const b = choice([40, 60, 80]);
    const c = Math.sqrt(a * a + b * b);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "real-world",
      marks: 3,
      prompt: `A screen is ${a} cm high and ${b} cm wide. Find the diagonal length.`,
      answer: `${round(c, 1)} cm`,
      working: [`x² = ${a}² + ${b}²`, `x² = ${fmt(a * a + b * b)}`, `x ≈ ${round(c, 1)} cm`],
      space: SPACE_SIZES.LARGE,
      tags: ["pythagoras", "real world"]
    });
  }

  const a = choice([7, 9, 11]);
  const b = choice([12, 15, 18]);
  const c = Math.sqrt(a * a + b * b);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "real-world",
    marks: 3,
    prompt: `A student walks ${a} m east and ${b} m north. How far are they from the starting point?`,
    answer: `${round(c, 1)} m`,
    working: [`x² = ${a}² + ${b}²`, `x² = ${fmt(a * a + b * b)}`, `x ≈ ${round(c, 1)} m`],
    space: SPACE_SIZES.LARGE,
    tags: ["pythagoras", "real world"]
  });
}

function multiStepQuestion() {
  const a = choice([3, 5, 6, 8]);
  const b = choice([4, 8, 10, 12]);
  const d = choice([4, 5, 7, 9]);
  const firstSquare = a * a + b * b;
  const secondSquare = firstSquare + d * d;
  const y = Math.sqrt(secondSquare);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-step",
    marks: 3,
    prompt: `A path forms two right triangles. The first has shorter sides ${a} m and ${b} m. The second uses this diagonal and another side of ${d} m. Find the final diagonal length.`,
    answer: `${round(y, 1)} m`,
    working: [
      `First triangle: x² = ${a}² + ${b}²`,
      `x² = ${firstSquare}`,
      `Second triangle: y² = x² + ${d}²`,
      `y² = ${secondSquare}`,
      `y ≈ ${round(y, 1)} m`
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["pythagoras", "multi-step"]
  });
}

const GENERATORS = {
  "squares": squareQuestion,
  "square-roots": squareRootQuestion,
  "unknown-sides": () => pythagorasQuestion({ decimal: false, missingMode: "mixed" }),
  "decimal-sides": () => pythagorasQuestion({ decimal: true, missingMode: "mixed" }),
  "triads": triadQuestion,
  "real-world": realWorldQuestion,
  "multi-step": multiStepQuestion
};

export function getPythagorasQuestionTypes() {
  return TYPE_LIST;
}

export function generatePythagorasQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = allowedTypes?.length
    ? allowedTypes
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];

  let safety = 0;

  while (questions.length < count && safety < count * 30) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];

    if (generator) {
      questions.push(generator());
    }

    safety += 1;
  }

  return questions;
}
