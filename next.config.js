/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // ✅ Prevent ESLint errors from blocking production builds
        ignoreDuringBuilds: true,
    },
    typescript: {
        // ✅ Prevent TypeScript errors from blocking production builds
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
