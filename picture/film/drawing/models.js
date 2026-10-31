/* The model: concepts and structures drawn as one grid of cells. */

import { ctx } from "../canvas.js";
import { box, stroke } from "./strokes.js";
import { P } from "../palette.js";

/* A model drawn as a small grid of concepts, as one mark. `cell` lights one cell, and `grow` widens it. */
export function modelGrid(
  x,
  y,
  w,
  h,
  { alpha = 1, color = P.ink, cell = null, lit = 0, grow = 0 } = {},
) {
  if (alpha < 0.01) return;
  const cols = 4,
    rows = 3,
    cw = w / cols,
    ch = h / rows;
  stroke(
    () => {
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          ctx.roundRect(x + i * cw + 4, y + j * ch + 4, cw - 8, ch - 8, 6);
    },
    { color, alpha, width: 2.5 },
  );
  if (cell) {
    const [i, j] = cell,
      gx = cw * grow * 0.9,
      gy = ch * grow * 0.5;
    box(x + i * cw + 4, y + j * ch + 4 - gy, cw - 8 + gx, ch - 8 + gy * 2, {
      fill: P.row,
      stroke: P.authority,
      alpha: alpha * lit,
      radius: 6,
      width: 3.5,
    });
  }
}
