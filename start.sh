#!/bin/bash

pm2 reload ./ecosystem.config.cjs --update-env && pm2 save # Claude ai said startOrRestart is better
# pm2 startOrRestart ./ecosystem.config.cjs --update-env && pm2 save

cd apps/proxy-caddy && pnpm prod:cache:purge

cd ../../

ls -la

pwd