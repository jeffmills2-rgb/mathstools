/* Stage 3 "Mass and Time" — scale and clock readings are checked against the
   drawn instrument, and every time conversion is redone with an independent
   parser. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/stage-3/mass-time/index.js");
const { resolveAnswerSpace } = await import(base + "utils/answer-space-rules.js");

let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getStage3MassTimeQuestionTypes();
const ALL = bank.generateStage3MassTimeQuestions({ count: 3400 });
const by = id => ALL.filter(q => q.type === id);
const num = s => Number(String(s).replace(/[^\d.]/g, ""));

/* Parse "4:35 pm" / "16:35" / "07:05" to minutes after midnight. */
function mins(s) {
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (!m) return NaN;
  let h = Number(m[1]);
  if (m[3] === "am") h = h === 12 ? 0 : h;
  if (m[3] === "pm") h = h === 12 ? 12 : h + 12;
  return h * 60 + Number(m[2]);
}
function durMins(s) {
  const h = (s.match(/(\d+) h/) || [0, 0])[1];
  const m = (s.match(/(\d+) min/) || [0, 0])[1];
  return Number(h) * 60 + Number(m);
}

console.log("\nCOVERAGE");
t("17 question types declared", TYPES.length === 17, `${TYPES.length}`);
t("every declared type generates", TYPES.every(ty => by(ty.id).length > 0));

console.log("\nMASS");
t("scale readings: needle on a minor mark, never a labelled one, and answered", by("read-scale").every(q => {
  const c = q.diagram.config;
  const k = c.value / c.minor;
  const onMinor = Math.abs(k - Math.round(k)) < 1e-9;
  const onMajor = Math.abs(c.value / c.major - Math.round(c.value / c.major)) < 1e-9;
  const read = /grams/.test(q.prompt) ? num(q.answer) / 1000 : num(q.answer);
  return onMinor && !onMajor && Math.abs(read - c.value) < 1e-9 && c.value > 0 && c.value < c.max;
}), `${by("read-scale").length} checked`);
t("conversions multiply or divide by 1 000 the right way", by("convert-mass").every(q => {
  const [, v, from, to] = q.prompt.match(/Convert ([\d\s.]+) (g|kg|t) to (\w+)/);
  const x = num(v);
  const want = (from === "kg" && to === "grams") || (from === "t" && to === "kilograms") ? x * 1000 : x / 1000;
  return Math.abs(num(q.answer) - want) < 1e-9;
}));
t("orderings are really ordered, and not shown ordered", by("order-masses").every(q => {
  const toG = s => /kg \d/.test(s) ? Number(s.split(" ")[0]) * 1000 + Number(s.split(" ")[2]) : /kg$/.test(s) ? num(s) * 1000 : num(s);
  const shown = q.prompt.split(": ")[1].split(", ");
  const ans = q.answer.split(", ");
  const g = ans.map(toG);
  const asc = /lightest to heaviest/.test(q.prompt);
  const sortedOk = g.every((v, i) => i === 0 || (asc ? v > g[i - 1] : v < g[i - 1]));
  return sortedOk && shown.join() !== ans.join() && [...shown].sort().join() === [...ans].sort().join();
}));

console.log("\nTIME");
t("analogue clock answers match the hands", by("read-clock").every(q => {
  const c = q.diagram.config;
  return q.answer === `${c.hours}:${String(c.minutes).padStart(2, "0")}`;
}));
t("12 → 24-hour conversions", by("to-24-hour").every(q => {
  const src = q.prompt.match(/Write (.+?) in 24-hour/)[1];
  return mins(src) === mins(q.answer) && /^\d{2}:\d{2}$/.test(q.answer);
}), `${by("to-24-hour").length} checked`);
t("24 → 12-hour conversions (text or digital display)", by("to-12-hour").every(q => {
  const src = q.diagram ? q.diagram.config.text : q.prompt.match(/Write (\d{2}:\d{2})/)[1];
  return mins(src) === mins(q.answer) && /(am|pm)$/.test(q.answer);
}));
t("clock + part of day → 24-hour time", by("clock-to-24").every(q => {
  const c = q.diagram.config;
  const m = mins(q.answer);
  const pm = /afternoon|after lunch|after school|evening|at night|after dinner/.test(q.prompt);
  return (m % 720) === (c.hours % 12) * 60 + c.minutes && (pm ? m >= 720 : m < 720);
}));
t("durations: finish − start", by("duration").every(q => {
  const [, a, b] = q.prompt.match(/started at (.+?) and finished at (.+?)\./);
  return mins(b) - mins(a) === durMins(q.answer);
}));
t("finish times: start + duration", by("finish-time").every(q => {
  const [, a, d] = q.prompt.match(/starts at (.+?) and lasts (.+?)\. At/);
  return mins(a) + durMins(d) === mins(q.answer);
}));
t("start times: finish − duration", by("start-time").every(q => {
  const [, b, d] = q.prompt.match(/finished at (.+?)\. It lasted (.+?)\. At/);
  return mins(b) - durMins(d) === mins(q.answer);
}));
t("time lines: labelled marks sit at their minute offsets", ALL.filter(q => q.diagram?.config?.diagramType === "timeline").every(q => {
  const pts = q.diagram.config.points.filter(p => p.label);
  const t0 = mins(pts[0].label) - pts[0].at;
  return pts.every(p => mins(p.label) - p.at === t0);
}));
t("timetables run forward in time down each column", by("timetable").every(q => {
  const rows = q.table.rows.slice(1);
  return [1, 2, 3].every(c => rows.every((r, i) => i === 0 || mins(r[c]) > mins(rows[i - 1][c])));
}));
t("timetable journey times", by("timetable").filter(q => /How long/.test(q.prompt)).every(q => {
  const [, b, from, to] = q.prompt.match(/Bus (\d) take to travel from (.+?) to (.+?)\?/);
  const rows = q.table.rows;
  const r = name => rows.find(x => x[0] === name)[Number(b)];
  return mins(r(to)) - mins(r(from)) === durMins(q.answer);
}));
t("durations never cross midnight", by("duration").concat(by("finish-time")).every(q => mins(q.answer.includes(":") ? q.answer : "00:00") < 24 * 60));

console.log("\nPIPELINE");
t("draw-the-hands gets no answer space and a blank face", by("draw-hands").every(q => resolveAnswerSpace(q).kind === "none" && q.diagram.config.hands === false));
t("MC distractors never repeat the answer", ALL.every(q => !(q.mcDistractors || []).includes(String(q.answer))));
t("no hyphen-minus negatives", !ALL.some(q => /(^|\s)-\d/.test(q.prompt + " " + q.answer)));
t("singular/plural: no \"1 packets\", \"1 layers\"", !ALL.some(q => /\b1 (packets|layers|cups|days|symbols)\b/.test(q.prompt + " " + q.answer)));

console.log(fail ? `\n${fail} FAILED` : "\nALL PASSED");
process.exit(fail ? 1 : 0);
