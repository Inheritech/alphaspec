import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { ensureDir, safeWrite, readIfExists, pathExists, readTemplate } from '../fs-utils';
import { replaceOrAppendSentinelBlock, removeSentinelBlock } from '../sentinels';
import { PROMPT_NAMES, PROMPT_SLUG_PREFIX, type TemplateVars } from '../templates';

// Skills — auto-loaded in agent mode by relevance
const SKILLS_BASE = '.github/skills';
// Legacy prompt dir — no longer written, kept for backward-compat cleanup
const LEGACY_PROMPTS_DIR = '.github/prompts';
// User-owned instructions file (sentinel)
const INSTRUCTIONS_FILE = '.github/copilot-instructions.md';

// NOTE: This writer never touches .github/agents/ — that is a separate Copilot concept.

export async function apply(dir: string, vars?: TemplateVars): Promise<void> {
  // Write skills (SKILL.md per slug)
  for (const slug of PROMPT_NAMES) {
    const skillDir = join(dir, SKILLS_BASE, `${PROMPT_SLUG_PREFIX}${slug}`);
    await ensureDir(skillDir);
    let content = await readTemplate(`prompts/${slug}.md`, vars);
    // Prefix the frontmatter name so Copilot registers the skill as "alphaspec.<slug>"
    content = content.replace(`name: ${slug}`, `name: ${PROMPT_SLUG_PREFIX}${slug}`);
    await safeWrite(join(skillDir, 'SKILL.md'), content);
  }

  // Write/update workflow instructions in copilot-instructions.md (user-owned, sentinel)
  const instructionsPath = join(dir, INSTRUCTIONS_FILE);
  await ensureDir(join(dir, '.github'));
  const instructionContent = await readTemplate('instructions/github-copilot.md', vars);
  const existing = (await readIfExists(instructionsPath)) ?? '';
  const updated = replaceOrAppendSentinelBlock(existing, instructionContent);
  await safeWrite(instructionsPath, updated);
}

export async function remove(dir: string): Promise<void> {
  const { rm } = await import('node:fs/promises');

  // Remove prefixed skill folders
  for (const slug of PROMPT_NAMES) {
    const skillDir = join(dir, SKILLS_BASE, `${PROMPT_SLUG_PREFIX}${slug}`);
    await rm(skillDir, { recursive: true, force: true });
    // Also clean up legacy unprefixed dirs
    await rm(join(dir, SKILLS_BASE, slug), { recursive: true, force: true });
  }

  // Clean up legacy prompt files (no longer written)
  for (const slug of PROMPT_NAMES) {
    const filePath = join(dir, LEGACY_PROMPTS_DIR, `${slug}.prompt.md`);
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
