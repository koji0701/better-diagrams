// Comprehensive test for all better-diagrams tools
import { mermaidToAscii } from "../src/tools/mermaid-to-ascii.js";
import { createDiagram } from "../src/tools/create-diagram.js";
import { refineAscii } from "../src/tools/refine-ascii.js";
import { editDiagram } from "../src/tools/edit-diagram.js";

async function testAll() {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("                    BETTER DIAGRAMS TEST SUITE                  ");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // 1. Test mermaid_to_ascii
    console.log("┌─────────────────────────────────────────────────────────────┐");
    console.log("│ TEST 1: mermaid_to_ascii                                    │");
    console.log("└─────────────────────────────────────────────────────────────┘\n");

    const mermaidResult = await mermaidToAscii(`
        graph TD
        A["User Request"] --> B["API Gateway"]
        B --> C["Auth Service"]
        B --> D["Data Service"]
        C --> E["Response"]
        D --> E
    `);
    console.log(mermaidResult);
    console.log("\n");

    // 2. Test create_diagram with complex routing
    console.log("┌─────────────────────────────────────────────────────────────┐");
    console.log("│ TEST 2: create_diagram (Architecture with Routing)          │");
    console.log("└─────────────────────────────────────────────────────────────┘\n");

    const architectureResult = createDiagram(
        [
            { id: "user", label: "User/LLM", row: 0, col: 1 },
            { id: "server", label: "Better Diagrams MCP Server", row: 1, col: 1 },
            { id: "mermaid", label: "mermaid_to_ascii\\nMermaid → ASCII", row: 2, col: 0 },
            { id: "create", label: "create_diagram\\nJSON → ASCII", row: 2, col: 1 },
            { id: "refine", label: "refine_ascii\\nFix alignment", row: 2, col: 2 },
            { id: "edit", label: "edit_diagram\\nUpdate boxes", row: 2, col: 3 },
            { id: "output", label: "Clean ASCII Diagrams", row: 3, col: 1 },
        ],
        [
            { from: "user", to: "server" },
            { from: "server", to: "mermaid" },
            { from: "server", to: "create" },
            { from: "server", to: "refine" },
            { from: "server", to: "edit" },
            { from: "mermaid", to: "output" },
            { from: "create", to: "output" },
            { from: "refine", to: "output" },
            { from: "edit", to: "output" },
        ],
        "Better Diagrams Architecture"
    );
    console.log(architectureResult);
    console.log("\n");

    // 3. Test refine_ascii with a broken diagram
    console.log("┌─────────────────────────────────────────────────────────────┐");
    console.log("│ TEST 3: refine_ascii (Fix Broken Diagram)                   │");
    console.log("└─────────────────────────────────────────────────────────────┘\n");

    const brokenDiagram = `
    +--------+
    | Server |
    +--------+
        |
        v
    +------+
    | DB   
    +------+
    `;

    console.log("BEFORE (broken):");
    console.log(brokenDiagram);

    const refinedResult = refineAscii(brokenDiagram);
    console.log("\nAFTER (refined):");
    console.log(refinedResult);
    console.log("\n");

    // 4. Test edit_diagram
    console.log("┌─────────────────────────────────────────────────────────────┐");
    console.log("│ TEST 4: edit_diagram (Update Box Content)                   │");
    console.log("└─────────────────────────────────────────────────────────────┘\n");

    const originalDiagram = `
┌────────────┐
│   Server   │
└────────────┘
       │
       ▼
┌────────────┐
│  Database  │
└────────────┘
`;

    console.log("BEFORE:");
    console.log(originalDiagram);

    const editedResult = editDiagram(originalDiagram, [
        { find: "Server", replace: "API Gateway\\nv2.0" },
        { find: "Database", replace: "PostgreSQL" },
    ]);

    console.log("\nAFTER (Server → API Gateway v2.0, Database → PostgreSQL):");
    console.log(editedResult);
    console.log("\n");

    // 5. Test simple create_diagram (vertical stack)
    console.log("┌─────────────────────────────────────────────────────────────┐");
    console.log("│ TEST 5: create_diagram (Simple Vertical Stack)              │");
    console.log("└─────────────────────────────────────────────────────────────┘\n");

    const simpleResult = createDiagram(
        [
            { id: "ui", label: "UI Layer", row: 0, col: 0 },
            { id: "api", label: "API Server", row: 1, col: 0 },
            { id: "db", label: "Database", row: 2, col: 0 },
        ],
        [
            { from: "ui", to: "api" },
            { from: "api", to: "db" },
        ],
        "Simple Stack"
    );
    console.log(simpleResult);
    console.log("\n");

    console.log("═══════════════════════════════════════════════════════════════");
    console.log("                        ALL TESTS COMPLETE                      ");
    console.log("═══════════════════════════════════════════════════════════════");
}

testAll().catch(console.error);
