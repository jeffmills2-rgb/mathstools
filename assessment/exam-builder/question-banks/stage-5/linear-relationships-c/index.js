/*
  Mills Maths Tools — Stage 5 Question Bank: Linear Relationships C
  ------------------------------------------------------------------
  question-banks/stage-5/linear-relationships-c/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-LIN-P-01 (Path):
    "describes and applies transformations, the midpoint, gradient/slope and
     distance formulas, and equations of lines to solve problems"

  Content:
    - the midpoint, gradient and distance formulas, including finding an
      unknown coordinate from a given gradient or distance
    - point–gradient form y − y₁ = m(x − x₁) and general form
      ax + by + c = 0, converting between forms
    - coordinate geometry problems: collinear points, the perpendicular
      bisector, proving a triangle right-angled or isosceles, proving a
      quadrilateral is a parallelogram
    - line and rotational symmetry
    - translations, reflections in an axis and rotations through multiples
      of 90° on the Cartesian plane, using coordinates

  Transformation diagrams draw the shape and its image on the plane engine
  from the same vertex lists.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, gcd
} from "../../_shared/bank-helpers.js";
import { num, MINUS, rat, mono, joinTerms, Q, surdParts, surdText } from "../../_shared/algebra-helpers.js";

const TOPIC = "Linear Relationships C";

const TYPE_LIST = [
  { id: "point-gradient-form", label: "Point–gradient form" },
  { id: "general-form", label: "General form ax + by + c = 0" },
  { id: "two-points-general", label: "Line through two points in general form" },
  { id: "unknown-coordinate", label: "Find an unknown coordinate" },
  { id: "collinear-points", label: "Are the points collinear?" },
  { id: "perpendicular-bisector", label: "The perpendicular bisector of an interval" },
  { id: "triangle-proof", label: "Prove a triangle is right-angled or isosceles" },
  { id: "parallelogram-proof", label: "Prove a quadrilateral is a parallelogram" },
  { id: "rotational-symmetry", label: "Line and rotational symmetry" },
  { id: "translate-coordinates", label: "Translations with coordinates" },
  { id: "reflect-in-axis", label: "Reflections in the axes" },
  { id: "rotate-about-origin", label: "Rotations about the origin" },
  { id: "describe-transformation", label: "Describe the transformation" },
  { id: "multi-part-coordinate", label: "Multi-part coordinate geometry problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "coordinate geometry", ...(spec.tags || [])] });
const plane = config => ({ engine: "plane-engine", config });
const pt = (x, y) => `(${num(x)}, ${num(y)})`;
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };

/* Label each vertex outward from the centroid of its own shape. */
function awayPos(p, shape) {
  const cx = shape.reduce((s, v) => s + v[0], 0) / shape.length; const cy = shape.reduce((s, v) => s + v[1], 0) / shape.length;
  const dx = p[0] - cx; const dy = p[1] - cy;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;
  const dirs = ["e", "ne", "n", "nw", "w", "sw", "s", "se"];
  return dirs[((Math.round(ang / 45) % 8) + 8) % 8];
}
const vpts = (shape, names) => shape.map((p, i) => ({ x: p[0], y: p[1], label: names[i], labelPos: awayPos(p, shape) }));
function fitWindow(all) {
  const m = Math.max(4, ...all.flat().map(v => Math.abs(v))) + 2;
  const r = Math.ceil(m / 2) * 2;
  return { xMin: -r, xMax: r, yMin: -r, yMax: r };
}
const exact = d2 => { const p = surdParts(d2); return p.in === 1 ? String(p.out) : surdText(p.out, p.in); };

/* General form with a > 0 and integer coefficients: ax + by + c = 0. */
export function generalForm(a, b, c) {
  let [A, B, C] = [a, b, c];
  const g = gcd(gcd(Math.abs(A), Math.abs(B)), Math.abs(C)) || 1;
  A /= g; B /= g; C /= g;
  if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
  return `${joinTerms([mono(A, { x: 1 }), mono(B, { y: 1 }), num(C)])} = 0`;
}

function pointGradientFormQuestion() {
  const n = nz(-4, 4); const d = choice([1, 1, 2, 3]);
  if (gcd(Math.abs(n), d) !== 1) return pointGradientFormQuestion();
  const x1 = randInt(-5, 5); const y1 = randInt(-5, 5);
  // y − y1 = (n/d)(x − x1) → d y − d y1 = n x − n x1 → n x − d y + (d y1 − n x1) = 0
  const m = new Q(n, d);
  return q({
    type: "point-gradient-form", marks: 2,
    prompt: `Use the point–gradient formula to find the equation of the line through ${pt(x1, y1)} with gradient ${m.toString()}. Give your answer in general form.`,
    answer: generalForm(n, -d, d * y1 - n * x1),
    working: [`y − ${y1 < 0 ? `(${num(y1)})` : y1} = ${m.text()}(x − ${x1 < 0 ? `(${num(x1)})` : x1})`, d > 1 ? `Multiply by ${d} to clear the fraction.` : "Expand.", generalForm(n, -d, d * y1 - n * x1)],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [generalForm(n, -d, d * y1 + n * x1), generalForm(n, d, d * y1 - n * x1), generalForm(d, -n, n * y1 - d * x1)],
    tags: ["point-gradient form", "general form"]
  });
}

function generalFormQuestion() {
  const v = choice(["to-general", "gradient-of"]);
  if (v === "to-general") {
    const n = nz(-5, 5); const d = choice([1, 2, 3]); const c = nz(-8, 8);
    if (gcd(Math.abs(n), d) !== 1) return generalFormQuestion();
    const m = new Q(n, d);
    const eq = d === 1 ? `y = ${joinTerms([mono(n, { x: 1 }), num(c)])}` : `y = ${n < 0 ? MINUS : ""}${rat(Math.abs(n), d)}x ${c < 0 ? MINUS : "+"} ${Math.abs(c)}`;
    return q({ type: "general-form", marks: 2, prompt: `Write ${eq} in general form.`, answer: generalForm(n, -d, d * c), working: [d > 1 ? `Multiply by ${d}: ${d}y = ${joinTerms([mono(n, { x: 1 }), num(d * c)])}` : "", "Move every term to one side, with a positive x-coefficient.", generalForm(n, -d, d * c)].filter(Boolean), space: SPACE_SIZES.MEDIUM, mcDistractors: [generalForm(n, d, d * c), generalForm(n, -d, -d * c)], tags: ["general form"] });
  }
  const a = nz(-6, 6); const b = nz(-6, 6); const c = nz(-9, 9);
  const [A, B, C] = normGeneral(a, b, c);
  const m = new Q(-A, B); const k = new Q(-C, B);
  return q({ type: "general-form", marks: 2, prompt: `Find the gradient and y-intercept of the line ${generalForm(a, b, c)}.`, answer: `gradient ${m.toString()}, y-intercept ${k.toString()}`, working: [`${mono(B, { y: 1 })} = ${joinTerms([mono(-A, { x: 1 }), num(-C)])}`, `y = ${m.text()}x + ${k.text()}`.replace("+ -", "− ").replace("+ −", "− ")], space: SPACE_SIZES.MEDIUM, mcDistractors: [`gradient ${new Q(A, B).toString()}, y-intercept ${new Q(C, B).toString()}`, `gradient ${new Q(-B, A).toString()}, y-intercept ${k.toString()}`, `gradient ${m.toString()}, y-intercept ${new Q(C, B).toString()}`], tags: ["general form", "gradient"] });
}

function normGeneral(a, b, c) {
  let [A, B, C] = [a, b, c];
  const g = gcd(gcd(Math.abs(A), Math.abs(B)), Math.abs(C)) || 1;
  A /= g; B /= g; C /= g;
  if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
  return [A, B, C];
}

function twoPointsGeneralQuestion() {
  for (;;) {
    const x1 = randInt(-5, 5); const y1 = randInt(-5, 5); const x2 = randInt(-5, 5); const y2 = randInt(-5, 5);
    if (x1 === x2 || y1 === y2) continue;
    // (y2 − y1)(x − x1) − (x2 − x1)(y − y1) = 0
    const a = y2 - y1; const b = -(x2 - x1); const c = -(y2 - y1) * x1 + (x2 - x1) * y1;
    return q({
      type: "two-points-general", marks: 3,
      prompt: `Find the equation of the line through ${pt(x1, y1)} and ${pt(x2, y2)}, in general form.`,
      answer: generalForm(a, b, c),
      working: [`m = ${num(y2 - y1)}/${num(x2 - x1)} = ${new Q(y2 - y1, x2 - x1).text()}`, `y − ${y1 < 0 ? `(${num(y1)})` : y1} = ${new Q(y2 - y1, x2 - x1).text()}(x − ${x1 < 0 ? `(${num(x1)})` : x1})`, generalForm(a, b, c)],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [generalForm(b, a, c), generalForm(a, -b, c)],
      tags: ["general form", "two points"]
    });
  }
}

function unknownCoordinateQuestion() {
  const v = choice(["gradient", "distance", "midpoint"]);
  if (v === "gradient") {
    const x1 = randInt(-4, 4); const y1 = randInt(-4, 4); const run = nz(-4, 4); const m = nz(-3, 3);
    const k = y1 + m * run; const x2 = x1 + run;
    return q({ type: "unknown-coordinate", marks: 2, prompt: `The line through ${pt(x1, y1)} and (${num(x2)}, k) has gradient ${num(m)}. Find k.`, answer: `k = ${num(k)}`, working: [`(k − ${y1 < 0 ? `(${num(y1)})` : y1})/(${num(x2)} − ${x1 < 0 ? `(${num(x1)})` : x1}) = ${num(m)}`, `k − ${y1 < 0 ? `(${num(y1)})` : y1} = ${num(m * run)}`, `k = ${num(k)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`k = ${num(y1 - m * run)}`, `k = ${num(m * run)}`], tags: ["gradient", "unknown"] });
  }
  if (v === "distance") {
    const trip = choice([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]]);
    const x1 = randInt(-4, 4); const y1 = randInt(-4, 4);
    const x2 = x1 + trip[0];
    const k1 = y1 + trip[1]; const k2 = y1 - trip[1];
    return q({ type: "unknown-coordinate", marks: 3, prompt: `The distance between ${pt(x1, y1)} and (${num(x2)}, k) is ${trip[2]}. Find the possible values of k.`, answer: `k = ${num(k2)} or k = ${num(k1)}`, working: [`(${trip[0]})² + (k − ${y1 < 0 ? `(${num(y1)})` : y1})² = ${trip[2]}²`, `(k − ${y1 < 0 ? `(${num(y1)})` : y1})² = ${trip[1] ** 2}`, `k − ${y1 < 0 ? `(${num(y1)})` : y1} = ±${trip[1]}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`k = ${num(k1)}`, `k = ${num(y1 + trip[2])}`], tags: ["distance", "unknown"] });
  }
  const x1 = randInt(-6, 6); const y1 = randInt(-6, 6); const mx = randInt(-4, 4); const my = randInt(-4, 4);
  return q({ type: "unknown-coordinate", marks: 2, prompt: `M${pt(mx, my)} is the midpoint of the interval from ${pt(x1, y1)} to (a, b). Find a and b.`, answer: `a = ${num(2 * mx - x1)}, b = ${num(2 * my - y1)}`, working: [`(${num(x1)} + a)/2 = ${num(mx)} → a = ${num(2 * mx - x1)}`, `(${num(y1)} + b)/2 = ${num(my)} → b = ${num(2 * my - y1)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`a = ${num(mx - x1)}, b = ${num(my - y1)}`, `a = ${num((mx + x1) / 2)}, b = ${num((my + y1) / 2)}`], tags: ["midpoint", "unknown"] });
}

function collinearPointsQuestion() {
  const m = nz(-3, 3); const c = randInt(-4, 4);
  const xs = sample([-3, -2, -1, 0, 1, 2, 3, 4], 3).sort((a, b) => a - b);
  const on = Math.random() < 0.5;
  const P = xs.map((x, i) => [x, m * x + c + (!on && i === 2 ? choice([-1, 1]) : 0)]);
  const m1 = new Q(P[1][1] - P[0][1], P[1][0] - P[0][0]); const m2 = new Q(P[2][1] - P[1][1], P[2][0] - P[1][0]);
  return q({
    type: "collinear-points", marks: 2,
    prompt: `Are the points A${pt(...P[0])}, B${pt(...P[1])} and C${pt(...P[2])} collinear? Justify your answer.`,
    answer: on ? `Yes: m(AB) = m(BC) = ${m1.toString()}, and they share point B.` : `No: m(AB) = ${m1.toString()} but m(BC) = ${m2.toString()}.`,
    working: [`m(AB) = ${m1.text()}`, `m(BC) = ${m2.text()}`, on ? "Equal gradients through a common point: collinear." : "Different gradients: not collinear."],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["collinear", "gradient"]
  });
}

function perpendicularBisectorQuestion() {
  for (;;) {
    const x1 = randInt(-5, 5); const y1 = randInt(-5, 5); const x2 = x1 + 2 * nz(-3, 3); const y2 = y1 + 2 * nz(-3, 3);
    const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
    const m = new Q(y2 - y1, x2 - x1); const p = new Q(-m.d, m.n);
    // y − my = p(x − mx) → p.n x − p.d y + (p.d my − p.n mx) = 0
    return q({
      type: "perpendicular-bisector", marks: 3,
      prompt: `Find the equation of the perpendicular bisector of the interval joining ${pt(x1, y1)} and ${pt(x2, y2)}, in general form.`,
      answer: generalForm(p.n, -p.d, p.d * my - p.n * mx),
      working: [`Midpoint ${pt(mx, my)}`, `Gradient of the interval ${m.text()}; perpendicular gradient ${p.text()}`, `y − ${my < 0 ? `(${num(my)})` : my} = ${p.text()}(x − ${mx < 0 ? `(${num(mx)})` : mx})`, generalForm(p.n, -p.d, p.d * my - p.n * mx)],
      space: SPACE_SIZES.LARGE,
      mcEligible: false,
      tags: ["perpendicular bisector"]
    });
  }
}

function triangleProofQuestion() {
  const v = choice(["right", "isosceles"]);
  if (v === "right") {
    // A, B, C with AB ⟂ BC: B + (a, b) and B + (−kb, ka)
    const B = [randInt(-3, 2), randInt(-3, 2)]; const a = nz(-3, 3); const b = nz(-3, 3); const k = choice([1, 2]);
    const A = [B[0] + a, B[1] + b]; const C = [B[0] - k * b, B[1] + k * a];
    const mAB = new Q(A[1] - B[1], A[0] - B[0]); const mBC = new Q(C[1] - B[1], C[0] - B[0]);
    return q({
      type: "triangle-proof", marks: 3,
      prompt: `Show that the triangle with vertices A${pt(...A)}, B${pt(...B)} and C${pt(...C)} is right-angled at B.`,
      diagram: plane({ ...fitWindow([A, B, C]), segments: [{ from: A, to: B }, { from: B, to: C }, { from: C, to: A }], points: vpts([A, B, C], ["A", "B", "C"]) }),
      answer: `m(AB) = ${mAB.toString()}, m(BC) = ${mBC.toString()}, and their product is −1, so AB ⟂ BC: the angle at B is 90°.`,
      working: [`m(AB) = ${mAB.text()}`, `m(BC) = ${mBC.text()}`, `${mAB.text()} × ${mBC.text()} = ${mAB.mul(mBC).text()}`],
      space: SPACE_SIZES.LARGE,
      mcEligible: false,
      tags: ["proof", "perpendicular"]
    });
  }
  // isosceles: apex on the perpendicular bisector
  const a = nz(-4, 4); const b = randInt(2, 6);
  const P = [0, b]; const Q1 = [-a, 0]; const R = [a, 0];
  const shift = [randInt(-2, 2), randInt(-3, 1)];
  const [A, B, C] = [P, Q1, R].map(p => [p[0] + shift[0], p[1] + shift[1]]);
  const d2 = a * a + b * b;
  return q({
    type: "triangle-proof", marks: 3,
    prompt: `Show that the triangle with vertices A${pt(...A)}, B${pt(...B)} and C${pt(...C)} is isosceles.`,
    answer: `AB = AC = ${exact(d2)} (and BC = ${2 * Math.abs(a)}), so two sides are equal.`,
    working: [`AB² = ${(A[0] - B[0]) ** 2} + ${(A[1] - B[1]) ** 2} = ${d2}`, `AC² = ${(A[0] - C[0]) ** 2} + ${(A[1] - C[1]) ** 2} = ${d2}`, `AB = AC = √${d2}`],
    space: SPACE_SIZES.LARGE,
    mcEligible: false,
    tags: ["proof", "distance"]
  });
}

function parallelogramProofQuestion() {
  const A = [randInt(-5, -1), randInt(-5, -1)]; const u = [randInt(2, 5), randInt(-2, 2)]; const w = [randInt(-1, 2), randInt(2, 5)];
  if (u[0] * w[1] - u[1] * w[0] === 0) return parallelogramProofQuestion();
  const B = [A[0] + u[0], A[1] + u[1]]; const D = [A[0] + w[0], A[1] + w[1]]; const C = [B[0] + w[0], B[1] + w[1]];
  const mAB = new Q(u[1], u[0]); const mAD = w[0] === 0 ? null : new Q(w[1], w[0]);
  return q({
    type: "parallelogram-proof", marks: 3,
    prompt: `Prove that A${pt(...A)}, B${pt(...B)}, C${pt(...C)} and D${pt(...D)} are the vertices of a parallelogram.`,
    diagram: plane({ ...fitWindow([A, B, C, D]), segments: [{ from: A, to: B }, { from: B, to: C }, { from: C, to: D }, { from: D, to: A }], points: vpts([A, B, C, D], ["A", "B", "C", "D"]) }),
    answer: `Both pairs of opposite sides are parallel: m(AB) = m(DC) = ${mAB.toString()} and m(AD) = m(BC) = ${mAD ? mAD.toString() : "undefined (both vertical)"}. (Or: the diagonals AC and BD share the midpoint ${pt((A[0] + C[0]) / 2, (A[1] + C[1]) / 2).replace(/\.5/g, ".5")}.)`,
    working: [`m(AB) = ${mAB.text()}, m(DC) = ${mAB.text()}`, `m(AD) = ${mAD ? mAD.text() : "undefined"}, m(BC) = ${mAD ? mAD.text() : "undefined"}`],
    space: SPACE_SIZES.LARGE,
    mcEligible: false,
    tags: ["proof", "parallelogram"]
  });
}

const SYMS = [
  { s: "a square", lines: 4, rot: 4 }, { s: "a rectangle (not a square)", lines: 2, rot: 2 }, { s: "a rhombus (not a square)", lines: 2, rot: 2 },
  { s: "a parallelogram (not a rectangle or rhombus)", lines: 0, rot: 2 }, { s: "an equilateral triangle", lines: 3, rot: 3 }, { s: "an isosceles triangle", lines: 1, rot: 1 },
  { s: "a regular pentagon", lines: 5, rot: 5 }, { s: "a regular hexagon", lines: 6, rot: 6 }, { s: "a kite", lines: 1, rot: 1 },
  { s: "the letter S", lines: 0, rot: 2 }, { s: "the letter H", lines: 2, rot: 2 }, { s: "the letter A", lines: 1, rot: 1 }, { s: "the letter Z", lines: 0, rot: 2 }
];

function rotationalSymmetryQuestion() {
  const S = choice(SYMS);
  const ask = choice(["rot", "both"]);
  if (ask === "rot") return q({ type: "rotational-symmetry", marks: 1, prompt: `What is the order of rotational symmetry of ${S.s}?`, answer: String(S.rot), working: [`It looks the same ${S.rot} ${S.rot === 1 ? "time" : "times"} in one full turn${S.rot === 1 ? " (no rotational symmetry)" : ""}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(S.lines), String(S.rot + 1), String(S.rot * 2)], tags: ["symmetry"] });
  return q({ type: "rotational-symmetry", marks: 2, prompt: `How many lines of symmetry does ${S.s} have, and what is its order of rotational symmetry?`, answer: `${S.lines} line${S.lines === 1 ? "" : "s"}; order ${S.rot}`, working: [`Lines: ${S.lines}. Rotational order: ${S.rot}.`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["symmetry"] });
}

/* ── transformations ─────────────────────────────────────── */

const TRI = () => { for (;;) { const P = [[randInt(1, 5), randInt(1, 5)], [randInt(1, 5), randInt(1, 5)], [randInt(1, 5), randInt(1, 5)]]; const area = Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])); if (area >= 3) return P; } };
const L = ["A", "B", "C"];
const tri = (P, dashed = false, colour) => [0, 1, 2].map(i => ({ from: P[i], to: P[(i + 1) % 3], dashed, colour }));
export const TF = {
  translate: (p, a, b) => [p[0] + a, p[1] + b],
  reflectX: p => [p[0], -p[1]],
  reflectY: p => [-p[0], p[1]],
  rot90: p => [-p[1], p[0]],          // anticlockwise
  rot180: p => [-p[0], -p[1]],
  rot270: p => [p[1], -p[0]]           // = 90° clockwise
};

function translateCoordinatesQuestion() {
  const P = TRI(); const a = nz(-6, 2); const b = nz(-6, 2);
  const img = P.map(p => TF.translate(p, a, b));
  return q({
    type: "translate-coordinates", marks: 2,
    prompt: `Triangle ABC is translated ${Math.abs(a)} unit${Math.abs(a) === 1 ? "" : "s"} ${a < 0 ? "left" : "right"} and ${Math.abs(b)} unit${Math.abs(b) === 1 ? "" : "s"} ${b < 0 ? "down" : "up"}. Find the coordinates of A′, B′ and C′.`,
    diagram: plane({ xMin: -7, xMax: 7, yMin: -7, yMax: 7, segments: tri(P), points: vpts(P, L) }),
    answer: img.map((p, i) => `${L[i]}′${pt(...p)}`).join(", "),
    working: [`(x, y) → (x ${a < 0 ? MINUS : "+"} ${Math.abs(a)}, y ${b < 0 ? MINUS : "+"} ${Math.abs(b)})`, ...P.map((p, i) => `${L[i]}${pt(...p)} → ${pt(...img[i])}`)],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["translation"]
  });
}

function reflectInAxisQuestion() {
  const P = TRI(); const axis = choice(["x", "y"]);
  const img = P.map(axis === "x" ? TF.reflectX : TF.reflectY);
  return q({
    type: "reflect-in-axis", marks: 2,
    prompt: `Triangle ABC is reflected in the ${axis}-axis. Find the coordinates of the image A′B′C′, and draw it.`,
    diagram: plane({ xMin: -7, xMax: 7, yMin: -7, yMax: 7, segments: tri(P), points: vpts(P, L) }),
    answer: img.map((p, i) => `${L[i]}′${pt(...p)}`).join(", "),
    working: [axis === "x" ? "Reflection in the x-axis: (x, y) → (x, −y)" : "Reflection in the y-axis: (x, y) → (−x, y)", ...P.map((p, i) => `${L[i]}${pt(...p)} → ${pt(...img[i])}`)],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["reflection"]
  });
}

function rotateAboutOriginQuestion() {
  const p = [nz(-6, 6), nz(-6, 6)];
  const r = choice([["90° anticlockwise", TF.rot90, "(x, y) → (−y, x)"], ["90° clockwise", TF.rot270, "(x, y) → (y, −x)"], ["180°", TF.rot180, "(x, y) → (−x, −y)"]]);
  const img = r[1](p);
  return q({
    type: "rotate-about-origin", marks: 1,
    prompt: `The point P${pt(...p)} is rotated ${r[0]} about the origin. Find the coordinates of its image P′.`,
    answer: pt(...img),
    working: [r[2], `${pt(...p)} → ${pt(...img)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [pt(...TF.rot90(p)), pt(...TF.rot270(p)), pt(...TF.rot180(p)), pt(...TF.reflectX(p)), pt(p[1], p[0])].filter(s => s !== pt(...img)),
    tags: ["rotation"]
  });
}

function describeTransformationQuestion() {
  const P = TRI();
  const kinds = [
    ["a reflection in the x-axis", TF.reflectX], ["a reflection in the y-axis", TF.reflectY],
    ["a rotation of 90° anticlockwise about the origin", TF.rot90], ["a rotation of 180° about the origin", TF.rot180], ["a rotation of 90° clockwise about the origin", TF.rot270]
  ];
  const [name, f] = choice(kinds);
  const img = P.map(f);
  // make sure no other kind gives the same image
  const same = kinds.filter(([, g]) => P.every((p, i) => { const r = g(p); return r[0] === img[i][0] && r[1] === img[i][1]; }));
  if (same.length !== 1) return describeTransformationQuestion();
  if (img.some(a => P.some(b => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1.5))) return describeTransformationQuestion();
  return q({
    type: "describe-transformation", marks: 1,
    prompt: "Triangle ABC (solid) has been mapped onto triangle A′B′C′ (dashed). Describe the single transformation.",
    diagram: plane({ xMin: -7, xMax: 7, yMin: -7, yMax: 7, segments: [...tri(P), ...tri(img, true, "#b91c1c")], points: [...vpts(P, L), ...vpts(img, L.map(l => l + "′"))] }),
    answer: name[0].toUpperCase() + name.slice(1),
    working: [`${L[0]}${pt(...P[0])} → ${pt(...img[0])}: ${name}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: kinds.filter(k => k[0] !== name).map(k => k[0][0].toUpperCase() + k[0].slice(1)),
    tags: ["transformations"]
  });
}

function multiPartCoordinateQuestion() {
  const A = [randInt(-5, -1), randInt(-4, 4)]; const B = [A[0] + 2 * randInt(1, 3), A[1] + 2 * nz(-3, 3)];
  const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const m = new Q(B[1] - A[1], B[0] - A[0]);
  const d2 = (B[0] - A[0]) ** 2 + (B[1] - A[1]) ** 2;
  return q({
    type: "multi-part-coordinate", marks: 5,
    prompt: `A is ${pt(...A)} and B is ${pt(...B)}.`,
    subparts: [
      { label: "(a)", prompt: "Find the midpoint M of AB.", marks: 1, answer: pt(...M), working: ["Average the coordinates."] },
      { label: "(b)", prompt: "Find the gradient of AB.", marks: 1, answer: m.toString(), working: [`${num(B[1] - A[1])}/${num(B[0] - A[0])}`] },
      { label: "(c)", prompt: "Find the exact length of AB.", marks: 1, answer: exact(d2), working: [`√${d2}`] },
      { label: "(d)", prompt: "Find the equation of the line AB in general form.", marks: 2, answer: generalForm(B[1] - A[1], -(B[0] - A[0]), -(B[1] - A[1]) * A[0] + (B[0] - A[0]) * A[1]), working: ["Point–gradient form, then rearrange."] }
    ],
    answer: `(a) ${pt(...M)}; (b) ${m.toString()}; (c) ${exact(d2)}; (d) ${generalForm(B[1] - A[1], -(B[0] - A[0]), -(B[1] - A[1]) * A[0] + (B[0] - A[0]) * A[1])}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "point-gradient-form": pointGradientFormQuestion,
  "general-form": generalFormQuestion,
  "two-points-general": twoPointsGeneralQuestion,
  "unknown-coordinate": unknownCoordinateQuestion,
  "collinear-points": collinearPointsQuestion,
  "perpendicular-bisector": perpendicularBisectorQuestion,
  "triangle-proof": triangleProofQuestion,
  "parallelogram-proof": parallelogramProofQuestion,
  "rotational-symmetry": rotationalSymmetryQuestion,
  "translate-coordinates": translateCoordinatesQuestion,
  "reflect-in-axis": reflectInAxisQuestion,
  "rotate-about-origin": rotateAboutOriginQuestion,
  "describe-transformation": describeTransformationQuestion,
  "multi-part-coordinate": multiPartCoordinateQuestion
};

export function getLinearRelationshipsCQuestionTypes() { return TYPE_LIST; }
export function generateLinearRelationshipsCQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
