/** What review round 20 noted in part 03, as the composition draws it on a timeline authored from each script: the
 * path's line gives way to a station as the station's ring arrives, never within one frame (zh-R20-02); the English
 * reductions of 03.6 stay until their stage leaves (EN-R20-04); and the three Chinese conditions of ETHOS's own tool
 * stand as equals, in one size and ink (zh-R20-03). */
import test from "node:test";
import assert from "node:assert/strict";

import { engineModule } from "../engine.mjs";
import { authoredTimeline } from "./page.mjs";

const { openComposition } = await import(engineModule("picture/headless-composition.mjs"));

/* The start of the first word of a phrase in a segment: a run of Han characters in Chinese, of words in English. */
const startOf = (segment, phrase, code) => {
  const units = code === "zh" ? [...phrase] : phrase.split(/\s+/);
  const index = segment.words.findIndex((_, i) =>
    units.every((u, k) => segment.words[i + k]?.text.replace(/[^\p{L}\p{N}'’]/gu, "") === u),
  );
  assert.ok(index >= 0, `${phrase} is not said`);
  return segment.words[index].start;
};

for (const code of ["zh", "en"]) {
  test(`${code} path of 03.2 opens for a station as its ring arrives, not within a frame`, async () => {
    const film = await authoredTimeline(code),
      composition = openComposition(film),
      segment = film.segments.find((v) => v.id === "03");
    const from = startOf(segment, code === "zh" ? "弄清一个问题" : "a problem", code) - 1,
      to = startOf(segment, code === "zh" ? "用起来到底怎么样" : "in use", code) + 1.5;
    /* The ink of the scene's longest row of level strokes, the path's line, in px. */
    const lineInk = (t) => {
      const rows = new Map();
      composition.render(t, (p) => {
        if (p.kind !== "stroke" || p.scene !== "03" || p.dash?.length || (p.alpha ?? 1) < 0.5)
          return;
        for (const sub of p.subs ?? [])
          for (let k = 1; k < sub.length; k++) {
            const [[x0, y0], [x1, y1]] = [sub[k - 1], sub[k]];
            if (Math.abs(y1 - y0) > 0.01) continue;
            const row = Math.round(y0);
            rows.set(row, (rows.get(row) ?? 0) + Math.abs(x1 - x0));
          }
      });
      return Math.max(0, ...rows.values());
    };
    let last = null,
      seen = 0;
    for (let t = from; t <= to; t += 1 / 60) {
      const ink = lineInk(t);
      // A row that shortens by a quarter or more is another stage's line, not the path giving way.
      if (last !== null && ink > 0.75 * last) {
        assert.ok(
          last - ink <= 8,
          `the line loses ${(last - ink).toFixed(1)} px within one frame at ${t.toFixed(3)} s`,
        );
        seen++;
      }
      last = ink;
    }
    assert.ok(seen > 60, "the path's line was not followed");
  });
}

test("en reductions of 03.6 stay with their tools until the stage leaves", async () => {
  const film = await authoredTimeline("en"),
    composition = openComposition(film),
    segment = film.segments.find((v) => v.id === "03");
  const t = startOf(segment, "a net benefit", "en") + 0.3;
  const texts = composition.render(t).texts.filter((v) => v.scene === "03" && v.alpha > 0.6);
  const shown = texts.map((v) => v.text).join(" ");
  for (const part of [
    "shown to reduce",
    "total maintenance",
    "operational risk",
    "burden on adopters",
  ])
    assert.ok(shown.includes(part), `${part} has left before the stage: ${shown}`);
  // The reductions and the words that lead them read as one name, so the stage holds twelve names or fewer.
  const names = new Set(texts.map((v) => v.whole ?? v.text));
  assert.ok(names.size <= 12, `${names.size} names stand at once`);
});

test("zh conditions of ETHOS's own tool stand as equals", async () => {
  const film = await authoredTimeline("zh"),
    composition = openComposition(film),
    segment = film.segments.find((v) => v.id === "03");
  const t = startOf(segment, "才自己写", "zh") + 0.2;
  const texts = composition.render(t).texts.filter((v) => v.scene === "03");
  const rows = ["证实有缺口", "职责有明确边界", "确实划算"].map((name) => {
    const row = texts.find((v) => v.text === name);
    assert.ok(row, `${name} is not shown`);
    return row;
  });
  assert.equal(
    new Set(rows.map((v) => v.size)).size,
    1,
    "the conditions stand in more than one size",
  );
  assert.equal(
    new Set(rows.map((v) => v.color)).size,
    1,
    "the conditions stand in more than one ink",
  );
  const lefts = rows.map((v) => v.bounds[0]);
  assert.ok(
    Math.max(...lefts) - Math.min(...lefts) <= 2,
    "the conditions do not share a left edge",
  );
});
