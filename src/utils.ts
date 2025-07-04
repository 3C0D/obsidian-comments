import { Editor, type EditorPosition } from 'obsidian';

/**
 * Block detection patterns
 */
const BLOCK_PATTERNS = {
    codeBlock: /^(`{3,}|~{3,})([a-z0-9-+]*)\n([\s\S]*?)\n(\1)$/gim,
    templateBlock: /^<%\*(.*?)%>$/gms,
};

/**
 * Detects the block type at the selection
 */
export function detectBlockType(
    content: string,
    selectionStart: number,
    selectionEnd: number,
): string | null {
    // Check for Templater blocks
    if (detectTemplaterBlock(content, selectionStart, selectionEnd)) {
        return 'templater';
    }

    // Check for code blocks
    return detectCodeBlock(content, selectionStart, selectionEnd);
}

/**
 * Detects if the selection is inside a code block
 */
function detectCodeBlock(content: string, selectionStart: number, selectionEnd: number): string | null {
    BLOCK_PATTERNS.codeBlock.lastIndex = 0;

    let match;
    while ((match = BLOCK_PATTERNS.codeBlock.exec(content))) {
        const blockStart = match.index;
        const blockEnd = match.index + match[0].length;

        if (blockStart <= selectionStart && blockEnd >= selectionEnd) {
            return match[2] || 'empty';
        }
    }
    return null;
}

/**
 * Detects if the selection is inside a Templater block
 */
function detectTemplaterBlock(content: string, selectionStart: number, selectionEnd: number): boolean {
    BLOCK_PATTERNS.templateBlock.lastIndex = 0;

    let match;
    while ((match = BLOCK_PATTERNS.templateBlock.exec(content))) {
        const blockStart = match.index;
        const blockEnd = match.index + match[0].length;

        if (blockStart <= selectionStart && blockEnd >= selectionEnd) {
            return true;
        }
    }
    return false;
}

/**
 * Adjusts the selection for line comments
 */
export function adjustSelection(editor: Editor, from: EditorPosition, to: EditorPosition, currentText: string): string {
    const start = editor.posToOffset(from);
    const end = editor.posToOffset(to);

    // No selection: select the current line
    if (start === end) {
        return selectCurrentLine(editor, to);
    }

    // Partial multiline selection: adjust to full lines
    if (isPartialMultilineSelection(editor, from, to)) {
        return adjustToFullLines(editor, from, to);
    }

    return currentText;
}

/**
 * Selects the current line if there is no selection
 */
function selectCurrentLine(editor: Editor, position: EditorPosition): string {
    const line = editor.getLine(position.line);

    if (line.trim() === '') return '';

    const from = { line: position.line, ch: 0 };
    const to = { line: position.line, ch: line.length };

    editor.setSelection(from, to);
    return line;
}

/**
 * Checks if the selection is a partial multiline selection
 */
function isPartialMultilineSelection(editor: Editor, from: EditorPosition, to: EditorPosition): boolean {
    return from.line !== to.line &&
        (from.ch !== 0 || to.ch !== editor.getLine(to.line).length);
}

/**
 * Adjusts the selection to full lines
 */
function adjustToFullLines(editor: Editor, from: EditorPosition, to: EditorPosition): string {
    const newFrom = { line: from.line, ch: 0 };
    const newTo = { line: to.line, ch: editor.getLine(to.line).length };

    editor.setSelection(newFrom, newTo);
    return editor.getSelection();
}