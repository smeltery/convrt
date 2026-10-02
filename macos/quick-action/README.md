# macOS Quick Action

Install a Finder Quick Action that runs `convrt` on the selected files.

## Prerequisites

1. Install the `convrt` CLI onto your `PATH`.
2. macOS Sequoia or later is recommended.

## Install

```sh
./macos/quick-action/install.sh
```

This copies `Convert with convrt.workflow` into
`~/Library/Services/`.

## Use

1. Select one or more files in Finder.
2. Right-click → **Quick Actions** → **Convert with convrt**.
3. Choose the destination format when prompted.

The workflow shells out to `convrt <file> --to <format>` and never uploads
bytes.
