/*
  Mills Maths Tools — Angle Relationships: the rest of MA4-ANG-C-01
  ------------------------------------------------------------------
  question-banks/angles/extra-types.js

  The original Angle Relationships bank (index.js) finds unknown angles on a
  line, at a point, vertically opposite and on parallel lines. The syllabus
  also asks students to:

    - name angles with three letters and use the conventions of a diagram
    - classify angles (acute, right, obtuse, straight, reflex, revolution)
    - work with complementary and supplementary angles, and reflex angles
    - NAME the angle pair on a transversal (corresponding, alternate,
      co-interior, vertically opposite)
    - decide whether two lines are parallel from the angles, with a reason
    - chain two or more relationships, giving a reason for each step

  Those types live here and are appended to the bank's registry by index.js.
  Figures come from engines/geometry/geometry-engine.js, built from the
  angles, so tools/stage4-angles.mjs can re-measure them.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion
} from "../_shared/bank-helpers.js";

const TOPIC = "Angle Relationships";
const q = spec => makeQuestion(TOPIC, spec);
const figure = (config, notToScale = false) => ({ engine: "geometry-engine", config, ...(notToScale ? { notToScale: true } : {}) });
const RAD = Math.PI / 180;
const deg = n => `${n}°`;

export const EXTRA_ANGLE_TYPES = [
  { id: "naming-angles", label: "Name angles using three letters" },
  { id: "classify-angles", label: "Classify angles (acute to revolution)" },
  { id: "complementary-supplementary", label: "Complementary and supplementary angles" },
  { id: "reflex-angles", label: "Reflex angles" },
  { id: "name-angle-pairs", label: "Name the angle pair on parallel lines" },
  { id: "are-lines-parallel", label: "Are the lines parallel? (with reasons)" },
  { id: "multi-step-parallel", label: "Multi-step parallel-line problems (with reasons)" }
];

/* Two rays from a vertex V at the given screen headings (degrees, measured
   anticlockwise from east as a student sees it). */
function rayPoint(V, headingDeg, len) {
  return [Math.round((V[0] + len * Math.cos(headingDeg * RAD)) * 10) / 10, Math.round((V[1] - len * Math.sin(headingDeg * RAD)) * 10) / 10];
}

function namingAnglesQuestion() {
  const letters = choice([["A", "B", "C"], ["P", "Q", "R"], ["X", "Y", "Z"], ["L", "M", "N"]]);
  const [P1, V, P2] = letters;
  const start = randInt(0, 60);
  const size = randInt(35, 150);
  const Vp = [0, 0];
  const points = { [V]: Vp, [P1]: rayPoint(Vp, start, 170), [P2]: rayPoint(Vp, start + size, 170) };
  const variant = choice(["name", "vertex", "arms"]);
  const cfg = {
    points, centre: [points[P1][0] / 2 + points[P2][0] / 2, points[P1][1] / 2 + points[P2][1] / 2],
    segments: [{ from: V, to: P1 }, { from: V, to: P2 }],
    angles: [{ at: V, from: P1, to: P2, label: false }],
    dots: [P1, P2]
  };
  if (variant === "name") {
    return q({
      type: "naming-angles", marks: 1,
      prompt: "Name the marked angle using three letters.",
      diagram: figure(cfg),
      answer: `∠${P1}${V}${P2}`,
      working: [`The vertex ${V} goes in the middle: ∠${P1}${V}${P2} (or ∠${P2}${V}${P1}).`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`∠${V}${P1}${P2}`, `∠${P1}${P2}${V}`, `∠${V}${P2}${P1}`],
      tags: ["angles", "naming"]
    });
  }
  if (variant === "vertex") {
    return q({
      type: "naming-angles", marks: 1,
      prompt: `Which point is the vertex of ∠${P2}${V}${P1}?`,
      diagram: figure(cfg),
      answer: V,
      working: ["The vertex is the middle letter of the angle's name.", V],
      space: SPACE_SIZES.SMALL,
      // A lettered answer among lettered options (A. C, B. A…) reads badly.
      mcEligible: false,
      mcDistractors: [P1, P2, `${P1}${V}`],
      tags: ["angles", "naming"]
    });
  }
  return q({
    type: "naming-angles", marks: 1,
    prompt: `Name the two arms of ∠${P1}${V}${P2}.`,
    diagram: figure(cfg),
    answer: `${V}${P1} and ${V}${P2}`,
    working: ["The arms are the two intervals that meet at the vertex.", `${V}${P1} and ${V}${P2}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${P1}${P2} and ${V}${P1}`, `${P1}${P2} and ${V}${P2}`, `${V} and ${P1}`],
    tags: ["angles", "naming"]
  });
}

const ANGLE_TYPES = ["Acute", "Right", "Obtuse", "Straight", "Reflex", "Revolution"];

function typeOf(a) {
  return a < 90 ? "Acute" : a === 90 ? "Right" : a < 180 ? "Obtuse" : a === 180 ? "Straight" : a < 360 ? "Reflex" : "Revolution";
}

function classifyAnglesQuestion() {
  const kind = choice(["Acute", "Right", "Obtuse", "Straight", "Reflex", "Reflex", "Revolution"]);
  const a = kind === "Acute" ? randInt(15, 85) : kind === "Right" ? 90 : kind === "Obtuse" ? randInt(95, 175) : kind === "Straight" ? 180 : kind === "Reflex" ? randInt(185, 350) : 360;
  if (Math.random() < 0.5 || kind === "Revolution") {
    return q({
      type: "classify-angles", marks: 1,
      prompt: `What type of angle measures ${a}°?`,
      answer: kind,
      working: [{ Acute: "Between 0° and 90°.", Right: "Exactly 90°.", Obtuse: "Between 90° and 180°.", Straight: "Exactly 180°.", Reflex: "Between 180° and 360°.", Revolution: "Exactly 360°: one full turn." }[kind], kind],
      space: SPACE_SIZES.SMALL,
      mcDistractors: ANGLE_TYPES.filter(t => t !== kind),
      tags: ["angles", "classify"]
    });
  }
  const V = [0, 0];
  const start = randInt(0, 40);
  const points = { O: V, A: rayPoint(V, start, 160), B: rayPoint(V, start + a, 160) };
  return q({
    type: "classify-angles", marks: 1,
    prompt: "Classify the marked angle.",
    diagram: figure({
      points, vertexLabels: false,
      segments: [{ from: "O", to: "A" }, { from: "O", to: "B" }],
      angles: [{ at: "O", from: "A", to: "B", right: a === 90, reflex: a > 180, label: false }]
    }),
    answer: kind,
    working: [`The marked angle is ${kind.toLowerCase()}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ANGLE_TYPES.filter(t => t !== kind),
    tags: ["angles", "classify", "diagram"]
  });
}

function complementarySupplementaryQuestion() {
  const variant = choice(["complement", "supplement", "diagram-comp", "diagram-supp", "check"]);
  if (variant === "complement" || variant === "supplement") {
    const whole = variant === "complement" ? 90 : 180;
    const a = randInt(5, whole - 5);
    return q({
      type: "complementary-supplementary", marks: 1,
      prompt: `Find the ${variant} of ${a}°.`,
      answer: deg(whole - a),
      working: [`${variant === "complement" ? "Complementary" : "Supplementary"} angles add to ${whole}°.`, `${whole}° − ${a}° = ${whole - a}°`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [deg((variant === "complement" ? 180 : 90) - a > 0 ? (variant === "complement" ? 180 : 90) - a : a + 90), deg(360 - a), deg(a)],
      tags: ["angles", variant]
    });
  }
  if (variant === "check") {
    const comp = Math.random() < 0.5;
    const a = randInt(10, comp ? 80 : 170);
    const exact = Math.random() < 0.5;
    const b = exact ? (comp ? 90 : 180) - a : (comp ? 90 : 180) - a + choice([-10, -5, 5, 10]);
    if (b <= 0) return complementarySupplementaryQuestion();
    return q({
      type: "complementary-supplementary", marks: 1,
      prompt: `Are angles of ${a}° and ${b}° ${comp ? "complementary" : "supplementary"}? Explain.`,
      answer: exact ? `Yes: ${a}° + ${b}° = ${a + b}°.` : `No: ${a}° + ${b}° = ${a + b}°, not ${comp ? 90 : 180}°.`,
      working: [`${comp ? "Complementary" : "Supplementary"} angles add to ${comp ? 90 : 180}°.`, `${a} + ${b} = ${a + b}`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["angles", comp ? "complement" : "supplement", "reasoning"]
    });
  }
  const comp = variant === "diagram-comp";
  const a = comp ? randInt(20, 70) : randInt(25, 155);
  const whole = comp ? 90 : 180;
  const V = [0, 0];
  const points = comp
    ? { O: V, A: rayPoint(V, 0, 170), B: rayPoint(V, a, 170), C: rayPoint(V, 90, 170) }
    : { O: V, A: rayPoint(V, 0, 170), B: rayPoint(V, a, 170), C: rayPoint(V, 180, 170) };
  const x = choice(["x", "y", "p"]);
  return q({
    type: "complementary-supplementary", marks: 1,
    prompt: `Find the value of ${x}.`,
    diagram: figure({
      points, vertexLabels: false,
      segments: [{ from: "O", to: "A" }, { from: "O", to: "B" }, { from: "O", to: "C" }],
      angles: [
        { at: "O", from: "A", to: "B", label: deg(a) },
        { at: "O", from: "B", to: "C", label: x },
        ...(comp ? [{ at: "O", from: "A", to: "C", right: true, radius: 14, label: false }] : [])
      ]
    }),
    answer: deg(whole - a),
    working: [comp ? "The two angles make a right angle, so they are complementary." : "The two angles make a straight angle, so they are supplementary.", `${x} = ${whole}° − ${a}° = ${whole - a}°`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [deg((comp ? 180 : 90) - a > 0 ? (comp ? 180 : 90) - a : 360 - a), deg(360 - a), deg(a)],
    tags: ["angles", comp ? "complement" : "supplement", "diagram"]
  });
}

function reflexAnglesQuestion() {
  const a = randInt(25, 160);
  const V = [0, 0];
  const start = randInt(0, 50);
  const points = { O: V, A: rayPoint(V, start, 160), B: rayPoint(V, start + a, 160) };
  const findReflex = Math.random() < 0.6;
  const x = choice(["x", "r", "k"]);
  return q({
    type: "reflex-angles", marks: 1,
    prompt: `Find the value of ${x}.`,
    diagram: figure({
      points, vertexLabels: false,
      segments: [{ from: "O", to: "A" }, { from: "O", to: "B" }],
      angles: findReflex
        ? [{ at: "O", from: "A", to: "B", label: deg(a) }, { at: "O", from: "A", to: "B", reflex: true, label: x, radius: 34 }]
        : [{ at: "O", from: "A", to: "B", label: x }, { at: "O", from: "A", to: "B", reflex: true, label: deg(360 - a), radius: 34 }]
    }),
    answer: findReflex ? deg(360 - a) : deg(a),
    working: ["The two angles make a full revolution: they add to 360°.", findReflex ? `${x} = 360° − ${a}° = ${360 - a}°` : `${x} = 360° − ${360 - a}° = ${a}°`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: findReflex ? [deg(180 - a > 0 ? 180 - a : a - 90), deg(180 + a), deg(a)] : [deg(360 - a), deg(Math.abs(180 - a) || 90), deg(a + 90)],
    tags: ["angles", "reflex"]
  });
}

/*
  A transversal crossing two lines. Top line through E is horizontal; the
  bottom line through F is turned by `tilt` degrees (0 = parallel). The
  transversal runs from F up to E at `theta` degrees above the horizontal.
  Sector sizes at each intersection follow from those two numbers, which is
  what lets the "are they parallel?" questions be drawn honestly.
*/
function transversal(theta, tilt = 0) {
  const H = 150;
  const E = [0, 0];
  const F = [-H / Math.tan(theta * RAD), H];
  const L = 170;
  const pts = {
    E, F,
    A: [E[0] - L, 0], B: [E[0] + L, 0],
    C: rayPoint(F, 180 + tilt, L), D: rayPoint(F, tilt, L),
    P: rayPoint(E, theta, 70), Q: rayPoint(F, 180 + theta, 70)
  };
  // Sector → [from, to] rays, and size, at each intersection.
  const at = {
    E: { upperRight: ["B", "P", theta], upperLeft: ["P", "A", 180 - theta], lowerLeft: ["A", "F", theta], lowerRight: ["F", "B", 180 - theta] },
    F: { upperRight: ["D", "E", theta - tilt], upperLeft: ["E", "C", 180 - theta + tilt], lowerLeft: ["C", "Q", theta - tilt], lowerRight: ["Q", "D", 180 - theta + tilt] }
  };
  return { pts, at };
}

const PAIRS = [
  { name: "Corresponding", a: ["E", "upperRight"], b: ["F", "upperRight"] },
  { name: "Corresponding", a: ["E", "lowerLeft"], b: ["F", "lowerLeft"] },
  { name: "Corresponding", a: ["E", "upperLeft"], b: ["F", "upperLeft"] },
  { name: "Corresponding", a: ["E", "lowerRight"], b: ["F", "lowerRight"] },
  { name: "Alternate", a: ["E", "lowerLeft"], b: ["F", "upperRight"] },
  { name: "Alternate", a: ["E", "lowerRight"], b: ["F", "upperLeft"] },
  { name: "Co-interior", a: ["E", "lowerLeft"], b: ["F", "upperLeft"] },
  { name: "Co-interior", a: ["E", "lowerRight"], b: ["F", "upperRight"] },
  { name: "Vertically opposite", a: ["E", "upperRight"], b: ["E", "lowerLeft"] },
  { name: "Vertically opposite", a: ["F", "upperLeft"], b: ["F", "lowerRight"] }
];

function arc(T, [point, sector], label, extra = {}) {
  const [from, to] = T.at[point][sector];
  return { at: point, from, to, label, ...extra };
}

function transversalFigure(T, angles, { parallel = true } = {}) {
  return {
    points: T.pts,
    vertexLabels: false,
    lines: [{ from: "A", to: "B", extend: 0, arrows: false }, { from: "C", to: "D", extend: 0, arrows: false }, { from: "Q", to: "P", extend: 0, arrows: false }],
    parallel: parallel ? [{ from: "A", to: "B", at: 0.82 }, { from: "C", to: "D", at: 0.82 }] : [],
    angles
  };
}

function nameAnglePairsQuestion() {
  const pair = choice(PAIRS);
  const theta = choice([50, 55, 60, 65, 70, 115, 120, 125, 130]);
  const T = transversal(theta);
  const [l1, l2] = shuffle(["a", "b"]);
  return q({
    type: "name-angle-pairs", marks: 1,
    prompt: "Name the type of angle pair formed by the angles marked a and b.",
    diagram: figure(transversalFigure(T, [arc(T, pair.a, l1), arc(T, pair.b, l2, { arcs: 2 })])),
    answer: pair.name,
    working: [{
      Corresponding: "They are in matching positions at each intersection (an F shape).",
      Alternate: "They are on opposite sides of the transversal, between the parallel lines (a Z shape).",
      "Co-interior": "They are on the same side of the transversal, between the parallel lines (a C shape).",
      "Vertically opposite": "They are opposite each other where two lines cross."
    }[pair.name], pair.name],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["Corresponding", "Alternate", "Co-interior", "Vertically opposite"].filter(n => n !== pair.name),
    tags: ["angles", "parallel lines", "naming pairs"]
  });
}

function areLinesParallelQuestion() {
  const theta = randInt(48, 76);
  const parallel = Math.random() < 0.5;
  const tilt = parallel ? 0 : choice([-7, -5, -4, 4, 5, 7]);
  const T = transversal(theta, tilt);
  const pair = choice(PAIRS.filter(p => p.name !== "Vertically opposite"));
  const va = T.at[pair.a[0]][pair.a[1]][2];
  const vb = T.at[pair.b[0]][pair.b[1]][2];
  const holds = pair.name === "Co-interior" ? va + vb === 180 : va === vb;
  const reasonWord = pair.name === "Co-interior" ? `co-interior angles are ${holds ? "" : "not "}supplementary (${va}° + ${vb}° = ${va + vb}°)` : `${pair.name.toLowerCase()} angles are ${holds ? "" : "not "}equal (${va}° and ${vb}°)`;
  return q({
    type: "are-lines-parallel", marks: 2,
    prompt: "Is AB parallel to CD? Give a reason for your answer.",
    diagram: figure({ ...transversalFigure(T, [arc(T, pair.a, deg(va)), arc(T, pair.b, deg(vb), { arcs: 2 })], { parallel: false }), vertexLabels: { E: false, F: false, P: false, Q: false } }, true),
    answer: holds ? `Yes: ${reasonWord}, so AB ∥ CD.` : `No: ${reasonWord}, so AB is not parallel to CD.`,
    working: [`The marked angles are ${pair.name.toLowerCase()} angles.`, holds ? `Because ${reasonWord}, the lines are parallel.` : `Because ${reasonWord}, the lines are not parallel.`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["angles", "parallel lines", "reasoning"]
  });
}

/* Two-step chains: known angle at E, unknown at F, with the linking step. */
function multiStepParallelQuestion() {
  const theta = choice([50, 55, 62, 65, 68, 72, 75, 110, 115, 118, 125]);
  const T = transversal(theta);
  const sectors = ["upperRight", "upperLeft", "lowerLeft", "lowerRight"];
  const opposite = { upperRight: "lowerLeft", lowerLeft: "upperRight", upperLeft: "lowerRight", lowerRight: "upperLeft" };
  const direct = new Set(PAIRS.filter(p => p.a[0] === "E" && p.b[0] === "F").map(p => `${p.a[1]}>${p.b[1]}`));
  // A known sector at E whose partner at F is not directly paired with it.
  let known; let target;
  // …but whose vertically opposite angle IS directly paired with the target.
  do { known = choice(sectors); target = choice(sectors); }
  while (direct.has(`${known}>${target}`) || !direct.has(`${opposite[known]}>${target}`));
  const step = opposite[known];                        // vertically opposite at E
  const link = PAIRS.find(p => p.a[0] === "E" && p.b[0] === "F" && p.a[1] === step && p.b[1] === target);
  const kv = T.at.E[known][2];
  const tv = T.at.F[target][2];
  const sv = T.at.E[step][2];
  const reason1 = `The angle vertically opposite the ${kv}° angle is also ${sv}° (vertically opposite angles are equal).`;
  const linkName = link.name;
  const reason2 = linkName === "Co-interior"
    ? `x = 180° − ${sv}° = ${tv}° (co-interior angles, AB ∥ CD)`
    : `x = ${tv}° (${linkName.toLowerCase()} angles, AB ∥ CD)`;
  return q({
    type: "multi-step-parallel", marks: 3,
    prompt: "AB ∥ CD. Find the value of x, giving a reason for each step.",
    diagram: figure({ ...transversalFigure(T, [arc(T, ["E", known], deg(kv)), arc(T, ["F", target], "x")]), vertexLabels: { E: false, F: false, P: false, Q: false } }),
    answer: deg(tv),
    working: [reason1, reason2].filter(Boolean),
    space: SPACE_SIZES.LARGE,
    tags: ["angles", "parallel lines", "multi-step", "reasons"]
  });
}

void sample;

export const EXTRA_ANGLE_GENERATORS = {
  "naming-angles": namingAnglesQuestion,
  "classify-angles": classifyAnglesQuestion,
  "complementary-supplementary": complementarySupplementaryQuestion,
  "reflex-angles": reflexAnglesQuestion,
  "name-angle-pairs": nameAnglePairsQuestion,
  "are-lines-parallel": areLinesParallelQuestion,
  "multi-step-parallel": multiStepParallelQuestion
};
