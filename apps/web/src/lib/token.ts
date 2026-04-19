export const WEB_TOKEN_KEY = "ondeacho_web_token";

export function getWebToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(WEB_TOKEN_KEY);
}

export function setWebToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    localStorage.setItem(WEB_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(WEB_TOKEN_KEY);
  }
}
