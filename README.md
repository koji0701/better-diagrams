# better-diagrams

MCP server that helps LLMs create clean ASCII diagrams.

## Installation

### Claude Code
```bash
npx better-diagrams setup
```

Or manually add to `~/.config/claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "better-diagrams": {
      "command": "npx",
      "args": ["-y", "better-diagrams"]
    }
  }
}
```

### Cursor
Add to your MCP server configuration with the same command.

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
