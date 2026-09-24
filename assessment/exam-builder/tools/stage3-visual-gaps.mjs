/* Stage 3 visual gap-fill types (2D, Geometric Measure, Represents Numbers,
   Fractions, Multiplicative and Additive Relations). Every answer is
   re-derived from the diagram it sits beside. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const load = p => import(base + `question-banks/stage-3/${p}/index.js`);
const twoD = await load("two-d-space-area");
const gm = await load("geometric-measure");
const rn = await load("represents-numbers");
const fr = await load("fractions");
const mr = await load("multiplicative-relations");
const ar = await load("additive-relations");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const gen = (fn, types, n = 300) => types.flatMap(ty => fn({ count: n, allowedTypes: [ty] }));
const num = s => Number(String(s).replace(/[^\d.]/g, ""));
const fv = s => { const m = String(s).match(/\[\[frac:(\d+):(\d+)\]\]/); return m ? Number(m[1]) / Number(m[2]) : NaN; };

console.log("\n2D SPACE — GRIDS");
/* Independent transformation test: compare edge-vector sequences. */
function shapeSig(pts) {
  const mx = Math.min(...pts.map(p => p[0])); const my = Math.min(...pts.map(p => p[1]));
  return pts.map(([x, y]) => [x - mx, y - my].join(",")).sort().join(" ");
}
const images = pts => {
  const ops = {
    translation: [p => p],
    reflection: [([x, y]) => [-x, y], ([x, y]) => [x, -y], ([x, y]) => [y, x], ([x, y]) => [-y, -x]],
    rotation: [([x, y]) => [-y, x], ([x, y]) => [-x, -y], ([x, y]) => [y, -x]]
  };
  const out = {};
  for (const k in ops) out[k] = ops[k].map(f => shapeSig(pts.map(f)));
  return out;
};
const G = gen(twoD.generateStage3TwoDQuestions, ["name-transformation-grid"]);
t("named transformation is the ONLY kind that maps A onto B", G.every(q => {
  const [A, B] = q.diagram.config.shapes.map(s => s.pts);
  const im = images(A); const target = shapeSig(B);
  const kinds = Object.keys(im).filter(k => im[k].includes(target));
  return kinds.length === 1 && kinds[0] === q.answer.toLowerCase();
}), `${G.length} checked`);
const TR = gen(twoD.generateStage3TwoDQuestions, ["describe-translation"]);
t("translation descriptions match the vertex shift", TR.every(q => {
  const [A, B] = q.diagram.config.shapes.map(s => s.pts);
  const dx = B[0][0] - A[0][0]; const dy = B[0][1] - A[0][1];
  const r = Number((q.answer.match(/(\d+) squares? right/) || [0, 0])[1]);
  const v = q.answer.match(/(\d+) squares? (up|down)/);
  const dv = v ? (v[2] === "down" ? 1 : -1) * Number(v[1]) : 0;
  return r === dx && dv === dy && B.every((p, i) => p[0] - A[i][0] === dx && p[1] - A[i][1] === dy);
}));
const DR = gen(twoD.generateStage3TwoDQuestions, ["draw-transformation", "complete-symmetric"]);
t("draw/complete questions: shape fits the grid, no answer space", DR.every(q => {
  const c = q.diagram.config;
  return c.shapes.every(s => s.pts.every(([x, y]) => x >= 0 && y >= 0 && x <= c.cols && y <= c.rows)) && resolveAnswerSpace(q).kind === "none";
}));
t("drawn images stay on the grid", DR.filter(q => q.type === "draw-transformation").every(q => {
  const c = q.diagram.config; const pts = [...q.answer.matchAll(/\((\d+), (\d+)\)/g)].map(m => [Number(m[1]), Number(m[2])]);
  return pts.length >= 3 && pts.every(([x, y]) => x <= c.cols && y <= c.rows);
}));
const CA = gen(twoD.generateStage3TwoDQuestions, ["composite-area-diagram"]);
t("composite area from the polygon's own corners (shoelace)", CA.every(q => {
  const c = q.diagram.config; const labels = c.sideLabels.map(l => num(l.text));
  const W = labels[0]; const H = labels[1]; const w = labels[2]; const h = labels[3];
  const pts = [[0, 0], [W, 0], [W, h], [w, h], [w, H], [0, H]];
  let s = 0; pts.forEach((p, i) => { const n = pts[(i + 1) % pts.length]; s += p[0] * n[1] - n[0] * p[1]; });
  return num(q.answer.replace("²", "")) === Math.abs(s) / 2 && /²$/.test(q.answer);
}), `${CA.length}`);
const SY = gen(twoD.generateStage3TwoDQuestions, ["symmetry-diagram"]);
const LINES = { "equilateral triangle": 3, square: 4, rectangle: 2, rhombus: 2, parallelogram: 0, kite: 1, "regular pentagon": 5, "regular hexagon": 6, "regular octagon": 8 };
t("lines of symmetry of drawn shapes", SY.every(q => LINES[q.prompt.match(/is an? (.+?)\./)[1]] === Number(q.answer)));

console.log("\nGEOMETRIC MEASURE");
const angleOf = c => {
  const O = c.points.O; const A = c.points.A; const B = c.points.B;
  const a1 = Math.atan2(O[1] - A[1], A[0] - O[0]); const a2 = Math.atan2(O[1] - B[1], B[0] - O[0]);
  let d = ((a2 - a1) * 180 / Math.PI + 360) % 360;
  if (Math.abs(d) < 1e-6 && c.angles[0].reflex) d = 360;
  return Math.round(d);
};
const classify = a => a < 90 ? "Acute" : a === 90 ? "Right" : a < 180 ? "Obtuse" : a === 180 ? "Straight" : "Reflex";
const CL = gen(gm.generateStage3GeometricMeasureQuestions, ["classify-angle-diagram"]);
t("drawn angle, measured from its arms, has the answered type", CL.every(q => classify(angleOf(q.diagram.config)) === q.answer), `${CL.length}`);
const ES = gen(gm.generateStage3GeometricMeasureQuestions, ["estimate-angle-diagram"]);
t("estimate answer is the drawn angle, and every other option is ≥ 40° away", ES.every(q => {
  const a = angleOf(q.diagram.config);
  const opts = [...q.prompt.matchAll(/(\d+)°/g)].map(m => Number(m[1]));
  return num(q.answer) === a && opts.filter(o => o !== a).every(o => Math.abs(o - a) >= 40);
}));
const MP = gen(gm.generateStage3GeometricMeasureQuestions, ["grid-map-read", "grid-map-give"]);
t("grid references name the icon's square (letter across, number down)", MP.every(q => {
  const icons = q.diagram.config.icons; const ref = ic => String.fromCharCode(65 + ic.col) + (ic.row + 1);
  if (q.type === "grid-map-give") { const nm = q.prompt.match(/of the (.+?)\./)[1]; return ref(icons.find(i => i.label.toLowerCase() === nm)) === q.answer; }
  const r = q.prompt.match(/square (\w\d+)/)[1]; return q.answer === `The ${icons.find(i => ref(i) === r).label.toLowerCase()}`;
}));
t("no two map icons share a square", MP.every(q => new Set(q.diagram.config.icons.map(i => `${i.col},${i.row}`)).size === q.diagram.config.icons.length));

console.log("\nREPRESENTS NUMBERS");
const HG = gen(rn.generateRepresentsNumbersQuestions, ["hundred-grid", "benchmark-grid"]);
t("hundred-grid answers equal the shaded squares", HG.every(q => {
  const p = q.diagram.config.percent;
  if (q.type === "benchmark-grid") return q.answer.startsWith(`${p}% = `) && Math.abs(fv(q.answer) - p / 100) < 1e-9;
  const a = q.answer.includes("%") ? num(q.answer) / 100 : q.answer.includes("frac") ? fv(q.answer) : Number(q.answer);
  return Math.abs(a - p / 100) < 1e-9 && q.diagram.config.label === "";
}));
const TH = gen(rn.generateRepresentsNumbersQuestions, ["thermometer-negative"]);
t("thermometer answers from the drawn level (typographic minus)", TH.every(q => {
  const v = q.diagram.config.value; const val = s => (s.includes("−") ? -1 : 1) * num(s);
  if (/What temperature/.test(q.prompt)) return val(q.answer) === v && q.answer.includes("−");
  if (/risen/.test(q.prompt)) return val(q.answer) === v + Number(q.prompt.match(/risen (\d+)/)[1]);
  return num(q.answer.split("by ")[1]) === Math.abs(v - q.diagram.config.value2);
}) && TH.every(q => !/-\d/.test(q.prompt + q.answer)));

console.log("\nFRACTIONS");
const FB = gen(fr.generateStage3FractionsQuestions, ["compare-with-bars", "add-with-bars", "mixed-numerals-bars", "fraction-of-collection"]);
t("bar answers from the shaded parts", FB.every(q => {
  const c = q.diagram.config;
  if (q.type === "compare-with-bars") { const [a, b] = c.fracs; return Math.abs(fv(q.answer) - Math.max(a.n / a.d, b.n / b.d)) < 1e-9; }
  if (q.type === "add-with-bars") { const [a, b] = c.fracs; return Math.abs(fv(q.answer) - (a.n / a.d + b.n / b.d)) < 1e-9; }
  if (q.type === "mixed-numerals-bars") { const tot = c.fracs.reduce((s, f) => s + f.n / f.d, 0); const m = q.answer.match(/^(\d+) \[\[frac:(\d+):(\d+)\]\] = \[\[frac:(\d+):(\d+)\]\]$/); return m && Math.abs(Number(m[1]) + m[2] / m[3] - tot) < 1e-9 && Math.abs(m[4] / m[5] - tot) < 1e-9; }
  const [, n, d] = q.prompt.match(/\[\[frac:(\d+):(\d+)\]\] of/); return Number(q.answer) === n / d * c.total;
}), `${FB.length}`);
t("denominators stay within 2, 3, 4, 5, 6, 8, 10", FB.every(q => [...(q.prompt + q.answer).matchAll(/frac:\d+:(\d+)/g)].every(m => [2, 3, 4, 5, 6, 8, 10].includes(Number(m[1])))));

console.log("\nMULTIPLICATIVE");
const pairsOf = n => { const o = []; for (let a = 1; a * a <= n; a++) if (n % a === 0) o.push(`${a},${n / a}`); return o; };
const MQ = gen(mr.generateMultiplicativeRelationsQuestions, ["prime-composite-arrays", "missing-factor-pair", "square-numbers"]);
t("prime/composite: every factor pair drawn, verdict right", MQ.filter(q => q.type === "prime-composite-arrays").every(q => {
  const n = Number(q.prompt.match(/from (\d+) counters/)[1]);
  return q.diagram.config.pairs.map(p => p.join(",")).join(";") === pairsOf(n).join(";") && q.answer.startsWith(pairsOf(n).length === 1 ? "Prime" : "Composite");
}));
t("missing factor pair is the one pair not drawn", MQ.filter(q => q.type === "missing-factor-pair").every(q => {
  const n = Number(q.prompt.match(/from (\d+) counters/)[1]);
  const drawn = q.diagram.config.pairs.map(p => p.join(","));
  const miss = pairsOf(n).filter(p => !drawn.includes(p));
  return miss.length === 1 && miss[0].replace(",", " × ") === q.answer;
}));
t("square arrays", MQ.filter(q => q.type === "square-numbers" && q.diagram).every(q => q.answer === `${q.diagram.config.rows} × ${q.diagram.config.cols} = ${q.diagram.config.rows ** 2}` && q.diagram.config.rows === q.diagram.config.cols));

console.log("\nADDITIVE — BAR MODELS");
const BM = gen(ar.generateAdditiveRelationsQuestions, ["bar-model-total", "bar-model-part", "bar-model-compare", "bar-model-decimals"]);
t("bar model parts, totals and differences are consistent with the answer", BM.every(q => {
  const c = q.diagram.config;
  if (c.diagramType === "part-whole") {
    const unknown = c.parts.find(p => p.label === null);
    const sum = c.parts.reduce((s, p) => s + p.value, 0);
    if (c.total === null) return Math.abs(num(q.answer) - sum) < 1e-6;
    return Math.abs(num(c.total) - sum) < 1e-6 && Math.abs(num(q.answer) - unknown.value) < 1e-6;
  }
  const [a, b] = c.rows;
  if (c.difference === null) return num(q.answer) === a.value - b.value;
  return num(q.answer) === a.value && num(c.difference) === a.value - b.value;
}), `${BM.length}`);
t("bar widths are proportional (values carried, not labels only)", BM.every(q => (q.diagram.config.parts || q.diagram.config.rows).every(p => p.value > 0)));
t("money keeps two decimal places", BM.filter(q => /\$/.test(q.answer)).every(q => /\$[\d\s]+(\.\d{2})?$/.test(q.answer)));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
