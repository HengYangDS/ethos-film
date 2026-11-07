/* 05.4 The trust boundary of local proof. The local proof's plane stands alone, and on its words a boundary closes
 * around it: inside, one account reaches both the program that produces the evidence and the one that checks it, and
 * each program feeds the plane, so local proof alone cannot rule out forgery, a claim refused under the boundary. A
 * second, independently controlled identity stands outside it and re-runs the proof along a dashed link through the
 * boundary, dashed because this layer is taken only when it is needed; under that identity, on their words, stand
 * whether it is needed and what decides that. The boundary stands centred until the identity arrives, then the two
 * glide together to where they stand centred as one group. */

import { ctx } from "../../canvas.js";
import { FLOW_EVERY, flowClock, link } from "../../drawing/links.js";
import { labelSize, measure, ring, stroke } from "../../drawing/strokes.js";
import { person } from "../../drawing/symbols.js";
import { terminalIcon } from "../../drawing/workspace.js";
import { beats, named } from "../../naming/lists.js";
import { LEADING, NAME_GAP, NOTE, nameText, rejectedName, termRow } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp } from "../../timing/easing.js";
import { drawShare, glideShare } from "../../timing/pauses.js";
import { card } from "../p04/marks.js";
import { PLANE_H, PLANE_W, plane } from "./planes.js";

/* The boundary's geometry: its top, the padding that keeps the row's outer names one gap inside it, the plane's top,
 * and the row of the account and the programs under the plane, whose outer edges keep the plane's. */
const FRAME_TOP = 340,
  PAD = 44,
  PLANE_TOP = FRAME_TOP + 30,
  PLANE_CY = PLANE_TOP + PLANE_H / 2,
  ROW_Y = 540,
  PROGRAM = [160, 84],
  IDENTITY_R = 34,
  FRAME_W = PLANE_W + 2 * PAD,
  // The re-run's link runs this far between the boundary and the identity's ring, room for its name over it.
  RUN = 160;
const names = () => ({
  produces: L("产生证据的程序", ["What produces", "the evidence"]),
  checks: L("核对证据的程序", "What checks it"),
  // The English breaks between two-word phrases, never leaving one word alone on a line (M5-23).
  identity: L("独立控制的账户", ["An independently", "controlled identity"]),
  whether: L("要不要做", "Whether one is needed"),
  decides: L("看风险和规定", "depends on risk and policy"),
});
/* How far the column under the identity reaches either side of its axis. */
function columnHalf() {
  const n = names(),
    identity = [n.identity].flat().map((v) => measure(v));
  return Math.max(...identity, measure(n.whether), measure(n.decides, NOTE)) / 2;
}
/* The plane's left edge: alone on the centre until the identity arrives, then where the boundary and the column stand
 * centred together. */
function planeAt(t, c) {
  const alone = 960 - PLANE_W / 2,
    whole = FRAME_W + RUN + IDENTITY_R + Math.max(IDENTITY_R, columnHalf()),
    together = 960 - whole / 2 + PAD;
  return mix(alone, together, glideShare(t, Math.min(c.independent, c.rerun) + 0.05, alone - together, 0.8));
}

/* A program: the film's window for code, with two ruled lines in it, drawn as one mark. */
function program(x, y, alpha) {
  if (alpha < 0.01) return;
  const [w, h] = PROGRAM;
  terminalIcon(x - w / 2, y - h / 2, w, h, { alpha });
  stroke(
    () => {
      ctx.moveTo(x - w * 0.34, y + 7);
      ctx.lineTo(x + w * 0.2, y + 7);
      ctx.moveTo(x - w * 0.34, y + 23);
      ctx.lineTo(x + w * 0.04, y + 23);
    },
    { color: P.muted, alpha: alpha * 0.8, width: 2.5 },
  );
}
/* An identity: a person in a ring, the account something acts as. */
function identity(x, y, alpha) {
  if (alpha < 0.01) return;
  ring(x, y, IDENTITY_R, { color: P.ink, alpha, width: 2.5 });
  person(x, y + 4, { alpha, size: 0.85 });
}

export function boundaryStage(s, t, c, g) {
  if (g <= 0) return;
  const px = planeAt(t, c),
    flow = flowClock(t),
    n = names(),
    em = labelSize(LABEL),
    LX = px + PROGRAM[0] / 2,
    CX = px + PLANE_W / 2,
    RX = px + PLANE_W - PROGRAM[0] / 2,
    nameTop = rowNameTop([ROW_Y + PROGRAM[1] / 2, ROW_Y + IDENTITY_R]),
    rowLines = Math.max(...[n.produces, n.checks].map((v) => [v].flat().length)),
    frameBottom = nameTop + em * (1 + LEADING * (rowLines - 1)) + 32;
  // The local proof's plane, whole and passed, with the boundary and its name closing around it on their words.
  plane(t, 0, px, PLANE_TOP, { alpha: g, at: -Infinity });
  beats(t, px + PLANE_W - 36, PLANE_CY, 24, [c.alone], { alpha: g });
  // It closes on the word "boundary", no earlier than a moment before the account fills it.
  card(px - PAD, FRAME_TOP, FRAME_W, frameBottom - FRAME_TOP, {
    alpha: g * named(t, Math.max(c.edgeWord, c.account - 0.75)),
  });
  nameText(L("还有一条边界", "One more boundary"), px - PAD, FRAME_TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.edge),
  });
  // One account reaches both programs, and each program feeds the plane.
  const account = g * named(t, c.account),
    produces = g * named(t, c.produces),
    checks = g * named(t, c.checks),
    rise = PROGRAM[1] / 2 + 8;
  identity(CX, ROW_Y, account);
  nameText(L("同一个账户", "The same account"), CX, nameTop, { valign: "top", alpha: account });
  [
    [LX, produces, c.produces, n.produces, -1],
    [RX, checks, c.checks, n.checks, 1],
  ].forEach(([x, alpha, at, name, side], i) => {
    program(x, ROW_Y, alpha);
    nameText(name, x, nameTop, { valign: "top", alpha });
    link(CX + side * (IDENTITY_R + 10), ROW_Y, x - side * (PROGRAM[0] / 2 + 10), ROW_Y, {
      alpha,
      draw: { t, at: at + 0.05 },
      flow: flowClock(t, i / 2),
      flowEvery: FLOW_EVERY,
    });
    link(x, ROW_Y - rise, x, PLANE_TOP + PLANE_H + 8, {
      alpha,
      draw: { t, at: at + 0.35 },
    });
  });
  // So local proof alone cannot rule out forgery: refused under the boundary, on its centre.
  rejectedName(L("能排除伪造", "Rule out forgery"), CX, frameBottom + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.forgery),
    mark: ramp(t, c.forgery + 0.35, 0.35),
  });
  // Outside the boundary, a second identity re-runs the proof along a link that crosses it; the link is dashed since
  // this layer is taken only when it is needed. Its ring arrives on the first of the words that name it and the re-run.
  const frameRight = px - PAD + FRAME_W,
    OX = frameRight + RUN + IDENTITY_R,
    other = g * named(t, Math.min(c.independent, c.rerun)),
    rerun = g * named(t, c.rerun);
  identity(OX, PLANE_CY, other);
  const under = nameText(n.identity, OX, PLANE_CY + IDENTITY_R + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.independent),
  });
  // The dashed re-run draws on as every stroke's tip does, at most 820 px/s.
  link(OX - IDENTITY_R - 10, PLANE_CY, px + PLANE_W + 8, PLANE_CY, {
    alpha: rerun,
    upto: drawShare(t, c.rerun + 0.05, OX - IDENTITY_R - 18 - px - PLANE_W, 0.6),
    dash: [8, 9],
    flow,
  });
  nameText(L("重跑一遍", "A re-run"), frameRight + RUN / 2, PLANE_CY - NAME_GAP, {
    valign: "bottom",
    alpha: rerun,
  });
  // Under the identity, on the line of the names in the row, whether this layer is needed and what decides that.
  link(OX, under.bottom + 12, OX, nameTop - 12, {
    alpha: g * named(t, c.whether),
    draw: { t, at: c.whether + 0.05 },
  });
  termRow(t, [n.whether], [c.whether], [n.decides], [c.risk], OX, nameTop, {
    alpha: g,
    align: "center",
    inline: false,
  });
}
