# Contributing

## Setup

```sh
flox activate
bun install --frozen-lockfile
bun run ci
```

## Workflow

```mermaid
flowchart LR
  branch["branch off main"] --> change["focused change"]
  change --> gate["bun run ci"]
  gate -->|fails| change
  gate -->|passes| pr["open PR"]
  pr --> actions["GitHub Actions"]
  actions -->|green| merge["merge"]
```

1. Branch off `main`.
2. Keep commits focused.
3. Run `bun run ci` before pushing.
4. Open a PR. CI must pass.

## Pre-commit

```sh
pre-commit install
pre-commit run --all-files
```

Hooks mirror CI: format, lint, typecheck, tests, markdown, mermaid, doc links,
budgets, and actionlint.

## Guidelines

Read [AGENTS.md](AGENTS.md) and [docs/architecture](docs/architecture/README.md)
before changing conversion boundaries or release automation.
