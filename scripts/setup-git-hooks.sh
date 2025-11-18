#!/bin/bash

# Setup script to install git hooks from scripts/git-hooks/ to .git/hooks/
# Run this script after cloning the repository to enable automated git hooks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_SOURCE="$SCRIPT_DIR/git-hooks"
HOOKS_DEST="$PROJECT_ROOT/.git/hooks"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setting up git hooks..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .git directory exists
if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo "❌ Error: .git directory not found. Are you in a git repository?"
  exit 1
fi

# Check if hooks source directory exists
if [ ! -d "$HOOKS_SOURCE" ]; then
  echo "❌ Error: $HOOKS_SOURCE directory not found"
  exit 1
fi

# Copy each hook from source to destination
for hook_file in "$HOOKS_SOURCE"/*; do
  if [ -f "$hook_file" ]; then
    hook_name=$(basename "$hook_file")
    echo "Installing $hook_name..."
    cp "$hook_file" "$HOOKS_DEST/$hook_name"
    chmod +x "$HOOKS_DEST/$hook_name"
    echo "✅ $hook_name installed"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Git hooks setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Installed hooks:"
ls -la "$HOOKS_DEST" | grep -E "^-rwx" | awk '{print "  - " $9}'
echo ""
