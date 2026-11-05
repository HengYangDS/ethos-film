/* The film's colours and its two label sizes: the ETHOS brand kit's palette, refined for the screen on 2026-11-05.
 * The field is a deeper, less saturated ink and every mark and label is paper; lines, rails and inactive marks
 * take a cooler line tone, and secondary text is a light grey that keeps 4.5:1 against the field at the second
 * level of a list. Cinnabar, lifted to 4.9:1, marks the datum alone. The evidence, authority and unknown keys of
 * the shared primitives draw in paper: the film tells them apart by shape and place, not by colour. */

const PAPER = "#F6F1E8";

export const P = {
  ground: "#0E1B20",
  row: "#1A2A30",
  line: "#5F7680",
  ink: PAPER,
  muted: "#C8CED0",
  accent: "#CF6A52",
  evidence: PAPER,
  authority: PAPER,
  unknown: PAPER,
};
/* One label size for both editions: the film's labels read at one size, 29 px after the label scale below. */
export const LABEL = 26;
/* Scene labels are drawn this much larger than their layout size so they stay legible on small screens; captions,
 * chapter cards and title cards keep their own sizes. */
export const TYPE = 1.12;
