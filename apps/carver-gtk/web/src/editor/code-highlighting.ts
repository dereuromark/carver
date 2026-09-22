import hljs from 'highlight.js/lib/common';
import carve from '@markup-carve/carve-grammars/highlightjs/carve.js';

hljs.registerLanguage('carve', carve);

export function highlightCode(
  language: string | null,
  code: string,
): string | null {
  const resolved = language === 'crv' ? 'carve' : language;
  if (!resolved || !hljs.getLanguage(resolved)) return null;
  return hljs.highlight(code, { language: resolved }).value;
}
