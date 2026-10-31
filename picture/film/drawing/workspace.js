/* The objects of an ETHOS workspace: repositories, worktrees, terminals, the kernel, tags, commits, a ledger of obligations and the chat bubble of a transcript. */

import { ctx } from "../canvas.js";
import { box, dot, fill, line, ring, stroke, text } from "./strokes.js";
import { documentIcon } from "./symbols.js";
import { P } from "../palette.js";
import { clamp } from "../timing/easing.js";

/* Shared marks of this film: a repository, a worktree folder, a terminal, the trust kernel, a tag, a recovery
 * arrow and a question bubble. Each is drawn from the primitives above, so it fades with its stage and the checks
 * attribute it to the scene that draws it. */
/* A repository: a rounded store with a branch glyph in its corner. */
export function repoIcon(x, y, w, h, { alpha = 1, color = P.ink, fillColor = P.row } = {}) {
  if (alpha < 0.01) return;
  box(x - w / 2, y - h / 2, w, h, {
    fill: fillColor,
    stroke: color,
    alpha,
    radius: 14,
    width: 2.5,
  });
  const gx = x - w / 2 + 34,
    gy = y - h / 2 + 30;
  line(gx, gy, gx, gy + 34, { color, alpha, width: 2.5 });
  stroke(
    () => {
      ctx.moveTo(gx, gy + 24);
      ctx.quadraticCurveTo(gx, gy + 10, gx + 18, gy + 8);
    },
    { color, alpha, width: 2.5 },
  );
  dot(gx, gy, 4.5, { color, alpha });
  dot(gx, gy + 34, 4.5, { color, alpha });
  dot(gx + 20, gy + 8, 4.5, { color, alpha });
}
/* A worktree: a folder whose tab sits on its upper left. */
export function folderIcon(x, y, w, h, { alpha = 1, color = P.ink, fillColor = P.row } = {}) {
  if (alpha < 0.01) return;
  const tab = Math.min(46, w * 0.4);
  const build = () => {
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + 14);
    ctx.lineTo(x + tab + 10, y + 14);
    ctx.lineTo(x + tab, y);
    ctx.lineTo(x + 8, y);
    ctx.closePath();
  };
  fill(build, { color: fillColor, alpha });
  stroke(build, { color, alpha, width: 2.5 });
}
/* A terminal: a window with a prompt line, where a command is shown as a mark. */
export function terminalIcon(
  x,
  y,
  w,
  h,
  { alpha = 1, color = P.ink, command = null, commandAlpha = alpha } = {},
) {
  if (alpha < 0.01) return;
  box(x, y, w, h, { fill: P.row, stroke: color, alpha, radius: 10, width: 2.5 });
  line(x, y + 30, x + w, y + 30, { color: P.line, alpha, width: 2 });
  [0, 1, 2].forEach((i) => dot(x + 20 + i * 18, y + 15, 4, { color: P.muted, alpha }));
  if (command) {
    text("$", x + 22, y + 30 + (h - 30) / 2, 26, {
      role: "mark",
      color: P.muted,
      alpha: commandAlpha,
    });
    text(command, x + 48, y + 30 + (h - 30) / 2, 26, {
      role: "mark",
      color: P.evidence,
      alpha: commandAlpha,
    });
  }
}
/* The trust kernel: a small hexagon with a core, the one centre that compiles plans. `beat` lights its core; `turn`
 * turns the hexagon by that many radians, for a kernel shown at work. */
export function kernelIcon(x, y, r, { alpha = 1, color = P.authority, beat = 0, turn = 0 } = {}) {
  if (alpha < 0.01) return;
  const build = () => {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3 + turn,
        px = x + r * Math.cos(a),
        py = y + r * Math.sin(a);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  };
  fill(build, { color: P.row, alpha });
  stroke(build, { color, alpha, width: 3 });
  dot(x, y, r * 0.26 * (1 + 0.25 * clamp(beat)), { color, alpha });
  ring(x, y, r * 0.52, { color, alpha: alpha * 0.5, width: 2 });
}
/* A release tag: a label with a hole, its point toward the left. */
export function tagIcon(x, y, w, h, { alpha = 1, color = P.authority } = {}) {
  if (alpha < 0.01) return;
  const build = () => {
    ctx.moveTo(x, y);
    ctx.lineTo(x + h / 2, y - h / 2);
    ctx.lineTo(x + w, y - h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + h / 2, y + h / 2);
    ctx.closePath();
  };
  fill(build, { color: P.row, alpha });
  stroke(build, { color, alpha, width: 2.5 });
  dot(x + h / 2 + 2, y, 4, { color, alpha });
}
/* Recovery: an arc that turns back on itself and ends in a quiet point. */
export function recoverIcon(x, y, r, { alpha = 1, color = P.evidence, upto = 1 } = {}) {
  if (alpha < 0.01) return;
  ring(x, y, r, { color, alpha, width: 3, upto: 0.78 * clamp(upto), start: -Math.PI * 0.35 });
  const a = -Math.PI * 0.35 + Math.PI * 2 * 0.78 * clamp(upto);
  if (upto > 0.9) dot(x + r * Math.cos(a), y + r * Math.sin(a), 5, { color, alpha });
}
/* A question raised aloud: a bubble with a question mark in it. */
export function askIcon(x, y, r, { alpha = 1, color = P.evidence } = {}) {
  if (alpha < 0.01) return;
  stroke(
    () => {
      ctx.arc(x, y, r, Math.PI * 0.7, Math.PI * 0.55 + Math.PI * 2 * 0.95);
      ctx.lineTo(x - r * 0.9, y + r * 1.15);
      ctx.closePath();
    },
    { color, alpha, width: 2.5 },
  );
  text("?", x, y + 1, 26, { role: "mark", align: "center", color, alpha });
}
/* A stack of layers drawn as one mark: three slabs, each resting on the next. */
export function layersIcon(
  x,
  y,
  w,
  h,
  { alpha = 1, color = P.ink, fillColor = P.row, layers = 3 } = {},
) {
  if (alpha < 0.01) return;
  const slab = h / (layers + 0.4),
    build = () => {
      for (let i = 0; i < layers; i++)
        ctx.roundRect(x - w / 2, y - h / 2 + i * slab * 1.05, w, slab * 0.86, 8);
    };
  fill(build, { color: fillColor, alpha });
  stroke(build, { color, alpha, width: 2.5 });
  // A rule across each slab: the clauses a layer adds.
  stroke(
    () => {
      for (let i = 0; i < layers; i++) {
        const ry = y - h / 2 + (i * 1.05 + 0.43) * slab;
        ctx.moveTo(x - w / 2 + 24, ry);
        ctx.lineTo(x + w / 2 - 24, ry);
      }
    },
    { color, alpha: alpha * 0.6, width: 2 },
  );
}
/* A commit: a dot on a branch, ringed when it is the one named. */
export function commitDot(x, y, { alpha = 1, color = P.ink, picked = 0, r = 9 } = {}) {
  if (alpha < 0.01) return;
  dot(x, y, r, { color: P.ground, alpha });
  ring(x, y, r, { color, alpha, width: 3 });
  if (picked > 0.01) ring(x, y, r + 9, { color: P.evidence, alpha: alpha * picked, width: 2.5 });
}
/* A chat bubble, the mark of something said. */
export function bubble(x, y, r, { alpha = 1, color = P.muted } = {}) {
  if (alpha < 0.01) return;
  const build = () => {
    ctx.roundRect(x - r * 1.3, y - r * 0.85, r * 2.6, r * 1.7, r * 0.5);
  };
  fill(build, { color: P.row, alpha });
  stroke(build, { color, alpha, width: 2.5 });
  stroke(
    () => {
      ctx.moveTo(x - r * 0.7, y - r * 0.1);
      ctx.lineTo(x + r * 0.7, y - r * 0.1);
      ctx.moveTo(x - r * 0.7, y + r * 0.3);
      ctx.lineTo(x + r * 0.2, y + r * 0.3);
    },
    { color, alpha, width: 2 },
  );
}
/* A ledger of obligations: a record whose rows are drawn as one stroke, so its rows read as one list; the row at its
 * middle, the obligation being followed, is drawn in the colour of authority. */
export function ledger(x, y, w, h, { alpha = 1 } = {}) {
  if (alpha < 0.01) return;
  documentIcon(x - w / 2, y - h / 2, w, h, { alpha, rows: 0 });
  const rows = [-2, -1, 1, 2].map((k) => y + k * h * 0.17);
  stroke(
    () =>
      rows.forEach((ry, k) => {
        ctx.moveTo(x - w * 0.34, ry);
        ctx.lineTo(x + w * (k % 2 ? 0.18 : 0.3), ry);
      }),
    { color: P.muted, alpha: alpha * 0.8, width: 2 },
  );
  line(x - w * 0.34, y, x + w / 2 - 34, y, { color: P.authority, alpha, width: 3 });
}
