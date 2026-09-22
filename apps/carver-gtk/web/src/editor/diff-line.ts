/**
 * Shared unified-diff line classification.
 *
 * Used by both the rich editor decorations and the preview highlighter so the
 * two surfaces cannot drift. File headers (`+++`/`---`) are deliberately not a
 * kind, which keeps them uncolored.
 */
export type DiffLineKind = 'add' | 'remove' | 'hunk';

export function diffLineKind(line: string): DiffLineKind | null {
  if (line.startsWith('+++') || line.startsWith('---')) return null;
  if (line.startsWith('@@')) return 'hunk';
  if (line.startsWith('+')) return 'add';
  if (line.startsWith('-')) return 'remove';
  return null;
}
