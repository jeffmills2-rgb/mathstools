/*
  Mills Maths Tools — Stage 4 Question Bank: Properties of Geometrical Figures
  -----------------------------------------------------------------------------
  question-banks/geometrical-figures/index.js

  NSW Mathematics K–10 (2022), Stage 4, MA4-GEO-C-01:
    "identifies and applies the properties of triangles and quadrilaterals to
     solve problems"

  Content covered (see docs/stage-4-syllabus-reference.md for the mapping):
    - naming and labelling conventions: vertices, intervals, ∠ABC, △ABC, ∥, ⊥
    - classifying triangles by sides and by angles
    - classifying quadrilaterals from their markings, and their properties
      (sides, angles, diagonals), including the classification hierarchy
    - convex and non-convex polygons
    - the angle sum of a triangle and of a quadrilateral, the exterior angle
      of a triangle, and the angle properties of isosceles and equilateral
      triangles and of the special quadrilaterals
    - the reasoning behind the angle-sum results
    - finding unknown sides and angles, with reasons, including algebraically

  Every figure is built from its angles (question-banks/_shared/figure-
  helpers.js) and drawn by engines/geometry/geometry-engine.js, so what is
  printed is the triangle the numbers describe. tools/stage4-geometry.mjs
  re-measures each figure and checks it against the answer.

  Conventions (same as the Stage 3 banks): every labelled angle is a whole
  number of degrees and at least 20°, so its arc can be labelled; one mark is
  a single step, two marks need working or a reason; answers that are angles
  carry the degree sign.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, fmt
} from "../_shared/bank-helpers.js";

import {
  fitPoints, polygonFromAngles, triangleFromAngles, extendBeyond, nameVertices,
  TRIANGLE_LETTERS, QUAD_LETTERS, PRONUMERALS
} from "../_shared/figure-helpers.js";

const TOPIC = "Properties of Geometrical Figures";

const TYPE_LIST = [
  { id: "naming-conventions", label: "Naming and labelling conventions" },
  { id: "classify-triangle-sides", label: "Classify triangles by their sides" },
  { id: "classify-triangle-angles", label: "Classify triangles by their angles" },
  { id: "classify-triangle-both", label: "Classify triangles by sides and angles" },
  { id: "classify-quadrilateral", label: "Name a quadrilateral from its markings" },
  { id: "quadrilateral-properties", label: "Properties of special quadrilaterals" },
  { id: "hierarchy-true-false", label: "Classification hierarchy: true or false" },
  { id: "convex-non-convex", label: "Convex and non-convex polygons" },
  { id: "triangle-angle-sum", label: "Angle sum of a triangle" },
  { id: "isosceles-equilateral", label: "Isosceles and equilateral triangles" },
  { id: "exterior-angle", label: "Exterior angle of a triangle" },
  { id: "quadrilateral-angle-sum", label: "Angle sum of a quadrilateral" },
  { id: "special-quadrilateral-angles", label: "Angles in special quadrilaterals" },
  { id: "unknown-sides", label: "Unknown sides using properties" },
  { id: "algebraic-angles", label: "Angles with algebraic expressions" },
  { id: "multi-step-angles", label: "Multi-step angle problems (with reasons)" },
  { id: "angle-sum-reasoning", label: "Explain the angle-sum results" },
  { id: "multi-part-geometry", label: "Multi-part geometry problem" }
];

const REASONS = {
  triangleSum: "The angle sum of a triangle is 180°.",
  quadSum: "The angle sum of a quadrilateral is 360°.",
  isosceles: "The base angles of an isosceles triangle are equal.",
  equilateral: "Each angle of an equilateral triangle is 60°.",
  exterior: "The exterior angle of a triangle equals the sum of the two interior opposite angles.",
  straight: "Angles on a straight line add to 180°.",
  point: "Angles at a point add to 360°.",
  parOpposite: "Opposite angles of a parallelogram are equal.",
  coInterior: "Co-interior angles on parallel lines are supplementary (add to 180°).",
  alternate: "Alternate angles on parallel lines are equal.",
  kite: "In a kite, the angles between the unequal sides are equal.",
  isoTrap: "The base angles of an isosceles trapezium are equal.",
  vertOpp: "Vertically opposite angles are equal."
};

/* ── figure plumbing ─────────────────────────────────────── */

function figure(config, { notToScale = false } = {}) {
  return {
    engine: "geometry-engine",
    config,
    ...(notToScale ? { notToScale: true } : {})
  };
}

function q(spec) {
  return makeQuestion(TOPIC, spec);
}

/* A triangle with angles a (first letter), b (second), c = 180 − a − b. */
function buildTriangle(a, b, { letters = choice(TRIANGLE_LETTERS), size = 290, maxH = 200, rotateBy = 0 } = {}) {
  const raw = triangleFromAngles(a, b, 10);
  const points = fitPoints(nameVertices(raw, letters), { size, maxH, rotateBy });
  return { points, letters, angles: { [letters[0]]: a, [letters[1]]: b, [letters[2]]: 180 - a - b } };
}

function triPoly(letters) {
  return [{ pts: letters.slice() }];
}

/* Arc spec for the interior angle at vertex `v` of a polygon listed as `ring`. */
function interiorAngle(ring, v, label, extra = {}) {
  const i = ring.indexOf(v);
  const prev = ring[(i - 1 + ring.length) % ring.length];
  const next = ring[(i + 1) % ring.length];
  return { at: v, from: prev, to: next, label, ...extra };
}

function deg(n) {
  return `${n}°`;
}

/* A whole-degree angle in [min, max] that is a multiple of `step`. */
function angleIn(min, max, step = 1) {
  return randInt(Math.ceil(min / step), Math.floor(max / step)) * step;
}

/* Three triangle angles, each at least `min`, all multiples of `step`. */
function triangleAngles({ min = 25, step = 5, maxAngle = 130 } = {}) {
  for (let i = 0; i < 200; i++) {
    const a = angleIn(min, maxAngle, step);
    const b = angleIn(min, maxAngle, step);
    const c = 180 - a - b;
    if (c >= min && c <= maxAngle) return [a, b, c];
  }
  return [50, 60, 70];
}

function numericDistractors(value, suffix = "°") {
  const set = new Set();
  [value + 10, value - 10, 180 - value, 90 - value, value * 2, value + 20, Math.round(value / 2)]
    .filter(v => v > 0 && v !== value && v < 360)
    .forEach(v => set.add(`${v}${suffix}`));
  return [...set].slice(0, 5);
}

/* ── naming and labelling ────────────────────────────────── */

function namingConventionsQuestion() {
  const variant = choice(["angle", "opposite-side", "opposite-angle", "parallel", "perpendicular", "triangle-name"]);
  const [A, B, C] = choice(TRIANGLE_LETTERS);

  if (variant === "parallel" || variant === "perpendicular") {
    const [P, Q, R, S] = choice(QUAD_LETTERS);
    if (variant === "parallel") {
      const points = { [P]: [0, 0], [Q]: [300, 0], [R]: [40, 110], [S]: [340, 110] };
      return q({
        type: "naming-conventions",
        marks: 1,
        prompt: "Use mathematical symbols to write the relationship between the intervals shown by the markings.",
        diagram: figure({
          points,
          segments: [{ from: P, to: Q }, { from: R, to: S }],
          parallel: [{ from: P, to: Q }, { from: R, to: S }],
          dots: [P, Q, R, S],
          labelOffsets: { [P]: [-18, -4], [Q]: [18, -4], [R]: [-18, 4], [S]: [18, 4] }
        }),
        answer: `${P}${Q} ∥ ${R}${S}`,
        working: ["The matching arrows show the intervals are parallel.", `${P}${Q} ∥ ${R}${S}`],
        space: SPACE_SIZES.SMALL,
        mcDistractors: [`${P}${Q} ⊥ ${R}${S}`, `${P}${Q} = ${R}${S}`, `∠${P}${Q}${R}${S}`],
        tags: ["geometry", "notation", "parallel"]
      });
    }
    const points = { [P]: [0, 120], [Q]: [300, 120], [R]: [150, 0], [S]: [150, 200], _O: [150, 120] };
    return q({
      type: "naming-conventions",
      marks: 1,
      prompt: "Use mathematical symbols to write the relationship between the two intervals.",
      diagram: figure({
        points,
        segments: [{ from: P, to: Q }, { from: R, to: S }],
        angles: [{ at: "_O", from: Q, to: R, right: true, label: false }],
        dots: [P, Q, R, S],
        labelOffsets: { [P]: [-18, 0], [Q]: [18, 0], [R]: [0, -18], [S]: [0, 18] }
      }),
      answer: `${P}${Q} ⊥ ${R}${S}`,
      working: ["The square mark shows a right angle, so the intervals are perpendicular.", `${P}${Q} ⊥ ${R}${S}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${P}${Q} ∥ ${R}${S}`, `${P}${Q} = ${R}${S}`, `△${P}${Q}${R}`],
      tags: ["geometry", "notation", "perpendicular"]
    });
  }

  const [a, b] = triangleAngles({ min: 35, maxAngle: 110 });
  const tri = buildTriangle(a, b, { letters: [A, B, C] });

  if (variant === "angle") {
    const at = choice([A, B, C]);
    const others = [A, B, C].filter(v => v !== at);
    return q({
      type: "naming-conventions",
      marks: 1,
      prompt: "Name the marked angle using three letters.",
      diagram: figure({
        points: tri.points,
        polygons: triPoly([A, B, C]),
        angles: [interiorAngle([A, B, C], at, false)]
      }),
      answer: `∠${others[0]}${at}${others[1]}`,
      working: [`The vertex of the angle, ${at}, is the middle letter.`, `∠${others[0]}${at}${others[1]} (or ∠${others[1]}${at}${others[0]})`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`∠${at}${others[0]}${others[1]}`, `∠${others[0]}${others[1]}${at}`, `∠${at}${others[1]}${others[0]}`],
      tags: ["geometry", "notation", "naming angles"]
    });
  }

  if (variant === "opposite-side") {
    const v = choice([A, B, C]);
    const side = [A, B, C].filter(x => x !== v).join("");
    return q({
      type: "naming-conventions",
      marks: 1,
      prompt: `In △${A}${B}${C}, name the side opposite vertex ${v}.`,
      diagram: figure({ points: tri.points, polygons: triPoly([A, B, C]) }),
      answer: side,
      working: [`The side opposite ${v} does not touch ${v}: it joins the other two vertices.`, side],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [[A, B, C].filter(x => x !== side[0]).join(""), [A, B, C].filter(x => x !== side[1]).join(""), `∠${v}`],
      tags: ["geometry", "notation"]
    });
  }

  if (variant === "opposite-angle") {
    const pair = sample([A, B, C], 2);
    const v = [A, B, C].find(x => !pair.includes(x));
    return q({
      type: "naming-conventions",
      marks: 1,
      prompt: `In △${A}${B}${C}, name the angle opposite the side ${pair[0]}${pair[1]} using three letters.`,
      diagram: figure({ points: tri.points, polygons: triPoly([A, B, C]) }),
      answer: `∠${pair[0]}${v}${pair[1]}`,
      working: [`The angle opposite ${pair[0]}${pair[1]} is at the vertex not on that side, ${v}.`, `∠${pair[0]}${v}${pair[1]}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`∠${v}${pair[0]}${pair[1]}`, `∠${pair[0]}${pair[1]}${v}`, `∠${v}${pair[1]}${pair[0]}`],
      tags: ["geometry", "notation", "naming angles"]
    });
  }

  // triangle-name with an angle labelled: "Write ∠ = value"
  const at = choice([A, B, C]);
  const others = [A, B, C].filter(v => v !== at);
  return q({
    type: "naming-conventions",
    marks: 1,
    prompt: `Complete the statement using the diagram: ∠${others[0]}${at}${others[1]} = ___`,
    diagram: figure({
      points: tri.points,
      polygons: triPoly([A, B, C]),
      angles: [A, B, C].map(v => interiorAngle([A, B, C], v, deg(tri.angles[v])))
    }),
    answer: deg(tri.angles[at]),
    working: [`∠${others[0]}${at}${others[1]} is the angle at vertex ${at}.`, `∠${others[0]}${at}${others[1]} = ${deg(tri.angles[at])}`],
    space: SPACE_SIZES.NONE,
    mcDistractors: others.map(v => deg(tri.angles[v])).concat([deg(180 - tri.angles[at])]),
    tags: ["geometry", "notation", "naming angles"]
  });
}

/* ── classifying triangles ───────────────────────────────── */

const SIDE_CLASSES = ["Equilateral", "Isosceles", "Scalene"];
const ANGLE_CLASSES = ["Acute-angled", "Right-angled", "Obtuse-angled"];

function angleClass(angles) {
  const m = Math.max(...angles);
  return m === 90 ? "Right-angled" : m > 90 ? "Obtuse-angled" : "Acute-angled";
}

/* Side lengths, proportional to the sines of the opposite angles, as whole numbers. */
function sidesFor(angles, scale) {
  const s = angles.map(a => Math.sin(a * Math.PI / 180));
  const k = scale / Math.max(...s);
  return s.map(v => Math.round(v * k));
}

function classifyTriangleSidesQuestion() {
  const kind = choice(SIDE_CLASSES);
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;
  const asWords = Math.random() < 0.35;

  if (asWords) {
    let sides;
    if (kind === "Equilateral") { const s = randInt(4, 15); sides = [s, s, s]; }
    else if (kind === "Isosceles") {
      const s = randInt(5, 14);
      let t; do { t = randInt(3, 2 * s - 1); } while (t === s);
      sides = shuffle([s, s, t]);
    } else {
      do { sides = [randInt(4, 15), randInt(4, 15), randInt(4, 15)].sort((x, y) => x - y); }
      while (new Set(sides).size < 3 || sides[0] + sides[1] <= sides[2]);
      sides = shuffle(sides);
    }
    const unit = choice(["cm", "m", "mm"]);
    return q({
      type: "classify-triangle-sides",
      marks: 1,
      prompt: `A triangle has sides of length ${sides[0]} ${unit}, ${sides[1]} ${unit} and ${sides[2]} ${unit}. Classify the triangle by its sides.`,
      answer: kind,
      working: [kind === "Equilateral" ? "All three sides are equal." : kind === "Isosceles" ? "Exactly two sides are equal." : "No two sides are equal.", kind],
      space: SPACE_SIZES.SMALL,
      mcDistractors: SIDE_CLASSES.filter(k => k !== kind).concat(["Right-angled"]),
      tags: ["geometry", "classify triangles", "sides"]
    });
  }

  let angles;
  if (kind === "Equilateral") angles = [60, 60, 60];
  else if (kind === "Isosceles") { const base = choice([35, 40, 45, 50, 55, 65, 70, 75]); angles = [base, base, 180 - 2 * base]; }
  else angles = (() => { let t; do { t = triangleAngles({ min: 30, maxAngle: 110 }); } while (new Set(t).size < 3 || Math.max(...t) - Math.min(...t) < 25 || t.includes(90) || t.includes(60)); return t; })();

  const tri = buildTriangle(angles[0], angles[1], { letters, rotateBy: choice([0, 0, 15, -15, 180]) });
  const cfg = { points: tri.points, polygons: triPoly(letters) };
  let notToScale = false;

  if (kind === "Equilateral") {
    cfg.ticks = [{ from: A, to: B }, { from: B, to: C }, { from: C, to: A }];
  } else if (kind === "Isosceles") {
    // Angles at A and B are equal, so the equal sides are the ones meeting at C.
    cfg.ticks = [{ from: A, to: C }, { from: B, to: C }];
  } else {
    // A scalene triangle is shown by labelling three different lengths.
    const unit = choice(["cm", "m"]);
    const lens = sidesFor(angles, randInt(9, 16));
    cfg.sideLabels = [
      { from: B, to: C, text: `${lens[0]} ${unit}` },
      { from: C, to: A, text: `${lens[1]} ${unit}` },
      { from: A, to: B, text: `${lens[2]} ${unit}` }
    ];
    if (new Set(lens).size < 3) return classifyTriangleSidesQuestion();
    notToScale = true;
  }

  return q({
    type: "classify-triangle-sides",
    marks: 1,
    prompt: `Classify △${A}${B}${C} by its sides.`,
    diagram: figure(cfg, { notToScale }),
    answer: kind,
    working: [
      kind === "Equilateral" ? "The matching marks show all three sides are equal."
        : kind === "Isosceles" ? "The matching marks show exactly two sides are equal."
          : "All three sides have different lengths.",
      kind
    ],
    space: SPACE_SIZES.SMALL,
    mcDistractors: SIDE_CLASSES.filter(k => k !== kind).concat(["Right-angled"]),
    tags: ["geometry", "classify triangles", "sides"]
  });
}

function classifyTriangleAnglesQuestion() {
  const target = choice(ANGLE_CLASSES);
  let angles;
  do {
    if (target === "Right-angled") { const a = angleIn(25, 65, 5); angles = shuffle([90, a, 90 - a]); }
    else if (target === "Obtuse-angled") { const big = angleIn(95, 125, 5); const a = angleIn(25, 180 - big - 25, 5); angles = shuffle([big, a, 180 - big - a]); }
    else angles = triangleAngles({ min: 35, maxAngle: 85 });
  } while (angles.some(v => v < 25) || angleClass(angles) !== target);

  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;

  if (Math.random() < 0.45) {
    const shown = angles.slice(0, 2);
    const third = angles[2];
    return q({
      type: "classify-triangle-angles",
      marks: 2,
      prompt: `Two angles of a triangle are ${deg(shown[0])} and ${deg(shown[1])}. Find the third angle, then classify the triangle by its angles.`,
      answer: `${deg(third)}; ${target.toLowerCase()} triangle`,
      working: [
        REASONS.triangleSum,
        `Third angle = 180° − ${shown[0]}° − ${shown[1]}° = ${third}°`,
        target === "Right-angled" ? "One angle is 90°, so the triangle is right-angled."
          : target === "Obtuse-angled" ? `One angle (${Math.max(...angles)}°) is greater than 90°, so the triangle is obtuse-angled.`
            : "All three angles are less than 90°, so the triangle is acute-angled."
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "classify triangles", "angles", "angle sum"]
    });
  }

  const tri = buildTriangle(angles[0], angles[1], { letters });
  const arcs = letters.map(v => tri.angles[v] === 90
    ? interiorAngle(letters, v, false, { right: true })
    : interiorAngle(letters, v, deg(tri.angles[v])));

  return q({
    type: "classify-triangle-angles",
    marks: 1,
    prompt: `Classify △${A}${B}${C} by its angles.`,
    diagram: figure({ points: tri.points, polygons: triPoly(letters), angles: arcs }),
    answer: target,
    working: [
      target === "Right-angled" ? "One angle is a right angle."
        : target === "Obtuse-angled" ? "One angle is greater than 90°."
          : "Every angle is less than 90°.",
      target
    ],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ANGLE_CLASSES.filter(k => k !== target).concat(["Isosceles"]),
    tags: ["geometry", "classify triangles", "angles"]
  });
}

function classifyTriangleBothQuestion() {
  const combos = [
    { sides: "isosceles", angles: "right-angled", make: () => [45, 45] },
    { sides: "isosceles", angles: "obtuse-angled", make: () => { const b = angleIn(20, 40, 5); return [b, b]; } },
    { sides: "isosceles", angles: "acute-angled", make: () => { const b = choice([50, 55, 65, 70, 75]); return [b, b]; } },
    { sides: "scalene", angles: "right-angled", make: () => { const a = choice([30, 35, 40, 50, 55, 60]); return [a, 90]; } },
    { sides: "scalene", angles: "obtuse-angled", make: () => { const a = angleIn(20, 35, 5); return [a, 180 - a - angleIn(100, 125, 5)]; } },
    { sides: "scalene", angles: "acute-angled", make: () => [choice([50, 55]), choice([65, 70])] },
    { sides: "equilateral", angles: "acute-angled", make: () => [60, 60] }
  ];
  const combo = choice(combos);
  const [a, b] = combo.make();
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;
  const tri = buildTriangle(a, b, { letters, rotateBy: choice([0, 0, 20, -20]) });
  const angs = letters.map(v => tri.angles[v]);
  const cfg = { points: tri.points, polygons: triPoly(letters), angles: [] };

  // Markings carry the information: ticks for equal sides, a square for 90°,
  // and — where needed to show "obtuse" or "scalene" — the angle sizes.
  if (combo.sides === "equilateral") cfg.ticks = [{ from: A, to: B }, { from: B, to: C }, { from: C, to: A }];
  if (combo.sides === "isosceles") cfg.ticks = [{ from: A, to: C }, { from: B, to: C }];
  letters.forEach(v => {
    if (tri.angles[v] === 90) cfg.angles.push(interiorAngle(letters, v, false, { right: true }));
  });
  if (combo.sides !== "equilateral") {
    letters.forEach(v => { if (tri.angles[v] !== 90) cfg.angles.push(interiorAngle(letters, v, deg(tri.angles[v]))); });
  }

  const name = combo.sides === "equilateral" ? "Equilateral (acute-angled) triangle" : `${combo.angles[0].toUpperCase()}${combo.angles.slice(1)} ${combo.sides} triangle`;

  return q({
    type: "classify-triangle-both",
    marks: 2,
    prompt: `Classify △${A}${B}${C} by both its sides and its angles.`,
    diagram: figure(cfg),
    answer: name,
    working: [
      combo.sides === "equilateral" ? "Sides: all three sides are marked equal, so it is equilateral."
        : combo.sides === "isosceles" ? "Sides: two sides are marked equal, so it is isosceles."
          : "Sides: all three angles are different, so all three sides are different — it is scalene.",
      `Angles: ${Math.max(...angs) === 90 ? "one angle is 90°" : Math.max(...angs) > 90 ? `one angle (${Math.max(...angs)}°) is obtuse` : "all angles are acute"}, so it is ${combo.angles}.`,
      name
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "classify triangles"]
  });
}

/* ── quadrilaterals ──────────────────────────────────────── */

const QUAD_NAMES = ["Square", "Rectangle", "Rhombus", "Parallelogram", "Trapezium", "Kite"];

/*
  Screen coordinates for each special quadrilateral, ring order A → B → C → D.
  Returns { raw (y-up points), marks (ticks/parallel/right-angle specs keyed by
  ring index) }.
*/
function quadShape(kind) {
  if (kind === "Square") {
    return { raw: [[0, 0], [10, 0], [10, 10], [0, 10]], ticks: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], right: [0, 1, 2, 3] };
  }
  if (kind === "Rectangle") {
    const h = choice([5, 6, 7]);
    return { raw: [[0, 0], [12, 0], [12, h], [0, h]], ticks: [[0, 1, 1], [2, 3, 1], [1, 2, 2], [3, 0, 2]], right: [0, 1, 2, 3] };
  }
  if (kind === "Rhombus") {
    const t = choice([55, 60, 65, 70, 115, 120]) * Math.PI / 180;
    const s = 10;
    return { raw: [[0, 0], [s, 0], [s + s * Math.cos(t), s * Math.sin(t)], [s * Math.cos(t), s * Math.sin(t)]], ticks: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], right: [] };
  }
  if (kind === "Parallelogram") {
    const k = choice([3, 4, -3]);
    const h = choice([5, 6]);
    return { raw: [[0, 0], [12, 0], [12 + k, h], [k, h]], ticks: [[0, 1, 1], [2, 3, 1], [1, 2, 2], [3, 0, 2]], parallel: [[0, 1, 1], [3, 2, 1], [0, 3, 2], [1, 2, 2]], right: [] };
  }
  if (kind === "Trapezium") {
    const k1 = choice([2, 3, 0]);
    const k2 = choice([3, 4, 5]);
    return { raw: [[0, 0], [14, 0], [14 - k2, 6], [k1, 6]], parallel: [[0, 1, 1], [3, 2, 1]], right: k1 === 0 ? [0, 3] : [] };
  }
  // Kite: top vertex, right, bottom, left — ring A(top) B(right) C(bottom) D(left)
  const top = choice([4, 5]);
  const bottom = choice([9, 10]);
  const half = choice([5, 6]);
  return { raw: [[0, top], [half, 0], [0, -bottom], [-half, 0]], ticks: [[0, 1, 1], [3, 0, 1], [1, 2, 2], [2, 3, 2]], right: [] };
}

function quadFigure(kind, letters, { markings = true, rotateBy = 0, extra = {} } = {}) {
  const shape = quadShape(kind);
  const points = fitPoints(nameVertices(shape.raw, letters), { size: 280, rotateBy });
  const L = i => letters[i];
  const cfg = { points, polygons: [{ pts: letters.slice() }], ...extra };
  if (markings) {
    cfg.ticks = (shape.ticks || []).map(([i, j, c]) => ({ from: L(i), to: L(j), count: c }));
    cfg.parallel = (shape.parallel || []).map(([i, j, c]) => ({ from: L(i), to: L(j), count: c }));
    cfg.angles = (shape.right || []).map(i => interiorAngle(letters, L(i), false, { right: true }));
  }
  return { cfg, points };
}

function classifyQuadrilateralQuestion() {
  const kind = choice(QUAD_NAMES);
  const letters = choice(QUAD_LETTERS);
  const { cfg } = quadFigure(kind, letters, { rotateBy: choice([0, 0, 10, -10, 25, 90]) });

  const why = {
    Square: "All four sides are equal and all four angles are right angles.",
    Rectangle: "Opposite sides are equal and all four angles are right angles.",
    Rhombus: "All four sides are equal, but the angles are not right angles.",
    Parallelogram: "Both pairs of opposite sides are parallel (and equal).",
    Trapezium: "Exactly one pair of sides is marked parallel.",
    Kite: "Two pairs of adjacent sides are equal."
  };

  return q({
    type: "classify-quadrilateral",
    marks: 1,
    prompt: `Use the markings to give the most specific name for quadrilateral ${letters.join("")}.`,
    diagram: figure(cfg, { notToScale: kind === "Kite" }),
    answer: kind,
    working: [why[kind], kind],
    space: SPACE_SIZES.SMALL,
    mcDistractors: {
      Square: ["Rhombus", "Rectangle", "Kite"],
      Rectangle: ["Square", "Parallelogram", "Trapezium"],
      Rhombus: ["Square", "Parallelogram", "Kite"],
      Parallelogram: ["Rhombus", "Rectangle", "Trapezium"],
      Trapezium: ["Parallelogram", "Kite", "Rectangle"],
      Kite: ["Rhombus", "Trapezium", "Parallelogram"]
    }[kind],
    tags: ["geometry", "classify quadrilaterals"]
  });
}

/* Properties that are ALWAYS true, by quadrilateral. Kept to unambiguous ones. */
const QUAD_PROPERTIES = [
  { text: "all four sides equal", has: ["Square", "Rhombus"] },
  { text: "all four angles equal to 90°", has: ["Square", "Rectangle"] },
  { text: "both pairs of opposite sides parallel", has: ["Square", "Rectangle", "Rhombus", "Parallelogram"] },
  { text: "opposite angles equal", has: ["Square", "Rectangle", "Rhombus", "Parallelogram"] },
  { text: "diagonals that are equal in length", has: ["Square", "Rectangle"] },
  { text: "diagonals that bisect each other", has: ["Square", "Rectangle", "Rhombus", "Parallelogram"] },
  { text: "diagonals that meet at right angles", has: ["Square", "Rhombus", "Kite"] },
  { text: "diagonals that bisect the angles at each vertex", has: ["Square", "Rhombus"] }
];

const EXTRA_PROPERTY = {
  "Square|Rectangle": "four equal sides (or: diagonals that meet at right angles)",
  "Square|Rhombus": "four right angles (or: diagonals that are equal in length)",
  "Rectangle|Parallelogram": "four right angles (or: diagonals that are equal in length)",
  "Rhombus|Parallelogram": "four equal sides (or: diagonals that meet at right angles)",
  "Parallelogram|Trapezium": "two pairs of parallel sides, not just one",
  "Square|Parallelogram": "four equal sides and four right angles"
};

function quadrilateralPropertiesQuestion() {
  if (Math.random() < 0.6) {
    const prop = choice(QUAD_PROPERTIES);
    const correct = choice(prop.has.filter(n => n !== "Square") .length ? prop.has.filter(n => n !== "Square") : prop.has);
    const wrong = QUAD_NAMES.filter(n => !prop.has.includes(n));
    if (wrong.length < 3) return quadrilateralPropertiesQuestion();
    const options = shuffle([correct, ...sample(wrong, 3)]);
    return q({
      type: "quadrilateral-properties",
      marks: 1,
      prompt: `Which of these quadrilaterals always has ${prop.text}?`,
      choices: options,
      answer: correct,
      working: [`A ${correct.toLowerCase()} always has ${prop.text}; the others do not always.`, correct],
      space: SPACE_SIZES.SMALL,
      tags: ["geometry", "quadrilateral properties"]
    });
  }

  const [special, general] = choice(Object.keys(EXTRA_PROPERTY)).split("|");
  return q({
    type: "quadrilateral-properties",
    marks: 2,
    prompt: `Every ${special.toLowerCase()} is also a ${general.toLowerCase()}. State a property that a ${special.toLowerCase()} always has but a ${general.toLowerCase()} does not always have.`,
    answer: `A ${special.toLowerCase()} always has ${EXTRA_PROPERTY[`${special}|${general}`]}.`,
    working: [
      `A ${special.toLowerCase()} has every property of a ${general.toLowerCase()}, plus more.`,
      `For example: ${EXTRA_PROPERTY[`${special}|${general}`]}.`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "quadrilateral properties", "hierarchy"]
  });
}

const HIERARCHY_STATEMENTS = [
  { s: "Every square is a rectangle.", t: true, why: "A square has four right angles and opposite sides equal, so it meets the definition of a rectangle." },
  { s: "Every rectangle is a square.", t: false, why: "A rectangle's adjacent sides do not have to be equal." },
  { s: "Every square is a rhombus.", t: true, why: "A square has four equal sides, so it meets the definition of a rhombus." },
  { s: "Every rhombus is a square.", t: false, why: "A rhombus's angles do not have to be right angles." },
  { s: "Every rhombus is a parallelogram.", t: true, why: "Both pairs of opposite sides of a rhombus are parallel." },
  { s: "Every parallelogram is a rhombus.", t: false, why: "The adjacent sides of a parallelogram do not have to be equal." },
  { s: "Every rectangle is a parallelogram.", t: true, why: "Both pairs of opposite sides of a rectangle are parallel." },
  { s: "Every parallelogram is a rectangle.", t: false, why: "The angles of a parallelogram do not have to be right angles." },
  { s: "Every kite is a rhombus.", t: false, why: "A kite's sides are equal in adjacent pairs, not all four equal." },
  { s: "Every square is a parallelogram.", t: true, why: "Both pairs of opposite sides of a square are parallel." },
  { s: "A rectangle's diagonals are always equal in length.", t: true, why: "This is a property of every rectangle (and so of every square)." },
  { s: "A parallelogram's diagonals are always equal in length.", t: false, why: "Only when the parallelogram is a rectangle; a slanted parallelogram has one long and one short diagonal." },
  { s: "A rhombus's diagonals always meet at right angles.", t: true, why: "This is a property of every rhombus." },
  { s: "A rectangle's diagonals always meet at right angles.", t: false, why: "Only when the rectangle is a square." },
  { s: "Every equilateral triangle is isosceles.", t: true, why: "An isosceles triangle has at least two equal sides, and an equilateral triangle has three." },
  { s: "A triangle can have two obtuse angles.", t: false, why: "Two obtuse angles would already add to more than 180°, the angle sum of a triangle." },
  { s: "A right-angled triangle can also be isosceles.", t: true, why: "Angles of 90°, 45° and 45° give two equal sides." }
];

function hierarchyTrueFalseQuestion() {
  const st = choice(HIERARCHY_STATEMENTS);
  return q({
    type: "hierarchy-true-false",
    marks: 2,
    prompt: `True or false? ${st.s} Give a reason.`,
    answer: `${st.t ? "True" : "False"}. ${st.why}`,
    working: [st.t ? "True." : "False.", st.why],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "hierarchy", "reasoning"]
  });
}

/* ── convex / non-convex ─────────────────────────────────── */

function convexQuestion() {
  const convex = Math.random() < 0.5;
  const n = choice([4, 5, 5, 6]);
  const letters = ["A", "B", "C", "D", "E", "F"].slice(0, n);
  let raw;
  let reflexIndex = -1;

  // Points on a rough circle; for a non-convex polygon one vertex is pulled
  // in past the line joining its neighbours, which makes its angle reflex.
  for (let tries = 0; tries < 50; tries++) {
    const base = shuffle([0, 1, 2, 3, 4, 5].slice(0, n)).map(() => 0);
    raw = base.map((_, i) => {
      const t = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const r = 10 * (0.85 + Math.random() * 0.3);
      return [r * Math.cos(t), r * Math.sin(t)];
    });
    if (!convex) {
      reflexIndex = randInt(0, n - 1);
      const p = raw[(reflexIndex - 1 + n) % n];
      const r = raw[(reflexIndex + 1) % n];
      const mid = [(p[0] + r[0]) / 2, (p[1] + r[1]) / 2];
      raw[reflexIndex] = [mid[0] * 0.35, mid[1] * 0.35];
    }
    if (isSimple(raw) && reflexCount(raw) === (convex ? 0 : 1)) break;
    raw = null;
  }
  if (!raw) return convexQuestion();

  const points = fitPoints(nameVertices(raw, letters), { size: 260 });
  const reflexVertex = convex ? null : letters[reflexIndex];

  if (!convex && Math.random() < 0.4) {
    return q({
      type: "convex-non-convex",
      marks: 1,
      prompt: `This polygon is non-convex. At which vertex is the interior angle a reflex angle?`,
      diagram: figure({ points, polygons: [{ pts: letters }] }),
      answer: reflexVertex,
      working: [`The interior angle at ${reflexVertex} is greater than 180°, so the polygon "caves in" there.`, reflexVertex],
      space: SPACE_SIZES.SMALL,
      // A lettered answer among lettered options (A. C, B. A…) reads badly.
      mcEligible: false,
      mcDistractors: letters.filter(l => l !== reflexVertex),
      tags: ["geometry", "convex", "reflex"]
    });
  }

  return q({
    type: "convex-non-convex",
    marks: 2,
    prompt: "Is this polygon convex or non-convex? Give a reason.",
    diagram: figure({ points, polygons: [{ pts: letters }] }),
    answer: convex
      ? "Convex — every interior angle is less than 180°."
      : `Non-convex — the interior angle at ${reflexVertex} is reflex (greater than 180°).`,
    working: convex
      ? ["Every interior angle is less than 180°, and every diagonal lies inside the polygon.", "Convex"]
      : [`The interior angle at ${reflexVertex} is greater than 180°.`, "A polygon with a reflex interior angle is non-convex."],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "convex"]
  });
}

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/* Interior angles > 180° for a polygon listed anticlockwise (y-up). */
function reflexCount(pts) {
  const n = pts.length;
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (cross(pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n]) < 0) count++;
  }
  return count;
}

function segmentsCross(p1, p2, p3, p4) {
  const d1 = cross(p3, p4, p1);
  const d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3);
  const d4 = cross(p1, p2, p4);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}

function isSimple(pts) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;
      if (segmentsCross(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return false;
    }
  }
  return true;
}

/* ── angle sums ──────────────────────────────────────────── */

function triangleAngleSumQuestion() {
  const letters = choice(TRIANGLE_LETTERS);
  const withRight = Math.random() < 0.3;
  let angles;
  if (withRight) { const a = angleIn(22, 68); angles = shuffle([90, a, 90 - a]); }
  else angles = triangleAngles({ min: 25, step: choice([1, 5]), maxAngle: 125 });
  const tri = buildTriangle(angles[0], angles[1], { letters, rotateBy: choice([0, 0, 0, 15, -15, 180]) });
  const unknownAt = choice(letters.filter(v => tri.angles[v] !== 90));
  const x = choice(PRONUMERALS.slice(0, 4));
  const known = letters.filter(v => v !== unknownAt).map(v => tri.angles[v]);

  const arcs = letters.map(v => {
    if (v === unknownAt) return interiorAngle(letters, v, x);
    if (tri.angles[v] === 90) return interiorAngle(letters, v, false, { right: true });
    return interiorAngle(letters, v, deg(tri.angles[v]));
  });

  return q({
    type: "triangle-angle-sum",
    marks: 2,
    prompt: `Find the value of ${x}. Give a reason for your answer.`,
    diagram: figure({ points: tri.points, polygons: triPoly(letters), angles: arcs }),
    answer: deg(tri.angles[unknownAt]),
    working: [
      REASONS.triangleSum,
      `${x} = 180° − ${known[0]}° − ${known[1]}°`,
      `${x} = ${tri.angles[unknownAt]}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "angle sum", "triangle"]
  });
}

function isoscelesEquilateralQuestion() {
  const variant = choice(["find-base", "find-apex", "find-both", "equilateral"]);
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;          // A and B are the base vertices, C the apex
  const x = choice(["x", "a", "m"]);
  const y = x === "x" ? "y" : x === "a" ? "b" : "n";

  if (variant === "equilateral") {
    const tri = buildTriangle(60, 60, { letters, rotateBy: choice([0, 180, 20]) });
    const at = choice(letters);
    return q({
      type: "isosceles-equilateral",
      marks: 1,
      prompt: `Find the value of ${x}.`,
      diagram: figure({
        points: tri.points, polygons: triPoly(letters),
        ticks: [{ from: A, to: B }, { from: B, to: C }, { from: C, to: A }],
        angles: [interiorAngle(letters, at, x)]
      }),
      answer: "60°",
      working: ["All three sides are equal, so the triangle is equilateral.", REASONS.equilateral, `${x} = 60°`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: ["45°", "90°", "180°", "30°"],
      tags: ["geometry", "equilateral"]
    });
  }

  let base;
  let apex;
  if (variant === "find-base") { apex = choice([20, 30, 36, 40, 44, 50, 56, 64, 70, 76, 80, 90, 100, 110, 120, 130]); base = (180 - apex) / 2; }
  else { base = angleIn(25, 75); if (base === 60 || base === 45) base += 3; apex = 180 - 2 * base; }

  const tri = buildTriangle(base, base, { letters, rotateBy: choice([0, 0, 180, 15]) });
  const cfg = { points: tri.points, polygons: triPoly(letters), ticks: [{ from: A, to: C }, { from: B, to: C }] };

  if (variant === "find-base") {
    cfg.angles = [interiorAngle(letters, C, deg(apex)), interiorAngle(letters, choice([A, B]), x)];
    return q({
      type: "isosceles-equilateral",
      marks: 2,
      prompt: `Find the value of ${x}. Give reasons for your answer.`,
      diagram: figure(cfg),
      answer: deg(base),
      working: [
        `${REASONS.isosceles} ${REASONS.triangleSum}`,
        `2${x} = 180° − ${apex}° = ${180 - apex}°`,
        `${x} = ${base}°`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "isosceles"]
    });
  }

  if (variant === "find-apex") {
    const shown = choice([A, B]);
    cfg.angles = [interiorAngle(letters, shown, deg(base)), interiorAngle(letters, C, x)];
    return q({
      type: "isosceles-equilateral",
      marks: 2,
      prompt: `Find the value of ${x}. Give reasons for your answer.`,
      diagram: figure(cfg),
      answer: deg(apex),
      working: [
        `${REASONS.isosceles} So the other base angle is also ${base}°.`,
        REASONS.triangleSum,
        `${x} = 180° − 2 × ${base}° = ${apex}°`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "isosceles"]
    });
  }

  cfg.angles = [interiorAngle(letters, A, deg(base)), interiorAngle(letters, B, y), interiorAngle(letters, C, x)];
  return q({
    type: "isosceles-equilateral",
    marks: 2,
    prompt: `Find the values of ${x} and ${y}. Give reasons.`,
    diagram: figure(cfg),
    answer: `${x} = ${apex}°, ${y} = ${base}°`,
    working: [
      `${y} = ${base}° (${REASONS.isosceles.replace(/\.$/, "")})`,
      `${x} = 180° − ${base}° − ${base}° = ${apex}° (angle sum of a triangle)`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "isosceles"]
  });
}

function exteriorAngleQuestion() {
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;
  const D = { A: "D", P: "S", X: "W", L: "P", D: "G", K: "N" }[A] || "D";
  // The extended side is the horizontal base A→B, so the figure stays wide
  // rather than tall. Exterior angle at B = interior opposite angles A + C.
  let a; let b; let c;
  do { [a, b, c] = triangleAngles({ min: 30, maxAngle: 110 }); } while (a + c >= 160 || a + c <= 40);
  const tri = buildTriangle(a, b, { letters, maxH: 170 });
  const points = { ...tri.points, [D]: extendBeyond(tri.points[A], tri.points[B], 0.45) };
  const exterior = a + c;
  const x = choice(["x", "y", "p"]);
  const findExterior = Math.random() < 0.55;
  const hideAt = choice([A, C]);
  const other = hideAt === A ? C : A;
  const hiddenVal = tri.angles[hideAt];
  const otherVal = tri.angles[other];

  const cfg = {
    points,
    polygons: triPoly(letters),
    segments: [{ from: B, to: D }],
    angles: findExterior
      ? [interiorAngle(letters, A, deg(a)), interiorAngle(letters, C, deg(c)), { at: B, from: C, to: D, label: x }]
      : [interiorAngle(letters, hideAt, x), interiorAngle(letters, other, deg(otherVal)), { at: B, from: C, to: D, label: deg(exterior) }]
  };

  return q({
    type: "exterior-angle",
    marks: 2,
    prompt: `${A}${B} is extended to ${D}. Find the value of ${x}, giving a reason.`,
    diagram: figure(cfg),
    answer: findExterior ? deg(exterior) : deg(hiddenVal),
    working: findExterior
      ? [REASONS.exterior, `${x} = ${a}° + ${c}°`, `${x} = ${exterior}°`]
      : [REASONS.exterior, `${x} + ${otherVal}° = ${exterior}°`, `${x} = ${exterior}° − ${otherVal}° = ${hiddenVal}°`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "exterior angle"]
  });
}

/* A convex quadrilateral with the given angles and sensible proportions. */
function buildQuad(angles, letters, { size = 280, rotateBy = 0 } = {}) {
  for (let i = 0; i < 80; i++) {
    const raw = polygonFromAngles(angles, [randInt(9, 13), randInt(6, 11)]);
    if (!raw) continue;
    const sides = raw.map((p, k) => Math.hypot(p[0] - raw[(k + 1) % 4][0], p[1] - raw[(k + 1) % 4][1]));
    if (Math.min(...sides) / Math.max(...sides) < 0.35) continue;
    return fitPoints(nameVertices(raw, letters), { size, rotateBy });
  }
  return null;
}

function quadrilateralAngleSumQuestion() {
  const letters = choice(QUAD_LETTERS);
  const x = choice(["x", "y", "a", "k"]);
  const reflexVariant = Math.random() < 0.25;

  if (reflexVariant) {
    // Arrowhead (dart): one reflex interior angle.
    const [A, B, C, D] = letters;
    const tipHalf = angleIn(28, 38);
    // Build symmetric dart in y-up: A tip at top, B right, C (reflex) middle, D left
    const h = 10;
    const w = h * Math.tan(tipHalf * Math.PI / 180);
    const raw = [[0, h], [w, 0], [0, h * 0.28], [-w, 0]];
    const points = fitPoints(nameVertices(raw, letters), { size: 260 });
    const ang = v => {
      const i = letters.indexOf(v);
      const P = raw[i]; const Q = raw[(i + 3) % 4]; const R = raw[(i + 1) % 4];
      const a1 = Math.atan2(Q[1] - P[1], Q[0] - P[0]);
      const a2 = Math.atan2(R[1] - P[1], R[0] - P[0]);
      let d = Math.abs(a1 - a2) * 180 / Math.PI;
      if (d > 180) d = 360 - d;
      return d;
    };
    // Use the true angles, rounded; then fix the reflex one so the sum is exactly 360°.
    const aA = Math.round(ang(A));
    const aB = Math.round(ang(B));
    const aD = aB;
    const aC = 360 - aA - aB - aD;
    const hideAt = choice([C, A, B]);
    const vals = { [A]: aA, [B]: aB, [C]: aC, [D]: aD };
    const arcs = letters.map(v => ({
      ...interiorAngle(letters, v, v === hideAt ? x : deg(vals[v])),
      reflex: v === C
    }));
    const known = letters.filter(v => v !== hideAt).map(v => vals[v]);
    return q({
      type: "quadrilateral-angle-sum",
      marks: 2,
      prompt: `Find the value of ${x}. Give a reason for your answer.`,
      diagram: figure({ points, polygons: [{ pts: letters }], angles: arcs, labelOffsets: { [C]: [0, 22] } }, { notToScale: true }),
      answer: deg(vals[hideAt]),
      working: [
        `${REASONS.quadSum} This is still true when one angle is reflex.`,
        `${x} = 360° − ${known.map(k => `${k}°`).join(" − ")}`,
        `${x} = ${vals[hideAt]}°`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "angle sum", "quadrilateral", "reflex"]
    });
  }

  let angles;
  let pts;
  for (let i = 0; i < 100 && !pts; i++) {
    const a = angleIn(55, 130, choice([1, 5]));
    const b = Math.random() < 0.25 ? 90 : angleIn(55, 130, 5);
    const c = angleIn(55, 130, 5);
    const d = 360 - a - b - c;
    if (d < 45 || d > 150) continue;
    // A rectangle has nothing to find: keep at least two non-right angles,
    // one to hide and one to give.
    if ([a, b, c, d].filter(v => v !== 90).length < 2) continue;
    angles = [a, b, c, d];
    pts = buildQuad(angles, letters, { rotateBy: choice([0, 0, 10, -10]) });
  }
  if (!pts) return quadrilateralAngleSumQuestion();

  const hide = choice([0, 1, 2, 3].filter(i => angles[i] !== 90));
  const arcs = letters.map((v, i) => {
    if (i === hide) return interiorAngle(letters, v, x);
    if (angles[i] === 90) return interiorAngle(letters, v, false, { right: true });
    return interiorAngle(letters, v, deg(angles[i]));
  });
  const known = angles.filter((_, i) => i !== hide);

  return q({
    type: "quadrilateral-angle-sum",
    marks: 2,
    prompt: `Find the value of ${x}. Give a reason for your answer.`,
    diagram: figure({ points: pts, polygons: [{ pts: letters }], angles: arcs }),
    answer: deg(angles[hide]),
    working: [
      REASONS.quadSum,
      `${x} = 360° − ${known.map(k => `${k}°`).join(" − ")}`,
      `${x} = ${angles[hide]}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "angle sum", "quadrilateral"]
  });
}

function specialQuadrilateralAnglesQuestion() {
  const kind = choice(["parallelogram", "rhombus", "kite", "isosceles-trapezium"]);
  const letters = choice(QUAD_LETTERS);
  const [A, B, C, D] = letters;

  if (kind === "parallelogram" || kind === "rhombus") {
    const acute = angleIn(50, 80);
    const obtuse = 180 - acute;
    const raw = kind === "rhombus"
      ? (() => { const t = acute * Math.PI / 180; return [[0, 0], [10, 0], [10 + 10 * Math.cos(t), 10 * Math.sin(t)], [10 * Math.cos(t), 10 * Math.sin(t)]]; })()
      : (() => { const t = acute * Math.PI / 180; const s = 6; return [[0, 0], [12, 0], [12 + s * Math.cos(t), s * Math.sin(t)], [s * Math.cos(t), s * Math.sin(t)]]; })();
    const points = fitPoints(nameVertices(raw, letters), { size: 290 });
    // Interior angles: A = acute, B = obtuse, C = acute, D = obtuse
    const given = choice([A, B]);
    const givenVal = given === A ? acute : obtuse;
    const oppositeOf = { [A]: C, [B]: D };
    const adjacentOf = { [A]: B, [B]: C };
    const xAt = oppositeOf[given];
    const yAt = adjacentOf[given];
    const cfg = {
      points,
      polygons: [{ pts: letters }],
      parallel: kind === "parallelogram" ? [{ from: A, to: B, count: 1 }, { from: D, to: C, count: 1 }, { from: A, to: D, count: 2 }, { from: B, to: C, count: 2 }] : [],
      ticks: kind === "rhombus" ? [{ from: A, to: B }, { from: B, to: C }, { from: C, to: D }, { from: D, to: A }] : [],
      angles: [interiorAngle(letters, given, deg(givenVal)), interiorAngle(letters, xAt, "x"), interiorAngle(letters, yAt, "y")]
    };
    const yVal = 180 - givenVal;
    return q({
      type: "special-quadrilateral-angles",
      marks: 2,
      prompt: `${letters.join("")} is a ${kind}. Find the values of x and y, giving reasons.`,
      diagram: figure(cfg),
      answer: `x = ${givenVal}°, y = ${yVal}°`,
      working: [
        `x = ${givenVal}° (opposite angles of a ${kind} are equal)`,
        `y = 180° − ${givenVal}° = ${yVal}° (co-interior angles on parallel lines are supplementary)`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", kind, "angles"]
    });
  }

  if (kind === "kite") {
    // Ring A(top) B(right) C(bottom) D(left); AB = AD, CB = CD; ∠B = ∠D.
    const top = angleIn(70, 120);
    const bottom = angleIn(40, 70);
    const side = (360 - top - bottom) / 2;
    if (!Number.isInteger(side)) return specialQuadrilateralAnglesQuestion();
    const raw = polygonFromAngles([side, bottom, side, top], [10, 10]);
    // polygonFromAngles starts at the first angle's vertex; rotate names so
    // letters[0] is the TOP (angle `top`): order top, right, bottom, left.
    if (!raw) return specialQuadrilateralAnglesQuestion();
    const ringVals = [side, bottom, side, top];
    const named = {};
    // raw vertices in order carry ringVals; map so letters = [top, right, bottom, left]
    const order = [3, 0, 1, 2];
    order.forEach((ri, li) => { named[letters[li]] = raw[ri]; });
    const points = fitPoints(named, { size: 270, rotateBy: 0 });
    const vals = { [A]: ringVals[3], [B]: ringVals[0], [C]: ringVals[1], [D]: ringVals[2] };
    const cfg = {
      points,
      polygons: [{ pts: letters }],
      ticks: [{ from: A, to: B, count: 1 }, { from: A, to: D, count: 1 }, { from: B, to: C, count: 2 }, { from: D, to: C, count: 2 }],
      angles: [interiorAngle(letters, A, deg(vals[A])), interiorAngle(letters, C, deg(vals[C])), interiorAngle(letters, B, "x"), interiorAngle(letters, D, "y")]
    };
    return q({
      type: "special-quadrilateral-angles",
      marks: 2,
      prompt: `${letters.join("")} is a kite. Find the values of x and y, giving reasons.`,
      diagram: figure(cfg),
      answer: `x = ${side}°, y = ${side}°`,
      working: [
        `${REASONS.kite} So x = y.`,
        `${REASONS.quadSum} 2x = 360° − ${vals[A]}° − ${vals[C]}° = ${2 * side}°`,
        `x = y = ${side}°`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "kite", "angles"]
    });
  }

  // Isosceles trapezium: base angles equal.
  const baseAngle = angleIn(55, 80);
  const topAngle = 180 - baseAngle;
  const t = baseAngle * Math.PI / 180;
  const h = 6;
  const k = h / Math.tan(t);
  const raw = [[0, 0], [14, 0], [14 - k, h], [k, h]];
  const points = fitPoints(nameVertices(raw, letters), { size: 290 });
  const cfg = {
    points,
    polygons: [{ pts: letters }],
    parallel: [{ from: A, to: B }, { from: D, to: C }],
    ticks: [{ from: A, to: D }, { from: B, to: C }],
    angles: [interiorAngle(letters, A, deg(baseAngle)), interiorAngle(letters, B, "x"), interiorAngle(letters, D, "y")]
  };
  return q({
    type: "special-quadrilateral-angles",
    marks: 2,
    prompt: `${letters.join("")} is an isosceles trapezium with ${A}${B} ∥ ${D}${C}. Find the values of x and y, giving reasons.`,
    diagram: figure(cfg),
    answer: `x = ${baseAngle}°, y = ${topAngle}°`,
    working: [
      `x = ${baseAngle}° (${REASONS.isoTrap.replace(/\.$/, "")})`,
      `y = 180° − ${baseAngle}° = ${topAngle}° (co-interior angles, ${A}${B} ∥ ${D}${C})`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "trapezium", "angles"]
  });
}

/* ── sides ───────────────────────────────────────────────── */

function unknownSidesQuestion() {
  const variant = choice(["parallelogram-perimeter", "rhombus-perimeter", "rectangle-diagonal", "rhombus-algebra", "kite-perimeter", "parallelogram-missing"]);
  const letters = choice(QUAD_LETTERS);
  const [A, B, C, D] = letters;
  const unit = choice(["cm", "m"]);

  if (variant === "rectangle-diagonal") {
    const half = choice([2.5, 3, 3.5, 4, 4.5, 5, 6.5, 7.5, 8]);
    const { cfg } = quadFigure("Rectangle", letters, { markings: true });
    cfg.points._O = [(cfg.points[A][0] + cfg.points[C][0]) / 2, (cfg.points[A][1] + cfg.points[C][1]) / 2];
    cfg.segments = [{ from: A, to: C }, { from: B, to: D }];
    cfg.vertexLabels = true;
    cfg.texts = [{ x: cfg.points._O[0], y: cfg.points._O[1] + 22, text: "O", weight: 700 }];
    return q({
      type: "unknown-sides",
      marks: 2,
      prompt: `${letters.join("")} is a rectangle whose diagonals meet at O. If ${A}O = ${fmt(half)} ${unit}, find the length of ${B}${D}. Give a reason.`,
      diagram: figure(cfg),
      answer: `${fmt(half * 2)} ${unit}`,
      working: [
        "The diagonals of a rectangle are equal in length and bisect each other.",
        `${A}${C} = 2 × ${fmt(half)} = ${fmt(half * 2)} ${unit}, so ${B}${D} = ${fmt(half * 2)} ${unit}.`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "rectangle", "diagonals"]
    });
  }

  if (variant === "rhombus-algebra") {
    let xv; let a; let b; let c; let d;
    do {
      xv = randInt(3, 9); a = randInt(2, 5); c = randInt(a + 1, a + 4);
      b = randInt(1, 9); d = c * xv - (a * xv + b);
    } while (d <= 0 || a * xv + b > 60);
    const side = a * xv + b;
    const { cfg } = quadFigure("Rhombus", letters);
    cfg.sideLabels = [{ from: A, to: B, text: `(${a}x + ${b}) ${unit}` }, { from: B, to: C, text: `(${c}x − ${d}) ${unit}` }];
    return q({
      type: "unknown-sides",
      marks: 3,
      prompt: `${letters.join("")} is a rhombus. (a) Find the value of x. (b) Find the perimeter of the rhombus.`,
      diagram: figure(cfg, { notToScale: true }),
      answer: `x = ${xv}; perimeter = ${4 * side} ${unit}`,
      working: [
        "All sides of a rhombus are equal.",
        `${a}x + ${b} = ${c}x − ${d}  →  ${b + d} = ${c - a}x  →  x = ${xv}`,
        `Side = ${a} × ${xv} + ${b} = ${side} ${unit}; perimeter = 4 × ${side} = ${4 * side} ${unit}`
      ],
      space: SPACE_SIZES.LARGE,
      tags: ["geometry", "rhombus", "algebra"]
    });
  }

  if (variant === "rhombus-perimeter") {
    const s = choice([4.5, 6, 7, 8.5, 9, 11, 12.5, 15]);
    const { cfg } = quadFigure("Rhombus", letters);
    cfg.sideLabels = [{ from: A, to: B, text: `${fmt(s)} ${unit}` }];
    return q({
      type: "unknown-sides",
      marks: 1,
      prompt: `${letters.join("")} is a rhombus. Find its perimeter.`,
      diagram: figure(cfg),
      answer: `${fmt(4 * s)} ${unit}`,
      working: ["All four sides of a rhombus are equal.", `P = 4 × ${fmt(s)} = ${fmt(4 * s)} ${unit}`],
      space: SPACE_SIZES.SMALL,
      tags: ["geometry", "rhombus", "perimeter"]
    });
  }

  if (variant === "kite-perimeter") {
    const s1 = randInt(4, 9);
    const s2 = randInt(s1 + 2, s1 + 8);
    const { cfg } = quadFigure("Kite", letters);
    cfg.sideLabels = [{ from: A, to: B, text: `${s1} ${unit}` }, { from: C, to: D, text: `${s2} ${unit}` }];
    return q({
      type: "unknown-sides",
      marks: 2,
      prompt: `${letters.join("")} is a kite. Find its perimeter.`,
      diagram: figure(cfg, { notToScale: true }),
      answer: `${2 * (s1 + s2)} ${unit}`,
      working: ["A kite has two pairs of equal adjacent sides.", `${A}${D} = ${s1} ${unit} and ${B}${C} = ${s2} ${unit}.`, `P = 2 × ${s1} + 2 × ${s2} = ${2 * (s1 + s2)} ${unit}`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "kite", "perimeter"]
    });
  }

  const long = randInt(8, 18);
  const short = randInt(4, long - 2);
  const { cfg } = quadFigure("Parallelogram", letters);
  cfg.ticks = [];

  if (variant === "parallelogram-missing") {
    cfg.sideLabels = [{ from: A, to: B, text: `${long} ${unit}` }, { from: B, to: C, text: `${short} ${unit}` }, { from: D, to: C, text: "x" }];
    return q({
      type: "unknown-sides",
      marks: 1,
      prompt: `${letters.join("")} is a parallelogram. Find the value of x.`,
      diagram: figure(cfg),
      answer: `${long} ${unit}`,
      working: ["Opposite sides of a parallelogram are equal.", `x = ${A}${B} = ${long} ${unit}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${short} ${unit}`, `${long + short} ${unit}`, `${2 * (long + short)} ${unit}`],
      tags: ["geometry", "parallelogram", "sides"]
    });
  }

  cfg.sideLabels = [{ from: A, to: B, text: `${long} ${unit}` }, { from: B, to: C, text: `${short} ${unit}` }];
  return q({
    type: "unknown-sides",
    marks: 2,
    prompt: `${letters.join("")} is a parallelogram. Find its perimeter.`,
    diagram: figure(cfg),
    answer: `${2 * (long + short)} ${unit}`,
    working: ["Opposite sides of a parallelogram are equal.", `P = 2 × ${long} + 2 × ${short} = ${2 * (long + short)} ${unit}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "parallelogram", "perimeter"]
  });
}

/* ── algebra and multi-step ──────────────────────────────── */

function algebraicAnglesQuestion() {
  const variant = choice(["tri-multiples", "tri-offsets", "quad-multiples", "iso-expression"]);

  if (variant === "tri-multiples" || variant === "tri-offsets") {
    let coeffs; let offs; let xv; let angles;
    for (let i = 0; i < 200; i++) {
      if (variant === "tri-multiples") {
        coeffs = shuffle(choice([[1, 2, 3], [1, 1, 2], [2, 3, 4], [1, 2, 2], [1, 3, 5], [2, 2, 5], [1, 4, 4]]));
        offs = [0, 0, 0];
      } else {
        coeffs = [1, 1, choice([1, 2])];
        offs = shuffle([0, choice([10, 15, 20, 25, 30]), -choice([5, 10, 15])]);
      }
      const k = coeffs.reduce((s, c) => s + c, 0);
      const r = 180 - offs.reduce((s, o) => s + o, 0);
      if (r % k) continue;
      xv = r / k;
      angles = coeffs.map((c, j) => c * xv + offs[j]);
      if (angles.every(a => a >= 20 && a <= 140)) break;
      angles = null;
    }
    if (!angles) return algebraicAnglesQuestion();
    const letters = choice(TRIANGLE_LETTERS);
    const tri = buildTriangle(angles[0], angles[1], { letters });
    const expr = (c, o) => `${c === 1 ? "" : c}x${o > 0 ? ` + ${o}` : o < 0 ? ` − ${-o}` : ""}`;
    const labels = coeffs.map((c, j) => `${expr(c, offs[j])}${offs[j] ? "" : ""}`);
    const shown = labels.map(l => (/[+−]/.test(l) ? `(${l})°` : `${l}°`));
    const k = coeffs.reduce((s, c) => s + c, 0);
    const o = offs.reduce((s, v) => s + v, 0);
    return q({
      type: "algebraic-angles",
      marks: 2,
      prompt: "Form an equation and solve it to find the value of x.",
      diagram: figure({ points: tri.points, polygons: triPoly(letters), angles: letters.map((v, j) => interiorAngle(letters, v, shown[j])) }),
      answer: `x = ${xv}`,
      working: [
        REASONS.triangleSum,
        `${labels.join(" + ")} = 180`,
        `${k === 1 ? "" : k}x${o > 0 ? ` + ${o}` : o < 0 ? ` − ${-o}` : ""} = 180`,
        `x = ${xv}`
      ],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "algebra", "angle sum"]
    });
  }

  if (variant === "quad-multiples") {
    let coeffs; let xv; let angles; let pts;
    const letters = choice(QUAD_LETTERS);
    for (let i = 0; i < 200 && !pts; i++) {
      coeffs = shuffle(choice([[1, 2, 3, 4], [2, 3, 3, 4], [1, 1, 2, 2], [2, 2, 3, 5], [3, 4, 5, 6], [1, 2, 2, 3]]));
      const k = coeffs.reduce((s, c) => s + c, 0);
      if (360 % k) continue;
      xv = 360 / k;
      angles = coeffs.map(c => c * xv);
      if (angles.some(a => a < 40 || a > 160)) continue;
      pts = buildQuad(angles, letters);
    }
    if (!pts) return algebraicAnglesQuestion();
    const k = coeffs.reduce((s, c) => s + c, 0);
    return q({
      type: "algebraic-angles",
      marks: 2,
      prompt: "Form an equation and solve it to find the value of x.",
      diagram: figure({ points: pts, polygons: [{ pts: letters }], angles: letters.map((v, j) => interiorAngle(letters, v, `${coeffs[j] === 1 ? "" : coeffs[j]}x°`)) }),
      answer: `x = ${xv}`,
      working: [REASONS.quadSum, `${coeffs.map(c => `${c === 1 ? "" : c}x`).join(" + ")} = 360`, `${k}x = 360`, `x = ${xv}`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["geometry", "algebra", "angle sum"]
    });
  }

  // Isosceles with the base angles given as expressions.
  let a; let b; let c; let d; let xv; let base;
  do {
    a = randInt(2, 4); c = randInt(1, a - 1); xv = randInt(8, 25);
    b = randInt(-20, 20); d = (a - c) * xv + b;
    base = a * xv + b;
  } while (base < 25 || base > 80 || b === 0 || d === 0);
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;
  const tri = buildTriangle(base, base, { letters });
  const e1 = `${a}x ${b > 0 ? "+" : "−"} ${Math.abs(b)}`;
  const e2 = `${c === 1 ? "" : c}x ${d > 0 ? "+" : "−"} ${Math.abs(d)}`;
  return q({
    type: "algebraic-angles",
    marks: 3,
    prompt: "The triangle is isosceles. (a) Find the value of x. (b) Find the size of the third angle.",
    diagram: figure({
      points: tri.points, polygons: triPoly(letters),
      ticks: [{ from: A, to: C }, { from: B, to: C }],
      angles: [interiorAngle(letters, A, `(${e1})°`), interiorAngle(letters, B, `(${e2})°`)]
    }),
    answer: `x = ${xv}; third angle = ${180 - 2 * base}°`,
    working: [
      REASONS.isosceles,
      `${e1} = ${e2}  →  ${a - c}x = ${d - b}  →  x = ${xv}`,
      `Each base angle = ${base}°; third angle = 180° − 2 × ${base}° = ${180 - 2 * base}°`
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["geometry", "algebra", "isosceles"]
  });
}

function multiStepAnglesQuestion() {
  const variant = choice(["straight-then-sum", "iso-then-straight", "exterior-iso"]);
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;
  const D = ["D", "E", "G", "T", "W"].find(l => !letters.includes(l));

  if (variant === "straight-then-sum") {
    // AB is extended through B to D; the exterior angle at B is given.
    const [a, b] = triangleAngles({ min: 35, maxAngle: 105 });
    const tri = buildTriangle(a, b, { letters, maxH: 170 });
    const pts = { ...tri.points, [D]: extendBeyond(tri.points[A], tri.points[B], 0.45) };
    const ext = 180 - b;
    const c = 180 - a - b;
    return q({
      type: "multi-step-angles",
      marks: 3,
      prompt: `${A}${B} is extended to ${D}. Find the value of x. Give reasons for each step.`,
      diagram: figure({
        points: pts, polygons: triPoly(letters), segments: [{ from: B, to: D }],
        angles: [interiorAngle(letters, A, deg(a)), { at: B, from: C, to: D, label: deg(ext) }, interiorAngle(letters, C, "x")]
      }),
      answer: deg(c),
      working: [
        `∠${A}${B}${C} = 180° − ${ext}° = ${b}° (angles on a straight line add to 180°)`,
        `x = 180° − ${a}° − ${b}° = ${c}° (angle sum of a triangle)`
      ],
      space: SPACE_SIZES.LARGE,
      tags: ["geometry", "multi-step", "reasons"]
    });
  }

  if (variant === "iso-then-straight") {
    const base = angleIn(30, 75);
    const tri = buildTriangle(base, base, { letters });
    const pts = { ...tri.points, [D]: extendBeyond(tri.points[A], tri.points[B], 0.45) };
    const x = 180 - base;
    return q({
      type: "multi-step-angles",
      marks: 3,
      prompt: `△${A}${B}${C} is isosceles and ${A}${B} is extended to ${D}. Find the value of x, giving reasons.`,
      diagram: figure({
        points: pts, polygons: triPoly(letters), segments: [{ from: B, to: D }],
        ticks: [{ from: A, to: C }, { from: B, to: C }],
        angles: [interiorAngle(letters, A, deg(base)), { at: B, from: C, to: D, label: "x" }]
      }),
      answer: deg(x),
      working: [
        `∠${A}${B}${C} = ${base}° (base angles of an isosceles triangle are equal)`,
        `x = 180° − ${base}° = ${x}° (angles on a straight line add to 180°)`
      ],
      space: SPACE_SIZES.LARGE,
      tags: ["geometry", "multi-step", "reasons", "isosceles"]
    });
  }

  // Isosceles (CA = CB) with AB extended through B: base angle, then the
  // exterior-angle theorem.
  const base = angleIn(35, 70);
  const apex = 180 - 2 * base;
  const tri = buildTriangle(base, base, { letters, maxH: 170 });
  const pts = { ...tri.points, [D]: extendBeyond(tri.points[A], tri.points[B], 0.45) };
  const ext = 180 - base;
  return q({
    type: "multi-step-angles",
    marks: 3,
    prompt: `${A}${B} is extended to ${D}, and ${C}${A} = ${C}${B}. Find the values of x and y, giving reasons.`,
    diagram: figure({
      points: pts, polygons: triPoly(letters), segments: [{ from: B, to: D }],
      ticks: [{ from: A, to: C }, { from: B, to: C }],
      angles: [interiorAngle(letters, C, deg(apex)), interiorAngle(letters, A, "y"), { at: B, from: C, to: D, label: "x" }]
    }),
    answer: `y = ${base}°, x = ${ext}°`,
    working: [
      `y = (180° − ${apex}°) ÷ 2 = ${base}° (base angles of an isosceles triangle are equal; angle sum 180°)`,
      `x = ${base}° + ${apex}° = ${ext}° (exterior angle of a triangle equals the sum of the interior opposite angles)`
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["geometry", "multi-step", "reasons", "exterior angle"]
  });
}

/* ── the reasoning behind the results ────────────────────── */

function angleSumReasoningQuestion() {
  const variant = choice(["triangle", "exterior", "quadrilateral"]);

  if (variant === "triangle") {
    const tri = buildTriangle(62, 50, { letters: ["B", "C", "A"], size: 300, maxH: 230 });
    const P = tri.points;
    const dx = P.C[0] - P.B[0];
    const dy = P.C[1] - P.B[1];
    const pts = { ...P, D: [P.A[0] - dx * 0.45, P.A[1] - dy * 0.45], E: [P.A[0] + dx * 0.45, P.A[1] + dy * 0.45] };
    return q({
      type: "angle-sum-reasoning",
      marks: 3,
      prompt: "In the diagram, DE is drawn through A parallel to BC. The angles of △ABC are a, b and c. Use the diagram to explain why a + b + c = 180°.",
      diagram: figure({
        points: pts,
        polygons: [{ pts: ["A", "B", "C"] }],
        segments: [{ from: "D", to: "E" }],
        parallel: [{ from: "D", to: "E", at: 0.2 }, { from: "B", to: "C", at: 0.2 }],
        angles: [
          { at: "B", from: "A", to: "C", label: "a" },
          { at: "C", from: "B", to: "A", label: "b" },
          { at: "A", from: "B", to: "C", label: "c", radius: 30 },
          { at: "A", from: "D", to: "B", label: "a", radius: 22 },
          { at: "A", from: "C", to: "E", label: "b", radius: 22 }
        ]
      }, { notToScale: true }),
      answer: "∠DAB = a and ∠EAC = b (alternate angles, DE ∥ BC); ∠DAB + c + ∠EAC = 180° (angles on a straight line), so a + b + c = 180°.",
      working: [
        "∠DAB = a (alternate angles on parallel lines, DE ∥ BC)",
        "∠EAC = b (alternate angles on parallel lines, DE ∥ BC)",
        "∠DAB + ∠BAC + ∠EAC = 180° (angles on the straight line DE)",
        "So a + c + b = 180°: the angle sum of a triangle is 180°."
      ],
      space: SPACE_SIZES.LARGE,
      tags: ["geometry", "reasoning", "proof", "angle sum"]
    });
  }

  if (variant === "exterior") {
    // BC is the horizontal base so the extension to D runs along the page.
    const tri = buildTriangle(65, 60, { letters: ["B", "C", "A"], size: 260 });
    const P = tri.points;
    const D = extendBeyond(P.B, P.C, 0.55);
    const E = [P.C[0] + (P.A[0] - P.B[0]) * 0.7, P.C[1] + (P.A[1] - P.B[1]) * 0.7];
    return q({
      type: "angle-sum-reasoning",
      marks: 3,
      prompt: "BC is extended to D, and CE is drawn parallel to BA. Use the diagram to explain why the exterior angle ∠ACD equals a + b.",
      diagram: figure({
        points: { ...P, D, E },
        polygons: [{ pts: ["A", "B", "C"] }],
        segments: [{ from: "C", to: "D" }, { from: "C", to: "E" }],
        parallel: [{ from: "B", to: "A", at: 0.45 }, { from: "C", to: "E", at: 0.6 }],
        angles: [
          { at: "A", from: "B", to: "C", label: "a" },
          { at: "B", from: "C", to: "A", label: "b" }
        ]
      }, { notToScale: true }),
      answer: "∠ACE = a (alternate angles, CE ∥ BA) and ∠ECD = b (corresponding angles, CE ∥ BA), so ∠ACD = ∠ACE + ∠ECD = a + b.",
      working: [
        "∠ACE = a (alternate angles, CE ∥ BA)",
        "∠ECD = b (corresponding angles, CE ∥ BA)",
        "∠ACD = ∠ACE + ∠ECD = a + b",
        "So the exterior angle equals the sum of the two interior opposite angles."
      ],
      space: SPACE_SIZES.LARGE,
      tags: ["geometry", "reasoning", "proof", "exterior angle"]
    });
  }

  const letters = ["A", "B", "C", "D"];
  const pts = buildQuad([80, 105, 70, 105], letters) || buildQuad([90, 90, 90, 90], letters);
  return q({
    type: "angle-sum-reasoning",
    marks: 2,
    prompt: "The diagonal AC divides quadrilateral ABCD into two triangles. Use this to explain why the angle sum of a quadrilateral is 360°.",
    diagram: figure({ points: pts, polygons: [{ pts: letters }], segments: [{ from: "A", to: "C", dashed: true }] }),
    answer: "The angles of ABCD are exactly the angles of △ABC and △ACD together; each triangle's angles add to 180°, so the total is 2 × 180° = 360°.",
    working: [
      "The diagonal splits the quadrilateral into △ABC and △ACD.",
      "The angles of the two triangles together make up the four angles of ABCD.",
      "Each triangle has an angle sum of 180°, so the quadrilateral's angle sum is 2 × 180° = 360°."
    ],
    space: SPACE_SIZES.LARGE,
    tags: ["geometry", "reasoning", "proof", "angle sum"]
  });
}

function multiPartGeometryQuestion() {
  const letters = choice(QUAD_LETTERS);
  const [A, B, C, D] = letters;
  const acute = angleIn(55, 80);
  const long = randInt(9, 16);
  const short = randInt(5, long - 2);
  const t = acute * Math.PI / 180;
  const raw = [[0, 0], [12, 0], [12 + 6 * Math.cos(t), 6 * Math.sin(t)], [6 * Math.cos(t), 6 * Math.sin(t)]];
  const points = fitPoints(nameVertices(raw, letters), { size: 290 });
  const cfg = {
    points,
    polygons: [{ pts: letters }],
    parallel: [{ from: A, to: B, count: 1, at: 0.7 }, { from: D, to: C, count: 1, at: 0.7 }, { from: A, to: D, count: 2, at: 0.62 }, { from: B, to: C, count: 2, at: 0.3 }],
    angles: [interiorAngle(letters, A, deg(acute))],
    sideLabels: [{ from: A, to: B, text: `${long} cm` }, { from: B, to: C, text: `${short} cm` }]
  };
  return q({
    type: "multi-part-geometry",
    marks: 4,
    prompt: `Quadrilateral ${letters.join("")} is shown.`,
    diagram: figure(cfg, { notToScale: true }),
    subparts: [
      { label: "(a)", prompt: "What type of quadrilateral is it? Use the markings to explain.", marks: 1, answer: "Parallelogram — both pairs of opposite sides are parallel.", working: ["Both pairs of opposite sides carry matching arrows."] },
      { label: "(b)", prompt: `Find the size of ∠${B}${C}${D}. Give a reason.`, marks: 1, answer: deg(acute), working: [`Opposite angles of a parallelogram are equal: ∠${B}${C}${D} = ∠${D}${A}${B} = ${acute}°.`] },
      { label: "(c)", prompt: `Find the size of ∠${A}${B}${C}. Give a reason.`, marks: 1, answer: deg(180 - acute), working: [`Co-interior angles (${A}${D} ∥ ${B}${C}): 180° − ${acute}° = ${180 - acute}°.`] },
      { label: "(d)", prompt: "Find the perimeter.", marks: 1, answer: `${2 * (long + short)} cm`, working: [`Opposite sides are equal: 2 × ${long} + 2 × ${short} = ${2 * (long + short)} cm.`] }
    ],
    answer: `(a) Parallelogram; (b) ${acute}°; (c) ${180 - acute}°; (d) ${2 * (long + short)} cm`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    tags: ["geometry", "multi-part"]
  });
}

const GENERATORS = {
  "naming-conventions": namingConventionsQuestion,
  "classify-triangle-sides": classifyTriangleSidesQuestion,
  "classify-triangle-angles": classifyTriangleAnglesQuestion,
  "classify-triangle-both": classifyTriangleBothQuestion,
  "classify-quadrilateral": classifyQuadrilateralQuestion,
  "quadrilateral-properties": quadrilateralPropertiesQuestion,
  "hierarchy-true-false": hierarchyTrueFalseQuestion,
  "convex-non-convex": convexQuestion,
  "triangle-angle-sum": triangleAngleSumQuestion,
  "isosceles-equilateral": isoscelesEquilateralQuestion,
  "exterior-angle": exteriorAngleQuestion,
  "quadrilateral-angle-sum": quadrilateralAngleSumQuestion,
  "special-quadrilateral-angles": specialQuadrilateralAnglesQuestion,
  "unknown-sides": unknownSidesQuestion,
  "algebraic-angles": algebraicAnglesQuestion,
  "multi-step-angles": multiStepAnglesQuestion,
  "angle-sum-reasoning": angleSumReasoningQuestion,
  "multi-part-geometry": multiPartGeometryQuestion
};

export function getGeometricalFiguresQuestionTypes() {
  return TYPE_LIST;
}

export function generateGeometricalFiguresQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
