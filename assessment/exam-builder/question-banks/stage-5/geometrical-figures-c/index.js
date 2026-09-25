/*
  Mills Maths Tools — Stage 5 Question Bank: Properties of Geometrical Figures C
  -------------------------------------------------------------------------------
  question-banks/stage-5/geometrical-figures-c/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-GEO-P-02 (Path):
    proves triangles congruent or similar, and uses deductive reasoning to
    prove properties of triangles and quadrilaterals.

  Content:
    - formal congruence proofs (SSS, SAS, AAS, RHS) set out with reasons
    - similarity proofs (AA with parallel lines, SAS ratios), then using the
      result to find a length
    - proving properties of special quadrilaterals: parallelogram diagonals
      bisect each other, opposite angles equal, rhombus diagonals meet at
      right angles, rectangle diagonals equal; and tests for a
      parallelogram
    - isosceles triangle properties (base angles, the perpendicular from
      the apex bisects the base)
    - supplying the missing reason in a proof; true/false properties

  Each proof is a template with a matching figure; the figures are drawn by
  the geometry engine with the marks the proof relies on.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";

const TOPIC = "Properties of Geometrical Figures C";

const TYPE_LIST = [
  { id: "prove-congruent", label: "Prove two triangles congruent" },
  { id: "prove-then-deduce", label: "Prove congruent, then deduce a property" },
  { id: "prove-similar", label: "Prove two triangles similar, then find a length" },
  { id: "prove-quadrilateral-property", label: "Prove a property of a quadrilateral" },
  { id: "prove-isosceles-property", label: "Prove a property of an isosceles triangle" },
  { id: "missing-reason", label: "Supply the missing reason" },
  { id: "quadrilateral-properties", label: "Properties of special quadrilaterals" },
  { id: "parallelogram-tests", label: "Tests for a parallelogram" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "proof", ...(spec.tags || [])] });
const geo = config => ({ engine: "geometry-engine", config });

/* ── figures ─────────────────────────────────────────────── */

const FIG = {
  kite: () => ({ points: { A: [0, -120], B: [90, -40], C: [0, 110], D: [-90, -40] }, polygons: [{ pts: ["A", "B", "C", "D"] }], segments: [{ from: "A", to: "C" }], ticks: [{ from: "A", to: "B" }, { from: "A", to: "D" }, { from: "C", to: "B", count: 2 }, { from: "C", to: "D", count: 2 }] }),
  parallelogram: (diag = true) => ({ points: { A: [0, 0], B: [220, 0], C: [290, -130], D: [70, -130], ...(diag ? { M: [145, -65] } : {}) }, polygons: [{ pts: ["A", "B", "C", "D"] }], segments: diag ? [{ from: "A", to: "C" }, { from: "B", to: "D" }] : [{ from: "A", to: "C" }], parallel: [{ from: "A", to: "B" }, { from: "D", to: "C" }, { from: "A", to: "D", count: 2 }, { from: "B", to: "C", count: 2 }], labelOffsets: diag ? { M: [0, 22] } : {} }),
  isosceles: () => ({ points: { A: [0, -170], B: [-100, 0], C: [100, 0], D: [0, 0] }, polygons: [{ pts: ["A", "B", "C"] }], segments: [{ from: "A", to: "D" }], ticks: [{ from: "A", to: "B" }, { from: "A", to: "C" }], angles: [{ at: "D", from: "C", to: "A", right: true }], labelOffsets: { D: [0, 20] } }),
  bowtie: () => ({ points: { A: [0, 0], B: [240, 0], M: [120, -80], C: [0, -160], D: [240, -160] }, segments: [{ from: "A", to: "D" }, { from: "B", to: "C" }, { from: "A", to: "C" }, { from: "B", to: "D" }], ticks: [{ from: "A", to: "M" }, { from: "M", to: "D" }, { from: "B", to: "M", count: 2 }, { from: "M", to: "C", count: 2 }], labelOffsets: { M: [0, -22] } }),
  rectangle: () => ({ points: { A: [0, 0], B: [260, 0], C: [260, -150], D: [0, -150] }, polygons: [{ pts: ["A", "B", "C", "D"] }], segments: [{ from: "A", to: "C" }, { from: "B", to: "D" }], angles: [{ at: "A", from: "B", to: "D", right: true }, { at: "B", from: "C", to: "A", right: true }] }),
  rhombus: () => ({ points: { A: [0, 0], B: [130, -80], C: [0, -160], D: [-130, -80], M: [0, -80] }, polygons: [{ pts: ["A", "B", "C", "D"] }], segments: [{ from: "A", to: "C" }, { from: "B", to: "D" }], ticks: [{ from: "A", to: "B" }, { from: "B", to: "C" }, { from: "C", to: "D" }, { from: "D", to: "A" }], labelOffsets: { M: [16, -16] } }),
  rightShared: () => ({ points: { A: [0, -150], B: [0, 0], C: [-150, 0], D: [150, 0] }, polygons: [{ pts: ["A", "C", "D"] }], segments: [{ from: "A", to: "B" }], ticks: [{ from: "A", to: "C" }, { from: "A", to: "D" }], angles: [{ at: "B", from: "D", to: "A", right: true }], labelOffsets: { B: [0, 20] } }),
  parallelSimilar: () => ({ points: { A: [0, -200], D: [-60, -100], E: [70, -100], B: [-120, 0], C: [140, 0] }, polygons: [{ pts: ["A", "B", "C"] }], segments: [{ from: "D", to: "E" }], parallel: [{ from: "D", to: "E" }, { from: "B", to: "C" }], labelOffsets: { D: [-20, 0], E: [20, 0] } })
};

/* ── proofs (statement, reason) ──────────────────────────── */

const CONGRUENT = [
  {
    fig: "kite", prompt: "ABCD is a kite with AB = AD and CB = CD. Prove that △ABC ≡ △ADC.",
    steps: [["AB = AD", "given"], ["CB = CD", "given"], ["AC is common", "common side"], ["∴ △ABC ≡ △ADC", "SSS"]], test: "SSS"
  },
  {
    fig: "bowtie", prompt: "AD and BC bisect each other at M. Prove that △AMB ≡ △DMC.",
    steps: [["AM = MD", "given: M is the midpoint of AD"], ["BM = MC", "given: M is the midpoint of BC"], ["∠AMB = ∠DMC", "vertically opposite angles"], ["∴ △AMB ≡ △DMC", "SAS"]], test: "SAS"
  },
  {
    fig: "rightShared", prompt: "AB ⊥ CD and AC = AD. Prove that △ABC ≡ △ABD.",
    steps: [["∠ABC = ∠ABD = 90°", "given, AB ⊥ CD"], ["AC = AD", "given: hypotenuses"], ["AB is common", "common side"], ["∴ △ABC ≡ △ABD", "RHS"]], test: "RHS"
  },
  {
    fig: "parallelogram", figArg: false, prompt: "ABCD is a parallelogram. Prove that △ABC ≡ △CDA.",
    steps: [["∠BAC = ∠DCA", "alternate angles, AB ∥ DC"], ["∠BCA = ∠DAC", "alternate angles, AD ∥ BC"], ["AC is common", "common side"], ["∴ △ABC ≡ △CDA", "AAS"]], test: "AAS"
  }
];

const layout = steps => steps.map(([s, r]) => `${s} (${r})`);

function proveCongruentQuestion() {
  const P = choice(CONGRUENT);
  return q({
    type: "prove-congruent", marks: 3,
    prompt: P.prompt,
    diagram: geo(FIG[P.fig](P.figArg)),
    answer: layout(P.steps).join("; "),
    working: layout(P.steps),
    space: SPACE_SIZES.LARGE,
    mcEligible: false,
    tags: ["congruence", P.test]
  });
}

const DEDUCE = [
  {
    fig: "parallelogram", prompt: "ABCD is a parallelogram with diagonals meeting at M. (a) Prove that △AMB ≡ △CMD. (b) Hence prove that the diagonals bisect each other.",
    steps: [["∠MAB = ∠MCD", "alternate angles, AB ∥ DC"], ["∠MBA = ∠MDC", "alternate angles, AB ∥ DC"], ["AB = CD", "opposite sides of a parallelogram are equal"], ["△AMB ≡ △CMD", "AAS"], ["AM = MC and BM = MD", "matching sides of congruent triangles"], ["∴ the diagonals bisect each other", ""]]
  },
  {
    fig: "isosceles", prompt: "In △ABC, AB = AC and AD ⊥ BC. (a) Prove that △ABD ≡ △ACD. (b) Hence prove that D is the midpoint of BC.",
    steps: [["∠ADB = ∠ADC = 90°", "given"], ["AB = AC", "given: hypotenuses"], ["AD is common", "common side"], ["△ABD ≡ △ACD", "RHS"], ["BD = DC", "matching sides of congruent triangles"], ["∴ D is the midpoint of BC", ""]]
  },
  {
    fig: "kite", prompt: "ABCD is a kite with AB = AD and CB = CD. (a) Prove that △ABC ≡ △ADC. (b) Hence prove that AC bisects ∠BAD.",
    steps: [["AB = AD, CB = CD", "given"], ["AC is common", "common side"], ["△ABC ≡ △ADC", "SSS"], ["∠BAC = ∠DAC", "matching angles of congruent triangles"], ["∴ AC bisects ∠BAD", ""]]
  },
  {
    fig: "rectangle", prompt: "ABCD is a rectangle. (a) Prove that △ABC ≡ △BAD. (b) Hence prove that the diagonals AC and BD are equal.",
    steps: [["AB is common", "common side"], ["∠ABC = ∠BAD = 90°", "angles of a rectangle"], ["BC = AD", "opposite sides of a rectangle are equal"], ["△ABC ≡ △BAD", "SAS"], ["∴ AC = BD", "matching sides of congruent triangles"]]
  }
];

function proveThenDeduceQuestion() {
  const P = choice(DEDUCE);
  const reasons = layout(P.steps.map(([s, r]) => [s, r || "from the line above"]));
  return q({
    type: "prove-then-deduce", marks: 4,
    prompt: P.prompt,
    diagram: geo(FIG[P.fig]()),
    answer: reasons.join("; "),
    working: reasons,
    space: SPACE_SIZES.LARGE,
    mcEligible: false,
    tags: ["congruence", "deduce"]
  });
}

function proveSimilarQuestion() {
  const AD = choice([4, 5, 6, 8]); const DB = choice([2, 3, 4, 6]); const DE = choice([6, 8, 9, 10, 12]);
  const AB = AD + DB; const BC = (DE * AB) / AD;
  const bc = Number.isInteger(BC) ? String(BC) : BC.toFixed(2).replace(/0$/, "");
  const cfg = FIG.parallelSimilar();
  cfg.sideLabels = [{ from: "A", to: "D", text: `${AD}` }, { from: "D", to: "B", text: `${DB}` }, { from: "D", to: "E", text: `${DE}`, flip: true }, { from: "B", to: "C", text: "x" }];
  return q({
    type: "prove-similar", marks: 4,
    prompt: "DE ∥ BC. x is the length of BC.",
    diagram: geo(cfg),
    subparts: [
      { label: "(a)", prompt: "Prove that △ADE ||| △ABC.", marks: 2, answer: "∠A is common; ∠ADE = ∠ABC (corresponding angles, DE ∥ BC); ∴ △ADE ||| △ABC (AA, equiangular).", working: [] },
      { label: "(b)", prompt: "Find x.", marks: 2, answer: `x = ${bc}`, working: [`BC/DE = AB/AD (matching sides of similar triangles)`, `x/${DE} = ${AB}/${AD}`, `x = ${bc}`] }
    ],
    answer: `(a) AA; (b) x = ${bc}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["similarity", "AA"]
  });
}

const QUAD_PROOFS = [
  {
    fig: "parallelogram", figArg: false, prompt: "ABCD is a parallelogram. Prove that its opposite angles ∠ABC and ∠CDA are equal.",
    steps: [["∠BAC = ∠DCA", "alternate angles, AB ∥ DC"], ["∠BCA = ∠DAC", "alternate angles, AD ∥ BC"], ["AC is common", "common side"], ["△ABC ≡ △CDA", "AAS"], ["∴ ∠ABC = ∠CDA", "matching angles of congruent triangles"]]
  },
  {
    fig: "rhombus", prompt: "ABCD is a rhombus with diagonals meeting at M. Prove that the diagonals meet at right angles.",
    steps: [["AB = CB", "sides of a rhombus are equal"], ["AM = MC", "diagonals of a parallelogram bisect each other"], ["BM is common", "common side"], ["△ABM ≡ △CBM", "SSS"], ["∠AMB = ∠CMB", "matching angles of congruent triangles"], ["∠AMB + ∠CMB = 180°", "angles on a straight line"], ["∴ ∠AMB = 90°, so AC ⊥ BD", ""]]
  },
  {
    fig: "parallelogram", figArg: false, prompt: "ABCD is a parallelogram. Prove that its opposite sides are equal.",
    steps: [["∠BAC = ∠DCA", "alternate angles, AB ∥ DC"], ["∠BCA = ∠DAC", "alternate angles, AD ∥ BC"], ["AC is common", "common side"], ["△ABC ≡ △CDA", "AAS"], ["∴ AB = CD and BC = DA", "matching sides of congruent triangles"]]
  }
];

function proveQuadrilateralPropertyQuestion() {
  const P = choice(QUAD_PROOFS);
  const lines = layout(P.steps.map(([s, r]) => [s, r || "from the line above"]));
  return q({ type: "prove-quadrilateral-property", marks: 4, prompt: P.prompt, diagram: geo(FIG[P.fig](P.figArg)), answer: lines.join("; "), working: lines, space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["quadrilaterals"] });
}

function proveIsoscelesPropertyQuestion() {
  const v = choice(["base-angles", "bisector"]);
  if (v === "base-angles") {
    const lines = ["Draw AD ⊥ BC", "∠ADB = ∠ADC = 90° (construction)", "AB = AC (given)", "AD is common", "△ABD ≡ △ACD (RHS)", "∴ ∠ABD = ∠ACD (matching angles of congruent triangles)"];
    return q({ type: "prove-isosceles-property", marks: 3, prompt: "In △ABC, AB = AC. By drawing AD perpendicular to BC, prove that ∠ABC = ∠ACB.", diagram: geo(FIG.isosceles()), answer: lines.join("; "), working: lines, space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["isosceles"] });
  }
  const cfg = FIG.isosceles(); cfg.angles = [];
  const lines = ["AB = AC (given)", "∠BAD = ∠CAD (given: AD bisects ∠BAC)", "AD is common", "△ABD ≡ △ACD (SAS)", "BD = DC and ∠ADB = ∠ADC (matching parts)", "∠ADB + ∠ADC = 180° (straight line), so each is 90°", "∴ AD is the perpendicular bisector of BC"];
  return q({ type: "prove-isosceles-property", marks: 4, prompt: "In △ABC, AB = AC and AD bisects ∠BAC, meeting BC at D. Prove that AD is perpendicular to BC and bisects it.", diagram: geo(cfg), answer: lines.join("; "), working: lines, space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["isosceles"] });
}

const REASONS = [
  "alternate angles, parallel lines", "corresponding angles, parallel lines", "vertically opposite angles", "common side",
  "matching sides of congruent triangles", "matching angles of congruent triangles", "base angles of an isosceles triangle", "angle sum of a triangle", "angles on a straight line"
];

function missingReasonQuestion() {
  const all = [...CONGRUENT, ...DEDUCE, ...QUAD_PROOFS];
  const P = choice(all);
  const idxs = P.steps.map((s, i) => i).filter(i => P.steps[i][1] && !/^given/.test(P.steps[i][1]) && !/^(SSS|SAS|AAS|RHS)$/.test(P.steps[i][1]));
  if (!idxs.length) return missingReasonQuestion();
  const k = choice(idxs);
  const rows = P.steps.map(([s, r], i) => [s, i === k ? "" : r || ""]);
  const correct = P.steps[k][1];
  return q({
    type: "missing-reason", marks: 1,
    prompt: `${P.prompt.replace(/\(a\).*$/, "").trim()} In the proof below, supply the missing reason.`,
    table: { headerRow: true, rows: [["Statement", "Reason"], ...rows] },
    diagram: geo(FIG[P.fig](P.figArg)),
    answer: correct,
    working: [],
    space: SPACE_SIZES.SMALL,
    mcDistractors: shuffle(REASONS.filter(r => !correct.startsWith(r.split(",")[0]))).slice(0, 3),
    tags: ["reasons"]
  });
}

const QPROPS = [
  ["The diagonals of a parallelogram bisect each other.", true], ["The diagonals of a parallelogram are equal.", false],
  ["The diagonals of a rectangle are equal.", true], ["The diagonals of a rhombus meet at right angles.", true],
  ["The diagonals of a rectangle meet at right angles.", false], ["A square is a special rhombus.", true],
  ["Every rhombus is a square.", false], ["The diagonals of a kite meet at right angles.", true],
  ["Both pairs of opposite angles of a kite are equal.", false], ["The diagonals of a rhombus bisect its angles.", true],
  ["A trapezium has two pairs of parallel sides.", false], ["The diagonals of a square are equal and meet at right angles.", true]
];

function quadrilateralPropertiesQuestion() {
  const [s, t] = choice(QPROPS);
  return q({ type: "quadrilateral-properties", marks: 1, prompt: `True or false? ${s}`, answer: t ? "True" : "False", working: [], space: SPACE_SIZES.SMALL, mcDistractors: [t ? "False" : "True"], tags: ["quadrilaterals"] });
}

const PTESTS = [
  ["Both pairs of opposite sides are equal.", true], ["Both pairs of opposite angles are equal.", true],
  ["One pair of opposite sides is equal and parallel.", true], ["The diagonals bisect each other.", true],
  ["The diagonals are equal.", false], ["One pair of opposite sides is parallel.", false],
  ["One pair of opposite sides is equal (the other pair unknown).", false], ["The diagonals meet at right angles.", false]
];

function parallelogramTestsQuestion() {
  const v = choice(["tf", "which"]);
  if (v === "tf") {
    const [s, t] = choice(PTESTS);
    return q({ type: "parallelogram-tests", marks: 1, prompt: `A quadrilateral has this property: "${s}" Is that enough to prove it is a parallelogram?`, answer: t ? "Yes" : "No", working: [t ? "This is one of the tests for a parallelogram." : "A quadrilateral that is not a parallelogram can also have this property (e.g. a kite or an isosceles trapezium)."], space: SPACE_SIZES.SMALL, mcDistractors: [t ? "No" : "Yes"], tags: ["parallelogram tests"] });
  }
  const good = choice(PTESTS.filter(p => p[1])); const bad = shuffle(PTESTS.filter(p => !p[1])).slice(0, 3);
  return q({ type: "parallelogram-tests", marks: 1, prompt: "Which property is enough, on its own, to prove that a quadrilateral is a parallelogram?", answer: good[0], working: [], space: SPACE_SIZES.SMALL, mcDistractors: bad.map(b => b[0]), tags: ["parallelogram tests"] });
}

const GENERATORS = {
  "prove-congruent": proveCongruentQuestion,
  "prove-then-deduce": proveThenDeduceQuestion,
  "prove-similar": proveSimilarQuestion,
  "prove-quadrilateral-property": proveQuadrilateralPropertyQuestion,
  "prove-isosceles-property": proveIsoscelesPropertyQuestion,
  "missing-reason": missingReasonQuestion,
  "quadrilateral-properties": quadrilateralPropertiesQuestion,
  "parallelogram-tests": parallelogramTestsQuestion
};

export function getGeometricalFiguresCQuestionTypes() { return TYPE_LIST; }
export function generateGeometricalFiguresCQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
