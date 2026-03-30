import { create } from "zustand";
import { Id } from "../../../../convex/_generated/dataModel";

type SelectedContext = {
  spaceId: Id<"spaces"> | null;
  spaceName: string | null;
  listId: Id<"lists"> | null;
  listName: string | null;
};

type AskAIStore = {
  isOpen: boolean;
  recentThreadsOpen: boolean;
  currentThreadId: string | null;
  selectedContext: SelectedContext;
  open: () => void;
  close: () => void;
  toggle: () => void;
  openRecentThreads: () => void;
  closeRecentThreads: () => void;
  toggleRecentThreads: () => void;
  setThreadId: (threadId: string | null) => void;
  selectSpace: (spaceId: Id<"spaces">, spaceName: string) => void;
  selectList: (
    spaceId: Id<"spaces">,
    spaceName: string,
    listId: Id<"lists">,
    listName: string,
  ) => void;
  clearContext: () => void;
};

const emptyContext: SelectedContext = {
  spaceId: null,
  spaceName: null,
  listId: null,
  listName: null,
};

export const useAskAIStore = create<AskAIStore>((set) => ({
  isOpen: false,
  recentThreadsOpen: false,
  currentThreadId: null,
  selectedContext: emptyContext,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  openRecentThreads: () => set({ recentThreadsOpen: true }),
  closeRecentThreads: () => set({ recentThreadsOpen: false }),
  toggleRecentThreads: () =>
    set((state) => ({ recentThreadsOpen: !state.recentThreadsOpen })),

  setThreadId: (threadId) => set({ currentThreadId: threadId }),
  selectSpace: (spaceId, spaceName) =>
    set({
      selectedContext: { spaceId, spaceName, listId: null, listName: null },
    }),

  selectList: (spaceId, spaceName, listId, listName) =>
    set({ selectedContext: { spaceId, spaceName, listId, listName } }),
  clearContext: () => set({ selectedContext: emptyContext }),
}));
