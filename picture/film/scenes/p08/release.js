/* 08.4 and 08.6 the requirement's life from proof to real use: the finished work is proved on its commit and leaves an
 * attestation, is reviewed and authorized into the protected development branch and published to each platform on
 * its own; once live, its actual benefit shows only in real use and needs four things; then the journey is seen
 * whole, with the stretches not yet accepted drawn dashed. */

import { FLOW_EVERY, flowClock, link } from "../../drawing/links.js";
import { ctx } from "../../canvas.js";
import { box, line, ring, stroke } from "../../drawing/strokes.js";
import { agent, check, clock, lock, person, seal } from "../../drawing/symbols.js";
import { askIcon, commitDot, tagIcon } from "../../drawing/workspace.js";
import { commitRow } from "../../drawing/history.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, termRow, termRowLayout } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { nameWidth } from "../p07/example.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { glideShare, glideSteps, glideTime } from "../../timing/pauses.js";
import { RAIL_Y, docMark, journeyRail, platforms, railFlow, work } from "./rail.js";

/* The proof: a check in its ring, the executed check of one commit. */
function proofMark(x, y, alpha) {
  ring(x, y, 26, { color: P.ink, alpha, width: 2.5 });
  check(x, y + 1, 26, { alpha, width: 3.5 });
}

/* 08.4. The finished work stands at the rail's start; on its words the commit it became is proved, the proof standing
 * over it and leaving its attestation beside; the maintainer reviews and authorizes it on the rail, and it joins the
 * protected development branch under its lock. It is then published: on the words that name each platform, the two
 * platforms arrive as one group with their name, a link drawing out to each, and each platform's result is ticked on
 * its own, one after the other. The names over the upper row, the
 * proof's, the attestation's and the maintainer's, end on one line clear of the tallest of their marks, the names
 * under the rail hang from one line clear of the commit's ring, and neighbouring names keep at least a word's space
 * between them; the branch's name stands on one line, and the links to the platforms turn just past its end. The
 * finished work's name leaves with the Agent it stands under. The picture, from that name, as it stands at the start,
 * to the platforms', is centred on the frame. */
export function release(s, t, a) {
  if (a <= 0) return;
  const [doneAt, commitAt, proofAt, attestAt, reviewAt, branchAt, publishAt, eachAt, ownAt] = cues(
    s,
    [
      ["改完以后", "When the work is committed"],
      ["这一次提交", "that exact commit"],
      ["完整的核验", "a full local proof"],
      ["留下存证", "leaves an attestation"],
      ["维护者审阅", "A maintainer reviews"],
      ["受保护的开发分支", "the protected development branch"],
      ["分别发布", "published to each platform"],
      ["每一个平台", "each platform"],
      ["单独确认", "confirmed on its own"],
    ],
  );
  const DONE = L("改完以后", "The work"),
    OWN = L("单独确认", "Confirmed on its own"),
    EACH = L("每一个平台", "Each platform"),
    left = Math.min(220 - 2, 260 - nameWidth(DONE, 300) / 2),
    right = 1680 + Math.max(70, nameWidth(OWN) / 2, nameWidth(EACH) / 2),
    S = 960 - (left + right) / 2;
  const WX = 260 + S,
    CX = 570 + S,
    AX = 820 + S,
    MX = 1070 + S,
    BX = 1270 + S,
    PX = 1680 + S,
    UP = 410,
    // The two platforms stand well clear of the rail, one above it and one below.
    PY = [345, 655],
    // The maintainer's head is the tallest of the upper row's marks; the commit's ring reaches lowest under the rail.
    above = Math.min(UP - 26, UP - 22, UP + 4 - 2.15 * 15 * 1.15) - NAME_GAP,
    below = rowNameTop([RAIL_Y + 23, RAIL_Y + 19]),
    c = a * named(t, commitAt),
    p = a * named(t, proofAt),
    at = a * named(t, attestAt),
    m = a * named(t, reviewAt),
    br = a * named(t, branchAt),
    each = a * named(t, eachAt);
  // The rail runs on across the band until the platforms are named, then draws back by the film's structural glide to
  // end where it branches to them, 0.3 s before their name's word.
  const back = 1760 + S - BX - 90,
    end = mix(1760 + S, BX + 90, glideShare(t, eachAt - 0.3 - glideTime(back, 0.5), back, 0.5));
  journeyRail(220 + S, end, { alpha: a });
  railFlow(t, 220 + S, end, { alpha: a, longest: 1540 });
  // The finished work under the Agent that finished it, then the commit it became, proved and attested; the Agent
  // steps back as the proof begins and the work moves on, and the name of the finished work leaves with them.
  const finisher = a * (1 - ramp(t, proofAt + 0.3, 0.5));
  // Its diamond is sized apart from the rings of the commit, proof and seal, so it is not read as one of them.
  agent(WX, UP, { size: 1.45, alpha: finisher });
  link(WX, UP + 36, WX, RAIL_Y - 22, { alpha: finisher, end: false });
  nameText(DONE, WX, below, {
    valign: "top",
    width: 300,
    alpha: finisher * named(t, doneAt),
  });
  // The commit is larger than the work's point, so the two are never read as one list of points.
  commitDot(CX, RAIL_Y, { alpha: c, r: 14, picked: c });
  nameText(L("这一次提交", "That exact commit"), CX, below, { valign: "top", alpha: c });
  proofMark(CX, UP, p);
  link(CX, UP + 30, CX, RAIL_Y - 24, { alpha: p, upto: soon(t, proofAt + 0.05, 0.4) });
  nameText(L("完整的核验", "A full local proof"), CX, above, { valign: "bottom", alpha: p });
  link(CX + 30, UP, AX - 34, UP, { alpha: at, upto: soon(t, attestAt + 0.05, 0.5) });
  seal(AX, UP, 22, { alpha: at, color: P.ink });
  nameText(L("存证", "Attestation"), AX, above, { valign: "bottom", alpha: at });
  // Review and authorization on the rail, then the protected branch.
  person(MX, UP + 4, { size: 1.15, alpha: m });
  link(MX, UP + 40, MX, RAIL_Y - 12, { alpha: m, upto: soon(t, reviewAt + 0.05, 0.5) });
  // English names the person and sets what the maintainer does as the name's qualifier, under it.
  if (en) {
    const term = ["A maintainer"],
      qual = ["reviews and authorizes"],
      { height } = termRowLayout(term, qual, 300, false);
    termRow(t, term, [reviewAt], qual, [reviewAt], MX, above - height, {
      width: 300,
      alpha: a,
      align: "center",
      inline: false,
    });
  } else nameText("维护者审阅、授权", MX, above, { valign: "bottom", width: 300, alpha: m });
  commitRow(BX - 60, 40, RAIL_Y, 4, { alpha: br, single: true });
  lock(BX, RAIL_Y - 52, { alpha: br, color: P.ink, size: 0.9 });
  nameText(L("受保护的开发分支", "The protected development branch"), BX, below, {
    valign: "top",
    width: 480,
    alpha: br,
  });
  // Published to each platform along its own link: the platforms and their name come on the words that name them, the
  // links drawing out to them, and each result is ticked on its own.
  PY.forEach((y, i) =>
    link(BX + 102, RAIL_Y, PX - 82, y, {
      route: "hvh",
      mid: BX + 250,
      alpha: each,
      upto: soon(t, eachAt + 0.05 + 0.25 * i, 0.6),
      flow: flowClock(t, 0.5 * i),
      flowEvery: FLOW_EVERY,
    }),
  );
  platforms(PX, PY, { alpha: each, w: 140, h: 76 });
  nameText(EACH, PX, RAIL_Y, { alpha: each });
  PY.forEach((y, i) =>
    check(PX + 34, y + 12, 26, { alpha: a * named(t, ownAt + 0.7 * i), width: 3.5 }),
  );
  nameText(OWN, PX, PY[1] + 38 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, ownAt),
  });
  // The work travels on: proved, reviewed, onto the protected branch and out to publication, each leg by the film's
  // structural glide, so the work keeps one pace on the rail.
  const wx = glideSteps(
    t,
    WX,
    [
      [proofAt, CX + 36],
      [reviewAt, MX + 30],
      [branchAt, BX + 90],
      [publishAt, BX + 70],
    ],
    0.9,
  );
  // It leaves the rail as the links to the platforms draw out from where it stops.
  work(wx, RAIL_Y, a * (1 - ramp(t, Math.max(publishAt + 0.6, eachAt), 0.4)));
}

/* The four things a claim of actual benefit needs, each a mark and its words. */
function needMark(i, x, y, alpha) {
  if (i === 0) tagIcon(x - 26, y, 56, 30, { alpha, color: P.ink });
  else if (i === 1) {
    box(x - 28, y - 22, 56, 44, { stroke: P.ink, alpha, radius: 6, width: 2.5 });
    line(x - 28, y - 8, x + 28, y - 8, { color: P.ink, alpha, width: 2 });
  } else if (i === 2) {
    line(x - 24, y + 10, x + 6, y + 10, { color: P.ink, alpha, width: 5, cap: "butt" });
    line(x - 24, y - 6, x + 24, y - 6, { color: P.ink, alpha, width: 5, cap: "butt" });
  } else clock(x, y, 20, { hand: 0.3, alpha });
}
const NEEDS = () => [
  L("上线的那个版本", "That version"),
  L("真实运行的环境", "The environment"),
  L("原来的做法", "The old way"),
  L("一段时间", "A set period"),
];
const NEED_Y = [350, 450, 550, 650],
  NEED_X = 1340;

/* 08.6, first: the version goes live on the full rail; whether it works stands as a question over its actual benefit,
 * and real use is where it shows. A claim of actual benefit then needs four things: the rail draws back to the
 * question and each need arrives on its words in a column, linked from it. The stations' names under the rail share
 * one line, the line of the third need beside them, and the question's bubble stands high enough on the rail that its
 * tail keeps clear of its name. The picture, from the rail's start to the needs, is centred on the frame. */
export function liveUse(s, t, a) {
  if (a <= 0) return;
  const [liveAt, worksAt, benefitAt, useAt, versionAt, envAt, baseAt, periodAt] = cues(s, [
    ["版本上线", "the version is live"],
    ["管不管用", "whether it works"],
    ["实际效益", "actual benefit"],
    ["实际使用", "real use"],
    ["上线的那个版本", "the version that went live"],
    ["真实运行的环境", "the environment"],
    ["原来的做法", "how things were done before"],
    ["一段时间", "a set period"],
  ]);
  const needs = NEEDS(),
    NEEDS_END = NEED_X + 50 + Math.max(...needs.map((v) => nameWidth(v, 360))),
    S = 960 - (220 - 2 + NEEDS_END) / 2;
  const QX = 1100,
    QY = RAIL_Y - 11,
    TX = 380,
    UX = 740,
    NAMES = NEED_Y[2],
    ats = [versionAt, envAt, baseAt, periodAt],
    back = soon(t, versionAt - 0.2, 0.7),
    v = a * named(t, liveAt),
    q = a * named(t, worksAt),
    u = a * named(t, useAt);
  ctx.save();
  ctx.translate(S, 0);
  // The rail leaves room for the question, and its stretch beyond, reaching nearly as far as the needs will, draws
  // back as the needs arrive.
  journeyRail(220, QX - 40, { alpha: a });
  journeyRail(QX + 40, mix(NEEDS_END - 20, QX + 40, back), { alpha: a });
  railFlow(t, 220, QX - 40, { alpha: a });
  tagIcon(TX - 30, RAIL_Y, 64, 34, { alpha: v, color: P.ink });
  nameText(L("版本上线", "The version"), TX, NAMES, { alpha: v });
  person(UX, RAIL_Y - 66, { size: 1.15, alpha: u });
  link(UX, RAIL_Y - 30, UX, RAIL_Y - 10, { alpha: u, upto: soon(t, useAt + 0.05, 0.4) });
  nameText(L("实际使用", "Real use"), UX, NAMES, { alpha: u });
  askIcon(QX, QY, 30, { alpha: q, color: P.ink });
  nameText(L("管不管用", "Whether it works"), QX, QY - 30 - NAME_GAP, {
    valign: "bottom",
    alpha: q,
  });
  nameText(L("实际效益", "Actual benefit"), QX, NAMES, { alpha: a * named(t, benefitAt) });
  needs.forEach((v2, i) => {
    const y = NEED_Y[i],
      n = a * named(t, ats[i]);
    link(QX + 34, RAIL_Y, NEED_X - 44, y, {
      route: "hvh",
      mid: QX + 150,
      alpha: n,
      upto: soon(t, ats[i] + 0.05, 0.6),
      flow: flowClock(t, i / 4),
      flowEvery: FLOW_EVERY,
    });
    needMark(i, NEED_X, y, n);
    nameText(v2, NEED_X + 50, y, {
      align: "left",
      width: 360,
      alpha: a * listIn(t, ats, i),
      set: "08.6:needs",
    });
  });
  ctx.restore();
}

/* The journey seen whole: its five stretches along the rail, the ones not yet accepted drawn dashed. The dropped
 * push's stretch is centred on the frame and the handover and the designed path stand at one distance either side, so
 * the three names and the documents under them stand balanced about the frame's axis. */
const STRETCHES = [
  [240, 410],
  [450, 630],
  [670, 840],
  [880, 1040],
  [1080, 1680],
];

/* 08.6, second: the whole journey on one rail, the work at the start of its last stretch, named "from here on" over
 * it; from here on the path is the one ETHOS is designed for, drawn dashed, and the handover between Agents and the
 * dropped push each turn dashed on their words. Its own documents, on their words, stand on the frame's axis under the
 * dropped push and are linked up to the name of each stretch, and what they say, that none has yet completed
 * acceptance, hangs under them on its words. */
export function overview(s, t, a) {
  if (a <= 0) return;
  const [hereAt, pathAt, docsAt, handoverAt, droppedAt, acceptAt] = cues(s, [
    ["从这里往后", "From here on"],
    ["设计要走通的一段路", "ETHOS is designed for"],
    ["它的文档也写明", "its own documents"],
    ["换 Agent 接手", "the handover between Agents"],
    ["断线再推", "the dropped push"],
    ["都还没有完成验收", "has not yet completed acceptance"],
  ]);
  const h = a * named(t, handoverAt),
    dp = a * named(t, droppedAt),
    acc = a * named(t, acceptAt),
    [A, B, C, E, D] = STRETCHES;
  // The stretches already walked are one stroke, so the name at its end names them all; the handover and the dropped
  // push leave that stroke on their words and stand dashed under their own names.
  const solid = [A, C, ...(t < handoverAt - 0.15 ? [B] : []), ...(t < droppedAt - 0.15 ? [E] : [])];
  stroke(
    () =>
      solid.forEach(([x0, x1]) => {
        ctx.moveTo(x0, RAIL_Y);
        ctx.lineTo(x1, RAIL_Y);
      }),
    { color: P.line, alpha: a, width: 4 },
  );
  journeyRail(B[0], B[1], { alpha: h, dash: [12, 10] });
  journeyRail(E[0], E[1], { alpha: dp, dash: [12, 10] });
  journeyRail(D[0], D[1], { alpha: a, dash: [12, 10] });
  railFlow(t, D[0], D[1], { alpha: a });
  // "From here on" names the work's point, where the dashed stretch begins, so it stands over that point.
  const HERE = D[0] + 40;
  work(HERE, RAIL_Y, a);
  nameText(L("从这里往后", "From here on"), HERE, RAIL_Y - 30, {
    valign: "bottom",
    alpha: a * named(t, hereAt),
  });
  // English names the path as its clause begins, within its words' lead, so the overview is full by 70% of 08.5.
  const db = nameText(
    L("设计要走通的一段路", "The path ETHOS is designed for"),
    (D[0] + D[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      alpha: a * ramp(t, pathAt - (en ? 1.35 : 0.15), 0.4),
    },
  );
  const hb = nameText(
    L("换 Agent 接手那一段", "The handover between Agents"),
    (B[0] + B[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      width: 300,
      alpha: h,
    },
  );
  const eb = nameText(L("断线再推那一段", "The dropped push"), (E[0] + E[1]) / 2, RAIL_Y + 30, {
    valign: "top",
    alpha: dp,
  });
  // No stretch has completed acceptance, as its own documents say. The documents stand on the frame's axis, under the
  // dropped push, linked up to the name of each stretch: to the stretch ETHOS is designed for, already named, as they
  // arrive, and to the handover and the dropped push as each is named, so they never stand alone; each link leaves them
  // as the rail's links leave their marks, so all are one mark. What they say hangs one gap under them on its words.
  const NY = 700,
    BX = (B[0] + B[1]) / 2,
    DX = (D[0] + D[1]) / 2,
    AXIS = (E[0] + E[1]) / 2,
    DOC = [40, 52],
    docs = a * named(t, docsAt);
  docMark(AXIS - DOC[0] / 2, NY - DOC[1] / 2, DOC[0], DOC[1], { alpha: docs, rows: 3 });
  link(AXIS + DOC[0] / 2 + 10, NY, DX, db.bottom + 12, {
    route: "hv",
    alpha: docs,
    upto: soon(t, docsAt + 0.05, 0.6),
  });
  link(AXIS - DOC[0] / 2 - 10, NY, BX, hb.bottom + 12, {
    route: "hv",
    alpha: h,
    upto: soon(t, handoverAt + 0.05, 0.6),
  });
  link(AXIS, NY - DOC[1] / 2 - 10, AXIS, eb.bottom + 12, {
    alpha: dp,
    upto: soon(t, droppedAt + 0.05, 0.4),
  });
  nameText(L("尚未完成验收", "Not yet accepted"), AXIS, NY + DOC[1] / 2 + NAME_GAP, {
    valign: "top",
    alpha: acc,
  });
}
