/* Part 05, rule two (05.3, 05.5 and 05.7): distinguish only what changes action. Its heading brings the mark's two
 * passages, drawn out from the origin on its words, one per kind of next step. The planes are separate planes of
 * evidence, each permitting its own next step; one passing never means another has; a "done" names what was verified.
 * A judgment has three outcomes and only pass lets the work go ahead; the checks with no result are unknown, so whether
 * there is a problem stays open. A sixth distinction that changes no action is never added. The stack of planes moves aside once
 * and then only shifts as each stage builds beside it, so what stands is balanced on the content centre and the
 * argument reads as one picture changing on its words. */

import { ctx } from "../../canvas.js";
import { flowClock, link } from "../../drawing/links.js";
import { cross } from "../../drawing/symbols.js";
import { markLengths } from "../../drawing/mark.js";
import { dot, drawnShare, labelSize, measure, stroke } from "../../drawing/strokes.js";
import { ruleHeading } from "../../framing/rules.js";
import { beats, listLevel, named, reachAt } from "../../naming/lists.js";
import {
  LEADING,
  NAME_GAP,
  NOTE,
  TERM_GAP,
  nameText,
  rejectedName,
  termRow,
} from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { glideShare } from "../../timing/pauses.js";
import { STAGE_CUT } from "../../timing/stages.js";
import { card, linkSet, verdictMark } from "../p04/marks.js";
import { claimPanel, claimWidth } from "../claim.js";
import { PLANE_H, PLANE_STEP, PLANE_W, PLANES_TOP, planeStack } from "./planes.js";

const TOP = PLANES_TOP,
  ASIDE = 400;
const rowOf = (top, i) => top + i * PLANE_STEP + PLANE_H / 2;

/* The planes' next steps: each plane's step stands `STEPS[i]` px beyond the stack's right edge on its row, a ring of
 * STEP_R, so the steps descend as a staircase. Their heading hangs over the first step, left-aligned on its left edge
 * as the stack's heading is on the stack's, on the same line. */
const STEPS = [80, 130, 180, 230, 280],
  STEP_R = 12;
const stepsName = () => L("下一步都不一样", "A different next step");
/* How far right of the stack's right edge the staircase and its heading reach. */
const stepsReach = () => Math.max(STEPS.at(-1) + STEP_R, STEPS[0] - STEP_R + measure(stepsName()));
/* Where the stack stands once its steps stand beside it: the stack, the steps and their headings centred together on
 * the content centre. */
const separateX = () => 960 - (PLANE_W + stepsReach()) / 2;

/* A judgment's three outcomes and their conditions, in each edition. */
export const outcomeNames = () => L(["通过", "拦下", "未知"], ["Pass", "Block", "Unknown"]);
export const outcomeQuals = () =>
  L(
    [["允许动手"], ["有冲突、明确失败或警告"], ["缺了，或者没法核实"]],
    [
      ["lets work go ahead"],
      ["a conflict, explicit failure or warning"],
      ["missing or unverifiable"],
    ],
  );

/* The outcomes list's columns, from the stack's left edge: the list's mark at `mark`, the names after it, and the
 * conditions in one column after the widest name. The heading's qualifier stands in that column (`heading`), or after
 * its term (`natural`) where the term ends past it, so the heading row reads on the list's grid. */
export function outcomesColumns() {
  const mark = PLANE_W + 80,
    names = mark + 18 + NAME_GAP,
    quals = names + Math.max(...outcomeNames().map((v) => measure(v, LABEL))) + TERM_GAP,
    natural = mark - 18 + measure(L("一次判断的结果", "A judgment")) + TERM_GAP;
  return { mark, names, quals, natural, heading: Math.max(quals, natural) };
}
/* When the conditions' column forms: with the first condition's words. */
const columnAt = (c) => Math.min(c.ahead, c.conflict, c.missing);
/* The parts of the outcomes list, each with how far right it reaches from the stack's left edge: the heading, its term
 * and qualifier taken as one, its qualifier again once it joins the conditions' column, then each name, each condition
 * and "it waits", a second line of unknown's condition. `c` gives when each arrives. */
export function outcomesParts(c) {
  const col = outcomesColumns(),
    names = outcomeNames(),
    quals = outcomeQuals(),
    qualifier = measure(L("只分三种", "only three outcomes"), NOTE);
  return [
    [c.first4, col.natural + qualifier],
    [columnAt(c), col.heading + qualifier],
    ...[c.pass, c.block, c.unknown].map((at, i) => [at, col.names + measure(names[i])]),
    ...[c.ahead, c.conflict, c.missing].map((at, i) => [
      at,
      col.quals + measure(quals[i].join(""), NOTE),
    ]),
    [c.never, col.quals + measure(L("暂不动手", "it waits"), NOTE)],
  ];
}
/* How far right a row of parts, each [when it arrives, how far it reaches], reaches at t as they build: a part that
 * reaches further than those before it widens the whole, gliding from just after its words (reachAt). */
export function buildingReach(t, parts) {
  const [first, ...rest] = [...parts].sort((a, b) => a[0] - b[0]);
  return reachAt(t, first[1], rest);
}
/* Where the stack stands while the outcomes are listed beside it: still, so nothing moves as a part of the list joins.
 * It stands where the stack and the finished list are centred on the content centre, moved toward where the list's
 * first part would centre them by a quarter of what the later parts add, at most 30 px, so neither the opening list
 * nor the finished one stands far off the centre: with at most 50 px the finished English list's ink stood 50.6 px
 * off, past the reviewers' 50 px for a settled picture, which filmkit 0.16.0 refuses; at 30 px the opening list stands
 * about 39 px left and the finished one about 39 px right. */
const outcomesAt = (c) => {
  const parts = outcomesParts(c),
    final = Math.max(...parts.map(([, reach]) => reach)),
    // The heading, its qualifier in the conditions' column: the first two parts.
    first = Math.max(parts[0][1], parts[1][1]);
  return 960 - final / 2 + Math.min(30, (final - first) / 4);
};

/* Rule two's heading, in the rules' shared place: its glyph adds the two passages, which draw out from the origin as the
 * rule is named, from the heading's first frame, so the glyph stands whole beside its number before the statement
 * arrives and the two never stand apart. */
export function ruleTwoHeading(t, c, g) {
  ruleHeading(t, {
    number: L("第二条准则", "Rule two"),
    numberAt: c.first3,
    statement: L("只在会改变行动的地方做区分", "Distinguish only what changes action"),
    statementAt: c.statement,
    size: 560,
    glyph: { datum: 1, passages: 1, boundary: 0 },
    shares: {
      datum: g,
      hole: 1,
      passages: drawnShare({ t, at: c.first3 + 0.2 }, markLengths(560).passage),
      boundary: 0,
    },
    alpha: g,
  });
}

/* 05.3 Separate planes of evidence: on "a different next step" each plane gains its own step at a different reach, one
 * mark of links, and the stack moves aside with its steps to where the two stand centred together; the local proof's
 * step, the one that passed, is open. */
export function separateStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(960 - PLANE_W / 2, separateX(), glideShare(t, c.nextStep + 0.05, stepsReach() / 2, 0.7)),
    nx = x + PLANE_W,
    reach = STEPS,
    steps = g * named(t, c.nextStep),
    q = flowClock(t);
  planeStack(t, x, TOP, { alpha: g });
  nameText(L("各自独立的证据", "Separate planes of evidence"), x, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.separate),
  });
  linkSet(
    reach.map((d, i) => [nx, rowOf(TOP, i), nx + d - STEP_R, rowOf(TOP, i), "hv"]),
    { alpha: steps, draw: { t, at: c.nextStep + 0.05 }, flow: q, end: false },
  );
  stroke(
    () =>
      reach.forEach((d, i) => {
        ctx.moveTo(nx + d + STEP_R, rowOf(TOP, i));
        ctx.arc(nx + d, rowOf(TOP, i), STEP_R, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha: steps * ramp(t, c.nextStep + 0.3, 0.3), width: 2.5 },
  );
  dot(nx + reach[0], rowOf(TOP, 0), 6, {
    color: P.ink,
    alpha: steps * ramp(t, c.nextStep + 0.6, 0.3),
  });
  nameText(stepsName(), nx + reach[0] - STEP_R, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: steps,
  });
}

/* 05.3 One passing never means another has: the sentence that says "done" stands beside the stack, the local proof's
 * check beats and the inference to another plane is refused; the sentence is then linked to the one plane verified.
 * The stack comes from where its steps left it, keeping its name, and from the cut it and the sentence glide aside
 * together as one group. The steps leave at the cut with their name, the two as one mark. */
export function verifiedStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(separateX(), ASIDE, glideShare(t, c.first3b + STAGE_CUT, separateX() - ASIDE, 0.7)),
    one = rowOf(TOP, 0);
  planeStack(t, x, TOP, { alpha: g });
  nameText(L("各自独立的证据", "Separate planes of evidence"), x, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g,
  });
  beats(t, x + PLANE_W - 36, one, 24, [c.first3b], { alpha: g });
  rejectedName(
    L("另一样也通过", "Another has passed"),
    x + PLANE_W / 2,
    TOP + 5 * PLANE_STEP + 18,
    {
      alpha: g * named(t, c.another),
      mark: ramp(t, c.another + 0.35, 0.35),
    },
  );
  // The sentence stands a short link's run right of the stack, so the two stand as one group about the centre.
  const PX = x + PLANE_W + 70 + claimWidth() / 2,
    PY = rowOf(TOP, 2),
    edge = claimPanel(t, PX, PY, { alpha: g }),
    verified = g * named(t, c.verified);
  beats(t, edge.right, PY, 20, [c.saysDone], { alpha: g });
  link(edge.left, PY, x + PLANE_W, one, {
    route: "hvh",
    alpha: g * named(t, c.tell),
    draw: { t, at: c.tell + 0.05 },
    flow: flowClock(t),
  });
  nameText(L("这一次确认过的", "Verified this time"), PX, edge.bottom + NAME_GAP, {
    valign: "top",
    alpha: verified,
  });
}

/* 05.5 Three outcomes: beside the stack a judgment's three outcomes build as a list, each a shape with its name, pass
 * with what it alone permits and block and unknown with their conditions; while unknown, the work waits. The list keeps
 * the stack's rows, so the two columns read on one grid: its heading on the first plane's row and the outcomes on the
 * next three. "it waits" is said of unknown, so it stands as a second line of unknown's condition, in the
 * condition's note style, column and lowercase, rather than as a fourth row of the list. The checks with no result are linked
 * to unknown, and whether there is a problem stands open with unknown's mark. Each part of the list stands in its place
 * from its words, so nothing moves as the list builds; the stack stands still beside it (outcomesAt). */
export function outcomesStage(s, t, c, g) {
  const top = 340,
    x = outcomesAt(c),
    col = outcomesColumns(),
    LX = x + col.mark,
    em = labelSize(LABEL),
    names = outcomeNames(),
    quals = outcomeQuals(),
    kinds = ["pass", "block", "unknown"],
    ats = [c.pass, c.block, c.unknown],
    qualAts = [c.ahead, c.conflict, c.missing],
    ys = [1, 2, 3].map((i) => rowOf(top, i)),
    // The conditions stand in one column after the widest outcome's name.
    qualLeft = x + col.quals;
  planeStack(t, x, top, { alpha: g });
  termRow(
    t,
    L(["一次判断的结果"], ["A judgment"]),
    [c.first4],
    L(["只分三种"], ["only three outcomes"]),
    [c.three],
    LX - 18,
    rowOf(top, 0) - em / 2,
    {
      alpha: g,
      width: 1824 - LX,
      // The qualifier stands in the conditions' column from its words, so it does not move as the column forms.
      qualLeft: x + col.heading,
    },
  );
  const restated = [[c.onlyPass], [c.isBlock], [c.isUnknownToo]];
  ats.forEach((at, i) => {
    verdictMark(kinds[i], LX, ys[i], 18, { alpha: g * ramp(t, at - 0.15, 0.4) });
    beats(t, LX, ys[i], 26, restated[i], { alpha: g });
    termRow(t, [names[i]], [at], quals[i], [qualAts[i]], LX + 18 + NAME_GAP, ys[i] - em / 2, {
      alpha: g * listLevel(t, ats, i),
      set: "outcomes",
      width: 1800 - LX,
      qualLeft,
    });
  });
  nameText(L("暂不动手", "it waits"), qualLeft, ys[2] + labelSize(NOTE) * LEADING, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.never),
  });
  // The example: the checks on GitLab and GitHub, with no result yet, are unknown.
  const two = rowOf(top, 1),
    example = g * named(t, c.isUnknown);
  beats(t, x + PLANE_W - 36, two, 22, [c.example, c.notYet], { alpha: g });
  link(x + PLANE_W, two, LX - 26, ys[2], {
    route: "hvh",
    alpha: example,
    draw: { t, at: c.isUnknown + 0.05 },
    flow: flowClock(t),
  });
  // Without a result nobody can say whether there is a problem: the question stands open under the stack in the
  // voice's words, after the unknown mark that 未知 carries, the two centred together on the stack.
  const open = L("有没有问题", "Whether there is a problem"),
    openY = top + 5 * PLANE_STEP + 18,
    openLeft = x + PLANE_W / 2 - (36 + NAME_GAP + measure(open)) / 2,
    asked = g * named(t, c.anyProblem);
  verdictMark("unknown", openLeft + 18, openY, 18, { alpha: asked });
  nameText(open, openLeft + 36 + NAME_GAP, openY, { align: "left", alpha: asked });
}

/* 05.7 A distinction that changes no action is never added: a sixth plane is offered under the five, refused and left
 * dashed, one more thing to keep track of; the five that matter stand bracketed. The stack stands centred while the
 * sixth plane is weighed under it, and moves left as the bracket and its name join it, to where the three stand
 * centred together. */
export function refusedStage(s, t, c, g) {
  const matterName = L("真正要紧的那几个", "The ones that matter"),
    top = 320,
    alone = 960 - PLANE_W / 2,
    bracketed = 960 - (PLANE_W + 24 + NAME_GAP + measure(matterName)) / 2,
    x = mix(alone, bracketed, glideShare(t, c.matter + 0.05, alone - bracketed, 0.7)),
    sy = top + 5 * PLANE_STEP,
    offered = g * named(t, c.distinction),
    refused = soon(t, c.never2 + 0.05, 0.5);
  planeStack(t, x, top, { alpha: g });
  card(x, sy, PLANE_W, PLANE_H, { alpha: offered * mix(1, 0.7, refused), dash: [8, 9] });
  termRow(
    t,
    L(["一个区分"], ["A distinction"]),
    [c.distinction],
    L(["改变不了任何行动"], ["that would not change any action"]),
    [c.sixth],
    x + 24,
    sy + PLANE_H / 2 - 15,
    { alpha: g * mix(1, 0.62, refused), width: PLANE_W - 80 },
  );
  cross(x + PLANE_W - 36, sy + PLANE_H / 2, 22, { color: P.ink, alpha: g * refused, width: 3.5 });
  beats(t, x + PLANE_W - 36, sy + PLANE_H / 2, 22, [c.changesNone], { alpha: g });
  nameText(
    L("多一样要记着的东西", "One more thing to keep track of"),
    x + PLANE_W / 2,
    sy + PLANE_H + NAME_GAP,
    {
      valign: "top",
      alpha: g * named(t, c.oneMore),
    },
  );
  // The five that matter: a bracket at the stack's right, named on its words.
  const matter = g * named(t, c.matter),
    bx = x + PLANE_W + 24;
  stroke(
    () => {
      ctx.moveTo(bx - 14, top);
      ctx.lineTo(bx, top);
      ctx.lineTo(bx, top + 5 * PLANE_STEP - 12);
      ctx.lineTo(bx - 14, top + 5 * PLANE_STEP - 12);
    },
    { color: P.ink, alpha: matter, width: 2.5 },
  );
  nameText(matterName, bx + NAME_GAP, rowOf(top, 2), {
    align: "left",
    alpha: matter,
  });
}
