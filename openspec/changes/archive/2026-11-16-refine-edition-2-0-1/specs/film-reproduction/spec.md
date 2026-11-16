## MODIFIED Requirements

### Requirement: A rebuild meets the reproduction standard

A rebuild SHALL be compared layer by layer with the published release. Each edition's soundtrack before encoding and its two staged picture documents, with captions and without them, SHALL hold the bytes the release manifest records, its captions, transcript and cover SHALL be byte-identical to the published ones, and each of its four films SHALL have the published film's frame count, decoded audio, streams, durations, chapters and tags.

#### Scenario: A faithful rebuild passes

- **WHEN** the comparison runs on a rebuild and the published release
- **THEN** it reports every layer with its measured result and passes

#### Scenario: A changed layer refuses

- **WHEN** a soundtrack, staged document, caption, transcript or cover differs by one byte, or a film's frame count, decoded audio, streams, durations, chapters or tags differ
- **THEN** the comparison fails and names the edition, layer and asset
- **AND** the rebuild does not inherit the published films' review
