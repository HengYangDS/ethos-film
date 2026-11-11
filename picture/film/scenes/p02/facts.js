/* 02.5 Changes are made before the facts are checked: an Agent writes from an outdated memory over another's work, a
 * version lands on one platform and not the other, and neither a retry nor an error message settles what happened. */

import { centring } from "../p03/kernel.js";
import { ctx } from "../../canvas.js";
import { flowClock, link, linkPoints } from "../../drawing/links.js";
import {
  box,
  dot,
  drawnShare,
  fill,
  labelSize,
  lengthOf,
  line,
  measure,
  ring,
  stroke,
  text,
} from "../../drawing/strokes.js";
import { check, cross, stopSign } from "../../drawing/symbols.js";
import { commitRow } from "../../drawing/history.js";
import { commitDot, tagIcon } from "../../drawing/workspace.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, TERM_GAP, nameText, termRow } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { ease, mix, ramp } from "../../timing/easing.js";
import { drawShare, glideShare, glideSteps } from "../../timing/pauses.js";

/* Two Agents drawn as one mark: their outlines one stroke and their cores one fill, so one name names the pair. */
function agentPair(xs, y, { alpha = 1, size = 1 } = {}) {
  const r = 22 * size,
    c = 4.5 * size;
  stroke(
    () =>
      xs.forEach((x) => {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
      }),
    { color: P.ink, alpha, width: 2.5 },
  );
  fill(
    () =>
      xs.forEach((x) => {
        ctx.moveTo(x + c, y);
        ctx.arc(x, y, c, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha },
  );
}
/* An unknown: the film's unknown outcome, a question mark in a ring, drawn at the size of the stop sign it stands
 * beside, so the markers of one list are of one family. */
const UNKNOWN_R = 20;
function unknownMark(x, y, alpha) {
  if (alpha < 0.01) return;
  ring(x, y, UNKNOWN_R, { color: P.ink, alpha, width: 3 });
  text("?", x, y + 1, UNKNOWN_R * 1.25, { role: "mark", align: "center", alpha });
}
/* Where a stage built part by part stands: centred on what stands, travelling one way only. Each part is [the word that
 * brings it, its left, its right]; the first stands from the cut, and each later part that widens what stands glides
 * the stage as one, from just after its words, toward the place that centres the new extent, but never past the
 * stage's finished place and never back: where parts arrive on alternate sides, the stage stops at its finished place
 * and the later parts fill it, so no glide reverses the one before it. Returns the stage's shift. */
function standing(t, parts) {
  const [[, x0, x1], ...rest] = parts;
  let left = x0,
    right = x1;
  const states = [];
  for (const [at, l, r] of rest.sort((p, q) => p[0] - q[0])) {
    if (l >= left && r <= right) continue;
    left = Math.min(left, l);
    right = Math.max(right, r);
    states.push([at, centring(left, right)]);
  }
  const first = centring(x0, x1),
    last = states.at(-1)?.[1] ?? first,
    way = Math.sign(last - first),
    steps = [];
  let shift = first;
  for (const [at, v] of states) {
    const next = way < 0 ? Math.max(last, Math.min(shift, v)) : Math.min(last, Math.max(shift, v));
    if (next !== shift) steps.push([at, next]);
    shift = next;
  }
  return glideSteps(t, first, steps);
}
/* Where a stage built part by part stands once finished: centred on all its parts. A stage seated there from its cut
 * lets each part arrive in its own place, so nothing travels while the next part is named. Each part is [the word that
 * brings it, its left, its right]. */
const finished = (parts) =>
  centring(Math.min(...parts.map((v) => v[1])), Math.max(...parts.map((v) => v[2])));

/* 02.5 Two Agents work on the same branch. One keeps a memory of the branch as it was, three commits; it writes from
 * that memory, its link drawn to the place after them, and its commit lands there; the other's commit, the newest on
 * the branch, named as the other one's work on its words, drops off it, struck through, as "overwritten" joins under
 * that name. */
export function stageBranch(t, a, c) {
  if (a <= 0) return;
  const xs = [760, 920, 1080, 1240],
    Y = 640,
    AX = 920,
    BX = 1240,
    AY = 460,
    R = 31;
  agentPair([AX, BX], AY, { alpha: a, size: 1.4 });
  nameText(L("两个 Agent", "Two Agents"), (AX + BX) / 2, AY + R + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.bCut),
  });
  // The branch, on its words: one line and its commits as one mark; the newest, under the other Agent, is its work.
  const over = glideShare(t, c.overwritten + 0.05, 96, 0.6),
    branch = a * ramp(t, c.branch - 0.15, 0.4);
  line(xs[2], Y, xs[3], Y, { color: P.ink, alpha: branch, width: 2.5 });
  commitRow(xs[0], xs[1] - xs[0], Y, 3, { alpha: branch, single: true });
  nameText(L("一条分支", "The same branch"), xs[0] - 9 - NAME_GAP, Y, {
    align: "right",
    alpha: a * named(t, c.branch),
  });
  const dropY = mix(Y, Y + 96, over);
  commitDot(BX, dropY, { alpha: branch * mix(1, 0.75, over) });
  cross(BX, dropY, 30, { color: P.ink, alpha: branch * over, width: 3.5 });
  // The name hangs one gap under the struck commit and drops with it, so it stays on its mark from its first word.
  termRow(
    t,
    [L("另一个的工作", "The other one's work")],
    [c.otherWork],
    [L("被覆盖了", "overwritten")],
    [c.overwritten],
    BX,
    dropY + 15 + NAME_GAP,
    { alpha: a, align: "center" },
  );
  // The outdated memory: the branch as it was, three commits, over the first Agent.
  const mem = a * ramp(t, c.memory - 0.15, 0.4),
    MY = 330;
  box(AX - 80, MY - 30, 160, 60, { stroke: P.ink, alpha: mem, radius: 14, width: 2.5 });
  line(AX - 50, MY, AX + 50, MY, { color: P.muted, alpha: mem, width: 2 });
  fill(
    () =>
      [-50, 0, 50].forEach((dx) => {
        ctx.moveTo(AX + dx + 6, MY);
        ctx.arc(AX + dx, MY, 6, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha: mem },
  );
  line(AX, MY + 30, AX, AY - R, { color: P.ink, alpha: mem, width: 2.5 });
  nameText(L("过时的记忆", "An outdated memory"), AX - 80 - NAME_GAP, MY, {
    align: "right",
    alpha: a * named(t, c.memory),
  });
  // It writes from that memory: its link reaches the place after the three commits it remembers, drawn on at the tip
  // pace by its own length, and the commit it writes there lands as the link arrives.
  const write = a * ramp(t, c.writes - 0.15, 0.4),
    wrote = drawnShare(
      { t, at: c.writes + 0.05 },
      lengthOf(linkPoints(AX, AY + R, BX, Y - 9, { route: "vhv", mid: 560 })),
    );
  link(AX, AY + R, BX, Y - 9, {
    route: "vhv",
    mid: 560,
    alpha: write,
    upto: wrote,
    flow: flowClock(t),
  });
  dot(BX, Y, 9 * ease((wrote - 0.8) / 0.2), { color: P.ink, alpha: a });
}

/* 02.5 The same version pushed to two platforms: one succeeds, the other reports an error, and between them the state
 * nobody can name. The row grows to the right as it is told, so it stands centred on what stands: the version alone
 * from the cut, then the version with its platforms, its results and the state between them, gliding as one on the
 * words of each part that widens it. Each platform arrives with its link and its name on the words that name it. While
 * the version stands alone, which English holds for most of three seconds before it names a platform, and with the
 * first platform, the stage stands 40 px lower, so it stays balanced under the docked index; on the second platform's
 * name it rises as one to its place. */
export function stagePlatforms(t, a, c) {
  if (a <= 0) return;
  const VX = 470,
    VY = 600 + 40 * (1 - glideShare(t, c.github + 0.05, 40, 0.7)),
    PX = 1100,
    ys = [VY - 140, VY + 140],
    W = 220,
    H = 84,
    q = flowClock(t);
  const versionName = L("同一个版本", "The same version"),
    resultNames = L(["一边成功", "一边报错"], ["Succeeds on one", "Reports an error on the other"]),
    unclearName = L("谁也说不清", "Nobody can say");
  const come = [c.gitlab, c.github],
    results = [c.ok, c.fail];
  const from = Math.min(VX, VX + 70 - measure(versionName) / 2),
    after = PX + W / 2 + 76;
  ctx.save();
  ctx.translate(
    standing(t, [
      [-Infinity, from, Math.max(VX + 140, VX + 70 + measure(versionName) / 2)],
      [come[0], from, PX + W / 2],
      ...results.map((at, i) => [at, from, after + measure(resultNames[i])]),
      [c.unclear, from, after + measure(unclearName)],
    ]),
    0,
  );
  tagIcon(VX, VY, 140, 56, { alpha: a, color: P.ink });
  nameText(versionName, VX + 70, VY - 28 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.vCut),
  });
  ys.forEach((y, i) => {
    const on = a * ramp(t, come[i] - 0.15, 0.4);
    link(VX + 140, VY, PX - W / 2, y, {
      route: "hvh",
      mid: 840,
      alpha: on,
      draw: { t, at: come[i] + 0.05 },
      flow: q,
    });
    box(PX - W / 2, y - H / 2, W, H, { stroke: P.ink, alpha: on, radius: 14, width: 2.5 });
    nameText(["GitLab", "GitHub"][i], PX, y, { alpha: a * named(t, come[i]), set: "hosts" });
    const done = a * ramp(t, results[i] - 0.15, 0.4);
    if (i === 0) check(PX + W / 2 + 40, y, 30, { color: P.ink, alpha: done, width: 4 });
    else stopSign(PX + W / 2 + 40, y, 20, { color: P.ink, alpha: done });
    nameText(resultNames[i], after, y, {
      align: "left",
      alpha: a * listIn(t, results, i),
      set: "results",
    });
  });
  // Between the two, the state of the version: unknown.
  const unknown = a * ramp(t, c.unclear - 0.15, 0.4),
    UY = (ys[0] + ys[1]) / 2;
  unknownMark(PX + W / 2 + 40, UY, unknown);
  nameText(unclearName, after, UY, {
    align: "left",
    alpha: a * named(t, c.unclear),
  });
  ctx.restore();
}

/* The row of the error and of the second push: below the docked index, so that picture and index stand balanced while
 * only that row stands. */
const FORK_Y = 720;

/* 02.5 The error may mean either: from the error a link runs to a question, and the question forks to the two things
 * the error may mean, the push failed, and the push went through with only its reply lost, each named on its words, the
 * lost reply joining after its name. The error and its question stand from the cut where the finished fork places them,
 * so each part arrives in its place and nothing travels; the docked index above keeps the picture balanced meanwhile. */
export function stageFork(t, a, c) {
  if (a <= 0) return;
  const EX = 640,
    QX = 900,
    OX = 1150,
    Y = FORK_Y,
    ys = [Y - 100, Y + 100],
    q = flowClock(t);
  const errorName = L("报错的那一边", "The error"),
    outcomeNames = L(["失败了", "已经成功"], ["The push failed", "Went through"]),
    outcomeQuals = L([[], ["回复没有传回来"]], [[], ["only the reply was lost"]]),
    ats = [c.failed, c.through],
    after = OX + 36,
    left = EX - 20 - NAME_GAP - measure(errorName),
    reach = (i) =>
      after +
      measure(outcomeNames[i]) +
      (outcomeQuals[i].length ? TERM_GAP + measure(outcomeQuals[i].join(""), NOTE) : 0);
  ctx.save();
  ctx.translate(
    finished([
      [-Infinity, left, QX + UNKNOWN_R],
      [ats[0], left, after + measure(outcomeNames[0])],
      [ats[1], left, after + Math.max(measure(outcomeNames[0]), measure(outcomeNames[1]))],
      [c.lost, left, Math.max(reach(0), reach(1))],
    ]),
    0,
  );
  stopSign(EX, Y, 20, { color: P.ink, alpha: a });
  nameText(errorName, EX - 20 - NAME_GAP, Y, { align: "right", alpha: a * named(t, c.xName) });
  link(EX + 20, Y, QX - UNKNOWN_R, Y, {
    alpha: a,
    draw: { t, at: c.xCut + 0.05 },
    end: false,
    flow: q,
  });
  unknownMark(QX, Y, a * ramp(t, c.xCut + 0.3, 0.4));
  ys.forEach((y, i) => {
    const on = a * ramp(t, ats[i] - 0.15, 0.4);
    link(QX + UNKNOWN_R, Y, OX - 24, y, {
      route: "hvh",
      mid: QX + 90,
      alpha: on,
      draw: { t, at: ats[i] + 0.05 },
      flow: q,
    });
    if (i === 0) cross(OX, y, 24, { color: P.ink, alpha: on, width: 4 });
    else check(OX, y, 30, { color: P.ink, alpha: on, width: 4 });
    termRow(
      t,
      [outcomeNames[i]],
      [ats[i]],
      outcomeQuals[i],
      [c.lost],
      after,
      y - labelSize(LABEL) / 2,
      { alpha: a * listIn(t, ats, i), set: "outcomes" },
    );
  });
  ctx.restore();
}

/* 02.5 Trying again cannot tell which; only checking that platform can. A second push, dashed, runs from the version to
 * a question and stops there; then the platform stands beside it with a lens over it, named on the words that send the
 * viewer there. The two names over their marks share one line, and the stage stands where it is finished from its cut,
 * so each part arrives in its place. */
export function stageCheck(t, a, c) {
  if (a <= 0) return;
  const TX = 470,
    QX = 860,
    PX = 1330,
    Y = FORK_Y,
    W = 220,
    H = 84,
    NY = Y - H / 2 - NAME_GAP;
  const retryName = L("再试一遍", "Trying again"),
    whichName = L("分不清是哪一种", "Cannot tell which"),
    lookName = L("去那个平台查看", "Looking at that platform"),
    left = Math.min(TX, TX + 70 - measure(retryName) / 2),
    whichRight = QX + UNKNOWN_R + 16 + measure(whichName);
  ctx.save();
  ctx.translate(
    finished([
      [-Infinity, left, QX + UNKNOWN_R],
      [c.which, left, whichRight],
      [c.look, left, Math.max(whichRight, PX + W / 2, PX + measure(lookName) / 2)],
    ]),
    0,
  );
  tagIcon(TX, Y, 140, 56, { alpha: a, color: P.ink });
  nameText(retryName, TX + 70, NY, { valign: "bottom", alpha: a * named(t, c.retry) });
  // The second push draws on as every stroke's tip does (drawShare) and stops at the question it cannot settle.
  link(TX + 140, Y, QX - UNKNOWN_R, Y, {
    alpha: a,
    upto: drawShare(t, c.retry + 0.05, QX - UNKNOWN_R - TX - 140, 0.6),
    dash: [8, 8],
    end: false,
  });
  unknownMark(QX, Y, a * ramp(t, c.retry + 0.45, 0.4));
  nameText(whichName, QX + UNKNOWN_R + 16, Y, { align: "left", alpha: a * named(t, c.which) });
  // The platform, and a lens over it: the one way to tell.
  const look = a * ramp(t, c.look - 0.15, 0.4);
  box(PX - W / 2, Y - H / 2, W, H, { stroke: P.ink, alpha: look, radius: 14, width: 2.5 });
  ring(PX - 8, Y - 6, 20, { color: P.ink, alpha: look, width: 3.5 });
  line(PX + 7, Y + 9, PX + 26, Y + 28, { color: P.ink, alpha: look, width: 4 });
  nameText(lookName, PX, NY, { valign: "bottom", alpha: a * named(t, c.look) });
  ctx.restore();
}
