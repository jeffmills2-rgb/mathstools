/*
  Mills Maths Tools — Stage 1 Question Bank: Data (A)
  ----------------------------------------------------
  question-banks/stage-1/data-a/index.js

  NSW Mathematics K–10 (2022), Stage 1:
    MA1-DATA-01  gather and organise data: sort, count, tally, lists, tables,
                 picture graphs
    MA1-DATA-02  describe and interpret: most, least, how many more

  Big ideas:
    - sorting then counting organises data;
    - a tally bundles marks in fives so it is quick to count;
    - in a picture graph each picture stands for one, and pictures line up
      so rows can be compared.
*/

import { SPACE_SIZES, generateFromRegistry } from "../../_shared/bank-helpers.js";
import { mani, stats, makeStage1, randInt, choice, shuffle } from "../../_shared/stage1-helpers.js";

const TOPIC = "Data A";
const q1 = makeStage1(TOPIC, "MA1-DATA-01");
const q2 = makeStage1(TOPIC, "MA1-DATA-02");

export const CONTEXTS = [
  { title: "Our favourite fruit", head: "Fruit", cats: ["Apple", "Banana", "Grapes", "Orange"] },
  { title: "Our pets", head: "Pet", cats: ["Dog", "Cat", "Fish", "Bird"] },
  { title: "How we come to school", head: "Way", cats: ["Walk", "Car", "Bus", "Bike"] },
  { title: "Our favourite colour", head: "Colour", cats: ["Red", "Blue", "Green", "Yellow"] }
];
export function dataset(k = 3, lo = 1, hi = 8) {
  const ctx = choice(CONTEXTS); const cats = ctx.cats.slice(0, k);
  let values; do { values = cats.map(() => randInt(lo, hi)); } while (new Set(values).size < k);
  return { ...ctx, cats, values };
}
export const pictureGraph = d => stats({ chartType: "pictogram", categories: d.cats, values: d.values, perSymbol: 1, unit: "child", title: d.title });

const TYPE_LIST = [
  { id: "sort-count", label: "Sort and count pictures" },
  { id: "tally-read", label: "Read a tally" },
  { id: "tally-totals", label: "Write the tally totals" },
  { id: "picture-graph-read", label: "Read a picture graph" },
  { id: "most-least", label: "Most and least" },
  { id: "how-many-more", label: "How many more?" },
  { id: "yes-no-table", label: "Yes/no questions in a table" },
  { id: "list-count", label: "Count from a list" }
];

function sortCountQuestion() {
  const kinds = shuffle(["star", "heart", "ball", "fish"]).slice(0, 3); const counts = kinds.map(() => randInt(2, 6));
  const items = shuffle(kinds.flatMap((k, i) => Array(counts[i]).fill(k)));
  const i = randInt(0, 2);
  return q1({ type: "sort-count", marks: 1, prompt: `How many ${kinds[i] === "fish" ? "fish" : `${kinds[i]}s`}?`, diagram: mani({ diagramType: "objects", items, perRow: 6 }), answer: String(counts[i]), working: ["Point to each one and count. Tick it off so you don't count it twice."], space: SPACE_SIZES.SMALL, mcDistractors: [String(counts[i] + 1), String(counts[i] - 1 || counts[i] + 2), String(items.length)].filter(x => x !== String(counts[i])), tags: ["sort", "count"] });
}

function tallyReadQuestion() {
  const d = dataset(3, 2, 12); const i = randInt(0, 2);
  return q2({ type: "tally-read", marks: 1, prompt: `How many chose ${d.cats[i].toLowerCase()}?`, diagram: mani({ diagramType: "tally", heads: [d.head, "Tally"], rows: d.cats.map((c, k) => ({ label: c, count: d.values[k] })) }), answer: String(d.values[i]), working: ["Count a bundle as 5, then count on."], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] + 1), String(d.values[i] - 1), String(Math.floor(d.values[i] / 5) + d.values[i] % 5)].filter(x => x !== String(d.values[i]) && x !== "0"), tags: ["tally"] });
}

function tallyTotalsQuestion() {
  const d = dataset(3, 2, 12);
  return q1({ type: "tally-totals", marks: 1, prompt: "Write the total for each row.", diagram: mani({ diagramType: "tally", heads: [d.head, "Tally", "Total"], rows: d.cats.map((c, k) => ({ label: c, count: d.values[k], total: null })) }), answer: d.cats.map((c, k) => `${c} ${d.values[k]}`).join(", "), working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["tally"] });
}

function pictureGraphReadQuestion() {
  const d = dataset(4, 1, 8); const i = randInt(0, 3);
  return q2({ type: "picture-graph-read", marks: 1, prompt: `How many children chose ${d.cats[i].toLowerCase()}?`, diagram: pictureGraph(d), answer: String(d.values[i]), working: ["Each picture is 1 child."], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[i] + 1), String(d.values[i] - 1 || d.values[i] + 2)], tags: ["picture graph"] });
}

function mostLeastQuestion() {
  const d = dataset(4, 1, 8); const ask = choice(["most", "fewest"]);
  const v = ask === "most" ? Math.max(...d.values) : Math.min(...d.values); const ans = d.cats[d.values.indexOf(v)];
  return q2({ type: "most-least", marks: 1, prompt: `Which was chosen by the ${ask} children?`, diagram: pictureGraph(d), answer: ans, working: [ask === "most" ? "The longest row." : "The shortest row."], space: SPACE_SIZES.SMALL, mcDistractors: d.cats.filter(c => c !== ans), tags: ["picture graph", "compare"] });
}

function howManyMoreQuestion() {
  const d = dataset(3, 1, 8); const [i, j] = shuffle([0, 1, 2]).slice(0, 2); const [a, b] = d.values[i] > d.values[j] ? [i, j] : [j, i];
  return q2({ type: "how-many-more", marks: 1, prompt: `How many more chose ${d.cats[a].toLowerCase()} than ${d.cats[b].toLowerCase()}?`, diagram: pictureGraph(d), answer: String(d.values[a] - d.values[b]), working: [`${d.values[a]} − ${d.values[b]} = ${d.values[a] - d.values[b]}`, "Or count the extra pictures past the shorter row."], space: SPACE_SIZES.SMALL, mcDistractors: [String(d.values[a] + d.values[b]), String(d.values[a]), String(d.values[a] - d.values[b] + 1)], tags: ["difference"] });
}

function yesNoTableQuestion() {
  const Qs = ["Do you have a pet?", "Can you swim?", "Do you like rain?", "Do you have a sister?"];
  const qn = choice(Qs); const y = randInt(5, 15); const n = randInt(3, 12);
  const ask = choice(["yes", "no", "total"]); const ans = ask === "yes" ? y : ask === "no" ? n : y + n;
  return q2({ type: "yes-no-table", marks: 1, prompt: ask === "total" ? "How many children answered?" : `How many said ${ask}?`, table: { headerRow: true, rows: [[qn, "Children"], ["Yes", String(y)], ["No", String(n)]] }, answer: String(ans), working: ask === "total" ? [`${y} + ${n} = ${y + n}`] : ["Read the table."], space: SPACE_SIZES.SMALL, mcDistractors: [String(ask === "yes" ? n : y), String(y + n + 1), String(ans + 1)].filter(x => x !== String(ans)), tags: ["table"] });
}

function listCountQuestion() {
  const cats = ["Red", "Blue", "Green"]; const list = Array.from({ length: randInt(8, 12) }, () => choice(cats)); const t = choice(cats);
  const n = list.filter(x => x === t).length;
  return q1({ type: "list-count", marks: 1, prompt: `Favourite colours: ${list.join(", ")}. How many said ${t}?`, answer: String(n), working: [`Tick each ${t} as you count.`], space: SPACE_SIZES.SMALL, mcDistractors: [String(n + 1), String(n - 1 || n + 2), String(list.length)].filter(x => x !== String(n)), tags: ["list"] });
}

const GENERATORS = {
  "sort-count": sortCountQuestion,
  "tally-read": tallyReadQuestion,
  "tally-totals": tallyTotalsQuestion,
  "picture-graph-read": pictureGraphReadQuestion,
  "most-least": mostLeastQuestion,
  "how-many-more": howManyMoreQuestion,
  "yes-no-table": yesNoTableQuestion,
  "list-count": listCountQuestion
};

export function getDataAQuestionTypes() { return TYPE_LIST; }
export function generateDataAQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
