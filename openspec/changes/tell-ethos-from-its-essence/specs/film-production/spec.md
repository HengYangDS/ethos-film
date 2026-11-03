## MODIFIED Requirements

### Requirement: The films explain ETHOS as its pinned documents state it

The production SHALL explain ETHOS as the cited sections of its documents state it at the commit the source manifest pins, in the order a first-time viewer needs: what a claim of completion establishes, why relying on a change is hard when interchangeable Agents make it, what ETHOS is, why it is built on the four rules of the Product Design Contract's Root Constraint, and how one requirement lives through it. What ETHOS is and why it is built as it is SHALL take most of each edition, and a mechanism SHALL be named only where a rule needs a concrete case.

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

### Requirement: Each edition meets the media contract

Each edition SHALL be exactly 840 seconds at native progressive 60 fps, in five chapters, with a UHD master and a captioned 1080p viewing edition, 48 kHz stereo narration only, no music and purposeful 2D motion. Each film SHALL carry the release metadata its script declares, small single-line captions, a designed cover with the author Yang HENG, a transcript, chapters and a player.

#### Scenario: A packaged edition reads back its contract

- **WHEN** an edition is packaged
- **THEN** whole-file decoding, the exact duration and frame count, the chapters, the caption bounds and the release metadata read back as its script declares them
- **AND** the cover is 16:9 and names the title and Yang HENG

### Requirement: Both editions speak with one narrator

Both editions SHALL use the narrator that the previous ETHOS film and the DDWG films share. Each cast SHALL speak from a reference recording that is the unchanged identity root, the unmodified English reference, or an in-context reference derived from the identity root at the pace the narration requires, each with the qualified model revision and sampling settings.

#### Scenario: The narrator's identity is bound

- **WHEN** a cast is checked
- **THEN** each reference recording has its recorded SHA-256
- **AND** each derived reference records its derivation from the identity root, with every step's mode, text, seed and settings

### Requirement: Each take is complete and read in context

Each selected take SHALL end on its own and SHALL read each context-dependent word as its context requires. Each name in the pronunciation contract SHALL be heard in its declared spoken form, ETHOS as /ˈiːθɒs/ in both editions, and every Chinese character whose dictionary reading is ambiguous SHALL have its reading in context declared. Every occurrence of a declared name or reading SHALL match the approved reference occurrence of that name or reading. The assembled soundtrack SHALL bring every thought to quiet before the silence that follows it, so that no thought's voice is faded out while it is still heard.

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

## ADDED Requirements

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
