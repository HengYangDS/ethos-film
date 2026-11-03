/* 03.3-03.5 The trust kernel: what it takes in and gives out, how long each of these lasts, and the attestation, the
 * one thing it keeps, with the scope outside which it does not count. */

import { paper, papers } from "../p02/drift.js";
import { ctx } from "../../canvas.js";
import { writeGate } from "../../drawing/lanes.js";
import { link } from "../../drawing/links.js";
import { box, dot, fill, flowDot, line, measure, stroke } from "../../drawing/strokes.js";
import { check, cross, person, seal } from "../../drawing/symbols.js";
import { folderIcon, kernelIcon } from "../../drawing/workspace.js";
import { listIn, listLevel, named, speaking } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  growName,
  growTexts,
  nameText,
  termRow,
  termRowLayout,
} from "../../naming/names.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* A term row whose right edge stands at `right`, centred on `y`. */
function termRowRight(t, term, termAts, qual, qualAts, right, y, o = {}) {
  const width = o.width ?? 360,
    { one, height } = termRowLayout(term, qual, width),
    termW = measure(term.join("")),
    qualW = Math.max(
      ...growTexts(qual, width, NOTE).map((r) => measure(r.map(([, v]) => v).join(""), NOTE)),
    ),
    wide = one ? termW + 16 + qualW : Math.max(termW, qualW);
  termRow(t, term, termAts, qual, qualAts, right - wide, y - height / 2, { ...o, width });
}

/* 03.3 A small trust kernel supports the path: the path at the top, the kernel under it on its words. Its three inputs
 * stand at its left, each linked to it on its words: the accepted intent, the fresh facts, the attestations on record.
 * By fixed rules it compiles a plan; at the moment it writes, the write passes a gate that checks again; and what it
 * observed, decided and did becomes a new attestation, which returns to the inputs. */
export function stageKernel(t, a, c) {
  if (a <= 0) return;
  const PY = 380,
    KX = 860,
    KY = 560,
    KR = 54,
    q = (voiceTime(t) * 0.45) % 1;
  // The path as 03.2 left it, and the kernel under it from the cut; its clause names it soon after.
  line(600, PY, 1440, PY, { color: P.ink, alpha: a, width: 3 });
  dot(1440, PY, 7, { color: P.ink, alpha: a });
  kernelIcon(KX, KY, KR, {
    alpha: a,
    color: P.ink,
    beat: speaking(t, [c.plan], 0),
    turn: 0.1 * voiceTime(t),
  });
  link(KX, KY - KR, KX, PY + 3, { alpha: a, end: false });
  nameText(L("很小的信任内核", "A small trust kernel"), KX, KY + KR + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, L(c.kernel - 0.55, c.kCut)),
  });
  // The inputs, each with its mark, named at its left and linked to the kernel round its name.
  const ats = [c.in1, c.in2, c.in3],
    ys = [440, 560, 680],
    IX = 560,
    NX = IX - 34 - NAME_GAP;
  ats.forEach((at, i) => {
    const on = a * ramp(t, at - 0.15, 0.4),
      y = ys[i];
    if (on < 0.01) return;
    if (i === 0) paper(IX - 32, y - 40, 64, 80, { alpha: on, rows: 3 });
    if (i === 1)
      fill(
        () =>
          [
            [-16, -12],
            [14, -16],
            [-8, 12],
            [16, 12],
          ].forEach(([dx, dy]) => {
            ctx.moveTo(IX + dx + 7, y + dy);
            ctx.arc(IX + dx, y + dy, 7, 0, Math.PI * 2);
          }),
        { color: P.ink, alpha: on },
      );
    if (i === 2) seal(IX, y, 28, { color: P.ink, alpha: on });
    link(IX + 34, y, KX - KR * 0.87, KY + (i - 1) * 24, {
      route: "hvh",
      mid: KX - KR - 120,
      alpha: on,
      upto: soon(t, at + 0.05, 0.5),
      flow: q,
    });
  });
  if (en)
    termRowRight(t, ["Intent"], [c.in1], ["that has been accepted"], [c.in1q], NX, ys[0], {
      alpha: a * listLevel(t, ats, 0),
      set: "inputs",
    });
  else
    nameText("已经采纳的意图", NX, ys[0], {
      align: "right",
      alpha: a * listIn(t, ats, 0),
      set: "inputs",
    });
  [1, 2].forEach((i) =>
    nameText(
      L(["刚观察到的事实", "留下的存证"], ["Fresh facts", "Attestations"])[i - 1],
      NX,
      ys[i],
      {
        align: "right",
        alpha: a * listIn(t, ats, i),
        set: "inputs",
      },
    ),
  );
  // By fixed rules, a plan; the gate that checks again at the moment of writing; the new attestation, which returns to
  // the inputs round the names under the diagram.
  const PX = 1180,
    GX = 1380,
    SX = 1620,
    rules = a * ramp(t, c.rules - 0.15, 0.4),
    plan = a * ramp(t, c.plan - 0.15, 0.4),
    gate = a * ramp(t, c.writeAt - 0.15, 0.4),
    rec = a * ramp(t, c.rec1 - 0.15, 0.4),
    stamped = a * ramp(t, c.newAtt - 0.15, 0.4);
  link(KX + KR * 0.87, KY, PX, KY, { alpha: rules, upto: soon(t, c.rules + 0.05, 0.6), flow: q });
  nameText(L("按固定的规则", "By fixed rules"), (KX + KR * 0.87 + PX) / 2, KY - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.rules),
  });
  paper(PX, KY - 45, 70, 90, { alpha: plan, rows: 4 });
  nameText(L("一份计划", "A plan"), PX + 35, KY + 45 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.plan),
  });
  link(PX + 70, KY, GX - 30, KY, { alpha: gate, upto: soon(t, c.writeAt + 0.05, 0.4) });
  writeGate(GX, KY, 100, {
    alpha: gate,
    color: P.ink,
    single: true,
    open: soon(t, c.check + 0.3, 0.6),
  });
  nameText(L("再核对一遍", "Checks again"), GX, KY + 50 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.check),
  });
  link(GX + 30, KY, SX - 34, KY, { alpha: rec, upto: soon(t, c.rec1 + 0.05, 0.4) });
  seal(SX, KY, 34, { color: P.ink, alpha: rec, stamp: stamped });
  const parts = L(
      ["看到了什么、", "判断了什么、", "做了什么"],
      ["What it observed, ", "what it decided ", "and what it did"],
    ),
    widest = Math.max(...growTexts(parts, 560).map((r) => measure(r.map(([, v]) => v).join("")))),
    left = Math.min(SX - widest / 2, 1800 - widest);
  growName(t, parts, [c.rec1, c.rec2, c.rec3], left, KY - 34 - 30, {
    width: 560,
    valign: "bottom",
    alpha: a,
    build: true,
  });
  nameText(L("新的存证", "New attestations"), SX, KY + 34 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.newAtt),
  });
  const back = soon(t, c.newAtt + 0.05, 0.25);
  link(SX + 34, KY, 1790, 780, { route: "hv", alpha: stamped, upto: back, end: false });
  link(1790, 780, IX, ys[2] + 28, {
    route: "hv",
    alpha: stamped * (back >= 1 ? 1 : 0),
    upto: soon(t, c.newAtt + 0.3, 0.3),
    flow: q,
  });
}

/* 03.4 These things last for different lengths of time: three rows over one stroke of lines, named by the heading from
 * the cut. Intent stays, one bar from its Change, which copies drop from each time the kernel compiles it; facts are
 * marks seen afresh, a window of them passing that never stays; plans end, one carried out and one discarded, and are
 * not kept, and a new one is compiled again. Each row's marks touch its line, so the rows are one mark with the
 * lines; a point runs along each row once its term is said. */
export function stageLifetimes(t, a, c) {
  if (a <= 0) return;
  const ys = [440, 590, 740],
    X0 = 300,
    X1 = 1640,
    M0 = 960,
    starts = [c.intent, c.facts, c.planRow];
  // The rows' time lines, one ink stroke from the cut, named by the heading over them.
  stroke(
    () =>
      ys.forEach((y) => {
        ctx.moveTo(X0, y);
        ctx.lineTo(X1, y);
      }),
    { color: P.ink, alpha: a * 0.7, width: 2.5 },
  );
  nameText(L("寿命不一样", "Different lengths of time"), 960, ys[0] - 70, {
    valign: "bottom",
    alpha: a * named(t, L(c.lifetimes - 0.25, c.lCut + 0.15)),
  });
  // A point runs along each row from the cut, while the voice speaks: the rows' time passing.
  ys.forEach((y, i) => {
    const q = (voiceTime(t) * 0.18 + i * 0.33) % 1;
    flowDot(mix(X0 + 20, X1 - 20, q), y, 6, q, {
      color: P.ink,
      alpha: a,
    });
  });
  // Intent: kept in one Change, a bar that runs the rest of the row; a copy compiled from it each time it is needed.
  const kept = a * ramp(t, c.change - 0.15, 0.4);
  folderIcon(M0 - 4, ys[0] - 44, 56, 44, { alpha: a * ramp(t, c.intent - 0.15, 0.4) });
  line(M0 + 52, ys[0], X1, ys[0], { color: P.ink, alpha: kept, width: 6 });
  papers(
    [1160, 1380, 1580].map((x) => [x - 12, ys[0] + 6, 24, 30, 2]),
    a * ramp(t, c.afresh - 0.15, 0.4),
  );
  // Facts: a passing window of fresh marks, none of which stays.
  const facts = a * ramp(t, c.facts - 0.15, 0.4),
    w = (voiceTime(t) * 0.25) % 1;
  if (facts > 0.01)
    stroke(
      () => {
        for (let k = 0; k < 13; k++) {
          const x = M0 + 20 + k * 52,
            d = Math.abs(k / 12 - w);
          if (Math.min(d, 1 - d) > 0.14) continue;
          ctx.moveTo(x, ys[1] - 18);
          ctx.lineTo(x, ys[1]);
        }
      },
      { color: P.ink, alpha: facts, width: 3 },
    );
  // Plans: two that end, carried out and discarded, then not kept; another compiled again.
  const p1 = a * ramp(t, c.carried - 0.15, 0.4),
    p2 = a * ramp(t, c.discarded - 0.15, 0.4),
    gone = 1 - 0.6 * ramp(t, c.notKept - 0.15, 0.4),
    p3 = a * ramp(t, c.again2 - 0.15, 0.4);
  stroke(
    () => {
      if (p1 > 0.01) {
        ctx.moveTo(M0 + 40, ys[2]);
        ctx.lineTo(M0 + 40 + 180 * soon(t, c.carried, 0.5), ys[2]);
      }
      if (p2 > 0.01) {
        ctx.moveTo(M0 + 300, ys[2]);
        ctx.lineTo(M0 + 300 + 180 * soon(t, c.discarded, 0.5), ys[2]);
      }
    },
    { color: P.ink, alpha: Math.max(p1, p2) * gone, width: 6 },
  );
  check(M0 + 240, ys[2] - 4, 26, {
    color: P.ink,
    alpha: p1 * gone * soon(t, c.carried + 0.4, 0.3),
    width: 3.5,
  });
  cross(M0 + 500, ys[2], 22, {
    color: P.ink,
    alpha: p2 * gone * soon(t, c.discarded + 0.4, 0.3),
    width: 3.5,
  });
  line(M0 + 560, ys[2], M0 + 560 + 100 * soon(t, c.again2, 0.6), ys[2], {
    color: P.ink,
    alpha: p3,
    width: 6,
  });
  // Each row's term over the left of its line, its qualifier joining it on its words.
  const rows = [
    [[L("意图", "Intent")], [c.intent], [L("一份正式变更", "one official Change")], [c.change]],
    [
      [L("事实", "Facts")],
      [c.facts],
      L(["每次都重新去看，", "从不存下来"], ["observed again every time, ", "never stored"]),
      [c.again, c.never],
    ],
    [
      [L("计划", "A plan")],
      [c.planRow],
      L(["要么执行，", "要么作废"], ["carried out ", "or discarded"]),
      [c.carried, c.discarded],
    ],
  ];
  rows.forEach(([term, termAts, qual, qualAts], i) => {
    const { height } = termRowLayout(term, qual, 640);
    termRow(t, term, termAts, qual, qualAts, X0, ys[i] - 14 - height, {
      width: 640,
      alpha: a * listLevel(t, starts, i),
      set: "lifetimes",
      build: true,
    });
  });
}

/* 03.5 The kernel keeps one thing for the long term: from the cut the kernel at the left, linked to what it keeps, a
 * card with its seal, the attestation. Its two fields fill in on their words, who verified it and where it holds, and
 * its scope is drawn around it; someone later checks it from below; a copy outside the scope fades and is struck: it
 * does not count. */
export function stageScope(t, a, c) {
  if (a <= 0) return;
  const CX = 1000,
    CY = 540,
    W = L(300, 380),
    H = 150,
    KX = 600,
    q = (voiceTime(t) * 0.4) % 1;
  kernelIcon(KX, CY, 44, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText(L("内核", "The kernel"), KX, CY + 44 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.aCut + 0.1),
  });
  link(KX + 44 * 0.87, CY, CX - W / 2, CY, { alpha: a, flow: q });
  nameText(L("长期留下的", "For the long term"), CX, 320, { alpha: a * named(t, c.aCut + 0.15) });
  box(CX - W / 2, CY - H / 2, W, H, { stroke: P.ink, alpha: a, radius: 14, width: 2.5 });
  seal(CX - W / 2 + 60, CY, 36, { color: P.ink, alpha: a, stamp: a * ramp(t, c.att - 0.15, 0.4) });
  // The card is named over its scope, outside the boundary drawn round it.
  nameText(L("存证", "The attestation"), CX, CY - H / 2 - 40 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.att),
  });
  const fields = [c.who, c.scope];
  L(["谁出具的", "范围"], ["Who verified it", "Where it holds"]).forEach((v, i) =>
    nameText(v, CX - W / 2 + 120, CY - 28 + 56 * i, {
      align: "left",
      alpha: a * listIn(t, fields, i),
      set: "fields",
    }),
  );
  const scope = a * ramp(t, c.scope - 0.15, 0.4),
    bottom = CY + H / 2 + 40;
  box(CX - W / 2 - 40, CY - H / 2 - 40, W + 80, H + 80, {
    stroke: P.ink,
    alpha: scope * 0.85,
    radius: 26,
    width: 2.5,
    dash: [9, 8],
  });
  // Someone later checks it, from below its scope.
  const later = a * ramp(t, c.reader - 0.15, 0.4),
    RY = 800;
  person(CX, RY, { size: 1.0, alpha: later });
  link(CX, RY - 34, CX, bottom + 2, {
    alpha: later,
    upto: soon(t, c.reader + 0.05, 0.5),
    flow: q,
    end: false,
  });
  nameText(L("后来的人", "Someone"), CX + 30 + NAME_GAP, RY - 6, {
    align: "left",
    alpha: a * named(t, c.reader),
  });
  nameText(L("回头去查", "Check it later"), CX + 12 + NAME_GAP, (RY - 34 + bottom) / 2, {
    align: "left",
    alpha: a * named(t, c.later),
  });
  // A copy outside the scope does not count; its seal is smaller than every ring here, so it is read as the copy's.
  const copy = a * ramp(t, c.outside - 0.15, 0.4),
    void_ = ramp(t, c.notCount - 0.15, 0.4);
  box(1400, CY - 50, 180, 100, {
    stroke: P.ink,
    alpha: copy * mix(1, 0.6, void_),
    radius: 12,
    width: 2.5,
  });
  seal(1440, CY, 18, { color: P.ink, alpha: copy * mix(1, 0.6, void_) });
  cross(1530, CY, 26, { color: P.ink, alpha: copy * void_, width: 3.5 });
  nameText(L("就不算数", "Does not count"), 1490, CY + 50 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.notCount),
  });
}
