## 1. Specification

- [x] 1.1 Amend the three requirements so that they name each edition's four films and both staged picture documents; done when `openspec validate refine-edition-2-0-1 --strict` passes and every asset a scenario names is listed in `content/release.json`.

## 2. Reproduction

- [ ] 2.1 Rebuild release 2.0.0 from an anonymous clone of the `v2.0.0` tag that holds no earlier output, by the README's steps, and compare it with the published assets (release finding REL-2.0.0-1); done when the reproduction report lists a minimum for each of the eight films.
- [ ] 2.2 Inspect each film's lowest frames side by side and record its floor in `content/release.json` at or below the measured minimum; done when the comparison passes against the recorded floors.

## 3. Engine

- [ ] 3.1 Adopt the `filmkit` release that levels each thought within a declared tolerance, judges short thoughts' clarity over the grid's phases and holds fast captions (depends on that release); done when `pyproject.toml` and `uv.lock` pin it and `mise run check` passes.
- [ ] 3.2 Declare the film's thought-level tolerance and assemble both soundtracks again (zh-R19-03, EN-R19-05); done when no step between adjacent thoughts exceeds the notes' reverification lines.
- [ ] 3.3 Judge 01.2 and the English 08.1 and 03.1 by the engine's phase measure (zh-R19-02, EN-R19-01); done when every thought meets its edition's floor by that measure or stays declared by name with its figure.
- [ ] 3.4 Let the engine hold or join the two English cues above the reading rate (EN-R19-02); done when no cue reads above 25 characters per second.

## 4. Text

- [ ] 4.1 Adopt the wording of 03.6 that the owner approved on 14 November 2026 (zh-R19-01, EN-R19-04): 「同时不丢该有的功能」 after 「使用方的负担」 and 「证实有缺口、职责有明确边界，而且确实划算，才自己写」; "without losing required behaviour" after "the burden on adopters" and "within a bounded responsibility" after "a demonstrated gap". The English 08.1 keeps its text by the same decision (EN-R19-01); done when both scripts and narration texts hold the wording and the readings and concept checks pass.
- [ ] 4.2 Narrate again every segment whose text task 4.1 changes, and qualify the takes; done when the release checks accept both soundtracks at exactly 900 seconds.

## 5. Picture

- [x] 5.1 Seat the figures of 06.5.4, 03.2.2 and 04.5.2 midway from their cuts in the Chinese edition and correct the design sentence on 04.5.2 (zh-R19-04); done when no named mark glides 100 px or more while the voice speaks, outside chapter changes and thought pauses. Done on the composition's layout (14 November): 04.5.2's Chinese pair stands from the first card's words with one 50 px settle; 03.2's path rises 92 px instead of 183; 06.5.4's names stand at most 42 px off each state and glide 39 px instead of 123, since a pure seat would stand 62 px off for 7 s and the wrapped condition fails the wrapping rule. The other listed scenes are growing lists where a seat breaks the balance: declared.
- [x] 5.2 Seat 01.3, 04.4 and 05.2 midway in the English edition (EN-R19-03); done when the note's move count falls and no frame of 336 to 348 s loses ink between cuts. Done on the layout: 01.3's panel seated at 995 (no glide); 04.4's first two models stand from their words and one 198 px spread remains, where two glides of 227 px stood; 05.2 unchanged (its only move is the claim's rise, not a growing row). The ink-loss window 336 to 348 s needs the render.
- [x] 5.3 Draw 07.4.2's lower row closer to its frame and scale 06.3's mark about its datum (zh-R19-05); done when at least 80 px stand between the lowest picture ink and the caption wherever a caption shows. Done on the layout: 07.4.2's lower row stands 85.5 px above the caption (was 51) and 06.3's mark at 0.93 stands 94 px above it (was 53.5); the film's least gap under a caption is 83 px.
- [ ] 5.4 Bring the link of 01.4.1 with its label on its own words (zh-R19-06); done when the label is legible within 0.3 s of its word and no judged label leads its word by more than 0.75 s.
- [ ] 5.5 Run the picture audits on both staged editions; done when `mise run film:picture` reports no gated finding before its first render.

## 6. Edition

- [ ] 6.1 Set the version to 2.0.1 and record the edition in the Changelog; done when `mise run check` passes.
- [ ] 6.2 Build both editions; done when `mise run film:build` ends with every film verified.
- [ ] 6.3 Obtain an independent review of each edition; done when every dimension is at 95 or above and no material or minor finding stands.
- [ ] 6.4 Deliver the reviewed editions; done when the delivery reads back from Documents.
- [ ] 6.5 Record the 2.0.1 assets in `content/release.json`; done when `tests/delivery/test_release.py` passes against the staged release folder.
