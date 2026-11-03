/* 07.3-07.4 rule four itself: its heading with the complete mark as its glyph, nothing added; every obligation finds
 * its one owner; ETHOS holds its own repository to the same obligations, a replacement is never weaker, and a Change
 * closes on what it delivered. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { ethosMark } from "../../drawing/mark.js";
import { box, fill, labelSize, line, measure, stroke } from "../../drawing/strokes.js";
import { check } from "../../drawing/symbols.js";
import { kernelIcon, ledger, repoIcon } from "../../drawing/workspace.js";
import { listIn, named } from "../../naming/lists.js";
import { LEADING, NAME_GAP, NOTE, nameText, rejectedName, wrapName } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { taskList } from "./example.js";

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

/* The rule heading the four rules share: the kicker naming the rule and the rule itself, left-aligned as one block
 * centred on the frame, the kicker at y 196 and the rule from y 218 wrapped at 600 px, with the mark as the heading's
 * glyph 64 px to the left of the block and centred on it. At rest it stands at the top of the content band with the
 * rule's illustration below; `q` brings it there from its opening state, where it stands alone in the middle of the
 * band, larger, while the rule is spoken. The complete mark at the rule one heading's size of 560 would reach above
 * the action-safe area at the top, so the glyph at rest is 240. */
const GLYPH = 240,
  OPENING = 500,
  GLYPH_GAP = 64,
  KICK_Y = 196,
  RULE_Y = 218,
  RULE_WRAP = 600;
function ruleHeading(t, q, { kick, kickAt, rule, ruleAt, alpha }) {
  const lines = wrapName(rule, RULE_WRAP),
    tw = Math.max(measure(kick, NOTE), ...lines.map((v) => measure(v))),
    top = KICK_Y - labelSize(NOTE) / 2,
    bottom = RULE_Y + labelSize(LABEL) * (1 + LEADING * (lines.length - 1)),
    lift = 500 - (top + bottom) / 2;
  // At rest: the block centred on the frame and the glyph to its left; opening: mark and block centred together.
  const TX2 = 960 - tw / 2,
    MX2 = TX2 - GLYPH_GAP - 0.27 * GLYPH,
    left = 960 - (0.615 * OPENING + GLYPH_GAP + tw) / 2,
    MX1 = left + 0.345 * OPENING,
    TX1 = left + 0.615 * OPENING + GLYPH_GAP,
    TX = mix(TX1, TX2, q),
    dy = mix(lift, 0, q);
  ethosMark(mix(MX1, MX2, q), (top + bottom) / 2 + dy, mix(OPENING, GLYPH, q), { alpha });
  nameText(kick, TX, KICK_Y + dy, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: alpha * named(t, kickAt),
  });
  nameText(lines, TX, RULE_Y + dy, {
    align: "left",
    valign: "top",
    alpha: alpha * named(t, ruleAt),
  });
}

/* 07.3. Rule four's heading stands in the middle of the band while the rule is spoken, its glyph the complete mark
 * with nothing added; then it settles at the top and its illustration builds below on its words: a key at the foot,
 * every obligation linked to exactly one owner, and above it the obligation that is the same for every repository in
 * the first column, owned by ETHOS (the kernel, so the mark keeps its single place in the heading), and each
 * repository's own checks in the second, owned by the repositories. Heading and key frame the columns from the
 * start, so the picture keeps its centre while the columns build. */
export function ruleFour(s, t, a) {
  if (a <= 0) return;
  const [kickAt, ruleAt, everyAt, oneAt, sharedAt, ethosAt, eachAt, ownAt] = cues(s, [
    ["第四条准则", "rule four"],
    ["义务没了", "retire a mechanism"],
    ["每一项义务", "Every obligation"],
    ["只有一个归属", "exactly one owner"],
    ["对所有仓库都一样的规则", "the same for every repository"],
    ["归 ETHOS", "belongs to ETHOS"],
    ["每个仓库", "each repository"],
    ["只声明自己特有的检查", "declares only the checks"],
  ]);
  // While the rule is spoken the heading drifts slowly toward its place in voice time; it settles on the next words.
  const drift = 0.12 * clamp((voiceTime(t) - voiceTime(kickAt)) / 4);
  ruleHeading(t, drift + (1 - drift) * soon(t, everyAt + 0.05, 0.9), {
    kick: L("第四条准则", "Rule four"),
    kickAt,
    rule: L("义务没了，机制就退场", "Retire a mechanism when its obligation disappears"),
    ruleAt,
    alpha: a,
  });
  // The legend waits until the heading has settled past it, still within half a second of its words.
  const heads = [everyAt + 0.85, Math.max(oneAt, everyAt + 0.85)],
    duties = [sharedAt, ownAt],
    owners = [ethosAt, eachAt],
    flow = (voiceTime(t) * 0.4) % 1,
    LEG = 730,
    DUTY = 410,
    OWN = 580,
    C1 = 720,
    C2 = 1260,
    G = [C2 - 110, C2, C2 + 110],
    e = a * named(t, ethosAt),
    r = a * named(t, eachAt),
    o = a * named(t, ownAt);
  // The table's key at its foot: every obligation, linked to exactly one owner. Standing below the columns from its
  // words, it holds the picture on the centre while the columns above it build.
  nameText(L("每一项义务", "Every obligation"), 900, LEG, {
    align: "right",
    size: NOTE,
    color: P.muted,
    alpha: a * listIn(t, heads, 0),
    set: "07.3:heads",
  });
  link(912, LEG, 1008, LEG, { alpha: a * named(t, heads[1]), upto: soon(t, heads[1] + 0.05, 0.4) });
  nameText(L("只有一个归属", "exactly one owner"), 1020, LEG, {
    align: "left",
    size: NOTE,
    color: P.muted,
    alpha: a * listIn(t, heads, 1),
    set: "07.3:heads",
  });
  // The obligation the same for every repository, owned by ETHOS.
  const d1 = nameText(L("对所有仓库都一样的规则", "the same for every repository"), C1, DUTY, {
    width: 330,
    alpha: a * listIn(t, duties, 0),
    set: "07.3:duties",
  });
  link(C1, d1.bottom + 12, C1, OWN - 46, { alpha: e, upto: soon(t, ethosAt + 0.05, 0.5), flow });
  kernelIcon(C1, OWN, 34, { alpha: e, color: P.ink });
  nameText("ETHOS", C1, OWN + 34 + NAME_GAP, {
    valign: "top",
    alpha: a * listIn(t, owners, 0),
    set: "07.3:owners",
  });
  // Each repository's own checks, owned by the repositories.
  const d2 = nameText(L("自己特有的检查", "the checks that are its own"), C2, DUTY, {
    width: 330,
    alpha: a * listIn(t, duties, 1),
    set: "07.3:duties",
  });
  link(C2, d2.bottom + 12, C2, OWN - 50, {
    alpha: o,
    upto: soon(t, ownAt + 0.05, 0.5),
    flow: (flow + 0.5) % 1,
  });
  repoGroup(G, OWN, 96, 76, { alpha: r, checks: o });
  nameText(L("每个仓库", "each repository"), C2, OWN + 38 + NAME_GAP, {
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
 * between on theirs, linked on to every other repository, and each repository is ticked by them. */
export function ownRepository(s, t, a) {
  if (a <= 0) return;
  const [ethosAt, ownAt, allAt, sameAt] = cues(s, [
    ["ETHOS 判断", "ETHOS judges"],
    ["自己的仓库", "its own repository"],
    ["交给所有仓库", "every other one"],
    ["同一套义务", "the same obligations"],
  ]);
  const flow = (voiceTime(t) * 0.4) % 1,
    o = a * named(t, ownAt),
    g = a * named(t, allAt),
    l = a * named(t, sameAt),
    G = [1210, 1330, 1450];
  kernelIcon(620, 500, 60, { alpha: a, color: P.ink });
  nameText("ETHOS", 620, 560 + NAME_GAP, { valign: "top", alpha: a * named(t, ethosAt) });
  link(692, 500, 1218, 330, {
    route: "hvh",
    mid: 1100,
    alpha: o,
    upto: soon(t, ownAt + 0.05, 0.8),
    flow,
  });
  link(1010, 500, 1148, 690, {
    route: "hvh",
    mid: 1100,
    alpha: l,
    upto: soon(t, sameAt + 0.05, 0.6),
    flow: (flow + 0.5) % 1,
  });
  ownRepo(1320, 330, o, named(t, sameAt + 0.4));
  nameText(L("自己的仓库", "its own repository"), 1320, 385 + NAME_GAP, {
    valign: "top",
    alpha: o,
  });
  repoGroup(G, 690, 100, 76, { alpha: g, checks: named(t, sameAt + 0.4) });
  nameText(L("所有仓库", "every other one"), G[1], 728 + NAME_GAP, { valign: "top", alpha: g });
  ledger(960, 500, 100, 130, { alpha: l });
  nameText(L("同一套义务", "the same obligations"), 960, 565 + NAME_GAP, {
    valign: "top",
    width: 230,
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
 * rule that it may never be weaker is named beneath as its extra check arrives. */
export function replacement(s, t, a) {
  if (a <= 0) return;
  const [newAt, weakAt, oldAt] = cues(s, [
    ["拿新做法", "A replacement"],
    ["新的不能比旧的弱", "may never be weaker"],
    ["换掉旧做法", "what it replaces"],
  ]);
  const n = a * named(t, newAt),
    w = a * named(t, weakAt),
    o = a * named(t, oldAt);
  wayBox(700, 430, 3, { alpha: o });
  nameText(L("旧做法", "what it replaces"), 700, 505 + NAME_GAP, { valign: "top", alpha: o });
  wayBox(1220, 430, 4, { alpha: n, more: w, extra: 1 });
  nameText(L("新做法", "A replacement"), 1220, 505 + NAME_GAP, { valign: "top", alpha: n });
  link(827, 430, 1093, 430, {
    alpha: Math.min(n, o),
    upto: soon(t, Math.max(newAt, oldAt) + 0.05, 0.6),
    flow: (voiceTime(t) * 0.4) % 1,
  });
  nameText(L("新的不能比旧的弱", "may never be weaker"), 960, 650, { alpha: w });
}

/* 07.4, third: an official Change closes on what it delivered: its delivered rows are ticked and bracketed under their name,
 * its unfinished rows go on record in a ledger beside it, and passing them for done is refused. */
export function closing(s, t, a) {
  if (a <= 0) return;
  const [changeAt, deliveredAt, recordAt, passAt] = cues(s, [
    ["一项正式变更", "And an official Change"],
    ["做到哪儿", "what it actually delivered"],
    ["没做完的留下记录", "unfinished work stays on the record"],
    ["冒充做完了", "passing for done"],
  ]);
  const c = a * named(t, changeAt),
    d = a * named(t, deliveredAt),
    r = a * named(t, recordAt),
    p = a * named(t, passAt),
    DX = 700,
    DY = 470,
    H = 270;
  taskList(DX, DY, 200, H, { alpha: c, done: 2, tick: d });
  nameText(L("一项正式变更", "an official Change"), DX, DY + H / 2 + NAME_GAP, {
    valign: "top",
    alpha: c,
  });
  // The bracket of the delivered rows, and their name beside it.
  stroke(
    () => {
      ctx.moveTo(DX + 118, 398);
      ctx.lineTo(DX + 132, 398);
      ctx.lineTo(DX + 132, 482);
      ctx.lineTo(DX + 118, 482);
    },
    { color: P.ink, alpha: d, width: 2.5 },
  );
  nameText(L("做到哪儿，就按哪儿收尾", "what it actually delivered"), DX + 156, 440, {
    align: "left",
    width: 330,
    alpha: d,
  });
  // The unfinished rows go on record.
  link(DX + 122, 543, 1238, 543, {
    alpha: r,
    upto: soon(t, recordAt + 0.05, 0.7),
    flow: (voiceTime(t) * 0.4) % 1,
  });
  ledger(1300, 543, 110, 140, { alpha: r });
  nameText(L("没做完的留下记录", "unfinished work stays on the record"), 1300, 613 + NAME_GAP, {
    valign: "top",
    width: 300,
    alpha: r,
  });
  rejectedName(L("冒充做完了", "passing for done"), 960, 760, {
    alpha: p,
    mark: ramp(t, passAt + 0.3, 0.4),
  });
}
