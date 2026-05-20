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

import {
  ensureQuestionIds,
  getExamEditorSummary,
  moveQuestionById,
  moveQuestionRelativeToId,
  removeQuestionById,
  restoreRemovedQuestion
} from "./utils/exam-editor.js";

const controlsRoot = document.createElement("div");
controlsRoot.id = "controls";

const editorRoot = document.createElement("div");
editorRoot.id = "exam-editor-output";

const examRoot = document.createElement("div");
examRoot.id = "exam-output";

const solutionsRoot = document.createElement("div");
solutionsRoot.id = "worked-solutions-output";

const appRoot = document.getElementById("app");
appRoot.appendChild(controlsRoot);
appRoot.appendChild(editorRoot);
appRoot.appendChild(examRoot);
appRoot.appendChild(solutionsRoot);

let currentExam = null;
let editMode = false;
let lastRemovedQuestion = null;
let editorStatus = "";
let draggedQuestionId = null;

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

  const finalQuestions = ensureQuestionIds(applyAnswerSpaceRules(questions));

  currentExam = createExam({
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

  editMode = false;
  lastRemovedQuestion = null;
  editorStatus = "Paper generated. Turn on Edit paper to remove or reorder questions.";

  renderCurrentExam();
}

function renderCurrentExam() {
  if (!currentExam) {
    editorRoot.innerHTML = "";
    examRoot.innerHTML = "";
    solutionsRoot.innerHTML = "";
    return;
  }

  renderEditorToolbar();
  renderExam(examRoot, currentExam, { editMode });

  const workedSolutionData = buildWorkedSolutionData(currentExam);
  renderWorkedSolutions(solutionsRoot, workedSolutionData);
}

function renderEditorToolbar() {
  if (!currentExam) {
    editorRoot.innerHTML = "";
    return;
  }

  const summary = getExamEditorSummary(currentExam);
  const editButtonText = editMode ? "Finish editing" : "Edit paper";
  const undoDisabled = lastRemovedQuestion ? "" : "disabled";
  const editHelp = editMode
    ? "Editing is on. Use ↑/↓, ×, or drag the handle. Questions stay inside their current section."
    : "Editing is off. The paper is ready to print or save.";

  editorRoot.innerHTML = `
    <section class="exam-editor-toolbar${editMode ? " is-active" : ""}" aria-label="Exam editor">
      <div class="exam-editor-toolbar-main">
        <div>
          <strong>Paper editor</strong>
          <span>${summary.questionCount} questions · ${summary.totalMarks} marks · ${summary.multipleChoiceCount} MC · ${summary.extendedResponseCount} extended</span>
        </div>

        <div class="exam-editor-actions">
          <button type="button" data-editor-toolbar-action="toggle-edit">${editButtonText}</button>
          <button type="button" data-editor-toolbar-action="undo-remove" ${undoDisabled}>Undo remove</button>
        </div>
      </div>

      <p class="exam-editor-help">${editorStatus || editHelp}</p>
    </section>
  `;
}

function setEditorStatus(message) {
  editorStatus = message;
}

editorRoot.addEventListener("click", event => {
  const button = event.target.closest("[data-editor-toolbar-action]");

  if (!button || !currentExam) return;

  const action = button.dataset.editorToolbarAction;

  if (action === "toggle-edit") {
    editMode = !editMode;
    setEditorStatus(editMode
      ? "Editing is on. Use ↑/↓, ×, or drag the handle. Questions stay inside their current section."
      : "Editing is off. The paper is ready to print or save."
    );
    renderCurrentExam();
    return;
  }

  if (action === "undo-remove" && lastRemovedQuestion) {
    const result = restoreRemovedQuestion(currentExam, lastRemovedQuestion);

    if (result.changed) {
      currentExam = result.exam;
      lastRemovedQuestion = null;
      setEditorStatus("Question restored.");
      renderCurrentExam();
    }
  }
});

examRoot.addEventListener("click", event => {
  if (!editMode || !currentExam) return;

  const button = event.target.closest("[data-editor-action]");
  if (!button) return;

  const article = button.closest("[data-question-id]");
  const questionId = article?.dataset.questionId;

  if (!questionId) return;

  const action = button.dataset.editorAction;

  if (action === "remove") {
    const removedNumber = findQuestionNumber(questionId);
    const result = removeQuestionById(currentExam, questionId);

    if (result.changed) {
      currentExam = result.exam;
      lastRemovedQuestion = result.removed;
      setEditorStatus(`Removed question ${removedNumber}. Use Undo remove to restore it.`);
      renderCurrentExam();
    }

    return;
  }

  if (action === "move-up" || action === "move-down") {
    const direction = action === "move-up" ? "up" : "down";
    const result = moveQuestionById(currentExam, questionId, direction);

    if (result.changed) {
      currentExam = result.exam;
      setEditorStatus("Question moved.");
      renderCurrentExam();
    } else if (result.reason) {
      setEditorStatus(result.reason);
      renderEditorToolbar();
    }
  }
});

examRoot.addEventListener("dragstart", event => {
  if (!editMode || !currentExam) return;

  const handle = event.target.closest("[data-editor-drag-handle]");
  const article = event.target.closest("[data-question-id]");

  if (!handle || !article) return;

  draggedQuestionId = article.dataset.questionId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedQuestionId);
  article.classList.add("is-dragging");
});

examRoot.addEventListener("dragover", event => {
  if (!editMode || !draggedQuestionId) return;

  const article = event.target.closest(".exam-question[data-question-id]");
  if (!article || article.dataset.questionId === draggedQuestionId) return;

  event.preventDefault();

  const rect = article.getBoundingClientRect();
  const position = event.clientY > rect.top + rect.height / 2 ? "after" : "before";

  clearDropIndicators();
  article.classList.add(position === "after" ? "is-drop-after" : "is-drop-before");
});

examRoot.addEventListener("dragleave", event => {
  if (!event.relatedTarget || !examRoot.contains(event.relatedTarget)) {
    clearDropIndicators();
  }
});

examRoot.addEventListener("drop", event => {
  if (!editMode || !currentExam || !draggedQuestionId) return;

  const article = event.target.closest(".exam-question[data-question-id]");

  if (!article) return;

  event.preventDefault();

  const rect = article.getBoundingClientRect();
  const position = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
  const targetQuestionId = article.dataset.questionId;
  const result = moveQuestionRelativeToId(currentExam, draggedQuestionId, targetQuestionId, position);

  clearDropIndicators();
  draggedQuestionId = null;

  if (result.changed) {
    currentExam = result.exam;
    setEditorStatus("Question moved.");
    renderCurrentExam();
  } else if (result.reason) {
    setEditorStatus(result.reason);
    renderEditorToolbar();
  }
});

examRoot.addEventListener("dragend", () => {
  draggedQuestionId = null;
  clearDropIndicators();

  examRoot
    .querySelectorAll(".exam-question.is-dragging")
    .forEach(node => node.classList.remove("is-dragging"));
});

function clearDropIndicators() {
  examRoot
    .querySelectorAll(".is-drop-before, .is-drop-after")
    .forEach(node => node.classList.remove("is-drop-before", "is-drop-after"));
}

function findQuestionNumber(questionId) {
  const index = currentExam?.questions?.findIndex(question => question.id === questionId) ?? -1;
  return index >= 0 ? `Q${index + 1}` : "the question";
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
