
import { Editor, Transforms, Range } from 'slate';
import { ReactEditor } from 'slate-react';

const withShortcuts = editor => {
  const { isVoid, insertBreak } = editor;

  editor.insertBreak = () => {
    if (editor.getFragment().type === 'code') {
      return;
    }
    insertBreak();
  };

  editor.isVoid = element => {
    return element.type === 'code' ? true : isVoid(element);
  };

  ReactEditor.focus = editor => {
    if (editor.codeMode) {
      const codeBlock = Editor.above(editor, {
        match: n => n.type === 'code',
      });
      if (codeBlock) {
        const [node, path] = codeBlock;
        Transforms.select(editor, {
          anchor: Editor.start(editor, path),
          focus: Editor.end(editor, path),
        });
      }
    } else {
      ReactEditor.focus(editor);
    }
  };

  const onKeyDown = event => {
    if (event.key === '`' && event.ctrlKey) {
      event.preventDefault();
      editor.codeMode = !editor.codeMode;
      const { selection } = editor;
      const [start] = Range.edges(selection);
      const path = start.path.slice(0, start.path.length - 1);
      const codeBlock = {
        type: 'code',
        children: [{ text: '' }],
      };
      if (editor.codeMode) {
        Transforms.setNodes(editor, { type: 'code' }, { at: selection });
        Transforms.insertNodes(editor, codeBlock, { at: path.concat(0) });
      } else {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: selection });
        Transforms.removeNodes(editor, { at: path.concat(0) });
      }
    }
  };

  return editor;
};

export default withShortcuts;
