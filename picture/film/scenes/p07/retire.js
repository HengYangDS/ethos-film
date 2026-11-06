/* 07 rule four, retire what has no obligation: the scene's stages on the first words of its thoughts, and 07.5, where
 * every mechanism needs keeping and the ones kept without an obligation pile up into the burden. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { ring, stroke } from "../../drawing/strokes.js";
import { person } from "../../drawing/symbols.js";
import { illustrative } from "../../framing/chapters.js";
import { named } from "../../naming/lists.js";
import { NAME_GAP, nameText } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { clamp, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";
import { scenes } from "../registry.js";
import { ghost, makings, nameWidth } from "./example.js";
import { closing, ownRepository, replacement, ruleFour } from "./owners.js";

/* A mechanism: a gear of eight teeth, traced into the current path, turned by `turn`; its hub is drawn apart. */
function gearPath(x, y, r, turn = 0) {
  const teeth = 8,
    step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const c = turn + i * step;
    [
      [0.78, -0.5],
      [0.78, -0.22],
      [1, -0.16],
      [1, 0.16],
      [0.78, 0.22],
    ].forEach(([k, d], j) => {
      const px = x + r * k * Math.cos(c + d * step),
        py = y + r * k * Math.sin(c + d * step);
      if (!i && !j) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
  }
  ctx.closePath();
}

/* How far a person drawn at y reaches below it: the ends of its shoulders' arc. */
const personBottom = (y, size) => y + 22.7 * size;

/* 07.5, first: a mechanism turns between the people who keep it, one maintaining and one explaining, each linked to
 * it on their words; as it goes stale it stops and turns to a dashed outline under that word. The three stand on one
 * centre line, and their names hang from one baseline under the row's tallest mark, the mechanism. */
function upkeep(s, t, a) {
  if (a <= 0) return;
  const [mechAt, maintainAt, explainAt, staleAt] = cues(s, [
    ["每个机制", "Every mechanism"],
    ["有人维护", "someone to maintain"],
    ["有人解释", "explain it"],
    ["过期", "stale"],
  ]);
  const GX = 960,
    GY = 455,
    R = 100,
    PY = GY + 10,
    top = rowNameTop([GY + R, personBottom(PY, 1.3)]),
    stale = ramp(t, staleAt - 0.15, 0.4),
    turn = 0.3 * voiceTime(Math.min(t, staleAt + 0.2)),
    flow = (voiceTime(t) * 0.45) % 1,
    m = a * named(t, maintainAt),
    e = a * named(t, explainAt);
  stroke(() => gearPath(GX, GY, R, turn), { color: P.ink, alpha: a * (1 - stale), width: 3 });
  ring(GX, GY, R * 0.3, { color: P.ink, alpha: a * (1 - 0.4 * stale), width: 3 });
  stroke(() => gearPath(GX, GY, R, turn), {
    color: P.line,
    alpha: a * stale,
    width: 3,
    dash: [9, 7],
  });
  nameText(L("每个机制", "Every mechanism"), GX, top, {
    valign: "top",
    alpha: a * named(t, mechAt),
  });
  nameText(L("过期", "Stale"), GX, GY - R - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, staleAt),
  });
  person(640, PY, { size: 1.3, alpha: m });
  link(678, GY, GX - R - 12, GY, { alpha: m, upto: soon(t, maintainAt + 0.05, 0.5), flow });
  // Each person is named as who they are, someone to maintain it and someone to explain it.
  nameText(L("有人维护", "Someone to maintain it"), 640, top, { valign: "top", alpha: m });
  person(1280, PY, { size: 1.3, alpha: e });
  link(1242, GY, GX + R + 12, GY, {
    alpha: e,
    upto: soon(t, explainAt + 0.05, 0.5),
    flow: (flow + 0.5) % 1,
  });
  nameText(L("有人解释", "Someone to explain it"), 1280, top, { valign: "top", alpha: e });
}

/* The stale mechanisms of the pile, touching one another so the pile reads as one mark: their centres, sizes and
 * turns, in the order they are kept. Each stays under the size of a frame, so the pile is not read as an empty panel. */
const PILE = [
  [840, 550, 50, 0.1],
  [940, 550, 50, 0.5],
  [1040, 550, 50, 0.2],
  [1140, 550, 50, 0.7],
  [890, 460, 50, 0.35],
  [990, 460, 50, 0.6],
  [1090, 460, 50, 0.15],
  [940, 370, 50, 0.45],
  [1040, 370, 50, 0.25],
];
/* 07.5, second: the mechanisms whose obligation is gone are kept one after another on their words, piling row on row
 * on a shelf as one dashed mark; as governance becomes the burden, the shelf bends under them and the pile sinks with
 * it. The pile's name stands beside it at the height of its middle row and sinks with it, on one line in both
 * editions: wrapped by measure, the English name would break after "without", which no line may end on. The shelf is
 * named as governance itself under it, and the picture, the name and the shelf, is centred on the frame. */
const PILE_WRAP = 460;
function burden(s, t, a) {
  if (a <= 0) return;
  const [goneAt, govAt, burdenAt] = cues(s, [
    ["已经没有义务的机制", "the ones whose obligation is gone"],
    ["治理本身", "governance itself"],
    ["治理本身就成了负担", "becomes the burden"],
  ]);
  const PILE_NAME = L("没有义务的机制", "Mechanisms without an obligation"),
    [mx, my, mr] = PILE[4],
    NX = mx - mr - 30,
    // The shelf is centred on the pile, its ends 140 px beyond the outer mechanisms' axes.
    SHELF = [700, 1280],
    MIDX = (SHELF[0] + SHELF[1]) / 2,
    S = 960 - (NX - nameWidth(PILE_NAME, PILE_WRAP) + SHELF[1] + 2) / 2;
  const kept = 1 + Math.floor((PILE.length - 1) * clamp((t - goneAt - 0.05) / 0.6)),
    sag = 34 * soon(t, burdenAt + 0.05, 1.2),
    depth = (x) => sag * (1 - ((x - MIDX) / (MIDX - SHELF[0])) ** 2),
    g = a * named(t, goneAt),
    b = a * named(t, govAt);
  ctx.save();
  ctx.translate(S, 0);
  stroke(
    () =>
      PILE.slice(0, kept).forEach(([x, y, r, turn]) => {
        const cy = y + depth(x);
        gearPath(x, cy, r, turn);
        ctx.moveTo(x + r * 0.3, cy);
        ctx.arc(x, cy, r * 0.3, 0, Math.PI * 2);
      }),
    { color: P.line, alpha: g, width: 3, dash: [9, 7] },
  );
  stroke(
    () => {
      ctx.moveTo(SHELF[0], 602);
      ctx.quadraticCurveTo(MIDX, 602 + 2 * sag, SHELF[1], 602);
    },
    { color: P.ink, alpha: g, width: 4 },
  );
  nameText(PILE_NAME, NX, my + depth(mx), {
    align: "right",
    width: PILE_WRAP,
    alpha: g,
  });
  // The shelf the pile bends is governance itself, named under it on its words.
  nameText(L("治理本身", "Governance itself"), MIDX, 602 + sag + NAME_GAP + 8, {
    valign: "top",
    alpha: b,
  });
  ctx.restore();
}

scenes["07"] = function (s, t) {
  const [ghostAt, ruleAt, ownAt, replAt, changeAt, mechAt, goneAt] = cues(s, [
    ["这个脚本要是留着", "If the script stays"],
    ["这就是第四条准则", "That is rule four"],
    ["ETHOS 判断", "ETHOS judges"],
    ["拿新做法", "A replacement"],
    ["一项正式变更", "And an official Change"],
    ["每个机制", "Every mechanism"],
    ["已经没有义务的机制", "Keep the ones"],
  ]);
  // One stage per idea, each cut in on its first words: the example's two (07.1, 07.2), the rule (07.3), its three
  // consequences (07.4) and the burden of mechanisms kept (07.5).
  const a1 = stageOut(t, ghostAt),
    a2 = stageIn(t, ghostAt) * stageOut(t, ruleAt),
    b = stageIn(t, ruleAt) * stageOut(t, ownAt),
    c1 = stageIn(t, ownAt) * stageOut(t, replAt),
    c2 = stageIn(t, replAt) * stageOut(t, changeAt),
    c3 = stageIn(t, changeAt) * stageOut(t, mechAt),
    d1 = stageIn(t, mechAt) * stageOut(t, goneAt),
    d2 = stageIn(t, goneAt);
  // The example's script and sheet are illustrative; the rule and its consequences are ETHOS's own.
  illustrative(a1 + a2);
  makings(s, t, a1);
  ghost(s, t, a2);
  ruleFour(s, t, b);
  ownRepository(s, t, c1);
  replacement(s, t, c2);
  closing(s, t, c3);
  upkeep(s, t, d1);
  burden(s, t, d2);
};
