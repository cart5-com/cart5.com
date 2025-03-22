# Cart5.com Monorepo ( 🚧 WIP 🚧 )

This is a monorepo for the Cart5.com
Currently in development.

## Why?

Cart5.com is a web store generator for restaurants that eliminates expensive middleman fees.

The Problem:
When you order food through delivery apps:

- Restaurants lose 20-30% of each order to commission fees
- They have to raise their menu prices to make up for these fees
- You end up paying more for your food.
- These platforms often force restaurants to keep the same prices everywhere,
  preventing them from offering better deals directly to customers.
- You end up paying more for your food even when dining at the restaurant.

Our Solution:

- Restaurants pay zero commission
- Customers pay only a small 1-2% service fee
- Full price transparency for everyone

## Features

- ✅ Cross-domain Authentication

## Architecture

- **UI**: Shadcn Vue
- **Auth Frontend**: Vue (SPA)
- **Auth Backend**: Hono (TypeScript)
- **Dashboard Frontend**: Vue (SPA)
- **Store Frontend**: Astro (SSR-Node)
- **Database**: SQLite with Drizzle ORM, TURSO for Production
- **Optionel Proxy**: Caddy for local development (yes, I do not like dealing with CORS issues)

## Project Structure

```
apps/
├── api-hono/ # Authentication and other APIs
├── auth-frontend-vue/ # Authentication SPA
├── dashboard-spa-vue/ # Dashboard SPA
├── web-store-ssr-astro/# Demo store with SSR
└── proxy-caddy/ # Local development proxy (optional)
```

## Prerequisites

- Node.js v20.11+ (recommended: use nvm)
- pnpm v9.9.0+ (`npm install -g pnpm`)
- Caddy v2.8.4+ (Optional, macOS: `brew install caddy` to use `pnpm dev:caddy`)
- Ansible v2.17.4+ (Optional, deploy only) (`brew install ansible && ansible --version`)

## Local Development Setup

1. Install dependencies and start development servers:

```
pnpm install
pnpm dev
```

2. Access the demo store at http://localhost:3002

## Optional: Caddy for Local Development Setup

`pnpm dev:caddy`

Configure hosts file:
Add to /etc/hosts

```
# Cart5.com
127.0.0.1 cart5dev.com
127.0.0.1 auth.cart5dev.com
127.0.0.1 www.cart5dev.com

# partner obite
127.0.0.1 obite.cart5dev.com
127.0.0.1 obite.com
127.0.0.1 obite.co.uk
127.0.0.1 www.obite.com
127.0.0.1 www.obite.co.uk

# restaurant by obite
127.0.0.1 flames.obite.com
127.0.0.1 flames.obite.co.uk
127.0.0.1 flames.com
127.0.0.1 www.flames.com

# partner secondpartner
127.0.0.1 secondpartner.cart5dev.com
127.0.0.1 secondpartner.com
127.0.0.1 www.secondpartner.com

# restaurant by secondpartner
127.0.0.1 pubo-restaurant.secondpartner.com
127.0.0.1 pubo-restaurant.com
127.0.0.1 www.pubo-restaurant.com
```

## [TODOS]

- [ ] TODO: add sentry
