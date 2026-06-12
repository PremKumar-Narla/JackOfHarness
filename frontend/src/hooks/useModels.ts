"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export function useModels(provider: string | null) {
  return useQuery<string[]>({
    queryKey: ["models", provider],
    queryFn: () => apiFetch(`/api/models/${provider}`),
    enabled: !!provider,
    staleTime: 5 * 60 * 1000,
  });
}
