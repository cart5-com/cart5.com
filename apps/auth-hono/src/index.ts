import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text(`Hello Hono! SAMPLE_ENV_VAR:${process.env.SAMPLE_ENV_VAR}`)
})

console.log(JSON.stringify("process.env.PORT", null, 2))
console.log(JSON.stringify(process.env.PORT, null, 2))
console.log("JSON.stringify(process.env.SAMPLE_ENV_VAR, null, 2)")
console.log(JSON.stringify(process.env.SAMPLE_ENV_VAR, null, 2))

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
