import { describe, expect, it } from 'vitest';
import { getSchema } from '@tiptap/core';
import { CarveKit } from '@markup-carve/carve-grammars/tiptap';

import { diffDecorations, diffLineClass } from '../src/editor/diff-decorations';

describe('diffLineClass', () => {
  it('marks content changes but leaves file headers uncolored', () => {
    expect(diffLineClass('+++ b/file.js')).toBeNull();
    expect(diffLineClass('--- a/file.js')).toBeNull();
    expect(diffLineClass('+added')).toContain('carver-diff-add');
    expect(diffLineClass('-removed')).toContain('carver-diff-remove');
    expect(diffLineClass('@@ -1 +1 @@')).toContain('carver-diff-hunk');
  });
});

describe('diffDecorations', () => {
  const schema = getSchema([CarveKit.configure({ image: false })]);
  const documentFor = (
    code: ReturnType<typeof schema.nodes.codeBlock.create>,
  ) => {
    const document = schema.topNodeType.createAndFill(null, code);
    if (!document) throw new Error('Expected a document');
    return document;
  };

  it('decorates diff-class code blocks without treating file headers as changes', () => {
    const code = schema.nodes.codeBlock.create(
      { class: 'diff', language: 'js' },
      schema.text('--- a/file.js\n+++ b/file.js\n-old\n+new\n@@ -1 +1 @@'),
    );
    const classes = diffDecorations(documentFor(code))
      .find()
      .map((decoration) => decoration.spec.class);

    expect(classes).toEqual([
      'carver-diff-line carver-diff-remove',
      'carver-diff-line carver-diff-add',
      'carver-diff-line carver-diff-hunk',
    ]);
  });

  it('leaves ordinary code blocks untouched', () => {
    const code = schema.nodes.codeBlock.create(
      { language: 'js' },
      schema.text('+not a diff'),
    );
    expect(diffDecorations(documentFor(code)).find()).toEqual([]);
  });
});
