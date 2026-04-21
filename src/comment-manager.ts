import { Editor, type EditorPosition, type App } from 'obsidian';
import { getCommentPattern } from './patterns.ts';
import type { CommentPatterns } from './types.ts';
import { detectBlockType, adjustSelection } from './utils.ts';
import { CODE_BLOCK_TRIM_PATTERN, OBSIDIAN_COMMENT_PATTERN } from './constants.ts';

/**
 * Processes comments (line or block)
 */
export function processComments(app: App, editor: Editor, isBlockComment: boolean): void {
	const selection = getSelection(editor, isBlockComment);
	if (!selection.text && !isBlockComment) return;

	const blockType = detectBlockType(app, editor, selection.from, selection.to);
	const processedText = processText(selection.text, blockType, isBlockComment);

	editor.replaceRange(processedText, selection.from, selection.to);
}

/**
 * Removes trailing spaces in the entire document
 */
export function trimEndAllDoc(editor: Editor): void {
	const content = editor.getValue();
	const trimmedContent = content.replace(/[ \t]+$/gm, '');
	editor.setValue(trimmedContent);
}

/**
 * Removes trailing spaces only in code blocks
 */
export function trimEndCodeBlocks(editor: Editor): void {
	const content = editor.getValue();
	const processedContent = content.replace(
		CODE_BLOCK_TRIM_PATTERN,
		(_match, delimiter, language, blockContent, _closingDelimiter) => {
			const trimmedBlockContent = blockContent.replace(/[ \t]+$/gm, '');
			return `${delimiter}${language}\n${trimmedBlockContent}\n${delimiter}`;
		}
	);
	editor.setValue(processedContent);
}

/**
 * Gets the current selection with adjustments if necessary
 */
function getSelection(
	editor: Editor,
	isBlockComment: boolean
): {
	text: string;
	from: EditorPosition;
	to: EditorPosition;
} {
	let from = editor.getCursor('from');
	let to = editor.getCursor('to');
	let text = editor.getSelection();

	// Adjustment for line comments
	if (!isBlockComment) {
		text = adjustSelection(editor, from, to, text);
		from = editor.getCursor('from');
		to = editor.getCursor('to');
	}

	return { text, from, to };
}

/**
 * Processes the text to add/remove comments
 */
function processText(
	text: string,
	blockType: string | null,
	isBlockComment: boolean
): string {
	// Default Obsidian comments
	if (!blockType) {
		return processObsidianComment(text);
	}

	const pattern = getCommentPattern(blockType, isBlockComment);
	if (!pattern) return text;

	if (!isBlockComment) {
		const lines = text.split('\n').filter((l) => l.trim() !== '');
		const allCommented = lines.every((l) => {
			pattern.uncomment.lastIndex = 0;
			return pattern.uncomment.test(l);
		});
		return allCommented ? uncommentText(text, pattern) : commentText(text, pattern);
	}

	pattern.uncomment.lastIndex = 0;
	return pattern.uncomment.test(text)
		? uncommentText(text, pattern)
		: commentText(text, pattern);
}

/**
 * Processes Obsidian comments (%% %%)
 */
function processObsidianComment(text: string): string {
	OBSIDIAN_COMMENT_PATTERN.lastIndex = 0;
	if (OBSIDIAN_COMMENT_PATTERN.test(text)) {
		OBSIDIAN_COMMENT_PATTERN.lastIndex = 0;
		return text.replace(OBSIDIAN_COMMENT_PATTERN, '$1');
	}
	return text.replace(/^(.+)$/gms, '%% $1 %%');
}

/**
 * Removes comments
 */
function uncommentText(text: string, pattern: CommentPatterns): string {
	pattern.uncomment.lastIndex = 0;
	return text.replace(pattern.uncomment, (match, ...groups) => {
		if (groups.length >= 2 && groups[1]) {
			// indentation handling
			// console.debug('uncomment line comments', match);
			return groups[0] + groups[1];
		} else if (groups.length >= 2 && !groups[1]) {
			// block comments
			// console.debug('uncomment block comments', match);
			return groups[0];
		} else if (groups.length === 1) {
			// console.debug('uncomment Never happening?', match);
			return groups[0];
		}
		// console.debug('final return uncomment should not happen', match);
		return match;
	});
}

/**
 * Adds comments
 */
function commentText(text: string, pattern: CommentPatterns): string {
	return pattern.addComment(text);
}
