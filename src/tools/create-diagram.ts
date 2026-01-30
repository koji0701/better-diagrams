/**
 * Create ASCII diagrams from structured JSON input
 */

interface Box {
    id: string;
    label: string;
    row?: number;
    col?: number;
}

interface Connection {
    from: string;
    to: string;
    label?: string;
}

interface RenderedBox {
    id: string;
    lines: string[];
    width: number;
    height: number;
    row: number;
    col: number;
}

function renderBox(label: string, minWidth = 12): string[] {
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

export function createDiagram(
    boxes: Box[],
    connections?: Connection[],
    title?: string
): string {
    if (!boxes || boxes.length === 0) {
        throw new Error("At least one box is required");
    }

    // Assign positions if not provided
    const positioned: RenderedBox[] = [];
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
    const colWidths: number[] = Array(maxCol + 1).fill(0);
    const rowHeights: number[] = Array(maxRow + 1).fill(0);

    for (const box of positioned) {
        colWidths[box.col] = Math.max(colWidths[box.col], box.width);
        rowHeights[box.row] = Math.max(rowHeights[box.row], box.height);
    }

    // Add spacing for connections
    const colSpacing = 4;
    const rowSpacing = 2;

    // Build output grid
    const output: string[] = [];

    // Add title if provided
    if (title) {
        output.push(title);
        output.push("");
    }

    // Render row by row
    for (let row = 0; row <= maxRow; row++) {
        const rowBoxes = positioned.filter((b) => b.row === row);
        const rowHeight = rowHeights[row];

        // Render each line of this row
        for (let lineIdx = 0; lineIdx < rowHeight; lineIdx++) {
            let line = "";

            for (let col = 0; col <= maxCol; col++) {
                const box = rowBoxes.find((b) => b.col === col);

                if (box && lineIdx < box.lines.length) {
                    const padding = colWidths[col] - box.width;
                    line += box.lines[lineIdx] + " ".repeat(padding + colSpacing);
                } else {
                    line += " ".repeat(colWidths[col] + colSpacing);
                }
            }

            output.push(line.trimEnd());
        }

        // Add connection arrows between rows
        if (row < maxRow && connections) {
            const rowConnections = connections.filter((c) => {
                const fromBox = positioned.find((b) => b.id === c.from);
                const toBox = positioned.find((b) => b.id === c.to);
                return fromBox && toBox && fromBox.row === row && toBox.row === row + 1;
            });

            if (rowConnections.length > 0) {
                // Add vertical connectors
                for (let i = 0; i < rowSpacing; i++) {
                    let connLine = "";
                    for (let col = 0; col <= maxCol; col++) {
                        const hasConnection = rowConnections.some((c) => {
                            const fromBox = positioned.find((b) => b.id === c.from);
                            return fromBox?.col === col;
                        });

                        if (hasConnection) {
                            const boxWidth = colWidths[col];
                            const midPoint = Math.floor(boxWidth / 2);
                            connLine +=
                                " ".repeat(midPoint) +
                                (i === rowSpacing - 1 ? "▼" : "│") +
                                " ".repeat(boxWidth - midPoint - 1 + colSpacing);
                        } else {
                            connLine += " ".repeat(colWidths[col] + colSpacing);
                        }
                    }
                    output.push(connLine.trimEnd());
                }
            } else {
                // Empty spacing
                for (let i = 0; i < rowSpacing; i++) {
                    output.push("");
                }
            }
        }
    }

    return output.join("\n");
}
