# Changelog

All notable changes to the ETHOS introduction films and their build are recorded here. The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and releases follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CONTRIBUTING.md`: how to prepare the tools, change the films in an ETHOS Work Lane, verify a change, rebuild and compare the films, commit, and cut and publish a release.

### Changed

- The films are remade from ETHOS's essence, as the source states it at the pinned commit: an Agent's report, "Done. All tests pass.", opens the question of how much it establishes; the film shows what ETHOS is and why it is designed around four rules, carries the rules through one market-data requirement from request to real use and returns to the opening sentence and the ETHOS mark, in five chapters and nine parts. Each edition still lasts exactly 900 seconds. Each comes as a UHD master and a 1080p film, each with its captions drawn in the picture and again without them, and the player's captions control switches between the two while keeping the film on the screen.
- The repository runs ETHOS 0.2.0-alpha.29, and its CI workflow uses `jdx/mise-action` 5.2.6.
- The films are built by `filmkit` 0.19.0, which renders with HyperFrames 0.9.9 and narrates with mlx-audio 0.6.4. It renders each edition's picture a second time without its captions and proves, in every frame, that the two differ only by them, keeps the film on the screen when the player switches versions or captions, keeps declared caption terms and short quotations on one caption line, and refuses a finished stage that stands off centre, a mark that jumps or pops at a stage cut and a dash pattern that snaps. Each film names its author once and its version in its metadata, and the 1080p films are averaged over each 2×2 block of the UHD picture and hold a keyframe every 2 s. It renders each edition's player from the summary and colours the declaration states, gates the picture's motion as a viewer sees it, and judges the review by the owner's three levels, 信, 达 and 雅, and every sentence. Its assembly releases the brief codec onset a take can open with where it would sound out of digital silence, and its review records each edition's voice clarity against the floors the film declares, 18 dB in Chinese and 17 dB in English. Before it renders, it checks each edition's picture with the film's own fonts: how its text lines up, how it stands as the reviewers measure balance, whether every mark is named as it is spoken, and whether a label repeats a caption. It sets each caption's quotation marks as the picture sets them and tags each film's chapter track with the edition's language. The supply moves to its latest stable releases: Node 26.13.0, uv 0.13.7, esbuild 0.28.2, hatchling 1.33.0, coverage 7.17.0, pytest 9.2.0 and Mise 2026.10.25 in CI, with both locks at the newest releases their declarations admit.

## [1.0.1] - 2026-11-02

### Fixed

- Eighteen thoughts no longer end in a swallowed syllable, sixteen in the Chinese edition and two in the English edition. Each is narrated again as a run-on take that finishes its last syllable and ends in its own quiet. The user heard the borderline endings that were kept and left the adoption of the retakes to the maintainer, who adopted all eighteen. Both editions still last exactly 900 seconds, no thought is released while its voice is heard, and the picture follows the new timelines. The independent review scored the Chinese edition 95.1 and the English edition 95.4, with every dimension at 94 or above and no material finding.
- A clean clone of the release source rebuilt on an Apple M5 Max reproduces the published editions: every soundtrack, caption, transcript, cover and staged picture document is byte-identical, and each film has the published frame count, decoded audio, streams, chapters and tags, with every frame at or above the 45 dB PSNR floor; the lowest frame measured 62.0 dB.

## [1.0.0] - 2026-11-01

### Added

- The Chinese and English introduction films to ETHOS at commit `c063bfa`, each exactly 900 seconds at 60 fps, as accepted on 2026-11-01. The independent review scored the Chinese edition 94.5 and the English edition 95.1, with every dimension at 92 or above and no material finding. Each edition is published as a UHD master and a captioned 1080p film, with SRT and WebVTT captions, a transcript, a cover and its review record, and `SHA256SUMS` lists every asset.
- The Mise tasks that rebuild both editions from the tracked sources with the published filmkit 0.1.1 release: `film:supply` installs the pinned browser build and speech models, `film:build` narrates, assembles, renders, packages and verifies both editions offline, and `film:compare` compares a rebuild with the published release.
- A rebuild on an Apple M5 Max reproduces the published editions: every soundtrack, caption, transcript, cover and staged picture document is byte-identical, and each film has the published frame count, decoded audio, streams, chapters and tags, with every frame at or above the 45 dB PSNR floor; the lowest frame measured 67.7 dB.
- ETHOS governance, with its portable proof projected into GitHub Actions and GitLab CI.
- The MIT License for the code and CC BY 4.0 for the films' content, with the third-party notices and the narrator's provenance in `NOTICE`.

[Unreleased]: https://github.com/HengYangDS/ethos-film/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/HengYangDS/ethos-film/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/HengYangDS/ethos-film/releases/tag/v1.0.0
