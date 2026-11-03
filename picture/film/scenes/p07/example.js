/* 07.1-07.2 rule four in the example: the first Agent's script and sheet hand their obligations to the owners that
 * carry them and are retired; a script kept anyway returns months later and disagrees with the declared check. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { box, dot, line, measure, ring, stroke } from "../../drawing/strokes.js";
import { agent, check, clock, documentIcon, person } from "../../drawing/symbols.js";
import { askIcon, ledger, repoIcon, terminalIcon } from "../../drawing/workspace.js";
import { named } from "../../naming/lists.js";
import { NAME_GAP, nameText, rejectedName, wrapName } from "../../naming/names.js";
import { rowNameTop } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* The rows of the example's two makings and two owners, and the sizes of their marks. */
const R1 = 370,
  R2 = 620,
  SCRIPT = [200, 120],
  SHEET = [120, 160],
  OWNER = [170, 120],
  LIST = [140, 170];

/* A Change's task list: a document whose rows are tick boxes and lines, drawn as one stroke; its first `done` rows
 * are ticked at the ink `tick`, the last of them at `last`, so a list ticked one row at a time fades each tick in. */
export function taskList(
  x,
  y,
  w,
  h,
  { alpha = 1, rows = 4, done = 0, tick = 1, last = tick } = {},
) {
  if (alpha < 0.01) return;
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha, rows: 0 });
  const ys = Array.from(
    { length: rows },
    (_, i) => y - h / 2 + h * (0.3 + (0.55 * i) / (rows - 1)),
  );
  stroke(
    () =>
      ys.forEach((ry) => {
        ctx.roundRect(x - w * 0.32, ry - 7, 14, 14, 3);
        ctx.moveTo(x - w * 0.32 + 26, ry);
        ctx.lineTo(x + w * 0.3, ry);
      }),
    { color: P.muted, alpha, width: 2 },
  );
  ys.slice(0, done).forEach((ry, i) =>
    check(x - w * 0.32 + 7, ry, 18, { alpha: alpha * (i === done - 1 ? last : tick), width: 3 }),
  );
}

/* A result: a small table whose rows are bars, drawn as one stroke inside its outline. */
export function resultCard(x, y, rows, { alpha = 1, w = 170, h = 120 } = {}) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, { fill: P.row, stroke: P.ink, alpha, radius: 8, width: 2.5 });
  stroke(
    () => {
      for (let i = 0; i < rows; i++) {
        const ry = y - h / 2 + (h * (i + 1)) / (rows + 1);
        ctx.moveTo(x - w * 0.34, ry);
        ctx.lineTo(x + w * (i % 2 ? 0.16 : 0.32), ry);
      }
    },
    { color: P.muted, alpha, width: 2.5 },
  );
}

/* The declared check: the repository with its check inside, the owner of the obligation to deduplicate. */
function declaredCheck(x, y, alpha) {
  repoIcon(x, y, OWNER[0], OWNER[1], { alpha });
  check(x + 24, y + 10, 46, { alpha, width: 4 });
}
const CHECK_NAME = () => L("仓库自己声明的检查", "own declared check");

/* 07.1. The first Agent stands from the cut with the links to its makings' places, its two makings arriving on their
 * words, and the picture steps left as the owners arrive. Each obligation passes from its making to its owner along a
 * link on its words, a point flowing along it under the obligation's name. The makings and the Agent retire together
 * on their word, each link drawing back to a short lead into its owner, the owners settle to the centre, and keeping
 * the makings just in case is refused where they stood. Each of the three pictures, the Agent with its makings, the
 * same with the owners, and the owners with the refusal, is centred on the frame by its outer names; until the first
 * making arrives, the Agent and its links stand centred by their own ends, and the picture glides left, as one unit,
 * on the words that bring the script. */
export function makings(s, t, a) {
  if (a <= 0) return;
  const [agentAt, scriptAt, sheetAt, checkAt, dedupAt, listAt, progressAt, retireAt, caseAt] = cues(
    s,
    [
      ["最早那个 Agent", "the first Agent"],
      ["写了一个临时的去重脚本", "wrote a temporary deduplication script"],
      ["进度表", "progress sheet"],
      ["仓库自己声明的检查", "the repository's own declared check"],
      ["去重这项义务", "the obligation to deduplicate"],
      ["正式变更里的任务清单", "the official Change's task list"],
      ["接住了进度", "carries the progress"],
      ["撤掉", "are retired"],
      ["以防万一", "just in case"],
    ],
  );
  const lift = soon(t, checkAt + 0.05, 0.9),
    gone = a * (1 - ramp(t, retireAt + 0.05, 0.4)),
    settle = soon(t, retireAt + 0.05, 0.9);
  // How far each column's marks and names reach either side of its axis.
  const agentHalf = Math.max(53, measure(L("最早那个 Agent", "the first Agent")) / 2),
    makingHalf = Math.max(
      SCRIPT[0] / 2,
      nameWidth(L("临时的去重脚本", "temporary deduplication script"), 350) / 2,
      measure(L("进度表", "progress sheet")) / 2,
    ),
    ownerHalf = Math.max(
      OWNER[0] / 2,
      nameWidth(CHECK_NAME(), 300) / 2,
      nameWidth(L("正式变更里的任务清单", "the official Change's task list"), 300) / 2,
    ),
    first = 960 - (640 - agentHalf + 1040 + makingHalf) / 2,
    owned = 960 - (400 - agentHalf + 1330 + ownerHalf) / 2,
    // Before its makings arrive, the Agent's picture ends where its longer link does, at the sheet's place.
    links = 960 - (640 - agentHalf + 1040 - SHEET[0] / 2 - 10) / 2,
    start = mix(links, first, soon(t, scriptAt + 0.05, 0.7));
  const AX = mix(640 + start, 400 + owned, lift),
    MX = mix(1040 + start, 760 + owned, lift),
    OX = mix(1330 + owned, 1150, settle),
    AY = 495,
    flow = (voiceTime(t) * 0.35) % 1;
  // The Agent and its place stand from the cut; its name may lead its clause by a fifth of a second, so the thought
  // is named within its first second.
  agent(AX, AY, { size: 1.5, alpha: gone });
  ring(AX, AY, 52, { color: P.line, alpha: gone, width: 2 });
  nameText(L("最早那个 Agent", "the first Agent"), AX, AY + 52 + NAME_GAP, {
    valign: "top",
    alpha: gone * ramp(t, agentAt - 0.35, 0.4),
    set: "07.1:makings",
  });
  // Its two makings, each at the end of a link that leaves the Agent from the cut, so the opening picture already
  // spans the Agent's work; each link's end point and flow arrive with its making.
  const sIn = gone * named(t, scriptAt),
    hIn = gone * named(t, sheetAt),
    mid = (AX + 52 + MX - SCRIPT[0] / 2) / 2;
  link(AX + 52, AY, MX - SCRIPT[0] / 2 - 10, R1, {
    route: "hvh",
    mid,
    alpha: gone,
    end: sIn > 0.5,
    flow: sIn > 0.5 ? flow : null,
  });
  link(AX + 52, AY, MX - SHEET[0] / 2 - 10, R2, {
    route: "hvh",
    mid,
    alpha: gone,
    end: hIn > 0.5,
    flow: hIn > 0.5 ? (flow + 0.5) % 1 : null,
  });
  // Each row of marks, a making and its owner, hangs its names from one baseline under the row's lower mark.
  const top1 = rowNameTop([R1 + SCRIPT[1] / 2, R1 + OWNER[1] / 2]),
    top2 = rowNameTop([R2 + SHEET[1] / 2, R2 + LIST[1] / 2]);
  terminalIcon(MX - SCRIPT[0] / 2, R1 - SCRIPT[1] / 2, SCRIPT[0], SCRIPT[1], { alpha: sIn });
  nameText(L("临时的去重脚本", "temporary deduplication script"), MX, top1, {
    valign: "top",
    width: 350,
    alpha: sIn,
    set: "07.1:makings",
  });
  ledger(MX, R2, SHEET[0], SHEET[1], { alpha: hIn });
  nameText(L("进度表", "progress sheet"), MX, top2, {
    valign: "top",
    alpha: hIn,
    set: "07.1:makings",
  });
  // The owners, each on its words.
  const cIn = a * named(t, checkAt),
    lIn = a * named(t, listAt);
  declaredCheck(OX, R1, cIn);
  nameText(CHECK_NAME(), OX, top1, {
    valign: "top",
    width: 300,
    alpha: cIn,
    set: "07.1:owners",
  });
  // The task list now carries the progress: its rows tick one by one, each fading in, while the voice speaks.
  const held = voiceTime(t) - voiceTime(progressAt) - 0.4,
    ticks = Math.min(4, Math.max(0, Math.floor(held / 1.2) + 1));
  taskList(OX, R2, LIST[0], LIST[1], {
    alpha: lIn,
    done: ticks,
    last: ticks < 4 || held < 4.4 ? Math.min(1, (held - 1.2 * (ticks - 1)) / 0.4) : 1,
  });
  nameText(L("正式变更里的任务清单", "the official Change's task list"), OX, top2, {
    valign: "top",
    width: 300,
    alpha: lIn,
    set: "07.1:owners",
  });
  // Each obligation passes from its making to its owner along a link under its name; when the makings retire, the
  // links draw back to short leads into their owners that start in one column, and their names follow them.
  const rows = [
    [R1, MX + SCRIPT[0] / 2, OX - OWNER[0] / 2, dedupAt, L("去重", "deduplicate")],
    [R2, MX + SHEET[0] / 2, OX - LIST[0] / 2, progressAt, L("进度", "progress")],
  ];
  const lead = Math.min(...rows.map(([, , to]) => to)) - 150,
    spans = rows.map(([, from, to]) => [mix(from + 12, lead, settle), to - 12]);
  // The two names stand one above the other on one axis, the middle of their links, and stop short of the owners'
  // edges.
  const axis = Math.min(
    (spans[0][0] + spans[0][1] + spans[1][0] + spans[1][1]) / 4,
    ...rows.map(([, , to, , name]) => to - 20 - measure(name) / 2),
  );
  rows.forEach(([y, , , at, name], i) => {
    const shown = a * named(t, at);
    link(spans[i][0], y, spans[i][1], y, {
      alpha: shown,
      upto: soon(t, at + 0.05, 0.6),
      flow: (flow + 0.5 * i) % 1,
    });
    nameText(name, axis, y - 26, {
      valign: "bottom",
      alpha: shown,
      set: "07.1:duties",
    });
  });
  // Kept just in case: refused where the makings stood.
  rejectedName(L("以防万一", "just in case"), 700, AY, {
    alpha: a * named(t, caseAt),
    mark: ramp(t, caseAt + 0.3, 0.4),
  });
}

/* A kept script: its window as a dashed outline, an obsolete mark that no owner carries. */
function ghostScript(x, y, alpha) {
  const [w, h] = SCRIPT;
  box(x - w / 2, y - h / 2, w, h, {
    stroke: P.muted,
    alpha,
    radius: 10,
    width: 2.5,
    dash: [10, 8],
  });
  line(x - w / 2, y - h / 2 + 30, x + w / 2, y - h / 2 + 30, {
    color: P.line,
    alpha,
    dash: [10, 8],
  });
  [0, 1, 2].forEach((i) =>
    dot(x - w / 2 + 20 + i * 18, y - h / 2 + 15, 4, { color: P.muted, alpha }),
  );
}

/* The width of a name as nameText sets it: its widest line once wrapped to `width`. */
export const nameWidth = (v, width = Infinity, size = LABEL) =>
  Math.max(...wrapName(v, width, size).map((line) => measure(line, size)));

/* 07.2. The declared check keeps its name and steps right; the script, kept, comes back as a ghost on its words,
 * months passing on a clock at its corner, and someone takes it up. Each result stands under its source, the second
 * named as differing, and a question between them asks which to trust. The finished picture is centred on the frame
 * by its outer names, the finder's on the left and the check's on the right. Until the finder comes, the script and
 * the check stand alone in their places of that picture, the two centred on the frame: the check steps there from
 * where 07.1 left it as the script returns, rising to the script's row so their names share one baseline, and the
 * picture glides to its own centre, as one unit, on the words that bring the finder. */
export function ghost(s, t, a) {
  if (a <= 0) return;
  const [backAt, monthsAt, foundAt, resultAt, differAt, trustAt] = cues(s, [
    ["这个脚本要是留着", "If the script stays"],
    ["过几个月", "months later"],
    ["又被人翻出来用", "someone may find it"],
    ["它算出的结果", "its results"],
    ["不一样", "differ"],
    ["该信哪一个", "which to trust"],
  ]);
  const FOUND = L("又被人翻出来用", "someone may find it"),
    left = Math.min(390 - 30, 390 - nameWidth(FOUND, 220) / 2),
    right = Math.max(1310 + OWNER[0] / 2, 1310 + nameWidth(CHECK_NAME(), 300) / 2),
    DX = 960 - (left + right) / 2,
    // Until the finder comes, the script and the check stand alone in their places of the finished picture, the two
    // together centred on the frame, from the script's left edge to the check's outer edge.
    ALONE = 960 - (640 - SCRIPT[0] / 2 + right) / 2;
  const rise = soon(t, backAt + 0.2, 0.9),
    off = mix(ALONE, DX, soon(t, foundAt + 0.05, 0.9)),
    CX = mix(1150, 1310 + off, rise),
    CY = mix(R1, 380, rise),
    GX = 640 + off,
    FX = 390 + off,
    QX = 975 + off,
    Y = 380,
    RY = 625;
  declaredCheck(CX, CY, a);
  nameText(CHECK_NAME(), CX, CY + OWNER[1] / 2 + NAME_GAP, { valign: "top", width: 300, alpha: a });
  const g = a * named(t, backAt),
    m = a * named(t, monthsAt);
  ghostScript(GX, Y, g);
  // Months pass on the clock at the script's corner, its hand advancing while the voice speaks.
  clock(GX + SCRIPT[0] / 2, Y - SCRIPT[1] / 2, 22, {
    hand: ((voiceTime(t) - voiceTime(monthsAt)) * 0.45) % 1,
    alpha: m,
  });
  nameText(L("这个脚本", "the script"), GX, Y + SCRIPT[1] / 2 + NAME_GAP, {
    valign: "top",
    alpha: g,
  });
  nameText(L("过几个月", "months later"), GX + SCRIPT[0] / 2 + 38, Y - SCRIPT[1] / 2, {
    align: "left",
    alpha: m,
  });
  // Someone takes the script up.
  const f = a * named(t, foundAt);
  person(FX, Y + 8, { size: 1.3, alpha: f });
  link(FX + 40, Y, GX - SCRIPT[0] / 2 - 10, Y, { alpha: f, upto: soon(t, foundAt + 0.05, 0.5) });
  nameText(FOUND, FX, Y + 60 + NAME_GAP, {
    valign: "top",
    width: 220,
    alpha: f,
  });
  // The two results, and the question between them.
  const r1 = a * named(t, resultAt),
    r2 = a * named(t, differAt),
    q = a * named(t, trustAt);
  resultCard(GX, RY, 3, { alpha: r1 });
  nameText(L("它算出的结果", "its results"), GX, RY + 60 + NAME_GAP, { valign: "top", alpha: r1 });
  resultCard(CX, RY, 4, { alpha: r2 });
  nameText(L("不一样", "differ"), CX, RY + 60 + NAME_GAP, { valign: "top", alpha: r2 });
  askIcon(QX, RY - 6, 30, { alpha: q, color: P.ink });
  nameText(L("该信哪一个", "which to trust"), QX, RY + 60 + NAME_GAP, { valign: "top", alpha: q });
}
