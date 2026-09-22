// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';

import { highlightPreviewCode } from '../src/preview-highlighting';

describe('highlightPreviewCode', () => {
  it('keeps diff lines and applies JavaScript token colors inside them', () => {
    document.body.innerHTML =
      '<pre class="diff"><code class="language-js"><span class="carver-diff-line carver-diff-add">+const value = "text";</span></code></pre>';

    highlightPreviewCode(document);

    const line = document.querySelector('.carver-diff-line');
    expect(line?.classList.contains('carver-diff-add')).toBe(true);
    expect(line?.innerHTML).toContain('hljs-keyword');
  });

  it('highlights Carve fences', () => {
    document.body.innerHTML =
      '<pre><code class="language-carve"># *Heading*</code></pre>';

    highlightPreviewCode(document);

    expect(document.querySelector('code')?.classList.contains('hljs')).toBe(
      true,
    );
    expect(document.querySelector('code')?.innerHTML).toContain('hljs');
  });
});
