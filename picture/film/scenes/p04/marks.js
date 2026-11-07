/* Marks shared by parts 04-06: an outlined card that holds words or records, rows of records drawn as one mark, and
 * the three verdict shapes. Panels are outlines, never fills, and every mark here is paper or line on the ink field. */

import { ctx } from "../../canvas.js";
import { FLOW_EVERY, along, flowAlong, rounded } from "../../drawing/links.js";
import { box, drawnShare, lengthOf, ring, stroke, text } from "../../drawing/strokes.js";
import { check, stopSign } from "../../drawing/symbols.js";
import { P } from "../../palette.js";
import { clamp, ease } from "../../timing/easing.js";

/* A card: a rounded outline that holds a text or a few records. */
export function card(x, y, w, h, { alpha = 1, color = P.line, dash = null, width = 2.5 } = {}) {
  box(x, y, w, h, { stroke: color, alpha, radius: 12, width, dash });
}

/* Records as rows of three cells (a code, a date, a value), drawn as one stroke so a table reads as one mark rather
 * than a list of rows that each wait for a name. `rows` are the row indices to draw, `step` px apart from `y`. */
const CELLS = [0.2, 0.34, 0.22];
export function recordRows(
  x,
  y,
  w,
  rows,
  { step = 36, alpha = 1, color = P.muted, width = 3 } = {},
) {
  if (!rows.length) return;
  stroke(
    () => {
      for (const r of rows) {
        let cx = x;
        for (const share of CELLS) {
          ctx.moveTo(cx, y + r * step);
          ctx.lineTo(cx + w * share, y + r * step);
          cx += w * share + w * 0.08;
        }
      }
    },
    { color, alpha, width },
  );
}
/* Where a record row's value cell sits, for marks drawn on it. */
export const valueCell = (x, w) => [x + w * 0.7, x + w * 0.92];

/* Several Agents drawn as one mark (their diamonds one stroke, their cores one fill), so a group named once does not
 * read as members that each wait for a name. */
export function agents(points, { alpha = 1, size = 1, color = P.ink } = {}) {
  if (alpha < 0.01 || !points.length) return;
  const r = 22 * size;
  stroke(
    () =>
      points.forEach(([x, y]) => {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
      }),
    { color, alpha, width: 2.5 },
  );
  // The cores are small discs drawn as one stroke, so their paint stays where they are rather than spanning the gap.
  stroke(
    () =>
      points.forEach(([x, y]) => {
        ctx.moveTo(x + 2.25 * size, y);
        ctx.arc(x, y, 2.25 * size, 0, Math.PI * 2);
      }),
    { color, alpha, width: 4.5 * size },
  );
}

/* Several relations drawn as one mark: their orthogonal routes one stroke and their quiet end points one stroke of
 * small discs, so links that leave one source together are named once rather than waiting as members. Each route is
 * [x1, y1, x2, y2, kind, mid] as `link` takes them; `flow`, a flow's clock (flowClock), runs a flow along each, the
 * routes' flows setting off in turn. With `draw` ({t, at}) the routes draw on together from `at` at the film's tip
 * pace by the longest route's length (drawnShare), so no tip races. */
export function linkSet(
  routes,
  { alpha = 1, upto = 1, draw = null, color = P.line, width = 2, flow = null, end = true } = {},
) {
  if (alpha < 0.01 || upto <= 0) return;
  const paths = routes.map(([x1, y1, x2, y2, kind, mid]) => {
    const m = mid ?? (kind === "vhv" ? (y1 + y2) / 2 : (x1 + x2) / 2);
    const corners = {
      vhv: [
        [x1, y1],
        [x1, m],
        [x2, m],
        [x2, y2],
      ],
      hvh: [
        [x1, y1],
        [m, y1],
        [m, y2],
        [x2, y2],
      ],
      vh: [
        [x1, y1],
        [x1, y2],
        [x2, y2],
      ],
      hv: [
        [x1, y1],
        [x2, y1],
        [x2, y2],
      ],
    }[kind];
    return rounded(corners, 14);
  });
  if (draw) upto = drawnShare(draw, Math.max(...paths.map(lengthOf)), clamp(upto));
  if (upto <= 0) return;
  stroke(
    () =>
      paths.forEach((points) =>
        along(points, upto).kept.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))),
      ),
    { color, alpha, width },
  );
  // The end points land as the routes arrive: they grow to their size and ink over the last tenth of the drawing.
  const ends = end ? ease((upto - 0.9) / 0.1) : 0;
  if (ends > 0.07)
    stroke(
      () =>
        paths.forEach((points) => {
          const [x, y] = points.at(-1);
          ctx.moveTo(x + 2.25 * ends, y);
          ctx.arc(x, y, 2.25 * ends, 0, Math.PI * 2);
        }),
      { color, alpha: alpha * ends, width: 4.5 * ends },
    );
  if (flow !== null)
    paths.forEach((points, k) =>
      flowAlong(points, flow + (k / paths.length) * FLOW_EVERY, width + 2, { upto, color, alpha }),
    );
}

/* The three verdicts as shapes, each beside its name: pass a check, block a stop bar, unknown a question mark in a
 * ring. `kind` is "pass", "block" or "unknown"; `r` is the shape's radius. */
export function verdictMark(kind, x, y, r = 22, { alpha = 1, color = P.ink } = {}) {
  if (alpha < 0.01) return;
  if (kind === "pass") check(x, y + r * 0.08, r * 1.4, { color, alpha, width: 4 });
  else if (kind === "block") stopSign(x, y, r, { color, alpha });
  else {
    ring(x, y, r, { color, alpha, width: 3 });
    text("?", x, y + 1, r * 1.25, { role: "mark", align: "center", color, alpha });
  }
}
