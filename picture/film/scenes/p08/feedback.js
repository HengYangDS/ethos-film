/* 08.6-08.7 the requirement's life after release: two corrections in one day overwrite each other in a pipeline
 * that knows only one, and the report of it is judged in three parts kept apart: what was observed, the inference
 * about why, and the remedy proposed. */

import { ctx } from "../../canvas.js";
import { link, along } from "../../drawing/links.js";
import { box, dot, measure, ring, stroke } from "../../drawing/strokes.js";
import { check, clock, documentIcon, person, stopSign } from "../../drawing/symbols.js";
import { askIcon } from "../../drawing/workspace.js";
import { beats, building, listIn, named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cueFrom, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* The pipeline of the example, drawn here as the vendor's feed, the run and a store of two slots. */
const Y = 530,
  FEED = 470,
  RUN = 800,
  STORE = [1220, Y, 400, 148],
  SLOTS = [Y - 37, Y + 37];
/* The feed and the run stand with the vendor; the store stands with its first slot and each slot with its name, since
 * two slots of one size are read as a list whose members each wait for a name. */
function pipelineParts(alpha, store, slots) {
  if (alpha < 0.01) return;
  const [sx, sy, sw, sh] = STORE;
  ring(FEED, Y, 38, { color: P.ink, alpha, width: 2.5 });
  dot(FEED, Y, 12, { color: P.ink, alpha });
  box(RUN - 110, Y - 48, 220, 96, { fill: P.row, stroke: P.ink, alpha, radius: 10, width: 2.5 });
  stroke(
    () => {
      for (let i = -1; i <= 1; i++) {
        const cx = RUN + i * 50;
        ctx.moveTo(cx - 8, Y - 16);
        ctx.lineTo(cx + 8, Y);
        ctx.lineTo(cx - 8, Y + 16);
      }
    },
    { color: P.ink, alpha, width: 2.5 },
  );
  link(FEED + 40, Y, RUN - 110, Y, { alpha, end: false });
  link(RUN + 110, Y, sx - sw / 2 - 2, Y, { alpha: Math.min(alpha, store), end: false });
  box(sx - sw / 2, sy - sh / 2, sw, sh, {
    stroke: P.ink,
    alpha: Math.min(alpha, store),
    radius: 12,
    width: 2.5,
  });
  SLOTS.forEach((y, i) =>
    box(sx - 185, y - 27, 370, 54, {
      stroke: P.line,
      alpha: Math.min(alpha, slots[i]),
      radius: 8,
      width: 2,
    }),
  );
}
/* A correction's way: from the feed into the run, and from the run into the store's slot of a single correction. */
const INTO_RUN = [
    [FEED + 44, Y],
    [RUN, Y],
  ],
  INTO_SLOT = [
    [RUN, Y],
    [STORE[0] + 150, Y],
    [STORE[0] + 165, SLOTS[1]],
  ];
const travel = (t, toRun, toSlot) =>
  toSlot > 0 ? along(INTO_SLOT, toSlot).point : along(INTO_RUN, toRun).point;

/* 08.6. A few days later, on a clock whose hand turns while the voice speaks: the vendor sends two corrections for the
 * same stock on the same day, the second drawn larger than the first; the pipeline keeps only an original value and
 * a single correction, each a slot of its store named on its words, and the second correction, arriving in the same
 * slot, takes the first one's place there, named under the store. The clock stands on the vendor's axis, and the
 * names over the row end on one line clear of the run. Until the store is named, the feed and the run stand centred on
 * the frame; they step left as it arrives, and the finished picture, from the vendor's names to the store, is
 * centred. */
export function corrections(s, t, a) {
  if (a <= 0) return;
  const [laterAt, vendorAt, twoAt, pipeAt, origAt, singleAt, secondAt, overAt] = cues(s, [
    ["几天后", "A few days later"],
    ["厂商在同一天", "the vendor"],
    ["两次更正", "two corrections"],
    ["管线只认得", "The pipeline"],
    ["原值", "an original value"],
    ["一次更正", "a single correction"],
    ["第二次更正", "the second correction"],
    ["覆盖掉了", "overwrites the first"],
  ]);
  const LATER = L("几天后", "A few days later"),
    VENDOR = L("厂商", "the vendor"),
    TWO = L("两次更正", "two corrections"),
    OVER = L("覆盖掉了", "overwrites the first"),
    left = Math.min(FEED - 38, FEED - measure(TWO) / 2, FEED - measure(VENDOR) / 2),
    before = Math.max(RUN + 110, FEED + 40 + measure(LATER)),
    after = Math.max(before, STORE[0] + STORE[2] / 2, STORE[0] + measure(OVER) / 2),
    ABOVE = Y - 48 - NAME_GAP;
  const v = a * named(t, vendorAt),
    over = ramp(t, overAt - 0.15, 0.4),
    alone = 960 - (left + before) / 2,
    done = 960 - (left + after) / 2,
    // At least 0.8 s, longer for a longer step, so the picture keeps one pace as it steps.
    off = mix(alone, done, soon(t, origAt - 0.45, Math.max(0.8, Math.abs(alone - done) / 350)));
  ctx.save();
  ctx.translate(off, 0);
  clock(FEED, 330, 24, { hand: (voiceTime(t) * 0.5) % 1, alpha: a });
  nameText(LATER, FEED + 40, 330, {
    align: "left",
    alpha: a * named(t, laterAt),
  });
  pipelineParts(v, a * named(t, origAt), [a * named(t, origAt), a * named(t, singleAt)]);
  nameText(VENDOR, FEED, Y + 38 + NAME_GAP, { valign: "top", alpha: v });
  nameText(L("管线", "The pipeline"), RUN, ABOVE, {
    valign: "bottom",
    alpha: a * named(t, pipeAt),
  });
  nameText(L("原值", "an original value"), STORE[0] - 170, SLOTS[0], {
    align: "left",
    alpha: a * named(t, origAt),
  });
  nameText(L("一次更正", "a single correction"), STORE[0] - 170, SLOTS[1], {
    align: "left",
    alpha: a * named(t, singleAt),
  });
  // The two corrections enter the run together; the first goes on into the slot of a single correction as it is
  // named, and the second follows into the same slot and takes the first one's place there.
  const c = a * named(t, twoAt);
  nameText(TWO, FEED, ABOVE, { valign: "bottom", alpha: c });
  if (c > 0.01) {
    const [x1, y1] = travel(t, soon(t, twoAt + 0.1, 1.0), soon(t, singleAt + 0.2, 1.0)),
      [x2, y2] = travel(t, 0.8 * soon(t, twoAt + 0.3, 1.0), soon(t, secondAt + 0.05, 1.2));
    // Sized apart from each other and from the feed's point, so neither is read as one of a list of points.
    dot(x1, y1, 7, { color: P.ink, alpha: c * (1 - over) });
    dot(x2, y2, 16, { color: P.ink, alpha: c });
  }
  // What the second correction does is named under the store, whose slot it overwrites.
  nameText(OVER, STORE[0], STORE[1] + STORE[3] / 2 + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, overAt),
  });
  ctx.restore();
}

/* The three things judged apart: each a panel with its term and what it says, and the verdict it is given. */
const JUDGED = () => [
  [L("观察到的", "The observation"), L("第一次更正不见了", "the first correction has disappeared")],
  [
    L("推断的原因", "The inference"),
    L("厂商会多次更正", "the vendor can correct a value more than once"),
  ],
  [
    L("提出的补救办法", "the proposed remedy"),
    // Authored as its lines, each edition breaking between its phrases: the automatic break would split 修订编号, and
    // the English one would end its first line on "by".
    L(["按厂商给的修订编号", "来区分记录"], ["tell records apart", "by the revision number"]),
  ],
];
const PANEL_W = 400,
  PANEL_H = 140,
  PANEL_Y = 560,
  PANEL_X = [480, 960, 1440];
function verdictMark(i, x, y, alpha) {
  if (i === 0) check(x, y, 28, { alpha, width: 4 });
  else if (i === 1) askIcon(x, y, 18, { alpha, color: P.ink });
  else stopSign(x, y, 17, { alpha, color: P.ink });
}

/* 08.7. The people watching the pipeline report back along a link to their report, and ETHOS's rule that three
 * things be judged separately is named between them. The three panels then build below on their words, the row moving
 * toward the centre as each joins so it stays balanced; each panel states its part. Last, why they are kept apart,
 * a rule standing between each two panels on the words that say so: the inference may be wrong, the observation still stands, the remedy is refused, and the observation's check beats
 * again as the problem is said to remain. The report's row stands on the panels' three columns, the people over the
 * first, the rule over the middle one and the report over the last, its three names on one baseline, so the row is
 * centred on the frame both alone and over the finished panels. */
export function judgement(s, t, a) {
  if (a <= 0) return;
  const [peopleAt, backAt, threeAt, obsAt, obsSays, infAt, infSays, remAt, remSays] = cues(s, [
    ["负责观察的人", "The people watching the pipeline"],
    ["把情况报了回来", "report this back"],
    ["三件事要分开判断", "three things be judged separately"],
    ["观察到的，是", "The observation is"],
    ["第一次更正不见了", "the first correction has disappeared"],
    ["推断的原因", "The inference"],
    ["厂商会多次更正", "the vendor can correct"],
    ["提出的补救办法", "the proposed remedy"],
    ["按厂商给的修订编号", "tell records apart"],
  ]);
  const [wrongAt, standsAt, rejectAt, problemAt] = cues(s, [
    ["可能错", "can be wrong"],
    ["照样成立", "still stands"],
    ["被否掉", "rejecting"],
    ["问题不存在", "the problem go away"],
  ]);
  // The Chinese "要分开" first occurs in the rule's "三件事要分开判断", so it is taken after the remedy's words.
  const apartAt = cueFrom(s, "要分开", "They stay apart", remSays);
  // The report stands on the centre line until the panels come, then rises to make room for them. The people stand on
  // the report's bottom line, so the row's names hang one gap under each of their marks on one baseline.
  const p = a * named(t, peopleAt),
    b = a * named(t, backAt),
    TOP = mix(450, 300, soon(t, obsAt - 0.5, 0.8)),
    [PX, , DX] = PANEL_X,
    DOC = [84, 108],
    PY = TOP + DOC[1] / 2 - 22.7 * 1.5,
    names = rowNameTop([PY + 22.7 * 1.5, TOP + DOC[1] / 2]);
  person(PX, PY, { size: 1.5, alpha: p });
  nameText(L("负责观察的人", ["The people watching", "the pipeline"]), PX, names, {
    valign: "top",
    alpha: p,
  });
  // The link spans the three panels; it draws on at the pace of a link across two of them.
  link(PX + 40, TOP, DX - DOC[0] / 2 - 12, TOP, {
    alpha: b,
    upto: soon(t, backAt + 0.05, Math.max(0.8, (DX - DOC[0] / 2 - 52 - PX) / 760)),
    flow: (voiceTime(t) * 0.4) % 1,
  });
  documentIcon(DX - DOC[0] / 2, TOP - DOC[1] / 2, DOC[0], DOC[1], { alpha: b, rows: 0 });
  nameText(L("把情况报了回来", "report this back"), DX, names, {
    valign: "top",
    alpha: b,
  });
  nameText(L("三件事要分开判断", "three things be judged separately"), PANEL_X[1], names, {
    valign: "top",
    alpha: a * named(t, threeAt),
  });
  // The panels, each on its term; the row stands toward its open end for each panel still to come.
  const terms = [obsAt, infAt, remAt],
    says = [obsSays, infSays, remSays],
    verdicts = [standsAt, wrongAt, rejectAt],
    shift = building(t, terms, PANEL_W / 2 + 40, 0.35);
  JUDGED().forEach(([term, said], i) => {
    const x = PANEL_X[i] + shift,
      k = a * named(t, terms[i]),
      left = x - PANEL_W / 2 + 24;
    box(x - PANEL_W / 2, PANEL_Y - PANEL_H / 2, PANEL_W, PANEL_H, {
      stroke: P.ink,
      alpha: k,
      radius: 12,
      width: 2.5,
    });
    nameText(term, left, PANEL_Y - 32, {
      align: "left",
      alpha: a * listIn(t, terms, i),
      set: "08.7:three",
    });
    nameText(said, left, PANEL_Y - 8, {
      align: "left",
      valign: "top",
      width: PANEL_W - 90,
      size: NOTE,
      color: P.muted,
      alpha: a * listIn(t, says, i),
      set: "08.7:says",
    });
    const v = a * named(t, verdicts[i]);
    verdictMark(i, x + PANEL_W / 2 - 40, PANEL_Y - 32, v);
    if (i === 0) beats(t, x + PANEL_W / 2 - 40, PANEL_Y - 32, 30, [problemAt], { alpha: a });
  });
  // They stay apart: a rule between each two panels, on the words that say so, firm enough to read in a frame seen
  // small.
  const apart = a * ramp(t, apartAt - 0.15, 0.4);
  stroke(
    () =>
      [0, 1].forEach((i) => {
        const x = (PANEL_X[i] + PANEL_X[i + 1]) / 2 + shift;
        ctx.moveTo(x, PANEL_Y - PANEL_H / 2 + 12);
        ctx.lineTo(x, PANEL_Y + PANEL_H / 2 - 12);
      }),
    { alpha: apart, width: 4 },
  );
  // Why they stay apart: each verdict named under its panel on its words.
  [L("照样成立", "still stands"), L("可能错", "can be wrong"), L("被否掉", "rejecting")].forEach(
    (v, i) =>
      nameText(v, PANEL_X[i] + shift, PANEL_Y + PANEL_H / 2 + NAME_GAP, {
        valign: "top",
        alpha: a * named(t, verdicts[i]),
        set: "08.7:verdicts",
      }),
  );
}
