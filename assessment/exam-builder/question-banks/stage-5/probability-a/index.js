/*
  Mills Maths Tools — Stage 5 Question Bank: Probability A
  ---------------------------------------------------------
  question-banks/stage-5/probability-a/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-PRO-C-01 (Core):
    solves problems involving the probabilities of multistage chance
    experiments, with and without replacement.

  Content:
    - sample spaces for two- and three-stage experiments: lists, tables
      (grids) and tree diagrams
    - independent events: multiply along branches, add the paths
    - dependent events: drawing without replacement
    - "at least one" through the complement
    - expected frequency and relative frequency; simulations

  Trees are drawn by the probability engine; every probability in an answer
  is the exact product/sum of the fractions on the drawn branches.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, gcd
} from "../../_shared/bank-helpers.js";

const TOPIC = "Probability A";

const TYPE_LIST = [
  { id: "list-sample-space", label: "List the sample space" },
  { id: "two-dice-grid", label: "Two-dice (grid) probabilities" },
  { id: "complete-tree", label: "Complete a probability tree" },
  { id: "tree-independent", label: "Tree diagrams: independent events" },
  { id: "tree-without-replacement", label: "Tree diagrams: without replacement" },
  { id: "with-vs-without", label: "With or without replacement?" },
  { id: "at-least-one", label: "At least one (complement)" },
  { id: "three-stage", label: "Three-stage experiments" },
  { id: "expected-frequency", label: "Expected frequency" },
  { id: "relative-frequency", label: "Relative frequency and simulation" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "probability", ...(spec.tags || [])] });
const prob = config => ({ engine: "probability-engine", config });

/* fractions */
const F = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
const fr = (n, d) => { if (n === 0) return "0"; const [a, b] = F(n, d); return b === 1 ? String(a) : `[[frac:${a}:${b}]]`; };
const ft = (n, d) => { const [a, b] = F(n, d); return b === 1 ? String(a) : `${a}/${b}`; };
const mulF = (...ps) => ps.reduce((acc, p) => [acc[0] * p[0], acc[1] * p[1]], [1, 1]);
const addF = (...ps) => ps.reduce((acc, p) => [acc[0] * p[1] + p[0] * acc[1], acc[1] * p[1]], [0, 1]);

function listSampleSpaceQuestion() {
  const v = choice(["coin-die", "three-coins", "spinner-coin"]);
  if (v === "coin-die") return q({ type: "list-sample-space", marks: 2, prompt: "A coin is tossed and a six-sided die is rolled. List the sample space and find P(a head and an even number).", answer: "H1, H2, H3, H4, H5, H6, T1, T2, T3, T4, T5, T6; P = [[frac:3:12]] = [[frac:1:4]]", working: ["12 equally likely outcomes; H2, H4, H6 are favourable."], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["sample space"] });
  if (v === "three-coins") { const k = randInt(0, 3); const counts = [1, 3, 3, 1]; return q({ type: "list-sample-space", marks: 2, prompt: `Three coins are tossed. List the sample space and find P(exactly ${k} head${k === 1 ? "" : "s"}).`, answer: `HHH, HHT, HTH, THH, HTT, THT, TTH, TTT; P = ${fr(counts[k], 8)}`, working: [`${counts[k]} of the 8 outcomes have exactly ${k} heads.`], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["sample space"] }); }
  const cols = shuffle(["red", "blue", "green"]);
  return q({ type: "list-sample-space", marks: 2, prompt: `A spinner with three equal sections (red, blue, green) is spun and a coin is tossed. List the sample space and find P(${cols[0]} and a tail).`, answer: `RH, RT, BH, BT, GH, GT; P = [[frac:1:6]]`, working: ["6 equally likely outcomes, 1 favourable."], space: SPACE_SIZES.MEDIUM, mcEligible: false, tags: ["sample space"] });
}

function twoDiceGridQuestion() {
  const v = choice(["sum", "sumAtLeast", "double", "product"]);
  let count = 0; let desc = "";
  const target = randInt(4, 10); const at = randInt(8, 11); const pr = choice([6, 12, 4]);
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    if (v === "sum" && a + b === target) count++;
    if (v === "sumAtLeast" && a + b >= at) count++;
    if (v === "double" && a === b) count++;
    if (v === "product" && a * b === pr) count++;
  }
  desc = v === "sum" ? `a total of ${target}` : v === "sumAtLeast" ? `a total of at least ${at}` : v === "double" ? "a double" : `a product of ${pr}`;
  return q({
    type: "two-dice-grid", marks: 2,
    prompt: `Two fair six-sided dice are rolled. Draw a grid (table) of outcomes and find the probability of ${desc}.`,
    answer: fr(count, 36),
    working: ["36 equally likely outcomes in a 6 × 6 grid", `${count} are favourable: ${count}/36 = ${ft(count, 36)}`],
    space: SPACE_SIZES.LARGE,
    mcDistractors: [fr(count, 12), fr(count + 1, 36), fr(count, 11)].filter(x => x !== fr(count, 36)),
    tags: ["grid", "dice"]
  });
}

function binTree(pA, labels, twoStage = true) {
  const [a, b] = labels;
  const pa = `${pA[0]}/${pA[1]}`; const pb = `${pA[1] - pA[0]}/${pA[1]}`;
  const kids = () => [{ label: a, short: a[0], p: pa }, { label: b, short: b[0], p: pb }];
  return [{ label: a, short: a[0], p: pa, children: twoStage ? kids() : [] }, { label: b, short: b[0], p: pb, children: twoStage ? kids() : [] }];
}

const INDEP = [
  { ctx: "A basketballer makes a free throw with probability {p}. She takes two shots.", labels: ["Score", "Miss"], ps: [[3, 5], [7, 10], [4, 5], [2, 3]] },
  { ctx: "The probability that it rains on any day is {p}. Consider two days.", labels: ["Rain", "No rain"], ps: [[1, 4], [2, 5], [3, 10], [1, 3]] },
  { ctx: "A biased coin lands heads with probability {p}. It is tossed twice.", labels: ["Head", "Tail"], ps: [[2, 3], [3, 5], [3, 4]] }
];

function completeTreeQuestion() {
  const c = choice(INDEP); const p = choice(c.ps);
  const tree = binTree(p, c.labels);
  // blank some branches
  tree[1].p = null; tree[0].children[1].p = null; tree[1].children[0].p = null;
  return q({
    type: "complete-tree", marks: 2,
    prompt: `${c.ctx.replace("{p}", fr(...p))} Complete the probability tree.`,
    diagram: prob({ diagramType: "tree", branches: tree, stageNames: ["1st", "2nd"] }),
    answer: `Missing: ${c.labels[1]} ${fr(p[1] - p[0], p[1])} (first stage and second-stage branches); ${c.labels[0]} ${fr(...p)}`,
    working: ["Branches from each point add to 1.", "Independent: second-stage probabilities are the same as the first."],
    space: "none",
    mcEligible: false,
    tags: ["tree", "complete"]
  });
}

function treeIndependentQuestion() {
  const c = choice(INDEP); const p = choice(c.ps);
  const P = [p[0], p[1]]; const Q = [p[1] - p[0], p[1]];
  const ask = choice(["both", "neither", "exactly-one", "second"]);
  const res = ask === "both" ? mulF(P, P) : ask === "neither" ? mulF(Q, Q) : ask === "exactly-one" ? addF(mulF(P, Q), mulF(Q, P)) : P;
  const [A, B] = c.labels;
  const txt = { both: `${A.toLowerCase()} both times`, neither: `${A.toLowerCase()} neither time`, "exactly-one": `${A.toLowerCase()} exactly once`, second: "" }[ask];
  const prompt = ask === "second" ? `${c.ctx.replace("{p}", fr(...p))} Use the tree to find P(${A.toLowerCase()} on the second trial).` : `${c.ctx.replace("{p}", fr(...p))} Use the tree to find P(${txt}).`;
  return q({
    type: "tree-independent", marks: 2,
    prompt,
    diagram: prob({ diagramType: "tree", branches: binTree(p, c.labels), outcomes: true }),
    answer: fr(...res),
    working: ask === "both" ? [`${ft(...P)} × ${ft(...P)} = ${ft(...res)}`] : ask === "neither" ? [`${ft(...Q)} × ${ft(...Q)} = ${ft(...res)}`] : ask === "exactly-one" ? [`${ft(...P)} × ${ft(...Q)} + ${ft(...Q)} × ${ft(...P)} = ${ft(...res)}`] : [`${ft(...P)} × ${ft(...P)} + ${ft(...Q)} × ${ft(...P)} = ${ft(...P)}`, "(Independent: the first trial does not matter.)"],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [fr(...mulF(P, P)), fr(...mulF(P, Q)), fr(...addF(mulF(P, P), mulF(Q, Q))), fr(...mulF(Q, Q))].filter(x => x !== fr(...res)),
    tags: ["tree", "independent"]
  });
}

function treeWithoutReplacementQuestion() {
  const r = randInt(3, 7); const b = randInt(2, 6); const n = r + b;
  const ask = choice(["both-red", "same", "one-each", "both-blue"]);
  const RR = [r * (r - 1), n * (n - 1)]; const BB = [b * (b - 1), n * (n - 1)]; const RB = [r * b, n * (n - 1)];
  const res = ask === "both-red" ? RR : ask === "both-blue" ? BB : ask === "same" ? addF(RR, BB) : addF(RB, RB);
  const tree = [
    { label: "Red", short: "R", p: `${r}/${n}`, children: [{ label: "Red", short: "R", p: `${r - 1}/${n - 1}` }, { label: "Blue", short: "B", p: `${b}/${n - 1}` }] },
    { label: "Blue", short: "B", p: `${b}/${n}`, children: [{ label: "Red", short: "R", p: `${r}/${n - 1}` }, { label: "Blue", short: "B", p: `${b - 1}/${n - 1}` }] }
  ];
  const desc = { "both-red": "both red", "both-blue": "both blue", same: "the same colour", "one-each": "one of each colour" }[ask];
  return q({
    type: "tree-without-replacement", marks: 3,
    prompt: `A bag holds ${r} red and ${b} blue counters. Two are taken out, one after the other, without replacement. Find P(${desc}).`,
    diagram: prob({ diagramType: "tree", branches: tree, outcomes: true, stageNames: ["1st", "2nd"] }),
    answer: fr(...res),
    working: ["The second-draw fractions have denominator " + (n - 1) + " because one counter has gone.", ask === "both-red" ? `${r}/${n} × ${r - 1}/${n - 1} = ${ft(...RR)}` : ask === "both-blue" ? `${b}/${n} × ${b - 1}/${n - 1} = ${ft(...BB)}` : ask === "same" ? `${ft(...RR)} + ${ft(...BB)} = ${ft(...res)}` : `${r}/${n} × ${b}/${n - 1} + ${b}/${n} × ${r}/${n - 1} = ${ft(...res)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: ask === "both-red" ? [fr(r * r, n * n), fr(2 * r - 1, 2 * n - 1)] : ask === "both-blue" ? [fr(b * b, n * n)] : ask === "same" ? [fr(r * r + b * b, n * n)] : [fr(r * b, n * (n - 1)), fr(2 * r * b, n * n)],
    tags: ["tree", "without replacement"]
  });
}

function withVsWithoutQuestion() {
  const r = randInt(3, 6); const b = randInt(2, 5); const n = r + b;
  const w = fr(r * r, n * n); const wo = fr(r * (r - 1), n * (n - 1));
  return q({
    type: "with-vs-without", marks: 3,
    prompt: `A box holds ${r} green and ${b} yellow balls. Two balls are drawn. Find P(both green) (a) with replacement and (b) without replacement. Explain why they differ.`,
    answer: `(a) ${w}; (b) ${wo}. Without replacement the second draw has one fewer green ball and one fewer ball in total, so it is less likely.`,
    working: [`(a) ${r}/${n} × ${r}/${n}`, `(b) ${r}/${n} × ${r - 1}/${n - 1}`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["replacement"]
  });
}

function atLeastOneQuestion() {
  const v = choice(["dice", "coins", "shots"]);
  if (v === "dice") { const k = choice([2, 3]); return q({ type: "at-least-one", marks: 2, prompt: `${k} fair dice are rolled. Find the probability of at least one six.`, answer: fr(6 ** k - 5 ** k, 6 ** k), working: [`P(no sixes) = (5/6)${k === 2 ? "²" : "³"} = ${5 ** k}/${6 ** k}`, `P(at least one) = 1 − ${5 ** k}/${6 ** k} = ${ft(6 ** k - 5 ** k, 6 ** k)}`], space: SPACE_SIZES.SMALL, mcDistractors: [fr(k, 6), fr(1, 6 ** k), fr(5 ** k, 6 ** k)], tags: ["complement"] }); }
  if (v === "coins") { const k = choice([3, 4]); return q({ type: "at-least-one", marks: 2, prompt: `A coin is tossed ${k} times. Find P(at least one head).`, answer: fr(2 ** k - 1, 2 ** k), working: [`P(no heads) = (1/2)${k === 3 ? "³" : "⁴"} = 1/${2 ** k}`, `1 − 1/${2 ** k} = ${ft(2 ** k - 1, 2 ** k)}`], space: SPACE_SIZES.SMALL, mcDistractors: [fr(1, 2), fr(k, 2 ** k), fr(1, 2 ** k)], tags: ["complement"] }); }
  const p = choice([[1, 3], [2, 5], [1, 4]]); const Qp = [p[1] - p[0], p[1]];
  return q({ type: "at-least-one", marks: 2, prompt: `The probability that an archer hits the target is ${fr(...p)}. She shoots twice. Find P(she hits at least once).`, answer: fr(...addF([1, 1], [-Qp[0] * Qp[0], Qp[1] * Qp[1]])), working: [`P(miss both) = ${ft(...Qp)} × ${ft(...Qp)} = ${ft(Qp[0] ** 2, Qp[1] ** 2)}`, `1 − ${ft(Qp[0] ** 2, Qp[1] ** 2)}`], space: SPACE_SIZES.SMALL, mcDistractors: [fr(...mulF(p, p)), fr(2 * p[0], p[1])], tags: ["complement"] });
}

function threeStageQuestion() {
  const p = choice([[1, 2], [1, 3], [2, 5]]); const Qp = [p[1] - p[0], p[1]];
  const labels = p[0] * 2 === p[1] ? ["Boy", "Girl"] : ["Win", "Lose"];
  const node = (depth) => depth === 0 ? [] : [{ label: labels[0], short: labels[0][0], p: `${p[0]}/${p[1]}`, children: node(depth - 1) }, { label: labels[1], short: labels[1][0], p: `${Qp[0]}/${Qp[1]}`, children: node(depth - 1) }];
  const exactly2 = mulF([3, 1], mulF(p, p, Qp));
  return q({
    type: "three-stage", marks: 3,
    prompt: labels[0] === "Boy" ? "A family has three children. Assume a boy and a girl are equally likely. Use the tree to find P(exactly two boys)." : `A team wins each game with probability ${fr(...p)}, independently. It plays three games. Use the tree to find P(exactly two wins).`,
    diagram: prob({ diagramType: "tree", branches: node(3), outcomes: true }),
    answer: fr(...exactly2),
    working: [`Three paths have exactly two: ${labels[0][0]}${labels[0][0]}${labels[1][0]}, ${labels[0][0]}${labels[1][0]}${labels[0][0]}, ${labels[1][0]}${labels[0][0]}${labels[0][0]}`, `3 × ${ft(...p)} × ${ft(...p)} × ${ft(...Qp)} = ${ft(...exactly2)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [fr(...mulF(p, p, Qp)), fr(2, 3), fr(...mulF(p, p))].filter(x => x !== fr(...exactly2)),
    tags: ["tree", "three stages"]
  });
}

function expectedFrequencyQuestion() {
  const v = choice(["dice", "spinner", "tree"]);
  if (v === "dice") { const n = choice([180, 360, 720]); return q({ type: "expected-frequency", marks: 1, prompt: `Two dice are rolled ${n} times. How many times would you expect a total of 7?`, answer: String(n / 6), working: ["P(total 7) = 6/36 = 1/6", `${n} × 1/6 = ${n / 6}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n / 12), String(n / 36 * 7), String(n / 2)], tags: ["expected"] }); }
  if (v === "spinner") { const n = choice([100, 200, 400]); const p = choice([[1, 4], [2, 5], [3, 10]]); return q({ type: "expected-frequency", marks: 1, prompt: `A spinner lands on blue with probability ${fr(...p)}. How many blues would you expect in ${n} spins?`, answer: String((n * p[0]) / p[1]), working: [`${n} × ${ft(...p)}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n / p[1]), String(n - (n * p[0]) / p[1])], tags: ["expected"] }); }
  const n = choice([80, 200, 400]); const pr = [3, 10]; const e = n * (pr[0] * pr[0]) / (pr[1] * pr[1]);
  return q({ type: "expected-frequency", marks: 2, prompt: `The probability a light turns red as you arrive is ${fr(...pr)}. Each morning you pass two such lights (independent). In ${n} mornings, how many times would you expect both to be red?`, answer: String(e), working: [`P(both) = ${ft(...pr)} × ${ft(...pr)} = 9/100`, `${n} × 9/100 = ${e}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n * 3 / 10), String(n * 6 / 10)], tags: ["expected"] });
}

function relativeFrequencyQuestion() {
  const trials = choice([50, 80, 100, 200]); const hits = randInt(Math.round(trials * 0.2), Math.round(trials * 0.45));
  return q({
    type: "relative-frequency", marks: 3,
    prompt: `A simulation of a game was run ${trials} times and the player won ${hits} times.`,
    subparts: [
      { label: "(a)", prompt: "Find the relative frequency of a win.", marks: 1, answer: fr(hits, trials), working: [`${hits}/${trials}`] },
      { label: "(b)", prompt: "Estimate how many wins there would be in 1000 games.", marks: 1, answer: String(Math.round(1000 * hits / trials)), working: [`1000 × ${ft(hits, trials)}`] },
      { label: "(c)", prompt: "How could the estimate be made more reliable?", marks: 1, answer: "Run more trials: relative frequency gets closer to the true probability as the number of trials increases.", working: [] }
    ],
    answer: `(a) ${fr(hits, trials)}; (b) ${Math.round(1000 * hits / trials)}; (c) more trials`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["relative frequency", "simulation"]
  });
}

const GENERATORS = {
  "list-sample-space": listSampleSpaceQuestion,
  "two-dice-grid": twoDiceGridQuestion,
  "complete-tree": completeTreeQuestion,
  "tree-independent": treeIndependentQuestion,
  "tree-without-replacement": treeWithoutReplacementQuestion,
  "with-vs-without": withVsWithoutQuestion,
  "at-least-one": atLeastOneQuestion,
  "three-stage": threeStageQuestion,
  "expected-frequency": expectedFrequencyQuestion,
  "relative-frequency": relativeFrequencyQuestion
};

export function getProbabilityAQuestionTypes() { return TYPE_LIST; }
export function generateProbabilityAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
