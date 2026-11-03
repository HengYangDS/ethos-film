/* Part 04 before rule one (04.1-04.3): ETHOS's design contract holds four rules of judgment, and one made-up example
 * carries them. A market-data pipeline may be run again; a researcher asks that a rerun adds no duplicate records and
 * keeps every vendor correction. Two handoffs shrink that request to one line, the line would delete exactly the
 * corrections, and once it takes the place of the original words no one goes back to them. */

import { ctx } from "../../canvas.js";
import { pipelineMark } from "../../drawing/examples.js";
import { along, link } from "../../drawing/links.js";
import { blend } from "../../drawing/colour.js";
import { flowDot, measure, stroke } from "../../drawing/strokes.js";
import { check, documentIcon, person } from "../../drawing/symbols.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named } from "../../naming/lists.js";
import { NAME_GAP, nameText, rejectedName } from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { agents, card, recordRows, valueCell } from "./marks.js";

/* The request in the researcher's words and the line two handoffs leave of it. The Chinese lines drop a particle of the
 * spoken words, since the verbatim lines would repeat their captions; the quote does so for the same reason. */
export const REQUEST = () =>
  L(["不能多出重复记录", "更正过的数据一定留下"], ["No duplicate records", "Corrections stay"]);
export const QUOTE = () => L("按股票代码、日期去重", "Deduplicate by stock code and date");
const flowOf = (t) => (voiceTime(t) * 0.42) % 1;

/* 04.1 The contract: a wide document whose four rows are its rules, named ETHOS's Product Design Contract; the rows
 * brighten as its four rules of judgment are named. */
export function contractStage(s, t, c, g) {
  const W = 520,
    H = 250,
    x = 960 - W / 2,
    y = 470 - H / 2,
    a = g * clearOfTitle(s, t, y);
  documentIcon(x, y, W, H, { alpha: a, rows: 0 });
  const lit = soon(t, c.rules + 0.05, 0.5);
  stroke(
    () => {
      for (let k = 0; k < 4; k++) {
        const ry = y + H * (0.22 + k * 0.2);
        ctx.moveTo(x + 40, ry);
        ctx.lineTo(x + W - (k % 2 ? 120 : 40), ry);
      }
    },
    { color: P.ink, alpha: a * mix(0.45, 1, lit), width: 3 },
  );
  nameText("ETHOS", 960, y - NAME_GAP, { valign: "bottom", alpha: a * named(t, c.ethos) });
  nameText(L("产品设计契约", "Product Design Contract"), 960, y + H + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.contract),
  });
  nameText(L("四条判断的准则", "Four rules of judgment"), 960, y + H + NAME_GAP + 44, {
    valign: "top",
    alpha: a * named(t, c.rules),
  });
}

/* 04.1 The example: the pipeline at the centre, its data flowing; it is there only to show the idea, and a measured
 * case is refused. */
export function exampleStage(s, t, c, g) {
  const m = pipelineMark(960, 470, 900, { alpha: g, flow: flowOf(t) });
  nameText(L("一个例子", "One example"), 960, m.top - NAME_GAP, {
    valign: "bottom",
    alpha: g * named(t, c.example),
  });
  const idea = L("只为说明道理", "To show the idea"),
    refused = L("实测", "A measured case");
  const w1 = measure(idea),
    row = w1 + 80 + measure(refused) + 42,
    x1 = 960 - row / 2,
    y = m.bottom + NAME_GAP + 18;
  nameText(idea, x1, y, { align: "left", alpha: g * named(t, c.idea) });
  rejectedName(refused, x1 + w1 + 80, y, {
    align: "left",
    alpha: g * named(t, c.measured),
    mark: ramp(t, c.measured + 0.35, 0.35),
  });
}

/* 04.2 The pipeline rises to make room; its rerun loop draws on "run again", and below it the researcher's request
 * builds as two lines, each on its words. The lines start clear of the researcher's name as well as the figure, and
 * the figure, its name and the lines stand centred together. */
export function requestStage(s, t, c, g) {
  const Y = mix(470, 400, soon(t, c.researcher + 0.05, 0.6));
  const m = pipelineMark(960, Y, 900, {
    alpha: g,
    flow: flowOf(t),
    back: soon(t, c.runAgain + 0.05, 0.6),
  });
  nameText(L("行情数据管线", "Market-data pipeline"), 960, m.top - NAME_GAP, {
    valign: "bottom",
    alpha: g * named(t, c.pipe),
  });
  nameText(L("可以再跑一遍", "Can be run again"), 960, m.loop + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.runAgain),
  });
  const lines = REQUEST(),
    ats = [c.dup, c.corrected],
    lw = Math.max(...lines.map((v) => measure(v))),
    who = L("研究员", "A researcher"),
    // The figure's half width, its shoulders' arc, and its name's: the lines keep 36 px from the one and 30 px from
    // the other.
    figure = 1.55 * 15 * 1.2,
    nameHalf = measure(who) / 2,
    unit = Math.max(figure, nameHalf),
    lead = Math.max(figure + 36, nameHalf + 30),
    PX = 960 - (lead + lw - unit) / 2,
    RY = 690,
    on = g * named(t, c.researcher);
  person(PX, RY, { alpha: on, size: 1.2 });
  nameText(who, PX, RY + 28 + NAME_GAP, { valign: "top", alpha: on });
  lines.forEach((v, i) =>
    nameText(v, PX + lead, RY - 24 + i * 50, {
      align: "left",
      alpha: g * listIn(t, ats, i),
      set: "request",
    }),
  );
}

/* The request as a card: the two lines inside a rounded outline. */
const requestWidth = () => Math.max(...REQUEST().map((v) => measure(v))) + 56;
function requestCard(x, y, { alpha = 1, ink = 1, frame = alpha, dash = 0 } = {}) {
  const w = requestWidth();
  card(x, y - 54, w, 108, { alpha: frame * (1 - dash) });
  if (dash > 0) card(x, y - 54, w, 108, { alpha: frame * dash * 0.8, dash: [8, 9] });
  REQUEST().forEach((v, i) =>
    nameText(v, x + 28, y - 21 + i * 42, { align: "left", alpha: alpha * ink, set: "original" }),
  );
  return w;
}
/* The summary as a card: its one line inside a brighter outline. */
const quoteWidth = () => measure(QUOTE()) + 56;
function quoteCard(x, y, { alpha = 1, words = alpha } = {}) {
  const w = quoteWidth();
  card(x, y - 32, w, 64, { alpha, color: P.ink });
  nameText(QUOTE(), x + w / 2, y, { alpha: words });
  return w;
}

/* 04.3 Two handoffs: the request steps down through two Agents and leaves the second as one line, the summary. The
 * chain descends so the stage stands as a block, not a strip; the summary shows its words when they are said. */
export function handoffStage(s, t, c, g) {
  const cw = requestWidth(),
    qw = quoteWidth(),
    x0 = 960 - (cw + 120 + 180 + 120 + qw) / 2,
    a1 = x0 + cw + 120,
    a2 = a1 + 180,
    qx = a2 + 120,
    [Y0, Y1, Y2, Y3] = [380, 465, 550, 640],
    h = g * named(t, c.handoffs);
  requestCard(x0, Y0, { alpha: g });
  const draw = soon(t, c.handoffs + 0.05, 0.6);
  link(x0 + cw, Y0, a1, Y1 - 22, { route: "hv", alpha: h, upto: draw });
  link(a1 + 22, Y1, a2, Y2 - 22, { route: "hv", alpha: h, upto: draw });
  agents(
    [
      [a1, Y1],
      [a2, Y2],
    ],
    { alpha: h },
  );
  nameText(L("两次交接", "Two handoffs"), a1, Y1 + 22 + NAME_GAP, { valign: "top", alpha: h });
  nameText(L("一个 Agent 写的总结", "An Agent's summary"), a2 + 22 + NAME_GAP, Y2, {
    align: "left",
    alpha: g * named(t, c.summary),
  });
  // The request travels from the card through both Agents, smaller after each, until the one line stands.
  const path = [
      [x0 + cw, Y0],
      [a1, Y0],
      [a1, Y1],
      [a2, Y1],
      [a2, Y2],
    ],
    p = clamp((t - c.summary) / Math.max(0.8, c.single - c.summary - 0.1));
  if (p > 0 && p < 1)
    flowDot(...along(path, p).point, p < 0.42 ? 12 : p < 0.75 ? 9 : 6, p, {
      color: P.ink,
      alpha: g,
    });
  const q = g * named(t, c.single);
  link(a2, Y2 + 22, qx, Y3, { route: "vh", alpha: q, upto: soon(t, c.single + 0.05, 0.4) });
  quoteCard(qx, Y3, { alpha: q, words: g * named(t, c.quote) });
  nameText(L("只剩下一句", "A single line"), qx + qw / 2, Y3 + 32 + NAME_GAP, {
    valign: "top",
    alpha: q,
  });
}

/* 04.3 The line followed to the letter, on a table of records: rows 2 and 4 are corrections of the rows above them
 * (the same code and date, a new value), and deduplicating by code and date strikes exactly those rows. */
export function deleteStage(s, t, c, g) {
  const TW = 560,
    TH = 226,
    keepName = L("最该留下的那些更正", "Corrections that had to stay"),
    // The table stands centred and makes room on its right when the corrections are named or struck.
    room = soon(t, Math.min(c.corrections, c.deleted) - 0.1, 0.5),
    tx = 960 - (TW + room * (40 + measure(keepName))) / 2,
    ty = 420,
    qw = quoteWidth(),
    qy = 300;
  quoteCard(tx + TW / 2 - qw / 2, qy, { alpha: g });
  link(tx + TW / 2, qy + 32, tx + TW / 2, ty, { alpha: g, upto: soon(t, c.follow + 0.05, 0.5) });
  nameText(L("照这句话去做", "To the letter"), tx + TW / 2 + NAME_GAP, (qy + 32 + ty) / 2, {
    align: "left",
    alpha: g * named(t, c.follow),
  });
  card(tx, ty, TW, TH, { alpha: g });
  const rx = tx + 60,
    rw = TW - 120,
    ry = ty + 37,
    step = 38;
  recordRows(rx, ry, rw, [0, 1, 3], { step, alpha: g });
  // The corrections stand brighter once they are named, each with a ring at its start; they are struck when the line
  // is said to delete them, and step back.
  const named2 = g * named(t, c.corrections),
    struck = soon(t, c.deleted + 0.05, 0.5);
  recordRows(rx, ry, rw, [2, 4], {
    step,
    alpha: g * mix(1, 0.5, struck),
    color: blend(P.muted, P.ink, named2),
  });
  const v1 = valueCell(rx, rw)[1];
  stroke(
    () => {
      for (const r of [2, 4]) {
        ctx.moveTo(rx - 22 + 7, ry + r * step);
        ctx.arc(rx - 22, ry + r * step, 7, 0, Math.PI * 2);
      }
    },
    { color: P.ink, alpha: named2, width: 2.5 },
  );
  stroke(
    () => {
      for (const r of [2, 4]) {
        ctx.moveTo(rx - 8, ry + r * step);
        ctx.lineTo(mix(rx - 8, v1 + 10, struck), ry + r * step);
      }
    },
    { color: P.ink, alpha: g * ramp(t, c.deleted - 0.15, 0.3), width: 3 },
  );
  nameText(keepName, tx + TW + 40, ry + 3 * step, { align: "left", alpha: named2 });
  nameText(L("恰好会被删掉", "Would delete exactly"), tx + TW / 2, ty + TH + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.deleted),
  });
}

/* 04.3 The summary made reading faster, which is fine; the trouble is that it takes the place of the original words.
 * The original stands upper left and the summary lower right; on "takes the place" the summary moves into the
 * original's place while the original steps down and back, and when no one goes back to it its words fade, leaving
 * its dashed place. Each name travels with its card. */
export function replaceStage(s, t, c, g) {
  const cw = requestWidth(),
    qw = quoteWidth(),
    gone = L("没人再回头看", "No one goes back"),
    takes = L("顶替了原话", "Takes the place"),
    col = Math.max(cw, qw),
    left = 960 - (col + 40 + Math.max(measure(gone), measure(takes))) / 2,
    start = 960 - (cw + 160 + qw) / 2;
  const step = soon(t, c.replace + 0.05, 0.6),
    take = soon(t, c.replace + 0.35, 0.7),
    fade = soon(t, c.noOne + 0.05, 1);
  const ox = mix(start, left + (col - cw) / 2, step),
    oy = mix(400, 670, step),
    qx = mix(start + cw + 160, left + (col - qw) / 2, take),
    qy = mix(560, 400, take);
  // Before it takes the place, the summary is drawn from the original: a link carries its reading along.
  link(start + cw, 400, start + cw + 160 + qw / 2, 528, {
    route: "hv",
    alpha: g * (1 - ramp(t, c.replace - 0.15, 0.25)),
    flow: (voiceTime(t) * 0.5) % 1,
  });
  requestCard(ox, oy, { alpha: g * (1 - fade), ink: mix(1, 0.58, step), frame: g, dash: fade });
  nameText(L("原话", "Original words"), ox + cw / 2, oy + 54 + NAME_GAP, {
    valign: "top",
    alpha: g * named(t, c.original) * (1 - fade),
  });
  nameText(gone, ox + cw + 40, oy, { align: "left", alpha: g * named(t, c.noOne) });
  quoteCard(qx, qy, { alpha: g });
  nameText(takes, qx + qw + 40, qy, { align: "left", alpha: g * named(t, c.replace) });
  // Faster to read: a check below the summary, which travels with it; the check and its words centre on the card
  // together. The check's ink runs from 12.75 px left of its point to 13.85 px right, and the words start 26 px right.
  const fast = g * named(t, c.fast),
    quick = L("读得快", "Reading faster"),
    fx = qx + qw / 2 - (26 - 12.75 + measure(quick)) / 2,
    fy = qy + 32 + NAME_GAP + 16;
  check(fx, fy, 22, { color: P.ink, alpha: fast });
  nameText(quick, fx + 26, fy, { align: "left", alpha: fast });
}
