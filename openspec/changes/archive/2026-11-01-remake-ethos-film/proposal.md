# Proposal

## Why

The ETHOS introduction film (`ethos-introduction-film`, 600 seconds per edition) explains an earlier ETHOS. Its script follows documents that have since changed, and its pipeline cannot be rebuilt from a public repository. The user decided to remake it on `filmkit`, the engine extracted from the DDWG films, with a new script written from the current ETHOS documents, review gates, the user's own listening, and delivery to Documents with readback.

## What Changes

- Build out `ethos-film`, which `ethos adopt --create` formed under ETHOS `0.2.0-alpha.21`: bind the toolchain through Mise, depend on a released `filmkit` through a uv Git source at its tag, and pin the renderer, browser automation, browser build and animation library through npm, as `ddwg-film` does.
- Declare the film in `content/film.toml`: two independent editions, Chinese and English, each exactly 900 seconds at 60 fps, 2D only, narration without music, in ten chapters and eighteen parts.
- Adopt the bilingual script that the user approves, with every part bound to the ETHOS document sections it states, and pin the ETHOS repository, its alpha.21 release commit and each cited document's SHA-256 in `content/source-manifest.json`.
- Narrate with the narrator that the previous ETHOS film and the DDWG films share, and have the user listen to both narrations before the picture is composed.
- Compose a new picture for this script under the DDWG visual system, with Noto Sans CJK SC subset to the characters the film draws and unmodified IBM Plex Sans.
- Review the text before narration and the exact build before delivery; deliver both editions to Documents and read them back.
- Add the README, the licensing (MIT for code, CC BY 4.0 for the film content, the SIL Open Font License for the fonts), the CI projection and the `v1.0.0` release preparation, without publishing.

## Capabilities

### New Capabilities

- `film-production`: the film's content, narration, picture and review contract, and its delivery.
- `film-reproduction`: rebuilding both films from tracked sources and pinned supply, and the standard a rebuild must meet.
- `film-publication`: licensing, release assets and the record of what was published.

### Modified Capabilities

None.

## Impact

- Repository `ethos-film`, governed by ETHOS `0.2.0-alpha.21`. Its forge remotes are added only after the user confirms the push; the owner, namespace and visibility are decided then.
- Dependencies: `filmkit` 0.1.1, the release that lets a new film name its covers before the engine paints them (0.1.0 refuses such a declaration, so a first film cannot narrate); npm `hyperframes` 0.8.150, `puppeteer-core`, `@puppeteer/browsers` and `gsap`; Python `pydantic` through the engine.
- `~/Documents/ethos-introduction-film/`, which holds the previous film: the delivery replaces it once the remake is qualified, keeping each replaced file as the rollback copy until the user accepts the remake.
- The ETHOS repository is read only, at the pinned commit. The previous film's repository is never read by a build; it stays a private archive.
- Out of scope: changes to `filmkit` beyond its own Changes and releases, a shared library of picture primitives, music, 3D, and publishing before the user confirms.
