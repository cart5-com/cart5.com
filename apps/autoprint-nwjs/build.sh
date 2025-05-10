#!/bin/bash

# Always set main URL in package.json to the expected value
EXPECTED_PROD_MAIN_URL="https://www.cart5.com/orders/autoprint.html"
# Check if main URL in package.json is correct
MAIN_URL=$(grep -o '"main": "[^"]*"' package.json | cut -d'"' -f4)
if [ "$MAIN_URL" != "$EXPECTED_PROD_MAIN_URL" ]; then
# replace the main url in package.json with the expected prod main url
  sed -ie "s|\"main\": \"$MAIN_URL\"|\"main\": \"$EXPECTED_PROD_MAIN_URL\"|g" package.json
  rm-rf package.jsone
fi

rm -rf ./dist
# WINE is required to build the app for windows.
# brew install --cask wine-stable
nwbuild --version 0.99.0 --flavor sdk --platform win --arch x64 --outDir ./dist/win-x64 ./package.json
cd ./dist/win-x64; zip -r autoprint-win-x64.zip *
mv ./autoprint-win-x64.zip ../autoprint-win-x64.zip

cd ../../

# nwbuild --version 0.99.0 --flavor sdk --platform linux --arch x64 --outDir ./dist/linux-x64 ./package.json
# cd ./dist/linux-x64; zip -r autoprint-linux-x64.zip *
# mv ./autoprint-linux-x64.zip ../autoprint-linux-x64.zip

# I will skip this because it was not straightforward.
# Add osx build later if someone needs.
# cd ../../
# nwbuild --version 0.99.0 --flavor sdk --platform osx --arch arm64 --outDir ./dist/osx-arm64 ./package.json
# cd ./dist/osx-arm64; zip -r autoprint-osx-arm64.zip *
# mv ./autoprint-osx-arm64.zip ../autoprint-osx-arm64.zip


# revert the main url in package.json to the dev main url
sed -ie "s|\"main\": \"$EXPECTED_PROD_MAIN_URL\"|\"main\": \"$MAIN_URL\"|g" package.json
rm -rf package.jsone