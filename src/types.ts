export interface CommentPatterns {
	uncomment: RegExp;
	addComment: (text: string) => string;
}

export type LineStyle = 'cLike' | 'hash' | 'lua' | 'bat' | 'powershell';
export type BlockStyle = 'cLike' | 'html' | 'css' | 'powershell';
