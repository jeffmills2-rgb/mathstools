/* ===========================================================================
   The widget registry.

   TO ADD A WIDGET: write the module, import it here, add it to the array.
   Nothing else in the project needs to change — not the host, not the HTML,
   not the dock. That is the contract this file exists to keep.

   A widget module default-exports an object:

     type          unique string, also the key saved in the screen file
     name          the label under the dock icon
     blurb         tooltip — one short sentence
     icon          inline SVG string, 24x24 viewBox, fill="currentColor"
     css           optional CSS string, injected once
     defaultSize   { w, h } in px
     minSize       { w, h } in px
     singleton     true = only one allowed, dock button toggles it
     fullscreen    true = no frame, mounted over the whole board (drawing)
     bare          true = frame with no white card behind it
     initialState()          returns the saved settings object
     render(el, ctx)         paint into el; may return a cleanup function
     onResize(el, ctx)       optional, called while the widget is resized

   ctx gives the widget: .state, .setState(patch), .setTitle(s), .remove(),
   .resize(w,h) and .toast(msg). ANYTHING THE WIDGET WANTS TO SURVIVE A
   RELOAD MUST GO THROUGH ctx.setState.
   =========================================================================== */

import timer from './timer.js';
import traffic from './traffic-light.js';
import text from './text.js';
import randomiser from './randomiser.js';
import drawing from './drawing.js';
import launcher from './launcher.js';
import groups from './group-maker.js';
import starter from './starter.js';
import mathsRandom from './maths-random.js';

const ALL = [ timer, traffic, text, randomiser, groups, starter, mathsRandom, launcher, drawing ];

export const WIDGETS = Object.fromEntries(ALL.map(d => [d.type, d]));
export const WIDGET_ORDER = ALL.map(d => d.type);

/* One style tag for every widget, injected at import time. */
const css = ALL.map(d => d.css || '').filter(Boolean).join('\n');
if(css){
  const tag = document.createElement('style');
  tag.setAttribute('data-mmt', 'widgets');
  tag.textContent = css;
  document.head.appendChild(tag);
}

/* Helpers live in ./shared.js; re-exported here so a widget can import
   either path without creating a cycle back through this registry. */
export { fitUnit, chime, escapeHtml, shuffle } from './shared.js';
