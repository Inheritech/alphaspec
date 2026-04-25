import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { ensureDir, safeWrite, pathExists, readTemplate } from '../fs-utils';
import { PROMPT_NAMES, PROMPT_SLUG_PREFIX, type TemplateVars } from '../templates';

const WORKFLOWS_DIR = '.windsurf/workflows';
const RULES_DIR = '.windsurf/rules';
const RULES_FILE = `${RULES_DIR}/alphaspec.md`;

export async function apply(dir: string, vars?: TemplateVars): Promise<void> {
  // Write each prompt as a flat .md file in .windsurf/workflows/
  await ensureDir(join(dir, WORKFLOWS_DIR));
  for (const slug of PROMPT_NAMES) {
    let content = await readTemplate(`prompts/${slug}.md`, vars);
    // Prefix the frontmatter name so the workflow registers as "alphaspec-<slug>"
    content = content.replace(`name: ${slug}`, `name: ${PROMPT_SLUG_PREFIX}${slug}`);
    await safeWrite(join(dir, WORKFLOWS_DIR, `${PROMPT_SLUG_PREFIX}${slug}.md`), content);
  }

  // Write alphaspec rule to .windsurf/rules/alphaspec.md (alphaspec-owned, direct write)
  await ensureDir(join(dir, RULES_DIR));
  const instructionContent = await readTemplate('instructions/windsurf.md', vars);
  await safeWrite(join(dir, RULES_FILE), instructionContent);
}

export async function remove(dir: string): Promise<void> {
  // Remove prompt files
  for (const slug of PROMPT_NAMES) {
    const filePath = join(dir, WORKFLOWS_DIR, `${PROMPT_SLUG_PREFIX}${slug}.md`);
    if (await pathExists(filePath)) {
      await unlink(filePath);
    }
    // Also clean up legacy unprefixed files
    const legacyPath = join(dir, WORKFLOWS_DIR, `${slug}.md`);
    if (await pathExists(legacyPath)) {
      await unlink(legacyPath);
    }
  }

  // Remove the alphaspec-owned rules file
  const rulesPath = join(dir, RULES_FILE);
  if (await pathExists(rulesPath)) {
    await unlink(rulesPath);
  }
}
