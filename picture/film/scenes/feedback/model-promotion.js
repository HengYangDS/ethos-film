/* 15 model promotion. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { laneTrack, writeGate } from "../../drawing/lanes.js";
import { link } from "../../drawing/links.js";
import { modelGrid } from "../../drawing/models.js";
import { box, dashed, dot, line, stroke, text } from "../../drawing/strokes.js";
import { check, cross, documentIcon, seal } from "../../drawing/symbols.js";
import { kernelIcon } from "../../drawing/workspace.js";
import { beats, building, listIn, listLevel, named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, rejectedName } from "../../naming/names.js";
import { railNames, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, pass, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* The conflicting cases: three rings drawn as one mark. */
function s15Cases(points, r, { alpha = 1, color = P.unknown } = {}) {
  if (alpha < 0.01) return;
  stroke(
    () =>
      points.forEach(([x, y]) => {
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }),
    { color, alpha, width: 3 },
  );
}
scenes["15"] = function (s, t) {
  const [newAt, modelAt, conceptsAt, statAt] = cues(s, [
    ["新的情况", "a new situation"],
    ["这里说的模型", "Model here means"],
    ["概念和结构", "the concepts and structures"],
    ["不是统计模型", "not a statistical"],
  ]);
  const [twoAt, validAt, clashAt, rightAt, loseAt] = cues(s, [
    ["两份都有效的输入", "Two valid inputs"],
    ["有效", "valid"],
    ["互相矛盾", "contradict each other"],
    ["用现有的模型", "the current model cannot"],
    ["总要丢掉一些信息", "losing information"],
  ]);
  const [reportAt, ethosAt, needAt, blockAt, stopAt, waitAt, unrelAt] = cues(s, [
    ["按设计", "By design"],
    ["这时 ETHOS", "ETHOS then"],
    ["ETHOS 会报告", "reports that Model Promotion"],
    ["依赖这层含义的改动", "every change"],
    ["也会先停下", "is blocked"],
    ["等模型提升做完", "until Model Promotion is done"],
    ["跟它无关的工作", "unrelated work"],
  ]);
  const termAt = en ? null : cue(s, "Model Promotion", "");
  const [howAt, keepAt, evidAt, smallAt, holdAt] = cues(s, [
    ["模型提升的做法", "Model Promotion means"],
    ["留住那些互相冲突", "keeping the conflicting"],
    ["和证据", "their evidence"],
    ["找到模型里", "finding the smallest"],
    ["把它改到能装下", "changing it"],
  ]);
  const [thenAt, recompAt, plansAt, viewsAt, verifyAt, coverAt, oldAt, absorbAt, retireAt] = cues(
    s,
    [
      ["然后重新编译", "After that"],
      ["重新编译", "are recompiled"],
      ["计划", "the plans"],
      ["视图", "the views"],
      ["再检验", "the new model is verified"],
      ["该覆盖的情况", "cover every case"],
      ["旧模型留下的东西", "what is left of the old"],
      ["吸收进新模型", "absorbed"],
      ["要么撤掉", "or retired"],
    ],
  );
  const [noAt, exAt, alAt, faAt, shAt, parAt] = cues(s, [
    ["整个过程不能靠", "No exception"],
    ["加例外", "exception"],
    ["加别名", "alias"],
    ["加兜底路径", "fallback"],
    ["兼容代码", "compatibility shim"],
    ["另立一个权威来源", "no parallel source"],
  ]);
  const stageA = stageOut(t, twoAt),
    stageB = stageIn(t, twoAt) * stageOut(t, reportAt),
    stageC = stageIn(t, reportAt) * stageOut(t, howAt),
    stageD = stageIn(t, howAt) * stageOut(t, thenAt),
    stageE = stageIn(t, thenAt) * stageOut(t, noAt),
    stageF = stageIn(t, noAt);
  const MW = 480,
    MH = 300,
    MX = 560,
    MY = 320;
  // A new situation will not fit the model: a shape stops at the grid's edge. Both stand from the first word, and their
  // names come in as the clause that names them begins, within the quarter second a name may lead it. "Model" here is
  // concepts and structures: the grid takes the colour of authority as the word is explained, and a statistical model
  // is refused as the meaning.
  if (stageA > 0) {
    const fit = soon(t, newAt + 0.1, 1.2),
      sx = mix(1500, 1200, fit),
      sy = MY + MH / 2,
      opened = named(t, newAt - 0.25);
    modelGrid(MX, MY, MW, MH, {
      alpha: stageA,
      color: blend(P.ink, P.authority, soon(t, modelAt, 0.4)),
    });
    nameText(L("现有的模型", "The model as it stands"), MX + MW / 2, MY + MH + NAME_GAP, {
      valign: "top",
      alpha: stageA * opened,
    });
    stroke(
      () => {
        ctx.arc(sx, sy, 86, 0, Math.PI * 2);
      },
      { color: P.unknown, alpha: stageA, width: 3.5 },
    );
    text("?", sx, sy + 2, 56, { role: "mark", align: "center", color: P.unknown, alpha: stageA });
    nameText(L("新的情况", "A new situation"), sx, sy + 86 + NAME_GAP, {
      valign: "top",
      color: P.unknown,
      alpha: stageA * opened,
    });
    nameText(L("概念和结构", "Concepts and structures"), MX + MW / 2, MY - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageA * named(t, conceptsAt),
    });
    rejectedName(L("统计模型", "A statistical model"), 310, MY + MH / 2, {
      alpha: stageA * named(t, statAt),
      mark: ramp(t, statAt + 0.3, 0.4),
    });
  }
  // Two causes. Two inputs, each sealed as valid when it is said, contradict each other; then the model takes up the
  // situation on the right and can hold it only by losing part of it, the lost points falling away. The two inputs
  // differ in size, so the one name beneath them names the pair, not a list of two documents.
  if (stageB > 0) {
    const LX = 480,
      RX = 1420,
      Y = 450,
      ri = stageB * ramp(t, rightAt - 0.15, 0.4),
      va = stageB * ramp(t, validAt - 0.15, 0.4),
      cl = stageB * ramp(t, clashAt - 0.15, 0.4),
      shift = 420 * (1 - soon(t, rightAt - 0.3, 0.5)),
      DX = LX + shift,
      lost = soon(t, loseAt, 0.8);
    documentIcon(DX - 305, Y - 110, 170, 220, { alpha: stageB, rows: 5, stroke: P.authority });
    documentIcon(DX + 146, Y - 82, 148, 192, { alpha: stageB, rows: 4, stroke: P.authority });
    seal(DX - 220, Y - 110, 26, { alpha: va });
    seal(DX + 220, Y - 82, 26, { alpha: va });
    stroke(
      () => {
        ctx.moveTo(DX - 26, Y - 14);
        ctx.lineTo(DX + 26, Y - 14);
        ctx.moveTo(DX - 26, Y + 14);
        ctx.lineTo(DX + 26, Y + 14);
        ctx.moveTo(DX + 14, Y - 34);
        ctx.lineTo(DX - 14, Y + 34);
      },
      { color: P.unknown, alpha: cl, width: 4.5 },
    );
    nameText(L("两份有效的输入互相矛盾", "Two valid inputs contradict"), DX, Y + 110 + NAME_GAP, {
      valign: "top",
      width: 420,
      alpha: stageB,
      set: "causes",
    });
    modelGrid(RX - 170, Y - 100, 340, 200, { alpha: ri });
    stroke(() => ctx.arc(RX + 170, Y, 70, Math.PI * 0.5, Math.PI * 1.5), {
      color: P.unknown,
      alpha: ri,
      width: 3.5,
    });
    dashed(RX + 170, Y - 70, RX + 170, Y + 70, { color: P.unknown, alpha: ri });
    [
      [230, -34],
      [254, 6],
      [226, 38],
    ].forEach(([dx, dy]) =>
      dot(RX + dx + 46 * lost, Y + dy + 30 * lost * Math.sign(dy || 1), 7, {
        color: P.unknown,
        alpha: ri * (1 - lost),
      }),
    );
    nameText(
      L("表达时总要丢掉一些信息", "Held only by losing information"),
      RX,
      Y + 110 + NAME_GAP,
      { valign: "top", width: 440, alpha: stageB * named(t, rightAt), set: "causes" },
    );
  }
  // ETHOS reports the need as it is named. A change that depends on the unresolved meaning travels its lane and stops at a gate, which
  // waits on Model Promotion, and unrelated work runs on.
  if (stageC > 0) {
    const TY = mix(450, 340, soon(t, blockAt - 0.3, 0.5)),
      Y1 = 540,
      Y2 = 670,
      q = (voiceTime(t) * 0.4) % 1,
      rep = stageC * ramp(t, needAt - 0.15, 0.4),
      bl = stageC * ramp(t, blockAt - 0.15, 0.4),
      un = stageC * ramp(t, unrelAt - 0.15, 0.4);
    kernelIcon(420, TY, 70, { alpha: stageC });
    nameText("ETHOS", 420, TY + 70 + 12, { valign: "top", alpha: stageC * named(t, ethosAt) });
    link(490, TY, 800, TY, { alpha: rep, upto: soon(t, needAt, 0.4), color: P.authority });
    box(800, TY - 48, 560, 96, {
      fill: P.row,
      stroke: P.authority,
      alpha: rep,
      radius: 12,
      width: 3,
    });
    nameText(L("需要做模型提升", "Model Promotion required"), 1080, TY - 1, {
      color: P.authority,
      alpha: rep,
      bold: true,
    });
    if (termAt !== null)
      nameText("Model Promotion", 1360 + NAME_GAP, TY, {
        align: "left",
        size: NOTE,
        color: P.muted,
        alpha: stageC * named(t, termAt),
      });
    laneTrack(420, 1040, Y1, { alpha: bl, flow: null });
    writeGate(1090, Y1, 96, { alpha: bl });
    dot(mix(500, 1000, soon(t, blockAt + 0.1, Math.max(0.8, stopAt - blockAt))), Y1, 9, {
      color: P.authority,
      alpha: bl,
    });
    link(1090, Y1 - 48, 1090, TY + 48, {
      alpha: stageC * ramp(t, waitAt - 0.15, 0.4),
      upto: soon(t, waitAt, 0.5),
      dash: [8, 9],
      color: P.muted,
    });
    nameText(L("依赖这层含义的改动先停下", "Changes that depend on it wait"), 1150, Y1, {
      align: "left",
      width: 420,
      alpha: stageC * named(t, blockAt),
    });
    laneTrack(420, 1040, Y2, { alpha: un, flow: q });
    nameText(L("其他工作照常进行", "Unrelated work continues"), 1150, Y2, {
      align: "left",
      width: 420,
      alpha: stageC * named(t, unrelAt),
    });
  }
  // The promotion itself: the conflicting cases are kept beside the model and their evidence beside them, the smallest
  // affected cell lights, and it grows until it holds them.
  if (stageD > 0) {
    const GX = 800,
      GY = 330,
      GW = 560,
      GH = 280,
      ke = stageD * ramp(t, keepAt - 0.15, 0.4),
      ev = stageD * ramp(t, evidAt - 0.15, 0.4),
      sm = stageD * ramp(t, smallAt - 0.15, 0.4),
      ho = soon(t, holdAt + 0.1, 1.1),
      CX = 380,
      CY = 470;
    modelGrid(GX, GY, GW, GH, { alpha: stageD, cell: [2, 1], lit: sm, grow: ho });
    nameText(L("模型提升的做法", "Model Promotion"), GX + GW / 2, GY - NAME_GAP, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageD,
    });
    nameText(L("模型", "Model"), GX + GW / 2, GY + GH + NAME_GAP, { valign: "top", alpha: stageD });
    s15Cases(
      [
        [-40, -60],
        [50, -30],
        [-20, 50],
      ].map(([dx, dy]) => [
        mix(CX + dx, GX + GW * 0.62 + dx * 0.35, ho),
        mix(CY + dy, GY + GH / 2 + dy * 0.35, ho),
      ]),
      22,
      { alpha: ke },
    );
    documentIcon(CX - 150, CY + 10, 62, 80, { alpha: ev, rows: 2, stroke: P.evidence });
    nameText(L("冲突的情况和证据", "The conflicting cases and evidence"), CX, CY + 110, {
      valign: "top",
      width: 340,
      alpha: stageD * named(t, keepAt),
      set: "steps",
    });
    nameText(L("受影响的最小部分", "The smallest affected part"), 1420, GY + GH / 2 - 60, {
      align: "left",
      width: 300,
      color: P.authority,
      alpha: stageD * named(t, smallAt),
      set: "steps",
    });
    nameText(L("改到能装下", "Changed to hold them"), 1420, GY + GH / 2 + 50, {
      align: "left",
      width: 300,
      alpha: stageD * named(t, holdAt),
      set: "steps",
    });
  }
  // Then the rest follows: the compiler takes up the plans and the views that depend on the model, the new model is
  // verified to cover every case, and what is left of the old one is absorbed into it or retired.
  if (stageE > 0) {
    const ats = [recompAt, verifyAt, oldAt],
      names = en
        ? ["Plans and views recompiled", "Every case verified", "The old absorbed or retired"]
        : ["重新编译计划和视图", "检验该覆盖的都覆盖了", "旧模型吸收或撤掉"],
      bx = building(t, ats, 280, 0.35),
      xs = railStations(names, 400, 1520, { wrap: 300 }).map((x) => x + bx),
      Y = 450;
    const on = (i) => stageE * ramp(t, (i ? ats[i] : thenAt) - 0.15, 0.4),
      pl = stageE * ramp(t, plansAt - 0.15, 0.4),
      vw = stageE * ramp(t, viewsAt - 0.15, 0.4),
      taken = soon(t, absorbAt, 0.9);
    line(xs[0] + 150, Y, xs[1] - 100, Y, { color: P.muted, alpha: on(1), width: 3 });
    line(xs[1] + 100, Y, xs[2] - 100, Y, { color: P.muted, alpha: on(2), width: 3 });
    kernelIcon(xs[0] - 70, Y, 88, { alpha: on(0) });
    beats(t, xs[0] - 70, Y, 96, [recompAt], { color: P.authority, alpha: on(0) });
    documentIcon(xs[0] + 44, Y - 80, 116, 132, { alpha: vw, rows: 3, stroke: P.evidence });
    documentIcon(xs[0] + 30, Y - 66, 116, 132, { alpha: pl, rows: 3, stroke: P.evidence });
    nameText(L("依赖模型的那些", "What depends on the model"), xs[0], Y - 106, {
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: on(0),
    });
    modelGrid(xs[1] - 90, Y - 54, 180, 108, { alpha: on(1) });
    check(xs[1], Y, 50, {
      alpha: stageE * ramp(t, coverAt - 0.15, 0.4),
      color: P.evidence,
      width: 5,
      upto: soon(t, coverAt, 0.5),
    });
    modelGrid(xs[2] - 90, Y - 54, 180, 108, { alpha: on(2), color: P.muted });
    // What is absorbed travels along the rail into the new model; the old model is then crossed out as retired.
    if (taken > 0 && taken < 1)
      box(mix(xs[2] - 30, xs[1] - 30, taken), Y - 18, 60, 36, {
        stroke: P.muted,
        alpha: on(2) * pass(taken, 0.2),
        radius: 6,
        width: 2.5,
      });
    cross(xs[2] + 90, Y - 54, 28, { alpha: stageE * ramp(t, retireAt - 0.15, 0.4), width: 3.5 });
    railNames(names, xs, Y + 86, {
      gap: NAME_GAP,
      alpha: (i) =>
        stageE * (i ? listIn(t, ats, i) : ramp(t, thenAt - 0.05, 0.4) * listLevel(t, ats, 0)),
      set: "after",
      wrap: 300,
    });
  }
  // No way around it: five refused devices, each on its words under the heading of ways around, beside the one model
  // that stands.
  if (stageF > 0) {
    const ats = [exAt, alAt, faAt, shAt],
      names = en
        ? ["An exception", "An alias", "A fallback", "A compatibility shim"]
        : ["加例外", "加别名", "加兜底路径", "兼容代码"],
      GX = 800,
      GY = 350,
      GW = 320,
      GH = 200,
      RX = 1260,
      ys = [340, 420, 500, 580];
    modelGrid(GX - 300, GY + 40, GW, GH, { alpha: stageF, color: P.authority });
    nameText(L("唯一的模型", "The one model"), GX - 300 + GW / 2, GY + 40 + GH + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageF,
    });
    nameText(L("绕过去的办法", "Ways around it"), RX - 240, ys[0] - 30 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageF,
    });
    ats.forEach((at, i) =>
      rejectedName(names[i], RX - 240, ys[i], {
        align: "left",
        alpha: stageF * named(t, at),
        mark: ramp(t, at + 0.3, 0.4),
        set: "refused",
      }),
    );
    rejectedName(L("另立一个权威来源", "A parallel source of truth"), RX - 240, ys[3] + 100, {
      align: "left",
      alpha: stageF * named(t, parAt),
      mark: ramp(t, parAt + 0.3, 0.4),
    });
  }
};
