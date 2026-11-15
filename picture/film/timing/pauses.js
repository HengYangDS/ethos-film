/* The quiet between thoughts, which no change of the picture may fall into, and the voice's own clock. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { film } from "../timeline.js";
import { units } from "./cues.js";
import { clamp, ease } from "./easing.js";

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
 * long way: no mark is seen to move faster than GLIDE_PACE px/s at 1080p, well under what a viewer can follow and the
 * pace limit the film declares (content/film.toml), so a glide's peak pace on the canvas, 1.5 times its mean, stays at
 * GLIDE_PEAK px/s, which the scene camera's push of up to 2% (framing/camera.js) shows at no more than GLIDE_PACE. It
 * gathers and sheds that pace gently, its acceleration at either end (6 × its way / its time²) at most GLIDE_PICKUP
 * px/s², so within one frame of rest it moves well under 60 px/s. `distance` is the way of the mark that goes
 * furthest: a stage whose parts close up or spread as it moves is timed by the part that makes the longest way.
 * Returns the share of its way a glide of `distance` px that sets off at `at` has gone at t. */
export const GLIDE_PACE = 450,
  GLIDE_PEAK = 440,
  GLIDE_PICKUP = 2400;
export const glideTime = (distance, least = 0.6) =>
  Math.max(
    least,
    (1.5 * Math.abs(distance)) / GLIDE_PEAK,
    Math.sqrt((6 * Math.abs(distance)) / GLIDE_PICKUP),
  );
export const glideShare = (t, at, distance, least = 0.6) =>
  ease((voiceTime(t) - voiceTime(at)) / glideTime(distance, least));
/* The distance that times a glide by a mark whose way is uneven: `place(share)` is where the mark stands at each share
 * of the glide. A mark that makes most of its way early or late in the glide, or round a bend, moves faster there
 * than a mark gliding straight over the line between its ends, and timed by that line it outruns the glide. The glide
 * is timed as a straight one whose peak pace is this mark's: by the greatest way the mark makes in one of `steps`
 * equal parts of the glide's time, over the smoothstep's own peak of 1.5 times its mean. */
export function pacedWay(place, steps = 48) {
  let way = 0;
  for (let i = 0; i < steps; i++) {
    const [x0, y0] = place(ease(i / steps)),
      [x1, y1] = place(ease((i + 1) / steps));
    way = Math.max(way, (Math.hypot(x1 - x0, y1 - y0) * steps) / 1.5);
  }
  return way;
}
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
/* A flow, or a part that moves, on a way that a glide carries gives its own pace up to the glide's, so the mark, carried
 * as it moves, is never seen faster than a glide: its clock runs slower by the share of GLIDE_PEAK at which the glide
 * moves, resting where the glide moves at that peak and at full pace where the glide rests, and it never sets off or
 * stops at once. glideYield returns the voice time a clock has given up at t to the glide of `distance` px that sets
 * off at `at`, which a scene takes from the mark's own clock (a flow's clock). */
export const glideYield = (t, at, distance, least = 0.6) =>
  (glideShare(t, at, distance, least) * Math.abs(distance)) / GLIDE_PEAK;
/* A part that moves across the way its glide carries it gives up less: the two paces join at right angles, so its
 * clock runs at the share of GLIDE_PEAK that the glide's pace leaves it, √(1 − (the glide's share)²). crossYield
 * returns the voice time such a clock has given up at t to the glide of `distance` px that sets off at `at`: what it
 * gives up over each of YIELD_STEPS equal parts of the glide's time, the rate taken at the parts' ends and straight
 * between them, so the clock never runs back and never changes its rate at once. */
const YIELD_STEPS = 48;
export function crossYield(t, at, distance, least = 0.6) {
  const time = glideTime(distance, least),
    parts = clamp((voiceTime(t) - voiceTime(at)) / time) * YIELD_STEPS,
    // The glide moves at 6 × its way / its time × u(1 − u) at the share u of its time.
    peak = (6 * Math.abs(distance)) / (time * GLIDE_PEAK),
    rate = (i) => {
      const u = i / YIELD_STEPS;
      return 1 - Math.sqrt(Math.max(0, 1 - (peak * u * (1 - u)) ** 2));
    };
  let given = 0;
  for (let i = 0; i < parts; i++) {
    const part = Math.min(1, parts - i);
    given += part * rate(i) + ((rate(i + 1) - rate(i)) * part * part) / 2;
  }
  return (given * time) / YIELD_STEPS;
}
/* The share of its way a part's own glide of `distance` px has gone at t when it sets off at `at` on a clock that
 * yields: `given(time)` is the voice time the clock has given up by then to the glides that carry the part. */
export const yieldingShare = (t, at, distance, least, given) =>
  ease((voiceTime(t) - voiceTime(at) - (given(t) - given(at))) / glideTime(distance, least));
/* A mark that glides through several places in turn: it stands at `first` and sets off for each next place just after
 * the word that brings it. A step alone is a structural glide over its own way. A step that the next step's word finds
 * still under way, going the same way, does not slow for its place: those steps are one move through their places,
 * timed by its whole way. It gathers pace over RIDE_RAMP seconds by the smoothstep curve, as the voice clock does,
 * carries on at GLIDE_PEAK and slows over as long, so however quickly the places are named the mark never moves faster
 * than a glide; steps nested as glides compound instead, each timed for its own stretch while the mark still has the
 * stretch before to make up. A joined move too short for its two ramps is one glide over its whole way. Each step is
 * [that word's time, the place]. */
const RIDE_RAMP = 0.5;
export const glideSteps = (t, first, steps, least = 0.7) => {
  const v = voiceTime(t),
    cruise = GLIDE_PEAK * RIDE_RAMP,
    way = (i) => steps[i][1] - (i ? steps[i - 1][1] : first),
    startOf = (i) => voiceTime(steps[i][0] + 0.05);
  let place = first;
  for (let k = 0; k < steps.length;) {
    const origin = k ? steps[k - 1][1] : first,
      start = startOf(k);
    // The steps of this move: each further step the same way whose time comes before the move so far would end.
    let last = k,
      whole = Math.abs(way(k)),
      time = glideTime(whole, least);
    while (
      last + 1 < steps.length &&
      way(last + 1) * way(k) > 0 &&
      startOf(last + 1) < start + time
    ) {
      last++;
      whole = Math.abs(steps[last][1] - origin);
      time = whole < cruise ? glideTime(whole, least) : whole / GLIDE_PEAK + RIDE_RAMP;
    }
    const at = Math.max(0, Math.min(time, v - start));
    const share =
      last === k || whole < cruise
        ? ease(at / time)
        : (at < RIDE_RAMP
            ? cruise * covered(at / RIDE_RAMP)
            : at > time - RIDE_RAMP
              ? whole - cruise * covered((time - at) / RIDE_RAMP)
              : cruise / 2 + GLIDE_PEAK * (at - RIDE_RAMP)) / whole;
    place += (steps[last][1] - origin) * share;
    k = last + 1;
  }
  return place;
};
