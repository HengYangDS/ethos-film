/* The title signature and the credits. */

import { line, text } from "../drawing/strokes.js";
import { P } from "../palette.js";
import { L, en, film } from "../timeline.js";
import { ramp } from "../timing/easing.js";

export function titleSignature(alpha, signed = alpha) {
  text("ETHOS", 237, 300, 300, { bold: true, tracking: -4, alpha, baseline: "top", role: "title" });
  line(260, 652, 1624, 652, { color: P.line, width: 1, alpha });
  text(L("让信任建立在证据上", "Evidence-grounded Trust"), 260, 724, en ? 42 : 50, {
    alpha,
    role: "title",
  });
  text("Yang HENG", 1624, 846, 34, { align: "right", alpha: signed, role: "title" });
}
export function credits(t) {
  const start = film.duration - film.credits_duration;
  const a = ramp(t, start, 0.5);
  titleSignature(a, ramp(t, start + 0.2, 0.5));
  // The note follows the author's name, which inks in from 0.2 s, so the credits read title, author, note (M8-11).
  text(L("旁白为合成语音", "Narration: synthetic voice"), 1624, 902, 24, {
    align: "right",
    color: P.muted,
    alpha: ramp(t, start + 0.45, 0.35),
    role: "title",
  });
}
