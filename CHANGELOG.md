# Changelog

All notable changes to the ETHOS introduction films and their build are recorded here. The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and releases follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `CONTRIBUTING.md`: how to prepare the tools, change the films in an ETHOS Work Lane, verify a change, rebuild and compare the films, commit, and cut and publish a release.

### Changed

- The repository runs ETHOS 0.2.0-alpha.27, and its CI workflow uses `jdx/mise-action` 5.2.5.

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
