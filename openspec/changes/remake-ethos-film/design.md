# Design

## Context

The previous ETHOS introduction film runs 600 seconds per edition and explains ETHOS as its documents stood in early October 2026. Its repository, `ethos-introduction-film`, builds with an earlier pipeline and tracks its outputs as evidence; it is not publishable and does not use `filmkit`. Since then the DDWG films moved to `ddwg-film`, which rebuilds both editions from its own sources, and their engine became `filmkit`, released as 0.1.0 on 2026-10-30 with a sample film. `ethos adopt --create` formed `ethos-film` with the foundation starter: an ETHOS profile, the agent entry, a README and the OpenSpec configuration. The remake reuses the engine and the narrator that both earlier films share, and writes a new script from the current ETHOS documents.

## Goals / Non-Goals

**Goals:**

- Two independent editions, Chinese and English, each exactly 900 seconds at 60 fps, 2D only, narration without music, with small single-line captions.
- Every claim in the script traced to a cited section of the ETHOS documents at one pinned commit; illustrative examples labelled as such.
- A repository that rebuilds both films from tracked sources and pinned supply, as `ddwg-film` does.
- Delivery to Documents with whole-file checks and readback, then the user's acceptance.

**Non-Goals:**

- Changes to `filmkit` made here. A gap in the engine is fixed by a Change and a release there, then adopted here.
- A shared library of picture primitives, music, 3D, or languages other than Chinese and English.
- Publishing, which waits for the user's confirmation of the owner, namespace and visibility.

## Decisions

### Repository and engine

The toolchain matches `ddwg-film`: Node 26.12.1, CPython 3.12.16, uv 0.13.5, and ETHOS bound through the Mise declaration published with its release. The film depends on a `filmkit` release as a uv Git source at its tag, so the lock pins the tag's commit. The film owns its npm lock with HyperFrames 0.8.150, which the engine requires, and the browser build it pins. The gate registry and the check policies follow `filmkit`'s, so the same gate-exact formatters and linters run here. The engine is installed, not copied: a film-specific need that the engine cannot meet stops the work and goes to a `filmkit` Change and release.

The first such need is the cover. `filmkit` 0.1.0 refuses, at import and before any work, a declaration that names a missing file, covers included; but the engine paints each cover from the staged picture, and the stage needs the narration. A film that has not painted its covers therefore cannot narrate. The film depends on `filmkit` 0.1.1, released from a `filmkit` Change that lets a declaration name covers before they exist: packaging refuses an edition whose cover is missing, naming the field, and the cover tool paints a first cover when there is no tracked cover to compare it with. A placeholder cover was rejected: as a tracked file it would be a source the film never uses, and kept untracked in the lane it would leave the tracked declaration unloadable from a clean checkout.

### Script and sources

The script is the draft the user approves, in eighteen parts under ten chapters: two lines; intent; one owner for each obligation; Work Lanes and Leases; the trust kernel; proof; review, integration and release; real use; feedback and Model Promotion; adoption, handoff and exit. Each part is one segment whose `source_sections` name the ETHOS sections it states. `content/source-manifest.json` records the ETHOS repository URL, the commit and the SHA-256 of each cited document. The draft was read at ETHOS `c063bfa07`, the commit that the `v0.2.0-alpha.21` tag names, so the manifest pins that commit and the cited sections need no second reading; each part's sections are still checked to exist there.

The script follows these rules from the draft's independent fidelity reviews. Planned capabilities are stated as aims or design, never as delivered; ETHOS reports that Model Promotion is required and blocks dependent changes, it does not perform it. Permissions keep their source modality, such as "may accept". Each language keeps one term per concept: 治理 / governance; 采纳 for intent and requirements and 接受 for code; 责任 / obligation; 检验 / verification; 编译 / compile; 重新采纳 / adopted again; 决定权 or 有权 / authority; and 核验 only in 核验记录. A term is explained the first time it is heard. The Chinese is written as spoken Chinese, not translated from the English. The market-data pipeline and the stock-selection study are illustrations, not measured results.

The text is adopted before any synthesis. An independent sentence-by-sentence review for fidelity, clarity on first hearing and idiomatic language must score at least 90 in every dimension. An adopted text change reopens narration, picture cues and every later acceptance.

### Runtime

Each edition is exactly 900 seconds. The fifth draft holds 4142 Han characters and 2452 English words. Its narration with the casts below measures 730 seconds of Chinese and 745 seconds of English speech; once the engine shapes the pauses inside each thought, about 721 and 678 seconds of voice remain. The rest of the runtime is designed quiet: the pauses between thoughts, the paragraph and chapter gaps, the closing pause and 3 seconds of credits. The runtime is fitted with the engine's designed pauses: speech is never time-stretched, pauses inside a thought keep their floors, and no necessary punctuation is removed.

The pause policy starts from the values the DDWG films qualified, which suit speech that nearly fills its runtime. Here they would leave runtime that no declared gap may take, so each edition lengthens its statement, question and paragraph pauses and their ranges, and English, which speaks faster, keeps native pauses inside a thought up to 0.4 seconds. Thoughts are then separated by about 0.9 seconds in Chinese and 1.1 seconds in English, paragraphs by about 3 and 5 seconds, and chapters by about 7.5 and 8.5 seconds, which the picture uses. The user's listening judges the pace: a pace that is too slow changes the pause policy or, by the user's decision, the runtime, never the voice; speech that is too long shortens the text, which is adopted again.

### Narrator

Both editions use the narrator that the previous ETHOS film and the DDWG films share. The Chinese cast speaks from the clear in-context reference (`7ff6347e`) derived from the unchanged identity root (`a355801a`), the previous ETHOS film's Chinese reference. The English cast speaks from the unmodified English reference (`a763e48e`). Both casts carry `ddwg-film`'s qualified model revision, temperature and repetition penalty, with this film's own seeds. The pronunciation contract gives the spoken forms of ETHOS, OpenSpec, Git, CI and the other names the voice would misread, and the heteronyms in context, such as 行情 read as 航情. Each named term is auditioned before full narration. The user listens to both narrations before the picture is composed.

### Picture

The composition in `picture/` is new and follows the DDWG visual system:

- every name stays with its mark and is placed by a primitive;
- lists build and leave whole, with the current item in full ink and earlier ones at 0.58;
- two text sizes, no pills and no dot joins;
- relations are drawn as orthogonal links with end dots;
- each thought holds at most twelve names and balances on (960, 500).

The primitives are copied from `ddwg-film`'s composition at its `v1.0.0` commit, which the file names. Moving them into `filmkit` was rejected for now: the DDWG composition would keep its own copy until its next edition, so a library would add an engine release without removing a copy.

The film's motif is the two lines of the opening: understanding above, the answers of code, data and use below. Each chapter shows the mechanism that keeps them joined:

- the Change as one carrier of adopted intent;
- one owner for each meaning;
- lanes with their leases and the check before each write;
- the kernel's compile, compare-and-swap and readback;
- separate evidence planes;
- the branches, merge request and two forges;
- observation in real use;
- feedback carried down through what depends on it, and Model Promotion;
- one kernel for ETHOS and each adopter.

The coda joins the two lines again. Picture cues follow the accepted narration, never the reverse.

### Fonts, captions and covers

Text with a Chinese character uses Noto Sans CJK SC subset to the characters the film draws; Latin-only text uses unmodified IBM Plex Sans, whose license reserves its name, so it is never subset. A test checks that each font maps every character drawn with it, as in `filmkit`'s sample. The subsets are first cut from the adopted scripts, so that the declaration loads before the picture exists, and are cut again from the scripts and the composition once the picture is drawn. They keep the repository small: the local GitLab instance refuses a push whose pack exceeds 20 MiB, which the full Noto fonts alone would exceed. Captions are small and single-line; terms that read as one name stay on one line. Each edition has a 16:9 cover with the title and the author, Yang HENG, painted by the composition's `renderCover`.

### Review and delivery

The production review scores the exact build in the eight dimensions that `content/film.toml` declares, from subject and faithfulness to credits and deliverable craft; every dimension and the overall mean must reach 90. After the review, at most one round of fixes follows, and a fixed build is reviewed again.

The films are delivered, once they pass their technical checks and the review, to `~/Documents/ethos-introduction-film/`, the folder that holds the previous film. The engine's delivery leaves exactly the remake's 21 members there and moves each file it replaces or removes into `build/artifacts/delivery/predecessors/`, the rollback copy, which is kept until the user accepts the remake. The previous film also stays in its own repository, which tracks its media. A new folder was rejected: the user's existing entry point would then keep showing the previous film beside the remake.

### Publication

Code is MIT, the film content (script, narration, picture, covers and captions) is CC BY 4.0, and the fonts keep the SIL Open Font License; `NOTICE` names the narrator's provenance and the sources. The release carries the films and their checksums as Release assets, as `ddwg-film` does. The forge owner, namespace and visibility are decided by the user with the push, and the CI projection follows the forges then declared.

## Risks / Trade-offs

- [The ETHOS documents change after the pin] → The manifest names one commit; a later change reaches the film only through a new adopted text.
- [The speech and the declared pauses do not fill 900 seconds exactly] → Speech that is too long shortens the text, which is adopted again; speech that is too short lengthens the declared pauses within the engine's bounds. The voice is never forced, and the user's listening judges the pace.
- [The `filmkit` release is not reachable at its tag] → The lock cannot be final and the film waits; a local path source is not used, because the published repository must build from public sources.
- [The voice misreads a name] → The pronunciation contract and an audition of each named term precede full narration.
- [A copied primitive diverges from the DDWG one] → The copy names its source commit; the gates check the result, not the copy.
- [The user rejects the delivered remake] → The rollback copy restores the previous film's folder, and its repository keeps its media.

## Migration Plan

1. `filmkit` 0.1.0 was released and published on 2026-10-30, and `ethos adopt --create` formed `ethos-film` the same day.
2. Release `filmkit` 0.1.1 from its own Change, so that a first film can name its covers before painting them.
3. Carry out this Change in the order of `tasks.md`: toolchain, script, narration, the user's listening, picture, render, review, delivery and the release preparation.

Rollback: before delivery nothing outside the repository changes. After delivery, restoring the rollback copy returns `~/Documents/ethos-introduction-film/` to the previous film.

## Open Questions

- The forge owner, namespace and visibility of `ethos-film`, decided by the user with the push.
