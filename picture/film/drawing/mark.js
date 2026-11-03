/* The ETHOS mark, drawn by parts from the brand kit's master (assets/brand/ethos-logo.svg in ETHOS, a 512 grid): an
 * aperture boundary centred on the origin and open to the right, two passages that leave the origin for the opening,
 * and the cinnabar datum at the origin with its ink hole. The film builds it rule by rule, so each part takes its own
 * share in [0, 1]: a stroke draws on from its start, and the datum and its hole fade in. */

import { ctx } from "../canvas.js";
import { dot, stroke } from "./strokes.js";
import { P } from "../palette.js";
import { clamp } from "../timing/easing.js";

/* The master's geometry, relative to the origin at (274, 256). */
const ORIGIN = [274, 256];
const BOUNDARY = { r: 164, from: [399.6, 150.6], to: [399.6, 361.4], width: 25 };
const PASSAGES = [
  [[274, 256], [307, 243], [341, 216], [377, 178]],
  [[274, 256], [311, 272], [350, 307], [389, 343]],
];
const PASSAGE_WIDTH = 17, DATUM = 14, HOLE = 4.75;

const bezier = ([a, b, c, d], u) => {
  const v = 1 - u;
  return [0, 1].map((k) => v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]);
};

/* The mark with its origin at (x, y), `size` the master's 512 units in pixels. `datum`, `hole`, `passages` and
 * `boundary` are each part's share; `alpha` fades the whole mark. */
export function ethosMark(x, y, size, { datum = 1, hole = 1, passages = 1, boundary = 1, alpha = 1 } = {}) {
  const k = size / 512, at = ([px, py]) => [x + (px - ORIGIN[0]) * k, y + (py - ORIGIN[1]) * k];
  if (boundary > 0) {
    // The arc runs from the opening's upper end round the left side to its lower end.
    const a0 = Math.atan2(BOUNDARY.from[1] - ORIGIN[1], BOUNDARY.from[0] - ORIGIN[0]);
    const a1 = Math.atan2(BOUNDARY.to[1] - ORIGIN[1], BOUNDARY.to[0] - ORIGIN[0]) - 2 * Math.PI;
    const end = a0 + (a1 - a0) * clamp(boundary);
    stroke(() => ctx.arc(x, y, BOUNDARY.r * k, a0, end, true), { color: P.ink, alpha, width: BOUNDARY.width * k });
  }
  if (passages > 0)
    for (const curve of PASSAGES)
      stroke(() => {
        const share = clamp(passages), steps = 24;
        ctx.moveTo(...at(curve[0]));
        for (let i = 1; i <= steps; i++) ctx.lineTo(...at(bezier(curve, (i / steps) * share)));
      }, { color: P.ink, alpha, width: PASSAGE_WIDTH * k });
  if (datum > 0) dot(x, y, DATUM * k, { color: P.accent, alpha: alpha * clamp(datum) });
  if (hole > 0 && datum > 0) dot(x, y, HOLE * k, { color: P.ground, alpha: alpha * clamp(datum) * clamp(hole) });
}

/* Where a part of the mark at (x, y) and `size` stands, for placing its names: the upper and lower passage ends, the
 * boundary's leftmost point and the datum. */
export function markPoints(x, y, size) {
  const k = size / 512, at = ([px, py]) => [x + (px - ORIGIN[0]) * k, y + (py - ORIGIN[1]) * k];
  return { datum: [x, y], upper: at(PASSAGES[0][3]), lower: at(PASSAGES[1][3]), left: [x - BOUNDARY.r * k, y], radius: BOUNDARY.r * k };
}
