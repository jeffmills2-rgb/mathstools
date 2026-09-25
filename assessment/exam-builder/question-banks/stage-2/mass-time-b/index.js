/*
  Mills Maths Tools — Stage 2 Question Bank: Mass and Time B
  -----------------------------------------------------------
  question-banks/stage-2/mass-time-b/index.js

  NSW Mathematics K–10 (2022), Stage 2:
    MA2-NSM-01  1 kg = 1000 g; reading scales; comparing and ordering masses
    MA2-NSM-02  time to the minute; am and pm; seconds; durations on a time line

  Big ideas:
    - 1 kg = 1000 g, just as 1 L = 1000 mL and 1 km = 1000 m;
    - to read a scale, first work out what each small mark is worth;
    - an hour is 60 minutes, not 100 — so time "bridges" to the next hour;
    - a time line turns a duration into jumps we can add.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, measure, sp, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Mass and Time B";
const qM = makeStage2(TOPIC, "MA2-NSM-01");
const qT = makeStage2(TOPIC, "MA2-NSM-02");

const TYPE_LIST = [
  { id: "kg-g-convert", label: "Kilograms and grams" },
  { id: "read-scale-b", label: "Read a scale (work out the marks)" },
  { id: "order-masses", label: "Order masses" },
  { id: "mass-problem", label: "Mass problems" },
  { id: "balance-share", label: "Equal objects on a balance" },
  { id: "read-clock-minute", label: "Read a clock to the minute" },
  { id: "am-pm", label: "am and pm" },
  { id: "seconds", label: "Seconds, minutes and hours" },
  { id: "duration-timeline", label: "How long? (time line)" },
  { id: "finish-time", label: "What time does it finish?" },
  { id: "timetable", label: "Read a timetable" }
];

/* ── mass ─────────────────────────────────────────────── */
function kgGConvertQuestion() {
  const v = choice(["kg-g", "g-kg", "half", "mixed"]);
  if (v === "kg-g") { const k = randInt(2, 9); return qM({ type: "kg-g-convert", marks: 1, prompt: `${k} kg = ☐ g`, answer: `${sp(k * 1000)} g`, working: ["1 kg = 1000 g"], space: SPACE_SIZES.SMALL, mcDistractors: [`${k * 100} g`, `${k * 10} g`, `${sp(k * 10000)} g`], tags: ["convert"] }); }
  if (v === "g-kg") { const k = randInt(2, 9); return qM({ type: "kg-g-convert", marks: 1, prompt: `${sp(k * 1000)} g = ☐ kg`, answer: `${k} kg`, working: ["1000 g = 1 kg"], space: SPACE_SIZES.SMALL, mcDistractors: [`${k * 10} kg`, `${k * 100} kg`, `${sp(k * 1000)} kg`], tags: ["convert"] }); }
  if (v === "half") { const f = choice([["half a kilogram", 500], ["a quarter of a kilogram", 250], ["one and a half kilograms", 1500]]); return qM({ type: "kg-g-convert", marks: 1, prompt: `How many grams is ${f[0]}?`, answer: `${sp(f[1])} g`, working: ["1 kg = 1000 g"], space: SPACE_SIZES.SMALL, mcDistractors: ["50 g", "150 g", "500 g", "250 g", "1 500 g"].filter(x => x !== `${sp(f[1])} g`).slice(0, 3), tags: ["convert"] }); }
  const k = randInt(1, 4); const g = randInt(1, 9) * 100;
  return qM({ type: "kg-g-convert", marks: 1, prompt: `${k} kg ${g} g = ☐ g`, answer: `${sp(k * 1000 + g)} g`, working: [`${k} kg = ${sp(k * 1000)} g; ${sp(k * 1000)} + ${g} = ${sp(k * 1000 + g)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${k + g} g`, `${sp(k * 100 + g)} g`, `${sp(k * 1000 + g * 10)} g`], tags: ["convert"] });
}

const SCALES = [
  { max: 1000, major: 200, minor: 100, unit: "g" }, { max: 1000, major: 250, minor: 50, unit: "g" },
  { max: 5, major: 1, minor: 0.5, unit: "kg" }, { max: 500, major: 100, minor: 50, unit: "g" }, { max: 10, major: 2, minor: 1, unit: "kg" }
];

function readScaleBQuestion() {
  const s = choice(SCALES); const steps = Math.round(s.max / s.minor);
  let k = randInt(1, steps - 1); if ((k * s.minor) % s.major === 0 && k + 1 < steps) k += 1;
  const value = k * s.minor;
  const show = v => (s.unit === "kg" && v % 1 ? `${v} kg (${sp(v * 1000)} g)` : `${sp(v)} ${s.unit}`);
  return qM({ type: "read-scale-b", marks: 1, prompt: "What mass does the scale show? First work out what each small mark is worth.", diagram: measure({ diagramType: "scale", ...s, value, labelSize: s.max / s.major <= 6 ? 24 : 18 }), answer: show(value), working: [`Labelled marks go up by ${s.major}. There are ${s.major / s.minor} spaces between them, so each small mark is ${s.minor} ${s.unit}.`], space: SPACE_SIZES.SMALL, mcDistractors: [show(value + s.minor), show(value > s.minor ? value - s.minor : value + 2 * s.minor), `${value} ${s.unit === "kg" ? "g" : "kg"}`], tags: ["reading scales"] });
}

function orderMassesQuestion() {
  const base = shuffle([["the dog", randInt(8, 30) * 1000], ["the cat", randInt(3, 6) * 1000 + 500], ["the rabbit", randInt(15, 25) * 100], ["the bird", randInt(2, 9) * 10]]).slice(0, 3);
  const show = g => (g >= 1000 ? (g % 1000 ? `${Math.floor(g / 1000)} kg ${g % 1000} g` : `${g / 1000} kg`) : `${g} g`);
  const sorted = base.slice().sort((a, b) => a[1] - b[1]).map(x => x[0]);
  return qM({ type: "order-masses", marks: 1, prompt: `Order from lightest to heaviest: ${base.map(([n, g]) => `${n} ${show(g)}`).join(",  ")}`, answer: sorted.join(", "), working: ["Change them all to grams: " + base.map(([n, g]) => `${n} ${sp(g)} g`).join(", ")], space: SPACE_SIZES.SMALL, mcDistractors: [sorted.slice().reverse().join(", ")], tags: ["order"] });
}

function massProblemQuestion() {
  const v = choice(["total", "diff", "kg"]);
  if (v === "total") { const a = randInt(2, 8) * 50; const b = randInt(2, 8) * 50; return qM({ type: "mass-problem", marks: 1, prompt: `A bag of apples is ${a} g. A bag of grapes is ${b} g. What is the total mass?`, answer: `${a + b} g`, working: [`${a} + ${b} = ${a + b} g`], space: SPACE_SIZES.SMALL, mcDistractors: [`${Math.abs(a - b)} g`, `${a + b + 100} g`, `${a + b} kg`], tags: ["word problem"] }); }
  if (v === "diff") { const a = randInt(20, 40); const b = randInt(5, a - 5); return qM({ type: "mass-problem", marks: 1, prompt: `Sam's dog has a mass of ${a} kg. His cat has a mass of ${b} kg. How much heavier is the dog?`, answer: `${a - b} kg`, working: [`${a} − ${b} = ${a - b} kg`], space: SPACE_SIZES.SMALL, mcDistractors: [`${a + b} kg`, `${a - b + 10} kg`, `${a - b} g`], tags: ["word problem"] }); }
  const g = randInt(2, 8) * 100;
  return qM({ type: "mass-problem", marks: 2, prompt: `A recipe needs 1 kg of flour. Ana has ${g} g. How much more flour does she need?`, answer: `${1000 - g} g`, working: ["1 kg = 1000 g", `1000 − ${g} = ${1000 - g} g`], space: SPACE_SIZES.SMALL, mcDistractors: [`${g} g`, `${1000 + g} g`, `${Math.abs(100 - g)} g`], tags: ["word problem"] });
}

function balanceShareQuestion() {
  const n = choice([2, 4, 5]); const each = choice([100, 200, 250, 500].filter(x => (x * n) % 1000 === 0 || x * n < 1000));
  const total = n * each;
  const right = total % 1000 === 0 ? `${total / 1000} kg` : `${total} g`;
  return qM({ type: "balance-share", marks: 2, prompt: `${n} equal boxes balance ${right}. What is the mass of one box in grams?`, diagram: mani({ diagramType: "balance", left: `${n} boxes`, right, tilt: "level" }), answer: `${each} g`, working: [`${right} = ${total} g`, `${total} ÷ ${n} = ${each} g`], space: SPACE_SIZES.SMALL, mcDistractors: [`${sp(total)} g`, `${each * 2} g`, `${Math.round(total / 10)} g`].filter(x => x !== `${each} g`), tags: ["balance", "division"] });
}

/* ── time ─────────────────────────────────────────────── */
const pad = m => String(m).padStart(2, "0");
const fmt12 = t => { const h = Math.floor(t / 60); const m = t % 60; const hh = h % 12 || 12; return `${hh}:${pad(m)} ${h < 12 ? "am" : "pm"}`; };
const durText = d => (d >= 60 ? `${Math.floor(d / 60)} h${d % 60 ? ` ${d % 60} min` : ""}` : `${d} min`);

function readClockMinuteQuestion() {
  const h = randInt(1, 12); const m = randInt(1, 58);
  if (m % 5 === 0) return readClockMinuteQuestion();
  return qT({ type: "read-clock-minute", marks: 1, prompt: "What time does the clock show? (Count the small marks.)", diagram: measure({ diagramType: "clock", hours: h, minutes: m }), answer: `${h}:${pad(m)}`, working: [`Count by fives to ${Math.floor(m / 5) * 5}, then count on ${m % 5}: ${m} minutes.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${h}:${pad(m + 1)}`, `${h}:${pad(m - 1)}`, `${h % 12 + 1}:${pad(m)}`], tags: ["analog", "to the minute"] });
}

function amPmQuestion() {
  const E = [["eating breakfast", "am"], ["watching the sunset", "pm"], ["eating dinner", "pm"], ["the start of school", "am"], ["going to bed", "pm"], ["waking up", "am"], ["lunch time at 12:30", "pm"], ["a morning swim", "am"]];
  if (Math.random() < 0.5) { const [e, a] = choice(E); return qT({ type: "am-pm", marks: 1, prompt: `Would ${e} usually happen in the am or the pm?`, answer: a, working: ["am: from midnight to midday. pm: from midday to midnight."], space: SPACE_SIZES.SMALL, mcDistractors: [a === "am" ? "pm" : "am"], tags: ["am pm"] }); }
  const t = randInt(1, 22) * 60 + randInt(0, 11) * 5;
  return qT({ type: "am-pm", marks: 1, prompt: `A clock says ${fmt12(t).replace(/ (am|pm)/, "")}. It is ${t < 12 * 60 ? "morning" : t < 18 * 60 ? "afternoon" : "evening"}. Write the time with am or pm.`, answer: fmt12(t), working: ["Before midday is am; after midday is pm."], space: SPACE_SIZES.SMALL, mcDistractors: [fmt12(t).endsWith("am") ? fmt12(t).replace("am", "pm") : fmt12(t).replace("pm", "am")], tags: ["am pm"] });
}

function secondsQuestion() {
  const v = choice(["facts", "convert", "which"]);
  if (v === "facts") { const [p, a] = choice([["How many seconds in 1 minute?", "60"], ["How many minutes in 2 hours?", "120"], ["How many seconds in half a minute?", "30"], ["How many minutes in 1 and a half hours?", "90"]]); return qT({ type: "seconds", marks: 1, prompt: p, answer: a, working: ["60 seconds = 1 minute; 60 minutes = 1 hour"], space: SPACE_SIZES.SMALL, mcDistractors: ["100", "60", "30", "120", "90", "50"].filter(x => x !== a).slice(0, 3), tags: ["units of time"] }); }
  if (v === "convert") { const m = randInt(2, 5); return qT({ type: "seconds", marks: 1, prompt: `${m} minutes = ☐ seconds`, answer: `${m * 60} seconds`, working: [`${m} × 60 = ${m * 60}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${m * 100} seconds`, `${m * 10} seconds`, `${m + 60} seconds`], tags: ["units of time"] }); }
  const [e, a, d] = choice([["to clap your hands 5 times", "about 5 seconds", ["about 5 minutes", "about 5 hours"]], ["to watch a movie", "about 2 hours", ["about 2 seconds", "about 2 minutes"]], ["to brush your teeth", "about 2 minutes", ["about 2 seconds", "about 2 hours"]], ["to run 100 metres", "about 20 seconds", ["about 20 minutes", "about 20 hours"]]]);
  return qT({ type: "seconds", marks: 1, prompt: `About how long does it take ${e}?`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcDistractors: d, tags: ["estimate time"] });
}

function pickInterval() {
  const start = randInt(7 * 12, 16 * 12) * 5; const d = randInt(5, 30) * 5;
  return { start, end: start + d, d };
}

function durationTimelineQuestion() {
  const { start, end, d } = pickInterval();
  const next = Math.ceil(start / 60) * 60;
  const pts = [{ at: 0, label: fmt12(start) }]; const jumps = [];
  if (next > start && next < end) { pts.push({ at: next - start, label: fmt12(next) }); jumps.push({ from: 0, to: next - start, label: null }, { from: next - start, to: d, label: null }); }
  else jumps.push({ from: 0, to: d, label: null });
  pts.push({ at: d, label: fmt12(end) });
  const ev = choice(["A movie", "A soccer game", "A bus trip", "A swimming lesson", "A party"]);
  return qT({ type: "duration-timeline", marks: 2, prompt: `${ev} starts at ${fmt12(start)} and ends at ${fmt12(end)}. Use the time line. How long is it?`, diagram: measure({ diagramType: "timeline", points: pts, jumps }), answer: durText(d), working: jumps.length === 2 ? [`${fmt12(start)} → ${fmt12(next)}: ${next - start} min`, `${fmt12(next)} → ${fmt12(end)}: ${end - next} min`, `Total: ${durText(d)}`] : [`${fmt12(start)} → ${fmt12(end)}: ${d} min`], space: SPACE_SIZES.SMALL, mcDistractors: [durText(d + 10), durText(Math.abs(d - 10) || 5), `${Math.floor(end / 60) * 100 + (end % 60) - (Math.floor(start / 60) * 100 + (start % 60))} min`].filter(x => x !== durText(d)), tags: ["duration", "time line"] });
}

function finishTimeQuestion() {
  const { start, end, d } = pickInterval();
  return qT({ type: "finish-time", marks: 2, prompt: `Lunch starts at ${fmt12(start)} and lasts ${durText(d)}. What time does it finish?`, diagram: measure({ diagramType: "timeline", points: [{ at: 0, label: fmt12(start) }, { at: d, label: null }], jumps: [{ from: 0, to: d, label: `+${durText(d)}` }] }), answer: fmt12(end), working: [`${fmt12(start)} + ${durText(d)} = ${fmt12(end)}`], space: SPACE_SIZES.SMALL, mcDistractors: [fmt12(end + 10), fmt12(end - 10), fmt12(start + d + 40)].filter(x => x !== fmt12(end)), tags: ["elapsed time"] });
}

function timetableQuestion() {
  const stops = shuffle(["Park Rd", "School", "Library", "Beach", "Station", "Pool"]).slice(0, 4);
  let t = randInt(96, 120) * 5; const times = stops.map((_, i) => (i === 0 ? t : (t += randInt(2, 5) * 5)));
  const i = randInt(0, 2); const j = randInt(i + 1, 3);
  const v = choice(["when", "how-long"]);
  const table = { headerRow: true, rows: [["Bus stop", "Time"], ...stops.map((s, k) => [s, fmt12(times[k])])] };
  if (v === "when") return qT({ type: "timetable", marks: 1, prompt: `What time does the bus get to ${stops[j]}?`, table, answer: fmt12(times[j]), working: [`Find ${stops[j]} in the table and read across.`], space: SPACE_SIZES.SMALL, mcDistractors: times.filter((_, k) => k !== j).map(fmt12), tags: ["timetable"] });
  const d = times[j] - times[i];
  return qT({ type: "timetable", marks: 2, prompt: `How long does the bus take from ${stops[i]} to ${stops[j]}?`, table, answer: `${d} min`, working: [`${fmt12(times[i])} to ${fmt12(times[j])} is ${d} minutes.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${d + 5} min`, `${d - 5 || d + 10} min`, `${times[j] - times[0]} min`].filter(x => x !== `${d} min`), tags: ["timetable"] });
}

const GENERATORS = {
  "kg-g-convert": kgGConvertQuestion,
  "read-scale-b": readScaleBQuestion,
  "order-masses": orderMassesQuestion,
  "mass-problem": massProblemQuestion,
  "balance-share": balanceShareQuestion,
  "read-clock-minute": readClockMinuteQuestion,
  "am-pm": amPmQuestion,
  "seconds": secondsQuestion,
  "duration-timeline": durationTimelineQuestion,
  "finish-time": finishTimeQuestion,
  "timetable": timetableQuestion
};

export function getMassTimeBQuestionTypes() { return TYPE_LIST; }
export function generateMassTimeBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
