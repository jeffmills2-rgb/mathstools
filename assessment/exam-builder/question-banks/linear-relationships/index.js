/*
  CHHS Exam Builder — Cartesian Plane and Linear Relationships Question Bank
  ------------------------------------------------------------------------
  Save as:

  question-banks/linear-relationships/index.js

  Requires:
  - engines/linear/linear-engine.js

  Covers:
  - plotting and identifying coordinates, including non-whole numbers
  - tables of values, patterns and rules
  - moving between rules, tables, coordinates and graphs
  - graphing linear relationships
  - comparing straight-line graphs
  - real-life linear relationships
  - solving equations graphically
  - intersecting lines and verification
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

import {
  attachQuestionTranslations
} from "../../utils/translation.js";

const TOPIC = "Cartesian Plane and Linear Relationships";

const TYPE_LIST = [
  { id: "identify-coordinates", label: "Identify coordinates of points" },
  { id: "plot-coordinates", label: "Plot and label points" },
  { id: "decimal-coordinates", label: "Non-whole number coordinates" },

  { id: "complete-table-rule", label: "Complete a table from a rule" },
  { id: "pattern-table-rule", label: "Patterns, tables and rules" },
  { id: "use-rule", label: "Use a rule to calculate values" },

  { id: "graph-from-table", label: "Graph a line from a table of values" },
  { id: "graph-from-equation", label: "Graph a line from an equation" },
  { id: "equation-from-table", label: "Write the equation from a table of values" },
  { id: "equation-from-graph", label: "Find a rule from a graph" },

  { id: "compare-linear-graphs", label: "Compare linear graphs" },
  { id: "real-life-linear", label: "Real-life linear relationships" },

  { id: "solve-by-graphing", label: "Solve linear equations graphically" },
  { id: "intersecting-lines", label: "Intersecting lines" },
  { id: "verify-intersection", label: "Verify an intersection point algebraically" }
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

function randomId(prefix = "linear") {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random()}`;
}

function fmt(n) {
  if (Math.abs(n) < 1e-9) return "0";
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return Number(n.toFixed(2)).toString();
}

function coord(x, y) {
  return `(${fmt(x)}, ${fmt(y)})`;
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

function lineExpr(m, b) {
  let mText;

  if (m === 1) mText = "x";
  else if (m === -1) mText = "−x";
  else mText = `${fmt(m)}x`;

  if (b === 0) return `y = ${mText}`;
  if (b > 0) return `y = ${mText} + ${fmt(b)}`;
  return `y = ${mText} − ${fmt(Math.abs(b))}`;
}

function yValue(m, b, x) {
  return m * x + b;
}

function cleanList(values) {
  return values.map(v => typeof v === "number" ? fmt(v) : String(v)).join(", ");
}

function valuesTable(xValues, yValues, blankY = false) {
  return {
    rows: [
      ["x", ...xValues.map(fmt)],
      ["y", ...yValues.map(value => blankY ? "" : fmt(value))]
    ]
  };
}


function linearQuestion({
  type,
  marks = 1,
  prompt,
  answer,
  working = [],
  diagram = null,
  table = null,
  answerTable = null,
  solutionMode = null,
  solutionAnswerMode = null,
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
    table,
    answerTable,
    answer,
    working,
    space,
    solutionMode,
    solutionAnswerMode,
    tags: ["linear relationships", type]
  });
}

function coordinatePlaneDiagram({
  mode = "completed",
  points = [],
  showCoordinates = false,
  xMin = -5,
  xMax = 5,
  yMin = -5,
  yMax = 5,
  xStep = 1,
  yStep = 1,
  xMinorStep = 0.5,
  yMinorStep = 0.5,
  squareGrid = true
} = {}) {
  return {
    engine: "linear-engine",
    config: {
      diagramType: "coordinate-plane",
      mode,
      xMin,
      xMax,
      yMin,
      yMax,
      xStep,
      yStep,
      xMinorStep,
      yMinorStep,
      width: 720,
      height: 620,
      squareGrid,
      points,
      showCoordinates
    }
  };
}

function linearGraphDiagram({
  mode = "completed",
  line = null,
  lines = null,
  points = [],
  showLine = true,
  showLineLabels = true,
  showIntersection = false,
  showIntersectionLabel = true,
  xMin = -8,
  xMax = 8,
  yMin = -8,
  yMax = 8,
  squareGrid = true
} = {}) {
  return {
    engine: "linear-engine",
    config: {
      diagramType: lines && lines.length > 1 ? "intersecting-lines" : "linear-graph",
      mode,
      xMin,
      xMax,
      yMin,
      yMax,
      width: 720,
      height: 620,
      squareGrid,
      xStep: 1,
      yStep: 1,
      xMinorStep: 0.5,
      yMinorStep: 0.5,
      line,
      lines,
      points,
      showLine,
      showLineLabels,
      showIntersection,
      showIntersectionLabel
    }
  };
}

/* -----------------------------
   Coordinates
----------------------------- */

function identifyCoordinatesQuestion() {
  const labels = ["A", "B", "C", "D"];
  const points = [];

  while (points.length < 3) {
    const x = randInt(-4, 4);
    const y = randInt(-4, 4);

    if (x === 0 && y === 0) continue;
    if (points.some(p => p.x === x && p.y === y)) continue;

    points.push({
      label: labels[points.length],
      x,
      y
    });
  }

  const target = choice(points);

  return linearQuestion({
    type: "identify-coordinates",
    marks: 1,
    prompt: `Write the coordinates of point ${target.label}.`,
    diagram: coordinatePlaneDiagram({ points }),
    answer: coord(target.x, target.y),
    working: [`Point ${target.label} is ${coord(target.x, target.y)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function plotCoordinatesQuestion() {
  const point = {
    label: "A",
    x: randInt(-4, 4),
    y: randInt(-4, 4)
  };

  if (point.x === 0 && point.y === 0) point.x = 3;

  return linearQuestion({
    type: "plot-coordinates",
    marks: 1,
    prompt: `Plot and label the point A${coord(point.x, point.y)} on the Cartesian plane.`,
    diagram: coordinatePlaneDiagram({ mode: "blank" }),
    answer: `Point A at ${coord(point.x, point.y)}`,
    working: [`Move ${fmt(point.x)} along the x-axis and ${fmt(point.y)} along the y-axis.`],
    space: SPACE_SIZES.NONE
  });
}

function decimalCoordinatesQuestion() {
  const values = [-4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const identify = Math.random() < 0.5;
  const point = {
    label: "P",
    x: choice(values),
    y: choice(values)
  };

  if (identify) {
    return linearQuestion({
      type: "decimal-coordinates",
      marks: 1,
      prompt: `Write the coordinates of point ${point.label}.`,
      diagram: coordinatePlaneDiagram({
        points: [point],
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        xMinorStep: 0.5,
        yMinorStep: 0.5
      }),
      answer: coord(point.x, point.y),
      working: [`Point ${point.label} is ${coord(point.x, point.y)}.`],
      space: SPACE_SIZES.SMALL
    });
  }

  return linearQuestion({
    type: "decimal-coordinates",
    marks: 1,
    prompt: `Plot and label the point P${coord(point.x, point.y)} on the Cartesian plane.`,
    diagram: coordinatePlaneDiagram({
      mode: "blank",
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
      xMinorStep: 0.5,
      yMinorStep: 0.5
    }),
    answer: `Point P at ${coord(point.x, point.y)}`,
    working: [`Use the half-unit grid lines to locate ${coord(point.x, point.y)}.`],
    space: SPACE_SIZES.NONE
  });
}

/* -----------------------------
   Tables, patterns and rules
----------------------------- */

function completeTableRuleQuestion() {
  const m = choice([-2, -1, 1, 2, 3, 4]);
  const b = randInt(-3, 5);
  const xs = [-2, -1, 0, 1, 2];
  const ys = xs.map(x => yValue(m, b, x));

  return linearQuestion({
    type: "complete-table-rule",
    marks: 2,
    prompt: `Complete the table of values for ${lineExpr(m, b)}.`,
    table: valuesTable(xs, ys, true),
    answerTable: valuesTable(xs, ys, false),
    answer: `y-values: ${cleanList(ys)}`,
    working: [],
    solutionMode: "table-only",
    space: SPACE_SIZES.MEDIUM
  });
}

function patternTableRuleQuestion() {
  const start = randInt(2, 7);
  const difference = choice([2, 3, 4, 5]);
  const figures = [1, 2, 3];
  const counts = figures.map(n => start + difference * (n - 1));
  const nTarget = choice([8, 10, 12, 15]);
  const targetValue = start + difference * (nTarget - 1);
  const m = difference;
  const b = start - difference;

  return linearQuestion({
    type: "pattern-table-rule",
    marks: 3,
    prompt: `The tile pattern continues in the same way. Write a rule for the number of tiles in Figure n, then find the number of tiles in Figure ${nTarget}.`,
    diagram: {
      engine: "linear-engine",
      config: {
        diagramType: "tile-pattern",
        figures: figures.map((n, i) => ({ n, count: counts[i] })),
        showCounts: true
      }
    },
    answer: `Rule: T = ${m}n ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}; Figure ${nTarget}: ${targetValue} tiles`,
    working: [
      `The pattern increases by ${difference} each figure.`,
      `Rule: T = ${m}n ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}.`,
      `For n = ${nTarget}, T = ${targetValue}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function useRuleQuestion() {
  const m = choice([2, 3, 4, 5, -1, -2]);
  const b = randInt(-5, 8);
  const x = choice([6, 8, 10, 12, 15]);
  const y = yValue(m, b, x);

  return linearQuestion({
    type: "use-rule",
    marks: 1,
    prompt: `Use the rule ${lineExpr(m, b)} to find y when x = ${x}.`,
    answer: String(y),
    working: [`y = ${fmt(m)} × ${x} ${b >= 0 ? "+ " + fmt(b) : "− " + fmt(Math.abs(b))} = ${fmt(y)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function equationFromTableQuestion() {
  const m = choice([-3, -2, -1, 1, 2, 3]);
  const b = randInt(-4, 4);
  const xs = [-2, -1, 0, 1, 2];
  const ys = xs.map(x => yValue(m, b, x));
  const direction = m > 0 ? "increases" : "decreases";

  return linearQuestion({
    type: "equation-from-table",
    marks: 2,
    prompt: `Write the equation for the linear relationship shown in the table.`,
    table: valuesTable(xs, ys, false),
    answer: lineExpr(m, b),
    working: [
      `As x increases by 1, y ${direction} by ${fmt(Math.abs(m))}. So the gradient is ${fmt(m)}.`,
      `When x = 0, y = ${fmt(b)}. So the y-intercept is ${fmt(b)}.`,
      `Equation: ${lineExpr(m, b)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

/* -----------------------------
   Graphing linear relationships
----------------------------- */

function graphFromTableQuestion() {
  const m = choice([-2, -1, 1, 2]);
  const b = randInt(-3, 3);
  const xs = [-2, -1, 0, 1, 2];
  const pairs = xs.map(x => ({ x, y: yValue(m, b, x) }));
  const ys = pairs.map(p => p.y);

  return linearQuestion({
    type: "graph-from-table",
    marks: 2,
    prompt: `Complete the table of values for ${lineExpr(m, b)}, then graph the line.`,
    table: valuesTable(xs, ys, true),
    answerTable: valuesTable(xs, ys, false),
    diagram: linearGraphDiagram({
      mode: "blank",
      line: { m, b },
      showLine: false,
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: `Line ${lineExpr(m, b)}`,
    working: [
      `Complete the table: y-values are ${cleanList(ys)}.`,
      `Plot the coordinate pairs: ${pairs.map(p => coord(p.x, p.y)).join(", ")}.`,
      `Join the points with a straight line.`
    ],
    space: SPACE_SIZES.NONE
  });
}

function graphFromEquationQuestion() {
  const m = choice([-2, -1, 1, 2]);
  const b = randInt(-3, 3);

  return linearQuestion({
    type: "graph-from-equation",
    marks: 2,
    prompt: `Graph the linear relationship ${lineExpr(m, b)}.`,
    diagram: linearGraphDiagram({
      mode: "blank",
      line: { m, b },
      showLine: false,
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: `Line ${lineExpr(m, b)}`,
    working: [
      `Choose some x-values and calculate y-values.`,
      `Plot the points and join them with a straight line.`
    ],
    space: SPACE_SIZES.NONE
  });
}

function equationFromGraphQuestion() {
  const m = choice([-2, -1, 1, 2, 3]);
  const b = randInt(-3, 4);
  const x1 = 0;
  const x2 = 1;
  const points = [
    { label: "A", x: x1, y: yValue(m, b, x1) },
    { label: "B", x: x2, y: yValue(m, b, x2) }
  ];

  return linearQuestion({
    type: "equation-from-graph",
    marks: 2,
    prompt: `Find the rule for the graphed linear relationship.`,
    diagram: linearGraphDiagram({
      mode: "completed",
      line: { m, b, label: lineExpr(m, b), showLabel: false },
      points,
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: lineExpr(m, b),
    working: [
      `The y-intercept is ${fmt(b)}.`,
      `The gradient is ${fmt(m)}.`,
      `Rule: ${lineExpr(m, b)}.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

function compareLinearGraphsQuestion() {
  const b = randInt(-3, 3);
  const m1 = choice([1, 2, 3]);
  const m2 = choice([-1, -2, 1, 2, 3].filter(m => m !== m1));
  const lines = [
    { m: m1, b, label: "Line A" },
    { m: m2, b: b + randInt(1, 3), label: "Line B" }
  ];
  const steeper = Math.abs(m1) > Math.abs(m2) ? "Line A" : "Line B";

  return linearQuestion({
    type: "compare-linear-graphs",
    marks: 1,
    prompt: `Which line has a greater gradient, Line A or Line B?`,
    diagram: linearGraphDiagram({
      mode: "completed",
      lines,
      showIntersection: false,
      showLineLabels: true,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: steeper,
    working: [`The line with the greater absolute gradient is steeper.`, `${steeper} has the greater gradient.`],
    space: SPACE_SIZES.SMALL
  });
}

/* -----------------------------
   Applications and graphical solving
----------------------------- */

function realLifeLinearQuestion() {
  const start = choice([5, 10, 20, 30]);
  const rate = choice([2, 3, 4, 5, 8]);

  return linearQuestion({
    type: "real-life-linear",
    marks: 1,
    prompt: `A taxi fare costs $${start} plus $${rate} per kilometre.\nWrite a rule for the cost C after k kilometres.`,
    answer: `C = ${rate}k + ${start}`,
    working: [
      `Fixed cost = $${start}. Rate = $${rate} per km.`,
      `Rule: C = ${rate}k + ${start}.`
    ],
    space: SPACE_SIZES.SMALL
  });
}

function solveByGraphingQuestion() {
  const m = choice([1, 2, 3, -1, -2]);
  const x = randInt(-3, 4);
  const b = randInt(-3, 4);
  const y = yValue(m, b, x);

  return linearQuestion({
    type: "solve-by-graphing",
    marks: 1,
    prompt: `Use the graph of ${lineExpr(m, b)} to find the value of x when y = ${fmt(y)}.`,
    diagram: linearGraphDiagram({
      mode: "completed",
      line: { m, b, label: lineExpr(m, b), showLabel: false },
      points: [],
      showLineLabels: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: `x = ${fmt(x)}`,
    working: [`The point on the line with y = ${fmt(y)} has x = ${fmt(x)}.`],
    space: SPACE_SIZES.SMALL
  });
}

function makeIntersectingLines() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const x = randInt(-3, 3);
    const y = randInt(-4, 4);
    const m1 = choice([-2, -1, 1, 2]);
    let m2 = choice([-3, -2, -1, 1, 2, 3]);

    while (m2 === m1) {
      m2 = choice([-3, -2, -1, 1, 2, 3]);
    }

    const b1 = y - m1 * x;
    const b2 = y - m2 * x;

    if (Math.abs(b1) > 6 || Math.abs(b2) > 6) continue;

    return {
      intersection: { x, y },
      lines: [
        { m: m1, b: b1, label: "Line A", showLabel: false },
        { m: m2, b: b2, label: "Line B", showLabel: false }
      ]
    };
  }

  return {
    intersection: { x: 1, y: 0 },
    lines: [
      { m: 1, b: -1, label: "Line A", showLabel: false },
      { m: -2, b: 2, label: "Line B", showLabel: false }
    ]
  };
}

function intersectingLinesQuestion() {
  const made = makeIntersectingLines();

  return linearQuestion({
    type: "intersecting-lines",
    marks: 2,
    prompt: `Graph the two lines and identify their point of intersection:
${lineExpr(made.lines[0].m, made.lines[0].b)}
${lineExpr(made.lines[1].m, made.lines[1].b)}.`,
    diagram: linearGraphDiagram({
      mode: "blank",
      lines: made.lines,
      showLine: false,
      showLineLabels: false,
      showIntersection: false,
      xMin: -8,
      xMax: 8,
      yMin: -8,
      yMax: 8
    }),
    answer: coord(made.intersection.x, made.intersection.y),
    working: [
      `Graph both lines.`,
      `The point of intersection is ${coord(made.intersection.x, made.intersection.y)}.`
    ],
    space: SPACE_SIZES.NONE
  });
}

function verifyIntersectionQuestion() {
  const made = makeIntersectingLines();
  const p = made.intersection;
  const lineA = lineExpr(made.lines[0].m, made.lines[0].b);
  const lineB = lineExpr(made.lines[1].m, made.lines[1].b);

  return linearQuestion({
    type: "verify-intersection",
    marks: 2,
    prompt: `Verify algebraically that ${coord(p.x, p.y)} is the point of intersection for:
${lineA}
${lineB}.`,
    answer: `It satisfies both equations.`,
    working: [
      `Substitute x = ${fmt(p.x)} into ${lineA}: y = ${fmt(p.y)}.`,
      `Substitute x = ${fmt(p.x)} into ${lineB}: y = ${fmt(p.y)}.`,
      `The point satisfies both equations, so it is the point of intersection.`
    ],
    space: SPACE_SIZES.MEDIUM
  });
}

const GENERATORS = {
  "identify-coordinates": identifyCoordinatesQuestion,
  "plot-coordinates": plotCoordinatesQuestion,
  "decimal-coordinates": decimalCoordinatesQuestion,
  "complete-table-rule": completeTableRuleQuestion,
  "pattern-table-rule": patternTableRuleQuestion,
  "use-rule": useRuleQuestion,
  "graph-from-table": graphFromTableQuestion,
  "graph-from-equation": graphFromEquationQuestion,
  "equation-from-table": equationFromTableQuestion,
  "equation-from-graph": equationFromGraphQuestion,
  "compare-linear-graphs": compareLinearGraphsQuestion,
  "real-life-linear": realLifeLinearQuestion,
  "solve-by-graphing": solveByGraphingQuestion,
  "intersecting-lines": intersectingLinesQuestion,
  "verify-intersection": verifyIntersectionQuestion
};

export function getLinearRelationshipsQuestionTypes() {
  return TYPE_LIST.slice();
}

export function generateLinearRelationshipsQuestions({
  count = 8,
  allowedTypes = null
} = {}) {
  const typeIds = Array.isArray(allowedTypes) && allowedTypes.length
    ? allowedTypes.filter(id => GENERATORS[id])
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);

  return plan.map(type => GENERATORS[type]()).map(attachQuestionTranslations);
}
