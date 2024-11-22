#!/bin/bash

# disable this for now, we do not need for local development
# pnpx kill-port 8022 # turso-db for apps/authapi-hono
# kill $(lsof -t -i:8022) # apps/authapi-hono
# echo "Killed turso-db for apps/authapi-hono"

kill $(lsof -t -i:7022) # drizzle-kit studio for apps/authapi-hono
echo "Killed drizzle-kit studio for apps/authapi-hono"