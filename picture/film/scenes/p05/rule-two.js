/* Part 05, rule two (05.3-05.5): distinguish only what changes action. Its heading brings the mark's two passages,
 * drawn out from the origin on its words, one per kind of next step. The planes are separate planes of evidence, each
 * permitting its own next step; one passing never means another has; a "done" names what was verified. A judgment has
 * three outcomes and only pass lets the work go ahead; the checks with no result are unknown, which is not "no
 * problem". A sixth distinction that changes no action is never added. The stack of planes stays in one place from
 * the moment it moves aside, so the argument reads as one picture changing on its words. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { ethosMark } from "../../drawing/mark.js";
import { cross } from "../../drawing/symbols.js";
import { dot, measure, stroke } from "../../drawing/strokes.js";
import { beats, listLevel, named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, rejectedName, termRow, wrapName } from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { card, linkSet, verdictMark } from "../p04/marks.js";
import { claimPanel } from "../claim.js";
import { PLANE_H, PLANE_STEP, PLANE_W, planeStack } from "./planes.js";

const TOP = 380,
  ASIDE = 400;
const rowOf = (top, i) => top + i * PLANE_STEP + PLANE_H / 2;

/* Rule two's heading: its number in small type above its statement, and at their left the mark, whose two passages
 * draw out from the origin as the rule is stated. */
export function ruleTwoHeading(t, c, g) {
  const number = L("第二条准则", "Rule two"),
    statement = wrapName(
      L("只在影响行动的地方做区分", "Distinguish only what changes action"),
      640,
    ),
    w = Math.max(measure(number, NOTE), ...statement.map((v) => measure(v))),
    MX = 960 - (150 + w) / 2,
    top = 196,
    MY = top + 20 + 19 * (statement.length - 1);
  ethosMark(MX, MY, 560, {
    datum: g,
    hole: 1,
    passages: soon(t, c.statement + 0.05, 1.1),
    boundary: 0,
    alpha: g,
  });
  nameText(number, MX + 150, top, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.first3),
  });
  nameText(statement, MX + 150, top + 22, {
    align: "left",
    valign: "top",
    alpha: g * named(t, c.statement),
  });
}

/* 05.3 Separate planes of evidence: on "a different next step" the stack moves aside and each plane gains its own step
 * at a different reach, one mark of links; the local proof's step, the one that passed, is open. */
export function separateStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const x = mix(960 - PLANE_W / 2, ASIDE, soon(t, c.nextStep + 0.05, 0.7)),
    nx = x + PLANE_W,
    reach = [80, 130, 180, 230, 280],
    steps = g * named(t, c.nextStep),
    q = (voiceTime(t) * 0.45) % 1;
  planeStack(t, x, TOP, { alpha: g });
  nameText(L("各自独立的证据", "Separate planes of evidence"), x, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.separate),
  });
  linkSet(
    reach.map((d, i) => [nx, rowOf(TOP, i), nx + d - 12, rowOf(TOP, i), "hv"]),
    { alpha: steps, upto: soon(t, c.nextStep + 0.05, 0.6), flow: q, end: false },
  );
  stroke(
    () =>
      reach.forEach((d, i) => {
        ctx.moveTo(nx + d + 12, rowOf(TOP, i));
        ctx.arc(nx + d, rowOf(TOP, i), 12, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha: steps * ramp(t, c.nextStep + 0.3, 0.3), width: 2.5 },
  );
  dot(nx + reach[0], rowOf(TOP, 0), 6, {
    color: P.ink,
    alpha: steps * ramp(t, c.nextStep + 0.6, 0.3),
  });
  nameText(L("下一步都不一样", "A different next step"), nx + 40, TOP - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: steps,
  });
}

/* 05.3 One passing never means another has: the sentence that says "done" stands beside the stack, the local proof's
 * check beats and the inference to another plane is refused; the sentence is then linked to the one plane verified. */
export function verifiedStage(s, t, c, g) {
  ruleTwoHeading(t, c, g);
  const one = rowOf(TOP, 0);
  planeStack(t, ASIDE, TOP, { alpha: g });
  beats(t, ASIDE + PLANE_W - 36, one, 24, [c.first3b], { alpha: g });
  rejectedName(
    L("另一样也通过", "Another has passed"),
    ASIDE + PLANE_W / 2,
    TOP + 5 * PLANE_STEP + 18,
    { alpha: g * named(t, c.another), mark: ramp(t, c.another + 0.35, 0.35) },
  );
  const PX = 1400,
    PY = rowOf(TOP, 2),
    edge = claimPanel(t, PX, PY, { alpha: g }),
    verified = g * named(t, c.verified);
  beats(t, edge.right, PY, 20, [c.saysDone], { alpha: g });
  link(edge.left, PY, ASIDE + PLANE_W, one, {
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
 * with what it alone permits and block and unknown with their conditions; unknown is never permission. The checks
 * with no result are linked to unknown, and "no problem" is refused. The stack rises a little to keep the balance. */
export function outcomesStage(s, t, c, g) {
  const top = mix(TOP, 340, soon(t, c.first4 + 0.05, 0.7)),
    LX = ASIDE + PLANE_W + 80,
    names = L(["通过", "拦下", "未知"], ["Pass", "Block", "Unknown"]),
    quals = L(
      [["允许动手"], ["有冲突，或者明确失败"], ["缺了，或者没法核实"]],
      [["lets work go ahead"], ["a conflict or an explicit failure"], ["missing or unverifiable"]],
    ),
    kinds = ["pass", "block", "unknown"],
    ats = [c.pass, c.block, c.unknown],
    qualAts = [c.ahead, c.conflict, c.missing],
    ys = [top + 90, top + 180, top + 270];
  planeStack(t, ASIDE, top, { alpha: g });
  termRow(
    t,
    L(["一次判断的结果"], ["A judgment"]),
    [c.first4],
    L(["只分三种"], ["only three outcomes"]),
    [c.three],
    LX - 18,
    top,
    { alpha: g, width: 1824 - LX },
  );
  const restated = [[c.onlyPass], [c.isBlock], [c.isUnknownToo]];
  ats.forEach((at, i) => {
    verdictMark(kinds[i], LX, ys[i], 18, { alpha: g * ramp(t, at - 0.15, 0.4) });
    beats(t, LX, ys[i], 26, restated[i], { alpha: g });
    termRow(t, [names[i]], [at], quals[i], [qualAts[i]], LX + 18 + NAME_GAP, ys[i] - 15, {
      alpha: g * listLevel(t, ats, i),
      set: "outcomes",
      width: 1800 - LX,
    });
  });
  nameText(L("不等于可以", "Never permission"), LX + 18 + NAME_GAP, ys[2] + 46, {
    align: "left",
    alpha: g * named(t, c.never),
  });
  // The example: the checks on GitLab and GitHub, with no result yet, are unknown.
  const two = rowOf(top, 1),
    example = g * named(t, c.isUnknown);
  beats(t, ASIDE + PLANE_W - 36, two, 22, [c.example, c.notYet], { alpha: g });
  link(ASIDE + PLANE_W, two, LX - 26, ys[2], {
    route: "hvh",
    alpha: example,
    upto: soon(t, c.isUnknown + 0.05, 0.5),
    flow: (voiceTime(t) * 0.45) % 1,
  });
  rejectedName(L("没有问题", "No problem"), ASIDE + PLANE_W / 2, top + 5 * PLANE_STEP + 18, {
    alpha: g * named(t, c.noProblem),
    mark: ramp(t, c.noProblem + 0.35, 0.35),
  });
}

/* 05.5 A distinction that changes no action is never added: a sixth plane is offered under the five, refused and left
 * dashed, one more thing to keep track of; the five that matter stand bracketed. */
export function refusedStage(s, t, c, g) {
  const settle = soon(t, c.first5 + 0.05, 0.7),
    top = mix(340, 320, settle),
    x = mix(ASIDE, 480, settle),
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
  nameText(L("真正要紧的那几个", "The ones that matter"), bx + NAME_GAP, rowOf(top, 2), {
    align: "left",
    alpha: matter,
  });
}
