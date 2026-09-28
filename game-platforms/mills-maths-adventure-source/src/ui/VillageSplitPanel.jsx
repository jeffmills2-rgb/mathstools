import React, { useEffect, useRef, useState } from "react";

import { useVillageSplit } from "../game/villageSplitStore.js";
import { useSession, playerState } from "../game/sessionStore.js";
import {
  VILLAGE_ROUNDS_PER_SET,
} from "../data/snow/villageSplitChallenge.js";
import { SnowIntro, SnowRoundHead, SnowWorking } from "./SnowCardParts.jsx";

/**
 * IGLOO VILLAGE — 2D panel (VG). PREDICT the overflow (Y/N buttons or keys
 * 1–2), JOIN like with like (two quick inputs: the tens wall, then the RAW
 * ones pile — 13, not 3!), then TYPE the finished igloo while the blocks
 * fly and the regroup SNAPS. Wrong total → shake + the split story. Esc
 * quits; leaving the snow world exits.
 */

const CELEBRATE_MS = 2200;

export default function VillageSplitPanel() {
  const status = useVillageSplit((s) => s.status);
  const roundIndex = useVillageSplit((s) => s.roundIndex);
  const score = useVillageSplit((s) => s.score);
  const bestScore = useVillageSplit((s) => s.bestScore);
  const round = useVillageSplit((s) => s.currentRound());
  const predictResult = useVillageSplit((s) => s.predictResult);
  const joinResult = useVillageSplit((s) => s.joinResult);
  const typedCorrect = useVillageSplit((s) => s.typedCorrect);
  const regionId = useSession((s) => s.currentRegionId);
  const [tensTyped, setTensTyped] = useState("");
  const [onesTyped, setOnesTyped] = useState("");
  const [typed, setTyped] = useState("");
  const [inputWobble, setInputWobble] = useState(false);
  const tensRef = useRef(null);
  const onesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (status !== "idle" && regionId !== "snow-sums") {
      useVillageSplit.getState().exit();
    }
  }, [status, regionId]);

  useEffect(() => {
    if (status === "joining") {
      setTensTyped("");
      setOnesTyped("");
      setTimeout(() => tensRef.current?.focus(), 50);
    }
    if (status === "typing") {
      setTyped("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status, roundIndex]);

  useEffect(() => {
    if (status === "idle") return undefined;
    function onKey(e) {
      const st = useVillageSplit.getState();
      if (e.key === "Escape") {
        st.exit();
        return;
      }
      const typingInField = e.target && /input|textarea/i.test(e.target.tagName || "");
      if (typingInField) return;
      if (st.status === "predicting") {
        if (e.key === "1") st.choosePredict(true);
        if (e.key === "2") st.choosePredict(false);
        return;
      }
      if (e.key !== "Enter") return;
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
    const t = setTimeout(() => useVillageSplit.getState().next(), CELEBRATE_MS);
    return () => clearTimeout(t);
  }, [status, roundIndex]);

  if (status === "idle") return null;

  function submitJoin() {
    const result = useVillageSplit.getState().submitJoin(tensTyped, onesTyped);
    if (result === "invalid") {
      setInputWobble(true);
      setTimeout(() => setInputWobble(false), 400);
      (tensTyped.trim() === "" ? tensRef : onesRef).current?.focus();
    }
  }

  function submitTyped() {
    const result = useVillageSplit.getState().submitTotal(typed);
    if (result === "invalid") {
      setInputWobble(true);
      setTimeout(() => setInputWobble(false), 400);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="farm-challenge-panel snow-dock">
      {status === "intro" && (
        <SnowIntro
          icon="🧊"
          title="Igloo Village"
          steps={[
            <>Igloos are built from <b>ten-rods</b> (ten ice cubes stuck together) and single <b>ones</b>.</>,
            <>To join two igloos, put <b>tens with tens</b> and <b>ones with ones</b>.</>,
            <>If the ones make 10 or more, ten of them snap into a <b>new ten-rod</b>!</>,
          ]}
          example="38 + 25  →  30 + 20 = 50,  8 + 5 = 13  →  50 + 13 = 63"
          onStart={() => useVillageSplit.getState().beginRounds()}
          onQuit={() => useVillageSplit.getState().exit()}
        />
      )}

      {status === "predicting" && round && (
        <div className="farm-challenge-card">
          <SnowRoundHead
            icon="🧊"
            roundIndex={roundIndex}
            total={VILLAGE_ROUNDS_PER_SET}
            score={score}
            onQuit={() => useVillageSplit.getState().exit()}
          />
          <div className="snow-q">
            The ones are <span className="fc-value">{round.oa}</span> and <span className="fc-value">{round.ob}</span>. Will
            they make a new ten?
          </div>
          <div className="plank-pieces">
            <button
              className="plank-piece-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                useVillageSplit.getState().choosePredict(true);
              }}
            >
              Yes — 10 or more
            </button>
            <button
              className="plank-piece-btn"
              onClick={(e) => {
                e.currentTarget.blur();
                useVillageSplit.getState().choosePredict(false);
              }}
            >
              No — less than 10
            </button>
          </div>
        </div>
      )}

      {status === "joining" && round && predictResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${predictResult.correct ? "good" : "warm"}`}>
            {predictResult.label}
          </div>
          <div className="snow-q">Join like with like:</div>
          <div className={`snow-eq-rows${inputWobble ? " wobble" : ""}`}>
            <div className="snow-eq-row">
              <span className="snow-eq-label">Tens</span>
              {round.ta * 10} + {round.tb * 10} =
              <input
                ref={tensRef}
                className="text-input weigh-input"
                type="text"
                inputMode="numeric"
                placeholder="?"
                value={tensTyped}
                maxLength={3}
                onChange={(e) => setTensTyped(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onesRef.current?.focus()}
              />
            </div>
            <div className="snow-eq-row">
              <span className="snow-eq-label">Ones</span>
              {round.oa} + {round.ob} =
              <input
                ref={onesRef}
                className="text-input weigh-input"
                type="text"
                inputMode="numeric"
                placeholder="?"
                value={onesTyped}
                maxLength={2}
                onChange={(e) => setOnesTyped(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitJoin()}
              />
            </div>
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={submitJoin}>
              Join them!
            </button>
          </div>
        </div>
      )}

      {status === "typing" && round && joinResult && (
        <div className="farm-challenge-card">
          <div className={`farm-challenge-verdict ${joinResult.tensCorrect && joinResult.onesCorrect ? "good" : "warm"}`}>
            {joinResult.tensCorrect ? `Tens ${round.tensSum} ✓` : `The tens make ${round.tensSum}.`}{" "}
            {joinResult.onesCorrect ? `Ones ${round.onesSum} ✓` : `The ones make ${round.onesSum} (all of them).`}
          </div>
          <div className="snow-q">
            {round.regroup
              ? <>Ten ones snap into a new ten-rod: {round.tensSum} + 10 + {round.onesSum - 10} = ?</>
              : <>{round.tensSum} + {round.onesSum} = ?</>}
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
              onKeyDown={(e) => e.key === "Enter" && submitTyped()}
            />
            <span className="weigh-unit">ice cubes</span>
            <button className="primary-button" onClick={submitTyped}>
              Check
            </button>
          </div>
        </div>
      )}

      {status === "celebrate" && round && (
        <div className="farm-challenge-card mini">
          <div className="farm-challenge-head">
            <span>
              ✓ {round.a} + {round.b} = {round.tensSum} + {round.onesSum} = {round.total}! · ⭐ {score}
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
                useVillageSplit.getState().next();
              }}
            >
              {roundIndex + 1 < VILLAGE_ROUNDS_PER_SET ? "Next round (Enter)" : "Finish (Enter)"}
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="farm-challenge-card">
          <div className="farm-challenge-head">
            <span>🧊 Igloo Village — complete!</span>
          </div>
          <div className="farm-challenge-prompt">
            You scored {score} points. Best so far: {Math.max(bestScore, score)} points.
          </div>
          <div className="farm-challenge-buttons">
            <button className="primary-button" onClick={() => useVillageSplit.getState().start()}>
              Play again
            </button>
            <button className="link-button" onClick={() => useVillageSplit.getState().exit()}>
              Back to the snow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
