import { getAdminToken } from "../lib/auth";

/** Em `next dev` o browser fala direto com a API na 3000. */
const DEFAULT_API_DEVELOPMENT = "http://127.0.0.1:3000/api/v1";

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/**
 * Base da API (inclui /api/v1).
 * Ordem: NEXT_PUBLIC_API_URL → NEXT_PUBLIC_API_BASE_URL (legado).
 * Em produção sem env: `/api/v1` (mesma origem; next.config.js faz proxy para a API — sem CORS).
 * Override absoluto (ex.: API noutro host): defina NEXT_PUBLIC_API_URL e configure CORS na API.
 */
export function getApiBaseUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_API_URL?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }
  if (process.env.NODE_ENV === "development") {
    return normalizeBaseUrl(DEFAULT_API_DEVELOPMENT);
  }
  return "/api/v1";
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
