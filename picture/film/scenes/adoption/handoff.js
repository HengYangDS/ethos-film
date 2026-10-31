/* 17 handoff and exit. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { link } from "../../drawing/links.js";
import { modelGrid } from "../../drawing/models.js";
import { box, dot, flowDot, line, measure, ring, stroke } from "../../drawing/strokes.js";
import { agent, cross, documentIcon, person, seal } from "../../drawing/symbols.js";
import {
  folderIcon,
  kernelIcon,
  recoverIcon,
  repoIcon,
  terminalIcon,
} from "../../drawing/workspace.js";
import { building, listIn, listLevel, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, growName, nameText, rejectedName } from "../../naming/names.js";
import { railNames, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { clamp, ease, mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* A door: the way out of a frame, drawn open by `open`. */
function doorMark(x, y, w, h, { alpha = 1, open = 0, color = P.ink } = {}) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, { stroke: color, alpha, radius: 6, width: 2.5 });
  const swing = ease(open) * w * 0.55;
  stroke(
    () => {
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 - swing, y - h / 2 + swing * 0.4);
      ctx.lineTo(x + w / 2 - swing, y + h / 2 - swing * 0.4);
      ctx.lineTo(x - w / 2, y + h / 2);
    },
    { color, alpha, width: 2.5 },
  );
}
scenes["17"] = function (s, t) {
  const [bitAt, adjustAt, handAt, leaveAt, designAt] = cues(s, [
    ["一点一点引入", "a little at a time"],
    ["按自己的工作去调整", "adjust it"],
    ["交给别人", "handed over"],
    ["完全退出", "leave ETHOS"],
    ["按设计", "by design"],
  ]);
  // The structure arrives piece by piece on the words that take it on.
  const boxesAt = en ? cue(s, "", "the structure it needs") : bitAt;
  const [adoptAt, prevAt, sameAt, leastAt, undoAt, backAt] = cues(s, [
    ["接入在设计上", "Adoption is designed"],
    ["可以先预览", "to be previewable"],
    ["重复执行结果不变", "the same result"],
    ["已有的东西", "change as little"],
    ["第一次受治理的改动", "to be reversible"],
    ["都可以撤回", "reversible"],
  ]);
  const [uninst, hookAt, genAt, secondAt] = cues(s, [
    ["卸载也有设计要求", "Uninstalling"],
    ["自动运行的钩子脚本", "no hook scripts"],
    ["充当权威来源的生成文件", "no generated file"],
    ["第二套控制机制", "no second control"],
  ]);
  const [before, ownAt, usefulAt, giveAt, keepAt] = cues(s, [
    ["交接或者退出之前", "Before a handoff"],
    ["归属权", "ownership"],
    ["有用的结果和必要的证据", "useful results"],
    ["要交给负责", "go to their owner"],
    ["存成可以恢复", "be kept"],
  ]);
  const [afterAt, retireAt, burdenAt] = cues(s, [
    ["做完这些以后", "After that"],
    ["就该撤下", "should be retired"],
    ["新的负担", "a new burden"],
  ]);
  // The mechanism is named on its own clause, which a Chinese comma separates from the first words.
  const mechAt = en ? cue(s, "", "a mechanism whose") : cue(s, "责任已经结束的机制", "") - 0.2;
  const stageA = stageOut(t, adoptAt),
    stageB = stageIn(t, adoptAt) * stageOut(t, uninst),
    stageC = stageIn(t, uninst) * stageOut(t, before),
    stageD = stageIn(t, before) * stageOut(t, afterAt),
    stageE = stageIn(t, afterAt);
  // A project's life with ETHOS along one rail: structure taken on piece by piece, adjusted, handed over, and a door at
  // the end by which it can leave altogether.
  if (stageA > 0) {
    const Y = 460,
      ats = [bitAt, adjustAt, handAt, leaveAt],
      names = en
        ? ["A little at a time", "Adjusted to its work", "Handed over", "Leave ETHOS altogether"]
        : ["一点一点引入", "按自己的工作调整", "交给别人或 Agent", "完全退出"],
      xs = railStations(names, 380, 1540, { wrap: 280 }),
      bx = building(t, ats, 193, 0.55);
    const on = (i) => stageA * ramp(t, (i ? ats[i] : s.voice_start) - 0.15, 0.4),
      n = soon(t, boxesAt - 0.15, 1.8);
    ctx.save();
    ctx.translate(bx, 0);
    repoIcon(xs[0], Y - 10, 260, 220, { alpha: on(0) });
    nameText(L("一个项目", "A project"), xs[0], Y - 120 - 12, { valign: "bottom", alpha: on(0) });
    [0, 1, 2].forEach((i) =>
      box(xs[0] - 60, Y + 44 - i * 46, 140, 38, {
        fill: P.row,
        stroke: P.evidence,
        alpha: on(0) * clamp(n * 3 - i),
        radius: 8,
      }),
    );
    modelGrid(xs[1] - 80, Y - 56, 160, 112, {
      alpha: on(1),
      color: P.evidence,
      cell: [1, 1],
      lit: on(1),
      grow: soon(t, adjustAt + 0.1, 0.8),
    });
    person(xs[2] - 44, Y, { alpha: on(2), size: 1.1 });
    agent(xs[2] + 54, Y - 6, { alpha: on(2), size: 1.2 });
    link(xs[2] - 18, Y - 6, xs[2] + 26, Y - 6, { alpha: on(2), upto: soon(t, handAt + 0.1, 0.4) });
    doorMark(xs[3], Y, 96, 150, {
      alpha: on(3),
      open: soon(t, leaveAt + 0.1, 0.8),
      color: P.authority,
    });
    nameText(L("按设计", "By design"), xs[3], Y - 75 - 40, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageA * named(t, designAt),
    });
    [0, 1, 2].forEach((i) =>
      line(xs[i] + [136, 90, 90][i], Y, xs[i + 1] - [86, 90, 64][i], Y, {
        color: P.muted,
        alpha: on(i + 1),
        width: 3,
      }),
    );
    railNames(names, xs, Y + 100, {
      gap: NAME_GAP,
      alpha: (i) =>
        stageA * (i ? listIn(t, ats, i) : ramp(t, bitAt - 0.15, 0.4) * listLevel(t, ats, 0)),
      set: "life",
      wrap: 280,
    });
    ctx.restore();
  }
  // Adoption's four design properties, each a row with its mark on its words.
  if (stageB > 0) {
    const ats = [prevAt, sameAt, leastAt, undoAt],
      ys = [320, 430, 540, 650],
      names = en
        ? [
            "Previewable",
            "Same result when repeated",
            "Changes as little as it can",
            "Reversible until the first governed change",
          ]
        : [
            "可以先预览",
            "重复执行结果不变",
            "已有的东西尽量少改",
            "第一次受治理的改动之前都可撤回",
          ];
    const widest = Math.max(...names.map((v) => measure(v))),
      rest =
        110 * (1 - soon(t, sameAt - 0.15, 0.5)) +
        60 * (1 - soon(t, leastAt - 0.15, 0.5)) +
        120 * (1 - soon(t, undoAt - 0.15, 0.5)),
      GX = Math.round(960 - (68 + NAME_GAP + widest) / 2 + 34) + 180 + rest;
    const lead = 270 * (1 - soon(t, prevAt - 0.15, 0.5)),
      DX = GX - 340 + lead;
    folderIcon(DX - 140, 390, 280, 200, { alpha: stageB, color: P.authority });
    nameText(L("接入", "Adoption"), DX, 490, { color: P.authority, alpha: stageB, bold: true });
    nameText(L(["在设计上", "要做到几点"], "Designed to be"), DX, 590 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageB,
    });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, P.evidence, speaking(t, ats, i)),
        y = ys[i];
      ring(GX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0) box(GX - 15, y - 19, 30, 38, { stroke: c, alpha: on, radius: 4, dash: [4, 4] });
      if (i === 1)
        stroke(
          () => {
            ctx.moveTo(GX - 14, y - 7);
            ctx.lineTo(GX + 14, y - 7);
            ctx.moveTo(GX - 14, y + 7);
            ctx.lineTo(GX + 14, y + 7);
          },
          { color: c, alpha: on, width: 3 },
        );
      if (i === 2) dot(GX, y, 7, { color: c, alpha: on });
      if (i === 3) recoverIcon(GX, y, 15, { color: c, alpha: on, upto: soon(t, backAt, 0.6) });
      nameText(names[i], GX + 34 + NAME_GAP, y, {
        align: "left",
        width: 700,
        alpha: stageB * listIn(t, ats, i),
        set: "properties",
      });
      link(DX + 140, 490, GX - 34, y, {
        route: "hvh",
        mid: GX - 100,
        alpha: on,
        upto: soon(t, at, 0.4),
      });
    });
  }
  // Uninstalling leaves the repository clean: three things that must not be left behind are shown, and each is removed
  // on its words.
  if (stageC > 0) {
    const ats = [hookAt, genAt, secondAt],
      names = en
        ? ["No hook scripts", "No generated source of truth", "No second set of controls"]
        : ["不留钩子脚本", "不留充当权威的\n生成文件", "不留第二套控制机制"],
      Y = 480,
      RX = 960,
      STEP = 320,
      EDGE = 170;
    const growth = ats.map((at) => soon(t, at - 0.5, 0.4)),
      n = growth.filter((v) => v >= 1).length,
      reach = (k) => EDGE * 2 + (k - 1) * STEP;
    const RW =
        n === 0
          ? mix(300, reach(1), growth[0])
          : n >= 3
            ? reach(3)
            : mix(reach(n), reach(n + 1), growth[n]),
      RH = mix(180, 330, growth[0]),
      left = RX - RW / 2;
    repoIcon(RX, Y, RW, RH, { alpha: stageC });
    nameText(L("卸载也有设计要求", "Uninstalling, by design"), RX, Y - RH / 2 - 12, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC,
    });
    nameText(
      L("卸干净以后的仓库", "The repository after uninstalling"),
      RX,
      Y + RH / 2 + NAME_GAP,
      { valign: "top", alpha: stageC },
    );
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4),
        x = left + EDGE + i * STEP,
        yy = Y - 40;
      if (i === 0) {
        terminalIcon(x - 66, yy - 40, 132, 80, { alpha: on, color: P.muted });
      }
      if (i === 1) {
        documentIcon(x - 36, yy - 46, 72, 92, { alpha: on, rows: 3, stroke: P.muted });
      }
      if (i === 2) {
        kernelIcon(x, yy, 46, { alpha: on, color: P.muted });
      }
      cross(x + 76, yy - 36, 26, { alpha: on, width: 3.5 });
      nameText(names[i], x, yy + 76, {
        valign: "top",
        width: 280,
        alpha: stageC * listIn(t, ats, i),
        set: "clean",
      });
    });
  }
  // Before leaving: ownership passes to whoever takes over, and useful results and evidence go to their owner or stay in
  // a form that can be recovered.
  if (stageD > 0) {
    const Y1 = 385,
      Y2 = 600,
      PX = 420,
      QX = 1440,
      q = (voiceTime(t) * 0.45) % 1,
      ow = stageD * ramp(t, ownAt - 0.15, 0.4),
      us = stageD * ramp(t, usefulAt - 0.15, 0.4);
    person(PX, Y1, { alpha: stageD, size: 1.6 });
    nameText(L("现在的负责人", "The current owner"), PX, Y1 + 54 + 12, {
      valign: "top",
      alpha: stageD,
    });
    person(QX, Y1, { alpha: ow, size: 1.6, color: P.authority });
    nameText(L("接手的一方", "Whoever takes over"), QX, Y1 + 54 + 12, {
      valign: "top",
      color: P.authority,
      alpha: stageD * named(t, ownAt),
    });
    link(PX + 50, Y1, QX - 50, Y1, {
      alpha: ow,
      upto: soon(t, ownAt, 0.7),
      color: P.authority,
      flow: q,
    });
    nameText(L("归属权", "Ownership"), 930, Y1 - 12, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD * named(t, ownAt),
    });
    [
      [-46, 0],
      [0, 12],
      [46, -6],
    ].forEach(([dx, dy], i) =>
      documentIcon(PX + dx - 26, Y2 - 40 + dy, 52, 72, {
        alpha: us,
        rows: 3,
        stroke: i === 1 ? P.authority : P.evidence,
      }),
    );
    nameText(L("有用的结果和必要的证据", "Results, and the evidence needed"), PX, Y2 + 54, {
      valign: "top",
      width: 420,
      alpha: stageD * named(t, usefulAt),
    });
    // They go on the words that say where: the link reaches their owner's place, which keeps them recoverable, and its
    // name grows by its second part on that part's own words.
    const go = stageD * ramp(t, giveAt - 0.15, 0.4),
      parts = en
        ? ["To its owner,", " or kept recoverable"]
        : ["交给负责的一方，", "或存成可恢复的"];
    link(PX + 90, Y2, QX - 120, Y2, {
      alpha: us,
      upto: soon(t, giveAt, 0.7),
      flow: q,
      color: P.evidence,
    });
    repoIcon(QX, Y2, 240, 150, { alpha: go });
    recoverIcon(QX + 16, Y2 + 12, 30, { alpha: go });
    growName(t, parts, [giveAt, keepAt], QX - measure(parts.join("")) / 2, Y2 + 75 + 12, {
      build: true,
      color: P.evidence,
      alpha: stageD,
    });
  }
  // A mechanism whose obligation is done steps off the rail: the flow continues without it, and a new burden is refused
  // on its words.
  if (stageE > 0) {
    const Y = 620,
      X0 = 300,
      X1 = 1620,
      q = (voiceTime(t) * 0.4) % 1,
      off = soon(t, retireAt + 0.1, 1),
      MX = 960,
      MY = mix(Y, Y - 150, off),
      a = stageE * (1 - off * 0.55);
    line(X0, Y, X1, Y, { color: P.evidence, alpha: stageE, width: 4 });
    flowDot(mix(X0, X1, q), Y, 10, q, { color: P.evidence, alpha: stageE });
    // The mechanism stands on the work's line as an outline holding its seal, so it reads as finished before it is named.
    box(MX - 130, MY - 140, 260, 140, { stroke: P.muted, alpha: a, radius: 12, width: 3 });
    seal(MX, MY - 70, 40, { alpha: a, color: P.muted });
    nameText(L("责任已经结束的机制", "A mechanism with its job done"), MX, MY - 140 - 12, {
      valign: "bottom",
      width: 520,
      alpha: stageE * named(t, mechAt),
    });
    rejectedName(L("新的负担", "A new burden"), MX + 158, MY - 70, {
      align: "left",
      alpha: stageE * named(t, burdenAt),
      mark: ramp(t, burdenAt + 0.4, 0.4),
    });
  }
};
