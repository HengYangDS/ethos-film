/* The scene loop: which scene is on screen at each time, its cuts and fades, and the frame it draws. */

import { ctx, layout, measuring, resolution, sceneFade, setDrawing, wordFade } from "./canvas.js";
import { contrastOf } from "./drawing/colour.js";
import { push } from "./framing/camera.js";
import { caption } from "./framing/captions.js";
import { chapterCard, opensChapter, runningHead } from "./framing/chapters.js";
import { measuringContext } from "./framing/measuring.js";
import { credits, titleSignature } from "./framing/titles.js";
import { P } from "./palette.js";
import { scenes } from "./scenes/registry.js";
import { film } from "./timeline.js";
import { ramp } from "./timing/easing.js";

/* Within a chapter the picture changes as the next voice begins, in the same cut as a stage within a scene: the
 * outgoing scene holds and the incoming one replaces it in one frame, so the change reads as one cut rather than a
 * double exposure or a blink. The cut falls on the incoming scene's first label at reading contrast, no earlier than its
 * first word and at most CUT_LAG after it, so the outgoing picture holds over the first syllables instead of leaving
 * the frame without a legible mark while the new scene waits for its first named place. */
const CUT_LAG = 0.6;
const continues = (i) => i > 0 && film.segments[i - 1].chapter === film.segments[i].chapter;
const firstTexts = new Map();
function firstTextOf(s) {
  if (firstTexts.has(s.id)) return firstTexts.get(s.id);
  const saved = { ctx, layout, sceneFade, wordFade, measuring },
    scene = window.__sceneId;
  const meter = measuringContext();
  let found = Infinity;
  setDrawing({ measuring: true, ctx: meter });
  try {
    for (let t = s.voice_start - 0.3; t <= s.voice_start + CUT_LAG + 0.2; t += 1 / 60) {
      setDrawing({ layout: { texts: [], scene: s.id }, sceneFade: 1, wordFade: 1 });
      meter.setTransform(1, 0, 0, 1, 0, 0);
      meter.save();
      push(s, t);
      scenes[s.id](s, t);
      meter.restore();
      if (layout.texts.some((v) => contrastOf(v.color, v.alpha) >= 4.5)) {
        found = t;
        break;
      }
    }
  } finally {
    setDrawing(saved);
    window.__sceneId = scene;
  }
  firstTexts.set(s.id, found);
  return found;
}
/* A scene that carries objects across the cut changes on its first word: it draws them where the previous scene
 * left them, so the frame stays continuous, and they leave their old places only once the new scene has been cut in. */
const cutAt = (v) => {
  // The voice clip may open a few hundredths before its first aligned word; the cut waits for the word itself.
  const voice = Math.max(v.start, v.voice_start, v.words?.[0]?.start ?? -Infinity);
  return scenes[v.id]?.carries ? voice : Math.min(voice + CUT_LAG, Math.max(voice, firstTextOf(v)));
};
const visualStart = (i) => (continues(i) ? cutAt(film.segments[i]) : film.segments[i].start);
/* Marks fade with `fade`; words with `words`, so a stage can keep its marks while its words wait. */
function drawScene(s, t, fade, words = fade) {
  const scene = scenes[s.id];
  if (!scene) throw Error(`Unimplemented scene ${s.id}`);
  // The scene being drawn is published so a checker can attribute every mark to its scene.
  layout.scene = s.id;
  setDrawing({ sceneFade: fade, wordFade: words });
  window.__sceneId = s.id;
  ctx.save();
  push(s, t);
  scene(s, t);
  ctx.restore();
  layout.scene = null;
  setDrawing({ sceneFade: 1, wordFade: 1 });
  window.__sceneId = null;
}
function drawAt(t) {
  setDrawing({ layout: { texts: [], scene: null, time: t } });
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = P.ground;
  ctx.fillRect(0, 0, 1920, 1080);
  const creditStart = film.duration - film.credits_duration;
  if (t >= creditStart) {
    credits(t);
    publish(t);
    return;
  }
  const index = Math.max(
    0,
    film.segments.findLastIndex((v) => v.start <= t),
  );
  const s = film.segments[index];
  const next = film.segments[index + 1],
    prev = film.segments[index - 1];
  // The scene on screen: the outgoing scene of a chapter holds until its successor's cut.
  let shown = index;
  while (shown > 0 && continues(shown) && t < visualStart(shown)) shown--;
  if (next && continues(index + 1) && t >= visualStart(index + 1)) shown = index + 1;
  // Chapters fade through the ground: every mark of the scene carries the fade, so checks see what is shown.
  const fadeIn = index === 0 || (prev && prev.chapter === s.chapter) ? 1 : ramp(t, s.start, 0.6);
  const fadeOut = next && next.chapter === s.chapter ? 1 : 1 - ramp(t, s.end - 0.5, 0.5);
  const keep = Math.min(fadeIn, fadeOut);
  const v = film.segments[shown];
  drawScene(v, t, keep);
  // A chapter card already shows while the previous chapter's last scene fades out.
  chapterCard(next && opensChapter(next) && t >= next.start - 0.15 ? next : s, t);
  runningHead(s, t);
  caption(t);
  publish(t);
}
function publish(t) {
  window.__filmLayout = { time: t, texts: layout.texts };
}
window.renderFrame = (t) => drawAt(t + (film.render_offset || 0));
window.renderCover = () => {
  setDrawing({ layout: { texts: [] } });
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  ctx.fillStyle = P.ground;
  ctx.fillRect(0, 0, 1920, 1080);
  titleSignature(1);
};
window.__filmScenes = scenes;
window.renderFrame(0);
