/* Spoken lists: each item arrives on its words, the set builds whole and leaves whole. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { layout } from "../canvas.js";
import { ring } from "../drawing/strokes.js";
import { P } from "../palette.js";
import { phraseEnd, wordEnd } from "../timing/cues.js";
import { clamp, mix, ramp, soon } from "../timing/easing.js";
import { drawShare, glideShare, pauseHold, thoughtEnd } from "../timing/pauses.js";
import { stageCuts } from "../timing/stages.js";

/* A name arrives on its words and stays while its mark stands; it leaves with its stage or its mark. */
export const named = (t, at) => ramp(t, at - 0.15, 0.4);
/* A spoken list builds: each item arrives on its own words and stays, so the whole set forms on the screen. While the
 * list is spoken, the item being named stands at full ink and the items already named share one second level; as the
 * last item's words end the whole set returns to full ink, so it stands whole for at least WHOLE seconds before the
 * argument moves on, and it leaves as a whole when the argument moves on at `until`. None of these changes falls in a
 * pause. */
const SECOND = 0.58,
  WHOLE = 0.6;
export const listLevel = (t, ats, i, until = Infinity) => {
  // The set has been said once the last item's words have ended, and it returns to full ink from then. It is whole again
  // within that item's own thought, WHOLE seconds before the thought ends or a stage cut later in the thought takes its
  // stage, so it is seen whole before it leaves and the return never waits through the pause for a next thought that
  // may already show another stage: when the last item's words end too close to that end, the set returns as its last
  // item arrives, quickly enough to settle before the pause.
  const last = ats.at(-1),
    spoken = wordEnd.get(last) ?? last;
  const cut = Math.min(
    ...[...(stageCuts.get(layout.scene) ?? [])].filter((c) => c > last && c < thoughtEnd(last)),
  );
  const end = Math.min(thoughtEnd(last), cut);
  const done = Math.max(last - 0.1, Math.min(spoken, end - WHOLE - 0.4)),
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
 * one step per part as the parts are named. Given the mark's `length`, a stroke, each step draws on at the film's tip
 * pace by its own length (drawShare). */
export const saidShare = (t, ats, length = null) =>
  ats.reduce(
    (v, at) =>
      v +
      (length === null ? soon(t, at + 0.05, 0.35) : drawShare(t, at + 0.05, length / ats.length)),
    0,
  ) / ats.length;
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
 * member still to come, closing one step on each further member's words by the film's structural glide. Returns that
 * offset at t. */
export const building = (t, ats, step = 48, lead = 0.1) =>
  step * ats.slice(1).reduce((v, at) => v + 1 - glideShare(t, at - lead, step), 0);
/* How far a group that builds part by part reaches at t, so it can stand centred on what it shows: from `base`, the
 * reach of what stands first, each part that reaches further than those before it widens the group, gliding from just
 * after its words by the film's structural glide, over at least `duration` seconds. A centred group moves by half of
 * what it widens by, so that half is the glide's way. `parts` are [at, reach] pairs. */
export function reachAt(t, base, parts, duration = 0.7) {
  let reach = base,
    now = base;
  for (const [at, v] of [...parts].sort((a, b) => a[0] - b[0])) {
    if (v <= reach) continue;
    now += (v - reach) * glideShare(t, at + 0.05, (v - reach) / 2, duration);
    reach = v;
  }
  return now;
}
