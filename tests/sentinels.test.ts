import { describe, it, expect } from 'vitest';
import {
  wrapWithSentinels,
  extractSentinelBlock,
  removeSentinelBlock,
  replaceOrAppendSentinelBlock,
  SENTINEL_START,
  SENTINEL_END,
} from '../src/lib/sentinels';

const INNER = 'alphaspec content\nline two';

describe('wrapWithSentinels', () => {
  it('wraps content between sentinel markers', () => {
    const result = wrapWithSentinels(INNER);
    expect(result).toBe(`${SENTINEL_START}\n${INNER}\n${SENTINEL_END}`);
  });
});

describe('extractSentinelBlock', () => {
  it('returns null content when no sentinel exists', () => {
    const { before, content, after } = extractSentinelBlock('# Header\n\nsome text');
    expect(content).toBeNull();
    expect(before).toBe('# Header\n\nsome text');
    expect(after).toBe('');
  });

  it('extracts inner content from a wrapped file', () => {
    const file = `# Header\n\n${wrapWithSentinels(INNER)}\n\n# Footer`;
    const { before, content, after } = extractSentinelBlock(file);
    expect(content).toBe(INNER);
    expect(before).toBe('# Header\n\n');
    expect(after).toBe('\n\n# Footer');
  });

  it('treats malformed sentinel (start without end) as no block', () => {
    const file = `# Header\n${SENTINEL_START}\norphaned`;
    const { content } = extractSentinelBlock(file);
    expect(content).toBeNull();
  });
});

describe('removeSentinelBlock', () => {
  it('returns file unchanged when no sentinel exists', () => {
    const file = '# Header\n\nsome text';
    expect(removeSentinelBlock(file)).toBe(file);
  });

  it('removes sentinel block and leaves surrounding content', () => {
    const file = `# Header\n\n${wrapWithSentinels(INNER)}\n\n# Footer`;
    const result = removeSentinelBlock(file);
    expect(result).toBe('# Header\n\n# Footer');
  });

  it('returns empty string when file contains only the sentinel block', () => {
    const file = wrapWithSentinels(INNER);
    expect(removeSentinelBlock(file)).toBe('');
  });

  it('leaves no extra trailing newline when block is at end of file', () => {
    const file = `# Header\n\n${wrapWithSentinels(INNER)}`;
    const result = removeSentinelBlock(file);
    expect(result).toBe('# Header');
  });
});

describe('replaceOrAppendSentinelBlock', () => {
  it('appends sentinel block to empty file', () => {
    const result = replaceOrAppendSentinelBlock('', INNER);
    expect(result).toBe(wrapWithSentinels(INNER));
  });

  it('appends sentinel block after existing content', () => {
    const result = replaceOrAppendSentinelBlock('# Header', INNER);
    expect(result).toBe(`# Header\n\n${wrapWithSentinels(INNER)}`);
  });

  it('replaces existing sentinel block in-place', () => {
    const original = `# Header\n\n${wrapWithSentinels('OLD')}\n\n# Footer`;
    const result = replaceOrAppendSentinelBlock(original, 'NEW');
    expect(result).toBe(`# Header\n\n${wrapWithSentinels('NEW')}\n\n# Footer`);
  });

  it('is idempotent when called twice with the same content', () => {
    const first = replaceOrAppendSentinelBlock('# Header', INNER);
    const second = replaceOrAppendSentinelBlock(first, INNER);
    expect(second).toBe(first);
  });
});
