/* 07 the check before writing. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { laneTrack, writeGate } from "../../drawing/lanes.js";
import { link } from "../../drawing/links.js";
import { box, dot, line, measure, ring, stroke, text } from "../../drawing/strokes.js";
import { agent, clock, cross, documentIcon, lock, person, seal } from "../../drawing/symbols.js";
import { folderIcon } from "../../drawing/workspace.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, nameText, rejectedName } from "../../naming/names.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, pass, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["07"] = function (s, t) {
  const notEdit = cue(s, "不等于", "is not permission");
  const [each, wtAt, filesAt] = en
    ? cues(s, [
        ["", "Each change"],
        ["", "the lane's worktree"],
        ["", "exactly the files"],
      ])
    : cues(s, [
        ["每次修改", ""],
        ["这个工作区", ""],
        ["这几个文件", ""],
      ]);
  const [ifAt, dirty, foreign, state, readOnly, freshAt] = cues(s, [
    ["如果那里有", "If there is"],
    ["还没提交的改动", "uncommitted work"],
    ["文件是别人的", "the files belong"],
    ["状态跟预期对不上", "the state is not"],
    ["只能看", "can be read"],
    ["重新检查放行", "a fresh check"],
  ]);
  const [ago, nowAt, onlyAt, unrelated] = cues(s, [
    ["几分钟前", "A check that passed"],
    ["现在再查一次", "for one now"],
    ["只有写这几个文件要等", "Only writes"],
    ["无关的工作", "unrelated work"],
  ]);
  const [limit, mechanism, willing, notOs, cannot] = cues(s, [
    ["还有一个局限", "There is one limit"],
    ["这套机制", "lanes and checks"],
    ["愿意遵守约定", "participants who follow"],
    ["操作系统那种隔离", "isolation of the kind"],
    ["拦不住", "cannot stop"],
  ]);
  const stageA = stageOut(t, each),
    stageB = stageIn(t, each) * stageOut(t, ifAt),
    stageC = stageIn(t, ifAt) * stageOut(t, ago),
    stageD = stageIn(t, ago) * stageOut(t, limit),
    stageE = stageIn(t, limit);
  // Holding a lane on the left, one file at this moment on the right, and between them the two are not the same thing.
  if (stageA > 0) {
    const Y = 480,
      X0 = 300,
      X1 = 840,
      DX = 1360,
      q = (voiceTime(t) * 0.35) % 1;
    laneTrack(X0, X1, Y, { alpha: stageA, flow: q });
    person(mix(X0, X1, 0.5) + 30, Y - 50, { alpha: stageA, size: 1.2, color: P.authority });
    nameText(L("持有一条通道", "Holding a lane"), mix(X0, X1, 0.5) + 30, Y + NAME_GAP + 6, {
      valign: "top",
      color: P.authority,
      alpha: stageA,
    });
    stroke(
      () => {
        ctx.moveTo(1010, Y - 12);
        ctx.lineTo(1060, Y - 12);
        ctx.moveTo(1010, Y + 12);
        ctx.lineTo(1060, Y + 12);
        ctx.moveTo(1048, Y - 34);
        ctx.lineTo(1022, Y + 34);
      },
      { color: P.muted, alpha: stageA * ramp(t, notEdit - 0.15, 0.4), width: 4 },
    );
    const on = stageA * ramp(t, notEdit - 0.15, 0.4);
    documentIcon(DX - 70, Y - 92, 140, 184, { alpha: on, rows: 5 });
    lock(DX + 70, Y + 80, { alpha: on, size: 1.3 });
    nameText(L("此刻改这个文件", "Editing this file now"), DX, Y + 92 + NAME_GAP, {
      valign: "top",
      alpha: on,
    });
  }
  // Every write meets its own gate, named from the thought's first words: an agent carries a change up to it, and the
  // check looks at the worktree and exactly the files about to change, as they are now.
  if (stageB > 0) {
    const lead = 200 * (1 - soon(t, wtAt - 0.3, 0.5)),
      Y = 490,
      AX = 330 + lead,
      GX = 800 + lead,
      FX = 1090 + lead,
      FW = 480,
      FH = 250,
      q = (voiceTime(t) * 0.4) % 1;
    agent(AX, Y, { alpha: stageB, size: 1.5 });
    nameText("Agent", AX, Y + 40 + NAME_GAP, { valign: "top", alpha: stageB });
    documentIcon(AX + 70, Y - 34, 52, 68, { alpha: stageB, rows: 3, stroke: P.evidence });
    link(AX + 126, Y, GX - 36, Y, { alpha: stageB, flow: q });
    writeGate(GX, Y, 280, { alpha: stageB, single: true });
    nameText(L("写入前的检查", "A check just before writing"), GX, Y - 140 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageB,
    });
    const wt = stageB * ramp(t, wtAt - 0.15, 0.4),
      files = stageB * ramp(t, filesAt - 0.4, 0.4);
    folderIcon(FX, Y - FH / 2, FW, FH, { alpha: wt });
    nameText(L("这个工作区", "The lane's worktree"), FX + FW / 2, Y + FH / 2 + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, wtAt),
    });
    const xs = [FX + 100, FX + 240, FX + 380];
    xs.forEach((x, i) =>
      documentIcon(x - 52, Y - 72, 104, 136, {
        alpha: files,
        rows: 3,
        stroke: i === 1 ? P.authority : P.muted,
      }),
    );
    nameText(L("这几个文件", "Exactly these files"), FX + FW / 2, Y + 94, {
      alpha: stageB * named(t, filesAt),
      color: P.authority,
    });
    const scan = (voiceTime(t) * 0.3) % 1;
    line(mix(FX + 30, FX + FW - 30, scan), Y - 100, mix(FX + 30, FX + FW - 30, scan), Y + 74, {
      color: P.evidence,
      alpha: wt * pass(scan, 0.1),
      width: 2.5,
    });
    link(GX + 36, Y, FX, Y, { alpha: wt, upto: soon(t, wtAt, 0.5), dash: [8, 9] });
  }
  // Three findings stop a write at the gate, which keeps its name beside the files it guards. The files stay readable,
  // the write waits, and only a fresh check lifts the bar.
  if (stageC > 0) {
    const ats = [dirty, foreign, state],
      ys = [350, 490, 630],
      IX = 300,
      GX = 1010,
      Y = 490,
      names = en
        ? ["Uncommitted work", "Someone else's, or unclear", "Not the state expected"]
        : ["还没提交的改动", "别人的，或归属说不清", "状态跟预期对不上"];
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, P.unknown, speaking(t, ats, i)),
        y = ys[i];
      if (i === 0) {
        documentIcon(IX - 28, y - 36, 56, 72, { alpha: on, rows: 3, stroke: c });
        dot(IX + 24, y - 30, 8, { color: P.unknown, alpha: on });
      }
      if (i === 1) {
        person(IX, y, { alpha: on, size: 0.9, color: c });
        text("?", IX + 34, y - 22, 30, { role: "mark", color: P.unknown, alpha: on });
      }
      if (i === 2) {
        ring(IX, y, 30, { color: c, alpha: on, width: 2.5 });
        stroke(
          () => {
            ctx.moveTo(IX - 13, y - 6);
            ctx.lineTo(IX + 13, y - 6);
            ctx.moveTo(IX - 13, y + 6);
            ctx.lineTo(IX + 13, y + 6);
            ctx.moveTo(IX + 8, y - 15);
            ctx.lineTo(IX - 8, y + 15);
          },
          { color: c, alpha: on, width: 2.5 },
        );
      }
      nameText(names[i], IX + 50 + NAME_GAP, y, {
        align: "left",
        alpha: stageC * listIn(t, ats, i),
        set: "blockers",
      });
      link(IX + 50 + NAME_GAP + measure(names[i]) + 14, y, GX - 36, Y, {
        route: "hvh",
        mid: GX - 90,
        alpha: on,
        upto: soon(t, at + 0.1, 0.5),
      });
    });
    const open = soon(t, freshAt + 0.4, 0.7),
      DX = 1340,
      ro = stageC * ramp(t, readOnly - 0.15, 0.4),
      fr = stageC * ramp(t, freshAt - 0.15, 0.4);
    writeGate(GX, Y, 280, { alpha: stageC, open, single: true });
    nameText(L("写入前的检查", "A check just before writing"), GX, Y - 140 - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: stageC,
    });
    documentIcon(DX - 80, Y - 104, 160, 208, { alpha: stageC, rows: 2 });
    nameText(L("要写的文件", "The files to change"), DX, Y - 104 - NAME_GAP, {
      valign: "bottom",
      alpha: stageC,
    });
    lock(DX + 80, Y + 90, { alpha: ro, closed: 1 - open, size: 1.3 });
    nameText(L("只能看，不能写", "Read, not written"), DX, Y + 104 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, readOnly),
    });
    nameText(L("重新检查才放行", "Until a fresh check clears it"), GX, Y + 140 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: fr,
      width: 320,
    });
  }
  // An old pass is refused beside a check made now; below, only the writes to those files wait, and the other lane keeps
  // running.
  if (stageD > 0) {
    const move = soon(t, nowAt + 0.05, 0.5),
      k = mix(2.15, 1, move),
      AX = mix(1020, 560, move),
      Y = mix(470, 340, move),
      BX = 1360,
      q = (voiceTime(t) * 0.4) % 1,
      now = stageD * ramp(t, nowAt - 0.15, 0.4);
    clock(AX - 110 * k, Y, 36 * k, { alpha: stageD, color: P.muted, hand: 0.1 });
    seal(AX, Y, 40 * k, { alpha: stageD, color: P.muted });
    cross(AX + 66 * k, Y, 26, { alpha: stageD * ramp(t, nowAt + 0.2, 0.4), width: 3 });
    nameText(L("几分钟前通过的", "Passed minutes ago"), AX - 30 * k, Y + 40 * k + NAME_GAP, {
      valign: "top",
      color: P.muted,
      alpha: stageD,
    });
    clock(BX - 110, 340, 36, { alpha: now, color: P.evidence, hand: 0.9 });
    seal(BX, 340, 40, { alpha: now, color: P.evidence });
    nameText(L("现在再查一次", "Checked now"), BX - 30, 340 + 40 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageD * named(t, nowAt),
    });
    link(AX + 110, 340, BX - 160, 340, {
      alpha: now * move,
      upto: soon(t, nowAt, 0.6),
      dash: [8, 9],
    });
    const w = stageD * ramp(t, onlyAt - 0.15, 0.4),
      u = stageD * ramp(t, unrelated - 0.15, 0.4),
      Y1 = 560,
      Y2 = 680;
    laneTrack(300, 1000, Y1, { alpha: w, flow: null });
    writeGate(1040, Y1, 90, { alpha: w });
    dot(960, Y1, 9, { color: P.authority, alpha: w });
    nameText(L("只有写这几个文件要等", "Only writes to those files wait"), 1100, Y1, {
      align: "left",
      alpha: stageD * named(t, onlyAt),
    });
    laneTrack(300, 1000, Y2, { alpha: u, flow: q });
    nameText(L("无关的工作照常进行", "Unrelated work carries on"), 1100, Y2, {
      align: "left",
      alpha: stageD * named(t, unrelated),
    });
  }
  // The limit: the mechanism, a lane and its gate inside a dashed boundary whose right edge is the limit. The boundary
  // grows to hold the participants who keep the agreement. It is not an operating system's wall, and a program under
  // the same account that ignores the agreement walks through that edge.
  if (stageE > 0) {
    const grow = soon(t, willing - 0.5, 0.5),
      CX = mix(960, 720, soon(t, notOs - 0.3, 0.5)),
      W = mix(460, 780, grow),
      H = mix(160, 300, grow),
      top = mix(420, 340, grow),
      left = CX - W / 2,
      right = CX + W / 2;
    const q = (voiceTime(t) * 0.35) % 1,
      MY = top + 72,
      PY = top + 192,
      on = stageE * ramp(t, willing - 0.15, 0.4),
      bad = stageE * ramp(t, cannot - 0.15, 0.4),
      OX = 1440;
    box(left, top, W, H, {
      stroke: P.muted,
      alpha: stageE,
      radius: 18,
      dash: [10, 10],
      width: 2.5,
    });
    line(right, top + 18, right, top + H - 18, { color: P.unknown, alpha: stageE, width: 3 });
    nameText(L("这套机制", "Lanes and checks"), left, top - NAME_GAP + 4, {
      align: "left",
      valign: "bottom",
      alpha: stageE * named(t, mechanism),
    });
    nameText(L("一个局限", "One limit"), right, top - NAME_GAP + 4, {
      align: "right",
      valign: "bottom",
      color: P.unknown,
      alpha: stageE,
    });
    laneTrack(CX - 190, CX + 130, MY, { alpha: stageE, flow: q });
    writeGate(CX + 168, MY, 90, { alpha: stageE, single: true });
    person(CX - 280, PY, { alpha: on, size: 1.2, color: P.ink });
    agent(CX - 95, PY + 2, { alpha: on, size: 1.2 });
    person(CX + 95, PY, { alpha: on, size: 1.2, color: P.ink });
    agent(CX + 280, PY + 2, { alpha: on, size: 1.2 });
    nameText(L("愿意遵守约定的参与者", "Participants keeping the protocol"), CX, PY + 46, {
      valign: "top",
      alpha: stageE * named(t, willing),
    });
    rejectedName(L("操作系统那种隔离", "Operating-system isolation"), OX, 330, {
      alpha: stageE * named(t, notOs),
      mark: ramp(t, notOs + 0.3, 0.4),
      width: 340,
    });
    agent(
      mix(OX + 80, 1040, soon(t, cannot + 0.2, 1.6)),
      mix(480, 440, soon(t, cannot + 1.2, 0.6)),
      { alpha: bad, size: 1.5, color: P.unknown },
    );
    nameText(L("不守约定的程序拦不住", "An uncooperative program walks through"), OX, 550, {
      valign: "top",
      width: 400,
      color: P.unknown,
      alpha: stageE * named(t, cannot),
    });
  }
};
