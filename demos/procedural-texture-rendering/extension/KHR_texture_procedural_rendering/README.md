<!--
Draft proposal, not submitted. Written in the glTF extension template (extensions/Template.md of KhronosGroup/glTF).
Text: CC-BY-4.0.
-->

<a id="khr_texture_procedural_rendering"></a>
# Dynamic Procedural Texture Rendering

Draft identifier: `KHR_texture_procedural_rendering`.

## Contributors

* Daniel Campos Ramos, individual contributor, chair of the W3C Procedural Memory Knowledge Representation Community Group, [@danielcamposramos](https://github.com/danielcamposramos)

## Status

Draft proposal.
It has not been submitted to the Khronos Group and is not part of glTF.
The name uses the `KHR` prefix because the extension is intended for ratification, as the glTF Extension Registry allows ("Extensions that are intended to be ratified can also use the `KHR` prefix to avoid name/code/version thrashing"); the name is the proposal's draft identifier and may change in review.

## Dependencies

Written against the glTF 2.0 spec.

## Overview

Dynamic Procedural Texture Rendering gives a texture a first layer that is computed and a last layer that is its picture.
A texture that uses this extension names a **procedure**: a small program, typically a few hundred bytes to a few kilobytes, that draws an approximation of the texture's picture at any resolution.
The texture keeps its ordinary picture in `texture.source`.

An asset that uses the extension is loaded in this order:

1. Every procedure of the asset arrives first.
2. Drawing starts at once from the procedures.
3. The pictures download beside the drawing, over as many connections as the client uses.
4. Each procedure blends into its picture when that picture has arrived and is decoded.
5. That procedure then stops being computed, and its resources are released.

The effect is that a scene is usable after its procedures have arrived, which is kilobytes, while its pictures, which are megabytes, are still on their way.
In the reference scene seven procedures are 15,481 bytes together and their seven pictures 6,259,820 bytes; at 56 kbit/s the scene was drawn from its procedures after 2 to 3 seconds on a GPU (5 to 12 seconds on a processor alone, on a loaded machine) and the pictures took 15 minutes.

A client that does not implement the extension ignores it and loads `texture.source`, so the asset looks the same once loaded.
For that reason the extension is listed in `extensionsUsed` and never in `extensionsRequired`.

### What the extension does not define

- How a procedure is found for a picture. The reference implementation fits procedures to the picture's own pixels.
- How the blend looks. The client chooses; the reference implementation offers a cross-fade and a blend that takes the picture's coarse levels first and its detail last.
- Which resolution a procedure is evaluated at, and where. Evaluating a procedure at the detail each part of the view needs (by distance, by gaze, by the device's load) is a client matter and the subject of later work.

## glTF Schema Updates

### The root object

The extension's root object holds the asset's procedures.

```json
{
    "asset": { "version": "2.0" },
    "extensionsUsed": [ "KHR_texture_procedural_rendering" ],
    "extensions": {
        "KHR_texture_procedural_rendering": {
            "version": 1,
            "procedures": [
                {
                    "name": "brick wall procedure",
                    "uri": "procedures/red_brick_03.p2p",
                    "language": "p2p",
                    "version": 1,
                    "byteLength": 1069
                }
            ]
        }
    }
}
```

| Property | Type | Description | Required |
|---|---|---|---|
| `version` | `integer` | The version of this extension object. This document defines version `1`. | Yes |
| `procedures` | `procedure[1-*]` | The asset's procedures. | Yes |

A client that does not know the root object's `version` MUST treat every texture of the asset as an ordinary texture, and SHOULD tell the user.

### procedure

A procedure is referenced as glTF 2.0 references an image (section 5.18): by a URI, or by a buffer view.

| Property | Type | Description | Required |
|---|---|---|---|
| `uri` | `string` | The URI (or IRI) of the procedure. Relative paths are relative to the current glTF asset. A `data:` URI is allowed. | Exactly one of `uri` and `bufferView` |
| `bufferView` | `integer` | The index of the buffer view that contains the procedure. | Exactly one of `uri` and `bufferView` |
| `mimeType` | `string` | The procedure's media type. Required when `bufferView` is defined. | No |
| `language` | `string` | The language the procedure is written in. This document defines `"p2p"`. | Yes |
| `version` | `integer` | The version of that language. This document defines version `1` of `"p2p"`. | Yes |
| `byteLength` | `integer` | The procedure's length in bytes, so a client can state the asset's procedure total before it fetches anything. | No |
| `name` | `string` | The user-defined name of this object. | No |

A client that does not know a procedure's `language` or `version`, or cannot evaluate something inside the procedure, MUST show that texture's picture alone when it arrives, and SHOULD tell the user what it could not evaluate.
It MUST NOT fail to load the asset.

### The texture

The `KHR_texture_procedural_rendering` extension is added to a `texture` object.

```json
{
    "textures": [
        {
            "name": "brick wall",
            "sampler": 0,
            "source": 0,
            "extensions": {
                "KHR_texture_procedural_rendering": {
                    "procedure": 0
                }
            }
        }
    ],
    "images": [
        { "uri": "pictures/red_brick_03.jpg", "mimeType": "image/jpeg" }
    ]
}
```

| Property | Type | Description | Required |
|---|---|---|---|
| `procedure` | `integer` | The index of the procedure in the root object's `procedures` array. | Yes |
| `views` | `view[2]` | One procedure and one picture for each eye. See "One procedure and one picture per eye". | No |

A texture that uses the extension MUST define `source` (glTF 2.0, section 3.8.2: "A texture is defined by an image index, denoted by the `source` property").
`source` is the picture the procedure blends into, and the picture a client without the extension loads.
The texture's sampler applies to the procedure's drawing as it applies to the picture.

### One procedure and one picture per eye

A stereo texture carries `views`: exactly two entries, one for each eye.

```json
"KHR_texture_procedural_rendering": {
    "procedure": 0,
    "views": [
        { "eye": "left", "procedure": 0, "source": 0 },
        { "eye": "right", "procedure": 7, "source": 7 }
    ]
}
```

| Property | Type | Description | Required |
|---|---|---|---|
| `eye` | `string` | `"left"` or `"right"`, each exactly once. The values are those of `XREye` in the WebXR Device API. | Yes |
| `procedure` | `integer` | The index of this eye's procedure. | Yes |
| `source` | `integer` | The index of this eye's image. | Yes |

The left eye's `procedure` and `source` MUST equal the texture's own `procedure` and `source`.
A client that draws one view, and a client without the extension, therefore show the left eye.
Each eye's picture is a whole image of its own, at its own resolution; nothing is packed into one image.
A client that draws two views draws each eye's texture in that eye's view.

### Loading behaviour

A client that implements the extension:

- MUST fetch every procedure of the asset before it fetches any image that a texture with a procedure refers to.
- MUST begin drawing a texture from its procedure as soon as the procedure and the geometry that shows it are available, without waiting for any image.
- MUST, when a texture's image has arrived and is decoded, change from the procedure's drawing to the image. The change SHOULD be a blend over a short time rather than a switch.
- MUST, when that change has ended, stop evaluating the procedure for that texture and release what the evaluation holds. Work already under way for that texture SHOULD be abandoned when its image arrives.
- MUST keep the procedure's drawing when the image does not arrive, and SHOULD tell the user.

An asset stays valid when an image arrives before its procedure has been drawn: the client then shows the image and never evaluates that procedure.

### JSON Schema

* [glTF.KHR_texture_procedural_rendering.schema.json](schema/glTF.KHR_texture_procedural_rendering.schema.json)
* [procedure.schema.json](schema/procedure.schema.json)
* [texture.KHR_texture_procedural_rendering.schema.json](schema/texture.KHR_texture_procedural_rendering.schema.json)
* [view.schema.json](schema/view.schema.json)

## The `p2p` language, version 1

A `p2p` procedure is UTF-8 text, one operator per line.

```
v0 Noise - 1 1 8 4 6 3f333333 3dcccccd 8 1 3f800000
v1 Ramp v0 1 8 3ebee97d ffb0aea0 3ef615ec ffb2a88c
out v1
```

- An operator line is `ID OPERATOR INPUTS WORDS...`, separated by spaces.
- `ID` names the line's result. `INPUTS` is `-` for none, or the IDs of earlier lines separated by commas. An input MUST be defined on a line above its reader.
- `WORDS` are the operator's parameters: 32-bit words written in hexadecimal. A whole number, a 32-bit IEEE 754 number and a colour (`AARRGGBB`) each take one word.
- The first word of every operator is that operator's own version. A client checks it against the versions it can draw.
- One line `out ID` names the procedure's result.
- Text after `#` at the start of a line is a comment.

The operators of version 1, with the highest operator version this document's implementation draws: `Noise` 1, `Cells` 2, `Tiles` 4, `Ramp` 1, `Layer` 2, `Shade` 2, `Scatter` 2, `Wear` 1, `Tint` 1, `Quad` 1, `Grid` 1, `Stack` 1.
`Quad`, `Grid` and `Stack` are a procedure's last operator: they lay whole procedures beside or over each other, each drawn on its own canvas.
Every operator is a pure function of the place it draws and of its words, and uses only addition, subtraction, multiplication, division, square root and floor, which IEEE 754 rounds the same everywhere; an implementation on a processor therefore draws the same bytes on every machine.
Places are in parts of the whole picture, never in pixels, so a procedure can be drawn at any size and through any window of the picture.

This draft defines the operators by their reference implementation (see "Known Implementations").
A normative description of each operator's words is an open issue.

## Relation to KHR\_texture\_procedurals

[KHR_texture_procedurals](https://github.com/KhronosGroup/glTF/pull/2381) (Initial Draft, read on 12 November 2026 at commit `b13ced8e`) "provides a standardized way to represent procedural graphs which can be mapped to material channels in glTF".
Its graphs are MaterialX node graphs written in JSON, held in a root `procedurals` array and bound on a material's texture reference with `index` and `output`.
In that draft the texture the reference still points to is a fallback: "This can be used to reference the "fallback" texture to use instead of the procedural graph. This could be the “baked” version of the graph, or simply reference an embedded 1 pixel “dummy” image".

The two extensions answer different questions.

| | KHR\_texture\_procedurals | This extension |
|---|---|---|
| What it standardizes | What a procedural graph is: its nodes, types, connections and bindings | When a texture is computed and when it is a picture: the loading order, the change to the picture, the stop |
| The texture beside the procedure | A fallback, used instead of the graph | The last layer: it replaces the procedure when it has arrived |
| How long the procedure is evaluated | For as long as the graph is the texture in use | Until the picture has arrived and the blend has ended |
| Where it attaches | The material's texture reference (`textureInfo`) | The `texture` object, as `KHR_texture_basisu` does |
| The procedure's form | MaterialX nodes as JSON objects, named inputs | Any language the root object names; version 1 defines a compact script |

They can work together in two ways, and this proposal asks for the working group's view on both.

1. A graph of KHR\_texture\_procedurals can be the procedure of this extension. The `language` property leaves room for that: a later version could define a value that refers to an entry of the root `procedurals` array.
2. The meaning of this extension can live inside KHR\_texture\_procedurals as one property on its texture binding that declares the `index` texture to be the graph's refining last layer, not its fallback. A comment on that pull request asked for this on [26 October 2026](https://github.com/KhronosGroup/glTF/pull/2381#issuecomment-6408407907).

## Relation to other extensions

- `KHR_texture_basisu` (ratified) is this extension's model for the place of the extension object and for the fallback: "The following glTF will load `image.ktx2` in clients that support this extension, and otherwise fall back to `image.png`."
  The two combine: a texture may carry a procedure and a KTX 2.0 picture, and the procedure blends into whichever picture the client loads.
- `MSFT_lod` lists levels of detail of a node or a material for "progressively loading the glTF asset starting with the lowest LOD". A procedure is not a material level, and that extension has no place for a blend or for a stop.
- KTX 2.0 lets a client "display a low resolution image quickly without waiting for the entire texture data". Its levels are pictures; a procedure is smaller than the smallest useful level and is drawn at any resolution.

## Open issues

1. The name. `KHR_texture_procedural_rendering` follows the registry's naming rule (`<PREFIX>_<scope>_<feature>`); it is close to `KHR_texture_procedurals`, and the working group may prefer another.
2. A normative description of the `p2p` operators, or another procedure language in its place.
3. The media type of a procedure held in a buffer view, and the file name's ending. No media type is registered for the language, and `.p2p` is already the ending of another registered type (`application/vnd.wfa.p2p`), which a static host may therefore give a procedure file. A client MUST NOT rely on the type a host gives a procedure.
4. Whether an image should be allowed to state its length in bytes, so a client can estimate the picture downloads before it starts them. The reference scene carries it in `extras.byteLength`.
5. A field for the relief (the height a procedure also computes), from which a stereo client can give a flat texture depth below its surface.

## Known Implementations

* The Dynamic Procedural Texture Rendering demo: a web page that loads the reference scene in the order above, with a WebGPU player and a WebAssembly player of the `p2p` operators, and a panel that simulates a connection speed. It is the folder this document lies in.
* `ptr_texture.py`: writes the extension into a glTF asset and validates it against this document.

The reference scene passes the Khronos glTF Validator with no error and no warning, and three.js's `GLTFLoader`, which does not know the extension, draws it from its pictures.

## Resources

* [glTF 2.0 Specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html): sections 3.8.2 (textures), 3.12 (extensions), 5.18 (image).
* [glTF 2.0 Extension Registry](https://github.com/KhronosGroup/glTF/blob/main/extensions/README.md): naming, `extensionsUsed` and `extensionsRequired`, the extension template.
* [KHR_texture_procedurals, pull request 2381](https://github.com/KhronosGroup/glTF/pull/2381).
* [KHR_texture_basisu](https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_texture_basisu/README.md).
* [WebXR Device API](https://www.w3.org/TR/webxr/): `XREye`.
* Farbrausch, [fr_public](https://github.com/farbrausch/fr_public): werkkzeug3, whose way of building textures from small operators this work follows.
* Eric Heitz and Fabrice Neyret, "High-Performance By-Example Noise using a Histogram-Preserving Blending Operator" (2018): the variance-preserving blend the reference implementation uses for the detail.
