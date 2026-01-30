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
export declare function createDiagram(boxes: Box[], connections?: Connection[], title?: string): string;
export {};
//# sourceMappingURL=create-diagram.d.ts.map