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
import { FLOW_EVERY, flowClock, link, linkPoints } from "../../drawing/links.js";
import { ethosMark, markExtent } from "../../drawing/mark.js";
import { drawnShare, labelSize, lengthOf, measure, ring, stroke } from "../../drawing/strokes.js";
import { cross, documentIcon, stopSign } from "../../drawing/symbols.js";
import { bubble, terminalIcon } from "../../drawing/workspace.js";
import { ruleHeading, ruleHeadingLayout } from "../../framing/rules.js";
import { beats, listIn, listLevel, named, reachAt } from "../../naming/lists.js";
import {
  LEADING,
  NAME_GAP,
  NOTE,
  TERM_GAP,
  TERM_STACK,
  nameText,
  termRow,
  termRowLayout,
} from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cueFrom } from "../../timing/cues.js";
import { mix, ramp } from "../../timing/easing.js";
import { glideShare } from "../../timing/pauses.js";
import { STAGE_CUT } from "../../timing/stages.js";
import { card } from "../p04/marks.js";
import { claimPanel, claimWidth } from "../claim.js";

const FULL = { datum: 1, passages: 1, boundary: 1 };

/* Rule three's heading: its number, its statement and, under the statement in the note style, what authority means. */
const RULE = () => ({
  number: L("第三条准则", "Rule three"),
  statement: L("把权威依据和视图分开", "Keep authority separate from views"),
  note: L("一次判断可以凭借的东西", "What a judgment may rest on"),
});
/* The heading drawn in the rules' shared place, without a glyph; the note joins it on its own words. It stands from the
 * thought's first words, its number arriving over the example it names, and stays while the mark is the rule's
 * stage. The statement leads its words by a fifth of a second, within their clause, so it names the mark that comes in
 * on the rule's name within 0.6 s. */
export function ruleThreeHeading(t, c, g) {
  const { number, statement, note } = RULE(),
    h = ruleHeading(t, {
      number,
      numberAt: c.number,
      statement,
      statementAt: c.statement - 0.2,
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
 * kept on alone in 06.5, stands on the mark's axis. The opening sentence stands under them as a report, hung from the
 * report's icon by a link down the icons' column; its panel's left edge stands panelLeft() px from that column. In
 * English the panel starts on the column's left edge, where the views' heading starts, so the link meets it near
 * its start rather than a third of the way along; centred on the link it would come within about 20 px of the
 * boundary's lower end. The Chinese names are short, so there the panel stands under the list of views, centred on
 * it within 10 px; set on the column it would reach about 160 px past the names, widening the views by 88 px, and the
 * mark, which keeps its place into 06.5, would stand 44 px further left in the stages after it. */
const VIEW_RUN = 213,
  VIEW_TEXT = 48,
  VIEW_STEP = 90,
  panelLeft = () => L(-120, -32);
const VIEWS = () =>
  L(
    ["摘要", "看板", "状态输出", "Agent 的汇报"],
    ["Summaries", "Dashboards", "Status output", "An Agent's report"],
  );
const GREEN = () => L(["那片绿灯"], ["that green dashboard"]),
  VIEWS_NAME = () => L("给人看的视图", "Views");
/* What 06.5's refusal says of the dashboards, agreeing with their plural name above it, and the judgment with its
 * conditions. */
const ROLE = () => L(["帮人看清楚"], ["help people see"]),
  JUDGMENT = () => L(["判断就不能通过"], ["The judgment cannot pass"]),
  CONDITIONS = () => L(["不明确", "，或者预想的状态已经过时"], ["ambiguous", " or stale"]);
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
    [c.sentence, run + panelLeft() + claimWidth()],
  ];
}
/* How far right the views reach at t as they build: a part that reaches further than those before it widens the
 * whole, gliding from just after its words (reachAt). */
function viewsReach(t, c) {
  const [first, ...rest] = viewsParts(c).sort((a, b) => a[0] - b[0]);
  return reachAt(t, first[1], rest, 0.8);
}
/* The mark's place from 06.4: the mark and what beyond its opening reaches `reach` px right of its origin, centred
 * together; by default, once every part stands. */
function viewsPlace(reach = Math.max(...viewsParts().map(([, right]) => right))) {
  const e = markExtent(VIEWS_SIZE, FULL);
  return { x: 960 - (e.left + reach) / 2, y: VIEWS_Y, size: VIEWS_SIZE };
}
/* How far 06.5's refusal reaches right of the mark's origin at t. From the cut the dashboard stands with its role
 * under it instead of its qualifier beside it, so the group narrows from the stale view's reach to that row's by the
 * structural glide, which sets off from rest at the cut; then it widens, gliding, as the judgment's conditions and the
 * judgment join the names' column on their words (reachAt), so what stands stays centred. */
function refusalReach(t, c) {
  const text = openingOf(VIEWS_SIZE) + VIEW_RUN + VIEW_TEXT,
    [first, second] = CONDITIONS(),
    before = Math.max(...viewsParts().map(([, right]) => right)),
    base = text + Math.max(measure(VIEWS()[1]), measure(ROLE()[0], NOTE)),
    settled = mix(before, base, glideShare(t, c.first5b + STAGE_CUT, (before - base) / 2));
  const parts = [
    [c.ambiguous, text + measure(first, NOTE)],
    [c.stale, text + measure(first + second, NOTE)],
    [c.cannotPass, text + measure(JUDGMENT()[0])],
  ];
  return settled + reachAt(t, base, parts, 0.8) - base;
}
/* Where the views stand for the mark at `place`. */
function viewsOf({ x, y, size }) {
  const open = x + openingOf(size),
    vx = open + VIEW_RUN;
  return { open, vx, text: vx + VIEW_TEXT, ys: [-1, 0, 1, 2].map((k) => y + k * VIEW_STEP) };
}

/* The six sources of authority, three above the passages and three below, centred in the bowl on the mark's ink
 * centre, which in 06.3 is the frame's axis and the heading's: a centred list, so its rows have no points before them.
 * Each is named in the narration's words, as a noun, so the list names the inputs rather than re-setting the sentence
 * that reads them. */
const SOURCES = () =>
  L(
    [
      "用户当下的指令",
      "仓库里的真实内容",
      "已经采纳的正式变更",
      "刚观察到的事实",
      "适用的规定",
      "仍然有效的存证",
    ],
    [
      "Current instruction",
      "Repository contents",
      "Accepted Change",
      "Fresh facts",
      "Applicable policy",
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

/* The mark at `place`, its boundary closing round the parts the earlier rules drew, with authority named inside at the
 * datum's left. The mark arrives in the cut on the rule's name. The boundary rule three adds fades in whole from that
 * cut rather than drawing on: at the film's tip pace a ring this size takes about 2.4 s to close, so the mark would
 * stand a second unnamed while it closed. Authority is named on the statement's mention of it, so the mark stands
 * closed round its name within half a second of the cut. */
function boundaryMark(t, c, g, { x, y, size }) {
  const k = size / 512;
  ethosMark(x, y, size, { datum: g, hole: 1, passages: 1, boundary: 0, alpha: g });
  ethosMark(x, y, size, {
    datum: 0,
    passages: 0,
    boundary: 1,
    alpha: g * ramp(t, c.markCut + STAGE_CUT - 0.05, 0.45),
  });
  beats(t, x, y, 21 * k, [c.inEthos], { alpha: g });
  nameText(L("权威依据", "Authority"), x - 14 * k - NAME_GAP, y, {
    align: "right",
    alpha: g * ramp(t, c.authorityNamed - 0.35, 0.4),
  });
}

/* 06.3 Authority inside the boundary: from the rule's name the mark stands in its place under the heading, and its
 * boundary closes on the rule's statement, so the mark arrives with the words that name it; authority is named at the
 * datum and its six sources build as a list on their words. */
export function authorityStage(s, t, c, g) {
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
function views(t, c, g, place, { only = null, flow = null, since = null, linked = true, back = null, role = null } = {}) {
  // The four views build and leave as one list; one view kept on alone after them is no longer that list's member. A
  // view that returns alone (`back`, the time its words bring it back) is computed again: its link draws out from the
  // opening from the cut, and the view arrives at its end. `flow` runs the links' flows from `since`, the time they
  // begin, their dots entering from the opening then, each link's flow setting off in turn. A `role` ({text, at}) is
  // said of the dashboard kept on alone: it stands as the name's gloss under it, in place of the inline qualifier, so
  // that stage's dashboard is a set of its own rather than the green one of the stage before it.
  const ats = back === null ? c.views : c.views.map(() => back.at),
    names = VIEWS(),
    v = viewsOf(place),
    set = only === null ? "views" : role ? "dashboard" : "view";
  names.forEach((name, i) => {
    if (only !== null && only !== i) return;
    const on = g * ramp(t, ats[i] - 0.15, 0.4);
    if (linked)
      link(v.open - 40, place.y, v.vx - 36, v.ys[i], {
        route: "hvh",
        mid: v.open + 60,
        alpha: back === null ? on : g,
        draw: back === null ? null : { t, at: back.cut },
        flow: flow ? flowClock(t, i * 0.25) : null,
        flowSince: since === null ? -Infinity : flowClock(since, i * 0.25),
        flowEvery: FLOW_EVERY,
      });
    viewIcon(i, v.vx, v.ys[i], on);
    if (i === 1)
      termRow(
        t,
        [name],
        [ats[i]],
        role ? role.text : GREEN(),
        [role ? role.at : (back?.at ?? c.thatGreen)],
        v.text,
        v.ys[i] - labelSize(LABEL) / 2,
        {
          alpha: g * (only === null ? listLevel(t, ats, i) : 1),
          set,
          width: 1800 - v.text,
          inline: role ? false : null,
        },
      );
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
  views(t, c, g, place, { flow: true, since: c.derived + 0.2 });
  nameText(VIEWS_NAME(), v.vx - 32, v.ys[0] - 40 - NAME_GAP, {
    align: "left",
    valign: "bottom",
    alpha: g * named(t, c.areViews),
  });
  const report = g * named(t, c.sentence),
    py = v.ys[3] + 95,
    panel = claimPanel(t, v.vx + panelLeft() + claimWidth() / 2, py, { alpha: report });
  link(v.vx, v.ys[3] + 26, v.vx, panel.top, { alpha: report });
  beats(t, v.vx, v.ys[3], 34, [c.suchReport], { alpha: g });
}

/* The branch inside the boundary, what the repository actually contains: four commits and, once things change, a
 * fifth, someone else's work, in the bowl above the passages; what is said of it centres over it. The fifth commit is
 * its rim alone, joined to the row by the line that reaches it, so the branch stays one mark under one name; nothing
 * lies under it for a disc to cover. `a` is the branch's ink, and its name's when `says` names it. */
const BSTEP = 70;
function branchOf({ x, y }) {
  const bx = x - 180;
  return { bx, by: y - 126, end: bx + 4 * BSTEP, mid: bx + 2 * BSTEP };
}
function innerBranch(a, place, moved, says = null, landed = ramp(moved, 0.6, 0.4)) {
  const b = branchOf(place);
  commitRow(b.bx, BSTEP, b.by, 4, { alpha: a, single: true });
  stroke(
    () => {
      ctx.moveTo(b.bx + 3 * BSTEP + 9, b.by);
      ctx.lineTo(mix(b.bx + 3 * BSTEP + 9, b.end - 9, moved), b.by);
    },
    { color: P.ink, alpha: a * ramp(moved, 0, 0.1), width: 2.5 },
  );
  ring(b.end, b.by, 9, { color: P.ink, alpha: a * landed, width: 3 });
  if (says)
    nameText(says, b.mid, b.by - 22 - NAME_GAP + 8, {
      valign: "bottom",
      alpha: a,
    });
}

/* 06.5 A stale view: 06.4's views leave whole at the cut, and the dashboard returns alone as a view computed from
 * inside, its link drawing out through the opening from the cut and the view arriving at its end on the words that
 * compute it, with what is said of it; inside, the branch arrives with what is said of it, then moves on as the change
 * is said, and the view still shows what it showed, without showing the change. What is said of the view stands on
 * its names' column. */
export function staleViewStage(s, t, c, g) {
  const place = viewsPlace(),
    v = viewsOf(place),
    cut = c.first5 + STAGE_CUT,
    back = { cut, at: Math.max(c.computed, cut + 0.25) };
  boundaryMark(t, c, g, place);
  views(t, c, g, place, { only: 1, flow: true, back });
  // The Chinese name is the clause itself, whose words have begun by the cut, so it stands from the cut; the English
  // name is its one word.
  nameText(L("视图算出来以后", "Computed"), v.text, v.ys[1] - 46, {
    align: "left",
    alpha: g * named(t, L(cut + 0.15, back.at)),
  });
  // The new commit lands over 0.45 s as the line reaches it.
  innerBranch(
    g * named(t, c.changes),
    place,
    drawnShare({ t, at: c.changes + 0.05, least: 0.7 }, BSTEP - 18),
    L("又变了", "Things change"),
    ramp(t, c.changes + 0.35, 0.45),
  );
  beats(t, v.vx, v.ys[1], 36, [c.notShown, c.turnedGreen], { alpha: g });
  nameText(L("看不出来", "Not shown"), v.text, v.ys[1] + 46, {
    align: "left",
    alpha: g * named(t, c.notShown),
  });
}

/* 06.5 Not authority: the view helps people see, but taken as authority its relation back into the boundary is
 * struck at the opening, with what is refused under the cross, clear of the view; acting on it would overwrite the new
 * commit, someone else's work; and when authority is ambiguous or stale, the judgment cannot pass. The stop stands on
 * the icons' column and every line of the column starts on the names' column. Every name of the stage sets what is
 * said of it as its gloss under it, as the film does elsewhere (M5-24): the view's role under the dashboard, and the
 * conditions under the judgment. */
export function notAuthorityStage(s, t, c, g) {
  const place = viewsPlace(refusalReach(t, c)),
    v = viewsOf(place),
    b = branchOf(place);
  boundaryMark(t, c, g, place);
  // The view's role joins under the dashboard on its own words, which follow the stage's first words.
  views(t, c, g, place, {
    only: 1,
    linked: false,
    role: { text: ROLE(), at: cueFrom(s, "帮人看清楚", "helps people see", c.first5b) },
  });
  innerBranch(g, place, 1);
  // Taken as authority: a dashed relation from the view back into the boundary, struck at the opening; acting on the
  // view carries it on to the new commit, which it would overwrite. Each reach draws on at the tip pace by its own
  // length (drawnShare).
  const refused = g * named(t, c.never),
    way = lengthOf(linkPoints(v.vx - 36, v.ys[1], b.end, b.by + 22, { route: "hv" })),
    reach =
      drawnShare({ t, at: c.never + 0.05 }, way, 0.45) +
      drawnShare({ t, at: c.act + 0.05 }, way, 0.55),
    // What is refused is named in the narration's words: one line in Chinese, and in English two, broken by measure.
    counts = L("不是权威依据", "Never counts as authority"),
    // The cross stands in the gap between the opening and the view, its words centred under it, ending at least 20 px
    // before the view; they may reach 16 px inside the opening, which is clear of the passages at their height.
    room = v.vx - 30 - 20 - (v.open - 16),
    mouth = v.open - 16 + room / 2;
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
  // The English sets what is overwritten as the name's qualifier: on one line the name would reach the boundary.
  const overwrite = L(["覆盖掉别人的工作"], ["Overwrite"]),
    whose = L([], ["someone else's work"]);
  termRow(
    t,
    overwrite,
    [c.overwrite],
    whose,
    [c.overwrite],
    b.mid,
    b.by - 22 - NAME_GAP + 8 - termRowLayout(overwrite, whose, Infinity, false).height,
    { alpha: g, align: "center", inline: false },
  );
  // The judgment cannot pass: a stop on the icons' column beside the views, its conditions its gloss under its words,
  // each condition on its own words. The comma comes with the words after it, so the first condition waits for them
  // without a trailing mark.
  const stop = g * named(t, c.cannotPass);
  stopSign(v.vx, 372, 18, { color: P.ink, alpha: stop });
  termRow(
    t,
    JUDGMENT(),
    [c.cannotPass],
    CONDITIONS(),
    [c.ambiguous, c.stale],
    v.text,
    372 - labelSize(LABEL) / 2,
    { alpha: g, inline: false, build: true },
  );
}
