/* 08.8-08.9 the feedback reaches the model: a failed implementation is told apart from a wrong model; the concept
 * "the same record" lacks a dimension, and a new Change revises the model at the smallest boundary, recompiling what
 * depends on it, with no exception, side path or second source of truth; dependent work waits while unrelated work
 * goes on; and the goal stays as it was, changed only by an authorized realignment of intent, never loosened. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { box, flowDot, line, stroke } from "../../drawing/strokes.js";
import { lock, person, seal } from "../../drawing/symbols.js";
import { writeGate } from "../../drawing/lanes.js";
import { modelGrid } from "../../drawing/models.js";
import { folderIcon, terminalIcon } from "../../drawing/workspace.js";
import { resultCard } from "../p07/example.js";
import { docMark } from "./rail.js";
import { beats, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, rejectedName } from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* 08.8, first: the failed implementation and the model stand apart, a dashed line between them as they are told
 * apart; this time the fault is in the model, which takes the full ink while the code steps back. */
export function faultApart(s, t, a) {
  if (a <= 0) return;
  const [codeAt, modelAt, apartAt, faultAt] = cues(s, [
    ["代码出错", "A failed implementation"],
    ["模型的问题", "the model is wrong"],
    ["要先分清", "told apart first"],
    ["问题出在模型上", "the fault is in the model"],
  ]);
  const m = a * named(t, modelAt),
    d = a * named(t, apartAt),
    f = ramp(t, faultAt - 0.15, 0.6);
  terminalIcon(520, 400, 240, 140, { alpha: a * mix(1, 0.55, f) });
  nameText(L("代码出错", "A failed implementation"), 640, 540 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, codeAt),
  });
  modelGrid(1100, 400, 240, 140, { alpha: m, cell: [3, 1], lit: f });
  nameText(L("模型的问题", "the model is wrong"), 1220, 540 + NAME_GAP, {
    valign: "top",
    alpha: m,
  });
  line(900, 390, 900, 550, { color: P.line, alpha: d, dash: [8, 8] });
  nameText(L("要先分清", "told apart first"), 900, 370, { valign: "bottom", alpha: d });
  nameText(L("问题出在模型上", "the fault is in the model"), 1240, 370, {
    valign: "bottom",
    width: 280,
    alpha: a * named(t, faultAt),
  });
}

/* Three checks drawn as one mark, their frames one stroke and their ticks another, so one name names them; `at`
 * compiles them again, a ring passing over each in turn. */
function checkGroup(t, x, ys, { alpha = 1, at = Infinity } = {}) {
  if (alpha < 0.01) return;
  stroke(() => ys.forEach((y) => ctx.roundRect(x - 26, y - 22, 52, 44, 8)), {
    color: P.ink,
    alpha,
    width: 2.5,
  });
  stroke(
    () =>
      ys.forEach((y) => {
        ctx.moveTo(x - 13, y + 1);
        ctx.lineTo(x - 3, y + 11);
        ctx.lineTo(x + 14, y - 10);
      }),
    { color: P.ink, alpha, width: 3.5 },
  );
  ys.forEach((y, i) => beats(t, x, y, 34, [at + 0.45 * i], { alpha }));
}

/* 08.8, second: the model with its concept of the same record, a cell that lacks a dimension and grows one on its
 * words; a new Change revises the model at the smallest boundary drawn around that cell, and the checks that depend
 * on the model are compiled again, re-lighting one after another. */
export function modelRevision(s, t, a) {
  if (a <= 0) return;
  const [recordAt, dimAt, changeAt, boundAt, revisesAt, checksAt, compileAt] = cues(s, [
    ["同一条记录", "the same record"],
    ["少了一个维度", "missing a dimension"],
    ["新的正式变更", "a new official Change"],
    ["受影响的最小范围", "the smallest boundary"],
    ["修订模型", "revises the model"],
    ["依赖它的检查", "every check that depends on it"],
    ["重新编译", "compiled again"],
  ]);
  // The stage steps left twice, as the Change and then the checks arrive, so each state stands on the centre.
  const off = 210 * (2 - soon(t, changeAt - 0.4, 0.8) - soon(t, checksAt - 0.4, 0.8));
  ctx.save();
  ctx.translate(off, 0);
  const GX = 340,
    GY = 390,
    GW = 400,
    GH = 225,
    grow = soon(t, dimAt + 0.05, 0.8),
    c = a * named(t, changeAt),
    bd = a * named(t, boundAt),
    k = a * named(t, checksAt),
    flow = (voiceTime(t) * 0.4) % 1;
  modelGrid(GX, GY, GW, GH, { alpha: a, cell: [3, 1], lit: 1, grow });
  nameText(L("同一条记录", "the same record"), GX + GW - 40, GY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, recordAt),
  });
  nameText(L("少了一个维度", "missing a dimension"), GX - 22, GY + GH / 2, {
    align: "right",
    width: 200,
    alpha: a * named(t, dimAt),
  });
  // The smallest boundary the problem touches: a dashed outline around the grown cell.
  const cx0 = GX + 3 * (GW / 4) - 6,
    cx1 = GX + GW + 0.9 * (GW / 4) * grow + 6,
    cy0 = GY + GH / 3 - (GH / 3) * 0.5 * grow - 6,
    cy1 = GY + (2 * GH) / 3 + (GH / 3) * 0.5 * grow + 6;
  box(cx0, cy0, cx1 - cx0, cy1 - cy0, { stroke: P.line, alpha: bd, radius: 10, dash: [8, 7] });
  nameText(L("受影响的最小范围", "the smallest boundary"), (cx0 + cx1) / 2, GY + GH + NAME_GAP, {
    valign: "top",
    alpha: bd,
  });
  // The new Change, linked to the cell it revises.
  docMark(940, GY + GH / 2 - 75, 120, 150, { alpha: c, rows: 4 });
  link(928, GY + GH / 2, cx1 + 10, GY + GH / 2, {
    alpha: a * named(t, revisesAt),
    upto: soon(t, revisesAt + 0.05, 0.6),
    flow,
  });
  nameText(L("新的正式变更", ["a new official", "Change"]), 1000, GY + GH / 2 + 75 + NAME_GAP, {
    valign: "top",
    alpha: c,
  });
  nameText(L("修订模型", "revises the model"), 1000, GY + GH / 2 - 75 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, revisesAt),
  });
  // The checks that depend on the model, compiled again one after another.
  const ys = [GY + 10, GY + GH / 2, GY + GH - 10];
  ys.forEach((y, i) =>
    link(1060 + 12, GY + GH / 2, 1240 - 38, y, {
      route: "hvh",
      mid: 1150,
      alpha: k,
      upto: soon(t, checksAt + 0.05 + 0.15 * i, 0.6),
      flow: (flow + i / 3) % 1,
    }),
  );
  checkGroup(t, 1240, ys, { alpha: k, at: compileAt });
  nameText(L("依赖它的检查", "every check that depends on it"), 1286, GY + GH / 2, {
    align: "left",
    width: 280,
    alpha: k,
  });
  nameText(L("重新编译", "compiled again"), 1240, ys[2] + 22 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, compileAt),
  });
  ctx.restore();
}

/* 08.8, third: the one model, and beside it the ways around it, each refused on its words. */
export function noWayAround(s, t, a) {
  if (a <= 0) return;
  const ats = cues(s, [
    ["不加例外", "No exception"],
    ["旁路", "side path"],
    ["第二个真相来源", "second source of truth"],
  ]);
  // Each refusal is linked straight across from the model's edge to its name.
  const MX = 540,
    MY = 375,
    MW = 420,
    MH = 250,
    rows = [MY + 40, MY + MH / 2, MY + MH - 40],
    edge = [MX + MW + 8, MX + MW + 0.9 * (MW / 4) + 14, MX + MW + 8];
  modelGrid(MX, MY, MW, MH, { alpha: a, cell: [3, 1], lit: 1, grow: 1 });
  [
    L("例外", "exception"),
    L("旁路", "side path"),
    L("第二个真相来源", "second source of truth"),
  ].forEach((v, i) =>
    rejectedName(v, 1130, rows[i], {
      align: "left",
      alpha: a * named(t, ats[i]),
      mark: ramp(t, ats[i] + 0.3, 0.4),
      set: "08.8:refused",
    }),
  );
  rows.forEach((y, i) =>
    link(edge[i], y, 1114, y, {
      alpha: a * named(t, ats[i]) * 0.9,
      upto: soon(t, ats[i] + 0.05, 0.5),
      dash: [6, 6],
      end: false,
    }),
  );
}

/* A lane of work: its folder, its track, and the points of work on it. */
function workLane(x0, x1, y, { alpha = 1, flow = null, held = null, gate = null } = {}) {
  if (alpha < 0.01) return;
  folderIcon(x0, y - 26, 62, 52, { alpha });
  link(x0 + 70, y, x1, y, { alpha, end: false });
  if (gate !== null) writeGate(gate, y, 92, { alpha, open: 0, single: true });
  if (held !== null) flowDot(held, y, 10, 0.5, { color: P.ink, alpha });
  if (flow !== null)
    for (let k = 0; k < 3; k++) {
      const q = (flow + k / 3) % 1;
      flowDot(mix(x0 + 80, x1, q), y, 10, q, { color: P.ink, alpha });
    }
}

/* 08.8, last: meanwhile two lanes: the changes that depend on the concept wait at a closed gate under the model being
 * revised, linked to it, and the work unrelated to it keeps flowing below. */
export function meanwhile(s, t, a) {
  if (a <= 0) return;
  const [dependAt, waitAt, otherAt, onAt] = cues(s, [
    ["依赖这个概念的改动", "changes that depend on that idea"],
    ["先停下", "wait"],
    ["和它无关的工作", "work unrelated to it"],
    ["照常进行", "goes on as usual"],
  ]);
  const d = a * named(t, dependAt),
    o = a * named(t, otherAt),
    Y1 = 520,
    Y2 = 670,
    GATE = 1200;
  // The two tracks differ in length, so they are read as two lanes rather than two items of one list.
  workLane(520, 1260, Y1, {
    alpha: d,
    gate: GATE,
    held: mix(700, 1140, soon(t, dependAt + 0.1, 1.4)),
  });
  // The model the changes wait on stands over the gate's near post, linked down to it, so gate and model are one mark.
  modelGrid(GATE - 130, 300, 200, 112, { alpha: d, cell: [3, 1], lit: 1, grow: 1 });
  link(GATE - 30, 418, GATE - 30, Y1 - 50, {
    alpha: d,
    upto: soon(t, dependAt + 0.05, 0.6),
    end: false,
  });
  nameText(L("依赖这个概念的改动", "changes that depend on that idea"), 600, Y1 - 40, {
    align: "left",
    valign: "bottom",
    width: 420,
    alpha: d,
  });
  nameText(L("先停下", "wait"), GATE + 50, Y1 - 40, {
    align: "left",
    valign: "bottom",
    alpha: a * named(t, waitAt),
  });
  workLane(520, 1420, Y2, { alpha: o, flow: (voiceTime(t) * 0.35) % 1 });
  nameText(L("和它无关的工作", "work unrelated to it"), 600, Y2 + 40, {
    align: "left",
    valign: "top",
    alpha: o,
  });
  nameText(L("照常进行", "goes on as usual"), 1440, Y2, {
    align: "left",
    alpha: a * named(t, onAt),
  });
}

/* 08.9. The goal stands as a level over the records it keeps free of duplicates, under its words, and is not
 * relaxed: a lock at its end holds it. It can change only by an explicit, authorized realignment of intent, drawn as the
 * link from the authority's seal up to the lock; lowering the level quietly so a result passes is refused, the quiet
 * lower level dashed and crossed. */
export function goalKept(s, t, a) {
  if (a <= 0) return;
  const [goalAt, keptAt, notAt, alignAt, quietAt] = cues(s, [
    ["不能多出重复记录", "no duplicate records"],
    ["这个目标", "The goal"],
    ["一个字也没有放宽", "not relaxed in the slightest"],
    ["经授权重新对齐意图", "authorized intent alignment"],
    ["悄悄放宽", "silently loosened"],
  ]);
  const LY = 380,
    x0 = 560,
    x1 = 1372,
    al = a * named(t, alignAt),
    q = a * named(t, quietAt),
    sink = soon(t, quietAt + 0.05, 1.0),
    flow = (voiceTime(t) * 0.4) % 1;
  line(x0, LY, x1, LY, { color: P.ink, alpha: a, width: 5 });
  lock(x1 + 20, LY, { alpha: a, color: P.ink });
  nameText(L("不能多出重复记录", "no duplicate records"), 960, LY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, goalAt),
  });
  nameText(L("这个目标", "The goal"), x0 - 24, LY, { align: "right", alpha: a * named(t, keptAt) });
  // The records the goal keeps free of duplicates, under the level.
  link(960, 482, 960, LY + 12, { alpha: a, flow });
  resultCard(960, 545, 4, { alpha: a, w: 170, h: 120 });
  nameText(L("一个字也没有放宽", "not relaxed in the slightest"), 1150, LY + 28, {
    valign: "top",
    width: 300,
    alpha: a * named(t, notAt),
  });
  // The only way the goal changes: an explicit, authorized realignment, from the authority's seal up to the lock.
  person(1322, 624, { size: 1.2, alpha: al });
  seal(x1 + 20, 620, 22, { alpha: al, color: P.ink });
  link(x1 + 20, 594, x1 + 20, LY + 22, { alpha: al, upto: soon(t, alignAt + 0.05, 0.6), flow });
  nameText(L("经授权重新对齐意图", "authorized intent alignment"), x1 + 58, 620, {
    align: "left",
    width: 340,
    alpha: al,
  });
  // A quiet lowering of the level's start, refused.
  const low = LY + mix(50, 110, sink);
  line(x0 + 20, low, 800, low, { color: P.line, alpha: q, width: 4, dash: [10, 9] });
  rejectedName(L("悄悄放宽", "silently loosened"), 680, low + 36, {
    alpha: q,
    mark: ramp(t, quietAt + 0.5, 0.4),
  });
}
