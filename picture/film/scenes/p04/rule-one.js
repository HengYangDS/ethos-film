/* Part 04, rule one (04.4-04.5): preserve meaning with the smallest model that is enough. The rule's heading brings
 * the mark's origin: the cinnabar datum gains its ink hole and the start of its two passages. Below it a model is
 * drawn as concept boxes and their links, too big and too small on either side; then the intent goes into one Change,
 * whose three fields are named, and everyone who picks up the work later reads that one copy. The heading stands at the
 * top through 04.6, so each stage below it reaches down to about y 800 and the whole stays balanced. */

import { ctx } from "../../canvas.js";
import { along, link } from "../../drawing/links.js";
import { modelGrid } from "../../drawing/models.js";
import { box, dot, flowDot, labelSize, measure, stroke } from "../../drawing/strokes.js";
import { agent, documentIcon, person } from "../../drawing/symbols.js";
import { ruleHeading } from "../../framing/rules.js";
import { beats, listIn, named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, TERM_STACK, nameText, termRow } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* Rule one's heading, in the rules' shared place: its glyph is the datum alone, which arrives with the number while
 * its ink hole opens as it settles, the one part rule one adds (the passages are rule two's). It beats once as the
 * meaning is said to be kept. The English statement's relative clause, "that is enough", stands under it in the
 * qualifier's size and colour, so no line ends on "the", the statement reads as one line over its gloss, and its left
 * edge stays clear of the centred heading of the examples below. Returns the heading's bottom. */
export function ruleOneHeading(t, c, g) {
  const on = g * named(t, c.first4),
    h = ruleHeading(t, {
      number: L("第一条准则", "Rule one"),
      numberAt: c.first4,
      statement: L("用刚好够用的模型，留住原意", ["Preserve meaning with the smallest model"]),
      statementAt: c.statement,
      size: 560,
      glyph: { datum: 1, passages: 0, boundary: 0 },
      shares: { datum: on, hole: ramp(t, c.first4 - 0.05, 0.6), passages: 0, boundary: 0 },
      alpha: g,
    });
  beats(t, h.mx, h.my, 26, [c.keep], { color: P.ink, alpha: g });
  if (!en) return h.bottom;
  // The gloss joins one stack gap under the statement, on the statement's left edge and on its own words, as a
  // qualifier joins its term.
  const under = h.bottom + TERM_STACK;
  nameText("that is enough", h.tx, under, {
    align: "left",
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: g * named(t, c.keep),
  });
  return under + labelSize(NOTE);
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
 * three stand at one pitch: the first two as a pair about the centre, and the three spread to their places as the
 * third joins. Each model's name centres on it from its first word, its qualifier under it, and the names of the row
 * hang from one line under its tallest model, the grid. */
const MODEL_PITCH = 450;
export function modelStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const s2 = soon(t, c.big - 0.1, 0.5),
    s3 = soon(t, c.small + 0.05, 0.6),
    Y = 620,
    half = MODEL_PITCH / 2,
    under = rowNameTop([Y + 48, Y + 75, Y + 20]),
    xs = [960 - MODEL_PITCH, 960 - half * s2 + half * s3, 960 + half + half * s3],
    bigAt = c.big + 0.25,
    row = { alpha: g, align: "center" };
  const enough = g * named(t, c.enough);
  enoughModel(t, xs[1], Y, enough, ramp(t, c.structure, 0.4));
  termRow(
    t,
    L(["刚好够用"], ["Just enough"]),
    [c.enough],
    L(["概念和结构"], ["concepts and structure"]),
    [c.concepts],
    xs[1],
    under,
    row,
  );
  const big = g * named(t, bigAt);
  modelGrid(xs[2] - 130, Y - 75, 260, 150, { alpha: big, color: P.ink });
  termRow(
    t,
    L(["模型大了"], ["Bigger than it needs to be"]),
    [bigAt],
    L(["用不上的概念"], ["concepts they do not need"]),
    [c.unneeded],
    xs[2],
    under,
    row,
  );
  const small = g * named(t, c.small),
    lost = soon(t, c.lost + 0.05, 0.9);
  box(xs[0] - 32, Y - 20, 64, 40, { stroke: P.ink, alpha: small, radius: 6, width: 2.5 });
  // The meaning does not fit the small model: it sits on its edge and falls away when it is lost.
  dot(xs[0] + 44, mix(Y - 30, Y + 40, lost), 6, { color: P.ink, alpha: small * (1 - lost) });
  termRow(
    t,
    L(["小到装不下原意"], ["Too small"]),
    [c.small],
    L(["半路丢掉"], ["the meaning is lost"]),
    [c.lost],
    xs[0],
    under,
    row,
  );
}

/* Half the width of a term row centred on its mark, its qualifier under the term: what a group's centring takes for a
 * name wider than its mark. */
export const rowHalf = (term, qual = []) =>
  Math.max(measure(term.join("")), qual.length ? measure(qual.join(""), NOTE) : 0) / 2;

/* How far a group that builds part by part reaches at t, so it can stand centred on what it shows: from `base`, the
 * reach of what stands first, each part that reaches further than those before it widens the group, gliding from just
 * after its words. `parts` are [at, reach] pairs. */
export function reachAt(t, base, parts, duration = 0.7) {
  let reach = base,
    now = base;
  for (const [at, v] of [...parts].sort((a, b) => a[0] - b[0])) {
    if (v <= reach) continue;
    now += (v - reach) * soon(t, at + 0.05, duration);
    reach = v;
  }
  return now;
}

/* The Change: a document that holds the intent at its head and, on their words, its three fields. */
export const CHANGE_W = 150,
  CHANGE_H = 240;
const fieldNames = () =>
  L(["解决什么", "为什么", "怎样算解决"], ["What to solve", "Why", "What counts as solved"]);
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
 * arrive on their words, each a row of the document linked to its name at the right. The Change stands centred while
 * it is alone, the intent named at its left and moving into it; as each field name that reaches further than those
 * before it is named, the Change glides with its name to stand centred together with the field names that stand. */
export function changeStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  const names = fieldNames(),
    term = L(["正式变更"], ["One official Change"]),
    qual = L(["只写在这一处"], ["only there"]),
    ats = [c.f1, c.f2, c.f3],
    // The group spans the Change's name where it is wider than the document, at either side, and the field names
    // that stand: it reaches `over` left of the Change and right to the end of its name or, once they stand, of the
    // widest field name.
    over = Math.max(0, rowHalf(term, qual) - CHANGE_W / 2),
    alone = 960 - CHANGE_W / 2,
    reach = reachAt(
      t,
      CHANGE_W + over,
      names.map((v, i) => [ats[i], CHANGE_W + 90 + measure(v)]),
    ),
    DX = 960 - (reach - over) / 2,
    DY = 440,
    FX = DX + CHANGE_W + 90,
    into = soon(t, c.change + 0.05, 0.7),
    fields = ats.map((at) => ramp(t, at - 0.15, 0.4));
  changeDocument(DX, DY, { alpha: g * named(t, c.change), fields, intent: 0 });
  // The intent travels from its place into the head of the Change.
  const ix = mix(alone - 190, DX + 52, into),
    iy = mix(DY + 150, DY + 26, into),
    meant = g * named(t, c.intent);
  documentIcon(ix, iy, 46, 58, { alpha: meant, rows: 2, fold: false });
  // Its name stays where the intent was named and leaves as the intent goes in.
  nameText(L("意图", "The intent"), alone - 190 + 23, DY + 150 + 58 + NAME_GAP, {
    valign: "top",
    alpha: meant * (1 - ramp(t, c.change + 0.05, 0.3)),
  });
  // The Change is named under it from its first word; "only there" joins under its name.
  termRow(t, term, [c.change], qual, [c.only], DX + CHANGE_W / 2, DY + CHANGE_H + NAME_GAP, {
    alpha: g,
    align: "center",
  });
  names.forEach((v, i) => {
    link(DX + CHANGE_W, fieldY(DY, i), FX - 14, fieldY(DY, i), {
      alpha: g * fields[i],
      upto: soon(t, ats[i] + 0.05, 0.4),
    });
    nameText(v, FX, fieldY(DY, i), { align: "left", alpha: g * listIn(t, ats, i), set: "fields" });
  });
}

/* 04.5 One copy: the Change and, at its left, a person and an Agent who pick the work up later; each reads it along
 * a link, and what they read is the same. The readers' name and the Change's hang from one line under the lower of
 * their marks, the Agent. The readers and the Change stand centred together, and the group glides as one unit to centre
 * on what they read as well when it is named. */
export function readersStage(s, t, c, g) {
  ruleOneHeading(t, c, g);
  // The English readers' name is their noun, and its relative clause joins under it as a smaller gloss on its own
  // words, so no line ends on "who".
  const readers = L(["后面接手的人和 Agent"], ["Everyone"]),
    readersQual = L([], ["who picks up the work"]),
    same = L("同一份", "The same thing"),
    term = L(["正式变更"], ["The Change"]),
    qual = L(["只写在一处"], ["one copy"]),
    // The group's reach from the Change's left edge: the readers' name to the left, the Change or its name to the
    // right, and what they read beyond it.
    left = 250 + rowHalf(readers, readersQual),
    right = Math.max(CHANGE_W, CHANGE_W / 2 + rowHalf(term, qual)),
    read = CHANGE_W + NAME_GAP + 10 + measure(same),
    DX = 960 + mix(left - right, left - read, soon(t, c.same + 0.05, 0.7)) / 2,
    DY = 440,
    RX = DX - 250,
    AY = 666,
    names = rowNameTop([AY + 22, DY + CHANGE_H]),
    who = g * named(t, c.readers),
    reading = g * named(t, c.same),
    q = (voiceTime(t) * 0.5) % 1;
  changeDocument(DX, DY, { alpha: g });
  termRow(t, term, [c.first5], qual, [c.first5], DX + CHANGE_W / 2, names, {
    alpha: g,
    align: "center",
  });
  person(RX, 540, { alpha: who, size: 1.1 });
  agent(RX, AY, { alpha: who });
  termRow(t, readers, [c.readers], readersQual, [c.readersWho], RX, names, {
    alpha: g,
    align: "center",
  });
  // The person's link runs level into the Change; the Agent's turns up to its lower row.
  for (const [x, y, to, k] of [
    [RX + 34, DY + 90, DY + 90, 0],
    [RX + 26, AY, DY + 160, 0.5],
  ])
    link(x, y, DX, to, {
      route: "hvh",
      alpha: reading,
      upto: soon(t, c.same + 0.05, 0.5),
      flow: (q + k) % 1,
    });
  nameText(same, DX + CHANGE_W + NAME_GAP + 10, DY + 120, { align: "left", alpha: reading });
}
