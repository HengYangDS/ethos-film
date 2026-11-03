/* 05 Rule two, distinguish only what changes action. The opening sentence returns and is taken apart into its planes
 * of evidence (05.1-05.2); rule two's heading draws the mark's two passages, the planes stand as separate evidence each
 * with its own next step, and a "done" names what was verified (05.3); a judgment's three outcomes, of which only pass
 * permits action (05.4); and a distinction that changes no action is never added (05.5). The Illustrative chip stands
 * while the opening sentence's scenario shows. */

import { illustrative } from "../../framing/chapters.js";
import { scenes } from "../registry.js";
import { cue, cueFrom } from "../../timing/cues.js";
import { stageIn, stageOut } from "../../timing/stages.js";
import { apartStage } from "./planes.js";
import { outcomesStage, refusedStage, separateStage, verifiedStage } from "./rule-two.js";

/* The spoken cues, in the order they are said. */
function cuesOf(s) {
  const c = {
    first2: cue(s, "按 ETHOS 的规则", "By ETHOS's rules"),
    apart: cue(s, "拆开来看", "taken apart"),
    local: cue(s, "在本地做的完整核验", "The local proof"),
    passed: cue(s, "通过了", "has passed"),
    forward: cue(s, "可以在本地接着往下走", "may move forward locally"),
    ci: cue(s, "GitLab 和 GitHub 上的自动检查", "The automated checks on GitLab"),
    noResult: cue(s, "还没出结果", "no result yet"),
    release: cue(s, "版本还没发布", "Nothing has been released"),
    use: cue(s, "还没有人在用", "No one is using it"),
    benefit: cue(s, "实际效益", "actual benefit"),
    noObs: cue(s, "一点观察都还没有", "no observation at all"),
    first3: cue(s, "这就是第二条准则", "That is rule two"),
    statement: cue(s, "只在影响行动的地方做区分", "distinguish only what changes action"),
    separate: cue(s, "各自独立的证据", "separate planes of evidence"),
    nextStep: cue(s, "允许做的下一步都不一样", "permits a different next step"),
    first3b: cue(s, "其中一样通过了", "One of them passing"),
    another: cue(s, "推不出另一样也通过", "never means another has passed"),
    verified: cue(s, "实际确认过的", "were verified this time"),
    saysDone: cue(s, "所以说做完了", "says done"),
    tell: cue(s, "要讲明", "they need to say"),
    first4: cue(s, "一次判断的结果", "A judgment too"),
    three: cue(s, "只分三种", "only three outcomes"),
    block: cue(s, "拦下", "block and unknown"),
    unknown: cue(s, "未知", "unknown"),
    missing: cue(s, "缺了", "Missing or unverifiable"),
    conflict: cue(s, "有冲突", "a conflict or an explicit failure"),
    isUnknownToo: cue(s, "结果是未知", "make it unknown"),
    isBlock: cue(s, "结果是拦下", "makes it block"),
    onlyPass: cue(s, "只有通过", "Only pass"),
    ahead: cue(s, "才允许动手", "lets the work go ahead"),
    never: cue(s, "从来不等于可以", "never permission"),
    example: cue(s, "比如 GitLab 和 GitHub 上的检查", "Take the checks on GitLab"),
    isUnknown: cue(s, "这一项就是未知", "their result is unknown"),
    noProblem: cue(s, "不能算作没有问题", "does not count as no problem"),
    first5: cue(s, "反过来", "And a distinction"),
    distinction: cue(s, "一个区分", "a distinction"),
    sixth: cue(s, "改变不了任何行动", "would not change any action"),
    never2: cue(s, "就不去加它", "is never added"),
    oneMore: cue(s, "多一样要记着的东西", "one more thing to keep track of"),
    changesNone: cue(s, "改变不了行动的区分", "one that changes no action"),
    matter: cue(s, "真正要紧的那几个", "the ones that matter"),
  };
  c.pass = cueFrom(s, "通过", "pass", c.first4);
  c.notYet = cueFrom(s, "还没出结果", "have not reported yet", c.example);
  return c;
}

scenes["05"] = function (s, t) {
  const c = cuesOf(s);
  const A = stageOut(t, c.first3),
    G1 = stageIn(t, c.first3) * stageOut(t, c.first3b),
    G2 = stageIn(t, c.first3b) * stageOut(t, c.first4),
    H = stageIn(t, c.first4) * stageOut(t, c.first5),
    I = stageIn(t, c.first5);
  if (A > 0) apartStage(s, t, c, A);
  if (G1 > 0) separateStage(s, t, c, G1);
  if (G2 > 0) verifiedStage(s, t, c, G2);
  if (H > 0) outcomesStage(s, t, c, H);
  if (I > 0) refusedStage(s, t, c, I);
  // The opening sentence's scenario is made up: its chip stands while the sentence is taken apart.
  illustrative(A);
};
