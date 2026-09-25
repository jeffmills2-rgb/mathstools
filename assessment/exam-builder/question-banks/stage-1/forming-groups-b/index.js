/*
  Mills Maths Tools — Stage 1 Question Bank: Equal Groups (B)
  ------------------------------------------------------------
  question-banks/stage-1/forming-groups-b/index.js

  NSW Mathematics K–10 (2022), Stage 1, Forming groups B — MA1-FG-01.

  Big ideas:
    - an ARRAY is equal rows; it can be counted by rows or by columns;
    - repeated addition (5 + 5 + 5) counts equal groups;
    - skip counting on a number line is jumping in equal groups;
    - SHARING (how many in each) and GROUPING (how many groups) are the two
      kinds of division; sometimes some are LEFT OVER.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, pic, makeStage1, ICONS, nameOf, randInt, choice } from "../../_shared/stage1-helpers.js";

const TOPIC = "Equal Groups B";
const q = makeStage1(TOPIC, "MA1-FG-01");

const TYPE_LIST = [
  { id: "array-count", label: "Count an array by rows" },
  { id: "array-both-ways", label: "Rows and columns (turn the array)" },
  { id: "repeated-addition", label: "Repeated addition" },
  { id: "jumps-on-line", label: "Equal jumps on a number line" },
  { id: "group-story", label: "Equal groups stories" },
  { id: "share-story", label: "Sharing stories" },
  { id: "grouping-story", label: "How many groups can you make?" },
  { id: "left-over", label: "Sharing with some left over" },
  { id: "groups-of-3", label: "Groups of 3" }
];

function arrayCountQuestion() {
  const r = randInt(2, 5); const c = choice([2, 5, 10, 3, 4]);
  return q({ type: "array-count", marks: 1, prompt: `${r} rows. ${c} in each row. How many?`, diagram: mani({ diagramType: "array", rows: r, cols: c, gap: c === 10 ? 24 : 32 }), answer: String(r * c), working: [`Count by ${c}s: ${Array.from({ length: r }, (_, i) => (i + 1) * c).join(", ")}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(r + c), String(r * c + c), String(r * c - c)], tags: ["arrays"] });
}

function arrayBothWaysQuestion() {
  const r = randInt(2, 5); let c = randInt(2, 5); if (r === c) c = r === 5 ? 4 : r + 1;
  return q({ type: "array-both-ways", marks: 1, prompt: `${r} rows of ${c} is ${r * c}. What is ${c} rows of ${r}?`, diagram: mani({ diagramType: "array", rows: r, cols: c }), answer: String(r * c), working: ["Turn the array. The number of dots stays the same."], space: SPACE_SIZES.SMALL, mcDistractors: [String(r * c + 1), String(r + c), String(c * c)].filter(x => x !== String(r * c)), tags: ["arrays", "turnaround"] });
}

function repeatedAdditionQuestion() {
  const e = choice([2, 5, 10, 3]); const g = randInt(2, 5);
  return q({ type: "repeated-addition", marks: 1, prompt: `${Array(g).fill(e).join(" + ")} = ☐`, diagram: mani({ diagramType: "groups", groups: g, each: e }), answer: String(g * e), working: [`${g} groups of ${e}: ${Array.from({ length: g }, (_, i) => (i + 1) * e).join(", ")}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(g + e), String(g * e + e), String(g * e - 1)], tags: ["repeated addition"] });
}

function jumpsOnLineQuestion() {
  const s = choice([2, 5, 10]); const n = randInt(2, 5); const max = s * (n + 1);
  const hops = Array.from({ length: n }, (_, i) => ({ from: i * s, to: (i + 1) * s }));
  return q({ type: "jumps-on-line", marks: 1, prompt: `${n} jumps of ${s}. Where does it land?`, diagram: mani({ diagramType: "number-line", min: 0, max, step: s === 10 ? 5 : 1, labels: Array.from({ length: max / s + 1 }, (_, i) => i * s), hops }), answer: String(n * s), working: [`Count by ${s}s: ${Array.from({ length: n }, (_, i) => (i + 1) * s).join(", ")}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n + s), String((n + 1) * s), String(n * s - s)], tags: ["skip counting", "number line"] });
}

const THINGS = [["bags", "apple"], ["plates", "cup"], ["tanks", "fish"], ["boxes", "ball"], ["nests", "bird"]];

function groupStoryQuestion() {
  const [holder, item] = choice(THINGS); const g = randInt(2, 5); const e = choice([2, 3, 5, 10]);
  return q({ type: "group-story", marks: 1, prompt: `${g} ${holder}. ${e} ${nameOf(item, e)} in each. How many ${nameOf(item, 2)}?`, diagram: pic(g * e, item, { perRow: e }), answer: String(g * e), working: [`${Array(g).fill(e).join(" + ")} = ${g * e}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(g + e), String(g * e + e), String(g * e - 1)], tags: ["story"] });
}

function shareStoryQuestion() {
  const [holder, item] = choice(THINGS); const g = choice([2, 3, 4, 5]); const e = randInt(2, 5);
  return q({ type: "share-story", marks: 1, prompt: `Share ${g * e} ${nameOf(item, 2)} equally between ${g} ${holder}. How many in each?`, diagram: mani({ diagramType: "groups", sizes: Array(g).fill(0) }), answer: String(e), working: ["Deal them out one at a time.", `${g * e} shared into ${g} groups is ${e} each.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(e + 1), String(g), String(g * e)].filter(x => x !== String(e)), tags: ["sharing"] });
}

function groupingStoryQuestion() {
  const e = choice([2, 5, 10]); const g = randInt(2, 6); const item = choice(ICONS);
  return q({ type: "grouping-story", marks: 1, prompt: `${g * e} ${nameOf(item, 2)}. Put ${e} in each group. How many groups?`, diagram: pic(g * e, item, { perRow: e === 10 ? 10 : 6 }), answer: String(g), working: [`Count by ${e}s to ${g * e}: ${Array.from({ length: g }, (_, i) => (i + 1) * e).join(", ")}. That is ${g} groups.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(g * e), String(e), String(g + 1)].filter(x => x !== String(g)), tags: ["grouping"] });
}

function leftOverQuestion() {
  const g = choice([2, 3]); const e = randInt(2, 4); const r = randInt(1, g - 1); const n = g * e + r; const item = choice(ICONS);
  return q({ type: "left-over", marks: 1, prompt: `Share ${n} ${nameOf(item, 2)} between ${g} children. How many each? How many left over?`, diagram: pic(n, item), answer: `${e} each, ${r} left over`, working: [`${g} groups of ${e} is ${g * e}. ${n} − ${g * e} = ${r} left.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${e + 1} each, 0 left over`, `${e} each, ${r + 1} left over`], tags: ["sharing", "remainder"] });
}

function groupsOf3Question() {
  const g = randInt(2, 6);
  return q({ type: "groups-of-3", marks: 1, prompt: `${g} groups of 3. How many?`, diagram: mani({ diagramType: "groups", groups: g, each: 3, item: "star" }), answer: String(3 * g), working: [`Count by 3s: ${Array.from({ length: g }, (_, i) => (i + 1) * 3).join(", ")}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(g + 3), String(3 * g + 3), String(3 * g - 1)], tags: ["skip counting"] });
}

const GENERATORS = {
  "array-count": arrayCountQuestion,
  "array-both-ways": arrayBothWaysQuestion,
  "repeated-addition": repeatedAdditionQuestion,
  "jumps-on-line": jumpsOnLineQuestion,
  "group-story": groupStoryQuestion,
  "share-story": shareStoryQuestion,
  "grouping-story": groupingStoryQuestion,
  "left-over": leftOverQuestion,
  "groups-of-3": groupsOf3Question
};

export function getFormingGroupsBQuestionTypes() { return TYPE_LIST; }
export function generateFormingGroupsBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
