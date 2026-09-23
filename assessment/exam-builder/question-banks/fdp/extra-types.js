/*
  Mills Maths Tools — Fractions, Decimals and Percentages: added types
  ---------------------------------------------------------------------
  question-banks/fdp/extra-types.js

  Three parts of MA4-FRC-C-01 the original bank did not ask about:

    - terminating and recurring decimals, and dot notation for the
      repeating block (0.3̇, 0.1̇6̇ for the block "16" …)
    - expressing one quantity as a percentage of another, including when
      the quantities must first be put into the same unit
    - profit and loss, as an amount and as a percentage of the cost price

  Appended to the bank's registry by index.js. tools/stage4-fdp-extra.mjs
  re-derives every answer by its own long division and arithmetic.
*/

import { SPACE_SIZES, randInt, choice, makeQuestion, gcd, fmt, spaced } from "../_shared/bank-helpers.js";

const TOPIC = "Fractions, Decimals and Percentages";
const q = spec => makeQuestion(TOPIC, spec);
const DOT = "̇";

export const EXTRA_FDP_TYPES = [
  { id: "recurring-decimals", label: "Terminating and recurring decimals" },
  { id: "quantity-as-percentage", label: "One quantity as a percentage of another" },
  { id: "profit-and-loss", label: "Profit and loss" }
];

/*
  Long division of n/d: the non-repeating digits after the point and the
  repeating block (empty when the decimal terminates).
*/
export function decimalExpansion(n, d) {
  const whole = Math.floor(n / d);
  let r = n % d;
  const seen = new Map();
  let digits = "";
  while (r !== 0 && !seen.has(r)) {
    seen.set(r, digits.length);
    r *= 10;
    digits += String(Math.floor(r / d));
    r %= d;
  }
  if (r === 0) return { whole, fixed: digits, block: "" };
  const start = seen.get(r);
  return { whole, fixed: digits.slice(0, start), block: digits.slice(start) };
}

/* Dot notation: one dot for a one-digit block, dots on the first and last
   digits of a longer block. */
export function dotNotation({ whole, fixed, block }) {
  if (!block) return `${whole}.${fixed}`;
  const dotted = block.length === 1
    ? block + DOT
    : block[0] + DOT + block.slice(1, -1) + block[block.length - 1] + DOT;
  return `${whole}.${fixed}${dotted}`;
}

function terminates(d) {
  let x = d;
  while (x % 2 === 0) x /= 2;
  while (x % 5 === 0) x /= 5;
  return x === 1;
}

const RECURRING_FRACS = [[1, 3], [2, 3], [1, 6], [5, 6], [1, 9], [4, 9], [7, 9], [1, 11], [3, 11], [5, 12], [7, 12], [1, 15], [4, 15], [2, 7], [1, 7], [5, 18], [7, 30], [13, 33]];
const TERMINATING_FRACS = [[1, 4], [3, 8], [7, 20], [9, 25], [3, 16], [11, 40], [7, 50], [13, 20]];

function recurringDecimalsQuestion() {
  const variant = choice(["convert", "convert", "which-kind", "write-dots"]);
  if (variant === "convert") {
    const [n, d] = choice(RECURRING_FRACS);
    const exp = decimalExpansion(n, d);
    const ans = dotNotation(exp);
    return q({
      type: "recurring-decimals", marks: 2,
      prompt: `Write [[frac:${n}:${d}]] as a decimal, using dot notation for the repeating digits.`,
      answer: ans,
      working: [`Divide ${n} by ${d}: ${exp.whole}.${exp.fixed}${exp.block.repeat(3)}…`, `The block "${exp.block}" repeats, so ${n}/${d} = ${ans}`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["decimals", "recurring"]
    });
  }
  if (variant === "which-kind") {
    const rec = Math.random() < 0.5;
    const [n, d] = choice(rec ? RECURRING_FRACS : TERMINATING_FRACS);
    const g = gcd(n, d);
    return q({
      type: "recurring-decimals", marks: 1,
      prompt: `Is [[frac:${n}:${d}]] a terminating or a recurring decimal?`,
      answer: terminates(d / g) ? "Terminating" : "Recurring",
      working: [`${n}/${d} = ${dotNotation(decimalExpansion(n, d))}`, terminates(d / g) ? "The division ends, so it terminates." : "The digits repeat for ever, so it recurs."],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [terminates(d / g) ? "Recurring" : "Terminating", "Neither", "Both"],
      tags: ["decimals", "recurring", "terminating"]
    });
  }
  const [n, d] = choice(RECURRING_FRACS);
  const exp = decimalExpansion(n, d);
  const long = `${exp.whole}.${exp.fixed}${exp.block.repeat(exp.block.length > 2 ? 2 : 4)}…`;
  return q({
    type: "recurring-decimals", marks: 1,
    prompt: `Write ${long} using dot notation.`,
    answer: dotNotation(exp),
    working: [`The repeating block is "${exp.block}".`, dotNotation(exp)],
    space: SPACE_SIZES.SMALL,
    mcDistractors: exp.block.length > 1
      ? [
          `${exp.whole}.${exp.fixed}${exp.block}`,
          `${exp.whole}.${exp.fixed}${exp.block}${DOT}`,
          `${exp.whole}.${exp.fixed}${exp.block[0]}${DOT}${exp.block.slice(1)}`
        ]
      : [
          `${exp.whole}.${exp.fixed}${exp.block}`,
          `${exp.whole}.${exp.fixed}${exp.block}${exp.block}${DOT}`,
          exp.fixed ? `${exp.whole}.${exp.fixed}${DOT}${exp.block}` : `${exp.whole}.${exp.block}…`
        ],
    tags: ["decimals", "recurring", "notation"]
  });
}

const PERCENT_CONTEXTS = [
  () => { const t = choice([20, 25, 40, 50, 80]); const s = randInt(1, t - 1); return { p: `Mia scored ${s} out of ${t} on a test. What is her mark as a percentage?`, a: s / t * 100, w: [`${s}/${t} × 100%`] }; },
  () => { const whole = choice([60, 80, 120, 200, 250]); const part = whole * choice([5, 10, 15, 20, 25, 30, 40, 45, 60, 75]) / 100; return { p: `Express ${spaced(part)} as a percentage of ${spaced(whole)}.`, a: part / whole * 100, w: [`${spaced(part)}/${spaced(whole)} × 100%`] }; },
  () => { const mins = choice([15, 30, 45, 12, 36, 24]); const hrs = choice([1, 2, 3]); return { p: `Express ${mins} minutes as a percentage of ${hrs} hour${hrs > 1 ? "s" : ""}.`, a: mins / (hrs * 60) * 100, w: [`${hrs} h = ${hrs * 60} min`, `${mins}/${hrs * 60} × 100%`] }; },
  () => { const cm = choice([25, 40, 50, 75, 80, 120, 150]); const m = choice([1, 2, 4, 5]); return { p: `Express ${cm} cm as a percentage of ${m} m.`, a: cm / (m * 100) * 100, w: [`${m} m = ${m * 100} cm`, `${cm}/${m * 100} × 100%`] }; },
  () => { const g = choice([150, 250, 300, 400, 750]); const kg = choice([1, 2, 5]); return { p: `Express ${g} g as a percentage of ${kg} kg.`, a: g / (kg * 1000) * 100, w: [`${kg} kg = ${spaced(kg * 1000)} g`, `${g}/${spaced(kg * 1000)} × 100%`] }; },
  () => { const c = choice([30, 45, 60, 75, 90]); const d = choice([2, 3, 4, 5]); return { p: `What percentage of $${d} is ${c} cents?`, a: c / (d * 100) * 100, w: [`$${d} = ${d * 100} cents`, `${c}/${d * 100} × 100%`] }; },
  () => { const tot = choice([28, 30, 32, 26]); const girls = randInt(10, tot - 10); return { p: `A class has ${tot} students and ${girls} are girls. What percentage are girls? Give your answer to 1 decimal place.`, a: girls / tot * 100, w: [`${girls}/${tot} × 100%`], dp: 1 }; }
];

function quantityAsPercentageQuestion() {
  const c = choice(PERCENT_CONTEXTS)();
  const exact = Math.abs(c.a * 10 - Math.round(c.a * 10)) < 1e-9;
  if (!exact && c.dp === undefined) return quantityAsPercentageQuestion();
  const ans = `${c.dp ? Number(c.a).toFixed(1) : fmt(c.a, 1)}%`;
  return q({
    type: "quantity-as-percentage", marks: c.w.length > 1 ? 2 : 1,
    prompt: c.p,
    answer: ans,
    working: [...c.w, `= ${ans}`],
    space: c.w.length > 1 ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    tags: ["percentages", "quantity as a percentage"]
  });
}

function profitAndLossQuestion() {
  const variant = choice(["amount", "percent", "percent", "selling-price"]);
  const items = ["bike", "phone case", "skateboard", "painting", "surfboard", "laptop", "guitar"];
  const item = choice(items);
  const cost = choice([20, 40, 50, 80, 120, 150, 200, 250, 400, 800, 1200, 2500]);
  const pct = choice([5, 10, 12, 15, 20, 25, 30, 40, 50]);
  const profit = Math.random() < 0.65;
  const change = cost * pct / 100;
  const sell = profit ? cost + change : cost - change;
  const money = v => `$${spaced(Number(v).toFixed(2))}`;
  if (variant === "amount") {
    return q({
      type: "profit-and-loss", marks: 1,
      prompt: `A shop buys a ${item} for ${money(cost)} and sells it for ${money(sell)}. Find the ${profit ? "profit" : "loss"}.`,
      answer: money(change),
      working: [profit ? `Profit = selling price − cost price` : `Loss = cost price − selling price`, `${profit ? `${money(sell)} − ${money(cost)}` : `${money(cost)} − ${money(sell)}`} = ${money(change)}`],
      space: SPACE_SIZES.SMALL,
      tags: ["percentages", "profit and loss", "money"]
    });
  }
  if (variant === "percent") {
    return q({
      type: "profit-and-loss", marks: 2,
      prompt: `Josh bought a ${item} for ${money(cost)} and sold it for ${money(sell)}. Find his ${profit ? "profit" : "loss"} as a percentage of the cost price.`,
      answer: `${pct}% ${profit ? "profit" : "loss"}`,
      working: [`${profit ? "Profit" : "Loss"} = ${money(change)}`, `${money(change)} ÷ ${money(cost)} × 100% = ${pct}%`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["percentages", "profit and loss", "money"]
    });
  }
  return q({
    type: "profit-and-loss", marks: 2,
    prompt: `A retailer buys a ${item} for ${money(cost)}. At what price must it be sold to make a ${pct}% ${profit ? "profit" : "loss"}?`,
    answer: money(sell),
    working: [`${pct}% of ${money(cost)} = ${money(change)}`, `Selling price = ${money(cost)} ${profit ? "+" : "−"} ${money(change)} = ${money(sell)}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["percentages", "profit and loss", "money"]
  });
}

export const EXTRA_FDP_GENERATORS = {
  "recurring-decimals": recurringDecimalsQuestion,
  "quantity-as-percentage": quantityAsPercentageQuestion,
  "profit-and-loss": profitAndLossQuestion
};
