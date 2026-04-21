import { Editor, type EditorPosition, type App } from 'obsidian';
import { BLOCK_PATTERNS } from './constants.ts';

/**
 * Detects the block type at the selection
 */
export function detectBlockType(
	app: App,
	editor: Editor,
	from: EditorPosition,
	to: EditorPosition
): string | null {
	const content = editor.getValue();
	const selectionStart = editor.posToOffset(from);
	const selectionEnd = editor.posToOffset(to);

	// Check for Templater blocks
	if (detectTemplaterBlock(content, selectionStart, selectionEnd)) {
		return 'templater';
	}

	// Check for code blocks
	return detectCodeBlock(app, editor, from, to);
}

/**
 * Detects if the selection is inside a code block using metadata cache
 */
function detectCodeBlock(
	app: App,
	editor: Editor,
	from: EditorPosition,
	to: EditorPosition
): string | null {
	const file = app.workspace.getActiveFile();
	if (!file) return null;

	const metadata = app.metadataCache.getFileCache(file);
	if (!metadata?.sections) return null;

	const codeSection = metadata.sections.find(
		(s) =>
			s.type === 'code' &&
			s.position.start.line <= from.line &&
			s.position.end.line >= to.line
	);
	if (!codeSection) return null;

	const fenceLine = editor.getLine(codeSection.position.start.line);
	const langKey = fenceLine.slice(3).trim().split(' ')[0];
	return langKey || 'empty';
}

/**
 * Detects if the selection is inside a Templater block
 */
function detectTemplaterBlock(
	content: string,
	selectionStart: number,
	selectionEnd: number
): boolean {
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
export function adjustSelection(
	editor: Editor,
	from: EditorPosition,
	to: EditorPosition,
	currentText: string
): string {
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
function isPartialMultilineSelection(
	editor: Editor,
	from: EditorPosition,
	to: EditorPosition
): boolean {
	return (
		from.line !== to.line &&
		(from.ch !== 0 || to.ch !== editor.getLine(to.line).length)
	);
}

/**
 * Adjusts the selection to full lines
 */
function adjustToFullLines(
	editor: Editor,
	from: EditorPosition,
	to: EditorPosition
): string {
	const newFrom = { line: from.line, ch: 0 };
	const newTo = { line: to.line, ch: editor.getLine(to.line).length };

	editor.setSelection(newFrom, newTo);
	return editor.getSelection();
}
