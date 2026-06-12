import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChatStore {
  activeConversationId: string | null;
  selectedProvider: string;
  selectedModel: string;
  isStreaming: boolean;
  streamBuffer: string;
  setActiveConversation: (id: string | null) => void;
  setModel: (provider: string, model: string) => void;
  setStreaming: (v: boolean) => void;
  appendStreamBuffer: (delta: string) => void;
  clearStreamBuffer: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      activeConversationId: null,
      selectedProvider: "openai",
      selectedModel: "gpt-4o",
      isStreaming: false,
      streamBuffer: "",

      setActiveConversation: (id) => set({ activeConversationId: id }),
      setModel: (provider, model) => set({ selectedProvider: provider, selectedModel: model }),
      setStreaming: (v) => set({ isStreaming: v }),
      appendStreamBuffer: (delta) => set((s) => ({ streamBuffer: s.streamBuffer + delta })),
      clearStreamBuffer: () => set({ streamBuffer: "" }),
    }),
    {
      name: "joh-chat-store",
      partialize: (s) => ({ selectedProvider: s.selectedProvider, selectedModel: s.selectedModel }),
    }
  )
);
