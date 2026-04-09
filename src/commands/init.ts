import { join, resolve } from 'node:path';
import * as clack from '@clack/prompts';
import { ensureDir, safeWrite, readIfExists, readTemplate } from '../lib/fs-utils';
import { detectTools, ALL_TOOLS, TOOL_LABELS, type ToolId } from '../lib/detect-tools';
import { PROMPT_NAMES } from '../lib/templates';
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

export interface InitOptions {
  dir?: string;
  tools?: string;
  force?: boolean;
  yes?: boolean;
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  const dir = options.dir ? resolve(options.dir) : process.cwd();

  clack.intro('alphaspec init');

  // Check for existing config
  const configPath = join(dir, '.alphaspec', 'config.json');
  const existingConfigRaw = await readIfExists(configPath);
  let existingTools: ToolId[] = [];
  let isExtendMode = false;

  if (existingConfigRaw && !options.force) {
    try {
      const config = JSON.parse(existingConfigRaw) as { tools?: ToolId[] };
      existingTools = config.tools ?? [];
      isExtendMode = true;
      clack.log.info(
        `Already initialized (extend mode). Use --force to overwrite everything.`,
      );
    } catch {
      clack.log.warn('Could not parse .alphaspec/config.json — treating as fresh init.');
    }
  }

  // Resolve selected tools
  let selectedTools: ToolId[];

  if (options.tools) {
    if (options.tools === 'all') {
      selectedTools = [...ALL_TOOLS];
    } else if (options.tools === 'none') {
      selectedTools = [];
    } else {
      selectedTools = options.tools.split(',').map(t => t.trim()) as ToolId[];
    }
  } else {
    // Interactive multi-select with auto-detection
    const detected = await detectTools(dir);
    const choices = ALL_TOOLS.map(tool => ({
      value: tool,
      label: TOOL_LABELS[tool],
      hint: detected.includes(tool) ? 'detected' : undefined,
    }));

    const result = await clack.multiselect({
      message: 'Which AI tools should alphaspec configure?',
      options: choices,
      initialValues: detected,
    });

    if (clack.isCancel(result)) {
      clack.cancel('Cancelled.');
      process.exit(0);
    }

    selectedTools = result as ToolId[];
  }

  // In extend mode: only configure newly-added tools
  let toolsToApply: ToolId[];
  let toolsForConfig: ToolId[];

  if (isExtendMode) {
    toolsToApply = selectedTools.filter(t => !existingTools.includes(t));
    toolsForConfig = [...new Set([...existingTools, ...selectedTools])];
    if (toolsToApply.length === 0) {
      clack.outro('Nothing to add — all selected tools are already configured.');
      return;
    }
  } else {
    toolsToApply = selectedTools;
    toolsForConfig = selectedTools;
  }

  const spinner = clack.spinner();
  spinner.start('Setting up alphaspec…');

  try {
    // Create folder structure
    await ensureDir(join(dir, 'pending'));
    await ensureDir(join(dir, 'done'));
    await ensureDir(join(dir, '.alphaspec', 'prompts'));

    // Write README files for pending/ and done/ (skip if they already exist, unless --force)
    const pendingReadmePath = join(dir, 'pending', 'README.md');
    const doneReadmePath = join(dir, 'done', 'README.md');

    if (options.force || !(await readIfExists(pendingReadmePath))) {
      await safeWrite(pendingReadmePath, await readTemplate('readmes/pending.md'));
    }
    if (options.force || !(await readIfExists(doneReadmePath))) {
      await safeWrite(doneReadmePath, await readTemplate('readmes/done.md'));
    }

    // Copy prompts to .alphaspec/prompts/ as source of truth
    for (const slug of PROMPT_NAMES) {
      const destPath = join(dir, '.alphaspec', 'prompts', `${slug}.md`);
      if (options.force || !(await readIfExists(destPath))) {
        await safeWrite(destPath, await readTemplate(`prompts/${slug}.md`));
      }
    }

    // Apply IDE writers
    for (const tool of toolsToApply) {
      await WRITERS[tool].apply(dir);
    }

    // Always apply universal AGENTS.md writer
    await universalAgents.apply(dir);

    // Write config
    const config = {
      version: process.env.ALPHASPEC_VERSION ?? '0.0.0',
      tools: toolsForConfig,
      initializedAt: existingConfigRaw
        ? JSON.parse(existingConfigRaw).initializedAt ?? new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await safeWrite(configPath, JSON.stringify(config, null, 2) + '\n');

    spinner.stop('Done.');
  } catch (err) {
    spinner.stop('Failed.');
    throw err;
  }

  // Summary
  clack.log.success('Created:');
  clack.log.message('  pending/         — active epics and stories');
  clack.log.message('  done/            — completed work (historical reference)');
  clack.log.message('  .alphaspec/      — config and prompt source of truth');

  if (toolsToApply.length > 0) {
    clack.log.success('Configured:');
    for (const tool of toolsToApply) {
      clack.log.message(`  ${TOOL_LABELS[tool]}`);
    }
  }

  clack.log.message('');
  clack.log.info(
    'alphaspec does not modify your .gitignore. ' +
    'Add pending/ and done/ yourself if you want them to stay local.',
  );

  clack.outro(
    isExtendMode
      ? `Extended. Try a prompt like /create-story in your AI assistant.`
      : `Ready. Try /create-story to add your first story, or /bootstrap-from-research if you have a research doc.`,
  );
}
