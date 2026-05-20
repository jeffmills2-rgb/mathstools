/*
  CHHS Exam Builder — Integers Question Bank
  ------------------------------------------
  Save as:

  question-banks/integers/index.js

  This bank intentionally removes Basic/Expected separation.
  It blends friendly D/E-style items with C-expected items.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Integers";

const TYPE_LIST = [
  { id: "place-number-line", label: "Place an integer on a number line" },
  { id: "integer-calculations", label: "Integer calculations" },
  { id: "compare-integers", label: "Compare integers" },
  { id: "ordering-integers", label: "Ordering integers" },
  { id: "combining-signs", label: "Combining signs" },
  { id: "order-of-operations", label: "Order of operations" }
];

const STEPS = [1, 2, 3, 4, 5, 10];

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

function randomId(prefix = "integer") {
  return crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random()}`;
}

function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function paren(n) {
  return n < 0 ? `(${fmt(n)})` : String(n);
}

function compareSymbol(a, b) {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
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

/* -----------------------------
   Question generators
----------------------------- */

function placeNumberLineQuestion() {
  const useExpectedScale = Math.random() < 0.55;
  const step = useExpectedScale ? choice([2, 3, 4, 5, 10]) : 1;
  const max = step * 10;
  const min = -max;

  const possible = [];
  for (let v = min + step; v <= max - step; v += step) {
    if (v !== 0) possible.push(v);
  }

  const answer = choice(possible);

  const labels = step === 1
    ? [min, 0, max]
    : shuffle(possible.filter(v => Math.abs(v - answer) > step * 2)).slice(0, 2).concat([min, 0, max]);

  const sortedLabels = [...new Set(labels)].sort((a, b) => a - b);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "place-number-line",
    marks: 1,
    prompt: `Place ${fmt(answer)} on the number line.`,
    diagram: {
      engine: "integer-engine",
      config: {
        diagramType: "number-line",
        min,
        max,
        step,
        labels: sortedLabels,
        answer,
        showAnswer: false
      }
    },
    answer: fmt(answer),
    working: [`Locate ${fmt(answer)} using the scale on the number line.`],
    space: SPACE_SIZES.NONE,
    tags: ["integers", "number line"]
  });
}

function integerCalculationQuestion() {
  const op = choice(["+", "−", "×", "÷"]);
  let a, b, answer, prompt;

  if (op === "+" || op === "−") {
    a = randInt(-50, 50);
    b = randInt(1, 50);
    answer = op === "+" ? a + b : a - b;
    prompt = `Calculate: ${fmt(a)} ${op} ${fmt(b)}`;
  }

  if (op === "×") {
    a = randInt(-12, 12);
    b = randInt(-12, 12);
    if (a === 0 && b === 0) b = 3;
    answer = a * b;
    prompt = `Calculate: ${paren(a)} × ${paren(b)}`;
  }

  if (op === "÷") {
    b = choice([-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    answer = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
    a = b * answer;
    prompt = `Calculate: ${paren(a)} ÷ ${paren(b)}`;
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "integer-calculations",
    marks: 1,
    prompt,
    answer: fmt(answer),
    working: [`${prompt.replace("Calculate: ", "")} = ${fmt(answer)}`],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "operations"]
  });
}

function compareIntegersQuestion() {
  const expressionMode = Math.random() < 0.55;

  if (!expressionMode) {
    const a = randInt(-50, 50);
    const b = randInt(-50, 50);
    const answer = compareSymbol(a, b);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "compare-integers",
      marks: 1,
      prompt: `Insert <, > or = to make the statement true: ${fmt(a)} ___ ${fmt(b)}`,
      answer,
      working: [`${fmt(a)} ${answer} ${fmt(b)}`],
      space: SPACE_SIZES.NONE,
      tags: ["integers", "comparison"]
    });
  }

  const a = randInt(-30, 30);
  const b = randInt(-30, 30);
  const c = randInt(-50, 50);
  const op = choice(["+", "−"]);
  const exprValue = op === "+" ? a + b : a - b;
  const swap = Math.random() < 0.5;

  const leftText = swap ? fmt(c) : `${fmt(a)} ${op} ${paren(b)}`;
  const rightText = swap ? `${fmt(a)} ${op} ${paren(b)}` : fmt(c);
  const leftValue = swap ? c : exprValue;
  const rightValue = swap ? exprValue : c;
  const answer = compareSymbol(leftValue, rightValue);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "compare-integers",
    marks: 1,
    prompt: `Insert <, > or = to make the statement true: ${leftText} ___ ${rightText}`,
    answer,
    working: [
      `${leftText} = ${fmt(leftValue)}`,
      `${rightText} = ${fmt(rightValue)}`,
      `${fmt(leftValue)} ${answer} ${fmt(rightValue)}`
    ],
    space: SPACE_SIZES.NONE,
    tags: ["integers", "comparison", "expressions"]
  });
}

function orderingIntegersQuestion() {
  const direction = Math.random() < 0.5 ? "ascending" : "descending";
  const values = new Set();

  while (values.size < 5) {
    values.add(randInt(-100, 50));
  }

  const shown = shuffle([...values]);
  const answer = shown.slice().sort((a, b) => direction === "ascending" ? a - b : b - a);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "ordering-integers",
    marks: 1,
    prompt: `Place these integers in ${direction} order: ${shown.map(fmt).join(", ")}`,
    answer: answer.map(fmt).join(", "),
    working: [`${direction[0].toUpperCase() + direction.slice(1)} order: ${answer.map(fmt).join(", ")}`],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "ordering"]
  });
}

function combiningSignsQuestion() {
  const forms = [
    { aSign: 1, op: "+", bSign: 1 },
    { aSign: 1, op: "+", bSign: -1 },
    { aSign: 1, op: "−", bSign: 1 },
    { aSign: 1, op: "−", bSign: -1 },
    { aSign: -1, op: "+", bSign: 1 },
    { aSign: -1, op: "+", bSign: -1 },
    { aSign: -1, op: "−", bSign: 1 },
    { aSign: -1, op: "−", bSign: -1 }
  ];

  const form = choice(forms);
  const a = form.aSign * randInt(1, 50);
  const b = form.bSign * randInt(1, 50);
  const answer = form.op === "+" ? a + b : a - b;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "combining-signs",
    marks: 1,
    prompt: `Calculate: ${paren(a)} ${form.op} ${paren(b)}`,
    answer: fmt(answer),
    working: [`${paren(a)} ${form.op} ${paren(b)} = ${fmt(answer)}`],
    space: SPACE_SIZES.SMALL,
    tags: ["integers", "combining signs"]
  });
}

function orderOfOperationsQuestion() {
  const forms = [
    () => {
      const a = randInt(-20, 20);
      const b = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
      const c = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
      return {
        expr: `${fmt(a)} + ${paren(b)} × ${paren(c)}`,
        answer: a + b * c,
        working: [
          `Calculate multiplication first: ${paren(b)} × ${paren(c)} = ${fmt(b * c)}`,
          `${fmt(a)} + ${fmt(b * c)} = ${fmt(a + b * c)}`
        ]
      };
    },
    () => {
      const a = choice([-12, -10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12]);
      const b = randInt(-12, 12);
      const c = randInt(-12, 12);
      return {
        expr: `${paren(a)} × (${fmt(b)} + ${paren(c)})`,
        answer: a * (b + c),
        working: [
          `Calculate brackets first: ${fmt(b)} + ${paren(c)} = ${fmt(b + c)}`,
          `${paren(a)} × ${paren(b + c)} = ${fmt(a * (b + c))}`
        ]
      };
    },
    () => {
      const divisor = choice([-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8]);
      const quotient = choice([-10, -8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10]);
      const dividend = divisor * quotient;
      const c = randInt(-20, 20);
      return {
        expr: `${paren(dividend)} ÷ ${paren(divisor)} − ${paren(c)}`,
        answer: quotient - c,
        working: [
          `Calculate division first: ${paren(dividend)} ÷ ${paren(divisor)} = ${fmt(quotient)}`,
          `${fmt(quotient)} − ${paren(c)} = ${fmt(quotient - c)}`
        ]
      };
    }
  ];

  let made = choice(forms)();

  // Avoid very large answers.
  let guard = 0;
  while (Math.abs(made.answer) > 150 && guard < 30) {
    made = choice(forms)();
    guard += 1;
  }

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "order-of-operations",
    marks: 2,
    prompt: `Use order of operations to calculate: ${made.expr}`,
    answer: fmt(made.answer),
    working: made.working,
    space: SPACE_SIZES.MEDIUM,
    tags: ["integers", "order of operations"]
  });
}

const GENERATORS = {
  "place-number-line": placeNumberLineQuestion,
  "integer-calculations": integerCalculationQuestion,
  "compare-integers": compareIntegersQuestion,
  "ordering-integers": orderingIntegersQuestion,
  "combining-signs": combiningSignsQuestion,
  "order-of-operations": orderOfOperationsQuestion
};

export function getIntegerQuestionTypes() {
  return TYPE_LIST;
}

export function generateIntegerQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = allowedTypes?.length ? allowedTypes : TYPE_LIST.map(t => t.id);
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
