# SPDX-License-Identifier: BSD-2-Clause
"""Run in Blender background mode. Positional arguments follow --."""
import math
from pathlib import Path
import sys

import bmesh
import bpy
from mathutils import Vector

DEMO, PREVIEWS, CARGO = map(Path, sys.argv[sys.argv.index("--") + 1 :])
COLORS = {
    "slate": (0.09, 0.15, 0.18),
    "trim": (0.32, 0.39, 0.42),
    "amber": (0.8, 0.45, 0.1),
    "teal": (0.05, 0.62, 0.53),
    "violet": (0.55, 0.26, 0.76),
    "ink": (0.02, 0.03, 0.04),
}
materials = {}


def start():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.preferences.filepaths.save_version = 0
    materials.clear()
    for name, rgb in COLORS.items():
        material = bpy.data.materials.new(name)
        material.use_nodes = True
        material.diffuse_color = (*rgb, 1)
        shader = material.node_tree.nodes.get("Principled BSDF")
        shader.inputs["Base Color"].default_value = (*rgb, 1)
        shader.inputs["Roughness"].default_value = 0.4
        materials[name] = material


def project_uv(mesh):
    """Use the dominant face plane for repeatable surface coordinates."""
    uv = (mesh.uv_layers.active or mesh.uv_layers.new(name="Surface")).data
    for face in mesh.polygons:
        axis = max(range(3), key=lambda i: abs(face.normal[i]))
        u, v = [i for i in range(3) if i != axis]
        for index in face.loop_indices:
            position = mesh.vertices[mesh.loops[index].vertex_index].co
            uv[index].uv = (position[u], position[v])


def finish(obj, name, material, bevel):
    obj.name = name
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    obj.data.materials.clear()
    obj.data.materials.append(materials[material])
    if bevel:
        edge = obj.modifiers.new("Rounded edges", "BEVEL")
        edge.width = bevel
        edge.segments = 3
        bpy.ops.object.modifier_apply(modifier=edge.name)
    project_uv(obj.data)
    return obj


def prism(name, outline, thickness, center, material, bevel=0.018):
    x, y, z = center
    points = [(x + px, y + dy, z + pz) for dy in (-thickness / 2, thickness / 2) for px, pz in outline]
    count = len(outline)
    faces = [tuple(range(count)), tuple(range(count, 2 * count))]
    for i in range(count):
        j = (i + 1) % count
        faces.append((i, j, j + count, i + count))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(points, [], faces)
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, material, bevel)


def box(name, size, center, material, bevel=0.018):
    w, d, h = size
    return prism(name, [(-w/2, -h/2), (w/2, -h/2), (w/2, h/2), (-w/2, h/2)], d, center, material, bevel)


def polygon(sides, radius, rotation=0):
    return [(radius * math.cos(rotation + i * math.tau / sides),
             radius * math.sin(rotation + i * math.tau / sides)) for i in range(sides)]


def ring(name, sides, outer, inner, y, z, material, rotation=0):
    outer_loop = polygon(sides, outer, rotation)
    inner_loop = polygon(sides, inner, rotation)
    vertices = [(x, y + dy, dz + z) for dy in (-0.037, 0.037)
                for loop in (outer_loop, inner_loop) for x, dz in loop]
    faces = []
    for i in range(sides):
        j = (i + 1) % sides
        faces.extend(((i, j, j+sides, i+sides),
                      (i+2*sides, i+3*sides, j+3*sides, j+2*sides),
                      (i, i+2*sides, j+2*sides, j),
                      (i+sides, j+sides, j+3*sides, i+3*sides)))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, material, 0.009)


def visitor():
    ring("Circular bow", 40, .147, .083, 0, .17, "amber")
    prism("Notched shaft", [(-.043, .06), (.043, .06), (.043, -.18), (.101, -.18),
                          (.101, -.23), (.061, -.23), (.061, -.28), (.095, -.28),
                          (.095, -.33), (-.043, -.33)], .066, (0, 0, 0), "amber", .009)
    box("Shaft spine", (.025, .012, .21), (0, -.038, -.06), "trim", .004)


def account():
    ring("Hexagonal bow", 6, .19, .11, 0, .133, "teal", math.pi / 6)
    prism("Forked blade", [(-.09, .04), (.09, .04), (.09, -.30), (.038, -.30),
                          (.038, -.20), (-.038, -.20), (-.038, -.30), (-.09, -.30)],
          .078, (0, 0, 0), "slate", .012)
    box("Copper contact A", (.037, .012, .12), (-.05, -.043, -.105), "teal", .007)
    box("Copper contact B", (.037, .012, .12), (.05, -.043, -.105), "teal", .007)


def mandate():
    prism("Diamond body", [(0,.32), (.187,.122), (.127,-.013), (.055,-.11),
                           (.055,-.31), (-.055,-.31), (-.055,-.11), (-.127,-.013),
                           (-.187,.122)], .083, (0, 0, 0), "violet", .018)
    prism("Diamond inset", polygon(4, .092, math.pi/2), .016, (0, -.049, .117), "trim", .008)
    box("Mandate stop", (.155, .071, .04), (0, 0, -.223), "violet", .008)


def doors():
    prism("Door leaf", [(-1.22, .03), (1.22, .03), (1.22, 2.48), (.86, 2.96),
                        (-.86, 2.96), (-1.22, 2.48)], .19, (0, 0, 0), "slate", .038)
    prism("Inset cladding", [(-1.055, .17), (1.055, .17), (1.055, 2.42), (.78, 2.78),
                            (-.78, 2.78), (-1.055, 2.42)], .025, (0, -.105, 0), "trim", .045)
    for x in (-.67, .67):
        box("Machined seam", (.027, .04, 2.12), (x, -.136, 1.35), "slate", .006)
    box("Recessed lock", (.35, .062, .49), (.48, -.15, 1.24), "ink", .025)
    box("Lock slot", (.035, .024, .15), (.48, -.184, 1.25), "amber", .005)


def frame():
    # Each overlapping polygon is a structural piece of the same open arch.
    for direction in (-1, 1):
        x = direction
        prism("Pier", [(x*.99,.10), (x*1.41,.10), (x*1.41,2.43), (x*1.03,2.54)],
              .50, (0, 0, 0), "slate", .044)
        box("Foot", (.59,.64,.15), (x*1.21, 0, .09), "trim", .033)
        box("Edge light", (.037,.045,1.95), (x*1.14, -.265, 1.3), "amber", .011)
        prism("Sloped head", [(x*1.02,2.47), (x*1.41,2.42), (x*.92,3.14),
                              (x*.62,2.84)], .5, (0, 0, 0), "trim", .041)
    prism("Header", [(-.93,3.14), (.93,3.14), (.65,2.82), (-.65,2.82)],
          .50, (0, 0, 0), "slate", .044)
    box("Header light", (1.18,.045,.048), (0,-.26,2.99), "amber", .01)


def qr_plate():
    prism("Chamfered wall plate", [(-.66,-.74), (.66,-.74), (.74,-.66), (.74,.66),
                                  (.66,.74), (-.66,.74), (-.74,.66), (-.74,-.66)],
          .15, (0, 0, 0), "trim", .033)
    box("Plate recess", (1.3,.025,1.3), (0,-.082,0), "ink", .02)
    for x in (-.68, .68):
        for z in (-.67, .67):
            prism("Rivet", polygon(8, .02), .018, (x,-.076,z), "amber", .004)


def cargo():
    bpy.ops.import_scene.gltf(filepath=str(CARGO))
    for obj in list(bpy.context.scene.objects):
        if obj.type == "MESH":
            finish(obj, obj.name, "trim", 0)
    bpy.data.orphans_purge(do_recursive=True)


def preview(name, shapes):
    scene = bpy.context.scene
    coords = [obj.matrix_world @ Vector(corner) for obj in shapes for corner in obj.bound_box]
    lower = Vector(tuple(min(p[i] for p in coords) for i in range(3)))
    upper = Vector(tuple(max(p[i] for p in coords) for i in range(3)))
    target = (lower + upper) / 2
    scale = max(upper - lower)
    bpy.ops.object.camera_add(location=target + Vector((.46, -2.5, .39)) * scale)
    camera = bpy.context.object
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = scale * 1.22
    scene.camera = camera
    for offset, energy, size in [((-.9,-1.5,1.7), 170, 2), ((1,-.8,.3), 70, 1.4), ((0,.7,1.5), 110, 1)]:
        bpy.ops.object.light_add(type="AREA", location=target + Vector(offset) * scale)
        lamp = bpy.context.object
        lamp.data.energy = energy * scale**2
        lamp.data.shape = "DISK"
        lamp.data.size = size * scale
        lamp.rotation_euler = (target - lamp.location).to_track_quat("-Z", "Y").to_euler()
    scene.world = bpy.data.worlds.new("Preview backdrop")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs[0].default_value = (.078,.099,.119,1)
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 12
    scene.render.resolution_x = 384
    scene.render.resolution_y = 384
    scene.render.resolution_percentage = 100
    scene.render.filepath = str(PREVIEWS / (name + ".png"))
    bpy.ops.render.render(write_still=True)


MODELS = {
    "visitor": visitor, "account": account, "mandate": mandate,
    "door": doors, "portal": frame, "qr-plate": qr_plate, "cargo": cargo,
}
for name, build in MODELS.items():
    start()
    build()
    bpy.context.view_layer.update()
    shapes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if name != "cargo":
        bpy.ops.wm.save_as_mainfile(filepath=str(DEMO / "source" / (name + ".blend")), compress=True)
    bpy.ops.export_scene.gltf(filepath=str(DEMO / "models" / (name + ".glb")), export_format="GLB")
    preview(name, shapes)
