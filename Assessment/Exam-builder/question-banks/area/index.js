/*
  CHHS Exam Builder — Area Question Bank
  --------------------------------------
  Save as:

  question-banks/area/index.js

  Requires:
  - engines/area/area-engine.js
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Area";

const TYPE_LIST = [
  { id: "area-rectangles", label: "Area of rectangles and squares" },
  { id: "area-triangles", label: "Area of triangles" },
  { id: "area-parallelograms", label: "Area of parallelograms" },

  { id: "composite-rectangles-triangles", label: "Composite area: rectangles, squares and triangles" },

  { id: "area-circles-radius", label: "Area of circles using radius" },
  { id: "area-circles-diameter", label: "Area of circles using diameter" },
  { id: "area-sectors", label: "Area of sectors" },
  { id: "area-semicircles", label: "Area of semicircles" },
  { id: "area-quadrants", label: "Area of quadrants" },
  { id: "curved-composite-area", label: "Composite area with circles, semicircles and quadrants" },

  { id: "area-trapeziums", label: "Area of trapeziums" },
  { id: "area-rhombuses", label: "Area of rhombuses" },
  { id: "area-kites", label: "Area of kites" },
  { id: "advanced-composite-area", label: "Composite area with trapeziums, kites and rhombuses" },

  { id: "choose-area-units", label: "Choose appropriate area units" },
  { id: "convert-area-units", label: "Convert metric units of area" }
];

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

function randomId(prefix = "area") {
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

function areaQuestion({
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
    tags: ["area", type]
  });
}

function unitLabel(value, unit) {
  return `${value} ${unit}`;
}

function squareUnit(unit) {
  return `${unit}²`;
}

function areaLabel(value, unit) {
  return `${value} ${squareUnit(unit)}`;
}

function piAreaTerm(coefficient, unit = "") {
  const rounded = Math.round(coefficient * 1000) / 1000;
  if (rounded === 1) return `π${unit ? " " + squareUnit(unit) : ""}`;
  return `${rounded}π${unit ? " " + squareUnit(unit) : ""}`;
}

function approx(value, dp = 1) {
  return Number(value.toFixed(dp)).toString();
}

function decimalArea(value, unit) {
  return `${approx(value, 1)} ${squareUnit(unit)}`;
}

function exactMode() {
  return Math.random() < 0.55;
}

function promptSuffix(exact) {
  return exact ? "Give your answer in terms of π." : "Give your answer correct to 1 decimal place.";
}

function areaDiagram(diagramType, config = {}) {
  return {
    engine: "area-engine",
    config: {
      diagramType,
      ...config
    }
  };
}

/* -----------------------------
   Rectangles, triangles and parallelograms
----------------------------- */

function areaRectanglesQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const square = Math.random() < 0.35;

  if (square) {
    const side = randInt(4, 18);
    const area = side * side;

    return areaQuestion({
      type: "area-rectangles",
      marks: 1,
      prompt: `Find the area of the square.`,
      diagram: areaDiagram("rectangle", {
        shape: "square",
        lengthLabel: unitLabel(side, unit),
        widthLabel: unitLabel(side, unit)
      }),
      answer: areaLabel(area, unit),
      working: [`A = l × b`, `A = ${side} × ${side} = ${area} ${squareUnit(unit)}.`],
      space: SPACE_SIZES.SMALL
    });
  }

  const length = randInt(5, 24);
  const width = randInt(3, 15);
  const area = length * width;

  return areaQuestion({
    type: "area-rectangles",
    marks: 1,
    prompt: `Find the area of the rectangle.`,
    diagram: areaDiagram("rectangle", {
      lengthLabel: unitLabel(length, unit),
      widthLabel: unitLabel(width, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = l × b`, `A = ${length} × ${width} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function areaTrianglesQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const base = randInt(6, 24);
  const height = randInt(4, 16);
  const area = base * height / 2;

  return areaQuestion({
    type: "area-triangles",
    marks: 2,
    prompt: `Find the area of the triangle.`,
    diagram: areaDiagram("triangle", {
      baseLabel: unitLabel(base, unit),
      heightLabel: unitLabel(height, unit),
      oblique: Math.random() < 0.5
    }),
    answer: areaLabel(area, unit),
    working: [`A = 1/2 × b × h`, `A = 1/2 × ${base} × ${height} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaParallelogramsQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const base = randInt(6, 24);
  const height = randInt(4, 16);
  const area = base * height;

  return areaQuestion({
    type: "area-parallelograms",
    marks: 1,
    prompt: `Find the area of the parallelogram.`,
    diagram: areaDiagram("parallelogram", {
      baseLabel: unitLabel(base, unit),
      heightLabel: unitLabel(height, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = b × h`, `A = ${base} × ${height} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function compositeRectanglesTrianglesQuestion() {
  const unit = choice(["cm", "m"]);
  const shape = choice(["l-shape", "rectangle-triangle"]);

  if (shape === "rectangle-triangle") {
    const width = randInt(10, 20);
    const rectHeight = randInt(5, 12);
    const triangleHeight = randInt(4, 10);
    const area = width * rectHeight + width * triangleHeight / 2;

    return areaQuestion({
      type: "composite-rectangles-triangles",
      marks: 2,
      prompt: `Find the area of the composite figure.`,
      diagram: areaDiagram("composite-straight", {
        shape: "rectangle-triangle",
        baseLabel: unitLabel(width, unit),
        heightLabel: unitLabel(rectHeight, unit),
        triangleHeightLabel: unitLabel(triangleHeight, unit)
      }),
      answer: areaLabel(area, unit),
      working: [
        `Rectangle area = ${width} × ${rectHeight} = ${width * rectHeight} ${squareUnit(unit)}.`,
        `Triangle area = 1/2 × ${width} × ${triangleHeight} = ${width * triangleHeight / 2} ${squareUnit(unit)}.`,
        `Total area = ${area} ${squareUnit(unit)}.`
      ],
      space: SPACE_SIZES.MEDIUM
    });
  }

  const top = randInt(14, 24);
  const leftHeight = randInt(8, 16);
  const rightHeight = randInt(4, leftHeight - 2);
  const notchWidth = randInt(4, 9);
  const bottom = top - notchWidth;
  const area = bottom * leftHeight + notchWidth * rightHeight;

  return areaQuestion({
    type: "composite-rectangles-triangles",
    marks: 2,
    prompt: `Find the area of the composite figure.`,
    diagram: areaDiagram("composite-straight", {
      shape: "l-shape",
      topLabel: unitLabel(top, unit),
      leftHeightLabel: unitLabel(leftHeight, unit),
      rightHeightLabel: unitLabel(rightHeight, unit),
      notchWidthLabel: unitLabel(notchWidth, unit),
      bottomLabel: unitLabel(bottom, unit)
    }),
    answer: areaLabel(area, unit),
    working: [
      `Split the shape into two rectangles.`,
      `Area = ${bottom} × ${leftHeight} + ${notchWidth} × ${rightHeight}.`,
      `Area = ${area} ${squareUnit(unit)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Circles and curved area
----------------------------- */

function areaCirclesRadiusQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(3, 15);
  const exact = exactMode();
  const exactAnswer = piAreaTerm(radius * radius, unit);
  const decimalAnswer = decimalArea(Math.PI * radius * radius, unit);

  return areaQuestion({
    type: "area-circles-radius",
    marks: 2,
    prompt: `Find the area of the circle. ${promptSuffix(exact)}`,
    diagram: areaDiagram("circle", {
      given: "radius",
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = πr²`, `A = π × ${radius}² = ${exactAnswer}.`]
      : [`A = πr²`, `A = π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaCirclesDiameterQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(3, 12);
  const diameter = radius * 2;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(radius * radius, unit);
  const decimalAnswer = decimalArea(Math.PI * radius * radius, unit);

  return areaQuestion({
    type: "area-circles-diameter",
    marks: 2,
    prompt: `Find the area of the circle. ${promptSuffix(exact)}`,
    diagram: areaDiagram("circle", {
      given: "diameter",
      diameter,
      diameterLabel: unitLabel(diameter, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Radius = ${diameter} ÷ 2 = ${radius} ${unit}.`, `A = πr²`, `A = π × ${radius}² = ${exactAnswer}.`]
      : [`Radius = ${diameter} ÷ 2 = ${radius} ${unit}.`, `A = πr²`, `A = π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaSectorsQuestion() {
  const unit = choice(["cm", "m"]);
  const angle = choice([30, 45, 60, 90, 120, 180, 270]);
  const radius = randInt(4, 14);
  const coefficient = angle / 360 * radius * radius;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(coefficient, unit);
  const decimalAnswer = decimalArea(coefficient * Math.PI, unit);

  return areaQuestion({
    type: "area-sectors",
    marks: 2,
    prompt: `Find the area of the sector. ${promptSuffix(exact)}`,
    diagram: areaDiagram("sector", {
      angle,
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = θ/360 × πr²`, `A = ${angle}/360 × π × ${radius}² = ${exactAnswer}.`]
      : [`A = θ/360 × πr²`, `A = ${angle}/360 × π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaSemicirclesQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const coefficient = radius * radius / 2;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(coefficient, unit);
  const decimalAnswer = decimalArea(coefficient * Math.PI, unit);

  return areaQuestion({
    type: "area-semicircles",
    marks: 2,
    prompt: `Find the area of the semicircle. ${promptSuffix(exact)}`,
    diagram: areaDiagram("partial-circle", {
      shape: "semicircle",
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = 1/2 × πr²`, `A = 1/2 × π × ${radius}² = ${exactAnswer}.`]
      : [`A = 1/2 × πr²`, `A = 1/2 × π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaQuadrantsQuestion() {
  const unit = choice(["cm", "m"]);
  const radius = randInt(4, 16);
  const coefficient = radius * radius / 4;
  const exact = exactMode();
  const exactAnswer = piAreaTerm(coefficient, unit);
  const decimalAnswer = decimalArea(coefficient * Math.PI, unit);

  return areaQuestion({
    type: "area-quadrants",
    marks: 2,
    prompt: `Find the area of the quadrant. ${promptSuffix(exact)}`,
    diagram: areaDiagram("partial-circle", {
      shape: "quadrant",
      radius,
      radiusLabel: unitLabel(radius, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`A = 1/4 × πr²`, `A = 1/4 × π × ${radius}² = ${exactAnswer}.`]
      : [`A = 1/4 × πr²`, `A = 1/4 × π × ${radius}²`, `A ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function curvedCompositeAreaQuestion() {
  const unit = choice(["cm", "m"]);
  const shape = choice(["rectangle-semicircle", "square-minus-quadrant"]);

  if (shape === "square-minus-quadrant") {
    const side = choice([6, 8, 10, 12, 14]);
    const exact = exactMode();
    const exactAnswer = `${side * side} − ${piAreaTerm(side * side / 4, unit)}`;
    const decimalAnswer = decimalArea(side * side - Math.PI * side * side / 4, unit);

    return areaQuestion({
      type: "curved-composite-area",
      marks: 3,
      prompt: `Find the shaded area. ${promptSuffix(exact)}`,
      diagram: areaDiagram("curved-composite", {
        shape: "square-minus-quadrant",
        side,
        sideLabel: unitLabel(side, unit),
        unit
      }),
      answer: exact ? exactAnswer : decimalAnswer,
      working: exact
        ? [`Square area = ${side}² = ${side * side} ${squareUnit(unit)}.`, `Quadrant area = ${piAreaTerm(side * side / 4, unit)}.`, `Shaded area = ${exactAnswer}.`]
        : [`Square area = ${side}² = ${side * side} ${squareUnit(unit)}.`, `Quadrant area = 1/4 × π × ${side}².`, `Shaded area ≈ ${decimalAnswer}.`],
      space: SPACE_SIZES.LARGE
    });
  }

  const width = choice([8, 10, 12, 14, 16]);
  const height = choice([4, 6, 8, 10]);
  const radius = height / 2;
  const exact = exactMode();
  const rectangleArea = width * height;
  const exactAnswer = `${rectangleArea} + ${piAreaTerm(radius * radius / 2, unit)}`;
  const decimalAnswer = decimalArea(rectangleArea + Math.PI * radius * radius / 2, unit);

  return areaQuestion({
    type: "curved-composite-area",
    marks: 3,
    prompt: `Find the area of the composite figure. ${promptSuffix(exact)}`,
    diagram: areaDiagram("curved-composite", {
      shape: "rectangle-semicircle",
      width,
      height,
      widthLabel: unitLabel(width, unit),
      heightLabel: unitLabel(height, unit),
      unit
    }),
    answer: exact ? exactAnswer : decimalAnswer,
    working: exact
      ? [`Rectangle area = ${width} × ${height} = ${rectangleArea} ${squareUnit(unit)}.`, `Semicircle radius = ${radius} ${unit}.`, `Semicircle area = ${piAreaTerm(radius * radius / 2, unit)}.`, `Total area = ${exactAnswer}.`]
      : [`Rectangle area = ${width} × ${height} = ${rectangleArea} ${squareUnit(unit)}.`, `Semicircle radius = ${radius} ${unit}.`, `Total area ≈ ${decimalAnswer}.`],
    space: SPACE_SIZES.LARGE
  });
}

/* -----------------------------
   Trapeziums, rhombuses and kites
----------------------------- */

function areaTrapeziumsQuestion() {
  const unit = choice(["cm", "m"]);
  const a = randInt(6, 16);
  const b = a + randInt(4, 12);
  const h = randInt(4, 12);
  const area = h / 2 * (a + b);

  return areaQuestion({
    type: "area-trapeziums",
    marks: 2,
    prompt: `Find the area of the trapezium.`,
    diagram: areaDiagram("trapezium", {
      topLabel: unitLabel(a, unit),
      bottomLabel: unitLabel(b, unit),
      heightLabel: unitLabel(h, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = h/2 × (a + b)`, `A = ${h}/2 × (${a} + ${b}) = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaRhombusesQuestion() {
  const unit = choice(["cm", "m"]);
  const x = randInt(8, 24);
  const y = randInt(6, 20);
  const area = x * y / 2;

  return areaQuestion({
    type: "area-rhombuses",
    marks: 2,
    prompt: `Find the area of the rhombus.`,
    diagram: areaDiagram("rhombus", {
      diagonalXLabel: unitLabel(x, unit),
      diagonalYLabel: unitLabel(y, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = 1/2 × x × y`, `A = 1/2 × ${x} × ${y} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function areaKitesQuestion() {
  const unit = choice(["cm", "m"]);
  const x = randInt(8, 24);
  const y = randInt(6, 20);
  const area = x * y / 2;

  return areaQuestion({
    type: "area-kites",
    marks: 2,
    prompt: `Find the area of the kite.`,
    diagram: areaDiagram("kite", {
      diagonalXLabel: unitLabel(x, unit),
      diagonalYLabel: unitLabel(y, unit)
    }),
    answer: areaLabel(area, unit),
    working: [`A = 1/2 × x × y`, `A = 1/2 × ${x} × ${y} = ${area} ${squareUnit(unit)}.`],
    space: SPACE_SIZES.MEDIUM
  });
}

function advancedCompositeAreaQuestion() {
  const unit = choice(["cm", "m"]);
  const top = randInt(8, 14);
  const bottom = randInt(top + 6, top + 16);
  const totalHeight = randInt(12, 22);
  const triangleHeight = randInt(4, 8);
  const trapeziumHeight = totalHeight - triangleHeight;
  const triangleArea = top * triangleHeight / 2;
  const trapeziumArea = trapeziumHeight / 2 * (top + bottom);
  const totalArea = triangleArea + trapeziumArea;

  return areaQuestion({
    type: "advanced-composite-area",
    marks: 3,
    prompt: `Find the area of the composite figure.`,
    diagram: areaDiagram("advanced-composite", {
      trapeziumTopLabel: unitLabel(top, unit),
      trapeziumBottomLabel: unitLabel(bottom, unit),
      totalHeightLabel: unitLabel(totalHeight, unit),
      unit
    }),
    answer: areaLabel(totalArea, unit),
    working: [
      `Split into a triangle and a trapezium.`,
      `Triangle height = ${triangleHeight} ${unit}; trapezium height = ${trapeziumHeight} ${unit}.`,
      `Triangle area = 1/2 × ${top} × ${triangleHeight} = ${triangleArea} ${squareUnit(unit)}.`,
      `Trapezium area = ${trapeziumHeight}/2 × (${top} + ${bottom}) = ${trapeziumArea} ${squareUnit(unit)}.`,
      `Total area = ${totalArea} ${squareUnit(unit)}.`
    ],
    space: SPACE_SIZES.LARGE
  });
}

/* -----------------------------
   Units
----------------------------- */

function chooseAreaUnitsQuestion() {
  const contexts = [
    { item: "a postage stamp", answer: "cm²", reason: "It is a small surface." },
    { item: "a classroom floor", answer: "m²", reason: "It is a room-sized surface." },
    { item: "a town park", answer: "ha", reason: "It is a large land area." },
    { item: "a large farm", answer: "km²", reason: "It is a very large land area." },
    { item: "a phone screen", answer: "cm²", reason: "It is a small surface." }
  ];
  const context = choice(contexts);

  return areaQuestion({
    type: "choose-area-units",
    marks: 1,
    prompt: `Choose an appropriate unit to measure the area of ${context.item}.`,
    answer: context.answer,
    working: [`${context.answer} is appropriate because ${context.reason}`],
    space: SPACE_SIZES.SMALL
  });
}

function convertAreaUnitsQuestion() {
  const mode = choice(["cm2-to-mm2", "m2-to-cm2", "ha-to-m2", "km2-to-m2", "m2-to-ha"]);

  if (mode === "cm2-to-mm2") {
    const value = randInt(2, 30);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} cm² to mm².`,
      answer: `${value * 100} mm²`,
      working: [`1 cm² = 100 mm²`, `${value} cm² = ${value * 100} mm².`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "m2-to-cm2") {
    const value = randInt(2, 20);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} m² to cm².`,
      answer: `${value * 10000} cm²`,
      working: [`1 m² = 10 000 cm²`, `${value} m² = ${value * 10000} cm².`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "ha-to-m2") {
    const value = randInt(2, 12);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} ha to m².`,
      answer: `${value * 10000} m²`,
      working: [`1 ha = 10 000 m²`, `${value} ha = ${value * 10000} m².`],
      space: SPACE_SIZES.SMALL
    });
  }

  if (mode === "km2-to-m2") {
    const value = randInt(2, 8);
    return areaQuestion({
      type: "convert-area-units",
      marks: 1,
      prompt: `Convert ${value} km² to m².`,
      answer: `${value * 1000000} m²`,
      working: [`1 km² = 1 000 000 m²`, `${value} km² = ${value * 1000000} m².`],
      space: SPACE_SIZES.SMALL
    });
  }

  const value = choice([10000, 20000, 30000, 50000, 75000, 100000]);
  return areaQuestion({
    type: "convert-area-units",
    marks: 1,
    prompt: `Convert ${value} m² to ha.`,
    answer: `${value / 10000} ha`,
    working: [`1 ha = 10 000 m²`, `${value} m² = ${value / 10000} ha.`],
    space: SPACE_SIZES.SMALL
  });
}

const GENERATORS = {
  "area-rectangles": areaRectanglesQuestion,
  "area-triangles": areaTrianglesQuestion,
  "area-parallelograms": areaParallelogramsQuestion,
  "composite-rectangles-triangles": compositeRectanglesTrianglesQuestion,
  "area-circles-radius": areaCirclesRadiusQuestion,
  "area-circles-diameter": areaCirclesDiameterQuestion,
  "area-sectors": areaSectorsQuestion,
  "area-semicircles": areaSemicirclesQuestion,
  "area-quadrants": areaQuadrantsQuestion,
  "curved-composite-area": curvedCompositeAreaQuestion,
  "area-trapeziums": areaTrapeziumsQuestion,
  "area-rhombuses": areaRhombusesQuestion,
  "area-kites": areaKitesQuestion,
  "advanced-composite-area": advancedCompositeAreaQuestion,
  "choose-area-units": chooseAreaUnitsQuestion,
  "convert-area-units": convertAreaUnitsQuestion
};

export function getAreaQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateAreaQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]());
}
