# Cart5.com Monorepo

This is a monorepo for the Cart5.com

## Features

- ✅ Authentication

## Architecture

- **UI**: Shadcn Vue
- **Auth Frontend**: Vue (SPA)
- **Auth Backend**: Hono (TypeScript)
- **Store Frontend**: Astro (SSR-Node)
- **Database**: SQLite with Drizzle ORM, TURSO for Production
- **Proxy**: Caddy for local development (yes, I do not like dealing with CORS issues)

## Project Structure

```
apps/
├── auth-api-hono/ # Authentication API service
├── auth-frontend-vue/ # Authentication SPA
├── web-store-ssr-astro/# Demo store with SSR
└── proxy-caddy/ # Local development proxy
```

## Prerequisites

- Node.js v20.11+ (recommended: use nvm)
- pnpm v9.9.0+ (`npm install -g pnpm`)
- Caddy v2.8.4+ (macOS: `brew install caddy`)
- Ansible v2.17.4+ (Optional, deploy only) (`brew install ansible && ansible --version`)

## Local Development Setup

1. Configure hosts file:

Add to /etc/hosts

```
127.0.0.1 auth.cart5dev.com
127.0.0.1 sample-store-1.com
127.0.0.1 sample-store-2.com
127.0.0.1 unknown-store.com
```

2. Setup environment:

```
cp .env.example .env
```

3. Install dependencies and start development servers:

```
pnpm install
pnpm dev
```

4. Access the demo store at https://sample-store-1.com
