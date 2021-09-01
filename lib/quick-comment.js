'use babel';

import QuickCommentView from './quick-comment-view';
import {
  CompositeDisposable
} from 'atom';

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
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'quick-comment:addBrackets': () => this.addBrackets()
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
    let editor                    // Just for quicker writing
    let openComment               // Open comment (/*)
    let closeComment              // Close Comment (*/)
    var isDisabledMultiline = false   // Var to detect if doesn't support multiline comments (like Python)
    if (editor = atom.workspace.getActiveTextEditor()) {
      switch (editor.getGrammar().name) {
        case "XML":
        case "HTML":
          openComment = "<!--"
          closeComment = "-->"
          break;
        case "GitHub Markdown":
          openComment = "<!--"
          closeComment = "-->"
          break;
        case "Lua":
          openComment = "--[["
          closeComment = "--]]"
          break;
        case "MATLAB":
          openComment = "%{ "
          closeComment = "%}"
          break;
        case "SQL": case "SQL (Rails)": case "SQL (Mustache)": case "MySQL": case "SQLite": case "Transact-SQL": case "ADA":
          var isDisabledMultiline = true;
          openComment = "-- "
          break;
        case "Perl 6":
        case "Raku":
          openComment = "#`{{"
          closeComment = "}}"
        case "Powershell":
          openComment = "<# "
          closeComment = "#>"
        case "Python" :
        case "Ruby" :
        case "R":
          var isDisabledMultiline = true; //add this if the lang doesn't support multiline
          openComment = "# "
          break;
        case "APL":
          var isDisabledMultiline = true;
          openComment = "⍝ "
          break;
        case "Fortran - Fixed Form": case "Fortran - Free Form": case "Fortran - Modern": case "source.fortran.preprocessor": case "Fortran - Punchcard": case "FORTRAN":
          var isDisabledMultiline = true;
          openComment = "!"
          break;
        case "AppleScript":
          openComment = "(*"
          closeComment = "*)"
          break;
        case "VB.NET":
          isDisabledMultiline = true
          openComment = "' "
          break;
        default:
          openComment = "/*"
          closeComment = "*/"
      }

      let selection = editor.getSelectedText();
      if (selection == "") { //if the text selected is empty
        editor.moveToEndOfLine()
        editor.selectToFirstCharacterOfLine()
        selection = editor.getSelectedText() //selects all texts in the line
      }
      if (selection.indexOf(openComment) > -1 && selection.indexOf(closeComment) > -1) { //Detects if it's already been commented
        let uncommented = selection.replace(openComment, "").replace(closeComment, "")
        editor.insertText(uncommented)
      } else if (isDisabledMultiline) { //Some langs like Python doesn't support multiline comments
        let splitText = selection.split("\n");
        if (selection.indexOf(openComment) > -1) { //Same as before but for "Python like"
          let uncommented = [];
          for (var i = 0; i < splitText.length; i++) {
            uncommented[i] = splitText[i].replace(openComment, "")
          }
          let joinedText = uncommented.join("\n")
          editor.insertText(joinedText)
        } else {
          let commented = [];
          for (var i = 0; i < splitText.length; i++) { //This loop adds the comment symbol before each line
            commented[i] = openComment.concat(splitText[i]);
          }
          let joinedText = commented.join("\n")
          editor.insertText(joinedText)
        }
      } else {
        let commented = openComment.concat(selection, closeComment)
        editor.insertText(commented)
      }
    };
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
