/* 08 one requirement's life: the scene's stages, each cut in on the first words of its idea. The journey's rail runs
 * through 08.1-08.6 on the content centre line; the corrections, their judgement, the revised model and the goal
 * kept unchanged follow as stages of their own. The whole part shows the illustrative example. */

import { illustrative } from "../../framing/chapters.js";
import { scenes } from "../registry.js";
import { cues } from "../../timing/cues.js";
import { stageIn, stageOut } from "../../timing/stages.js";
import { droppedPush } from "./dropped-push.js";
import { handoff, lane, lifeStart } from "./lane.js";
import { liveUse, overview, release } from "./release.js";
import { corrections, judgement } from "./feedback.js";
import { faultApart, goalKept, meanwhile, modelRevision, noWayAround } from "./model.js";

scenes["08"] = function (s, t) {
  const [laneAt, halfAt, proofAt, dropAt, liveAt, hereAt, daysAt] = cues(s, [
    ["研究员的要求", "The researcher's request"],
    ["做到一半", "Halfway through"],
    ["改完以后", "When the work is committed"],
    ["要是推到一半断了线", "Say the connection drops"],
    ["版本上线以后", "Once the version is live"],
    ["从这里往后", "From here on"],
    ["几天后", "A few days later"],
  ]);
  const [peopleAt, failAt, recordAt, noneAt, meanAt, goalAt] = cues(s, [
    ["负责观察的人", "The people watching"],
    ["代码出错", "A failed implementation"],
    ["同一条记录", "the idea of"],
    ["不加例外", "No exception"],
    ["依赖这个概念的改动", "changes that depend on that idea"],
    ["不能多出重复记录", "The goal"],
  ]);
  const s1 = stageOut(t, laneAt),
    s2 = stageIn(t, laneAt) * stageOut(t, halfAt),
    s3 = stageIn(t, halfAt) * stageOut(t, proofAt),
    s4 = stageIn(t, proofAt) * stageOut(t, dropAt),
    s4b = stageIn(t, dropAt) * stageOut(t, liveAt),
    s5 = stageIn(t, liveAt) * stageOut(t, hereAt),
    s5b = stageIn(t, hereAt) * stageOut(t, daysAt),
    s6 = stageIn(t, daysAt) * stageOut(t, peopleAt),
    s7 = stageIn(t, peopleAt) * stageOut(t, failAt),
    s8 = stageIn(t, failAt) * stageOut(t, recordAt),
    s8b = stageIn(t, recordAt) * stageOut(t, noneAt),
    s8c = stageIn(t, noneAt) * stageOut(t, meanAt),
    s8d = stageIn(t, meanAt) * stageOut(t, goalAt),
    s9 = stageIn(t, goalAt);
  illustrative(1);
  lifeStart(s, t, s1);
  lane(s, t, s2);
  handoff(s, t, s3);
  release(s, t, s4);
  droppedPush(s, t, s4b);
  liveUse(s, t, s5);
  overview(s, t, s5b);
  corrections(s, t, s6);
  judgement(s, t, s7);
  faultApart(s, t, s8);
  modelRevision(s, t, s8b);
  noWayAround(s, t, s8c);
  meanwhile(s, t, s8d);
  goalKept(s, t, s9);
};
