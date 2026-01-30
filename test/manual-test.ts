// Quick test script for the tools
import { mermaidToAscii } from "../src/tools/mermaid-to-ascii.js";
import { createDiagram } from "../src/tools/create-diagram.js";
import { refineAscii } from "../src/tools/refine-ascii.js";
import { editDiagram } from "../src/tools/edit-diagram.js";

async function testMermaidToAscii() {
    console.log("=== Testing mermaid_to_ascii ===\n");

    const result = await mermaidToAscii(`
    graph TD
    A["Login Page"] --> B["Auth Service"]
    B --> C["Database"]
  `);

    console.log(result);
    console.log("\n");
}

function testCreateDiagram() {
    console.log("=== Testing create_diagram ===\n");

    const result = createDiagram(
        [
            { id: "ui", label: "UI Layer", row: 0, col: 0 },
            { id: "api", label: "API Server", row: 1, col: 0 },
            { id: "db", label: "Database", row: 2, col: 0 },
        ],
        [
            { from: "ui", to: "api", label: "HTTP" },
            { from: "api", to: "db", label: "SQL" },
        ],
        "System Architecture"
    );

    console.log(result);
    console.log("\n");
}

function testRefineAscii() {
    console.log("=== Testing refine_ascii ===\n");

    // Broken diagram with common issues
    const broken = `
    +--------+
    | Server |
    +--------+
        |
        v
    +------+
    | DB   
    +------+
  `;

    const result = refineAscii(broken);
    console.log("Before:");
    console.log(broken);
    console.log("\nAfter:");
    console.log(result);
}

function testEditDiagram() {
    console.log("\n=== Testing edit_diagram ===\n");

    const original = `
┌────────────┐
│   Server   │
└────────────┘
       │
       ▼
┌────────────┐
│  Database  │
└────────────┘
`;

    console.log("Before:");
    console.log(original);

    const result = editDiagram(original, [
        { find: "Server", replace: "API Gateway\\nv2.0" },
        { find: "Database", replace: "PostgreSQL" },
    ]);

    console.log("After (changed 'Server' to 'API Gateway\\nv2.0' and 'Database' to 'PostgreSQL'):");
    console.log(result);
}

async function main() {
    await testMermaidToAscii();
    testCreateDiagram();
    testRefineAscii();
    testEditDiagram();
}

main().catch(console.error);
