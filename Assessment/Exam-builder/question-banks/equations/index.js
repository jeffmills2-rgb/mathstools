/*
  CHHS Exam Builder — Equations Question Bank
  Save as: question-banks/equations/index.js

  Uses the EXPECTED question types from the existing Equations worksheet generator:
  two-step equations, fractional equations, brackets, both-sides, collecting like terms,
  representing equations, verifying solutions, word problems, and simple quadratics.
*/

import {
  createQuestion,
  QUESTION_KINDS,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Equations";

const TYPE_LIST = [
  { id: "one-step-add-subtract", label: "One-step add/subtract" },
  { id: "one-step-multiply-divide", label: "One-step multiply/divide" },
  { id: "two-standard", label: "Two-step equations: ax + b = c" },
  { id: "two-frac-all", label: "Fraction equations: (x + a)/b = c" },
  { id: "two-frac-var", label: "Fraction equations: x/a + b = c" },
  { id: "two-brackets", label: "Bracket equations: a(x + b) = c" },
  { id: "both-sides", label: "Pronumerals on both sides" },
  { id: "collect-like", label: "Collect like terms first" },
  { id: "represent", label: "Representing equations" },
  { id: "verify", label: "Substitute into equations: True/False" },
  { id: "word-problems", label: "Word problems: form and solve" },
  { id: "quad-x2", label: "Solve x² = c" },
  { id: "quad-ax2", label: "Solve ax² = c" },
  { id: "simple-inequalities", label: "Solve and represent simple inequalities" },
  { id: "multi-step-word", label: "Multi-step word problems" }
];

const VARS = ["x", "a", "b", "m", "n", "p", "y"];

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

function randomId(prefix = "equation") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function pickVar() {
  return Math.random() < 0.55 ? "x" : choice(VARS);
}

function coeff(min = 2, max = 9) {
  return randInt(min, max);
}

function solutionValue() {
  return choice([-9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
}

function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function paren(n) {
  return n < 0 ? `(${fmt(n)})` : String(n);
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

function solveQuestion({ type, marks, equation, answer, working, space = SPACE_SIZES.MEDIUM }) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt: `Solve: ${equation}`,
    answer,
    working,
    space,
    tags: ["equations", type]
  });
}

function oneStepAddSubtractQuestion() {
  const v = pickVar();
  const x = solutionValue();
  const b = randInt(2, 15);
  const template = choice(["add", "subtract"]);

  if (template === "add") {
    const rhs = x + b;

    return solveQuestion({
      type: "one-step-add-subtract",
      marks: 1,
      equation: `${v} + ${b} = ${fmt(rhs)}`,
      answer: `${v} = ${fmt(x)}`,
      working: [
        `${v} + ${b} = ${fmt(rhs)}`,
        `${v} = ${fmt(x)}`
      ],
      space: SPACE_SIZES.SMALL
    });
  }

  const rhs = x - b;

  return solveQuestion({
    type: "one-step-add-subtract",
    marks: 1,
    equation: `${v} − ${b} = ${fmt(rhs)}`,
    answer: `${v} = ${fmt(x)}`,
    working: [
      `${v} − ${b} = ${fmt(rhs)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function oneStepMultiplyDivideQuestion() {
  const v = pickVar();
  const x = solutionValue();
  const a = coeff();
  const template = choice(["multiply", "divide"]);

  if (template === "multiply") {
    const rhs = a * x;

    return solveQuestion({
      type: "one-step-multiply-divide",
      marks: 1,
      equation: `${a}${v} = ${fmt(rhs)}`,
      answer: `${v} = ${fmt(x)}`,
      working: [
        `${a}${v} = ${fmt(rhs)}`,
        `${v} = ${fmt(x)}`
      ],
      space: SPACE_SIZES.SMALL
    });
  }

  const rhs = x;
  const answer = a * rhs;

  return solveQuestion({
    type: "one-step-multiply-divide",
    marks: 1,
    equation: `[[algfrac:${v}:${a}]] = ${fmt(rhs)}`,
    answer: `${v} = ${fmt(answer)}`,
    working: [
      `[[algfrac:${v}:${a}]] = ${fmt(rhs)}`,
      `${v} = ${fmt(answer)}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function twoStandardQuestion() {
  const v = pickVar();
  const x = solutionValue();
  const a = coeff();
  const b = randInt(2, 12);
  const rhs = a * x + b;

  return solveQuestion({
    type: "two-standard",
    marks: 2,
    equation: `${a}${v} + ${b} = ${fmt(rhs)}`,
    answer: `${v} = ${fmt(x)}`,
    working: [
      `${a}${v} + ${b} = ${fmt(rhs)}`,
      `${a}${v} = ${fmt(rhs - b)}`,
      `${v} = ${fmt(x)}`
    ]
  });
}

function twoFracAllQuestion() {
  const v = pickVar();
  const rhs = solutionValue();
  const a = coeff();
  const b = randInt(2, 12);
  const answer = a * rhs - b;

  return solveQuestion({
    type: "two-frac-all",
    marks: 2,
    equation: `[[algfrac:${v} + ${b}:${a}]] = ${fmt(rhs)}`,
    answer: `${v} = ${fmt(answer)}`,
    working: [
      `[[algfrac:${v} + ${b}:${a}]] = ${fmt(rhs)}`,
      `${v} + ${b} = ${fmt(a * rhs)}`,
      `${v} = ${fmt(answer)}`
    ]
  });
}

function twoFracVarQuestion() {
  const v = pickVar();
  const x = solutionValue();
  const a = coeff();
  const b = randInt(2, 12);
  const rhs = x + b;
  const answer = a * x;

  return solveQuestion({
    type: "two-frac-var",
    marks: 2,
    equation: `[[algfrac:${v}:${a}]] + ${b} = ${fmt(rhs)}`,
    answer: `${v} = ${fmt(answer)}`,
    working: [
      `[[algfrac:${v}:${a}]] + ${b} = ${fmt(rhs)}`,
      `[[algfrac:${v}:${a}]] = ${fmt(x)}`,
      `${v} = ${fmt(answer)}`
    ]
  });
}

function twoBracketsQuestion() {
  const v = pickVar();
  const x = solutionValue();
  const a = coeff();
  const b = randInt(2, 10);
  const rhs = a * (x + b);

  return solveQuestion({
    type: "two-brackets",
    marks: 2,
    equation: `${a}(${v} + ${b}) = ${fmt(rhs)}`,
    answer: `${v} = ${fmt(x)}`,
    working: [
      `${a}(${v} + ${b}) = ${fmt(rhs)}`,
      `${v} + ${b} = ${fmt(x + b)}`,
      `${v} = ${fmt(x)}`
    ]
  });
}

function bothSidesQuestion() {
  const v = pickVar();
  const x = solutionValue();
  const a = randInt(3, 9);
  const r = randInt(1, a - 1);
  const b = randInt(2, 12);
  const c = (a - r) * x + b;

  return solveQuestion({
    type: "both-sides",
    marks: 2,
    equation: `${a}${v} + ${b} = ${r}${v} + ${fmt(c)}`,
    answer: `${v} = ${fmt(x)}`,
    working: [
      `${a}${v} + ${b} = ${r}${v} + ${fmt(c)}`,
      `${a - r}${v} + ${b} = ${fmt(c)}`,
      `${a - r}${v} = ${fmt(c - b)}`,
      `${v} = ${fmt(x)}`
    ]
  });
}

function collectLikeQuestion() {
  const v = pickVar();
  const x = solutionValue();
  const a = randInt(2, 7);
  const c = randInt(2, 7);
  const b = randInt(2, 12);
  const totalCoeff = a + c;
  const rhs = totalCoeff * x + b;

  return solveQuestion({
    type: "collect-like",
    marks: 2,
    equation: `${a}${v} + ${c}${v} + ${b} = ${fmt(rhs)}`,
    answer: `${v} = ${fmt(x)}`,
    working: [
      `${a}${v} + ${c}${v} + ${b} = ${fmt(rhs)}`,
      `${totalCoeff}${v} + ${b} = ${fmt(rhs)}`,
      `${totalCoeff}${v} = ${fmt(rhs - b)}`,
      `${v} = ${fmt(x)}`
    ]
  });
}

function quadX2Question() {
  const root = choice([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const c = root * root;

  return solveQuestion({
    type: "quad-x2",
    marks: 1,
    equation: `x² = ${c}`,
    answer: `x = ±${root}`,
    working: [
      `x² = ${c}`,
      `x = ±√${c}`,
      `x = ±${root}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function quadAx2Question() {
  const a = coeff();
  const root = choice([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const rhs = a * root * root;

  return solveQuestion({
    type: "quad-ax2",
    marks: 2,
    equation: `${a}x² = ${rhs}`,
    answer: `x = ±${root}`,
    working: [
      `${a}x² = ${rhs}`,
      `x² = ${rhs / a}`,
      `x = ±${root}`
    ]
  });
}

function representQuestion() {
  const v = pickVar();
  const b = randInt(2, 9);
  const x = solutionValue();
  const total = 2 * (x + b);

  const correct = `2(${v} + ${b}) = ${fmt(total)}`;
  const choices = shuffle([
    correct,
    `2${v} + ${b} = ${fmt(total)}`,
    `${v} + 2(${b}) = ${fmt(total)}`,
    `2(${v} − ${b}) = ${fmt(total)}`
  ]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "represent",
    kind: QUESTION_KINDS.MULTIPLE_CHOICE,
    marks: 1,
    prompt: `Which equation matches this description? Twice the sum of a number and ${b} is ${fmt(total)}.`,
    choices,
    answer: correct,
    working: [
      `"Twice" means multiply by 2.`,
      `"The sum of a number and ${b}" means (${v} + ${b}).`,
      `The equation is ${correct}.`
    ],
    space: SPACE_SIZES.NONE,
    tags: ["equations", "representing"]
  });
}

function verifyQuestion() {
  const base = choice([
    twoStandardQuestion,
    twoBracketsQuestion,
    bothSidesQuestion,
    collectLikeQuestion
  ])();

  const variable = (base.answer.match(/^([a-z])\s*=/i) || [null, "x"])[1];
  const trueValue = Number(base.answer.replace("−", "-").split("=")[1].trim());
  const isTrue = Math.random() < 0.55;
  const proposed = isTrue ? trueValue : trueValue + choice([-3, -2, -1, 1, 2, 3]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "verify",
    marks: 1,
    prompt: `Is ${variable} = ${fmt(proposed)} a solution to ${base.prompt.replace("Solve: ", "")}?`,
    answer: isTrue ? "True" : "False",
    working: isTrue
      ? [`Substituting ${variable} = ${fmt(proposed)} makes the equation true.`]
      : [`Substituting ${variable} = ${fmt(proposed)} does not make the equation true.`],
    space: SPACE_SIZES.SMALL,
    tags: ["equations", "substitution", "verify"]
  });
}

function wordProblemQuestion() {
  const name = choice(["Mia", "Sam", "Ali", "Nora", "Leo", "Ava"]);
  const v = "x";
  const a = coeff();
  const b = randInt(2, 9);
  const x = solutionValue();
  const total = a * x + b;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "word-problems",
    marks: 3,
    prompt: `${name} thinks of a number. They multiply it by ${a} and then add ${b}. The result is ${fmt(total)}. Write and solve an equation.`,
    answer: `${v} = ${fmt(x)}`,
    working: [
      `Let the number be ${v}.`,
      `${a}${v} + ${b} = ${fmt(total)}`,
      `${a}${v} = ${fmt(total - b)}`,
      `${v} = ${fmt(x)}`
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["equations", "word problems"]
  });
}

// ── Solve and represent simple inequalities ───────────────

function simpleInequalitiesQuestion() {
  const v = pickVar();
  const form = choice(["one-step-add", "one-step-mult", "two-step"]);

  if (form === "one-step-add") {
    const b = randInt(2, 15);
    const rhs = solutionValue();
    const rhsWithB = rhs + b;
    const op = choice(["<", ">", "≤", "≥"]);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "simple-inequalities",
      marks: 2,
      prompt: `Solve and show the solution on a number line: ${v} + ${b} ${op} ${fmt(rhsWithB)}`,
      answer: `${v} ${op} ${fmt(rhs)}`,
      working: [
        `${v} + ${b} ${op} ${fmt(rhsWithB)}`,
        `${v} ${op} ${fmt(rhs)}`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["equations", "inequalities", "number line"]
    });
  }

  if (form === "one-step-mult") {
    const a = coeff();
    const x = solutionValue();
    const rhs = a * x;
    const op = choice(["<", ">", "≤", "≥"]);

    return createQuestion({
      id: randomId(),
      topic: TOPIC,
      level: "mixed",
      type: "simple-inequalities",
      marks: 2,
      prompt: `Solve and show the solution on a number line: ${a}${v} ${op} ${fmt(rhs)}`,
      answer: `${v} ${op} ${fmt(x)}`,
      working: [
        `${a}${v} ${op} ${fmt(rhs)}`,
        `${v} ${op} ${fmt(x)}`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["equations", "inequalities"]
    });
  }

  // two-step: ax + b < c
  const a = coeff();
  const x = solutionValue();
  const b = randInt(2, 12);
  const rhs = a * x + b;
  const op = choice(["<", ">", "≤", "≥"]);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "simple-inequalities",
    marks: 2,
    prompt: `Solve: ${a}${v} + ${b} ${op} ${fmt(rhs)}`,
    answer: `${v} ${op} ${fmt(x)}`,
    working: [
      `${a}${v} + ${b} ${op} ${fmt(rhs)}`,
      `${a}${v} ${op} ${fmt(rhs - b)}`,
      `${v} ${op} ${fmt(x)}`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["equations", "inequalities", "two-step"]
  });
}

// ── Multi-step word problems ──────────────────────────────

function multiStepWordQuestion() {
  const names = ["Mia", "Sam", "Alex", "Jordan", "Priya", "Riley", "Kai"];
  const name = choice(names);
  const v = "x";

  const scenarios = [
    // Two items, total cost
    () => {
      const unitA = randInt(3, 15);
      const unitB = randInt(2, 12);
      const totalQty = randInt(5, 12);
      const qtyA = randInt(2, totalQty - 2);
      const qtyB = totalQty - qtyA;
      const total = qtyA * unitA + qtyB * unitB;
      return {
        prompt: `${name} buys ${qtyA} items at $${unitA} each and ${qtyB} items at $${unitB} each. The total cost is $${total}. Write an equation and verify this is correct.`,
        answer: `$${total} verified`,
        working: [
          `${qtyA} × $${unitA} = $${qtyA * unitA}`,
          `${qtyB} × $${unitB} = $${qtyB * unitB}`,
          `Total = $${qtyA * unitA} + $${qtyB * unitB} = $${total} ✓`
        ],
        marks: 3,
        space: SPACE_SIZES.LARGE
      };
    },
    // Perimeter problem
    () => {
      const w = randInt(3, 10);
      const l = randInt(w + 2, 20);
      const perimeter = 2 * (w + l);
      return {
        prompt: `A rectangle has a perimeter of ${perimeter} cm. Its width is ${w} cm. Write an equation to find the length and solve it.`,
        answer: `Length = ${l} cm`,
        working: [
          `Let length = ${v} cm`,
          `2(${v} + ${w}) = ${perimeter}`,
          `${v} + ${w} = ${perimeter / 2}`,
          `${v} = ${l} cm`
        ],
        marks: 3,
        space: SPACE_SIZES.LARGE
      };
    },
    // Shared cost
    () => {
      const people = randInt(2, 5);
      const each = randInt(8, 25);
      const fixed = randInt(5, 20);
      const total = people * each + fixed;
      return {
        prompt: `${people} friends share the cost of a meal equally. There is also a $${fixed} booking fee. The total bill is $${total}. How much does each person pay?`,
        answer: `$${each} each`,
        working: [
          `Let each person pay $${v}`,
          `${people}${v} + ${fixed} = ${total}`,
          `${people}${v} = ${total - fixed}`,
          `${v} = $${each}`
        ],
        marks: 3,
        space: SPACE_SIZES.LARGE
      };
    }
  ];

  const made = choice(scenarios)();

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "multi-step-word",
    marks: made.marks || 3,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: made.space || SPACE_SIZES.LARGE,
    tags: ["equations", "multi-step", "word problems"]
  });
}

const GENERATORS = {
  "one-step-add-subtract": oneStepAddSubtractQuestion,
  "one-step-multiply-divide": oneStepMultiplyDivideQuestion,
  "two-standard": twoStandardQuestion,
  "two-frac-all": twoFracAllQuestion,
  "two-frac-var": twoFracVarQuestion,
  "two-brackets": twoBracketsQuestion,
  "both-sides": bothSidesQuestion,
  "collect-like": collectLikeQuestion,
  "represent": representQuestion,
  "verify": verifyQuestion,
  "word-problems": wordProblemQuestion,
  "quad-x2": quadX2Question,
  "quad-ax2": quadAx2Question,
  "simple-inequalities": simpleInequalitiesQuestion,
  "multi-step-word": multiStepWordQuestion
};

export function getEquationQuestionTypes() {
  return TYPE_LIST;
}

export function generateEquationQuestions({ count = 8, allowedTypes = null } = {}) {
  const typeIds = allowedTypes?.length
    ? allowedTypes
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];
  let safety = 0;

  while (questions.length < count && safety < count * 30) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];

    if (generator) questions.push(generator());

    safety += 1;
  }

  return questions.map(attachQuestionTranslations);
}
