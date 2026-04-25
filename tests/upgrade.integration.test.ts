import { describe, it, expect, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.ALPHASPEC_TEMPLATES_DIR = join(__dirname, '..', 'src', 'templates');
// Pin a deterministic current version for the upgrade tests
process.env.ALPHASPEC_VERSION = '0.3.0';

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  log: {
    success: vi.fn(),
    info: vi.fn(),
    message: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn(), message: vi.fn() })),
  confirm: vi.fn().mockResolvedValue(true),
  multiselect: vi.fn().mockResolvedValue([]),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
}));

const { runUpgrade } = await import('../src/commands/upgrade');
const { runInit } = await import('../src/commands/init');

const TMP = tmpdir();
let testDir: string;

afterEach(async () => {
  if (testDir) await rm(testDir, { recursive: true, force: true });
});

async function freshDir(): Promise<string> {
  testDir = await mkdtemp(join(TMP, 'alphaspec-upgrade-'));
  return testDir;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stub a 0.2.0-shaped install on disk: dot-prefix slug files for each tool plus
 * the orphaned `.alphaspec/prompts/` folder and a `create-story` legacy slug.
 */
async function stub020Layout(dir: string, tools: string[]): Promise<void> {
  await mkdir(join(dir, '.alphaspec', 'prompts'), { recursive: true });
  await writeFile(join(dir, '.alphaspec', 'prompts', 'create-story.md'), '# legacy source-of-truth\n');

  const config = {
    version: '0.2.0',
    tools,
    storiesDir: 'stories',
    initializedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
  await writeFile(join(dir, '.alphaspec', 'config.json'), JSON.stringify(config, null, 2) + '\n');

  // Stories layout (always present in 0.2.0)
  await mkdir(join(dir, 'stories', 'pending'), { recursive: true });
  await mkdir(join(dir, 'stories', 'done'), { recursive: true });

  const dotSlugs = ['create-story', 'complete-story', 'implement-story'];

  if (tools.includes('cursor')) {
    await mkdir(join(dir, '.cursor', 'commands'), { recursive: true });
    for (const slug of dotSlugs) {
      await writeFile(join(dir, '.cursor', 'commands', `alphaspec.${slug}.md`), '# legacy\n');
    }
  }
  if (tools.includes('claude-code')) {
    for (const slug of dotSlugs) {
      const skillDir = join(dir, '.claude', 'skills', `alphaspec.${slug}`);
      await mkdir(skillDir, { recursive: true });
      await writeFile(join(skillDir, 'SKILL.md'), '# legacy\n');
    }
  }
  if (tools.includes('github-copilot')) {
    await mkdir(join(dir, '.github', 'prompts'), { recursive: true });
    await writeFile(join(dir, '.github', 'prompts', 'create-story.prompt.md'), '# legacy\n');
    for (const slug of dotSlugs) {
      const skillDir = join(dir, '.github', 'skills', `alphaspec.${slug}`);
      await mkdir(skillDir, { recursive: true });
      await writeFile(join(skillDir, 'SKILL.md'), '# legacy\n');
    }
  }
}

describe('upgrade — from 0.2.0 to 0.3.0', () => {
  it('removes dot-form legacy artifacts and writes the new alphaspec-<slug> layout', async () => {
    const dir = await freshDir();
    await stub020Layout(dir, ['cursor']);

    // Sanity: legacy is present
    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec.create-story.md'))).toBe(true);
    expect(await fileExists(join(dir, '.alphaspec', 'prompts'))).toBe(true);

    await runUpgrade({ dir, yes: true });

    // Legacy is gone
    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec.create-story.md'))).toBe(false);
    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec.complete-story.md'))).toBe(false);
    expect(await fileExists(join(dir, '.alphaspec', 'prompts'))).toBe(false);

    // New layout is present
    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec-create-stories.md'))).toBe(true);
    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec-refine-story.md'))).toBe(true);

    // Config is bumped
    const cfg = JSON.parse(await readFile(join(dir, '.alphaspec', 'config.json'), 'utf-8'));
    expect(cfg.version).toBe('0.3.0');
    expect(cfg.tools).toEqual(['cursor']);
    // initializedAt preserved
    expect(cfg.initializedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('cleans github-copilot legacy create-story.prompt.md and dot-form skill dirs', async () => {
    const dir = await freshDir();
    await stub020Layout(dir, ['github-copilot']);

    await runUpgrade({ dir, yes: true });

    expect(await fileExists(join(dir, '.github', 'prompts', 'create-story.prompt.md'))).toBe(false);
    expect(await fileExists(join(dir, '.github', 'skills', 'alphaspec.create-story'))).toBe(false);
    expect(await fileExists(join(dir, '.github', 'skills', 'alphaspec-create-stories', 'SKILL.md'))).toBe(true);
  });

  it('is idempotent — running upgrade twice does not error and leaves clean state', async () => {
    const dir = await freshDir();
    await stub020Layout(dir, ['cursor', 'claude-code']);

    await runUpgrade({ dir, yes: true });
    await runUpgrade({ dir, yes: true });

    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec-create-stories.md'))).toBe(true);
    expect(await fileExists(join(dir, '.claude', 'skills', 'alphaspec-create-stories', 'SKILL.md'))).toBe(true);

    const cfg = JSON.parse(await readFile(join(dir, '.alphaspec', 'config.json'), 'utf-8'));
    expect(cfg.version).toBe('0.3.0');
  });

  it('refuses with a clear pointer when there is no install to upgrade', async () => {
    const dir = await freshDir();
    // No config — should not throw
    await expect(runUpgrade({ dir, yes: true })).resolves.toBeUndefined();
  });
});

describe('init — drift detection', () => {
  it('refuses to run on a stale install and points the user to `upgrade`', async () => {
    const dir = await freshDir();
    await stub020Layout(dir, ['cursor']);

    await runInit({ dir, tools: 'cursor', yes: true });

    // Drift path bails before reapplying writers — legacy files remain untouched
    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec.create-story.md'))).toBe(true);
    // No new-form files were written
    expect(await fileExists(join(dir, '.cursor', 'commands', 'alphaspec-create-stories.md'))).toBe(false);

    // Config version unchanged
    const cfg = JSON.parse(await readFile(join(dir, '.alphaspec', 'config.json'), 'utf-8'));
    expect(cfg.version).toBe('0.2.0');
  });
});
