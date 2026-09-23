/*
  Mills Maths Tools — Stage 4 Question Bank: Volume
  --------------------------------------------------
  question-banks/volume/index.js

  NSW Mathematics K–10 (2022), Stage 4, MA4-VOL-C-01:
    "applies knowledge of volume and capacity to solve problems involving
     right prisms and cylinders"

  Content covered (docs/stage-4-syllabus-reference.md has the mapping):
    - volume as the number of unit cubes; the formula V = lwh
    - units of volume (mm³, cm³, m³) and of capacity (mL, L, kL, ML), and the
      link between them: 1 cm³ = 1 mL, 1000 cm³ = 1 L, 1 m³ = 1000 L = 1 kL
    - the uniform cross-section of a right prism and V = Ah
    - triangular, quadrilateral and composite right prisms; cylinders
    - finding an unknown dimension from a volume
    - practical capacity problems (filling, pouring, rates of flow)

  Stage 5 "Volume A" (question-banks/stage-5/volume-a/) goes further with part-
  circle prisms and composite cylinders; those stay there. The diagrams come
  from engines/volume/volume-engine.js, which gained a `cube-array` type and a
  `showArea: false` option on the uniform-cross-section prism for this bank.

  Conventions: π answers are given to 1 decimal place unless the prompt asks
  for an exact answer; every answer carries its unit; one mark is a single
  step, two marks need the cross-section area first, three are multi-step.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, fmt, spaced, plural
} from "../_shared/bank-helpers.js";

const TOPIC = "Volume";

const TYPE_LIST = [
  { id: "count-cubes", label: "Volume by counting cubes" },
  { id: "rectangular-prisms", label: "Rectangular prisms and cubes" },
  { id: "volume-units", label: "Convert units of volume" },
  { id: "capacity-units", label: "Convert units of capacity" },
  { id: "volume-capacity", label: "Volume and capacity (1 cm³ = 1 mL)" },
  { id: "cross-sections", label: "Identify prisms and cross-sections" },
  { id: "volume-from-area", label: "Volume from the cross-section area (V = Ah)" },
  { id: "triangular-prisms", label: "Triangular prisms" },
  { id: "quadrilateral-prisms", label: "Trapezium, parallelogram and rhombus prisms" },
  { id: "composite-prisms", label: "Composite prisms" },
  { id: "cylinders", label: "Volume of cylinders" },
  { id: "missing-dimension", label: "Find a missing dimension" },
  { id: "container-capacity", label: "Capacity of containers" },
  { id: "practical-problems", label: "Worded volume and capacity problems" },
  { id: "choose-units", label: "Choose appropriate units" },
  { id: "spot-the-error", label: "Spot the error (reasoning)" },
  { id: "multi-part-volume", label: "Multi-part volume problem" }
];

const q = spec => makeQuestion(TOPIC, spec);
const cubed = u => `${u}³`;
/* The volume engine draws every solid at fixed proportions, so any figure
   carrying dimensions is marked not to scale. Counted cubes are exact. */
const vol = (engineType, config) => ({
  engine: "volume-engine",
  config: { diagramType: engineType, ...config },
  ...(engineType === "cube-array" ? {} : { notToScale: true })
});

/* ── counting cubes and V = lwh ──────────────────────────── */

function countCubesQuestion() {
  const l = randInt(2, 5);
  const w = randInt(1, 3);
  const h = randInt(1, 4);
  const lShape = Math.random() < 0.35 && l >= 3 && h >= 2;
  let heights;
  let total;
  if (lShape) {
    // A step: the front rows are lower on the right.
    const cut = randInt(1, l - 1);
    const low = randInt(1, h - 1);
    heights = Array.from({ length: w }, () => Array.from({ length: l }, (_, c) => (c < cut ? h : low)));
    total = w * (cut * h + (l - cut) * low);
  } else {
    heights = Array.from({ length: w }, () => Array.from({ length: l }, () => h));
    total = l * w * h;
  }
  return q({
    type: "count-cubes",
    marks: 1,
    prompt: `The solid is built from 1 cm cubes. What is its volume?`,
    diagram: vol("cube-array", { heights }),
    answer: `${total} cm³`,
    working: lShape
      ? ["Count the cubes in each layer or column and add.", `${total} cubes, so V = ${total} cm³`]
      : [`${l} cubes long × ${w} wide × ${h} high = ${total} cubes`, `V = ${total} cm³`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${total + w * l} cm³`, `${Math.max(1, total - l)} cm³`, `${2 * (l * w + l * h + w * h)} cm³`, `${total} cm²`],
    tags: ["volume", "cubes"]
  });
}

function rectangularPrismQuestion() {
  const cube = Math.random() < 0.25;
  const unit = choice(["cm", "m", "mm"]);
  const decimals = !cube && Math.random() < 0.3;
  const l = cube ? randInt(3, 12) : decimals ? randInt(12, 60) / 2 : randInt(4, 18);
  const w = cube ? l : randInt(2, 12);
  const h = cube ? l : randInt(2, 14);
  const V = l * w * h;
  return q({
    type: "rectangular-prisms",
    marks: cube ? 1 : 2,
    prompt: cube ? "Find the volume of the cube." : "Find the volume of the rectangular prism.",
    diagram: vol("rectangular-prism", { length: fmt(l), width: w, height: h, unit, label: "", isCube: cube }),
    answer: `${fmt(V)} ${cubed(unit)}`,
    working: cube
      ? [`V = s³ = ${l} × ${l} × ${l}`, `V = ${fmt(V)} ${cubed(unit)}`]
      : ["V = l × w × h", `V = ${fmt(l)} × ${w} × ${h}`, `V = ${fmt(V)} ${cubed(unit)}`],
    space: cube ? SPACE_SIZES.SMALL : SPACE_SIZES.MEDIUM,
    tags: ["volume", "rectangular prism"]
  });
}

/* ── units ───────────────────────────────────────────────── */

function volumeUnitsQuestion() {
  const conversions = [
    { from: "cm³", to: "mm³", k: 1000, make: () => choice([2, 3.5, 0.8, 12, 0.25, 7.2]) },
    { from: "mm³", to: "cm³", k: 1 / 1000, make: () => choice([4000, 2500, 750, 12000, 300, 48000]) },
    { from: "m³", to: "cm³", k: 1e6, make: () => choice([2, 0.5, 1.2, 3, 0.04, 0.75]) },
    { from: "cm³", to: "m³", k: 1e-6, make: () => choice([3000000, 500000, 1200000, 45000, 2500000]) }
  ];
  const c = choice(conversions);
  const v = c.make();
  const ans = Number((v * c.k).toPrecision(10));
  const why = {
    "cm³>mm³": "1 cm = 10 mm, so 1 cm³ = 10 × 10 × 10 = 1000 mm³.",
    "mm³>cm³": "1 cm³ = 1000 mm³, so divide by 1000.",
    "m³>cm³": "1 m = 100 cm, so 1 m³ = 100 × 100 × 100 = 1 000 000 cm³.",
    "cm³>m³": "1 m³ = 1 000 000 cm³, so divide by 1 000 000."
  }[`${c.from}>${c.to}`];
  const wrong = c.k > 1 ? [v * Math.cbrt(c.k), v * Math.cbrt(c.k) ** 2, v / c.k] : [v * Math.cbrt(c.k), v / Math.cbrt(c.k), v / c.k];
  return q({
    type: "volume-units",
    marks: 1,
    prompt: `Convert ${spaced(v)} ${c.from} to ${c.to}.`,
    answer: `${spaced(fmt(ans, 6).replace(/ /g, ""))} ${c.to}`,
    working: [why, `${spaced(v)} ${c.k > 1 ? "×" : "÷"} ${spaced(c.k > 1 ? c.k : Math.round(1 / c.k))} = ${spaced(fmt(ans, 6).replace(/ /g, ""))} ${c.to}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: wrong.map(x => `${spaced(fmt(x, 6).replace(/ /g, ""))} ${c.to}`),
    tags: ["volume", "units"]
  });
}

function capacityUnitsQuestion() {
  const conversions = [
    { from: "L", to: "mL", k: 1000, vals: [2.5, 0.75, 1.2, 3, 0.4, 12.5] },
    { from: "mL", to: "L", k: 0.001, vals: [750, 2500, 125, 4000, 60, 1800] },
    { from: "kL", to: "L", k: 1000, vals: [3, 1.5, 0.8, 22, 4.25] },
    { from: "L", to: "kL", k: 0.001, vals: [4500, 800, 12000, 250, 36000] },
    { from: "ML", to: "kL", k: 1000, vals: [2, 1.4, 0.6, 5] },
    { from: "kL", to: "ML", k: 0.001, vals: [3000, 750, 12500] }
  ];
  const c = choice(conversions);
  const v = choice(c.vals);
  const ans = Number((v * c.k).toPrecision(10));
  return q({
    type: "capacity-units",
    marks: 1,
    prompt: `Convert ${spaced(v)} ${c.from} to ${c.to}.`,
    answer: `${spaced(String(ans))} ${c.to}`,
    working: [`1 ${c.k > 1 ? c.from : c.to} = 1000 ${c.k > 1 ? c.to : c.from}`, `${spaced(v)} ${c.k > 1 ? "× 1000" : "÷ 1000"} = ${spaced(String(ans))} ${c.to}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [v * 100, v / 100, c.k > 1 ? v / 1000 : v * 1000].map(x => `${spaced(String(Number(x.toPrecision(10))))} ${c.to}`),
    tags: ["capacity", "units"]
  });
}

function volumeCapacityQuestion() {
  const variant = choice(["cm3-mL", "cm3-L", "L-cm3", "m3-L", "m3-kL", "mL-cm3"]);
  let prompt; let answer; let working; let dis;
  if (variant === "cm3-mL") {
    const v = randInt(12, 950);
    prompt = `A container has a volume of ${v} cm³. What is its capacity in millilitres?`;
    answer = `${v} mL`; working = ["1 cm³ holds 1 mL.", `${v} cm³ = ${v} mL`];
    dis = [`${v * 1000} mL`, `${v / 1000} mL`, `${v * 10} mL`];
  } else if (variant === "cm3-L") {
    const v = choice([1500, 2000, 4500, 750, 12000, 3200, 600]);
    prompt = `A box has a volume of ${spaced(v)} cm³. What is its capacity in litres?`;
    answer = `${fmt(v / 1000, 3)} L`; working = ["1000 cm³ = 1 L", `${spaced(v)} ÷ 1000 = ${fmt(v / 1000, 3)} L`];
    dis = [`${spaced(v)} L`, `${fmt(v / 100, 3)} L`, `${spaced(v * 1000)} L`];
  } else if (variant === "L-cm3") {
    const v = choice([2, 1.5, 0.75, 3.2, 5, 0.25]);
    prompt = `How many cubic centimetres of water fill a ${v} L bottle?`;
    answer = `${spaced(v * 1000)} cm³`; working = ["1 L = 1000 mL = 1000 cm³", `${v} × 1000 = ${spaced(v * 1000)} cm³`];
    dis = [`${v} cm³`, `${spaced(v * 100)} cm³`, `${spaced(v * 1e6)} cm³`];
  } else if (variant === "m3-L") {
    const v = choice([2, 1.5, 0.6, 3, 4.2, 0.25]);
    prompt = `A tank has a volume of ${v} m³. How many litres of water can it hold?`;
    answer = `${spaced(Math.round(v * 1000))} L`; working = ["1 m³ = 1000 L", `${v} × 1000 = ${spaced(Math.round(v * 1000))} L`];
    dis = [`${v} L`, `${spaced(Math.round(v * 1e6))} L`, `${spaced(Math.round(v * 100))} L`];
  } else if (variant === "m3-kL") {
    const v = choice([12, 45, 2.5, 180, 7]);
    prompt = `A swimming pool holds ${v} m³ of water. What is its capacity in kilolitres?`;
    answer = `${v} kL`; working = ["1 m³ = 1000 L = 1 kL", `${v} m³ = ${v} kL`];
    dis = [`${spaced(v * 1000)} kL`, `${v / 1000} kL`, `${v * 100} kL`];
  } else {
    const v = choice([250, 375, 600, 1250, 80]);
    prompt = `A carton holds ${spaced(v)} mL of juice. What volume of juice is this in cm³?`;
    answer = `${spaced(v)} cm³`; working = ["1 mL = 1 cm³", `${spaced(v)} mL = ${spaced(v)} cm³`];
    dis = [`${spaced(v * 1000)} cm³`, `${v / 1000} cm³`, `${v / 10} cm³`];
  }
  return q({ type: "volume-capacity", marks: 1, prompt, answer, working, space: SPACE_SIZES.SMALL, mcDistractors: dis, tags: ["volume", "capacity", "units"] });
}

/* ── prisms and cross-sections ───────────────────────────── */

function crossSectionsQuestion() {
  const variant = choice(["name-section", "name-section", "which-prism", "why-not-prism"]);
  if (variant === "name-section") {
    const shapes = [
      { d: vol("uniform-cross-section", { shape: "triangle", showArea: false, crossArea: 0, length: randInt(6, 14), unit: "cm" }), a: "Triangle", name: "a triangular prism" },
      { d: vol("uniform-cross-section", { shape: "trapezium", showArea: false, crossArea: 0, length: randInt(6, 14), unit: "cm" }), a: "Trapezium", name: "a trapezoidal prism" },
      { d: vol("uniform-cross-section", { shape: "pentagon", showArea: false, crossArea: 0, length: randInt(6, 14), unit: "cm" }), a: "Pentagon", name: "a pentagonal prism" },
      { d: vol("uniform-cross-section", { shape: "rectangle", showArea: false, crossArea: 0, length: randInt(6, 14), unit: "cm" }), a: "Rectangle", name: "a rectangular prism" },
      { d: vol("cylinder", { radius: randInt(3, 6), height: randInt(8, 14), unit: "cm", orientation: choice(["vertical", "horizontal"]) }), a: "Circle", name: "a cylinder" }
    ];
    const s = choice(shapes);
    return q({
      type: "cross-sections",
      marks: 1,
      prompt: "Name the shape of the uniform cross-section of this solid.",
      diagram: s.d,
      answer: s.a,
      working: [`Slicing parallel to the end face gives the same shape every time: a ${s.a.toLowerCase()}.`, `The solid is ${s.name}.`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: ["Triangle", "Trapezium", "Pentagon", "Rectangle", "Circle", "Hexagon"].filter(x => x !== s.a),
      tags: ["volume", "cross-section", "prism"]
    });
  }
  if (variant === "which-prism") {
    const prisms = ["a cylinder", "a triangular prism", "a cube", "a hexagonal prism", "a rectangular prism"];
    const non = ["a square pyramid", "a cone", "a sphere", "a triangular pyramid"];
    const correct = choice(prisms.filter(p => p !== "a cylinder"));
    const options = shuffle([correct, ...sample(non, 3)]).map(s => s[0].toUpperCase() + s.slice(1));
    const ans = correct[0].toUpperCase() + correct.slice(1);
    return q({
      type: "cross-sections",
      marks: 1,
      prompt: "Which of these solids is a right prism?",
      choices: options,
      answer: ans,
      working: ["A right prism has two identical, parallel ends joined by rectangular faces, so every slice parallel to an end is the same shape.", ans],
      space: SPACE_SIZES.SMALL,
      tags: ["volume", "prism"]
    });
  }
  const solid = choice(["square pyramid", "cone", "triangular pyramid", "sphere"]);
  return q({
    type: "cross-sections",
    marks: 2,
    prompt: `Explain why the formula V = Ah cannot be used to find the volume of a ${solid}.`,
    answer: solid === "sphere"
      ? "A sphere does not have a uniform cross-section: its circular slices get smaller towards the top and bottom, so it is not a prism."
      : `A ${solid} does not have a uniform cross-section: slices parallel to its base get smaller towards the apex, so it is not a prism.`,
    working: ["V = Ah only works when every slice parallel to the base is identical (a uniform cross-section).", `A ${solid}'s slices change size, so it is not a prism.`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["volume", "prism", "reasoning"]
  });
}

function volumeFromAreaQuestion() {
  const unit = choice(["cm", "m"]);
  const A = choice([12, 18, 24, 30, 36, 42, 48, 60, 7.5, 13.5, 22.5]);
  const L = randInt(4, 18);
  const V = A * L;
  const reverse = Math.random() < 0.3;
  const shape = choice(["rectangle", "trapezium", "triangle", "pentagon"]);
  if (reverse) {
    return q({
      type: "volume-from-area",
      marks: 2,
      prompt: `A right prism has a volume of ${fmt(V)} ${cubed(unit)} and a length of ${L} ${unit}. Find the area of its cross-section.`,
      answer: `${fmt(A)} ${unit}²`,
      working: ["V = Ah, so A = V ÷ h", `A = ${fmt(V)} ÷ ${L}`, `A = ${fmt(A)} ${unit}²`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["volume", "V = Ah", "reverse"]
    });
  }
  return q({
    type: "volume-from-area",
    marks: 1,
    prompt: `The shaded end of this right prism has an area of ${fmt(A)} ${unit}². Find the volume of the prism.`,
    diagram: vol("uniform-cross-section", { shape, crossArea: fmt(A), length: L, unit }),
    answer: `${fmt(V)} ${cubed(unit)}`,
    working: ["V = Ah", `V = ${fmt(A)} × ${L} = ${fmt(V)} ${cubed(unit)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${fmt(V)} ${unit}²`, `${fmt(A + L)} ${cubed(unit)}`, `${fmt(V / 2)} ${cubed(unit)}`],
    tags: ["volume", "V = Ah"]
  });
}

function triangularPrismQuestion() {
  const unit = choice(["cm", "m"]);
  const base = randInt(4, 14);
  const height = randInt(3, 12);
  const length = randInt(5, 18);
  const area = base * height / 2;
  const V = area * length;
  return q({
    type: "triangular-prisms",
    marks: 2,
    prompt: "Find the volume of the triangular prism.",
    diagram: vol("triangular-prism", { base, height, length, unit }),
    answer: `${fmt(V)} ${cubed(unit)}`,
    working: [`A = ½ × ${base} × ${height} = ${fmt(area)} ${unit}²`, `V = Ah = ${fmt(area)} × ${length}`, `V = ${fmt(V)} ${cubed(unit)}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["volume", "triangular prism"]
  });
}

function quadrilateralPrismQuestion() {
  const unit = choice(["cm", "m"]);
  const kind = choice(["trapezium", "parallelogram", "rhombus"]);
  let config; let area; let areaLine;
  const length = randInt(5, 15);
  if (kind === "trapezium") {
    const top = randInt(3, 9); const bottom = top + randInt(3, 9); const height = randInt(3, 9);
    area = (top + bottom) * height / 2;
    areaLine = `A = ½ × (${top} + ${bottom}) × ${height} = ${fmt(area)} ${unit}²`;
    config = { kind, top, bottom, height, length, unit };
  } else if (kind === "parallelogram") {
    const base = randInt(6, 15); const height = randInt(3, 9);
    area = base * height;
    areaLine = `A = bh = ${base} × ${height} = ${area} ${unit}²`;
    config = { kind, base, height, length, unit };
  } else {
    const d1 = randInt(6, 16); const d2 = randInt(4, 14);
    area = d1 * d2 / 2;
    areaLine = `A = ½ × ${d1} × ${d2} = ${fmt(area)} ${unit}²`;
    config = { kind, d1, d2, length, unit };
  }
  const V = area * length;
  return q({
    type: "quadrilateral-prisms",
    marks: 2,
    prompt: `The cross-section of this right prism is a ${kind}. Find the volume of the prism.`,
    diagram: vol("quadrilateral-prism", config),
    answer: `${fmt(V)} ${cubed(unit)}`,
    working: [areaLine, `V = Ah = ${fmt(area)} × ${length}`, `V = ${fmt(V)} ${cubed(unit)}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["volume", kind, "prism"]
  });
}

function compositePrismQuestion() {
  const unit = choice(["cm", "m"]);
  if (Math.random() < 0.5) {
    const length = randInt(8, 16); const width = randInt(3, 8);
    const heightA = randInt(2, 6); const heightB = heightA + randInt(2, 6);
    const split = randInt(3, length - 3);
    const v1 = split * width * heightB; const v2 = (length - split) * width * heightA;
    return q({
      type: "composite-prisms",
      marks: 3,
      prompt: "Find the volume of the composite solid.",
      diagram: vol("composite-prism", { kind: "l-block", length, width, heightA, heightB, split, unit }),
      answer: `${v1 + v2} ${cubed(unit)}`,
      working: ["Split the solid into two rectangular prisms.", `V₁ = ${split} × ${width} × ${heightB} = ${v1}`, `V₂ = ${length - split} × ${width} × ${heightA} = ${v2}`, `V = ${v1} + ${v2} = ${v1 + v2} ${cubed(unit)}`],
      space: SPACE_SIZES.LARGE,
      tags: ["volume", "composite"]
    });
  }
  const depth = randInt(3, 7); const lowerLength = randInt(7, 14); const upperLength = randInt(3, lowerLength - 2);
  const lowerHeight = randInt(2, 6); const upperHeight = randInt(2, 5);
  const v1 = lowerLength * depth * lowerHeight; const v2 = upperLength * depth * upperHeight;
  return q({
    type: "composite-prisms",
    marks: 3,
    prompt: "Find the volume of the stepped solid.",
    diagram: vol("composite-prism", { kind: "stepped-block", depth, lowerLength, upperLength, lowerHeight, upperHeight, unit }),
    answer: `${v1 + v2} ${cubed(unit)}`,
    working: ["Split into a bottom and a top rectangular prism.", `Bottom: ${lowerLength} × ${depth} × ${lowerHeight} = ${v1}`, `Top: ${upperLength} × ${depth} × ${upperHeight} = ${v2}`, `V = ${v1 + v2} ${cubed(unit)}`],
    space: SPACE_SIZES.LARGE,
    tags: ["volume", "composite"]
  });
}

function cylinderQuestion() {
  const unit = choice(["cm", "m", "mm"]);
  const r = randInt(2, 10);
  const h = randInt(4, 25);
  const useD = Math.random() < 0.4;
  const exact = Math.random() < 0.25;
  const V = Math.PI * r * r * h;
  return q({
    type: "cylinders",
    marks: 2,
    prompt: exact ? "Find the exact volume of the cylinder, in terms of π." : "Find the volume of the cylinder, correct to 1 decimal place.",
    diagram: vol("cylinder", { radius: r, diameter: useD ? 2 * r : null, height: h, unit, orientation: choice(["vertical", "vertical", "horizontal"]) }),
    answer: exact ? `${r * r * h}π ${cubed(unit)}` : `${fixedDp(V)} ${cubed(unit)}`,
    working: [
      ...(useD ? [`r = ${2 * r} ÷ 2 = ${r} ${unit}`] : []),
      "V = πr²h",
      `V = π × ${r}² × ${h}`,
      exact ? `V = ${r * r * h}π ${cubed(unit)}` : `V ≈ ${fixedDp(V)} ${cubed(unit)}`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["volume", "cylinder"]
  });
}

function fixedDp(v, dp = 1) {
  return spaced(Number(v).toFixed(dp));
}

function missingDimensionQuestion() {
  const variant = choice(["prism-height", "prism-width", "cylinder-height", "cube-side", "prism-length"]);
  const unit = choice(["cm", "m"]);
  if (variant === "cube-side") {
    const s = randInt(2, 12);
    return q({
      type: "missing-dimension", marks: 1,
      prompt: `A cube has a volume of ${spaced(s ** 3)} ${cubed(unit)}. How long is each edge?`,
      answer: `${s} ${unit}`,
      working: [`s³ = ${spaced(s ** 3)}`, `s = ∛${spaced(s ** 3)} = ${s} ${unit}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${Math.round(s ** 3 / 3)} ${unit}`, `${Math.round(Math.sqrt(s ** 3))} ${unit}`, `${s * 2} ${unit}`],
      tags: ["volume", "reverse", "cube root"]
    });
  }
  if (variant === "cylinder-height") {
    const r = randInt(2, 8); const h = randInt(4, 20);
    const V = Math.round(Math.PI * r * r * h * 10) / 10;
    return q({
      type: "missing-dimension", marks: 2,
      prompt: `A cylinder has radius ${r} ${unit} and volume ${fixedDp(V)} ${cubed(unit)}. Find its height, correct to the nearest whole ${unit === "cm" ? "centimetre" : "metre"}.`,
      answer: `${h} ${unit}`,
      working: ["V = πr²h, so h = V ÷ (πr²)", `h = ${fixedDp(V)} ÷ (π × ${r}²)`, `h ≈ ${h} ${unit}`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["volume", "reverse", "cylinder"]
    });
  }
  const l = randInt(4, 15); const w = randInt(2, 10); const h = randInt(2, 12);
  const V = l * w * h;
  const which = variant === "prism-height" ? "height" : variant === "prism-width" ? "width" : "length";
  const known = { length: l, width: w, height: h };
  const unknownVal = known[which];
  const others = Object.entries(known).filter(([k]) => k !== which);
  if (variant === "prism-length") {
    // Uniform cross-section form: V and A given.
    const A = w * h;
    return q({
      type: "missing-dimension", marks: 2,
      prompt: `A right prism has a cross-sectional area of ${A} ${unit}² and a volume of ${spaced(V)} ${cubed(unit)}. How long is the prism?`,
      answer: `${l} ${unit}`,
      working: ["V = Ah, so h = V ÷ A", `h = ${spaced(V)} ÷ ${A} = ${l} ${unit}`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["volume", "reverse"]
    });
  }
  return q({
    type: "missing-dimension", marks: 2,
    prompt: `A rectangular prism has a volume of ${spaced(V)} ${cubed(unit)}. Its ${others[0][0]} is ${others[0][1]} ${unit} and its ${others[1][0]} is ${others[1][1]} ${unit}. Find its ${which}.`,
    answer: `${unknownVal} ${unit}`,
    working: ["V = l × w × h", `${spaced(V)} = ${others[0][1]} × ${others[1][1]} × ${which}`, `${which} = ${spaced(V)} ÷ ${others[0][1] * others[1][1]} = ${unknownVal} ${unit}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["volume", "reverse"]
  });
}

function containerCapacityQuestion() {
  const variant = choice(["tank-cm", "tank-m", "cylinder-L"]);
  if (variant === "tank-cm") {
    const l = choice([40, 50, 60, 80, 90, 100, 120]); const w = choice([20, 25, 30, 40, 50]); const h = choice([25, 30, 35, 40, 45]);
    const V = l * w * h;
    return q({
      type: "container-capacity", marks: 2,
      prompt: "Find the capacity of this fish tank in litres.",
      diagram: vol("capacity-tank", { length: l, width: w, height: h, unit: "cm", context: "fish tank" }),
      answer: `${fmt(V / 1000)} L`,
      working: [`V = ${l} × ${w} × ${h} = ${spaced(V)} cm³`, "1000 cm³ = 1 L", `Capacity = ${spaced(V)} ÷ 1000 = ${fmt(V / 1000)} L`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["capacity", "rectangular prism"]
    });
  }
  if (variant === "tank-m") {
    const l = randInt(2, 6); const w = randInt(1, 4); const h = choice([1, 1.5, 2, 0.5]);
    const V = l * w * h;
    return q({
      type: "container-capacity", marks: 2,
      prompt: "A water tank is a rectangular prism. How many litres does it hold when full?",
      diagram: vol("capacity-tank", { length: l, width: w, height: h, unit: "m", context: "tank" }),
      answer: `${spaced(Math.round(V * 1000))} L`,
      working: [`V = ${l} × ${w} × ${h} = ${fmt(V)} m³`, "1 m³ = 1000 L", `Capacity = ${fmt(V)} × 1000 = ${spaced(Math.round(V * 1000))} L`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["capacity", "rectangular prism"]
    });
  }
  const r = randInt(3, 12); const h = randInt(8, 30);
  const V = Math.PI * r * r * h;
  return q({
    type: "container-capacity", marks: 2,
    prompt: "Find the capacity of this cylindrical can in millilitres, correct to the nearest millilitre.",
    diagram: vol("cylinder", { radius: r, height: h, unit: "cm", orientation: "vertical" }),
    answer: `${spaced(Math.round(V))} mL`,
    working: [`V = π × ${r}² × ${h} ≈ ${fixedDp(V)} cm³`, "1 cm³ = 1 mL", `Capacity ≈ ${spaced(Math.round(V))} mL`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["capacity", "cylinder"]
  });
}

function practicalProblemsQuestion() {
  const variant = choice(["fill-time", "pour-cups", "concrete", "water-level", "rain", "trough"]);
  if (variant === "fill-time") {
    const l = choice([2, 3, 4]); const w = choice([1, 2]); const h = choice([1, 1.5, 2]);
    const litres = l * w * h * 1000;
    const rate = choice([20, 25, 40, 50, 100]);
    const mins = litres / rate;
    if (!Number.isInteger(mins)) return practicalProblemsQuestion();
    return q({
      type: "practical-problems", marks: 3,
      prompt: `A rectangular tank is ${l} m long, ${w} m wide and ${h} m deep. It is filled by a hose at ${rate} L per minute. How long does it take to fill, in hours and minutes?`,
      answer: `${Math.floor(mins / 60)} h ${Math.round(mins % 60)} min`,
      working: [`V = ${l} × ${w} × ${h} = ${fmt(l * w * h)} m³ = ${spaced(litres)} L`, `Time = ${spaced(litres)} ÷ ${rate} = ${spaced(mins)} min`, `= ${Math.floor(mins / 60)} h ${Math.round(mins % 60)} min`],
      space: SPACE_SIZES.LARGE,
      tags: ["capacity", "rates", "problem solving"]
    });
  }
  if (variant === "pour-cups") {
    const jugL = choice([1.5, 2, 2.5, 3]); const cup = choice([150, 200, 250, 300]);
    const cups = Math.floor(jugL * 1000 / cup);
    const left = jugL * 1000 - cups * cup;
    return q({
      type: "practical-problems", marks: 2,
      prompt: `A jug holds ${jugL} L of juice. How many ${cup} mL cups can be completely filled from it, and how much juice is left over?`,
      answer: left ? `${cups} cups, ${left} mL left over` : `${cups} cups, none left over`,
      working: [`${jugL} L = ${spaced(jugL * 1000)} mL`, `${spaced(jugL * 1000)} ÷ ${cup} = ${cups} remainder ${left}`, left ? `${cups} cups, with ${left} mL left over` : `${cups} cups exactly, none left over`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["capacity", "problem solving"]
    });
  }
  if (variant === "concrete") {
    const l = randInt(4, 10); const w = randInt(2, 5); const d = choice([0.1, 0.15, 0.2]);
    const V = l * w * d;
    const price = choice([180, 220, 250, 290]);
    return q({
      type: "practical-problems", marks: 2,
      prompt: `A concrete slab is ${l} m long, ${w} m wide and ${d * 100} cm thick. Concrete costs $${price} per cubic metre. Find the cost of the concrete.`,
      answer: `$${spaced((V * price).toFixed(2))}`,
      working: [`${d * 100} cm = ${d} m`, `V = ${l} × ${w} × ${d} = ${fmt(V)} m³`, `Cost = ${fmt(V)} × $${price} = $${spaced((V * price).toFixed(2))}`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["volume", "money", "units", "problem solving"]
    });
  }
  if (variant === "water-level") {
    const l = choice([40, 50, 60]); const w = choice([20, 25, 30]); const add = choice([3, 6, 4.5, 9]);
    const rise = add * 1000 / (l * w);
    if (Math.abs(rise * 10 - Math.round(rise * 10)) > 1e-9) return practicalProblemsQuestion();
    return q({
      type: "practical-problems", marks: 2,
      prompt: `A fish tank has a base ${l} cm long and ${w} cm wide. By how many centimetres does the water level rise when ${add} L of water is added?`,
      answer: `${fmt(rise)} cm`,
      working: [`${add} L = ${spaced(add * 1000)} cm³`, `Base area = ${l} × ${w} = ${l * w} cm²`, `Rise = ${spaced(add * 1000)} ÷ ${l * w} = ${fmt(rise)} cm`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["volume", "capacity", "reverse", "problem solving"]
    });
  }
  if (variant === "rain") {
    const area = choice([80, 120, 150, 200]); const mm = choice([5, 10, 12, 25]);
    const L = area * mm;
    return q({
      type: "practical-problems", marks: 3,
      prompt: `${mm} mm of rain falls on a flat roof of area ${area} m². All of it runs into a tank. How many litres is this?`,
      answer: `${spaced(L)} L`,
      working: [`${mm} mm = ${mm / 1000} m`, `V = ${area} × ${mm / 1000} = ${fmt(area * mm / 1000)} m³`, `${fmt(area * mm / 1000)} × 1000 = ${spaced(L)} L`],
      space: SPACE_SIZES.LARGE,
      tags: ["volume", "capacity", "units", "problem solving"]
    });
  }
  const base = choice([40, 50, 60]); const height = choice([30, 40]); const length = choice([2, 3]);
  const litres = base * height / 2 * length * 100 / 1000;
  return q({
    type: "practical-problems", marks: 3,
    prompt: `A water trough is a triangular prism. Its triangular end has base ${base} cm and height ${height} cm, and the trough is ${length} m long. How many litres does it hold?`,
    diagram: vol("triangular-prism", { base, height, length: length * 100, unit: "cm" }),
    answer: `${fmt(litres)} L`,
    working: [`A = ½ × ${base} × ${height} = ${base * height / 2} cm²`, `${length} m = ${length * 100} cm, so V = ${base * height / 2} × ${length * 100} = ${spaced(base * height / 2 * length * 100)} cm³`, `Capacity = ${spaced(base * height / 2 * length * 100)} ÷ 1000 = ${fmt(litres)} L`],
    space: SPACE_SIZES.LARGE,
    tags: ["capacity", "triangular prism", "problem solving"]
  });
}

const UNIT_CONTEXTS = [
  { c: "the capacity of a teaspoon", a: "mL", d: ["L", "kL", "ML"] },
  { c: "the capacity of a bathtub", a: "L", d: ["mL", "ML", "mm³"] },
  { c: "the capacity of a backyard swimming pool", a: "kL", d: ["mL", "cm³", "mm³"] },
  { c: "the capacity of a city's water reservoir", a: "ML", d: ["mL", "L", "cm³"] },
  { c: "the volume of a sugar cube", a: "cm³", d: ["m³", "kL", "ML"] },
  { c: "the volume of concrete for a driveway", a: "m³", d: ["mm³", "cm³", "mL"] },
  { c: "the volume of a grain of rice", a: "mm³", d: ["m³", "L", "kL"] },
  { c: "the capacity of a can of soft drink", a: "mL", d: ["kL", "ML", "m³"] },
  { c: "the volume of a shipping container", a: "m³", d: ["mm³", "cm³", "mL"] }
];

function chooseUnitsQuestion() {
  const u = choice(UNIT_CONTEXTS);
  return q({
    type: "choose-units", marks: 1,
    prompt: `Which unit is most appropriate for measuring ${u.c}?`,
    answer: u.a,
    working: [`${u.a} gives a sensible-sized number for ${u.c}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: u.d,
    tags: ["volume", "capacity", "units"]
  });
}

function spotTheErrorQuestion() {
  const variant = choice(["cm3-to-L", "diameter", "area-unit", "cube-units", "prism-slant"]);
  if (variant === "cm3-to-L") {
    const v = choice([4500, 12000, 2500, 800]);
    return q({ type: "spot-the-error", marks: 2,
      prompt: `Ali says a box with a volume of ${spaced(v)} cm³ holds ${spaced(v)} L. Explain his mistake and give the correct capacity.`,
      answer: `1000 cm³ = 1 L, not 1 cm³ = 1 L. Correct capacity: ${fmt(v / 1000)} L.`,
      working: ["1 cm³ = 1 mL, so 1000 cm³ = 1 L.", `${spaced(v)} ÷ 1000 = ${fmt(v / 1000)} L`],
      space: SPACE_SIZES.MEDIUM, tags: ["volume", "capacity", "reasoning"] });
  }
  if (variant === "diameter") {
    const d = choice([8, 10, 12, 14]); const h = choice([10, 15, 20]);
    const wrong = Math.PI * d * d * h; const right = Math.PI * (d / 2) ** 2 * h;
    return q({ type: "spot-the-error", marks: 2,
      prompt: `A cylinder has diameter ${d} cm and height ${h} cm. Mia wrote V = π × ${d}² × ${h} ≈ ${fixedDp(wrong)} cm³. Explain her error and find the correct volume, to 1 decimal place.`,
      answer: `She used the diameter instead of the radius (r = ${d / 2} cm). V = π × ${d / 2}² × ${h} ≈ ${fixedDp(right)} cm³.`,
      working: [`r = ${d} ÷ 2 = ${d / 2} cm`, `V = π × ${d / 2}² × ${h} ≈ ${fixedDp(right)} cm³`],
      space: SPACE_SIZES.MEDIUM, tags: ["volume", "cylinder", "reasoning"] });
  }
  if (variant === "area-unit") {
    const l = randInt(3, 9), w = randInt(2, 6), h = randInt(2, 8);
    return q({ type: "spot-the-error", marks: 1,
      prompt: `Sam found the volume of a ${l} cm × ${w} cm × ${h} cm box and wrote "${l * w * h} cm²". What is wrong with his answer?`,
      answer: `The unit: volume is measured in cubic units, so it should be ${l * w * h} cm³.`,
      working: ["Multiplying three lengths gives cubic units.", `${l * w * h} cm³`],
      space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["volume", "units", "reasoning"] });
  }
  if (variant === "cube-units") {
    return q({ type: "spot-the-error", marks: 2,
      prompt: "Jo says: \"1 m = 100 cm, so 1 m³ = 100 cm³.\" Explain why Jo is wrong and give the correct value.",
      answer: "A cubic metre is 100 cm long, 100 cm wide and 100 cm high, so 1 m³ = 100 × 100 × 100 = 1 000 000 cm³.",
      working: ["Each of the three dimensions is multiplied by 100.", "1 m³ = 1 000 000 cm³"],
      space: SPACE_SIZES.MEDIUM, tags: ["volume", "units", "reasoning"] });
  }
  const b = randInt(6, 12), h = randInt(4, 10), s = h + randInt(2, 4), L = randInt(8, 15);
  return q({ type: "spot-the-error", marks: 2,
    prompt: `A triangular prism has a triangular end with base ${b} cm, perpendicular height ${h} cm and sloping side ${s} cm. Its length is ${L} cm. Lee calculated V = ½ × ${b} × ${s} × ${L}. Explain the error and find the correct volume.`,
    answer: `The triangle's area needs the perpendicular height (${h} cm), not the sloping side. V = ½ × ${b} × ${h} × ${L} = ${fmt(b * h * L / 2)} cm³.`,
    working: ["Area of a triangle uses the perpendicular height.", `V = ½ × ${b} × ${h} × ${L} = ${fmt(b * h * L / 2)} cm³`],
    space: SPACE_SIZES.MEDIUM, tags: ["volume", "reasoning"] });
}

function multiPartVolumeQuestion() {
  const l = choice([60, 80, 100, 120]); const w = choice([30, 40, 50]); const h = choice([40, 50, 60]);
  const V = l * w * h; const L = V / 1000;
  const rate = choice([4, 5, 8, 10]);
  const mins = L / rate;
  return q({
    type: "multi-part-volume", marks: 4,
    prompt: `An aquarium is a rectangular prism ${l} cm long, ${w} cm wide and ${h} cm high.`,
    diagram: vol("capacity-tank", { length: l, width: w, height: h, unit: "cm", context: "aquarium" }),
    subparts: [
      { label: "(a)", prompt: "Find its volume in cubic centimetres.", marks: 1, answer: `${spaced(V)} cm³`, working: [`${l} × ${w} × ${h} = ${spaced(V)} cm³`] },
      { label: "(b)", prompt: "What is its capacity in litres?", marks: 1, answer: `${fmt(L)} L`, working: [`${spaced(V)} ÷ 1000 = ${fmt(L)} L`] },
      { label: "(c)", prompt: `Water flows in at ${rate} L per minute. How long does it take to fill?`, marks: 1, answer: `${fmt(mins)} minutes`, working: [`${fmt(L)} ÷ ${rate} = ${fmt(mins)} minutes`] },
      { label: "(d)", prompt: "It is only filled to 80% of its height. How many litres is that?", marks: 1, answer: `${fmt(L * 0.8)} L`, working: [`80% of ${fmt(L)} L = ${fmt(L * 0.8)} L`] }
    ],
    answer: `(a) ${spaced(V)} cm³; (b) ${fmt(L)} L; (c) ${fmt(mins)} minutes; (d) ${fmt(L * 0.8)} L`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    tags: ["volume", "capacity", "multi-part"]
  });
}

const GENERATORS = {
  "count-cubes": countCubesQuestion,
  "rectangular-prisms": rectangularPrismQuestion,
  "volume-units": volumeUnitsQuestion,
  "capacity-units": capacityUnitsQuestion,
  "volume-capacity": volumeCapacityQuestion,
  "cross-sections": crossSectionsQuestion,
  "volume-from-area": volumeFromAreaQuestion,
  "triangular-prisms": triangularPrismQuestion,
  "quadrilateral-prisms": quadrilateralPrismQuestion,
  "composite-prisms": compositePrismQuestion,
  "cylinders": cylinderQuestion,
  "missing-dimension": missingDimensionQuestion,
  "container-capacity": containerCapacityQuestion,
  "practical-problems": practicalProblemsQuestion,
  "choose-units": chooseUnitsQuestion,
  "spot-the-error": spotTheErrorQuestion,
  "multi-part-volume": multiPartVolumeQuestion
};

void plural;

export function getVolumeQuestionTypes() {
  return TYPE_LIST;
}

export function generateVolumeQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
