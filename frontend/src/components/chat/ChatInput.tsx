"use client";
import { useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const val = ref.current?.value.trim();
    if (!val) return;
    ref.current!.value = "";
    ref.current!.style.height = "auto";
    onSend(val);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-border bg-panel">
      <div className="flex items-end gap-2 bg-white/5 rounded-2xl px-4 py-3">
        <textarea
          ref={ref}
          rows={1}
          disabled={disabled}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
          }}
          placeholder="Message… (Enter to send, Shift+Enter for new line)"
          className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted max-h-48"
        />
        <button
          onClick={submit}
          disabled={disabled}
          className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
