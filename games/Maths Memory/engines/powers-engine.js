// Math Memory squares and square roots engine
// Classic-script version so index.html can be opened locally or hosted.
(() => {
  function shuffle(array){
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function renderSquareExpression(base){
    return `
      <span class="power-display" aria-label="${base} squared">
        <span class="power-base">${base}</span><sup>2</sup>
      </span>
    `;
  }

  function renderSquareRootExpression(radicand){
    const text = String(radicand);
    const textX = text.length >= 3 ? 90 : 84;
    return `
      <span class="root-display sqrt-wrap" aria-label="square root of ${radicand}">
        <svg class="sqrt-svg" viewBox="0 0 132 72" role="img" aria-hidden="true" focusable="false">
          <path class="sqrt-mark" d="M10 42 L25 42 L34 58 L52 18 L124 18"></path>
          <text class="sqrt-text" x="${textX}" y="44" text-anchor="middle">${text}</text>
        </svg>
      </span>
    `;
  }

  function renderPowerAnswer(value){
    return `<span class="power-answer-display" aria-label="${value}">${value}</span>`;
  }

  function createSquaresRootsPairs(pairCount = 10){
    const squareCount = Math.ceil(pairCount / 2);
    const rootCount = pairCount - squareCount;
    const usedCardKeys = new Set();
    const pairs = [];

    function canUse(keys){
      return keys.every(key => !usedCardKeys.has(key));
    }
    function mark(keys){
      keys.forEach(key => usedCardKeys.add(key));
    }

    const squareBases = shuffle([2,3,4,5,6,7,8,9,10,11,12]);
    for (const base of squareBases){
      if (pairs.filter(pair => pair.type === 'square').length >= squareCount) break;
      const value = base * base;
      const keys = [`square-question-${base}`, `number-${value}`];
      if (!canUse(keys)) continue;
      const pairId = `square-${base}`;
      pairs.push({
        pairId,
        type: 'square',
        cards: [
          {
            id: `${pairId}-question`,
            pairId,
            topic: 'squaresRoots',
            kind: 'squareExpression',
            base,
            value,
            text: `${base}^2`,
            label: `${base} squared`,
            revealed: false,
            matched: false
          },
          {
            id: `${pairId}-answer`,
            pairId,
            topic: 'squaresRoots',
            kind: 'powerAnswer',
            value,
            text: String(value),
            label: String(value),
            revealed: false,
            matched: false
          }
        ]
      });
      mark(keys);
    }

    const rootBases = shuffle([2,3,4,5,6,7,8,9,10,11,12]);
    for (const base of rootBases){
      if (pairs.filter(pair => pair.type === 'root').length >= rootCount) break;
      const radicand = base * base;
      const keys = [`root-question-${radicand}`, `number-${base}`];
      if (!canUse(keys)) continue;
      const pairId = `root-${radicand}`;
      pairs.push({
        pairId,
        type: 'root',
        cards: [
          {
            id: `${pairId}-question`,
            pairId,
            topic: 'squaresRoots',
            kind: 'rootExpression',
            base,
            radicand,
            value: base,
            text: `sqrt(${radicand})`,
            label: `square root of ${radicand}`,
            revealed: false,
            matched: false
          },
          {
            id: `${pairId}-answer`,
            pairId,
            topic: 'squaresRoots',
            kind: 'powerAnswer',
            value: base,
            text: String(base),
            label: String(base),
            revealed: false,
            matched: false
          }
        ]
      });
      mark(keys);
    }

    // Very unlikely, but if uniqueness constraints made the deck short, top up from any safe candidate.
    const existingPairIds = new Set(pairs.map(pair => pair.pairId));
    const fallback = [];
    for (let base = 2; base <= 12; base++){
      fallback.push({ type:'square', base, value:base * base });
      fallback.push({ type:'root', base, radicand:base * base, value:base });
    }
    for (const item of shuffle(fallback)){
      if (pairs.length >= pairCount) break;
      if (item.type === 'square'){
        const pairId = `square-${item.base}`;
        const keys = [`square-question-${item.base}`, `number-${item.value}`];
        if (existingPairIds.has(pairId) || !canUse(keys)) continue;
        pairs.push({
          pairId,
          type:'square',
          cards:[
            { id:`${pairId}-question`, pairId, topic:'squaresRoots', kind:'squareExpression', base:item.base, value:item.value, text:`${item.base}^2`, label:`${item.base} squared`, revealed:false, matched:false },
            { id:`${pairId}-answer`, pairId, topic:'squaresRoots', kind:'powerAnswer', value:item.value, text:String(item.value), label:String(item.value), revealed:false, matched:false }
          ]
        });
        existingPairIds.add(pairId);
        mark(keys);
      } else {
        const pairId = `root-${item.radicand}`;
        const keys = [`root-question-${item.radicand}`, `number-${item.value}`];
        if (existingPairIds.has(pairId) || !canUse(keys)) continue;
        pairs.push({
          pairId,
          type:'root',
          cards:[
            { id:`${pairId}-question`, pairId, topic:'squaresRoots', kind:'rootExpression', base:item.base, radicand:item.radicand, value:item.value, text:`sqrt(${item.radicand})`, label:`square root of ${item.radicand}`, revealed:false, matched:false },
            { id:`${pairId}-answer`, pairId, topic:'squaresRoots', kind:'powerAnswer', value:item.value, text:String(item.value), label:String(item.value), revealed:false, matched:false }
          ]
        });
        existingPairIds.add(pairId);
        mark(keys);
      }
    }

    return shuffle(pairs).slice(0, pairCount).map(({ pairId, cards }) => ({ pairId, cards }));
  }

  window.MathMemoryPowersEngine = {
    createSquaresRootsPairs,
    renderSquareExpression,
    renderSquareRootExpression,
    renderPowerAnswer
  };
})();
