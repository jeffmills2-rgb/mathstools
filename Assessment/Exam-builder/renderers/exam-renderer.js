/*
  MMT Exam Builder — Exam Renderer
  --------------------------------
  Assembles questions into a printable exam document.
*/

import { validateQuestionList } from "../schemas/question.schema.js";
import { renderQuestion, hydrateQuestionDiagrams } from "./question-renderer.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function totalMarks(questions) {
  return questions.reduce((sum, question) => sum + Number(question.marks || 0), 0);
}

function getMultipleChoiceQuestions(exam) {
  return (exam.questions || []).filter(question => question.kind === "multiple-choice");
}

function getExtendedResponseQuestions(exam) {
  return (exam.questions || []).filter(question => question.kind !== "multiple-choice");
}

function renderCover(exam) {
  return `
    <section class="exam-cover">
      <div>
        <div class="exam-brand">Coffs Harbour HS</div>
        <h1>${escapeHtml(exam.title || "Mathematics Exam")}</h1>
        <p class="exam-subtitle">${escapeHtml(exam.subtitle || "")}</p>
      </div>

      <div class="exam-info-grid">
        <div><strong>Time allowed</strong><span>${escapeHtml(exam.timeAllowed || "_____")}</span></div>
        <div><strong>Total marks</strong><span>${totalMarks(exam.questions)}</span></div>
        <div><strong>Calculator</strong><span>${escapeHtml(exam.calculator || "As directed by teacher")}</span></div>
      </div>

      <div class="student-lines">
        <label>Name <span></span></label>
        <label>Class <span></span></label>
        <label>Date <span></span></label>
      </div>

      <div class="instructions">
        <h2>Instructions</h2>
        <ul>
          ${(exam.instructions || [
            "Attempt all questions.",
            "Show appropriate working.",
            "Write clearly using black or blue pen."
          ]).map(item => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
    </section>
  `;
}

function renderQuestionSection({
  title,
  subtitle,
  instruction = "",
  questions,
  startNumber = 1,
  options = {},
  extraClass = ""
}) {
  if (!questions.length) return "";

  return `
    <section class="exam-section ${escapeHtml(extraClass)}">
      <header class="section-header">
        <h2>${escapeHtml(title)}</h2>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
        ${instruction ? `<p class="section-instruction">${escapeHtml(instruction)}</p>` : ""}
      </header>

      <div class="question-list">
        ${questions.map((question, index) => renderQuestion(question, startNumber + index, {
          ...options,
          canMoveUp: index > 0,
          canMoveDown: index < questions.length - 1
        })).join("")}
      </div>
    </section>
  `;
}

function renderQuestions(exam, renderOptions = {}) {
  const allQuestions = exam.questions || [];
  const multipleChoiceQuestions = getMultipleChoiceQuestions(exam);
  const extendedResponseQuestions = getExtendedResponseQuestions(exam);

  if (!multipleChoiceQuestions.length) {
    return renderQuestionSection({
      title: exam.sectionTitle || "Section I",
      subtitle: exam.sectionSubtitle || "Answer all questions. Show working where appropriate.",
      questions: allQuestions,
      startNumber: 1,
      options: {
        ...exam.options,
        ...renderOptions
      }
    });
  }

  const extendedStart = multipleChoiceQuestions.length + 1;
  const extendedEnd = allQuestions.length;

  return `
    ${renderQuestionSection({
      title: "Section I - Multiple choice",
      subtitle: "Select the alternative A, B, C or D that best answers each question.",
      questions: multipleChoiceQuestions,
      startNumber: 1,
      options: {
        ...exam.options,
        ...renderOptions
      }
    })}

    ${renderQuestionSection({
      title: "Section II - Extended response",
      instruction: extendedResponseQuestions.length
        ? `For questions ${extendedStart} to ${extendedEnd}, answer in the spaces provided.`
        : "",
      questions: extendedResponseQuestions,
      startNumber: extendedStart,
      options: {
        ...exam.options,
        ...renderOptions
      },
      extraClass: "section-break-before"
    })}
  `;
}

function renderMcInstructionOvals({ selected = null, crossed = null, correct = null } = {}) {
  return ["A", "B", "C", "D"].map(letter => `
    <span class="mc-demo-option">
      <span class="mc-demo-letter">${letter}</span>
      <span class="mc-demo-oval${selected === letter ? " is-filled" : ""}${crossed === letter ? " is-crossed" : ""}"></span>
      ${correct === letter ? `<span class="mc-correct-arrow">correct</span>` : ""}
    </span>
  `).join("");
}

function renderMultipleChoiceInstructions() {
  return `
    <div class="mc-instructions-box">
      <p>
        Select the alternative A, B, C or D that best answers the question.
        Fill in the response oval completely.
      </p>

      <div class="mc-sample-line">
        <strong>Sample</strong>
        <span>2 + 4 = ?</span>
        <span><strong>(A)</strong> 2</span>
        <span><strong>(B)</strong> 6</span>
        <span><strong>(C)</strong> 8</span>
        <span><strong>(D)</strong> 9</span>
      </div>

      <div class="mc-demo-row">
        ${renderMcInstructionOvals({ selected: "B" })}
      </div>

      <p>
        If you think you have made a mistake, put a cross through the incorrect answer
        and fill in the new answer.
      </p>

      <div class="mc-demo-row">
        ${renderMcInstructionOvals({ selected: "A", crossed: "B" })}
      </div>

      <p>
        If you change your mind and have crossed out what you consider to be the correct answer,
        then indicate this by writing the word <em>correct</em> and drawing an arrow.
      </p>

      <div class="mc-demo-row">
        ${renderMcInstructionOvals({ selected: "B", crossed: "A", correct: "B" })}
      </div>
    </div>
  `;
}

function renderMcResponseRow(number) {
  return `
    <div class="mc-response-row">
      <span class="mc-response-number">${number}.</span>
      ${["A", "B", "C", "D"].map(letter => `
        <span class="mc-response-option">
          <span class="mc-response-letter">${letter}</span>
          <span class="mc-response-oval"></span>
        </span>
      `).join("")}
    </div>
  `;
}

function renderMultipleChoiceAnswerSheet(exam) {
  const multipleChoiceCount = getMultipleChoiceQuestions(exam).length;

  if (!multipleChoiceCount) return "";

  const rows = Array.from({ length: multipleChoiceCount }, (_, index) => renderMcResponseRow(index + 1)).join("");

  return `
    <section class="mc-answer-sheet">
      <header class="mc-answer-header">
        <h1>${escapeHtml(exam.title || "Mathematics Exam")} Multiple Choice answer sheet</h1>
      </header>

      ${renderMultipleChoiceInstructions()}

      <div class="mc-student-number-line">
        <strong>Student Number:</strong>
        <span></span>
      </div>

      <p class="mc-response-instruction">
        Completely fill the response oval representing the most correct answer.
      </p>

      <div class="mc-response-grid" aria-label="Multiple choice answer sheet">
        ${rows}
      </div>
    </section>
  `;
}

export function renderExam(target, exam, renderOptions = {}) {
  const container = typeof target === "string" ? document.getElementById(target) : target;

  if (!container) {
    throw new Error("renderExam target was not found.");
  }

  validateQuestionList(exam.questions || []);

  container.innerHTML = `
    <main class="exam-document${renderOptions.editMode ? " is-edit-mode" : ""}">
      ${renderCover(exam)}
      ${renderQuestions(exam, renderOptions)}
      ${renderMultipleChoiceAnswerSheet(exam)}
    </main>
  `;

  hydrateQuestionDiagrams(container);
}

export function createExam({
  school = "Coffs Harbour High School",
  title = "Mathematics Exam",
  subtitle = "",
  timeAllowed = "45 minutes",
  calculator = "Teacher discretion",
  sectionTitle = "Section I",
  sectionSubtitle = "Answer all questions. Show working where appropriate.",
  instructions = null,
  questions = [],
  multipleChoiceCount = null,
  options = {}
} = {}) {
  return {
    school,
    title,
    subtitle,
    timeAllowed,
    calculator,
    sectionTitle,
    sectionSubtitle,
    instructions,
    questions,
    multipleChoiceCount,
    options
  };
}
