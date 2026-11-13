# film-production Specification

## Purpose

Explain ETHOS, as its documents state it at one pinned release, through two independently understandable films in Chinese and English, built on `filmkit` with verified media, explicit review limits and governed delivery.

## Requirements

### Requirement: The films explain ETHOS as its pinned documents state it

The production SHALL explain ETHOS as its cited sections state it at the pinned commit, in the order a first-time viewer needs: what a claim of completion establishes, why relying on a change made by interchangeable Agents is hard, what ETHOS is, why it rests on the four rules of the Root Constraint, and how one requirement lives through it. What ETHOS is and why SHALL take most of each edition, and a mechanism SHALL be named only where a rule needs a concrete case.

#### Scenario: A viewer follows the whole argument

- **WHEN** a viewer watches either edition once
- **THEN** the problem is stated before the answers ETHOS gives, what ETHOS is before why it is built that way, and why before how
- **AND** each of the four rules is shown in a scene of the running story by the time it is named
- **AND** each term is explained before it is relied on, and the ending returns to the opening's claim of completion

#### Scenario: What and why outweigh how

- **WHEN** the parts of either edition are classified by what they explain
- **THEN** the parts that state what ETHOS is and why it is built as it is fill at least two thirds of the runtime before the credits

#### Scenario: Each sentence is faithful, clear on first hearing and idiomatic

- **WHEN** an independent language review reads every thought and label of both editions against its cited sections and the concept contract
- **THEN** fidelity, concept fidelity, first-hearing clarity and idiom each score at least 95, with no material finding
- **AND** each concept keeps one term across an edition and is explained the first time it is heard
- **AND** the Chinese reads as spoken Chinese, not as a translation of the English

### Requirement: Claims keep the scope of their sources

Every claim SHALL keep the conditions, modality and scope of its cited sections. Capabilities the documents describe as planned SHALL be stated as aims or design, and illustrative examples SHALL be stated as hypothetical.

#### Scenario: Each part follows its cited sections

- **WHEN** a reviewer reads each part of either edition against the sections its script cites at the pinned commit
- **THEN** every claim is found there with its conditions, modality and scope
- **AND** a planned capability is heard as an aim or as design, never as delivered
- **AND** the market-data pipeline and its events are heard as illustrations, not as measured results

### Requirement: The sources are pinned

The source manifest SHALL record the ETHOS repository, the one commit the scripts were checked against and the SHA-256 of each cited document at that commit. Every part of each script SHALL name the document sections it states.

#### Scenario: A cited document that differs refuses

- **WHEN** the pinned sources are verified against a clone of the ETHOS repository
- **THEN** each cited document at the pinned commit has the recorded SHA-256
- **AND** a document that differs, or a part that names no cited section, refuses and is named

### Requirement: Each edition meets the media contract

Each edition SHALL be exactly 900 seconds at native progressive 60 fps, in five chapters, with a UHD master and a captioned 1080p viewing edition, 48 kHz stereo narration only, no music and purposeful 2D motion. Each film SHALL carry the release metadata its script declares, small single-line captions, a designed cover with the author Yang HENG, a transcript, chapters and a player.

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

Both editions SHALL use the narrator that the previous ETHOS film and the DDWG films share. Each cast SHALL speak from a reference recording that is the unchanged identity root, the unmodified English reference, or an in-context reference derived from the identity root for the pace or clarity the narration requires, each with the qualified model revision and sampling settings.

#### Scenario: The narrator's identity is bound

- **WHEN** a cast is checked
- **THEN** each reference recording has its recorded SHA-256
- **AND** each derived reference records its derivation from the identity root, with every step's mode, text, seed and settings

### Requirement: Each take is complete and read in context

Each selected take SHALL end on its own and read each word as its context requires. Each name in the pronunciation contract SHALL be heard in its declared form, ETHOS as /ˈiːθɒs/, and each Chinese character with an ambiguous dictionary reading SHALL have its reading in context declared. Every occurrence of a declared name or reading SHALL match its approved reference. The assembled soundtrack SHALL bring every thought to quiet before the silence after it, never fading a voice still heard.

#### Scenario: Named terms are heard as declared

- **WHEN** an edition's narration is qualified
- **THEN** each term in the pronunciation contract was auditioned before full narration and is heard in its declared spoken form in every selected take that speaks it
- **AND** every selected take's last syllable is complete and dies away inside the take

#### Scenario: An undeclared ambiguous reading refuses

- **WHEN** the Chinese script is checked before narration
- **THEN** every character with more than one dictionary reading has a declared reading for its context
- **AND** an occurrence without one refuses and is named with its segment and position

#### Scenario: Every occurrence matches its reference

- **WHEN** an edition's narration is qualified
- **THEN** each occurrence of a declared name or polyphone matches its approved reference occurrence within the threshold its check was calibrated to
- **AND** a mismatch is retaken before the user listens to the narration

#### Scenario: The assembled soundtrack releases no thought

- **WHEN** an edition's soundtrack is assembled
- **THEN** the last 10 ms of each thought before the silence that follows it lie at or below -55 dBFS before the program gain
- **AND** the assembly record shows no released tail for any thought

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

The final films SHALL meet the review contract the declaration states: every declared dimension, each stating what an excellent film shows, at least 95, and the overall score, their mean, at least 95, scored against the exact final files. The reviewer SHALL check every pattern the owner has rejected in an earlier edition. The review SHALL keep observed modalities apart from unassessed ones, and human listening SHALL be reported as recorded, never inferred from model review or measurements.

#### Scenario: A review that binds the final films qualifies

- **WHEN** the production review of both editions is verified
- **THEN** it names both editions' movie hashes, the current scripts and the composition
- **AND** a missing dimension, a mismatched mean, a score below its floor or a material finding refuses

#### Scenario: Each quality is scored on its own

- **WHEN** the review contract is read
- **THEN** it scores faithfulness, concept fidelity, narrative clarity, language quality, voice quality, narration performance, pronunciation, visual explanation, typography, visual aesthetics and colour, sound-picture continuity, and credits and delivery craft as separate dimensions
- **AND** voice quality states the measured clarity a narration must reach

#### Scenario: A rejected pattern cannot pass

- **WHEN** a reviewer finds in either edition a pattern the owner has rejected, such as a hoarse voice, a swallowed phrase tail, a ground with a colour cast or an opening without its title card
- **THEN** the finding is material and the review refuses

### Requirement: The delivery reads back from Documents

Both qualified editions SHALL be delivered as whole files to `~/Documents/ethos-introduction-film/` and read back. The delivery SHALL keep each file it replaces or removes there as a rollback copy until the user accepts the remake.

#### Scenario: A delivery reads back

- **WHEN** both editions are delivered
- **THEN** every delivered file's SHA-256 equals its packaged file's, and both players open in a real browser
- **AND** each replaced file of the previous film is kept as the rollback copy until the user's acceptance is recorded

### Requirement: Concepts keep their source definitions

The film SHALL keep a concept contract that binds each ETHOS concept the narration, captions or picture name to its passage at the pinned commit, its essence and one approved rendering in each edition, and both editions SHALL be composed from that contract rather than translated from each other. Each segment SHALL declare the concepts it states, both editions of a segment SHALL declare the same concepts, and an edition SHALL name a concept only by its approved rendering.

#### Scenario: A rendering that departs from the contract refuses

- **WHEN** the scripts and the picture are checked before narration
- **THEN** each concept a segment declares appears in that segment by its approved rendering
- **AND** a counterexample the contract records for a concept, or a concept declared in one edition of a segment only, refuses and is named

#### Scenario: A quotation that no longer matches its source refuses

- **WHEN** the contract is verified against a clone of the ETHOS repository
- **THEN** each quoted passage is found verbatim in its document at the pinned commit
- **AND** a passage that is not found refuses and is named

### Requirement: The narration keeps an unhurried pace

Each edition SHALL be spoken at the narrator's native articulation, keeping the natural pauses inside each take, with about 0.8 seconds between thoughts, 1.6 seconds between paragraphs and 2.6 seconds between parts, so that a first-time listener can follow. Each part SHALL take its natural length, and only each edition's total SHALL be fitted to its runtime, through those pauses, by no more than a fifth either way. The pace SHALL come from the voice's native speech, never from time-stretching.

#### Scenario: A qualified narration meets its pace

- **WHEN** an edition's selected narration is measured
- **THEN** its median pauses between thoughts, between paragraphs and between parts each lie within a fifth of 0.8, 1.6 and 2.6 seconds
- **AND** every selected take is native model output without a tempo transform
