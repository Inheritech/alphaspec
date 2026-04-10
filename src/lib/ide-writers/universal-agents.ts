import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { ensureDir, safeWrite, readIfExists, readTemplate } from '../fs-utils';
import { replaceOrAppendSentinelBlock, removeSentinelBlock } from '../sentinels';
import { type TemplateVars } from '../templates';

// Universal: always written regardless of tool selection.
// Targets AGENTS.md which is read by many AI tools (Claude Code, GitHub Copilot, etc.)
const AGENTS_FILE = 'AGENTS.md';

export async function apply(dir: string, vars?: TemplateVars): Promise<void> {
  // Read universal instructions — use the github-copilot instructions as the universal content
  // since AGENTS.md is recognized by the broadest set of tools.
  const instructionContent = await readTemplate('instructions/universal.md', vars);
  const agentsPath = join(dir, AGENTS_FILE);
  const existing = (await readIfExists(agentsPath)) ?? '';
  const updated = replaceOrAppendSentinelBlock(existing, instructionContent);
  await safeWrite(agentsPath, updated);
}

export async function remove(dir: string): Promise<void> {
  const agentsPath = join(dir, AGENTS_FILE);
  const existing = await readIfExists(agentsPath);
  if (existing !== null) {
    const updated = removeSentinelBlock(existing);
    if (updated.trim()) {
      await safeWrite(agentsPath, updated);
    } else {
      await unlink(agentsPath);
    }
  }
}
