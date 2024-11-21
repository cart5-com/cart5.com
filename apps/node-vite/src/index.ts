import { Hono } from 'hono'
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
const app = new Hono()

console.log("import.meta.env.VITE_HELLO")
console.log(import.meta.env.VITE_HELLO)

console.log("import.meta.env.SAMPLE_ENV_VAR")
console.log(import.meta.env.SAMPLE_ENV_VAR)

console.log("import.meta.env.PRIVATE_HELLO")
console.log(import.meta.env.PRIVATE_HELLO)

console.log("process.env.PRIVATE_HELLO")
console.log(process.env.PRIVATE_HELLO)

console.log("process.env.SAMPLE_ENV_VAR")
console.log(process.env.SAMPLE_ENV_VAR)

app.get('/', (c) => {
  return c.text(`

import.meta.env.PROD:${import.meta.env.PROD}

import.meta.env.VITE_HELLO:${import.meta.env.VITE_HELLO}

import.meta.env.PRIVATE_HELLO:${import.meta.env.PRIVATE_HELLO}

import.meta.env.SAMPLE_ENV_VAR:${import.meta.env.SAMPLE_ENV_VAR}

process.env.PROD:${process.env.PROD}

process.env.VITE_HELLO:${process.env.VITE_HELLO}

process.env.PRIVATE_HELLO:${process.env.PRIVATE_HELLO}

process.env.SAMPLE_ENV_VAR:${process.env.SAMPLE_ENV_VAR}

generateKey:${generateKey('hello')}
`)
})

export default app




export const generateKey = (prefix = 'np', size = 24) => {
  return `${prefix}_${generateIdFromEntropySize(size)}`;
}

export function generateIdFromEntropySize(size: number) {
  const buffer = crypto.getRandomValues(new Uint8Array(size));
  return encodeBase32LowerCaseNoPadding(buffer);
}
