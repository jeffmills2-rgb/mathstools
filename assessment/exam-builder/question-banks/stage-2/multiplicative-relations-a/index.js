/*
  Mills Maths Tools — Stage 2 Question Bank: Multiplication and Division A
  -------------------------------------------------------------------------
  question-banks/stage-2/multiplicative-relations-a/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Multiplicative relations A" —
  MA2-MR-01 (the structure of multiplication to 10 × 10) and MA2-MR-02
  (number sentences with missing values).

  Big ideas:
    - multiplication counts EQUAL GROUPS: "4 groups of 5" is 4 × 5;
    - an ARRAY shows the same product both ways round (4 × 5 = 5 × 4);
    - division is the same structure with the total known: SHARING (how many
      in each group) or GROUPING (how many groups);
    - doubling links the facts: ×2 → ×4 → ×8.

  Facts in Part A: ×2, ×3, ×4, ×5, ×10 (Part B adds ×6 to ×9). Every type
  shows groups, an array or a number line first; the symbols come second.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, makeStage2, randInt, choice } from "../../_shared/stage2-helpers.js";

const TOPIC = "Multiplication and Division A";
const q = makeStage2(TOPIC, "MA2-MR-01");
const q2 = makeStage2(TOPIC, "MA2-MR-02");

const TYPE_LIST = [
  { id: "equal-groups", label: "Equal groups to multiplication" },
  { id: "are-groups-equal", label: "Are the groups equal?" },
  { id: "array-sentence", label: "Arrays and turnaround facts" },
  { id: "repeated-addition", label: "Repeated addition and multiplication" },
  { id: "skip-count-line", label: "Skip counting on a number line" },
  { id: "facts-a", label: "Facts for ×2, ×3, ×4, ×5, ×10" },
  { id: "doubling", label: "Double to multiply by 4 and 8" },
  { id: "share", label: "Division as sharing" },
  { id: "grouping", label: "Division as grouping" },
  { id: "multiply-divide-link", label: "Multiplication and division are linked" },
  { id: "missing-factor", label: "Missing numbers (× and ÷)" },
  { id: "groups-word-problem", label: "Equal groups word problems" },
  { id: "odd-even", label: "Odd and even numbers" }
];

const FACTS = [2, 3, 4, 5, 10];

function equalGroupsQuestion() {
  const g = randInt(2, 5); const e = randInt(3, 6);
  if (g === e) return equalGroupsQuestion();
  return q({
    type: "equal-groups", marks: 1,
    prompt: "How many groups? How many in each group? How many altogether?",
    diagram: mani({ diagramType: "groups", groups: g, each: e, item: choice(["dot", "star"]) }),
    answer: `${g} groups of ${e}: ${g} × ${e} = ${g * e}`,
    working: [`${g} groups, ${e} in each group`, `${g} × ${e} = ${g * e}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${e} groups of ${g}: ${e} × ${g} = ${g * e + 1}`, `${g} groups of ${e}: ${g} × ${e} = ${g + e}`],
    tags: ["equal groups"]
  });
}

function areGroupsEqualQuestion() {
  const g = randInt(3, 4); const e = randInt(3, 5); const equal = Math.random() < 0.5;
  const sizes = Array.from({ length: g }, () => e); if (!equal) sizes[randInt(0, g - 1)] += choice([-1, 1]);
  return q({
    type: "are-groups-equal", marks: 1,
    prompt: `Can we write ${g} × ${e} for this picture? Why?`,
    diagram: mani({ diagramType: "groups", sizes }),
    answer: equal ? `Yes. There are ${g} equal groups of ${e}.` : "No. The groups are not equal.",
    working: ["Multiplication needs equal groups."],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [equal ? "No. The groups are not equal." : `Yes. There are ${g} equal groups of ${e}.`],
    tags: ["equal groups"]
  });
}

function arraySentenceQuestion() {
  const r = randInt(2, 5); const c = randInt(3, 8);
  if (Math.random() < 0.5) {
    return q({ type: "array-sentence", marks: 1, prompt: "Write a multiplication for this array.", diagram: mani({ diagramType: "array", rows: r, cols: c }), answer: `${r} × ${c} = ${r * c} (or ${c} × ${r} = ${r * c})`, working: [`${r} rows of ${c}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${r} + ${c} = ${r + c}`, `${r} × ${c} = ${r * c + c}`], tags: ["array"] });
  }
  return q({ type: "array-sentence", marks: 1, prompt: `This array shows ${r} × ${c} = ${r * c}. Turn it around. What is ${c} × ${r}?`, diagram: mani({ diagramType: "array", rows: r, cols: c, showDims: true }), answer: String(r * c), working: ["Turning the array does not change how many dots there are."], space: SPACE_SIZES.SMALL, mcDistractors: [String(r * c + 1), String(c * c), String(r + c)], tags: ["array", "commutative"] });
}

function repeatedAdditionQuestion() {
  const e = choice(FACTS); const g = randInt(2, 6);
  if (Math.random() < 0.5) return q({ type: "repeated-addition", marks: 1, prompt: `Write as a multiplication: ${Array(g).fill(e).join(" + ")}`, answer: `${g} × ${e} = ${g * e}`, working: [`${g} lots of ${e}`], space: SPACE_SIZES.SMALL, mcDistractors: [`${e} + ${g} = ${e + g}`, `${g} × ${e} = ${g * e + e}`], tags: ["repeated addition"] });
  return q({ type: "repeated-addition", marks: 1, prompt: `Write ${g} × ${e} as a repeated addition. What is the answer?`, answer: `${Array(g).fill(e).join(" + ")} = ${g * e}`, working: [`${g} groups of ${e}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["repeated addition"] });
}

function skipCountLineQuestion() {
  const s = choice([2, 3, 4, 5, 10]); const n = randInt(3, 6);
  const max = s * (n + 1 + (s <= 3 ? 2 : 0));
  const hops = Array.from({ length: n }, (_, i) => ({ from: i * s, to: (i + 1) * s, label: i === 0 ? `+${s}` : undefined }));
  return q({
    type: "skip-count-line", marks: 1,
    prompt: `The frog jumps ${n} times. Each jump is ${s}. Where does it land? Write the multiplication.`,
    diagram: mani({ diagramType: "number-line", min: 0, max, step: s === 10 ? 5 : 1, majorEvery: s === 10 ? 2 : s <= 5 ? s : 1, labels: Array.from({ length: max / s + 1 }, (_, i) => i * s), hops }),
    answer: `${n} × ${s} = ${n * s}`,
    working: [`Count by ${s}s: ${Array.from({ length: n }, (_, i) => (i + 1) * s).join(", ")}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${n} × ${s} = ${(n + 1) * s}`, `${n} + ${s} = ${n + s}`],
    tags: ["skip counting", "number line"]
  });
}

function factsAQuestion() {
  const a = choice(FACTS); const b = randInt(1, 10);
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
  return q({ type: "facts-a", marks: 1, prompt: `${x} × ${y} = ☐`, answer: String(x * y), working: [a === 5 ? `Count by 5s ${b} times.` : a === 10 ? `${b} tens = ${b * 10}` : a === 4 ? `Double ${b}, then double again: ${b * 2}, ${b * 4}` : `Count by ${a}s.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(x * y + a), String(x * y - a), String(x + y)].filter(s => Number(s) > 0 && s !== String(x * y)), tags: ["facts"] });
}

function doublingQuestion() {
  const b = randInt(3, 10); const v = choice([4, 8]);
  return q({
    type: "doubling", marks: 1,
    prompt: v === 4 ? `2 × ${b} = ${2 * b}. Double it. What is 4 × ${b}?` : `4 × ${b} = ${4 * b}. Double it. What is 8 × ${b}?`,
    diagram: mani({ diagramType: "array", rows: v === 4 ? 4 : 8, cols: b, split: undefined, gap: v === 8 ? 22 : 30 }),
    answer: String(v * b),
    working: [v === 4 ? `${2 * b} + ${2 * b} = ${4 * b}` : `${4 * b} + ${4 * b} = ${8 * b}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(v * b + b), String(v * b - b), String(v + b)],
    tags: ["doubling"]
  });
}

function shareQuestion() {
  const g = randInt(2, 5); const e = randInt(2, 6); const total = g * e;
  const thing = choice(["apples", "cards", "shells", "pencils"]);
  return q({
    type: "share", marks: 1,
    prompt: `Share ${total} ${thing} equally into ${g} bags. How many in each bag?`,
    diagram: mani({ diagramType: "groups", sizes: Array(g).fill(0) }),
    answer: `${e} (${total} ÷ ${g} = ${e})`,
    working: [`Deal them out one at a time. Each bag gets ${e}.`, `${total} ÷ ${g} = ${e}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${e + 1} (${total} ÷ ${g} = ${e + 1})`, `${g} (${total} ÷ ${e} = ${g})`].filter(s => !s.startsWith(`${e} `)),
    tags: ["sharing", "division"]
  });
}

function groupingQuestion() {
  const e = choice([2, 3, 4, 5]); const g = randInt(2, 6); const total = e * g;
  return q({
    type: "grouping", marks: 1,
    prompt: `There are ${total} dots. Put them in groups of ${e}. How many groups?`,
    diagram: mani({ diagramType: "array", rows: Math.ceil(total / 10), cols: Math.min(total, 10), count: total }),
    answer: `${g} groups (${total} ÷ ${e} = ${g})`,
    working: [`Count by ${e}s to ${total}: ${Array.from({ length: g }, (_, i) => (i + 1) * e).join(", ")} — that is ${g} groups.`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${g + 1} groups (${total} ÷ ${e} = ${g + 1})`, `${e} groups (${total} ÷ ${g} = ${e})`].filter(s => !s.startsWith(`${g} `)),
    tags: ["grouping", "division"]
  });
}

function multiplyDivideLinkQuestion() {
  const a = choice(FACTS); const b = randInt(2, 10); const p = a * b;
  return q2({
    type: "multiply-divide-link", marks: 1,
    prompt: `${a} × ${b} = ${p}. So what is ${p} ÷ ${a}?`,
    diagram: mani({ diagramType: "array", rows: Math.min(a, b), cols: Math.max(a, b), gap: 24 }),
    answer: String(b),
    working: [`Division undoes multiplication: ${p} ÷ ${a} = ${b}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(a), String(p - a), String(b + 1)].filter(s => s !== String(b)),
    tags: ["inverse"]
  });
}

function missingFactorQuestion() {
  const a = choice(FACTS); const b = randInt(2, 10); const p = a * b;
  const forms = [[`${a} × ☐ = ${p}`, b], [`☐ × ${b} = ${p}`, a], [`${p} ÷ ☐ = ${b}`, a], [`☐ ÷ ${a} = ${b}`, p]];
  const [s, ans] = choice(forms);
  return q2({ type: "missing-factor", marks: 1, prompt: `What number goes in the box? ${s}`, answer: String(ans), working: [s.includes("÷") && s.startsWith("☐") ? `${a} × ${b} = ${p}` : `Think: ${a} × ${b} = ${p}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(ans + 1), String(p + a), String(Math.abs(p - a))].filter(v => v !== String(ans) && v !== "0"), tags: ["missing number"] });
}

const WP = [
  (g, e) => [`${g} children each have ${e} stickers. How many stickers altogether?`, g * e],
  (g, e) => [`A packet holds ${e} biscuits. How many biscuits in ${g} packets?`, g * e],
  (g, e) => [`${g * e} chairs are put in ${g} equal rows. How many chairs in each row?`, e],
  (g, e) => [`${g * e} eggs go into boxes of ${e}. How many boxes?`, g]
];

function groupsWordProblemQuestion() {
  const e = choice([2, 3, 4, 5, 10]); const g = randInt(2, 8);
  const pick = choice(WP);
  const [text, ans] = pick(g, e);
  const mult = text.includes("altogether") || text.includes("How many biscuits");
  return q({
    type: "groups-word-problem", marks: 2,
    prompt: text,
    answer: String(ans),
    working: [mult ? `${g} × ${e} = ${g * e}` : `${g * e} ÷ ${ans === e ? g : e} = ${ans}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(g + e), String(ans + (mult ? e : 1)), String(mult ? g * e - e : g * e)].filter(s => s !== String(ans)),
    tags: ["word problem"]
  });
}

function oddEvenQuestion() {
  const v = choice(["which", "product"]);
  if (v === "which") {
    const n = randInt(11, 99);
    return q({ type: "odd-even", marks: 1, prompt: `Is ${n} odd or even? How do you know?`, answer: n % 2 ? `Odd — it ends in ${n % 10}, so it cannot be shared into 2 equal groups.` : `Even — it ends in ${n % 10}, so it shares into 2 equal groups.`, working: ["Even numbers end in 0, 2, 4, 6 or 8."], space: SPACE_SIZES.SMALL, mcDistractors: [n % 2 ? `Even — it ends in ${n % 10}, so it shares into 2 equal groups.` : `Odd — it ends in ${n % 10}, so it cannot be shared into 2 equal groups.`], tags: ["odd and even"] });
  }
  const a = randInt(2, 9); const b = randInt(2, 9);
  return q({ type: "odd-even", marks: 1, prompt: `Without working it out, is ${a} × ${b} odd or even?`, answer: (a * b) % 2 ? "Odd (odd × odd is odd)" : "Even (anything × an even number is even)", working: [`${a} × ${b} = ${a * b}`], space: SPACE_SIZES.SMALL, mcDistractors: [(a * b) % 2 ? "Even (anything × an even number is even)" : "Odd (odd × odd is odd)"], tags: ["odd and even"] });
}

const GENERATORS = {
  "equal-groups": equalGroupsQuestion,
  "are-groups-equal": areGroupsEqualQuestion,
  "array-sentence": arraySentenceQuestion,
  "repeated-addition": repeatedAdditionQuestion,
  "skip-count-line": skipCountLineQuestion,
  "facts-a": factsAQuestion,
  "doubling": doublingQuestion,
  "share": shareQuestion,
  "grouping": groupingQuestion,
  "multiply-divide-link": multiplyDivideLinkQuestion,
  "missing-factor": missingFactorQuestion,
  "groups-word-problem": groupsWordProblemQuestion,
  "odd-even": oddEvenQuestion
};

export function getMultiplicativeRelationsAQuestionTypes() { return TYPE_LIST; }
export function generateMultiplicativeRelationsAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
