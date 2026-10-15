import { create } from "zustand";

import { LanguageCode } from "@/types/learning";

export type ChatEntry = { id: string; role: "user" | "assistant"; content: string };

// Chat history lives in memory only (not persisted): conversations are private
// and are never sent to analytics.
interface ChatState {
  conversations: Partial<Record<LanguageCode, ChatEntry[]>>;
  add: (code: LanguageCode, entry: ChatEntry) => void;
  clear: (code: LanguageCode) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  conversations: {},
  add: (code, entry) =>
    set((s) => ({ conversations: { ...s.conversations, [code]: [...(s.conversations[code] ?? []), entry] } })),
  clear: (code) => set((s) => ({ conversations: { ...s.conversations, [code]: [] } })),
}));
