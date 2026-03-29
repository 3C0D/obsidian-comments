import type { CommentPatterns, LineStyle, BlockStyle } from './types.ts';
import {
	LANGUAGE_MAPPINGS,
	COMMENT_PATTERNS,
	LINE_STYLES,
	BLOCK_STYLES
} from './constants.ts';

/**
 * Gets the appropriate comment pattern
 */
export function getCommentPattern(
	language: string,
	isBlockComment: boolean
): CommentPatterns | null {
	const baseStyle = LANGUAGE_MAPPINGS[language?.toLowerCase()];
	if (!baseStyle) return null;

	if (isBlockComment) {
		const blockStyles = BLOCK_STYLES as Record<string, true>;
		if (blockStyles[baseStyle]) {
			return COMMENT_PATTERNS.block[baseStyle as BlockStyle];
		}
		// Fallback to line styles
		const lineStyles = LINE_STYLES as Record<string, true>;
		if (lineStyles[baseStyle]) {
			return COMMENT_PATTERNS.line[baseStyle as LineStyle];
		}
		return null;
	}

	const lineStyles = LINE_STYLES as Record<string, true>;
	if (lineStyles[baseStyle]) {
		return COMMENT_PATTERNS.line[baseStyle as LineStyle];
	}
	// Fallback to block styles
	const blockStyles = BLOCK_STYLES as Record<string, true>;
	if (blockStyles[baseStyle]) {
		return COMMENT_PATTERNS.block[baseStyle as BlockStyle];
	}
	return null;
}
