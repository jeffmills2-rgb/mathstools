/*
  Mills Maths Tools — Stage 2 Question Bank: 3D Objects A
  --------------------------------------------------------
  question-banks/stage-2/three-d-space-a/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Three-dimensional spatial
  structure A" — MA2-3DS-01.

  Big ideas:
    - 3D objects are described by their FACES (flat surfaces), EDGES (where
      two faces meet) and VERTICES (corners);
    - a PRISM has two matching ends joined by rectangles; a PYRAMID has one
      base and triangles meeting at a point (the apex);
    - curved objects (cylinder, cone, sphere) have curved surfaces, so they
      can roll;
    - a NET is the object unfolded flat.

  Solid pictures and nets come from the Stage 3 bank's definitions, so the
  counts and drawings agree across stages.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { solidD, makeStage2, choice, shuffle } from "../../_shared/stage2-helpers.js";
import { SOLIDS, fev, NETS } from "../../stage-3/three-d-space-volume/index.js";

const TOPIC = "3D Objects A";
const q = makeStage2(TOPIC, "MA2-3DS-01");

const TYPE_LIST = [
  { id: "name-object", label: "Name the 3D object" },
  { id: "faces-edges-vertices", label: "Count faces, edges and vertices" },
  { id: "flat-curved", label: "Flat and curved surfaces" },
  { id: "prism-or-pyramid", label: "Prism or pyramid?" },
  { id: "face-shapes", label: "What shapes are the faces?" },
  { id: "net-to-object", label: "Which object does the net make?" },
  { id: "everyday-objects", label: "3D objects in the world" },
  { id: "roll-stack-slide", label: "Roll, stack or slide?" },
  { id: "object-riddle", label: "3D object riddles" }
];

const pick = ids => SOLIDS.filter(s => ids.includes(s.id));
const BASIC = pick(["cube", "rectangular-prism", "triangular-prism", "square-pyramid", "triangular-pyramid", "hexagonal-prism", "pentagonal-pyramid"]);
const CURVED = pick(["cylinder", "cone", "sphere"]);
const draw = s => solidD({ diagramType: "solid", ...s.config });

function nameObjectQuestion() {
  const s = choice([...BASIC, ...CURVED]);
  const others = shuffle([...BASIC, ...CURVED].filter(o => o !== s)).slice(0, 3).map(o => o.name);
  return q({ type: "name-object", marks: 1, prompt: "Name this 3D object.", diagram: draw(s), answer: s.name, working: [s.family === "prism" ? "Two matching ends joined by rectangles: a prism, named by its end." : s.family === "pyramid" ? "One base with triangles meeting at a point: a pyramid, named by its base." : "It has a curved surface."], space: SPACE_SIZES.SMALL, mcDistractors: others, tags: ["naming"] });
}

function facesEdgesVerticesQuestion() {
  const s = choice(BASIC.slice(0, 5)); const { F, E, V } = fev(s);
  const which = choice(["F", "E", "V", "all"]);
  if (which === "all") return q({ type: "faces-edges-vertices", marks: 2, prompt: `How many faces, edges and vertices does this ${s.name.toLowerCase()} have? (Dashed lines are edges at the back.)`, diagram: draw(s), answer: `${F} faces, ${E} edges, ${V} vertices`, working: ["Faces are flat surfaces, edges are where faces meet, vertices are corners."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["faces", "edges", "vertices"] });
  const word = { F: "faces", E: "edges", V: "vertices (corners)" }[which]; const val = { F, E, V }[which];
  return q({ type: "faces-edges-vertices", marks: 1, prompt: `How many ${word} does this ${s.name.toLowerCase()} have? (Dashed lines are edges at the back.)`, diagram: draw(s), answer: String(val), working: [`${s.name}: ${F} faces, ${E} edges, ${V} vertices.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(F), String(E), String(V), String(val + 1)].filter(x => x !== String(val)), tags: ["faces", "edges", "vertices"] });
}

function flatCurvedQuestion() {
  const s = choice(CURVED);
  const info = { cylinder: ["2 flat faces and 1 curved surface", "a can of soup"], cone: ["1 flat face and 1 curved surface", "an ice-cream cone"], sphere: ["no flat faces and 1 curved surface", "a ball"] }[s.id];
  return q({ type: "flat-curved", marks: 1, prompt: `How many flat faces and curved surfaces does this ${s.name.toLowerCase()} have?`, diagram: draw(s), answer: info[0], working: [`Think of ${info[1]}.`], space: SPACE_SIZES.SMALL, mcDistractors: ["2 flat faces and 1 curved surface", "1 flat face and 1 curved surface", "no flat faces and 1 curved surface", "3 flat faces and no curved surface"].filter(x => x !== info[0]), tags: ["curved"] });
}

function prismOrPyramidQuestion() {
  const s = choice(BASIC);
  const prism = s.family === "prism";
  return q({ type: "prism-or-pyramid", marks: 1, prompt: "Is this object a prism or a pyramid? How do you know?", diagram: draw(s), answer: prism ? "A prism — it has two matching ends joined by rectangles." : "A pyramid — it has one base, and triangles meet at a point.", working: [], space: SPACE_SIZES.SMALL, mcDistractors: [prism ? "A pyramid — it has one base, and triangles meet at a point." : "A prism — it has two matching ends joined by rectangles."], tags: ["prism", "pyramid"] });
}

function faceShapesQuestion() {
  const F = {
    cube: "6 squares", "rectangular-prism": "6 rectangles (some may be squares)", "triangular-prism": "2 triangles and 3 rectangles",
    "square-pyramid": "1 square and 4 triangles", "triangular-pyramid": "4 triangles", "hexagonal-prism": "2 hexagons and 6 rectangles", "pentagonal-pyramid": "1 pentagon and 5 triangles"
  };
  const s = choice(BASIC); const ans = F[s.id];
  return q({ type: "face-shapes", marks: 1, prompt: `What shapes are the faces of this ${s.name.toLowerCase()}?`, diagram: draw(s), answer: ans, working: [s.family === "prism" ? "The two ends match; the sides are rectangles." : "One base; all the other faces are triangles."], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(Object.values(F).filter(v => v !== ans)).slice(0, 3), tags: ["faces"] });
}

function netToObjectQuestion() {
  const nt = choice(NETS.filter(n => ["Cube", "Rectangular prism", "Triangular prism", "Square pyramid", "Triangular pyramid"].includes(n.solid)));
  const faces = nt.faces();
  return q({ type: "net-to-object", marks: 1, prompt: "This net is folded up. Which object does it make?", diagram: solidD({ diagramType: "net", faces }), answer: nt.solid, working: [`${faces.length} faces.`, nt.solid.includes("pyramid") ? "One base with triangles that fold up to meet at a point." : nt.solid === "Cube" ? "Six squares." : "Two matching ends and rectangles around the sides."], space: SPACE_SIZES.SMALL, mcDistractors: ["Cube", "Rectangular prism", "Triangular prism", "Square pyramid", "Triangular pyramid"].filter(x => x !== nt.solid).slice(0, 3), tags: ["nets"] });
}

function everydayObjectsQuestion() {
  const E = [["a tin of soup", "Cylinder"], ["a dice", "Cube"], ["a tennis ball", "Sphere"], ["a road cone", "Cone"], ["a cereal box", "Rectangular prism"], ["a Toblerone box", "Triangular prism"], ["the Great Pyramid in Egypt", "Square pyramid"], ["a basketball", "Sphere"], ["a brick", "Rectangular prism"], ["a party hat", "Cone"]];
  const [thing, ans] = choice(E);
  return q({ type: "everyday-objects", marks: 1, prompt: `What 3D object is ${thing} shaped like?`, answer: ans, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(["Cylinder", "Cube", "Sphere", "Cone", "Rectangular prism", "Triangular prism", "Square pyramid"].filter(x => x !== ans)).slice(0, 3), tags: ["real world"] });
}

function rollStackSlideQuestion() {
  const s = choice([...CURVED, ...BASIC.slice(0, 3)]);
  const ans = { cylinder: "It can roll, stack and slide.", cone: "It can roll (in a circle) and slide on its flat face; it does not stack well.", sphere: "It can roll, but it cannot stack or slide flat." }[s.id] || "It can stack and slide, but it cannot roll (it has no curved surface).";
  return q({ type: "roll-stack-slide", marks: 1, prompt: `Can this ${s.name.toLowerCase()} roll? Can it stack? Explain.`, diagram: draw(s), answer: ans, working: ["Curved surfaces roll. Flat faces let objects stack and slide."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["curved", "flat"] });
}

function objectRiddleQuestion() {
  const R = [
    ["I have 6 square faces.", "Cube"], ["I have 5 faces: 2 triangles and 3 rectangles.", "Triangular prism"], ["I have 5 faces: 1 square and 4 triangles.", "Square pyramid"],
    ["I have 4 faces, and they are all triangles.", "Triangular pyramid"], ["I have 2 flat circle faces and 1 curved surface.", "Cylinder"], ["I have 1 curved surface and no edges or vertices.", "Sphere"],
    ["I have 1 flat face, 1 curved surface and 1 point at the top.", "Cone"], ["I have 6 rectangle faces, 12 edges and 8 vertices.", "Rectangular prism"]
  ];
  const [clue, ans] = choice(R);
  return q({ type: "object-riddle", marks: 1, prompt: `What object am I? ${clue}`, answer: ans, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(R.map(r => r[1]).filter(x => x !== ans)).slice(0, 3), tags: ["features"] });
}

const GENERATORS = {
  "name-object": nameObjectQuestion,
  "faces-edges-vertices": facesEdgesVerticesQuestion,
  "flat-curved": flatCurvedQuestion,
  "prism-or-pyramid": prismOrPyramidQuestion,
  "face-shapes": faceShapesQuestion,
  "net-to-object": netToObjectQuestion,
  "everyday-objects": everydayObjectsQuestion,
  "roll-stack-slide": rollStackSlideQuestion,
  "object-riddle": objectRiddleQuestion
};

export function getThreeDSpaceAQuestionTypes() { return TYPE_LIST; }
export function generateThreeDSpaceAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
