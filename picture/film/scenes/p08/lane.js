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

/* 08.1. The requirement stands as the chapter title rises clear of it, and the rail draws on from it across the band
 * on the first words, named for the requirement's whole life. A point then travels the rail in voice time. Until the
 * rail draws on, the requirement and its name stand alone, centred on the frame; they glide to the rail's start as
 * the rail draws on beside them, the glide following the drawing a moment behind, so the picture keeps its centre
 * while the band fills and the requirement reaches its place in 08.2 before the cut. */
export function lifeStart(s, t, a) {
  if (a <= 0) return;
  const [firstAt, thisAt] = cues(s, [
    ["把这项需求", "Now follow"],
    ["这项需求的一生", "this requirement"],
  ]);
  const NAME = L("这项需求的一生", "This requirement"),
    nameX = REQ_X + REQ[0] / 2 + 24,
    alone = 960 - (REQ_X - REQ[0] / 2 + nameX + measure(NAME)) / 2 - LIFE_DX;
  ctx.save();
  ctx.translate(LIFE_DX + alone * (1 - soon(t, firstAt + 0.13, 1.55)), 0);
  requirement(a * clearOfTitle(s, t, RAIL_Y - REQ[1] / 2));
  journeyRail(REQ_X + REQ[0] / 2 + 8, 1680, { alpha: a, upto: soon(t, firstAt + 0.05, 1.6) });
  // The name may lead its clause a little, so the chapter's first thought is named on its first words.
  nameText(NAME, nameX, RAIL_Y - 34, {
    align: "left",
    valign: "bottom",
    alpha: a * ramp(t, thisAt - 0.4, 0.4),
  });
  if (en)
    nameText("Its whole life", 1120, RAIL_Y - 34, {
      valign: "bottom",
      alpha: a * named(t, cue(s, "这项需求的一生", "its whole life")),
    });
  railFlow(t, REQ_X + 70, 1680, { alpha: a * soon(t, firstAt + 1.4, 0.4) });
  ctx.restore();
}

/* The stations of 08.2 along the rail stand at one pitch from the request to the file, in both editions, so the
 * journey reads at an even step and the widest neighbours, the check and the file's name, keep a clear gap; the English
 * request's name breaks after its possessive, and its names wrap no narrower than the file's. The Work Lane's span runs
 * between its folder and its gate within one pitch, and its two records stand above it a fifth of a pitch from either
 * end, so their names stand apart. */
const PITCH = (1556 - REQ_X) / 4;
const XS = () => [0, 1, 2, 3, 4].map((k) => REQ_X + k * PITCH),
  STATION_WRAP = () => L(240, 340);
const STATIONS = () => [
  // Authored as its lines: wrapped by measure, the English name would break onto three, and no line is an article.
  L("研究员的要求", ["The researcher's", "request"]),
  L("正式变更", "Official Change"),
  L("工作通道", "Work Lane"),
  L("再查一次", "One more check"),
  L("受版本管理的文件", "File under version control"),
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
    xs = XS(),
    [x0, x1, x2, x3, x4] = xs;
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
  railNames(STATIONS(), xs, RAIL_Y + 85, {
    alpha: level,
    set: "08.2:stations",
    wrap: STATION_WRAP(),
  });
  // Who holds the lane and until when, on record above it, each linked from the lane on its words; the English names
  // wrap within the distance between them, less a gap, and the Chinese ones stand on one line each.
  const lease = [holdAt, untilAt],
    hx = mix(x2, x3, 0.2),
    ux = mix(x2, x3, 0.8),
    leaseWrap = L(230, Math.min(230, ux - hx - 30)),
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
  nameText(L("由谁持有", "Who holds that lane"), hx, LEASE_Y - 34, {
    valign: "bottom",
    width: leaseWrap,
    alpha: a * listIn(t, lease, 0),
    set: "08.2:lease",
  });
  nameText(L("持有到什么时候", "Until when"), ux, LEASE_Y - 34, {
    valign: "bottom",
    width: leaseWrap,
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
  [L("刚观察到的事实", "Fresh facts"), L("现在是什么样子", "as it is now")],
  [L("正式变更", "The Change"), L("做到什么样才算完", "what counts as done")],
  [L("已有的存证", "Attestations"), L("哪些核验已经通过", "which proofs have passed")],
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
 * right in ETHOS's order, each linked from the new Agent with what it tells. The picture, from the rail's start to the
 * furthest of the sources' words that stand, is centred on the frame from the first source on: each term or tell that
 * reaches further than those before it widens the picture, and the whole glides to its new centre just after its
 * words, so the finished picture, to the longest of what the sources tell, is centred too. Each source's term stands
 * on its marker's line from its first word, and what it tells hangs beneath. */
export function handoff(s, t, a) {
  if (a <= 0) return;
  const [halfAt, endsAt, overAt, memoryAt, factsAt, nowAt, changeAt, doneAt, attestAt, passedAt] =
    cues(s, [
      ["做到一半", "Halfway through"],
      ["会话结束了", "session ends"],
      ["接手的 Agent", "the Agent that takes over"],
      ["前一个的记忆", "the last one's memory"],
      ["刚观察到的事实", "fresh facts"],
      ["现在是什么样子", "as it is now"],
      ["再读正式变更", "reads the Change"],
      ["做到什么样才算完", "what counts as done"],
      ["已有的存证", "attestations already"],
      ["哪些核验已经通过", "which proofs have passed"],
    ]);
  const sources = SOURCES(),
    terms = [factsAt, changeAt, attestAt],
    tells = [nowAt, doneAt, passedAt],
    // The sources' words in the order they are said, each with how far right of the sources' text column it reaches.
    parts = sources
      .flatMap(([term, tell], i) => [
        [terms[i], measure(term)],
        [tells[i], measure(tell, NOTE)],
      ])
      .sort((p, q) => p[0] - q[0]);
  // How far the sources reach at t: a part that reaches further than those before it widens them, gliding from just
  // after its words.
  let reach = parts[0][1],
    widest = reach;
  for (const [at, w] of parts.slice(1)) {
    if (w <= widest) continue;
    reach += (w - widest) * soon(t, at + 0.05, 0.7);
    widest = w;
  }
  const S = 960 - (560 - 320 - 2 + TEXT_X + reach) / 2,
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
  nameText(L("会话结束了", "Session ends"), AX, AY - 40, {
    valign: "bottom",
    alpha: a * named(t, endsAt),
  });
  agent(BX, AY, { size: 1.1, alpha: b });
  link(BX, AY + 28, BX, RAIL_Y - 20, { alpha: b * passed, upto: passed });
  // Authored as its lines, so the English breaks before "that" rather than after it.
  nameText(L("接手的 Agent", ["The Agent", "that takes over"]), BX, AY - 40, {
    valign: "bottom",
    width: 320,
    alpha: b,
  });
  // The last one's memory, held between them under the rail and refused.
  bubble((AX + BX) / 2, RAIL_Y + 80, 18, { alpha: m, color: P.muted });
  rejectedName(L("前一个的记忆", "The last one's memory"), (AX + BX) / 2, RAIL_Y + 130, {
    alpha: m,
    mark: ramp(t, memoryAt + 0.3, 0.4),
  });
  // What the Agent taking over reads, in order, each on its words.
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
