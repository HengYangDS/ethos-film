/* 08.8-08.9 the feedback reaches the model: a failed implementation is told apart from a wrong model; the concept
 * "the same record" lacks a dimension, and a new Change revises the model at the smallest boundary, recompiling what
 * depends on it, with no exception, side path or second definition; dependent work waits while unrelated work
 * goes on; and the goal stays as it was, changed only by an authorized realignment of intent, never loosened. */

import { ctx } from "../../canvas.js";
import { FLOW_EVERY, FLOW_PACE, flowAlong, flowClock, link } from "../../drawing/links.js";
import { box, dot, line, measure, stroke } from "../../drawing/strokes.js";
import { lock, person, seal } from "../../drawing/symbols.js";
import { writeGate } from "../../drawing/lanes.js";
import { modelGrid } from "../../drawing/models.js";
import { folderIcon, terminalIcon } from "../../drawing/workspace.js";
import { nameWidth, resultCard } from "../p07/example.js";
import { recordRows, valueCell } from "../p04/marks.js";
import { docMark, ordinal } from "./rail.js";
import { beats, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, rejectedName } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { drawShare, drawTime, glideShare, glideTime } from "../../timing/pauses.js";

/* 08.9, first: the failed implementation and the model stand apart, a line between them as they are told apart, solid
 * since the film keeps dashes for what is unknown, missing or refused; this time the fault is in the model, which
 * takes the full ink while the code steps back. The two stand at one distance either side of the line on the frame's
 * axis; until the model is named the code stands alone on that axis, and it steps left into its place as the model
 * arrives on its words. The model leads its words by a third of a second, within a label's lead of them: English says
 * them just past two seconds into the thought, the reviewers' first instant, and the Chinese 模型 comes about 1.7 s
 * after 代码出错, so without the lead the code would stand alone over a sparse frame for longer than the picture
 * check allows. */
export function faultApart(s, t, a) {
  if (a <= 0) return;
  const [codeAt, modelAt, apartAt, faultAt] = cues(s, [
    ["代码出错", "A failed implementation"],
    ["模型", "the model"],
    ["要先分清", "told apart first"],
    ["问题出在模型上", "the fault is in the model"],
  ]);
  const W = 280,
    H = 160,
    Y0 = 390,
    GAP = 170,
    CX = 960 - GAP - W / 2,
    MX = 960 + GAP + W / 2,
    shown = modelAt - 0.35,
    alone = (960 - CX) * (1 - glideShare(t, shown - 0.4, 960 - CX, 0.8)),
    m = a * named(t, shown),
    d = a * named(t, apartAt),
    f = ramp(t, faultAt - 0.15, 0.6);
  terminalIcon(CX + alone - W / 2, Y0, W, H, { alpha: a * mix(1, 0.55, f) });
  nameText(L("代码出错", "A failed implementation"), CX + alone, Y0 + H + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, codeAt),
  });
  modelGrid(MX - W / 2, Y0, W, H, { alpha: m, cell: [3, 1], lit: f });
  nameText(L("模型", "The model"), MX, Y0 + H + NAME_GAP, {
    valign: "top",
    alpha: m,
  });
  line(960, Y0, 960, Y0 + H, { color: P.line, alpha: d });
  nameText(L("要先分清", "Told apart first"), 960, Y0 - 20, { valign: "bottom", alpha: d });
  nameText(L("问题所在", "The fault"), MX, Y0 - 20, {
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
 * words, filling as it grows with what the new dimension separates: two revisions of one record, the same code and
 * date with two values, numbered in the cell's new part; a new Change revises the model at the smallest boundary drawn
 * around that cell, and the checks that depend
 * on the model are compiled again, re-lighting one after another. The Change and the checks are drawn as tall as the
 * model, so the names over the row end on one line and the names under it hang from one line, one gap under each of
 * their marks whichever has arrived, and neighbouring names keep a word's space between them. The stage steps left
 * twice, as the Change and then the checks arrive, so each state stands centred on the frame by its outer names. */
export function modelRevision(s, t, a) {
  if (a <= 0) return;
  const [recordAt, dimAt, changeAt, boundAt, revisesAt, checksAt, compileAt] = cues(s, [
    ["同一条记录", "the same record"],
    ["少了一个维度", "missing a dimension"],
    ["新的正式变更", "a new official Change"],
    ["受影响的最小范围", "the smallest boundary"],
    ["修订模型", "revises the model"],
    ["依赖它的计划和视图", "every plan and view that depends on it"],
    ["重新编译", "compiled again"],
  ]);
  // The row in the stage's own coordinates, the model's left edge at 0.
  const GY = 390,
    GW = 400,
    GH = 225,
    DOC = [150, GH],
    DOC_X = 730,
    CHK = 1015,
    // The concept's cell, the last of the middle row, and its axis once it has grown a dimension.
    CELL0 = 3.5 * (GW / 4),
    CELL = CELL0 + 0.45 * (GW / 4),
    MID = GY + GH / 2,
    RECORD = L("同一条记录", "The same record"),
    DIM = L("少了一个维度", "Missing a dimension"),
    BOUND = L("最小范围", "The smallest boundary"),
    CHANGE = L("新的正式变更", "A new official Change"),
    // The link is named by the contract's rendering of what it does; the checks by what they are.
    REVISES = L("修订模型", "Revising the model"),
    DEP = L("依赖它的计划和视图", "Plans and views"),
    COMPILE = L("重新编译", "Compiled again");
  const left = -22 - nameWidth(DIM, 280),
    right1 = Math.max(GW + 0.9 * (GW / 4) + 6, CELL + nameWidth(RECORD) / 2),
    right2 = Math.max(
      right1,
      CELL + nameWidth(BOUND) / 2,
      DOC_X + DOC[0] / 2,
      DOC_X + nameWidth(CHANGE) / 2,
      DOC_X + nameWidth(REVISES) / 2,
    ),
    right3 = Math.max(right2, CHK + 46 + nameWidth(DEP, 280), CHK + nameWidth(COMPILE) / 2),
    at = (right) => 960 - (left + right) / 2,
    // Each step left by the film's structural glide over its own way, setting off 0.65 s before the words of the part
    // it makes room for, so it has gone most of its way when that part's name appears.
    GX =
      at(right3) +
      (at(right2) - at(right3)) * (1 - glideShare(t, checksAt - 0.65, at(right2) - at(right3), 0.8)) +
      (at(right1) - at(right2)) * (1 - glideShare(t, changeAt - 0.65, at(right1) - at(right2), 0.8));
  ctx.save();
  ctx.translate(GX, 0);
  const grow = soon(t, dimAt + 0.05, 0.8),
    c = a * named(t, changeAt),
    bd = a * named(t, boundAt),
    k = a * named(t, checksAt),
    flow = flowClock(t),
    above = GY - NAME_GAP,
    // The checks' frames, 44 px tall, span the model's height from its top to its bottom.
    ys = [GY + 22, MID, GY + GH - 22],
    below = rowNameTop([GY + GH, ys.at(-1) + 22]);
  modelGrid(0, GY, GW, GH, { alpha: a, cell: [3, 1], lit: 1, grow });
  // The concept's name stands over its cell on the cell's axis, moving with it as it grows, so it ends on the axis of
  // the smallest boundary drawn round it.
  nameText(RECORD, mix(CELL0, CELL, grow), above, {
    valign: "bottom",
    alpha: a * named(t, recordAt),
  });
  nameText(DIM, -22, MID, {
    align: "right",
    width: 280,
    alpha: a * named(t, dimAt),
  });
  // What the new dimension separates, on its words: two revisions of one record, its rows in the cell's first part and
  // their numbers in the part it grows, each once the cell has grown room for it.
  const RX = CELL0 - 0.5 * (GW / 4) + 14,
    RW = 110,
    revisions = a * ramp(t, dimAt + 0.3, 0.4),
    numbered = a * ramp(t, dimAt + 0.5, 0.4);
  recordRows(RX, MID - 24, RW, [0, 1], { step: 48, alpha: revisions });
  const [v0, v1] = valueCell(RX, RW);
  line(v0, MID + 24, v1, MID + 24, { color: P.ink, alpha: revisions, width: 4 });
  [1, 2].forEach((n, i) => ordinal(n, CELL0 + 0.5 * (GW / 4) + 34, MID - 24 + 48 * i, numbered));
  // The smallest boundary the problem touches: a thin solid outline around the grown cell, since it is a valid scope
  // and the film keeps dashes for what is unknown, missing or refused.
  const cx0 = 3 * (GW / 4) - 6,
    cx1 = GW + 0.9 * (GW / 4) * grow + 6,
    cy0 = GY + GH / 3 - (GH / 3) * 0.5 * grow - 6,
    cy1 = GY + (2 * GH) / 3 + (GH / 3) * 0.5 * grow + 6;
  box(cx0, cy0, cx1 - cx0, cy1 - cy0, { stroke: P.line, alpha: bd, radius: 10, width: 2 });
  nameText(BOUND, CELL, below, {
    valign: "top",
    alpha: bd,
  });
  // The new Change, linked to the cell it revises.
  docMark(DOC_X - DOC[0] / 2, GY, DOC[0], DOC[1], { alpha: c, rows: 4 });
  link(DOC_X - DOC[0] / 2 - 12, MID, cx1 + 10, MID, {
    alpha: a * named(t, revisesAt),
    draw: { t, at: revisesAt + 0.05 },
    flow,
  });
  nameText(CHANGE, DOC_X, below, {
    valign: "top",
    alpha: c,
  });
  nameText(REVISES, DOC_X, above, {
    valign: "bottom",
    alpha: a * named(t, revisesAt),
  });
  // The checks that depend on the model, compiled again one after another.
  ys.forEach((y, i) =>
    link(DOC_X + DOC[0] / 2 + 12, MID, CHK - 38, y, {
      route: "hvh",
      mid: (DOC_X + DOC[0] / 2 + CHK) / 2,
      alpha: k,
      draw: { t, at: checksAt + 0.05 + 0.15 * i },
      flow: flowClock(t, i / 3),
      flowEvery: FLOW_EVERY,
    }),
  );
  checkGroup(t, CHK, ys, { alpha: k, at: compileAt });
  nameText(DEP, CHK + 46, MID, {
    align: "left",
    width: 280,
    alpha: k,
  });
  nameText(COMPILE, CHK, below, {
    valign: "top",
    alpha: a * named(t, compileAt),
  });
  ctx.restore();
}

/* 08.8, third: the one model, and beside it the ways around it, each refused on its words. The refusals are one
 * left-aligned list, each name carrying its cross one fixed gap after it, as every refused name of the film does. The
 * picture stands centred on the model and the first two refusals, which hold most of the thought, and glides as one to
 * centre on all three as the third, the widest, is said. */
export function noWayAround(s, t, a) {
  if (a <= 0) return;
  const ats = cues(s, [
    ["不加例外", "No exception"],
    ["旁路", "side path"],
    ["第二套定义", "second definition"],
  ]);
  const refused = [
    L("例外", "Exception"),
    L("旁路", "Side path"),
    L("第二套定义", "Second definition"),
  ];
  // Each refusal is linked straight across from the model's edge to its name.
  const NX = 1130,
    MX = 540,
    reach = (n) => NX + Math.max(...refused.slice(0, n).map((v) => measure(v))) + 16 + 26,
    S2 = 960 - (MX + reach(2)) / 2,
    S3 = 960 - (MX + reach(3)) / 2,
    S = mix(S2, S3, glideShare(t, ats[2] + 0.05, Math.abs(S3 - S2), 0.7)),
    MY = 375,
    MW = 420,
    MH = 250,
    rows = [MY + 40, MY + MH / 2, MY + MH - 40],
    edge = [MX + MW + 8, MX + MW + 0.9 * (MW / 4) + 14, MX + MW + 8];
  ctx.save();
  ctx.translate(S, 0);
  modelGrid(MX, MY, MW, MH, { alpha: a, cell: [3, 1], lit: 1, grow: 1 });
  // The third, said as the column glides, is struck once its way is whole and the column has settled, so its name
  // stands at full ink while its way draws on.
  const settled =
    ats[2] + 0.05 + Math.max(glideTime(Math.abs(S3 - S2), 0.7), drawTime(NX - 16 - edge[2], 0.5));
  refused.forEach((v, i) =>
    rejectedName(v, NX, rows[i], {
      align: "left",
      alpha: a * named(t, ats[i]),
      mark: ramp(t, i === 2 ? Math.max(ats[2] + 0.3, settled) : ats[i] + 0.3, 0.4),
      set: "08.8:refused",
    }),
  );
  // Each dashed way draws on as every stroke's tip does, at most 820 px/s.
  rows.forEach((y, i) =>
    link(edge[i], y, NX - 16, y, {
      alpha: a * named(t, ats[i]) * 0.9,
      upto: drawShare(t, ats[i] + 0.05, NX - 16 - edge[i], 0.5),
      dash: [6, 6],
      end: false,
    }),
  );
  ctx.restore();
}

/* A lane of work: its folder, its track, and the points of work on it: a point held at `held`, or points flowing on
 * the flow clock `flow` (flowClock), from the flow clock `since`. */
function workLane(x0, x1, y, { alpha = 1, flow = null, since = -Infinity, held = null, gate = null } = {}) {
  if (alpha < 0.01) return;
  folderIcon(x0, y - 26, 62, 52, { alpha });
  link(x0 + 70, y, x1, y, { alpha, end: false });
  if (gate !== null) writeGate(gate, y, 92, { alpha, open: 0, single: true });
  if (held !== null) dot(held, y, 10, { color: P.ink, alpha });
  // Three points of work stand on the track at a time, evenly spaced, each at the film's flow pace.
  if (flow !== null)
    flowAlong(
      [
        [x0 + 80, y],
        [x1, y],
      ],
      flow,
      10,
      { every: (x1 - x0 - 80) / FLOW_PACE / 3, since, color: P.ink, alpha },
    );
}

/* 08.8, last: meanwhile two lanes: the changes that depend on the concept wait at a closed gate under the model being
 * revised, linked to it, and the work unrelated to it keeps flowing below. Each lane's outcome is named on the lane's
 * own axis, one gap after its track. Until the second lane comes, the first stands alone, centred on the frame from its
 * folder to its outcome; the whole picture glides as the second arrives, so the finished picture, from the lanes'
 * folders to the name of the work going on, is centred on the frame. */
export function meanwhile(s, t, a) {
  if (a <= 0) return;
  const [dependAt, waitAt, otherAt, onAt] = cues(s, [
    ["依赖这个概念的改动", "changes that depend on that idea"],
    ["先停下", "wait"],
    ["和它无关的工作", "work unrelated to it"],
    ["照常进行", "goes on as usual"],
  ]);
  // The lanes are named by what they carry, the outcomes by what happens to them.
  const DEPEND = L("依赖它的改动", "Dependent changes"),
    WAIT = L("先停下", "Wait"),
    OTHER = L("和它无关的工作", "Unrelated work"),
    ON = L("照常进行", "Goes on as usual"),
    Y1 = 520,
    Y2 = 670,
    GATE = 1200,
    // Where each lane's track ends, and the gap from a track's end to its outcome's name.
    END1 = 1260,
    END2 = 1420,
    OUT = 20,
    first = Math.max(GATE + 70, END1 + OUT + measure(WAIT), 600 + nameWidth(DEPEND, 420)),
    right = Math.max(first, END2 + OUT + measure(ON), 600 + measure(OTHER)),
    S = mix(960 - (520 + first) / 2, 960 - (520 + right) / 2, glideShare(t, otherAt + 0.05, (right - first) / 2, 0.7)),
    d = a * named(t, dependAt),
    o = a * named(t, otherAt);
  ctx.save();
  ctx.translate(S, 0);
  // The two tracks differ in length, so they are read as two lanes rather than two items of one list.
  workLane(520, END1, Y1, {
    alpha: d,
    gate: GATE,
    held: mix(700, 1140, glideShare(t, dependAt + 0.1, 1140 - 700, 1.4)),
  });
  // The model the changes wait on stands over the gate's near post, linked down to it, so gate and model are one mark.
  modelGrid(GATE - 130, 300, 200, 112, { alpha: d, cell: [3, 1], lit: 1, grow: 1 });
  link(GATE - 30, 418, GATE - 30, Y1 - 50, {
    alpha: d,
    draw: { t, at: dependAt + 0.05 },
    end: false,
  });
  nameText(DEPEND, 600, Y1 - 40, {
    align: "left",
    valign: "bottom",
    width: 420,
    alpha: d,
  });
  nameText(WAIT, END1 + OUT, Y1, {
    align: "left",
    alpha: a * named(t, waitAt),
  });
  // The work on the second lane sets off from its folder as the lane arrives, so it flows in under the lane's name.
  workLane(520, END2, Y2, { alpha: o, flow: flowClock(t), since: flowClock(otherAt - 0.15) });
  nameText(OTHER, 600, Y2 + 40, {
    align: "left",
    valign: "top",
    alpha: o,
  });
  nameText(ON, END2 + OUT, Y2, {
    align: "left",
    alpha: a * named(t, onAt),
  });
  ctx.restore();
}

/* 08.9. The goal stands as a level over the records it keeps free of duplicates, under its words, and is not
 * relaxed: a lock at its end holds it. It can change only by an explicit, authorized realignment of intent, drawn as the
 * link from the authority's seal up to the lock; lowering the level quietly so a result passes is refused, the quiet
 * lower level dashed and crossed. The goal's words, the stem and the records stand on the level's axis; each name
 * under the level is centred on what it names: the refusal on its dashed level, "not relaxed" between the stem and
 * the authority's link, and the realignment under the person and the seal that make it. */
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
    LOCK = x1 + 20,
    // The level and its lock, whose outline reaches 17 px either side of it.
    AXIS = (x0 + LOCK + 17) / 2,
    PX = 1322,
    PY = 624,
    al = a * named(t, alignAt),
    q = a * named(t, quietAt),
    sink = glideShare(t, quietAt + 0.05, 60, 1.0),
    flow = flowClock(t);
  line(x0, LY, x1, LY, { color: P.ink, alpha: a, width: 5 });
  lock(LOCK, LY, { alpha: a, color: P.ink });
  nameText(L("不能多出重复记录", "No duplicate records"), AXIS, LY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, goalAt),
  });
  nameText(L("目标", "The goal"), x0 - 24, LY, { align: "right", alpha: a * named(t, keptAt) });
  // The records the goal keeps free of duplicates, under the level.
  link(AXIS, 482, AXIS, LY + 12, { alpha: a, flow });
  resultCard(AXIS, 545, 4, { alpha: a, w: 170, h: 120 });
  nameText(L("没有放宽", "Not relaxed"), (AXIS + LOCK) / 2, LY + 28, {
    valign: "top",
    width: 300,
    alpha: a * named(t, notAt),
  });
  // The only way the goal changes: an explicit, authorized realignment, from the authority's seal up to the lock.
  person(PX, PY, { size: 1.2, alpha: al });
  seal(LOCK, 620, 22, { alpha: al, color: P.ink });
  link(LOCK, 594, LOCK, LY + 22, { alpha: al, draw: { t, at: alignAt + 0.05 }, flow });
  nameText(
    L("经授权重新对齐意图", "Authorized intent alignment"),
    (PX - 28 + LOCK + 22) / 2,
    rowNameTop([PY + 22.7 * 1.2, 620 + 22]),
    {
      valign: "top",
      width: 380,
      alpha: al,
    },
  );
  // A quiet lowering of the level's start, refused.
  const low = LY + mix(50, 110, sink);
  line(x0 + 20, low, 800, low, { color: P.line, alpha: q, width: 4, dash: [10, 9] });
  rejectedName(L("悄悄放宽", "Silently loosened"), (x0 + 20 + 800) / 2, low + 36, {
    alpha: q,
    mark: ramp(t, quietAt + 0.5, 0.4),
  });
}
