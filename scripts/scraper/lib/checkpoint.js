import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Get the checkpoint file path for a given source slug.
 * @param {string} directory
 * @param {string} slug
 * @returns {string}
 */
export function getCheckpointPath(directory, slug) {
  return join(directory, `.checkpoint-${slug}.json`);
}

/**
 * Save checkpoint data to disk.
 * @param {string} path
 * @param {object} data
 */
export async function saveCheckpoint(path, data) {
  const payload = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  await writeFile(path, JSON.stringify(payload, null, 2), 'utf-8');
}

/**
 * Load checkpoint data from disk. Returns null if file doesn't exist.
 * @param {string} path
 * @returns {Promise<object|null>}
 */
export async function loadCheckpoint(path) {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}
