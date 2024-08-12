import { Schema } from "prosemirror-model";
import {bold} from './marks/bold'
import {underline} from './marks/underline'
import {italic} from './marks/italic'

export const schema = new Schema({
  nodes: {
    doc: {
      content: "paragraph+",
      toDOM(node) { return ["div", 0] }
    },
    paragraph: {
      content: "text*",
      toDOM(node) { return ["p", 0] }
    },
    text: { inline: true },
  },
  marks: {
    bold,
    underline,
    italic,
  },
})
