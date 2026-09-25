/*
  Mills Maths Tools — Stage 2 Question Bank: 2D Shapes and Area B
  ----------------------------------------------------------------
  question-banks/stage-2/two-d-space-b/index.js

  NSW Mathematics K–10 (2022), Stage 2:
    MA2-2DS-01  features of shapes — line symmetry
    MA2-2DS-02  combining and splitting shapes; slides, flips and turns
    MA2-2DS-03  area in square centimetres and square metres

  Big ideas:
    - shapes can be split into, and built from, other shapes;
    - a SLIDE, FLIP or TURN moves a shape without changing its size or shape;
    - a line of symmetry folds a shape onto itself exactly;
    - a square centimetre (cm²) and a square metre (m²) are standard squares
      we count to measure area; rows × columns is a fast way to count.

  Transformations reuse the move generator from the Stage 3 bank, which
  checks that exactly one kind of move takes A to B.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";
import { makeMove } from "../../stage-3/two-d-space-area/extra-types.js";

const TOPIC = "2D Shapes and Area B";
const q1 = makeStage2(TOPIC, "MA2-2DS-01");
const q2 = makeStage2(TOPIC, "MA2-2DS-02");
const qA = makeStage2(TOPIC, "MA2-2DS-03");

const TYPE_LIST = [
  { id: "split-shape", label: "Split a shape: what shapes are made?" },
  { id: "combine-shapes", label: "Combine shapes to make a new shape" },
  { id: "slide-flip-turn", label: "Slide, flip or turn?" },
  { id: "describe-slide", label: "Describe a slide on a grid" },
  { id: "lines-of-symmetry", label: "How many lines of symmetry?" },
  { id: "is-it-symmetry", label: "Is the dashed line a line of symmetry?" },
  { id: "complete-symmetry", label: "Complete the symmetrical shape" },
  { id: "area-cm2", label: "Area in square centimetres" },
  { id: "rectangle-area-cm2", label: "Area of a rectangle: rows × columns" },
  { id: "same-area", label: "Same area, different shapes" },
  { id: "choose-area-unit", label: "Choose cm² or m²" },
  { id: "estimate-m2", label: "Estimate in square metres" }
];

const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

function splitShapeQuestion() {
  const cases = [
    () => { const s = randInt(2, 4); return { pts: box(1, 1, s, s), cut: { x1: 1, y1: 1, x2: 1 + s, y2: 1 + s }, cols: s + 2, rows: s + 2, ans: "2 triangles", d: ["2 squares", "2 rectangles", "a triangle and a square"] }; },
    () => { const w = randInt(2, 3) * 2; const h = randInt(2, 3); return { pts: box(1, 1, w, h), cut: { x1: 1 + w / 2, y1: 0.5, x2: 1 + w / 2, y2: 1.5 + h }, cols: w + 2, rows: h + 2, ans: w / 2 === h ? "2 squares" : "2 rectangles", d: ["2 triangles", "4 squares", "a square and a triangle"] }; },
    () => { const w = randInt(3, 5); const h = randInt(2, 3); return { pts: box(1, 1, w, h), cut: { x1: 1, y1: 1 + h, x2: 1 + w, y2: 1 }, cols: w + 2, rows: h + 2, ans: "2 triangles", d: ["2 rectangles", "2 squares", "a triangle and a rectangle"] }; },
    () => { const pts = [[1, 1], [3, 1], [3, 3], [5, 3], [5, 5], [1, 5]]; return { pts, cut: { x1: 3, y1: 0.5, x2: 3, y2: 5.5 }, cols: 6, rows: 6, ans: "2 rectangles", d: ["2 squares", "2 triangles", "a rectangle and a triangle"] }; }
  ];
  const c = choice(cases)();
  return q2({ type: "split-shape", marks: 1, prompt: "The shape is cut along the dashed line. What two shapes are made?", diagram: gridD({ cols: c.cols, rows: c.rows, shapes: [{ pts: c.pts }], mirror: c.cut }), answer: c.ans, working: ["Look at each piece: count its sides and check its corners."], space: SPACE_SIZES.SMALL, mcDistractors: c.d.filter(x => x !== c.ans), tags: ["split"] });
}

function combineShapesQuestion() {
  const C = [
    [[{ shape: "right-triangle", label: "A" }, { shape: "right-triangle", label: "B", rotate: 180 }], "A rectangle (or a square)", "Two right-angled triangles joined along their longest side make a rectangle."],
    [[{ shape: "square", label: "A" }, { shape: "square", label: "B" }], "A rectangle", "Two squares side by side make a rectangle twice as long."],
    [[{ shape: "triangle", label: "A" }, { shape: "triangle", label: "B", rotate: 180 }], "A rhombus (or a parallelogram)", "Two equal triangles joined along a side make a four-sided shape with parallel sides."],
    [[{ shape: "trapezium", label: "A" }, { shape: "trapezium", label: "B", rotate: 180 }], "A hexagon", "Two trapeziums joined on their long sides make a six-sided shape."]
  ];
  const [items, ans, why] = choice(C);
  return q2({ type: "combine-shapes", marks: 1, prompt: "Shapes A and B are pushed together edge to edge (matching sides touching). What new shape can they make?", diagram: mani({ diagramType: "shapes", items }), answer: ans, working: [why], space: SPACE_SIZES.SMALL, mcDistractors: ["A circle", "A pentagon", ans.includes("hexagon") ? "A triangle" : "An octagon"], tags: ["combine"] });
}

/* A label point inside the polygon: the cell centre (or vertex centroid)
   nearest the vertex average that passes a point-in-polygon test. */
function inside([px, py], pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]; const [xj, yj] = pts[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function labelAt(pts) {
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length; const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const cands = pts.length === 3 ? [[cx, cy]] : [];
  const xs = pts.map(p => p[0]); const ys = pts.map(p => p[1]);
  for (let x = Math.min(...xs); x < Math.max(...xs); x++) for (let y = Math.min(...ys); y < Math.max(...ys); y++) cands.push([x + 0.5, y + 0.5]);
  const ok = cands.filter(c => inside(c, pts)).sort((a, b) => Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy));
  return ok[0] || [cx, cy];
}
const moveShapes = m => [{ pts: m.shape, label: "A", labelAt: labelAt(m.shape) }, { pts: m.image, style: "image", label: "B", labelAt: labelAt(m.image) }];

const MOVE_WORD = { translation: "slide", reflection: "flip", rotation: "turn" };

function slideFlipTurnQuestion() {
  const kind = choice(["translation", "reflection", "rotation"]);
  const m = makeMove(kind, 12, 8);
  if (!m) return slideFlipTurnQuestion();
  return q2({ type: "slide-flip-turn", marks: 1, prompt: "Shape A moves to shape B. Was it a slide, a flip or a turn?", diagram: gridD({ cols: 12, rows: 8, shapes: moveShapes(m) }), answer: MOVE_WORD[kind], working: [{ translation: "B faces the same way as A — it slid.", reflection: "B is a mirror image of A — it flipped.", rotation: "B has been turned around a point." }[kind]], space: SPACE_SIZES.SMALL, mcDistractors: Object.values(MOVE_WORD).filter(w => w !== MOVE_WORD[kind]), tags: ["transformations"] });
}

function describeSlideQuestion() {
  const m = makeMove("translation", 12, 8);
  if (!m) return describeSlideQuestion();
  const dx = m.image[0][0] - m.shape[0][0]; const dy = m.image[0][1] - m.shape[0][1];
  const words = `${dx} square${dx > 1 ? "s" : ""} right${dy ? ` and ${Math.abs(dy)} square${Math.abs(dy) > 1 ? "s" : ""} ${dy > 0 ? "down" : "up"}` : ""}`;
  return q2({ type: "describe-slide", marks: 1, prompt: "Shape A slides to shape B. How many squares right? How many squares up or down?", diagram: gridD({ cols: 12, rows: 8, shapes: moveShapes(m) }), answer: words[0].toUpperCase() + words.slice(1), working: ["Pick one corner of A and count squares to the same corner of B."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["slide"] });
}

const SYM = [["square", 4], ["rectangle", 2], ["triangle", 3], ["kite", 1], ["parallelogram", 0], ["hexagon", 6], ["scalene-triangle", 0], ["rhombus", 2], ["trapezium", 1], ["pentagon", 5]];

function linesOfSymmetryQuestion() {
  const [shape, n] = choice(SYM);
  return q1({ type: "lines-of-symmetry", marks: 1, prompt: "How many lines of symmetry does this shape have? (Imagine folding it so the halves match.)", diagram: mani({ diagramType: "shapes", items: [{ shape }] }), answer: String(n), working: [n ? `There are ${n} fold line${n > 1 ? "s" : ""} where the halves match exactly.` : "No fold makes the two halves match."], space: SPACE_SIZES.SMALL, mcDistractors: ["0", "1", "2", "4"].filter(x => x !== String(n)).slice(0, 3), tags: ["symmetry"] });
}

function isItSymmetryQuestion() {
  const m = 4; const top = 1; const h = randInt(3, 4); const bottom = top + h; const mid = top + randInt(1, h - 1);
  const w1 = randInt(1, 3); let w2 = randInt(1, 3); if (w1 === w2) w2 = w1 === 3 ? 1 : w1 + 1;
  const yes = Math.random() < 0.5;
  const left = [[m - w1, top], [m - w1, mid], [m - w2, mid], [m - w2, bottom]];
  const right = yes ? [[m + w2, bottom], [m + w2, mid], [m + w1, mid], [m + w1, top]] : [[m + w1, bottom], [m + w1, mid], [m + w2, mid], [m + w2, top]];
  return q1({ type: "is-it-symmetry", marks: 1, prompt: "Is the dashed line a line of symmetry? Explain.", diagram: gridD({ cols: 8, rows: bottom + 1, shapes: [{ pts: [...left, ...right] }], mirror: { x1: m, y1: 0, x2: m, y2: bottom + 1 } }), answer: yes ? "Yes — each side is a mirror image of the other." : "No — if you fold on the line, the two halves do not match.", working: ["Check each corner: its partner must be the same distance from the line on the other side."], space: SPACE_SIZES.SMALL, mcDistractors: [yes ? "No — if you fold on the line, the two halves do not match." : "Yes — each side is a mirror image of the other."], tags: ["symmetry"] });
}

function completeSymmetryQuestion() {
  const m = 4; const top = randInt(0, 1); const bottom = top + randInt(3, 4);
  const w1 = randInt(1, 3); let w2 = randInt(1, 3); if (w1 === w2) w2 = w1 === 3 ? 1 : w1 + 1;
  const mid = randInt(top + 1, bottom - 1);
  const half = [[m, top], [m - w1, top], [m - w1, mid], [m - w2, mid], [m - w2, bottom], [m, bottom]];
  return q1({ type: "complete-symmetry", marks: 2, prompt: "Draw the other half so the dashed line is a line of symmetry.", diagram: gridD({ cols: 8, rows: bottom + 1, shapes: [{ pts: half }], mirror: { x1: m, y1: 0, x2: m, y2: bottom + 1 } }), answer: "The right half matches the left half like a mirror image.", working: ["Count squares from the line to each corner; draw each partner corner the same number of squares on the other side."], space: "none", mcEligible: false, tags: ["symmetry", "draw"] });
}

function areaCm2Question() {
  const w = randInt(2, 6); const h = randInt(2, 4); const cw = randInt(1, w - 1); const ch = randInt(1, h - 1);
  const pts = [[1, 1], [1 + w, 1], [1 + w, 1 + h - ch], [1 + w - cw, 1 + h - ch], [1 + w - cw, 1 + h], [1, 1 + h]];
  const area = w * h - cw * ch;
  return qA({ type: "area-cm2", marks: 1, prompt: "Each small square is 1 square centimetre (1 cm²). What is the area?", diagram: gridD({ countable: true, cols: w + 2, rows: h + 2, shapes: [{ pts }] }), answer: `${area} cm²`, working: [`Count the squares: ${area}.`, `Or: ${w} × ${h} = ${w * h}, take away the ${cw * ch} missing: ${area}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${area} cm`, `${w * h} cm²`, `${2 * (w + h)} cm²`], tags: ["area", "cm²"] });
}

function rectangleAreaCm2Question() {
  const r = randInt(2, 6); const c = randInt(3, 9);
  return qA({ type: "rectangle-area-cm2", marks: 1, prompt: `Each square is 1 cm². Use rows × columns to find the area.`, diagram: gridD({ countable: true, cols: c + 2, rows: r + 2, shapes: [{ pts: box(1, 1, c, r) }] }), answer: `${r} × ${c} = ${r * c} cm²`, working: [`${r} rows of ${c} squares`], space: SPACE_SIZES.SMALL, mcDistractors: [`${r + c} cm²`, `${2 * (r + c)} cm²`, `${r * c} cm`], tags: ["area", "arrays"] });
}

function sameAreaQuestion() {
  const A = choice([12, 16, 18, 24]);
  const pairs = []; for (let a = 1; a <= A; a++) if (A % a === 0 && a <= A / a && A / a <= 12) pairs.push([a, A / a]);
  const [[h1, w1], [h2, w2]] = shuffle(pairs).slice(0, 2);
  if (!w2) return sameAreaQuestion();
  const gap = 1; const cols = w1 + w2 + 3; const rows = Math.max(h1, h2) + 2;
  return qA({ type: "same-area", marks: 2, prompt: "Each square is 1 cm². Find the area of A and B. What do you notice?", diagram: gridD({ countable: true, cols, rows, shapes: [{ pts: box(1, 1, w1, h1), label: "A", labelAt: [1.5, 1.5] }, { pts: box(2 + w1 + gap - 1, 1, w2, h2), label: "B", labelAt: [2 + w1 + gap - 0.5, 1.5] }] }), answer: `A = ${A} cm², B = ${A} cm². Different shapes can have the same area.`, working: [`A: ${h1} × ${w1} = ${A}`, `B: ${h2} × ${w2} = ${A}`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["area"] });
}

function chooseAreaUnitQuestion() {
  const T2 = [["a postage stamp", "cm²"], ["the classroom floor", "m²"], ["a playing card", "cm²"], ["a netball court", "m²"], ["the cover of a book", "cm²"], ["a backyard lawn", "m²"], ["a sticky note", "cm²"], ["a tennis court", "m²"]];
  const [t, u] = choice(T2);
  return qA({ type: "choose-area-unit", marks: 1, prompt: `Would you measure the area of ${t} in square centimetres (cm²) or square metres (m²)?`, answer: u === "cm²" ? "square centimetres (cm²)" : "square metres (m²)", working: ["Small surfaces: cm². Large surfaces like floors and fields: m²."], space: SPACE_SIZES.SMALL, mcDistractors: [u === "cm²" ? "square metres (m²)" : "square centimetres (cm²)"], tags: ["units"] });
}

function estimateM2Question() {
  const E = [["a door", "about 2 m²", ["about 2 cm²", "about 20 m²", "about 200 m²"]], ["a classroom floor", "about 60 m²", ["about 6 m²", "about 60 cm²", "about 600 m²"]], ["a single bed", "about 2 m²", ["about 20 m²", "about 2 cm²", "about 200 cm²"]], ["a school desk top", "about 1 m² or less", ["about 10 m²", "about 1 cm²", "about 50 m²"]]];
  const [t, a, d] = choice(E);
  return qA({ type: "estimate-m2", marks: 1, prompt: `A square metre is a square 1 m long and 1 m wide. Which is the best estimate for the area of ${t}?`, answer: a, working: ["Picture how many 1 m by 1 m squares would cover it."], space: SPACE_SIZES.SMALL, mcDistractors: d, tags: ["estimate", "m²"] });
}

const GENERATORS = {
  "split-shape": splitShapeQuestion,
  "combine-shapes": combineShapesQuestion,
  "slide-flip-turn": slideFlipTurnQuestion,
  "describe-slide": describeSlideQuestion,
  "lines-of-symmetry": linesOfSymmetryQuestion,
  "is-it-symmetry": isItSymmetryQuestion,
  "complete-symmetry": completeSymmetryQuestion,
  "area-cm2": areaCm2Question,
  "rectangle-area-cm2": rectangleAreaCm2Question,
  "same-area": sameAreaQuestion,
  "choose-area-unit": chooseAreaUnitQuestion,
  "estimate-m2": estimateM2Question
};

export function getTwoDSpaceBQuestionTypes() { return TYPE_LIST; }
export function generateTwoDSpaceBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
