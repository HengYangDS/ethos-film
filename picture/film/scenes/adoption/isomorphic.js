/* 16 isomorphic governance. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { pipelineMark } from "../../drawing/examples.js";
import { link } from "../../drawing/links.js";
import { modelGrid } from "../../drawing/models.js";
import {
  box,
  dashed,
  dot,
  flowDot,
  line,
  measure,
  ring,
  stroke,
  text,
} from "../../drawing/strokes.js";
import { check, clock, documentIcon } from "../../drawing/symbols.js";
import { kernelIcon, repoIcon, terminalIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, growName, growTexts, nameText, rejectedName } from "../../naming/names.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["16"] = function (s, t) {
  const [adopt, same, isoAt] = cues(s, [
    ["接入它的其他仓库", "the repositories that adopt"],
    ["用的是同一个内核", "with the same kernel"],
    ["同构治理", "governance means"],
  ]);
  const [diffAt, adapWord, eachAt, ownProf] = cues(s, [
    ["区别只在配置和适配器", "The difference lies"],
    ["适配器", "adapters"],
    ["每个仓库", "each repository declares"],
    ["在自己的配置里", "in its own profile"],
  ]);
  const rowAts = cues(s, [
    ["检查", "checks"],
    ["参数", "parameters"],
    ["证明做到多深", "depth of proof"],
  ]);
  const [connectAt, ...toolAts] = cues(s, [
    ["负责连接原生工具", "connect native tools"],
    ["Git", "Git"],
    ["代码托管平台", "codehosting platform"],
    ["持续集成", "integration"],
  ]);
  const [noCopy, copyWords, keepsAt, layoutAt, convAt, judgeAt, loopAt] = cues(s, [
    ["这不是把 ETHOS 复制一份", "This does not turn"],
    ["复制一份", "a copy of ETHOS"],
    ["保留自己的业务模型", "keeps its own domain"],
    ["目录结构", "layout"],
    ["和平台习惯", "and platform conventions"],
    ["ETHOS 只用", "ETHOS judges"],
    ["以证据为准的循环", "evidence-grounded loop"],
  ]);
  const [hourAt, runAt, ...outAts] = cues(s, [
    ["上手的头一个小时", "The first hour"],
    ["运行 ETHOS 的状态命令", "run the ETHOS status"],
    ["现在的事实", "the current facts"],
    ["缺口", "the gaps"],
    ["下一步", "the next action"],
  ]);
  const [prevAt, planAt, nothing, applyWord, noConf, recov, breakAt] = cues(s, [
    ["还没接入的仓库", "For a repository"],
    ["先预览接入计划", "preview the adoption plan"],
    ["预览什么都不改", "the preview changes"],
    ["再正式执行", "Apply it only"],
    ["确认没有冲突", "no conflicts"],
    ["清楚出了错", "how to recover"],
    ["中途被打断", "is interrupted"],
  ]);
  const stageA = stageOut(t, diffAt),
    stageB = stageIn(t, diffAt) * stageOut(t, noCopy),
    stageC = stageIn(t, noCopy) * stageOut(t, hourAt),
    stageD = stageIn(t, hourAt) * stageOut(t, prevAt),
    stageE = stageIn(t, prevAt);
  const LX = 500,
    RX = 1420;
  // 1. ETHOS's own repository and a repository that adopts it, each with the same kernel inside; the sign of sameness
  // stands between them on the words that say it is the same kernel and procedure.
  if (stageA > 0) {
    const Y = 460,
      RW = 430,
      RH = 280,
      g = stageA * clearOfTitle(s, t, 300),
      ad = g * ramp(t, adopt - 0.15, 0.4);
    const shift = 460 * (1 - soon(t, adopt - 0.3, 0.5)),
      lx = LX + shift,
      rx = RX + shift,
      eq = g * ramp(t, (en ? adopt : same) - 0.15, 0.4);
    repoIcon(lx, Y, RW, RH, { alpha: g });
    kernelIcon(lx, Y - 18, 76, { alpha: g });
    nameText(L("ETHOS 自己的产品仓库", "ETHOS's own repository"), lx, Y + 104, {
      width: 380,
      color: P.authority,
      alpha: g,
    });
    repoIcon(rx, Y, RW, RH, { alpha: ad });
    kernelIcon(rx, Y - 18, 76, { alpha: ad });
    nameText(L("接入它的仓库", "A repository that adopts it"), rx, Y + 104, {
      width: 380,
      alpha: ad,
    });
    stroke(
      () => {
        ctx.moveTo(960 - 34, Y - 14);
        ctx.lineTo(960 + 34, Y - 14);
        ctx.moveTo(960 - 34, Y + 14);
        ctx.lineTo(960 + 34, Y + 14);
      },
      { color: P.ink, alpha: eq, width: 5 },
    );
    nameText(L("同一个内核、同一套流程", "Same kernel, same procedure"), 960, 282, {
      alpha: g * named(t, same),
    });
    nameText(L("同构治理", "Isomorphic governance"), 960, Y + RH / 2 + 60, {
      color: P.authority,
      alpha: g * named(t, isoAt),
      bold: true,
    });
  }
  // 2. Under each kernel, what differs: each repository's own profile and its adapters. The profile's rows fill in as
  // its checks, parameters and depth of proof are named, with different values in each repository; the adapters then
  // connect to the native tools both share.
  if (stageB > 0) {
    const KY = 320,
      DY = 440,
      AY = 650,
      RAIL = 770,
      rows = en ? ["Checks", "Parameters", "Depth of proof"] : ["检查", "参数", "证明做到多深"];
    const ad = stageB * ramp(t, adapWord - 0.15, 0.4),
      co = stageB * ramp(t, connectAt - 0.15, 0.4);
    [
      [LX, P.authority, [0.8, 0.5, 0.7], eachAt],
      [RX, P.evidence, [0.5, 0.9, 0.4], ownProf],
    ].forEach(([x, c, widths, litAt], side) => {
      const tone = blend(P.ink, c, soon(t, litAt, 0.45));
      kernelIcon(x, KY, 54, { alpha: stageB });
      line(x, KY + 54, x, DY, { color: P.line, alpha: stageB, width: 2 });
      documentIcon(x - 80, DY, 160, 170, { alpha: stageB, rows: 0, stroke: tone });
      nameText(L("配置", "Profile"), x - 8, DY + 30, {
        color: tone,
        alpha: stageB,
        set: side ? "profB" : "profA",
      });
      stroke(
        () =>
          widths.forEach((w, i) => {
            const y = DY + 75 + i * 35,
              grow = soon(t, rowAts[i] - 0.1, 0.5);
            if (grow > 0) {
              ctx.moveTo(x - 56, y);
              ctx.lineTo(x - 56 + 112 * w * grow, y);
            }
          }),
        { color: c, alpha: stageB, width: 4 },
      );
      link(x, DY + 170, x, AY, { alpha: ad, upto: soon(t, adapWord - 0.15, 0.3) });
      box(x - 170, AY, 340, 62, { fill: P.row, stroke: P.ink, alpha: ad, radius: 12 });
      nameText(L("适配器", "Adapters"), x, AY + 31, { alpha: ad, set: side ? "adB" : "adA" });
      link(x, AY + 62, side ? 1220 : 700, RAIL, {
        route: "vh",
        alpha: co,
        upto: soon(t, connectAt - 0.1, 0.5),
      });
    });
    rows.forEach((v, i) =>
      nameText(v, 960, DY + 75 + i * 35, {
        size: NOTE,
        alpha: stageB * listIn(t, rowAts, i),
        set: "declares",
      }),
    );
    line(700, RAIL, 1220, RAIL, {
      color: P.line,
      alpha: co * ramp(t, connectAt + 0.2, 0.3),
      width: 2,
    });
    const tools = ["Git", L("平台", "Platform"), L("持续集成", "CI")];
    tools.forEach((v, i) => {
      const x = 840 + i * 120,
        on = stageB * ramp(t, toolAts[i] - 0.15, 0.4);
      dot(x, RAIL, 7, { color: P.ink, alpha: on });
      nameText(v, x, RAIL + 7 + 14, {
        valign: "top",
        size: NOTE,
        color: P.muted,
        alpha: stageB * listIn(t, toolAts, i),
        set: "tools",
      });
    });
  }
  // 3. Not a copy: each repository keeps its own shapes inside and names what it keeps, part by part; ETHOS stands
  // between them as one loop that judges each change in both.
  if (stageC > 0) {
    const CY = 440,
      R = 74,
      q = (voiceTime(t) * 0.3) % 1,
      et = stageC * ramp(t, judgeAt - 0.15, 0.4),
      lo = stageC * ramp(t, loopAt - 0.15, 0.4);
    rejectedName(L("复制一份 ETHOS", "A copy of ETHOS"), 960, 262, {
      alpha: stageC * (en ? named(t, cue(s, "", "turn each repository")) : 1),
      mark: ramp(t, copyWords + 0.1, 0.4),
    });
    repoIcon(LX, CY, 460, 270, { alpha: stageC });
    repoIcon(RX, CY, 460, 270, { alpha: stageC });
    nameText(L("ETHOS 自己的产品仓库", "ETHOS's own repository"), LX, CY - 135 - 12, {
      valign: "bottom",
      color: P.authority,
      alpha: stageC,
    });
    nameText(L("接入它的仓库", "A repository that adopts it"), RX, CY - 135 - 12, {
      valign: "bottom",
      alpha: stageC,
    });
    pipelineMark(LX + 20, CY + 30, 340, { alpha: stageC });
    modelGrid(RX - 120, CY - 60, 260, 150, { alpha: stageC, color: P.evidence });
    const parts = en
      ? ["Keeps its own domain model, ", "layout, ", "platform conventions"]
      : ["保留自己的业务模型、", "目录结构、", "平台习惯"];
    const lines = growTexts(parts, 700),
      wide = Math.max(...lines.map((line) => measure(line.map(([, v]) => v).join(""))));
    growName(
      t,
      parts,
      [keepsAt, layoutAt, convAt],
      Math.round(960 - wide / 2),
      CY + 135 + NAME_GAP,
      { width: 700, alpha: stageC, build: true },
    );
    ring(960, CY, R, { color: P.authority, alpha: et, width: 3 });
    nameText("ETHOS", 960, CY, { color: P.authority, alpha: et, bold: true });
    const a = -Math.PI / 2 + q * Math.PI * 2;
    flowDot(960 + R * Math.cos(a), CY + R * Math.sin(a), 9, q, { color: P.evidence, alpha: lo });
    link(LX + 230, CY, 960 - R, CY, {
      alpha: lo,
      color: P.line,
      end: false,
      upto: soon(t, loopAt - 0.1, 0.5),
    });
    link(960 + R, CY, RX - 230, CY, {
      alpha: lo,
      color: P.line,
      end: false,
      upto: soon(t, loopAt - 0.1, 0.5),
    });
    nameText(L("同一个循环", "One loop"), 960, CY + R + 12, {
      valign: "top",
      color: P.authority,
      alpha: stageC * named(t, loopAt),
    });
  }
  // 4. The first hour asks for little: a clock, and at an empty prompt one command, the status command, which shows the
  // current facts, the gaps and the next action.
  if (stageD > 0) {
    const lead = 300 * (1 - soon(t, outAts[0] - 0.15, 0.5)),
      TX = 380 + lead,
      TW = 560,
      TH = 96,
      TY = 490,
      run = stageD * ramp(t, runAt - 0.15, 0.4);
    const names = en
        ? ["The current facts", "The gaps", "The next action"]
        : ["现在的事实", "缺口", "下一步"],
      IX = 1250 + lead,
      ys = [370, 510, 650];
    clock(TX + TW / 2, 370, 62, {
      alpha: stageD,
      hand: soon(t, hourAt, 4) * 0.15,
      color: P.authority,
    });
    nameText(L("头一个小时", "The first hour"), TX + TW / 2, 370 - 62 - 12, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD,
    });
    terminalIcon(TX, TY, TW, TH, { alpha: stageD });
    const prompt = TY + 30 + (TH - 30) / 2;
    text("$", TX + 22, prompt, 26, { role: "mark", color: P.muted, alpha: stageD });
    text("ethos status", TX + 48, prompt, 26, { role: "mark", color: P.evidence, alpha: run });
    nameText(L("状态命令", "The status command"), TX + TW / 2, TY + TH + NAME_GAP, {
      valign: "top",
      alpha: stageD * named(t, runAt),
    });
    outAts.forEach((at, i) => {
      const on = stageD * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, i === 2 ? P.authority : P.evidence, speaking(t, outAts, i)),
        y = ys[i];
      link(TX + TW, TY + TH / 2, IX - 34, y, {
        route: "hvh",
        mid: IX - 110,
        alpha: on,
        upto: soon(t, at, 0.4),
      });
      ring(IX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0)
        [
          [-10, -8],
          [10, -10],
          [0, 10],
        ].forEach(([dx, dy]) => dot(IX + dx, y + dy, 5, { color: c, alpha: on }));
      if (i === 1) dashed(IX - 16, y, IX + 16, y, { color: c, alpha: on, width: 3 });
      if (i === 2) dot(IX, y, 11, { color: c, alpha: on });
      nameText(names[i], IX + 34 + NAME_GAP, y, {
        align: "left",
        alpha: stageD * listIn(t, outAts, i),
        set: "shows",
      });
    });
  }
  // 5. A repository that has not adopted ETHOS previews the adoption plan, and the preview changes nothing. Applying waits
  // for two things, no conflicts and a known way to recover, because an interrupted apply can leave the change half done.
  if (stageE > 0) {
    const Y = 440,
      rows = en ? ["No conflicts", "Recovery is known"] : ["没有冲突", "清楚怎么恢复"],
      ys = [Y - 56, Y + 56];
    const pl = stageE * ramp(t, planAt - 0.15, 0.4),
      no = stageE * ramp(t, noConf - 0.15, 0.4),
      re = stageE * ramp(t, recov - 0.15, 0.4),
      ap = stageE * ramp(t, applyWord - 0.15, 0.4);
    const met = en ? soon(t, recov + 0.3, 0.4) : 1,
      hf = stageE * ramp(t, breakAt - 0.15, 0.4);
    // Each group stands where the finished row puts it; the row stays centred on the frame while it builds.
    const RPX = 300,
      PX = 670,
      CX = 995,
      AX = 1525,
      BW = 320,
      rowRight = CX + 32 + NAME_GAP + Math.max(...rows.map((v) => measure(v)));
    const centre = (a, b) => 960 - (a + b) / 2,
      lead0 = centre(140, 460),
      lead1 = centre(140, 770),
      lead2 = en ? 0 : centre(235, rowRight);
    const lead =
      (lead0 - lead1) * (1 - soon(t, planAt - 0.15, 0.5)) +
      (lead1 - lead2) * (1 - soon(t, en ? applyWord - 0.35 : noConf - 0.15, 0.5)) +
      lead2 * (1 - soon(t, applyWord - 0.5, 0.5));
    repoIcon(RPX + lead, Y, 320, 210, { alpha: stageE });
    // The repository's own content, before any adoption.
    stroke(
      () =>
        [
          [-35, 1],
          [0, 0.7],
          [35, 0.85],
          [70, 0.55],
        ].forEach(([dy, w]) => {
          ctx.moveTo(RPX - 100 + lead, Y + dy);
          ctx.lineTo(RPX - 100 + 210 * w + lead, Y + dy);
        }),
      { color: P.muted, alpha: stageE, width: 2.5 },
    );
    nameText(L("还没接入的仓库", "Not yet adopted"), RPX + lead, Y + 105 + NAME_GAP, {
      valign: "top",
      alpha: stageE,
    });
    link(RPX + 160 + lead, Y, PX - 100 + lead, Y, { alpha: pl, upto: soon(t, planAt - 0.15, 0.4) });
    documentIcon(PX - 75 + lead, Y - 100, 150, 200, { alpha: pl, rows: 5, stroke: P.evidence });
    box(PX - 100 + lead, Y - 125, 200, 250, {
      stroke: P.evidence,
      alpha: pl,
      radius: 12,
      dash: [8, 8],
      width: 3,
    });
    const planName = nameText(
      L("预览接入计划", "Preview the plan"),
      PX + lead,
      Y + 125 + NAME_GAP,
      { valign: "top", width: 320, color: P.evidence, alpha: pl },
    );
    nameText(L("预览什么都不改", "Changes nothing"), PX + lead, planName.bottom + 10, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageE * named(t, nothing),
    });
    [no, re].forEach((on, i) => {
      ring(CX + lead, ys[i], 32, { color: P.evidence, alpha: on, width: 2.5 });
      check(CX + lead, ys[i] + 2, 28, { alpha: on, color: P.evidence });
      nameText(rows[i], CX + 32 + NAME_GAP + lead, ys[i], {
        align: "left",
        alpha: stageE * listIn(t, [noConf, recov], i),
        set: "needs",
      });
      link(PX + 100 + lead, Y, CX - 32 + lead, ys[i], {
        route: "hvh",
        mid: CX - 110 + lead,
        alpha: on,
        upto: soon(t, i ? recov : noConf, 0.4),
      });
    });
    link(rowRight + 20 + lead, Y, AX - BW / 2 + lead, Y, {
      alpha: ap * met,
      upto: soon(t, en ? recov + 0.3 : applyWord, 0.4),
    });
    box(AX - BW / 2 + lead, Y - 50, BW, 100, {
      stroke: P.authority,
      alpha: ap,
      radius: 12,
      width: 3,
      dash: [8, 8],
    });
    box(AX - BW / 2 + lead, Y - 50, BW, 100, {
      fill: P.row,
      stroke: P.authority,
      alpha: ap * met,
      radius: 12,
      width: 3,
    });
    nameText(L("再正式执行", "Apply"), AX + lead, Y, { color: P.authority, alpha: ap, bold: true });
    const fillTo = mix(0, 0.5, soon(t, breakAt, 0.8));
    line(AX - BW / 2 + lead, Y + 96, AX + BW / 2 + lead, Y + 96, {
      color: P.line,
      alpha: hf,
      width: 8,
    });
    line(AX - BW / 2 + lead, Y + 96, AX - BW / 2 + BW * fillTo + lead, Y + 96, {
      color: P.unknown,
      alpha: hf,
      width: 8,
    });
    nameText(L("中途打断，可能只改了一半", "Interrupted: maybe half done"), AX + lead, Y + 122, {
      valign: "top",
      width: 360,
      color: P.unknown,
      alpha: stageE * named(t, breakAt),
    });
  }
};
