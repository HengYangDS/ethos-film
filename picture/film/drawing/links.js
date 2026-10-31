/* Drawn relations: orthogonal links that end in a quiet point. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { ctx } from "../canvas.js";
import { dot, flowDot, stroke } from "./strokes.js";
import { P } from "../palette.js";
import { clamp } from "../timing/easing.js";

/* A drawn relation follows the grid: a straight run when its ends share a row or a column, otherwise an orthogonal
 * route whose corners are quarter turns of radius `r` (never a diagonal). It draws on from its source along its length
 * and ends in a quiet point rather than an arrowhead; `flow`, a phase in [0, 1) that callers advance in voice time,
 * moves one dot along it to show the way the relation runs, so it rests in the quiet between thoughts. Routes: "vhv" leaves vertically, crosses at `mid` and arrives vertically; "hvh" the reverse;
 * "vh" and "hv" turn once. */
export function rounded(corners, r) {
  const out = [corners[0]];
  for (let i = 1; i < corners.length - 1; i++) {
    const [ax, ay] = corners[i - 1],
      [bx, by] = corners[i],
      [cx2, cy2] = corners[i + 1];
    const d1 = Math.hypot(bx - ax, by - ay),
      d2 = Math.hypot(cx2 - bx, cy2 - by);
    if (d1 < 1e-6 || d2 < 1e-6) continue;
    const k = Math.min(r, d1 / 2, d2 / 2),
      p = [bx - ((bx - ax) / d1) * k, by - ((by - ay) / d1) * k],
      q = [bx + ((cx2 - bx) / d2) * k, by + ((cy2 - by) / d2) * k];
    for (let n = 0; n <= 6; n++) {
      const u = n / 6;
      out.push([
        (1 - u) ** 2 * p[0] + 2 * (1 - u) * u * bx + u * u * q[0],
        (1 - u) ** 2 * p[1] + 2 * (1 - u) * u * by + u * u * q[1],
      ]);
    }
  }
  out.push(corners.at(-1));
  return out;
}
/* The point at share q of a polyline's length, and the polyline up to it. */
export function along(points, q) {
  const lengths = points
      .slice(1)
      .map((pt, i) => Math.hypot(pt[0] - points[i][0], pt[1] - points[i][1])),
    total = lengths.reduce((a, b) => a + b, 0);
  let left = clamp(q) * total;
  const kept = [points[0]];
  for (let i = 0; i < lengths.length; i++) {
    if (left >= lengths[i]) {
      kept.push(points[i + 1]);
      left -= lengths[i];
      continue;
    }
    const f = lengths[i] ? left / lengths[i] : 0,
      a = points[i],
      b = points[i + 1];
    kept.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    break;
  }
  return { point: kept.at(-1), kept };
}
export function link(
  x1,
  y1,
  x2,
  y2,
  {
    route = null,
    mid = null,
    r = 14,
    color = P.line,
    alpha = 1,
    upto = 1,
    width = 2,
    dash = null,
    flow = null,
    end = true,
  } = {},
) {
  if (alpha < 0.01 || upto <= 0 || Math.hypot(x2 - x1, y2 - y1) < 1) return;
  const kind = route ?? (Math.abs(x1 - x2) < 0.5 || Math.abs(y1 - y2) < 0.5 ? "straight" : "vhv");
  const m = mid ?? (kind === "vhv" ? (y1 + y2) / 2 : (x1 + x2) / 2);
  const corners = {
    straight: [
      [x1, y1],
      [x2, y2],
    ],
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
  const points = rounded(corners, r),
    drawn = along(points, upto).kept;
  if (drawn.length > 1)
    stroke(() => drawn.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))), {
      color,
      alpha,
      width,
      dash,
    });
  if (end) dot(x2, y2, width + 2.5, { color, alpha: alpha * clamp((upto - 0.9) / 0.1) });
  if (flow !== null && flow < upto) {
    const [px, py] = along(points, flow).point;
    flowDot(px, py, width + 2, flow, { color, alpha });
  }
}
