## 1. Hosted supply

- [x] 1.1 Move `[supply] mise_version` to Mise 2026.11.14 and apply exactly the patch that
      `ethos lane project --json` previews; done when `ethos lane project --check --json` reports
      the projections conforming, the patch changes only the GitHub job's Mise line and
      `.gitlab-ci.yml` is byte-identical. The patch (SHA-256
      `ce3311939b8a054c4df29e8bbc75b8689e82519cc25a6781735a3d3dd7bf8688`) changes that line alone,
      from 2026.11.11 to 2026.11.14; the check reports the projections conforming, and
      `.gitlab-ci.yml` is byte-identical.
- [x] 1.2 Record the move under Changed in the Changelog's Unreleased section; done when
      `npm run format:markdown:check` passes. The Unreleased section names Mise 2026.11.14.

## 2. Lock compatibility

- [x] 2.1 Check the tracked version-3 lock with Mise 2026.11.14's `mise lock --check` before
      landing; done when it passes, or its only problems are platforms the release does not build
      and are named in this task, and the lock's bytes are unchanged. Mise 2026.11.14 reports the
      lock up to date (4 tool versions, 24 platform entries) and exits 0; the lock's bytes are
      unchanged.
