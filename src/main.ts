import { Editor, Plugin } from 'obsidian';
import { CommentManager } from './comment-manager.ts';

export default class AdvancedComments extends Plugin {
	async onload(): Promise<void> {
		this.addCommand({
			id: 'advanced-comments',
			name: 'Line Comments',
			editorCallback: (editor: Editor) => CommentManager.processComments(editor, false),
		});

		this.addCommand({
			id: 'advanced-blockComments',
			name: 'Block Comments',
			editorCallback: (editor: Editor) => CommentManager.processComments(editor, true),
		});

		this.addCommand({
			id: 'trim-end-all-doc',
			name: 'Trim End All Doc',
			editorCallback: (editor: Editor) => CommentManager.trimEndAllDoc(editor),
		});

		this.addCommand({
			id: 'trim-end-code-blocks',
			name: 'Trim End Code Blocks',
			editorCallback: (editor: Editor) => CommentManager.trimEndCodeBlocks(editor),
		});
	}
}