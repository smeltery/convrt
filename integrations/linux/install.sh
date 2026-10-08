#!/usr/bin/env bash
set -euo pipefail
app="${1:-}"
if [[ ! -x "$app" || "$app" != /* ]]; then
  echo "Usage: install.sh /absolute/path/to/convrt.AppImage" >&2
  exit 1
fi
# Escape the desktop Exec field independently from shell quoting.
exec_path="${app//\\/\\\\}"
exec_path="${exec_path//\"/\\\"}"
exec_path="${exec_path//\$/\\\$}"
exec_path="${exec_path//\`/\\\`}"
exec_path="${exec_path//%/%%}"
data_dir="${XDG_DATA_HOME:-$HOME/.local/share}"
mkdir -p "$data_dir/applications" "$data_dir/nautilus/scripts"
cat > "$data_dir/applications/convrt.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Convert with convrt
Exec="$exec_path" %F
Terminal=false
Categories=Utility;
MimeType=image/png;image/jpeg;image/webp;application/pdf;video/mp4;audio/mpeg;
DESKTOP
printf '#!/usr/bin/env bash\nexec %q "$@"\n' "$app" > "$data_dir/nautilus/scripts/Convert with convrt"
chmod +x "$data_dir/nautilus/scripts/Convert with convrt"
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$data_dir/applications"
fi
echo "Installed Open With entry and Nautilus Scripts action."
