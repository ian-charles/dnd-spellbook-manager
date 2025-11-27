/**
 * Git Hooks Setup Script
 * 
 * Purpose: Automatically installs git hooks from scripts/git-hooks/ to .git/hooks/
 * Run by: npm prepare hook (runs automatically after npm install)
 * 
 * Exit codes:
 * 0 - Success
 * 1 - Failure (.git directory not found or hooks source missing)
 */
import { copyFile, chmod, mkdir, readdir, stat } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const HOOKS_SOURCE = join(__dirname, 'git-hooks');
const HOOKS_DEST = join(PROJECT_ROOT, '.git', 'hooks');

async function setupHooks() {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Setting up git hooks...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Check if .git directory exists
  if (!existsSync(join(PROJECT_ROOT, '.git'))) {
    console.error('❌ Error: .git directory not found. Are you in a git repository?');
    process.exit(1);
  }

  // Check if hooks source directory exists
  if (!existsSync(HOOKS_SOURCE)) {
    console.error(`❌ Error: ${HOOKS_SOURCE} directory not found`);
    process.exit(1);
  }

  try {
    // Ensure destination directory exists
    if (!existsSync(HOOKS_DEST)) {
      await mkdir(HOOKS_DEST, { recursive: true });
    }

    const files = await readdir(HOOKS_SOURCE);

    for (const file of files) {
      const sourcePath = join(HOOKS_SOURCE, file);
      const destPath = join(HOOKS_DEST, file);

      const stats = await stat(sourcePath);

      if (stats.isFile()) {
        console.log(`Installing ${file}...`);
        await copyFile(sourcePath, destPath);

        // Make executable (mainly for Mac/Linux)
        // On Windows, chmod might fail or be irrelevant, but Node.js usually handles it.
        // We explicitly ignore errors on Windows to prevent setup failure,
        // while logging warnings on other platforms if permissions can't be set.
        try {
          await chmod(destPath, '755');
        } catch (err) {
          // Ignore chmod errors on Windows if they happen, though Node usually handles it gracefully
          if (process.platform !== 'win32') {
            console.warn(`⚠️ Warning: Could not set executable permissions for ${file}: ${err.message}`);
          }
        }

        console.log(`✅ ${file} installed`);
      }
    }

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Git hooks setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

  } catch (error) {
    console.error('❌ Error setting up hooks:', error);
    process.exit(1);
  }
}

setupHooks();
