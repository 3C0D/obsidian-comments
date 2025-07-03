import { Editor, MarkdownView } from 'obsidian';
import type { App, EditorPosition } from 'obsidian';

export interface SelectionInfo {
	text: string;
	start: number;
	end: number;
	from: EditorPosition;
	to: EditorPosition;
}

export class SelectionManager {
	constructor(private editor: Editor, private app: App) {}

	/**
	 * Gets the current selection information
	 */
	getSelectionInfo(isBlockComment: boolean): SelectionInfo {
		let from = this.editor.getCursor('from');
		let to = this.editor.getCursor('to');
		let text = this.editor.getSelection();

		// Special handling for line comments
		if (!isBlockComment) {
			text = this.adjustLineSelection(from, to, text);

			// Recalculate positions after adjustment
			from = this.editor.getCursor('from');
			to = this.editor.getCursor('to');
		}

		const start = this.editor.posToOffset(from);
		const end = this.editor.posToOffset(to);

		return { text, start, end, from, to };
	}

	/**
	 * Adjusts the selection for line comments
	 */
	private adjustLineSelection(
		from: EditorPosition,
		to: EditorPosition,
		currentText: string
	): string {
		const start = this.editor.posToOffset(from);
		const end = this.editor.posToOffset(to);

		// If no selection, select the current line
		if (start === end) {
			return this.selectCurrentLine(to);
		}

		// If partial multiline selection, adjust to full lines
		if (this.isPartialMultilineSelection(from, to)) {
			return this.adjustToFullLines(from, to);
		}

		return currentText;
	}

	/**
	 * Selects the current line if no selection
	 */
	private selectCurrentLine(position: EditorPosition): string {
		const line = this.editor.getLine(position.line);

		// Do nothing if the line is empty
		if (line.trim() === '') {
			return '';
		}

		const from = { line: position.line, ch: 0 };
		const to = { line: position.line, ch: line.length };

		this.editor.setSelection(from, to);
		return line;
	}

	/**
	 * Checks if the selection is a partial multiline selection
	 */
	private isPartialMultilineSelection(
		from: EditorPosition,
		to: EditorPosition
	): boolean {
		return from.line !== to.line &&
			(from.ch !== 0 || to.ch !== this.editor.getLine(to.line).length);
	}

	/**
	 * Adjusts the selection to full lines
	 */
	private adjustToFullLines(
		from: EditorPosition,
		to: EditorPosition
	): string {
		// Checks if we are in a code block
		if (this.isInCodeBlock(from, to)) {
			const newFrom = { line: from.line, ch: 0 };
			const newTo = { line: to.line, ch: this.editor.getLine(to.line).length };

			this.editor.setSelection(newFrom, newTo);
			return this.editor.getSelection();
		}

		return this.editor.getSelection();
	}

	/**
	 * Checks if the selection is in a code block
	 */
	private isInCodeBlock(from: EditorPosition, to: EditorPosition): boolean {
		if (!this.app?.workspace) return false;

		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView?.file) return false;

		const cache = this.app.metadataCache.getFileCache(activeView.file);
		if (!cache?.sections) return false;

		return cache.sections.some((section: any) =>
			section.type === 'code' &&
			section.position.start.line < from.line &&
			section.position.end.line > to.line
		);
	}

	/**
	 * Replaces the selected text
	 */
	replaceSelection(newText: string, selectionInfo: SelectionInfo): void {
		this.editor.replaceRange(newText, selectionInfo.from, selectionInfo.to);
	}
}