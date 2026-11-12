#!/usr/bin/env python3
"""Check a Procedural Texture Rendering site folder before it is published: every file the page names is there,
every size the scene states is the file's, no address starts at the host's root, nothing is a link.
check_site.py SITE-DIR      exit 1 on any finding. Standard library only."""
import json
import os
import re
import sys

site = os.path.abspath(sys.argv[1])
bad = []
err = bad.append


def there(rel, why):
    p = os.path.normpath(os.path.join(site, rel))
    if not p.startswith(site + os.sep):
        err('%s: %s points outside the folder' % (why, rel))
    elif not os.path.isfile(p):
        err('%s: %s is missing' % (why, rel))
    return p


total = 0
largest = (0, '')
for d, _, files in os.walk(site):
    for f in files:
        p = os.path.join(d, f)
        if os.path.islink(p):
            err('%s is a symbolic link (GitHub Pages refuses links in the artifact)' % os.path.relpath(p, site))
            continue
        n = os.path.getsize(p)
        total += n
        largest = max(largest, (n, os.path.relpath(p, site)))
        if f.endswith(('.html', '.js', '.css')):
            text = open(p, encoding='utf-8').read()
            for m in re.finditer(r'''(?:src|href)=["'](/[^"'/][^"']*)|(?:fetch|import|Worker)\(\s*["'](/[^"'/][^"']*)|from\s+["'](/[^"']*)''', text):
                err('%s: the address %s starts at the host\'s root' % (os.path.relpath(p, site), next(g for g in m.groups() if g)))
            for m in re.finditer(r'''(?:src|href)=["'](http://[^"']*)''', text):
                err('%s: %s is loaded over plain HTTP' % (os.path.relpath(p, site), m.group(1)))

index = open(there('index.html', 'the page'), encoding='utf-8').read()
for m in re.finditer(r'''(?:src|href)=["']([^"'#:]+)["']''', index):
    there(m.group(1), 'index.html')
for js in ('tester.js', 'strings.js', 'link.js', 'gl-scene.js', 'gpu-player.js', 'wasm-worker.js'):
    text = open(there(js, 'the page\'s code'), encoding='utf-8').read()
    for m in re.finditer(r'''from\s+['"](\./[^'"]+)['"]''', text):
        there(m.group(1), js)
strings = open(os.path.join(site, 'strings.js'), encoding='utf-8').read()
langs = re.findall(r"\['([A-Za-z_]+)', '[^']+', '[A-Za-z-]+'\]", strings)
if len(langs) != 10:
    err('strings.js lists %d languages, ten are required' % len(langs))
for l in langs:
    if l != 'en':
        there('lang/%s.js' % l, 'the language list')
player = open(os.path.join(site, 'gpu-player.js'), encoding='utf-8').read()
m = re.search(r'export const MODERN = \{([^}]*)\}', player)
ops = re.findall(r":\s*'([a-z]+)'", m.group(1)) if m else []
if len(ops) != 12:
    err('gpu-player.js names %d operators, twelve are expected' % len(ops))
for op in ops + ['common']:
    there('ops/%s.wgsl' % op, 'the WebGPU player')
wasm = there('player/ptr-player.wasm', 'the WebAssembly player')
if os.path.isfile(wasm) and open(wasm, 'rb').read(4) != b'\0asm':
    err('player/ptr-player.wasm is not a WebAssembly module')

scene = there('scene/scene.gltf', 'the scene')
g = json.load(open(scene, encoding='utf-8'))
NAME = 'KHR_texture_procedural_rendering'
root = g.get('extensions', {}).get(NAME)
if not root or NAME not in g.get('extensionsUsed', []) or NAME in g.get('extensionsRequired', []):
    err('scene.gltf: %s must be in extensionsUsed, not in extensionsRequired, with its root object' % NAME)
items = []
for p in (root or {}).get('procedures', []):
    items.append((p.get('uri'), p.get('byteLength'), 'procedure'))
for b in g.get('buffers', []):
    items.append((b.get('uri'), b.get('byteLength'), 'model'))
for im in g.get('images', []):
    items.append((im.get('uri'), (im.get('extras') or {}).get('byteLength'), 'picture'))
for a in g.get('extensions', {}).get('KHR_audio_emitter', {}).get('audio', []):
    items.append((a.get('uri'), (a.get('extras') or {}).get('byteLength'), 'sound'))
for s in (g.get('extras') or {}).get('scripts', []):
    items.append((s.get('url'), s.get('byteLength'), 'script'))
for uri, size, kind in items:
    if not uri:
        continue
    p = there('scene/' + uri, 'scene.gltf (%s)' % kind)
    if size is None:
        err('scene.gltf: %s %s states no size, so the page cannot total the scene before downloading it' % (kind, uri))
    elif os.path.isfile(p) and os.path.getsize(p) != size:
        err('scene.gltf: %s %s is %d bytes, the scene says %d' % (kind, uri, os.path.getsize(p), size))
for t in g.get('textures', []):
    e = (t.get('extensions') or {}).get(NAME)
    if e and 'source' not in t:
        err('scene.gltf: texture %s names a procedure and has no picture' % t.get('name'))

print('%s: %d files checked, %.2f MB in all, the largest %s (%.2f MB)' % (os.path.basename(site), len(items) + len(ops) + len(langs), total / 1e6, largest[1], largest[0] / 1e6))
if total > 1e9:
    err('the folder is over 1 GB (GitHub Pages: a published site may be no larger than 1 GB)')
for b in bad:
    print('error: ' + b)
sys.exit(1 if bad else 0)
