/* Chapters: the card each chapter opens on, the running head that takes its place, the start of the chapter's first
 * scene after it and the Illustrative chip of the head band. */

import { ctx, measuring, resolution } from "../canvas.js";
import { font, line, measure, text } from "../drawing/strokes.js";
import { pill } from "../drawing/symbols.js";
import { P, TYPE } from "../palette.js";
import { L, en, film } from "../timeline.js";
import { ramp } from "../timing/easing.js";

const chapterOrder = film.chapters.map((c) => c.id);
const chapterNumber = (id) => String(chapterOrder.indexOf(id) + 1).padStart(2, "0");
export const opensChapter = (s) => {
  const i = film.segments.indexOf(s);
  return i > 0 && film.segments[i - 1].chapter !== s.chapter;
};
/* A chapter opens on its card, one centred line that stands still, and its first scene begins as the card leaves: 0.75 s
 * before the first word, so the scene stands whole on that word, or up to 0.2 s later where the chapter pause is short,
 * so the card has stood CARD_STANDS seconds and the scene still stands at nine tenths on the word. Within a chapter a
 * scene begins under the dissolve. The card inks in from CARD_LEAD before its segment, once the previous chapter's last
 * scene has faded below a tenth, so the two never show together. */
const CARD_IN = 0.3,
  CARD_LEAD = 0.1,
  CARD_OUT = 0.35,
  CARD_STANDS = 0.6,
  AHEAD = 0.15,
  HEAD_INK = 0.72;
export const opening = (s) =>
  opensChapter(s)
    ? Math.max(
        s.start,
        Math.min(s.voice_start - 0.55, Math.max(s.voice_start - 0.75, s.start + CARD_STANDS)),
      )
    : s.start - 0.25;
/* The card begins to leave AHEAD of the scene, so the scene's marks are faint while the card still reads. */
const cardLeaves = (s) => opening(s) - AHEAD;
/* A chapter opens on one centred line, its number and title, with a short rule beneath, once the previous chapter has
 * faded. Nothing of it travels: the card dissolves where it stands over CARD_OUT seconds while the running head, the
 * same words, fades in at its own place in the head band (see runningHead). The head stands in the muted colour at 0.72
 * of full ink. */
export function chapterCard(s, t) {
  if (!opensChapter(s)) return;
  const shown = ramp(t, s.start - CARD_LEAD, CARD_IN) * (1 - ramp(t, cardLeaves(s), CARD_OUT));
  if (shown <= 0) return;
  const chapter = film.chapters.find((c) => c.id === s.chapter),
    number = chapterNumber(s.chapter);
  const size = en ? 54 : 60;
  // The head's own spacing, scaled with the line: the number, two spaces, then the title.
  ctx.save();
  ctx.font = font(24, false, `${number}  ${chapter.title}`);
  const prefix = ctx.measureText(`${number}  `).width;
  ctx.restore();
  const gap = (prefix * size) / 24,
    left = 960 - (gap + measure(chapter.title, size, false, "chapter")) / 2;
  text(number, left, 540, size, { color: P.evidence, alpha: shown, role: "chapter" });
  text(chapter.title, left + gap, 540, size, { color: P.ink, alpha: shown, role: "chapter" });
  line(900, 600, 1020, 600, { color: P.line, alpha: shown });
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
  const first = film.segments.find((v) => v.chapter === s.chapter),
    next = film.segments[film.segments.indexOf(s) + 1];
  // The first chapter's head fades in with the voice; a later head fades in as its chapter's card dissolves. A head
  // leaves with its chapter's last scene, so it never goes within one frame.
  const enters =
      first === film.segments[0]
        ? ramp(t, first.voice_start, 0.6)
        : ramp(t, cardLeaves(first), CARD_OUT),
    leaves = next && next.chapter !== s.chapter ? ramp(t, s.end - 0.5, 0.5) : 0;
  const chapter = film.chapters.find((c) => c.id === s.chapter);
  text(`${chapterNumber(s.chapter)}  ${chapter.title}`, 96, 72, 24, {
    color: P.muted,
    alpha: HEAD_INK * enters * (1 - leaves),
    role: "chapter",
  });
}
