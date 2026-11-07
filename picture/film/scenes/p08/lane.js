/* 08.1-08.3 one requirement's life, from the request to the handover: the rail of its journey stands as the chapter
 * title rises, and the request is named at its start; the request is written into a Change and worked in a Work Lane
 * of its own, held on record and checked again before each write; halfway through, one Agent's session ends and the
 * next takes over by reading, in ETHOS's order, fresh facts, the Change and the attestations on record. */

import { ctx } from "../../canvas.js";
import { FLOW_EVERY, flowClock, link } from "../../drawing/links.js";
import { dot, labelSize, measure, ring } from "../../drawing/strokes.js";
import { agent, clock, seal } from "../../drawing/symbols.js";
import { bubble, folderIcon } from "../../drawing/workspace.js";
import { writeGate } from "../../drawing/lanes.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named } from "../../naming/lists.js";
import { NOTE, nameText, rejectedName, termRow, termRowLayout } from "../../naming/names.js";
import { railNames } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { glideShare, glideSteps } from "../../timing/pauses.js";
import { nameWidth } from "../p07/example.js";
import { RAIL_Y, docMark, journeyRail, ordinal, railFlow, work } from "./rail.js";

/* The requirement's document at the start of the rail, where the request is named. */
const REQ = [120, 150],
  REQ_X = 250;
const requirement = (alpha) =>
  docMark(REQ_X - REQ[0] / 2, RAIL_Y - REQ[1] / 2, REQ[0], REQ[1], { alpha, rows: 4 });

/* The stations of 08.1 and 08.2 along the rail stand at one pitch from the request to the file, in both editions, so
 * the journey reads at an even step. Each name stands on one line. The English file's name is wider than the share of
 * the pitch that railNames gives a name between two neighbours, so it is set as its one line: as railStations pitches
 * a rail, it and its one neighbour's name keep half of each name's width and more than a gap between their stations
 * (about 58 px between their inks). The Work Lane's span runs between its folder and its gate within one pitch, and
 * its two records stand above it a fifth of a pitch from either end, so their names stand apart. */
const PITCH = (1556 - REQ_X) / 4;
const XS = () => [0, 1, 2, 3, 4].map((k) => REQ_X + k * PITCH),
  STATION_WRAP = () => L(240, 340);
const STATIONS = () => [
  L("研究员的要求", "Researcher's request"),
  L("正式变更", "Official Change"),
  L("工作通道", "Work Lane"),
  L("再查一次", "One more check"),
  L("受版本管理的文件", ["File under version control"]),
];
/* How far the stations' picture stands right of its drawn place: from the request's name to the rail's end or the
 * file's name, whichever reaches further, it is centred on the frame. A name wraps as railNames wraps it. */
function stationsShift() {
  const names = STATIONS(),
    xs = XS(),
    width = Math.min(STATION_WRAP(), PITCH - 30),
    left = Math.min(REQ_X - REQ[0] / 2, xs[0] - nameWidth(names[0], width) / 2),
    right = Math.max(1680 + 2, xs[4] + nameWidth(names[4], width) / 2);
  return 960 - (left + right) / 2;
}
const LEASE_Y = 405;

/* 08.1-08.2. The rail of the journey, the requirement's document at its start and the work the requirement has become
 * appear across the band as the chapter title, which names the requirement's life, rises clear of them, so the picture
 * keeps its balance while the title leaves and stands firm on the first word; on the request's first words its
 * document is named, and a point travels the rail in voice time. The work then travels the rail station by station on
 * the words that name each:
 * into the Change, into its own Work Lane, whose holder and term stand above it on record, up to the gate before a
 * tracked file, which checks again and opens on the words that let the write go ahead. The request and its Change are
 * named in 08.1, and the lane, the file and its check in 08.2, so each thought's stations build as a list of their own
 * and are whole again by its end. */
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
    lists = [
      [reqAt, changeAt],
      [laneAt, fileAt, checkAt],
    ].map((v) => v.sort((p, q) => p - q)),
    level = (i) => {
      const list = lists.find((v) => v.includes(ats[i]));
      return a * listIn(t, list, list.indexOf(ats[i]));
    },
    shown = (i) => a * named(t, ats[i]),
    xs = XS(),
    [x0, x1, x2, x3, x4] = xs;
  ctx.save();
  ctx.translate(stationsShift(), 0);
  journeyRail(REQ_X + REQ[0] / 2 + 8, 1680, { alpha: a * clearOfTitle(s, t, RAIL_Y) });
  railFlow(t, REQ_X + 70, 1680, { alpha: a * soon(t, reqAt + 0.05, 0.4) });
  requirement(a * clearOfTitle(s, t, RAIL_Y - REQ[1] / 2));
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
  writeGate(x3, RAIL_Y, 110, { alpha: shown(3), open: glideShare(t, writeAt + 0.05, 70, 0.6) });
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
  // The work travels on: into the Change, into the lane, up to the gate, and through it once the write may go ahead,
  // each leg by the film's structural glide.
  const wx = glideSteps(
    t,
    x0 + REQ[0] / 2 + 22,
    [
      [changeAt, x1 + 75 + 22],
      [laneAt, x2 + 36 + 26],
      [fileAt, x3 - 30 - 24],
      [writeAt, x3 + 30 + 26],
    ],
    0.9,
  );
  work(wx, RAIL_Y, a * clearOfTitle(s, t, RAIL_Y));
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
 * right in ETHOS's order, each linked from the new Agent with what it tells. From the first source on, the picture
 * stands where it is centred on the frame by its finished extent, from the rail's start to the longest of what the
 * sources tell, and each source stands in its place from its words, so nothing moves as the next one joins. Each
 * source's term stands on its marker's line from its first word, and what it tells hangs beneath. */
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
    // How far right of the sources' text column the longest of their words reaches.
    reach = Math.max(...sources.flatMap(([term, tell]) => [measure(term), measure(tell, NOTE)]));
  const S = 960 - (560 - 320 - 2 + TEXT_X + reach) / 2,
    alone = 960 - (560 + 820) / 2,
    // The stage steps to its place as the reading begins, by the structural glide over that step.
    reading = glideShare(t, factsAt - 0.4, alone - S, 0.8),
    off = mix(alone, S, reading),
    AX = 560 + off,
    BX = 820 + off,
    AY = 410,
    // The rail's stretch beyond the new Agent draws back on its own, slower than the step, so no part of the rail
    // travels more than a few pixels a frame.
    railEnd = BX + 60 + 280 * (1 - glideShare(t, factsAt - 0.4, 280, 1.2)),
    ended = ramp(t, endsAt - 0.15, 1.2),
    passed = glideShare(t, overAt + 0.05, 820 - 560, 0.9),
    b = a * named(t, overAt),
    m = a * named(t, memoryAt),
    WX = mix(AX, BX, passed),
    flow = flowClock(t);
  journeyRail(AX - 320, BX + 60, { alpha: a });
  journeyRail(BX + 60, railEnd, { alpha: a });
  railFlow(t, AX - 320, railEnd, { alpha: a, longest: BX + 340 - (AX - 320) });
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
  // The English sets what the Agent does as its name's qualifier: on one line the name would crowd the session's.
  const taker = L(["接手的 Agent"], ["The Agent"]),
    takes = L([], ["that takes over"]);
  termRow(
    t,
    taker,
    [overAt],
    takes,
    [overAt],
    BX,
    AY - 40 - termRowLayout(taker, takes, Infinity, false).height,
    { alpha: a, align: "center", inline: false },
  );
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
      flow: flowClock(t, i / 3),
      flowEvery: FLOW_EVERY,
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
