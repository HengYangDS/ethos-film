/* 04 understand, then compile. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { link } from "../../drawing/links.js";
import { box, dot, labelSize, measure, path, ring, stroke, text } from "../../drawing/strokes.js";
import { agent, check, clock, cross, documentIcon, person, token } from "../../drawing/symbols.js";
import { bubble, folderIcon, kernelIcon, ledger } from "../../drawing/workspace.js";
import { beats, listIn, listLevel, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, rejectedName, termRow } from "../../naming/names.js";
import { railNames, railStations } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cueFrom, cues } from "../../timing/cues.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* The sorting picture's left edge: the sources, the judgment, the three ways and their widest name, centred. Until the
 * first way is named the picture stands S04_LEAD further right, so what stands is centred. */
const S04_LEAD = 200;
function s04SortShift() {
  const rows = en
    ? ["Kept", "Excluded by an authorized decision", "Marked as unresolved"]
    : ["留下", "经过授权排除", "明确标成还没解决"];
  return {
    rows,
    dx: Math.round(
      960 - (330 + 900 + 34 + NAME_GAP + Math.max(...rows.map((v) => measure(v)))) / 2,
    ),
  };
}
scenes["04"] = function (s, t) {
  const [checksAt, different] = cues(s, [
    ["变成检查", "turning it into checks"],
    ["两回事", "two different jobs"],
  ]);
  const [judge, judgeName, sortAt, constraint, keptAt, excludedAt, openAt] = cues(s, [
    ["读懂要靠判断", "Understanding takes"],
    ["要靠判断", "takes judgment"],
    ["在指定范围的资料", "Every relevant constraint"],
    ["每一条相关的约束", "Every relevant constraint"],
    ["要么留下", "is kept"],
    ["经过授权排除", "excluded by"],
    ["还没解决", "marked as unresolved"],
  ]);
  const [testAt, posAt, negAt, thatAt, scopeAt, excAt] = cues(s, [
    ["再用正例", "Examples and"],
    ["正例", "Examples"],
    ["反例", "counterexamples"],
    ["这个理解", "that understanding"],
    ["哪些不做", "what is out of scope"],
    ["例外在哪里", "where the exceptions"],
  ]);
  const [onlyAt, ethosAt, rulesAt, intentAt, criteriaAt] = cues(s, [
    ["这之后", "Only then"],
    ["ETHOS 才", "ETHOS deterministically"],
    ["固定的规则", "deterministically"],
    ["采纳的意图", "accepted intent"],
    ["编译成验收条件", "acceptance criteria and checks"],
  ]);
  const [sameAt, sameOut, cannot] = cues(s, [
    ["同样的输入", "The same inputs"],
    ["同样的验收条件", "the same acceptance"],
    ["保证不了", "cannot certify"],
  ]);
  const [leads, trans, memory, summ, noAuth, repeat] = cues(s, [
    ["对话记录", "Transcripts"],
    ["对话记录", "Transcripts"],
    ["Agent 的记忆", "an agent's memory"],
    ["各种总结", "summaries"],
    ["没有决定权", "not authority"],
    ["说上很多遍", "repeating a request"],
  ]);
  const [each, mustAt, givenAt, oneWay, superseded, laterAt, newAt, pending, rejected] = cues(s, [
    ["每一项责任", "Each obligation"],
    ["需要有个交代", "must be accounted"],
    ["都要有一个明确的去向", "is given"],
    ["只能有一个", "exactly one disposition"],
    ["被取代", "superseded"],
    ["有权决定的人", "by a later governing"],
    ["另有指示", "instruction on"],
    ["等待检验", "pending verification"],
    ["拒绝并写明理由", "rejected"],
  ]);
  // "Accepted" is said once before this list, so the list's first state is the one said after the obligation.
  const accepted = cueFrom(s, "采纳", "accepted", each);
  const stageA = stageOut(t, sortAt),
    stageB = stageIn(t, sortAt) * stageOut(t, testAt),
    stageC = stageIn(t, testAt) * stageOut(t, onlyAt);
  const stageD = stageIn(t, onlyAt) * stageOut(t, sameAt),
    stageE = stageIn(t, sameAt) * stageOut(t, leads),
    stageF = stageIn(t, leads) * stageOut(t, each),
    stageG = stageIn(t, each);
  // Two jobs stand apart: a person reading a requirement, and the kernel compiling; they are told apart on the words that
  // say so. When understanding is said to take judgment, compiling recedes, the reader is named for the judgment, and the
  // reader and the requirement go to where the sorting needs the judgment and its sources, so the cut keeps both in place.
  if (stageA > 0) {
    const Y = 470,
      RX = 1340,
      focus = soon(t, judge + 0.05, 0.9),
      gone = ramp(t, judge, 0.25),
      { dx } = s04SortShift();
    const LX = mix(716, 760 + dx + S04_LEAD - 60, focus),
      PY = mix(Y - 6, 404, focus),
      size = mix(2, 1.1, focus);
    const DX = mix(534, 430 + dx + S04_LEAD - 34, focus),
      DY = mix(Y - 60, 444, focus),
      DW = mix(92, 112, focus),
      DH = mix(120, 148, focus);
    documentIcon(DX, DY, DW, DH, { alpha: stageA, rows: 4 });
    nameText(L("读懂需求", "Understanding a requirement"), DX + DW / 2, DY + DH + NAME_GAP, {
      valign: "top",
      alpha: stageA,
      color: P.authority,
    });
    person(LX, PY, { alpha: stageA, size, color: blend(P.ink, P.authority, focus) });
    // Above the reader's head as it shrinks, and where the sorting places it once it has.
    nameText(L("要靠判断", "Takes judgment"), LX, PY - Math.max(54, 32.25 * size + 16), {
      valign: "bottom",
      color: P.authority,
      alpha: stageA * named(t, judgeName),
    });
    const on = stageA * ramp(t, checksAt - 0.15, 0.4) * (1 - gone);
    kernelIcon(RX - 70, Y, 70, { alpha: on });
    documentIcon(RX + 30, Y - 60, 92, 120, { alpha: on, rows: 0 });
    [0, 1, 2].forEach((i) => check(RX + 76, Y - 30 + i * 30, 20, { alpha: on, color: P.evidence }));
    nameText(L("变成检查", "Turning it into checks"), RX - 10, Y + 90, {
      valign: "top",
      alpha: on,
      color: P.evidence,
    });
    stroke(
      () => {
        ctx.moveTo(934, Y - 12);
        ctx.lineTo(986, Y - 12);
        ctx.moveTo(934, Y + 12);
        ctx.lineTo(986, Y + 12);
        ctx.moveTo(974, Y - 34);
        ctx.lineTo(946, Y + 34);
      },
      { color: P.muted, alpha: stageA * ramp(t, different - 0.15, 0.4) * (1 - gone), width: 4 },
    );
  }
  // The judgment works on the declared sources: every relevant constraint in them flows to it and is sorted three ways,
  // each on its words; a point travels along the branch that is being named.
  if (stageB > 0) {
    const { rows, dx: shift } = s04SortShift(),
      lead = S04_LEAD * (1 - soon(t, keptAt - 0.3, 0.6)),
      dx = shift + lead;
    const Y = 500,
      DX = 430 + dx,
      BUS = 760 + dx,
      IX = 900 + dx,
      ys = [370, 500, 630],
      ats = [keptAt, excludedAt, openAt],
      q = (voiceTime(t) * 0.45) % 1;
    const docs = stageB;
    [
      [-22, -18],
      [0, 0],
      [22, 18],
    ].forEach(([dx, dy]) =>
      documentIcon(DX - 56 + dx, Y - 74 + dy, 112, 148, { alpha: docs, rows: 4 }),
    );
    nameText(L("指定范围的资料", "Declared sources"), DX, Y + 92 + NAME_GAP, {
      valign: "top",
      alpha: stageB,
    });
    nameText(L("要靠判断", "Takes judgment"), BUS - 60, Y - 150, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB,
    });
    person(BUS - 60, Y - 96, { alpha: stageB, size: 1.1, color: P.authority });
    link(DX + 96, Y, BUS, Y, { alpha: docs, upto: soon(t, constraint, 0.5), flow: q, end: false });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i),
        c = blend(P.ink, [P.evidence, P.authority, P.unknown][i], lit),
        y = ys[i];
      const q = clamp((t - at) / 0.8);
      link(BUS, Y, IX - 34, y, {
        route: "hvh",
        mid: BUS + 40,
        alpha: on,
        upto: soon(t, at, 0.4),
        flow: q < 1 ? q : null,
        color: P.line,
      });
      ring(IX, y, 34, { color: c, alpha: on, width: 2.5 });
      if (i === 0) check(IX, y + 2, 28, { color: c, alpha: on });
      if (i === 1) cross(IX, y, 24, { color: c, alpha: on });
      if (i === 2) text("?", IX, y + 1, 30, { role: "mark", align: "center", color: c, alpha: on });
      nameText(rows[i], IX + 34 + NAME_GAP, y, {
        align: "left",
        alpha: stageB * listIn(t, ats, i),
        set: "sorted",
      });
    });
  }
  // Examples and counterexamples test the understanding from both sides: each side arrives on its words, the
  // understanding they test stands between them when it is named, and the test reaches what is out of scope and where
  // the exceptions lie.
  if (stageC > 0) {
    const CX = 960,
      CY = 440,
      R = 104,
      LX = 460,
      RX = 1460,
      q = (voiceTime(t) * 0.45) % 1,
      mid = stageC * ramp(t, thatAt - 0.15, 0.4);
    ring(CX, CY, R, { color: P.authority, alpha: mid, width: 3 });
    person(CX, CY - 6, { alpha: mid, size: 1.5, color: P.authority });
    nameText(L("这个理解", "That understanding"), CX, CY + R + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageC * named(t, thatAt),
    });
    const pos = stageC,
      neg = stageC * ramp(t, negAt - 0.15, 0.4);
    [-50, 0, 50].forEach((dy) => {
      dot(LX, CY + dy, 14, { color: P.ground, alpha: pos });
      ring(LX, CY + dy, 14, { color: P.evidence, alpha: pos, width: 2.5 });
      check(LX, CY + dy + 1, 13, { color: P.evidence, alpha: pos, width: 2.5 });
      dot(RX, CY + dy, 14, { color: P.ground, alpha: neg });
      ring(RX, CY + dy, 14, { color: P.unknown, alpha: neg, width: 2.5 });
      cross(RX, CY + dy, 11, { alpha: neg, width: 2.5 });
    });
    link(LX + 30, CY, CX - R, CY, {
      alpha: Math.min(pos, mid),
      upto: soon(t, Math.max(posAt, thatAt) + 0.1, 0.5),
      flow: q,
      color: P.evidence,
    });
    link(RX - 30, CY, CX + R, CY, {
      alpha: Math.min(neg, mid),
      upto: soon(t, Math.max(negAt, thatAt) + 0.1, 0.5),
      flow: q,
      color: P.unknown,
    });
    nameText(L("正例", "Examples"), LX, CY + 64 + NAME_GAP, {
      valign: "top",
      alpha: stageC,
      set: "tests",
    });
    nameText(L("反例", "Counterexamples"), RX, CY + 64 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, negAt),
      set: "tests",
    });
    const ats = [scopeAt, excAt],
      names = en
        ? ["What is out of scope", "Where the exceptions lie"]
        : ["哪些不做", "例外在哪里"];
    railNames(names, [CX - 230, CX + 230], CY + R + 92, {
      gap: 0,
      alpha: (i) => stageC * listIn(t, ats, i),
      set: "reach",
      wrap: 400,
    });
    ats.forEach((at, i) =>
      link(CX + (i ? 120 : -120), CY + R * 0.7, CX + (i ? 230 : -230), CY + R + 88, {
        route: "hv",
        alpha: stageC * ramp(t, at - 0.15, 0.4),
        upto: soon(t, at, 0.4),
        color: P.line,
      }),
    );
  }
  // Only then does ETHOS compile: its kernel stands first, at the centre; the accepted intent enters it from the left, and
  // the criteria and checks it compiles stand on the right.
  if (stageD > 0) {
    const Y = 440,
      KR = 130,
      KX = 960,
      FX = 380,
      CX = 1540,
      q = (voiceTime(t) * 0.45) % 1;
    const enter = stageD * ramp(t, intentAt - 0.15, 0.4),
      made = stageD * ramp(t, criteriaAt - 0.15, 0.4);
    kernelIcon(KX, Y, KR, { alpha: stageD, beat: soon(t, rulesAt, 0.5) });
    nameText("ETHOS", KX, Y - KR - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD * named(t, ethosAt),
    });
    nameText(L("按固定的规则", "Deterministic rules"), KX, Y + KR + NAME_GAP, {
      valign: "top",
      alpha: stageD * named(t, rulesAt),
    });
    folderIcon(FX - 130, Y - 85, 260, 170, { alpha: enter, color: P.authority });
    documentIcon(FX - 34, Y - 52, 68, 88, { alpha: enter, rows: 3 });
    nameText(L("采纳的意图", "Accepted intent"), FX, Y + 85 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageD * named(t, intentAt),
    });
    link(FX + 130, Y, KX - KR * 0.86, Y, {
      alpha: enter,
      upto: soon(t, intentAt + 0.1, 0.5),
      flow: q,
    });
    link(KX + KR * 0.86, Y, CX - 100, Y, {
      alpha: made,
      upto: soon(t, criteriaAt, 0.5),
      flow: q,
      color: P.evidence,
    });
    documentIcon(CX - 100, Y - 90, 200, 180, { alpha: made, rows: 0 });
    [0, 1, 2].forEach((i) =>
      check(CX - 60, Y - 46 + i * 46, 22, { alpha: made, color: P.evidence }),
    );
    stroke(
      () =>
        [0, 1, 2].forEach((i) => {
          ctx.moveTo(CX - 32, Y - 46 + i * 46);
          ctx.lineTo(CX + 66, Y - 46 + i * 46);
        }),
      { color: P.muted, alpha: made, width: 2 },
    );
    nameText(L("验收条件和检查", "Acceptance criteria and checks"), CX, Y + 90 + NAME_GAP, {
      valign: "top",
      width: 320,
      color: P.evidence,
      alpha: stageD * named(t, criteriaAt),
    });
  }
  // The same inputs compile to the same criteria, twice over; that says nothing about whether the understanding is right.
  if (stageE > 0) {
    const ys = [360, 520],
      DX = 560,
      KX = 960,
      CX = 1360,
      q = (voiceTime(t) * 0.45) % 1,
      out = stageE * ramp(t, sameOut - 0.15, 0.4);
    ys.forEach((y) => {
      documentIcon(DX - 40, y - 52, 80, 104, { alpha: stageE, rows: 3 });
      kernelIcon(KX, y, 54, { alpha: stageE });
      link(DX + 40, y, KX - 48, y, { alpha: stageE, flow: q });
      link(KX + 48, y, CX - 40, y, {
        alpha: out,
        flow: q,
        color: P.evidence,
        upto: soon(t, sameOut - 0.1, 0.5),
      });
      documentIcon(CX - 40, y - 52, 80, 104, { alpha: out, rows: 0 });
      [0, 1, 2].forEach((i) =>
        check(CX - 18, y - 26 + i * 26, 15, { alpha: out, color: P.evidence, width: 2.5 }),
      );
    });
    nameText(L("同样的输入", "The same inputs"), DX - 40 - NAME_GAP, (ys[0] + ys[1]) / 2, {
      align: "right",
      alpha: stageE * named(t, sameAt),
    });
    link(DX - 40 - 10, ys[0] + 52, DX - 40 - 10, ys[1] - 52, { alpha: stageE, end: false });
    nameText(L("同样的验收条件", "The same criteria"), CX + 40 + NAME_GAP, (ys[0] + ys[1]) / 2, {
      align: "left",
      color: P.evidence,
      alpha: stageE * named(t, sameOut),
    });
    link(CX + 40 + 10, ys[0] + 52, CX + 40 + 10, ys[1] - 52, {
      alpha: out,
      end: false,
      color: P.evidence,
    });
    const no = stageE * named(t, cannot);
    person(780, 672, { alpha: no, color: P.muted, size: 0.9 });
    rejectedName(L("保证理解是对的", "Proof that anyone understood"), 824, 684, {
      align: "left",
      alpha: no,
      mark: ramp(t, cannot + 0.3, 0.4),
    });
  }
  // Leads are not authority: three kinds of trace stand in a row without a seal, and saying a thing again only stacks it.
  if (stageF > 0) {
    const lead = 220 * (1 - soon(t, repeat - 0.1, 0.5)),
      Y = 440,
      names = en
        ? ["Transcripts", "An agent's memory", "Summaries"]
        : ["对话记录", "Agent 的记忆", "各种总结"],
      xs = railStations(names, 330 + lead, 980 + lead),
      ats = [trans, memory, summ];
    const onAt = (i) => stageF * ramp(t, ats[i] - 0.15, 0.4),
      left = xs[0] - 80,
      right = xs[2] + 80;
    bubble(xs[0], Y, 44, { alpha: onAt(0) });
    agent(xs[1] - 30, Y, { alpha: onAt(1), color: P.muted, size: 1.3 });
    box(xs[1] + 6, Y - 34, 62, 68, { stroke: P.muted, alpha: onAt(1), radius: 10, dash: [6, 6] });
    documentIcon(xs[2] - 38, Y - 50, 76, 100, { alpha: onAt(2), rows: 3, stroke: P.muted });
    railNames(names, xs, Y + 60, {
      gap: NAME_GAP,
      alpha: (i) => stageF * listIn(t, ats, i),
      set: "traces",
    });
    const no = stageF * named(t, noAuth),
      BY = Y + 150;
    path(
      [
        [left, BY - 22],
        [left, BY],
        [right, BY],
        [right, BY - 22],
      ],
      { color: P.line, alpha: no, width: 2 },
    );
    rejectedName(
      L("只是线索，没有决定权", "Leads, not authority"),
      (left + right) / 2,
      BY + NAME_GAP,
      { valign: "top", alpha: no, mark: ramp(t, noAuth + 0.3, 0.4) },
    );
    const r = stageF * ramp(t, repeat - 0.15, 0.4),
      RX = 1440;
    [
      [-32, -44],
      [-10, -14],
      [14, 18],
      [38, 50],
    ].forEach(([dx, dy], i) =>
      bubble(RX + dx, Y + dy, 40, { alpha: r * ramp(t, repeat - 0.1 + i * 0.22, 0.3) }),
    );
    rejectedName(L("说上很多遍", "Repeating a request"), RX, Y + 110, {
      valign: "top",
      alpha: stageF * named(t, repeat),
      mark: ramp(t, repeat + 0.9, 0.4),
    });
  }
  // One obligation has exactly one disposition. The obligations stand as the rows of a ledger, and the one followed is
  // marked at its edge; it beats once as what it means is said. The ledger steps aside when an obligation is given a
  // disposition, and the obligation's single line leaves it, reaches the first state when that is named and then moves to
  // each state as it is named, so it never stands on two at once. A superseding instruction comes from whoever may
  // decide: the later instruction joins the earlier one on its words.
  if (stageG > 0) {
    const Y = 490,
      IX = 1000,
      HUB = 800,
      STEP = 100,
      ys = [340, 440, 540, 640],
      ats = [accepted, superseded, pending, rejected];
    const names = en
      ? ["Accepted", null, "Pending verification", "Rejected with its reason"]
      : ["采纳", null, "等检验", "拒绝，写明理由"];
    const DW = 240,
      DH = 300,
      LX = mix(960, 520, soon(t, givenAt - 0.1, 0.9)),
      TX = LX + DW / 2;
    ledger(LX, Y, DW, DH, { alpha: stageG });
    token(TX, Y, { color: P.authority, r: 20, alpha: stageG });
    beats(t, TX, Y, 34, [mustAt], { color: P.authority, alpha: stageG });
    nameText(L("每一项责任", "Each obligation"), LX, Y + DH / 2 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageG,
    });
    nameText(L("只能有一个去向", "Exactly one disposition"), LX, Y + DH / 2 + NAME_GAP + 44, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageG * named(t, oneWay),
    });
    const moved = ats.slice(1).reduce((v, at) => v + soon(t, at - 0.1, 0.4), 0),
      yNow = ys[0] + moved * STEP;
    const length = HUB - TX - 20 + Math.abs(yNow - Y) + (IX - 30 - HUB),
      stub = (HUB - TX - 20 - 14) / length;
    link(TX + 20, Y, IX - 30, yNow, {
      route: "hvh",
      mid: HUB,
      alpha: stageG * ramp(t, givenAt - 0.1, 0.3),
      upto: stub * soon(t, givenAt + 0.6, 0.5) + (1 - stub) * soon(t, accepted - 0.1, 0.4),
      color: P.authority,
      width: 2.5,
    });
    ats.forEach((at, i) => {
      const on = stageG * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i),
        c = blend(P.ink, P.evidence, lit),
        y = ys[i];
      ring(IX, y, 30, { color: c, alpha: on, width: 2.5 });
      if (i === 0) check(IX, y + 2, 26, { color: c, alpha: on });
      if (i === 1) {
        documentIcon(IX - 16, y - 16, 22, 30, { alpha: on, rows: 0, stroke: P.muted, fold: false });
        documentIcon(IX - 6, y - 12, 22, 30, {
          alpha: on * ramp(t, newAt - 0.15, 0.4),
          rows: 0,
          stroke: c,
          fold: false,
        });
      }
      if (i === 2) clock(IX, y, 15, { color: c, alpha: on, hand: 0.15 });
      if (i === 3) cross(IX, y, 22, { color: c, alpha: on });
      if (names[i] !== null)
        nameText(names[i], IX + 30 + NAME_GAP, y, {
          align: "left",
          width: 520,
          alpha: stageG * listIn(t, ats, i),
          set: "dispositions",
        });
      else
        termRow(
          t,
          [L("被取代", "Superseded")],
          [at],
          [L("有权决定的人另有指示", "by a later governing instruction")],
          [laterAt],
          IX + 30 + NAME_GAP,
          y - labelSize(LABEL) / 2,
          { width: 520, alpha: stageG * listLevel(t, ats, i), set: "dispositions" },
        );
    });
  }
};
