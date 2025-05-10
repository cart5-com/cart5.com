nwbuild --version 0.99.0 --flavor normal --platform win --arch x64 --outDir ./dist/win-x64 ./app/package.json
cd ./dist/win-x64; zip -r autoprint-win-x64.zip *
mv ./autoprint-win-x64.zip ../autoprint-win-x64.zip

cd ../../

nwbuild --version 0.99.0 --flavor normal --platform linux --arch x64 --outDir ./dist/linux-x64 ./app/package.json
cd ./dist/linux-x64; zip -r autoprint-linux-x64.zip *
mv ./autoprint-linux-x64.zip ../autoprint-linux-x64.zip

# I will skip this because it was not straightforward.
# Add osx build later if someone needs.
# cd ../../
# nwbuild --version 0.99.0 --flavor normal --platform osx --arch arm64 --outDir ./dist/osx-arm64 ./app/package.json
# cd ./dist/osx-arm64; zip -r autoprint-osx-arm64.zip *
# mv ./autoprint-osx-arm64.zip ../autoprint-osx-arm64.zip
