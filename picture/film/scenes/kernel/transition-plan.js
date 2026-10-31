/* 08 the kernel. */

import { ctx } from "../../canvas.js";
import { laneTrack, writeGate } from "../../drawing/lanes.js";
import { along, link, rounded } from "../../drawing/links.js";
import { box, dot, fill, line, measure, path, ring, stroke } from "../../drawing/strokes.js";
import { check, clock, documentIcon, seal } from "../../drawing/symbols.js";
import { folderIcon, kernelIcon } from "../../drawing/workspace.js";
import { clearOfTitle } from "../../framing/chapters.js";
import { listIn, listLevel, named, speaking } from "../../naming/lists.js";
import { NAME_GAP, NOTE, growName, nameText } from "../../naming/names.js";
import { LABEL, P } from "../../palette.js";
import { scenes } from "../registry.js";
import { L, en } from "../../timeline.js";
import { cue, cueFrom, cues } from "../../timing/cues.js";
import { clamp, mix, ramp, soon } from "../../timing/easing.js";
import { voiceTime } from "../../timing/pauses.js";
import { stageIn, stageOut } from "../../timing/stages.js";

/* A temporary value: a card with its name, which fades as the value is discarded. `titleAlpha` lets the name follow
 * its own words after the note that describes it. */
function transientCard(
  x,
  y,
  w,
  h,
  name,
  note,
  {
    alpha = 1,
    inkAlpha = alpha,
    titleAlpha = inkAlpha,
    gone = 0,
    color = P.evidence,
    set = null,
  } = {},
) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, {
    fill: P.row,
    stroke: color,
    alpha: alpha * (1 - gone * 0.7),
    radius: 12,
    width: 2.5,
  });
  nameText(name, x, y - 22, { color, alpha: titleAlpha * (1 - gone * 0.3), bold: true, set });
  nameText(note, x, y + 24, {
    size: NOTE,
    color: P.muted,
    alpha: inkAlpha * (1 - gone * 0.3),
    width: w - 30,
    set,
  });
}
/* The kernel's values on one shelf that runs to `end`: the three temporary values as cards, each in its colour, their
 * fill one mark. `gone` fades the three away. */
function s08Values(xs, end, y, { alpha = 1, gone = 0, w = 150, h = 92 } = {}) {
  if (alpha < 0.01) return;
  const temporary = alpha * (1 - clamp(gone)),
    colours = [P.authority, P.evidence, P.evidence];
  line(xs[0] - w / 2 - 30, y + h / 2, end, y + h / 2, { color: P.muted, alpha, width: 3 });
  if (temporary < 0.01) return;
  fill(() => xs.forEach((x) => ctx.roundRect(x - w / 2, y - h / 2, w, h, 12)), {
    color: P.row,
    alpha: temporary,
  });
  xs.forEach((x, i) =>
    stroke(() => ctx.roundRect(x - w / 2, y - h / 2, w, h, 12), {
      color: colours[i],
      alpha: temporary,
      width: 2.5,
    }),
  );
}
scenes["08"] = function (s, t) {
  const [small] = cues(s, [["很小的信任内核", "a small trust kernel"]]);
  const [what, inA, inB, inC, plan, carry, newRec] = cues(s, [
    ["内核做的事", "What it does"],
    ["已经采纳的意图", "accepted intent"],
    ["刚观察到的事实", "freshly observed facts"],
    ["以前留下的核验记录", "earlier verification records"],
    ["编译出一份计划", "compiles one plan"],
    ["执行这份计划", "carries it out"],
    ["写下新的核验记录", "writes new verification"],
  ]);
  const [fromChange, criteriaAt, compileAt, comm] = cues(s, [
    ["采纳的意图来自", "Accepted intent comes"],
    ["验收条件", "acceptance criteria"],
    ["编译成一个临时", "compiles its"],
    ["Commitment", "the Commitment"],
  ]);
  const [temp, discard] = cues(s, [
    ["这三样都是临时的", "All three are temporary"],
    ["用完就丢", "then discarded"],
  ]);
  const [persist, remain, verifier, limits] = cues(s, [
    ["内核用到的这些值里", "Of the kernel's values"],
    ["真正留下来的", "the only one that persists"],
    ["哪个检验程序", "which verifier"],
    ["在什么范围内成立", "within which limits"],
  ]);
  const record = en ? cue(s, "", "the Attestation") : cueFrom(s, "核验记录", "", remain),
    attest = cue(s, "Attestation", "the Attestation");
  const doneAts = en
    ? cues(s, [
        ["", "what was observed"],
        ["", "judged"],
        ["", "proved"],
        ["", "or done"],
      ])
    : cues(s, [
        ["一次观察", ""],
        ["一项判断", ""],
        ["一次证明", ""],
        ["一次改动", ""],
      ]);
  const factsCard = en ? cue(s, "", "The fresh observations") : cue(s, "刚观察到的事实叫", ""),
    planCard = en ? cue(s, "", "the compiled plan") : cue(s, "的计划叫", "");
  // English describes the Facts and the TransitionPlan before it names them.
  const titleAts = en
    ? [comm, cue(s, "", "are the Facts"), cue(s, "", "is the TransitionPlan")]
    : null;
  const stageA = stageOut(t, what),
    stageB = stageIn(t, what) * stageOut(t, fromChange),
    stageC = stageIn(t, fromChange) * stageOut(t, persist),
    stageD = stageIn(t, persist);
  // Everything so far rests on one small mark: the Change, a lane and a check stand on one shelf, named as this
  // approach from the first word, and the kernel arrives under the shelf with its name.
  if (stageA > 0) {
    const g = stageA * clearOfTitle(s, t, 340),
      KX = 960,
      KY = 600,
      KR = 72,
      TOP = 380,
      k = g * ramp(t, small - 0.15, 0.4);
    box(600, TOP + 108, 720, 14, { fill: P.line, alpha: g, radius: 7 });
    folderIcon(660, TOP + 24, 110, 84, { alpha: g, color: P.ink });
    laneTrack(840, 1080, TOP + 82, { alpha: g, flow: (voiceTime(t) * 0.4) % 1 });
    writeGate(1230, TOP + 54, 108, { alpha: g, color: P.ink, single: true });
    nameText(L("这套做法", "All of this"), 960, TOP - NAME_GAP, {
      valign: "bottom",
      alpha: stageA * named(t, s.voice_start),
    });
    kernelIcon(KX, KY, KR, { alpha: k });
    nameText(L("很小的信任内核", "A small trust kernel"), KX, KY + KR + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageA * named(t, small),
    });
  }
  // The one sentence: three inputs enter the kernel, one plan leaves it, the plan is carried out, and a new record joins
  // the records that a later decision will read.
  if (stageB > 0) {
    const ats = [inA, inB, inC],
      ys = [320, 480, 640],
      IX = 360,
      KX = 800,
      KR = 84,
      PX = 1130,
      EX = 1370,
      RX = 1600,
      Y = 480,
      q = (voiceTime(t) * 0.45) % 1;
    const names = en
      ? ["Accepted intent", "Freshly observed facts", "Earlier verification records"]
      : ["已经采纳的意图", "刚观察到的事实", "以前留下的核验记录"];
    line(IX + 44, Y, RX - 30, Y, { color: P.muted, alpha: stageB, width: 3 });
    kernelIcon(KX, Y, KR, { alpha: stageB, beat: speaking(t, [plan], 0) });
    nameText(L("内核", "The trust kernel"), KX, Y + KR + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageB,
    });
    ats.forEach((at, i) => {
      const on = stageB * ramp(t, at - 0.15, 0.4),
        y = ys[i],
        c = [P.authority, P.evidence, P.ink][i];
      if (i === 0) documentIcon(IX - 32, y - 40, 64, 80, { alpha: on, rows: 3, stroke: c });
      if (i === 1)
        [
          [-16, -12],
          [14, -18],
          [-8, 12],
          [18, 14],
        ].forEach(([dx, dy]) => dot(IX + dx, y + dy, 8, { color: c, alpha: on }));
      if (i === 2) {
        seal(IX - 8, y - 6, 26, { alpha: on, color: c });
        seal(IX + 8, y + 8, 26, { alpha: on, color: c });
      }
      nameText(names[i], IX, y + 40 + 10, {
        valign: "top",
        width: 360,
        alpha: stageB * listIn(t, ats, i),
        color: c,
        set: "inputs",
      });
      link(IX + 44, y, KX - KR * 0.86, Y + (i - 1) * 34, {
        route: "hvh",
        mid: KX - KR - 70,
        alpha: on,
        upto: soon(t, at + 0.05, 0.5),
        flow: q,
        color: c === P.ink ? P.line : c,
      });
    });
    const pl = stageB * ramp(t, plan - 0.15, 0.4),
      ca = stageB * ramp(t, carry - 0.15, 0.4),
      ne = stageB * ramp(t, newRec - 0.15, 0.4);
    link(KX + KR * 0.9, Y, PX - 44, Y, { alpha: pl, upto: soon(t, plan, 0.4), flow: q });
    documentIcon(PX - 44, Y - 58, 88, 116, { alpha: pl, rows: 3, stroke: P.evidence });
    nameText(L("一份计划", "One plan"), PX, Y + 58 + NAME_GAP, {
      valign: "top",
      alpha: stageB * named(t, plan),
    });
    link(PX + 44, Y, EX - 34, Y, { alpha: ca, upto: soon(t, carry, 0.4), flow: q });
    ring(EX, Y, 34, { color: P.ink, alpha: ca, width: 2.5 });
    stroke(
      () => {
        ctx.moveTo(EX - 10, Y - 15);
        ctx.lineTo(EX + 15, Y);
        ctx.lineTo(EX - 10, Y + 15);
        ctx.closePath();
      },
      { color: P.ink, alpha: ca, width: 2.5 },
    );
    nameText(L("执行", "Carried out"), EX, Y + 34 + NAME_GAP + 24, {
      valign: "top",
      alpha: stageB * named(t, carry),
    });
    link(EX + 34, Y, RX - 30, Y, { alpha: ne, upto: soon(t, newRec, 0.4), flow: q });
    seal(RX, Y, 30, { alpha: ne });
    nameText(L("新的核验记录", "New records"), RX, Y + 34 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      width: 200,
      alpha: stageB * named(t, newRec),
    });
    const back = rounded(
      [
        [RX + 30, Y],
        [RX + 110, Y],
        [RX + 110, 770],
        [IX - 200, 770],
        [IX - 200, ys[2]],
        [IX - 34, ys[2]],
      ],
      18,
    );
    path(along(back, soon(t, newRec + 0.5, 1.2)).kept, { color: P.line, alpha: ne, width: 2 });
  }
  // Commitment, Facts and TransitionPlan are three cards, each from its source and each on the words that say what it
  // holds. They serve this one decision and then fade to their outlines.
  if (stageC > 0) {
    const ats = [comm, factsCard, planCard],
      xs = [420, 960, 1500],
      Y = 590,
      W = 400,
      H = 140,
      gone = soon(t, discard, 0.6),
      KX = 960,
      KY = mix(420, 310, soon(t, comm - 0.3, 0.5)),
      KR = 62,
      q = (voiceTime(t) * 0.45) % 1;
    const names = ["Commitment", "Facts", "TransitionPlan"],
      notes = en
        ? [
            "The acceptance criteria, compiled",
            "The fresh observations",
            "The plan compiled from them",
          ]
        : ["验收条件编译成的值", "刚观察到的事实", "编译出来的计划"];
    kernelIcon(KX, KY, KR, { alpha: stageC, beat: speaking(t, [compileAt], 0) });
    folderIcon(xs[0] - 55, KY - 42, 110, 84, { alpha: stageC, color: P.authority });
    nameText(L("正式变更", "The official Change"), xs[0], KY + 42 + NAME_GAP, {
      valign: "top",
      color: P.authority,
      alpha: stageC,
    });
    link(xs[0] + 55, KY, KX - KR, KY, { alpha: stageC, flow: q, color: P.authority });
    // On the words that name them, the acceptance criteria leave the Change for the kernel, which compiles them.
    documentIcon(mix(xs[0] + 70, KX - KR - 50, soon(t, criteriaAt - 0.1, 1.2)), KY - 26, 40, 52, {
      alpha: stageC * ramp(t, criteriaAt - 0.15, 0.3) * (1 - soon(t, criteriaAt + 1, 0.3)),
      rows: 3,
      stroke: P.authority,
    });
    [
      [-30, -22],
      [24, -30],
      [-12, 16],
      [34, 18],
    ].forEach(([dx, dy]) => dot(xs[2] + dx, KY + dy, 9, { color: P.evidence, alpha: stageC }));
    link(xs[2] - 56, KY, KX + KR, KY, { alpha: stageC, flow: q, color: P.evidence });
    ats.forEach((at, i) => {
      const on = stageC * ramp(t, at - 0.15, 0.4);
      transientCard(xs[i], Y, W, H, names[i], notes[i], {
        alpha: on,
        inkAlpha: on * listLevel(t, ats, i),
        titleAlpha: on * listLevel(t, ats, i) * (titleAts ? named(t, titleAts[i]) : 1),
        gone,
        color: i ? P.evidence : P.authority,
        set: "values",
      });
      link(KX, KY + KR, xs[i], Y - H / 2, {
        route: "vhv",
        mid: Y - H / 2 - 44,
        alpha: on,
        upto: soon(t, at, 0.5),
        color: P.line,
      });
    });
    const tm = stageC * ramp(t, temp - 0.15, 0.4);
    clock(960 - 260, Y + H / 2 + 56, 30, { alpha: tm, color: P.muted, hand: gone * 0.9 });
    nameText(L("临时的，只用这一次", "Temporary: one decision only"), 960 - 210, Y + H / 2 + 56, {
      align: "left",
      alpha: tm,
    });
    nameText(L("用完就丢", "Then discarded"), 960 + 240, Y + H / 2 + 56, {
      align: "left",
      size: NOTE,
      color: P.muted,
      alpha: stageC * named(t, discard),
    });
  }
  // One value persists: the kernel's values stand on one shelf, the three temporary ones leave, and the record that
  // stays grows into the Attestation, a solid sealed card whose fields say what it records, which verifier produced it
  // and within which limits it holds; the first field builds as its parts are said.
  if (stageD > 0) {
    const xs = [600, 800, 1000],
      RX = 1240,
      SY = 470,
      grow = soon(t, record + 0.05, 0.6),
      shelf = stageD * (1 - ramp(t, record + 0.05, 0.4));
    s08Values(xs, RX + 105, SY, { alpha: shelf, gone: ramp(t, remain + 0.05, 0.6) });
    nameText(L("这些值", "The kernel's values"), 920, SY + 46 + NAME_GAP + 4, {
      valign: "top",
      alpha: shelf,
    });
    const parts = en
      ? ["What was observed", ", judged", ", proved", " or done"]
      : ["记下观察", "、判断", "、证明", "或改动"];
    const rows = [
      parts.join(""),
      ...(en
        ? ["Which verifier produced it", "Within which limits it holds"]
        : ["出自哪个检验程序", "结论在什么范围内成立"]),
    ];
    const ats = [doneAts[0], verifier, limits],
      W = Math.max(780, 104 + Math.max(...rows.map((v) => measure(v))) + 60);
    const left = mix(RX - 75, 960 - W / 2, grow),
      top = mix(SY - 46, 350, grow),
      width = mix(150, W, grow);
    const H = mix(92, 150 + ats.reduce((v, at) => v + soon(t, at - 0.5, 0.4), 0) * 58, grow);
    box(left, top, width, H, {
      fill: P.row,
      stroke: P.authority,
      alpha: stageD,
      radius: mix(12, 16, grow),
      width: 3.5,
    });
    seal(left + width - mix(75, 74, grow), top + mix(46, 74, grow), mix(26, 44, grow), {
      alpha: stageD,
    });
    const full = clamp((grow - 0.75) / 0.25);
    nameText(L("核验记录", "Attestation"), left + 54, top + 64, {
      align: "left",
      color: P.authority,
      alpha: stageD * named(t, record) * full,
      bold: true,
    });
    if (!en)
      nameText("Attestation", left + 54 + measure("核验记录", LABEL, true) + 18, top + 64, {
        align: "left",
        size: NOTE,
        color: P.muted,
        alpha: stageD * named(t, attest) * full,
      });
    ats.forEach((at, i) => {
      const y = top + 142 + i * 58,
        on = stageD * ramp(t, at - 0.15, 0.4);
      check(left + 72, y + 1, 22, { alpha: on, color: P.evidence });
      if (i === 0)
        growName(t, parts, doneAts, left + 104, y, {
          valign: "middle",
          build: true,
          alpha: stageD * listLevel(t, ats, i),
          set: "record",
        });
      else
        nameText(rows[i], left + 104, y, {
          align: "left",
          alpha: stageD * listIn(t, ats, i),
          set: "record",
        });
    });
  }
};
