## 1. Runtime

- [x] 1.1 Replace the 0.2.0-beta.10 declaration in `.config/mise/config.toml` with the one published
      with 0.2.0-beta.11, checked against the release's `SHA256SUMS` and asset digests, and lock it
      again with native `mise lock`; done when the lock holds 0.2.0-beta.11 for every platform it
      held 0.2.0-beta.10 for, no 0.2.0-beta.10 entry remains and it keeps `lockfile_version = 3`.
      The release's declaration (sha256 `af619718…`) replaced the table and its comment; `mise lock`
      kept `lockfile_version = 3`, changed only `http:ethos`, and holds 0.2.0-beta.11 for the same
      six platform entries, each checksum equal to `SHA256SUMS`.
- [x] 1.2 Bind the repository family to the 0.2.0-beta.11 runtime with the locked console's
      `hook install`, keeping 0.2.0-beta.10 as the rollback; done when CURRENT names the
      0.2.0-beta.11 runtime and ROLLBACK the 0.2.0-beta.10 runtime. CURRENT names the 0.2.0-beta.11
      runtime `8c663b10…` and ROLLBACK the 0.2.0-beta.10 runtime `526c2eba…`.
- [x] 1.3 Regenerate both pipelines from the 0.2.0-beta.11 common model with
      `ethos lane project --apply` after the bind, since no proof or commit refuses the old files;
      done when `ethos lane project --check --json` reports both projections conforming and the
      change adds only the 14-day retention lines. The check first reported
      `generated_projection_drift` for both pipelines; the applied preview added one
      `retention-days: 14` line to the GitHub workflow and two `expire_in: 14 days` lines to the
      GitLab pipeline, and the check now reports both conforming.
- [x] 1.4 Record the move in the Changelog's Unreleased section; done when `mise run check` passes.
      The Unreleased section records the move under Changed; `mise run check` exits 0 (13 tests
      pass, Markdown formatting clean).

## 2. Release age

- [x] 2.1 Declare `minimum_release_age = "24h"` under `[settings]` in `.config/mise/config.toml`;
      done when `mise settings get minimum_release_age` prints `24h` in the lane and
      `mise install --locked` installs the locked tools unchanged. Read in the lane: `24h`;
      `mise install --locked` exits 0.
- [x] 2.2 Declare npm's release age in its paradigm carrier, as filmkit 0.24.1 does:
      `.config/npm/npmrc` holding `min-release-age=1`, and under `[env]` in
      `.config/mise/config.toml` `npm_config_userconfig = false` and
      `NPM_CONFIG_USERCONFIG = "{{ config_root }}/.config/npm/npmrc"`; done when, in the lane,
      `mise exec -- npm config get min-release-age` prints `1`,
      `mise exec -- npm config get userconfig` prints the repository's file, and `package-lock.json`
      is unchanged. Read in the lane: `1` and the repository's `.config/npm/npmrc`;
      `package-lock.json` is unchanged.
- [x] 2.3 Declare uv's release age, `exclude-newer = "24 hours"` under `[tool.uv]` in
      `pyproject.toml`, and relock in the same commit with `uv lock`; done when `git diff uv.lock`
      changes no `[[package]]` entry (the lock's header records `exclude-newer-span = "PT24H"`) and
      `uv lock --check` and `uv sync --frozen` pass. The relock changes only the lock's `[options]`
      header (`exclude-newer-span = "PT24H"`) and no `[[package]]` entry; `uv lock --check` and
      `uv sync --frozen` exit 0.

## Workflow follow-up

- Archive this Change and prove the archived head once.
- Publish the proposal, wait for both forges' review jobs, land, publish `dev` and `main`, and read
  the protected jobs back; then retire the lane.
