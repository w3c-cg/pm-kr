// The last field is log2 of the texture side.
export const PROCEDURES = [
  ['floor', '../../procedural-texture-rendering/scene/procedures/floor_tiles_06.p2p', 8],
  ['trim', 'trim.p2p', 7],
  ['slate', 'slate.p2p', 7],
  ['amber', 'amber.p2p', 6],
  ['teal', 'teal.p2p', 6],
  ['violet', 'violet.p2p', 6],
  ['ink', 'ink.p2p', 5],
  ['white', 'white.p2p', 5],
  ['field', 'field.p2p', 8],
  ['signal', 'signal.p2p', 6],
  ['divider', 'divider.p2p', 7]
].map(([name, path, exponent]) => [name, new URL(path, import.meta.url), exponent]);
