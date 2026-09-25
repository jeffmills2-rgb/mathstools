/*
  Mills Maths Tools — Stage 5 Question Bank: Equations C
  -------------------------------------------------------
  question-banks/stage-5/equations-c/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-EQU-P-02 (Path):
    "solves linear equations of more than 3 steps, monic and non-monic
     quadratic equations, and linear simultaneous equations"

  Content:
    - linear equations of more than 3 steps, and with more than one
      algebraic fraction
    - rearranging literal equations (changing the subject of a formula)
    - quadratic equations: factorising (monic and non-monic), completing the
      square, the quadratic formula (exact and rounded), and the number of
      solutions from the discriminant
    - quadratic equations from problems (projectiles, areas)
    - linear simultaneous equations: graphically (intersection of two lines),
      substitution, elimination, and from worded problems

  Graphs come from engines/plane/plane-engine.js, drawn from the same lines
  the equations use.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, gcd, fmt
} from "../../_shared/bank-helpers.js";
import { sup, mono, num, afrac, MINUS, joinTerms, poly, lin, bin, rat, isqrt, surdParts, surdText } from "../../_shared/algebra-helpers.js";

const TOPIC = "Equations C";

const TYPE_LIST = [
  { id: "multi-step-linear", label: "Linear equations of more than 3 steps" },
  { id: "two-fractions", label: "Equations with two algebraic fractions" },
  { id: "change-subject", label: "Change the subject of a formula" },
  { id: "non-monic-solve", label: "Solve non-monic quadratics by factorising" },
  { id: "quadratic-formula-exact", label: "Quadratic formula: exact answers" },
  { id: "quadratic-formula-rounded", label: "Quadratic formula: rounded answers" },
  { id: "complete-square-solve", label: "Solve by completing the square" },
  { id: "discriminant", label: "How many solutions? (the discriminant)" },
  { id: "quadratic-applications", label: "Quadratic equations in context" },
  { id: "simultaneous-graphical", label: "Simultaneous equations graphically" },
  { id: "simultaneous-substitution", label: "Simultaneous equations: substitution" },
  { id: "simultaneous-elimination", label: "Simultaneous equations: elimination" },
  { id: "simultaneous-problems", label: "Simultaneous equations from problems" },
  { id: "multi-part-equations-c", label: "Multi-part equations problem" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "equations", ...(spec.tags || [])] });
const nz = (lo, hi) => { let v; do { v = randInt(lo, hi); } while (v === 0); return v; };
const plane = config => ({ engine: "plane-engine", config });
const V = ["x", "a", "m", "n", "p", "y"];
const solList = (x, rs) => [...new Set(rs.map(String))].map(r => `${x} = ${r}`).join(" or ");
const rt = (n, d) => rat(n, d);
const d2 = v => `${v < 0 ? MINUS : ""}${Math.abs(v).toFixed(2)}`;
const txt = s => String(s).replace(/\[\[frac:(\d+):(\d+)\]\]/g, "$1/$2").replace(/\[\[algfrac:([^:]+):([^\]]+)\]\]/g, "($1)/($2)");

/* ── linear ──────────────────────────────────────────────── */

function multiStepLinearQuestion() {
  const x = choice(V);
  // a(px + b) − c(qx + d) = e x + f, with an integer solution s
  for (;;) {
    const a = randInt(2, 5); const p = randInt(1, 4); const b = nz(-6, 6);
    const c = randInt(2, 4); const r = randInt(1, 3); const d = nz(-6, 6);
    const e = randInt(1, 6); const s = nz(-6, 6);
    const lhsX = a * p - c * r; const lhsC = a * b - c * d;
    if (lhsX === e) continue;
    const f = lhsX * s + lhsC - e * s;
    return q({
      type: "multi-step-linear", marks: 3,
      prompt: `Solve ${a}${bin(p, b, x)} ${MINUS} ${c}${bin(r, d, x)} = ${lin(e, f, x)}.`,
      answer: `${x} = ${num(s)}`,
      working: [`Expand: ${lin(a * p, a * b, x)} ${MINUS} ${lin(c * r, c * d, x).replace(/^/, "(")}) = ${lin(e, f, x)}`, `Simplify: ${lin(lhsX, lhsC, x)} = ${lin(e, f, x)}`, `${mono(lhsX - e, { [x]: 1 })} = ${num(f - lhsC)}`, `${x} = ${num(s)}`],
      space: SPACE_SIZES.LARGE,
      mcDistractors: [`${x} = ${num(-s)}`, `${x} = ${num(s + 1)}`, `${x} = ${rt(f + lhsC, lhsX - e)}`],
      tags: ["linear", "multi-step"]
    });
  }
}

function twoFractionsQuestion() {
  const x = choice(V);
  const v = choice(["difference", "equal", "sum"]);
  for (;;) {
    const d1 = choice([2, 3, 4, 5]); const d2 = choice([2, 3, 4, 5, 6].filter(d => d !== d1));
    const a = nz(-5, 5); const b = nz(-5, 5); const s = nz(-8, 8);
    if (v === "equal") {
      // (x + a)/d1 = (x + b)/d2 → d2(x + a) = d1(x + b)
      if (d2 === d1) continue;
      const S = (d1 * b - d2 * a) / (d2 - d1);
      if (!Number.isInteger(S)) continue;
      return q({ type: "two-fractions", marks: 3, prompt: `Solve ${afrac(lin(1, a, x), String(d1))} = ${afrac(lin(1, b, x), String(d2))}.`, answer: `${x} = ${num(S)}`, working: [`Cross-multiply: ${d2}${bin(1, a, x)} = ${d1}${bin(1, b, x)}`, `${lin(d2, d2 * a, x)} = ${lin(d1, d1 * b, x)}`, `${mono(d2 - d1, { [x]: 1 })} = ${num(d1 * b - d2 * a)}`, `${x} = ${num(S)}`], space: SPACE_SIZES.LARGE, mcDistractors: [`${x} = ${num(-S)}`, `${x} = ${num(S + 1)}`], tags: ["algebraic fractions"] });
    }
    const L = (d1 * d2) / gcd(d1, d2);
    const sub = v === "difference";
    const val = (s + a) / d1 + (sub ? -1 : 1) * (s + b) / d2;
    if (!Number.isInteger(val) || !Number.isInteger((s + a) * L / d1) ) continue;
    return q({
      type: "two-fractions", marks: 3,
      prompt: `Solve ${afrac(lin(1, a, x), String(d1))} ${sub ? MINUS : "+"} ${afrac(lin(1, b, x), String(d2))} = ${num(val)}.`,
      answer: `${x} = ${num(s)}`,
      working: [`Multiply every term by ${L}: ${L / d1}${bin(1, a, x)} ${sub ? MINUS : "+"} ${L / d2}${bin(1, b, x)} = ${num(val * L)}`, `${lin(L / d1 + (sub ? -1 : 1) * L / d2, (L / d1) * a + (sub ? -1 : 1) * (L / d2) * b, x)} = ${num(val * L)}`, `${x} = ${num(s)}`],
      space: SPACE_SIZES.LARGE,
      mcDistractors: [`${x} = ${num(-s)}`, `${x} = ${num(s + 2)}`],
      tags: ["algebraic fractions"]
    });
  }
}

const FORMULAS = [
  { f: "v = u + at", subj: "a", ans: afrac("v − u", "t"), steps: ["v − u = at", "a = (v − u)/t"] },
  { f: "v = u + at", subj: "u", ans: "u = v − at".slice(4), steps: ["u = v − at"] },
  { f: "A = πr²", subj: "r", ans: "√(A/π) (r > 0)", steps: ["r² = A/π", "r = √(A/π), taking the positive root for a length"] },
  { f: "P = 2(l + w)", subj: "w", ans: afrac("P − 2l", "2"), steps: ["P/2 = l + w", "w = P/2 − l = (P − 2l)/2"] },
  { f: "y = mx + c", subj: "x", ans: afrac("y − c", "m"), steps: ["y − c = mx", "x = (y − c)/m"] },
  { f: "C = 2πr", subj: "r", ans: afrac("C", "2π"), steps: ["r = C/(2π)"] },
  { f: "S = ½n(a + l)", subj: "l", ans: afrac("2S", "n").concat(" − a"), steps: ["2S = n(a + l)", "2S/n = a + l", "l = 2S/n − a"] },
  { f: "E = ½mv²", subj: "v", ans: "√(2E/m) (v > 0)", steps: ["2E = mv²", "v² = 2E/m", "v = √(2E/m)"] },
  { f: "F = 9C/5 + 32", subj: "C", ans: afrac("5(F − 32)", "9"), steps: ["F − 32 = 9C/5", "5(F − 32) = 9C", "C = 5(F − 32)/9"] },
  { f: "V = πr²h", subj: "h", ans: afrac("V", "πr²"), steps: ["h = V/(πr²)"] },
  { f: "I = Prn", subj: "n", ans: afrac("I", "Pr"), steps: ["n = I/(Pr)"] },
  { f: "y = (x + b)/c", subj: "x", ans: "cy − b", steps: ["cy = x + b", "x = cy − b"] }
];

function changeSubjectQuestion() {
  const F = choice(FORMULAS);
  return q({
    type: "change-subject", marks: 2,
    prompt: `Make ${F.subj} the subject of ${F.f}.`,
    answer: `${F.subj} = ${F.ans}`,
    working: F.steps,
    space: SPACE_SIZES.MEDIUM,
    mcEligible: false,
    tags: ["literal equations", "formulas"]
  });
}

/* ── quadratics ──────────────────────────────────────────── */

function nonMonicSolveQuestion() {
  const x = choice(V);
  for (;;) {
    const p = randInt(2, 5); const r = randInt(1, 3); const a = nz(-7, 7); const b = nz(-7, 7);
    if (gcd(p, Math.abs(a)) !== 1 || gcd(r, Math.abs(b)) !== 1) continue;
    const c = [p * r, p * b + a * r, a * b];
    if (gcd(gcd(Math.abs(c[0]), Math.abs(c[1])), Math.abs(c[2])) !== 1 || c[1] === 0) continue;
    const s1 = rt(-a, p); const s2 = rt(-b, r);
    if (s1 === s2) continue;
    return q({
      type: "non-monic-solve", marks: 3,
      prompt: `Solve ${poly(c, x)} = 0.`,
      answer: solList(x, [s1, s2]),
      working: [`Factorise: ${bin(p, a, x)}${bin(r, b, x)} = 0`, `${lin(p, a, x)} = 0 → ${x} = ${txt(s1)}`, `${lin(r, b, x)} = 0 → ${x} = ${txt(s2)}`],
      space: SPACE_SIZES.MEDIUM,
      mcDistractors: [solList(x, [rt(a, p), rt(b, r)]), solList(x, [num(-a), num(-b)]), solList(x, [rt(-p, a), rt(-r, b)])],
      tags: ["quadratic", "non-monic"]
    });
  }
}

/* x = (−b ± √Δ)/(2a) in simplest exact form. */
export function exactRoots(a, b, c) {
  const D = b * b - 4 * a * c;
  if (D < 0) return null;
  const p = surdParts(D);
  const den = 2 * a;
  if (p.in === 1) {
    return [...new Set([rt(-b + p.out, den), rt(-b - p.out, den)])];
  }
  const g = gcd(gcd(Math.abs(b), p.out), Math.abs(den));
  const B = -b / g; const S = p.out / g; const Dn = den / g;
  const sgn = Dn < 0 ? -1 : 1;
  const top = `${B === 0 ? "" : num(sgn * B)} ± ${surdText(S, p.in)}`.trim();
  return [Math.abs(Dn) === 1 ? top : afrac(top, String(Math.abs(Dn)))];
}

function quadraticFormulaExactQuestion() {
  const x = choice(V);
  for (;;) {
    const a = choice([1, 1, 2, 3]); const b = nz(-8, 8); const c = nz(-9, 9);
    const D = b * b - 4 * a * c;
    if (D <= 0 || isqrt(D)) continue;
    const r = exactRoots(a, b, c);
    return q({
      type: "quadratic-formula-exact", marks: 3,
      prompt: `Use the quadratic formula to solve ${poly([a, b, c], x)} = 0. Give exact answers.`,
      answer: `${x} = ${r[0]}`,
      working: [`a = ${a}, b = ${num(b)}, c = ${num(c)}`, `Δ = b² − 4ac = ${b * b} ${MINUS} ${4 * a * c < 0 ? `(${num(4 * a * c)})` : 4 * a * c} = ${D}`, `${x} = (${num(-b)} ± √${D})/${2 * a}`, `= ${txt(r[0])}`],
      space: SPACE_SIZES.LARGE,
      mcEligible: false,
      tags: ["quadratic", "quadratic formula"]
    });
  }
}

function quadraticFormulaRoundedQuestion() {
  const x = choice(V);
  for (;;) {
    const a = choice([1, 2, 3, 5]); const b = nz(-9, 9); const c = nz(-9, 9);
    const D = b * b - 4 * a * c;
    if (D <= 0 || isqrt(D)) continue;
    const r1 = (-b + Math.sqrt(D)) / (2 * a); const r2 = (-b - Math.sqrt(D)) / (2 * a);
    const [lo, hi] = [r1, r2].sort((m, n) => m - n);
    return q({
      type: "quadratic-formula-rounded", marks: 3,
      prompt: `Solve ${poly([a, b, c], x)} = 0, giving your answers correct to 2 decimal places.`,
      answer: `${x} ≈ ${d2(lo)} or ${x} ≈ ${d2(hi)}`,
      working: [`Δ = ${D}`, `${x} = (${num(-b)} ± √${D})/${2 * a}`, `${x} ≈ ${d2(lo)} or ${d2(hi)}`],
      space: SPACE_SIZES.LARGE,
      mcEligible: false,
      tags: ["quadratic", "quadratic formula"]
    });
  }
}

function completeSquareSolveQuestion() {
  const x = choice(V);
  for (;;) {
    const h = nz(-6, 6); const k = randInt(2, 30);
    if (isqrt(k)) continue;
    // (x + h)² = k → x² + 2hx + h² − k = 0
    const c = h * h - k;
    const p = surdParts(k);
    return q({
      type: "complete-square-solve", marks: 3,
      prompt: `Solve ${poly([1, 2 * h, c], x)} = 0 by completing the square. Give exact answers.`,
      answer: `${x} = ${num(-h)} ± ${surdText(p.out, p.in)}`,
      working: [`${poly([1, 2 * h, 0], x).replace(/ \+ 0$/, "")} = ${num(-c)}`, `Add (${num(2 * h)} ÷ 2)² = ${h * h} to both sides: ${bin(1, h, x)}² = ${k}`, `${lin(1, h, x)} = ±√${k}`, `${x} = ${num(-h)} ± ${surdText(p.out, p.in)}`],
      space: SPACE_SIZES.LARGE,
      mcEligible: false,
      tags: ["quadratic", "complete the square"]
    });
  }
}

function discriminantQuestion() {
  const x = choice(V);
  const target = choice([0, 1, 2]);
  for (;;) {
    const a = choice([1, 1, 2, 3]); const b = randInt(-8, 8); const c = randInt(-9, 9);
    const D = b * b - 4 * a * c;
    const n = D > 0 ? 2 : D === 0 ? 1 : 0;
    if (n !== target) continue;
    return q({
      type: "discriminant", marks: 2,
      prompt: `Use the discriminant to find how many real solutions ${poly([a, b, c], x)} = 0 has.`,
      answer: `${n === 2 ? "Two" : n === 1 ? "One" : "No"} real solution${n === 1 ? "" : "s"} (Δ = ${num(D)})`,
      working: [`Δ = b² − 4ac = ${b * b} ${MINUS} ${4 * a * c < 0 ? `(${num(4 * a * c)})` : 4 * a * c} = ${num(D)}`, D > 0 ? "Δ > 0: two solutions" : D === 0 ? "Δ = 0: one solution" : "Δ < 0: no real solutions"],
      space: SPACE_SIZES.MEDIUM,
      mcEligible: false,
      tags: ["quadratic", "discriminant"]
    });
  }
}

function quadraticApplicationsQuestion() {
  const v = choice(["projectile", "area", "product"]);
  if (v === "projectile") {
    const t1 = randInt(1, 3); const t2 = t1 + randInt(1, 4);
    // h = −5t² + 5(t1 + t2)t, and h = 5 t1 t2 at t1 and t2
    const b = 5 * (t1 + t2); const H = 5 * t1 * t2;
    return q({ type: "quadratic-applications", marks: 3, prompt: `A ball's height, h metres, after t seconds is h = ${b}t ${MINUS} 5t². When is the ball ${H} m above the ground?`, answer: `t = ${t1} s and t = ${t2} s (on the way up and on the way down)`, working: [`5t² ${MINUS} ${b}t + ${H} = 0`, `t² ${MINUS} ${t1 + t2}t + ${t1 * t2} = 0`, `(t ${MINUS} ${t1})(t ${MINUS} ${t2}) = 0`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["quadratic", "application"] });
  }
  if (v === "area") {
    const w = randInt(2, 8); const d = randInt(2, 5);
    // (2w? ) keep: length = 2w + d, area = w(2w + d)
    const A = w * (2 * w + d);
    return q({ type: "quadratic-applications", marks: 3, prompt: `A rectangle's length is ${d} m more than twice its width. Its area is ${A} m². Find its width.`, answer: `${w} m`, working: [`w(2w + ${d}) = ${A}`, `2w² + ${d}w ${MINUS} ${A} = 0`, `(w ${MINUS} ${w})(2w + ${2 * w + d}) = 0`, `w = ${w} (the negative solution is rejected)`], space: SPACE_SIZES.LARGE, mcDistractors: [`${2 * w + d} m`, `${w + d} m`, `${(A / d).toFixed(0)} m`], tags: ["quadratic", "application"] });
  }
  const n = randInt(3, 12); const d = randInt(2, 5);
  return q({ type: "quadratic-applications", marks: 3, prompt: `Two positive numbers differ by ${d} and multiply to ${n * (n + d)}. Find the numbers.`, answer: `${n} and ${n + d}`, working: [`x(x + ${d}) = ${n * (n + d)}`, `x² + ${d}x ${MINUS} ${n * (n + d)} = 0`, `(x ${MINUS} ${n})(x + ${n + d}) = 0 → x = ${n}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["quadratic", "application"] });
}

/* ── simultaneous ────────────────────────────────────────── */

function pickSystem() {
  for (;;) {
    const x = nz(-5, 5); const y = nz(-5, 5);
    const a1 = nz(-4, 4); const b1 = nz(-4, 4); const a2 = nz(-4, 4); const b2 = nz(-4, 4);
    if (a1 * b2 - a2 * b1 === 0) continue;
    return { x, y, e1: [a1, b1, a1 * x + b1 * y], e2: [a2, b2, a2 * x + b2 * y] };
  }
}
const eqText = ([a, b, c]) => `${joinTerms([mono(a, { x: 1 }), mono(b, { y: 1 })])} = ${num(c)}`;

function simultaneousGraphicalQuestion() {
  for (;;) {
    const X = randInt(-4, 4); const Y = randInt(-4, 4);
    const m1 = choice([-2, -1, 1, 2, 3]); let m2 = choice([-3, -2, -1, 0, 1, 2]);
    if (m1 === m2) continue;
    const c1 = Y - m1 * X; const c2 = Y - m2 * X;
    if (Math.abs(c1) > 7 || Math.abs(c2) > 7) continue;
    const e1 = `y = ${lin(m1, c1)}`; const e2 = m2 === 0 ? `y = ${num(c2)}` : `y = ${lin(m2, c2)}`;
    return q({
      type: "simultaneous-graphical", marks: 1,
      prompt: `The graphs of ${e1} and ${e2} are shown. Use the graph to solve the equations simultaneously.`,
      diagram: plane({ xMin: -6, xMax: 6, yMin: -6, yMax: 6, curves: [{ kind: "line", m: m1, c: c1, label: e1 }, { kind: "line", m: m2, c: c2, label: e2 }] }),
      answer: `x = ${num(X)}, y = ${num(Y)}`,
      working: [`The lines cross at (${num(X)}, ${num(Y)}).`, `Check: ${num(m1)} × ${num(X)} + ${num(c1)} = ${num(Y)}`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`x = ${num(Y)}, y = ${num(X)}`, `x = ${num(X)}, y = ${num(c1)}`, `x = ${num(-X)}, y = ${num(Y)}`],
      tags: ["simultaneous", "graphical"]
    });
  }
}

function simultaneousSubstitutionQuestion() {
  for (;;) {
    const X = nz(-6, 6); const Y = nz(-6, 6);
    const m = nz(-3, 3); const c = Y - m * X;
    const a = nz(-4, 4); const b = nz(-4, 4);
    if (a + b * m === 0) continue;
    const r = a * X + b * Y;
    return q({
      type: "simultaneous-substitution", marks: 3,
      prompt: `Solve simultaneously: y = ${lin(m, c)} and ${eqText([a, b, r])}.`,
      answer: `x = ${num(X)}, y = ${num(Y)}`,
      working: [`Substitute y = ${lin(m, c)} into the second equation: ${mono(a, { x: 1 })} ${b < 0 ? MINUS : "+"} ${Math.abs(b)}(${lin(m, c)}) = ${num(r)}`, `${lin(a + b * m, b * c)} = ${num(r)}`, `x = ${num(X)}`, `y = ${num(m)}(${num(X)}) + ${num(c)} = ${num(Y)}`],
      space: SPACE_SIZES.LARGE,
      mcDistractors: [`x = ${num(Y)}, y = ${num(X)}`, `x = ${num(X)}, y = ${num(-Y)}`, `x = ${num(-X)}, y = ${num(Y)}`],
      tags: ["simultaneous", "substitution"]
    });
  }
}

function simultaneousEliminationQuestion() {
  const S = pickSystem();
  return q({
    type: "simultaneous-elimination", marks: 3,
    prompt: `Solve simultaneously using elimination: ${eqText(S.e1)} and ${eqText(S.e2)}.`,
    answer: `x = ${num(S.x)}, y = ${num(S.y)}`,
    working: (() => {
      const [a1, b1, c1] = S.e1; const [a2, b2, c2] = S.e2;
      // eliminate x: multiply (1) by a2 and (2) by a1, then subtract
      const k1 = a2; const k2 = a1;
      const r1 = [a1 * k1, b1 * k1, c1 * k1]; const r2 = [a2 * k2, b2 * k2, c2 * k2];
      const by = r1[1] - r2[1]; const cy = r1[2] - r2[2];
      return [`(1) × ${num(k1)}: ${eqText(r1)}`, `(2) × ${num(k2)}: ${eqText(r2)}`, `Subtract: ${mono(by, { y: 1 })} = ${num(cy)}, so y = ${num(S.y)}`, `Substitute into (1): ${mono(a1, { x: 1 })} ${b1 < 0 ? MINUS : "+"} ${Math.abs(b1)}(${num(S.y)}) = ${num(c1)} → x = ${num(S.x)}`];
    })(),
    space: SPACE_SIZES.LARGE,
    mcDistractors: [`x = ${num(S.y)}, y = ${num(S.x)}`, `x = ${num(-S.x)}, y = ${num(S.y)}`, `x = ${num(S.x)}, y = ${num(-S.y)}`],
    tags: ["simultaneous", "elimination"]
  });
}

function simultaneousProblemsQuestion() {
  const v = choice(["tickets", "coins", "numbers", "cafe"]);
  if (v === "tickets") {
    const pa = choice([12, 15, 18, 20]); const pc = choice([6, 8, 10]); const A = randInt(20, 80); const C = randInt(20, 80);
    return q({ type: "simultaneous-problems", marks: 4, prompt: `A cinema sold ${A + C} tickets for $${pa * A + pc * C}. Adult tickets cost $${pa} and child tickets $${pc}. Write a pair of simultaneous equations and find how many of each were sold.`, answer: `${A} adult and ${C} child tickets`, working: [`a + c = ${A + C}`, `${pa}a + ${pc}c = ${pa * A + pc * C}`, `Solving: a = ${A}, c = ${C}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["simultaneous", "problem"] });
  }
  if (v === "coins") {
    const f = randInt(5, 25); const t = randInt(5, 25);
    return q({ type: "simultaneous-problems", marks: 4, prompt: `A jar holds ${f + t} coins, all 50c and $1 coins, worth $${fmt(0.5 * f + t)} in total. How many of each coin are there?`, answer: `${f} fifty-cent coins and ${t} one-dollar coins`, working: [`f + d = ${f + t}`, `0.5f + d = ${fmt(0.5 * f + t)}`, `Subtract: 0.5f = ${fmt(0.5 * f)} → f = ${f}, d = ${t}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["simultaneous", "problem"] });
  }
  if (v === "numbers") {
    const a = randInt(10, 40); const b = randInt(2, a - 1);
    return q({ type: "simultaneous-problems", marks: 3, prompt: `Two numbers add to ${a + b} and differ by ${a - b}. Find the numbers.`, answer: `${a} and ${b}`, working: [`x + y = ${a + b}`, `x − y = ${a - b}`, `Add: 2x = ${2 * a} → x = ${a}, y = ${b}`], space: SPACE_SIZES.LARGE, mcDistractors: [`${a + 1} and ${b - 1}`, `${a + b} and ${a - b}`], tags: ["simultaneous", "problem"] });
  }
  const c = choice([4, 5, 6]); const m = choice([3, 4, 5]); const nc = randInt(2, 5); const nm = randInt(2, 5);
  const nc2 = randInt(2, 5); const nm2 = randInt(2, 5);
  if (nc * nm2 === nc2 * nm) return simultaneousProblemsQuestion();
  return q({ type: "simultaneous-problems", marks: 4, prompt: `${nc} coffees and ${nm} muffins cost $${nc * c + nm * m}. ${nc2} coffees and ${nm2} muffins cost $${nc2 * c + nm2 * m}. Find the price of a coffee and of a muffin.`, answer: `Coffee $${c}, muffin $${m}`, working: [`${nc}c + ${nm}m = ${nc * c + nm * m}`, `${nc2}c + ${nm2}m = ${nc2 * c + nm2 * m}`, `Solve simultaneously: c = ${c}, m = ${m}`], space: SPACE_SIZES.LARGE, mcEligible: false, tags: ["simultaneous", "problem"] });
}

function multiPartEquationsCQuestion() {
  const x = "x";
  const S = pickSystem();
  const b = nz(-6, 6); const c = nz(-9, 9);
  const D = b * b - 4 * c;
  return q({
    type: "multi-part-equations-c", marks: 5,
    prompt: "Answer each part.",
    subparts: [
      { label: "(a)", prompt: "Make r the subject of C = 2πr.", marks: 1, answer: `r = ${afrac("C", "2π")}`, working: ["Divide by 2π."] },
      { label: "(b)", prompt: `Find the discriminant of ${poly([1, b, c], x)} = 0 and state the number of real solutions.`, marks: 2, answer: `Δ = ${num(D)}; ${D > 0 ? "two" : D === 0 ? "one" : "no"} real solution${D === 0 ? "" : "s"}`, working: [`${b * b} ${MINUS} ${4 * c < 0 ? `(${num(4 * c)})` : 4 * c}`] },
      { label: "(c)", prompt: `Solve simultaneously: ${eqText(S.e1)} and ${eqText(S.e2)}.`, marks: 2, answer: `x = ${num(S.x)}, y = ${num(S.y)}`, working: ["Elimination or substitution."] }
    ],
    answer: `(a) r = ${afrac("C", "2π")}; (b) Δ = ${num(D)}; (c) x = ${num(S.x)}, y = ${num(S.y)}`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    tags: ["multi-part"]
  });
}

const GENERATORS = {
  "multi-step-linear": multiStepLinearQuestion,
  "two-fractions": twoFractionsQuestion,
  "change-subject": changeSubjectQuestion,
  "non-monic-solve": nonMonicSolveQuestion,
  "quadratic-formula-exact": quadraticFormulaExactQuestion,
  "quadratic-formula-rounded": quadraticFormulaRoundedQuestion,
  "complete-square-solve": completeSquareSolveQuestion,
  "discriminant": discriminantQuestion,
  "quadratic-applications": quadraticApplicationsQuestion,
  "simultaneous-graphical": simultaneousGraphicalQuestion,
  "simultaneous-substitution": simultaneousSubstitutionQuestion,
  "simultaneous-elimination": simultaneousEliminationQuestion,
  "simultaneous-problems": simultaneousProblemsQuestion,
  "multi-part-equations-c": multiPartEquationsCQuestion
};

export function getEquationsCQuestionTypes() { return TYPE_LIST; }
export function generateEquationsCQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
