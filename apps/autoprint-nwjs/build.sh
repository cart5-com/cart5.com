nwbuild --version 0.99.0 --flavor normal --platform win --arch x64 --outDir ./dist/win-x64 ./app/package.json
cd ./dist/win-x64; zip -r autoprint-win-x64.zip *
mv ./autoprint-win-x64.zip ../autoprint-win-x64.zip
