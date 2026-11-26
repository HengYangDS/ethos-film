## Why

The hosted GitHub job installs Mise 2026.11.11. Mise 2026.11.14, published on 24 November 2026 at
11:00 UTC, is Mise's latest stable release, and it passed the repository's 24-hour release age at
11:00 UTC on 25 November 2026. On 26 November 2026 the owner decided that the repositories ETHOS
governs use Mise's latest stable release, one release for all: he said 「统一用最新稳定版」 at 05:49
(UTC+8) to the session that onboards repositories to ETHOS, and at 06:08 confirmed to that session
that every Mise pin of every governed repository moves (both relayed). The ETHOS introduction films
otherwise change only with their December edition, by the owner's direction of 17 November 2026. At
12:29 on 26 November he answered 「1 现在做」, choosing that they take this move now, in a Change of
their supply alone.

## What Changes

- Run the hosted GitHub job with Mise 2026.11.14 from `[supply] mise_version`.
- Generate the pipelines again from the common model; only the GitHub job's Mise line changes.
- Record the move under Changed in the Changelog's Unreleased section.

Out of scope: the films' content, picture and sound, a new edition, a tag or a release, the Mise
floor `min_version`, the lockfile format and the GitLab guest's Mise.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The repository's checks and its publication behave as before, so `.openspec.yaml` sets
`skip_specs: true`.

## Impact

`.config/ci/verification.toml`, the generated `.github/workflows/ci.yml` and `CHANGELOG.md`.
`.gitlab-ci.yml` is generated again with the same bytes. The Mise configuration, its floor and its
version-3 lock stay as they are, and so do the films of 2.0.1 and every source they are built from.
The Change lands on `dev` and is released with the December edition. `tasks.md` is the sole progress
ledger.
