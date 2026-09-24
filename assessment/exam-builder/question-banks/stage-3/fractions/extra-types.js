/*
  Mills Maths Tools — Stage 3 Fractions: the visual types
  ---------------------------------------------------------
  question-banks/stage-3/fractions/extra-types.js

  MA3-RQF-01/02 are taught with fraction bars and collections of objects;
  the original bank uses them for naming and equivalence. These types carry
  the same models into comparing, adding, fractions greater than one and
  fractions of a collection:

    - compare two fractions drawn as bars of the same whole
    - add two fractions (same or related denominators) shown as bars
    - fractions greater than one: bars → mixed numeral and improper fraction
    - a fraction of a collection, using the drawn counters

  Diagrams: fdp-engine `equivalent-bars` (one bar per fraction, same length)
  and `fraction-of-set`. Denominators stay within 2, 3, 4, 5, 6, 8 and 10 (MA3-RQF-01).
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, gcd
} from "../../_shared/bank-helpers.js";

const TOPIC = "Fractions";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const f = (n, d) => `[[frac:${n}:${d}]]`;
const bars = fracs => ({ engine: "fdp-engine", config: { diagramType: "equivalent-bars", fracs } });
const simp = (n, d) => { const g = gcd(n, d); return f(n / g, d / g); };

export const EXTRA_FRACTION_TYPES = [
  { id: "compare-with-bars", label: "Compare fractions using bars" },
  { id: "add-with-bars", label: "Add fractions using bars" },
  { id: "mixed-numerals-bars", label: "Fractions greater than one (bars)" },
  { id: "fraction-of-collection", label: "A fraction of a collection (counters)" }
];

const RELATED = [[2, 4], [2, 6], [2, 8], [2, 10], [3, 6], [4, 8], [5, 10]];

function compareWithBarsQuestion() {
  const v = choice(["related", "same-numerator"]);
  let a; let b;
  if (v === "related") {
    const [d1, d2] = choice(RELATED);
    do { a = { n: randInt(1, d1 - 1), d: d1 }; b = { n: randInt(1, d2 - 1), d: d2 }; } while (a.n * d2 === b.n * d1);
  } else {
    const n = randInt(1, 3);
    const ds = shuffle([3, 4, 5, 6, 8, 10].filter(d => d > n)).slice(0, 2);
    a = { n, d: ds[0] }; b = { n, d: ds[1] };
  }
  const bigger = a.n / a.d > b.n / b.d ? a : b;
  return q({
    type: "compare-with-bars", marks: 1,
    prompt: `The bars show ${f(a.n, a.d)} and ${f(b.n, b.d)} of the same whole. Which fraction is larger?`,
    diagram: bars([a, b]),
    answer: f(bigger.n, bigger.d),
    working: v === "related"
      ? [`Rename so the denominators match: ${f(a.n, a.d)} = ${f(a.n * (b.d / a.d), b.d)}`, `Compare ${f(a.n * (b.d / a.d), b.d)} with ${f(b.n, b.d)}: the bar with more shaded is ${f(bigger.n, bigger.d)}.`]
      : ["The numerators are the same, so compare the size of the parts: fewer parts means bigger parts.", `${f(bigger.n, bigger.d)} is larger.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [f((bigger === a ? b : a).n, (bigger === a ? b : a).d), "They are equal"],
    tags: ["fractions", "comparing", "diagram"]
  });
}

function addWithBarsQuestion() {
  const related = Math.random() < 0.5;
  let a; let b; let d;
  if (!related) {
    d = choice([4, 5, 6, 8, 10]);
    const n1 = randInt(1, d - 2); const n2 = randInt(1, d - n1 - 1 || 1);
    a = { n: n1, d }; b = { n: n2, d };
  } else {
    const [d1, d2] = choice(RELATED);
    d = d2;
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, Math.max(1, d2 - n1 * (d2 / d1) - 1));
    a = { n: n1, d: d1 }; b = { n: n2, d: d2 };
  }
  const total = a.n * (d / a.d) + b.n * (d / b.d);
  if (total >= d) return addWithBarsQuestion();
  return q({
    type: "add-with-bars", marks: related ? 2 : 1,
    prompt: `Use the bars to find ${f(a.n, a.d)} + ${f(b.n, b.d)}.`,
    diagram: bars([a, b]),
    answer: f(total, d),
    working: related
      ? [`${f(a.n, a.d)} = ${f(a.n * (d / a.d), d)}`, `${f(a.n * (d / a.d), d)} + ${f(b.n, b.d)} = ${f(total, d)}`]
      : [`Same denominator: add the numerators. ${a.n} + ${b.n} = ${total}`, `${f(total, d)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [f(a.n + b.n, a.d + b.d), f(a.n + b.n, d), f(total + 1, d), f(total, 2 * d)],
    tags: ["fractions", "addition", "diagram"]
  });
}

function mixedNumeralsBarsQuestion() {
  const d = choice([2, 3, 4, 5, 6, 8]);
  const whole = randInt(1, 2);
  const n = randInt(1, d - 1);
  const improper = whole * d + n;
  const list = [...Array(whole).fill({ n: d, d }), { n, d }];
  // The last bar is only partly shaded; draw a fourth empty bar sometimes so
  // the count of wholes has to be read, not assumed from the number of bars.
  return q({
    type: "mixed-numerals-bars", marks: 2,
    prompt: "Each bar is one whole. Write the shaded amount as a mixed numeral and as an improper fraction.",
    diagram: bars(list),
    answer: `${whole} ${f(n, d)} = ${f(improper, d)}`,
    working: [`${whole} whole ${whole === 1 ? "bar" : "bars"} and ${f(n, d)} of another: ${whole} ${f(n, d)}`, `Each whole is ${d} ${d === 2 ? "halves" : "parts"}: ${whole} × ${d} + ${n} = ${improper}, so ${f(improper, d)}`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["fractions", "mixed numerals", "improper fractions", "diagram"]
  });
}

function fractionOfCollectionQuestion() {
  const d = choice([2, 3, 4, 5, 6]);
  const n = randInt(1, d - 1);
  const per = randInt(2, d <= 3 ? 6 : 4);
  const total = d * per;
  return q({
    type: "fraction-of-collection", marks: 1,
    prompt: `There are ${total} counters. What is ${f(n, d)} of ${total}? Use the counters to help.`,
    diagram: { engine: "fdp-engine", config: { diagramType: "fraction-of-set", total, shaded: 0, cols: per <= 10 ? per : 6 } },
    answer: String(n * per),
    working: [`Split the ${total} counters into ${d} equal groups of ${per}.`, `${n} ${n === 1 ? "group is" : "groups are"} ${n} × ${per} = ${n * per}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(per), String(total - n * per), String(total / n), String(n * d)].filter(x => x !== String(n * per) && !x.includes(".")),
    tags: ["fractions", "fraction of a quantity", "diagram"]
  });
}

export const EXTRA_FRACTION_GENERATORS = {
  "compare-with-bars": compareWithBarsQuestion,
  "add-with-bars": addWithBarsQuestion,
  "mixed-numerals-bars": mixedNumeralsBarsQuestion,
  "fraction-of-collection": fractionOfCollectionQuestion
};
