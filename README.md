# better-diagrams

MCP server that helps LLMs create clean ASCII diagrams.

On npm: https://www.npmjs.com/package/better-diagrams

## Architecture

```
                        ┌──────────────────────┐
                        │      LLM Client      │
                        │ (Claude Code/Cursor) │
                        └──────────────────────┘
                                    │
                                    │
                                    ▼
                            ┌──────────────┐
                            │  MCP Server  │
                            │  (index.ts)  │
                            └──────────────┘
                                    │
          ┌─────────────────────────│───────────────────────┐───────────────────┐
          ▼                         ▼                       ▼                   ▼
┌──────────────────┐       ┌────────────────┐       ┌──────────────┐    ┌──────────────┐
│ mermaid_to_ascii │       │ create_diagram │       │ refine_ascii │    │ edit_diagram │
│ Convert Mermaid  │       │ JSON to ASCII  │       │  Fix broken  │    │  Update box  │
│     to ASCII     │       │  box diagrams  │       │   diagrams   │    │   contents   │
└──────────────────┘       └────────────────┘       └──────────────┘    └──────────────┘
```

The better-diagrams MCP server exposes four tools that LLM clients can use to create and manipulate ASCII diagrams. The server communicates via the Model Context Protocol (MCP) using stdio transport.

## Installation

### Claude Code
```bash
claude mcp add better-diagrams -- npx -y better-diagrams
```

### Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "servers": {
    "better-diagrams": {
      "command": "npx",
      "args": ["-y", "better-diagrams"]
    }
  }
}
```

## Tools

### `mermaid_to_ascii`
Convert Mermaid diagram syntax to ASCII art.

### `create_diagram`
Create ASCII diagrams from structured JSON input.

### `refine_ascii`
Fix broken ASCII diagrams - repair alignment, close boxes, straighten arrows.

### `edit_diagram`
Edit text inside ASCII boxes - finds boxes by content, replaces text, auto-resizes.

## License

MIT
