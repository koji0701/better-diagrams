/**
 * Create ASCII diagrams from structured JSON input
 * Supports multi-segment arrow routing for converging connections
 */
function renderBox(label, minWidth = 12) {
    const lines = label.split("\\n");
    const width = Math.max(minWidth, ...lines.map((l) => l.length)) + 2;
    const result = [];
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
// Character priority for overlapping connections
function mergeChar(existing, newChar) {
    if (existing === " ")
        return newChar;
    // Junction handling: vertical + horizontal = cross
    if ((existing === "│" && newChar === "─") || (existing === "─" && newChar === "│")) {
        return "┼";
    }
    // Corner merging with crossing lines
    if (existing === "│" && ["└", "┘", "┌", "┐"].includes(newChar))
        return newChar;
    if (existing === "─" && ["└", "┘", "┌", "┐"].includes(newChar))
        return newChar;
    // Arrow head takes priority
    if (newChar === "▼" || newChar === "▲")
        return newChar;
    // Keep existing if it's more complex
    return existing;
}
export function createDiagram(boxes, connections, title) {
    if (!boxes || boxes.length === 0) {
        throw new Error("At least one box is required");
    }
    // Assign positions if not provided
    const positioned = [];
    let autoRow = 0;
    for (const box of boxes) {
        const lines = renderBox(box.label);
        positioned.push({
            id: box.id,
            lines,
            width: lines[0].length,
            height: lines.length,
            row: box.row ?? autoRow,
            col: box.col ?? 0,
            startX: 0,
            centerX: 0,
        });
        autoRow++;
    }
    // Find grid dimensions
    const maxRow = Math.max(...positioned.map((b) => b.row));
    const maxCol = Math.max(...positioned.map((b) => b.col));
    // Calculate column widths and row heights
    const colWidths = Array(maxCol + 1).fill(0);
    const rowHeights = Array(maxRow + 1).fill(0);
    for (const box of positioned) {
        colWidths[box.col] = Math.max(colWidths[box.col], box.width);
        rowHeights[box.row] = Math.max(rowHeights[box.row], box.height);
    }
    const colSpacing = 4;
    const rowSpacing = 3;
    // Calculate absolute X positions
    let currentX = 0;
    const colPositions = [];
    for (let col = 0; col <= maxCol; col++) {
        colPositions[col] = currentX;
        currentX += colWidths[col] + colSpacing;
    }
    // Set positions for each box
    for (const box of positioned) {
        const colStart = colPositions[box.col];
        const colWidth = colWidths[box.col];
        box.startX = colStart + Math.floor((colWidth - box.width) / 2);
        box.centerX = box.startX + Math.floor(box.width / 2);
    }
    // Calculate row Y positions
    const rowPositions = [];
    let currentY = 0;
    for (let row = 0; row <= maxRow; row++) {
        rowPositions[row] = currentY;
        currentY += rowHeights[row] + rowSpacing;
    }
    // Grid dimensions
    const totalWidth = colPositions[maxCol] + colWidths[maxCol];
    const totalHeight = rowPositions[maxRow] + rowHeights[maxRow];
    // Initialize character grid
    const grid = [];
    for (let y = 0; y < totalHeight; y++) {
        grid[y] = Array(totalWidth).fill(" ");
    }
    // Draw boxes first
    for (const box of positioned) {
        const startY = rowPositions[box.row];
        for (let lineIdx = 0; lineIdx < box.lines.length; lineIdx++) {
            const line = box.lines[lineIdx];
            for (let charIdx = 0; charIdx < line.length; charIdx++) {
                grid[startY + lineIdx][box.startX + charIdx] = line[charIdx];
            }
        }
    }
    // Helper to safely set grid cell with merging
    const setCell = (y, x, char) => {
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) {
            grid[y][x] = mergeChar(grid[y][x], char);
        }
    };
    // Draw connections
    if (connections && connections.length > 0) {
        // Group connections by source row to target row for smarter routing
        const connGroups = new Map();
        for (const conn of connections) {
            const fromBox = positioned.find((b) => b.id === conn.from);
            const toBox = positioned.find((b) => b.id === conn.to);
            if (!fromBox || !toBox || fromBox.row >= toBox.row)
                continue;
            const key = `${fromBox.row}-${toBox.row}`;
            if (!connGroups.has(key))
                connGroups.set(key, []);
            connGroups.get(key).push(conn);
        }
        for (const [, group] of connGroups) {
            for (const conn of group) {
                const fromBox = positioned.find((b) => b.id === conn.from);
                const toBox = positioned.find((b) => b.id === conn.to);
                const fromY = rowPositions[fromBox.row] + fromBox.height;
                const toY = rowPositions[toBox.row] - 1;
                const fromX = fromBox.centerX;
                const toX = toBox.centerX;
                if (fromX === toX) {
                    // Simple vertical connection
                    for (let y = fromY; y <= toY; y++) {
                        setCell(y, fromX, y === toY ? "▼" : "│");
                    }
                }
                else {
                    // L-shaped routing
                    const turnY = fromY + 1;
                    // Vertical down from source
                    for (let y = fromY; y <= turnY; y++) {
                        setCell(y, fromX, "│");
                    }
                    // Horizontal segment with proper corners
                    const minX = Math.min(fromX, toX);
                    const maxX = Math.max(fromX, toX);
                    for (let x = minX; x <= maxX; x++) {
                        if (x === fromX) {
                            setCell(turnY, x, fromX < toX ? "└" : "┘");
                        }
                        else if (x === toX) {
                            setCell(turnY, x, fromX < toX ? "┐" : "┌");
                        }
                        else {
                            setCell(turnY, x, "─");
                        }
                    }
                    // Vertical down to target
                    for (let y = turnY + 1; y <= toY; y++) {
                        setCell(y, toX, y === toY ? "▼" : "│");
                    }
                }
            }
        }
    }
    // Build output
    const output = [];
    if (title) {
        output.push(title);
        output.push("");
    }
    for (const row of grid) {
        output.push(row.join("").trimEnd());
    }
    // Remove trailing empty lines
    while (output.length > 0 && output[output.length - 1] === "") {
        output.pop();
    }
    return output.join("\n");
}
//# sourceMappingURL=create-diagram.js.map