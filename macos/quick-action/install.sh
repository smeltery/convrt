#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
src="$root/macos/quick-action/Convert with convrt.workflow"
dest="$HOME/Library/Services/Convert with convrt.workflow"

if ! command -v convrt >/dev/null 2>&1; then
  echo "convrt is not on PATH. Install the CLI first." >&2
  exit 1
fi

mkdir -p "$HOME/Library/Services"
rm -rf "$dest"
cp -R "$src" "$dest"
echo "Installed Quick Action → $dest"
echo "Right-click a file in Finder → Quick Actions → Convert with convrt"
