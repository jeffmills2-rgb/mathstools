/*
  CHHS Exam Builder — Fractions, Decimals and Percentages Question Bank
  --------------------------------------------------------------------
  Save as:

  question-banks/fdp/index.js

  Blended Stage 4 style bank covering:
  - simplify/equivalent/compare fractions
  - fraction operations and mixed/improper conversions
  - compare/order/round/operate with decimals
  - percentage of quantities, FDP conversions, percentage change, discounts/best buys
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Fractions, Decimals and Percentages";

const TYPE_LIST = [
  { id: "shaded-fractions", label: "Shaded fractions" },
  { id: "simplify-fractions", label: "Simplify fractions" },
  { id: "equivalent-fractions", label: "Equivalent fractions" },
  { id: "compare-fractions", label: "Compare and order fractions" },
  { id: "fraction-operations", label: "Operations with fractions" },
  { id: "mixed-improper", label: "Mixed and improper fractions" },
  { id: "compare-decimals", label: "Compare and order decimals" },
  { id: "round-decimals", label: "Round decimals" },
  { id: "decimal-operations", label: "Operations with decimals" },
  { id: "percentage-of", label: "Percentage of a quantity" },
  { id: "fdp-conversions", label: "Fraction/decimal/percentage conversions" },
  { id: "percentage-change", label: "Percentage increase and decrease" },
  { id: "discounts", label: "Discounts and best buys" },
  { id: "gst-tax", label: "GST calculations (10%)" },
  { id: "find-original-value", label: "Find the original value (reverse percentage)" }
];

const FRIENDLY_FDP = [
  { n: 1, d: 2, decimal: "0.5", percent: "50%" },
  { n: 1, d: 4, decimal: "0.25", percent: "25%" },
  { n: 3, d: 4, decimal: "0.75", percent: "75%" },
  { n: 1, d: 5, decimal: "0.2", percent: "20%" },
  { n: 2, d: 5, decimal: "0.4", percent: "40%" },
  { n: 3, d: 5, decimal: "0.6", percent: "60%" },
  { n: 4, d: 5, decimal: "0.8", percent: "80%" },
  { n: 1, d: 10, decimal: "0.1", percent: "10%" },
  { n: 3, d: 10, decimal: "0.3", percent: "30%" },
  { n: 7, d: 10, decimal: "0.7", percent: "70%" },
  { n: 1, d: 8, decimal: "0.125", percent: "12.5%" },
  { n: 3, d: 8, decimal: "0.375", percent: "37.5%" },
  { n: 5, d: 8, decimal: "0.625", percent: "62.5%" },
  { n: 7, d: 8, decimal: "0.875", percent: "87.5%" }
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

function randomId(prefix = "fdp") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
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

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function simplify(n, d) {
  const g = gcd(n, d);
  return { n: n / g, d: d / g, g };
}

function frac(n, d) {
  if (d === 1) return String(n);
  return `[[frac:${n}:${d}]]`;
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function dp(n, places = 2) {
  return Number(n).toFixed(places);
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

function fdpQuestion({ type, marks = 1, prompt, answer, working = [], diagram = null, space = SPACE_SIZES.MEDIUM }) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    diagram,
    answer,
    working,
    space,
    tags: ["fractions decimals percentages", type]
  });
}


function shadedFractionsQuestion() {
  const mode = choice(["identify", "simplify", "shade"]);

  if (mode === "shade") {
    const denominator = choice([3, 4, 5, 6, 8, 10, 12]);
    const numerator = randInt(1, denominator - 1);

    return fdpQuestion({
      type: "shaded-fractions",
      marks: 1,
      prompt: `Shade ${frac(numerator, denominator)} on the bar below.`,
      diagram: {
        engine: "fdp-engine",
        config: {
          diagramType: "fraction-bar",
          numerator: 0,
          denominator,
          showLabel: false
        }
      },
      answer: frac(numerator, denominator),
      working: [`Shade ${numerator} out of ${denominator} equal parts.`],
      space: SPACE_SIZES.SMALL
    });
  }

  const denominator = choice(mode === "simplify" ? [4, 6, 8, 10, 12] : [3, 4, 5, 6, 8, 10, 12]);
  let numerator = randInt(1, denominator - 1);

  if (mode === "simplify") {
    const options = [];
    for (let n = 1; n < denominator; n++) {
      if (gcd(n, denominator) > 1) options.push(n);
    }
    numerator = choice(options.length ? options : [numerator]);
  }

  const simple = simplify(numerator, denominator);
  const needsSimplifying = simple.g > 1;

  return fdpQuestion({
    type: "shaded-fractions",
    marks: needsSimplifying ? 2 : 1,
    prompt: needsSimplifying
      ? "What fraction is shaded below? Simplify your answer."
      : "What fraction is shaded in the diagram below?",
    diagram: {
      engine: "fdp-engine",
      config: {
        diagramType: "fraction-bar",
        numerator,
        denominator,
        showLabel: false
      }
    },
    answer: frac(simple.n, simple.d),
    working: needsSimplifying
      ? [`${numerator} out of ${denominator} parts are shaded.`, `${frac(numerator, denominator)} simplifies to ${frac(simple.n, simple.d)}.`]
      : [`${numerator} out of ${denominator} parts are shaded.`, `Fraction shaded = ${frac(numerator, denominator)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function simplifyFractionsQuestion() {
  const baseN = randInt(2, 9);
  const baseD = randInt(baseN + 1, 12);
  const factor = randInt(2, 8);
  const n = baseN * factor;
  const d = baseD * factor;
  const s = simplify(n, d);

  return fdpQuestion({
    type: "simplify-fractions",
    marks: 1,
    prompt: `Simplify: ${frac(n, d)}`,
    answer: frac(s.n, s.d),
    working: [`Divide numerator and denominator by ${s.g}.`, `${frac(n, d)} = ${frac(s.n, s.d)}`],
    space: SPACE_SIZES.SMALL
  });
}

function equivalentFractionsQuestion() {
  const item = choice(FRIENDLY_FDP.filter(x => x.d <= 8));
  const factor = choice([2, 3, 4, 5, 6]);
  const targetD = item.d * factor;
  const answerN = item.n * factor;

  return fdpQuestion({
    type: "equivalent-fractions",
    marks: 1,
    prompt: `Write ${frac(item.n, item.d)} as an equivalent fraction with denominator ${targetD}.`,
    answer: frac(answerN, targetD),
    working: [`${item.d} × ${factor} = ${targetD}`, `${item.n} × ${factor} = ${answerN}`, `${frac(item.n, item.d)} = ${frac(answerN, targetD)}`],
    space: SPACE_SIZES.SMALL
  });
}

function compareFractionsQuestion() {
  const a = choice(FRIENDLY_FDP);
  let b = choice(FRIENDLY_FDP);
  while (a.n / a.d === b.n / b.d) b = choice(FRIENDLY_FDP);
  const symbol = a.n / a.d < b.n / b.d ? "<" : ">";

  return fdpQuestion({
    type: "compare-fractions",
    marks: 1,
    prompt: `Insert < or > to make this true: ${frac(a.n, a.d)} ___ ${frac(b.n, b.d)}`,
    answer: symbol,
    working: [`${frac(a.n, a.d)} = ${a.decimal}`, `${frac(b.n, b.d)} = ${b.decimal}`, `${a.decimal} ${symbol} ${b.decimal}`],
    space: SPACE_SIZES.SMALL
  });
}

function fractionOperationsQuestion() {
  const op = choice(["+", "−", "×"]);
  let a = choice(FRIENDLY_FDP.filter(x => x.n < x.d));
  let b = choice(FRIENDLY_FDP.filter(x => x.n < x.d));

  if (op === "−") {
    while (a.n / a.d <= b.n / b.d) {
      a = choice(FRIENDLY_FDP.filter(x => x.n < x.d));
      b = choice(FRIENDLY_FDP.filter(x => x.n < x.d));
    }
  }

  let n;
  let d;
  let working;

  if (op === "×") {
    n = a.n * b.n;
    d = a.d * b.d;
    const s = simplify(n, d);
    working = [`Multiply the numerators and denominators.`, `${frac(a.n, a.d)} × ${frac(b.n, b.d)} = ${frac(n, d)}`, `Simplify: ${frac(n, d)} = ${frac(s.n, s.d)}`];
    n = s.n;
    d = s.d;
  } else {
    const common = lcm(a.d, b.d);
    const an = a.n * (common / a.d);
    const bn = b.n * (common / b.d);
    n = op === "+" ? an + bn : an - bn;
    d = common;
    const s = simplify(n, d);
    working = [`Use common denominator ${common}.`, `${frac(a.n, a.d)} = ${frac(an, common)} and ${frac(b.n, b.d)} = ${frac(bn, common)}`, `${frac(an, common)} ${op} ${frac(bn, common)} = ${frac(n, d)}`, `Simplify: ${frac(n, d)} = ${frac(s.n, s.d)}`];
    n = s.n;
    d = s.d;
  }

  return fdpQuestion({
    type: "fraction-operations",
    marks: 2,
    prompt: `Calculate and simplify: ${frac(a.n, a.d)} ${op} ${frac(b.n, b.d)}`,
    answer: frac(n, d),
    working,
    space: SPACE_SIZES.MEDIUM
  });
}

function mixedImproperQuestion() {
  const toImproper = Math.random() < 0.5;

  if (toImproper) {
    const whole = randInt(1, 5);
    const d = randInt(3, 10);
    const n = randInt(1, d - 1);
    const answerN = whole * d + n;

    return fdpQuestion({
      type: "mixed-improper",
      marks: 1,
      prompt: `Convert ${whole} ${frac(n, d)} to an improper fraction.`,
      answer: frac(answerN, d),
      working: [`${whole} × ${d} + ${n} = ${answerN}`, `${whole} ${frac(n, d)} = ${frac(answerN, d)}`],
      space: SPACE_SIZES.SMALL
    });
  }

  const d = randInt(3, 10);
  const whole = randInt(1, 5);
  const n = randInt(1, d - 1);
  const improper = whole * d + n;

  return fdpQuestion({
    type: "mixed-improper",
    marks: 1,
    prompt: `Convert ${frac(improper, d)} to a mixed number.`,
    answer: `${whole} ${frac(n, d)}`,
    working: [`${improper} ÷ ${d} = ${whole} remainder ${n}`, `${frac(improper, d)} = ${whole} ${frac(n, d)}`],
    space: SPACE_SIZES.SMALL
  });
}

function compareDecimalsQuestion() {
  const values = shuffle([
    Number((randInt(12, 98) / 100).toFixed(2)),
    Number((randInt(101, 999) / 1000).toFixed(3)),
    Number((randInt(3, 9) / 10).toFixed(1))
  ]);
  const ordered = values.slice().sort((a, b) => a - b).map(v => String(v)).join(", ");

  return fdpQuestion({
    type: "compare-decimals",
    marks: 1,
    prompt: `Order these decimals from smallest to largest: ${values.join(", ")}`,
    answer: ordered,
    working: [`Compare using place value.`, `Smallest to largest: ${ordered}`],
    space: SPACE_SIZES.SMALL
  });
}

function roundDecimalsQuestion() {
  const value = Number((randInt(1001, 9999) / 1000).toFixed(3));
  const places = choice([1, 2]);
  const answer = value.toFixed(places);

  return fdpQuestion({
    type: "round-decimals",
    marks: 1,
    prompt: `Round ${value} to ${places} decimal place${places === 1 ? "" : "s"}.`,
    answer,
    working: [`Look at the next digit after ${places} decimal place${places === 1 ? "" : "s"}.`, `${value} ≈ ${answer}`],
    space: SPACE_SIZES.SMALL
  });
}

function decimalOperationsQuestion() {
  const op = choice(["+", "−", "×", "÷"]);
  let a;
  let b;
  let answer;

  if (op === "+" || op === "−") {
    a = Number((randInt(120, 950) / 10).toFixed(1));
    b = Number((randInt(10, 250) / 10).toFixed(1));
    if (op === "−" && b > a) [a, b] = [b, a];
    answer = op === "+" ? a + b : a - b;
  } else if (op === "×") {
    a = Number((randInt(12, 95) / 10).toFixed(1));
    b = Number((randInt(2, 9) / 10).toFixed(1));
    answer = a * b;
  } else {
    b = Number((randInt(2, 9) / 10).toFixed(1));
    answer = randInt(2, 12);
    a = Number((b * answer).toFixed(1));
  }

  const answerText = dp(answer, Math.abs(answer - Math.round(answer)) < 1e-9 ? 0 : 2).replace(/\.00$/, "");

  return fdpQuestion({
    type: "decimal-operations",
    marks: 1,
    prompt: `Calculate: ${a} ${op} ${b}`,
    answer: answerText,
    working: [`${a} ${op} ${b} = ${answerText}`],
    space: SPACE_SIZES.SMALL
  });
}

function percentageOfQuestion() {
  const percent = choice([5, 10, 12.5, 15, 20, 25, 30, 40, 50, 75]);
  const quantity = choice([40, 60, 80, 120, 160, 200, 240, 320, 400]);
  const answer = quantity * percent / 100;

  return fdpQuestion({
    type: "percentage-of",
    marks: 1,
    prompt: `Find ${percent}% of ${quantity}.`,
    answer: String(answer),
    working: [`${percent}% = ${percent}/100`, `${percent}% of ${quantity} = ${answer}`],
    space: SPACE_SIZES.SMALL
  });
}

function fdpConversionsQuestion() {
  const item = choice(FRIENDLY_FDP);
  const mode = choice(["fraction-to-decimal", "decimal-to-percent", "percent-to-fraction"]);

  if (mode === "fraction-to-decimal") {
    return fdpQuestion({
      type: "fdp-conversions",
      marks: 1,
      prompt: `Convert ${frac(item.n, item.d)} to a decimal.`,
      answer: item.decimal,
      working: [`${item.n} ÷ ${item.d} = ${item.decimal}`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "decimal-to-percent") {
    return fdpQuestion({
      type: "fdp-conversions",
      marks: 1,
      prompt: `Convert ${item.decimal} to a percentage.`,
      answer: item.percent,
      working: [`${item.decimal} × 100 = ${item.percent}`],
      space: SPACE_SIZES.SMALL
    });
  }

  const s = simplify(item.n, item.d);
  return fdpQuestion({
    type: "fdp-conversions",
    marks: 1,
    prompt: `Convert ${item.percent} to a fraction in simplest form.`,
    answer: frac(s.n, s.d),
    working: [`${item.percent} = ${Number.parseFloat(item.percent)}/100`, `Simplify to ${frac(s.n, s.d)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function percentageChangeQuestion() {
  const percent = choice([5, 10, 12, 15, 20, 25, 30]);
  const original = choice([50, 60, 80, 100, 120, 150, 200, 240]);
  const increase = Math.random() < 0.5;
  const change = original * percent / 100;
  const answer = increase ? original + change : original - change;

  return fdpQuestion({
    type: "percentage-change",
    marks: 2,
    prompt: `${increase ? "Increase" : "Decrease"} ${original} by ${percent}%.`,
    answer: String(answer),
    working: [`${percent}% of ${original} = ${change}`, `${increase ? original + " + " + change : original + " − " + change} = ${answer}`],
    space: SPACE_SIZES.MEDIUM
  });
}


const BEST_BUY_CONTEXTS = [
  {
    noun: "cereal",
    unit: "g",
    quantities: [375, 500, 750, 900],
    base: 100,
    rateLabel: "per 100 g",
    lowCents: 70,
    highCents: 150,
    describe(quantity) {
      return `${quantity} g box of cereal`;
    }
  },
  {
    noun: "milk",
    unit: "mL",
    quantities: [600, 1000, 2000, 3000],
    base: 1000,
    rateLabel: "per litre",
    lowCents: 180,
    highCents: 360,
    describe(quantity) {
      return `${quantity} mL bottle of milk`;
    }
  },
  {
    noun: "juice",
    unit: "mL",
    quantities: [600, 1000, 1250, 2000],
    base: 1000,
    rateLabel: "per litre",
    lowCents: 160,
    highCents: 420,
    describe(quantity) {
      return `${quantity} mL bottle of juice`;
    }
  },
  {
    noun: "rice",
    unit: "kg",
    quantities: [1, 2, 5],
    base: 1,
    rateLabel: "per kg",
    lowCents: 180,
    highCents: 420,
    describe(quantity) {
      return `${quantity} kg bag of rice`;
    }
  },
  {
    noun: "pens",
    unit: "items",
    quantities: [4, 6, 10, 12, 20],
    base: 1,
    rateLabel: "per pen",
    lowCents: 45,
    highCents: 130,
    describe(quantity) {
      return `pack of ${quantity} pens`;
    }
  },
  {
    noun: "printer paper",
    unit: "sheets",
    quantities: [100, 250, 500],
    base: 100,
    rateLabel: "per 100 sheets",
    lowCents: 120,
    highCents: 340,
    describe(quantity) {
      return `${quantity}-sheet pack of printer paper`;
    }
  }
];

function makeBestBuyScenario() {
  const context = choice(BEST_BUY_CONTEXTS);
  const quantities = shuffle(context.quantities).slice(0, 2).sort((a, b) => a - b);
  const quantityA = quantities[0];
  const quantityB = quantities[1];
  const unitPriceCents = randInt(context.lowCents, context.highCents);

  const adjustmentA = randInt(-40, 80);
  const adjustmentB = randInt(-90, 70);

  let priceA = Number(((quantityA / context.base) * unitPriceCents / 100 + adjustmentA / 100).toFixed(2));
  let priceB = Number(((quantityB / context.base) * unitPriceCents / 100 + adjustmentB / 100).toFixed(2));

  priceA = Math.max(0.50, priceA);
  priceB = Math.max(0.50, priceB);

  let rateA = priceA / (quantityA / context.base);
  let rateB = priceB / (quantityB / context.base);

  if (Math.abs(rateA - rateB) < 0.005) {
    priceB = Number((priceB + 0.25).toFixed(2));
    rateB = priceB / (quantityB / context.base);
  }

  const best = rateA < rateB ? "Option A" : "Option B";

  return {
    prompt: [
      "Which is better value?",
      `• Option A: ${context.describe(quantityA)} for ${money(priceA)}`,
      `• Option B: ${context.describe(quantityB)} for ${money(priceB)}`
    ].join("\n"),
    answer: best,
    working: [
      `Option A: ${money(priceA)} ÷ ${quantityA / context.base} = ${money(rateA)} ${context.rateLabel}.`,
      `Option B: ${money(priceB)} ÷ ${quantityB / context.base} = ${money(rateB)} ${context.rateLabel}.`,
      `${best} is better value.`
    ]
  };
}

function discountsQuestion() {
  if (Math.random() < 0.55) {
    const price = choice([40, 60, 80, 100, 120, 160, 200]);
    const percent = choice([10, 15, 20, 25, 30, 40]);
    const discount = price * percent / 100;
    const sale = price - discount;

    return fdpQuestion({
      type: "discounts",
      marks: 2,
      prompt: `A jacket costs ${money(price)}. It is discounted by ${percent}%. Find the sale price.`,
      answer: money(sale),
      working: [`${percent}% of ${money(price)} = ${money(discount)}`, `${money(price)} − ${money(discount)} = ${money(sale)}`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const made = makeBestBuyScenario();

  return fdpQuestion({
    type: "discounts",
    marks: 2,
    prompt: made.prompt,
    answer: made.answer,
    working: made.working,
    space: SPACE_SIZES.MEDIUM
  });
}

// ── GST calculations (Australian context, 10%) ───────────

function gstTaxQuestion() {
  const items = [
    "a laptop", "a textbook", "a bicycle", "a pair of shoes",
    "a sports bag", "a calculator", "a printer", "a microwave",
    "a set of headphones", "a dining table"
  ];
  const item = choice(items);

  const form = choice(["add-gst", "find-gst", "remove-gst"]);

  if (form === "add-gst") {
    // Given pre-GST price, find price including GST
    const base = choice([20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500]);
    const gst = base * 0.1;
    const total = base + gst;

    return fdpQuestion({
      type: "gst-tax",
      marks: 2,
      prompt: `The pre-GST price of ${item} is ${money(base)}. GST is 10%. Find the price including GST.`,
      answer: money(total),
      working: [
        `GST = 10% × ${money(base)} = ${money(gst)}`,
        `Price including GST = ${money(base)} + ${money(gst)} = ${money(total)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  if (form === "find-gst") {
    // Given total (inc. GST), find the GST amount
    const base = choice([20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300]);
    const gst = base * 0.1;
    const total = base + gst;

    return fdpQuestion({
      type: "gst-tax",
      marks: 2,
      prompt: `The total price of ${item} (including 10% GST) is ${money(total)}. How much of that is GST?`,
      answer: money(gst),
      working: [
        `GST-inclusive price = 110% of original`,
        `Original = ${money(total)} ÷ 1.1 = ${money(base)}`,
        `GST = ${money(total)} − ${money(base)} = ${money(gst)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  // remove-gst: Given GST-inclusive price, find the pre-GST price
  const base = choice([20, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300]);
  const total = base * 1.1;

  return fdpQuestion({
    type: "gst-tax",
    marks: 2,
    prompt: `The price of ${item} including 10% GST is ${money(total)}. What was the pre-GST price?`,
    answer: money(base),
    working: [
      `Pre-GST price = ${money(total)} ÷ 1.1`,
      `= ${money(base)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

// ── Find the original value (reverse percentage) ──────────

function findOriginalValueQuestion() {
  const items = [
    "a jacket", "a phone", "a TV", "a pair of jeans",
    "a watch", "a camera", "a pair of sneakers", "a backpack"
  ];
  const item = choice(items);

  const form = choice(["discount", "increase"]);
  const percent = choice([10, 15, 20, 25, 30, 40, 50]);

  if (form === "discount") {
    // Sale price is given — find original
    const original = choice([40, 60, 80, 100, 120, 160, 200, 250, 300]);
    const saleFactor = (100 - percent) / 100;
    const salePrice = original * saleFactor;

    return fdpQuestion({
      type: "find-original-value",
      marks: 2,
      prompt: `${item[0].toUpperCase() + item.slice(1)} is on sale for ${money(salePrice)} after a ${percent}% discount. What was the original price?`,
      answer: money(original),
      working: [
        `Sale price = (100 − ${percent})% of original = ${100 - percent}% of original`,
        `Original = ${money(salePrice)} ÷ ${saleFactor}`,
        `= ${money(original)}`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  // increase: final price after % increase — find original
  const original = choice([40, 60, 80, 100, 120, 150, 200]);
  const factor = (100 + percent) / 100;
  const finalPrice = original * factor;

  return fdpQuestion({
    type: "find-original-value",
    marks: 2,
    prompt: `After a ${percent}% price increase, ${item} costs ${money(finalPrice)}. What was the original price?`,
    answer: money(original),
    working: [
      `Final price = ${100 + percent}% of original`,
      `Original = ${money(finalPrice)} ÷ ${factor}`,
      `= ${money(original)}`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

const GENERATORS = {
  "shaded-fractions": shadedFractionsQuestion,
  "simplify-fractions": simplifyFractionsQuestion,
  "equivalent-fractions": equivalentFractionsQuestion,
  "compare-fractions": compareFractionsQuestion,
  "fraction-operations": fractionOperationsQuestion,
  "mixed-improper": mixedImproperQuestion,
  "compare-decimals": compareDecimalsQuestion,
  "round-decimals": roundDecimalsQuestion,
  "decimal-operations": decimalOperationsQuestion,
  "percentage-of": percentageOfQuestion,
  "fdp-conversions": fdpConversionsQuestion,
  "percentage-change": percentageChangeQuestion,
  "discounts": discountsQuestion,
  "gst-tax": gstTaxQuestion,
  "find-original-value": findOriginalValueQuestion
};

export function getFdpQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateFdpQuestions({ count = 8, allowedTypes = null } = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  return plan.map(type => GENERATORS[type]()).map(attachQuestionTranslations);
}
