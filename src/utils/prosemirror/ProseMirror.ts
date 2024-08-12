import { Schema, Node as ProseMirrorNode } from "prosemirror-model";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export class ProseMirror {
  state: EditorState | null;
  view: EditorView | null;

  constructor(config: { doc?: ProseMirrorNode; schema?: Schema; plugins?: Plugin[] }) {

    this.state = EditorState.create(config);
    this.clearDOM();
    const el = document.getElementById('editor-root');
    this.view = new EditorView(el, {
      state: this.state,
      dispatchTransaction: this.dispatchTr,
    });
  }

  dispatchTr = (tr: Transaction) => {
    if (!this.view) {
      return;
    }

    const newState = this.view.state.apply(tr);
    this.view.updateState(newState);
    this.state = newState;
  }

  flush = () => {
    this.clearDOM();

    this.state = null;
    this.view = null;
  }

  private clearDOM() {
    const el = document.getElementById('editor-root');
    if (el?.children.length) {
      el.innerHTML = '';
    }
  }
}
