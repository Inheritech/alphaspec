import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { ensureDir, safeWrite, pathExists, readTemplate } from '../fs-utils';
import { PROMPT_NAMES } from '../templates';

const PROMPTS_DIR = '.clinerules/prompts';
const RULES_FILE = '.clinerules/alphaspec.md';

export async function apply(dir: string): Promise<void> {
  // Write each prompt as a flat .md file in .clinerules/prompts/
  await ensureDir(join(dir, PROMPTS_DIR));
  for (const slug of PROMPT_NAMES) {
    const content = await readTemplate(`prompts/${slug}.md`);
    await safeWrite(join(dir, PROMPTS_DIR, `${slug}.md`), content);
  }

  // Write alphaspec instructions to .clinerules/alphaspec.md (alphaspec-owned, direct write)
  const instructionContent = await readTemplate('instructions/cline.md');
  await safeWrite(join(dir, RULES_FILE), instructionContent);
}

export async function remove(dir: string): Promise<void> {
  // Remove prompt files
  for (const slug of PROMPT_NAMES) {
    const filePath = join(dir, PROMPTS_DIR, `${slug}.md`);
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
