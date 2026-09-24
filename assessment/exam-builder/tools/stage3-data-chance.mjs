/* Stage 3 "Data" and "Chance" — answers are recounted from the drawn display
   (columns, dots, pictogram symbols, table cells, spinner sectors, counters). */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const data = await import(base + "question-banks/stage-3/data/index.js");
const chance = await import(base + "question-banks/stage-3/chance/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const D = data.generateStage3DataQuestions({ count: 3200 });
const C = chance.generateStage3ChanceQuestions({ count: 2400 });
const dBy = id => D.filter(q => q.type === id);
const cBy = id => C.filter(q => q.type === id);
const num = s => Number(String(s).replace(/[^\d.]/g, ""));
const fracVal = s => { const m = String(s).match(/\[\[frac:(\d+):(\d+)\]\]/); return m ? Number(m[1]) / Number(m[2]) : Number(s); };

console.log("\nDATA — COVERAGE");
t("16 data types declared", data.getStage3DataQuestionTypes().length === 16);
t("every data type generates", data.getStage3DataQuestionTypes().every(ty => dBy(ty.id).length));

console.log("\nDATA — ANSWERS FROM THE DISPLAY");
t("many-to-one column graphs", dBy("many-to-one-scale").every(q => {
  const c = q.diagram.config; const v = c.values; const cats = c.categories.map(s => s.toLowerCase());
  const m1 = q.prompt.match(/chose (.+?)\?/);
  if (/altogether/.test(q.prompt)) return num(q.answer) === v.reduce((s, x) => s + x, 0);
  const m2 = q.prompt.match(/chose (.+?) than (.+?)\?/);
  if (m2) return num(q.answer) === v[cats.indexOf(m2[1])] - v[cats.indexOf(m2[2])];
  return num(q.answer) === v[cats.indexOf(m1[1])];
}), `${dBy("many-to-one-scale").length}`);
t("many-to-one scales really are many-to-one (step ≥ 2)", dBy("many-to-one-scale").every(q => q.diagram.config.yStep >= 2));
t("values fall on gridlines or exactly halfway", dBy("many-to-one-scale").concat(dBy("construct-column")).every(q => {
  const c = q.diagram.config; return c.values.every(v => Number.isInteger((v * 2) / c.yStep));
}));
t("pictogram readings", dBy("pictogram-key").filter(q => /How many .* are shown/.test(q.prompt)).every(q => {
  const c = q.diagram.config; const i = c.categories.map(s => s.toLowerCase()).indexOf(q.prompt.match(/for (.+?)\?/)[1]);
  return num(q.answer) === c.values[i];
}));
t("dot plot counts", dBy("dot-plot-read").every(q => {
  const d = q.diagram.config.data;
  if (/most common/.test(q.prompt)) { const f = {}; d.forEach(x => { f[x] = (f[x] || 0) + 1; }); const top = Math.max(...Object.values(f)); const m = Object.keys(f).filter(k => f[k] === top); return m.length === 1 && q.answer === m[0]; }
  if (/altogether/.test(q.prompt)) return num(q.answer) === d.length;
  const eq = q.prompt.match(/value of (\d+)\?/); if (eq) return num(q.answer) === d.filter(x => x === Number(eq[1])).length;
  const gt = q.prompt.match(/greater than (\d+)\?/); return num(q.answer) === d.filter(x => x > Number(gt[1])).length;
}));
t("side-by-side graphs", dBy("side-by-side").every(q => {
  const c = q.diagram.config; const [A, B] = c.series;
  if (/altogether/.test(q.prompt)) return [A, B].some(s => q.prompt.toLowerCase().includes(s.name.toLowerCase()) && num(q.answer) === s.values.reduce((x, y) => x + y, 0));
  const cats = c.categories.map(s => s.toLowerCase());
  const m = q.prompt.match(/How many more .+ chose (.+?)\?/); if (m) { const i = cats.indexOf(m[1]); return num(q.answer) === Math.abs(A.values[i] - B.values[i]); }
  const r = q.prompt.match(/chose (.+?)\?/); if (r && /How many/.test(q.prompt)) return num(q.answer) === B.values[cats.indexOf(r[1])];
  return q.answer === (c.categories.filter((_, i) => A.values[i] > B.values[i]).join(", ") || "None");
}));
t("line graph readings and changes", dBy("line-graph-read").every(q => {
  const c = q.diagram.config;
  const at = q.prompt.match(/reading at (.+?)\?/); if (at) return num(q.answer) === c.values[c.categories.indexOf(at[1])];
  if (/highest/.test(q.prompt)) { const mx = Math.max(...c.values); return q.answer === c.categories.filter((_, i) => c.values[i] === mx).join(" and "); }
  const [, a, b] = q.prompt.match(/from (.+?) to (.+?)\?/);
  return num(q.answer) === Math.abs(c.values[c.categories.indexOf(b)] - c.values[c.categories.indexOf(a)]);
}));
t("two-way tables add up, and answers come from them", dBy("two-way-table").every(q => {
  const rows = q.table.rows;
  if (/Complete the totals/.test(q.prompt)) return true;
  const body = rows.slice(1, -1);
  const ok = body.every(r => r.includes("?") || num(r[r.length - 1]) === r.slice(1, -1).reduce((s, x) => s + num(x), 0));
  if (/missing/.test(q.prompt)) { const r = body.find(x => x.includes("?")); return ok && num(r[r.length - 1]) === r.slice(1, -1).reduce((s, x) => s + (x === "?" ? num(q.answer) : num(x)), 0); }
  return ok;
}));
t("time line gaps", dBy("timeline-read").filter(q => /years passed/.test(q.prompt)).every(q => {
  const pts = q.diagram.config.points; const [, a, b] = q.prompt.match(/"(.+?)" and "(.+?)"/);
  return num(q.answer) === pts.find(p => p.note === b).at - pts.find(p => p.note === a).at;
}));
t("misleading axis graphs really start above zero", dBy("misleading-graph").filter(q => q.diagram).every(q => q.diagram.config.yMin > 0));
t("no Stage 4 statistics (mean, median, range, stem-and-leaf, histogram)", !D.some(q => /\b(mean|median|range|stem|histogram|sector graph)\b/i.test(q.prompt + q.answer)));
t("construct questions: blank axes, no answer space", dBy("construct-column").concat(dBy("construct-dot-plot")).every(q => q.diagram.config.blank && resolveAnswerSpace(q).kind === "none"));

console.log("\nCHANCE — COVERAGE");
t("12 chance types declared", chance.getStage3ChanceQuestionTypes().length === 12);
t("every chance type generates", chance.getStage3ChanceQuestionTypes().every(ty => cBy(ty.id).length));

console.log("\nCHANCE — PROBABILITIES RECOUNTED");
t("spinner / bag / die / card probabilities", cBy("probability-fraction").every(q => {
  const p = fracVal(q.answer);
  if (q.diagram?.config.diagramType === "spinner") { const T = q.prompt.match(/spinning (\w+)\?/)[1]; const L = q.diagram.config.labels; return Math.abs(p - L.filter(l => l === T).length / L.length) < 1e-9; }
  if (q.diagram?.config.diagramType === "bag") { const T = q.prompt.match(/it is (\w+)\?/)[1]; const c = q.diagram.config.counts; return Math.abs(p - c[T] / Object.values(c).reduce((s, x) => s + x, 0)) < 1e-9; }
  return p > 0 && p < 1;
}), `${cBy("probability-fraction").length}`);
t("expected results = probability × trials", cBy("expected-results").every(q => {
  const n = Number(q.prompt.match(/(\d+) times/)[1]);
  if (/coin/.test(q.prompt)) return num(q.answer) === n / 2;
  if (/die/.test(q.prompt)) return num(q.answer) === n / 6;
  const T = q.prompt.match(/land on (\w+)\?/)[1]; const L = q.diagram.config.labels;
  return num(q.answer) === L.filter(l => l === T).length / L.length * n;
}));
t("fraction ↔ decimal ↔ percentage agree", cBy("fraction-decimal-percent").every(q => {
  const src = q.prompt.match(/event is (.+?)\. Write/)[1];
  const v = src.includes("%") ? num(src) / 100 : fracVal(src);
  const a = q.answer.includes("%") ? num(q.answer) / 100 : fracVal(q.answer);
  return Math.abs(v - a) < 1e-9;
}));
t("scale letters point at the event's probability", cBy("probability-scale").every(q => {
  const m = q.diagram.config.markers.find(x => x.label === q.answer);
  return m && q.diagram.config.markers.filter(x => Math.abs(x.value - m.value) < 0.12).length === 1;
}));
t("fair/unfair spinners judged by sector sizes", cBy("equally-likely").every(q => (new Set(q.diagram.config.weights).size === 1) === q.answer.startsWith("Yes")));
t("design-a-bag answers give the asked probability", cBy("design-generator").filter(q => /counters in a bag/.test(q.prompt)).every(q => {
  const total = Number(q.prompt.match(/put (\d+) counters/)[1]);
  return Math.abs(num(q.answer) / total - fracVal(q.prompt.match(/is (\[\[frac:\d+:\d+\]\])/)[1])) < 1e-9;
}));
t("single-step only; no Stage 4 language", !C.some(q => /relative frequency|complement|P\(not/i.test(q.prompt + q.answer)));
t("MC distractors never repeat the answer (data + chance)", D.concat(C).every(q => !(q.mcDistractors || []).includes(String(q.answer))));
t("explanations get ruled lines", D.concat(C).filter(q => /Explain/.test(q.prompt) && !q.subparts).every(q => resolveAnswerSpace(q).kind === "lines"));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
