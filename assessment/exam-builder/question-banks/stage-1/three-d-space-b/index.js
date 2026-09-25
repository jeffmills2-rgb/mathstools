/*
  Mills Maths Tools — Stage 1 Question Bank: 3D Objects and Capacity (B)
  -----------------------------------------------------------------------
  question-banks/stage-1/three-d-space-b/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-3DS-01  faces, edges and corners; the shapes of faces
    MA1-3DS-02  compare and estimate capacity and volume with informal units

  Big ideas:
    - a FACE is flat, an EDGE is where two faces meet, a CORNER (vertex) is
      where edges meet;
    - the faces of 3D objects are 2D shapes;
    - bigger cups fill a jug with FEWER cups (bigger unit, smaller count);
    - to compare volume, count the same-sized blocks.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, solidD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "3D Objects and Capacity B";
const q = makeStage1(TOPIC, "MA1-3DS-01");
const qC = makeStage1(TOPIC, "MA1-3DS-02");
const vol = heights => ({ engine: "volume-engine", config: { diagramType: "cube-array", heights } });

const POLY = [
  { name: "cube", config: { kind: "prism", sides: 4, cube: true }, F: 6, E: 12, V: 8, face: "squares" },
  { name: "rectangular prism", config: { kind: "prism", sides: 4, base: "rectangle", height: 1.1 }, F: 6, E: 12, V: 8, face: "rectangles" },
  { name: "square pyramid", config: { kind: "pyramid", sides: 4 }, F: 5, E: 8, V: 5, face: "1 square and 4 triangles" },
  { name: "triangular prism", config: { kind: "prism", sides: 3 }, F: 5, E: 9, V: 6, face: "2 triangles and 3 rectangles" }
];

const TYPE_LIST = [
  { id: "faces-edges-corners", label: "Faces, edges and corners" },
  { id: "face-shapes", label: "What shape are the faces?" },
  { id: "curved-face-shape", label: "Flat faces of curved objects" },
  { id: "bigger-cup", label: "Bigger cup, fewer cups" },
  { id: "capacity-difference", label: "How many more cups?" },
  { id: "estimate-capacity", label: "Holds more: estimate" },
  { id: "compare-volume", label: "Which has more blocks?" },
  { id: "build-volume", label: "Blocks in layers" }
];

function fecQuestion() {
  const o = choice(POLY); const ask = choice(["faces", "edges", "corners"]); const v = { faces: o.F, edges: o.E, corners: o.V }[ask];
  return q({ type: "faces-edges-corners", marks: 1, prompt: `How many ${ask} does this ${o.name} have?`, diagram: solidD({ diagramType: "solid", ...o.config }), answer: String(v), working: [`${o.name}: ${o.F} faces, ${o.E} edges, ${o.V} corners.`, "Dashed lines are at the back."], space: SPACE_SIZES.SMALL, mcDistractors: [String(o.F), String(o.E), String(o.V), String(v + 1)].filter(x => x !== String(v)).slice(0, 3), tags: ["features"] });
}

function faceShapesQuestion() {
  const o = choice(POLY);
  return q({ type: "face-shapes", marks: 1, prompt: `What shapes are the faces of this ${o.name}?`, diagram: solidD({ diagramType: "solid", ...o.config }), answer: o.face, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(POLY.filter(x => x.face !== o.face).map(x => x.face)).slice(0, 3), tags: ["faces"] });
}

function curvedFaceShapeQuestion() {
  const o = choice([{ name: "cylinder", config: { kind: "cylinder" }, a: "circles" }, { name: "cone", config: { kind: "cone" }, a: "a circle" }]);
  return q({ type: "curved-face-shape", marks: 1, prompt: `Trace the flat face of this ${o.name}. What shape do you draw?`, diagram: solidD({ diagramType: "solid", ...o.config }), answer: o.a === "circles" ? "a circle (it has 2)" : "a circle", working: [], space: SPACE_SIZES.SMALL, mcDistractors: ["a square", "a triangle", "a rectangle"], tags: ["faces"] });
}

function biggerCupQuestion() {
  const small = randInt(3, 5) * 2; const big = small / 2;
  return q({ type: "bigger-cup", marks: 1, prompt: `A jug fills ${small} small cups. A big cup holds as much as 2 small cups. How many big cups?`, diagram: mani({ diagramType: "objects", count: small, item: "cup", perRow: small }), answer: `${big} big cups`, working: ["Every 2 small cups make 1 big cup.", "Bigger unit, fewer units."], space: SPACE_SIZES.SMALL, mcDistractors: [`${small * 2} big cups`, `${small} big cups`, `${big + 1} big cups`], tags: ["capacity", "units"] });
}

function capacityDifferenceQuestion() {
  const a = randInt(5, 10); const b = randInt(2, a - 1); const per = a;
  return q({ type: "capacity-difference", marks: 1, prompt: `A holds ${a} cups. B holds ${b} cups. How many more cups does A hold?`, diagram: mani({ diagramType: "objects", items: [...Array(a).fill("cup"), ...Array(b).fill("cup"), ...Array(per - b).fill("")], perRow: per, rowLabels: ["A", "B"] }), answer: String(a - b), working: [`${a} − ${b} = ${a - b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(a + b), String(a), String(a - b + 1)], tags: ["capacity", "difference"] });
}

function estimateCapacityQuestion() {
  const P = [["a bath", "a cup"], ["a bucket", "a spoon"], ["a swimming pool", "a bath"], ["a jug", "an egg cup"], ["a watering can", "a glass"]];
  const [big, small] = choice(P); const flip = Math.random() < 0.5;
  return q({ type: "estimate-capacity", marks: 1, prompt: `Which holds more: ${flip ? small : big} or ${flip ? big : small}?`, answer: big, working: [], space: SPACE_SIZES.SMALL, mcDistractors: [small], tags: ["capacity", "estimate"] });
}

function compareVolumeQuestion() {
  let a; let b; do { a = [randInt(2, 4), randInt(1, 3)]; b = [randInt(2, 4), randInt(1, 3)]; } while (a[0] * a[1] === b[0] * b[1]);
  const ans = a[0] * a[1] > b[0] * b[1] ? "A" : "B";
  return qC({ type: "compare-volume", marks: 1, prompt: `A is shown. B is made of ${b[0] * b[1]} blocks. Which has more blocks?`, diagram: vol([Array(a[0]).fill(a[1])]), answer: `${ans} (A has ${a[0] * a[1]})`, working: [`A: ${a[0] * a[1]} blocks. B: ${b[0] * b[1]} blocks.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${ans === "A" ? "B" : "A"} (A has ${a[0] * a[1]})`], tags: ["volume", "compare"] });
}

function buildVolumeQuestion() {
  const l = randInt(2, 4); const w = 1; const h = randInt(2, 3);
  return qC({ type: "build-volume", marks: 2, prompt: `How many blocks in one layer? How many layers? How many blocks altogether?`, diagram: vol(Array.from({ length: w }, () => Array(l).fill(h))), answer: `${l * w} in a layer, ${h} layers, ${l * w * h} blocks`, working: [`${Array(h).fill(l * w).join(" + ")} = ${l * w * h}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["volume", "layers"] });
}

const GENERATORS = {
  "faces-edges-corners": fecQuestion,
  "face-shapes": faceShapesQuestion,
  "curved-face-shape": curvedFaceShapeQuestion,
  "bigger-cup": biggerCupQuestion,
  "capacity-difference": capacityDifferenceQuestion,
  "estimate-capacity": estimateCapacityQuestion,
  "compare-volume": compareVolumeQuestion,
  "build-volume": buildVolumeQuestion
};

export function getThreeDSpaceBQuestionTypes() { return TYPE_LIST; }
export function generateThreeDSpaceBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
