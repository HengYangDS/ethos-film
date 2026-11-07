/* 06 Rule three, authority and views. Back in the example, a second Agent's stale view meets ETHOS's check at the
 * write, and the platforms' outcomes are recorded as they are (06.1-06.2); rule three is named over that example, and
 * its statement closes the mark's boundary around what a judgment may rest on, with the views derived from it outside
 * (06.3-06.4); and a stale view is refused as authority (06.5). The Illustrative chip stands on every stage that
 * draws the example: the second Agent's case, and the views from 06.4 on, which hold the example's dashboard and its
 * opening sentence. */

import { illustrative } from "../../framing/chapters.js";
import { scenes } from "../registry.js";
import { cue, cueFrom, cues } from "../../timing/cues.js";
import { stageIn, stageOut } from "../../timing/stages.js";
import {
  authorityStage,
  notAuthorityStage,
  ruleThreeHeading,
  staleViewStage,
  viewsStage,
} from "./authority.js";
import { checkStage, oneStepStage, platformsStage, staleStage } from "./example.js";

/* The spoken cues, in the order they are said. */
function cuesOf(s) {
  const c = {
    example: cue(s, "回到例子", "Back to the example"),
    agent: cue(s, "另一个 Agent", "A second Agent"),
    remembers: cue(s, "它记得", "It remembers"),
    branch: cue(s, "分支", "the branch"),
    yesterday: cue(s, "昨天那次提交", "yesterday's commit"),
    dashboard: cue(s, "看板", "its dashboard"),
    green: cue(s, "一片绿灯", "all green"),
    plan: cue(s, "编好计划", "compiling a plan"),
    write: cue(s, "真正写入", "and writing"),
    changed: cue(s, "别人可能已经改过了", "may have changed things"),
    first1b: cue(s, "就在它要写入的那一刻", "At the very moment"),
    checks: cue(s, "ETHOS 又核对了一遍", "ETHOS checks again"),
    movedOn: cue(s, "分支已经往前走了", "the branch has moved on"),
    expected: cue(s, "跟计划里预想的不一样", "what the plan expected"),
    nothing: cue(s, "什么都不写", "nothing is written"),
    fresh: cue(s, "刚观察到的事实", "from fresh facts"),
    again: cue(s, "重新编译计划", "compiled again"),
    first2: cue(s, "核对和写入", "Checking and writing"),
    oneStep: cue(s, "一步完成", "as one step"),
    afterwards: cue(s, "写完以后", "afterwards"),
    readBack: cue(s, "把结果读回来", "the result is read back"),
    confirm: cue(s, "确认", "to confirm"),
    first2b: cue(s, "一个版本推到几个平台", "When a version is pushed"),
    version: cue(s, "一个版本", "a version"),
    several: cue(s, "几个平台", "several platforms"),
    succeeded: cue(s, "成功", "succeeded"),
    failed: cue(s, "失败", "failed"),
    pending: cue(s, "还没推", "still pending"),
    recorded: cue(s, "都照实记下来", "are all recorded"),
    together: cue(s, "要么都成功", "succeed or fail together"),
    first3: cue(s, "这就是第三条准则", "That is rule three"),
    number: cue(s, "第三条准则", "rule three"),
    statement: cue(s, "把权威依据和视图分开", "keep authority separate from views"),
    inEthos: cue(s, "在 ETHOS 里", "In ETHOS"),
    authority: cue(s, "权威依据指的是", "authority means"),
    restOn: cue(s, "一次判断可以凭借的东西", "what a judgment may rest on"),
    first4: cue(s, "摘要", "Summaries"),
    derived: cue(s, "派生", "derived"),
    areViews: cue(s, "给人看的视图", "are views"),
    thatGreen: cue(s, "那片绿灯", "like that green dashboard"),
    sentence: cue(s, "开头那句", "The sentence we began with"),
    suchReport: cue(s, "就是这样一份汇报", "just such a report"),
    first5: cue(s, "视图算出来以后", "Once a view has been computed"),
    computed: cue(s, "算出来", "has been computed"),
    change: cue(s, "情况可能又变了", "things can change"),
    notShown: cue(s, "视图上却看不出来", "without the view showing it"),
    turnedGreen: cue(s, "那片绿灯亮起来的时候", "that dashboard turned green"),
    first5b: cue(s, "视图帮人看清楚", "A view helps people see"),
    never: cue(s, "可它不是权威依据", "but it never counts as authority"),
    act: cue(s, "照着视图去改东西", "Acting on what a view shows"),
    overwrite: cue(s, "覆盖掉别人的工作", "overwrite someone else's work"),
    ambiguous: cue(s, "权威依据不明确", "When authority is ambiguous"),
    stale: cue(s, "或者条件已经过时", "or a condition has gone stale"),
    cannotPass: cue(s, "判断就不能通过", "the judgment cannot pass"),
  };
  // The branch moves on the word of the change, after the clause that names it has begun.
  c.changes = cueFrom(s, "又变了", "change", c.change);
  // The rule's mark comes in on the rule's name, on its last word, so the statement that names it is legible within
  // 0.6 s of it, and its boundary closes from there over the statement's first words.
  c.markCut = cueFrom(s, "则", "three", c.number);
  c.sources = cues(s, [
    ["用户当下的指令", "current instruction"],
    ["仓库里的真实内容", "what the repository actually contains"],
    ["已经采纳的正式变更", "the accepted Change"],
    ["刚观察到的事实", "fresh facts"],
    ["适用的规则", "the applicable policy"],
    ["仍然有效的存证", "the attestations"],
  ]);
  c.sources[3] = cueFrom(s, "刚观察到的事实", "fresh facts", c.sources[2]);
  c.views = [
    c.first4,
    cueFrom(s, "看板", "dashboards", c.first4),
    cueFrom(s, "状态输出", "status output", c.first4),
    cueFrom(s, "Agent 的汇报", "an Agent's report", c.first4),
  ];
  return c;
}

scenes["06"] = function (s, t) {
  const c = cuesOf(s);
  const J1 = stageOut(t, c.first1b),
    J2 = stageIn(t, c.first1b) * stageOut(t, c.first2),
    K1 = stageIn(t, c.first2) * stageOut(t, c.first2b),
    // Rule three is named over the example it names: the example stands until the rule's name, on which the rule's
    // stage, the mark, cuts in under the heading that has stood since the thought's first words; its boundary closes
    // on the rule's statement.
    K2 = stageIn(t, c.first2b) * stageOut(t, c.markCut),
    H3 = stageIn(t, c.first3) * stageOut(t, c.first4),
    L3 = stageIn(t, c.markCut) * stageOut(t, c.first4),
    M4 = stageIn(t, c.first4) * stageOut(t, c.first5),
    N1 = stageIn(t, c.first5) * stageOut(t, c.first5b),
    N2 = stageIn(t, c.first5b);
  if (J1 > 0) staleStage(s, t, c, J1);
  if (J2 > 0) checkStage(s, t, c, J2);
  if (K1 > 0) oneStepStage(s, t, c, K1);
  if (K2 > 0) platformsStage(s, t, c, K2);
  if (H3 > 0) ruleThreeHeading(t, c, H3);
  if (L3 > 0) authorityStage(s, t, c, L3);
  if (M4 > 0) viewsStage(s, t, c, M4);
  if (N1 > 0) staleViewStage(s, t, c, N1);
  if (N2 > 0) notAuthorityStage(s, t, c, N2);
  // The example is made up: its chip stands while the second Agent's case shows, and while the views show its dashboard
  // and its opening sentence.
  illustrative(J1 + J2 + K1 + K2 + M4 + N1 + N2);
};
