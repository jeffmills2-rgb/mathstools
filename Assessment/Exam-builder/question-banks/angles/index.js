/*
  CHHS Exam Builder — Angle Relationships Question Bank
  ----------------------------------------------------
  Save as:

  question-banks/angles/index.js

  This version removes Basic/Expected.
  It exposes one blended mixed list of angle question types.
*/

import {
  createQuestion,
  SPACE_SIZES
} from "../../schemas/question.schema.js";

const TOPIC = "Angle Relationships";

const TYPE_LIST = [
  { id: "straight-line", label: "Angles on a straight line" },
  { id: "right-angle", label: "Angles in a right angle" },
  { id: "around-point", label: "Angles around a point" },
  { id: "vertically-opposite", label: "Vertically opposite angles" },
  { id: "parallel-lines", label: "Parallel lines" },
  { id: "protractor", label: "Read an angle from a protractor" }
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

function randomId(prefix = "angle") {
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

function straightLineQuestion() {
  const known = randInt(35, 145);
  const missing = 180 - known;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "straight-line",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "straight",
        knownAngle: known,
        missingLabel: "x"
      }
    },
    answer: `${missing}°`,
    working: [
      "Angles on a straight line add to 180°.",
      `x = 180° − ${known}°`,
      `x = ${missing}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "straight line"]
  });
}

function rightAngleQuestion() {
  const known = randInt(20, 70);
  const missing = 90 - known;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "right-angle",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "right",
        knownAngle: known,
        missingLabel: "x"
      }
    },
    answer: `${missing}°`,
    working: [
      "Angles in a right angle add to 90°.",
      `x = 90° − ${known}°`,
      `x = ${missing}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "right angle"]
  });
}

function aroundPointQuestion() {
  let a;
  let b;
  let c;
  let missing;

  do {
    a = randInt(60, 130);
    b = randInt(50, 120);
    c = randInt(40, 100);
    missing = 360 - a - b - c;
  } while (missing < 35 || missing > 150);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "around-point",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "point",
        knownAngles: [a, b, c],
        missingLabel: "x"
      }
    },
    answer: `${missing}°`,
    working: [
      "Angles around a point add to 360°.",
      `x = 360° − (${a}° + ${b}° + ${c}°)`,
      `x = ${missing}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "around a point"]
  });
}

function verticallyOppositeQuestion() {
  const angle = randInt(35, 145);

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "vertically-opposite",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "vertical",
        knownAngle: angle,
        missingLabel: "x"
      }
    },
    answer: `${angle}°`,
    working: [
      "Vertically opposite angles are equal.",
      `x = ${angle}°`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "vertically opposite"]
  });
}

function parallelLinesQuestion() {
  const angle = randInt(40, 140);
  const relationship = choice(["corresponding", "alternate", "co-interior"]);
  const answer = relationship === "co-interior" ? 180 - angle : angle;

  const reason = relationship === "co-interior"
    ? "Co-interior angles on parallel lines are supplementary."
    : `${relationship[0].toUpperCase() + relationship.slice(1)} angles on parallel lines are equal.`;

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "parallel-lines",
    marks: 2,
    prompt: "Find the value of x. Give a reason for your answer.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "parallel",
        relationship,
        knownAngle: angle,
        missingLabel: "x"
      }
    },
    answer: `${answer}°`,
    working: relationship === "co-interior"
      ? [
          reason,
          `x = 180° − ${angle}°`,
          `x = ${answer}°`
        ]
      : [
          reason,
          `x = ${answer}°`
        ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "parallel lines", relationship]
  });
}

function protractorQuestion() {
  const friendlyAngles = [
    10, 15, 20, 25, 30, 35, 40, 45,
    50, 55, 60, 65, 70, 75, 80, 85,
    90, 95, 100, 105, 110, 115, 120,
    125, 130, 135, 140, 145, 150, 155,
    160, 165, 170
  ];

  const angle = choice(friendlyAngles);
  const startSide = Math.random() < 0.5 ? "right" : "left";

  return createQuestion({
    id: randomId(),
    topic: TOPIC,
    level: "mixed",
    type: "protractor",
    marks: 1,
    prompt: "Read the size of the angle shown on the protractor.",
    diagram: {
      engine: "angle-engine",
      config: {
        diagramType: "protractor",
        angle,
        startSide
      }
    },
    answer: `${angle}°`,
    working: [
      `The angle shown is ${angle}° using the correct protractor scale.`
    ],
    space: SPACE_SIZES.SMALL,
    tags: ["angles", "protractor"]
  });
}

const GENERATORS = {
  "straight-line": straightLineQuestion,
  "right-angle": rightAngleQuestion,
  "around-point": aroundPointQuestion,
  "vertically-opposite": verticallyOppositeQuestion,
  "parallel-lines": parallelLinesQuestion,
  "protractor": protractorQuestion
};

export function getAngleQuestionTypes() {
  return TYPE_LIST;
}

export function generateAngleQuestions({
  count = 6,
  allowedTypes = null
} = {}) {
  const typeIds = allowedTypes?.length
    ? allowedTypes
    : TYPE_LIST.map(t => t.id);

  const plan = makeBalancedPlan(typeIds, count);
  const questions = [];

  let safety = 0;

  while (questions.length < count && safety < count * 30) {
    const type = plan[questions.length % plan.length];
    const generator = GENERATORS[type];

    if (generator) {
      questions.push(generator());
    }

    safety += 1;
  }

  return questions;
}
