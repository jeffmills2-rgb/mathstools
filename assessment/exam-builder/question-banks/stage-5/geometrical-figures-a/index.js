/*
  Mills Maths Tools — Stage 5 Question Bank: Properties of Geometrical Figures A
  -------------------------------------------------------------------------------
  question-banks/stage-5/geometrical-figures-a/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-GEO-C-01 (Core):
    identifies similar figures and uses the enlargement (scale) factor to
    solve problems, including scale drawings.

  Content:
    - similar figures: matching angles are equal, matching sides are in the
      same ratio; finding the scale factor
    - unknown sides from the scale factor (enlargements and reductions),
      including nested triangles with a parallel side
    - deciding whether two figures are similar
    - scale drawings and maps: scale as a ratio, real ↔ drawn lengths,
      finding the scale
    - practical problems with similar triangles (shadows, heights)
    - area and volume of similar figures (k² and k³)

  Figures: geometry engine, with `localLabels` so each of a pair of similar
  triangles labels its own sides. The drawing is to scale.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, fmt, spaced
} from "../../_shared/bank-helpers.js";

const TOPIC = "Properties of Geometrical Figures A";

const TYPE_LIST = [
  { id: "scale-factor", label: "Find the scale factor" },
  { id: "similar-unknown-side", label: "Find an unknown side in similar figures" },
  { id: "similar-two-sides", label: "Find two unknown sides" },
  { id: "similar-angles", label: "Matching angles in similar figures" },
  { id: "are-they-similar", label: "Are the figures similar?" },
  { id: "nested-triangles", label: "Similar triangles with a parallel side" },
  { id: "map-scale-real", label: "Scale drawings: find the real length" },
  { id: "map-scale-drawn", label: "Scale drawings: find the drawn length" },
  { id: "find-the-scale", label: "Find the scale of a drawing" },
  { id: "shadow-problems", label: "Shadows and heights" },
  { id: "similar-area-volume", label: "Areas and volumes of similar figures" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "similarity", ...(spec.tags || [])] });
const geo = config => ({ engine: "geometry-engine", config });
const n2 = v => fmt(v, 2);

/* Triangle ABC from side lengths a = BC, b = CA, c = AB (y down). */
function triPts(a, b, c, S, ox = 0, oy = 0) {
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return [[ox, oy], [ox + c * S, oy], [ox + x * S, oy - y * S]];
}
const TRIS = [[5, 6, 7], [4, 5, 6], [6, 7, 8], [3, 4, 5], [5, 7, 8], [4, 6, 7], [6, 8, 9]];

function similarPair(opts = {}) {
  const base = choice(TRIS); const m = choice([1, 2, 3]);
  const s = shuffle(base).map(v => v * m);
  const k = opts.k || choice([1.5, 2, 3, 2.5]);
  const t = s.map(v => v * k);
  const S = 110 / Math.max(...s);
  const P1 = triPts(s[0], s[1], s[2], S, 0, 0);
  const P2 = triPts(t[0], t[1], t[2], S, Math.max(...P1.map(p => p[0])) + 70, 0);
  return { s, t, k, P1, P2 };
}
function pairDiagram(pair, labels1, labels2, names = ["A", "B", "C", "P", "Q", "R"]) {
  const pts = {};
  [...pair.P1, ...pair.P2].forEach((p, i) => { pts[names[i]] = p; });
  const sl = [];
  const side = (i, n) => [[n[1], n[2]], [n[2], n[0]], [n[0], n[1]]][i];
  labels1.forEach((t, i) => { if (t !== undefined) { const [f, to] = side(i, names.slice(0, 3)); sl.push({ from: f, to, text: t }); } });
  labels2.forEach((t, i) => { if (t !== undefined) { const [f, to] = side(i, names.slice(3)); sl.push({ from: f, to, text: t }); } });
  return geo({ points: pts, polygons: [{ pts: names.slice(0, 3) }, { pts: names.slice(3) }], sideLabels: sl, localLabels: true });
}

function scaleFactorQuestion() {
  const pair = similarPair();
  const i = randInt(0, 2);
  return q({
    type: "scale-factor", marks: 1,
    prompt: "Triangle PQR is an enlargement of triangle ABC. Find the scale factor.",
    diagram: pairDiagram(pair, pair.s.map((v, j) => (j === i || j === (i + 1) % 3 ? String(v) : undefined)), pair.t.map((v, j) => (j === i || j === (i + 1) % 3 ? n2(v) : undefined))),
    answer: n2(pair.k),
    working: [`Matching sides: ${n2(pair.t[i])} ÷ ${pair.s[i]} = ${n2(pair.k)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [n2(1 / pair.k), n2(pair.t[i] - pair.s[i]), n2(pair.k + 1)],
    tags: ["scale factor"]
  });
}

function similarUnknownSideQuestion() {
  const reverse = Math.random() < 0.35;
  const pair = similarPair();
  const i = randInt(0, 2); const j = (i + 1) % 3;
  if (!reverse) {
    return q({
      type: "similar-unknown-side", marks: 2,
      prompt: "The triangles are similar. Find the value of x.",
      diagram: pairDiagram(pair, pair.s.map((v, m) => (m === i || m === j ? String(v) : undefined)), pair.t.map((v, m) => (m === i ? n2(v) : m === j ? "x" : undefined))),
      answer: `x = ${n2(pair.t[j])}`,
      working: [`k = ${n2(pair.t[i])} ÷ ${pair.s[i]} = ${n2(pair.k)}`, `x = ${pair.s[j]} × ${n2(pair.k)} = ${n2(pair.t[j])}`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [`x = ${n2(pair.s[j] / pair.k)}`, `x = ${n2(pair.s[j] + pair.t[i] - pair.s[i])}`, `x = ${n2(pair.t[i] * pair.s[i] / pair.s[j])}`],
      tags: ["unknown side"]
    });
  }
  return q({
    type: "similar-unknown-side", marks: 2,
    prompt: "The triangles are similar. Find the value of y.",
    diagram: pairDiagram(pair, pair.s.map((v, m) => (m === i ? String(v) : m === j ? "y" : undefined)), pair.t.map((v, m) => (m === i || m === j ? n2(v) : undefined))),
    answer: `y = ${n2(pair.s[j])}`,
    working: [`k = ${n2(pair.t[i])} ÷ ${pair.s[i]} = ${n2(pair.k)}`, `y = ${n2(pair.t[j])} ÷ ${n2(pair.k)} = ${n2(pair.s[j])}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`y = ${n2(pair.t[j] * pair.k)}`, `y = ${n2(pair.t[j] - (pair.t[i] - pair.s[i]))}`],
    tags: ["unknown side", "reduction"]
  });
}

function similarTwoSidesQuestion() {
  const pair = similarPair();
  return q({
    type: "similar-two-sides", marks: 3,
    prompt: "Triangle ABC ||| triangle PQR. Find the values of x and y.",
    diagram: pairDiagram(pair, [String(pair.s[0]), "x", String(pair.s[2])], [n2(pair.t[0]), n2(pair.t[1]), "y"]),
    answer: `x = ${n2(pair.s[1])}, y = ${n2(pair.t[2])}`,
    working: [`k = ${n2(pair.t[0])} ÷ ${pair.s[0]} = ${n2(pair.k)}`, `x = ${n2(pair.t[1])} ÷ ${n2(pair.k)} = ${n2(pair.s[1])}`, `y = ${pair.s[2]} × ${n2(pair.k)} = ${n2(pair.t[2])}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`x = ${n2(pair.t[1] * pair.k)}, y = ${n2(pair.s[2] / pair.k)}`],
    tags: ["unknown side"]
  });
}

function similarAnglesQuestion() {
  const pair = similarPair({ k: choice([1.5, 2]) });
  const angle = (a, b, c) => Math.round(Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI);
  const A = angle(pair.s[0], pair.s[1], pair.s[2]); const B = angle(pair.s[1], pair.s[2], pair.s[0]); const C = 180 - A - B;
  const cfg = pairDiagram(pair, [String(pair.s[0]), undefined, undefined], [n2(pair.t[0]), undefined, undefined]).config;
  cfg.angles = [{ at: "P", from: "Q", to: "R", label: `${A}°` }, { at: "Q", from: "R", to: "P", label: `${B}°` }, { at: "C", from: "A", to: "B", label: "θ" }];
  return q({
    type: "similar-angles", marks: 1,
    prompt: "Triangle PQR is an enlargement of triangle ABC. Find θ, and explain why enlarging does not change the angles.",
    diagram: geo(cfg),
    answer: `θ = ${C}°`,
    working: [`∠R = 180° − ${A}° − ${B}° = ${C}°`, "θ = ∠C matches ∠R. Matching angles in similar figures are equal: enlarging changes lengths, not angles."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`θ = ${Math.round(C * pair.k)}°`, `θ = ${A}°`, `θ = ${B}°`],
    tags: ["angles"]
  });
}

function areTheySimilarQuestion() {
  const v = choice(["rect", "tri"]);
  if (v === "rect") {
    const a = randInt(3, 9); const b = a + randInt(1, 6); const k = choice([1.5, 2, 3]);
    const yes = Math.random() < 0.5;
    const c = a * k; const d = yes ? b * k : b * k + choice([-2, -1, 1, 2]);
    return q({ type: "are-they-similar", marks: 2, prompt: `Is a ${a} cm × ${b} cm rectangle similar to a ${n2(c)} cm × ${n2(d)} cm rectangle? Justify your answer.`, answer: yes ? `Yes: both ratios of matching sides are ${n2(k)} (${n2(c)} ÷ ${a} = ${n2(d)} ÷ ${b}).` : `No: ${n2(c)} ÷ ${a} = ${n2(k)} but ${n2(d)} ÷ ${b} = ${n2(d / b)}.`, working: [`${n2(c)} ÷ ${a} = ${n2(c / a)}`, `${n2(d)} ÷ ${b} = ${n2(d / b)}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["test"] });
  }
  const base = choice(TRIS); const k = choice([2, 3, 1.5]); const yes = Math.random() < 0.5;
  const t = base.map(x => x * k); if (!yes) t[2] += choice([-1, 1]);
  return q({ type: "are-they-similar", marks: 2, prompt: `A triangle has sides ${base.join(", ")} cm. Another has sides ${t.map(n2).join(", ")} cm. Are they similar? Justify.`, answer: yes ? `Yes: every pair of matching sides has ratio ${n2(k)}.` : `No: the ratios are ${t.map((x, i) => n2(x / base[i])).join(", ")}, which are not all equal.`, working: t.map((x, i) => `${n2(x)} ÷ ${base[i]} = ${n2(x / base[i])}`), space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["test"] });
}

function nestedTrianglesQuestion() {
  // Big triangle ABC, D on AB, E on AC with DE ∥ BC.
  const AB = choice([6, 8, 9, 10, 12]); const f = choice([1 / 3, 1 / 2, 2 / 3, 1 / 4, 3 / 4].filter(t => Number.isInteger(AB * t)));
  const AD = AB * f; const BC = choice([6, 9, 12, 15, 8]); const DE = BC * f;
  const S = 22;
  const A = [0, -8 * S * 0.9]; const B = [-4 * S, 0]; const C = [5 * S, 0];
  const D = [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]; const E = [A[0] + (C[0] - A[0]) * f, A[1] + (C[1] - A[1]) * f];
  const askBC = Math.random() < 0.5;
  return q({
    type: "nested-triangles", marks: 3,
    prompt: `DE ∥ BC. AD = ${AD} cm, AB = ${AB} cm and ${askBC ? `DE = ${n2(DE)} cm. Find BC.` : `BC = ${BC} cm. Find DE.`}`,
    diagram: geo({ points: { A, B, C, D, E }, polygons: [{ pts: ["A", "B", "C"] }], segments: [{ from: "D", to: "E" }], parallel: [{ from: "D", to: "E" }, { from: "B", to: "C" }], sideLabels: [{ from: "A", to: "D", text: `${AD}` }, { from: "D", to: "E", text: askBC ? n2(DE) : "x", flip: true }, { from: "B", to: "C", text: askBC ? "x" : String(BC) }], labelOffsets: { D: [-20, 0], E: [20, 0] } }),
    answer: askBC ? `BC = ${n2(BC)} cm` : `DE = ${n2(DE)} cm`,
    working: ["△ADE ||| △ABC (equiangular: corresponding angles on parallel lines, and ∠A common)", `Scale factor AB ÷ AD = ${AB} ÷ ${AD} = ${n2(AB / AD)}`, askBC ? `BC = ${n2(DE)} × ${n2(AB / AD)} = ${n2(BC)}` : `DE = ${BC} ÷ ${n2(AB / AD)} = ${n2(DE)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: askBC ? [`BC = ${n2(DE * AD / AB)} cm`, `BC = ${n2(DE * AB / (AB - AD))} cm`, `BC = ${n2(DE + AB - AD)} cm`] : [`DE = ${n2(BC * AB / AD)} cm`, `DE = ${n2(BC * (AB - AD) / AB)} cm`, `DE = ${n2(Math.abs(BC - (AB - AD)))} cm`],
    tags: ["parallel", "nested"]
  });
}

const SCALES = [100, 200, 500, 1000, 2500, 20000, 25000, 50000, 100000];
function realText(cm) {
  if (cm >= 100000) return `${n2(cm / 100000)} km`;
  if (cm >= 100) return `${n2(cm / 100)} m`;
  return `${n2(cm)} cm`;
}

function mapScaleRealQuestion() {
  const s = choice(SCALES); const d = choice([1.5, 2, 2.5, 3, 4, 4.5, 6, 7.2, 8]);
  const real = d * s;
  return q({
    type: "map-scale-real", marks: 2,
    prompt: `A ${s >= 20000 ? "map" : "plan"} has a scale of 1 : ${spaced(s)}. Two points are ${d} cm apart on the ${s >= 20000 ? "map" : "plan"}. Find the real distance in ${s >= 20000 ? "kilometres" : "metres"}.`,
    answer: realText(real),
    working: [`${d} × ${spaced(s)} = ${spaced(real)} cm`, `= ${realText(real)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [realText(real * 10), realText(real / 10), realText(real / 1000 * 100)],
    tags: ["scale drawing"]
  });
}

function mapScaleDrawnQuestion() {
  const s = choice([100, 200, 500, 50000, 25000, 100000]);
  const drawn = choice([2, 3, 4, 5, 6, 7.5, 12]);
  const realCm = drawn * s;
  return q({
    type: "map-scale-drawn", marks: 2,
    prompt: `A scale drawing uses a scale of 1 : ${spaced(s)}. A real distance of ${realText(realCm)} is drawn. How long is it on the drawing?`,
    answer: `${n2(drawn)} cm`,
    working: [`${realText(realCm)} = ${spaced(realCm)} cm`, `${spaced(realCm)} ÷ ${spaced(s)} = ${n2(drawn)} cm`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${n2(drawn * 10)} cm`, `${n2(drawn / 10)} cm`, `${n2(drawn * 100)} cm`],
    tags: ["scale drawing"]
  });
}

function findTheScaleQuestion() {
  const s = choice([50, 100, 200, 250, 500, 1000, 5000]); const drawn = choice([2, 4, 5, 8, 10]);
  const real = drawn * s;
  return q({
    type: "find-the-scale", marks: 2,
    prompt: `On a scale drawing, a wall ${realText(real)} long is drawn ${drawn} cm long. Write the scale as a ratio 1 : n.`,
    answer: `1 : ${spaced(s)}`,
    working: [`${realText(real)} = ${spaced(real)} cm`, `${drawn} : ${spaced(real)} = 1 : ${spaced(s)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`1 : ${spaced(real)}`, `1 : ${spaced(s * 10)}`, `${drawn} : ${spaced(real / 100)}`],
    tags: ["scale drawing"]
  });
}

function shadowProblemsQuestion() {
  const p = choice([1.5, 1.6, 1.8, 2]); const ps = choice([1.2, 2, 2.4, 3]);
  const ts = choice([8, 10, 12, 15, 18]); const T = p * ts / ps;
  const S = 12;
  const pts = { A: [0, 0], B: [ts * S, 0], T: [0, -T * S], _p: [ (ts - ps) * S, 0], _q: [(ts - ps) * S, -p * S] };
  return q({
    type: "shadow-problems", marks: 3,
    prompt: `A person ${p} m tall casts a shadow ${ps} m long. At the same time, a tree casts a shadow ${ts} m long. How tall is the tree?`,
    diagram: geo({ points: pts, polygons: [{ pts: ["A", "B", "T"], fill: "#eef4fc" }], segments: [{ from: "_p", to: "_q", width: 4 }], sideLabels: [{ from: "A", to: "B", text: `${ts} m` }, { from: "A", to: "T", text: "h" }], angles: [{ at: "A", from: "B", to: "T", right: true }], vertexLabels: false, texts: [{ x: (ts - ps) * S, y: -p * S - 16, text: `${p} m` }] }),
    answer: `${n2(T)} m`,
    working: ["The sun's rays make equal angles, so the triangles are similar.", `h ÷ ${p} = ${ts} ÷ ${ps}`, `h = ${p} × ${n2(ts / ps)} = ${n2(T)} m`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${n2(ps * ts / p)} m`, `${n2(p + ts - ps)} m`],
    tags: ["practical", "shadows"]
  });
}

function similarAreaVolumeQuestion() {
  const k = choice([2, 3, 1.5, 4]);
  const v = choice(["area", "volume", "find-k"]);
  if (v === "area") { const A = choice([12, 20, 25, 36, 48]); return q({ type: "similar-area-volume", marks: 2, prompt: `Two similar shapes have matching sides in the ratio 1 : ${n2(k)}. The smaller has an area of ${A} cm². Find the area of the larger.`, answer: `${n2(A * k * k)} cm²`, working: [`Areas scale by k² = ${n2(k * k)}`, `${A} × ${n2(k * k)} = ${n2(A * k * k)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${n2(A * k)} cm²`, `${n2(A * k ** 3)} cm²`], tags: ["area"] }); }
  if (v === "volume") { const V = choice([10, 24, 40, 100]); return q({ type: "similar-area-volume", marks: 2, prompt: `Two similar containers have heights in the ratio 1 : ${n2(k)}. The smaller holds ${V} mL. How much does the larger hold?`, answer: `${n2(V * k ** 3)} mL`, working: [`Volumes scale by k³ = ${n2(k ** 3)}`, `${V} × ${n2(k ** 3)} = ${n2(V * k ** 3)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${n2(V * k)} mL`, `${n2(V * k * k)} mL`], tags: ["volume"] }); }
  const kk = choice([2, 3, 4, 5]); const A1 = choice([5, 8, 10]);
  return q({ type: "similar-area-volume", marks: 2, prompt: `Two similar triangles have areas ${A1} cm² and ${A1 * kk * kk} cm². What is the ratio of their matching sides?`, answer: `1 : ${kk}`, working: [`Area ratio 1 : ${kk * kk} = 1 : k²`, `k = √${kk * kk} = ${kk}`], space: SPACE_SIZES.SMALL, mcDistractors: [`1 : ${kk * kk}`, `1 : ${kk * kk / 2}`], tags: ["area"] });
}

const GENERATORS = {
  "scale-factor": scaleFactorQuestion,
  "similar-unknown-side": similarUnknownSideQuestion,
  "similar-two-sides": similarTwoSidesQuestion,
  "similar-angles": similarAnglesQuestion,
  "are-they-similar": areTheySimilarQuestion,
  "nested-triangles": nestedTrianglesQuestion,
  "map-scale-real": mapScaleRealQuestion,
  "map-scale-drawn": mapScaleDrawnQuestion,
  "find-the-scale": findTheScaleQuestion,
  "shadow-problems": shadowProblemsQuestion,
  "similar-area-volume": similarAreaVolumeQuestion
};

export function getGeometricalFiguresAQuestionTypes() { return TYPE_LIST; }
export function generateGeometricalFiguresAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
