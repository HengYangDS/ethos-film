/* Drawn relations: orthogonal links that end in a quiet point, and the flows that run along them. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { ctx } from "../canvas.js";
import { along, dot, drawnShare, lengthOf, stroke } from "./strokes.js";
import { P } from "../palette.js";
import { clamp, ease } from "../timing/easing.js";
import { voiceTime } from "../timing/pauses.js";

export { along };

/* A drawn relation follows the grid: a straight run when its ends share a row or a column, otherwise an orthogonal
 * route whose corners are quarter turns of radius `r` (never a diagonal). It draws on from its source along its
 * length and ends in a quiet point rather than an arrowhead; `draw` ({t, at, least, lead}) draws it on from `at`
 * over `upto` of its length at the film's tip pace by its own length (drawnShare), so no tip races. `flow`, a flow's
 * clock (flowClock), runs the flow's dots along it to show the way the relation runs (flowAlong), `flowSince` starts
 * that flow later and `flowEvery` fixes its period, which a relation whose ends glide must do, so its dots keep
 * their places as its length changes. Routes: "vhv" leaves vertically, crosses at `mid` and arrives vertically;
 * "hvh" the reverse; "vh" and "hv" turn once. */
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
/* How far the polyline `way` runs from its start over `others`, polylines that leave from the same point: its length up
 * to where it leaves the one it follows furthest, so a link that sets off along the ink of earlier ones draws on from
 * where it leaves them. */
export function sharedRun(way, others) {
  const total = lengthOf(way),
    near = ([x, y], other) =>
      other.slice(1).some(([bx, by], k) => {
        const [ax, ay] = other[k],
          dx = bx - ax,
          dy = by - ay,
          d2 = dx * dx + dy * dy,
          u = d2 ? clamp(((x - ax) * dx + (y - ay) * dy) / d2) : 0;
        return Math.hypot(x - ax - u * dx, y - ay - u * dy) < 0.5;
      });
  let run = 0;
  for (const other of others) {
    if (total <= 0 || !near(way[0], other)) continue;
    if (near(along(way, 1).point, other)) return total;
    let on = 0,
      off = total;
    for (let k = 0; k < 16; k++) {
      const middle = (on + off) / 2;
      if (near(along(way, middle / total).point, other)) on = middle;
      else off = middle;
    }
    run = Math.max(run, on);
  }
  return run;
}
/* A flow shows the way a relation runs: dots that cross the path at FLOW_PACE px/s, whatever its length, so every flow
 * in the film moves at one calm, even pace, and rest with the voice in the quiet between thoughts. On a path that takes
 * up to FLOW_EVERY seconds to cross, the next dot sets off as the last one leaves, so the flow never stands empty; a
 * longer path carries a dot every FLOW_EVERY seconds, more than one at a time, and a very short one a dot every
 * FLOW_SOONEST seconds, so it never pulses. Each dot enters at the start and leaves at the end by its size, over
 * FLOW_EDGE seconds; a dot under half a pixel is not drawn. A dot stands at its distance along the path, so a path that
 * grows or shrinks never moves the dots already on it. */
export const FLOW_PACE = 180,
  FLOW_EVERY = 2.2,
  FLOW_SOONEST = 1,
  FLOW_EDGE = 0.25;
/* A flow's clock at t: voice time, shifted by `stagger` shares of FLOW_EVERY so that flows side by side set off in
 * turn. */
export const flowClock = (t, stagger = 0) => voiceTime(t) + stagger * FLOW_EVERY;
/* The dots of a flow along the polyline `points` at the flow clock `clock`, `r` px when whole. A relation still
 * drawing on (`upto` under 1) holds its flow: its dots grow in where they stand over the last tenth of the drawing, so
 * none appears whole part way along. `since`, a flow clock, starts a flow later: only the dots that set off from then
 * on are drawn, so a flow that begins enters from its start. `every` sets the seconds between dots, a constant, so a
 * path whose length changes never moves its dots; by default it follows the path's own length as above, which suits a
 * path of fixed length or one that only draws on (its dots stay put while it grows, since a path that has not finished
 * drawing holds its flow). A `single` flow carries one dot at a time, however long its path. `clear` lists places, as
 * [x, y, r, presence], that a dot leaves by its size as it nears them and enters again past them, so it never crosses a
 * mark standing on its path; a place that is arriving clears its way over the first 0.3 of its presence, before it
 * is firm. */
export function flowAlong(
  points,
  clock,
  r,
  {
    upto = 1,
    since = -Infinity,
    every = null,
    single = false,
    clear = [],
    color = P.line,
    alpha = 1,
  } = {},
) {
  if (clock === null || alpha < 0.01 || upto <= 0.9 || points.length < 2) return;
  let total = 0;
  for (let i = 1; i < points.length; i++)
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  const travel = total / FLOW_PACE,
    period = single
      ? Math.max(every ?? FLOW_EVERY, travel)
      : (every ?? Math.min(FLOW_EVERY, Math.max(FLOW_SOONEST, travel))),
    edge = Math.min(FLOW_EDGE, travel / 2),
    grown = ease((upto - 0.9) / 0.1);
  for (let time = ((clock % period) + period) % period; time < travel; time += period) {
    if (clock - time < since) continue;
    const [x, y] = along(points, time / travel).point;
    const size =
      grown *
      ease(time / edge) *
      ease((travel - time) / edge) *
      clear.reduce(
        (k, [cx, cy, cr, presence = 1]) =>
          k *
          (1 -
            ease(presence / 0.3) *
              (1 - ease((Math.hypot(x - cx, y - cy) - cr) / (FLOW_PACE * edge)))),
        1,
      );
    if (r * size < 0.5) continue;
    dot(x, y, r * size, { color, alpha });
  }
}
/* The way a link from (x1, y1) to (x2, y2) takes on the screen, as the polyline it draws, so a mark that lands with a
 * link, or a share drawn of it, can be paced by its length. */
export function linkPoints(x1, y1, x2, y2, { route = null, mid = null, r = 14 } = {}) {
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
  return rounded(corners, r);
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
    draw = null,
    width = 2,
    dash = null,
    flow = null,
    flowSince = -Infinity,
    flowEvery = null,
    end = true,
  } = {},
) {
  if (alpha < 0.01 || upto <= 0 || Math.hypot(x2 - x1, y2 - y1) < 1) return;
  const points = linkPoints(x1, y1, x2, y2, { route, mid, r });
  if (draw) upto = drawnShare(draw, lengthOf(points), clamp(upto));
  if (upto <= 0) return;
  const drawn = along(points, upto).kept;
  if (drawn.length > 1)
    stroke(() => drawn.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))), {
      color,
      alpha,
      width,
      dash,
    });
  // The quiet end point lands as the relation arrives: it grows to its size over the last tenth of the drawing.
  const point = (width + 2.5) * ease((upto - 0.9) / 0.1);
  if (end && point > 0.3) dot(x2, y2, point, { color, alpha });
  if (flow !== null)
    flowAlong(points, flow, width + 2, { upto, since: flowSince, every: flowEvery, color, alpha });
}
