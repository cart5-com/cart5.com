#!/bin/bash

pm2 reload ./apps/api-hono/ecosystem.config.cjs --update-env && pm2 save
pm2 reload ./apps/web-astro/ecosystem.config.cjs --update-env && pm2 save

pm2 reload ./apps/auth-frontend-vue/ecosystem.config.cjs --update-env && pm2 save
pm2 reload ./apps/dashboard-spa-vue/ecosystem.config.cjs --update-env && pm2 save
pm2 reload ./apps/orders-spa-vue/ecosystem.config.cjs --update-env && pm2 save

# pm2 reload ./ecosystem.config.cjs --update-env && pm2 save
# Claude ai said startOrRestart is better
# pm2 startOrRestart ./ecosystem.config.cjs --update-env && pm2 save

cd apps/proxy-caddy && pnpm prod:cache:purge

echo "🟨SOURCE_COMMIT: $SOURCE_COMMIT"