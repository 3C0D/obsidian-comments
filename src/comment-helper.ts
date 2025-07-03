import { App, Editor } from 'obsidian';
import { BlockDetector } from './block-detector.ts';
import { SelectionManager } from './selection-manager.ts';
import { CommentProcessor } from './comment-processor.ts';

export class CommentHelper {
	private selectionManager: SelectionManager;

	constructor(private editor: Editor, private app: App) {
		this.selectionManager = new SelectionManager(editor, this.app);
	}

	/**
	 * Main function to comment/uncomment a selection
	 */
	processSelection(isBlockComment: boolean = false): void {
		// Get selection information
		const selectionInfo = this.selectionManager.getSelectionInfo(isBlockComment);

		// If no text is selected and not a block comment, do nothing
		if (!selectionInfo.text && !isBlockComment) {
			return;
		}

		// Detect block type
		const blockType = BlockDetector.detectBlockType(
			this.editor.getValue(),
			selectionInfo.start,
			selectionInfo.end
		);

		// Process the comment
		const processedText = CommentProcessor.processComment(
			selectionInfo.text,
			blockType,
			isBlockComment
		);

		// Replace the text in the editor
		this.selectionManager.replaceSelection(processedText, selectionInfo);
	}
}