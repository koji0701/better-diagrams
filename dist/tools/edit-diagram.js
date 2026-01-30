/**
 * Edit ASCII diagram boxes - update text content and auto-resize boxes
 * Handles: finding boxes by content, updating text, resizing to fit
 */
/**
 * Find all boxes in the ASCII diagram
 */
function findAllBoxes(lines) {
    const boxes = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Look for box top-left corners
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === "┌" || char === "+" || char === "╭") {
                // Found potential box start, trace the border
                let endCol = j + 1;
                // Find top-right corner
                while (endCol < line.length) {
                    const c = line[endCol];
                    if (c === "┐" || c === "+" || c === "╮")
                        break;
                    if (c !== "─" && c !== "-") {
                        endCol = -1;
                        break;
                    }
                    endCol++;
                }
                if (endCol < 0 || endCol >= line.length)
                    continue;
                // Found valid top border, now find bottom
                let endLine = i + 1;
                const boxWidth = endCol - j + 1;
                while (endLine < lines.length) {
                    const checkLine = lines[endLine] || "";
                    const leftChar = checkLine[j];
                    if (leftChar === "└" || leftChar === "+" || leftChar === "╰") {
                        // Verify it's a proper bottom border
                        let validBottom = true;
                        for (let k = j + 1; k < j + boxWidth - 1 && k < checkLine.length; k++) {
                            if (checkLine[k] !== "─" && checkLine[k] !== "-") {
                                validBottom = false;
                                break;
                            }
                        }
                        if (validBottom) {
                            // Extract box content
                            const boxLines = [];
                            let contentText = "";
                            for (let lineIdx = i; lineIdx <= endLine; lineIdx++) {
                                const boxLine = (lines[lineIdx] || "").slice(j, endCol + 1);
                                boxLines.push(boxLine);
                                // Extract inner content (not borders)
                                if (lineIdx > i && lineIdx < endLine) {
                                    const inner = boxLine.slice(1, -1).trim();
                                    if (inner) {
                                        contentText += (contentText ? "\\n" : "") + inner;
                                    }
                                }
                            }
                            boxes.push({
                                startLine: i,
                                endLine,
                                startCol: j,
                                endCol,
                                content: contentText,
                                lines: boxLines,
                            });
                        }
                        break;
                    }
                    else if (leftChar !== "│" && leftChar !== "|") {
                        break; // Not a valid box
                    }
                    endLine++;
                }
            }
        }
    }
    return boxes;
}
/**
 * Create a new box with the given content
 */
function createBox(content, minWidth = 0) {
    const textLines = content.split("\\n");
    const maxTextWidth = Math.max(...textLines.map((l) => l.length), minWidth);
    const boxWidth = maxTextWidth + 4; // 2 for borders, 2 for padding
    const result = [];
    // Top border
    result.push("┌" + "─".repeat(boxWidth - 2) + "┐");
    // Content lines
    for (const text of textLines) {
        const padding = boxWidth - 2 - text.length;
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        result.push("│" + " ".repeat(leftPad) + text + " ".repeat(rightPad) + "│");
    }
    // Bottom border
    result.push("└" + "─".repeat(boxWidth - 2) + "┘");
    return result;
}
/**
 * Edit a diagram by finding a box and replacing its content
 */
export function editDiagram(ascii, operations) {
    if (!ascii || typeof ascii !== "string") {
        throw new Error("Invalid ASCII input");
    }
    if (!operations || operations.length === 0) {
        throw new Error("At least one edit operation is required");
    }
    let lines = ascii.split("\n");
    for (const op of operations) {
        const boxes = findAllBoxes(lines);
        // Find the box that matches the search text
        const targetBox = boxes.find((box) => box.content.toLowerCase().includes(op.find.toLowerCase()));
        if (!targetBox) {
            throw new Error(`Could not find box containing "${op.find}"`);
        }
        // Create new box with updated content
        const originalWidth = targetBox.endCol - targetBox.startCol + 1;
        const newBox = createBox(op.replace, originalWidth - 4);
        // Calculate width difference
        const newWidth = newBox[0].length;
        const widthDiff = newWidth - originalWidth;
        // Replace the box in the diagram
        const newLines = [];
        for (let i = 0; i < lines.length; i++) {
            if (i < targetBox.startLine || i > targetBox.endLine) {
                // Lines outside the box - adjust if width changed
                if (widthDiff !== 0 && lines[i].length > targetBox.startCol) {
                    const before = lines[i].slice(0, targetBox.startCol);
                    const after = lines[i].slice(targetBox.endCol + 1);
                    // Check if this line has content aligned with the box
                    const middle = lines[i].slice(targetBox.startCol, targetBox.endCol + 1);
                    if (middle.trim() === "" || middle.includes("│") || middle.includes("|")) {
                        // Adjust spacing for vertical connectors
                        if (widthDiff > 0) {
                            // Box got wider - add padding
                            const halfDiff = Math.floor(widthDiff / 2);
                            newLines.push(before + " ".repeat(halfDiff) + middle + " ".repeat(widthDiff - halfDiff) + after);
                        }
                        else {
                            // Box got narrower - this is trickier, just keep as-is for now
                            newLines.push(lines[i]);
                        }
                    }
                    else {
                        newLines.push(lines[i]);
                    }
                }
                else {
                    newLines.push(lines[i]);
                }
            }
            else {
                // Lines inside the box region
                const boxLineIdx = i - targetBox.startLine;
                if (boxLineIdx < newBox.length) {
                    const before = lines[i].slice(0, targetBox.startCol);
                    const after = lines[i].slice(targetBox.endCol + 1);
                    newLines.push(before + newBox[boxLineIdx] + after);
                }
                // If new box has fewer lines than old, skip extra old lines
                // (handled by continuing to next iteration)
            }
        }
        // If new box has more lines than old, we need to insert
        if (newBox.length > targetBox.endLine - targetBox.startLine + 1) {
            const extraLines = newBox.length - (targetBox.endLine - targetBox.startLine + 1);
            const insertPoint = targetBox.startLine + (targetBox.endLine - targetBox.startLine + 1);
            for (let i = 0; i < extraLines; i++) {
                const boxLineIdx = targetBox.endLine - targetBox.startLine + 1 + i;
                const before = " ".repeat(targetBox.startCol);
                newLines.splice(insertPoint + i, 0, before + newBox[boxLineIdx]);
            }
        }
        lines = newLines;
    }
    return lines.join("\n");
}
//# sourceMappingURL=edit-diagram.js.map