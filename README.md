# better-diagrams

MCP server that helps LLMs create clean ASCII diagrams.

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
