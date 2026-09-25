/*
  Mills Maths Tools — Stage 1 Question Bank: Position and Length (A)
  -------------------------------------------------------------------
  question-banks/stage-1/position-length-a/index.js

  NSW Mathematics K–10 (2022), Stage 1, Geometric measure A:
    MA1-GM-01  position of objects (left, right, between, above, below)
    MA1-GM-02  length with uniform informal units

  Big ideas:
    - left and right depend on a point of view (here: as you look at the page);
    - to measure, lay the SAME unit end to end with no gaps and no overlaps,
      then count;
    - to compare, line the ends up.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Position and Length A";
const qP = makeStage1(TOPIC, "MA1-GM-01");
const qL = makeStage1(TOPIC, "MA1-GM-02");

const TYPE_LIST = [
  { id: "left-right", label: "Left and right of" },
  { id: "between", label: "Between" },
  { id: "ordinal", label: "First, second, third …" },
  { id: "above-below", label: "Above, below, next to (grid)" },
  { id: "longer-shorter", label: "Longer or shorter?" },
  { id: "measure-cubes", label: "Measure with cubes" },
  { id: "measure-paperclips", label: "Measure with paperclips" },
  { id: "order-lengths", label: "Order lengths" },
  { id: "how-much-longer", label: "How much longer?" },
  { id: "same-unit", label: "Why use the same unit?" }
];

const ROW = ["apple", "star", "ball", "fish", "car", "cup", "flower", "heart"];
const the = i => `the ${i}`;

function leftRightQuestion() {
  const items = shuffle(ROW.slice()).slice(0, 5); const i = randInt(1, 3); const side = choice(["left", "right"]);
  const ans = items[side === "left" ? i - 1 : i + 1];
  return qP({ type: "left-right", marks: 1, prompt: `What is just to the ${side} of ${the(items[i])}?`, diagram: mani({ diagramType: "objects", items }), answer: the(ans), working: [`Find ${the(items[i])}. Look one step to the ${side}.`], space: SPACE_SIZES.SMALL, mcDistractors: [the(items[side === "left" ? i + 1 : i - 1]), the(items[(i + 3) % 5])].filter(x => x !== the(ans)), tags: ["left and right"] });
}

function betweenQuestion() {
  const items = shuffle(ROW.slice()).slice(0, 5); const i = randInt(1, 3);
  return qP({ type: "between", marks: 1, prompt: `What is between ${the(items[i - 1])} and ${the(items[i + 1])}?`, diagram: mani({ diagramType: "objects", items }), answer: the(items[i]), working: [], space: SPACE_SIZES.SMALL, mcDistractors: items.filter((_, k) => k !== i).slice(0, 3).map(the), tags: ["between"] });
}

function ordinalQuestion() {
  const items = shuffle(ROW.slice()).slice(0, 6); const i = randInt(0, 5); const words = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
  if (Math.random() < 0.5) return qP({ type: "ordinal", marks: 1, prompt: `Start from the left. What is ${words[i]}?`, diagram: mani({ diagramType: "objects", items }), answer: the(items[i]), working: [`Count from the left: ${items.slice(0, i + 1).join(", ")}.`], space: SPACE_SIZES.SMALL, mcDistractors: [the(items[5 - i]), the(items[(i + 1) % 6])].filter(x => x !== the(items[i])), tags: ["ordinal"] });
  return qP({ type: "ordinal", marks: 1, prompt: `Start from the left. Where is ${the(items[i])}?`, diagram: mani({ diagramType: "objects", items }), answer: words[i], working: [], space: SPACE_SIZES.SMALL, mcDistractors: [words[5 - i], words[(i + 1) % 6]].filter(x => x !== words[i]), tags: ["ordinal"] });
}

const PLACES = [{ kind: "house", label: "House" }, { kind: "tree", label: "Tree" }, { kind: "school", label: "School" }, { kind: "shop", label: "Shop" }, { kind: "pool", label: "Pool" }, { kind: "star", label: "Star" }, { kind: "tent", label: "Tent" }, { kind: "flag", label: "Flag" }];

function aboveBelowQuestion() {
  for (let t = 0; t < 50; t++) {
    const cols = 4; const rows = 3; const used = new Set();
    const icons = shuffle(PLACES.slice()).slice(0, 6).map(p => { let c; let r; do { c = randInt(0, cols - 1); r = randInt(0, rows - 1); } while (used.has(`${c},${r}`)); used.add(`${c},${r}`); return { col: c, row: r, kind: p.kind, label: p.label }; });
    const pairs = [];
    icons.forEach(a => icons.forEach(b => {
      if (a === b) return;
      if (a.col === b.col && b.row === a.row - 1) pairs.push([a, b, "above"]);
      if (a.col === b.col && b.row === a.row + 1) pairs.push([a, b, "below"]);
      if (a.row === b.row && b.col === a.col + 1) pairs.push([a, b, "right of"]);
      if (a.row === b.row && b.col === a.col - 1) pairs.push([a, b, "left of"]);
    }));
    if (!pairs.length) continue;
    const [a, b, rel] = choice(pairs);
    return qP({ type: "above-below", marks: 1, prompt: `What is just ${rel} the ${a.label.toLowerCase()}?`, diagram: gridD({ cols, rows, map: true, icons, cell: 60 }), answer: `the ${b.label.toLowerCase()}`, working: [`Find the ${a.label.toLowerCase()}. Move one square ${rel.replace(" of", "")}.`], space: SPACE_SIZES.SMALL, mcDistractors: icons.filter(i => i !== a && i !== b).slice(0, 3).map(i => `the ${i.label.toLowerCase()}`), tags: ["position"] });
  }
  return leftRightQuestion();
}

function lengthRows(n) {
  const objs = shuffle(["pencil", "snake", "ribbon", "crayon"]); const lens = [];
  while (lens.length < n) { const v = randInt(3, 9); if (!lens.includes(v)) lens.push(v); }
  return lens.map((u, i) => ({ object: objs[i], units: u, label: "ABC"[i] }));
}

function longerShorterQuestion() {
  const rows = lengthRows(2); const ask = choice(["longer", "shorter"]);
  const ans = (ask === "longer") === (rows[0].units > rows[1].units) ? "A" : "B";
  return qL({ type: "longer-shorter", marks: 1, prompt: `Which is ${ask}, A or B?`, diagram: mani({ diagramType: "unit-length", rows, showUnits: false }), answer: ans, working: ["The left ends line up, so compare the right ends."], space: SPACE_SIZES.SMALL, mcDistractors: [ans === "A" ? "B" : "A", "They are the same"], tags: ["compare"] });
}

function measureCubesQuestion() {
  const u = randInt(3, 10); const ob = choice(["pencil", "snake", "ribbon", "crayon"]);
  return qL({ type: "measure-cubes", marks: 1, prompt: `How many cubes long is the ${ob}?`, diagram: mani({ diagramType: "unit-length", unit: "cube", rows: [{ object: ob, units: u }] }), answer: `${u} cubes`, working: ["Count the cubes under it."], space: SPACE_SIZES.SMALL, mcDistractors: [`${u + 1} cubes`, `${u - 1} cubes`, `${u + 2} cubes`], tags: ["informal units"] });
}

function measurePaperclipsQuestion() {
  const u = randInt(2, 7); const ob = choice(["pencil", "snake", "ribbon"]);
  return qL({ type: "measure-paperclips", marks: 1, prompt: `How many paperclips long is the ${ob}?`, diagram: mani({ diagramType: "unit-length", unit: "paperclip", rows: [{ object: ob, units: u }] }), answer: `${u} paperclips`, working: ["Count the paperclips end to end."], space: SPACE_SIZES.SMALL, mcDistractors: [`${u + 1} paperclips`, `${u - 1 || u + 2} paperclips`], tags: ["informal units"] });
}

function orderLengthsQuestion() {
  const rows = lengthRows(3); const order = rows.slice().sort((a, b) => a.units - b.units).map(r => r.label).join(", ");
  return qL({ type: "order-lengths", marks: 1, prompt: "Order from shortest to longest.", diagram: mani({ diagramType: "unit-length", unit: "cube", rows }), answer: order, working: rows.map(r => `${r.label}: ${r.units} cubes`), space: SPACE_SIZES.SMALL, mcDistractors: [order.split(", ").reverse().join(", "), "A, B, C"].filter(x => x !== order), tags: ["order"] });
}

function howMuchLongerQuestion() {
  const rows = lengthRows(2); const [l, s] = rows[0].units > rows[1].units ? rows : [rows[1], rows[0]];
  return qL({ type: "how-much-longer", marks: 1, prompt: `How many cubes longer is ${l.label} than ${s.label}?`, diagram: mani({ diagramType: "unit-length", unit: "cube", rows }), answer: String(l.units - s.units), working: [`${l.units} − ${s.units} = ${l.units - s.units}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(l.units + s.units), String(l.units), String(l.units - s.units + 1)], tags: ["difference"] });
}

function sameUnitQuestion() {
  const a = randInt(4, 7); const b = randInt(4, 7);
  return qL({ type: "same-unit", marks: 1, prompt: `Sam says his desk is ${a} hands long. Ali says it is ${b + 6} paperclips. Can they both be right?`, answer: "Yes — they used different units. Hands are bigger than paperclips, so fewer hands fit.", working: ["To compare lengths we must use the same unit."], space: SPACE_SIZES.SMALL, mcDistractors: ["No — a desk can only have one length.", "No — paperclips are bigger than hands."], tags: ["units"] });
}

const GENERATORS = {
  "left-right": leftRightQuestion,
  "between": betweenQuestion,
  "ordinal": ordinalQuestion,
  "above-below": aboveBelowQuestion,
  "longer-shorter": longerShorterQuestion,
  "measure-cubes": measureCubesQuestion,
  "measure-paperclips": measurePaperclipsQuestion,
  "order-lengths": orderLengthsQuestion,
  "how-much-longer": howMuchLongerQuestion,
  "same-unit": sameUnitQuestion
};

export function getPositionLengthAQuestionTypes() { return TYPE_LIST; }
export function generatePositionLengthAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
