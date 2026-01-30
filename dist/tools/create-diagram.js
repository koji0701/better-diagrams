/**
 * Create ASCII diagrams from structured JSON input
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
/**
 * Calculate absolute X positions for each box's center
 */
function calculateBoxPositions(positioned, colWidths, colSpacing) {
    const maxCol = Math.max(...positioned.map((b) => b.col));
    // Calculate cumulative X positions for each column
    const colPositions = [];
    let currentX = 0;
    for (let col = 0; col <= maxCol; col++) {
        colPositions[col] = currentX;
        currentX += colWidths[col] + colSpacing;
    }
    // Set center X for each box
    for (const box of positioned) {
        box.centerX = colPositions[box.col] + Math.floor(box.width / 2);
    }
}
/**
 * Draw a multi-segment path from one box to another
 */
function drawConnection(fromBox, toBox, grid, rowHeights, rowSpacing) {
    // Calculate starting Y (bottom of fromBox)
    let startY = 0;
    for (let r = 0; r < fromBox.row; r++) {
        startY += rowHeights[r] + rowSpacing;
    }
    startY += fromBox.height;
    // Calculate ending Y (top of toBox)
    let endY = 0;
    for (let r = 0; r < toBox.row; r++) {
        endY += rowHeights[r] + rowSpacing;
    }
    const fromX = fromBox.centerX;
    const toX = toBox.centerX;
    // Draw vertical segment from source box
    for (let y = startY; y < startY + rowSpacing; y++) {
        const key = `${fromX},${y}`;
        if (!grid.has(key)) {
            grid.set(key, y === startY + rowSpacing - 1 && fromX === toX ? "▼" : "│");
        }
    }
    if (fromX !== toX) {
        // Calculate turn point Y (after first vertical segment)
        const turnY = startY + rowSpacing;
        // Draw horizontal segment
        const minX = Math.min(fromX, toX);
        const maxX = Math.max(fromX, toX);
        for (let x = minX; x <= maxX; x++) {
            const key = `${x},${turnY}`;
            if (!grid.has(key)) {
                if (x === fromX) {
                    grid.set(key, fromX < toX ? "└" : "┘");
                }
                else if (x === toX) {
                    grid.set(key, fromX < toX ? "┐" : "┌");
                }
                else {
                    grid.set(key, "─");
                }
            }
        }
        // Draw vertical segment to target box
        for (let y = turnY + 1; y < endY; y++) {
            const key = `${toX},${y}`;
            if (!grid.has(key)) {
                grid.set(key, y === endY - 1 ? "▼" : "│");
            }
        }
    }
}
export function createDiagram(boxes, connections, title) {
    if (!boxes || boxes.length === 0) {
        throw new Error("At least one box is required");
    }
    // Assign positions if not provided
    const positioned = [];
    let autoRow = 0;
    let autoCol = 0;
    for (const box of boxes) {
        const lines = renderBox(box.label);
        positioned.push({
            id: box.id,
            lines,
            width: lines[0].length,
            height: lines.length,
            row: box.row ?? autoRow,
            col: box.col ?? autoCol,
        });
        // Auto-increment position
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
    // Add spacing for connections
    const colSpacing = 4;
    const rowSpacing = 2;
    // Calculate absolute positions
    calculateBoxPositions(positioned, colWidths, colSpacing);
    // Build connection grid
    const connectionGrid = new Map();
    if (connections && connections.length > 0) {
        for (const conn of connections) {
            const fromBox = positioned.find((b) => b.id === conn.from);
            const toBox = positioned.find((b) => b.id === conn.to);
            if (fromBox && toBox && fromBox.row < toBox.row) {
                drawConnection(fromBox, toBox, connectionGrid, rowHeights, rowSpacing);
            }
        }
    }
    // Build output grid
    const output = [];
    // Add title if provided
    if (title) {
        output.push(title);
        output.push("");
    }
    // Calculate total height
    let totalHeight = 0;
    for (let r = 0; r <= maxRow; r++) {
        totalHeight += rowHeights[r];
        if (r < maxRow) {
            totalHeight += rowSpacing;
        }
    }
    // Render line by line
    let currentY = 0;
    for (let row = 0; row <= maxRow; row++) {
        const rowBoxes = positioned.filter((b) => b.row === row);
        const rowHeight = rowHeights[row];
        // Render each line of this row
        for (let lineIdx = 0; lineIdx < rowHeight; lineIdx++) {
            let line = "";
            let currentX = 0;
            for (let col = 0; col <= maxCol; col++) {
                const box = rowBoxes.find((b) => b.col === col);
                if (box && lineIdx < box.lines.length) {
                    line += box.lines[lineIdx];
                    currentX += box.width;
                }
                else {
                    // Check for connection characters in this space
                    let hasConnection = false;
                    for (let x = currentX; x < currentX + colWidths[col]; x++) {
                        const key = `${x},${currentY}`;
                        if (connectionGrid.has(key)) {
                            // Pad to reach this position
                            while (line.length < x) {
                                line += " ";
                            }
                            line += connectionGrid.get(key);
                            hasConnection = true;
                        }
                    }
                    if (!hasConnection) {
                        line += " ".repeat(colWidths[col]);
                    }
                    currentX += colWidths[col];
                }
                // Add column spacing
                if (col < maxCol) {
                    for (let x = currentX; x < currentX + colSpacing; x++) {
                        const key = `${x},${currentY}`;
                        if (connectionGrid.has(key)) {
                            while (line.length < x) {
                                line += " ";
                            }
                            line += connectionGrid.get(key);
                        }
                    }
                    currentX += colSpacing;
                }
            }
            output.push(line.trimEnd());
            currentY++;
        }
        // Add spacing lines between rows
        if (row < maxRow) {
            for (let i = 0; i < rowSpacing; i++) {
                let line = "";
                let currentX = 0;
                // Check entire row for connection characters
                const maxX = currentX;
                for (let col = 0; col <= maxCol; col++) {
                    currentX += colWidths[col];
                    if (col < maxCol) {
                        currentX += colSpacing;
                    }
                }
                for (let x = 0; x < currentX; x++) {
                    const key = `${x},${currentY}`;
                    if (connectionGrid.has(key)) {
                        while (line.length < x) {
                            line += " ";
                        }
                        line += connectionGrid.get(key);
                    }
                }
                output.push(line.trimEnd());
                currentY++;
            }
        }
    }
    return output.join("\n");
}
//# sourceMappingURL=create-diagram.js.map