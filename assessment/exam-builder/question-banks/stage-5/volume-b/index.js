/*
  Mills Maths Tools — Stage 5 Question Bank: Volume B
  ----------------------------------------------------
  question-banks/stage-5/volume-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-VOL-P-01 (Path):
    solves problems involving the volume of right pyramids, right cones,
    spheres and related composite solids.

  Content:
    - V = ⅓Ah for right pyramids (square, rectangular, triangular bases)
    - V = ⅓πr²h for cones, including finding h from the slant height
    - V = 4/3 πr³ for spheres, and hemispheres
    - composite solids (cone/hemisphere on cylinder, ice-cream cone,
      pyramid on prism) and solids with parts removed
    - finding a dimension from a volume
    - capacity (1 cm³ = 1 mL, 1 m³ = 1000 L) and practical problems
    - comparing: a cone is ⅓ of the cylinder with the same base and height

  Diagrams: solids-engine `measured`.
*/

import {
  SPACE_SIZES, randInt, choice, makeQuestion, generateFromRegistry, fmt, fixed
} from "../../_shared/bank-helpers.js";

const TOPIC = "Volume B";

const TYPE_LIST = [
  { id: "pyramid-volume", label: "Volume of a pyramid" },
  { id: "pyramid-volume-slant", label: "Pyramid volume from the slant height" },
  { id: "cone-volume", label: "Volume of a cone" },
  { id: "cone-volume-slant", label: "Cone volume from the slant height" },
  { id: "sphere-volume", label: "Volume of a sphere" },
  { id: "hemisphere-volume", label: "Volume of a hemisphere" },
  { id: "composite-volume", label: "Volume of composite solids" },
  { id: "volume-removed", label: "Solids with a part removed" },
  { id: "volume-find-dimension", label: "Find a dimension from the volume" },
  { id: "volume-capacity", label: "Volume and capacity" },
  { id: "cone-cylinder-compare", label: "Compare a cone and a cylinder" },
  { id: "volume-practical", label: "Practical volume problems" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "volume", ...(spec.tags || [])] });
const solid = (kind, dims, labels, extra = {}) => ({ engine: "solids-engine", config: { diagramType: "measured", kind, dims, labels, ...extra } });
const f2 = v => (Math.abs(v - Math.round(v)) < 1e-9 ? fmt(v, 0) : fixed(v, 2));
const PI = Math.PI;
const UNITS = ["cm", "m", "mm"];
const cu = u => `${u}³`;

function pyramidVolumeQuestion() {
  const u = choice(UNITS); const rect = Math.random() < 0.4;
  const a = randInt(3, 15); const b = rect ? a + randInt(2, 6) : a; const h = randInt(4, 20);
  const V = (a * b * h) / 3;
  return q({
    type: "pyramid-volume", marks: 2,
    prompt: `Find the volume of a right pyramid with a ${rect ? `rectangular base ${b} ${u} by ${a} ${u}` : `square base of side ${a} ${u}`} and perpendicular height ${h} ${u}${Number.isInteger(V) ? "" : ", correct to 2 decimal places"}.`,
    diagram: solid("pyramid", { a: b, h: h * 0.6 }, rect ? { a: `${b} ${u}`, b: `${a} ${u}`, h: `${h} ${u}` } : { a: `${a} ${u}`, h: `${h} ${u}` }, rect ? { base: "rectangle" } : {}),
    answer: `${f2(V)} ${cu(u)}`,
    working: ["V = ⅓Ah", `A = ${b} × ${a} = ${a * b}`, `V = ⅓ × ${a * b} × ${h} = ${f2(V)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${f2(a * b * h)} ${cu(u)}`, `${f2(a * b * h / 2)} ${cu(u)}`, `${f2((a + b) * h / 3)} ${cu(u)}`],
    tags: ["pyramid"]
  });
}

function pyramidVolumeSlantQuestion() {
  const u = choice(UNITS);
  const [half, h, l] = choice([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [9, 12, 15], [8, 15, 17]]);
  const a = 2 * half; const V = (a * a * h) / 3;
  return q({
    type: "pyramid-volume-slant", marks: 3,
    prompt: `A square-based right pyramid has base edge ${a} ${u} and the slant height of each face is ${l} ${u}. Find its perpendicular height and its volume.`,
    diagram: solid("pyramid", { a, h }, { a: `${a} ${u}`, slant: `${l} ${u}`, h: "h" }),
    answer: `h = ${h} ${u}; V = ${f2(V)} ${cu(u)}`,
    working: [`h² + ${half}² = ${l}²`, `h = √(${l * l} − ${half * half}) = ${h}`, `V = ⅓ × ${a}² × ${h} = ${f2(V)}`],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [`h = ${h} ${u}; V = ${f2(a * a * h)} ${cu(u)}`, `h = ${l} ${u}; V = ${f2(a * a * l / 3)} ${cu(u)}`],
    tags: ["pyramid", "Pythagoras"]
  });
}

function coneVolumeQuestion() {
  const u = choice(UNITS); const r = randInt(2, 12); const h = randInt(3, 20);
  const V = (PI * r * r * h) / 3; const exact = Math.random() < 0.3 && (r * r * h) % 3 === 0;
  return q({
    type: "cone-volume", marks: 2,
    prompt: `Find the volume of a cone with radius ${r} ${u} and perpendicular height ${h} ${u}${exact ? ", in terms of π" : ", correct to 2 decimal places"}.`,
    diagram: solid("cone", { r, h }, { r: `${r} ${u}`, h: `${h} ${u}` }),
    answer: exact ? `${(r * r * h) / 3}π ${cu(u)}` : `${f2(V)} ${cu(u)}`,
    working: ["V = ⅓πr²h", `= ⅓ × π × ${r}² × ${h}`, exact ? `= ${(r * r * h) / 3}π` : `≈ ${f2(V)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: exact ? [`${r * r * h}π ${cu(u)}`, `${(r * h) / 3 * 2}π ${cu(u)}`] : [`${f2(PI * r * r * h)} ${cu(u)}`, `${f2(PI * r * h / 3)} ${cu(u)}`, `${f2(PI * 4 * r * r * h / 3)} ${cu(u)}`],
    tags: ["cone"]
  });
}

function coneVolumeSlantQuestion() {
  const u = choice(UNITS);
  const [r, h, l] = choice([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25]]);
  const V = (PI * r * r * h) / 3;
  return q({
    type: "cone-volume-slant", marks: 3,
    prompt: `A cone has radius ${r} ${u} and slant height ${l} ${u}. Find its volume, correct to 2 decimal places.`,
    diagram: solid("cone", { r, h }, { r: `${r} ${u}`, l: `${l} ${u}`, h: "h" }),
    answer: `${f2(V)} ${cu(u)}`,
    working: [`h = √(${l}² − ${r}²) = ${h}`, `V = ⅓π × ${r}² × ${h} ≈ ${f2(V)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${f2(PI * r * r * l / 3)} ${cu(u)}`, `${f2(PI * r * r * h)} ${cu(u)}`],
    tags: ["cone", "Pythagoras"]
  });
}

function sphereVolumeQuestion() {
  const u = choice(UNITS); const useD = Math.random() < 0.4; const r = randInt(1, 12);
  const V = (4 / 3) * PI * r ** 3;
  return q({
    type: "sphere-volume", marks: 2,
    prompt: `Find the volume of a sphere with ${useD ? `diameter ${2 * r}` : `radius ${r}`} ${u}, correct to 2 decimal places.`,
    diagram: solid("sphere", {}, useD ? { d: `${2 * r} ${u}` } : { r: `${r} ${u}` }),
    answer: `${f2(V)} ${cu(u)}`,
    working: [useD ? `r = ${r}` : "", "V = ⁴⁄₃πr³", `= ⁴⁄₃ × π × ${r}³ ≈ ${f2(V)}`].filter(Boolean),
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${f2(4 * PI * r * r)} ${cu(u)}`, `${f2((4 / 3) * PI * (2 * r) ** 3)} ${cu(u)}`, `${f2((4 / 3) * PI * r * r)} ${cu(u)}`],
    tags: ["sphere"]
  });
}

function hemisphereVolumeQuestion() {
  const u = choice(UNITS); const r = randInt(2, 15); const V = (2 / 3) * PI * r ** 3;
  return q({
    type: "hemisphere-volume", marks: 2,
    prompt: `Find the volume of a hemisphere of radius ${r} ${u}, correct to 2 decimal places.`,
    diagram: solid("hemisphere", {}, { r: `${r} ${u}` }),
    answer: `${f2(V)} ${cu(u)}`,
    working: ["V = ½ × ⁴⁄₃πr³ = ⅔πr³", `= ⅔ × π × ${r}³ ≈ ${f2(V)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${f2((4 / 3) * PI * r ** 3)} ${cu(u)}`, `${f2(2 * PI * r * r)} ${cu(u)}`],
    tags: ["hemisphere"]
  });
}

function compositeVolumeQuestion() {
  const u = choice(["cm", "m"]);
  const kind = choice(["cone-cylinder", "hemisphere-cylinder", "cone-hemisphere", "pyramid-prism"]);
  if (kind === "cone-cylinder") {
    const r = randInt(2, 8); const h = randInt(3, 10); const ch = randInt(4, 14);
    const V = PI * r * r * ch + (PI * r * r * h) / 3;
    return q({ type: "composite-volume", marks: 3, prompt: `The solid is a cone on top of a cylinder, both of radius ${r} ${u}. The cylinder is ${ch} ${u} tall and the cone is ${h} ${u} tall. Find the volume, correct to 2 decimal places.`, diagram: solid("cone-cylinder", { r, ch, h }, { r: `${r} ${u}`, ch: `${ch} ${u}`, h: `${h} ${u}` }), answer: `${f2(V)} ${cu(u)}`, working: [`Cylinder π × ${r}² × ${ch} = ${r * r * ch}π`, `Cone ⅓π × ${r}² × ${h} = ${f2(r * r * h / 3)}π`, `Total ≈ ${f2(V)}`], space: SPACE_SIZES.LARGE, mcDistractors: [`${f2(PI * r * r * (ch + h))} ${cu(u)}`, `${f2(PI * r * r * (ch + h) / 3)} ${cu(u)}`], tags: ["composite"] });
  }
  if (kind === "hemisphere-cylinder") {
    const r = randInt(2, 8); const ch = randInt(4, 14);
    const V = PI * r * r * ch + (2 / 3) * PI * r ** 3;
    return q({ type: "composite-volume", marks: 3, prompt: `A capsule-shaped tank is a cylinder of radius ${r} ${u} and length ${ch} ${u} with a hemisphere on top. Find its volume, correct to 2 decimal places.`, diagram: solid("hemisphere-cylinder", { r, ch }, { r: `${r} ${u}`, ch: `${ch} ${u}` }), answer: `${f2(V)} ${cu(u)}`, working: [`Cylinder π × ${r}² × ${ch} ≈ ${f2(PI * r * r * ch)}`, `Hemisphere ⅔π × ${r}³ ≈ ${f2((2 / 3) * PI * r ** 3)}`, `Total ≈ ${f2(V)}`], space: SPACE_SIZES.LARGE, mcDistractors: [`${f2(PI * r * r * ch + (4 / 3) * PI * r ** 3)} ${cu(u)}`, `${f2(PI * r * r * (ch + r))} ${cu(u)}`], tags: ["composite"] });
  }
  if (kind === "cone-hemisphere") {
    const r = randInt(2, 5); const h = randInt(6, 14);
    const V = (PI * r * r * h) / 3 + (2 / 3) * PI * r ** 3;
    return q({ type: "composite-volume", marks: 3, prompt: `An ice-cream cone is filled and topped with a hemisphere of ice-cream. The radius is ${r} cm and the cone is ${h} cm deep. Find the total volume of ice-cream, correct to 2 decimal places.`, diagram: solid("cone-hemisphere", { r, h }, { r: "" + r + " cm", h: `${h} cm` }), answer: `${f2(V)} cm³`, working: [`Cone ⅓π × ${r}² × ${h} ≈ ${f2(PI * r * r * h / 3)}`, `Hemisphere ⅔π × ${r}³ ≈ ${f2((2 / 3) * PI * r ** 3)}`, `Total ≈ ${f2(V)} cm³`], space: SPACE_SIZES.LARGE, mcDistractors: [`${f2(PI * r * r * h / 3 + (4 / 3) * PI * r ** 3)} cm³`, `${f2(PI * r * r * h + (2 / 3) * PI * r ** 3)} cm³`], tags: ["composite"] });
  }
  const a = randInt(4, 12); const ph = randInt(3, 12); const h = randInt(3, 10);
  const V = a * a * ph + (a * a * h) / 3;
  return q({ type: "composite-volume", marks: 3, prompt: `A square pyramid of height ${h} ${u} sits on top of a square prism of height ${ph} ${u}. Both have base edge ${a} ${u}. Find the total volume.`, diagram: solid("pyramid-prism", { a, h, ph }, { a: `${a} ${u}`, h: `${h} ${u}`, ph: `${ph} ${u}` }), answer: `${f2(V)} ${cu(u)}`, working: [`Prism ${a}² × ${ph} = ${a * a * ph}`, `Pyramid ⅓ × ${a}² × ${h} = ${f2(a * a * h / 3)}`, `Total ${f2(V)}`], space: SPACE_SIZES.LARGE, mcDistractors: [`${f2(a * a * (ph + h))} ${cu(u)}`, `${f2(a * a * (ph + h) / 3)} ${cu(u)}`], tags: ["composite"] });
}

function volumeRemovedQuestion() {
  const v = choice(["cube-sphere", "cylinder-cone"]);
  if (v === "cube-sphere") {
    const s = choice([6, 8, 10, 12]); const r = s / 2;
    const V = s ** 3 - (4 / 3) * PI * r ** 3;
    return q({ type: "volume-removed", marks: 3, prompt: `A sphere fits exactly inside a cube box of side ${s} cm. What volume of the box is empty space, correct to 2 decimal places?`, answer: `${f2(V)} cm³`, working: [`Cube ${s}³ = ${s ** 3}`, `Sphere r = ${r}: ⁴⁄₃π × ${r}³ ≈ ${f2((4 / 3) * PI * r ** 3)}`, `Empty ≈ ${f2(V)} cm³`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${f2(s ** 3 - PI * r * r * s)} cm³`, `${f2(s ** 3 - 4 * PI * r * r)} cm³`, `${f2((4 / 3) * PI * r ** 3)} cm³`], tags: ["removed"] });
  }
  const r = randInt(3, 8); const h = randInt(6, 15);
  const V = PI * r * r * h - (PI * r * r * h) / 3;
  return q({ type: "volume-removed", marks: 2, prompt: `A cone is drilled out of a solid cylinder. Both have radius ${r} cm and height ${h} cm. Find the volume remaining, in terms of π.`, diagram: solid("cylinder", { r, h }, { r: `${r} cm`, h: `${h} cm` }), answer: `${f2(2 * r * r * h / 3)}π cm³`, working: [`Cylinder ${r * r * h}π`, `Cone ⅓ × ${r * r * h}π`, `Remaining ⅔ × ${r * r * h}π = ${f2(2 * r * r * h / 3)}π`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${f2(r * r * h / 3)}π cm³`, `${r * r * h}π cm³`], tags: ["removed"] });
}

function volumeFindDimensionQuestion() {
  const v = choice(["cone-h", "sphere-r", "pyramid-h"]);
  const u = choice(UNITS);
  if (v === "cone-h") { const r = randInt(2, 9); const h = randInt(3, 18); const V = PI * r * r * h / 3; return q({ type: "volume-find-dimension", marks: 2, prompt: `A cone of radius ${r} ${u} has a volume of ${f2(V)} ${cu(u)}. Find its height, to the nearest whole ${u}.`, answer: `${h} ${u}`, working: [`⅓π × ${r}² × h = ${f2(V)}`, `h = 3 × ${f2(V)} ÷ (π × ${r * r}) ≈ ${h}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.round(V / (PI * r * r))} ${u}`, `${Math.round(3 * V / (PI * r))} ${u}`], tags: ["reverse", "cone"] }); }
  if (v === "sphere-r") { const r = randInt(2, 12); const V = (4 / 3) * PI * r ** 3; return q({ type: "volume-find-dimension", marks: 2, prompt: `A sphere has a volume of ${f2(V)} ${cu(u)}. Find its radius, to the nearest whole ${u}.`, answer: `${r} ${u}`, working: [`⁴⁄₃πr³ = ${f2(V)}`, `r³ = 3 × ${f2(V)} ÷ 4π ≈ ${f2(r ** 3)}`, `r = ∛${f2(r ** 3)} ≈ ${r}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.round(Math.sqrt(3 * V / (4 * PI)))} ${u}`, `${Math.round(3 * V / (4 * PI))} ${u}`], tags: ["reverse", "sphere"] }); }
  const a = randInt(3, 12); const h = randInt(3, 15); const V = a * a * h / 3;
  if (!Number.isInteger(V)) return volumeFindDimensionQuestion();
  return q({ type: "volume-find-dimension", marks: 2, prompt: `A square pyramid has base edge ${a} ${u} and volume ${V} ${cu(u)}. Find its perpendicular height.`, answer: `${h} ${u}`, working: [`⅓ × ${a * a} × h = ${V}`, `h = 3 × ${V} ÷ ${a * a} = ${h}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${f2(V / (a * a))} ${u}`, `${f2(3 * V / a)} ${u}`], tags: ["reverse", "pyramid"] });
}

function volumeCapacityQuestion() {
  const v = choice(["cone-mL", "sphere-L", "tank-kL"]);
  if (v === "cone-mL") { const r = randInt(3, 6); const h = randInt(8, 15); const V = PI * r * r * h / 3; return q({ type: "volume-capacity", marks: 2, prompt: `A conical paper cup has radius ${r} cm and depth ${h} cm. How many millilitres does it hold, to the nearest mL?`, diagram: solid("cone", { r, h }, { r: `${r} cm`, h: `${h} cm` }), answer: `${Math.round(V)} mL`, working: [`V = ⅓π × ${r}² × ${h} ≈ ${f2(V)} cm³`, "1 cm³ = 1 mL"], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.round(V * 3)} mL`, `${f2(V / 1000)} mL`], tags: ["capacity"] }); }
  if (v === "sphere-L") { const r = randInt(10, 25); const V = (4 / 3) * PI * r ** 3; return q({ type: "volume-capacity", marks: 2, prompt: `A spherical fish bowl has an inside radius of ${r} cm. Find its capacity in litres, correct to 1 decimal place.`, answer: `${fixed(V / 1000, 1)} L`, working: [`V = ⁴⁄₃π × ${r}³ ≈ ${f2(V)} cm³`, `÷ 1000 = ${fixed(V / 1000, 1)} L`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${fixed(V / 100, 1)} L`, `${fixed(4 * PI * r * r / 1000, 1)} L`], tags: ["capacity"] }); }
  const r = choice([1.5, 2, 2.5, 3]); const ch = choice([3, 4, 5]); const V = PI * r * r * ch + (2 / 3) * PI * r ** 3;
  return q({ type: "volume-capacity", marks: 3, prompt: `A water tank is a cylinder of radius ${r} m and height ${ch} m with a hemispherical top. Find its capacity in kilolitres, correct to 1 decimal place. (1 m³ = 1 kL)`, diagram: solid("hemisphere-cylinder", { r, ch }, { r: `${r} m`, ch: `${ch} m` }), answer: `${fixed(V, 1)} kL`, working: [`Cylinder π × ${r}² × ${ch} ≈ ${f2(PI * r * r * ch)} m³`, `Hemisphere ⅔π × ${r}³ ≈ ${f2((2 / 3) * PI * r ** 3)} m³`, `Total ≈ ${fixed(V, 1)} m³ = ${fixed(V, 1)} kL`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${fixed(V * 1000, 1)} kL`, `${fixed(PI * r * r * ch, 1)} kL`], tags: ["capacity"] });
}

function coneCylinderCompareQuestion() {
  const v = choice(["ratio", "fill"]);
  const r = randInt(3, 8); const h = randInt(6, 15);
  if (v === "ratio") return q({ type: "cone-cylinder-compare", marks: 1, prompt: `A cone and a cylinder both have radius ${r} cm and height ${h} cm. What fraction of the cylinder's volume is the cone's volume?`, answer: "[[frac:1:3]]", working: ["V(cone) = ⅓πr²h = ⅓ × V(cylinder)"], space: SPACE_SIZES.SMALL, mcDistractors: ["[[frac:1:2]]", "[[frac:2:3]]", "[[frac:1:4]]"], tags: ["compare"] });
  return q({ type: "cone-cylinder-compare", marks: 2, prompt: `A cylindrical jug has radius ${r} cm and height ${h} cm. How many full conical cups with the same radius and height are needed to fill it? Explain.`, answer: "3 cups: a cone holds one third of a cylinder with the same base and height.", working: ["⅓πr²h × 3 = πr²h"], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["compare"] });
}

function volumePracticalQuestion() {
  const v = choice(["balls-in-tube", "melt", "sand-pile"]);
  if (v === "balls-in-tube") {
    const r = choice([3, 3.5, 4]); const n = 3; const h = 2 * r * n;
    const cyl = PI * r * r * h; const balls = n * (4 / 3) * PI * r ** 3; const pct = (balls / cyl) * 100;
    return q({ type: "volume-practical", marks: 3, prompt: `Three tennis balls, each of radius ${r} cm, fit exactly in a cylindrical can (the can's radius is ${r} cm and its height is ${h} cm). What percentage of the can is filled by the balls?`, answer: `${fixed(pct, 1)}% (exactly ⅔)`, working: [`Can π × ${r}² × ${h} ≈ ${f2(cyl)}`, `Balls 3 × ⁴⁄₃π × ${r}³ ≈ ${f2(balls)}`, `${f2(balls)} ÷ ${f2(cyl)} ≈ ${fixed(pct, 1)}%`], space: SPACE_SIZES.MEDIUM, mcDistractors: ["50.0%", "75.0%", "33.3%"], tags: ["practical"] });
  }
  if (v === "melt") {
    const R = choice([6, 9, 12]); const r = R / 3; const n = 27;
    return q({ type: "volume-practical", marks: 3, prompt: `A solid metal sphere of radius ${R} cm is melted down and recast into small spheres of radius ${r} cm. How many small spheres can be made?`, answer: `${n}`, working: [`Big: ⁴⁄₃π × ${R}³; small: ⁴⁄₃π × ${r}³`, `Ratio (${R} ÷ ${r})³ = 3³ = 27`], space: SPACE_SIZES.MEDIUM, mcDistractors: ["3", "9", "81"], tags: ["practical"] });
  }
  const r = randInt(2, 5); const h = randInt(1, 3) + 0.5; const V = PI * r * r * h / 3; const trucks = choice([4, 6, 8]);
  return q({ type: "volume-practical", marks: 3, prompt: `A pile of sand is a cone ${r} m in radius and ${h} m high. A truck carries ${trucks} m³. How many truckloads are needed to move the pile?`, answer: `${Math.ceil(V / trucks)} truckloads (V ≈ ${f2(V)} m³)`, working: [`V = ⅓π × ${r}² × ${h} ≈ ${f2(V)} m³`, `${f2(V)} ÷ ${trucks} ≈ ${fixed(V / trucks, 2)}, so round up to ${Math.ceil(V / trucks)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.floor(V / trucks)} truckloads (V ≈ ${f2(V)} m³)`, `${Math.ceil(PI * r * r * h / trucks)} truckloads (V ≈ ${f2(PI * r * r * h)} m³)`].filter(s => !s.startsWith(`${Math.ceil(V / trucks)} `)), tags: ["practical"] });
}

const GENERATORS = {
  "pyramid-volume": pyramidVolumeQuestion,
  "pyramid-volume-slant": pyramidVolumeSlantQuestion,
  "cone-volume": coneVolumeQuestion,
  "cone-volume-slant": coneVolumeSlantQuestion,
  "sphere-volume": sphereVolumeQuestion,
  "hemisphere-volume": hemisphereVolumeQuestion,
  "composite-volume": compositeVolumeQuestion,
  "volume-removed": volumeRemovedQuestion,
  "volume-find-dimension": volumeFindDimensionQuestion,
  "volume-capacity": volumeCapacityQuestion,
  "cone-cylinder-compare": coneCylinderCompareQuestion,
  "volume-practical": volumePracticalQuestion
};

export function getVolumeBQuestionTypes() { return TYPE_LIST; }
export function generateVolumeBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
