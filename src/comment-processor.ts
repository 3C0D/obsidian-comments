import { LANGUAGE_MAPPINGS } from './comment-config.ts';
import { getCommentPattern } from './regex-patterns.ts';

export class CommentProcessor {
	/**
	 * Processes text to add or remove comments
	 */
	static processComment(
		text: string,
		language: string | null,
		isBlockComment: boolean
	): string {
		// For Obsidian block comments (default case)
		if (!language) {
			return this.processObsidianComment(text);
		}

		// Determines the comment style to use
		const styleKey = this.getStyleKey(language, isBlockComment);
		if (!styleKey) {
			return text; // No style found, return unchanged text
		}

		const pattern = getCommentPattern(styleKey, isBlockComment);
		if (!pattern) {
			return text;
		}

		// Checks if the text is already commented
		if (pattern.isCommented.test(text)) {
			return this.uncommentText(text, pattern);
		} else {
			return this.commentText(text, pattern);
		}
	}

	/**
	 * Determines the appropriate style key
	 */
	private static getStyleKey(language: string, isBlockComment: boolean): string | null {
		const baseStyle = LANGUAGE_MAPPINGS[language.toLowerCase()];

		if (!baseStyle) {
			return null;
		}

		// Special logic for block comments
		if (isBlockComment) {
			switch (baseStyle) {
				case 'cLike':
				case 'css':
					return 'cLike';
				case 'html':
					return 'html';
				default:
					return null; // No block comment for this type
			}
		}

		// For line comments
		switch (baseStyle) {
			case 'cLike':
			case 'templater':
				return 'cLike';
			case 'hash':
				return 'hash';
			case 'lua':
				return 'lua';
			case 'bat':
				return 'bat';
			default:
				return null;
		}
	}

	/**
	 * Processes Obsidian comments (%% %% markers)
	 */
	private static processObsidianComment(text: string): string {
		const pattern = /^%%([^%%]+)%%$/gms;
		if (pattern.test(text)) {
			// Uncomment: remove %% markers and clean up added spaces
			return text.replace(pattern, (match, content) => {
				// Remove a leading and trailing space if present
				return content.replace(/^ /, '').replace(/ $/, '');
			});
		} else {
			return text.replace(/^(.+)$/gms, '%% $1 %%');
		}
	}

	/**
	 * Removes comments from text
	 */
	private static uncommentText(text: string, pattern: any): string {
		// Reset regex before use
		pattern.uncomment.lastIndex = 0;

		return text.replace(pattern.uncomment, (match, ...groups) => {
			// For patterns with capture groups
			if (groups.length >= 2) {
				if (groups[1]) return groups[0] + groups[1]; // Preserve indentation
				return groups[0];
			} else if (groups.length === 1) {
				return groups[0]; // Just the content
			}
			return match;
		});
	}

	/**
	 * Adds comments to text
	 */
	private static commentText(text: string, pattern: any): string {
		return pattern.addComment(text);
	}

	/**
	 * Handles special cases depending on the language type
	 */
	static handleSpecialCases(
		text: string,
		language: string,
		isBlockComment: boolean
	): string | null {
		// Special case for Templater (always line comments)
		if (language === 'templater') {
			const pattern = getCommentPattern('cLike', false);
			if (pattern) {
				if (pattern.isCommented.test(text)) {
					return this.uncommentText(text, pattern);
				} else {
					return this.commentText(text, pattern);
				}
			}
		}

		// Special case for C-like with forced block comments
		const baseStyle = LANGUAGE_MAPPINGS[language.toLowerCase()];
		if (baseStyle === 'cLike' && isBlockComment) {
			const pattern = getCommentPattern('cLike', true);
			if (pattern) {
				if (pattern.isCommented.test(text)) {
					return this.uncommentText(text, pattern);
				} else {
					return this.commentText(text, pattern);
				}
			}
		}

		return null; // No special case
	}
}