/** This film's composition on the installed engine's headless runtime: film.js as staging inlines it, the tracked
 * bundle of the modules under picture/film/. The engine's own tools are tested in filmkit. */
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { transformSync } from "esbuild";

import { bundle } from "../../picture/bundle.mjs";
import { engineModule } from "../engine.mjs";
import { authoredTimeline, emptySpeech, scenesThatPaint } from "./page.mjs";

const { canvasStandIn, openComposition } = await import(
  engineModule("picture/headless-composition.mjs")
);

// Scripts run in a context keep their file name, so coverage attributes them to their sources.
const ENGINE = fileURLToPath(new URL("../../node_modules/gsap/dist/gsap.min.js", import.meta.url));
const COMPOSITION = fileURLToPath(new URL("../../picture/film.js", import.meta.url));

// The composition that release 2.0.0 was rendered and reviewed from. Its bytes are bound by the reviews and the release
// manifest, so they stay until the next edition is composed. The modules took the formatter's layout after that
// review, and esbuild keeps the line breaks of a call's arguments and of a list, so the bundle of the modules as they
// now stand differs from those bytes in line breaks alone.
const REVIEWED = "587c69aa494f04b3e5943a216e6d44f93909be1cb0c5210f61c709770c2ef76a";

/* A script without its comments and optional white space: two scripts with the same tokens give the same text. */
const tokens = (script) =>
  transformSync(script, { minifyWhitespace: true, legalComments: "none", charset: "utf8" }).code;

test("picture/film.js is the bundle of the modules under picture/film/", async () => {
  const tracked = await readFile(COMPOSITION),
    script = tracked.toString("utf8"),
    bundled = await bundle();
  // The reviewed bytes hold the bundle's tokens; any other composition is the bundle byte for byte.
  if (createHash("sha256").update(tracked).digest("hex") === REVIEWED)
    assert.equal(tokens(script), tokens(bundled));
  else assert.equal(script, bundled);
});

for (const code of ["zh", "en"]) {
  test(`${code} bundle paints every authored scene and its credits`, async () => {
    const film = await authoredTimeline(code),
      composition = openComposition(film);
    assert.equal(scenesThatPaint(composition, film).size, film.segments.length);
    assert.ok(composition.render(film.duration - 1).texts.some((v) => v.text === "Yang HENG"));
  });

  test(`${code} bundle never plays speech over an empty picture`, async () => {
    const film = await authoredTimeline(code);
    assert.deepEqual(emptySpeech(openComposition(film), film), []);
  });
}

test("every paint of a scene is traced to its line of film.js, however deep its helpers", async () => {
  const film = await authoredTimeline("en"),
    origins = [];
  const composition = openComposition(film);
  // Scene 01 sets its term row through helpers nested more deeply than V8's default ten frames.
  const scene = film.segments.find((v) => v.id === "01");
  for (const q of [0.15, 0.5])
    composition.render(scene.voice_start + q * (scene.voice_end - scene.voice_start), (paint) =>
      origins.push([paint.scene, composition.origin()]),
    );
  const lines = (await readFile(COMPOSITION, "utf8")).split("\n");
  const traced = origins.filter(([scene]) => scene).map(([, origin]) => origin);
  assert.ok(traced.length > 0 && traced.every(Boolean));
  // A scene's own code is its body or a module the bundle places below picture/film/scenes/; since
  // filmkit 0.12.0 a paint no scene drew takes the innermost line of film.js that drew it.
  const sceneCode = (origin) => {
    const line = Number(/^film\.js:(\d+)$/.exec(origin)[1]),
      above = lines.slice(0, line);
    const opened = above.findLastIndex((v) => /^scenes\["\d+"\] = function/.test(v));
    const inBody = opened >= 0 && opened > above.slice(0, -1).lastIndexOf("};");
    return inBody || /(^|\/)scenes\/[^/]+\//.test(composition.module(origin) ?? "");
  };
  for (const origin of traced.filter(Boolean)) assert.ok(sceneCode(origin), origin);
  // The caption and the running head are painted outside every scene.
  const outside = origins.filter(([scene]) => !scene).map(([, origin]) => origin);
  assert.ok(outside.every((origin) => origin === null || !sceneCode(origin)));
});

test("the film's own camera frames each scene", async () => {
  const film = await authoredTimeline("zh"),
    composition = openComposition(film);
  for (const segment of film.segments) {
    const camera = composition.camera(segment, (segment.start + segment.end) / 2);
    assert.ok(camera.k >= 1 && camera.k < 1.1, segment.id);
    assert.ok([camera.ox, camera.oy, camera.ax, camera.ay].every(Number.isFinite), segment.id);
  }
  assert.match(composition.palette.ground, /^#[0-9A-F]{6}$/i);
});

test("the pinned timeline engine seeks a paused timeline as the composition drives it", async () => {
  const scope = { console, setTimeout, clearTimeout };
  vm.createContext(scope);
  vm.runInContext(await readFile(ENGINE, "utf8"), scope, { filename: ENGINE });
  const { gsap } = scope.window;
  assert.equal(gsap.version, "3.15.0");
  const playhead = { time: 0 };
  const timeline = gsap.timeline({ paused: true });
  timeline.to(playhead, { time: 900, duration: 900, ease: "none" }, 0);
  timeline.seek(50);
  assert.equal(playhead.time, 50);
  timeline.kill();
  gsap.ticker.sleep();
});

async function wrapInComposition(film) {
  const window = { FILM: film },
    ctx = canvasStandIn(() => {}),
    elements = { picture: { getContext: () => ctx }, film: { dataset: { width: "1920" } } };
  const context = vm.createContext({
    window,
    document: { getElementById: (id) => elements[id] },
  });
  vm.runInContext(await readFile(COMPOSITION, "utf8"), context, { filename: COMPOSITION });
  return (v, width, size) =>
    vm.runInContext(`wrapName(${JSON.stringify(v)}, ${width}, ${size})`, context);
}

test("a Chinese name breaks only after a list or clause mark, and keeps every character", async () => {
  const wrapName = await wrapInComposition(await authoredTimeline("zh"));
  const joint = /[、，。；：,]$/u;
  for (const [v, width] of [
    ["代码、数据和实际使用，一次次给出的答案", 300],
    ["采纳的意图、不确定的地方", 230],
  ]) {
    const lines = wrapName(v, width, 26);
    assert.equal(lines.join(""), v, lines.join("|"));
    assert.ok(lines.length > 1, v);
    for (const line of lines.slice(0, -1)) assert.match(line, joint, `${v} broke after ${line}`);
  }
  // A name with no mark breaks between characters, so a label whose break would split a word is authored as its lines.
  const plain = wrapName("信任要建立在证据上的工作方式", 230, 26);
  assert.equal(plain.join(""), "信任要建立在证据上的工作方式");
  assert.ok(
    plain.every((line) => line.length <= 9),
    plain.join("|"),
  );
});
