import { history, undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { schema } from '../schema';

const toggleMarkBold = toggleMark(schema.marks.bold);
const toggleMarkUnderline = toggleMark(schema.marks.underline);
const toggleMarkItalic = toggleMark(schema.marks.italic);

export const plugins = [
  history(),
  keymap({
    'Mod-z': undo,
    'Shift-Mod-z': redo,
    'Mod-y': redo,
  }),
  keymap({
    'Mod-b': toggleMarkBold,
    'Mod-i': toggleMarkItalic,
    'Mod-u': toggleMarkUnderline,
  }),
  keymap(baseKeymap),
];
