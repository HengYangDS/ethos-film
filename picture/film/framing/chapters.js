/* Chapter cards, the running head and the illustrative chip of the head band. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { ctx, measuring, resolution } from "../canvas.js";
import { blend } from "../drawing/colour.js";
import { font, line, measure, text } from "../drawing/strokes.js";
import { pill } from "../drawing/symbols.js";
import { cameraOf } from "./camera.js";
import { P, TYPE } from "../palette.js";
import { L, en, film } from "../timeline.js";
import { clamp, ease, mix, ramp } from "../timing/easing.js";

const chapterOrder = film.chapters.map((c) => c.id);
const chapterNumber = (id) => String(chapterOrder.indexOf(id) + 1).padStart(2, "0");
export const opensChapter = (s) => {
  const i = film.segments.indexOf(s);
  return i > 0 && film.segments[i - 1].chapter !== s.chapter;
};

/* Marks in the rising chapter title's path wait until it has risen above them (a mark at height y appears as the title
 * passes y - 45 and stands, by an eased fade, once the title is up to 240 px higher still, less for a mark so high that
 * the title lands sooner), so the two never meet, no mark arrives at once, and they still stand by the first word. */
const titleY = (s, t) => mix(540, 72, ease(clamp((t - (cardLanding(s) - RISE)) / RISE)));
/* How far the rising chapter title has cleared a mark drawn at height y, measured on screen through the scene's
 * camera, so a closer shot keeps clear of the title as well as the scene's own frame. */
export const clearOfTitle = (s, t, y = 400) => {
  if (!opensChapter(s)) return 1;
  const c = cameraOf(s, t),
    sy = c.oy + c.k * (y - c.ay);
  return ease((sy - 45 - titleY(s, t)) / Math.min(240, Math.max(60, sy - 45 - 72)));
};

/* A chapter opens on one centred line, its number and title, with a short rule beneath, once the previous chapter has
 * faded. The line then rises and shrinks into the running head it becomes over 1.1 s with an ease-in-out, landing just
 * after the first word, so it travels at most about 11 px per frame; the rule fades in place below it, so nothing
 * crosses. */
const cardLanding = (s) => s.voice_start + 0.1,
  RISE = 1.1;
export function chapterCard(s, t) {
  if (!opensChapter(s) || t >= cardLanding(s)) return;
  const enter = ramp(t, s.start, 0.3);
  if (enter <= 0) return;
  const chapter = film.chapters.find((c) => c.id === s.chapter),
    number = chapterNumber(s.chapter);
  const large = en ? 54 : 60,
    p = clamp((t - (cardLanding(s) - RISE)) / RISE),
    q = ease(p),
    size = mix(large, 24, q);
  // The head's own spacing, scaled with the line: the number, two spaces, then the title.
  ctx.save();
  ctx.font = font(24, false, `${number}  ${chapter.title}`);
  const prefix = ctx.measureText(`${number}  `).width;
  ctx.restore();
  const gap = (prefix * size) / 24,
    total = gap + measure(chapter.title, size, false, "chapter");
  const left = mix(960 - total / 2, 96, q),
    y = mix(540, 72, q),
    ink = mix(1, 0.72, q) * enter;
  text(number, left, y, size, {
    color: blend(P.evidence, P.muted, q),
    alpha: ink,
    role: "chapter",
  });
  text(chapter.title, left + gap, y, size, {
    color: blend(P.ink, P.muted, q),
    alpha: ink,
    role: "chapter",
  });
  line(900, 600, 1020, 600, {
    color: P.line,
    alpha: enter * (1 - ramp(t, cardLanding(s) - RISE, 0.35)),
  });
}
/* The Illustrative chip of an illustrative case: one fixed slot at the right of the running head, in screen space, so
 * it keeps its place and size from scene to scene. Like the running head it is a marker of the head band rather than a
 * label of the argument, so it adds no reading load. */
export function illustrative(alpha) {
  // A measuring pass looks for the scene's own first label, so the chip in the head band is left out of it.
  if (alpha < 0.015 || measuring) return;
  ctx.save();
  ctx.setTransform(resolution, 0, 0, resolution, 0, 0);
  pill(L("示意", "Illustrative"), 1824, 74, {
    alpha,
    color: P.muted,
    border: P.line,
    size: 22 * TYPE,
    align: "right",
    padX: 14,
    h: 36,
    role: "marker",
  });
  ctx.restore();
}
export function runningHead(s, t) {
  if (t < film.segments[0].voice_start) return;
  const first = film.segments.find((v) => v.chapter === s.chapter);
  // The first chapter's head fades in with the voice; later heads are the chapter titles that rose into place.
  const a =
    0.72 *
    (first === film.segments[0]
      ? ramp(t, first.voice_start, 0.6)
      : t >= cardLanding(first)
        ? 1
        : 0);
  const chapter = film.chapters.find((c) => c.id === s.chapter);
  text(`${chapterNumber(s.chapter)}  ${chapter.title}`, 96, 72, 24, {
    color: P.muted,
    alpha: a,
    role: "chapter",
  });
}
