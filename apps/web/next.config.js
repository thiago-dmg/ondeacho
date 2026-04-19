/**
 * Build: no Windows, ../../.web-next-build na raiz do monorepo (evita EPERM no trace).
 * Linux/macOS: .next-build em apps/web. Override: ONDEACHO_WEB_DIST_DIR
 */
function getDistDir() {
  if (process.env.ONDEACHO_WEB_DIST_DIR) {
    return process.env.ONDEACHO_WEB_DIST_DIR;
  }
  if (process.platform === "win32") {
    return "../../.web-next-build";
  }
  return ".next-build";
}

const webApiProxyTarget = (process.env.WEB_API_PROXY_TARGET || "http://127.0.0.1:3000").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: getDistDir(),
  async redirects() {
    return [
      { source: "/Conta", destination: "/conta", permanent: false },
      { source: "/Login", destination: "/login", permanent: false },
      { source: "/Esqueci-senha", destination: "/esqueci-senha", permanent: false },
      { source: "/esqueci-Senha", destination: "/esqueci-senha", permanent: false },
      { source: "/Redefinir-senha", destination: "/redefinir-senha", permanent: false },
      { source: "/redefinir-Senha", destination: "/redefinir-senha", permanent: false }
    ];
  },
  async headers() {
    return [
      {
        source: "/redefinir-senha",
        headers: [{ key: "Cache-Control", value: "private, no-store, must-revalidate" }]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${webApiProxyTarget}/api/v1/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
