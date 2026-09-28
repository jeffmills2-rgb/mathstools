import React, { useEffect, useRef, useState } from "react";

import { useLodgeYard } from "../game/lodgeYardStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  YARD_ROUNDS_PER_SET,
  YARD_ONES_POINTS,
  YARD_TENS_POINTS,
} from "../data/snow/lodgeYardChallenge.js";
import { SnowIntro, SnowRoundHead, SnowWorking } from "./SnowCardParts.jsx";

/**
 * THE LODGE YARD — 2D panel (LY). Three quick typed hops per round: the
 * ONES hop to the next ten, the TENS hop to 100, then the whole change —
 * each landing on the hundred-bead board as it's answered. Zero is
 * sometimes the right hop! Wrong change → shake + the friends-of-100
 * story. Esc quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2200;

export default function LodgeYardPanel() {
  const status = useLodgeYard((s) => s.status);
  const roundIndex = useLodgeYard((s) => s.roundIndex);
  const score = useLodgeYard((s) => s.score);
  const bestScore = useLodgeYard((s) => s.bestScore);
  const round = useLodgeYard((s) => s.currentRound());
  const onesResult = useLodgeYard((s) => s.onesResult);
  const tensResult = useLodgeYard((s) => s.tensResult);
  const typedCorrect = useLodgeYard((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useLodgeYard.getState().exit();
    }
  }, [status, regionId]);

  // Fresh input + autofocus at each typed step.
  useEffect(() => {
    if (status === "ones" || status === "tens" || status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useLodgeYard.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (e.key !== "Enter" || typingInField) return;
      if (st.status === "intro") st.beginRounds();
      else if (st.status === "feedback" || st.status === "celebrate") st.next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  useEffect(() => {
    if (status === "feedback") {
      playerState.camShake = { start: Date.now(), dur: 500 };
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status !== "celebrate") return undefined;
    const t = setTimeout(() => useLodgeYard.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function wobble() {
    setInputWobble(true);
    setTimeout(() => setInputWobble(false), 400);
    inputRef.current?.focus();
  }

  function submitCurrent() {
    const st = useLodgeYard.getState();
    let result = "invalid";
    if (st.status === "ones") result = st.submitOnes(typed);
    else if (st.status === "tens") result = st.submitTens(typed);
    else if (st.status === "typing") result = st.submitChange(typed);
    if (result === "invalid") wobble();
  }

  return (
    <div className="farm-challenge-panel snow-dock">
      {status === "intro" && (
        <SnowIntro
          icon="☕"
          title="The Lodge Yard"
          steps={[
            <>You buy a hot chocolate and pay with <b>$1</b>. That's <b>100 cents</b>.</>,
            <>Count UP the change in two hops: first to the <b>next ten</b>…</>,
            <>…then up to <b>100c</b>. Add the two hops together.</>,
          ]}
          example="65c → 70c is 5c,  70c → 100c is 30c.  Change: 35c"
          onStart={() => useLodgeYard.getState().beginRounds()}
          onQuit={() => useLodgeYard.getState().exit()}
        />
      )}

      {(status === "ones" || status === "tens" || status === "typing") && round && (
        <div className="farm-challenge-card">
          <SnowRoundHead
            icon="☕"
            roundIndex={roundIndex}
            total={YARD_ROUNDS_PER_SET}
            score={score}
            onQuit={() => useLodgeYard.getState().exit()}
          >
            <span className="snow-round">
              Costs <span className="fc-value">{round.price}c</span> · paid $1
            </span>
          </SnowRoundHead>
          {status === "tens" && onesResult && (
            <div className={`farm-challenge-verdict ${onesResult.correct ? "good" : "warm"}`}>
              {onesResult.correct
                ? `${round.price}c + ${round.onesHop}c = ${round.afterOnes}c ✓ (+${YARD_ONES_POINTS} pts)`
                : `It was ${round.onesHop}c: ${round.price}c + ${round.onesHop}c = ${round.afterOnes}c.`}
            </div>
          )}
          {status === "typing" && tensResult && (
            <div className={`farm-challenge-verdict ${tensResult.correct ? "good" : "warm"}`}>
              {tensResult.correct
                ? `${round.afterOnes}c + ${round.tensHop}c = 100c ✓ (+${YARD_TENS_POINTS} pts)`
                : `It was ${round.tensHop}c: ${round.afterOnes}c + ${round.tensHop}c = 100c.`}
            </div>
          )}
          <div className="snow-q">
            {status === "ones" && (
              round.onesHop === 0
                ? <>{round.price}c is already a tens number. How far to the next ten? (It might be 0!)</>
                : <>Hop 1: {round.price}c to the next ten ({round.price - (round.price % 10) + 10}c) is <span className="fc-value">?</span></>
            )}
            {status === "tens" && (
              <>Hop 2: {round.afterOnes}c to 100c is <span className="fc-value">?</span></>
            )}
            {status === "typing" && (
              <>So how much change do you get?</>
            )}
          </div>
          <div className={`weigh-input-row${inputWobble ? " wobble" : ""}`}>
            <input
              ref={inputRef}
              className="text-input weigh-input"
              type="text"
              inputMode="numeric"
              placeholder="?"
              value={typed}
              maxLength={3}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitCurrent()}
            />
            <span className="weigh-unit">cents</span>
            <button className="primary-button" onClick={submitCurrent}>
              {status === "typing" ? "Check" : "Hop!"}
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ Your change is {round.change}c — enjoy the hot chocolate! · ⭐ {score}
            </span>
          </div>
        </div>
      )}

      {status === "feedback" && round && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-verdict bad">
            {typedCorrect === false ? "Not quite — here's how it works:" : "Here's how it works:"}
          </div>
          <SnowWorking lines={round.working} />
          <div className="farm-challenge-buttons">
            <button
              className="primary-button"
              onClick={(e) => {
                e.currentTarget.blur();
                useLodgeYard.getState().next();
              }}
            >
              {roundIndex + 1 < YARD_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>☕ The Lodge Yard — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useLodgeYard.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useLodgeYard.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
