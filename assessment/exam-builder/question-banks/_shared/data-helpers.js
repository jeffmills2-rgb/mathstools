/*
  Mills Maths Tools — shared data for the Stage 4 statistics banks
  -----------------------------------------------------------------
  question-banks/_shared/data-helpers.js

  Contexts, dataset generators and the summary statistics used by both
  "Data Classification and Visualisation" (MA4-DAT-C-01) and "Data Analysis"
  (MA4-DAT-C-02). Every dataset is generated as raw values first, and every
  display and answer is computed from those values, so a table, a graph and
  its answer key can never drift apart.
*/

import { randInt, choice, shuffle } from "./bank-helpers.js";

/* ── summary statistics ──────────────────────────────────── */

export function sum(values) {
  return values.reduce((s, v) => s + v, 0);
}

export function mean(values) {
  return sum(values) / values.length;
}

export function median(values) {
  const s = values.slice().sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/* Every value that occurs most often; [] when every value occurs once. */
export function modes(values) {
  const counts = new Map();
  values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
  const top = Math.max(...counts.values());
  if (top === 1) return [];
  return [...counts.entries()].filter(([, c]) => c === top).map(([v]) => v).sort((a, b) => a - b);
}

export function range(values) {
  return Math.max(...values) - Math.min(...values);
}

export function round(v, dp = 2) {
  return Math.round(v * 10 ** dp) / 10 ** dp;
}

export function sorted(values) {
  return values.slice().sort((a, b) => a - b);
}

/* ── variable classification ─────────────────────────────── */

export const CLASSES = {
  "numerical-discrete": "Numerical (discrete)",
  "numerical-continuous": "Numerical (continuous)",
  "categorical-nominal": "Categorical (nominal)",
  "categorical-ordinal": "Categorical (ordinal)"
};

export const VARIABLES = [
  { text: "the number of people living in a household", type: "numerical-discrete", why: "It is counted, so it can only take whole-number values." },
  { text: "the number of goals scored in a soccer match", type: "numerical-discrete", why: "Goals are counted." },
  { text: "the number of text messages sent in a day", type: "numerical-discrete", why: "Messages are counted." },
  { text: "the number of pets a student owns", type: "numerical-discrete", why: "Pets are counted." },
  { text: "the number of cars passing the school gate in an hour", type: "numerical-discrete", why: "Cars are counted." },
  { text: "shoe size", type: "numerical-discrete", why: "Shoe sizes come in separate steps (such as 8, 8½, 9), with no values in between." },
  { text: "the height of a student in centimetres", type: "numerical-continuous", why: "Height is measured and can take any value in a range." },
  { text: "the time taken to run 100 m", type: "numerical-continuous", why: "Time is measured, not counted." },
  { text: "the mass of a newborn baby", type: "numerical-continuous", why: "Mass is measured." },
  { text: "the daily maximum temperature", type: "numerical-continuous", why: "Temperature is measured on a continuous scale." },
  { text: "the length of a fish caught", type: "numerical-continuous", why: "Length is measured." },
  { text: "the volume of water used in a shower", type: "numerical-continuous", why: "Volume is measured." },
  { text: "a student's favourite sport", type: "categorical-nominal", why: "The answers are names of categories with no natural order." },
  { text: "the colour of cars in a car park", type: "categorical-nominal", why: "Colours are categories with no order." },
  { text: "the country a person was born in", type: "categorical-nominal", why: "Countries are categories with no order." },
  { text: "the type of pet a family owns", type: "categorical-nominal", why: "Types of pet are categories with no order." },
  { text: "the way students travel to school", type: "categorical-nominal", why: "Bus, car, walk… are categories with no order." },
  { text: "T-shirt size (S, M, L, XL)", type: "categorical-ordinal", why: "The sizes are categories that have a natural order." },
  { text: "a movie rating from 1 star to 5 stars", type: "categorical-ordinal", why: "The ratings are ordered categories; the stars are labels, not measurements." },
  { text: "level of agreement (disagree, neutral, agree)", type: "categorical-ordinal", why: "The responses are categories with a natural order." },
  { text: "a school report grade (A, B, C, D, E)", type: "categorical-ordinal", why: "Grades are ordered categories." },
  { text: "the level of spiciness of a meal (mild, medium, hot)", type: "categorical-ordinal", why: "The categories have a natural order." }
];

/* ── contexts ────────────────────────────────────────────── */

export const CATEGORICAL_CONTEXTS = [
  { title: "Favourite fruit", xLabel: "Fruit", unit: "students", cats: ["Apple", "Banana", "Orange", "Grape", "Mango"] },
  { title: "How students travel to school", xLabel: "Method", unit: "students", cats: ["Walk", "Bus", "Car", "Bike", "Train"] },
  { title: "Favourite sport", xLabel: "Sport", unit: "students", cats: ["Soccer", "Netball", "Cricket", "Basketball", "Swimming"] },
  { title: "Type of pet owned", xLabel: "Pet", unit: "families", cats: ["Dog", "Cat", "Fish", "Bird", "Rabbit"] },
  { title: "Canteen lunch orders", xLabel: "Item", unit: "orders", cats: ["Wrap", "Sushi", "Pasta", "Salad", "Burger"] },
  { title: "Eye colour", xLabel: "Colour", unit: "students", cats: ["Brown", "Blue", "Green", "Hazel"] },
  { title: "Favourite music genre", xLabel: "Genre", unit: "students", cats: ["Pop", "Hip hop", "Rock", "Country", "Classical"] }
];

export const DISCRETE_CONTEXTS = [
  { name: "number of siblings", unit: "students", lo: 0, hi: 5 },
  { name: "number of pets owned", unit: "students", lo: 0, hi: 4 },
  { name: "goals scored per game", unit: "games", lo: 0, hi: 6 },
  { name: "books read last month", unit: "students", lo: 0, hi: 6 },
  { name: "number of people in a car", unit: "cars", lo: 1, hi: 5 },
  { name: "number of hours of sport played per week", unit: "students", lo: 0, hi: 7 }
];

export const CONTINUOUS_CONTEXTS = [
  { name: "height", unit: "cm", lo: 140, width: 10, bins: 5, who: "Year 8 students" },
  { name: "mass", unit: "kg", lo: 40, width: 5, bins: 5, who: "Year 8 students" },
  { name: "reaction time", unit: "ms", lo: 200, width: 20, bins: 5, who: "students" },
  { name: "long jump distance", unit: "cm", lo: 250, width: 25, bins: 5, who: "athletes" },
  { name: "time to solve a puzzle", unit: "s", lo: 20, width: 10, bins: 5, who: "students" }
];

export const TWO_DIGIT_CONTEXTS = [
  { name: "test marks (out of 60)", short: "test marks", lo: 18, hi: 59 },
  { name: "ages of people at a gym class", short: "ages", lo: 16, hi: 64 },
  { name: "numbers of push-ups completed", short: "push-ups", lo: 10, hi: 48 },
  { name: "heart rates (beats per minute)", short: "heart rates", lo: 58, hi: 99 },
  { name: "daily maximum temperatures (°C)", short: "temperatures", lo: 14, hi: 38 },
  { name: "minutes spent on homework", short: "minutes", lo: 12, hi: 55 }
];

/* ── dataset generators ──────────────────────────────────── */

/* Category counts, all different so "most/least" questions have one answer. */
export function categoricalData({ min = 3, max = 18, n = null } = {}) {
  const ctx = choice(CATEGORICAL_CONTEXTS);
  const k = n || Math.min(ctx.cats.length, choice([4, 5]));
  const cats = ctx.cats.slice(0, k);
  let values;
  do { values = cats.map(() => randInt(min, max)); } while (new Set(values).size < values.length);
  return { ...ctx, cats, values };
}

/* Raw discrete values with a sensible spread. */
export function discreteData({ n = null, ctx = choice(DISCRETE_CONTEXTS) } = {}) {
  const count = n || randInt(12, 22);
  // A rough bell around a centre inside the range, so the display looks like
  // real data: not piled up against one end, and at least three values used.
  for (let tries = 0; tries < 100; tries++) {
    const centre = randInt(ctx.lo + 1, ctx.hi - 1);
    const sd = (ctx.hi - ctx.lo) / 3.2;
    const data = Array.from({ length: count }, () => {
      const z = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
      return Math.max(ctx.lo, Math.min(ctx.hi, Math.round(centre + z * sd)));
    });
    const top = Math.max(...frequencyFromData(data, ctx.lo, ctx.hi).map(r => r.freq));
    if (new Set(data).size >= 3 && top <= Math.ceil(count * 0.45)) return { ctx, data };
  }
  return { ctx, data: Array.from({ length: count }, (_, i) => ctx.lo + (i % (ctx.hi - ctx.lo + 1))) };
}

export function frequencyFromData(data, lo, hi) {
  const rows = [];
  for (let v = lo; v <= hi; v++) rows.push({ value: v, freq: data.filter(d => d === v).length });
  return rows;
}

/* Grouped continuous data: counts per class, and the class list. */
export function groupedData(ctx = choice(CONTINUOUS_CONTEXTS)) {
  const counts = shuffle([2, 4, 7, 9, 5, 3, 6, 8, 1]).slice(0, ctx.bins);
  // Nudge into a rough hump so the display looks like data, not noise.
  const hump = counts.slice().sort((a, b) => a - b);
  const shaped = [hump[0], hump[2], hump[4], hump[3], hump[1]].slice(0, ctx.bins);
  const bins = shaped.map((c, i) => ({ lo: ctx.lo + i * ctx.width, hi: ctx.lo + (i + 1) * ctx.width, count: c }));
  return { ctx, bins };
}

/* Two-digit data for stem-and-leaf plots. */
export function twoDigitData({ n = null, ctx = choice(TWO_DIGIT_CONTEXTS) } = {}) {
  const count = n || randInt(11, 18);
  const data = Array.from({ length: count }, () => randInt(ctx.lo, ctx.hi));
  return { ctx, data };
}

export function stemLeafRows(data, { left = null } = {}) {
  const all = left ? [...data, ...left] : data;
  const lo = Math.floor(Math.min(...all) / 10);
  const hi = Math.floor(Math.max(...all) / 10);
  const rows = [];
  for (let s = lo; s <= hi; s++) {
    const leaves = sorted(data.filter(v => Math.floor(v / 10) === s)).map(v => v % 10);
    const row = { stem: s, leaves };
    if (left) row.left = sorted(left.filter(v => Math.floor(v / 10) === s)).map(v => v % 10);
    rows.push(row);
  }
  return rows;
}

export function listText(values) {
  return values.join(", ");
}
