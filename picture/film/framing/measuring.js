/* The measuring context that finds a scene's first legible label without drawing. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { contrastOf } from "../drawing/colour.js";

/* Records painted extents in logical screen coordinates without drawing. Text uses a fixed width estimate rather than
 * loaded fonts, so every renderer computes the same framing; the estimate errs wide, so a framed label keeps its
 * margin in any font. */
export function measuringContext() {
  let m = [1, 0, 0, 1, 0, 0],
    path = [],
    last = [0, 0];
  const stack = [],
    marks = { strong: null, seen: null };
  const keys = [
    "globalAlpha",
    "strokeStyle",
    "fillStyle",
    "lineWidth",
    "lineCap",
    "lineJoin",
    "font",
    "textAlign",
    "textBaseline",
    "letterSpacing",
  ];
  const tx = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const by = (b) => {
    const a = m;
    m = [
      a[0] * b[0] + a[2] * b[1],
      a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3],
      a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4],
      a[1] * b[4] + a[3] * b[5] + a[5],
    ];
  };
  const add = (key, [x, y]) => {
    const e = marks[key] ?? (marks[key] = [x, y, x, y]);
    e[0] = Math.min(e[0], x);
    e[1] = Math.min(e[1], y);
    e[2] = Math.max(e[2], x);
    e[3] = Math.max(e[3], y);
  };
  const sizeOf = () => Number(/(\d+(?:\.\d+)?)px/.exec(meter.font)?.[1] ?? 30);
  const widthOf = (v) =>
    [...v].reduce(
      (w, ch) =>
        w +
        (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/u.test(ch)
          ? 1.02
          : /[A-Z]/.test(ch)
            ? 0.72
            : 0.6),
      0,
    ) * sizeOf();
  function paint(color, points) {
    if (meter.globalAlpha <= 0.15) return;
    const strong = contrastOf(color, meter.globalAlpha) >= 3;
    for (const point of points) {
      add("seen", point);
      if (strong) add("strong", point);
    }
  }
  function arcPoints(x, y, rx, ry, a0, a1) {
    const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 12)));
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      path.push(tx(x + rx * Math.cos(a), y + ry * Math.sin(a)));
    }
    last = [x + rx * Math.cos(a1), y + ry * Math.sin(a1)];
  }
  const meter = {
    marks,
    globalAlpha: 1,
    strokeStyle: "#000000",
    fillStyle: "#000000",
    lineWidth: 1,
    lineCap: "butt",
    lineJoin: "miter",
    font: "30px Ethos",
    textAlign: "left",
    textBaseline: "middle",
    letterSpacing: "0px",
    save() {
      stack.push([m, keys.map((k) => meter[k])]);
    },
    restore() {
      const [saved, values] = stack.pop();
      m = saved;
      keys.forEach((k, i) => {
        meter[k] = values[i];
      });
    },
    setTransform(a, b, c, d, e, f) {
      m = [a, b, c, d, e, f];
    },
    getTransform() {
      return { a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] };
    },
    translate(x, y) {
      by([1, 0, 0, 1, x, y]);
    },
    scale(x, y) {
      by([x, 0, 0, y, 0, 0]);
    },
    setLineDash() {},
    fillRect() {},
    beginPath() {
      path = [];
    },
    closePath() {},
    moveTo(x, y) {
      path.push(tx(x, y));
      last = [x, y];
    },
    lineTo(x, y) {
      path.push(tx(x, y));
      last = [x, y];
    },
    arc(x, y, r, a0, a1) {
      arcPoints(x, y, r, r, a0, a1);
    },
    ellipse(x, y, rx, ry, rotation, a0, a1) {
      arcPoints(x, y, rx, ry, a0, a1);
    },
    quadraticCurveTo(cx, cy, x, y) {
      const [x0, y0] = last;
      for (let i = 1; i <= 8; i++) {
        const q = i / 8,
          u = 1 - q;
        path.push(
          tx(u * u * x0 + 2 * u * q * cx + q * q * x, u * u * y0 + 2 * u * q * cy + q * q * y),
        );
      }
      last = [x, y];
    },
    roundRect(x, y, w, h) {
      path.push(tx(x, y), tx(x + w, y), tx(x + w, y + h), tx(x, y + h));
      last = [x, y];
    },
    stroke() {
      paint(meter.strokeStyle, path);
    },
    fill() {
      paint(meter.fillStyle, path);
    },
    measureText(v) {
      const size = sizeOf(),
        width = widthOf(v),
        left = meter.textAlign === "center" ? width / 2 : meter.textAlign === "right" ? width : 0;
      const ascent =
        meter.textBaseline === "top"
          ? 0
          : meter.textBaseline === "middle"
            ? size * 0.52
            : size * 0.8;
      const descent =
        meter.textBaseline === "top"
          ? size * 1.05
          : meter.textBaseline === "middle"
            ? size * 0.52
            : size * 0.22;
      return {
        width,
        actualBoundingBoxLeft: left,
        actualBoundingBoxRight: width - left,
        actualBoundingBoxAscent: ascent,
        actualBoundingBoxDescent: descent,
      };
    },
    fillText(v, x, y) {
      const b = meter.measureText(v);
      paint(meter.fillStyle, [
        tx(x - b.actualBoundingBoxLeft, y - b.actualBoundingBoxAscent),
        tx(x + b.actualBoundingBoxRight, y + b.actualBoundingBoxDescent),
      ]);
    },
  };
  return meter;
}
