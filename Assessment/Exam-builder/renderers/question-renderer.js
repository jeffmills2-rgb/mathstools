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

export function renderMathText(value) {
  const formatted = formatLargeNumbers(escapeHtml(value))
    .replace(
      /\[\[frac:(-?\d+):(-?\d+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    .replace(
      /\[\[algfrac:([^:\]]+):([^:\]]+)\]\]/g,
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
  const tableClass = table.className ? ` question-table-${escapeHtml(table.className)}` : "";

  return `
    <div class="question-table-wrap${tableClass}">
      ${caption}
      <table class="question-table${tableClass}">
        <tbody>
          ${table.rows.map((row, rowIndex) => `
            <tr>
              ${row.map((cell, index) => {
                const isHeaderRow = table.headerRow === true && rowIndex === 0;
                if (isHeaderRow) return `<th scope="col">${renderMathText(cell)}</th>`;
                return index === 0
                  ? `<th scope="row">${renderMathText(cell)}</th>`
                  : `<td>${renderMathText(cell)}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}


function renderMatching(matching) {
  if (!matching || !Array.isArray(matching.left) || !Array.isArray(matching.right)) return "";

  const rowCount = Math.max(matching.left.length, matching.right.length);

  return `
    <div class="question-matching" aria-label="Matching question" style="display:grid;grid-template-columns:minmax(145px, 1fr) 160px minmax(145px, 1fr);gap:12px;align-items:center;margin:18px 0 8px;font-family:'Cambria Math','STIX Two Math','Times New Roman',serif;">
      ${Array.from({ length: rowCount }).map((_, index) => `
        <div style="border:1.7px solid #111827;border-radius:10px;padding:12px 16px;font-weight:700;text-align:center;font-size:1.05em;">
          ${renderMathText(matching.left[index] || "")}
        </div>
        <div style="height:46px;border-bottom:1.7px dashed #94a3b8;"></div>
        <div style="border:1.7px solid #111827;border-radius:10px;padding:12px 16px;font-weight:700;text-align:center;font-size:1.05em;">
          ${renderMathText(matching.right[index] || "")}
        </div>
      `).join("")}
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

function renderStudentDiagramSpace(diagramSpace) {
  if (!diagramSpace) return "";

  const settings = typeof diagramSpace === "object" ? diagramSpace : {};
  const size = ["small", "medium", "large"].includes(settings.size) ? settings.size : "medium";
  const heights = {
    small: "130px",
    medium: "190px",
    large: "250px"
  };
  const label = settings.label === false ? "" : escapeHtml(settings.label || "Space for diagram");

  return `
    <div
      class="student-diagram-space student-diagram-space-${size}"
      aria-label="Space for student diagram"
      style="height:${heights[size]};border:2px solid #111827;border-radius:6px;margin:18px auto 14px;max-width:920px;background:#fff;position:relative;">
      ${label ? `<div style="position:absolute;top:10px;left:14px;font-size:.86rem;font-family:Arial,sans-serif;color:#64748b;font-weight:700;letter-spacing:.02em;text-transform:uppercase;">${label}</div>` : ""}
    </div>
  `;
}

export function renderQuestion(question, number, options = {}) {
  const showMarks = options.showMarks !== false;
  const editableClass = options.editMode ? " is-editable" : "";
  const questionKind = escapeHtml(question.kind || "short-response");
  const hasDiagram = Boolean(question.diagram);
  const hasAnswerSpace = !["", "none"].includes(String(question.space || "medium").toLowerCase());
  const hasStudentDiagramSpace = Boolean(question.diagramSpace);
  const hasSideAnswerLayout = hasDiagram && hasAnswerSpace && questionKind !== "multiple-choice" && !hasStudentDiagramSpace;
  const layoutClass = hasSideAnswerLayout
    ? " has-diagram-answer-layout"
    : hasDiagram
      ? " has-diagram"
      : "";

  return `
    <article
      class="exam-question${editableClass}${layoutClass}"
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
      ${renderMatching(question.matching)}
      ${renderChoices(question.choices)}
      ${renderStudentDiagramSpace(question.diagramSpace)}
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

    if (engine === "trigonometry-engine" && window.MMT_TRIGONOMETRY_ENGINE?.render) {
      window.MMT_TRIGONOMETRY_ENGINE.render(node, config);
      return;
    }

    if (engine === "nonlinear-engine" && window.MMT_NONLINEAR_ENGINE?.render) {
      window.MMT_NONLINEAR_ENGINE.render(node, config);
      return;
    }

    if (engine === "financial-engine" && window.MMT_FINANCIAL_ENGINE?.render) {
      window.MMT_FINANCIAL_ENGINE.render(node, config);
      return;
    }

    if (engine === "algebra-engine" && window.MMT_ALGEBRA_ENGINE?.render) {
      window.MMT_ALGEBRA_ENGINE.render(node, config);
      return;
    }

    if (engine === "area-surface-engine" && window.MMT_AREA_SURFACE_ENGINE?.render) {
      window.MMT_AREA_SURFACE_ENGINE.render(node, config);
      return;
    }

    if (engine === "volume-engine" && window.MMT_VOLUME_ENGINE?.render) {
      window.MMT_VOLUME_ENGINE.render(node, config);
      return;
    }

    if (engine === "network-engine" && window.MMT_NETWORK_ENGINE?.render) {
      window.MMT_NETWORK_ENGINE.render(node, config);
      return;
    }

    node.innerHTML = `
      <div class="diagram-placeholder">
        Diagram engine unavailable: ${engine}
      </div>
    `;
  });
}
