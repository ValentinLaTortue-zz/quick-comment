'use babel';

import QuickCommentView from './quick-comment-view';
import { CompositeDisposable } from 'atom';

export default {

  quickCommentView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.quickCommentView = new QuickCommentView(state.quickCommentViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.quickCommentView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'quick-comment:toggleComment': () => this.toggleComment()
    }));
    thios.subscriptions.add(atom.commands.add('atom-workspace', {
      'quick-comment:addBrackets' : () => this.addBrackets()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.quickCommentView.destroy();
  },

  serialize() {
    return {
      quickCommentViewState: this.quickCommentView.serialize()
    };
  },


//Package functions below
  toggleComment() {
      let editor
      let openComment
      let closeComment
      if (editor = atom.workspace.getActiveTextEditor()) {
          if (editor.getGrammar().name == "HTML") {
              openComment = "<!--"
              closeComment = "-->"
          } else {
              openComment = "/*"
              closeComment = "*/"
          }
          editor.insertText(openComment)
          let selection
          if (selection = editor.getSelectedText()) {
              if (selection.indexOf(openComment) > -1 && selection.indexOf(closeComment) > -1) {
                  let uncommented = selection.replace(openComment, "").replace(closeComment, "")
                  editor.insertText(uncommented)
              } else {
                  let commented = openComment.concat(selection, closeComment)
                  editor.insertText(commented)
              }
          }
      }
  },

  addBrackets() {
      let editor
      if (editor = atom.workspace.getActiveTextEditor()) {
          let selection
          if (selection = editor.getSelectedText()) {
              let withBrackets = "{".concat(selection, "\n}")
              editor.insertText(withBrackets)
          }
      }
  }

};
