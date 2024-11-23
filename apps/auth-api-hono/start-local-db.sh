# disable this for now, we do not need for local development
# mkdir -p turso-db && turso dev --port 8022 --db-file ./turso-db/turso-db.db & 
# echo "Started turso-db for apps/auth-api-hono"


drizzle-kit studio --port=7022 --config=./drizzle.config.ts &
echo "Started drizzle-kit studio for apps/auth-api-hono"