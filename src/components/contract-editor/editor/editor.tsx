import { Node as ProseMirrorNode, DOMParser as ProseMirrorDOMParser } from 'prosemirror-model';
import React, { memo, useEffect, useState } from 'react';
import { ProseMirror, schema, plugins } from '../../../utils';

import './editor.css'
import 'prosemirror-view/style/prosemirror.css';
import { getContract } from '../../../services';

const EMPTY_CONTRACT_STRINGIFIED = '{"type":"doc","content":[{"type":"paragraph","content":[]}]}'
const EMPTY_CONTRACT_JSON = JSON.parse(EMPTY_CONTRACT_STRINGIFIED)

export const Editor = memo(function Editor() {
  const [pm, setPm] = useState<ProseMirror | null>(null)

  // Initialize ProseMirror editor after first render
  useEffect(() => {
    // Get contract and
    // Initialize ProseMirror editor
    getContract().then((contract) => {
      // No data -> create empty contract
      if (!contract) {
        setPm(new ProseMirror({
          plugins,
          doc: ProseMirrorNode.fromJSON(schema, EMPTY_CONTRACT_JSON),
        }))
        return;
      }

      // Got stringified HTML -> try to parse it and create PM doc
      if ((contract.value as string).startsWith('<')) {
        // Create ProseMirror parser (DOM -> DOC)
        const PMparser = new ProseMirrorDOMParser(schema, []);
        // Create built-in DOM parser
        const parser = new DOMParser();
        // Parse contract content from string to DOM
        const dom = parser.parseFromString(contract.value, 'text/html')
        // Parse DOM to ProseMirror DOC
        const doc = PMparser.parse(dom)
        setPm(new ProseMirror({ plugins, doc }))
        return;
      }

      // Got JSON -> create PM doc
      setPm(new ProseMirror({
        plugins,
        doc: ProseMirrorNode.fromJSON(schema, JSON.parse(contract.value)),
      }));
    })

    // Tear down ProseMirror editor before every re-render
    return () => pm?.flush();

    // ProseMirror editor should be initialized only once, because all blocks changes
    // should be done through ProseMirror transactions.
  }, []);

  return (
    <div
      id="editor-root"
      className="editor"
    />
  );
});
