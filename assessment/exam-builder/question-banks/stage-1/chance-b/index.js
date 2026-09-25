/*
  Mills Maths Tools — Stage 1 Question Bank: Chance (B)
  ------------------------------------------------------
  question-banks/stage-1/chance-b/index.js

  NSW Mathematics K–10 (2022), Stage 1 — MA1-CHAN-01.

  Big ideas:
    - chance words go in order: impossible, unlikely, likely, certain;
    - we can list everything that could happen (the outcomes);
    - a bigger part of the spinner (or more in the bag) is MORE likely;
    - equal parts give an equal chance.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, probD, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Chance B";
const q = makeStage1(TOPIC, "MA1-CHAN-01");

const LINE = [["Impossible", 0], ["Unlikely", 0.33], ["Likely", 0.67], ["Certain", 1]];
const TYPE_LIST = [
  { id: "chance-word", label: "Impossible, unlikely, likely, certain" },
  { id: "list-outcomes", label: "What could happen?" },
  { id: "more-likely-spinner", label: "More likely or less likely? (spinner)" },
  { id: "compare-bags", label: "Which bag gives a better chance?" },
  { id: "equal-chance", label: "Equal chance?" },
  { id: "certain-impossible-bag", label: "Certain or impossible? (bag)" }
];

const EV = [["Tomorrow will come.", "certain"], ["A cat will fly.", "impossible"], ["It will snow at the beach in summer.", "unlikely"], ["You will laugh today.", "likely"], ["You will see a car today.", "likely"], ["You will meet a dinosaur.", "impossible"], ["You will find a dollar on the way home.", "unlikely"], ["The week will have 7 days.", "certain"]];

function chanceWordQuestion() {
  const [e, a] = choice(EV);
  return q({ type: "chance-word", marks: 1, prompt: `Choose: impossible, unlikely, likely or certain. "${e}"`, diagram: probD({ diagramType: "scale", numbers: false, wordSize: 21, wordList: LINE }), answer: a, working: [], space: SPACE_SIZES.SMALL, mcDistractors: ["impossible", "unlikely", "likely", "certain"].filter(x => x !== a).slice(0, 3), tags: ["chance words"] });
}

function listOutcomesQuestion() {
  const v = choice(["coin", "dice", "spinner"]);
  if (v === "coin") return q({ type: "list-outcomes", marks: 1, prompt: "You flip a coin. What could it land on?", answer: "heads or tails", working: ["A coin has 2 sides."], space: SPACE_SIZES.SMALL, mcDistractors: ["heads only", "1, 2, 3, 4, 5, 6"], tags: ["outcomes"] });
  if (v === "dice") return q({ type: "list-outcomes", marks: 1, prompt: "You roll a dice. What numbers could you get?", diagram: mani({ diagramType: "dice", values: [1, 2, 3, 4, 5, 6] }), answer: "1, 2, 3, 4, 5 or 6", working: [], space: SPACE_SIZES.SMALL, mcDistractors: ["1, 2, 3", "1 to 10", "only 6"], tags: ["outcomes"] });
  const labels = shuffle(["Red", "Blue", "Green", "Yellow"]).slice(0, 3);
  return q({ type: "list-outcomes", marks: 1, prompt: "Spin the arrow. What colours could it land on?", diagram: probD({ diagramType: "spinner", labels }), answer: labels.join(", "), working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["outcomes"] });
}

function moreLikelySpinnerQuestion() {
  const [a, b] = shuffle(["Red", "Blue", "Green", "Yellow"]).slice(0, 2); const w = randInt(2, 3);
  const ask = choice([a, b]); const ans = ask === a ? "more likely" : "less likely";
  return q({ type: "more-likely-spinner", marks: 1, prompt: `Is ${ask.toLowerCase()} more likely or less likely than ${ask === a ? b.toLowerCase() : a.toLowerCase()}?`, diagram: probD({ diagramType: "spinner", labels: [a, b], weights: [w, 1] }), answer: ans, working: [`${a} has the bigger part.`], space: SPACE_SIZES.SMALL, mcDistractors: [ans === "more likely" ? "less likely" : "more likely", "the same"], tags: ["compare"] });
}

function compareBagsQuestion() {
  const T = randInt(6, 9); const a = randInt(1, T - 1); let b = randInt(1, T - 1); if (a === b) b = a === 1 ? 2 : a - 1;
  const best = a > b ? "A" : "B";
  return q({ type: "compare-bags", marks: 1, prompt: `You want red. Bag A has ${a} red and ${T - a} blue. Bag B has ${b} red and ${T - b} blue. Which bag?`, answer: `Bag ${best}`, working: [`Bag ${best} has more red, and both have ${T} counters.`], space: SPACE_SIZES.SMALL, mcDistractors: [`Bag ${best === "A" ? "B" : "A"}`, "It does not matter"], tags: ["compare"] });
}

function equalChanceQuestion() {
  const eq = Math.random() < 0.5; const labels = shuffle(["Red", "Blue", "Green"]).slice(0, 2);
  return q({ type: "equal-chance", marks: 1, prompt: `Do ${labels[0].toLowerCase()} and ${labels[1].toLowerCase()} have the same chance? Yes or no?`, diagram: probD({ diagramType: "spinner", labels, weights: eq ? [1, 1] : [3, 1] }), answer: eq ? "Yes" : "No", working: [eq ? "The parts are the same size." : "One part is bigger."], space: SPACE_SIZES.SMALL, mcDistractors: [eq ? "No" : "Yes"], tags: ["equal chance"] });
}

function certainImpossibleBagQuestion() {
  const c = choice(["red", "blue", "green"]); const n = randInt(3, 7); const ask = choice([c, "yellow"]);
  const ans = ask === c ? "certain" : "impossible";
  return q({ type: "certain-impossible-bag", marks: 1, prompt: `All the counters are ${c}. Taking a ${ask} counter is …?`, diagram: probD({ diagramType: "bag", counts: { [c]: n } }), answer: ans, working: [ans === "certain" ? `Every counter is ${c}.` : `There are no ${ask} counters.`], space: SPACE_SIZES.SMALL, mcDistractors: ["impossible", "certain", "likely", "unlikely"].filter(x => x !== ans).slice(0, 3), tags: ["certain", "impossible"] });
}

const GENERATORS = {
  "chance-word": chanceWordQuestion,
  "list-outcomes": listOutcomesQuestion,
  "more-likely-spinner": moreLikelySpinnerQuestion,
  "compare-bags": compareBagsQuestion,
  "equal-chance": equalChanceQuestion,
  "certain-impossible-bag": certainImpossibleBagQuestion
};

export function getChanceBQuestionTypes() { return TYPE_LIST; }
export function generateChanceBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
