/* The single-line captions. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { text } from "../drawing/strokes.js";
import { P } from "../palette.js";
import { film } from "../timeline.js";
import { ramp } from "../timing/easing.js";

/* Cues closer than this are lines of one speech: the earlier holds through the gap and the next replaces it in place,
 * so the caption band does not blink to ground between them. A cue fades only beside a longer quiet. */
const CAPTION_JOIN = 0.3;
export function caption(t) {
  const caps = film.captions;
  const joined = (a, b) => a && b && b.start - a.end <= CAPTION_JOIN;
  let i = caps.findIndex((v) => v.start <= t && t < v.end);
  if (i < 0)
    i = caps.findIndex((v, k) => v.end <= t && t < caps[k + 1]?.start && joined(v, caps[k + 1]));
  if (i < 0) return;
  const c = caps[i];
  const a =
    (joined(caps[i - 1], c) ? 1 : ramp(t, c.start - 0.04, 0.12)) *
    (joined(c, caps[i + 1]) ? 1 : 1 - ramp(t, c.end - 0.1, 0.1));
  text((c.display_text ?? c.text).trim(), 960, 970, 26, {
    align: "center",
    color: P.ink,
    alpha: 0.94 * Math.max(a, 0.001),
    role: "caption",
  });
}
