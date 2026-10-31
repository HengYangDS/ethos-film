/* The film's motif, the two lines of the opening: understanding above, the answers of code, data and use below, and the stations on them. */

import { ctx } from "../canvas.js";
import { blend } from "./colour.js";
import { dot, line, path, ring, stroke } from "./strokes.js";
import { diamond, person } from "./symbols.js";
import { P } from "../palette.js";
import { clamp, ease, mix } from "../timing/easing.js";

/* The two lines of the opening: our understanding above, in the colour of authority, and the answers that code, data
 * and real use send back below, in the colour of evidence. Both run from the left; while they agree they stay level,
 * and when they drift apart their right ends part, so the gap is where whoever picks up the work has to guess. */
export const TWO_LINES = { x0: 360, x1: 1560, y1: 400, y2: 600, split: 1280, part: 80 };
export function driftingLines(t, { alpha = 1, upto = 1, drift = 0, bump = 0 } = {}) {
  if (alpha < 0.01 || upto <= 0) return;
  const { x0, x1, y1, y2, split, part } = TWO_LINES,
    reach = mix(x0, x1, clamp(upto));
  // The upper line rises once where the understanding changes; past `split` the lines part by `drift`.
  const yUp = (x) =>
    y1 -
    (x > 700 && x < 820 ? 26 * bump * Math.sin((Math.PI * (x - 700)) / 120) : 0) -
    (x > split ? part * drift * ease((x - split) / (x1 - split)) : 0);
  const yLow = (x) => y2 + (x > split ? part * drift * ease((x - split) / (x1 - split)) : 0);
  const sample = (fn) => {
    const p = [];
    for (let x = x0; x <= reach; x += 8) p.push([x, fn(x)]);
    if (p.at(-1)[0] < reach) p.push([reach, fn(reach)]);
    return p;
  };
  path(sample(yUp), { color: P.authority, alpha, width: 4 });
  path(sample(yLow), { color: P.evidence, alpha, width: 4 });
  dot(reach, yUp(reach), 7, { color: P.authority, alpha });
  dot(reach, yLow(reach), 7, { color: P.evidence, alpha });
  return { yUp, yLow };
}
/* A station on the answers line: a ring with a small glyph, code as brackets, data as a grid and real use as a person. */
export function answerStation(x, y, kind, { alpha = 1, lit = 0, swap = 0 } = {}) {
  if (alpha < 0.01) return;
  const tone = blend(P.ink, P.evidence, lit);
  dot(x, y, 26, { color: P.ground, alpha });
  ring(x, y, 26, { color: tone, alpha, width: 2.5 + lit });
  if (kind === "code") {
    // A replaced tool: the old brackets give way to a new mark in the same ring.
    const old = alpha * (1 - clamp(swap)),
      fresh = alpha * clamp(swap);
    path(
      [
        [x - 6, y - 10],
        [x - 14, y],
        [x - 6, y + 10],
      ],
      { color: tone, alpha: old, width: 2.5 },
    );
    path(
      [
        [x + 6, y - 10],
        [x + 14, y],
        [x + 6, y + 10],
      ],
      { color: tone, alpha: old, width: 2.5 },
    );
    diamond(x, y, 10, { color: tone, alpha: fresh });
  }
  if (kind === "data")
    [-8, 0, 8].forEach((dy) =>
      line(x - 12, y + dy, x + 12, y + dy, { color: tone, alpha, width: 2.5 }),
    );
  if (kind === "use") person(x, y + 5, { alpha, color: tone, size: 0.55 });
}
/* The opening's two lines as they are first named: one stroke while they are simply the project's two lines, then a
 * line each, in its own colour, from the words that name the first of them. */
export function twoLines(
  upto,
  { alpha = 1, split = false, upColor = P.ink, lowColor = P.ink } = {},
) {
  if (alpha < 0.01 || upto <= 0) return;
  const { x0, x1, y1, y2 } = TWO_LINES,
    reach = mix(x0, x1, clamp(upto));
  if (split) {
    line(x0, y1, reach, y1, { color: upColor, alpha, width: 4 });
    line(x0, y2, reach, y2, { color: lowColor, alpha, width: 4 });
  } else
    stroke(
      () => {
        ctx.moveTo(x0, y1);
        ctx.lineTo(reach, y1);
        ctx.moveTo(x0, y2);
        ctx.lineTo(reach, y2);
      },
      { color: upColor, alpha, width: 4 },
    );
  dot(reach, y1, 7, { color: upColor, alpha });
  dot(reach, y2, 7, { color: lowColor, alpha });
}
