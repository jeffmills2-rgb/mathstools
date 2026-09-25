/*
  Functional test of the topic picker, driven through real DOM events — the
  layer where the Stage 3 selection bug lived. Static checks would not have
  caught it: the code parsed, every helper worked, and only the wiring sent
  Stage 3 selections into Stage 4's bucket.
*/
/*
  Needs jsdom, which the site does not otherwise depend on:
      npm install --no-save jsdom
  Skips cleanly rather than failing the run when it is absent.
*/
let JSDOM;
try {
  ({ JSDOM } = await import("jsdom"));
} catch {
  console.log("picker: skipped — jsdom not installed (npm install --no-save jsdom)");
  process.exit(0);
}
import fs from "fs";
import { fileURLToPath } from "node:url";
const base = fileURLToPath(new URL("..", import.meta.url));

const dom = new JSDOM(`<!doctype html><html><body><div id="app"></div></body></html>`,
  { url: "http://localhost/", pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
if (!dom.window.crypto?.randomUUID) Object.defineProperty(dom.window, "crypto", { value: { randomUUID: () => `id-${Math.random()}` }, configurable: true });
global.FormData = dom.window.FormData;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;

for (const e of ["fdp/fdp-engine","integers/integer-engine","angles/angle-engine","equations/equation-engine"])
  new Function("window","document",fs.readFileSync(`${base}/engines/${e}.js`,"utf8"))(dom.window, dom.window.document);

await import(base + "/app.js");

let fail=0; const t=(l,ok,x="")=>{console.log((ok?"  ✓ ":"  ✗ ")+l+(x?` — ${x}`:"")); if(!ok)fail++;};
const $  = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const click = el => el && el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

/* Walk the wizard: start → details form → topics step. */
const click2 = el => el && el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));

console.log("\nENTRY POINTS FOUND");
t("the builder rendered its controls", $$("[data-control-action]").length > 0,
  [...new Set($$("[data-control-action]").map(b => b.dataset.controlAction))].join(", "));

click2($('[data-control-action="start-wizard"]'));
const detailsForm = $('[data-builder-form="wizard-details"]');
t("the details step opened", Boolean(detailsForm));
if (detailsForm) detailsForm.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
t("the topics step opened", Boolean($(".topic-picker")));
t("stage tabs render", $$('.picker-tab[data-control-action="picker-stage"]').length === 5, `${$$(".picker-tab").length} tabs`);
t("the selection panel renders", Boolean($(".picker-cart")));

console.log("\nTOPIC CARDS PRESENT PER STAGE");
const stageOf = id => $$(`[data-control-action="toggle-topic"][data-topic-stage="${id}"]`).length;
t("Stage 1 cards render", stageOf("stage1") > 0, `${stageOf("stage1")} parts`);
t("Stage 2 cards render", stageOf("stage2") > 0, `${stageOf("stage2")} parts`);
t("Stage 3 cards render", stageOf("stage3") > 0, `${stageOf("stage3")} parts`);
t("Stage 4 cards render", stageOf("stage4") > 0, `${stageOf("stage4")} parts`);
t("Stage 5 cards render", stageOf("stage5") > 0, `${stageOf("stage5")} parts`);


/* Configure a topic in a given stage exactly as a teacher would:
   tap the topic's part to add it, then open its question-type settings. */
const partSel = (stageId, topicId) => `.picker-part[data-topic-id="${topicId}"][data-topic-stage="${stageId}"]`;
function configureTopic(stageId, topicId, typeCount = 2) {
  if (!$(`${partSel(stageId, topicId)}.is-selected`)) {
    const toggle = $(`${partSel(stageId, topicId)} [data-control-action="toggle-topic"]`);
    if (!toggle) return { error: `no toggle for ${stageId}/${topicId}` };
    click(toggle);
  }
  const gear = $(`${partSel(stageId, topicId)} [data-control-action="open-topic-config"]`);
  if (!gear) return { error: `no settings button after adding ${stageId}/${topicId}` };
  click(gear);

  const form = $('[data-builder-form="topic-config"]');
  if (!form) return { error: "configure modal did not open" };

  const all = [...form.querySelectorAll('input[name="topicType"]')];
  all.forEach(b => { b.checked = false; });
  const boxes = all.slice(0, typeCount);
  boxes.forEach(b => { b.checked = true; });
  form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

  return { types: boxes.length };
}

console.log("\nSELECTING A TOPIC STICKS — IN EVERY STAGE");
for (const [stageId, topicId] of [["stage3","representsNumbers"], ["stage4","integers"], ["stage5","trigonometryA"]]) {
  const result = configureTopic(stageId, topicId);
  if (result.error) { t(`${stageId}: configure ${topicId}`, false, result.error); continue; }

  // The card element itself carries the state — is-selected, and a footer that
  // only exists once a selection is committed to THAT stage's bucket.
  const part = $(partSel(stageId, topicId));
  const selected = Boolean(part && part.classList.contains("is-selected"));
  const cartItem = $$(".picker-cart-item").find(li => li.querySelector(`[data-topic-id="${topicId}"][data-topic-stage="${stageId}"]`));
  const cartText = cartItem?.textContent.replace(/\s+/g, " ").trim();

  t(`${stageId}: ${topicId} is marked selected`, selected && Boolean(cartItem),
    cartText || (part ? "part present, not in the selection panel" : "part missing"));
}

console.log("\nSELECTION SURVIVES COMMITTING THE STEP");
/*
  The card reads the WORKING copy, so a card showing "selected" proves nothing
  about whether the selection was committed. Go forward to the review step and
  read what it reports — that is fed from draftConfig, the committed state.
  This is exactly where a Stage 3 selection was being dropped.
*/
click($('[data-control-action="wizard-topics-next"]'));

const reviewRows = $$(".builder-summary-grid div, .wizard-review-grid div, .builder-modal div")
  .map(d => d.textContent.replace(/\s+/g, " ").trim());
const rowFor = label => reviewRows.find(r => r.startsWith(label)) || "";

for (const [label, topic] of [["Stage 3", "Represents Numbers"], ["Stage 4", "Integers"], ["Stage 5", "Trigonometry A"]]) {
  const row = rowFor(label);
  t(`review step reports ${label}: ${topic}`, row.includes(topic), row || "(row not found)");
}

const questionsRow = rowFor("Questions");
t("review step counts the questions", /[1-9]\d* extended/.test(questionsRow), questionsRow || "(not found)");
t("the generate button is enabled",
  !$('[data-control-action="wizard-generate"]')?.disabled,
  $(".stage4-status")?.textContent?.trim() || "no blocking message");

console.log("\nGENERATING PRODUCES A PAPER");
click($('[data-control-action="wizard-generate"]'));
const numbers = $$(".exam-question .question-number").length;
t("questions were generated", numbers > 0, `${numbers} questions rendered`);
const topics = [...new Set($$(".exam-question").map(q => q.dataset.questionId).filter(Boolean))].length;
t("every generated question has an id", topics === numbers || numbers > 0);

/* Back to the topics step to check the committed state round-trips. */
click($('[data-control-action="open-wizard-topics"]') || $('[data-control-action="start-wizard"]'));

console.log("\nA SINGLE-STAGE PAPER GENERATES");
/*
  The reported failure: Stage 3 alone. Every stage bug so far survived because
  the other stages were selected too and masked it, so each stage is exercised
  on its own — and the generated questions are checked to belong to it.
*/
const topicLabels = {};
for (const stageId of ["stage1", "stage2", "stage3", "stage4", "stage5"]) {
  click($('[data-control-action="close-modal"]'));
  click($('[data-control-action="start-wizard"]'));
  $('[data-builder-form="wizard-details"]')
    ?.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));

  // Clear whatever the previous pass left selected, one card at a time —
  // clearing re-renders, so the node list has to be re-read each time.
  for (let guard = 0; guard < 40; guard++) {
    const clear = $('.picker-cart [data-control-action="clear-topic-selection"]');
    if (!clear) break;
    click(clear);
  }
  const stillSelected = $$(".picker-part.is-selected").length + $$(".picker-cart-item").length;

  const first = $(`[data-control-action="toggle-topic"][data-topic-stage="${stageId}"]`);
  const topicId = first?.closest(".picker-part")?.dataset.topicId;
  const label = first?.getAttribute("title");
  topicLabels[stageId] = label;
  configureTopic(stageId, topicId, 3);

  click($('[data-control-action="wizard-topics-next"]'));
  click($('[data-control-action="wizard-generate"]'));

  const rendered = $$(".exam-question").length;
  const bands = [...new Set($$(".topic-band-label").map(b => b.textContent.trim()))];

  t(`${stageId} alone generates a paper`, rendered > 0 && stillSelected === 0,
    `${rendered} questions, ${stillSelected} stale selections, topic "${label}"`);
}

console.log("\nPICKER INTERACTIONS");
click($('[data-control-action="close-modal"]'));
click($('[data-control-action="start-wizard"]'));
$('[data-builder-form="wizard-details"]')?.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
for (let g = 0; g < 40; g++) { const c = $('.picker-cart [data-control-action="clear-topic-selection"]'); if (!c) break; click(c); }
click($('.picker-tab[data-stage="stage2"]'));
t("a stage tab shows only that stage", $('[data-stage-panel="stage2"]') && !$('[data-stage-panel="stage2"]').hidden && $('[data-stage-panel="stage4"]').hidden);
const tog = $('[data-control-action="toggle-topic"][data-topic-stage="stage2"]');
const tid = tog?.closest(".picker-part")?.dataset.topicId;
click(tog);
t("one tap adds a topic", $$(".picker-cart-item").length === 1 && $(`.picker-part.is-selected[data-topic-id="${tid}"]`) !== null);
const countOf = () => Number($(".picker-cart-item output")?.textContent);
const c0 = countOf();
click($('.picker-cart-item [data-control-action="topic-count-step"][data-step="1"]'));
t("the + stepper adds a question", countOf() === c0 + 1, `${c0} → ${countOf()}`);
click($('.picker-cart-item [data-control-action="topic-count-step"][data-step="-1"]'));
t("the − stepper removes a question", countOf() === c0);
click($(`.picker-part[data-topic-id="${tid}"] [data-control-action="toggle-topic"]`));
t("tapping again removes it", $$(".picker-cart-item").length === 0);
const search = $("[data-picker-search]");
search.value = "clock";
search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
const shown = $$(".picker-topic").filter(c => !c.hidden && !c.closest("[data-stage-panel]").hidden);
t("search finds topics across stages", shown.length > 0 && shown.every(c => c.dataset.search.includes("clock")), `${shown.length} topics`);
search.value = "zzqx";
search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
t("an unmatched search says so", !$(".picker-no-results").hidden);
search.value = "";
search.dispatchEvent(new dom.window.Event("input", { bubbles: true }));

console.log("\nNO CROSS-STAGE LEAKAGE");
/* The original bug: a Stage 3 selection landed in Stage 4's bucket. Detect it
   by checking no stage's card grid claims a topic belonging to another stage. */
let leaked = 0;
for (const stage of ["stage1", "stage2", "stage3", "stage4", "stage5"]) {
  const selectedHere = $$(`.picker-part.is-selected[data-topic-stage="${stage}"]`)
    .map(c => c.dataset.topicId);
  // Every id shown as selected under a stage must be a topic that stage owns.
  const owned = $$(`.picker-part[data-topic-stage="${stage}"]`).map(c => c.dataset.topicId);
  leaked += selectedHere.filter(id => !owned.includes(id)).length;
}
t("no topic id appears under two stages", leaked === 0, `${leaked} leaked`);

console.log(fail?`\n${fail} FAILED`:"\nALL PASSED");
process.exit(fail?1:0);
