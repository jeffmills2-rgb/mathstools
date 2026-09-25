/*
  Mills Maths Tools — Stage 1 Question Bank: 3D Objects and Capacity (A)
  -----------------------------------------------------------------------
  question-banks/stage-1/three-d-space-a/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-3DS-01  recognise and describe familiar 3D objects
    MA1-3DS-02  capacity and volume with uniform informal units

  Big ideas:
    - 3D objects have flat faces and/or curved surfaces: curved rolls, flat
      stacks and slides;
    - capacity is how much a container HOLDS — measure it with the same cup
      each time and count;
    - volume is how much space something takes up — count the blocks.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, solidD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "3D Objects and Capacity A";
const q = makeStage1(TOPIC, "MA1-3DS-01");
const qC = makeStage1(TOPIC, "MA1-3DS-02");

const OBJ = [
  { name: "cube", config: { kind: "prism", sides: 4, cube: true }, flat: 6, roll: false, stack: true },
  { name: "rectangular prism (box)", config: { kind: "prism", sides: 4, base: "rectangle", height: 1.1 }, flat: 6, roll: false, stack: true },
  { name: "sphere (ball)", config: { kind: "sphere" }, flat: 0, roll: true },
  { name: "cylinder", config: { kind: "cylinder" }, flat: 2, roll: true, stack: true },
  { name: "cone", config: { kind: "cone" }, flat: 1, roll: true },
  { name: "pyramid", config: { kind: "pyramid", sides: 4 }, flat: 5, roll: false }
];
const draw = o => solidD({ diagramType: "solid", ...o.config });
const vol = heights => ({ engine: "volume-engine", config: { diagramType: "cube-array", heights } });

const TYPE_LIST = [
  { id: "name-object", label: "Name the object" },
  { id: "roll-or-stack", label: "Roll or stack?" },
  { id: "flat-faces", label: "How many flat faces?" },
  { id: "real-objects", label: "Objects around us" },
  { id: "holds-more", label: "Which holds more?" },
  { id: "cups-to-fill", label: "How many cups to fill it?" },
  { id: "order-capacity", label: "Order containers by capacity" },
  { id: "count-blocks", label: "Count the blocks (volume)" }
];

function nameObjectQuestion() {
  const o = choice(OBJ);
  return q({ type: "name-object", marks: 1, prompt: "What is this object called?", diagram: draw(o), answer: o.name, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(OBJ.filter(x => x !== o)).slice(0, 3).map(x => x.name), tags: ["naming"] });
}

function rollOrStackQuestion() {
  const o = choice(OBJ); const ask = choice(["roll", "stack"]);
  const yes = ask === "roll" ? o.roll : Boolean(o.stack);
  return q({ type: "roll-or-stack", marks: 1, prompt: `Can this object ${ask}? Yes or no?`, diagram: draw(o), answer: yes ? "Yes" : "No", working: [ask === "roll" ? (o.roll ? "It has a curved surface." : "It has only flat faces.") : (yes ? "It has flat faces top and bottom." : "It has no flat top to stack on.")], space: SPACE_SIZES.SMALL, mcDistractors: [yes ? "No" : "Yes"], tags: ["roll", "stack"] });
}

function flatFacesQuestion() {
  const o = choice(OBJ.filter(x => x.name !== "pyramid"));
  return q({ type: "flat-faces", marks: 1, prompt: "How many flat faces does it have?", diagram: draw(o), answer: String(o.flat), working: ["Count the flat parts, even the ones at the back."], space: SPACE_SIZES.SMALL, mcDistractors: ["0", "1", "2", "4", "6"].filter(x => x !== String(o.flat)).slice(0, 3), tags: ["faces"] });
}

function realObjectsQuestion() {
  const E = [["a marble", "sphere (ball)"], ["a tin of food", "cylinder"], ["a dice", "cube"], ["a cereal box", "rectangular prism (box)"], ["a party hat", "cone"], ["a tent", "pyramid"], ["an orange", "sphere (ball)"], ["a drink can", "cylinder"]];
  const [t, a] = choice(E);
  return q({ type: "real-objects", marks: 1, prompt: `What shape is ${t}?`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(OBJ.map(o => o.name).filter(x => x !== a)).slice(0, 3), tags: ["real world"] });
}

function cupsRows(a, b) {
  const per = Math.max(a, b);
  return mani({ diagramType: "objects", items: [...Array(a).fill("cup"), ...Array(per - a).fill(""), ...Array(b).fill("cup"), ...Array(per - b).fill("")], perRow: per, rowLabels: ["A", "B"] });
}

function holdsMoreQuestion() {
  const a = randInt(2, 8); let b = randInt(2, 8); if (a === b) b = a === 8 ? 5 : a + 1;
  const ask = choice(["more", "less"]); const ans = (ask === "more") === (a > b) ? "A" : "B";
  return qC({ type: "holds-more", marks: 1, prompt: `Count the cups each container holds. Which holds ${ask}, A or B?`, diagram: cupsRows(a, b), answer: ans, working: [`A holds ${a} cups. B holds ${b} cups.`], space: SPACE_SIZES.SMALL, mcDistractors: [ans === "A" ? "B" : "A", "the same"], tags: ["capacity", "compare"] });
}

function cupsToFillQuestion() {
  const n = randInt(3, 10); const holder = choice(["jug", "bucket", "bottle", "vase"]);
  return qC({ type: "cups-to-fill", marks: 1, prompt: `These cups of water fill the ${holder}. How many cups does it hold?`, diagram: mani({ diagramType: "objects", count: n, item: "cup" }), answer: `${n} cups`, working: ["Count the cups."], space: SPACE_SIZES.SMALL, mcDistractors: [`${n + 1} cups`, `${n - 1} cups`], tags: ["capacity", "informal units"] });
}

function orderCapacityQuestion() {
  const vals = shuffle([randInt(2, 4), randInt(5, 7), randInt(8, 10)]); const names = ["A", "B", "C"];
  const order = names.slice().sort((x, y) => vals[names.indexOf(x)] - vals[names.indexOf(y)]).join(", ");
  return qC({ type: "order-capacity", marks: 1, prompt: `A holds ${vals[0]} cups. B holds ${vals[1]} cups. C holds ${vals[2]} cups. Order from holds least to holds most.`, answer: order, working: ["Fewer cups means it holds less."], space: SPACE_SIZES.SMALL, mcDistractors: [order.split(", ").reverse().join(", "), "A, B, C"].filter(x => x !== order), tags: ["capacity", "order"] });
}

function countBlocksQuestion() {
  const l = randInt(2, 4); const h = randInt(1, 3); const w = randInt(1, 2);
  const heights = Array.from({ length: w }, () => Array(l).fill(h));
  return qC({ type: "count-blocks", marks: 1, prompt: "How many blocks? (No blocks are hidden.)", diagram: vol(heights), answer: String(l * h * w), working: [`Count each layer: ${l * w} blocks. ${h} layer${h > 1 ? "s" : ""}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(l * h * w + 1), String(l * h * w - 1), String(l + h + w)], tags: ["volume", "counting"] });
}

const GENERATORS = {
  "name-object": nameObjectQuestion,
  "roll-or-stack": rollOrStackQuestion,
  "flat-faces": flatFacesQuestion,
  "real-objects": realObjectsQuestion,
  "holds-more": holdsMoreQuestion,
  "cups-to-fill": cupsToFillQuestion,
  "order-capacity": orderCapacityQuestion,
  "count-blocks": countBlocksQuestion
};

export function getThreeDSpaceAQuestionTypes() { return TYPE_LIST; }
export function generateThreeDSpaceAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
