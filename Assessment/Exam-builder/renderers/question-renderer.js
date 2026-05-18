/*
  CHHS Exam Builder — Question Renderer
  -------------------------------------
  Converts one shared question object into HTML.

  This file does not generate maths. It only renders the data it receives.
*/

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderMathText(value) {
  return escapeHtml(value)
    .replace(
      /\[\[frac:(-?\d+):(-?\d+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    .replace(/\r?\n/g, "<br>");
}

function renderChoices(choices) {
  if (!Array.isArray(choices)) return "";

  return `
    <ol class="choice-list" type="A">
      ${choices.map(choice => `<li>${renderMathText(choice)}</li>`).join("")}
    </ol>
  `;
}

function renderQuestionTable(table) {
  if (!table || !Array.isArray(table.rows) || !table.rows.length) return "";

  const caption = table.caption
    ? `<div class="question-table-caption">${renderMathText(table.caption)}</div>`
    : "";

  return `
    <div class="question-table-wrap">
      ${caption}
      <table class="question-table">
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

function renderAnswerSpace(space) {
  const safeSpace = ["none", "small", "medium", "large"].includes(space) ? space : "medium";
  if (safeSpace === "none") return "";

  return `<div class="answer-space answer-space-${safeSpace}" aria-label="Answer space"></div>`;
}

function renderDiagram(question) {
  if (!question.diagram) return "";

  const encodedConfig = encodeURIComponent(JSON.stringify(question.diagram.config || {}));
  const engine = escapeHtml(question.diagram.engine);

  return `
    <div
      class="question-diagram"
      data-engine="${engine}"
      data-config="${encodedConfig}">
    </div>
  `;
}

export function renderQuestion(question, number, options = {}) {
  const showMarks = options.showMarks !== false;

  return `
    <article class="exam-question" data-question-id="${escapeHtml(question.id)}">
      <div class="question-heading">
        <div class="question-number">${number}</div>
        <div class="question-prompt">${renderMathText(question.prompt)}</div>
        ${showMarks ? `<div class="question-marks">${question.marks} mark${question.marks === 1 ? "" : "s"}</div>` : ""}
      </div>

      ${renderQuestionTable(question.table)}
      ${renderDiagram(question)}
      ${renderChoices(question.choices)}
      ${renderAnswerSpace(question.space)}
    </article>
  `;
}

export function hydrateQuestionDiagrams(root = document) {
  const nodes = root.querySelectorAll("[data-engine][data-config]");

  nodes.forEach(node => {
    const engine = node.dataset.engine;
    const config = JSON.parse(decodeURIComponent(node.dataset.config || "%7B%7D"));

    if (engine === "angle-engine" && window.MMT_ANGLE_ENGINE?.render) {
      window.MMT_ANGLE_ENGINE.render(node, config);
      return;
    }

    if (engine === "integer-engine" && window.MMT_INTEGER_ENGINE?.render) {
      window.MMT_INTEGER_ENGINE.render(node, config);
      return;
    }

    if (engine === "pythagoras-engine" && window.MMT_PYTHAGORAS_ENGINE?.render) {
      window.MMT_PYTHAGORAS_ENGINE.render(node, config);
      return;
    }

    if (engine === "fdp-engine" && window.MMT_FDP_ENGINE?.render) {
      window.MMT_FDP_ENGINE.render(node, config);
      return;
    }

    if (engine === "rates-engine" && window.MMT_RATES_ENGINE?.render) {
      window.MMT_RATES_ENGINE.render(node, config);
      return;
    }

    if (engine === "indices-engine" && window.MMT_INDICES_ENGINE?.render) {
      window.MMT_INDICES_ENGINE.render(node, config);
      return;
    }

    if (engine === "linear-engine" && window.MMT_LINEAR_ENGINE?.render) {
      window.MMT_LINEAR_ENGINE.render(node, config);
      return;
    }

    if (engine === "length-engine" && window.MMT_LENGTH_ENGINE?.render) {
      window.MMT_LENGTH_ENGINE.render(node, config);
      return;
    }

    if (engine === "area-engine" && window.MMT_AREA_ENGINE?.render) {
      window.MMT_AREA_ENGINE.render(node, config);
      return;
    }

    node.innerHTML = `
      <div class="diagram-placeholder">
        Diagram engine unavailable: ${engine}
      </div>
    `;
  });
}
