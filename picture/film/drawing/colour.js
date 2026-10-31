/* Colour arithmetic: contrast against the ground and blends. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

import { P } from "../palette.js";
import { clamp, mix } from "../timing/easing.js";

const groundLuminance = (() => {
  const lin = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
})();
const rgbOf = (v) =>
  /^#[0-9a-f]{6}$/i.test(v ?? "") ? [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)) : null;
const GROUND = rgbOf(P.ground);
export function contrastOf(color, alpha) {
  const rgb = rgbOf(color);
  if (!rgb) return 1;
  const mixed = rgb.map((v, i) => alpha * v + (1 - alpha) * GROUND[i]);
  return (groundLuminance(mixed) + 0.05) / (groundLuminance(GROUND) + 0.05);
}
/* Blend two #rrggbb colours. */
export function blend(a, b, q) {
  const rgb = (v) => [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16));
  const [x, y] = [rgb(a), rgb(b)];
  return (
    "#" +
    x
      .map((c, i) =>
        Math.round(mix(c, y[i], clamp(q)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
