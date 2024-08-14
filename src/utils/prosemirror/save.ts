import { Node as ProseMirrorNode } from 'prosemirror-model';
import debouncedCallback from 'debounce';
import { checkContractValue, updateContract } from '../../services';

export const save = debouncedCallback(async (doc: ProseMirrorNode) => {
  const { hasChangeByOthers } = await checkContractValue()
  if (hasChangeByOthers) return;
  await updateContract(doc);
}, 2000)
