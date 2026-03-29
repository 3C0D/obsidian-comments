import { REGEX_PATTERNS } from './regex-patterns.ts';

export interface BlockInfo {
	type: string | null;
	start: number;
	end: number;
}

export class BlockDetector {
	/**
	 * Detects the type of code block in which the selection is located
	 */
	static detectCodeBlock(
		content: string,
		selectionStart: number,
		selectionEnd: number
	): string | null {
		// Reset regex before use
		REGEX_PATTERNS.codeBlock.lastIndex = 0;

		let match;
		while ((match = REGEX_PATTERNS.codeBlock.exec(content))) {
			const blockStart = match.index;
			const blockEnd = match.index + match[0].length;

			// Checks if the selection is entirely within this block
			if (blockStart <= selectionStart && blockEnd >= selectionEnd) {
				return match[2] || 'empty'; // match[2] is the language type
			}
		}

		return null;
	}

	/**
	 * Detects if the selection is in a Templater block
	 */
	static detectTemplaterBlock(
		content: string,
		selectionStart: number,
		selectionEnd: number
	): boolean {
		// Reset regex before use
		REGEX_PATTERNS.templateBlock.lastIndex = 0;

		let match;
		while ((match = REGEX_PATTERNS.templateBlock.exec(content))) {
			const blockStart = match.index;
			const blockEnd = match.index + match[0].length;

			// Checks if the selection is entirely within this block
			if (blockStart <= selectionStart && blockEnd >= selectionEnd) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Detects the main block type (code or templater)
	 */
	static detectBlockType(
		content: string,
		selectionStart: number,
		selectionEnd: number
	): string | null {
		// First check Templater blocks
		if (this.detectTemplaterBlock(content, selectionStart, selectionEnd)) {
			return 'templater';
		}

		// Then code blocks
		return this.detectCodeBlock(content, selectionStart, selectionEnd);
	}

	/**
	 * Gets detailed information about the block
	 */
	static getBlockInfo(
		content: string,
		selectionStart: number,
		selectionEnd: number
	): BlockInfo {
		const type = this.detectBlockType(content, selectionStart, selectionEnd);

		if (!type) {
			return { type: null, start: -1, end: -1 };
		}

		// For now, just return the type
		// Could be extended to return the exact positions of the block
		return { type, start: selectionStart, end: selectionEnd };
	}
}