# Proposal

## Why

The repository declares and runs ETHOS 0.2.0-alpha.21, six releases behind 0.2.0-alpha.27, which
the other governed repositories on this workstation select. The owner asked that every governed
repository run the latest ETHOS release. Since 0.2.0-alpha.26 the repository paradigm requires
`CONTRIBUTING.md` beside `AGENTS.md` and `README.md` in every governed repository, and this
repository has none. 0.2.0-alpha.27 is published with its own Mise declaration, whose platform
checksums equal the release's `SHA256SUMS` and the published asset digests.

## What Changes

- Add `CONTRIBUTING.md`: how to prepare the tools, change the films in an ETHOS Work Lane, verify a
  change, rebuild and compare the films, commit, and cut and publish a release. The Markdown format
  scripts in `package.json` check it like the other root documents.
- Replace the 0.2.0-alpha.21 declaration in `.config/mise/config.toml` with the declaration
  published with 0.2.0-alpha.27, unchanged, and lock it again with native `mise lock`. The Node,
  Python and uv locks stay as they are.
- Bind the repository family to the 0.2.0-alpha.27 runtime through the locked console's
  `hook install`, keeping the 0.2.0-alpha.21 runtime as the rollback.
- Regenerate the CI projection from the common model, whose Mise action pin moves to v5.2.5.
- Record the guide and the move under `Unreleased` in the Changelog.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The films, their sources and their editions do not change, so `.openspec.yaml` sets
`skip_specs: true`.

## Impact

`CONTRIBUTING.md`, `package.json`, `.config/mise/config.toml`, `.config/mise/mise.lock`,
`.github/workflows/ci.yml`, `CHANGELOG.md` and the repository-common runtime selection. `tasks.md`
is the sole progress ledger.
