// BSD-2-Clause. The published WebAssembly player owns the meaning of every operator.
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three';

const playerURL = new URL('../procedural-texture-rendering/wasm-worker.js', import.meta.url);

export async function loadTextures(procedures) {
  const worker = new Worker(playerURL, { type: 'module' });
  const pending = new Map();
  let sequence = 0;

  function request(message, expected) {
    const id = ++sequence;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error('The procedural texture player did not reply in 30 seconds.'));
      }, 30_000);
      pending.set(id, (reply) => {
        clearTimeout(timeout);
        if (reply.kind === expected) resolve(reply);
        else reject(new Error(reply.error || 'Unexpected texture player response.'));
      });
      worker.postMessage({ id, ...message });
    });
  }

  worker.onmessage = ({ data }) => {
    // The original worker sends no request ID in its ready response.
    const id = data.id ?? 1;
    pending.get(id)?.(data);
    pending.delete(id);
  };
  worker.onerror = (event) => {
    for (const reply of pending.values()) reply({ error: event.message || 'The texture worker could not start.' });
    pending.clear();
  };

  const textures = new Map();
  try {
    await request({ kind: 'init', url: 'player/ptr-player.wasm' }, 'ready');
    for (const [name, url, exp] of procedures) {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Procedure ${name} returned HTTP ${response.status}.`);
      const script = await response.text();
      const { rgb, w, h, ms } = await request({ kind: 'piece', script, exp }, 'piece');
      const rgba = new Uint8Array(w * h * 4);
      for (let pixel = 0; pixel < w * h; pixel++) {
        rgba[pixel * 4] = rgb[pixel * 3];
        rgba[pixel * 4 + 1] = rgb[pixel * 3 + 1];
        rgba[pixel * 4 + 2] = rgb[pixel * 3 + 2];
        rgba[pixel * 4 + 3] = 255;
      }
      const texture = new DataTexture(rgba, w, h);
      texture.name = name;
      texture.colorSpace = SRGBColorSpace;
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
      textures.set(name, { texture, ms, bytes: new TextEncoder().encode(script).byteLength });
    }
    return textures;
  } catch (error) {
    for (const { texture } of textures.values()) texture.dispose();
    throw error;
  } finally {
    worker.terminate();
  }
}
