import { Editor, Plugin } from 'obsidian';
import { processComments, trimEndAllDoc, trimEndCodeBlocks } from './comment-manager.ts';

export default class AdvancedComments extends Plugin {
	async onload(): Promise<void> {
		this.addCommand({
			id: 'advanced-comments',
			name: 'Line Comments',
			editorCallback: (editor: Editor) => processComments(editor, false)
		});

		this.addCommand({
			id: 'advanced-blockComments',
			name: 'Block Comments',
			editorCallback: (editor: Editor) => processComments(editor, true)
		});

		this.addCommand({
			id: 'trim-end-all-doc',
			name: 'Trim End All Doc',
			editorCallback: (editor: Editor) => trimEndAllDoc(editor)
		});

		this.addCommand({
			id: 'trim-end-code-blocks',
			name: 'Trim End Code Blocks',
			editorCallback: (editor: Editor) => trimEndCodeBlocks(editor)
		});
	}
}
