/* 08.1-08.3 one requirement's life, from the request to the handover: the rail of its journey draws on from the
 * requirement; the request is written into a Change and worked in a Work Lane of its own, held on record and checked
 * again before each write; halfway through, one Agent's session ends and the next takes over by reading, in ETHOS's
 * order, fresh facts, the Change and the attestations on record. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { dot, labelSize, measure, ring } from "../../drawing/strokes.js";
import { agent, clock, seal } from "../../drawing/symbols.js";
import { bubble, folderIcon } from "../../drawing/workspace.js";
import { writeGate } from "../../drawing/lanes.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named } from "../../naming/lists.js";
import { NOTE, nameText, rejectedName } from "../../naming/names.js";
import { railNames } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { RAIL_Y, docMark, journeyRail, ordinal, railFlow, work } from "./rail.js";

/* The requirement's document at the start of the rail, where 08.1 shows it and 08.2 names it as the request. Both
 * stages stand LIFE_DX right of their drawn places, so 08.2's stations, from the request's name to the rail's end,
 * are centred on the frame, and the request keeps its place across the cut. */
const REQ = [120, 150],
  REQ_X = 250,
  LIFE_DX = 34;
const requirement = (alpha) =>
  docMark(REQ_X - REQ[0] / 2, RAIL_Y - REQ[1] / 2, REQ[0], REQ[1], { alpha, rows: 4 });

/* 08.1. The requirement stands at the start of the rail as the chapter title rises clear of it, and the rail draws
 * on from it across the band on the first words, named for the requirement's whole life. A point then travels the
 * rail in voice time. */
export function lifeStart(s, t, a) {
  if (a <= 0) return;
  const [firstAt, thisAt] = cues(s, [
    ["把这项需求", "Now follow"],
    ["这项需求的一生", "this requirement"],
  ]);
  ctx.save();
  ctx.translate(LIFE_DX, 0);
  requirement(a * clearOfTitle(s, t, RAIL_Y - REQ[1] / 2));
  journeyRail(REQ_X + REQ[0] / 2 + 8, 1680, { alpha: a, upto: soon(t, firstAt + 0.05, 1.6) });
  // The name may lead its clause a little, so the chapter's first thought is named on its first words.
  nameText(L("这项需求的一生", "this requirement"), REQ_X + REQ[0] / 2 + 24, RAIL_Y - 34, {
    align: "left",
    valign: "bottom",
    alpha: a * ramp(t, thisAt - 0.4, 0.4),
  });
  if (en)
    nameText("its whole life", 1120, RAIL_Y - 34, {
      valign: "bottom",
      alpha: a * named(t, cue(s, "这项需求的一生", "its whole life")),
    });
  railFlow(t, REQ_X + 70, 1680, { alpha: a * soon(t, firstAt + 1.4, 0.4) });
  ctx.restore();
}

/* The stations of 08.2 along the rail, and the Work Lane's span between its folder and its gate. */
const XS = [REQ_X, 490, 680, 1180, 1460];
const STATIONS = () => [
  // Authored as its lines: wrapped by measure, the English name would break onto three.
  L("研究员的要求", ["The researcher's", "request"]),
  L("正式变更", "official Change"),
  L("工作通道", "Work Lane"),
  L("再查一次", "checks once more"),
  L("受版本管理的文件", "file under version control"),
];
const LEASE_Y = 405;

/* 08.2. The request is named where the requirement stood, and the work travels the rail station by station on the
 * words that name each: into the Change, into its own Work Lane, whose holder and term stand above it on record, up
 * to the gate before a tracked file, which checks again and opens on the words that let the write go ahead. */
export function lane(s, t, a) {
  if (a <= 0) return;
  const [reqAt, changeAt, laneAt, holdAt, untilAt, fileAt, checkAt, writeAt] = cues(s, [
    ["研究员的要求", "The researcher's request"],
    ["正式变更", "official Change"],
    ["工作通道", "Work Lane"],
    ["由谁持有", "who holds that lane"],
    ["持有到什么时候", "until when"],
    ["受版本管理的文件", "file under version control"],
    ["再查一次", "checks once more"],
    ["能不能写", "whether the write may go ahead"],
  ]);
  const ats = [reqAt, changeAt, laneAt, checkAt, fileAt],
    spoken = [...ats].sort((p, q) => p - q),
    level = (i) => a * listIn(t, spoken, spoken.indexOf(ats[i])),
    shown = (i) => a * named(t, ats[i]),
    [x0, x1, x2, x3, x4] = XS;
  ctx.save();
  ctx.translate(LIFE_DX, 0);
  journeyRail(REQ_X + REQ[0] / 2 + 8, 1680, { alpha: a });
  railFlow(t, REQ_X + 70, 1680, { alpha: a });
  requirement(a);
  docMark(x1 - 75, RAIL_Y - 85, 150, 170, { alpha: shown(1), rows: 5 });
  folderIcon(x2 - 36, RAIL_Y - 29, 72, 58, { alpha: shown(2) });
  // The lane's own track from its folder to its gate, drawn on its words over the rail.
  link(x2 + 44, RAIL_Y, x3 - 40, RAIL_Y, {
    color: P.ink,
    width: 3,
    alpha: shown(2),
    upto: soon(t, laneAt + 0.05, 0.8),
    end: false,
  });
  writeGate(x3, RAIL_Y, 110, { alpha: shown(3), open: soon(t, writeAt + 0.05, 0.6) });
  docMark(x4 - 45, RAIL_Y - 57, 90, 115, { alpha: shown(4), rows: 3 });
  railNames(STATIONS(), XS, RAIL_Y + 85, { alpha: level, set: "08.2:stations" });
  // Who holds the lane and until when, on record above it, each linked from the lane on its words.
  const lease = [holdAt, untilAt],
    hx = mix(x2, x3, 0.3),
    ux = mix(x2, x3, 0.7),
    h = a * named(t, holdAt),
    u = a * named(t, untilAt);
  agent(hx, LEASE_Y, { size: 0.9, alpha: h });
  clock(ux, LEASE_Y, 20, { hand: 0.62, alpha: u });
  // Each holds its record above the lane, as the lane's own track holds it, so neither ends in a point.
  link(hx, RAIL_Y - 6, hx, LEASE_Y + 30, {
    alpha: h,
    upto: soon(t, holdAt + 0.05, 0.5),
    end: false,
  });
  link(ux, RAIL_Y - 6, ux, LEASE_Y + 30, {
    alpha: u,
    upto: soon(t, untilAt + 0.05, 0.5),
    end: false,
  });
  nameText(L("由谁持有", "who holds that lane"), hx, LEASE_Y - 34, {
    valign: "bottom",
    width: 230,
    alpha: a * listIn(t, lease, 0),
    set: "08.2:lease",
  });
  nameText(L("持有到什么时候", "until when"), ux, LEASE_Y - 34, {
    valign: "bottom",
    width: 230,
    alpha: a * listIn(t, lease, 1),
    set: "08.2:lease",
  });
  // The work travels on: into the Change, into the lane, up to the gate, and through it once the write may go ahead.
  let wx = x0 + REQ[0] / 2 + 22;
  [
    [changeAt, x1 + 75 + 22],
    [laneAt, x2 + 36 + 26],
    [fileAt, x3 - 30 - 24],
    [writeAt, x3 + 30 + 26],
  ].forEach(([at, to]) => (wx = mix(wx, to, soon(t, at + 0.05, 0.9))));
  work(wx, RAIL_Y, a);
  ctx.restore();
}

/* The sources the Agent taking over reads, in ETHOS's order: each a term with what it tells, and its mark. */
const SOURCES = () => [
  [L("刚观察到的事实", "fresh facts"), L("仓库现在是什么样子", "as it is now")],
  [L("正式变更", "the Change"), L("要做什么、做到什么样才算完", "what counts as done")],
  [L("已有的存证", "attestations"), L("做过了什么、哪些核验已经通过", "which proofs have passed")],
];
const ROWS = [360, 500, 640],
  ORDER_X = 1140,
  ICON_X = 1195,
  TEXT_X = 1235;
function sourceMark(i, x, y, alpha) {
  if (i === 0) {
    ring(x, y, 18, { color: P.ink, alpha, width: 2.5 });
    dot(x, y, 6, { color: P.ink, alpha });
  } else if (i === 1) docMark(x - 18, y - 24, 36, 48, { alpha, rows: 2 });
  else seal(x, y, 20, { alpha, color: P.ink });
}

/* 08.3. Halfway along, the work stands under its Agent on the rail; the Agent's session ends on its words and the
 * Agent dims, and the Agent that takes over arrives on its words as the work passes to it. The last one's memory is
 * refused between them. Until the reading begins the handover is centred on the frame, the rail reaching about as far
 * either side of it; then it steps left and the rail draws back to the new Agent as the three sources arrive on the
 * right in ETHOS's order, each linked from the new Agent with what it tells, and the finished picture, from the rail's
 * start to the longest of what the sources tell, is centred on the frame. Each source's term stands on its marker's
 * line from its first word, and what it tells hangs beneath. */
export function handoff(s, t, a) {
  if (a <= 0) return;
  const [halfAt, endsAt, overAt, memoryAt, factsAt, nowAt, changeAt, doneAt, attestAt, passedAt] =
    cues(s, [
      ["做到一半", "Halfway through"],
      ["会话结束了", "session ends"],
      ["接手的 Agent", "the Agent that takes over"],
      ["前一个的记忆", "the last one's memory"],
      ["刚观察到的事实", "fresh facts"],
      ["仓库现在是什么样子", "as it is now"],
      ["再读正式变更", "reads the Change"],
      ["做到什么样才算完", "what counts as done"],
      ["已有的存证", "attestations already"],
      ["哪些核验已经通过", "which proofs have passed"],
    ]);
  const sources = SOURCES(),
    widest = Math.max(
      ...sources.map(([term, tell]) => Math.max(measure(term), measure(tell, NOTE))),
    ),
    S = 960 - (560 - 320 - 2 + TEXT_X + widest) / 2,
    reading = soon(t, factsAt - 0.4, 0.8),
    off = mix(960 - (560 + 820) / 2, S, reading),
    AX = 560 + off,
    BX = 820 + off,
    AY = 410,
    // The rail's stretch beyond the new Agent draws back on its own, slower than the step, so no part of the rail
    // travels more than a few pixels a frame.
    railEnd = BX + 60 + 280 * (1 - soon(t, factsAt - 0.4, 1.2)),
    ended = ramp(t, endsAt - 0.15, 1.2),
    passed = soon(t, overAt + 0.05, 0.9),
    b = a * named(t, overAt),
    m = a * named(t, memoryAt),
    WX = mix(AX, BX, passed),
    flow = (voiceTime(t) * 0.4) % 1;
  journeyRail(AX - 320, BX + 60, { alpha: a });
  journeyRail(BX + 60, railEnd, { alpha: a });
  railFlow(t, AX - 320, railEnd, { alpha: a });
  // The work halfway, under the Agent working on it; the link passes to the next Agent with the work.
  work(WX, RAIL_Y, a);
  nameText(L("做到一半", "Halfway through"), WX, RAIL_Y + 30, {
    valign: "top",
    alpha: a * named(t, halfAt),
  });
  agent(AX, AY, { size: 1.1, alpha: a * (1 - 0.5 * ended) });
  ring(AX, AY, 34, { color: P.line, alpha: a * ended, width: 2, dash: [6, 6] });
  link(AX, AY + 28, AX, RAIL_Y - 20, { alpha: a * (1 - passed) });
  nameText(L("会话结束了", "session ends"), AX, AY - 40, {
    valign: "bottom",
    alpha: a * named(t, endsAt),
  });
  agent(BX, AY, { size: 1.1, alpha: b });
  link(BX, AY + 28, BX, RAIL_Y - 20, { alpha: b * passed, upto: passed });
  nameText(L("接手的 Agent", "the Agent that takes over"), BX, AY - 40, {
    valign: "bottom",
    width: 320,
    alpha: b,
  });
  // The last one's memory, held between them under the rail and refused.
  bubble((AX + BX) / 2, RAIL_Y + 80, 18, { alpha: m, color: P.muted });
  rejectedName(L("前一个的记忆", "the last one's memory"), (AX + BX) / 2, RAIL_Y + 130, {
    alpha: m,
    mark: ramp(t, memoryAt + 0.3, 0.4),
  });
  // What the Agent taking over reads, in order, each on its words.
  const terms = [factsAt, changeAt, attestAt],
    tells = [nowAt, doneAt, passedAt];
  sources.forEach(([term, tell], i) => {
    const y = ROWS[i],
      r = a * named(t, terms[i]);
    link(BX + 30, AY, ORDER_X + S - 20, y, {
      route: "hvh",
      mid: ORDER_X + S - 60,
      alpha: r,
      upto: soon(t, Math.max(terms[i], factsAt + 0.45) + 0.05, 0.6),
      flow: (flow + i / 3) % 1,
    });
    ordinal(i + 1, ORDER_X + S + 4, y, r);
    sourceMark(i, ICON_X + S, y, r);
    nameText(term, TEXT_X + S, y, {
      align: "left",
      alpha: a * listIn(t, terms, i),
      set: "08.3:order",
    });
    nameText(tell, TEXT_X + S, y + labelSize(LABEL) / 2 + 8, {
      align: "left",
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: a * listIn(t, tells, i),
      set: "08.3:tells",
    });
  });
}
