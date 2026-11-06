/* Easing curves: how a change leaves rest, travels and settles. From ddwg-film v1.0.0 (c4e8aac), picture/film.js. */

export const clamp = (q) => Math.max(0, Math.min(1, q));
export const mix = (a, b, q) => a + (b - a) * q;
export const ease = (q) => {
  q = clamp(q);
  return q * q * (3 - 2 * q);
};

export const ramp = (t, start, duration = 0.7) => ease((t - start) / duration);
/* Movement easing: the standard curve cubic-bezier(.4, 0, .2, 1). A movement leaves rest gently, travels quickly and
 * settles softly, so it neither snaps into motion nor stops dead. */
const bezier = (x1, y1, x2, y2) => (q) => {
  q = clamp(q);
  let u = q;
  for (let i = 0; i < 8; i++) {
    const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3 - q;
    const dx = 3 * (1 - u) ** 2 * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u ** 2 * (1 - x2);
    if (Math.abs(x) < 1e-5 || Math.abs(dx) < 1e-6) break;
    u = clamp(u - x / dx);
  }
  return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3;
};
const standard = bezier(0.4, 0, 0.2, 1);
export const soon = (t, start, duration = 0.55) => standard((t - start) / duration);
