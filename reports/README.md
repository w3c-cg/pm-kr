# PM-KR reports and editorial checks

`source/` contains ReSpec source documents. `build/` contains local rendered output and check evidence and is ignored by Git.

| Document | Existing status | Check profile |
| --- | --- | --- |
| [Canonical Procedural Knowledge Interoperability Report](source/pm-kr-standards-track-transition-report.html) | CG-DRAFT; proposed standards path, not an approved transition | `pm-kr-transition` |
| [Stereo 3D and HDR adoption](source/stereo-3d-adoption-report.html) | Individual input (`unofficial`), not a CG report | `pm-kr-stereo-adoption` |
| [General report source](source/index.html) and templates | CG drafting material | `pm-kr` |

These profiles check the structure and existing status of each document. They do not establish group consensus, validate product claims or confer W3C approval. The discussion profiles allow legitimate discussion of standards-track terminology; literal phrase bans in the general CG scaffold profile are not appropriate for that discussion.

## Practical local check

Place a checkout of [respec-mcp](https://github.com/danielcamposramos/respec-mcp) beside this repository. In that checkout run `npm ci` and, if Chrome is not installed for Puppeteer, `npx puppeteer browsers install chrome`. Then here:

```bash
npm run test:profile
npm run check:reports
```

Both reports receive source preflight and full browser validation, with JSON evidence in `reports/build/`. Exit zero means the configured checks passed. The GitHub editorial workflow runs the same checker at a pinned revision and retains reports as artifacts; its job summary is available without an MCP client.

`npm run mcp:start` opens the standalone MCP server against this repository. Its default `pm-kr` profile scaffolds CG reports. Pass the matching profile explicitly when checking an existing discussion report. `npm run mcp:build:docker` and `npm run mcp:start:docker` provide the container alternative.

## Writing and review

Use the [respec-mcp document skills](https://github.com/danielcamposramos/respec-mcp/blob/main/docs/W3C_SKILLS.md): explainer guidance for problems, goals and alternatives; CG guidance for status; implementation-report guidance for measured claims; review skills for accessibility, internationalization, security and privacy. Publication and transition guidance applies only to those processes. Markdown review remains editorial; the ReSpec checker validates ReSpec HTML.

Authors may discuss ideas in their own language and work with AI partners on an English draft. Preserve technical meaning, uncertainty and attribution. In Portuguese: “Se for mais fácil para você, pode explicar em sua própria língua.” Human authors retain editorial responsibility.

When adding evidence, link public commits, reproducible commands and test conditions. Label examples, targets, outreach and measured results separately. Private or uncommitted work is not public evidence. Preserve historical meeting and correspondence records.
