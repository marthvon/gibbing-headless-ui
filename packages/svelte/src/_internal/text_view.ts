import { history, historyKeymap, standardKeymap } from "@codemirror/commands";
import { Annotation, Compartment, EditorState, Prec, Transaction, type Extension } from "@codemirror/state";
import {
  Decoration, EditorView, ViewPlugin, WidgetType, keymap, placeholder, type DecorationSet, type ViewUpdate
} from "@codemirror/view";
import type { Edit, Range } from "./text_format";
import { highlightSource, livePlan, type Segment, type VariableClass } from "./text_highlight";

class Bullet extends WidgetType {
  eq(): boolean {
    return true;
  }

  toDOM(): HTMLElement {
    const dot = document.createElement("span");
    dot.className = "cm-md-bullet";
    dot.textContent = "•";
    return dot;
  }
}

const bullet = Decoration.replace({ widget: new Bullet() });
const hidden = Decoration.replace({});
const external = Annotation.define<boolean>();

function activeLines(view: EditorView): Set<number> {
  const lines = new Set<number>();
  if (!view.hasFocus) return lines;
  const { doc, selection } = view.state;
  for (const range of selection.ranges)
    for (let line = doc.lineAt(range.from).number; line <= doc.lineAt(range.to).number; line++) lines.add(line - 1);
  return lines;
}

function live(variableClass?: VariableClass) {
  return ViewPlugin.fromClass(
    class {
      lines: Segment[][];
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.lines = highlightSource(view.state.doc.toString());
        this.decorations = this.decorate(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged) this.lines = highlightSource(update.state.doc.toString());
        if (update.docChanged || update.selectionSet || update.focusChanged) this.decorations = this.decorate(update.view);
      }

      decorate(view: EditorView): DecorationSet {
        const plan = livePlan(this.lines, activeLines(view), variableClass);
        const { doc } = view.state;
        return Decoration.set(
          [
            ...plan.lines.map(({ line, className }) => Decoration.line({ class: className }).range(doc.line(line + 1).from)),
            ...plan.marks.map(({ from, to, className }) => Decoration.mark({ class: className }).range(from, to)),
            ...plan.hidden.map(({ from, to }) => hidden.range(from, to)),
            ...plan.bullets.map(({ from, to }) => bullet.range(from, to)),
          ],
          true,
        );
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}

/* CodeMirror injects its base theme as unlayered CSS, which beats frontail's @layer components rules, so the
   structural resets live here; line indents read --tw-line-indent so the stylesheet still decides them. */
function frame(rows: number): Extension {
  return EditorView.theme({
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "inherit", lineHeight: "1.5rem" },
    ".cm-content": { padding: "0.5rem 0.75rem", caretColor: "currentColor", minHeight: `${rows * 1.5 + 1}rem` },
    ".cm-line": { padding: "0 0 0 var(--tw-line-indent, 0)" },
  });
}

function editing(on: boolean): Extension {
  return [EditorView.editable.of(on), EditorState.readOnly.of(!on)];
}

export type LiveEditorOptions = {
  doc: string;
  attributes: Record<string, string>;
  rows: number;
  maxLength?: number;
  readOnly?: boolean;
  placeholder?: string;
  variableClass?: VariableClass;
  extensions?: Extension[];
  onchange: (text: string) => void;
  onblur: () => void;
  onkey: (event: KeyboardEvent) => boolean;
};

export class LiveEditor {
  readonly view: EditorView;
  private readonly attributes = new Compartment();
  private readonly editing = new Compartment();

  constructor(parent: HTMLElement, options: LiveEditorOptions) {
    const { maxLength } = options;
    this.view = new EditorView({
      parent,
      state: EditorState.create({
        doc: options.doc,
        extensions: [
          history(),
          Prec.highest(EditorView.domEventHandlers({ keydown: (event) => options.onkey(event) })),
          keymap.of([...standardKeymap, ...historyKeymap]),
          EditorView.lineWrapping,
          frame(options.rows),
          options.placeholder ? placeholder(options.placeholder) : [],
          this.attributes.of(EditorView.contentAttributes.of(options.attributes)),
          this.editing.of(editing(!options.readOnly)),
          EditorState.transactionFilter.of((transaction) => {
            if (maxLength === undefined || !transaction.docChanged) return transaction;
            const grows = transaction.newDoc.length > transaction.startState.doc.length;
            return grows && transaction.newDoc.length > maxLength ? [] : transaction;
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(external)))
              options.onchange(update.state.doc.toString());
            if (update.focusChanged && !update.view.hasFocus) options.onblur();
          }),
          live(options.variableClass),
          options.extensions ?? [],
        ],
      }),
    });
  }

  text(): string {
    return this.view.state.doc.toString();
  }

  selection(): Range {
    const { from, to } = this.view.state.selection.main;
    return { start: from, end: to };
  }

  setText(text: string): void {
    const { doc } = this.view.state;
    if (doc.toString() === text) return;
    this.view.dispatch({
      changes: { from: 0, to: doc.length, insert: text },
      annotations: [external.of(true), Transaction.addToHistory.of(false)],
    });
  }

  setAttributes(attributes: Record<string, string>): void {
    this.view.dispatch({ effects: this.attributes.reconfigure(EditorView.contentAttributes.of(attributes)) });
  }

  setEditable(on: boolean): void {
    this.view.dispatch({ effects: this.editing.reconfigure(editing(on)) });
  }

  apply(edit: Edit): void {
    this.view.dispatch({
      changes: { from: edit.from, to: edit.to, insert: edit.insert },
      selection: { anchor: edit.select.start, head: edit.select.end },
      scrollIntoView: true,
      userEvent: "input.format",
    });
    this.view.focus();
  }

  destroy(): void {
    this.view.destroy();
  }
}
