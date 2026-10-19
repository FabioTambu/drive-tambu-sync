# First-run Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Install prerequisites and create a verified SSH/SFTP connection from the desktop UI.
**Architecture:** Separate runtime-tool resolution, dependency inspection/installation, private connection profiles, and a React setup wizard. Existing IPC and rclone consumers receive narrow integration changes.
**Tech Stack:** Electron/React/TypeScript, Node test runner, official rclone/cloudflared, OS-native installers.
**Spec:** docs/superpowers/specs/2026-10-19-first-run-setup.md

## Global Constraints
- Windows/Linux x64; Linux automatic package installation restricted to Debian/Ubuntu/Mint.
- rclone 1.74.4; cloudflared 2026.10.1; WinFsp 2.1.25156. SHA256 validation before use.
- No writes to global SSH/rclone configs; no copies of private keys; strict host verification.
- No installation concurrent with mounts/backups; preserve existing safety gates and silent shortcuts.

## Review Focus
- Paths containing spaces/unicode, malicious newlines/quotes, leading-option hostnames.
- Unknown/replaced host keys and editing a form after its fingerprint was shown.
- Cancellation, expired pending connections, simultaneous saves/installations, denied authorization.
- Private connection routing in BOTH backup and mount daemon, not just the wizard test.
- Missing/old binaries, partial packages, and a failed installer falsely appearing ready.

### Task 1: Bundled tools and native dependencies
Files: src/main/runtime-tools.ts, src/main/setup-process.ts, src/main/setup-dependencies.ts, src/shared/setup.ts, scripts/prepare-vendor.cjs, resources/vendor-manifest.json, package.json.
Interfaces: configureRuntimeTools(directory), resolveTool(name), runtimeEnvironment(base?); inspectComponents(rclone): Promise<SetupReport>; installComponents(rclone): Promise<SetupReport>.
- [x] Write tests for minimum versions, explicit overrides, package-manager allowlist and fixed elevation commands; run RED.
- [x] Implement typed runtime resolution and native installation; run targeted tests GREEN.
- [x] Add checksum-pinned build preparation, vendor packaging and deb dependencies; test integrity failure and absent files.
- [x] Commit tested task and ledger results.

### Task 2: Private connection setup
Files: src/main/connection-profiles.ts, src/main/setup-connections.ts, tests/setup-connections.test.cjs.
Interfaces: configureConnectionProfiles(directory), managedConnections(), managedRemoteFlags(remote); ConnectionSetup.prepare(draft), finish(token, confirmed), cancel(token), login(host).
- [x] Write tests for input validation, credential-free key probe, strict trust, no overwrite, cancellation, failed SFTP and private permissions; run RED.
- [x] Implement transaction-like pending profile creation and verification; run GREEN.
- [x] Route all rclone operations through private profile flags without changing legacy remotes; test read/mount/backup routes.
- [x] Commit tested task and ledger results.

### Task 3: IPC and first-run interface
Files: src/main/index.ts, src/shared/types.ts, src/preload/index.ts, src/renderer/src/SetupWizard.tsx, src/renderer/src/App.tsx, styles.css.
Interfaces: setupReport(), installComponents(), chooseSshKey(), prepareConnection(draft), saveConnection(token, confirmed), cancelConnection(token), cloudflareLogin(host).
- [x] Write real handler/UI tests for first-run entry, failed installation, form fields, fingerprint confirmation and forged IPC; run RED.
- [x] Implement wizard, friendly remote labels, busy coordination and narrowly guarded IPC; run GREEN.
- [x] Run all regression tests and inspect the rendered UI where tooling permits.
- [x] Commit tested task and ledger results.

### Task 4: Verification and delivery
- [x] Run full npm test, typecheck, build and packaging preflight; report unavailable checks separately.
- [x] Perform separate author review against Review Focus; fix serious findings with RED/GREEN tests.
- [x] Write Italian installation/update instructions, validation report and rollback notes.
- [x] Package changed files and full source; do not change remote main or deploy to personal machines.

## Execution outcome

226 local tests pass. Strict TypeScript checks of the new dependency-free setup modules pass. Full project typecheck/build and real payload downloads were attempted but blocked by unavailable npm/network dependencies. Native test is wired into GitHub Actions, not claimed as executed here. Windows UAC, Linux polkit, real mounts and Cloudflare login still require native validation. Work remains in an isolated local branch; delivery is source ZIPs, with no remote push.

Ruling: rclone was aligned from the initial provisional 1.74.2 to 1.74.4, matching the existing guarded native workflow; official SHA256 values were verified before changing the manifest.
