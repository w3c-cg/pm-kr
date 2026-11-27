// The last field is log2 of the texture side.
export function proceduresFor(mode) {
  const shared = mode === 'public' ? '../texture-player/scene/procedures/' : '../../procedural-texture-rendering/scene/procedures/';
  return [
    ['floor', shared + 'floor_tiles_06.p2p', 8],
    ['bulkhead', shared + 'metal_plate.p2p', 8],
    ['ribbing', shared + 'rusty_metal_02.p2p', 8],
    ['ceiling', shared + 'rock_05.p2p', 8],
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
}
