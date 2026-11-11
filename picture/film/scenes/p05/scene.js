/* 05 Rule two, distinguish only what changes action. The opening sentence returns and is taken apart into its planes
 * of evidence (05.1-05.2); rule two's heading draws the mark's two passages, the planes stand as separate evidence each
 * with its own next step, and a "done" names what was verified (05.3); local proof's trust boundary, which only an
 * independent identity can cross (05.4); a judgment's three outcomes, of which only pass permits action (05.5); what
 * every result other than pass says (05.6); and a distinction that changes no action is never added (05.7). The
 * Illustrative chip stands on every stage that draws the opening sentence: while it is taken apart, and while it says
 * "done" beside the planes. */

import { illustrative } from "../../framing/chapters.js";
import { scenes } from "../registry.js";
import { cue, cueFrom } from "../../timing/cues.js";
import { stageIn, stageOut } from "../../timing/stages.js";
import { boundaryStage } from "./boundary.js";
import { nonPassStage } from "./non-pass.js";
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
    noObs: cue(s, "一点都还没观察过", "no observation at all"),
    first3: cue(s, "这就是第二条准则", "That is rule two"),
    statement: cue(s, "只在会改变行动的地方做区分", "distinguish only what changes action"),
    separate: cue(s, "各自独立的证据", "separate planes of evidence"),
    nextStep: cue(s, "允许做的下一步都不一样", "permits a different next step"),
    first3b: cue(s, "其中一样通过了", "One of them passing"),
    another: cue(s, "推不出另一样也通过", "never means another has passed"),
    verified: cue(s, "这一次确认过的", "were verified this time"),
    saysDone: cue(s, "谁报告做完了", "says done"),
    tell: cue(s, "要讲明", "they need to say"),
    edgeFirst: cue(s, "本地核验还有一条边界", "Local proof has one more boundary"),
    edge: cue(s, "还有一条边界", "one more boundary"),
    edgeWord: cue(s, "边界", "boundary"),
    account: cue(s, "同一个账户", "the same account"),
    produces: cue(s, "产生证据的程序", "what produces the evidence"),
    checks: cue(s, "核对证据的程序", "what checks it"),
    alone: cue(s, "光靠本地核验", "local proof alone"),
    forgery: cue(s, "排除不了伪造", "cannot rule out forgery"),
    independent: cue(s, "另一个独立控制的账户", "an independently controlled identity"),
    rerun: cue(s, "重跑一遍", "a re-run"),
    whether: cue(s, "要不要做", "whether one is needed"),
    risk: cue(s, "看风险、规定，还有结论的范围", "depends on the risk, the policy and the scope of the claim"),
    first4: cue(s, "一次判断的结果", "A judgment too"),
    three: cue(s, "只分三种", "only three outcomes"),
    block: cue(s, "拦下", "block and unknown"),
    unknown: cue(s, "未知", "unknown"),
    missing: cue(s, "缺了", "Missing or unverifiable"),
    conflict: cue(s, "有冲突", "a conflict, an explicit failure"),
    isUnknownToo: cue(s, "结果是未知", "make it unknown"),
    isBlock: cue(s, "结果是拦下", "makes it block"),
    onlyPass: cue(s, "只有通过", "Only pass"),
    ahead: cue(s, "才允许动手", "lets the work go ahead"),
    never: cue(s, "暂不动手", "it waits"),
    example: cue(s, "比如 GitLab 和 GitHub 上的检查", "Take the checks on GitLab"),
    isUnknown: cue(s, "这一项就是未知", "their result is unknown"),
    anyProblem: cue(s, "有没有问题", "whether there is a problem"),
    nonPassFirst: cue(
      s,
      "按 ETHOS 的设计，只要不是通过",
      "ETHOS is designed so that any result other than pass",
    ),
    notPass: cue(s, "只要不是通过", "any result other than pass"),
    happened: cue(s, "发生了什么", "what happened"),
    why: cue(s, "为什么停下", "why that step stopped"),
    evidence: cue(s, "证据是什么", "its evidence"),
    nextSafe: cue(s, "下一步做什么才安全", "the one safe next action"),
    person: cue(s, "要不要人来决定", "whether a person has to decide"),
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
    G2 = stageIn(t, c.first3b) * stageOut(t, c.edgeFirst),
    B = stageIn(t, c.edgeFirst) * stageOut(t, c.first4),
    H = stageIn(t, c.first4) * stageOut(t, c.nonPassFirst),
    N = stageIn(t, c.nonPassFirst) * stageOut(t, c.first5),
    I = stageIn(t, c.first5);
  if (A > 0) apartStage(s, t, c, A);
  if (G1 > 0) separateStage(s, t, c, G1);
  if (G2 > 0) verifiedStage(s, t, c, G2);
  if (B > 0) boundaryStage(s, t, c, B);
  if (H > 0) outcomesStage(s, t, c, H);
  if (N > 0) nonPassStage(s, t, c, N);
  if (I > 0) refusedStage(s, t, c, I);
  // The opening sentence's scenario is made up: its chip stands while the sentence is taken apart and while it stands
  // beside the planes as the "done" that names what was verified.
  illustrative(A + G2);
};
