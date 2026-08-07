#!/usr/bin/env bash
set -euo pipefail

# FAD frontend (fad-fe-003) installer
#
# Run from the already-prepared directory with unpacked sources:
#   tar -xzf sources.tar.gz
#   cd fad-fe-003
#   ./install.sh
#
# It prepares the build environment and generates the frontend (dist/<version>,
# where the version is read from src/config/config.js).
# The generated output is a set of static HTML/JS/CSS files - it is served by
# the httpd daemon (nginx), NOT by any node process. Nothing is started here.
#
# IMPORTANT:
#  - The backend node process is started by the system and is NEVER touched.
#  - The frontend build uses a separate modern Node (>= 20) so it does not
#    depend on the system Node's version.
#  - No Node is installed, no node process is started or stopped, and no
#    system settings are changed.
#  - Build Node selection order: $FAD_NODE > user nvm Node (>= 20) > system
#    Node (only if it is already >= 20).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Sanity check: we must be in the directory with the unpacked sources.
if [ ! -f package.json ] || [ ! -d src ]; then
  echo "ERROR: package.json or src/ not found in $SCRIPT_DIR." >&2
  echo "  Run this script from the directory with the unpacked frontend sources." >&2
  exit 1
fi

echo "=== FAD frontend installer ==="
echo "  working dir : $SCRIPT_DIR"
echo

# --- 1. Build Node selection ------------------------------------------------
# Capture the system Node path BEFORE we touch PATH - it is what the backend
# runs on (managed by the system).
SYSTEM_NODE="$(command -v node 2>/dev/null || true)"

pick_build_node() {
  local major best="" best_major=0 d
  if [ -n "${FAD_NODE:-}" ]; then
    if [ -x "$FAD_NODE" ]; then
      major="$("$FAD_NODE" -v 2>/dev/null | sed -E 's/v([0-9]+).*/\1/')"
      if [ -n "$major" ] && [ "$major" -ge 20 ]; then
        echo "$FAD_NODE"
        return 0
      fi
    fi
    echo ""
    return 1
  fi
  for d in "$HOME"/.nvm/versions/node/v*/bin; do
    [ -x "$d/node" ] || continue
    major="$("$d/node" -v 2>/dev/null | sed -E 's/v([0-9]+).*/\1/')"
    if [ -n "$major" ] && [ "$major" -ge 20 ] && [ "$major" -gt "$best_major" ]; then
      best="$d/node"
      best_major="$major"
    fi
  done
  if [ -n "$best" ]; then
    echo "$best"
    return 0
  fi
  if [ -n "$SYSTEM_NODE" ]; then
    major="$("$SYSTEM_NODE" -v 2>/dev/null | sed -E 's/v([0-9]+).*/\1/')"
    if [ -n "$major" ] && [ "$major" -ge 20 ]; then
      echo "$SYSTEM_NODE"
      return 0
    fi
  fi
  echo ""
  return 1
}

BUILD_NODE="$(pick_build_node || true)"
if [ -z "$BUILD_NODE" ]; then
  echo "ERROR: no modern Node (>= 20) found for the frontend build." >&2
  echo "  The backend node process stays on the system Node and is NOT touched." >&2
  echo "  Provide a build Node explicitly, e.g.:" >&2
  echo "    FAD_NODE=/path/to/node22 ./install.sh" >&2
  exit 1
fi

BUILD_BIN="$(dirname "$BUILD_NODE")"
export PATH="$BUILD_BIN:$PATH"

if [ -n "$SYSTEM_NODE" ]; then
  echo "Backend node (system, untouched) : $("$SYSTEM_NODE" -v) ($SYSTEM_NODE)"
fi
echo "Frontend build node (>= 20)      : $("$BUILD_NODE" -v) ($BUILD_NODE)"
echo

# --- 2. Install dependencies ----------------------------------------------
echo "--- Installing dependencies ---"
rm -rf node_modules package-lock.json
npm install --no-audit --no-fund
echo

# --- 3. Update outdated packages ------------------------------------------
echo "--- Updating outdated packages ---"
if [ "${FAD_NO_UPDATE:-0}" = "1" ]; then
  echo "Skipped (FAD_NO_UPDATE=1). Outdated packages:"
  npm outdated || true
else
  npm outdated || true
  echo
  npm update --no-audit --no-fund
fi
echo

# --- 4. Build --------------------------------------------------------------
VERSION="$("$BUILD_NODE" -e "console.log(require('./src/config/config.js').version)")"
echo "--- Building frontend (version: $VERSION) ---"
npm run build
echo

echo "=== DONE ==="
echo "Frontend built in : $SCRIPT_DIR/dist/$VERSION"
echo
echo "These are static files - serve them with your httpd (nginx). See README.md"
echo "for the nginx location block and the config.js paths (backend API URI /"
echo "frontend base URI)."
