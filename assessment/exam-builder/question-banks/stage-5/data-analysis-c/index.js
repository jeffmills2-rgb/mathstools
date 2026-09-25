/*
  Mills Maths Tools — Stage 5 Question Bank: Data Analysis C
  -----------------------------------------------------------
  question-banks/stage-5/data-analysis-c/index.js

  NSW Mathematics K–10 (2022), Stage 5, MA5-DAT-P-01 (Path):
    plans and conducts statistical investigations, and critically evaluates
    data and reports in the media.

  Content:
    - the statistical inquiry cycle: posing a question, population versus
      sample, choosing variables, collecting, analysing, reporting
    - sampling methods: simple random, systematic, stratified, and
      convenience/self-selected (biased); calculating stratified samples
    - sources of bias: sample, question wording, non-response
    - primary and secondary data; census versus sample
    - evaluating reports: sample size, claims beyond the data, misleading
      graphs (truncated axes, uneven scales)

  Misleading graphs are drawn by the statistics engine with `yMin` above
  zero — the only place in the app that is allowed.
*/

import {
  SPACE_SIZES, randInt, choice, shuffle, makeQuestion, generateFromRegistry
} from "../../_shared/bank-helpers.js";

const TOPIC = "Data Analysis C";

const TYPE_LIST = [
  { id: "population-sample", label: "Population, sample and census" },
  { id: "sampling-method", label: "Name the sampling method" },
  { id: "stratified-sample", label: "Calculate a stratified sample" },
  { id: "systematic-sample", label: "Systematic sampling" },
  { id: "identify-bias", label: "Identify bias in a survey" },
  { id: "question-wording", label: "Biased and leading questions" },
  { id: "primary-secondary", label: "Primary or secondary data?" },
  { id: "misleading-graph", label: "Misleading graphs" },
  { id: "evaluate-claim", label: "Evaluate a claim in a report" },
  { id: "plan-inquiry", label: "Plan a statistical inquiry" }
];

const q = spec => makeQuestion(TOPIC, { ...spec, tags: ["stage5", "statistical inquiry", ...(spec.tags || [])] });
const chart = config => ({ engine: "statistics-engine", config });

const POP = [
  ["A school wants to know how its 900 students travel to school. It asks 60 students.", "Population: all 900 students; sample: the 60 students asked."],
  ["A council wants residents' views on a new pool. It surveys 400 of its 25 000 residents.", "Population: all 25 000 residents; sample: the 400 surveyed."],
  ["A factory tests 50 light globes from a batch of 10 000 to estimate how long they last.", "Population: the 10 000 globes; sample: the 50 tested. (Testing all would destroy them, so a census is impractical.)"],
  ["The ABS collects information from every household in Australia every five years.", "This is a census: the whole population is surveyed."]
];

function populationSampleQuestion() {
  const [p, a] = choice(POP);
  return q({ type: "population-sample", marks: 2, prompt: `${p} Identify the population and the sample (or say if it is a census).`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["population"] });
}

const METHODS = [
  ["Every student's name is put into a computer, which chooses 30 names at random.", "Simple random sampling"],
  ["Starting from a random person, every 10th customer through the door is surveyed.", "Systematic sampling"],
  ["The school has 40% juniors and 60% seniors, so 20 juniors and 30 seniors are chosen at random.", "Stratified sampling"],
  ["A reporter asks the first 50 people who walk past the station.", "Convenience sampling"],
  ["A website asks visitors to click a link and complete a poll.", "Self-selected (voluntary) sampling"]
];
const MNAMES = METHODS.map(m => m[1]);

function samplingMethodQuestion() {
  const [d, a] = choice(METHODS);
  return q({ type: "sampling-method", marks: 1, prompt: `Name the sampling method: ${d}`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcDistractors: shuffle(MNAMES.filter(n => n !== a)).slice(0, 3), tags: ["sampling"] });
}

function stratifiedSampleQuestion() {
  const groups = shuffle(["Year 7", "Year 8", "Year 9", "Year 10"]).slice(0, choice([3, 4])).sort();
  const size = choice([40, 50, 60, 80]);
  const counts = groups.map(() => randInt(4, 16) * 15);
  const N = counts.reduce((a, b) => a + b, 0);
  const sample = counts.map(c => (c / N) * size);
  if (!sample.every(v => Number.isInteger(v))) return stratifiedSampleQuestion();
  const ans = groups.map((g, i) => `${g}: ${sample[i]}`).join(", ");
  return q({
    type: "stratified-sample", marks: 2,
    prompt: `A school wants a stratified sample of ${size} students from the groups in the table. How many should be chosen from each group?`,
    table: { headerRow: true, rows: [["Group", ...groups], ["Students", ...counts.map(String)]] },
    answer: ans,
    working: [`Total ${N}`, ...groups.map((g, i) => `${g}: ${counts[i]}/${N} × ${size} = ${sample[i]}`)],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [groups.map(g => `${g}: ${size / groups.length}`).join(", ")].filter(t => t !== ans && Number.isInteger(size / groups.length)),
    tags: ["stratified"]
  });
}

function systematicSampleQuestion() {
  const N = choice([200, 300, 480, 600, 1000]); const n = choice([20, 25, 40, 50].filter(v => N % v === 0));
  const k = N / n; const start = randInt(1, k);
  return q({
    type: "systematic-sample", marks: 2,
    prompt: `A systematic sample of ${n} is taken from a list of ${N} names. The first name chosen is number ${start}. What is the sampling interval, and what are the next three numbers chosen?`,
    answer: `Every ${k}th name: ${start + k}, ${start + 2 * k}, ${start + 3 * k}`,
    working: [`Interval ${N} ÷ ${n} = ${k}`],
    space: SPACE_SIZES.SMALL,
    mcDistractors: [`Every ${n}th name: ${start + n}, ${start + 2 * n}, ${start + 3 * n}`, `Every ${k}th name: ${start * 2}, ${start * 3}, ${start * 4}`],
    tags: ["systematic"]
  });
}

const BIAS = [
  ["To find how often Australians exercise, a survey is handed out at a gym.", "Biased sample: gym members exercise more than the general population."],
  ["A radio station asks listeners to call in and vote on a new law.", "Self-selected sample: only people with strong views, who listen to that station, respond."],
  ["To estimate the average height of Year 9 students, the basketball team is measured.", "Unrepresentative sample: basketball players tend to be taller."],
  ["A survey about public transport is conducted by phone between 10 am and 2 pm on weekdays.", "Many workers and students are unavailable then, so they are under-represented."],
  ["Of 500 surveys posted, only 60 were returned.", "Non-response bias: the people who replied may differ from those who did not."]
];

function identifyBiasQuestion() {
  const [s, a] = choice(BIAS);
  return q({ type: "identify-bias", marks: 2, prompt: `Explain why this survey may give biased results. ${s}`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["bias"] });
}

const WORDING = [
  ["Don't you agree that the canteen should sell healthier food?", "Leading: it pushes the respondent to agree. Better: \"Should the canteen change the food it sells? Yes / No / Unsure.\""],
  ["How much do you love our wonderful new app?", "Loaded words (\"love\", \"wonderful\") assume a positive answer. Better: \"How would you rate the app from 1 to 5?\""],
  ["Do you exercise and eat healthily?", "Two questions in one: a person may do one but not the other. Ask them separately."],
  ["How many hours of TV do you watch? (a) 0–2 (b) 2–4 (c) 4–6", "The options overlap (2 and 4 appear twice) and there is no option above 6."]
];

function questionWordingQuestion() {
  const [s, a] = choice(WORDING);
  return q({ type: "question-wording", marks: 2, prompt: `What is wrong with this survey question, and how could it be improved? "${s}"`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["questionnaire"] });
}

const PRIMSEC = [
  ["Measuring the heights of students in your class yourself.", "Primary"], ["Using rainfall figures from the Bureau of Meteorology website.", "Secondary"],
  ["Counting the cars that pass the school gate between 8 and 9 am.", "Primary"], ["Taking population figures from the ABS census.", "Secondary"],
  ["Running your own online poll of your classmates.", "Primary"], ["Quoting a statistic from a newspaper article.", "Secondary"]
];

function primarySecondaryQuestion() {
  const [s, a] = choice(PRIMSEC);
  return q({ type: "primary-secondary", marks: 1, prompt: `Is this primary or secondary data? ${s}`, answer: `${a} data`, working: [a === "Primary" ? "Collected first-hand by the investigator." : "Collected by someone else."], space: SPACE_SIZES.SMALL, mcDistractors: [a === "Primary" ? "Secondary data" : "Primary data"], tags: ["data sources"] });
}

function misleadingGraphQuestion() {
  const base = randInt(40, 80) * 10; const vals = [base, base + randInt(5, 20), base + randInt(20, 40)];
  const cats = choice([["2022", "2023", "2024"], ["Brand A", "Brand B", "Brand C"], ["Term 1", "Term 2", "Term 3"]]);
  const yMin = Math.floor((base - 20) / 10) * 10;
  const ratio = (vals[2] - yMin) / (vals[0] - yMin);
  return q({
    type: "misleading-graph", marks: 2,
    prompt: `A company claims its sales have "skyrocketed", using this graph. Explain why the graph is misleading.`,
    diagram: chart({ chartType: "column", categories: cats, values: vals, yMin, yMax: vals[2] + 10, yStep: 10, xLabel: "", yLabel: "Sales" }),
    answer: `The vertical axis starts at ${yMin}, not 0, so the differences look much bigger than they are: the last column looks about ${Math.round(ratio)} times as tall as the first, but ${vals[2]} is only ${Math.round((vals[2] / vals[0] - 1) * 100)}% more than ${vals[0]}.`,
    working: ["Check where the axis starts and whether the scale is even."],
    space: SPACE_SIZES.SMALL,
    mcEligible: false,
    tags: ["misleading graphs"]
  });
}

const CLAIMS = [
  ["\"9 out of 10 dentists recommend Brite toothpaste\" — based on asking 10 dentists who were paid by the company.", "Tiny sample, and the dentists had a conflict of interest; the result cannot be generalised."],
  ["A study of 30 people found that people who drink coffee live longer. The headline says \"Coffee makes you live longer\".", "The sample is small, and association does not prove causation; other factors could explain it."],
  ["An online poll on a sports website found 85% of people want more sport on TV.", "Self-selected sample of sports fans: not representative of all viewers."],
  ["\"Our average customer saves $500\" — but most customers saved under $50 and a few saved thousands.", "The mean is pulled up by a few large values (outliers); the median would be a fairer measure."]
];

function evaluateClaimQuestion() {
  const [c, a] = choice(CLAIMS);
  return q({ type: "evaluate-claim", marks: 2, prompt: `Evaluate this claim: ${c}`, answer: a, working: [], space: SPACE_SIZES.SMALL, mcEligible: false, tags: ["evaluate", "media"] });
}

const INQUIRIES = [
  "whether students who play a musical instrument do better in Mathematics",
  "how far students in your school travel to get to school",
  "whether older people use social media less than younger people",
  "whether the amount of homework set increases from Year 7 to Year 10"
];

function planInquiryQuestion() {
  const topic = choice(INQUIRIES);
  return q({
    type: "plan-inquiry", marks: 4,
    prompt: `Plan a statistical investigation into ${topic}.`,
    subparts: [
      { label: "(a)", prompt: "Write a clear statistical question.", marks: 1, answer: "A specific, measurable question (e.g. naming the population and variable).", working: [] },
      { label: "(b)", prompt: "Describe the population and a suitable sampling method.", marks: 1, answer: "Name the population; use a random or stratified sample of adequate size.", working: [] },
      { label: "(c)", prompt: "State the variables to collect and whether each is categorical or numerical.", marks: 1, answer: "E.g. the explanatory and response variables, with their types.", working: [] },
      { label: "(d)", prompt: "Suggest a graph and a statistic you would use to analyse the data.", marks: 1, answer: "E.g. parallel box plots and medians/IQRs, or a scatter plot and line of best fit.", working: [] }
    ],
    answer: "Answers will vary.",
    working: [],
    space: SPACE_SIZES.SMALL,
    tags: ["inquiry"]
  });
}

const GENERATORS = {
  "population-sample": populationSampleQuestion,
  "sampling-method": samplingMethodQuestion,
  "stratified-sample": stratifiedSampleQuestion,
  "systematic-sample": systematicSampleQuestion,
  "identify-bias": identifyBiasQuestion,
  "question-wording": questionWordingQuestion,
  "primary-secondary": primarySecondaryQuestion,
  "misleading-graph": misleadingGraphQuestion,
  "evaluate-claim": evaluateClaimQuestion,
  "plan-inquiry": planInquiryQuestion
};

export function getDataAnalysisCQuestionTypes() { return TYPE_LIST; }
export function generateDataAnalysisCQuestions({ count = 6, allowedTypes = null } = {}) {
  return generateFromRegistry({ typeList: TYPE_LIST, generators: GENERATORS, count, allowedTypes });
}
