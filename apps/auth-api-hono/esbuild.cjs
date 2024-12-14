
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
        // TODO: need to make sure these dependencies are copied to your dist folder. 
        // add a copy step to your build script in package.json: `build && cp -r node_modules/@node-rs dist/`
        '@node-rs/argon2'
    ],
    banner: {
        js: `
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
        `,
    },
});