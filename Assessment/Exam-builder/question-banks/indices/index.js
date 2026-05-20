/*
  CHHS Exam Builder — Indices Question Bank
  -----------------------------------------
  Save as:

  question-banks/indices/index.js

  Covers:
  - index notation with positive powers
  - expanded form and evaluating powers
  - powers of 10
  - order of operations involving indices
  - divisibility tests
  - prime factorisation, including index notation
  - factor trees
  - square roots and cube roots
  - estimating roots
  - index laws with positive-integer indices and zero index
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Indices";

const TYPE_LIST = [
  { id: "index-notation", label: "Write numbers in index notation" },
  { id: "expanded-index-form", label: "Expand and evaluate index notation" },
  { id: "powers-of-ten", label: "Powers of 10" },
  { id: "order-of-operations-indices", label: "Order of operations with indices" },
  { id: "divisibility-tests", label: "Divisibility tests" },
  { id: "prime-factorisation", label: "Prime factorisation" },
  { id: "prime-factorisation-index", label: "Prime factorisation using index notation" },
  { id: "factor-trees", label: "Factor trees" },
  { id: "square-roots", label: "Square roots" },
  { id: "cube-roots", label: "Cube roots" },
  { id: "estimate-roots", label: "Estimate square and cube roots" },
  { id: "root-order-operations", label: "Order of operations with roots" },
  { id: "multiply-index-laws", label: "Index law: multiplying powers" },
  { id: "divide-index-laws", label: "Index law: dividing powers" },
  { id: "power-of-power", label: "Index law: power of a power" },
  { id: "zero-index", label: "Zero index" },
  { id: "mixed-index-laws", label: "Mixed index laws" }
];

const PRIME_NUMBERS = [2, 3, 5, 7, 11, 13];
const SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
const CUBES = [8, 27, 64, 125, 216, 343, 512, 729, 1000];

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

function randomId(prefix = "indices") {
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

function sup(value) {
  const map = {
    "-": "⁻",
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹"
  };

  return String(value).split("").map(ch => map[ch] ?? ch).join("");
}

function powText(base, exponent) {
  if (exponent === 1) return String(base);
  return `${base}${sup(exponent)}`;
}

function expandedPower(base, exponent) {
  return Array.from({ length: exponent }, () => String(base)).join(" × ");
}

function productText(values) {
  return values.join(" × ");
}

function primeFactors(n) {
  const factors = [];
  let x = n;
  let p = 2;

  while (p * p <= x) {
    while (x % p === 0) {
      factors.push(p);
      x /= p;
    }
    p += p === 2 ? 1 : 2;
  }

  if (x > 1) factors.push(x);
  return factors;
}

function factorCounts(factors) {
  const map = new Map();
  factors.forEach(factor => map.set(factor, (map.get(factor) || 0) + 1));
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

function factorisationIndexText(n) {
  return factorCounts(primeFactors(n))
    .map(([base, exponent]) => powText(base, exponent))
    .join(" × ");
}

function factorisationExpandedText(n) {
  return productText(primeFactors(n));
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

function indicesQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  space = SPACE_SIZES.MEDIUM
}) {
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
    tags: ["indices", type]
  });
}

/* -----------------------------
   Index notation and powers
----------------------------- */

function indexNotationQuestion() {
  const base = choice([2, 3, 4, 5, 6, 7, 8, 9]);
  const exponent = randInt(2, 5);
  const expanded = expandedPower(base, exponent);

  return indicesQuestion({
    type: "index-notation",
    marks: 1,
    prompt: `Write ${expanded} in index notation.`,
    answer: powText(base, exponent),
    working: [`The base is ${base} and it is repeated ${exponent} times.`, `${expanded} = ${powText(base, exponent)}`],
    space: SPACE_SIZES.SMALL
  });
}

function expandedIndexFormQuestion() {
  const base = choice([2, 3, 4, 5, 6, 7, 8, 9]);
  const exponent = randInt(2, 4);
  const value = base ** exponent;

  return indicesQuestion({
    type: "expanded-index-form",
    marks: 1,
    prompt: `Write ${powText(base, exponent)} in expanded form and evaluate it.`,
    answer: `${expandedPower(base, exponent)} = ${value}`,
    working: [`${powText(base, exponent)} means ${base} multiplied by itself ${exponent} times.`, `${expandedPower(base, exponent)} = ${value}`],
    space: SPACE_SIZES.SMALL
  });
}

function powersOfTenQuestion() {
  const mode = choice(["evaluate", "write", "multiply"]);
  const exponent = randInt(2, 6);
  const value = 10 ** exponent;

  if (mode === "evaluate") {
    return indicesQuestion({
      type: "powers-of-ten",
      marks: 1,
      prompt: `Evaluate ${powText(10, exponent)}.`,
      answer: String(value),
      working: [`${powText(10, exponent)} = ${value}`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "write") {
    return indicesQuestion({
      type: "powers-of-ten",
      marks: 1,
      prompt: `Write ${value} as a power of 10.`,
      answer: powText(10, exponent),
      working: [`${value} = ${powText(10, exponent)}`],
      space: SPACE_SIZES.SMALL
    });
  }

  const multiplier = randInt(2, 9);
  return indicesQuestion({
    type: "powers-of-ten",
    marks: 1,
    prompt: `Write ${multiplier} × ${powText(10, exponent)} as a whole number.`,
    answer: String(multiplier * value),
    working: [`${multiplier} × ${value} = ${multiplier * value}`],
    space: SPACE_SIZES.SMALL
  });
}

function orderOfOperationsIndicesQuestion() {
  const a = choice([2, 3, 4, 5]);
  const exp = choice([2, 3]);
  const multiplier = randInt(2, 6);
  const add = randInt(2, 12);
  const value = a ** exp;
  const answer = value * multiplier + add;

  return indicesQuestion({
    type: "order-of-operations-indices",
    marks: 2,
    prompt: `Evaluate ${powText(a, exp)} × ${multiplier} + ${add}.`,
    answer: String(answer),
    working: [
      `Evaluate the index first: ${powText(a, exp)} = ${value}.`,
      `${value} × ${multiplier} + ${add} = ${answer}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Divisibility and prime factors
----------------------------- */

function divisibilityTestsQuestion() {
  const divisors = [2, 3, 4, 5, 6, 10];
  const divisor = choice(divisors);
  let number;
  let divisible;

  if (Math.random() < 0.55) {
    const multiplier = randInt(12, 95);
    number = divisor * multiplier;
    divisible = true;
  } else {
    number = randInt(100, 999);
    divisible = number % divisor === 0;
    if (divisible) number += 1;
    divisible = false;
  }

  return indicesQuestion({
    type: "divisibility-tests",
    marks: 2,
    prompt: `Is ${number} divisible by ${divisor}? Give a reason.`,
    answer: divisible ? "Yes" : "No",
    working: [divisibilityReason(number, divisor, divisible)],
    space: SPACE_SIZES.MEDIUM
  });
}

function divisibilityReason(number, divisor, divisible) {
  if (divisor === 2) return divisible ? `${number} is even.` : `${number} is not even.`;
  if (divisor === 3) {
    const sum = String(number).split("").reduce((total, digit) => total + Number(digit), 0);
    return divisible
      ? `The digit sum is ${sum}, which is divisible by 3.`
      : `The digit sum is ${sum}, which is not divisible by 3.`;
  }
  if (divisor === 4) {
    const lastTwo = number % 100;
    return divisible
      ? `The last two digits form ${lastTwo}, which is divisible by 4.`
      : `The last two digits form ${lastTwo}, which is not divisible by 4.`;
  }
  if (divisor === 5) return divisible ? `${number} ends in 0 or 5.` : `${number} does not end in 0 or 5.`;
  if (divisor === 6) return divisible ? `${number} is divisible by both 2 and 3.` : `${number} is not divisible by both 2 and 3.`;
  return divisible ? `${number} ends in 0.` : `${number} does not end in 0.`;
}

function primeFactorisationQuestion() {
  const number = choice([36, 42, 48, 54, 60, 72, 84, 90, 96, 108, 126, 132]);

  return indicesQuestion({
    type: "prime-factorisation",
    marks: 2,
    prompt: `Write ${number} as a product of prime factors.`,
    answer: factorisationExpandedText(number),
    working: [`Divide by prime numbers until all factors are prime.`, `${number} = ${factorisationExpandedText(number)}`],
    space: SPACE_SIZES.MEDIUM
  });
}

function primeFactorisationIndexQuestion() {
  const number = choice([72, 84, 90, 96, 108, 120, 126, 144, 180, 216, 240, 360]);

  return indicesQuestion({
    type: "prime-factorisation-index",
    marks: 2,
    prompt: `Write ${number} as a product of prime factors using index notation.`,
    answer: factorisationIndexText(number),
    working: [`Prime factors: ${factorisationExpandedText(number)}`, `${number} = ${factorisationIndexText(number)}`],
    space: SPACE_SIZES.MEDIUM
  });
}

function factorTreesQuestion() {
  const number = choice([36, 48, 60, 72, 84, 90, 96, 108, 120, 144]);

  return indicesQuestion({
    type: "factor-trees",
    marks: 2,
    prompt: `Complete the factor tree for ${number}, then write ${number} as a product of prime factors using index notation.`,
    diagram: {
      engine: "indices-engine",
      config: {
        diagramType: "factor-tree",
        number,
        mode: "student",
        hideLeafValues: true
      }
    },
    answer: factorisationIndexText(number),
    working: [
      `Complete the factor tree until each branch ends in a prime number.`,
      `The prime factorisation is ${number} = ${factorisationIndexText(number)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Roots
----------------------------- */

function squareRootsQuestion() {
  const square = choice(SQUARES);
  const root = Math.sqrt(square);

  return indicesQuestion({
    type: "square-roots",
    marks: 1,
    prompt: `Evaluate √${square}.`,
    answer: String(root),
    working: [`${root}² = ${square}, so √${square} = ${root}.`],
    space: SPACE_SIZES.SMALL
  });
}

function cubeRootsQuestion() {
  const cube = choice(CUBES);
  const root = Math.round(Math.cbrt(cube));

  return indicesQuestion({
    type: "cube-roots",
    marks: 1,
    prompt: `Evaluate ∛${cube}.`,
    answer: String(root),
    working: [`${root}³ = ${cube}, so ∛${cube} = ${root}.`],
    space: SPACE_SIZES.SMALL
  });
}

function estimateRootsQuestion() {
  const squareMode = Math.random() < 0.6;

  if (squareMode) {
    let n = randInt(20, 180);
    while (Number.isInteger(Math.sqrt(n))) n = randInt(20, 180);

    const lower = Math.floor(Math.sqrt(n));
    const upper = lower + 1;

    return indicesQuestion({
      type: "estimate-roots",
      marks: 1,
      prompt: `Estimate √${n} by identifying the two whole numbers it lies between.`,
      answer: `Between ${lower} and ${upper}`,
      working: [`${lower}² = ${lower * lower} and ${upper}² = ${upper * upper}.`, `√${n} lies between ${lower} and ${upper}.`],
      space: SPACE_SIZES.SMALL
    });
  }

  let n = randInt(30, 300);
  while (Number.isInteger(Math.cbrt(n))) n = randInt(30, 300);

  const lower = Math.floor(Math.cbrt(n));
  const upper = lower + 1;

  return indicesQuestion({
    type: "estimate-roots",
    marks: 1,
    prompt: `Estimate ∛${n} by identifying the two whole numbers it lies between.`,
    answer: `Between ${lower} and ${upper}`,
    working: [`${lower}³ = ${lower ** 3} and ${upper}³ = ${upper ** 3}.`, `∛${n} lies between ${lower} and ${upper}.`],
    space: SPACE_SIZES.SMALL
  });
}

function rootOrderOperationsQuestion() {
  const square = choice([16, 25, 36, 49, 64, 81, 100, 121, 144]);
  const cube = choice([8, 27, 64, 125, 216]);
  const rootSquare = Math.sqrt(square);
  const rootCube = Math.round(Math.cbrt(cube));
  const add = randInt(2, 10);
  const answer = rootSquare + rootCube * add;

  return indicesQuestion({
    type: "root-order-operations",
    marks: 2,
    prompt: `Evaluate √${square} + ∛${cube} × ${add}.`,
    answer: String(answer),
    working: [`√${square} = ${rootSquare} and ∛${cube} = ${rootCube}.`, `${rootSquare} + ${rootCube} × ${add} = ${answer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Index laws
----------------------------- */

function multiplyIndexLawsQuestion() {
  const base = choice([2, 3, 4, 5, 6, 7]);
  const a = randInt(2, 5);
  const b = randInt(2, 5);
  const answerExp = a + b;

  return indicesQuestion({
    type: "multiply-index-laws",
    marks: 1,
    prompt: `Simplify ${powText(base, a)} × ${powText(base, b)}.`,
    answer: powText(base, answerExp),
    working: [`When multiplying powers with the same base, add the indices.`, `${a} + ${b} = ${answerExp}`],
    space: SPACE_SIZES.SMALL
  });
}

function divideIndexLawsQuestion() {
  const base = choice([2, 3, 4, 5, 6, 7]);
  const b = randInt(2, 5);
  const a = b + randInt(2, 5);
  const answerExp = a - b;

  return indicesQuestion({
    type: "divide-index-laws",
    marks: 1,
    prompt: `Simplify ${powText(base, a)} ÷ ${powText(base, b)}.`,
    answer: powText(base, answerExp),
    working: [`When dividing powers with the same base, subtract the indices.`, `${a} − ${b} = ${answerExp}`],
    space: SPACE_SIZES.SMALL
  });
}

function powerOfPowerQuestion() {
  const base = choice([2, 3, 4, 5, 6]);
  const a = randInt(2, 4);
  const b = randInt(2, 4);
  const answerExp = a * b;

  return indicesQuestion({
    type: "power-of-power",
    marks: 1,
    prompt: `Simplify (${powText(base, a)})${sup(b)}.`,
    answer: powText(base, answerExp),
    working: [`For a power of a power, multiply the indices.`, `${a} × ${b} = ${answerExp}`],
    space: SPACE_SIZES.SMALL
  });
}

function zeroIndexQuestion() {
  const base = choice([2, 3, 4, 5, 6, 7, 8, 9, 10]);

  return indicesQuestion({
    type: "zero-index",
    marks: 1,
    prompt: `Evaluate ${powText(base, 0)}.`,
    answer: "1",
    working: [`Any non-zero number to the power of zero equals 1.`, `${powText(base, 0)} = 1`],
    space: SPACE_SIZES.SMALL
  });
}

function mixedIndexLawsQuestion() {
  const base = choice([2, 3, 4, 5]);
  const a = randInt(2, 5);
  const b = randInt(2, 5);
  const c = randInt(1, 3);
  const answerExp = a + b - c;

  return indicesQuestion({
    type: "mixed-index-laws",
    marks: 2,
    prompt: `Simplify ${powText(base, a)} × ${powText(base, b)} ÷ ${powText(base, c)}.`,
    answer: powText(base, answerExp),
    working: [`Add indices when multiplying and subtract when dividing.`, `${a} + ${b} − ${c} = ${answerExp}`],
    space: SPACE_SIZES.MEDIUM
  });
}

const GENERATORS = {
  "index-notation": indexNotationQuestion,
  "expanded-index-form": expandedIndexFormQuestion,
  "powers-of-ten": powersOfTenQuestion,
  "order-of-operations-indices": orderOfOperationsIndicesQuestion,
  "divisibility-tests": divisibilityTestsQuestion,
  "prime-factorisation": primeFactorisationQuestion,
  "prime-factorisation-index": primeFactorisationIndexQuestion,
  "factor-trees": factorTreesQuestion,
  "square-roots": squareRootsQuestion,
  "cube-roots": cubeRootsQuestion,
  "estimate-roots": estimateRootsQuestion,
  "root-order-operations": rootOrderOperationsQuestion,
  "multiply-index-laws": multiplyIndexLawsQuestion,
  "divide-index-laws": divideIndexLawsQuestion,
  "power-of-power": powerOfPowerQuestion,
  "zero-index": zeroIndexQuestion,
  "mixed-index-laws": mixedIndexLawsQuestion
};

export function getIndicesQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateIndicesQuestions({ count = 8, allowedTypes = null } = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]());
}
