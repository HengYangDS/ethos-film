/* 02.5 Changes are made before the facts are checked: an Agent writes from an outdated memory over another's work, a
 * version lands on one platform and not the other, and neither a retry nor an error message settles what happened. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { box, dashed, dot, fill, line, ring, stroke, text } from "../../drawing/strokes.js";
import { check, cross, stopSign } from "../../drawing/symbols.js";
import { commitRow } from "../../drawing/history.js";
import { commitDot, tagIcon } from "../../drawing/workspace.js";
import { building, listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText } from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

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

/* 02.5 Two Agents work on the same branch. One keeps a memory of the branch as it was, three commits; it writes from
 * that memory, its link drawn to the place after them, and its commit lands there; the other's commit, the newest on
 * the branch, drops off it, struck through: overwritten. */
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
  const over = soon(t, c.overwritten + 0.05, 0.6),
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
  nameText(L("被覆盖了", "Overwritten"), BX, dropY + 15 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.overwritten),
  });
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
  // It writes from that memory: its link reaches the place after the three commits it remembers.
  const write = a * ramp(t, c.writes - 0.15, 0.4);
  link(AX, AY + R, BX, Y - 9, {
    route: "vhv",
    mid: 560,
    alpha: write,
    upto: soon(t, c.writes + 0.05, 0.8),
    flow: (voiceTime(t) * 0.45) % 1,
  });
  dot(BX, Y, 9 * soon(t, c.writes + 0.75, 0.3), { color: P.ink, alpha: a });
}

/* 02.5 The same version pushed to two platforms: one succeeds, the other fails, and between them the state nobody can
 * name; trying again adds a second push that ends in the same question. */
export function stagePlatforms(t, a, c) {
  if (a <= 0) return;
  const VX = 470,
    VY = 560,
    PX = 1100,
    ys = [420, 700],
    W = 220,
    H = 84,
    q = (voiceTime(t) * 0.4) % 1;
  tagIcon(VX, VY, 140, 56, { alpha: a, color: P.ink });
  nameText(L("同一个版本", "The same version"), VX + 70, VY - 28 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.vCut),
  });
  // Each platform arrives with its name. The English names the platforms before it names them, and its clause
  // already runs, so each arrives on the words that bring it and its name may stand that far ahead of its words.
  const hosts = [c.gitlab, c.github],
    come = L(hosts, [c.platforms, c.platforms2]),
    calls = hosts.map((at, i) => L(at, Math.max(come[i], at - 1.4))),
    results = [c.ok, c.fail];
  ys.forEach((y, i) => {
    const on = a * ramp(t, come[i] - 0.15, 0.4);
    link(VX + 140, VY, PX - W / 2, y, {
      route: "hvh",
      mid: 840,
      alpha: on,
      upto: soon(t, come[i] + 0.05, 0.5),
      flow: q,
    });
    box(PX - W / 2, y - H / 2, W, H, { stroke: P.ink, alpha: on, radius: 14, width: 2.5 });
    nameText(["GitLab", "GitHub"][i], PX, y, { alpha: a * named(t, calls[i]), set: "hosts" });
    const done = a * ramp(t, results[i] - 0.15, 0.4);
    if (i === 0) check(PX + W / 2 + 40, y, 30, { color: P.ink, alpha: done, width: 4 });
    else stopSign(PX + W / 2 + 40, y, 20, { color: P.ink, alpha: done });
    nameText(
      L(["一边成功", "一边失败"], ["Succeeds on one", "Fails on the other"])[i],
      PX + W / 2 + 76,
      y,
      { align: "left", alpha: a * listIn(t, results, i), set: "results" },
    );
  });
  // Between the two, the state of the version: unknown.
  const unknown = a * ramp(t, c.unclear - 0.15, 0.4),
    UY = (ys[0] + ys[1]) / 2;
  unknownMark(PX + W / 2 + 40, UY, unknown);
  nameText(L("说不清现在到底是什么状态", "Nobody can say"), PX + W / 2 + 76, UY, {
    align: "left",
    alpha: a * named(t, c.unclear),
  });
  // Trying again: a second push, dashed, that ends in the same question.
  const again = a * ramp(t, c.retry - 0.15, 0.4);
  link(VX + 70, VY + 28, VX + 70 + 300, 800, {
    route: "vh",
    alpha: again,
    upto: soon(t, c.retry + 0.05, 0.6),
    dash: [8, 8],
  });
  unknownMark(VX + 70 + 330, 800, again * soon(t, c.retry + 0.55, 0.3));
  // Its name stands as far from its mark as the results' names stand from theirs.
  nameText(L("再试一遍", "Trying again"), VX + 70 + 330 + UNKNOWN_R + 16, 800, {
    align: "left",
    alpha: a * named(t, c.retry),
  });
}

/* 02.5 A request that was sent may not have been received, and an error does not mean nothing happened: each pair a
 * link that stops at a question, so the far end cannot be read from the near one. */
export function stageSent(t, a, c) {
  if (a <= 0) return;
  const X0 = 760,
    X1 = 1160,
    // The pairs stand lower while the second is still to come, so the picture under the index stays balanced.
    ys = [560, 760].map((y) => y + building(t, [c.s2Cut, c.error], 100)),
    near = [c.sent, c.error],
    far = [c.received, c.nothing],
    q = (voiceTime(t) * 0.4) % 1;
  ys.forEach((y, i) => {
    // The first pair stands from the cut, its clause already begun.
    const on = a * ramp(t, (i ? near[i] : c.s2Cut) - 0.15, 0.4),
      off = a * ramp(t, far[i] - 0.15, 0.4);
    dot(X0, y, 10, { color: P.ink, alpha: on });
    link(X0 + 10, y, 930, y, {
      alpha: on,
      upto: soon(t, near[i] + 0.05, 0.4),
      end: false,
      flow: q,
    });
    unknownMark(960, y, off);
    dashed(990, y, X1 - 14, y, { color: P.line, alpha: off, width: 2.5 });
    ring(X1, y, 14, { color: P.ink, alpha: off, width: 2.5 });
    nameText(
      L(["请求发出去了", "看到报错"], ["Sent", "An error message"])[i],
      X0 - 10 - NAME_GAP,
      y,
      { align: "right", alpha: a * listIn(t, [c.s2Cut, near[1]], i), set: "near" },
    );
    nameText(
      L(["对方收下了", "什么都没发生"], ["Received", "Nothing happened"])[i],
      X1 + 14 + NAME_GAP,
      y,
      { align: "left", alpha: a * listIn(t, far, i), set: "far" },
    );
  });
}
