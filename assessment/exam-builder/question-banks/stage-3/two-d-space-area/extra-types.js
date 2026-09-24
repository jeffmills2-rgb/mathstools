/*
  Mills Maths Tools — Stage 3 2D Space and Area: the visual types
  -----------------------------------------------------------------
  question-banks/stage-3/two-d-space-area/extra-types.js

  The original bank (index.js) asks about shapes and transformations in
  words: "Which quadrilateral has four equal sides…?", "A shape is flipped
  over a line…". Those stay. MA3-2DS-01/02 are about LOOKING at shapes and
  moving them on a grid, so these types put the picture in front of the
  student:

    - classify a DRAWN triangle or quadrilateral from its markings
    - count the lines of symmetry of a drawn shape
    - complete a shape so a dashed line is a line of symmetry (on a grid)
    - name the transformation that maps a shape onto its image (on a grid)
    - describe a translation in grid squares
    - draw the image after a translation, reflection or rotation
    - find the area of a drawn composite (L-shaped) figure, including the
      missing side lengths

  Figures come from engines/geometry/geometry-engine.js (reusing the Stage 4
  triangle and quadrilateral builders, whose markings are the same) and
  engines/grid/grid-engine.js. Grid transformations are computed on vertex
  coordinates and CHECKED to be unambiguous: an image offered as a
  reflection is never also a translation or rotation of the original.
  tools/stage3-visual-gaps.mjs repeats that check independently.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, spaced
} from "../../_shared/bank-helpers.js";
import { fitPoints, TRIANGLE_LETTERS, QUAD_LETTERS } from "../../_shared/figure-helpers.js";
import { buildTriangle, quadFigure, sidesFor } from "../../geometrical-figures/index.js";

const TOPIC = "2D Space and Area";
const SQ = "²";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const geo = (config, notToScale = false) => ({ engine: "geometry-engine", config, ...(notToScale ? { notToScale: true } : {}) });
const grid = config => ({ engine: "grid-engine", config });
const an = w => (/^[aeiou]/i.test(w) ? "an" : "a");

export const EXTRA_TWO_D_TYPES = [
  { id: "classify-triangle-diagram", label: "Classify a drawn triangle" },
  { id: "classify-quadrilateral-diagram", label: "Name a drawn quadrilateral" },
  { id: "symmetry-diagram", label: "Lines of symmetry of a drawn shape" },
  { id: "complete-symmetric", label: "Complete a symmetrical shape on a grid" },
  { id: "name-transformation-grid", label: "Name the transformation on a grid" },
  { id: "describe-translation", label: "Describe a translation in grid squares" },
  { id: "draw-transformation", label: "Draw a translation, reflection or rotation" },
  { id: "composite-area-diagram", label: "Area of a drawn composite shape" }
];

/* ── classifying drawn shapes ────────────────────────────── */

function classifyTriangleDiagramQuestion() {
  const by = choice(["sides", "angles"]);
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;
  let angles; let kind;
  if (by === "sides") {
    kind = choice(["Equilateral", "Isosceles", "Scalene"]);
    if (kind === "Equilateral") angles = [60, 60];
    else if (kind === "Isosceles") { const b = choice([35, 40, 50, 55, 65, 70, 75]); angles = [b, b]; }
    else { do { angles = [randInt(7, 16) * 5, randInt(7, 16) * 5]; } while (new Set([angles[0], angles[1], 180 - angles[0] - angles[1]]).size < 3 || 180 - angles[0] - angles[1] < 30 || [angles[0], angles[1], 180 - angles[0] - angles[1]].some(x => x === 90 || x === 60)); }
  } else {
    kind = choice(["Right-angled", "Acute-angled", "Obtuse-angled"]);
    if (kind === "Right-angled") { const a = choice([30, 35, 40, 50, 55, 60]); angles = [a, 90]; }
    else if (kind === "Acute-angled") { do { angles = [randInt(10, 16) * 5, randInt(10, 16) * 5]; } while (180 - angles[0] - angles[1] < 50 || 180 - angles[0] - angles[1] >= 90); }
    else { const o = choice([105, 110, 115, 120, 125]); const a = choice([25, 30, 35]); angles = [a, o]; }
  }
  const tri = buildTriangle(angles[0], angles[1], { letters, rotateBy: choice([0, 0, 15, -15]) });
  const cfg = { points: tri.points, polygons: [{ pts: letters.slice() }] };
  let notToScale = false;
  const third = 180 - angles[0] - angles[1];
  if (by === "sides") {
    if (kind === "Equilateral") cfg.ticks = [{ from: A, to: B }, { from: B, to: C }, { from: C, to: A }];
    else if (kind === "Isosceles") cfg.ticks = [{ from: A, to: C }, { from: B, to: C }];
    else {
      const lens = sidesFor([angles[0], angles[1], third], randInt(9, 16));
      if (new Set(lens).size < 3) return classifyTriangleDiagramQuestion();
      cfg.sideLabels = [{ from: B, to: C, text: `${lens[0]} cm` }, { from: C, to: A, text: `${lens[1]} cm` }, { from: A, to: B, text: `${lens[2]} cm` }];
      notToScale = true;
    }
  } else if (kind === "Right-angled") {
    cfg.angles = [{ at: B, from: A, to: C, right: true, label: false }];
  } else {
    cfg.angles = [
      { at: A, from: B, to: C, label: `${angles[0]}°` },
      { at: B, from: C, to: A, label: `${angles[1]}°` },
      { at: C, from: A, to: B, label: `${third}°` }
    ];
  }
  const why = {
    Equilateral: "The marks show all three sides are equal.",
    Isosceles: "The marks show exactly two sides are equal.",
    Scalene: "All three sides are different lengths.",
    "Right-angled": "The square corner marks a right angle.",
    "Acute-angled": "All three angles are less than 90°.",
    "Obtuse-angled": "One angle is more than 90°."
  };
  return q({
    type: "classify-triangle-diagram", marks: 1,
    prompt: by === "sides" ? `Classify △${A}${B}${C} by its sides.` : `Classify △${A}${B}${C} by its angles.`,
    diagram: geo(cfg, notToScale),
    answer: kind,
    working: [why[kind]],
    space: SPACE_SIZES.SMALL,
    mcDistractors: (by === "sides" ? ["Equilateral", "Isosceles", "Scalene", "Right-angled"] : ["Right-angled", "Acute-angled", "Obtuse-angled", "Isosceles"]).filter(x => x !== kind),
    tags: ["2D shapes", "classifying", "triangles"]
  });
}

function classifyQuadrilateralDiagramQuestion() {
  const kind = choice(["Square", "Rectangle", "Rhombus", "Parallelogram", "Trapezium", "Kite"]);
  const letters = choice(QUAD_LETTERS);
  const { cfg } = quadFigure(kind, letters, { rotateBy: choice([0, 0, 10, -10, 20]) });
  return q({
    type: "classify-quadrilateral-diagram", marks: 1,
    prompt: `Use the markings to name the quadrilateral ${letters.join("")}.`,
    diagram: geo(cfg, kind === "Kite"),
    answer: kind,
    working: [{
      Square: "Four equal sides (matching marks) and four right angles.",
      Rectangle: "Four right angles; opposite sides equal and parallel.",
      Rhombus: "Four equal sides but no right angles.",
      Parallelogram: "Two pairs of parallel sides (arrow marks), no right angles.",
      Trapezium: "Exactly one pair of parallel sides.",
      Kite: "Two pairs of equal sides next to each other."
    }[kind]],
    space: SPACE_SIZES.SMALL,
    mcDistractors: { Square: ["Rhombus", "Rectangle", "Kite"], Rectangle: ["Square", "Parallelogram", "Trapezium"], Rhombus: ["Square", "Parallelogram", "Kite"], Parallelogram: ["Rhombus", "Rectangle", "Trapezium"], Trapezium: ["Parallelogram", "Kite", "Rectangle"], Kite: ["Rhombus", "Trapezium", "Parallelogram"] }[kind],
    tags: ["2D shapes", "classifying", "quadrilaterals"]
  });
}

/* Regular polygons for symmetry, drawn from their vertices. */
function regularPolygon(n) {
  const names = "ABCDEFGH".split("").slice(0, n);
  const named = {};
  names.forEach((nm, i) => {
    const t = Math.PI / 2 + (i * 2 * Math.PI) / n + (n % 2 === 0 ? Math.PI / n : 0);
    named[`_${nm}`] = [Math.cos(t), Math.sin(t)];
  });
  const points = fitPoints(named, { size: 220, maxH: 190 });
  const pts = names.map(nm => `_${nm}`);
  return {
    points, polygons: [{ pts }], vertexLabels: false,
    ticks: pts.map((p, i) => ({ from: p, to: pts[(i + 1) % n] }))
  };
}

function symmetryDiagramQuestion() {
  const opts = [
    { name: "equilateral triangle", lines: 3, cfg: () => regularPolygon(3) },
    { name: "square", lines: 4, cfg: () => quadFigure("Square", ["_A", "_B", "_C", "_D"]).cfg },
    { name: "rectangle", lines: 2, cfg: () => quadFigure("Rectangle", ["_A", "_B", "_C", "_D"]).cfg },
    { name: "rhombus", lines: 2, cfg: () => quadFigure("Rhombus", ["_A", "_B", "_C", "_D"]).cfg },
    { name: "parallelogram", lines: 0, cfg: () => quadFigure("Parallelogram", ["_A", "_B", "_C", "_D"]).cfg },
    { name: "kite", lines: 1, cfg: () => quadFigure("Kite", ["_A", "_B", "_C", "_D"]).cfg },
    { name: "regular pentagon", lines: 5, cfg: () => regularPolygon(5) },
    { name: "regular hexagon", lines: 6, cfg: () => regularPolygon(6) },
    { name: "regular octagon", lines: 8, cfg: () => regularPolygon(8) }
  ];
  const o = choice(opts);
  const cfg = o.cfg();
  cfg.vertexLabels = false;
  return q({
    type: "symmetry-diagram", marks: 1,
    prompt: `This shape is ${an(o.name)} ${o.name}. How many lines of symmetry does it have?`,
    diagram: geo(cfg, o.name === "kite"),
    answer: String(o.lines),
    working: [o.lines === 0 ? "No fold line makes the two halves match exactly." : `There are ${o.lines} fold lines that make the two halves match.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [0, 1, 2, 3, 4, 5, 6, 8].filter(x => x !== o.lines).slice(0, 5).map(String),
    tags: ["2D shapes", "symmetry"]
  });
}

/* ── grid transformations ────────────────────────────────── */

const SHAPES = [
  [[0, 0], [1, 0], [1, 2], [2, 2], [2, 3], [0, 3]],                   // L
  [[0, 0], [0, 3], [2, 3]],                                           // right triangle
  [[0, 0], [2, 0], [2, 2], [1, 2], [1, 4], [0, 4]],                   // P / flag
  [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2]],                   // step
  [[0, 0], [2, 0], [3, 2], [0, 2]]                                    // right trapezium
];

export const T = {
  translate: (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]),
  reflectV: (pts, m) => pts.map(([x, y]) => [2 * m - x, y]),       // mirror line x = m
  reflectH: (pts, m) => pts.map(([x, y]) => [x, 2 * m - y]),       // mirror line y = m
  rotCW: (pts, cx, cy) => pts.map(([x, y]) => [cx - (y - cy), cy + (x - cx)]),   // quarter turn clockwise (y down)
  rot180: (pts, cx, cy) => pts.map(([x, y]) => [2 * cx - x, 2 * cy - y])
};

/* Shape identity up to position: sorted vertices after moving the min corner to 0. */
export function canon(pts) {
  const mx = Math.min(...pts.map(p => p[0]));
  const my = Math.min(...pts.map(p => p[1]));
  return pts.map(([x, y]) => `${x - mx},${y - my}`).sort().join(";");
}

/* Which kinds of move could take `a` to `b`? (Up to position.) */
export function possibleMoves(a, b) {
  const kb = canon(b);
  const kinds = new Set();
  if (canon(a) === kb) kinds.add("translation");
  if (canon(T.reflectV(a, 0)) === kb || canon(T.reflectH(a, 0)) === kb) kinds.add("reflection");
  const r1 = T.rotCW(a, 0, 0);
  const r2 = T.rotCW(r1, 0, 0);
  const r3 = T.rotCW(r2, 0, 0);
  if ([r1, r2, r3].some(r => canon(r) === kb)) kinds.add("rotation");
  return kinds;
}

const inside = (pts, cols, rows) => pts.every(([x, y]) => x >= 0 && y >= 0 && x <= cols && y <= rows);

function placedShape(cols, rows, maxX, maxY) {
  const s = choice(SHAPES);
  const ox = randInt(0, Math.max(0, maxX));
  const oy = randInt(0, Math.max(0, maxY));
  return T.translate(s, ox, oy);
}

function makeMove(kind, cols, rows) {
  for (let tries = 0; tries < 300; tries++) {
    const shape = placedShape(cols, rows, 3, rows - 4);
    let image; let mirror = null; let dot = null; let words;
    if (kind === "translation") {
      const dx = randInt(3, 7); const dy = randInt(-3, 3);
      image = T.translate(shape, dx, dy);
      words = `${dx} ${dx === 1 ? "square" : "squares"} right${dy ? ` and ${Math.abs(dy)} ${Math.abs(dy) === 1 ? "square" : "squares"} ${dy > 0 ? "down" : "up"}` : ""}`;
    } else if (kind === "reflection") {
      const m = Math.max(...shape.map(p => p[0])) + randInt(0, 2);
      image = T.reflectV(shape, m);
      mirror = { x1: m, y1: 0, x2: m, y2: rows };
      words = `reflected in the dashed line`;
    } else {
      const cx = Math.max(...shape.map(p => p[0])) + randInt(0, 1);
      const cy = Math.max(...shape.map(p => p[1]));
      const half = Math.random() < 0.5;
      image = half ? T.rot180(shape, cx, cy) : T.rotCW(shape, cx, cy);
      dot = { x: cx, y: cy, label: "" };
      words = half ? "a half turn about the dot" : "a quarter turn clockwise about the dot";
    }
    if (!inside(image, cols, rows)) continue;
    // no overlap of vertices' bounding boxes (keep the two shapes apart)
    const bx = s => [Math.min(...s.map(p => p[0])), Math.max(...s.map(p => p[0])), Math.min(...s.map(p => p[1])), Math.max(...s.map(p => p[1]))];
    const [a0, a1, a2, a3] = bx(shape); const [b0, b1, b2, b3] = bx(image);
    if (kind !== "rotation" && !(a1 <= b0 || b1 <= a0 || a3 <= b2 || b3 <= a2)) continue;
    const moves = possibleMoves(shape, image);
    if (moves.size !== 1 || !moves.has(kind)) continue;
    return { shape, image, mirror, dot, words };
  }
  return null;
}

function nameTransformationGridQuestion() {
  const kind = choice(["translation", "reflection", "rotation"]);
  const cols = 12; const rows = 8;
  const m = makeMove(kind, cols, rows);
  if (!m) return nameTransformationGridQuestion();
  return q({
    type: "name-transformation-grid", marks: 1,
    prompt: "Shape A has been moved to shape B. Is this a translation, a reflection or a rotation?",
    diagram: grid({ cols, rows, shapes: [{ pts: m.shape, label: "A" }, { pts: m.image, style: "image", label: "B" }] }),
    answer: kind[0].toUpperCase() + kind.slice(1),
    working: [{
      translation: "B faces the same way as A: it has slid without turning or flipping.",
      reflection: "B is a mirror image of A: it has been flipped.",
      rotation: "B has been turned: it is not a mirror image, and it does not face the same way."
    }[kind]],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["transformations", "grid"]
  });
}

function describeTranslationQuestion() {
  const cols = 12; const rows = 8;
  const m = makeMove("translation", cols, rows);
  if (!m) return describeTranslationQuestion();
  const dx = m.image[0][0] - m.shape[0][0];
  const dy = m.image[0][1] - m.shape[0][1];
  return q({
    type: "describe-translation", marks: 2,
    prompt: "Describe the translation that moves shape A onto shape B.",
    diagram: grid({ cols, rows, shapes: [{ pts: m.shape, label: "A" }, { pts: m.image, style: "image", label: "B" }] }),
    answer: m.words.replace(/^./, c => c.toUpperCase()),
    working: ["Pick one corner of A and count the squares to the matching corner of B.", `Across: ${dx} right${dy ? `; ${dy > 0 ? "down" : "up"} ${Math.abs(dy)}` : "; no movement up or down"}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["transformations", "translation", "grid"]
  });
}

function drawTransformationQuestion() {
  const kind = choice(["translation", "reflection", "rotation"]);
  const cols = 12; const rows = 8;
  const m = makeMove(kind, cols, rows);
  if (!m) return drawTransformationQuestion();
  const verts = m.image.map(([x, y]) => `(${x}, ${y})`).join(", ");
  const prompt = kind === "translation"
    ? `Draw the image of the shape after a translation of ${m.words}.`
    : kind === "reflection"
      ? "Draw the reflection of the shape in the dashed mirror line."
      : `Draw the image of the shape after ${m.words}.`;
  return q({
    type: "draw-transformation", marks: 2,
    prompt,
    diagram: grid({ cols, rows, shapes: [{ pts: m.shape }], mirror: m.mirror, dots: m.dot ? [m.dot] : [] }),
    answer: `Image drawn with corners at ${verts} (counting squares from the top-left corner of the grid)`,
    working: [kind === "reflection" ? "Each corner of the image is the same distance from the mirror line as the matching corner of the shape, on the other side." : kind === "translation" ? "Move every corner the same number of squares, then join them." : "Turn the shape about the dot; each corner stays the same distance from the dot."],
    space: "none",
    mcEligible: false,
    tags: ["transformations", "grid", "draw"]
  });
}

function completeSymmetricQuestion() {
  const cols = 10; const rows = 7;
  const m = 5;
  // A half-shape touching the mirror line on the left, built from grid steps.
  for (let tries = 0; tries < 200; tries++) {
    const top = randInt(0, 2);
    const bottom = randInt(top + 3, rows);
    const w1 = randInt(1, 4); const w2 = randInt(1, 4);
    const mid = randInt(top + 1, bottom - 1);
    const half = [[m, top], [m - w1, top], [m - w1, mid], [m - w2, mid], [m - w2, bottom], [m, bottom]];
    if (w1 === w2 && Math.random() < 0.7) continue;
    return q({
      type: "complete-symmetric", marks: 2,
      prompt: "Complete the shape so that the dashed line is a line of symmetry.",
      diagram: grid({ cols, rows, shapes: [{ pts: half }], mirror: { x1: m, y1: 0, x2: m, y2: rows } }),
      answer: `The right half is the mirror image of the left: corners at ${T.reflectV(half, m).filter(p => p[0] !== m).map(([x, y]) => `(${x}, ${y})`).join(", ")}`,
      working: ["Each corner on the left has a partner the same distance from the line on the right."],
      space: "none",
      mcEligible: false,
      tags: ["symmetry", "grid", "draw"]
    });
  }
  return null;
}

/* ── composite area from a drawing ───────────────────────── */

function compositeAreaDiagramQuestion() {
  const unit = choice(["cm", "m"]);
  const W = randInt(8, 16); const H = randInt(6, 12);
  const w = randInt(3, W - 3); const h = randInt(2, H - 3);   // the cut-out corner (top right)
  const area = W * H - (W - w) * (H - h);
  // y-up points: L-shape with the notch at the top right
  const named = { A: [0, 0], B: [W, 0], C: [W, h], D: [w, h], E: [w, H], F: [0, H] };
  const points = fitPoints(named, { size: 280, maxH: 190 });
  const hideSome = Math.random() < 0.5;
  const labels = [
    { from: "A", to: "B", text: `${W} ${unit}` },
    { from: "F", to: "A", text: `${H} ${unit}` },
    { from: "E", to: "F", text: `${w} ${unit}` },
    { from: "B", to: "C", text: `${h} ${unit}` }
  ];
  if (!hideSome) labels.push({ from: "C", to: "D", text: `${W - w} ${unit}` }, { from: "D", to: "E", text: `${H - h} ${unit}` });
  const rects = [`${W} × ${h} = ${spaced(W * h)}`, `${w} × ${H - h} = ${spaced(w * (H - h))}`];
  return q({
    type: "composite-area-diagram", marks: hideSome ? 3 : 2,
    prompt: "Find the area of this shape. All the corners are right angles.",
    diagram: geo({ points, polygons: [{ pts: ["A", "B", "C", "D", "E", "F"] }], vertexLabels: false, sideLabels: labels }, true),
    answer: `${spaced(area)} ${unit}${SQ}`,
    working: [
      ...(hideSome ? [`Missing lengths: ${W} − ${w} = ${W - w} ${unit} and ${H} − ${h} = ${H - h} ${unit}.`] : []),
      "Split it into two rectangles:",
      `Bottom: ${rects[0]} ${unit}${SQ}; top: ${rects[1]} ${unit}${SQ}`,
      `Total: ${spaced(area)} ${unit}${SQ}`
    ],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${spaced(W * H)} ${unit}${SQ}`, `${spaced(2 * (W + H))} ${unit}${SQ}`, `${spaced(area)} ${unit}`, `${spaced(W * H - w * h)} ${unit}${SQ}`],
    tags: ["area", "composite", "diagram"]
  });
}

export const EXTRA_TWO_D_GENERATORS = {
  "classify-triangle-diagram": classifyTriangleDiagramQuestion,
  "classify-quadrilateral-diagram": classifyQuadrilateralDiagramQuestion,
  "symmetry-diagram": symmetryDiagramQuestion,
  "complete-symmetric": completeSymmetricQuestion,
  "name-transformation-grid": nameTransformationGridQuestion,
  "describe-translation": describeTranslationQuestion,
  "draw-transformation": drawTransformationQuestion,
  "composite-area-diagram": compositeAreaDiagramQuestion
};
