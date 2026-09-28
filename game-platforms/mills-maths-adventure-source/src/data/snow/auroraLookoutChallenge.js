/**
 * AURORA LOOKOUT — THE STRATEGY PICKER (AL) — pure logic for the CAPSTONE,
 * the tenth Snowball Sums build. No React, no stores — fully checkable
 * headlessly. All values are small integers.
 *
 * PEDAGOGY — the whole snow world in one place: the aurora writes a sum in
 * the sky and the play is CHOOSING THE TOOL, not finding the answer. Every
 * problem is engineered around one BRIGHTEST strategy, but other tools can
 * genuinely work — and a SOUND second-best choice still scores (5), while
 * the brightest path scores full (10). Only unsound tools score nothing.
 * Then the chosen tool (if sound — else the brightest) is EXECUTED with a
 * one-line scaffold in that strategy's own language. This is the round that
 * makes the world about strategies rather than answers.
 *
 * The seven tools on the menu (each learned at its own challenge):
 *   bridge   ❄️ make ten first          (Snowball Range)
 *   jump     ⛸️ glide by tens           (Ice Rink)
 *   comp     🎄 round, then adjust      (Christmas Tree Grove)
 *   double   🐧 doubles + near-doubles  (Penguin Colony / Snowman Meadow)
 *   countup  🌌 count up the gap        (Ice Cave)
 *   slide    🛷 slide both numbers      (Sledding Slope)
 *   friends  ☕ friends of 100          (Lodge Yard)
 *
 * Eight problem ARCHETYPES, each with a fixed brightest tool + a sound set
 * (the schedule below guarantees every archetype appears in every set):
 *   makeTen     8 + 6            bridge   (sound: double if near, comp if a 9)
 *   nineAdd     47 + 29          comp     (sound: jump, bridge)
 *   nearDouble  25 + 26          double   (sound: jump for two-digit pairs)
 *   closeSub    83 − 79          countup  (sound: slide)
 *   splitAdd    45 + 38? no —    jump     (two-digit + two-digit, plain ones;
 *               46 + 33 style             sound: bridge? no — jump/comp per ones)
 *   slideSub    62 − 29          slide    (sound: comp? not taught for −; none)
 *   pay100      100 − 65         friends  (sound: countup)
 *   cleanJump   47 + 30          jump     (sound: none needed — jump IS it)
 *
 * A SET is 15 rounds — the archetype SCHEDULE (not random) walks the tools
 * then mixes them, ending on the subtlest calls.
 *
 * Scoring (per round, max 25):
 *   A) PICK the tool — brightest 10 · sound 5 · unsound 0
 *   B) EXECUTE it against the scaffold (type the result)  = 15
 */

export const LOOKOUT_ROUNDS_PER_SET = 15;

export const LOOKOUT_PICK_BEST_POINTS = 10;
export const LOOKOUT_PICK_SOUND_POINTS = 5;
export const LOOKOUT_ANSWER_POINTS = 15;
export const LOOKOUT_ROUND_POINTS = LOOKOUT_PICK_BEST_POINTS + LOOKOUT_ANSWER_POINTS; // 25
export const LOOKOUT_MAX_SCORE = LOOKOUT_ROUNDS_PER_SET * LOOKOUT_ROUND_POINTS; // 375

// The tool menu (keys 1–4 pick from the round's four offered tools).
// 2026-09-28 audit: EIGHT tools — "🧊 Tens and ones" (Igloo Village's split
// strategy) was missing, even though the splitAdd archetype's own scaffold
// ("tens 20 + 30, ones 5 + 7") IS that strategy. Each tool now carries a
// tiny worked example so a student who has forgotten the name still
// recognises the move. And a round OFFERS only four of them (see
// lookoutOptionsFor) — seven buttons at once was a wall of text.
export const LOOKOUT_STRATEGIES = [
  { key: "bridge", label: "❄️ Make ten first", example: "8 + 5 → 8 + 2 + 3" },
  { key: "jump", label: "⛸️ Jump by tens", example: "47 + 30 → 57, 67, 77" },
  { key: "comp", label: "🎄 Round, then fix", example: "47 + 29 → 47 + 30 − 1" },
  { key: "double", label: "🐧 Use a double", example: "25 + 26 → double 25, +1" },
  { key: "split", label: "🧊 Tens and ones", example: "34 + 25 → 30 + 20, 4 + 5" },
  { key: "countup", label: "🌌 Count up the gap", example: "83 − 79 → 79 … 83" },
  { key: "slide", label: "🛷 Slide both numbers", example: "62 − 29 → 63 − 30" },
  { key: "friends", label: "☕ Count up to 100", example: "100 − 65 → 70 … 100" },
  { key: "count", label: "🐾 Count in ones", example: "8 + 5 → 9, 10, 11, 12, 13" },
];

// Round 2 (Jeff, 2026-09-29): "far too hard to read… a younger student
// would get lost". A round no longer offers strategy NAMES to pick from. It
// offers THREE WAYS TO DO THIS SUM — each one this sum rewritten (47 + 29 →
// "47 + 30 − 1", "40 + 20 + 7 + 9", "47 → count on 29") — every one of them
// CORRECT. The question is only "which way is easiest?". The easiest scores
// 10, the other two still work (5). Then the student does the sum the way
// they picked, one small step per line.
export const LOOKOUT_OPTIONS_PER_ROUND = 3;

/**
 * The four tools OFFERED this round: the brightest, one sound alternative
 * (when the round has one), and the rest drawn from the unsound tools —
 * shuffled, so position gives nothing away. Pure (rand injectable).
 */
export function lookoutOptionsFor(best, sound, rand = Math.random) {
  const keys = LOOKOUT_STRATEGIES.map((t) => t.key);
  const picked = [best];
  if (sound.length) picked.push(sound[Math.floor(rand() * sound.length)]);
  const rest = keys.filter((k) => !picked.includes(k) && !sound.includes(k));
  while (picked.length < LOOKOUT_OPTIONS_PER_ROUND && rest.length) {
    picked.push(rest.splice(Math.floor(rand() * rest.length), 1)[0]);
  }
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}

// One full pass of the archetypes, then a mixed back half — every archetype
// appears at least once in every set. (Fixed, so the checks can assert it.)
export const LOOKOUT_SCHEDULE = [
  "makeTen", "cleanJump", "nearDouble", "nineAdd", "splitAdd",
  "closeSub", "pay100", "slideSub", "nearDouble", "nineAdd",
  "closeSub", "splitAdd", "pay100", "slideSub", "makeTen",
];

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

// Per-archetype: the numbers, the answer, the EASIEST way (best), and the
// other ways that also work (alts, in preference order). Every way is
//   { show: the sum rewritten (big, on the choice tile),
//     steps: small steps to do it, the last ending "= ?" }
// No way ever shows the final answer.
const tensOnes = (n) => [Math.floor(n / 10) * 10, n % 10];

function splitWay(a, b) {
  const [ta, oa] = tensOnes(a);
  const [tb, ob] = tensOnes(b);
  return {
    show: `${ta} + ${tb} + ${oa} + ${ob}`,
    steps: [`${ta} + ${tb} = ${ta + tb}`, `${oa} + ${ob} = ${oa + ob}`, `${ta + tb} + ${oa + ob} = ?`],
  };
}

function jumpWay(a, b) {
  const [tb, ob] = tensOnes(b);
  if (ob === 0) {
    return { show: `${a}${" + 10".repeat(tb / 10)}`, steps: [`Start at ${a}, jump ${tb / 10} tens = ?`] };
  }
  return { show: `${a} + ${tb} + ${ob}`, steps: [`${a} + ${tb} = ${a + tb}`, `${a + tb} + ${ob} = ?`] };
}

const countOnWay = (a, b) => ({ show: `${a} → count on ${b}`, steps: [`Start at ${a}, count on ${b} ones = ?`] });
const countBackWay = (a, b) => ({ show: `${a} → count back ${b}`, steps: [`Start at ${a}, count back ${b} ones = ?`] });
const countUpWay = (a, b) => ({ show: `${b} → ${a}`, steps: [`Count up from ${b} to ${a}. How many? = ?`] });

const ARCHETYPES = {
  makeTen: (rand) => {
    // 6–8 and never a 9 to add: with a 9, "round, then fix" is just as easy
    // as making ten, and the "easiest" call would be a coin flip.
    const a = randInt(6, 8, rand);
    const comp = 10 - a;
    let b = comp + randInt(1, 8 - comp, rand);
    if (b === a) b = b > comp + 1 ? b - 1 : b + 1; // 9 + 9 is a double, not make-ten
    const rest = b - comp;
    const ways = {
      bridge: { show: `${a} + ${comp} + ${rest}`, steps: [`${a} + ${comp} = 10`, `10 + ${rest} = ?`] },
      comp: { show: `10 + ${b} − ${comp}`, steps: [`10 + ${b} = ${10 + b}`, `${10 + b} − ${comp} = ?`] },
      count: countOnWay(a, b),
    };
    const alts = ["comp", "count"];
    if (a !== b && Math.abs(a - b) <= 2) {
      const m = Math.min(a, b);
      const d = Math.abs(a - b);
      ways.double = { show: `double ${m} + ${d}`, steps: [`${m} + ${m} = ${2 * m}`, `${2 * m} + ${d} = ?`] };
      alts.unshift("double");
    }
    return { expr: `${a} + ${b}`, answer: a + b, best: "bridge", ways, alts };
  },
  cleanJump: (rand) => {
    const b = randInt(2, 4, rand) * 10;
    let a = randInt(23, Math.min(59, 97 - b), rand);
    if (a % 10 === 0) a -= 1; // never a round ten (50 + 40 has no ones to split)
    const [ta, oa] = tensOnes(a);
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "jump",
      ways: {
        jump: jumpWay(a, b),
        split: { show: `${ta} + ${b} + ${oa}`, steps: [`${ta} + ${b} = ${ta + b}`, `${ta + b} + ${oa} = ?`] },
        count: countOnWay(a, b),
      },
      alts: ["split", "count"],
    };
  },
  nearDouble: (rand) => {
    const a = randInt(13, 37, rand);
    const b = a + 1;
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "double",
      ways: {
        double: { show: `double ${a} + 1`, steps: [`${a} + ${a} = ${2 * a}`, `${2 * a} + 1 = ?`] },
        split: splitWay(a, b),
        jump: jumpWay(a, b),
      },
      alts: ["split", "jump"],
    };
  },
  nineAdd: (rand) => {
    const ones = pick([8, 9], rand);
    const k = 10 - ones;
    const b = randInt(1, 4, rand) * 10 + ones;
    let a = randInt(25, 97 - b - 2, rand);
    // Not a near-double (47 + 48 would be easiest as a double).
    if (Math.abs(a - b) <= 3) a = a + 4 <= 97 - b - 2 ? a + 4 : a - 4;
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "comp",
      ways: {
        comp: { show: `${a} + ${b + k} − ${k}`, steps: [`${a} + ${b + k} = ${a + b + k}`, `${a + b + k} − ${k} = ?`] },
        split: splitWay(a, b),
        jump: jumpWay(a, b),
      },
      alts: ["split", "jump"],
    };
  },
  splitAdd: (rand) => {
    const oa = randInt(4, 7, rand);
    const ob = randInt(Math.max(3, 11 - oa), Math.min(7, 14 - oa), rand);
    const ta = randInt(2, 5, rand);
    const tb = randInt(2, Math.min(5, 8 - ta - 1), rand);
    const a = ta * 10 + oa;
    const b = tb * 10 + ob;
    return {
      expr: `${a} + ${b}`, answer: a + b, best: "split",
      ways: { split: splitWay(a, b), jump: jumpWay(a, b), count: countOnWay(a, b) },
      alts: ["jump", "count"],
    };
  },
  closeSub: (rand) => {
    const gap = randInt(2, 5, rand);
    let a = randInt(41, 97, rand);
    if (a % 10 === gap % 10) a = Math.min(97, a + 1); // keep b off a round ten
    const b = a - gap;
    // Slide both to the nearer round ten (down if b ends 1–4, else up).
    const k = b % 10 <= 4 ? -(b % 10) : 10 - (b % 10);
    return {
      expr: `${a} − ${b}`, answer: gap, best: "countup",
      ways: {
        countup: countUpWay(a, b),
        slide: { show: `${a + k} − ${b + k}`, steps: [`${a + k} − ${b + k} = ?`] },
        count: countBackWay(a, b),
      },
      alts: ["slide", "count"],
    };
  },
  slideSub: (rand) => {
    const ones = pick([8, 9], rand);
    const sft = 10 - ones;
    const b = randInt(1, 4, rand) * 10 + ones;
    let a = randInt(b + 13, 97, rand);
    // 59 − 29 slides to 60 − 30: the answer would be sitting on the tile.
    if (a - b === b + sft) a = a < 97 ? a + 1 : a - 1;
    return {
      expr: `${a} − ${b}`, answer: a - b, best: "slide",
      ways: {
        slide: { show: `${a + sft} − ${b + sft}`, steps: [`Add ${sft} to both numbers`, `${a + sft} − ${b + sft} = ?`] },
        comp: { show: `${a} − ${b + sft} + ${sft}`, steps: [`${a} − ${b + sft} = ${a - b - sft}`, `${a - b - sft} + ${sft} = ?`] },
        countup: countUpWay(a, b),
      },
      alts: ["comp", "countup"],
    };
  },
  pay100: (rand) => {
    const price = randInt(2, 8, rand) * 10 + randInt(1, 9, rand);
    const [tens, ones] = tensOnes(price);
    const next = tens + 10;
    return {
      expr: `100 − ${price}`, answer: 100 - price, best: "friends",
      ways: {
        friends: {
          show: `${price} → ${next} → 100`,
          steps: [`${price} up to ${next} is ${next - price}`, `${next} up to 100 is ${100 - next}`, `${next - price} + ${100 - next} = ?`],
        },
        split: { show: `100 − ${tens} − ${ones}`, steps: [`100 − ${tens} = ${100 - tens}`, `${100 - tens} − ${ones} = ?`] },
        count: countBackWay(100, price),
      },
      alts: ["split", "count"],
    };
  },
};

export const LOOKOUT_ARCHETYPE_KEYS = Object.keys(ARCHETYPES);

const TOOL_LABEL = (key) => (LOOKOUT_STRATEGIES.find((s) => s.key === key) || { label: key }).label;

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateLookoutRound(roundIndex, rand = Math.random) {
  const archetype = LOOKOUT_SCHEDULE[roundIndex];
  // No tile may carry the answer itself (76 − 38: "count up from 38" would).
  const leaks = (bt) =>
    Object.values(bt.ways).some((w) =>
      (w.show + " " + w.steps[w.steps.length - 1]).match(/\d+/g).includes(String(bt.answer))
    );
  let built = ARCHETYPES[archetype](rand);
  for (let guard = 0; guard < 40 && leaks(built); guard++) built = ARCHETYPES[archetype](rand);
  // The easiest way + two that also work (the first alt, then one more).
  const alts = built.alts.slice(0, LOOKOUT_OPTIONS_PER_ROUND - 1);
  const keys = [built.best, ...alts];
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  const choices = keys.map((key) => ({ key, label: TOOL_LABEL(key), ...built.ways[key] }));
  const bestWay = built.ways[built.best];
  const fill = (line) => line.replace(/\?$/, String(built.answer));
  return {
    roundIndex,
    stage: Math.floor(roundIndex / 3),
    archetype,
    expr: built.expr,
    answer: built.answer,
    best: built.best,
    sound: alts, // every offered way works — the others score half
    options: keys,
    choices,
    scaffold: bestWay.steps.join(" · "),
    working: [`${built.expr} — easiest: ${bestWay.show}`, ...bestWay.steps.map(fill)],
    prompt: `${built.expr}: which way is easiest?`,
    reason: `${built.expr} → ${bestWay.show}: ${bestWay.steps.map(fill).join(", ")}.`,
  };
}

/**
 * A full set — the schedule is FIXED; only the numbers vary. Consecutive
 * rounds never repeat the same expression.
 */
export function generateLookoutSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < LOOKOUT_ROUNDS_PER_SET; i++) {
    let round = generateLookoutRound(i, rand);
    let guard = 0;
    while (i > 0 && guard < 30 && round.expr === rounds[i - 1].expr) {
      round = generateLookoutRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

/** Grade Part A — the picked tool. Brightest 10 · sound 5 · unsound 0. Pure. */
export function gradeLookoutPick(round, key) {
  const best = key === round.best;
  const sound = round.sound.includes(key);
  const points = best ? LOOKOUT_PICK_BEST_POINTS : sound ? LOOKOUT_PICK_SOUND_POINTS : 0;
  const strat = LOOKOUT_STRATEGIES.find((s) => s.key === key);
  return {
    best,
    sound: best || sound,
    key,
    points,
    label: best
      ? `✨ Yes — that's the easiest way! +${LOOKOUT_PICK_BEST_POINTS} pts`
      : sound
        ? `That way works! +${LOOKOUT_PICK_SOUND_POINTS} pts (the easiest way gets ${LOOKOUT_PICK_BEST_POINTS})`
        : `${strat ? strat.label : key} doesn't fit this one.`,
  };
}

/** Grade Part B — the TYPED result. Pure. */
export function checkLookoutAnswer(round, text) {
  const cleaned = String(text || "").replace(/\s/g, "");
  if (!/^\d+$/.test(cleaned)) return { valid: false, correct: false };
  return { valid: true, correct: Number(cleaned) === round.answer };
}
