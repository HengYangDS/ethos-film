/* 03 written into a Change. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { pipelineMark, signalMark } from "../../drawing/examples.js";
import { link } from "../../drawing/links.js";
import { measure, ring, stroke } from "../../drawing/strokes.js";
import { agent, check, cross, documentIcon, person, seal } from "../../drawing/symbols.js";
import { folderIcon, kernelIcon } from "../../drawing/workspace.js";
import { clearOfTitle, illustrative } from "../../framing/chapters.js";
import { building, listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, rejectedName } from "../../naming/names.js";
import { CONTENT_CY, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["03"] = function (s, t) {
  const [what, how] = cues(s, [
    ["打算改什么", "what will change"],
    ["怎么判断", "how we will know"],
  ]);
  const [forPipe, reliable, same, alike, verify] = cues(s, [
    ["比如要求", "For a pipeline"],
    ["更可靠", "more reliable"],
    ["哪些记录算同一条", "which records count"],
    ["看着像重复", "look-alike"],
    ["用什么办法检验", "how we will verify"],
  ]);
  const [study, hypo, refute] = cues(s, [
    ["研究信号", "A signal study"],
    ["写下假设", "its hypothesis"],
    ["出现什么结果", "the result that would refute"],
  ]);
  const [goes, into, openspec, proposal, specs, design, tasks] = cues(s, [
    ["这些内容", "All of this"],
    ["写进仓库", "goes into"],
    ["OpenSpec", "OpenSpec"],
    ["提案讲", "A proposal"],
    ["规格写清", "specs state"],
    ["设计记下", "a design"],
    ["任务清单", "a task list"],
  ]);
  // English says what each part holds after naming the part, so each note stands on its own words.
  const noteAts = en
    ? cues(s, [
        ["", "says why"],
        ["", "the required behavior"],
        ["", "the trade-offs"],
        ["", "tracks progress"],
      ])
    : [proposal, specs, design, tasks];
  const [reads, compile, only, elsewhere] = cues(s, [
    ["ETHOS 会读取", "ETHOS reads"],
    ["编译成验收条件", "compiles it"],
    ["只记在正式变更里", "is kept in the Change"],
    ["不在别的地方", "nowhere else"],
  ]);
  const [found, revised, authority, again] = cues(s, [
    ["研究有了新发现", "Research may push"],
    ["改过的要求", "a revised requirement"],
    ["有权决定的人", "whoever has the authority"],
    ["重新采纳", "accepted again"],
  ]);
  const stageA = stageOut(t, forPipe),
    stageB = stageIn(t, forPipe) * stageOut(t, study),
    stageC = stageIn(t, study) * stageOut(t, goes);
  const stageD = stageIn(t, goes) * stageOut(t, proposal),
    stageD2 = stageIn(t, proposal) * stageOut(t, reads),
    stageE = stageIn(t, reads) * stageOut(t, found),
    stageF = stageIn(t, found);
  const q = (voiceTime(t) * 0.4) % 1;
  // A person and an agent write one document together, and it answers two questions.
  if (stageA > 0) {
    const nameW = Math.max(
      measure(L("打算改什么", "What will change")),
      measure(L("怎么判断改得有效", "How we will know it worked")),
    );
    const dx = Math.round(960 - (400 + 1010 + 36 + NAME_GAP + nameW) / 2);
    const g = stageA * clearOfTitle(s, t, 350),
      PX = 440 + dx,
      YA = 400,
      YB = 600,
      DX = 700 + dx,
      DW = 130,
      DH = 170,
      IX = 1010 + dx;
    person(PX, YA - 6, { alpha: g, size: 1.3 });
    agent(PX, YB - 8, { alpha: g, size: 1.3 });
    nameText(L("人", "People"), PX, YA + 40 + NAME_GAP - 14, { valign: "top", alpha: g });
    nameText("Agent", PX, YB + 20 + NAME_GAP, { valign: "top", alpha: g });
    documentIcon(DX, CONTENT_CY - DH / 2, DW, DH, { alpha: g, rows: 4 });
    link(PX + 40, YA - 6, DX, CONTENT_CY - 40, { route: "hvh", mid: 600 + dx, alpha: g });
    link(PX + 40, YB - 8, DX, CONTENT_CY + 40, { route: "hvh", mid: 600 + dx, alpha: g });
    const ats = [what, how],
      ys = [YA, YB];
    ats.forEach((at, i) => {
      const on = g * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i),
        c = blend(P.ink, P.authority, lit);
      link(DX + DW, CONTENT_CY + (i ? 40 : -40), IX - 36, ys[i], {
        route: "hvh",
        mid: 915 + dx,
        alpha: on,
        upto: soon(t, at, 0.4),
      });
      ring(IX, ys[i], 36, { color: c, alpha: on, width: 2.5 });
      if (i === 0) {
        documentIcon(IX - 13, ys[i] - 17, 26, 34, { alpha: on, rows: 2, stroke: c, fold: false });
      } else check(IX, ys[i] + 2, 30, { color: c, alpha: on });
    });
    nameText(L("打算改什么", "What will change"), IX + 36 + NAME_GAP, YA, {
      align: "left",
      alpha: g * listIn(t, ats, 0),
      set: "questions",
    });
    nameText(L("怎么判断改得有效", "How we will know it worked"), IX + 36 + NAME_GAP, YB, {
      align: "left",
      alpha: g * listIn(t, ats, 1),
      set: "questions",
    });
  }
  // The pipeline again, named by what it must withstand: "more reliable" is refused, and three exact statements take
  // its place, each with its mark.
  if (stageB > 0) {
    const PY = mix(430, 340, soon(t, same - 0.35, 0.5));
    const m = pipelineMark(960, PY, 780, { alpha: stageB, flow: q, back: 1 });
    nameText(L("经得起重新运行", "Must tolerate reruns"), 960, m.top - NAME_GAP, {
      valign: "bottom",
      alpha: stageB,
    });
    rejectedName(L("更可靠", "More reliable"), 960, PY + 128, {
      alpha: stageB * named(t, reliable),
      mark: ramp(t, reliable + 0.4, 0.4),
    });
    const rows = en
      ? [
          "Which records count as the same",
          "Which look-alike records must stay",
          "How we verify nothing is duplicated",
        ]
      : ["哪些记录算同一条", "哪些看着像重复、其实要留下", "用什么办法检验没有重复"];
    const ats = [same, alike, verify],
      ys = [535, 620, 705],
      widest = Math.max(...rows.map((v) => measure(v))),
      GX = Math.round(960 - (56 + NAME_GAP + widest) / 2 + 28);
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i),
        c = blend(P.ink, P.evidence, lit),
        y = ys[i];
      ring(GX, y, 28, { color: c, alpha: on, width: 2.5 });
      if (i < 2) {
        stroke(
          () => {
            ctx.moveTo(GX - 12, y - 6);
            ctx.lineTo(GX + 12, y - 6);
            ctx.moveTo(GX - 12, y + 6);
            ctx.lineTo(GX + 12, y + 6);
            if (i === 1) {
              ctx.moveTo(GX + 8, y - 14);
              ctx.lineTo(GX - 8, y + 14);
            }
          },
          { color: c, alpha: on, width: 2.5 },
        );
      } else check(GX, y + 2, 24, { color: c, alpha: on });
      nameText(rows[i], GX + 28 + NAME_GAP, y, {
        align: "left",
        alpha: stageB * listIn(t, ats, i),
        set: "statements",
      });
    });
    illustrative(stageB);
  }
  // The signal study writes its hypothesis first, and with it the result that would refute it.
  if (stageC > 0) {
    const SX = 690,
      SW = 680,
      Y = 500;
    const m = signalMark(SX, Y, SW, 260, { alpha: stageC, seen: 1, marker: 1 });
    nameText(L("选股信号", "Stock-selection signal"), SX, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: stageC,
    });
    const IX = 1190,
      ys = [410, 590],
      ats = [hypo, refute];
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i),
        c = blend(P.ink, i ? P.unknown : P.authority, lit);
      documentIcon(IX - 32, ys[i] - 42, 64, 84, { alpha: on, rows: 3, stroke: c });
      if (i) cross(IX + 40, ys[i] - 34, 22, { alpha: on });
    });
    nameText(L("假设", "The hypothesis"), IX + 40 + NAME_GAP, ys[0], {
      align: "left",
      color: P.authority,
      alpha: stageC * listIn(t, ats, 0),
      set: "written",
    });
    nameText(
      L("什么结果说明它不成立", "The result that refutes it"),
      IX + 40 + NAME_GAP + 10,
      ys[1],
      { align: "left", width: 340, alpha: stageC * listIn(t, ats, 1), set: "written" },
    );
    illustrative(stageC);
  }
  // All of it goes into one Change in the repository; from there the Change opens, a folder that grows by a document at
  // a time as its parts are named.
  if (stageD > 0) {
    const Y = 480,
      FW = 300,
      FH = 190,
      FX = 960 - FW / 2,
      on = stageD,
      written = stageD * ramp(t, into - 0.15, 0.4),
      flow = soon(t, into + 0.1, 0.7);
    const p = pipelineMark(380, Y, 460, { alpha: on, flow: q });
    const m = signalMark(1540, Y, 460, 130, { alpha: on, seen: 1, marker: 1 });
    nameText(L("管线的要求", "The pipeline's statements"), 380, p.bottom + NAME_GAP, {
      valign: "top",
      alpha: on,
    });
    nameText(L("信号的假设", "The signal's hypothesis"), 1540, m.bottom + NAME_GAP, {
      valign: "top",
      alpha: on,
    });
    folderIcon(FX, Y - FH / 2, FW, FH, { alpha: written, color: P.authority });
    nameText(L("正式变更", "Change"), 960, Y + 8, {
      color: P.authority,
      alpha: written,
      bold: true,
    });
    link(p.storeX + 46, Y, FX, Y, { alpha: on, upto: flow, color: P.line });
    link(1310, Y, FX + FW, Y, { alpha: on, upto: flow, color: P.line });
    nameText(L("写进仓库", "In the repository"), 960, Y + FH / 2 + NAME_GAP, {
      valign: "top",
      alpha: written,
    });
    nameText("OpenSpec", 960, Y - FH / 2 - NAME_GAP, {
      valign: "bottom",
      color: P.evidence,
      alpha: on * named(t, openspec),
    });
  }
  if (stageD2 > 0) {
    const names = en
      ? ["Proposal", "Specs", "Design", "Task list"]
      : ["提案", "规格", "设计", "任务清单"];
    const notes = en
      ? ["Why", ["Required behavior,", "acceptance scenarios"], "The trade-offs", "Progress"]
      : ["为什么要改", "要满足的行为和验收场景", "做了哪些取舍", "进度"];
    const ats = [proposal, specs, design, tasks],
      PAD = 26,
      GAP = 56,
      FH = 270,
      FY = 345,
      DW = 80,
      DH = 90,
      DY = FY + 28;
    const half = names.map(
      (v, i) =>
        Math.max(DW, measure(v), ...[notes[i]].flat().map((line) => measure(line, NOTE))) / 2,
    );
    const xs = half.reduce(
      (list, h, i) => [...list, i ? list[i - 1] + half[i - 1] + GAP + h : PAD + h],
      [],
    );
    const reach = (n) => xs[n] + half[n] + PAD;
    const growth = ats.map((at) => soon(t, at - 0.5, 0.4)),
      n = growth.filter((v) => v >= 1).length;
    const W =
        n === 0
          ? mix(240, reach(0), growth[0])
          : n >= ats.length
            ? reach(ats.length - 1)
            : mix(reach(n - 1), reach(n), growth[n]),
      FX = 960 - W / 2;
    folderIcon(FX, FY, W, FH, { alpha: stageD2, color: P.authority });
    nameText(L("正式变更", "Change"), 960, FY - NAME_GAP + 4, {
      valign: "bottom",
      color: P.authority,
      alpha: stageD2,
      bold: true,
    });
    nameText("OpenSpec", 960, FY + FH + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageD2,
    });
    ats.forEach((at, i) => {
      const x = FX + xs[i],
        on = stageD2 * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i);
      documentIcon(x - DW / 2, DY, DW, DH, {
        alpha: on,
        rows: 3,
        stroke: blend(P.ink, P.evidence, lit),
      });
      nameText(names[i], x, DY + DH + NAME_GAP - 6, {
        valign: "top",
        alpha: stageD2 * listIn(t, ats, i),
        set: "parts",
      });
      nameText(notes[i], x, DY + DH + NAME_GAP + 36, {
        valign: "top",
        size: NOTE,
        color: P.muted,
        alpha: stageD2 * listIn(t, noteAts, i),
        set: "parts",
      });
    });
  }
  // The kernel reads the Change and compiles it into acceptance criteria. Accepted intent stands in the Change and
  // nowhere else: a copy kept elsewhere is refused.
  if (stageE > 0) {
    const shift = 270 * (1 - soon(t, compile, 0.5)),
      Y = 420,
      FX = 420 + shift,
      KX = 960 + shift,
      CX = 1500 + shift,
      on = stageE,
      read = soon(t, reads + 0.1, 0.6),
      made = stageE * ramp(t, compile + 0.25, 0.4);
    folderIcon(FX - 130, Y - 85, 260, 170, { alpha: on, color: P.authority });
    documentIcon(FX - 34, Y - 52, 68, 88, { alpha: on, rows: 3 });
    nameText(L("正式变更", "The Change"), FX, Y + 85 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: on,
    });
    kernelIcon(KX, Y, 66, { alpha: on, beat: read });
    nameText("ETHOS", KX, Y + 66 + NAME_GAP, { valign: "top", alpha: on });
    link(FX + 130, Y, KX - 60, Y, { alpha: on, upto: read });
    const fl = (voiceTime(t) * 0.5) % 1;
    link(KX + 60, Y, CX - 90, Y, {
      alpha: made,
      upto: soon(t, compile + 0.15, 0.6),
      flow: fl,
      color: P.evidence,
    });
    documentIcon(CX - 90, Y - 80, 180, 160, { alpha: made, rows: 0 });
    [0, 1, 2].forEach((i) =>
      check(CX - 54, Y - 42 + i * 42, 20, { alpha: made, color: P.evidence }),
    );
    stroke(
      () =>
        [0, 1, 2].forEach((i) => {
          ctx.moveTo(CX - 28, Y - 42 + i * 42);
          ctx.lineTo(CX + 58, Y - 42 + i * 42);
        }),
      { color: P.muted, alpha: made, width: 2 },
    );
    nameText(L("验收条件", "Acceptance criteria"), CX, Y + 80 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageE * named(t, compile + 0.25),
    });
    const keep = stageE * named(t, only),
      no = stageE * named(t, elsewhere);
    nameText(L("采纳的意图只记在这里", "Accepted intent is kept here"), FX, 650, {
      color: P.authority,
      alpha: keep,
    });
    documentIcon(1010, 610, 62, 80, { alpha: no, rows: 3, stroke: P.muted });
    rejectedName(L("另记一份", "A copy anywhere else"), 1090, 650, {
      align: "left",
      alpha: no,
      mark: ramp(t, elsewhere + 0.3, 0.4),
    });
  }
  // A new finding may change the intent, and the changed requirement goes back to whoever has the authority before it
  // stands in the Change again.
  if (stageF > 0) {
    const Y = 470,
      names = en
        ? [
            "A new finding",
            "The revised requirement",
            "Whoever has the authority",
            "Accepted again",
          ]
        : ["新发现", "改过的要求", "有权决定的人", "重新采纳"];
    const xs = railStations(names, 400, 1540, { wrap: 280 });
    const order = en ? [found, revised, again, again] : [found, revised, authority, again];
    const on = (i) => stageF * ramp(t, order[i] - 0.15, 0.4),
      bx = building(t, order, 190, 0.55);
    ctx.save();
    ctx.translate(bx, 0);
    signalMark(xs[0], Y, 380, 200, { alpha: on(0), seen: 1, marker: 1 });
    documentIcon(xs[1] - 44, Y - 58, 88, 116, { alpha: on(1), rows: 3, stroke: P.evidence });
    person(xs[2], Y - 4, { alpha: on(2), size: 1.3, color: P.authority });
    seal(xs[2] + 62, Y - 30, 22, { alpha: on(2) });
    folderIcon(xs[3] - 90, Y - 62, 180, 124, { alpha: on(3), color: P.authority });
    check(xs[3], Y + 4, 34, { alpha: on(3), color: P.authority });
    [0, 1, 2].forEach((i) =>
      link(xs[i] + [200, 52, 92][i], Y, xs[i + 1] - [52, 44, 98][i], Y, {
        alpha: on(i + 1),
        upto: soon(t, order[i + 1] - 0.1, 0.5),
      }),
    );
    names.forEach((v, i) =>
      nameText(v, xs[i], Y + 120, {
        valign: "top",
        width: 280,
        alpha: stageF * named(t, order[i]),
        color: i > 1 ? P.authority : P.ink,
        set: "revised",
      }),
    );
    ctx.restore();
  }
};
