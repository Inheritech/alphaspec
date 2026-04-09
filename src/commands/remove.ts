import { join, resolve } from 'node:path';
import { rm, unlink } from 'node:fs/promises';
import * as clack from '@clack/prompts';
import { readIfExists, pathExists } from '../lib/fs-utils';
import { ALL_TOOLS, TOOL_LABELS, type ToolId } from '../lib/detect-tools';
import * as claudeCode from '../lib/ide-writers/claude-code';
import * as cursor from '../lib/ide-writers/cursor';
import * as windsurf from '../lib/ide-writers/windsurf';
import * as githubCopilot from '../lib/ide-writers/github-copilot';
import * as cline from '../lib/ide-writers/cline';
import * as universalAgents from '../lib/ide-writers/universal-agents';

const WRITERS: Record<ToolId, { apply: (dir: string) => Promise<void>; remove: (dir: string) => Promise<void> }> = {
  'claude-code': claudeCode,
  'cursor': cursor,
  'windsurf': windsurf,
  'github-copilot': githubCopilot,
  'cline': cline,
};

export interface RemoveOptions {
  dir?: string;
  yes?: boolean;
  purge?: boolean;
}

export async function runRemove(options: RemoveOptions = {}): Promise<void> {
  const dir = options.dir ? resolve(options.dir) : process.cwd();

  clack.intro('alphaspec remove');

  // Read config to know what tools were configured
  const configPath = join(dir, '.alphaspec', 'config.json');
  const configRaw = await readIfExists(configPath);
  let configuredTools: ToolId[] = [...ALL_TOOLS]; // best-effort: assume all

  if (configRaw) {
    try {
      const config = JSON.parse(configRaw) as { tools?: ToolId[] };
      configuredTools = config.tools ?? ALL_TOOLS;
    } catch {
      clack.log.warn('Could not parse .alphaspec/config.json — attempting best-effort removal of all tools.');
    }
  } else {
    clack.log.warn('No .alphaspec/config.json found — attempting best-effort removal of all tools.');
  }

  // Show what will be removed
  clack.log.message('Will remove:');
  clack.log.message('  • alphaspec content from IDE config files (sentinel blocks)');
  clack.log.message('  • Prompt files copied into each configured tool\'s directory');
  for (const tool of configuredTools) {
    clack.log.message(`    - ${TOOL_LABELS[tool]}`);
  }
  clack.log.message('  • AGENTS.md sentinel block');
  clack.log.message('  • .alphaspec/ (config and prompts)');

  // Main confirmation — skipped by --yes
  if (!options.yes) {
    const proceed = await clack.confirm({ message: 'Remove alphaspec from this project?' });
    if (clack.isCancel(proceed) || !proceed) {
      clack.cancel('Cancelled.');
      process.exit(0);
    }
  }

  const spinner = clack.spinner();
  spinner.start('Removing IDE configurations…');

  try {
    // Remove IDE writers
    for (const tool of configuredTools) {
      await WRITERS[tool].remove(dir);
    }

    // Always remove universal AGENTS.md block
    await universalAgents.remove(dir);

    spinner.stop('IDE configurations removed.');
  } catch (err) {
    spinner.stop('Failed during IDE config removal.');
    throw err;
  }

  // .alphaspec/ deletion — skipped (auto-deleted) with --yes; asked otherwise
  if (options.yes) {
    await rm(join(dir, '.alphaspec'), { recursive: true, force: true });
    clack.log.success('Deleted .alphaspec/');
  } else {
    const deleteSpec = await clack.confirm({
      message: 'Delete .alphaspec/ (config and prompts)?',
      initialValue: true,
    });
    if (!clack.isCancel(deleteSpec) && deleteSpec) {
      await rm(join(dir, '.alphaspec'), { recursive: true, force: true });
      clack.log.success('Deleted .alphaspec/');
    } else {
      clack.log.info('Kept .alphaspec/');
    }
  }

  // pending/ and done/ — only touched when --purge is passed.
  // --yes skips the confirmation, otherwise we ask.
  if (options.purge) {
    if (!options.yes) {
      const confirmPurge = await clack.confirm({
        message: 'Delete pending/ and done/? This will remove your stories.',
        initialValue: false,
      });
      if (clack.isCancel(confirmPurge) || !confirmPurge) {
        clack.log.info('Kept pending/ and done/');
        clack.outro('alphaspec removed.');
        return;
      }
    }
    await rm(join(dir, 'pending'), { recursive: true, force: true });
    await rm(join(dir, 'done'), { recursive: true, force: true });
    clack.log.success('Deleted pending/ and done/');
  }

  clack.outro('alphaspec removed.');
}
