import { ADMIN_TOKEN_COOKIE_NAME } from "./auth-constants";

const TOKEN_KEY = ADMIN_TOKEN_COOKIE_NAME;
const COOKIE_NAME = ADMIN_TOKEN_COOKIE_NAME;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function writeCookie(value: string | null): void {
  if (typeof document === "undefined") return;
  if (value) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
  }
}

/** Mantém o cookie alinhado ao localStorage (middleware lê o cookie). */
export function syncAuthCookieFromStorage(): void {
  if (typeof window === "undefined") return;
  const t = window.localStorage.getItem(TOKEN_KEY);
  writeCookie(t);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  writeCookie(token);
}

export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  writeCookie(null);
}
