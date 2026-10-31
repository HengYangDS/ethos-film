/* 06 lanes and leases. */

import { blend } from "../../drawing/colour.js";
import { laneGroup, laneTrack } from "../../drawing/lanes.js";
import { link } from "../../drawing/links.js";
import { box, dot, labelSize, line, measure, ring, text } from "../../drawing/strokes.js";
import { agent, check, clock, cross, documentIcon, person } from "../../drawing/symbols.js";
import { commitDot, folderIcon, repoIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, termRow } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["06"] = function (s, t) {
  const [changeAt, carried, several, agentsAt, who, tryAt, hand] = cues(s, [
    ["一项正式变更", "A Change"],
    ["常常有", "several people"],
    ["好几个人", "several people"],
    ["Agent", "agents"],
    ["谁负责哪一块", "who owns which part"],
    ["哪些还只是尝试", "what is still an experiment"],
    ["工作怎么交接", "how the work is handed over"],
  ]);
  const [lanes, worktree, reviewAt, combine] = cues(s, [
    ["ETHOS 的办法", "ETHOS organizes"],
    ["Git 工作区", "Git worktree"],
    ["审阅", "review the changes"],
    ["集成", "combine them"],
  ]);
  const [lease, leaseWord, leaseName, fourAt, laneF, holder, expiry, gen, fresh] = cues(s, [
    ["一条通道此刻归谁", "Who holds a lane"],
    ["一份会到期的租约", "an expiring Lease"],
    ["Lease", "Lease"],
    ["只记四样", "only four things"],
    ["哪条通道", "the lane"],
    ["谁持有", "its holder"],
    ["什么时候到期", "its expiry time"],
    ["一个编号", "a generation number"],
    ["别的情况", "Everything else"],
  ]);
  const [mode, coop, compete, none] = cues(s, [
    ["几条通道可以合作", "Lanes can cooperate"],
    ["合作", "cooperate"],
    ["也可以竞争", "they can compete"],
    ["一个都不选", "or none"],
  ]);
  const [neg, negative, evid, deleted] = cues(s, [
    ["就算一次探索", "Even when"],
    ["只留下", "ends with only"],
    ["有用的证据", "the useful evidence"],
    ["跟着通道", "deleted"],
  ]);
  const stageA = stageOut(t, lanes),
    stageB = stageIn(t, lanes) * stageOut(t, lease),
    stageC0 = stageIn(t, lease) * stageOut(t, laneF),
    stageC = stageIn(t, laneF) * stageOut(t, mode),
    stageD = stageIn(t, mode) * stageOut(t, neg),
    stageE = stageIn(t, neg);
  // A Change, then the people and the agents carrying it around it, each on its words, and the three things they all
  // need to know.
  if (stageA > 0) {
    const lead = 240 * (1 - soon(t, who - 0.4, 0.7)),
      g = stageA * clearOfTitle(s, t, 300),
      CX = 620 + lead,
      CY = 490;
    folderIcon(CX - 120, CY - 90, 240, 170, { alpha: g, color: P.authority });
    nameText(L("正式变更", "A Change"), CX, CY + 2, {
      color: P.authority,
      alpha: g * named(t, changeAt),
      bold: true,
    });
    [
      [-250, -110],
      [-280, 110],
      [250, -130],
      [262, 100],
    ].forEach(([dx, dy], i) => {
      const x = CX + dx,
        y = CY + dy,
        on = g * ramp(t, (i % 2 ? agentsAt : carried) - 0.15, 0.4);
      if (i % 2) agent(x, y, { alpha: on, size: 1.1 });
      else person(x, y, { alpha: on, size: 1.1 });
      link(x + (dx > 0 ? -34 : 34), y, CX + (dx > 0 ? 120 : -120), y > CY ? CY + 40 : CY - 30, {
        route: "hv",
        alpha: on,
        end: false,
      });
    });
    nameText(L("好几个人和 Agent", "Several people and agents"), CX, CY + 200, {
      valign: "top",
      alpha: g * named(t, several),
    });
    const IX = 1130 + lead,
      ats = [who, tryAt, hand],
      ys = [360, 490, 620],
      names = en
        ? ["Who owns which part", "What is still an experiment", "How the work is handed over"]
        : ["谁负责哪一块", "哪些还只是尝试", "工作怎么交接"];
    ats.forEach((at, i) => {
      const on = g * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, P.unknown, speaking(t, ats, i));
      ring(IX, ys[i], 32, { color: c, alpha: on, width: 2.5 });
      text("?", IX, ys[i] + 1, 30, { role: "mark", align: "center", color: c, alpha: on });
      nameText(names[i], IX + 32 + NAME_GAP, ys[i], {
        align: "left",
        alpha: g * listIn(t, ats, i),
        set: "questions",
      });
    });
  }
  // Three lanes run side by side, each with its own worktree folder and its own point of work; they meet at a review,
  // and only then combine.
  if (stageB > 0) {
    const X0 = 240,
      X1 = mix(1680, 1120, soon(t, reviewAt - 0.45, 0.6)),
      ys = [370, 500, 630],
      RX = 1270,
      MX = 1600,
      q = voiceTime(t) * 0.4;
    laneGroup(X0, X1, ys, { alpha: stageB, q, tones: [P.evidence, P.authority, P.evidence] });
    termRow(
      t,
      [L("工作通道", "Work Lanes")],
      [lanes],
      [L("每条一份工作区", "Each with its own worktree")],
      [worktree],
      X0,
      ys[0] - 26 - NAME_GAP - labelSize(LABEL),
      { width: 1200, alpha: stageB, color: P.authority },
    );
    const rev = stageB * ramp(t, reviewAt - 0.15, 0.4),
      com = stageB * ramp(t, combine - 0.15, 0.4);
    ys.forEach((y) =>
      link(X1, y, RX - 40, 500, {
        route: "hvh",
        mid: X1 + 70,
        alpha: rev,
        upto: soon(t, reviewAt, 0.5),
      }),
    );
    ring(RX, 500, 40, { color: P.ink, alpha: rev, width: 2.5 });
    check(RX, 502, 34, { alpha: rev, color: P.evidence });
    nameText(L("审阅", "Review"), RX, 500 - 40 - NAME_GAP, {
      valign: "bottom",
      alpha: stageB * named(t, reviewAt),
      set: "after",
    });
    link(RX + 40, 500, MX - 30, 500, {
      alpha: com,
      upto: soon(t, combine, 0.5),
      width: 3,
      color: P.authority,
    });
    commitDot(MX, 500, { alpha: com, color: P.authority, r: 24 });
    nameText(L("集成", "Combine"), MX, 500 + 24 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageB * named(t, combine),
      set: "after",
    });
  }
  // One person holds one lane for now, under a Lease with a clock on it.
  if (stageC0 > 0) {
    const Y = 480,
      X0 = 400,
      X1 = 1520,
      HX = 960,
      q = (voiceTime(t) * 0.35) % 1;
    laneTrack(X0, X1, Y, { alpha: stageC0, flow: q });
    person(HX, Y - 56, { alpha: stageC0, size: 1.3, color: P.authority });
    nameText(L("此刻归谁", "Who holds it now"), HX, Y - 124, {
      valign: "bottom",
      color: P.authority,
      alpha: stageC0,
    });
    box(HX - 120, Y + 26, 240, 110, {
      fill: P.row,
      stroke: P.authority,
      alpha: stageC0 * named(t, leaseWord),
      radius: 12,
      width: 2.5,
    });
    clock(HX - 72, Y + 81, 26, {
      alpha: stageC0 * named(t, leaseWord),
      color: P.authority,
      hand: soon(t, leaseWord, 4) * 0.6,
    });
    nameText("Lease", HX + 26, Y + 81, {
      color: P.authority,
      alpha: stageC0 * named(t, leaseName),
      bold: true,
    });
    nameText(L("一条通道", "A lane"), X0, Y + 26 + NAME_GAP, {
      align: "left",
      valign: "top",
      alpha: stageC0,
    });
    nameText(L("会到期的租约", "An expiring Lease"), HX, Y + 136 + NAME_GAP, {
      valign: "top",
      alpha: stageC0 * named(t, leaseWord),
    });
    nameText(L("只记四样", "Only four things"), HX, Y + 136 + NAME_GAP + 44, {
      valign: "top",
      size: NOTE,
      color: P.muted,
      alpha: stageC0 * named(t, fourAt),
    });
  }
  // The Lease opens as a card that grows by a field at a time, and everything else is looked up afresh, so the card
  // never pretends to know the rest.
  if (stageC > 0) {
    const lead = 340 * (1 - soon(t, fresh - 0.5, 0.9)),
      CX = 620 + lead,
      TOP = 320,
      STEP = 80,
      ats = [laneF, holder, expiry, gen],
      names = en
        ? ["The lane", "Its holder", "Its expiry time", "A generation number"]
        : ["哪条通道", "谁持有", "什么时候到期", "第几次持有的编号"],
      W = 102 + Math.max(...names.map((v) => measure(v))) + 40;
    const left = CX - W / 2,
      grown = ats.reduce((v, at) => v + soon(t, at - 0.5, 0.4), 0),
      H = 26 + Math.max(1, grown) * STEP;
    box(left, TOP, W, H, { fill: P.row, stroke: P.authority, alpha: stageC, radius: 14, width: 3 });
    nameText("Lease", left, TOP - NAME_GAP, {
      align: "left",
      valign: "bottom",
      color: P.authority,
      alpha: stageC,
      bold: true,
    });
    nameText(L("只记四样", "Only four things"), left + W, TOP - NAME_GAP, {
      align: "right",
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC,
    });
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, P.evidence, speaking(t, ats, i)),
        x = left + 58,
        y = TOP + 53 + i * STEP;
      if (i === 0) folderIcon(x - 24, y - 18, 46, 36, { alpha: on, color: c });
      if (i === 1) person(x, y - 2, { alpha: on, size: 0.7, color: c });
      if (i === 2) clock(x, y, 18, { alpha: on, color: c, hand: 0.3 });
      if (i === 3) text("#", x, y + 1, 30, { role: "mark", align: "center", color: c, alpha: on });
      nameText(names[i], x + 44, y, {
        align: "left",
        alpha: stageC * listIn(t, ats, i),
        set: "fields",
      });
    });
    const on = stageC * ramp(t, fresh - 0.15, 0.4),
      RX = 1340,
      CY = TOP + 180,
      q = (voiceTime(t) * 0.5) % 1;
    link(CX + W / 2, CY, RX - 96, CY, {
      alpha: on,
      upto: soon(t, fresh, 0.5),
      flow: q,
    });
    ring(RX, CY, 96, { color: P.evidence, alpha: on, width: 3 });
    line(RX + 68, CY + 68, RX + 122, CY + 122, { color: P.evidence, alpha: on, width: 6 });
    [
      [-36, -26],
      [18, -38],
      [-14, 18],
      [34, 24],
    ].forEach(([dx, dy]) => dot(RX + dx, CY + dy, 8, { color: P.evidence, alpha: on }));
    nameText(L("别的情况每次重新查", "Observed afresh each time"), RX + 20, CY + 122 + NAME_GAP, {
      valign: "top",
      width: 380,
      alpha: on,
    });
  }
  // Lanes cooperate, their work combined; or they compete, and one result is chosen, or none.
  if (stageD > 0) {
    const shift = 400 * (1 - soon(t, compete - 0.6, 1)),
      LX = 330 + shift,
      LW = 460,
      RX = 1130 + shift,
      RW = 380,
      ys = [370, 520],
      q = voiceTime(t) * 0.4,
      co = stageD,
      cm = stageD * ramp(t, compete - 0.15, 0.4),
      noneOff = ramp(t, none - 0.15, 0.15),
      noneOn = ramp(t, none, 0.2);
    laneGroup(LX, LX + LW, ys, { alpha: co, q: q % 1 });
    ys.forEach((y) =>
      link(LX + LW, y, LX + LW + 90, 445, {
        route: "hvh",
        mid: LX + LW + 40,
        alpha: co,
        upto: soon(t, coop + 0.2, 0.5),
      }),
    );
    commitDot(LX + LW + 112, 445, { alpha: co, color: P.authority, r: 22 });
    nameText(L("合作：合到一起", "Cooperate: combined"), LX + LW / 2 + 50, 590, {
      valign: "top",
      alpha: stageD * named(t, Math.min(coop, mode + 0.3)),
      color: P.authority,
    });
    const pick = ys[0];
    laneGroup(RX, RX + RW, ys, { alpha: cm, q: (q + 0.5) % 1, size: 0.82 });
    ys.forEach((y, i) => {
      ring(RX + RW + 40, y, 24, {
        color: i ? P.muted : blend(P.evidence, P.muted, noneOn),
        alpha: cm,
        width: 2.5,
      });
      if (!i) check(RX + RW + 40, y + 2, 22, { color: P.evidence, alpha: cm * (1 - noneOff) });
    });
    cross(RX + RW + 40, ys[1], 18, { alpha: cm, width: 3 });
    if (noneOn > 0) cross(RX + RW + 40, pick, 18, { alpha: cm * noneOn, width: 3 });
    nameText(
      L("竞争：选一个，或一个都不选", "Compete: one chosen, or none"),
      RX + RW / 2 + 40,
      590,
      { valign: "top", alpha: stageD * named(t, compete) },
    );
  }
  // An exploration ends with a negative result. The useful evidence moves into the repository, and the lane is deleted
  // on its words without it, so what is kept takes the centre.
  if (stageE > 0) {
    const Y = 470,
      X0 = 360,
      X1 = 1080,
      off = ramp(t, deleted, 0.2),
      gone = soon(t, deleted + 0.2, 0.9),
      RX = mix(1420, 960, gone),
      on = stageE * (1 - off),
      end = on * ramp(t, negative - 0.15, 0.4);
    laneTrack(X0, X1, Y, { alpha: on, flow: (voiceTime(t) * 0.4) % 1 });
    cross(X1 + 44, Y, 30, { alpha: end, width: 3.5 });
    nameText(L("否定的结论", "A negative result"), X1 + 44, Y - 28 - NAME_GAP, {
      valign: "bottom",
      alpha: on * named(t, negative),
    });
    nameText(L("一次探索", "An exploration"), X0, Y + 26 + NAME_GAP, {
      align: "left",
      valign: "top",
      alpha: on,
    });
    const kept = stageE * ramp(t, evid - 0.15, 0.4),
      q = soon(t, evid, 0.9);
    repoIcon(RX, Y, 230, 170, { alpha: kept });
    documentIcon(mix(X1 - 40, RX - 28, q), Y - 22, 56, 72, {
      alpha: kept,
      rows: 3,
      stroke: P.evidence,
    });
    nameText(L("有用的证据保留", "Useful evidence stays"), RX, Y + 85 + NAME_GAP, {
      valign: "top",
      color: P.evidence,
      alpha: stageE * named(t, evid),
    });
  }
};
