// Test with the exact input that broke
import { createDiagram } from "../src/tools/create-diagram.js";

const result = createDiagram(
    [
        { "id": "entry", "label": "Entry Point\nsrc/index.ts\n(MCP Server)", "row": 0, "col": 1 },
        { "id": "cli", "label": "CLI\nsrc/bin/cli.ts", "row": 0, "col": 0 },
        { "id": "mermaid", "label": "mermaid_to_ascii\nsrc/tools/mermaid-to-ascii.ts\n(Convert Mermaid → ASCII)", "row": 1, "col": 0 },
        { "id": "create", "label": "create_diagram\nsrc/tools/create-diagram.ts\n(JSON → ASCII boxes)", "row": 1, "col": 1 },
        { "id": "refine", "label": "refine_ascii\nsrc/tools/refine-ascii.ts\n(Fix broken diagrams)", "row": 2, "col": 0 },
        { "id": "edit", "label": "edit_diagram\nsrc/tools/edit-diagram.ts\n(Update box content)", "row": 2, "col": 1 },
        { "id": "mcp", "label": "@modelcontextprotocol/sdk\n(StdioServerTransport)", "row": 0, "col": 2 },
        { "id": "clients", "label": "Clients\n(Claude Code, Cursor, etc)", "row": 0, "col": 3 }
    ],
    [
        { "from": "entry", "to": "mermaid", "label": "calls" },
        { "from": "entry", "to": "create", "label": "calls" },
        { "from": "entry", "to": "refine", "label": "calls" },
        { "from": "entry", "to": "edit", "label": "calls" },
        { "from": "entry", "to": "mcp", "label": "uses" },
        { "from": "mcp", "to": "clients", "label": "stdio" }
    ],
    "better-diagrams MCP Server Architecture"
);

console.log(result);
