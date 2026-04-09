export const PROMPT_NAMES = [
  'create-story',
  'complete-story',
  'implement-story',
  'define-principles',
  'bootstrap-from-research',
] as const;

export type PromptName = (typeof PROMPT_NAMES)[number];

export function getPromptTemplatePath(slug: PromptName): string {
  return `prompts/${slug}.md`;
}

export function getInstructionTemplatePath(toolId: string): string {
  return `instructions/${toolId}.md`;
}

export function getReadmeTemplatePath(folder: 'pending' | 'done'): string {
  return `readmes/${folder}.md`;
}
