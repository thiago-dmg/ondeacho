/**
 * No Windows, build em ../../.admin-next-build (relativo a apps/admin = raiz do monorepo),
 * fora da pasta do app — costuma evitar EPERM no trace. Tem de ser relativo: caminho absoluto quebra o cache TS do Next.
 * Linux/macOS: .next-build local. Override: ONDEACHO_ADMIN_DIST_DIR
 */
function getDistDir() {
  if (process.env.ONDEACHO_ADMIN_DIST_DIR) {
    return process.env.ONDEACHO_ADMIN_DIST_DIR;
  }
  if (process.platform === "win32") {
    return "../../.admin-next-build";
  }
  return ".next-build";
}

/** Destino da API no mesmo servidor (Next faz proxy — evita CORS no browser). Build/CI pode sobrescrever. */
const adminApiProxyTarget = (process.env.ADMIN_API_PROXY_TARGET || "http://127.0.0.1:3000").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: getDistDir(),
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${adminApiProxyTarget}/api/v1/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
