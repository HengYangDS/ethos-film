# Tasks

## 1. Contributor guide

- [x] 1.1 Add `CONTRIBUTING.md` from the owner's reviewed text and list it in the Markdown format scripts of `package.json`; done when `mise run check` checks it and the paradigm reports no entry-document gap. `mise run check` checks the guide, its text is the owner's reviewed draft byte for byte, and the paradigm reports no entry-document gap.

## 2. Runtime

- [x] 2.1 Replace the 0.2.0-alpha.21 declaration in `.config/mise/config.toml` with the one published with 0.2.0-alpha.27 and lock it again with native `mise lock`; done when the declaration equals the published one and the lock holds 0.2.0-alpha.27 at the declared checksums for each platform it records, with no 0.2.0-alpha.21 entry left. Each platform checksum equals `SHA256SUMS` and the GitHub asset digest, and the lock holds no 0.2.0-alpha.21 entry.
- [x] 2.2 Bind the repository family to the 0.2.0-alpha.27 runtime with the locked console's `hook install`, keeping 0.2.0-alpha.21 as the rollback; done when `ethos status` reports the lane under the 0.2.0-alpha.27 runtime. CURRENT is `f5b664cb799b` and ROLLBACK `86dbc481b81e`.
- [x] 2.3 Regenerate the CI projection with `ethos lane project`; done when the projection check conforms. The patch changes one line: `jdx/mise-action` `82a612c5` to `6612f0ef` (v5.2.5).
- [x] 2.4 Record the guide and the move under Unreleased in the Changelog; done when every `mise run check` command passes. `mise run check` passes 13 Node and 12 Python tests and the Markdown format check.

## Workflow follow-up

- Archive the Change, prove the archived head once, land it and close out.
- Publish dev and main to GitHub and GitLab after the owner confirms the v1.0.1 publication, and confirm that the GitHub pushes start runs on their own.
