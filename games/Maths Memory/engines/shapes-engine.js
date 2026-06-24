// Math Memory shapes and names engine
// Classic-script version so index.html can be opened locally or hosted.
(() => {
  const SHAPES = [
    { key: 'square', name: 'Square' },
    { key: 'right-triangle', name: 'Right triangle' },
    { key: 'isosceles-triangle', name: 'Isosceles triangle' },
    { key: 'equilateral-triangle', name: 'Equilateral triangle' },
    { key: 'rectangle', name: 'Rectangle' },
    { key: 'kite', name: 'Kite' },
    { key: 'parallelogram', name: 'Parallelogram' },
    { key: 'rhombus', name: 'Rhombus' },
    { key: 'trapezium', name: 'Trapezium' },
    { key: 'pentagon', name: 'Pentagon' },
    { key: 'hexagon', name: 'Hexagon' }
  ];

  function shuffle(array){
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function escapeHtml(value){
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function fmt(n){
    return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
  }

  function linePath(x1, y1, x2, y2, cls = 'shape-side-tick'){
    return `<path class="${cls}" d="M${fmt(x1)} ${fmt(y1)} L${fmt(x2)} ${fmt(y2)}"></path>`;
  }

  function tickOnSegment(x1, y1, x2, y2, fraction = 0.5, length = 18, cls = 'shape-side-tick'){
    const cx = x1 + (x2 - x1) * fraction;
    const cy = y1 + (y2 - y1) * fraction;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segmentLength = Math.hypot(dx, dy) || 1;
    const nx = -dy / segmentLength;
    const ny = dx / segmentLength;
    const half = length / 2;
    return linePath(cx - nx * half, cy - ny * half, cx + nx * half, cy + ny * half, cls);
  }

  function doubleTickOnSegment(x1, y1, x2, y2, fraction = 0.5, length = 18, spacing = 7, cls = 'shape-side-tick'){
    const dx = x2 - x1;
    const dy = y2 - y1;
    const segmentLength = Math.hypot(dx, dy) || 1;
    const tx = dx / segmentLength;
    const ty = dy / segmentLength;
    const f1x1 = x1 + tx * spacing;
    const f1y1 = y1 + ty * spacing;
    const f1x2 = x2 + tx * spacing;
    const f1y2 = y2 + ty * spacing;
    const f2x1 = x1 - tx * spacing;
    const f2y1 = y1 - ty * spacing;
    const f2x2 = x2 - tx * spacing;
    const f2y2 = y2 - ty * spacing;
    return `
      ${tickOnSegment(f1x1, f1y1, f1x2, f1y2, fraction, length, cls)}
      ${tickOnSegment(f2x1, f2y1, f2x2, f2y2, fraction, length, cls)}
    `;
  }

  function shapePoints(key){
    switch (key){
      case 'square': return '52,26 128,26 128,102 52,102';
      case 'right-triangle': return '44,108 130,108 44,26';
      case 'isosceles-triangle': return '90,18 140,112 40,112';
      case 'equilateral-triangle': return '90,20 143,112 37,112';
      case 'rectangle': return '30,42 150,42 150,94 30,94';
      case 'kite': return '90,16 136,62 90,124 44,62';
      case 'parallelogram': return '56,40 150,40 124,98 30,98';
      // Deliberately not a square: long horizontal diagonal and shorter vertical diagonal.
      case 'rhombus': return '90,28 154,70 90,112 26,70';
      case 'trapezium': return '58,42 122,42 150,100 30,100';
      case 'pentagon': return '90,18 142,57 122,112 58,112 38,57';
      case 'hexagon': return '58,28 122,28 150,66 122,104 58,104 30,66';
      default: return '52,26 128,26 128,102 52,102';
    }
  }

  function polygon(key){
    return `<polygon class="shape-fill" points="${shapePoints(key)}"></polygon>`;
  }

  function rightAngleMarker(){
    return '<path class="shape-right-angle" d="M44 90 L62 90 L62 108"></path>';
  }

  function isoscelesMarks(){
    const top = { x:90, y:18 };
    const right = { x:140, y:112 };
    const left = { x:40, y:112 };
    return `
      ${tickOnSegment(top.x, top.y, left.x, left.y, 0.52, 19)}
      ${tickOnSegment(top.x, top.y, right.x, right.y, 0.52, 19)}
      <path class="shape-angle-fill" d="M40 112 L63 112 Q61 98 51 91 Z"></path>
      <path class="shape-angle-fill" d="M140 112 L129 91 Q119 98 117 112 Z"></path>
    `;
  }

  function equilateralMarks(){
    const top = { x:90, y:20 };
    const right = { x:143, y:112 };
    const left = { x:37, y:112 };
    return `
      ${tickOnSegment(top.x, top.y, left.x, left.y, 0.56, 20)}
      ${tickOnSegment(top.x, top.y, right.x, right.y, 0.56, 20)}
      ${tickOnSegment(left.x, left.y, right.x, right.y, 0.50, 20)}
      <path class="shape-angle-fill" d="M90 20 L78 41 Q90 49 102 41 Z"></path>
      <path class="shape-angle-fill" d="M37 112 L62 112 Q60 97 50 90 Z"></path>
      <path class="shape-angle-fill" d="M143 112 L130 90 Q120 97 118 112 Z"></path>
    `;
  }

  function kiteMarks(){
    const top = { x:90, y:16 };
    const right = { x:136, y:62 };
    const bottom = { x:90, y:124 };
    const left = { x:44, y:62 };
    return `
      ${tickOnSegment(top.x, top.y, left.x, left.y, 0.52, 18, 'shape-side-tick')}
      ${tickOnSegment(top.x, top.y, right.x, right.y, 0.52, 18, 'shape-side-tick')}
      ${doubleTickOnSegment(left.x, left.y, bottom.x, bottom.y, 0.42, 17, 5, 'shape-side-tick')}
      ${doubleTickOnSegment(right.x, right.y, bottom.x, bottom.y, 0.42, 17, 5, 'shape-side-tick')}
      <path class="shape-diagonal" d="M90 16 L90 124"></path>
    `;
  }

  function squareMarks(){
    return `
      ${tickOnSegment(52, 26, 128, 26, 0.52, 12, 'shape-side-tick subtle')}
      ${tickOnSegment(52, 102, 128, 102, 0.52, 12, 'shape-side-tick subtle')}
      ${tickOnSegment(52, 26, 52, 102, 0.52, 12, 'shape-side-tick subtle')}
      ${tickOnSegment(128, 26, 128, 102, 0.52, 12, 'shape-side-tick subtle')}
    `;
  }

  function rhombusMarks(){
    const top = { x:90, y:28 };
    const right = { x:154, y:70 };
    const bottom = { x:90, y:112 };
    const left = { x:26, y:70 };
    return `
      ${tickOnSegment(top.x, top.y, left.x, left.y, 0.52, 15, 'shape-side-tick subtle')}
      ${tickOnSegment(top.x, top.y, right.x, right.y, 0.52, 15, 'shape-side-tick subtle')}
      ${tickOnSegment(left.x, left.y, bottom.x, bottom.y, 0.48, 15, 'shape-side-tick subtle')}
      ${tickOnSegment(right.x, right.y, bottom.x, bottom.y, 0.48, 15, 'shape-side-tick subtle')}
    `;
  }

  function shapeExtras(key){
    switch (key){
      case 'right-triangle': return rightAngleMarker();
      case 'isosceles-triangle': return isoscelesMarks();
      case 'equilateral-triangle': return equilateralMarks();
      case 'kite': return kiteMarks();
      case 'square': return squareMarks();
      case 'rhombus': return rhombusMarks();
      default: return '';
    }
  }

  function renderShapeImage(shapeKey){
    const shape = SHAPES.find(item => item.key === shapeKey) || SHAPES[0];
    return `
      <span class="shape-display" aria-label="${escapeHtml(shape.name)}">
        <svg class="shape-svg shape-svg-${escapeHtml(shape.key)}" viewBox="0 0 180 140" role="img" aria-hidden="true" focusable="false">
          ${polygon(shape.key)}
          ${shapeExtras(shape.key)}
        </svg>
      </span>
    `;
  }

  function renderShapeName(name){
    const safe = escapeHtml(name);
    const compactClass = name.length >= 20 ? ' extra-long' : name.length >= 13 ? ' long' : '';
    return `<span class="shape-name-display${compactClass}" aria-label="${safe}">${safe}</span>`;
  }

  function createShapeNamePairs(pairCount = 10){
    return shuffle(SHAPES).slice(0, pairCount).map((shape) => {
      const pairId = `shape-${shape.key}`;
      return {
        pairId,
        cards: [
          {
            id: `${pairId}-image`,
            pairId,
            topic: 'shapesNames',
            kind: 'shapeImage',
            shapeKey: shape.key,
            shapeName: shape.name,
            text: shape.name,
            label: `${shape.name} image`,
            revealed: false,
            matched: false
          },
          {
            id: `${pairId}-name`,
            pairId,
            topic: 'shapesNames',
            kind: 'shapeName',
            shapeKey: shape.key,
            shapeName: shape.name,
            text: shape.name,
            label: shape.name,
            revealed: false,
            matched: false
          }
        ]
      };
    });
  }

  window.MathMemoryShapesEngine = {
    createShapeNamePairs,
    renderShapeImage,
    renderShapeName,
    shapes: SHAPES
  };
})();
