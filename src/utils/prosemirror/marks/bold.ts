import { MarkSpec } from 'prosemirror-model';

export const bold: MarkSpec = {
  parseDOM: [
    {
      tag: 'b',
      getAttrs: (element: HTMLElement | string) =>
        (element as HTMLElement).style.fontWeight !== 'normal' && null,
    },
    { tag: 'strong' },
    {
      style: 'font-weight',
      getAttrs: (style: HTMLElement | string) =>
        /^(bold(er)?|[5-9]\d{2,})$/.test(style as string) && null,
    },
  ],
  toDOM: () => ['b', 0],
};
