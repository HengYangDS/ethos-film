## Context

See [proposal.md](proposal.md). The move follows ETHOS's successor-first adopter cutover: bind the
release in the lane, prove, publish for review, land, and publish the accepted head. Between
0.2.0-alpha.29 and 0.2.0-beta.10 the release declaration lost its forge fields, result schema 3
replaced schema 2, OpenSpec moved to 2.0.0, and four Breaking rules started to block: Markdown list
spacing, the canonical text owner, package docstrings and README index roles. The film kit and the
essentials film already run 0.2.0-beta.10 with the same pipeline model.

## Goals / Non-Goals

**Goals:**

- Run every gate and lifecycle command of the family, locally and in the hosted macOS jobs, on
  0.2.0-beta.10.
- Stop tracking a forge address in the release declaration.
- Keep the 0.2.0-alpha.29 runtime as the rollback until the landing is accepted.

**Non-Goals:**

- Changing any film source, script, cast, manifest, carrier declaration, test or gate.
- Cutting a release: the films of 2.0.0 stay as published.
- Moving the Mise on the GitLab runners, or any other supply.
- Turning on `[peer_identity] mode = "required"`.

## Decisions

- Copy the release's own declaration unchanged and lock it with native `mise lock`, after checking
  each platform checksum against the release's `SHA256SUMS` and the published asset digests; the
  lock stays at version 3 because locking an existing lock again keeps its version.
- Remove the retired publication fields only through `ethos lane repair-paradigm --apply`, which
  plans the exact lines, instead of editing the declaration by hand.
- Move the hosted Mise in the same Change, because the pipelines are generated again anyway and the
  GitHub job is the only place that installs a pinned Mise. Generate both pipelines only through
  `ethos lane project --apply`; the generated files are never edited by hand.

## Risks / Trade-offs

- [A gate that passed under 0.2.0-alpha.29 fails under 0.2.0-beta.10] → The lane runs the gates
  after the bind, and the full proof runs at the archived head before the proposal. A failure is
  repaired at its owner, or the family restores the 0.2.0-alpha.29 declaration in a new Change and
  binds the retained runtime.
- [A rollback after the declaration repair is not qualified by 0.2.0-beta.10's journey] → A
  rollback restores the 0.2.0-alpha.29 declaration, lock and release declaration in a new Change
  and runs the full proof before it lands, so this repository proves its own rollback instead of
  assuming it.
- [The hosted macOS jobs fail under the new Mise or runtime] → The proposal's review runs on both
  forges are read before landing; a failure stops the landing.

## Migration Plan

Copy the declaration, lock it, install the locked supply, bind the runtime, repair the release
declaration, move the hosted Mise, generate the pipelines, run the gates and prove the archived
head; then propose, read the review runs, land and publish. To roll back, restore the
0.2.0-alpha.29 declaration, lock and release declaration in a new Change, then bind the retained
runtime with the current console's `hook install --runtime <0.2.0-alpha.29 runtime>`.
