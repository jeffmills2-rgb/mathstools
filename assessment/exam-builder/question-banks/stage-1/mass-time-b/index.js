/*
  Mills Maths Tools — Stage 1 Question Bank: Mass and Time (B)
  -------------------------------------------------------------
  question-banks/stage-1/mass-time-b/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-NSM-01  compare, order and reason about mass in informal units
    MA1-NSM-02  quarter past and quarter to; calendars; order durations

  Big ideas:
    - if equal objects balance a number of blocks, share the blocks out to
      find one object's mass;
    - quarter past: the long hand has gone a quarter of the way round (on 3);
      quarter to: a quarter still to go (on 9);
    - a calendar shows days, weeks and months in order.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, measure, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Mass and Time B";
const qM = makeStage1(TOPIC, "MA1-NSM-01");
const qT = makeStage1(TOPIC, "MA1-NSM-02");

const TYPE_LIST = [
  { id: "balance-share", label: "Equal objects on a balance" },
  { id: "blocks-difference", label: "How many blocks heavier?" },
  { id: "heaviest-chain", label: "Heaviest of three" },
  { id: "quarter-past", label: "Quarter past" },
  { id: "quarter-to", label: "Quarter to" },
  { id: "half-hour-later", label: "Half an hour later" },
  { id: "calendar-read", label: "Read a calendar" },
  { id: "months", label: "Months of the year" },
  { id: "weeks-days", label: "Days and weeks" },
  { id: "order-durations", label: "Order how long things take" }
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function balanceShareQuestion() {
  const n = choice([2, 3]); const each = randInt(2, 5); const thing = choice(["apples", "balls", "cups"]);
  return qM({ type: "balance-share", marks: 1, prompt: `${n} ${thing} balance ${n * each} blocks. How many blocks does 1 weigh?`, diagram: mani({ diagramType: "balance", left: `${n} ${thing}`, right: `${n * each} blocks`, tilt: "level" }), answer: `${each} blocks`, working: [`Share ${n * each} blocks into ${n} equal groups: ${each} each.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${n * each} blocks`, `${each + 1} blocks`, `${n} blocks`].filter(x => x !== `${each} blocks`), tags: ["balance", "sharing"] });
}

function blocksDifferenceQuestion() {
  const a = randInt(6, 15); const b = randInt(2, a - 1);
  return qM({ type: "blocks-difference", marks: 1, prompt: `A box weighs ${a} blocks. A bag weighs ${b} blocks. How many blocks heavier is the box?`, answer: `${a - b} blocks`, working: [`${a} − ${b} = ${a - b}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${a + b} blocks`, `${a - b + 1} blocks`], tags: ["difference"] });
}

function heaviestChainQuestion() {
  const [a, b, c] = shuffle(["red box", "blue box", "green box"]);
  return qM({ type: "heaviest-chain", marks: 1, prompt: `The ${a} is heavier than the ${b}. The ${b} is heavier than the ${c}. Which is heaviest?`, diagram: mani({ diagramType: "balance", left: a, right: b, tilt: "left" }), answer: `the ${a}`, working: [`${a} > ${b} > ${c}`], space: SPACE_SIZES.SMALL, mcDistractors: [`the ${b}`, `the ${c}`], tags: ["order"] });
}

function quarterPastQuestion() {
  const h = randInt(1, 12);
  return qT({ type: "quarter-past", marks: 1, prompt: "What time is it?", diagram: measure({ diagramType: "clock", hours: h, minutes: 15 }), answer: `quarter past ${h}`, working: ["The long hand is on 3: a quarter of the way round."], space: SPACE_SIZES.SMALL, mcDistractors: [`quarter to ${h}`, `half past ${h}`, `3 o'clock`].filter(x => x !== `quarter past ${h}`), tags: ["quarter past"] });
}

function quarterToQuestion() {
  const h = randInt(1, 12); const n = h % 12 + 1;
  return qT({ type: "quarter-to", marks: 1, prompt: "What time is it?", diagram: measure({ diagramType: "clock", hours: h, minutes: 45 }), answer: `quarter to ${n}`, working: [`The long hand is on 9: a quarter of an hour to go until ${n} o'clock.`], space: SPACE_SIZES.SMALL, mcDistractors: [`quarter past ${n}`, `quarter to ${h}`, `9 o'clock`].filter(x => x !== `quarter to ${n}`), tags: ["quarter to"] });
}

function halfHourLaterQuestion() {
  const h = randInt(1, 12); const half = Math.random() < 0.5;
  const ans = half ? `${h % 12 + 1} o'clock` : `half past ${h}`;
  return qT({ type: "half-hour-later", marks: 1, prompt: "What time will it be in half an hour?", diagram: measure({ diagramType: "clock", hours: h, minutes: half ? 30 : 0 }), answer: ans, working: ["Half an hour: the long hand goes half way round."], space: SPACE_SIZES.SMALL, mcDistractors: [half ? `half past ${h % 12 + 1}` : `${h % 12 + 1} o'clock`, half ? `half past ${h}` : `${h} o'clock`], tags: ["duration"] });
}

function calendarReadQuestion() {
  const start = randInt(0, 6); const days = choice([30, 31]); const d = randInt(1, days); const month = choice(MONTHS);
  const dow = DAYS[(start + d - 1) % 7];
  const v = choice(["day", "count"]);
  if (v === "day") return qT({ type: "calendar-read", marks: 1, prompt: `What day of the week is the circled date?`, diagram: mani({ diagramType: "calendar", month, startDay: start, days, circle: [d] }), answer: dow, working: [`Read up to the day name above ${d}.`], space: SPACE_SIZES.SMALL, mcDistractors: [DAYS[(start + d) % 7], DAYS[(start + d + 5) % 7]].filter(x => x !== dow), tags: ["calendar"] });
  const target = choice(DAYS); const n = Array.from({ length: days }, (_, i) => DAYS[(start + i) % 7]).filter(x => x === target).length;
  return qT({ type: "calendar-read", marks: 1, prompt: `How many ${target}s are in this month?`, diagram: mani({ diagramType: "calendar", month, startDay: start, days }), answer: String(n), working: [`Count down the ${target.slice(0, 3)} column.`], space: SPACE_SIZES.SMALL, mcDistractors: ["4", "5", "3"].filter(x => x !== String(n)), tags: ["calendar"] });
}

function monthsQuestion() {
  const i = randInt(0, 11); const v = choice(["after", "before", "count"]);
  if (v === "count") return qT({ type: "months", marks: 1, prompt: "How many months are in a year?", answer: "12", working: [MONTHS.join(", ")], space: SPACE_SIZES.SMALL, mcDistractors: ["7", "10", "52"], tags: ["months"] });
  const ans = v === "after" ? MONTHS[(i + 1) % 12] : MONTHS[(i + 11) % 12];
  return qT({ type: "months", marks: 1, prompt: `What month comes ${v} ${MONTHS[i]}?`, answer: ans, working: [MONTHS.join(", ")], space: SPACE_SIZES.SMALL, mcDistractors: [v === "after" ? MONTHS[(i + 11) % 12] : MONTHS[(i + 1) % 12], MONTHS[(i + 2) % 12]].filter(x => x !== ans), tags: ["months"] });
}

function weeksDaysQuestion() {
  const w = randInt(1, 3); const v = choice(["days-in", "weekend"]);
  if (v === "weekend") return qT({ type: "weeks-days", marks: 1, prompt: "Which two days are the weekend?", answer: "Saturday and Sunday", working: [], space: SPACE_SIZES.SMALL, mcDistractors: ["Friday and Saturday", "Sunday and Monday"], tags: ["days"] });
  return qT({ type: "weeks-days", marks: 1, prompt: `How many days are in ${w} week${w > 1 ? "s" : ""}?`, answer: String(7 * w), working: [`${Array(w).fill(7).join(" + ")} = ${7 * w}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(7 * w + 1), String(5 * w), String(w + 7)].filter(x => x !== String(7 * w)), tags: ["days"] });
}

function orderDurationsQuestion() {
  const E = [["clap your hands", 1], ["eat lunch", 2], ["watch a movie", 3], ["sleep at night", 4]];
  const picks = shuffle(E).slice(0, 3); const order = picks.slice().sort((a, b) => a[1] - b[1]).map(x => x[0]);
  return qT({ type: "order-durations", marks: 1, prompt: `Order from shortest to longest time: ${picks.map(x => x[0]).join(", ")}.`, answer: order.join(", "), working: [], space: SPACE_SIZES.SMALL, mcDistractors: [order.slice().reverse().join(", ")], tags: ["duration"] });
}

const GENERATORS = {
  "balance-share": balanceShareQuestion,
  "blocks-difference": blocksDifferenceQuestion,
  "heaviest-chain": heaviestChainQuestion,
  "quarter-past": quarterPastQuestion,
  "quarter-to": quarterToQuestion,
  "half-hour-later": halfHourLaterQuestion,
  "calendar-read": calendarReadQuestion,
  "months": monthsQuestion,
  "weeks-days": weeksDaysQuestion,
  "order-durations": orderDurationsQuestion
};

export function getMassTimeBQuestionTypes() { return TYPE_LIST; }
export function generateMassTimeBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
