/*
  Mills Maths Tools — shared algebra formatting for the Stage 5 banks
  --------------------------------------------------------------------
  question-banks/_shared/algebra-helpers.js

  Stage 5 prints a lot of algebra, and every bank used to carry its own copy
  of "write 3x² − x + 1 properly". These are the one copy for the Stage 5
  banks added on 2026-09-25. Conventions (same as the rest of the site):

    - typographic minus (−, U+2212) everywhere, never a hyphen
    - coefficient 1 is dropped (x, not 1x); −1 becomes −x
    - integer indices as Unicode superscripts (x², a⁻³); anything else
      (fractional or algebraic indices) as the [[sup:…]] token
    - numeric fractions as [[frac:n:d]], algebraic ones as [[algfrac:n:d]];
      a negative fraction is written −[[frac:1:2]], never [[frac:-1:2]]
*/

import { gcd } from "./bank-helpers.js";

export const MINUS = "−";

const SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "−": "⁻" };

/* Integer superscript: sup(2) → "²", sup(-3) → "⁻³"; anything else → token. */
export function sup(v) {
  const s = String(v);
  if (/^[−-]?\d+$/.test(s)) return s.split("").map(c => SUP[c]).join("");
  return `[[sup:${s}]]`;
}

/* A signed number with a typographic minus. */
export function num(n) {
  return n < 0 ? `${MINUS}${Math.abs(n)}` : String(n);
}

/* Power of a variable: pw("x", 1) → "x", pw("x", 0) → "", pw("x", 3) → "x³". */
export function pw(v, e) {
  if (e === 0) return "";
  if (e === 1) return v;
  return `${v}${sup(e)}`;
}

/*
  A monomial: mono(−3, { x: 2, y: 1 }) → "−3x²y". Variables print in the
  order given; a zero exponent drops the variable. Coefficient ±1 is dropped
  unless there are no variables.
*/
export function mono(coef, vars = {}) {
  const body = Object.entries(vars).map(([v, e]) => pw(v, e)).join("");
  if (coef === 0) return "0";
  if (!body) return num(coef);
  if (coef === 1) return body;
  if (coef === -1) return `${MINUS}${body}`;
  return `${num(coef)}${body}`;
}

/*
  Join terms into an expression, fixing the signs: ["x²", "−5x", "6"] →
  "x² − 5x + 6". Empty and "0" terms are dropped (unless all are).
*/
export function joinTerms(terms) {
  const t = terms.filter(s => s && s !== "0");
  if (!t.length) return "0";
  return t.map((s, i) => {
    const neg = s.startsWith(MINUS);
    const body = neg ? s.slice(1) : s;
    if (i === 0) return neg ? `${MINUS}${body}` : body;
    return neg ? ` ${MINUS} ${body}` : ` + ${body}`;
  }).join("");
}

/* Polynomial from coefficients, highest power first: poly([1, −5, 6]) → "x² − 5x + 6". */
export function poly(coeffs, v = "x") {
  const n = coeffs.length - 1;
  return joinTerms(coeffs.map((c, i) => mono(c, { [v]: n - i })));
}

/* ax + b: lin(2, −3) → "2x − 3". */
export function lin(a, b, v = "x") {
  return joinTerms([mono(a, { [v]: 1 }), num(b)]);
}

/* A bracketed binomial: bin(1, 3) → "(x + 3)", bin(2, −1) → "(2x − 1)". */
export function bin(a, b, v = "x") {
  return `(${lin(a, b, v)})`;
}

/* Numeric fraction token, simplified, sign outside: rat(−2, 4) → "−[[frac:1:2]]". */
export function rat(n, d) {
  if (d === 0) return "undefined";
  if (n === 0) return "0";
  const sign = (n < 0) !== (d < 0) ? MINUS : "";
  const g = gcd(n, d);
  const a = Math.abs(n) / g;
  const b = Math.abs(d) / g;
  return b === 1 ? `${sign}${a}` : `${sign}[[frac:${a}:${b}]]`;
}

/* Plain-text version for working lines: ratText(−2, 4) → "−1/2". */
export function ratText(n, d) {
  if (n === 0) return "0";
  const sign = (n < 0) !== (d < 0) ? MINUS : "";
  const g = gcd(n, d);
  const a = Math.abs(n) / g;
  const b = Math.abs(d) / g;
  return b === 1 ? `${sign}${a}` : `${sign}${a}/${b}`;
}

/* Algebraic fraction token. */
export function afrac(top, bottom) {
  return `[[algfrac:${top}:${bottom}]]`;
}

/* Exact rational arithmetic, for answers that must stay exact. */
export class Q {
  constructor(n, d = 1) {
    if (d === 0) throw new Error("zero denominator");
    const s = d < 0 ? -1 : 1;
    const g = gcd(n, d);
    this.n = (s * n) / g;
    this.d = Math.abs(d) / g;
  }
  static of(x) { return x instanceof Q ? x : new Q(x, 1); }
  add(o) { o = Q.of(o); return new Q(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = Q.of(o); return new Q(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = Q.of(o); return new Q(this.n * o.n, this.d * o.d); }
  div(o) { o = Q.of(o); return new Q(this.n * o.d, this.d * o.n); }
  neg() { return new Q(-this.n, this.d); }
  eq(o) { o = Q.of(o); return this.n === o.n && this.d === o.d; }
  get value() { return this.n / this.d; }
  isInt() { return this.d === 1; }
  toString() { return rat(this.n, this.d); }
  text() { return ratText(this.n, this.d); }
}

/* Expand a·Π(x − rᵢ) into coefficients (highest power first). */
export function fromRoots(a, roots) {
  let c = [a];
  roots.forEach(r => {
    const next = Array(c.length + 1).fill(0);
    c.forEach((k, i) => { next[i] += k; next[i + 1] -= k * r; });
    c = next;
  });
  return c;
}

/* Evaluate coefficients (highest first) at x. */
export function evalPoly(coeffs, x) {
  return coeffs.reduce((acc, k) => acc * x + k, 0);
}

/* Integer square root if n is a perfect square, else null. */
export function isqrt(n) {
  if (n < 0) return null;
  const r = Math.round(Math.sqrt(n));
  return r * r === n ? r : null;
}

/* Simplest surd form of √n: surd(72) → { out: 6, in: 2 } meaning 6√2. */
export function surdParts(n) {
  let out = 1;
  let inside = n;
  for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) {
    if (inside % (k * k) === 0) { out *= k; inside /= k * k; }
  }
  return { out, in: inside };
}

/* Write a·√b: surdText(6, 2) → "6√2", surdText(1, 5) → "√5", surdText(4, 1) → "4". */
export function surdText(a, b) {
  if (b === 1) return num(a);
  if (a === 0) return "0";
  if (a === 1) return `√${b}`;
  if (a === -1) return `${MINUS}√${b}`;
  return `${num(a)}√${b}`;
}
