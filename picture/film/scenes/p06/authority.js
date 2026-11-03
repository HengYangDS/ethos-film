/* Part 06, rule three (06.3-06.5): keep authority separate from views. Rule three's heading stands in the rules' shared
 * place, its text alone, with what authority means under the statement as a note; the mark is the rule's stage. In 06.3
 * the mark stands under the heading, centred on the frame, and its boundary closes on the rule's words: inside it, what
 * a judgment may rest on builds as a list of six. From 06.4, once the heading has gone, the mark stands large at the
 * left with the views that are derived from it for people to read beyond its opening, the opening sentence among them;
 * the cut on the views' first word moves it there, as the gate and the branch move at the cut into 06.2. A view
 * computed earlier does not show that the branch inside has moved on; it helps people see but never counts as
 * authority, acting on it can overwrite someone else's work, and when authority is ambiguous or stale the judgment
 * cannot pass. */

import { ctx } from "../../canvas.js";
import { commitRow } from "../../drawing/history.js";
import { link } from "../../drawing/links.js";
import { ethosMark, markExtent } from "../../drawing/mark.js";
import { labelSize, measure, stroke } from "../../drawing/strokes.js";
import { cross, documentIcon, stopSign } from "../../drawing/symbols.js";
import { bubble, commitDot, terminalIcon } from "../../drawing/workspace.js";
import { ruleHeading, ruleHeadingLayout } from "../../framing/rules.js";
import { beats, listIn, listLevel, named } from "../../naming/lists.js";
import {
  LEADING,
  NAME_GAP,
  NOTE,
  TERM_GAP,
  TERM_STACK,
  growName,
  nameText,
  termRow,
} from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { card } from "../p04/marks.js";
import { claimPanel, claimWidth } from "../claim.js";

const FULL = { datum: 1, passages: 1, boundary: 1 };
const flowOf = (t) => (voiceTime(t) * 0.4) % 1;

/* Rule three's heading: its number, its statement and, under the statement in the note style, what authority means. */
const RULE = () => ({
  number: L("第三条准则", "Rule three"),
  statement: L("把权威依据和视图分开", "Keep authority separate from views"),
  note: L("一次判断可以凭借的东西", "What a judgment may rest on"),
});
/* The heading drawn in the rules' shared place, without a glyph; the note joins it on its own words. */
function ruleThreeHeading(t, c, g) {
  const { number, statement, note } = RULE(),
    h = ruleHeading(t, {
      number,
      numberAt: c.number,
      statement,
      statementAt: c.statement,
      alpha: g,
    });
  nameText(note, h.tx, h.bottom + TERM_STACK, {
    align: "left",
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.restOn),
  });
}

/* The mark's two places, each its origin (x, y) and its size. In 06.3 it stands under the heading, centred on the frame
 * by its ink, its boundary one line height clear of the heading's note, and as large as the band left under the heading
 * holds above the captions. From 06.4 it stands at the original size on the content centre line, placed so that the
 * mark, the views beyond its opening and the report's panel under them stand centred together. */
const AUTHORITY_SIZE = 840,
  VIEWS_SIZE = 980,
  VIEWS_Y = 510;
function authorityPlace() {
  const { number, statement } = RULE(),
    h = ruleHeadingLayout(number, statement, 0, {}),
    noteBottom = h.bottom + TERM_STACK + labelSize(NOTE),
    e = markExtent(AUTHORITY_SIZE, FULL);
  return {
    x: 960 - (e.left + e.right) / 2,
    y: noteBottom + labelSize(LABEL) * LEADING - e.top,
    size: AUTHORITY_SIZE,
  };
}

/* The views beyond the opening: a summary, a dashboard, status output and an Agent's report, each an icon with its
 * name, linked from inside through the opening. The icons stand on one column VIEW_RUN px beyond the opening, centred
 * on it; their names start VIEW_TEXT px from it, 16 px clear of the widest icon, the terminal; the dashboard, the view
 * kept on alone in 06.5, stands on the mark's axis. The opening sentence stands under them as a report, its panel's
 * left edge PANEL_LEFT px from the icons' column. */
const VIEW_RUN = 213,
  VIEW_TEXT = 48,
  VIEW_STEP = 90,
  PANEL_LEFT = -120;
const VIEWS = () =>
  L(
    ["摘要", "看板", "状态输出", "Agent 的汇报"],
    ["Summaries", "Dashboards", "Status output", "An Agent's report"],
  );
const GREEN = () => L(["那片绿灯"], ["that green dashboard"]),
  VIEWS_NAME = () => L("给人看的视图", "Views");
/* The opening's place for a mark at `size`, from its origin. */
const openingOf = (size) => 0.82 * 164 * (size / 512);
/* The parts beyond the opening, each with how far right of the mark's origin it reaches: the list of the four views,
 * laid out whole from its first word since its members join it within a few seconds; its heading; the dashboard's
 * qualifier after its name; and the report's panel under the list. `c` gives when each arrives. */
function viewsParts(c = {}) {
  const run = openingOf(VIEWS_SIZE) + VIEW_RUN,
    names = VIEWS();
  return [
    [c.views?.[0], run + VIEW_TEXT + Math.max(...names.map((v) => measure(v)))],
    [c.areViews, run - 32 + measure(VIEWS_NAME())],
    [c.thatGreen, run + VIEW_TEXT + measure(names[1]) + TERM_GAP + measure(GREEN()[0], NOTE)],
    [c.sentence, run + PANEL_LEFT + claimWidth()],
  ];
}
/* How far right the views reach at t as they build: a part that reaches further than those before it widens the
 * whole, gliding from just after its words. */
function viewsReach(t, c) {
  const parts = viewsParts(c).sort((a, b) => a[0] - b[0]);
  let reach = parts[0][1],
    now = reach;
  for (const [at, right] of parts.slice(1)) {
    if (right <= reach) continue;
    now += (right - reach) * soon(t, at + 0.05, 0.8);
    reach = right;
  }
  return now;
}
/* The mark's place from 06.4: the mark and what beyond its opening reaches `reach` px right of its origin, centred
 * together; by default, once every part stands. */
function viewsPlace(reach = Math.max(...viewsParts().map(([, right]) => right))) {
  const e = markExtent(VIEWS_SIZE, FULL);
  return { x: 960 - (e.left + reach) / 2, y: VIEWS_Y, size: VIEWS_SIZE };
}
/* Where the views stand for the mark at `place`. */
function viewsOf({ x, y, size }) {
  const open = x + openingOf(size),
    vx = open + VIEW_RUN;
  return { open, vx, text: vx + VIEW_TEXT, ys: [-1, 0, 1, 2].map((k) => y + k * VIEW_STEP) };
}

/* The six sources of authority, three above the passages and three below, centred in the bowl on the mark's ink
 * centre, which in 06.3 is the frame's axis and the heading's: a centred list, so its rows have no points before them. */
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
/* The rows' offsets from the origin for the mark at AUTHORITY_SIZE: each row clear of the boundary and of the
 * passages, at one pitch within each group. */
const SOURCE_ROWS = [-169, -135, -101, 101, 135, 169];
function sources(t, c, g, { x, y, size }) {
  const e = markExtent(size, FULL),
    axis = x + (e.left + e.right) / 2,
    k = size / AUTHORITY_SIZE;
  SOURCES().forEach((v, i) =>
    nameText(v, axis, y + SOURCE_ROWS[i] * k, {
      size: NOTE,
      alpha: g * listIn(t, c.sources, i),
      set: "sources",
    }),
  );
}

/* The mark at `place`, its boundary closing on the rule's words, with authority named inside at the datum's left. */
function boundaryMark(t, c, g, { x, y, size }) {
  const k = size / 512;
  ethosMark(x, y, size, {
    datum: g,
    hole: 1,
    passages: 1,
    boundary: soon(t, c.statement + 0.05, 1.2),
    alpha: g,
  });
  beats(t, x, y, 21 * k, [c.inEthos], { alpha: g });
  nameText(L("权威依据", "Authority"), x - 14 * k - NAME_GAP, y, {
    align: "right",
    alpha: g * named(t, c.authority),
  });
}

/* 06.3 Authority inside the boundary: the heading in the rules' place and the mark in its place under it, its boundary
 * closing on the statement; authority is named at the datum and its six sources build as a list on their words. */
export function authorityStage(s, t, c, g) {
  ruleThreeHeading(t, c, g);
  const at = authorityPlace();
  boundaryMark(t, c, g, at);
  sources(t, c, g, at);
}

function viewIcon(i, x, y, a) {
  if (i === 0) documentIcon(x - 22, y - 28, 44, 56, { alpha: a, rows: 2, fold: false });
  else if (i === 1) {
    card(x - 30, y - 24, 60, 48, { alpha: a, color: P.ink });
    stroke(
      () => {
        for (let k = 0; k < 3; k++) {
          const cx = x - 16 + k * 16;
          ctx.moveTo(cx - 5, y);
          ctx.lineTo(cx - 1, y + 5);
          ctx.lineTo(cx + 6, y - 5);
        }
      },
      { color: P.ink, alpha: a, width: 2.5 },
    );
  } else if (i === 2) terminalIcon(x - 32, y - 26, 64, 52, { alpha: a });
  else bubble(x, y, 22, { alpha: a, color: P.ink });
}
function views(t, c, g, place, { only = null, flow = null, linked = true } = {}) {
  // The four views build and leave as one list; one view kept on alone after them is no longer that list's member.
  const ats = c.views,
    names = VIEWS(),
    v = viewsOf(place),
    set = only === null ? "views" : "view";
  names.forEach((name, i) => {
    if (only !== null && only !== i) return;
    const on = g * ramp(t, ats[i] - 0.15, 0.4);
    if (linked)
      link(v.open - 40, place.y, v.vx - 36, v.ys[i], {
        route: "hvh",
        mid: v.open + 60,
        alpha: on,
        flow: flow === null ? null : (flow + i * 0.25) % 1,
      });
    viewIcon(i, v.vx, v.ys[i], on);
    if (i === 1)
      termRow(t, [name], [ats[i]], GREEN(), [c.thatGreen], v.text, v.ys[i] - labelSize(LABEL) / 2, {
        alpha: g * (only === null ? listLevel(t, ats, i) : 1),
        set,
        width: 1800 - v.text,
      });
    else
      nameText(name, v.text, v.ys[i], {
        align: "left",
        alpha: g * listIn(t, ats, i),
        set,
      });
  });
}

/* 06.4 Views outside: each view arrives on its words, linked from inside through the opening; the links carry their
 * derivation, the views are named under a heading on the icons' column, the dashboard is that green one, and the
 * opening sentence joins them as a report, its panel under the report's bubble. The mark and the views stand centred
 * on what of them stands, and glide left as a wider part joins them. */
export function viewsStage(s, t, c, g) {
  const place = viewsPlace(viewsReach(t, c)),
    v = viewsOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { flow: ramp(t, c.derived, 0.4) > 0.5 ? flowOf(t) : null });
  nameText(VIEWS_NAME(), v.vx - 32, v.ys[0] - 40 - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.areViews),
  });
  const report = g * named(t, c.sentence),
    py = v.ys[3] + 95,
    panel = claimPanel(t, v.vx + PANEL_LEFT + claimWidth() / 2, py, { alpha: report });
  link(v.vx, v.ys[3] + 26, v.vx, panel.top, { alpha: report });
  beats(t, v.vx, v.ys[3], 34, [c.suchReport], { alpha: g });
}

/* The branch inside the boundary, what the repository actually contains: four commits and, once things change, a
 * fifth, someone else's work, in the bowl above the passages; what is said of it centres over it. */
const BSTEP = 70;
function branchOf({ x, y }) {
  const bx = x - 180;
  return { bx, by: y - 126, end: bx + 4 * BSTEP, mid: bx + 2 * BSTEP };
}
function innerBranch(t, c, g, place, moved, { named: says = true } = {}) {
  const b = branchOf(place);
  commitRow(b.bx, BSTEP, b.by, 4, { alpha: g, single: true });
  stroke(
    () => {
      ctx.moveTo(b.bx + 3 * BSTEP + 9, b.by);
      ctx.lineTo(mix(b.bx + 3 * BSTEP + 9, b.end - 9, moved), b.by);
    },
    { color: P.ink, alpha: g * ramp(moved, 0, 0.1), width: 2.5 },
  );
  commitDot(b.end, b.by, { alpha: g * ramp(moved, 0.6, 0.4) });
  if (says)
    nameText(L("情况可能又变了", "Things can change"), b.mid, b.by - 22 - NAME_GAP + 8, {
      valign: "bottom",
      alpha: g * named(t, c.change),
    });
}

/* 06.5 A stale view: the dashboard was computed from inside; inside, the branch then moves on, and the view still
 * shows what it showed, without showing the change. What is said of the view stands on its names' column. */
export function staleViewStage(s, t, c, g) {
  const place = viewsPlace(),
    v = viewsOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { only: 1, flow: flowOf(t) });
  nameText(L("视图算出来以后", "Computed"), v.text, v.ys[1] - 46, {
    align: "left",
    alpha: g * named(t, c.first5),
  });
  innerBranch(t, c, g, place, soon(t, c.change + 0.05, 0.7));
  beats(t, v.vx, v.ys[1], 36, [c.notShown, c.turnedGreen], { alpha: g });
  nameText(L("看不出来", "Without the view showing it"), v.text, v.ys[1] + 46, {
    align: "left",
    alpha: g * named(t, c.notShown),
  });
}

/* 06.5 Not authority: the view helps people see, but taken as authority its relation back into the boundary is
 * struck at the opening, with what is refused under the cross, clear of the view; acting on it would overwrite the new
 * commit, someone else's work; and when authority is ambiguous or stale, the judgment cannot pass. The stop stands on
 * the icons' column and every line of the column starts on the names' column. */
export function notAuthorityStage(s, t, c, g) {
  const place = viewsPlace(),
    v = viewsOf(place),
    b = branchOf(place);
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { only: 1, linked: false });
  innerBranch(t, c, g, place, 1, { named: false });
  nameText(L("帮人看清楚", "Helps people see"), v.text, v.ys[1] - 46, {
    align: "left",
    alpha: g * named(t, c.first5b),
  });
  // Taken as authority: a dashed relation from the view back into the boundary, struck at the opening; acting on the
  // view carries it on to the new commit, which it would overwrite.
  const refused = g * named(t, c.never),
    reach = mix(0.45, 1, soon(t, c.act + 0.05, 0.9)) * soon(t, c.never + 0.05, 0.5),
    counts = L("当权威依据", "Counts as authority"),
    // The cross stands in the gap between the opening and the view, its words centred under it within that gap,
    // ending at least 20 px before the view, so they stay clear of the passages inside.
    room = v.vx - 30 - 20 - v.open,
    mouth = v.open + room / 2;
  link(v.vx - 36, v.ys[1], b.end, b.by + 22, {
    route: "hv",
    alpha: refused,
    dash: [8, 9],
    upto: reach,
  });
  cross(mouth, v.ys[1], 20, { color: P.ink, alpha: refused, width: 3 });
  nameText(counts, mouth, v.ys[1] + 44 - labelSize(LABEL) / 2, {
    valign: "top",
    width: room,
    color: P.muted,
    alpha: refused,
  });
  const over = g * named(t, c.overwrite);
  cross(b.end, b.by, 14, { color: P.ink, alpha: over, width: 3 });
  nameText(
    L("覆盖掉别人的工作", ["Overwrite", "someone else's work"]),
    b.mid,
    b.by - 22 - NAME_GAP + 8,
    {
      valign: "bottom",
      alpha: over,
    },
  );
  // The judgment cannot pass: a stop on the icons' column beside the views, its conditions above its words.
  const stop = g * named(t, c.cannotPass);
  growName(
    t,
    L(["不明确，", "或者已经过时"], ["Ambiguous", " or stale"]),
    [c.ambiguous, c.stale],
    v.text,
    318,
    {
      size: NOTE,
      color: P.muted,
      alpha: g,
      build: true,
    },
  );
  stopSign(v.vx, 372, 18, { color: P.ink, alpha: stop });
  nameText(L("判断就不能通过", "The judgment cannot pass"), v.text, 372, {
    align: "left",
    alpha: stop,
  });
}
