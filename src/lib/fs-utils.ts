import { mkdir, writeFile, rename, readFile, stat } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function resolveTemplatesDir(): string {
  if (process.env.ALPHASPEC_TEMPLATES_DIR) {
    return process.env.ALPHASPEC_TEMPLATES_DIR;
  }
  // In bundled output (dist/cli.js), import.meta.url points to the bundle.
  // Templates are copied to dist/templates/ (same directory level).
  return join(dirname(fileURLToPath(import.meta.url)), 'templates');
}

export async function safeWrite(filePath: string, content: string): Promise<void> {
  const tmpPath = `${filePath}.tmp.${randomBytes(4).toString('hex')}`;
  try {
    await writeFile(tmpPath, content, 'utf-8');
    await rename(tmpPath, filePath);
  } catch (err) {
    // Clean up tmp file on failure (best effort)
    try { await import('node:fs/promises').then(fs => fs.unlink(tmpPath)); } catch { /* ignore */ }
    throw err;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function readIfExists(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf-8');
  } catch (err: any) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTemplate(relPath: string): Promise<string> {
  const fullPath = join(resolveTemplatesDir(), relPath);
  return readFile(fullPath, 'utf-8');
}
