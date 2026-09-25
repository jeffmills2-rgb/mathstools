/*
  Mills Maths Tools — Stage 1 Question Bank: 2D Shapes and Area (B)
  ------------------------------------------------------------------
  question-banks/stage-1/two-d-space-b/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-2DS-01  quadrilaterals and other common polygons; features; symmetry
    MA1-2DS-02  area in rows and columns of units; comparing areas

  Big ideas:
    - any shape with 4 straight sides is a QUADRILATERAL (squares,
      rectangles, rhombuses, kites, trapeziums …);
    - a polygon is named by counting its sides;
    - a fold line that makes two matching halves is a line of symmetry;
    - area units can be counted by rows: 3 rows of 4 is 12.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "2D Shapes and Area B";
const q = makeStage1(TOPIC, "MA1-2DS-01");
const qA = makeStage1(TOPIC, "MA1-2DS-02");
const L = ["A", "B", "C", "D"];

const TYPE_LIST = [
  { id: "quadrilateral-or-not", label: "Is it a quadrilateral?" },
  { id: "find-quadrilaterals", label: "Find the quadrilateral" },
  { id: "polygon-name", label: "Name the polygon by its sides" },
  { id: "fold-symmetry", label: "Is the fold line a line of symmetry?" },
  { id: "make-a-shape", label: "Two shapes make a new shape" },
  { id: "rows-columns-area", label: "Area in rows and columns" },
  { id: "compare-area-count", label: "Compare areas by counting" },
  { id: "shape-clue", label: "Shape clues" }
];

const SIDES = { triangle: 3, square: 4, rectangle: 4, rhombus: 4, kite: 4, trapezium: 4, parallelogram: 4, pentagon: 5, hexagon: 6, octagon: 8, circle: 0 };

function quadOrNotQuestion() {
  const s = choice(Object.keys(SIDES)); const yes = SIDES[s] === 4;
  return q({ type: "quadrilateral-or-not", marks: 1, prompt: "A quadrilateral has 4 straight sides. Is this a quadrilateral?", diagram: mani({ diagramType: "shapes", items: [{ shape: s }] }), answer: yes ? "Yes" : "No", working: [SIDES[s] ? `It has ${SIDES[s]} sides.` : "It has no straight sides."], space: SPACE_SIZES.SMALL, mcDistractors: [yes ? "No" : "Yes"], tags: ["quadrilaterals"] });
}

function findQuadsQuestion() {
  const quad = choice(["rhombus", "kite", "trapezium", "parallelogram", "rectangle"]);
  const others = shuffle(["triangle", "pentagon", "hexagon", "circle", "octagon"]).slice(0, 3);
  const items = shuffle([quad, ...others]); const ans = L[items.indexOf(quad)];
  return q({ type: "find-quadrilaterals", marks: 1, prompt: "Which one is a quadrilateral?", diagram: mani({ diagramType: "shapes", items: items.map((s, i) => ({ shape: s, label: L[i] })) }), answer: ans, working: [`${ans} has 4 straight sides.`], space: SPACE_SIZES.SMALL, mcDistractors: L.filter(x => x !== ans), tags: ["quadrilaterals"] });
}

function polygonNameQuestion() {
  const s = choice(["triangle", "pentagon", "hexagon", "octagon", "irregular-pentagon", "irregular-hexagon", "irregular-quadrilateral"]);
  const n = { triangle: 3, pentagon: 5, hexagon: 6, octagon: 8, "irregular-pentagon": 5, "irregular-hexagon": 6, "irregular-quadrilateral": 4 }[s];
  const name = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon", 8: "octagon" }[n];
  return q({ type: "polygon-name", marks: 1, prompt: "Count the sides. What is its name?", diagram: mani({ diagramType: "shapes", items: [{ shape: s }] }), answer: name, working: [`${n} sides → ${name}`], space: SPACE_SIZES.SMALL, mcDistractors: ["triangle", "quadrilateral", "pentagon", "hexagon", "octagon"].filter(x => x !== name).slice(0, 3), tags: ["polygons"] });
}

function foldSymmetryQuestion() {
  const m = 3; const h = randInt(2, 3); const w1 = randInt(1, 2); let w2 = randInt(1, 2); const yes = Math.random() < 0.5;
  if (!yes && w1 === w2) w2 = w1 === 1 ? 2 : 1;
  const top = 1; const mid = top + 1; const bottom = top + h;
  const left = [[m - w1, top], [m - w1, mid], [m - w2, mid], [m - w2, bottom]];
  const right = yes ? [[m + w2, bottom], [m + w2, mid], [m + w1, mid], [m + w1, top]] : [[m + w1 + 1, bottom], [m + w1 + 1, mid], [m + w2, mid], [m + w2, top]];
  return q({ type: "fold-symmetry", marks: 1, prompt: "Fold on the dashed line. Do the two halves match?", diagram: gridD({ cols: 7, rows: bottom + 1, cell: 40, shapes: [{ pts: [...left, ...right] }], mirror: { x1: m, y1: 0, x2: m, y2: bottom + 1 } }), answer: yes ? "Yes" : "No", working: [yes ? "Each side is the mirror image of the other." : "One side is bigger, so the halves do not match."], space: SPACE_SIZES.SMALL, mcDistractors: [yes ? "No" : "Yes"], tags: ["symmetry"] });
}

function makeAShapeQuestion() {
  const C = [[[{ shape: "right-triangle", label: "A" }, { shape: "right-triangle", label: "B", rotate: 180 }], "a rectangle"], [[{ shape: "square", label: "A" }, { shape: "square", label: "B" }], "a rectangle"], [[{ shape: "triangle", label: "A" }, { shape: "triangle", label: "B", rotate: 180 }], "a rhombus"]];
  const [items, ans] = choice(C);
  return q({ type: "make-a-shape", marks: 1, prompt: "Push A and B together, side to side. What shape can you make?", diagram: mani({ diagramType: "shapes", items }), answer: ans, working: ["Match two equal sides."], space: SPACE_SIZES.SMALL, mcDistractors: ["a circle", "a pentagon", "a hexagon"], tags: ["combine"] });
}

const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function rowsColumnsAreaQuestion() {
  const r = randInt(2, 4); const c = randInt(2, 6);
  return qA({ type: "rows-columns-area", marks: 1, prompt: `${r} rows of ${c} squares. How many squares?`, diagram: gridD({ countable: true, cols: c + 2, rows: r + 2, cell: 40, shapes: [{ pts: box(1, 1, c, r) }] }), answer: String(r * c), working: [`Count by ${c}s: ${Array.from({ length: r }, (_, i) => (i + 1) * c).join(", ")}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(r + c), String(r * c + c), String(2 * (r + c))].filter(x => x !== String(r * c)), tags: ["area", "rows"] });
}

function compareAreaCountQuestion() {
  let a; let b; do { a = [randInt(2, 4), randInt(2, 3)]; b = [randInt(2, 4), randInt(2, 3)]; } while (a[0] * a[1] === b[0] * b[1]);
  const diff = Math.abs(a[0] * a[1] - b[0] * b[1]);
  return qA({ type: "compare-area-count", marks: 2, prompt: "Which shape covers more squares? How many more?", diagram: gridD({ countable: true, cols: a[0] + b[0] + 3, rows: Math.max(a[1], b[1]) + 2, cell: 36, shapes: [{ pts: box(1, 1, a[0], a[1]), label: "A", labelAt: [1.5, 1.5] }, { pts: box(a[0] + 2, 1, b[0], b[1]), label: "B", labelAt: [a[0] + 2.5, 1.5] }] }), answer: `${a[0] * a[1] > b[0] * b[1] ? "A" : "B"}, ${diff} more`, working: [`A: ${a[0] * a[1]}. B: ${b[0] * b[1]}.`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["area", "compare"] });
}

function shapeClueQuestion() {
  const R = [["I have 4 sides the same length and 4 square corners.", "square"], ["I have 3 sides.", "triangle"], ["I have 6 sides.", "hexagon"], ["I am round. I have no corners.", "circle"], ["I have 8 sides.", "octagon"], ["I have 5 sides.", "pentagon"]];
  const [clue, ans] = choice(R);
  return q({ type: "shape-clue", marks: 1, prompt: `What shape am I? ${clue}`, answer: ans, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(R.map(r => r[1]).filter(x => x !== ans)).slice(0, 3), tags: ["features"] });
}

const GENERATORS = {
  "quadrilateral-or-not": quadOrNotQuestion,
  "find-quadrilaterals": findQuadsQuestion,
  "polygon-name": polygonNameQuestion,
  "fold-symmetry": foldSymmetryQuestion,
  "make-a-shape": makeAShapeQuestion,
  "rows-columns-area": rowsColumnsAreaQuestion,
  "compare-area-count": compareAreaCountQuestion,
  "shape-clue": shapeClueQuestion
};

export function getTwoDSpaceBQuestionTypes() { return TYPE_LIST; }
export function generateTwoDSpaceBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
