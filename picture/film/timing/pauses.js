/* The quiet between thoughts, which no change of the picture may fall into, and the voice's own clock. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { film } from "../timeline.js";
import { units } from "./cues.js";

/* The quiet between consecutive thoughts, as [end of one thought, start of the next]. A change that would fall in
 * that quiet holds through it and happens on the next words, so the picture changes with the speech rather than in
 * a pause. */
const RECEDE = 0.6;
const thoughtJoins = (() => {
  const joins = [];
  let previous = null;
  for (const s of film.segments) {
    let k = 0;
    for (const group of s.utterance_groups) {
      const need = units(group).length,
        first = k;
      let n = 0;
      while (k < s.words.length && n < need) n += units(s.words[k++].text).length;
      if (previous !== null) joins.push([previous, s.words[first].start]);
      previous = s.words[k - 1].end;
    }
  }
  return joins;
})();
export const pauseHold = (at, lasting = RECEDE) => {
  for (const [end, next] of thoughtJoins) if (at + lasting > end && at < next) return next;
  return at;
};
/* The last word's end of the thought speaking at `at`. */
export const thoughtEnd = (at) => {
  for (const [end] of thoughtJoins) if (end >= at) return end;
  return Infinity;
};
/* Voice time: the film's clock with the quiet between thoughts taken out. A scene's slow camera move, every looping
 * movement (a turn, an orbit, a sway) and a movement still under way when a thought ends advance only while the voice
 * speaks, so they rest in the quiet between two thoughts and resume where they stopped. A flow's dots enter and leave
 * by size, so a flow stopped in the quiet leaves no half-faded dot; the motion audit holds widening pulses to the same. */
const quietBefore = thoughtJoins.reduce(
  (sums, [end, next]) => [...sums, sums.at(-1) + Math.max(0, next - end)],
  [0],
);
export const voiceTime = (t) => {
  let lo = 0,
    hi = thoughtJoins.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (thoughtJoins[mid][0] < t) lo = mid + 1;
    else hi = mid;
  }
  if (!lo) return t;
  const [end, next] = thoughtJoins[lo - 1];
  return t - quietBefore[lo - 1] - Math.max(0, Math.min(t, next) - end);
};
