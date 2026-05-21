/*
  CHHS Exam Builder — Algebraic Techniques Question Bank
  ------------------------------------------------------
  Save as:

  question-banks/algebraic-techniques/index.js

  Uses the EXPECTED question types from the existing Algebraic Techniques generator:
  - Translate words to expressions
  - Factorising
  - Substitute and evaluate: two-step
  - Substitute and evaluate: two pronumerals
  - Simplify mixed like terms
  - Multiplying terms
  - Expand and simplify
  - Simplify algebraic fractions
  - Complete a table of values
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Algebraic Techniques";

const TYPE_LIST = [
  { id: "translate-rich", label: "Translate words → expression" },
  { id: "factorise", label: "Factorising" },
  { id: "sub-two", label: "Substitute and evaluate: two-step" },
  { id: "sub-two-vars", label: "Substitute and evaluate: two pronumerals" },
  { id: "simplify-mixed", label: "Simplify mixed like terms" },
  { id: "multiply-terms", label: "Multiplying terms" },
  { id: "expand-simplify", label: "Expand and simplify" },
  { id: "algebraic-fractions", label: "Simplify algebraic fractions" },
  { id: "pattern-table", label: "Complete a table of values" }
];

const VARS = ["x", "a", "b", "m", "n", "p", "y"];
const OTHER_VARS = ["a", "b", "c", "d", "e", "f", "y", "p", "w", "k"];

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

function randomId(prefix = "algebra") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function pickVar() {
  return Math.random() < 0.3 ? "x" : choice(OTHER_VARS);
}

function fmt(n) {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

function sign(n) {
  return n < 0 ? ` − ${Math.abs(n)}` : ` + ${n}`;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);

  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }

  return a || 1;
}

function buildExpression(terms) {
  const parts = [];

  terms.forEach((term, index) => {
    if (term.coeff === 0) return;

    const neg = term.coeff < 0;
    const abs = Math.abs(term.coeff);

    const body = term.v
      ? `${abs === 1 ? "" : abs}${term.v}`
      : String(abs);

    if (index === 0 && parts.length === 0) {
      parts.push(neg ? `−${body}` : body);
    } else {
      parts.push(neg ? ` − ${body}` : ` + ${body}`);
    }
  });

  return parts.length ? parts.join("") : "0";
}

function simplifyTerms(terms) {
  const map = new Map();
  let constant = 0;

  for (const term of terms) {
    if (!term.v) constant += term.coeff;
    else map.set(term.v, (map.get(term.v) || 0) + term.coeff);
  }

  const out = [];

  [...map.keys()].sort().forEach(v => {
    const coeff = map.get(v);
    if (coeff !== 0) out.push({ coeff, v });
  });

  if (constant !== 0 || !out.length) out.push({ coeff: constant, v: null });

  return buildExpression(out);
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

function algebraQuestion({ type, marks = 1, prompt, answer, working = [], space = SPACE_SIZES.MEDIUM }) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    answer,
    working,
    space,
    tags: ["algebraic techniques", type]
  });
}

/* -----------------------------
   Generators
----------------------------- */

function translateRichQuestion() {
  const v = pickVar();

  const stems = [
    {
      text: `three more than twice ${v}`,
      answer: `2${v} + 3`
    },
    {
      text: `five less than three times ${v}`,
      answer: `3${v} − 5`
    },
    {
      text: `the sum of ${v} and 7, multiplied by 2`,
      answer: `2(${v} + 7)`
    },
    {
      text: `half of (${v} + 6)`,
      answer: `(${v} + 6) ÷ 2`
    },
    {
      text: `the difference between 10 and ${v}`,
      answer: `10 − ${v}`
    }
  ];

  const stem = choice(stems);

  return algebraQuestion({
    type: "translate-rich",
    marks: 1,
    prompt: `Write an algebraic expression for: "${stem.text}".`,
    answer: stem.answer,
    working: [`Expression: ${stem.answer}`],
    space: SPACE_SIZES.SMALL
  });
}

function factoriseQuestion() {
  const v = pickVar();
  const template = choice(["two-terms", "negative", "three-terms"]);

  if (template === "two-terms") {
    const g = randInt(2, 9);
    let a = randInt(1, 7);
    let b = randInt(1, 9);

    while (gcd(a, b) !== 1) {
      a = randInt(1, 7);
      b = randInt(1, 9);
    }

    const expr = `${g * a}${v} + ${g * b}`;
    const answer = `${g}(${a}${v} + ${b})`;

    return algebraQuestion({
      type: "factorise",
      marks: 2,
      prompt: `Factorise: ${expr}`,
      answer,
      working: [
        `The highest common factor is ${g}.`,
        `${expr} = ${answer}`
      ]
    });
  }

  if (template === "negative") {
    const g = randInt(2, 9);
    const a = randInt(1, 7);
    const b = randInt(1, 9);
    const expr = `−${g * a}${v} − ${g * b}`;
    const answer = `−${g}(${a}${v} + ${b})`;

    return algebraQuestion({
      type: "factorise",
      marks: 2,
      prompt: `Factorise: ${expr}`,
      answer,
      working: [
        `The common factor is −${g}.`,
        `${expr} = ${answer}`
      ]
    });
  }

  let v2 = pickVar();
  while (v2 === v) v2 = pickVar();

  const g = randInt(2, 6);
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const c = randInt(1, 8);
  const expr = `${g * a}${v} + ${g * b}${v2} + ${g * c}`;
  const answer = `${g}(${a}${v} + ${b}${v2} + ${c})`;

  return algebraQuestion({
    type: "factorise",
    marks: 2,
    prompt: `Factorise: ${expr}`,
    answer,
    working: [
      `The highest common factor is ${g}.`,
      `${expr} = ${answer}`
    ]
  });
}

function substituteTwoQuestion() {
  const v = pickVar();
  const x = randInt(-4, 8);
  const a = randInt(2, 5);
  const b = randInt(1, 9);
  const kind = choice(["a(v+b)", "a(v-b)", "av+b"]);

  let expr;
  let value;

  if (kind === "a(v+b)") {
    expr = `${a}(${v} + ${b})`;
    value = a * (x + b);
  } else if (kind === "a(v-b)") {
    expr = `${a}(${v} − ${b})`;
    value = a * (x - b);
  } else {
    expr = `${a}${v} + ${b}`;
    value = a * x + b;
  }

  return algebraQuestion({
    type: "sub-two",
    marks: 2,
    prompt: `Evaluate ${expr} when ${v} = ${fmt(x)}.`,
    answer: fmt(value),
    working: [
      `Substitute ${v} = ${fmt(x)}.`,
      `${expr} = ${fmt(value)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function substituteTwoVarsQuestion() {
  let v1 = pickVar();
  let v2 = pickVar();

  while (v2 === v1) v2 = pickVar();

  const val1 = randInt(1, 10);
  const val2 = randInt(1, 10);
  const kind = choice(["sumConst", "productConst", "coeffSum", "mixedCoeff", "difference", "bracketMul"]);

  let expr;
  let value;

  if (kind === "sumConst") {
    const c = randInt(1, 12);
    expr = `${v1} + ${v2} + ${c}`;
    value = val1 + val2 + c;
  } else if (kind === "productConst") {
    const c = randInt(1, 12);
    expr = `${v1}${v2} + ${c}`;
    value = val1 * val2 + c;
  } else if (kind === "coeffSum") {
    const a = randInt(2, 12);
    expr = `${a}${v1} + ${v2}`;
    value = a * val1 + val2;
  } else if (kind === "mixedCoeff") {
    const a = randInt(2, 12);
    const b = randInt(2, 12);
    expr = `${a}${v1} + ${b}${v2}`;
    value = a * val1 + b * val2;
  } else if (kind === "difference") {
    const a = randInt(2, 12);
    expr = `${a}${v1} − ${v2}`;
    value = a * val1 - val2;
  } else {
    const a = randInt(2, 12);
    expr = `${a}(${v1} + ${v2})`;
    value = a * (val1 + val2);
  }

  return algebraQuestion({
    type: "sub-two-vars",
    marks: 2,
    prompt: `Evaluate ${expr} when ${v1} = ${val1} and ${v2} = ${val2}.`,
    answer: fmt(value),
    working: [
      `Substitute ${v1} = ${val1} and ${v2} = ${val2}.`,
      `${expr} = ${fmt(value)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function simplifyMixedQuestion() {
  const variables = shuffle([pickVar(), pickVar(), pickVar()])
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, randInt(1, 3));

  while (variables.length < 2) {
    const v = pickVar();
    if (!variables.includes(v)) variables.push(v);
  }

  const terms = [];

  variables.forEach(v => {
    const count = randInt(2, 3);
    for (let i = 0; i < count; i++) {
      terms.push({
        coeff: choice([1, -1]) * randInt(1, 9),
        v
      });
    }
  });

  if (Math.random() < 0.6) {
    terms.push({
      coeff: choice([1, -1]) * randInt(1, 15),
      v: null
    });
  }

  const mixed = shuffle(terms);
  const expr = buildExpression(mixed);
  const answer = simplifyTerms(mixed);

  return algebraQuestion({
    type: "simplify-mixed",
    marks: 2,
    prompt: `Simplify: ${expr}`,
    answer,
    working: [
      "Collect like terms.",
      `${expr} = ${answer}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function multiplyTermsQuestion() {
  const v1 = pickVar();
  let v2 = pickVar();

  if (Math.random() < 0.45) v2 = v1;
  while (v2 === v1 && Math.random() > 0.55) v2 = pickVar();

  const a = randInt(2, 9);
  const b = randInt(2, 9);

  const factors = shuffle([`${a}`, `${b}`, v1, v2]);
  const expr = factors.join(" × ");

  const coeff = a * b;
  const vars = [v1, v2].sort().join("");
  const answer = `${coeff}${vars}`;

  return algebraQuestion({
    type: "multiply-terms",
    marks: 1,
    prompt: `Simplify: ${expr}`,
    answer,
    working: [
      `Multiply the numbers: ${a} × ${b} = ${coeff}.`,
      `Collect the pronumerals: ${vars}.`,
      `Answer: ${answer}`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function expandSimplifyQuestion() {
  const template = choice(["c_plus_k_bracket", "k_bracket_plus_var", "two_var_bracket_plus", "two_var_big"]);

  if (template === "c_plus_k_bracket") {
    const v = pickVar();
    const c0 = randInt(1, 9);
    const k = randInt(2, 6);
    const b = randInt(1, 9);
    const plus = Math.random() < 0.5;
    const expr = `${c0} + ${k}(${v} ${plus ? "+" : "−"} ${b})`;
    const answer = buildExpression([
      { coeff: k, v },
      { coeff: c0 + k * (plus ? b : -b), v: null }
    ]);

    return algebraQuestion({
      type: "expand-simplify",
      marks: 2,
      prompt: `Expand and simplify: ${expr}`,
      answer,
      working: [
        `Expand the bracket.`,
        `${expr} = ${answer}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (template === "k_bracket_plus_var") {
    const v = pickVar();
    const k = randInt(2, 6);
    const b = randInt(1, 9);
    const m = randInt(1, 6);
    const addC = randInt(0, 9);
    const plusB = Math.random() < 0.5;
    const plusM = Math.random() < 0.5;

    const expr = `${k}(${v} ${plusB ? "+" : "−"} ${b}) ${plusM ? "+" : "−"} ${m}${v}${addC ? ` + ${addC}` : ""}`;
    const answer = buildExpression([
      { coeff: k + (plusM ? m : -m), v },
      { coeff: k * (plusB ? b : -b) + addC, v: null }
    ]);

    return algebraQuestion({
      type: "expand-simplify",
      marks: 2,
      prompt: `Expand and simplify: ${expr}`,
      answer,
      working: [
        `Expand the bracket and collect like terms.`,
        `${expr} = ${answer}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  let v1 = pickVar();
  let v2 = pickVar();

  while (v2 === v1) v2 = pickVar();

  const k = randInt(2, 5);
  const a = randInt(1, 4);
  const b = randInt(1, 4);
  const e1 = randInt(0, 6);
  const e2 = randInt(0, 6);

  const expr = `${k}(${a}${v1} + ${b}${v2})${e2 ? ` + ${e2}${v2}` : ""}${e1 ? ` + ${e1}${v1}` : ""}`;
  const answer = simplifyTerms([
    { coeff: k * a + e1, v: v1 },
    { coeff: k * b + e2, v: v2 }
  ]);

  return algebraQuestion({
    type: "expand-simplify",
    marks: 2,
    prompt: `Expand and simplify: ${expr}`,
    answer,
    working: [
      `Expand the bracket and collect like terms.`,
      `${expr} = ${answer}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function algebraicFractionQuestion() {
  let v1 = pickVar();
  let v2 = pickVar();

  while (v2 === v1) v2 = pickVar();

  const topCoeff = randInt(2, 9) * randInt(2, 6);
  const bottomCoeff = randInt(2, 9) * randInt(2, 6);
  const g = gcd(topCoeff, bottomCoeff);

  const template = choice(["oneCommonVar", "twoVarsCancelOne", "numOnly"]);

  let top;
  let bottom;
  let answer;

  if (template === "oneCommonVar") {
    top = `${topCoeff}${v1}`;
    bottom = `${bottomCoeff}${v1}`;
    answer = `${topCoeff / g}/${bottomCoeff / g}`;
  } else if (template === "twoVarsCancelOne") {
    top = `${topCoeff}${v1}${v2}`;
    bottom = `${bottomCoeff}${v1}`;
    answer = `${topCoeff / g}${v2}/${bottomCoeff / g}`;
  } else {
    top = `${topCoeff}${v1}`;
    bottom = `${bottomCoeff}`;
    answer = `${topCoeff / g}${v1}/${bottomCoeff / g}`;
  }

  if (answer.endsWith("/1")) answer = answer.replace("/1", "");

  return algebraQuestion({
    type: "algebraic-fractions",
    marks: 2,
    prompt: `Simplify: (${top}) ÷ (${bottom})`,
    answer,
    working: [
      `Write as a fraction: ${top}/${bottom}.`,
      `Cancel common factors.`,
      `Answer: ${answer}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function patternTableQuestion() {
  const forms = ["n_plus_b", "n_minus_b", "an", "an_plus_b", "an_minus_b"];
  const form = choice(forms);
  const m = randInt(2, 6);
  const b = randInt(1, 9);
  const ns = [1, 2, 3, 4];

  let expr;
  let vals;

  if (form === "n_plus_b") {
    expr = `n + ${b}`;
    vals = ns.map(n => n + b);
  } else if (form === "n_minus_b") {
    expr = `n − ${b}`;
    vals = ns.map(n => n - b);
  } else if (form === "an") {
    expr = `${m}n`;
    vals = ns.map(n => m * n);
  } else if (form === "an_plus_b") {
    expr = `${m}n + ${b}`;
    vals = ns.map(n => m * n + b);
  } else {
    expr = `${m}n − ${b}`;
    vals = ns.map(n => m * n - b);
  }

  return algebraQuestion({
    type: "pattern-table",
    marks: 2,
    prompt: `Complete the table of values for ${expr}, where n = 1, 2, 3, 4.`,
    answer: vals.map(fmt).join(", "),
    working: ns.map((n, i) => `n = ${n}: ${expr} = ${fmt(vals[i])}`),
    space: SPACE_SIZES.MEDIUM
  });
}

const GENERATORS = {
  "translate-rich": translateRichQuestion,
  "factorise": factoriseQuestion,
  "sub-two": substituteTwoQuestion,
  "sub-two-vars": substituteTwoVarsQuestion,
  "simplify-mixed": simplifyMixedQuestion,
  "multiply-terms": multiplyTermsQuestion,
  "expand-simplify": expandSimplifyQuestion,
  "algebraic-fractions": algebraicFractionQuestion,
  "pattern-table": patternTableQuestion
};

export function getAlgebraicTechniquesQuestionTypes() {
  return TYPE_LIST;
}

export function generateAlgebraicTechniquesQuestions({
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
