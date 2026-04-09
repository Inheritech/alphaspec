import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { ensureDir, safeWrite, readIfExists, pathExists, readTemplate } from '../fs-utils';
import { replaceOrAppendSentinelBlock, removeSentinelBlock } from '../sentinels';
import { PROMPT_NAMES } from '../templates';

// Skills — auto-loaded in agent mode by relevance
const SKILLS_BASE = '.github/skills';
// Prompt files — explicitly invocable via #slug or prompt picker
const PROMPTS_DIR = '.github/prompts';
// User-owned instructions file (sentinel)
const INSTRUCTIONS_FILE = '.github/copilot-instructions.md';

// NOTE: This writer never touches .github/agents/ — that is a separate Copilot concept.

export async function apply(dir: string): Promise<void> {
  // Write skills (SKILL.md per slug)
  for (const slug of PROMPT_NAMES) {
    const skillDir = join(dir, SKILLS_BASE, slug);
    await ensureDir(skillDir);
    const content = await readTemplate(`prompts/${slug}.md`);
    await safeWrite(join(skillDir, 'SKILL.md'), content);
  }

  // Also write prompt files for explicit invocation
  await ensureDir(join(dir, PROMPTS_DIR));
  for (const slug of PROMPT_NAMES) {
    const content = await readTemplate(`prompts/${slug}.md`);
    await safeWrite(join(dir, PROMPTS_DIR, `${slug}.prompt.md`), content);
  }

  // Write/update workflow instructions in copilot-instructions.md (user-owned, sentinel)
  const instructionsPath = join(dir, INSTRUCTIONS_FILE);
  await ensureDir(join(dir, '.github'));
  const instructionContent = await readTemplate('instructions/github-copilot.md');
  const existing = (await readIfExists(instructionsPath)) ?? '';
  const updated = replaceOrAppendSentinelBlock(existing, instructionContent);
  await safeWrite(instructionsPath, updated);
}

export async function remove(dir: string): Promise<void> {
  // Remove skill folders
  for (const slug of PROMPT_NAMES) {
    const skillDir = join(dir, SKILLS_BASE, slug);
    const { rm } = await import('node:fs/promises');
    await rm(skillDir, { recursive: true, force: true });
  }

  // Remove prompt files
  for (const slug of PROMPT_NAMES) {
    const filePath = join(dir, PROMPTS_DIR, `${slug}.prompt.md`);
    if (await pathExists(filePath)) {
      await unlink(filePath);
    }
  }

  // Remove sentinel block from copilot-instructions.md; delete if empty
  const instructionsPath = join(dir, INSTRUCTIONS_FILE);
  const existing = await readIfExists(instructionsPath);
  if (existing !== null) {
    const updated = removeSentinelBlock(existing);
    if (updated.trim()) {
      await safeWrite(instructionsPath, updated);
    } else {
      await unlink(instructionsPath);
    }
  }
}
