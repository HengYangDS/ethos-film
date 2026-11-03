/* 08.4-08.5 the requirement's life from proof to real use: the finished work is proved on its commit and leaves an
 * attestation, is reviewed and authorized into the protected development branch and published to each platform on
 * its own; once live, its actual benefit shows only in real use and needs four things; then the journey is seen
 * whole, with the stretches not yet accepted drawn dashed. */

import { link } from "../../drawing/links.js";
import { ctx } from "../../canvas.js";
import { box, line, measure, ring, stroke } from "../../drawing/strokes.js";
import { agent, check, clock, documentIcon, lock, person, seal } from "../../drawing/symbols.js";
import { askIcon, commitDot, tagIcon } from "../../drawing/workspace.js";
import { commitRow } from "../../drawing/history.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { nameWidth } from "../p07/example.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { RAIL_Y, journeyRail, platforms, railFlow, work } from "./rail.js";

/* The proof: a check in its ring, the executed check of one commit. */
function proofMark(x, y, alpha) {
  ring(x, y, 26, { color: P.ink, alpha, width: 2.5 });
  check(x, y + 1, 26, { alpha, width: 3.5 });
}

/* 08.4. The finished work stands at the rail's start; on its words the commit it became is proved, the proof standing
 * over it and leaving its attestation beside; the maintainer reviews and authorizes it on the rail, and it joins the
 * protected development branch under its lock. It is then published along a link to each platform, the two drawn as
 * one group, and each platform's result is ticked on its own, one after the other. The names over the upper row, the
 * proof's, the attestation's and the maintainer's, end on one line clear of the tallest of their marks, the names
 * under the rail hang from one line clear of the commit's ring, and neighbouring names keep at least a word's space
 * between them. The picture, from the finished work's name to the platforms', is centred on the frame. */
export function release(s, t, a) {
  if (a <= 0) return;
  const [doneAt, commitAt, proofAt, attestAt, reviewAt, branchAt, publishAt, ownAt] = cues(s, [
    ["改完以后", "When the work is committed"],
    ["这一次提交", "that exact commit"],
    ["完整的核验", "a full local proof"],
    ["留下存证", "leaves an attestation"],
    ["维护者审阅", "A maintainer reviews"],
    ["受保护的开发分支", "the protected development branch"],
    ["分别发布", "published to each platform"],
    ["单独确认", "confirmed on its own"],
  ]);
  const DONE = L("改完以后", "When the work is committed"),
    OWN = L("单独确认", "confirmed on its own"),
    EACH = L("每一个平台", "each platform"),
    left = Math.min(220 - 2, 260 - nameWidth(DONE, 300) / 2),
    right = 1600 + Math.max(70, nameWidth(OWN) / 2, nameWidth(EACH) / 2),
    S = 960 - (left + right) / 2;
  const WX = 260 + S,
    CX = 570 + S,
    AX = 820 + S,
    MX = 1070 + S,
    BX = 1270 + S,
    PX = 1600 + S,
    UP = 410,
    // The two platforms stand well clear of the rail, one above it and one below.
    PY = [360, 640],
    // The maintainer's head is the tallest of the upper row's marks; the commit's ring reaches lowest under the rail.
    above = Math.min(UP - 26, UP - 22, UP + 4 - 2.15 * 15 * 1.15) - NAME_GAP,
    below = rowNameTop([RAIL_Y + 23, RAIL_Y + 19]),
    flow = (voiceTime(t) * 0.4) % 1,
    c = a * named(t, commitAt),
    p = a * named(t, proofAt),
    at = a * named(t, attestAt),
    m = a * named(t, reviewAt),
    br = a * named(t, branchAt),
    pub = a * named(t, publishAt);
  // The rail runs on across the band until the work is published, then ends where it branches to the platforms.
  const end = mix(1680 + S, BX + 90, soon(t, publishAt - 0.8, 0.5));
  journeyRail(220 + S, end, { alpha: a });
  railFlow(t, 220 + S, end, { alpha: a });
  // The finished work under the Agent that finished it, then the commit it became, proved and attested; the Agent
  // steps back as the proof begins.
  const finisher = a * (1 - ramp(t, proofAt + 0.3, 0.5));
  // Its diamond is sized apart from the rings of the commit, proof and seal, so it is not read as one of them.
  agent(WX, UP, { size: 1.45, alpha: finisher });
  link(WX, UP + 36, WX, RAIL_Y - 22, { alpha: finisher, end: false });
  nameText(DONE, WX, below, {
    valign: "top",
    width: 300,
    alpha: a * named(t, doneAt),
  });
  // The commit is larger than the work's point, so the two are never read as one list of points.
  commitDot(CX, RAIL_Y, { alpha: c, r: 14, picked: c });
  nameText(L("这一次提交", "that exact commit"), CX, below, { valign: "top", alpha: c });
  proofMark(CX, UP, p);
  link(CX, UP + 30, CX, RAIL_Y - 24, { alpha: p, upto: soon(t, proofAt + 0.05, 0.4) });
  nameText(L("完整的核验", "a full local proof"), CX, above, { valign: "bottom", alpha: p });
  link(CX + 30, UP, AX - 34, UP, { alpha: at, upto: soon(t, attestAt + 0.05, 0.5) });
  seal(AX, UP, 22, { alpha: at, color: P.ink });
  nameText(L("存证", "attestation"), AX, above, { valign: "bottom", alpha: at });
  // Review and authorization on the rail, then the protected branch.
  person(MX, UP + 4, { size: 1.15, alpha: m });
  link(MX, UP + 40, MX, RAIL_Y - 12, { alpha: m, upto: soon(t, reviewAt + 0.05, 0.5) });
  nameText(L("维护者审阅、授权", ["A maintainer reviews", "and authorizes"]), MX, above, {
    valign: "bottom",
    width: 300,
    alpha: m,
  });
  commitRow(BX - 60, 40, RAIL_Y, 4, { alpha: br, single: true });
  lock(BX, RAIL_Y - 52, { alpha: br, color: P.ink, size: 0.9 });
  nameText(L("受保护的开发分支", "the protected development branch"), BX, below, {
    valign: "top",
    width: 300,
    alpha: br,
  });
  // Published to each platform along its own link, each result ticked on its own.
  PY.forEach((y, i) =>
    link(BX + 102, RAIL_Y, PX - 82, y, {
      route: "hvh",
      mid: BX + 210,
      alpha: pub,
      upto: soon(t, publishAt + 0.05 + 0.25 * i, 0.6),
      flow: (flow + 0.5 * i) % 1,
    }),
  );
  platforms(PX, PY, { alpha: pub, w: 140, h: 76 });
  nameText(EACH, PX, RAIL_Y, { alpha: pub });
  PY.forEach((y, i) =>
    check(PX + 34, y + 12, 26, { alpha: a * named(t, ownAt + 0.7 * i), width: 3.5 }),
  );
  nameText(OWN, PX, PY[1] + 38 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, ownAt),
  });
  // The work travels on: proved, reviewed, onto the protected branch and out to publication.
  // Each leg takes at least 0.9 s and longer in proportion to its length, so the work keeps one pace on the rail.
  let wx = WX,
    from = WX;
  [
    [proofAt, CX + 36],
    [reviewAt, MX + 30],
    [branchAt, BX + 90],
    [publishAt, BX + 70],
  ].forEach(([cueAt, to]) => {
    wx = mix(wx, to, soon(t, cueAt + 0.05, Math.max(0.9, Math.abs(to - from) / 390)));
    from = to;
  });
  work(wx, RAIL_Y, a * (1 - ramp(t, publishAt + 0.6, 0.4)));
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
  L("上线的那个版本", "the version"),
  L("真实运行的环境", "the environment"),
  L("和原来的做法比", "how things were done before"),
  L("一段时间", "a set period"),
];
const NEED_Y = [350, 450, 550, 650],
  NEED_X = 1340;

/* 08.5, first: the version goes live on the full rail; whether it works stands as a question over its actual benefit,
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
    ["和原来的做法比", "how things were done before"],
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
    flow = (voiceTime(t) * 0.4) % 1,
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
  nameText(L("版本上线", "the version is live"), TX, NAMES, { alpha: v });
  person(UX, RAIL_Y - 66, { size: 1.15, alpha: u });
  link(UX, RAIL_Y - 30, UX, RAIL_Y - 10, { alpha: u, upto: soon(t, useAt + 0.05, 0.4) });
  nameText(L("实际使用", "real use"), UX, NAMES, { alpha: u });
  askIcon(QX, QY, 30, { alpha: q, color: P.ink });
  nameText(L("管不管用", "whether it works"), QX, QY - 30 - NAME_GAP, {
    valign: "bottom",
    alpha: q,
  });
  nameText(L("实际效益", "actual benefit"), QX, NAMES, { alpha: a * named(t, benefitAt) });
  needs.forEach((v2, i) => {
    const y = NEED_Y[i],
      n = a * named(t, ats[i]);
    link(QX + 34, RAIL_Y, NEED_X - 44, y, {
      route: "hvh",
      mid: QX + 150,
      alpha: n,
      upto: soon(t, ats[i] + 0.05, 0.6),
      flow: (flow + i / 4) % 1,
    });
    needMark(i, NEED_X, y, n);
    nameText(v2, NEED_X + 50, y, {
      align: "left",
      width: 360,
      alpha: a * listIn(t, ats, i),
      set: "08.5:needs",
    });
  });
  ctx.restore();
}

/* The journey seen whole: its four stretches along the rail, the ones not yet accepted drawn dashed. */
const STRETCHES = [
  [240, 600],
  [640, 820],
  [860, 1200],
  [1240, 1680],
];

/* 08.5, second: the whole journey on one rail, the work at the start of its last stretch, named "from here on" over
 * it; from here on the path is the one ETHOS is designed for, drawn dashed, and the handover between Agents turns
 * dashed on its words. Its own documents, on their words, and one name beside them say neither has yet completed
 * acceptance, linked to both. */
export function overview(s, t, a) {
  if (a <= 0) return;
  const [hereAt, pathAt, docsAt, handoverAt, acceptAt] = cues(s, [
    ["从这里往后", "From here on"],
    ["设计要走通的一段路", "ETHOS is designed for"],
    ["它的文档也写明", "its own documents"],
    ["换 Agent 接手那一段", "the handover between Agents"],
    ["都还没有完成验收", "has not yet completed acceptance"],
  ]);
  const h = a * named(t, handoverAt),
    acc = a * named(t, acceptAt),
    [A, B, C, D] = STRETCHES;
  // The stretches already walked are one stroke, so the name at its end names them all; the handover leaves that
  // stroke on its words and stands dashed under its own name.
  const solid = t < handoverAt - 0.15 ? [A, B, C] : [A, C];
  stroke(
    () =>
      solid.forEach(([x0, x1]) => {
        ctx.moveTo(x0, RAIL_Y);
        ctx.lineTo(x1, RAIL_Y);
      }),
    { color: P.line, alpha: a, width: 4 },
  );
  journeyRail(B[0], B[1], { alpha: h, dash: [12, 10] });
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
    L("设计要走通的一段路", "ETHOS is designed for"),
    (D[0] + D[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      alpha: a * ramp(t, pathAt - (en ? 1.35 : 0.15), 0.4),
    },
  );
  const hb = nameText(
    L("换 Agent 接手那一段", "the handover between Agents"),
    (B[0] + B[1]) / 2,
    RAIL_Y + 30,
    {
      valign: "top",
      width: 300,
      alpha: h,
    },
  );
  // Neither stretch has completed acceptance, as its own documents say: the documents on their words, then one name
  // beside them, the two as one row linked up to the names of both stretches.
  const NY = 700,
    accept = L("尚未完成验收", "has not yet completed acceptance"),
    DOC = [40, 52],
    row = DOC[0] + NAME_GAP + measure(accept),
    x0 = 1100 - row / 2;
  documentIcon(x0, NY - DOC[1] / 2, DOC[0], DOC[1], { alpha: a * named(t, docsAt), rows: 3 });
  nameText(accept, x0 + DOC[0] + NAME_GAP, NY, { align: "left", alpha: acc });
  [
    [x0 - 14, (B[0] + B[1]) / 2, hb.bottom + 12],
    [x0 + row + 14, (D[0] + D[1]) / 2, db.bottom + 12],
  ].forEach(([x1, x2, y2]) =>
    link(x1, NY, x2, y2, { route: "hv", alpha: acc, upto: soon(t, acceptAt + 0.05, 0.6) }),
  );
}
