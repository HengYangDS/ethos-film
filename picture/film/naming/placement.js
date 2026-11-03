/* Placement rules: rails, columns and rings that set each name at one gap from its mark. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { measure } from "../drawing/strokes.js";
import { NAME_GAP, nameText, wrapName } from "./names.js";
import { LABEL, P } from "../palette.js";

/* The centre line of the content area, between the chapter label and the caption band; a composed stage balances its
 * groups about it. */
export const CONTENT_CY = 500;
/* The top from which the names of a row of marks hang: one gap below the lowest bottom among the row's marks, so every
 * name of the row stands on one baseline however tall its own mark is. */
export const rowNameTop = (bottoms, gap = NAME_GAP) => Math.max(...bottoms) + gap;
/* Names along a rail: all on one side, on one baseline, each centred on its station; a name wider than its share of
 * the rail wraps onto a second line instead of stepping off the baseline. */
export function railNames(
  names,
  xs,
  y,
  {
    side = 1,
    gap = NAME_GAP + 18,
    size = LABEL,
    alpha = () => 1,
    color = () => P.ink,
    wrap = RAIL_WRAP,
    set = `rail:${names[0]}`,
  } = {},
) {
  // Each name may use the rail up to its neighbours' share, less a gap, and wraps no wider than the rail's wrap width.
  const room = (i) =>
    Math.min(i ? xs[i] - xs[i - 1] : Infinity, i + 1 < xs.length ? xs[i + 1] - xs[i] : Infinity) -
    30;
  names.forEach((v, i) => {
    const width = Math.min(wrap, room(i));
    nameText(v, xs[i], y + side * gap, {
      width,
      size,
      valign: side > 0 ? "top" : "bottom",
      align: "center",
      alpha: alpha(i),
      color: color(i),
      set,
    });
  });
}
/* Stations along a rail: evenly pitched from the first to the last, as long as every pair of neighbours keeps half of
 * each name's width plus a gap between them; otherwise each pair stands that far apart and the room left over is
 * shared evenly, so a long name widens its own interval rather than leaving the baseline. A name wider than the wrap
 * width is measured as wrapped, as railNames sets it. */
const RAIL_WRAP = 240;
export function railStations(
  names,
  first,
  last,
  { size = LABEL, gap = 34, wrap = RAIL_WRAP } = {},
) {
  const widths = names.map((v) =>
    Math.max(...wrapName(v, wrap, size).map((line) => measure(line, size))),
  );
  const need = widths.slice(1).map((w, i) => (widths[i] + w) / 2 + gap),
    pitch = names.length > 1 ? (last - first) / (names.length - 1) : 0;
  if (need.every((d) => d <= pitch)) return names.map((_, i) => first + i * pitch);
  const slack =
    Math.max(0, last - first - need.reduce((a, b) => a + b, 0)) / Math.max(1, need.length);
  return need.reduce((xs, d) => [...xs, xs.at(-1) + d + slack], [first]);
}
/* A name around a ring, set `gap` outside it along its angle: names on the right begin at their mark, names on the
 * left end at it, and names at the top and bottom centre on it. */
export function radialName(v, cx, cy, r, a, { gap = NAME_GAP, ry = r, width = 260, ...o } = {}) {
  const c = Math.cos(a),
    sn = Math.sin(a),
    x = cx + c * (r + gap),
    y = cy + sn * (ry + gap);
  const align = c > 0.3 ? "left" : c < -0.3 ? "right" : "center",
    valign = align === "center" ? (sn > 0 ? "top" : "bottom") : "middle";
  return nameText(v, x, y, { align, valign, width, ...o });
}
