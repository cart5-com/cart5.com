
require("esbuild").build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "dist/index.js",
    format: "esm",
    minify: true,
    sourcemap: true,
    plugins: [],
    external: [
        '@node-rs/argon2',
        '@libsql/client',
        '@libsql/linux-x64-gnu'
    ],
    banner: {
        js: `
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
        `,
    },
});

console.log("🟨process.env.SOURCE_COMMIT", process.env.SOURCE_COMMIT)