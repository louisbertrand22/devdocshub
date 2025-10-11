/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: { typedRoutes: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};
module.exports = nextConfig;
