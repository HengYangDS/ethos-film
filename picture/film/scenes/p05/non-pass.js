/* 05.6 What every result other than pass says. By ETHOS's design: a judgment's three outcomes return, as they stood,
 * under that name; on its words pass steps back, and block and unknown, every result other than pass, are bracketed as
 * one and named; from that name links lead to the five things they say, built as one list on its words, each a mark and
 * its name, in a column of five rows at the outcomes' pitch, centred on the outcomes' rows. The whole stands centred
 * from its first state: it shifts as each part that widens it arrives, a moment ahead of the things' words, so a name
 * never arrives beyond the safe area. */

import { ctx } from "../../canvas.js";
import { FLOW_EVERY, flowClock, link } from "../../drawing/links.js";
import { dot, labelSize, line, measure, ring, stroke } from "../../drawing/strokes.js";
import { person } from "../../drawing/symbols.js";
import { askIcon } from "../../drawing/workspace.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, termRow } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp } from "../../timing/easing.js";
import { docMark } from "../p08/rail.js";
import { verdictMark } from "../p04/marks.js";
import {
  buildingReach,
  outcomeNames,
  outcomeQuals,
  outcomesColumns,
  outcomesParts,
} from "./rule-two.js";

/* One grid for both columns about the content centre: four rows for the design's name and the three outcomes, and five
 * rows at the same pitch, centred on them, for the five things. */
const ROWS = [374, 458, 542, 626],
  THING_ROWS = [332, 416, 500, 584, 668],
  KINDS = ["pass", "block", "unknown"],
  MARK_R = 18,
  // How far the bracket's spine runs past its two rows, and its ticks.
  OVER = 24,
  TICK = 14,
  // How far ahead of a thing's words the group starts to make room for its name.
  LEAD = 0.35,
  // The bracket's rows, block and unknown, and the line between them, where its name stands and the links leave.
  MID = (ROWS[2] + ROWS[3]) / 2;
const notPassName = () => L("只要不是通过", "Any result other than pass");
const thingNames = () =>
  L(
    ["发生了什么", "为什么停下", "证据，或者缺什么事实", "下一步做什么才安全", "要不要人决定"],
    [
      "What happened",
      "Why that step stopped",
      "Its evidence, or the missing fact",
      "The one safe next action",
      "Whether a person has to decide",
    ],
  );

/* The columns from the group's left edge, each after the one before: the outcomes' list as the outcomes stage sets it,
 * the bracket, its name, the links' run, the things' marks and their names. */
function columns() {
  const list = outcomesColumns(),
    left = list.mark - MARK_R,
    right = Math.max(...outcomesParts({}).map(([, reach]) => reach)) - left,
    bracket = right + NAME_GAP + TICK,
    note = bracket + NAME_GAP,
    from = note + measure(notPassName()) + 14,
    trunk = from + 46,
    marks = trunk + 64,
    things = marks + 24 + NAME_GAP;
  return {
    names: list.names - left,
    quals: list.quals - left,
    right,
    bracket,
    note,
    from,
    trunk,
    marks,
    things,
  };
}
/* The parts as they arrive, each with how far right it reaches from the group's left edge. */
function parts(c) {
  const col = columns();
  return [
    [c.nonPassFirst, col.right],
    [c.notPass, col.from - 14],
    ...[c.happened, c.why, c.evidence, c.nextSafe, c.person].map((at, i) => [
      at - LEAD,
      col.things + measure(thingNames()[i]),
    ]),
  ];
}

/* The five marks: what happened an event, a point on a short line of time; why a step stopped a question raised, its
 * evidence or the missing fact a document, the safe next action the open step of 05.3, and a decision a person. */
function thingMark(i, x, y, alpha) {
  if (alpha < 0.01) return;
  if (i === 0) {
    line(x - 20, y, x + 20, y, { color: P.ink, alpha, width: 2.5 });
    dot(x, y, 7, { color: P.ink, alpha });
  } else if (i === 1) askIcon(x, y - 1, 19, { alpha, color: P.ink });
  else if (i === 2) docMark(x - 17, y - 22, 34, 44, { alpha, rows: 3 });
  else if (i === 3) {
    ring(x, y, 17, { color: P.ink, alpha, width: 2.5 });
    dot(x, y, 7, { color: P.ink, alpha });
  } else person(x, y + 5, { alpha, size: 0.8 });
}

export function nonPassStage(s, t, c, g) {
  if (g <= 0) return;
  const x = 960 - buildingReach(t, parts(c)) / 2,
    col = columns(),
    em = labelSize(LABEL),
    names = outcomeNames(),
    quals = outcomeQuals(),
    things = thingNames(),
    ats = [c.happened, c.why, c.evidence, c.nextSafe, c.person],
    other = g * named(t, c.notPass),
    aside = mix(1, 0.62, ramp(t, c.notPass + 0.2, 0.4));
  nameText(L("按 ETHOS 的设计", "By ETHOS's design"), x, ROWS[0], { align: "left", alpha: g });
  KINDS.forEach((kind, i) => {
    const y = ROWS[i + 1],
      alpha = g * (i ? 1 : aside);
    verdictMark(kind, x + MARK_R, y, MARK_R, { alpha });
    termRow(t, [names[i]], [-Infinity], quals[i], [-Infinity], x + col.names, y - em / 2, {
      alpha,
      qualLeft: x + col.quals,
    });
  });
  // Block and unknown bracketed as one, and the name of what they are.
  const bx = x + col.bracket;
  stroke(
    () => {
      ctx.moveTo(bx - TICK, ROWS[2] - OVER);
      ctx.lineTo(bx, ROWS[2] - OVER);
      ctx.lineTo(bx, ROWS[3] + OVER);
      ctx.lineTo(bx - TICK, ROWS[3] + OVER);
    },
    { color: P.ink, alpha: other, width: 2.5 },
  );
  nameText(notPassName(), x + col.note, MID, { align: "left", alpha: other });
  things.forEach((name, i) => {
    const on = g * named(t, ats[i]);
    link(x + col.from, MID, x + col.marks - 34, THING_ROWS[i], {
      route: "hvh",
      mid: x + col.trunk,
      alpha: on,
      draw: { t, at: ats[i] + 0.05 },
      flow: flowClock(t, i / 5),
      flowEvery: FLOW_EVERY,
    });
    thingMark(i, x + col.marks, THING_ROWS[i], on);
    nameText(name, x + col.things, THING_ROWS[i], {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "05.6:things",
    });
  });
}
