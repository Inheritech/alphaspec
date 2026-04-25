import { Command } from 'commander';
import { runInit } from './commands/init';
import { runRemove } from './commands/remove';
import { runUpgrade } from './commands/upgrade';

const VERSION = process.env.ALPHASPEC_VERSION ?? '0.0.0';

const program = new Command();

program
  .name('alphaspec')
  .description('Lightweight, opinionated SDD scaffolder for AI coding assistants')
  .version(VERSION);

program
  .command('init')
  .description('Initialise alphaspec in the current project')
  .option('-d, --dir <path>', 'target directory (defaults to cwd)')
  .option('-t, --tools <list>', 'comma-separated tool IDs, "all", or "none"')
  .option('-s, --stories-dir <path>', 'container directory for pending/ and done/ (default: stories)')
  .option('-f, --force', 'overwrite existing configuration')
  .option('-y, --yes', 'skip interactive prompts (auto-select detected tools)')
  .action(async (opts: { dir?: string; tools?: string; storiesDir?: string; force?: boolean; yes?: boolean }) => {
    try {
      await runInit(opts);
    } catch (err) {
      if (err instanceof Error) {
        process.stderr.write(`\nError: ${err.message}\n`);
      }
      process.exit(1);
    }
  });

program
  .command('upgrade')
  .description('Upgrade an existing alphaspec install to the current version')
  .option('-d, --dir <path>', 'target directory (defaults to cwd)')
  .option('-y, --yes', 'skip confirmation prompt')
  .action(async (opts: { dir?: string; yes?: boolean }) => {
    try {
      await runUpgrade(opts);
    } catch (err) {
      if (err instanceof Error) {
        process.stderr.write(`\nError: ${err.message}\n`);
      }
      process.exit(1);
    }
  });

program
  .command('remove')
  .description('Remove alphaspec from the current project')
  .option('-d, --dir <path>', 'target directory (defaults to cwd)')
  .option('-y, --yes', 'skip all confirmations')
  .option('--purge', 'also delete stories directory (pending/ and done/)')
  .action(async (opts: { dir?: string; yes?: boolean; purge?: boolean }) => {
    try {
      await runRemove(opts);
    } catch (err) {
      if (err instanceof Error) {
        process.stderr.write(`\nError: ${err.message}\n`);
      }
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
