Every command named here is light, except the repository's check where a measurement under host rule
3 has not shown it light, and the full proof at the archived head: each of those runs as the child
of a host ticket, `ethos host run --wait 14400 --root <lane> -- <command>`, queued under host rules
2, 8 and 9. Until task 1.3 binds the release, an ETHOS preview runs with the new runtime's
interpreter, `<runtime>/python/bin/python -B -I -m ethos.cli`, and is read by its `summary.runtime`;
that interpreter never runs without `-B` (design, known open defects). No task changes a film
source, script, cast, manifest, picture, test or gate. The tasks start once the release is published
and read back: on 28 November 2026, shortly after 08:00 (UTC+8), the owner exempted every repository
that ETHOS governs from ETHOS's own 24-hour release age, in words to the session that builds ETHOS,
relayed to this one: `「而且所有 ethos 纳管仓库应该豁免 ethos 自身的 24 小时冷却期」`.

## 1. Supply

- [x] 1.1 Delete the `windows-arm64` and `windows-x64` rows of the 0.2.0-beta.11 pin, add
      `lockfile_platforms = ["linux-arm64", "linux-arm64-musl", "linux-x64", "linux-x64-musl", "macos-arm64"]`
      under `[settings]` in `.config/mise/config.toml` with one comment line (design decision 1),
      and lock again with native `mise lock`. Done when the lock's diff deletes exactly the four
      `platforms.windows-x64` tables of ETHOS, Node, Python and uv and changes no other line, and
      `mise run check:dependencies` passes.
      `mise lock` removed the four `platforms.windows-x64` tables, 19 lines with their separating
      blank lines, changed no other line and kept `lockfile_version = 3`. After the lane's
      environments were synced from the frozen locks offline (`uv sync --frozen --offline`,
      `npm ci --offline`), `mise run check:dependencies` passes.
- [ ] 1.2 Replace the 0.2.0-beta.11 declaration with the rows `linux-arm64`, `linux-x64` and
      `macos-arm64` of the declaration published with 0.2.0-beta.12
      (`ethos-0.2.0-beta.12.mise.toml`), each checksum read from the release's `SHA256SUMS` and
      checked against the asset's published digest, under a comment that names the release and the
      two Windows rows left out; then lock again with native `mise lock`. Done when each row equals
      the published row byte for byte, the lock holds 0.2.0-beta.12 for the five platform entries
      for which it held 0.2.0-beta.11 after 1.1, no 0.2.0-beta.11 entry remains, the lock's diff
      changes only `http:ethos`, it keeps `lockfile_version = 3`, and
      `git grep -n -i -w windows -- .config` prints nothing.
- [ ] 1.3 Install the locked supply with `mise install --locked` and bind the repository to the
      0.2.0-beta.12 runtime with the locked console's `hook install`, keeping 0.2.0-beta.11 as the
      rollback. Done when CURRENT names the 0.2.0-beta.12 runtime and ROLLBACK the 0.2.0-beta.11
      runtime, and `ethos status --json` in the lane reports the lane ready with `summary.runtime`
      naming 0.2.0-beta.12.

## 2. CI

- [ ] 2.1 Set `[gitlab.runners.macos]` `review_tags = ["macos-latest", "review"]` and
      `protected_tags = ["macos-latest", "protected"]` in `.config/ci/verification.toml`, under the
      comment of design decision 3, and apply exactly the patch that `ethos lane project --json`
      previews, written to a file from the preview's `patch` entry. Done when
      `ethos lane project --check --json` reports both projections conforming, the diff of
      `.gitlab-ci.yml` changes only the two jobs' `tags` lists and the file equals filmkit's
      `.gitlab-ci.yml` at `v0.35.0` byte for byte, and `.github/workflows/ci.yml` is byte-identical.

## 3. Record and check

- [ ] 3.1 In the Changelog's `Unreleased` section, name ETHOS 0.2.0-beta.12 instead of 0.2.0-beta.11
      in the line that records the ETHOS release; under `Changed`, add that the GitLab jobs select
      their runners by `macos-latest` with `review` or `protected`; under `Removed`, add that
      ETHOS's Windows archives leave the pin and the four Windows tables leave the Mise lock, the
      Linux ones kept (design decision 6). Done when `npm run format:markdown:check` passes.
- [ ] 3.2 Run the repository's check on the lane head. Done when `mise run check` passes, and the
      count of tests is recorded here.

## Workflow follow-up

- Archive this Change and prove the archived head once; each proof notes `gate_provider_legacy_name`
  (design decision 4).
- Read the six runners' tags again through the ETHOS session, then publish the proposal, wait for
  both forges' review jobs (the GitLab pipeline as the child of one host ticket until its last guest
  job ends, host rule 6), land, publish `dev` and `main`, and read the protected jobs back; tell the
  ETHOS session that this film's `main` is published, so it drops the old tags; then retire the
  lane.
