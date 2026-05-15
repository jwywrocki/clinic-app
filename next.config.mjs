/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Treat Node.js-only DB packages as server externals (not bundled for server components)
    serverExternalPackages: ['pg', 'pg-connection-string', 'mysql2', 'node-cron'],
    eslint: {
        // Lint only source directories — skip backups/, logs/, public/
        dirs: ['app', 'components', 'hooks', 'lib'],
        // devDependencies (ESLint plugins) may not be installed in production;
        // lint locally / in CI instead of during next build.
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    images: {
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'https', hostname: '**.supabase.co' },
        ],
        unoptimized: true,
    },
    webpack: (config, { isServer, nextRuntime }) => {
        if (!isServer) {
            // Provide empty shims for Node.js built-ins when building client bundles.
            // This prevents `pg` / `mysql2` from crashing the browser bundle even though
            // only the Supabase provider runs in the browser.
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                dns: false,
                child_process: false,
            };
        }
        if (nextRuntime === 'edge') {
            // jose uses CompressionStream/DecompressionStream (JWE compression) which are
            // not available in the Edge Runtime. next-auth only uses JWT (no compression),
            // so it is safe to stub out the deflate module for Edge bundles.
            config.resolve.alias = {
                ...config.resolve.alias,
                'jose/dist/webapi/lib/deflate': false,
            };
        }
        return config;
    },
}

export default nextConfig
