/**
 * Refine broken ASCII diagrams
 * Fixes common issues: unclosed boxes, misaligned arrows, inconsistent spacing
 */

interface BoxRegion {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    content: string[];
}

function findBoxes(lines: string[]): BoxRegion[] {
    const boxes: BoxRegion[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Look for box starts: ┌, +, or ╭
        const starts = [...line.matchAll(/[┌+╭]/g)];

        for (const match of starts) {
            const startCol = match.index!;

            // Find the end of the top border
            let endCol = startCol + 1;
            while (
                endCol < line.length &&
                (line[endCol] === "─" || line[endCol] === "-")
            ) {
                endCol++;
            }

            // Check for proper corner
            if (
                line[endCol] === "┐" ||
                line[endCol] === "+" ||
                line[endCol] === "╮"
            ) {
                // Found a valid top border, now find the bottom
                let endLine = i + 1;
                while (endLine < lines.length) {
                    const checkLine = lines[endLine];
                    if (
                        checkLine[startCol] === "└" ||
                        checkLine[startCol] === "+" ||
                        checkLine[startCol] === "╰"
                    ) {
                        // Found bottom
                        const content: string[] = [];
                        for (let j = i; j <= endLine; j++) {
                            content.push(lines[j].slice(startCol, endCol + 1));
                        }
                        boxes.push({
                            startLine: i,
                            endLine,
                            startCol,
                            endCol,
                            content,
                        });
                        break;
                    } else if (
                        checkLine[startCol] !== "│" &&
                        checkLine[startCol] !== "|"
                    ) {
                        break; // Not a valid box
                    }
                    endLine++;
                }
            }
        }
    }

    return boxes;
}

function normalizeBox(content: string[]): string[] {
    if (content.length < 2) return content;

    const width = Math.max(...content.map((l) => l.length));
    const result: string[] = [];

    // Top border
    result.push("┌" + "─".repeat(width - 2) + "┐");

    // Content lines
    for (let i = 1; i < content.length - 1; i++) {
        let inner = content[i].slice(1, -1);
        inner = inner.replace(/^\s+|\s+$/g, " "); // Trim but keep one space

        const padding = width - 2 - inner.length;
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;

        result.push("│" + " ".repeat(leftPad) + inner.trim() + " ".repeat(rightPad + 1) + "│");
    }

    // Bottom border
    result.push("└" + "─".repeat(width - 2) + "┘");

    return result;
}

function fixArrows(lines: string[]): string[] {
    const result = [...lines];

    for (let i = 0; i < result.length; i++) {
        let line = result[i];

        // Only replace standalone arrow characters (not in the middle of words)
        // Look for 'v' surrounded by spaces/start/end or box characters
        line = line.replace(/(?<=^|\s|│|┘|┐)v(?=$|\s|│|└|┌)/g, "▼");
        line = line.replace(/(?<=^|\s|│|┘|┐)\^(?=$|\s|│|└|┌)/g, "▲");
        line = line.replace(/->/g, "→");
        line = line.replace(/<-/g, "←");

        // Fix broken vertical connectors (standalone pipes)
        line = line.replace(/(?<=^|\s)\|(?=$|\s)/g, "│");

        // Fix broken horizontal connectors
        line = line.replace(/--+/g, (match) => "─".repeat(match.length));

        result[i] = line;
    }

    return result;
}

function alignContent(lines: string[]): string[] {
    // Find the minimum indentation (ignoring empty lines)
    const nonEmpty = lines.filter((l) => l.trim().length > 0);
    if (nonEmpty.length === 0) return lines;

    const minIndent = Math.min(
        ...nonEmpty.map((l) => l.match(/^\s*/)?.[0].length ?? 0)
    );

    // Remove common indentation
    return lines.map((l) => {
        if (l.trim().length === 0) return "";
        return l.slice(minIndent);
    });
}

export function refineAscii(ascii: string): string {
    if (!ascii || typeof ascii !== "string") {
        throw new Error("Invalid ASCII input");
    }

    let lines = ascii.split("\n");

    // Step 1: Align content
    lines = alignContent(lines);

    // Step 2: Fix arrows and connectors
    lines = fixArrows(lines);

    // Step 3: Find and normalize boxes
    const boxes = findBoxes(lines);

    // Replace boxes with normalized versions
    for (const box of boxes.reverse()) {
        // Reverse to avoid index shifting
        const normalized = normalizeBox(box.content);

        // Replace in the lines array
        for (let i = 0; i < normalized.length; i++) {
            const lineIdx = box.startLine + i;
            if (lineIdx < lines.length) {
                const before = lines[lineIdx].slice(0, box.startCol);
                const after = lines[lineIdx].slice(box.endCol + 1);
                lines[lineIdx] = before + normalized[i] + after;
            }
        }
    }

    // Step 4: Remove trailing whitespace
    lines = lines.map((l) => l.trimEnd());

    // Step 5: Remove excessive blank lines
    const result: string[] = [];
    let blankCount = 0;

    for (const line of lines) {
        if (line.length === 0) {
            blankCount++;
            if (blankCount <= 2) {
                result.push(line);
            }
        } else {
            blankCount = 0;
            result.push(line);
        }
    }

    return result.join("\n").trim();
}
