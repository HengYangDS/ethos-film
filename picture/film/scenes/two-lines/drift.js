/* 01 two lines: understanding and answers drift apart. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { link } from "../../drawing/links.js";
import { flowDot, labelSize, line, measure, ring, stroke, text } from "../../drawing/strokes.js";
import { agent, check, documentIcon, person } from "../../drawing/symbols.js";
import { TWO_LINES, answerStation, driftingLines, twoLines } from "../../drawing/two-lines.js";
import { layersIcon, recoverIcon, repoIcon } from "../../drawing/workspace.js";
import { titleSignature } from "../../framing/titles.js";
import { listIn, listLevel, named, speaking } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  TERM_GAP,
  growName,
  nameText,
  rejectedName,
  termRow,
  termRowLayout,
  wrapName,
} from "../../naming/names.js";
import { CONTENT_CY, railNames, railStations } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cueFrom, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { STAGE_CUT, stageIn, stageOut } from "../../timing/stages.js";

scenes["01"] = function (s, t) {
  const [lines, mine, solve, other, answer, code, data, use] = cues(s, [
    ["两条线", "two lines"],
    ["对问题的理解", "our understanding"],
    ["要解决什么", "what we are trying to solve"],
    ["另一条", "The other"],
    ["答案", "answer"],
    ["代码", "code"],
    ["数据", "data"],
    ["实际使用", "real use"],
  ]);
  const [change, tools, turns, apart, guess, nextOne] = cues(s, [
    ["理解会变", "Understanding changes"],
    ["工具会换", "tools are replaced"],
    ["轮流接手", "take turns"],
    ["对不上", "drift apart"],
    ["从头去猜", "start by guessing"],
    ["后来接手的人", "whoever picks"],
  ]);
  const [ethos, design, share, repo, nameAt] = cues(s, [
    ["ETHOS 就是", "ETHOS is designed"],
    ["针对这种情况设计", "designed for this situation"],
    ["人和 Agent 在", "people and agents share"],
    ["同一个仓库", "on a repository"],
    ["这个名字", "The name stands"],
  ]);
  const initials = en
    ? cues(s, [
        ["", "Evidence-grounded"],
        ["", "Trust"],
        ["", "Human-Agent"],
        ["", "Operational"],
        ["", "Stewardship"],
      ])
    : Array(5).fill(cue(s, "英文词的首字母", ""));
  const meaning = en ? null : cue(s, "信任要建立在证据上", "");
  // In Chinese the meaning is spoken word by word after the initials: each initial lights on the words it stands for.
  const lights = en
    ? null
    : [
        cue(s, "证据", ""),
        meaning,
        cueFrom(s, "人和 Agent", "", nameAt),
        cue(s, "一项工作", ""),
        cue(s, "打理", ""),
      ];
  const [promiseAt, refused, three, intent, unsure, actOn, recover, aims, docAt, notAt, notYet] =
    cues(s, [
      ["它不是要", "It promises"],
      ["多加一层治理", "more governance"],
      ["三件事", "three things"],
      ["已经采纳的意图", "accepted intent"],
      ["不确定的地方", "uncertainty is stated"],
      ["好让人", "so that someone"],
      ["出了错", "results can be recovered"],
      ["ETHOS 要达到", "what ETHOS aims"],
      ["自己的文档", "its own documents"],
      ["还不能说", "cannot yet"],
      ["全部兑现", "counted as delivered"],
    ]);
  const result = en ? null : cue(s, "结果恢复", "");
  // The lines draw on as they are said to move: in English the words that move them come before the words that name them.
  const drawOn = en ? cue(s, "", "moves along") : lines;
  // The title hands the picture to the project just before the first word; the lines draw on as they are named.
  const first = Math.min(lines, s.voice_start);
  const title = stageOut(t, first - 0.45);
  if (title > 0) titleSignature(title);
  const stageA = stageIn(t, first - 0.45) * stageOut(t, change),
    stageA2 = stageIn(t, change) * stageOut(t, ethos);
  const stageB1 = stageIn(t, ethos) * stageOut(t, nameAt),
    stageB2 = stageIn(t, nameAt) * stageOut(t, promiseAt),
    stageC = stageIn(t, promiseAt);
  const { x0, y1, y2 } = TWO_LINES;
  // 1-2. A project, and its two lines drawing on together from the words that name them: one stroke, named as the
  // project's two lines, until each line is named. Our understanding takes its colour and its name above the upper
  // line with what it asks; the answers take theirs on the lower line, where the three sources that send them stand,
  // each on its words, and one point at a time comes back along it.
  if (stageA > 0) {
    const opened = stageA * ramp(t, s.voice_start - 0.15, 0.4);
    repoIcon(268, 500, 96, 120, { alpha: opened });
    line(x0, y1, x0, y2, { color: P.line, alpha: opened });
    nameText(L("一个项目", "A project"), 268, 560 + NAME_GAP, {
      valign: "top",
      alpha: stageA * named(t, s.voice_start),
    });
    twoLines(soon(t, drawOn - 0.15, 1), {
      alpha: stageA,
      split: t >= mine - 0.15,
      upColor: blend(P.ink, P.authority, ramp(t, mine - 0.15, 0.4)),
      lowColor: blend(P.ink, P.evidence, ramp(t, other - 0.15, 0.4)),
    });
    nameText(L("两条线", "Two lines"), x0 + 28, (y1 + y2) / 2, {
      align: "left",
      alpha: stageA * named(t, drawOn),
    });
    const term = [L("对问题的理解", "Our understanding of the problem")],
      qual = en
        ? ["what to solve, ", "what counts as solved"]
        : ["要解决什么，", "做到什么程度算解决"];
    const qualAts = en
      ? [solve, cue(s, "what would count", "what would count")]
      : [solve, cue(s, "做到什么程度", "")];
    const { height } = termRowLayout(term, qual, 1100);
    termRow(t, term, [mine], qual, qualAts, x0, y1 - NAME_GAP - height, {
      width: 1100,
      alpha: stageA,
      color: P.authority,
      build: true,
    });
    const xs = [1000, 1200, 1400],
      ats = [code, data, use],
      kinds = ["code", "data", "use"];
    nameText(L("答案", "Answers"), x0, y2 + 26 + NAME_GAP, {
      align: "left",
      valign: "top",
      color: P.evidence,
      alpha: stageA * named(t, answer),
    });
    xs.forEach((x, i) =>
      answerStation(x, y2, kinds[i], {
        alpha: stageA * ramp(t, ats[i] - 0.15, 0.4),
        lit: speaking(t, ats, i),
      }),
    );
    railNames(en ? ["Code", "Data", "Real use"] : ["代码", "数据", "实际使用"], xs, y2 + 26, {
      gap: NAME_GAP,
      alpha: (i) => stageA * listIn(t, ats, i),
      set: "sources",
    });
    const q = (voiceTime(t) * 0.35) % 1;
    flowDot(mix(1500, 420, q), y2, 7, q, {
      color: P.evidence,
      alpha: stageA * ramp(t, use + 0.3, 0.4),
    });
  }
  // 3. The same two lines. Where the understanding changes the upper line rises, the tool on the answers line is
  // replaced, and a person hands the work to an agent between the lines. When the lines drift apart their right ends
  // part, and whoever picks up the work next stands in the gap with a question.
  if (stageA2 > 0) {
    const turnsOn = ramp(t, turns - 0.15, 0.4) * stageA2;
    driftingLines(t, {
      alpha: stageA2,
      bump: soon(t, change + 0.05, 0.5),
      drift: soon(t, apart + 0.05, 1.2),
    });
    nameText(L("理解", "Understanding"), x0 - NAME_GAP, y1, {
      align: "right",
      color: P.authority,
      alpha: stageA2,
    });
    nameText(L("答案", "Answers"), x0 - NAME_GAP, y2, {
      align: "right",
      color: P.evidence,
      alpha: stageA2,
    });
    nameText(L("理解会变", "Understanding changes"), 760, y1 - 26 - NAME_GAP, {
      valign: "bottom",
      alpha: stageA2 * named(t, change),
    });
    answerStation(900, y2, "code", {
      alpha: stageA2 * ramp(t, tools - 0.15, 0.4),
      swap: soon(t, tools + 0.3, 0.5),
      lit: speaking(t, [tools, turns], 0),
    });
    nameText(L("工具会换", "Tools are replaced"), 900, y2 + 26 + NAME_GAP, {
      valign: "top",
      alpha: stageA2 * named(t, tools),
    });
    person(1060, 490, { alpha: turnsOn, size: 0.8 });
    agent(1200, 478, { alpha: ramp(t, turns + 0.3, 0.4) * stageA2, size: 0.8 });
    link(1084, 478, 1176, 478, { alpha: turnsOn, upto: soon(t, turns + 0.2, 0.5) });
    nameText(L("人和 Agent 轮流接手", "People and agents take turns"), 1130, 512 + NAME_GAP, {
      valign: "top",
      alpha: stageA2 * named(t, turns),
    });
    const who = stageA2 * named(t, nextOne),
      GX = 1700,
      GY = (y1 + y2) / 2;
    person(GX, GY + 10, { alpha: who, size: 1 });
    text("?", GX, GY - 58, 44, {
      role: "mark",
      align: "center",
      color: P.unknown,
      alpha: stageA2 * ramp(t, guess - 0.1, 0.4),
    });
    nameText(L("后来接手的人", "Whoever picks it up"), GX, GY + 48 + NAME_GAP, {
      valign: "top",
      width: 220,
      alpha: who,
    });
  }
  // 4. ETHOS stands in a repository, designed for this situation; the repository opens to hold a person and an agent
  // who share the work, and is named as the one repository they share.
  const designName = L("针对这种情况设计", "For this situation");
  if (stageB1 > 0) {
    // The repository has grown to hold them before the person and the agent are named, so no name meets its edge.
    const grow = soon(t, share - 0.65, 0.5),
      W = mix(Math.max(420, measure(designName) + 64), 720, grow),
      H = mix(200, 400, grow);
    const RX = 960,
      RY = mix(470, 530, grow),
      top = RY - H / 2,
      PY = 610,
      on = named(t, share) * stageB1;
    repoIcon(RX, RY, W, H, { alpha: stageB1 });
    text("ETHOS", RX, top + 70, 84, {
      role: "mark",
      bold: true,
      align: "center",
      color: P.authority,
      alpha: stageB1,
    });
    nameText(designName, RX, top + 128, { valign: "top", alpha: stageB1 * named(t, design) });
    person(RX - 150, PY, { alpha: on, size: 1.1 });
    agent(RX + 150, PY - 16, { alpha: on, size: 1.1 });
    documentIcon(RX - 26, PY - 90, 52, 66, { alpha: on, rows: 3 });
    link(RX - 104, PY - 57, RX - 34, PY - 57, { alpha: on, upto: soon(t, share + 0.2, 0.5) });
    link(RX + 112, PY - 57, RX + 34, PY - 57, { alpha: on, upto: soon(t, share + 0.4, 0.5) });
    railNames([L("人", "People"), "Agent"], [RX - 150, RX + 150], PY + 40, {
      gap: NAME_GAP,
      alpha: () => on,
      set: "share",
    });
    nameText(L("同一个仓库", "One repository"), RX, RY + H / 2 + NAME_GAP, {
      valign: "top",
      alpha: stageB1 * named(t, repo),
    });
  }
  // The name ETHOS spreads into its five initials, each ringed and named by its word as the word is said. In Chinese
  // the five words arrive together and each initial lights on the words of the meaning it stands for, which stands
  // beneath them.
  if (stageB2 > 0) {
    const words = ["Evidence-grounded", "Trust", "Human-Agent", "Operational", "Stewardship"],
      xs = railStations(words, 260, 1660);
    const LY = meaning === null ? CONTENT_CY - 40 : CONTENT_CY - 70,
      W = measure("ETHOS", 84, true, "mark");
    const spread = soon(t, nameAt + STAGE_CUT, en ? 0.5 : 0.8);
    words.forEach((v, i) => {
      const from =
        960 -
        W / 2 +
        measure("ETHOS".slice(0, i), 84, true, "mark") +
        measure(v[0], 84, true, "mark") / 2;
      const lit = en ? speaking(t, initials, i) : ramp(t, lights[i] - 0.1, 0.4),
        c = blend(P.authority, P.ink, lit);
      ring(xs[i], LY, 66, {
        color: c,
        alpha: stageB2 * ramp(t, initials[i] - 0.15, 0.4),
        width: 3,
      });
      text(v[0], mix(from, xs[i], spread), mix(400, LY + 2, spread), 84, {
        role: "mark",
        bold: true,
        align: "center",
        color: c,
        alpha: stageB2,
      });
    });
    railNames(words, xs, LY + 66, {
      gap: NAME_GAP - 4,
      alpha: (i) => stageB2 * (en ? listIn(t, initials, i) : named(t, initials[0])),
      set: "initials",
    });
    // The Chinese meaning is said in its own order: who works together and on what stand under the initials they give,
    // each on its words, and what trust rests on stands beneath the row.
    if (meaning !== null) {
      [
        [2, "人和 Agent"],
        [3, "一项工作"],
        [4, "打理"],
      ].forEach(([i, v]) =>
        nameText(v, xs[i], LY + 128, {
          valign: "top",
          color: P.authority,
          alpha: stageB2 * named(t, lights[i]),
        }),
      );
      nameText("信任要建立在证据上", 960, LY + 186, {
        valign: "top",
        color: P.authority,
        alpha: stageB2 * named(t, meaning),
      });
    }
  }
  // 5-6. More governance is a stack of layers, refused. The three promises are three places, each filled with its
  // mark and its words as it is said; the group stays centred on the frame as its parts arrive. When the film says
  // these are aims, the promises are bracketed as aims; ETHOS's own documents then say they are not yet all delivered,
  // and their marks turn to dashed outlines.
  if (stageC > 0) {
    const rows = en
      ? [
          ["Intent is not lost"],
          ["Uncertainty is stated", ", so someone can act on it"],
          ["Results can be recovered"],
        ]
      : [
          ["采纳的意图不会丢"],
          ["不确定的地方会说出来", "，好让人接着处理"],
          ["出了错，", "结果能恢复"],
        ];
    const partAts = en
        ? [[intent], [unsure, actOn], [recover]]
        : [[intent], [unsure, actOn], [recover, result]],
      ats = partAts.map((v) => v[0]);
    // Each part makes room for itself before its words are legible, so a name never slides while it fades in.
    const come = (at) => soon(t, at - 0.45, 0.5),
      widths = rows.map((r) => r.map((v) => measure(v)));
    const widest = Math.max(...widths.map((w) => w.reduce((a, b) => a + b, 0)));
    const aimName = L("ETHOS 的目标", "What ETHOS aims for"),
      aimW = Math.max(...wrapName(aimName, 260).map((v) => measure(v)));
    const header = L("三件事", "Three promises"),
      docName = L("自己的文档", "Its own documents"),
      note = L("还不能说已经全部兑现", "Not yet all delivered");
    const stackW = 360,
      gapStack = 80,
      ys = [400, 500, 600],
      SY = CONTENT_CY - 34,
      DY = 690;
    // The group's extent from its left edge grows as its parts arrive, and the group keeps that extent centred.
    const IXr = stackW + gapStack + 30,
      BXr = IXr + 30 + NAME_GAP + widest + 40,
      listOn = come(three);
    let R = Math.max(
      stackW,
      mix(stackW, IXr + 30, listOn),
      mix(stackW, IXr - 30 + measure(header, NOTE), listOn),
    );
    rows.forEach((r, i) => {
      const w = r.reduce((v, part, k) => v + widths[i][k] * come(partAts[i][k]), 0);
      R = Math.max(R, mix(stackW, IXr + 30 + NAME_GAP + w, come(ats[i])));
    });
    R = Math.max(R, mix(stackW, BXr + NAME_GAP + aimW, come(aims)));
    const docW = 40 + NAME_GAP + measure(docName),
      noteW = TERM_GAP + measure(note, NOTE);
    R = Math.max(
      R,
      mix(stackW, IXr - 30 + docW, come(docAt)),
      mix(stackW, IXr - 30 + docW + noteW, come(notAt)),
    );
    const X0 = 960 - R / 2,
      IX = X0 + IXr,
      BX = X0 + BXr,
      SX = X0 + stackW / 2;
    layersIcon(SX, SY, stackW, 200, { color: P.muted, alpha: stageC });
    const refusedName = en ? Math.max(promiseAt + STAGE_CUT + 0.25, refused - 1.35) : refused;
    rejectedName(L("多加一层治理", "More governance"), SX, SY + 100 + NAME_GAP, {
      valign: "top",
      alpha: stageC * named(t, refusedName),
      mark: ramp(t, refused + 0.3, 0.4),
    });
    // The three places: one dashed outline, each of its rings standing until its promise has filled it.
    const waiting = ys.filter((y, i) => t < ats[i] + 0.3);
    if (waiting.length)
      stroke(
        () =>
          waiting.forEach((y) => {
            ctx.moveTo(IX + 30, y);
            ctx.arc(IX, y, 30, 0, Math.PI * 2);
          }),
        { color: P.muted, alpha: stageC * ramp(t, three - 0.15, 0.4), width: 3, dash: [6, 6] },
      );
    nameText(header, IX - 30, ys[0] - 30 - NAME_GAP, {
      align: "left",
      valign: "bottom",
      size: NOTE,
      color: P.muted,
      alpha: stageC * named(t, three),
    });
    const open = ramp(t, notYet + 0.05, 0.5);
    rows.forEach((r, i) => {
      const on = ramp(t, ats[i] - 0.15, 0.4) * stageC,
        y = ys[i],
        c = [P.authority, P.evidence, P.evidence][i];
      ring(IX, y, 30, { color: c, alpha: on * (1 - open), width: 2.5 });
      ring(IX, y, 30, { color: c, alpha: on * open, width: 2.5, dash: [6, 6] });
      if (i === 0) check(IX, y + 2, 26, { color: c, alpha: on });
      if (i === 1) text("?", IX, y + 1, 26, { role: "mark", align: "center", color: c, alpha: on });
      if (i === 2) recoverIcon(IX, y, 14, { color: c, alpha: on });
      growName(t, r, partAts[i], IX + 30 + NAME_GAP, y, {
        valign: "middle",
        alpha: stageC * listLevel(t, ats, i),
        build: true,
        set: "promises",
      });
    });
    const aim = stageC * named(t, aims);
    link(BX, ys[0] - 30, BX, ys[2] + 30, {
      alpha: aim,
      upto: soon(t, aims + 0.05, 0.5),
      end: false,
    });
    nameText(aimName, BX + NAME_GAP, (ys[0] + ys[2]) / 2, {
      align: "left",
      color: P.authority,
      alpha: aim,
      width: 260,
    });
    documentIcon(IX - 30, DY - 26, 40, 52, { alpha: stageC * ramp(t, docAt - 0.15, 0.4), rows: 2 });
    termRow(
      t,
      [docName],
      [docAt],
      [note],
      [notAt],
      IX - 30 + 40 + NAME_GAP,
      DY - labelSize(LABEL) / 2,
      { alpha: stageC },
    );
  }
};
