import type { LineStyle, BlockStyle } from './types.ts';

/**
 * Mapping of languages to their comment styles
 */
export const LANGUAGE_MAPPINGS: Record<string, string> = {
	// C-like languages
	c: 'cLike',
	cpp: 'cLike',
	'c++': 'cLike',
	clike: 'cLike',
	cs: 'cLike',
	go: 'cLike',
	java: 'cLike',
	js: 'cLike',
	javascript: 'cLike',
	ts: 'cLike',
	tsx: 'cLike',
	typescript: 'cLike',
	jsx: 'cLike',
	less: 'cLike',
	scss: 'cLike',
	jsonc: 'cLike',
	dataviewjs: 'cLike',
	empty: 'cLike',
	templater: 'cLike',

	// Languages with # comments
	python: 'hash',
	py: 'hash',
	ruby: 'hash',
	rb: 'hash',
	bash: 'hash',
	ps1: 'powershell',
	zsh: 'hash',
	sh: 'hash',
	powershell: 'powershell',
	applescript: 'hash',
	yaml: 'hash',
	yml: 'hash',

	// Specific styles
	lua: 'lua',
	sql: 'lua',
	html: 'html',
	xml: 'html',
	md: 'html',
	css: 'css',
	bat: 'bat'
};

/**
 * Comment patterns organized by comment type and style
 */
export const COMMENT_PATTERNS = {
	line: {
		cLike: {
			uncomment: /^(\s*)\/\/\s?(.+)$/gm,
			addComment: (text: string): string =>
				text.replace(/^(\s*)(\S.*)$/gm, '$1// $2')
		},
		hash: {
			uncomment: /^(\s*)#\s?(.+)$/gm,
			addComment: (text: string): string =>
				text.replace(/^(\s*)(\S.*)$/gm, '$1# $2')
		},
		lua: {
			uncomment: /^(\s*)--\s?(.+)$/gm,
			addComment: (text: string): string =>
				text.replace(/^(\s*)(\S.*)$/gm, '$1-- $2')
		},
		bat: {
			uncomment: /^(\s*)[Rr][Ee][Mm]\s?(.+)$/gm,
			addComment: (text: string): string =>
				text.replace(/^(\s*)(\S.*)$/gm, '$1REM $2')
		},
		powershell: {
			uncomment: /^(\s*)#\s?(.+)$/gm,
			addComment: (text: string): string =>
				text.replace(/^(\s*)(\S.*)$/gm, '$1# $2')
		}
	},
	block: {
		cLike: {
			uncomment: /^\/\*\s(.*)\s\*\/$/s,
			addComment: (text: string): string => text.replace(/^(.+)$/s, '/* $1 */')
		},
		html: {
			uncomment: /^<!--\s(.*)\s-->$/s,
			addComment: (text: string): string => text.replace(/^(.+)$/s, '<!-- $1 -->')
		},
		css: {
			uncomment: /^\/\*\s(.*)\s\*\/$/s,
			addComment: (text: string): string => text.replace(/^(.+)$/s, '/* $1 */')
		},
		powershell: {
			uncomment: /^<#\s(.*)\s#>$/s,
			addComment: (text: string): string => text.replace(/^(.+)$/s, '<# $1 #>')
		}
	}
};

/**
 * Styles that support line comments
 */
export const LINE_STYLES: Record<LineStyle, true> = {
	cLike: true,
	hash: true,
	lua: true,
	bat: true,
	powershell: true
};

/**
 * Styles that support block comments
 */
export const BLOCK_STYLES: Record<BlockStyle, true> = {
	cLike: true,
	html: true,
	css: true,
	powershell: true
};

/**
 * Block detection patterns
 */
export const BLOCK_PATTERNS = {
	codeBlock: /^(`{3,}|~{3,})([a-z0-9-+]*)\n([\s\S]*?)\n(\1)$/gim,
	templateBlock: /^<%\*(.*?)%>$/gms
};

/**
 * Obsidian comment pattern
 */
export const OBSIDIAN_COMMENT_PATTERN = /^%%\s?(.+?)\s?%%$/gms;

/**
 * Code block trimming pattern
 */
export const CODE_BLOCK_TRIM_PATTERN = /^(`{3,}|~{3,})([a-z0-9-+]*)\n([\s\S]*?)\n(\1)$/gm;
