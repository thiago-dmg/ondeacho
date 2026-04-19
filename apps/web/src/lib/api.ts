import { getWebToken } from "./token";

const DEFAULT_API_DEVELOPMENT = "http://127.0.0.1:3000/api/v1";

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/**
 * Base da API (inclui /api/v1).
 * Ordem: NEXT_PUBLIC_API_URL → NEXT_PUBLIC_API_BASE_URL.
 * Em produção sem env: `/api/v1` (proxy no next.config.js → API local).
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

async function parseErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) {
    return `Erro HTTP ${response.status}`;
  }
  try {
    const data = JSON.parse(text) as { message?: string | string[] };
    if (typeof data.message === "string") {
      return data.message;
    }
    if (Array.isArray(data.message) && data.message.length > 0) {
      return String(data.message[0]);
    }
  } catch {
    /* ignore */
  }
  return text.slice(0, 200);
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const API_BASE_URL = getApiBaseUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${suffix}`;

  if (typeof window !== "undefined" && logRequests) {
    console.log("[OndeAcho Web API]", (init?.method as string) || "GET", url);
  }

  const token = !init?.skipAuth ? getWebToken() : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string> | undefined) ?? {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers
  });

  if (!response.ok) {
    const msg = await parseErrorMessage(response);
    throw new Error(msg);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
