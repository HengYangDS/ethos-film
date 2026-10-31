/* 05 one definition, existing tools first. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { along, link, rounded } from "../../drawing/links.js";
import { box, dot, flowDot, labelSize, line, measure, path, ring, stroke } from "../../drawing/strokes.js";
import { check, cross, documentIcon, lock } from "../../drawing/symbols.js";
import { kernelIcon, repoIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, rejectedName, termRow } from "../../naming/names.js";
import { CONTENT_CY } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["05"] = function (s, t) {
  const [reqAt, mean, sameAt, module, onlyBy, oneModule, iface, tests, docs, own, ownerAt] = cues(
    s,
    [
      ["要求明确", "a requirement"],
      ["还要保证", "it has to mean"],
      ["同一个意思", "the same thing"],
      ["重复记录", "How a duplicate"],
      ["只该由", "should be defined"],
      ["那一个模块", "the one module"],
      ["接口", "the interfaces"],
      ["测试", "tests"],
      ["文档", "documentation"],
      ["不各写一套", "instead of each"],
      ["ETHOS 管这叫", "ETHOS calls this"],
    ],
  );
  const [toolsAt, support, official, platform, mature] = cues(s, [
    ["用工具也是", "The same principle"],
    ["辅助的工作", "Supporting work"],
    ["官方的规范和工具", "official standards"],
    ["平台自带的功能", "the platform's own"],
    ["成熟的工具", "mature tools"],
  ]);
  // Chinese names the conditions before the custom code they allow; English names the code first.
  const [customAt, gap, bounded, benefit] = cues(s, [
    ["才自己写辅助代码", "Custom supporting code"],
    ["只有证明", "a real gap"],
    ["边界清楚", "its job is bounded"],
    ["净收益", "its net benefit"],
  ]);
  const [replaceAt, oldAt, both] = cues(s, [
    ["选定了新办法", "When a replacement"],
    ["旧做法", "the path it replaces"],
    ["不让两套", "rather than both"],
  ]);
  const [codeAt, oneJob, intentAt, factsAt, changeAt] = cues(s, [
    ["ETHOS 自己的代码", "ETHOS focuses"],
    ["集中做一件事", "on one job"],
    ["采纳了的意图", "accepted intent"],
    ["刚观察到的事实", "freshly observed facts"],
    ["可以检验的仓库改动", "verifiable changes"],
  ]);
  const stage0 = stageOut(t, module),
    stageA = stageIn(t, module) * stageOut(t, official),
    stageB = stageIn(t, official) * stageOut(t, replaceAt),
    stageC = stageIn(t, replaceAt) * stageOut(t, codeAt),
    stageD = stageIn(t, codeAt);
  // A requirement, once clear, has to mean one thing wherever it is used: the places it reaches stand level with it on
  // the words that say so, and the sign between says they are equal when the same meaning is named.
  if (stage0 > 0) {
    const g = stage0 * clearOfTitle(s, t, 340),
      DX = 600,
      DY = CONTENT_CY - 20,
      DW = 200,
      DH = 280,
      EX = 840,
      RX0 = EX + 60,
      RW = 520,
      same = g * ramp(t, mean - 0.15, 0.4);
    documentIcon(DX - DW / 2, DY - DH / 2, DW, DH, { alpha: g, rows: 5, stroke: P.authority });
    nameText(L("一项要求", "A requirement"), DX, DY + DH / 2 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: g * named(t, reqAt),
    });
    stroke(
      () => {
        ctx.moveTo(EX - 24, DY - 10);
        ctx.lineTo(EX + 24, DY - 10);
        ctx.moveTo(EX - 24, DY + 10);
        ctx.lineTo(EX + 24, DY + 10);
      },
      { color: P.ink, alpha: g * ramp(t, sameAt - 0.15, 0.4), width: 4 },
    );
    line(RX0, DY + 40, RX0 + RW, DY + 40, { color: P.muted, alpha: same, width: 3 });
    [0, 0.5, 1].forEach((q) => dot(RX0 + RW * q, DY + 40, 9, { color: P.authority, alpha: same }));
    nameText(L("在哪里都是同一个意思", "The same meaning everywhere"), RX0 + RW / 2, DY - 6, {
      alpha: g * named(t, mean),
    });
  }
  // The meaning of a duplicate record, held where one module will be named for it: that it alone defines the meaning, and
  // the module itself, arrive on their words. Interfaces, tests and documents follow from it, each on its words; copies
  // each would keep are refused, and the rule is named under the module. When the rule turns to tools, the example's
  // names leave and its marks recede, so only the rule and what it now reaches are named.
  if (stageA > 0) {
    const past = soon(t, toolsAt - 0.1, 0.4),
      kept = stageA * (1 - past),
      held = stageA * (1 - 0.4 * past);
    const lead = 240 * (1 - soon(t, iface - 0.4, 0.6)) + 100 * (1 - soon(t, own - 0.3, 0.5)),
      MX = 560 + lead,
      MY = 460,
      MW = 300,
      MH = 190,
      IX = 1120 + lead,
      ys = [320, 460, 600],
      ats = [iface, tests, docs],
      q = (voiceTime(t) * 0.45) % 1;
    box(MX - MW / 2, MY - MH / 2, MW, MH, {
      fill: P.row,
      stroke: P.authority,
      alpha: held,
      radius: 14,
      width: 3,
    });
    documentIcon(MX - 36, MY - 76, 72, 92, { alpha: held, rows: 2, stroke: P.authority });
    nameText(L("一个模块", "One module"), MX, MY + 54, {
      color: P.authority,
      alpha: kept * named(t, oneModule),
    });
    nameText(L("“重复记录”的定义", "What a duplicate record is"), MX, MY + MH / 2 + NAME_GAP, {
      valign: "top",
      alpha: kept,
    });
    nameText(L("只由它来定义", "Defined only here"), MX, MY + MH / 2 + NAME_GAP + 42, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: kept * named(t, onlyBy),
    });
    const names = en ? ["Interfaces", "Tests", "Documentation"] : ["接口", "测试", "文档"];
    ats.forEach((at, i) => {
      const on = held * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i),
        c = blend(P.ink, P.evidence, lit),
        y = ys[i];
      link(MX + MW / 2, MY, IX - 40, y, {
        route: "hvh",
        mid: MX + MW / 2 + 110,
        alpha: on,
        upto: soon(t, at, 0.4),
        flow: q,
        color: P.line,
      });
      documentIcon(IX - 30, y - 38, 60, 76, { alpha: on, rows: 3, stroke: c });
      nameText(names[i], IX + 30 + NAME_GAP, y, {
        align: "left",
        alpha: kept * listIn(t, ats, i),
        set: "followers",
      });
    });
    const no = held * named(t, own),
      RX = 1540;
    ys.forEach((y) => {
      documentIcon(RX - 22, y - 28, 44, 56, { alpha: no, rows: 2, stroke: P.muted });
      cross(RX + 42, y, 20, { alpha: no * ramp(t, own + 0.3, 0.4), width: 3 });
    });
    nameText(L("不各写一套", "No copies of their own"), RX + 10, ys[2] + 28 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: kept * named(t, own),
    });
    nameText(
      L("每一项责任，一处负责", "Every obligation, exactly one owner"),
      960,
      MY + MH / 2 + NAME_GAP + 120,
      { valign: "top", color: P.authority, alpha: stageA * named(t, ownerAt) },
    );
    // The same rule reaches tools: said under the rule, before the tools' own picture takes the stage.
    nameText(L("工具也一样", "The same for tools"), 960, MY + MH / 2 + NAME_GAP + 172, {
      valign: "top",
      alpha: stageA * named(t, toolsAt),
    });
  }
  // What supporting work goes to first is said under the rule and stays where it was said while the tools take the
  // stage, until a replacement is chosen.
  nameText(
    L("辅助的工作先交给现成的", "Supporting work goes first to what exists"),
    960,
    800,
    { valign: "top", alpha: (stageA + stageB) * named(t, support) },
  );
  // Tools follow the same rule along one rail that comes with the first of them: what already exists comes first, each
  // kind standing on the rail on its own words. Custom code is the last place on the rail, locked until a real gap, a bounded job and a
  // clear net benefit have each been shown; it stands on its words, before its conditions in English and after them in
  // Chinese, and opens once all three stand.
  if (stageB > 0) {
    const conds = [gap, bounded, benefit],
      lead = 243 * (1 - soon(t, Math.min(customAt, gap) - 0.1, 0.6)),
      LX = 377 + lead,
      ys = [330, 430, 530, 650],
      ats = [official, platform, mature],
      custom = stageB * ramp(t, customAt - 0.15, 0.4);
    const opened = soon(t, Math.max(benefit, customAt) + 0.6, 0.5);
    const names = en
      ? ["Official standards and tools", "The platform's own capabilities", "Mature tools"]
      : ["官方的规范和工具", "平台自带的功能", "成熟的工具"];
    const notes = ["OpenSpec, Git", "", ""];
    line(LX - 28, ys[0], LX - 28, ys[3], { color: P.muted, alpha: stageB, width: 3 });
    const down = (voiceTime(t) * 0.3) % 1;
    flowDot(LX - 28, mix(ys[0], ys[3], down), 9, down, { color: P.evidence, alpha: stageB });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4),
        y = ys[i];
      check(LX + 40, y + 1, 24, { alpha: on, color: P.evidence });
      termRow(
        t,
        [names[i]],
        [at],
        notes[i] ? [notes[i]] : [],
        [at],
        LX + 76,
        y - labelSize(LABEL) / 2,
        { alpha: stageB, set: "rungs" },
      );
    });
    const y = ys[3],
      customName = L("自己写辅助代码", "Custom supporting code");
    lock(LX + 40, y + 2, { alpha: custom, closed: 1 - opened, color: P.authority });
    nameText(customName, LX + 76, y, {
      align: "left",
      color: blend(P.ink, P.authority, opened),
      alpha: custom,
    });
    const CX = LX + 890,
      cn = en
        ? ["A real gap shown", "A bounded job", "A clear net benefit"]
        : ["证明确实缺了什么", "边界清楚", "净收益说得清"],
      cy = [y - 110, y - 20, y + 70];
    conds.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4);
      ring(CX, cy[i], 26, { color: P.authority, alpha: on, width: 2.5 });
      check(CX, cy[i] + 2, 22, { color: P.authority, alpha: on });
      nameText(cn[i], CX + 26 + NAME_GAP, cy[i], {
        align: "left",
        alpha: stageB * listIn(t, conds, i),
        set: "conditions",
      });
    });
    link(LX + 76 + measure(customName) + NAME_GAP, y, CX - 26, cy[1], {
      route: "hvh",
      mid: CX - 70,
      alpha: custom * ramp(t, bounded - 0.15, 0.4),
      color: P.authority,
    });
  }
  // A replacement takes over the whole way: the flow runs on the new path, and the path it replaces is removed in the
  // same work rather than left beside it.
  if (stageC > 0) {
    const X0 = 360,
      X1 = 1560,
      Y1 = 420,
      Y2 = 590,
      q = (voiceTime(t) * 0.4) % 1,
      gone = soon(t, oldAt + 0.6, 0.9);
    ring(X0, (Y1 + Y2) / 2, 34, { color: P.ink, alpha: stageC, width: 2.5 });
    ring(X1, (Y1 + Y2) / 2, 34, { color: P.ink, alpha: stageC, width: 2.5 });
    check(X1, (Y1 + Y2) / 2 + 2, 28, { alpha: stageC, color: P.evidence });
    link(X0 + 34, (Y1 + Y2) / 2, X1 - 34, (Y1 + Y2) / 2, { route: "vhv", mid: Y1, alpha: 0 });
    const up = rounded(
      [
        [X0 + 34, (Y1 + Y2) / 2],
        [X0 + 110, (Y1 + Y2) / 2],
        [X0 + 110, Y1],
        [X1 - 110, Y1],
        [X1 - 110, (Y1 + Y2) / 2],
        [X1 - 34, (Y1 + Y2) / 2],
      ],
      14,
    );
    const low = rounded(
      [
        [X0 + 34, (Y1 + Y2) / 2],
        [X0 + 110, (Y1 + Y2) / 2],
        [X0 + 110, Y2],
        [X1 - 110, Y2],
        [X1 - 110, (Y1 + Y2) / 2],
        [X1 - 34, (Y1 + Y2) / 2],
      ],
      14,
    );
    path(up, { color: P.evidence, alpha: stageC, width: 4 });
    const [fx, fy] = along(up, q).point;
    flowDot(fx, fy, 9, q, { color: P.evidence, alpha: stageC });
    const lowDrawn = along(low, 1 - gone * 0.999).kept;
    if (lowDrawn.length > 1)
      path(lowDrawn, {
        color: P.muted,
        alpha: stageC * ramp(t, oldAt - 0.15, 0.4),
        width: 3,
        dash: [8, 9],
      });
    nameText(L("新办法", "The replacement"), 960, Y1 - NAME_GAP, {
      valign: "bottom",
      color: P.evidence,
      alpha: stageC,
    });
    rejectedName(L("旧做法", "The path it replaces"), 960, Y2 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, oldAt),
      mark: ramp(t, oldAt + 0.4, 0.4),
    });
    nameText(L("两套不长期并存", "Not both living on"), 960, Y2 + NAME_GAP + 58, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageC * named(t, both),
    });
  }
  // ETHOS's own code does one job: intent and fresh facts go in, and a repository change that can be verified comes out.
  if (stageD > 0) {
    const lead = 200 * (1 - soon(t, changeAt - 0.2, 0.5)),
      Y = 470,
      KX = 960 + lead,
      KR = 120,
      RX = 1500 + lead,
      IX = 520 + lead,
      q = (voiceTime(t) * 0.45) % 1,
      inA = stageD * ramp(t, intentAt - 0.15, 0.4),
      inF = stageD * ramp(t, factsAt - 0.15, 0.4),
      out = stageD * ramp(t, changeAt - 0.15, 0.4);
    kernelIcon(KX, Y, KR, { alpha: stageD, beat: out });
    nameText(L("ETHOS 自己的代码", "ETHOS's own code"), KX, Y + KR + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageD,
    });
    nameText(L("集中做一件事", "One job"), KX, Y + KR + NAME_GAP + 42, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageD * named(t, oneJob),
    });
    documentIcon(IX - 48, Y - 150, 96, 124, { alpha: inA, rows: 3, stroke: P.authority });
    nameText(L("采纳的意图", "Accepted intent"), IX - 48 - NAME_GAP, Y - 88, {
      align: "right",
      color: P.authority,
      alpha: stageD * named(t, intentAt),
    });
    link(IX + 48, Y - 88, KX - KR * 0.86, Y - 40, {
      route: "hvh",
      mid: 690 + lead,
      alpha: inA,
      upto: soon(t, intentAt + 0.1, 0.5),
      flow: q,
    });
    [
      [0, 0],
      [24, 16],
      [-14, 28],
      [34, 40],
    ].forEach(([dx, dy]) => dot(IX + dx, Y + 76 + dy, 8, { color: P.evidence, alpha: inF }));
    nameText(L("刚观察到的事实", "Freshly observed facts"), IX - 48 - NAME_GAP, Y + 96, {
      align: "right",
      color: P.evidence,
      alpha: stageD * named(t, factsAt),
    });
    link(IX + 48, Y + 96, KX - KR * 0.86, Y + 40, {
      route: "hvh",
      mid: 690 + lead,
      alpha: inF,
      upto: soon(t, factsAt + 0.1, 0.5),
      flow: q,
      color: P.evidence,
    });
    link(KX + KR * 0.9, Y, RX - 110, Y, {
      alpha: out,
      upto: soon(t, changeAt, 0.5),
      flow: q,
      color: P.evidence,
    });
    repoIcon(RX, Y, 220, 170, { alpha: out });
    check(RX + 10, Y + 8, 54, { alpha: out, color: P.evidence });
    nameText(L("能检验的仓库改动", "A verifiable repository change"), RX, Y + 85 + NAME_GAP, {
      valign: "top",
      width: 300,
      alpha: stageD * named(t, changeAt),
    });
  }
};
