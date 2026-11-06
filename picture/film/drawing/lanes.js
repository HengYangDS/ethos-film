/* Work Lanes: a lane's track, a group of lanes drawn as one mark, and the check before writing that stands on a lane. */

import { ctx } from "../canvas.js";
import { FLOW_EVERY, flowAlong, link } from "./links.js";
import { box, fill, line, stroke } from "./strokes.js";
import { folderIcon } from "./workspace.js";
import { P } from "../palette.js";
import { clamp } from "../timing/easing.js";

/* A work lane: its folder, the worktree, at the start of a track, and points of work moving along it: `flow` is the
 * flow's clock (flowClock). */
export function laneTrack(
  x0,
  x1,
  y,
  { alpha = 1, color = P.line, flow = null, tone = P.evidence, upto = 1 } = {},
) {
  if (alpha < 0.01) return;
  folderIcon(x0, y - 26, 62, 52, { alpha, color: P.ink });
  link(x0 + 62, y, x1, y, { alpha, color, upto, width: 2.5, end: false });
  if (flow !== null)
    flowAlong(
      [
        [x0 + 70, y],
        [x1, y],
      ],
      flow,
      9,
      { color: tone, alpha },
    );
}
/* Several lanes of one group: their folders and tracks are drawn as one stroke each, so one name names them together,
 * and points of work move along each, the lanes' flows setting off in turn from the flow clock `q`. Two groups side by
 * side differ in `size`, so each reads as its own group. */
export function laneGroup(x0, x1, ys, { alpha = 1, q = 0, tones = [], size = 1 } = {}) {
  if (alpha < 0.01) return;
  const W = 62 * size,
    H = 52 * size,
    tab = Math.min(46, W * 0.4);
  const folders = () =>
    ys.forEach((y) => {
      const top = y - H / 2;
      ctx.moveTo(x0, top + 8);
      ctx.lineTo(x0, top + H);
      ctx.lineTo(x0 + W, top + H);
      ctx.lineTo(x0 + W, top + 14);
      ctx.lineTo(x0 + tab + 10, top + 14);
      ctx.lineTo(x0 + tab, top);
      ctx.lineTo(x0 + 8, top);
      ctx.closePath();
    });
  fill(folders, { color: P.row, alpha });
  stroke(folders, { color: P.ink, alpha, width: 2.5 });
  stroke(
    () =>
      ys.forEach((y) => {
        ctx.moveTo(x0 + W, y);
        ctx.lineTo(x1, y);
      }),
    { color: P.line, alpha, width: 2.5 },
  );
  ys.forEach((y, i) =>
    flowAlong(
      [
        [x0 + 70, y],
        [x1, y],
      ],
      q + i * 0.31 * FLOW_EVERY,
      9,
      { color: tones[i] ?? P.evidence, alpha },
    ),
  );
}
/* The gate before a write: two posts with a bar that lifts when the check passes. `open` is the share the bar has
 * lifted; callers drive it by the structural glide over the bar's way, h - 40 px (glideShare). */
export function writeGate(
  x,
  y,
  h,
  { alpha = 1, open = 0, color = P.authority, single = false } = {},
) {
  if (alpha < 0.01) return;
  const top = y - h / 2,
    bottom = y + h / 2,
    lift = clamp(open) * (h - 40);
  // `single` draws both posts as one stroke, so the gate reads as one mark and one name.
  if (single)
    stroke(
      () => {
        ctx.moveTo(x - 30, top);
        ctx.lineTo(x - 30, bottom);
        ctx.moveTo(x + 30, top);
        ctx.lineTo(x + 30, bottom);
      },
      { color, alpha, width: 3 },
    );
  else {
    line(x - 30, top, x - 30, bottom, { color, alpha, width: 3 });
    line(x + 30, top, x + 30, bottom, { color, alpha, width: 3 });
  }
  box(x - 30, bottom - 22 - lift, 60, 22, { fill: color, alpha, radius: 4 });
}
