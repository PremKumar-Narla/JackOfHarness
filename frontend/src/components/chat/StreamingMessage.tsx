"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function StreamingMessage({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1 animate-pulse">
        AI
      </div>
      <div className="max-w-2xl prose prose-invert prose-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
