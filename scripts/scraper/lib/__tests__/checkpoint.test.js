import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { saveCheckpoint, loadCheckpoint, getCheckpointPath } from '../checkpoint.js';

const TEST_DIR = join(import.meta.dirname, '__tmp_checkpoint_test__');

beforeEach(async () => {
  await mkdir(TEST_DIR, { recursive: true });
});

afterEach(async () => {
  await rm(TEST_DIR, { recursive: true, force: true });
});

describe('getCheckpointPath', () => {
  it('returns path based on directory and slug', () => {
    const p = getCheckpointPath('/some/dir', 'xanathars');
    expect(p).toMatch(/\.checkpoint-xanathars\.json$/);
  });
});

describe('saveCheckpoint / loadCheckpoint', () => {
  it('round-trips checkpoint data', async () => {
    const path = join(TEST_DIR, '.checkpoint-test.json');
    const data = {
      source: 'Test Source',
      phase: 'detail',
      urls: ['https://example.com/spell-a', 'https://example.com/spell-b'],
      completed: ['https://example.com/spell-a'],
      failed: [],
      spells: [{ id: 'spell-a-test-source', name: 'Spell A' }],
    };

    await saveCheckpoint(path, data);
    const loaded = await loadCheckpoint(path);

    expect(loaded.source).toBe('Test Source');
    expect(loaded.phase).toBe('detail');
    expect(loaded.urls).toEqual(data.urls);
    expect(loaded.completed).toEqual(data.completed);
    expect(loaded.spells).toHaveLength(1);
    expect(loaded.lastUpdated).toBeDefined();
  });

  it('returns null when checkpoint does not exist', async () => {
    const loaded = await loadCheckpoint(join(TEST_DIR, 'nonexistent.json'));
    expect(loaded).toBeNull();
  });

  it('overwrites existing checkpoint', async () => {
    const path = join(TEST_DIR, '.checkpoint-overwrite.json');

    await saveCheckpoint(path, { source: 'A', phase: 'listing', urls: [], completed: [], failed: [], spells: [] });
    await saveCheckpoint(path, { source: 'B', phase: 'detail', urls: ['u1'], completed: [], failed: [], spells: [] });

    const loaded = await loadCheckpoint(path);
    expect(loaded.source).toBe('B');
    expect(loaded.phase).toBe('detail');
  });
});
