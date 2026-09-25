/*
  Mills Maths Tools — Stage 2 Question Bank: Mass and Time A
  -----------------------------------------------------------
  question-banks/stage-2/mass-time-a/index.js

  NSW Mathematics K–10 (2022), Stage 2:
    MA2-NSM-01  mass — compare on a balance, kilograms and grams, read scales
    MA2-NSM-02  time — analog and digital, to five minutes, past and to

  Big ideas:
    - a pan balance compares masses: the heavier side goes DOWN;
    - a kilogram is about a 1 L bottle of water; a gram is about a paper clip;
    - on a clock the long hand counts minutes in fives around the face; the
      short hand moves slowly between the hour numbers;
    - analog and digital are two ways of showing the same time.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, measure, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Mass and Time A";
const qM = makeStage2(TOPIC, "MA2-NSM-01");
const qT = makeStage2(TOPIC, "MA2-NSM-02");

const TYPE_LIST = [
  { id: "balance-compare", label: "Heavier or lighter on a balance" },
  { id: "balance-units", label: "Measure mass with blocks on a balance" },
  { id: "kg-or-g", label: "Kilograms or grams?" },
  { id: "estimate-mass", label: "Estimate mass" },
  { id: "read-kg-scale", label: "Read a scale" },
  { id: "read-clock-5", label: "Read a clock to five minutes" },
  { id: "past-to", label: "Past and to the hour" },
  { id: "analog-digital", label: "Analog to digital" },
  { id: "draw-hands", label: "Draw the hands" },
  { id: "time-facts", label: "Minutes, hours, days" },
  { id: "time-later", label: "What time will it be?" }
];

const HEAVY = ["a watermelon", "a school bag", "a bag of potatoes", "a bowling ball", "a big dictionary"];
const LIGHT = ["a feather", "a pencil", "a leaf", "a sock", "a paper clip", "an apple"];

function balanceCompareQuestion() {
  const a = choice(HEAVY); const b = choice(LIGHT); const flip = Math.random() < 0.5;
  const [L, R] = flip ? [b, a] : [a, b];
  const tilt = flip ? "right" : "left";
  const ask = choice(["heavier", "lighter"]);
  const ans = ask === "heavier" ? a : b;
  return qM({ type: "balance-compare", marks: 1, prompt: `Which object is ${ask}? How can you tell from the balance?`, diagram: mani({ diagramType: "balance", left: L.replace(/^an? /, ""), right: R.replace(/^an? /, ""), tilt }), answer: `${ans[0].toUpperCase()}${ans.slice(1)} — ${ask === "heavier" ? "its side of the balance goes down" : "its side of the balance goes up"}.`, working: ["The heavier side goes down; the lighter side goes up."], space: SPACE_SIZES.SMALL, mcDistractors: [`${(ask === "heavier" ? b : a)[0].toUpperCase()}${(ask === "heavier" ? b : a).slice(1)} — its side of the balance goes ${ask === "heavier" ? "down" : "up"}.`], tags: ["balance", "compare"] });
}

function balanceUnitsQuestion() {
  const n = randInt(3, 12); const thing = choice(["apple", "orange", "toy car", "stapler", "banana"]);
  const other = choice(["pencil case", "lunchbox", "cup"]); const m = n + randInt(-3, 4) || n + 1;
  if (m === n) return balanceUnitsQuestion();
  return qM({ type: "balance-units", marks: 1, prompt: `The ${thing} balances ${n} blocks. The ${other} balances ${m} blocks. Which is heavier, and by how many blocks?`, diagram: mani({ diagramType: "balance", left: thing, right: `${n} blocks`, tilt: "level" }), answer: `The ${m > n ? other : thing}, by ${Math.abs(m - n)} blocks`, working: ["More blocks to balance means heavier.", `${Math.max(m, n)} − ${Math.min(m, n)} = ${Math.abs(m - n)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`The ${m > n ? thing : other}, by ${Math.abs(m - n)} blocks`, `The ${m > n ? other : thing}, by ${m + n} blocks`], tags: ["balance", "informal units"] });
}

function kgOrGQuestion() {
  const T = [["a bag of flour", "kg"], ["a strawberry", "g"], ["a dog", "kg"], ["a slice of bread", "g"], ["a bicycle", "kg"], ["a coin", "g"], ["a person", "kg"], ["a pencil", "g"], ["a bag of rice", "kg"], ["a letter", "g"]];
  const [t, u] = choice(T); const names = { kg: "kilograms (kg)", g: "grams (g)" };
  return qM({ type: "kg-or-g", marks: 1, prompt: `Would you measure the mass of ${t} in kilograms (kg) or grams (g)?`, answer: names[u], working: ["Heavy things: kg. Light things: g. 1 kg = 1000 g."], space: SPACE_SIZES.SMALL, mcDistractors: [names[u === "kg" ? "g" : "kg"]], tags: ["units"] });
}

function estimateMassQuestion() {
  const E = [["a 1 L bottle of water", "1 kg", ["1 g", "10 kg", "100 kg"]], ["a paper clip", "1 g", ["1 kg", "100 g", "10 kg"]], ["an apple", "150 g", ["150 kg", "15 kg", "1 g"]], ["a Year 3 student", "30 kg", ["30 g", "300 kg", "3 kg"]], ["a loaf of bread", "700 g", ["700 kg", "7 g", "70 kg"]], ["a cat", "4 kg", ["4 g", "40 kg", "400 kg"]]];
  const [t, a, d] = choice(E);
  return qM({ type: "estimate-mass", marks: 1, prompt: `Which is the best estimate for the mass of ${t}?`, answer: a, working: ["A 1 L bottle of water is about 1 kg. A paper clip is about 1 g."], space: SPACE_SIZES.SMALL, mcDistractors: d, tags: ["estimate"] });
}

function readKgScaleQuestion() {
  const s = choice([{ max: 10, major: 1, minor: 1, unit: "kg" }, { max: 5, major: 1, minor: 1, unit: "kg" }, { max: 1000, major: 200, minor: 100, unit: "g" }, { max: 20, major: 5, minor: 1, unit: "kg" }]);
  const k = randInt(1, Math.round(s.max / s.minor) - 1); const value = k * s.minor;
  return qM({ type: "read-kg-scale", marks: 1, prompt: "What mass does the scale show?", diagram: measure({ diagramType: "scale", ...s, value, labelSize: 26 }), answer: `${value} ${s.unit}`, working: [`Each mark is ${s.minor} ${s.unit}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${value + s.minor} ${s.unit}`, `${value - s.minor || value + 2 * s.minor} ${s.unit}`, `${value} ${s.unit === "kg" ? "g" : "kg"}`], tags: ["reading scales"] });
}

/* ── time ─────────────────────────────────────────────── */
const pad = m => String(m).padStart(2, "0");
const HW = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
function inWords(h, m) {
  const nh = h % 12 + 1;
  if (m === 0) return `${HW[h]} o'clock`;
  if (m === 15) return `quarter past ${HW[h]}`;
  if (m === 30) return `half past ${HW[h]}`;
  if (m === 45) return `quarter to ${HW[nh]}`;
  return m < 30 ? `${m} minutes past ${HW[h]}` : `${60 - m} minutes to ${HW[nh]}`;
}
const randTime = () => ({ h: randInt(1, 12), m: randInt(0, 11) * 5 });

function readClock5Question() {
  const { h, m } = randTime();
  return qT({ type: "read-clock-5", marks: 1, prompt: "What time does the clock show?", diagram: measure({ diagramType: "clock", hours: h, minutes: m }), answer: `${h}:${pad(m)}`, working: [`The short hand is ${m ? `past ${h}` : `on ${h}`}. The long hand is on ${m / 5 || 12}: count by fives to ${m} minutes.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${(m / 5) || 12}:${pad((h % 12) * 5)}`, `${h}:${pad((m + 5) % 60)}`, `${h % 12 + 1}:${pad(m)}`].filter(x => x !== `${h}:${pad(m)}`), tags: ["analog"] });
}

function pastToQuestion() {
  const { h } = randTime(); const m = choice([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  return qT({ type: "past-to", marks: 1, prompt: "Write the time in words, using past or to.", diagram: measure({ diagramType: "clock", hours: h, minutes: m }), answer: inWords(h, m), working: [m <= 30 ? "The long hand is on the right side: minutes PAST the hour." : "The long hand is on the left side: minutes TO the next hour."], space: SPACE_SIZES.SMALL, mcDistractors: [inWords(h, 60 - m === 60 ? 0 : 60 - m), m > 30 ? `${60 - m} minutes past ${HW[h]}` : `${m} minutes to ${HW[h % 12 + 1]}`].filter(x => x !== inWords(h, m)), tags: ["past and to"] });
}

function analogDigitalQuestion() {
  const { h, m } = randTime();
  if (Math.random() < 0.5) return qT({ type: "analog-digital", marks: 1, prompt: "Write this time as it would show on a digital clock.", diagram: measure({ diagramType: "clock", hours: h, minutes: m }), answer: `${h}:${pad(m)}`, working: ["Hours, then a colon, then minutes (always two digits)."], space: SPACE_SIZES.SMALL, mcDistractors: [`${(m / 5) || 12}:${pad((h % 12) * 5)}`, `${h}:${pad((m + 5) % 60)}`, `${h % 12 + 1}:${pad(m)}`].filter(x => x !== `${h}:${pad(m)}`), tags: ["digital"] });
  return qT({ type: "analog-digital", marks: 1, prompt: "Write this digital time in words.", diagram: measure({ diagramType: "digital", text: `${h}:${pad(m)}` }), answer: inWords(h, m), working: [m > 30 ? `${m} minutes past is the same as ${60 - m} minutes to the next hour.` : ""].filter(Boolean), space: SPACE_SIZES.SMALL, mcDistractors: [inWords(h % 12 + 1, m), inWords(h, (m + 30) % 60)].filter(x => x !== inWords(h, m)), tags: ["digital"] });
}

function drawHandsQuestion() {
  const { h, m } = randTime();
  return qT({ type: "draw-hands", marks: 1, prompt: `Draw the hands to show ${choice([`${h}:${pad(m)}`, inWords(h, m)])}.`, diagram: measure({ diagramType: "clock", hands: false }), answer: `Long hand on ${m / 5 || 12}; short hand ${m ? `just past ${h}${m > 30 ? `, closer to ${h % 12 + 1}` : ""}` : `on ${h}`}.`, working: ["The short (hour) hand moves between numbers as the minutes pass."], space: "none", mcEligible: false, tags: ["draw"] });
}

function timeFactsQuestion() {
  const F = [["How many minutes in 1 hour?", "60"], ["How many minutes in half an hour?", "30"], ["How many minutes in a quarter of an hour?", "15"], ["How many hours in 1 day?", "24"], ["How many days in 1 week?", "7"], ["How many months in 1 year?", "12"], ["How many minutes does the long hand take to go all the way around?", "60"], ["How many minutes between each number on a clock?", "5"]];
  const [p, a] = choice(F);
  return qT({ type: "time-facts", marks: 1, prompt: p, answer: a, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(["60", "30", "15", "24", "7", "12", "5", "100"].filter(x => x !== a)).slice(0, 3), tags: ["units of time"] });
}

function timeLaterQuestion() {
  const { h, m } = randTime(); const add = choice([5, 10, 15, 30, 60, 20]);
  const tot = h * 60 + m + add; const nh = Math.floor(tot / 60) % 12 || 12; const nm = tot % 60;
  return qT({ type: "time-later", marks: 1, prompt: `The clock shows the time now. What time will it be in ${add === 60 ? "1 hour" : `${add} minutes`}?`, diagram: measure({ diagramType: "clock", hours: h, minutes: m }), answer: `${nh}:${pad(nm)}`, working: [`${h}:${pad(m)} + ${add === 60 ? "1 hour" : `${add} min`} = ${nh}:${pad(nm)}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${h}:${pad((m + add) % 60)}`, `${nh}:${pad((nm + 5) % 60)}`, `${h}:${pad(m)}`].filter(x => x !== `${nh}:${pad(nm)}`), tags: ["elapsed time"] });
}

const GENERATORS = {
  "balance-compare": balanceCompareQuestion,
  "balance-units": balanceUnitsQuestion,
  "kg-or-g": kgOrGQuestion,
  "estimate-mass": estimateMassQuestion,
  "read-kg-scale": readKgScaleQuestion,
  "read-clock-5": readClock5Question,
  "past-to": pastToQuestion,
  "analog-digital": analogDigitalQuestion,
  "draw-hands": drawHandsQuestion,
  "time-facts": timeFactsQuestion,
  "time-later": timeLaterQuestion
};

export { inWords, pad };
export function getMassTimeAQuestionTypes() { return TYPE_LIST; }
export function generateMassTimeAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
