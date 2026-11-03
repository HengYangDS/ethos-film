/* Part 04, rule one (04.4-04.5): preserve meaning with the smallest model that is enough. The rule's heading brings
 * the mark's origin: the cinnabar datum gains its ink hole and the start of its two passages. Below it a model is
 * drawn as concept boxes and their links, too big and too small on either side; then the intent goes into one Change,
 * whose three fields are named, and everyone who picks up the work later reads that one copy. The heading stands at the
 * top through 04.6, so each stage below it reaches down to about y 800 and the whole stays balanced. */

import { ctx } from "../../canvas.js";
import { along, link } from "../../drawing/links.js";
import { ethosMark } from "../../drawing/mark.js";
import { modelGrid } from "../../drawing/models.js";
import { box, dot, flowDot, measure, stroke } from "../../drawing/strokes.js";
import { agent, documentIcon, person } from "../../drawing/symbols.js";
import { beats, listIn, named } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  TERM_GAP,
  nameText,
  termRow,
  termRowLayout,
  wrapName,
} from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* The width of a term with its qualifier as termRow sets it, and the row centred on x. */
export function rowWidth(term, qual, width = Infinity) {
  const tw = measure(term.join("")),
    qw = measure(qual.join(""), NOTE);
  return termRowLayout(term, qual, width).one ? tw + TERM_GAP + qw : Math.max(tw, qw);
}
export function centredRow(t, term, termAt, qual, qualAt, x, y, { width = 320, alpha = 1 } = {}) {
  const w = rowWidth(term, qual, width);
  return termRow(t, term, [termAt], qual, [qualAt], x - w / 2, y, { width, alpha });
}

/* Rule one's heading: the rule's number in small type above its statement, and at their left the mark's origin: the
 * datum arrives with the number and its ink hole opens as it settles, the one part rule one adds (the passages are rule
 * two's). It beats once as the meaning is said to be kept. Returns the heading's bottom. */
export function ruleOneHeading(t, c, g) {
  const number = L("第一条准则", "Rule one"),
    statement = wrapName(
      L("用刚好够用的模型，留住原意", "Preserve meaning with the smallest model that is enough"),
      600,
    );
  const w = Math.max(measure(number, NOTE), ...statement.map((v) => measure(v))),
    MX = 960 - (64 + w) / 2,
    top = 184,
    bottom = top + 34 + 38 * statement.length,
    on = g * named(t, c.first4),
    MY = (top + bottom) / 2 + 2,
    hole = ramp(t, c.first4 - 0.05, 0.6);
  ethosMark(MX, MY, 560, { datum: on, hole, passages: 0, boundary: 0, alpha: g });
  beats(t, MX, MY, 26, [c.keep], { color: P.ink, alpha: g });
  nameText(number, MX + 64, top + 12, { align: "left", size: NOTE, color: P.muted, alpha: on });
  nameText(statement, MX + 64, top + 34, {
    align: "left",
    valign: "top",
    alpha: g * named(t, c.statement),
  });
  return bottom;
}

/* A model of the right size: three concepts and the two links of their structure, one stroke each, with the meaning
 * held in its top concept. Once the model is explained, a point runs along its structure. */
function enoughModel(t, x, y, a, flowing) {
  const cells = [
    [x - 78, y + 28],
    [x, y - 28],
    [x + 78, y + 28],
  ];
  const links = [
    [
      [cells[0][0] + 20, cells[0][1] - 20],
      [cells[1][0] - 20, cells[1][1] + 20],
    ],
    [
      [cells[1][0] + 20, cells[1][1] + 20],
      [cells[2][0] - 20, cells[2][1] - 20],
    ],
  ];
  stroke(
    () =>
      links.forEach(([p, q]) => {
        ctx.moveTo(...p);
        ctx.lineTo(...q);
      }),
    { color: P.line, alpha: a, width: 2.5 },
  );
  stroke(() => cells.forEach(([cx, cy]) => ctx.roundRect(cx - 32, cy - 20, 64, 40, 6)), {
    color: P.ink,
    alpha: a,
    width: 2.5,
  });
  dot(x, y - 28, 6, { color: P.ink, alpha: a });
  if (flowing > 0) {
    const q = (voiceTime(t) * 0.5) % 1,
      path = [links[0][0], links[0][1], links[1][0], links[1][1]];
    flowDot(...along(path, q).point, 6, q, { color: P.ink, alpha: a * flowing });
  }
}

/* 04.4 The model: concepts and structure. The one of the right size stands with the statement; one too big, with
 * concepts no one needs, joins at its right, and one too small, which drops the meaning on the way, at its left. The
 * row keeps its balance as each joins: the first two stand as a pair, and the three spread to their places. */
export function modelStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const s2 = soon(t, c.big - 0.1, 0.5),
    s3 = soon(t, c.small + 0.05, 0.6),
    Y = 620,
    under = Y + 75 + NAME_GAP,
    xs = [960 - 440, 960 - 240 * s2 + 240 * s3, 1220 + 200 * s3],
    bigAt = c.big + 0.25;
  const enough = g * named(t, c.enough);
  enoughModel(t, xs[1], Y, enough, ramp(t, c.structure, 0.4));
  centredRow(
    t,
    L(["刚好够用"], ["Just enough"]),
    c.enough,
    L(["概念和结构"], ["concepts and structure"]),
    c.concepts,
    xs[1],
    under,
    { alpha: g },
  );
  const big = g * named(t, bigAt);
  modelGrid(xs[2] - 130, Y - 75, 260, 150, { alpha: big, color: P.ink });
  centredRow(
    t,
    L(["模型大了"], ["Bigger than it needs to be"]),
    bigAt,
    L(["用不上的概念"], ["concepts they do not need"]),
    c.unneeded,
    xs[2],
    under,
    { alpha: g },
  );
  const small = g * named(t, c.small),
    lost = soon(t, c.lost + 0.05, 0.9);
  box(xs[0] - 32, Y - 20, 64, 40, { stroke: P.ink, alpha: small, radius: 6, width: 2.5 });
  // The meaning does not fit the small model: it sits on its edge and falls away when it is lost.
  dot(xs[0] + 44, mix(Y - 30, Y + 40, lost), 6, { color: P.ink, alpha: small * (1 - lost) });
  centredRow(
    t,
    L(["小到装不下原意"], ["Too small"]),
    c.small,
    L(["半路丢掉"], ["the meaning is lost"]),
    c.lost,
    xs[0],
    under,
    { alpha: g },
  );
}

/* The Change: a document that holds the intent at its head and, on their words, its three fields. */
export const CHANGE_W = 150,
  CHANGE_H = 240;
const fieldNames = () =>
  L(
    ["要解决什么", "为什么要解决", "做到什么样才算解决"],
    ["What is to be solved", "Why", "What counts as solved"],
  );
const fieldY = (y, i) => y + CHANGE_H * (0.42 + i * 0.19);
export function changeDocument(x, y, { alpha = 1, fields = [1, 1, 1], intent = 1 } = {}) {
  documentIcon(x, y, CHANGE_W, CHANGE_H, { alpha, rows: 0 });
  documentIcon(x + 52, y + 26, 46, 58, { alpha: alpha * intent, rows: 2, fold: false });
  fields.forEach((f, i) => {
    if (f > 0.01)
      stroke(
        () => {
          ctx.moveTo(x + 24, fieldY(y, i));
          ctx.lineTo(x + CHANGE_W - (i === 1 ? 52 : 28), fieldY(y, i));
        },
        { color: P.ink, alpha: alpha * f, width: 3 },
      );
  });
}

/* 04.4 One Change: the intent, named, moves into a Change, which is named with "only there"; then its three fields
 * arrive on their words, each a row of the document linked to its name at the right. */
export function changeStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names = fieldNames(),
    nw = Math.max(...names.map((v) => measure(v))),
    DX = 960 - (190 + CHANGE_W + 90 + nw) / 2 + 190,
    DY = 440,
    FX = DX + CHANGE_W + 90,
    ats = [c.f1, c.f2, c.f3],
    into = soon(t, c.change + 0.05, 0.7),
    fields = ats.map((at) => ramp(t, at - 0.15, 0.4));
  changeDocument(DX, DY, { alpha: g * named(t, c.change), fields, intent: 0 });
  // The intent travels from its place into the head of the Change.
  const ix = mix(DX - 190, DX + 52, into),
    iy = mix(DY + 150, DY + 26, into),
    meant = g * named(t, c.intent);
  documentIcon(ix, iy, 46, 58, { alpha: meant, rows: 2, fold: false });
  // Its name stays where the intent was named and leaves as the intent goes in.
  nameText(L("意图", "The intent"), DX - 190 + 23, DY + 150 + 58 + NAME_GAP, {
    valign: "top",
    alpha: meant * (1 - ramp(t, c.change + 0.05, 0.3)),
  });
  centredRow(
    t,
    L(["正式变更"], ["One official Change"]),
    c.change,
    L(["只写在这一处"], ["only there"]),
    c.only,
    DX + CHANGE_W / 2,
    DY + CHANGE_H + NAME_GAP,
    { alpha: g, width: 300 },
  );
  names.forEach((v, i) => {
    link(DX + CHANGE_W, fieldY(DY, i), FX - 14, fieldY(DY, i), {
      alpha: g * fields[i],
      upto: soon(t, ats[i] + 0.05, 0.4),
    });
    nameText(v, FX, fieldY(DY, i), { align: "left", alpha: g * listIn(t, ats, i), set: "fields" });
  });
}

/* 04.5 One copy: the Change at the centre and, at its left, a person and an Agent who pick the work up later; each
 * reads it along a link, and what they read is the same. */
export function readersStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const DX = 960 - CHANGE_W / 2 - 60,
    DY = 440,
    RX = DX - 250,
    who = g * named(t, c.readers),
    reading = g * named(t, c.same),
    q = (voiceTime(t) * 0.5) % 1;
  changeDocument(DX, DY, { alpha: g });
  centredRow(
    t,
    L(["正式变更"], ["The Change"]),
    c.first5,
    L(["只写在一处"], ["one copy"]),
    c.first5,
    DX + CHANGE_W / 2,
    DY + CHANGE_H + NAME_GAP,
    { alpha: g, width: 300 },
  );
  person(RX, 540, { alpha: who, size: 1.1 });
  agent(RX, 666, { alpha: who });
  nameText(L("后面接手的人和 Agent", "Everyone who picks up the work"), RX, 666 + 22 + NAME_GAP, {
    valign: "top",
    width: 300,
    alpha: who,
  });
  for (const [x, y, to, k] of [
    [RX + 34, 532, DY + 90, 0],
    [RX + 26, 666, DY + 160, 0.5],
  ])
    link(x, y, DX, to, {
      route: "hvh",
      alpha: reading,
      upto: soon(t, c.same + 0.05, 0.5),
      flow: (q + k) % 1,
    });
  nameText(L("读到的都是同一份", "Reads the same thing"), DX + CHANGE_W + NAME_GAP + 10, DY + 120, {
    align: "left",
    alpha: reading,
  });
}
