/* Stage 4 gap-fill types added to existing banks in 2026-09:
     FDP  — recurring decimals, quantity as a percentage, profit and loss
     Indices — HCF and LCM by prime factorisation
     Pythagoras — identify the hypotenuse / state the theorem
   Each answer is re-derived here with independent arithmetic. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const fdp = await import(base + "question-banks/fdp/index.js");
const ind = await import(base + "question-banks/indices/index.js");
const pyt = await import(base + "question-banks/pythagoras/index.js");
const { makeMultipleChoiceQuestion } = await import(base + "utils/multiple-choice.js");
let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const g = (a, b) => (b ? g(b, a % b) : a);
const DOT = "̇";

const rec = fdp.generateFdpQuestions({ count: 600, allowedTypes: ["recurring-decimals"] });
const pct = fdp.generateFdpQuestions({ count: 600, allowedTypes: ["quantity-as-percentage"] });
const pl = fdp.generateFdpQuestions({ count: 600, allowedTypes: ["profit-and-loss"] });
const hl = ind.generateIndicesQuestions({ count: 400, allowedTypes: ["hcf-lcm-prime-factors"] });
const hy = pyt.generatePythagorasQuestions({ count: 400, allowedTypes: ["identify-hypotenuse"] });

t("FDP now lists 29 types, the originals still generate", fdp.getFdpQuestionTypes().length === 29 && fdp.generateFdpQuestions({ count: 100 }).length === 100);
t("Indices lists 25, Pythagoras 12", ind.getIndicesQuestionTypes().length === 25 && pyt.getPythagorasQuestionTypes().length === 12);

/* Expand a dotted decimal back to many digits and compare with n/d computed
   by BigInt division — a different method from the bank's remainder loop. */
function expandDotted(s) {
  const [w, frac] = s.split(".");
  const chars = [...frac];
  const digits = []; const dots = [];
  chars.forEach(c => { if (c === DOT) dots.push(digits.length - 1); else digits.push(c); });
  if (!dots.length) return `${w}.${digits.join("")}`;
  const start = dots[0]; const end = dots[dots.length - 1];
  const block = digits.slice(start, end + 1).join("");
  return `${w}.${digits.slice(0, start).join("")}${block.repeat(40)}`.slice(0, 30);
}
function bigDiv(n, d) {
  const q = (BigInt(n) * 10n ** 40n) / BigInt(d);
  const s = q.toString().padStart(41, "0");
  return `${s.slice(0, -40) || "0"}.${s.slice(-40)}`.slice(0, 30);
}
let bad = 0;
for (const q of rec) {
  const m = /frac:(\d+):(\d+)/.exec(q.prompt);
  if (/as a decimal, using dot/.test(q.prompt)) { if (expandDotted(q.answer) !== bigDiv(+m[1], +m[2])) bad++; }
  else if (/terminating or a recurring/.test(q.prompt)) {
    let d = +m[2] / g(+m[1], +m[2]); while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5;
    if (q.answer !== (d === 1 ? "Terminating" : "Recurring")) bad++;
  } else {
    const shown = /Write ([\d.]+)…/.exec(q.prompt)[1];
    if (!expandDotted(q.answer).startsWith(shown)) bad++;
    const dots = [...q.answer].filter(c => c === DOT).length; if (dots < 1 || dots > 2) bad++;
  }
}
t("recurring decimals: dotted answers expand to the true decimal (BigInt division)", bad === 0, `${rec.length} checked`);
bad = 0;
const UNIT = { minutes: 1, hour: 60, hours: 60, cm: 1, m: 100, g: 1, kg: 1000, cents: 1 };
for (const q of pct) {
  const a = Number(q.answer.replace("%", ""));
  let v;
  let m;
  if ((m = /scored (\d+) out of (\d+)/.exec(q.prompt))) v = m[1] / m[2] * 100;
  else if ((m = /has (\d+) students and (\d+) are girls/.exec(q.prompt))) v = m[2] / m[1] * 100;
  else if ((m = /What percentage of \$(\d+) is (\d+) cents/.exec(q.prompt))) v = m[2] / (m[1] * 100) * 100;
  else if ((m = /Express (.+?) as a percentage of (.+?)\.$/.exec(q.prompt))) {
    const qty = str => { const mm = /^([\d .]+?)(?: (minutes|hours?|cm|m|g|kg))?$/.exec(str.trim()); return Number(mm[1].replace(/ /g, "")) * (UNIT[mm[2]] || 1); };
    v = qty(m[1]) / qty(m[2]) * 100;
  }
  if (v === undefined || Math.abs(a - v) > (/1 decimal place/.test(q.prompt) ? 0.0501 : 1e-9)) { bad++; if (process.env.DBG) console.log('PCT', q.prompt, q.answer, v); }
}
t("one quantity as a percentage of another (units converted first)", bad === 0, `${pct.length} checked`);
bad = 0;
const money = s => Number(s.replace(/[$ ]/g, ""));
for (const q of pl) {
  const cost = money(/for (\$[\d ]+\.\d\d)/.exec(q.prompt)[1]);
  const sold = /(?:sells|sold) it for (\$[\d ]+\.\d\d)/.exec(q.prompt);
  if (sold) {
    const s = money(sold[1]);
    if (/percentage/.test(q.prompt)) { const p = Math.abs(s - cost) / cost * 100; if (Math.abs(Number(q.answer.split("%")[0]) - p) > 1e-9 || !q.answer.includes(s > cost ? "profit" : "loss")) { bad++; if (process.env.DBG) console.log('PL3', q.prompt, q.answer, p); } }
    else if (Math.abs(money(q.answer) - Math.abs(s - cost)) > 1e-9) { bad++; if (process.env.DBG) console.log('PL2', q.prompt, q.answer); }
  } else {
    const [, p, kind] = /(\d+)% (profit|loss)/.exec(q.prompt);
    if (Math.abs(money(q.answer) - cost * (1 + (kind === "profit" ? 1 : -1) * p / 100)) > 1e-9) { bad++; if (process.env.DBG) console.log('PL', q.prompt, q.answer); }
  }
}
t("profit and loss: amounts and percentages of cost price", bad === 0, `${pl.length} checked`);
bad = 0;
for (const q of hl) {
  const [a, b] = [...q.prompt.matchAll(/\b(\d{2,3})\b/g)].map(m => Number(m[1])).slice(0, 2);
  const H = g(a, b); const L = a * b / H;
  if (/HCF\) and lowest/.test(q.prompt)) { if (!q.answer.includes(`HCF = ${H}, LCM = ${L}`)) bad++; }
  else if (/highest common factor/.test(q.prompt)) { if (Number(q.answer) !== H) bad++; }
  else if (Number(q.answer) !== L) bad++;
}
t("HCF and LCM agree with Euclid's algorithm", bad === 0, `${hl.length} checked`);
bad = 0;
for (const q of hy) {
  if (q.diagram) {
    const c = q.diagram.config; const P = c.points; const ring = c.polygons[0].pts;
    const d = (u, v) => Math.hypot(P[u][0] - P[v][0], P[u][1] - P[v][1]);
    const sides = [[ring[0], ring[1]], [ring[1], ring[2]], [ring[2], ring[0]]].map(([u, v]) => ({ u, v, L: d(u, v) }));
    const hyp = sides.reduce((x, y) => (y.L > x.L ? y : x));
    const L2 = sides.map(s => s.L ** 2).sort((x, y) => x - y);
    if (Math.abs(L2[0] + L2[1] - L2[2]) > 1e-3 * L2[2]) bad++;
    if (/Name the hypotenuse/.test(q.prompt) && ![hyp.u + hyp.v, hyp.v + hyp.u].includes(q.answer)) bad++;
    if (/theorem/.test(q.prompt)) { const lab = c.sideLabels.find(s => [s.from + s.to, s.to + s.from].includes(hyp.u + hyp.v)).text; if (!q.answer.startsWith(`${lab}² =`)) bad++; }
  } else {
    const n = [...q.prompt.matchAll(/(\d+) (?:cm|mm|m)\b/g)].map(m => Number(m[1]));
    if (Number(q.answer.split(" ")[0]) !== Math.max(...n)) bad++;
  }
}
t("hypotenuse: the drawn triangle is right-angled and the answer is its longest side", bad === 0);
let ok = 0, tried = 0;
for (const q of [...rec, ...pct, ...pl, ...hl, ...hy].filter(q => q.marks === 1 && q.mcEligible !== false)) { tried++; const m = makeMultipleChoiceQuestion(q); if (m && m.choices.length === 4) ok++; else if (process.env.DBG) console.log(q.prompt, q.answer, q.mcDistractors); }
t("one-mark questions convert to multiple choice", ok === tried, `${ok}/${tried}`);
console.log(fail ? `\n✗ ${fail} check(s) failed` : "\n✓ all gap-fill checks passed");
process.exit(fail ? 1 : 0);
