/*
  Mills Maths Tools — Stage 1 Question Bank: Position and Length (B)
  -------------------------------------------------------------------
  question-banks/stage-1/position-length-b/index.js

  NSW Mathematics K–10 (2022), Stage 1, Geometric measure B:
    MA1-GM-01  follow and give directions on simple maps; quarter and half turns
    MA1-GM-02  metres and centimetres; bigger unit → smaller count

  Big ideas:
    - directions are steps AND a way to go (2 squares right, 1 square down);
    - a quarter turn is a corner turn; a half turn faces the other way;
    - metres and centimetres are units everyone agrees on (1 m = 100 cm);
    - the bigger the unit, the fewer we need.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, gridD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Position and Length B";
const qP = makeStage1(TOPIC, "MA1-GM-01");
const qL = makeStage1(TOPIC, "MA1-GM-02");

const TYPE_LIST = [
  { id: "follow-steps", label: "Follow the steps on a map" },
  { id: "describe-path", label: "Describe the path" },
  { id: "turns", label: "Quarter and half turns" },
  { id: "ruler-cm", label: "Measure in centimetres" },
  { id: "m-or-cm", label: "Metres or centimetres?" },
  { id: "estimate-length", label: "Best estimate" },
  { id: "bigger-unit", label: "Bigger unit, fewer units" },
  { id: "metre-facts", label: "Metres and centimetres" },
  { id: "length-story", label: "Length stories" }
];

const PLACES = [{ kind: "house", label: "House" }, { kind: "tree", label: "Tree" }, { kind: "school", label: "School" }, { kind: "shop", label: "Shop" }, { kind: "pool", label: "Pool" }, { kind: "star", label: "Star" }, { kind: "tent", label: "Tent" }, { kind: "flag", label: "Flag" }];
function makeMap() {
  const cols = 5; const rows = 4; const used = new Set();
  const icons = shuffle(PLACES.slice()).slice(0, 5).map(p => { let c; let r; do { c = randInt(0, cols - 1); r = randInt(0, rows - 1); } while (used.has(`${c},${r}`)); used.add(`${c},${r}`); return { col: c, row: r, kind: p.kind, label: p.label }; });
  return { cols, rows, icons };
}
const steps = (n, dir) => `${n} ${dir}`;

function followStepsQuestion() {
  const m = makeMap(); const [a, b] = shuffle(m.icons.slice()).slice(0, 2);
  const dx = b.col - a.col; const dy = b.row - a.row; if (!dx || !dy) return followStepsQuestion();
  return qP({ type: "follow-steps", marks: 1, prompt: `Start at the ${a.label.toLowerCase()}. Go ${steps(Math.abs(dx), dx > 0 ? "right" : "left")}, then ${steps(Math.abs(dy), dy > 0 ? "down" : "up")}. Where are you?`, diagram: gridD({ cols: m.cols, rows: m.rows, map: true, icons: m.icons, cell: 56 }), answer: `the ${b.label.toLowerCase()}`, working: ["Move one square at a time and count."], space: SPACE_SIZES.SMALL, mcDistractors: m.icons.filter(i => i !== a && i !== b).slice(0, 3).map(i => `the ${i.label.toLowerCase()}`), tags: ["directions"] });
}

function describePathQuestion() {
  const m = makeMap(); const [a, b] = shuffle(m.icons.slice()).slice(0, 2);
  const dx = b.col - a.col; const dy = b.row - a.row; if (!dx || !dy) return describePathQuestion();
  const path = [[a.col + 0.5, a.row + 0.5], [b.col + 0.5, a.row + 0.5], [b.col + 0.5, b.row + 0.5]];
  const ans = `${steps(Math.abs(dx), dx > 0 ? "right" : "left")}, then ${steps(Math.abs(dy), dy > 0 ? "down" : "up")}`;
  return qP({ type: "describe-path", marks: 1, prompt: `Follow the red path from the ${a.label.toLowerCase()}. How many squares? Which way?`, diagram: gridD({ cols: m.cols, rows: m.rows, map: true, icons: m.icons, path, cell: 56 }), answer: ans, working: ["Count the squares on each straight part."], space: SPACE_SIZES.SMALL, mcDistractors: [`${steps(Math.abs(dy), dx > 0 ? "right" : "left")}, then ${steps(Math.abs(dx), dy > 0 ? "down" : "up")}`, `${steps(Math.abs(dx), dx > 0 ? "left" : "right")}, then ${steps(Math.abs(dy), dy > 0 ? "up" : "down")}`].filter(x => x !== ans), tags: ["directions"] });
}

function turnsQuestion() {
  const things = shuffle(["door", "window", "board", "sink"]);
  const dirs = ["N", "E", "S", "W"]; const labels = Object.fromEntries(dirs.map((d, i) => [d, things[i]]));
  const i = randInt(0, 3); const [name, k] = choice([["a quarter turn right", 1], ["a quarter turn left", 3], ["a half turn", 2]]);
  const end = things[(i + k) % 4];
  return qP({ type: "turns", marks: 1, prompt: `You face the ${things[i]}. You make ${name}. What do you face now?`, diagram: mani({ diagramType: "compass", labels }), answer: `the ${end}`, working: [k === 2 ? "A half turn faces the other way." : "A quarter turn is one corner turn."], space: SPACE_SIZES.SMALL, mcDistractors: things.filter(t => t !== end).map(t => `the ${t}`), tags: ["turns"] });
}

function rulerCmQuestion() {
  const len = randInt(3, 9); const ob = choice(["pencil", "crayon", "key", "ribbon"]);
  return qL({ type: "ruler-cm", marks: 1, prompt: `How long is the ${ob}?`, diagram: mani({ diagramType: "ruler", cm: Math.max(8, len + 1), from: 0, to: len, object: ob }), answer: `${len} cm`, working: [`It starts at 0 and ends at ${len}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${len + 1} cm`, `${len - 1} cm`, `${len} m`], tags: ["centimetres"] });
}

function mOrCmQuestion() {
  const T = [["a pencil", "cm"], ["the playground", "m"], ["your finger", "cm"], ["a school bus", "m"], ["a book", "cm"], ["a swimming pool", "m"], ["a spoon", "cm"], ["a football field", "m"]];
  const [t, u] = choice(T);
  return qL({ type: "m-or-cm", marks: 1, prompt: `Would you measure ${t} in m or cm?`, answer: u, working: ["Short things: cm. Long things: m."], space: SPACE_SIZES.SMALL, mcDistractors: [u === "m" ? "cm" : "m"], tags: ["units"] });
}

function estimateLengthQuestion() {
  const E = [["a pencil", "15 cm", ["15 m", "1 cm"]], ["a bed", "2 m", ["2 cm", "20 m"]], ["a paperclip", "3 cm", ["3 m", "30 cm"]], ["a car", "4 m", ["4 cm", "40 m"]], ["your hand", "10 cm", ["10 m", "1 cm"]]];
  const [t, a, d] = choice(E);
  return qL({ type: "estimate-length", marks: 1, prompt: `About how long is ${t}?`, answer: a, working: ["1 cm is about the width of a finger. 1 m is about a big step."], space: SPACE_SIZES.SMALL, mcDistractors: d, tags: ["estimate"] });
}

function biggerUnitQuestion() {
  const rods = randInt(2, 5); const cubes = rods * 2;
  const ask = choice(["which", "count"]);
  const rows = [{ object: "ribbon", units: cubes, unit: "cube", label: "A" }, { object: "ribbon", units: rods, unit: "rod", label: "B" }];
  if (ask === "which") return qL({ type: "bigger-unit", marks: 1, prompt: "The same ribbon is measured two ways. Which unit is bigger, A or B?", diagram: mani({ diagramType: "unit-length", rows }), answer: "B", working: [`A uses ${cubes} small units. B uses ${rods} big units.`, "The bigger the unit, the fewer you need."], space: SPACE_SIZES.SMALL, mcDistractors: ["A", "They are the same"], tags: ["units"] });
  return qL({ type: "bigger-unit", marks: 1, prompt: `The ribbon is ${cubes} cubes long. A rod is 2 cubes long. How many rods long is it?`, diagram: mani({ diagramType: "unit-length", rows: [rows[0]] }), answer: `${rods} rods`, working: [`Every 2 cubes make 1 rod. ${cubes} cubes make ${rods} rods.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${cubes} rods`, `${cubes * 2} rods`, `${rods + 1} rods`], tags: ["units"] });
}

function metreFactsQuestion() {
  const v = choice(["cm-in-m", "longer", "half"]);
  if (v === "cm-in-m") return qL({ type: "metre-facts", marks: 1, prompt: "1 metre = ☐ centimetres", answer: "100", working: ["There are 100 cm in 1 m."], space: SPACE_SIZES.SMALL, mcDistractors: ["10", "1000", "50"], tags: ["metres"] });
  if (v === "half") return qL({ type: "metre-facts", marks: 1, prompt: "Half a metre = ☐ cm", answer: "50", working: ["Half of 100 is 50."], space: SPACE_SIZES.SMALL, mcDistractors: ["5", "100", "25"], tags: ["metres"] });
  const c = randInt(40, 150);
  return qL({ type: "metre-facts", marks: 1, prompt: `Is ${c} cm longer or shorter than 1 metre?`, answer: c > 100 ? "longer" : c < 100 ? "shorter" : "the same", working: ["1 m = 100 cm."], space: SPACE_SIZES.SMALL, mcDistractors: [c > 100 ? "shorter" : "longer"], tags: ["metres"] });
}

function lengthStoryQuestion() {
  const a = randInt(3, 12); const b = randInt(2, a - 1); const u = choice(["m", "cm"]);
  if (Math.random() < 0.5) return qL({ type: "length-story", marks: 1, prompt: `A rope is ${a} ${u}. A string is ${b} ${u}. How much longer is the rope?`, answer: `${a - b} ${u}`, working: [`${a} − ${b} = ${a - b}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${a + b} ${u}`, `${a - b + 1} ${u}`], tags: ["story"] });
  return qL({ type: "length-story", marks: 1, prompt: `Two sticks are ${a} ${u} and ${b} ${u}. End to end, how long?`, answer: `${a + b} ${u}`, working: [`${a} + ${b} = ${a + b}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${a - b} ${u}`, `${a + b + 1} ${u}`], tags: ["story"] });
}

const GENERATORS = {
  "follow-steps": followStepsQuestion,
  "describe-path": describePathQuestion,
  "turns": turnsQuestion,
  "ruler-cm": rulerCmQuestion,
  "m-or-cm": mOrCmQuestion,
  "estimate-length": estimateLengthQuestion,
  "bigger-unit": biggerUnitQuestion,
  "metre-facts": metreFactsQuestion,
  "length-story": lengthStoryQuestion
};

export function getPositionLengthBQuestionTypes() { return TYPE_LIST; }
export function generatePositionLengthBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
