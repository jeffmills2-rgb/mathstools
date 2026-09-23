/* Stage 4 "Probability" (MA4-PRO-C-01). Recounts every spinner, bag, card
   set and table, and recomputes each probability as an exact fraction,
   independently of the bank. Plain node, no dependencies. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/probability/index.js");
const { makeMultipleChoiceQuestion } = await import(base + "utils/multiple-choice.js");
let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const TYPES = bank.getProbabilityQuestionTypes();
const ALL = [];
for (const ty of TYPES) ALL.push(...bank.generateProbabilityQuestions({ count: 400, allowedTypes: [ty.id] }));
const by = id => ALL.filter(q => q.type === id);
const g = (a, b) => (b ? g(b, a % b) : Math.abs(a));
/* Parse an answer as a number: [[frac:n:d]], 0.25, 25%, or an integer. */
function val(s) {
  const f = /\[\[frac:(\d+):(\d+)\]\]/.exec(s); if (f) return Number(f[1]) / Number(f[2]);
  const p = /^([\d.]+)%$/.exec(s); if (p) return Number(p[1]) / 100;
  return Number(String(s).replace(/ /g, ""));
}
const simplified = s => { const f = /\[\[frac:(\d+):(\d+)\]\]/.exec(s); return !f || g(Number(f[1]), Number(f[2])) === 1; };
const eq = (a, b) => Math.abs(a - b) < 1e-9;

console.log("\nCOVERAGE");
t("16 question types, all generate", TYPES.length === 16 && TYPES.every(ty => by(ty.id).length === 400));

console.log("\nPROBABILITIES RECOUNTED FROM THE DIAGRAM");
let bad = 0;
for (const q of by("spinner-probability")) {
  const L = q.diagram.config.labels; const T = /lands on (?:a colour that is not )?(\w+)\?/.exec(q.prompt)[1];
  const n = L.filter(x => x === T).length; const p = /not/.test(q.prompt) ? (L.length - n) / L.length : n / L.length;
  if (!eq(val(q.answer), p) || !simplified(q.answer) || !q.prompt.includes(`${L.length} equal sectors`)) bad++;
}
t("spinners: sectors counted, fraction simplified", bad === 0);
bad = 0;
for (const q of by("bag-probability")) {
  let counts = q.diagram?.config?.counts;
  if (!counts) { counts = {}; for (const m of q.prompt.matchAll(/(\d+) (red|blue|green|yellow)/g)) counts[m[2]] = Number(m[1]); }
  const tot = Object.values(counts).reduce((s, v) => s + v, 0); const c = /that it is (\w+)/.exec(q.prompt)[1];
  if (!eq(val(q.answer), counts[c] / tot) || !simplified(q.answer)) bad++;
}
t("bags: counters counted from the drawing (or prompt)", bad === 0);
bad = 0;
for (const q of by("cards-letters")) {
  if (/letters of the word (\w+)/.test(q.prompt)) {
    const w = /word (\w+)/.exec(q.prompt)[1].split(""); const V = "AEIOU";
    const n = /a vowel/.test(q.prompt) ? w.filter(l => V.includes(l)).length : /a consonant/.test(q.prompt) ? w.filter(l => !V.includes(l)).length : w.filter(l => l === /letter (\w)\?/.exec(q.prompt)[1]).length;
    if (!eq(val(q.answer), n / w.length) || q.diagram.config.items.join("") !== w.join("")) bad++;
  } else {
    const N = Number(/1 to (\d+)/.exec(q.prompt)[1]); const e = /shows (.+)\?/.exec(q.prompt)[1];
    const F = { "an even number": v => v % 2 === 0, "a multiple of 3": v => v % 3 === 0, "a prime number": v => { for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return v > 1; }, "a number greater than 7": v => v > 7, "a square number": v => Number.isInteger(Math.sqrt(v)), "a number with two digits": v => v >= 10, "a factor of 12": v => 12 % v === 0 }[e];
    const n = Array.from({ length: N }, (_, i) => i + 1).filter(F).length;
    if (!eq(val(q.answer), n / N)) bad++;
  }
}
t("cards and letter tiles: favourable outcomes recounted (primes by trial division)", bad === 0);
bad = 0;
for (const q of by("die-probability")) {
  const e = /rolling (.+)\?/.exec(q.prompt)[1];
  const isP = v => [2, 3, 5].includes(v);
  const F = { "a 4": v => v === 4, "an even number": v => v % 2 === 0, "an odd number": v => v % 2, "a number greater than 4": v => v > 4, "a number less than 3": v => v < 3, "a prime number": isP, "a factor of 6": v => 6 % v === 0, "a multiple of 3": v => v % 3 === 0, "a number that is at least 2": v => v >= 2, "a square number": v => v === 1 || v === 4 }[e];
  if (!eq(val(q.answer), [1, 2, 3, 4, 5, 6].filter(F).length / 6)) bad++;
}
t("die events recounted", bad === 0);
bad = 0;
for (const q of by("not-equally-likely").filter(q => q.diagram)) {
  const c = q.diagram.config; const tot = c.weights.reduce((s, v) => s + v, 0);
  const L = /landing on (\w)\?/.exec(q.prompt)[1]; const w = c.weights[c.labels.indexOf(L)];
  const ang = Number(/angle of (\d+)°/.exec(q.prompt)[1]);
  if (!eq(val(q.answer), w / tot) || ang !== w / tot * 360 || c.weights.every(x => x === c.weights[0])) bad++;
}
t("unequal spinners: drawn sector sizes match the stated angle and the answer", bad === 0);
bad = 0;
for (const q of by("probability-scale")) {
  const m = q.diagram.config.markers.find(x => x.label === q.answer);
  const P = { "rolling a number less than 7 on a die": 1, "rolling a 9 on a die": 0, "a coin landing tails": 0.5, "rolling a 1 or a 2 on a die": 1 / 3, "rolling a number greater than 1 on a die": 5 / 6, "choosing a blue counter from a bag of 3 blue and 1 red": 0.75, "choosing a red counter from a bag of 3 blue and 1 red": 0.25 }[/chance of (.+)\?/.exec(q.prompt)[1]];
  const nearest = q.diagram.config.markers.reduce((b, x) => (Math.abs(x.value - P) < Math.abs(b.value - P) ? x : b));
  if (!m || nearest.label !== q.answer) bad++;
}
t("probability scale: the answer letter is the marker nearest the true probability", bad === 0);

console.log("\nTABLES, COMPLEMENTS, EXPERIMENTS");
bad = 0;
for (const q of by("sum-to-one")) {
  const vals = q.table.rows.slice(1).map(r => r[1]);
  const known = vals.filter(v => v !== "?").map(val).reduce((s, v) => s + v, 0);
  if (!eq(val(q.answer) + known, 1) || !(val(q.answer) > 0)) bad++;
}
t("missing probability makes the table sum to exactly 1", bad === 0);
bad = 0;
for (const q of by("complement-calculate")) {
  const m = /is (\[\[frac:\d+:\d+\]\]|[\d.]+%?)\./.exec(q.prompt)[1];
  if (!eq(val(m) + val(q.answer), 1)) bad++;
}
t("P(A) + P(not A) = 1", bad === 0);
bad = 0;
for (const q of by("relative-frequency")) {
  const out = q.table.rows[0].slice(1); const f = q.table.rows[1].slice(1).map(Number);
  const trials = Number(/ (\d+) (?:times|cars)/.exec(q.prompt)[1]); const o = /of "(.+)"/.exec(q.prompt)[1];
  if (f.reduce((s, v) => s + v, 0) !== trials || !eq(val(q.answer), f[out.indexOf(o)] / trials)) bad++;
}
t("relative frequency: table totals the number of trials; answer = f ÷ trials", bad === 0);
bad = 0;
for (const q of by("expected-frequency")) {
  const a = val(q.answer);
  if (!Number.isInteger(a) || a < 0) bad++;
  if (q.diagram) { const L = q.diagram.config.labels; const n = Number(/spun (\d+) times/.exec(q.prompt)[1]); if (a !== L.filter(x => x === "Win").length / L.length * n) bad++; }
}
t("expected frequencies are whole numbers (spinner ones recounted)", bad === 0);
t("multi-part: P(yellow) = 0 is impossible, and (a),(b) simplified", by("multi-part-probability").every(q => q.subparts[2].answer === "0" && simplified(q.subparts[0].answer) && simplified(q.subparts[1].answer)));

console.log("\nFORM AND LAYOUT");
t("every probability answer lies in [0, 1]", ALL.filter(q => /probability of|probability that|Find P|relative frequency/.test(q.prompt) && !q.subparts && /^(\[\[frac|0\.|1$|0$|\d+%$)/.test(q.answer)).every(q => val(q.answer) >= 0 && val(q.answer) <= 1));
let ok = 0, tried = 0;
for (const q of ALL.filter(q => q.marks === 1 && q.mcEligible !== false)) { tried++; const m = makeMultipleChoiceQuestion(q); if (m && m.choices.length === 4 && m.choices.includes(m.correctAnswer)) ok++; }
t("one-mark questions convert to 4-option multiple choice", ok === tried, `${ok}/${tried}`);
t("no two-step (compound) experiments — Stage 5 content", ALL.every(q => !/two dice|both|twice|and then|tossed twice/.test(q.prompt) || /replaced/.test(q.prompt)));
t("no NaN / undefined", ALL.every(q => !/NaN|undefined|Infinity/.test(JSON.stringify([q.prompt, q.answer, q.working, q.subparts, q.table]))));
console.log(fail ? `\n✗ ${fail} check(s) failed` : "\n✓ all probability checks passed");
process.exit(fail ? 1 : 0);
