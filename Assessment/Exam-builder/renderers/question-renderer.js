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

function formatLargeNumbers(text) {
  return String(text ?? "").replace(/(?<![\\w.])(-?\\d{1,3}(?:\\d{3})+)(?![\\w.])/g, match => {
    const sign = match.startsWith("-") ? "-" : "";
    const digits = sign ? match.slice(1) : match;
    return sign + digits.replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ");
  });
}

function renderMathText(value) {
  const formatted = formatLargeNumbers(escapeHtml(value))
    .replace(
      /\[\[frac:(-?\d+):(-?\d+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    );

  const lines = formatted.split(/\r?\n/);

  if (lines.length <= 1) {
    return formatted;
  }

  return lines
    .map((line, index) => {
      if (index === 0) return line;
      return `<span class="prompt-indented-line">${line}</span>`;
    })
    .join("");
}

function renderEditorControls(question, options = {}) {
  if (!options.editMode) return "";

  const upDisabled = options.canMoveUp ? "" : "disabled";
  const downDisabled = options.canMoveDown ? "" : "disabled";

  return `
    <div class="question-editor-controls" aria-label="Question editor controls">
      <button
        type="button"
        class="question-editor-drag-handle"
        data-editor-drag-handle="true"
        draggable="true"
        title="Drag to reorder"
        aria-label="Drag question to reorder">↕</button>

      <button type="button" data-editor-action="move-up" ${upDisabled} aria-label="Move question up">↑</button>
      <button type="button" data-editor-action="move-down" ${downDisabled} aria-label="Move question down">↓</button>
      <button type="button" class="question-editor-remove" data-editor-action="remove" aria-label="Remove question">×</button>
    </div>
  `;
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
  const editableClass = options.editMode ? " is-editable" : "";
  const questionKind = escapeHtml(question.kind || "short-response");

  return `
    <article
      class="exam-question${editableClass}"
      data-question-id="${escapeHtml(question.id)}"
      data-question-kind="${questionKind}">
      ${renderEditorControls(question, options)}

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
