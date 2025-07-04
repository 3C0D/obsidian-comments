import { Editor, type EditorPosition } from 'obsidian';
import { getCommentPattern, type CommentPatterns } from './patterns.ts';
import { detectBlockType, adjustSelection } from './utils.ts';

export class CommentManager {
    /**
     * Processes comments (line or block)
     */
    static processComments(editor: Editor, isBlockComment: boolean): void {
        const selection = this.getSelection(editor, isBlockComment);
        if (!selection.text && !isBlockComment) return;

        const blockType = detectBlockType(editor.getValue(), selection.start, selection.end);
        const processedText = this.processText(selection.text, blockType, isBlockComment);

        editor.replaceRange(processedText, selection.from, selection.to);
    }

    /**
     * Removes trailing spaces in the entire document
     */
    static trimEndAllDoc(editor: Editor): void {
        const content = editor.getValue();
        const trimmedContent = content.replace(/[ \t]+$/gm, '');
        editor.setValue(trimmedContent);
    }

    /**
     * Removes trailing spaces only in code blocks
     */
    static trimEndCodeBlocks(editor: Editor): void {
        const content = editor.getValue();
        const processedContent = content.replace(
            /^(`{3,}|~{3,})([a-z0-9-+]*)\n([\s\S]*?)\n(\1)$/gim,
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
    private static getSelection(editor: Editor, isBlockComment: boolean): { text: string; start: number; end: number; from: EditorPosition; to: EditorPosition } {
        let from = editor.getCursor('from');
        let to = editor.getCursor('to');
        let text = editor.getSelection();

        // Adjustment for line comments
        if (!isBlockComment) {
            text = adjustSelection(editor, from, to, text);
            from = editor.getCursor('from');
            to = editor.getCursor('to');
        }

        const start = editor.posToOffset(from);
        const end = editor.posToOffset(to);

        return { text, start, end, from, to };
    }

    /**
     * Processes the text to add/remove comments
     */
    private static processText(text: string, blockType: string | null, isBlockComment: boolean): string {
        // Default Obsidian comments
        if (!blockType) {
            return this.processObsidianComment(text);
        }

        const pattern = getCommentPattern(blockType, isBlockComment);
        if (!pattern) return text;

        return pattern.uncomment.test(text)
            ? this.uncommentText(text, pattern)
            : this.commentText(text, pattern);
    }

    /**
     * Processes Obsidian comments (%% %%)
     */
    private static processObsidianComment(text: string): string {
        const pattern = /^%%\s?(.+?)\s?%%$/gms;
        if (pattern.test(text)) {
            return text.replace(pattern, '$1');
        }
        return text.replace(/^(.+)$/gms, '%% $1 %%');
    }

    /**
     * Removes comments
     */
    private static uncommentText(text: string, pattern: CommentPatterns): string {
        pattern.uncomment.lastIndex = 0;
        return text.replace(pattern.uncomment, (match, ...groups) => {
            if (groups.length >= 2 && groups[1]) { // indentation handling
                // console.debug('uncomment line comments', match);
                return groups[0] + groups[1];
            } else if (groups.length >= 2 && !groups[1]) { // block comments
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
    private static commentText(text: string, pattern: CommentPatterns): string {
        return pattern.addComment(text);
    }
}