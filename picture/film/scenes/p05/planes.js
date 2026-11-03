/* Part 05 opening (05.1-05.2): the Agent's sentence returns and, by ETHOS's rules, is taken apart into its planes of
 * evidence, stacked: the local proof has passed, so the work may move forward locally; the checks on GitLab and GitHub
 * have no result yet; nothing is released, no one uses it, and there is no observation of actual benefit. Each plane
 * arrives on its words with its state, and the stack builds from below so it stays balanced as it grows. */

import { link } from "../../drawing/links.js";
import { labelSize, ring } from "../../drawing/strokes.js";
import { building, listLevel } from "../../naming/lists.js";
import { NAME_GAP, nameText, termRow } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { agents, card, verdictMark } from "../p04/marks.js";
import { CLAIM_H, claimPanel, claimWidth } from "../claim.js";

/* A plane of evidence: an outline whose name stands at its left and whose state stands at its right. The stack's top
 * stands at PLANES_TOP from the moment it is whole until it rises beside the outcomes, so the heading set over it in
 * 05.3 keeps a line height clear of rule two's glyph, which reaches y 318. */
export const PLANE_W = 700,
  PLANE_H = 58,
  PLANE_STEP = 70,
  PLANES_TOP = 420;
export const PLANE_STATES = ["pass", "unknown", "none", "none", "none"];
export const planeNames = () =>
  L(
    [["在本地做的完整核验"], ["GitLab 和 GitHub 上的检查"], ["发布"], ["使用"], ["实际效益"]],
    [
      ["The local proof"],
      ["Checks on GitLab and GitHub"],
      ["Release"],
      ["In use"],
      ["Actual benefit"],
    ],
  );
export const planeQualifier = () => L(["可以在本地接着往下走"], ["may move forward locally"]);
/* A state at the right of a plane: pass a check, unknown a question mark, and nothing yet an empty dashed ring. */
export function planeState(kind, x, y, alpha) {
  if (kind === "none") ring(x, y, 15, { color: P.line, alpha, width: 2, dash: [5, 6] });
  else verdictMark(kind, x, y, 16, { alpha });
}
/* One plane with its top-left at (x, y): outline, name (the first with its qualifier) and state. `at`, `qualAt` and
 * `stateAt` are when its name, qualifier and state arrive; `level` is its name's level in the list. */
export function plane(t, i, x, y, { alpha = 1, at, qualAt = at, stateAt = at, level = 1 }) {
  const on = alpha * ramp(t, at - 0.15, 0.4),
    cy = y + PLANE_H / 2;
  card(x, y, PLANE_W, PLANE_H, { alpha: on });
  const term = planeNames()[i];
  if (i === 0)
    termRow(t, term, [at], planeQualifier(), [qualAt], x + 24, cy - 15, {
      alpha: alpha * level,
      set: "planes",
      width: PLANE_W - 90,
    });
  else nameText(term[0], x + 24, cy, { align: "left", alpha: on * level, set: "planes" });
  planeState(PLANE_STATES[i], x + PLANE_W - 36, cy, alpha * ramp(t, stateAt - 0.15, 0.4));
}
/* The whole stack with its top-left at (x, top), every plane named and in its state. */
export function planeStack(t, x, top, { alpha = 1 } = {}) {
  for (let i = 0; i < 5; i++) plane(t, i, x, top + i * PLANE_STEP, { alpha, at: -Infinity });
}

/* The Agent and its sentence, the claim: the Agent at the left of its speech panel, linked to it. The Agent's name
 * hangs from `nameTop`. Returns the panel's edges. */
export function claimRow(
  t,
  ax,
  ay,
  px,
  py,
  { alpha = 1, flow = null, nameTop = ay + 22 + NAME_GAP } = {},
) {
  const edge = claimPanel(t, px, py, { alpha });
  agents([[ax, ay]], { alpha });
  nameText("Agent", ax, nameTop, { valign: "top", alpha });
  // The report travels from the Agent to its sentence: up from the Agent, then along to the panel.
  if (Math.abs(ay - py) < 1) link(ax + 22, ay, edge.left, py, { alpha, flow });
  else link(ax, ay - 22, edge.left, py, { route: "vh", alpha, flow });
  return edge;
}
/* On a middle anchor the Latin face's alphabetic baseline stands 0.1 em above the CJK face's (their typo boxes are
 * 0.78/0.22 and 0.88/0.12 em), so a Latin name beside a name set in the CJK face drops by that much to share the
 * baseline of its neighbour's Latin words. */
const CJK = /[\u4e00-\u9fff]/u;
const latinDrop = (name, neighbour) =>
  CJK.test(neighbour) && !CJK.test(name) ? 0.1 * labelSize(LABEL) : 0;
/* Where the claim stands: the Agent lower left of its panel while it is the whole picture, side by side at the top once
 * its first plane arrives. */
function claimAt(t, c) {
  const w = claimWidth(),
    rise = soon(t, c.local + 0.05, 0.7),
    gap = mix(560, 260, rise),
    ax = 960 - (w + gap) / 2;
  return { ax, ay: mix(600, 214, rise), px: ax + gap + w / 2, py: mix(420, 214, rise), rise };
}

/* 05.1-05.2 The sentence returns, the Agent lower left and its panel upper right so the claim stands as a block, and
 * is taken apart: under the sentence, the rule that takes it apart is named, centred on the panel from its first word
 * with "taken apart" under it; with the first plane the claim rises to the top, where the Agent's name and the rule's
 * hang from one line under the panel, the deeper mark of the two, and the planes build from below on their words, each
 * with its state, the stack rising one step as each plane joins. */
export function apartStage(s, t, c, g) {
  const { ax, ay, px, py, rise } = claimAt(t, c),
    under = py + CLAIM_H / 2 + NAME_GAP,
    rule = L("按 ETHOS 的规则", "By ETHOS's rules");
  claimRow(t, ax, ay, px, py, {
    alpha: g,
    flow: (voiceTime(t) * 0.4) % 1,
    // The Agent's name keeps its gap under the Agent while it rises and joins the panel's line as the two come level,
    // on the baseline of the rule's name beside it.
    nameTop:
      Math.max(ay + 22, mix(ay + 22, py + CLAIM_H / 2, rise)) +
      NAME_GAP +
      rise * latinDrop("Agent", rule),
  });
  // The first plane waits a moment on its words so the rising Agent has cleared its place.
  const ats = [c.local + 0.35, c.ci, c.release, c.use, c.benefit],
    stateAts = [c.passed, c.noResult, c.release, c.use, c.noObs],
    x = 960 - PLANE_W / 2,
    top = PLANES_TOP + building(t, ats, PLANE_STEP, 0.15);
  termRow(t, [rule], [c.first2], L(["拆开来看"], ["taken apart"]), [c.apart], px, under, {
    alpha: g,
    align: "center",
  });
  ats.forEach((at, i) =>
    plane(t, i, x, top + i * PLANE_STEP, {
      alpha: g,
      at,
      qualAt: c.forward,
      stateAt: stateAts[i],
      level: listLevel(t, ats, i),
    }),
  );
}
