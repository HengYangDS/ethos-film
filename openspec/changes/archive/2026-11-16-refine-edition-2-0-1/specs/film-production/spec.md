## MODIFIED Requirements

### Requirement: Each edition meets the media contract

Each edition SHALL be exactly 900 seconds at native progressive 60 fps, in five chapters, as a UHD master and a 1080p viewing film, each with captions and without them, with 48 kHz stereo narration only, no music and purposeful 2D motion. Each film SHALL carry the release metadata its script declares, small single-line captions where it is captioned, a designed cover with the author Yang HENG, a transcript, chapters and a player.

#### Scenario: A packaged edition reads back its contract

- **WHEN** an edition is packaged
- **THEN** whole-file decoding, the exact duration and frame count, the chapters, the caption bounds and the release metadata read back as its script declares them
- **AND** the cover is 16:9 and names the title and Yang HENG
