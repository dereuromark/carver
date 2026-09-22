import { describe, expect, it } from 'vitest';

import { highlightCode } from '../src/editor/code-highlighting';

describe('highlightCode', () => {
  it('highlights JavaScript and Carve code fences', () => {
    expect(highlightCode('js', 'const value = "text";')).toContain(
      'hljs-keyword',
    );
    expect(highlightCode('carve', '# *Heading*')).toContain('hljs');
    expect(highlightCode('crv', '# *Heading*')).toContain('hljs');
  });

  it('leaves an unknown fence language alone', () => {
    expect(highlightCode('unknown-fence', 'plain text')).toBeNull();
  });
});
