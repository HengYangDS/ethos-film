/* The quiet between thoughts, which no change of the picture may fall into, and the voice's own clock. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { film } from "../timeline.js";
import { units } from "./cues.js";
import { ease, mix } from "./easing.js";

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
/* Voice time: the film's clock, slowed to rest in the quiet between thoughts. A scene's slow camera move, every looping
 * movement (a turn, an orbit, a sway, a flow's dots) and a movement still under way when a thought ends advance with it,
 * so they rest in the quiet between two thoughts and resume where they stopped. The clock never stops or sets off at
 * once, which a viewer sees as a stutter: over the last SETTLE seconds before HOLD after a thought's last word it eases
 * to rest, and over SETTLE seconds from HOLD before the next thought's first word it eases back to full pace, each by
 * the smoothstep curve, so a moving mark settles and sets off as a thing with weight does. The picture stands unchanged
 * from HOLD after one thought to HOLD before the next. A thought shorter than two easings shares its span between them.
 * A flow's dots enter and leave by size, so a flow at rest in the quiet leaves no half-faded dot. */
const HOLD = 0.05,
  SETTLE = 0.45;
/* The share of an easing's time a smoothstep easing to rest has covered at x: the integral of 3x² - 2x³. */
const covered = (x) => x ** 3 - x ** 4 / 2;
const easings = (() => {
  const joins = thoughtJoins.map(([end, next]) => {
    const middle = (end + next) / 2;
    return { rest: Math.min(end + HOLD, middle), resume: Math.max(next - HOLD, middle) };
  });
  joins.forEach((j, k) => {
    j.down = Math.min(SETTLE, k ? (j.rest - joins[k - 1].resume) / 2 : j.rest);
    j.up = Math.min(SETTLE, k + 1 < joins.length ? (joins[k + 1].rest - j.resume) / 2 : SETTLE);
  });
  let taken = 0;
  for (const j of joins) {
    j.before = taken;
    taken += j.down / 2 + (j.resume - j.rest) + j.up / 2;
  }
  return joins;
})();
export const voiceTime = (t) => {
  let lo = 0,
    hi = easings.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (easings[mid].rest - easings[mid].down <= t) lo = mid + 1;
    else hi = mid;
  }
  if (!lo) return t;
  const { rest, resume, down, up, before } = easings[lo - 1];
  if (t < rest) return t - before - down * covered((t - rest + down) / down);
  if (t < resume) return t - before - down / 2 - (t - rest);
  if (t < resume + up) {
    const x = (t - resume) / up;
    return t - before - down / 2 - (resume - rest) - up * (x - covered(x));
  }
  return t - before - down / 2 - (resume - rest) - up / 2;
};
/* A structural glide: a mark, a row or a whole stage moving to a new place. It eases in and out by the smoothstep
 * curve, so it neither sets off nor halts at speed, and it advances in voice time, so a glide still under way when a
 * thought ends settles with the voice and goes on after the quiet. It lasts at least `least` seconds, and longer for a
 * long way: its peak pace, 1.5 times its mean, stays at GLIDE_PACE px/s at 1080p, well under what a viewer can follow,
 * and it gathers and sheds that pace gently, its acceleration at either end (6 × its way / its time²) at most
 * GLIDE_PICKUP px/s², so within one frame of rest it moves well under 60 px/s. Returns the share of its way a glide of
 * `distance` px that sets off at `at` has gone at t. */
export const GLIDE_PACE = 450,
  GLIDE_PICKUP = 2400;
export const glideTime = (distance, least = 0.6) =>
  Math.max(
    least,
    (1.5 * Math.abs(distance)) / GLIDE_PACE,
    Math.sqrt((6 * Math.abs(distance)) / GLIDE_PICKUP),
  );
export const glideShare = (t, at, distance, least = 0.6) =>
  ease((voiceTime(t) - voiceTime(at)) / glideTime(distance, least));
/* A stroke drawing on with a point at its tip, such as a path whose end point leads it out: the tip moves by the same
 * smoothstep curve in voice time, quicker than a structural glide since only the tip moves, its peak at most DRAW_PACE
 * px/s, under the 900 px/s at which a mark races, and its pickup bounded as a glide's is. Returns the share drawn at t of
 * a stroke `length` px long that sets off at `at`, over at least `least` seconds. */
export const DRAW_PACE = 820;
export const drawTime = (length, least = 0.4) =>
  Math.max(
    least,
    (1.5 * Math.abs(length)) / DRAW_PACE,
    Math.sqrt((6 * Math.abs(length)) / GLIDE_PICKUP),
  );
export const drawShare = (t, at, length, least = 0.4) =>
  ease((voiceTime(t) - voiceTime(at)) / drawTime(length, least));
/* When such a stroke sets off so that it is whole by its thought's quiet, HOLD after the thought's last word, and never
 * rests part-drawn through a pause: at `at`, or, when its words come so late in their thought that it would still be
 * drawing then, as much sooner as it needs, by at most `lead` seconds, DRAW_LEAD unless given, so it never sets off far
 * ahead of the words that name it. */
export const DRAW_LEAD = 0.35;
export function drawStart(at, length, least = 0.4, lead = DRAW_LEAD) {
  const need = drawTime(length, least),
    whole = voiceTime(thoughtEnd(at) + HOLD) - 1e-3,
    fits = (start) => voiceTime(start) + need <= whole;
  if (fits(at)) return at;
  let fitting = at - lead,
    late = at;
  if (!fits(fitting)) return fitting;
  for (let i = 0; i < 20; i++) {
    const middle = (fitting + late) / 2;
    if (fits(middle)) fitting = middle;
    else late = middle;
  }
  return fitting;
}
/* When a structural glide sets off so that it has settled by its thought's quiet, as drawStart does for a stroke: at
 * `at`, or as much sooner as it needs, by at most `lead` seconds, so a glide begun on a thought's last words does not
 * rest part-way through the quiet and, where a stage cut follows, never finish. */
export function glideStart(at, distance, least = 0.6, lead = DRAW_LEAD) {
  const need = glideTime(distance, least),
    whole = voiceTime(thoughtEnd(at) + HOLD) - 1e-3,
    fits = (start) => voiceTime(start) + need <= whole;
  if (fits(at)) return at;
  let fitting = at - lead,
    late = at;
  if (!fits(fitting)) return fitting;
  for (let i = 0; i < 20; i++) {
    const middle = (fitting + late) / 2;
    if (fits(middle)) fitting = middle;
    else late = middle;
  }
  return fitting;
}
/* A mark that glides through several places in turn: it stands at `first` and glides to each next place from just
 * after the word that brings it, each step by the structural glide over its own way, so a step that sets off before
 * the last one has settled carries on from where the mark stands. Each step is [that word's time, the place]. */
export const glideSteps = (t, first, steps, least = 0.7) => {
  let x = first,
    aim = first;
  for (const [at, to] of steps) {
    x = mix(x, to, glideShare(t, at + 0.05, to - aim, least));
    aim = to;
  }
  return x;
};
