// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { getSchema } from '@tiptap/core';
import { CarveKit } from '@markup-carve/carve-grammars/tiptap';

import { codeSyntaxDecorations } from '../src/editor/code-syntax-decorations';

describe('codeSyntaxDecorations', () => {
  const schema = getSchema([CarveKit.configure({ image: false })]);

  it('adds JavaScript token classes without replacing the code block node', () => {
    const code = schema.nodes.codeBlock.create(
      { language: 'js' },
      schema.text('const value = "text";'),
    );
    const document = schema.topNodeType.createAndFill(null, code);
    if (!document) throw new Error('Expected a document');

    expect(
      codeSyntaxDecorations(document)
        .find()
        .map((decoration) => decoration.spec.class),
    ).toContain('hljs-keyword');
  });
});
