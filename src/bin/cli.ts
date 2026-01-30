#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const args = process.argv.slice(2);
const command = args[0];

function getConfigPath(): string {
    // Claude Code config location
    const configDir = join(homedir(), ".config", "claude");
    return join(configDir, "claude_desktop_config.json");
}

function setup() {
    const configPath = getConfigPath();
    const configDir = join(homedir(), ".config", "claude");

    // Ensure config directory exists
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }

    // Read existing config or create new one
    let config: { mcpServers?: Record<string, unknown> } = {};
    if (existsSync(configPath)) {
        try {
            config = JSON.parse(readFileSync(configPath, "utf-8"));
        } catch {
            console.error("Warning: Could not parse existing config, creating new one");
        }
    }

    // Add better-diagrams server
    if (!config.mcpServers) {
        config.mcpServers = {};
    }

    config.mcpServers["better-diagrams"] = {
        command: "npx",
        args: ["-y", "better-diagrams"],
    };

    // Write config
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log("✅ better-diagrams MCP server configured!");
    console.log(`   Config written to: ${configPath}`);
    console.log("");
    console.log("Restart Claude Code to use the new tools:");
    console.log("  • mermaid_to_ascii - Convert Mermaid to ASCII");
    console.log("  • create_diagram   - Create diagrams from JSON");
    console.log("  • refine_ascii     - Fix broken ASCII diagrams");
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
} else if (command === "--help" || command === "-h") {
    showHelp();
} else if (!command) {
    // Run as MCP server - import and run main
    import("../index.js").catch(console.error);
} else {
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
