/*
  Mills Maths Tools — Stage 3 Geometric Measure: the visual types
  -----------------------------------------------------------------
  question-banks/stage-3/geometric-measure/extra-types.js

  The original bank classifies and estimates angles from a NUMBER ("What
  type of angle is 125°?") and discusses grid references in words. The
  syllabus asks students to recognise angles by eye, estimate them before
  measuring, construct them, and use a grid map. These types add the
  pictures:

    - classify a DRAWN angle (acute, right, obtuse, straight, reflex)
    - choose the best estimate for a drawn angle (by benchmarking to 90°)
    - construct an angle with a protractor on a given arm
    - read and give grid references on a map (letters and numbers label the
      SPACES, which is the point the syllabus makes about grid maps)

  Angles are drawn by engines/geometry/geometry-engine.js; maps by
  engines/grid/grid-engine.js.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion
} from "../../_shared/bank-helpers.js";

const TOPIC = "Geometric Measure";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const RAD = Math.PI / 180;
const geo = config => ({ engine: "geometry-engine", config });

export const EXTRA_GM_TYPES = [
  { id: "classify-angle-diagram", label: "Classify a drawn angle" },
  { id: "estimate-angle-diagram", label: "Estimate the size of a drawn angle" },
  { id: "construct-angle", label: "Construct an angle with a protractor" },
  { id: "grid-map-read", label: "What is at this grid reference?" },
  { id: "grid-map-give", label: "Give the grid reference" }
];

function rayPoint(V, headingDeg, len) {
  return [Math.round((V[0] + len * Math.cos(headingDeg * RAD)) * 10) / 10, Math.round((V[1] - len * Math.sin(headingDeg * RAD)) * 10) / 10];
}

export function angleFigure(a, { start = randInt(0, 30), label = false } = {}) {
  const V = [150, 150];
  const points = { O: V, A: rayPoint(V, start, 130), B: rayPoint(V, start + a, 130) };
  return geo({
    points, vertexLabels: false,
    segments: [{ from: "O", to: "A" }, { from: "O", to: "B" }],
    angles: [{ at: "O", from: "A", to: "B", right: a === 90, reflex: a > 180, label }],
    // carry the true size for the harness (ignored by the engine)
    trueAngle: a
  });
}

const KINDS = [
  { name: "Acute", pick: () => randInt(3, 17) * 5 },
  { name: "Right", pick: () => 90 },
  { name: "Obtuse", pick: () => randInt(19, 35) * 5 },
  { name: "Straight", pick: () => 180 },
  { name: "Reflex", pick: () => randInt(38, 68) * 5 }
];

function classifyAngleDiagramQuestion() {
  const k = choice(KINDS);
  const a = k.pick();
  return q({
    type: "classify-angle-diagram", marks: 1,
    prompt: "What type of angle is marked?",
    diagram: angleFigure(a),
    answer: k.name,
    working: [{
      Acute: "It is smaller than a right angle (less than 90°).",
      Right: "The square corner shows exactly 90°.",
      Obtuse: "It is bigger than a right angle but less than a straight line.",
      Straight: "The arms make a straight line: 180°.",
      Reflex: "It is more than a straight line (between 180° and 360°)."
    }[k.name]],
    space: SPACE_SIZES.SMALL,
    mcDistractors: KINDS.map(x => x.name).filter(x => x !== k.name),
    tags: ["angles", "classifying", "diagram"]
  });
}

function estimateAngleDiagramQuestion() {
  const a = choice([20, 30, 45, 60, 75, 110, 120, 135, 150, 160, 210, 240, 270, 300]);
  const options = [a];
  const pool = [15, 20, 30, 45, 60, 75, 90, 110, 120, 135, 150, 160, 180, 210, 240, 270, 300, 330].filter(x => Math.abs(x - a) >= 40);
  const wrongSide = pool.filter(x => (x < 90) !== (a < 90) || (x > 180) !== (a > 180));
  options.push(...sample(wrongSide.length >= 3 ? wrongSide : pool, 3));
  const opts = shuffle(options);
  return q({
    type: "estimate-angle-diagram", marks: 1,
    prompt: `Without measuring, which is the best estimate of the marked angle: ${opts.map(x => `${x}°`).join(", ")}?`,
    diagram: angleFigure(a),
    answer: `${a}°`,
    working: [a < 90 ? "It is smaller than a right angle." : a < 180 ? "It is between a right angle and a straight line." : "It is more than a straight line.", `${a}° is the only choice that fits.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: opts.filter(x => x !== a).map(x => `${x}°`),
    tags: ["angles", "estimation", "diagram"]
  });
}

function constructAngleQuestion() {
  const a = choice([randInt(3, 17) * 5, randInt(19, 35) * 5]);
  const V = [60, 180];
  const points = { O: V, A: [300, 180] };
  return q({
    type: "construct-angle", marks: 1,
    prompt: `Use a protractor to draw an angle of ${a}° at O, using OA as one arm.`,
    // Two invisible (non-breaking space) texts reserve room above the arm to
    // draw in: the renderer trims every diagram to its ink, so empty space
    // has to be "inked" to survive.
    diagram: geo({ points, segments: [{ from: "O", to: "A" }], vertexLabels: true, dots: ["O"], texts: [{ x: 300, y: 10, text: "\u00a0" }, { x: 20, y: 200, text: "\u00a0" }] }),
    answer: `An angle of ${a}° drawn at O (accept ±2°)`,
    working: ["Put the centre of the protractor on O and the zero line along OA.", `Count round from 0° to ${a}° on the scale that starts at OA, mark a point, and rule the second arm from O through it.`],
    space: "none",
    mcEligible: false,
    tags: ["angles", "construct"]
  });
}

/* ── grid maps ───────────────────────────────────────────── */

const PLACES = [
  { kind: "house", label: "Home" }, { kind: "school", label: "School" }, { kind: "shop", label: "Shop" },
  { kind: "park", label: "Park" }, { kind: "pool", label: "Pool" }, { kind: "tree", label: "Forest" },
  { kind: "tent", label: "Camp" }, { kind: "flag", label: "Lookout" }, { kind: "star", label: "Museum" }
];

export function makeMap() {
  const cols = choice([6, 7, 8]);
  const rows = choice([5, 6]);
  const places = sample(PLACES, 5);
  const used = new Set();
  const icons = places.map(p => {
    let c; let r;
    do { c = randInt(0, cols - 1); r = randInt(0, rows - 1); } while (used.has(`${c},${r}`));
    used.add(`${c},${r}`);
    return { col: c, row: r, kind: p.kind, label: p.label };
  });
  return { cols, rows, icons };
}

export const ref = ic => `${String.fromCharCode(65 + ic.col)}${ic.row + 1}`;

function gridMapReadQuestion() {
  const m = makeMap();
  const target = choice(m.icons);
  return q({
    type: "grid-map-read", marks: 1,
    prompt: `What is in the square ${ref(target)} on the map?`,
    diagram: { engine: "grid-engine", config: { cols: m.cols, rows: m.rows, map: true, icons: m.icons } },
    answer: `The ${target.label.toLowerCase()}`,
    working: [`Go across to column ${ref(target)[0]}, then down to row ${target.row + 1}. The square there holds the ${target.label.toLowerCase()}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: m.icons.filter(i => i !== target).map(i => `The ${i.label.toLowerCase()}`),
    tags: ["position", "grid map"]
  });
}

function gridMapGiveQuestion() {
  const m = makeMap();
  const target = choice(m.icons);
  const flipped = `${target.row + 1}${String.fromCharCode(65 + target.col)}`;
  return q({
    type: "grid-map-give", marks: 1,
    prompt: `Give the grid reference of the ${target.label.toLowerCase()}.`,
    diagram: { engine: "grid-engine", config: { cols: m.cols, rows: m.rows, map: true, icons: m.icons } },
    answer: ref(target),
    working: ["Letter first (the column), then number (the row).", `The ${target.label.toLowerCase()} is in column ${ref(target)[0]}, row ${target.row + 1}: ${ref(target)}.`, "A grid reference names a whole square (an area), not a point."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [flipped, `${String.fromCharCode(65 + Math.min(m.cols - 1, target.col + 1))}${target.row + 1}`, `${String.fromCharCode(65 + target.col)}${target.row + 2 <= m.rows ? target.row + 2 : target.row}`, `${String.fromCharCode(65 + target.row)}${target.col + 1}`],
    tags: ["position", "grid map"]
  });
}

export const EXTRA_GM_GENERATORS = {
  "classify-angle-diagram": classifyAngleDiagramQuestion,
  "estimate-angle-diagram": estimateAngleDiagramQuestion,
  "construct-angle": constructAngleQuestion,
  "grid-map-read": gridMapReadQuestion,
  "grid-map-give": gridMapGiveQuestion
};
