"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { BookmarkPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Message } from "@/hooks/useConversations";

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();
  const saveMemory = useMutation({
    mutationFn: (content: string) =>
      apiFetch("/api/memory", {
        method: "POST",
        body: JSON.stringify({ content, source_conversation_id: message.conversation_id }),
      }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["memory"] });
    },
  });

  const isUser = message.role === "user";

  return (
    <div className={`group flex gap-3 px-4 py-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
          AI
        </div>
      )}
      <div className={`max-w-2xl ${isUser ? "bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5" : ""}`}>
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {!isUser && (
          <button
            onClick={() => saveMemory.mutate(message.content.slice(0, 300))}
            disabled={saved || saveMemory.isPending}
            className="mt-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-muted hover:text-violet-400 transition"
          >
            <BookmarkPlus size={12} />
            {saved ? "Saved" : "Save to memory"}
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0 mt-1">
          U
        </div>
      )}
    </div>
  );
}
