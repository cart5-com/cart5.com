GIT_HASH=$(git rev-parse HEAD)
echo "222 hello world $GIT_HASH" > ./dist/index.html
echo "deploying to $CLOUDFLARE_PAGES_TEST_PROJECT_NAME"
node ./node_modules/wrangler/wrangler-dist/cli.js pages deploy dist --project-name=$CLOUDFLARE_PAGES_TEST_PROJECT_NAME --branch=main --no-bundle