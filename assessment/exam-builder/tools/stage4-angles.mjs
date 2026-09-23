/* Stage 4 "Angle Relationships" (MA4-ANG-C-01) — the seven types added in
   2026-09 (question-banks/angles/extra-types.js). Every figure is measured:
   degree labels, the pronumeral's angle against the answer, whether AB and CD
   really are parallel, and what kind of pair two marked angles really form. */
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));
const bank = await import(base + "question-banks/angles/index.js");
const { makeMultipleChoiceQuestion } = await import(base + "utils/multiple-choice.js");
let fail = 0;
const t = (l, ok, x = "") => { console.log((ok ? "  ✓ " : "  ✗ ") + l + (x ? ` — ${x}` : "")); if (!ok) fail++; };
const NEW = ["naming-angles", "classify-angles", "complementary-supplementary", "reflex-angles", "name-angle-pairs", "are-lines-parallel", "multi-step-parallel"];
const types = bank.getAngleQuestionTypes().map(x => x.id);
t("the original 7 types are still there, plus 7 new ones", types.length === 14 && NEW.every(id => types.includes(id)));
const ALL = [];
for (const id of NEW) ALL.push(...bank.generateAngleQuestions({ count: 400, allowedTypes: [id] }));
const by = id => ALL.filter(q => q.type === id);
t("every new type generates", NEW.every(id => by(id).length === 400));
const old = bank.generateAngleQuestions({ count: 200 });
t("the original types still generate", old.length === 200);

function ang(P, s) {
  const a = P[s.at], f = P[s.from], to = P[s.to];
  let d = Math.abs(Math.atan2(f[1] - a[1], f[0] - a[0]) - Math.atan2(to[1] - a[1], to[0] - a[0])) * 180 / Math.PI;
  if (d > 180) d = 360 - d;
  return s.reflex ? 360 - d : d;
}
let bad = 0, n = 0;
for (const q of ALL.filter(q => q.diagram)) {
  const c = q.diagram.config;
  for (const s of c.angles || []) {
    const m = /^(\d+)°$/.exec(String(s.label ?? "")); if (!m) continue; n++;
    if (Math.abs(ang(c.points, s) - Number(m[1])) > 0.6) bad++;
  }
}
t("every degree label matches the drawn angle", bad === 0, `${n} measured`);
bad = 0; n = 0;
for (const q of ALL.filter(q => q.diagram && /^\d+°$/.test(q.answer))) {
  const c = q.diagram.config; const s = (c.angles || []).filter(a => /^[a-z]$/.test(String(a.label)));
  if (s.length !== 1) continue; n++;
  if (Math.abs(ang(c.points, s[0]) - Number(q.answer.slice(0, -1))) > 0.6) bad++;
}
t("the pronumeral's drawn angle equals the answer", bad === 0, `${n} measured`);
bad = 0;
for (const q of by("classify-angles").filter(q => q.diagram)) {
  const c = q.diagram.config; const a = ang(c.points, c.angles[0]);
  const k = Math.abs(a - 90) < 0.5 ? "Right" : Math.abs(a - 180) < 0.5 ? "Straight" : a < 90 ? "Acute" : a < 180 ? "Obtuse" : "Reflex";
  if (k !== q.answer) bad++;
}
for (const q of by("classify-angles").filter(q => !q.diagram)) {
  const a = Number(/measures (\d+)°/.exec(q.prompt)[1]);
  const k = a < 90 ? "Acute" : a === 90 ? "Right" : a < 180 ? "Obtuse" : a === 180 ? "Straight" : a < 360 ? "Reflex" : "Revolution";
  if (k !== q.answer) bad++;
}
t("angle classification re-derived from the size", bad === 0);
bad = 0;
for (const q of by("complementary-supplementary").filter(q => /Find the (complement|supplement)/.test(q.prompt))) {
  const a = Number(/of (\d+)°/.exec(q.prompt)[1]); const w = /complement/.test(q.prompt) ? 90 : 180;
  if (Number(q.answer.slice(0, -1)) !== w - a) bad++;
}
for (const q of by("complementary-supplementary").filter(q => /^Are angles/.test(q.prompt))) {
  const [, a, b] = /of (\d+)° and (\d+)°/.exec(q.prompt).map(Number); const w = /complementary\?/.test(q.prompt) ? 90 : 180;
  if (/^Yes/.test(q.answer) !== (a + b === w)) bad++;
}
t("complements and supplements", bad === 0);
bad = 0;
for (const q of by("are-lines-parallel")) {
  const P = q.diagram.config.points;
  const d1 = Math.atan2(P.B[1] - P.A[1], P.B[0] - P.A[0]); const d2 = Math.atan2(P.D[1] - P.C[1], P.D[0] - P.C[0]);
  const par = Math.abs(Math.sin(d1 - d2)) < 1e-6;
  if (/^Yes/.test(q.answer) !== par) bad++;
}
t("'are the lines parallel?' agrees with the drawn lines", bad === 0, `${by("are-lines-parallel").filter(q => /^Yes/.test(q.answer)).length} yes / ${by("are-lines-parallel").filter(q => /^No/.test(q.answer)).length} no`);
bad = 0;
for (const q of by("name-angle-pairs")) {
  const [s1, s2] = q.diagram.config.angles; const P = q.diagram.config.points;
  // classify from geometry: same vertex → vertically opposite; else compare ray directions
  const dir = (v, w) => { const a = Math.atan2(P[w][1] - P[v][1], P[w][0] - P[v][0]); return Math.round(((a * 180 / Math.PI) % 180 + 180) % 180); };
  const bis = s => { const a = P[s.at]; const u = w => { const d = [P[w][0] - a[0], P[w][1] - a[1]]; const L = Math.hypot(...d); return [d[0] / L, d[1] / L]; }; const b = [u(s.from)[0] + u(s.to)[0], u(s.from)[1] + u(s.to)[1]]; return b; };
  const b1 = bis(s1), b2 = bis(s2);
  let kind;
  if (s1.at === s2.at) kind = "Vertically opposite";
  else {
    const T = [P.P[0] - P.Q[0], P.P[1] - P.Q[1]]; const N = [-T[1], T[0]];
    const side = b => Math.sign(b[0] * N[0] + b[1] * N[1]);
    const vert = b => Math.sign(b[1]);
    const top = s1.at === "E" ? b1 : b2, bot = s1.at === "E" ? b2 : b1;
    if (side(top) === side(bot) && vert(top) === vert(bot)) kind = "Corresponding";
    else if (side(top) !== side(bot) && vert(top) > 0 && vert(bot) < 0) kind = "Alternate";
    else if (side(top) === side(bot) && vert(top) > 0 && vert(bot) < 0) kind = "Co-interior";
    else kind = "?";
  }
  void dir;
  if (kind !== q.answer) bad++;
}
t("named angle pair re-classified from the drawn positions", bad === 0);
let ok = 0, tried = 0;
for (const q of ALL.filter(q => q.marks === 1 && q.mcEligible !== false)) { tried++; const m = makeMultipleChoiceQuestion(q); if (m && m.choices.length === 4 && m.choices.includes(m.correctAnswer)) ok++; }
t("one-mark questions convert to 4-option multiple choice", ok === tried, `${ok}/${tried}`);
t("no NaN / undefined", ALL.every(q => !/NaN|undefined/.test(JSON.stringify([q.prompt, q.answer, q.working]))));
console.log(fail ? `\n✗ ${fail} check(s) failed` : "\n✓ all angle checks passed");
process.exit(fail ? 1 : 0);
