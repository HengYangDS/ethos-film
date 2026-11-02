# Proposal

## Why

In the `v1.0.0` films, eighteen thoughts end on takes that stop abruptly: sixteen in the Chinese edition and two in the English edition. Seventeen of these takes stop while their voice is still heard, and the assembly fades that voice into the following silence over 60 ms, so the last syllable sounds swallowed. The eighteenth, Chinese 06.5, leaves a faint residue that the following silence cuts off. The user heard the swallowed endings in the released films. They break the requirement that every selected take's last syllable is complete and dies away inside the take. The engine listed these takes as abrupt, but its measurement of delivered endings judged the faded ones natural, so the release went ahead with them.

## What Changes

- Retake each of the eighteen thoughts as a run-on take. The narrator reads on into the thought that follows, and the take is cut in the quiet before that thought. An audition chooses among takes that end naturally, cut no phrase end and are heard to say their required words. The chosen takes are bound in each edition's cast only after the user has heard each thought before and after.
- Narrate and assemble both soundtracks again at exactly 900 seconds. Measure every thought's ending in the assembled soundtrack, and retake any thought that the reassembly leaves released.
- Re-time the picture to the new timelines and pass its audits. Render, review and deliver both editions, then prepare `v1.0.1` with the release manifest recorded from the accepted films.
- Add a scenario to "Each take is complete and read in context": the assembled soundtrack releases no thought while its voice is heard.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `film-production`: the requirement "Each take is complete and read in context" is also judged on the assembled soundtrack.

## Impact

- `content/voice-reference.json` and `content/en/voice-reference.json` gain the retakes. Every later product changes with them: narration, soundtracks, timelines, captions, films, review records, the release manifest, `VERSION` and `CHANGELOG.md`. The script text does not change, and the picture changes only in its timing.
- The user's acceptance of the narration and of the delivered films reopens. The delivered `v1.0.0` films stay in Documents and on the forge until the successors are accepted.
- Out of scope: how `filmkit` measures and enforces delivered endings, which changes in `filmkit` and reaches this film only through a later engine release. Thought and phrase ends that end naturally but fall quickly are measured and reported, not retaken, unless the user hears them cut. The DDWG films release no thought and are not changed.
