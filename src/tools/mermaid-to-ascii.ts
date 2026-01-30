/**
 * Mermaid to ASCII converter
 * Uses pattern matching to convert simple Mermaid diagrams to ASCII
 */

interface FlowNode {
    id: string;
    label: string;
}

interface FlowEdge {
    from: string;
    to: string;
    label?: string;
}

function parseMermaid(mermaid: string): {
    nodes: FlowNode[];
    edges: FlowEdge[];
} {
    const nodes: Map<string, FlowNode> = new Map();
    const edges: FlowEdge[] = [];

    const lines = mermaid.split("\n").map((l) => l.trim());

    for (const line of lines) {
        // Skip empty lines and directives
        if (!line || line.startsWith("graph") || line.startsWith("flowchart")) {
            continue;
        }

        // Parse edges: A --> B, A --> |label| B, A["Label"] --> B["Label"]
        const edgeMatch = line.match(
            /([A-Za-z0-9_]+)(?:\["([^"]+)"\])?\s*-->\s*(?:\|([^|]+)\|)?\s*([A-Za-z0-9_]+)(?:\["([^"]+)"\])?/
        );

        if (edgeMatch) {
            const [, fromId, fromLabel, edgeLabel, toId, toLabel] = edgeMatch;

            if (!nodes.has(fromId)) {
                nodes.set(fromId, { id: fromId, label: fromLabel || fromId });
            } else if (fromLabel) {
                nodes.get(fromId)!.label = fromLabel;
            }

            if (!nodes.has(toId)) {
                nodes.set(toId, { id: toId, label: toLabel || toId });
            } else if (toLabel) {
                nodes.get(toId)!.label = toLabel;
            }

            edges.push({ from: fromId, to: toId, label: edgeLabel });
            continue;
        }

        // Parse standalone nodes: A["Label"]
        const nodeMatch = line.match(/([A-Za-z0-9_]+)\["([^"]+)"\]/);
        if (nodeMatch) {
            const [, id, label] = nodeMatch;
            nodes.set(id, { id, label });
        }
    }

    return { nodes: Array.from(nodes.values()), edges };
}

function renderBox(label: string, minWidth = 10): string[] {
    const lines = label.split("\\n");
    const width = Math.max(minWidth, ...lines.map((l) => l.length)) + 2;

    const result: string[] = [];
    result.push("┌" + "─".repeat(width) + "┐");

    for (const line of lines) {
        const padding = width - line.length;
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        result.push("│" + " ".repeat(leftPad) + line + " ".repeat(rightPad) + "│");
    }

    result.push("└" + "─".repeat(width) + "┘");
    return result;
}

export async function mermaidToAscii(mermaid: string): Promise<string> {
    if (!mermaid || typeof mermaid !== "string") {
        throw new Error("Invalid mermaid input");
    }

    const { nodes, edges } = parseMermaid(mermaid);

    if (nodes.length === 0) {
        throw new Error("No nodes found in Mermaid diagram");
    }

    // Simple vertical layout for now
    const output: string[] = [];

    // Build adjacency for layout
    const nodeOrder: string[] = [];
    const visited = new Set<string>();

    // Start with nodes that have no incoming edges
    const hasIncoming = new Set(edges.map((e) => e.to));
    for (const node of nodes) {
        if (!hasIncoming.has(node.id)) {
            nodeOrder.push(node.id);
            visited.add(node.id);
        }
    }

    // Add remaining nodes in edge order
    for (const edge of edges) {
        if (!visited.has(edge.to)) {
            nodeOrder.push(edge.to);
            visited.add(edge.to);
        }
    }

    // Add any remaining unconnected nodes
    for (const node of nodes) {
        if (!visited.has(node.id)) {
            nodeOrder.push(node.id);
        }
    }

    // Render each node with connections
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    for (let i = 0; i < nodeOrder.length; i++) {
        const nodeId = nodeOrder[i];
        const node = nodeMap.get(nodeId)!;
        const box = renderBox(node.label);

        // Center the box
        const boxWidth = box[0].length;
        output.push(...box);

        // Check if there's an edge to the next node
        if (i < nodeOrder.length - 1) {
            const nextId = nodeOrder[i + 1];
            const edge = edges.find((e) => e.from === nodeId && e.to === nextId);

            const arrowPadding = " ".repeat(Math.floor(boxWidth / 2));

            if (edge?.label) {
                output.push(arrowPadding + "│");
                output.push(arrowPadding + "│ " + edge.label);
                output.push(arrowPadding + "▼");
            } else if (edge) {
                output.push(arrowPadding + "│");
                output.push(arrowPadding + "▼");
            } else {
                output.push("");
            }
        }
    }

    return output.join("\n");
}
