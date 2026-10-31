/* Git history: commits along a branch and the references that name them. */

import { ctx } from "../canvas.js";
import { box, fill, line, stroke, text } from "./strokes.js";
import { commitDot } from "./workspace.js";
import { P } from "../palette.js";

/* A Git reference: a tag-shaped name on a pole above the commit it points at. */
export function refMark(
  x,
  y,
  name,
  { alpha = 1, color = P.authority, width = 110, h = 40, drop = 60 } = {},
) {
  if (alpha < 0.01) return;
  line(x, y - drop, x, y - 12, { color, alpha, width: 2.5 });
  box(x - width / 2, y - drop - h, width, h, {
    fill: P.row,
    stroke: color,
    alpha,
    radius: 8,
    width: 2.5,
  });
  text(name, x, y - drop - h / 2 + 1, 24, { role: "mark", align: "center", color, alpha });
}
/* A row of commits on a branch: the line and its points. `single` draws the points as one mark, their discs one fill
 * and their rims one stroke, so a row reads as one branch rather than a list of points that each wait for a name. */
export function commitRow(x0, step, y, n, { alpha = 1, color = P.ink, single = false } = {}) {
  if (alpha < 0.01) return;
  line(x0, y, x0 + step * (n - 1), y, { color, alpha, width: 2.5 });
  if (!single) {
    for (let i = 0; i < n; i++) commitDot(x0 + step * i, y, { alpha, color });
    return;
  }
  const discs = () => {
    for (let i = 0; i < n; i++) {
      ctx.moveTo(x0 + step * i + 9, y);
      ctx.arc(x0 + step * i, y, 9, 0, Math.PI * 2);
    }
  };
  fill(discs, { color: P.ground, alpha });
  stroke(discs, { color, alpha, width: 3 });
}
