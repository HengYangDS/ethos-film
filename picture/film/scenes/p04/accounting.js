/* Part 04, rule one tested and bounded (04.5-04.6): positive and negative examples test how the Change has been
 * understood, and the one-line summary fails the second; every constraint of the original words is accounted for;
 * only what a person has confirmed and accepted is compiled into checks by fixed rules, which repeats exactly but cannot
 * prove the understanding right; and conversations, memories and summaries are only leads. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { labelSize, measure, stroke } from "../../drawing/strokes.js";
import { check, cross, documentIcon, person, seal, stopSign } from "../../drawing/symbols.js";
import { bubble, kernelIcon, layersIcon } from "../../drawing/workspace.js";
import { beats, listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, termRow } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { QUOTE } from "./example.js";
import { card, linkSet, recordRows, valueCell, verdictMark } from "./marks.js";
import { ruleOneHeading } from "./rule-one.js";

/* An example card: two records; in the second example the second record carries a corrected value. */
const EX_W = 260,
  EX_H = 104;
function exampleCard(x, y, corrected, a) {
  card(x - EX_W / 2, y, EX_W, EX_H, { alpha: a });
  const rx = x - EX_W / 2 + 34,
    rw = EX_W - 68;
  recordRows(rx, y + 36, rw, corrected ? [0] : [0, 1], { alpha: a });
  if (!corrected) return;
  // The correction: the same code and date, and a new value.
  recordRows(rx, y + 36, rw * 0.62, [1], { alpha: a });
  const [v0, v1] = valueCell(rx, rw);
  stroke(
    () => {
      ctx.moveTo(v0, y + 72);
      ctx.lineTo(v1, y + 72);
    },
    { color: P.ink, alpha: a, width: 4 },
  );
}

/* 04.5 The examples: an exact repeat goes and a correction to the same stock on the same day stays, each card named
 * on its words with its verdict, a cross or a check before it; the summary is tried against both and fails the second
 * at a stop, and the corrected value flashes as it is saved. The heading centres on the frame from its first word,
 * its qualifier under it, and the cards' names stand 40 px under the heading wherever its lines end. */
export function examplesStage(s, t, c, g) {
  const bottom = ruleOneHeading(t, c, g),
    heading = termRow(
      t,
      L(["正例和反例"], ["Positive and negative examples"]),
      [c.examples],
      L(["来考一考对它的理解"], ["test how it has been understood"]),
      [c.understood],
      960,
      bottom + 50,
      { alpha: g, align: "center" },
    ),
    em = labelSize(LABEL),
    // The cards' names stand one gap above them and 40 px under the heading.
    Y = heading.bottom + 40 + em + NAME_GAP,
    X1 = 960 - 280,
    X2 = 960 + 280,
    vy = Y + 72,
    q = (voiceTime(t) * 0.5) % 1;
  // The repeat: its second record is struck as it goes.
  const one = g * named(t, c.exact),
    goes = soon(t, c.goes + 0.05, 0.5),
    gone = g * named(t, c.goes);
  exampleCard(X1, Y, false, one);
  stroke(
    () => {
      ctx.moveTo(X1 - EX_W / 2 + 26, vy);
      ctx.lineTo(mix(X1 - EX_W / 2 + 26, X1 + EX_W / 2 - 26, goes), vy);
    },
    { color: P.ink, alpha: g * ramp(t, c.goes - 0.15, 0.3), width: 3 },
  );
  nameText(L("一模一样的重复", "Exact repeat"), X1, Y - NAME_GAP, { valign: "bottom", alpha: one });
  // The two verdicts stand alike: a mark one gap right of the card, its word after it.
  cross(X1 + EX_W / 2 + NAME_GAP + 12, vy, 20, { color: P.ink, alpha: gone, width: 3.5 });
  nameText(L("要去掉", "goes"), X1 + EX_W / 2 + NAME_GAP + 36, vy, { align: "left", alpha: gone });
  // The correction: its new value is kept, with a check, and saved once the summary fails it. Its name and qualifier
  // arrive together, so they share one line, centred on the card on the baseline of the first card's name.
  const two = g * named(t, c.correction),
    stays = g * named(t, c.stays);
  exampleCard(X2, Y, true, two);
  termRow(
    t,
    L(["同一只股票的更正"], ["A correction"]),
    [c.correction],
    L(["同一天"], ["same stock, same day"]),
    [c.correction],
    X2,
    Y - NAME_GAP - em,
    { alpha: g, align: "center", inline: true },
  );
  check(X2 + EX_W / 2 + NAME_GAP + 12, vy, 22, { color: P.ink, alpha: stays });
  nameText(L("要留下", "stays"), X2 + EX_W / 2 + NAME_GAP + 36, vy, {
    align: "left",
    alpha: stays,
  });
  // Saved: the corrected value itself flashes once the summary has failed it.
  const [v0, v1] = valueCell(X2 - EX_W / 2 + 34, EX_W - 68);
  beats(t, (v0 + v1) / 2, vy, 22, [c.saved], { alpha: g });
  // The summary, the understanding under test, stands below; tried against both examples, it fails the second, at a
  // stop on its way there.
  const qy = Y + 280,
    qw = measure(QUOTE()) + 56,
    tried = g * named(t, c.quote2),
    draw = soon(t, c.quote2 + 0.05, 0.6);
  card(960 - qw / 2, qy - 32, qw, 64, { alpha: g, color: P.ink });
  nameText(QUOTE(), 960, qy, { alpha: g });
  linkSet(
    [
      [960 - qw / 2 + 40, qy - 32, X1, Y + EX_H, "vhv"],
      [960 + qw / 2 - 40, qy - 32, X2, Y + EX_H, "vhv"],
    ],
    { alpha: tried, upto: draw, flow: q },
  );
  const fails = g * named(t, c.fails),
    sy = (Y + EX_H + qy - 32) / 2;
  stopSign(X2, sy, 18, { color: P.ink, alpha: fails });
  nameText(L("过不了第二个例子", "Fails that second example"), X2 + 18 + NAME_GAP, sy, {
    align: "left",
    alpha: fails,
  });
}

/* 04.6 Every relevant constraint of the original words is accounted for: each row of the original is linked to one of
 * three dispositions, built as a list on their words. */
export function constraintsStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names = L(
      ["留下", "经授权明确排除", "标明还没解决"],
      ["Kept", "Excluded by an authorized decision", "Marked as unresolved"],
    ),
    kinds = ["pass", "cross", "unknown"],
    ats = [c.kept, c.excluded, c.unresolved],
    CW = 280,
    CH = 190,
    nw = Math.max(...names.map((v) => measure(v))),
    W = CW + 150 + 26 + NAME_GAP + nw,
    CX = 960 - W / 2,
    CY = 470,
    rows = [0, 1, 2].map((i) => CY + 50 + i * 45);
  card(CX, CY, CW, CH, { alpha: g });
  recordRows(CX + 36, rows[0], CW - 72, [0, 1, 2], { step: 45, alpha: g, color: P.ink });
  nameText(L("原话", "The original words"), CX + CW / 2, CY - NAME_GAP, {
    valign: "bottom",
    alpha: g,
  });
  termRow(
    t,
    L(["每一条约束"], ["Every relevant constraint"]),
    [c.constraint],
    L(["都要有个交代"], ["accounted for"]),
    [c.accounted],
    CX + CW / 2,
    CY + CH + NAME_GAP,
    { alpha: g, align: "center" },
  );
  const MX = CX + CW + 150;
  names.forEach((v, i) => {
    const on = g * ramp(t, ats[i] - 0.15, 0.4);
    link(CX + CW - 20, rows[i], MX - 30, rows[i], { alpha: on, upto: soon(t, ats[i] + 0.05, 0.4) });
    if (kinds[i] === "cross") cross(MX, rows[i], 22, { color: P.ink, alpha: on, width: 3.5 });
    else verdictMark(kinds[i], MX, rows[i], 17, { alpha: on });
    nameText(v, MX + 26 + NAME_GAP, rows[i], {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "dispositions",
    });
  });
}

/* 04.6 What is compiled: the interpretation stays open to challenge; only what a person has confirmed and accepted
 * passes, sealed, into the kernel, which compiles it by fixed rules into checks. The same input gives the same checks
 * again, but a dashed relation from the checks back to the interpretation is refused: they cannot prove it right. The
 * four stand at one pitch with their names centred under them on one line, the two names above the row share one
 * line over its tallest marks, and the refused relation crosses at the middle of the row, under the same input. */
export function compileStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const Y = 580,
    xs = [430, 784, 1138, 1492],
    mid = (xs[0] + xs[3]) / 2,
    under = Y + 64 + NAME_GAP,
    over = Y - 64 - NAME_GAP,
    q = (voiceTime(t) * 0.45) % 1;
  // The interpretation: a card with an open question.
  const meant = g * named(t, c.interpretation);
  documentIcon(xs[0] - 50, Y - 64, 100, 128, { alpha: meant, rows: 3 });
  verdictMark("unknown", xs[0] + 78, Y - 72, 20, { alpha: meant });
  const names = [
    termRow(
      t,
      L(["理解"], ["The interpretation"]),
      [c.interpretation],
      L(["可以被质疑"], ["open to challenge"]),
      [c.challenge],
      xs[0],
      under,
      { alpha: g, align: "center" },
    ),
  ];
  // Confirmed and accepted by a person: the seal is stamped on the words.
  const who = g * named(t, c.confirmed);
  person(xs[1], Y - 6, { alpha: who, size: 1.2 });
  // The seal touches the figure's head, so the two read as one mark under one name.
  seal(xs[1] + 32, Y - 46, 16, { color: P.ink, alpha: who, stamp: g * ramp(t, c.accepted, 0.4) });
  names.push(
    nameText(L("人确认过、采纳了", "Confirmed and accepted"), xs[1], under, {
      valign: "top",
      width: 260,
      alpha: who,
    }),
  );
  link(xs[0] + 70, Y, xs[1] - 44, Y, { alpha: who });
  // Compiled by fixed rules: the kernel turns while it compiles and on the repeat.
  const rules = g * named(t, c.compiled);
  kernelIcon(xs[2], Y, 50, {
    alpha: rules,
    color: P.ink,
    beat: ramp(t, c.compiled, 0.3) * (1 - ramp(t, c.compiled + 0.6, 0.4)),
  });
  link(xs[1] + 44, Y, xs[2] - 52, Y, { alpha: rules, flow: q });
  names.push(
    termRow(
      t,
      L(["按固定的规则编译"], ["Compiled"]),
      [c.compiled],
      L([], ["by fixed rules"]),
      [c.fixed],
      xs[2],
      under,
      { alpha: g, align: "center" },
    ),
  );
  // The checks, one column; the same input yields them again, each lighting in turn.
  const made = g * named(t, c.checks);
  link(xs[2] + 52, Y, xs[3] - 40, Y, { alpha: made });
  stroke(
    () => {
      for (let k = 0; k < 3; k++) {
        const cy = Y - 44 + k * 44;
        ctx.moveTo(xs[3] - 14, cy);
        ctx.lineTo(xs[3] - 4, cy + 10);
        ctx.lineTo(xs[3] + 16, cy - 12);
      }
    },
    { color: P.ink, alpha: made, width: 3.5 },
  );
  beats(t, xs[3], Y, 64, [c.sameChecks], { alpha: g });
  names.push(nameText(L("检查", "Checks"), xs[3], under, { valign: "top", alpha: made }));
  nameText(L("同样的输入", "The same input"), mid, over, {
    valign: "bottom",
    alpha: g * named(t, c.sameInput),
  });
  nameText(L("同样的检查", "The same checks"), xs[3], over, {
    valign: "bottom",
    alpha: g * named(t, c.sameChecks),
  });
  // The checks cannot prove the interpretation right: the relation back to it is dashed and refused. It runs 47 px
  // under the lowest name of the row.
  const refused = g * named(t, c.cannot),
    ry = Math.max(...names.map((v) => v.bottom)) + 47;
  link(xs[3], ry, xs[0], ry, {
    alpha: refused,
    dash: [8, 9],
    upto: soon(t, c.cannot + 0.05, 0.6),
    route: "straight",
  });
  cross(mid, ry, 20, { color: P.ink, alpha: refused, width: 3 });
  nameText(L("证明不了", "Cannot prove"), mid, ry + NAME_GAP + 6, {
    valign: "top",
    alpha: refused,
  });
}

/* 04.6 Only leads: a conversation, a memory and a summary build as a list, then step back as leads. */
export function leadsStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names = L(["对话", "记忆", "总结"], ["Conversations", "Memories", "Summaries"]),
    ats = [c.talk, c.memory, c.summaries],
    xs = [960 - 300, 960, 960 + 300],
    Y = 620,
    back = mix(1, 0.58, soon(t, c.leads + 0.05, 0.5));
  ats.forEach((at, i) => {
    const on = g * ramp(t, at - 0.15, 0.4) * back;
    if (i === 0) bubble(xs[i], Y, 40, { alpha: on, color: P.ink });
    else if (i === 1) layersIcon(xs[i], Y, 110, 90, { alpha: on });
    else documentIcon(xs[i] - 40, Y - 52, 80, 104, { alpha: on, rows: 3 });
    nameText(names[i], xs[i], Y + 52 + NAME_GAP, {
      valign: "top",
      alpha: g * listIn(t, ats, i) * back,
      set: "leads",
    });
  });
  nameText(L("只能当线索", "Only leads"), 960, Y - 52 - NAME_GAP - 20, {
    valign: "bottom",
    alpha: g * named(t, c.leads),
  });
}
