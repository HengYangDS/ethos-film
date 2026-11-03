/* 09 one origin, two passages, one boundary: back to the opening sentence, now bound to its attestations, judged by
 * the three conditions the rules give rather than by who said it; and the close, the whole ETHOS mark, each part
 * named on its words and the cinnabar datum last. */

import { link } from "../../drawing/links.js";
import { ethosMark, markExtent } from "../../drawing/mark.js";
import { box, flowDot, line, measure, ring } from "../../drawing/strokes.js";
import { agent, check, seal } from "../../drawing/symbols.js";
import { askIcon, commitDot } from "../../drawing/workspace.js";
import { clearOfTitle, illustrative } from "../../framing/chapters.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, rejectedName } from "../../naming/names.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { STAGE_CUT, stageIn, stageOut } from "../../timing/stages.js";
import { CLAIM_DATUM, CLAIM_H, claimPanel, claimWidth } from "../claim.js";
import { nameWidth } from "../p07/example.js";
import { scenes } from "../registry.js";

/* 09.1-09.2. The opening sentence returns where it began, said by its Agent, its datum reaching along a dashed link to
 * an empty place; in ETHOS the link holds, and the sentence's attestations stand at its end, each row on its words:
 * which commit, what the proof checked, what still has no result, all to be looked up. The attestations' list hangs
 * from a fan wide enough that the seal's name keeps clear of its markers, and what can all be looked up, the predicate
 * of the three rows rather than a fourth, stands apart below them: under a rule that closes the rows, half a row
 * further down than a next row would, and starting at the markers' edge rather than the rows' text. The picture
 * stands centred on the frame, the Agent and its sentence on the left and the empty place on the right, while ETHOS's
 * way is named; as the attestations take the place it eases left only as far as its first row needs to stand inside
 * the frame, it glides left on the words of the first row, and the finished picture is centred too. */
const BOUND_X = 700,
  BOUND_END = 1140,
  // The empty place at the link's end, where the attestations will stand.
  PLACE = 200,
  FAN = 210,
  // The rows stand a pitch apart that keeps the seal's name, under the middle row, clear of the last row's line.
  BOUND_ROWS = [385, 470, 555],
  ATTESTED = () => [
    L("哪一次提交", "which commit it means"),
    L("核验了什么", "what the proof checked"),
    L("哪里还没有结果", "what still has no result"),
  ];
/* Where the sentence stands once its attestations have come: the finished picture, from the Agent to the longest row,
 * is centred on the frame. 09.3 takes the sentence up from here. */
export const boundShift = () =>
  960 -
  (BOUND_X - 370 - 34 + BOUND_END + FAN + 30 + Math.max(...ATTESTED().map((v) => measure(v)))) / 2;
function bound(s, t, a) {
  if (a <= 0) return;
  const [beganAt, doneAt, wayAt, attestAt, commitAt, provedAt, openAt, lookAt, trustAt] = cues(s, [
    ["开头那句", "where we began"],
    ["做完了", "Done"],
    ["按 ETHOS 的做法", "In ETHOS"],
    ["跟着存证", "attestations behind it"],
    ["哪一次提交", "which commit it means"],
    ["核验了什么", "what the proof checked"],
    ["哪里还没有结果", "what still has no result"],
    ["都找得到", "can all be looked up"],
    ["这句话能不能信", "can be trusted"],
  ]);
  // Before its rows arrive the picture runs from the Agent to the empty place at the link's end, which the seal takes.
  // As it does, the picture eases left as far as the first row, arriving next, needs to stand inside the frame's safe
  // area (to 1824, with room for the camera's push); on the first row's words it glides to its finished place.
  const before = 960 - (BOUND_X - 370 - 34 + BOUND_END + 6 + PLACE) / 2,
    ready = Math.min(before, 1824 - 12 - (BOUND_END + FAN + 30 + measure(ATTESTED()[0]))),
    off = mix(
      mix(before, ready, soon(t, attestAt + 0.05, 0.9)),
      boundShift(),
      soon(t, commitAt + 0.05, 0.9),
    ),
    PX = BOUND_X + off,
    Y = 470,
    clear = a * clearOfTitle(s, t, Y - 60),
    way = ramp(t, wayAt - 0.15, 0.5),
    at = a * named(t, attestAt),
    end = BOUND_END + off,
    rows = BOUND_ROWS,
    ats = [commitAt, provedAt, openAt];
  agent(PX - 370, Y, { size: 1.5, alpha: clear });
  link(PX - 334, Y, PX - claimWidth() / 2 - 2, Y, { alpha: clear, end: false });
  const {
    datum: [dx, dy],
  } = claimPanel(t, PX, Y, { alpha: clear, words: clear * named(t, doneAt) });
  // English names where the sentence began as its clause begins, so the thought is named in its first second.
  nameText(L("开头那句", "where we began"), PX, Y - CLAIM_H / 2 - 44, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: clear * ramp(t, beganAt - (en ? 0.6 : 0.15), 0.4),
  });
  // Chinese asks whether the sentence can be trusted in a clause of its own, while it still stands with its
  // attestations; the question rises with it when the judgement takes the picture.
  nameText(L("这句话能不能信", "can be trusted"), PX, Y + CLAIM_H / 2 + 18, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: clear * named(t, trustAt),
  });
  // The claim's link: dashed toward an empty place, holding once ETHOS's way is named.
  link(dx + 16, dy, end, dy, {
    alpha: clear * (1 - way),
    dash: [8, 8],
    flow: way < 1 ? (voiceTime(t) * 0.4) % 1 : null,
  });
  link(dx + 16, dy, end, dy, { alpha: a * way, flow: (voiceTime(t) * 0.4) % 1 });
  box(end + 6, dy - 45, PLACE, 90, {
    stroke: P.line,
    alpha: clear * (1 - at),
    radius: 10,
    dash: [8, 8],
  });
  nameText(L("ETHOS 的做法", "In ETHOS"), (dx + end) / 2, dy - 22, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: a * way,
  });
  // Its attestations at the link's end, and each thing they let one look up.
  const x = end + FAN;
  seal(end + 36, dy, 26, { alpha: at, color: P.ink });
  nameText(L("存证", "attestations"), end + 36, dy + 26 + NAME_GAP, { valign: "top", alpha: at });
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
  nameText(L("都找得到", "can all be looked up"), x - 16, rows[2] + 1.5 * pitch, {
    align: "left",
    alpha: look,
  });
}

/* 09.3. The sentence rises to the top as the question of whether it can be trusted is put; what it does not depend on
 * is refused on the left, who said it and how much process, and what it does depend on builds on the right, the three
 * conditions the rules give, each a box that is ticked on its words. The two lists are centred on each other, the two
 * refusals midway between the three conditions' rows, and stand low enough to clear the question where the Chinese
 * sentence starts its rise. The table they make is centred on the frame, and the sentence heads it from above its
 * gutter, the axis between the two lists. While the refusals stand alone, the sentence and the refusals are centred
 * on the frame together, and the table glides to its place on the words that bring the first condition. */
const REFUSED = () => [L("谁说的", "who said it"), L("走了多少流程", "how much process")],
  CONDITIONS = () => [
    L("原意是不是有一处可查", "the meaning can be found in one place"),
    L("结论有没有超出证据", "stays within its evidence"),
    L("能不能退回去", "you can get back after a mistake"),
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
  // The sentence rises as the question is put, or from the cut where the question was put before it, over a second,
  // so its longest rise, in English, keeps a step between frames that reads as one mark moving.
  const q = soon(t, Math.max(trustAt + 0.05, cutAt), 1.0),
    PX = mix(BOUND_X + boundShift(), axis + shift, q),
    PY = mix(470, 380, q),
    conds = [meaningAt, withinAt, backAt],
    rows = [545, 630, 715];
  claimPanel(t, PX, PY, { alpha: a });
  nameText(L("这句话能不能信", "can be trusted"), PX, PY + CLAIM_H / 2 + 18, {
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
 * upper ones do, and the Chinese origin's note breaks at its comma, as the English one breaks, so the close is centred
 * on the frame with the datum at its centre. While the origin's names are the only ones beside it, the mark and its
 * names stand as one unit centred on the frame, the mark right of the centre by half their reach; they glide there on
 * the origin's words and back on the passages' words. */
function close(s, t, a) {
  if (a <= 0) return;
  const [cutAt, markAt, originAt, beforeAt, twoAt, whereAt, boundaryAt, scopeAt, pointAt, boundAt] =
    cues(s, [
      ["ETHOS 的标志", "The ETHOS mark"],
      ["ETHOS 的标志", "the ETHOS mark"],
      ["一个起点", "One origin"],
      ["在变成改动之前", "bounded before it becomes a change"],
      ["两条路径", "Two passages"],
      ["只在影响行动的地方分开", "only where they decide action"],
      ["一道边界", "One boundary"],
      ["各自守在自己的范围里", "each keeping to their scope"],
      ["那一点朱红", "cinnabarred point"],
      ["结论必须落到证据上的地方", "bound to its evidence"],
    ]);
  const [CX, Y, S] = MARK,
    k = S / 512,
    r = 164 * k,
    ORIGIN = L("一个起点", "One origin"),
    ORIGIN_NOTE = L("在变成改动之前，先划清边界", "bounded before it becomes a change"),
    ORIGIN_WIDTH = L(220, 380),
    // The origin's names reach this far left of the boundary, and the boundary's ends this far right of the origin.
    reach = 50 + Math.max(nameWidth(ORIGIN), nameWidth(ORIGIN_NOTE, ORIGIN_WIDTH, NOTE)),
    ends = markExtent(S, { datum: 0, passages: 0 }).right,
    X =
      CX + ((r + reach - ends) / 2) * (soon(t, originAt + 0.05, 0.9) - soon(t, twoAt + 0.05, 0.9)),
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
  nameText(L("ETHOS 的标志", "the ETHOS mark"), X, Y + r + 16 * k + NAME_GAP, {
    valign: "top",
    alpha: a * ramp(t, markAt - (en ? 0.75 : 0.15), 0.4),
  });
  // Names: the origin's beside it inside the mark, the others outside, each with what it stands for.
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
  pair(ORIGIN, originAt, ORIGIN_NOTE, beforeAt, LEFT, Y - 96, "right", ORIGIN_WIDTH);
  pair(
    L("两条路径", "Two passages"),
    twoAt,
    L("只在影响行动的地方分开", "only where they decide action"),
    whereAt,
    RIGHT,
    Y - 96,
    "left",
  );
  pair(
    L("一道边界", "One boundary"),
    boundaryAt,
    L("各自守在自己的范围里", "each keeping to their scope"),
    scopeAt,
    LEFT,
    Y + 70,
    "right",
  );
  pair(
    L("那一点朱红", "cinnabar-red point"),
    pointAt,
    L("结论必须落到证据上的地方", "bound to its evidence"),
    boundAt,
    RIGHT,
    Y + 70,
    "left",
  );
}

scenes["09"] = function (s, t) {
  // The judgement takes the picture on its first refusal in Chinese, whose question has a clause of its own, and on
  // the question in English, which puts it in the refusals' clause.
  const [judgeAt, markAt] = cues(s, [
    ["不看是谁说的", "Whether that sentence"],
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
