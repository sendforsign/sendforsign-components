import { Node as ProseMirrorNode } from 'prosemirror-model';
import React, { memo, useEffect, useState } from 'react';
import { ProseMirror, schema, plugins } from '../../../utils';

import './editor.css'
import 'prosemirror-view/style/prosemirror.css';
import { getContract } from '../../../services';

export const Editor = memo(function Editor() {
  const [pm, setPm] = useState<ProseMirror | null>(null)

  // Initialize ProseMirror editor after first render
  useEffect(() => {
    // Get contract and
    // Initialize ProseMirror editor
    getContract().then((contract) => {
      if (
        // No data
        !contract ||
        // Or content is HTML (old version)
        (contract.value as string).startsWith('<')
      ) {
        setPm(new ProseMirror({ plugins, doc: ProseMirrorNode.fromJSON(schema, JSON.parse('{"type":"doc","content":[{"type":"paragraph","content":[]}]}')) }))
        return;
      }
      setPm(new ProseMirror({ plugins, doc: ProseMirrorNode.fromJSON(schema, JSON.parse(contract.value)) }));
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
