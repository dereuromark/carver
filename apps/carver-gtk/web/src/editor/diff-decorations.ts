import { Extension } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { diffLineKind } from './diff-line';

export function diffLineClass(line: string): string | null {
  const kind = diffLineKind(line);
  return kind ? `carver-diff-line carver-diff-${kind}` : null;
}

function isDiffCodeBlock(attributes: Record<string, unknown>): boolean {
  const classes =
    typeof attributes.class === 'string' ? attributes.class.split(/\s+/) : [];
  return attributes.language === 'diff' || classes.includes('diff');
}

export function diffDecorations(doc: Node) {
  const decorations: Decoration[] = [];

  doc.descendants((node, position) => {
    if (node.type.name !== 'codeBlock' || !isDiffCodeBlock(node.attrs)) {
      return;
    }

    let offset = 0;
    for (const line of node.textContent.split('\n')) {
      const className = diffLineClass(line);
      if (className && line.length) {
        decorations.push(
          Decoration.inline(
            position + 1 + offset,
            position + 1 + offset + line.length,
            {
              class: className,
            },
            { class: className },
          ),
        );
      }
      offset += line.length + 1;
    }
  });

  return DecorationSet.create(doc, decorations);
}

/** Adds semantic line decorations to unified diff code blocks while editing. */
export const DiffCodeBlockDecorations = Extension.create({
  name: 'diffCodeBlockDecorations',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => diffDecorations(state.doc),
        },
      }),
    ];
  },
});
