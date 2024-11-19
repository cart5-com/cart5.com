#!/bin/bash

kill $(lsof -t -i:8022) # apps/auth-hono
# pnpx kill-port 8022 # turso-db for apps/auth-hono
echo "Killed turso-db for apps/auth-hono"
