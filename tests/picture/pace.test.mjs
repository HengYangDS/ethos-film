/* The timing helpers of picture/film/timing/pauses.js that keep every mark at the glide's pace, on a film of one
 * thought, where the voice clock is the film's clock: a mark never moves faster than a glide, however quickly its
 * places are named, whatever glide carries its way and however uneven its way is. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const words = [{ text: "one", start: 1, end: 1.2 }];
globalThis.window = {
  FILM: {
    edition: "en",
    render_offset: 0,
    duration: 100,
    captions: [],
    segments: [{ id: "01", text: "one", utterance_groups: ["one"], words, start: 0, end: 100 }],
  },
};
const {
  GLIDE_PACE,
  GLIDE_PEAK,
  crossYield,
  glideShare,
  glideSteps,
  glideTime,
  glideYield,
  pacedWay,
  yieldingShare,
} = await import("../../picture/film/timing/pauses.js");

const DT = 1 / 600;
/* The fastest pace of the place x(t), a number or a point, over [a, b], in px/s. */
const fastest = (x, a, b) => {
  const at = (t) => [x(t)].flat();
  let peak = 0;
  for (let t = a; t < b; t += DT) {
    const [p, q] = [at(t), at(t + DT)];
    peak = Math.max(peak, Math.hypot(...q.map((v, i) => v - p[i])) / DT);
  }
  return peak;
};
/* The steps of a mark that sets off for each stop just after its word, as glideSteps takes them. */
const stepsOf = (stops, ats) => stops.map((stop, i) => [ats[i], stop]);

test("the pace limit the film declares is its glide pace, and the scene camera shows no glide faster", async () => {
  const declared = await readFile(new URL("../../content/film.toml", import.meta.url), "utf8");
  const limit = /^\[picture\.motion\]\n(?:.*\n)*?pace_limit = (\d+)$/m.exec(declared)?.[1];
  assert.equal(Number(limit), GLIDE_PACE);
  // A scene's camera pushes in by at most 2% (framing/camera.js).
  assert.ok(GLIDE_PEAK * 1.02 <= GLIDE_PACE);
});

test("a step alone is a glide to its place", () => {
  for (const t of [9.9, 10, 10.2, 10.5, 11, 12])
    assert.equal(glideSteps(t, 320, [[10, 540]]), 320 + 220 * glideShare(t, 10.05, 220, 0.7));
});

test("steps whose places are named apart stay separate glides", () => {
  const x = (t) => glideSteps(t, 0, stepsOf([200, 400], [10, 12]));
  assert.equal(x(11.5), 200);
  assert.equal(x(14), 400);
  assert.equal(x(12.3), 200 + 200 * glideShare(12.3, 12.05, 200, 0.7));
});

test("steps named faster than a glide takes are one move at the glide's pace", () => {
  // The rail of 02.2 as the English edition names its stations: a step of 295 px takes 1.01 s, and the last three
  // places are named 0.56 s and 1.12 s after the second.
  const stops = [665, 960, 1255, 1550],
    ats = [0, 1.04, 1.6, 2.72].map((v) => 10 + v);
  const x = (t) => glideSteps(t, 370, stepsOf(stops, ats), 0.5);
  const peak = fastest(x, 9, 20);
  assert.ok(peak <= GLIDE_PEAK + 0.5, `peak ${peak}`);
  assert.ok(peak >= GLIDE_PEAK - 0.5, `peak ${peak}`);
  assert.equal(x(10.04), 370);
  assert.equal(x(20), stops.at(-1));
  // It never turns back, and it gathers and sheds its pace gently at both ends.
  for (let t = 9; t < 20; t += DT) assert.ok(x(t + DT) >= x(t) - 1e-9);
  assert.ok(fastest(x, 10.05, 10.07) < 60);
  // The first step is a glide alone; the last three are one move from the first stop: 885 px at the glide's pace and
  // its two ramps.
  assert.equal(x(11.08), 665);
  const done = 11.09 + 885 / GLIDE_PEAK + 0.5;
  assert.ok(x(done - 0.02) < stops.at(-1) && x(done + 1e-9) === stops.at(-1));
  assert.ok(fastest(x, done - 0.02, done) < 20);
});

test("however quickly its places are named, a mark keeps the glide's pace where nested glides compound", () => {
  const stops = [1, 2, 3, 4, 5, 6].map((k) => 320 + 220 * k),
    ats = stops.map((_, k) => 10 + 0.3 * k);
  const x = (t) => glideSteps(t, 320, stepsOf(stops, ats));
  const nested = (t) =>
    stops.reduce(
      (at, stop, k) =>
        at + (stop - at) * glideShare(t, ats[k] + 0.05, stop - (k ? stops[k - 1] : 320), 0.7),
      320,
    );
  assert.ok(fastest(x, 9, 20) <= GLIDE_PEAK + 0.5, `joined ${fastest(x, 9, 20)}`);
  assert.ok(fastest(nested, 9, 20) > GLIDE_PACE, `nested ${fastest(nested, 9, 20)}`);
  assert.equal(x(20), nested(20));
});

test("a short joined move is one glide over its whole way", () => {
  const x = (t) => glideSteps(t, 0, stepsOf([60, 120], [10, 10.3]));
  assert.equal(x(10.4), 120 * glideShare(10.4, 10.05, 120, 0.7));
  assert.ok(fastest(x, 9, 12) <= GLIDE_PEAK + 0.5);
});

test("a step back the other way is its own glide", () => {
  const x = (t) => glideSteps(t, 0, stepsOf([300, 100], [10, 10.4]));
  assert.equal(x(20), 100);
  assert.ok(fastest(x, 9, 20) <= GLIDE_PEAK + 0.5);
});

test("a flow carried by a glide yields its pace to the glide's", () => {
  // A dot at FLOW px/s along a way that a glide of 500 px carries the same way.
  const FLOW = 180,
    d = 500,
    T = glideTime(d);
  const dot = (t) => d * glideShare(t, 10, d) + FLOW * (t - 8 - glideYield(t, 10, d));
  const peak = fastest(dot, 8, 10 + T + 2);
  assert.ok(peak <= GLIDE_PEAK + 0.5, `peak ${peak}`);
  // Unyielding, it would add its pace to the glide's.
  assert.ok(fastest((t) => d * glideShare(t, 10, d) + FLOW * (t - 8), 8, 10 + T + 2) > GLIDE_PACE);
  // The flow's clock never runs back, gives nothing up before the glide and d / GLIDE_PEAK seconds in all.
  for (let t = 8; t < 10 + T + 2; t += DT)
    assert.ok(t + DT - glideYield(t + DT, 10, d) >= t - glideYield(t, 10, d) - 1e-9);
  assert.equal(glideYield(9.9, 10, d), 0);
  assert.ok(Math.abs(glideYield(10 + T + 1, 10, d) - d / GLIDE_PEAK) < 1e-9);
});

test("a part that moves across the glide that carries it yields what the glide's pace leaves it", () => {
  // The original's card of 04.3 as the English edition draws it: 270 px down, and 317 px aside from 0.3 s later.
  const down = (t) => 270 * glideShare(t, 10, 270, 0.6),
    given = (at) => crossYield(at, 10, 270, 0.6),
    card = (t) => [317 * yieldingShare(t, 10.3, 317, 0.7, given), down(t)],
    unyielding = (t) => [317 * glideShare(t, 10.3, 317, 0.7), down(t)];
  const peak = fastest(card, 9, 14);
  assert.ok(peak <= GLIDE_PEAK + 1, `peak ${peak}`);
  assert.ok(fastest(unyielding, 9, 14) > GLIDE_PACE);
  assert.deepEqual(card(14), [317, 270]);
  // The clock never runs back and gives nothing up before or after the glide it crosses.
  for (let t = 9; t < 14; t += DT) assert.ok(t + DT - given(t + DT) >= t - given(t) - 1e-9);
  assert.equal(given(9.9), 0);
  assert.equal(given(12), given(13));
  // A glide that crosses at the glide's own peak takes the whole pace there; a slow one takes little.
  assert.ok(given(13) > 0.2 && given(13) < glideTime(270, 0.6));
  assert.ok(crossYield(13, 10, 30, 0.6) < 0.01);
});

test("a mark whose way is uneven is timed by its fastest stretch", () => {
  // A straight, even way is its own length.
  const straight = pacedWay((share) => [300 * share, 400 * share]);
  assert.ok(Math.abs(straight - 500) < 0.5, `straight ${straight}`);
  // A way that bends and lengthens as it goes: timed by the line between its ends the mark outruns the glide.
  const place = (share) => [300 * share, 200 * share ** 2],
    way = pacedWay(place),
    line = Math.hypot(300, 200);
  assert.ok(way > line);
  const glided = (distance) => (t) => place(glideShare(t, 10, distance));
  assert.ok(
    fastest(glided(way), 9, 13) <= GLIDE_PEAK + 0.5,
    `paced ${fastest(glided(way), 9, 13)}`,
  );
  assert.ok(fastest(glided(line), 9, 13) > GLIDE_PACE);
});
