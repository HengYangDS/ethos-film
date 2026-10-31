/** The English edition on the modules under picture/film/ themselves, as authored: each test process loads them once,
 * on one edition's timeline. */
import test from "node:test";
import assert from "node:assert/strict";

import { authoredTimeline, emptySpeech, openModules, scenesThatPaint } from "./page.mjs";

const film = await authoredTimeline("en");
const composition = await openModules(film);

test("en modules paint every authored scene and its credits", () => {
  assert.equal(scenesThatPaint(composition, film).size, film.segments.length);
  assert.ok(composition.render(film.duration - 1).texts.some((v) => v.text === "Yang HENG"));
});

test("en modules never play speech over an empty picture", () => {
  assert.deepEqual(emptySpeech(composition, film), []);
});
