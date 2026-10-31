# Tasks

## 1. Repository and toolchain

- [x] 1.1 Bind the toolchain: the Mise configuration and lock for Node 26.12.1, CPython 3.12.16, uv 0.13.5 and ETHOS `0.2.0-alpha.21` through its release's Mise declaration; `filmkit` 0.1.1 as a uv Git source at `v0.1.1`; the npm lock with HyperFrames 0.8.150, `puppeteer-core`, `@puppeteer/browsers` and `gsap`. Verify that `mise install --locked`, `uv sync --frozen` and `npm ci` succeed and that the installed `filmkit` reports 0.1.1.
- [x] 1.2 Declare the gate registry, the portable gates and the check policies as `filmkit` declares them; verify that `ethos status` reports no gap and that the gate-exact Ruff, ESLint, Prettier and Taplo accept the tree under both the shipped and the repository policies.
- [x] 1.3 Record the ETHOS repository, the commit `v0.2.0-alpha.21` names and each cited document's SHA-256 in `content/source-manifest.json`; verify each digest against the document at that commit.

## 2. Script

- [x] 2.1 Check every part's `source_sections` against the cited documents at the pinned commit; verify that each named section exists and states the part's claims.
- [x] 2.2 Write both editions' scripts from the text the user adopted, with chapters, segments, thought groups, release metadata and the pause policy, and add the declaration, the players, the entry page, the review prompt and the font subsets cut from the scripts; verify that the engine loads the declaration and that each edition's text equals the adopted text.
- [x] 2.3 Pass the independent sentence-by-sentence text review at 90 or more in fidelity, first-hearing clarity and idiom, with no material finding; verify that the review record binds both scripts' SHA-256.
- [x] 2.4 Write the pronunciation contract and the review readings, and audition every named term; verify that the listening plan derives from them and that each audition is heard in its declared spoken form.

## 3. Narration and sound

- [x] 3.1 Add the casts with the shared narrator's references and qualified parameters; verify each reference's SHA-256 and the clear reference's recorded derivation from the identity root.
- [x] 3.2 Narrate both editions and select each thought's take; verify that every selected take ends on its own, matches its text by recognition and keeps its pauses within the declared caps.
- [x] 3.3 Assemble each soundtrack and its captions at exactly 900 seconds; verify the runtime, the program loudness and the caption timing.
- [x] 3.4 Have the user listen to both narrations and record the decision; verify that the record names both soundtracks, and reopen 2.2 or 3.2 for a requested change.

## 4. Picture

- [ ] 4.1 Plan each thought's picture from the accepted narration; verify the plan against the gates for names, placement, whole lists and balance.
- [ ] 4.2 Compose `picture/` with the primitives copied from `ddwg-film` at `v1.0.0`, cut the font subsets again from the scripts and the composition, and paint both covers; verify the font test, the geometry, still, motion and sync audits, and the cover check.
- [ ] 4.3 Render a 10 fps draft and scan its stills; verify that no frame shows a collision, clipping or a blank picture under speech.

## 5. Render, review and delivery

- [ ] 5.1 Render, package and verify both editions; verify the technical checks and that the tracked tree is unchanged.
- [ ] 5.2 Pass the independent production review of the exact build at 90 or more overall and in every declared dimension; a fixed build is reviewed again.
- [ ] 5.3 Deliver both editions to `~/Documents/ethos-introduction-film/` and read them back; verify every delivered file's SHA-256, both players in a real browser, and that each replaced file of the previous film lies in the rollback copy.
- [ ] 5.4 Record the user's acceptance of the delivered films; verify that the record names both editions' delivered films, and keep the rollback copy until it exists.

## 6. Publication

- [ ] 6.1 Write the README with the supply, build and comparison steps, `LICENSE`, `NOTICE`, the CC BY 4.0 legal code and `CHANGELOG.md`; verify that `ethos lane repair-paradigm --json` reports no gap.
- [x] 6.2 Project the portable gates into the CI of the forges the release topology declares; verify that `ethos lane project --check` passes and that each projection validates against its forge's schema.
- [ ] 6.3 Record the release manifest from the accepted films and verify a rebuild against it with `film:compare`; prepare `v1.0.0` with `.ethos/release.toml` and the release folder with `SHA256SUMS`.

## Workflow follow-up

- Archive the Change, prove the archived head once, run the film gates on it, land it and close out.
- After the user confirms the forge owner, namespace and visibility: add the remotes, publish, tag `v1.0.0` and upload the release; then read back every asset and `SHA256SUMS` on each forge.
