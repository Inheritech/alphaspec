import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { safeWrite, readIfExists, ensureDir, pathExists } from '../src/lib/fs-utils';

// tmpdir() is a string on all platforms
const TMP = tmpdir();

let testDir: string;

afterEach(async () => {
  if (testDir) {
    await rm(testDir, { recursive: true, force: true });
  }
});

async function createTestDir(): Promise<string> {
  testDir = await mkdtemp(join(TMP, 'alphaspec-fs-'));
  return testDir;
}

describe('safeWrite', () => {
  it('writes content to a new file', async () => {
    const dir = await createTestDir();
    const filePath = join(dir, 'test.txt');
    await safeWrite(filePath, 'hello world');
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('hello world');
  });

  it('overwrites existing file atomically', async () => {
    const dir = await createTestDir();
    const filePath = join(dir, 'test.txt');
    await safeWrite(filePath, 'first');
    await safeWrite(filePath, 'second');
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('second');
  });

  it('leaves no tmp files on success', async () => {
    const dir = await createTestDir();
    const filePath = join(dir, 'test.txt');
    await safeWrite(filePath, 'content');
    const { readdir } = await import('node:fs/promises');
    const files = await readdir(dir);
    expect(files).toEqual(['test.txt']);
  });
});

describe('readIfExists', () => {
  it('returns file contents when file exists', async () => {
    const dir = await createTestDir();
    const filePath = join(dir, 'test.txt');
    await safeWrite(filePath, 'contents');
    const result = await readIfExists(filePath);
    expect(result).toBe('contents');
  });

  it('returns null when file does not exist', async () => {
    const dir = await createTestDir();
    const result = await readIfExists(join(dir, 'nonexistent.txt'));
    expect(result).toBeNull();
  });
});

describe('ensureDir', () => {
  it('creates a directory that does not exist', async () => {
    const dir = await createTestDir();
    const newDir = join(dir, 'deeply', 'nested', 'dir');
    await ensureDir(newDir);
    expect(await pathExists(newDir)).toBe(true);
  });

  it('is idempotent when directory already exists', async () => {
    const dir = await createTestDir();
    await ensureDir(dir);
    expect(await pathExists(dir)).toBe(true);
  });
});

describe('pathExists', () => {
  it('returns true for a file that exists', async () => {
    const dir = await createTestDir();
    const filePath = join(dir, 'file.txt');
    await safeWrite(filePath, '');
    expect(await pathExists(filePath)).toBe(true);
  });

  it('returns true for a directory that exists', async () => {
    const dir = await createTestDir();
    expect(await pathExists(dir)).toBe(true);
  });

  it('returns false for a path that does not exist', async () => {
    const dir = await createTestDir();
    expect(await pathExists(join(dir, 'nope'))).toBe(false);
  });
});
