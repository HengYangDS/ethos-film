/* 09 one origin, two passages, one boundary: back to the opening sentence, now bound to its attestations, judged by
 * the three conditions the rules give rather than by who said it; and the close, the whole ETHOS mark, each part
 * named on its words and the cinnabar datum last. */

import { FLOW_EVERY, flowAlong, flowClock, link } from "../../drawing/links.js";
import { ethosMark } from "../../drawing/mark.js";
import { box, labelSize, line, measure, ring } from "../../drawing/strokes.js";
import { agent, check, seal } from "../../drawing/symbols.js";
import { askIcon, commitDot } from "../../drawing/workspace.js";
import { clearOfTitle, illustrative } from "../../framing/chapters.js";
import { listIn, named } from "../../naming/lists.js";
import { LEADING, NAME_GAP, NOTE, nameText, rejectedName, wrapName } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { glideShare } from "../../timing/pauses.js";
import { STAGE_CUT, stageIn, stageOut } from "../../timing/stages.js";
import { CLAIM_DATUM, CLAIM_H, claimPanel, claimWidth } from "../claim.js";
import { scenes } from "../registry.js";

/* 09.1-09.2. The opening sentence returns as it began in 01: its Agent, named, stands at the centre from the first
 * word, and on the words that bring the sentence back it steps aside, below the sentence's place and to its left, as
 * a link rises from it and turns to the panel, which arrives at the link's end, named where it began; its words fill
 * the panel as they are said. The Agent and its sentence then stand centred on the frame. In ETHOS the sentence has
 * to come with
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
  // the sentence and its Agent alone fill the band's height as the reviewers measure a thought's picture, and high
  // enough that, with the Agent's name under it, that picture stands balanced on the content centre line.
  AGENT_DX = 70,
  AGENT_DY = 220,
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
/* How far the sentence's picture reaches left of the panel's centre: the Agent's outline or its name, below the
 * panel's left end. */
const boundLeft = () => -claimWidth() / 2 - AGENT_DX - Math.max(40, measure("Agent") / 2);
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
    ["回到开头那句", "back to where we began"],
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
      mix(alone, chain, glideShare(t, wayAt + 0.05, chain - alone, 0.9)),
      boundShift(),
      glideShare(t, commitAt + 0.05, boundShift() - chain, 0.9),
    ),
    PX = BOUND_X + off,
    Y = 470,
    // The Agent steps aside from the centre as its sentence comes back, as in 01.
    // Its way, from the centre to its place beside the sentence as the sentence stands alone.
    aside = glideShare(
      t,
      beganAt + 0.05,
      Math.hypot(960 - (BOUND_X + alone - W / 2 - AGENT_DX), 560 - Y - AGENT_DY),
      0.6,
    ),
    AX = mix(960, PX - W / 2 - AGENT_DX, aside),
    AY = mix(560, Y + AGENT_DY, aside),
    // The question's top, at its gap under the panel; the seal's name shares its baseline.
    under = Y + CLAIM_H / 2 + 18,
    clear = a * clearOfTitle(s, t, Y - 60),
    // The Agent stands at full ink by the first word; its sentence comes back on the words that bring it back.
    seen = clear * ramp(t, s.voice_start - 0.3, 0.4),
    back = clear * ramp(t, beganAt + 0.35, 0.4),
    way = a * ramp(t, wayAt - 0.15, 0.5),
    at = a * named(t, sealAt),
    end = PX + BOUND_RUN,
    rows = BOUND_ROWS,
    ats = [commitAt, provedAt, openAt],
    flow = flowClock(t);
  agent(AX, AY, { size: 1.5, alpha: seen });
  nameText("Agent", AX, AY + 33 + NAME_GAP, { valign: "top", alpha: seen });
  // The Agent's link draws out to the sentence and then carries a point to it while the voice speaks, ending in its
  // quiet point there.
  link(AX, AY - 33, PX - W / 2 - 6, Y, {
    route: "vh",
    alpha: seen,
    upto: aside,
    flow,
    flowEvery: FLOW_EVERY,
  });
  const {
    datum: [dx, dy],
  } = claimPanel(t, PX, Y, { alpha: back, words: clear * named(t, doneAt) });
  nameText(L("开头的那句话", "Where we began"), PX, Y - CLAIM_H / 2 - 44, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: back,
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
  link(dx + 16, dy, end, dy, { alpha: way, upto: drawn, flow });
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
    shift = mix(alone, 0, glideShare(t, meaningAt + 0.05, alone, 0.9)),
    RX = left + A - 42 + shift,
    BX = left + A + GUTTER + shift;
  // The sentence rises from the cut, the question having been put before it, over a second, so its longest rise, in
  // English, keeps a step between frames that reads as one mark moving.
  const q = glideShare(
      t,
      Math.max(trustAt + 0.05, cutAt),
      Math.hypot(BOUND_X + boundShift() - axis - alone, 470 - 380),
      1.0,
    ),
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

/* The mark of the close, centred and large: its bowl holds every part's name beside the part. */
const MARK = [960, 470, 900];
/* The width the notes of the passages and the boundary wrap to: within it the Chinese notes stand on one line and the
 * English ones break by measure into two. */
const PART_NOTE = 220;
/* Where the passages' names stand in the mouth between the passages, from the mark's origin: their left edge where
 * the two have parted far enough to hold a name and a two-line note with about 12 px to spare on either side (the
 * mouth is 117 px tall there and widens to the right), centred on the mouth's middle line. */
const MOUTH = [120, 1];

/* 09.4. The whole mark draws on as the ETHOS mark is named beneath it: its boundary first, in the second level of
 * ink, as the mark's outline. Then each part on its words, its name and what it stands for, each beside its part and
 * none moving: the origin as a ring at the centre, named inside the bowl beside it at its left, as 06.3 names
 * authority at the datum; the two passages drawing out from it, named in the mouth between them; the boundary taking
 * full ink, named inside the bowl under its top, centred on its axis; and last the cinnabar datum filling the origin,
 * named one gap under it, so the one point carries both of its names. A point travels the boundary in voice time until
 * the boundary is named. The origin's names end one gap left of the point, their last line ending on its row; the
 * cinnabar point's end at its right edge, where the English names, the longest, keep clear of the boundary; the
 * boundary's term stands one gap under the ring's inner edge at the term's corners. Only the passages' names reach
 * past the mark, out of its opening, so once the boundary has begun to fill out the close stands within about 40 px of
 * the frame's axis in every state, and the mark, the film's emblem, stands on the axis throughout. */
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
    point = 14 * k,
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
  ring(X, Y, point, { color: P.ink, alpha: o * (1 - datum), width: 3 });
  ethosMark(X, Y, S, { datum, hole: 1, passages: 0, boundary: 0, alpha: a });
  // A point travels the boundary while the voice speaks, and once drawn, the passages.
  flowAlong(
    Array.from({ length: 65 }, (_, i) => {
      const ang = -0.7 - (i / 64) * (2 * Math.PI - 1.4);
      return [X + r * Math.cos(ang), Y + r * Math.sin(ang)];
    }),
    flowClock(t),
    7,
    { single: true, color: P.line, alpha: a * (1 - lit) },
  );
  // English names the mark as its clause begins, so the cut already shows the name with the drawing outline.
  nameText(L("ETHOS 的标志", "The ETHOS mark"), X, Y + r + 16 * k + NAME_GAP, {
    valign: "top",
    alpha: a * ramp(t, markAt - (en ? 0.75 : 0.15), 0.4),
  });
  // Names: each with what it stands for, the term ending on the pair's line and the note hanging below it.
  const pair = (term, termAt, said, saidAt, x, y, align, width = 380) => {
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
  // The point's names inside the bowl: the origin's one gap left of it, its note's last line ending on the point's
  // row, and the cinnabar datum's one gap under it, ending at its right edge.
  const beside = Y - labelSize(NOTE) - 8,
    under = Y + point + NAME_GAP + labelSize(LABEL);
  pair(
    L("一个起点", "One origin"),
    originAt,
    L("先划清边界", "bounded first"),
    beforeAt,
    X - point - NAME_GAP,
    beside,
    "right",
  );
  // English shows what the passages stand for as its clause begins, so the passages' names stand whole within a
  // moment; Chinese begins that clause on the note's own words. The name and its note stand as one block centred on
  // the mouth's middle line.
  const passagesName = L("两条路径", "Two passages"),
    passagesSaid = L("影响行动的地方", "only where they decide action"),
    noteLines = wrapName(passagesSaid, PART_NOTE, NOTE).length,
    block = labelSize(LABEL) + 8 + labelSize(NOTE) * (1 + LEADING * (noteLines - 1));
  pair(
    passagesName,
    twoAt,
    passagesSaid,
    whereAt - (en ? 0.45 : 0),
    X + MOUTH[0],
    Y + MOUTH[1] - block / 2 + labelSize(LABEL),
    "left",
    PART_NOTE,
  );
  // The boundary's name under the ring's top, inside it: the term's top one gap under the ring's inner edge at the
  // term's corners, and its note under it, both centred on the mark's axis.
  const boundary = L("一道边界", "One boundary"),
    inner = r - 12.5 * k,
    corner = Math.sqrt(inner ** 2 - (measure(boundary) / 2) ** 2);
  pair(
    boundary,
    boundaryAt,
    L("守在自己的范围里", "each keeping to their scope"),
    scopeAt,
    X,
    Y - corner + NAME_GAP + labelSize(LABEL),
    "center",
    PART_NOTE,
  );
  pair(
    L("那一点朱红", "Cinnabar-red point"),
    pointAt,
    L("必须落到证据上", "bound to its evidence"),
    boundAt,
    X + point,
    under,
    "right",
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
