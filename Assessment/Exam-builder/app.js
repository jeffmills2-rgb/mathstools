import {
  generateAngleQuestions,
  getAngleQuestionTypes
} from "./question-banks/angles/index.js";

import {
  generateIntegerQuestions,
  getIntegerQuestionTypes
} from "./question-banks/integers/index.js";

import {
  generateEquationQuestions,
  getEquationQuestionTypes
} from "./question-banks/equations/index.js";

import {
  generatePythagorasQuestions,
  getPythagorasQuestionTypes
} from "./question-banks/pythagoras/index.js";

import {
  generateAlgebraicTechniquesQuestions,
  getAlgebraicTechniquesQuestionTypes
} from "./question-banks/algebraic-techniques/index.js";

import {
  generateFdpQuestions,
  getFdpQuestionTypes
} from "./question-banks/fdp/index.js";

import {
  generateRatiosRatesQuestions,
  getRatiosRatesQuestionTypes
} from "./question-banks/ratios-rates/index.js";

import {
  generateIndicesQuestions,
  getIndicesQuestionTypes
} from "./question-banks/indices/index.js";

import {
  generateLinearRelationshipsQuestions,
  getLinearRelationshipsQuestionTypes
} from "./question-banks/linear-relationships/index.js";

import {
  generateLengthQuestions,
  getLengthQuestionTypes
} from "./question-banks/length/index.js";

import {
  generateAreaQuestions,
  getAreaQuestionTypes
} from "./question-banks/area/index.js";

import {
  createExam,
  renderExam
} from "./renderers/exam-renderer.js";

import {
  renderExamControls
} from "./components/exam-controls.js";

import {
  buildBalancedMultipleChoiceQuestions
} from "./utils/multiple-choice.js";

import {
  applyAnswerSpaceRules
} from "./utils/answer-space-rules.js";

import {
  buildWorkedSolutionData
} from "./utils/worked-solution-builder.js";

import {
  renderWorkedSolutions
} from "./renderers/worked-solution-renderer.js";

const controlsRoot = document.createElement("div");
controlsRoot.id = "controls";

const examRoot = document.createElement("div");
examRoot.id = "exam-output";

const solutionsRoot = document.createElement("div");
solutionsRoot.id = "worked-solutions-output";

const appRoot = document.getElementById("app");
appRoot.appendChild(controlsRoot);
appRoot.appendChild(examRoot);
appRoot.appendChild(solutionsRoot);

const TOPICS = {
  integers: {
    label: "Integers",
    generate: generateIntegerQuestions,
    getTypes: getIntegerQuestionTypes
  },

  fractionsDecimalsPercentages: {
    label: "Fractions, Decimals and Percentages",
    generate: generateFdpQuestions,
    getTypes: getFdpQuestionTypes
  },

  ratiosRates: {
    label: "Ratios and Rates",
    generate: generateRatiosRatesQuestions,
    getTypes: getRatiosRatesQuestionTypes
  },

  indices: {
    label: "Indices",
    generate: generateIndicesQuestions,
    getTypes: getIndicesQuestionTypes
  },

  linearRelationships: {
    label: "Cartesian Plane and Linear Relationships",
    generate: generateLinearRelationshipsQuestions,
    getTypes: getLinearRelationshipsQuestionTypes
  },

  length: {
    label: "Length",
    generate: generateLengthQuestions,
    getTypes: getLengthQuestionTypes
  },

  area: {
    label: "Area",
    generate: generateAreaQuestions,
    getTypes: getAreaQuestionTypes
  },

  angles: {
    label: "Angle Relationships",
    generate: generateAngleQuestions,
    getTypes: getAngleQuestionTypes
  },

  equations: {
    label: "Equations",
    generate: generateEquationQuestions,
    getTypes: getEquationQuestionTypes
  },

  pythagoras: {
    label: "Pythagoras Theorem",
    generate: generatePythagorasQuestions,
    getTypes: getPythagorasQuestionTypes
  },

  algebraicTechniques: {
    label: "Algebraic Techniques",
    generate: generateAlgebraicTechniquesQuestions,
    getTypes: getAlgebraicTechniquesQuestionTypes
  }
};

function buildExam(config) {
  const questions = [];

  const multipleChoiceQuestions = buildBalancedMultipleChoiceQuestions({
    topics: TOPICS,
    selectedTopics: config.selectedTopics,
    count: config.multipleChoiceCount || 0
  });

  questions.push(...multipleChoiceQuestions);

  for (const [topicId, topicConfig] of Object.entries(config.selectedTopics || {})) {
    const topic = TOPICS[topicId];

    if (!topic) continue;

    const topicQuestions = topic.generate({
      count: topicConfig.count,
      allowedTypes: topicConfig.allowedTypes
    });

    questions.push(...topicQuestions);
  }

  const finalQuestions = applyAnswerSpaceRules(questions);

  const exam = createExam({
    school: config.school || "Coffs Harbour High School",
    title: config.examTitle || "Stage 4 Mathematics Examination",
    subtitle: config.examSubtitle || buildSubtitleFromSelectedTopics(config.selectedTopics),
    timeAllowed: config.timeAllowed || "45 minutes",

    calculator: config.calculator
      ? "Calculator permitted"
      : "No calculator permitted",

    sectionTitle: "Section I",
    sectionSubtitle: "Answer all questions. Show working where appropriate.",

    instructions: config.instructions?.length
      ? config.instructions
      : [
          "Attempt all questions.",
          "Show all relevant working in the spaces provided.",
          "Diagrams are not necessarily drawn to scale.",
          "Write using black or blue pen."
        ],

    questions: finalQuestions,
    multipleChoiceCount: multipleChoiceQuestions.length
  });

  renderExam(examRoot, exam);

  const workedSolutionData = buildWorkedSolutionData(exam);
  renderWorkedSolutions(solutionsRoot, workedSolutionData);
}

function buildSubtitleFromSelectedTopics(selectedTopics = {}) {
  const labels = Object.keys(selectedTopics)
    .map(topicId => TOPICS[topicId]?.label)
    .filter(Boolean);

  return labels.length ? labels.join(" and ") : "Mathematics";
}

renderExamControls(controlsRoot, {
  title: "CHHS Exam Builder",
  subtitle: "Build a mixed-topic HSC-style mathematics exam.",
  topics: TOPICS,
  defaultMultipleChoiceCount: 0,
  defaultTopicCounts: {
    integers: 6,
    fractionsDecimalsPercentages: 6,
    ratiosRates: 6,
    indices: 6,
    linearRelationships: 6,
    length: 6,
    area: 6,
    angles: 4,
    equations: 6,
    pythagoras: 4,
    algebraicTechniques: 6
  },
  onGenerate: buildExam
});
