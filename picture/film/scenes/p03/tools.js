/* 03.6-03.7 ETHOS keeps its own code to the kernel and turns to mature tools for the rest; it leaves the systems already
 * in use as they are, works on the user's own machine and owns in one place what every repository shares. */

import { ctx } from "../../canvas.js";
import { link } from "../../drawing/links.js";
import { box, flowDot, measure, ring, stroke } from "../../drawing/strokes.js";
import { kernelIcon, terminalIcon } from "../../drawing/workspace.js";
import { beats, named } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  nameText,
  rejectedName,
  termRow,
  termRowLayout,
} from "../../naming/names.js";
import { P } from "../../palette.js";
import { L } from "../../timeline.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";

/* A term row centred on x, its top at y. */
function termRowCentred(t, term, termAts, qual, qualAts, x, y, o = {}) {
  const width = o.width ?? 520,
    { one } = termRowLayout(term, qual, width),
    termW = measure(term.join("")),
    qualW = measure(qual.join(""), NOTE),
    wide = one ? termW + 16 + qualW : Math.max(termW, qualW);
  return termRow(t, term, termAts, qual, qualAts, x - wide / 2, y, { ...o, width });
}

/* 03.6 ETHOS's own code does the kernel's one job: a small kernel named from the cut, its job under it. For everything
 * else it turns to mature tools, larger outlines of two sizes beside and below it, each holding its content (Git's
 * branch in one, a tool's features in the other), linked from the kernel on the words that turn to them and named on
 * theirs; so there is much less to verify, and the kernel lights once. */
export function stageTools(t, a, c) {
  if (a <= 0) return;
  const KX = 960,
    KY = 420,
    KR = 36,
    q = (voiceTime(t) * 0.4) % 1,
    turnTo = a * ramp(t, c.elseAt - 0.15, 0.4),
    tools = [
      [620, 640, 300, 190],
      [1300, 640, 260, 166],
    ];
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  beats(t, KX, KY, KR + 16, [c.less], { alpha: a });
  nameText(L("ETHOS 自己的代码", "Its own code"), KX, KY - KR - NAME_GAP, {
    valign: "bottom",
    alpha: a * named(t, c.tCut + 0.15),
  });
  nameText(L("内核这一件事", "The kernel's one job"), KX, KY + KR + NAME_GAP, {
    valign: "top",
    alpha: a * named(t, c.oneJob),
  });
  nameText(L("就少得多", "Much less"), KX, KY + KR + NAME_GAP + 52, {
    valign: "top",
    alpha: a * named(t, c.less),
  });
  tools.forEach(([x, y, w, h], i) => {
    box(x - w / 2, y - h / 2, w, h, { stroke: P.ink, alpha: a, radius: 18, width: 2.5 });
    link(KX + (i ? 1 : -1) * KR * 0.87, KY, x, y - h / 2, {
      route: "hv",
      alpha: turnTo,
      upto: soon(t, c.elseAt + 0.05, 0.6),
      flow: (q + 0.5 * i) % 1,
    });
  });
  // Git's branch in the first tool, a tool's features in the second.
  const [gx, gy] = tools[0];
  stroke(
    () => {
      ctx.moveTo(gx - 70, gy - 30);
      ctx.lineTo(gx - 70, gy + 30);
      ctx.moveTo(gx - 70, gy + 8);
      ctx.quadraticCurveTo(gx - 70, gy - 16, gx - 40, gy - 20);
    },
    { color: P.ink, alpha: a, width: 3 },
  );
  const [fx, fy] = tools[1];
  stroke(
    () =>
      [-32, 0, 32].forEach((dy, k) => {
        ctx.moveTo(fx - 80, fy + dy);
        ctx.lineTo(fx - 80 + [160, 110, 140][k], fy + dy);
      }),
    { color: P.muted, alpha: a * 0.8, width: 2.5 },
  );
  nameText("Git", gx + 20, gy, { alpha: a * named(t, c.git) });
  nameText(L("现成、成熟的工具", "Mature tools that already exist"), KX, 760, {
    valign: "top",
    alpha: a * named(t, c.mature),
  });
}

/* 03.7 ETHOS does not take over the systems already in use: ETHOS at the centre with its name from the cut, and the
 * systems' four places around it, one mark under the heading that names them; each system is named in its place as it is
 * said, and left as it is. ETHOS stands on the user's own machine, depending on no vendor; on the words that connect
 * them the systems are linked to ETHOS's sides, and becoming a source of truth is refused. */
export function stageSystems(t, a, c) {
  if (a <= 0) return;
  const KX = 960,
    KY = 480,
    KR = 40,
    W = L(300, 400),
    H = 84,
    spots = [
      [L(520, 470), 380],
      [L(1400, 1450), 380],
      [L(520, 470), 600],
      [L(1400, 1450), 600],
    ],
    ats = [c.sys1, c.sys2, c.sys3, c.sys4],
    q = (voiceTime(t) * 0.4) % 1,
    joined = a * ramp(t, c.connect - 0.15, 0.4);
  nameText(L("原有的系统", "The systems you already have"), KX, 290, {
    alpha: a * named(t, c.sCut + 0.15),
  });
  kernelIcon(KX, KY, KR, { alpha: a, color: P.ink, turn: 0.1 * voiceTime(t) });
  nameText("ETHOS", KX, KY - KR - NAME_GAP, { valign: "bottom", alpha: a * named(t, c.sCut) });
  stroke(() => spots.forEach(([x, y]) => ctx.roundRect(x - W / 2, y - H / 2, W, H, 14)), {
    color: P.ink,
    alpha: a,
    width: 2.5,
  });
  spots.forEach(([x, y], i) => {
    nameText(
      L(
        ["描述业务用的模型", "持续集成", "运行 Agent 的应用", "问题跟踪系统"],
        ["Business model", "Automated checks", "Apps your Agents run in", "Issue tracker"],
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
      upto: soon(t, c.connect + 0.05 + 0.15 * i, 0.5),
      flow: q,
    });
  });
  // The user's own machine, under ETHOS, depending on no vendor.
  const machine = a * ramp(t, c.machine - 0.15, 0.4);
  terminalIcon(KX - 90, 560, 180, 76, { alpha: machine });
  termRowCentred(
    t,
    [L("自己的机器", "Your own machine")],
    [c.machine],
    [L("不依赖哪一家平台", "without depending on any one vendor")],
    [c.vendor],
    KX,
    560 + 76 + NAME_GAP - 6,
    { width: 560, alpha: a },
  );
  rejectedName(L("真相的来源", "A source of truth"), KX, 800, {
    alpha: a * named(t, c.truth),
    mark: ramp(t, c.truth + 0.4, 0.4),
  });
}

/* 03.7 What every repository shares, ETHOS owns in one place: three repositories of three sizes, each its own mark, standing on
 * one shared layer named from the cut, a point running along it; each repository's own purpose arrives inside it as its
 * own shape. */
export function stageLayer(t, a, c) {
  if (a <= 0) return;
  const repos = [
      [560, 220],
      [960, 260],
      [1360, 300],
    ],
    RH = 150,
    RY = 520,
    LY = RY + RH / 2 + 50,
    q = (voiceTime(t) * 0.3) % 1,
    x0 = repos[0][0] - repos[0][1] / 2,
    x1 = repos[2][0] + repos[2][1] / 2;
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
  flowDot(mix(x0 + 30, x1 - 30, q), LY + 22, 6, q, { color: P.ink, alpha: a });
  nameText(L("共有的部分，归 ETHOS", "ETHOS owns in one place"), 960, LY - 6, {
    alpha: a * named(t, c.layerCut + 0.15),
  });
  // Each repository's own purpose: a shape of its own inside it.
  const own = a * ramp(t, c.own - 0.15, 0.4),
    [[ax], [bx], [cx]] = repos;
  ring(ax + 26, RY + 10, 26, { color: P.ink, alpha: own, width: 3 });
  stroke(
    () => {
      ctx.moveTo(bx + 30, RY - 18);
      ctx.lineTo(bx + 58, RY + 30);
      ctx.lineTo(bx + 2, RY + 30);
      ctx.closePath();
    },
    { color: P.ink, alpha: own, width: 3 },
  );
  box(cx + 16, RY - 16, 48, 48, { stroke: P.ink, alpha: own, radius: 6, width: 3 });
  termRowCentred(
    t,
    [L("每个仓库", "Each repository")],
    [c.each],
    [L("自己特有的事", "its own purpose")],
    [c.own],
    960,
    RY - RH / 2 - NAME_GAP - 34,
    { alpha: a },
  );
}
