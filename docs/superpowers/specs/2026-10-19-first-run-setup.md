# Drive Tambu: first-run setup

Approved conversation scope: include official rclone; install missing native components with operating-system authorization; add SSH/SFTP servers in the app (existing SSH alias, direct SSH, Cloudflare); reuse an existing key or agent. No key generation, remote provisioning, passwords in the renderer, or changes to existing SSH/rclone profiles.

Targets: Windows x64 and Linux x64. Debian/Ubuntu/Mint support package installation; other distributions receive an explicit unsupported-install message. AppImage does not remove its own host runtime requirements. Drivers require OS authorization. No silent elevation or automatic reboot.

Bundle rclone 1.74.4 and cloudflared 2026.10.1, unmodified, checksum-pinned, with licensing material. Windows also ships the original WinFsp 2.1.25156 MSI. A build must fail rather than produce an installer with absent/mismatched payloads. User-selected rclone overrides remain respected; diagnose versions below 1.64.0.

Keep global rclone.conf and ~/.ssh/config untouched. Newly created connections live under userData/connections-v1, with random internal remote IDs, friendly labels, private configuration permissions, and references to existing keys (not copies). Every read, mount and backup explicitly selects the same managed configuration. Legacy remotes retain their existing behavior.

Use structured fields, validate in main, no arbitrary commands/URLs/IPC. Existing SSH mode retains SSH configuration but enforces noninteractive authentication and strict host verification. New direct/Cloudflare connections probe the host key without offering any credential, display its SHA256 fingerprint, and require explicit confirmation before authentication. No changed-key bypass. The probe's private known_hosts stays bound to the exact pending connection. Connection is listed only after successful SFTP verification. Cancel/error never overwrites a saved connection.

First-run wizard appears when no connections exist or rclone is unavailable/incompatible, in the existing window (no changes to silent-launch logic). Settings always allow adding another server. Cloudflare login is an explicit action invoking the bundled client; stdout/tokens never reach UI/logs. Public key fingerprint is not an authentication credential.

Preserve guarded close, cache, backup, stable shortcut behavior. Native installation cannot start with active mounts/backups. Quit and new conflicting operations are blocked while setup is busy; scheduling resumes afterward. Uninstaller does not recursively delete connection data, keys, caches, backups or system dependencies.

Validation: baseline 188 tests; new unit/integration and real component-handler tests; full suite; typecheck/build where dependencies are available; native installation and real SFTP tests must be separately reported, not inferred from mocks.
