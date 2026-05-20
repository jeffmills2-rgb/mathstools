/*
  CHHS Exam Builder — Solution Formatters
  ---------------------------------------
  Shared formatting helpers for worked solutions and marking criteria.
*/

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatLargeNumbers(text) {
  return String(text ?? "").replace(/(?<![\\w.])(-?\\d{1,3}(?:\\d{3})+)(?![\\w.])/g, match => {
    const sign = match.startsWith("-") ? "-" : "";
    const digits = sign ? match.slice(1) : match;
    return sign + digits.replace(/\\B(?=(\\d{3})+(?!\\d))/g, " ");
  });
}

export function renderMathText(value) {
  return formatLargeNumbers(escapeHtml(value))
    .replace(
      /\[\[frac:(-?\d+):(-?\d+)\]\]/g,
      `<span class="math-frac"><span>$1</span><span>$2</span></span>`
    )
    .replace(/\r?\n/g, "<br>");
}

export function normaliseText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripHtml(value) {
  const node = document.createElement("div");
  node.innerHTML = String(value ?? "");
  return node.textContent || node.innerText || "";
}

export function choiceLetter(index) {
  return ["A", "B", "C", "D"][Number(index)] || "";
}

export function getCorrectChoiceLetter(question) {
  if (!question || !Array.isArray(question.choices)) return "";

  const answer = normaliseChoiceText(question.correctAnswer ?? question.answer);
  let index = question.choices.findIndex(choice => normaliseChoiceText(choice) === answer);

  if (index === -1) {
    index = question.choices.findIndex(choice => looseChoiceText(choice) === looseChoiceText(answer));
  }

  return choiceLetter(index);
}

export function normaliseChoiceText(value) {
  return String(value ?? "")
    .replace(/\u2212/g, "−")
    .replace(/-/g, "−")
    .replace(/\s+/g, " ")
    .trim();
}

export function totalMarks(questions = []) {
  return questions.reduce((sum, question) => sum + Number(question.marks || 0), 0);
}

export function splitQuestionsByKind(questions = []) {
  return {
    multipleChoice: questions.filter(question => question.kind === "multiple-choice"),
    extendedResponse: questions.filter(question => question.kind !== "multiple-choice")
  };
}


function looseChoiceText(value) {
  return String(value ?? "")
    .replace(/\[\[frac:(-?\d+):(-?\d+)\]\]/g, "$1/$2")
    .replace(/\u2212/g, "-")
    .replace(/−/g, "-")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}
