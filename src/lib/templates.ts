export const PROMPT_NAMES = [
  'create-stories',
  'refine-story',
  'complete-story',
  'implement-story',
  'verify-story',
  'define-principles',
  'bootstrap-from-research',
] as const;

export type PromptName = (typeof PROMPT_NAMES)[number];

/** Prefix applied to all prompt output filenames/folders so they surface as `alphaspec-<slug>`. */
export const PROMPT_SLUG_PREFIX = 'alphaspec-';

/** Variables interpolated into templates when they are written to disk. */
export type TemplateVars = Record<string, string>;

/**
 * Build the standard template variables from a storiesDir container path.
 * storiesDir is the parent directory; pending/ and done/ are always children.
 * Uses forward slashes (posix) since these appear in markdown content.
 */
export function buildTemplateVars(storiesDir: string): TemplateVars {
  const base = storiesDir === '.' ? '' : storiesDir.replaceAll('\\', '/').replace(/\/+$/, '');
  const join = (a: string, b: string) => (a ? `${a}/${b}` : b);
  return {
    pendingDir: join(base, 'pending'),
    doneDir: join(base, 'done'),
  };
}

/** Replace `{{key}}` placeholders in template content with concrete values. */
export function renderTemplate(content: string, vars: TemplateVars): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export function getPromptTemplatePath(slug: PromptName): string {
  return `prompts/${slug}.md`;
}

export function getInstructionTemplatePath(toolId: string): string {
  return `instructions/${toolId}.md`;
}

export function getReadmeTemplatePath(folder: 'pending' | 'done'): string {
  return `readmes/${folder}.md`;
}
