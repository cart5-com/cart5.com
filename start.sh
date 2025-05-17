#!/bin/bash

cd apps/api-hono
pm2 reload ./ecosystem.config.cjs --update-env && pm2 save
cd ../../

cd apps/web-astro
pm2 reload ./ecosystem.config.cjs -i 0 --update-env && pm2 save
cd ../../

cd apps/auth-frontend-vue
pm2 reload ./ecosystem.config.cjs --update-env && pm2 save
cd ../../

cd apps/dashboard-spa-vue
pm2 reload ./ecosystem.config.cjs --update-env && pm2 save
cd ../../

cd apps/orders-spa-vue
pm2 reload ./ecosystem.config.cjs --update-env && pm2 save
cd ../../

# pm2 reload ./ecosystem.config.cjs --update-env && pm2 save
# Claude ai said startOrRestart is better
# pm2 startOrRestart ./ecosystem.config.cjs --update-env && pm2 save

cd apps/proxy-caddy && pnpm prod:cache:purge

echo "🟨SOURCE_COMMIT: $SOURCE_COMMIT"