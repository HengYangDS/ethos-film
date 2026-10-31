/* 13 answered in real use. */

import { blend } from "../../drawing/colour.js";
import { pipelineMark, signalMark } from "../../drawing/examples.js";
import { link } from "../../drawing/links.js";
import { box, dashed, dot, line, path, ring, text } from "../../drawing/strokes.js";
import { documentIcon, seal } from "../../drawing/symbols.js";
import { kernelIcon, tagIcon, terminalIcon } from "../../drawing/workspace.js";
import { clearOfTitle, illustrative } from "../../framing/chapters.js";
import { building, listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, rejectedName } from "../../naming/names.js";
import { railNames, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["13"] = function (s, t) {
  const [pipe, sig] = cues(s, [
    ["行情数据管线", "the market-data pipeline"],
    ["选股信号", "the stock-selection signal"],
  ]);
  const [suppose, checksAt, deployAt, missAt, dupAt, realAt] = cues(s, [
    ["就算检查都通过了", "Suppose the checks"],
    ["检查都通过了", "the checks pass"],
    ["版本也部署了", "the version is deployed"],
    ["有没有漏", "Is any market data"],
    ["多出重复的记录", "any records duplicated"],
    ["到实际环境里", "Only real use"],
  ]);
  const [showAt, verAt, envAt, baseAt, winAt] = cues(s, [
    ["这次的结论", "What the result"],
    ["哪个版本", "which version"],
    ["什么环境", "what environment"],
    ["什么基线", "which baseline"],
    ["哪段时间", "observation window"],
  ]);
  const [interim] = cues(s, [["部署成功", "A successful deployment"]]);
  const interimName = cue(s, "阶段性的结论", "intermediate claims");
  const [signalAt, infoAt, availAt, sampleAt, unsureAt] = cues(s, [
    ["信号研究也一样", "The signal study"],
    ["回测用到的信息", "the information the backtest"],
    ["当时真的能知道吗", "really available"],
    ["某一段样本", "one stretch"],
    ["哪些地方还不确定", "where does uncertainty"],
  ]);
  const [histAt, futureAt] = cues(s, [
    ["历史回测", "A historical backtest"],
    ["将来的交易收益", "future trading returns"],
  ]);
  const [mapAt, ethosAt, obsAt, reqAt, devAt, ownAt] = cues(s, [
    ["按设计", "ETHOS is designed"],
    ["ETHOS 要把", "ETHOS is designed"],
    ["这些观察", "these observations"],
    ["原来的要求和假设", "the original requirements"],
    ["开发上的指标", "development metrics"],
    ["衡量业务成败的标准", "own measure"],
  ]);
  const stageA = stageOut(t, suppose),
    stageB = stageIn(t, suppose) * stageOut(t, showAt),
    stageC = stageIn(t, showAt) * stageOut(t, interim),
    stageD = stageIn(t, interim) * stageOut(t, signalAt);
  const stageE = stageIn(t, signalAt) * stageOut(t, histAt),
    stageF = stageIn(t, histAt) * stageOut(t, mapAt),
    stageG = stageIn(t, mapAt);
  const q = (voiceTime(t) * 0.4) % 1;
  // The two examples return under the headings they had at the start, and each takes its name on its words.
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 300),
      LX = 520,
      RX = 1400,
      Y = 470,
      HY = 337;
    pipelineMark(LX, Y, 680, { alpha: g, flow: q });
    signalMark(RX, Y, 680, 190, { alpha: g, seen: 1, marker: 1 });
    nameText(L("例一", "Example one"), LX, HY, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: g,
    });
    nameText(L("例二", "Example two"), RX, HY, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: g,
    });
    nameText(L("行情数据管线", "Market-data pipeline"), LX, Y + 95 + NAME_GAP, {
      valign: "top",
      alpha: g * named(t, pipe),
      set: "examples",
    });
    nameText(L("选股信号", "Stock-selection signal"), RX, Y + 95 + NAME_GAP, {
      valign: "top",
      alpha: g * named(t, sig),
      set: "examples",
    });
    illustrative(g);
  }
  // Passing checks and a deployment stand above the pipeline; the two questions are asked at its ends, and only real use
  // can answer them.
  if (stageB > 0) {
    const Y = 505,
      m = pipelineMark(960, Y, 1160, { alpha: stageB, flow: q, back: soon(t, dupAt - 0.4, 0.8) }),
      TY = 315;
    const ck = stageB * ramp(t, checksAt - 0.15, 0.4),
      dp = stageB * ramp(t, deployAt - 0.15, 0.4);
    seal(760, TY, 28, { alpha: ck, color: P.evidence });
    nameText(L("检查都通过", "Checks pass"), 760 + 28 + 14, TY, {
      align: "left",
      alpha: stageB * named(t, checksAt),
      set: "passed",
    });
    seal(1060, TY, 28, { alpha: dp, color: P.evidence });
    nameText(L("版本部署", "Deployed"), 1060 + 28 + 14, TY, {
      align: "left",
      alpha: stageB * named(t, deployAt),
      set: "passed",
    });
    const miss = stageB * ramp(t, missAt - 0.15, 0.4),
      dup = stageB * ramp(t, dupAt - 0.15, 0.4);
    text("?", m.feedX, m.top - 34, 46, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: miss,
    });
    text("?", m.storeX, m.top - 34, 46, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: dup,
    });
    nameText(L("数据有没有漏", "Any data missing?"), m.feedX - 56, Y, {
      align: "right",
      width: 170,
      alpha: stageB * named(t, missAt),
    });
    nameText(L("有没有重复", "Any duplicates?"), m.storeX, m.loop + 14, {
      valign: "top",
      alpha: stageB * named(t, dupAt),
    });
    nameText(L("要到实际环境里找答案", "Only real use can answer"), 960, 745, {
      color: P.authority,
      alpha: stageB * named(t, realAt),
    });
    illustrative(stageB);
  }
  // A result is readable only with its conditions: four stations under it, each with its mark, on its words.
  if (stageC > 0) {
    const Y = mix(470, 300, soon(t, verAt - 0.3, 0.5)),
      RY = 560,
      R = 44,
      ats = [verAt, envAt, baseAt, winAt],
      names = en
        ? ["Which version", "What environment", "Which baseline", "What window"]
        : ["哪个版本", "什么环境", "什么基线", "哪段时间"],
      bx = building(t, ats, 187, 0.55),
      xs = railStations(names, 400, 1520).map((x) => x + bx);
    box(750, Y - 68, 420, 136, {
      fill: P.row,
      stroke: P.evidence,
      alpha: stageC,
      radius: 14,
      width: 2.5,
    });
    nameText(L("这次的结论", "This result"), 960, Y, {
      color: P.evidence,
      alpha: stageC,
      bold: true,
    });
    nameText(L("能说明什么", "What it can show"), 960, Y - 68 - 12, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC,
    });
    nameText(L("要看条件", "Depends on its conditions"), 1170 + 16, Y, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageC,
    });
    xs.forEach((x, i) => {
      const on = stageC * ramp(t, ats[i] - 0.15, 0.4),
        c = blend(P.ink, P.evidence, speaking(t, ats, i));
      link(960, Y + 68, x, RY - R, {
        route: "vhv",
        mid: 440,
        alpha: on,
        upto: soon(t, ats[i], 0.5),
      });
      dot(x, RY, R, { color: P.ground, alpha: on });
      ring(x, RY, R, { color: c, alpha: on, width: 2.5 });
      if (i === 0) tagIcon(x - 26, RY, 52, 26, { alpha: on, color: c });
      if (i === 1) {
        box(x - 24, RY - 18, 48, 36, { stroke: c, alpha: on, radius: 6 });
        line(x - 24, RY - 6, x + 24, RY - 6, { color: c, alpha: on });
      }
      if (i === 2) {
        path(
          [
            [x - 24, RY + 12],
            [x - 8, RY - 2],
            [x + 6, RY + 4],
            [x + 24, RY - 14],
          ],
          { color: c, alpha: on },
        );
        dashed(x - 26, RY + 2, x + 26, RY + 2, { color: P.muted, alpha: on });
      }
      if (i === 3) {
        path(
          [
            [x - 22, RY - 12],
            [x - 22, RY + 12],
            [x + 22, RY + 12],
            [x + 22, RY - 12],
          ],
          { color: c, alpha: on, width: 3 },
        );
      }
    });
    railNames(names, xs, RY + R, {
      gap: NAME_GAP,
      alpha: (i) => stageC * listIn(t, ats, i),
      set: "conditions",
    });
    illustrative(stageC);
  }
  // Deployment and checks are two points on a longer road, whose end is still dashed.
  if (stageD > 0) {
    const Y = 470,
      X0 = 280,
      X1 = 1640,
      mid = 880;
    line(X0, Y, mid, Y, { color: P.evidence, alpha: stageD, width: 5 });
    dashed(mid, Y, X1 - 40, Y, { color: P.muted, alpha: stageD, width: 3 });
    seal(480, Y, 44, { alpha: stageD, color: P.evidence });
    seal(800, Y, 44, { alpha: stageD, color: P.evidence });
    nameText(L("部署成功", "Deployment succeeded"), 480, Y + 44 + NAME_GAP, {
      valign: "top",
      width: 240,
      alpha: stageD,
      set: "claims",
    });
    nameText(L("检查通过", "Checks passed"), 800, Y + 44 + NAME_GAP, {
      valign: "top",
      alpha: stageD,
      set: "claims",
    });
    ring(X1, Y, 44, { color: P.muted, alpha: stageD, width: 2.5, dash: [6, 6] });
    text("?", X1, Y + 2, 40, { role: "mark", align: "center", color: P.muted, alpha: stageD });
    nameText(L("业务结果", "Business outcome"), X1, Y + 44 + NAME_GAP, {
      valign: "top",
      width: 220,
      color: P.muted,
      alpha: stageD,
    });
    const a = stageD * named(t, interimName);
    path(
      [
        [440, Y - 76],
        [440, Y - 96],
        [840, Y - 96],
        [840, Y - 76],
      ],
      { color: P.authority, alpha: a, width: 2.5 },
    );
    nameText(L("都只是阶段性的", "Intermediate claims"), 640, Y - 96 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: a,
    });
  }
  // The signal study keeps asking: the information the backtest used appears point by point against the moment of
  // decision, then the one stretch of the sample, and what remains uncertain.
  if (stageE > 0) {
    const Y = 500,
      H = 280,
      m = signalMark(960, Y, 1200, H, { alpha: stageE, seen: soon(t, infoAt, 0.9), marker: 1 }),
      ats = [availAt, sampleAt, unsureAt];
    nameText(L("信号研究", "The signal study"), 960, m.top - 72, {
      valign: "bottom",
      color: P.authority,
      alpha: stageE,
    });
    const av = stageE * ramp(t, availAt - 0.15, 0.4),
      sa = stageE * ramp(t, sampleAt - 0.15, 0.4),
      un = stageE * ramp(t, unsureAt - 0.15, 0.4);
    const [fx, fy] = m.point(8);
    text("?", fx, fy - 42, 40, { role: "mark", align: "center", color: P.unknown, alpha: av });
    const b0 = m.x0 + 60,
      b1 = m.x0 + 460;
    path(
      [
        [b0, m.bottom - 24],
        [b0, m.bottom],
        [b1, m.bottom],
        [b1, m.bottom - 24],
      ],
      { color: P.evidence, alpha: sa, width: 4 },
    );
    box(m.x1 - 150, m.top - 8, 150, H, { stroke: P.unknown, alpha: un, radius: 8, dash: [8, 8] });
    const names = en
      ? ["Available at the time?", "One stretch of the sample?", "Where uncertainty remains"]
      : ["当时能知道吗", "只靠某一段样本吗", "还有哪些不确定"];
    nameText(names[0], fx, m.top - 16 - NAME_GAP, {
      valign: "bottom",
      width: 340,
      alpha: stageE * listIn(t, ats, 0),
      set: "asks",
    });
    nameText(names[1], (b0 + b1) / 2, m.bottom + NAME_GAP, {
      valign: "top",
      width: 400,
      alpha: stageE * listIn(t, ats, 1),
      set: "asks",
    });
    nameText(names[2], m.x1 - 75, m.bottom + NAME_GAP, {
      valign: "top",
      width: 300,
      alpha: stageE * listIn(t, ats, 2),
      set: "asks",
    });
    illustrative(stageE);
  }
  // The curve ends at today; beyond it, returns are not drawn at all, only refused as something the backtest could prove.
  if (stageF > 0) {
    const Y = 470,
      H = 280,
      W = 900,
      X = 660,
      m = signalMark(X, Y, W, H, { alpha: stageF, seen: 1, marker: 0 }),
      [ex, ey] = m.point(11),
      fu = stageF * ramp(t, futureAt - 0.15, 0.4);
    nameText(L("历史回测", "A historical backtest"), X, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageF,
    });
    dashed(ex, m.top - 20, ex, m.bottom, { color: P.authority, alpha: stageF, width: 2.5 });
    [[-90], [-20], [50]].forEach(([dy]) =>
      dashed(ex + 8, ey, ex + 420, ey + dy, { color: P.muted, alpha: fu, width: 2.5 }),
    );
    text("?", ex + 460, ey - 20, 46, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: fu,
    });
    rejectedName(L("将来的交易收益", "Future trading returns"), ex + 230, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageF * named(t, futureAt),
      mark: ramp(t, futureAt + 0.3, 0.4),
      width: 400,
    });
    illustrative(stageF);
  }
  // ETHOS ties the observations back to the original requirements. Development metrics are refused as a stand-in, and
  // the project's own measure keeps its seal.
  if (stageG > 0) {
    const lead = 200 * (1 - soon(t, reqAt - 0.3, 0.5)),
      Y = mix(450, 340, soon(t, devAt - 0.3, 0.5)),
      OX = 420 + lead,
      KX = 920 + lead,
      DX = 1420 + lead,
      ob = stageG * ramp(t, obsAt - 0.15, 0.4),
      re = stageG * ramp(t, reqAt - 0.15, 0.4),
      dv = stageG * ramp(t, devAt - 0.15, 0.4),
      ow = stageG * ramp(t, ownAt - 0.15, 0.4),
      fl = (voiceTime(t) * 0.45) % 1;
    [
      [-40, -44],
      [10, -18],
      [-22, 18],
      [36, 40],
      [-46, 56],
    ].forEach(([dx, dy]) => dot(OX + dx, Y + dy, 9, { color: P.evidence, alpha: ob }));
    nameText(L("这些观察", "These observations"), OX, Y + 72 + 10, {
      valign: "top",
      alpha: stageG * named(t, obsAt),
    });
    kernelIcon(KX, Y, 60, { alpha: stageG });
    nameText("ETHOS", KX, Y + 60 + 12, { valign: "top", alpha: stageG * named(t, ethosAt) });
    link(OX + 64, Y, KX - 54, Y, {
      alpha: ob,
      upto: soon(t, obsAt, 0.5),
      flow: fl,
      color: P.evidence,
    });
    link(KX + 54, Y, DX - 50, Y, { alpha: re, upto: soon(t, reqAt, 0.5), flow: fl });
    documentIcon(DX - 50, Y - 64, 100, 128, { alpha: re, rows: 4, stroke: P.authority });
    nameText(L("原来的要求和假设", "Original requirements, hypotheses"), DX, Y + 64 + 12, {
      valign: "top",
      width: 360,
      color: P.authority,
      alpha: stageG * named(t, reqAt),
    });
    const LY = 620;
    terminalIcon(500, LY - 50, 170, 100, { alpha: dv, color: P.muted });
    rejectedName(L("开发上的指标", "Development metrics"), 690, LY, {
      align: "left",
      alpha: stageG * named(t, devAt),
      mark: ramp(t, devAt + 0.3, 0.4),
    });
    seal(1190, LY, 42, { alpha: ow });
    nameText(L("项目自己的标准", "The project's own measure"), 1190 + 42 + 16, LY, {
      align: "left",
      color: P.authority,
      alpha: stageG * named(t, ownAt),
    });
  }
};
