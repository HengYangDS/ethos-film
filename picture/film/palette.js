/* The film's colours and its two label sizes: the ETHOS brand kit's palette. The field is ink and every mark and
 * label is paper; the brand's muted tone draws lines, rails and inactive marks, and secondary text is a paper tint that
 * stays legible at the second level of a list. Cinnabar marks the datum alone. The evidence, authority and unknown
 * keys of the shared primitives draw in paper: the film tells them apart by shape and place, not by colour. */

const PAPER = "#F6F1E8";

export const P = {
  ground: "#10242C",
  row: "#1E3037",
  line: "#687771",
  ink: PAPER,
  muted: "#B1B4B0",
  accent: "#B5523D",
  evidence: PAPER,
  authority: PAPER,
  unknown: PAPER,
};
/* One label size for both editions: the film's labels read at one size, 29 px after the label scale below. */
export const LABEL = 26;
/* Scene labels are drawn this much larger than their layout size so they stay legible on small screens; captions,
 * chapter cards and title cards keep their own sizes. */
export const TYPE = 1.12;
