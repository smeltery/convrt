# Getting started

## Install the toolchain

Prefer Flox so the same tools run locally and in CI:

```sh
flox activate
bun install --frozen-lockfile
```

Without Flox, install [Bun](https://bun.sh/) 1.3, [pre-commit](https://pre-commit.com/),
[ffmpeg](https://ffmpeg.org/), and [poppler](https://poppler.freedesktop.org/)
(`pdftoppm`).

## Convert a file

```sh
bun run apps/cli/src/cli.ts sample.png --to webp
bun run apps/cli/src/cli.ts clip.mp4 --to mp3
bun run apps/cli/src/cli.ts slide.pdf --to png
bun run apps/cli/src/cli.ts formats
```

For an installed CLI, add `apps/desktop/dist` to your PATH after running
`bun run --filter @convrt/desktop build`. Keep that directory intact.

See [desktop setup](../desktop/README.md) for the window and shell menus and
[Cloud API](../api/README.md) for explicit server-side conversion.

Quality defaults to `82`. Override with `--quality 70`.

## Website

```sh
bun run --filter @convrt/web dev
```

Open `http://localhost:5173`.

## Verify

```sh
bun run ci
```

That mirrors GitHub Actions: format, lint, typecheck, test, build, and doc
hygiene (markdown, mermaid, links, budgets).
