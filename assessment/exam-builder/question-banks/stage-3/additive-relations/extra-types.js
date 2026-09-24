/*
  Mills Maths Tools — Stage 3 Additive Relations: bar models
  ------------------------------------------------------------
  question-banks/stage-3/additive-relations/extra-types.js

  MA3-AR-01 is about choosing a strategy for an addition or subtraction
  problem, and the bar model is how students are taught to see the problem's
  STRUCTURE before choosing: part–part–whole for "altogether" and "how many
  more to make", two bars for "how many more than". The original bank's word
  problems are prose only; these put the model beside the words:

    - part–whole with an unknown total
    - part–whole with an unknown part (subtraction as the missing part)
    - comparison with an unknown difference
    - comparison with an unknown larger amount
    - decimals and money in the same models
    - draw your own bar model and solve (no model given)

  Bars come from engines/bar-model/bar-model-engine.js with widths in
  proportion to the numbers; an unknown is an empty box.
*/

import {
  SPACE_SIZES, randInt, choice, makeQuestion, spaced
} from "../../_shared/bank-helpers.js";

const TOPIC = "Additive Relations";
const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage3", ...(spec.tags || [])] });
const bar = config => ({ engine: "bar-model-engine", config });
const money = v => `$${spaced(Math.floor(v))}.${String(Math.round((v % 1) * 100)).padStart(2, "0")}`;

export const EXTRA_AR_TYPES = [
  { id: "bar-model-total", label: "Bar model: find the total" },
  { id: "bar-model-part", label: "Bar model: find the missing part" },
  { id: "bar-model-compare", label: "Bar model: how many more?" },
  { id: "bar-model-decimals", label: "Bar model with money and decimals" },
  { id: "bar-model-draw", label: "Draw a bar model and solve" }
];

const PEOPLE = ["Ava", "Noah", "Mia", "Leo", "Zoe", "Kai", "Isla", "Eli"];

function barModelTotalQuestion() {
  const a = randInt(1200, 8999); const b = randInt(800, 6999); const c = Math.random() < 0.4 ? randInt(300, 2999) : null;
  const parts = c ? [a, b, c] : [a, b];
  const total = parts.reduce((s, x) => s + x, 0);
  const ctx = choice([
    { lead: "A school raised", names: ["in Term 1", "in Term 2", "in Term 3"], ask: "How many dollars did it raise altogether?", f: v => `$${spaced(v)}` },
    { lead: "A library lent", names: ["books in May", "books in June", "books in July"], ask: "How many books did it lend altogether?", f: v => spaced(v) },
    { lead: "A stadium sold", names: ["adult tickets", "child tickets", "concession tickets"], ask: "How many tickets were sold altogether?", f: v => spaced(v) }
  ]);
  const words = parts.map((p, i) => `${ctx.f(p)} ${ctx.names[i]}`);
  return q({
    type: "bar-model-total", marks: 2,
    prompt: `${ctx.lead} ${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}. ${ctx.ask} The bar model shows the problem.`,
    diagram: bar({ diagramType: "part-whole", parts: parts.map(p => ({ value: p, label: ctx.f(p) })), total: null }),
    answer: ctx.f(total),
    working: ["The whole is unknown, so add the parts.", `${parts.map(spaced).join(" + ")} = ${spaced(total)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [ctx.f(total + 1000), ctx.f(total - 100), ctx.f(Math.abs(a - b)), ctx.f(total + 10)],
    tags: ["bar model", "addition", "word problem"]
  });
}

function barModelPartQuestion() {
  const total = randInt(30, 99) * 100 + randInt(0, 99);
  const known = randInt(Math.round(total * 0.3), Math.round(total * 0.7));
  const missing = total - known;
  const who = choice(PEOPLE);
  const ctx = choice([
    [`${who} is saving for a bike that costs $${spaced(total)}. So far ${who} has saved $${spaced(known)}.`, "How much more does " + who + " need to save?", "$"],
    [`A farm has ${spaced(total)} sheep. ${spaced(known)} are in the top paddock and the rest are in the bottom paddock.`, "How many sheep are in the bottom paddock?", ""],
    [`A car trip is ${spaced(total)} km. The family has driven ${spaced(known)} km so far.`, "How far do they still have to drive?", "km"]
  ]);
  const fmtA = v => (ctx[2] === "$" ? `$${spaced(v)}` : ctx[2] === "km" ? `${spaced(v)} km` : spaced(v));
  return q({
    type: "bar-model-part", marks: 2,
    prompt: `${ctx[0]} ${ctx[1]}`,
    diagram: bar({ diagramType: "part-whole", parts: [{ value: known, label: fmtA(known) }, { value: missing, label: null }], total: fmtA(total) }),
    answer: fmtA(missing),
    working: ["The whole and one part are known: subtract (or count up) to find the other part.", `${spaced(total)} − ${spaced(known)} = ${spaced(missing)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [fmtA(total + known), fmtA(missing + 100), fmtA(missing - 10), fmtA(Math.abs(missing - 1000))],
    tags: ["bar model", "subtraction", "word problem"]
  });
}

function barModelCompareQuestion() {
  const big = randInt(2000, 9999); const small = randInt(800, big - 300);
  const [p1, p2] = [choice(PEOPLE), choice(PEOPLE)];
  if (p1 === p2) return barModelCompareQuestion();
  const findLarger = Math.random() < 0.35;
  const [unit, verb] = choice([["steps", "walked"], ["points", "scored"], ["metres", "swam"]]);
  if (findLarger) {
    return q({
      type: "bar-model-compare", marks: 2,
      prompt: `${p2} ${verb} ${spaced(small)} ${unit}. ${p1} ${verb} ${spaced(big - small)} ${unit} more than ${p2}. How many ${unit} did ${p1} ${{ walked: "walk", scored: "score", swam: "swim" }[verb]}?`,
      diagram: bar({ diagramType: "compare", rows: [{ name: p1, value: big, label: null }, { name: p2, value: small, label: spaced(small) }], difference: spaced(big - small) }),
      answer: `${spaced(big)} ${unit}`,
      working: [`${p1}'s bar is ${p2}'s bar plus the extra.`, `${spaced(small)} + ${spaced(big - small)} = ${spaced(big)}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${spaced(small - (big - small) > 0 ? small - (big - small) : small)} ${unit}`, `${spaced(big + 100)} ${unit}`, `${spaced(big - small)} ${unit}`],
      tags: ["bar model", "comparison", "word problem"]
    });
  }
  return q({
    type: "bar-model-compare", marks: 2,
    prompt: `${p1} ${verb} ${spaced(big)} ${unit} and ${p2} ${verb} ${spaced(small)} ${unit}. How many more ${unit} did ${p1} ${{ walked: "walk", scored: "score", swam: "swim" }[verb]} than ${p2}?`,
    diagram: bar({ diagramType: "compare", rows: [{ name: p1, value: big, label: spaced(big) }, { name: p2, value: small, label: spaced(small) }], difference: null }),
    answer: `${spaced(big - small)} ${unit}`,
    working: ["\"How many more\" is the gap between the bars: find the difference.", `${spaced(big)} − ${spaced(small)} = ${spaced(big - small)}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`${spaced(big + small)} ${unit}`, `${spaced(big - small + 100)} ${unit}`, `${spaced(big - small - 10)} ${unit}`],
    tags: ["bar model", "comparison", "word problem"]
  });
}

function barModelDecimalsQuestion() {
  const a = randInt(1200, 4999) / 100; const b = randInt(500, 2999) / 100;
  const paid = choice([50, 100]);
  const total = Math.round((a + b) * 100) / 100;
  if (total >= paid) return barModelDecimalsQuestion();
  const change = Math.round((paid - total) * 100) / 100;
  return q({
    type: "bar-model-decimals", marks: 3,
    prompt: `Sam buys a book for ${money(a)} and a game for ${money(b)}. He pays with a $${paid} note. How much change should he get?`,
    diagram: bar({ diagramType: "part-whole", parts: [{ value: a, label: money(a) }, { value: b, label: money(b) }, { value: change, label: null }], total: `$${paid}.00` }),
    answer: money(change),
    working: [`Cost: ${money(a)} + ${money(b)} = ${money(total)}`, `Change: $${paid}.00 − ${money(total)} = ${money(change)}`],
    space: SPACE_SIZES.MEDIUM,
    mcDistractors: [money(total), money(Math.round((change + 1) * 100) / 100), money(Math.round((paid - a) * 100) / 100), money(Math.round((change + 0.1) * 100) / 100)],
    tags: ["bar model", "money", "decimals"]
  });
}

function barModelDrawQuestion() {
  const v = choice(["part", "compare"]);
  if (v === "part") {
    const total = randInt(500, 2000); const used = randInt(100, total - 100);
    return q({
      type: "bar-model-draw", marks: 3,
      prompt: `A tank held ${spaced(total)} L of water. After watering the garden, ${spaced(total - used)} L was left. How much water was used? Draw a bar model to show the problem, then solve it.`,
      answer: `${spaced(used)} L (bar: whole ${spaced(total)} L = ${spaced(total - used)} L left + unknown used)`,
      working: ["Whole: " + spaced(total) + " L. Known part: " + spaced(total - used) + " L. Unknown part: water used.", `${spaced(total)} − ${spaced(total - used)} = ${spaced(used)} L`],
      space: SPACE_SIZES.LARGE,
      mcEligible: false,
      tags: ["bar model", "draw", "word problem"]
    });
  }
  const x = randInt(200, 900); const d = randInt(50, 400);
  return q({
    type: "bar-model-draw", marks: 3,
    prompt: `Year 5 collected ${spaced(x)} cans for recycling. Year 6 collected ${d} more than Year 5. How many cans did the two years collect altogether? Draw a bar model, then solve it.`,
    answer: `${spaced(2 * x + d)} cans`,
    working: [`Year 6: ${spaced(x)} + ${d} = ${spaced(x + d)}`, `Altogether: ${spaced(x)} + ${spaced(x + d)} = ${spaced(2 * x + d)}`],
    space: SPACE_SIZES.LARGE,
    mcEligible: false,
    tags: ["bar model", "draw", "multi-step"]
  });
}

export const EXTRA_AR_GENERATORS = {
  "bar-model-total": barModelTotalQuestion,
  "bar-model-part": barModelPartQuestion,
  "bar-model-compare": barModelCompareQuestion,
  "bar-model-decimals": barModelDecimalsQuestion,
  "bar-model-draw": barModelDrawQuestion
};
