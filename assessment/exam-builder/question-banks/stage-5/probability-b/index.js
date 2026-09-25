/*
  Mills Maths Tools — Stage 5 Question Bank: Probability B
  ---------------------------------------------------------
  question-banks/stage-5/probability-b/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-PRO-P-01 (Path):
    solves problems involving Venn diagrams, two-way tables and conditional
    probability.

  Content:
    - Venn diagrams with two and three sets: reading counts, completing a
      diagram from information, union, intersection, complement
    - "and", "or", "not", "only", "neither"; shading regions
    - two-way tables: completing and reading, converting to and from Venn
      diagrams
    - mutually exclusive events; the addition rule
      P(A or B) = P(A) + P(B) − P(A and B)
    - conditional probability P(A | B) from Venn diagrams and tables, and
      the language "given", "of those who", "if … then"

  Venn diagrams are drawn by the probability engine from the same region
  counts used in the answers.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry, gcd
} from "../../_shared/bank-helpers.js";

const TOPIC = "Probability B";

const TYPE_LIST = [
  { id: "read-venn", label: "Read a Venn diagram" },
  { id: "complete-venn", label: "Complete a Venn diagram from information" },
  { id: "venn-probability", label: "Probabilities from a Venn diagram" },
  { id: "shade-venn", label: "Describe or shade a Venn region" },
  { id: "three-set-venn", label: "Three-set Venn diagrams" },
  { id: "two-way-table", label: "Complete and read a two-way table" },
  { id: "table-to-venn", label: "Two-way tables and Venn diagrams" },
  { id: "addition-rule", label: "The addition rule" },
  { id: "mutually-exclusive", label: "Mutually exclusive events" },
  { id: "conditional-venn", label: "Conditional probability from a Venn diagram" },
  { id: "conditional-table", label: "Conditional probability from a table" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "probability", ...(spec.tags || [])] });
const prob = config => ({ engine: "probability-engine", config });
const fr = (n, d) => { if (n === 0) return "0"; const g = gcd(n, d); return d / g === 1 ? String(n / g) : `[[frac:${n / g}:${d / g}]]`; };

const PAIRS = [
  { A: "Soccer", B: "Tennis", who: "students", verbA: "play soccer", verbB: "play tennis" },
  { A: "Cat", B: "Dog", who: "families", verbA: "own a cat", verbB: "own a dog" },
  { A: "Maths", B: "Music", who: "students", verbA: "study Maths Extension", verbB: "study Music" },
  { A: "Tea", B: "Coffee", who: "people", verbA: "drink tea", verbB: "drink coffee" }
];

function vennCounts() { const only1 = randInt(4, 18); const only2 = randInt(4, 18); const both = randInt(2, 10); const none = randInt(1, 9); return { A: only1, B: only2, AB: both, none }; }
const totalOf = c => c.A + c.B + c.AB + c.none;

function readVennQuestion() {
  const P = choice(PAIRS); const c = vennCounts(); const T = totalOf(c);
  return q({
    type: "read-venn", marks: 3,
    prompt: `The Venn diagram shows ${T} ${P.who} and whether they ${P.verbA} or ${P.verbB}.`,
    diagram: prob({ diagramType: "venn", sets: [P.A, P.B], counts: c }),
    subparts: [
      { label: "(a)", prompt: `How many ${P.verbA} but not ${P.verbB.replace(/^\w+ /, "")}?`, marks: 1, answer: String(c.A), working: [] },
      { label: "(b)", prompt: `How many ${P.verbA} or ${P.verbB} (or both)?`, marks: 1, answer: String(c.A + c.B + c.AB), working: [`${c.A} + ${c.AB} + ${c.B}`] },
      { label: "(c)", prompt: "How many do neither?", marks: 1, answer: String(c.none), working: [] }
    ],
    answer: `(a) ${c.A}; (b) ${c.A + c.B + c.AB}; (c) ${c.none}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["Venn"]
  });
}

function completeVennQuestion() {
  const P = choice(PAIRS); const c = vennCounts(); const T = totalOf(c);
  const nA = c.A + c.AB; const nB = c.B + c.AB;
  return q({
    type: "complete-venn", marks: 3,
    prompt: `Of ${T} ${P.who}, ${nA} ${P.verbA}, ${nB} ${P.verbB} and ${c.AB} do both. Complete the Venn diagram.`,
    diagram: prob({ diagramType: "venn", sets: [P.A, P.B], counts: { A: null, B: null, AB: null, none: null } }),
    answer: `${P.A} only ${c.A}; both ${c.AB}; ${P.B} only ${c.B}; neither ${c.none}`,
    working: [`Both: ${c.AB}`, `${P.A} only: ${nA} − ${c.AB} = ${c.A}`, `${P.B} only: ${nB} − ${c.AB} = ${c.B}`, `Neither: ${T} − (${c.A} + ${c.AB} + ${c.B}) = ${c.none}`],
    space: "none",
    mcEligible: false,
    tags: ["Venn", "complete"]
  });
}

function vennProbabilityQuestion() {
  const P = choice(PAIRS); const c = vennCounts(); const T = totalOf(c);
  const asks = [
    [`P(${P.A} and ${P.B})`, c.AB], [`P(${P.A} or ${P.B})`, c.A + c.B + c.AB], [`P(${P.A} only)`, c.A], [`P(neither)`, c.none], [`P(not ${P.B})`, c.A + c.none], [`P(exactly one)`, c.A + c.B]
  ];
  const [txt, n] = choice(asks);
  return q({
    type: "venn-probability", marks: 1,
    prompt: `One of the ${T} ${P.who} in the Venn diagram is chosen at random. Find ${txt}.`,
    diagram: prob({ diagramType: "venn", sets: [P.A, P.B], counts: c }),
    answer: fr(n, T),
    working: [`${n} of the ${T} ${P.who}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: asks.filter(a => a[1] !== n).slice(0, 3).map(a => fr(a[1], T)),
    tags: ["Venn", "probability"]
  });
}

const REGIONS = [
  [["AB"], "A ∩ B (A and B)"], [["A", "B", "AB"], "A ∪ B (A or B)"], [["A"], "A only (A and not B)"], [["B", "none"], "not A (A′)"], [["none"], "neither A nor B"], [["A", "B"], "exactly one of A or B"]
];

function shadeVennQuestion() {
  const [regs, desc] = choice(REGIONS);
  const describe = Math.random() < 0.5;
  if (describe) {
    return q({ type: "shade-venn", marks: 1, prompt: "Describe the shaded region in words or set notation.", diagram: prob({ diagramType: "venn", sets: ["A", "B"], counts: {}, shade: regs }), answer: desc, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(REGIONS.filter(r => r[1] !== desc)).slice(0, 3).map(r => r[1]), tags: ["Venn", "notation"] });
  }
  return q({ type: "shade-venn", marks: 1, prompt: `Shade the region ${desc} on the Venn diagram.`, diagram: prob({ diagramType: "venn", sets: ["A", "B"], counts: {} }), answer: `Shade: ${regs.map(r => ({ AB: "the overlap", A: "A only", B: "B only", none: "outside both circles" }[r])).join(", ")}`, working: [], space: "none", mcEligible: false, tags: ["Venn", "notation"] });
}

function threeSetVennQuestion() {
  const c = { A: randInt(2, 9), B: randInt(2, 9), C: randInt(2, 9), AB: randInt(1, 5), AC: randInt(1, 5), BC: randInt(1, 5), ABC: randInt(1, 4), none: randInt(1, 6) };
  const T = Object.values(c).reduce((a, b) => a + b, 0);
  const sets = ["Art", "Band", "Coding"];
  const asks = [
    ["take all three", c.ABC], ["take Art and Band but not Coding", c.AB], ["take exactly one activity", c.A + c.B + c.C], ["take Coding", c.C + c.AC + c.BC + c.ABC], ["take at least two activities", c.AB + c.AC + c.BC + c.ABC]
  ];
  const [txt, n] = choice(asks);
  return q({
    type: "three-set-venn", marks: 2,
    prompt: `The Venn diagram shows the activities of ${T} students. A student is chosen at random. Find the probability that they ${txt}.`,
    diagram: prob({ diagramType: "venn", sets, counts: c }),
    answer: fr(n, T),
    working: [`${n} students out of ${T}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: asks.filter(a => a[1] !== n).slice(0, 3).map(a => fr(a[1], T)),
    tags: ["Venn", "three sets"]
  });
}

function tableCounts() { const a = randInt(5, 20); const b = randInt(5, 20); const c = randInt(5, 20); const d = randInt(5, 20); return { a, b, c, d }; }

function twoWayTableQuestion() {
  const t = tableCounts();
  const rows = [["", "Walk", "Other", "Total"], ["Year 7", String(t.a), "", String(t.a + t.b)], ["Year 8", "", String(t.d), ""], ["Total", String(t.a + t.c), "", String(t.a + t.b + t.c + t.d)]];
  const T = t.a + t.b + t.c + t.d;
  return q({
    type: "two-way-table", marks: 3,
    prompt: "The two-way table shows how Year 7 and Year 8 students travel to school.",
    table: { headerRow: true, rows },
    subparts: [
      { label: "(a)", prompt: "Complete the table.", marks: 2, answer: `Year 7 Other ${t.b}; Year 8 Walk ${t.c}; Year 8 total ${t.c + t.d}; Other total ${t.b + t.d}`, working: ["Each row and column must add to its total."] },
      { label: "(b)", prompt: "A student is chosen at random. Find P(Year 8 and walks).", marks: 1, answer: fr(t.c, T), working: [`${t.c}/${T}`] }
    ],
    answer: `(b) ${fr(t.c, T)}`,
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["two-way table"]
  });
}

function tableToVennQuestion() {
  const P = choice(PAIRS); const c = vennCounts();
  const rows = [["", P.B, `Not ${P.B}`, "Total"], [P.A, String(c.AB), String(c.A), String(c.AB + c.A)], [`Not ${P.A}`, String(c.B), String(c.none), String(c.B + c.none)], ["Total", String(c.AB + c.B), String(c.A + c.none), String(totalOf(c))]];
  return q({
    type: "table-to-venn", marks: 2,
    prompt: "Use the two-way table to complete the Venn diagram.",
    table: { headerRow: true, rows },
    diagram: prob({ diagramType: "venn", sets: [P.A, P.B], counts: { A: null, B: null, AB: null, none: null } }),
    answer: `${P.A} only ${c.A}; both ${c.AB}; ${P.B} only ${c.B}; neither ${c.none}`,
    working: [`"${P.A}" and "${P.B}" cell → overlap`, `"${P.A}" and "Not ${P.B}" → ${P.A} only`],
    space: "none",
    mcEligible: false,
    tags: ["two-way table", "Venn"]
  });
}

function additionRuleQuestion() {
  const v = choice(["find-or", "find-and"]);
  const d = choice([20, 25, 40, 50, 100]);
  const pA = randInt(Math.round(d * 0.2), Math.round(d * 0.6)); const pB = randInt(Math.round(d * 0.2), Math.round(d * 0.5)); const pAB = randInt(1, Math.min(pA, pB) - 1);
  if (pA + pB - pAB > d) return additionRuleQuestion();
  const f = n => fr(n, d);
  if (v === "find-or") return q({ type: "addition-rule", marks: 2, prompt: `P(A) = ${f(pA)}, P(B) = ${f(pB)} and P(A and B) = ${f(pAB)}. Find P(A or B).`, answer: f(pA + pB - pAB), working: ["P(A or B) = P(A) + P(B) − P(A and B)", `= ${f(pA + pB - pAB)}`], space: SPACE_SIZES.SMALL, mcDistractors: [f(pA + pB), f(pAB), f(pA + pB - 2 * pAB)].filter(x => x !== f(pA + pB - pAB)), tags: ["addition rule"] });
  return q({ type: "addition-rule", marks: 2, prompt: `P(A) = ${f(pA)}, P(B) = ${f(pB)} and P(A or B) = ${f(pA + pB - pAB)}. Find P(A and B).`, answer: f(pAB), working: ["P(A and B) = P(A) + P(B) − P(A or B)", `= ${f(pAB)}`], space: SPACE_SIZES.SMALL, mcDistractors: [f(Math.abs(pA - pB) || 1), f(pA + pB - pAB), f(Math.min(pA, pB))].filter(x => x !== f(pAB)), tags: ["addition rule"] });
}

const ME = [
  ["rolling a 2 and rolling an odd number on one die", true], ["drawing a king and drawing a heart from one card", false],
  ["a student being in Year 9 and being in Year 10", true], ["it raining today and it being cold today", false],
  ["getting a head and getting a tail on one toss", true], ["rolling an even number and rolling a number greater than 3", false]
];

function mutuallyExclusiveQuestion() {
  const [e, me] = choice(ME);
  return q({ type: "mutually-exclusive", marks: 1, prompt: `Are these events mutually exclusive? Explain: ${e}.`, answer: me ? "Yes: they cannot happen at the same time." : "No: both can happen at the same time.", working: [], space: SPACE_SIZES.SMALL, mcDistractors: [me ? "No: both can happen at the same time." : "Yes: they cannot happen at the same time."], tags: ["mutually exclusive"] });
}

function conditionalVennQuestion() {
  const P = choice(PAIRS); const c = vennCounts();
  const given = choice(["B", "A"]);
  const den = given === "B" ? c.B + c.AB : c.A + c.AB;
  return q({
    type: "conditional-venn", marks: 2,
    prompt: `A person from the Venn diagram is chosen at random. Given that they ${given === "B" ? P.verbB : P.verbA}, find the probability that they also ${given === "B" ? P.verbA : P.verbB}.`,
    diagram: prob({ diagramType: "venn", sets: [P.A, P.B], counts: c }),
    answer: fr(c.AB, den),
    working: [`Restrict to the ${den} who ${given === "B" ? P.verbB : P.verbA}`, `${c.AB} of them also ${given === "B" ? P.verbA : P.verbB}: ${c.AB}/${den}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [fr(c.AB, totalOf(c)), fr(c.AB, given === "B" ? c.A + c.AB : c.B + c.AB), fr(given === "B" ? c.B : c.A, den)].filter(x => x !== fr(c.AB, den)),
    tags: ["conditional"]
  });
}

function conditionalTableQuestion() {
  const t = tableCounts(); const T = t.a + t.b + t.c + t.d;
  const rows = [["", "Passed", "Failed", "Total"], ["Studied", String(t.a), String(t.b), String(t.a + t.b)], ["Did not study", String(t.c), String(t.d), String(t.c + t.d)], ["Total", String(t.a + t.c), String(t.b + t.d), String(T)]];
  const v = choice(["pass-given-study", "study-given-pass", "fail-given-not"]);
  const [num, den, txt] = v === "pass-given-study" ? [t.a, t.a + t.b, "passed, given that they studied"] : v === "study-given-pass" ? [t.a, t.a + t.c, "studied, given that they passed"] : [t.d, t.c + t.d, "failed, given that they did not study"];
  return q({
    type: "conditional-table", marks: 2,
    prompt: `A student is chosen at random. Use the table to find the probability that the student ${txt}.`,
    table: { headerRow: true, rows },
    answer: fr(num, den),
    working: [`Restrict to the ${den} students in the "given" group`, `${num}/${den}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [fr(num, T), fr(num, v === "pass-given-study" ? t.a + t.c : t.a + t.b), fr(den - num, den)].filter(x => x !== fr(num, den)),
    tags: ["conditional", "two-way table"]
  });
}

const GENERATORS = {
  "read-venn": readVennQuestion,
  "complete-venn": completeVennQuestion,
  "venn-probability": vennProbabilityQuestion,
  "shade-venn": shadeVennQuestion,
  "three-set-venn": threeSetVennQuestion,
  "two-way-table": twoWayTableQuestion,
  "table-to-venn": tableToVennQuestion,
  "addition-rule": additionRuleQuestion,
  "mutually-exclusive": mutuallyExclusiveQuestion,
  "conditional-venn": conditionalVennQuestion,
  "conditional-table": conditionalTableQuestion
};

export function getProbabilityBQuestionTypes() { return TYPE_LIST; }
export function generateProbabilityBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
