/* The four rules' headings share one place and one alignment: the rule's number in small muted type, its statement
 * below, and at their left the rule's glyph, the mark as far as the film has built it. The glyph and the text are
 * centred together on the frame by their ink, the number's centre line at KICK_Y and the statement's first line hung
 * from RULE_Y, and the glyph's origin, its cinnabar datum, is centred on the text block. A rule whose stage is the mark itself sets its heading
 * without a glyph, its text alone centred in the same place. */

import { ethosMark, markExtent } from "../drawing/mark.js";
import { labelSize, measure } from "../drawing/strokes.js";
import { named } from "../naming/lists.js";
import { LEADING, NOTE, nameText, wrapName } from "../naming/names.js";
import { LABEL, P } from "../palette.js";

export const KICK_Y = 196,
  RULE_Y = 218,
  RULE_WRAP = 600,
  GLYPH_GAP = 40;

/* Where a rule's heading stands for a glyph of `size` built of the parts in `glyph` (a size of 0 sets no glyph): the
 * glyph's origin (mx, my), the text's left edge tx, its lines, and the block's top and bottom. `cx` and `dy` move the
 * whole heading, for a heading that settles into this place. */
export function ruleHeadingLayout(number, statement, size, glyph, { cx = 960, dy = 0, wrap = RULE_WRAP } = {}) {
  const lines = wrapName(statement, wrap),
    tw = Math.max(measure(number, NOTE), ...lines.map((v) => measure(v))),
    top = KICK_Y - labelSize(NOTE) / 2 + dy,
    bottom = RULE_Y + labelSize(LABEL) * (1 + LEADING * (lines.length - 1)) + dy,
    e = size > 0 ? markExtent(size, glyph) : null,
    gw = e ? e.right - e.left + GLYPH_GAP : 0,
    left = cx - (gw + tw) / 2;
  return {
    lines,
    tx: left + gw,
    mx: e ? left - e.left : null,
    my: e ? (top + bottom) / 2 : null,
    top,
    bottom,
  };
}

/* A rule's heading drawn in its place. `shares` are the glyph's parts as they draw on (see ethosMark); the number and
 * the statement each stand whole from their words. Returns the layout. */
export function ruleHeading(
  t,
  { number, numberAt, statement, statementAt, size = 0, glyph = {}, shares = glyph, alpha = 1, ...o },
) {
  const h = ruleHeadingLayout(number, statement, size, glyph, o);
  if (size > 0) ethosMark(h.mx, h.my, size, { ...shares, alpha });
  nameText(number, h.tx, KICK_Y + (o.dy ?? 0), {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: alpha * named(t, numberAt),
  });
  nameText(h.lines, h.tx, RULE_Y + (o.dy ?? 0), {
    align: "left",
    valign: "top",
    alpha: alpha * named(t, statementAt),
  });
  return h;
}
