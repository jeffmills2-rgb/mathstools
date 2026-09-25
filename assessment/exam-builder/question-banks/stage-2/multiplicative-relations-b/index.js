/*
  Mills Maths Tools — Stage 2 Question Bank: Multiplication and Division B
  -------------------------------------------------------------------------
  question-banks/stage-2/multiplicative-relations-b/index.js

  NSW Mathematics K–10 (2022), Stage 2, "Multiplicative relations B" —
  MA2-MR-01 and MA2-MR-02.

  Big ideas:
    - all facts to 10 × 10 are built from facts we already know: ×6 is ×5 and
      one more group, ×9 is ×10 take one group, ×8 is double ×4;
    - SPLIT AN ARRAY (the distributive property) — 7 × 6 = 5 × 6 + 2 × 6 —
      which becomes the area model for 2-digit × 1-digit;
    - division can leave a REMAINDER: the objects that don't make a full group;
    - multiples are the numbers in a count-by pattern.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, sp, makeStage2, randInt, choice } from "../../_shared/stage2-helpers.js";

const TOPIC = "Multiplication and Division B";
const q = makeStage2(TOPIC, "MA2-MR-01");
const q2 = makeStage2(TOPIC, "MA2-MR-02");
const aa = config => ({ engine: "array-area-engine", config });

const TYPE_LIST = [
  { id: "facts-b", label: "Facts for ×6, ×7, ×8, ×9" },
  { id: "build-from-known", label: "Use a known fact (×5 + 1 group, ×10 − 1 group)" },
  { id: "split-array", label: "Split an array" },
  { id: "area-model-2x1", label: "Area model: 2-digit × 1-digit" },
  { id: "multiply-tens", label: "Multiply by multiples of 10" },
  { id: "division-facts", label: "Division facts" },
  { id: "remainders-groups", label: "Division with remainders (picture)" },
  { id: "remainder-problem", label: "What to do with the remainder" },
  { id: "multiples", label: "Multiples on a hundred chart" },
  { id: "missing-numbers-b", label: "Missing numbers (× and ÷)" },
  { id: "equal-sentences", label: "Balanced number sentences" },
  { id: "word-problems-b", label: "Multiplication and division problems" }
];

function factsBQuestion() {
  const a = randInt(6, 9); const b = randInt(2, 10);
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
  const hint = a === 6 ? `5 × ${b} = ${5 * b}, add one more ${b}` : a === 9 ? `10 × ${b} = ${10 * b}, take away one ${b}` : a === 8 ? `Double 4 × ${b} = ${4 * b}` : `5 × ${b} + 2 × ${b} = ${5 * b} + ${2 * b}`;
  return q({ type: "facts-b", marks: 1, prompt: `${x} × ${y} = ☐`, answer: String(x * y), working: [hint, `= ${x * y}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(x * y + b), String(x * y - b), String((a - 1) * (b + 1))], tags: ["facts"] });
}

function buildFromKnownQuestion() {
  const b = randInt(3, 6); const v = choice([6, 9]);
  if (v === 6) return q({ type: "build-from-known", marks: 1, prompt: `5 × ${b} = ${5 * b}. Use this to find 6 × ${b}.`, diagram: mani({ diagramType: "array", rows: b, cols: 6, split: 5, gap: 26 }), answer: String(6 * b), working: [`6 groups is 5 groups and 1 more group.`, `${5 * b} + ${b} = ${6 * b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(5 * b + 1), String(6 * b + b), String(5 * b + 6)], tags: ["known facts"] });
  return q({ type: "build-from-known", marks: 1, prompt: `10 × ${b} = ${10 * b}. Use this to find 9 × ${b}.`, answer: String(9 * b), working: [`9 groups is 10 groups take away 1 group.`, `${10 * b} − ${b} = ${9 * b}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(10 * b - 1), String(10 * b - 9), String(9 * b + b)], tags: ["known facts"] });
}

function splitArrayQuestion() {
  const rows = randInt(6, 9); const cols = randInt(3, 7); const k = 5;
  return q({
    type: "split-array", marks: 2,
    prompt: `The ${rows} × ${cols} array is split into two parts. Fill in: ${k} × ${cols} + ${rows - k} × ${cols} = ☐ + ☐ = ☐`,
    diagram: mani({ diagramType: "array", rows: cols, cols: rows, split: k, gap: 26 }),
    answer: `${k * cols} + ${(rows - k) * cols} = ${rows * cols}`,
    working: [`${k} × ${cols} = ${k * cols}`, `${rows - k} × ${cols} = ${(rows - k) * cols}`, `So ${rows} × ${cols} = ${rows * cols}`],
    space: SPACE_SIZES.MEDIUM, mcEligible: false,
    tags: ["split array", "distributive"]
  });
}

function areaModel2x1Question() {
  const t = randInt(1, 4) * 10; const o = randInt(1, 9); const m = randInt(3, 8); const n = t + o;
  const blank = Math.random() < 0.5;
  return q({
    type: "area-model-2x1", marks: 2,
    prompt: blank ? `Fill in the area model to find ${m} × ${n}.` : `Use the area model to find ${m} × ${n}.`,
    diagram: aa({ diagramType: "area-model", columnParts: [t, o], rowParts: [m], columnLabels: [String(t), String(o)], rowLabels: [String(m)], cells: [blank ? [null, null] : [String(m * t), String(m * o)]], total: null }),
    answer: String(m * n),
    working: [`${m} × ${t} = ${m * t}`, `${m} × ${o} = ${m * o}`, `${m * t} + ${m * o} = ${m * n}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [String(m * t + o), String(m * t + m * o + 10), String(m * (t / 10) + m * o)],
    tags: ["area model", "partitioning"]
  });
}

function multiplyTensQuestion() {
  const a = randInt(2, 9); const b = randInt(2, 9);
  if (Math.random() < 0.5) return q({ type: "multiply-tens", marks: 1, prompt: `${a} × ${b} tens = ☐ tens = ☐`, answer: `${a * b} tens = ${sp(a * b * 10)}`, working: [`${a} × ${b} = ${a * b}`, `${a * b} tens = ${a * b * 10}`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["place value"] });
  return q({ type: "multiply-tens", marks: 1, prompt: `${a} × ${b} = ${a * b}. Use this to find ${a} × ${b * 10}.`, answer: sp(a * b * 10), working: [`${a} × ${b} tens = ${a * b} tens = ${a * b * 10}`], space: SPACE_SIZES.SMALL, mcDistractors: [sp(a * b), sp(a * b * 100), sp(a * b + 10)], tags: ["place value"] });
}

function divisionFactsQuestion() {
  const d = randInt(2, 9); const qt = randInt(2, 10); const p = d * qt;
  return q({ type: "division-facts", marks: 1, prompt: `${p} ÷ ${d} = ☐`, answer: String(qt), working: [`Think: ${d} × ☐ = ${p}`, `${d} × ${qt} = ${p}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(qt + 1), String(qt - 1), String(p - d)].filter(v => Number(v) > 0), tags: ["division facts"] });
}

function remaindersGroupsQuestion() {
  const e = randInt(3, 5); const g = randInt(2, 4); const r = randInt(1, e - 1); const total = e * g + r;
  return q({
    type: "remainders-groups", marks: 1,
    prompt: `${total} dots are put into rows of ${e}. How many full rows? How many are left over?`,
    diagram: mani({ diagramType: "array", rows: g + 1, cols: e, count: total, gap: 30 }),
    answer: `${g} rows, ${r} left over (${total} ÷ ${e} = ${g} remainder ${r})`,
    working: [`${g} × ${e} = ${g * e}`, `${total} − ${g * e} = ${r} left over`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${g + 1} rows, 0 left over (${total} ÷ ${e} = ${g + 1})`, `${g} rows, ${e - r} left over (${total} ÷ ${e} = ${g} remainder ${e - r})`],
    tags: ["remainder"]
  });
}

function remainderProblemQuestion() {
  const e = choice([4, 5, 6]); const g = randInt(3, 6); const r = randInt(1, e - 1); const total = e * g + r;
  const v = choice(["up", "down"]);
  if (v === "up") return q({ type: "remainder-problem", marks: 2, prompt: `${total} children are going on a trip. Each car holds ${e} children. How many cars are needed?`, answer: `${g + 1} cars`, working: [`${total} ÷ ${e} = ${g} remainder ${r}`, `The ${r} left over still need a car, so ${g + 1} cars.`], space: SPACE_SIZES.SMALL, mcDistractors: [`${g} cars`, `${r} cars`, `${g + r} cars`], tags: ["remainder", "word problem"] });
  return q({ type: "remainder-problem", marks: 2, prompt: `A baker has ${total} muffins. A box holds ${e} muffins. How many boxes can be filled?`, answer: `${g} boxes`, working: [`${total} ÷ ${e} = ${g} remainder ${r}`, `Only full boxes count, so ${g} boxes (${r} muffins left).`], space: SPACE_SIZES.SMALL, mcDistractors: [`${g + 1} boxes`, `${r} boxes`, `${g + r} boxes`], tags: ["remainder", "word problem"] });
}

function multiplesQuestion() {
  const k = choice([3, 4, 6, 7, 8, 9]); const to = 60;
  const shade = Array.from({ length: Math.floor(to / k) }, (_, i) => (i + 1) * k);
  const v = choice(["name", "next"]);
  if (v === "name") return q({ type: "multiples", marks: 1, prompt: "The shaded numbers are the multiples of which number?", diagram: aa({ diagramType: "number-grid", from: 1, to, columns: 10, shade }), answer: String(k), working: [`${shade.slice(0, 4).join(", ")}, … go up by ${k}.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(k + 1), String(k * 2), String(k - 1)], tags: ["multiples"] });
  const n = randInt(3, 8);
  return q({ type: "multiples", marks: 1, prompt: `List the first ${n} multiples of ${k}.`, answer: Array.from({ length: n }, (_, i) => (i + 1) * k).join(", "), working: [`Count by ${k}s.`], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["multiples"] });
}

function missingNumbersBQuestion() {
  const a = randInt(6, 9); const b = randInt(2, 10); const p = a * b;
  const [s, ans] = choice([[`${a} × ☐ = ${p}`, b], [`☐ × ${b} = ${p}`, a], [`${p} ÷ ☐ = ${b}`, a], [`☐ ÷ ${a} = ${b}`, p]]);
  return q2({ type: "missing-numbers-b", marks: 1, prompt: `What number goes in the box?  ${s}`, answer: String(ans), working: [`${a} × ${b} = ${p}`], space: SPACE_SIZES.SMALL, mcDistractors: [String(ans + 1), String(p - a), String(ans * 2)], tags: ["missing number"] });
}

function equalSentencesQuestion() {
  const a = randInt(2, 6); const b = randInt(2, 6) * 2;
  const v = choice(["half", "turn"]);
  if (v === "turn") return q2({ type: "equal-sentences", marks: 1, prompt: `${a} × ${b} = ${b} × ☐`, diagram: mani({ diagramType: "balance", left: `${a} × ${b}`, right: `${b} × ☐` }), answer: String(a), working: ["Turning an array around keeps the same total."], space: SPACE_SIZES.SMALL, mcDistractors: [String(b), String(a * b), String(a + 1)], tags: ["equivalence"] });
  return q2({ type: "equal-sentences", marks: 1, prompt: `${a} × ${b} = ${2 * a} × ☐`, diagram: mani({ diagramType: "balance", left: `${a} × ${b}`, right: `${2 * a} × ☐` }), answer: String(b / 2), working: [`${a} × ${b} = ${a * b}`, `${2 * a} × ${b / 2} = ${a * b}`, "Double one number, halve the other."], space: SPACE_SIZES.SMALL, mcDistractors: [String(b), String(b * 2), String(b / 2 + 1)], tags: ["equivalence"] });
}

const WPB = [
  (a, b) => [`There are ${a} rows of chairs with ${b} chairs in each row. How many chairs?`, a * b, `${a} × ${b} = ${a * b}`],
  (a, b) => [`${a * b} cards are shared equally between ${a} players. How many cards does each player get?`, b, `${a * b} ÷ ${a} = ${b}`],
  (a, b) => [`A spider has 8 legs. How many legs do ${b} spiders have?`, 8 * b, `${b} × 8 = ${8 * b}`],
  (a, b) => [`Pencils cost ${a} dollars a pack. How much do ${b} packs cost?`, `$${a * b}`, `${b} × $${a} = $${a * b}`],
  (a, b) => [`${a * b} students make teams of ${b}. How many teams?`, a, `${a * b} ÷ ${b} = ${a}`]
];

function wordProblemsBQuestion() {
  const a = randInt(3, 9); const b = randInt(3, 9);
  const [text, ans, work] = choice(WPB)(a, b);
  const ansNum = Number(String(ans).replace("$", ""));
  const pre = String(ans).startsWith("$") ? "$" : "";
  return q({ type: "word-problems-b", marks: 2, prompt: text, answer: String(ans), working: [work], space: SPACE_SIZES.SMALL, mcDistractors: [`${pre}${ansNum + a}`, `${pre}${a + b}`, `${pre}${Math.abs(ansNum - b) || ansNum + 1}`], tags: ["word problem"] });
}

const GENERATORS = {
  "facts-b": factsBQuestion,
  "build-from-known": buildFromKnownQuestion,
  "split-array": splitArrayQuestion,
  "area-model-2x1": areaModel2x1Question,
  "multiply-tens": multiplyTensQuestion,
  "division-facts": divisionFactsQuestion,
  "remainders-groups": remaindersGroupsQuestion,
  "remainder-problem": remainderProblemQuestion,
  "multiples": multiplesQuestion,
  "missing-numbers-b": missingNumbersBQuestion,
  "equal-sentences": equalSentencesQuestion,
  "word-problems-b": wordProblemsBQuestion
};

export function getMultiplicativeRelationsBQuestionTypes() { return TYPE_LIST; }
export function generateMultiplicativeRelationsBQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
