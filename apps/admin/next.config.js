/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pasta diferente do padrão `.next`: no Windows o arquivo `.next/trace` costuma dar EPERM
  // (arquivo bloqueado por dev server, indexador ou antivírus). Usar outro distDir evita reaproveitar locks.
  distDir: ".next-build"
};

module.exports = nextConfig;
