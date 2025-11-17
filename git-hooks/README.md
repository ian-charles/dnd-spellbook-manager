# Git Hooks

This directory contains git hooks that enforce code quality and testing standards.

## Installation

Run the installation script to set up the hooks:

```bash
./git-hooks/install-hooks.sh
```

This will:
- Install `pre-commit` hook (runs code review and tests)
- Install `pre-commit-review` hook (TDD-aware Claude Code review)
- Disable `post-commit` hook (prevents background test processes)

## Hooks

### pre-commit

Runs before every commit to ensure code quality:

1. **Code Review** - Claude Code reviews changes for:
   - TDD anti-patterns (testing implementation details, fragile tests, etc.)
   - Logic errors (off-by-one, null handling, edge cases)
   - Type safety issues
   - Performance problems
   - Security vulnerabilities
   - Code quality issues

2. **Tests** - Runs full test suite (`npm test`)

If either step fails, the commit is aborted.

### pre-commit-review

TDD-aware code reviewer that analyzes staged changes using Claude Code.

**CRITICAL**: This hook will NEVER suggest using `--no-verify` to bypass checks.

## Important: NEVER Bypass Hooks

From `claude.md` Rule #2:

> **NEVER bypass or kill git hooks** - Hooks exist for quality control:
> - NEVER use `--no-verify` to bypass hooks
> - NEVER kill hook processes (pkill, Ctrl+C, etc.)
> - NEVER disable or remove hooks to commit faster
> - If pre-commit hook fails, fix the issue, don't bypass it
> - If tests are slow, optimize them, don't skip them
> - If hooks are broken, fix the hooks, don't bypass them
> - Bypassing hooks = shipping broken code to production
> - Killing hooks = worse than bypassing (no record of what was skipped)

## Modifying Hooks

If you need to modify hooks:

1. Edit the files in `git-hooks/` directory
2. Run `./git-hooks/install-hooks.sh` to apply changes
3. Commit the updated hooks to the repository
4. All team members should re-run install script to get updates

## Testing Hooks

To test hooks without committing:

```bash
# Run pre-commit hook manually
.git/hooks/pre-commit

# Or test with a temporary commit
git commit --allow-empty -m "test: testing hooks"
```

## Why Hooks Are in git-hooks/

Git hooks in `.git/hooks/` are not tracked by version control. By keeping them in `git-hooks/`, we ensure:

1. ✅ Hooks are version controlled
2. ✅ All team members have the same hooks
3. ✅ Hook updates are tracked in git history
4. ✅ New developers get hooks automatically
5. ✅ CI/CD can verify hooks are installed

## Troubleshooting

### "Hook failed but I need to commit urgently"

**Don't bypass the hook!** Instead:

1. Check what failed (review output or test results)
2. Fix the actual issue
3. Commit the fix

If tests are slow, that's a test performance problem - optimize the tests, don't bypass them.

### "I accidentally bypassed a hook"

If you used `--no-verify`:

1. Immediately revert the commit: `git reset HEAD~1`
2. Fix the issues that caused the hook to fail
3. Commit properly with hooks running

### "Tests are timing out"

This is a test performance issue, not a hook issue:

1. Investigate which tests are slow
2. Optimize slow tests (reduce timeouts, mock expensive operations)
3. Consider splitting E2E tests from unit tests
4. Make unit tests fast (< 1s), E2E tests reasonable (< 30s)

See the Puppeteer testing guidelines in `claude.md` for E2E test best practices.
