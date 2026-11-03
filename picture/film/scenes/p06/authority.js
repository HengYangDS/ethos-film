/* Part 06, rule three (06.3-06.5): keep authority separate from views. The mark stands large and its boundary closes on
 * the rule's words: inside it, what a judgment may rest on builds as a list of six; outside, beyond the opening, the
 * views that are derived from it for people to read, the opening sentence among them. A view computed earlier does
 * not show that the branch inside has moved on; it helps people see but never counts as authority, acting on it can
 * overwrite someone else's work, and when authority is ambiguous or stale the judgment cannot pass. */

import { ctx } from "../../canvas.js";
import { commitRow } from "../../drawing/history.js";
import { link } from "../../drawing/links.js";
import { ethosMark } from "../../drawing/mark.js";
import { measure, stroke } from "../../drawing/strokes.js";
import { cross, documentIcon, stopSign } from "../../drawing/symbols.js";
import { bubble, commitDot, terminalIcon } from "../../drawing/workspace.js";
import { beats, listIn, listLevel, named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, growName, nameText, rejectedName, termRow } from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { card } from "../p04/marks.js";
import { claimPanel } from "../claim.js";

/* The mark at the scale of rule three: its origin at (MX, MY), its boundary of radius R. */
const MX = 740,
  MY = 510,
  SIZE = 980,
  R = (164 * SIZE) / 512,
  OPEN = MX + 0.82 * R;
const flowOf = (t) => (voiceTime(t) * 0.4) % 1;

/* Rule three's heading at the upper right, outside the mark; in 06.3 what authority means joins it as a note. */
const HX = 1040;
function ruleThreeHeading(t, c, g, { meaning = false } = {}) {
  nameText(L("第三条准则", "Rule three"), HX, 364, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.number),
  });
  nameText(L("把权威依据和视图分开", "Keep authority separate from views"), HX, 400, {
    align: "left",
    alpha: g * named(t, c.statement),
  });
  if (meaning)
    nameText(L("一次判断可以凭借的东西", "What a judgment may rest on"), HX, 440, {
      align: "left",
      size: NOTE,
      alpha: g * named(t, c.restOn),
    });
}

/* The six sources of authority, three above the passages and three below, each a point at its row's start and its
 * name; `named` gives each name's ink. */
const SOURCES = () =>
  L(
    [
      "用户当下的指令",
      "仓库里的真实内容",
      "已经采纳的正式变更",
      "刚观察到的事实",
      "适用的规则",
      "仍然有效的存证",
    ],
    [
      "Current instruction",
      "Repository contents",
      "The accepted Change",
      "Fresh facts",
      "The applicable policy",
      "Valid attestations",
    ],
  );
const ROWS = [-230, -180, -130, 130, 180, 230].map((d) => MY + d);
function sources(t, c, g, { names = 1 } = {}) {
  const ats = c.sources;
  SOURCES().forEach((v, i) => {
    const on = g * ramp(t, ats[i] - 0.15, 0.4),
      w = measure(v, NOTE),
      x = MX - 20;
    stroke(
      () => {
        ctx.moveTo(x - w / 2 - 16 + 4, ROWS[i]);
        ctx.arc(x - w / 2 - 16, ROWS[i], 4, 0, Math.PI * 2);
      },
      { color: P.ink, alpha: on, width: 4 },
    );
    nameText(v, x + 4, ROWS[i], {
      size: NOTE,
      alpha: g * names * listIn(t, ats, i),
      set: "sources",
    });
  });
}

/* The mark, its boundary closing on the rule's words, with authority named inside at the datum's left. In 06.3 it
 * enters at the size rule two left it, beside the heading, and grows into place as its boundary closes. */
function boundaryMark(t, c, g, { grow = 1 } = {}) {
  ethosMark(mix(800, MX, grow), mix(470, MY, grow), mix(760, SIZE, grow), {
    datum: g,
    hole: 1,
    passages: 1,
    boundary: soon(t, c.statement + 0.05, 1.2),
    alpha: g,
  });
  beats(t, MX, MY, 40, [c.inEthos], { alpha: g * grow });
  nameText(L("权威依据", "Authority"), MX - 27 - NAME_GAP, MY, {
    align: "right",
    alpha: g * named(t, c.authority),
  });
}

/* 06.3 Authority inside the boundary: the mark large, its boundary closing as the rule is stated, authority named at
 * the datum and its six sources built as a list on their words. */
export function authorityStage(s, t, c, g) {
  ruleThreeHeading(t, c, g, { meaning: true });
  boundaryMark(t, c, g, { grow: soon(t, c.statement + 0.05, 1.1) });
  sources(t, c, g);
}

/* The views outside the boundary, beyond its opening: a summary, a dashboard, status output and an Agent's report,
 * each an icon with its name, each linked from inside through the opening. */
const VX = 1210,
  VIEW_YS = [420, 505, 590, 675];
const VIEWS = () =>
  L(
    ["摘要", "看板", "状态输出", "Agent 的汇报"],
    ["Summaries", "Dashboards", "Status output", "An Agent's report"],
  );
function viewIcon(i, a) {
  const y = VIEW_YS[i];
  if (i === 0) documentIcon(VX - 22, y - 28, 44, 56, { alpha: a, rows: 2, fold: false });
  else if (i === 1) {
    card(VX - 30, y - 24, 60, 48, { alpha: a, color: P.ink });
    stroke(
      () => {
        for (let k = 0; k < 3; k++) {
          const x = VX - 16 + k * 16;
          ctx.moveTo(x - 5, y);
          ctx.lineTo(x - 1, y + 5);
          ctx.lineTo(x + 6, y - 5);
        }
      },
      { color: P.ink, alpha: a, width: 2.5 },
    );
  } else if (i === 2) terminalIcon(VX - 32, y - 26, 64, 52, { alpha: a });
  else bubble(VX, y, 22, { alpha: a, color: P.ink });
}
function views(t, c, g, { only = null, flow = null, linked = true } = {}) {
  // The four views build and leave as one list; one view kept on alone after them is no longer that list's member.
  const ats = c.views,
    names = VIEWS(),
    set = only === null ? "views" : "view";
  names.forEach((v, i) => {
    if (only !== null && only !== i) return;
    const on = g * ramp(t, ats[i] - 0.15, 0.4);
    if (linked)
      link(OPEN - 40, MY, VX - 36, VIEW_YS[i], {
        route: "hvh",
        mid: OPEN + 60,
        alpha: on,
        flow: flow === null ? null : (flow + i * 0.25) % 1,
      });
    viewIcon(i, on);
    if (i === 1)
      termRow(
        t,
        [v],
        [ats[i]],
        L(["那片绿灯"], ["that green dashboard"]),
        [c.thatGreen],
        VX + 40,
        VIEW_YS[i] - 15,
        {
          alpha: g * (only === null ? listLevel(t, ats, i) : 1),
          set,
          width: 1800 - VX,
        },
      );
    else
      nameText(v, VX + 40, VIEW_YS[i], {
        align: "left",
        alpha: g * listIn(t, ats, i),
        set,
      });
  });
}

/* 06.4 Views outside: each view arrives on its words, linked from inside through the opening; the links carry their
 * derivation, the views are named, the dashboard is that green one, and the opening sentence joins them as a report. */
export function viewsStage(s, t, c, g) {
  boundaryMark(t, c, g);
  views(t, c, g, { flow: ramp(t, c.derived, 0.4) > 0.5 ? flowOf(t) : null });
  nameText(L("给人看的视图", "Views"), VX - 36, VIEW_YS[0] - 40 - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.areViews),
  });
  const report = g * named(t, c.sentence);
  const panel = claimPanel(t, 1400, 770, { alpha: report });
  link(VX, VIEW_YS[3] + 26, 1400 - 120, panel.top, { route: "vh", alpha: report });
  beats(t, VX, VIEW_YS[3], 34, [c.suchReport], { alpha: g });
}

/* The branch inside the boundary, what the repository actually contains: four commits and, once things change, a
 * fifth, someone else's work. */
const BX = 520,
  BY = 384,
  BSTEP = 70,
  BEND = BX + 4 * BSTEP;
function innerBranch(t, c, g, moved, { named: says = true } = {}) {
  commitRow(BX, BSTEP, BY, 4, { alpha: g, single: true });
  stroke(
    () => {
      ctx.moveTo(BX + 3 * BSTEP + 9, BY);
      ctx.lineTo(mix(BX + 3 * BSTEP + 9, BEND - 9, moved), BY);
    },
    { color: P.ink, alpha: g * ramp(moved, 0, 0.1), width: 2.5 },
  );
  commitDot(BEND, BY, { alpha: g * ramp(moved, 0.6, 0.4) });
  if (says)
    nameText(L("情况可能又变了", "Things can change"), 700, BY - 22 - NAME_GAP + 8, {
      valign: "bottom",
      alpha: g * named(t, c.change),
    });
}

/* 06.5 A stale view: the dashboard was computed from inside; inside, the branch then moves on, and the view still
 * shows what it showed, without showing the change. */
export function staleViewStage(s, t, c, g) {
  boundaryMark(t, c, g);
  views(t, c, g, { only: 1, flow: flowOf(t) });
  nameText(L("视图算出来以后", "Computed"), VX + 40, VIEW_YS[1] - 46, {
    align: "left",
    alpha: g * named(t, c.first5),
  });
  innerBranch(t, c, g, soon(t, c.change + 0.05, 0.7));
  beats(t, VX, VIEW_YS[1], 36, [c.notShown, c.turnedGreen], { alpha: g });
  nameText(L("看不出来", "Without the view showing it"), VX + 40, VIEW_YS[1] + 46, {
    align: "left",
    alpha: g * named(t, c.notShown),
  });
}

/* 06.5 Not authority: the view helps people see, but taken as authority its relation back into the boundary is
 * struck at the opening; acting on it would overwrite the new commit, someone else's work; and when authority is
 * ambiguous or stale, the judgment cannot pass. */
export function notAuthorityStage(s, t, c, g) {
  boundaryMark(t, c, g);
  views(t, c, g, { only: 1, linked: false });
  innerBranch(t, c, g, 1, { named: false });
  nameText(L("帮人看清楚", "Helps people see"), VX + 40, VIEW_YS[1] - 46, {
    align: "left",
    alpha: g * named(t, c.first5b),
  });
  // Taken as authority: a dashed relation from the view back into the boundary, struck at the opening; acting on the
  // view carries it on to the new commit, which it would overwrite.
  const refused = g * named(t, c.never),
    reach = mix(0.45, 1, soon(t, c.act + 0.05, 0.9)) * soon(t, c.never + 0.05, 0.5),
    MOUTH = OPEN + 26;
  link(VX - 36, VIEW_YS[1], BEND, BY + 22, {
    route: "hv",
    alpha: refused,
    dash: [8, 9],
    upto: reach,
  });
  cross(MOUTH, VIEW_YS[1], 20, { color: P.ink, alpha: refused, width: 3 });
  rejectedName(L("当权威依据", "Counts as authority"), MOUTH + 4, VIEW_YS[1] + 44, {
    alpha: refused,
    mark: 0,
    align: "left",
  });
  const over = g * named(t, c.overwrite);
  cross(BEND, BY, 14, { color: P.ink, alpha: over, width: 3 });
  nameText(L("覆盖掉别人的工作", "Overwrite someone else's work"), 700, BY - 22 - NAME_GAP + 8, {
    valign: "bottom",
    size: NOTE,
    width: 260,
    alpha: over,
  });
  // The judgment cannot pass: a stop beside the views, its conditions above it.
  const stop = g * named(t, c.cannotPass);
  growName(
    t,
    L(["不明确，", "或者已经过时"], ["Ambiguous", " or stale"]),
    [c.ambiguous, c.stale],
    VX - 30,
    318,
    {
      size: NOTE,
      color: P.muted,
      alpha: g,
      build: true,
    },
  );
  stopSign(VX - 8, 372, 18, { color: P.ink, alpha: stop });
  nameText(L("判断就不能通过", "The judgment cannot pass"), VX + 22, 372, {
    align: "left",
    alpha: stop,
  });
}
