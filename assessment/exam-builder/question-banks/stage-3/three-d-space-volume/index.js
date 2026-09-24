/*
  Mills Maths Tools — Stage 3 Question Bank: 3D Space and Volume
  ----------------------------------------------------------------
  question-banks/stage-3/three-d-space-volume/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Three-dimensional spatial
  structure A" and "B", merged into one topic. Outcomes:

    MA3-3DS-01  visualises, sketches and constructs three-dimensional objects,
                including prisms and pyramids, making connections to
                two-dimensional representations
    MA3-3DS-02  selects and uses the appropriate unit and device to measure
                the capacities and volumes of objects

  Content (docs/stage-3-syllabus-reference.md):
    A  compare, describe and name prisms and pyramids; connect 3D objects with
       2D representations (nets, views); appropriate units for capacity;
       displacement to find the volume of an irregular solid; decimals and
       the metric system (L ↔ mL)
    B  construct prisms and pyramids (skeletal models: edges and vertices);
       cubic metres; the multiplicative structure of volume (layers);
       volumes of rectangular prisms in cm³ and m³

  EVERY 3D-object question carries a picture: a solid, a net, a stack of cubes
  with its views, or a measuring jug. At Stage 3 the connection between the
  picture and the name/count IS the skill.

  Diagrams:
    - solids-engine  solids (computed hidden edges), nets, cube stacks + views
    - measure-engine measuring jugs, displacement before/after
    - volume-engine  `cube-array` for counting cubes, `rectangular-prism` for
                     labelled dimensions

  Stage boundary: no V = Ah for non-rectangular prisms, no cylinders' volume,
  no cm³ ↔ mm³ or m³ ↔ cm³ conversions (Stage 4). 1 mL ↔ 1 cm³ appears only
  in the displacement context where the syllabus introduces it.

  Cube nets are generated as random 6-square shapes and classified by an
  actual fold (rolling a cube across the squares), so "valid" and "invalid"
  are computed, not hand-listed. tools/stage3-three-d.mjs re-folds them with
  an independent method.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, fmt, spaced, plural
} from "../../_shared/bank-helpers.js";

const TOPIC = "3D Space and Volume";

const TYPE_LIST = [
  { id: "name-solid", label: "Name prisms and pyramids from a picture" },
  { id: "prism-or-pyramid", label: "Prism or pyramid? Give a reason" },
  { id: "faces-edges-vertices", label: "Count faces, edges and vertices" },
  { id: "fev-pattern", label: "Faces, edges and vertices patterns" },
  { id: "face-shapes", label: "The shapes of the faces" },
  { id: "net-to-solid", label: "Which solid does this net make?" },
  { id: "cube-nets", label: "Which nets fold into a cube?" },
  { id: "skeletal-models", label: "Skeletal models: straws and connectors" },
  { id: "cube-stack-views", label: "Top, front and side views" },
  { id: "capacity-units", label: "Choose units of capacity" },
  { id: "convert-capacity", label: "Convert litres and millilitres" },
  { id: "read-jug", label: "Read a measuring jug" },
  { id: "capacity-problems", label: "Capacity word problems" },
  { id: "displacement", label: "Volume by displacement" },
  { id: "count-cubes", label: "Volume by counting cubes" },
  { id: "layers", label: "Volume in layers" },
  { id: "volume-formula", label: "Volume of rectangular prisms (cm³ and m³)" },
  { id: "cubic-metres", label: "Cubic metres and choosing units" },
  { id: "missing-dimension", label: "Find a missing dimension" },
  { id: "multi-part-3d", label: "Multi-part 3D problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const solids = config => ({ engine: "solids-engine", config });
const measure = config => ({ engine: "measure-engine", config });
const vol = (diagramType, config) => ({ engine: "volume-engine", config: { diagramType, ...config }, ...(diagramType === "cube-array" ? {} : { notToScale: true }) });

/* ── the solids ──────────────────────────────────────────── */

const BASE_NAMES = { 3: "triangular", 4: "square", 5: "pentagonal", 6: "hexagonal", 8: "octagonal" };
const POLYGON = { 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 8: "octagon" };

/* Every solid a Stage 3 picture can show, with its counts. */
export const SOLIDS = [
  { id: "triangular-prism", name: "Triangular prism", family: "prism", n: 3, config: { kind: "prism", sides: 3 } },
  { id: "rectangular-prism", name: "Rectangular prism", family: "prism", n: 4, config: { kind: "prism", sides: 4, base: "rectangle", height: 1.1 } },
  { id: "cube", name: "Cube", family: "prism", n: 4, config: { kind: "prism", sides: 4, cube: true } },
  { id: "pentagonal-prism", name: "Pentagonal prism", family: "prism", n: 5, config: { kind: "prism", sides: 5 } },
  { id: "hexagonal-prism", name: "Hexagonal prism", family: "prism", n: 6, config: { kind: "prism", sides: 6 } },
  { id: "octagonal-prism", name: "Octagonal prism", family: "prism", n: 8, config: { kind: "prism", sides: 8, height: 1.2 } },
  { id: "triangular-pyramid", name: "Triangular pyramid", family: "pyramid", n: 3, config: { kind: "pyramid", sides: 3 } },
  { id: "square-pyramid", name: "Square pyramid", family: "pyramid", n: 4, config: { kind: "pyramid", sides: 4 } },
  { id: "pentagonal-pyramid", name: "Pentagonal pyramid", family: "pyramid", n: 5, config: { kind: "pyramid", sides: 5 } },
  { id: "hexagonal-pyramid", name: "Hexagonal pyramid", family: "pyramid", n: 6, config: { kind: "pyramid", sides: 6 } },
  { id: "cylinder", name: "Cylinder", family: "curved", config: { kind: "cylinder" } },
  { id: "cone", name: "Cone", family: "curved", config: { kind: "cone" } },
  { id: "sphere", name: "Sphere", family: "curved", config: { kind: "sphere" } }
];
const POLYHEDRA = SOLIDS.filter(s => s.family !== "curved");

export function fev(s) {
  return s.family === "prism"
    ? { F: s.n + 2, E: 3 * s.n, V: 2 * s.n }
    : { F: s.n + 1, E: 2 * s.n, V: s.n + 1 };
}

function nameDistractors(s) {
  const out = [];
  if (s.family === "prism") out.push(s.name.replace("prism", "pyramid").replace("Cube", "Square pyramid").replace("Rectangular pyramid", "Square pyramid"));
  if (s.family === "pyramid") out.push(s.name.replace("pyramid", "prism").replace("Square prism", "Cube"));
  out.push(...sample(SOLIDS.filter(t => t.id !== s.id).map(t => t.name), 4));
  return out;
}

function nameSolidQuestion() {
  const s = choice(SOLIDS.filter(t => t.id !== "octagonal-prism" || Math.random() < 0.4));
  return q({
    type: "name-solid", marks: 1,
    prompt: "Name this three-dimensional object.",
    diagram: solids({ diagramType: "solid", ...s.config }),
    answer: s.name,
    working: s.family === "curved"
      ? [`It has a curved surface: it is a ${s.name.toLowerCase()}.`]
      : s.family === "prism"
        ? [`It has two matching ${s.id === "cube" ? "square" : s.id === "rectangular-prism" ? "rectangular" : POLYGON[s.n]} ends joined by rectangles, so it is a prism.`, s.id === "cube" ? "All six faces are squares: a cube." : `The ends are ${s.id === "rectangular-prism" ? "rectangles" : POLYGON[s.n] + "s"}: ${s.name.toLowerCase()}.`]
        : [`One base, with triangles meeting at a point (the apex), so it is a pyramid.`, `The base is a ${POLYGON[s.n]}: ${s.name.toLowerCase()}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: nameDistractors(s),
    tags: ["3D objects", "naming"]
  });
}

function prismOrPyramidQuestion() {
  const s = choice(POLYHEDRA);
  const isPrism = s.family === "prism";
  return q({
    type: "prism-or-pyramid", marks: 2,
    prompt: "Is this object a prism or a pyramid? Explain how you know.",
    diagram: solids({ diagramType: "solid", ...s.config }),
    answer: isPrism
      ? `A prism: it has two identical, parallel ends (${s.id === "cube" ? "squares" : s.id === "rectangular-prism" ? "rectangles" : POLYGON[s.n] + "s"}) joined by rectangular faces.`
      : `A pyramid: it has one base (a ${POLYGON[s.n]}) and triangular faces that meet at a point (the apex).`,
    working: isPrism
      ? ["A prism has two identical parallel faces and its other faces are rectangles.", `This is a ${s.name.toLowerCase()}.`]
      : ["A pyramid has one base and triangular faces meeting at the apex.", `This is a ${s.name.toLowerCase()}.`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["3D objects", "prisms and pyramids"]
  });
}

function facesEdgesVerticesQuestion() {
  const s = choice(POLYHEDRA);
  const { F, E, V } = fev(s);
  return q({
    type: "faces-edges-vertices", marks: 3,
    prompt: `This is a ${s.name.toLowerCase()}. How many does it have of each?`,
    diagram: solids({ diagramType: "solid", ...s.config }),
    subparts: [
      { label: "(a)", prompt: "Faces", marks: 1, answer: String(F), working: s.family === "prism" ? [`2 ends + ${s.n} rectangles = ${F}`] : [`1 base + ${s.n} triangles = ${F}`] },
      { label: "(b)", prompt: "Edges", marks: 1, answer: String(E), working: s.family === "prism" ? [`${s.n} on each end + ${s.n} joining them = ${E}`] : [`${s.n} around the base + ${s.n} up to the apex = ${E}`] },
      { label: "(c)", prompt: "Vertices", marks: 1, answer: String(V), working: s.family === "prism" ? [`${s.n} on each end: 2 × ${s.n} = ${V}`] : [`${s.n} on the base + 1 apex = ${V}`] }
    ],
    answer: `(a) ${F} faces; (b) ${E} edges; (c) ${V} vertices`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["3D objects", "faces edges vertices"]
  });
}

function fevPatternQuestion() {
  const family = choice(["prism", "pyramid"]);
  const ns = [3, 4, 5, 6];
  const target = choice([7, 8, 10, 12]);
  const rows = ns.map(n => {
    const s = { family, n };
    const c = fev(s);
    const nm = family === "prism" && n === 4 ? "Rectangular" : capital(BASE_NAMES[n]);
    return [nm, String(n), String(c.F), String(c.E), String(c.V)];
  });
  // blank out a scattering of cells for the student to fill
  const blanks = [];
  rows.forEach((r, i) => {
    const cols = sample([2, 3, 4], i === 0 ? 1 : 2);
    cols.forEach(cIdx => { blanks.push({ i, cIdx, value: r[cIdx] }); r[cIdx] = "   "; });
  });
  const t = fev({ family, n: target });
  const shown = rows.map(r => r.slice());
  return q({
    type: "fev-pattern", marks: 3,
    prompt: `The table shows the faces, edges and vertices of some ${family}s.`,
    table: { headerRow: true, caption: `${capital(family)}s`, rows: [[capital(family), "Base sides", "Faces", "Edges", "Vertices"], ...shown] },
    subparts: [
      { label: "(a)", prompt: "Complete the table.", marks: 1, space: "none", answer: blanks.map(b => `${rows[b.i][0].toLowerCase()} ${family} ${["", "", "faces", "edges", "vertices"][b.cIdx]}: ${b.value}`).join("; "), working: [family === "prism" ? "Faces = sides + 2, edges = 3 × sides, vertices = 2 × sides" : "Faces = sides + 1, edges = 2 × sides, vertices = sides + 1"] },
      { label: "(b)", prompt: `A ${family} has a base with ${target} sides. How many edges does it have?`, marks: 1, answer: String(t.E), working: [family === "prism" ? `3 × ${target} = ${t.E}` : `2 × ${target} = ${t.E}`] },
      { label: "(c)", prompt: `How many vertices does that ${family} have?`, marks: 1, answer: String(t.V), working: [family === "prism" ? `2 × ${target} = ${t.V}` : `${target} + 1 = ${t.V}`] }
    ],
    answer: `(b) ${t.E} edges; (c) ${t.V} vertices`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["3D objects", "patterns"]
  });
}

function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function faceShapesQuestion() {
  const s = choice(POLYHEDRA.filter(t => t.id !== "cube"));
  const variant = choice(["how-many-rect", "how-many-tri", "base-shape", "total-shapes"]);
  const base = s.id === "rectangular-prism" ? "rectangle" : POLYGON[s.n];
  let prompt; let answer; let working; let distract;
  if (s.family === "prism" && (variant === "how-many-rect" || variant === "how-many-tri")) {
    const rects = s.id === "rectangular-prism" ? 6 : s.n;
    prompt = `How many of the faces of this ${s.name.toLowerCase()} are rectangles?`;
    answer = String(rects);
    working = s.id === "rectangular-prism" ? ["All 6 faces of a rectangular prism are rectangles."] : [`The ${s.n} faces joining the two ${base}s are rectangles.`];
    distract = [String(s.n + 2), String(s.n - 1), "2", String(2 * s.n)];
  } else if (s.family === "pyramid" && (variant === "how-many-rect" || variant === "how-many-tri")) {
    const tris = s.n === 3 ? 4 : s.n;
    prompt = `How many of the faces of this ${s.name.toLowerCase()} are triangles?`;
    answer = String(tris);
    working = s.n === 3 ? ["The base is a triangle too, so all 4 faces are triangles."] : [`One triangle rises from each of the ${s.n} sides of the base.`];
    distract = [String(s.n + 1), String(s.n - 1), "1", String(2 * s.n)];
  } else if (variant === "base-shape") {
    prompt = s.family === "prism" ? `What shape are the two ends of this prism?` : `What shape is the base of this pyramid?`;
    answer = capital(base);
    working = [`It is a ${s.name.toLowerCase()}, so the ${s.family === "prism" ? "ends are" : "base is a"} ${base}${s.family === "prism" ? "s" : ""}.`];
    distract = ["Triangle", "Square", "Pentagon", "Hexagon", "Rectangle", "Circle"].filter(x => x !== capital(base));
  } else {
    const { F } = fev(s);
    prompt = `Describe the faces of this ${s.name.toLowerCase()}: how many are there, and what shapes are they?`;
    answer = s.family === "prism"
      ? (s.id === "rectangular-prism" ? "6 faces, all rectangles" : `${F} faces: 2 ${base}s and ${s.n} rectangles`)
      : (s.n === 3 ? "4 faces, all triangles" : `${F} faces: 1 ${base} and ${s.n} triangles`);
    working = [answer];
    return q({ type: "face-shapes", marks: 2, prompt, diagram: solids({ diagramType: "solid", ...s.config }), answer, working, space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["3D objects", "faces"] });
  }
  return q({
    type: "face-shapes", marks: 1, prompt,
    diagram: solids({ diagramType: "solid", ...s.config }),
    answer, working, space: SPACE_SIZES.SMALL, mcDistractors: distract,
    tags: ["3D objects", "faces"]
  });
}

/* ── nets ────────────────────────────────────────────────── */

const sq = (x, y, w = 1, h = 1) => ({ pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]] });

/* A regular n-gon standing on the edge (x0,y0)→(x0+a,y0), on the side
   given by dir (−1 = above in screen coordinates, +1 = below). */
function polygonOnEdge(n, x0, y0, a, dir) {
  const th = (2 * Math.PI) / n;
  const pts = [[x0, y0]];
  let p = [x0, y0];
  for (let k = 0; k < n - 1; k++) {
    const ang = dir * k * th;
    p = [p[0] + a * Math.cos(ang), p[1] + a * Math.sin(ang)];
    pts.push(p);
  }
  return { pts };
}

function prismNet(n) {
  const a = 1;
  const h = n === 3 ? 1.8 : 1.5;
  const faces = [];
  for (let i = 0; i < n; i++) faces.push(sq(i * a, 0, a, h));
  const k = Math.floor((n - 1) / 2);
  const top = polygonOnEdge(n, k * a, 0, a, -1);
  const bottom = polygonOnEdge(n, (k + (n > 3 ? 1 : 0)) * a, h, a, 1);
  // polygonOnEdge walks from the left end; for "below" it must hang down
  return [...faces, top, bottom];
}

function pyramidNet(n) {
  const R = 1 / (2 * Math.sin(Math.PI / n));
  const t = n === 3 ? Math.sqrt(3) / 2 : 1.3;
  const base = [];
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + Math.PI / n + (i * 2 * Math.PI) / n;
    base.push([R * Math.cos(ang), R * Math.sin(ang)]);
  }
  const faces = [{ pts: base }];
  for (let i = 0; i < n; i++) {
    const A = base[i];
    const B = base[(i + 1) % n];
    const mx = (A[0] + B[0]) / 2;
    const my = (A[1] + B[1]) / 2;
    const len = Math.hypot(mx, my);
    faces.push({ pts: [A, B, [mx + (mx / len) * t, my + (my / len) * t]] });
  }
  return faces;
}

function rectPrismNet() {
  const l = 2; const w = 1; const h = 1.2;
  return [
    sq(w, 0, l, w),          // top
    sq(w, w, l, h),          // front
    sq(w, w + h, l, w),      // bottom
    sq(w, 2 * w + h, l, h),  // back
    sq(0, w, w, h),          // left
    sq(w + l, w, w, h)       // right
  ];
}

const CUBE_NET = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]].map(([x, y]) => sq(x, y));

const NETS = [
  { solid: "Cube", faces: () => CUBE_NET },
  { solid: "Rectangular prism", faces: rectPrismNet },
  { solid: "Triangular prism", faces: () => prismNet(3) },
  { solid: "Pentagonal prism", faces: () => prismNet(5) },
  { solid: "Hexagonal prism", faces: () => prismNet(6) },
  { solid: "Triangular pyramid", faces: () => pyramidNet(3) },
  { solid: "Square pyramid", faces: () => pyramidNet(4) },
  { solid: "Pentagonal pyramid", faces: () => pyramidNet(5) },
  { solid: "Hexagonal pyramid", faces: () => pyramidNet(6) }
];

function netToSolidQuestion() {
  const nt = choice(NETS);
  const faces = nt.faces();
  return q({
    type: "net-to-solid", marks: 1,
    prompt: "This net is folded along the lines. Which object does it make?",
    diagram: solids({ diagramType: "net", faces }),
    answer: nt.solid,
    working: [`The net has ${faces.length} faces.`, nt.solid.includes("pyramid")
      ? `One base with a triangle on every side: the triangles fold up to meet at the apex, making a ${nt.solid.toLowerCase()}.`
      : nt.solid === "Cube" ? "Six squares: a cube." : `Two matching ends and a strip of rectangles: a ${nt.solid.toLowerCase()}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [
      nt.solid.includes("prism") ? nt.solid.replace("prism", "pyramid") : nt.solid.replace("pyramid", "prism"),
      ...sample(NETS.filter(o => o.solid !== nt.solid).map(o => o.solid), 3)
    ].map(x => x.replace("Rectangular pyramid", "Square pyramid")),
    tags: ["3D objects", "nets"]
  });
}

/* Fold a set of unit squares by rolling a cube across them. Returns true if
   the six squares land on six different faces. */
export function foldsToCube(cells) {
  const key = (x, y) => `${x},${y}`;
  const set = new Set(cells.map(([x, y]) => key(x, y)));
  const start = cells[0];
  const seen = new Map();
  const queue = [[start[0], start[1], { D: "D", U: "U", N: "N", S: "S", E: "E", W: "W" }]];
  seen.set(key(start[0], start[1]), "D");
  while (queue.length) {
    const [x, y, o] = queue.shift();
    const moves = [
      [1, 0, { D: o.E, E: o.U, U: o.W, W: o.D, N: o.N, S: o.S }],
      [-1, 0, { D: o.W, W: o.U, U: o.E, E: o.D, N: o.N, S: o.S }],
      [0, 1, { D: o.S, S: o.U, U: o.N, N: o.D, E: o.E, W: o.W }],
      [0, -1, { D: o.N, N: o.U, U: o.S, S: o.D, E: o.E, W: o.W }]
    ];
    for (const [dx, dy, no] of moves) {
      const k = key(x + dx, y + dy);
      if (!set.has(k) || seen.has(k)) continue;
      seen.set(k, no.D);
      queue.push([x + dx, y + dy, no]);
    }
  }
  return seen.size === 6 && new Set(seen.values()).size === 6;
}

/* A random connected shape of six unit squares, normalised. */
function randomHexomino() {
  const cells = [[0, 0]];
  const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
  while (cells.length < 6) {
    const [x, y] = choice(cells);
    const [dx, dy] = choice([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    if (!has(x + dx, y + dy)) cells.push([x + dx, y + dy]);
  }
  const mx = Math.min(...cells.map(c => c[0]));
  const my = Math.min(...cells.map(c => c[1]));
  let norm = cells.map(([x, y]) => [x - mx, y - my]);
  // keep them landscape so four fit across a page
  const w = Math.max(...norm.map(c => c[0])) + 1;
  const h = Math.max(...norm.map(c => c[1])) + 1;
  if (h > w) norm = norm.map(([x, y]) => [y, x]);
  return norm;
}

function shapeKey(cells) {
  return cells.map(c => c.join(",")).sort().join(";");
}

export function cubeNetOptions() {
  const valid = [];
  const invalid = [];
  const seen = new Set();
  let guard = 0;
  while ((valid.length < 3 || invalid.length < 3) && guard < 4000) {
    guard += 1;
    const h = randomHexomino();
    const w = Math.max(...h.map(c => c[0])) + 1;
    const ht = Math.max(...h.map(c => c[1])) + 1;
    if (w > 5 || ht > 3) continue;
    const k = shapeKey(h);
    if (seen.has(k)) continue;
    seen.add(k);
    (foldsToCube(h) ? valid : invalid).push(h);
  }
  return { valid, invalid };
}

function cubeNetsQuestion() {
  const { valid, invalid } = cubeNetOptions();
  const nValid = choice([1, 2]);
  const picks = shuffle([...valid.slice(0, nValid).map(c => ({ c, ok: true })), ...invalid.slice(0, 4 - nValid).map(c => ({ c, ok: false }))]);
  const labels = ["A", "B", "C", "D"];
  const answerLetters = picks.map((p, i) => (p.ok ? labels[i] : null)).filter(Boolean);
  return q({
    type: "cube-nets", marks: 2,
    prompt: nValid === 1 ? "Only one of these nets folds to make a cube. Which one?" : "Which TWO of these nets fold to make a cube?",
    diagram: solids({ diagramType: "net", nets: picks.map((p, i) => ({ label: labels[i], faces: p.c.map(([x, y]) => sq(x, y)), cells: p.c })) }),
    answer: answerLetters.join(" and "),
    working: [
      "Imagine folding each net: one square is the base and the others fold up around it.",
      ...picks.map((p, i) => `${labels[i]}: ${p.ok ? "folds into a cube" : "two squares would land on the same face, leaving a face open"}`)
    ],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["3D objects", "nets", "cube"]
  });
}

function skeletalModelsQuestion() {
  const s = choice(POLYHEDRA);
  const { E, V } = fev(s);
  const variant = choice(["straws", "balls", "both", "cost"]);
  const diagram = solids({ diagramType: "solid", ...s.config });
  if (variant === "straws") {
    return q({
      type: "skeletal-models", marks: 1,
      prompt: `A skeletal model of this ${s.name.toLowerCase()} is made from straws (the edges) joined with modelling clay (the vertices). How many straws are needed?`,
      diagram, answer: String(E),
      working: ["One straw for each edge.", `A ${s.name.toLowerCase()} has ${E} edges.`],
      space: SPACE_SIZES.SMALL, mcDistractors: [String(V), String(fev(s).F), String(E + 2), String(E - s.n)],
      tags: ["3D objects", "skeletal models"]
    });
  }
  if (variant === "balls") {
    return q({
      type: "skeletal-models", marks: 1,
      prompt: `A skeletal model of this ${s.name.toLowerCase()} is made from toothpicks and balls of modelling clay. How many balls of clay are needed?`,
      diagram, answer: String(V),
      working: ["One ball at each vertex (corner).", `A ${s.name.toLowerCase()} has ${V} vertices.`],
      space: SPACE_SIZES.SMALL, mcDistractors: [String(E), String(fev(s).F), String(V + 1), String(V * 2)],
      tags: ["3D objects", "skeletal models"]
    });
  }
  if (variant === "both") {
    return q({
      type: "skeletal-models", marks: 2,
      prompt: `Mei builds a skeletal ${s.name.toLowerCase()} from pipe cleaners (edges) and connectors (vertices). How many pipe cleaners and how many connectors does she need?`,
      diagram, answer: `${E} pipe cleaners and ${V} connectors`,
      working: [`Edges: ${E}`, `Vertices: ${V}`],
      space: SPACE_SIZES.SMALL, mcEligible: false,
      tags: ["3D objects", "skeletal models"]
    });
  }
  const models = randInt(2, 5);
  return q({
    type: "skeletal-models", marks: 2,
    prompt: `A class makes ${models} skeletal ${s.name.toLowerCase()}s from straws and connectors. How many straws do they need altogether?`,
    diagram, answer: `${E * models} straws`,
    working: [`Each ${s.name.toLowerCase()} has ${E} edges.`, `${models} × ${E} = ${E * models} straws`],
    space: SPACE_SIZES.SMALL, mcDistractors: [`${V * models} straws`, `${E + models} straws`, `${E} straws`, `${fev(s).F * models} straws`],
    tags: ["3D objects", "skeletal models"]
  });
}

/* ── views of cube stacks ────────────────────────────────── */

export function stackViewsOf(heights) {
  const rows = heights.length;
  const cols = Math.max(...heights.map(r => r.length));
  const front = [];
  const side = [];
  const top = [];
  for (let c = 0; c < cols; c++) {
    const h = Math.max(...heights.map(r => r[c] || 0));
    for (let z = 0; z < h; z++) front.push([c, z]);
  }
  for (let r = 0; r < rows; r++) {
    const h = Math.max(...heights[r]);
    for (let z = 0; z < h; z++) side.push([r, z]);
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if ((heights[r][c] || 0) > 0) top.push([c, r]);
  return { front, side, top };
}

const cellsKey = cells => cells.map(c => c.join(",")).sort().join(";");

function randomStack() {
  const rows = choice([2, 2, 3]);
  const cols = choice([2, 3, 3]);
  for (;;) {
    const heights = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, () => (r === 0 ? randInt(1, 3) : randInt(0, 3))));
    // back rows no shorter than the front where they would hide cubes is fine;
    // insist on some variety so the three views differ
    const v = stackViewsOf(heights);
    const keys = [cellsKey(v.front), cellsKey(v.side), cellsKey(v.top)];
    if (new Set(keys).size < 3) continue;
    // every cube must be visible or deducible: no hidden cubes behind taller
    // front cubes — so require each back-row column to be at least as tall
    // as the one in front of it.
    let ok = true;
    for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) if (heights[r][c] > 0 && heights[r][c] < heights[r - 1][c]) ok = false;
    for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) if (heights[r][c] === 0 && heights[r - 1][c] === 0) ok = false;
    if (ok && Math.max(...heights.flat()) >= 2) return heights;
  }
}

function cubeStackViewsQuestion() {
  const heights = randomStack();
  const v = stackViewsOf(heights);
  const which = choice(["top", "front", "side"]);
  const correct = v[which];
  const mirror = cells => { const m = Math.max(...cells.map(c => c[0])); return cells.map(([x, y]) => [m - x, y]); };
  const flipUp = cells => { const m = Math.max(...cells.map(c => c[1])); return cells.map(([x, y]) => [x, m - y]); };
  const pool = [v.front, v.side, v.top, mirror(correct), flipUp(correct), mirror(v.side), mirror(v.front)];
  const opts = [correct];
  for (const p of shuffle(pool)) {
    if (opts.length === 4) break;
    if (!opts.some(o => cellsKey(o) === cellsKey(p))) opts.push(p);
  }
  if (opts.length < 4) return cubeStackViewsQuestion();
  const order = shuffle(opts);
  const labels = ["A", "B", "C", "D"];
  const letter = labels[order.findIndex(o => cellsKey(o) === cellsKey(correct))];
  const words = { top: "from the top", front: "from the front", side: "from the right-hand side" };
  return q({
    type: "cube-stack-views", marks: 1,
    prompt: `The object is made from cubes. Which diagram shows its view ${words[which]}?`,
    diagram: solids({ diagramType: "stack-views", heights, options: order.map((o, i) => ({ label: labels[i], cells: o })) }),
    answer: letter,
    working: which === "top"
      ? ["From above you see one square for every column of cubes, however tall."]
      : which === "front"
        ? ["From the front, each column shows its tallest stack."]
        : ["From the right, the front row is on your left; each row shows its tallest stack."],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["3D objects", "views"]
  });
}

/* ── capacity ────────────────────────────────────────────── */

const CAPACITY_ITEMS = [
  { item: "a teaspoon", unit: "mL" }, { item: "a drinking glass", unit: "mL" }, { item: "a bathtub", unit: "L" },
  { item: "a medicine cup", unit: "mL" }, { item: "a swimming pool", unit: "L" }, { item: "a car's fuel tank", unit: "L" },
  { item: "a can of soft drink", unit: "mL" }, { item: "a bucket", unit: "L" }, { item: "an eye-drop bottle", unit: "mL" },
  { item: "a rainwater tank", unit: "L" }, { item: "a coffee mug", unit: "mL" }, { item: "a kitchen sink", unit: "L" }
];

const ESTIMATES = [
  { item: "a can of soft drink", good: "375 mL", bad: ["375 L", "3 mL", "37 L"] },
  { item: "a bucket", good: "10 L", bad: ["10 mL", "100 L", "1 mL"] },
  { item: "a teaspoon", good: "5 mL", bad: ["5 L", "500 mL", "50 L"] },
  { item: "a bathtub", good: "150 L", bad: ["150 mL", "15 mL", "1 500 L"] },
  { item: "a coffee mug", good: "250 mL", bad: ["250 L", "25 L", "2 mL"] },
  { item: "a milk carton from the supermarket", good: "2 L", bad: ["2 mL", "200 L", "20 mL"] }
];

function capacityUnitsQuestion() {
  if (Math.random() < 0.5) {
    const it = choice(CAPACITY_ITEMS);
    return q({
      type: "capacity-units", marks: 1,
      prompt: `Which unit would you use to measure the capacity of ${it.item}: millilitres (mL) or litres (L)?`,
      answer: it.unit === "mL" ? "Millilitres (mL)" : "Litres (L)",
      working: [it.unit === "mL" ? "It holds a small amount, so millilitres." : "It holds a large amount, so litres."],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["capacity", "units"]
    });
  }
  const e = choice(ESTIMATES);
  return q({
    type: "capacity-units", marks: 1,
    prompt: `Which is the best estimate of the capacity of ${e.item}?`,
    answer: e.good,
    working: [`${e.good} is a sensible amount for ${e.item}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: e.bad,
    tags: ["capacity", "estimation"]
  });
}

function convertCapacityQuestion() {
  const dir = choice(["L-mL", "mL-L", "mixed"]);
  if (dir === "L-mL") {
    const L = choice([2, 3.5, 1.25, 0.75, 4.2, 0.5, 1.8, 2.05, 0.125, 6.4]);
    const mL = Math.round(L * 1000);
    return q({
      type: "convert-capacity", marks: 1,
      prompt: `Convert ${fmt(L, 3)} L to millilitres.`,
      answer: `${spaced(mL)} mL`,
      working: ["1 L = 1 000 mL, so multiply by 1 000.", `${fmt(L, 3)} × 1 000 = ${spaced(mL)} mL`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${fmt(L * 100, 2)} mL`, `${spaced(mL * 10)} mL`, `${fmt(L / 1000, 6)} mL`, `${fmt(L * 10, 2)} mL`],
      tags: ["capacity", "conversion"]
    });
  }
  if (dir === "mL-L") {
    const mL = choice([2500, 750, 1250, 400, 3050, 125, 6000, 1800, 90, 4375]);
    const L = mL / 1000;
    return q({
      type: "convert-capacity", marks: 1,
      prompt: `Write ${spaced(mL)} mL in litres.`,
      answer: `${fmt(L, 3)} L`,
      working: ["1 000 mL = 1 L, so divide by 1 000.", `${spaced(mL)} ÷ 1 000 = ${fmt(L, 3)} L`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${fmt(mL / 100, 2)} L`, `${fmt(mL / 10, 1)} L`, `${spaced(mL * 1000)} L`, `${fmt(mL / 10000, 4)} L`],
      tags: ["capacity", "conversion"]
    });
  }
  const L = randInt(1, 5);
  const mL = choice([250, 500, 750, 50, 125, 600]);
  const total = L * 1000 + mL;
  return q({
    type: "convert-capacity", marks: 1,
    prompt: `Write ${L} L ${mL} mL as a decimal number of litres.`,
    answer: `${fmt(total / 1000, 3)} L`,
    working: [`${mL} mL = ${fmt(mL / 1000, 3)} L`, `${L} + ${fmt(mL / 1000, 3)} = ${fmt(total / 1000, 3)} L`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [mL < 100 ? `${L}.${mL} L` : `${fmt(L + mL / 10000, 4)} L`, `${fmt(L + mL / 100, 2)} L`, `${spaced(total)} L`, `${fmt(total / 100, 2)} L`],
    tags: ["capacity", "decimals"]
  });
}

const JUGS = [
  { capacity: 1000, major: 200, minor: 50 },
  { capacity: 1000, major: 250, minor: 50 },
  { capacity: 500, major: 100, minor: 20 },
  { capacity: 500, major: 100, minor: 25 },
  { capacity: 2000, major: 500, minor: 100 },
  { capacity: 1000, major: 100, minor: 20 }
];

function readJugQuestion() {
  const j = choice(JUGS);
  const steps = j.capacity / j.minor;
  let k = randInt(2, steps - 1);
  if ((k * j.minor) % j.major === 0) k += 1;
  const level = k * j.minor;
  const asLitres = j.capacity >= 1000 && Math.random() < 0.35;
  return q({
    type: "read-jug", marks: 1,
    prompt: asLitres ? "How much water is in the jug? Give your answer in litres." : "How much water is in the jug?",
    diagram: measure({ diagramType: "jug", ...j, level, unit: "mL" }),
    answer: asLitres ? `${fmt(level / 1000, 3)} L` : `${spaced(level)} mL`,
    working: [`Each small mark is ${j.minor} mL (${j.major / j.minor} spaces between labelled marks ${j.major} mL apart).`, `The water is at ${spaced(level)} mL${asLitres ? ` = ${fmt(level / 1000, 3)} L` : ""}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: asLitres
      ? [`${fmt((level + j.minor) / 1000, 3)} L`, `${fmt((level - j.minor) / 1000, 3)} L`, `${spaced(level)} L`, `${fmt(level / 100, 2)} L`]
      : [`${spaced(level + j.minor)} mL`, `${spaced(level - j.minor)} mL`, `${spaced(level + j.major)} mL`, `${spaced(level)} L`],
    tags: ["capacity", "reading scales"]
  });
}

function capacityProblemsQuestion() {
  const v = choice(["cups", "left", "bottles", "compare"]);
  if (v === "cups") {
    const cup = choice([200, 250, 125, 300]);
    const n = randInt(4, 12);
    const L = (cup * n) / 1000;
    return q({
      type: "capacity-problems", marks: 2,
      prompt: `A jug holds ${fmt(L, 3)} L of juice. How many ${cup} mL cups can be filled from it?`,
      answer: `${n} cups`,
      working: [`${fmt(L, 3)} L = ${spaced(cup * n)} mL`, `${spaced(cup * n)} ÷ ${cup} = ${n} cups`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${n * 10} cups`, `${n + 1} cups`, `${Math.round(L * 1000 / cup / 10) || 1} cups`, `${n - 1} cups`],
      tags: ["capacity", "problems"]
    });
  }
  if (v === "left") {
    const total = choice([1.5, 2, 1.25, 3, 2.5]);
    const pours = [randInt(2, 6) * 50, randInt(2, 8) * 25];
    const used = pours[0] + pours[1];
    const left = total * 1000 - used;
    if (left <= 0) return capacityProblemsQuestion();
    return q({
      type: "capacity-problems", marks: 2,
      prompt: `A bottle holds ${fmt(total)} L of water. Sam pours out ${pours[0]} mL and then ${pours[1]} mL. How much water is left in the bottle?`,
      answer: `${spaced(left)} mL`,
      working: [`${fmt(total)} L = ${spaced(total * 1000)} mL`, `${pours[0]} + ${pours[1]} = ${used} mL poured`, `${spaced(total * 1000)} − ${used} = ${spaced(left)} mL`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [`${spaced(left + 2 * pours[1])} mL`, `${fmt(total - used / 100, 2)} L`, `${spaced(used)} mL`, `${spaced(left + 100)} mL`],
      tags: ["capacity", "problems"]
    });
  }
  if (v === "bottles") {
    const size = choice([600, 750, 1250, 1500]);
    const n = randInt(3, 8);
    const total = size * n;
    return q({
      type: "capacity-problems", marks: 2,
      prompt: `A pack has ${n} bottles of water, each holding ${spaced(size)} mL. How many litres of water is that altogether?`,
      answer: `${fmt(total / 1000, 3)} L`,
      working: [`${n} × ${spaced(size)} = ${spaced(total)} mL`, `${spaced(total)} mL = ${fmt(total / 1000, 3)} L`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${spaced(total)} L`, `${fmt(total / 100, 2)} L`, `${fmt(total / 10000, 4)} L`, `${fmt((total + size) / 1000, 3)} L`],
      tags: ["capacity", "problems"]
    });
  }
  const items = sample([["jug A", choice([1.2, 0.95, 1.05, 1.5])], ["jug B", choice([1150, 980, 1020, 1400])], ["jug C", choice([1.1, 0.9, 1.35])]], 3);
  const inmL = items.map(([n, v]) => [n, v < 10 ? v * 1000 : v, v < 10 ? `${fmt(v)} L` : `${spaced(v)} mL`]);
  if (new Set(inmL.map(i => i[1])).size < 3) return capacityProblemsQuestion();
  const sorted = [...inmL].sort((a, b) => b[1] - a[1]);
  return q({
    type: "capacity-problems", marks: 1,
    prompt: `Three jugs hold ${inmL.map(i => `${i[2]} (${i[0]})`).join(", ")}. Which jug holds the most?`,
    answer: capital(sorted[0][0]),
    working: ["Write them all in millilitres:", ...inmL.map(i => `${i[0]}: ${spaced(i[1])} mL`), `${capital(sorted[0][0])} holds the most.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["capacity", "comparing"]
  });
}

function displacementQuestion() {
  const j = choice([{ capacity: 500, major: 100, minor: 20 }, { capacity: 1000, major: 200, minor: 50 }, { capacity: 500, major: 100, minor: 25 }]);
  const steps = j.capacity / j.minor;
  const b = randInt(Math.round(steps * 0.3), Math.round(steps * 0.55));
  const a = b + randInt(2, Math.round(steps * 0.3));
  const before = b * j.minor;
  const after = a * j.minor;
  const d = after - before;
  const unitCm = Math.random() < 0.5;
  return q({
    type: "displacement", marks: 2,
    prompt: `A rock is dropped into the jug of water. ${unitCm ? "What is the volume of the rock in cubic centimetres? (1 mL of water displaced = 1 cm³)" : "What is the volume of the rock?"}`,
    diagram: measure({ diagramType: "jugs", ...j, before, after, unit: "mL" }),
    answer: unitCm ? `${d} cm³` : `${d} mL (${d} cm³)`,
    working: [`Before: ${before} mL; after: ${after} mL`, `The rock pushed up ${after} − ${before} = ${d} mL of water.`, `Volume of the rock = ${d} cm³`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: unitCm ? [`${after} cm³`, `${before} cm³`, `${after + before} cm³`, `${d} cm²`] : undefined,
    mcEligible: unitCm,
    tags: ["volume", "displacement"]
  });
}

/* ── volume ──────────────────────────────────────────────── */

function countCubesQuestion() {
  const shape = choice(["box", "box", "steps", "L"]);
  let heights;
  if (shape === "box") {
    const l = randInt(2, 4); const w = randInt(1, 3); const h = randInt(1, 3);
    heights = Array.from({ length: w }, () => Array(l).fill(h));
  } else if (shape === "steps") {
    const l = randInt(3, 4); const w = randInt(1, 2);
    heights = Array.from({ length: w }, () => Array.from({ length: l }, (_, i) => l - i));
  } else {
    const l = randInt(3, 4); const w = randInt(1, 2);
    heights = Array.from({ length: w }, () => Array.from({ length: l }, (_, i) => (i === 0 ? 3 : 1)));
  }
  const total = heights.flat().reduce((s, v) => s + v, 0);
  const cm = Math.random() < 0.6;
  return q({
    type: "count-cubes", marks: 1,
    prompt: cm ? "The object is made from 1 cm cubes. What is its volume?" : "How many cubes make this object? (There are no hidden gaps.)",
    diagram: vol("cube-array", { heights }),
    answer: cm ? `${total} cm³` : `${total} cubes`,
    working: shape === "box"
      ? [`${heights[0].length} × ${heights.length} = ${heights[0].length * heights.length} cubes in each layer`, `${heights[0][0]} ${plural(heights[0][0], "layer")}: ${total} cubes`]
      : ["Count each column of cubes and add.", `${heights.map(r => r.join(" + ")).join(" + ")} = ${total}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: cm ? [`${total + 2} cm³`, `${total - 1} cm³`, `${total} cm²`, `${total + heights[0].length} cm³`] : [`${total + 2} cubes`, `${total - 1} cubes`, `${total + heights.length} cubes`],
    tags: ["volume", "counting cubes"]
  });
}

function layersQuestion() {
  const l = randInt(3, 6); const w = randInt(2, 4); const h = randInt(2, 5);
  const per = l * w;
  const v = choice(["layers", "layer-first", "boxes"]);
  if (v === "layers") {
    return q({
      type: "layers", marks: 2,
      prompt: `The bottom layer of a box is filled with ${l} rows of ${w} centimetre cubes. The box holds ${h} layers like this. What is the volume of the box?`,
      answer: `${per * h} cm³`,
      working: [`One layer: ${l} × ${w} = ${per} cubes`, `${h} layers: ${per} × ${h} = ${per * h} cubes`, `Volume = ${per * h} cm³`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${l + w + h} cm³`, `${per} cm³`, `${per * (h + 1)} cm³`, `${per * h} cm²`],
      tags: ["volume", "layers"]
    });
  }
  if (v === "layer-first") {
    return q({
      type: "layers", marks: 2,
      prompt: `A rectangular prism is built from centimetre cubes. Each layer has ${per} cubes and the whole prism has ${per * h} cubes. How many layers are there?`,
      answer: `${h} layers`,
      working: [`${per * h} ÷ ${per} = ${h}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${h + 1} layers`, `${per} layers`, `${h - 1 || 7} layers`],
      tags: ["volume", "layers"]
    });
  }
  return q({
    type: "layers", marks: 2,
    prompt: `How many 1 cm cubes are needed to build the rectangular prism shown?`,
    diagram: vol("rectangular-prism", { length: l, width: w, height: h, unit: "cm", label: "" }),
    answer: `${per * h} cubes`,
    working: [`Bottom layer: ${l} × ${w} = ${per} cubes`, `${h} layers: ${per} × ${h} = ${per * h} cubes`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${2 * (l * w + l * h + w * h)} cubes`, `${l + w + h} cubes`, `${per} cubes`],
    tags: ["volume", "layers"]
  });
}

function volumeFormulaQuestion() {
  const m = Math.random() < 0.35;
  const unit = m ? "m" : "cm";
  const l = m ? randInt(2, 8) : randInt(3, 15);
  const w = m ? randInt(1, 5) : randInt(2, 10);
  const h = m ? randInt(1, 4) : randInt(2, 12);
  const cube = Math.random() < 0.15;
  const L = cube ? w : l; const W = w; const H = cube ? w : h;
  const V = L * W * H;
  return q({
    type: "volume-formula", marks: cube ? 1 : 2,
    prompt: `Find the volume of this ${cube ? "cube" : "rectangular prism"}.`,
    diagram: vol("rectangular-prism", { length: L, width: W, height: H, unit, label: "", isCube: cube }),
    answer: `${spaced(V)} ${unit}³`,
    working: ["V = length × width × height", `V = ${L} × ${W} × ${H}`, `V = ${spaced(V)} ${unit}³`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${spaced(V)} ${unit}²`, `${L + W + H} ${unit}³`, `${spaced(2 * (L * W + L * H + W * H))} ${unit}³`, `${spaced(L * W)} ${unit}³`],
    tags: ["volume", "rectangular prism"]
  });
}

const VOLUME_UNIT_ITEMS = [
  { item: "a shipping container", unit: "m³" }, { item: "a matchbox", unit: "cm³" }, { item: "a classroom", unit: "m³" },
  { item: "a dice", unit: "cm³" }, { item: "a skip bin", unit: "m³" }, { item: "a lunch box", unit: "cm³" },
  { item: "a truckload of soil", unit: "m³" }, { item: "a pencil case", unit: "cm³" }
];

function cubicMetresQuestion() {
  const v = choice(["unit", "unit", "skip", "cubes-in-m"]);
  if (v === "unit") {
    const it = choice(VOLUME_UNIT_ITEMS);
    return q({
      type: "cubic-metres", marks: 1,
      prompt: `Would you measure the volume of ${it.item} in cubic centimetres (cm³) or cubic metres (m³)?`,
      answer: it.unit === "m³" ? "Cubic metres (m³)" : "Cubic centimetres (cm³)",
      working: [it.unit === "m³" ? "It is large, so cubic metres." : "It is small, so cubic centimetres."],
      space: SPACE_SIZES.SMALL,
      mcEligible: false,
      tags: ["volume", "units"]
    });
  }
  if (v === "skip") {
    const l = randInt(2, 6); const w = randInt(2, 4); const h = choice([1, 2]);
    return q({
      type: "cubic-metres", marks: 2,
      prompt: `A garden bed is ${l} m long, ${w} m wide and ${h} m deep. How many cubic metres of soil are needed to fill it?`,
      answer: `${l * w * h} m³`,
      working: [`V = ${l} × ${w} × ${h}`, `V = ${l * w * h} m³`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${l * w} m³`, `${l + w + h} m³`, `${l * w * h} m²`, `${2 * (l * w + l * h + w * h)} m³`],
      tags: ["volume", "cubic metres"]
    });
  }
  const s = choice([2, 3, 4]);
  return q({
    type: "cubic-metres", marks: 2,
    prompt: `A crate is a cube with edges ${s} m long. How many 1 m³ blocks would fill it?`,
    answer: `${s ** 3} blocks`,
    working: [`${s} × ${s} = ${s * s} blocks in each layer`, `${s} layers: ${s * s} × ${s} = ${s ** 3} blocks`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${s * s} blocks`, `${3 * s} blocks`, `${6 * s * s} blocks`, `${s * 4} blocks`],
    tags: ["volume", "cubic metres"]
  });
}

function missingDimensionQuestion() {
  const l = randInt(3, 10); const w = randInt(2, 8); const h = randInt(2, 9);
  const V = l * w * h;
  const which = choice(["height", "length", "width"]);
  const known = which === "height" ? [l, w] : which === "length" ? [w, h] : [l, h];
  const ans = which === "height" ? h : which === "length" ? l : w;
  const names = which === "height" ? ["length", "width"] : which === "length" ? ["width", "height"] : ["length", "height"];
  return q({
    type: "missing-dimension", marks: 2,
    prompt: `A rectangular prism has a volume of ${V} cm³. Its ${names[0]} is ${known[0]} cm and its ${names[1]} is ${known[1]} cm. What is its ${which}?`,
    answer: `${ans} cm`,
    working: [`${known[0]} × ${known[1]} = ${known[0] * known[1]} cm³ in each layer`, `${V} ÷ ${known[0] * known[1]} = ${ans} cm`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${V - known[0] - known[1]} cm`, `${ans + 1} cm`, `${V / known[0]} cm`, `${ans} cm³`],
    tags: ["volume", "missing dimension"]
  });
}

function multiPart3DQuestion() {
  const variant = choice(["solid", "tank"]);
  if (variant === "solid") {
    const s = choice(POLYHEDRA.filter(t => t.id !== "cube"));
    const { F, E, V } = fev(s);
    return q({
      type: "multi-part-3d", marks: 4,
      prompt: "Look at this object.",
      diagram: solids({ diagramType: "solid", ...s.config }),
      subparts: [
        { label: "(a)", prompt: "Name the object.", marks: 1, answer: s.name, working: [s.family === "prism" ? "Two identical ends joined by rectangles: a prism." : "One base and triangles meeting at the apex: a pyramid."] },
        { label: "(b)", prompt: "How many faces, edges and vertices does it have?", marks: 2, answer: `${F} faces, ${E} edges, ${V} vertices`, working: [`F = ${F}, E = ${E}, V = ${V}`] },
        { label: "(c)", prompt: "A skeletal model uses a straw for each edge. How many straws are needed?", marks: 1, answer: `${E} straws`, working: ["One straw per edge."] }
      ],
      answer: `(a) ${s.name}; (b) ${F} faces, ${E} edges, ${V} vertices; (c) ${E} straws`,
      working: [],
      space: SPACE_SIZES.SMALL,
      tags: ["3D objects", "multi-part"]
    });
  }
  const l = choice([20, 25, 30, 40]); const w = choice([10, 20]); const h = choice([10, 20, 30]);
  const V = l * w * h;
  const cup = choice([250, 500]);
  return q({
    type: "multi-part-3d", marks: 4,
    prompt: `A fish tank is ${l} cm long, ${w} cm wide and ${h} cm high.`,
    diagram: vol("rectangular-prism", { length: l, width: w, height: h, unit: "cm", label: "" }),
    subparts: [
      { label: "(a)", prompt: "Find the volume of the tank in cm³.", marks: 2, answer: `${spaced(V)} cm³`, working: [`${l} × ${w} × ${h} = ${spaced(V)} cm³`] },
      { label: "(b)", prompt: "The tank holds 1 mL of water for every 1 cm³. How many litres of water does it hold when full?", marks: 1, answer: `${fmt(V / 1000, 3)} L`, working: [`${spaced(V)} mL = ${fmt(V / 1000, 3)} L`] },
      { label: "(c)", prompt: `How many ${cup} mL jugs of water are needed to fill it?`, marks: 1, answer: `${V / cup} jugs`, working: [`${spaced(V)} ÷ ${cup} = ${V / cup}`] }
    ],
    answer: `(a) ${spaced(V)} cm³; (b) ${fmt(V / 1000, 3)} L; (c) ${V / cup} jugs`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["volume", "capacity", "multi-part"]
  });
}

const GENERATORS = {
  "name-solid": nameSolidQuestion,
  "prism-or-pyramid": prismOrPyramidQuestion,
  "faces-edges-vertices": facesEdgesVerticesQuestion,
  "fev-pattern": fevPatternQuestion,
  "face-shapes": faceShapesQuestion,
  "net-to-solid": netToSolidQuestion,
  "cube-nets": cubeNetsQuestion,
  "skeletal-models": skeletalModelsQuestion,
  "cube-stack-views": cubeStackViewsQuestion,
  "capacity-units": capacityUnitsQuestion,
  "convert-capacity": convertCapacityQuestion,
  "read-jug": readJugQuestion,
  "capacity-problems": capacityProblemsQuestion,
  "displacement": displacementQuestion,
  "count-cubes": countCubesQuestion,
  "layers": layersQuestion,
  "volume-formula": volumeFormulaQuestion,
  "cubic-metres": cubicMetresQuestion,
  "missing-dimension": missingDimensionQuestion,
  "multi-part-3d": multiPart3DQuestion
};

export function getStage3ThreeDQuestionTypes() {
  return TYPE_LIST;
}

export function generateStage3ThreeDQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
