/*
  Mills Maths Tools — Stage 2 Question Bank: Chance A
  ----------------------------------------------------
  question-banks/stage-2/chance-a/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Chance A" — MA2-CHAN-01.

  Big ideas:
    - chance words sit on a line from IMPOSSIBLE to CERTAIN;
    - an OUTCOME is one thing that can happen; listing every outcome helps
      us judge chance;
    - more of something in a bag (or a bigger part of a spinner) means it is
      MORE LIKELY.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { probD, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Chance A";
const q = makeStage2(TOPIC, "MA2-CHAN-01");

const TYPE_LIST = [
  { id: "chance-words", label: "Impossible, unlikely, likely, certain" },
  { id: "chance-line", label: "Place events on a chance line" },
  { id: "list-outcomes", label: "List the possible outcomes" },
  { id: "bag-likely", label: "Likely or unlikely? (bag)" },
  { id: "spinner-most-likely", label: "Which is most likely? (spinner)" },
  { id: "compare-bags", label: "Which bag gives the better chance?" },
  { id: "can-it-happen", label: "Can it happen?" }
];

const WORDS = ["impossible", "unlikely", "equally likely (even chance)", "likely", "certain"];
const LINE = [["Impossible", 0], ["Unlikely", 0.25], ["Even chance", 0.5], ["Likely", 0.75], ["Certain", 1]];
const cap = s => s[0].toUpperCase() + s.slice(1);

const EVENTS = [
  ["The sun will rise tomorrow.", "certain"], ["A dog will fly to the moon.", "impossible"], ["It will rain somewhere in Australia this year.", "certain"],
  ["You will see a kangaroo in your classroom today.", "unlikely"], ["A tossed coin lands on heads.", "equally likely (even chance)"], ["You will eat something today.", "likely"],
  ["Monday will come after Sunday.", "certain"], ["You roll a 7 on a normal dice.", "impossible"], ["It will snow in Sydney in summer.", "unlikely"],
  ["A baby born today is a girl.", "equally likely (even chance)"], ["You will have homework this week.", "likely"]
];

function chanceWordsQuestion() {
  const [e, w] = choice(EVENTS);
  return q({ type: "chance-words", marks: 1, prompt: `Choose a chance word: impossible, unlikely, even chance, likely or certain. "${e}"`, diagram: probD({ diagramType: "scale", numbers: false, wordSize: 21, wordList: LINE }), answer: cap(w), working: [{ impossible: "It can never happen.", unlikely: "It could happen, but probably won't.", "equally likely (even chance)": "It is just as likely to happen as not.", likely: "It will probably happen.", certain: "It will definitely happen." }[w]], space: SPACE_SIZES.SMALL, mcDistractors: WORDS.filter(x => x !== w).map(cap).slice(0, 3), tags: ["chance words"] });
}

function chanceLineQuestion() {
  const picks = shuffle(EVENTS.slice()).filter((e, i, a) => a.findIndex(x => x[1] === e[1]) === i).slice(0, 3);
  const L = ["A", "B", "C"];
  return q({ type: "chance-line", marks: 2, prompt: `Mark each event on the chance line with its letter. A: "${picks[0][0]}"  B: "${picks[1][0]}"  C: "${picks[2][0]}"`, diagram: probD({ diagramType: "scale", numbers: false, wordSize: 21, wordList: LINE }), answer: picks.map((p, i) => `${L[i]}: ${cap(p[1])}`).join("; "), working: ["Decide how likely each event is, then find its word on the line."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["chance line"] });
}

function listOutcomesQuestion() {
  const v = choice(["spinner", "coin", "dice", "bag"]);
  if (v === "coin") return q({ type: "list-outcomes", marks: 1, prompt: "A coin is tossed. List all the possible outcomes.", answer: "Heads, tails", working: ["A coin has two sides."], space: SPACE_SIZES.SMALL, mcDistractors: ["Heads", "Heads, tails, edge", "Tails"], tags: ["outcomes"] });
  if (v === "dice") return q({ type: "list-outcomes", marks: 1, prompt: "A normal dice is rolled. List all the possible outcomes.", diagram: probD({ diagramType: "cards", items: ["1", "2", "3", "4", "5", "6"] }), answer: "1, 2, 3, 4, 5, 6", working: ["A dice has six faces."], space: SPACE_SIZES.SMALL, mcDistractors: ["1, 2, 3, 4, 5", "1 to 12", "6"], tags: ["outcomes"] });
  if (v === "bag") { const cols = shuffle(["red", "blue", "green", "yellow"]).slice(0, randInt(2, 3)); const counts = Object.fromEntries(cols.map(c => [c, randInt(1, 4)])); return q({ type: "list-outcomes", marks: 1, prompt: "One counter is taken from the bag without looking. List the possible colours.", diagram: probD({ diagramType: "bag", counts }), answer: cols.map(cap).join(", "), working: ["Each colour in the bag can be picked."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["outcomes"] }); }
  const labels = shuffle(["Red", "Blue", "Green", "Yellow", "Purple"]).slice(0, randInt(3, 4));
  return q({ type: "list-outcomes", marks: 1, prompt: "The arrow is spun. List all the possible outcomes.", diagram: probD({ diagramType: "spinner", labels }), answer: labels.join(", "), working: ["One outcome for each different section."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["outcomes"] });
}

function bagLikelyQuestion() {
  const big = randInt(5, 8); const small = randInt(1, 2); const [a, b] = shuffle(["red", "blue"]);
  const counts = { [a]: big, [b]: small };
  const ask = choice([a, b, "green"]);
  const ans = ask === a ? "Likely" : ask === b ? "Unlikely" : "Impossible";
  return q({ type: "bag-likely", marks: 1, prompt: `A counter is taken without looking. Is it likely, unlikely or impossible that it is ${ask}?`, diagram: probD({ diagramType: "bag", counts }), answer: ans, working: [ask === "green" ? "There are no green counters." : `${counts[ask]} of the ${big + small} counters are ${ask}.`], space: SPACE_SIZES.SMALL, mcDistractors: ["Likely", "Unlikely", "Impossible", "Certain"].filter(x => x !== ans), tags: ["likely"] });
}

function spinnerMostLikelyQuestion() {
  const cols = shuffle(["Red", "Blue", "Green", "Yellow"]).slice(0, 3);
  let w; do { w = cols.map(() => randInt(1, 4)); } while (new Set(w).size < 3);
  const labels = []; const weights = [];
  cols.forEach((c, i) => { labels.push(c); weights.push(w[i]); });
  const most = cols[w.indexOf(Math.max(...w))]; const least = cols[w.indexOf(Math.min(...w))];
  const ask = choice(["most", "least"]);
  const ans = ask === "most" ? most : least;
  return q({ type: "spinner-most-likely", marks: 1, prompt: `Which colour is ${ask} likely? Why?`, diagram: probD({ diagramType: "spinner", labels, weights }), answer: `${ans} — it has the ${ask === "most" ? "biggest" : "smallest"} part of the spinner.`, working: ["A bigger part of the spinner means a bigger chance."], space: SPACE_SIZES.SMALL, mcDistractors: cols.filter(c => c !== ans).map(c => `${c} — it has the ${ask === "most" ? "biggest" : "smallest"} part of the spinner.`), tags: ["compare chance"] });
}

function compareBagsQuestion() {
  const T = randInt(6, 10); const a = randInt(1, T - 1); let c = randInt(1, T - 1); if (c === a) c = a === 1 ? 2 : a - 1;
  const better = a > c ? "A" : "B";
  return q({ type: "compare-bags", marks: 1, prompt: `Bag A has ${a} red and ${T - a} blue counters. Bag B has ${c} red and ${T - c} blue counters. You want to take out a red counter. Which bag should you choose? Why?`, answer: `Bag ${better} — both bags have ${T} counters, and bag ${better} has more red ones.`, working: [`A: ${a} red out of ${T}. B: ${c} red out of ${T}.`], space: SPACE_SIZES.SMALL, mcDistractors: [`Bag ${better === "A" ? "B" : "A"} — both bags have ${T} counters, and bag ${better === "A" ? "B" : "A"} has more red ones.`, "It does not matter — both bags have the same number of counters."], tags: ["compare chance"] });
}

function canItHappenQuestion() {
  const I = [["You roll a normal dice and get 0.", "No — a dice only has 1 to 6."], ["You spin a spinner with red and blue parts and get red.", "Yes — red is on the spinner."], ["You take a green counter from a bag of only red counters.", "No — there are no green counters."], ["You toss a coin and get heads.", "Yes — heads is one of the two outcomes."]];
  const [e, a] = choice(I);
  return q({ type: "can-it-happen", marks: 1, prompt: `Can this happen? Explain. "${e}"`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcDistractors: [a.startsWith("Yes") ? "No — it is impossible." : "Yes — anything can happen."], tags: ["outcomes"] });
}

const GENERATORS = {
  "chance-words": chanceWordsQuestion,
  "chance-line": chanceLineQuestion,
  "list-outcomes": listOutcomesQuestion,
  "bag-likely": bagLikelyQuestion,
  "spinner-most-likely": spinnerMostLikelyQuestion,
  "compare-bags": compareBagsQuestion,
  "can-it-happen": canItHappenQuestion
};

export function getChanceAQuestionTypes() { return TYPE_LIST; }
export function generateChanceAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
