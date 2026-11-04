/* 09 one origin, two passages, one boundary: back to the opening sentence, now bound to its attestations, judged by
 * the three conditions the rules give rather than by who said it; and the close, the whole ETHOS mark, each part
 * named on its words and the cinnabar datum last. */

import { link } from "../../drawing/links.js";
import { ethosMark, markExtent } from "../../drawing/mark.js";
import { box, flowDot, labelSize, line, measure, ring } from "../../drawing/strokes.js";
import { agent, check, seal } from "../../drawing/symbols.js";
import { askIcon, commitDot } from "../../drawing/workspace.js";
import { clearOfTitle, illustrative } from "../../framing/chapters.js";
import { listIn, named } from "../../naming/lists.js";
import { LEADING, NAME_GAP, NOTE, nameText, rejectedName, wrapName } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { STAGE_CUT, stageIn, stageOut } from "../../timing/stages.js";
import { CLAIM_DATUM, CLAIM_H, claimPanel, claimWidth } from "../claim.js";
import { nameWidth } from "../p07/example.js";
import { scenes } from "../registry.js";

/* 09.1-09.2. The opening sentence returns as it began: said by its Agent, which stands below it and to its left, its
 * link rising and turning into the panel as in 01, the two centred on the frame. In ETHOS the sentence has to come with
 * attestations behind it: on the words that name ETHOS's way the picture steps left and a link draws out from the
 * sentence's datum while that clause is said, reaching the attestations' seal as they are named, so nothing stands
 * waiting at its end. Then each thing they let one look up arrives on its words, in rows fanned from the seal, and what
 * can all be looked up stands apart below them, the predicate of the three rows rather than a fourth: under a rule that
 * closes the rows, half a row further down than a next row would, and starting at the markers' edge rather than the
 * rows' text. The names under the chain, the seal's and the question put later under the sentence, stand on one
 * baseline under the sentence's panel. Each state is centred on the frame: the sentence with its Agent, the chain to
 * the seal, and the finished picture to the longest row, so the stage only ever moves one way. */
const BOUND_X = 700,
  // The datum's link ends this far right of the panel's centre, where the seal stands.
  BOUND_RUN = 440,
  // The Agent stands below the panel's left end, its link rising to the panel's left edge, as in 01, low enough that
  // the sentence and its Agent alone fill the band's height as the reviewers measure a thought's picture.
  AGENT_DX = 70,
  AGENT_DY = 270,
  // English hangs its rows 20 px nearer the seal than Chinese; the seal's longer name still keeps clear of the trunk.
  FAN = () => L(210, 190),
  // The rows stand a pitch apart that keeps the seal's name, under the middle row, clear of the last row's line.
  BOUND_ROWS = [385, 470, 555],
  SEAL_NAME = () => L("存证", "Attestations"),
  ATTESTED = () => [
    L("哪一次提交", "The commit"),
    L("核验了什么", "What the proof checked"),
    L("哪里还没有结果", "What still has no result"),
  ];
/* How far the sentence's picture reaches left of the panel's centre: the Agent's outline below its left end. */
const boundLeft = () => -claimWidth() / 2 - AGENT_DX - 40;
/* Where the sentence stands once its attestations have come: the finished picture, from the Agent to the longest row,
 * is centred on the frame. 09.3 takes the sentence up from here. */
export const boundShift = () =>
  960 -
  (2 * BOUND_X +
    boundLeft() +
    BOUND_RUN +
    FAN() +
    30 +
    Math.max(...ATTESTED().map((v) => measure(v)))) /
    2;
function bound(s, t, a) {
  if (a <= 0) return;
  const [beganAt, doneAt, wayAt, sealAt, commitAt, provedAt, openAt, lookAt, trustAt] = cues(s, [
    ["开头那句", "where we began"],
    ["做完了", "Done"],
    ["按 ETHOS 的做法", "In ETHOS"],
    ["存证", "attestations"],
    ["哪一次提交", "which commit it means"],
    ["核验了什么", "what the proof checked"],
    ["哪里还没有结果", "what still has no result"],
    ["都找得到", "can all be looked up"],
    ["这句话能不能信", "can be trusted"],
  ]);
  // The sentence with its Agent centred; then the chain to the seal, its name included; then the finished picture.
  const W = claimWidth(),
    alone = 960 - BOUND_X - (boundLeft() + W / 2 + CLAIM_DATUM) / 2,
    chain =
      960 - BOUND_X - (boundLeft() + BOUND_RUN + 36 + Math.max(26, measure(SEAL_NAME()) / 2)) / 2,
    off = mix(
      mix(alone, chain, soon(t, wayAt + 0.05, 0.9)),
      boundShift(),
      soon(t, commitAt + 0.05, 0.9),
    ),
    PX = BOUND_X + off,
    Y = 470,
    AX = PX - W / 2 - AGENT_DX,
    AY = Y + AGENT_DY,
    // The question's top, at its gap under the panel; the seal's name shares its baseline.
    under = Y + CLAIM_H / 2 + 18,
    clear = a * clearOfTitle(s, t, Y - 60),
    way = a * ramp(t, wayAt - 0.15, 0.5),
    at = a * named(t, sealAt),
    end = PX + BOUND_RUN,
    rows = BOUND_ROWS,
    ats = [commitAt, provedAt, openAt],
    flow = (voiceTime(t) * 0.4) % 1;
  agent(AX, AY, { size: 1.5, alpha: clear });
  // The Agent's link carries a point to the sentence while the voice speaks, and ends in its quiet point there.
  link(AX, AY - 33, PX - W / 2 - 6, Y, { route: "vh", alpha: clear, flow });
  const {
    datum: [dx, dy],
  } = claimPanel(t, PX, Y, { alpha: clear, words: clear * named(t, doneAt) });
  // English names where the sentence began as its clause begins, so the thought is named in its first second.
  nameText(L("开头的那句话", "Where we began"), PX, Y - CLAIM_H / 2 - 44, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: clear * ramp(t, beganAt - (en ? 0.6 : 0.15), 0.4),
  });
  // The question whether the sentence can be trusted is put while it still stands with its attestations, and rises
  // with it when the judgement takes the picture.
  nameText(L("能不能信", "Can it be trusted?"), PX, under, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: clear * named(t, trustAt),
  });
  // ETHOS's way: the datum's link draws out while its clause is said and reaches the seal as the attestations are
  // named, its quiet point arriving under the seal.
  const drawn = soon(t, wayAt + 0.05, Math.max(0.9, sealAt - wayAt));
  link(dx + 16, dy, end, dy, { alpha: way, upto: drawn, flow: drawn >= 1 ? flow : null });
  nameText(L("ETHOS 的做法", "In ETHOS"), (dx + end) / 2, dy - 22, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: way,
  });
  // Its attestations at the link's end, and each thing they let one look up. The seal's name hangs on the question's
  // baseline under the panel: a name's alphabetic baseline stands its face's ascent below its top (0.88 em in the CJK
  // face, 0.78 em in the Latin), so the seal's larger name starts higher by that share of the difference in size.
  const x = end + FAN();
  seal(end + 36, dy, 26, { alpha: at, color: P.ink });
  nameText(SEAL_NAME(), end + 36, under - L(0.88, 0.78) * (labelSize(LABEL) - labelSize(NOTE)), {
    valign: "top",
    alpha: at,
  });
  rows.forEach((y, i) => {
    const r = a * named(t, ats[i]);
    link(end + 66, dy, x - 24, y, {
      route: "hvh",
      mid: x - 30,
      alpha: r,
      upto: soon(t, ats[i] + 0.05, 0.5),
    });
    if (i === 0) commitDot(x, y, { alpha: r, r: 11 });
    else if (i === 1) check(x, y + 2, 26, { alpha: r, width: 3.5 });
    else askIcon(x, y - 2, 16, { alpha: r, color: P.ink });
  });
  ATTESTED().forEach((v, i) =>
    nameText(v, x + 30, rows[i], {
      align: "left",
      alpha: a * listIn(t, ats, i),
      set: "09.2:attested",
    }),
  );
  // The predicate stands under a rule that closes the three rows: the rule midway between the last row and the
  // predicate, from the markers' edge to the longest row's end, and the two arrive together on the predicate's words.
  const pitch = rows[1] - rows[0],
    look = a * named(t, lookAt),
    ruleY = rows[2] + 0.75 * pitch;
  line(x - 16, ruleY, x + 30 + Math.max(...ATTESTED().map((v) => measure(v))), ruleY, {
    alpha: look,
  });
  nameText(L("查得到", "All on record"), x - 16, rows[2] + 1.5 * pitch, {
    align: "left",
    alpha: look,
  });
}

/* 09.3. The sentence rises to the top with the question of whether it can be trusted; what it does not depend on is
 * refused on the left, who said it and how much process, and what it does depend on builds on the right, the three
 * conditions the rules give, each a box that is ticked on its words. The two lists are centred on each other, the two
 * refusals midway between the three conditions' rows, and stand low enough to clear the question where the sentence
 * starts its rise. The table they make is centred on the frame, and the sentence heads it from above its gutter, the
 * axis between the two lists, which a rule marks as the judgement takes the picture, so the two lists stand as the two
 * sides of one judgement before the second arrives. While the refusals stand alone, the sentence and the refusals are
 * centred on the frame together, and the table glides to its place on the words that bring the first condition. */
/* The conditions are ticked, so each is set as the condition met, a short affirmative name, rather than as the
 * question the narration asks. */
const REFUSED = () => [L("谁说的", "Who said it"), L("走了多少流程", "How much process")],
  CONDITIONS = () => [
    L("原意有一处可查", "Meaning found in one place"),
    L("结论不超出证据", "Claim within its evidence"),
    L("出了错能退回去", "A way back after a mistake"),
  ];
function judged(s, t, a, cutAt) {
  if (a <= 0) return;
  const [trustAt, whoAt, processAt, alsoAt, meaningAt, withinAt, backAt] = cues(s, [
    ["这句话能不能信", "can be trusted"],
    ["谁说的", "who said it"],
    ["走了多少流程", "how much process"],
    ["也不看走了多少流程", "how much process"],
    ["原意是不是有一处可查", "the meaning can be found in one place"],
    ["结论有没有超出证据", "stays within its evidence"],
    ["能不能退回去", "you can get back after a mistake"],
  ]);
  const refused = REFUSED(),
    conditions = CONDITIONS(),
    // The cross after each refusal, and the box and its gap before each condition.
    A = Math.max(...refused.map((v) => measure(v))) + 16 + 26,
    B = 36 + 20 + Math.max(...conditions.map((v) => measure(v))),
    GUTTER = 200,
    // The table's left edge, centred on the frame, and its axis, the middle of the gutter, under the sentence.
    left = 960 - (A + GUTTER + B) / 2,
    axis = left + A + GUTTER / 2,
    // The refusals and the sentence, with its datum, are centred on the frame while they stand alone.
    alone = 960 - (left + axis + claimWidth() / 2 + CLAIM_DATUM) / 2,
    shift = mix(alone, 0, soon(t, meaningAt + 0.05, 0.9)),
    RX = left + A - 42 + shift,
    BX = left + A + GUTTER + shift;
  // The sentence rises from the cut, the question having been put before it, over a second, so its longest rise, in
  // English, keeps a step between frames that reads as one mark moving.
  const q = soon(t, Math.max(trustAt + 0.05, cutAt), 1.0),
    PX = mix(BOUND_X + boundShift(), axis + shift, q),
    PY = mix(470, 380, q),
    conds = [meaningAt, withinAt, backAt],
    rows = [545, 630, 715];
  claimPanel(t, PX, PY, { alpha: a });
  // The gutter's rule comes with the judgement: it overhangs the boxes of the first and last conditions, the ink at
  // either end of the two lists, by the same 12 px.
  line(axis + shift, rows[0] - 30, axis + shift, rows[2] + 30, { alpha: a });
  nameText(L("能不能信", "Can it be trusted?"), PX, PY + CLAIM_H / 2 + 18, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: a * named(t, trustAt),
  });
  refused.forEach((v, i) =>
    rejectedName(v, RX, (rows[i] + rows[i + 1]) / 2, {
      align: "right",
      // Each may lead its words within its clause: English says both in one clause with the question; Chinese opens
      // a clause for each, so the second comes in on its own clause's first word.
      alpha:
        a *
        (en || i === 0 ? ramp(t, [whoAt, processAt][i] - 0.6, 0.4) : ramp(t, alsoAt + 0.05, 0.4)),
      mark: ramp(t, [whoAt, processAt][i] + 0.3, 0.4),
      set: "09.3:refused",
    }),
  );
  conditions.forEach((v, i) => {
    const k = a * named(t, conds[i]);
    box(BX, rows[i] - 18, 36, 36, { stroke: P.ink, alpha: k, radius: 6, width: 2.5 });
    check(BX + 18, rows[i] + 1, 22, { alpha: a * named(t, conds[i] + 0.5), width: 3.5 });
    nameText(v, BX + 56, rows[i], {
      align: "left",
      width: 520,
      alpha: a * listIn(t, conds, i),
      set: "09.3:conditions",
    });
  });
}

/* The mark of the close, centred and large. */
const MARK = [960, 470, 640];

/* 09.4. The whole mark draws on as the ETHOS mark is named beneath it: its boundary first, in the second level of
 * ink, as the mark's outline. Then each part on its words, its name and what it stands for beside the mark: the
 * origin as a ring at the centre, named at the upper left; the two passages drawing out from it, named at the upper
 * right; the boundary taking full ink, named at the lower left; and last the cinnabar datum filling the origin, named
 * at the lower right. A point travels the boundary in voice time until the boundary is named. The names on the right
 * keep the same clearance from the mark's ink as those on the left, the two lower names stand on one line as the two
 * upper ones do, and each note is one short line, so the close is centred on the frame with the datum at its centre.
 * The mark, the film's emblem, stands on the frame's axis throughout. While the origin's names are the only ones beside
 * it, they stand above the mark, the name on the
 * origin's axis and the note under it, one gap clear of the boundary, so the picture is the mark's own, centred where
 * it stays; on the passages' words they glide round the boundary's upper left to their place, leftward first and then
 * down, keeping a gap clear of the boundary all the way. */
function close(s, t, a) {
  if (a <= 0) return;
  const [cutAt, markAt, originAt, beforeAt, twoAt, whereAt, boundaryAt, scopeAt, pointAt, boundAt] =
    cues(s, [
      ["ETHOS 的标志", "The ETHOS mark"],
      ["ETHOS 的标志", "the ETHOS mark"],
      ["一个起点", "One origin"],
      ["先划清边界", "bounded before it becomes a change"],
      ["两条路径", "Two passages"],
      ["只在影响行动的地方分开", "only where they decide action"],
      ["一道边界", "One boundary"],
      ["守在自己的范围里", "each keeping to their scope"],
      ["那一点朱红", "cinnabarred point"],
      ["必须落到证据上", "bound to its evidence"],
    ]);
  const [X, Y, S] = MARK,
    k = S / 512,
    r = 164 * k,
    ORIGIN = L("一个起点", "One origin"),
    ORIGIN_NOTE = L("先划清边界", "bounded before any change"),
    ORIGIN_WIDTH = L(220, 380),
    lit = ramp(t, boundaryAt - 0.15, 0.5),
    o = a * named(t, originAt),
    datum = named(t, pointAt),
    passages = soon(t, twoAt + 0.05, 1.0);
  // The boundary draws on from the cut at the second level, and takes full ink as it is named.
  ethosMark(X, Y, S, {
    datum: 0,
    passages: 0,
    boundary: soon(t, cutAt, 1.6),
    alpha: a * mix(0.58, 1, lit),
  });
  ethosMark(X, Y, S, { datum: 0, boundary: 0, passages, alpha: a });
  ring(X, Y, 14 * k, { color: P.ink, alpha: o * (1 - datum), width: 3 });
  ethosMark(X, Y, S, { datum, hole: 1, passages: 0, boundary: 0, alpha: a });
  // A point travels the boundary while the voice speaks, and once drawn, the passages.
  const q = (voiceTime(t) * 0.18) % 1,
    ang = -0.7 - q * (2 * Math.PI - 1.4);
  flowDot(X + r * Math.cos(ang), Y + r * Math.sin(ang), 7, q, {
    color: P.line,
    alpha: a * (1 - lit),
  });
  // English names the mark as its clause begins, so the cut already shows the name with the drawing outline.
  nameText(L("ETHOS 的标志", "The ETHOS mark"), X, Y + r + 16 * k + NAME_GAP, {
    valign: "top",
    alpha: a * ramp(t, markAt - (en ? 0.75 : 0.15), 0.4),
  });
  // Names: each beside the mark with what it stands for.
  const LEFT = X - r - 50,
    RIGHT = X + markExtent(S).right + 40,
    pair = (term, termAt, said, saidAt, x, y, align, width = 380) => {
      nameText(term, x, y, {
        align,
        valign: "bottom",
        alpha: a * named(t, termAt),
        set: "09.4:parts",
      });
      nameText(said, x, y + 8, {
        align,
        valign: "top",
        size: NOTE,
        color: P.muted,
        width,
        alpha: a * named(t, saidAt),
        set: "09.4:said",
      });
    };
  // The origin's names above the mark while they stand alone: the name centred on the origin's axis, the note's last
  // line one gap above the boundary. On the passages' words they go left over the boundary's top and then down beside
  // it to their place, so their nearest corner keeps at least a gap from its ink.
  const above =
      Y +
      markExtent(S).top -
      NAME_GAP -
      8 -
      labelSize(NOTE) * (1 + LEADING * (wrapName(ORIGIN_NOTE, ORIGIN_WIDTH, NOTE).length - 1)),
    OX = mix(X + nameWidth(ORIGIN) / 2, LEFT, soon(t, twoAt + 0.05, 0.9)),
    OY = mix(above, Y - 96, soon(t, twoAt + 0.45, 0.6));
  pair(ORIGIN, originAt, ORIGIN_NOTE, beforeAt, OX, OY, "right", ORIGIN_WIDTH);
  // English shows what the passages stand for as its clause begins, so the origin's names, at their place by then,
  // are balanced by the passages' within a moment; Chinese begins that clause on the note's own words.
  pair(
    L("两条路径", "Two passages"),
    twoAt,
    L("影响行动的地方", "only where they decide action"),
    whereAt - (en ? 0.45 : 0),
    RIGHT,
    Y - 96,
    "left",
  );
  pair(
    L("一道边界", "One boundary"),
    boundaryAt,
    L("守在自己的范围里", "each keeping to their scope"),
    scopeAt,
    LEFT,
    Y + 70,
    "right",
  );
  pair(
    L("那一点朱红", "Cinnabar-red point"),
    pointAt,
    L("必须落到证据上", "bound to its evidence"),
    boundAt,
    RIGHT,
    Y + 70,
    "left",
  );
}

scenes["09"] = function (s, t) {
  // The judgement takes the picture on its first refusal: the question is put over the sentence and its
  // attestations, in a clause of its own in Chinese and in the first half of the refusals' clause in English.
  const [judgeAt, markAt] = cues(s, [
    ["不看是谁说的", "does not depend on"],
    ["ETHOS 的标志", "The ETHOS mark"],
  ]);
  const a1 = stageOut(t, judgeAt),
    a2 = stageIn(t, judgeAt) * stageOut(t, markAt),
    a3 = stageIn(t, markAt);
  // The opening sentence's scenario is illustrative; the mark is ETHOS's own.
  illustrative(a1 + a2);
  bound(s, t, a1);
  judged(s, t, a2, judgeAt + STAGE_CUT);
  close(s, t, a3);
};
