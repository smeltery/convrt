# Architecture

```mermaid
flowchart TB
  subgraph clients [Clients]
    web["apps/web"]
    cli["apps/cli"]
    qa["macos/quick-action"]
  end

  subgraph engine [Engine]
    core["packages/core"]
    formats["formats.ts"]
    convert["convert.ts"]
  end

  qa --> cli
  cli --> core
  core --> formats
  core --> convert
  convert --> sharp["sharp"]
  web -.-> docs["docs/ + GitHub releases"]
```

## Boundaries

| Package | Owns | Does not own |
| --- | --- | --- |
| `@convrt/core` | Format table, conversion, errors | CLI flags, UI, distribution |
| `@convrt/cli` | argv parsing, human output | Encode details |
| `@convrt/web` | Marketing site | Conversion runtime |
| `macos/quick-action` | Finder service install | Engines |

## Failure model

`ConvertError` covers missing files, unknown formats, decode-only targets, and
invalid quality. The CLI prints `convrt: <message>` and exits `1`. Partial
outputs are not left behind on encode failure because `Bun.write` runs only
after a full buffer is produced.
