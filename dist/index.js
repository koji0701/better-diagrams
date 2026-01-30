#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { mermaidToAscii } from "./tools/mermaid-to-ascii.js";
import { createDiagram } from "./tools/create-diagram.js";
import { refineAscii } from "./tools/refine-ascii.js";
import { editDiagram } from "./tools/edit-diagram.js";
const server = new Server({
    name: "better-diagrams",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "mermaid_to_ascii",
                description: "Convert Mermaid diagram syntax to clean ASCII art. Supports flowcharts, sequence diagrams, and more.",
                inputSchema: {
                    type: "object",
                    properties: {
                        mermaid: {
                            type: "string",
                            description: "Mermaid diagram code (e.g., 'graph TD; A-->B')",
                        },
                    },
                    required: ["mermaid"],
                },
            },
            {
                name: "create_diagram",
                description: "Create an ASCII box diagram from structured JSON. Best for architecture diagrams with boxes and connections.",
                inputSchema: {
                    type: "object",
                    properties: {
                        boxes: {
                            type: "array",
                            description: "Array of boxes to draw",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string", description: "Unique identifier" },
                                    label: {
                                        type: "string",
                                        description: "Text inside the box (use \\n for newlines)",
                                    },
                                    row: {
                                        type: "number",
                                        description: "Row position (0-indexed)",
                                    },
                                    col: {
                                        type: "number",
                                        description: "Column position (0-indexed)",
                                    },
                                },
                                required: ["id", "label"],
                            },
                        },
                        connections: {
                            type: "array",
                            description: "Array of connections between boxes",
                            items: {
                                type: "object",
                                properties: {
                                    from: { type: "string", description: "Source box id" },
                                    to: { type: "string", description: "Target box id" },
                                    label: {
                                        type: "string",
                                        description: "Optional label on the connection",
                                    },
                                },
                                required: ["from", "to"],
                            },
                        },
                        title: {
                            type: "string",
                            description: "Optional title for the diagram",
                        },
                    },
                    required: ["boxes"],
                },
            },
            {
                name: "refine_ascii",
                description: "Fix a broken ASCII diagram. Repairs alignment issues, closes unclosed boxes, straightens arrows. Use this when a cheaper model generates a rough diagram that needs cleanup.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ascii: {
                            type: "string",
                            description: "The broken ASCII diagram to fix",
                        },
                    },
                    required: ["ascii"],
                },
            },
            {
                name: "edit_diagram",
                description: "Edit an existing ASCII diagram by finding a box and replacing its content. The box will auto-resize to fit the new text. Use this to update labels without breaking the diagram structure.",
                inputSchema: {
                    type: "object",
                    properties: {
                        ascii: {
                            type: "string",
                            description: "The ASCII diagram to edit",
                        },
                        operations: {
                            type: "array",
                            description: "List of edit operations",
                            items: {
                                type: "object",
                                properties: {
                                    find: {
                                        type: "string",
                                        description: "Text to find in a box (partial match)",
                                    },
                                    replace: {
                                        type: "string",
                                        description: "New text for the box (use \\n for newlines)",
                                    },
                                },
                                required: ["find", "replace"],
                            },
                        },
                    },
                    required: ["ascii", "operations"],
                },
            },
        ],
    };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "mermaid_to_ascii": {
                const result = await mermaidToAscii(args?.mermaid);
                return { content: [{ type: "text", text: result }] };
            }
            case "create_diagram": {
                const result = createDiagram(args?.boxes, args?.connections, args?.title);
                return { content: [{ type: "text", text: result }] };
            }
            case "refine_ascii": {
                const result = refineAscii(args?.ascii);
                return { content: [{ type: "text", text: result }] };
            }
            case "edit_diagram": {
                const result = editDiagram(args?.ascii, args?.operations);
                return { content: [{ type: "text", text: result }] };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${message}` }] };
    }
});
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("better-diagrams MCP server running on stdio");
}
main().catch(console.error);
//# sourceMappingURL=index.js.map