/* Part 05, rule two (05.3-05.5): distinguish only what changes action. Its heading brings the mark's two passages,
 * drawn out from the origin on its words, one per kind of next step. The planes are separate planes of evidence, each
 * permitting its own next step; one passing never means another has; a "done" names what was verified. A judgment has
 * three outcomes and only pass lets the work go ahead; the checks with no result are unknown, which is not "no
 * problem". A sixth distinction that changes no action is never added. The stack of planes moves aside once and then
 * only shifts as each stage builds beside it, so what stands is balanced on the content centre and the argument reads
 * as one picture changing on its words. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { cross } from "../../drawing/symbols.js";
import { dot, labelSize, measure, stroke } from "../../drawing/strokes.js";
import { ruleHeading } from "../../framing/rules.js";
import { beats, listLevel, named } from "../../naming/lists.js";
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
import { voiceTime } from "../../timing/pauses.js";
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
const outcomeNames = () => L(["通过", "拦下", "未知"], ["Pass", "Block", "Unknown"]),
  outcomeQuals = () =>
    L(
      [["允许动手"], ["有冲突，或者明确失败"], ["缺了，或者没法核实"]],
      [["lets work go ahead"], ["a conflict or an explicit failure"], ["missing or unverifiable"]],
    );

/* The outcomes list's columns, from the stack's left edge: the list's mark at `mark`, the names after it, and the
 * conditions in one column after the widest name. The heading's qualifier follows its term (`natural`) and, once the
 * conditions form their column, joins it (`heading`) when its term ends before it, so the heading row reads on the
 * list's grid without waiting on a column that has not formed. */
function outcomesColumns() {
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
 * and "never permission", a second line of unknown's condition. `c` gives when each arrives. */
function outcomesParts(c = {}) {
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
    [c.never, col.quals + measure(L("不等于可以", "Never permission"), NOTE)],
  ];
}
/* How far right the outcomes reach at t as they build: a part that reaches further than those before it widens the
 * whole, gliding from just after its words. */
function outcomesReach(t, c) {
  const parts = outcomesParts(c).sort((a, b) => a[0] - b[0]);
  let reach = parts[0][1],
    now = reach;
  for (const [at, right] of parts.slice(1)) {
    if (right <= reach) continue;
    now += (right - reach) * soon(t, at + 0.05, 0.7);
    reach = right;
  }
  return now;
}
/* Where the stack stands while the outcomes are listed beside it: the stack and what of the list stands, taken
 * together, centred on the content centre; outcomesX() is that place once the whole list stands. */
const outcomesAt = (t, c) => 960 - outcomesReach(t, c) / 2,
  outcomesX = () => 960 - Math.max(...outcomesParts().map(([, right]) => right)) / 2;

/* Rule two's heading, in the rules' shared place: its glyph adds the two passages, which draw out from the origin as the
 * rule is named, from the heading's first frame, so the glyph stands whole beside its number before the statement
 * arrives and the two never stand apart. */
export function ruleTwoHeading(t, c, g) {
  ruleHeading(t, {
    number: L("第二条准则", "Rule two"),
    numberAt: c.first3,
    statement: L("只在影响行动的地方做区分", "Distinguish only what changes action"),
    statementAt: c.statement,
    size: 560,
    glyph: { datum: 1, passages: 1, boundary: 0 },
    shares: { datum: g, hole: 1, passages: soon(t, c.first3 + 0.2, 1.1), boundary: 0 },
    alpha: g,
  });
}

/* 05.3 Separate planes of evidence: on "a different next step" each plane gains its own step at a different reach, one
 * mark of links, and the stack moves aside with its steps to where the two stand centred together; the local proof's
 * step, the one that passed, is open. */
export function separateStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(960 - PLANE_W / 2, separateX(), soon(t, c.nextStep + 0.05, 0.7)),
    nx = x + PLANE_W,
    reach = STEPS,
    steps = g * named(t, c.nextStep),
    q = (voiceTime(t) * 0.45) % 1;
  planeStack(t, x, TOP, { alpha: g });
  nameText(L("各自独立的证据", "Separate planes of evidence"), x, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.separate),
  });
  linkSet(
    reach.map((d, i) => [nx, rowOf(TOP, i), nx + d - STEP_R, rowOf(TOP, i), "hv"]),
    { alpha: steps, upto: soon(t, c.nextStep + 0.05, 0.6), flow: q, end: false },
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
 * The stack comes from where its steps left it, and from the cut it and the sentence glide aside together as one
 * group. */
export function verifiedStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(separateX(), ASIDE, soon(t, c.first3b + STAGE_CUT, 0.7)),
    one = rowOf(TOP, 0);
  planeStack(t, x, TOP, { alpha: g });
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
    upto: soon(t, c.tell + 0.05, 0.6),
    flow: (voiceTime(t) * 0.45) % 1,
  });
  nameText(L("实际确认过的", "Verified this time"), PX, edge.bottom + NAME_GAP, {
    valign: "top",
    alpha: verified,
  });
}

/* 05.4 Three outcomes: beside the stack a judgment's three outcomes build as a list, each a shape with its name, pass
 * with what it alone permits and block and unknown with their conditions; unknown is never permission. The list keeps
 * the stack's rows, so the two columns read on one grid: its heading on the first plane's row and the outcomes on the
 * next three. "Never permission" is said of unknown, so it stands as a second line of unknown's condition, in the
 * condition's note style and column, rather than as a fourth row of the list. The checks with no result are linked
 * to unknown, and "no problem" is refused. The stack rises a little and moves to where the stack and the list,
 * together, stand on the content centre, and it shifts on the words of each condition that widens the list. */
export function outcomesStage(s, t, c, g) {
  const settle = soon(t, c.first4 + 0.05, 0.7),
    top = mix(TOP, 340, settle),
    x = mix(ASIDE, outcomesAt(t, c), settle),
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
      qualLeft: x + mix(col.natural, col.heading, soon(t, columnAt(c) + 0.05, 0.6)),
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
  nameText(L("不等于可以", "Never permission"), qualLeft, ys[2] + labelSize(NOTE) * LEADING, {
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
    upto: soon(t, c.isUnknown + 0.05, 0.5),
    flow: (voiceTime(t) * 0.45) % 1,
  });
  rejectedName(L("没有问题", "No problem"), x + PLANE_W / 2, top + 5 * PLANE_STEP + 18, {
    alpha: g * named(t, c.noProblem),
    mark: ramp(t, c.noProblem + 0.35, 0.35),
  });
}

/* 05.5 A distinction that changes no action is never added: a sixth plane is offered under the five, refused and left
 * dashed, one more thing to keep track of; the five that matter stand bracketed. The stack stands centred while the
 * sixth plane is weighed under it, and moves left as the bracket and its name join it, to where the three stand
 * centred together. */
export function refusedStage(s, t, c, g) {
  const matterName = L("真正要紧的那几个", "The ones that matter"),
    settle = soon(t, c.first5 + 0.05, 0.8),
    top = mix(340, 320, settle),
    alone = 960 - PLANE_W / 2,
    bracketed = 960 - (PLANE_W + 24 + NAME_GAP + measure(matterName)) / 2,
    x = mix(mix(outcomesX(), alone, settle), bracketed, soon(t, c.matter + 0.05, 0.7)),
    sy = top + 5 * PLANE_STEP,
    offered = g * named(t, c.distinction),
    refused = soon(t, c.never2 + 0.05, 0.5);
  planeStack(t, x, top, { alpha: g });
  card(x, sy, PLANE_W, PLANE_H, { alpha: offered * mix(1, 0.7, refused), dash: [8, 9] });
  termRow(
    t,
    L(["一个区分"], ["A distinction"]),
    [c.distinction],
    L(["改变不了任何行动"], ["would not change any action"]),
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
