// Math Memory clock engine
// Classic-script version so index.html can be opened locally or hosted.
(() => {

const QUARTER_MINUTES = [0, 15, 30, 45];

function shuffle(array){
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function polarPoint(cx, cy, radius, degrees){
  const radians = (degrees - 90) * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function formatDigitalTime(hour, minute){
  const h = Number(hour) === 0 ? 12 : Number(hour);
  const m = String(Number(minute)).padStart(2, '0');
  return `${h}:${m}`;
}

function getClockTimeLabel(hour, minute){
  return formatDigitalTime(hour, minute);
}

function createClockPairs(pairCount = 10){
  const pool = [];
  for (let hour = 1; hour <= 12; hour++){
    for (const minute of QUARTER_MINUTES){
      pool.push({ hour, minute, time: formatDigitalTime(hour, minute) });
    }
  }

  return shuffle(pool).slice(0, pairCount).map(({ hour, minute, time }) => {
    const pairId = `clock-${hour}-${minute}`;
    return {
      pairId,
      hour,
      minute,
      cards: [
        {
          id: `${pairId}-analogue`,
          pairId,
          topic: 'clockDigital',
          kind: 'analogueClock',
          text: time,
          hour,
          minute,
          revealed: false,
          matched: false
        },
        {
          id: `${pairId}-digital`,
          pairId,
          topic: 'clockDigital',
          kind: 'digitalClock',
          text: time,
          hour,
          minute,
          revealed: false,
          matched: false
        }
      ]
    };
  });
}

function renderAnalogueClock(hour, minute){
  const cx = 50;
  const cy = 50;
  const h = Number(hour) % 12;
  const m = Number(minute);
  const minuteAngle = m * 6;
  const hourAngle = h * 30 + m * 0.5;
  const minuteEnd = polarPoint(cx, cy, 34, minuteAngle);
  const hourEnd = polarPoint(cx, cy, 24, hourAngle);

  const ticks = Array.from({ length: 12 }, (_, index) => {
    const value = index + 1;
    const angle = value * 30;
    const outer = polarPoint(cx, cy, 43, angle);
    const inner = polarPoint(cx, cy, value % 3 === 0 ? 37 : 39, angle);
    const label = polarPoint(cx, cy, 31, angle);
    const number = value === 12 ? 12 : value;
    return `
      <line x1="${outer.x.toFixed(2)}" y1="${outer.y.toFixed(2)}" x2="${inner.x.toFixed(2)}" y2="${inner.y.toFixed(2)}" class="clock-tick${value % 3 === 0 ? ' major' : ''}" />
      <text x="${label.x.toFixed(2)}" y="${(label.y + 3.2).toFixed(2)}" class="clock-number">${number}</text>
    `;
  }).join('');

  return `
    <svg class="analogue-clock-svg" viewBox="0 0 100 100" role="img" aria-label="Analogue clock showing ${formatDigitalTime(hour, minute)}">
      <circle cx="50" cy="50" r="46" class="clock-rim" />
      <circle cx="50" cy="50" r="41" class="clock-face" />
      ${ticks}
      <line x1="50" y1="50" x2="${hourEnd.x.toFixed(2)}" y2="${hourEnd.y.toFixed(2)}" class="clock-hand hour-hand" />
      <line x1="50" y1="50" x2="${minuteEnd.x.toFixed(2)}" y2="${minuteEnd.y.toFixed(2)}" class="clock-hand minute-hand" />
      <circle cx="50" cy="50" r="3.3" class="clock-centre" />
    </svg>
  `;
}

function renderDigitalClock(hour, minute){
  return `<span class="digital-clock-display" aria-label="Digital time ${formatDigitalTime(hour, minute)}">${formatDigitalTime(hour, minute)}</span>`;
}

  window.MathMemoryClockEngine = {
    formatDigitalTime,
    getClockTimeLabel,
    createClockPairs,
    renderAnalogueClock,
    renderDigitalClock
  };
})();
