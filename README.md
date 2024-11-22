# cart5.com monorepo

## Requirements for local development

What I used to develop:

- Node.js v20.11 (use nvm to install)
- pnpm v9.9.0 ( npm install -g pnpm )
- caddy v2.8.4 (use brew to install)

## Cancelled Requirements

Not needed for local development:

- Turso CLI v0.97.1 ([docs](https://docs.turso.tech/cli/introduction))

## Hosts file to use https with caddy proxy

```
127.0.0.1 authapi-hono.cart5dev.com
127.0.0.1 auth-astro-ssg.cart5dev.com
127.0.0.1 auth.cart5dev.com
127.0.0.1 store-astro-ssr.cart5dev.com
```
