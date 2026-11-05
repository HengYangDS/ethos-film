# Tasks

## 1. Sources and concepts

- [x] 1.1 Re-pin `content/source-manifest.json` to the latest ETHOS release and re-read every passage the script cites at that commit; verify each digest against a clone and that every cited section still states its part's claims. Re-pinned on 2026-11-05 to v0.2.0-beta.1 (`ea72a93`), the latest release, with every digest computed from the clone; against alpha.28 only `docs/reference/command-plane.md` changed among the cited documents, in Proof Depth, which no segment cites, and `docs/plans/terminal-governance-product-design.md` joins for 08.
- [x] 1.2 Write `content/concepts.toml` from the concept table the user approved on 2026-11-01, with each concept's exact passage at the pinned commit; verify that the `filmkit` concept check finds every quotation in its pinned document. 23 concepts since 2026-11-05, `safe-next-action` added for 05 and 08; the check verifies every quotation at beta.1 and 92 declarations.

## 2. Engine

- [ ] 2.1 Depend on the `filmkit` release that checks concept contracts and readings, through its uv Git source and tag; verify that `uv sync --frozen` installs it and that `mise run check` passes. filmkit 0.9.0 is pinned since 2026-11-04 and installs with the supply of design §8, reporting 0.9.0 with mlx-audio 0.6.4 and HyperFrames 0.9.9; `mise run check` waits for the release manifest (7.1).

## 3. Script

- [x] 3.1 Revise the bilingual draft against the independent concept-fidelity audit, then write both editions' scripts in five chapters and nine parts, with the cited sections and declared concepts of each segment, the release metadata and the pause policy; verify that the engine loads both scripts and that the concept check passes. On 2026-11-05 segments 05 and 08 take the 15-minute text: 05.4, 05.6 and 08.5 are added and 08.6 names the dropped push (design §2, `build/runtime/work/script/ethos-900d-additions.json`).
- [x] 3.2 Pass the independent review of both scripts at 95 or more in fidelity, concept fidelity, first-hearing clarity and idiom, with no material finding; verify that the review binds both scripts' SHA-256. The 15-minute additions scored 99 to 100 in every dimension in both editions (`build/evidence/script-audit/ethos-900c-05-recheck.md`, `ethos-900c-08-recheck.md`).
- [x] 3.3 Have the user approve both editions' text and record the decision; verify that the record names both scripts' SHA-256. On 2026-11-05 the user read the approval document and delegated the decision on the 15-minute text ("你自行做最佳决策"); the adopted scripts are SHA-256 `81b5b6f6…` and `3a45f759…`. The same evening the owner delegated the contested reading of 当 ("你自行做最佳决定吧"), which the standard reads dàng in 当作 and the narrator said dāng: 04.6 and 06.5 say 「都只是线索」 and 「可它不是权威依据」, as the English does, and an independent re-check scored both 96 to 97 (`build/evidence/script-audit/ethos-dang-rewording-recheck.md`); the Chinese script is now `0b0ac6a8…`, its pause settings refitted in 4.4.

## 4. Narration and sound

- [x] 4.1 Qualify the narrator at the required pace on a sample of each edition, deriving an in-context reference from the identity root where the pace needs one; verify the sample's rate, its recorded derivation and that its speaker identity is kept. Since 2026-11-05 the Chinese cast speaks from the natural reference `8b50cf9a…`, derived from the identity root in two recorded steps (speaker-embedding seed 86770, in-context seed 55849, edges trimmed): its sample measured 19.1 dB of clarity and a speaker cosine of 0.991, and it holds no frame that the decode trims (design §2, `build/evidence/narration/voice-c-2026-11-05/`). The English cast is unchanged.
- [ ] 4.2 Declare every name's spoken form and every ambiguous Chinese reading in the pronunciation contract, re-derive the review readings' English heteronym uses for the v2 scripts, and audition each; verify that the coverage check passes, that every review reading names an occurrence in the current scripts and that each audition is heard as declared. Reopened on 2026-11-05 for the 15-minute edition.
- [ ] 4.3 Narrate both editions and select each thought's take; verify that every take ends on its own, matches its text by recognition and that every occurrence of a declared name or reading matches its approved reference. Reopened on 2026-11-05 for the 15-minute edition.
- [x] 4.4 Assemble each soundtrack and its captions at exactly 900 seconds; verify the runtime, the pace bounds, the program loudness and the caption timing. On 2026-11-05, after the reading retakes, the refit of the Chinese pauses (thought pause 1.42 s, inner pauses capped at 0.5 s) and the rewording of 04.6 and 06.5, both soundtracks last 900.000 s at −16.5 LUFS (Chinese `41ea2b62…`, English `d47e34a1…`); the heard medians between thoughts and between parts, 1.33 s and 2.19 s in Chinese and 1.88 s and 2.92 s in English, stand within a fifth of 1.6 s and 2.6 s, no thought's tail is released, and the 251 Chinese and 336 English captions follow the assembled timing.
- [x] 4.5 Have the user listen to both narrations and record the decision; verify that the record names both soundtracks, and reopen 3.1 or 4.3 for a requested change. On 2026-11-05 at 18:35 the owner accepted voice C ("声音 C 我听过了，OK 的"), offered beside the previous voice and the clear reference with excerpts of the assembled soundtracks, and requested no change; `build/evidence/listening/2026-11-05/user-listening-decision.json` names both soundtracks (`f18754b8…` and `d47e34a1…`, the English narrator unchanged since v1.0.1). The rewording of 04.6 and 06.5 (3.3) later replaced two Chinese takes with takes of the same cast, and removed the two readings of 当 that were left to the owner's ear.

## 5. Picture

- [x] 5.1 Plan each thought's picture from the accepted narration around the ETHOS mark and palette; verify the plan against the gates for names, placement, whole lists and balance. On 2026-11-05 the plan adds 05.4, the trust boundary of local proof; 05.6, what every result other than pass states; 08.5, the dropped push; and the dropped push as a third unaccepted stretch in the overview of 08.6. `check-picture` passes both editions with no gated finding, and the reviewers' balance measure finds no run over 90 px of 1.5 s or more in 05 and 08.
- [ ] 5.2 Compose the picture as the ES modules under `picture/film/` and bundle them into `picture/film.js`, reusing a v1 module only where its scene states the same thing; cut the font subsets and paint both covers; verify the composition tests and coverage, the concept check on picture labels, the geometry, still, motion and sync audits, and the cover check. On 2026-11-05 three new modules compose 05.4, 05.6 and 08.5, and the overview of 08.6 names the dropped push; the 13 composition tests and the font test pass, the concept check finds no counterexample in the picture, and `check-picture` passes both editions over 27,001 frames with no gated finding. Both covers are painted again from the composition's cover on the palette-B ground, and `player-check cover` reads each back identical. The coverage remains, measured by the portable proof.
- [x] 5.3 Render a 10 fps draft and scan its stills at both phases; verify that no frame shows a collision, clipping or a blank picture under speech. On 2026-11-05 the 15-minute drafts scan clean at both phases: the longest speech over a still picture lasts 3.04 s in English and, after the reading retakes, 2.91 s in Chinese, under 3.5 s, once the kernel of 03.3 beats while it is said to take its inputs (it held 3.63 s before).

## 6. Render, review and delivery

- [ ] 6.1 Render, package and verify both editions; verify the technical checks and that the tracked tree is unchanged.
- [ ] 6.2 Pass the independent production review of the exact build at 95 or more overall and in every one of the twelve declared dimensions, concept fidelity, voice quality and visual aesthetics among them, with each rejected pattern checked and none found; a fixed build is reviewed again.
- [ ] 6.3 Deliver both editions to `~/Documents/ethos-introduction-film/` and read them back; verify every delivered file's SHA-256, both players in a real browser, and that each replaced v1.0.x file lies in the rollback copy.
- [ ] 6.4 Record the user's acceptance of the delivered films; verify that the record names both editions' delivered films, and keep the rollback copy until it exists.

## 7. Release preparation

- [ ] 7.1 Set `VERSION` to 2.0.0, write the CHANGELOG entry with the breaking replacement of v1.0.x, record the release manifest from the accepted films and verify a rebuild against it with `film:compare`; prepare the release folder with `SHA256SUMS` without publishing.

## Workflow follow-up

- Archive the Change, prove the archived head once, run the film gates on it, land it and close out.
- After the user confirms: publish `dev` and `main`, tag `v2.0.0` and upload the release; then read back every asset and `SHA256SUMS` on each forge.
