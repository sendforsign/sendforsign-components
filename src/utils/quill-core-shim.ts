// Shim file to re-export required modules from quill-core
// This is needed because @opentiny/fluent-editor expects certain exports from quill/core
// that are actually from quill-delta in newer versions of quill

// Import everything from quill/core
import * as QuillCore from 'quill/core';

// Re-export what we need from quill/core
export const Parchment = QuillCore.Parchment;
export const Range = QuillCore.Range;
export const globalRegistry = (QuillCore as any).globalRegistry;
export const expandConfig = (QuillCore as any).expandConfig;
export const overload = (QuillCore as any).overload;
export default QuillCore.default;

// Re-export Delta-related classes from quill-delta
import Delta from 'quill-delta';
import { Op, OpIterator, AttributeMap } from 'quill-delta';
export { Delta, Op, OpIterator, AttributeMap };

