## MODIFIED Requirements

### Requirement: A release carries the films with their checksums

A release SHALL publish each edition's four films, at UHD and at 1080p, each with captions and without them, and its captions, transcript, cover and review record, together with their SHA-256 sums. The repository SHALL record each published asset's name, size and SHA-256, and the digests of the soundtrack and of the two staged picture documents, with captions and without them, that each edition was made from.

#### Scenario: Published assets read back

- **WHEN** a release has been published on a forge
- **THEN** each downloaded asset's SHA-256 equals the recorded one

#### Scenario: The manifest names every film of an edition

- **WHEN** the release manifest is read
- **THEN** it lists for each edition a UHD film and a 1080p film with captions, a UHD film and a 1080p film without captions, and the digests of both staged picture documents
