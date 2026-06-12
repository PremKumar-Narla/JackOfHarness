"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon, Settings, Trash2 } from "lucide-react";
import { useConversations, useDeleteConversation, useCreateConversation } from "@/hooks/useConversations";
import { useChatStore } from "@/store/chatStore";
import { formatRelativeDate } from "@/lib/utils";

export default function Sidebar() {
  const { data: conversations } = useConversations();
  const deleteConv = useDeleteConversation();
  const createConv = useCreateConversation();
  const router = useRouter();
  const { activeConversationId, setActiveConversation, selectedProvider, selectedModel } = useChatStore();

  const handleNew = async () => {
    const conv = await createConv.mutateAsync({
      provider: selectedProvider,
      model: selectedModel,
      use_memory: true,
    });
    setActiveConversation(conv.id);
    router.push(`/chat/${conv.id}`);
  };

  const grouped = (conversations ?? []).reduce<Record<string, typeof conversations>>((acc, c) => {
    const label = formatRelativeDate(c!.updated_at);
    acc[label] = [...(acc[label] ?? []), c];
    return acc;
  }, {});
  const order = ["Today", "Yesterday", "This Week", "Older"];

  return (
    <aside className="w-64 flex flex-col bg-panel border-r border-border shrink-0">
      <div className="p-3">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm"
        >
          <PlusIcon size={16} /> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
        {order.map((label) =>
          grouped[label] ? (
            <div key={label}>
              <p className="text-xs text-muted px-2 mb-1 font-medium">{label}</p>
              {grouped[label]!.map((c) => (
                <div
                  key={c!.id}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer text-sm hover:bg-white/5 ${
                    activeConversationId === c!.id ? "bg-white/10" : ""
                  }`}
                >
                  <Link
                    href={`/chat/${c!.id}`}
                    onClick={() => setActiveConversation(c!.id)}
                    className="flex-1 truncate"
                  >
                    {c!.title}
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteConv.mutate(c!.id);
                      if (activeConversationId === c!.id) {
                        setActiveConversation(null);
                        router.push("/chat");
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : null
        )}
      </div>

      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm transition"
        >
          <Settings size={16} /> Settings
        </Link>
      </div>
    </aside>
  );
}
