export const PROMPT_NAMES = [
  'create-stories',
  'complete-story',
  'implement-story',
  'verify-story',
  'define-principles',
  'bootstrap-from-research',
] as const;

export type PromptName = (typeof PROMPT_NAMES)[number];

/** Prefix applied to all prompt output filenames/folders so they surface as `alphaspec.<slug>`. */
export const PROMPT_SLUG_PREFIX = 'alphaspec.';

export function getPromptTemplatePath(slug: PromptName): string {
  return `prompts/${slug}.md`;
}

export function getInstructionTemplatePath(toolId: string): string {
  return `instructions/${toolId}.md`;
}

export function getReadmeTemplatePath(folder: 'pending' | 'done'): string {
  return `readmes/${folder}.md`;
}
