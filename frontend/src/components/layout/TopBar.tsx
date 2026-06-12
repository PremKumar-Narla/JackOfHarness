"use client";
import { BrainCircuit } from "lucide-react";
import ModelSelector from "@/components/chat/ModelSelector";
import { useUpdateConversation } from "@/hooks/useConversations";
import { useChatStore } from "@/store/chatStore";

interface Props {
  convId?: string;
  useMemory?: boolean;
}

export default function TopBar({ convId, useMemory }: Props) {
  const updateConv = useUpdateConversation();
  const { isStreaming } = useChatStore();

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-panel shrink-0">
      <ModelSelector convId={convId} />
      {convId && (
        <button
          onClick={() => updateConv.mutate({ id: convId, use_memory: !useMemory })}
          disabled={isStreaming}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition ${
            useMemory ? "bg-violet-600/20 text-violet-300 border border-violet-600/30" : "bg-white/5 text-muted border border-border"
          }`}
        >
          <BrainCircuit size={14} />
          Memory {useMemory ? "On" : "Off"}
        </button>
      )}
    </header>
  );
}
