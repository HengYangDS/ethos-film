/* 12 release and delivery. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { link } from "../../drawing/links.js";
import { box, dashed, dot, line, measure, ring, stroke, text } from "../../drawing/strokes.js";
import { check, cross, person, seal } from "../../drawing/symbols.js";
import { commitDot, folderIcon, repoIcon, tagIcon } from "../../drawing/workspace.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, growName, nameText } from "../../naming/names.js";
import { railNames, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* A forge: a rounded host with its name beneath, holding what it received. */
function forgeMark(
  x,
  y,
  w,
  h,
  name,
  { alpha = 1, color = P.ink, named: nameAlpha = alpha, set = null } = {},
) {
  if (alpha < 0.01 && nameAlpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, { fill: P.row, stroke: color, alpha, radius: 14, width: 2.5 });
  nameText(name, x, y + h / 2 + NAME_GAP, { valign: "top", alpha: nameAlpha, set });
}
scenes["12"] = function (s, t) {
  const [acceptAt, cutAt, handAt] = en
    ? cues(s, [
        ["", "Accepting code"],
        ["", "cutting a release"],
        ["", "putting it in users' hands"],
      ])
    : cues(s, [
        ["代码被接受", ""],
        ["做成发布版本", ""],
        ["交到使用者手里", ""],
      ]);
  const [localAt, commitAt, tagAt, gitAt] = cues(s, [
    ["发布时", "For a release"],
    ["提交、标签", "the commit and"],
    ["标签这些", "the tag are"],
    ["本地 Git", "local Git"],
  ]);
  const [everyAt, labAt, hubAt, sameAt, noCopy, noSign] = cues(s, [
    ["声明的每个平台", "Every declared platform"],
    ["GitLab", "GitLab"],
    ["GitHub", "GitHub"],
    ["同一次提交", "the same commit"],
    ["谁也不从别的平台", "none copies"],
    ["也都不能改写", "none may rebuild"],
  ]);
  const [oneOk, otherAt, behindAt, windowAt, pendingAt, pastAt, divergeAt] = cues(s, [
    ["推到一个平台成功了", "A push that succeeds"],
    ["不代表别的平台", "says nothing about"],
    ["落后", "temporarily behind"],
    ["设定的时间窗口", "within the declared"],
    ["就算待同步", "is pending"],
    ["过了这个窗口", "past that window"],
    ["才算分歧", "counts as divergence"],
  ]);
  const [owedAt, stillOwed, acceptedAt, notDone] = cues(s, [
    ["正式变更也要记下", "The official Change"],
    ["没完成的责任", "still owed"],
    ["代码被接受了", "accepted code"],
    ["不等于交付完成了", "does not mean delivery"],
  ]);
  const [confirmAt, whereAt, runAt] = cues(s, [
    ["还要确认", "There is still more"],
    ["部署到了哪里", "where the version"],
    ["实际在用", "actually running"],
  ]);
  const stageA = stageOut(t, localAt),
    stageB = stageIn(t, localAt) * stageOut(t, oneOk),
    stageC = stageIn(t, oneOk) * stageOut(t, owedAt),
    stageD = stageIn(t, owedAt) * stageOut(t, confirmAt),
    stageE = stageIn(t, confirmAt);
  // Three separate steps along one rail, each on its words.
  if (stageA > 0) {
    const Y = 470,
      names = en
        ? ["Code accepted", "A release cut", "In users' hands"]
        : ["代码被接受", "做成发布版本", "交到使用者手里"],
      xs = railStations(names, 420, 1500),
      ats = [acceptAt, cutAt, handAt],
      R = 84;
    line(xs[0], Y, xs[2], Y, { color: P.muted, alpha: stageA, width: 3 });
    ats.forEach((at, i) => {
      const on = stageA * ramp(t, (i ? at : s.voice_start) - 0.15, 0.4),
        c = blend(P.ink, P.authority, speaking(t, ats, i)),
        x = xs[i];
      dot(x, Y, R, { color: P.ground, alpha: on });
      ring(x, Y, R, { color: c, alpha: on, width: 3 });
      if (i === 0) {
        commitDot(x, Y, { alpha: on, color: c, r: 20 });
        check(x, Y + 2, 22, { alpha: on, color: c });
      }
      if (i === 1) tagIcon(x - 44, Y, 88, 44, { alpha: on, color: c });
      if (i === 2) person(x, Y + 2, { alpha: on, size: 1.3, color: c });
    });
    railNames(names, xs, Y + R, {
      gap: NAME_GAP,
      alpha: (i) => stageA * listIn(t, ats, i),
      set: "steps",
    });
  }
  // Everything is fixed locally first: the local repository stands from the first words, the commit and the tag are
  // made in it on their words, and it is named local Git on its own. Each declared platform receives those same
  // objects. Nothing passes between the platforms, and neither rebuilds or signs them again.
  if (stageB > 0) {
    const LX = mix(960, 460, soon(t, everyAt - 0.3, 0.5)),
      Y = 480,
      FX = 1380,
      YA = 320,
      YB = 640,
      FW = 340,
      FH = 160,
      q = voiceTime(t) * 0.4,
      sm = stageB * ramp(t, sameAt - 0.15, 0.4),
      nc = stageB * ramp(t, noCopy - 0.15, 0.4);
    const cm = stageB * ramp(t, commitAt - 0.15, 0.4),
      tg = stageB * ramp(t, tagAt - 0.15, 0.4);
    repoIcon(LX, Y, 310, 186, { alpha: stageB });
    commitDot(LX - 20, Y + 35, { alpha: cm, color: P.authority, r: 14 });
    tagIcon(LX + 30, Y + 35, 100, 44, { alpha: tg });
    nameText(L("提交", "Commit"), LX - 20, Y + 35 - 14 - 12, {
      valign: "bottom",
      size: NOTE,
      alpha: stageB * named(t, commitAt),
    });
    nameText(L("标签", "Tag"), LX + 80, Y + 35 - 22 - 12, {
      valign: "bottom",
      size: NOTE,
      alpha: stageB * named(t, tagAt),
    });
    nameText(L("先在本地定下来", "Created locally first"), LX, Y - 93 - NAME_GAP - 10, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageB,
    });
    nameText(L("本地 Git", "Local Git"), LX, Y + 93 + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, gitAt),
    });
    nameText(L("声明的每个平台", "Every declared platform"), FX, YA - FH / 2 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB * named(t, everyAt),
    });
    [
      ["GitLab", YA, 0, labAt],
      ["GitHub", YB, 1, hubAt],
    ].forEach(([name, y, i, at]) => {
      forgeMark(FX, y, FW, FH, name, {
        alpha: stageB * ramp(t, at - 0.15, 0.4),
        named: stageB * named(t, at),
        set: "forges",
      });
      link(LX + 155, Y, FX - FW / 2, y, {
        route: "hvh",
        mid: 850,
        alpha: sm,
        upto: soon(t, sameAt, 0.5),
        flow: (q + i * 0.5) % 1,
        color: P.authority,
      });
      commitDot(FX - 60, y, { alpha: sm, color: P.authority, r: 14 });
      tagIcon(FX + 4, y, 92, 42, { alpha: sm });
    });
    nameText(L("同一次提交、同一个标签", "The same commit and tag"), 874, Y, {
      align: "left",
      width: 320,
      color: P.authority,
      alpha: stageB * named(t, sameAt),
    });
    dashed(FX, YA + FH / 2 + 56, FX, YB - FH / 2, { color: P.muted, alpha: nc });
    cross(FX, Y + 18, 28, { alpha: nc * ramp(t, noCopy + 0.3, 0.4), width: 3.5 });
    nameText(L("不互相拷贝", "No copying between them"), FX + 34, Y + 18, {
      align: "left",
      width: 380,
      alpha: stageB * named(t, noCopy),
    });
    nameText(L("不改写、不重新签名", "No rebuild, no new signature"), LX, 720, {
      valign: "top",
      alpha: stageB * named(t, noSign),
      size: NOTE,
      color: P.muted,
    });
  }
  // Both platforms stand from the first words, and each has its own status: one push succeeded, the other platform is
  // behind. A clock shows the declared window: while its hand is inside the window the difference is pending, and once
  // the hand has passed it, divergence.
  if (stageC > 0) {
    const lead = 200 * (1 - soon(t, windowAt - 0.3, 0.5)),
      YA = 360,
      YB = 560,
      X0 = 460 + lead,
      X1 = 1100 + lead,
      CX = 1290,
      CR = 56;
    const other = stageC * ramp(t, otherAt - 0.15, 0.4),
      bh = stageC * named(t, behindAt),
      win = stageC * ramp(t, windowAt - 0.15, 0.4),
      dv = stageC * ramp(t, divergeAt - 0.15, 0.4);
    const target = X1 - 80;
    nameText("GitLab", X0 - NAME_GAP, YA, { align: "right", alpha: stageC, set: "forges" });
    line(X0, YA, X1, YA, { color: P.line, alpha: stageC });
    line(X0, YA, mix(X0, target, soon(t, oneOk + 0.1, 0.8)), YA, {
      color: P.evidence,
      alpha: stageC,
      width: 5,
    });
    seal(target, YA, 28, { alpha: stageC * ramp(t, oneOk + 0.7, 0.4), color: P.evidence });
    nameText(L("成功了", "Succeeds"), target, YA - 28 - NAME_GAP, {
      valign: "bottom",
      color: P.evidence,
      alpha: stageC * named(t, oneOk + 0.7),
    });
    nameText("GitHub", X0 - NAME_GAP, YB, { align: "right", alpha: stageC, set: "forges" });
    line(X0, YB, X1, YB, { color: P.line, alpha: stageC });
    const behind = mix(X0, X0 + 260, soon(t, otherAt + 0.1, 0.8));
    line(X0, YB, behind, YB, { color: P.evidence, alpha: other, width: 5 });
    dot(behind, YB, 10, { color: P.evidence, alpha: other });
    nameText(L("落后", "Temporarily behind"), X0 + 260, YB - 10 - NAME_GAP, {
      valign: "bottom",
      alpha: bh,
    });
    // The clock: its window is the dashed arc of the first half turn, and its hand advances on the words.
    const hand =
      0.18 * soon(t, windowAt, 0.5) + 0.17 * soon(t, pendingAt, 0.5) + 0.27 * soon(t, pastAt, 0.8);
    ring(CX, YB, CR, { color: P.ink, alpha: win, width: 2.5 });
    ring(CX, YB, CR * 0.78, { color: P.authority, alpha: win, width: 3, upto: 0.5, dash: [6, 6] });
    const a = -Math.PI / 2 + Math.PI * 2 * hand;
    line(CX, YB, CX + CR * 0.8 * Math.cos(a), YB + CR * 0.8 * Math.sin(a), {
      color: blend(P.authority, P.unknown, soon(t, pastAt + 0.5, 0.4)),
      alpha: win,
      width: 3,
    });
    dot(CX, YB, 5, { color: P.ink, alpha: win });
    const parts = en ? ["Within the window", ": pending"] : ["时间窗口内", "：待同步"];
    growName(
      t,
      parts,
      [windowAt, pendingAt],
      CX - measure(parts.join("")) / 2,
      YB + CR + NAME_GAP,
      { color: P.authority, alpha: stageC, build: true },
    );
    cross(CX + CR + 50, YB, 30, { alpha: dv, width: 3.5 });
    nameText(L("过了窗口：分歧", "Past it: divergence"), CX + CR + 80, YB, {
      align: "left",
      color: P.unknown,
      alpha: stageC * named(t, divergeAt),
    });
  }
  // The Change keeps what is still owed: the owed items light as the film says so, and accepted code is checked on its
  // own words, one tick on a longer list.
  if (stageD > 0) {
    const CX = 960,
      Y = 300,
      rows = en
        ? ["Code accepted", "Release published", "Deployed and in use"]
        : ["代码被接受", "版本发布", "部署并投入使用"],
      W = 128 + Math.max(...rows.map((v) => measure(v))) + 70,
      H = 340;
    const owed = ramp(t, stillOwed - 0.15, 0.4),
      ok = ramp(t, acceptedAt - 0.15, 0.4),
      n = stageD * ramp(t, notDone - 0.15, 0.4);
    folderIcon(CX - W / 2, Y, W, H, { alpha: stageD, color: P.authority });
    nameText(
      L("正式变更记下没完成的责任", "The Change tracks what is owed"),
      CX,
      Y - NAME_GAP + 4,
      {
        valign: "bottom",
        color: P.authority,
        alpha: stageD,
      },
    );
    rows.forEach((v, i) => {
      const y = Y + 92 + i * 88,
        rx = CX - W / 2 + 80;
      if (i === 0) {
        ring(rx, y, 26, { color: P.muted, alpha: stageD * (1 - ok), width: 2.5, dash: [6, 6] });
        ring(rx, y, 26, { color: P.evidence, alpha: stageD * ok, width: 2.5 });
        check(rx, y + 2, 24, {
          color: P.evidence,
          alpha: stageD * ok,
          upto: soon(t, acceptedAt, 0.4),
        });
      } else
        ring(rx, y, 26, {
          color: blend(P.muted, P.unknown, owed),
          alpha: stageD,
          width: 2.5,
          dash: [6, 6],
        });
      nameText(v, CX - W / 2 + 128, y, { align: "left", alpha: stageD, set: "owed" });
    });
    nameText(L("不等于交付完成", "Delivery is not finished"), CX, Y + H + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: n,
    });
  }
  // Where the version was deployed, and which version users actually run: one tag travels out, and the person at its end
  // may be running another.
  if (stageE > 0) {
    const lead = 240 * (1 - soon(t, whereAt - 0.3, 0.5)) + 150 * (1 - soon(t, runAt - 0.3, 0.5)),
      Y = 470,
      TX = 330 + lead,
      SX = 960 + lead,
      UX = 1560 + lead,
      q = (voiceTime(t) * 0.4) % 1,
      de = stageE * ramp(t, whereAt - 0.15, 0.4),
      ru = stageE * ramp(t, runAt - 0.15, 0.4);
    tagIcon(TX - 90, Y, 180, 84, { alpha: stageE });
    nameText(L("发布的版本", "The released version"), TX, Y + 42 + NAME_GAP, {
      valign: "top",
      alpha: stageE,
    });
    link(TX + 100, Y, SX - 170, Y, { alpha: de, upto: soon(t, whereAt, 0.5), flow: q });
    box(SX - 170, Y - 110, 340, 220, { stroke: P.ink, alpha: stageE, radius: 14, width: 2.5 });
    stroke(
      () =>
        [0, 1, 2].forEach((i) => {
          ctx.moveTo(SX - 130, Y - 60 + i * 60);
          ctx.lineTo(SX + 130, Y - 60 + i * 60);
        }),
      { color: P.muted, alpha: stageE, width: 2 },
    );
    [0, 1, 2].forEach((i) =>
      dot(SX + 110, Y - 60 + i * 60 - 22, 7, {
        color: i === 1 ? P.authority : P.evidence,
        alpha: stageE,
      }),
    );
    nameText(L("部署到了哪里", "Where it was deployed"), SX, Y + 110 + NAME_GAP, {
      valign: "top",
      alpha: stageE * named(t, whereAt),
    });
    link(SX + 170, Y, UX - 44, Y, { alpha: ru, upto: soon(t, runAt, 0.5), flow: q });
    person(UX, Y - 8, { alpha: ru, size: 1.6, color: P.authority });
    text("?", UX + 64, Y - 62, 44, { role: "mark", color: P.unknown, alpha: ru });
    nameText(L("实际在用哪个版本", "The version users actually run"), UX, Y + 54 + NAME_GAP, {
      valign: "top",
      width: 280,
      alpha: stageE * named(t, runAt),
    });
  }
};
