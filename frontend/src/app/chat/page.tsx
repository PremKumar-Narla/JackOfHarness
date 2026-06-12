"use client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import ChatInput from "@/components/chat/ChatInput";
import { useCreateConversation } from "@/hooks/useConversations";
import { useChatStore } from "@/store/chatStore";

export default function NewChatPage() {
  const router = useRouter();
  const createConv = useCreateConversation();
  const { selectedProvider, selectedModel, setActiveConversation } = useChatStore();

  const handleSend = async (content: string) => {
    const conv = await createConv.mutateAsync({
      provider: selectedProvider,
      model: selectedModel,
      use_memory: true,
    });
    setActiveConversation(conv.id);
    router.push(`/chat/${conv.id}?first=${encodeURIComponent(content)}`);
  };

  return (
    <AppShell>
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">JackOfHarness</h1>
          <p className="text-muted text-sm">Local AI chat — bring your own keys</p>
        </div>
        <div className="w-full max-w-2xl">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </AppShell>
  );
}
