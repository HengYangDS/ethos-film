/* Names: how a label is wrapped, grown from its parts, set beside its term or refused. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { ctx } from "../canvas.js";
import { labelSize, measure, text } from "../drawing/strokes.js";
import { cross } from "../drawing/symbols.js";
import { LABEL, P } from "../palette.js";
import { clamp, mix, ramp } from "../timing/easing.js";

/* Visual system. A stage shows one structure, and its names stay with their marks while the stage stands, so a
 * structure is seen whole and never loses its words. Every name is placed by the rule of the structure it belongs to
 * (a rail, a ring, a column), at one gap from its mark and on one shared baseline or edge, so no scene sets words by
 * hand. Relations are carried by position, alignment and containment; where a relation must be drawn, it follows the
 * grid in straight runs and quarter turns, draws on from its source and ends in a quiet point, not an arrowhead. */
export const NAME_GAP = 22,
  LEADING = 1.3;
/* Breaks a name into balanced lines no wider than `width`: English between words, and a Chinese name only after a
 * list or clause mark, a clause mark before a list mark where its lines fit, so no line begins inside a word. A
 * Chinese name without such a mark breaks between characters, so a name whose break would split a word is authored as
 * its lines. A name that fits stays on one line. Authored lines are kept as written: an array, or a string whose lines
 * are separated by newlines. */
const NAME_JOINT = /[、，。；：,]$/u,
  CLAUSE_JOINT = /[，。；：,]$/u;
export function wrapName(v, width, size = LABEL) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v.includes("\n")) return v.split("\n");
  if (!Number.isFinite(width) || measure(v, size) <= width) return [v];
  const latin = !/[\u4e00-\u9fff]/u.test(v),
    tokens = latin ? v.split(/(?<= )/) : [...v],
    splits = [];
  for (let k = 1; k < tokens.length; k++) {
    const a = tokens.slice(0, k).join("").trimEnd(),
      b = tokens.slice(k).join("").trimStart();
    if (!a || !b || /^[、，。；：）”]/u.test(b)) continue;
    splits.push({
      a,
      b,
      joint: !latin && NAME_JOINT.test(a),
      worst: Math.max(measure(a, size), measure(b, size)),
    });
  }
  // A Chinese name splits at a mark whose lines fit, a clause mark first, else at any mark, and between characters
  // only when it has no mark; of these, the split whose wider line is narrowest is kept.
  const joints = splits.filter((s) => s.joint),
    fitting = joints.filter((s) => s.worst <= width);
  const clauses = fitting.filter((s) => CLAUSE_JOINT.test(s.a));
  const pool = clauses.length
    ? clauses
    : fitting.length
      ? fitting
      : joints.length
        ? joints
        : splits;
  if (!pool.length) return [v];
  const best = pool.reduce((x, s) => (s.worst < x.worst ? s : x));
  if (best.worst <= width || tokens.length < 3) return [best.a, best.b];
  const [head, ...rest] = wrapName(best.a, width, size);
  return [head, ...wrapName([...rest, best.b].join(latin ? " " : ""), width, size)];
}
/* The ink of a final 、，。；：！？ fills only the left of its em, so a right-aligned line hangs it half an em past the
 * edge and a centred line moves 0.3 em right, and its ink keeps the edge or centre of the other lines. */
const hangOf = (line, align, em) =>
  /[、，。；：！？]$/u.test(line)
    ? (align === "right" ? 0.5 : align === "center" ? 0.3 : 0) * em
    : 0;
/* A name of one or more lines anchored at (x, y): `valign` top hangs it below the point, bottom stands it above, and
 * middle centres it. Its lines share one edge, so a wrapped name stays one block, and it counts as one name. */
export function nameText(
  v,
  x,
  y,
  { width = Infinity, size = LABEL, valign = "middle", align = "center", ...o } = {},
) {
  const lines = Array.isArray(v) ? v : wrapName(v, width, size),
    em = labelSize(size),
    step = em * LEADING;
  const top =
    valign === "top"
      ? y + em / 2
      : valign === "bottom"
        ? y - em / 2 - step * (lines.length - 1)
        : y - (step * (lines.length - 1)) / 2;
  lines.forEach((line, k) =>
    text(line, x + hangOf(line, align, em), top + k * step, size, {
      align,
      ...o,
      whole: lines.join(" "),
    }),
  );
  return { lines, top: top - em / 2, bottom: top + step * (lines.length - 1) + em / 2 };
}
/* The lines of a name whose parts wrap as units onto lines no wider than `width`, as indices into its parts. Parts fill
 * each line in their authored phrases; when that leaves a short tail (a last line under two fifths of the widest), the
 * same number of lines is rebalanced so the widest line is as narrow as possible and the name reads as one block. A line
 * wider than `width` holds a single part. */
const lineCaches = new WeakMap();
function growLines(parts, width = Infinity, size = LABEL) {
  // Widths depend on the context measuring them, so each context keeps its own layouts.
  const cache = lineCaches.get(ctx) ?? new Map(),
    key = JSON.stringify([String(width), size, parts]);
  lineCaches.set(ctx, cache);
  if (cache.has(key)) return cache.get(key);
  const greedy = [[]];
  parts.forEach((part, k) => {
    const line = greedy.at(-1);
    if (line.length && measure([...line.map((j) => parts[j]), part].join(""), size) > width)
      greedy.push([k]);
    else line.push(k);
  });
  let lines = greedy;
  const n = greedy.length,
    span = (a, b) => measure(parts.slice(a, b).join(""), size);
  const widths = greedy.map((line) => span(line[0], line.at(-1) + 1));
  if (n > 1 && parts.length <= 16 && widths.at(-1) < 0.4 * Math.max(...widths)) {
    let best = null;
    const search = (left, cuts) => {
      const from = cuts.at(-1) ?? 0;
      if (left === 1) {
        const ends = [...cuts, parts.length],
          starts = [0, ...cuts],
          widths = ends.map((end, i) => span(starts[i], end));
        if (!widths.every((w, i) => w <= width || ends[i] - starts[i] === 1)) return;
        const worst = Math.max(...widths),
          spread = widths.reduce((sum, v) => sum + v * v, 0);
        if (
          !best ||
          worst < best.worst - 0.5 ||
          (Math.abs(worst - best.worst) <= 0.5 && spread < best.spread)
        )
          best = { starts, ends, worst, spread };
        return;
      }
      for (let cut = from + 1; cut <= parts.length - left + 1; cut++)
        search(left - 1, [...cuts, cut]);
    };
    search(n, []);
    if (best)
      lines = best.ends.map((end, i) =>
        Array.from({ length: end - best.starts[i] }, (_, j) => best.starts[i] + j),
      );
  }
  cache.set(key, lines);
  return lines;
}
/* The height of a block of `lines` lines of one size. */
const blockHeight = (lines, size = LABEL) => labelSize(size) * (1 + LEADING * (lines - 1));
/* A name of authored parts, set whole: it stands complete from the words that begin it, so its text never changes
 * after it appears and the eye never reads a phrase being typed on. It is laid out from its whole text: parts wrap as
 * units onto lines no wider than `width`, and the lines share one left edge. */
/* The texts of each line of a name of parts, as [part, text] pairs. A part that wraps to a new line starts that line
 * without its leading separator, and the separator's mark hangs at the end of the line before: no line starts with a
 * comma and no comma is lost. */
export function growTexts(parts, width = Infinity, size = LABEL) {
  const lines = growLines(parts, width, size).map((line) => line.map((k) => [k, parts[k]]));
  lines.forEach((line, r) => {
    const [k, v] = line[0],
      lead = r ? (v.match(/^[、，,;；\s]+/u)?.[0] ?? "") : "";
    if (!lead) return;
    line[0] = [k, v.slice(lead.length)];
    const mark = lead.replace(/\s+/gu, "");
    if (mark) lines[r - 1].push([k, mark]);
  });
  return lines;
}
/* A name stands whole on the words of its first part; a name that lists what is said over several seconds may `build`,
 * each part joining it in its place on its own words, so the picture keeps changing while the list is spoken. Its
 * lines start at x, or centre or end on it by `align`. */
export function growName(
  t,
  parts,
  ats,
  x,
  y,
  {
    width = Infinity,
    size = LABEL,
    valign = "top",
    alpha = 1,
    build = false,
    align = "left",
    ...o
  } = {},
) {
  const em = labelSize(size),
    step = em * LEADING,
    lines = growTexts(parts, width, size);
  const top =
    valign === "top"
      ? y + em / 2
      : valign === "bottom"
        ? y - em / 2 - step * (lines.length - 1)
        : y - (step * (lines.length - 1)) / 2;
  lines.forEach((line, r) => {
    const span = line.reduce((w, [, v]) => w + measure(v, size), 0);
    let left =
      (align === "center" ? x - span / 2 : align === "right" ? x - span : x) +
      hangOf(line.map(([, v]) => v).join(""), align, em);
    line.forEach(([k, v]) => {
      const at = build ? (ats[k] ?? ats[0]) : ats[0];
      text(v, left, top + r * step, size, {
        align: "left",
        ...o,
        alpha: alpha * ramp(t, at - 0.15, 0.4),
        whole: o.whole ?? parts.join(""),
      });
      left += measure(v, size);
    });
  });
  return {
    lines: lines.length,
    top: top - em / 2,
    bottom: top + step * (lines.length - 1) + em / 2,
  };
}
/* A key term and its qualifier, read as one name: the term at the label size, the qualifier smaller and muted after it
 * on the same centre line, or on the next line when the row would be wider than `width`. The term stands whole from its
 * words and the qualifier joins it whole on its own, so a long condition reads as a few key words rather than a
 * sentence; a qualifier that lists what is said over several seconds may `build`, each part on its own words. */
export const NOTE = 22,
  TERM_GAP = 16;
/* A qualifier set under its term stands this far below the term's line, so at least 12 px of ground stays clear
 * between their inks. */
export const TERM_STACK = 10;
/* Whether a term row keeps its qualifier on the term's line, and the row's height. A list sets every row's qualifier
 * the same way: `inline` true or false decides it for the row, and null lets the row's own width decide. */
export function termRowLayout(term, qual, width = Infinity, inline = null) {
  const one =
    !qual.length ||
    (inline ?? measure(term.join(""), LABEL) + TERM_GAP + measure(qual.join(""), NOTE) <= width);
  const head = blockHeight(growLines(term, width).length);
  return {
    one,
    height: one ? head : head + TERM_STACK + blockHeight(growLines(qual, width, NOTE).length, NOTE),
  };
}
export function termRow(
  t,
  term,
  termAts,
  qual,
  qualAts,
  x,
  y,
  {
    width = Infinity,
    alpha = 1,
    color = P.ink,
    set = null,
    build = false,
    inline = null,
    align = "left",
  } = {},
) {
  // A row centred or ended on x sets its qualifier under the term unless `inline` says otherwise, so the term stands on
  // x from its first word and does not move when the qualifier joins. When the two share a line, they centre or end on
  // x together; when the qualifier stands under the term, each line centres or ends on x.
  const whole = [...term, ...qual].join(" "),
    { one } = termRowLayout(term, qual, width, inline ?? (align === "left" ? null : false)),
    shared = one && qual.length,
    span = measure(term.join(""), LABEL) + TERM_GAP + measure(qual.join(""), NOTE),
    left = shared ? (align === "center" ? x - span / 2 : align === "right" ? x - span : x) : x,
    head = growName(t, term, termAts, left, y, {
      width,
      alpha,
      color,
      whole,
      set,
      align: shared ? "left" : align,
    });
  if (!qual.length) return head;
  const after = left + measure(term.join(""), LABEL) + TERM_GAP;
  const tail = growName(
    t,
    qual,
    qualAts,
    one ? after : x,
    one ? head.top + (labelSize(LABEL) - labelSize(NOTE)) / 2 : head.bottom + TERM_STACK,
    {
      size: NOTE,
      alpha,
      color: P.muted,
      width: one ? Infinity : width,
      whole,
      set,
      build,
      align: one ? "left" : align,
    },
  );
  return { top: head.top, bottom: Math.max(head.bottom, tail.bottom) };
}
/* A phrase the film rejects, set as a name: muted plain text that dims as it is refused, with a cross beside the
 * words rather than over them. A centred refusal centres its words and their cross together on x; `markLeft` stands
 * the cross's left edge at one x instead, so the crosses of a list of refusals form one column after its longest
 * name. */
export function rejectedName(
  v,
  x,
  y,
  {
    alpha = 1,
    mark = 1,
    size = LABEL,
    align = "center",
    valign = "middle",
    width = Infinity,
    set = null,
    markLeft = null,
  } = {},
) {
  const s = Math.min(26, labelSize(size) * 0.9),
    at = align === "center" && markLeft === null ? x - (16 + s) / 2 : x;
  const block = nameText(v, at, y, {
    align,
    valign,
    width,
    size,
    color: P.muted,
    alpha: alpha * mix(1, 0.7, clamp(mark)),
    set,
  });
  const w = Math.max(...block.lines.map((line) => measure(line, size))),
    left = align === "left" ? at : align === "right" ? at - w : at - w / 2,
    markAt = markLeft ?? left + w + 16;
  cross(markAt + s / 2, (block.top + block.bottom) / 2, s, {
    alpha: alpha * mark,
    width: 3,
  });
  return { ...block, left, right: markAt + s };
}
