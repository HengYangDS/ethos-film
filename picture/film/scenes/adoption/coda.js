/* 18 back to the two lines. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { pipelineMark, signalMark } from "../../drawing/examples.js";
import { link } from "../../drawing/links.js";
import { modelGrid } from "../../drawing/models.js";
import { dot, line, measure, path, ring, stroke, text } from "../../drawing/strokes.js";
import { documentIcon, seal } from "../../drawing/symbols.js";
import { TWO_LINES } from "../../drawing/two-lines.js";
import { askIcon } from "../../drawing/workspace.js";
import { illustrative } from "../../framing/chapters.js";
import { listLevel, named, speaking } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  TERM_GAP,
  growName,
  nameText,
  termRow,
  termRowLayout,
} from "../../naming/names.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* The opening's two lines, level: one neutral stroke for the pair, over which each line takes its colour when its own
 * name is said. */
function s18Lines({ alpha = 1, upper = 1, lower = 1 } = {}) {
  const { x0, x1, y1, y2 } = TWO_LINES;
  if (alpha < 0.01) return;
  stroke(
    () => {
      ctx.moveTo(x0, y1);
      ctx.lineTo(x1, y1);
      ctx.moveTo(x0, y2);
      ctx.lineTo(x1, y2);
    },
    { color: P.muted, alpha, width: 4 },
  );
  if (upper > 0.01) line(x0, y1, x1, y1, { color: P.authority, alpha: alpha * upper, width: 4 });
  if (lower > 0.01) line(x0, y2, x1, y2, { color: P.evidence, alpha: alpha * lower, width: 4 });
  dot(x1, y1, 7, { color: blend(P.muted, P.authority, upper), alpha });
  dot(x1, y2, 7, { color: blend(P.muted, P.evidence, lower), alpha });
}
/* A rule's width as termRow sets it: the term and its qualifier on one line, or the wider of the two on two lines. */
function s18RowWidth(term, qual, width) {
  const { one } = termRowLayout(term, qual, width);
  return one
    ? measure(term.join("")) + TERM_GAP + measure(qual.join(""), NOTE)
    : Math.max(measure(term.join("")), measure(qual.join(""), NOTE));
}
scenes["18"] = function (s, t) {
  const [underAt, dirAt, realAt, corrAt] = cues(s, [
    ["理解给行动", "Understanding gives"],
    ["给行动指出方向", "gives action"],
    ["实际的结果", "real outcomes"],
    ["又回过头来修正", "come back to correct"],
  ]);
  const rulesCut = cue(s, "ETHOS 的设计", "The design of ETHOS");
  const ruleAts = cues(s, [
    ["一是", "Preserve meaning"],
    ["二是", "make a distinction"],
    ["三是", "Keep authority"],
    ["四是", "retire a mechanism"],
  ]);
  const judgment = en ? cue(s, "", "of judgment") : null;
  const qualAts = cues(s, [
    ["留住含义", "with the smallest model"],
    ["做区分", "only where it changes"],
    ["看得到", "because seeing"],
    ["就让它退场", "when its obligation"],
  ]);
  const [apartAt, goneAt] = cues(s, [
    ["跟决定权分开", "separate from views"],
    ["退场", "is gone"],
  ]);
  const [doneAt, pipeAt, resAt, askAt] = cues(s, [
    ["照这样做的话", "Done this way"],
    ["可以检验的改进", "an improvement"],
    ["结论成立的条件", "the conditions under"],
    ["去追问", "to question"],
  ]);
  const [newAt, knownAt, learnedAt, startAt] = cues(s, [
    ["新的问题出现时", "When a new problem"],
    ["已有的理解", "what was understood"],
    ["学到的东西", "what was learned"],
    ["作为起点", "a place to start"],
  ]);
  const [goAt, openAt] = cues(s, [
    ["项目可以接着做下去", "The project can"],
    ["方法也始终可以修改", "the method stays"],
  ]);
  const stageA = stageOut(t, rulesCut),
    stageB = stageIn(t, rulesCut) * stageOut(t, doneAt),
    stageC = stageIn(t, doneAt) * stageOut(t, newAt),
    stageD = stageIn(t, newAt) * stageOut(t, goAt),
    stageE = stageIn(t, goAt);
  const { x0, x1, y1, y2 } = TWO_LINES,
    q = (voiceTime(t) * 0.35) % 1,
    Y = (y1 + y2) / 2;
  // 1. The opening's two lines return, level and quiet under their shared name; each comes to full ink with its own
  // name. Understanding sends a point down toward action, and what comes back corrects the understanding.
  if (stageA > 0) {
    s18Lines({
      alpha: stageA,
      upper: ramp(t, underAt - 0.15, 0.4),
      lower: ramp(t, realAt - 0.15, 0.4),
    });
    nameText(L("开头那两条线", "The opening's two lines"), 960, Y, {
      alpha: stageA * named(t, s.voice_start),
    });
    nameText(L("理解", "Understanding"), x0 - NAME_GAP, y1, {
      align: "right",
      color: P.authority,
      alpha: stageA * named(t, underAt),
    });
    nameText(L("实际的结果", "Real outcomes"), x0 - NAME_GAP, y2, {
      align: "right",
      color: P.evidence,
      alpha: stageA * named(t, realAt),
    });
    const dn = stageA * ramp(t, dirAt - 0.15, 0.4),
      up = stageA * ramp(t, corrAt - 0.15, 0.4),
      XA = 700,
      XB = 1220;
    link(XA, y1, XA, y2, {
      alpha: dn,
      upto: soon(t, dirAt, 0.6),
      color: P.authority,
      flow: (voiceTime(t) * 0.5) % 1,
      width: 3,
    });
    nameText(L("指出方向", "Gives direction"), XA - 18, Y, {
      align: "right",
      alpha: stageA * named(t, dirAt),
    });
    link(XB, y2, XB, y1, {
      alpha: up,
      upto: soon(t, corrAt, 0.6),
      color: P.evidence,
      flow: (voiceTime(t) * 0.5 + 0.5) % 1,
      width: 3,
    });
    nameText(L("回过头来修正", "Comes back to correct"), XB + 18, Y, {
      align: "left",
      alpha: stageA * named(t, corrAt),
    });
  }
  // 2. Four plain rules, each a term with its condition: the rows stand as one dashed ladder from the words that announce
  // them, and each fills in on its own words. A zh edition speaks them across two thoughts, an en one in a single breath.
  if (stageB > 0) {
    const ys = [340, 450, 560, 670],
      W = en ? 620 : 520;
    const terms = en
      ? [
          ["Preserve meaning"],
          ["Distinguish only"],
          ["Keep authority separate from views"],
          ["Retire a mechanism"],
        ]
      : [["最小够用的模型"], ["只在影响行动的地方"], ["视图只管展示"], ["责任结束的机制"]];
    const quals = en
      ? [
          ["with the smallest sufficient model"],
          ["where it changes what we do"],
          ["because seeing is not permission"],
          ["once its obligation is gone"],
        ]
      : [["留住含义"], ["做区分"], ["看得到，不等于有权去做"], ["就让它退场"]];
    const widest = Math.max(...terms.map((term, i) => s18RowWidth(term, quals[i], W))),
      GX = Math.round(960 - (72 + NAME_GAP + widest) / 2 + 36);
    if (en) {
      const head = ["Four plain rules", " of judgment"],
        w = measure(head.join(""));
      growName(t, head, [rulesCut, judgment], Math.round(960 - w / 2), 258, {
        valign: "middle",
        alpha: stageB,
        color: P.authority,
        build: true,
      });
    } else nameText("几条朴素的准则", 960, 258, { color: P.authority, alpha: stageB });
    line(960 - 150, 284, 960 + 150, 284, { color: P.authority, alpha: stageB, width: 2.5 });
    stroke(
      () => ys.forEach((y) => ctx.roundRect(GX - 56, y - 46, 112 + NAME_GAP + widest + 40, 92, 12)),
      { color: P.muted, alpha: stageB, width: 3, dash: [8, 8] },
    );
    ruleAts.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4),
        c = blend(P.ink, P.authority, speaking(t, ruleAts, i)),
        y = ys[i];
      ring(GX, y, 36, { color: c, alpha: on, width: 2.5 });
      if (i === 0) modelGrid(GX - 20, y - 15, 40, 30, { alpha: on, color: c });
      if (i === 1) {
        line(GX, y - 20, GX, y + 20, { color: c, alpha: on, width: 3 });
        dot(GX - 12, y, 5, { color: c, alpha: on });
        dot(GX + 12, y, 5, { color: c, alpha: on });
      }
      // The view and what it shows part as the rule keeps them separate.
      if (i === 2) {
        const d = 12 * soon(t, apartAt, 0.5);
        ring(GX - d, y, 13, { color: c, alpha: on, width: 2.5 });
        dot(GX + d, y, 5, { color: c, alpha: on });
      }
      // The retiring mark leaves its ring's centre as the rule says it is gone.
      if (i === 3) {
        const dx = 10 * soon(t, goneAt, 0.6);
        stroke(
          () => {
            ctx.moveTo(GX - 16 + dx, y);
            ctx.lineTo(GX + 10 + dx, y);
            ctx.moveTo(GX + 2 + dx, y - 9);
            ctx.lineTo(GX + 12 + dx, y);
            ctx.lineTo(GX + 2 + dx, y + 9);
          },
          { color: c, alpha: on, width: 3 },
        );
      }
      const { height } = termRowLayout(terms[i], quals[i], W);
      termRow(t, terms[i], [at], quals[i], [qualAts[i]], GX + 36 + NAME_GAP, y - height / 2, {
        width: W,
        alpha: stageB * listLevel(t, ruleAts, i),
        set: "rules",
      });
    });
  }
  // 3. The two examples, each with what it would leave behind: an improvement that can be verified, and a conclusion with
  // its conditions written down for the next study to question.
  if (stageC > 0) {
    const LX = 520,
      RX = 1400,
      CY = 430,
      pi = stageC * ramp(t, pipeAt - 0.15, 0.4),
      re = stageC * ramp(t, resAt - 0.15, 0.4);
    pipelineMark(LX, CY, 680, { alpha: stageC, flow: q });
    signalMark(RX, CY, 680, 180, { alpha: stageC, seen: 1, marker: 1 });
    nameText(L("行情数据管线", "Market-data pipeline"), LX, CY - 90 - NAME_GAP - 8, {
      valign: "bottom",
      alpha: stageC,
      set: "examples",
    });
    nameText(L("选股信号", "Stock-selection signal"), RX, CY - 90 - NAME_GAP - 8, {
      valign: "bottom",
      alpha: stageC,
      set: "examples",
    });
    seal(LX - 200, CY + 150, 34, { alpha: pi, color: P.evidence });
    nameText(
      L("可以检验的改进", "An improvement that can be verified"),
      LX - 200 + 34 + 16,
      CY + 150,
      { align: "left", width: 420, alpha: stageC * named(t, pipeAt), color: P.evidence },
    );
    documentIcon(RX - 240, CY + 110, 62, 80, { alpha: re, rows: 3, stroke: P.authority });
    askIcon(RX - 240 - 34, CY + 145, 18, { alpha: stageC * ramp(t, askAt - 0.15, 0.4) });
    nameText(
      L("写明结论成立的条件", "The conditions its conclusion needs"),
      RX - 240 + 62 + 16,
      CY + 150,
      { align: "left", width: 420, alpha: stageC * named(t, resAt), color: P.authority },
    );
    illustrative(stageC);
  }
  // 4. A new problem arrives where the lines end. What was understood and what was learned come to full ink on their
  // words, and the place where both lines end is where the new work starts.
  if (stageD > 0) {
    s18Lines({
      alpha: stageD,
      upper: ramp(t, knownAt - 0.15, 0.4),
      lower: ramp(t, learnedAt - 0.15, 0.4),
    });
    text("?", x1 + 130, Y + 2, 72, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageD,
    });
    nameText(L("新的问题", "A new problem"), x1 + 130, Y + 60, {
      valign: "top",
      width: 200,
      color: P.unknown,
      alpha: stageD,
    });

    nameText(L("已有的理解", "What was understood"), x0, y1 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      color: P.authority,
      alpha: stageD * named(t, knownAt),
    });
    nameText(L("学到的东西", "What was learned"), x0, y2 + NAME_GAP, {
      align: "left",
      valign: "top",
      color: P.evidence,
      alpha: stageD * named(t, learnedAt),
    });
    const st = stageD * ramp(t, startAt - 0.15, 0.4);
    line(x1, y1, x1, mix(y1, y2, soon(t, startAt - 0.1, 0.5)), {
      color: P.authority,
      alpha: st,
      width: 3,
    });
    link(x1 + 80, Y, x1 + 2, Y, {
      alpha: st,
      color: P.line,
      end: false,
      upto: soon(t, startAt + 0.1, 0.4),
    });
    nameText(L("起点", "A place to start"), x1 - NAME_GAP, Y, {
      align: "right",
      color: P.authority,
      alpha: stageD * named(t, startAt),
    });
  }
  // 5. The lines keep going, and the method around them stays open: its ring is never closed.
  if (stageE > 0) {
    const reach = soon(t, goAt, 1.6),
      ex = mix(x1, 1740, reach),
      CX = 960,
      CY = 500;
    path(
      [
        [x0, y1],
        [ex, y1],
      ],
      { color: P.authority, alpha: stageE, width: 4 },
    );
    path(
      [
        [x0, y2],
        [ex, y2],
      ],
      { color: P.evidence, alpha: stageE, width: 4 },
    );
    dot(ex, y1, 7, { color: P.authority, alpha: stageE });
    dot(ex, y2, 7, { color: P.evidence, alpha: stageE });
    line(x1, y1, x1, y2, { color: P.authority, alpha: stageE, width: 3 });
    nameText(L("项目接着做下去", "The project keeps going"), x0, y1 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      alpha: stageE,
    });
    const op = stageE * ramp(t, openAt - 0.15, 0.4);
    ring(CX, CY, 70, {
      color: P.authority,
      alpha: op,
      width: 3,
      upto: 0.84,
      start: -Math.PI * 0.3,
    });
    nameText(L("方法始终可以修改", "The method stays open"), CX + 70 + NAME_GAP, CY, {
      align: "left",
      color: P.authority,
      alpha: stageE * named(t, openAt),
    });
  }
};
