import { Schema } from "prosemirror-model";
import { bold } from './marks/bold'
import { underline } from './marks/underline'
import { italic } from './marks/italic'
import {  bulletList, orderedList, listItem  } from "prosemirror-schema-list";

export const schema = new Schema({
  nodes: {
    doc: {
      content: "paragraph+ block*",
      toDOM(node) { return ["div", 0] }
    },
    paragraph: {
      group: "block",
      content: "text*",
      toDOM(node) { return ["p", 0] }
    },
    bullet_list: {...bulletList, content: 'list_item+', group: 'block'},
    ordered_list: {...orderedList, content: 'list_item+', group: 'block'},
    list_item: {...listItem, content: 'paragraph block*' },
    text: { inline: true },
  },
  marks: {
    bold,
    underline,
    italic,
  },
})
