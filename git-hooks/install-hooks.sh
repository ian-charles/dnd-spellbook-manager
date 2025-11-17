#!/bin/bash
# Install git hooks from git-hooks/ directory to .git/hooks/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "Installing git hooks..."

# Copy pre-commit hook
cp "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"
echo "✓ Installed pre-commit hook"

# Copy pre-commit-review hook
cp "$SCRIPT_DIR/pre-commit-review" "$HOOKS_DIR/pre-commit-review"
chmod +x "$HOOKS_DIR/pre-commit-review"
echo "✓ Installed pre-commit-review hook"

# Disable post-commit hook (prevents background test processes)
if [ -f "$HOOKS_DIR/post-commit" ]; then
  chmod -x "$HOOKS_DIR/post-commit"
  echo "✓ Disabled post-commit hook"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Git hooks installed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Hooks will now run on every commit to:"
echo "  1. Review code for TDD anti-patterns and critical issues"
echo "  2. Run all tests to ensure code quality"
echo ""
echo "⚠️  NEVER bypass hooks with --no-verify or by killing processes!"
echo "    See claude.md for details on git hook policy."
echo ""
