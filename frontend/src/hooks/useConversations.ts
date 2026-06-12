"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Conversation {
  id: string;
  title: string;
  provider: string;
  model: string;
  use_memory: boolean;
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => apiFetch("/api/conversations"),
  });
}

export function useConversation(id: string | null) {
  return useQuery<Conversation>({
    queryKey: ["conversations", id],
    queryFn: () => apiFetch(`/api/conversations/${id}`),
    enabled: !!id,
  });
}

export function useMessages(convId: string | null) {
  return useQuery<Message[]>({
    queryKey: ["messages", convId],
    queryFn: () => apiFetch(`/api/conversations/${convId}/messages`),
    enabled: !!convId,
  });
}

export interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  token_count: number | null;
  created_at: string;
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { provider: string; model: string; use_memory: boolean }) =>
      apiFetch<Conversation>("/api/conversations", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useUpdateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; title?: string; use_memory?: boolean; model?: string }) =>
      apiFetch<Conversation>(`/api/conversations/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["conversations", vars.id] });
    },
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/conversations/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}
