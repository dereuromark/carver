import { highlightCode } from './editor/code-highlighting';
import { diffLineKind } from './editor/diff-line';

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (character) => {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    return '&gt;';
  });
}

function diffLineClass(line: string): string {
  const kind = diffLineKind(line);
  return kind ? ` carver-diff-${kind}` : '';
}

function highlightDiff(code: HTMLElement, language: string | null): void {
  code.innerHTML = (code.textContent ?? '')
    .split('\n')
    .map((line) => {
      const marker = /^[+\- ]/.test(line) ? line[0] : '';
      const content = marker ? line.slice(1) : line;
      const highlighted =
        highlightCode(language, content) ?? escapeHtml(content);
      return `<span class="carver-diff-line${diffLineClass(line)}">${escapeHtml(marker)}${highlighted}</span>`;
    })
    .join('');
}

export function highlightPreviewCode(root: ParentNode = document): void {
  for (const code of root.querySelectorAll<HTMLElement>('pre > code')) {
    const language = [...code.classList]
      .find((className) => className.startsWith('language-'))
      ?.slice('language-'.length);
    const highlighted = highlightCode(language ?? null, code.textContent ?? '');
    const isDiff = code.parentElement?.classList.contains('diff');
    if (isDiff) {
      highlightDiff(code, language ?? null);
    } else if (highlighted) {
      code.innerHTML = highlighted;
    } else {
      continue;
    }
    code.classList.add('hljs');
  }
}

highlightPreviewCode();
