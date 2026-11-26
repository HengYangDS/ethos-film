## Context

See [proposal.md](proposal.md). `.config/ci/verification.toml` holds the hosted jobs' Mise release
in `[supply] mise_version`, and ETHOS's common model generates the pipelines from it. The release
reaches one place: the GitHub job's `jdx/mise-action` step takes it as its `version`. The GitLab
jobs run `mise install --locked` with the Mise of the guest runner they land on, which the session
that onboards repositories to ETHOS moved to 2026.11.14 on 26 November 2026 (relayed). The README
and `CONTRIBUTING.md` install Mise from Homebrew and name no release, and none of the film's
specifications, `film-production`, `film-publication` and `film-reproduction`, names Mise.

The ETHOS introduction films stay frozen until their December edition: their sources change only
with it, and the films of 2.0.1 stay as released. The owner's answer of 26 November makes one
exception to that freeze, this move of the hosted job's Mise, which changes nothing the films are
built from.

Of what changed in Mise after 2026.11.11, this is what lies near the repository. 2026.11.12 lists in
the lock, without a new lock format, the platforms a tool has no build for, and its `mise lock`
refuses an upgrade that would drop a platform. 2026.11.13 honours a ceiling path reached through a
symbolic link, reads a task's locked `tools` pin from that task configuration's own lock, and stops
rewriting a `pipx:` or `pypi:` tool's lock entry when only the release-age cutoff moved. 2026.11.14
adds an experimental sandbox for cached tasks, enforced on Linux only, and refuses an invalid
`#MISE` header in a file task. The repository has no file task, no task that declares `tools` or
`cache`, and no `pipx:` or `pypi:` tool. Its GitLab jobs set `MISE_CEILING_PATHS` to the folder
above the checkout, a ceiling that Mise now honours also through a symbolic link. Task 2.1 checks
the tracked lock with the new release.

`.config/mise/config.toml` sets `min_version = "2026.10.14"`, the oldest Mise that reads this
configuration: a floor, not a pin. For every governed repository, the session that onboards
repositories to ETHOS answered that the floor stays and only the CI pins move (relayed); filmkit
kept its floor in the same move, its release 0.34.2.

## Goals / Non-Goals

**Goals:**

- Install Mise 2026.11.14 in the hosted GitHub job.
- Keep the pipelines ETHOS's projection of the declaration.

**Non-Goals:**

- Changing the films' content, picture or sound, cutting an edition, or tagging a release.
- Changing any gate, check, publication, runner declaration or tool release.
- Changing the lockfile format; no step runs `mise lock --upgrade`.
- Raising the Mise floor. A rule for the floor's form is ETHOS's CI paradigm's to set, for every
  governed repository.

## Decisions

- Move only `[supply] mise_version` and apply exactly the patch that `ethos lane project` previews.
  The generated workflow is never edited by hand, `ethos lane project --check` passes, and the
  release stands in one place, the declaration.
- Keep `min_version` at 2026.10.14, for the reasons above. A Mise from 2026.10.14 to 2026.11.13
  still reads the configuration and runs the checks, without a warning.
- Land the Change now, in a lane of its own on `dev`, rather than in the December edition's lane,
  as the owner chose; one proof and one pair of hosted runs cover it.

## Risks / Trade-offs

- [Mise 2026.11.14 changes the hosted bootstrap] → The proposal's hosted runs on both Forges qualify
  it before landing; restoring the earlier parameter rolls it back.
- [A GitLab runner stays on an older Mise] → The floor does not stop it. The guest's Mise belongs to
  the session that onboards repositories to ETHOS, which read 2026.11.14 back on every runner
  account (relayed).

## Migration Plan

Move the Mise parameter, generate the pipelines, archive the Change, prove the archived head and
qualify it on both Forges' jobs. To roll back, restore `mise_version = "2026.11.11"` and generate
the pipelines again.
