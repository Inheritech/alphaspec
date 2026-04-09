import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { ensureDir, safeWrite, readIfExists, pathExists, readTemplate } from '../fs-utils';
import { replaceOrAppendSentinelBlock, removeSentinelBlock } from '../sentinels';
import { PROMPT_NAMES } from '../templates';

const COMMANDS_DIR = '.cursor/commands';
const RULES_DIR = '.cursor/rules';
const RULES_FILE = `${RULES_DIR}/alphaspec.mdc`;

export async function apply(dir: string): Promise<void> {
  // Write each prompt as a flat .md file in .cursor/commands/
  await ensureDir(join(dir, COMMANDS_DIR));
  for (const slug of PROMPT_NAMES) {
    const content = await readTemplate(`prompts/${slug}.md`);
    await safeWrite(join(dir, COMMANDS_DIR, `${slug}.md`), content);
  }

  // Write alphaspec rule to .cursor/rules/alphaspec.mdc (alphaspec-owned, direct write)
  await ensureDir(join(dir, RULES_DIR));
  const instructionContent = await readTemplate('instructions/cursor.md');
  await safeWrite(join(dir, RULES_FILE), instructionContent);
}

export async function remove(dir: string): Promise<void> {
  // Remove prompt files
  for (const slug of PROMPT_NAMES) {
    const filePath = join(dir, COMMANDS_DIR, `${slug}.md`);
    if (await pathExists(filePath)) {
      await unlink(filePath);
    }
  }

  // Remove the alphaspec-owned rules file
  const rulesPath = join(dir, RULES_FILE);
  if (await pathExists(rulesPath)) {
    await unlink(rulesPath);
  }
}
