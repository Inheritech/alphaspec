import { describe, it, expect } from 'vitest';
import { buildTemplateVars, renderTemplate } from '../src/lib/templates';

describe('buildTemplateVars', () => {
  it('default "stories" → stories/pending, stories/done', () => {
    const vars = buildTemplateVars('stories');
    expect(vars.pendingDir).toBe('stories/pending');
    expect(vars.doneDir).toBe('stories/done');
  });

  it('"." → bare pending, done (backward compat)', () => {
    const vars = buildTemplateVars('.');
    expect(vars.pendingDir).toBe('pending');
    expect(vars.doneDir).toBe('done');
  });

  it('nested path "docs/specs" → docs/specs/pending, docs/specs/done', () => {
    const vars = buildTemplateVars('docs/specs');
    expect(vars.pendingDir).toBe('docs/specs/pending');
    expect(vars.doneDir).toBe('docs/specs/done');
  });

  it('strips trailing slashes', () => {
    const vars = buildTemplateVars('work/');
    expect(vars.pendingDir).toBe('work/pending');
    expect(vars.doneDir).toBe('work/done');
  });

  it('normalizes backslashes to forward slashes', () => {
    const vars = buildTemplateVars('docs\\specs');
    expect(vars.pendingDir).toBe('docs/specs/pending');
    expect(vars.doneDir).toBe('docs/specs/done');
  });
});

describe('renderTemplate', () => {
  it('replaces {{pendingDir}} and {{doneDir}} placeholders', () => {
    const vars = { pendingDir: 'stories/pending', doneDir: 'stories/done' };
    const input = 'Files go in {{pendingDir}}/ and completed in {{doneDir}}/';
    expect(renderTemplate(input, vars)).toBe(
      'Files go in stories/pending/ and completed in stories/done/',
    );
  });

  it('replaces multiple occurrences of the same placeholder', () => {
    const vars = { pendingDir: 'pending' };
    const input = '{{pendingDir}} → {{pendingDir}}';
    expect(renderTemplate(input, vars)).toBe('pending → pending');
  });

  it('leaves content untouched when no matching placeholders', () => {
    const vars = { pendingDir: 'stories/pending' };
    const input = 'No placeholders here.';
    expect(renderTemplate(input, vars)).toBe('No placeholders here.');
  });

  it('handles empty vars gracefully', () => {
    const input = '{{pendingDir}} stays raw';
    expect(renderTemplate(input, {})).toBe('{{pendingDir}} stays raw');
  });
});
