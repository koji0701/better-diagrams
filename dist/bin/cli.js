#!/usr/bin/env node
import { homedir } from "os";
import { join } from "path";
const args = process.argv.slice(2);
const command = args[0];
function getConfigPath() {
    // Claude Code config location
    const configDir = join(homedir(), ".config", "claude");
    return join(configDir, "claude_desktop_config.json");
}
function setup() {
    console.log(`
✅ To add better-diagrams to Claude Code, run:

   claude mcp add better-diagrams -- npx -y better-diagrams

Then restart Claude Code.

Tools available:
  • mermaid_to_ascii  Convert Mermaid diagrams to ASCII
  • create_diagram    Create ASCII from structured JSON
  • refine_ascii      Fix broken ASCII diagrams
  • edit_diagram      Edit text inside ASCII boxes
`);
}
function showHelp() {
    console.log(`
better-diagrams - MCP server for ASCII diagrams

Usage:
  npx better-diagrams setup    Add to Claude Code config
  npx better-diagrams          Run MCP server (stdio mode)
  npx better-diagrams --help   Show this help

Tools available:
  • mermaid_to_ascii  Convert Mermaid diagrams to ASCII
  • create_diagram    Create ASCII from structured JSON
  • refine_ascii      Fix broken ASCII diagrams
  • edit_diagram      Edit text inside ASCII boxes
`);
}
// Main
if (command === "setup") {
    setup();
}
else if (command === "--help" || command === "-h") {
    showHelp();
}
else if (!command) {
    // Run as MCP server - import and run main
    import("../index.js").catch(console.error);
}
else {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
//# sourceMappingURL=cli.js.map