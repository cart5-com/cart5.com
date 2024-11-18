
require("esbuild").build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "dist/index.js",
    format: "esm",
    minify: true,
    sourcemap: true, // Source map generation must be turned on
    plugins: [
        // Put the Sentry esbuild plugin after all other plugins
        // sentryEsbuildPlugin({
        //     authToken: process.env.SENTRY_AUTH_TOKEN,
        //     project: "api-hono",
        // }),
    ],
    // Add the following lines
    external: [
        // 'stream', 'sharp'
        // 'http', 'https', 'zlib', 'util', 'url', 'net'
    ],
    banner: {
        js: `
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
        `,
    },
});