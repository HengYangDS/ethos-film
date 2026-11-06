/* 03.3-03.5 The trust kernel: what it takes in and gives out, how long each of these lasts, and the attestation, the
 * one thing it keeps, with the scope outside which it does not count. */

import { paper, papers } from "../p02/drift.js";
import { ctx } from "../../canvas.js";
import { writeGate } from "../../drawing/lanes.js";
import { flowAlong, flowClock, link } from "../../drawing/links.js";
import {
  box,
  dot,
  fill,
  labelSize,
  line,
  measure,
  stroke,
} from "../../drawing/strokes.js";
import { check, cross, person, seal } from "../../drawing/symbols.js";
import { folderIcon, kernelIcon } from "../../drawing/workspace.js";
import { listIn, listLevel, named, speaking } from "../../naming/lists.js";
import {
  LEADING,
  NAME_GAP,
  NOTE,
  growName,
  growTexts,
  nameText,
  termRow,
  termRowLayout,
} from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { glideShare, glideSteps, voiceTime } from "../../timing/pauses.js";

/* 03.3 A small trust kernel supports the path: the path at the top, the kernel under it on its words. Its three inputs
 * stand at its left, each linked to it on its words: the accepted intent, the fresh facts, the attestations on record.
 * By fixed rules it compiles a plan; at the moment it writes, the write passes a gate that checks again; and what it
 * observed, decided and did becomes a new attestation, which returns to the inputs.
 *
 * Layout. The diagram is balanced on what is on screen and moves as one unit. While the path and the kernel stand with
 * the inputs' places, it stands centred by its finished extent, from the inputs' names to the loop that returns the
 * new attestation; as the first input is said it glides right, centring the inputs' names with the path, which ends
 * past the gate; as the record is announced it glides back to its finished place, so the record arrives there. The
 * inputs' names end on one edge, the English intent's qualifier under its term. The names under the kernel, the plan,
 * the gate and the new attestation hang from one baseline, one gap under the tallest of them, the kernel; the gate is
 * named by the moment it stands for, 写入 / "The moment it writes", and what it does then, checks again, joins under
 * that name on its words. What the kernel records stands over the new attestation, one clause to a line, each line
 * centred on it, and grows upward from one gap over it as its clauses are said; the loop turns down clear of the
 * new attestation's name and runs back under the gate's. */
const KERNEL = { IX: 560, KX: 860, PX: 1180, GX: 1380, SX: 1620 };
/* The shift that centres the extent from x0 to x1 on the frame. */
export const centring = (x0, x1) => 960 - (x0 + x1) / 2;
export function stageKernel(t, a, c) {
  if (a <= 0) return;
  const PY = 380,
    KY = 560,
    KR = 54,
    ys = [440, 560, 680],
    LOOP = 780,
    q = flowClock(t);
  const inputNames = L(
      ["已经采纳的意图", "刚观察到的事实", "留下的存证"],
      ["Intent", "Fresh facts", "Attestations"],
    ),
    intentQual = ["that has been accepted"],
    // The attestation is first shown here, before 03.5 explains it, so it carries under its name what it states.
    attQual = [L("谁出具、在哪儿成立", "who verified it, where it holds")],
    inputsWide = Math.max(
      ...inputNames.map((v) => measure(v)),
      en ? measure(intentQual.join(""), NOTE) : 0,
      measure(attQual.join(""), NOTE),
    );
  // What the kernel records: each clause on its own line, a part carrying the space before it.
  const parts = L(
      ["看到了什么、", "判断了什么、", "做了什么"],
      ["What it observed,", " what it decided", " and what it did"],
    ),
    recordWidth = Math.max(...parts.map((v) => measure(v.trim()))) + 1,
    recordWide = Math.max(
      ...growTexts(parts, recordWidth).map((r) => measure(r.map(([, v]) => v).join(""))),
    );
  const gateName = L(["写入"], ["The moment", " it writes"]),
    newName = L("新的存证", "New attestations"),
    loopX = KERNEL.SX + Math.max(120, measure(newName) / 2 + 24),
    left = KERNEL.IX - 34 - NAME_GAP - inputsWide,
    right = Math.max(loopX + 1.25, KERNEL.SX + recordWide / 2),
    // The path runs over the diagram from above the inputs to past the gate, so until the record arrives the diagram
    // ends at the path's end.
    pathFrom = KERNEL.KX - 260,
    pathTo = KERNEL.GX + 90,
    whole = centring(left, right),
    dx = glideSteps(t, whole, [
      [c.in1, centring(left, pathTo + 7)],
      [c.recCut, whole],
    ]);
  const IX = KERNEL.IX + dx,
    KX = KERNEL.KX + dx,
    PX = KERNEL.PX + dx,
    GX = KERNEL.GX + dx,
    SX = KERNEL.SX + dx,
    RX = loopX + dx,
    NX = IX - 34 - NAME_GAP,
    namesTop = rowNameTop([KY + KR, KY + 45, KY + 50, KY + 34]);
  // The path as 03.2 left it, and the kernel under it from the cut; its clause names it soon after. The kernel beats
  // while it is said to take its inputs, and again while it compiles its plan.
  line(pathFrom + dx, PY, pathTo + dx, PY, { color: P.ink, alpha: a, width: 3 });
  dot(pathTo + dx, PY, 7, { color: P.ink, alpha: a });
  kernelIcon(KX, KY, KR, {
    alpha: a,
    color: P.ink,
    beat: Math.max(speaking(t, [c.takes], 0), speaking(t, [c.plan], 0)),
    turn: 0.1 * voiceTime(t),
  });
  link(KX, KY - KR, KX, PY + 3, { alpha: a, end: false });
  nameText(L("很小的信任内核", "A small trust kernel"), KX, namesTop, {
    valign: "top",
    alpha: a * named(t, L(c.kernel - 0.55, c.kCut)),
  });
  // The inputs, each with its mark, named at its left and linked to the kernel round its name. Each input draws on its
  // own words with its name; no place stands open for it before, since an empty place would wait for its name.
  const ats = [c.in1, c.in2, c.in3];
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
          ].forEach(([ox, oy]) => {
            ctx.moveTo(IX + ox + 7, y + oy);
            ctx.arc(IX + ox, y + oy, 7, 0, Math.PI * 2);
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
  // An input with a qualifier sets its term on its mark's line, as every input's name stands, and the qualifier under
  // it, so no term leaves the inputs' lines for the baseline of the names under the kernel.
  const qualified = (i, term, termAt, qual, qualAt) =>
    termRow(t, [term], [termAt], qual, [qualAt], NX, ys[i] - labelSize(LABEL) / 2, {
      width: 360,
      inline: false,
      align: "right",
      alpha: a * listLevel(t, ats, i),
      set: "inputs",
    });
  if (en) qualified(0, inputNames[0], c.in1, intentQual, c.in1q);
  else
    nameText(inputNames[0], NX, ys[0], {
      align: "right",
      alpha: a * listIn(t, ats, 0),
      set: "inputs",
    });
  nameText(inputNames[1], NX, ys[1], {
    align: "right",
    alpha: a * listIn(t, ats, 1),
    set: "inputs",
  });
  qualified(2, inputNames[2], c.in3, attQual, c.in3);
  // By fixed rules, a plan; the gate that checks again at the moment of writing; the new attestation, which returns to
  // the inputs round the names under the diagram.
  const rules = a * ramp(t, c.rules - 0.15, 0.4),
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
  nameText(L("一份计划", "A plan"), PX + 35, namesTop, {
    valign: "top",
    alpha: a * named(t, c.plan),
  });
  link(PX + 70, KY, GX - 30, KY, { alpha: gate, upto: soon(t, c.writeAt + 0.05, 0.4) });
  writeGate(GX, KY, 100, {
    alpha: gate,
    color: P.ink,
    single: true,
    open: glideShare(t, c.check + 0.3, 60, 0.6),
  });
  termRow(t, gateName, [c.gateName], [L("再核对一遍", "checks again")], [c.check], GX, namesTop, {
    width: 200,
    alpha: a,
    align: "center",
  });
  link(GX + 30, KY, SX - 34, KY, { alpha: rec, upto: soon(t, c.rec1 + 0.05, 0.4) });
  seal(SX, KY, 34, { color: P.ink, alpha: rec, stamp: stamped });
  // The record grows from its place over the new attestation: its last line stands one gap over the seal, and in the
  // half second before each next line's words the lines already there lift one line, so the new line arrives in its
  // place under them and the record never stands away from what it names.
  const recordAts = [c.rec1, c.rec2, c.rec3],
    lift =
      labelSize(LABEL) *
      LEADING *
      growTexts(parts, recordWidth)
        .slice(1)
        .reduce((v, line) => v + 1 - soon(t, recordAts[line[0][0]] - 0.5, 0.5), 0);
  growName(t, parts, recordAts, SX, KY - 34 - NAME_GAP + lift, {
    width: recordWidth,
    valign: "bottom",
    align: "center",
    alpha: a,
    build: true,
  });
  nameText(newName, SX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.newAtt),
  });
  // The loop draws on in two legs, the second from where the first ends, as the first completes.
  const back = soon(t, c.newAtt + 0.05, 0.25);
  link(SX + 34, KY, RX, LOOP, { route: "hv", alpha: stamped, upto: back, end: false });
  link(RX, LOOP, IX, ys[2] + 28, {
    route: "hv",
    alpha: stamped,
    upto: soon(t, c.newAtt + 0.3, 0.3),
    flow: q,
  });
}

/* 03.4 These things last for different lengths of time: three rows over one stroke of lines, named by the heading from
 * the cut. Intent stays, one bar from its Change, which copies drop from each time the kernel compiles it; facts are
 * marks seen afresh, a window of them passing that never stays; plans end, one carried out and one discarded, and are
 * not kept, and a new one is compiled again. Each row's marks touch its line, so the rows are one mark with the
 * lines; a point runs along each row once its term is said. The lines stand centred on the frame; the heading shares
 * their left edge with the rows' terms, one line height above the first term, so it heads the rows rather than the
 * intent's folder under the frame's centre; the qualifiers stand in one column one em after the widest term. */
export function stageLifetimes(t, a, c) {
  if (a <= 0) return;
  const ys = [440, 590, 740],
    X0 = 290,
    X1 = 1630,
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
  // Each row's term over the left of its line, its qualifier joining it on its words.
  const rows = [
      [[L("意图", "Intent")], [c.intent], [L("一份正式变更", "one official Change")], [c.change]],
      [
        [L("刚观察到的事实", "Fresh facts")],
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
    ],
    termTops = rows.map(([term, , qual], i) => ys[i] - 14 - termRowLayout(term, qual, 640).height);
  nameText(
    L("寿命不一样", "Different lengths of time"),
    X0,
    termTops[0] - labelSize(LABEL) * LEADING,
    {
      align: "left",
      valign: "bottom",
      alpha: a * named(t, L(c.lifetimes - 0.25, c.lifetimes)),
    },
  );
  // A point runs along each row from the cut, while the voice speaks: the rows' time passing.
  ys.forEach((y, i) =>
    flowAlong(
      [
        [X0 + 20, y],
        [X1 - 20, y],
      ],
      flowClock(t, i * 0.33),
      6,
      { single: true, color: P.ink, alpha: a },
    ),
  );
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
    alpha: p1 * gone * ramp(t, c.carried + 0.35, 0.4),
    width: 3.5,
  });
  cross(M0 + 500, ys[2], 22, {
    color: P.ink,
    alpha: p2 * gone * ramp(t, c.discarded + 0.35, 0.4),
    width: 3.5,
  });
  line(M0 + 560, ys[2], M0 + 560 + 100 * soon(t, c.again2, 0.6), ys[2], {
    color: P.ink,
    alpha: p3,
    width: 6,
  });
  // The qualifiers on the terms' lines stand in one column, one em after the widest term, so no qualifier runs on
  // from its term.
  const qualLeft =
    X0 + Math.max(...rows.map(([term]) => measure(term.join("")))) + labelSize(LABEL);
  rows.forEach(([term, termAts, qual, qualAts], i) => {
    termRow(t, term, termAts, qual, qualAts, X0, termTops[i], {
      width: 640,
      alpha: a * listLevel(t, starts, i),
      set: "lifetimes",
      build: true,
      qualLeft,
    });
  });
}

/* 03.5 The kernel keeps one thing for the long term: from the cut the kernel at the left, and over the place of what
 * it keeps, "for the long term" on its words; what it keeps, a card with its seal, the attestation, arrives whole with
 * its name, linked from the kernel, so no empty card or hollow seal waits for it. Its two fields fill in on their
 * words, who verified it and where it holds, and its scope is drawn around it, a thin solid outline, since the film
 * keeps dashes for what is unknown, missing or refused; someone later checks it from below; a copy outside the scope,
 * named by where it stands, fades and is struck as its verdict joins that name. The kernel and the heading stand
 * centred until the card comes; the picture then glides to centre the kernel and its card with the scope, and as the
 * copy is said it glides as one to centre the whole; the copy stands 100 px outside the scope. The heading stands one
 * gap above the card, then above the scope, which it lifts clear of in the half second before the scope arrives:
 * Chinese sets it on one line, 长期留下的存证, the attestation's name joining it on its words; English sets "For the
 * long term" over "The attestation", and a first line that would stand alone 1.5 s or more takes the second line's
 * place until that line's name joins it. The kernel's and the copy's names stand on one baseline; the reader and its
 * check are named from one left edge. English says the attestation's name 2.3 s into the thought, so its card comes
 * 0.45 s ahead of the name, keeping the kernel and the heading alone under 2 s. */
export function stageScope(t, a, c) {
  if (a <= 0) return;
  // The card pads its content equally on both sides: 24 px, the seal, 24 px, the fields, 24 px. The kernel stands
  // 520 px left of the card's centre, so the kernel and the card under its one-line Chinese heading cover a tenth of
  // the band before the scope arrives.
  const K0 = 480,
    kernelName = L("内核", "The kernel"),
    outsideName = L("范围之外", "Outside that scope"),
    voidName = L("就不算数", "does not count"),
    fieldNames = L(["谁出具的", "范围"], ["Who verified it", "Where it holds"]),
    head = L(["长期留下的", "存证"], ["For the long term", "The attestation"]),
    W = 24 + 72 + 24 + Math.max(...fieldNames.map((v) => measure(v))) + 24,
    scopeEnd = 1000 + W / 2 + 40,
    copyAt = scopeEnd + 100,
    left = Math.min(K0 - 44, K0 - measure(kernelName) / 2),
    right = Math.max(
      copyAt + 180,
      copyAt + 90 + Math.max(measure(outsideName), measure(voidName, NOTE)) / 2,
    ),
    cardAt = c.att - L(0.15, 0.45),
    // Before the attestation's name joins it, the heading reaches as far as its first part does.
    headRight = 1000 + L(measure(head.join("")) / 2 - measure(head[1]), measure(head[0]) / 2),
    dx = glideSteps(t, centring(left, headRight), [
      [cardAt, centring(left, scopeEnd)],
      [c.outside, centring(left, right)],
    ]);
  const CX = 1000 + dx,
    CY = 520,
    H = 150,
    KX = K0 + dx,
    namesTop = rowNameTop([CY + 44, CY + 50]),
    headBottom = CY - H / 2 - NAME_GAP - 40 * soon(t, c.scope - 0.5, 0.5),
    joins = c.att - c.longTerm >= 1.5 ? soon(t, c.att - 0.5, 0.5) : 1,
    card = a * ramp(t, cardAt, 0.4),
    q = flowClock(t);
  kernelIcon(KX, CY, 44, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText(kernelName, KX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.aCut + 0.1),
  });
  link(KX + 44 * 0.87, CY, CX - W / 2, CY, {
    alpha: card,
    upto: soon(t, cardAt + 0.05, 0.4),
    flow: q,
  });
  box(CX - W / 2, CY - H / 2, W, H, { stroke: P.ink, alpha: card, radius: 14, width: 2.5 });
  seal(CX - W / 2 + 60, CY, 36, { color: P.ink, alpha: card, stamp: card });
  // The card is named over its scope, outside the boundary drawn round it, each part of the heading on its words.
  if (en) {
    nameText(head[0], CX, headBottom - labelSize(LABEL) * LEADING * joins, {
      valign: "bottom",
      alpha: a * named(t, c.longTerm),
    });
    nameText(head[1], CX, headBottom, { valign: "bottom", alpha: a * named(t, c.att) });
  } else
    growName(t, head, [c.longTerm, c.att], CX, headBottom, {
      valign: "bottom",
      align: "center",
      alpha: a,
      build: true,
    });
  // Each field is named on its own words: the Chinese field 范围 on that word, inside its clause.
  const fields = [c.who, c.scopeName];
  fieldNames.forEach((v, i) =>
    nameText(v, CX - W / 2 + 120, CY - 28 + 56 * i, {
      align: "left",
      alpha: a * listIn(t, fields, i),
      set: "fields",
    }),
  );
  const scope = a * ramp(t, c.scope - 0.15, 0.4),
    bottom = CY + H / 2 + 40;
  box(CX - W / 2 - 40, CY - H / 2 - 40, W + 80, H + 80, {
    stroke: P.line,
    alpha: scope,
    radius: 26,
    width: 2,
  });
  // Someone later checks it, from below its scope.
  const later = a * ramp(t, c.reader - 0.15, 0.4),
    RY = CY + 260,
    RX = CX + 30 + NAME_GAP;
  person(CX, RY, { size: 1.0, alpha: later });
  link(CX, RY - 34, CX, bottom + 2, {
    alpha: later,
    upto: soon(t, c.reader + 0.05, 0.5),
    flow: q,
    end: false,
  });
  nameText(L("后来的人", "Someone"), RX, RY - 6, {
    align: "left",
    alpha: a * named(t, c.reader),
  });
  nameText(L("回头去查", "Check it later"), RX, (RY - 34 + bottom) / 2, {
    align: "left",
    alpha: a * named(t, c.later),
  });
  // A copy outside the scope does not count; its seal is smaller than every ring here, so it is read as the copy's.
  // It is named by where it stands, and its verdict joins under that name on its words, with its cross.
  const copy = a * ramp(t, c.outside - 0.15, 0.4),
    void_ = ramp(t, c.notCount - 0.15, 0.4);
  box(copyAt + dx, CY - 50, 180, 100, {
    stroke: P.ink,
    alpha: copy * mix(1, 0.6, void_),
    radius: 12,
    width: 2.5,
  });
  seal(copyAt + 40 + dx, CY, 18, { color: P.ink, alpha: copy * mix(1, 0.6, void_) });
  cross(copyAt + 130 + dx, CY, 26, { color: P.ink, alpha: copy * void_, width: 3.5 });
  termRow(t, [outsideName], [c.outside], [voidName], [c.notCount], copyAt + 90 + dx, namesTop, {
    width: 400,
    alpha: a,
    align: "center",
  });
}
