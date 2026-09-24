/*
  Mills Maths Tools — Stage 3 Question Bank: Chance
  ---------------------------------------------------
  question-banks/stage-3/chance/index.js

  NSW Mathematics K–10 (2022), Stage 3, focus areas "Chance A" and
  "Chance B", merged into one topic. Outcome:

    MA3-CHAN-01  conducts chance experiments and quantifies the probability

  Content (docs/stage-3-syllabus-reference.md):
    A  list outcomes of chance experiments with equally likely outcomes;
       represent probabilities using fractions (and the 0 to 1 scale),
       decimals and percentages for benchmark values
    B  compare observed frequencies of outcomes with expected results;
       create random generators (spinners, bags) and describe their
       probabilities using fractions; conduct experiments with small and
       large numbers of trials and notice that large numbers of trials give
       results closer to what is expected

  The pictures (spinner, bag of counters, the 0–1 scale, cards) come from
  engines/probability/probability-engine.js and are drawn from the same
  counts the answer uses.

  Stage boundary: single-step experiments only; no P(not A) = 1 − P(A)
  formula and no "relative frequency" vocabulary (Stage 4). Fractions keep
  Stage 3 denominators — the size of the sample space — and are simplified
  only where the simplified form is a Stage 3 fraction.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, fmt, frac, gcd
} from "../../_shared/bank-helpers.js";

const TOPIC = "Chance";

const TYPE_LIST = [
  { id: "list-outcomes", label: "List all the possible outcomes" },
  { id: "chance-words", label: "Describe chance in words" },
  { id: "probability-scale", label: "The 0 to 1 probability scale" },
  { id: "equally-likely", label: "Equally likely outcomes (is it fair?)" },
  { id: "probability-fraction", label: "Probability as a fraction" },
  { id: "fraction-decimal-percent", label: "Probability as a fraction, decimal and percentage" },
  { id: "most-likely", label: "Compare chances" },
  { id: "expected-results", label: "Expected results" },
  { id: "observed-vs-expected", label: "Observed and expected results" },
  { id: "more-trials", label: "Small and large numbers of trials" },
  { id: "design-generator", label: "Design a spinner or bag" },
  { id: "multi-part-chance", label: "Multi-part chance problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const prob = config => ({ engine: "probability-engine", config });
const COLOURS = ["red", "blue", "green", "yellow"];
const cap = s => s[0].toUpperCase() + s.slice(1);

/* Stage 3 fraction: simplify only when the simplified denominator is one the
   syllabus uses (2, 3, 4, 5, 6, 8, 10, 12); otherwise keep the count form. */
export function s3frac(n, d) {
  if (n === 0) return "0";
  if (n === d) return "1";
  const g = gcd(n, d);
  return [2, 3, 4, 5, 6, 8, 10, 12].includes(d / g) ? frac(n, d) : frac(n, d, false);
}

function fracDistractors(n, d) {
  const out = [frac(d - n, d, false), frac(n, d - n > 0 ? d - n : d + 1, false), frac(1, d, false), frac(n + 1 <= d ? n + 1 : n - 1, d, false), String(n)];
  return out.filter(x => x !== s3frac(n, d) && x !== frac(n, d, false) && !/\[\[frac:(\d+):\1\]\]/.test(x));
}

/* ── outcomes and language ───────────────────────────────── */

function listOutcomesQuestion() {
  const v = choice(["die", "coin", "spinner", "cards", "bag"]);
  if (v === "die") return q({ type: "list-outcomes", marks: 1, prompt: "A standard six-sided die is rolled. List all the possible outcomes.", answer: "1, 2, 3, 4, 5, 6", working: ["Each face is a different outcome."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["chance", "outcomes"] });
  if (v === "coin") return q({ type: "list-outcomes", marks: 1, prompt: "A coin is tossed. List all the possible outcomes, and say whether they are equally likely.", answer: "Heads, tails — equally likely", working: ["A fair coin has two sides, each as likely as the other."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["chance", "outcomes"] });
  if (v === "spinner") {
    const labels = sample(["1", "2", "3", "4", "5", "6", "7", "8"], randInt(3, 6)).sort();
    const shown = shuffle(labels);
    return q({ type: "list-outcomes", marks: 1, prompt: "The spinner is spun once. List all the possible outcomes.", diagram: prob({ diagramType: "spinner", labels: shown }), answer: labels.join(", "), working: ["One outcome for each different number on the spinner."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["chance", "outcomes"] });
  }
  if (v === "cards") {
    const word = choice(["MATHS", "CHANCE", "SPIN", "DICE", "GAME"]);
    const letters = [...new Set(word.split(""))];
    return q({ type: "list-outcomes", marks: 1, prompt: `The letters of the word ${word} are written on cards and one card is picked without looking. List the possible outcomes.`, diagram: prob({ diagramType: "cards", items: word.split(""), tiles: true }), answer: letters.join(", "), working: ["One outcome for each different letter."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["chance", "outcomes"] });
  }
  const cols = sample(COLOURS, randInt(2, 3));
  const counts = Object.fromEntries(cols.map(c => [c, randInt(1, 4)]));
  return q({ type: "list-outcomes", marks: 1, prompt: "One counter is taken from the bag without looking. List the possible outcomes.", diagram: prob({ diagramType: "bag", counts }), answer: cols.map(cap).join(", "), working: ["An outcome is the colour taken; each colour in the bag is a possible outcome."], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["chance", "outcomes"] });
}

const EVENTS = [
  { e: "the sun will rise tomorrow", w: "Certain" },
  { e: "rolling a 7 on a standard six-sided die", w: "Impossible" },
  { e: "a tossed coin landing on heads", w: "Even chance" },
  { e: "rolling a number less than 6 on a die", w: "Likely" },
  { e: "rolling a 6 on a die", w: "Unlikely" },
  { e: "picking a red counter from a bag of 9 red counters and 1 blue", w: "Likely" },
  { e: "picking a blue counter from a bag of 9 red counters and 1 blue", w: "Unlikely" },
  { e: "picking a green counter from a bag of only red counters", w: "Impossible" },
  { e: "rolling an even number on a die", w: "Even chance" },
  { e: "it snowing in Sydney in January", w: "Unlikely" },
  { e: "a baby born today being a girl", w: "Even chance" },
  { e: "Wednesday coming after Tuesday next week", w: "Certain" }
];

function chanceWordsQuestion() {
  const ev = choice(EVENTS);
  return q({
    type: "chance-words", marks: 1,
    prompt: `Describe the chance of ${ev.e}. Use one of: impossible, unlikely, even chance, likely, certain.`,
    answer: ev.w,
    working: [`${cap(ev.e)}: ${ev.w.toLowerCase()}.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: ["Impossible", "Unlikely", "Even chance", "Likely", "Certain"].filter(x => x !== ev.w),
    tags: ["chance", "language"]
  });
}

function probabilityScaleQuestion() {
  const items = [
    { e: "rolling a number from 1 to 6 on a die", p: 1 },
    { e: "rolling a 0 on a die", p: 0 },
    { e: "a coin landing tails", p: 0.5 },
    { e: "taking a red counter from a bag of 3 red and 1 blue", p: 0.75 },
    { e: "taking a blue counter from a bag of 3 red and 1 blue", p: 0.25 },
    { e: "spinning red on a spinner with 10 equal parts, 9 of them red", p: 0.9 },
    { e: "spinning blue on a spinner with 10 equal parts, 1 of them blue", p: 0.1 }
  ];
  const ev = choice(items);
  const others = sample([0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].filter(v => Math.abs(v - ev.p) > 0.12), 3);
  const values = [ev.p, ...others].sort((a, b) => a - b);
  const letters = ["A", "B", "C", "D"];
  const correct = letters[values.indexOf(ev.p)];
  return q({
    type: "probability-scale", marks: 1,
    prompt: `Which letter on the scale best shows the chance of ${ev.e}?`,
    diagram: prob({ diagramType: "scale", markers: values.map((v, i) => ({ value: v, label: letters[i] })) }),
    answer: correct,
    working: [`The probability is ${ev.p === 0 ? "0 (impossible)" : ev.p === 1 ? "1 (certain)" : fmt(ev.p, 2)}, which is at ${correct}.`],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["chance", "probability scale"]
  });
}

function equallyLikelyQuestion() {
  const fair = Math.random() < 0.4;
  const k = choice([3, 4]);
  const labels = sample(COLOURS, k).map(cap);
  const weights = fair ? labels.map(() => 1) : (() => { let w; do { w = labels.map(() => randInt(1, 3)); } while (new Set(w).size === 1); return w; })();
  const big = labels[weights.indexOf(Math.max(...weights))];
  return q({
    type: "equally-likely", marks: 2,
    prompt: "Is each colour on this spinner equally likely? Explain your answer.",
    diagram: prob({ diagramType: "spinner", labels, weights }),
    answer: fair
      ? "Yes. The sectors are all the same size, so each colour is equally likely."
      : `No. The sectors are different sizes; ${big} has the biggest sector, so it is the most likely.`,
    working: [fair ? "Equal sectors → equally likely outcomes." : "Bigger sectors are more likely to be landed on."],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["chance", "equally likely"]
  });
}

/* ── probability as a number ─────────────────────────────── */

function probabilityFractionQuestion() {
  const v = choice(["spinner", "bag", "die", "cards"]);
  if (v === "spinner") {
    const k = choice([4, 5, 6, 8, 10]);
    const pool = sample(COLOURS, choice([2, 3]));
    const labels = Array.from({ length: k }, () => choice(pool)).map(cap);
    const t = choice(pool.map(cap));
    const n = labels.filter(l => l === t).length;
    if (n === 0 || n === k) return probabilityFractionQuestion();
    return q({ type: "probability-fraction", marks: 1, prompt: `The spinner has ${k} equal parts. What is the probability of spinning ${t}? Write it as a fraction.`, diagram: prob({ diagramType: "spinner", labels }), answer: s3frac(n, k), working: [`${t}: ${n} of ${k} equal parts`, `P(${t}) = ${n}/${k}`], space: SPACE_SIZES.SMALL, mcDistractors: fracDistractors(n, k), tags: ["chance", "fractions", "spinner"] });
  }
  if (v === "bag") {
    const cols = sample(COLOURS, choice([2, 3]));
    const counts = Object.fromEntries(cols.map(c => [c, randInt(1, 5)]));
    const total = Object.values(counts).reduce((s, x) => s + x, 0);
    if (total > 12) return probabilityFractionQuestion();
    const t = choice(cols);
    return q({ type: "probability-fraction", marks: 1, prompt: `A counter is taken from the bag without looking. What is the probability that it is ${t}?`, diagram: prob({ diagramType: "bag", counts }), answer: s3frac(counts[t], total), working: [`${counts[t]} ${t} out of ${total} counters`, `P(${t}) = ${counts[t]}/${total}`], space: SPACE_SIZES.SMALL, mcDistractors: fracDistractors(counts[t], total), tags: ["chance", "fractions", "bag"] });
  }
  if (v === "die") {
    const evs = [["an even number", [2, 4, 6]], ["a 3", [3]], ["a number greater than 4", [5, 6]], ["a number less than 5", [1, 2, 3, 4]], ["an odd number", [1, 3, 5]], ["a 1 or a 6", [1, 6]]];
    const [e, fav] = choice(evs);
    return q({ type: "probability-fraction", marks: 1, prompt: `A standard die is rolled. What is the probability of rolling ${e}?`, answer: s3frac(fav.length, 6), working: [`Favourable outcomes: ${fav.join(", ")} (${fav.length} of 6)`, `P = ${fav.length}/6`], space: SPACE_SIZES.SMALL, mcDistractors: fracDistractors(fav.length, 6), tags: ["chance", "fractions", "die"] });
  }
  const n = choice([8, 10, 12]);
  const evs = [["an even number", x => x % 2 === 0], ["a number greater than 5", x => x > 5], ["a multiple of 3", x => x % 3 === 0], ["a number less than 4", x => x < 4]];
  const [e, f] = choice(evs);
  const fav = Array.from({ length: n }, (_, i) => i + 1).filter(f);
  return q({ type: "probability-fraction", marks: 1, prompt: `Cards numbered 1 to ${n} are shuffled and one is picked. What is the probability that it shows ${e}?`, diagram: prob({ diagramType: "cards", items: Array.from({ length: n }, (_, i) => String(i + 1)) }), answer: s3frac(fav.length, n), working: [`Favourable: ${fav.join(", ")} (${fav.length} of ${n})`, `P = ${fav.length}/${n}`], space: SPACE_SIZES.SMALL, mcDistractors: fracDistractors(fav.length, n), tags: ["chance", "fractions", "cards"] });
}

const BENCH = [[0, 1], [1, 2], [1, 4], [3, 4], [1, 10], [3, 10], [7, 10], [9, 10], [1, 5], [2, 5], [1, 1]];

function fractionDecimalPercentQuestion() {
  const [n, d] = choice(BENCH);
  const f = n === 0 ? "0" : n === d ? "1" : frac(n, d);
  const dec = fmt(n / d, 2);
  const pct = `${fmt((n / d) * 100, 0)}%`;
  const from = choice(["fraction", "decimal", "percent"]);
  const to = choice(["fraction", "decimal", "percent"].filter(x => x !== from));
  const show = { fraction: f, decimal: dec, percent: pct };
  const words = { fraction: "a fraction", decimal: "a decimal", percent: "a percentage" };
  return q({
    type: "fraction-decimal-percent", marks: 1,
    prompt: `The probability of an event is ${show[from]}. Write this probability as ${words[to]}.`,
    answer: show[to],
    working: [`${f} = ${dec} = ${pct}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: to === "percent" ? [`${n}%`, `${d}%`, `${fmt(n / d, 2)}%`, `${n * 10}%`] : to === "decimal" ? [`${n}.${d}`, `0.${n}`, fmt((n / d) * 100, 0), fmt(d / Math.max(n, 1), 2)] : [frac(Math.max(n, 1), 100, false), frac(d, Math.max(n, 1), false), frac(Math.max(n, 1), d + 1, false)],
    tags: ["chance", "decimals", "percentages"]
  });
}

function mostLikelyQuestion() {
  const v = choice(["colour", "two-bags"]);
  if (v === "colour") {
    const cols = sample(COLOURS, 3);
    let counts;
    do { counts = Object.fromEntries(cols.map(c => [c, randInt(1, 6)])); } while (new Set(Object.values(counts)).size < 3);
    const most = cols.reduce((a, b) => (counts[a] > counts[b] ? a : b));
    const least = cols.reduce((a, b) => (counts[a] < counts[b] ? a : b));
    const askMost = Math.random() < 0.6;
    return q({ type: "most-likely", marks: 1, prompt: `A counter is taken from the bag without looking. Which colour is ${askMost ? "most" : "least"} likely?`, diagram: prob({ diagramType: "bag", counts }), answer: cap(askMost ? most : least), working: cols.map(c => `${cap(c)}: ${counts[c]}`), space: SPACE_SIZES.SMALL, mcDistractors: cols.filter(c => c !== (askMost ? most : least)).map(cap), tags: ["chance", "comparing"] });
  }
  let a; let b;
  do {
    a = [randInt(1, 5), randInt(1, 5)];
    b = [randInt(1, 5), randInt(1, 5)];
  } while (a[0] * (b[0] + b[1]) === b[0] * (a[0] + a[1]) || (a[0] + a[1]) === (b[0] + b[1]));
  const pa = a[0] / (a[0] + a[1]);
  const pb = b[0] / (b[0] + b[1]);
  const better = pa > pb ? "Bag A" : "Bag B";
  return q({
    type: "most-likely", marks: 2,
    prompt: `Bag A has ${a[0]} red and ${a[1]} blue counters. Bag B has ${b[0]} red and ${b[1]} blue counters. You win if you take a red counter. Which bag gives the better chance of winning? Explain.`,
    answer: `${better}: P(red) is ${frac(a[0], a[0] + a[1], false)} for A and ${frac(b[0], b[0] + b[1], false)} for B, and ${pa > pb ? frac(a[0], a[0] + a[1], false) : frac(b[0], b[0] + b[1], false)} is larger.`,
    working: [`A: ${a[0]}/${a[0] + a[1]} = ${fmt(pa, 3)}`, `B: ${b[0]}/${b[0] + b[1]} = ${fmt(pb, 3)}`, `${better} is better.`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["chance", "comparing"]
  });
}

/* ── experiments ─────────────────────────────────────────── */

function expectedResultsQuestion() {
  const v = choice(["coin", "die", "spinner"]);
  if (v === "coin") {
    const n = choice([20, 50, 100, 60, 40]);
    return q({ type: "expected-results", marks: 1, prompt: `A coin is tossed ${n} times. About how many heads would you expect?`, answer: String(n / 2), working: [`P(heads) = 1/2`, `1/2 of ${n} = ${n / 2}`], space: SPACE_SIZES.SMALL, mcDistractors: [n, n / 4, n / 2 + 10, 2].map(String), tags: ["chance", "expected"] });
  }
  if (v === "die") {
    const n = choice([30, 60, 120, 600, 36]);
    const num = randInt(1, 6);
    return q({ type: "expected-results", marks: 1, prompt: `A die is rolled ${n} times. About how many times would you expect to roll a ${num}?`, answer: String(n / 6), working: [`P(${num}) = 1/6`, `1/6 of ${n} = ${n / 6}`], space: SPACE_SIZES.SMALL, mcDistractors: [n / 2, n / 3, num, n - n / 6].map(String), tags: ["chance", "expected"] });
  }
  const k = choice([4, 5, 8, 10]);
  const pool = sample(COLOURS, 2);
  const labels = Array.from({ length: k }, () => choice(pool)).map(cap);
  const t = cap(pool[0]);
  const m = labels.filter(l => l === t).length;
  if (m === 0 || m === k) return expectedResultsQuestion();
  const n = k * choice([5, 10, 20]);
  return q({ type: "expected-results", marks: 2, prompt: `The spinner is spun ${n} times. About how many times would you expect it to land on ${t}?`, diagram: prob({ diagramType: "spinner", labels }), answer: String((m / k) * n), working: [`P(${t}) = ${m}/${k}`, `${m}/${k} of ${n} = ${n} ÷ ${k} × ${m} = ${(m / k) * n}`], space: SPACE_SIZES.SMALL, mcDistractors: [n / k, n - (m / k) * n, m * 10, n / 2].map(String), tags: ["chance", "expected"] });
}

export function simulate(k, trials) {
  const counts = Array(k).fill(0);
  for (let i = 0; i < trials; i++) counts[randInt(0, k - 1)] += 1;
  return counts;
}

function observedVsExpectedQuestion() {
  const v = choice(["die", "coin"]);
  if (v === "coin") {
    const n = choice([20, 30, 40, 50]);
    let heads;
    do { heads = randInt(Math.round(n * 0.3), Math.round(n * 0.7)); } while (heads === n / 2);
    return q({
      type: "observed-vs-expected", marks: 2,
      prompt: `Zara tossed a coin ${n} times and got ${heads} heads and ${n - heads} tails. How many heads would she expect? Does her result mean the coin is unfair? Explain.`,
      answer: `Expected ${n / 2} heads. Not necessarily: with only ${n} tosses, results often differ a little from what is expected. Many more tosses would give a better test.`,
      working: [`Expected: 1/2 of ${n} = ${n / 2}`, `Observed: ${heads}; difference ${Math.abs(heads - n / 2)}`, "Small numbers of trials vary; this is not strong evidence of an unfair coin."],
      space: SPACE_SIZES.MEDIUM,
      mcEligible: false,
      tags: ["chance", "observed", "expected"]
    });
  }
  const n = choice([30, 60]);
  const counts = simulate(6, n);
  const face = randInt(1, 6);
  const obs = counts[face - 1];
  return q({
    type: "observed-vs-expected", marks: 2,
    prompt: `A die was rolled ${n} times. The table shows the results. How many ${face}s were expected, and how does this compare with the number rolled?`,
    table: { headerRow: true, rows: [["Number", "1", "2", "3", "4", "5", "6"], ["Times rolled", ...counts.map(String)]] },
    answer: `Expected ${n / 6}; rolled ${obs}, which is ${obs === n / 6 ? "exactly the same" : `${Math.abs(obs - n / 6)} ${obs > n / 6 ? "more" : "fewer"} than expected`}.`,
    working: [`Expected: 1/6 of ${n} = ${n / 6}`, `Observed: ${obs}`],
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["chance", "observed", "expected"]
  });
}

function moreTrialsQuestion() {
  const v = choice(["which-closer", "explain"]);
  if (v === "which-closer") {
    const small = 10; const large = 1000;
    const s = randInt(2, 4); const l = randInt(488, 512);
    const opts = shuffle([["Sam", small, s], ["Priya", large, l]]);
    return q({
      type: "more-trials", marks: 2,
      prompt: `${opts[0][0]} tossed a coin ${opts[0][1]} times and got ${opts[0][2]} heads. ${opts[1][0]} tossed a coin ${opts[1][1]} times and got ${opts[1][2]} heads. Whose results are closer to what is expected, as a fraction of the tosses? Why?`,
      answer: `Priya's (${l} out of 1000 is very close to 1/2; ${s} out of 10 is not). More trials usually give results closer to the expected probability.`,
      working: [`Sam: ${s}/10 = ${fmt(s / 10, 1)}`, `Priya: ${l}/1000 = ${fmt(l / 1000, 3)}`, "1/2 = 0.5"],
      space: SPACE_SIZES.MEDIUM,
      mcEligible: false,
      tags: ["chance", "trials"]
    });
  }
  return q({
    type: "more-trials", marks: 1,
    prompt: "A spinner has 4 equal parts: red, blue, green and yellow. Which is more likely to land on red close to one-quarter of the time: 8 spins or 800 spins?",
    answer: "800 spins",
    working: ["With many trials, the observed results usually get closer to the expected probability."],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["chance", "trials"]
  });
}

function designGeneratorQuestion() {
  const v = choice(["spinner", "bag"]);
  if (v === "spinner") {
    const k = choice([4, 6, 8, 10]);
    let n;
    do { n = randInt(1, k - 1); } while (gcd(n, k) === k);
    const t = cap(choice(COLOURS));
    return q({
      type: "design-generator", marks: 1,
      prompt: `Write "${t}" in some of the equal parts of this spinner so that the probability of spinning ${t} is ${s3frac(n, k)}.`,
      diagram: prob({ diagramType: "spinner", labels: Array(k).fill(""), colour: false }),
      answer: `${t} written in ${n} of the ${k} parts`,
      working: [`${s3frac(n, k)} = ${n}/${k}, so ${n} of the ${k} equal parts.`],
      space: "none",
      mcEligible: false,
      tags: ["chance", "random generators"]
    });
  }
  const d = choice([4, 5, 8, 10]);
  const n = randInt(1, d - 1);
  const t = choice(COLOURS);
  const total = d * choice([1, 2]);
  const m = (n / d) * total;
  return q({
    type: "design-generator", marks: 2,
    prompt: `Jin wants to put ${total} counters in a bag so that the probability of taking a ${t} counter is ${s3frac(n, d)}. How many ${t} counters should he use?`,
    answer: `${m} ${t} counter${m === 1 ? "" : "s"}`,
    working: [`${s3frac(n, d)} of ${total} = ${total} ÷ ${d} × ${n} = ${m}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [n, total - m, d, m + 1].map(x => `${x} ${t} counter${x === 1 ? "" : "s"}`),
    tags: ["chance", "random generators"]
  });
}

function multiPartChanceQuestion() {
  const k = 8;
  const pool = sample(COLOURS, 3);
  let labels;
  do { labels = Array.from({ length: k }, () => choice(pool)); } while (new Set(labels).size < 3 || new Set(pool.map(c => labels.filter(l => l === c).length)).size < 3);
  const counts = Object.fromEntries(pool.map(c => [c, labels.filter(l => l === c).length]));
  const most = pool.reduce((a, b) => (counts[a] > counts[b] ? a : b));
  const t = pool[0];
  const n = 40;
  return q({
    type: "multi-part-chance", marks: 4,
    prompt: "The spinner has 8 equal parts.",
    diagram: prob({ diagramType: "spinner", labels: labels.map(cap) }),
    subparts: [
      { label: "(a)", prompt: "Which colour is the spinner most likely to land on?", marks: 1, answer: cap(most), working: [`${cap(most)} has the most parts (${counts[most]}).`] },
      { label: "(b)", prompt: `What is the probability of landing on ${t}?`, marks: 1, answer: s3frac(counts[t], k), working: [`${counts[t]} of 8 parts`] },
      { label: "(c)", prompt: "What is the probability of landing on purple?", marks: 1, answer: "0", working: ["There is no purple: impossible."] },
      { label: "(d)", prompt: `The spinner is spun ${n} times. About how many times would you expect ${t}?`, marks: 1, answer: String((counts[t] / k) * n), working: [`${counts[t]}/8 of ${n} = ${(counts[t] / k) * n}`] }
    ],
    answer: `(a) ${cap(most)}; (b) ${s3frac(counts[t], k)}; (c) 0; (d) ${(counts[t] / k) * n}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["chance", "multi-part"]
  });
}

const GENERATORS = {
  "list-outcomes": listOutcomesQuestion,
  "chance-words": chanceWordsQuestion,
  "probability-scale": probabilityScaleQuestion,
  "equally-likely": equallyLikelyQuestion,
  "probability-fraction": probabilityFractionQuestion,
  "fraction-decimal-percent": fractionDecimalPercentQuestion,
  "most-likely": mostLikelyQuestion,
  "expected-results": expectedResultsQuestion,
  "observed-vs-expected": observedVsExpectedQuestion,
  "more-trials": moreTrialsQuestion,
  "design-generator": designGeneratorQuestion,
  "multi-part-chance": multiPartChanceQuestion
};

export function getStage3ChanceQuestionTypes() {
  return TYPE_LIST;
}

export function generateStage3ChanceQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
