/*
  Mills Maths Tools — Stage 5 Question Bank: Circle Geometry
  -----------------------------------------------------------
  question-banks/stage-5/circle-geometry/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-CIR-P-01 (Path):
    applies deductive reasoning to prove circle theorems and to solve
    related problems.

  Content:
    - vocabulary: arc, chord, sector, segment, tangent, secant, subtend
    - chords: the perpendicular from the centre bisects a chord
      (with Pythagoras); equal chords are equidistant from the centre
    - angles: at the centre is twice the angle at the circumference; angles
      in the same segment; angle in a semicircle; cyclic quadrilaterals
      (opposite angles, exterior angle)
    - tangents: tangent ⊥ radius; tangents from an external point are equal;
      the alternate segment theorem
    - intercepts: intersecting chords, secants from an external point, and
      tangent–secant (PT² = PA × PB)

  Every figure is placed on a circle of radius 110 at chosen angular
  positions, and every angle in the answer is MEASURED from those positions,
  so the drawing and the answer agree.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, fmt
} from "../../_shared/bank-helpers.js";

const TOPIC = "Circle Geometry";

const TYPE_LIST = [
  { id: "circle-vocabulary", label: "Circle vocabulary" },
  { id: "chord-perpendicular", label: "Perpendicular from the centre to a chord" },
  { id: "angle-at-centre", label: "Angle at the centre and circumference" },
  { id: "same-segment", label: "Angles in the same segment" },
  { id: "angle-semicircle", label: "Angle in a semicircle" },
  { id: "cyclic-quadrilateral", label: "Cyclic quadrilaterals" },
  { id: "cyclic-exterior", label: "Exterior angle of a cyclic quadrilateral" },
  { id: "tangent-radius", label: "Tangent and radius" },
  { id: "two-tangents", label: "Tangents from an external point" },
  { id: "alternate-segment", label: "The alternate segment theorem" },
  { id: "intersecting-chords", label: "Intersecting chords" },
  { id: "secants-tangents", label: "Secants and tangents from an external point" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "circle geometry", ...(spec.tags || [])] });
const geo = config => ({ engine: "geometry-engine", config: { centre: "O", ...config, labelOffsets: { O: [-16, 16], ...(config.labelOffsets || {}) } } });
/* The nearer intersection of line P→Q with the circle (Q on the circle). */
function nearHit(P, Q) {
  const d = [Q[0] - P[0], Q[1] - P[1]]; const a = d[0] * d[0] + d[1] * d[1]; const b = 2 * (P[0] * d[0] + P[1] * d[1]); const c = P[0] * P[0] + P[1] * P[1] - R * R;
  const t = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  return [P[0] + t * d[0], P[1] + t * d[1]];
}
const R = 110;
const on = deg => [R * Math.cos(deg * Math.PI / 180), -R * Math.sin(deg * Math.PI / 180)];
const n2 = v => fmt(v, 2);
function angleAt(P, at, f, t) {
  const u = [P[f][0] - P[at][0], P[f][1] - P[at][1]]; const v = [P[t][0] - P[at][0], P[t][1] - P[at][1]];
  return Math.round(Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))) * 180 / Math.PI);
}
const circ = { circles: [{ centre: "O", through: "_r" }] };
const base = extra => ({ ...circ, dots: ["O"], ...extra, points: { O: [0, 0], _r: on(0), ...extra.points } });

const VOCAB = [
  ["an interval joining two points on a circle", "chord"],
  ["a line that touches a circle at exactly one point", "tangent"],
  ["a line that cuts a circle at two points", "secant"],
  ["the region between two radii and an arc", "sector"],
  ["the region between a chord and an arc", "segment"],
  ["part of the circumference", "arc"],
  ["a chord that passes through the centre", "diameter"]
];

function circleVocabularyQuestion() {
  const [d, w] = choice(VOCAB);
  return q({ type: "circle-vocabulary", marks: 1, prompt: `What is the name for ${d}?`, answer: w[0].toUpperCase() + w.slice(1), working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(VOCAB.filter(v => v[1] !== w)).slice(0, 3).map(v => v[1][0].toUpperCase() + v[1].slice(1)), tags: ["vocabulary"] });
}

function chordPerpendicularQuestion() {
  const [half, dist, r] = choice([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [8, 15, 17], [12, 9, 15]]);
  const ask = choice(["chord", "dist", "radius"]);
  const t = Math.asin(half / r) * 180 / Math.PI;
  const A = on(270 - t); const B = on(270 + t); const M = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const cfg = base({ points: { A, B, M }, segments: [{ from: "A", to: "B" }, { from: "O", to: "M", dashed: false }, { from: "O", to: "B" }], angles: [{ at: "M", from: "B", to: "O", right: true }], sideLabels: [
    ask === "chord" ? { from: "A", to: "B", text: "x", offset: 18 } : { from: "A", to: "B", text: `${2 * half} cm`, offset: 18 },
    { from: "O", to: "M", text: ask === "dist" ? "x" : `${dist} cm`, offset: 18 },
    { from: "O", to: "B", text: ask === "radius" ? "x" : `${r} cm`, offset: 18, flip: true }
  ].filter(Boolean), labelOffsets: { M: [-16, -14], O: [0, -18] } });
  const ans = ask === "chord" ? 2 * half : ask === "dist" ? dist : r;
  return q({
    type: "chord-perpendicular", marks: 2,
    prompt: `O is the centre and OM ⊥ AB. Find x, giving reasons.`,
    diagram: geo(cfg),
    answer: `x = ${ans} cm`,
    working: ["The perpendicular from the centre bisects the chord, so AM = MB.", ask === "chord" ? `MB = √(${r}² − ${dist}²) = ${half}, so AB = ${2 * half}` : ask === "dist" ? `OM = √(${r}² − ${half}²) = ${dist}` : `OB = √(${half}² + ${dist}²) = ${r}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`x = ${ask === "chord" ? half : ask === "dist" ? n2(Math.sqrt(r * r - 4 * half * half) || r - half) : r + 1} cm`, `x = ${ask === "radius" ? n2(Math.sqrt(4 * half * half + dist * dist)) : r - (ask === "chord" ? dist : half)} cm`],
    tags: ["chords", "Pythagoras"]
  });
}

function angleAtCentreQuestion() {
  const arc = 2 * randInt(35, 80);
  const a0 = randInt(200, 250); const A = on(a0); const B = on(a0 + arc); const c = a0 + arc + randInt(40, 360 - arc - 40);
  const C = on(c);
  const P = { O: [0, 0], A, B, C };
  const centre = angleAt(P, "O", "A", "B"); const circum = angleAt(P, "C", "A", "B");
  const askCentre = Math.random() < 0.5;
  return q({
    type: "angle-at-centre", marks: 2,
    prompt: "O is the centre. Find x, giving a reason.",
    diagram: geo(base({ points: { A, B, C }, segments: [{ from: "O", to: "A" }, { from: "O", to: "B" }, { from: "C", to: "A" }, { from: "C", to: "B" }], angles: [{ at: "O", from: "A", to: "B", label: askCentre ? "x" : `${centre}°` }, { at: "C", from: "A", to: "B", label: askCentre ? `${circum}°` : "x" }] })),
    answer: `x = ${askCentre ? centre : circum}°`,
    working: ["The angle at the centre is twice the angle at the circumference standing on the same arc.", askCentre ? `x = 2 × ${circum} = ${centre}°` : `x = ${centre} ÷ 2 = ${circum}°`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: askCentre ? [`x = ${circum}°`, `x = ${180 - circum}°`, `x = ${360 - centre}°`] : [`x = ${centre}°`, `x = ${180 - circum}°`, `x = ${90 - circum}°`],
    tags: ["angle at centre"]
  });
}

function sameSegmentQuestion() {
  const a0 = randInt(200, 230); const arc = randInt(70, 120);
  const A = on(a0); const B = on(a0 + arc);
  const c = a0 + arc + randInt(40, 80); const d = c + randInt(40, 360 - arc - (c - a0 - arc) - 50);
  const C = on(c); const D = on(d);
  const P = { A, B, C, D };
  const val = angleAt(P, "C", "A", "B");
  return q({
    type: "same-segment", marks: 1,
    prompt: "Find x, giving a reason.",
    diagram: geo(base({ points: { A, B, C, D }, segments: [{ from: "C", to: "A" }, { from: "C", to: "B" }, { from: "D", to: "A" }, { from: "D", to: "B" }], angles: [{ at: "C", from: "A", to: "B", label: `${val}°` }, { at: "D", from: "A", to: "B", label: "x" }], dots: [], vertexLabels: { O: false } })),
    answer: `x = ${val}°`,
    working: ["Angles in the same segment (standing on the same arc AB) are equal."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${2 * val}°`, `x = ${180 - val}°`, `x = ${90 - val > 0 ? 90 - val : val / 2}°`],
    tags: ["same segment"]
  });
}

function angleSemicircleQuestion() {
  const c = randInt(25, 155); if (Math.abs(c - 90) < 12) return angleSemicircleQuestion();
  const A = on(180); const B = on(0); const C = on(c);
  const P = { A, B, C }; const a = angleAt(P, "A", "B", "C");
  return q({
    type: "angle-semicircle", marks: 2,
    prompt: "AB is a diameter of the circle with centre O. Find x, giving reasons.",
    diagram: geo(base({ points: { A, B, C }, segments: [{ from: "A", to: "B" }, { from: "A", to: "C" }, { from: "B", to: "C" }], angles: [{ at: "A", from: "B", to: "C", label: `${a}°` }, { at: "B", from: "C", to: "A", label: "x" }] })),
    answer: `x = ${90 - a}°`,
    working: ["∠ACB = 90° (angle in a semicircle)", `x = 180 − 90 − ${a} = ${90 - a}° (angle sum of △ABC)`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${180 - a}°`, `x = ${a}°`, `x = ${2 * a}°`],
    tags: ["semicircle"]
  });
}

function cyclicQuad() {
  const t = [randInt(10, 60), randInt(100, 150), randInt(190, 240), randInt(280, 330)];
  const [A, B, C, D] = t.map(on);
  return { A, B, C, D };
}

function cyclicQuadrilateralQuestion() {
  const P = cyclicQuad();
  const b = angleAt(P, "B", "A", "C"); const d = 180 - b;
  const pairAC = Math.random() < 0.5;
  const a = angleAt(P, "A", "D", "B"); const c = 180 - a;
  return q({
    type: "cyclic-quadrilateral", marks: 2,
    prompt: "ABCD is a cyclic quadrilateral. Find x, giving a reason.",
    diagram: geo(base({ points: P, polygons: [{ pts: ["A", "B", "C", "D"], fill: false }], angles: pairAC ? [{ at: "A", from: "D", to: "B", label: `${a}°` }, { at: "C", from: "B", to: "D", label: "x" }] : [{ at: "B", from: "A", to: "C", label: `${b}°` }, { at: "D", from: "C", to: "A", label: "x" }], dots: [], vertexLabels: { O: false } })),
    answer: `x = ${pairAC ? c : d}°`,
    working: ["Opposite angles of a cyclic quadrilateral are supplementary.", `x = 180 − ${pairAC ? a : b} = ${pairAC ? c : d}°`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${pairAC ? a : b}°`, `x = ${360 - 2 * (pairAC ? a : b) > 0 ? 360 - 2 * (pairAC ? a : b) : 90}°`, `x = ${Math.abs(90 - (pairAC ? a : b))}°`],
    tags: ["cyclic quadrilateral"]
  });
}

function cyclicExteriorQuestion() {
  const P = cyclicQuad();
  // extend DC beyond C to E
  const dir = [P.C[0] - P.D[0], P.C[1] - P.D[1]]; const L = Math.hypot(...dir);
  const E = [P.C[0] + dir[0] / L * 80, P.C[1] + dir[1] / L * 80];
  const pts = { ...P, E };
  const interiorA = angleAt(pts, "A", "B", "D");
  return q({
    type: "cyclic-exterior", marks: 2,
    prompt: "ABCD is a cyclic quadrilateral and DC is produced to E. Find x, giving a reason.",
    diagram: geo(base({ points: pts, polygons: [{ pts: ["A", "B", "C", "D"], fill: false }], segments: [{ from: "C", to: "E" }], angles: [{ at: "A", from: "B", to: "D", label: `${interiorA}°` }, { at: "C", from: "E", to: "B", label: "x" }], dots: [], vertexLabels: { O: false } })),
    answer: `x = ${angleAt(pts, "C", "E", "B")}°`,
    working: ["The exterior angle of a cyclic quadrilateral equals the interior opposite angle."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${180 - interiorA}°`, `x = ${Math.abs(90 - interiorA)}°`],
    tags: ["cyclic quadrilateral", "exterior angle"]
  });
}

function tangentRadiusQuestion() {
  const v = choice(["length", "angle"]);
  const T = on(90); // top
  if (v === "length") {
    const [r, t, d] = choice([[5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
    const S = R / r; const Pp = [t * S, T[1]];
    const ask = choice(["OP", "PT"]);
    return q({
      type: "tangent-radius", marks: 2,
      prompt: `PT is a tangent to the circle with centre O. Find x, giving a reason.`,
      diagram: geo(base({ points: { T, P: Pp, _l: [T[0] - 60, T[1]] }, segments: [{ from: "O", to: "T" }, { from: "O", to: "P" }, { from: "_l", to: "P" }], angles: [{ at: "T", from: "O", to: "P", right: true }], sideLabels: [{ from: "O", to: "T", text: `${r}`, offset: 14 }, { from: "T", to: "P", text: ask === "PT" ? "x" : String(t), offset: 16 }, { from: "O", to: "P", text: ask === "OP" ? "x" : String(d), offset: 16, flip: true }] })),
      answer: `x = ${ask === "OP" ? d : t}`,
      working: ["∠OTP = 90° (a tangent is perpendicular to the radius at the point of contact)", ask === "OP" ? `x = √(${r}² + ${t}²) = ${d}` : `x = √(${d}² − ${r}²) = ${t}`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [`x = ${ask === "OP" ? r + t : d - r}`, `x = ${ask === "OP" ? n2(Math.sqrt(t * t - r * r)) : n2(Math.sqrt(d * d + r * r))}`],
      tags: ["tangent"]
    });
  }
  const a = randInt(20, 60);
  const dist = R / Math.tan(a * Math.PI / 180);
  const Pp = [dist, T[1]];
  const pts = { T, P: Pp, O: [0, 0] };
  const ap = angleAt(pts, "P", "T", "O");
  return q({
    type: "tangent-radius", marks: 2,
    prompt: "PT is a tangent to the circle with centre O. Find x, giving reasons.",
    diagram: geo(base({ points: { T, P: Pp }, segments: [{ from: "O", to: "T" }, { from: "O", to: "P" }, { from: "T", to: "P" }], angles: [{ at: "P", from: "T", to: "O", label: `${ap}°` }, { at: "O", from: "T", to: "P", label: "x" }, { at: "T", from: "O", to: "P", right: true }] })),
    answer: `x = ${90 - ap}°`,
    working: ["∠OTP = 90° (tangent ⊥ radius)", `x = 180 − 90 − ${ap} = ${90 - ap}° (angle sum of a triangle)`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${ap}°`, `x = ${180 - ap}°`, `x = ${2 * ap}°`],
    tags: ["tangent"]
  });
}

function twoTangentsQuestion() {
  const half = randInt(25, 55); // half the angle APB
  const d = R / Math.sin(half * Math.PI / 180);
  const Pp = [d, 0];
  const tA = 90 - half;
  const A = on(tA); const B = on(-tA);
  const pts = { O: [0, 0], A, B, P: Pp };
  const apb = angleAt(pts, "P", "A", "B"); const aob = 180 - apb;
  const v = choice(["angle", "length"]);
  if (v === "angle") {
    return q({
      type: "two-tangents", marks: 2,
      prompt: "PA and PB are tangents to the circle with centre O. Find x, giving reasons.",
      diagram: geo(base({ points: { A, B, P: Pp }, segments: [{ from: "P", to: "A" }, { from: "P", to: "B" }, { from: "O", to: "A" }, { from: "O", to: "B" }], angles: [{ at: "P", from: "A", to: "B", label: `${apb}°` }, { at: "O", from: "A", to: "B", label: "x" }, { at: "A", from: "O", to: "P", right: true }, { at: "B", from: "O", to: "P", right: true }] })),
      answer: `x = ${aob}°`,
      working: ["∠OAP = ∠OBP = 90° (tangent ⊥ radius)", `x = 360 − 90 − 90 − ${apb} = ${aob}° (angle sum of quadrilateral OAPB)`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`x = ${apb}°`, `x = ${2 * apb}°`, `x = ${360 - apb}°`],
      tags: ["tangents"]
    });
  }
  const x = randInt(2, 9); const m1 = randInt(2, 5); const m2 = randInt(1, m1 - 1 || 1); if (m1 === m2) return twoTangentsQuestion();
  const c1 = randInt(-5, 5); const L = m1 * x + c1; const c2 = L - m2 * x;
  const ex = (m, c) => `${m === 1 ? "" : m}x ${c < 0 ? "−" : "+"} ${Math.abs(c)}`.replace(/ [+−] 0$/, "");
  return q({
    type: "two-tangents", marks: 2,
    prompt: `PA and PB are tangents from the external point P. PA = (${ex(m1, c1)}) cm and PB = (${ex(m2, c2)}) cm. Find x and the length of PA.`,
    diagram: geo(base({ points: { A, B, P: Pp }, segments: [{ from: "P", to: "A" }, { from: "P", to: "B" }], sideLabels: [{ from: "P", to: "A", text: ex(m1, c1), offset: 18 }, { from: "P", to: "B", text: ex(m2, c2), offset: 18 }] })),
    answer: `x = ${x}, PA = ${L} cm`,
    working: ["Tangents from an external point are equal: PA = PB", `${ex(m1, c1)} = ${ex(m2, c2)}`, `x = ${x}, PA = ${L}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${x}, PA = ${L + m1} cm`, `x = ${x + 1}, PA = ${m1 * (x + 1) + c1}`],
    tags: ["tangents", "equations"]
  });
}

function alternateSegmentQuestion() {
  const a0 = 270; const T = on(a0);
  const bDeg = randInt(300, 350); const cDeg = randInt(130, 230);
  const B = on(bDeg); const C = on(cDeg);
  const tx = [T[0] + 170, T[1]]; const tx2 = [T[0] - 170, T[1]];
  const pts = { T, B, C, _t: tx, _s: tx2, O: [0, 0] };
  const between = angleAt(pts, "T", "_t", "B");
  const opp = angleAt(pts, "C", "T", "B");
  return q({
    type: "alternate-segment", marks: 2,
    prompt: "The line is a tangent to the circle at T. Find x, giving a reason.",
    diagram: geo(base({ points: { T, B, C, _t: tx, _s: tx2 }, segments: [{ from: "_s", to: "_t" }, { from: "T", to: "B" }, { from: "T", to: "C" }, { from: "B", to: "C" }], angles: [{ at: "T", from: "_t", to: "B", label: `${between}°` }, { at: "C", from: "T", to: "B", label: "x" }], dots: [], vertexLabels: { O: false } })),
    answer: `x = ${opp}°`,
    working: ["The angle between a tangent and a chord equals the angle in the alternate segment."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${180 - opp}°`, `x = ${90 - opp > 0 ? 90 - opp : 2 * opp}°`, `x = ${2 * opp}°`],
    tags: ["alternate segment"]
  });
}

function intersectingChordsQuestion() {
  const [a, b, c] = choice([[4, 6, 3], [3, 8, 4], [6, 4, 8], [2, 9, 3], [5, 6, 3], [4, 9, 6], [6, 10, 5]]);
  const d = (a * b) / c;
  if (!Number.isInteger(d)) return intersectingChordsQuestion();
  const A = on(165); const B = on(15); const C = on(70); const D = on(235);
  // intersection of AB and CD
  const inter = (p1, p2, p3, p4) => { const d1 = [p2[0] - p1[0], p2[1] - p1[1]]; const d2 = [p4[0] - p3[0], p4[1] - p3[1]]; const den = d1[0] * d2[1] - d1[1] * d2[0]; const t = ((p3[0] - p1[0]) * d2[1] - (p3[1] - p1[1]) * d2[0]) / den; return [p1[0] + t * d1[0], p1[1] + t * d1[1]]; };
  const X = inter(A, B, C, D);
  return q({
    type: "intersecting-chords", marks: 2,
    prompt: "Chords AB and CD intersect at X. Find x, giving a reason.",
    diagram: { ...geo(base({ points: { A, B, C, D, X }, segments: [{ from: "A", to: "B" }, { from: "C", to: "D" }], sideLabels: [{ from: "A", to: "X", text: `${a}`, offset: 14 }, { from: "X", to: "B", text: `${b}`, offset: 14 }, { from: "C", to: "X", text: `${c}`, offset: 14 }, { from: "X", to: "D", text: "x", offset: 14 }], dots: ["X"], vertexLabels: { O: false }, labelOffsets: { X: [0, -20] } })), notToScale: true },
    answer: `x = ${d}`,
    working: ["The products of the intercepts of intersecting chords are equal: AX × XB = CX × XD", `${a} × ${b} = ${c} × x`, `x = ${d}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`x = ${n2(a * c / b)}`, `x = ${a + b - c}`, `x = ${n2(b * c / a)}`],
    tags: ["intercepts"]
  });
}

function secantsTangentsQuestion() {
  const v = choice(["tangent", "secants"]);
  if (v === "tangent") {
    const [pa, ab] = choice([[4, 5], [2, 6], [3, 9], [4, 12], [5, 4], [8, 10]]);
    const pb = pa + ab; const t2 = pa * pb; const t = Math.sqrt(t2);
    const tt = Number.isInteger(t) ? String(t) : `√${t2}`;
    const Pp = [0, -250]; const T = [R * Math.sqrt(1 - (R / 250) ** 2), -R * R / 250]; const B = on(235); const A = nearHit(Pp, B);
    return q({
      type: "secants-tangents", marks: 2,
      prompt: `PT is a tangent and PAB is a secant. PA = ${pa} and AB = ${ab}. Find the length of the tangent PT.`,
      diagram: { ...geo(base({ points: { P: Pp, T, A, B }, segments: [{ from: "P", to: "T" }, { from: "P", to: "B" }], dots: [], vertexLabels: { O: false } })), notToScale: true },
      answer: `PT = ${tt}${Number.isInteger(t) ? "" : ` ≈ ${n2(t)}`}`,
      working: ["PT² = PA × PB (tangent–secant theorem)", `PT² = ${pa} × ${pb} = ${t2}`, `PT = ${tt}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`PT = ${n2(Math.sqrt(pa * ab))}`, `PT = ${pa * pb}`],
      tags: ["tangent–secant"]
    });
  }
  const [pa, ab, pc] = choice([[4, 5, 3], [3, 5, 4], [2, 10, 4], [6, 2, 4], [5, 7, 6]]);
  const pb = pa + ab; const pd = (pa * pb) / pc; const cd = pd - pc;
  if (!Number.isInteger(cd * 100)) return secantsTangentsQuestion();
  const Pp = [0, -250]; const B = on(235); const D = on(305); const A = nearHit(Pp, B); const C = nearHit(Pp, D);
  return q({
    type: "secants-tangents", marks: 2,
    prompt: `PAB and PCD are secants. PA = ${pa}, AB = ${ab} and PC = ${pc}. Find CD.`,
    diagram: { ...geo(base({ points: { P: Pp, A, B, C, D }, segments: [{ from: "P", to: "B" }, { from: "P", to: "D" }], dots: [], vertexLabels: { O: false } })), notToScale: true },
    answer: `CD = ${n2(cd)}`,
    working: ["PA × PB = PC × PD (secants from an external point)", `${pa} × ${pb} = ${pc} × PD`, `PD = ${n2(pd)}, so CD = ${n2(pd)} − ${pc} = ${n2(cd)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`CD = ${n2(pd)}`, `CD = ${n2(pa * ab / pc)}`],
    tags: ["secants"]
  });
}

const GENERATORS = {
  "circle-vocabulary": circleVocabularyQuestion,
  "chord-perpendicular": chordPerpendicularQuestion,
  "angle-at-centre": angleAtCentreQuestion,
  "same-segment": sameSegmentQuestion,
  "angle-semicircle": angleSemicircleQuestion,
  "cyclic-quadrilateral": cyclicQuadrilateralQuestion,
  "cyclic-exterior": cyclicExteriorQuestion,
  "tangent-radius": tangentRadiusQuestion,
  "two-tangents": twoTangentsQuestion,
  "alternate-segment": alternateSegmentQuestion,
  "intersecting-chords": intersectingChordsQuestion,
  "secants-tangents": secantsTangentsQuestion
};

export function getCircleGeometryQuestionTypes() { return TYPE_LIST; }
export function generateCircleGeometryQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
