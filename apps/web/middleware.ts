import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Evita que proxies/CDN sirvam HTML antigo (ex.: login sem o link "Esqueci minha senha") após novo deploy.
 * Inclui `/redefinir-senha` para o mesmo Cache-Control em todas as rotas públicas (link do e-mail com ?token=).
 */
export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "private, no-store, must-revalidate");
  return res;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/esqueci-senha",
    "/redefinir-senha",
    "/conta",
    "/clinicas",
    "/favoritos",
    "/sugerir",
    "/suporte",
    "/clinica/:path*"
  ]
};
