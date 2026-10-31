/* 09 check, then write. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { commitRow, refMark } from "../../drawing/history.js";
import { along, link, rounded } from "../../drawing/links.js";
import {
  box,
  dashed,
  dot,
  flowDot,
  line,
  measure,
  path,
  ring,
  stroke,
  text,
} from "../../drawing/strokes.js";
import { check, clock, cross, documentIcon, person, stopSign } from "../../drawing/symbols.js";
import { commitDot, kernelIcon, terminalIcon } from "../../drawing/workspace.js";
import { listIn, named, saidShare, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText } from "../../naming/names.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* The plan on its own: a document whose outline is drawn firm enough to carry the picture while it stands alone. */
function s09Plan(x, y, w, h, { alpha = 1, color = P.evidence } = {}) {
  if (alpha < 0.01) return;
  const c = Math.min(22, w * 0.2);
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha, rows: 4, stroke: color });
  stroke(
    () => {
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2 - c, y - h / 2);
      ctx.lineTo(x + w / 2, y - h / 2 + c);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.lineTo(x - w / 2, y + h / 2);
      ctx.closePath();
    },
    { color, alpha, width: 3 },
  );
}
scenes["09"] = function (s, t) {
  const [git, versions, refAt] = en
    ? cues(s, [
        ["", "Git points"],
        ["", "versions"],
        ["", "names called references"],
      ])
    : cues(s, [
        ["Git 用", ""],
        ["各个版本", ""],
        ["这些名字叫引用", ""],
      ]);
  const [updateAt, kernelAt, oldAt, writeAt, oneAt, casAt] = cues(s, [
    ["计划真要改动", "When a plan updates"],
    ["内核会再核对", "the kernel checks"],
    ["再核对一次旧值", "checks once more"],
    ["才写入新值", "writes the new value"],
    ["核对和写入是一步完成的", "Checking and writing"],
    ["compare-and-swap", "compare-and-swap"],
  ]);
  const [changedAt, turnAt, voidAt, freshAt] = cues(s, [
    ["旧值要是已经变了", "If the old value"],
    ["已经变了", "has changed"],
    ["原来的计划就作废", "the plan is discarded"],
    ["按新的事实", "compiled from fresh facts"],
  ]);
  const [backAt, readAt, confirmAt] = cues(s, [
    ["写完以后", "After the write"],
    ["把结果读回来", "the result is read back"],
    ["确认实际发生了什么", "confirm what actually"],
  ]);
  const [stops, unknownAt, whoAt, staleAt, clashAt] = cues(s, [
    ["有几种情况", "The kernel stops"],
    ["必需的事实还不知道", "a required fact"],
    ["谁有权决定说不清", "who has the authority"],
    ["已经过时", "out of date"],
    ["互相矛盾", "contradict each other"],
  ]);
  const [report, happened, why, evid, next, person2] = cues(s, [
    ["停下来的时候", "When it stops"],
    ["出了什么事", "what happened"],
    ["为什么停", "why it stopped"],
    ["证据是什么", "the evidence"],
    ["唯一安全的下一步", "the one safe next"],
    ["要不要人来决定", "whether a person"],
  ]);
  const [daily, runAt, statusAt, seeAt, doAt, againAt] = cues(s, [
    ["平时用的时候", "In daily use"],
    ["先运行", "you start"],
    ["状态命令", "status command"],
    ["看清现状", "see where things stand"],
    ["只做这一步", "take only"],
    ["做完再看一次", "look again"],
  ]);
  const stageA = stageOut(t, updateAt),
    stageB = stageIn(t, updateAt) * stageOut(t, changedAt),
    stageC = stageIn(t, changedAt) * stageOut(t, backAt),
    stageD = stageIn(t, backAt) * stageOut(t, stops);
  const stageE = stageIn(t, stops) * stageOut(t, report),
    stageF = stageIn(t, report) * stageOut(t, daily),
    stageG = stageIn(t, daily);
  const X0 = 620,
    STEP = 180,
    Y = 520;
  // A plan alone changes nothing: it stands at the centre, then steps aside as Git's branch draws on, its versions join
  // the branch, and a name points at one of them.
  if (stageA > 0) {
    const mv = soon(t, git + 0.05, 0.5),
      k = mix(1.7, 1, mv),
      PX = mix(960, 400, mv),
      PY = mix(370, 390, mv),
      PW = 120 * k,
      PH = 156 * k,
      YA = 580;
    s09Plan(PX, PY, PW, PH, { alpha: stageA });
    nameText(L("计划还没生效", "A plan alone changes nothing"), PX, PY + PH / 2 + NAME_GAP, {
      valign: "top",
      width: 560,
      alpha: stageA,
    });
    const drawn = soon(t, git, 0.7),
      reach = mix(X0, X0 + STEP * 5, drawn),
      v = stageA * ramp(t, versions - 0.15, 0.4);
    if (drawn > 0) line(X0, YA, reach, YA, { color: P.ink, alpha: stageA, width: 2.5 });
    nameText("Git", X0 - 30, YA, { align: "right", alpha: stageA * named(t, git) });
    commitRow(X0, STEP, YA, 6, { alpha: v, single: true });
    nameText(L("各个版本", "Versions"), X0 + STEP * 2.5, YA + 40, {
      valign: "top",
      alpha: stageA * named(t, versions),
    });
    const r = stageA * ramp(t, refAt - 0.15, 0.4);
    refMark(X0 + STEP * 4, YA, "dev", { alpha: r });
    nameText(L("引用", "Reference"), X0 + STEP * 4 + 80, YA - 80, {
      align: "left",
      color: P.authority,
      alpha: stageA * named(t, refAt),
    });
  }
  // Compare and swap: when a plan updates the reference, the kernel checks its old value and writes the new one, and the
  // bracket says the two are one uninterrupted step.
  if (stageB > 0) {
    const swing = soon(t, writeAt + 0.2, 0.6),
      rx = mix(X0 + STEP * 3, X0 + STEP * 4, swing),
      one = stageB * ramp(t, oneAt - 0.15, 0.4);
    const checked = stageB * ramp(t, oldAt - 0.15, 0.4),
      kern = stageB * ramp(t, kernelAt - 0.15, 0.4),
      wrote = stageB * ramp(t, writeAt - 0.15, 0.4),
      KX = 450;
    documentIcon(190, Y - 65, 100, 130, { alpha: stageB, rows: 3, stroke: P.evidence });
    nameText(L("计划", "A plan"), 240, Y + 65 + NAME_GAP, { valign: "top", alpha: stageB });
    commitRow(X0, STEP, Y, 4, { alpha: stageB, single: true });
    dashed(X0 + STEP * 3 + 12, Y, X0 + STEP * 4 - 12, Y, {
      color: P.muted,
      alpha: stageB,
      width: 2.5,
    });
    ring(X0 + STEP * 4, Y, 12, { color: P.muted, alpha: stageB, width: 2.5, dash: [5, 5] });
    line(X0 + STEP * 3, Y, X0 + STEP * 4, Y, { color: P.ink, alpha: wrote, width: 2.5 });
    commitDot(X0 + STEP * 4, Y, { alpha: wrote, color: P.evidence, picked: 1, r: 12 });
    refMark(rx, Y, "dev", { alpha: stageB });
    nameText(L("引用", "Reference"), rx + 80, Y - 80, {
      align: "left",
      color: P.authority,
      alpha: stageB,
    });
    ring(X0 + STEP * 3, Y, 24, { color: P.evidence, alpha: checked * (1 - swing * 0.6), width: 3 });
    nameText(L("预期的旧值", "The expected old value"), X0 + STEP * 3, Y + 24 + NAME_GAP + 8, {
      valign: "top",
      width: 240,
      alpha: stageB * named(t, oldAt),
    });
    nameText(L("新值", "The new value"), X0 + STEP * 4 + 10, Y + 24 + NAME_GAP + 8, {
      valign: "top",
      align: "left",
      color: P.evidence,
      alpha: stageB * named(t, writeAt),
    });
    kernelIcon(KX, Y, 80, { alpha: kern, beat: checked });
    nameText(L("内核", "The kernel"), KX, Y + 80 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageB * named(t, kernelAt),
    });
    link(290, Y, KX - 72, Y, { alpha: kern, upto: soon(t, kernelAt, 0.4) });
    const bx0 = X0 + STEP * 3 - 40,
      bx1 = X0 + STEP * 4 + 100,
      by = 300;
    path(
      [
        [bx0, by + 24],
        [bx0, by],
        [bx1, by],
        [bx1, by + 24],
      ],
      { color: P.authority, alpha: one, width: 3 },
    );
    nameText(
      L("核对和写入，一步完成", "Check and write: one step"),
      (bx0 + bx1) / 2,
      by - NAME_GAP,
      { valign: "bottom", alpha: stageB * named(t, oneAt) },
    );
    nameText("compare-and-swap", 960 - 300, by, {
      color: P.authority,
      alpha: stageB * named(t, casAt),
      bold: true,
    });
    link(KX + 72, Y, X0 - 24, Y, {
      alpha: checked,
      upto: soon(t, oldAt, 0.4),
      flow: (voiceTime(t) * 0.5) % 1,
    });
  }
  // Someone moved the reference first: as the old value is said to have changed, the reference leaves the expected old
  // value for another writer's commit, the expected value stays a dashed ring, the plan is refused, and a new one is
  // compiled from fresh facts.
  if (stageC > 0) {
    const other = X0 + STEP * 4,
      turn = soon(t, turnAt + 0.05, 0.6),
      v = stageC * ramp(t, voidAt - 0.15, 0.4),
      fr = stageC * ramp(t, freshAt - 0.15, 0.4),
      c = blend(P.authority, P.unknown, turn),
      rx = mix(X0 + STEP * 3, other, turn),
      late = stageC * ramp(t, turnAt - 0.15, 0.4);
    commitRow(X0, STEP, Y, 4, { alpha: stageC, single: true });
    line(X0 + STEP * 3, Y, other, Y, { color: P.unknown, alpha: late, width: 2.5 });
    commitDot(other, Y, { alpha: late, color: P.unknown, r: 12 });
    refMark(rx, Y, "dev", { alpha: stageC, color: c });
    nameText(L("旧值已经变了", "The old value has changed"), rx + 80, Y - 80, {
      align: "left",
      width: 300,
      color: P.unknown,
      alpha: stageC * named(t, turnAt),
    });
    ring(X0 + STEP * 3, Y, 24, { color: P.muted, alpha: stageC, width: 2.5, dash: [5, 5] });
    nameText(L("预期的旧值", "The expected old value"), X0 + STEP * 3, Y + 24 + NAME_GAP + 8, {
      valign: "top",
      width: 240,
      alpha: stageC,
    });
    documentIcon(340, Y - 170, 120, 156, { alpha: v, rows: 4, stroke: P.muted });
    cross(400, Y - 92, 60, { alpha: v * ramp(t, voidAt + 0.15, 0.4), width: 5 });
    nameText(L("原来的计划作废", "The plan is discarded"), 400, Y - 14 + NAME_GAP, {
      valign: "top",
      width: 300,
      alpha: stageC * named(t, voidAt),
    });
    const FY = 340;
    kernelIcon(790, FY, 62, { alpha: fr, beat: fr });
    documentIcon(950, FY - 60, 92, 120, { alpha: fr, rows: 3, stroke: P.evidence });
    [
      [-30, -14],
      [24, -22],
      [-12, 18],
    ].forEach(([dx, dy]) => dot(610 + dx, FY + dy, 8, { color: P.evidence, alpha: fr }));
    link(646, FY, 728, FY, { alpha: fr, upto: soon(t, freshAt, 0.4) });
    link(852, FY, 950, FY, { alpha: fr, upto: soon(t, freshAt + 0.2, 0.4), color: P.evidence });
    nameText(L("用新事实重新编译", "Compiled again from fresh facts"), 1070, FY, {
      align: "left",
      width: 400,
      alpha: stageC * named(t, freshAt),
    });
  }
  // After a write the result is read back: the written value stands on a later commit, a line returns from it to the
  // kernel, and a magnifier stands on what actually happened.
  if (stageD > 0) {
    const on = stageD,
      rb = stageD * ramp(t, confirmAt - 0.15, 0.4),
      rx = X0 + STEP * 5;
    commitRow(X0, STEP, Y, 6, { alpha: on, single: true });
    refMark(rx, Y, "dev", { alpha: on, color: P.evidence });
    nameText(L("新值", "The new value"), rx - 80, Y - 80, {
      align: "right",
      color: P.evidence,
      alpha: on,
    });
    kernelIcon(380, Y, 80, { alpha: on });
    nameText(L("内核", "The kernel"), 380, Y + 80 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: on,
    });
    const back = rounded(
      [
        [rx, Y - 100],
        [rx, 300],
        [380, 300],
        [380, Y - 80],
      ],
      16,
    );
    path(along(back, soon(t, readAt, 1.1)).kept, {
      color: P.evidence,
      alpha: on * ramp(t, readAt - 0.15, 0.3),
      width: 2.5,
    });
    nameText(L("把结果读回来", "The result is read back"), (rx + 380) / 2, 300 - NAME_GAP, {
      valign: "bottom",
      alpha: stageD * named(t, readAt),
    });
    ring(rx, Y, 44, { color: P.evidence, alpha: rb, width: 3 });
    line(rx + 32, Y + 32, rx + 62, Y + 62, { color: P.evidence, alpha: rb, width: 5 });
    nameText(L("实际发生了什么", "What actually happened"), rx, Y + 64 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageD * named(t, confirmAt),
    });
  }
  // The conditions that stop the kernel each stand beside the stop sign on their own words. The list stays open: Chinese
  // heads it with the "several situations" it speaks, and English speaks no count, so it draws none.
  if (stageE > 0) {
    const names = en
      ? [
          "A required fact is unknown",
          "Authority is unclear",
          "Something relied on is out of date",
          "Contradicting inputs",
        ]
      : ["必需的事实还不知道", "谁有权决定说不清", "依赖的条件已经过时", "输入互相矛盾"];
    const SR = 118,
      GAP = 150,
      whole = SR * 2 + GAP + 68 + NAME_GAP + Math.max(...names.map((v) => measure(v))),
      left = 960 - whole / 2,
      SX = left + SR;
    const CY = 480,
      ats = [unknownAt, whoAt, staleAt, clashAt],
      ys = [330, 430, 530, 630],
      IX = SX + SR + GAP + 34;
    stopSign(SX, CY, SR, { alpha: stageE });
    nameText(L("内核停下来", "The kernel stops"), SX, CY + SR + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: stageE,
    });
    if (!en)
      nameText("有几种情况", IX - 34, ys[0] - 34 - NAME_GAP, {
        align: "left",
        valign: "bottom",
        size: NOTE,
        color: P.muted,
        alpha: stageE,
      });
    ats.forEach((at, i) => {
      const on = stageE * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, P.unknown, speaking(t, ats, i)),
        y = ys[i];
      link(IX - 34, y, SX + SR, CY, {
        route: "hvh",
        mid: IX - 90,
        alpha: on,
        upto: soon(t, at, 0.4),
      });
      ring(IX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0) text("?", IX, y + 1, 30, { role: "mark", align: "center", color: c, alpha: on });
      if (i === 1) {
        person(IX, y - 1, { alpha: on, size: 0.7, color: c });
      }
      if (i === 2) clock(IX, y, 18, { alpha: on, color: c, hand: 0.6 });
      if (i === 3)
        stroke(
          () => {
            ctx.moveTo(IX - 14, y - 12);
            ctx.lineTo(IX + 14, y + 12);
            ctx.moveTo(IX + 14, y - 12);
            ctx.lineTo(IX - 14, y + 12);
          },
          { color: c, alpha: on, width: 3 },
        );
      nameText(names[i], IX + 34 + NAME_GAP, y, {
        align: "left",
        alpha: stageE * listIn(t, ats, i),
        set: "stops",
      });
    });
  }
  // When it stops it reports: a card that grows by a line at a time, ending in the one safe next action.
  if (stageF > 0) {
    const ats = [happened, why, evid, next, person2],
      rows = en
        ? [
            "What happened",
            "Why it stopped",
            "The evidence, or the missing fact",
            "The one safe next action",
            "Whether a person has to decide",
          ]
        : [
            "出了什么事",
            "为什么停",
            "证据是什么，或者还缺哪个事实",
            "唯一安全的下一步",
            "要不要人来决定",
          ];
    const W = 104 + Math.max(...rows.map((v) => measure(v))) + 60,
      CX = 1120,
      left = CX - W / 2,
      top = 280,
      STEP2 = 74,
      grown = ats.reduce((v, at) => v + soon(t, at - 0.5, 0.4), 0),
      H = 20 + Math.max(1, grown) * STEP2;
    stopSign(440, 500, 90, { alpha: stageF });
    nameText(L("停下来以后", "When it stops"), 440, 500 + 90 + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: stageF,
    });
    // The card comes with its first line, so no empty card waits for what it will say.
    const card = stageF * ramp(t, happened - 0.5, 0.4);
    link(530, 500, left, top + 52, { route: "hvh", mid: left - 60, alpha: card });
    box(left, top, W, H, { fill: P.row, stroke: P.ink, alpha: card, radius: 14, width: 2.5 });
    ats.forEach((at, i) => {
      const on = stageF * ramp(t, at - 0.15, 0.4),
        y = top + 52 + i * STEP2,
        c = i === 3 ? P.authority : P.evidence;
      if (i === 3) {
        ring(left + 54, y, 16, { color: c, alpha: on, width: 2.5 });
        dot(left + 54, y, 6, { color: c, alpha: on });
      } else check(left + 54, y + 1, 22, { color: c, alpha: on });
      nameText(rows[i], left + 88, y, {
        align: "left",
        color: i === 3 ? P.authority : P.ink,
        alpha: stageF * listIn(t, ats, i),
        set: "report",
      });
    });
  }
  // The daily loop: the status command in a terminal, the one next action, and the look again, around one ring.
  if (stageG > 0) {
    const lead = 340 * (1 - soon(t, seeAt - 0.3, 0.5)),
      CX = 1200 + lead,
      CY = 500,
      R = 180,
      ats = [seeAt, doAt, againAt],
      q = (voiceTime(t) * 0.25) % 1,
      on = (i) => stageG * ramp(t, ats[i] - 0.15, 0.4);
    const W = 420,
      H = 130,
      TX = 330 + lead,
      TY = CY - H / 2;
    terminalIcon(TX, TY, W, H, { alpha: stageG, command: "ethos status", color: P.ink });
    nameText(L("状态命令", "The status command"), TX + W / 2, TY + H + NAME_GAP, {
      valign: "top",
      alpha: stageG * (en ? 1 : ramp(t, runAt - 0.3, 0.3)),
    });
    link(TX + W, CY, CX - R, CY, {
      alpha: stageG * ramp(t, statusAt - 0.15, 0.4),
      upto: soon(t, statusAt, 0.4),
    });
    ring(CX, CY, R, { color: P.muted, alpha: on(0), width: 3, upto: saidShare(t, ats) });
    const dotA = -Math.PI / 2 + q * Math.PI * 2;
    flowDot(CX + R * Math.cos(dotA), CY + R * Math.sin(dotA), 9, q, {
      color: P.evidence,
      alpha: on(2),
    });
    const marks = [
      [-Math.PI, L("看清现状和下一步", "See where things stand")],
      [-Math.PI / 2, L("只做这一步", "Take only that action")],
      [0, L("再看一次", "Look again")],
    ];
    marks.forEach(([a], i) => {
      const x = CX + R * Math.cos(a),
        y = CY + R * Math.sin(a);
      dot(x, y, 12, { color: i === 1 ? P.authority : P.evidence, alpha: on(i) });
    });
    nameText(marks[0][1], CX - R + 28, CY, {
      align: "left",
      width: 270,
      alpha: stageG * listIn(t, ats, 0),
      set: "loop",
    });
    nameText(marks[1][1], CX, CY - R - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageG * listIn(t, ats, 1),
      set: "loop",
    });
    nameText(marks[2][1], CX + R + NAME_GAP, CY, {
      align: "left",
      width: 180,
      alpha: stageG * listIn(t, ats, 2),
      set: "loop",
    });
  }
};
