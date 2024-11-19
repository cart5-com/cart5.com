import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`
    Hello Hono! SAMPLE_ENV_VAR:${process.env.SAMPLE_ENV_VAR}

    PORT:${process.env.PORT}

    NODE_ENV:${process.env.NODE_ENV}

    SAMPLE_NIXPACKS_VAR:${process.env.SAMPLE_NIXPACKS_VAR}
`)
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
