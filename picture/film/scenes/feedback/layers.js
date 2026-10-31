/* 14 layers of feedback. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { link } from "../../drawing/links.js";
import { box, dashed, dot, line, ring, stroke } from "../../drawing/strokes.js";
import { check, cross, documentIcon, lock, person, seal } from "../../drawing/symbols.js";
import { kernelIcon, repoIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText } from "../../naming/names.js";
import { railNames, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cueFrom, cues } from "../../timing/cues.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { thoughtEnd, voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* The four layers of understanding, the use at the bottom and the purpose at the top, as one column of slabs. A lit
 * slab takes the colour `tone`. */
const FEEDBACK_LAYERS = {
  ys: [650, 540, 430, 320],
  names: () =>
    en
      ? ["How it is used", "The method", "Concepts and structures", "Purpose and assumptions"]
      : ["实际的用法", "做法", "概念和结构", "目的和当初的假设"],
};
function layerSlab(
  x,
  w,
  h,
  i,
  { alpha = 1, lit = 0, tone = P.authority, inkAlpha = alpha, set = null } = {},
) {
  if (alpha < 0.01) return;
  const y = FEEDBACK_LAYERS.ys[i],
    c = blend(P.line, tone, lit);
  box(x, y - h / 2, w, h, { fill: P.row, stroke: c, alpha, radius: 10, width: 2 + lit });
  nameText(FEEDBACK_LAYERS.names()[i], x + w / 2, y, {
    alpha: inkAlpha,
    set,
    color: blend(P.ink, tone, lit),
  });
}
/* A slab shaken on its words: a short sideways tremor that settles within 0.6 s. */
const s14Shake = (t, at) => {
  const p = clamp((t - at) / 0.6);
  return p > 0 && p < 1 ? 7 * Math.sin(Math.PI * 2 * 5 * p * 0.6) * (1 - p) : 0;
};
scenes["14"] = function (s, t) {
  const [fixAt, singleAt, useAt, methodAt, conceptAt, purposeAt] = cues(s, [
    ["反馈不一定", "Feedback is not"],
    ["修好一个错误", "a single fix"],
    ["纠正实际的用法", "correct how something"],
    ["换一种做法", "call for"],
    ["概念和结构", "shake the concepts"],
    ["重新理解目的", "or change how"],
  ]);
  // In Chinese the feedback reaches the concepts' layer as it is shaken, before the layer is named.
  const reachConcept = en ? conceptAt : cue(s, "可能动摇", "");
  const [upAt, evidAt, fixedAt, downAt] = cues(s, [
    ["更高一层的理解", "When evidence"],
    ["被证据动摇", "When evidence"],
    ["修正后的含义", "the corrected meaning"],
    ["顺着依赖它的各层", "recompiled through"],
  ]);
  const shakenAt = cueFrom(s, "动摇", "challenges", upAt);
  const [goalAt, whoAt, againAt, passAt, looseAt] = cues(s, [
    ["改目标", "A revised goal"],
    ["有权决定的人", "whoever has the authority"],
    ["重新采纳", "accepted again"],
    ["让结果通过检查", "a result passes"],
    ["悄悄把条件放宽", "quietly loosening"],
  ]);
  const crossAt = en ? cue(s, "", "is not allowed") : looseAt + 0.7,
    nameAt = Math.min(whoAt, againAt);
  const [openAt, closeAt, techAt, delivAt, bizAt, eachAt] = en
    ? cues(s, [
        ["", "The feedback mechanism"],
        ["", "To call a round"],
        ["", "technical verification"],
        ["", "delivery"],
        ["", "business results"],
        ["", "each need their own"],
      ])
    : cues(s, [
        ["反馈机制本身", ""],
        ["一轮反馈处理完了", ""],
        ["技术上的检验", ""],
        ["交付", ""],
        ["业务上的结果", ""],
        ["各自要有", ""],
      ]);
  const [projAt, suggestAt, keepAt, privAt] = cues(s, [
    ["一个项目的经验", "One project's experience"],
    ["提议改进", "suggest improvements"],
    ["决定权", "that project's authority"],
    ["不公开的业务背景", "private business context"],
  ]);
  // The way out is crossed once both kept things are named: in English with the second of them.
  const notAt = en ? privAt : cue(s, "不会跟着", "");
  const stageA = stageOut(t, upAt),
    stageB = stageIn(t, upAt) * stageOut(t, goalAt),
    stageC = stageIn(t, goalAt) * stageOut(t, openAt),
    stageD = stageIn(t, openAt) * stageOut(t, projAt),
    stageE = stageIn(t, projAt);
  const X = 680,
    W = 760,
    H = 86;
  // Feedback rises: from a single fix at the bottom, each layer it can reach arrives on its words, the shaken layer of
  // concepts trembling as it comes, and one point climbs to the layer being named. No layer stands before it is named:
  // the feedback and its single fix stand at the centre and step aside before the first layer comes.
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 300),
      ats = [useAt, methodAt, conceptAt, purposeAt],
      reachAts = [useAt, methodAt, reachConcept, purposeAt],
      ys = FEEDBACK_LAYERS.ys,
      shift = 420 * (1 - soon(t, useAt - 0.6, 0.45)),
      RX = 540 + shift;
    ats.forEach((at, i) =>
      layerSlab(X + (i === 2 ? s14Shake(t, at) : 0), W, H, i, {
        alpha: g * ramp(t, at - 0.15, 0.4),
        lit: speaking(t, ats, i),
        inkAlpha: g * listIn(t, ats, i),
        set: "layers",
      }),
    );
    const reach = reachAts.reduce((v, at, i) => mix(v, ys[i], soon(t, at - 0.1, 0.5)), 740),
      single = g * ramp(t, singleAt - 0.15, 0.4);
    line(RX, 760, RX, ys[3], { color: P.muted, alpha: g, width: 3 });
    dot(RX, reach, 13, { color: P.evidence, alpha: g });
    check(RX - 60, 760, 26, { alpha: single, color: P.evidence, upto: soon(t, singleAt, 0.4) });
    nameText(L("修好一个错误", "A single fix"), RX - 90, 760, {
      align: "right",
      alpha: g * named(t, singleAt),
      width: 220,
    });
    nameText(L("反馈", "Feedback"), RX, ys[3] - 44 - 14, {
      valign: "bottom",
      color: P.evidence,
      alpha: g * named(t, fixAt),
    });
  }
  // When evidence shakes a higher layer, the shaken layer turns to the colour of the unknown, then to authority once its
  // meaning is corrected, and the corrected meaning goes back down: every layer that depends on it is compiled again, in
  // order, lighting as it is reached.
  if (stageB > 0) {
    const lead = 150 * (1 - soon(t, downAt - 0.3, 0.5)),
      BX = X - lead,
      ys = FEEDBACK_LAYERS.ys,
      RX = 1510 - lead,
      down = soon(t, downAt + 0.1, Math.min(2, thoughtEnd(downAt) - downAt - 0.1));
    const shaken = soon(t, shakenAt, 0.35),
      fixed = soon(t, fixedAt, 0.35),
      reached = (i) => 0.7 * clamp((down - (3 - i) / 3 + 0.14) / 0.12);
    [0, 1, 2, 3].forEach((i) =>
      layerSlab(BX + (i === 2 ? s14Shake(t, shakenAt) : 0), W, H, i, {
        alpha: stageB,
        lit: i === 2 ? shaken : i < 2 ? reached(i) : 0,
        tone: i === 2 ? blend(P.unknown, P.authority, fixed) : P.authority,
        set: "layers",
      }),
    );
    [
      [-30, -16],
      [24, -24],
      [-10, 16],
      [30, 20],
    ].forEach(([dx, dy]) =>
      dot(RX + 140 + dx, ys[2] + dy, 8, { color: P.evidence, alpha: stageB }),
    );
    nameText(L("证据", "Evidence"), RX + 140, ys[2] + 52, {
      valign: "top",
      color: P.evidence,
      alpha: stageB,
    });
    link(RX + 90, ys[2], BX + W, ys[2], {
      alpha: stageB,
      upto: soon(t, evidAt, 0.5),
      color: P.evidence,
    });
    const dq = clamp(down),
      on = stageB * ramp(t, downAt - 0.15, 0.4);
    line(620, ys[2], 620, mix(ys[2], ys[0], dq), { color: P.authority, alpha: on, width: 3.5 });
    dot(620, mix(ys[2], ys[0], dq), 11, { color: P.authority, alpha: on });
    nameText(L("顺着各层重新编译", "Recompiled through each layer"), 590, (ys[2] + ys[0]) / 2, {
      align: "right",
      width: 300,
      color: P.authority,
      alpha: stageB * named(t, downAt),
    });
  }
  // A threshold is a line the result must clear, and it leads to whoever has the authority, who accepts a revised
  // standard again with a seal. The results light when they are said, and lowering the line quietly so they pass is
  // refused.
  if (stageC > 0) {
    const lead = 180 * (1 - soon(t, nameAt - 0.3, 0.5)),
      X0 = 300 + lead,
      X1 = 1000 + lead,
      Y0 = 620,
      HIGH = 400,
      drop = soon(t, looseAt + 0.1, 0.9),
      lineY = mix(HIGH, HIGH + 100, drop);
    const who = stageC * ramp(t, whoAt - 0.15, 0.4),
      acc = stageC * ramp(t, againAt - 0.15, 0.4),
      loose = stageC * ramp(t, looseAt - 0.15, 0.4),
      pass = soon(t, passAt, 0.4);
    line(X0 + 30, Y0, X0 + 600, Y0, { color: P.line, alpha: stageC });
    stroke(
      () => {
        ctx.moveTo(X0 + 60, Y0);
        ctx.lineTo(X0 + 60, 500);
        ctx.moveTo(X0 + 230, Y0);
        ctx.lineTo(X0 + 230, 450);
        ctx.moveTo(X0 + 400, Y0);
        ctx.lineTo(X0 + 400, 530);
        ctx.moveTo(X0 + 570, Y0);
        ctx.lineTo(X0 + 570, 470);
      },
      { color: P.evidence, alpha: stageC * mix(0.62, 1, pass), width: 14 },
    );
    line(X0, HIGH, X1 + 80, HIGH, {
      color: P.authority,
      alpha: stageC * (1 - loose * 0.5),
      width: 3.5,
    });
    if (loose > 0) dashed(X0, lineY, X1, lineY, { color: P.unknown, alpha: loose, width: 3 });
    nameText(L("目标和标准", "A goal or standard"), X0, HIGH - NAME_GAP, {
      align: "left",
      valign: "bottom",
      color: P.authority,
      alpha: stageC,
    });
    cross(X1 + 40, lineY, 28, { alpha: loose * ramp(t, crossAt, 0.4), width: 3.5 });
    nameText(L("悄悄放宽条件", "Loosening it quietly"), X0 + 350, Y0 + NAME_GAP, {
      valign: "top",
      width: 420,
      color: P.unknown,
      alpha: stageC * named(t, looseAt),
    });
    const PX = 1400,
      PY = 450;
    person(PX, PY, { alpha: who, size: 2, color: P.authority });
    seal(PX + 110, PY - 30, 36, { alpha: acc });
    nameText(
      L("有权决定的人重新采纳", "Accepted again by whoever has the authority"),
      PX + 20,
      PY + 70 + NAME_GAP,
      { valign: "top", width: 400, color: P.authority, alpha: stageC * named(t, nameAt) },
    );
    link(X1 + 80, HIGH, PX - 60, PY - 30, {
      route: "hvh",
      mid: X1 + 210,
      alpha: stageC * ramp(t, nameAt - 0.15, 0.4),
      upto: soon(t, nameAt + 0.2, 0.5),
    });
  }
  // A round of feedback closes only on its evidence, and three kinds of evidence stand apart. The mechanism itself can
  // still be corrected, so its outline stays open.
  if (stageD > 0) {
    const ats = [techAt, delivAt, bizAt],
      names = en
        ? ["Technical verification", "Delivery", "Business results"]
        : ["技术上的检验", "交付", "业务上的结果"],
      xs = railStations(names, 480, 1440),
      Y = 545,
      cl = stageD * ramp(t, closeAt - 0.15, 0.4);
    const CX = 960,
      CY = mix(450, 320, soon(t, techAt - 0.3, 0.5)),
      R = 84,
      q = (voiceTime(t) * 0.2) % 1;
    ring(CX, CY, R, {
      color: P.authority,
      alpha: stageD,
      width: 3,
      upto: 0.82,
      start: -Math.PI * 0.3,
    });
    // The open outline ends in a quiet point small enough to be a detail of the ring, not a second mark beside the
    // evidence travelling on it.
    const a = -Math.PI * 0.3 + Math.PI * 2 * 0.82;
    dot(CX + R * Math.cos(a), CY + R * Math.sin(a), 6, { color: P.authority, alpha: stageD });
    dot(
      CX + R * Math.cos(-Math.PI * 0.3 + q * Math.PI * 2 * 0.82),
      CY + R * Math.sin(-Math.PI * 0.3 + q * Math.PI * 2 * 0.82),
      9,
      { color: P.evidence, alpha: stageD },
    );
    nameText(L("反馈机制本身也能改", "The mechanism itself stays open"), CX + R + NAME_GAP, CY, {
      align: "left",
      width: 340,
      color: P.authority,
      alpha: stageD,
    });
    nameText(L("说处理完了，要有证据", "To call a round closed, evidence"), CX - R - NAME_GAP, CY, {
      align: "right",
      width: 340,
      alpha: cl,
    });
    ats.forEach((at, i) => {
      const on = stageD * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, P.evidence, speaking(t, ats, i));
      seal(xs[i], Y, 50, { alpha: on, color: c });
    });
    railNames(names, xs, Y + 50, {
      gap: NAME_GAP,
      alpha: (i) => stageD * listIn(t, ats, i),
      set: "kinds",
    });
    nameText(L("各自要有各自的证据", "Each with its own evidence"), 960, 700, {
      size: NOTE,
      color: P.muted,
      alpha: stageD * named(t, eachAt),
    });
  }
  // One project's experience travels as a suggestion to the shared mechanism; its authority and private context are
  // locked in it as they are named, the project growing to hold each, and the way out for them is crossed.
  if (stageE > 0) {
    const Y = 480,
      PX = 480,
      SX = 1440,
      q = (voiceTime(t) * 0.45) % 1,
      sg = stageE * ramp(t, suggestAt - 0.15, 0.4),
      kp = stageE * ramp(t, keepAt - 0.15, 0.4),
      pv = stageE * ramp(t, privAt - 0.15, 0.4),
      no = stageE * ramp(t, notAt - 0.15, 0.4);
    const grown = soon(t, keepAt - 0.5, 0.4) + soon(t, privAt - 0.5, 0.4),
      RW = 480,
      RH = 160 + 80 * grown,
      TOP = Y - 160;
    repoIcon(PX, TOP + RH / 2, RW, RH, { alpha: stageE });
    nameText(L("一个项目", "One project"), PX, TOP + RH + NAME_GAP, {
      valign: "top",
      alpha: stageE,
    });
    documentIcon(PX - 34, Y - 112, 68, 88, { alpha: stageE, rows: 3, stroke: P.evidence });
    nameText(L("经验", "Experience"), PX + 50, Y - 68, {
      align: "left",
      color: P.evidence,
      alpha: stageE,
    });
    lock(PX - 150, Y + 30, { alpha: kp, size: 1.2 });
    nameText(L("决定权", "Its authority"), PX - 120, Y + 30, {
      align: "left",
      alpha: stageE * named(t, keepAt),
      set: "kept",
    });
    lock(PX - 150, Y + 96, { alpha: pv, size: 1.2 });
    nameText(L("不公开的业务背景", "Private business context"), PX - 120, Y + 96, {
      align: "left",
      width: 320,
      alpha: stageE * named(t, privAt),
      set: "kept",
    });
    link(PX + RW / 2, Y - 68, SX - 100, Y - 68, {
      alpha: sg,
      upto: soon(t, suggestAt, 0.6),
      flow: q,
      color: P.evidence,
    });
    documentIcon(960 - 30, Y - 107, 60, 78, { alpha: sg, rows: 3, stroke: P.evidence });
    nameText(L("一条建议", "A suggestion"), 960, Y - 107 - 14, {
      valign: "bottom",
      color: P.evidence,
      alpha: stageE * named(t, suggestAt),
    });
    kernelIcon(SX, Y - 68, 100, { alpha: sg });
    nameText(L("大家共用的机制", "Shared mechanisms"), SX, Y + 32 + NAME_GAP, {
      valign: "top",
      width: 260,
      alpha: stageE * named(t, en ? cue(s, "", "shared mechanisms") : suggestAt),
    });
    link(PX + RW / 2, Y + 64, 1160, Y + 64, {
      alpha: no,
      upto: soon(t, notAt, 0.5),
      dash: [8, 9],
      color: P.muted,
      end: false,
    });
    cross(1190, Y + 64, 24, { alpha: no * ramp(t, notAt + 0.3, 0.4), width: 3 });
  }
};
