# SPDX-License-Identifier: BSD-2-Clause
"""Build CC0 MakeHuman figures and bind original 100STYLE motion to each rig."""
import json
import math
from pathlib import Path
import struct
import sys

import bpy
from importlib import import_module
from mathutils import Matrix, Quaternion, Vector

import numpy as np

ASSETS, MOTION, OUTPUT = map(Path, sys.argv[sys.argv.index("--") + 1:])
mpfb = import_module("bl_ext.user_default.mpfb")
services = mpfb.MPFB_CONTEXTUAL_INFORMATION["SERVICES"]
HumanService = services["HumanService"]
TargetService = services["TargetService"]

FIGURES = [
    # Identifier, gender, age, build, weight, height, CC0 skin, hairstyle, outfit, styling.
    ("imani", .12, .63, .48, .70, .47, "old_african_female", "afro01", "female_elegantsuit01", "Neutral"),
    ("theo", .95, .36, .72, .36, .83, "young_caucasian_male", "short03", "male_worksuit01", "Akimbo"),
    ("mei", .09, .46, .52, .36, .38, "middleage_asian_female", "bob02", "female_sportsuit01", "Elated"),
    ("omar", .95, .52, .76, .64, .62, "young_african_male", "short04", "male_casualsuit06", "HandsInPockets"),
    ("hugo", .91, .77, .28, .53, .49, "middleage_asian_male", "short01", "male_elegantsuit01", "Proud"),
    ("lea", .16, .36, .46, .43, .72, "young_caucasian_female2", "braid01", "female_casualsuit02", "OnPhoneLeft"),
    ("mica", .40, .43, .60, .41, .72, "middleage_asian_female", "short02", "female_casualsuit01", "GracefulArms"),
]
RIG_TO_BVH = {
    "Root": "Hips", "pelvis": "Hips",
    "spine_01": "Chest", "spine_02": "Chest2", "spine_03": "Chest4",
    "neck_01": "Neck", "head": "Head",
}
for suffix, side in (("l", "Left"), ("r", "Right")):
    for target, source in (("clavicle", "Collar"), ("upperarm", "Shoulder"), ("lowerarm", "Elbow"),
                           ("hand", "Wrist"), ("thigh", "Hip"), ("calf", "Knee"),
                           ("foot", "Ankle"), ("ball", "Toe")):
        RIG_TO_BVH[f"{target}_{suffix}"] = side + source

DISPLAY = Matrix.Rotation(-math.pi / 2, 4, 'X')
SOURCE = DISPLAY.inverted()
FILES = {f.stem: f for f in MOTION.glob("*/*.bvh")}
HAND_TARGETS = {"scale": .25, "fingers-length": .18, "fingers-diameter": .14}


def names_bytes(names):
    fields = []
    for name in names:
        data = name.encode()
        fields += [struct.pack("<H", len(data)), data]
    combined = b"".join(fields)
    return combined + b"\0" * (-len(combined) % 4)


def columns(matrix):
    return tuple(matrix[row][col] for col in range(4) for row in range(4))


def read_motion(path):
    header, samples = path.read_text().split("MOTION", 1)
    names, parents, stack, channels = [], [], [], []
    offsets, ends = {}, {}
    pending = None
    for line in header.splitlines():
        words = line.split()
        if words[:1] in (["ROOT"], ["JOINT"]):
            pending = len(names)
            names.append(words[1])
            parents.append(stack[-1] if stack else -1)
        elif words == ["{"]:
            stack.append(pending)
            pending = None
        elif words == ["}"]:
            stack.pop()
        elif words[:1] == ["OFFSET"]:
            offset = Vector(tuple(map(float, words[1:])))
            if stack[-1] is None:
                ends[names[stack[-2]]] = offset
            else:
                offsets[names[stack[-1]]] = offset
        elif words[:1] == ["CHANNELS"]:
            channels.append(len(words[2:]))
            expected = ["Yrotation", "Xrotation", "Zrotation"]
            if words[-3:] != expected:
                raise ValueError(f"Unexpected BVH order in {path.name}")
    rows = samples.strip().splitlines()
    interval = float(rows[1].split()[-1])
    frames = np.loadtxt(rows[2:], dtype=np.float64)
    if frames.shape != (int(rows[0].split()[-1]), sum(channels)):
        raise ValueError(f"Invalid frame table in {path.name}")
    return names, parents, offsets, ends, interval, frames


def motion_window(frames, interval, walking):
    # The recordings begin and end in a T pose. Pick a repeating pose inside the performance.
    count = len(frames)
    first = count // 3
    duration = 1.1 if walking else 1.7
    candidates = np.arange(first + round(duration * .7 / interval), first + round(duration * 1.5 / interval))
    difference = ((frames[candidates, 3:] - frames[first, 3:] + 180) % 360 - 180)
    end = candidates[np.argmin(np.mean(difference ** 2, axis=1))]
    stride = max(1, round(1 / (30 * interval)))
    return frames[first:end + 1:stride], stride * interval


def retarget(path, names, parents, rests, local, height):
    sources, source_parents, offsets, ends, interval, frames = read_motion(path)
    walking = path.stem.endswith("_FW")
    frames, interval = motion_window(frames, interval, walking)
    source_ids = {name: i for i, name in enumerate(sources)}
    targets = [(i, source_ids[RIG_TO_BVH[name]]) for i, name in enumerate(names) if name in RIG_TO_BVH]
    target_sources = dict(targets)
    ids = {name: i for i, name in enumerate(names)}
    to_rig = SOURCE.to_quaternion()
    to_source = DISPLAY.to_quaternion()
    bind = [rest.to_quaternion() for rest in rests]
    # BVH arms are extended along X. The fitted MPFB rig binds in an A pose
    # with its forearms already bent. Align each segment before applying the
    # captured global rotation, preserving bone lengths and the fitted roll.
    for suffix, side in (("l", "Left"), ("r", "Right")):
        segments = (
            ("clavicle", "upperarm", offsets[side + "Shoulder"]),
            ("upperarm", "lowerarm", offsets[side + "Elbow"]),
            ("lowerarm", "hand", offsets[side + "Wrist"]),
            ("hand", "middle_01", ends[side + "Wrist"]),
        )
        for parent, child, source_vector in segments:
            i, j = ids[f"{parent}_{suffix}"], ids[f"{child}_{suffix}"]
            fitted = rests[j].translation - rests[i].translation
            bind[i] = fitted.rotation_difference(to_rig @ source_vector) @ bind[i]
    rotations = []
    translations = []
    prior = {}
    for frame in frames:
        world = []
        for i, parent in enumerate(source_parents):
            y, x, z = np.radians(frame[3 + i * 3:6 + i * 3])
            rotation = (Quaternion((0, 1, 0), y) @ Quaternion((1, 0, 0), x) @ Quaternion((0, 0, 1), z))
            world.append(rotation if parent < 0 else world[parent] @ rotation)
        shifted = []
        for i, parent in enumerate(parents):
            if i in target_sources:
                delta = to_rig @ world[target_sources[i]] @ to_source
                rotation = delta @ bind[i]
            else:
                rotation = shifted[parent] @ local[i].to_quaternion()
            shifted.append(rotation)
            if i not in target_sources:
                continue
            relative = rotation if parent < 0 else shifted[parent].inverted() @ rotation
            if i in prior and prior[i].dot(relative) < 0:
                relative.negate()
            prior[i] = relative
            rotations.append((relative.x, relative.y, relative.z, relative.w))
        shift = SOURCE.to_3x3() @ Vector((frame[:3] - frames[0, :3]) * (height / 178))
        translations.append(tuple(local[0].translation + shift))

    # Match the final pose to the first. Keep horizontal travel for the speed estimator.
    tracks = len(targets)
    for k in range(tracks):
        first, last = rotations[k], rotations[-tracks + k]
        sign = 1 if sum(a * b for a, b in zip(first, last)) >= 0 else -1
        rotations[-tracks + k] = tuple(sign * x for x in first)
    translations[-1] = (*translations[-1][:2], translations[0][2])
    header = struct.pack("<4sIIIfIII", b"ANIM", 1, len(names), len(frames),
                         interval * (len(frames) - 1), tracks, 1, 0)
    indices = struct.pack("<" + "H" * (tracks + 1), *(i for i, _ in targets), 0)
    return (header + names_bytes(names) + indices + b"\0" * (-len(indices) % 4)
            + np.rint(np.clip(rotations, -1, 1) * 32767).astype("<i2").tobytes()
            + np.asarray(translations, dtype="<f4").tobytes())


def diffuse(material):
    for line in material.read_text(encoding="utf-8", errors="replace").splitlines():
        if line.startswith("diffuseTexture "):
            path = material.parent / line.split(None, 1)[1]
            if path.is_file():
                return path
    raise ValueError(f"No diffuse texture for {material}")


def asset(kind, name, body):
    folder = ASSETS / kind / name
    mhclo = folder / (name + ".mhclo")
    material = next(line.split(None, 1)[1] for line in mhclo.read_text().splitlines() if line.startswith("material "))
    texture = diffuse(folder / material)
    obj = HumanService.add_mhclo_asset(str(mhclo), body, asset_type=kind, subdiv_levels=0, material_type="GAMEENGINE")
    return obj, texture


def sample_surface(obj, texture, bone_ids, rng, count):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    triangles = np.array([t.vertices[:] for t in mesh.loop_triangles], dtype=np.int32)
    corners = np.array([t.loops[:] for t in mesh.loop_triangles], dtype=np.int32)
    verts = np.array([obj.matrix_world @ vertex.co for vertex in mesh.vertices], dtype=np.float32)
    texcoords = np.array([data.uv[:] for data in mesh.uv_layers.active.data])
    axes = np.array([obj.matrix_world.to_3x3() @ n.vector for n in mesh.corner_normals])
    edges = verts[triangles[:, 1:]] - verts[triangles[:, :1]]
    area = np.linalg.norm(np.cross(edges[:, 0], edges[:, 1]), axis=1)
    choice = rng.choice(len(area), size=count, p=area / area.sum())
    weights = rng.random((count, 2))
    outside = weights.sum(axis=1) > 1
    weights[outside] = 1 - weights[outside]
    bary = np.column_stack((1 - weights.sum(axis=1), weights))
    indices = triangles[choice]
    loops = corners[choice]
    points = np.sum(verts[indices] * bary[:, :, None], axis=1)
    normals = np.sum(axes[loops] * bary[:, :, None], axis=1)
    norm = np.abs(normals).sum(axis=1)
    octa = normals[:, :2] / np.maximum(norm[:, None], 1e-8)
    neg = normals[:, 2] < 0
    octa[neg] = (1 - np.abs(octa[neg, ::-1])) * np.where(octa[neg] < 0, -1, 1)
    normals_packed = np.rint(octa * 32767).astype("<i2").view("<u4").ravel()

    uv = np.sum(texcoords[loops] * bary[:, :, None], axis=1) % 1
    image = bpy.data.images.load(str(texture), check_existing=False)
    image.colorspace_settings.name = "Non-Color"
    width, height = image.size
    pixels = np.empty(width * height * 4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    xy = (uv * [width, height]).astype(np.int32)
    rgba = pixels.reshape(height, width, 4)[xy[:, 1], xy[:, 0]]
    opaque = rgba[:, 3] >= .50
    rgba[:, 3] = 1
    color = np.rint(np.clip(rgba, 0, 1) * 255).astype("u1").view("<u4").ravel()
    bpy.data.images.remove(image)

    groups = {group.index: bone_ids[group.name] for group in obj.vertex_groups if group.name in bone_ids}
    weights = np.zeros((len(mesh.vertices), len(bone_ids)), dtype=np.float32)
    for vertex in mesh.vertices:
        for group in vertex.groups:
            if group.group in groups:
                weights[vertex.index, groups[group.group]] = group.weight
    combined = np.einsum("nvc,nv->nc", weights[indices], bary)
    ids = np.argsort(combined, axis=1)[:, -4:][:, ::-1]
    amount = np.take_along_axis(combined, ids, axis=1)
    unmapped = amount.sum(axis=1) < 1e-8
    ids[unmapped, 0] = 0
    amount[unmapped, 0] = 1
    amount /= amount.sum(axis=1, keepdims=True)
    quantized = np.rint(amount * 255).astype(np.int16)
    quantized[:, 0] += 255 - quantized.sum(axis=1)
    evaluated.to_mesh_clear()
    return (points[opaque].astype("<f4"), normals_packed[opaque], color[opaque],
            ids[opaque].astype("u1"), quantized[opaque].astype("u1"))


def build(figure, index):
    name, gender, age, muscle, weight, height, skin, hair, outfit, style = figure
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    macro = TargetService.get_default_macro_info_dict()
    race = skin.split("_")[1]
    macro.update(gender=gender, age=age, muscle=muscle, weight=weight, height=height,
                 race={key: .84 if key == race else .08 for key in macro["race"]})
    body = HumanService.create_human(macro_detail_dict=macro)
    # Apply MPFB's own bilateral proportion targets before fitting the bones
    # and clothing. Each starts from this figure's individual macro shape.
    targets = Path(mpfb.__file__).parent / "data/targets/hands"
    for side in ("l", "r"):
        for measure, weight_value in HAND_TARGETS.items():
            file = targets / f"{side}-hand-{measure}-decr.target.gz"
            TargetService.load_target(body, str(file), weight=weight_value)
    rig = HumanService.add_builtin_rig(body, "game_engine")
    meshes = [(body, diffuse(ASSETS / "skins" / skin / f"{skin}.mhmat"), 60000)]
    for kind, asset_name, particles in (("clothes", outfit, 59000), ("clothes", "shoes01", 8500),
                                        ("hair", hair, 27000), ("eyes", "low-poly", 5500)):
        meshes.append((*asset(kind, asset_name, body), particles))
    for group in body.vertex_groups:
        if group.name.startswith("Delete."):
            mask = body.modifiers.new(group.name, 'MASK')
            mask.vertex_group = group.name
            mask.invert_vertex_group = True
    bpy.context.view_layer.update()
    roots = [bone for bone in rig.data.bones if bone.parent is None]
    assert len(roots) == 1 and roots[0].name == "Root", roots
    bones = [roots[0], *roots[0].children_recursive]
    names = [bone.name for bone in bones]
    ids = {bone: i for i, bone in enumerate(names)}
    parents = [ids[bone.parent.name] if bone.parent else -1 for bone in bones]
    rests = [rig.matrix_world @ bone.matrix_local for bone in bones]
    rests[0].translation = rests[ids["pelvis"]].translation
    local = [rest if parent < 0 else rests[parent].inverted() @ rest for rest, parent in zip(rests, parents)]
    entries = []
    identity = columns(Matrix.Identity(4))
    for i, rest in enumerate(local):
        location, q, scale = rest.decompose()
        entries.append(struct.pack("<i42f", parents[i], *location, q.x, q.y, q.z, q.w, *scale,
                                   *columns(rests[i].inverted()), *identity))

    rng = np.random.default_rng(949 + index)
    layers = [sample_surface(obj, texture, ids, rng, particles) for obj, texture, particles in meshes]
    fields = [np.concatenate(field, axis=0) for field in zip(*layers)]
    low, high = fields[0][:, 2].min(), fields[0][:, 2].max()
    model = DISPLAY.copy()
    model.translation = Vector((0, -float(low), 0))
    count = len(fields[0])
    header = struct.pack("<4sIII18f", b"SPLT", 1, count, len(names), .0036, .001, *columns(model))
    file = name + ".splat.bin"
    (OUTPUT / file).write_bytes(header + b"".join(entries) + names_bytes(names)
                                + b"".join(field.tobytes() for field in fields))
    clips = {}
    for role, motion in (("walk", style + "_FW"), ("idle", style + "_ID")):
        clip = name + "-" + motion + ".anim.bin"
        (OUTPUT / clip).write_bytes(retarget(FILES[motion], names, parents, rests, local, float(high - low)))
        clips[role] = clip
    print(f"{name}: {count} splats, {len(names)} bones, {high-low:.2f} m, {style} FW/ID", flush=True)
    return {"id": name, "figure": file, "clips": clips, "height": float(high - low),
            "source": {"skin": skin, "hair": hair, "clothes": [outfit, "shoes01"], "eyes": "low-poly",
                       "motion": [style + "_FW", style + "_ID"]}}


OUTPUT.mkdir(parents=True, exist_ok=True)
people = [build(figure, index) for index, figure in enumerate(FIGURES)]
(OUTPUT / "index.json").write_text(json.dumps({"figures": people[:-1], "mica": people[-1]}, indent=2) + "\n")
