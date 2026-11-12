/* 03.1, 03.2 and 03.8: ETHOS's name and the different path it takes, the reliable path it offers people and
 * interchangeable Agents with its three promises, and, last, that path again as a design aim the kernel alone does not
 * prove. */

import { datumMark } from "../claim.js";
import { paper } from "../p02/drift.js";
import { ctx } from "../../canvas.js";
import { flowAlong, flowClock, link } from "../../drawing/links.js";
import { dot, line, measure, ring, stroke, text } from "../../drawing/strokes.js";
import { agent, check, person } from "../../drawing/symbols.js";
import { kernelIcon, recoverIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, growName, nameText, rejectedName } from "../../naming/names.js";
import { railNames, railStations, rowNameTop } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { L, en } from "../../timeline.js";
import { mix, ramp } from "../../timing/easing.js";
import { drawShare, drawTime, glideShare, glideTime, voiceTime } from "../../timing/pauses.js";

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
  L(["一个问题", "一个仓库", "用起来怎么样"], ["A problem", "A repository", "In use"]);
/* The height of 03.1's path: it stands low enough that its name keeps clear of the last initial's word. */
const NAME_PATH_Y = () => 600;
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
 * Each initial lights on the words it stands for and its word stands under it as it is said: in Chinese the words of
 * the meaning, said in another order than the letters', so the list builds in the order it is spoken. The path runs
 * centred under the letters, from the gap after the first to the gap before the last, and its name hangs past its end,
 * so the picture stays centred with it; it stands low enough that that name keeps clear of the last initial's word. */
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
    lights = [c.w1, c.w2, c.w3, c.w4, c.w5];
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
  // A different path, drawn on its words from the datum, the claim's point, at its start, and named at its end; its end
  // point leads it out as a stroke drawing on (drawShare), from just before its ink arrives, so the path nears its name
  // within half a second of standing.
  const drawn = drawShare(t, c.otherPath - 0.2, X1 - X0 - 14, 0.9),
    reach = mix(X0 + 14, X1, drawn),
    on = a * ramp(t, c.otherPath - 0.15, 0.4);
  datumMark(X0, Y, 14, on);
  line(X0 + 14, Y, reach, Y, { color: P.ink, alpha: on, width: 3 });
  dot(reach, Y, 7, { color: P.ink, alpha: on });
  // Once it is drawn, points run along it.
  flowAlong(
    [
      [X0 + 14, Y],
      [X1, Y],
    ],
    flowClock(t),
    6,
    { upto: drawn, color: P.ink, alpha: on },
  );
  nameText(L("另一条路", "A different path"), X1 + 7 + NAME_GAP, Y, {
    align: "left",
    alpha: a * named(t, c.otherPath),
  });
  const spoken = [...lights].sort((p, q) => p - q);
  railNames(
    L(
      ["证据", "信任", "人和 Agent", "工作", "打理"],
      ["Evidence-grounded", "Trust", "Human-Agent", "Operational", "Stewardship"],
    ),
    xs,
    LY + LR,
    {
      gap: NAME_GAP,
      alpha: (i) => a * listIn(t, spoken, spoken.indexOf(lights[i])),
      set: "initials",
    },
  );
}

/* 03.2 One reliable path for people and interchangeable Agents: the travellers from the cut, standing on the path's
 * start and named as they are said; the path draws out from under them to its end as the stage opens, as 03.1's path
 * drew out, its name standing at that end on its words, and its three stations arrive on their words. On the words
 * that say it promises three things the path rises and the promises build under it, each with its mark; more
 * governance stands under them, refused. Each state stands centred on what it shows: the travellers alone, by what of
 * their heading stands; then the path draws out under them, and once its end passes the heading's end the picture
 * glides left as it moves right, so the travellers and the path, with the name at its end once it is said, stand
 * centred together throughout. The travellers' heading starts on the person's left edge. The promises hang from the
 * first station's name, their markers' left edge on its left edge, one and a half pitches below the stations' names,
 * so that name does not read as the list's heading; the refusal shares that left edge, one and a half pitches after
 * the last promise, so it reads as set apart from the list rather than as a fourth promise. */
const PATH_LEN = 1080,
  PROMISE_PITCH = 80;
/* The larger of two reaches, joined over about `s` px so that a picture centred on it never sets off at speed when
 * one reach passes the other. */
const softMax = (a, b, s = 80) => (a + b + Math.hypot(a - b, s)) / 2;
export function stagePath(t, a, c) {
  if (a <= 0) return;
  // The path draws out from under the travellers as the stage opens, at full ink from the cut that brings it, so the
  // picture is never thin while the travellers ink in; they stand on its start, so it is one mark with them, named by
  // their heading, until its own name stands at its end on its words. Its end, which travels furthest, leads it out as a stroke drawing on (drawShare) over 1.8 s, and over 2 s in
  // English, whose longer heading its end must pass alone before the picture glides; once the picture glides, the end
  // and the travellers each move at half the drawing's pace.
  const nameAt = c.reliable,
    from = c.pCut + 0.18,
    drawn = drawShare(t, from, PATH_LEN, L(1.8, 2.0)),
    on = a * ramp(t, from - 0.4, 0.4),
    endName = L("靠得住的路", "One reliable path"),
    // The travellers' heading: Chinese builds it as the voice names them, the people and then the Agents with them;
    // English names them in one phrase as the stage opens.
    party = L(["人", "和可以互相替换的 Agent"], ["People and interchangeable Agents"]),
    travellers = party.join(""),
    // While the Chinese heading names only the people, the person ends what stands, 70 px right of the path's start;
    // the Agent arrives with its name, and the picture glides to the whole heading as they join it.
    alone = Math.max(60, measure(party[0])),
    heading = en
      ? measure(travellers)
      : mix(alone, measure(travellers), glideShare(t, c.agents + 0.05, (measure(travellers) - alone) / 2, 0.7)),
    // Where the path starts: the picture spans from it to the end of the travellers' heading, which starts 10 px
    // right of it, or to the path's end and, once it is said, the name there, whichever reaches further, and stands
    // centred. The two reaches meet by a soft maximum, so the picture sets off gently as the path passes the heading.
    named2 = glideShare(t, nameAt - 0.1, (NAME_GAP + measure(endName)) / 2, 0.6),
    X0 = 960 - softMax(10 + heading, PATH_LEN * drawn + 7 + (NAME_GAP + measure(endName)) * named2) / 2,
    PY = mix(560, 380, glideShare(t, c.three + 0.05, 180, 0.7)),
    X1 = X0 + PATH_LEN,
    reach = mix(X0, X1, drawn),
    // The name stands at the path's end, and never left of the end of the travellers' heading.
    nameX = Math.max(reach + 7 + NAME_GAP, X0 + 10 + measure(travellers) - measure(endName)),
    names = STATION_NAMES(),
    xs = railStations(names, X0 + 240, X1 - 60),
    sts = [c.st1, c.st2, c.st3];
  pathLine(
    X0,
    reach,
    PY,
    xs.filter((x, i) => t > sts[i] - 0.15 && x + 28 < reach),
    { alpha: on },
  );
  dot(reach, PY, 7, { color: P.ink, alpha: on });
  // Points run along the path from its start once the picture has settled: each stands at its distance from the start,
  // so the path drawing on never moves them. A point leaves by its size before a station that stands on the path and
  // enters again past it.
  flowAlong(
    [
      [X0, PY],
      [reach, PY],
    ],
    flowClock(t),
    6,
    {
      // The dots set off once the picture has stopped gliding: a dot running right on a stage gliding left at more than
      // its own pace would slow to a stand on the screen and run back (the English gate's halt at 162.27 s).
      since: flowClock(
        Math.max(
          from + drawTime(PATH_LEN, L(1.8, 2.0)),
          nameAt - 0.1 + glideTime((NAME_GAP + measure(endName)) / 2, 0.6),
        ),
      ),
      // The path grows, so its dots keep one period whatever its length: 1.6 s, 288 px apart, out of step with the
      // stations' pitch of about 390 px, so the dots never all shrink at the stations at once.
      every: 1.6,
      clear: xs.map((x, i) => [x, PY, 28, ramp(t, sts[i] - 0.15, 0.4)]),
      color: P.ink,
      alpha: on,
    },
  );
  nameText(endName, nameX, PY, {
    align: "left",
    alpha: a * named(t, nameAt),
  });
  // The travellers stand on the path's start, their shoulders and the Agent's foot 8 px over it, from the cut, as their
  // clause begins: English names them there; Chinese names the people on 给人, and the Agent arrives with its name.
  const TX = X0 + 40;
  person(TX, PY - 38, { size: 1.3, alpha: a });
  agent(TX + 64, PY - 32, { size: 1.1, alpha: a * (en ? 1 : ramp(t, c.agents - 0.15, 0.4)) });
  growName(t, party, L([c.people, c.agents], [c.pCut + 0.15]), TX - 30, PY - 102, {
    valign: "bottom",
    alpha: a,
    build: true,
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

/* 03.8 The design aim: the path with its stations, named the whole path at its end as 03.2 names it, its stretch beyond
 * the kernel dashed and named as an aim; the kernel holds up only the path's start, and ETHOS's own documents say the
 * kernel alone does not prove the whole path has been delivered: that claim, with its subject, stands refused beside
 * them, named on its words and carrying its cross from its first frame, since the voice refuses it before it names it.
 * The stations stand centred on the dashed stretch, 50 px inside its ends, and the aim is named over the middle one,
 * the stretch's centre; the solid start is centred on the kernel. The kernel's and the documents' names stand on one
 * baseline, under the taller of the two. The path, its stations and its name stand from the thought's first words, the
 * whole path, so the repositories of 03.7 never hold into the thought (EN-R16-06); the aim, the documents and the
 * kernel join on their words, and the refused claim at its end. The picture stands midway between where the path with
 * its name and the finished picture are centred: neither stands more than half their difference off the centre. */
export function stageAims(t, a, c) {
  if (a <= 0) return;
  const names = STATION_NAMES(),
    kernelName = L("光有这个内核", "The kernel alone"),
    // The refused claim breaks before its predicate in English, so no line ends on an auxiliary.
    claim = L(["整条路已经走通"], ["The whole path", "has been delivered"]),
    claimWide = Math.max(...claim.map((v) => measure(v))),
    base = railStations(names, 850, 1390),
    // The rejected name's cross stands 16 px after its words and is 26 px wide.
    docsName = L("它自己的文档", "Its own documents"),
    pathName = L("整条路", "The whole path"),
    left = Math.min(600, 700 - measure(kernelName) / 2),
    open = Math.max(
      1440 + 7 + NAME_GAP + measure(pathName),
      base[2] + measure(names[2]) / 2,
      1186 + measure(docsName) / 2,
    ),
    right = Math.max(open, 1282 + claimWide + 42),
    dx = 960 - (2 * left + open + right) / 4;
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
  nameText(pathName, X1 + 7 + NAME_GAP, PY, { align: "left", alpha: a * named(t, c.aimsCut) });
  nameText(L("设计目标", "Design aim"), xs[1], PY - 28 - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.aims),
  });
  const namesTop = rowNameTop([640 + 46, 590 + 92]);
  // The kernel alone, under the path's start, holding up only that part of it.
  const kernel = a * ramp(t, c.alone - 0.15, 0.4);
  kernelIcon(KX, 640, 46, { alpha: kernel, color: P.ink, turn: 0.12 * voiceTime(t) });
  link(KX, 594, KX, PY + 3, { alpha: kernel, draw: { t, at: c.alone + 0.05 }, end: false });
  nameText(kernelName, KX, namesTop, {
    valign: "top",
    alpha: a * named(t, c.alone),
  });
  // Its own documents, and what they will not claim.
  const docs = a * ramp(t, c.docs - 0.15, 0.4);
  paper(1150 + dx, 590, 72, 92, { alpha: docs, rows: 4 });
  nameText(docsName, 1186 + dx, namesTop, {
    valign: "top",
    alpha: a * named(t, c.docs),
  });
  rejectedName(claim, 1260 + NAME_GAP + dx, 636, {
    align: "left",
    alpha: a * named(t, c.wholePath),
    mark: 1,
  });
}
