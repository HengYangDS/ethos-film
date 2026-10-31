/* Stage cuts: one stage hands the picture to the next on a word. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { layout } from "../canvas.js";

/* Within a scene one stage hands the picture to the next in a cut on the word that names the incoming stage's first
 * mark: the outgoing stage holds its words and marks until 0.18 s after that word begins, and the incoming stage
 * replaces it from that frame. The two stages never stand together, so no label meets the other stage's marks and
 * nothing ghosts, and the frame never passes through bare ground. */
export const STAGE_CUT = 0.18;
/* Every cut a scene declares is kept per scene, so a list can be whole again before the stage that holds it leaves. */
export const stageCuts = new Map();
const declareCut = (at) => {
  const id = layout.scene;
  if (id === null) return;
  const v = stageCuts.get(id) ?? new Set();
  v.add(at);
  stageCuts.set(id, v);
};
export const stageOut = (t, word) => {
  declareCut(word + STAGE_CUT);
  return t < word + STAGE_CUT ? 1 : 0;
};
export const stageIn = (t, word) => {
  declareCut(word + STAGE_CUT);
  return t < word + STAGE_CUT ? 0 : 1;
};
