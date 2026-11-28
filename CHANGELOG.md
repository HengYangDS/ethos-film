# Changelog

All notable changes to the ETHOS introduction films and their build are recorded here. The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and releases follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- The repository runs ETHOS 0.2.0-beta.12 instead of 0.2.0-beta.10, the hosted GitHub job installs
  Mise 2026.11.14 instead of 2026.11.8, and the hosted jobs keep their CI artifacts for 14 days.
- Mise, npm and uv take a release only once it is a day old: Mise's `minimum_release_age` is 24
  hours, npm reads `min-release-age=1` from the repository's own `.config/npm/npmrc`, and uv's
  `exclude-newer` is 24 hours. No locked version changes. The films of 2.0.1 are unchanged.
- The GitLab jobs select their runners by `macos-latest` with `review` or `protected`, the one label
  the owner chose for both forges on 25 November 2026, where they selected `ci-macos-arm64-review`
  and `ci-macos-arm64-shell`. The CI files stay generated from `.config/ci/`, and GitHub's comes out
  unchanged.

### Removed

- Windows from the Mise supply: ETHOS's pin loses its `windows-arm64` and `windows-x64` archives,
  and the Mise lock loses the `windows-x64` table of each of its four tools (ETHOS, Node, Python and
  uv). Its Linux tables stay.

## [2.0.1] - 2026-11-16

### Added

- `film:sound` ends each edition with the engine's sound gate, which refuses a soundtrack with a part under its clarity floor or a thought or heard phrase that stops instead of dying away. `film:picture` refuses neighbouring names on one row that stand closer than one and a half times their size, and the film declares its own glide pace, 450 px/s, as a pace limit, so the picture gate refuses a mark that moves faster.

### Changed

- 03.6 says the two conditions of the contract that 2.0.0 left out, as the owner approved on 14 November 2026: the mature tools are kept where they are shown to reduce maintenance, risk and the burden on adopters "without losing required behavior" (「同时不丢该有的功能」), and ETHOS writes its own tools only to fill a demonstrated gap "within a bounded responsibility" (「职责有明确边界」). 03.6 is narrated again in both editions and its picture names both conditions on their words: the Chinese sets the three conditions of ETHOS's own tool as one list in one size and ink, and the English sets the words "shown to reduce" and the three reductions as one name on two lines, which stays with its tools until the stage leaves; nothing else in either narration changes. The Chinese narration has 3,939 Han characters and the English 2,716 words.
- The runtime is fitted from the thought pauses for the longer 03.6 and, in Chinese, for the longer pauses at sentence ends: the Chinese statement pause averages 1.22 s where it averaged 1.34 s, and the English one 1.61 s where it averaged 1.68 s. Questions and the coda keep their pauses, speech is not stretched, and each soundtrack still lasts exactly 900 seconds at −16.5 LUFS.
- Each thought stands within 0.35 dB of its part's level in Chinese and 0.4 dB in English, where the tolerances were 0.5 dB and 0.75 dB, so the largest step between adjacent thoughts is 0.75 LU in Chinese and, inside a part, 0.8 LU in English.
- In the Chinese edition a pause at a sentence end inside a thought lasts at least 0.45 s, where the floor was 0.28 s, as the owner decided on 16 November 2026, so that no sentence end inside a thought is heard shorter than the commas beside it. Review round 21 noted a side effect in four places: the caption of the next sentence, and once the label 观察到的, appears 0.42 to 0.45 s before it is spoken, because the lengthened quiet stands after the aligned start of the next word. It is left to the next edition.
- 05.2's claim rises over 1.55 s where it rose over 1.41 s, so that a point of the report's flow keeps the film's pace wherever the flow's clock puts it.
- A shown name travels less while the voice speaks: 01.3's panel is seated from the hand-off, 04.4's first two models stand from their words, 04.5.2's Chinese pair stands from the first card's words, 03.2's path rises half as far, and 06.5.4's names glide a third as far. 07.4.2's lower row and 06.3's mark keep more than 80 px above the caption.
- 01.4's link and its name 改代码 arrive on their own words, and the Agents' name builds in its place, its noun from the stage's cut and 可以互相替换的 on its own words.
- Neighbouring names on one row stand at least 1.7 times their size apart: 02's rail and 03.1's five initials take a wider pitch, and the records of 08.3, the gate of 03.3 and the checks of 08.9 stand further apart.
- No chapter title travels: the chapter card dissolves where it stands and the running head fades in at its own place, where the title flew to the head at about 1,200 to 1,300 px/s; a chapter's first scene begins as the card leaves.
- Every glide and flow of the scenes keeps the film's glide pace of 450 px/s. The motion audit had recorded 35 Chinese and 37 English stretches over it in 2.0.0, the fastest at 768 px/s, and each is recut at its cause: a glide peaks at 440 px/s on the canvas under the camera's push, 02's index moves as one glide over its names' whole way and the request on its rail rides through stops named sooner than a glide reaches them, the end points of 03's paths stand where the stroke will end, 04.3's card and request move one after the other, and the points that flow on a gliding stage in 04.4, 05.2, 06.1 and 08.9 give their pace up to the glide's.
- One English cue of 03 takes an authored break where its subject ends, so that it reads under 25 characters per second: "and connecting a system to it" and "does not make that system part of ETHOS's own record." Two cues stay at 25.8 and 25.5 characters per second: each opens its sentence, and no break of the sentence brings its fastest cue under 25.
- The films are built by `filmkit` 0.22.3 instead of 0.21.2 and rendered with HyperFrames 0.9.46 instead of 0.9.9; GSAP moves to 3.15.1, `puppeteer-core` to 25.17.0, `@puppeteer/browsers` to 3.2.7, `undici` to 7.30.2 and Prettier to 3.10.1. Node, Python, uv and Chrome Headless Shell keep their versions.
- The repository runs ETHOS 0.2.0-beta.10 instead of 0.2.0-alpha.29, its release declaration names the publication peers only by their Git remotes, and the hosted GitHub job installs Mise 2026.11.8 instead of 2026.10.25.
- Review round 21 scored the Chinese edition 99.5 and the English edition 99.3, with every one of the twelve dimensions at 96 or more, each of 信, 达 and 雅 passing and no material or minor finding. Its 3 Chinese notes and 6 English notes are listed in the published review records, `ethos-zh-production-review.md` and `ethos-en-production-review.md`. Round 20 had passed a first build with notes only; two of its notes touched patterns the owner had rejected, so that build was not released, and round 21 reviewed the build that repairs them. The review is a model's judgment of the media and their measurements; human listening is a separate acceptance.

### Removed

- The Prettier and Taplo configuration files under `.config/checks/`, which repeated the settings ETHOS ships.

### Fixed

- The English thought 08.1 reads under the clarity floor of 17 dB by the engine's sharper measure, 16.34 dB, as it did in 2.0.0, where the measure of that release did not show it. Thirty-two new recordings of its sentence read 15.0 to 16.4 dB, so the sentence's own sounds set the figure. The owner decided on 16 November 2026 that the floor holds for the soundtrack and for each part and that a single thought is judged against the floor less 1.0 dB; 08.1 stands between the two lines, and the review prompt states the line.
- In 03.2 the path's line no longer opens within one frame under a station, as it did once in 2.0.0: it gives way from the station's centre as the station's ring arrives, and the station's glyph follows.
- `NOTICE` names Prettier 3.10.1, the version the lock holds.

## [2.0.0] - 2026-11-14

### Added

- Each edition also comes without captions, as a UHD master and a 1080p film whose picture is staged from the same composition and timeline with no captions. The player's captions control switches between the films with and without captions and keeps the film on the screen at the time it had reached; the 1.0.x films drew their captions into both films, so a viewer could not turn them off. The release publishes all four films of each edition with its SRT and WebVTT captions, transcript, cover and review records, and `SHA256SUMS`: 21 assets, where 1.0.x published 17.
- `content/concepts.toml`, the concept contract. For each of the 23 ETHOS concepts the film names, it quotes the passage that defines the concept at the pinned commit, states its essence in one sentence and fixes one rendering in each edition, with the renderings the film must not use, such as 有权决定的人 for authority. Each part of both scripts declares the concepts it states; the concept check verifies every quotation against the pinned documents and all 92 declarations, and the review judges concept fidelity against the contract.
- Each film names its version in its QuickTime Information key, as 版本号 2.0.0 or Version 2.0.0, and so do the entry page and each player page; the verifier refuses a film or page made under another version.
- `CONTRIBUTING.md`: how to prepare the tools, change the films in an ETHOS Work Lane, verify a change, rebuild and compare the films, commit, and cut and publish a release.

### Changed

- Breaking: the 2.0.0 films are a new 15-minute film and replace the films of 1.0.0 and 1.0.1. They keep the titles ETHOS · 让信任建立在证据上 and ETHOS · Evidence-grounded Trust, and each asset that 1.0.x published keeps its name and now holds the new film. The 1.0.x films stay available as the assets of the `v1.0.0` and `v1.0.1` releases, and each of those tags rebuilds its films with filmkit 0.1.1.
- The new film puts what ETHOS is and why it is built as it is before how it works. An Agent's report, "Done. All tests pass.", opens the question of how much it establishes. The film then shows why relying on such a report is hard when people and interchangeable Agents change one repository, what ETHOS is, and why it is designed around four rules: preserve meaning with the smallest model, distinguish only what changes action, keep authority separate from views, and retire a mechanism when its obligation disappears. One market-data requirement, which the narration calls made up to show the idea and not a measured case, carries the rules from request to real use, and the film returns to the opening sentence and the ETHOS mark. It has five chapters in nine parts: The question, What ETHOS is, Why it is designed this way, One request's life and Back to the beginning. The 1.0.x films walked through ETHOS's mechanisms in ten chapters and eighteen parts and gave the reasons behind them only in the last part. Each edition still lasts exactly 900 seconds at 60 fps.
- The film explains ETHOS v0.2.0-beta.1, at commit `ea72a93`, from 17 of its documents, where 1.0.x explained v0.2.0-alpha.21, at commit `c063bfa`, from 7. It describes planned capabilities as design.
- Each edition is spoken at the narrator's native rate, with no speech time-stretched or pitch-shifted, and the designed pauses between thoughts, parts and chapters fit it to exactly 900 seconds. The Chinese edition speaks from a new reference recording, `assets/audio/narration-reference-natural.wav`, where 1.0.x spoke from `assets/audio/narration-reference-clear.wav`. `content/voice-reference.json` derives it from the narrator's identity recording in two recorded steps, trimming only its edges so that it keeps that recording's pauses; it measures clearer than that recording, and the owner accepted this voice on 2026-11-05. The English edition keeps its reference recording from 1.0.x.
- The pronunciation contract declares the reading in context of 155 Chinese words, where 1.0.x declared 31, such as 重新 (chóng xīn). filmkit's readings check, which refuses a character it watches that the narration says without a declared reading, passes the Chinese script, and the review's listening plan lists every occurrence. ETHOS is still declared as /ˈiːθɒs/ in both editions.
- The picture is composed anew on the ETHOS brand kit's palette, refined for the screen: paper-coloured marks and text on a dark ground, and one cinnabar accent, at 4.9:1 against the ground, for the point of the ETHOS mark, where a claim must be bound to its evidence. The mark is the picture's recurring figure, and each rule adds a part of it. Evidence, authority and the unknown, which the 1.0.x picture drew in colours of their own, are told apart by shape and place. The covers, the players and the entry page take the same palette.
- The picture's movements ease in and out: its clock eases to rest over 0.45 s as a thought ends and back as the next begins, a glide peaks at no more than 450 px/s, and a stroke's tip draws on at no more than 820 px/s.
- Each picture is drawn in Chrome's software rasterizer, as `capture = "software"` in `content/film.toml` declares, because the GPU rasterizer drew random one-frame faults into pictures of both editions, most visibly into Chinese glyphs; the 1.0.x pictures were captured on the GPU. Before packaging, the engine compares each edition's two pictures at every frame and refuses a frame that differs outside the captions or holds a one-frame fault; it found none in the 54,000 frames of either edition.
- The independent review judges each edition on twelve dimensions, where 1.0.x was judged on eight, and every dimension and the overall score must reach 95, where they had to reach 90. Concept fidelity and visual aesthetics and colour are new, and the voice, its performance, pronunciation and language are each scored on their own, voice quality against a clarity floor of 18 dB in Chinese and 17 dB in English. Each of the owner's three levels, 信, 达 and 雅 (faithful, conveyed and graceful), must pass, every sentence receives a verdict, and the review prompt lists fourteen patterns the owner rejected in earlier editions, such as a hoarse voice or a person standing in for authority; any one found is a material finding.
- Review round 19 scored the Chinese edition 99.4 and the English edition 99.2, with every one of the twelve dimensions at 96 or more, each of 信, 达 and 雅 passing and no material or minor finding. Its 6 Chinese and 5 English notes are listed in the published review records, `ethos-zh-production-review.md` and `ethos-en-production-review.md`. The review is a model's judgment of the media and their measurements, and human listening is a separate acceptance.
- The films are built by filmkit 0.21.2 instead of 0.1.1, which renders with HyperFrames 0.9.9 instead of 0.8.150 and narrates with mlx-audio 0.6.4 and MLX 0.32.4 instead of 0.5.8 and 0.32.3. Before each render it checks the picture with the film's own fonts: how its text lines up and stands on the centre as the reviewers measure balance, whether each mark is named as it is spoken, whether a label repeats a caption, and whether a mark halts, sets off, races, pops or jumps outside a stage cut.
- The supply moves to Node 26.13.1, uv 0.13.7, esbuild 0.28.2, puppeteer-core 25.16.0 and @puppeteer/browsers 3.2.6, with undici 7.30.1 selected for HyperFrames, and to hatchling 1.33.0, coverage 7.17.0 and pytest 9.2.0; Python stays at 3.12.16 and Chrome Headless Shell at 152.0.7977.30. The repository runs ETHOS 0.2.0-alpha.29, and its CI installs Mise 2026.10.25 through `jdx/mise-action` 5.2.6.

### Removed

- `assets/audio/narration-reference-clear.wav`, the reference recording the 1.0.x Chinese edition spoke from: no cast reads it, and the `v1.0.0` and `v1.0.1` tags keep it for their rebuilds.
- `content/player.html` and `content/en/player.html`: the engine renders each edition's player from the summary and colours `content/film.toml` declares, so the `film-checks` gate no longer checks player pages and the tests check the declaration instead.

### Fixed

- Each ETHOS concept the film names keeps the meaning its source gives it. The 1.0.x films made authority a person: the Chinese said 有权决定的人, a person with the power to decide, and the English "whoever has the authority to decide", where ETHOS defines authority as the inputs of product judgment. The 1.0.x Chinese also said 核验记录 for Attestation, 本地证明 for local proof and 模型提升 for Model Promotion, each of which narrows its concept. The 2.0.0 Chinese says 权威依据, 存证, 核验 and 修订模型, and the English authority, attestation, proof and revising the model, as the concept contract fixes them.
- Each film names its author once. The 1.0.x films also carried the author under the QuickTime Artist key, which Spotlight counts as a second author and Finder showed as "Yang HENG (2)". The films join their keywords by commas alone, so Spotlight imports each Chinese keyword whole and without the leading space that a comma and a space left, though it still splits each English keyword phrase into its words; the verifier reads the authors and keywords back where the host has `mdimport`. Each film's chapter track takes its edition's language, where the 1.0.x films' chapter tracks were tagged English.
- The 1080p films no longer ring. VideoToolbox's scaler, which made the 1.0.x 1080p films, laid a dark fringe along strokes and lifted the brightest ink to 255 where the master reaches 242, as measured on this edition's pictures before the change; each 1080p film now averages each 2×2 block of its UHD picture, and it holds a keyframe every 2 s.

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

[Unreleased]: https://github.com/HengYangDS/ethos-film/compare/v2.0.1...HEAD
[2.0.1]: https://github.com/HengYangDS/ethos-film/releases/tag/v2.0.1
[2.0.0]: https://github.com/HengYangDS/ethos-film/compare/v1.0.1...v2.0.0
[1.0.1]: https://github.com/HengYangDS/ethos-film/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/HengYangDS/ethos-film/releases/tag/v1.0.0
