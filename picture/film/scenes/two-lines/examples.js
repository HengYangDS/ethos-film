/* 02 two examples. */

import { blend } from "../../drawing/colour.js";
import { pipelineMark, signalMark } from "../../drawing/examples.js";
import { link } from "../../drawing/links.js";
import { box, dot, measure, path, ring, text } from "../../drawing/strokes.js";
import { agent, check, documentIcon, person, seal } from "../../drawing/symbols.js";
import { folderIcon, kernelIcon, recoverIcon, terminalIcon } from "../../drawing/workspace.js";
import { illustrative } from "../../framing/chapters.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, TERM_GAP, nameText, rejectedName } from "../../naming/names.js";
import { CONTENT_CY, railNames, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { STAGE_CUT, stageIn, stageOut } from "../../timing/stages.js";

scenes["02"] = function (s, t) {
  const [open, pipe, whole, rerun, dup] = cues(s, [
    ["先看两件", "Take two"],
    ["行情数据管线", "market-data pipeline"],
    ["数据完整", "the data must be complete"],
    ["重新跑一遍", "running the same batch"],
    ["重复的记录", "duplicate records"],
  ]);
  const [other, ask, backtest, moment, avail, period] = cues(s, [
    ["另一件", "The other"],
    ["要追问的是", "was every piece"],
    ["回测", "the backtest"],
    ["做决策的时候", "the moment of each decision"],
    ["拿得到吗", "actually available"],
    ["换一段时间", "a different period"],
  ]);
  // In Chinese a second question follows the period: the bracket asks it on its own words.
  const holds = en ? period : cue(s, "结论还站得住", "");
  const [both, tools, differ, owner] = cues(s, [
    ["这两件事", "Both can"],
    ["同一套工具", "the same tools"],
    ["标准却完全不同", "entirely different standards"],
    ["由项目自己来定", "belong to the project"],
  ]);
  const [askAt, good, valid, tie, aAt, bAt, cAt, dAt, own] = cues(s, [
    ["什么是好的数据", "ETHOS does not decide"],
    ["好的数据", "good data"],
    ["有效的信号", "a valid signal"],
    ["理顺几件事", "ties together"],
    ["意图怎么定", "intent is set"],
    ["怎么协作", "collaborate"],
    ["怎么检验", "results are verified"],
    ["要改的时候", "things change"],
    ["按自己的标准", "by its own standards"],
  ]);
  const [after, only, notMeasured] = cues(s, [
    ["后面就拿", "These two examples"],
    ["只是举例", "only illustrate"],
    ["不是实测", "not measured"],
  ]);
  const stageA = stageOut(t, other),
    stageB = stageIn(t, other) * stageOut(t, both),
    stageC = stageIn(t, both) * stageOut(t, askAt);
  const stageD = stageIn(t, askAt) * stageOut(t, after),
    stageE = stageIn(t, after);
  const q = (voiceTime(t) * 0.4) % 1;
  // Example one: the feed, the run and the records. Each requirement arrives on its words; a rerun returns along the
  // loop below, and the records it finds stay the same.
  if (stageA > 0) {
    const Y = 480,
      m = pipelineMark(960, Y, 1200, {
        alpha: stageA,
        flow: q,
        back: soon(t, rerun + 0.05, 0.9),
        lit: ramp(t, dup - 0.1, 0.4),
      });
    // The example's number and title share one line at the left edge of its mark, as the second example's do.
    const tag = L("例一", "Example one"),
      titleX = 360 + measure(tag, NOTE) + TERM_GAP;
    nameText(tag, 360, 272, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageA * named(t, open),
    });
    nameText(L("改进行情数据管线", "Improving a market-data pipeline"), titleX, 272, {
      align: "left",
      color: P.authority,
      alpha: stageA * named(t, pipe),
    });
    [
      [L("行情数据", "Market data"), m.feedX, pipe],
      [L("管线", "Pipeline"), m.runX, pipe],
      [L("记录", "Records"), m.storeX, dup],
    ].forEach(([v, x, at]) =>
      nameText(v, x, m.top - NAME_GAP, { valign: "bottom", alpha: stageA * named(t, at) }),
    );
    const left = L("数据完整", "Complete data"),
      right = L("重跑不多出记录", "No duplicates after a rerun");
    const W = 44 + measure(left) + 80 + 44 + measure(right),
      X = 960 - W / 2,
      RY = m.loop + 64;
    check(X + 14, RY, 24, { alpha: stageA * ramp(t, whole - 0.15, 0.4) });
    nameText(left, X + 44, RY, { align: "left", alpha: stageA * named(t, whole) });
    const X2 = X + 44 + measure(left) + 80;
    check(X2 + 14, RY, 24, { alpha: stageA * ramp(t, dup - 0.15, 0.4) });
    nameText(right, X2 + 44, RY, { align: "left", alpha: stageA * named(t, dup) });
    illustrative(stageA);
  }
  // Example two: the backtest over its time axis, named as the study from the first words, its axis as time. The
  // information it uses appears point by point as it is asked about; every point is asked whether it was available at
  // the moment of decision, and a bracket on the axis moves the question to a different period.
  if (stageB > 0) {
    const Y = 520,
      H = 260,
      band = stageB * ramp(t, period - 0.15, 0.4);
    const m = signalMark(960, Y, 1200, H, {
      alpha: stageB,
      seen: soon(t, ask - 0.1, 2.4),
      marker: ramp(t, moment - 0.15, 0.4),
    });
    const tag = L("例二", "Example two"),
      titleX = m.x0 + measure(tag, NOTE) + TERM_GAP;
    nameText(tag, m.x0, m.top - 28, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageB * named(t, other),
    });
    nameText(L("研究选股信号", "Studying a stock-selection signal"), titleX, m.top - 28, {
      align: "left",
      color: P.authority,
      alpha: stageB * named(t, other),
    });
    nameText(L("时间轴", "Time"), m.x1 + NAME_GAP, m.bottom, {
      align: "left",
      color: P.muted,
      alpha: stageB * named(t, other),
    });
    nameText(L("回测", "The backtest"), m.x1, m.bottom + NAME_GAP, {
      align: "right",
      valign: "top",
      alpha: stageB * named(t, backtest),
    });
    nameText(L("做决策的时候", "The moment of decision"), m.markerX + 14, m.top - 16, {
      align: "left",
      color: P.authority,
      alpha: stageB * named(t, moment),
    });
    const [fx, fy] = m.point(10);
    text("?", fx, fy - 40, 40, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageB * ramp(t, avail - 0.1, 0.4),
    });
    const bx0 = m.x0 + 40,
      bx1 = m.x0 + 500;
    path(
      [
        [bx0, m.bottom - 26],
        [bx0, m.bottom],
        [bx1, m.bottom],
        [bx1, m.bottom - 26],
      ],
      { color: P.evidence, alpha: band, width: 4 },
    );
    text("?", (bx0 + bx1) / 2, m.bottom - 56, 40, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageB * ramp(t, holds - 0.1, 0.4),
    });
    nameText(L("换一段时间", "A different period"), (bx0 + bx1) / 2, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, period),
    });
    illustrative(stageB);
  }
  // Both examples side by side. They share one bar of tools, while each carries its own standard, and the project in
  // the middle owns both.
  if (stageC > 0) {
    const LX = 540,
      RX = 1380,
      Y = 370,
      SY = 500;
    const p = pipelineMark(LX, Y, 620, { alpha: stageC, flow: q });
    signalMark(RX, Y + 6, 620, 130, { alpha: stageC, seen: 1, marker: 1 });
    nameText(L("改进行情数据管线", "Improving a market-data pipeline"), LX, p.top - 48, {
      valign: "bottom",
      alpha: stageC,
    });
    nameText(L("研究选股信号", "Studying a stock-selection signal"), RX, p.top - 48, {
      valign: "bottom",
      alpha: stageC,
    });
    const std = stageC * named(t, differ);
    const a = L("数据完整、重跑不重复", "Complete, no duplicates"),
      b = L("当时拿得到、换段时间站得住", "Available then, holds up later");
    seal(LX - measure(a) / 2 - 34, SY, 20, { alpha: std });
    nameText(a, LX + 0, SY, { color: P.authority, alpha: std });
    seal(RX - measure(b) / 2 - 34, SY, 20, { alpha: std });
    nameText(b, RX + 0, SY, { color: P.authority, alpha: std });
    const who = stageC * named(t, owner);
    person(960, SY - 8, { alpha: who, size: 1 });
    link(936, SY - 8, LX + measure(a) / 2 + 16, SY - 8, {
      alpha: who,
      upto: soon(t, owner + 0.1, 0.5),
    });
    link(984, SY - 8, RX - measure(b) / 2 - 62, SY - 8, {
      alpha: who,
      upto: soon(t, owner + 0.1, 0.5),
    });
    nameText(L("项目自己定", "The project decides"), 960, SY + 36 + NAME_GAP - 8, {
      valign: "top",
      color: P.authority,
      alpha: who,
    });
    const tool = stageC * ramp(t, tools - 0.15, 0.4),
      BY = 660,
      BH = 66;
    box(260, BY - BH / 2, 1400, BH, { fill: P.row, stroke: P.line, alpha: tool, radius: 12 });
    terminalIcon(960 - 480 - 26, BY - 20, 52, 40, { color: P.muted, alpha: tool });
    folderIcon(960 + 480 - 26, BY - 19, 52, 38, { color: P.muted, alpha: tool });
    nameText(L("同一套工具", "The same tools"), 960, BY, { alpha: stageC * named(t, tools) });
    illustrative(stageC);
  }
  // ETHOS leaves the two questions to the project. It ties together the four things the film goes on to show, each a
  // station reached from the kernel on its words, and under them the project judges by its own standards.
  if (stageD > 0) {
    const KX = 960,
      KR = 58,
      KY = mix(CONTENT_CY - 20, 350, soon(t, tie - 0.2, 0.6)),
      RY = 590,
      R = 40;
    kernelIcon(KX, KY, KR, { alpha: stageD });
    text("ETHOS", KX, KY - KR - NAME_GAP - 18, 40, {
      role: "mark",
      bold: true,
      align: "center",
      color: P.authority,
      alpha: stageD,
    });
    rejectedName(L("什么是好的数据", "What good data is"), KX - KR - 70, KY, {
      align: "right",
      alpha: stageD * named(t, en ? askAt + STAGE_CUT + 0.1 : good),
      mark: ramp(t, good + 0.3, 0.4),
    });
    rejectedName(L("什么是有效的信号", "What a valid signal is"), KX + KR + 70, KY, {
      align: "left",
      alpha: stageD * named(t, valid),
      mark: ramp(t, valid + 0.3, 0.4),
    });
    const names = en
      ? ["How intent is set", "How we collaborate", "How results are verified", "How things change"]
      : ["意图怎么定", "大家怎么协作", "结果怎么检验", "要改的时候怎么改"];
    const xs = railStations(names, 420, 1500),
      ats = [aAt, bAt, cAt, dAt];
    xs.forEach((x, i) => {
      const on = stageD * ramp(t, ats[i] - 0.15, 0.4),
        lit = speaking(t, ats, i),
        c = blend(P.ink, P.evidence, lit);
      link(KX, KY + KR, x, RY - R, {
        route: "vhv",
        mid: 490,
        alpha: stageD * ramp(t, tie - 0.15, 0.4),
        upto: soon(t, tie + i * 0.12, 0.6),
        color: P.line,
      });
      dot(x, RY, R, { color: P.ground, alpha: on });
      ring(x, RY, R, { color: c, alpha: on, width: 2.5 });
      if (i === 0) documentIcon(x - 13, RY - 17, 26, 34, { alpha: on, rows: 2, stroke: c });
      if (i === 1) {
        person(x - 13, RY + 2, { alpha: on, color: c, size: 0.55 });
        agent(x + 15, RY - 2, { alpha: on, size: 0.55, color: c });
      }
      if (i === 2) check(x, RY + 2, 30, { color: c, alpha: on });
      if (i === 3) recoverIcon(x, RY, 17, { color: c, alpha: on });
    });
    railNames(names, xs, RY + R, {
      gap: NAME_GAP,
      alpha: (i) => stageD * listIn(t, ats, i),
      set: "ties",
      wrap: 260,
    });
    nameText(L("项目按自己的标准判断", "The project judges by its own standards"), KX, 730, {
      valign: "top",
      color: P.authority,
      alpha: stageD * named(t, own),
    });
  }
  // The two examples return, marked as what they are.
  if (stageE > 0) {
    const LX = 560,
      RX = 1360,
      Y = 400;
    pipelineMark(LX, Y, 640, { alpha: stageE, flow: q });
    signalMark(RX, Y + 6, 640, 130, { alpha: stageE, seen: 1, marker: 1 });
    nameText(L("改进行情数据管线", "Improving a market-data pipeline"), LX, Y + 71 + NAME_GAP, {
      valign: "top",
      alpha: stageE,
    });
    nameText(L("研究选股信号", "Studying a stock-selection signal"), RX, Y + 71 + NAME_GAP, {
      valign: "top",
      alpha: stageE,
    });
    nameText(L("只是举例", "Only illustrations"), 960, 610, {
      color: P.evidence,
      alpha: stageE * named(t, only),
    });
    rejectedName(L("实测的结果", "Measured results"), 960, 668, {
      alpha: stageE * named(t, notMeasured),
      mark: ramp(t, notMeasured + 0.3, 0.4),
    });
    illustrative(stageE);
  }
};
