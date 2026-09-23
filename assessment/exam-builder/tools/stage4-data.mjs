/* Stage 4 statistics: "Data Classification and Visualisation" (MA4-DAT-C-01)
   and "Data Analysis" (MA4-DAT-C-02).

   The statistics engine draws from the same raw values the answer uses, so
   this harness RECOUNTS the display config — bars, dots, leaves, bins,
   sectors — and recomputes every statistic with its own code, never the
   bank's helpers. Plain node, no dependencies. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const vis = await import(base + "question-banks/data-visualisation/index.js");
const ana = await import(base + "question-banks/data-analysis/index.js");
const { makeMultipleChoiceQuestion } = await import(base + "utils/multiple-choice.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };

const gen = (bank, getT, genF, n) => {
  const out = [];
  for (const ty of bank[getT]()) out.push(...bank[genF]({ count: n, allowedTypes: [ty.id] }));
  return out;
};
const V = gen(vis, "getDataVisualisationQuestionTypes", "generateDataVisualisationQuestions", 300);
const A = gen(ana, "getDataAnalysisQuestionTypes", "generateDataAnalysisQuestions", 300);
const byV = id => V.filter(q => q.type === id);
const byA = id => A.filter(q => q.type === id);

// independent statistics
const S = {
  mean: a => a.reduce((s, v) => s + v, 0) / a.length,
  median: a => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; },
  mode: a => { const m = {}; a.forEach(v => m[v] = (m[v] || 0) + 1); const top = Math.max(...Object.values(m)); return top === 1 ? [] : Object.keys(m).filter(k => m[k] === top).map(Number).sort((x, y) => x - y); },
  range: a => Math.max(...a) - Math.min(...a)
};
const fromLeaves = rows => rows.flatMap(r => r.leaves.map(l => r.stem * 10 + l));
const fromLeft = rows => rows.flatMap(r => (r.left || []).map(l => r.stem * 10 + l));
const fromCols = c => c.categories.flatMap((cat, i) => Array(c.values[i]).fill(Number(cat)));
const num = s => Number(String(s).replace(/ /g, "").replace("−", "-").match(/-?\d+(\.\d+)?/)[0]);
const meanOk = (ans, a) => Math.abs(num(ans) - S.mean(a)) <= 0.05 + 1e-9;
const listFromPrompt = p => {
  const m = p.match(/((?:−?\d+(?:\.\d+)?,\s*){2,}−?\d+(?:\.\d+)?)/);
  return m ? m[1].split(/,\s*/).map(x => Number(x.replace("−", "-"))) : null;
};

console.log("\nCOVERAGE");
t("Data Classification and Visualisation: 17 types, all generate", vis.getDataVisualisationQuestionTypes().length === 17 && vis.getDataVisualisationQuestionTypes().every(ty => byV(ty.id).length === 300));
t("Data Analysis: 16 types, all generate", ana.getDataAnalysisQuestionTypes().length === 16 && ana.getDataAnalysisQuestionTypes().every(ty => byA(ty.id).length === 300));
t("every diagram uses the statistics engine", [...V, ...A].filter(q => q.diagram).every(q => q.diagram.engine === "statistics-engine"));

console.log("\nREADING DISPLAYS — RECOUNTED FROM THE DRAWN DATA");
let bad = 0;
for (const q of byV("read-column-graph")) {
  const c = q.diagram.config; const tot = c.values.reduce((s, v) => s + v, 0);
  if (/most popular/.test(q.prompt) && q.answer !== c.categories[c.values.indexOf(Math.max(...c.values))]) bad++;
  if (/least popular/.test(q.prompt) && q.answer !== c.categories[c.values.indexOf(Math.min(...c.values))]) bad++;
  if (/altogether/.test(q.prompt) && num(q.answer) !== tot) bad++;
  const m = /How many more \S+ chose (.+) than (.+)\?/.exec(q.prompt);
  if (m && num(q.answer) !== c.values[c.categories.indexOf(m[1])] - c.values[c.categories.indexOf(m[2])]) bad++;
  const f = /What fraction of the \S+ chose (.+)\?/.exec(q.prompt);
  if (f) { const v = c.values[c.categories.indexOf(f[1])]; const fr = /frac:(\d+):(\d+)/.exec(q.answer); if (!fr || Math.abs(fr[1] / fr[2] - v / tot) > 1e-9) bad++; }
}
t("column/bar graphs: every answer recounted from the bars", bad === 0, `${byV("read-column-graph").length} checked`);
bad = 0;
for (const q of byV("read-dot-plot")) {
  const d = q.diagram.config.data;
  const k = Number((/(\d+) or more|fewer than (\d+)/.exec(q.prompt) || []).slice(1).find(Boolean));
  if (/are shown/.test(q.prompt) && num(q.answer) !== d.length) bad++;
  if (/most common/.test(q.prompt) && (S.mode(d).length !== 1 || num(q.answer) !== S.mode(d)[0])) bad++;
  if (/had \d+ or more\?$/.test(q.prompt) && num(q.answer) !== d.filter(v => v >= k).length) bad++;
  if (/fewer than/.test(q.prompt) && num(q.answer) !== d.filter(v => v < k).length) bad++;
  if (/percentage/.test(q.prompt) && num(q.answer) !== Math.round(d.filter(v => v >= k).length / d.length * 100)) bad++;
  if (process.env.DBG && bad) { console.log(q.prompt, q.answer, JSON.stringify(d)); process.env.DBG = ""; }
}
t("dot plots: counts recounted from the drawn dots", bad === 0);
bad = 0;
for (const q of byV("read-stem-leaf")) {
  const d = fromLeaves(q.diagram.config.rows);
  if (/smallest/.test(q.prompt) && num(q.answer) !== Math.min(...d)) bad++;
  if (/largest/.test(q.prompt) && num(q.answer) !== Math.max(...d)) bad++;
  if (/How many data values/.test(q.prompt) && num(q.answer) !== d.length) bad++;
  const g = /greater than (\d+)/.exec(q.prompt); if (g && num(q.answer) !== d.filter(v => v > Number(g[1])).length) bad++;
  const s = /in the (\d+)s\?/.exec(q.prompt); if (s && num(q.answer) !== d.filter(v => Math.floor(v / 10) * 10 === Number(s[1])).length) bad++;
  const leavesOrdered = q.diagram.config.rows.every(r => r.leaves.every((l, i) => i === 0 || l >= r.leaves[i - 1]));
  if (!leavesOrdered) bad++;
}
t("stem-and-leaf: answers from the drawn leaves; leaves ordered", bad === 0);
bad = 0;
for (const q of byV("read-histogram")) {
  const b = q.diagram.config.bins; const tot = b.reduce((s, x) => s + x.count, 0);
  if (/altogether/.test(q.prompt) && num(q.answer) !== tot) bad++;
  const ge = /of (\d+) \S+ or more/.exec(q.prompt); if (ge && num(q.answer) !== b.filter(x => x.lo >= Number(ge[1])).reduce((s, x) => s + x.count, 0)) bad++;
  const lt = /of less than (\d+)/.exec(q.prompt); if (lt && num(q.answer) !== b.filter(x => x.hi <= Number(lt[1])).reduce((s, x) => s + x.count, 0)) bad++;
  const cl = /class (\d+) to under (\d+)/.exec(q.prompt); if (cl && num(q.answer) !== b.find(x => x.lo === Number(cl[1])).count) bad++;
  if (/modal class/.test(q.prompt)) { const m = b.filter(x => x.count === Math.max(...b.map(y => y.count))); if (m.length !== 1 || num(q.answer) !== m[0].lo) bad++; }
  if (b.some((x, i) => i && x.lo !== b[i - 1].hi)) bad++;
}
t("histograms: frequencies recounted; classes contiguous; one modal class", bad === 0);
bad = 0;
for (const q of byV("read-sector-graph")) {
  const c = q.diagram.config; const tot = c.values.reduce((s, v) => s + v, 0);
  const n = Number(/survey of (\d+)/.exec(q.prompt)[1]); const cat = /chose (.+)\?/.exec(q.prompt)[1];
  if (Math.abs(num(q.answer) - c.values[c.categories.indexOf(cat)] / tot * n) > 1e-6) { bad++; if (process.env.DBG) console.log(q.prompt, q.answer, c.values); }
  if (c.values.some(v => Math.abs(v / tot * 360 - Math.round(v / tot * 360)) > 1e-6)) { bad++; if (process.env.DBG) console.log('deg', c.values); }
}
t("sector graphs: count = sector fraction × total surveyed; whole-degree sectors", bad === 0);
bad = 0;
for (const q of byV("sector-angles")) {
  const rows = q.table.rows.slice(1, -1); const tot = Number(q.table.rows.at(-1)[1]);
  if (rows.reduce((s, r) => s + Number(r[1]), 0) !== tot) bad++;
  const m = /for (.+)\?$/.exec(q.prompt);
  if (m) { const r = rows.find(x => x[0] === m[1]); if (Math.abs(num(q.answer) - Number(r[1]) / tot * 360) > 1e-6) bad++; }
  else if (rows.some(r => !q.answer.includes(`${r[0]} ${Math.round(Number(r[1]) / tot * 360 * 100) / 100}°`))) bad++;
}
t("sector angles: frequency ÷ total × 360°, table total correct", bad === 0);
bad = 0;
for (const q of byV("read-divided-bar")) {
  const c = q.diagram.config; const tot = c.values.reduce((s, v) => s + v, 0);
  const n = Number(/survey of (\d+)/.exec(q.prompt)[1]); const cat = /chose (.+)\?/.exec(q.prompt)[1];
  if (num(q.answer) !== c.values[c.categories.indexOf(cat)] / tot * n) bad++;
}
t("divided bar graphs: count = part of the bar × total", bad === 0);
bad = 0;
for (const q of byV("read-pictogram")) {
  const c = q.diagram.config;
  if (c.values.some(v => (v * 2) % c.perSymbol !== 0)) bad++;
  const m = /many (\S+) chose (.+)\?/.exec(q.prompt); if (m && /How many \S+ chose/.test(q.prompt) && num(q.answer) !== c.values[c.categories.indexOf(m[2])]) bad++;
  if (/altogether/.test(q.prompt) && num(q.answer) !== c.values.reduce((s, v) => s + v, 0)) bad++;
}
t("pictograms: whole and half symbols only; answers from the key", bad === 0);
bad = 0;
for (const q of byV("frequency-table")) {
  const data = listFromPrompt(q.prompt);
  const rows = q.table.rows.slice(1).filter(r => r[0] !== "Total");
  for (const r of rows) { if (r[2] !== "" && Number(r[2]) !== data.filter(v => v === Number(r[0])).length) bad++; }
  if (!rows.some(r => r[2] === "")) bad++;
  for (const r of rows) if (!q.answer.includes(`${r[0]}: ${data.filter(v => v === Number(r[0])).length}`)) bad++;
}
t("frequency tables: printed and answer frequencies tally the raw data; blanks left", bad === 0);
t("construct questions give a blank display and no answer box",
  byV("construct-graph").every(q => (q.diagram.config.blank === true) && resolveAnswerSpace(q).kind === "none"));
t("misleading graphs are the only displays with a truncated axis",
  [...V, ...A].filter(q => q.diagram?.config?.yMin > 0).every(q => q.type === "misleading-graphs"));

console.log("\nSTATISTICS — RECOMPUTED INDEPENDENTLY");
bad = 0; let checked = 0;
for (const q of [...byA("mean"), ...byA("median"), ...byA("mode"), ...byA("range")]) {
  const d = listFromPrompt(q.prompt); if (!d) { bad++; continue; } checked++;
  if (q.type === "mean" && !meanOk(q.answer, d)) bad++;
  if (q.type === "median" && num(q.answer) !== S.median(d)) bad++;
  if (q.type === "range" && num(q.answer) !== S.range(d)) bad++;
  if (q.type === "mode") { const m = S.mode(d); if (m.length ? q.answer !== m.join(" and ") : q.answer !== "No mode") bad++; }
}
t("mean, median, mode, range from the listed data", bad === 0, `${checked} checked`);
t("a mean that is rounded says so in the prompt", byA("mean").every(q => { const d = listFromPrompt(q.prompt); const m = S.mean(d); const exact = Math.abs(m * 100 - Math.round(m * 100)) < 1e-9; return exact || /1 decimal place/.test(q.prompt); }));
t("median questions never start already sorted", byA("median").every(q => { const d = listFromPrompt(q.prompt); return d.join() !== [...d].sort((a, b) => a - b).join(); }));
bad = 0;
for (const q of byA("frequency-table-stats")) {
  const d = q.table.rows.slice(1, -1).flatMap(r => Array(Number(r[1])).fill(Number(r[0])));
  if (Number(q.table.rows.at(-1)[1]) !== d.length) bad++;
  if (/mean/.test(q.prompt) && !meanOk(q.answer, d)) bad++;
  if (/median/.test(q.prompt) && num(q.answer) !== S.median(d)) bad++;
  if (/mode/.test(q.prompt) && num(q.answer) !== S.mode(d)[0]) bad++;
  if (/range/.test(q.prompt) && num(q.answer) !== S.range(d)) bad++;
}
t("frequency-table statistics expand the table and recompute", bad === 0);
bad = 0;
for (const q of byA("dot-plot-stats")) {
  const d = q.diagram.config.data; const w = /Find the (\w+)/.exec(q.prompt)[1];
  if (w === "mean" ? !meanOk(q.answer, d) : w === "median" ? num(q.answer) !== S.median(d) : w === "mode" ? num(q.answer) !== S.mode(d)[0] : num(q.answer) !== S.range(d)) bad++;
}
t("dot-plot statistics from the drawn dots", bad === 0);
bad = 0;
for (const q of byA("stem-leaf-stats")) {
  const d = fromLeaves(q.diagram.config.rows); const w = /Find the (\w+)/.exec(q.prompt)[1];
  if (w === "median" && num(q.answer) !== S.median(d)) bad++;
  if (w === "range" && num(q.answer) !== S.range(d)) bad++;
  if (w === "mode") { const m = S.mode(d); if (m.length ? num(q.answer) !== m[0] : q.answer !== "No mode") bad++; }
}
t("stem-and-leaf statistics from the drawn leaves", bad === 0);
bad = 0;
for (const q of byA("graph-stats")) {
  const d = fromCols(q.diagram.config);
  if (/How many/.test(q.prompt) && num(q.answer) !== d.length) bad++;
  if (/Find the mean/.test(q.prompt) && !meanOk(q.answer, d)) bad++;
  if (/Find the mode/.test(q.prompt) && num(q.answer) !== S.mode(d)[0]) bad++;
  if (/Find the median/.test(q.prompt) && num(q.answer) !== S.median(d)) bad++;
}
t("column-graph statistics from the drawn columns", bad === 0);
bad = 0;
for (const q of byA("missing-value")) {
  const [, n, m] = /mean of (\d+) .+ is (\d+)\./.exec(q.prompt).map(Number);
  const known = /are ([\d, ]+)\. Find/.exec(q.prompt)[1].split(", ").map(Number);
  if (S.mean([...known, num(q.answer)]) !== m || known.length !== n - 1) bad++;
}
t("missing value restores the stated mean", bad === 0);
bad = 0;
for (const q of byA("outliers")) {
  const d = /data ([\d, ]+)\. \(a\)/.exec(q.prompt)[1].split(", ").map(Number);
  const o = num(q.answer); const rest = [...d]; rest.splice(rest.indexOf(o), 1);
  const [, w, wo] = /with ([\d.]+), without ([\d.]+)/.exec(q.answer).map(Number);
  const gap = Math.min(...rest.map(v => Math.abs(v - o)));
  if (Math.abs(w - S.mean(d)) > 0.0501 || Math.abs(wo - S.mean(rest)) > 0.0501 || gap < 7) bad++;
  if (Math.abs(S.mean(d) - S.mean(rest)) <= Math.abs(S.median(d) - S.median(rest))) bad++;
  if (process.env.DBG && bad) { console.log(q.prompt, "|", q.answer); process.env.DBG = ""; }
}
t("outliers: clearly separated, means correct, mean moves more than median", bad === 0);
bad = 0;
for (const q of byA("compare-datasets")) {
  const rows = q.diagram.config.rows; const R = fromLeaves(rows); const L = fromLeft(rows);
  const g = q.diagram.config.headings;
  if (!q.answer.includes(`${g[0]}: median ${Number(S.median(L).toFixed(1))}, range ${S.range(L)}`)) bad++;
  if (!q.answer.includes(`${g[1]}: median ${Number(S.median(R).toFixed(1))}, range ${S.range(R)}`)) bad++;
}
t("back-to-back plot: both sides read correctly (left side read outward)", bad === 0);
bad = 0;
for (const q of byA("shape")) {
  const c = q.diagram.config;
  const f = c.chartType === "histogram" ? c.bins.map(b => b.count) : (() => { const out = []; for (let v = c.min; v <= c.max; v++) out.push(c.data.filter(x => x === v).length); return out; })();
  const n = f.length; const peak = f.indexOf(Math.max(...f));
  const sym = f.every((v, i) => v === f[n - 1 - i]);
  const peaks = f.filter((v, i) => v > (f[i - 1] ?? -1) && v > (f[i + 1] ?? -1)).length;
  const expected = peaks >= 2 ? "Bimodal" : sym ? "Symmetric" : peak < (n - 1) / 2 ? "Positively skewed" : "Negatively skewed";
  if (q.answer !== expected) bad++;
}
t("shape of distribution re-classified from the drawn frequencies", bad === 0);

console.log("\nLAYOUT AND MULTIPLE CHOICE");
let ok = 0, tried = 0;
for (const q of [...V, ...A].filter(q => q.marks === 1 && q.mcEligible !== false)) { tried++; const m = makeMultipleChoiceQuestion(q); if (m && m.choices.length === 4 && m.choices.includes(m.correctAnswer)) ok++; }
t("one-mark questions convert to 4-option multiple choice", ok === tried, `${ok}/${tried}`);
t("no NaN / undefined / Infinity anywhere", [...V, ...A].every(q => !/NaN|undefined|Infinity/.test(JSON.stringify([q.prompt, q.answer, q.working, q.subparts, q.table, q.choices]))));
t("explain/compare questions get ruled lines", [...byV("misleading-graphs"), ...byA("compare-datasets"), ...byA("outliers")].every(q => resolveAnswerSpace(q).kind === "lines"));

console.log(fail ? `\n✗ ${fail} check(s) failed` : "\n✓ all data checks passed");
process.exit(fail ? 1 : 0);
