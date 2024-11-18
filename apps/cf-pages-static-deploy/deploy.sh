echo GIT_HASH=$(git rev-parse HEAD)
echo "deploying to $CLOUDFLARE_PAGES_TEST_PROJECT_NAME"
mkdir -p ./dist
touch ./dist/index.html
echo "333 hello world GIT_HASH:$GIT_HASH" >> ./dist/index.html
wrangler pages deploy dist --project-name=$CLOUDFLARE_PAGES_TEST_PROJECT_NAME --branch=main --no-bundle