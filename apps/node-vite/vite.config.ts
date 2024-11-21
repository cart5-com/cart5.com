import build from '@hono/vite-build/node'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/node'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build(),
    devServer({
      adapter,
      entry: './src/index.ts'
    })
  ],
  ssr: {
    external: [
      // '@libsql/client',
      // '@oslojs/crypto',
      // '@oslojs/encoding'
    ]
  }
})
