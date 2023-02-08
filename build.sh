#!/bin/bash

rm -rf bin
mkdir bin

npm ci --silent

npm run compile

./node_modules/.bin/pkg ./dist/package.json --targets node18-win-x64 --output bin/bgpalerter-win-x64 --loglevel=error

./node_modules/.bin/pkg ./dist/package.json --targets node18-linux-x64 --output bin/bgpalerter-linux-x64 --loglevel=error

./node_modules/.bin/pkg ./dist/package.json --targets node18-macos-x64 --output bin/bgpalerter-macos-x64 --loglevel=error

echo "--> BGPalerter compiled in bin/ (ignore the warnings about files that cannot be resolved)."

rm -rf dist
