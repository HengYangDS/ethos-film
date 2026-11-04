/* 02.6 The usual answer is more process: another register, another ledger, another copy of the same rule. Each needs
 * keeping up; over time they go stale, contradict each other and become a burden of their own. */

import { ctx } from "../../canvas.js";
import { box, line, stroke } from "../../drawing/strokes.js";
import { cross, documentIcon } from "../../drawing/symbols.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText } from "../../naming/names.js";
import { railNames } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";

/* A record of the process: a document whose middle row is the rule it keeps; `stale` dims it to a dashed outline. */
function record(x, y, w, h, { alpha = 1, stale = 0 } = {}) {
  if (alpha < 0.01) return;
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha: alpha * (1 - stale), rows: 0 });
  box(x - w / 2, y - h / 2, w, h, {
    stroke: P.ink,
    alpha: alpha * stale * 0.7,
    radius: 4,
    width: 2,
    dash: [7, 7],
  });
  stroke(
    () =>
      [-2, -1, 1, 2].forEach((k) => {
        ctx.moveTo(x - w * 0.32, y + k * h * 0.16);
        ctx.lineTo(x + w * (k % 2 ? 0.16 : 0.3), y + k * h * 0.16);
      }),
    { color: P.muted, alpha: alpha * mix(0.8, 0.5, stale), width: 2 },
  );
  line(x - w * 0.32, y, x + w * 0.32, y, {
    color: P.ink,
    alpha: alpha * mix(1, 0.6, stale),
    width: 3,
  });
}

/* The shelf the process stands on, named as more process from the cut; the three records arrive on it on their words,
 * each named over it. Kept up, each lights in turn; then the records go stale, cross each other where they meet and
 * press the shelf down, and what they have become is named under the shelf. */
export function stageLedgers(t, a, c) {
  if (a <= 0) return;
  const xs = [720, 960, 1200],
    W = 136,
    H = 166,
    ats = [c.register, c.ledger, c.copyRule],
    stale = ramp(t, c.stale - 0.15, 0.4),
    fight = ramp(t, c.fight - 0.15, 0.4),
    sink = 28 * soon(t, c.burden + 0.05, 0.6),
    SY = 700 + sink;
  line(xs[0] - W / 2 - 40, SY, xs[2] + W / 2 + 40, SY, { color: P.ink, alpha: a, width: 3 });
  nameText(L("加流程", "More process"), 960, SY + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.lCut + 0.15),
  });
  xs.forEach((x, i) => {
    const on = a * ramp(t, ats[i] - 0.15, 0.4),
      kept = clamp((t - c.keepUp - 0.05 - 0.3 * i) / 0.5),
      lit = kept > 0 && kept < 1 ? Math.sin(Math.PI * kept) : 0;
    record(x, SY - 4 - H / 2, W, H, { alpha: on, stale });
    if (lit > 0)
      box(x - W / 2 - 8, SY - 12 - H, W + 16, H + 16, {
        stroke: P.ink,
        alpha: on * lit * 0.6,
        radius: 8,
        width: 3,
      });
  });
  // The third name breaks before the phrase that qualifies it, so no line ends on "of" or "the".
  railNames(
    L(["登记表", "台账", "重复的规定"], ["Register", "Ledger", ["Copy", "of the same rule"]]),
    xs,
    SY - 4 - H,
    { side: -1, gap: NAME_GAP, alpha: (i) => a * listIn(t, ats, i), set: "process" },
  );
  // Where two records meet they contradict each other.
  [0, 1].forEach((i) =>
    cross((xs[i] + xs[i + 1]) / 2, SY - 4 - H / 2, 26, {
      color: P.ink,
      alpha: a * fight,
      width: 3.5,
    }),
  );
  // Only the result is named, centred under the shelf's name: the records turned dashed and the crosses between them
  // already show that they went stale and contradict each other, and the caption says so.
  nameText(L("新的负担", "A burden of their own"), 960, 806, {
    valign: "top",
    alpha: a * named(t, c.burden),
  });
}
