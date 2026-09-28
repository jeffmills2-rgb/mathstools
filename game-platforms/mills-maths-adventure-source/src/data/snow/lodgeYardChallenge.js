/**
 * THE LODGE YARD — COCOA CHANGE (LY) — pure logic for the FRIENDS-OF-100
 * challenge, the ninth Snowball Sums build. No React, no stores — fully
 * checkable headlessly. All values are small integers.
 *
 * PEDAGOGY — complements to 100 are built from complements to 10, with a
 * money-shaped purpose: the lodge sells hot chocolate, you pay with a
 * 100-token, and the CHANGE is counted UP on the hundred-bead cocoa board
 * (10 rows of 10). A cocoa costing 65 fills 65 beads; the change fills the
 * rest in TWO chosen hops — first the ones hop to the next ten (+5 → 70,
 * finishing the part-row), then the tens hop to 100 (+30 → 100, three
 * clean rows). Friends of 10 (5 needs 5) power friends of 100 (70 needs
 * 30). Traps: prices already ON a ten need NO ones hop, and prices in the
 * 90s need NO tens hop — zero is sometimes the right hop.
 *
 * A SET is 15 rounds, 3 per concept stage:
 *   S1  fives         prices ending 5 (the friendliest ones hop)
 *   S2  near tens     prices ending 1/2/8/9
 *   S3  the hard ones prices ending 3/4/6/7
 *   S4  any price     11–89, all endings
 *   S5  zero hops     round 13 is ON a ten; round 14 is in the 90s
 *
 * Round 2 (Jeff, 2026-09-29): the hundred-bead board "looks like a ratio".
 * It is gone. The change is now COUNTED UP WITH COINS on a number line that
 * runs from the price to $1: tap 1c, 5c, 10c, 20c or 50c coins and each one
 * is a jump along the line ("Total so far: 65c → 70c → 100c"). Land on
 * exactly 100c, press "Give the change", then say how much change it was.
 *
 * Scoring (per round, max 25):
 *   A) COUNT UP to exactly 100c with coins           = 10
 *      (5 if the till ever went past 100c on the way)
 *   B) TYPE the whole change (the coins added up)    = 15
 */

export const YARD_ROUNDS_PER_SET = 15;
const YARD_STAGES = 5;
const YARD_ROUNDS_PER_STAGE = YARD_ROUNDS_PER_SET / YARD_STAGES;

// The old hop-by-hop grades (kept pure for reference/checks).
export const YARD_ONES_POINTS = 10;
export const YARD_TENS_POINTS = 5;
export const YARD_COUNT_POINTS = 10;
export const YARD_COUNT_OVER_POINTS = 5;
export const YARD_CHANGE_POINTS = 15;
export const YARD_ROUND_POINTS = YARD_COUNT_POINTS + YARD_CHANGE_POINTS; // 25

/** The coins on the counter (cents). */
export const YARD_COINS = [1, 5, 10, 20, 50];
export const YARD_MAX_SCORE = YARD_ROUNDS_PER_SET * YARD_ROUND_POINTS; // 375

// The zero-hop traps land late in S5.
export const YARD_ON_TEN_ROUND_INDEX = 13; // price ends 0 → ones hop 0
export const YARD_NINETIES_ROUND_INDEX = 14; // price 91–99 → tens hop 0

// Bead pacing for the fill animation (3D layer + panel).
export const YARD_BEAD_MS = 90;

/** Which concept stage (0–4) a round index belongs to. Pure. */
export function yardStageFor(i) {
  return Math.max(0, Math.min(YARD_STAGES - 1, Math.floor(i / YARD_ROUNDS_PER_STAGE)));
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

function randInt(min, max, rand) {
  return min + Math.floor(rand() * (max - min + 1));
}

// Stage configs: the price's ones digits on offer + its tens range.
const YARD_STAGE_CONFIGS = [
  { onesSet: [5], tMin: 2, tMax: 7, name: "fives" },
  { onesSet: [1, 2, 8, 9], tMin: 2, tMax: 7, name: "near tens" },
  { onesSet: [3, 4, 6, 7], tMin: 2, tMax: 7, name: "the hard ones" },
  { onesSet: [1, 2, 3, 4, 5, 6, 7, 8, 9], tMin: 1, tMax: 8, name: "any price" },
  { onesSet: [1, 2, 3, 4, 5, 6, 7, 8, 9], tMin: 1, tMax: 8, name: "zero hops" },
];

/** Fewest coins that make `cents` (the coin set is canonical, so greedy). Pure. */
export function fewestCoinsFor(cents) {
  let left = cents;
  let n = 0;
  for (const c of [...YARD_COINS].sort((a, b) => b - a)) {
    n += Math.floor(left / c);
    left %= c;
  }
  return n;
}

/** Where the till is after these coins. Pure. */
export function yardTillAfter(round, coins) {
  return round.price + coins.reduce((t, c) => t + c, 0);
}

/** One round. roundIndex ∈ [0, 15); rand injectable for the checks. */
export function generateYardRound(roundIndex, rand = Math.random) {
  const stage = yardStageFor(roundIndex);
  const cfg = YARD_STAGE_CONFIGS[stage];

  let price;
  if (roundIndex === YARD_ON_TEN_ROUND_INDEX) {
    price = randInt(2, 8, rand) * 10; // ON a ten — the ones hop is ZERO
  } else if (roundIndex === YARD_NINETIES_ROUND_INDEX) {
    price = 90 + randInt(1, 9, rand); // in the 90s — the tens hop is ZERO
  } else {
    price = randInt(cfg.tMin, cfg.tMax, rand) * 10 + pick(cfg.onesSet, rand);
  }

  const onesHop = (10 - (price % 10)) % 10; // 0 when already on a ten
  const afterOnes = price + onesHop;
  const tensHop = 100 - afterOnes; // a multiple of ten; 0 from the 90s
  const change = 100 - price;

  return {
    roundIndex,
    stage,
    stageName: cfg.name,
    price,
    onesHop,
    afterOnes,
    tensHop,
    change,
    // The number line on the board runs from the tens number at or below
    // the price up to 100.
    lineMin: Math.floor(price / 10) * 10,
    fewestCoins: fewestCoinsFor(change),
    prompt: `A hot chocolate costs ${price}c. You pay with $1 (100c). Count up the change.`,
    // One step per line, in cents, for the feedback card.
    working:
      onesHop === 0
        ? [`${price}c is already a tens number`, `${price}c + ${tensHop}c = 100c`, `Change: ${change}c`]
        : tensHop === 0
          ? [`${price}c + ${onesHop}c = 100c`, `Change: ${change}c`]
          : [`${price}c + ${onesHop}c = ${afterOnes}c`, `${afterOnes}c + ${tensHop}c = 100c`, `Change: ${onesHop}c + ${tensHop}c = ${change}c`],
    reason:
      onesHop === 0
        ? `${price} is already ON a ten — no ones hop! ${price} + ${tensHop} → 100. Change: ${change}.`
        : tensHop === 0
          ? `${price} + ${onesHop} → 100 in one hop — no tens needed! Change: ${change}.`
          : `${price} + ${onesHop} → ${afterOnes} (finish the row), + ${tensHop} → 100 (the clean rows). Change: ${onesHop} + ${tensHop} = ${change}.`,
  };
}

/**
 * A full set. Consecutive rounds never repeat the same price, so every
 * order is fresh.
 */
export function generateYardSet(rand = Math.random) {
  const rounds = [];
  for (let i = 0; i < YARD_ROUNDS_PER_SET; i++) {
    let round = generateYardRound(i, rand);
    let guard = 0;
    while (i > 0 && guard < 30 && round.price === rounds[i - 1].price) {
      round = generateYardRound(i, rand);
      guard++;
    }
    rounds.push(round);
  }
  return rounds;
}

function parseNum(text) {
  // Cents now (audit 2026-09-28) — "35c" / "35¢" are fine answers too.
  const cleaned = String(text || "").replace(/\s/g, "").replace(/(c|¢|cents?)$/i, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

/** Grade Part A — the typed ONES hop (0–9). Pure. */
export function checkYardOnes(round, text) {
  const v = parseNum(text);
  if (v === null) return { valid: false, correct: false };
  return { valid: true, correct: v === round.onesHop };
}

/** Grade Part B — the typed TENS hop (0, 10 … 90 — the VALUE). Pure. */
export function checkYardTens(round, text) {
  const v = parseNum(text);
  if (v === null) return { valid: false, correct: false };
  return { valid: true, correct: v === round.tensHop };
}

/** Grade Part C — the whole change. Pure. */
export function checkYardChange(round, text) {
  const v = parseNum(text);
  if (v === null) return { valid: false, correct: false };
  return { valid: true, correct: v === round.change };
}

/** Grade "Give the change": only exactly 100c counts. Pure. */
export function gradeYardCount(round, coins, overshot) {
  const till = yardTillAfter(round, coins);
  if (till !== 100) {
    return {
      done: false,
      note: till < 100 ? `The till says ${till}c — keep counting up to 100c.` : `The till says ${till}c — that's past $1! Take a coin back.`,
    };
  }
  const points = overshot ? YARD_COUNT_OVER_POINTS : YARD_COUNT_POINTS;
  const fewest = coins.length <= round.fewestCoins;
  return {
    done: true,
    points,
    fewest,
    note: `${fewest ? "🎯 Fewest coins! " : ""}Right on 100c! +${points} pts`,
  };
}

