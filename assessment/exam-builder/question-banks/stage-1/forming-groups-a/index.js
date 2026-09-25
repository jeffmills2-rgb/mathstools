/*
  Mills Maths Tools — Stage 1 Question Bank: Equal Groups (A)
  ------------------------------------------------------------
  question-banks/stage-1/forming-groups-a/index.js

  NSW Mathematics K–10 (2022), Stage 1, Forming groups A — MA1-FG-01.

  Big ideas:
    - EQUAL groups have the same number in each group;
    - we can count equal groups quickly by skip counting (2s, 5s, 10s);
    - SHARING deals items out one at a time until they are gone;
    - half means two equal groups.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, pic, makeStage1, ICONS, nameOf, randInt, choice } from "../../_shared/stage1-helpers.js";

const TOPIC = "Equal Groups A";
const q = makeStage1(TOPIC, "MA1-FG-01");

const TYPE_LIST = [
  { id: "equal-or-not", label: "Are the groups equal?" },
  { id: "groups-of", label: "How many groups? How many in each?" },
  { id: "groups-total", label: "Equal groups: how many altogether?" },
  { id: "skip-count-pictures", label: "Skip count the pictures" },
  { id: "share", label: "Share equally" },
  { id: "half-collection", label: "Half of a group of objects" },
  { id: "rows", label: "Rows: how many altogether?" },
  { id: "pairs", label: "How many pairs?" },
  { id: "make-groups", label: "Make groups of" }
];

function equalOrNotQuestion() {
  const g = randInt(2, 4); const e = randInt(2, 5); const equal = Math.random() < 0.5;
  const sizes = Array(g).fill(e); if (!equal) sizes[randInt(0, g - 1)] += choice([-1, 1]);
  return q({ type: "equal-or-not", marks: 1, prompt: "Are the groups equal? Yes or no?", diagram: mani({ diagramType: "groups", sizes, item: choice(["dot", "star"]) }), answer: equal ? "Yes" : "No", working: [equal ? `Each group has ${e}.` : `The groups have ${sizes.join(", ")}.`], space: SPACE_SIZES.SMALL, mcDistractors: [equal ? "No" : "Yes"], tags: ["equal groups"] });
}

function groupsOfQuestion() {
  const g = randInt(2, 5); const e = randInt(2, 5); if (g === e) return groupsOfQuestion();
  return q({ type: "groups-of", marks: 1, prompt: "How many groups? How many in each group?", diagram: mani({ diagramType: "groups", groups: g, each: e, item: choice(["dot", "star"]) }), answer: `${g} groups of ${e}`, working: ["Count the circles, then the dots in one circle."], space: SPACE_SIZES.SMALL, mcDistractors: [`${e} groups of ${g}`, `${g} groups of ${g * e}`], tags: ["equal groups"] });
}

function groupsTotalQuestion() {
  const e = choice([2, 5, 10, 2, 5]); const g = randInt(2, e === 10 ? 4 : 5);
  return q({ type: "groups-total", marks: 1, prompt: `${g} groups of ${e}. How many altogether?`, diagram: mani({ diagramType: "groups", groups: g, each: e }), answer: String(g * e), working: [`Count by ${e}s: ${Array.from({ length: g }, (_, i) => (i + 1) * e).join(", ")}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(g + e), String(g * e + e), String(g * e - 1)], tags: ["skip counting"] });
}

function skipCountPicturesQuestion() {
  const e = choice([2, 5, 10]); const rows = randInt(2, e === 10 ? 4 : 5); const item = choice(ICONS);
  return q({ type: "skip-count-pictures", marks: 1, prompt: `Count by ${e}s. How many ${nameOf(item, 2)}?`, diagram: pic(rows * e, item, { perRow: e }), answer: String(rows * e), working: [`${Array.from({ length: rows }, (_, i) => (i + 1) * e).join(", ")}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(rows * e + e), String(rows * e - e), String(rows + e)], tags: ["skip counting"] });
}

function shareQuestion() {
  const g = choice([2, 3, 4]); const e = randInt(2, 5); const item = choice(["apple", "star", "ball", "cup"]);
  return q({ type: "share", marks: 1, prompt: `Share ${g * e} ${nameOf(item, 2)} into ${g} groups. How many in each?`, diagram: pic(g * e, item), answer: String(e), working: ["Deal them out one at a time.", `Each group gets ${e}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(e + 1), String(g), String(g * e)].filter(x => x !== String(e)), tags: ["sharing"] });
}

function halfCollectionQuestion() {
  const h = randInt(2, 8); const item = choice(ICONS);
  return q({ type: "half-collection", marks: 1, prompt: `What is half of ${2 * h}?`, diagram: pic(2 * h, item, { perRow: h }), answer: String(h), working: ["Half means 2 equal groups.", `${h} + ${h} = ${2 * h}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(2 * h), String(h + 1), String(h - 1)].filter(x => x !== "0"), tags: ["half"] });
}

function rowsQuestion() {
  const r = randInt(2, 4); const c = randInt(2, 6);
  return q({ type: "rows", marks: 1, prompt: `${r} rows of ${c}. How many altogether?`, diagram: mani({ diagramType: "array", rows: r, cols: c }), answer: String(r * c), working: [`Count by ${c}s: ${Array.from({ length: r }, (_, i) => (i + 1) * c).join(", ")}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(r + c), String(r * c + c), String(r * c - 1)], tags: ["rows", "arrays"] });
}

function pairsQuestion() {
  const p = randInt(2, 8); const item = choice(["heart", "star", "fish", "bird"]);
  return q({ type: "pairs", marks: 1, prompt: `A pair is 2. How many pairs of ${nameOf(item, 2)}?`, diagram: pic(2 * p, item, { perRow: 2 * p > 10 ? 6 : 2 * p }), answer: String(p), working: [`Count by 2s: ${Array.from({ length: p }, (_, i) => (i + 1) * 2).join(", ")} — ${p} pairs.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(2 * p), String(p + 1), String(p - 1)].filter(x => x !== "0"), tags: ["pairs"] });
}

function makeGroupsQuestion() {
  const e = choice([2, 3, 5]); const g = randInt(2, 5); const item = choice(ICONS);
  return q({ type: "make-groups", marks: 1, prompt: `Circle groups of ${e}. How many groups?`, diagram: pic(g * e, item, { perRow: Math.min(10, g * e) }), answer: String(g), working: [`Count by ${e}s to ${g * e}: ${g} groups.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(g * e), String(e), String(g + 1)].filter(x => x !== String(g)), tags: ["grouping"] });
}

const GENERATORS = {
  "equal-or-not": equalOrNotQuestion,
  "groups-of": groupsOfQuestion,
  "groups-total": groupsTotalQuestion,
  "skip-count-pictures": skipCountPicturesQuestion,
  "share": shareQuestion,
  "half-collection": halfCollectionQuestion,
  "rows": rowsQuestion,
  "pairs": pairsQuestion,
  "make-groups": makeGroupsQuestion
};

export function getFormingGroupsAQuestionTypes() { return TYPE_LIST; }
export function generateFormingGroupsAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
