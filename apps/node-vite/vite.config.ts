import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/node'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [
        build({
            entry: ['src/index.ts',
                // './src/index.tsx',
                // './app/server.ts'
            ],
            output: 'index.js',
            outputDir: './dist',
            external: [],
            minify: true,
            emptyOutDir: false,
            staticPaths: [],
        }),
        devServer({
            adapter,
            entry: './src/index.ts'
        })
    ],
    // envDir: '../../',
    ssr: {
        external: [
            // '@libsql/client',
            // '@oslojs/crypto',
            // '@oslojs/encoding'
        ]
    }
})
