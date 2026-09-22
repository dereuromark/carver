import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { highlightCode } from './code-highlighting';

type RelativeDecoration = { from: number; to: number; class: string };

// ProseMirror documents are persistent, so an unchanged code block is the same
// node object across transactions. Caching decorations relative to the block
// keeps selection changes and edits elsewhere from re-running highlight.js over
// every code fence. Only the block whose text actually changed is recomputed.
const relativeCache = new WeakMap<ProseMirrorNode, RelativeDecoration[]>();

function relativeDecorations(node: ProseMirrorNode): RelativeDecoration[] {
  const cached = relativeCache.get(node);
  if (cached) return cached;

  const decorations: RelativeDecoration[] = [];
  const highlighted = highlightCode(node.attrs.language, node.textContent);
  if (highlighted) {
    const container = document.createElement('span');
    container.innerHTML = highlighted;
    let offset = 0;
    const visit = (element: globalThis.Node, classes: string[]) => {
      for (const child of element.childNodes) {
        if (child.nodeType === document.TEXT_NODE) {
          const end = offset + (child.textContent?.length ?? 0);
          if (classes.length && end > offset) {
            decorations.push({
              from: offset,
              to: end,
              class: classes.join(' '),
            });
          }
          offset = end;
          continue;
        }
        const childClasses =
          child instanceof HTMLElement
            ? [...classes, ...child.classList]
            : classes;
        visit(child, childClasses);
      }
    };
    visit(container, []);
  }

  relativeCache.set(node, decorations);
  return decorations;
}

export function codeSyntaxDecorations(doc: ProseMirrorNode) {
  const decorations: Decoration[] = [];

  doc.descendants((node, position) => {
    if (node.type.name !== 'codeBlock') return;
    for (const relative of relativeDecorations(node)) {
      decorations.push(
        Decoration.inline(
          position + 1 + relative.from,
          position + 1 + relative.to,
          { class: relative.class },
          { class: relative.class },
        ),
      );
    }
  });

  return DecorationSet.create(doc, decorations);
}

/** Adds highlight.js token decorations without changing the editable code DOM. */
export const CodeSyntaxDecorations = Extension.create({
  name: 'codeSyntaxDecorations',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations: (state) => codeSyntaxDecorations(state.doc),
        },
      }),
    ];
  },
});
