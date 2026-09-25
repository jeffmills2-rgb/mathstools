/*
  Mills Maths Tools — Stage 2 Question Bank: Position, Length and Angles A
  -------------------------------------------------------------------------
  question-banks/stage-2/geometric-measure-a/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Geometric measure A":
    MA2-GM-01  grid maps, directions and position
    MA2-GM-02  length — metres and centimetres
    MA2-GM-03  angles as turns, compared with a right angle

  Big ideas:
    - a grid reference names a SQUARE (letter across, number down);
    - north, east, south and west are fixed directions on a map;
    - to measure length we line the start of the object up with zero, or
      count the centimetre SPACES between two marks (not the marks);
    - an angle is an amount of turn; a right angle is a quarter turn and is
      the benchmark for "smaller" and "bigger".
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Position, Length and Angles A";
const qMap = makeStage2(TOPIC, "MA2-GM-01");
const qLen = makeStage2(TOPIC, "MA2-GM-02");
const qAng = makeStage2(TOPIC, "MA2-GM-03");

const TYPE_LIST = [
  { id: "grid-map-read", label: "What is at this grid reference?" },
  { id: "grid-map-give", label: "Give the grid reference" },
  { id: "compass-4", label: "North, east, south and west" },
  { id: "map-direction", label: "Which direction? (map)" },
  { id: "follow-route", label: "Follow a route on a grid map" },
  { id: "ruler-from-zero", label: "Measure with a ruler" },
  { id: "ruler-not-zero", label: "Measure when the object does not start at 0" },
  { id: "compare-lengths", label: "How much longer?" },
  { id: "metres-centimetres", label: "Metres and centimetres" },
  { id: "choose-length-unit", label: "Choose cm or m" },
  { id: "perimeter-grid", label: "Perimeter by counting on a grid" },
  { id: "right-angle-compare", label: "Smaller than, equal to or bigger than a right angle" },
  { id: "bigger-angle", label: "Which angle is bigger?" },
  { id: "turns", label: "Quarter, half and full turns" },
  { id: "right-angles-in-shapes", label: "Right angles in shapes" }
];

/* ── grid maps ───────────────────────────────────────── */
const PLACES = [
  { kind: "house", label: "Home" }, { kind: "school", label: "School" }, { kind: "shop", label: "Shop" },
  { kind: "park", label: "Park" }, { kind: "pool", label: "Pool" }, { kind: "tree", label: "Tree" },
  { kind: "tent", label: "Camp" }, { kind: "flag", label: "Flag" }, { kind: "star", label: "Star" }
];
function makeMap(n = 5) {
  const cols = choice([5, 6]); const rows = choice([4, 5]);
  const used = new Set();
  const icons = shuffle(PLACES.slice()).slice(0, n).map(p => {
    let c; let r; do { c = randInt(0, cols - 1); r = randInt(0, rows - 1); } while (used.has(`${c},${r}`));
    used.add(`${c},${r}`); return { col: c, row: r, kind: p.kind, label: p.label };
  });
  return { cols, rows, icons };
}
const ref = ic => `${String.fromCharCode(65 + ic.col)}${ic.row + 1}`;
const mapD = (m, extra = {}) => gridD({ cols: m.cols, rows: m.rows, map: true, icons: m.icons, north: true, ...extra });
const the = ic => `the ${ic.label.toLowerCase()}`;

function gridMapReadQuestion() {
  const m = makeMap(); const t = choice(m.icons);
  return qMap({ type: "grid-map-read", marks: 1, prompt: `What is in square ${ref(t)}?`, diagram: mapD(m), answer: `The ${t.label.toLowerCase()}`, working: [`Go across to ${ref(t)[0]}, then down to ${t.row + 1}.`], space: SPACE_SIZES.SMALL, mcDistractors: m.icons.filter(i => i !== t).slice(0, 3).map(i => `The ${i.label.toLowerCase()}`), tags: ["grid map"] });
}

function gridMapGiveQuestion() {
  const m = makeMap(); const t = choice(m.icons);
  return qMap({ type: "grid-map-give", marks: 1, prompt: `Where is ${the(t)}? Write the grid reference.`, diagram: mapD(m), answer: ref(t), working: ["Letter first (across), then number (down)."], space: SPACE_SIZES.SMALL, mcDistractors: [`${t.row + 1}${String.fromCharCode(65 + t.col)}`, `${String.fromCharCode(65 + t.row)}${t.col + 1}`, `${String.fromCharCode(65 + Math.min(m.cols - 1, t.col + 1))}${t.row + 1}`], tags: ["grid map"] });
}

function compass4Question() {
  const dirs = ["N", "E", "S", "W"]; const blank = choice(dirs.slice(1));
  const v = choice(["label", "opposite", "turn"]);
  if (v === "label") return qMap({ type: "compass-4", marks: 1, prompt: "Write the missing direction.", diagram: mani({ diagramType: "compass", labels: { [blank]: null } }), answer: { E: "East (E)", S: "South (S)", W: "West (W)" }[blank], working: ["Never Eat Soggy Weetbix: N, E, S, W going clockwise."], space: "none", mcDistractors: ["East (E)", "South (S)", "West (W)", "North (N)"].filter(x => !x.startsWith({ E: "East", S: "South", W: "West" }[blank])), tags: ["compass"] });
  const full = { N: "north", E: "east", S: "south", W: "west" };
  if (v === "opposite") { const d = choice(dirs); const o = dirs[(dirs.indexOf(d) + 2) % 4]; return qMap({ type: "compass-4", marks: 1, prompt: `You face ${full[d]}. You turn around (a half turn). Which way do you face now?`, diagram: mani({ diagramType: "compass" }), answer: full[o], working: ["A half turn faces the opposite way."], space: SPACE_SIZES.SMALL, mcDistractors: dirs.filter(x => x !== o).map(x => full[x]), tags: ["compass", "turns"] }); }
  const d = choice(dirs); const cw = Math.random() < 0.5; const o = dirs[(dirs.indexOf(d) + (cw ? 1 : 3)) % 4];
  return qMap({ type: "compass-4", marks: 1, prompt: `You face ${full[d]}. You make a quarter turn ${cw ? "clockwise" : "anticlockwise"}. Which way do you face now?`, diagram: mani({ diagramType: "compass" }), answer: full[o], working: [`A quarter turn ${cw ? "clockwise" : "anticlockwise"} moves one point ${cw ? "around" : "back"}.`], space: SPACE_SIZES.SMALL, mcDistractors: dirs.filter(x => x !== o).map(x => full[x]), tags: ["compass", "turns"] });
}

function mapDirectionQuestion() {
  for (let tries = 0; tries < 50; tries++) {
    const m = makeMap();
    const pairs = [];
    m.icons.forEach(a => m.icons.forEach(b => { if (a !== b && (a.col === b.col || a.row === b.row)) pairs.push([a, b]); }));
    if (!pairs.length) continue;
    const [a, b] = choice(pairs);
    const dir = a.col === b.col ? (b.row < a.row ? "north" : "south") : b.col > a.col ? "east" : "west";
    return qMap({ type: "map-direction", marks: 1, prompt: `Start at ${the(a)}. Which direction do you go to get to ${the(b)}?`, diagram: mapD(m), answer: dir, working: ["North is up the map, south is down, east is right, west is left."], space: SPACE_SIZES.SMALL, mcDistractors: ["north", "south", "east", "west"].filter(x => x !== dir), tags: ["compass", "map"] });
  }
  return gridMapReadQuestion();
}

function followRouteQuestion() {
  const m = makeMap(); const [a, b] = shuffle(m.icons.slice()).slice(0, 2);
  const dx = b.col - a.col; const dy = b.row - a.row;
  if (!dx || !dy) return followRouteQuestion();
  const ew = `${Math.abs(dx)} square${Math.abs(dx) > 1 ? "s" : ""} ${dx > 0 ? "east" : "west"}`;
  const ns = `${Math.abs(dy)} square${Math.abs(dy) > 1 ? "s" : ""} ${dy > 0 ? "south" : "north"}`;
  if (Math.random() < 0.5) {
    return qMap({ type: "follow-route", marks: 1, prompt: `Start at ${the(a)}. Go ${ew}, then ${ns}. Where are you?`, diagram: mapD(m), answer: `The ${b.label.toLowerCase()} (${ref(b)})`, working: [`${ref(a)} → ${ew} → ${ns} → ${ref(b)}`], space: SPACE_SIZES.SMALL, mcDistractors: m.icons.filter(i => i !== b && i !== a).slice(0, 3).map(i => `The ${i.label.toLowerCase()} (${ref(i)})`), tags: ["route", "map"] });
  }
  const path = [[a.col + 0.5, a.row + 0.5], [b.col + 0.5, a.row + 0.5], [b.col + 0.5, b.row + 0.5]];
  return qMap({ type: "follow-route", marks: 2, prompt: `Describe the red path from ${the(a)} to ${the(b)}.`, diagram: mapD(m, { path }), answer: `Go ${ew}, then ${ns}.`, working: ["Count the squares and name the direction for each part."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["route", "map"] });
}

/* ── length ──────────────────────────────────────────── */
const OBJECTS = [["pencil", "pencil"], ["crayon", "crayon"], ["key", "key"], ["ribbon", "ribbon"]];

function rulerFromZeroQuestion() {
  const [ob, name] = choice(OBJECTS); const len = randInt(3, 9);
  return qLen({ type: "ruler-from-zero", marks: 1, prompt: `How long is the ${name}?`, diagram: mani({ diagramType: "ruler", cm: Math.max(8, len + 1), from: 0, to: len, object: ob }), answer: `${len} cm`, working: [`It starts at 0 and ends at ${len}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${len + 1} cm`, `${len - 1} cm`, `${len} m`], tags: ["ruler"] });
}

function rulerNotZeroQuestion() {
  const [ob, name] = choice(OBJECTS); const from = randInt(1, 4); const len = randInt(3, 6); const to = from + len;
  return qLen({ type: "ruler-not-zero", marks: 1, prompt: `The ${name} does not start at 0. How long is it?`, diagram: mani({ diagramType: "ruler", cm: Math.max(8, to + 1), from, to, object: ob }), answer: `${len} cm`, working: [`${to} − ${from} = ${len} cm`, `Or count the centimetre spaces from ${from} to ${to}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${to} cm`, `${len + 1} cm`, `${from} cm`], tags: ["ruler", "broken ruler"] });
}

function compareLengthsQuestion() {
  const a = randInt(6, 12); let b = randInt(3, 9); if (a === b) b = a - 2;
  const [o1, n1] = choice(OBJECTS.slice(0, 2)); const [o2, n2] = choice(OBJECTS.slice(2));
  const which = Math.random() < 0.5;
  return qLen({ type: "compare-lengths", marks: 1, prompt: which ? `The ${n1} is ${a} cm long. Measure the ${n2}. How much longer is the longer one?` : `The ${n1} is ${a} cm and the ${n2} is ${b} cm. Which is longer, and by how much?`, diagram: which ? mani({ diagramType: "ruler", cm: Math.max(8, b + 1), from: 0, to: b, object: o2 }) : undefined, answer: `The ${a > b ? n1 : n2} is ${Math.abs(a - b)} cm longer.`, working: [`${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)} cm`], space: SPACE_SIZES.SMALL, mcDistractors: [`The ${a > b ? n2 : n1} is ${Math.abs(a - b)} cm longer.`, `The ${a > b ? n1 : n2} is ${a + b} cm longer.`], tags: ["compare"] });
}

function metresCentimetresQuestion() {
  const v = choice(["m-to-cm", "cm-to-m", "mixed", "half"]);
  if (v === "m-to-cm") { const m = randInt(2, 9); return qLen({ type: "metres-centimetres", marks: 1, prompt: `${m} m = ☐ cm`, answer: `${m * 100} cm`, working: ["1 m = 100 cm", `${m} × 100 = ${m * 100}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${m * 10} cm`, `${m * 1000} cm`, `${m + 100} cm`], tags: ["units"] }); }
  if (v === "cm-to-m") { const m = randInt(2, 9); return qLen({ type: "metres-centimetres", marks: 1, prompt: `${m * 100} cm = ☐ m`, answer: `${m} m`, working: ["100 cm = 1 m"], space: SPACE_SIZES.SMALL, mcDistractors: [`${m * 10} m`, `${m * 100} m`, `${m / 10} m`], tags: ["units"] }); }
  if (v === "half") return qLen({ type: "metres-centimetres", marks: 1, prompt: "How many centimetres in half a metre?", diagram: mani({ diagramType: "fraction-strip", strips: [{ den: 1, label: "1 m" }, { den: 2, shaded: 1, label: "½ m" }] }), answer: "50 cm", working: ["1 m = 100 cm, and half of 100 is 50."], space: SPACE_SIZES.SMALL, mcDistractors: ["5 cm", "500 cm", "20 cm"], tags: ["units"] });
  const m = randInt(1, 4); const c = randInt(1, 9) * 10;
  return qLen({ type: "metres-centimetres", marks: 1, prompt: `${m} m ${c} cm = ☐ cm`, answer: `${m * 100 + c} cm`, working: [`${m} m = ${m * 100} cm`, `${m * 100} + ${c} = ${m * 100 + c}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${m + c} cm`, `${m * 10 + c} cm`, `${m * 1000 + c} cm`], tags: ["units"] });
}

const THINGS = [["a door (height)", "m"], ["a pencil", "cm"], ["a swimming pool", "m"], ["your hand span", "cm"], ["a classroom", "m"], ["a book", "cm"], ["a bus", "m"], ["a shoe", "cm"], ["a football field", "m"], ["an ant's path across a leaf", "cm"]];

function chooseLengthUnitQuestion() {
  if (Math.random() < 0.5) {
    const [t, u] = choice(THINGS);
    return qLen({ type: "choose-length-unit", marks: 1, prompt: `Would you measure ${t} in centimetres (cm) or metres (m)?`, answer: u === "cm" ? "centimetres (cm)" : "metres (m)", working: [u === "cm" ? "It is short — smaller than a metre ruler." : "It is long — longer than a metre ruler."], space: SPACE_SIZES.SMALL, mcDistractors: [u === "cm" ? "metres (m)" : "centimetres (cm)"], tags: ["units", "estimate"] });
  }
  const opts = choice([["a door", "2 m", ["2 cm", "20 m", "200 m"]], ["a pencil", "15 cm", ["15 m", "1 cm", "150 cm"]], ["a car", "4 m", ["4 cm", "40 m", "40 cm"]], ["a teacher", "170 cm", ["17 cm", "17 m", "1 cm"]], ["a paper clip", "3 cm", ["3 m", "30 cm", "30 m"]]]);
  return qLen({ type: "choose-length-unit", marks: 1, prompt: `Which is the best estimate for the length of ${opts[0]}?`, answer: opts[1], working: ["Think: 1 cm is about a fingernail wide; 1 m is about a big step."], space: SPACE_SIZES.SMALL, mcDistractors: opts[2], tags: ["units", "estimate"] });
}

function perimeterGridQuestion() {
  const w = randInt(2, 6); const h = randInt(2, 4);
  const L = Math.random() < 0.4 && w >= 3 && h >= 3;
  const pts = L ? [[1, 1], [1 + w, 1], [1 + w, 1 + h - 1], [1 + w - 1, 1 + h - 1], [1 + w - 1, 1 + h], [1, 1 + h]] : [[1, 1], [1 + w, 1], [1 + w, 1 + h], [1, 1 + h]];
  const per = 2 * (w + h);
  return qLen({ type: "perimeter-grid", marks: 1, prompt: "Each square side is 1 cm. What is the perimeter of the shape? (Count the edges all the way around.)", diagram: gridD({ cols: w + 2, rows: h + 2, shapes: [{ pts }] }), answer: `${per} cm`, working: [L ? `Walk around the outside and count: ${per} edges.` : `${w} + ${h} + ${w} + ${h} = ${per} cm`], space: SPACE_SIZES.SMALL, mcDistractors: [`${w * h} cm`, `${w + h} cm`, `${per + 2} cm`], tags: ["perimeter"] });
}

/* ── angles ──────────────────────────────────────────── */
function rightAngleCompareQuestion() {
  const deg = choice([30, 45, 60, 90, 120, 135, 150, 90]); const rotate = choice([0, 0, 20, -15, 40]);
  const rel = deg < 90 ? "smaller than" : deg > 90 ? "bigger than" : "equal to";
  return qAng({ type: "right-angle-compare", marks: 1, prompt: "Use the dashed right-angle corner. Is the angle smaller than, equal to or bigger than a right angle?", diagram: mani({ diagramType: "angles", items: [{ deg, rotate, tester: true, plain: true }] }), answer: `${rel} a right angle`, working: [deg === 90 ? "The arms line up with the corner exactly." : deg < 90 ? "The arm sits inside the right-angle corner." : "The arm opens past the right-angle corner."], space: SPACE_SIZES.SMALL, mcDistractors: ["smaller than", "equal to", "bigger than"].filter(r => r !== rel).map(r => `${r} a right angle`), tags: ["right angle"] });
}

function biggerAngleQuestion() {
  let a = choice([30, 45, 60, 80, 100, 120, 140]); let b = choice([30, 45, 60, 80, 100, 120, 140]);
  if (a === b) b = a === 140 ? 100 : a + 20;
  return qAng({ type: "bigger-angle", marks: 1, prompt: "Which angle is bigger, A or B? (Look at the turn between the arms, not the length of the arms.)", diagram: mani({ diagramType: "angles", items: [{ deg: a, label: "A", rotate: randInt(-20, 20) }, { deg: b, label: "B", rotate: randInt(-20, 20) }] }), answer: a > b ? "A" : "B", working: ["The bigger angle has the bigger turn between its arms."], space: SPACE_SIZES.SMALL, mcDistractors: [a > b ? "B" : "A", "They are the same"], tags: ["compare angles"] });
}

function turnsQuestion() {
  const v = choice([["quarter turn", "1 right angle", ["2 right angles", "4 right angles", "3 right angles"]], ["half turn", "2 right angles", ["1 right angle", "4 right angles", "3 right angles"]], ["three-quarter turn", "3 right angles", ["1 right angle", "2 right angles", "4 right angles"]], ["full turn", "4 right angles", ["1 right angle", "2 right angles", "3 right angles"]]]);
  return qAng({ type: "turns", marks: 1, prompt: `How many right angles make a ${v[0]}?`, diagram: mani({ diagramType: "compass" }), answer: v[1], working: ["A quarter turn is one right angle. Count the quarter turns."], space: SPACE_SIZES.SMALL, mcDistractors: v[2], tags: ["turns"] });
}

function rightAnglesInShapesQuestion() {
  const S = [["square", 4], ["rectangle", 4], ["right-triangle", 1], ["triangle", 0], ["l-shape", 5], ["hexagon", 0], ["trapezium", 0]];
  const [shape, n] = choice(S);
  return qAng({ type: "right-angles-in-shapes", marks: 1, prompt: "How many right angles are inside this shape? (Test each corner with a right-angle corner.)", diagram: mani({ diagramType: "shapes", items: [{ shape }] }), answer: String(n), working: [n ? `${n} square corner${n > 1 ? "s" : ""}.` : "None of the corners is a square corner."], space: SPACE_SIZES.SMALL, mcDistractors: [String(n + 1), String(Math.max(0, n - 1) === n ? n + 2 : Math.max(0, n - 1)), "4", "0"], tags: ["right angle", "shapes"] });
}

const GENERATORS = {
  "grid-map-read": gridMapReadQuestion,
  "grid-map-give": gridMapGiveQuestion,
  "compass-4": compass4Question,
  "map-direction": mapDirectionQuestion,
  "follow-route": followRouteQuestion,
  "ruler-from-zero": rulerFromZeroQuestion,
  "ruler-not-zero": rulerNotZeroQuestion,
  "compare-lengths": compareLengthsQuestion,
  "metres-centimetres": metresCentimetresQuestion,
  "choose-length-unit": chooseLengthUnitQuestion,
  "perimeter-grid": perimeterGridQuestion,
  "right-angle-compare": rightAngleCompareQuestion,
  "bigger-angle": biggerAngleQuestion,
  "turns": turnsQuestion,
  "right-angles-in-shapes": rightAnglesInShapesQuestion
};

export function getGeometricMeasureAQuestionTypes() { return TYPE_LIST; }
export function generateGeometricMeasureAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
