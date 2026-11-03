/* 02.2-02.3 Meaning drifts: one person once carried the work from start to finish; now a request passes many hands,
 * each handoff replaces the words with a summary, constraints and benefits drop out, and a well-formed specification
 * can still aim at the wrong goal. Each stage stands under the index at the top of the frame. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { box, dashed, dot, flowDot, line, ring, stroke } from "../../drawing/strokes.js";
import { agent, check, cross, person, token } from "../../drawing/symbols.js";
import { beats, listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText } from "../../naming/names.js";
import { railNames } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* Documents drawn as one mark: their outlines and folds one stroke and their rows another, so a set of copies reads as
 * one thing and a sheet's rows as its own lines rather than a list of marks to name. Sheets are outlines without a
 * fill, as every panel of the film is. Each document is [x, y, w, h, rows], its top-left corner first. */
export function papers(list, alpha = 1) {
  if (alpha < 0.01 || !list.length) return;
  const sheet = ([x, y, w, h]) => {
    const c = Math.min(22, w * 0.2);
    ctx.moveTo(x, y);
    ctx.lineTo(x + w - c, y);
    ctx.lineTo(x + w, y + c);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
  };
  stroke(
    () =>
      list.forEach((v) => {
        sheet(v);
        const [x, y, w] = v,
          c = Math.min(22, w * 0.2);
        ctx.moveTo(x + w - c, y);
        ctx.lineTo(x + w - c, y + c);
        ctx.lineTo(x + w, y + c);
      }),
    { color: P.ink, alpha, width: 2 },
  );
  stroke(
    () =>
      list.forEach(([x, y, w, h, rows]) => {
        for (let i = 0; i < rows; i++) {
          const ry = y + h * (0.3 + (i * 0.55) / Math.max(1, rows));
          ctx.moveTo(x + w * 0.14, ry);
          ctx.lineTo(x + w * (i % 2 ? 0.62 : 0.82), ry);
        }
      }),
    { color: P.muted, alpha: alpha * 0.8, width: 2 },
  );
}
export const paper = (x, y, w, h, { alpha = 1, rows = 3 } = {}) =>
  papers([[x, y, w, h, rows]], alpha);
/* The rail of a request's handoffs with its end ticks, one stroke. */
function railLine(alpha) {
  const { y, x0, x1 } = RAIL;
  stroke(
    () => {
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      [x0, x1].forEach((x) => {
        ctx.moveTo(x, y - 10);
        ctx.lineTo(x, y + 10);
      });
    },
    { color: P.line, alpha, width: 2.5 },
  );
}
/* The rail of a request's handoffs, shared by its two stages: the request at its start, three handlers standing over
 * it (a person, an Agent and a person, `heads` their tops; at this size a figure's head and shoulders read as one) and
 * its end. */
const RAIL = { y: 690, x0: 400, x1: 1520, xs: [700, 960, 1220], heads: [604, 624, 604] };
function handlers(seen) {
  const { xs } = RAIL;
  person(xs[0], 640, { size: 1.1, alpha: seen[0] });
  agent(xs[1], 646, { alpha: seen[1] });
  person(xs[2], 640, { size: 1.1, alpha: seen[2] });
}
/* The request: a document whose foot stands on the rail's start; the rail's end, a target point. */
const requestDoc = (alpha) => paper(RAIL.x0 - 36, RAIL.y - 100, 72, 96, { alpha, rows: 4 });
function railEnd(alpha) {
  ring(RAIL.x1, RAIL.y, 14, { color: P.ink, alpha, width: 2.5 });
  dot(RAIL.x1, RAIL.y, 5, { color: P.ink, alpha });
}

/* 02.2 One person carried a piece of work from start to finish: the work, the person beside it, and on the words that
 * say so the two walk the track together, the track drawn behind them; the whole story stands over the person's head,
 * in that one head. */
export function stagePerson(t, a, c) {
  if (a <= 0) return;
  const Y = 700,
    walk = soon(t, c.span - 0.05, 3),
    ux = mix(560, 1360, walk),
    work = a * ramp(t, c.work - 0.15, 0.4),
    who = a * ramp(t, c.person - 0.15, 0.4);
  // The track and its two end ticks are one stroke.
  stroke(
    () => {
      ctx.moveTo(520, Y - 12);
      ctx.lineTo(520, Y + 12);
      ctx.moveTo(520, Y);
      ctx.lineTo(1400, Y);
      ctx.moveTo(1400, Y - 12);
      ctx.lineTo(1400, Y + 12);
    },
    { color: P.line, alpha: a, width: 2.5 },
  );
  line(520, Y, ux, Y, { color: P.ink, alpha: a * ramp(t, c.span - 0.15, 0.4), width: 3 });
  person(ux, 662, { size: 1.5, alpha: who });
  paper(ux + 30, 610, 44, 56, { alpha: work, rows: 3 });
  nameText(L("一个人", "One person"), ux - 40 - NAME_GAP, 640, {
    align: "right",
    alpha: a * named(t, c.person),
  });
  nameText(L("一件事", "A piece of work"), ux + 74 + NAME_GAP, 638, {
    align: "left",
    alpha: a * named(t, c.work),
  });
  nameText(L("从头做到尾", "Start to finish"), 960, Y + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.span),
  });
  // The whole story: a thought over the person's head, its rows the work's context.
  const story = a * ramp(t, c.story - 0.15, 0.4),
    BY = 515;
  if (story > 0.01) {
    box(ux - 100, BY - 38, 200, 76, { stroke: P.ink, alpha: story, radius: 18, width: 2.5 });
    line(ux, BY + 38, ux, 610, { color: P.ink, alpha: story, width: 2.5 });
    stroke(
      () =>
        [0.8, 0.55, 0.7].forEach((w, k) => {
          ctx.moveTo(ux - 70, BY - 18 + k * 18);
          ctx.lineTo(ux - 70 + 140 * w, BY - 18 + k * 18);
        }),
      { color: P.muted, alpha: story * 0.8, width: 2 },
    );
  }
  nameText(L("来龙去脉", "The whole story"), ux - 100 - NAME_GAP, BY, {
    align: "right",
    alpha: a * named(t, c.story),
  });
}

/* 02.2 Now a request passes through interpretation, retelling and handoffs on its way to delivery: the request at the
 * rail's start, each station's handler arriving on its words and the request's point moving on to it, the rail's end
 * named on its words; the people and the Agent among the handlers light as they are named. */
export function stageRail(t, a, c) {
  if (a <= 0) return;
  const { y, x0, x1, xs } = RAIL,
    stations = [c.st1, c.st2, c.st3];
  railLine(a);
  requestDoc(a);
  nameText(L("一项需求", "A request"), x0, y + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.rCut),
  });
  railEnd(a * ramp(t, c.delivery - 0.15, 0.4));
  // The stations and the end, named in the order they are said.
  const ats = [...stations, c.delivery],
    order = [...ats].sort((p, q) => p - q);
  railNames(
    L(["理解", "转述", "交接", "落地"], ["Interpretation", "Retelling", "Handoffs", "Delivery"]),
    [...xs, x1],
    y,
    { gap: NAME_GAP, alpha: (i) => a * listIn(t, order, order.indexOf(ats[i])), set: "stations" },
  );
  const seen = stations.map((at) => a * ramp(t, at - 0.15, 0.4));
  handlers(seen);
  beats(t, xs[0], 634, 46, [c.people], { alpha: seen[0] });
  beats(t, xs[2], 634, 46, [c.people], { alpha: seen[2] });
  beats(t, xs[1], 646, 46, [c.agents], { alpha: seen[1] });
  // The request's point moves on to each station on its words, and to the end once it has passed them all.
  const stops = [...xs, x1],
    steps = [...stations, en ? c.delivery : c.people],
    px = steps.reduce(
      (x, at, i) => x + (stops[i] - (i ? stops[i - 1] : x0)) * soon(t, at + 0.05, 0.5),
      x0,
    );
  token(px, y, { r: 9, alpha: a });
}

/* 02.3 At every handoff a summary takes the place of the words before it: on each handler a shorter copy than the
 * last, the original at the start. What drops out stands under the rail as it is named, in the order it is said: a
 * constraint never written down, which turns to an outline as its session ends, a constraint on what must not be done,
 * the benefit. */
export function stageSummaries(t, a, c) {
  if (a <= 0) return;
  const { y, x0, x1, xs, heads } = RAIL;
  railLine(a);
  requestDoc(a);
  railEnd(a);
  handlers([a, a, a]);
  const q = (voiceTime(t) * 0.3) % 1;
  flowDot(mix(x0 + 44, x1 - 20, q), y, 7, q, { color: P.ink, alpha: a });
  nameText(L("原话", "The words before it"), x0, y - 100 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.orig - 0.1),
  });
  // The summaries: each shorter than the one before, standing on its handler's head or on the rail's end, all one
  // mark with what holds them, named by the words that say a summary takes the place.
  papers(
    [
      [xs[0], 56, 3, heads[0] - 4],
      [xs[1], 48, 2, heads[1] - 4],
      [xs[2], 40, 1, heads[2] - 4],
      [x1, 32, 1, y - 18],
    ].map(([x, w, rows, foot]) => [x - w / 2, foot - w * 1.27, w, w * 1.27, rows]),
    a * ramp(t, c.summary - 0.15, 0.4),
  );
  nameText(L("一份总结顶替一次", "A summary takes the place"), (xs[0] + x1) / 2, 507, {
    valign: "bottom",
    alpha: a * named(t, c.summary),
  });
  // What drops out: rows under the rail, the first solid until its session ends and then an outline.
  const lost = [c.unwritten, c.mustNot, c.benefit],
    LY = y + 34;
  xs.forEach((x, i) => {
    const on = a * ramp(t, lost[i] - 0.15, 0.4),
      gone = i ? 1 : ramp(t, c.gone - 0.15, 0.4);
    line(x - 44, LY, x + 44, LY, { color: P.ink, alpha: on * (1 - gone), width: 3 });
    dashed(x - 44, LY, x + 44, LY, { color: P.ink, alpha: on * gone * 0.85, width: 3 });
  });
  railNames(
    L(
      ["没写下来的约束", "不能做什么", "想要得到的好处"],
      ["Never written down", "What must not be done", "The benefit"],
    ),
    xs,
    LY,
    { gap: NAME_GAP, alpha: (i) => a * listIn(t, lost, i), set: "lost" },
  );
}

/* 02.3 A specification can be complete and well formed and still aim at the wrong goal: a full document with its check,
 * its aim drawn to the goal it names, and that goal marked wrong. */
export function stageWrongGoal(t, a, c) {
  if (a <= 0) return;
  const DX = 640,
    DY = 580,
    TX = 1280,
    q = (voiceTime(t) * 0.45) % 1,
    aim = a * ramp(t, c.wrong - 0.15, 0.4);
  paper(DX - 70, DY - 90, 140, 180, { alpha: a, rows: 6 });
  dot(DX + 70, DY + 90, 22, { color: P.ground, alpha: a });
  ring(DX + 70, DY + 90, 22, { color: P.ink, alpha: a, width: 2.5 });
  check(DX + 70, DY + 91, 20, { color: P.ink, alpha: a, width: 3 });
  // Its clause begins with the stage, so the specification is named from the cut.
  nameText(L("格式齐全、挑不出毛病", "Complete and well formed"), DX, DY + 112 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.gCut + 0.15),
  });
  link(DX + 70, DY, TX - 58, DY, {
    alpha: a,
    upto: soon(t, c.gCut + 0.3, 0.6),
    flow: q,
    width: 2.5,
  });
  [58, 36].forEach((r) => ring(TX, DY, r, { color: P.ink, alpha: a, width: 2.5 }));
  dot(TX, DY, 10, { color: P.ink, alpha: a });
  cross(TX + 62, DY - 62, 26, { color: P.ink, alpha: aim, width: 3.5 });
  nameText(L("从一开始就定错了", "Aimed at the wrong goal"), TX, DY + 58 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.wrong),
  });
}
