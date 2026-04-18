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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: getDistDir()
};

module.exports = nextConfig;
