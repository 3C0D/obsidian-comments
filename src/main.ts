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
						/^(```|~~~)([a-z0-9-+]+)\n([\s\S]*?)\n(?:```|~~~)$/gim,
						(_match, p0, p1, p2) => {
							return (
								p0 +
								p1 +
								"\n" +
								p2.replace(/[ \t]+$/gm, "") +
								"\n" + p0
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
		const codeBlockRegex = /^(?:```|~~~)([a-z0-9-+]*)\n([\s\S]*?)\n(?:```|~~~)$/gim; //case-insensitive
		const templateBlockRegex = /^<%\*(.*?)%>$/gms;
		const cursorIndex = Math.min(pi, pr);
		let blockMatch;

		while ((blockMatch = codeBlockRegex.exec(value))) {
			// find in what block selection is
			if (
				blockMatch.index <= cursorIndex &&
				blockMatch.index + blockMatch[0].length >=
				cursorIndex + sel.length
			) {
				return blockMatch[1] ? blockMatch[1] : "empty";
			}
		}
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
