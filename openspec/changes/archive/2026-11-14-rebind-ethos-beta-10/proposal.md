## Why

The repository declares and runs ETHOS 0.2.0-alpha.29, under which it released 2.0.0. The owner
asked that every governed repository run the latest ETHOS release. Under 0.2.0-alpha.29 the release
declaration carries each peer's forge address and two local command fields; 0.2.0-beta.6 retired
them, so the declaration names only Git remotes and this public repository stops tracking a forge
address. 0.2.0-beta.10 upgrades directly from 0.2.0-alpha.29, and it publishes its own Mise
declaration, whose platform checksums equal the release's `SHA256SUMS` and the published asset
digests. The hosted GitHub job still installs Mise 2026.10.25, nine releases behind 2026.11.8.

What 0.2.0-beta.10 asks of a repository that 0.2.0-alpha.29 did not:

- **Breaking: Markdown lists follow one blank-line rule** in the Markdown format, its check, the
  Markdown gate and `pre-commit`: a list item with one paragraph is followed directly by the next
  item. A file that breaks it fails `markdown_list_spacing:<path>:<line>` until
  `ethos lane format --apply` repairs it in a Work Lane.
- **Breaking: the canonical text files have an acting owner.** INI and `.cfg` files, the Vale
  vocabularies, `LICENSE`, `VERSION`, `.editorconfig`, `.gitattributes`, `.gitignore`, `.gitkeep`,
  `.shellcheckrc` and the CI supply's `Dockerfile` and `.dockerignore` take no blank line at the
  start or the end, at most one in a row and one final newline; the source-format gate reports
  `source_format_drift:<path>`.
- **Breaking: every authored `__init__.py` opens with a docstring** that names its package's
  purpose, or the paradigm reports `repository_paradigm_package_docstring:<path>`.
- **Breaking: every README that the docs registry admits declares `role: index`** and holds at most
  100 lines that are not blank; docs health reports `docs_readme_not_index:<path>` and
  `docs_index_too_long:<path>:<lines>>100`.
- A paradigm refusal that `ethos lane repair-paradigm` can repair names its preview as the next
  action, and `.config/mise/mise.lock` is required only when `.config/mise/config.toml` selects a
  tool.
- Its Node.js supply moves to 26.13.1, a security release with nine High-severity fixes under seven
  CVE identifiers.
- Its results use schema 3, where 0.2.0-alpha.29 wrote schema 2, and it embeds OpenSpec 2.0.0. A
  rollback after the declaration repair is not qualified. Among its known open defects, npm 12.2.2
  still bundles `glob` 13.0.6 and `minimatch` 10.2.5 (GHSA-3g3m-2fjr-6pw4, GHSA-g3hv-75wg-m249), and
  Go's GO-2026-6859 still affects the bundled `cue`, `vale` and `shfmt`, which ETHOS runs only as
  local commands over repository files without starting an HTTP server.

A static check of `dev` under the 0.2.0-beta.10 runtime finds no file that the four Breaking rules
refuse.

## What Changes

- Replace the 0.2.0-alpha.29 declaration in `.config/mise/config.toml` with the declaration
  published with 0.2.0-beta.10, unchanged, and lock it again with native `mise lock`; the lock stays
  at version 3.
- Bind the repository family to the 0.2.0-beta.10 runtime through the locked console's
  `hook install`, keeping the 0.2.0-alpha.29 runtime as the rollback.
- Remove the retired publication fields from `.ethos/release.toml` with
  `ethos lane repair-paradigm --apply`; the peers stay named by their Git remotes.
- Move the hosted GitHub job from Mise 2026.10.25 to 2026.11.8 in `.config/ci/verification.toml`
  and generate both pipelines again with `ethos lane project --apply`. The GitLab jobs use the Mise
  on their runners, which this Change does not move.
- Record the move in the Changelog's Unreleased section.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The films, their build and their checks behave as before, so `.openspec.yaml` sets
`skip_specs: true`.

## Impact

`.config/mise/config.toml`, `.config/mise/mise.lock`, `.ethos/release.toml`,
`.config/ci/verification.toml`, the generated `.github/workflows/ci.yml`, `CHANGELOG.md` and the
repository-common runtime selection. No film source, script, cast, manifest, carrier declaration,
test or gate changes, and the films of 2.0.0 stay as released: this Change cuts no release.
`tasks.md` is the sole progress ledger.
