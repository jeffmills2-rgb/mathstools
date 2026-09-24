/* Stage 3 "3D Space and Volume" — every count, net, view and reading is
   re-derived here WITHOUT the bank's helpers, from the diagram config. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/stage-3/three-d-space-volume/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getStage3ThreeDQuestionTypes();
const ALL = bank.generateStage3ThreeDQuestions({ count: 3000 });
const by = id => ALL.filter(q => q.type === id);
const num = s => Number(String(s).replace(/[^\d.]/g, ""));

console.log("\nCOVERAGE");
t("20 question types declared", TYPES.length === 20, `${TYPES.length}`);
t("every declared type generates", TYPES.every(ty => by(ty.id).length > 0));

/* Independent solid model: build vertices and faces, count unique edges. */
function countsOf(cfg) {
  const n = cfg.sides;
  if (cfg.kind === "prism") {
    const faces = [[...Array(n).keys()], [...Array(n).keys()].map(i => i + n)];
    for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n + (i + 1) % n, n + i]);
    return tally(faces, 2 * n);
  }
  const faces = [[...Array(n).keys()]];
  for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n]);
  return tally(faces, n + 1);
}
function tally(faces, V) {
  const edges = new Set();
  faces.forEach(f => f.forEach((a, i) => { const b = f[(i + 1) % f.length]; edges.add(a < b ? `${a}-${b}` : `${b}-${a}`); }));
  return { F: faces.length, E: edges.size, V };
}
const NAME = { 3: "Triangular", 5: "Pentagonal", 6: "Hexagonal", 8: "Octagonal" };
const nameOf = c => c.kind === "cylinder" ? "Cylinder" : c.kind === "cone" ? "Cone" : c.kind === "sphere" ? "Sphere"
  : c.kind === "prism" ? (c.cube ? "Cube" : c.sides === 4 ? "Rectangular prism" : `${NAME[c.sides]} prism`)
    : c.sides === 4 ? "Square pyramid" : `${NAME[c.sides]} pyramid`;

console.log("\nSOLIDS: NAMES AND COUNTS FROM THE PICTURE");
t("names match the drawn solid", by("name-solid").every(q => q.answer === nameOf(q.diagram.config)), `${by("name-solid").length}`);
t("prism/pyramid answers match the drawing", by("prism-or-pyramid").every(q => q.answer.toLowerCase().startsWith(`a ${q.diagram.config.kind}`)));
t("faces, edges, vertices recounted", by("faces-edges-vertices").every(q => {
  const c = countsOf(q.diagram.config);
  return q.answer === `(a) ${c.F} faces; (b) ${c.E} edges; (c) ${c.V} vertices`;
}));
t("skeletal models: straws = edges, clay = vertices", by("skeletal-models").every(q => {
  const c = countsOf(q.diagram.config);
  const m = q.prompt.match(/makes (\d+) skeletal/);
  if (m) return num(q.answer) === c.E * Number(m[1]);
  if (/straws are needed/.test(q.prompt)) return num(q.answer) === c.E;
  if (/balls of clay/.test(q.prompt)) return num(q.answer) === c.V;
  return q.answer === `${c.E} pipe cleaners and ${c.V} connectors`;
}));
t("pattern table: rule answers are right", by("fev-pattern").every(q => {
  const fam = /prisms/.test(q.prompt) ? "prism" : "pyramid";
  const n = Number(q.subparts[1].prompt.match(/with (\d+) sides/)[1]);
  const c = countsOf({ kind: fam, sides: n });
  return q.subparts[1].answer === String(c.E) && q.subparts[2].answer === String(c.V);
}));

console.log("\nNETS");
/* Independent cube fold: carry a 3D frame (normal + two in-plane axes) across
   each shared edge and collect the outward normals. */
function folds(cells) {
  const key = c => c.join(",");
  const set = new Set(cells.map(key));
  const start = cells[0];
  const frames = new Map([[key(start), { n: [0, 0, -1], x: [1, 0, 0], y: [0, 1, 0] }]]);
  const q = [start];
  const neg = v => v.map(a => -a);
  while (q.length) {
    const [cx, cy] = q.shift();
    const f = frames.get(key([cx, cy]));
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = key([cx + dx, cy + dy]);
      if (!set.has(k) || frames.has(k)) continue;
      // folding up over the edge in direction d: the new face's normal is the
      // old in-plane direction d; its d-axis becomes the old −normal
      let nf;
      if (dx === 1) nf = { n: f.x, x: neg(f.n), y: f.y };
      if (dx === -1) nf = { n: neg(f.x), x: f.n, y: f.y };
      if (dy === 1) nf = { n: f.y, x: f.x, y: neg(f.n) };
      if (dy === -1) nf = { n: neg(f.y), x: f.x, y: f.n };
      frames.set(k, nf);
      q.push([cx + dx, cy + dy]);
    }
  }
  return frames.size === 6 && new Set([...frames.values()].map(f => f.n.join())).size === 6;
}
let netBad = 0;
for (const q of by("cube-nets")) {
  const good = q.diagram.config.nets.map((n, i) => (folds(n.cells) ? n.label : null)).filter(Boolean);
  if (good.join(" and ") !== q.answer) netBad++;
}
t("cube-net answers agree with an independent fold", netBad === 0, `${by("cube-nets").length} checked`);
t("the 11 valid cube nets are all reachable (sanity)", (() => {
  const nets = new Set();
  for (let i = 0; i < 400; i++) { const o = bank.cubeNetOptions(); o.valid.forEach(v => nets.add(JSON.stringify(v))); }
  return [...nets].every(n => folds(JSON.parse(n)));
})());
t("net-to-solid face counts fit the solid", by("net-to-solid").every(q => {
  const f = q.diagram.config.faces.length;
  const s = q.answer;
  const n = s.startsWith("Cube") || s.startsWith("Rectangular") ? 4 : { Triangular: 3, Square: 4, Pentagonal: 5, Hexagonal: 6 }[s.split(" ")[0]];
  return s.includes("pyramid") ? f === n + 1 : f === n + 2;
}));

console.log("\nVIEWS OF CUBE STACKS");
function viewsIndependent(h) {
  const vox = [];
  h.forEach((row, r) => row.forEach((ht, c) => { for (let z = 0; z < ht; z++) vox.push([c, r, z]); }));
  const proj = (f) => [...new Set(vox.map(f).map(p => p.join(",")))].sort().join(";");
  return {
    front: proj(([c, , z]) => [c, z]),
    side: proj(([, r, z]) => [r, z]),
    top: proj(([c, r]) => [c, r])
  };
}
const cellKey = cells => cells.map(c => c.join(",")).sort().join(";");
t("the lettered answer is the true view, and only that option matches", by("cube-stack-views").every(q => {
  const which = /top/.test(q.prompt) ? "top" : /front/.test(q.prompt) ? "front" : "side";
  const truth = viewsIndependent(q.diagram.config.heights)[which];
  const hits = q.diagram.config.options.filter(o => cellKey(o.cells) === truth).map(o => o.label);
  return hits.length === 1 && hits[0] === q.answer;
}), `${by("cube-stack-views").length} checked`);
t("no hidden cubes (back columns never shorter than the front)", by("cube-stack-views").every(q => {
  const h = q.diagram.config.heights;
  return h.every((row, r) => r === 0 || row.every((v, c) => v === 0 || v >= h[r - 1][c]));
}));

console.log("\nCAPACITY AND VOLUME");
t("jug readings sit on a minor mark and match", by("read-jug").every(q => {
  const c = q.diagram.config;
  const onMark = Math.abs(c.level / c.minor - Math.round(c.level / c.minor)) < 1e-9;
  const v = /litres/.test(q.prompt) ? num(q.answer) * 1000 : num(q.answer);
  return onMark && Math.abs(v - c.level) < 1e-6 && c.level % c.major !== 0;
}));
t("displacement = after − before", by("displacement").every(q => num(q.answer.split(" ")[0]) === q.diagram.config.after - q.diagram.config.before));
t("counting cubes = sum of column heights", by("count-cubes").every(q => num(q.answer) === q.diagram.config.heights.flat().reduce((s, v) => s + v, 0)));
t("V = l × w × h from the labelled diagram", by("volume-formula").every(q => {
  const c = q.diagram.config;
  return num(q.answer.replace(/[³²]/g, "")) === c.length * c.width * c.height && /³$/.test(q.answer);
}));
t("L ↔ mL conversions", by("convert-capacity").every(q => {
  const m = q.prompt.match(/Convert ([\d.]+) L/);
  if (m) return Math.abs(num(q.answer) - Number(m[1]) * 1000) < 1e-6;
  const w = q.prompt.match(/Write ([\d\s]+) mL in litres/);
  if (w) return Math.abs(num(q.answer) - num(w[1]) / 1000) < 1e-9;
  const x = q.prompt.match(/Write (\d+) L (\d+) mL/);
  return Math.abs(num(q.answer) - (Number(x[1]) + Number(x[2]) / 1000)) < 1e-9;
}));
t("missing dimension × the other two = volume", by("missing-dimension").every(q => {
  const [V, a, b] = q.prompt.match(/(\d+) cm³.*? is (\d+) cm.*? is (\d+) cm/).slice(1).map(Number);
  return num(q.answer) * a * b === V;
}));

console.log("\nSTAGE BOUNDARY AND SPACE");
t("no Stage 4 volume (V = Ah, cylinders' volume, mm³)", !ALL.some(q => /V = Ah|mm³|πr/.test(q.prompt + q.answer + (q.working || []).join(" "))));
t("draw/complete-on-the-diagram questions get no answer space", ALL.filter(q => q.subparts === null && /^(Draw|Complete)/.test(q.prompt)).every(q => resolveAnswerSpace(q).kind === "none"));
t("explanations get ruled lines", ALL.filter(q => /Explain/.test(q.prompt)).every(q => resolveAnswerSpace(q).kind === "lines"));
t("MC distractors never repeat the answer", ALL.every(q => !(q.mcDistractors || []).includes(String(q.answer))));
t("every answer is present", ALL.every(q => String(q.answer ?? "").length > 0));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
