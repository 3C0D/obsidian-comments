/**
 * Regex patterns for comment detection and manipulation
 */

export interface CommentPatterns {
	isCommented: RegExp;
	uncomment: RegExp;
	addComment: (text: string) => string;
}

export const REGEX_PATTERNS = {
	// Patterns for line comments
	lineComment: {
		cLike: {
			isCommented: /^(\s*)\/\/\s?(.*)$/gm,
			uncomment: /^(\s*)\/\/\s?(.*)$/gm,
			addComment: (text: string): string => text.replace(/^(\s*)(.*)$/gm, '$1// $2')
		},
		hash: {
			isCommented: /^(\s*)#\s?(.*)$/gm,
			uncomment: /^(\s*)#\s?(.*)$/gm,
			addComment: (text: string): string => text.replace(/^(\s*)(.*)$/gm, '$1# $2')
		},
		lua: {
			isCommented: /^(\s*)--\s?(.*)$/gm,
			uncomment: /^(\s*)--\s?(.*)$/gm,
			addComment: (text: string): string => text.replace(/^(\s*)(.*)$/gm, '$1-- $2')
		},
		bat: {
			isCommented: /^[Rr][Ee][Mm]\s?(.*)$/gm,
			uncomment: /^[Rr][Ee][Mm]\s?(.*)$/gm,
			addComment: (text: string): string => text.replace(/^(.*)$/gm, 'REM $1')
		}
	},

	// Patterns for block comments
	blockComment: {
		cLike: {
			isCommented: /^\/\*\s?(.*)\s?\*\/$/gms,
			uncomment: /^\/\*\s?(.*)\s?\*\/$/gms,
			addComment: (text: string): string => text.replace(/^(.+)$/gms, '/* $1 */')
		},
		html: {
			isCommented: /^<!--\s?(.*)\s?-->$/gms,
			uncomment: /^<!--\s?(.*)\s?-->$/gms,
			addComment: (text: string): string => text.replace(/^(.*)$/gms, '<!-- $1 -->')
		},
		obsidian: {
			isCommented: /^%%(.*)%%$/gms,
			uncomment: /^%%(.*)%%$/gms,
			addComment: (text: string): string => text.replace(/^(.*)$/gms, '%% $1 %%')
		}
	},

	// Patterns for code block detection
	codeBlock: /^(`{3,}|~{3,})([a-z0-9-+]*)\n([\s\S]*?)\n(\1)$/gim,
	templateBlock: /^<%\*(.*?)%>$/gms
};

export function getCommentPattern(
	styleKey: string,
	isBlockComment: boolean
): CommentPatterns | undefined {
	const patterns = isBlockComment
		? REGEX_PATTERNS.blockComment
		: REGEX_PATTERNS.lineComment;

	return patterns[styleKey as keyof typeof patterns] || null;
}