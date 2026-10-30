# film-production Specification

## Purpose

Explain ETHOS, as its documents state it at one pinned release, through two independently understandable films in Chinese and English, built on `filmkit` with verified media, explicit review limits and governed delivery.

## ADDED Requirements

### Requirement: The films explain ETHOS as its pinned documents state it

The production SHALL explain ETHOS as the cited sections of its documents state it at the commit the source manifest pins: the two lines of understanding and answers, intent in a Change, one owner for each obligation, Work Lanes and Leases, the trust kernel, proof, review, integration and release, real use, feedback and Model Promotion, and adoption, handoff and exit.

#### Scenario: A viewer follows the whole argument

- **WHEN** a viewer watches either edition once
- **THEN** the problem is stated before the answers ETHOS gives, each term is explained before it is relied on, and the ending returns to the opening's two lines

#### Scenario: Each sentence is faithful, clear on first hearing and idiomatic

- **WHEN** an independent language review reads every thought and label of both editions against its cited sections
- **THEN** fidelity, first-hearing clarity and idiom each score at least 90, with no material finding
- **AND** each concept keeps one term across an edition and is explained the first time it is heard
- **AND** the Chinese reads as spoken Chinese, not as a translation of the English

### Requirement: Claims keep the scope of their sources

Every claim SHALL keep the conditions, modality and scope of its cited sections. Capabilities the documents describe as planned SHALL be stated as aims or design, and illustrative examples SHALL be stated as hypothetical.

#### Scenario: Each part follows its cited sections

- **WHEN** a reviewer reads each part of either edition against the sections its script cites at the pinned commit
- **THEN** every claim is found there with its conditions, modality and scope
- **AND** a planned capability is heard as an aim or as design, never as delivered
- **AND** the market-data pipeline and the stock-selection study are heard as illustrations, not as measured results

### Requirement: The sources are pinned

The source manifest SHALL record the ETHOS repository, the one commit the scripts were checked against and the SHA-256 of each cited document at that commit. Every part of each script SHALL name the document sections it states.

#### Scenario: A cited document that differs refuses

- **WHEN** the pinned sources are verified against a clone of the ETHOS repository
- **THEN** each cited document at the pinned commit has the recorded SHA-256
- **AND** a document that differs, or a part that names no cited section, refuses and is named

### Requirement: Each edition meets the media contract

Each edition SHALL be exactly 900 seconds at native progressive 60 fps, in ten chapters, with a UHD master and a captioned 1080p viewing edition, 48 kHz stereo narration only, no music and purposeful 2D motion. Each film SHALL carry the release metadata its script declares, small single-line captions, a designed cover with the author Yang HENG, a transcript, chapters and a player.

#### Scenario: A packaged edition reads back its contract

- **WHEN** an edition is packaged
- **THEN** whole-file decoding, the exact duration and frame count, the chapters, the caption bounds and the release metadata read back as its script declares them
- **AND** the cover is 16:9 and names the title and Yang HENG

### Requirement: The runtime is fitted with designed pauses

Each edition's runtime SHALL be fitted with the engine's designed pauses. Speech SHALL NOT be time-stretched, and necessary punctuation SHALL NOT be removed to fit the runtime.

#### Scenario: Speech that does not fit refuses

- **WHEN** an edition's recorded speech and its designed pauses cannot fill exactly 900 seconds within the declared pause limits
- **THEN** the assembly refuses before output, and the text or the declared pause policy changes before the next assembly

### Requirement: Both editions speak with one narrator

Both editions SHALL use the narrator that the previous ETHOS film and the DDWG films share: the Chinese cast speaks from the clear in-context reference derived from the unchanged identity root, and the English cast from the unmodified English reference, each with the qualified model revision and sampling settings.

#### Scenario: The narrator's identity is bound

- **WHEN** a cast is checked
- **THEN** each reference recording has its recorded SHA-256
- **AND** the clear Chinese reference records its derivation from the identity root

### Requirement: Each take is complete and read in context

Each selected take SHALL end on its own and SHALL read each context-dependent word as its context requires. Each name in the pronunciation contract SHALL be heard in its declared spoken form.

#### Scenario: Named terms are heard as declared

- **WHEN** an edition's narration is qualified
- **THEN** each term in the pronunciation contract was auditioned before full narration and is heard in its declared spoken form in every selected take that speaks it
- **AND** every selected take's last syllable is complete and dies away inside the take

### Requirement: The user's listening precedes the picture

The user SHALL listen to both qualified narrations before the picture is planned, and the picture SHALL follow only narration the user accepted. A text or narration change after that acceptance SHALL reopen the narration and every later acceptance.

#### Scenario: The picture follows accepted narration

- **WHEN** picture planning starts
- **THEN** a recorded decision of the user accepts each edition's current narration
- **AND** a later text or narration change invalidates that decision and every acceptance after it

### Requirement: The picture follows the DDWG visual system

The composition SHALL keep every name with its mark, build and remove lists whole, use two text sizes, draw relations as orthogonal links with end dots, hold at most twelve names in a thought balanced on the picture, show each scene's subject from its first spoken words and change the picture on the words that name it. The staged film SHALL pass the engine's geometry, still, motion and sync audits.

#### Scenario: The staged film passes the picture audits

- **WHEN** the staged film is audited
- **THEN** the real-browser geometry check finds no overlap, safe-area overflow or label collision
- **AND** the still, motion and sync audits report no empty picture under speech, ghost, residue, stall, or label that appears early or late against its words

### Requirement: Text is drawn in fonts that cover it

Text with a Chinese character SHALL be drawn in Noto Sans CJK SC subset to the characters the film draws, and Latin-only text in unmodified IBM Plex Sans. Each font SHALL map every character drawn with it.

#### Scenario: A drawn character missing from its font refuses

- **WHEN** a script or the composition draws a character that its font does not map
- **THEN** the font test fails and names the character and the font

### Requirement: The final films earn an evidence-bound review

The final films SHALL meet the review contract the declaration states: every declared dimension at least 90 and the overall score, the mean of the dimensions, at least 90, scored against the exact final files. The review SHALL keep observed modalities separate from unassessed ones, and human listening SHALL be reported as recorded, never inferred from model review or measurements.

#### Scenario: A review that binds the final films qualifies

- **WHEN** the production review of both editions is verified
- **THEN** it names both editions' movie hashes, the current scripts and the composition
- **AND** a missing dimension, a mismatched mean, a score below its floor or a material finding refuses

### Requirement: The delivery reads back from Documents

Both qualified editions SHALL be delivered as whole files to `~/Documents/ethos-introduction-film/` and read back. The delivery SHALL keep each file it replaces or removes there as a rollback copy until the user accepts the remake.

#### Scenario: A delivery reads back

- **WHEN** both editions are delivered
- **THEN** every delivered file's SHA-256 equals its packaged file's, and both players open in a real browser
- **AND** each replaced file of the previous film is kept as the rollback copy until the user's acceptance is recorded
