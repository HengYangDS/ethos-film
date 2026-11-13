/* 01 "Done": an Agent hands back one sentence, the sentence leaves four questions open, the work is now done by
 * interchangeable Agents, and the two usual answers to such a sentence both fail; ETHOS is built for that. The opening
 * quiet shows the title signature, as the first edition's opening did, and hands the picture to the Agent in one cut
 * just before the first word. */

import { CLAIM_H, claimPanel, claimWidth } from "../claim.js";
import { ctx } from "../../canvas.js";
import { FLOW_EVERY, flowAlong, flowClock, link, rounded, sharedRun } from "../../drawing/links.js";
import {
  box,
  dot,
  drawnShare,
  fill,
  labelSize,
  lengthOf,
  line,
  measure,
  path,
  ring,
  stroke,
} from "../../drawing/strokes.js";
import { agent, check, documentIcon, person } from "../../drawing/symbols.js";
import { commitDot, recoverIcon, repoIcon } from "../../drawing/workspace.js";
import { illustrative } from "../../framing/chapters.js";
import { titleSignature } from "../../framing/titles.js";
import { beats, listIn, listLevel, named, speaking } from "../../naming/lists.js";
import {
  NAME_GAP,
  NOTE,
  TERM_STACK,
  growName,
  nameText,
  wrapName,
} from "../../naming/names.js";
import { railStations, rowNameTop } from "../../naming/placement.js";
import { LABEL, P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cues } from "../../timing/cues.js";
import { clamp, ease, mix, ramp, soon } from "../../timing/easing.js";
import { glideShare, voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* An orthogonal route as link() draws it, for a flow that runs along it in the scene's own colour and size. */
const route = (corners) => rounded(corners, 14);
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
/* Checks that multiply with the Agents: `n` columns of a small Agent over the check it must redo, drawn as one mark of
 * outlines, one of cores and one of checks, so the grid reads as one growing mark. The row stands centred on x for its
 * `n` columns as n grows, so it re-centres continuously, and the column arriving at its open end grows in by its size,
 * easing in and out over the step of n that brings it. Grown in step with n, a column could be caught a third grown in
 * the first frame that draws it: in Chinese the sixth Agent's 9 px outline appeared whole within one frame, a pop at
 * full ink (filmkit 0.21). */
function checksGrid(x, y, n, { alpha = 1, step = 46 } = {}) {
  if (alpha < 0.01) return;
  const cols = Array.from({ length: Math.ceil(n - 1e-6) }, (_, i) => [
      x + (i - (n - 1) / 2) * step,
      ease(clamp(n - i)),
    ]),
    r = 22 * 0.55,
    c = 4.5 * 0.55;
  stroke(
    () =>
      cols.forEach(([cx, k]) => {
        ctx.moveTo(cx, y - r * k);
        ctx.lineTo(cx + r * k, y);
        ctx.lineTo(cx, y + r * k);
        ctx.lineTo(cx - r * k, y);
        ctx.closePath();
      }),
    { color: P.ink, alpha, width: 2.5 },
  );
  fill(
    () =>
      cols.forEach(([cx, k]) => {
        ctx.moveTo(cx + c * k, y);
        ctx.arc(cx, y, c * k, 0, Math.PI * 2);
      }),
    { color: P.ink, alpha },
  );
  stroke(
    () =>
      cols.forEach(([cx, k]) => {
        ctx.moveTo(cx - 7 * k, y + 37.5 + 0.5 * k);
        ctx.lineTo(cx - 2 * k, y + 37.5 + 5.5 * k);
        ctx.lineTo(cx + 8 * k, y + 37.5 - 5.5 * k);
      }),
    { color: P.ink, alpha, width: 2.5 },
  );
}

scenes["01"] = function (s, t) {
  // The opening quiet: the title signature stands until one cut hands the picture to the Agent.
  if (t < s.words[0].start - 0.12) {
    titleSignature(1);
    return;
  }
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
      ["是不是提需求的人真正要的", "really asked for"],
      ["能不能恢复原样", "can you get back"],
    ]);
  // Chinese says the Agents before the code they change and what makes them interchangeable last. The stage cuts in on
  // 越来越多, the clause that brings the Agents, and its 改代码 names the row and its code from the cut, within its
  // clause and under a second and a half ahead of its words; the Agents' name, the concept's rendering, stands on
  // 可以互相替换.
  const [relay, codeAt, inter, ends, pick] = cues(s, [
    ["越来越多", "our code"],
    ["改代码", "our code"],
    ["可以互相替换", "interchangeable Agents"],
    ["会话结束了", "session ends"],
    ["换一个接着做", "another picks up"],
  ]);
  const [writing, easier, flatAt, rely, hard] = cues(s, [
    ["写代码", "Writing code"],
    ["越来越容易", "keeps getting easier"],
    ["能不能信得过它", "Knowing whether"],
    ["能不能信得过它", "whether you can rely on it"],
    ["难的是", "does not"],
  ]);
  const [heard, people, two, trust, again, luck, cant, cantName, many] = cues(s, [
    ["这样一句话", "a sentence like that"],
    ["人一般", "people"],
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
  const q = flowClock(t);
  // The opening sentence's scenario is made up, so its stages carry the Illustrative chip.
  illustrative(Math.max(stageA, stageD, stageE));
  const W = claimWidth();
  // 1-3. The Agent stands at the centre from the first word; on the words that say it hands its sentence back, it
  // steps aside and a link rises from it and turns to the panel, which arrives at the link's end, and the sentence builds on its words, the datum landing
  // with its last word. The question of the film stands over the panel and one ring lights the datum. Then the Agent
  // leaves, the panel takes the centre, and the four questions the sentence leaves open build on a rail beneath it,
  // each linked from the panel, the one being asked carrying a point along its link.
  if (stageA > 0) {
    const aside = glideShare(t, hand + 0.05, Math.hypot(220, 80)),
      AX = mix(960, 740, aside),
      AY = mix(560, 640, aside),
      AR = 33,
      gone = ramp(t, opens - 0.15, 0.4),
      // The Agent and its name stand firm from the voice's first instant, no earlier than 0.3 s before the clause
      // that names it or 0.27 s before its own word.
      lead = Math.max(first - 0.28, s.voice_start - 0.1, cue(s, "Agent", "Agent") - 0.27),
      seen = stageA * ramp(t, lead - 0.15, 0.4) * (1 - gone);
    const slide = glideShare(t, opens + 0.05, 100, 0.7),
      PX = mix(1060, 960, slide),
      PY = 360,
      left = PX - W / 2;
    agent(AX, AY, { size: 1.5, alpha: seen });
    nameText("Agent", AX, AY + AR + NAME_GAP, {
      valign: "top",
      alpha: stageA * named(t, lead) * (1 - gone),
    });
    // The link draws on at the tip pace by its own length (drawnShare), as every drawn stroke of the film does.
    const corners = [
        [AX, AY - AR],
        [AX, PY],
        [left, PY],
      ],
      handed = drawnShare({ t, at: hand + 0.05 }, lengthOf(route(corners)));
    link(AX, AY - AR, left, PY, { route: "vh", alpha: seen, upto: handed, end: false });
    // The Agent steps aside as its link draws on, so the flow keeps one period as the link's length changes.
    flowAlong(route(corners), q, 6, { upto: handed, every: FLOW_EVERY, color: P.ink, alpha: seen });
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
    // The four questions, each a station on the rail with its mark in a ring; the rail keeps its spoken order and each
    // question stands in its place in the finished row from its words, the finished row centred on its ink.
    const names = L(
      ["哪一次提交？", "哪些测试，在哪儿？", "是不是提需求的人真正要的？", "能不能恢复原样？"],
      ["Which commit?", "Which tests, and where?", "Really asked for?", "Can you get back?"],
    );
    // Every question stands on one line within its share of the rail, as a row of questions reads. The stations keep
    // each pair of neighbours half of each name's width plus a gap apart (railStations), so the widest question,
    // 是不是提需求的人真正要的？, stands whole between its neighbours at the 360 px pitch. The row's ink reaches from
    // the first question's ring or name to the last one's. While the last question is still to come its station is a
    // plain point, so the row reaches only that point and its neighbour's name for most of the build; the row stands
    // midway between where that building row and the finished one are centred, so neither stands more than half their
    // difference off the centre, about 28 px in English, where they differ most.
    const RY = 620,
      RR = 34,
      WRAP = 400,
      POINT = 9,
      base = railStations(names, 420, 1500, { wrap: WRAP }),
      inkLeft = base[0] - Math.max(RR, measure(names[0]) / 2),
      inkRight = base.at(-1) + Math.max(RR, measure(names.at(-1)) / 2),
      buildRight = Math.max(base.at(-1) + POINT, base.at(-2) + Math.max(RR, measure(names.at(-2)) / 2)),
      xs = base.map((x) => x + 960 - (2 * inkLeft + inkRight + buildRight) / 4),
      mid = (PY + CLAIM_H / 2 + RY - RR) / 2,
      wayTo = (x) =>
        route([
          [PX, PY + CLAIM_H / 2],
          [PX, mid],
          [x, mid],
          [x, RY - RR],
        ]),
      ways = xs.map(wayTo);
    // Every question's link leaves the panel by the same run down to its turn, and one that turns the way of the link
    // before it runs on along that link: over the ink the earlier links have drawn it stands at once, unseen, and from
    // where it leaves them it draws on at the tip pace by the length of its own way (drawShare). The fourth question
    // opens with 要是做错了 / "And if it got something wrong" a second before its name, so its link may set off up to
    // 0.4 s before that name.
    const newWay = (i, at) => lengthOf(at[i]) - sharedRun(at[i], at.slice(0, i));
    // The rail stands with the first question, as the index of 02 does: it runs between the stations, never under a
    // ring, and a question still to come stands as a plain point in its place, which shrinks away as its ring inks in,
    // so the row's stations stand in their finished places while it builds.
    const rail = stageA * ramp(t, qs[0] - 0.15, 0.4),
      shown = qs.map((at) => ramp(t, at - 0.15, 0.4)),
      gapAt = (i) => Math.max(POINT * (1 - shown[i]), RR * shown[i]);
    stroke(
      () =>
        [0, 1, 2].forEach((i) => {
          ctx.moveTo(xs[i] + gapAt(i), RY);
          ctx.lineTo(xs[i + 1] - gapAt(i + 1), RY);
        }),
      { color: P.line, width: 2.5, alpha: rail },
    );
    fill(
      () =>
        xs.forEach((x, i) => {
          const r = POINT * (1 - ease(shown[i] / 0.45));
          if (r < 0.3) return;
          ctx.moveTo(x + r, RY);
          ctx.arc(x, RY, r, 0, Math.PI * 2);
        }),
      { color: P.ink, alpha: rail },
    );
    xs.forEach((x, i) => {
      const on = stageA * ramp(t, qs[i] - 0.15, 0.4),
        lit = speaking(t, qs, i);
      if (on < 0.01) return;
      const way = ways[i],
        whole = lengthOf(way),
        inked = sharedRun(way, ways.slice(0, i)),
        own = drawnShare({ t, at: qs[i] + 0.05, lead: 0.45 }, newWay(i, ways)),
        drawn = (inked + (whole - inked) * own) / whole;
      link(PX, PY + CLAIM_H / 2, x, RY - RR, {
        route: "vhv",
        mid,
        alpha: on,
        upto: drawn,
      });
      flowAlong(way, q, 5, { upto: drawn, every: FLOW_EVERY, color: P.ink, alpha: on * lit });
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
    // railNames would give each name its nearer neighbour's distance less 30 px, 330 px at this pitch, and break the
    // widest question; the stations already keep each pair half of each name's width plus a gap apart, so each name
    // is set whole under its station.
    names.forEach((v, i) =>
      nameText(v, xs[i], RY + RR + NAME_GAP, {
        valign: "top",
        align: "center",
        alpha: stageA * listIn(t, qs, i),
        set: "questions",
      }),
    );
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
        alpha: stageB,
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
      moved = glideShare(t, pick + 0.05, xs[1] - xs[0], 0.7),
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
    // without the comma, which comes with the words after it; as another Agent picks up the work, the whole name glides
    // with the frame and stands centred over it at the next Agent, the middle of the row.
    const parts = L(["会话结束了", "，换一个"], ["Session ends", ", another picks up"]),
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
  // 4. Writing code keeps getting easier: a line from one origin, named at its end, that steepens on the words
  // that say so and keeps rising while the voice speaks. Whether you can rely on it stays where it was: a flat line
  // from the same origin, lit once on the words that say it does not change. The two lines stand centred with the names
  // at their ends: in English the first with its own name, then, gliding on the words that name the second, with both.
  // The Chinese 写代码 is 116 px narrower than 能不能信得过它, so that glide moved the finished pair about 60 px as its
  // second curve was named (zh-R17-05); there the pair stands still from the cut, midway between where the first line
  // with its name and the finished pair are centred, so each of the two states stands about 30 px off the centre.
  if (stageC > 0) {
    const X0 = 340,
      X1 = 1300,
      Y0 = 610,
      writingName = L("写代码", "Writing code"),
      relyName = L("能不能信得过它", "Whether you can rely on it"),
      relyWide = Math.max(...wrapName(relyName, 300).map((v) => measure(v))),
      ends = X1 + 7 + NAME_GAP,
      centre = (w) => 960 - (X0 + ends + w) / 2,
      alone = centre(measure(writingName)),
      both = centre(Math.max(measure(writingName), relyWide)),
      shift = en
        ? mix(alone, both, glideShare(t, rely + 0.05, Math.abs(relyWide - measure(writingName)) / 2, 0.7))
        : (alone + both) / 2,
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
    // The flat line draws on at the tip pace by its own length (drawnShare), whole within its thought, and its end
    // point stands as it completes, so no point runs ahead of it. The Chinese thought ends on the line's own
    // clause, 难的是，能不能信得过它, too soon after 能不能信得过它 for a line this long, so there the
    // line sets off on the clause's first words; the ring that lights its end keeps to its own words.
    const lineFrom = L(hard, flatAt),
      flat = stageC * ramp(t, lineFrom - 0.15, 0.4),
      flatDrawn = drawnShare({ t, at: lineFrom + 0.05 }, X1 - X0),
      flatReach = mix(X0, X1, flatDrawn);
    line(X0, Y0, flatReach, Y0, { color: P.ink, alpha: flat, width: 4 });
    dot(X1, Y0, 7, { color: P.ink, alpha: flat * ease((flatDrawn - 0.85) / 0.15) });
    beats(t, X1, Y0, 22, [hard - 0.1], { alpha: stageC * ramp(t, flatAt - 0.15, 0.4) });
    nameText(relyName, ends, Y0, {
      align: "left",
      width: 300,
      alpha: stageC * named(t, rely),
    });
    ctx.restore();
  }
  // 5-6. The sentence returns at the top and reaches a listener, who has two ways to answer it: take it on trust, a
  // gamble, or check everything again, which stops working as the Agents multiply and their checks with them. Each way
  // is named on its words, and what it costs joins under its name as its qualifier on its own words, so no cost stands
  // as a name without the way it belongs to; each cost's mark hangs under the way's name. Until the two ways fork from
  // the listener, the listener stands lower at the end of a longer link, so the panel and the listener alone stay
  // balanced and fill the band; it rises into place as the fork draws. Then the two ways leave, the datum leaves the
  // sentence for the centre, and ETHOS stands under it.
  if (stageD > 0 || stageE > 0) {
    const PY = 300,
      move = glideShare(t, ethos + 0.05, Math.hypot(W / 2, 620 - PY), 0.8);
    claimPanel(t, 960, PY, {
      alpha: stageD + stageE,
      datum: mix(1, 1.5, move),
      datumAt: [mix(960 + W / 2, 960, move), mix(PY, 620, move)],
    });
    nameText("ETHOS", 960, 620 + 18 + NAME_GAP, { valign: "top", alpha: stageE * named(t, ethos) });
    if (stageD > 0) {
      const HX = 960,
        HY = 450 + 170 * (1 - glideShare(t, two + 0.05, 170, 0.5)),
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
        // The ways' names and their costs under them, then each cost's mark one short link lower.
        NY = BY + NAME_GAP,
        LINK = NY + labelSize(LABEL) + TERM_STACK + labelSize(NOTE) + 14,
        GY = LINK + 62,
        ways = [trust, again],
        // The costs, and when each cost's mark arrives: the gamble's die with its words, the checks with the words
        // that multiply the Agents.
        costs = [cue(s, "运气", "a gamble"), cantName],
        marks = [luck, cant],
        fork = stageD * ramp(t, two + 0.25, 0.3);
      XS.forEach((x, i) => {
        const way = route([
            [HX, FY],
            [HX, MID],
            [x, MID],
            [x, BY],
          ]),
          forked = drawnShare({ t, at: two + 0.4 }, lengthOf(way));
        link(HX, FY, x, BY, {
          route: "vhv",
          mid: MID,
          alpha: fork,
          upto: forked,
        });
        flowAlong(way, q, 5, { upto: forked, color: P.ink, alpha: fork * speaking(t, ways, i) });
        // The costs stay short: the die is luck, and the growing row of Agents and checks says how many there are.
        // Each way and its cost are two names, the cost set under the way as a qualifier stands under its term, so
        // each is judged by its own words: as one name, "Check everything again stops working" stood from the way's
        // words, 3.8 s before the clause that says the cost (filmkit 0.21.0). The costs are a set of their own, as
        // qualifiers in the lower case are, beside the ways' names.
        const wayName = nameText(
          L(["照单全收", "从头再查一遍"], ["Take it on trust", "Check everything again"])[i],
          x,
          NY,
          { valign: "top", alpha: stageD * listLevel(t, ways, i) * named(t, ways[i]), set: "ways" },
        );
        nameText(L(["运气", "查不过来"], ["a gamble", "stops working"])[i], x, wayName.bottom + TERM_STACK, {
          valign: "top",
          size: NOTE,
          color: P.muted,
          alpha: stageD * listLevel(t, ways, i) * named(t, costs[i]),
          set: "costs",
        });
        const on = stageD * ramp(t, marks[i] - 0.15, 0.4);
        // Each way's short link ends with its point clear above its cost's mark, so the checks' link does not land on
        // the middle Agent of the row.
        link(x, LINK, x, GY - 42, { alpha: on, draw: { t, at: marks[i] - 0.1 } });
      });
      die(XS[0], GY, 46, { alpha: stageD * ramp(t, luck - 0.15, 0.4) });
      const grid = stageD * ramp(t, cant - 0.15, 0.4);
      // The row grows from two columns to seven over a second, so each column takes at least four frames to grow in
      // and is at most a sixth grown in the first frame that draws it.
      checksGrid(XS[1], GY - 16, mix(2, 7, glideShare(t, many + 0.05, (5 * 46) / 2, 1)), {
        alpha: grid,
      });
    }
  }
};
