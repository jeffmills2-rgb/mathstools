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
let activeModal = null;
let activeTopicId = null;
let stage4DraftTopics = null;
let stage4Status = "";
let controlsStatus = "";
let showWorkedSolutions = true;

const DEFAULT_TOPIC_COUNTS = {
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
};

const DEFAULT_INSTRUCTIONS = [
  "Attempt all questions.",
  "Show all relevant working in the spaces provided.",
  "Diagrams are not necessarily drawn to scale.",
  "Write using black or blue pen."
];

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

const draftConfig = {
  school: "Coffs Harbour High School",
  examTitle: "Stage 4 Mathematics Examination",
  examSubtitle: "Integers and Angle Relationships",
  timeAllowed: "45 minutes",
  calculator: false,
  multipleChoiceCount: 0,
  instructions: DEFAULT_INSTRUCTIONS.slice(),
  selectedTopics: {}
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
      : DEFAULT_INSTRUCTIONS.slice(),

    questions: finalQuestions,
    multipleChoiceCount: multipleChoiceQuestions.length
  });

  editMode = false;
  lastRemovedQuestion = null;
  editorStatus = "Paper generated. Turn on Edit paper to remove or reorder questions.";
  controlsStatus = "Paper generated successfully.";

  renderAll();
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
  solutionsRoot.style.display = showWorkedSolutions ? "" : "none";
}

function renderAll() {
  renderControlDashboard();
  renderCurrentExam();
}

function renderControlDashboard() {
  const selectedTopicCount = Object.keys(draftConfig.selectedTopics || {}).length;
  const selectedQuestionTotal = Object.values(draftConfig.selectedTopics || {})
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);
  const hasExam = Boolean(currentExam);
  const mcCount = Number(draftConfig.multipleChoiceCount || 0);
  const readyToGenerate = selectedTopicCount > 0 && (selectedQuestionTotal > 0 || mcCount > 0);
  const workedToggleText = showWorkedSolutions ? "Hide solutions" : "Show solutions";
  const selectedTopicLabels = Object.keys(draftConfig.selectedTopics || {})
    .map(topicId => TOPICS[topicId]?.label)
    .filter(Boolean);
  const paperSummary = hasExam ? getExamEditorSummary(currentExam) : null;
  const setupLine = `${selectedTopicCount} topic${selectedTopicCount === 1 ? "" : "s"} · ${selectedQuestionTotal} extended · ${mcCount} MC${hasExam ? ` · ${paperSummary.totalMarks} marks` : ""}`;

  controlsRoot.innerHTML = `
    <section class="builder-dashboard workflow-dashboard" aria-label="Exam builder controls">
      <div class="builder-dashboard-header workflow-dashboard-header">
        <div>
          <div class="workflow-eyebrow">Teacher workflow</div>
          <h1>CHHS Exam Builder</h1>
          <p>Build a paper in four clear steps, then edit, print or save.</p>
        </div>

        <div class="builder-summary workflow-summary workflow-quick-stats" aria-label="Quick setup summary">
          <span>${escapeHtml(setupLine)}</span>
        </div>
      </div>

      <div class="workflow-steps" aria-label="Exam building workflow">
        ${renderWorkflowStep({
          number: 1,
          title: "Exam Details",
          description: `${draftConfig.examTitle || "Untitled exam"} · ${draftConfig.timeAllowed || "Time not set"} · ${draftConfig.calculator ? "Calculator" : "No calculator"}`,
          status: "Complete",
          state: "complete",
          action: "open-exam-details",
          buttonText: "Edit details"
        })}

        ${renderWorkflowStep({
          number: 2,
          title: "Choose Topics",
          description: selectedTopicCount
            ? selectedTopicLabels.slice(0, 3).join(", ") + (selectedTopicLabels.length > 3 ? ` + ${selectedTopicLabels.length - 3} more` : "")
            : "Select Stage 4 topics and question types.",
          status: selectedTopicCount
            ? `${selectedTopicCount} topic${selectedTopicCount === 1 ? "" : "s"} selected`
            : "Current",
          state: selectedTopicCount ? "complete" : "active",
          action: "open-stage-4",
          buttonText: selectedTopicCount ? "Edit topics" : "Choose topics"
        })}

        ${renderWorkflowStep({
          number: 3,
          title: hasExam ? "Regenerate Paper" : "Generate Paper",
          description: hasExam
            ? "Create a fresh version from the current selections."
            : readyToGenerate
              ? "Ready to create the exam, answer sheet and worked solutions."
              : "Choose topics before generating.",
          status: hasExam
            ? "Generated"
            : readyToGenerate
              ? "Ready"
              : "Waiting",
          state: hasExam ? "complete" : readyToGenerate ? "ready" : "locked",
          action: "generate-paper",
          buttonText: hasExam ? "Regenerate" : "Generate paper",
          disabled: !readyToGenerate
        })}

        ${renderWorkflowStep({
          number: 4,
          title: "Edit / Print",
          description: hasExam
            ? `${paperSummary.questionCount} questions · ${paperSummary.totalMarks} marks`
            : "Available after paper generation.",
          status: hasExam
            ? "Available"
            : "Locked",
          state: hasExam ? "active" : "locked",
          customContent: hasExam
            ? `
              <div class="workflow-step-actions">
                <button type="button" data-control-action="print-student">Print / Save Student Exam</button>
                <button type="button" data-control-action="toggle-solutions">${workedToggleText}</button>
                <button type="button" data-control-action="print-solutions">Print Worked Solutions</button>
              </div>
            `
            : ""
        })}
      </div>

      ${renderWorkflowSummary({
        selectedTopicLabels,
        selectedQuestionTotal,
        mcCount,
        hasExam,
        paperSummary
      })}

      ${controlsStatus ? `<p class="builder-status">${escapeHtml(controlsStatus)}</p>` : ""}
    </section>

    ${renderActiveModal()}
  `;
}

function renderWorkflowStep({
  number,
  title,
  description,
  status,
  state = "",
  action = "",
  buttonText = "",
  disabled = false,
  customContent = ""
}) {
  const button = action
    ? `<button type="button" class="workflow-step-button" data-control-action="${escapeHtml(action)}" ${disabled ? "disabled" : ""}>${escapeHtml(buttonText || title)}</button>`
    : "";

  return `
    <article class="workflow-step-card is-${escapeHtml(state)}">
      <div class="workflow-step-topline">
        <span class="workflow-step-number">${number}</span>
        <span class="workflow-step-state">${escapeHtml(status || "")}</span>
      </div>

      <h2>Step ${number} — ${escapeHtml(title)}</h2>
      <p>${escapeHtml(description || "")}</p>

      ${customContent || button}
    </article>
  `;
}

function getExamDetailsStatus() {
  return "Complete";
}

function renderWorkflowSummary({
  selectedTopicLabels,
  selectedQuestionTotal,
  mcCount,
  hasExam,
  paperSummary
}) {
  const topicText = selectedTopicLabels.length
    ? selectedTopicLabels.join(" · ")
    : "No Stage 4 topics selected yet";

  return `
    <div class="workflow-paper-summary" aria-label="Current setup summary">
      <div>
        <strong>Current setup</strong>
        <span>${escapeHtml(draftConfig.examTitle || "Untitled exam")} · ${escapeHtml(draftConfig.timeAllowed || "Time not set")} · ${draftConfig.calculator ? "Calculator permitted" : "No calculator"}</span>
      </div>

      <div>
        <strong>Topics</strong>
        <span>${escapeHtml(topicText)}</span>
      </div>

      <div>
        <strong>Question mix</strong>
        <span>${selectedQuestionTotal} extended · ${mcCount} multiple choice${hasExam ? ` · ${paperSummary.totalMarks} generated marks` : ""}</span>
      </div>
    </div>
  `;
}

function renderActiveModal() {
  if (activeModal === "exam-details") return renderExamDetailsModal();
  if (activeModal === "stage-4") return renderStage4TopicsModal();
  if (activeModal === "topic-config") return renderTopicConfigureModal();
  if (activeModal === "stage-5") return renderStage5TopicsModal();
  return "";
}

function renderExamDetailsModal() {
  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="exam-details-title">
        <form data-builder-form="exam-details">
          <div class="builder-modal-header">
            <div>
              <h2 id="exam-details-title">Exam Details</h2>
              <p>These details appear on the exam cover, answer sheets and worked solutions.</p>
            </div>
            <button type="button" class="builder-modal-close" data-control-action="close-modal" aria-label="Close">×</button>
          </div>

          <div class="builder-form-grid">
            <label>
              <span>School</span>
              <input name="school" value="${escapeHtml(draftConfig.school)}">
            </label>

            <label>
              <span>Title</span>
              <input name="examTitle" value="${escapeHtml(draftConfig.examTitle)}">
            </label>

            <label>
              <span>Subtitle / Topic</span>
              <input name="examSubtitle" value="${escapeHtml(draftConfig.examSubtitle)}">
            </label>

            <label>
              <span>Time allowed</span>
              <input name="timeAllowed" value="${escapeHtml(draftConfig.timeAllowed)}">
            </label>
          </div>

          <label class="builder-inline-check">
            <input type="checkbox" name="calculator" ${draftConfig.calculator ? "checked" : ""}>
            <span>Calculator permitted</span>
          </label>

          <label class="builder-full-field">
            <span>Multiple choice questions</span>
            <select name="multipleChoiceCount">
              ${renderMultipleChoiceOptions(draftConfig.multipleChoiceCount)}
            </select>
          </label>

          <p class="builder-help-text">
            Multiple choice questions are generated from the switched-on Stage 4 topics and selected question types.
          </p>

          <label class="builder-full-field">
            <span>Instructions</span>
            <textarea name="instructions" rows="6">${escapeHtml((draftConfig.instructions || []).join("\n"))}</textarea>
          </label>

          <div class="builder-modal-actions">
            <button type="submit" class="builder-submit">Submit</button>
            <button type="button" class="builder-cancel" data-control-action="close-modal">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderMultipleChoiceOptions(selectedValue = 0) {
  const values = [0, 5, 10, 15, 20, 25, 30];
  return values
    .map(value => `<option value="${value}" ${Number(selectedValue) === value ? "selected" : ""}>${value}</option>`)
    .join("");
}


function getStage4WorkingTopics() {
  return stage4DraftTopics || {};
}

function cloneSelectedTopics(selectedTopics = {}) {
  return Object.fromEntries(
    Object.entries(selectedTopics || {}).map(([topicId, topicConfig]) => [
      topicId,
      {
        count: Number(topicConfig?.count || DEFAULT_TOPIC_COUNTS[topicId] || 6),
        allowedTypes: Array.isArray(topicConfig?.allowedTypes)
          ? topicConfig.allowedTypes.slice()
          : []
      }
    ])
  );
}

function getRecommendedTypeIds(topicId) {
  const types = getTopicTypes(topicId);
  const priorityWords = [
    "graph",
    "solve",
    "calculate",
    "simplify",
    "interpret",
    "construct",
    "area",
    "perimeter",
    "equation",
    "application",
    "problem"
  ];

  const scored = types.map((type, index) => {
    const label = `${type.label || ""} ${type.id || ""}`.toLowerCase();
    const score = priorityWords.reduce((sum, word) => sum + (label.includes(word) ? 1 : 0), 0);
    return { id: type.id, index, score };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  const limit = Math.min(6, Math.max(3, Math.ceil(types.length / 2)));
  return scored.slice(0, limit).map(item => item.id);
}

function getTopicSummary(topicId, config) {
  if (!config) return "Not selected";

  const typeCount = Array.isArray(config.allowedTypes) ? config.allowedTypes.length : 0;
  const questionCount = Number(config.count || 0);
  return `${questionCount} question${questionCount === 1 ? "" : "s"} · ${typeCount} type${typeCount === 1 ? "" : "s"} selected`;
}

function renderStage4Summary() {
  const workingTopics = getStage4WorkingTopics();
  const selectedTopicIds = Object.keys(workingTopics);
  const totalQuestions = Object.values(workingTopics)
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);

  return `
    <div class="stage4-selection-summary">
      <div>
        <strong>${selectedTopicIds.length}</strong>
        <span>topic${selectedTopicIds.length === 1 ? "" : "s"} selected</span>
      </div>
      <div>
        <strong>${totalQuestions}</strong>
        <span>extended question${totalQuestions === 1 ? "" : "s"}</span>
      </div>
      <div>
        <strong>${draftConfig.multipleChoiceCount || 0}</strong>
        <span>multiple choice</span>
      </div>
    </div>
  `;
}


function renderStage4TopicsModal() {
  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal builder-modal-wide stage4-modal" role="dialog" aria-modal="true" aria-labelledby="stage-4-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="stage-4-title">Select Topics (Stage 4)</h2>
            <p>Choose a topic card, configure its question types, then submit your Stage 4 selection.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="cancel-stage-4" aria-label="Close">×</button>
        </div>

        ${renderStage4Summary()}

        ${stage4Status ? `<p class="stage4-status">${escapeHtml(stage4Status)}</p>` : ""}

        <div class="stage-topic-card-grid" aria-label="Stage 4 topics">
          ${Object.entries(TOPICS).map(([topicId, topic]) => renderTopicCard(topicId, topic)).join("")}
        </div>

        <div class="builder-modal-actions">
          <button type="button" class="builder-submit" data-control-action="submit-stage-4">Submit Stage 4 topics</button>
          <button type="button" class="builder-cancel" data-control-action="cancel-stage-4">Cancel</button>
        </div>
      </section>
    </div>
  `;
}

function renderTopicConfigureModal() {
  const topicId = activeTopicId;
  const topic = TOPICS[topicId];

  if (!topic) {
    activeModal = "stage-4";
    activeTopicId = null;
    return renderStage4TopicsModal();
  }

  const workingTopics = getStage4WorkingTopics();
  const savedConfig = workingTopics[topicId] || null;
  const types = getTopicTypes(topicId);
  const selectedTypes = new Set(savedConfig?.allowedTypes || []);
  const count = savedConfig?.count ?? DEFAULT_TOPIC_COUNTS[topicId] ?? 6;

  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal topic-config-modal" role="dialog" aria-modal="true" aria-labelledby="topic-config-title">
        <form data-builder-form="topic-config" data-topic-id="${escapeHtml(topicId)}">
          <div class="builder-modal-header">
            <div>
              <h2 id="topic-config-title">${escapeHtml(topic.label)}</h2>
              <p>Select the question types you want included for this topic.</p>
            </div>
            <button type="button" class="builder-modal-close" data-control-action="cancel-topic-config" aria-label="Close">×</button>
          </div>

          <div class="topic-config-panel">
            <label class="stage-topic-count topic-config-count">
              <span>Number of extended-response questions</span>
              <input type="number" min="0" max="80" step="1" name="topicCount" value="${escapeHtml(count)}">
            </label>

            <div class="topic-config-tools">
              <button type="button" data-control-action="topic-config-select-all">Select all</button>
              <button type="button" data-control-action="topic-config-clear-all">Clear all</button>
              <button type="button" data-control-action="topic-config-recommended">Recommended mix</button>
            </div>

            <div class="topic-config-type-grid">
              ${types.map(type => `
                <label class="topic-config-type">
                  <input
                    type="checkbox"
                    name="topicType"
                    value="${escapeHtml(type.id)}"
                    ${selectedTypes.has(type.id) ? "checked" : ""}>
                  <span>${escapeHtml(type.label || type.id)}</span>
                </label>
              `).join("")}
            </div>
          </div>

          <p class="builder-help-text">
            Tip: leave unrelated types unticked. You can return and edit this topic at any time before generating.
          </p>

          <div class="builder-modal-actions">
            <button type="submit" class="builder-submit">Save topic</button>
            <button type="button" class="builder-cancel" data-control-action="cancel-topic-config">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderStage5TopicsModal() {
  return `
    <div class="builder-modal-backdrop" role="presentation">
      <section class="builder-modal" role="dialog" aria-modal="true" aria-labelledby="stage-5-title">
        <div class="builder-modal-header">
          <div>
            <h2 id="stage-5-title">Select Topics (Stage 5)</h2>
            <p>Stage 5 banks have not been built yet.</p>
          </div>
          <button type="button" class="builder-modal-close" data-control-action="close-modal" aria-label="Close">×</button>
        </div>

        <div class="builder-empty-state">
          <strong>No Stage 5 topics available yet.</strong>
          <p>This button is ready for future Stage 5 question banks.</p>
        </div>

        <div class="builder-modal-actions">
          <button type="button" class="builder-cancel" data-control-action="close-modal">Close</button>
        </div>
      </section>
    </div>
  `;
}

function renderTopicCard(topicId, topic) {
  const workingTopics = getStage4WorkingTopics();
  const savedConfig = workingTopics[topicId] || null;
  const selected = Boolean(savedConfig);
  const typeCount = Array.isArray(savedConfig?.allowedTypes) ? savedConfig.allowedTypes.length : 0;

  return `
    <article class="stage-topic-choice-card${selected ? " is-selected" : ""}" data-topic-id="${escapeHtml(topicId)}">
      <button type="button" class="stage-topic-card-button" data-control-action="open-topic-config" data-topic-id="${escapeHtml(topicId)}">
        <span class="stage-topic-check" aria-hidden="true">${selected ? "✓" : ""}</span>
        <span class="stage-topic-card-main">
          <strong>${escapeHtml(topic.label)}</strong>
          <span>${escapeHtml(getTopicSummary(topicId, savedConfig))}</span>
        </span>
        <span class="stage-topic-card-action">${selected ? "Edit" : "Configure"} →</span>
      </button>

      ${selected ? `
        <div class="stage-topic-card-footer">
          <span>${typeCount} selected question type${typeCount === 1 ? "" : "s"}</span>
          <button type="button" data-control-action="clear-topic-selection" data-topic-id="${escapeHtml(topicId)}">Clear</button>
        </div>
      ` : ""}
    </article>
  `;
}

function getTopicTypes(topicId) {
  const topic = TOPICS[topicId];
  if (!topic?.getTypes) return [];

  try {
    const types = topic.getTypes();
    return Array.isArray(types)
      ? types.map(type => typeof type === "string" ? { id: type, label: type } : type)
          .filter(type => type?.id)
      : [];
  } catch (error) {
    console.warn(`Could not read question types for ${topicId}.`, error);
    return [];
  }
}

function submitExamDetails(form) {
  const formData = new FormData(form);

  draftConfig.school = String(formData.get("school") || "").trim() || "Coffs Harbour High School";
  draftConfig.examTitle = String(formData.get("examTitle") || "").trim() || "Stage 4 Mathematics Examination";
  draftConfig.examSubtitle = String(formData.get("examSubtitle") || "").trim();
  draftConfig.timeAllowed = String(formData.get("timeAllowed") || "").trim() || "45 minutes";
  draftConfig.calculator = formData.has("calculator");
  draftConfig.multipleChoiceCount = Number(formData.get("multipleChoiceCount") || 0);
  draftConfig.instructions = String(formData.get("instructions") || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  activeModal = null;
  controlsStatus = "Exam details updated.";
  renderControlDashboard();
}

function submitTopicConfig(form) {
  const topicId = form.dataset.topicId;
  const topic = TOPICS[topicId];

  if (!topic) return;

  const formData = new FormData(form);
  const selectedTypeIds = formData.getAll("topicType").map(String);
  const count = clamp(Number(formData.get("topicCount") || DEFAULT_TOPIC_COUNTS[topicId] || 6), 0, 80);

  if (!selectedTypeIds.length) {
    stage4Status = "Select at least one question type, or press Cancel to leave this topic unselected.";
    renderControlDashboard();
    return;
  }

  if (!stage4DraftTopics) {
    stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
  }

  stage4DraftTopics[topicId] = {
    count,
    allowedTypes: selectedTypeIds
  };

  activeModal = "stage-4";
  activeTopicId = null;
  stage4Status = `${topic.label} saved.`;
  renderControlDashboard();
}

function submitStage4Topics() {
  const selectedTopics = cloneSelectedTopics(stage4DraftTopics || {});
  draftConfig.selectedTopics = selectedTopics;

  if (!draftConfig.examSubtitle?.trim()) {
    draftConfig.examSubtitle = buildSubtitleFromSelectedTopics(selectedTopics);
  }

  activeModal = null;
  activeTopicId = null;
  stage4DraftTopics = null;
  stage4Status = "";
  controlsStatus = `${Object.keys(selectedTopics).length} Stage 4 topic${Object.keys(selectedTopics).length === 1 ? "" : "s"} selected.`;
  renderControlDashboard();
}

function cancelStage4Topics() {
  activeModal = null;
  activeTopicId = null;
  stage4DraftTopics = null;
  stage4Status = "";
  controlsStatus = "Stage 4 topic selection cancelled.";
  renderControlDashboard();
}

function validateBeforeGenerate() {
  const hasTopics = Object.keys(draftConfig.selectedTopics || {}).length > 0;
  const extendedCount = Object.values(draftConfig.selectedTopics || {})
    .reduce((sum, topicConfig) => sum + Number(topicConfig.count || 0), 0);
  const mcCount = Number(draftConfig.multipleChoiceCount || 0);

  if (!hasTopics) {
    return "Open Select Topics (Stage 4) and switch on at least one topic before generating.";
  }

  if (extendedCount <= 0 && mcCount <= 0) {
    return "Choose at least one extended-response question or multiple-choice question before generating.";
  }

  return "";
}

function printWithMode(mode) {
  if (!currentExam) return;

  document.body.classList.remove("print-student-exam", "print-worked-solutions");
  document.body.classList.add(mode);

  window.setTimeout(() => window.print(), 50);

  window.setTimeout(() => {
    document.body.classList.remove("print-student-exam", "print-worked-solutions");
  }, 1000);
}

controlsRoot.addEventListener("click", event => {
  const button = event.target.closest("[data-control-action]");
  if (!button) return;

  const action = button.dataset.controlAction;

  if (action === "open-exam-details") {
    activeModal = "exam-details";
    renderControlDashboard();
    return;
  }

  if (action === "open-stage-4") {
    stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
    stage4Status = "";
    activeTopicId = null;
    activeModal = "stage-4";
    renderControlDashboard();
    return;
  }

  if (action === "open-stage-5") {
    activeModal = "stage-5";
    renderControlDashboard();
    return;
  }

  if (action === "close-modal") {
    activeModal = null;
    activeTopicId = null;
    renderControlDashboard();
    return;
  }

  if (action === "cancel-stage-4") {
    cancelStage4Topics();
    return;
  }

  if (action === "submit-stage-4") {
    submitStage4Topics();
    return;
  }

  if (action === "open-topic-config") {
    if (!stage4DraftTopics) {
      stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
    }

    activeTopicId = button.dataset.topicId;
    activeModal = "topic-config";
    stage4Status = "";
    renderControlDashboard();
    return;
  }

  if (action === "cancel-topic-config") {
    activeTopicId = null;
    activeModal = "stage-4";
    renderControlDashboard();
    return;
  }

  if (action === "clear-topic-selection") {
    const topicId = button.dataset.topicId;

    if (!stage4DraftTopics) {
      stage4DraftTopics = cloneSelectedTopics(draftConfig.selectedTopics);
    }

    delete stage4DraftTopics[topicId];
    stage4Status = "Topic cleared.";
    renderControlDashboard();
    return;
  }

  if (
    action === "topic-config-select-all" ||
    action === "topic-config-clear-all" ||
    action === "topic-config-recommended"
  ) {
    const form = button.closest("[data-builder-form='topic-config']");
    const topicId = form?.dataset.topicId;
    const inputs = Array.from(form?.querySelectorAll('input[name="topicType"]') || []);

    if (action === "topic-config-select-all") {
      inputs.forEach(input => { input.checked = true; });
    }

    if (action === "topic-config-clear-all") {
      inputs.forEach(input => { input.checked = false; });
    }

    if (action === "topic-config-recommended") {
      const recommended = new Set(getRecommendedTypeIds(topicId));
      inputs.forEach(input => {
        input.checked = recommended.has(input.value);
      });
    }

    return;
  }

  if (action === "generate-paper") {
    const warning = validateBeforeGenerate();

    if (warning) {
      controlsStatus = warning;
      renderControlDashboard();
      return;
    }

    if (currentExam) {
      const confirmed = window.confirm("Regenerate the paper? This will replace the current generated paper and any edits you have made.");
      if (!confirmed) return;
    }

    buildExam(draftConfig);
    return;
  }

  if (action === "toggle-solutions") {
    showWorkedSolutions = !showWorkedSolutions;
    controlsStatus = showWorkedSolutions
      ? "Worked solutions are visible."
      : "Worked solutions are hidden.";
    renderAll();
    return;
  }

  if (action === "print-student") {
    printWithMode("print-student-exam");
    return;
  }

  if (action === "print-solutions") {
    printWithMode("print-worked-solutions");
    return;
  }

});

controlsRoot.addEventListener("submit", event => {
  const form = event.target.closest("[data-builder-form]");
  if (!form) return;

  event.preventDefault();

  const formType = form.dataset.builderForm;

  if (formType === "exam-details") {
    submitExamDetails(form);
    return;
  }

  if (formType === "stage-4-topics") {
    submitStage4Topics();
    return;
  }

  if (formType === "topic-config") {
    submitTopicConfig(form);
  }
});

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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  const number = Number.isFinite(value) ? value : min;
  return Math.min(max, Math.max(min, number));
}

renderAll();
