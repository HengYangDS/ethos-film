/* The film's two running examples: the market-data pipeline and the stock-selection signal. */

import { ctx } from "../canvas.js";
import { blend } from "./colour.js";
import { link } from "./links.js";
import { box, dashed, dot, flowDot, line, path, ring, stroke } from "./strokes.js";
import { P } from "../palette.js";
import { clamp, mix } from "../timing/easing.js";

/* The film's two running examples. A pipeline: a feed, one run and the stored records. `flow` moves a point along it, and
 * `back` draws the way a rerun returns from the records to the feed. Returns where its parts stand. */
export function pipelineMark(
  x,
  y,
  w,
  { alpha = 1, flow = null, back = 0, lit = 0, color = P.ink, backColor = P.evidence } = {},
) {
  const k = w / 1200,
    feedX = x - w / 2 + 40 * k,
    storeX = x + w / 2 - 110 * k,
    r = 40 * k,
    runW = 300 * k,
    runH = 110 * k,
    storeW = 220 * k,
    storeH = 170 * k;
  const place = {
    feedX,
    runX: x,
    storeX,
    top: y - storeH / 2,
    bottom: y + storeH / 2,
    loop: y + storeH / 2 + 60 * k,
  };
  if (alpha < 0.01) return place;
  ring(feedX, y, r, { color, alpha, width: 2.5 });
  dot(feedX, y, r * 0.32, { color, alpha });
  box(x - runW / 2, y - runH / 2, runW, runH, {
    fill: P.row,
    stroke: color,
    alpha,
    radius: 10,
    width: 2.5,
  });
  stroke(
    () => {
      for (let i = -1; i <= 1; i++) {
        const cx = x + i * runW * 0.22,
          s = 16 * Math.max(k, 0.5);
        ctx.moveTo(cx - s / 2, y - s);
        ctx.lineTo(cx + s / 2, y);
        ctx.lineTo(cx - s / 2, y + s);
      }
    },
    { color, alpha, width: 2.5 },
  );
  box(storeX - storeW / 2, y - storeH / 2, storeW, storeH, {
    fill: P.row,
    stroke: blend(color, P.evidence, lit),
    alpha,
    radius: 8,
    width: 2.5 + lit,
  });
  stroke(
    () => {
      for (let i = 0; i < 4; i++) {
        const ry = y - storeH / 2 + (storeH * (i + 1)) / 5;
        ctx.moveTo(storeX - storeW * 0.36, ry);
        ctx.lineTo(storeX + storeW * 0.36, ry);
      }
    },
    { color: P.muted, alpha, width: 2 },
  );
  line(feedX + r, y, x - runW / 2, y, { alpha });
  line(x + runW / 2, y, storeX - storeW / 2, y, { alpha });
  if (back > 0)
    link(storeX, y + storeH / 2, feedX, y + r, {
      route: "vhv",
      mid: place.loop,
      color: backColor,
      alpha,
      upto: back,
    });
  if (flow !== null) {
    const q = flow,
      px = mix(feedX + r, storeX - storeW / 2, q);
    flowDot(px, y, 8 * Math.max(k, 0.6), q, { color: P.evidence, alpha });
  }
  return place;
}
/* A signal study: the backtest's curve over a time axis, with the moment of decision at share `at` of it. Information
 * before that moment stands in the colour of evidence; information after it could not have been known, so it stands in
 * the colour of the unknown. `seen` is the share of those points shown. */
const SIGNAL_CURVE = [0.3, 0.46, 0.38, 0.58, 0.5, 0.66, 0.56, 0.74, 0.62, 0.82, 0.7, 0.92];
export function signalMark(
  x,
  y,
  w,
  h,
  { alpha = 1, at = 0.62, seen = 0, marker = 1, color = P.ink } = {},
) {
  const x0 = x - w / 2,
    x1 = x + w / 2,
    bottom = y + h / 2,
    top = y - h / 2;
  const point = (i) => [
    mix(x0, x1, i / (SIGNAL_CURVE.length - 1)),
    mix(bottom, top, SIGNAL_CURVE[i]),
  ];
  const place = { x0, x1, top, bottom, markerX: mix(x0, x1, at), point };
  if (alpha < 0.01) return place;
  line(x0, bottom, x1, bottom, { color: P.line, alpha });
  path(
    SIGNAL_CURVE.map((_, i) => point(i)),
    { color, alpha, width: 3 },
  );
  const n = Math.round(SIGNAL_CURVE.length * clamp(seen));
  SIGNAL_CURVE.forEach((_, i) => {
    if (i >= n) return;
    const [px, py] = point(i),
      late = px > place.markerX;
    dot(px, py, 8, { color: late ? P.unknown : P.evidence, alpha });
  });
  if (marker > 0.01)
    dashed(place.markerX, top - 16, place.markerX, bottom, {
      color: P.authority,
      alpha: alpha * marker,
      width: 2.5,
    });
  return place;
}
