#!/usr/bin/env bash
set -euo pipefail
SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$(cd "$SITE_DIR/.." && pwd)"
PORT="${1:-4181}"
exec python3 "$CLIENT_DIR/scripts/serve_local.py" --dir "$SITE_DIR" --port "$PORT" --entry "/"
