/*
  Mills Maths Tools — Stage 2 Question Bank: 2D Shapes and Area A
  ----------------------------------------------------------------
  question-banks/stage-2/two-d-space-a/index.js

  NSW Mathematics K–10 (2022), Stage 2:
    MA2-2DS-01  compares two-dimensional shapes and describes their features
    MA2-2DS-03  area — measuring by counting square units

  Big ideas:
    - a shape is named by its FEATURES (sides, vertices, right angles,
      parallel sides), not by how it is turned on the page;
    - a polygon's name counts its sides (tri-, quad-, penta-, hexa-, octa-);
    - area is how many equal squares cover a surface with no gaps or overlaps.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "2D Shapes and Area A";
const q = makeStage2(TOPIC, "MA2-2DS-01");
const qA = makeStage2(TOPIC, "MA2-2DS-03");

const TYPE_LIST = [
  { id: "sides-vertices", label: "Count sides and vertices" },
  { id: "name-polygon", label: "Name the polygon" },
  { id: "turned-shape", label: "Same shape, turned" },
  { id: "name-quadrilateral", label: "Name the quadrilateral" },
  { id: "parallel-sides", label: "Parallel sides" },
  { id: "regular-irregular", label: "Regular or irregular?" },
  { id: "odd-one-out", label: "Which shape does not belong?" },
  { id: "shape-riddle", label: "Shape riddles" },
  { id: "count-squares", label: "Area by counting squares" },
  { id: "compare-areas", label: "Which shape has the bigger area?" },
  { id: "half-squares", label: "Area with half squares" },
  { id: "rows-of-squares", label: "Area of a rectangle in rows" }
];

const POLY = { triangle: 3, "right-triangle": 3, "scalene-triangle": 3, "isosceles-triangle": 3, square: 4, rectangle: 4, rhombus: 4, parallelogram: 4, trapezium: 4, kite: 4, "irregular-quadrilateral": 4, pentagon: 5, "irregular-pentagon": 5, hexagon: 6, "irregular-hexagon": 6, heptagon: 7, octagon: 8 };
const FAMILY = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon" };
const QUADS = { square: "square", rectangle: "rectangle", rhombus: "rhombus", parallelogram: "parallelogram", trapezium: "trapezium", kite: "kite" };
const PARALLEL = { square: 2, rectangle: 2, rhombus: 2, parallelogram: 2, trapezium: 1, kite: 0, triangle: 0, hexagon: 3, octagon: 4 };
const REGULAR = ["triangle", "square", "pentagon", "hexagon", "octagon"];
const IRREGULAR = ["scalene-triangle", "rectangle", "irregular-pentagon", "irregular-hexagon", "irregular-quadrilateral", "kite"];
const shapeD = (shape, extra = {}) => mani({ diagramType: "shapes", items: [{ shape, ...extra }] });

function sidesVerticesQuestion() {
  const shape = choice(Object.keys(POLY)); const n = POLY[shape];
  return q({ type: "sides-vertices", marks: 1, prompt: "How many sides? How many vertices (corners)?", diagram: shapeD(shape, { rotate: choice([0, 0, 15, -20]) }), answer: `${n} sides, ${n} vertices`, working: ["Count each straight side once. A polygon has as many vertices as sides."], space: SPACE_SIZES.SMALL, mcDistractors: [`${n} sides, ${n + 1} vertices`, `${n + 1} sides, ${n + 1} vertices`, `${n - 1} sides, ${n} vertices`], tags: ["features"] });
}

function namePolygonQuestion() {
  const shape = choice(["triangle", "scalene-triangle", "pentagon", "irregular-pentagon", "hexagon", "irregular-hexagon", "octagon", "irregular-quadrilateral", "heptagon"]);
  const n = POLY[shape]; const name = FAMILY[n];
  return q({ type: "name-polygon", marks: 1, prompt: "Count the sides. Name the shape.", diagram: shapeD(shape), answer: name, working: [`${n} sides → ${name}`], space: SPACE_SIZES.SMALL, mcDistractors: Object.values(FAMILY).filter(f => f !== name).slice(0, 3), tags: ["polygons"] });
}

function turnedShapeQuestion() {
  const shape = choice(["square", "triangle", "rectangle", "hexagon"]);
  const name = { square: "square", triangle: "triangle", rectangle: "rectangle", hexagon: "hexagon" }[shape];
  const rot = shape === "square" ? 45 : choice([30, 60, 90]);
  return q({ type: "turned-shape", marks: 1, prompt: `Tom says shape B is not a ${name} because it is tilted. Is Tom right? Explain.`, diagram: mani({ diagramType: "shapes", items: [{ shape, label: "A" }, { shape, label: "B", rotate: rot }] }), answer: `No. B is still a ${name} — turning a shape does not change its sides or angles.`, working: ["Count sides and check corners; the way it is turned does not matter."], space: SPACE_SIZES.SMALL, mcDistractors: [`Yes. A tilted ${name} is a different shape.`], tags: ["orientation"] });
}

function nameQuadrilateralQuestion() {
  const shape = choice(Object.keys(QUADS));
  const hint = { square: "4 equal sides and 4 right angles", rectangle: "4 right angles, opposite sides equal", rhombus: "4 equal sides, no right angles", parallelogram: "2 pairs of parallel sides, no right angles", trapezium: "only 1 pair of parallel sides", kite: "2 pairs of equal sides next to each other" }[shape];
  return q({ type: "name-quadrilateral", marks: 1, prompt: "Name this quadrilateral.", diagram: shapeD(shape, { rotate: shape === "square" || shape === "rectangle" ? 0 : choice([0, 10]) }), answer: QUADS[shape], working: [hint], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(Object.values(QUADS).filter(v => v !== QUADS[shape])).slice(0, 3), tags: ["quadrilaterals"] });
}

function parallelSidesQuestion() {
  const shape = choice(["square", "rectangle", "rhombus", "parallelogram", "trapezium", "kite", "hexagon"]); const n = PARALLEL[shape];
  return q({ type: "parallel-sides", marks: 1, prompt: "How many pairs of parallel sides does this shape have? (Parallel sides point the same way and never meet.)", diagram: shapeD(shape), answer: String(n), working: [n ? `${n} pair${n > 1 ? "s" : ""} of sides run the same way.` : "No two sides run the same way."], space: SPACE_SIZES.SMALL, mcDistractors: ["0", "1", "2", "3"].filter(x => x !== String(n)), tags: ["parallel"] });
}

function regularIrregularQuestion() {
  const reg = Math.random() < 0.5; const shape = choice(reg ? REGULAR : IRREGULAR);
  return q({ type: "regular-irregular", marks: 1, prompt: "Is this shape regular or irregular? Why?", diagram: shapeD(shape), answer: reg ? "Regular — all sides and all angles are equal." : "Irregular — the sides (or angles) are not all equal.", working: ["A regular polygon has all sides equal and all angles equal."], space: SPACE_SIZES.SMALL, mcDistractors: [reg ? "Irregular — the sides (or angles) are not all equal." : "Regular — all sides and all angles are equal."], tags: ["regular"] });
}

function oddOneOutQuestion() {
  const sets = [
    [["triangle", "scalene-triangle", "right-triangle"], "square", "it has 4 sides; the others are triangles"],
    [["square", "rectangle", "trapezium"], "pentagon", "it has 5 sides; the others have 4"],
    [["square", "rectangle"], "rhombus", "it has no right angles"],
    [["hexagon", "irregular-hexagon"], "octagon", "it has 8 sides; the others have 6"],
    [["circle", "oval"], "hexagon", "it has straight sides and corners"]
  ];
  const [same, odd, why] = choice(sets);
  const items = shuffle([...same.map(s => ({ shape: s })), { shape: odd }]).map((it, i) => ({ ...it, label: "ABCD"[i] }));
  const letter = items.find(i => i.shape === odd).label;
  return q({ type: "odd-one-out", marks: 1, prompt: "Which shape does not belong? Why?", diagram: mani({ diagramType: "shapes", items }), answer: `${letter} — ${why}.`, working: ["Compare sides, corners and right angles."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["sorting"] });
}

function shapeRiddleQuestion() {
  const R = [
    ["I have 4 equal sides and 4 right angles.", "square"], ["I have 3 sides and 3 vertices.", "triangle"], ["I have 6 sides.", "hexagon"],
    ["I have 4 right angles. My opposite sides are equal, but not all my sides are equal.", "rectangle"], ["I have 8 sides and 8 vertices.", "octagon"],
    ["I am a quadrilateral with only one pair of parallel sides.", "trapezium"], ["I have 5 sides.", "pentagon"], ["I have no straight sides and no corners.", "circle"]
  ];
  const [clue, ans] = choice(R);
  return q({ type: "shape-riddle", marks: 1, prompt: `What shape am I? ${clue}`, answer: ans, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(R.map(r => r[1]).filter(x => x !== ans)).slice(0, 3), tags: ["features"] });
}

/* ── area ──────────────────────────────────────────── */
function rectilinear() {
  // an L, T or step shape made of whole squares, with its cell count
  const w = randInt(3, 6); const h = randInt(2, 4);
  const kind = choice(["rect", "L", "step"]);
  if (kind === "rect") return { pts: [[1, 1], [1 + w, 1], [1 + w, 1 + h], [1, 1 + h]], area: w * h, cols: w + 2, rows: h + 2 };
  const cw = randInt(1, w - 1); const ch = randInt(1, h - 1);
  if (kind === "L") return { pts: [[1, 1], [1 + w, 1], [1 + w, 1 + h - ch], [1 + w - cw, 1 + h - ch], [1 + w - cw, 1 + h], [1, 1 + h]], area: w * h - cw * ch, cols: w + 2, rows: h + 2 };
  return { pts: [[1, 1 + ch], [1 + cw, 1 + ch], [1 + cw, 1], [1 + w, 1], [1 + w, 1 + h], [1, 1 + h]], area: w * h - cw * ch, cols: w + 2, rows: h + 2 };
}

function countSquaresQuestion() {
  const s = rectilinear();
  return qA({ type: "count-squares", marks: 1, prompt: "What is the area of the shape? Count the squares.", diagram: gridD({ countable: true, cols: s.cols, rows: s.rows, shapes: [{ pts: s.pts }] }), answer: `${s.area} squares`, working: ["Count each square inside once. Count in rows to keep track."], space: SPACE_SIZES.SMALL, mcDistractors: [`${s.area + 1} squares`, `${s.area - 1} squares`, `${s.pts.length * 2 + 4} squares`].filter(x => x !== `${s.area} squares`), tags: ["area", "counting"] });
}

function compareAreasQuestion() {
  let a; let b; do { a = rectilinear(); b = rectilinear(); } while (a.area === b.area);
  const shift = a.cols - 1;
  const bpts = b.pts.map(([x, y]) => [x + shift, y]);
  return qA({ type: "compare-areas", marks: 1, prompt: "Which shape has the bigger area, A or B? By how many squares?", diagram: gridD({ countable: true, cols: a.cols + b.cols - 1, rows: Math.max(a.rows, b.rows), shapes: [{ pts: a.pts, label: "A", labelAt: [a.pts[0][0] + 0.5, a.pts[a.pts.length - 1][1] - 0.5] }, { pts: bpts, label: "B", labelAt: [bpts[0][0] + 0.5, bpts[bpts.length - 1][1] - 0.5] }] }), answer: `${a.area > b.area ? "A" : "B"}, by ${Math.abs(a.area - b.area)} squares (A = ${a.area}, B = ${b.area})`, working: [`A: ${a.area} squares. B: ${b.area} squares.`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["area", "compare"] });
}

function halfSquaresQuestion() {
  const w = randInt(2, 5); const h = randInt(2, 3);
  // a right triangle cut along the diagonal of an n × n square (n even, so the halves pair up)
  const n = choice([2, 4]);
  const pts = [[1, 1], [1 + n, 1], [1 + n, 1 + n]];
  const area = (n * n) / 2;
  if (Math.random() < 0.5) return qA({ type: "half-squares", marks: 1, prompt: "Some squares are cut in half. Two halves make one whole square. What is the area?", diagram: gridD({ countable: true, cols: n + 2, rows: n + 2, shapes: [{ pts }] }), answer: `${area} squares`, working: [`Whole squares: ${(n * n - n) / 2}. Half squares: ${n}, which make ${n / 2}.`, `${(n * n - n) / 2} + ${n / 2} = ${area}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${(n * n - n) / 2 + n} squares`, `${n * n} squares`, `${(n * n - n) / 2} squares`], tags: ["area", "half squares"] });
  const pts2 = [[1, 1], [1 + w, 1], [1 + w + h, 1 + h], [1 + h, 1 + h]];
  return qA({ type: "half-squares", marks: 1, prompt: "Two halves make one whole square. What is the area of the shape?", diagram: gridD({ countable: true, cols: w + h + 2, rows: h + 2, shapes: [{ pts: pts2 }] }), answer: `${w * h} squares`, working: [`Whole squares: ${w * h - h}. Halves: ${2 * h}, which make ${h}.`, `${w * h - h} + ${h} = ${w * h}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${w * h + h} squares`, `${w * h - h} squares`, `${(w + 1) * h} squares`], tags: ["area", "half squares"] });
}

function rowsOfSquaresQuestion() {
  const r = randInt(2, 5); const c = randInt(3, 8);
  return qA({ type: "rows-of-squares", marks: 1, prompt: `There are ${r} rows of ${c} squares. What is the area? Write a multiplication.`, diagram: gridD({ countable: true, cols: c + 2, rows: r + 2, shapes: [{ pts: [[1, 1], [1 + c, 1], [1 + c, 1 + r], [1, 1 + r]] }] }), answer: `${r} × ${c} = ${r * c} squares`, working: ["Rows × squares in each row."], space: SPACE_SIZES.SMALL, mcDistractors: [`${r} + ${c} = ${r + c} squares`, `${r} × ${c} = ${r * c + c} squares`, `${2 * (r + c)} squares`], tags: ["area", "arrays"] });
}

const GENERATORS = {
  "sides-vertices": sidesVerticesQuestion,
  "name-polygon": namePolygonQuestion,
  "turned-shape": turnedShapeQuestion,
  "name-quadrilateral": nameQuadrilateralQuestion,
  "parallel-sides": parallelSidesQuestion,
  "regular-irregular": regularIrregularQuestion,
  "odd-one-out": oddOneOutQuestion,
  "shape-riddle": shapeRiddleQuestion,
  "count-squares": countSquaresQuestion,
  "compare-areas": compareAreasQuestion,
  "half-squares": halfSquaresQuestion,
  "rows-of-squares": rowsOfSquaresQuestion
};

export function getTwoDSpaceAQuestionTypes() { return TYPE_LIST; }
export function generateTwoDSpaceAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
