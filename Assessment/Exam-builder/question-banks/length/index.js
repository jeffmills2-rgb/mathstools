/*
  CHHS Exam Builder — Length Question Bank
  ----------------------------------------
  Save as:

  question-banks/length/index.js

  Requires:
  - engines/length/length-engine.js
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Length";

const TYPE_LIST = [
  { id: "perimeter-quadrilaterals", label: "Perimeter of quadrilaterals" },
  { id: "perimeter-parallelograms", label: "Perimeter of parallelograms" },
  { id: "perimeter-trapeziums", label: "Perimeter of trapeziums" },
  { id: "perimeter-rhombuses", label: "Perimeter of rhombuses" },
  { id: "perimeter-kites", label: "Perimeter of kites" },

  { id: "perimeter-composite", label: "Perimeter of composite figures" },
  { id: "missing-side-perimeter", label: "Find missing sides before perimeter" },

  { id: "circle-features", label: "Identify features of circles" },
  { id: "circumference-diameter", label: "Circumference using diameter" },
  { id: "circumference-radius", label: "Circumference using radius" },
  { id: "find-radius-diameter", label: "Find radius or diameter from circumference" },

  { id: "arc-length", label: "Arc length" },
  { id: "sector-perimeter", label: "Perimeter of sectors" },
  { id: "semicircle-perimeter", label: "Perimeter of semicircles" },
  { id: "quadrant-perimeter", label: "Perimeter of quadrants" },
  { id: "curved-composite-perimeter", label: "Composite figures with curved edges" }
];

const UNITS = ["cm", "m", "mm"];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  const arr = items.slice();

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function randomId(prefix = "length") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function makeBalancedPlan(typeIds, count) {
  const ids = typeIds.length ? typeIds.slice() : TYPE_LIST.map(t => t.id);
  const plan = [];

  let i = 0;
  while (plan.length < count) {
    plan.push(ids[i % ids.length]);
    i += 1;
  }

  return shuffle(plan);
}

function lengthQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  space = SPACE_SIZES.MEDIUM
}) {
  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type,
    marks,
    prompt,
    diagram,
    answer,
    working,
    space,
    tags: ["length", type]
  });
}

function unitLabel(value, unit) {
  return `${value} ${unit}`;
}

function piTerm(coefficient, unit = "") {
  const rounded = Math.round(coefficient * 1000) / 1000;
  if (rounded === 1) return `π${unit ? " " + unit : ""}`;
  return `${rounded}π${unit ? " " + unit : ""}`;
}

function approx(value, dp = 1) {
  return Number(value.toFixed(dp)).toString();
}

function polygonDiagram(shape, labels) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "polygon",
      shape,
      labels
    }
  };
}

function compositeDiagram(labels) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "composite-rectilinear",
      labels
    }
  };
}


function genericCompositeDiagram(points, edgeLabels) {
  return {
    engine: "length-engine",
    config: {
      diagramType: "composite-rectilinear",
      points,
      edgeLabels
    }
  };
}

function edgeLabel(edge, text, dx = 0, dy = 0, className = "shape-small-label", highlight = false) {
  return { edge, text, dx, dy, className, highlight };
}

function missingEdgeLabel(edge, unit, dx = 0, dy = 0) {
  return edgeLabel(edge, `? ${unit}`, dx, dy, "missing-label", true);
}

function exactMode() {
  return Math.random() < 0.55;
}

function promptSuffix(exact) {
  return exact ? "Give your answer in terms of π." : "Give your answer correct to 1 decimal place.";
}

function decimalLength(value, unit) {
  return `${approx(value, 1)} ${unit}`;
}

function makeCompositeVariant({ missing = false } = {}) {
  const unit = choice(["cm", "m"]);
  const variant = missing
    ? choice(["bottom-right-notch", "top-right-notch", "bottom-left-notch"])
    : choice(["bottom-right-notch", "top-right-notch", "bottom-left-notch", "opposite-corner-cutouts", "rectangle-triangle", "house-shape"]);

  if (variant === "bottom-right-notch") {
    const width = randInt(15, 25);
    const rightHeight = randInt(7, 14);
    const notchWidth = randInt(4, 9);
    const notchHeight = randInt(3, 8);
    const bottom = width - notchWidth;
    const leftHeight = rightHeight + notchHeight;
    const perimeter = width + rightHeight + notchWidth + notchHeight + bottom + leftHeight;

    const points = [
      { x: 145, y: 105 },
      { x: 565, y: 105 },
      { x: 565, y: 235 },
      { x: 410, y: 235 },
      { x: 410, y: 325 },
      { x: 145, y: 325 }
    ];

    return {
      unit,
      missingSide: bottom,
      perimeter,
      diagram: genericCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, -36),
        edgeLabel([1, 2], unitLabel(rightHeight, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(notchWidth, unit), 0, -36),
        edgeLabel([3, 4], unitLabel(notchHeight, unit), 74, 0),
        missing ? missingEdgeLabel([4, 5], unit, 0, 44) : edgeLabel([4, 5], unitLabel(bottom, unit), 0, 44),
        edgeLabel([5, 0], unitLabel(leftHeight, unit), -62, 0)
      ]),
      working: [
        missing
          ? `Missing side = ${width} − ${notchWidth} = ${bottom} ${unit}.`
          : `Add the outside edges only.`,
        `Perimeter = ${width} + ${rightHeight} + ${notchWidth} + ${notchHeight} + ${bottom} + ${leftHeight} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "top-right-notch") {
    const width = randInt(15, 25);
    const leftHeight = randInt(9, 17);
    const notchWidth = randInt(4, 9);
    const notchHeight = randInt(3, 7);
    const topLeft = width - notchWidth;
    const rightHeight = leftHeight - notchHeight;
    const perimeter = topLeft + notchHeight + notchWidth + rightHeight + width + leftHeight;

    const points = [
      { x: 145, y: 155 },
      { x: 405, y: 155 },
      { x: 405, y: 95 },
      { x: 565, y: 95 },
      { x: 565, y: 325 },
      { x: 145, y: 325 }
    ];

    return {
      unit,
      missingSide: topLeft,
      perimeter,
      diagram: genericCompositeDiagram(points, [
        missing ? missingEdgeLabel([0, 1], unit, 0, -40) : edgeLabel([0, 1], unitLabel(topLeft, unit), 0, -40),
        edgeLabel([1, 2], unitLabel(notchHeight, unit), -74, 0),
        edgeLabel([2, 3], unitLabel(notchWidth, unit), 0, -38),
        edgeLabel([3, 4], unitLabel(rightHeight, unit), 60, 0),
        edgeLabel([4, 5], unitLabel(width, unit), 0, 44),
        edgeLabel([5, 0], unitLabel(leftHeight, unit), -62, 0)
      ]),
      working: [
        missing
          ? `Missing side = ${width} − ${notchWidth} = ${topLeft} ${unit}.`
          : `Add the outside edges only.`,
        `Perimeter = ${topLeft} + ${notchHeight} + ${notchWidth} + ${rightHeight} + ${width} + ${leftHeight} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "bottom-left-notch") {
    const width = randInt(15, 25);
    const rightHeight = randInt(10, 18);
    const notchWidth = randInt(4, 9);
    const notchHeight = randInt(3, 7);
    const bottomRight = width - notchWidth;
    const leftHeight = rightHeight - notchHeight;
    const perimeter = width + rightHeight + bottomRight + notchHeight + notchWidth + leftHeight;

    const points = [
      { x: 145, y: 105 },
      { x: 565, y: 105 },
      { x: 565, y: 325 },
      { x: 305, y: 325 },
      { x: 305, y: 245 },
      { x: 145, y: 245 }
    ];

    return {
      unit,
      missingSide: bottomRight,
      perimeter,
      diagram: genericCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, -36),
        edgeLabel([1, 2], unitLabel(rightHeight, unit), 60, 0),
        missing ? missingEdgeLabel([2, 3], unit, 0, 44) : edgeLabel([2, 3], unitLabel(bottomRight, unit), 0, 44),
        edgeLabel([3, 4], unitLabel(notchHeight, unit), 74, 0),
        edgeLabel([4, 5], unitLabel(notchWidth, unit), 0, -42),
        edgeLabel([5, 0], unitLabel(leftHeight, unit), -64, 0)
      ]),
      working: [
        missing
          ? `Missing side = ${width} − ${notchWidth} = ${bottomRight} ${unit}.`
          : `Add the outside edges only.`,
        `Perimeter = ${width} + ${rightHeight} + ${bottomRight} + ${notchHeight} + ${notchWidth} + ${leftHeight} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "rectangle-triangle") {
    const width = randInt(10, 18);
    const height = randInt(5, 10);
    const slantA = randInt(6, 12);
    const slantB = randInt(6, 12);
    const perimeter = width + height + slantB + slantA + height;

    const points = [
      { x: 175, y: 300 },
      { x: 545, y: 300 },
      { x: 545, y: 160 },
      { x: 360, y: 70 },
      { x: 175, y: 160 }
    ];

    return {
      unit,
      missingSide: null,
      perimeter,
      diagram: genericCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(width, unit), 0, 42),
        edgeLabel([1, 2], unitLabel(height, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(slantB, unit), 45, -34),
        edgeLabel([3, 4], unitLabel(slantA, unit), -45, -34),
        edgeLabel([4, 0], unitLabel(height, unit), -58, 0)
      ]),
      working: [
        `This composite figure is a rectangle with a triangle on top.`,
        `Add only the outside edges.`,
        `Perimeter = ${width} + ${height} + ${slantB} + ${slantA} + ${height} = ${perimeter} ${unit}.`
      ]
    };
  }

  if (variant === "house-shape") {
    const base = randInt(10, 18);
    const wall = randInt(5, 10);
    const roof = randInt(6, 12);
    const perimeter = base + 2 * wall + 2 * roof;

    const points = [
      { x: 170, y: 310 },
      { x: 550, y: 310 },
      { x: 550, y: 170 },
      { x: 360, y: 70 },
      { x: 170, y: 170 }
    ];

    return {
      unit,
      missingSide: null,
      perimeter,
      diagram: genericCompositeDiagram(points, [
        edgeLabel([0, 1], unitLabel(base, unit), 0, 42),
        edgeLabel([1, 2], unitLabel(wall, unit), 58, 0),
        edgeLabel([2, 3], unitLabel(roof, unit), 48, -36),
        edgeLabel([3, 4], unitLabel(roof, unit), -48, -36),
        edgeLabel([4, 0], unitLabel(wall, unit), -58, 0)
      ]),
      working: [
        `Add the outside edges of the rectangle and triangular roof.`,
        `Perimeter = ${base} + ${wall} + ${roof} + ${roof} + ${wall} = ${perimeter} ${unit}.`
      ]
    };
  }

  // Opposite-corner cutouts: one cutout is at the top-right and the other is at the bottom-left.
  // This is easier to read than a same-side double-step shape.
  const width = randInt(18, 28);
  const height = randInt(14, 22);
  const topRightWidth = randInt(4, 8);
  const topRightHeight = randInt(3, 7);
  const bottomLeftWidth = randInt(4, 8);
  const bottomLeftHeight = randInt(3, 7);

  const topLength = width - topRightWidth;
  const rightLength = height - topRightHeight;
  const bottomLength = width - bottomLeftWidth;
  const leftLength = height - bottomLeftHeight;
  const perimeter = 2 * width + 2 * height;

  const points = [
    { x: 150, y: 105 },
    { x: 500, y: 105 },
    { x: 500, y: 165 },
    { x: 585, y: 165 },
    { x: 585, y: 325 },
    { x: 280, y: 325 },
    { x: 280, y: 255 },
    { x: 150, y: 255 }
  ];

  return {
    unit,
    missingSide: null,
    perimeter,
    diagram: genericCompositeDiagram(points, [
      edgeLabel([0, 1], unitLabel(topLength, unit), 0, -38),
      edgeLabel([1, 2], unitLabel(topRightHeight, unit), -66, 0),
      edgeLabel([2, 3], unitLabel(topRightWidth, unit), 0, 38),
      edgeLabel([3, 4], unitLabel(rightLength, unit), 62, 0),
      edgeLabel([4, 5], unitLabel(bottomLength, unit), 0, 44),
      edgeLabel([5, 6], unitLabel(bottomLeftHeight, unit), 68, 0),
      edgeLabel([6, 7], unitLabel(bottomLeftWidth, unit), 0, -38),
      edgeLabel([7, 0], unitLabel(leftLength, unit), -62, 0)
    ]),
    working: [
      `This shape has cutouts on opposite corners.`,
      `Add the outside edges only.`,
      `Perimeter = ${topLength} + ${topRightHeight} + ${topRightWidth} + ${rightLength} + ${bottomLength} + ${bottomLeftHeight} + ${bottomLeftWidth} + ${leftLength} = ${perimeter} ${unit}.`
    ]
  };
}

/* -----------------------------
   Straight-sided perimeter
----------------------------- */

function perimeterQuadrilateralsQuestion() {
  const unit = choice(UNITS);
  const sides = [randInt(4, 15), randInt(4, 15), randInt(4, 15), randInt(4, 15)];
  const perimeter = sides.reduce((sum, value) => sum + value, 0);

  return lengthQuestion({
    type: "perimeter-quadrilaterals",
    marks: 1,
    prompt: `Find the perimeter of the quadrilateral.`,
    diagram: polygonDiagram("quadrilateral", {
      bottom: unitLabel(sides[0], unit),
      right: unitLabel(sides[1], unit),
      top: unitLabel(sides[2], unit),
      left: unitLabel(sides[3], unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Perimeter = ${sides.join(" + ")} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterParallelogramsQuestion() {
  const unit = choice(UNITS);
  const a = randInt(5, 18);
  const b = randInt(4, 14);
  const perimeter = 2 * (a + b);

  return lengthQuestion({
    type: "perimeter-parallelograms",
    marks: 1,
    prompt: `Find the perimeter of the parallelogram.`,
    diagram: polygonDiagram("parallelogram", {
      top: unitLabel(a, unit),
      left: unitLabel(b, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Opposite sides of a parallelogram are equal.`, `Perimeter = 2(${a} + ${b}) = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterTrapeziumsQuestion() {
  const unit = choice(UNITS);
  const top = randInt(5, 14);
  const bottom = top + randInt(3, 10);
  const left = randInt(4, 12);
  const right = randInt(4, 12);
  const perimeter = top + bottom + left + right;

  return lengthQuestion({
    type: "perimeter-trapeziums",
    marks: 1,
    prompt: `Find the perimeter of the trapezium.`,
    diagram: polygonDiagram("trapezium", {
      top: unitLabel(top, unit),
      bottom: unitLabel(bottom, unit),
      left: unitLabel(left, unit),
      right: unitLabel(right, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`Perimeter = ${top} + ${bottom} + ${left} + ${right} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterRhombusesQuestion() {
  const unit = choice(UNITS);
  const side = randInt(4, 16);
  const perimeter = 4 * side;

  return lengthQuestion({
    type: "perimeter-rhombuses",
    marks: 1,
    prompt: `Find the perimeter of the rhombus.`,
    diagram: polygonDiagram("rhombus", {
      top: unitLabel(side, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`All sides of a rhombus are equal.`, `Perimeter = 4 × ${side} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterKitesQuestion() {
  const unit = choice(UNITS);
  const shortSide = randInt(4, 12);
  const longSide = randInt(shortSide + 2, 18);
  const perimeter = 2 * shortSide + 2 * longSide;

  return lengthQuestion({
    type: "perimeter-kites",
    marks: 1,
    prompt: `Find the perimeter of the kite.`,
    diagram: polygonDiagram("kite", {
      bottom: unitLabel(shortSide, unit),
      left: unitLabel(shortSide, unit),
      right: unitLabel(longSide, unit),
      top: unitLabel(longSide, unit)
    }),
    answer: unitLabel(perimeter, unit),
    working: [`A kite has two pairs of adjacent equal sides.`, `Perimeter = 2 × ${shortSide} + 2 × ${longSide} = ${perimeter} ${unit}.`],
    space: SPACE_SIZES.SMALL
  });
}

function perimeterCompositeQuestion() {
  const made = makeCompositeVariant({ missing: false });

  return lengthQuestion({
    type: "perimeter-composite",
    marks: 2,
    prompt: `Find the perimeter of the composite figure.`,
    diagram: made.diagram,
    answer: unitLabel(made.perimeter, made.unit),
    working: made.working,
    space: SPACE_SIZES.MEDIUM
  });
}

function missingSidePerimeterQuestion() {
  const made = makeCompositeVariant({ missing: true });

  return lengthQuestion({
    type: "missing-side-perimeter",
    marks: 2,
    prompt: `Find the missing side length, then find the perimeter of the composite figure.`,
    diagram: made.diagram,
    answer: `${made.missingSide} ${made.unit}; perimeter = ${made.perimeter} ${made.unit}`,
    working: made.working,
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Circles and curved length
----------------------------- */

function circleFeaturesQuestion() {
  const features = ["radius", "diameter", "chord", "arc", "sector", "segment", "tangent"];
  const feature = choice(features);

  return lengthQuestion({
    type: "circle-features",
    marks: 1,
    prompt: `Name the labelled feature of the circle.`,
    diagram: {
      engine: "length-engine",
      config: {
        diagramType: "circle-features",
        feature
      }
    },
    answer: feature,
    working: [`The labelled feature is the ${feature}.`],
    space: SPACE_SIZES.SMALL
  });
}

function circumferenceDiameterQuestion() {
  const unit = choice(["cm", "m"]);
  const diameter = randInt(4, 24);
  const exact = exactMode();
  const exactAnswer = piTerm(diameter, unit);
  const decimalAnswer = decimalLength(Math.PI * diameter, unit);

  return lengthQuestion({
    type: "circumference-diameter",
    marks: 2,
    prompt: `Find the circumference of the circle. ${promptSuffix(exact)}`,
    diagram: circleMeasureDiagram("diameter", diameter, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`C = πd`, `C = π × ${diameter} = ${exactAnswer}.`]
      : [`C = πd`, `C = π × ${diameter}`, `C ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function circumferenceRadiusQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(3, 15);
  const exact = exactMode();
  const exactAnswer = piTerm(2 * radius, unit);
  const decimalAnswer = decimalLength(2 * Math.PI * radius, unit);

  return lengthQuestion({
    type: "circumference-radius",
    marks: 2,
    prompt: `Find the circumference of the circle. ${promptSuffix(exact)}`,
    diagram: circleMeasureDiagram("radius", radius, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`C = 2πr`, `C = 2π × ${radius} = ${exactAnswer}.`]
      : [`C = 2πr`, `C = 2π × ${radius}`, `C ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function findRadiusDiameterQuestion() {
  const unit = choice(["cm", "m"]);
  const radiusMode = Math.random() < 0.5;

  if (radiusMode) {
    const radius = randInt(3, 15);
    const coefficient = 2 * radius;

    return lengthQuestion({
      type: "find-radius-diameter",
      marks: 2,
      prompt: `The circumference of a circle is ${piTerm(coefficient, unit)}. Find the radius.`,
      answer: unitLabel(radius, unit),
      working: [`C = 2πr`, `${coefficient}π = 2πr`, `r = ${radius} ${unit}.`],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const diameter = randInt(4, 26);

  return lengthQuestion({
    type: "find-radius-diameter",
    marks: 2,
    prompt: `The circumference of a circle is ${piTerm(diameter, unit)}. Find the diameter.`,
    answer: unitLabel(diameter, unit),
    working: [`C = πd`, `${diameter}π = πd`, `d = ${diameter} ${unit}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function arcLengthQuestion() {
  const unit = choice(["cm", "m"]);
  const angle = choice([30, 45, 60, 90, 120, 180, 270]);
  const radius = randInt(4, 14);
  const coefficient = 2 * radius * angle / 360;
  const exact = exactMode();
  const exactAnswer = piTerm(coefficient, unit);
  const decimalAnswer = decimalLength(coefficient * Math.PI, unit);

  return lengthQuestion({
    type: "arc-length",
    marks: 2,
    prompt: `Find the arc length. ${promptSuffix(exact)}`,
    diagram: sectorDiagram(radius, angle, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Arc length = θ/360 × 2πr`, `Arc length = ${angle}/360 × 2π × ${radius} = ${exactAnswer}.`]
      : [`Arc length = θ/360 × 2πr`, `Arc length = ${angle}/360 × 2π × ${radius}`, `Arc length ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function sectorPerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const angle = choice([60, 90, 120, 180]);
  const radius = randInt(4, 14);
  const arcCoefficient = 2 * radius * angle / 360;
  const exact = exactMode();
  const exactAnswer = `${2 * radius} + ${piTerm(arcCoefficient, unit)}`;
  const decimalAnswer = decimalLength(2 * radius + arcCoefficient * Math.PI, unit);

  return lengthQuestion({
    type: "sector-perimeter",
    marks: 2,
    prompt: `Find the perimeter of the sector. ${promptSuffix(exact)}`,
    diagram: sectorDiagram(radius, angle, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Perimeter = two radii + arc length.`, `Arc length = ${piTerm(arcCoefficient, unit)}.`, `Perimeter = ${radius} + ${radius} + ${piTerm(arcCoefficient, unit)} = ${exactAnswer}.`]
      : [`Perimeter = two radii + arc length.`, `Arc length = ${angle}/360 × 2π × ${radius}.`, `Perimeter ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function semicirclePerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const exact = exactMode();
  const exactAnswer = `${2 * radius} + ${piTerm(radius, unit)}`;
  const decimalAnswer = decimalLength(2 * radius + Math.PI * radius, unit);

  return lengthQuestion({
    type: "semicircle-perimeter",
    marks: 2,
    prompt: `Find the perimeter of the semicircle. ${promptSuffix(exact)}`,
    diagram: partialCircleDiagram("semicircle", radius, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Perimeter = half the circumference + diameter.`, `Half circumference = πr = ${piTerm(radius, unit)}.`, `Diameter = ${2 * radius} ${unit}.`, `Perimeter = ${exactAnswer}.`]
      : [`Perimeter = half the circumference + diameter.`, `Perimeter = π × ${radius} + ${2 * radius}.`, `Perimeter ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function quadrantPerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const arcCoefficient = radius / 2;
  const exact = exactMode();
  const exactAnswer = `${2 * radius} + ${piTerm(arcCoefficient, unit)}`;
  const decimalAnswer = decimalLength(2 * radius + arcCoefficient * Math.PI, unit);

  return lengthQuestion({
    type: "quadrant-perimeter",
    marks: 2,
    prompt: `Find the perimeter of the quadrant. ${promptSuffix(exact)}`,
    diagram: partialCircleDiagram("quadrant", radius, unit),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Perimeter = two radii + one-quarter circumference.`, `Quarter circumference = ${piTerm(arcCoefficient, unit)}.`, `Two radii = ${2 * radius} ${unit}.`, `Perimeter = ${exactAnswer}.`]
      : [`Perimeter = two radii + one-quarter circumference.`, `Perimeter = ${2 * radius} + ${piTerm(arcCoefficient, unit)}.`, `Perimeter ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function curvedCompositePerimeterQuestion() {
  const unit = choice(["cm", "m"]);
  const width = choice([8, 10, 12, 14, 16]);
  const height = choice([4, 6, 8, 10]);
  const exact = exactMode();
  const exactAnswer = `${2 * width + height} + ${piTerm(height / 2, unit)}`;
  const decimalAnswer = decimalLength(2 * width + height + Math.PI * (height / 2), unit);

  return lengthQuestion({
    type: "curved-composite-perimeter",
    marks: 3,
    prompt: `Find the perimeter of the composite figure. ${promptSuffix(exact)}`,
    diagram: {
      engine: "length-engine",
      config: {
        diagramType: "curved-composite",
        shape: "rectangle-semicircle",
        width,
        height,
        unit
      }
    },
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [
          `The semicircle has diameter ${height} ${unit}, so radius = ${height / 2} ${unit}.`,
          `Curved part = half circumference = ${piTerm(height / 2, unit)}.`,
          `Straight edges included = ${width} + ${width} + ${height} = ${2 * width + height} ${unit}.`,
          `Perimeter = ${exactAnswer}.`
        ]
      : [
          `The semicircle has diameter ${height} ${unit}, so radius = ${height / 2} ${unit}.`,
          `Curved part = half circumference = ${piTerm(height / 2, unit)}.`,
          `Straight edges included = ${width} + ${width} + ${height} = ${2 * width + height} ${unit}.`,
          `Perimeter ≈ ${decimalAnswer}.`
        ],
    space: SPACE_SIZES.LARGE
  });
}

const GENERATORS = {
  "perimeter-quadrilaterals": perimeterQuadrilateralsQuestion,
  "perimeter-parallelograms": perimeterParallelogramsQuestion,
  "perimeter-trapeziums": perimeterTrapeziumsQuestion,
  "perimeter-rhombuses": perimeterRhombusesQuestion,
  "perimeter-kites": perimeterKitesQuestion,
  "perimeter-composite": perimeterCompositeQuestion,
  "missing-side-perimeter": missingSidePerimeterQuestion,
  "circle-features": circleFeaturesQuestion,
  "circumference-diameter": circumferenceDiameterQuestion,
  "circumference-radius": circumferenceRadiusQuestion,
  "find-radius-diameter": findRadiusDiameterQuestion,
  "arc-length": arcLengthQuestion,
  "sector-perimeter": sectorPerimeterQuestion,
  "semicircle-perimeter": semicirclePerimeterQuestion,
  "quadrant-perimeter": quadrantPerimeterQuestion,
  "curved-composite-perimeter": curvedCompositePerimeterQuestion
};

export function getLengthQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateLengthQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]());
}
