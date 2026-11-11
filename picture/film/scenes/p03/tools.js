/* 03.6-03.7 ETHOS keeps its own code to the kernel and turns to mature tools for the rest; it leaves the systems already
 * in use as they are, works on the user's own machine and owns in one place what every repository shares. */

import { ctx } from "../../canvas.js";
import { FLOW_EVERY, flowAlong, flowClock, link } from "../../drawing/links.js";
import { box, ring, stroke } from "../../drawing/strokes.js";
import { kernelIcon, terminalIcon } from "../../drawing/workspace.js";
import { beats, named } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  TERM_STACK,
  nameText,
  rejectedName,
  termRow,
  termRowLayout,
} from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp } from "../../timing/easing.js";
import { glideShare, voiceTime } from "../../timing/pauses.js";

/* 03.6 ETHOS's own code does the kernel's one job: from the cut its code is a panel of lines round the kernel, named as
 * ETHOS's code; on the words that give the kernel its one job the panel draws in to the kernel and its lines go, so
 * the kernel alone is what ETHOS's code does, named under it. For everything else it turns to tools: on those words in
 * Chinese, and on the word "tools" in English, two tools, larger outlines of one size below the kernel, mirrored about
 * its axis, each holding its content (Git's branch
 * in one, a tool's features in the other), are linked from the kernel and named as everything else between them; Git is named on its
 * word and the pair as mature tools under them; so there is less to understand and verify, the qualifier under the kernel's
 * one job, and the kernel lights once. The
 * panel's names ride its top and bottom edges as it draws in, so each stays one gap from what it names. */
export function stageTools(t, a, c) {
  if (a <= 0) return;
  const KX = 960,
    KY = 420,
    KR = 36,
    // The panel draws in over the time until the tools are said, so the kernel stands alone only a moment.
    gather = glideShare(t, c.oneJob + 0.05, (560 - 2 * KR) / 2, Math.max(0.9, c.elseAt - c.oneJob - 0.2)),
    PW = mix(560, 2 * KR, gather),
    PH = mix(240, 2 * KR, gather),
    code = a * (1 - gather),
    turnTo = a * ramp(t, c.elseAt - 0.15, 0.4),
    tooled = a * ramp(t, c.toolsAt - 0.15, 0.4),
    tools = [
      [620, 640, 280, 178],
      [1300, 640, 280, 178],
    ];
  // ETHOS's own code: a panel whose rows of code stand either side of the kernel, drawing in with the panel.
  box(KX - PW / 2, KY - PH / 2, PW, PH, { stroke: P.ink, alpha: code, radius: 16, width: 2.5 });
  stroke(
    () =>
      [-0.34, -0.17, 0, 0.17, 0.34].forEach((k, i) => {
        const y = KY + k * PH,
          inner = KR + 20,
          outer = PW / 2 - 26;
        if (outer <= inner) return;
        ctx.moveTo(KX - outer, y);
        ctx.lineTo(KX - inner - (outer - inner) * [0, 0.3, 0.5, 0.15, 0.4][i], y);
        ctx.moveTo(KX + inner, y);
        ctx.lineTo(KX + outer - (outer - inner) * [0.35, 0, 0.2, 0.45, 0.1][i], y);
      }),
    { color: P.muted, alpha: code * 0.8, width: 2.5 },
  );
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  beats(t, KX, KY, KR + 16, [c.less], { alpha: a });
  nameText(L("ETHOS 的代码", "Its own code"), KX, KY - Math.max(PH / 2, KR) - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.tCut + 0.15),
  });
  const under = KY + Math.max(PH / 2, KR) + NAME_GAP;
  const job = nameText(L("内核这一件事", "The kernel's one job"), KX, under, {
    valign: "top",
    alpha: a * named(t, c.oneJob),
  });
  // What it leaves to verify is said of the kernel's one job, so it stands under that name as its qualifier.
  nameText(L("要理解、要验证的减少了", "less to understand and verify"), KX, job.bottom + TERM_STACK, {
    valign: "top",
    size: NOTE,
    color: P.muted,
    alpha: a * named(t, c.less),
  });
  // Everything else: the kernel's links reach out on the words that turn to it, and the tools arrive together at their
  // ends, on those words in Chinese and on "tools" in English.
  tools.forEach(([x, y, w, h], i) => {
    box(x - w / 2, y - h / 2, w, h, { stroke: P.ink, alpha: tooled, radius: 18, width: 2.5 });
    link(KX + (i ? 1 : -1) * KR * 0.87, KY, x, y - h / 2, {
      route: "hv",
      alpha: turnTo,
      draw: { t, at: c.elseAt + 0.05 },
      flow: flowClock(t, 0.5 * i),
      flowEvery: FLOW_EVERY,
    });
  });
  nameText(L("别的功能", "Everything else"), KX, tools[0][1], { alpha: turnTo });
  // Git's branch in the first tool, a tool's features in the second.
  const [gx, gy] = tools[0];
  stroke(
    () => {
      ctx.moveTo(gx - 70, gy - 30);
      ctx.lineTo(gx - 70, gy + 30);
      ctx.moveTo(gx - 70, gy + 8);
      ctx.quadraticCurveTo(gx - 70, gy - 16, gx - 40, gy - 20);
    },
    { color: P.ink, alpha: tooled, width: 3 },
  );
  const [fx, fy] = tools[1];
  stroke(
    () =>
      [-32, 0, 32].forEach((dy, k) => {
        ctx.moveTo(fx - 80, fy + dy);
        ctx.lineTo(fx - 80 + [160, 110, 140][k], fy + dy);
      }),
    { color: P.muted, alpha: tooled * 0.8, width: 2.5 },
  );
  // Two tools of one size each need a name of their own: the name between them names one, and Git names the other.
  // English says Git at the end of its clause, so its name leads its word by a second and a half less a frame, within
  // its clause, and stands a fifth of a second after the tools arrive on "tools".
  nameText("Git", gx + 20, gy, { alpha: a * named(t, L(c.git, c.git - 1.45)) });
  // The tools' name hangs one gap under the pair, centred between them and clear of both corners: in English its
  // relative clause, which on one line would run under Git's corner, joins under it as its smaller gloss on its words.
  termRow(
    t,
    [L("现成、成熟的工具", "Mature tools")],
    [c.mature],
    L([], ["that already exist"]),
    [c.exist],
    KX,
    760,
    { alpha: a, align: "center" },
  );
}

/* 03.7 ETHOS does not take over the systems already in use: ETHOS at the centre with its name from the cut, and the
 * systems' four places around it, one mark drawn with the heading that names them on its words; each system is named in
 * its place as it is said, and left as it is. ETHOS stands on the user's own machine, depending on no vendor; on the words that connect
 * them the systems are linked to ETHOS's sides, and becoming part of ETHOS's own record is refused. */
export function stageSystems(t, a, c) {
  if (a <= 0) return;
  const KX = 960,
    KY = 480,
    KR = 40,
    // Each place holds its longest name with room to spare: the Chinese 运行那些 Agent 的应用 and the English "Apps your
    // Agents run in".
    W = L(370, 400),
    H = 84,
    spots = [
      [L(520, 470), 380],
      [L(1400, 1450), 380],
      [L(520, 470), 600],
      [L(1400, 1450), 600],
    ],
    ats = [c.sys1, c.sys2, c.sys3, c.sys4],
    q = flowClock(t),
    joined = a * ramp(t, c.connect - 0.15, 0.4);
  // The places and their heading arrive a third of a second ahead of the heading's words, within its clause.
  const places = a * ramp(t, c.systems - 0.45, 0.4);
  nameText(L("原有的系统", "The systems you already have"), KX, 290, { alpha: places });
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText("ETHOS", KX, KY - KR - NAME_GAP, { valign: "bottom", alpha: a * named(t, c.sCut) });
  stroke(() => spots.forEach(([x, y]) => ctx.roundRect(x - W / 2, y - H / 2, W, H, 14)), {
    color: P.ink,
    alpha: places,
    width: 2.5,
  });
  spots.forEach(([x, y], i) => {
    nameText(
      L(
        ["描述业务用的模型", "持续集成", "运行那些 Agent 的应用", "问题跟踪系统"],
        ["Model of your business", "Automated checks", "Apps your Agents run in", "Issue tracker"],
      )[i],
      x,
      y,
      { alpha: a * named(t, ats[i]), set: "systems" },
    );
    // Connected, each system is linked to a side of ETHOS, round its name; it stays what it is.
    const right = x > KX,
      side = right ? 1 : -1;
    link(x - side * (W / 2), y, KX + side * KR * 0.87, KY + (y < KY ? -12 : 12), {
      route: "hvh",
      mid: KX + side * 100,
      alpha: joined,
      draw: { t, at: c.connect + 0.05 + 0.15 * i },
      flow: q,
    });
  });
  // The user's own machine, under ETHOS, depending on no vendor: its name centred under it from its first word, the
  // qualifier joining under the name, each line on the machine's axis.
  const machine = a * ramp(t, c.machine - 0.15, 0.4);
  terminalIcon(KX - 90, 560, 180, 76, { alpha: machine });
  termRow(
    t,
    [L("自己的机器", "Your own machine")],
    [c.machine],
    [L("不依赖哪一家平台", "without depending on any one vendor")],
    [c.vendor],
    KX,
    560 + 76 + NAME_GAP - 6,
    { width: 560, alpha: a, align: "center" },
  );
  // The negation comes before the words it refuses in both editions ("不会因此纳入" / "does not make"), so the
  // cross arrives with the name: in Chinese the stage cuts soon after the words, too soon for a cross that followed them.
  rejectedName(L("纳入 ETHOS 自己的记录", "Part of ETHOS's own record"), KX, 800, {
    alpha: a * named(t, c.truth),
    mark: ramp(t, c.truth - 0.05, 0.35),
  });
}

/* 03.7 What every repository shares, ETHOS owns in one place: three repositories, cards of one size, standing on one
 * shared layer from the cut, a point running along it, the layer named within the clause that gives it to ETHOS; what
 * is each repository's own arrives inside it as a shape of its own, each at the same place in its card. The repositories
 * stand at equal gaps, the row and the layer under it centred on the frame, so the middle card stands on the axis of
 * the layer's name and of the heading over the row, which centres on it from its first word, its qualifier joining
 * under it. */
const REPO_W = 260,
  REPO_GAP = 140;
export function stageLayer(t, a, c) {
  if (a <= 0) return;
  const total = 3 * REPO_W + 2 * REPO_GAP,
    x0 = 960 - total / 2,
    x1 = x0 + total,
    repos = [0, 1, 2].map((i) => [x0 + REPO_W / 2 + i * (REPO_W + REPO_GAP), REPO_W]),
    RH = 150,
    RY = 520,
    LY = RY + RH / 2 + 50;
  repos.forEach(([x, w]) =>
    box(x - w / 2, RY - RH / 2, w, RH, { stroke: P.ink, alpha: a, radius: 14, width: 2.5 }),
  );
  stroke(
    () =>
      repos.forEach(([x, w]) => {
        const gx = x - w / 2 + 34,
          gy = RY - RH / 2 + 26;
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy + 30);
        ctx.moveTo(gx, gy + 20);
        ctx.quadraticCurveTo(gx, gy + 8, gx + 16, gy + 6);
      }),
    { color: P.ink, alpha: a, width: 2.5 },
  );
  box(x0, LY - 36, x1 - x0, 72, { stroke: P.ink, alpha: a, radius: 16, width: 2.5 });
  stroke(
    () =>
      repos.forEach(([x]) => {
        ctx.moveTo(x, RY + RH / 2);
        ctx.lineTo(x, LY - 36);
      }),
    { color: P.ink, alpha: a, width: 2.5 },
  );
  flowAlong(
    [
      [x0 + 30, LY + 22],
      [x1 - 30, LY + 22],
    ],
    flowClock(t),
    6,
    { single: true, color: P.ink, alpha: a },
  );
  // The layer is named on its own words: Chinese says them as the stage opens, and the English stage cuts in on them
  // (what.js), so the repositories never stand unnamed.
  nameText(L("共有的部分，归 ETHOS", "ETHOS owns in one place"), (x0 + x1) / 2, LY - 6, {
    alpha: a * named(t, c.owns),
  });
  // What is each repository's own: a shape of its own inside it, each centred on the same point of its card, right of
  // the card's centre and clear of its branch.
  const own = a * ramp(t, c.own - 0.15, 0.4),
    [ax, bx, cx] = repos.map(([x]) => x + 30),
    SY = RY + 8;
  ring(ax, SY, 26, { color: P.ink, alpha: own, width: 3 });
  stroke(
    () => {
      ctx.moveTo(bx, SY - 24);
      ctx.lineTo(bx + 28, SY + 24);
      ctx.lineTo(bx - 28, SY + 24);
      ctx.closePath();
    },
    { color: P.ink, alpha: own, width: 3 },
  );
  box(cx - 24, SY - 24, 48, 48, { stroke: P.ink, alpha: own, radius: 6, width: 3 });
  const term = [L("每个仓库", "Each repository")],
    qual = [L("自己特有的事", "only what is its own")],
    { height } = termRowLayout(term, qual, 520, false);
  termRow(t, term, [c.each], qual, [c.own], (x0 + x1) / 2, RY - RH / 2 - NAME_GAP - height, {
    width: 520,
    alpha: a,
    align: "center",
  });
}
