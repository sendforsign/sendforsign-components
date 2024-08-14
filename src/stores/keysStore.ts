import { create } from "zustand";
import { createSelectors } from "../utils/createSelectors";

type State = {
  apiKey: string | null;
  contractKey: string | null;
  clientKey: string | null;
  userKey: string | null;
  token: string | null;
};

type Actions = {
  // Actions
  setKeys: (keys: Partial<State>) => void;
  // Helpers
  flush: () => void;
};

const initialState: State = {
  apiKey: null,
  contractKey: null,
  clientKey: null,
  userKey: null,
  token: null,
}

export const useKeysStoreBase = create<State & Actions>()((set, get) => ({
  // State
  ...initialState,

  // Actions
  setKeys: (keys: Partial<State>) => {
    set({
      apiKey: keys.apiKey ?? get().apiKey,
      contractKey: keys.contractKey ?? get().contractKey,
      clientKey: keys.clientKey ?? get().clientKey,
      userKey: keys.userKey ?? get().userKey,
      token: keys.token ?? get().token,
    });
  },

  // Helpers
  flush: () => {
    set(initialState);
  },
}))

export const useKeysStore = createSelectors(useKeysStoreBase);
