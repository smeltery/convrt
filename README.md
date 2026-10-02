# convrt

[![CI](https://github.com/smeltery/convrt/actions/workflows/ci.yml/badge.svg)](https://github.com/smeltery/convrt/actions/workflows/ci.yml)
[![License: PolyForm Shield 1.0.0](https://img.shields.io/badge/license-PolyForm%20Shield%201.0.0-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/bun-1.3-black?logo=bun&logoColor=white)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/typescript-5+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Platform: macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](docs/macos/)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](.pre-commit-config.yaml)
[![Dev env: Flox](https://img.shields.io/badge/dev%20env-flox-7c3aed.svg)](https://flox.dev)

Right-click any file and convert it. Images first — HEIC, PNG, JPEG, WebP,
AVIF, TIFF, GIF — with native engines that stay on your machine. Nothing gets
uploaded.

```sh
convrt miso.heic --to webp
# miso.heic → miso.webp
# 4.8 MB → 612 KB · 0.08s
```

## Docs

Start at [docs/](docs/README.md).

- [Getting started](docs/getting-started/README.md)
- [Formats](docs/formats/README.md)
- [macOS Quick Action](docs/macos/README.md)
- [Architecture](docs/architecture/README.md)
- [Operations / CI](docs/operations/README.md)

## Quick start

Install [Bun](https://bun.sh/) 1.3, or enter the Flox environment:

```sh
flox activate
bun install --frozen-lockfile
bun run ci
```

Useful commands:

| Task | Command |
| --- | --- |
| Convert a file | `bun run apps/cli/src/cli.ts photo.png --to webp` |
| Website | `bun run --filter @convrt/web dev` |
| Full gate | `bun run ci` |

## Repository

| Area | Responsibility |
| --- | --- |
| [`apps/cli`](apps/cli) | `convrt` command-line interface |
| [`apps/web`](apps/web) | Marketing site (paper design) |
| [`packages/core`](packages/core) | Local conversion engine |
| [`macos/quick-action`](macos/quick-action) | Finder Quick Action installer |
| [`docs/`](docs) | User and contributor documentation |

## License

[PolyForm Shield 1.0.0](LICENSE)
