# Design

## Context

See [proposal.md](proposal.md). `.config/mise/config.toml` declares the ETHOS release that CI
installs, and the repository-common Git directory selects the runtime that every worktree of the
family runs. Both name 0.2.0-alpha.21 today. The releases since then bound every authored code file
at 500 effective lines, JavaScript included, make ETHOS read and write text as UTF-8, require
`CONTRIBUTING.md` in every governed repository and bound every gate without its own timeout at
600 seconds. The code files measure at most 489 effective lines, with the picture bundle marked
generated, and the Ruff policy equals ddwg-film's, which passes the 0.2.0-alpha.26 proof.

## Goals / Non-Goals

**Goals:**

- Run every gate and lifecycle command of the family, locally and in CI, on 0.2.0-alpha.27.
- Give maintainers the contributor guide that the paradigm requires.
- Keep the 0.2.0-alpha.21 runtime available as the rollback until the landing is accepted.

**Non-Goals:**

- Changing the films, their sources, their editions, a gate or the other supply pins.

## Decisions

- The guide follows ddwg-film's, which the same owner keeps, with this repository's names, editions,
  peers and its `npm run compose` step; the owner reviewed its text before it was committed.
- Copy the release's own declaration unchanged and lock it with native `mise lock`. Each platform
  checksum is checked against the release's `SHA256SUMS` and the published asset digests first.
- Bind through the locked 0.2.0-alpha.27 console, so the selected runtime is the one the lock
  declares, and regenerate the CI projection with `ethos lane project` instead of editing it.

## Risks / Trade-offs

- [A gate that passed under 0.2.0-alpha.21 fails under 0.2.0-alpha.27] → The lane runs the
  0.2.0-alpha.27 gates after the bind, and the full proof runs at the archived head before landing;
  a failure is repaired at its owner, or the family binds the retained 0.2.0-alpha.21 runtime again.
- [The owner's open `tell-ethos-from-its-essence` lane started under 0.2.0-alpha.21] → Its owner
  agreed to this order and refreshes the lane onto this landing before it lands.

## Migration Plan

Add the guide, copy the declaration, lock it, install the locked supply, bind the runtime,
regenerate the CI projection, run the gates, prove the archived head, land and close out. Publish dev
and main to both peers only after the owner confirms the v1.0.1 publication. To roll back, restore
the 0.2.0-alpha.21 declaration and lock and bind the retained runtime with its own console's
`hook install --runtime <0.2.0-alpha.21 runtime path>`.
