import { Editor, Plugin } from "obsidian";
import { commentSelection, getPosToOffset } from "./CommentHelper.js";

export default class AdvancedComments extends Plugin {

	async onload(): Promise<void> {
		this.addCommand({
			id: "advanced-comments",
			name: "Line Comments",
			editorCallback: (editor) => this.advancedComments(editor),
		});
		this.addCommand({
			id: "advanced-blockComments",
			name: "Block Comments",
			editorCallback: (editor) => {
				this.advancedComments(editor, true);
			},
		});

		this.addCommand({
			id: "trim-end-all-doc",
			name: "Trim End All Doc",
			editorCallback: (editor: Editor) => {
				const value = editor.getValue().replace(/[ \t]+$/gm, "");
				editor.setValue(value);
			},
		});

		this.addCommand({
			id: "trim-end-code-blocks",
			name: "Trim End Code Blocks",
			editorCallback: (editor: Editor) => {
				const value = editor
					.getValue()
					.replace(
						/^(`{3,}|~{3,})([a-z0-9-+]*)\n([\s\S]*?)\n(\1)$/gim,
						(_match, delimiter, language, content, _closingDelimiter) => {
							return (
								delimiter +
								language +
								"\n" +
								content.replace(/[ \t]+$/gm, "") +
								"\n" + 
								delimiter
							);
						}
					);
				editor.setValue(value);
			},
		});
	}

	advancedComments = (editor: Editor, blockComment: boolean = false): void => {

		let { selection, value } = this.getSelectionAndValue(editor);
		if (!blockComment && !selection) {
			const curs = editor.getCursor();
			const line = curs.line;
			selection = editor.getLine(line);
			if (selection.trim() === "") return;
		}

		const { pi, pr, sel } = getPosToOffset(editor, selection, blockComment);
		const codeBlockType = this.getBlockType(editor, value, sel, pi, pr);
		commentSelection(editor, sel, codeBlockType, blockComment);
	};

	getSelectionAndValue = (editor: Editor): { selection: string; value: string } => {
		const selection = editor.getSelection();
		const value = editor.getValue();
		return { selection, value };
	};

	getBlockType = (
		_editor: Editor,
		value: string,
		sel: string,
		pi: number,
		pr: number
	): string | null => {
		const codeBlockRegex = /^(`{3,}|~{3,})([a-z0-9-+]*)\n([\s\S]*?)\n(\1)$/gim;
		const templateBlockRegex = /^<%\*(.*?)%>$/gms;
		const cursorIndex = Math.min(pi, pr);
		let blockMatch;

		// Reset regex avant utilisation
		codeBlockRegex.lastIndex = 0;

		while ((blockMatch = codeBlockRegex.exec(value))) {
			// find in what block selection is
			if (
				blockMatch.index <= cursorIndex &&
				blockMatch.index + blockMatch[0].length >=
				cursorIndex + sel.length
			) {
				return blockMatch[2] ? blockMatch[2] : "empty";
			}
		}

		// Reset regex pour les templates
		templateBlockRegex.lastIndex = 0;

		while ((blockMatch = templateBlockRegex.exec(value))) {
			// find in what block selection is
			if (
				blockMatch.index <= cursorIndex &&
				blockMatch.index + blockMatch[0].length >=
				cursorIndex + sel.length
			) {
				return "templater";
			}
		}
		return null;
	};
}