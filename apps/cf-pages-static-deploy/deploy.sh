GIT_HASH=$(git rev-parse HEAD)
echo "hello world $GIT_HASH" > ./dist/index.html
echo "deploying to $CLOUDFLARE_PAGES_TEST_PROJECT_NAME"
wrangler pages deploy dist --project-name=$CLOUDFLARE_PAGES_TEST_PROJECT_NAME --branch=main --no-bundle