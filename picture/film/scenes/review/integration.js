/* 11 review and integration. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { commitRow } from "../../drawing/history.js";
import { laneGroup } from "../../drawing/lanes.js";
import { along, link, rounded } from "../../drawing/links.js";
import { box, fill, line, measure, path, ring, stroke } from "../../drawing/strokes.js";
import { check, cross, documentIcon, lock, person, seal } from "../../drawing/symbols.js";
import { commitDot, terminalIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText } from "../../naming/names.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* Commits drawn as one mark: each a ground disc in its own ring, all in one fill and one stroke, so a group of commits
 * reads as the one thing it is named as rather than a list waiting for names. */
function s11Commits(points, { alpha = 1, color = P.ink, r = 11, width = 3 } = {}) {
  if (alpha < 0.01 || !points.length) return;
  const discs = () =>
    points.forEach(([x, y]) => {
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    });
  fill(discs, { color: P.ground, alpha });
  stroke(discs, { color, alpha, width });
}
/* A branch from its first commit to its last, line and commits in one stroke over one fill of discs, so the branch and
 * its commits are one mark. */
function s11Branch(xs, y, { alpha = 1, color = P.authority, r = 12, width = 4 } = {}) {
  if (alpha < 0.01) return;
  const discs = () =>
    xs.forEach((x) => {
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    });
  fill(discs, { color: P.ground, alpha });
  stroke(
    () => {
      ctx.moveTo(xs[0] + r, y);
      ctx.lineTo(xs.at(-1) - r, y);
      discs();
    },
    { color, alpha, width },
  );
}
scenes["11"] = function (s, t) {
  const [waitAt, exact, newOnes] = cues(s, [
    ["审阅不用等", "Review does not"],
    ["明确指定的那一次提交", "one exact commit"],
    ["新带进来的", "the new commits"],
  ]);
  const [lanesAt, candAt, oneAt, toReviewer] = cues(s, [
    ["几条通道的改动", "Lanes can combine"],
    ["候选分支", "a candidate branch"],
    ["某一次提交单独拿出来", "one exact commit can"],
    ["交给审阅者", "for review"],
  ]);
  const [protectAt, devAt, mainAt, holdsAt, releaseAt] = cues(s, [
    ["ETHOS 只保护两个分支", "ETHOS protects"],
    ["dev 和", "dev, which"],
    ["main。", "main, which"],
    ["dev 存放", "holds accepted work"],
    ["main 用来发布", "carries releases"],
  ]);
  const [noWrite, mrAt, maintAt, acceptAt] = cues(s, [
    ["对这两个分支没有写入权限", "Someone without"],
    ["合并请求", "a merge request"],
    ["维护者重新核对", "a maintainer"],
    ["接受审阅过的", "accept the reviewed"],
  ]);
  const [judgeAt, trustedAt, selfAt] = cues(s, [
    ["一项改动还没被接受", "Work that has not"],
    ["之前已经信任的规则", "the rules that were"],
    ["不能自己给自己盖章", "cannot approve itself"],
  ]);
  const [ciAt, pushAt, ciBoxAt, obsAt, noneAt] = cues(s, [
    ["每次推送代码", "Continuous integration"],
    ["每次推送代码", "the service that"],
    ["持续集成服务", "Continuous integration"],
    ["观察结果", "observes"],
    ["不持有租约", "without holding"],
  ]);
  const stageA = stageOut(t, lanesAt),
    stageB = stageIn(t, lanesAt) * stageOut(t, protectAt),
    stageC = stageIn(t, protectAt) * stageOut(t, noWrite),
    stageD = stageIn(t, noWrite) * stageOut(t, judgeAt),
    stageE = stageIn(t, judgeAt) * stageOut(t, ciAt),
    stageF = stageIn(t, ciAt);
  // Review need not wait: the reviewer and a proof still running stand apart from the first words. The review looks at
  // one exact commit and what it brings in, so the branch rises beneath them on those words, its head ringed and its
  // new commits lit.
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 360),
      GY = mix(470, 360, soon(t, exact - 0.3, 0.5)),
      Y = 710,
      by = 540,
      pick = g * ramp(t, exact - 0.15, 0.4),
      nw = g * ramp(t, newOnes - 0.15, 0.4);
    person(700, GY, { alpha: g, size: 1.2, color: P.authority });
    nameText(L("审阅不用等", "Review need not wait"), 700, GY + 50, {
      valign: "top",
      color: P.authority,
      alpha: g * named(t, waitAt),
    });
    const PX = 1240;
    terminalIcon(PX - 130, GY - 55, 260, 110, { alpha: g, command: "prove" });
    nameText(L("证明还在跑", "A proof still running"), PX, GY + 55 + NAME_GAP, {
      valign: "top",
      alpha: g * named(t, waitAt),
    });
    const pq = (voiceTime(t) * 0.3) % 1;
    line(PX - 110, GY + 40, mix(PX - 110, PX + 110, pq), GY + 40, {
      color: P.evidence,
      alpha: g,
      width: 3,
    });
    const xs = [560, 710, 860, 1010],
      heads = [860, 1010, 1160];
    line(xs[0], Y, xs.at(-1), Y, { color: P.ink, alpha: pick, width: 2.5 });
    s11Commits(
      xs.map((x) => [x, Y]),
      { alpha: pick, color: P.ink },
    );
    link(xs[1], Y - 11, heads[0] - 11, by, { route: "vh", alpha: pick, color: P.line, end: false });
    line(heads[0], by, heads.at(-1), by, {
      color: blend(P.line, P.evidence, nw),
      alpha: pick,
      width: 2.5,
    });
    s11Commits(
      heads.map((x) => [x, by]),
      { alpha: pick, color: blend(P.ink, P.evidence, nw) },
    );
    ring(heads.at(-1), by, 20, { color: P.evidence, alpha: pick, width: 2.5 });
    nameText(L("明确指定的那一次提交", "One exact commit"), heads.at(-1) + 34, by, {
      align: "left",
      color: P.evidence,
      alpha: g * named(t, exact),
    });
    nameText(L("新带进来的提交", "The new commits it brings"), heads[1], by + 28, {
      valign: "top",
      alpha: g * named(t, newOnes),
      size: NOTE,
      color: P.muted,
    });
  }
  // Lanes combine on a local candidate branch, or one exact commit goes to a reviewer on its own.
  if (stageB > 0) {
    const ys = [340, 470, 600],
      X0 = 240,
      MX = mix(1690, 900, soon(t, candAt - 0.45, 0.6)),
      Y = 470,
      EX = 1520,
      q = voiceTime(t) * 0.4,
      cand = stageB * ramp(t, candAt - 0.15, 0.4),
      one = stageB * ramp(t, oneAt - 0.15, 0.4),
      rev = stageB * ramp(t, toReviewer - 0.15, 0.4);
    laneGroup(X0, MX - 150, ys, { alpha: stageB, q });
    ys.forEach((y) =>
      link(MX - 150, y, MX, Y, {
        route: "hvh",
        mid: MX - 70,
        alpha: cand,
        upto: soon(t, candAt, 0.5),
      }),
    );
    nameText(L("几条通道", "Lanes"), X0, ys[0] - 26 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      alpha: stageB,
    });
    line(MX, Y, EX - 50, Y, { color: P.authority, alpha: cand, width: 4 });
    [0, 1, 2].forEach((i) =>
      commitDot(MX + 90 + i * 150, Y, { alpha: cand, color: P.authority, r: 11 }),
    );
    nameText(L("候选分支", "A candidate branch"), MX + 240, Y - 34, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB * named(t, candAt),
    });
    nameText(L("本地专门做集成", "Local, for bringing work together"), MX + 240, Y + 30, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageB * named(t, candAt),
    });
    commitDot(1000, 650, { alpha: one, color: P.evidence, picked: 1, r: 13 });
    nameText(L("某一次提交单独送审", "One commit, put forward alone"), 1000, 700, {
      valign: "top",
      alpha: stageB * named(t, oneAt),
    });
    link(1034, 650, 1340, 650, { alpha: rev, upto: soon(t, toReviewer, 0.5), color: P.evidence });
    person(1400, 650, { alpha: rev, size: 1, color: P.authority });
    nameText(L("审阅者", "A reviewer"), 1400, 692, {
      valign: "top",
      alpha: stageB * named(t, toReviewer),
    });
  }
  // Of all the branches, only two are protected: dev, which holds accepted work, and main, which carries releases.
  // Each takes its colour and its name on its words.
  if (stageC > 0) {
    const X0 = 480,
      X1 = 1260,
      ys = [380, 470, 560, 650],
      dv = stageC * ramp(t, devAt - 0.15, 0.4),
      mn = stageC * ramp(t, mainAt - 0.15, 0.4);
    stroke(
      () =>
        ys.forEach((y) => {
          ctx.moveTo(X0, y);
          ctx.lineTo(mix(X0, X1, soon(t, protectAt + 0.18, 0.6)), y);
        }),
      { color: P.muted, alpha: stageC, width: 3 },
    );
    nameText(L("只保护两个分支", "Only two are protected"), 960, 300, {
      color: P.authority,
      alpha: stageC,
    });
    lock(960 - measure(L("只保护两个分支", "Only two are protected")) / 2 - 40, 300, {
      alpha: stageC,
      color: P.authority,
    });
    const commits = [X0, X0 + 260, X0 + 520, X1];
    s11Branch(commits, ys[0], { alpha: dv, color: P.authority });
    s11Branch(commits, ys[2], { alpha: mn, color: P.evidence });
    nameText("dev", X0 - 12 - NAME_GAP, ys[0], { align: "right", color: P.authority, alpha: dv });
    nameText("main", X0 - 12 - NAME_GAP, ys[2], { align: "right", color: P.evidence, alpha: mn });
    nameText(L("存放已经接受的改动", "Holds accepted work"), X1 + 12 + NAME_GAP, ys[0], {
      align: "left",
      alpha: stageC * named(t, holdsAt),
      set: "protected",
    });
    nameText(L("用来发布", "Carries releases"), X1 + 12 + NAME_GAP, ys[2], {
      align: "left",
      alpha: stageC * named(t, releaseAt),
      set: "protected",
    });
  }
  // Without write access, a change comes as a merge request; a maintainer checks the reviewed commit again and may accept
  // it onto the protected line.
  if (stageD > 0) {
    const Y = 470,
      PX = 320,
      MRX = 800,
      MX = 1200,
      BX = 1560,
      q = (voiceTime(t) * 0.45) % 1,
      mr = stageD * ramp(t, mrAt - 0.15, 0.4),
      mt = stageD * ramp(t, maintAt - 0.15, 0.4),
      ac = stageD * ramp(t, acceptAt - 0.15, 0.4);
    person(PX, Y - 6, { alpha: stageD, size: 1.6 });
    nameText(L("没有写入权限", "No write access"), PX, Y + 54 + NAME_GAP, {
      valign: "top",
      alpha: stageD,
    });
    link(PX + 50, Y, MRX - 100, Y, { alpha: mr, upto: soon(t, mrAt, 0.5), flow: q });
    box(MRX - 100, Y - 66, 200, 132, {
      fill: P.row,
      stroke: P.ink,
      alpha: mr,
      radius: 12,
      width: 2.5,
    });
    commitDot(MRX - 40, Y, { alpha: mr, color: P.evidence, r: 12 });
    link(MRX - 16, Y, MRX + 60, Y, { alpha: mr, color: P.muted });
    nameText(L("合并请求", "A merge request"), MRX, Y + 66 + NAME_GAP, {
      valign: "top",
      alpha: stageD * named(t, mrAt),
    });
    link(MRX + 100, Y, MX - 50, Y, { alpha: mt, upto: soon(t, maintAt, 0.5), flow: q });
    person(MX, Y - 6, { alpha: mt, size: 1.6, color: P.authority });
    check(MX + 62, Y - 44, 30, { alpha: mt * ramp(t, acceptAt - 0.3, 0.4), color: P.evidence });
    nameText(L("维护者重新核对", "A maintainer checks again"), MX, Y + 54 + NAME_GAP, {
      valign: "top",
      width: 260,
      color: P.authority,
      alpha: stageD * named(t, maintAt),
    });
    link(MX + 50, Y, BX - 12, Y, { alpha: ac, upto: soon(t, acceptAt, 0.5), color: P.authority });
    line(BX, Y - 150, BX, Y + 150, { color: P.authority, alpha: stageD, width: 5 });
    s11Commits(
      [
        [BX, Y - 80],
        [BX, Y + 80],
      ],
      { alpha: stageD, color: P.authority },
    );
    commitDot(BX, Y, { alpha: ac, color: P.evidence, r: 13, picked: 1 });
    nameText("dev", BX, Y - 150 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD,
    });
  }
  // Work not yet accepted is judged by the rules already trusted: a proposal to change the rules cannot stamp itself.
  if (stageE > 0) {
    const Y = 460,
      TX = 500,
      PX = mix(960, 1320, soon(t, trustedAt - 0.3, 0.5)),
      tr = stageE * ramp(t, trustedAt - 0.15, 0.4),
      self = stageE * ramp(t, selfAt - 0.15, 0.4);
    documentIcon(TX - 90, Y - 120, 180, 240, { alpha: tr, rows: 5, stroke: P.authority });
    seal(TX + 90, Y + 110, 44, { alpha: tr });
    nameText(L("之前已经信任的规则", "The rules already trusted"), TX, Y + 120 + NAME_GAP + 20, {
      valign: "top",
      color: P.authority,
      alpha: stageE * named(t, trustedAt),
    });
    documentIcon(PX - 90, Y - 120, 180, 240, {
      alpha: stageE,
      rows: 5,
      stroke: P.ink,
      fold: false,
    });
    nameText(L("还没被接受的改动", "Work not yet accepted"), PX, Y + 120 + NAME_GAP + 20, {
      valign: "top",
      alpha: stageE,
    });
    link(TX + 100, Y, PX - 100, Y, {
      alpha: tr,
      upto: soon(t, trustedAt + 0.1, 0.6),
      flow: (voiceTime(t) * 0.45) % 1,
      color: P.authority,
    });
    const sx = PX + 90,
      sy = Y - 110;
    const bend = rounded(
      [
        [sx, sy + 30],
        [sx + 110, sy + 30],
        [sx + 110, sy - 60],
        [sx - 120, sy - 60],
        [sx - 120, sy - 14],
      ],
      14,
    );
    path(along(bend, soon(t, selfAt + 0.05, 0.6)).kept, {
      color: P.unknown,
      alpha: self,
      width: 2.5,
      dash: [8, 8],
    });
    cross(sx + 110, sy - 16, 30, { alpha: self * ramp(t, selfAt + 0.4, 0.4), width: 3.5 });
    nameText(L("不能自己给自己盖章", "Cannot approve itself"), sx - 40, sy - 60 - NAME_GAP, {
      valign: "bottom",
      color: P.unknown,
      alpha: stageE * named(t, selfAt),
    });
  }
  // Continuous integration watches every push from outside: it runs the checks and reports them, and it holds no Lease
  // and no authority. Each part arrives on its own words, in the order each edition says them.
  if (stageF > 0) {
    const Y = 470,
      BX = 400,
      CX = 1100,
      q = (voiceTime(t) * 0.4) % 1,
      pu = stageF * ramp(t, pushAt - 0.15, 0.4),
      ci = stageF * ramp(t, ciBoxAt - 0.15, 0.4),
      both = Math.min(pu, ci);
    const seen = stageF * ramp(t, obsAt - 0.15, 0.4),
      none = stageF * ramp(t, noneAt - 0.15, 0.4);
    commitRow(BX - 80, 130, Y, 4, { alpha: pu, color: P.ink });
    nameText(L("每次推送", "Every push"), BX + 115, Y + 24 + NAME_GAP, {
      valign: "top",
      alpha: stageF * named(t, pushAt),
    });
    link(BX + 330, Y, CX - 140, Y, {
      alpha: both,
      upto: soon(t, Math.max(pushAt, ciBoxAt), 0.5),
      flow: q,
      color: P.evidence,
    });
    box(CX - 140, Y - 100, 280, 200, {
      fill: P.row,
      stroke: P.evidence,
      alpha: ci,
      radius: 16,
      width: 3,
    });
    ring(CX, Y - 36, 44, { color: P.evidence, alpha: ci, width: 3 });
    const a = voiceTime(t) * 1.6;
    line(CX, Y - 36, CX + 34 * Math.cos(a), Y - 36 + 34 * Math.sin(a), {
      color: P.evidence,
      alpha: ci,
      width: 3,
    });
    nameText(L("持续集成", "Continuous integration"), CX, Y + 50, {
      color: P.evidence,
      alpha: stageF * named(t, ciBoxAt),
      width: 250,
    });
    check(CX + 200, Y - 40, 42, { alpha: seen, color: P.evidence });
    nameText(L("观察结果", "Observes"), CX + 240, Y - 40, {
      align: "left",
      alpha: stageF * named(t, obsAt),
    });
    const ix = CX + 200;
    lock(ix, Y + 60, { alpha: none, color: P.muted, size: 1.2 });
    cross(ix + 44, Y + 60, 22, { alpha: none, width: 3 });
    nameText(L("不持有租约，也没有决定权", "No Lease, no authority"), ix + 76, Y + 60, {
      align: "left",
      width: 300,
      alpha: stageF * named(t, noneAt),
    });
  }
};
