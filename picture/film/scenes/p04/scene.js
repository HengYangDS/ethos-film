/* 04 Rule one, keep the meaning. The design contract's four rules and the made-up example that carries them (04.1-04.3),
 * then rule one: the mark's origin, the smallest model that is enough, one Change, the examples that test it, the
 * constraints accounted for and the leads that are not authority (04.4-04.6). Each stage cuts in on its thought's first
 * words; the Illustrative chip stands wherever the example's own objects show. */

import { illustrative } from "../../framing/chapters.js";
import { scenes } from "../registry.js";
import { cue, cueFrom } from "../../timing/cues.js";
import { ramp } from "../../timing/easing.js";
import { stageIn, stageOut } from "../../timing/stages.js";
import {
  contractStage,
  deleteStage,
  exampleStage,
  handoffStage,
  replaceStage,
  requestStage,
} from "./example.js";
import { compileStage, constraintsStage, examplesStage, leadsStage } from "./accounting.js";
import { changeStage, modelStage, readersStage } from "./rule-one.js";

/* The spoken cues of each stage, in the order they are said. */
function cuesOf(s) {
  const c = {
    ethos: cue(s, "ETHOS", "So why is ETHOS"),
    contract: cue(s, "产品设计契约", "Product Design Contract"),
    rules: cue(s, "四条判断的准则", "four rules of judgment"),
    first1b: cue(s, "下面用一个例子", "and one example"),
    example: cue(s, "一个例子", "one example"),
    madeUp: cue(s, "例子是假设的", "The example is made up"),
    idea: cue(s, "只为说明道理", "to show the idea"),
    measured: cue(s, "实测", "a measured case"),
    first2: cue(s, "有一条行情", "There is a"),
    pipe: cue(s, "行情数据管线", "market-data pipeline"),
    runAgain: cue(s, "可以再跑一遍", "can be run again"),
    researcher: cue(s, "研究员", "A researcher"),
    dup: cue(s, "不能多出重复的记录", "must not add duplicate records"),
    corrected: cue(s, "厂商更正过", "any value the vendor"),
    first3: cue(s, "经过两次交接", "After two handoffs"),
    handoffs: cue(s, "两次交接", "two handoffs"),
    summary: cue(s, "一个 Agent 写的总结", "an Agent's summary"),
    summaryName: cue(s, "总结", "an Agent's summary"),
    single: cue(s, "只剩下一句", "a single line"),
    oneLine: cue(s, "一句", "a single line"),
    quote: cue(s, "按股票代码和日期去重", "Deduplicate by stock code and date"),
    follow: cue(s, "照这句话去做", "Followed to the letter"),
    corrections: cue(s, "最该留下的那些更正", "the corrections that had to stay"),
    deleted: cue(s, "恰好会被删掉", "would delete exactly"),
    deletedName: cue(s, "被删掉", "would delete exactly"),
    first3c: cue(s, "总结能让人读得快", "The summary made reading faster"),
    fast: cue(s, "读得快", "reading faster"),
    replace: cue(s, "顶替了原话", "takes the place"),
    original: cue(s, "顶替了原话", "the original words"),
    noOne: cue(s, "没人再回头看原话", "no one goes back"),
    first4: cue(s, "第一条准则", "Rule one"),
    statement: cue(s, "用刚好够用的模型", "preserve meaning"),
    keep: cue(s, "留住原意", "that is enough"),
    enough: cue(s, "刚好够用", "preserve meaning"),
    structure: cue(s, "这里说的模型", "smallest model"),
    concepts: cue(s, "概念和结构", "the concepts and structure"),
    big: cue(s, "模型大了", "bigger than it needs to be"),
    unneeded: cue(s, "用不上的概念", "concepts they do not need"),
    small: cue(s, "小到装不下原意", "too small"),
    lost: cue(s, "半路丢掉", "the meaning is lost"),
    first4b: cue(s, "做法是", "The intent goes into"),
    intent: cue(s, "意图", "The intent"),
    into: cue(s, "写进一份正式变更", "goes into"),
    change: cue(s, "正式变更", "one official Change"),
    only: cue(s, "只写在这一处", "only there"),
    f1: cue(s, "要解决什么", "what is to be solved"),
    first5: cue(s, "只写在一处", "With one copy"),
    readers: cue(s, "后面接手的人和 Agent", "everyone who picks up"),
    readersWho: cue(s, "后面接手的人和 Agent", "who picks up the work"),
    same: cue(s, "同一份", "the same thing"),
    first5b: cue(s, "还要拿正例和反例", "Then positive and negative"),
    examples: cue(s, "正例和反例", "positive and negative examples"),
    understood: cue(s, "来考一考对它的理解", "test how it has been understood"),
    exact: cue(s, "一模一样的重复", "An exact repeat"),
    correction: cue(s, "同一天", "A correction to the same stock"),
    fails: cue(s, "过不了第二个例子", "fails that second example"),
    saved: cue(s, "保住了", "saved"),
    first6: cue(s, "原话里相关的每一条约束", "Every relevant constraint"),
    constraint: cue(s, "相关的每一条约束", "Every relevant constraint"),
    accounted: cue(s, "都要有个交代", "accounted for"),
    kept: cue(s, "要么留下", "kept excluded"),
    excluded: cue(s, "经授权明确排除", "excluded by an authorized decision"),
    unresolved: cue(s, "标明还没解决", "marked as unresolved"),
    first6b: cue(s, "理解随时可以被质疑", "The interpretation always"),
    interpretation: cue(s, "理解随时", "The interpretation"),
    challenge: cue(s, "可以被质疑", "open to challenge"),
    confirmed: cue(s, "人确认过", "a person has confirmed"),
    confirmedQual: cue(s, "确认过", "has confirmed"),
    accepted: cue(s, "采纳了的", "and accepted"),
    compiled: cue(s, "按固定的规则编译", "compiled into"),
    fixed: cue(s, "按固定的规则编译", "by fixed rules"),
    checks: cue(s, "检查", "checks"),
    sameInput: cue(s, "同样的输入", "the same input"),
    sameChecks: cue(s, "同样的检查", "the same checks"),
    cannot: cue(s, "证明不了", "cannot prove"),
    first6c: cue(s, "所以对话", "That is why conversations"),
    talk: cue(s, "对话", "conversations"),
    memory: cue(s, "记忆", "memories"),
    leads: cue(s, "只是线索", "only leads"),
  };
  c.goes = cueFrom(s, "要去掉", "goes", c.exact);
  c.stays = cueFrom(s, "要留下", "stays", c.correction);
  c.quote2 = cueFrom(s, "按股票代码和日期去重", "Deduplicate by stock code and date", c.correction);
  c.summaries = cueFrom(s, "总结", "summaries", c.memory);
  // 04.6 names the original words again; their first occurrence is 04.3's.
  c.originalAgain = cueFrom(s, "原话", "the original words", c.first6);
  c.f2 = cueFrom(s, "为什么要解决", "why", c.f1);
  c.f3 = cue(s, "做到什么样才算解决", "what counts as solved");
  return c;
}

scenes["04"] = function (s, t) {
  const c = cuesOf(s);
  // Stages, each cut in on the first words of its thought or of its turn within one.
  const A = stageOut(t, c.first1b),
    A2 = stageIn(t, c.first1b) * stageOut(t, c.first2),
    B = stageIn(t, c.first2) * stageOut(t, c.first3),
    C1 = stageIn(t, c.first3) * stageOut(t, c.follow),
    C2 = stageIn(t, c.follow) * stageOut(t, c.first3c),
    C3 = stageIn(t, c.first3c) * stageOut(t, c.first4),
    D1 = stageIn(t, c.first4) * stageOut(t, c.first4b),
    D2 = stageIn(t, c.first4b) * stageOut(t, c.first5),
    E1 = stageIn(t, c.first5) * stageOut(t, c.first5b),
    E2 = stageIn(t, c.first5b) * stageOut(t, c.first6),
    F1 = stageIn(t, c.first6) * stageOut(t, c.first6b),
    F2 = stageIn(t, c.first6b) * stageOut(t, c.first6c),
    F3 = stageIn(t, c.first6c);
  if (A > 0) contractStage(s, t, c, A);
  if (A2 > 0) exampleStage(s, t, c, A2);
  if (B > 0) requestStage(s, t, c, B);
  if (C1 > 0) handoffStage(s, t, c, C1);
  if (C2 > 0) deleteStage(s, t, c, C2);
  if (C3 > 0) replaceStage(s, t, c, C3);
  if (D1 > 0) modelStage(s, t, c, D1);
  if (D2 > 0) changeStage(s, t, c, D2);
  if (E1 > 0) readersStage(s, t, c, E1);
  if (E2 > 0) examplesStage(s, t, c, E2);
  if (F1 > 0) constraintsStage(s, t, c, F1);
  if (F2 > 0) compileStage(s, t, c, F2);
  if (F3 > 0) leadsStage(s, t, c, F3);
  // The example is made up: its chip stands from the words that say so while the example's objects show.
  const shown = A2 * ramp(t, c.madeUp - 0.15, 0.4) + B + C1 + C2 + C3 + E2;
  illustrative(shown);
};
