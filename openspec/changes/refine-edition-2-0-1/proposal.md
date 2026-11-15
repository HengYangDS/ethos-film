## Why

Release 2.0.0 published the films that review round 19 accepted: Chinese 99.4 and English 99.2, with no finding and eleven notes, six on the Chinese edition and five on the English one. The owner asked that notes are repaired, not set aside. The release comparison left one more finding: it ran against a release folder staged from the accepted build, so no rebuild from a clean checkout has shown that the films reproduce or has exercised their picture floors. That rebuild is made on this edition's own tag by the Change that follows it.

The notes are recorded, each with its observation, repair and reverification line, in the review records that release 2.0.0 publishes, `ethos-zh-production-review.md` and `ethos-en-production-review.md`, under the ids zh-R19-01 to zh-R19-06 and EN-R19-01 to EN-R19-05. This Change cites them by id and does not copy them.

## What Changes

- A name that is already shown no longer travels while the voice speaks: figures whose final extent is known at the cut are seated midway from the cut (zh-R19-04, EN-R19-03).
- The picture keeps a clear distance above the caption in 07.4.2 and 06.3 (zh-R19-05), and the link of 01.4.1 comes with its label on its own words (zh-R19-06).
- The soundtracks are assembled on the engine release that levels each thought within a declared tolerance, judges a short thought's clarity over the frame grid's phases and holds a caption that reads too fast (zh-R19-02, zh-R19-03, EN-R19-02, EN-R19-05).
- The requirements name the four films and both staged picture documents that each edition publishes.
- The wording of 03.6 in both languages (zh-R19-01, EN-R19-04) and of the English 08.1 (EN-R19-01) changes only if the owner decides so on the exact text; until then the approved text and its declared compression stand.

The films stay 900 seconds, with the same narrator, chapters and argument. The result is edition 2.0.1.

Out of scope: any other approved wording; the engine's release itself, which `filmkit` owns; and the rebuild from a clean checkout, which the Change that follows this edition makes on the `v2.0.1` tag.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `film-production`: the media contract names the four films of each edition.
- `film-publication`: a release carries four films per edition and records both staged picture documents.
- `film-reproduction`: the comparison covers both staged picture documents of each edition.

## Impact

- `picture/film/scenes` for the scenes the notes name in chapters 1 to 7, and the picture tests that pin them.
- `pyproject.toml`, `uv.lock` and `content/film.toml` for the engine release and its declared tolerances.
- `content/release.json` for the new assets; the scripts and casts only if the owner decides a wording.
- Both editions are assembled, rendered and reviewed again; release 2.0.0 stays published as it is.
