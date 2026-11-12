/* 03 What ETHOS is: a path and a small kernel. The name, the path it offers and its promises; the kernel that supports
 * the path, what it keeps and for how long; the tools and systems it relies on rather than replaces; and that all of
 * this is a design aim. */

import { stageKernel, stageLifetimes, stageScope } from "./kernel.js";
import { stageAims, stageName, stagePath } from "./path.js";
import { stageLayer, stageSystems, stageTools } from "./tools.js";
import { scenes } from "../registry.js";
import { cueFrom, cues } from "../../timing/cues.js";
import { stageIn, stageOut } from "../../timing/stages.js";

scenes["03"] = function (s, t) {
  const c = { first: s.words[0].start };
  const take = (pairs) =>
    cues(s, Object.values(pairs)).forEach((v, i) => (c[Object.keys(pairs)[i]] = v));
  take({
    // 03.1 the name.
    otherPath: ["另一条路", "a different path"],
    w1: ["证据", "Evidence-grounded"],
    w2: ["信任", "Trust"],
    w3: ["人和 Agent", "Human-Agent"],
    w4: ["工作", "Operational"],
    w5: ["打理", "Stewardship"],
    // 03.2 the path and its promises.
    // English names the travellers in the words that follow its first two, so its stage cuts in on those words.
    pCut: ["它想给", "people and interchangeable Agents"],
    // Chinese names the travellers in two clauses, the people and then the Agents; English in one phrase.
    people: ["给人", "people and interchangeable Agents"],
    agents: ["可以互相替换的 Agent", "people and interchangeable Agents"],
    reliable: ["靠得住的路", "one reliable path"],
    st1: ["弄清一个问题", "a problem"],
    st2: ["改动一个仓库", "a repository"],
    st3: ["用起来到底怎么样", "in use"],
    three: ["它承诺三件事", "It promises three things"],
    p1: ["原意不丢", "meaning is kept"],
    p2: ["拿不准的地方说清楚", "uncertainty is stated"],
    p3: ["能恢复", "the result can be recovered"],
    gov: ["多加一层治理", "More governance"],
    notPromise: ["不在它的承诺里", "is not one of its promises"],
    // 03.3 the kernel.
    // The Chinese cut falls on the clause that brings the kernel, so the kernel stands on its own words; its name
    // leads them as before. While "这条路" is said the path stays as 03.2 leaves it.
    kCut: ["靠一个", "A small trust kernel"],
    kernel: ["很小的信任内核", "a small trust kernel"],
    takes: ["内核拿三样东西", "takes three inputs"],
    in1: ["已经采纳的意图", "the intent"],
    in1q: ["已经采纳的意图", "that has been accepted"],
    in2: ["刚观察到的事实", "fresh facts"],
    in3: ["以前的记录", "attestations already on record"],
    // Chinese calls the record by its term after it: 叫“存证”.
    in3t: ["存证", "attestations already on record"],
    rules: ["按固定的规则", "by fixed rules"],
    plan: ["一份计划", "a plan"],
    writeAt: ["真要写入的那一刻", "At the moment it writes"],
    gateName: ["写入", "the moment it writes"],
    check: ["再核对一遍", "checks again"],
    recCut: ["最后把", "Then it records"],
    rec1: ["看到了什么", "what it observed"],
    rec2: ["判断了什么", "what it decided"],
    rec3: ["做了什么", "and what it did"],
    newAtt: ["新的存证", "new attestations"],
    // 03.4 lifetimes.
    // English cuts in on the words that bring the lifetimes, two words before their name, so the heading stands on it.
    lCut: ["这几样东西", "last for different"],
    lifetimes: ["寿命不一样", "different lengths of time"],
    intent: ["意图写进", "Intent is written"],
    change: ["正式变更", "one official Change"],
    afresh: ["重新编译", "compiles it afresh"],
    facts: ["事实每次", "Facts are observed"],
    again: ["每次都重新去看", "observed again every time"],
    never: ["从不存下来", "never stored"],
    planRow: ["计划要么执行", "A plan is either"],
    carried: ["要么执行", "carried out"],
    discarded: ["要么作废", "or discarded"],
    notKept: ["都不留下", "never kept"],
    again2: ["重新编译出来", "compiled again"],
    // 03.5 the attestation's scope.
    aCut: ["内核长期留下的", "The kernel keeps"],
    // English says "for the long term" at the end of its clause, 1.4 s after the kernel is named, so its heading line
    // stands from "only one thing" in that clause, and the kernel does not stand alone far left of centre.
    longTerm: ["长期留下的", "only one thing"],
    who: ["是谁出具的", "who verified it"],
    scope: ["在什么范围内成立", "where it holds"],
    scopeName: ["范围", "where it holds"],
    later: ["回头去查", "check it later"],
    outside: ["出了这个范围", "outside that scope"],
    notCount: ["就不算数", "does not count"],
    // 03.6 the tools it relies on, what they reduce, and the gap for which it writes its own.
    tCut: ["ETHOS 自己的代码", "its own code"],
    ownCode: ["ETHOS 自己的代码", "its own code"],
    oneJob: ["内核这一件事", "the kernel's one job"],
    elseAt: ["别的功能", "everything else"],
    mature: ["现成、成熟的工具", "mature tools that already exist"],
    exist: ["现成、成熟的工具", "that already exist"],
    git: ["Git", "Git"],
    reduce: ["减少总体的维护量", "to reduce total maintenance"],
    // Chinese names the gap before the tools of its own; English names its own tools first, then the gap.
    gap: ["证实有缺口", "a demonstrated gap"],
    ownTools: ["才自己写", "It writes its own tools"],
    only: ["证实有缺口", "only to fill"],
    // 03.7 the systems it leaves as they are, and what it owns in one place.
    sCut: ["ETHOS 也不接管", "ETHOS does not take over"],
    systems: ["原有的系统", "the systems you already have"],
    sys1: ["描述业务用的模型", "the model that describes your business"],
    sys2: ["持续集成", "automated checks"],
    sys3: ["运行那些 Agent 的应用", "the apps your Agents run in"],
    sys4: ["问题跟踪系统", "your issue tracker"],
    machine: ["自己的机器", "your own machine"],
    vendor: ["不依赖哪一家平台", "without depending on any one vendor"],
    connect: ["接入的系统", "connecting a system"],
    truth: ["纳入", "part of ETHOS's own record"],
    // The layer's stage cuts in on the words that open its sentence in Chinese, which name the layer, and on the words
    // of the layer's name in English, which follow the words that open the sentence, so the layer arrives named.
    layerCut: ["所有仓库共有的部分", "ETHOS owns in one place"],
    owns: ["共有的部分", "ETHOS owns in one place"],
    each: ["每个仓库", "each repository"],
    own: ["自己特有的事", "only what is its own"],
    // 03.8 the design aim.
    // The aims' stage cuts in on the thought's first words, the whole path, so the path stands on them and the
    // repositories of 03.7 never hold into 03.8; its heading stands on its own words.
    aimsCut: ["整条路", "The whole path"],
    aims: ["设计目标", "design aim"],
    docs: ["它自己的文档", "its own documents"],
    alone: ["光有这个内核", "the kernel alone"],
    // 03.8 opens on the whole path too, so the refused claim is cued on its own words.
    wholePath: ["整条路已经走通", "the whole path has been delivered"],
  });
  // The English "the attestation" of 03.5 first occurs inside 03.3's "the attestations", so it is taken after its cut.
  c.att = cueFrom(s, "只有存证", "the attestation", c.aCut);
  // The English "someone" first occurs in 03.2.
  c.reader = cueFrom(s, "后来的人", "someone", c.aCut);
  // The tools arrive on the words that turn to them in Chinese, and on the word that names them in English.
  c.toolsAt = cueFrom(s, "别的功能", "tools", c.elseAt);
  const stage = (from, to) => (from ? stageIn(t, c[from]) : 1) * (to ? stageOut(t, c[to]) : 1);
  stageName(s, t, stage(null, "pCut"), c);
  stagePath(t, stage("pCut", "kCut"), c);
  stageKernel(t, stage("kCut", "lCut"), c);
  stageLifetimes(t, stage("lCut", "aCut"), c);
  stageScope(t, stage("aCut", "tCut"), c);
  stageTools(t, stage("tCut", "sCut"), c);
  stageSystems(t, stage("sCut", "layerCut"), c);
  stageLayer(t, stage("layerCut", "aimsCut"), c);
  stageAims(t, stage("aimsCut", null), c);
};
