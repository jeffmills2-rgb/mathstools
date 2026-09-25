/*
  Mills Maths Tools — Stage 2 Question Bank: Chance B
  ----------------------------------------------------
  question-banks/stage-2/chance-b/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Chance B" — MA2-CHAN-01.

  Big ideas:
    - EQUALLY LIKELY outcomes have the same chance; a game is FAIR when each
      player has the same chance of winning;
    - we can EXPECT results from the picture (4 equal parts → about 1 in 4),
      but real results (OBSERVED) vary;
    - the more times we repeat an experiment, the closer the results usually
      get to what we expect.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, stats, probD, makeStage2, randInt, choice, shuffle } from "../../_shared/stage2-helpers.js";

const TOPIC = "Chance B";
const q = makeStage2(TOPIC, "MA2-CHAN-01");

const TYPE_LIST = [
  { id: "record-results", label: "Record results in a tally" },
  { id: "equally-likely", label: "Equally likely or not?" },
  { id: "fair-game", label: "Is the game fair?" },
  { id: "expected-results", label: "What results would you expect?" },
  { id: "observed-expected", label: "Compare results with what you expected" },
  { id: "more-trials", label: "Why do more trials help?" },
  { id: "design-spinner", label: "Design a spinner" },
  { id: "results-graph", label: "Read results from a graph" }
];

function simulate(labels, weights, n) {
  const tot = weights.reduce((a, b) => a + b, 0); const counts = labels.map(() => 0);
  for (let i = 0; i < n; i++) { let r = Math.random() * tot; for (let k = 0; k < labels.length; k++) { r -= weights[k]; if (r < 0) { counts[k] += 1; break; } } }
  return counts;
}

function recordResultsQuestion() {
  const labels = ["Heads", "Tails"]; const n = randInt(12, 20);
  const seq = Array.from({ length: n }, () => (Math.random() < 0.5 ? "H" : "T"));
  const h = seq.filter(x => x === "H").length;
  return q({ type: "record-results", marks: 2, prompt: `Max tossed a coin ${n} times: ${seq.join(" ")}. Record the results in the tally chart. Which came up more?`, diagram: mani({ diagramType: "tally", heads: ["Toss", "Tally", "Total"], rows: labels.map(l => ({ label: l, count: 0, total: null })) }), answer: `Heads ${h}, Tails ${n - h}. ${h === n - h ? "They came up the same number of times." : `${h > n - h ? "Heads" : "Tails"} came up more.`}`, working: ["Make one tally mark for each toss; bundle in fives.", `Check: ${h} + ${n - h} = ${n}`], space: "none", mcEligible: false, tags: ["record", "tally"] });
}

function equallyLikelyQuestion() {
  const equal = Math.random() < 0.5; const labels = shuffle(["Red", "Blue", "Green", "Yellow"]).slice(0, choice([3, 4]));
  const weights = equal ? labels.map(() => 1) : labels.map((_, i) => (i === 0 ? 2 : 1));
  return q({ type: "equally-likely", marks: 1, prompt: "Are all the colours on this spinner equally likely? Explain.", diagram: probD({ diagramType: "spinner", labels, weights }), answer: equal ? "Yes — every part is the same size." : `No — ${labels[0]} has a bigger part, so it is more likely.`, working: ["Equal parts give equal chances."], space: SPACE_SIZES.SMALL, mcDistractors: [equal ? `No — ${labels[0]} is more likely.` : "Yes — there is one part for each colour."], tags: ["equally likely"] });
}

function fairGameQuestion() {
  const G = [
    ["Roll a dice. Ava wins on 1, 2 or 3. Ben wins on 4, 5 or 6.", true, "Each player has 3 of the 6 numbers."],
    ["Roll a dice. Ava wins on 1 or 2. Ben wins on 3, 4, 5 or 6.", false, "Ben has 4 numbers but Ava has only 2."],
    ["Toss a coin. Ava wins on heads. Ben wins on tails.", true, "Heads and tails are equally likely."],
    ["Roll a dice. Ava wins on an even number. Ben wins on an odd number.", true, "3 even (2, 4, 6) and 3 odd (1, 3, 5)."],
    ["Roll a dice. Ava wins on 6. Ben wins on any other number.", false, "Ben has 5 numbers; Ava has 1."],
    ["Spin a spinner with 3 red parts and 1 blue part (all the same size). Ava wins on red, Ben on blue.", false, "Red has 3 parts; blue has 1."]
  ];
  const [g, fair, why] = choice(G);
  return q({ type: "fair-game", marks: 1, prompt: `Is this game fair? Explain. ${g}`, answer: `${fair ? "Fair" : "Not fair"} — ${why}`, working: ["A game is fair if each player has the same chance of winning."], space: SPACE_SIZES.SMALL, mcDistractors: [fair ? "Not fair — one player has more ways to win." : "Fair — both players can win."], tags: ["fair"] });
}

function expectedResultsQuestion() {
  const parts = choice([2, 4]); const n = parts * randInt(3, 10); const labels = ["Red", "Blue", "Green", "Yellow"].slice(0, parts);
  return q({ type: "expected-results", marks: 1, prompt: `This spinner is spun ${n} times. About how many times would you expect it to land on red?`, diagram: probD({ diagramType: "spinner", labels }), answer: `About ${n / parts} times`, working: [`Red is 1 of ${parts} equal parts.`, `${n} ÷ ${parts} = ${n / parts}`], space: SPACE_SIZES.SMALL, mcDistractors: [`About ${n} times`, `About ${n / 2 === n / parts ? n / 4 : n / 2} times`, `About ${parts} times`], tags: ["expected"] });
}

function observedExpectedQuestion() {
  const n = choice([20, 30, 40]); const labels = ["Heads", "Tails"]; const [h] = simulate(labels, [1, 1], n);
  return q({ type: "observed-expected", marks: 2, prompt: `A coin was tossed ${n} times. It landed on heads ${h} times. How many heads would you expect? Were the results close?`, answer: `Expected about ${n / 2}. Observed ${h}, which is ${Math.abs(h - n / 2) <= n / 10 ? "close" : "not very close"} — results can vary.`, working: ["Heads and tails are equally likely, so expect about half.", `Half of ${n} is ${n / 2}.`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["expected", "observed"] });
}

function moreTrialsQuestion() {
  const a = choice([10, 12]); const b = choice([100, 200]);
  return q({ type: "more-trials", marks: 1, prompt: `Leo tosses a coin ${a} times. Mia tosses a coin ${b} times. Whose results are more likely to be close to half heads? Why?`, answer: `Mia's — with more tosses, results usually get closer to what we expect.`, working: ["A small number of trials can give unusual results."], space: SPACE_SIZES.SMALL, mcDistractors: ["Leo's — fewer tosses are more accurate.", "Both are the same — a coin is always half heads."], tags: ["trials"] });
}

function designSpinnerQuestion() {
  const R = [["Red is more likely than blue, and blue is not impossible.", "For example: 3 red parts and 1 blue part."], ["Red and blue are equally likely.", "For example: 2 red parts and 2 blue parts."], ["Green is certain.", "All 4 parts green."], ["Yellow is impossible, and red is unlikely.", "For example: 1 red and 3 blue — no yellow."]];
  const [rule, eg] = choice(R);
  return q({ type: "design-spinner", marks: 2, prompt: `Colour the spinner so that: ${rule}`, diagram: probD({ diagramType: "spinner", labels: ["", "", "", ""], colour: false }), answer: eg, working: ["More parts of a colour make it more likely."], space: "none", mcEligible: false, tags: ["design"] });
}

function resultsGraphQuestion() {
  const labels = ["Red", "Blue", "Green"]; const weights = shuffle([3, 1, 1]);
  const n = 30; let counts; do { counts = simulate(labels, weights, n); } while (new Set(counts).size < 3);
  const big = labels[counts.indexOf(Math.max(...counts))];
  return q({ type: "results-graph", marks: 2, prompt: `A spinner was spun ${n} times. The graph shows the results. Which colour probably has the biggest part of the spinner? Explain.`, diagram: stats({ chartType: "column", categories: labels, values: counts, yStep: 2, yLabel: "Number of spins", xLabel: "Colour", title: "Spinner results" }), answer: `${big} — it came up the most (${Math.max(...counts)} times).`, working: ["The colour that comes up most often probably has the biggest part."], space: SPACE_SIZES.SMALL, mcDistractors: labels.filter(l => l !== big).map(l => `${l} — it came up the most.`), tags: ["results", "graph"] });
}

const GENERATORS = {
  "record-results": recordResultsQuestion,
  "equally-likely": equallyLikelyQuestion,
  "fair-game": fairGameQuestion,
  "expected-results": expectedResultsQuestion,
  "observed-expected": observedExpectedQuestion,
  "more-trials": moreTrialsQuestion,
  "design-spinner": designSpinnerQuestion,
  "results-graph": resultsGraphQuestion
};

export function getChanceBQuestionTypes() { return TYPE_LIST; }
export function generateChanceBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
