/* 08.5 the dropped push: the journey's rail runs on towards a platform, the work on its way. The connection drops
 * midway: a cross stands in the rail, the work stops short of it and the stretch beyond turns dashed. A second push
 * leaves the work, dashed, and stops at a question; it is in doubt because the first may already have landed, and the
 * platform, where it would have landed, arrives at the rail's end with the first push's name and shows that unknown.
 * ETHOS is designed so that the rail, a long write, is bracketed from below: before it, a note of what it is about to
 * do, linked up to the rail's start; after it, a report on the uncertain stretch of whether anything was written,
 * leading to the one safe next action. The rail stands whole on the frame's axis from the stage's first frame, from
 * 240 to 1680; until the platform is named, the stretch beyond the cut runs to the rail's end, and it draws back to the
 * platform's near edge as the platform arrives at that end, the platform's outer edge mirroring the rail's start. The
 * cut stands near the middle, 50 px left of the axis, so the stretches either side of it differ by 14% in length and
 * are not read as a pair of one length that each wait for a name, and the cut's name stays clear of the report's link
 * to the uncertain stretch. The names under the rail hang from one line, and so do those of the row below. */

import { flowClock, link } from "../../drawing/links.js";
import { dot, ring } from "../../drawing/strokes.js";
import { cross } from "../../drawing/symbols.js";
import { askIcon } from "../../drawing/workspace.js";
import { named } from "../../naming/lists.js";
import { NAME_GAP, nameText, termRow } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cueFrom, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { glideShare } from "../../timing/pauses.js";
import { verdictMark } from "../p04/marks.js";
import { RAIL_Y, docMark, journeyRail, platforms, railFlow, work } from "./rail.js";

/* The rail from its start to the platform, whose outer edge mirrors the rail's start about the frame's axis, the cut
 * near the middle and the work's place on either side of its travel. */
const X0 = 240,
  PLATFORM = [140, 76],
  PX = 1680 - PLATFORM[0] / 2,
  CUT = 910,
  CUT_GAP = 34,
  FROM = 620,
  STOP = CUT - 70,
  ASK = [1240, 350],
  ASK_R = 28,
  // The row under the rail, a long write's note and report and the safe next action, on one centre line.
  ROW_Y = 700,
  DOC = [44, 56],
  NOTE_X = 420,
  REPORT_X = 1140,
  NEXT_X = 1510,
  STEP_R = 17;

export function droppedPush(s, t, a) {
  if (a <= 0) return;
  const [nameAt, dropAt, againAt, landedAt, writeAt, noteAt, afterAt, writtenAt, nextAt] = cues(s, [
    ["要是推到一半断了线", "the connection drops"],
    ["断了线", "drops"],
    ["顺手再推一遍", "Just push again"],
    ["也许已经成了", "may already have landed"],
    ["耗时的写入", "a long write"],
    ["先记下要做什么", "first notes"],
    ["事后说清楚", "afterwards reports"],
    ["写进去没有", "whether anything was written"],
    ["下一步做什么才安全", "the one safe next action"],
  ]);
  const whatAt = cueFrom(s, "要做什么", "what it is about to do", noteAt),
    firstAt = cueFrom(s, "上一次", "The first push", againAt);
  const dropped = ramp(t, dropAt - 0.1, 0.4),
    wx = mix(FROM, STOP, glideShare(t, nameAt, STOP - FROM, 0.9)),
    below = rowNameTop([RAIL_Y + PLATFORM[1] / 2, RAIL_Y + 19]),
    rowTop = rowNameTop([ROW_Y + DOC[1] / 2, ROW_Y + STEP_R]);
  // The rail: solid up to the cut, and beyond it solid until the connection drops, then dashed; its end draws back to
  // the platform's near edge as the platform begins to arrive, clear of it before the platform is a fifth drawn.
  const end = mix(PX + PLATFORM[0] / 2, PX - PLATFORM[0] / 2 - 8, soon(t, firstAt - 0.25, 0.35));
  journeyRail(X0, CUT - CUT_GAP, { alpha: a });
  journeyRail(CUT - CUT_GAP, CUT + CUT_GAP, { alpha: a * (1 - dropped) });
  journeyRail(CUT + CUT_GAP, end, { alpha: a * (1 - dropped) });
  journeyRail(CUT + CUT_GAP, end, { alpha: a * dropped, dash: [12, 10] });
  railFlow(t, X0, STOP, { alpha: a * (1 - dropped) });
  cross(CUT, RAIL_Y, 22, { color: P.ink, alpha: a * dropped, width: 3.5 });
  work(wx, RAIL_Y, a);
  nameText(L("推到一半，断了线", "The connection drops"), CUT, below, {
    valign: "top",
    alpha: a * named(t, nameAt),
  });
  // What may already have landed is the first push: the platform, where it would have landed, arrives on its words
  // with its name under it, so it never stands unnamed, and its unknown mark carries the doubt on the words that say
  // it, so the platform is not read as the subject and no label repeats the caption.
  const first = a * named(t, firstAt);
  platforms(PX, [RAIL_Y], { alpha: first, w: PLATFORM[0], h: PLATFORM[1] });
  nameText(L("上一次", "The first push"), PX, below, { valign: "top", alpha: first });
  verdictMark("unknown", PX, RAIL_Y + 13, 15, { alpha: a * named(t, landedAt) });
  // The second push, in doubt: it leaves the work and stops at a question.
  const again = a * named(t, againAt);
  link(STOP, RAIL_Y - 26, ASK[0] - ASK_R - 8, ASK[1], {
    route: "vh",
    alpha: again,
    upto: soon(t, againAt + 0.05, 0.7),
    dash: [8, 9],
    end: false,
  });
  askIcon(ASK[0], ASK[1], ASK_R, { alpha: a * named(t, againAt + 0.35), color: P.ink });
  nameText(L("再推一遍？", "Push again?"), ASK[0], ASK[1] - ASK_R - NAME_GAP, {
    valign: "bottom",
    alpha: again,
  });
  // The rail is a long write.
  nameText(L("耗时的写入", "A long write"), (X0 + STOP) / 2, RAIL_Y - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, writeAt),
  });
  // Before it, a note of what it is about to do, linked up to the rail's start.
  const note = a * named(t, noteAt);
  link(NOTE_X, ROW_Y - DOC[1] / 2 - 10, NOTE_X, RAIL_Y + 6, {
    alpha: note,
    upto: soon(t, noteAt + 0.05, 0.5),
  });
  docMark(NOTE_X - DOC[0] / 2, ROW_Y - DOC[1] / 2, DOC[0], DOC[1], { alpha: note, rows: 3 });
  termRow(
    t,
    [L("先记下", "First notes")],
    [noteAt],
    [L("要做什么", "what it is about to do")],
    [whatAt],
    NOTE_X,
    rowTop,
    { alpha: a, align: "center", inline: false },
  );
  // After it, a report on the uncertain stretch of whether anything was written.
  const report = a * named(t, afterAt);
  link(REPORT_X, ROW_Y - DOC[1] / 2 - 10, REPORT_X, RAIL_Y + 6, {
    alpha: report,
    upto: soon(t, afterAt + 0.05, 0.5),
  });
  docMark(REPORT_X - DOC[0] / 2, ROW_Y - DOC[1] / 2, DOC[0], DOC[1], { alpha: report, rows: 3 });
  termRow(
    t,
    [L("事后说明", "Afterwards reports")],
    [afterAt],
    [L("写进去没有", "whether anything was written")],
    [writtenAt],
    REPORT_X,
    rowTop,
    { alpha: a, align: "center", inline: false },
  );
  // And the one safe next action: the open step, led to from the report.
  const next = a * named(t, nextAt);
  link(REPORT_X + DOC[0] / 2 + 10, ROW_Y, NEXT_X - STEP_R - 10, ROW_Y, {
    alpha: next,
    upto: soon(t, nextAt + 0.05, 0.5),
    flow: flowClock(t),
  });
  ring(NEXT_X, ROW_Y, STEP_R, { color: P.ink, alpha: next, width: 2.5 });
  dot(NEXT_X, ROW_Y, 7, { color: P.ink, alpha: next });
  nameText(L("下一步做什么才安全", "The one safe next action"), NEXT_X, rowTop, {
    valign: "top",
    alpha: next,
  });
}
