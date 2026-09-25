/*
  Mills Maths Tools — Stage 1 Question Bank: 2D Shapes and Area (A)
  ------------------------------------------------------------------
  question-banks/stage-1/two-d-space-a/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-2DS-01  recognise, describe and represent shapes
    MA1-2DS-02  measure and compare areas with uniform informal units

  Big ideas:
    - shapes are named by their sides and corners, not by colour, size or
      which way they are turned;
    - area is how much surface is covered: count equal squares with no gaps.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "2D Shapes and Area A";
const q = makeStage1(TOPIC, "MA1-2DS-01");
const qA = makeStage1(TOPIC, "MA1-2DS-02");

const TYPE_LIST = [
  { id: "name-shape", label: "Name the shape" },
  { id: "sides-corners", label: "Sides and corners" },
  { id: "find-the-shape", label: "Find the shape (A, B, C, D)" },
  { id: "straight-curved", label: "Straight or curved?" },
  { id: "turned-still-same", label: "Turned but still the same shape" },
  { id: "odd-one-out", label: "Which does not belong?" },
  { id: "cover-squares", label: "How many squares cover it?" },
  { id: "more-area", label: "Which covers more?" }
];

const SHAPES = { circle: [0, 0], triangle: [3, 3], square: [4, 4], rectangle: [4, 4], pentagon: [5, 5], hexagon: [6, 6], oval: [0, 0] };
const SIDES = ["triangle", "square", "rectangle", "pentagon", "hexagon"];
const L = ["A", "B", "C", "D"];

function nameShapeQuestion() {
  const s = choice(Object.keys(SHAPES));
  return q({ type: "name-shape", marks: 1, prompt: "What is this shape called?", diagram: mani({ diagramType: "shapes", items: [{ shape: s, rotate: s === "square" || s === "circle" ? 0 : choice([0, 0, 15]) }] }), answer: s, working: [SHAPES[s][0] ? `It has ${SHAPES[s][0]} straight sides.` : "It has a curved side and no corners."], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(Object.keys(SHAPES).filter(x => x !== s)).slice(0, 3), tags: ["naming"] });
}

function sidesCornersQuestion() {
  const s = choice(SIDES); const n = SHAPES[s][0]; const ask = choice(["sides", "corners"]);
  return q({ type: "sides-corners", marks: 1, prompt: `How many ${ask} does this shape have?`, diagram: mani({ diagramType: "shapes", items: [{ shape: s }] }), answer: String(n), working: [`Count each ${ask === "sides" ? "straight side" : "corner"} once.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n + 1), String(n - 1), String(n + 2)], tags: ["features"] });
}

function findTheShapeQuestion() {
  const target = choice(["triangle", "square", "circle", "rectangle", "hexagon"]);
  const others = shuffle(Object.keys(SHAPES).filter(x => x !== target && !(target === "square" && x === "rectangle") && !(target === "rectangle" && x === "square") && !(target === "circle" && x === "oval"))).slice(0, 3);
  const items = shuffle([target, ...others]); const ans = L[items.indexOf(target)];
  return q({ type: "find-the-shape", marks: 1, prompt: `Which one is a ${target}?`, diagram: mani({ diagramType: "shapes", items: items.map((s, i) => ({ shape: s, label: L[i] })) }), answer: ans, working: [], space: SPACE_SIZES.SMALL, mcDistractors: L.filter(x => x !== ans), tags: ["naming"] });
}

function straightCurvedQuestion() {
  const s = choice(Object.keys(SHAPES)); const curved = SHAPES[s][0] === 0;
  return q({ type: "straight-curved", marks: 1, prompt: "Does this shape have straight sides or a curved side?", diagram: mani({ diagramType: "shapes", items: [{ shape: s }] }), answer: curved ? "curved" : "straight", working: [], space: SPACE_SIZES.SMALL, mcDistractors: [curved ? "straight" : "curved"], tags: ["features"] });
}

function turnedStillSameQuestion() {
  const s = choice(["triangle", "square", "rectangle", "hexagon"]);
  return q({ type: "turned-still-same", marks: 1, prompt: `Shape B is turned. Is it still a ${s}?`, diagram: mani({ diagramType: "shapes", items: [{ shape: s, label: "A" }, { shape: s, label: "B", rotate: s === "square" ? 45 : 30 }] }), answer: "Yes", working: ["Turning a shape does not change it."], space: SPACE_SIZES.SMALL, mcDistractors: ["No"], tags: ["orientation"] });
}

function oddOneOutQuestion() {
  const sets = [[["triangle", "triangle", "right-triangle"], "square"], [["circle", "oval", "circle"], "square"], [["square", "rectangle", "square"], "triangle"], [["hexagon", "hexagon", "hexagon"], "pentagon"]];
  const [same, odd] = choice(sets);
  const items = shuffle([...same, odd]); const ans = L[items.indexOf(odd)];
  return q({ type: "odd-one-out", marks: 1, prompt: "Which one does not belong?", diagram: mani({ diagramType: "shapes", items: items.map((s, i) => ({ shape: s, label: L[i], rotate: randInt(0, 1) * 20 })) }), answer: ans, working: [`${ans} is a ${odd}. The others are not.`], space: SPACE_SIZES.SMALL, mcDistractors: L.filter(x => x !== ans), tags: ["sorting"] });
}

function box(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }

function coverSquaresQuestion() {
  const w = randInt(2, 5); const h = randInt(2, 3); const L2 = Math.random() < 0.4 && w > 2;
  const pts = L2 ? [[1, 1], [1 + w, 1], [1 + w, 2], [2, 2], [2, 1 + h], [1, 1 + h]] : box(1, 1, w, h);
  const area = L2 ? w + (h - 1) : w * h;
  return qA({ type: "cover-squares", marks: 1, prompt: "How many squares cover the shape?", diagram: gridD({ countable: true, cols: w + 2, rows: h + 2, cell: 44, shapes: [{ pts }] }), answer: `${area} squares`, working: ["Count each square inside once."], space: SPACE_SIZES.SMALL, mcDistractors: [`${area + 1} squares`, `${area - 1} squares`, `${2 * (w + h)} squares`], tags: ["area", "counting"] });
}

function moreAreaQuestion() {
  let a; let b; do { a = [randInt(2, 4), randInt(1, 3)]; b = [randInt(1, 4), randInt(2, 3)]; } while (a[0] * a[1] === b[0] * b[1]);
  const ans = a[0] * a[1] > b[0] * b[1] ? "A" : "B";
  return qA({ type: "more-area", marks: 1, prompt: "Which shape covers more squares, A or B?", diagram: gridD({ countable: true, cols: a[0] + b[0] + 3, rows: Math.max(a[1], b[1]) + 2, cell: 40, shapes: [{ pts: box(1, 1, a[0], a[1]), label: "A", labelAt: [1.5, 1.5] }, { pts: box(a[0] + 2, 1, b[0], b[1]), label: "B", labelAt: [a[0] + 2.5, 1.5] }] }), answer: ans, working: [`A covers ${a[0] * a[1]}. B covers ${b[0] * b[1]}.`], space: SPACE_SIZES.SMALL, mcDistractors: [ans === "A" ? "B" : "A", "They are the same"], tags: ["area", "compare"] });
}

const GENERATORS = {
  "name-shape": nameShapeQuestion,
  "sides-corners": sidesCornersQuestion,
  "find-the-shape": findTheShapeQuestion,
  "straight-curved": straightCurvedQuestion,
  "turned-still-same": turnedStillSameQuestion,
  "odd-one-out": oddOneOutQuestion,
  "cover-squares": coverSquaresQuestion,
  "more-area": moreAreaQuestion
};

export function getTwoDSpaceAQuestionTypes() { return TYPE_LIST; }
export function generateTwoDSpaceAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
