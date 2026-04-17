/**
 * Evita open redirect: apenas caminhos relativos internos.
 */
export function getSafeInternalPath(next: string | undefined | null, fallback = "/dashboard"): string {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}
