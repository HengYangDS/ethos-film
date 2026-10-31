/* 10 separate evidence. */

import { ctx } from "../../canvas.js";
import { blend } from "../../drawing/colour.js";
import { link } from "../../drawing/links.js";
import { box, dot, line, measure, ring, stroke, text } from "../../drawing/strokes.js";
import { check, cross, documentIcon, person, seal } from "../../drawing/symbols.js";
import { commitDot, tagIcon, terminalIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { building, listIn, listLevel, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, growName, nameText } from "../../naming/names.js";
import { radialName, railNames, railStations } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cueFrom, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["10"] = function (s, t) {
  const [state, askAt, commitAt, codeAt, reqAt, verAt, whereAt] = en
    ? cues(s, [
        ["", "Verification has"],
        ["", "what was checked"],
        ["", "which commit"],
        ["", "exactly what code"],
        ["", "which requirement"],
        ["", "which verifier"],
        ["", "where and under"],
      ])
    : cues(s, [
        ["检验的时候", ""],
        ["查的是什么", ""],
        ["哪一次提交", ""],
        ["哪一份代码", ""],
        ["哪一项要求", ""],
        ["哪个检验程序", ""],
        ["在哪里", ""],
      ]);
  const [locAt, proofAt, labAt, hubAt, threeAt] = cues(s, [
    ["ETHOS 在本地", "ETHOS runs"],
    ["这叫本地证明", "That local proof"],
    ["GitLab", "GitLab"],
    ["GitHub", "GitHub"],
    ["三份来源不同", "three separate sources"],
  ]);
  const [more, idAt, sigAt, relAt, instAt, alsoAt, oneAt, neverAt, otherAt] = cues(s, [
    ["作者身份", "So are"],
    ["作者身份", "the author's identity"],
    ["提交签名", "the commit's signature"],
    ["发布出去的文件", "the released files"],
    ["装好的程序", "the installed program"],
    ["也各是一份独立的证据", "So are"],
    ["一份通过了", "A pass on one"],
    ["推不出", "never implies"],
    ["另一份也通过", "a pass on another"],
  ]);
  const [sayAt, nameAt, verifiedAt] = cues(s, [
    ["说一件事做完了", "That is why"],
    ["这一次实际检验了", "name exactly which"],
    ["检验了哪几样", "were verified"],
  ]);
  const [exAt, notYetAt, honestAt] = cues(s, [
    ["比如本地证明通过了", "If the local proof"],
    ["还没看", "have not been read"],
    ["如实的说法", "the honest statement"],
  ]);
  const stageA = stageOut(t, locAt),
    stageB = stageIn(t, locAt) * stageOut(t, more),
    stageC = stageIn(t, more) * stageOut(t, sayAt),
    stageD = stageIn(t, sayAt) * stageOut(t, exAt),
    stageE = stageIn(t, exAt);
  // Verification at the centre, and what it must state around it: each thing named arrives on its words and stays.
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 300),
      CX = 960,
      CY = 510,
      R = 110;
    const names = en
      ? [
          "Which commit",
          "Exactly what code",
          "Which requirement",
          "Which verifier",
          "Where, under which rules",
        ]
      : ["哪一次提交", "哪一份代码", "哪一项要求", "哪个检验程序", "在哪里、按什么规则"];
    const ats = [commitAt, codeAt, reqAt, verAt, whereAt],
      angles = [-Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9, 0.55, Math.PI / 2, Math.PI - 0.55],
      RR = 200;
    seal(CX, CY, R, { alpha: g, color: P.authority });
    nameText(L("检验", "Verification"), CX, CY - R - NAME_GAP, {
      valign: "bottom",
      color: P.authority,
      alpha: g * named(t, state),
    });
    ats.forEach((at, i) => {
      const a = angles[i],
        on = g * ramp(t, at - 0.15, 0.4),
        lit = speaking(t, ats, i),
        x = CX + RR * Math.cos(a) * 1.45,
        y = CY + RR * Math.sin(a) * 0.9,
        c = blend(P.ink, P.evidence, lit);
      link(CX + R * Math.cos(a), CY + R * Math.sin(a), x, y, {
        route: Math.abs(Math.cos(a)) > 0.4 ? "vh" : "straight",
        alpha: on,
        upto: soon(t, at, 0.4),
        end: false,
      });
      ring(x, y, 22, { color: c, alpha: on, width: 2.5 });
      dot(x, y, 7, { color: c, alpha: on });
      radialName(names[i], x, y, 22, a, {
        alpha: g * listIn(t, ats, i),
        set: "stated",
        width: 320,
      });
    });
    nameText(L("查的是什么", "What was checked"), CX, 262, {
      color: P.authority,
      alpha: g * named(t, askAt),
    });
  }
  // Three planes stand apart, each with its own seal: the local proof, GitLab and GitHub. No line joins them. The first
  // runs the repository's declared checks from the first words, and is named the local proof where the film says so.
  if (stageB > 0) {
    const ats = [locAt, labAt, hubAt],
      b = building(t, ats, 270, 0.35),
      xs = [420 + b, 960 + b, 1500 + b],
      Y = 450,
      names = en
        ? ["Local proof", "Checks on GitLab", "Checks on GitHub"]
        : ["本地证明", "GitLab 上的检查", "GitHub 上的检查"],
      CW = 296,
      CH = 190;
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, (i ? at : locAt + 0.1) - 0.15, 0.4),
        c = blend(
          P.ink,
          P.evidence,
          i ? speaking(t, ats, i) : ramp(t, proofAt - 0.15, 0.3) * (1 - ramp(t, labAt - 0.15, 0.3)),
        ),
        x = xs[i];
      if (i === 0) {
        terminalIcon(x - CW / 2, Y - CH / 2, CW, CH, { alpha: on, color: c, command: "prove" });
        // The declared checks run while the first sentence is said; the bar is full when the run is named a proof.
        line(
          x - CW / 2 + 24,
          Y + CH / 2 - 26,
          mix(
            x - CW / 2 + 24,
            x + CW / 2 - 24,
            soon(t, locAt + 0.25, Math.max(0.6, proofAt - locAt - 0.4)),
          ),
          Y + CH / 2 - 26,
          { color: P.evidence, alpha: on, width: 3 },
        );
      } else {
        box(x - CW / 2, Y - CH / 2, CW, CH, {
          fill: P.row,
          stroke: c,
          alpha: on,
          radius: 12,
          width: 2.5,
        });
        stroke(
          () => {
            ctx.moveTo(x - 110, Y - 44);
            ctx.lineTo(x + 110, Y - 44);
            ctx.moveTo(x - 110, Y);
            ctx.lineTo(x + 60, Y);
            ctx.moveTo(x - 110, Y + 44);
            ctx.lineTo(x + 84, Y + 44);
          },
          { color: P.muted, alpha: on, width: 2 },
        );
      }
      // The local run's seal stands as a rim from the first words and is stamped when the run is named a proof.
      seal(x + CW / 2, Y - CH / 2, 34, {
        alpha: on,
        stamp: i ? on : stageB * ramp(t, proofAt - 0.15, 0.4),
        color: P.evidence,
      });
      if (i === 0)
        nameText(L("仓库声明的检查", "Declared checks"), x, Y - CH / 2 - NAME_GAP, {
          valign: "bottom",
          size: NOTE,
          color: P.muted,
          alpha: on,
        });
      nameText(names[i], x, Y + CH / 2 + NAME_GAP, {
        valign: "top",
        alpha: stageB * (i ? listIn(t, ats, i) : named(t, proofAt) * listLevel(t, ats, 0)),
        set: "planes",
      });
    });
    nameText(L("来源不同的三份证据", "Three separate sources of evidence"), 960, 660, {
      color: P.authority,
      alpha: stageB * named(t, threeAt),
    });
  }
  // Four more kinds stand apart in the same way, and a pass on one is refused as proof of another.
  if (stageC > 0) {
    const names = en
      ? [
          "The author's identity",
          "The commit's signature",
          "The released files",
          "The installed program",
        ]
      : ["作者身份", "提交签名", "发布出去的文件", "装好的程序"];
    const ats = [idAt, sigAt, relAt, instAt],
      xs = railStations(names, 340, 1580, { wrap: 260 }),
      Y = 470;
    nameText(L("这些也各是一份独立的证据", "These are separate evidence too"), 960, 330, {
      color: P.authority,
      alpha: stageC * named(t, alsoAt),
    });
    const bx = building(t, ats, 207, 0.55);
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, (i ? at : more) - 0.15, 0.4),
        c = blend(P.ink, P.evidence, speaking(t, ats, i)),
        x = xs[i] + bx;
      if (i === 0) person(x, Y - 4, { alpha: on, size: 1.4, color: c });
      if (i === 1) {
        commitDot(x - 22, Y, { alpha: on, color: c, r: 14 });
        seal(x + 24, Y, 26, { alpha: on, color: c });
      }
      if (i === 2) {
        tagIcon(x - 66, Y - 30, 76, 34, { alpha: on, color: c });
        documentIcon(x + 4, Y - 26, 50, 62, { alpha: on, rows: 2, stroke: c });
      }
      if (i === 3) terminalIcon(x - 62, Y - 44, 124, 88, { alpha: on, color: c });
    });
    railNames(
      names,
      xs.map((x) => x + bx),
      Y + 58,
      { gap: NAME_GAP, alpha: (i) => stageC * listIn(t, ats, i), set: "kinds", wrap: 260 },
    );
    // One pass stands on the left; the dashed way to another is crossed out, and the other stays a question.
    const one = stageC * named(t, oneAt),
      LY = 660;
    seal(620, LY, 34, { alpha: one, color: P.evidence });
    link(662, LY, 1090, LY, {
      alpha: one * ramp(t, neverAt - 0.15, 0.3),
      dash: [8, 9],
      upto: soon(t, neverAt, 0.6),
      color: P.muted,
    });
    cross(876, LY, 30, { alpha: one * ramp(t, neverAt + 0.3, 0.4), width: 3.5 });
    ring(1130, LY, 34, {
      color: P.muted,
      alpha: one * ramp(t, otherAt - 0.15, 0.4),
      width: 2.5,
      dash: [6, 6],
    });
    text("?", 1130, LY + 1, 30, {
      role: "mark",
      align: "center",
      color: P.muted,
      alpha: one * ramp(t, otherAt - 0.15, 0.4),
    });
    nameText(
      L("一份通过，推不出另一份", "A pass on one never implies another"),
      586,
      LY + 34 + NAME_GAP,
      { align: "left", valign: "top", alpha: one },
    );
  }
  // Saying "done" has to name what was verified this time: a person says it beside the seven kinds, which keep the
  // names they were given, and only those verified this time are checked.
  if (stageD > 0) {
    const proofs = en
      ? ["Local proof", "Checks on GitLab", "Checks on GitHub"]
      : ["本地证明", "GitLab 上的检查", "GitHub 上的检查"];
    const kinds = en
      ? [
          "The author's identity",
          "The commit's signature",
          "The released files",
          "The installed program",
        ]
      : ["作者身份", "提交签名", "发布出去的文件", "装好的程序"];
    const cells = [
        ...proofs.map((v, k) => [840, 400 + k * 100, v]),
        ...kinds.map((v, k) => [1200, 350 + k * 100, v]),
      ],
      lit = [1, 0, 0, 1, 0, 1, 0],
      R = 30;
    const ask = stageD * named(t, nameAt),
      done = stageD * ramp(t, verifiedAt - 0.15, 0.4),
      PX = 500;
    person(PX, 520, { alpha: stageD, size: 1.5, color: P.authority });
    box(PX - 150, 360, 300, 80, {
      fill: P.row,
      stroke: P.ink,
      alpha: stageD,
      radius: 18,
      width: 2.5,
    });
    nameText(L("做完了", "It's done"), PX, 400, { alpha: stageD, bold: true });
    nameText(L("这一次检验了哪几样", "Which of these, this time"), PX, 600, {
      valign: "top",
      width: 380,
      color: P.authority,
      alpha: ask,
    });
    cells.forEach(([x, y, v], i) => {
      ring(x, y, R, { color: P.line, alpha: stageD, width: 2, dash: [6, 6] });
      if (lit[i]) {
        ring(x, y, R, { color: P.evidence, alpha: done, width: 3 });
        check(x, y + 2, 26, { color: P.evidence, alpha: done, upto: soon(t, verifiedAt, 0.4) });
      }
      nameText(v, x + R + 14, y, { align: "left", alpha: stageD, set: "verified" });
    });
  }
  // The honest statement: the local proof passed, and the two platforms' results are marked as not yet verified. The
  // statement is said in two parts, and each part lights what it states.
  if (stageE > 0) {
    const [labE, hubE] = en
      ? cues(s, [
          ["", "the results on"],
          ["", "the results on"],
        ])
      : [cueFrom(s, "GitLab", "", exAt), cueFrom(s, "GitHub", "", exAt)];
    const said1 = cueFrom(s, "本地证明通过", "the local proof passed", honestAt),
      said2 = cueFrom(s, "两个平台上的结果", "and the hosted results", honestAt);
    const ats = [exAt, labE, hubE],
      b = building(t, ats, 270, 0.3),
      xs = [420 + b, 960 + b, 1500 + b],
      Y = 400,
      names = en
        ? ["Local proof", "Checks on GitLab", "Checks on GitHub"]
        : ["本地证明", "GitLab", "GitHub"];
    const first = stageE * ramp(t, said1 - 0.15, 0.4),
      second = stageE * ramp(t, said2 - 0.15, 0.4),
      nv = stageE * ramp(t, notYetAt - 0.15, 0.4);
    xs.forEach((x, i) => {
      const on = stageE * (i ? ramp(t, ats[i] - 0.15, 0.4) : 1);
      box(x - 150, Y - 90, 300, 180, {
        fill: P.row,
        stroke: i ? blend(P.line, P.unknown, second) : P.evidence,
        alpha: on,
        radius: 12,
        width: i ? 2.5 : 2.5 + first,
        dash: i ? [8, 8] : null,
      });
      if (!i) seal(x, Y - 10, 42, { alpha: on, color: P.evidence });
      else text("?", x, Y - 10, 56, { role: "mark", align: "center", color: P.unknown, alpha: nv });
      nameText(names[i], x, Y + 56, {
        alpha: i ? stageE * listIn(t, ats, i) : stageE,
        set: "statement",
      });
    });
    nameText(L("通过了", "Passed"), xs[0], Y + 90 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.evidence,
      alpha: stageE,
    });
    nameText(L("还没看", "Not read"), (xs[1] + xs[2]) / 2, Y + 90 + NAME_GAP, {
      valign: "top",
      size: NOTE,
      color: P.unknown,
      alpha: nv,
    });
    const h = stageE * named(t, honestAt),
      parts = en
        ? ["Local proof passed; ", "hosted results not yet verified"]
        : ["本地证明通过；", "两个平台上的结果还没有检验"];
    nameText(L("如实的说法", "The honest statement"), 960, 600, {
      size: NOTE,
      color: P.muted,
      alpha: h,
    });
    growName(t, parts, [said1, said2], 960 - measure(parts.join("")) / 2, 660, {
      valign: "middle",
      color: P.authority,
      alpha: stageE,
      build: true,
    });
  }
};
