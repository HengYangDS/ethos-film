# Tasks

## 1. Narration

- [x] 1.1 Audition run-on takes of the eighteen thoughts whose takes end abruptly; verify that each proposed take ends naturally, cuts no phrase end and is heard to say its required words.
- [x] 1.2 Bind the proposed takes in both casts, narrate and assemble both editions, and measure every thought's ending; verify exactly 900 seconds, no released tail in either assembly record and every thought's last 10 ms at or below -55 dBFS before the program gain, retaking any thought that the reassembly releases.
- [x] 1.3 Have the user hear each retaken thought before and after and record the decision; verify that the record names every retake with its seed, and that any declined thought keeps its `v1.0.0` take. The user delegated the adoption and accepted the borderline endings (`build/evidence/review/listening/2026-11-01-user-endings-decision.json`).

## 2. Picture

- [x] 2.1 Re-time the picture to the new timelines; verify the geometry, still, motion and sync audits on the new and the `v1.0.0` timelines. Scenes 04, 13 and 16 moved clear of their thresholds; on both timelines of both editions the frame, sync and motion audits find nothing beyond the three Chinese caption echoes `v1.0.0` accepted, and the real-browser geometry check passes all 27,000 frames of each edition (`build/evidence/picture/`).
- [x] 2.2 Render a 10 fps draft of each edition and scan its stills; verify that no frame shows a collision, clipping or a blank picture under speech. Both drafts render, and no still run under speech reaches the 3.5-second limit (longest 3.0 s in Chinese and 3.12 s in English).

## 3. Render, review and delivery

- [x] 3.1 Render, package and verify both editions; verify the technical checks and that the tracked tree is unchanged. `film:picture`, `film:package` and `film:verify` passed for both editions at edff7bf (18:36), and the chain left no tracked change; the review round's measurements find every thought's take and delivered ending natural, with no released tail.
- [ ] 3.2 Pass the independent production review of the exact build at 90 or more overall and in every declared dimension; a fixed build is reviewed again.
- [ ] 3.3 Deliver both editions to `~/Documents/ethos-introduction-film/` and read them back; verify every delivered file's SHA-256, both players in a real browser, and that each replaced `v1.0.0` file lies in the rollback copy.
- [ ] 3.4 Record the user's acceptance of the delivered films; verify that the record names both editions' delivered films, and keep the rollback copy until it exists.

## 4. Release

- [ ] 4.1 Record the release manifest from the accepted films, set `VERSION` to `1.0.1` and add its `CHANGELOG.md` entry; verify a rebuild against the manifest with `film:compare` and prepare the `v1.0.1` release folder with `SHA256SUMS`.

## Workflow follow-up

- Archive the Change, prove the archived head once, run the film gates on it, land it and close out.
- After the user confirms the release: publish `v1.0.1` and read back every asset and `SHA256SUMS` on each forge.
