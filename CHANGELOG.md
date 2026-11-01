# Changelog

All notable changes to the ETHOS introduction films and their build are recorded here. The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and releases follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-11-01

### Added

- The Chinese and English introduction films to ETHOS at commit `c063bfa`, each exactly 900 seconds at 60 fps, as accepted on 2026-11-01. The independent review scored the Chinese edition 94.5 and the English edition 95.1, with every dimension at 92 or above and no material finding. Each edition is published as a UHD master and a captioned 1080p film, with SRT and WebVTT captions, a transcript, a cover and its review record, and `SHA256SUMS` lists every asset.
- The Mise tasks that rebuild both editions from the tracked sources with the published filmkit 0.1.1 release: `film:supply` installs the pinned browser build and speech models, `film:build` narrates, assembles, renders, packages and verifies both editions offline, and `film:compare` compares a rebuild with the published release.
- A rebuild on an Apple M5 Max reproduces the published editions: every soundtrack, caption, transcript, cover and staged picture document is byte-identical, and each film has the published frame count, decoded audio, streams, chapters and tags, with every frame at or above the 45 dB PSNR floor; the lowest frame measured 67.7 dB.
- ETHOS governance, with its portable proof projected into GitHub Actions and GitLab CI.
- The MIT License for the code and CC BY 4.0 for the films' content, with the third-party notices and the narrator's provenance in `NOTICE`.

[Unreleased]: https://github.com/HengYangDS/ethos-film/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/HengYangDS/ethos-film/releases/tag/v1.0.0
