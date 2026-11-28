## Why

The repository declares and runs ETHOS 0.2.0-beta.11, its ETHOS pin lists ETHOS's two Windows
archives, its Mise lock holds a Windows table for each of its four tools, and its GitLab jobs select
their runners by `ci-macos-arm64-review` and `ci-macos-arm64-shell` (read on 28 November 2026).

The ETHOS introduction films stay frozen: by the owner's direction of 17 November 2026 their sources
change only with a new edition, and the films of 2.0.1 stay as released. On 28 November 2026 at
16:13 (UTC+8) the owner answered 「1 一起去掉」 (D-85 in the films session's record of the owner's words),
choosing that each film take three moves together when it moves to 0.2.0-beta.12, in one Change of
its own, with no edition, no tag and no picture, narration or content changed:

- **ETHOS 0.2.0-beta.12.** The owner asked that every governed repository run the latest ETHOS
  release, as the 0.2.0-beta.11 rebind records. 0.2.0-beta.12 was published on 27 November 2026 at
  17:19 UTC and upgrades directly from 0.2.0-beta.11: its release binding at the tag records
  `"0.2.0-beta.11" = "attested-main"` under `[release.upgrade_from]`, and its hosted journey
  upgrades from 0.2.0-beta.11 on macOS arm64, Linux x64 and Linux arm64. It publishes its own Mise
  declaration as the release asset `ethos-0.2.0-beta.12.mise.toml`, one row for each published
  platform: `linux-arm64`, `linux-x64`, `macos-arm64`, `windows-arm64` and `windows-x64`.
- **No Windows in the Mise supply.** On 25 November 2026 the owner ruled for every repository that
  ETHOS governs, at 13:45 to the session that onboards repositories to ETHOS (relayed): `「ethos 所有纳管仓库，全面去除对 windows 的支持，从 CI 以及各个方面」`. For these repositories it is read, by that session's answer
  relayed at 15:09 (not read first-hand), as: take out the `windows-*` rows of the ETHOS pin and the
  `windows-*` tables of the Mise lock, and keep the Linux ones. filmkit applied the same reading in
  0.34.1, and 0.2.0-beta.12 itself deprecates Windows.
- **One runner label.** On 25 November 2026 at 13:54 the owner chose one label on both forges,
  `macos-latest`, with GitLab adding `review` or `protected` (relayed at 13:55). The repository's
  GitHub job already runs on `macos-latest`, and filmkit's GitLab jobs carry the label since 0.34.1.
  The ETHOS session added the new tags to the films' six runners on 28 November 2026 at 16:16 and
  kept the old ones; the films session read them back at 16:17 (not read here).

The lane runs on 29 November 2026 from 01:27 (UTC+8), once 0.2.0-beta.12 has passed its 24-hour
release age, and reads the checksums from the release's `SHA256SUMS` then.

What 0.2.0-beta.12 asks of a repository that 0.2.0-beta.11 did not. The entry marks no item
Breaking.

- **One act that 0.2.0-beta.11 let through is refused:** the reference-transaction hook refuses the
  deletion of a legacy release ref that stands before the commit of its legacy table. It reaches
  only a repository that declares a legacy table; `.ethos/release.toml` declares none. Of the four
  new gap codes, `legacy_role_rename_history_unshared` concerns legacy role refs too, and the three
  `proof_attestation_plan_artifact_*` codes concern only a proof record that cites its plan by
  digest, which a record takes only when its plan is too large to carry. This lane changes a handful
  of paths, so its proof record carries its plan as before.
- **The commit grammar admits `style`.** A repository's own `subject_pattern` stays in force; this
  repository declares none, so `style` is admitted once the release is bound. Nothing to do.
- **A staged admission is judged by its staged tree.** The index-target preview of
  `ethos lane prewrite` and the commit's admission evaluate OpenSpec on the staged tree; a staged
  tree that does not pass is reported under `reported_gaps`, a key that every prewrite answer
  reaching the evaluation now carries, and the `pre-commit` hook prints one note for it. The
  obligation `staged-openspec-tree` is reporting, not armed. A note at a commit is expected.
- **New report fields, none of which changes a verdict, exit, required gap or Attestation:**
  `data.unexamined` on `ethos prove --readiness --execute`; `summary.environment` on an executed
  proof, with each declared command's `executable` and `supplier` (`declared`, `locked`,
  `host-baseline`, `launch-path` or `unresolved`); `data.gate_inputs`, whose records go under
  `gate-results/` in the Git-common store and which `ethos hook retire-records` retires; and
  `data.footprint`. The lane reads the `supplier` of the declared command gates `film-checks`,
  `film-media` and `film-reproduction` to confirm that the proof launched as the hosted job does.
- **Store budgets report and refuse nothing.** The preview of `ethos hook retire-records` reports
  the Git-common store against `retention.status_bytes`, and that of `ethos hook retire-supply` the
  host store against the new `retention.host_bytes`. No command refuses for bytes.
- **`ethos hook retire-supply --scan <root> --release-absent`** releases the host store's consumer
  records of absent repositories. It is the host's housekeeping, not a change to this repository.
- **A declared command may name `{scratch}`.** No command of `system/gates.toml` holds that text
  (read on 28 November 2026), and a registry names it only once every runtime that proves the
  repository reads it; 0.2.0-beta.11, the rollback, does not. Nothing to do.
- **The tool catalog admits sqlfluff** with the carrier `.config/checks/sqlfluff/.sqlfluff`. The
  repository has no sqlfluff file. Nothing to do.
- **The shipped Vale policy ignores the front-matter field `workaround`**, and the shipped
  markdownlint configuration names `defects/**/*.md` among its globs. No diagnostic is added; no
  file here has that field. The repair of the authored-name gap names `identifier_sources` as a
  third way out; no verdict changes. The Ruff and format-selection policy changes are ETHOS's own.
- **The Docs Registry gains "Decision records" and the governance documents the Writing Standard.**
  No command, schema or check changes; each keeper migrates its records through a lane of its own.
  The repository has no documentation root or decision record to migrate.
- **Known open defects are recorded under ETHOS's `defects/`**, one file each (73 entries, 65 open
  at the tag), and no longer in the Changelog. The design names those a rebind lane can meet. One is
  stated in the entry too: branch names are fixed (`main`, `dev`, `candidate/dev`, `work/`,
  `proposal/`); this repository uses them.
- **Not qualified by this beta:** a rollback after the declaration repair (this lane keeps the table
  form and runs no `ethos lane repair-paradigm --pin`), the adopter journey on Windows, interruption
  recovery and uninstall while a consumer runs, and GitLab-hosted CI and GitLab publication. The
  repository's GitLab jobs are qualified only by its own pipelines, which are read before landing.
- **Windows is deprecated.** 0.2.0-beta.12 still builds and publishes the Windows archives; a later
  release removes them. The repository takes only the three other rows.
- **Fixed, and asking nothing of the repository's files:** ETHOS's locked install of its own tool
  supply takes each archive from the URL its lock records (this repository's CI installs its locked
  tools with its own `mise install --locked`); a heavy run keeps its place in the host queue after
  its holder is killed (`ethos host status` may list such a ticket as `holding` with `holder`
  `gone`); the `source-format`, `markdown-lint` and `config-quality` gates start each tool a fixed
  number of times (the registry declares none of the three); a full proof on a quiet host no longer
  waits one sampling interval; and the fixes to the reclamation of a runtime generation, to lane
  abandonment, to the accepted closeout of legacy release refs and to the record of a proof with
  many changed paths.
- **Gate providers by catalog ID.** 0.2.0-beta.12 still resolves a legacy
  `ethos.<module>:<callable>` name, with the note `gate_provider_legacy_name`. The 0.2.0-beta.11
  rebind placed the rename of the registry's three legacy names in this rebind; the owner's decision
  of 28 November admits nothing beyond the three moves, so the names stay, each proof carries the
  note, and the rename is left to a later Change.
- The release keeps result schema 3. Before the tag ETHOS proved its candidate on disposable copies
  of 14 governed trees: 12 passed a full proof, and against 0.2.0-beta.11 it found no new required
  gap and no new refusal. The entry does not name the trees.

## What Changes

- Delete the two Windows rows of the ETHOS pin and declare `lockfile_platforms` as the platforms the
  Mise lock holds besides Windows, so that native `mise lock` removes the four
  `platforms.windows-x64` tables and nothing else, as filmkit 0.34.1 did.
- Replace the 0.2.0-beta.11 declaration with the three rows that are not Windows of the declaration
  published with 0.2.0-beta.12, keeping the `http:ethos` table form, and lock it again with native
  `mise lock`; the lock stays at version 3.
- Bind the repository to the 0.2.0-beta.12 runtime through the locked console's `hook install`,
  keeping the 0.2.0-beta.11 runtime as the rollback.
- Select the GitLab runners by `macos-latest` with `review` or `protected` in
  `[gitlab.runners.macos]` of `.config/ci/verification.toml`, and generate `.gitlab-ci.yml` again
  with `ethos lane project`, which owns that file; `.github/workflows/ci.yml` comes out unchanged.
- Record the moves in the Changelog's `Unreleased` section.

Out of scope: the films' content, picture and sound, an edition, a tag or a release; the rename of
the gate providers; the other places that name Windows outside the pin and the Mise lock, which
filmkit removed in 0.34.1 (155 Windows wheels in `uv.lock` and the template's commented example in
`openspec/config.yaml`); the Mise floor, the lockfile format and the hosted job's Mise; and the
runners' registrations, which are the ETHOS session's.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The films, their build and their checks behave as before, so `.openspec.yaml` sets
`skip_specs: true`.

## Impact

`.config/mise/config.toml`, `.config/mise/mise.lock`, `.config/ci/verification.toml`, the generated
`.gitlab-ci.yml`, `CHANGELOG.md` and the repository-common runtime selection.
`.github/workflows/ci.yml` is generated again with the same bytes. Every source of the films of
2.0.1 stays as it is. The Change lands on `dev`, `main` follows as its mirror, and it cuts no
release. The scope put to the owner named the films' two configuration files; the lane changes these
five because `.gitlab-ci.yml` is generated from `.config/ci/verification.toml`, the lock is written
by `mise lock`, and the Changelog records every change. Outside the repository, the films session
tells the ETHOS session when this film's `main` is published, and that session drops the old runner
tags. `tasks.md` is the sole progress ledger.
