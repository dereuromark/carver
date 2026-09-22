import { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { highlightCode } from './code-highlighting';

export function codeSyntaxDecorations(doc: ProseMirrorNode) {
  const decorations: Decoration[] = [];

  doc.descendants((node, position) => {
    if (node.type.name !== 'codeBlock') return;
    const highlighted = highlightCode(node.attrs.language, node.textContent);
    if (!highlighted) return;

    const container = document.createElement('span');
    container.innerHTML = highlighted;
    let offset = 0;
    const visit = (element: globalThis.Node, classes: string[]) => {
      for (const child of element.childNodes) {
        if (child.nodeType === document.TEXT_NODE) {
          const end = offset + (child.textContent?.length ?? 0);
          if (classes.length && end > offset) {
            const className = classes.join(' ');
            decorations.push(
              Decoration.inline(
                position + 1 + offset,
                position + 1 + end,
                { class: className },
                { class: className },
              ),
            );
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
