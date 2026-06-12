"use client";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/store/chatStore";
import { BASE } from "@/lib/api";

export function useChat(convId: string | null) {
  const queryClient = useQueryClient();
  const { isStreaming, streamBuffer, setStreaming, appendStreamBuffer, clearStreamBuffer } =
    useChatStore();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!convId || isStreaming) return;

      setStreaming(true);
      clearStreamBuffer();

      try {
        const response = await fetch(`${BASE}/api/conversations/${convId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            try {
              const chunk = JSON.parse(line.slice(6));
              if (!chunk.is_final) {
                appendStreamBuffer(chunk.delta);
              } else {
                await queryClient.invalidateQueries({ queryKey: ["messages", convId] });
                await queryClient.invalidateQueries({ queryKey: ["conversations"] });
              }
            } catch {
              // malformed chunk, skip
            }
          }
        }
      } finally {
        setStreaming(false);
        clearStreamBuffer();
      }
    },
    [convId, isStreaming, setStreaming, clearStreamBuffer, appendStreamBuffer, queryClient]
  );

  return { sendMessage, isStreaming, streamBuffer };
}
