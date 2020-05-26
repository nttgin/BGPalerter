#!/bin/bash

rm -rf bin
mkdir bin

rm -rf build
mkdir build

npm install

npm run babel . --  --ignore node_modules --out-dir build

cp package.json build/package.json

./node_modules/.bin/pkg ./build/package.json --targets node12-win-x64 --output bin/bgpalerter-win-x64 --loglevel=error

./node_modules/.bin/pkg ./build/package.json --targets node12-linux-x64 --output bin/bgpalerter-linux-x64 --loglevel=error

./node_modules/.bin/pkg ./build/package.json --targets node12-macos-x64 --output bin/bgpalerter-macos-x64 --loglevel=error

echo "--> BGPalerter compiled in bin/ (ignore the warnings about files that cannot be resolved)."

rm -rf build
