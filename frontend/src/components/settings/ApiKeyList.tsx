"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Trash2, Eye, EyeOff } from "lucide-react";

const PROVIDERS = [
  { id: "anthropic", label: "Anthropic" },
  { id: "openai", label: "OpenAI" },
  { id: "gemini", label: "Google Gemini" },
  { id: "groq", label: "Groq" },
];

interface ApiKey {
  provider: string;
  label: string | null;
  created_at: string;
}

export default function ApiKeyList() {
  const qc = useQueryClient();
  const { data: keys } = useQuery<ApiKey[]>({
    queryKey: ["api-keys"],
    queryFn: () => apiFetch("/api/keys"),
  });
  const deleteKey = useMutation({
    mutationFn: (provider: string) => apiFetch(`/api/keys/${provider}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  return (
    <div className="space-y-4">
      {PROVIDERS.map((p) => {
        const existing = keys?.find((k) => k.provider === p.id);
        return <ProviderRow key={p.id} provider={p} existing={existing} onDelete={() => deleteKey.mutate(p.id)} />;
      })}
    </div>
  );
}

function ProviderRow({
  provider,
  existing,
  onDelete,
}: {
  provider: { id: string; label: string };
  existing: ApiKey | undefined;
  onDelete: () => void;
}) {
  const qc = useQueryClient();
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const upsert = useMutation({
    mutationFn: () =>
      apiFetch("/api/keys", {
        method: "POST",
        body: JSON.stringify({ provider: provider.id, key_value: value }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      qc.invalidateQueries({ queryKey: ["models"] });
      setValue("");
    },
  });

  return (
    <div className="bg-panel border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">{provider.label}</h3>
        {existing && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Configured
            <button onClick={onDelete} className="text-muted hover:text-red-400 ml-2">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={existing ? "Update API key…" : "Enter API key…"}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500 pr-9"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-white"
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button
          onClick={() => upsert.mutate()}
          disabled={!value || upsert.isPending}
          className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-sm transition"
        >
          Save
        </button>
      </div>
    </div>
  );
}
