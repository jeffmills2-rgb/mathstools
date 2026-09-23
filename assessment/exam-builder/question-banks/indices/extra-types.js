/*
  Mills Maths Tools — Indices: HCF and LCM by prime factorisation
  ----------------------------------------------------------------
  question-banks/indices/extra-types.js

  MA4-IND-C-01 asks students to use prime factorisation — written in index
  notation — to find the highest common factor and lowest common multiple of
  two numbers. The original bank factorises single numbers only; this type
  closes the gap. Appended to the bank's registry by index.js.
*/

import { SPACE_SIZES, choice, makeQuestion } from "../_shared/bank-helpers.js";

const TOPIC = "Indices";
const q = spec => makeQuestion(TOPIC, spec);
const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

export const EXTRA_INDICES_TYPES = [
  { id: "hcf-lcm-prime-factors", label: "HCF and LCM using prime factorisation" }
];

function factorMap(n) {
  const m = new Map();
  let x = n;
  for (let p = 2; p * p <= x; p++) while (x % p === 0) { m.set(p, (m.get(p) || 0) + 1); x /= p; }
  if (x > 1) m.set(x, (m.get(x) || 0) + 1);
  return m;
}

function indexForm(m) {
  return [...m.entries()].sort((a, b) => a[0] - b[0])
    .map(([p, e]) => (e === 1 ? String(p) : `${p}${String(e).split("").map(d => SUP[d]).join("")}`))
    .join(" × ");
}

function combine(a, b, pick) {
  const out = new Map();
  new Set([...a.keys(), ...b.keys()]).forEach(p => {
    const e = pick(a.get(p) || 0, b.get(p) || 0);
    if (e > 0) out.set(p, e);
  });
  return out;
}

const value = m => [...m.entries()].reduce((v, [p, e]) => v * p ** e, 1);

const PAIRS = [[12, 18], [24, 36], [20, 30], [18, 45], [28, 42], [36, 60], [40, 64], [48, 72], [54, 90], [60, 84], [72, 108], [45, 75], [16, 40], [30, 105], [84, 126], [90, 150]];

function hcfLcmQuestion() {
  const [a, b] = choice(PAIRS);
  const fa = factorMap(a);
  const fb = factorMap(b);
  const h = combine(fa, fb, Math.min);
  const l = combine(fa, fb, Math.max);
  const ask = choice(["hcf", "lcm", "both", "both"]);
  const H = value(h);
  const L = value(l);
  const lines = [
    `${a} = ${indexForm(fa)}`,
    `${b} = ${indexForm(fb)}`,
    ...(ask !== "lcm" ? [`HCF: the LOWER power of each common prime: ${indexForm(h) || "1"} = ${H}`] : []),
    ...(ask !== "hcf" ? [`LCM: the HIGHER power of every prime: ${indexForm(l)} = ${L}`] : [])
  ];
  return q({
    type: "hcf-lcm-prime-factors",
    marks: ask === "both" ? 3 : 2,
    prompt: ask === "both"
      ? `Write ${a} and ${b} as products of prime factors in index form. Hence find their highest common factor (HCF) and lowest common multiple (LCM).`
      : `Use prime factorisation to find the ${ask === "hcf" ? "highest common factor (HCF)" : "lowest common multiple (LCM)"} of ${a} and ${b}.`,
    answer: ask === "both" ? `${a} = ${indexForm(fa)}, ${b} = ${indexForm(fb)}; HCF = ${H}, LCM = ${L}` : String(ask === "hcf" ? H : L),
    working: lines,
    space: ask === "both" ? SPACE_SIZES.LARGE : SPACE_SIZES.MEDIUM,
    tags: ["indices", "prime factorisation", "HCF", "LCM"]
  });
}

export const EXTRA_INDICES_GENERATORS = {
  "hcf-lcm-prime-factors": hcfLcmQuestion
};
