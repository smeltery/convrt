#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
shellcheck macos/quick-action/install.sh scripts/*.sh integrations/linux/*.sh
