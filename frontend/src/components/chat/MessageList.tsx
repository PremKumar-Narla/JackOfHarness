"use client";
import { useEffect, useRef } from "react";
import type { Message } from "@/hooks/useConversations";
import MessageBubble from "./MessageBubble";
import StreamingMessage from "./StreamingMessage";

interface Props {
  messages: Message[];
  streamBuffer: string;
  isStreaming: boolean;
}

export default function MessageList({ messages, streamBuffer, isStreaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamBuffer]);

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {isStreaming && <StreamingMessage content={streamBuffer} />}
      <div ref={bottomRef} />
    </div>
  );
}
