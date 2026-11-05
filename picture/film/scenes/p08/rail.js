/* 08 one requirement's life: the rail its journey runs along, the work travelling on it, and the small marks the
 * stations of the journey share. */

import { ctx } from "../../canvas.js";
import { dot, flowDot, line, ring, stroke, text } from "../../drawing/strokes.js";
import { documentIcon } from "../../drawing/symbols.js";
import { P } from "../../palette.js";
import { clamp, mix } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* The journey's rail stands on the content centre line from 08.1 to 08.6, so each stage that cuts in continues the
 * same line; it is four pixels wide in the line colour, a firm structure the stations stand on. */
export const RAIL_Y = 500;
export function journeyRail(x0, x1, { alpha = 1, upto = 1, dash = null } = {}) {
  if (alpha < 0.01 || upto <= 0) return;
  line(x0, RAIL_Y, mix(x0, x1, clamp(upto)), RAIL_Y, { color: P.line, alpha, width: 4, dash });
}
/* The way the journey runs: one quiet point travels the rail in voice time, so the rail rests in the quiet between
 * thoughts and moves while the voice speaks. */
export function railFlow(t, x0, x1, { alpha = 1, rate = 0.12 } = {}) {
  const q = (voiceTime(t) * rate) % 1;
  flowDot(mix(x0, x1, q), RAIL_Y, 6, q, { color: P.line, alpha });
}
/* The work the requirement has become: a firm point with its ring, standing on the rail. Its ring is a size no other
 * mark of the part shares (seals, proofs and commits are rings too), so it is never read as one of a list of rings
 * that each wait for a name, and it stays one mark with the rail it stands on. */
export function work(x, y = RAIL_Y, alpha = 1) {
  if (alpha < 0.01) return;
  dot(x, y, 10, { color: P.ink, alpha });
  ring(x, y, 19, { color: P.ink, alpha: alpha * 0.6, width: 2 });
}
/* An order mark: the step's number set as a mark beside its name rather than a name; it has no outline, so the
 * numbers of one order are not read as marks that each wait for a name. */
export function ordinal(n, x, y, alpha = 1) {
  if (alpha < 0.01) return;
  text(String(n), x, y + 1, 26, { role: "mark", align: "center", color: P.muted, alpha });
}
/* A platform: a host that receives a release, drawn with the others of its group as one mark, their outlines one
 * stroke, so the group takes one name. */
export function platforms(x, ys, { alpha = 1, w = 150, h = 80 } = {}) {
  if (alpha < 0.01) return;
  stroke(
    () =>
      ys.forEach((y) => {
        ctx.roundRect(x - w / 2, y - h / 2, w, h, 14);
        ctx.moveTo(x - w / 2, y - h / 2 + 26);
        ctx.lineTo(x + w / 2, y - h / 2 + 26);
      }),
    { color: P.ink, alpha, width: 2.5 },
  );
}
/* A document whose ruled rows are drawn as one stroke, so the rows read as the document's content rather than as a
 * list of rows that each wait for a name. */
export function docMark(x, y, w, h, { alpha = 1, rows = 4 } = {}) {
  if (alpha < 0.01) return;
  documentIcon(x, y, w, h, { alpha, rows: 0 });
  if (rows > 0)
    stroke(
      () => {
        for (let i = 0; i < rows; i++) {
          const ry = y + h * (0.3 + (i * 0.55) / Math.max(1, rows));
          ctx.moveTo(x + w * 0.14, ry);
          ctx.lineTo(x + w * (i % 2 ? 0.62 : 0.82), ry);
        }
      },
      { color: P.muted, alpha: alpha * 0.8, width: 2 },
    );
}
