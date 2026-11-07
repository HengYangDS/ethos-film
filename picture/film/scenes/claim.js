/* The claim panel: the Agent's sentence "Done. All tests pass." in an outline panel, with the ETHOS mark's datum, the
 * cinnabar point alone, on its right edge: a claim not yet bound to evidence. Parts 01, 02, 05, 06 and 09 draw it with
 * this one function, so the sentence keeps one form and one place for its datum wherever it returns.
 *
 * Geometry. The panel is centred on (x, y) and CLAIM_H = 84 px tall, under the 100 px at which a closed outline
 * counts as a frame that must hold content. It is as wide as its sentence plus CLAIM_PAD = 60 px on each side
 * (claimWidth(): 384 px in Chinese and 489 px in English with the headless metrics), with 16 px corners and a 2.5 px
 * paper outline, no fill. The sentence is one name at the label size, its quotation marks included, centred on the
 * panel. The datum is the mark's datum drawn by ethosMark (no hole, passages or boundary) at radius CLAIM_DATUM =
 * 12 px, centred on the middle of the right edge, so it overhangs the panel by 12 px; `datumAt` moves it elsewhere. */

import { ethosMark } from "../drawing/mark.js";
import { box, measure } from "../drawing/strokes.js";
import { growName } from "../naming/names.js";
import { P } from "../palette.js";
import { L } from "../timeline.js";

export const CLAIM_H = 84,
  CLAIM_PAD = 60,
  CLAIM_DATUM = 12;
/* The sentence in its two parts, which may arrive on their own words; the comma that joins the Chinese parts comes with
 * the second, so the first waits for it without a trailing mark. */
export const claimParts = () => L(["“做完了", "，测试全过”"], ["“Done. ", "All tests pass.”"]);
export const claimWidth = () => measure(claimParts().join("")) + 2 * CLAIM_PAD;
/* The datum alone, at radius `r`: the mark's first part, which the film's later parts complete. */
export const datumMark = (x, y, r = CLAIM_DATUM, alpha = 1) =>
  ethosMark(x, y, (512 * r) / 14, { datum: 1, hole: 0, passages: 0, boundary: 0, alpha });

/* Draws the panel at time t. `alpha` fades the outline and the datum, `words` the sentence (it defaults to `alpha`);
 * `ats`, the start times of the sentence's two parts, builds it on its words, and without them it stands whole.
 * `datum` scales the datum's radius in [0, 1]. Returns the panel's edges and where its datum stands. */
export function claimPanel(
  t,
  x,
  y,
  { alpha = 1, words = alpha, ats = null, datum = 1, datumAt = null } = {},
) {
  const parts = claimParts(),
    w = claimWidth(),
    left = x - w / 2,
    right = x + w / 2;
  box(left, y - CLAIM_H / 2, w, CLAIM_H, { stroke: P.ink, alpha, radius: 16, width: 2.5 });
  growName(t, parts, ats ?? [-Infinity], left + CLAIM_PAD, y, {
    valign: "middle",
    alpha: words,
    build: ats !== null,
  });
  const at = datumAt ?? [right, y];
  if (datum > 0.01) datumMark(at[0], at[1], CLAIM_DATUM * datum, alpha);
  return { left, right, top: y - CLAIM_H / 2, bottom: y + CLAIM_H / 2, width: w, datum: at };
}
