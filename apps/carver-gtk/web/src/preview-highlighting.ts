import { highlightCode } from './editor/code-highlighting';

export function highlightPreviewCode(root: ParentNode = document): void {
  for (const code of root.querySelectorAll<HTMLElement>('pre > code')) {
    const language = [...code.classList]
      .find((className) => className.startsWith('language-'))
      ?.slice('language-'.length);
    const highlighted = highlightCode(language ?? null, code.textContent ?? '');
    if (!highlighted) continue;

    const diffLines = code.querySelectorAll<HTMLElement>('.carver-diff-line');
    if (diffLines.length) {
      for (const line of diffLines) {
        line.innerHTML =
          highlightCode(language ?? null, line.textContent ?? '') ?? '';
      }
    } else {
      code.innerHTML = highlighted;
    }
    code.classList.add('hljs');
  }
}

highlightPreviewCode();
