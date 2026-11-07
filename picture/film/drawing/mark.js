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
export function ethosMark(
  x,
  y,
  size,
  { datum = 1, hole = 1, passages = 1, boundary = 1, alpha = 1, start = "upper" } = {},
) {
  const k = size / 512, at = ([px, py]) => [x + (px - ORIGIN[0]) * k, y + (py - ORIGIN[1]) * k];
  if (boundary > 0) {
    // The arc runs from the opening's upper end round the left side to its lower end, or, with `start` "lower", from
    // the lower end round the bottom first, so a boundary drawing on reaches the name under the mark with its first
    // stretch rather than its last.
    const upper = Math.atan2(BOUNDARY.from[1] - ORIGIN[1], BOUNDARY.from[0] - ORIGIN[0]),
      lower = Math.atan2(BOUNDARY.to[1] - ORIGIN[1], BOUNDARY.to[0] - ORIGIN[0]),
      [a0, a1, back] = start === "lower" ? [lower, upper + 2 * Math.PI, false] : [upper, lower - 2 * Math.PI, true],
      end = a0 + (a1 - a0) * clamp(boundary);
    stroke(() => ctx.arc(x, y, BOUNDARY.r * k, a0, end, back), { color: P.ink, alpha, width: BOUNDARY.width * k });
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

/* The on-screen lengths of the mark's strokes at `size`: the boundary's arc and the longer passage, so a part that
 * draws on can take its share at the film's tip pace by its own length (drawnShare). */
export function markLengths(size) {
  const k = size / 512,
    a0 = Math.atan2(BOUNDARY.from[1] - ORIGIN[1], BOUNDARY.from[0] - ORIGIN[0]),
    a1 = Math.atan2(BOUNDARY.to[1] - ORIGIN[1], BOUNDARY.to[0] - ORIGIN[0]) - 2 * Math.PI,
    passage = Math.max(
      ...PASSAGES.map((curve) => {
        let length = 0;
        for (let i = 1; i <= 24; i++) {
          const [p, q] = [bezier(curve, (i - 1) / 24), bezier(curve, i / 24)];
          length += Math.hypot(q[0] - p[0], q[1] - p[1]);
        }
        return length;
      }),
    );
  return { boundary: BOUNDARY.r * Math.abs(a1 - a0) * k, passage: passage * k };
}

/* The ink extent of the mark's parts at `size`, relative to its origin: `left` and `top` are negative. A part counts
 * when its share is above zero, as drawn finished, so a heading laid out from it keeps its place while the part draws
 * on. Each stroke counts half its width beyond its path. */
export function markExtent(size, { datum = 1, passages = 1, boundary = 1 } = {}) {
  const k = size / 512, xs = [], ys = [];
  const add = ([px, py], pad) => {
    xs.push(px - ORIGIN[0] - pad, px - ORIGIN[0] + pad);
    ys.push(py - ORIGIN[1] - pad, py - ORIGIN[1] + pad);
  };
  if (datum > 0) add(ORIGIN, DATUM);
  if (passages > 0) for (const curve of PASSAGES) for (let i = 0; i <= 24; i++) add(bezier(curve, i / 24), PASSAGE_WIDTH / 2);
  if (boundary > 0) {
    const a0 = Math.atan2(BOUNDARY.from[1] - ORIGIN[1], BOUNDARY.from[0] - ORIGIN[0]);
    const a1 = Math.atan2(BOUNDARY.to[1] - ORIGIN[1], BOUNDARY.to[0] - ORIGIN[0]) - 2 * Math.PI;
    for (let i = 0; i <= 72; i++) {
      const a = a0 + ((a1 - a0) * i) / 72;
      add([ORIGIN[0] + BOUNDARY.r * Math.cos(a), ORIGIN[1] + BOUNDARY.r * Math.sin(a)], BOUNDARY.width / 2);
    }
  }
  if (!xs.length) return { left: 0, right: 0, top: 0, bottom: 0 };
  return { left: Math.min(...xs) * k, right: Math.max(...xs) * k, top: Math.min(...ys) * k, bottom: Math.max(...ys) * k };
}

/* Where a part of the mark at (x, y) and `size` stands, for placing its names: the upper and lower passage ends, the
 * boundary's leftmost point and the datum. */
export function markPoints(x, y, size) {
  const k = size / 512, at = ([px, py]) => [x + (px - ORIGIN[0]) * k, y + (py - ORIGIN[1]) * k];
  return { datum: [x, y], upper: at(PASSAGES[0][3]), lower: at(PASSAGES[1][3]), left: [x - BOUNDARY.r * k, y], radius: BOUNDARY.r * k };
}
