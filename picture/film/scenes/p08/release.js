/* 08.4-08.5 the requirement's life from proof to real use: the finished work is proved on its commit and leaves an
 * attestation, is reviewed and authorized into the protected development branch and published to each platform on
 * its own; once live, its actual benefit shows only in real use and needs four things; then the journey is seen
 * whole, with the stretches not yet accepted drawn dashed. */

import { link } from "../../drawing/links.js";
import { ctx } from "../../canvas.js";
import { box, line, measure, ring, stroke } from "../../drawing/strokes.js";
import { agent, check, clock, lock, person, seal } from "../../drawing/symbols.js";
import { askIcon, commitDot, tagIcon } from "../../drawing/workspace.js";
import { commitRow } from "../../drawing/history.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText } from "../../naming/names.js";
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
 * one group, and each platform's result is ticked on its own, one after the other. */
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
  const CX = 520,
    AX = 720,
    MX = 960,
    BX = 1170,
    PX = 1500,
    UP = 410,
    PY = [400, 600],
    flow = (voiceTime(t) * 0.4) % 1,
    c = a * named(t, commitAt),
    p = a * named(t, proofAt),
    at = a * named(t, attestAt),
    m = a * named(t, reviewAt),
    br = a * named(t, branchAt),
    pub = a * named(t, publishAt);
  // The rail runs on across the band until the work is published, then ends where it branches to the platforms.
  const end = mix(1680, 1260, soon(t, publishAt - 0.8, 0.5));
  journeyRail(220, end, { alpha: a });
  railFlow(t, 220, end, { alpha: a });
  // The finished work under the Agent that finished it, then the commit it became, proved and attested; the Agent
  // steps back as the proof begins.
  const finisher = a * (1 - ramp(t, proofAt + 0.3, 0.5));
  // Its diamond is sized apart from the rings of the commit, proof and seal, so it is not read as one of them.
  agent(260, UP, { size: 1.45, alpha: finisher });
  link(260, UP + 36, 260, RAIL_Y - 22, { alpha: finisher, end: false });
  nameText(L("改完以后", "When the work is committed"), 260, RAIL_Y + 30, {
    valign: "top",
    width: 300,
    alpha: a * named(t, doneAt),
  });
  // The commit is larger than the work's point, so the two are never read as one list of points.
  commitDot(CX, RAIL_Y, { alpha: c, r: 14, picked: c });
  nameText(L("这一次提交", "that exact commit"), CX, RAIL_Y + 30, { valign: "top", alpha: c });
  proofMark(CX, UP, p);
  link(CX, UP + 30, CX, RAIL_Y - 24, { alpha: p, upto: soon(t, proofAt + 0.05, 0.4) });
  nameText(L("完整的核验", "a full local proof"), CX, UP - 40, { valign: "bottom", alpha: p });
  link(CX + 30, UP, AX - 34, UP, { alpha: at, upto: soon(t, attestAt + 0.05, 0.5) });
  seal(AX, UP, 22, { alpha: at, color: P.ink });
  nameText(L("存证", "attestation"), AX + 36, UP, { align: "left", alpha: at });
  // Review and authorization on the rail, then the protected branch.
  person(MX, UP + 4, { size: 1.15, alpha: m });
  link(MX, UP + 40, MX, RAIL_Y - 12, { alpha: m, upto: soon(t, reviewAt + 0.05, 0.5) });
  nameText(L("维护者审阅、授权", ["A maintainer reviews", "and authorizes"]), MX, UP - 40, {
    valign: "bottom",
    width: 300,
    alpha: m,
  });
  commitRow(BX - 60, 40, RAIL_Y, 4, { alpha: br, single: true });
  lock(BX, RAIL_Y - 52, { alpha: br, color: P.ink, size: 0.9 });
  nameText(L("受保护的开发分支", "the protected development branch"), BX, RAIL_Y + 30, {
    valign: "top",
    width: 300,
    alpha: br,
  });
  // Published to each platform along its own link, each result ticked on its own.
  PY.forEach((y, i) =>
    link(1272, RAIL_Y, PX - 82, y, {
      route: "hvh",
      mid: 1380,
      alpha: pub,
      upto: soon(t, publishAt + 0.05 + 0.25 * i, 0.6),
      flow: (flow + 0.5 * i) % 1,
    }),
  );
  platforms(PX, PY, { alpha: pub, w: 140, h: 76 });
  nameText(L("每一个平台", "each platform"), PX, RAIL_Y, { alpha: pub });
  PY.forEach((y, i) =>
    check(PX + 34, y + 12, 26, { alpha: a * named(t, ownAt + 0.7 * i), width: 3.5 }),
  );
  nameText(L("单独确认", "confirmed on its own"), PX, PY[1] + 38 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, ownAt),
  });
  // The work travels on: proved, reviewed, onto the protected branch and out to publication.
  let wx = 260;
  [
    [proofAt, CX + 36],
    [reviewAt, MX + 30],
    [branchAt, BX + 90],
    [publishAt, 1240],
  ].forEach(([cueAt, to]) => (wx = mix(wx, to, soon(t, cueAt + 0.05, 0.9))));
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
 * question and each need arrives on its words in a column, linked from it. */
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
  const QX = 1100,
    TX = 380,
    UX = 740,
    ats = [versionAt, envAt, baseAt, periodAt],
    back = soon(t, versionAt - 0.2, 0.7),
    flow = (voiceTime(t) * 0.4) % 1,
    v = a * named(t, liveAt),
    q = a * named(t, worksAt),
    u = a * named(t, useAt);
  // The rail leaves room for the question, and its stretch beyond draws back as the needs arrive.
  journeyRail(220, QX - 40, { alpha: a });
  journeyRail(QX + 40, mix(1680, QX + 40, back), { alpha: a });
  railFlow(t, 220, QX - 40, { alpha: a });
  tagIcon(TX - 30, RAIL_Y, 64, 34, { alpha: v, color: P.ink });
  nameText(L("版本上线", "the version is live"), TX, RAIL_Y + 34, { valign: "top", alpha: v });
  person(UX, RAIL_Y - 66, { size: 1.15, alpha: u });
  link(UX, RAIL_Y - 30, UX, RAIL_Y - 10, { alpha: u, upto: soon(t, useAt + 0.05, 0.4) });
  nameText(L("实际使用", "real use"), UX, RAIL_Y + 34, { valign: "top", alpha: u });
  askIcon(QX, RAIL_Y - 4, 30, { alpha: q, color: P.ink });
  nameText(L("管不管用", "whether it works"), QX, RAIL_Y - 50, { valign: "bottom", alpha: q });
  nameText(L("实际效益", "actual benefit"), QX, RAIL_Y + 44, {
    valign: "top",
    alpha: a * named(t, benefitAt),
  });
  NEEDS().forEach((v2, i) => {
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
}

/* The journey seen whole: its four stretches along the rail, the ones not yet accepted drawn dashed. */
const STRETCHES = [
  [240, 600],
  [640, 820],
  [860, 1200],
  [1240, 1680],
];

/* 08.5, second: the whole journey on one rail, the work at the start of its last stretch; from here on the path is the
 * one ETHOS is designed for, drawn dashed, and the handover between Agents turns dashed on its words. One name
 * beneath says neither has yet completed acceptance, linked to both. */
export function overview(s, t, a) {
  if (a <= 0) return;
  const [hereAt, pathAt, handoverAt, acceptAt] = cues(s, [
    ["从这里往后", "From here on"],
    ["设计要走通的一段路", "ETHOS is designed for"],
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
  work(D[0] + 40, RAIL_Y, a);
  nameText(L("从这里往后", "From here on"), (C[1] + D[0]) / 2, RAIL_Y - 30, {
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
  // Neither stretch has completed acceptance: one name beneath, linked up to the names of both.
  const NY = 700,
    accept = L("尚未完成验收", "has not yet completed acceptance"),
    half = measure(accept) / 2;
  nameText(accept, 1100, NY, { alpha: acc });
  [
    [1100 - half - 14, (B[0] + B[1]) / 2, hb.bottom + 12],
    [1100 + half + 14, (D[0] + D[1]) / 2, db.bottom + 12],
  ].forEach(([x1, x2, y2]) =>
    link(x1, NY, x2, y2, { route: "hv", alpha: acc, upto: soon(t, acceptAt + 0.05, 0.6) }),
  );
}
