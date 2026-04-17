import { getAdminToken } from "../lib/auth";

/** Produção (VPS). Sobrescreva com NEXT_PUBLIC_API_URL em .env.local para dev local. */
const DEFAULT_API_BASE_URL = "http://72.61.35.190:3000/api/v1";

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/**
 * Base da API (inclui /api/v1). Ordem: NEXT_PUBLIC_API_URL → NEXT_PUBLIC_API_BASE_URL (legado) → padrão VPS.
 */
export function getApiBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_API_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return normalizeBaseUrl(fromEnv || DEFAULT_API_BASE_URL);
}

const logRequests = process.env.NEXT_PUBLIC_API_LOG_REQUESTS !== "0";

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const API_BASE_URL = getApiBaseUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${suffix}`;

  if (typeof window !== "undefined" && logRequests) {
    console.log("[OndeAcho Admin API]", (init?.method as string) || "GET", url);
  }

  const token = getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string> | undefined) ?? {})
  };

  if (!init?.skipAuth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Erro HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
