import React, { memo, useEffect, useState } from 'react';
import { ProseMirror, schema, plugins } from '../../../utils/prosemirror';

import './editor.css'
import 'prosemirror-view/style/prosemirror.css';

export const Editor = memo(function Editor() {
  const [pm, setPm] = useState<ProseMirror | null>(null)

  // Initialize ProseMirror editor after first render
  useEffect(() => {
    // Initialize ProseMirror editor
    setPm(new ProseMirror({ schema, plugins }))

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
