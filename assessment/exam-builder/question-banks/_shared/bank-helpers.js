/*
  Mills Maths Tools — shared helpers for the Stage 4 banks added in 2026-09
  -------------------------------------------------------------------------
  question-banks/_shared/bank-helpers.js

  The older banks each carry their own copy of randInt / choice / shuffle /
  makeBalancedPlan. The five banks that completed Stage 4 (Volume, Properties
  of Geometrical Figures, Data Classification and Visualisation, Data
  Analysis, Probability) share this one file instead, so a fix lands once.

  Nothing here generates mathematics; it is plumbing and formatting.
*/

import { createQuestion, SPACE_SIZES } from "../../schemas/question.schema.js";
import { attachQuestionTranslations } from "../../utils/translation.js";

export { SPACE_SIZES };

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function choice(items) {
  return items[randInt(0, items.length - 1)];
}

export function shuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* n distinct items from a list. */
export function sample(items, n) {
  return shuffle(items).slice(0, n);
}

export function randomId(prefix = "s4") {
  return (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/* Thousands spaced like the rest of the paper: 12 500, not 12500. */
export function spaced(n) {
  const [whole, dec] = String(n).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec !== undefined ? `${grouped}.${dec}` : grouped;
}

/* Round to dp places and drop trailing zeros: 12.50 → "12.5", 7.00 → "7". */
export function fmt(value, dp = 2) {
  const r = Number(Number(value).toFixed(dp));
  return spaced(String(r));
}

/* Fixed decimal places, kept: 3.1 at 2 dp → "3.10". */
export function fixed(value, dp = 1) {
  return spaced(Number(value).toFixed(dp));
}

/* A fraction as the renderer's stacked token, simplified unless told not to. */
export function frac(n, d, simplify = true) {
  if (d === 0) return "undefined";
  if (n === 0) return "0";
  const g = simplify ? gcd(n, d) : 1;
  const nn = n / g;
  const dd = d / g;
  if (dd === 1) return String(nn);
  return `[[frac:${nn}:${dd}]]`;
}

/* Simplified fraction as plain text, for working lines. */
export function fracText(n, d) {
  const g = gcd(n, d);
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}

export function plural(n, word, pluralWord = `${word}s`) {
  return `${n} ${n === 1 ? word : pluralWord}`;
}

export function capitalise(s) {
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

/*
  createQuestion drops any field its schema does not name, so extras that the
  pipeline understands (mcDistractors) are attached after it has validated.
*/
export function makeQuestion(topic, spec) {
  const { mcDistractors, ...rest } = spec;
  const q = createQuestion({
    id: randomId(),
    topic,
    level: "mixed",
    ...rest
  });
  if (Array.isArray(mcDistractors)) {
    q.mcDistractors = [...new Set(mcDistractors.filter(d => d !== null && d !== undefined).map(String))]
      .filter(d => d.trim() !== "" && d !== String(q.answer));
  }
  return q;
}

export function makeBalancedPlan(typeIds, count) {
  const plan = [];
  let i = 0;
  while (plan.length < count) {
    plan.push(typeIds[i % typeIds.length]);
    i += 1;
  }
  return shuffle(plan);
}

/*
  The one generate() every bank exports, parameterised by its registry. Same
  contract as the older banks: allowedTypes === null means every type, an
  explicit empty array means none.
*/
export function generateFromRegistry({ typeList, generators, count = 6, allowedTypes = null }) {
  const allowed = Array.isArray(allowedTypes)
    ? [...new Set(allowedTypes)].filter(type => generators[type])
    : null;
  const typeIds = allowed === null ? typeList.map(t => t.id) : allowed;
  if (!typeIds.length || count < 1) return [];

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];
  let safety = 0;
  while (questions.length < count && safety < count * 30) {
    const type = plan[questions.length % plan.length];
    const generator = generators[type];
    if (generator) {
      const q = generator();
      if (q) questions.push(q);
    }
    safety += 1;
  }
  return questions.map(attachQuestionTranslations);
}
