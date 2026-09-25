/*
  Mills Maths Tools — Stage 1 shared helpers
  -------------------------------------------
  question-banks/_shared/stage1-helpers.js

  Stage 1 banks reuse the Stage 2 diagram builders and number words, and add:
    - makeStage1(topic, outcome): tags every question "stage1" + outcome;
    - pic(...) / tf(...) / dice(...) shorthands for the Stage 1 models;
    - ICONS and plural names for the picture collections;
    - numOptions(answer, near): a set of short numeric distractors.
*/

import { makeQuestion, randInt, choice, shuffle } from "./bank-helpers.js";
import { mani, measure, gridD, stats, probD, solidD, barD, onl, sp, words, distinct } from "./stage2-helpers.js";

export { mani, measure, gridD, stats, probD, solidD, barD, onl, sp, words, distinct, randInt, choice, shuffle };

export const ICONS = ["apple", "star", "ball", "fish", "car", "cup", "flower", "heart", "block", "leaf", "bird"];
export const PLURAL = { apple: "apples", star: "stars", ball: "balls", fish: "fish", car: "cars", cup: "cups", flower: "flowers", heart: "hearts", block: "blocks", leaf: "leaves", bird: "birds", pencil: "pencils" };
export const nameOf = (item, n) => (n === 1 ? item : PLURAL[item] || `${item}s`);

export const pic = (count, item, extra = {}) => mani({ diagramType: "objects", count, item, ...extra });
export const tf = (count, count2 = 0, extra = {}) => mani({ diagramType: "ten-frame", count, count2, ...extra });

/* Stage 1 question: tags. */
export function makeStage1(topic, outcome) {
  return spec => makeQuestion(topic, { ...spec, tags: ["stage1", outcome, ...(spec.tags || [])] });
}

/* Near-miss whole-number distractors (off by one, off by ten, reversed). */
export function numOptions(ans, { min = 0, ten = true } = {}) {
  const out = new Set([ans + 1, ans - 1]);
  if (ten && ans >= 10) out.add(ans + 10);
  const r = Number(String(ans).split("").reverse().join(""));
  if (ans >= 10 && r !== ans) out.add(r);
  out.delete(ans);
  return [...out].filter(v => v >= min).slice(0, 3).map(String);
}
