## 1. Runtime

- [x] 1.1 Replace the 0.2.0-alpha.29 declaration in `.config/mise/config.toml` with the one
      published with 0.2.0-beta.10, checked against the release's `SHA256SUMS` and asset digests,
      and lock it again with native `mise lock`; done when the lock holds 0.2.0-beta.10 for every
      platform it held 0.2.0-alpha.29 for, no 0.2.0-alpha.29 entry remains and it keeps
      `lockfile_version = 3`. The declaration is the release's own file (`sha256:2163ceaa…`), read
      back against `SHA256SUMS` and the asset digests; the lock holds 0.2.0-beta.10 for the same six
      platforms, holds no 0.2.0-alpha.29 entry and keeps `lockfile_version = 3`.
- [x] 1.2 Bind the repository family to the 0.2.0-beta.10 runtime with the locked console's
      `hook install`, keeping 0.2.0-alpha.29 as the rollback; done when CURRENT names the
      0.2.0-beta.10 runtime and ROLLBACK the 0.2.0-alpha.29 runtime. CURRENT names the 0.2.0-beta.10
      runtime `526c2ebafeba` and ROLLBACK the 0.2.0-alpha.29 runtime `a4323cd92099`.
- [x] 1.3 Remove the retired publication fields from `.ethos/release.toml` with
      `ethos lane repair-paradigm --apply`; done when the repair reports the lane conforming and
      `ethos status` reports pass. The repair removed the two local command fields with their table
      header and the two forge addresses; a second preview reports the lane conforming, and
      `ethos status` reports pass.

## 2. Hosted verification

- [x] 2.1 Move `mise_version` in `.config/ci/verification.toml` from 2026.10.25 to 2026.11.8 and
      generate the pipelines with `ethos lane project --apply`; done when
      `ethos lane project --check --json` reports both projections conforming. One occurrence moved
      in `.config/ci/verification.toml`; the generated GitHub workflow takes Mise 2026.11.8 and the
      common model's current `jdx/mise-action` pin, the GitLab pipeline is unchanged, and the check
      reports both projections conforming.
- [x] 2.2 Record the move in the Changelog's Unreleased section; done when `mise run check` passes.
      The Unreleased section names the runtime, the peers by remote and the hosted Mise;
      `mise run check` passes with 13 Node tests and 13 Python tests, and the format check and the
      `markdown-lint`, `prose`, `openspec`, `config-quality` and `docs-registry` gates pass.
