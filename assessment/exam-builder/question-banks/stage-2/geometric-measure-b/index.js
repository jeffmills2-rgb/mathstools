/*
  Mills Maths Tools — Stage 2 Question Bank: Position, Length and Angles B
  -------------------------------------------------------------------------
  question-banks/stage-2/geometric-measure-b/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Geometric measure B":
    MA2-GM-01  the eight compass points, routes and directions on maps
    MA2-GM-02  millimetres, kilometres, converting, perimeter
    MA2-GM-03  naming angles against the right angle and the straight angle

  Big ideas:
    - the eight compass points split a full turn into eight equal parts;
    - 10 mm = 1 cm, 100 cm = 1 m, 1000 m = 1 km — each unit is a "bundle" of
      the smaller one, just like place value;
    - perimeter is the distance around: add the sides (or use equal sides);
    - an angle is named by comparing it with a right angle (a quarter turn)
      and a straight angle (a half turn).
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Position, Length and Angles B";
const qMap = makeStage2(TOPIC, "MA2-GM-01");
const qLen = makeStage2(TOPIC, "MA2-GM-02");
const qAng = makeStage2(TOPIC, "MA2-GM-03");
const lenD = config => ({ engine: "length-engine", notToScale: true, config: { diagramType: "polygon", ...config } });

const TYPE_LIST = [
  { id: "compass-8", label: "The eight compass points" },
  { id: "map-direction-8", label: "Directions on a map (8 points)" },
  { id: "compass-turns", label: "Turning between compass points" },
  { id: "route-8", label: "Describe or follow a route" },
  { id: "ruler-mm", label: "Measure in centimetres and millimetres" },
  { id: "convert-length", label: "Convert mm, cm, m and km" },
  { id: "choose-unit-b", label: "Choose mm, cm, m or km" },
  { id: "perimeter-rectangle", label: "Perimeter of a rectangle" },
  { id: "perimeter-shape", label: "Perimeter of shapes with labelled sides" },
  { id: "same-perimeter", label: "Same perimeter, different shapes" },
  { id: "name-angle", label: "Acute, right, obtuse, straight or reflex" },
  { id: "order-angles", label: "Order angles by size" },
  { id: "angle-turn-link", label: "Angles as turns on a compass" }
];

const P8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const FULL = { N: "north", NE: "north-east", E: "east", SE: "south-east", S: "south", SW: "south-west", W: "west", NW: "north-west" };

function compass8Question() {
  const blanks = shuffle(P8.filter(p => p.length === 2)).slice(0, 2);
  return qMap({ type: "compass-8", marks: 2, prompt: "Fill in the two missing compass points.", diagram: mani({ diagramType: "compass", eight: true, labels: Object.fromEntries(blanks.map(b => [b, null])) }), answer: blanks.map(b => `${b} (${FULL[b]})`).join(", "), working: ["The in-between points join the two nearest main points: north or south comes first."], space: "none", mcEligible: false, tags: ["compass"] });
}

const PLACES = [
  { kind: "house", label: "Home" }, { kind: "school", label: "School" }, { kind: "shop", label: "Shop" },
  { kind: "park", label: "Park" }, { kind: "pool", label: "Pool" }, { kind: "tree", label: "Tree" },
  { kind: "tent", label: "Camp" }, { kind: "flag", label: "Flag" }, { kind: "star", label: "Star" }
];
function makeMap(n = 6) {
  const cols = 6; const rows = 5; const used = new Set();
  const icons = shuffle(PLACES.slice()).slice(0, n).map(p => { let c; let r; do { c = randInt(0, cols - 1); r = randInt(0, rows - 1); } while (used.has(`${c},${r}`)); used.add(`${c},${r}`); return { col: c, row: r, kind: p.kind, label: p.label }; });
  return { cols, rows, icons };
}
const ref = ic => `${String.fromCharCode(65 + ic.col)}${ic.row + 1}`;
const the = ic => `the ${ic.label.toLowerCase()}`;
const mapD = (m, extra = {}) => gridD({ cols: m.cols, rows: m.rows, map: true, icons: m.icons, north: true, ...extra });
function dirFrom(a, b) {
  const dx = Math.sign(b.col - a.col); const dy = Math.sign(b.row - a.row);
  return (dy < 0 ? "N" : dy > 0 ? "S" : "") + (dx > 0 ? "E" : dx < 0 ? "W" : "");
}

function mapDirection8Question() {
  for (let t = 0; t < 60; t++) {
    const m = makeMap(); const pairs = [];
    m.icons.forEach(a => m.icons.forEach(b => { if (a !== b && (a.col === b.col || a.row === b.row || Math.abs(a.col - b.col) === Math.abs(a.row - b.row))) pairs.push([a, b]); }));
    const diag = pairs.filter(([a, b]) => a.col !== b.col && a.row !== b.row);
    if (!diag.length) continue;
    const [a, b] = Math.random() < 0.7 ? choice(diag) : choice(pairs);
    const d = dirFrom(a, b);
    return qMap({ type: "map-direction-8", marks: 1, prompt: `Which direction is ${the(b)} from ${the(a)}?`, diagram: mapD(m), answer: FULL[d], working: ["Start at the first place and look towards the second.", "North is up the map."], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(P8.filter(p => p !== d)).slice(0, 3).map(p => FULL[p]), tags: ["compass", "map"] });
  }
  return compass8Question();
}

function compassTurnsQuestion() {
  const i = randInt(0, 7); const steps = choice([1, 2, 4, 6]); const cw = Math.random() < 0.5;
  const j = (i + (cw ? steps : 8 - steps)) % 8;
  const turn = { 1: "an eighth turn", 2: "a quarter turn", 4: "a half turn", 6: "a three-quarter turn" }[steps];
  return qMap({ type: "compass-turns", marks: 1, prompt: `You face ${FULL[P8[i]]}. You make ${turn} ${cw ? "clockwise" : "anticlockwise"}. Which way do you face now?`, diagram: mani({ diagramType: "compass", eight: true }), answer: FULL[P8[j]], working: [`${turn[0].toUpperCase()}${turn.slice(1)} moves ${steps} point${steps > 1 ? "s" : ""} around the eight-point compass.`], space: SPACE_SIZES.SMALL, mcDistractors: [FULL[P8[(i + (cw ? 8 - steps : steps)) % 8]], FULL[P8[(j + 1) % 8]], FULL[P8[(j + 7) % 8]]], tags: ["compass", "turns"] });
}

function route8Question() {
  const m = makeMap(); const [a, b] = shuffle(m.icons.slice()).slice(0, 2);
  const dx = b.col - a.col; const dy = b.row - a.row;
  if (!dx || !dy) return route8Question();
  const path = [[a.col + 0.5, a.row + 0.5], [a.col + 0.5, b.row + 0.5], [b.col + 0.5, b.row + 0.5]];
  const ns = `${Math.abs(dy)} square${Math.abs(dy) > 1 ? "s" : ""} ${dy > 0 ? "south" : "north"}`;
  const ew = `${Math.abs(dx)} square${Math.abs(dx) > 1 ? "s" : ""} ${dx > 0 ? "east" : "west"}`;
  return qMap({ type: "route-8", marks: 2, prompt: `Describe the red path from ${the(a)} (${ref(a)}) to ${the(b)}. Give the grid reference where it ends.`, diagram: mapD(m, { path }), answer: `Go ${ns}, then ${ew}. It ends at ${ref(b)}.`, working: ["Name each direction and count the squares."], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["route", "map"] });
}

/* ── length ──────────────────────────────────────────── */
function rulerMmQuestion() {
  const ob = choice(["pencil", "crayon", "ribbon", "key"]); const from = choice([0, 0, 1, 2]);
  const lenMm = randInt(25, 75); const to = from + lenMm / 10;
  if (lenMm % 10 === 0) return rulerMmQuestion();
  const cm = Math.floor(lenMm / 10); const mm = lenMm % 10;
  return qLen({ type: "ruler-mm", marks: 1, prompt: `How long is the ${ob}? Write it in millimetres, and in centimetres and millimetres.`, diagram: mani({ diagramType: "ruler", cm: Math.max(8, Math.ceil(to) + 1), from, to, object: ob, mm: true }), answer: `${lenMm} mm = ${cm} cm ${mm} mm`, working: [from ? `It starts at ${from} cm, so count from there.` : "It starts at 0.", `${cm} whole centimetres and ${mm} small marks: ${lenMm} mm`], space: SPACE_SIZES.SMALL, mcDistractors: [`${lenMm + 10} mm = ${cm + 1} cm ${mm} mm`, `${cm * 10 + (10 - mm)} mm = ${cm} cm ${10 - mm} mm`, `${lenMm + from * 10} mm = ${cm + from} cm ${mm} mm`].filter(s => !s.startsWith(`${lenMm} mm`)), tags: ["ruler", "millimetres"] });
}

function convertLengthQuestion() {
  const v = choice(["cm-mm", "mm-cm", "m-cm", "km-m", "m-km", "cm-m-mixed"]);
  if (v === "cm-mm") { const c = randInt(2, 30); return qLen({ type: "convert-length", marks: 1, prompt: `${c} cm = ☐ mm`, answer: `${c * 10} mm`, working: ["1 cm = 10 mm", `${c} × 10 = ${c * 10}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${c * 100} mm`, `${c} mm`, `${c + 10} mm`], tags: ["convert"] }); }
  if (v === "mm-cm") { const c = randInt(2, 30); return qLen({ type: "convert-length", marks: 1, prompt: `${c * 10} mm = ☐ cm`, answer: `${c} cm`, working: ["10 mm = 1 cm", `${c * 10} ÷ 10 = ${c}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${c * 100} cm`, `${c * 10} cm`, `${c / 10} cm`], tags: ["convert"] }); }
  if (v === "m-cm") { const m = randInt(2, 12); return qLen({ type: "convert-length", marks: 1, prompt: `${m} m = ☐ cm`, answer: `${m * 100} cm`, working: ["1 m = 100 cm"], space: SPACE_SIZES.SMALL, mcDistractors: [`${m * 10} cm`, `${m * 1000} cm`, `${m} cm`], tags: ["convert"] }); }
  if (v === "km-m") { const k = randInt(2, 9); return qLen({ type: "convert-length", marks: 1, prompt: `${k} km = ☐ m`, answer: `${k * 1000} m`, working: ["1 km = 1000 m"], space: SPACE_SIZES.SMALL, mcDistractors: [`${k * 100} m`, `${k * 10} m`, `${k * 10000} m`], tags: ["convert", "kilometres"] }); }
  if (v === "m-km") return qLen({ type: "convert-length", marks: 1, prompt: "How many metres make half a kilometre?", answer: "500 m", working: ["1 km = 1000 m; half of 1000 is 500."], space: SPACE_SIZES.SMALL, mcDistractors: ["50 m", "5000 m", "250 m"], tags: ["convert", "kilometres"] });
  const m = randInt(1, 3); const c = randInt(5, 95);
  return qLen({ type: "convert-length", marks: 1, prompt: `Write ${m * 100 + c} cm in metres and centimetres.`, answer: `${m} m ${c} cm`, working: [`${m * 100} cm = ${m} m, with ${c} cm left.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${m * 10} m ${c} cm`, `${m} m ${c + 100} cm`, `${m + 1} m ${c} cm`], tags: ["convert"] });
}

function chooseUnitBQuestion() {
  const T = [["the thickness of a coin", "mm"], ["the length of an ant", "mm"], ["the width of your book", "cm"], ["the height of a chair", "cm"], ["the length of a netball court", "m"], ["the height of a tree", "m"], ["the distance from Sydney to Newcastle", "km"], ["a long bike ride", "km"]];
  const [t, u] = choice(T); const names = { mm: "millimetres (mm)", cm: "centimetres (cm)", m: "metres (m)", km: "kilometres (km)" };
  return qLen({ type: "choose-unit-b", marks: 1, prompt: `Which unit would you use to measure ${t}?`, answer: names[u], working: ["mm for very small, cm for small, m for large, km for long distances."], space: SPACE_SIZES.SMALL, mcDistractors: Object.values(names).filter(n => n !== names[u]), tags: ["units"] });
}

function perimeterRectangleQuestion() {
  const unit = choice(["cm", "m"]); const l = randInt(4, 15); let w = randInt(2, 10); if (w === l) w += 1;
  return qLen({ type: "perimeter-rectangle", marks: 2, prompt: "What is the perimeter of this rectangle?", diagram: lenD({ shape: "rectangle", labels: { bottom: `${l} ${unit}`, right: `${w} ${unit}` } }), answer: `${2 * (l + w)} ${unit}`, working: ["Opposite sides of a rectangle are equal.", `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)} ${unit}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${l + w} ${unit}`, `${l * w} ${unit}`, `${2 * l + w} ${unit}`], tags: ["perimeter"] });
}

function perimeterShapeQuestion() {
  const unit = choice(["cm", "m"]);
  if (Math.random() < 0.5) {
    const shape = choice([["square", 4], ["regular-pentagon", 5], ["regular-hexagon", 6], ["equilateral-triangle", 3]]); const s = randInt(3, 12);
    return qLen({ type: "perimeter-shape", marks: 1, prompt: `All the sides are equal. What is the perimeter?`, diagram: lenD({ shape: shape[0], labels: { bottom: `${s} ${unit}` } }), answer: `${shape[1] * s} ${unit}`, working: [`${shape[1]} equal sides: ${shape[1]} × ${s} = ${shape[1] * s} ${unit}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${s * 4 === shape[1] * s ? s * 5 : s * 4} ${unit}`, `${s + shape[1]} ${unit}`, `${(shape[1] - 1) * s} ${unit}`], tags: ["perimeter"] });
  }
  const a = randInt(4, 12); const b = randInt(4, 12); const c = randInt(Math.abs(a - b) + 2, a + b - 2);
  return qLen({ type: "perimeter-shape", marks: 1, prompt: "What is the perimeter of this triangle?", diagram: lenD({ shape: "triangle", labels: { bottom: `${a} ${unit}`, right: `${b} ${unit}`, left: `${c} ${unit}` } }), answer: `${a + b + c} ${unit}`, working: [`${a} + ${b} + ${c} = ${a + b + c} ${unit}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${a + b} ${unit}`, `${a + b + c + 1} ${unit}`, `${a * b} ${unit}`], tags: ["perimeter"] });
}

function samePerimeterQuestion() {
  const pairs = [[[3, 2], [4, 1]], [[4, 2], [5, 1]], [[3, 3], [4, 2]], [[4, 3], [5, 2]], [[6, 1], [4, 3]], [[5, 3], [6, 2]]];
  const [[w1, h1], [w2, h2]] = choice(pairs);
  const pts = (x, w, h) => [[x, 1], [x + w, 1], [x + w, 1 + h], [x, 1 + h]];
  return qLen({ type: "same-perimeter", marks: 2, prompt: "Each square side is 1 cm. Find the perimeter of A and of B. What do you notice?", diagram: gridD({ cols: w1 + w2 + 3, rows: Math.max(h1, h2) + 2, shapes: [{ pts: pts(1, w1, h1), label: "A" }, { pts: pts(w1 + 2, w2, h2), label: "B" }] }), answer: `A = ${2 * (w1 + h1)} cm, B = ${2 * (w2 + h2)} cm. They have the same perimeter but different shapes.`, working: [`A: ${w1} + ${h1} + ${w1} + ${h1} = ${2 * (w1 + h1)}`, `B: ${w2} + ${h2} + ${w2} + ${h2} = ${2 * (w2 + h2)}`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["perimeter"] });
}

/* ── angles ──────────────────────────────────────────── */
const KINDS = [["acute", [30, 45, 60, 70]], ["right", [90]], ["obtuse", [110, 120, 135, 150]], ["straight", [180]], ["reflex", [220, 250, 270, 300]]];
const nameOf = d => (d < 90 ? "acute" : d === 90 ? "right" : d < 180 ? "obtuse" : d === 180 ? "straight" : "reflex");

function nameAngleQuestion() {
  if (Math.random() < 0.6) {
    const [k, list] = choice(KINDS); const deg = choice(list);
    return qAng({ type: "name-angle", marks: 1, prompt: "Name this type of angle: acute, right, obtuse, straight or reflex.", diagram: mani({ diagramType: "angles", items: [{ deg, rotate: choice([0, 10, -20, 30]) }] }), answer: k, working: [{ acute: "Smaller than a right angle.", right: "A square corner — a quarter turn.", obtuse: "Bigger than a right angle, smaller than a straight angle.", straight: "A half turn — the arms make a straight line.", reflex: "Bigger than a straight angle." }[k]], space: SPACE_SIZES.SMALL, mcDistractors: KINDS.map(x => x[0]).filter(x => x !== k).slice(0, 3), tags: ["classify angles"] });
  }
  const picks = shuffle(KINDS.slice()).slice(0, 3).map(([, l]) => choice(l)); const letters = ["A", "B", "C"];
  const target = choice(picks.map(nameOf));
  const ans = letters[picks.findIndex(d => nameOf(d) === target)];
  return qAng({ type: "name-angle", marks: 1, prompt: `Which angle is ${target === "acute" || target === "obtuse" ? "an" : "a"} ${target} angle?`, diagram: mani({ diagramType: "angles", items: picks.map((deg, i) => ({ deg, label: letters[i], rotate: randInt(-15, 15) })) }), answer: ans, working: [`${ans} is ${target}.`], space: SPACE_SIZES.SMALL, mcDistractors: letters.filter(l => l !== ans), tags: ["classify angles"] });
}

function orderAnglesQuestion() {
  const degs = shuffle([choice([25, 35]), choice([70, 80]), choice([115, 125]), choice([160, 170])]).slice(0, 3); const letters = ["A", "B", "C"];
  const order = degs.map((d, i) => [d, letters[i]]).sort((a, b) => a[0] - b[0]).map(x => x[1]).join(", ");
  return qAng({ type: "order-angles", marks: 1, prompt: "Order the angles from smallest to largest.", diagram: mani({ diagramType: "angles", items: degs.map((deg, i) => ({ deg, label: letters[i], rotate: randInt(-25, 25) })) }), answer: order, working: ["Compare the turn between the arms; use a right angle as a checker."], space: SPACE_SIZES.SMALL, mcDistractors: [order.split(", ").reverse().join(", "), "A, B, C", "C, A, B"].filter(x => x !== order), tags: ["compare angles"] });
}

function angleTurnLinkQuestion() {
  const i = choice([0, 2, 4, 6]); const steps = choice([2, 4, 6]);
  const j = (i + steps) % 8; const k = { 2: "right", 4: "straight", 6: "reflex" }[steps];
  return qAng({ type: "angle-turn-link", marks: 1, prompt: `You turn clockwise from ${FULL[P8[i]]} to ${FULL[P8[j]]}. What type of angle have you turned through?`, diagram: mani({ diagramType: "compass", eight: true }), answer: `${k} angle`, working: [{ right: "A quarter turn is a right angle.", straight: "A half turn is a straight angle.", reflex: "A three-quarter turn is bigger than a straight angle, so it is reflex." }[k]], space: SPACE_SIZES.SMALL, mcDistractors: ["acute angle", "right angle", "straight angle", "reflex angle"].filter(x => x !== `${k} angle`).slice(0, 3), tags: ["turns", "classify angles"] });
}

const GENERATORS = {
  "compass-8": compass8Question,
  "map-direction-8": mapDirection8Question,
  "compass-turns": compassTurnsQuestion,
  "route-8": route8Question,
  "ruler-mm": rulerMmQuestion,
  "convert-length": convertLengthQuestion,
  "choose-unit-b": chooseUnitBQuestion,
  "perimeter-rectangle": perimeterRectangleQuestion,
  "perimeter-shape": perimeterShapeQuestion,
  "same-perimeter": samePerimeterQuestion,
  "name-angle": nameAngleQuestion,
  "order-angles": orderAnglesQuestion,
  "angle-turn-link": angleTurnLinkQuestion
};

export function getGeometricMeasureBQuestionTypes() { return TYPE_LIST; }
export function generateGeometricMeasureBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
