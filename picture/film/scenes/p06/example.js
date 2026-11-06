/* Part 06 opening (06.1-06.2), back in the made-up example. A second Agent remembers the branch at yesterday's commit
 * and its dashboard is all green; between compiling a plan and writing, someone else may have changed things. At the
 * write, ETHOS checks again: the branch has moved on, so nothing is written and the plan is compiled again from fresh
 * facts. Checking and writing are one step and the result is read back; a version pushed to several platforms has each
 * platform's outcome recorded as it is, never one joint state. */

import { ctx } from "../../canvas.js";
import { pipelineMark } from "../../drawing/examples.js";
import { commitRow } from "../../drawing/history.js";
import { link } from "../../drawing/links.js";
import { writeGate } from "../../drawing/lanes.js";
import { dot, measure, ring, stroke } from "../../drawing/strokes.js";
import { documentIcon, stopSign } from "../../drawing/symbols.js";
import { commitDot, ledger, tagIcon } from "../../drawing/workspace.js";
import { beats, listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, rejectedName, termRow } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cueFrom } from "../../timing/cues.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { agents, card, linkSet } from "../p04/marks.js";
import { planeState } from "../p05/planes.js";

/* The example's places: the Agent at the left, its plan, the write gate and the repository's branch to the right. The
 * names under the row hang from one line under its tallest mark, the gate, which stands 75 px either side of the row. */
const AX = 440,
  Y = 530,
  PLAN_X = 860,
  GATE_X = 1080,
  BRANCH_X = 1200,
  STEP = 100,
  HEAD = BRANCH_X + 3 * STEP,
  NEW = HEAD + STEP,
  ROW_NAMES = rowNameTop([Y + 60, Y + 75, Y + 22]),
  // A commit's disc and rim reach this far either side of its point.
  COMMIT = 10.5;
/* Once the context settles at the top, the example stands this much lower, so its picture, from the context to the
 * dashboard under the row, is balanced on the content centre. */
const DROP = 60;
const flowOf = (t) => (voiceTime(t) * 0.4) % 1;
const agentName = () => L("另一个 Agent", "A second Agent"),
  movedName = () => L("往前走了", "Moved on");

/* The example stands centred on what it shows, as one group. Its left edge is the second Agent's name; its right edge
 * is the branch while the Agent's view builds, then the branch's real head and what is said of it once someone else
 * may have changed things, through the check at the write, which ends on the ring at that head and its name. The group
 * glides to its second place from just after "may have changed things". */
function exampleShift(t, c) {
  const left = AX - 22 - NAME_GAP - measure(agentName()),
    building = 960 - (left + HEAD + COMMIT) / 2,
    checked = 960 - (left + NEW + Math.max(18 + 1.25, measure(movedName()) / 2)) / 2;
  return mix(building, checked, soon(t, c.changed + 0.05, 0.8));
}

/* The example's context, the pipeline of part 04: centred by itself while it is the whole picture, at `alone` in the
 * example's frame; large at the right once the second Agent is introduced, gliding there on the Agent's words; then
 * small at the top as the Agent's view builds, named as the example. */
function exampleContext(t, c, g, { settle = 1, alone = 1110 } = {}) {
  const x = mix(mix(alone, 1110, soon(t, c.agent + 0.05, 0.8)), 1000, settle),
    m = pipelineMark(x, mix(Y, 222, settle), mix(700, 400, settle), {
      alpha: g,
      flow: flowOf(t),
    });
  // The name stands above the large pipeline and slides to its left as it settles at the top.
  const name = L("例子", "The example"),
    w = measure(name);
  nameText(
    name,
    mix(m.runX, m.feedX - 34 - w / 2, settle),
    mix(m.top - NAME_GAP - 15, 222, settle),
    {
      alpha: g * named(t, c.example),
    },
  );
}
/* The Agent with its name at its left, arriving on its words. */
function secondAgent(t, c, g) {
  const a = g * ramp(t, c.agent - 0.25, 0.3);
  agents([[AX, Y]], { alpha: a });
  nameText(agentName(), AX - 22 - NAME_GAP, Y, {
    align: "right",
    alpha: a,
  });
  return a;
}
/* The branch as the repository holds it: four commits, and a fifth once someone else has written. Its name hangs from
 * `nameTop`, the row's line by default. */
function branch(t, g, { moved = 0, nameAlpha = g, nameTop = ROW_NAMES } = {}) {
  commitRow(BRANCH_X, STEP, Y, 4, { alpha: g, single: true });
  nameText(L("分支", "The branch"), BRANCH_X + 1.5 * STEP, nameTop, {
    valign: "top",
    alpha: nameAlpha,
  });
  if (moved <= 0.01) return;
  stroke(
    () => {
      ctx.moveTo(HEAD + 9, Y);
      ctx.lineTo(mix(HEAD + 9, NEW - 9, clamp(moved * 1.6)), Y);
    },
    { color: P.ink, alpha: g, width: 2.5 },
  );
  commitDot(NEW, Y, { alpha: g * ramp(moved, 0.5, 0.4) });
}
/* The plan: a document at its place between the Agent and the gate. */
const plan = (a) => documentIcon(PLAN_X - 48, Y - 60, 96, 120, { alpha: a, rows: 3 });

/* 06.1 The second Agent's view: what it remembers, the branch at yesterday's commit, above it, and its dashboard, all
 * green, below it. To its right its plan, the write gate and the branch as it is, which moves on by one commit when
 * someone else may have changed things. The branch arrives before the plan and the gate, so its name hangs one gap
 * under its commits until the plan's words bring the row's taller members, and then joins the row's line. */
export function staleStage(s, t, c, g) {
  const shift = exampleShift(t, c),
    settle = soon(t, c.remembers + 0.05, 0.8);
  ctx.save();
  ctx.translate(shift, DROP * settle);
  exampleContext(t, c, g, { settle, alone: 960 - shift });
  secondAgent(t, c, g);
  // What it remembers: the branch standing at yesterday's commit.
  const mem = g * named(t, c.yesterday);
  const MY = Y - 118;
  card(560, MY - 32, 210, 64, { alpha: mem });
  commitRow(596, 70, MY, 3, { alpha: mem, single: true });
  ring(736, MY, 17, { color: P.ink, alpha: mem, width: 2.5 });
  nameText(L("昨天那次提交", "Yesterday's commit"), 665, MY - 32 - NAME_GAP + 6, {
    valign: "bottom",
    alpha: mem,
  });
  link(AX, Y - 22, 560, MY, { route: "vh", alpha: mem });
  // Its dashboard: three checks, all green.
  const board = g * named(t, c.dashboard);
  const DY = Y + 122;
  card(560, DY - 36, 210, 72, { alpha: board });
  stroke(
    () => {
      for (let k = 0; k < 3; k++) {
        const x = 610 + k * 55;
        ctx.moveTo(x - 12, DY);
        ctx.lineTo(x - 3, DY + 10);
        ctx.lineTo(x + 14, DY - 10);
      }
    },
    { color: P.ink, alpha: board, width: 3.5 },
  );
  // The Agent's tie to its dashboard joins on "all green", once the board and its name stand, so the link never
  // waits beside the board for a name of its own.
  link(AX, Y + 22, 560, DY, { route: "vh", alpha: g * named(t, c.green) });
  termRow(
    t,
    L(["看板"], ["Its dashboard"]),
    [c.dashboard],
    L(["一片绿灯"], ["all green"]),
    [c.green],
    665,
    DY + 36 + NAME_GAP,
    { alpha: g, align: "center" },
  );
  // The plan, the write and the branch as it is, which someone else may have moved on.
  const planned = g * named(t, c.plan),
    write = g * named(t, c.write),
    real = g * named(t, c.branch),
    changed = g * named(t, c.changed);
  plan(planned);
  nameText(L("编好计划", "A plan"), PLAN_X, ROW_NAMES, { valign: "top", alpha: planned });
  writeGate(GATE_X, Y, 150, { alpha: write, color: P.ink, single: true });
  nameText(L("写入", "Writing"), GATE_X, ROW_NAMES, { valign: "top", alpha: write });
  link(PLAN_X + 48, Y, GATE_X - 30, Y, { alpha: write });
  link(GATE_X + 30, Y, BRANCH_X - 9, Y, { alpha: real });
  branch(t, real, {
    moved: soon(t, c.changed + 0.05, 0.8),
    nameTop: mix(Y + COMMIT + NAME_GAP, ROW_NAMES, soon(t, c.plan + 0.05, 0.6)),
  });
  nameText(L("别人可能已经改过了", "May have changed"), NEW + 20, Y - 22 - NAME_GAP, {
    align: "right",
    valign: "bottom",
    alpha: changed,
  });
  ctx.restore();
}

/* 06.1 The moment of writing: the write is carried to the gate, ETHOS checks the branch again and finds it moved on,
 * so the gate stays shut and nothing is written; fresh facts run back over the gate to the plan, which is compiled
 * again. What ETHOS does is named over the middle of its dashed look, and "moved on" under the ring it names. */
export function checkStage(s, t, c, g) {
  ctx.save();
  ctx.translate(exampleShift(t, c), DROP);
  exampleContext(t, c, g);
  secondAgent(t, c, g);
  plan(g);
  beats(t, PLAN_X, Y, 70, [c.expected, c.again], { alpha: g });
  // The plan's name gives way to "compiled again" on those words, the one leaving before the other arrives.
  nameText(L("编好计划", "A plan"), PLAN_X, ROW_NAMES, {
    valign: "top",
    alpha: g * (1 - ramp(t, c.again - 0.4, 0.25)),
  });
  nameText(L("重新编译", "Compiled again"), PLAN_X, ROW_NAMES, {
    valign: "top",
    alpha: g * named(t, c.again),
  });
  writeGate(GATE_X, Y, 150, { alpha: g, color: P.ink, single: true });
  nameText(L("写入", "Writing"), GATE_X, ROW_NAMES, { valign: "top", alpha: g });
  link(AX + 22, Y, PLAN_X - 48, Y, { alpha: g });
  link(PLAN_X + 48, Y, GATE_X - 30, Y, { alpha: g });
  link(GATE_X + 30, Y, BRANCH_X - 9, Y, { alpha: g });
  // The write is carried to the gate, which takes it in.
  const p = clamp((t - c.first1b - 0.1) / 0.5);
  if (p > 0 && p < 1) dot(mix(PLAN_X + 48, GATE_X - 36, p), Y, 9, { color: P.ink, alpha: g });
  branch(t, g, { moved: 1 });
  // ETHOS checks again: a dashed look from the gate along the branch to where the plan expected its head.
  const look = g * named(t, c.checks);
  link(GATE_X, Y - 75, HEAD, Y - 22, {
    route: "hv",
    alpha: look,
    dash: [8, 9],
    upto: soon(t, c.checks + 0.05, 0.6),
  });
  nameText(L("ETHOS 又核对了一遍", "ETHOS checks again"), (GATE_X + HEAD) / 2, Y - 75 - NAME_GAP, {
    valign: "bottom",
    alpha: look,
  });
  // The branch has moved on: the ring on the expected head moves to the real one as the clause begins, and reaches it
  // as the words that name the move are said, with its name.
  const moving = soon(t, c.movedOn + 0.05, 0.6);
  ring(mix(HEAD, NEW, moving), Y, 18, { color: P.ink, alpha: look, width: 2.5 });
  nameText(movedName(), NEW, ROW_NAMES, {
    valign: "top",
    alpha: g * named(t, cueFrom(s, "往前走了", "moved on", c.movedOn)),
  });
  // Nothing is written: a stop at the gate.
  const stop = g * named(t, c.nothing);
  stopSign(GATE_X, Y - 6, 22, { color: P.ink, alpha: stop });
  nameText(L("什么都不写", "Nothing is written"), GATE_X, ROW_NAMES + 46, {
    valign: "top",
    alpha: stop,
  });
  // Fresh facts run from the branch's real head back over the gate to the plan.
  const fresh = g * named(t, c.fresh);
  link(NEW, Y - 22, PLAN_X, Y - 60, {
    route: "vhv",
    mid: 340,
    alpha: fresh,
    upto: soon(t, c.fresh + 0.05, 0.8),
    flow: flowOf(t),
  });
  nameText(L("刚观察到的事实", "Fresh facts"), (PLAN_X + NEW) / 2, 340 - NAME_GAP + 6, {
    valign: "bottom",
    alpha: fresh,
  });
  ctx.restore();
}

/* The gate and the branch of 06.2, set further left so a written commit has room: checking and writing are one step,
 * the written commit is read back to confirm what happened. */
const GX = 700,
  BX = 860,
  BSTEP = 110;
/* 06.2 One step, then read back: the check and the write stand in one outline; the gate lifts, a commit is written at
 * the branch's head and its result runs back to a check. The outline's name centres on it from its first word, and
 * the branch's name shares its line under the outline, the row's tallest mark. The step and the branch stand centred
 * together, and glide left by half the written commit's reach as the gate lifts for it, so they stay centred. */
export function oneStepStage(s, t, c, g) {
  const names = rowNameTop([Y + 100, Y + 22]),
    step = L(["核对和写入"], ["Checking and writing"]),
    end = BX + 5 * BSTEP,
    left = Math.min(GX - 70 - 1.25, GX - measure(step[0]) / 2),
    // The written commit is ringed: its ring reaches 18 px and half its stroke from its point.
    unwritten = 960 - (left + BX + 4 * BSTEP + COMMIT) / 2,
    written = 960 - (left + end + 18 + 1.25) / 2;
  ctx.save();
  ctx.translate(mix(unwritten, written, soon(t, c.afterwards + 0.05, 0.6)), 0);
  card(GX - 70, Y - 100, 140, 200, { alpha: g, color: P.ink });
  writeGate(GX, Y, 150, {
    alpha: g,
    color: P.ink,
    single: true,
    open: soon(t, c.afterwards + 0.05, 0.6),
  });
  termRow(t, step, [c.first2], L(["一步完成"], ["as one step"]), [c.oneStep], GX, names, {
    alpha: g,
    align: "center",
  });
  commitRow(BX, BSTEP, Y, 5, { alpha: g, single: true });
  link(GX + 70, Y, BX - 9, Y, { alpha: g });
  nameText(L("分支", "The branch"), BX + 2 * BSTEP, names, { valign: "top", alpha: g });
  // The write lands as a new commit; its result is read back to a check above the step.
  const wrote = soon(t, c.afterwards + 0.3, 0.6);
  stroke(
    () => {
      ctx.moveTo(BX + 4 * BSTEP + 9, Y);
      ctx.lineTo(mix(BX + 4 * BSTEP + 9, end - 9, wrote), Y);
    },
    { color: P.ink, alpha: g * ramp(wrote, 0, 0.1), width: 2.5 },
  );
  commitDot(end, Y, { alpha: g * ramp(wrote, 0.6, 0.4), picked: g * ramp(wrote, 0.6, 0.4) });
  const back = g * named(t, c.readBack);
  link(end, Y - 30, GX, Y - 100, {
    route: "vhv",
    mid: 330,
    alpha: back,
    upto: soon(t, c.readBack + 0.05, 0.8),
    flow: flowOf(t),
  });
  planeState("pass", GX, 330, back * ramp(t, c.confirm - 0.15, 0.4));
  nameText(L("读回来确认", "Read back to confirm"), (GX + end) / 2, 330 - NAME_GAP, {
    valign: "bottom",
    alpha: back,
  });
  ctx.restore();
}

/* 06.2 Several platforms, each recorded as it is: a version is pushed to three platforms, which succeed, fail or are
 * still pending, each named on its words; all three are recorded, and one joint outcome is refused under the
 * platforms. The names at the two ends of the fan share one line under the deeper end, the record; until the record
 * arrives, the version's name hangs one gap under its tag. The version and the platforms stand centred together, and
 * glide left as the record joins them, so the fan stands centred whole. */
export function platformsStage(s, t, c, g) {
  // The platforms centre on the middle of the fan, between the version and the record.
  const VX = 540,
    LX = 1420,
    PW = 330,
    PX = (VX + LX) / 2 - PW / 2,
    // The three platforms fan out about the example's axis, the middle one on it, so its links run straight.
    ys = [Y - 130, Y, Y + 130],
    states = ["pass", "block", "none"],
    names = L(["成功", "失败", "还没推"], ["Succeeded", "Failed", "Still pending"]),
    ats = [c.succeeded, c.failed, c.pending],
    ends = rowNameTop([Y + 26, Y + 65]),
    versionName = L("一个版本", "A version"),
    recordName = L("照实记下", "All recorded"),
    left = Math.min(VX - 60 - 1.25, VX - measure(versionName) / 2),
    fanned = 960 - (left + PX + PW + 1.25) / 2,
    whole = 960 - (left + Math.max(LX + 50 + 1.25, LX + measure(recordName) / 2)) / 2,
    joined = soon(t, c.recorded + 0.05, 0.8);
  ctx.save();
  ctx.translate(mix(fanned, whole, joined), 0);
  const version = g * named(t, c.version);
  tagIcon(VX - 60, Y, 120, 52, { alpha: version, color: P.ink });
  nameText(versionName, VX, mix(Y + 26 + NAME_GAP, ends, joined), {
    valign: "top",
    alpha: version,
  });
  // The platforms arrive together, one mark of cards and links named "several platforms"; each one's outcome then
  // stands in its card on its own words.
  const several = g * named(t, c.several);
  nameText(L("几个平台", "Several platforms"), PX + PW / 2, ys[0] - 30 - NAME_GAP, {
    valign: "bottom",
    alpha: several,
  });
  linkSet(
    ys.map((y) => [VX + 60, Y, PX, y, "hvh"]),
    { alpha: several, upto: soon(t, c.several + 0.05, 0.5) },
  );
  stroke(() => ys.forEach((y) => ctx.roundRect(PX, y - 30, PW, 60, 12)), {
    color: P.line,
    alpha: several,
    width: 2.5,
  });
  ats.forEach((at, i) => {
    const on = g * ramp(t, at - 0.15, 0.4);
    if (states[i] === "block") stopSign(PX + PW - 36, ys[i], 15, { color: P.ink, alpha: on });
    else planeState(states[i], PX + PW - 36, ys[i], on);
    nameText(names[i], PX + 24, ys[i], {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "platforms",
    });
  });
  // All recorded as they are: each platform's outcome runs into the record.
  const kept = g * named(t, c.recorded);
  linkSet(
    ys.map((y) => [PX + PW, y, LX - 56, Y, "hvh"]),
    { alpha: kept, upto: soon(t, c.recorded + 0.05, 0.6), flow: flowOf(t) },
  );
  ledger(LX, Y, 100, 130, { alpha: kept });
  nameText(recordName, LX, ends, { valign: "top", alpha: kept });
  rejectedName(
    L("同时成功、同时失败", "All succeed or fail together"),
    PX + PW / 2,
    ys[2] + 30 + 70,
    {
      alpha: g * named(t, c.together),
      mark: ramp(t, c.together + 0.35, 0.35),
    },
  );
  ctx.restore();
}
