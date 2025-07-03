export interface CommentStyle {
	lineComment?: string;
	blockStart?: string;
	blockEnd?: string;
}

// export const COMMENT_STYLES: Record<string, CommentStyle> = {
// 	cLike: {
// 		lineComment: '//',
// 		blockStart: '/*',
// 		blockEnd: '*/'
// 	},
// 	hash: {
// 		lineComment: '#'
// 	},
// 	lua: {
// 		lineComment: '--'
// 	},
// 	html: {
// 		blockStart: '<!--',
// 		blockEnd: '-->'
// 	},
// 	css: {
// 		blockStart: '/*',
// 		blockEnd: '*/'
// 	},
// 	templater: {
// 		lineComment: '//'
// 	},
// 	bat: {
// 		lineComment: 'REM'
// 	},
// 	obsidian: {
// 		blockStart: '%%',
// 		blockEnd: '%%'
// 	}
// };

export const LANGUAGE_MAPPINGS: Record<string, string> = {
	// C-like languages
	'c': 'cLike',
	'cpp': 'cLike',
	'c++': 'cLike',
	'clike': 'cLike',
	'cs': 'cLike',
	'go': 'cLike',
	'java': 'cLike',
	'js': 'cLike',
	'javascript': 'cLike',
	'ts': 'cLike',
	'tsx': 'cLike',
	'typescript': 'cLike',
	'jsx': 'cLike',
	'less': 'cLike',
	'scss': 'cLike',
	'jsonc': 'cLike',
	'dataviewjs': 'cLike',
	'empty': 'cLike',

	// Hash-based comments
	'python': 'hash',
	'py': 'hash',
	'ruby': 'hash',
	'rb': 'hash',
	'bash': 'hash',
	'ps1': 'hash',
	'zsh': 'hash',
	'sh': 'hash',
	'applescript': 'hash',
	'yaml': 'hash',
	'yml': 'hash',

	// Lua-style
	'lua': 'lua',
	'sql': 'lua',

	// HTML-style
	'html': 'html',
	'xml': 'html',
	'md': 'html',

	// CSS
	'css': 'css',

	// Templater
	'templater': 'templater',

	// Batch
	'bat': 'bat'
};

// export function getCommentStyle(language: string | null): CommentStyle {
// 	if (!language) {
// 		return COMMENT_STYLES.obsidian;
// 	}

// 	const styleKey = LANGUAGE_MAPPINGS[language.toLowerCase()];
// 	return COMMENT_STYLES[styleKey] || COMMENT_STYLES.obsidian;
// }