/*
  Mills Maths Tools — Pythagoras' theorem: identifying the hypotenuse
  --------------------------------------------------------------------
  question-banks/pythagoras/extra-types.js

  MA4-PYT-C-01 begins with recognising the hypotenuse as the side opposite
  the right angle (and the longest side), and with stating the theorem for a
  labelled triangle. The original bank goes straight to calculation; this
  type covers the first step. Appended to the registry by index.js.
*/

import { SPACE_SIZES, choice, shuffle, makeQuestion } from "../_shared/bank-helpers.js";
import { fitPoints, nameVertices, triangleFromAngles, TRIANGLE_LETTERS } from "../_shared/figure-helpers.js";

const TOPIC = "Pythagoras Theorem";
const q = spec => makeQuestion(TOPIC, spec);

export const EXTRA_PYTHAGORAS_TYPES = [
  { id: "identify-hypotenuse", label: "Identify the hypotenuse and state the theorem" }
];

function rightTriangle(letters) {
  const a = choice([30, 35, 40, 50, 55, 60]);
  // Right angle at the THIRD vertex; rotate so it is not always bottom-left.
  const raw = triangleFromAngles(a, 90 - a, 10);
  return fitPoints(nameVertices(raw, letters), { size: 260, maxH: 190, rotateBy: choice([0, 30, 90, 150, 200, 250]) });
}

function identifyHypotenuseQuestion() {
  const letters = choice(TRIANGLE_LETTERS);
  const [A, B, C] = letters;            // right angle at C, so AB is the hypotenuse
  const points = rightTriangle(letters);
  const variant = choice(["name", "name", "theorem", "lengths"]);
  const base = {
    points,
    polygons: [{ pts: letters }],
    angles: [{ at: C, from: A, to: B, right: true, label: false }]
  };
  if (variant === "name") {
    return q({
      type: "identify-hypotenuse", marks: 1,
      prompt: `Name the hypotenuse of △${letters.join("")}.`,
      diagram: { engine: "geometry-engine", config: base },
      answer: `${A}${B}`,
      working: [`The hypotenuse is opposite the right angle at ${C}.`, `${A}${B}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${A}${C}`, `${B}${C}`, `∠${A}${C}${B}`],
      tags: ["pythagoras", "hypotenuse"]
    });
  }
  if (variant === "theorem") {
    const [p, r, s] = shuffle(["a", "b", "c", "p", "q", "r", "x", "y", "z", "m", "n", "k"]).slice(0, 3);
    const cfg = { ...base, sideLabels: [{ from: A, to: B, text: p }, { from: B, to: C, text: r }, { from: C, to: A, text: s }] };
    return q({
      type: "identify-hypotenuse", marks: 1,
      prompt: "Write Pythagoras' theorem for this triangle using the side labels shown.",
      diagram: { engine: "geometry-engine", config: cfg },
      answer: `${p}² = ${r}² + ${s}²`,
      working: [`${p} is opposite the right angle, so it is the hypotenuse.`, `${p}² = ${r}² + ${s}²`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${r}² = ${p}² + ${s}²`, `${s}² = ${p}² + ${r}²`, `${p} = ${r} + ${s}`],
      tags: ["pythagoras", "hypotenuse", "theorem"]
    });
  }
  const triple = choice([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [9, 12, 15]]);
  const unit = choice(["cm", "m", "mm"]);
  const shown = shuffle(triple);
  return q({
    type: "identify-hypotenuse", marks: 1,
    prompt: `A right-angled triangle has sides of ${shown[0]} ${unit}, ${shown[1]} ${unit} and ${shown[2]} ${unit}. Which length is the hypotenuse?`,
    answer: `${triple[2]} ${unit}`,
    working: ["The hypotenuse is always the longest side of a right-angled triangle.", `${triple[2]} ${unit}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${triple[0]} ${unit}`, `${triple[1]} ${unit}`, `${triple[0] + triple[1]} ${unit}`],
    tags: ["pythagoras", "hypotenuse"]
  });
}

export const EXTRA_PYTHAGORAS_GENERATORS = {
  "identify-hypotenuse": identifyHypotenuseQuestion
};
