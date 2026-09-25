/*
  Mills Maths Tools — Stage 5 Question Bank: Area and Surface Area B
  -------------------------------------------------------------------
  question-banks/stage-5/area-and-surface-area-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-ARE-P-01 (Path):
    solves problems involving the surface area of right pyramids, right cones,
    spheres and related composite solids.

  Content:
    - right pyramids with square and rectangular bases: slant height given,
      or found from the perpendicular height with Pythagoras
    - right cones: curved surface πrl, total πr² + πrl, slant height from
      r and h
    - spheres 4πr² and hemispheres (curved, open, closed)
    - composite solids: only the exposed faces count
    - working backwards (radius from surface area), and practical problems
      (painting, material cost)

  Diagrams: solids-engine `measured`. Answers to 2 decimal places unless the
  question says otherwise.
*/

import {
  SPACE_SIZES, randInt, choice, makeQuestion, generateFromRegistry, fmt, fixed
} from "../../_shared/bank-helpers.js";

const TOPIC = "Area and Surface Area B";

const TYPE_LIST = [
  { id: "square-pyramid-sa", label: "Square pyramid: slant height given" },
  { id: "pyramid-sa-find-slant", label: "Pyramid: find the slant height first" },
  { id: "rectangular-pyramid-sa", label: "Rectangular-based pyramid" },
  { id: "cone-curved-sa", label: "Cone: curved surface area" },
  { id: "cone-total-sa", label: "Cone: total surface area" },
  { id: "cone-find-slant", label: "Cone: find the slant height first" },
  { id: "sphere-sa", label: "Surface area of a sphere" },
  { id: "hemisphere-sa", label: "Surface area of a hemisphere" },
  { id: "composite-solid-sa", label: "Composite solids" },
  { id: "sa-find-dimension", label: "Find a dimension from the surface area" },
  { id: "sa-practical", label: "Practical surface area problems" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "surface area", ...(spec.tags || [])] });
const solid = (kind, dims, labels, extra = {}) => ({ engine: "solids-engine", config: { diagramType: "measured", kind, dims, labels, ...extra } });
const f2 = v => (Math.abs(v - Math.round(v)) < 1e-9 ? fmt(v, 0) : fixed(v, 2));
const PI = Math.PI;
const UNITS = ["cm", "m", "mm"];
const sq = u => `${u}²`;

function squarePyramidSaQuestion() {
  const u = choice(UNITS); const a = randInt(4, 16); const l = randInt(Math.ceil(a / 2) + 2, a + 8);
  const base = a * a; const tri = 4 * 0.5 * a * l; const SA = base + tri;
  return q({
    type: "square-pyramid-sa", marks: 2,
    prompt: `Find the surface area of the square-based right pyramid. The slant height of each triangular face is ${l} ${u}.`,
    diagram: solid("pyramid", { a, h: Math.sqrt(l * l - a * a / 4) }, { a: `${a} ${u}`, slant: `${l} ${u}` }),
    answer: `${f2(SA)} ${sq(u)}`,
    working: [`Base ${a} × ${a} = ${base}`, `4 triangles: 4 × ½ × ${a} × ${l} = ${tri}`, `SA = ${f2(SA)} ${sq(u)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${f2(base + 2 * a * l * 2)} ${sq(u)}`, `${f2(tri)} ${sq(u)}`, `${f2(base + a * l)} ${sq(u)}`],
    tags: ["pyramid"]
  });
}

function pyramidSaFindSlantQuestion() {
  const u = choice(UNITS);
  const [half, h, l] = choice([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [9, 12, 15], [12, 5, 13], [8, 15, 17]]);
  const a = 2 * half;
  const SA = a * a + 2 * a * l;
  return q({
    type: "pyramid-sa-find-slant", marks: 3,
    prompt: `A square-based right pyramid has base edge ${a} ${u} and perpendicular height ${h} ${u}. Find the slant height of a triangular face, then the surface area.`,
    diagram: solid("pyramid", { a, h }, { a: `${a} ${u}`, h: `${h} ${u}`, slant: "l" }),
    answer: `l = ${l} ${u}; SA = ${f2(SA)} ${sq(u)}`,
    working: [`The slant height is the hypotenuse of a triangle with legs ${h} (height) and ${half} (half the base)`, `l = √(${h}² + ${half}²) = ${l}`, `SA = ${a}² + 4 × ½ × ${a} × ${l} = ${f2(SA)}`],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [`l = ${f2(Math.sqrt(h * h + a * a))} ${u}; SA = ${f2(a * a + 2 * a * Math.sqrt(h * h + a * a))} ${sq(u)}`, `l = ${l} ${u}; SA = ${f2(a * a + 4 * a * l)} ${sq(u)}`],
    tags: ["pyramid", "Pythagoras"]
  });
}

function rectangularPyramidSaQuestion() {
  const u = choice(UNITS);
  const a = choice([6, 8, 10, 12]); const b = a + choice([2, 4, 6]);
  const h = choice([4, 6, 8]);
  const lA = Math.sqrt(h * h + (b / 2) ** 2); // triangles on the a-edges
  const lB = Math.sqrt(h * h + (a / 2) ** 2); // triangles on the b-edges
  const SA = a * b + a * lA + b * lB;
  return q({
    type: "rectangular-pyramid-sa", marks: 4,
    prompt: `A right pyramid has a rectangular base ${b} ${u} by ${a} ${u} and a perpendicular height of ${h} ${u}. Find its surface area, correct to 2 decimal places.`,
    diagram: solid("pyramid", { a: b, h }, { a: `${b} ${u}`, b: `${a} ${u}`, h: `${h} ${u}` }, { base: "rectangle" }),
    answer: `${f2(SA)} ${sq(u)}`,
    working: [
      `Base ${b} × ${a} = ${a * b}`,
      `Triangles on the ${b} ${u} edges: slant = √(${h}² + ${a / 2}²) = ${f2(lB)}; two of them: ${b} × ${f2(lB)} = ${f2(b * lB)}`,
      `Triangles on the ${a} ${u} edges: slant = √(${h}² + ${b / 2}²) = ${f2(lA)}; two of them: ${a} × ${f2(lA)} = ${f2(a * lA)}`,
      `SA ≈ ${f2(SA)} ${sq(u)}`
    ],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [`${f2(a * b + (a + b) * lB)} ${sq(u)}`, `${f2(a * b + a * h + b * h)} ${sq(u)}`],
    tags: ["pyramid", "Pythagoras"]
  });
}

function coneCurvedSaQuestion() {
  const u = choice(UNITS); const r = randInt(2, 12); const l = r + randInt(2, 12);
  const C = PI * r * l;
  return q({
    type: "cone-curved-sa", marks: 1,
    prompt: `Find the curved surface area of a cone with radius ${r} ${u} and slant height ${l} ${u}, correct to 2 decimal places.`,
    diagram: solid("cone", { r, h: Math.sqrt(l * l - r * r) }, { r: `${r} ${u}`, l: `${l} ${u}` }),
    answer: `${f2(C)} ${sq(u)}`,
    working: ["Curved SA = πrl", `= π × ${r} × ${l} ≈ ${f2(C)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${f2(PI * r * r + C)} ${sq(u)}`, `${f2(2 * PI * r * l)} ${sq(u)}`, `${f2(PI * r * r * l)} ${sq(u)}`],
    tags: ["cone"]
  });
}

function coneTotalSaQuestion() {
  const u = choice(UNITS); const r = randInt(2, 12); const l = r + randInt(2, 12);
  const T = PI * r * r + PI * r * l;
  const exact = Math.random() < 0.3;
  return q({
    type: "cone-total-sa", marks: 2,
    prompt: `Find the total surface area of a solid cone with radius ${r} ${u} and slant height ${l} ${u}${exact ? ", in exact form (in terms of π)" : ", correct to 2 decimal places"}.`,
    diagram: solid("cone", { r, h: Math.sqrt(l * l - r * r) }, { r: `${r} ${u}`, l: `${l} ${u}` }),
    answer: exact ? `${r * r + r * l}π ${sq(u)}` : `${f2(T)} ${sq(u)}`,
    working: ["SA = πr² + πrl", `= π(${r * r}) + π(${r * l}) = ${r * r + r * l}π`, exact ? "" : `≈ ${f2(T)}`].filter(Boolean),
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: exact ? [`${r * l}π ${sq(u)}`, `${2 * r * r + r * l}π ${sq(u)}`, `${r * r * l}π ${sq(u)}`] : [`${f2(PI * r * l)} ${sq(u)}`, `${f2(2 * PI * r * r + PI * r * l)} ${sq(u)}`],
    tags: ["cone"]
  });
}

function coneFindSlantQuestion() {
  const u = choice(UNITS);
  const [r, h, l] = choice([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [4, 7, null], [5, 9, null]]);
  const L = l ?? Math.sqrt(r * r + h * h);
  const T = PI * r * r + PI * r * L;
  return q({
    type: "cone-find-slant", marks: 3,
    prompt: `A solid cone has radius ${r} ${u} and perpendicular height ${h} ${u}. Find its slant height and total surface area${l ? "" : ", correct to 2 decimal places"}.`,
    diagram: solid("cone", { r, h }, { r: `${r} ${u}`, h: `${h} ${u}`, l: "l" }),
    answer: `l = ${l ? l : f2(L)} ${u}; SA ≈ ${f2(T)} ${sq(u)}`,
    working: [`l = √(${r}² + ${h}²) = ${l ? l : `√${r * r + h * h} ≈ ${f2(L)}`}`, `SA = π × ${r}² + π × ${r} × ${f2(L)} ≈ ${f2(T)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`l = ${f2(L)} ${u}; SA ≈ ${f2(PI * r * L)} ${sq(u)}`, `l = ${h - r > 0 ? h - r : r + h} ${u}; SA ≈ ${f2(PI * r * r + PI * r * (r + h))} ${sq(u)}`],
    tags: ["cone", "Pythagoras"]
  });
}

function sphereSaQuestion() {
  const u = choice(UNITS); const useD = Math.random() < 0.4; const r = useD ? randInt(2, 12) : randInt(1, 15);
  const S = 4 * PI * r * r;
  return q({
    type: "sphere-sa", marks: 2,
    prompt: `Find the surface area of a sphere with ${useD ? `diameter ${2 * r}` : `radius ${r}`} ${u}, correct to 2 decimal places.`,
    diagram: solid("sphere", {}, useD ? { d: `${2 * r} ${u}` } : { r: `${r} ${u}` }),
    answer: `${f2(S)} ${sq(u)}`,
    working: [useD ? `r = ${2 * r} ÷ 2 = ${r}` : "", "SA = 4πr²", `= 4 × π × ${r}² ≈ ${f2(S)}`].filter(Boolean),
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${f2(PI * r * r)} ${sq(u)}`, `${f2(4 * PI * 4 * r * r)} ${sq(u)}`, `${f2((4 / 3) * PI * r ** 3)} ${sq(u)}`],
    tags: ["sphere"]
  });
}

function hemisphereSaQuestion() {
  const u = choice(UNITS); const r = randInt(2, 14); const v = choice(["closed", "open"]);
  const S = v === "closed" ? 3 * PI * r * r : 2 * PI * r * r;
  return q({
    type: "hemisphere-sa", marks: 2,
    prompt: v === "closed" ? `Find the total surface area of a solid hemisphere of radius ${r} ${u}, correct to 2 decimal places.` : `A hemispherical bowl (open, no lid) has radius ${r} ${u}. Find its outside surface area, correct to 2 decimal places.`,
    diagram: solid("hemisphere", {}, { r: `${r} ${u}` }),
    answer: `${f2(S)} ${sq(u)}`,
    working: v === "closed" ? ["Curved part ½ × 4πr² = 2πr²; flat circle πr²", `Total 3πr² = 3π × ${r}² ≈ ${f2(S)}`] : ["Curved part only: ½ × 4πr² = 2πr²", `= 2π × ${r}² ≈ ${f2(S)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [`${f2(v === "closed" ? 2 * PI * r * r : 3 * PI * r * r)} ${sq(u)}`, `${f2(4 * PI * r * r)} ${sq(u)}`],
    tags: ["hemisphere"]
  });
}

function compositeSolidSaQuestion() {
  const u = choice(["cm", "m"]);
  const kind = choice(["cone-cylinder", "hemisphere-cylinder", "cone-hemisphere"]);
  if (kind === "cone-cylinder") {
    const [r, h, l] = choice([[3, 4, 5], [6, 8, 10], [5, 12, 13]]); const ch = randInt(4, 15);
    const S = PI * r * l + 2 * PI * r * ch + PI * r * r;
    return q({ type: "composite-solid-sa", marks: 4, prompt: `The solid is a cone on top of a cylinder. The radius is ${r} ${u}, the cylinder is ${ch} ${u} tall and the cone has slant height ${l} ${u}. Find the total surface area, correct to 2 decimal places.`, diagram: solid("cone-cylinder", { r, ch, h }, { r: `${r} ${u}`, ch: `${ch} ${u}`, l: `${l} ${u}` }), answer: `${f2(S)} ${sq(u)}`, working: [`Cone curved: π × ${r} × ${l} = ${r * l}π`, `Cylinder curved: 2π × ${r} × ${ch} = ${2 * r * ch}π`, `Base circle: π × ${r}² = ${r * r}π`, `Total ${r * l + 2 * r * ch + r * r}π ≈ ${f2(S)}`, "(The join between cone and cylinder is hidden, so it is not counted.)"], space: SPACE_SIZES.LARGE, mcDistractors: [`${f2(S + PI * r * r)} ${sq(u)}`, `${f2(S + 2 * PI * r * r)} ${sq(u)}`], tags: ["composite"] });
  }
  if (kind === "hemisphere-cylinder") {
    const r = randInt(2, 8); const ch = randInt(4, 15);
    const S = 2 * PI * r * r + 2 * PI * r * ch + PI * r * r;
    return q({ type: "composite-solid-sa", marks: 3, prompt: `A silo is a cylinder of radius ${r} ${u} and height ${ch} ${u} with a hemispherical top. Find its total surface area, including the base, correct to 2 decimal places.`, diagram: solid("hemisphere-cylinder", { r, ch }, { r: `${r} ${u}`, ch: `${ch} ${u}` }), answer: `${f2(S)} ${sq(u)}`, working: [`Hemisphere curved 2πr² = ${2 * r * r}π`, `Cylinder curved 2πrh = ${2 * r * ch}π`, `Base πr² = ${r * r}π`, `Total ${3 * r * r + 2 * r * ch}π ≈ ${f2(S)}`], space: SPACE_SIZES.LARGE, mcDistractors: [`${f2(S + PI * r * r)} ${sq(u)}`, `${f2(S - PI * r * r)} ${sq(u)}`], tags: ["composite"] });
  }
  const [r, h, l] = choice([[3, 4, 5], [5, 12, 13], [6, 8, 10]]);
  const S = 2 * PI * r * r + PI * r * l;
  return q({ type: "composite-solid-sa", marks: 3, prompt: `A toy is a hemisphere of radius ${r} ${u} on top of a cone of the same radius with slant height ${l} ${u}. Find its surface area, correct to 2 decimal places.`, diagram: solid("cone-hemisphere", { r, h }, { r: `${r} ${u}` }), answer: `${f2(S)} ${sq(u)}`, working: [`Hemisphere curved 2πr² = ${2 * r * r}π`, `Cone curved πrl = ${r * l}π`, `Total ${2 * r * r + r * l}π ≈ ${f2(S)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${f2(S + PI * r * r)} ${sq(u)}`, `${f2(4 * PI * r * r + PI * r * l)} ${sq(u)}`], tags: ["composite"] });
}

function saFindDimensionQuestion() {
  const v = choice(["sphere", "cone-l"]);
  const u = choice(UNITS);
  if (v === "sphere") {
    const r = randInt(2, 15); const S = 4 * PI * r * r;
    return q({ type: "sa-find-dimension", marks: 2, prompt: `A sphere has a surface area of ${f2(S)} ${sq(u)}. Find its radius, to the nearest whole ${u}.`, answer: `${r} ${u}`, working: [`4πr² = ${f2(S)}`, `r² = ${f2(S)} ÷ 4π ≈ ${f2(S / (4 * PI))}`, `r ≈ ${r}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.round(Math.sqrt(S / PI))} ${u}`, `${Math.round(S / (4 * PI))} ${u}`], tags: ["sphere", "reverse"] });
  }
  const r = randInt(2, 9); const l = r + randInt(2, 10); const C = PI * r * l;
  return q({ type: "sa-find-dimension", marks: 2, prompt: `A cone has radius ${r} ${u} and a curved surface area of ${f2(C)} ${sq(u)}. Find its slant height, to the nearest whole ${u}.`, answer: `${l} ${u}`, working: [`π × ${r} × l = ${f2(C)}`, `l = ${f2(C)} ÷ ${r}π ≈ ${l}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${Math.round(C / r)} ${u}`, `${Math.round(C / (PI * r * r))} ${u}`], tags: ["cone", "reverse"] });
}

function saPracticalQuestion() {
  const v = choice(["dome", "tent", "balls"]);
  if (v === "dome") {
    const r = randInt(4, 12); const cost = choice([12, 15, 18, 22]); const A = 2 * PI * r * r;
    return q({ type: "sa-practical", marks: 3, prompt: `The outside of a hemispherical dome of radius ${r} m is to be painted. Paint costs $${cost} per square metre. Find the cost, to the nearest dollar.`, diagram: solid("hemisphere", {}, { r: `${r} m` }), answer: `$${fmt(Math.round(A * cost), 0)}`, working: [`Curved area 2πr² = 2π × ${r}² ≈ ${f2(A)} m²`, `${f2(A)} × $${cost} ≈ $${fmt(Math.round(A * cost), 0)}`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`$${fmt(Math.round(3 * PI * r * r * cost), 0)}`, `$${fmt(Math.round(4 * PI * r * r * cost), 0)}`], tags: ["practical", "cost"] });
  }
  if (v === "tent") {
    const [half, h, l] = choice([[1.5, 2, 2.5], [2, 1.5, 2.5], [3, 4, 5]]); const a = 2 * half;
    const A = 2 * a * l;
    return q({ type: "sa-practical", marks: 3, prompt: `A tent is a square-based pyramid with base edge ${a} m and height ${h} m. The four sloping sides are made of canvas (no floor). How much canvas is needed?`, diagram: solid("pyramid", { a, h }, { a: `${a} m`, h: `${h} m` }), answer: `${f2(A)} m²`, working: [`Slant height √(${h}² + ${half}²) = ${l} m`, `4 × ½ × ${a} × ${l} = ${f2(A)} m²`], space: SPACE_SIZES.MEDIUM, mcDistractors: [`${f2(A + a * a)} m²`, `${f2(2 * a * h)} m²`], tags: ["practical"] });
  }
  const r = choice([3.3, 3.5, 4, 11]); const n = choice([6, 10, 12, 24]);
  const A = 4 * PI * r * r * n;
  return q({ type: "sa-practical", marks: 2, prompt: `A company makes ${n} balls, each with radius ${r} cm, covered in fabric. What area of fabric is needed, to the nearest square centimetre?`, answer: `${fmt(Math.round(A), 0)} cm²`, working: [`One ball: 4π × ${r}² ≈ ${f2(4 * PI * r * r)} cm²`, `× ${n} ≈ ${fmt(Math.round(A), 0)} cm²`], space: SPACE_SIZES.SMALL, mcDistractors: [`${fmt(Math.round(PI * r * r * n), 0)} cm²`, `${fmt(Math.round(4 * PI * r * r), 0)} cm²`], tags: ["practical"] });
}

const GENERATORS = {
  "square-pyramid-sa": squarePyramidSaQuestion,
  "pyramid-sa-find-slant": pyramidSaFindSlantQuestion,
  "rectangular-pyramid-sa": rectangularPyramidSaQuestion,
  "cone-curved-sa": coneCurvedSaQuestion,
  "cone-total-sa": coneTotalSaQuestion,
  "cone-find-slant": coneFindSlantQuestion,
  "sphere-sa": sphereSaQuestion,
  "hemisphere-sa": hemisphereSaQuestion,
  "composite-solid-sa": compositeSolidSaQuestion,
  "sa-find-dimension": saFindDimensionQuestion,
  "sa-practical": saPracticalQuestion
};

export function getAreaAndSurfaceAreaBQuestionTypes() { return TYPE_LIST; }
export function generateAreaAndSurfaceAreaBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
