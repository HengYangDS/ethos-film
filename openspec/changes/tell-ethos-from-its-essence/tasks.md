# Tasks

## 1. Sources and concepts

- [x] 1.1 Re-pin `content/source-manifest.json` to the latest ETHOS release and re-read every passage the script cites at that commit; verify each digest against a clone and that every cited section still states its part's claims. Re-pinned on 2026-11-02 to `v0.2.0-alpha.27` (`18ed740`), the latest release, with the 16 documents revision 7 cites, the evolution campaign added. Since alpha.25 only the README's Development section and DR-0010's dated history changed, and the film cites neither; every digest and all 144 cited headings check against a clone, and the revision-6 re-verification read each added claim against these documents at alpha.26 (`build/evidence/script-audit/v2-draft-r6-reverification.md`).
- [x] 1.2 Write `content/concepts.toml` from the concept table the user approved on 2026-11-01, with each concept's exact passage at the pinned commit; verify that the `filmkit` concept check finds every quotation in its pinned document. 22 concepts, including the revision-4 changes the user approved on 2026-11-02; the check verified every quotation, again at alpha.27.

## 2. Engine

- [ ] 2.1 Depend on the `filmkit` release that checks concept contracts and readings, through its uv Git source and tag; verify that `uv sync --frozen` installs it and that `mise run check` passes. filmkit 0.3.0 is pinned and installs; `mise run check` waits for the essence picture (5.2).

## 3. Script

- [x] 3.1 Revise the bilingual draft against the independent concept-fidelity audit, then write both editions' scripts in five chapters and nine parts, with the cited sections and declared concepts of each segment, the release metadata and the pause policy; verify that the engine loads both scripts and that the concept check passes. Both scripts hold revision 7's words in 101 thoughts each, cut at the same places, with the three punctuation changes of design §2 and no word changed; the readings check resolves 741 Chinese occurrences and every name, Git among them, and the concept check passes.
- [x] 3.2 Pass the independent review of both scripts at 90 or more in fidelity, concept fidelity, first-hearing clarity and idiom, with no material finding; verify that the review binds both scripts' SHA-256. The scripts as written from revision 7 had one material finding, the Agent's reading order in 08.5 (`build/evidence/script-audit/v2-r7-scripts-audit.md`); after the repairs of 3.3 the re-check passed with Chinese 94, 95, 94 and 94 and English 94, 94, 92 and 93, no material or minor finding, bound to `ca7c9e1d…` and `128aee55…` (`build/evidence/script-audit/v2-r7a-recheck.md`).
- [x] 3.3 Have the user approve both editions' text and record the decision; verify that the record names both scripts' SHA-256. The user approved revision 4 (SHA-256 `98a40bf3…`) with its four choices and the picture note on 2026-11-02, and the same day, after its narration measured 226 s short, revision 7 (`221ae7d0…`) with its samples, its 14-minute runtime and its pace ("认可"). The scripts written from revision 7 were `content/film-script.json` `331722ae…` and `content/en/film-script.json` `7aa9a86b…`. After the script review (3.2) the user approved its three wording repairs the same day ("认可"; design §2), and the scripts are now `ca7c9e1d…` and `128aee55…`, with the narration mirrors `5ac5250d…` and `aad88f55…`.

## 4. Narration and sound

- [ ] 4.1 Qualify the narrator at the required pace on a sample of each edition, deriving an in-context reference from the identity root where the pace needs one; verify the sample's rate, its recorded derivation and that its speaker identity is kept.
- [ ] 4.2 Declare every name's spoken form and every ambiguous Chinese reading in the pronunciation contract, re-derive the review readings' English heteronym uses for the v2 scripts, and audition each; verify that the coverage check passes, that every review reading names an occurrence in the current scripts and that each audition is heard as declared. `content/review/readings.json` still keys its English uses to the v1 segments.
- [ ] 4.3 Narrate both editions and select each thought's take; verify that every take ends on its own, matches its text by recognition and that every occurrence of a declared name or reading matches its approved reference.
- [ ] 4.4 Assemble each soundtrack and its captions at exactly 840 seconds; verify the runtime, the pace bounds, the program loudness and the caption timing.
- [ ] 4.5 Have the user listen to both narrations and record the decision; verify that the record names both soundtracks, and reopen 3.1 or 4.3 for a requested change.

## 5. Picture

- [ ] 5.1 Plan each thought's picture from the accepted narration around the ETHOS mark and palette; verify the plan against the gates for names, placement, whole lists and balance.
- [ ] 5.2 Compose the picture as the ES modules under `picture/film/` and bundle them into `picture/film.js`, reusing a v1 module only where its scene states the same thing; cut the font subsets and paint both covers; verify the composition tests and coverage, the concept check on picture labels, the geometry, still, motion and sync audits, and the cover check.
- [ ] 5.3 Render a 10 fps draft and scan its stills at both phases; verify that no frame shows a collision, clipping or a blank picture under speech.

## 6. Render, review and delivery

- [ ] 6.1 Render, package and verify both editions; verify the technical checks and that the tracked tree is unchanged.
- [ ] 6.2 Pass the independent production review of the exact build at 90 or more overall and in every declared dimension, concept fidelity among them; a fixed build is reviewed again.
- [ ] 6.3 Deliver both editions to `~/Documents/ethos-introduction-film/` and read them back; verify every delivered file's SHA-256, both players in a real browser, and that each replaced v1.0.x file lies in the rollback copy.
- [ ] 6.4 Record the user's acceptance of the delivered films; verify that the record names both editions' delivered films, and keep the rollback copy until it exists.

## 7. Release preparation

- [ ] 7.1 Set `VERSION` to 2.0.0, write the CHANGELOG entry with the breaking replacement of v1.0.x, record the release manifest from the accepted films and verify a rebuild against it with `film:compare`; prepare the release folder with `SHA256SUMS` without publishing.

## Workflow follow-up

- Archive the Change, prove the archived head once, run the film gates on it, land it and close out.
- After the user confirms: publish `dev` and `main`, tag `v2.0.0` and upload the release; then read back every asset and `SHA256SUMS` on each forge.
