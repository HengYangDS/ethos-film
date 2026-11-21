## 1. Runtime

- [ ] 1.1 Replace the 0.2.0-beta.10 declaration in `.config/mise/config.toml` with the one published
      with 0.2.0-beta.11, checked against the release's `SHA256SUMS` and asset digests, and lock it
      again with native `mise lock`; done when the lock holds 0.2.0-beta.11 for every platform it
      held 0.2.0-beta.10 for, no 0.2.0-beta.10 entry remains and it keeps `lockfile_version = 3`.
- [ ] 1.2 Bind the repository family to the 0.2.0-beta.11 runtime with the locked console's
      `hook install`, keeping 0.2.0-beta.10 as the rollback; done when CURRENT names the
      0.2.0-beta.11 runtime and ROLLBACK the 0.2.0-beta.10 runtime.
- [ ] 1.3 Regenerate both pipelines from the 0.2.0-beta.11 common model with
      `ethos lane project --apply` after the bind, since no proof or commit refuses the old files;
      done when `ethos lane project --check --json` reports both projections conforming and the
      change adds only the 14-day retention lines.
- [ ] 1.4 Record the move in the Changelog's Unreleased section; done when `mise run check` passes.

## 2. Release age

- [ ] 2.1 Declare `minimum_release_age = "24h"` under `[settings]` in
      `.config/mise/config.toml`; done when `mise settings get minimum_release_age` prints `24h`
      in the lane and `mise install --locked` installs the locked tools unchanged.
- [ ] 2.2 Declare npm's release age in its paradigm carrier, as filmkit 0.24.1 does:
      `.config/npm/npmrc` holding `min-release-age=1`, and under `[env]` in
      `.config/mise/config.toml` `npm_config_userconfig = false` and
      `NPM_CONFIG_USERCONFIG = "{{ config_root }}/.config/npm/npmrc"`; done when, in the lane,
      `mise exec -- npm config get min-release-age` prints `1`,
      `mise exec -- npm config get userconfig` prints the repository's file, and
      `package-lock.json` is unchanged.
- [ ] 2.3 Declare uv's release age, `exclude-newer = "24 hours"` under `[tool.uv]` in
      `pyproject.toml`, and relock in the same commit with `uv lock`; done when
      `git diff uv.lock` changes no `[[package]]` entry (the lock's header records
      `exclude-newer-span = "PT24H"`) and `uv lock --check` and `uv sync --frozen` pass.

## Workflow follow-up

- Archive this Change and prove the archived head once.
- Publish the proposal, wait for both forges' review jobs, land, publish `dev` and `main`, and read
  the protected jobs back; then retire the lane.
