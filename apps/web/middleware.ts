import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Evita que proxies/CDN sirvam HTML antigo (ex.: login sem o link "Esqueci minha senha") após novo deploy.
 */
export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store, must-revalidate");
  return res;
}

export const config = {
  // Nota: /redefinir-senha fica fora do middleware — Cache-Control vai em next.config.js
  // (evita interacções edge raras com query string e redireccionamentos).
  matcher: [
    "/",
    "/login",
    "/esqueci-senha",
    "/conta",
    "/clinicas",
    "/favoritos",
    "/sugerir",
    "/suporte",
    "/clinica/:path*"
  ]
};
