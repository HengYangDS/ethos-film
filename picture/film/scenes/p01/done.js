/* 01 "Done": an Agent hands back one sentence, the sentence leaves four questions open, the work is now done by
 * interchangeable Agents, and the two usual answers to such a sentence both fail; ETHOS is built for that. */

import { CLAIM_H, claimPanel, claimWidth } from "../claim.js";
import { ctx } from "../../canvas.js";
import { along, link, rounded } from "../../drawing/links.js";
import {
  box,
  dot,
  fill,
  flowDot,
  labelSize,
  line,
  measure,
  path,
  ring,
  stroke,
} from "../../drawing/strokes.js";
import { agent, check, documentIcon, person } from "../../drawing/symbols.js";
import { commitDot, recoverIcon, repoIcon } from "../../drawing/workspace.js";
import { illustrative } from "../../framing/chapters.js";
import { beats, building, listIn, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, growName, nameText, wrapName } from "../../naming/names.js";
import { railNames, railStations, rowNameTop } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* The point at share q of an orthogonal route drawn as link() draws it, for a flow that only one link carries. */
const routePoint = (corners, q) => along(rounded(corners, 14), q).point;
/* A row of Agents drawn as one mark, their outlines one stroke and their cores one fill, so one name names the row. */
function agentRow(xs, y, { alpha = 1, size = 1 } = {}) {
  if (alpha < 0.01) return;
  const r = 22 * size,
    c = 4.5 * size;
  stroke(
    () =>
      xs.forEach((x) => {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
      }),
    { color: P.ink, alpha, width: 2.5 },
  );
  fill(
    () =>
      xs.forEach((x) => {
        ctx.moveTo(x + c, y);
        ctx.arc(x, y, c, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha },
  );
}
/* A die: a gamble. */
function die(x, y, s, { alpha = 1 } = {}) {
  box(x - s / 2, y - s / 2, s, s, { stroke: P.ink, alpha, radius: s * 0.2, width: 2.5 });
  fill(
    () =>
      [
        [-1, -1],
        [1, -1],
        [0, 0],
        [-1, 1],
        [1, 1],
      ].forEach(([i, j]) => {
        const px = x + i * s * 0.25,
          py = y + j * s * 0.25;
        ctx.moveTo(px + 3.5, py);
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha },
  );
}
/* Checks that multiply with the Agents: `n` columns of a small Agent over the check it must redo, the whole ones as one
 * mark and the one arriving beside them, so the grid reads as one growing mark. */
function checksGrid(x, y, n, { alpha = 1, step = 46 } = {}) {
  const whole = Math.floor(n),
    part = n - whole,
    col = (i) => x + (i - (Math.ceil(n) - 1) / 2) * step;
  const draw = (from, to, a) => {
    if (a < 0.01 || to <= from) return;
    const xs = Array.from({ length: to - from }, (_, k) => col(from + k));
    agentRow(xs, y, { alpha: a, size: 0.55 });
    stroke(
      () =>
        xs.forEach((cx) => {
          ctx.moveTo(cx - 7, y + 38);
          ctx.lineTo(cx - 2, y + 43);
          ctx.lineTo(cx + 8, y + 32);
        }),
      { color: P.ink, alpha: a, width: 2.5 },
    );
  };
  draw(0, whole, alpha);
  draw(whole, whole + 1, alpha * part);
}

scenes["01"] = function (s, t) {
  const first = s.words[0].start;
  const [hand, done, pass, landed, much] = cues(s, [
    ["交回来", "hands back"],
    ["做完了", "Done"],
    ["测试全过", "All tests pass"],
    ["全过", "pass"],
    ["说明了多少", "How much"],
  ]);
  const opens = cue(s, "它说的是", "Which commit"),
    qs = cues(s, [
      ["哪一次提交", "Which commit"],
      ["哪些测试", "Which tests ran"],
      ["是不是当初真正要的", "really asked for"],
      ["能不能退回去", "can you get back"],
    ]);
  const [relay, codeAt, inter, ends, pick] = cues(s, [
    ["替我们", "our code"],
    ["改代码", "our code"],
    ["可以互相替换的 Agent", "interchangeable Agents"],
    ["会话结束了", "session ends"],
    ["换一个接着做", "another picks up"],
  ]);
  const [writing, easier, flatAt, rely, hard] = cues(s, [
    ["写一个改动", "Writing code"],
    ["越来越容易", "keeps getting easier"],
    ["能不能放心依靠它", "Knowing whether"],
    ["能不能放心依靠它", "whether you can rely on it"],
    ["难的是", "does not"],
  ]);
  const [heard, people, two, trust, again, luck, cant, cantName, many] = cues(s, [
    ["这样一句话", "a sentence like that"],
    ["人", "people"],
    ["两种做法", "two things"],
    ["照单全收", "take it on trust"],
    ["从头再查一遍", "check everything again"],
    ["靠的是运气", "a gamble"],
    ["Agent 一多", "stops working"],
    ["查不过来", "stops working"],
    ["Agent 一多", "many Agents"],
  ]);
  const ethos = cue(s, "ETHOS", "ETHOS");
  const stageA = stageOut(t, relay),
    stageB = stageIn(t, relay) * stageOut(t, writing),
    stageC = stageIn(t, writing) * stageOut(t, heard),
    stageD = stageIn(t, heard) * stageOut(t, ethos),
    stageE = stageIn(t, ethos);
  const q = (voiceTime(t) * 0.45) % 1;
  // The opening sentence's scenario is made up, so its stages carry the Illustrative chip.
  illustrative(Math.max(stageA, stageD, stageE));
  const W = claimWidth();
  // 1-3. The Agent stands at the centre from the first word; on the words that say it hands its sentence back, it
  // steps aside and a link rises from it and turns to the panel, which arrives at the link's end, and the sentence builds on its words, the datum landing
  // with its last word. The question of the film stands over the panel and one ring lights the datum. Then the Agent
  // leaves, the panel takes the centre, and the four questions the sentence leaves open build on a rail beneath it,
  // each linked from the panel, the one being asked carrying a point along its link.
  if (stageA > 0) {
    const aside = soon(t, hand + 0.05, 0.6),
      AX = mix(960, 740, aside),
      AY = mix(560, 640, aside),
      AR = 33,
      gone = ramp(t, opens - 0.15, 0.4),
      // The Agent and its name stand firm from the voice's first instant, no earlier than 0.3 s before the clause
      // that names it.
      lead = Math.max(first - 0.28, s.voice_start - 0.1),
      seen = stageA * ramp(t, lead - 0.15, 0.4) * (1 - gone);
    const slide = soon(t, opens + 0.05, 0.7),
      PX = mix(1060, 960, slide),
      PY = 360,
      left = PX - W / 2;
    agent(AX, AY, { size: 1.5, alpha: seen });
    nameText("Agent", AX, AY + AR + NAME_GAP, {
      valign: "top",
      alpha: stageA * named(t, lead) * (1 - gone),
    });
    const handed = soon(t, hand + 0.05, 0.6),
      corners = [
        [AX, AY - AR],
        [AX, PY],
        [left, PY],
      ];
    link(AX, AY - AR, left, PY, { route: "vh", alpha: seen, upto: handed, end: false });
    if (handed >= 1 && seen > 0.01) {
      const [fx, fy] = routePoint(corners, q);
      flowDot(fx, fy, 6, q, { color: P.ink, alpha: seen });
    }
    const panel = stageA * ramp(t, hand + 0.35, 0.4);
    const placed = claimPanel(t, PX, PY, {
      alpha: panel,
      words: stageA,
      ats: [done, pass],
      datum: soon(t, landed + 0.05, 0.35),
    });
    const [DX, DY] = placed.datum;
    nameText(L("说明了多少？", "How much?"), PX, PY - CLAIM_H / 2 - NAME_GAP, {
      valign: "bottom",
      alpha: stageA * named(t, much),
    });
    beats(t, DX, DY, 30, [much], { alpha: stageA });
    // The four questions, each a station on the rail with its mark in a ring; the rail keeps its spoken order and
    // stays centred while it builds.
    const names = L(
      ["哪一次提交？", "哪些测试，在哪儿？", "是不是当初真正要的？", "能不能退回去？"],
      ["Which commit?", "Which tests ran?", "Really asked for?", "Can you get back?"],
    );
    const RY = 620,
      RR = 34,
      base = railStations(names, 420, 1500, { wrap: 300 }),
      shift = building(t, qs, (base[1] - base[0]) / 2),
      xs = base.map((x) => x + shift),
      mid = (PY + CLAIM_H / 2 + RY - RR) / 2;
    xs.forEach((x, i) => {
      const on = stageA * ramp(t, qs[i] - 0.15, 0.4),
        lit = speaking(t, qs, i);
      if (on < 0.01) return;
      link(PX, PY + CLAIM_H / 2, x, RY - RR, {
        route: "vhv",
        mid,
        alpha: on,
        upto: soon(t, qs[i] + 0.05, 0.5),
      });
      const [fx, fy] = routePoint(
        [
          [PX, PY + CLAIM_H / 2],
          [PX, mid],
          [x, mid],
          [x, RY - RR],
        ],
        q,
      );
      flowDot(fx, fy, 5, q, { color: P.ink, alpha: on * lit });
      dot(x, RY, RR, { color: P.ground, alpha: on });
      ring(x, RY, RR, { color: P.ink, alpha: on, width: 2.5 + lit });
      if (i === 0) {
        line(x - 20, RY, x + 20, RY, { color: P.ink, alpha: on, width: 2.5 });
        commitDot(x, RY, { alpha: on, r: 8 });
      }
      if (i === 1) {
        box(x - 19, RY - 15, 38, 30, { stroke: P.ink, alpha: on, radius: 5, width: 2.5 });
        check(x, RY + 1, 16, { color: P.ink, alpha: on, width: 3 });
      }
      if (i === 2) documentIcon(x - 13, RY - 17, 26, 34, { alpha: on, rows: 3 });
      if (i === 3) recoverIcon(x, RY, 15, { color: P.ink, alpha: on });
    });
    railNames(names, xs, RY + RR, {
      gap: NAME_GAP,
      wrap: 300,
      alpha: (i) => stageA * listIn(t, qs, i),
      set: "questions",
    });
  }
  // 4. The work is now done by Agents: the code they change, and the row of interchangeable Agents joined to it. Its
  // session frame stands around the Agent at work; when the session ends the frame turns to a dashed outline, and when
  // another picks up the work the frame moves to the next Agent and closes again. The work flows into the code.
  if (stageB > 0) {
    const xs = [560, 720, 880],
      Y = 500,
      R = 33,
      S = 48,
      RX = 1330,
      RW = 260,
      RH = 200;
    // The row and its link stand from the cut, joined to the code they change, so the code's name names them until
    // their own name arrives. The whole stage stands centred on the frame, from the session frame's left edge to the
    // repository's right.
    const row = stageB;
    ctx.save();
    ctx.translate(960 - (xs[0] - S + RX + RW / 2) / 2, 0);
    repoIcon(RX, Y, RW, RH, { alpha: stageB });
    stroke(
      () =>
        [0.7, 0.5, 0.8, 0.45].forEach((w, k) => {
          ctx.moveTo(RX - 70, Y - 30 + k * 30);
          ctx.lineTo(RX - 70 + 170 * w, Y - 30 + k * 30);
        }),
      { color: P.muted, alpha: stageB * 0.8, width: 2 },
    );
    agentRow(xs, Y, { alpha: row, size: 1.5 });
    link(xs[2] + R, Y, RX - RW / 2, Y, {
      alpha: row,
      flow: q,
      width: 2.5,
    });
    // The names under the row hang on one baseline under its tallest mark: in English the code is named under the
    // repository, so the Agents' name hangs beside it; in Chinese the change is named over the link, and the Agents'
    // name, the row's only name beneath, hangs under the session frame.
    const namesTop = en ? rowNameTop([Y + S, Y + RH / 2]) : Y + S + NAME_GAP;
    if (!en)
      nameText("改代码", (xs[2] + R + RX - RW / 2) / 2, Y - NAME_GAP, {
        valign: "bottom",
        alpha: stageB * named(t, codeAt),
      });
    else
      nameText("Our code", RX, namesTop, {
        valign: "top",
        alpha: stageB * named(t, codeAt),
      });
    nameText(L("可以互相替换的 Agent", "Interchangeable Agents"), xs[1], namesTop, {
      valign: "top",
      alpha: stageB * named(t, inter),
    });
    // The session frame: solid while the session runs, dashed once it has ended, solid again around the next Agent.
    const ended = ramp(t, ends - 0.15, 0.4),
      moved = soon(t, pick + 0.05, 0.7),
      FX = mix(xs[0], xs[1], moved),
      dashedShare = ended * (1 - ramp(t, pick + 0.45, 0.4));
    box(FX - S, Y - S, 2 * S, 2 * S, {
      stroke: P.ink,
      alpha: row * (1 - dashedShare),
      radius: 14,
      width: 2.5,
    });
    box(FX - S, Y - S, 2 * S, 2 * S, {
      stroke: P.ink,
      alpha: row * dashedShare * 0.8,
      radius: 14,
      width: 2.5,
      dash: [7, 7],
    });
    // The session's name stands over its frame: as the session ends, its first part is centred on the dashed frame,
    // a final comma hung; as another Agent picks up the work, the whole name glides with the frame and stands centred
    // over it at the next Agent, the middle of the row.
    const parts = L(["会话结束了，", "换一个"], ["Session ends, ", "another picks up"]),
      ending = parts[0].trimEnd(),
      hung = /[、，。；：！？]$/u.test(ending) ? 0.3 * labelSize(LABEL) : 0,
      alone = xs[0] - measure(ending) / 2 + hung,
      whole = xs[1] - measure(parts.join("")) / 2;
    growName(t, parts, [ends, pick], mix(alone, whole, moved), Y - S - NAME_GAP, {
      valign: "bottom",
      alpha: stageB,
      build: true,
    });
    ctx.restore();
  }
  // 4. Writing a change keeps getting easier: a line from one origin, named at its end, that steepens on the words
  // that say so and keeps rising while the voice speaks. Whether you can rely on it stays where it was: a flat line
  // from the same origin, lit once on the words that say it does not change. The two lines stand centred with the names
  // at their ends: the first with its own name, then, gliding on the words that name the second, with both.
  if (stageC > 0) {
    const X0 = 340,
      X1 = 1300,
      Y0 = 610,
      writingName = L("写一个改动", "Writing code"),
      relyName = L("能不能放心依靠它", "Whether you can rely on it"),
      relyWide = Math.max(...wrapName(relyName, 300).map((v) => measure(v))),
      ends = X1 + 7 + NAME_GAP,
      centre = (w) => 960 - (X0 + ends + w) / 2,
      shift = mix(
        centre(measure(writingName)),
        centre(Math.max(measure(writingName), relyWide)),
        soon(t, rely + 0.05, 0.7),
      ),
      climb =
        120 +
        160 * soon(t, easier + 0.05, 1.6) +
        6 * Math.max(0, voiceTime(t) - voiceTime(easier + 1.65));
    const rise = (x) => Y0 - climb * ((x - X0) / (X1 - X0)) ** 1.7,
      points = [];
    for (let x = X0; x < X1; x += 12) points.push([x, rise(x)]);
    points.push([X1, rise(X1)]);
    ctx.save();
    ctx.translate(shift, 0);
    path(points, { color: P.ink, alpha: stageC, width: 4 });
    dot(X1, rise(X1), 7, { color: P.ink, alpha: stageC });
    nameText(writingName, ends, rise(X1), {
      align: "left",
      alpha: stageC * named(t, writing),
    });
    const flat = stageC * ramp(t, flatAt - 0.15, 0.4),
      flatReach = mix(X0, X1, soon(t, flatAt - 0.1, 1));
    line(X0, Y0, flatReach, Y0, { color: P.ink, alpha: flat, width: 4 });
    dot(flatReach, Y0, 7, { color: P.ink, alpha: flat });
    beats(t, X1, Y0, 22, [hard - 0.1], { alpha: flat });
    nameText(relyName, ends, Y0, {
      align: "left",
      width: 300,
      alpha: stageC * named(t, rely),
    });
    ctx.restore();
  }
  // 5-6. The sentence returns at the top and reaches a listener, who has two ways to answer it: take it on trust, a
  // gamble, or check everything again, which stops working as the Agents multiply and their checks with them. Until the
  // two ways fork from the listener, the listener stands lower at the end of a longer link, so the panel and the
  // listener alone stay balanced and fill the band; it rises into place as the fork draws. Then the two ways leave,
  // the datum leaves the sentence for the centre, and ETHOS stands under it.
  if (stageD > 0 || stageE > 0) {
    const PY = 300,
      move = soon(t, ethos + 0.05, 0.8);
    claimPanel(t, 960, PY, {
      alpha: stageD + stageE,
      datum: mix(1, 1.5, move),
      datumAt: [mix(960 + W / 2, 960, move), mix(PY, 620, move)],
    });
    nameText("ETHOS", 960, 620 + 18 + NAME_GAP, { valign: "top", alpha: stageE * named(t, ethos) });
    if (stageD > 0) {
      const HX = 960,
        HY = 450 + 170 * (1 - soon(t, two + 0.05, 0.5)),
        heard1 = stageD;
      // The listener is joined to the sentence by its link from the cut, so it is one mark with the panel until its
      // own name arrives on its words.
      link(HX, PY + CLAIM_H / 2, HX, HY - 44, { alpha: heard1 });
      person(HX, HY, { size: 1.3, alpha: heard1 });
      nameText(L("人", "People"), HX + 34 + NAME_GAP, HY - 12, {
        align: "left",
        alpha: stageD * named(t, people),
      });
      const XS = [620, 1300],
        FY = HY + 42,
        MID = 525,
        BY = 565,
        GY = BY + 120,
        CY = GY + 45,
        ways = [trust, again],
        // The consequences' names, and when each consequence's mark arrives: the gamble's die with its name, the
        // checks with the words that multiply the Agents.
        costs = [luck, cantName],
        marks = [luck, cant],
        fork = stageD * ramp(t, two + 0.25, 0.3);
      XS.forEach((x, i) => {
        link(HX, FY, x, BY, {
          route: "vhv",
          mid: MID,
          alpha: fork,
          upto: soon(t, two + 0.4, 0.6),
        });
        const [fx, fy] = routePoint(
          [
            [HX, FY],
            [HX, MID],
            [x, MID],
            [x, BY],
          ],
          q,
        );
        flowDot(fx, fy, 5, q, { color: P.ink, alpha: fork * speaking(t, ways, i) });
        nameText(
          L(["照单全收", "从头再查一遍"], ["Take it on trust", "Check everything again"])[i],
          x,
          BY + NAME_GAP,
          { valign: "top", alpha: stageD * listIn(t, ways, i), set: "ways" },
        );
        const on = stageD * ramp(t, marks[i] - 0.15, 0.4);
        // Each way's short link ends with its point clear above its consequence's mark, so the checks' link does not
        // land on the middle Agent of the row.
        link(x, BY + NAME_GAP + 40, x, GY - 42, { alpha: on, upto: soon(t, marks[i] - 0.1, 0.4) });
      });
      die(XS[0], GY, 46, { alpha: stageD * ramp(t, luck - 0.15, 0.4) });
      nameText(L("靠的是运气", "A gamble"), XS[0], CY, {
        valign: "top",
        alpha: stageD * listIn(t, costs, 0),
        set: "costs",
      });
      const grid = stageD * ramp(t, cant - 0.15, 0.4);
      checksGrid(XS[1], GY - 16, mix(2, 7, soon(t, many + 0.05, 0.65)), { alpha: grid });
      // The consequence stays short: the growing row of Agents and checks says how many there are.
      nameText(L("查不过来", "Stops working"), XS[1], CY, {
        valign: "top",
        alpha: stageD * listIn(t, costs, 1),
        set: "costs",
      });
    }
  }
};
