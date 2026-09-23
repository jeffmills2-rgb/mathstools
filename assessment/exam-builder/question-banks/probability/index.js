/*
  Mills Maths Tools — Stage 4 Question Bank: Probability
  -------------------------------------------------------
  question-banks/probability/index.js

  NSW Mathematics K–10 (2022), Stage 4, MA4-PRO-C-01:
    "solves problems involving the probabilities of simple chance experiments"

  Content covered (docs/stage-4-syllabus-reference.md has the mapping):
    - chance language and the 0 to 1 probability scale
    - sample spaces for single-step experiments
    - theoretical probability of equally likely outcomes, as a fraction,
      decimal and percentage
    - the probabilities of all outcomes add to 1
    - complementary events and P(not A) = 1 − P(A)
    - experimental probability (relative frequency) and how it compares with
      theoretical probability as the number of trials grows
    - expected frequency, and outcomes that are NOT equally likely

  Diagrams (spinner, bag of counters, 0–1 scale, cards) come from
  engines/probability/probability-engine.js and are drawn from the same
  counts the answer uses; tools/stage4-probability.mjs recounts them.

  Conventions: probabilities are given as simplified fractions unless the
  prompt asks for a decimal or percentage; experiments are single-step (two-
  step experiments are Stage 5).
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, fmt, frac, gcd, spaced
} from "../_shared/bank-helpers.js";

const TOPIC = "Probability";

const TYPE_LIST = [
  { id: "sample-space", label: "List the sample space" },
  { id: "chance-language", label: "Describe chance in words" },
  { id: "probability-scale", label: "The 0 to 1 probability scale" },
  { id: "die-probability", label: "Probability with a fair die" },
  { id: "spinner-probability", label: "Probability with spinners" },
  { id: "bag-probability", label: "Probability with counters in a bag" },
  { id: "cards-letters", label: "Probability with cards and letters" },
  { id: "fraction-decimal-percent", label: "Express probability as a fraction, decimal and percentage" },
  { id: "sum-to-one", label: "Probabilities add to 1" },
  { id: "complementary-events", label: "Describe complementary events" },
  { id: "complement-calculate", label: "P(not A) = 1 − P(A)" },
  { id: "relative-frequency", label: "Experimental probability (relative frequency)" },
  { id: "theoretical-vs-experimental", label: "Theoretical vs experimental probability" },
  { id: "expected-frequency", label: "Expected number of outcomes" },
  { id: "not-equally-likely", label: "Outcomes that are not equally likely" },
  { id: "multi-part-probability", label: "Multi-part probability problem" }
];

const q = spec => makeQuestion(TOPIC, spec);
const prob = config => ({ engine: "probability-engine", config });

/* Wrong-but-tempting probabilities for multiple choice. */
function probDistractors(n, d) {
  const out = new Set();
  if (d - n > 0) out.add(frac(n, d - n, false));   // odds, not probability
  out.add(frac(d - n, d));                          // the complement
  if (n + 1 <= d) out.add(frac(n + 1, d));
  out.add(frac(1, d));
  if (n > 1) out.add(frac(n - 1, d));
  out.add(`${n}`);
  return [...out].filter(x => x !== frac(n, d));
}

function asWords(n, d) {
  const p = n / d;
  return p === 0 ? "Impossible" : p === 1 ? "Certain" : p === 0.5 ? "Even chance" : p < 0.5 ? "Unlikely" : "Likely";
}

const COLOUR_NAMES = ["red", "blue", "green", "yellow", "purple", "orange"];

/* ── sample spaces and language ──────────────────────────── */

function sampleSpaceQuestion() {
  const variant = choice(["die", "coin", "spinner", "word", "cards", "month"]);
  let prompt; let answer; let diagram = null; let count;
  if (variant === "die") { prompt = "A standard six-sided die is rolled. List the sample space."; answer = "{1, 2, 3, 4, 5, 6}"; count = 6; }
  else if (variant === "coin") { prompt = "A coin is tossed. List the sample space."; answer = "{head, tail}"; count = 2; }
  else if (variant === "spinner") {
    const labels = sample(COLOUR_NAMES, randInt(3, 5)).map(c => c[0].toUpperCase() + c.slice(1));
    diagram = prob({ diagramType: "spinner", labels });
    prompt = "The spinner is spun once. List the sample space.";
    answer = `{${labels.join(", ")}}`; count = labels.length;
  } else if (variant === "word") {
    const w = choice(["MATHS", "NUMBER", "SPINNER", "CHANCE", "RANDOM", "DICE"]);
    const letters = [...new Set(w.split(""))];
    diagram = prob({ diagramType: "cards", items: w.split(""), tiles: true });
    prompt = `One of these letter tiles is chosen at random. List the sample space (each different letter once).`;
    answer = `{${letters.join(", ")}}`; count = letters.length;
  } else if (variant === "cards") {
    const n = choice([5, 8, 10, 12]);
    const items = Array.from({ length: n }, (_, i) => String(i + 1));
    diagram = prob({ diagramType: "cards", items });
    prompt = "One card is chosen at random. List the sample space, and state how many outcomes it has.";
    answer = `{${items.join(", ")}}; ${n} outcomes`; count = n;
  } else {
    prompt = "A month of the year is chosen at random. How many outcomes are in the sample space?";
    answer = "12"; count = 12;
  }
  return q({
    type: "sample-space",
    marks: 1,
    prompt,
    diagram,
    answer,
    working: ["The sample space is the list of every possible outcome.", answer],
    space: SPACE_SIZES.SMALL,
    ...(variant === "month" ? { mcDistractors: ["4", "30", "365", "1"] } : { mcEligible: false }),
    tags: ["probability", "sample space", `${count} outcomes`]
  });
}

const EVENTS = [
  { e: "the sun rising in the east tomorrow", a: "Certain" },
  { e: "rolling a 7 on a standard six-sided die", a: "Impossible" },
  { e: "a tossed coin landing on heads", a: "Even chance" },
  { e: "rolling a number less than 6 on a standard die", a: "Likely" },
  { e: "rolling a 6 on a standard die", a: "Unlikely" },
  { e: "choosing a vowel from the letters of the word RHYTHM", a: "Impossible" },
  { e: "choosing a red card from a standard deck of 52 playing cards", a: "Even chance" },
  { e: "choosing a heart from a standard deck of 52 playing cards", a: "Unlikely" },
  { e: "rolling a number greater than 0 on a standard die", a: "Certain" },
  { e: "choosing a card that is not an ace from a standard deck", a: "Likely" }
];

function chanceLanguageQuestion() {
  const all = ["Impossible", "Unlikely", "Even chance", "Likely", "Certain"];
  if (Math.random() < 0.5) {
    const ev = choice(EVENTS);
    return q({
      type: "chance-language", marks: 1,
      prompt: `Which word best describes the chance of ${ev.e}: impossible, unlikely, even chance, likely or certain?`,
      answer: ev.a,
      working: [ev.a],
      space: SPACE_SIZES.SMALL,
      mcDistractors: all.filter(x => x !== ev.a),
      tags: ["probability", "chance language"]
    });
  }
  const d = choice([4, 5, 8, 10, 20]);
  const n = randInt(0, d);
  const dec = Math.random() < 0.5;
  const shown = dec ? fmt(n / d, 3) : frac(n, d);
  return q({
    type: "chance-language", marks: 1,
    prompt: `An event has a probability of ${shown}. Describe its chance in words.`,
    answer: asWords(n, d),
    working: [n === 0 ? "A probability of 0 means the event cannot happen." : n === d ? "A probability of 1 means the event must happen." : n * 2 === d ? "A probability of ½ is an even chance." : n * 2 < d ? "It is between 0 and ½." : "It is between ½ and 1.", asWords(n, d)],
    space: SPACE_SIZES.SMALL,
    mcDistractors: all.filter(x => x !== asWords(n, d)),
    tags: ["probability", "chance language"]
  });
}

function probabilityScaleQuestion() {
  const events = [
    { e: "rolling a number less than 7 on a die", p: 1 },
    { e: "rolling a 9 on a die", p: 0 },
    { e: "a coin landing tails", p: 0.5 },
    { e: "rolling a 1 or a 2 on a die", p: 1 / 3 },
    { e: "rolling a number greater than 1 on a die", p: 5 / 6 },
    { e: "choosing a blue counter from a bag of 3 blue and 1 red", p: 0.75 },
    { e: "choosing a red counter from a bag of 3 blue and 1 red", p: 0.25 }
  ];
  const ev = choice(events);
  const others = sample([0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1].filter(v => Math.abs(v - ev.p) > 0.12), 3);
  const values = shuffle([ev.p, ...others]).sort((a, b) => a - b);
  const letters = ["A", "B", "C", "D"];
  const markers = values.map((v, i) => ({ value: v, label: letters[i] }));
  const correct = letters[values.indexOf(ev.p)];
  return q({
    type: "probability-scale", marks: 1,
    prompt: `Which letter on the probability scale best shows the chance of ${ev.e}?`,
    diagram: prob({ diagramType: "scale", markers }),
    answer: correct,
    working: [`P = ${ev.p === 1 ? "1" : ev.p === 0 ? "0" : fmt(ev.p, 2)}, which is at ${correct}.`],
    space: SPACE_SIZES.SMALL,
    // A lettered answer among lettered options (A. C, B. A…) reads badly.
    mcEligible: false,
    mcDistractors: letters.filter(l => l !== correct),
    tags: ["probability", "probability scale"]
  });
}

/* ── theoretical probability ─────────────────────────────── */

const DIE_EVENTS = [
  { e: "a 4", f: v => v === 4 },
  { e: "an even number", f: v => v % 2 === 0 },
  { e: "an odd number", f: v => v % 2 === 1 },
  { e: "a number greater than 4", f: v => v > 4 },
  { e: "a number less than 3", f: v => v < 3 },
  { e: "a prime number", f: v => [2, 3, 5].includes(v) },
  { e: "a factor of 6", f: v => 6 % v === 0 },
  { e: "a multiple of 3", f: v => v % 3 === 0 },
  { e: "a number that is at least 2", f: v => v >= 2 },
  { e: "a square number", f: v => [1, 4].includes(v) }
];

function dieProbabilityQuestion() {
  const ev = choice(DIE_EVENTS);
  const fav = [1, 2, 3, 4, 5, 6].filter(ev.f);
  return q({
    type: "die-probability", marks: 1,
    prompt: `A fair six-sided die is rolled. What is the probability of rolling ${ev.e}?`,
    answer: frac(fav.length, 6),
    working: [`Favourable outcomes: ${fav.join(", ")} (${fav.length} of 6)`, `P = ${fav.length}/6${gcd(fav.length, 6) > 1 ? ` = ${frac(fav.length, 6).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}` : ""}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: probDistractors(fav.length, 6),
    tags: ["probability", "die"]
  });
}

function spinnerProbabilityQuestion() {
  const k = choice([4, 5, 6, 8, 10]);
  const pool = sample(COLOUR_NAMES, choice([2, 3]));
  const labels = Array.from({ length: k }, () => choice(pool));
  const target = choice(pool);
  const n = labels.filter(l => l === target).length;
  if (n === 0 || n === k) return spinnerProbabilityQuestion();
  const cap = labels.map(l => l[0].toUpperCase() + l.slice(1));
  const T = target[0].toUpperCase() + target.slice(1);
  const not = Math.random() < 0.25;
  return q({
    type: "spinner-probability", marks: 1,
    prompt: `The spinner has ${k} equal sectors. What is the probability that it lands on ${not ? "a colour that is not " : ""}${T}?`,
    diagram: prob({ diagramType: "spinner", labels: cap }),
    answer: not ? frac(k - n, k) : frac(n, k),
    working: not
      ? [`${T} sectors: ${n}; other sectors: ${k - n}`, `P(not ${T}) = ${k - n}/${k}`]
      : [`${T} sectors: ${n} out of ${k}`, `P(${T}) = ${n}/${k}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: probDistractors(not ? k - n : n, k),
    tags: ["probability", "spinner"]
  });
}

function bagProbabilityQuestion() {
  const colours = sample(["red", "blue", "green", "yellow"], choice([2, 3]));
  const counts = {};
  colours.forEach(c => { counts[c] = randInt(1, 7); });
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  const target = choice(colours);
  const n = counts[target];
  const form = choice(["fraction", "fraction", "decimal", "percentage"]);
  if (form !== "fraction" && !Number.isInteger((n / total) * 1000)) return bagProbabilityQuestion();
  const ans = form === "fraction" ? frac(n, total) : form === "decimal" ? fmt(n / total, 3) : `${fmt(n / total * 100, 1)}%`;
  const showBag = total <= 16;
  return q({
    type: "bag-probability", marks: 1,
    prompt: `${showBag ? "A counter is taken at random from the bag." : `A bag holds ${colours.map(c => `${counts[c]} ${c}`).join(", ")} counters. One is taken at random.`} What is the probability that it is ${target}${form === "fraction" ? "" : `, as a ${form}`}?`,
    diagram: showBag ? prob({ diagramType: "bag", counts }) : null,
    answer: ans,
    working: [`${n} ${target} out of ${total} counters`, `P(${target}) = ${n}/${total}${form === "fraction" ? "" : ` = ${ans}`}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: form === "fraction" ? probDistractors(n, total) : undefined,
    tags: ["probability", "bag"]
  });
}

const CARD_EVENTS = [
  { e: "an even number", f: v => v % 2 === 0 },
  { e: "a multiple of 3", f: v => v % 3 === 0 },
  { e: "a prime number", f: v => [2, 3, 5, 7, 11, 13, 17, 19].includes(v) },
  { e: "a number greater than 7", f: v => v > 7 },
  { e: "a square number", f: v => [1, 4, 9, 16].includes(v) },
  { e: "a number with two digits", f: v => v >= 10 },
  { e: "a factor of 12", f: v => 12 % v === 0 }
];

function cardsLettersQuestion() {
  if (Math.random() < 0.5) {
    const n = choice([10, 12, 15, 20]);
    const ev = choice(CARD_EVENTS);
    const fav = Array.from({ length: n }, (_, i) => i + 1).filter(ev.f);
    if (!fav.length || fav.length === n) return cardsLettersQuestion();
    return q({
      type: "cards-letters", marks: 1,
      prompt: `Cards numbered 1 to ${n} are shuffled and one is chosen. What is the probability that it shows ${ev.e}?`,
      diagram: n <= 12 ? prob({ diagramType: "cards", items: Array.from({ length: n }, (_, i) => String(i + 1)) }) : null,
      answer: frac(fav.length, n),
      working: [`Favourable: ${fav.join(", ")} (${fav.length} of ${n})`, `P = ${fav.length}/${n}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: probDistractors(fav.length, n),
      tags: ["probability", "cards"]
    });
  }
  const word = choice(["PROBABILITY", "STATISTICS", "MATHEMATICS", "EXPERIMENT", "ASSESSMENT", "BANANA", "MISSISSIPPI"]);
  const letters = word.split("");
  const ask = choice(["letter", "vowel", "consonant"]);
  const target = choice([...new Set(letters)].filter(l => letters.filter(x => x === l).length >= 2)) || letters[0];
  const isVowel = l => "AEIOU".includes(l);
  const fav = ask === "letter" ? letters.filter(l => l === target).length : ask === "vowel" ? letters.filter(isVowel).length : letters.filter(l => !isVowel(l)).length;
  const what = ask === "letter" ? `the letter ${target}` : `a ${ask}`;
  return q({
    type: "cards-letters", marks: 1,
    prompt: `The letters of the word ${word} are written on tiles and one tile is chosen at random. What is the probability of choosing ${what}?`,
    diagram: prob({ diagramType: "cards", items: letters, tiles: true }),
    answer: frac(fav, letters.length),
    working: [`${letters.length} tiles; ${fav} ${ask === "letter" ? `show ${target}` : `are ${ask}s`}`, `P = ${fav}/${letters.length}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: probDistractors(fav, letters.length),
    tags: ["probability", "letters"]
  });
}

const FDP_PAIRS = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [7, 20], [9, 25], [6, 25], [1, 25]];

function fractionDecimalPercentQuestion() {
  const [n, d] = choice(FDP_PAIRS);
  const scale = choice([1, 1, 2, 3, 4]);
  const N = n * scale; const D = d * scale;
  const ctx = choice([
    `A spinner has ${D} equal sectors and ${N} of them are shaded.`,
    `A bag holds ${D} marbles, of which ${N} are green.`,
    `A raffle has ${D} tickets and Zara holds ${N} of them.`
  ]);
  const event = /shaded/.test(ctx) ? "landing on a shaded sector" : /green/.test(ctx) ? "choosing a green marble" : "Zara winning";
  return q({
    type: "fraction-decimal-percent", marks: 2,
    prompt: `${ctx} Write the probability of ${event} as a fraction in simplest form, a decimal and a percentage.`,
    answer: `${frac(N, D)}, ${fmt(N / D, 3)}, ${fmt(N / D * 100, 1)}%`,
    working: [`P = ${N}/${D}${scale > 1 ? ` = ${n}/${d}` : ""}`, `${n} ÷ ${d} = ${fmt(N / D, 3)}`, `${fmt(N / D, 3)} × 100 = ${fmt(N / D * 100, 1)}%`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["probability", "fractions", "decimals", "percentages"]
  });
}

/* ── probabilities add to 1; complements ─────────────────── */

function sumToOneQuestion() {
  const k = choice([3, 4]);
  const cols = sample(["Red", "Blue", "Green", "Yellow", "White"], k);
  const form = choice(["decimal", "decimal", "fraction", "percent"]);
  let parts;
  do {
    const cuts = sample(Array.from({ length: 19 }, (_, i) => (i + 1) * 5), k - 1).sort((a, b) => a - b);
    parts = [...cuts, 100].map((c, i, arr) => c - (i ? arr[i - 1] : 0));
  } while (parts.some(p => p < 5));
  const miss = randInt(0, k - 1);
  const show = p => form === "decimal" ? fmt(p / 100, 2) : form === "percent" ? `${p}%` : frac(p, 100);
  return q({
    type: "sum-to-one", marks: 2,
    prompt: `A spinner can land on ${cols.join(", ")}. The table shows the probability of each colour. Find the missing probability.`,
    table: { headerRow: true, rows: [["Colour", "Probability"], ...cols.map((c, i) => [c, i === miss ? "?" : show(parts[i])])] },
    answer: show(parts[miss]),
    working: [
      `The probabilities of all outcomes add to ${form === "percent" ? "100%" : "1"}.`,
      `${form === "percent" ? "100%" : "1"} − (${parts.filter((_, i) => i !== miss).map(show).join(" + ").replace(/\[\[frac:(\d+):(\d+)\]\]/g, "$1/$2")}) = ${show(parts[miss]).replace(/\[\[frac:(\d+):(\d+)\]\]/g, "$1/$2")}`
    ],
    space: SPACE_SIZES.MEDIUM,
    tags: ["probability", "sum to 1"]
  });
}

const COMPLEMENTS = [
  { e: "rolling an even number on a die", c: "rolling an odd number", d: ["rolling a 1", "rolling a number less than 6", "rolling an even number"] },
  { e: "rolling a 6 on a die", c: "rolling a number that is not 6 (1, 2, 3, 4 or 5)", d: ["rolling a 1", "rolling an odd number", "rolling a 5"] },
  { e: "a coin landing on heads", c: "the coin landing on tails", d: ["the coin landing on heads", "rolling a 6", "the coin landing on its edge"] },
  { e: "rolling a number greater than 4 on a die", c: "rolling a number less than or equal to 4", d: ["rolling a number less than 4", "rolling a 5 or 6", "rolling an even number"] },
  { e: "choosing a vowel from the letters of MATHS", c: "choosing a consonant", d: ["choosing the letter A", "choosing M", "choosing a vowel"] },
  { e: "Team A winning a game that cannot be drawn", c: "Team A losing", d: ["Team A winning", "the game being drawn", "Team B losing"] }
];

function complementaryEventsQuestion() {
  const c = choice(COMPLEMENTS);
  return q({
    type: "complementary-events", marks: 1,
    prompt: `What is the complement of the event "${c.e}"?`,
    answer: c.c[0].toUpperCase() + c.c.slice(1),
    working: ["The complement of an event is everything in the sample space that is NOT that event.", c.c],
    space: SPACE_SIZES.SMALL,
    mcDistractors: c.d.map(x => x[0].toUpperCase() + x.slice(1)),
    tags: ["probability", "complementary events"]
  });
}

function complementCalculateQuestion() {
  const form = choice(["fraction", "decimal", "percent"]);
  const ctx = choice(["it rains tomorrow", "the bus is late", "Sam wins the race", "a light globe is faulty", "the team scores first"]);
  if (form === "fraction") {
    const d = choice([5, 7, 8, 9, 10, 12, 20]);
    const n = randInt(1, d - 1);
    return q({
      type: "complement-calculate", marks: 1,
      prompt: `The probability that ${ctx} is ${frac(n, d, false)}. What is the probability that this does not happen?`,
      answer: frac(d - n, d),
      working: ["P(not A) = 1 − P(A)", `1 − ${n}/${d} = ${d - n}/${d}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [frac(n, d), frac(1, d), frac(d - n - 1 || d - n + 1, d)],
      tags: ["probability", "complement"]
    });
  }
  const p = form === "decimal" ? randInt(1, 99) / 100 : randInt(1, 19) * 5;
  return q({
    type: "complement-calculate", marks: 1,
    prompt: `The probability that ${ctx} is ${form === "decimal" ? fmt(p, 2) : `${p}%`}. What is the probability that this does not happen?`,
    answer: form === "decimal" ? fmt(1 - p, 2) : `${100 - p}%`,
    working: ["P(not A) = 1 − P(A)", form === "decimal" ? `1 − ${fmt(p, 2)} = ${fmt(1 - p, 2)}` : `100% − ${p}% = ${100 - p}%`],
    space: SPACE_SIZES.SMALL,
    tags: ["probability", "complement"]
  });
}

/* ── experimental probability ────────────────────────────── */

function experimentCounts(k, trials) {
  for (let i = 0; i < 200; i++) {
    const cuts = sample(Array.from({ length: trials - 1 }, (_, j) => j + 1), k - 1).sort((a, b) => a - b);
    const counts = [...cuts, trials].map((c, j, arr) => c - (j ? arr[j - 1] : 0));
    if (counts.every(c => c >= Math.max(2, trials / (k * 3)))) return counts;
  }
  return Array.from({ length: k }, (_, j) => (j < k - 1 ? Math.floor(trials / k) : trials - Math.floor(trials / k) * (k - 1)));
}

function relativeFrequencyQuestion() {
  const exp = choice([
    { what: n => `A drawing pin is dropped ${n} times.`, outcomes: ["Point up", "Point down"] },
    { what: n => `A bottle top is flipped ${n} times.`, outcomes: ["Right way up", "Upside down", "On its side"] },
    { what: n => `A spinner is spun ${n} times.`, outcomes: ["A", "B", "C", "D"] },
    { what: n => `The colours of ${n} cars passing the school are recorded.`, outcomes: ["White", "Black", "Silver", "Other"] }
  ]);
  const trials = choice([20, 25, 40, 50, 80, 100, 200]);
  const counts = experimentCounts(exp.outcomes.length, trials);
  const i = randInt(0, exp.outcomes.length - 1);
  const form = Math.random() < 0.5 ? "fraction" : "decimal";
  return q({
    type: "relative-frequency", marks: 2,
    prompt: `${exp.what(trials)} The results are in the table. Find the relative frequency (experimental probability) of "${exp.outcomes[i]}"${form === "decimal" ? " as a decimal" : ""}.`,
    table: { headerRow: true, rows: [["Outcome", ...exp.outcomes], ["Frequency", ...counts.map(String)]] },
    answer: form === "fraction" ? frac(counts[i], trials) : fmt(counts[i] / trials, 4),
    working: ["Relative frequency = number of times the outcome occurred ÷ number of trials", `${counts[i]} ÷ ${trials} = ${form === "fraction" ? frac(counts[i], trials).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2") : fmt(counts[i] / trials, 4)}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["probability", "relative frequency"]
  });
}

function theoreticalVsExperimentalQuestion() {
  const variant = choice(["coin", "die"]);
  if (variant === "coin") {
    const n = choice([10, 20, 30, 50]);
    const heads = Math.round(n / 2) + choice([-4, -3, 3, 4, 5]);
    return q({
      type: "theoretical-vs-experimental", marks: 3,
      prompt: `Kim tossed a coin ${n} times and got ${heads} heads. (a) What is the experimental probability of a head? (b) What is the theoretical probability of a head? (c) Explain why they are different, and what would happen with many more tosses.`,
      answer: `(a) ${frac(heads, n)}; (b) ${frac(1, 2)}; (c) Results vary by chance in a small number of trials; with many more tosses the experimental probability should get closer to ½.`,
      working: [`(a) ${heads}/${n}`, "(b) 1 of 2 equally likely outcomes", "(c) The more trials, the closer the relative frequency tends to be to the theoretical probability."],
      space: SPACE_SIZES.LARGE,
      tags: ["probability", "theoretical", "experimental"]
    });
  }
  const n = choice([30, 60, 120]);
  const sixes = n / 6 + choice([-4, -3, 4, 6, 8]);
  return q({
    type: "theoretical-vs-experimental", marks: 2,
    prompt: `A fair die is rolled ${n} times and shows a six ${sixes} times. How many sixes would you expect in theory? Is this result surprising? Explain.`,
    answer: `Expected ${n / 6} sixes. Not very surprising — results vary by chance, and ${sixes} is close to ${n / 6} for only ${n} rolls.`,
    working: [`Expected = ${frac(1, 6).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")} × ${n} = ${n / 6}`, "Small experiments rarely match theory exactly."],
    space: SPACE_SIZES.MEDIUM,
    tags: ["probability", "theoretical", "experimental"]
  });
}

function expectedFrequencyQuestion() {
  const variant = choice(["die", "spinner", "given-p", "experiment"]);
  if (variant === "die") {
    const ev = choice(DIE_EVENTS);
    const fav = [1, 2, 3, 4, 5, 6].filter(ev.f).length;
    const n = choice([30, 60, 120, 300, 600]);
    return q({
      type: "expected-frequency", marks: 1,
      prompt: `A fair die is rolled ${n} times. How many times would you expect to roll ${ev.e}?`,
      answer: String(fav / 6 * n),
      working: [`P = ${fav}/6`, `Expected number = ${fav}/6 × ${n} = ${fav / 6 * n}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [String(fav), String(n / 6), String(n - fav / 6 * n)],
      tags: ["probability", "expected frequency"]
    });
  }
  if (variant === "spinner") {
    const k = choice([4, 5, 8, 10]);
    const n = randInt(1, k - 1);
    const spins = k * choice([10, 20, 25, 50]);
    const labels = shuffle([...Array(n).fill("Win"), ...Array(k - n).fill("Lose")]);
    return q({
      type: "expected-frequency", marks: 1,
      prompt: `The spinner is spun ${spins} times. How many times would you expect it to land on Win?`,
      diagram: prob({ diagramType: "spinner", labels, colour: false }),
      answer: String(n / k * spins),
      working: [`P(Win) = ${n}/${k}`, `${n}/${k} × ${spins} = ${n / k * spins}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [String(n), String(spins / k), String(spins - n / k * spins)],
      tags: ["probability", "expected frequency", "spinner"]
    });
  }
  if (variant === "given-p") {
    const pct = choice([5, 8, 12, 15, 20, 35]);
    const n = choice([200, 400, 500, 1000, 2500]);
    const item = choice([
      { one: "a light globe is faulty", many: "light globes", expect: "faulty globes" },
      { one: "a raffle ticket wins a prize", many: "tickets", expect: "winning tickets" },
      { one: "a seed fails to sprout", many: "seeds", expect: "seeds that fail to sprout" },
      { one: "a customer pays with cash", many: "customers", expect: "customers paying with cash" }
    ]);
    return q({
      type: "expected-frequency", marks: 1,
      prompt: `The probability that ${item.one} is ${pct}%. Out of ${spaced(n)} ${item.many}, how many ${item.expect} would you expect?`,
      answer: spaced(pct / 100 * n),
      working: [`${pct}% of ${spaced(n)} = ${pct / 100} × ${spaced(n)} = ${spaced(pct / 100 * n)}`],
      space: SPACE_SIZES.SMALL,
      tags: ["probability", "expected frequency"]
    });
  }
  const trials = choice([20, 40, 50]);
  const hits = randInt(3, trials - 3);
  const future = trials * choice([5, 10, 20]);
  const g = gcd(hits, trials);
  if ((hits * future) % trials) return expectedFrequencyQuestion();
  return q({
    type: "expected-frequency", marks: 2,
    prompt: `In ${trials} trials, a bottle top landed upside down ${hits} times. Use this to estimate how many times it would land upside down in ${future} trials.`,
    answer: String(hits * future / trials),
    working: [`Relative frequency = ${hits}/${trials}${g > 1 ? ` = ${hits / g}/${trials / g}` : ""}`, `Estimate = ${hits}/${trials} × ${future} = ${hits * future / trials}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["probability", "expected frequency", "relative frequency"]
  });
}

function notEquallyLikelyQuestion() {
  const variant = choice(["unequal-spinner", "unequal-spinner", "explain"]);
  if (variant === "explain") {
    const c = choice([
      { s: "Tom says: \"There are two outcomes when I play tennis against the world champion — win or lose — so my chance of winning is ½.\" Explain why Tom is wrong.", a: "The two outcomes are not equally likely; the champion is far more likely to win, so P(Tom wins) is much less than ½." },
      { s: "A spinner has one sector of 180° labelled A and two sectors of 90° labelled B and C. Mia says P(A) = ⅓. Explain her mistake and give the correct probability.", a: "The three sectors are not equal, so the outcomes are not equally likely. A takes up half the spinner, so P(A) = ½." },
      { s: "A bag has 5 red and 1 blue counter. Leo says red and blue are equally likely because there are two colours. Explain why he is wrong and give P(red).", a: "There are more red counters, so red is more likely. P(red) = 5/6." }
    ]);
    return q({ type: "not-equally-likely", marks: 2, prompt: c.s, answer: c.a, working: ["Probability = favourable ÷ total only works when every outcome is equally likely.", c.a], space: SPACE_SIZES.MEDIUM, tags: ["probability", "equally likely", "reasoning"] });
  }
  const opts = choice([
    { labels: ["A", "B", "C"], weights: [2, 1, 1] },
    { labels: ["A", "B", "C"], weights: [3, 2, 1] },
    { labels: ["A", "B"], weights: [3, 1] },
    { labels: ["A", "B", "C", "D"], weights: [3, 1, 1, 1] },
    { labels: ["A", "B", "C"], weights: [4, 3, 1] }
  ]);
  const total = opts.weights.reduce((s, v) => s + v, 0);
  const i = randInt(0, opts.labels.length - 1);
  const angle = opts.weights[i] / total * 360;
  return q({
    type: "not-equally-likely", marks: 2,
    prompt: `The sectors of this spinner are NOT all the same size. Sector ${opts.labels[i]} has an angle of ${angle}°. What is the probability of landing on ${opts.labels[i]}?`,
    diagram: prob({ diagramType: "spinner", labels: opts.labels, weights: opts.weights, colour: false }),
    answer: frac(angle, 360),
    working: ["The outcomes are not equally likely, so use the fraction of the whole turn.", `P(${opts.labels[i]}) = ${angle}/360 = ${frac(angle, 360).replace(/\[\[frac:(\d+):(\d+)\]\]/, "$1/$2")}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["probability", "equally likely", "spinner"]
  });
}

function multiPartProbabilityQuestion() {
  const counts = { red: randInt(2, 6), blue: randInt(2, 6), green: randInt(1, 5) };
  const total = counts.red + counts.blue + counts.green;
  const draws = total * choice([5, 10, 20]);
  return q({
    type: "multi-part-probability", marks: 4,
    prompt: "A counter is chosen at random from the bag and then replaced.",
    diagram: prob({ diagramType: "bag", counts }),
    subparts: [
      { label: "(a)", prompt: "Find P(red).", marks: 1, answer: frac(counts.red, total), working: [`${counts.red} of ${total}`] },
      { label: "(b)", prompt: "Find P(not green).", marks: 1, answer: frac(total - counts.green, total), working: [`1 − ${counts.green}/${total}`] },
      { label: "(c)", prompt: "Find P(yellow).", marks: 1, answer: "0", working: ["There are no yellow counters: the event is impossible."] },
      { label: "(d)", prompt: `This is done ${draws} times. How many blue counters would you expect?`, marks: 1, answer: String(counts.blue / total * draws), working: [`${counts.blue}/${total} × ${draws} = ${counts.blue / total * draws}`] }
    ],
    answer: `(a) ${frac(counts.red, total)}; (b) ${frac(total - counts.green, total)}; (c) 0; (d) ${counts.blue / total * draws}`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    tags: ["probability", "multi-part"]
  });
}

const GENERATORS = {
  "sample-space": sampleSpaceQuestion,
  "chance-language": chanceLanguageQuestion,
  "probability-scale": probabilityScaleQuestion,
  "die-probability": dieProbabilityQuestion,
  "spinner-probability": spinnerProbabilityQuestion,
  "bag-probability": bagProbabilityQuestion,
  "cards-letters": cardsLettersQuestion,
  "fraction-decimal-percent": fractionDecimalPercentQuestion,
  "sum-to-one": sumToOneQuestion,
  "complementary-events": complementaryEventsQuestion,
  "complement-calculate": complementCalculateQuestion,
  "relative-frequency": relativeFrequencyQuestion,
  "theoretical-vs-experimental": theoreticalVsExperimentalQuestion,
  "expected-frequency": expectedFrequencyQuestion,
  "not-equally-likely": notEquallyLikelyQuestion,
  "multi-part-probability": multiPartProbabilityQuestion
};

export function getProbabilityQuestionTypes() {
  return TYPE_LIST;
}

export function generateProbabilityQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
