import { history, undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark, } from 'prosemirror-commands';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';

import { schema } from '../schema';

const toggleMarkBold = toggleMark(schema.marks.bold);
const toggleMarkUnderline = toggleMark(schema.marks.underline);
const toggleMarkItalic = toggleMark(schema.marks.italic);

export const plugins = [
  history(),
  // Map default keys to Undo/Redo
  keymap({
    'Mod-z': undo,
    'Shift-Mod-z': redo,
    'Mod-y': redo,
  }),
  // Map default keys to Bold/Italic/Underline
  keymap({
    'Mod-b': toggleMarkBold,
    'Mod-i': toggleMarkItalic,
    'Mod-u': toggleMarkUnderline,
  }),
  // Map default keys to work with list
  keymap({
    "Mod-Shift-8": wrapInList(schema.nodes.bullet_list),
    "Mod-Shift-9": wrapInList(schema.nodes.ordered_list),
    "Enter": splitListItem(schema.nodes.list_item),
    "Tab": sinkListItem(schema.nodes.list_item),
    "Shift-Tab": liftListItem(schema.nodes.list_item)
  }),
  // Map base shortcuts like Enter, Backspace, etc.
  keymap(baseKeymap),
];
