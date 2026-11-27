# Services the person composes

Each folder here is a service served from an origin of its own (see [the test server](../server/README.md)).
The world page runs none of a service's code: the service runs in a sandboxed cross-origin frame and only declares what to draw.

## key-world-service/1

| Direction | Message |
| --- | --- |
| world → service | `{type: 'connect', protocol, world}`, with a `MessagePort` |
| service → world | `{type: 'announce', title, footprint, wants, dense}`: what it is, its size, the events it asks for, the address of its dense form |
| service → world | `{type: 'scene', level: 'shallow' \| 'dense', nodes}`: panels, pictures (fetched with CORS), markers, paths and feeds, placed relative to where the person put the service |
| service → world | `{type: 'frame', id, bitmap}`: an `ImageBitmap`, transferred |
| world → service | `{type: 'proximity', level, distance}`, `{type: 'select', node}` |
| world → service | `{type: 'person', …}` and `{type: 'people', list}`, only when the person allowed them |
| world → both services | `{type: 'peer', name}`, with a `MessagePort` each, only when the person links two services |

At a distance a placed service is an empty box with its name; near it, the service draws its dense form.
Only services the person chose appear.
