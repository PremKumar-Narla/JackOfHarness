"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface MemoryItem {
  id: string;
  content: string;
  is_active: boolean;
  source_conversation_id: string | null;
  created_at: string;
}

export default function MemoryEditor() {
  const qc = useQueryClient();
  const [newItem, setNewItem] = useState("");

  const { data: items } = useQuery<MemoryItem[]>({
    queryKey: ["memory"],
    queryFn: () => apiFetch("/api/memory"),
  });

  const create = useMutation({
    mutationFn: () => apiFetch("/api/memory", { method: "POST", body: JSON.stringify({ content: newItem }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memory"] }); setNewItem(""); },
  });

  const update = useMutation({
    mutationFn: ({ id, ...body }: { id: string; content?: string; is_active?: boolean }) =>
      apiFetch(`/api/memory/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memory"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/memory/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memory"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newItem.trim() && create.mutate()}
          placeholder="Add a memory (e.g. I prefer Python code examples)…"
          className="flex-1 bg-panel border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
        />
        <button
          onClick={() => create.mutate()}
          disabled={!newItem.trim() || create.isPending}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-sm flex items-center gap-1.5 transition"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {items && items.length === 0 && (
        <p className="text-sm text-muted text-center py-8">No memory items yet. Add some above.</p>
      )}

      <div className="space-y-2">
        {items?.map((item) => (
          <MemoryRow key={item.id} item={item} onToggle={() => update.mutate({ id: item.id, is_active: !item.is_active })} onDelete={() => remove.mutate(item.id)} />
        ))}
      </div>
    </div>
  );
}

function MemoryRow({ item, onToggle, onDelete }: { item: MemoryItem; onToggle: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.content);
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: () => apiFetch(`/api/memory/${item.id}`, { method: "PATCH", body: JSON.stringify({ content: val }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memory"] }); setEditing(false); },
  });

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${item.is_active ? "border-border bg-panel" : "border-border/50 bg-panel/50 opacity-60"}`}>
      <button onClick={onToggle} className="mt-0.5 shrink-0 text-muted hover:text-violet-400 transition">
        {item.is_active ? <ToggleRight size={18} className="text-violet-400" /> : <ToggleLeft size={18} />}
      </button>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => update.mutate()}
            onKeyDown={(e) => e.key === "Enter" && update.mutate()}
            className="w-full bg-surface border border-border rounded px-2 py-1 text-sm outline-none focus:border-violet-500"
          />
        ) : (
          <p className="text-sm cursor-pointer hover:text-violet-300" onDoubleClick={() => setEditing(true)}>
            {item.content}
          </p>
        )}
      </div>
      <button onClick={onDelete} className="shrink-0 text-muted hover:text-red-400 transition mt-0.5">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
