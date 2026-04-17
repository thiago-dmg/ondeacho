import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_PROTECTED_PATHS, ADMIN_PUBLIC_PATHS } from "./src/lib/admin-routes";
import { ADMIN_TOKEN_COOKIE_NAME } from "./src/lib/auth-constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (ADMIN_PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (!ADMIN_PROTECTED_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/webpack-hmr).*)"]
};
