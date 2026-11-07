/* 07.3-07.4 rule four itself: its heading with the complete mark as its glyph, nothing added; every obligation finds
 * its one owner; ETHOS holds its own repository to the same obligations, a replacement is never weaker, and a Change
 * closes on what it delivered. */

import { ctx } from "../../canvas.js";
import { flowClock, link } from "../../drawing/links.js";
import { ethosMark } from "../../drawing/mark.js";
import { box, fill, labelSize, line, measure, stroke } from "../../drawing/strokes.js";
import { check } from "../../drawing/symbols.js";
import { kernelIcon, ledger, repoIcon } from "../../drawing/workspace.js";
import { KICK_Y, RULE_Y, ruleHeadingLayout } from "../../framing/rules.js";
import { listIn, named } from "../../naming/lists.js";
import { LEADING, NAME_GAP, NOTE, nameText, rejectedName, termRow } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { glideShare, voiceTime } from "../../timing/pauses.js";
import { listRows, nameWidth, taskList } from "./example.js";

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
    TX = mix(open.tx, rest.tx, q),
    // The centre line of a line under the statement, at its pitch, as a second line of the heading.
    below = labelSize(LABEL) * (LEADING * rest.lines.length + 0.5);
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
  // Where a line under the statement stands as the heading drifts, before it settles.
  return { under: [mix(open.tx, rest.tx, drift), RULE_Y + mix(lift, 0, drift) + below] };
}

/* 07.3. Rule four's heading stands in the middle of the band while the rule is spoken, its glyph the complete mark
 * with nothing added, and the rule's restatement joins under its statement on its words, at the name size: every
 * obligation linked to exactly one owner. Once that is said the heading settles at the top and the restatement glides
 * to the foot of the band as the key of the table that builds above it on its words: the obligation that is the same
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
  const settleAt = oneAt + 0.25,
    h = ruleHeading(t, {
      kick: L("第四条准则", "Rule four"),
      kickAt,
      rule: L("义务没了，机制就退场", ["Retire a mechanism when its obligation disappears"]),
      ruleAt,
      settleAt,
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
  // the rule, at the name size and both at full ink: under the heading's statement, on its left edge, while it is
  // said, then, as the heading settles, gliding to the foot, where it stands centred on the frame as the table's key and
  // holds the picture on the centre while the columns above it build.
  const every = L("义务", "Obligation"),
    one = L("一个归属", "One owner"),
    KEY_GAP = 12,
    KEY_RUN = 96,
    keyWidth = measure(every) + 2 * KEY_GAP + KEY_RUN + measure(one),
    footX = 960 - keyWidth / 2,
    [nx, ny] = h.under,
    keyGo = glideShare(t, settleAt + 0.05, Math.hypot(footX - nx, LEG - ny), 0.9),
    kx = mix(nx, footX, keyGo),
    ky = mix(ny, LEG, keyGo);
  nameText(every, kx, ky, {
    align: "left",
    alpha: a * named(t, heads[0]),
    set: "07.3:heads",
  });
  link(kx + measure(every) + KEY_GAP, ky, kx + measure(every) + KEY_GAP + KEY_RUN, ky, {
    alpha: a * named(t, heads[1]),
    upto: soon(t, heads[1] + 0.05, 0.4),
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
    upto: soon(t, ethosAt + 0.05, 0.5),
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
    upto: soon(t, ownAt + 0.05, 0.5),
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
    upto: soon(t, ownAt + 0.05, 0.8),
    flow,
  });
  link(LX + 50, 500, G[0] - 62, 690, {
    route: "hvh",
    mid: MID,
    alpha: l,
    upto: soon(t, sameAt + 0.05, 0.6),
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

/* A way of working: an outline holding its checks, each a tick and a rule; the `extra` rows arrive on `more`. */
function wayBox(x, y, rows, { alpha = 1, more = 1, extra = 0 } = {}) {
  if (alpha < 0.01) return;
  const w = 230,
    h = 150,
    ys = Array.from({ length: rows }, (_, i) => y - h / 2 + (h * (i + 1)) / (rows + 1));
  box(x - w / 2, y - h / 2, w, h, { fill: P.row, stroke: P.ink, alpha, radius: 12, width: 2.5 });
  ys.forEach((ry, i) => {
    const k = i < rows - extra ? alpha : alpha * more;
    check(x - w * 0.3, ry, 20, { alpha: k, width: 3 });
    line(x - w * 0.16, ry, x + w * 0.34, ry, { color: P.muted, alpha: k });
  });
}

/* 07.4, second: a replacement takes the old way's place on its words; it holds every check the old one held, and the
 * rule that it may never be weaker is named as its extra check arrives: Chinese states it beneath both ways, comparing
 * them, and English, whose words continue the replacement's own name, sets it as that name's qualifier. English
 * names what it replaces last, after the rule, so its new way stands alone for more than a second: it stands centred
 * until the old way's words, and the two ways then glide, as one unit, to their places either side of the axis.
 * Chinese names both ways in one clause, half a second apart, so they stand in their places from the first. */
export function replacement(s, t, a) {
  if (a <= 0) return;
  const [newAt, weakAt, oldAt] = cues(s, [
    ["拿新做法", "A replacement"],
    ["新的不能比旧的弱", "may never be weaker"],
    ["换掉旧做法", "what it replaces"],
  ]);
  const n = a * named(t, newAt),
    w = a * named(t, weakAt),
    o = a * named(t, oldAt),
    S = mix(L(0, 960 - 1220), 0, glideShare(t, oldAt + 0.05, L(0, 1220 - 960), 0.8));
  wayBox(700 + S, 430, 3, { alpha: o });
  nameText(L("旧做法", "What it replaces"), 700 + S, 505 + NAME_GAP, { valign: "top", alpha: o });
  wayBox(1220 + S, 430, 4, { alpha: n, more: w, extra: 1 });
  // The relation draws on from the old way to the new; in English it waits until the glide has passed its fastest
  // part, so the line never grows while its ends slide fast.
  link(827 + S, 430, 1093 + S, 430, {
    alpha: Math.min(n, o),
    upto: soon(t, Math.max(newAt, oldAt) + L(0.05, 0.35), 0.6),
    flow: flowClock(t),
  });
  if (en)
    termRow(t, ["A replacement"], [newAt], ["never weaker"], [weakAt], 1220 + S, 505 + NAME_GAP, {
      alpha: a,
      align: "center",
      inline: false,
    });
  else {
    nameText("新做法", 1220 + S, 505 + NAME_GAP, { valign: "top", alpha: n });
    nameText("不能比旧的弱", 960, 650, { alpha: w });
  }
}

/* 07.4, third: an official Change closes on what it delivered: its delivered rows are ticked and bracketed under their name,
 * its unfinished rows go on record in a ledger beside it, and passing them for done is refused. The Change and the
 * record hang their names from one baseline. The Change stands from its words where it and its delivered rows,
 * arriving a moment later, stand balanced on the frame (English, whose delivered rows come more than a second later,
 * stands the Change alone centred until their words and glides there with them); on the words that bring the record
 * the picture glides, as one unit, to where the whole is centred by its outer edges, the Change on the left and the
 * record on the right. The record's ledger stands a fixed run right of the Change, or further where the delivered
 * rows' name would come within two gaps of its edge, so that name, one gap from its own bracket, reads with the
 * bracket alone. The Change is the stage's largest mark: with the short names of its parts it alone keeps the picture
 * from thinning out before the record arrives. */
export function closing(s, t, a) {
  if (a <= 0) return;
  const [changeAt, deliveredAt, recordAt, passAt] = cues(s, [
    ["一项正式变更", "And an official Change"],
    ["做到哪儿", "actually delivered"],
    ["没做完的留下记录", "unfinished work stays on the record"],
    ["冒充做完了", "passing for done"],
  ]);
  // The delivered rows and the record are named by what they hold, not by the sentence that states the rule.
  const DELIVERED = L("做到哪儿", "Delivered"),
    RECORD = L("没做完的", "Unfinished work"),
    DY = 440,
    W = 250,
    H = 340,
    // The list's four rows, spread to fill a list this large, the bracket round the first two, their name at its
    // middle, and the unfinished rows' link between the last two.
    ROWS = { first: 0.24, span: 0.62, reach: 0.36 },
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
    first = mix(L(centred, alone), centred, glideShare(t, deliveredAt + 0.05, L(0, centred - alone), 0.7)),
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
    upto: soon(t, recordAt + 0.05, 0.7),
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
