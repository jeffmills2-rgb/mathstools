/*
  Mills Maths Tools — Stage 2 Question Bank: 3D Objects, Capacity and Volume B
  ----------------------------------------------------------------------------
  question-banks/stage-2/three-d-space-b/index.js

  NSW Mathematics K–10 (2022), Stage 2:
    MA2-3DS-01  models and nets of prisms and pyramids
    MA2-3DS-02  capacity in litres and millilitres; volume in cubic
                centimetres by counting cubes

  Big ideas:
    - a skeletal model shows the edges (straws) and vertices (joiners);
    - a cube has 11 different nets — and many arrangements of six squares
      that are NOT nets;
    - capacity is how much a container holds: 1 L = 1000 mL, read on the
      marks of a measuring jug;
    - volume is the space an object takes up: count 1 cm cubes, in layers.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { solidD, measure, sp, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";
import { SOLIDS, fev, cubeNetOptions, sq } from "../../stage-3/three-d-space-volume/index.js";

const TOPIC = "3D Objects, Capacity and Volume B";
const q3 = makeStage2(TOPIC, "MA2-3DS-01");
const qV = makeStage2(TOPIC, "MA2-3DS-02");
const vol = config => ({ engine: "volume-engine", config: { diagramType: "cube-array", ...config } });

const TYPE_LIST = [
  { id: "skeletal-model", label: "Skeletal models: straws and joiners" },
  { id: "cube-nets", label: "Which net folds into a cube?" },
  { id: "compare-objects", label: "Compare two 3D objects" },
  { id: "read-jug", label: "Read a measuring jug" },
  { id: "litres-millilitres", label: "Litres and millilitres" },
  { id: "choose-capacity-unit", label: "Choose L or mL" },
  { id: "capacity-problem", label: "Capacity problems" },
  { id: "count-cubes", label: "Volume by counting cubes" },
  { id: "layers", label: "Volume in layers" },
  { id: "compare-volume", label: "Which has the bigger volume?" }
];

const POLY = SOLIDS.filter(s => ["cube", "rectangular-prism", "triangular-prism", "square-pyramid", "triangular-pyramid", "pentagonal-prism", "hexagonal-pyramid"].includes(s.id));
const draw = s => solidD({ diagramType: "solid", ...s.config });

function skeletalModelQuestion() {
  const s = choice(POLY); const { E, V } = fev(s);
  const v = choice(["straws", "joiners", "both"]);
  if (v === "both") return q3({ type: "skeletal-model", marks: 2, prompt: `Ella makes a skeleton of this ${s.name.toLowerCase()} with straws and joiners. How many straws? How many joiners?`, diagram: draw(s), answer: `${E} straws and ${V} joiners`, working: ["One straw for each edge, one joiner for each vertex."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["skeletal models"] });
  const val = v === "straws" ? E : V;
  return q3({ type: "skeletal-model", marks: 1, prompt: v === "straws" ? `A straw model of this ${s.name.toLowerCase()} uses one straw for each edge. How many straws?` : `Joiners go at every vertex (corner) of this ${s.name.toLowerCase()}. How many joiners?`, diagram: draw(s), answer: String(val), working: [v === "straws" ? `${E} edges` : `${V} vertices`], space: SPACE_SIZES.SMALL, mcDistractors: [String(E), String(V), String(fev(s).F), String(val + 2)].filter(x => x !== String(val)), tags: ["skeletal models"] });
}

function cubeNetsQuestion() {
  const { valid, invalid } = cubeNetOptions();
  const picks = shuffle([{ c: valid[0], ok: true }, ...invalid.slice(0, 2).map(c => ({ c, ok: false }))]);
  const L = ["A", "B", "C"]; const ans = L[picks.findIndex(p => p.ok)];
  return q3({ type: "cube-nets", marks: 1, prompt: "Only one of these folds up to make a cube. Which one?", diagram: solidD({ diagramType: "net", nets: picks.map((p, i) => ({ label: L[i], faces: p.c.map(([x, y]) => sq(x, y)), cells: p.c })) }), answer: ans, working: ["Imagine folding: pick a base square and fold the others up. In the wrong nets two squares land on the same face."], space: SPACE_SIZES.SMALL, mcDistractors: L.filter(l => l !== ans), tags: ["nets", "cube"] });
}

function compareObjectsQuestion() {
  const [a, b] = shuffle(POLY.slice()).slice(0, 2);
  const fa = fev(a); const fb = fev(b);
  const what = choice(["F", "E", "V"]); const word = { F: "faces", E: "edges", V: "vertices" }[what];
  if (fa[what] === fb[what]) return compareObjectsQuestion();
  const more = fa[what] > fb[what] ? a : b;
  return q3({ type: "compare-objects", marks: 1, prompt: `Which has more ${word}: a ${a.name.toLowerCase()} or a ${b.name.toLowerCase()}? How many more?`, diagram: solidD({ diagramType: "solid", ...a.config }), answer: `The ${more.name.toLowerCase()}, by ${Math.abs(fa[what] - fb[what])} (${fa[what]} and ${fb[what]})`, working: [`${a.name}: ${fa[what]} ${word}. ${b.name}: ${fb[what]} ${word}.`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["faces", "edges", "vertices"] });
}

const JUGS = [{ capacity: 1000, major: 200, minor: 100 }, { capacity: 1000, major: 500, minor: 100 }, { capacity: 500, major: 100, minor: 50 }, { capacity: 1000, major: 250, minor: 50 }, { capacity: 2000, major: 500, minor: 250 }];

function readJugQuestion() {
  const j = choice(JUGS); const k = randInt(1, j.capacity / j.minor - 1); const level = k * j.minor;
  return qV({ type: "read-jug", marks: 1, prompt: "How much water is in the jug?", diagram: measure({ diagramType: "jug", ...j, level, unit: "mL" }), answer: `${sp(level)} mL`, working: [`Each small mark is ${j.minor} mL.`, `The water is at ${sp(level)} mL.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${sp(level + j.minor)} mL`, level > j.minor ? `${sp(level - j.minor)} mL` : `${sp(level + 2 * j.minor)} mL`, `${sp(level)} L`], tags: ["reading scales", "capacity"] });
}

function litresMillilitresQuestion() {
  const v = choice(["L-mL", "mL-L", "half", "mixed"]);
  if (v === "L-mL") { const l = randInt(2, 9); return qV({ type: "litres-millilitres", marks: 1, prompt: `${l} L = ☐ mL`, answer: `${sp(l * 1000)} mL`, working: ["1 L = 1000 mL"], space: SPACE_SIZES.SMALL, mcDistractors: [`${l * 100} mL`, `${l * 10} mL`, `${sp(l * 10000)} mL`], tags: ["convert"] }); }
  if (v === "mL-L") { const l = randInt(2, 9); return qV({ type: "litres-millilitres", marks: 1, prompt: `${sp(l * 1000)} mL = ☐ L`, answer: `${l} L`, working: ["1000 mL = 1 L"], space: SPACE_SIZES.SMALL, mcDistractors: [`${l * 10} L`, `${l * 100} L`, `${sp(l * 1000)} L`], tags: ["convert"] }); }
  if (v === "half") { const f = choice([["half a litre", 500], ["a quarter of a litre", 250], ["three-quarters of a litre", 750]]); return qV({ type: "litres-millilitres", marks: 1, prompt: `How many millilitres is ${f[0]}?`, diagram: measure({ diagramType: "jug", capacity: 1000, major: 250, minor: 250, level: f[1], unit: "mL" }), answer: `${f[1]} mL`, working: ["1 L = 1000 mL."], space: SPACE_SIZES.SMALL, mcDistractors: ["50 mL", "100 mL", "500 mL", "250 mL", "750 mL"].filter(x => x !== `${f[1]} mL`).slice(0, 3), tags: ["convert"] }); }
  const l = randInt(1, 3); const m = choice([250, 500, 750, 200, 400]);
  return qV({ type: "litres-millilitres", marks: 1, prompt: `${l} L ${m} mL = ☐ mL`, answer: `${sp(l * 1000 + m)} mL`, working: [`${l} L = ${sp(l * 1000)} mL`, `${sp(l * 1000)} + ${m} = ${sp(l * 1000 + m)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${l + m} mL`, `${sp(l * 100 + m)} mL`, `${sp(l * 1000 + m * 10)} mL`], tags: ["convert"] });
}

function chooseCapacityUnitQuestion() {
  const T = [["a bath", "L"], ["a teaspoon", "mL"], ["a bucket", "L"], ["a cup of tea", "mL"], ["a swimming pool", "L"], ["a medicine cup", "mL"], ["a fish tank", "L"], ["a juice popper", "mL"]];
  const [t, u] = choice(T); const names = { L: "litres (L)", mL: "millilitres (mL)" };
  return qV({ type: "choose-capacity-unit", marks: 1, prompt: `Would you measure how much ${t} holds in litres (L) or millilitres (mL)?`, answer: names[u], working: ["Small containers: mL. Large containers: L."], space: SPACE_SIZES.SMALL, mcDistractors: [names[u === "L" ? "mL" : "L"]], tags: ["units"] });
}

function capacityProblemQuestion() {
  const v = choice(["cups", "left", "total"]);
  if (v === "cups") { const cup = choice([250, 200, 500]); const n = 1000 / cup; const l = randInt(1, 3); return qV({ type: "capacity-problem", marks: 2, prompt: `A cup holds ${cup} mL. How many cups can be filled from a ${l} L bottle?`, answer: `${n * l} cups`, working: [`1 L = 1000 mL; 1000 ÷ ${cup} = ${n} cups per litre`, `${l} × ${n} = ${n * l}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${n} cups`, `${n * l + 1} cups`, `${l} cups`].filter(x => x !== `${n * l} cups`), tags: ["word problem"] }); }
  if (v === "left") { const start = choice([1000, 2000]); const used = randInt(1, start / 100 - 1) * 100; return qV({ type: "capacity-problem", marks: 2, prompt: `A jug has ${start / 1000} L of juice. ${sp(used)} mL is poured out. How much is left?`, answer: `${sp(start - used)} mL`, working: [`${start / 1000} L = ${sp(start)} mL`, `${sp(start)} − ${sp(used)} = ${sp(start - used)} mL`], space: SPACE_SIZES.SMALL, mcDistractors: [`${sp(start + used)} mL`, `${sp(Math.abs(used - start / 2))} mL`, `${start / 1000 - used} mL`].filter(x => !x.startsWith("-") && x !== `${sp(start - used)} mL`), tags: ["word problem"] }); }
  const a = randInt(2, 7) * 100; const b = randInt(2, 7) * 100;
  return qV({ type: "capacity-problem", marks: 1, prompt: `Mia drinks ${a} mL of water in the morning and ${b} mL in the afternoon. How much does she drink? Is it more or less than 1 L?`, answer: `${sp(a + b)} mL — ${a + b > 1000 ? "more than" : a + b === 1000 ? "exactly" : "less than"} 1 L`, working: [`${a} + ${b} = ${a + b} mL; 1 L = 1000 mL`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["word problem"] });
}

function countCubesQuestion() {
  const shape = choice(["box", "steps", "L"]); let heights;
  if (shape === "box") { const l = randInt(2, 4); const w = randInt(1, 2); const h = randInt(1, 3); heights = Array.from({ length: w }, () => Array(l).fill(h)); }
  else if (shape === "steps") { const l = randInt(3, 4); heights = [Array.from({ length: l }, (_, i) => l - i)]; }
  else { const l = randInt(3, 4); heights = [Array.from({ length: l }, (_, i) => (i === 0 ? 3 : 1))]; }
  const total = heights.flat().reduce((s, v) => s + v, 0);
  return qV({ type: "count-cubes", marks: 1, prompt: "Each cube is 1 cm³. What is the volume? (No cubes are hidden behind.)", diagram: vol({ heights }), answer: `${total} cm³`, working: ["Count the cubes in each stack and add.", `${heights.map(r => r.join(" + ")).join(" + ")} = ${total}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${total + 1} cm³`, `${total - 1} cm³`, `${total} cm²`], tags: ["volume", "counting cubes"] });
}

function layersQuestion() {
  const l = randInt(2, 4); const w = randInt(2, 3); const h = randInt(2, 3);
  const heights = Array.from({ length: w }, () => Array(l).fill(h));
  return qV({ type: "layers", marks: 2, prompt: `This box of 1 cm cubes is ${h} layers high. How many cubes in one layer? What is the volume?`, diagram: vol({ heights }), answer: `${l * w} cubes in a layer; volume ${l * w * h} cm³`, working: [`One layer: ${l} × ${w} = ${l * w}`, `${h} layers: ${l * w} × ${h} = ${l * w * h} cm³`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["volume", "layers"] });
}

function compareVolumeQuestion() {
  const mk = () => { const l = randInt(2, 4); const h = randInt(1, 3); return [Array(l).fill(h)]; };
  let A; let B; do { A = mk(); B = mk(); } while (A.flat().reduce((s, v) => s + v, 0) === B.flat().reduce((s, v) => s + v, 0));
  const a = A.flat().reduce((s, v) => s + v, 0); const b = B.flat().reduce((s, v) => s + v, 0);
  return qV({ type: "compare-volume", marks: 1, prompt: `Object A is shown. Object B is made of ${b} cubes. Which has the bigger volume, and by how many cubes?`, diagram: vol({ heights: A }), answer: `${a > b ? "A" : "B"}, by ${Math.abs(a - b)} cubes (A has ${a})`, working: [`A: ${a} cubes. B: ${b} cubes.`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["volume", "compare"] });
}

const GENERATORS = {
  "skeletal-model": skeletalModelQuestion,
  "cube-nets": cubeNetsQuestion,
  "compare-objects": compareObjectsQuestion,
  "read-jug": readJugQuestion,
  "litres-millilitres": litresMillilitresQuestion,
  "choose-capacity-unit": chooseCapacityUnitQuestion,
  "capacity-problem": capacityProblemQuestion,
  "count-cubes": countCubesQuestion,
  "layers": layersQuestion,
  "compare-volume": compareVolumeQuestion
};

export function getThreeDSpaceBQuestionTypes() { return TYPE_LIST; }
export function generateThreeDSpaceBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
