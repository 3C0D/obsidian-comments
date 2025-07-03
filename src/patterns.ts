export interface CommentPatterns {
    uncomment: RegExp;
    addComment: (text: string) => string;
}

/**
 * Mapping of languages to their comment styles
 */
const LANGUAGE_MAPPINGS: Record<string, string> = {
    // C-like languages
    'c': 'cLike', 'cpp': 'cLike', 'c++': 'cLike', 'clike': 'cLike',
    'cs': 'cLike', 'go': 'cLike', 'java': 'cLike', 'js': 'cLike',
    'javascript': 'cLike', 'ts': 'cLike', 'tsx': 'cLike', 'typescript': 'cLike',
    'jsx': 'cLike', 'less': 'cLike', 'scss': 'cLike', 'jsonc': 'cLike',
    'dataviewjs': 'cLike', 'empty': 'cLike', 'templater': 'cLike',

    // Languages with # comments
    'python': 'hash', 'py': 'hash', 'ruby': 'hash', 'rb': 'hash',
    'bash': 'hash', 'ps1': 'hash', 'zsh': 'hash', 'sh': 'hash',
    'applescript': 'hash', 'yaml': 'hash', 'yml': 'hash',

    // Specific styles
    'lua': 'lua', 'sql': 'lua',
    'html': 'html', 'xml': 'html', 'md': 'html',
    'css': 'css',
    'bat': 'bat'
};

/**
 * Comment patterns
 */
const COMMENT_PATTERNS = {
    lineComment: {
        cLike: {
            uncomment: /^(\s*)\/\/\s?(.+)$/gm,
            addComment: (text: string): string => text.replace(/^(\s*)(\S.*)$/gm, '$1// $2')
        },
        hash: {
            uncomment: /^(\s*)#\s?(.+)$/gm,
            addComment: (text: string): string => text.replace(/^(\s*)(\S.*)$/gm, '$1# $2')
        },
        lua: {
            uncomment: /^(\s*)--\s?(.+)$/gm,
            addComment: (text: string): string => text.replace(/^(\s*)(\S.*)$/gm, '$1-- $2')
        },
        bat: {
            uncomment: /^(\s*)[Rr][Ee][Mm]\s?(.+)$/gm,
            addComment: (text: string): string => text.replace(/^(\s*)(\S.*)$/gm, '$1REM $2')
        }
    },
    blockComment: {
        cLike: {
            uncomment: /^\/\*\s?(.*)\s?\*\/$/gms,
            addComment: (text: string): string => text.replace(/^(.+)$/gms, '/* $1 */')
        },
        html: {
            uncomment: /^<!--\s?(.*)\s?-->$/gms,
            addComment: (text: string): string => text.replace(/^(.*)$/gms, '<!-- $1 -->')
        },
        css: {
            uncomment: /^\/\*\s?(.*)\s?\*\/$/gms,
            addComment: (text: string): string => text.replace(/^(.+)$/gms, '/* $1 */')
        }
    }
};

/**
 * Gets the appropriate comment pattern
 */
export function getCommentPattern(language: string, isBlockComment: boolean): CommentPatterns | null {
    const baseStyle = LANGUAGE_MAPPINGS[language?.toLowerCase()];
    if (!baseStyle) return null;

    const patterns = isBlockComment ? COMMENT_PATTERNS.blockComment : COMMENT_PATTERNS.lineComment;

    // Logic for block comments
    if (isBlockComment) {
        const blockStyles = ['cLike', 'html', 'css'];
        const styleKey = blockStyles.includes(baseStyle) ? baseStyle : null;
        return styleKey ? patterns[styleKey as keyof typeof patterns] : null;
    }

    // Logic for line comments
    const lineStyles = ['cLike', 'hash', 'lua', 'bat'];
    const styleKey = lineStyles.includes(baseStyle) ? baseStyle : null;
    return styleKey ? patterns[styleKey as keyof typeof patterns] : null;
}