/* The canvas the film draws on and the drawing state of the frame being drawn, which the playback sets. */

const canvas = document.getElementById("picture");
/* The drawing context; the search for a scene's first legible label swaps in a measuring context while it surveys the opening. */
export let ctx = canvas.getContext("2d", { alpha: false });
export const resolution = Number(document.getElementById("film").dataset.width) / 1920;
export let layout = { texts: [], scene: null };
export let sceneFade = 1,
  wordFade = 1;
/* A measuring context records where a scene paints without drawing it; the search for each scene's first legible label
 * draws into one. */
export let measuring = false;
/* The playback sets the drawing state for each frame and scene: the context drawn into, the frame's layout record,
 * the fades of the scene being drawn and whether a measuring pass is running. */
export function setDrawing(next) {
  if ("ctx" in next) ctx = next.ctx;
  if ("layout" in next) layout = next.layout;
  if ("sceneFade" in next) sceneFade = next.sceneFade;
  if ("wordFade" in next) wordFade = next.wordFade;
  if ("measuring" in next) measuring = next.measuring;
}
