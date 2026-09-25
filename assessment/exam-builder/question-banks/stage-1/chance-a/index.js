/*
  Mills Maths Tools — Stage 1 Question Bank: Chance (A)
  ------------------------------------------------------
  question-banks/stage-1/chance-a/index.js

  NSW Mathematics K–10 (2022), Stage 1 — MA1-CHAN-01
  ("recognises and describes the element of chance in everyday events").

  Big ideas:
    - some things WILL happen, some MIGHT happen, some WON'T happen;
    - if it is not in the bag (or on the spinner), it can't happen;
    - more of a colour means it is more likely.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { probD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Chance A";
const q = makeStage1(TOPIC, "MA1-CHAN-01");

const TYPE_LIST = [
  { id: "will-might-wont", label: "Will happen, might happen, won't happen" },
  { id: "can-spinner-land", label: "Can the spinner land on it?" },
  { id: "can-you-pull", label: "Can you take it from the bag?" },
  { id: "most-likely-colour", label: "Which colour will you most likely get?" },
  { id: "sort-events", label: "Could it happen?" },
  { id: "bigger-part", label: "Which colour is more likely? (spinner)" },
  { id: "all-one-colour", label: "Will happen or won't happen? (bag)" }
];

const EVENTS = [
  ["The sun will come up tomorrow.", "will happen"], ["A cow will jump over the moon.", "won't happen"], ["It will rain this week.", "might happen"],
  ["You will eat lunch today.", "will happen"], ["A fish will walk to school.", "won't happen"], ["You will see a bird today.", "might happen"],
  ["You will have fish for dinner.", "might happen"], ["A dog will talk to you.", "won't happen"], ["Night will come after day.", "will happen"]
];

function willMightWontQuestion() {
  const [e, a] = choice(EVENTS);
  return q({ type: "will-might-wont", marks: 1, prompt: `Will happen, might happen or won't happen? "${e}"`, diagram: probD({ diagramType: "scale", numbers: false, wordSize: 22, wordList: [["Won't happen", 0], ["Might happen", 0.5], ["Will happen", 1]] }), answer: a, working: [], space: SPACE_SIZES.SMALL, mcDistractors: ["will happen", "might happen", "won't happen"].filter(x => x !== a), tags: ["chance words"] });
}

function canSpinnerLandQuestion() {
  const all = ["Red", "Blue", "Green", "Yellow", "Purple"]; const on = shuffle(all).slice(0, randInt(2, 3)); const ask = choice(all);
  const yes = on.includes(ask);
  return q({ type: "can-spinner-land", marks: 1, prompt: `Can the arrow land on ${ask.toLowerCase()}? Yes or no?`, diagram: probD({ diagramType: "spinner", labels: on }), answer: yes ? "Yes" : "No", working: [yes ? `${ask} is on the spinner.` : `There is no ${ask.toLowerCase()} on the spinner.`], space: SPACE_SIZES.SMALL, mcDistractors: [yes ? "No" : "Yes"], tags: ["possible"] });
}

function canYouPullQuestion() {
  const all = ["red", "blue", "green", "yellow"]; const inBag = shuffle(all).slice(0, 2); const counts = Object.fromEntries(inBag.map(c => [c, randInt(2, 5)]));
  const ask = choice(all); const yes = inBag.includes(ask);
  return q({ type: "can-you-pull", marks: 1, prompt: `Can you take out a ${ask} counter? Yes or no?`, diagram: probD({ diagramType: "bag", counts }), answer: yes ? "Yes" : "No", working: [yes ? `There are ${ask} counters in the bag.` : `There are no ${ask} counters.`], space: SPACE_SIZES.SMALL, mcDistractors: [yes ? "No" : "Yes"], tags: ["possible"] });
}

function mostLikelyColourQuestion() {
  const [a, b] = shuffle(["red", "blue", "green", "yellow"]).slice(0, 2); const big = randInt(5, 8); const small = randInt(1, 2);
  return q({ type: "most-likely-colour", marks: 1, prompt: "Take one without looking. Which colour will you most likely get?", diagram: probD({ diagramType: "bag", counts: { [a]: big, [b]: small } }), answer: a, working: [`There are more ${a} counters.`], space: SPACE_SIZES.SMALL, mcDistractors: [b], tags: ["likely"] });
}

function sortEventsQuestion() {
  const [e, a] = choice(EVENTS.filter(x => x[1] !== "might happen").concat([["You will play outside today.", "might happen"], ["You will read a book today.", "might happen"]]));
  const yes = a !== "won't happen";
  return q({ type: "sort-events", marks: 1, prompt: `Could this happen? Yes or no? "${e}"`, answer: yes ? "Yes" : "No", working: [a], space: SPACE_SIZES.SMALL, mcDistractors: [yes ? "No" : "Yes"], tags: ["possible"] });
}

function biggerPartQuestion() {
  const [a, b] = shuffle(["Red", "Blue", "Green", "Yellow"]).slice(0, 2); const w = randInt(2, 3);
  return q({ type: "bigger-part", marks: 1, prompt: "Which colour will the arrow most likely land on?", diagram: probD({ diagramType: "spinner", labels: [a, b], weights: [w, 1] }), answer: a, working: [`${a} has the bigger part.`], space: SPACE_SIZES.SMALL, mcDistractors: [b], tags: ["likely"] });
}

function allOneColourQuestion() {
  const c = choice(["red", "blue", "green"]); const ask = choice([c, "yellow"]);
  const ans = ask === c ? "will happen" : "won't happen";
  return q({ type: "all-one-colour", marks: 1, prompt: `Take one counter. You get ${ask}. Will happen or won't happen?`, diagram: probD({ diagramType: "bag", counts: { [c]: randInt(3, 6) } }), answer: ans, working: [`Every counter is ${c}.`], space: SPACE_SIZES.SMALL, mcDistractors: ["will happen", "might happen", "won't happen"].filter(x => x !== ans), tags: ["chance words"] });
}

const GENERATORS = {
  "will-might-wont": willMightWontQuestion,
  "can-spinner-land": canSpinnerLandQuestion,
  "can-you-pull": canYouPullQuestion,
  "most-likely-colour": mostLikelyColourQuestion,
  "sort-events": sortEventsQuestion,
  "bigger-part": biggerPartQuestion,
  "all-one-colour": allOneColourQuestion
};

export function getChanceAQuestionTypes() { return TYPE_LIST; }
export function generateChanceAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
