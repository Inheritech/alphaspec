export const SENTINEL_START = '<!-- alphaspec:start -->';
export const SENTINEL_END = '<!-- alphaspec:end -->';

export interface SentinelBlock {
  before: string;
  content: string | null;
  after: string;
}

export function wrapWithSentinels(content: string): string {
  return `${SENTINEL_START}\n${content}\n${SENTINEL_END}`;
}

export function extractSentinelBlock(fileContent: string): SentinelBlock {
  const startIdx = fileContent.indexOf(SENTINEL_START);
  if (startIdx === -1) {
    return { before: fileContent, content: null, after: '' };
  }
  const endIdx = fileContent.indexOf(SENTINEL_END, startIdx);
  if (endIdx === -1) {
    // Malformed: start without end — treat as no block
    return { before: fileContent, content: null, after: '' };
  }

  const blockEnd = endIdx + SENTINEL_END.length;
  const before = fileContent.slice(0, startIdx);
  const after = fileContent.slice(blockEnd);

  // Extract content between the sentinel lines
  let inner = fileContent.slice(startIdx + SENTINEL_START.length, endIdx);
  if (inner.startsWith('\n')) inner = inner.slice(1);
  if (inner.endsWith('\n')) inner = inner.slice(0, -1);

  return { before, content: inner, after };
}

export function removeSentinelBlock(fileContent: string): string {
  const { before, content, after } = extractSentinelBlock(fileContent);
  if (content === null) return fileContent;

  const trimmedBefore = before.replace(/\s+$/, '');
  const trimmedAfter = after.replace(/^\s+/, '');

  if (!trimmedBefore && !trimmedAfter) return '';
  if (!trimmedBefore) return trimmedAfter;
  if (!trimmedAfter) return trimmedBefore;
  return `${trimmedBefore}\n\n${trimmedAfter}`;
}

export function replaceOrAppendSentinelBlock(fileContent: string, newContent: string): string {
  const wrapped = wrapWithSentinels(newContent);
  const { before, content, after } = extractSentinelBlock(fileContent);

  if (content !== null) {
    // Replace existing block in-place
    const trimmedBefore = before.replace(/\s+$/, '');
    const trimmedAfter = after.replace(/^\s+/, '').replace(/\s+$/, '');
    const parts: string[] = [];
    if (trimmedBefore) parts.push(trimmedBefore);
    parts.push(wrapped);
    if (trimmedAfter) parts.push(trimmedAfter);
    return parts.join('\n\n');
  }

  // No existing block — append
  const trimmedExisting = fileContent.replace(/\s+$/, '');
  if (!trimmedExisting) return wrapped;
  return `${trimmedExisting}\n\n${wrapped}`;
}
