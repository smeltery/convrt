# Documentation

convrt is a local-first file converter. The CLI and macOS Quick Action call the
same engine in [`packages/core`](../packages/core). Bytes never leave the
machine.

```mermaid
flowchart LR
  finder["Finder / CLI"] --> cli["apps/cli"]
  cli --> core["packages/core"]
  core --> engines["Native engines"]
  engines --> output["Converted file beside input"]
```

## Guides

| Guide | Audience |
| --- | --- |
| [Getting started](getting-started/README.md) | New users and contributors |
| [Formats](formats/README.md) | Supported formats and engines |
| [macOS Quick Action](macos/README.md) | Right-click integration |
| [Architecture](architecture/README.md) | How conversion is wired |
| [Operations](operations/README.md) | CI, Flox, pre-commit, releases |

## Product invariants

1. Conversion runs on-device.
2. Input bytes are never uploaded, logged remotely, or sent to analytics.
3. Output lands next to the input unless `--out` is set.
4. Format support is explicit in docs and `listReadyFormats()`.
