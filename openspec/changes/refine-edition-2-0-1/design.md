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
2. **A shown name travels under speech as little as the balance allows.** Where a figure's final extent is known at the cut, it is seated midway from the cut, as 01.4 and 06.4 already are, and a slot may stand empty until its words within the balance limit (04.5.2, 01.3). Where the final extent would stand a state more than 50 px off for seconds, the figure takes the seat the limit allows and glides the remainder on its words (06.5.4: 42 px off, 39 px glide; 03.2: a 92 px rise; 04.4: one spread of 198 px); where the moves are a list's structural re-centring as it grows part by part (02.4, 05.4, 05.7, 06.1, 07.1, 08.9, 09.2, and 05.2's rise), the picture is declared. The design sentence about the Chinese pair of 04.5.2 is corrected to what the picture does.
3. **Engine measures come from the engine.** The thought-level tolerance, the phase-median clarity of short thoughts and the holding of fast captions are adopted with the `filmkit` release that offers them. The film declares its values in `content/film.toml`; it does not post-process its soundtrack or captions.
4. **The declared compressions stand until the owner rules.** 03.6 leaves out conditions of the source by the owner's approval of 13 November; the two notes on it ask a wording question, which goes to the owner as exact bilingual text together with 08.1.
5. **The floors come from a clean checkout.** The rebuild that calibrates them is made from an anonymous clone of the `v2.0.0` tag with no earlier output, following the README.
6. **The runtime is refitted from the thought pauses, as the owner's approval of 03.6 foresaw.** The approved 03.6 adds 3.9 s of Chinese and 3.3 s of English speech. In release 2.0.0 the gaps between parts stood within 1.7 s of their lower bounds and 37 of the 48 Chinese thought pauses already stood at the range's lower bound of 1.25 s, so the Chinese statement pause goes from a mean of 1.34 s to 1.28 s with the range's lower bound at 1.19 s, and the English one from 1.68 s to 1.61 s inside its range. Questions and the coda keep their pauses, every gap stays within its declared bounds, and each thought boundary still outlasts the longest pause inside its thought more than twice. Speech is not stretched and no inner pause is shortened further.
7. **The Chinese 03.6 is retaken as a run-on.** Narrated from the cast's seed on the longer text, its take ended abruptly and the assembly refused it. Of sixteen run-on takes, seed 7155537 ends with a fall of 32.5 ms and reads 18.74 dB on the assembled soundtrack, 0.13 dB under the edition; recognition differs from its text only by the homophone 它/他 and the spelling of the film's name.
8. **Each thought stands within 0.35 dB of its part's level in Chinese and 0.4 dB in English (zh-R19-03, EN-R19-05).** At 0.4 dB the Chinese soundtrack's largest step between adjacent thoughts was 0.87 LU, over the note's line of 0.8 LU; at 0.35 dB it is 0.77 LU. The English soundtrack's largest step inside a part is 0.8 LU (was 1.0 LU at 0.5 dB) and 0.93 LU across parts, under the note's 1.5 dB.
9. **The English 08.1 keeps its text and its take, declared by name (EN-R19-01).** By the engine's median over the frame grid's phases the thought reads 16.34 dB on the soundtrack, under the 17 dB floor that the soundtrack (17.93 dB) and every segment (17.49 dB or more) hold. Thirty-two new takes of its sentence read 15.0 to 16.4 dB against the bound take's 16.26 dB, so the sentence's own sounds set the figure, not a take. The owner kept the text on 14 November; a wording with measured candidates goes to the owner for a later edition. The other two thoughts the notes name meet their floors by the same measure: the Chinese 01.2 at 18.25 dB and the English 03.1 at 17.11 dB.
10. **Three English cues above the reading rate stay declared by name (EN-R19-02).** The engine joins a fast cue with its neighbour or holds it into the quiet before the next cue; for these three the joined line would pass the caption limit and the next cue follows at once: "and connecting a system to it does not make that system part" at 270.08 s (25.9 characters per second), "The trouble starts when it takes the place of the original words" at 328.17 s (25.8) and "They stay apart because an inference can be wrong" at 796.64 s (25.5). Moving a line break between two cues is the engine's to offer.
11. **Neighbouring names on one row stand at least one and a half times their size apart, and the geometry check gates it.** The sister films hold this line since `filmkit` 0.22.0; this film's check recorded four pairs under it that no review had named. Each is repaired where it is drawn, in both editions, so the drawing stays one: the rail of 02 takes a pitch of 292 px (was 280) with its five stations still at one pitch, the five initials of 03.1 a pitch of 212 px (was 200), and the two records over 08.2's lane stand 0.18 of the way in from each end (was a fifth).

## Risks / Trade-offs

- The engine release may change bytes of the soundtrack beyond the notes' thoughts. → The release checks and the continuity measures run on the whole soundtrack, and both editions are reviewed again.
- Seating figures midway can unbalance a state that holds for seconds. → The picture audits run on both editions before any render, and each repair is checked against the whole reverification list of its note.
- The clean rebuild could show a film below 45 dB. → The manifest then records the measured floor after the lowest frames are inspected side by side, as the reproduction requirement says.
