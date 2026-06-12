"use client";
import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import MessageList from "@/components/chat/MessageList";
import ChatInput from "@/components/chat/ChatInput";
import { useMessages, useConversation } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/store/chatStore";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const firstMsg = searchParams.get("first");

  const { data: conv } = useConversation(id);
  const { data: messages = [] } = useMessages(id);
  const { sendMessage, isStreaming, streamBuffer } = useChat(id);
  const { setActiveConversation } = useChatStore();

  useEffect(() => {
    setActiveConversation(id);
  }, [id, setActiveConversation]);

  useEffect(() => {
    if (firstMsg) {
      sendMessage(firstMsg);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [firstMsg]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppShell>
      <TopBar convId={id} useMemory={conv?.use_memory} />
      <MessageList messages={messages} streamBuffer={streamBuffer} isStreaming={isStreaming} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </AppShell>
  );
}
