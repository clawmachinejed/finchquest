/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },

  // TEMP for Batch-by-Batch refactor: don't block builds on existing lint errors
  eslint: { ignoreDuringBuilds: true },

  // TEMP: we'll keep typechecking via `npm run typecheck` separately.
  // If you want to also allow Next build to continue on TS errors, set to true.
  // We'll set back to false by Batch F.
  typescript: { ignoreBuildErrors: true },

  serverExternalPackages: ['firebase-admin'],
};
module.exports = nextConfig;
