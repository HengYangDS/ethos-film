/* Spoken lists: each item arrives on its words, the set builds whole and leaves whole. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { layout } from "../canvas.js";
import { ring } from "../drawing/strokes.js";
import { P } from "../palette.js";
import { phraseEnd } from "../timing/cues.js";
import { clamp, mix, ramp, soon } from "../timing/easing.js";
import { pauseHold, thoughtEnd } from "../timing/pauses.js";
import { stageCuts } from "../timing/stages.js";

/* A name arrives on its words and stays while its mark stands; it leaves with its stage or its mark. */
export const named = (t, at) => ramp(t, at - 0.15, 0.4);
/* A spoken list builds: each item arrives on its own words and stays, so the whole set forms on the screen. While the
 * list is spoken, the item being named stands at full ink and the items already named share one second level; once
 * the last item has been said the whole set returns to full ink, and it leaves as a whole when the argument moves on
 * at `until`. None of these changes falls in a pause. */
const SECOND = 0.58;
export const listLevel = (t, ats, i, until = Infinity) => {
  // The set has been said once the last item's clause has ended. It is whole again within that item's own thought, so
  // the return never waits through the pause for a next thought that may already show another stage: when the clause
  // ends too close to the pause, the set returns as its last item arrives, quickly enough to settle before the pause.
  // A stage cut later in the same thought bounds the return in the same way, so the set leaves whole.
  const last = ats.at(-1),
    said = pauseHold(Math.max(last + 1.5, (phraseEnd.get(last) ?? last) + 0.3), 0.4);
  const cut = Math.min(
    ...[...(stageCuts.get(layout.scene) ?? [])].filter((c) => c > last && c < thoughtEnd(last)),
  );
  const end = Math.min(thoughtEnd(last), cut);
  const done = Math.min(said, Math.max(last - 0.1, end - 0.45)),
    back = Math.min(0.4, Math.max(0.15, end - 0.05 - done));
  // An item dims when the next one arrives, unless the set is whole again before that dim could settle.
  const dims = i + 1 < ats.length && done - ats[i + 1] > 0.6;
  const level =
    i + 1 < ats.length
      ? mix(
          mix(1, SECOND, dims ? ramp(t, pauseHold(ats[i + 1] - 0.15, 0.3), 0.3) : 0),
          1,
          ramp(t, done, back),
        )
      : 1;
  return level * (1 - ramp(t, pauseHold(until, 0.4), 0.4));
};
/* An item's ink: its entrance on its own words times its level in the list. A name whose parts arrive on their own
 * words takes the level alone, since each part brings its own entrance. */
export const listIn = (t, ats, i, until = Infinity) =>
  ramp(t, ats[i] - 0.15, 0.4) * listLevel(t, ats, i, until);
/* The item being spoken, from its words until the next item's (the last until its clause has been said): its own mark
 * lights for that time, while every name keeps one ink. */
export const speaking = (t, ats, i) => {
  const until =
    i + 1 < ats.length
      ? ats[i + 1] - 0.15
      : pauseHold(Math.max(ats[i] + 1.5, (phraseEnd.get(ats[i]) ?? ats[i]) + 0.3), 0.3);
  return ramp(t, ats[i] - 0.15, 0.3) * (1 - ramp(t, until, 0.3));
};
/* How much of a list has been said: each part adds its share on its own words, so a mark drawn to this share grows
 * one step per part as the parts are named. */
export const saidShare = (t, ats) =>
  ats.reduce((v, at) => v + soon(t, at + 0.05, 0.35), 0) / ats.length;
/* One beat for each part said over a single mark: the mark's ring flashes on the part's words, within its own extent,
 * so a list spoken at one place shows each part arriving. */
export function beats(t, x, y, r, ats, { color = P.ink, alpha = 1 } = {}) {
  const flash = Math.max(
    0,
    ...ats.map((at) => {
      const p = clamp((t - at - 0.05) / 0.5);
      return p > 0 && p < 1 ? Math.sin(Math.PI * p) : 0;
    }),
  );
  if (flash > 0) ring(x, y, r, { color, alpha: alpha * flash * 0.5, width: 3.5 });
}
/* A list said member by member keeps its spoken order along its axis and stays balanced while it builds: each member
 * stands at its place in the list's final layout, and the whole list stands `step` px toward its open end for each
 * member still to come, closing one step on each further member's words. Returns that offset at t. */
export const building = (t, ats, step = 48, lead = 0.1) =>
  step * ats.slice(1).reduce((v, at) => v + 1 - soon(t, at - lead, 0.4), 0);
