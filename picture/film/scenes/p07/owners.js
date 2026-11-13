/* 07.3-07.4 rule four itself: its heading with the complete mark as its glyph, nothing added; every obligation finds
 * its one owner; ETHOS holds its own repository to the same obligations, a replacement is never weaker, the declared
 * check catching every duplicate the script caught, and a Change closes on what it delivered. */

import { ctx } from "../../canvas.js";
import { flowClock, link } from "../../drawing/links.js";
import { ethosMark } from "../../drawing/mark.js";
import { fill, labelSize, measure, stroke } from "../../drawing/strokes.js";
import { check } from "../../drawing/symbols.js";
import { kernelIcon, ledger, repoIcon, terminalIcon } from "../../drawing/workspace.js";
import { KICK_Y, RULE_Y, ruleHeadingLayout } from "../../framing/rules.js";
import { listIn, named } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  nameText,
  rejectedName,
  termRow,
  termRowLayout,
} from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { clamp, mix, ramp } from "../../timing/easing.js";
import { glideShare, voiceTime } from "../../timing/pauses.js";
import { card, recordRows } from "../p04/marks.js";
import { SCRIPT, listRows, nameWidth, taskList } from "./example.js";

/* Repositories of one group drawn as one mark: their stores one fill, their outlines and branch glyphs one stroke, so
 * one name names the group. `checks` ticks each with a check of its own, again in one stroke. */
export function repoGroup(xs, y, w, h, { alpha = 1, checks = 0 } = {}) {
  if (alpha < 0.01) return;
  fill(() => xs.forEach((x) => ctx.roundRect(x - w / 2, y - h / 2, w, h, 12)), {
    color: P.row,
    alpha,
  });
  stroke(
    () =>
      xs.forEach((x) => {
        ctx.roundRect(x - w / 2, y - h / 2, w, h, 12);
        const gx = x - w / 2 + 22,
          gy = y - h / 2 + 18;
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy + 26);
        ctx.moveTo(gx, gy + 18);
        ctx.quadraticCurveTo(gx, gy + 8, gx + 14, gy + 6);
      }),
    { color: P.ink, alpha, width: 2.5 },
  );
  if (checks > 0.01)
    stroke(
      () =>
        xs.forEach((x) => {
          const cx = x + w * 0.16,
            cy = y + 4,
            k = 26;
          ctx.moveTo(cx - k * 0.5, cy);
          ctx.lineTo(cx - k * 0.12, cy + k * 0.38);
          ctx.lineTo(cx + k * 0.55, cy - k * 0.42);
        }),
      { color: P.ink, alpha: alpha * checks, width: 3.5 },
    );
}

/* Rule four's heading: its glyph is the complete mark. At rest it stands in the rules' shared place (framing/rules.js)
 * with the rule's illustration below; `q` brings it there from its opening state, where it stands alone in the middle of
 * the band, larger, while the rule is spoken. The complete mark at the rule one heading's size of 560 would reach above
 * the action-safe area at the top, so the glyph at rest is 240. Opening, the glyph and the rule's number stand centred
 * by themselves until the statement's words, and the heading glides left, as one unit, to take the statement in. */
const GLYPH = 240,
  OPENING = 500,
  FULL = { datum: 1, passages: 1, boundary: 1 };
function ruleHeading(t, { kick, kickAt, rule, ruleAt, settleAt, alpha }) {
  // At rest the heading stands in the rules' shared place; opening, it stands larger in the middle of the band, its glyph
  // and text centred together there too.
  const rest = ruleHeadingLayout(kick, rule, GLYPH, FULL),
    lift = 500 - (rest.top + rest.bottom) / 2,
    // While only the number stands beside the glyph, the heading stands right by half of what the statement adds, and
    // glides left by that much, by the film's structural glide, as the statement arrives.
    wider = Math.max(0, Math.max(...rest.lines.map((v) => measure(v))) - measure(kick, NOTE)),
    aside = (wider / 2) * (1 - glideShare(t, ruleAt + 0.05, wider / 2, 0.7)),
    open = ruleHeadingLayout(kick, rule, OPENING, FULL, { dy: lift, cx: 960 + aside }),
    // While the rule is spoken the heading drifts slowly toward its place in voice time; it settles on the next words
    // by the structural glide over the way its glyph travels.
    drift = 0.12 * clamp((voiceTime(t) - voiceTime(kickAt)) / 4),
    way = Math.hypot(open.mx - rest.mx, open.my - rest.my),
    q = drift + (1 - drift) * glideShare(t, settleAt + 0.05, way, 0.9),
    dy = mix(lift, 0, q),
    TX = mix(open.tx, rest.tx, q);
  ethosMark(mix(open.mx, rest.mx, q), mix(open.my, rest.my, q), mix(OPENING, GLYPH, q), { alpha });
  nameText(kick, TX, KICK_Y + dy, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: alpha * named(t, kickAt),
  });
  nameText(rest.lines, TX, RULE_Y + dy, {
    align: "left",
    valign: "top",
    alpha: alpha * named(t, ruleAt),
  });
}

/* 07.3. Rule four's heading stands in the middle of the band while the rule is spoken, its glyph the complete mark
 * with nothing added, and the rule's restatement joins under its statement on its words, at the name size: every
 * obligation linked to exactly one owner, standing at the foot of the band from its words as the key of the table
 * that builds above it. Once it is said the heading settles at the top, and the table builds on its words: the obligation that is the same
 * for every repository in the first column, owned by ETHOS (the kernel, so the mark keeps its single place in the
 * heading), and each repository's own checks in the second, owned by the repositories. Heading and key frame the
 * columns from the start, centred on the frame. The table of the two columns builds as one unit: while its first
 * column stands alone it stands on the frame's axis under the heading, and on the words that bring the second owner
 * the table glides to its place, the two columns at one distance either side of the axis. */
export function ruleFour(s, t, a) {
  if (a <= 0) return;
  const [kickAt, ruleAt, everyAt, oneAt, sharedAt, ethosAt, eachAt, ownAt] = cues(s, [
    ["第四条准则", "rule four"],
    ["义务没了", "retire a mechanism"],
    ["每一项义务", "Every obligation"],
    ["只有一个归属", "exactly one owner"],
    ["对所有仓库都一样的义务", "the same for every repository"],
    ["归 ETHOS", "belongs to ETHOS"],
    ["每个仓库", "each repository"],
    ["只声明自己特有的检查", "declares only the checks"],
  ]);
  // The statement stands on one line in both editions, authored so, past the width at which headings wrap. The heading
  // settles once the restatement's second part stands whole, so it is settled before the table's first words.
  ruleHeading(t, {
    kick: L("第四条准则", "Rule four"),
    kickAt,
    rule: L("义务没了，让机制退场", ["Retire a mechanism when its obligation disappears"]),
    ruleAt,
    settleAt: oneAt + 0.25,
    alpha: a,
  });
  const heads = [everyAt, oneAt],
    duties = [sharedAt, ownAt],
    owners = [ethosAt, eachAt],
    flow = flowClock(t),
    // The key stands at the name size, so it keeps three gaps of ground under the owners' names.
    LEG = 770,
    DUTY = 410,
    OWN = 580,
    // The columns' axes: the first on the frame's axis while it stands alone, then both either side of it.
    shift = mix(960 - 690, 0, glideShare(t, eachAt + 0.05, 960 - 690, 0.9)),
    C1 = 690 + shift,
    C2 = 1230 + shift,
    G = [C2 - 110, C2, C2 + 110],
    KERNEL = 34,
    REPO = [96, 76],
    // The owners' names share one baseline under the taller of their marks.
    ownerTop = rowNameTop([OWN + KERNEL, OWN + REPO[1] / 2]),
    e = a * named(t, ethosAt),
    r = a * named(t, eachAt),
    o = a * named(t, ownAt);
  // The restatement, an obligation linked to one owner, named by the two concepts rather than the sentence that states
  // the rule, at the name size and both at full ink. It stands at the foot from its first words, centred on the frame
  // as the table's key, so it is never read as a line of the heading's statement and never carried away from it, and
  // it holds the picture on the centre while the columns above it build.
  const every = L("义务", "Obligation"),
    one = L("一个归属", "One owner"),
    KEY_GAP = 12,
    KEY_RUN = 96,
    keyWidth = measure(every) + 2 * KEY_GAP + KEY_RUN + measure(one),
    kx = 960 - keyWidth / 2,
    ky = LEG;
  nameText(every, kx, ky, {
    align: "left",
    alpha: a * named(t, heads[0]),
    set: "07.3:heads",
  });
  link(kx + measure(every) + KEY_GAP, ky, kx + measure(every) + KEY_GAP + KEY_RUN, ky, {
    alpha: a * named(t, heads[1]),
    draw: { t, at: heads[1] + 0.05 },
  });
  nameText(one, kx + keyWidth - measure(one), ky, {
    align: "left",
    alpha: a * named(t, heads[1]),
    set: "07.3:heads",
  });
  // The obligation the same for every repository, owned by ETHOS, on one line. English names the second duty as a
  // noun, the repository's own checks.
  const d1 = nameText(L("对所有仓库都一样的义务", "The same for every repository"), C1, DUTY, {
    width: 400,
    alpha: a * listIn(t, duties, 0),
    set: "07.3:duties",
  });
  link(C1, d1.bottom + 12, C1, OWN - KERNEL - 12, {
    alpha: e,
    draw: { t, at: ethosAt + 0.05 },
    flow,
  });
  kernelIcon(C1, OWN, KERNEL, { alpha: e, color: P.ink });
  nameText("ETHOS", C1, ownerTop, {
    valign: "top",
    alpha: a * listIn(t, owners, 0),
    set: "07.3:owners",
  });
  // Each repository's own checks, owned by the repositories.
  const d2 = nameText(L("自己特有的检查", "Its own checks"), C2, DUTY, {
    width: 330,
    alpha: a * listIn(t, duties, 1),
    set: "07.3:duties",
  });
  link(C2, d2.bottom + 12, C2, OWN - REPO[1] / 2 - 12, {
    alpha: o,
    draw: { t, at: ownAt + 0.05 },
    flow: flowClock(t, 0.5),
  });
  repoGroup(G, OWN, REPO[0], REPO[1], { alpha: r, checks: o });
  nameText(L("每个仓库", "Each repository"), C2, ownerTop, {
    valign: "top",
    alpha: a * listIn(t, owners, 1),
    set: "07.3:owners",
  });
}

/* ETHOS's own repository, ticked by the obligations it ships. */
function ownRepo(x, y, alpha, ticked) {
  repoIcon(x, y, 180, 110, { alpha });
  check(x + 30, y + 10, 40, { alpha: alpha * ticked, width: 4 });
}

/* 07.4, first: ETHOS, as its kernel, judges its own repository on its words; the same obligations it ships stand
 * between on theirs, linked on to every other repository, and each repository is ticked by them. The two branches,
 * its own repository above and every other one below, stand on one axis, and the picture is centred on the frame. The
 * obligations' name stands on one line, since broken by measure the English would leave "obligations" alone on its
 * last line, and the branches turn 25 px clear of its end. */
export function ownRepository(s, t, a) {
  if (a <= 0) return;
  const [ethosAt, ownAt, allAt, sameAt] = cues(s, [
    ["ETHOS 判断", "ETHOS judges"],
    ["自己的仓库", "its own repository"],
    ["交给所有仓库", "every other one"],
    ["同一套义务", "the same obligations"],
  ]);
  // The kernel's hexagon reaches 52 px either side of its centre; the group of repositories ends at its last outline.
  const DX = 960 - (620 - 52 + 1450 + 50) / 2,
    KX = 620 + DX,
    LX = 960 + DX,
    MID = 1124 + DX,
    G = [1210, 1330, 1450].map((x) => x + DX),
    OWNX = G[1],
    flow = flowClock(t),
    o = a * named(t, ownAt),
    g = a * named(t, allAt),
    l = a * named(t, sameAt),
    // The kernel's name and the obligations' share one baseline under the taller of their marks.
    top = rowNameTop([500 + 60, 500 + 65]);
  kernelIcon(KX, 500, 60, { alpha: a, color: P.ink });
  nameText("ETHOS", KX, top, { valign: "top", alpha: a * named(t, ethosAt) });
  link(KX + 72, 500, OWNX - 102, 330, {
    route: "hvh",
    mid: MID,
    alpha: o,
    draw: { t, at: ownAt + 0.05 },
    flow,
  });
  link(LX + 50, 500, G[0] - 62, 690, {
    route: "hvh",
    mid: MID,
    alpha: l,
    draw: { t, at: sameAt + 0.05 },
    flow: flowClock(t, 0.5),
  });
  ownRepo(OWNX, 330, o, named(t, sameAt + 0.4));
  nameText(L("自己的仓库", "Its own repository"), OWNX, 385 + NAME_GAP, {
    valign: "top",
    alpha: o,
  });
  repoGroup(G, 690, 100, 76, { alpha: g, checks: named(t, sameAt + 0.4) });
  nameText(L("所有仓库", "Every other repository"), G[1], 728 + NAME_GAP, {
    valign: "top",
    alpha: g,
  });
  ledger(LX, 500, 100, 130, { alpha: l });
  nameText(L("同一套义务", "The same obligations"), LX, top, {
    valign: "top",
    width: 300,
    alpha: l,
  });
}

/* 07.4, second: a replacement may never be weaker, said in the example's terms: the declared check, which replaced the
 * script, must catch every duplicate the script caught. The replacement, the example's declared check, stands large on
 * the frame's axis from the cut, the rule over it as its name, its term from the cut and never weaker under it on its
 * words: the stage cuts in on the words that open the rule, which are its term in English, and 换上的 before the term
 * 新做法 in Chinese, so there the term stands within its clause about a third of a second before its word, and the
 * check never waits for its name. The check's own name joins under it on its words. It is the stage's largest mark, a
 * repository with its check written in it as code and the tick it passes, so it alone covers the picture while only
 * the rule is said: English names the example's parts after the rule, two seconds and more into the stage. The script
 * and the duplicates it caught stand in a row below, the script left of the axis and the duplicates as far right of
 * it, each named on its words: what the script caught runs from it to the duplicates, and the duplicates run straight
 * up into the declared check, which must catch every one. Each mark stands in its place from its first frame, and the
 * picture stays centred across the frame while it builds: the check and its rule on the axis, then the row, whose two
 * ends are said within a second of each other. */
/* The check is 460 px wide, so with the rule over it the first state covers a tenth of the band, as it must for the
 * two seconds and more that Chinese says the rule before the script joins it. */
const DUPLICATES = [200, 104],
  ROW_GAP = 50,
  CHECK = [460, 240];
/* The frame's centre line, about which the reviewers measure a still state's balance, and the lower edge of the area
 * in which every name must stand. */
const FRAME_CY = 540,
  SAFE_BOTTOM = 920;
/* The replacement: the declared check (example.js) drawn large, its check as four lines of code under the repository's
 * branch and its tick right of them, at the declared check's place for its tick. */
function replacementCheck(x, y, alpha) {
  if (alpha < 0.01) return;
  const [w, h] = CHECK,
    x0 = x - w / 2 + 34;
  repoIcon(x, y, w, h, { alpha });
  stroke(
    () =>
      [0.42, 0.3, 0.38, 0.24].forEach((k, i) => {
        ctx.moveTo(x0, y - 28 + 32 * i);
        ctx.lineTo(x0 + w * k, y - 28 + 32 * i);
      }),
    { color: P.muted, alpha: alpha * 0.8, width: 2.5 },
  );
  check(x + w * 0.2, y + 8, h * 0.38, { alpha, width: 4 });
}
export function replacement(s, t, a) {
  if (a <= 0) return;
  const [cutAt, weakAt, scriptAt, dupAt, checkAt, catchAt] = cues(s, [
    ["换上的新做法", "A replacement"],
    ["不能比旧的弱", "may never be weaker"],
    ["脚本查出的重复", "the script caught"],
    ["查出的重复", "every duplicate"],
    ["声明的检查都要查出来", "the declared check"],
    ["都要查出来", "must catch every duplicate"],
  ]);
  const term = [L("新做法", "A replacement")],
    qual = [L("不能比旧的弱", "never weaker")],
    em = labelSize(LABEL),
    ruleHeight = termRowLayout(term, qual, Infinity, false).height,
    // The figure stands still from the cut, so its first lasting state, the rule over the check, and its last, which
    // reaches from the rule's top to the row's names, stand with their centres 136 px apart. Centred whole on the
    // content's centre line, the first stood 178 px above the frame's centre for 1.7 s in English (EN-R17-04). The
    // figure is seated so that the two states stand about the frame's centre line, midway between their centres, and no
    // lower than keeps the row's names one gap above the lower edge of the safe area: about 80 px above the centre and
    // 60 px below it.
    first = ruleHeight + NAME_GAP + CHECK[1],
    height = first + NAME_GAP + em + ROW_GAP + SCRIPT[1] + NAME_GAP + em,
    top = Math.min(FRAME_CY - (first + height) / 4, SAFE_BOTTOM - NAME_GAP - height),
    CY = top + ruleHeight + NAME_GAP + CHECK[1] / 2,
    RY = CY + CHECK[1] / 2 + NAME_GAP + em + ROW_GAP + SCRIPT[1] / 2,
    SX = 960 - 260,
    DX = 960 + 260,
    rowTop = rowNameTop([RY + SCRIPT[1] / 2, RY + DUPLICATES[1] / 2]),
    n = a * named(t, cutAt),
    sIn = a * named(t, scriptAt),
    dIn = a * named(t, dupAt);
  termRow(t, term, [cutAt], qual, [weakAt], 960, top, { alpha: a, align: "center" });
  replacementCheck(960, CY, n);
  nameText(L("声明的检查", "The declared check"), 960, CY + CHECK[1] / 2 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, checkAt),
  });
  terminalIcon(SX - SCRIPT[0] / 2, RY - SCRIPT[1] / 2, SCRIPT[0], SCRIPT[1], { alpha: sIn });
  nameText(L("脚本", "The script"), SX, rowTop, { valign: "top", alpha: sIn });
  // The duplicates: a card of two records that are one and the same, as 04.5's exact repeat.
  const [w, h] = DUPLICATES;
  card(DX - w / 2, RY - h / 2, w, h, { alpha: dIn });
  recordRows(DX - w / 2 + 30, RY - 18, w - 60, [0, 1], { alpha: dIn });
  nameText(L("查出的重复", "Every duplicate"), DX, rowTop, { valign: "top", alpha: dIn });
  // What the script caught runs from it to the duplicates, on the later of their words; the duplicates run straight up
  // into the declared check, 30 px inside its right edge, on the words that say it must catch them, once they stand.
  link(SX + SCRIPT[0] / 2 + 10, RY, DX - w / 2 - 10, RY, {
    alpha: Math.min(sIn, dIn),
    draw: { t, at: Math.max(scriptAt, dupAt) + 0.05 },
    flow: flowClock(t),
  });
  const UP = 960 + CHECK[0] / 2 - 30;
  link(UP, RY - h / 2 - 10, UP, CY + CHECK[1] / 2 + 10, {
    alpha: Math.min(n, dIn),
    draw: { t, at: Math.max(catchAt, dupAt) + 0.1 },
    flow: flowClock(t, 0.5),
  });
}

/* 07.4, third: an official Change closes on what it delivered: its delivered rows are ticked and bracketed under their name,
 * its unfinished rows go on record in a ledger beside it, and passing them for done is refused. The Change and the
 * record hang their names from one baseline. The Change stands from its words where it and its delivered rows,
 * arriving a moment later, stand balanced on the frame (English, whose delivered rows come more than a second later,
 * stands the Change alone centred until 'what it delivered' and glides there with its rows); on the words
 * that bring the record
 * the picture glides, as one unit, to where the whole is centred by its outer edges, the Change on the left and the
 * record on the right. The record's ledger stands a fixed run right of the Change, or further where the delivered
 * rows' name would come within two gaps of its edge, so that name, one gap from its own bracket, reads with the
 * bracket alone. The Change is the stage's largest mark: with the short names of its parts it alone keeps the picture
 * from thinning out before the record arrives, and it stands wide, its list 400 px across with its rows reaching
 * further, so with its name it covers a tenth of the band while it stands alone, where the thought's late instant
 * falls in both editions. */
export function closing(s, t, a) {
  if (a <= 0) return;
  const [changeAt, deliveredAt, recordAt, passAt] = cues(s, [
    ["一项正式变更", "An official Change"],
    ["交付了什么", "what it delivered"],
    ["没做完的留下记录", "unfinished work stays on the record"],
    ["冒充做完了", "passing for done"],
  ]);
  // The delivered rows and the record are named by what they hold, not by the sentence that states the rule.
  const DELIVERED = L("交付了什么", "Delivered"),
    RECORD = L("没做完的", "Unfinished work"),
    DY = 440,
    W = 400,
    H = 340,
    // The list's four rows, spread to fill a list this large, the bracket round the first two, their name at its
    // middle, and the unfinished rows' link between the last two.
    ROWS = { first: 0.24, span: 0.62, reach: 0.4 },
    rowsY = listRows(DY, H, 4, ROWS.first, ROWS.span),
    BX = W / 2 + 18,
    left = Math.min(700 - W / 2, 700 - nameWidth(L("一项正式变更", "An official Change")) / 2),
    DELIVERED_WIDTH = L(330, 300),
    delivered = 700 + BX + 14 + 2 + NAME_GAP + nameWidth(DELIVERED, DELIVERED_WIDTH),
    // The record's ledger, 110 px wide, stands RECORD_DX right of the Change: 540 px, or as far as keeps two gaps of
    // ground between the delivered rows' name and the ledger's edge.
    RECORD_DX = Math.max(540, delivered - 700 + 2 * NAME_GAP + 55),
    right = Math.max(700 + RECORD_DX + 55, 700 + RECORD_DX + nameWidth(RECORD, 300) / 2, delivered),
    // Where the Change stands from its words: where it and its delivered rows, arriving a moment later, are centred.
    centred = 960 - (left + delivered) / 2,
    // English: the Change alone, centred by its list and its name, until its delivered rows' words.
    alone = 960 - (left + Math.max(700 + W / 2, 1400 - left)) / 2,
    first = mix(
      L(centred, alone),
      centred,
      glideShare(t, deliveredAt + 0.05, L(0, centred - alone), 0.7),
    ),
    // The picture's offset: that place, then, on the record's words, where the whole is centred.
    whole = 960 - (left + right) / 2,
    S = mix(first, whole, glideShare(t, recordAt + 0.05, whole - centred, 0.9)),
    LX = 700 + S,
    RX = 700 + RECORD_DX + S,
    RY = (rowsY[2] + rowsY[3]) / 2,
    top = rowNameTop([DY + H / 2, RY + 70]);
  const c = a * named(t, changeAt),
    d = a * named(t, deliveredAt),
    r = a * named(t, recordAt),
    p = a * named(t, passAt);
  taskList(LX, DY, W, H, { alpha: c, done: 2, tick: d, ...ROWS });
  nameText(L("一项正式变更", "An official Change"), LX, top, {
    valign: "top",
    alpha: c,
  });
  // The bracket of the delivered rows, and their name beside it.
  stroke(
    () => {
      ctx.moveTo(LX + BX, rowsY[0] - 21);
      ctx.lineTo(LX + BX + 14, rowsY[0] - 21);
      ctx.lineTo(LX + BX + 14, rowsY[1] + 21);
      ctx.lineTo(LX + BX, rowsY[1] + 21);
    },
    { color: P.ink, alpha: d, width: 2.5 },
  );
  nameText(DELIVERED, LX + BX + 16 + NAME_GAP, (rowsY[0] + rowsY[1]) / 2, {
    align: "left",
    width: DELIVERED_WIDTH,
    alpha: d,
  });
  // The unfinished rows go on record.
  link(LX + BX + 4, RY, RX - 62, RY, {
    alpha: r,
    draw: { t, at: recordAt + 0.05 },
    flow: flowClock(t),
  });
  ledger(RX, RY, 110, 140, { alpha: r });
  nameText(RECORD, RX, top, {
    valign: "top",
    width: 300,
    alpha: r,
  });
  rejectedName(L("冒充做完了", "Passing for done"), 960, top + 100, {
    alpha: p,
    mark: ramp(t, passAt + 0.3, 0.4),
  });
}
