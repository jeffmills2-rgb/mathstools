/*
  CHHS Exam Builder — Worked Solution Renderer
  --------------------------------------------
  Renders a teacher-facing worked-solutions document from workedSolutionData.
*/

import { hydrateQuestionDiagrams } from "./question-renderer.js";
import {
  escapeHtml,
  renderMathText
} from "../utils/solution-formatters.js";

export function renderWorkedSolutions(target, data = {}) {
  const container = typeof target === "string" ? document.getElementById(target) : target;

  if (!container) {
    throw new Error("renderWorkedSolutions target was not found.");
  }

  const questions = Array.isArray(data.questions) ? data.questions : [];

  container.innerHTML = `
    <main class="worked-solution-document">
      ${renderWorkedCover(data)}
      ${renderMultipleChoiceKey(questions, data)}
      ${renderWorkedQuestionList(questions)}
    </main>
  `;

  hydrateQuestionDiagrams(container);
}

function renderWorkedCover(data) {
  return `
    <section class="worked-cover">
      <div class="worked-brand">Coffs Harbour HS</div>
      <h1>${escapeHtml(data.title || "Worked Solutions and Marking Criteria")}</h1>
      <p>${escapeHtml(data.subtitle || "")}</p>

      <div class="worked-cover-grid">
        <div><strong>Original paper</strong><span>${escapeHtml(data.examTitle || "Mathematics Exam")}</span></div>
        <div><strong>Total marks</strong><span>${escapeHtml(data.totalMarks ?? "")}</span></div>
        <div><strong>Generated</strong><span>${escapeHtml(data.generatedAt || "")}</span></div>
      </div>

      <div class="worked-note">
        <strong>Teacher copy.</strong>
        The marking criteria and worked solutions are generated from the same question data as the student paper.
        Review any generated item before using it for formal assessment.
      </div>
    </section>
  `;
}

function renderMultipleChoiceKey(questions, data) {
  const mc = questions.filter(question => question.kind === "multiple-choice");

  if (!mc.length) return "";

  return `
    <section class="worked-section worked-mc-key-section">
      <header class="worked-section-header">
        <h2>Section I — Multiple choice answer key</h2>
        <p>Correct alternatives for the multiple choice section.</p>
      </header>

      <table class="worked-mc-key-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
            <th>Final answer / reason</th>
          </tr>
        </thead>
        <tbody>
          ${mc.map(question => `
            <tr>
              <td>Q${question.number}</td>
              <td><strong>${escapeHtml(question.correctChoice || "")}</strong></td>
              <td>${renderMathText(question.answer || question.working?.[0] || "")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderWorkedQuestionList(questions) {
  const extended = questions.filter(question => question.kind !== "multiple-choice");

  if (!extended.length) return "";

  return `
    <section class="worked-section worked-solutions-section">
      <header class="worked-section-header">
        <h2>Section II — Worked solutions and marking criteria</h2>
        <p>Sample answers and suggested marking criteria.</p>
      </header>

      <div class="worked-question-list">
        ${extended.map(renderWorkedQuestion).join("")}
      </div>
    </section>
  `;
}

function renderWorkedQuestion(question) {
  return `
    <article class="worked-question">
      <header class="worked-question-heading">
        <div class="worked-question-number">Q${question.number}</div>
        <div class="worked-question-prompt">${renderMathText(question.prompt)}</div>
        <div class="worked-question-marks">${question.marks} mark${question.marks === 1 ? "" : "s"}</div>
      </header>

      ${renderTable(question.table, "worked-question-table")}
      ${renderDiagram(question.diagram, "worked-diagram")}

      <div class="worked-solution-stack">
        ${renderCriteria(question.criteria)}
        ${renderSampleAnswer(question)}
      </div>
    </article>
  `;
}

function renderDiagram(diagram, className = "worked-diagram") {
  if (!diagram) return "";

  const encodedConfig = encodeURIComponent(JSON.stringify(diagram.config || {}));
  const engine = escapeHtml(diagram.engine || "");

  return `
    <div
      class="${escapeHtml(className)}"
      data-engine="${engine}"
      data-config="${encodedConfig}">
    </div>
  `;
}

function renderTable(table, className = "worked-table") {
  if (!table || !Array.isArray(table.rows) || !table.rows.length) return "";

  const caption = table.caption
    ? `<div class="${escapeHtml(className)}-caption">${renderMathText(table.caption)}</div>`
    : "";

  return `
    <div class="${escapeHtml(className)}-wrap">
      ${caption}
      <table class="${escapeHtml(className)}">
        <tbody>
          ${table.rows.map(row => `
            <tr>
              ${row.map((cell, index) => index === 0
                ? `<th scope="row">${renderMathText(cell)}</th>`
                : `<td>${renderMathText(cell)}</td>`
              ).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCriteria(criteria = []) {
  if (!Array.isArray(criteria) || !criteria.length) return "";

  return `
    <section class="worked-card worked-criteria-card">
      <h3>Marking criteria</h3>
      <table class="worked-criteria-table">
        <thead>
          <tr>
            <th>Criteria</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          ${criteria.map(item => `
            <tr>
              <td>${renderMathText(item.text)}</td>
              <td>${escapeHtml(item.marks)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderSampleAnswer(question) {
  const working = Array.isArray(question.working) ? question.working : [];
  const tableOnly = question.solutionMode === "table-only";

  return `
    <section class="worked-card worked-answer-card">
      <h3>Sample answer</h3>

      ${question.answerDiagram ? `
        <div class="worked-answer-diagram-wrap">
          <div class="worked-answer-diagram-title">Completed diagram</div>
          ${renderDiagram(question.answerDiagram, "worked-answer-diagram")}
        </div>
      ` : ""}

      ${renderTable(question.answerTable, "worked-answer-table")}

      ${working.length ? `
        <ol class="worked-steps">
          ${working.map(step => `<li>${renderMathText(step)}</li>`).join("")}
        </ol>
      ` : ""}

      ${question.answer && !tableOnly ? `
        <div class="worked-final-answer">
          <strong>Final answer:</strong>
          <span>${renderMathText(question.answer)}</span>
        </div>
      ` : ""}
    </section>
  `;
}

export function renderWorkedSolutionsOnly(data = {}) {
  const wrapper = document.createElement("div");
  renderWorkedSolutions(wrapper, data);
  return wrapper.innerHTML;
}
