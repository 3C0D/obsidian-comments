import { Editor, Plugin } from 'obsidian';
import { CommentHelper } from './comment-helper.ts';

export default class AdvancedComments extends Plugin {

	async onload(): Promise<void> {
		this.addCommand({
			id: 'advanced-comments',
			name: 'Line Comments',
			editorCallback: (editor: Editor): void => this.processComments(editor, false),
		});

		this.addCommand({
			id: 'advanced-blockComments',
			name: 'Block Comments',
			editorCallback: (editor: Editor): void => this.processComments(editor, true),
		});

		this.addCommand({
			id: 'trim-end-all-doc',
			name: 'Trim End All Doc',
			editorCallback: (editor: Editor): void => this.trimEndAllDoc(editor),
		});

		this.addCommand({
			id: 'trim-end-code-blocks',
			name: 'Trim End Code Blocks',
			editorCallback: (editor: Editor): void => this.trimEndCodeBlocks(editor),
		});
	}

	/**
	 * Processes comments (line or block)
	 */
	private processComments(editor: Editor, isBlockComment: boolean): void {
		const commentHelper = new CommentHelper(editor, this.app);
		commentHelper.processSelection(isBlockComment);
	}

	/**
	 * Removes trailing spaces at the end of every line in the whole document
	 */
	private trimEndAllDoc(editor: Editor): void {
		const content = editor.getValue();
		const trimmedContent = content.replace(/[ \t]+$/gm, '');
		editor.setValue(trimmedContent);
	}

	/**
	 * Removes trailing spaces only in code blocks
	 */
	private trimEndCodeBlocks(editor: Editor): void {
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
}