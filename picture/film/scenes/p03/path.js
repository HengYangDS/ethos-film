/* 03.1, 03.2 and 03.8: ETHOS's name and the different path it takes, the reliable path it offers people and
 * interchangeable Agents with its three promises, and, last, that path again as a design aim the kernel alone does not
 * prove. */

import { datumMark } from "../claim.js";
import { paper } from "../p02/drift.js";
import { centring } from "./kernel.js";
import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { dot, flowDot, line, measure, ring, stroke, text } from "../../drawing/strokes.js";
import { agent, check, person } from "../../drawing/symbols.js";
import { kernelIcon, recoverIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, nameText, rejectedName } from "../../naming/names.js";
import { railNames, railStations, rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* A path from x0 to x1 at y, in pieces that leave the rings of the stations at `gaps` clear, so no line runs under a
 * station's glyph; `dash` draws it dashed from `split` on. */
function pathLine(x0, x1, y, gaps, { alpha = 1, split = Infinity } = {}) {
  const ends = [x0, ...gaps.flatMap((x) => [x - 28, x + 28]), x1],
    pieces = [];
  for (let k = 0; k < ends.length; k += 2) pieces.push([ends[k], ends[k + 1]]);
  stroke(
    () =>
      pieces.forEach(([a, b]) => {
        if (Math.min(b, split) <= a) return;
        ctx.moveTo(a, y);
        ctx.lineTo(Math.min(b, split), y);
      }),
    { color: P.ink, alpha, width: 3 },
  );
  if (split < x1)
    stroke(
      () =>
        pieces.forEach(([a, b]) => {
          if (b <= Math.max(a, split)) return;
          ctx.moveTo(Math.max(a, split), y);
          ctx.lineTo(b, y);
        }),
      { color: P.ink, alpha: alpha * 0.85, width: 3, dash: [9, 9] },
    );
}
/* The path's three stations: a problem, a repository, real use, each a ring with its glyph. */
const STATION_NAMES = () =>
  L(["弄清一个问题", "改动代码仓库", "用起来到底怎么样"], ["A problem", "A repository", "In use"]);
/* The height of 03.1's path: in English it stands lower, so its name keeps clear of the last initial's word. */
const NAME_PATH_Y = () => L(560, 600);
function station(x, y, i, alpha) {
  if (alpha < 0.01) return;
  dot(x, y, 28, { color: P.ground, alpha });
  ring(x, y, 28, { color: P.ink, alpha, width: 2.5 });
  if (i === 0) text("?", x, y + 1, 30, { role: "mark", align: "center", alpha, bold: true });
  if (i === 1) {
    line(x - 6, y - 12, x - 6, y + 12, { color: P.ink, alpha, width: 2.5 });
    stroke(
      () => {
        ctx.moveTo(x - 6, y + 4);
        ctx.quadraticCurveTo(x - 6, y - 6, x + 8, y - 8);
      },
      { color: P.ink, alpha, width: 2.5 },
    );
  }
  if (i === 2) person(x, y + 6, { size: 0.55, alpha });
}

/* 03.1 ETHOS takes a different path: the chapter opens on the first word with the name and its five initials, five
 * rings drawn as one mark; the path draws out on its words from the datum, the claim's point, and is named at its end.
 * In Chinese the name's meaning is said in two clauses that stand under the path, and each initial lights on the words
 * it stands for; in English each word stands under its initial as it is said. The path runs centred under the
 * letters, from the gap after the first to the gap before the last, and its name hangs past its end, so the picture
 * stays centred with it; in English it stands lower, so that name keeps clear of the last initial's word above it. */
export function stageName(s, t, a, c) {
  if (a <= 0) return;
  // The chapter opens on the first word: the name and its five initials, one mark of rings, stand together.
  const g = a * clearOfTitle(s, t, 330),
    open = g * ramp(t, c.first - 0.4, 0.4),
    xs = [560, 760, 960, 1160, 1360],
    LY = 430,
    LR = 40,
    Y = NAME_PATH_Y(),
    X0 = (xs[0] + xs[1]) / 2,
    X1 = (xs[3] + xs[4]) / 2,
    lights = [c.w1, c.w2, c.w3, c.w4, c.w5],
    q = (voiceTime(t) * 0.35) % 1;
  nameText("ETHOS", 960, 350, { alpha: g * named(t, c.first - 0.25) });
  stroke(
    () =>
      xs.forEach((x) => {
        ctx.moveTo(x + LR, LY);
        ctx.arc(x, LY, LR, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha: open, width: 2.5 },
  );
  "ETHOS".split("").forEach((letter, i) => {
    const lit = en ? speaking(t, lights, i) : ramp(t, lights[i] - 0.1, 0.4);
    ring(xs[i], LY, LR + 8, { color: P.ink, alpha: open * lit * 0.6, width: 3 });
    text(letter, xs[i], LY + 1, 40, {
      role: "mark",
      align: "center",
      bold: true,
      alpha: open * mix(0.75, 1, lit),
    });
  });
  // A different path, drawn on its words from the datum, the claim's point, at its start, and named at its end.
  const drawn = soon(t, c.otherPath - 0.1, 0.9),
    reach = mix(X0 + 14, X1, drawn),
    on = a * ramp(t, c.otherPath - 0.15, 0.4);
  datumMark(X0, Y, 14, on);
  line(X0 + 14, Y, reach, Y, { color: P.ink, alpha: on, width: 3 });
  dot(reach, Y, 7, { color: P.ink, alpha: on });
  if (drawn >= 1) flowDot(mix(X0 + 14, X1, q), Y, 6, q, { color: P.ink, alpha: on });
  nameText(L("另一条路", "A different path"), X1 + 7 + NAME_GAP, Y, {
    align: "left",
    alpha: a * named(t, c.otherPath),
  });
  if (en)
    railNames(
      ["Evidence-grounded", "Trust", "Human-Agent", "Operational", "Stewardship"],
      xs,
      LY + LR,
      { gap: NAME_GAP, alpha: (i) => a * listIn(t, lights, i), set: "initials" },
    );
  else {
    nameText("几个英文词的首字母", 960, LY + LR + NAME_GAP, {
      valign: "top",
      alpha: a * named(t, c.initials),
    });
    nameText("人和 Agent 一起打理工作", 960, Y + 50, {
      valign: "top",
      alpha: a * named(t, c.gloss1),
    });
    nameText("信任要建立在证据上", 960, Y + 100, {
      valign: "top",
      alpha: a * named(t, c.gloss2),
    });
  }
}

/* 03.2 One reliable path for people and interchangeable Agents: the travellers at its start from the cut, its three
 * stations on their words and its name at its end. On the words that say it promises three things the path rises and
 * the promises build under it, each with its mark; more governance stands under them, refused. The path and the name
 * at its end stand centred on the frame. Until that name arrives, the path and its travellers stand where 03.1's path
 * stood, centred on the frame at its height, so the cut keeps the path in place; as the name arrives they glide as one
 * to their own place. The travellers' heading starts on the person's left edge. The promises hang from the first
 * station's name, their markers' left edge on its left edge, one and a half pitches below the stations' names, so that
 * name does not read as the list's heading; the refusal shares that left edge, one and a half pitches after the last
 * promise, so it reads as set apart from the list rather than as a fourth promise. The path is long enough that, while
 * the travellers stand on it alone before its name arrives, the picture still spans a tenth of the content band. */
const PATH_LEN = 1080,
  PROMISE_PITCH = 80;
export function stagePath(t, a, c) {
  if (a <= 0) return;
  // Chinese says the path at the end of the travellers' long clause, so it is named within that clause, about a second
  // ahead of its words; English says it right after them.
  const nameAt = L(c.reliable - 0.95, c.reliable),
    settle = soon(t, nameAt + 0.05, 0.7),
    endName = L("一条靠得住的路", "One reliable path"),
    // Where the path starts when it stands centred with its name, and how far right of that it stands centred alone.
    home = 960 - (PATH_LEN + 7 + NAME_GAP + measure(endName)) / 2,
    X0 = home + mix(centring(home, home + PATH_LEN + 7), 0, settle),
    PY = mix(mix(NAME_PATH_Y(), 560, settle), 380, soon(t, c.three + 0.05, 0.7)),
    X1 = X0 + PATH_LEN,
    q = (voiceTime(t) * 0.35) % 1,
    names = STATION_NAMES(),
    xs = railStations(names, X0 + 240, X1 - 60),
    sts = [c.st1, c.st2, c.st3];
  pathLine(
    X0,
    X1,
    PY,
    xs.filter((x, i) => t > sts[i] - 0.15),
    { alpha: a },
  );
  dot(X1, PY, 7, { color: P.ink, alpha: a });
  flowDot(mix(X0, X1, q), PY, 6, q, { color: P.ink, alpha: a });
  nameText(endName, X1 + 7 + NAME_GAP, PY, {
    align: "left",
    alpha: a * named(t, nameAt),
  });
  // The travellers stand at the path's start; their clause has begun, so they are named from the cut.
  const TX = X0 + 40;
  person(TX, PY - 50, { size: 1.3, alpha: a });
  agent(TX + 64, PY - 44, { size: 1.1, alpha: a });
  nameText(L("人和可以互相替换的 Agent", "People and interchangeable Agents"), TX - 30, PY - 114, {
    valign: "bottom",
    align: "left",
    alpha: a * named(t, c.pCut + 0.15),
  });
  xs.forEach((x, i) => station(x, PY, i, a * ramp(t, sts[i] - 0.15, 0.4)));
  railNames(names, xs, PY + 28, {
    gap: NAME_GAP,
    alpha: (i) => a * listIn(t, sts, i),
    set: "stations",
  });
  // The three promises, each a ring with its mark and its name.
  const ps = [c.p1, c.p2, c.p3],
    edge = xs[0] - measure(names[0]) / 2,
    IX = edge + 22,
    rowY = (i) => PY + 185 + PROMISE_PITCH * i;
  ps.forEach((at, i) => {
    const on = a * ramp(t, at - 0.15, 0.4),
      y = rowY(i);
    if (on < 0.01) return;
    dot(IX, y, 22, { color: P.ground, alpha: on });
    ring(IX, y, 22, { color: P.ink, alpha: on, width: 2.5 });
    if (i === 0) check(IX, y + 1, 18, { color: P.ink, alpha: on, width: 3 });
    if (i === 1) text("?", IX, y + 1, 26, { role: "mark", align: "center", alpha: on, bold: true });
    if (i === 2) recoverIcon(IX, y, 11, { color: P.ink, alpha: on });
  });
  ps.forEach((at, i) =>
    nameText(
      L(
        ["原意不丢", "拿不准的地方说清楚", "能恢复"],
        ["Meaning is kept", "Uncertainty is stated", "The result can be recovered"],
      )[i],
      IX + 22 + NAME_GAP,
      rowY(i),
      { align: "left", alpha: a * listIn(t, ps, i), set: "promises" },
    ),
  );
  rejectedName(L("多加一层治理", "More governance"), edge, rowY(2) + 1.5 * PROMISE_PITCH, {
    align: "left",
    alpha: a * named(t, c.gov),
    mark: ramp(t, c.notPromise + 0.1, 0.4),
  });
}

/* 03.8 These are design aims: the path with its stations, its stretch beyond the kernel dashed and named as an aim; the
 * kernel holds up only the path's start, and ETHOS's own documents say the kernel alone does not prove the whole path
 * has been delivered. The stations stand centred on the dashed stretch, 50 px inside its ends, and the aim is named
 * over the middle one, the stretch's centre; the solid start is centred on the kernel. The kernel's and the
 * documents' names stand on one baseline, under the taller of the two, and the whole picture stands centred on the
 * frame by its extent. */
export function stageAims(t, a, c) {
  if (a <= 0) return;
  const names = STATION_NAMES(),
    kernelName = L("光有这个内核", "The kernel alone"),
    deliveredName = L("已经走通", "Delivered"),
    base = railStations(names, 850, 1390),
    // The rejected name's cross stands 16 px after its words and is 26 px wide.
    left = Math.min(600, 700 - measure(kernelName) / 2),
    right = Math.max(1440 + 7, base[2] + measure(names[2]) / 2, 1282 + measure(deliveredName) + 42),
    dx = 960 - (left + right) / 2;
  const PY = 430,
    X0 = 600 + dx,
    X1 = 1440 + dx,
    KX = 700 + dx,
    split = 800 + dx,
    xs = base.map((x) => x + dx);
  pathLine(X0, X1, PY, xs, { alpha: a, split });
  dot(X1, PY, 7, { color: P.ink, alpha: a });
  xs.forEach((x, i) => station(x, PY, i, a));
  railNames(names, xs, PY + 28, { gap: NAME_GAP, alpha: () => a, set: "aims stations" });
  nameText(L("设计目标", "Design aims"), xs[1], PY - 28 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.aimsCut + 0.15),
  });
  const namesTop = rowNameTop([640 + 46, 590 + 92]);
  // The kernel alone, under the path's start, holding up only that part of it.
  const kernel = a * ramp(t, c.alone - 0.15, 0.4);
  kernelIcon(KX, 640, 46, { alpha: kernel, color: P.ink, turn: 0.12 * voiceTime(t) });
  link(KX, 594, KX, PY + 3, { alpha: kernel, upto: soon(t, c.alone + 0.05, 0.5), end: false });
  nameText(kernelName, KX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.alone),
  });
  // Its own documents, and what they will not claim.
  const docs = a * ramp(t, c.docs - 0.15, 0.4);
  paper(1150 + dx, 590, 72, 92, { alpha: docs, rows: 4 });
  nameText(L("它自己的文档", "Its own documents"), 1186 + dx, namesTop, {
    valign: "top",
    alpha: a * named(t, c.docs),
  });
  rejectedName(deliveredName, 1260 + NAME_GAP + dx, 636, {
    align: "left",
    alpha: a * named(t, c.delivered),
    mark: ramp(t, c.delivered + 0.3, 0.4),
  });
}
