/* The scene camera: one slow move per scene, advancing in voice time. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { ctx } from "../canvas.js";
import { scenes } from "../scenes/registry.js";
import { film } from "../timeline.js";
import { clamp, ease, mix } from "../timing/easing.js";
import { voiceTime } from "../timing/pauses.js";

/* Film-level framing: a flat ground with no radial darkening or glow. Each scene has one slow camera move chosen
 * for its content: a push toward the object it argues with, a pull back that reveals a structure as it is built,
 * a drift along a track or timeline, or stillness for a dense comparison. The move advances in voice time, so it
 * rests in the quiet between thoughts. */
const CAMERA = {
  push: ["01", "04", "07", "09", "13", "15", "18"],
  reveal: ["03", "06", "08", "11", "14", "16"],
  drift: ["02", "05", "10", "12", "17"],
};
/* A scene's camera at time t, as screen = origin + k × (point − anchor). Every stage is composed on the fixed canvas,
 * so the picture never zooms or pans between thoughts: only this slow move applies. */
export function cameraOf(s, t, amount = scenes[s.id]?.push ?? 0.02) {
  const cx = film.segments.indexOf(s) % 2 ? 840 : 1080,
    cy = 500;
  const from = voiceTime(s.start),
    q = ease(clamp((voiceTime(t) - from) / Math.max(1, voiceTime(s.end) - from)));
  if (CAMERA.drift.includes(s.id))
    return { k: 1 + amount * 0.5, ox: 960 + mix(-12, 12, q), oy: cy, ax: 960, ay: cy };
  const k = CAMERA.reveal.includes(s.id)
    ? 1 + amount * (1 - q)
    : CAMERA.push.includes(s.id)
      ? 1 + amount * q
      : 1;
  return { k, ox: cx, oy: cy, ax: cx, ay: cy };
}
export function push(s, t) {
  const c = cameraOf(s, t);
  ctx.translate(c.ox, c.oy);
  ctx.scale(c.k, c.k);
  ctx.translate(-c.ax, -c.ay);
}
