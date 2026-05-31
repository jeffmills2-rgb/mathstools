// Math Memory fraction/decimal/percentage engine
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

  function gcd(a, b){
    a = Math.abs(Number(a));
    b = Math.abs(Number(b));
    while (b){
      const t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function decimalKey(value){
    if (value && value.repeating) return `rep-${value.whole || 0}-${value.repeat}`;
    return `dec-${Number(value).toFixed(8)}`;
  }

  function formatDecimal(value){
    const n = Number(value);
    if (Number.isInteger(n)) return String(n);
    let text = n.toFixed(2);
    text = text.replace(/0+$/, '').replace(/\.$/, '');
    return text;
  }

  function renderFraction(numerator, denominator){
    return `
      <span class="fraction-display" aria-label="${numerator} out of ${denominator}">
        <span class="fraction-top">${numerator}</span>
        <span class="fraction-bar"></span>
        <span class="fraction-bottom">${denominator}</span>
      </span>
    `;
  }

  function renderDecimal(value){
    if (value && value.repeating){
      return `
        <span class="decimal-display repeating-decimal" aria-label="0 point ${value.repeat} recurring">
          0.<span class="repeat-digit">${value.repeat}</span>
        </span>
      `;
    }
    return `<span class="decimal-display" aria-label="Decimal ${formatDecimal(value)}">${formatDecimal(value)}</span>`;
  }

  function renderPercentage(percent){
    return `<span class="percentage-display" aria-label="${percent} percent">${percent}%</span>`;
  }

  const FRACTION_DECIMAL_POOL = [
    { n:1, d:2, decimal:0.5, label:'0.5' },
    { n:1, d:3, decimal:{ repeating:true, whole:0, repeat:'3' }, label:'0.3 recurring' },
    { n:1, d:4, decimal:0.25, label:'0.25' },
    { n:3, d:4, decimal:0.75, label:'0.75' },
    { n:1, d:5, decimal:0.2, label:'0.2' },
    { n:2, d:5, decimal:0.4, label:'0.4' },
    { n:3, d:5, decimal:0.6, label:'0.6' },
    { n:4, d:5, decimal:0.8, label:'0.8' },
    { n:1, d:10, decimal:0.1, label:'0.1' },
    { n:3, d:10, decimal:0.3, label:'0.3' },
    { n:7, d:10, decimal:0.7, label:'0.7' },
    { n:9, d:10, decimal:0.9, label:'0.9' },
    { n:10, d:10, decimal:1, label:'1' }
  ];

  function createFractionDecimalPairs(pairCount = 10){
    const selected = [];
    const usedDecimals = new Set();
    for (const item of shuffle(FRACTION_DECIMAL_POOL)){
      const key = decimalKey(item.decimal);
      if (usedDecimals.has(key)) continue;
      selected.push(item);
      usedDecimals.add(key);
      if (selected.length === pairCount) break;
    }

    return selected.map((item) => {
      const pairId = `frac-dec-${item.n}-${item.d}`;
      return {
        pairId,
        cards: [
          {
            id: `${pairId}-fraction`,
            pairId,
            topic: 'fractionDecimal',
            kind: 'fraction',
            numerator: item.n,
            denominator: item.d,
            text: `${item.n}/${item.d}`,
            label: `${item.n} out of ${item.d}`,
            revealed: false,
            matched: false
          },
          {
            id: `${pairId}-decimal`,
            pairId,
            topic: 'fractionDecimal',
            kind: 'decimal',
            decimal: item.decimal,
            text: item.label,
            label: item.label,
            revealed: false,
            matched: false
          }
        ]
      };
    });
  }

  function buildDecimalPercentagePool(){
    const tens = [];
    const fives = [];
    for (let percent = 5; percent <= 100; percent += 5){
      if (percent % 10 === 0) tens.push(percent);
      else fives.push(percent);
    }
    return { tens, fives };
  }

  function createDecimalPercentagePairs(pairCount = 10){
    const { tens, fives } = buildDecimalPercentagePool();
    const tensCount = Math.min(tens.length, Math.round(pairCount * 0.7));
    const fivesCount = Math.min(fives.length, pairCount - tensCount);
    const selected = [
      ...shuffle(tens).slice(0, tensCount),
      ...shuffle(fives).slice(0, fivesCount)
    ];

    while (selected.length < pairCount){
      const remaining = shuffle([...tens, ...fives].filter(p => !selected.includes(p)));
      if (!remaining.length) break;
      selected.push(remaining[0]);
    }

    return shuffle(selected).map((percent) => {
      const decimal = percent / 100;
      const pairId = `dec-pct-${percent}`;
      return {
        pairId,
        cards: [
          {
            id: `${pairId}-decimal`,
            pairId,
            topic: 'decimalPercentage',
            kind: 'decimalPercent',
            decimal,
            text: formatDecimal(decimal),
            label: `Decimal ${formatDecimal(decimal)}`,
            revealed: false,
            matched: false
          },
          {
            id: `${pairId}-percentage`,
            pairId,
            topic: 'decimalPercentage',
            kind: 'percentage',
            percent,
            text: `${percent}%`,
            label: `${percent} percent`,
            revealed: false,
            matched: false
          }
        ]
      };
    });
  }

  window.MathMemoryFdpEngine = {
    createFractionDecimalPairs,
    createDecimalPercentagePairs,
    renderFraction,
    renderDecimal,
    renderPercentage,
    formatDecimal
  };
})();
