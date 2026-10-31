/** A stand-in for the render page and the film's authored timelines, for the composition's tests. The modules run as
 * themselves, one edition per process, because each reads the timeline of the page it loads in, and film.js runs on
 * the engine's headless runtime. */
import { readFile } from "node:fs/promises";

import { engineModule } from "../engine.mjs";

const { canvasStandIn } = await import(engineModule("picture/headless-composition.mjs"));

/** A timeline from an edition's script: every word 0.2 s long, thoughts and scenes joined by short gaps, so each cue a
 * scene asks for resolves and each of its stages is reached. */
export async function authoredTimeline(code) {
  const script = JSON.parse(
    await readFile(
      new URL(
        code === "zh" ? "../../content/film-script.json" : "../../content/en/film-script.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  let cursor = 3;
  const segments = script.segments.map((segment, index) => {
    if (index) cursor += script.segments[index - 1].chapter === segment.chapter ? 1.8 : 3.6;
    const tokens =
      code === "zh"
        ? segment.text.match(/[\p{Script=Han}]|[A-Za-z0-9][A-Za-z0-9'’.-]*/gu)
        : segment.text.split(/\s+/).filter(Boolean);
    const voiceStart = cursor;
    const words = tokens.map((text) => {
      const word = { text, start: cursor, end: cursor + 0.18 };
      cursor += 0.2;
      return word;
    });
    return { ...segment, voice_start: voiceStart, voice_end: cursor, words };
  });
  segments.forEach((segment, index) => {
    segment.start = index
      ? segment.voice_start - 0.6 * (segment.voice_start - segments[index - 1].voice_end)
      : 0;
  });
  const duration = cursor + 6;
  segments.forEach((segment, index) => {
    segment.end = segments[index + 1]?.start ?? duration - script.credits_duration;
  });
  return { ...script, segments, captions: [], duration, edition: code, render_offset: 0 };
}

/** Load the composition's modules on `film` as the render page would: its timeline on the window, its canvas and film
 * element in the document. Returns `render(t, onPaint)`, as the engine's headless runtime offers it. */
export async function openModules(film) {
  let onPaint = null;
  const context = canvasStandIn((paint) => {
    if (!onPaint) return;
    paint.scene = globalThis.window.__sceneId ?? null;
    onPaint(paint);
  });
  const elements = { picture: { getContext: () => context }, film: { dataset: { width: "1920" } } };
  globalThis.window = { FILM: film };
  globalThis.document = { getElementById: (id) => elements[id] };
  await import("../../picture/film/playback.js");
  return {
    render(t, paints = () => {}) {
      onPaint = paints;
      try {
        globalThis.window.renderFrame(t);
      } finally {
        onPaint = null;
      }
      return globalThis.window.__filmLayout;
    },
  };
}

/** The scenes that paint a word while their voice runs, sampled through each segment. */
export function scenesThatPaint(composition, film) {
  const painted = new Set();
  for (const segment of film.segments)
    for (const q of [0.15, 0.5, 0.85, 1]) {
      const at = segment.voice_start + q * (segment.voice_end - segment.voice_start);
      for (const v of composition.render(at).texts) {
        if (!v.bounds.every(Number.isFinite)) throw Error(`${segment.id}: unplaced ${v.text}`);
        if (v.scene) painted.add(v.scene);
      }
    }
  return painted;
}

/** Every run of speech longer than half a second over a frame with no firm mark or word of a scene. A firm stroke or
 * fill counts for the scene that paints it, so the film's own cuts and camera apply. */
export function emptySpeech(composition, film) {
  let marks = 0;
  const count = (paint) => {
    if (paint.scene && paint.kind !== "text" && paint.alpha > 0.35) marks++;
  };
  const runs = [];
  for (const segment of film.segments) {
    let run = null;
    for (let t = segment.voice_start; t < segment.voice_end; t += 0.1) {
      marks = 0;
      const { texts } = composition.render(t, count);
      if (!marks && !texts.some((v) => v.scene && v.alpha > 0.35)) {
        run ??= { segment: segment.id, start: t, end: t };
        run.end = t + 0.1;
      } else if (run) {
        runs.push(run);
        run = null;
      }
    }
    if (run) runs.push(run);
  }
  return runs
    .filter((run) => run.end - run.start > 0.5)
    .map((run) => `${run.segment}@${run.start.toFixed(1)}`);
}
