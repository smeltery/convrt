#!/usr/bin/env bash
set -euo pipefail
data_dir="${XDG_DATA_HOME:-$HOME/.local/share}"
rm -f "$data_dir/applications/convrt.desktop" "$data_dir/nautilus/scripts/Convert with convrt"
