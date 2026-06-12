"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useModels } from "@/hooks/useModels";
import { useChatStore } from "@/store/chatStore";
import { useUpdateConversation } from "@/hooks/useConversations";

const PROVIDERS = ["anthropic", "openai", "gemini", "groq"];

interface Props {
  convId?: string;
}

export default function ModelSelector({ convId }: Props) {
  const [open, setOpen] = useState(false);
  const { selectedProvider, selectedModel, setModel } = useChatStore();
  const { data: models } = useModels(selectedProvider);
  const updateConv = useUpdateConversation();

  const select = (provider: string, model: string) => {
    setModel(provider, model);
    if (convId) updateConv.mutate({ id: convId, model });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition"
      >
        <span className="text-muted capitalize">{selectedProvider}</span>
        <span>/</span>
        <span>{selectedModel}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-panel border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {PROVIDERS.map((p) => (
            <ProviderGroup
              key={p}
              provider={p}
              activeProvider={selectedProvider}
              activeModel={selectedModel}
              onSelect={select}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderGroup({
  provider,
  activeProvider,
  activeModel,
  onSelect,
}: {
  provider: string;
  activeProvider: string;
  activeModel: string;
  onSelect: (p: string, m: string) => void;
}) {
  const [expanded, setExpanded] = useState(provider === activeProvider);
  const { data: models } = useModels(expanded ? provider : null);

  return (
    <div>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-white/5 capitalize"
      >
        {provider}
        <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && models?.map((m) => (
        <button
          key={m}
          onClick={() => onSelect(provider, m)}
          className={`w-full text-left px-6 py-2 text-sm hover:bg-white/5 transition ${
            activeProvider === provider && activeModel === m ? "text-violet-400" : "text-muted"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
