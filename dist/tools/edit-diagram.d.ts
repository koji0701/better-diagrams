/**
 * Edit ASCII diagram boxes - update text content and auto-resize boxes
 * Handles: finding boxes by content, updating text, resizing to fit
 */
export interface EditOperation {
    /** Text to find in an existing box (partial match) */
    find: string;
    /** New text to replace the box content with */
    replace: string;
}
/**
 * Edit a diagram by finding a box and replacing its content
 */
export declare function editDiagram(ascii: string, operations: EditOperation[]): string;
//# sourceMappingURL=edit-diagram.d.ts.map