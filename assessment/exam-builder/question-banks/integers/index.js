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
  { id: "order-of-operations", label: "Order of operations" },
  { id: "real-world-integers", label: "Real-world integer problems" }
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
    mcEligible: false,
    tags: ["integers", "number line", "diagram task", "no multiple choice"]
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

// ── Real-world integer word problems ─────────────────────

function realWorldIntegersQuestion() {
  const scenarios = [
    // Temperature
    () => {
      const start = randInt(-15, 10);
      const change = randInt(1, 20);
      const direction = Math.random() < 0.5 ? "rises" : "drops";
      const end = direction === "rises" ? start + change : start - change;
      const op = direction === "rises" ? "+" : "−";
      return {
        prompt: `The temperature is ${fmt(start)}°C. It ${direction} by ${change}°C. What is the new temperature?`,
        answer: fmt(end),
        working: [
          `${fmt(start)} ${op} ${change} = ${fmt(end)}`,
          `The new temperature is ${fmt(end)}°C.`
        ],
        tags: ["integers", "real-world", "temperature"]
      };
    },
    // Altitude / depth
    () => {
      const depth = randInt(10, 400) * 10;
      const rise = randInt(1, Math.floor(depth / 10)) * 10;
      const start = -depth;
      const end = start + rise;
      return {
        prompt: `A submarine is ${depth} m below sea level (${fmt(start)} m). It rises ${rise} m. What is its new depth?`,
        answer: `${fmt(end)} m`,
        working: [
          `${fmt(start)} + ${rise} = ${fmt(end)}`,
          `The submarine is now at ${fmt(end)} m.`
        ],
        tags: ["integers", "real-world", "altitude"]
      };
    },
    // Bank balance
    () => {
      const overdraft = randInt(1, 12) * 10;
      const deposit = randInt(overdraft + 10, overdraft + 200);
      const start = -overdraft;
      const end = start + deposit;
      return {
        prompt: `A bank account has an overdraft of $${overdraft} (balance: ${fmt(start)}). A deposit of $${deposit} is made. What is the new balance?`,
        answer: `$${fmt(end)}`,
        working: [
          `${fmt(start)} + ${deposit} = ${fmt(end)}`,
          `The new balance is $${fmt(end)}.`
        ],
        tags: ["integers", "real-world", "money"]
      };
    },
    // Score / points
    () => {
      const start = randInt(-20, 5);
      const earn = randInt(5, 30);
      const penalty = randInt(1, earn - 1);
      const end = start + earn - penalty;
      return {
        prompt: `A team starts with ${fmt(start)} points. They earn ${earn} points then lose ${penalty} points. What is their final score?`,
        answer: fmt(end),
        working: [
          `${fmt(start)} + ${earn} − ${penalty}`,
          `= ${fmt(start + earn)} − ${penalty}`,
          `= ${fmt(end)}`
        ],
        tags: ["integers", "real-world", "score"]
      };
    },
    // Floors in a building
    () => {
      const underground = randInt(1, 4);
      const floors = randInt(5, 20);
      const startFloor = -randInt(1, underground);
      const change = randInt(5, underground + floors);
      const endFloor = startFloor + change;
      return {
        prompt: `A lift starts on floor ${fmt(startFloor)} (basement). It goes up ${change} floors. Which floor does it stop on?`,
        answer: `Floor ${fmt(endFloor)}`,
        working: [
          `${fmt(startFloor)} + ${change} = ${fmt(endFloor)}`,
          `The lift stops on floor ${fmt(endFloor)}.`
        ],
        tags: ["integers", "real-world", "floors"]
      };
    },
    // Two-step: time zones
    () => {
      const utc = randInt(-8, 8);
      const local = randInt(-8, 8);
      const diff = local - utc;
      const utcHour = randInt(8, 20);
      let localHour = utcHour + diff;
      const nextDay = localHour >= 24;
      const prevDay = localHour < 0;
      if (nextDay) localHour -= 24;
      if (prevDay) localHour += 24;
      const dayNote = nextDay ? " (next day)" : prevDay ? " (previous day)" : "";
      const sign = diff >= 0 ? "+" : "−";
      const absDiff = Math.abs(diff);
      return {
        prompt: `A city is UTC ${diff >= 0 ? "+" : ""}${diff}. If the UTC time is ${utcHour}:00, what is the local time?`,
        answer: `${localHour}:00${dayNote}`,
        working: [
          `${utcHour} ${sign} ${absDiff} = ${utcHour + diff}`,
          `Local time is ${localHour}:00${dayNote}.`
        ],
        tags: ["integers", "real-world", "time zones"]
      };
    }
  ];

  const made = choice(scenarios)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "real-world-integers",
    marks: 2,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.MEDIUM,
    tags: made.tags
  });
}

const GENERATORS = {
  "place-number-line": placeNumberLineQuestion,
  "integer-calculations": integerCalculationQuestion,
  "compare-integers": compareIntegersQuestion,
  "ordering-integers": orderingIntegersQuestion,
  "combining-signs": combiningSignsQuestion,
  "order-of-operations": orderOfOperationsQuestion,
  "real-world-integers": realWorldIntegersQuestion
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
