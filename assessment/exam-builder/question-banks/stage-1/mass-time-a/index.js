/*
  Mills Maths Tools — Stage 1 Question Bank: Mass and Time (A)
  -------------------------------------------------------------
  question-banks/stage-1/mass-time-a/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-NSM-01  mass with uniform informal units (a pan balance)
    MA1-NSM-02  durations; o'clock and half-past time; days of the week

  Big ideas:
    - the heavier side of a balance goes DOWN; level means the same mass;
    - "the apple balances 6 blocks" measures mass in blocks;
    - the short hand shows the hour; at half past, the long hand points to 6
      and the short hand is halfway to the next number;
    - some events take longer than others (duration).
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, measure, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Mass and Time A";
const qM = makeStage1(TOPIC, "MA1-NSM-01");
const qT = makeStage1(TOPIC, "MA1-NSM-02");

const TYPE_LIST = [
  { id: "heavier-lighter", label: "Heavier or lighter? (balance)" },
  { id: "mass-in-blocks", label: "Mass in blocks" },
  { id: "order-mass-blocks", label: "Order by mass" },
  { id: "which-heavier", label: "Which is heavier? (think)" },
  { id: "oclock", label: "O'clock" },
  { id: "half-past", label: "Half past" },
  { id: "draw-oclock", label: "Draw the hands" },
  { id: "days-of-week", label: "Days of the week" },
  { id: "longer-time", label: "Which takes longer?" },
  { id: "one-hour-later", label: "One hour later" }
];

const LIGHT = ["feather", "leaf", "pencil", "sock", "balloon"]; const HEAVY = ["brick", "rock", "melon", "book", "shoe"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURW = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

function heavierLighterQuestion() {
  const h = choice(HEAVY); const l = choice(LIGHT); const flip = Math.random() < 0.5;
  const ask = choice(["heavier", "lighter"]); const ans = ask === "heavier" ? h : l;
  return qM({ type: "heavier-lighter", marks: 1, prompt: `Which is ${ask}?`, diagram: mani({ diagramType: "balance", left: flip ? l : h, right: flip ? h : l, tilt: flip ? "right" : "left" }), answer: `the ${ans}`, working: ["The heavier side goes down."], space: SPACE_SIZES.SMALL, mcDistractors: [`the ${ask === "heavier" ? l : h}`], tags: ["balance"] });
}

function massInBlocksQuestion() {
  const n = randInt(3, 12); const thing = choice(["apple", "toy car", "orange", "cup", "shoe"]);
  return qM({ type: "mass-in-blocks", marks: 1, prompt: `The balance is level. How many blocks does the ${thing} weigh?`, diagram: mani({ diagramType: "balance", left: thing, right: `${n} blocks`, tilt: "level" }), answer: `${n} blocks`, working: ["Level means the same mass."], space: SPACE_SIZES.SMALL, mcDistractors: [`${n + 1} blocks`, `${n - 1} blocks`], tags: ["informal units"] });
}

function orderMassBlocksQuestion() {
  const vals = shuffle([randInt(2, 4), randInt(5, 8), randInt(9, 12)]); const names = shuffle(["apple", "book", "shoe"]);
  const order = names.map((n, i) => [n, vals[i]]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  return qM({ type: "order-mass-blocks", marks: 1, prompt: `The ${names[0]} weighs ${vals[0]} blocks, the ${names[1]} ${vals[1]} blocks, the ${names[2]} ${vals[2]} blocks. Lightest to heaviest?`, answer: order.join(", "), working: ["Fewer blocks means lighter."], space: SPACE_SIZES.SMALL, mcDistractors: [order.slice().reverse().join(", ")], tags: ["order"] });
}

function whichHeavierQuestion() {
  const h = choice(HEAVY); const l = choice(LIGHT); const pair = shuffle([h, l]);
  return qM({ type: "which-heavier", marks: 1, prompt: `Which is heavier: a ${pair[0]} or a ${pair[1]}?`, answer: `a ${h}`, working: [], space: SPACE_SIZES.SMALL, mcDistractors: [`a ${l}`], tags: ["estimate"] });
}

function oclockQuestion() {
  const h = randInt(1, 12);
  return qT({ type: "oclock", marks: 1, prompt: "What time is it?", diagram: measure({ diagramType: "clock", hours: h, minutes: 0 }), answer: `${h} o'clock`, working: [`The long hand is on 12. The short hand is on ${h}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${h % 12 + 1} o'clock`, `half past ${h}`, `12 o'clock`].filter(x => x !== `${h} o'clock`), tags: ["o'clock"] });
}

function halfPastQuestion() {
  const h = randInt(1, 12);
  return qT({ type: "half-past", marks: 1, prompt: "What time is it?", diagram: measure({ diagramType: "clock", hours: h, minutes: 30 }), answer: `half past ${h}`, working: [`The long hand is on 6. The short hand is between ${h} and ${h % 12 + 1}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`half past ${h % 12 + 1}`, `${h} o'clock`, `6 o'clock`].filter(x => x !== `half past ${h}`), tags: ["half past"] });
}

function drawOclockQuestion() {
  const h = randInt(1, 12); const half = Math.random() < 0.4;
  return qT({ type: "draw-oclock", marks: 1, prompt: `Draw the hands to show ${half ? `half past ${HOURW[h]}` : `${HOURW[h]} o'clock`}.`, diagram: measure({ diagramType: "clock", hands: false }), answer: half ? `Long hand on 6; short hand halfway between ${h} and ${h % 12 + 1}.` : `Long hand on 12; short hand on ${h}.`, working: [], space: "none", mcEligible: false, tags: ["draw"] });
}

function daysOfWeekQuestion() {
  const i = randInt(0, 6); const v = choice(["after", "before"]);
  const ans = v === "after" ? DAYS[(i + 1) % 7] : DAYS[(i + 6) % 7];
  return qT({ type: "days-of-week", marks: 1, prompt: `What day comes ${v} ${DAYS[i]}?`, answer: ans, working: [DAYS.join(", ")], space: SPACE_SIZES.SMALL, mcDistractors: [v === "after" ? DAYS[(i + 6) % 7] : DAYS[(i + 1) % 7], DAYS[(i + 2) % 7]].filter(x => x !== ans), tags: ["days"] });
}

function longerTimeQuestion() {
  const P = [["a night's sleep", "brushing your teeth"], ["a school day", "eating an apple"], ["a movie", "tying your shoes"], ["a week", "a day"], ["an hour", "a minute"]];
  const [long, short] = choice(P); const pair = shuffle([long, short]);
  return qT({ type: "longer-time", marks: 1, prompt: `Which takes longer: ${pair[0]} or ${pair[1]}?`, answer: long, working: [], space: SPACE_SIZES.SMALL, mcDistractors: [short], tags: ["duration"] });
}

function oneHourLaterQuestion() {
  const h = randInt(1, 12); const n = h % 12 + 1;
  return qT({ type: "one-hour-later", marks: 1, prompt: "What time will it be in 1 hour?", diagram: measure({ diagramType: "clock", hours: h, minutes: 0 }), answer: `${n} o'clock`, working: [`${h} o'clock + 1 hour = ${n} o'clock`], space: SPACE_SIZES.SMALL, mcDistractors: [`${h} o'clock`, `half past ${h}`, `${n % 12 + 1} o'clock`], tags: ["duration"] });
}

const GENERATORS = {
  "heavier-lighter": heavierLighterQuestion,
  "mass-in-blocks": massInBlocksQuestion,
  "order-mass-blocks": orderMassBlocksQuestion,
  "which-heavier": whichHeavierQuestion,
  "oclock": oclockQuestion,
  "half-past": halfPastQuestion,
  "draw-oclock": drawOclockQuestion,
  "days-of-week": daysOfWeekQuestion,
  "longer-time": longerTimeQuestion,
  "one-hour-later": oneHourLaterQuestion
};

export function getMassTimeAQuestionTypes() { return TYPE_LIST; }
export function generateMassTimeAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
