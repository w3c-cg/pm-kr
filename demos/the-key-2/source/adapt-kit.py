# SPDX-License-Identifier: BSD-2-Clause
"""Adapt the credited kit meshes to procedure names. Run in Blender background mode."""
from pathlib import Path
import sys

import bpy

source, output = map(Path, sys.argv[sys.argv.index("--") + 1:])
assets = {
    "bulkhead": "template-wall.glb",
    "ribbed-wall": "template-wall-detail-a.glb",
    "deck-panel": "template-floor-detail-a.glb",
    "pillar": "template-detail.glb",
    "reception-module": "basemodule_D.gltf",
    "lobby-exhibit": "basemodule_B.gltf",
    "lab-module": "basemodule_E.gltf",
    "beacon": "lights.gltf",
    "mica": "Knight.glb",
}
PAINT = ("slate", "trim", "ink", "teal", "amber", "violet", "floor", "divider", "white", "bulkhead", "ribbing")


def assign_paint(rgb, role):
    r, g, b = rgb
    light = max(rgb)
    color = light - min(rgb)
    if role == "deck-panel":
        return "floor" if color < .18 and light > .2 else "trim"
    if role in ("bulkhead", "ribbed-wall", "pillar") and light > .75:
        return "bulkhead" if role == "bulkhead" else "ribbing" if role == "ribbed-wall" else "divider"
    if light < .07:
        return "ink"
    if color > .17:
        if r > b * 1.3 and r > g * 1.2:
            return "teal" if role == "mica" else "amber"
        if b > r * 1.25 or g > r * 1.35:
            return "teal"
        return "divider"
    if role == "mica" and .12 < light < .5:
        return "violet"
    if light > .75:
        return "white"
    return "trim" if light > .29 else "slate"


def tint_mesh(original, frozen, role, paints):
    src_uv = original.data.uv_layers.active
    target_uv = frozen.uv_layers.active
    if src_uv is None or target_uv is None or len(original.data.polygons) != len(frozen.polygons):
        raise ValueError(f"{original.name} has no compatible atlas coordinates")
    atlases = []
    for slot in original.material_slots:
        image = next((node.image for node in slot.material.node_tree.nodes if node.type == "TEX_IMAGE"), None)
        if image is None:
            raise ValueError(f"{original.name} has no source atlas")
        atlases.append((tuple(image.size), image.pixels[:]))
    frozen.materials.clear()
    for material in paints.values():
        frozen.materials.append(material)
    for polygon, src in zip(frozen.polygons, original.data.polygons, strict=True):
        (width, height), pixels = atlases[src.material_index]
        uv = [src_uv.data[i].uv for i in src.loop_indices]
        n = len(uv)
        x = min(width - 1, max(0, int(sum(p.x for p in uv) * width / n)))
        y = min(height - 1, max(0, int(sum(p.y for p in uv) * height / n)))
        offset = 4 * (y * width + x)
        polygon.material_index = PAINT.index(assign_paint(pixels[offset:offset + 3], role))
        axis = max(range(3), key=lambda i: abs(polygon.normal[i]))
        u, v = [i for i in range(3) if i != axis]
        for i in polygon.loop_indices:
            vertex = frozen.vertices[frozen.loops[i].vertex_index].co
            target_uv.data[i].uv = vertex[u] * .72, vertex[v] * .72


for role, file in assets.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source / file))
    scene = bpy.context.scene
    originals = [obj for obj in scene.objects if obj.type == "MESH"]
    if role == "mica":
        originals = [obj for obj in originals if obj.name.startswith("Knight_") and
                     any(modifier.type == "ARMATURE" for modifier in obj.modifiers)]
        for armature in (obj for obj in scene.objects if obj.type == "ARMATURE"):
            animation = armature.animation_data_create()
            animation.action = bpy.data.actions["Idle"]
            animation.action_slot = animation.action.slots[0]
            animation.use_nla = False
        scene.frame_set(18)
    if not originals:
        raise ValueError(f"No meshes in {file}")

    paints = {name: bpy.data.materials.new(name) for name in PAINT}
    depsgraph = bpy.context.evaluated_depsgraph_get()
    adapted = []
    for original in originals:
        evaluated = original.evaluated_get(depsgraph)
        frozen = bpy.data.meshes.new_from_object(evaluated)
        frozen.transform(evaluated.matrix_world)
        tint_mesh(original, frozen, role, paints)
        obj = bpy.data.objects.new(original.name + "_procedural", frozen)
        bpy.context.collection.objects.link(obj)
        adapted.append(obj)
    if role == "mica":
        vertices = [vertex for obj in adapted for vertex in obj.data.vertices]
        middle = [(min(v.co[i] for v in vertices) + max(v.co[i] for v in vertices)) / 2 for i in (0, 1)]
        sole = min(v.co.z for v in vertices)
        for vertex in vertices:
            vertex.co.x -= middle[0]
            vertex.co.y -= middle[1]
            vertex.co.z -= sole

    bpy.ops.object.select_all(action="DESELECT")
    for obj in adapted:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(output / (role + ".glb")),
                              export_format="GLB", use_selection=True, export_animations=False)
    print(f"KIT {role} {file} {sum(len(obj.data.polygons) for obj in adapted)} faces", flush=True)
