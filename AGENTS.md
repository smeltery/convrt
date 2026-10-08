# convrt contributor instructions

convrt converts files locally through desktop, shell menus, and CLI.
The separate Cloud API uploads only files explicitly sent by its clients.

## Product invariants

- Desktop, shell-menu, and CLI conversion stays on-device. Cloud conversion is
  explicit and confined to `apps/api` and `packages/sdk`.
- Do not send file contents, paths, sizes, or previews to analytics or logs.
- Encode/decode belongs in `@convrt/core` engines (sharp, ffmpeg, pdf); UI and
  CLI must not call those engines directly.
- Keep the website honest about ready vs planned formats.
- License is PolyForm Shield 1.0.0 — do not relicense casually.

## Repository boundaries

- `apps/cli`: argv and human-readable output.
- `apps/web`: paper marketing site only.
- `apps/desktop`: desktop UI and worker transport, never direct codecs.
- `apps/api`: authenticated uploads, job lifecycle, and isolated workers.
- `packages/sdk`: explicit Cloud API client.
- `integrations`: Windows and Linux shell installers.
- `packages/core`: format table + conversion.
- `macos/quick-action`: Automator service wrapper.
- `docs/`: user-facing documentation with mermaid diagrams.

## Working rules

- Use Bun and root scripts. Prefer `flox activate`.
- Keep modules small and TypeScript strict.
- Honor LOC budgets in `scripts/file-size-budgets.json` (default 200 lines)
  and flat-directory budgets (default 15 files).
- Pre-commit mirrors CI; fix failures instead of skipping hooks.
- Never claim a format works until a test or manual conversion proves it.
