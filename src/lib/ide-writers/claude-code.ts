import { join } from 'node:path';
import { rm, unlink } from 'node:fs/promises';
import { ensureDir, safeWrite, readIfExists, readTemplate } from '../fs-utils';
import { replaceOrAppendSentinelBlock, removeSentinelBlock } from '../sentinels';
import { PROMPT_NAMES, PROMPT_SLUG_PREFIX, type TemplateVars } from '../templates';

const SKILLS_BASE = '.claude/skills';
const INSTRUCTIONS_FILE = 'CLAUDE.md';

export async function apply(dir: string, vars?: TemplateVars): Promise<void> {
  // Write each prompt as a skill folder containing SKILL.md
  for (const slug of PROMPT_NAMES) {
    const skillDir = join(dir, SKILLS_BASE, `${PROMPT_SLUG_PREFIX}${slug}`);
    await ensureDir(skillDir);
    let content = await readTemplate(`prompts/${slug}.md`, vars);
    // Prefix the frontmatter name so the skill registers as "alphaspec-<slug>"
    content = content.replace(`name: ${slug}`, `name: ${PROMPT_SLUG_PREFIX}${slug}`);
    await safeWrite(join(skillDir, 'SKILL.md'), content);
  }

  // Write/update workflow instructions in CLAUDE.md (user-owned, uses sentinel)
  const instructionsPath = join(dir, INSTRUCTIONS_FILE);
  const instructionContent = await readTemplate('instructions/claude-code.md', vars);
  const existing = (await readIfExists(instructionsPath)) ?? '';
  const updated = replaceOrAppendSentinelBlock(existing, instructionContent);
  await safeWrite(instructionsPath, updated);
}

export async function remove(dir: string): Promise<void> {
  // Remove skill folders
  for (const slug of PROMPT_NAMES) {
    const skillDir = join(dir, SKILLS_BASE, `${PROMPT_SLUG_PREFIX}${slug}`);
    await rm(skillDir, { recursive: true, force: true });
    // Also clean up legacy unprefixed dirs
    await rm(join(dir, SKILLS_BASE, slug), { recursive: true, force: true });
  }

  // Remove sentinel block from CLAUDE.md; delete file if it becomes empty
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
