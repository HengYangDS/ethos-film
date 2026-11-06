/* 02 Where it is hard: an index of the three difficulties, and under it, while each is told, its illustration. */

import { stageClaims, stageTests } from "./beyond.js";
import { stagePerson, stageRail, stageSummaries, stageWrongGoal } from "./drift.js";
import { stageBranch, stagePlatforms, stageSent } from "./facts.js";
import { stageLedgers } from "./process.js";
import { ctx } from "../../canvas.js";
import { fill, measure, ring, stroke, text } from "../../drawing/strokes.js";
import { named } from "../../naming/lists.js";
import { NAME_GAP, NOTE, nameText, wrapName } from "../../naming/names.js";
import { railNames } from "../../naming/placement.js";
import { P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L } from "../../timeline.js";
import { cues } from "../../timing/cues.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* The index: a rail of three stations under its heading. While a difficulty is introduced the index stands at the
 * centre with large rings (`k` 0); while it is shown the index stands at the top with small rings (`k` 1), and the
 * illustration fills the band below. A station stays a plain point until its difficulty is named, the points of the
 * unnamed ones one fill under the heading's name, within the reach of a name above its row; a named station is a
 * numbered ring with its name beneath. The rail runs between the stations, never under a number. The heading never
 * travels across the rings: it rises with the rail as it fades from the centre, and as the index lands it fades in as
 * the docked index's kicker, small and muted over the first station, where the index begins, so it reads as the
 * index's heading rather than as a second name stepped beside the first station's. `kicker` is the kicker's presence,
 * which the scene times so that it fades only while the rail moves slowly and overlaps the heading at the centre in
 * both directions, so the heading never goes unread. `levels` gives each name's ink: the difficulty being told at full
 * ink, the others at the second level. */
const INDEX_XS = [420, 960, 1500],
  CENTRE_POINT = 12,
  CENTRE_R = 54,
  DOCK_Y = 166,
  DOCK_GAP = 12,
  DOCK_POINT = 6,
  DOCK_R = 16,
  WRAP = 460;
const halfName = (v) => Math.max(...wrapName(v, WRAP).map((line) => measure(line))) / 2;
/* How far the docked index reaches past its first and last stations: a named station's name or ring, an unnamed
 * station's point, and over the first station the kicker. */
function dockReach(heading, names, shown) {
  const past = [0, 2].map((i) => mix(DOCK_POINT, Math.max(DOCK_R, halfName(names[i])), shown[i]));
  return [Math.max(past[0], measure(heading, NOTE) / 2), past[1]];
}
/* How far the centred index reaches past its first and last stations: a named station's name or ring, an unnamed
 * station's point; its heading stands over the middle station, inside the rail. */
const centreReach = (names, shown) =>
  [0, 2].map((i) => mix(CENTRE_POINT, Math.max(CENTRE_R, halfName(names[i])), shown[i]));
function hardIndex(t, k, { heading, headAt, names, ats, levels, kicker }) {
  const Y = mix(540, DOCK_Y, k),
    R = mix(CENTRE_R, DOCK_R, k),
    pointR = mix(CENTRE_POINT, DOCK_POINT, k),
    gap = mix(NAME_GAP, DOCK_GAP, k),
    shown = ats.map((at) => ramp(t, at - 0.15, 0.4)),
    reach = shown.map((v) => Math.max(pointR * (1 - v), R * v));
  // Docked, the index is balanced on what it shows: the first station's name hangs past it, the last station is a bare
  // point until it is named, so the index stands off the frame's centre by half the difference of the two reaches. It
  // takes that place as it rises and leaves it as it comes down, so it never moves sideways while it is docked. At the
  // centre it is balanced the same way, heading and all: a name that reaches past the first or last station moves the
  // whole index as one, gliding from just after the words that name that station.
  const [before, after] = dockReach(heading, names, shown),
    [from, to] = centreReach(
      names,
      ats.map((at) => soon(t, at + 0.05, 0.7)),
    ),
    xs = INDEX_XS.map((x) => x + mix((from - to) / 2, (before - after) / 2, k));
  stroke(
    () =>
      [0, 1].forEach((i) => {
        ctx.moveTo(xs[i] + reach[i], Y);
        ctx.lineTo(xs[i + 1] - reach[i + 1], Y);
      }),
    { color: P.line, width: 2.5 },
  );
  // The points of the stations not yet named: one fill, so they read as one mark with the rail.
  fill(
    () =>
      xs.forEach((x, i) => {
        if (shown[i] > 0) return;
        const r = pointR;
        ctx.moveTo(x + r, Y);
        ctx.arc(x, Y, r, 0, Math.PI * 2);
      }),
    { color: P.ink },
  );
  xs.forEach((x, i) => {
    if (shown[i] <= 0) return;
    ring(x, Y, R * shown[i], { color: P.ink, alpha: shown[i], width: mix(2.5, 3.5, levels[i]) });
    text(String(i + 1), x, Y + 1, mix(30, 18, k), {
      role: "mark",
      align: "center",
      alpha: clamp((shown[i] - 0.4) / 0.6) * mix(0.58, 1, levels[i]),
    });
  });
  railNames(names, xs, Y + R, {
    gap,
    wrap: WRAP,
    alpha: (i) => named(t, ats[i]) * mix(0.58, 1, levels[i]),
    set: "hard",
  });
  nameText(heading, xs[1], Y - 98, {
    valign: "bottom",
    alpha: named(t, headAt) * clamp(1.5 - 2 * k),
  });
  // The kicker stands one gap over the first station's ring, centred on it as the name beneath is, and moves with it.
  nameText(heading, xs[0], Y - R - gap, {
    valign: "bottom",
    size: NOTE,
    color: P.muted,
    alpha: named(t, headAt) * kicker,
  });
}

scenes["02"] = function (s, t) {
  const c = {};
  const take = (pairs) =>
    cues(s, Object.values(pairs)).forEach((v, i) => (c[Object.keys(pairs)[i]] = v));
  take({
    head: ["难处", "three parts"],
    first: ["第一个", "The first"],
    n1: ["原意会走样", "meaning drifts"],
    pCut: ["一件事", "one person"],
    work: ["一件事", "a piece of work"],
    person: ["一个人", "one person"],
    span: ["从头做到尾", "start to finish"],
    story: ["来龙去脉", "the whole story"],
    rCut: ["一项需求", "a request"],
    delivery: ["落地", "delivery"],
    st1: ["理解", "interpretation"],
    st2: ["转述", "retelling"],
    st3: ["交接", "handoffs"],
    people: ["好几个人", "several people"],
    agents: ["好几个 Agent", "several Agents"],
    sCut: ["每转一手", "At every handoff"],
    orig: ["原话", "the words before it"],
    summary: ["一份总结顶替一次", "a summary takes the place"],
    unwritten: ["没写下来的约束", "never written down"],
    anyConstraint: ["没写下来的约束", "any constraint"],
    gone: ["跟着没了", "ends with it"],
    mustNot: ["不能做什么", "what must not be done"],
    benefit: ["本来要带来的效益", "the benefit"],
    gCut: ["需求哪怕", "A specification"],
    wellFormed: ["格式齐全", "complete and well formed"],
    goal: ["目标", "the wrong goal"],
    wrong: ["从一开始就定错了", "aimed at the wrong goal"],
    second: ["第二个", "The second"],
    n2: ["结论超出了证据", "claims go beyond their evidence"],
    eCut: ["本地跑通了", "A run that passed"],
    local: ["本地跑通了", "passed on one machine"],
    everything: ["全部通过", "everything passes"],
    merge: ["代码合进去了", "A merge"],
    release: ["已经发布", "a release"],
    releaseName: ["发布", "a release"],
    deploy: ["部署成功了", "a deployment"],
    benefit2: ["实际效益", "actual benefit"],
    ownPart: ["只证明了它自己那一段", "proves only its own part"],
    ownName: ["它自己那一段", "its own part"],
    tCut: ["就连", "Even"],
    allPass: ["测试全过", "all tests pass"],
    written: ["已经写好的那些测试", "the tests someone wrote"],
    enough: ["这些测试够不够", "whether those tests are enough"],
    third: ["第三个", "The third"],
    // The third difficulty is told from its clause, 是事实 / changes; its name, which keeps its subject, 事实, stands on
    // its own words.
    n3: ["是事实", "changes are made"],
    n3name: ["事实还没看清", "changes are made"],
    bCut: ["两个 Agent", "Two Agents"],
    branch: ["一条分支", "the same branch"],
    memory: ["过时的记忆", "an outdated memory"],
    writes: ["写下去", "writes"],
    otherWork: ["另一个的工作", "the other one's work"],
    overwritten: ["被覆盖了", "overwritten"],
    vCut: ["同一个版本", "The same version"],
    gitlab: ["GitLab", "GitLab"],
    github: ["GitHub", "GitHub"],
    ok: ["一边成功", "succeeds on one"],
    fail: ["一边失败", "fails on the other"],
    unclear: ["谁也说不清", "nobody can say"],
    retry: ["再试一遍", "trying again"],
    s2Cut: ["因为请求", "A request that was sent"],
    sent: ["请求发出去了", "was sent"],
    sentName: ["发出去了", "that was sent"],
    received: ["对方收下了", "received"],
    error: ["看到报错", "an error message"],
    errorName: ["报错", "an error message"],
    nothing: ["什么都没发生", "nothing happened"],
    lCut: ["常见的办法", "The usual answer"],
    process: ["加流程", "more process"],
    register: ["登记表", "register"],
    ledger: ["台账", "ledger"],
    copyRule: ["重复的规定", "copy of the same rule"],
    keepUp: ["有人维护", "someone to keep it up"],
    stale: ["过期", "go stale"],
    fight: ["互相打架", "contradict each other"],
    burden: ["新的负担", "a burden of their own"],
  });
  // The index stands at the centre while each difficulty is introduced and at the top while it is shown. It rises on
  // the last word that begins at least 0.32 s before the words of each illustration's first mark, or 0.45 s before
  // them after a longer pause, so it has passed above the stage when the stage cuts in on those words and the stage's
  // first name stands on them, while the docked index never stands alone for long; it comes down just after the cut
  // that ends the last, so it never passes through a stage's marks.
  const riseFor = (at) => {
    let start = s.words[0].start;
    for (const w of s.words) {
      if (w.start > at - 0.32) break;
      start = w.start;
    }
    return Math.max(start + 0.05, at - 0.45);
  };
  const [upP, upE, upB] = [c.pCut, c.eCut, c.bCut].map(riseFor);
  const k =
    soon(t, upP, 0.6) -
    soon(t, c.second + 0.2, 0.6) +
    soon(t, upE, 0.6) -
    soon(t, c.third + 0.2, 0.6) +
    soon(t, upB, 0.6);
  // The kicker shows while the index is docked: it fades in over the slow end of each rise, as the heading leaves the
  // centre, and out over the slow start of each descent, as the heading returns there.
  const docked = (up, down = Infinity) =>
    ramp(t, up + 0.2, 0.35) * (1 - ramp(t, down - 0.05, 0.25));
  const kicker = docked(upP, c.second + 0.2) + docked(upE, c.third + 0.2) + docked(upB);
  // The difficulty being told at full ink, the others at the second level; in the last thought all three step back.
  const told = [
    [c.n1, c.n2 - 0.15],
    [c.n2 - 0.15, c.n3 - 0.1],
    [c.n3 - 0.1, c.lCut],
  ];
  const levels = told.map(
    ([from, to]) => ramp(t, from - 0.15, 0.4) * (1 - ramp(t, to - 0.15, 0.4)),
  );
  hardIndex(t, clamp(k), {
    heading: L("难处", "Three parts"),
    headAt: c.head,
    names: L(
      ["原意会走样", "结论超出了证据", "事实还没看清，就先动了手"],
      ["Meaning drifts", "Claims go beyond their evidence", "Changes before facts"],
    ),
    ats: [c.n1, c.n2 - 0.15, c.n3name - 0.1],
    levels,
    kicker,
  });
  // Each stage cuts in on the words of its first mark. The ledgers cut in on the words that name their shelf, more
  // process, so the shelf arrives with its name.
  const stage = (from, to) => stageIn(t, c[from]) * (to ? stageOut(t, c[to]) : 1);
  stagePerson(t, stage("pCut", "rCut"), c);
  stageRail(t, stage("rCut", "sCut"), c);
  stageSummaries(t, stage("sCut", "gCut"), c);
  stageWrongGoal(t, stage("gCut", "second"), c);
  stageClaims(t, stage("eCut", "tCut"), c);
  stageTests(t, stage("tCut", "third"), c);
  stageBranch(t, stage("bCut", "vCut"), c);
  stagePlatforms(t, stage("vCut", "s2Cut"), c);
  stageSent(t, stage("s2Cut", "process"), c);
  stageLedgers(t, stage("process", null), c);
};
