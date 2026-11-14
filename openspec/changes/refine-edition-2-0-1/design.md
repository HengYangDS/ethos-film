## Context

Edition 2.0.0 passed review round 19 without a finding. This Change repairs that round's notes and the open finding of the release comparison. The film's method, narrator, runtime and argument do not change, so the design of the Change that told ETHOS from its essence still describes the film; this document records only the decisions that the repairs need.

## Goals / Non-Goals

**Goals:**

- Repair every note of round 19 that the film owns, each against its own reverification line.
- Take from the engine the measures that four notes were deferred to, by adopting its release.
- Calibrate the picture floors with a rebuild that owes nothing to the production build.

**Non-Goals:**

- No change to approved wording without the owner's decision on the exact text.
- No film-local substitute for a measure the engine owns.

## Decisions

1. **The published review records own the notes.** Tasks cite a note by its id; the observation, repair and reverification lines are read in the review records of release 2.0.0. A copy in this Change would be a second record that could drift.
2. **A shown name does not travel under speech.** Where a figure's final extent is known at the cut, it is seated midway from the cut, as 01.4 and 06.4 already are; a slot may stand empty until its words within the balance limit. This holds for the scenes of zh-R19-04 and EN-R19-03 alike, and the design sentence about the Chinese pair of 04.5.2 is corrected to what the picture does.
3. **Engine measures come from the engine.** The thought-level tolerance, the phase-median clarity of short thoughts and the holding of fast captions are adopted with the `filmkit` release that offers them. The film declares its values in `content/film.toml`; it does not post-process its soundtrack or captions.
4. **The declared compressions stand until the owner rules.** 03.6 leaves out conditions of the source by the owner's approval of 13 November; the two notes on it ask a wording question, which goes to the owner as exact bilingual text together with 08.1.
5. **The floors come from a clean checkout.** The rebuild that calibrates them is made from an anonymous clone of the `v2.0.0` tag with no earlier output, following the README.

## Risks / Trade-offs

- The engine release may change bytes of the soundtrack beyond the notes' thoughts. → The release checks and the continuity measures run on the whole soundtrack, and both editions are reviewed again.
- Seating figures midway can unbalance a state that holds for seconds. → The picture audits run on both editions before any render, and each repair is checked against the whole reverification list of its note.
- The clean rebuild could show a film below 45 dB. → The manifest then records the measured floor after the lowest frames are inspected side by side, as the reproduction requirement says.
