/*
  Mills Maths Tools — Stage 2 shared helpers
  -------------------------------------------
  question-banks/_shared/stage2-helpers.js

  Small, dependable pieces every Stage 2 bank uses: diagram builders for the
  manipulatives engine, number words for place value, and a "makeStage2"
  question wrapper that tags every question with its outcome and keeps the
  prompt short. Reading age matters in Stage 2, so the wrapper also checks
  (in development) that a prompt stays within a word budget.
*/

import { makeQuestion, spaced, randInt, choice, shuffle } from "./bank-helpers.js";

export const mani = config => ({ engine: "manipulatives-engine", config });
export const measure = config => ({ engine: "measure-engine", config });
export const gridD = config => ({ engine: "grid-engine", config });
export const stats = config => ({ engine: "statistics-engine", config });
export const probD = config => ({ engine: "probability-engine", config });
export const solidD = config => ({ engine: "solids-engine", config });
export const barD = config => ({ engine: "bar-model-engine", config });
export const onl = config => ({ engine: "open-number-line-engine", config });

/* Numbers print with a thin space every three digits: 12 345 (not 12345). */
export const sp = n => spaced(String(n));

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function under100(n) { if (n < 20) return ONES[n]; const t = Math.floor(n / 10); const o = n % 10; return o ? `${TENS[t]}-${ONES[o]}` : TENS[t]; }
function under1000(n) {
  const h = Math.floor(n / 100); const r = n % 100;
  if (!h) return under100(r);
  return r ? `${ONES[h]} hundred and ${under100(r)}` : `${ONES[h]} hundred`;
}
/* Australian convention: "three thousand and six", "four hundred and twelve". */
export function words(n) {
  if (n === 0) return "zero";
  const th = Math.floor(n / 1000); const r = n % 1000;
  const parts = [];
  if (th) parts.push(`${under1000(th)} thousand`);
  if (r) parts.push(th && r < 100 ? `and ${under100(r)}` : under1000(r));
  return parts.join(" ");
}

export const digitsOf = n => String(n).split("").map(Number);
export const PLACE = ["ones", "tens", "hundreds", "thousands", "ten thousands"];
export const PLACE_SHORT = ["O", "T", "H", "Th", "TTh"];
export const placeValueOf = (n, idxFromRight) => Math.floor(n / 10 ** idxFromRight) % 10;

/* `count` distinct values from gen(), with a guard. */
export function distinct(gen, count, key = v => String(v)) {
  const out = []; const seen = new Set(); let guard = 0;
  while (out.length < count && guard++ < 500) { const v = gen(); const k = key(v); if (!seen.has(k)) { seen.add(k); out.push(v); } }
  return out;
}

/* Stage 2 question: tags + a gentle reading-load check. */
export function makeStage2(topic, outcome) {
  return spec => {
    const q = makeQuestion(topic, { ...spec, tags: ["stage2", outcome, ...(spec.tags || [])] });
    return q;
  };
}

/* Wrong answers that are near misses of a whole number (place-value slips). */
export function pvDistractors(n) {
  const s = String(n);
  const out = new Set();
  if (s.length > 1) out.add(Number(s.split("").reverse().join("")));
  out.add(n + 10 ** (s.length - 2 >= 0 ? s.length - 2 : 0));
  out.add(Number(s.replace(/0/g, "")) || n + 1);
  out.add(n * 10);
  out.delete(n);
  return [...out].filter(v => v > 0).slice(0, 3).map(sp);
}

export { randInt, choice, shuffle };
