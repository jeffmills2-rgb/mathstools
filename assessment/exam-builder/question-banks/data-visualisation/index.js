/*
  Mills Maths Tools — Stage 4 Question Bank: Data Classification and Visualisation
  ---------------------------------------------------------------------------------
  question-banks/data-visualisation/index.js

  NSW Mathematics K–10 (2022), Stage 4, MA4-DAT-C-01:
    "classifies and displays data using a variety of graphical representations"

  Content covered (docs/stage-4-syllabus-reference.md has the mapping):
    - classifying variables: numerical (discrete, continuous) and categorical
      (nominal, ordinal), with reasons
    - collecting data: primary and secondary sources, census and sample, bias
    - organising data in frequency tables
    - reading and interpreting column, bar, dot plot, stem-and-leaf, histogram
      and frequency polygon, line, sector (pie), divided bar and pictogram
      displays
    - constructing displays (sector angles; drawing on provided axes)
    - choosing the most appropriate display, and recognising misleading ones

  Every graph is drawn by engines/statistics/statistics-engine.js from the
  same values the answer is computed from; tools/stage4-data.mjs recounts.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, sample, makeQuestion, generateFromRegistry, fmt, spaced, capitalise
} from "../_shared/bank-helpers.js";

import {
  CLASSES, VARIABLES, categoricalData, discreteData, frequencyFromData, groupedData,
  twoDigitData, stemLeafRows, sum, listText, CATEGORICAL_CONTEXTS
} from "../_shared/data-helpers.js";

const TOPIC = "Data Classification and Visualisation";

const TYPE_LIST = [
  { id: "classify-variable", label: "Classify variables" },
  { id: "variable-reasoning", label: "Discrete or continuous? Nominal or ordinal? (reasons)" },
  { id: "collecting-data", label: "Collecting data: census, sample and bias" },
  { id: "frequency-table", label: "Complete a frequency table" },
  { id: "read-column-graph", label: "Read column and bar graphs" },
  { id: "read-dot-plot", label: "Read dot plots" },
  { id: "read-stem-leaf", label: "Read stem-and-leaf plots" },
  { id: "read-histogram", label: "Read histograms and frequency polygons" },
  { id: "read-sector-graph", label: "Read sector (pie) graphs" },
  { id: "sector-angles", label: "Calculate sector angles" },
  { id: "read-divided-bar", label: "Read divided bar graphs" },
  { id: "read-line-graph", label: "Read and interpret line graphs" },
  { id: "read-pictogram", label: "Read pictograms" },
  { id: "construct-graph", label: "Construct a graph on the axes provided" },
  { id: "choose-display", label: "Choose the most appropriate display" },
  { id: "misleading-graphs", label: "Misleading graphs" },
  { id: "multi-part-data", label: "Multi-part data display problem" }
];

const q = spec => makeQuestion(TOPIC, spec);
const chart = config => ({ engine: "statistics-engine", config });
const CLASS_NAMES = Object.values(CLASSES);

/* ── classification ──────────────────────────────────────── */

function classifyVariableQuestion() {
  const v = choice(VARIABLES);
  return q({
    type: "classify-variable",
    marks: 1,
    prompt: `Classify this variable: ${v.text}.`,
    answer: CLASSES[v.type],
    working: [v.why, CLASSES[v.type]],
    space: SPACE_SIZES.SMALL,
    mcDistractors: CLASS_NAMES.filter(c => c !== CLASSES[v.type]),
    tags: ["data", "classify"]
  });
}

function variableReasoningQuestion() {
  if (Math.random() < 0.5) {
    const v = choice(VARIABLES.filter(x => x.type.startsWith("numerical")));
    const kind = v.type.endsWith("discrete") ? "Discrete" : "Continuous";
    return q({
      type: "variable-reasoning",
      marks: 2,
      prompt: `Is ${v.text} discrete or continuous numerical data? Explain your answer.`,
      answer: `${kind}. ${v.why}`,
      working: [kind === "Discrete" ? "Discrete data is counted and takes separate values." : "Continuous data is measured and can take any value in a range.", v.why],
      space: SPACE_SIZES.MEDIUM,
      tags: ["data", "classify", "reasoning"]
    });
  }
  const v = choice(VARIABLES.filter(x => x.type.startsWith("categorical")));
  const kind = v.type.endsWith("nominal") ? "Nominal" : "Ordinal";
  return q({
    type: "variable-reasoning",
    marks: 2,
    prompt: `Is ${v.text} nominal or ordinal categorical data? Explain your answer.`,
    answer: `${kind}. ${v.why}`,
    working: [kind === "Nominal" ? "Nominal categories have no natural order." : "Ordinal categories have a natural order.", v.why],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "classify", "reasoning"]
  });
}

const COLLECTING = [
  { p: "A school wants to know the favourite canteen item of all 900 students. It surveys every student. Is this a census or a sample?", a: "Census", d: ["Sample", "Secondary data", "Observation"], why: "Every member of the population is surveyed." },
  { p: "A council asks 200 residents, chosen at random, about a new skate park. Is this a census or a sample?", a: "Sample", d: ["Census", "Secondary data", "Biased census"], why: "Only part of the population is surveyed." },
  { p: "Jess uses rainfall figures published by the Bureau of Meteorology. Is this primary or secondary data?", a: "Secondary data", d: ["Primary data", "Census", "Sample"], why: "The data was collected by someone else." },
  { p: "Omar times his classmates running 100 m himself. Is this primary or secondary data?", a: "Primary data", d: ["Secondary data", "Census", "Biased sample"], why: "Omar collected the data himself." },
  { p: "To find the most popular sport at school, Kai surveys only the members of the basketball team. Why is this sample biased?", a: "It is not representative: basketball players are more likely to choose basketball.", d: [], why: "A sample must represent the whole population." },
  { p: "A survey about public transport is only handed out at a train station. Explain why the results may be biased.", a: "People at a train station already use trains, so they do not represent the whole population.", d: [], why: "The sample is not representative." },
  { p: "A cereal company wants to check every box is full. Why would it test a sample rather than conduct a census?", a: "Testing means opening the boxes; testing every box would destroy the whole product, and a census would take too long and cost too much.", d: [], why: "A census is impractical here." },
  { p: "An online poll asks \"Do you use the internet every day?\" Explain why the results are likely to be biased.", a: "Only people who are online can answer, so almost everyone who responds uses the internet daily.", d: [], why: "The method of collection excludes people who are not online." }
];

function collectingDataQuestion() {
  const c = choice(COLLECTING);
  const oneMark = c.d.length >= 3;
  return q({
    type: "collecting-data",
    marks: oneMark ? 1 : 2,
    prompt: c.p,
    answer: c.a,
    working: [c.why, c.a],
    space: oneMark ? SPACE_SIZES.SMALL : SPACE_SIZES.MEDIUM,
    ...(oneMark ? { mcDistractors: c.d } : { mcEligible: false }),
    tags: ["data", "collection"]
  });
}

/* ── frequency tables ────────────────────────────────────── */

function frequencyTableQuestion() {
  const { ctx, data } = discreteData({ n: randInt(14, 22) });
  const rows = frequencyFromData(data, ctx.lo, ctx.hi);
  const blanks = new Set(sample(rows.map((_, i) => i), randInt(Math.min(2, rows.length - 1), rows.length - 1)));
  const askTotal = Math.random() < 0.6;
  return q({
    type: "frequency-table",
    marks: 2,
    prompt: `The ${ctx.name} for a group of ${ctx.unit} were recorded: ${listText(data)}. Complete the frequency table${askTotal ? ", including the total" : ""}.`,
    table: {
      headerRow: true,
      rows: [
        [capitalise(ctx.name), "Tally", "Frequency"],
        ...rows.map((r, i) => [String(r.value), "", blanks.has(i) ? "" : String(r.freq)]),
        ...(askTotal ? [["Total", "", ""]] : [])
      ]
    },
    answer: `${rows.map(r => `${r.value}: ${r.freq}`).join("; ")}${askTotal ? `; total ${data.length}` : ""}`,
    working: [
      "Tally each value, then count the tallies.",
      rows.map(r => `${r.value} → ${r.freq}`).join(", "),
      ...(askTotal ? [`Total = ${data.length} (the number of data values)`] : [])
    ],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["data", "frequency table"]
  });
}

/* ── reading displays ────────────────────────────────────── */

function readColumnGraphQuestion() {
  const d = categoricalData({ min: 2, max: 16 });
  const horizontal = Math.random() < 0.3;
  const config = horizontal
    ? { chartType: "bar", title: d.title, xLabel: `Number of ${d.unit}`, categories: d.cats, values: d.values, xStep: d.values.some(v => v > 12) ? 2 : 1 }
    : { chartType: "column", title: d.title, xLabel: d.xLabel, yLabel: `Number of ${d.unit}`, categories: d.cats, values: d.values, yStep: 2 };
  const variant = choice(["most", "least", "difference", "total", "fraction"]);
  const iMax = d.values.indexOf(Math.max(...d.values));
  const iMin = d.values.indexOf(Math.min(...d.values));
  const [a, b] = sample([0, 1, 2, 3].filter(i => i < d.cats.length), 2);
  const total = sum(d.values);
  const specs = {
    most: { p: `Which ${d.xLabel.toLowerCase()} was the most popular?`, a: d.cats[iMax], w: [`The tallest bar is ${d.cats[iMax]} (${d.values[iMax]}).`], dis: d.cats.filter((_, i) => i !== iMax) },
    least: { p: `Which ${d.xLabel.toLowerCase()} was the least popular?`, a: d.cats[iMin], w: [`The shortest bar is ${d.cats[iMin]} (${d.values[iMin]}).`], dis: d.cats.filter((_, i) => i !== iMin) },
    difference: { p: `How many more ${d.unit} chose ${d.cats[a]} than ${d.cats[b]}?`, a: String(d.values[a] - d.values[b]), w: [`${d.cats[a]}: ${d.values[a]}, ${d.cats[b]}: ${d.values[b]}`, `${d.values[a]} − ${d.values[b]} = ${d.values[a] - d.values[b]}`], dis: null },
    total: { p: `How many ${d.unit} were surveyed altogether?`, a: String(total), w: [`${d.values.join(" + ")} = ${total}`], dis: [String(total - d.values[0]), String(Math.max(...d.values)), String(total + 2)] },
    fraction: { p: `What fraction of the ${d.unit} chose ${d.cats[a]}?`, a: `[[frac:${d.values[a]}:${total}]]`, w: [`${d.values[a]} out of ${total}`], dis: null }
  };
  const s = specs[variant];
  if (variant === "difference" && d.values[a] <= d.values[b]) return readColumnGraphQuestion();
  if (variant === "fraction") {
    const g = gcdLocal(d.values[a], total);
    s.a = total / g === 1 ? "1" : `[[frac:${d.values[a] / g}:${total / g}]]`;
    s.w.push(g > 1 ? `= ${d.values[a] / g}/${total / g}` : "(already in simplest form)");
  }
  return q({
    type: "read-column-graph",
    marks: variant === "fraction" || variant === "total" ? 2 : 1,
    prompt: s.p,
    diagram: chart(config),
    answer: s.a,
    working: s.w,
    space: SPACE_SIZES.SMALL,
    ...(s.dis ? { mcDistractors: s.dis } : {}),
    tags: ["data", "column graph"]
  });
}

function gcdLocal(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

function readDotPlotQuestion() {
  const { ctx, data } = discreteData({ n: randInt(12, 20) });
  const variant = choice(["count", "most-common", "at-least", "fewer-than", "percent"]);
  const counts = frequencyFromData(data, ctx.lo, ctx.hi);
  const top = Math.max(...counts.map(r => r.freq));
  const modeRows = counts.filter(r => r.freq === top);
  if (variant === "most-common" && modeRows.length > 1) return readDotPlotQuestion();
  const k = randInt(ctx.lo + 1, ctx.hi - 1);
  const atLeast = data.filter(v => v >= k).length;
  const fewer = data.filter(v => v < k).length;
  const specs = {
    count: { p: `How many ${ctx.unit} are shown on the dot plot?`, a: String(data.length), w: ["Count every dot.", `${data.length} dots`] },
    "most-common": { p: `What is the most common ${ctx.name}?`, a: String(modeRows[0].value), w: [`The tallest column of dots is at ${modeRows[0].value} (${top} dots).`] },
    "at-least": { p: `How many ${ctx.unit} had ${k} or more?`, a: String(atLeast), w: [`Count the dots at ${k} and above: ${counts.filter(r => r.value >= k).map(r => r.freq).join(" + ")} = ${atLeast}`] },
    "fewer-than": { p: `How many ${ctx.unit} had fewer than ${k}?`, a: String(fewer), w: [`Count the dots below ${k}: ${counts.filter(r => r.value < k).map(r => r.freq).join(" + ")} = ${fewer}`] },
    percent: { p: `What percentage of the ${ctx.unit} had ${k} or more? Give your answer to the nearest whole percent.`, a: `${Math.round(atLeast / data.length * 100)}%`, w: [`${atLeast} out of ${data.length}`, `${atLeast} ÷ ${data.length} × 100 ≈ ${Math.round(atLeast / data.length * 100)}%`] }
  };
  const s = specs[variant];
  const n0 = Number(s.a.replace("%", ""));
  const dis = variant === "most-common"
    ? counts.filter(r => r.value !== modeRows[0].value).map(r => String(r.value))
    : [n0 + 1, n0 + 2, Math.max(0, n0 - 1) === n0 ? n0 + 3 : Math.max(0, n0 - 1)].map(v => `${v}${variant === "percent" ? "%" : ""}`);
  return q({
    type: "read-dot-plot",
    mcDistractors: dis,
    marks: variant === "percent" ? 2 : 1,
    prompt: s.p,
    diagram: chart({ chartType: "dot-plot", data, min: ctx.lo, max: ctx.hi, xLabel: capitalise(ctx.name) }),
    answer: s.a,
    working: s.w,
    space: SPACE_SIZES.SMALL,
    tags: ["data", "dot plot"]
  });
}

function readStemLeafQuestion() {
  const { ctx, data } = twoDigitData();
  const rows = stemLeafRows(data);
  const s0 = rows[0].stem;
  const example = rows.find(r => r.leaves.length);
  const key = `${example.stem} | ${example.leaves[0]} = ${example.stem * 10 + example.leaves[0]}`;
  const variant = choice(["smallest", "largest", "count", "above", "stem-count"]);
  const srt = data.slice().sort((a, b) => a - b);
  const k = randInt(Math.min(...data) + 3, Math.max(...data) - 3);
  const above = data.filter(v => v > k).length;
  const st = choice(rows.filter(r => r.leaves.length));
  const specs = {
    smallest: { p: `What is the smallest of the ${ctx.short} shown?`, a: String(srt[0]), w: [`First stem and its first leaf: ${Math.floor(srt[0] / 10)} | ${srt[0] % 10}`, String(srt[0])] },
    largest: { p: `What is the largest of the ${ctx.short} shown?`, a: String(srt[srt.length - 1]), w: [`Last stem and its last leaf: ${Math.floor(srt[srt.length - 1] / 10)} | ${srt[srt.length - 1] % 10}`, String(srt[srt.length - 1])] },
    count: { p: "How many data values are shown in the stem-and-leaf plot?", a: String(data.length), w: ["Count every leaf.", String(data.length)] },
    above: { p: `How many of the ${ctx.short} are greater than ${k}?`, a: String(above), w: [`Values greater than ${k}: ${srt.filter(v => v > k).join(", ") || "none"}`, String(above)] },
    "stem-count": { p: `How many of the ${ctx.short} are in the ${st.stem * 10}s?`, a: String(st.leaves.length), w: [`The stem ${st.stem} has ${st.leaves.length} leaves.`] }
  };
  void s0;
  const s = specs[variant];
  return q({
    type: "read-stem-leaf",
    marks: 1,
    prompt: `The stem-and-leaf plot shows ${ctx.name}. ${s.p}`,
    diagram: chart({ chartType: "stem-leaf", rows, key }),
    answer: s.a,
    working: s.w,
    space: SPACE_SIZES.SMALL,
    tags: ["data", "stem-and-leaf"]
  });
}

function readHistogramQuestion() {
  const { ctx, bins } = groupedData();
  const polygonOnly = Math.random() < 0.25;
  const withPolygon = !polygonOnly && Math.random() < 0.3;
  const total = sum(bins.map(b => b.count));
  const variant = choice(["modal-class", "total", "at-least", "less-than", "class-count"]);
  const iMax = bins.findIndex(b => b.count === Math.max(...bins.map(x => x.count)));
  const cut = choice(bins.slice(1, -1));
  const atLeast = sum(bins.filter(b => b.lo >= cut.lo).map(b => b.count));
  const less = total - atLeast;
  const pick = choice(bins);
  const cls = b => `${b.lo}–<${b.hi}`;
  const specs = {
    "modal-class": { p: "Which class interval has the highest frequency (the modal class)?", a: `${bins[iMax].lo} – ${bins[iMax].hi} ${ctx.unit}`, w: [`The highest ${polygonOnly ? "point" : "bar"} is over ${bins[iMax].lo} to ${bins[iMax].hi} (frequency ${bins[iMax].count}).`] },
    total: { p: `How many ${ctx.who} were measured altogether?`, a: String(total), w: [`${bins.map(b => b.count).join(" + ")} = ${total}`] },
    "at-least": { p: `How many ${ctx.who} had a ${ctx.name} of ${cut.lo} ${ctx.unit} or more?`, a: String(atLeast), w: [`Add the frequencies from ${cut.lo} upward: ${bins.filter(b => b.lo >= cut.lo).map(b => b.count).join(" + ")} = ${atLeast}`] },
    "less-than": { p: `How many ${ctx.who} had a ${ctx.name} of less than ${cut.lo} ${ctx.unit}?`, a: String(less), w: [`Add the frequencies below ${cut.lo}: ${bins.filter(b => b.hi <= cut.lo).map(b => b.count).join(" + ")} = ${less}`] },
    "class-count": { p: `How many ${ctx.who} had a ${ctx.name} in the class ${pick.lo} to under ${pick.hi} ${ctx.unit}?`, a: String(pick.count), w: [`Read the height of the ${polygonOnly ? "point above the middle" : "bar"} of that class: ${pick.count}.`] }
  };
  void cls;
  const s = specs[variant];
  return q({
    type: "read-histogram",
    ...(variant === "modal-class" ? { mcDistractors: bins.filter((_, k) => k !== iMax).map(b => `${b.lo} – ${b.hi} ${ctx.unit}`) } : {}),
    marks: variant === "at-least" || variant === "less-than" || variant === "total" ? 2 : 1,
    prompt: `The ${polygonOnly ? "frequency polygon" : "histogram"} shows the ${ctx.name} of some ${ctx.who}. ${s.p}`,
    diagram: chart({ chartType: "histogram", bins, polygon: withPolygon, polygonOnly, xLabel: `${capitalise(ctx.name)} (${ctx.unit})`, yLabel: "Frequency", yStep: 1 }),
    answer: s.a,
    working: s.w,
    space: SPACE_SIZES.SMALL,
    tags: ["data", polygonOnly ? "frequency polygon" : "histogram"]
  });
}

/* Values that make whole-degree sectors: total a factor of 360. */
function sectorData() {
  const total = choice([36, 40, 60, 72, 90, 120, 180, 360]);
  const ctx = choice(CATEGORICAL_CONTEXTS);
  const k = choice([3, 4, 5].filter(n => n <= ctx.cats.length));
  for (let tries = 0; tries < 200; tries++) {
    const cuts = sample(Array.from({ length: total - 1 }, (_, i) => i + 1), k - 1).sort((a, b) => a - b);
    const values = [...cuts, total].map((c, i, arr) => c - (i ? arr[i - 1] : 0));
    if (values.every(v => v >= total * 0.06) && new Set(values).size === k) return { ctx, cats: ctx.cats.slice(0, k), values, total };
  }
  return { ctx, cats: ctx.cats.slice(0, 3), values: [total / 2, total / 3, total / 6], total };
}

function readSectorGraphQuestion() {
  const d = sectorData();
  const labelStyle = choice(["angle", "percent"]);
  const i = randInt(0, d.cats.length - 1);
  const angle = d.values[i] / d.total * 360;
  const pct = d.values[i] / d.total * 100;
  const surveyed = choice([60, 120, 200, 240, 360, 400, 720]);
  const n = d.values[i] / d.total * surveyed;
  if (!Number.isInteger(n) || (labelStyle === "percent" && !Number.isInteger(pct * 10))) return readSectorGraphQuestion();
  return q({
    type: "read-sector-graph",
    marks: 2,
    prompt: `The sector graph shows the results of a survey of ${surveyed} ${d.ctx.unit} (${d.ctx.title.toLowerCase()}). How many ${d.ctx.unit} chose ${d.cats[i]}?`,
    diagram: chart({ chartType: "sector", categories: d.cats, values: d.values, labelStyle }),
    answer: String(n),
    working: labelStyle === "angle"
      ? [`The ${d.cats[i]} sector is ${fmt(angle)}° of 360°.`, `${fmt(angle)}/360 × ${surveyed} = ${n}`]
      : [`${d.cats[i]} is ${fmt(pct, 1)}% of the ${d.ctx.unit}.`, `${fmt(pct, 1)}% × ${surveyed} = ${n}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "sector graph"]
  });
}

function sectorAnglesQuestion() {
  const d = sectorData();
  const angles = d.values.map(v => v / d.total * 360);
  const oneOnly = Math.random() < 0.4;
  const i = randInt(0, d.cats.length - 1);
  const table = { headerRow: true, rows: [[d.ctx.xLabel, "Frequency"], ...d.cats.map((c, k) => [c, String(d.values[k])]), ["Total", String(d.total)]] };
  if (oneOnly) {
    return q({
      type: "sector-angles",
      marks: 1,
      prompt: `The table shows ${d.ctx.title.toLowerCase()}. The data is to be shown in a sector graph. What is the angle of the sector for ${d.cats[i]}?`,
      table,
      answer: `${fmt(angles[i])}°`,
      working: [`${d.values[i]}/${d.total} × 360° = ${fmt(angles[i])}°`],
      space: SPACE_SIZES.SMALL,
      mcDistractors: [`${d.values[i]}°`, `${fmt(d.values[i] / d.total * 100)}°`, `${fmt(360 - angles[i])}°`],
      tags: ["data", "sector graph", "angles"]
    });
  }
  return q({
    type: "sector-angles",
    marks: 3,
    prompt: `The table shows ${d.ctx.title.toLowerCase()}. Calculate the sector angle for each category, then draw a sector graph.`,
    table,
    diagramSpace: { size: "large", label: "Sector graph" },
    answer: d.cats.map((c, k) => `${c} ${fmt(angles[k])}°`).join(", "),
    working: [...d.cats.map((c, k) => `${c}: ${d.values[k]}/${d.total} × 360° = ${fmt(angles[k])}°`), `Check: the angles add to 360°.`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "sector graph", "construct"]
  });
}

function readDividedBarQuestion() {
  const total = choice([20, 25, 40, 50, 100]);
  const ctx = choice(CATEGORICAL_CONTEXTS);
  const k = choice([3, 4]);
  let values;
  do {
    const cuts = sample(Array.from({ length: total - 1 }, (_, i) => i + 1), k - 1).sort((a, b) => a - b);
    values = [...cuts, total].map((c, i, arr) => c - (i ? arr[i - 1] : 0));
  } while (values.some(v => v / total < 0.1) || new Set(values).size < k);
  const i = randInt(0, k - 1);
  const pct = values[i] / total * 100;
  const people = choice([200, 300, 400, 500, 800, 1200]);
  const n = pct / 100 * people;
  return q({
    type: "read-divided-bar",
    marks: 2,
    prompt: `The divided bar graph shows the results of a survey of ${people} ${ctx.unit} (${ctx.title.toLowerCase()}). How many ${ctx.unit} chose ${ctx.cats[i]}?`,
    diagram: chart({ chartType: "divided-bar", categories: ctx.cats.slice(0, k), values, scale: true }),
    answer: spaced(n),
    working: [`${ctx.cats[i]} takes up ${pct}% of the bar.`, `${pct}% of ${people} = ${spaced(n)}`],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "divided bar"]
  });
}

const LINE_CONTEXTS = [
  { title: "Temperature on Saturday", yLabel: "Temperature (°C)", cats: ["6 am", "8 am", "10 am", "12 pm", "2 pm", "4 pm", "6 pm"], lo: 8, hi: 30, step: 2, rising: "peak" },
  { title: "Height of a seedling", yLabel: "Height (cm)", cats: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6"], lo: 2, hi: 24, step: 2, rising: "up" },
  { title: "Monthly rainfall", yLabel: "Rainfall (mm)", cats: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], lo: 20, hi: 140, step: 20, rising: "down" },
  { title: "Canteen sales", yLabel: "Sales ($)", cats: ["Mon", "Tue", "Wed", "Thu", "Fri"], lo: 100, hi: 400, step: 50, rising: "any" },
  { title: "Water in a tank", yLabel: "Water (kL)", cats: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"], lo: 5, hi: 40, step: 5, rising: "down" }
];

function lineSeries(ctx) {
  const n = ctx.cats.length;
  const unit = ctx.step / 2 >= 1 ? ctx.step / 2 : 1;
  let v;
  const out = [];
  for (let i = 0; i < n; i++) {
    if (ctx.rising === "up") v = i === 0 ? ctx.lo + unit : v + unit * randInt(1, 4);
    else if (ctx.rising === "down") v = i === 0 ? ctx.hi - unit : v - unit * randInt(0, 3);
    else if (ctx.rising === "peak") v = i === 0 ? ctx.lo + unit * randInt(0, 2) : v + (i < n / 2 + 0.5 ? 1 : -1) * unit * randInt(1, 4);
    else v = ctx.lo + unit * randInt(0, Math.floor((ctx.hi - ctx.lo) / unit));
    v = Math.max(ctx.lo, Math.min(ctx.hi, v));
    out.push(v);
  }
  return out;
}

function readLineGraphQuestion() {
  const ctx = choice(LINE_CONTEXTS);
  const values = lineSeries(ctx);
  const variant = choice(["value-at", "highest", "increase", "trend", "greatest-change"]);
  const i = randInt(0, values.length - 1);
  const iMax = values.indexOf(Math.max(...values));
  if (variant === "highest" && values.filter(v => v === values[iMax]).length > 1) return readLineGraphQuestion();
  const [a, b] = [randInt(0, values.length - 2), null];
  const bb = randInt(a + 1, values.length - 1);
  const changes = values.slice(1).map((v, k) => v - values[k]);
  const absMax = Math.max(...changes.map(Math.abs));
  const iChange = changes.findIndex(c => Math.abs(c) === absMax);
  if (variant === "greatest-change" && changes.filter(c => Math.abs(c) === absMax).length > 1) return readLineGraphQuestion();
  void b;
  const unitWord = ctx.yLabel.match(/\((.*)\)/)[1];
  const valueText = v => (unitWord === "$" ? `$${v}` : `${v} ${unitWord}`);
  const trendWord = values[values.length - 1] > values[0] ? "increasing" : values[values.length - 1] < values[0] ? "decreasing" : "no overall change";
  const specs = {
    "value-at": { p: `What was the reading for ${ctx.cats[i]}?`, a: valueText(values[i]), w: [`Read up from ${ctx.cats[i]} to the line, then across to the scale: ${valueText(values[i])}.`], m: 1 },
    highest: { p: "When was the highest reading recorded?", a: ctx.cats[iMax], w: [`The highest point is at ${ctx.cats[iMax]} (${valueText(values[iMax])}).`], m: 1 },
    increase: { p: `By how much did the reading change from ${ctx.cats[a]} to ${ctx.cats[bb]}?`, a: `${values[bb] - values[a] >= 0 ? "An increase" : "A decrease"} of ${valueText(Math.abs(values[bb] - values[a]))}`, w: [`${ctx.cats[a]}: ${valueText(values[a])}; ${ctx.cats[bb]}: ${valueText(values[bb])}`, `Change = ${values[bb]} − ${values[a]} = ${values[bb] - values[a]}`], m: 2 },
    trend: { p: "Describe the overall trend shown by the graph.", a: trendWord === "no overall change" ? "The readings go up and down but end where they started." : `The readings are generally ${trendWord}${ctx.rising === "peak" ? ", after rising to a peak around the middle of the day" : ""}.`, w: [`First reading ${valueText(values[0])}, last reading ${valueText(values[values.length - 1])}.`], m: 2 },
    "greatest-change": { p: "Between which two consecutive readings was the greatest change?", a: `${ctx.cats[iChange]} and ${ctx.cats[iChange + 1]}`, w: [`The steepest section of the line is from ${ctx.cats[iChange]} to ${ctx.cats[iChange + 1]} (a change of ${valueText(Math.abs(changes[iChange]))}).`], m: 1 }
  };
  const s = specs[variant];
  return q({
    type: "read-line-graph",
    marks: s.m,
    prompt: `The line graph shows ${ctx.title.toLowerCase()}. ${s.p}`,
    diagram: chart({ chartType: "line", categories: ctx.cats, values, yLabel: ctx.yLabel, yStep: ctx.step, yMax: ctx.hi, yMin: 0 }),
    answer: s.a,
    working: s.w,
    space: s.m === 1 ? SPACE_SIZES.SMALL : SPACE_SIZES.MEDIUM,
    ...(variant === "highest" ? { mcDistractors: ctx.cats.filter((_, k) => k !== iMax) } : {}),
    ...(variant === "greatest-change" || variant === "trend" ? { mcEligible: false } : {}),
    tags: ["data", "line graph"]
  });
}

function readPictogramQuestion() {
  const ctx = choice(CATEGORICAL_CONTEXTS);
  const per = choice([2, 4, 10]);
  const k = 4;
  let values;
  do { values = Array.from({ length: k }, () => per * randInt(1, 6) + (Math.random() < 0.4 ? per / 2 : 0)); } while (new Set(values).size < k);
  const i = randInt(0, k - 1);
  const variant = choice(["one", "total", "difference"]);
  const total = sum(values);
  const [a, b] = sample([0, 1, 2, 3], 2);
  const specs = {
    one: { p: `How many ${ctx.unit} chose ${ctx.cats[i]}?`, a: String(values[i]), w: [`Each symbol is ${per} ${ctx.unit}; a half symbol is ${per / 2}.`, `${ctx.cats[i]}: ${values[i] / per} symbols × ${per} = ${values[i]}`], m: 1 },
    total: { p: `How many ${ctx.unit} are represented altogether?`, a: String(total), w: [`${values.join(" + ")} = ${total}`], m: 2 },
    difference: { p: `How many more ${ctx.unit} chose ${ctx.cats[a]} than ${ctx.cats[b]}?`, a: String(Math.abs(values[a] - values[b])), w: [`${values[a]} − ${values[b]} = ${values[a] - values[b]}`], m: 1 }
  };
  if (variant === "difference" && values[a] <= values[b]) return readPictogramQuestion();
  const s = specs[variant];
  return q({
    type: "read-pictogram",
    marks: s.m,
    prompt: `The pictogram shows ${ctx.title.toLowerCase()}. ${s.p}`,
    diagram: chart({ chartType: "pictogram", categories: ctx.cats.slice(0, k), values, perSymbol: per, unit: ctx.unit }),
    answer: s.a,
    working: s.w,
    space: SPACE_SIZES.SMALL,
    tags: ["data", "pictogram"]
  });
}

/* ── constructing and choosing ───────────────────────────── */

function constructGraphQuestion() {
  const variant = choice(["column", "dot-plot", "histogram", "stem-leaf"]);
  if (variant === "column") {
    const d = categoricalData({ min: 2, max: 14 });
    return q({
      type: "construct-graph",
      marks: 2,
      prompt: `Draw a column graph of the data in the table on the axes provided.`,
      table: { headerRow: true, rows: [[d.xLabel, "Frequency"], ...d.cats.map((c, i) => [c, String(d.values[i])])] },
      diagram: chart({ chartType: "column", blank: true, categories: d.cats, values: d.values, yMax: 14, yStep: 2, xLabel: d.xLabel, yLabel: "Frequency" }),
      answer: `Columns of height ${d.cats.map((c, i) => `${c} ${d.values[i]}`).join(", ")}; equal widths, gaps between columns, axes labelled.`,
      working: ["Each category gets a column of equal width, with gaps between columns.", "The height of each column is its frequency."],
      space: SPACE_SIZES.NONE,
      mcEligible: false,
      tags: ["data", "column graph", "construct"]
    });
  }
  if (variant === "dot-plot") {
    const { ctx, data } = discreteData({ n: randInt(12, 18) });
    return q({
      type: "construct-graph",
      marks: 2,
      prompt: `The ${ctx.name} for some ${ctx.unit} were: ${listText(data)}. Draw a dot plot of the data on the number line provided.`,
      diagram: chart({ chartType: "dot-plot", blank: true, data, min: ctx.lo, max: ctx.hi, xLabel: capitalise(ctx.name) }),
      answer: frequencyFromData(data, ctx.lo, ctx.hi).map(r => `${r.value}: ${r.freq} dot${r.freq === 1 ? "" : "s"}`).join(", "),
      working: ["Place one dot above the number line for each value, stacking repeats evenly.", `${data.length} dots in total.`],
      space: SPACE_SIZES.NONE,
      mcEligible: false,
      tags: ["data", "dot plot", "construct"]
    });
  }
  if (variant === "histogram") {
    const { ctx, bins } = groupedData();
    return q({
      type: "construct-graph",
      marks: 3,
      prompt: `The table shows the ${ctx.name} of some ${ctx.who}. Draw a histogram of the data on the axes provided${Math.random() < 0.5 ? ", then add a frequency polygon" : ""}.`,
      table: { headerRow: true, rows: [[`${capitalise(ctx.name)} (${ctx.unit})`, "Frequency"], ...bins.map(b => [`${b.lo} – < ${b.hi}`, String(b.count)])] },
      diagram: chart({ chartType: "histogram", blank: true, bins, yMax: 10, yStep: 1, xLabel: `${capitalise(ctx.name)} (${ctx.unit})`, yLabel: "Frequency" }),
      answer: `Adjacent columns (no gaps) of heights ${bins.map(b => b.count).join(", ")}; a frequency polygon joins the midpoints of the tops, closed to the axis at each end.`,
      working: ["A histogram's columns touch, because the classes are continuous.", "A frequency polygon joins the midpoint of the top of each column."],
      space: SPACE_SIZES.NONE,
      mcEligible: false,
      tags: ["data", "histogram", "construct"]
    });
  }
  const { ctx, data } = twoDigitData({ n: randInt(12, 16) });
  const rows = stemLeafRows(data);
  return q({
    type: "construct-graph",
    marks: 2,
    prompt: `These are the ${ctx.name}: ${listText(data)}. Complete the ordered stem-and-leaf plot and write a key.`,
    diagram: chart({ chartType: "stem-leaf", blank: true, rows: rows.map(r => ({ stem: r.stem, leaves: r.leaves })) }),
    answer: rows.map(r => `${r.stem} | ${r.leaves.join(" ")}`).join("; "),
    working: ["The tens digit is the stem; the units digit is the leaf.", "Leaves are written in order, smallest first.", `Key: ${rows[0].stem} | ${rows.find(r => r.leaves.length).leaves[0]} = ${rows.find(r => r.leaves.length).stem * 10 + rows.find(r => r.leaves.length).leaves[0]}`],
    space: SPACE_SIZES.NONE,
    mcEligible: false,
    tags: ["data", "stem-and-leaf", "construct"]
  });
}

const DISPLAY_CHOICES = [
  { s: "the percentage of a family's budget spent on rent, food, transport and savings", a: "Sector (pie) graph", why: "It shows how the parts make up one whole." },
  { s: "how a baby's mass changed each month during its first year", a: "Line graph", why: "It shows how one quantity changes over time." },
  { s: "the heights of 60 students, grouped into 5 cm classes", a: "Histogram", why: "It shows grouped continuous numerical data." },
  { s: "the number of students choosing each of five sports", a: "Column graph", why: "It compares the frequencies of separate categories." },
  { s: "the number of goals scored in each of 15 games", a: "Dot plot", why: "It shows every value of a small set of discrete data." },
  { s: "the test marks of a class, keeping every actual mark visible", a: "Stem-and-leaf plot", why: "It shows the distribution while keeping the actual values." },
  { s: "the daily maximum temperature in Sydney over a fortnight", a: "Line graph", why: "It shows change over time." },
  { s: "the favourite colours of 30 students", a: "Column graph", why: "It compares categories." }
];

function chooseDisplayQuestion() {
  const c = choice(DISPLAY_CHOICES);
  const all = ["Sector (pie) graph", "Line graph", "Histogram", "Column graph", "Dot plot", "Stem-and-leaf plot"];
  const withReason = Math.random() < 0.35;
  return q({
    type: "choose-display",
    marks: withReason ? 2 : 1,
    prompt: withReason
      ? `Which type of display is most appropriate for ${c.s}? Give a reason.`
      : `Which type of display is most appropriate for ${c.s}?`,
    answer: withReason ? `${c.a}. ${c.why}` : c.a,
    working: [c.why, c.a],
    space: withReason ? SPACE_SIZES.MEDIUM : SPACE_SIZES.SMALL,
    mcDistractors: withReason ? undefined : sample(all.filter(x => x !== c.a), 3),
    tags: ["data", "choose display"]
  });
}

function misleadingGraphsQuestion() {
  const variant = choice(["truncated", "truncated-claim", "no-scale"]);
  const ctx = choice([
    { title: "Phone sales", cats: ["Brand A", "Brand B", "Brand C"], yLabel: "Sales (thousands)" },
    { title: "Votes for school captain", cats: ["Ana", "Ben", "Chi"], yLabel: "Votes" },
    { title: "Weekly attendance", cats: ["Wk 1", "Wk 2", "Wk 3", "Wk 4"], yLabel: "Students" }
  ]);
  const base = choice([80, 100, 150, 200]);
  const values = ctx.cats.map(() => base + randInt(2, 18));
  const yMin = base;
  const iMax = values.indexOf(Math.max(...values));
  const iMin = values.indexOf(Math.min(...values));
  if (iMax === iMin || values.filter(v => v === values[iMax]).length > 1) return misleadingGraphsQuestion();
  const ratio = (values[iMax] - yMin) / Math.max(1, values[iMin] - yMin);
  if (variant === "truncated-claim") {
    return q({
      type: "misleading-graphs",
      marks: 2,
      prompt: `Looking at this graph, someone claims that ${ctx.cats[iMax]} had about ${Math.max(2, Math.round(ratio))} times as many as ${ctx.cats[iMin]}. Is this claim correct? Explain.`,
      diagram: chart({ chartType: "column", title: ctx.title, categories: ctx.cats, values, yMin, yStep: 5, yLabel: ctx.yLabel }),
      answer: `No. The vertical axis starts at ${yMin}, not 0, which exaggerates the difference. ${ctx.cats[iMax]} had ${values[iMax]} and ${ctx.cats[iMin]} had ${values[iMin]}, only ${values[iMax] - values[iMin]} more.`,
      working: [`The scale starts at ${yMin}.`, `${values[iMax]} ÷ ${values[iMin]} ≈ ${fmt(values[iMax] / values[iMin])}, not ${Math.max(2, Math.round(ratio))}.`],
      space: SPACE_SIZES.MEDIUM,
      tags: ["data", "misleading"]
    });
  }
  if (variant === "no-scale") {
    return q({
      type: "misleading-graphs",
      marks: 2,
      prompt: "Give two features a column graph should have so that it is not misleading.",
      answer: "Any two of: a vertical axis that starts at zero; an evenly spaced scale; a title; labels on both axes (with units); columns of equal width.",
      working: ["Truncated or uneven scales exaggerate differences.", "Titles and labels tell the reader what is being measured."],
      space: SPACE_SIZES.MEDIUM,
      tags: ["data", "misleading"]
    });
  }
  return q({
    type: "misleading-graphs",
    marks: 2,
    prompt: "Explain why this graph is misleading, and describe how to fix it.",
    diagram: chart({ chartType: "column", title: ctx.title, categories: ctx.cats, values, yMin, yStep: 5, yLabel: ctx.yLabel }),
    answer: `The vertical axis starts at ${yMin} instead of 0, so small differences look large. Start the vertical scale at 0 (or show a clear axis break).`,
    working: [`The scale begins at ${yMin}, so the columns' heights are not in proportion to the values.`, "Redraw the vertical axis from 0."],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "misleading"]
  });
}

function multiPartDataQuestion() {
  const d = categoricalData({ min: 3, max: 15, n: 4 });
  const total = sum(d.values);
  const iMax = d.values.indexOf(Math.max(...d.values));
  const i = randInt(0, 3);
  const pct = d.values[i] / total * 100;
  return q({
    type: "multi-part-data",
    marks: 4,
    prompt: `The column graph shows ${d.title.toLowerCase()} for a group of ${d.unit}.`,
    diagram: chart({ chartType: "column", title: d.title, categories: d.cats, values: d.values, yStep: 2, xLabel: d.xLabel, yLabel: `Number of ${d.unit}` }),
    subparts: [
      { label: "(a)", prompt: "Is the data categorical or numerical?", marks: 1, answer: "Categorical", working: [`${d.xLabel} values are names, not numbers.`] },
      { label: "(b)", prompt: `How many ${d.unit} were surveyed?`, marks: 1, answer: String(total), working: [`${d.values.join(" + ")} = ${total}`] },
      { label: "(c)", prompt: "Which category is the mode?", marks: 1, answer: d.cats[iMax], working: [`The tallest column is ${d.cats[iMax]}.`] },
      { label: "(d)", prompt: `What percentage chose ${d.cats[i]}? Round to 1 decimal place.`, marks: 1, answer: `${fmt(pct, 1)}%`, working: [`${d.values[i]} ÷ ${total} × 100 ≈ ${fmt(pct, 1)}%`] }
    ],
    answer: `(a) Categorical; (b) ${total}; (c) ${d.cats[iMax]}; (d) ${fmt(pct, 1)}%`,
    working: [],
    space: SPACE_SIZES.MEDIUM,
    tags: ["data", "multi-part"]
  });
}

const GENERATORS = {
  "classify-variable": classifyVariableQuestion,
  "variable-reasoning": variableReasoningQuestion,
  "collecting-data": collectingDataQuestion,
  "frequency-table": frequencyTableQuestion,
  "read-column-graph": readColumnGraphQuestion,
  "read-dot-plot": readDotPlotQuestion,
  "read-stem-leaf": readStemLeafQuestion,
  "read-histogram": readHistogramQuestion,
  "read-sector-graph": readSectorGraphQuestion,
  "sector-angles": sectorAnglesQuestion,
  "read-divided-bar": readDividedBarQuestion,
  "read-line-graph": readLineGraphQuestion,
  "read-pictogram": readPictogramQuestion,
  "construct-graph": constructGraphQuestion,
  "choose-display": chooseDisplayQuestion,
  "misleading-graphs": misleadingGraphsQuestion,
  "multi-part-data": multiPartDataQuestion
};

void shuffle;

export function getDataVisualisationQuestionTypes() {
  return TYPE_LIST;
}

export function generateDataVisualisationQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
