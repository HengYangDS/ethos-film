# Design

## Context

Each thought is synthesized as its own take. The narration concatenates a segment's takes with digital silence between them, and the assembly fades a take over its last 60 ms when its last 10 ms are still heard where that silence begins. Seventeen of the eighteen thoughts in `proposal.md` are takes of that kind: the model stopped inside the last syllable. The eighteenth ends just quiet enough to escape the fade, and the silence cuts its residue off. The engine's own take measurement judges each of the eighteen unnatural. Nothing between narration and delivery enforces that judgement for a thought that keeps the cast's default seed, and the engine's report of delivered endings counts a faded thought as ending naturally.

The first fix round (2026-10-31) retook thirty thoughts, most of them as run-on takes, and found two effects that shape this design. A retake moves every later thought of its segment by an amount that is not a whole 10 ms frame, so an unchanged take can be released after reassembly. Speech recognition also depends on the neighbouring audio, so an unchanged take can be heard differently.

## Goals / Non-Goals

**Goals:**

- Neither edition releases any thought, and each still runs exactly 900 seconds.
- Each retake keeps the narrator, model, sampling and text, and changes only how the thought is read and how it ends.
- The user decides each retake by ear before it reaches a film.

**Non-Goals:**

- Changing the engine. Its measurement and enforcement of delivered endings belong to a `filmkit` Change.
- Retaking natural endings that fall faster than most, or the pause policy, unless the user hears a cut.

## Decisions

**Run-on takes.** A run-on take reads the thought on into the words that follow, so the model finishes the last syllable on its way to the next thought, and the engine cuts the take after 30 ms of heard quiet. The take therefore ends in its own quiet. Plain retakes at other seeds were the alternative, but they fail as these takes did. A declared longer release (up to 0.3 s) was rejected because it fades a syllable that is still being spoken instead of letting it finish.

**Audition, then the ear.** The engine's audition synthesizes eight takes per thought and proposes the qualified take with the fewest recognition differences, breaking ties by the quieter ending. A take qualifies when it ends naturally, cuts no phrase end and is heard to say the thought's required words. Before the user listens, every proposal is assembled into both editions and measured there. The user then hears each thought whole, before and after, and accepts or declines each one.

**Evidence of the endings.** Two observations judge a soundtrack's endings: the assembly record's released samples at every thought join and segment end, and each thought's last 10 ms before its silence measured on the soundtrack before the program gain. The engine's delivered-endings report is not used as evidence until `filmkit` corrects it.

**Reassembly flips.** After each reassembly, every thought of both editions is measured again. A thought that becomes released is auditioned and retaken under the same listening decision.

**Picture timing.** The picture's cues follow the new timelines through the existing composition. Its audits run on the new timelines, and a cue changes only where an audit fails.

**Version.** The films change only to repair a defect, so the release is `v1.0.1`.

## Risks / Trade-offs

- [A retake changes the reading of the whole thought, not only its last syllable] → The user hears every retaken thought whole and can decline it. A declined thought keeps its current take and stays listed as released.
- [Reassembly releases another thought] → Every thought is measured after every reassembly, and a newly released thought is retaken.
- [Recognition shifts on unchanged audio] → A recognition difference counts as a pronunciation change only when the audio differs or an isolated clip is heard differently.
- [Picture audits pass by one sample and fail after re-timing] → Margins are widened where an audit fails, and the audits run on both the new and the `v1.0.0` timelines.
- [Fast natural endings remain] → They are measured, listed and offered to the user, not retaken by default.

## Migration Plan

The `v1.0.0` films stay in Documents and on the forge until the user accepts the successors. Delivery keeps each replaced file as a rollback copy until that acceptance is recorded. The release manifest then records `v1.0.1` from the accepted films, and a rebuild is compared with it.
